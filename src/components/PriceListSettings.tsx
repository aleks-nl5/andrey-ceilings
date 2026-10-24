import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  DollarSign, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Save, 
  Shield, 
  Smartphone,
  Globe,
  Coins,
  Copy,
  ExternalLink,
  Package,
  Sun,
  Moon,
  Monitor,
  Palette,
  User,
  Building2,
  Trash2,
  Plus,
  Layers,
  Wrench,
  Lightbulb,
  CreditCard,
  Lock,
  Unlock,
  Fingerprint,
  KeyRound,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { MasterPriceList, MasterProfile, CustomPriceItem, MaterialType, ProfileType } from '../types/database';
import { AppStorage } from '../db/storage';
import { Translations, Locale } from '../i18n/translations';
import { ThemeMode } from '../hooks/useTheme';
import { SecurityStorage, SecuritySettings, isBiometricsAvailable, registerAndVerifyBiometrics } from '../utils/security';
import { PinSetupModal } from './PinSetupModal';
import { SUPPORTED_REGIONS, SUPPORTED_CURRENCIES, CurrencyCode, getRegion } from '../utils/regionSettings';

interface PriceListSettingsProps {
  priceList: MasterPriceList;
  masterProfile?: MasterProfile;
  t: Translations;
  locale: Locale;
  currencySymbol: string;
  theme: ThemeMode;
  regionCode?: string;
  currencyCode?: CurrencyCode;
  onChangeTheme: (theme: ThemeMode) => void;
  onChangeLocale: (locale: Locale) => void;
  onChangeRegion?: (regionCode: string) => void;
  onChangeCurrency?: (currencyCode: CurrencyCode) => void;
  onSavePriceList: (priceList: MasterPriceList) => void;
  onSaveMasterProfile: (profile: MasterProfile) => void;
  onResetData: () => void;
  onLockApp?: () => void;
}

