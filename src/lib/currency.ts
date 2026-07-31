import { useCurrencyStore, getCurrencyConfig, type CurrencyCode } from "@/store/currencyStore";

/**
 * Format a number to the currently active currency.
 * Use this hook in client components to get a formatter function.
 */
export function useFormatCurrency() {
  const { activeCurrency } = useCurrencyStore();

  return (value: number, options?: { decimals?: boolean }): string => {
    const config = getCurrencyConfig(activeCurrency);
    const formatted = new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: options?.decimals ? 2 : 0,
      maximumFractionDigits: options?.decimals ? 2 : 0,
    }).format(value);
    return formatted;
  };
}

/**
 * Format a currency string that might contain a symbol prefix (e.g. "₦45,000" or "$150.00")
 * into a number, then re-format using the active currency.
 */
export function useReformatCurrency() {
  const format = useFormatCurrency();

  return (priceString: string, options?: { decimals?: boolean }): string => {
    const num = parseFloat(priceString.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return priceString;
    return format(num, options);
  };
}

/**
 * For server components or non-hook contexts.
 * Returns the raw config for the active currency.
 */
export function getActiveCurrencyConfig(): ReturnType<typeof getCurrencyConfig> {
  // This reads from localStorage directly so it works outside React
  if (typeof window === "undefined") return getCurrencyConfig("NGN");
  try {
    const raw = localStorage.getItem("vemtap-currency");
    if (raw) {
      const parsed = JSON.parse(raw);
      return getCurrencyConfig(parsed.state?.activeCurrency || "NGN");
    }
  } catch { /* ignore */ }
  return getCurrencyConfig("NGN");
}

/**
 * Replaces a price string symbol with the active currency symbol.
 * For use in non-hook contexts.
 */
export function replaceCurrencySymbol(priceString: string): string {
  const config = getActiveCurrencyConfig();
  return priceString.replace(/^[₦$€£]/, config.symbol);
}

/**
 * Strip currency symbol and commas from a price string, return number.
 */
export const parsePrice = (priceString: string): number =>
  parseFloat(priceString.replace(/[₦$€£,]/g, "")) || 0;
