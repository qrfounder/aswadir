import express from "express";
import compression from "compression";
import path from "node:path";
import { fileURLToPath } from "node:url";

import createPaymentIntent from "./api/createPaymentIntent.js";
import stripeWebhook from "./api/stripe-webhook.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(compression());

app.post(
  "/api/stripe-webhook",
  express.raw({ type: "application/json", limit: "1mb" }),
  stripeWebhook,
);

app.use(express.json({ limit: "100kb" }));

app.post("/api/createPaymentIntent", createPaymentIntent);

app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/config", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
  });
});

const distPath = path.join(__dirname, "dist");
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
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, HOST, () => {
  console.log(`Massar server listening on http://${HOST}:${PORT}`);
});
