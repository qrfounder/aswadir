/** @typedef {import('../../shared/product-prices.js').AppCurrency} AppCurrency */

import {
  getProductPrices,
  normalizeCurrency,
} from "../../shared/product-prices.js";

export {
  SUPPORTED_CURRENCIES,
  PRODUCT_PRICES,
  normalizeCurrency,
  getProductPrices,
  amountToStripeMinorUnits,
  getCheckoutCharge,
} from "../../shared/product-prices.js";

export const STORAGE_KEY_CURRENCY = "massar_currency";
export const STORAGE_KEY_CURRENCY_MANUAL = "massar_currency_manual";

/** @deprecated Use display currency — checkout charges match site currency switcher. */
export const GLOBAL_PRICE_CURRENCY = "USD";
export const CHECKOUT_CHARGE_CURRENCY = "USD";

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

/** Public offer price — full bundle only. */
export function getLowestSalePrice(currency) {
  return getProductPrices("bundle", currency).sale;
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

/** ~30-day framing for “less than X / day” checkout copy (display currency). */
export function formatPerDayFromMonthlySale(productId, currency, locale) {
  const { sale } = getProductPrices(productId, currency);
  return formatMoney(sale / 30, currency, locale);
}
