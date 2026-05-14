import { loadStripe } from "@stripe/stripe-js";

/**
 * Stripe.js loader.
 *
 * Fetches the publishable key from /api/config at runtime. This avoids
 * having to pass VITE_STRIPE_PUBLISHABLE_KEY at Docker build time, which
 * is not supported by all hosts (e.g. Easypanel UI).
 *
 * Falls back to Stripe's public docs demo key so the PaymentElement
 * still renders in UI-only preview mode.
 */
const DEMO_PUBLISHABLE_KEY = "pk_test_TYooMQauvdEDq54NiTphI7jx";

let cachedKey = null;
let cachedKeyIsReal = false;

async function resolveKey() {
  if (cachedKey) return cachedKey;
  try {
    const res = await fetch("/api/config", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.stripePublishableKey) {
        cachedKey = data.stripePublishableKey;
        cachedKeyIsReal = true;
        return cachedKey;
      }
    }
  } catch {
    /* fall through to demo */
  }
  cachedKey = DEMO_PUBLISHABLE_KEY;
  cachedKeyIsReal = false;
  return cachedKey;
}

export const stripePromise = resolveKey().then((key) => loadStripe(key));

export const isStripeConfigured = () => cachedKeyIsReal;
