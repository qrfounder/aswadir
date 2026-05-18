/** @typedef {'test' | 'live'} StripeMode */

/**
 * @param {string} key
 * @returns {StripeMode | null}
 */
export function stripeModeFromSecretKey(key) {
  const k = String(key || "").trim();
  if (k.startsWith("sk_live_")) return "live";
  if (k.startsWith("sk_test_")) return "test";
  return null;
}

/**
 * @param {string} key
 * @returns {StripeMode | null}
 */
export function stripeModeFromPublishableKey(key) {
  const k = String(key || "").trim();
  if (k.startsWith("pk_live_")) return "live";
  if (k.startsWith("pk_test_")) return "test";
  return null;
}

export function getStripeSecretKey() {
  return String(process.env.STRIPE_SECRET_KEY || "").trim();
}

export function getStripePublishableKey() {
  return String(process.env.STRIPE_PUBLISHABLE_KEY || "").trim();
}

/** True when a real Stripe secret key is configured (not placeholder). */
export function isStripeConfigured() {
  const key = getStripeSecretKey();
  if (!key || key.includes("REPLACE")) return false;
  return Boolean(stripeModeFromSecretKey(key));
}

/**
 * @returns {{ ok: boolean; mode: StripeMode | null; errors: string[]; warnings: string[] }}
 */
export function validateStripeEnvironment() {
  const errors = [];
  const warnings = [];
  const secret = getStripeSecretKey();
  const publishable = getStripePublishableKey();

  if (!secret || secret.includes("REPLACE")) {
    errors.push("STRIPE_SECRET_KEY is missing or still a placeholder.");
  }
  if (!publishable || publishable.includes("REPLACE")) {
    errors.push("STRIPE_PUBLISHABLE_KEY is missing or still a placeholder.");
  }

  const secretMode = stripeModeFromSecretKey(secret);
  const publishableMode = stripeModeFromPublishableKey(publishable);

  if (secret && !secretMode) {
    errors.push("STRIPE_SECRET_KEY must start with sk_test_ or sk_live_.");
  }
  if (publishable && !publishableMode) {
    errors.push("STRIPE_PUBLISHABLE_KEY must start with pk_test_ or pk_live_.");
  }
  if (secretMode && publishableMode && secretMode !== publishableMode) {
    errors.push(
      `Stripe key mode mismatch: secret is ${secretMode} but publishable is ${publishableMode}.`,
    );
  }

  const mode = secretMode || publishableMode;
  const isProd = process.env.NODE_ENV === "production";

  if (isProd && mode === "test") {
    errors.push("NODE_ENV=production but Stripe keys are in TEST mode — use sk_live_ / pk_live_.");
  }
  if (!isProd && mode === "live") {
    warnings.push("Using LIVE Stripe keys in non-production NODE_ENV — real charges will occur.");
  }
  if (isProd && mode === "live" && !process.env.STRIPE_WEBHOOK_SECRET) {
    errors.push("STRIPE_WEBHOOK_SECRET is required in production.");
  }
  if (isProd && mode === "live" && !process.env.SITE_URL) {
    warnings.push("SITE_URL is not set — checkout return URLs may be wrong.");
  }

  for (const envKey of ["STRIPE_PRICE_TASK", "STRIPE_PRICE_HABIT", "STRIPE_PRICE_BUNDLE"]) {
    const v = String(process.env[envKey] || "").trim();
    if (!v || v.includes("REPLACE")) {
      errors.push(`${envKey} is missing — run npm run stripe:setup with your live secret key.`);
    }
  }

  return {
    ok: errors.length === 0,
    mode,
    errors,
    warnings,
  };
}
