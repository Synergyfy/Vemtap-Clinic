import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CurrencyCode = 'NGN' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export const currencies: CurrencyConfig[] = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-EU' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
];

interface CurrencyState {
  activeCurrency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      activeCurrency: 'NGN',
      setCurrency: (code) => set({ activeCurrency: code }),
    }),
    {
      name: 'vemtap-currency',
    }
  )
);

export const getCurrencyConfig = (code: CurrencyCode): CurrencyConfig =>
  currencies.find((c) => c.code === code) || currencies[0];
