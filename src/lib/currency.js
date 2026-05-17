/** @typedef {'SAR' | 'AED' | 'USD' | 'THB' | 'MAD' | 'KWD' | 'QAR' | 'BHD' | 'OMR' | 'EGP'} AppCurrency */

export const STORAGE_KEY_CURRENCY = "massar_currency";
export const STORAGE_KEY_CURRENCY_MANUAL = "massar_currency_manual";

/** Canonical subscription currency charged by Stripe. */
export const GLOBAL_PRICE_CURRENCY = "USD";
export const CHECKOUT_CHARGE_CURRENCY = "USD";

export const SUPPORTED_CURRENCIES = ["USD", "SAR", "AED", "THB", "MAD", "KWD", "QAR", "EGP"];

/** USD list prices (source of truth for Stripe amounts in cents). */
export const GLOBAL_PRICES = {
  task: { sale: 4.99, original: 14.99 },
  habit: { sale: 4.99, original: 14.99 },
  bundle: { sale: 9.99, original: 24.99 },
};

/**
 * Local display prices (rounded for each market). Card is charged in USD at checkout.
 * Keep sale tiers aligned with ~$4.99 singles / ~$9.99 bundle positioning.
 */
export const PRODUCT_PRICES = {
  task: {
    USD: { sale: 4.99, original: 14.99 },
    AED: { sale: 18, original: 55 },
    SAR: { sale: 19, original: 56 },
    THB: { sale: 179, original: 499 },
    MAD: { sale: 49, original: 149 },
    KWD: { sale: 1.5, original: 4.5 },
    QAR: { sale: 18, original: 55 },
    EGP: { sale: 249, original: 749 },
  },
  habit: {
    USD: { sale: 4.99, original: 14.99 },
    AED: { sale: 18, original: 55 },
    SAR: { sale: 19, original: 56 },
    THB: { sale: 179, original: 499 },
    MAD: { sale: 49, original: 149 },
    KWD: { sale: 1.5, original: 4.5 },
    QAR: { sale: 18, original: 55 },
    EGP: { sale: 249, original: 749 },
  },
  bundle: {
    USD: { sale: 9.99, original: 24.99 },
    AED: { sale: 37, original: 89 },
    SAR: { sale: 39, original: 92 },
    THB: { sale: 349, original: 849 },
    MAD: { sale: 99, original: 249 },
    KWD: { sale: 2.9, original: 7.5 },
    QAR: { sale: 37, original: 89 },
    EGP: { sale: 449, original: 1099 },
  },
};

export const COUNTRY_TO_CURRENCY = {
  SA: "SAR",
  AE: "AED",
  KW: "KWD",
  QA: "QAR",
  BH: "AED",
  OM: "AED",
  MA: "MAD",
  EG: "EGP",
  TH: "THB",
  US: "USD",
  GB: "USD",
  CA: "USD",
  AU: "USD",
  DE: "USD",
  ES: "USD",
  IN: "USD",
  PK: "USD",
  CN: "USD",
  TW: "USD",
  HK: "USD",
  SG: "USD",
  FR: "USD",
  JO: "USD",
  LB: "USD",
};

export const LOCALE_DEFAULT_CURRENCY = {
  ar: "SAR",
  th: "THB",
  en: "USD",
};

const INTL_BY_CURRENCY = {
  USD: "en-US",
  SAR: "ar-SA",
  AED: "ar-AE",
  THB: "th-TH",
  MAD: "fr-MA",
  KWD: "ar-KW",
  QAR: "ar-QA",
  BHD: "ar-BH",
  OMR: "ar-OM",
  EGP: "ar-EG",
};

const ZERO_DECIMAL_CURRENCIES = new Set(["THB", "EGP"]);
const THREE_DECIMAL_CURRENCIES = new Set(["KWD", "BHD", "OMR"]);

/**
 * @param {string | null | undefined} code
 * @returns {AppCurrency}
 */
export function normalizeCurrency(code) {
  if (!code) return GLOBAL_PRICE_CURRENCY;
  const upper = String(code).toUpperCase();
  if (SUPPORTED_CURRENCIES.includes(upper)) return /** @type {AppCurrency} */ (upper);
  return GLOBAL_PRICE_CURRENCY;
}

/**
 * @param {import('@/i18n/constants.js').AppLocale} locale
 * @param {string | null | undefined} country
 * @returns {AppCurrency}
 */
export function suggestCurrency(locale, country) {
  if (country && COUNTRY_TO_CURRENCY[country]) {
    return normalizeCurrency(COUNTRY_TO_CURRENCY[country]);
  }
  return normalizeCurrency(LOCALE_DEFAULT_CURRENCY[locale] || GLOBAL_PRICE_CURRENCY);
}

/**
 * @param {string} productId
 * @param {AppCurrency} [currency]
 */
export function getProductPrices(productId, currency) {
  const c = normalizeCurrency(currency);
  const row = PRODUCT_PRICES[productId] || PRODUCT_PRICES.bundle;
  return row[c] || row.USD;
}

/** Lowest monthly sale price (task or habit) for “from” conversion copy. */
export function getLowestSalePrice(currency) {
  const task = getProductPrices("task", currency).sale;
  const habit = getProductPrices("habit", currency).sale;
  return Math.min(task, habit);
}

/**
 * @param {number} amount
 * @param {AppCurrency} [currency]
 * @param {import('@/i18n/constants.js').AppLocale} [_uiLocale]
 */
export function formatMoney(amount, currency, _uiLocale) {
  const c = normalizeCurrency(currency);
  const intl = INTL_BY_CURRENCY[c] || "en-US";
  const fractionDigits = THREE_DECIMAL_CURRENCIES.has(c)
    ? 3
    : ZERO_DECIMAL_CURRENCIES.has(c)
      ? 0
      : 2;
  try {
    return new Intl.NumberFormat(intl, {
      style: "currency",
      currency: c,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  } catch {
    return `${amount} ${c}`;
  }
}

/** @deprecated Use formatMoney */
export function formatMoneyUsd(amount) {
  return formatMoney(amount, "USD");
}

/**
 * @param {string} productId
 * @param {'sale' | 'original'} kind
 * @param {AppCurrency} [currency]
 * @param {import('@/i18n/constants.js').AppLocale} [uiLocale]
 */
export function formatProductPrice(productId, kind, currency, uiLocale) {
  const prices = getProductPrices(productId, currency);
  return formatMoney(prices[kind], currency, uiLocale);
}
