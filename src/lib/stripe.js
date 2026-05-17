import { loadStripe } from "@stripe/stripe-js";

const DEMO_PUBLISHABLE_KEY = "pk_test_TYooMQauvdEDq54NiTphI7jx";

let cachedKey = null;
let cachedPaymentsEnabled = false;

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
  return DEMO_PUBLISHABLE_KEY;
}

export const stripePromise = resolveKey().then((key) => loadStripe(key));

/** Stripe secret + publishable keys configured on the server */
export const isStripeConfigured = () => cachedPaymentsEnabled;
