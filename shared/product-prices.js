/**
 * Display + checkout price catalog (single source of truth).
 * Stripe charges use minor units from amountToStripeMinorUnits().
 */

/** @typedef {'SAR' | 'AED' | 'USD' | 'THB' | 'MAD' | 'KWD' | 'QAR' | 'BHD' | 'OMR' | 'EGP'} AppCurrency */

export const SUPPORTED_CURRENCIES = ["USD", "SAR", "AED", "THB", "MAD", "KWD", "QAR", "EGP"];

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

const ZERO_DECIMAL_CURRENCIES = new Set(["THB", "EGP"]);
const THREE_DECIMAL_CURRENCIES = new Set(["KWD", "BHD", "OMR"]);

/**
 * @param {string | null | undefined} code
 * @returns {AppCurrency}
 */
export function normalizeCurrency(code) {
  if (!code) return "USD";
  const upper = String(code).toUpperCase();
  if (SUPPORTED_CURRENCIES.includes(upper)) return /** @type {AppCurrency} */ (upper);
  return "USD";
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

/**
 * Convert a major-unit amount to Stripe minor units (cents/fils/etc.).
 * @param {number} amount
 * @param {AppCurrency} currency
 */
export function amountToStripeMinorUnits(amount, currency) {
  const c = normalizeCurrency(currency);
  if (THREE_DECIMAL_CURRENCIES.has(c)) return Math.round(amount * 1000);
  if (ZERO_DECIMAL_CURRENCIES.has(c)) return Math.round(amount);
  return Math.round(amount * 100);
}

/**
 * Charge payload for Stripe Checkout line_items.price_data.
 * @param {string} productId
 * @param {string} [currency]
 */
export function getCheckoutCharge(productId, currency) {
  const displayCurrency = normalizeCurrency(currency);
  const { sale } = getProductPrices(productId, displayCurrency);
  const unitAmount = amountToStripeMinorUnits(sale, displayCurrency);
  if (!Number.isFinite(unitAmount) || unitAmount < 1) {
    throw new Error("invalid_checkout_amount");
  }
  return {
    displayCurrency,
    stripeCurrency: displayCurrency.toLowerCase(),
    unitAmount,
    displaySale: sale,
  };
}
