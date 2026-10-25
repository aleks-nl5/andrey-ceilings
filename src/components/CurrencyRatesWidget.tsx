import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  RotateCw, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';

interface MonobankRateItem {
  currencyCodeA: number;
  currencyCodeB: number;
  date: number; // Unix timestamp in seconds when Monobank set this rate
  rateBuy?: number;
  rateSell?: number;
  rateCross?: number;
}

interface CurrencyRateDetail {
  buy: number;
  sell: number;
  date: number; // Unix timestamp from Monobank in seconds
}

interface CurrencyCache {
  timestamp: number; // Local Date.now() when our app fetched the data
  fetchDateFormatted: string;
  usdUah: CurrencyRateDetail | null;
  eurUah: CurrencyRateDetail | null;
  eurUsd: CurrencyRateDetail | null;
}

const CACHE_KEY = 'ceilingpro_monobank_rates_v4';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes strict cache interval
const MONOBANK_DIRECT_URL = 'https://api.monobank.ua/bank/currency';
const MONOBANK_PROXY_URL = '/api/monobank';

// Default fallback based on real Monobank rates
const DEFAULT_FALLBACK: CurrencyCache = {
  timestamp: 0,
  fetchDateFormatted: '',
  usdUah: { buy: 45.16, sell: 45.65, date: 1792875673 },
  eurUah: { buy: 50.57, sell: 51.27, date: 1792875673 },
  eurUsd: { buy: 1.116, sell: 1.126, date: 1792875673 },
};

function formatTimestamp(ts: number): string {
  if (!ts) return '—';
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}, ${hours}:${minutes}`;
}

function formatBankDate(unixSeconds?: number): string {
  if (!unixSeconds) return '—';
  const d = new Date(unixSeconds * 1000);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}, ${hours}:${minutes}`;
}

