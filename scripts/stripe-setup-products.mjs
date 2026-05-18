#!/usr/bin/env node
/**
 * Create Massar subscription products + monthly USD prices in Stripe.
 * Uses whatever mode your STRIPE_SECRET_KEY is in (sk_test_ → test, sk_live_ → live).
 * Idempotent: re-run safe — reuses products by metadata.massar_product_id.
 *
 * Usage:
 *   npm run stripe:setup          # with sk_test_ in .env
 *   npm run stripe:setup        # with sk_live_ in .env (creates LIVE products)
 */
import dotenv from "dotenv";
import Stripe from "stripe";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

const envFile = loadEnvFile(path.join(root, ".env"));
Object.assign(process.env, envFile);
dotenv.config({ path: path.join(root, ".env") });

/** Global USD pricing — 1-day trial applied at checkout (not on Price). */
const PLANS = [
  {
    id: "task",
    name: "Massar — Task Tracker | متتبع المهام",
    description: "Daily & weekly task board — $4.99/mo after 1-day free trial.",
    amountCents: 499,
    envKey: "STRIPE_PRICE_TASK",
  },
  {
    id: "habit",
    name: "Massar — Habit Tracker | متتبع العادات",
    description: "Habit grid, streaks, mood — $4.99/mo after 1-day free trial.",
    amountCents: 499,
    envKey: "STRIPE_PRICE_HABIT",
  },
  {
    id: "bundle",
    name: "Massar — Full Bundle | الباقة الكاملة",
    description: "Habits + tasks + member dashboard — $9.99/mo after 1-day free trial.",
    amountCents: 999,
    envKey: "STRIPE_PRICE_BUNDLE",
  },
];

const key = process.env.STRIPE_SECRET_KEY;
if (!key || key.includes("REPLACE")) {
  console.error("Add STRIPE_SECRET_KEY to .env first.");
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: "2024-06-20" });

async function findProductByMassarId(massarId) {
  const list = await stripe.products.search({
    query: `metadata['massar_product_id']:'${massarId}'`,
    limit: 1,
  });
  return list.data[0] || null;
}

async function ensureProduct(plan) {
  let product = await findProductByMassarId(plan.id);
  if (!product) {
    product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: { massar_product_id: plan.id },
    });
    console.log(`  Created product: ${plan.id} → ${product.id}`);
  } else {
    await stripe.products.update(product.id, {
      name: plan.name,
      description: plan.description,
    });
    console.log(`  Found product: ${plan.id} → ${product.id}`);
  }
  return product;
}

async function ensureMonthlyPrice(product, plan) {
  const existing = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 20,
  });
  const match = existing.data.find(
    (p) =>
      p.type === "recurring" &&
      p.currency === "usd" &&
      p.unit_amount === plan.amountCents &&
      p.recurring?.interval === "month",
  );
  if (match) {
    console.log(`  Price exists: ${match.id} ($${(plan.amountCents / 100).toFixed(2)} USD/month)`);
    return match;
  }
  const price = await stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: plan.amountCents,
    recurring: { interval: "month" },
    metadata: { massar_product_id: plan.id },
  });
  console.log(`  Created price: ${price.id} ($${(plan.amountCents / 100).toFixed(2)} USD/month)`);
  return price;
}

const mode = key.startsWith("sk_live_") ? "LIVE" : "TEST";
console.log(`\nMassar Stripe setup — global USD pricing (${mode} mode)\n`);
if (mode === "LIVE") {
  console.warn("⚠  LIVE mode: products/prices will accept real money after deploy.\n");
}

const priceIds = {};
for (const plan of PLANS) {
  console.log(`\n[${plan.id}]`);
  const product = await ensureProduct(plan);
  const price = await ensureMonthlyPrice(product, plan);
  priceIds[plan.envKey] = price.id;
}

console.log("\n--- Add to .env and Easypanel ---\n");
for (const [envKey, priceId] of Object.entries(priceIds)) {
  console.log(`${envKey}=${priceId}`);
}
console.log(`STRIPE_TRIAL_DAYS=${process.env.STRIPE_TRIAL_DAYS || "1"}`);
console.log("\n1-day free trial is applied at checkout (subscription_data.trial_period_days).\n");

const envPath = path.join(root, ".env");
if (fs.existsSync(envPath)) {
  let env = fs.readFileSync(envPath, "utf8");
  for (const [envKey, priceId] of Object.entries(priceIds)) {
    const re = new RegExp(`^${envKey}=.*$`, "m");
    if (re.test(env)) {
      env = env.replace(re, `${envKey}=${priceId}`);
    } else {
      env += `\n${envKey}=${priceId}`;
    }
  }
  fs.writeFileSync(envPath, env);
  console.log("Updated .env with Price IDs.\n");
}
