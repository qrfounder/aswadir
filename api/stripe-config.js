/** True when a real Stripe secret key is configured (not placeholder). */
export function isStripeConfigured() {
  const key = String(process.env.STRIPE_SECRET_KEY || "").trim();
  if (!key || key.includes("REPLACE")) return false;
  return key.startsWith("sk_test_") || key.startsWith("sk_live_");
}
