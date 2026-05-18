export {
  normalizeAppLocale,
  stripeCheckoutSessionLocale,
  stripeJsLocale,
} from "../shared/stripe-locale.js";

/** @deprecated Use stripeCheckoutSessionLocale */
export function stripeCheckoutLocale(preferred) {
  return stripeCheckoutSessionLocale(preferred);
}
