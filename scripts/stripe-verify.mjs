#!/usr/bin/env node
/**
 * Verify Stripe is ready for checkout (test or live).
 * Usage: npm run stripe:verify
 *        NODE_ENV=production npm run stripe:verify   # stricter (expects live keys)
 */
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env") });

const EXPECTED = {
  STRIPE_PRICE_TASK: { amount: 499, label: "task" },
  STRIPE_PRICE_HABIT: { amount: 499, label: "habit" },
  STRIPE_PRICE_BUNDLE: { amount: 999, label: "bundle" },
};

function modeFromSecret(key) {
  if (key.startsWith("sk_live_")) return "live";
  if (key.startsWith("sk_test_")) return "test";
  return null;
}

function modeFromPublishable(key) {
  if (key.startsWith("pk_live_")) return "live";
  if (key.startsWith("pk_test_")) return "test";
  return null;
}

const secret = String(process.env.STRIPE_SECRET_KEY || "").trim();
const publishable = String(process.env.STRIPE_PUBLISHABLE_KEY || "").trim();
const webhook = String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();
const siteUrl = String(process.env.SITE_URL || "").trim();
const isProd = process.env.NODE_ENV === "production";

let failed = false;

function fail(msg) {
  console.error(`✗ ${msg}`);
  failed = true;
}

function pass(msg) {
  console.log(`✓ ${msg}`);
}

function warn(msg) {
  console.warn(`⚠ ${msg}`);
}

console.log("\nMassar Stripe verification\n");

if (!secret || secret.includes("REPLACE")) {
  fail("STRIPE_SECRET_KEY missing in .env");
} else {
  pass(`Secret key present (${secret.slice(0, 12)}…)`);
}

if (!publishable || publishable.includes("REPLACE")) {
  fail("STRIPE_PUBLISHABLE_KEY missing in .env");
} else {
  pass(`Publishable key present (${publishable.slice(0, 12)}…)`);
}

const secretMode = modeFromSecret(secret);
const pubMode = modeFromPublishable(publishable);

if (!secretMode) fail("Invalid STRIPE_SECRET_KEY format");
if (!pubMode) fail("Invalid STRIPE_PUBLISHABLE_KEY format");
if (secretMode && pubMode && secretMode !== pubMode) {
  fail(`Key mode mismatch: secret=${secretMode}, publishable=${pubMode}`);
}

if (secretMode && pubMode && secretMode === pubMode) {
  pass(`Stripe mode: ${secretMode.toUpperCase()}`);
}

if (isProd && secretMode === "test") {
  fail("NODE_ENV=production requires sk_live_ / pk_live_ keys");
}
if (!isProd && secretMode === "live") {
  warn("LIVE keys in development — checkout will charge real cards");
}

if (isProd && secretMode === "live" && !webhook.startsWith("whsec_")) {
  fail("STRIPE_WEBHOOK_SECRET required for production (live webhook signing secret)");
} else if (webhook.startsWith("whsec_")) {
  pass("Webhook signing secret configured");
} else {
  warn("STRIPE_WEBHOOK_SECRET not set — webhooks will fail until configured");
}

if (siteUrl) {
  pass(`SITE_URL=${siteUrl}`);
} else if (isProd) {
  warn("SITE_URL not set — set to https://your-domain.com");
}

if (!secretMode) {
  console.log("\nFix .env and re-run: npm run stripe:verify\n");
  process.exit(1);
}

const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });

try {
  const account = await stripe.accounts.retrieve();
  pass(`Stripe account: ${account.settings?.dashboard?.display_name || account.id}`);
  if (account.charges_enabled === false) {
    warn("Charges not enabled yet — complete Stripe account activation");
  } else {
    pass("Charges enabled on account");
  }
} catch (err) {
  fail(`Cannot reach Stripe API: ${err.message}`);
}

for (const [envKey, spec] of Object.entries(EXPECTED)) {
  const priceId = String(process.env[envKey] || "").trim();
  if (!priceId || priceId.includes("REPLACE")) {
    fail(`${envKey} not set — run: npm run stripe:setup`);
    continue;
  }
  try {
    const price = await stripe.prices.retrieve(priceId);
    if (price.livemode !== (secretMode === "live")) {
      fail(
        `${envKey}=${priceId} is ${price.livemode ? "LIVE" : "TEST"} but your secret key is ${secretMode.toUpperCase()}`,
      );
      continue;
    }
    if (price.type !== "recurring" || price.recurring?.interval !== "month") {
      fail(`${envKey} must be a monthly recurring price`);
      continue;
    }
    if (price.currency !== "usd") {
      warn(`${envKey} currency is ${price.currency} (expected usd)`);
    }
    if (price.unit_amount !== spec.amount) {
      warn(
        `${envKey} amount is $${(price.unit_amount / 100).toFixed(2)} (catalog expects $${(spec.amount / 100).toFixed(2)})`,
      );
    }
    pass(`${spec.label} price OK (${priceId}, $${(price.unit_amount / 100).toFixed(2)}/mo)`);
  } catch (err) {
    fail(`${envKey} invalid: ${err.message}`);
  }
}

console.log("");
if (failed) {
  console.log("Verification FAILED — fix errors above before accepting live payments.\n");
  process.exit(1);
}

console.log("Verification PASSED — Stripe is configured for checkout.\n");
if (secretMode === "live") {
  console.log("Live checklist:");
  console.log("  1. Webhook URL: https://YOUR_DOMAIN/api/stripe-webhook");
  console.log("  2. Events: checkout.session.completed, customer.subscription.*, invoice.paid, invoice.payment_failed");
  console.log("  3. Easypanel: set all STRIPE_* vars + SITE_URL + NODE_ENV=production");
  console.log("  4. Redeploy after changing environment variables\n");
}