export const PriceListSettings: React.FC<PriceListSettingsProps> = ({
  priceList,
  masterProfile: initialProfile,
  t,
  locale,
  currencySymbol,
  theme,
  regionCode = 'UA',
  currencyCode = 'UAH',
  onChangeTheme,
  onChangeLocale,
  onChangeRegion,
  onChangeCurrency,
  onSavePriceList,
  onResetData,
  onSaveMasterProfile,
  onLockApp,
}) => {
  const [prices, setPrices] = useState<MasterPriceList>(priceList);
  const [profile, setProfile] = useState<MasterProfile>(initialProfile || AppStorage.getMasterProfile());

  const [priceSaveSuccess, setPriceSaveSuccess] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Security & App Lock state
  const [security, setSecurity] = useState<SecuritySettings>(SecurityStorage.getSettings());
  const [isBiometricSupported, setIsBiometricSupported] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);

  useEffect(() => {
    isBiometricsAvailable().then((supported) => {
      setIsBiometricSupported(supported);
    });
  }, []);

  const handleTogglePinSecurity = () => {
    if (!security.enabled) {
      // Opening setup modal if no PIN set yet
      setIsPinModalOpen(true);
    } else {
      // Disable security
      SecurityStorage.disableSecurity();
      setSecurity(SecurityStorage.getSettings());
      setSecurityMessage('Захист паролем вимкнено');
      setTimeout(() => setSecurityMessage(null), 3000);
    }
  };

  const handleToggleBiometrics = async () => {
    if (!security.biometricsEnabled) {
      const ok = await registerAndVerifyBiometrics();
      if (ok) {
        const updated = SecurityStorage.saveSettings({ biometricsEnabled: true });
        setSecurity(updated);
        setSecurityMessage('Біометричний вхід активовано');
      } else {
        setSecurityMessage('Не вдалося активувати біометрію на цьому пристрої');
      }
    } else {
      const updated = SecurityStorage.saveSettings({ biometricsEnabled: false });
      setSecurity(updated);
      setSecurityMessage('Біометричний вхід вимкнено');
    }
    setTimeout(() => setSecurityMessage(null), 3500);
  };

  const handleAutoLockChange = (minutes: number) => {
    const updated = SecurityStorage.saveSettings({ autoLockMinutes: minutes });
    setSecurity(updated);
  };

  // New custom item form state
  const [newItemCategory, setNewItemCategory] = useState<'canvas' | 'profile' | 'work' | 'option'>('canvas');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('м²');
  const [showAddModal, setShowAddModal] = useState(false);

  const handlePriceChange = (category: 'canvasPrices' | 'profilePrices', key: string, val: string) => {
    const num = parseFloat(val) || 0;
    setPrices((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: num,
      },
    }));
  };

  const handleDirectPriceChange = (key: keyof MasterPriceList, val: string) => {
    const num = parseFloat(val) || 0;
    setPrices((prev) => ({
      ...prev,
      [key]: num,
    }));
  };

  const handleSavePrices = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePriceList(prices);
    setPriceSaveSuccess(true);
    setTimeout(() => setPriceSaveSuccess(false), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveMasterProfile(profile);
    AppStorage.saveMasterProfile(profile);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 2500);
  };

  // Add custom item to price list
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const priceNum = parseFloat(newItemPrice) || 0;
    const newItem: CustomPriceItem = {
      id: `custom-${Date.now()}`,
      category: newItemCategory,
      name: newItemName.trim(),
      unit: newItemUnit,
      price: priceNum,
    };

    const nextItems = [...(prices.customItems || []), newItem];
    const updatedPrices = { ...prices, customItems: nextItems };
    setPrices(updatedPrices);
    onSavePriceList(updatedPrices);

    setNewItemName('');
    setNewItemPrice('');
    setShowAddModal(false);
  };

  const handleDeleteCustomItem = (id: string) => {
    const nextItems = (prices.customItems || []).filter((i) => i.id !== id);
    const updatedPrices = { ...prices, customItems: nextItems };
    setPrices(updatedPrices);
    onSavePriceList(updatedPrices);
  };

  const handleDeleteStandardItem = (key: string) => {
    const nextDeleted = [...(prices.deletedStandardKeys || []), key];
    const updatedPrices = { ...prices, deletedStandardKeys: nextDeleted };
    setPrices(updatedPrices);
    onSavePriceList(updatedPrices);
  };

  const handleRestoreStandardItems = () => {
    const updatedPrices = { ...prices, deletedStandardKeys: [] };
    setPrices(updatedPrices);
    onSavePriceList(updatedPrices);
  };

  const handleExportBackup = () => {
    const json = AppStorage.exportFullBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `potolok_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = AppStorage.importFullBackup(content);
      if (success) {
        setImportStatus('Базу даних успішно відновлено!');
        setTimeout(() => {
          setImportStatus(null);
          window.location.reload();
        }, 1500);
      } else {
        setImportStatus('Помилка при імпорті файлу.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>{t.tabSettings}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.priceListTitle}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.priceListSubtitle}</p>
        </div>

        <button
          type="button"
          onClick={handleSavePrices}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-950/20 transition active:scale-95 cursor-pointer"
        >
          {priceSaveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{priceSaveSuccess ? 'Збережено!' : t.savePriceList}</span>
        </button>
      </div>

      {/* 1. MASTER & COMPANY PROFILE CARD (Optional fields, empty ones hidden in PDF) */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Профіль майстра та компанії (для кошторисів)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                💡 Порожні поля автоматично виключаються з шапки та таблиць PDF-кошторису
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-xs font-bold transition shadow-xs shrink-0"
          >
            {profileSaveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{profileSaveSuccess ? 'Збережено!' : 'Зберегти профіль'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Назва компанії / бренду (якщо є)
            </label>
            <input
              type="text"
              value={profile.companyName || ''}
              onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
              placeholder="СтеляПро або ФОП Мельник"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              ПІБ майстра / замірника
            </label>
            <input
              type="text"
              value={profile.masterName || ''}
              onChange={(e) => setProfile({ ...profile, masterName: e.target.value })}
              placeholder="Олександр Мельник"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Контактний телефон
            </label>
            <input
              type="text"
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+380 (67) 123-45-67"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Місто / Робочий регіон
            </label>
            <input
              type="text"
              value={profile.city || ''}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              placeholder="м. Київ та область"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Реквізити для оплати або внесення авансу (IBAN / картка)
            </label>
            <input
              type="text"
              value={profile.bankDetails || ''}
              onChange={(e) => setProfile({ ...profile, bankDetails: e.target.value })}
              placeholder="IBAN: UA123456789012345678901234567 (ПриватБанк або Монобанк)"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Гарантійні зобов'язання та примітки до кошторису
            </label>
            <input
              type="text"
              value={profile.warrantyNotes || ''}
              onChange={(e) => setProfile({ ...profile, warrantyNotes: e.target.value })}
              placeholder="Гарантія на полотна 10 років. Гарантія на монтажні роботи 3 роки."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>
        </div>
      </form>

      {/* 2. THEME, LANGUAGE & REGION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <Palette className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Тема оформлення, мова та регіон</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Theme selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              {t.theme}:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'light', label: t.themeLight, icon: Sun },
                { id: 'dark', label: t.themeDark, icon: Moon },
                { id: 'system', label: t.themeSystem, icon: Monitor },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChangeTheme(item.id as ThemeMode)}
                    className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-100 dark:bg-cyan-950/50 text-cyan-800 dark:text-white font-bold ring-1 ring-cyan-500 shadow-sm'
                        : 'border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span className="text-[11px] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              {t.languageSelect}:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'uk', label: 'Укр', flag: '🇺🇦' },
                { id: 'ru', label: 'Рус', flag: '🇷🇺' },
                { id: 'en', label: 'Eng', flag: '🇬🇧' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => onChangeLocale(lang.id as Locale)}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    locale === lang.id
                      ? 'border-cyan-500 bg-cyan-100 dark:bg-cyan-950/50 text-cyan-800 dark:text-white font-bold ring-1 ring-cyan-500 shadow-sm'
                      : 'border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="text-[11px] font-medium">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Region / Country with auto-updating phone code */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Країна (код тел.):</span>
              </span>
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                {getRegion(regionCode).phoneCode}
              </span>
            </label>
            <div className="space-y-1.5">
              <div className="relative">
                <select
                  value={regionCode}
                  onChange={(e) => onChangeRegion && onChangeRegion(e.target.value)}
                  className="w-full text-xs font-semibold py-2 px-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer pr-7"
                >
                  {SUPPORTED_REGIONS.map((r) => (
                    <option key={r.code} value={r.code} className="dark:bg-slate-900">
                      {r.flag} {r.name} ({r.phoneCode})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Автоматично підставляє код <strong className="text-cyan-700 dark:text-cyan-400">{getRegion(regionCode).phoneCode}</strong> для нових клієнтів.
              </p>
            </div>
          </div>

          {/* Independent Currency Selector (USD / EUR / UAH) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Валюта розрахунків:</span>
              </span>
              <span className="text-[10px] font-black font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                {currencySymbol}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {SUPPORTED_CURRENCIES.map((cur) => {
                const isSelected = currencyCode === cur.code;
                return (
                  <button
                    key={cur.code}
                    type="button"
                    onClick={() => onChangeCurrency && onChangeCurrency(cur.code)}
                    className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 font-bold ring-1 ring-amber-500 shadow-sm'
                        : 'border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base font-black font-mono">{cur.symbol}</span>
                    <span className="text-[10px] font-semibold">{cur.code}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-tight">
              Символ <strong className="text-amber-700 dark:text-amber-400">{currencySymbol}</strong> замінює валюту в додатку та в PDF-кошторисі.
            </p>
          </div>
        </div>
      </div>

      {/* 2.5 SECURITY & APP LOCK (PIN / BIOMETRICS) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${security.enabled ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Безпека та захист додатку
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  security.enabled 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {security.enabled ? 'Захищено' : 'Вимкнено'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Захист бази замовлень, контактів клієнтів та кошторисів PIN-кодом або біометрією
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {security.enabled && onLockApp && (
              <button
                type="button"
                onClick={onLockApp}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                title="Заблокувати зараз"
              >
                <Lock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Заблокувати зараз</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleTogglePinSecurity}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                security.enabled
                  ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              {security.enabled ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{security.enabled ? 'Вимкнути захист' : 'Увімкнути захист'}</span>
            </button>
          </div>
        </div>

        {securityMessage && (
          <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-xs font-medium animate-fadeIn">
            {securityMessage}
          </div>
        )}

        {security.enabled ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            {/* PIN Code settings */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Майстер PIN-код</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Активний (••••)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                4-значний пароль для входу в додаток
              </p>
              <button
                type="button"
                onClick={() => setIsPinModalOpen(true)}
                className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs"
              >
                Змінити PIN-код
              </button>
            </div>

            {/* Biometric login */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Біометрія (Face ID / Відбиток)</span>
                </span>
                <span className={`text-[10px] font-bold ${
                  security.biometricsEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                }`}>
                  {security.biometricsEnabled ? 'Увімкнено' : 'Вимкнено'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isBiometricSupported 
                  ? 'Миттєве розблокування пальцем або обличчям' 
                  : 'Біометрія доступна на смартфонах з Touch ID / сканером відбитка'}
              </p>
              <button
                type="button"
                onClick={handleToggleBiometrics}
                className={`w-full mt-1 py-1.5 px-2.5 rounded-lg border text-xs font-semibold transition shadow-xs ${
                  security.biometricsEnabled
                    ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {security.biometricsEnabled ? 'Вимкнути біометрію' : 'Увімкнути біометрію'}
              </button>
            </div>

            {/* Auto-lock timer */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Автоблокування</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Коли блокувати додаток при згортанні:
              </p>
              <select
                value={security.autoLockMinutes}
                onChange={(e) => handleAutoLockChange(Number(e.target.value))}
                className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value={0}>Відразу при згортанні (0 хв)</option>
                <option value={1}>Через 1 хвилину</option>
                <option value={5}>Через 5 хвилин</option>
                <option value={15}>Через 15 хвилин</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3">
            <Lock className="w-5 h-5 text-slate-400 shrink-0" />
            <span>
              Увімкніть захист, щоб ніхто сторонній не мав доступу до списку клієнтів, об'єктів та фінансових розрахунків на вашому смартфоні.
            </span>
          </div>
        )}
      </div>

      {/* 3. PRICE LIST SECTIONS WITH FULL CRUD */}
      <form onSubmit={handleSavePrices} className="space-y-4">
        {/* Category A: Canvases (Полотна) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Вартість полотен (за 1 м² з встановленням)</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setNewItemCategory('canvas');
                setNewItemUnit('м²');
                setShowAddModal(true);
              }}
              className="flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Додати полотно</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { key: 'pvc_matte', label: 'ПВХ Матовий' },
              { key: 'pvc_satin', label: 'ПВХ Сатиновий' },
              { key: 'pvc_glossy', label: 'ПВХ Глянцевий' },
              { key: 'fabric', label: 'Тканинний (Descor)' },
              { key: 'acoustic', label: 'Акустичний' },
              { key: 'fireproof_km2', label: 'Негорючий Teqtum KM2' },
            ]
              .filter((mat) => !(prices.deletedStandardKeys || []).includes(mat.key))
              .map((mat) => (
                <div key={mat.key} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate flex-1 min-w-0" title={mat.label}>
                    {mat.label}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        value={prices.canvasPrices[mat.key as MaterialType] || 0}
                        onChange={(e) => handlePriceChange('canvasPrices', mat.key, e.target.value)}
                        className="w-20 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-2 pr-6 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white text-right"
                      />
                      <span className="absolute right-1.5 text-[10px] text-slate-400 pointer-events-none font-medium">{currencySymbol}/м²</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteStandardItem(mat.key)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded transition"
                      title="Видалити полотно"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

            {/* Custom Canvases */}
            {(prices.customItems || []).filter((i) => i.category === 'canvas').map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800">
                <span className="text-xs font-bold text-cyan-900 dark:text-cyan-300 truncate flex-1 min-w-0" title={item.name}>
                  {item.name}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => {
                        const p = parseFloat(e.target.value) || 0;
                        const next = (prices.customItems || []).map((ci) => ci.id === item.id ? { ...ci, price: p } : ci);
                        setPrices({ ...prices, customItems: next });
                      }}
                      className="w-20 bg-white dark:bg-slate-900 border border-cyan-300 dark:border-cyan-700 rounded-lg pl-2 pr-6 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white text-right"
                    />
                    <span className="absolute right-1.5 text-[10px] text-slate-400 pointer-events-none font-medium">{currencySymbol}/{item.unit}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomItem(item.id)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded transition"
                    title="Видалити позицію"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Empty state if all canvases removed */}
            {[
              { key: 'pvc_matte' },
              { key: 'pvc_satin' },
              { key: 'pvc_glossy' },
              { key: 'fabric' },
              { key: 'acoustic' },
              { key: 'fireproof_km2' },
            ].filter((mat) => !(prices.deletedStandardKeys || []).includes(mat.key)).length === 0 &&
             (prices.customItems || []).filter((i) => i.category === 'canvas').length === 0 && (
              <div className="col-span-full py-4 text-center text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                Всі полотна видалено. Натисніть «+ Додати полотно» вище для створення нової позиції.
              </div>
            )}
          </div>
        </div>

        {/* Category B: Profiles (Профілі) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Вартість профілю кріплення (за 1 м.п.)</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setNewItemCategory('profile');
                setNewItemUnit('м.п.');
                setShowAddModal(true);
              }}
              className="flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Додати профіль</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { key: 'standard_alu', label: 'Стіновий алюмінієвий' },
              { key: 'pvc', label: 'Стіновий пластиковий' },
              { key: 'shadow_kraab', label: 'Тіньовий (EuroKRAAB)' },
              { key: 'floating_led', label: 'Ширяючий з LED' },
              { key: 'slott_tracks', label: 'Слот / трековий' },
            ]
              .filter((prof) => !(prices.deletedStandardKeys || []).includes(prof.key))
              .map((prof) => (
                <div key={prof.key} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate flex-1 min-w-0" title={prof.label}>
                    {prof.label}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        value={prices.profilePrices[prof.key as ProfileType] || 0}
                        onChange={(e) => handlePriceChange('profilePrices', prof.key, e.target.value)}
                        className="w-20 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-2 pr-6 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white text-right"
                      />
                      <span className="absolute right-1.5 text-[10px] text-slate-400 pointer-events-none font-medium">{currencySymbol}/м.п.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteStandardItem(prof.key)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded transition"
                      title="Видалити профіль"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

            {/* Custom Profiles */}
            {(prices.customItems || []).filter((i) => i.category === 'profile').map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800">
                <span className="text-xs font-bold text-cyan-900 dark:text-cyan-300 truncate flex-1 min-w-0" title={item.name}>
                  {item.name}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => {
                        const p = parseFloat(e.target.value) || 0;
                        const next = (prices.customItems || []).map((ci) => ci.id === item.id ? { ...ci, price: p } : ci);
                        setPrices({ ...prices, customItems: next });
                      }}
                      className="w-20 bg-white dark:bg-slate-900 border border-cyan-300 dark:border-cyan-700 rounded-lg pl-2 pr-6 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white text-right"
                    />
                    <span className="absolute right-1.5 text-[10px] text-slate-400 pointer-events-none font-medium">{currencySymbol}/{item.unit}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomItem(item.id)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded transition"
                    title="Видалити позицію"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Empty state if all profiles removed */}
            {[
              { key: 'standard_alu' },
              { key: 'pvc' },
              { key: 'shadow_kraab' },
              { key: 'floating_led' },
              { key: 'slott_tracks' },
            ].filter((prof) => !(prices.deletedStandardKeys || []).includes(prof.key)).length === 0 &&
             (prices.customItems || []).filter((i) => i.category === 'profile').length === 0 && (
              <div className="col-span-full py-4 text-center text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                Всі профілі видалено. Натисніть «+ Додати профіль» вище для створення нової позиції.
              </div>
            )}
          </div>
        </div>

        {/* Category C: Additional Works (Роботи) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Додаткові монтажні роботи</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setNewItemCategory('work');
                setNewItemUnit('шт');
                setShowAddModal(true);
              }}
              className="flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Додати роботу</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { key: 'extraCornerCost', label: 'Додатковий кут (> 4)', unit: 'шт' },
              { key: 'pipePass', label: 'Обвід труби опалення', unit: 'шт' },
              { key: 'curtainNichePerMeter', label: 'Ніша під карниз для штор', unit: 'м.п.' },
              { key: 'hardWallPerMeter', label: 'Свердління керамограніту', unit: 'м.п.' },
              { key: 'multilevelPerMeterCost', label: 'Перехід рівня стелі', unit: 'м.п.' },
              { key: 'curvedPerMeterCost', label: 'Криволінійна ділянка', unit: 'м.п.' },
            ]
              .filter((work) => !(prices.deletedStandardKeys || []).includes(work.key))
              .map((work) => (
                <div key={work.key} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate flex-1 min-w-0" title={work.label}>
                    {work.label}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        value={prices[work.key as keyof MasterPriceList] as number || 0}
                        onChange={(e) => handleDirectPriceChange(work.key as keyof MasterPriceList, e.target.value)}
                        className="w-20 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-2 pr-6 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white text-right"
                      />
                      <span className="absolute right-1.5 text-[10px] text-slate-400 pointer-events-none font-medium">{currencySymbol}/{work.unit}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteStandardItem(work.key)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded transition"
                      title="Видалити роботу"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

            {/* Custom Works */}
            {(prices.customItems || []).filter((i) => i.category === 'work').map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 truncate flex-1 min-w-0" title={item.name}>
                  {item.name}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => {
                        const p = parseFloat(e.target.value) || 0;
                        const next = (prices.customItems || []).map((ci) => ci.id === item.id ? { ...ci, price: p } : ci);
                        setPrices({ ...prices, customItems: next });
                      }}
                      className="w-20 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg pl-2 pr-6 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white text-right"
                    />
                    <span className="absolute right-1.5 text-[10px] text-slate-400 pointer-events-none font-medium">{currencySymbol}/{item.unit}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomItem(item.id)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded transition"
                    title="Видалити роботу"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Empty state if all works removed */}
            {[
              { key: 'extraCornerCost' },
              { key: 'pipePass' },
              { key: 'curtainNichePerMeter' },
              { key: 'hardWallPerMeter' },
              { key: 'multilevelPerMeterCost' },
              { key: 'curvedPerMeterCost' },
            ].filter((work) => !(prices.deletedStandardKeys || []).includes(work.key)).length === 0 &&
             (prices.customItems || []).filter((i) => i.category === 'work').length === 0 && (
              <div className="col-span-full py-4 text-center text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                Всі монтажні роботи видалено. Натисніть «+ Додати роботу» вище для створення нової позиції.
              </div>
            )}
          </div>
        </div>

        {/* Category D: Lighting & Options (Освітлення) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Освітлення та додаткові опції</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setNewItemCategory('option');
                setNewItemUnit('шт');
                setShowAddModal(true);
              }}
              className="flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Додати опцію</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { key: 'chandelierInstallation', label: 'Монтаж люстри', unit: 'шт' },
              { key: 'spotInstallation', label: 'Точковий світильник GX53', unit: 'шт' },
              { key: 'lightLinePerMeter', label: 'Світлова лінія з LED', unit: 'м.п.' },
            ]
              .filter((opt) => !(prices.deletedStandardKeys || []).includes(opt.key))
              .map((opt) => (
                <div key={opt.key} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate flex-1 min-w-0" title={opt.label}>
                    {opt.label}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        value={prices[opt.key as keyof MasterPriceList] as number || 0}
                        onChange={(e) => handleDirectPriceChange(opt.key as keyof MasterPriceList, e.target.value)}
                        className="w-20 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-2 pr-6 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white text-right"
                      />
                      <span className="absolute right-1.5 text-[10px] text-slate-400 pointer-events-none font-medium">{currencySymbol}/{opt.unit}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteStandardItem(opt.key)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded transition"
                      title="Видалити опцію"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

            {/* Custom Options */}
            {(prices.customItems || []).filter((i) => i.category === 'option').map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <span className="text-xs font-bold text-amber-900 dark:text-cyan-300 truncate flex-1 min-w-0" title={item.name}>
                  {item.name}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => {
                        const p = parseFloat(e.target.value) || 0;
                        const next = (prices.customItems || []).map((ci) => ci.id === item.id ? { ...ci, price: p } : ci);
                        setPrices({ ...prices, customItems: next });
                      }}
                      className="w-20 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg pl-2 pr-6 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white text-right"
                    />
                    <span className="absolute right-1.5 text-[10px] text-slate-400 pointer-events-none font-medium">{currencySymbol}/{item.unit}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomItem(item.id)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded transition"
                    title="Видалити опцію"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Empty state if all lighting options removed */}
            {[
              { key: 'chandelierInstallation', label: 'Монтаж люстри', unit: 'шт' },
              { key: 'spotInstallation', label: 'Точковий світильник GX53', unit: 'шт' },
              { key: 'lightLinePerMeter', label: 'Світлова лінія з LED', unit: 'м.п.' },
            ].filter((opt) => !(prices.deletedStandardKeys || []).includes(opt.key)).length === 0 &&
             (prices.customItems || []).filter((i) => i.category === 'option').length === 0 && (
              <div className="col-span-full py-4 text-center text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                Всі опції освітлення видалено. Натисніть «+ Додати опцію» вище для створення нової позиції.
              </div>
            )}
          </div>
        </div>

        {/* Global Save Button & Restore Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {(prices.deletedStandardKeys || []).length > 0 ? (
            <button
              type="button"
              onClick={handleRestoreStandardItems}
              className="text-xs font-medium text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 underline cursor-pointer"
            >
              Відновити всі стандартні позиції ({prices.deletedStandardKeys?.length})
            </button>
          ) : <div />}

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-md shadow-cyan-900/30 transition active:scale-95 cursor-pointer ml-auto"
          >
            {priceSaveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{priceSaveSuccess ? 'Налаштування збережено!' : t.savePriceList}</span>
          </button>
        </div>
      </form>

      {/* MODAL: ADD CUSTOM PRICE ITEM */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Додати власну позицію в налаштування
            </h3>
            <form onSubmit={handleAddCustomItem} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Категорія</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => {
                    const cat = e.target.value as 'canvas' | 'profile' | 'work' | 'option';
                    setNewItemCategory(cat);
                    setNewItemUnit(cat === 'canvas' ? 'м²' : cat === 'profile' ? 'м.п.' : 'шт');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="canvas">Полотно (м²)</option>
                  <option value="profile">Профіль (м.п.)</option>
                  <option value="work">Додаткова робота</option>
                  <option value="option">Освітлення / Опція</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Назва позиції *</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="напр. MSD Premium 320см або Трековий шинопровід"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Ціна ({currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="350"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Од. виміру</label>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="м², м.п., шт"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Додати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Installation Card */}
      <div className="bg-gradient-to-br from-cyan-50/80 via-white to-blue-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-cyan-950/40 border border-cyan-200 dark:border-cyan-800/50 rounded-2xl p-5 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <img 
              src="/pwa-192x192.png" 
              alt="СтеляПро іконка" 
              className="w-10 h-10 rounded-xl shadow-md border border-cyan-300 dark:border-cyan-500/40 object-cover shrink-0" 
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Встановлення</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Офіційна іконка та автономний додаток для замірника</p>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800 font-semibold w-fit">
            Android & iOS
          </span>
        </div>

        <div className="bg-white dark:bg-slate-950/90 border border-cyan-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-sm text-xs">
          <div>
            <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-bold text-xs mb-1.5">
              <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Інструкція зі швидкого встановлення на телефон</span>
            </div>
            <ol className="list-decimal list-inside text-slate-600 dark:text-slate-400 text-xs space-y-1.5 mt-2">
              <li>Відкрийте це посилання на телефоні в <strong>Google Chrome</strong> (Android) або <strong>Safari</strong> (iPhone/iPad).</li>
              <li>Натисніть на банер <strong>«Встановити на телефон»</strong> або в меню браузера оберіть <strong>«Встановити додаток»</strong> (або «На початковий екран» у Safari).</li>
              <li>Система автоматично створить офіційний системний додаток з повноцінною іконкою, без адресного рядка, який працює <strong>повністю офлайн без інтернету</strong>.</li>
            </ol>
          </div>

          <button
            type="button"
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
              setCopiedUrl(true);
              setTimeout(() => setCopiedUrl(false), 2500);
            }}
            className="w-full sm:w-auto px-6 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold text-xs transition shadow-sm cursor-pointer"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Посилання скопійовано!' : 'Скопіювати посилання для телефону'}</span>
          </button>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>{t.backupTitle}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.exportBackup}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.exportBackupDesc}
            </p>
            <button
              type="button"
              onClick={handleExportBackup}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>{t.exportBackup}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.importBackup}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.importBackupDesc}
            </p>
            <label className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{t.importBackup}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {importStatus && (
          <div className="p-3 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 text-xs font-medium text-center">
            {importStatus}
          </div>
        )}
      </div>

      {/* Danger Zone: Reset */}
      <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-red-800 dark:text-red-400 flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          <span>{t.dangerZone}</span>
        </h3>
        <p className="text-xs text-red-700 dark:text-red-300">
          Скидання бази даних поверне всі ціни та об'єкти до стандартних демонстраційних значень.
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm('Ви впевнені, що хочете скинути всі дані до стандартних демо-значень?')) {
              onResetData();
            }
          }}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-sm"
        >
          {t.resetToDefaults}
        </button>
      </div>

      {/* PIN Setup Modal */}
      {isPinModalOpen && (
        <PinSetupModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onSuccess={() => {
            setSecurity(SecurityStorage.getSettings());
            setSecurityMessage('PIN-код успішно встановлено та активовано!');
            setTimeout(() => setSecurityMessage(null), 3000);
          }}
        />
      )}
    </div>
  );
};
