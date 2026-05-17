import Stripe from "stripe";
import { getActiveSubscriptionForUser } from "./subscriptions.js";
import { getDb } from "./db.js";
import { getSessionCookieName, getUserIdFromSession } from "./session.js";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return `${proto}://${host}`;
}

export default async function createBillingPortal(req, res) {
  try {
    const userId = getUserIdFromSession(req.cookies?.[getSessionCookieName()]);
    if (!userId) {
      return res.status(401).json({ error: "unauthenticated" });
    }

    const sub = getActiveSubscriptionForUser(userId);
    if (!sub?.stripe_customer_id) {
      return res.status(400).json({ error: "no_subscription" });
    }

    const db = getDb();
    db.prepare(`UPDATE users SET stripe_customer_id = ? WHERE id = ?`).run(
      sub.stripe_customer_id,
      userId,
    );

    const portal = await getStripe().billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${siteUrl(req)}/dashboard`,
    });

    return res.status(200).json({ url: portal.url });
  } catch (err) {
    console.error("[billingPortal]", err);
    return res.status(500).json({ error: err.message || "server_error" });
  }
}
