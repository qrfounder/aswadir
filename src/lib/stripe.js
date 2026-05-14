import { loadStripe } from "@stripe/stripe-js";

/**
 * Stripe.js loader.
 *
 * - Uses `VITE_STRIPE_PUBLISHABLE_KEY` from .env.local in production.
 * - Falls back to Stripe's public docs example key so that the embedded
 *   `<PaymentElement />` still renders in dev mode (UI-only). Real
 *   confirmation is skipped client-side when no real key is configured.
 */
const DEMO_PUBLISHABLE_KEY = "pk_test_TYooMQauvdEDq54NiTphI7jx";

const configuredKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const stripePromise = loadStripe(configuredKey || DEMO_PUBLISHABLE_KEY);

export const isStripeConfigured = () => Boolean(configuredKey);
