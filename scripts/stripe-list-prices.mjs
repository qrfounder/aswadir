#!/usr/bin/env node
/**
 * List recurring prices in your Stripe account (for .env setup).
 * Usage: node scripts/stripe-list-prices.mjs
 * Requires STRIPE_SECRET_KEY in .env
 */
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env") });

const key = process.env.STRIPE_SECRET_KEY;
if (!key || key.includes("REPLACE")) {
  console.error("Set STRIPE_SECRET_KEY in .env first.");
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: "2024-06-20" });
const prices = await stripe.prices.list({ active: true, limit: 20, expand: ["data.product"] });

console.log("\nRecurring prices in your Stripe account:\n");
for (const p of prices.data) {
  if (p.type !== "recurring") continue;
  const product = p.product;
  const name = typeof product === "object" ? product.name : p.product;
  const amount = p.unit_amount ? `${p.unit_amount / 100} ${p.currency?.toUpperCase()}` : "?";
  console.log(`  ${name}`);
  console.log(`    price id: ${p.id}`);
  console.log(`    ${amount} / ${p.recurring?.interval}\n`);
}

console.log("Add to .env / Easypanel:");
console.log("  STRIPE_PRICE_HABIT=price_...");
console.log("  STRIPE_PRICE_TASK=price_...");
console.log("  STRIPE_PRICE_BUNDLE=price_...");
console.log("  STRIPE_TRIAL_DAYS=1\n");
