import i18n from './i18n';

interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
}

const currencyMap: Record<string, CurrencyConfig> = {
  ar: { code: 'SAR', symbol: 'ر.س', locale: 'ar-SA' },
  en: { code: 'USD', symbol: '$', locale: 'en-US' },
  fr: { code: 'EUR', symbol: '€', locale: 'fr-FR' },
  tr: { code: 'TRY', symbol: '₺', locale: 'tr-TR' },
  es: { code: 'EUR', symbol: '€', locale: 'es-ES' },
  it: { code: 'EUR', symbol: '€', locale: 'it-IT' },
};

/**
 * Format a number as currency based on the current language
 * @param amount - The amount to format
 * @param language - Optional language code (defaults to current i18n language)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, language?: string): string {
  const lang = language || i18n.language || 'ar';
  const config = currencyMap[lang] || currencyMap.ar;

  try {
    // Use Intl.NumberFormat for proper currency formatting
    const formatter = new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatter.format(amount);
  } catch (error) {
    // Fallback to simple formatting if Intl is not available
    return `${config.symbol} ${amount.toFixed(2)}`;
  }
}

/**
 * Get currency symbol for the current language
 * @param language - Optional language code (defaults to current i18n language)
 * @returns Currency symbol
 */
export function getCurrencySymbol(language?: string): string {
  const lang = language || i18n.language || 'ar';
  const config = currencyMap[lang] || currencyMap.ar;
  return config.symbol;
}

/**
 * Get currency code for the current language
 * @param language - Optional language code (defaults to current i18n language)
 * @returns Currency code (e.g., 'SAR', 'USD')
 */
export function getCurrencyCode(language?: string): string {
  const lang = language || i18n.language || 'ar';
  const config = currencyMap[lang] || currencyMap.ar;
  return config.code;
}

/**
 * Parse a currency string to a number
 * @param currencyString - The currency string to parse
 * @returns Parsed number or 0 if parsing fails
 */
export function parseCurrency(currencyString: string): number {
  // Remove all non-numeric characters except decimal point and minus sign
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format a number with thousand separators
 * @param amount - The amount to format
 * @param language - Optional language code (defaults to current i18n language)
 * @returns Formatted number string
 */
export function formatNumber(amount: number, language?: string): string {
  const lang = language || i18n.language || 'ar';
  const config = currencyMap[lang] || currencyMap.ar;

  try {
    const formatter = new Intl.NumberFormat(config.locale);
    return formatter.format(amount);
  } catch (error) {
    return amount.toLocaleString();
  }
}
