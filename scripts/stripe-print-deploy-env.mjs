#!/usr/bin/env node
/**
 * Print Stripe env vars for Easypanel copy-paste (from local .env).
 * Usage: npm run stripe:print-deploy-env
 */
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env") });

const KEYS = [
  "STRIPE_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_TASK",
  "STRIPE_PRICE_HABIT",
  "STRIPE_PRICE_BUNDLE",
  "STRIPE_TRIAL_DAYS",
  "SITE_URL",
  "NODE_ENV",
  "DATABASE_PATH",
];

console.log("\n# Paste into Easypanel → Environment (then Redeploy)\n");
for (const key of KEYS) {
  let val = process.env[key];
  if (key === "SITE_URL" && !val?.includes("aswadir")) {
    val = "https://aswadir.store";
  }
  if (key === "NODE_ENV") val = "production";
  if (key === "DATABASE_PATH" && !val) val = "/app/data/massar.db";
  if (!val) {
    console.log(`# ${key}=  ← MISSING in .env`);
    continue;
  }
  if (key.includes("SECRET") || key === "STRIPE_SECRET_KEY") {
    console.log(`${key}=${val.slice(0, 12)}…  # (full value in your .env — copy manually)`);
  } else {
    console.log(`${key}=${val}`);
  }
}
console.log("\n# After deploy, verify: https://aswadir.store/api/health");
console.log("# stripeReady must be true and stripePrices must start with price_1TYQQ (live)\n");
