import { randomUUID } from "node:crypto";
import { fulfillCheckoutSession } from "./checkout-fulfillment.js";
import { getDb } from "./db.js";
import {
  claimCheckoutSessionForUser,
  getPurchaseByCheckoutSession,
  getUserEntitlements,
} from "./purchases.js";
import { attachSession, publicUser } from "./auth-handlers.js";
import {
  getActiveSubscriptionForUser,
  repairEntitlementsForUser,
  subscriptionForClient,
} from "./subscriptions.js";
import { createSession } from "./session.js";

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

/**
 * After Stripe payment: create member account from checkout data + pending password hash, set session.
 */
export default async function activateCheckoutAccount(req, res) {
  try {
    const checkoutSessionId = String(
      req.body?.checkoutSessionId || req.body?.session_id || "",
    ).trim();
    if (!checkoutSessionId) {
      return res.status(400).json({ error: "session_id_required" });
    }

    const fulfill = await fulfillCheckoutSession(checkoutSessionId);
    if (!fulfill.ok || !fulfill.paid) {
      const status =
        fulfill.error === "checkout_incomplete"
          ? 409
          : fulfill.error === "payment_not_confirmed"
            ? 402
            : 400;
      return res.status(status).json({
        error: fulfill.error || "payment_not_confirmed",
      });
    }

    const db = getDb();
    let purchase = getPurchaseByCheckoutSession(checkoutSessionId);
    if (!purchase) {
      return res.status(404).json({ error: "purchase_not_found" });
    }

    if (purchase.user_id) {
      const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(purchase.user_id);
      if (!user) {
        return res.status(500).json({ error: "server_error" });
      }
      const { sessionId, expiresAt } = createSession(user.id);
      attachSession(res, sessionId, expiresAt);
      repairEntitlementsForUser(user.id);
      const entitlements = getUserEntitlements(user.id);
      if (!entitlements.length) {
        return res.status(402).json({ error: "payment_not_confirmed" });
      }
      return res.status(200).json({
        user: publicUser(user),
        entitlements,
        subscription: subscriptionForClient(getActiveSubscriptionForUser(user.id)),
        alreadyActive: true,
      });
    }

    const cleanEmail = normalizeEmail(purchase.customer_email);
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: "invalid_email" });
    }

    const existing = db.prepare(`SELECT * FROM users WHERE email = ?`).get(cleanEmail);
    if (existing) {
      const claim = claimCheckoutSessionForUser(checkoutSessionId, existing.id);
      if (!claim.ok) {
        return res.status(409).json({ error: claim.error || "email_in_use" });
      }
      db.prepare(
        `UPDATE purchases SET pending_password_hash = NULL WHERE checkout_session_id = ?`,
      ).run(checkoutSessionId);
      const { sessionId, expiresAt } = createSession(existing.id);
      attachSession(res, sessionId, expiresAt);
      repairEntitlementsForUser(existing.id);
      const entitlements = getUserEntitlements(existing.id);
      if (!entitlements.length) {
        return res.status(402).json({ error: "payment_not_confirmed" });
      }
      return res.status(200).json({
        user: publicUser(existing),
        entitlements,
        subscription: subscriptionForClient(getActiveSubscriptionForUser(existing.id)),
        linkedExisting: true,
      });
    }

    const passwordHash = purchase.pending_password_hash;
    if (!passwordHash) {
      return res.status(400).json({ error: "account_password_required" });
    }

    const cleanName = String(purchase.customer_name || "").trim() || cleanEmail.split("@")[0];
    const userId = randomUUID();

    try {
      db.prepare(
        `INSERT INTO users (id, email, password_hash, name, whatsapp) VALUES (?, ?, ?, ?, ?)`,
      ).run(userId, cleanEmail, passwordHash, cleanName, purchase.whatsapp || null);
    } catch {
      return res.status(409).json({ error: "email_in_use" });
    }

    const claim = claimCheckoutSessionForUser(checkoutSessionId, userId);
    if (!claim.ok) {
      db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
      return res.status(400).json({ error: claim.error });
    }

    db.prepare(
      `UPDATE purchases SET pending_password_hash = NULL WHERE checkout_session_id = ?`,
    ).run(checkoutSessionId);

    const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId);
    const { sessionId, expiresAt } = createSession(userId);
    attachSession(res, sessionId, expiresAt);
    repairEntitlementsForUser(userId);
    const entitlements = getUserEntitlements(userId);
    if (!entitlements.length) {
      return res.status(402).json({ error: "payment_not_confirmed" });
    }

    return res.status(201).json({
      user: publicUser(user),
      entitlements,
      subscription: subscriptionForClient(getActiveSubscriptionForUser(userId)),
    });
  } catch (err) {
    console.error("[activateCheckoutAccount]", err);
    return res.status(500).json({
      error: "server_error",
      detail: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
}
