/** @typedef {'en' | 'ar' | 'th'} AppLocale */

/** @param {string} [preferred] @returns {AppLocale} */
export function normalizeAppLocale(preferred) {
  const code = String(preferred || "en").split("-")[0].toLowerCase();
  if (code === "ar") return "ar";
  if (code === "th") return "th";
  return "en";
}

/**
 * Stripe Checkout Session `locale` (hosted + embedded).
 * Arabic is not a Checkout locale enum — use `auto` (browser) + stripe.js `ar` for RTL strings where supported.
 * @param {string} [preferred]
 */
export function stripeCheckoutSessionLocale(preferred) {
  const app = normalizeAppLocale(preferred);
  if (app === "en") return "en";
  if (app === "th") return "th";
  return "auto";
}

/**
 * Stripe.js `loadStripe(key, { locale })` — supports `ar`, `th`, `en`.
 * @param {string} [preferred]
 */
export function stripeJsLocale(preferred) {
  const app = normalizeAppLocale(preferred);
  const map = { en: "en", th: "th", ar: "ar" };
  return map[app] || "en";
}
