import "dotenv/config";
import express from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import createPaymentIntent from "./api/createPaymentIntent.js";
import createCheckoutSession from "./api/createCheckoutSession.js";
import completeCheckout from "./api/complete-checkout.js";
import createBillingPortal from "./api/billingPortal.js";
import stripeWebhook from "./api/stripe-webhook.js";
import { handleDevSimulateOrder } from "./api/dev-handlers.js";
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleMe,
  handleClaimPurchase,
} from "./api/auth-handlers.js";
import { handleDashboard } from "./api/member-handlers.js";
import { getDb, getDbError } from "./api/db.js";
import { isStripeConfigured, validateStripeEnvironment } from "./api/stripe-config.js";
import { handleLocaleDetect } from "./api/locale-detect.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const distPath = path.join(__dirname, "dist");
const indexHtml = path.join(distPath, "index.html");

if (!fs.existsSync(indexHtml)) {
  console.error(
    `[massar] Missing ${indexHtml} — run npm run build before starting the server`,
  );
}

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(compression());
app.use(cookieParser());

app.get("/api/stripe-webhook", (_req, res) => {
  res.status(200).json({
    ok: true,
    message:
      "Stripe webhook is active. Stripe sends POST requests here (not browser visits). Configure this URL in Stripe Dashboard → Webhooks.",
  });
});

app.post(
  "/api/stripe-webhook",
  express.raw({ type: "application/json", limit: "1mb" }),
  stripeWebhook,
);

app.use(express.json({ limit: "100kb" }));

app.post("/api/createPaymentIntent", createPaymentIntent);
app.post("/api/createCheckoutSession", createCheckoutSession);
app.get("/api/checkout/complete", completeCheckout);
app.post("/api/checkout/complete", completeCheckout);
app.post("/api/billingPortal", createBillingPortal);
app.post("/api/dev/simulate-order", handleDevSimulateOrder);

app.post("/api/auth/register", handleRegister);
app.post("/api/auth/login", handleLogin);
app.post("/api/auth/logout", handleLogout);
app.get("/api/auth/me", handleMe);
app.post("/api/auth/claim-purchase", handleClaimPurchase);

app.get("/api/member/dashboard", handleDashboard);
app.get("/api/locale/detect", handleLocaleDetect);

app.get("/api/health", (_req, res) => {
  const dbError = getDbError();
  const stripeCheck = validateStripeEnvironment();
  res.status(200).json({
    ok: true,
    server: "up",
    build: "launch-campaign-v1",
    db: dbError ? "error" : "ok",
    dbError: dbError || undefined,
    dist: fs.existsSync(path.join(distPath, "index.html")),
    payments: isStripeConfigured(),
    stripeMode: stripeCheck.mode,
    stripeReady: stripeCheck.ok,
    stripeWarnings: stripeCheck.warnings.length ? stripeCheck.warnings : undefined,
    time: new Date().toISOString(),
  });
});

app.get("/api/config", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const key = process.env.STRIPE_PUBLISHABLE_KEY || "";
  const publishable =
    key && !key.includes("REPLACE") && (key.startsWith("pk_test_") || key.startsWith("pk_live_"))
      ? key
      : "";
  res.status(200).json({
    stripePublishableKey: publishable,
    paymentsEnabled: isStripeConfigured(),
  });
});

app.use(
  express.static(distPath, {
    maxAge: "1y",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("index.html")) {
        res.setHeader("Cache-Control", "no-cache");
      }
      if (filePath.includes(".well-known")) {
        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  }),
);

app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) next(err);
  });
});

app.use((err, _req, res, _next) => {
  console.error("[massar] request error:", err);
  if (res.headersSent) return;
  res.status(500).send("Internal Server Error");
});

process.on("uncaughtException", (err) => {
  console.error("[massar] uncaughtException:", err);
});
process.on("unhandledRejection", (err) => {
  console.error("[massar] unhandledRejection:", err);
});

try {
  getDb();
  console.log("[massar] database ready");
} catch (err) {
  console.error("[massar] database init failed (API routes may fail):", err);
}

app.listen(PORT, HOST, () => {
  console.log(`Massar server listening on http://${HOST}:${PORT} (PORT=${PORT})`);
  const stripe = validateStripeEnvironment();
  if (stripe.mode) {
    console.log(`[massar] Stripe mode: ${stripe.mode}${isStripeConfigured() ? " (payments on)" : " (payments off)"}`);
  }
  for (const w of stripe.warnings) console.warn(`[massar] Stripe warning: ${w}`);
  for (const e of stripe.errors) console.error(`[massar] Stripe error: ${e}`);
});
