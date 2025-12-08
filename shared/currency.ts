/**
 * Currency formatting utilities
 * Supports SAR (Saudi Riyal) and USD (US Dollar)
 */

export type Currency = "SAR" | "USD";

export interface CurrencySymbol {
  symbol: string;
  symbolAr: string;
  position: "before" | "after";
}

export const CURRENCY_CONFIG: Record<Currency, CurrencySymbol> = {
  SAR: {
    symbol: "SAR",
    symbolAr: "ريال",
    position: "after",
  },
  USD: {
    symbol: "$",
    symbolAr: "$",
    position: "before",
  },
};

/**
 * Format amount with currency symbol
 * @param amount - The numeric amount to format
 * @param currency - The currency code (SAR or USD)
 * @param locale - The locale for number formatting (default: 'ar-SA' for Arabic, 'en-US' for English)
 * @returns Formatted currency string
 * 
 * Examples:
 * formatCurrency(100, 'SAR', 'ar-SA') => "100 ريال"
 * formatCurrency(100, 'SAR', 'en-US') => "100 SAR"
 * formatCurrency(100, 'USD', 'ar-SA') => "$100"
 * formatCurrency(100, 'USD', 'en-US') => "$100"
 */
export function formatCurrency(
  amount: number,
  currency: Currency = "SAR",
  locale: string = "ar-SA"
): string {
  const config = CURRENCY_CONFIG[currency];
  const isArabic = locale.startsWith("ar");

  // Format number with thousands separator
  const formattedAmount = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  // Choose symbol based on locale
  const symbol = isArabic ? config.symbolAr : config.symbol;

  // Position symbol before or after amount
  if (config.position === "before") {
    return `${symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount} ${symbol}`;
  }
}

/**
 * Get currency symbol only
 */
export function getCurrencySymbol(currency: Currency, locale: string = "ar-SA"): string {
  const config = CURRENCY_CONFIG[currency];
  const isArabic = locale.startsWith("ar");
  return isArabic ? config.symbolAr : config.symbol;
}

/**
 * Convert amount from one currency to another
 * Note: This is a placeholder. In production, use real exchange rates from an API
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount;

  // Placeholder exchange rates (should be fetched from API in production)
  const EXCHANGE_RATES: Record<Currency, Record<Currency, number>> = {
    SAR: {
      SAR: 1,
      USD: 0.27, // 1 SAR = 0.27 USD (approximate)
    },
    USD: {
      USD: 1,
      SAR: 3.75, // 1 USD = 3.75 SAR (approximate)
    },
  };

  return amount * EXCHANGE_RATES[fromCurrency][toCurrency];
}