function formatRate(value: number, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '—';
  return value.toLocaleString('uk-UA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export const CurrencyRatesWidget: React.FC = () => {
  const [cache, setCache] = useState<CurrencyCache>(() => {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore
    }
    return DEFAULT_FALLBACK;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<{ text: string; isSuccess?: boolean } | null>(null);
  const [nowTime, setNowTime] = useState<number>(Date.now());

  // Real-time tick every 10 seconds to keep remaining countdown accurate
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const elapsed = nowTime - (cache.timestamp || 0);
  const isLocked = cache.timestamp > 0 && elapsed < CACHE_TTL_MS;
  const remainingMs = Math.max(0, CACHE_TTL_MS - elapsed);
  const remainingMins = Math.ceil(remainingMs / (60 * 1000));

  const fetchRates = async (isManualClick: boolean = false) => {
    const currentNow = Date.now();
    const currentElapsed = currentNow - (cache.timestamp || 0);

    // 30-minute block rule for Monobank
    if (cache.timestamp > 0 && currentElapsed < CACHE_TTL_MS) {
      if (isManualClick) {
        const minsLeft = Math.ceil((CACHE_TTL_MS - currentElapsed) / (60 * 1000));
        setNoticeMsg({
          text: `Дані з кешу актуальні. Наступне оновлення через ${minsLeft} хв.`,
          isSuccess: false,
        });
        setTimeout(() => setNoticeMsg(null), 3500);
      }
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      let data: MonobankRateItem[] | null = null;
      let usedProxy = false;

      // Cache buster timestamp to ensure browser HTTP heuristic cache does not return stale JSON
      const cacheBustQuery = `_t=${Date.now()}`;

      // 1. Try direct call with no-store
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);
        const response = await fetch(`${MONOBANK_DIRECT_URL}?${cacheBustQuery}`, {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.status === 429) {
          throw new Error('Ліміт запитів до Monobank (дозволено 1 раз на хв). Спробуйте трохи пізніше.');
        }

        if (response.ok) {
          data = await response.json();
        }
      } catch (errDirect: any) {
        if (errDirect?.message?.includes('Ліміт запитів')) {
          throw errDirect;
        }
        // Direct request might be blocked by browser extension or CORS, try dev server proxy
      }

      // 2. Fallback to /api/monobank proxy if direct call didn't yield data
      if (!data) {
        const proxyRes = await fetch(`${MONOBANK_PROXY_URL}?${cacheBustQuery}`, {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });

        if (proxyRes.status === 429) {
          throw new Error('Ліміт запитів до Monobank (1 запит на хвилину). Будь ласка, зачекайте.');
        }

        if (!proxyRes.ok) {
          throw new Error(`Monobank API повернув статус: HTTP ${proxyRes.status}`);
        }

        data = await proxyRes.json();
        usedProxy = true;
      }

      if (!Array.isArray(data)) {
        throw new Error('Отримано некоректний формат даних від Monobank.');
      }

      const usdItem = data.find(
        (i) => i.currencyCodeA === 840 && i.currencyCodeB === 980
      );
      const eurItem = data.find(
        (i) => i.currencyCodeA === 978 && i.currencyCodeB === 980
      );
      const eurUsdItem = data.find(
        (i) => i.currencyCodeA === 978 && i.currencyCodeB === 840
      );

      if (!usdItem || !eurItem) {
        throw new Error('Курси USD/EUR не знайдено у відповіді Monobank.');
      }

      const usdBuy = usdItem.rateBuy ?? usdItem.rateCross ?? 0;
      const usdSell = usdItem.rateSell ?? usdItem.rateCross ?? 0;
      const eurBuy = eurItem.rateBuy ?? eurItem.rateCross ?? 0;
      const eurSell = eurItem.rateSell ?? eurItem.rateCross ?? 0;

      const eurUsdBuy = eurUsdItem 
        ? (eurUsdItem.rateBuy ?? eurUsdItem.rateCross ?? 0)
        : Math.round((eurBuy / (usdSell || 1)) * 10000) / 10000;
      const eurUsdSell = eurUsdItem
        ? (eurUsdItem.rateSell ?? eurUsdItem.rateCross ?? 0)
        : Math.round((eurSell / (usdBuy || 1)) * 10000) / 10000;

      // CONTROL CHECK: Compare with bank's `date` timestamp
      const prevBankDate = cache.usdUah?.date || 0;
      const newBankDate = usdItem.date || Math.floor(currentNow / 1000);
      const isBankRateNewer = newBankDate > prevBankDate;
      const bankDateText = formatBankDate(newBankDate);

      const updatedCache: CurrencyCache = {
        timestamp: currentNow,
        fetchDateFormatted: formatTimestamp(currentNow),
        usdUah: { buy: usdBuy, sell: usdSell, date: newBankDate },
        eurUah: { buy: eurBuy, sell: eurSell, date: eurItem.date || newBankDate },
        eurUsd: { buy: eurUsdBuy, sell: eurUsdSell, date: eurUsdItem?.date || newBankDate },
      };

      setCache(updatedCache);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updatedCache));

      let message = '';
      if (isBankRateNewer && prevBankDate > 0) {
        message = `Курс оновлено! Банк оновив ставки (${bankDateText})`;
      } else {
        message = `Дані отримано з Monobank (курс чинний від ${bankDateText})`;
      }

      setNoticeMsg({ text: message, isSuccess: true });
      setTimeout(() => setNoticeMsg(null), 4000);
    } catch (err: any) {
      console.warn('Monobank currency fetch error:', err);
      setErrorMsg(err.message || 'Не вдалося зв’язатися з сервером Monobank. Відображено збережені дані.');
      setTimeout(() => setErrorMsg(null), 4500);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial check on mount: fetch if cache expired or not present
  useEffect(() => {
    const elapsedOnMount = Date.now() - (cache.timestamp || 0);
    if (!cache.timestamp || elapsedOnMount >= CACHE_TTL_MS) {
      fetchRates(false);
    }
  }, []);

  const latestBankDate = cache.usdUah?.date || 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/20 dark:from-amber-500/20 dark:to-amber-600/30 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-none">
              Курси валют
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 tracking-tight">
              monobank
            </span>
          </div>
        </div>

        {/* Refresh button with 30-minute lock status */}
        <button
          type="button"
          onClick={() => fetchRates(true)}
          disabled={isLoading}
          title={
            isLocked 
              ? `Дані з кешу актуальні. Наступне оновлення через ${remainingMins} хв.` 
              : 'Оновити курси валют з Monobank'
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer ${
            isLocked
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              : 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-800'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-600' : ''}`} />
          <span className="text-[11px] font-bold">
            {isLoading 
              ? 'Оновлення...' 
              : isLocked 
                ? `${remainingMins} хв` 
                : 'Оновити'}
          </span>
        </button>
      </div>

      {/* Notice & Error badges */}
      {noticeMsg && (
        <div className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 animate-fadeIn ${
          noticeMsg.isSuccess
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300'
        }`}>
          {noticeMsg.isSuccess ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          )}
          <span>{noticeMsg.text}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Currency Table: Валюта - Купівля - Продаж */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <th className="py-2 px-2">Валюта</th>
              <th className="py-2 px-2 text-right">Купівля</th>
              <th className="py-2 px-2 text-right">Продаж</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {/* 1. USD */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td className="py-2.5 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-sm shrink-0 shadow-2xs">
                    $
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    USD
                  </span>
                </div>
              </td>
              <td className="py-2.5 px-2 text-right font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                {formatRate(cache.usdUah?.buy ?? 0, 2)} ₴
              </td>
              <td className="py-2.5 px-2 text-right font-mono font-bold text-xs text-slate-900 dark:text-white">
                {formatRate(cache.usdUah?.sell ?? 0, 2)} ₴
              </td>
            </tr>

            {/* 2. EUR */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td className="py-2.5 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-sm shrink-0 shadow-2xs">
                    €
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    EUR
                  </span>
                </div>
              </td>
              <td className="py-2.5 px-2 text-right font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                {formatRate(cache.eurUah?.buy ?? 0, 2)} ₴
              </td>
              <td className="py-2.5 px-2 text-right font-mono font-bold text-xs text-slate-900 dark:text-white">
                {formatRate(cache.eurUah?.sell ?? 0, 2)} ₴
              </td>
            </tr>

            {/* 3. EUR / USD */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td className="py-2.5 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-[11px] shrink-0 shadow-2xs">
                    €/$
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    EUR / USD
                  </span>
                </div>
              </td>
              <td className="py-2.5 px-2 text-right font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                {formatRate(cache.eurUsd?.buy ?? 0, 4)} $
              </td>
              <td className="py-2.5 px-2 text-right font-mono font-bold text-xs text-slate-900 dark:text-white">
                {formatRate(cache.eurUsd?.sell ?? 0, 4)} $
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Notes: Control verification with date parameter on a single line */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5" title="Час встановлення курсу Monobank">
          <CalendarCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span>Встановлено: {formatBankDate(latestBankDate)}</span>
        </div>

        <div className="flex items-center gap-1.5" title="Час оновлення даних">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Оновлено: {formatTimestamp(cache.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};
