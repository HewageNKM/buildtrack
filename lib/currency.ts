// Currency configuration and formatting utilities

export type CurrencyCode =
  | "LKR"
  | "USD"
  | "EUR"
  | "GBP"
  | "INR"
  | "AUD"
  | "CAD";

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  LKR: {
    code: "LKR",
    symbol: "Rs.",
    name: "Sri Lankan Rupee",
    locale: "en-LK",
  },
  USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB" },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN" },
  AUD: {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    locale: "en-AU",
  },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", locale: "en-CA" },
};

export const DEFAULT_CURRENCY: CurrencyCode = "LKR";

export const CURRENCY_LIST = Object.values(CURRENCIES);

/**
 * Format a number as currency with proper locale and comma separators
 */
export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = DEFAULT_CURRENCY
): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number with commas (no currency symbol)
 */
export function formatNumber(
  amount: number,
  currencyCode: CurrencyCode = DEFAULT_CURRENCY
): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];

  return new Intl.NumberFormat(currency.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format currency with short notation (e.g., Rs. 1.5M)
 */
export function formatCurrencyCompact(
  amount: number,
  currencyCode: CurrencyCode = DEFAULT_CURRENCY
): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Get currency symbol only
 */
export function getCurrencySymbol(
  currencyCode: CurrencyCode = DEFAULT_CURRENCY
): string {
  return (
    CURRENCIES[currencyCode]?.symbol || CURRENCIES[DEFAULT_CURRENCY].symbol
  );
}
