import Stripe from "stripe";
import { getCatalog } from "./catalog.js";
import { getStripeSecretKey, stripeModeFromSecretKey } from "./stripe-config.js";

/** @type {{ checked: boolean; ok: boolean; errors: string[] }} */
let cache = { checked: false, ok: true, errors: [] };

/**
 * Verify each STRIPE_PRICE_* exists and matches secret key mode (test vs live).
 * @returns {Promise<{ ok: boolean; errors: string[] }>}
 */
export async function validateStripePrices() {
  const errors = [];
  const secret = getStripeSecretKey();
  const mode = stripeModeFromSecretKey(secret);

  if (!mode) {
    cache = { checked: true, ok: false, errors: ["Stripe secret key not configured"] };
    return cache;
  }

  const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });
  const catalog = getCatalog();
  const expectLive = mode === "live";

  for (const [productId, product] of Object.entries(catalog)) {
    const priceId = product?.priceId;
    if (!priceId) {
      errors.push(`${productId}: price ID missing in env`);
      continue;
    }
    try {
      const price = await stripe.prices.retrieve(priceId);
      if (price.livemode !== expectLive) {
        errors.push(
          `${productId}: ${priceId} is ${price.livemode ? "LIVE" : "TEST"} but STRIPE_SECRET_KEY is ${mode.toUpperCase()}`,
        );
      }
    } catch (err) {
      errors.push(`${productId}: ${priceId} — ${err.message}`);
    }
  }

  cache = { checked: true, ok: errors.length === 0, errors };
  return cache;
}

export function getStripePriceValidation() {
  return cache;
}
