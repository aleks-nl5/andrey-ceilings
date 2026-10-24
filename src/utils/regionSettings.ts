export interface RegionInfo {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
}

export const SUPPORTED_REGIONS: RegionInfo[] = [
  { code: 'UA', name: 'Україна', flag: '🇺🇦', phoneCode: '+380' },
  { code: 'PL', name: 'Польща', flag: '🇵🇱', phoneCode: '+48' },
  { code: 'DE', name: 'Німеччина', flag: '🇩🇪', phoneCode: '+49' },
  { code: 'CZ', name: 'Чехія', flag: '🇨🇿', phoneCode: '+420' },
  { code: 'MD', name: 'Молдова', flag: '🇲🇩', phoneCode: '+373' },
  { code: 'RO', name: 'Румунія', flag: '🇷🇴', phoneCode: '+40' },
  { code: 'ES', name: 'Іспанія', flag: '🇪🇸', phoneCode: '+34' },
  { code: 'IT', name: 'Італія', flag: '🇮🇹', phoneCode: '+39' },
  { code: 'GB', name: 'Велика Британія', flag: '🇬🇧', phoneCode: '+44' },
  { code: 'US', name: 'США / Канада', flag: '🇺🇸', phoneCode: '+1' },
  { code: 'KZ', name: 'Казахстан', flag: '🇰🇿', phoneCode: '+7' },
  { code: 'LT', name: 'Литва', flag: '🇱🇹', phoneCode: '+370' },
  { code: 'LV', name: 'Латвія', flag: '🇱🇻', phoneCode: '+371' },
  { code: 'EE', name: 'Естонія', flag: '🇪🇪', phoneCode: '+372' },
  { code: 'FR', name: 'Франція', flag: '🇫🇷', phoneCode: '+33' },
  { code: 'GE', name: 'Грузія', flag: '🇬🇪', phoneCode: '+995' },
];

export type CurrencyCode = 'UAH' | 'USD' | 'EUR';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  shortLabel: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'UAH', symbol: '₴', name: 'Гривня (UAH)', shortLabel: 'Грн (₴)' },
  { code: 'USD', symbol: '$', name: 'Долар (USD)', shortLabel: 'USD ($)' },
  { code: 'EUR', symbol: '€', name: 'Євро (EUR)', shortLabel: 'EUR (€)' },
];

export function getRegion(code?: string): RegionInfo {
  const found = SUPPORTED_REGIONS.find((r) => r.code === code);
  return found || SUPPORTED_REGIONS[0]; // Default to Ukraine
}

export function getCurrencyInfo(code?: CurrencyCode | string): CurrencyInfo {
  const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
  return found || SUPPORTED_CURRENCIES[0]; // Default to UAH
}

export function getCurrencySymbol(code?: CurrencyCode | string): string {
  return getCurrencyInfo(code).symbol;
}
