import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  RotateCw, 
  Clock, 
  AlertCircle
} from 'lucide-react';

interface MonobankRateItem {
  currencyCodeA: number;
  currencyCodeB: number;
  date: number;
  rateBuy?: number;
  rateSell?: number;
  rateCross?: number;
}

interface CurrencyRateDetail {
  buy: number;
  sell: number;
  date: number;
}

interface CurrencyCache {
  timestamp: number; // Date.now()
  fetchDateFormatted: string;
  usdUah: CurrencyRateDetail | null;
  eurUah: CurrencyRateDetail | null;
  eurUsd: CurrencyRateDetail | null;
}

const CACHE_KEY = 'ceilingpro_monobank_rates_v1';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes in milliseconds
const MONOBANK_API_URL = 'https://api.monobank.ua/bank/currency';

// Initial fallback values matching user specification if offline
const DEFAULT_FALLBACK: CurrencyCache = {
  timestamp: 0,
  fetchDateFormatted: 'Кеш очікує оновлення',
  usdUah: { buy: 44.83, sell: 45.2345, date: 1792616473 },
  eurUah: { buy: 50.38, sell: 51.01, date: 1792653373 },
  eurUsd: { buy: 1.116, sell: 1.126, date: 1792669806 },
};

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year}, ${hours}:${minutes}`;
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
      // Fallback
    }
    return DEFAULT_FALLBACK;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  // Calculate remaining time until next permitted request
  const getRemainingCacheMinutes = (): number => {
    if (!cache.timestamp) return 0;
    const elapsed = Date.now() - cache.timestamp;
    const remaining = CACHE_TTL_MS - elapsed;
    return remaining > 0 ? Math.ceil(remaining / 60000) : 0;
  };

  const fetchRates = async (force: boolean = false) => {
    const remainingMins = getRemainingCacheMinutes();

    // Check 30-minute lock: forbid request if cache is still fresh
    if (!force && remainingMins > 0 && cache.usdUah) {
      return;
    }

    if (force && remainingMins > 0) {
      setNoticeMsg(`Дані з кешу актуальні. Наступне оновлення через ${remainingMins} хв.`);
      setTimeout(() => setNoticeMsg(null), 3000);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch(MONOBANK_API_URL, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Ліміт запитів monobank (1 запит на хвилину). Використовуємо кеш.');
        }
        throw new Error(`Помилка отримання курсів: HTTP ${response.status}`);
      }

      const data: MonobankRateItem[] = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Невірний формат відповіді банку');
      }

      // 1. USD / UAH: currencyCodeA: 840, currencyCodeB: 980
      const usdItem = data.find(
        (i) => i.currencyCodeA === 840 && i.currencyCodeB === 980
      );

      // 2. EUR / UAH: currencyCodeA: 978, currencyCodeB: 980
      const eurItem = data.find(
        (i) => i.currencyCodeA === 978 && i.currencyCodeB === 980
      );

      // 3. EUR / USD: currencyCodeA: 978, currencyCodeB: 840
      const eurUsdItem = data.find(
        (i) => i.currencyCodeA === 978 && i.currencyCodeB === 840
      );

      const now = Date.now();
      const updatedCache: CurrencyCache = {
        timestamp: now,
        fetchDateFormatted: formatTimestamp(now),
        usdUah: usdItem
          ? {
              buy: usdItem.rateBuy ?? usdItem.rateCross ?? 0,
              sell: usdItem.rateSell ?? usdItem.rateCross ?? 0,
              date: usdItem.date,
            }
          : cache.usdUah,
        eurUah: eurItem
          ? {
              buy: eurItem.rateBuy ?? eurItem.rateCross ?? 0,
              sell: eurItem.rateSell ?? eurItem.rateCross ?? 0,
              date: eurItem.date,
            }
          : cache.eurUah,
        eurUsd: eurUsdItem
          ? {
              buy: eurUsdItem.rateBuy ?? eurUsdItem.rateCross ?? 0,
              sell: eurUsdItem.rateSell ?? eurUsdItem.rateCross ?? 0,
              date: eurUsdItem.date,
            }
          : cache.eurUsd,
      };

      setCache(updatedCache);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updatedCache));
      setNoticeMsg('Курси валют успішно оновлено з monobank');
      setTimeout(() => setNoticeMsg(null), 3000);
    } catch (err: any) {
      console.warn('Monobank currency fetch error:', err);
      setErrorMsg(err.message || 'Не вдалося оновити курси онлайн. Відображено з кешу.');
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If no cache or cache older than 30 minutes, fetch
    const remainingMins = getRemainingCacheMinutes();
    if (!cache.timestamp || remainingMins === 0) {
      fetchRates(false);
    }
  }, []);

  const remainingMins = getRemainingCacheMinutes();
  const isCacheLocked = remainingMins > 0;

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
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              monobank
            </span>
          </div>
        </div>

        {/* Refresh button with cache lock indicator */}
        <button
          type="button"
          onClick={() => fetchRates(true)}
          disabled={isLoading}
          title={isCacheLocked ? `Кеш дійсний ще ${remainingMins} хв` : 'Оновити курси з monobank'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
            isCacheLocked
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              : 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-100 border border-cyan-200 dark:border-cyan-800'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-600' : ''}`} />
          <span className="hidden xs:inline text-[11px]">
            {isLoading ? 'Запит...' : isCacheLocked ? `${remainingMins} хв` : 'Оновити'}
          </span>
        </button>
      </div>

      {/* Notice & Error badges */}
      {noticeMsg && (
        <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-xs font-medium animate-fadeIn">
          {noticeMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-1.5 animate-fadeIn">
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

      {/* Footer Note: date & time of fetch */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
          <span>Отримано: <strong>{cache.fetchDateFormatted}</strong></span>
        </div>
      </div>
    </div>
  );
};
