#!/usr/bin/env node
/**
 * Pre-launch audit: routes, analytics API, tracking config.
 * Usage: node scripts/prelaunch-audit.mjs [baseUrl] [apiUrl]
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const base = (process.argv[2] || "http://127.0.0.1:5173").replace(/\/$/, "");
const api = (process.argv[3] || "http://127.0.0.1:3000").replace(/\/$/, "");

const EXPECTED_EVENTS = [
  "page_view",
  "checkout_view",
  "add_to_cart",
  "checkout_started",
  "add_payment_info",
  "payment_success",
];

const FUNNEL_STEPS = [
  "page_view",
  "checkout_view",
  "add_to_cart",
  "checkout_started",
  "add_payment_info",
  "payment_success",
];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

async function postEvent(eventType) {
  const res = await fetch(`${api}/api/analytics/event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType,
      sessionId: `audit_${Date.now()}`,
      path: "/audit",
      productId: "bundle",
      utmSource: "tiktok",
      utmMedium: "paid",
    }),
  });
  return { status: res.status, ok: res.ok, body: await res.json().catch(() => ({})) };
}

async function main() {
  console.log("Massar pre-launch audit\n");
  const issues = [];
  const ok = [];

  const store = read("api/analytics-store.js");
  for (const ev of EXPECTED_EVENTS) {
    if (store.includes(`"${ev}"`)) ok.push(`Analytics allows: ${ev}`);
    else issues.push(`Missing event type in store: ${ev}`);
  }

  const pixel = read("src/lib/tiktok-pixel.js");
  if (pixel.includes("CU1EACBC77UAQJITPDR0")) {
    ok.push("TikTok pixel ID configured (CU1EACBC77UAQJITPDR0)");
  } else {
    issues.push("TikTok pixel ID not found in tiktok-pixel.js");
  }

  if (read("src/lib/analytics-tracker.js").includes("trackPurchase")) {
    ok.push("Client purchase tracking (trackPurchase)");
  } else {
    issues.push("trackPurchase missing");
  }

  const admin = read("api/admin-handlers.js");
  for (const step of FUNNEL_STEPS) {
    if (!admin.includes(`"${step}"`)) issues.push(`Admin funnel missing: ${step}`);
  }
  if (FUNNEL_STEPS.every((s) => admin.includes(`"${s}"`))) {
    ok.push("Admin funnel includes all 6 steps");
  }

  try {
    const health = await fetch(`${api}/api/health`);
    if (health.ok) ok.push(`API health: ${api}`);
    else issues.push(`API health failed: ${health.status}`);
  } catch {
    issues.push(`API not reachable at ${api} (skip event POST tests)`);
  }

  if (!issues.some((i) => i.includes("API not reachable"))) {
    for (const ev of ["page_view", "add_payment_info", "payment_success"]) {
      const r = await postEvent(ev);
      if (r.ok) ok.push(`POST ${ev} → ${r.status}`);
      else issues.push(`POST ${ev} failed: ${r.status} ${JSON.stringify(r.body)}`);
    }
  }

  try {
    const landing = await fetch(`${base}/`);
    if (landing.ok) ok.push(`Landing HTTP ${landing.status}`);
    else issues.push(`Landing HTTP ${landing.status}`);
  } catch {
    issues.push(`Frontend not reachable at ${base}`);
  }

  console.log("OK:");
  ok.forEach((line) => console.log(`  ✓ ${line}`));
  if (issues.length) {
    console.log("\nIssues:");
    issues.forEach((line) => console.log(`  ✗ ${line}`));
    process.exit(1);
  }
  console.log("\nPre-launch tracking audit passed.");
  console.log("See docs/TRACKING.md for TikTok + Mojourney verification steps.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
