import { loadStripe } from "@stripe/stripe-js";
import { stripeJsLocale } from "@/lib/stripeLocale";

const DEMO_PUBLISHABLE_KEY = "pk_test_TYooMQauvdEDq54NiTphI7jx";

let cachedKey = null;
let cachedPaymentsEnabled = false;

/** @type {Map<string, ReturnType<typeof loadStripe>>} */
const stripeByLocale = new Map();

export async function fetchStripeConfig() {
  try {
    const res = await fetch("/api/config", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      cachedKey = data.stripePublishableKey || "";
      cachedPaymentsEnabled =
        Boolean(data.paymentsEnabled) ||
        (typeof data.stripePublishableKey === "string" &&
          data.stripePublishableKey.startsWith("pk_"));
      return {
        publishableKey: cachedKey,
        paymentsEnabled: cachedPaymentsEnabled,
      };
    }
  } catch {
    /* ignore */
  }
  cachedKey = "";
  cachedPaymentsEnabled = false;
  return { publishableKey: "", paymentsEnabled: false };
}

async function resolveKey() {
  if (cachedKey) return cachedKey;
  const cfg = await fetchStripeConfig();
  if (cfg.publishableKey) return cfg.publishableKey;
  if (import.meta.env.PROD) return "";
  return DEMO_PUBLISHABLE_KEY;
}

/**
 * Stripe.js with locale — controls embedded Checkout UI language (incl. Arabic via `ar`).
 * @param {string} [appLocale] en | ar | th
 */
export async function getStripeForLocale(appLocale) {
  const key = await resolveKey();
  if (!key) return null;
  const jsLocale = stripeJsLocale(appLocale);
  const cacheKey = `${key}:${jsLocale}`;
  if (!stripeByLocale.has(cacheKey)) {
    stripeByLocale.set(cacheKey, loadStripe(key, { locale: jsLocale }));
  }
  return stripeByLocale.get(cacheKey);
}

/** @deprecated Prefer getStripeForLocale(locale) */
export const stripePromise = resolveKey().then((key) =>
  key ? loadStripe(key, { locale: "en" }) : null,
);

export const isStripeConfigured = () => cachedPaymentsEnabled;
