/** Hosting catalog prices are stored in NAD (Namibian Dollar). */

export const HOSTING_BASE_CURRENCY = "NAD" as const;

export const SUPPORTED_CURRENCIES = [
  "NAD",
  "ZAR",
  "USD",
  "EUR",
  "GBP",
  "BWP",
  "KES",
  "NGN",
  "GHS",
  "TZS",
  "UGX",
  "AUD",
  "CAD",
  "INR",
  "JPY",
  "CNY",
] as const;

export type HostingCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const COUNTRY_COOKIE = "gm-country";
export const CURRENCY_OVERRIDE_COOKIE = "gm-hosting-currency";

/** Approximate NAD → target rates (1 NAD = X in target currency). Update periodically. */
export const NAD_TO_CURRENCY: Record<HostingCurrency, number> = {
  NAD: 1,
  ZAR: 1,
  USD: 0.055,
  EUR: 0.051,
  GBP: 0.043,
  BWP: 0.74,
  KES: 7.1,
  NGN: 85,
  GHS: 0.85,
  TZS: 145,
  UGX: 210,
  AUD: 0.083,
  CAD: 0.075,
  INR: 4.6,
  JPY: 8.2,
  CNY: 0.4,
};

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT",
  "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
]);

/** ISO 3166-1 alpha-2 → local billing/display currency */
const COUNTRY_CURRENCY: Record<string, HostingCurrency> = {
  NA: "NAD",
  ZA: "ZAR",
  LS: "ZAR",
  SZ: "ZAR",
  BW: "BWP",
  KE: "KES",
  NG: "NGN",
  GH: "GHS",
  TZ: "TZS",
  UG: "UGX",
  US: "USD",
  GB: "GBP",
  AU: "AUD",
  CA: "CAD",
  IN: "INR",
  JP: "JPY",
  CN: "CNY",
  ZW: "USD",
  ZM: "USD",
  MW: "USD",
  MZ: "USD",
  AO: "USD",
};

export function getCurrencyForCountry(countryCode: string | null | undefined): HostingCurrency {
  const code = (countryCode ?? "").toUpperCase();
  if (!code) return "USD";
  if (COUNTRY_CURRENCY[code]) return COUNTRY_CURRENCY[code];
  if (EU_COUNTRIES.has(code)) return "EUR";
  return "USD";
}

export function isSupportedCurrency(value: string): value is HostingCurrency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

export function convertFromNad(amountNad: number, target: HostingCurrency): number {
  if (amountNad <= 0) return 0;
  const rate = NAD_TO_CURRENCY[target] ?? NAD_TO_CURRENCY.USD;
  const converted = amountNad * rate;
  if (target === "JPY" || target === "NGN" || target === "TZS" || target === "UGX") {
    return Math.round(converted);
  }
  return Math.round(converted * 100) / 100;
}

const CURRENCY_LOCALE: Record<HostingCurrency, string> = {
  NAD: "en-NA",
  ZAR: "en-ZA",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  BWP: "en-BW",
  KES: "en-KE",
  NGN: "en-NG",
  GHS: "en-GH",
  TZS: "en-TZ",
  UGX: "en-UG",
  AUD: "en-AU",
  CAD: "en-CA",
  INR: "en-IN",
  JPY: "ja-JP",
  CNY: "zh-CN",
};

export function formatHostingCurrency(amount: number, currency: HostingCurrency): string {
  const locale = CURRENCY_LOCALE[currency];

  // Intl renders NAD as a bare "$", which visitors mistake for US dollars — use the local "N$".
  if (currency === "NAD") {
    const fractionDigits = Number.isInteger(amount) ? 0 : 2;
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
    return `N$${formatted}`;
  }

  const fractionDigits =
    currency === "JPY" || currency === "NGN" || currency === "TZS" || currency === "UGX" ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

export function formatNadAsCurrency(
  amountNad: number,
  currency: HostingCurrency,
  options?: { suffix?: string }
): string {
  if (amountNad <= 0) return "";
  const converted =
    currency === HOSTING_BASE_CURRENCY
      ? amountNad
      : convertFromNad(amountNad, currency);
  const formatted = formatHostingCurrency(converted, currency);
  return options?.suffix ? `${formatted}${options.suffix}` : formatted;
}

export function detectCountryFromHeaders(
  headerCountry: string | null,
  cookieCountry?: string | null
): string {
  const fromCookie = cookieCountry?.trim().toUpperCase();
  if (fromCookie && fromCookie.length === 2) return fromCookie;
  const fromHeader = headerCountry?.trim().toUpperCase();
  if (fromHeader && fromHeader.length === 2 && fromHeader !== "XX") return fromHeader;
  return "NA";
}

export function currencyLabel(currency: HostingCurrency): string {
  return currency;
}

export const CURRENCY_OPTIONS: { code: HostingCurrency; label: string }[] = [
  { code: "NAD", label: "Namibian Dollar (NAD)" },
  { code: "ZAR", label: "South African Rand (ZAR)" },
  { code: "USD", label: "US Dollar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "BWP", label: "Botswana Pula (BWP)" },
  { code: "KES", label: "Kenyan Shilling (KES)" },
  { code: "NGN", label: "Nigerian Naira (NGN)" },
  { code: "GHS", label: "Ghanaian Cedi (GHS)" },
  { code: "AUD", label: "Australian Dollar (AUD)" },
  { code: "CAD", label: "Canadian Dollar (CAD)" },
  { code: "INR", label: "Indian Rupee (INR)" },
];
