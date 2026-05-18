import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { getDb } from "./db.js";
import {
  claimCheckoutSessionForUser,
  claimPurchaseForUser,
  getUserEntitlements,
  getUserPurchases,
} from "./purchases.js";
import {
  getActiveSubscriptionForUser,
  repairEntitlementsForUser,
  subscriptionForClient,
} from "./subscriptions.js";
import {
  createSession,
  destroySession,
  getSessionCookieName,
  getUserIdFromSession,
  sessionCookieOptions,
} from "./session.js";

const SALT_ROUNDS = 12;

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    whatsapp: row.whatsapp,
    createdAt: row.created_at,
  };
}

export async function handleChangePassword(req, res) {
  const sessionId = req.cookies?.[getSessionCookieName()];
  const userId = getUserIdFromSession(sessionId);
  if (!userId) {
    return res.status(401).json({ error: "unauthenticated" });
  }

  const { currentPassword, newPassword } = req.body || {};
  const current = String(currentPassword || "");
  const next = String(newPassword || "");

  if (next.length < 8) {
    return res.status(400).json({ error: "weak_password" });
  }
  if (!current) {
    return res.status(400).json({ error: "invalid_credentials" });
  }

  const db = getDb();
  const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId);
  if (!user) {
    return res.status(401).json({ error: "unauthenticated" });
  }

  const match = await bcrypt.compare(current, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const passwordHash = await bcrypt.hash(next, SALT_ROUNDS);
  db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(passwordHash, userId);

  return res.status(200).json({ ok: true });
}

export function attachSession(res, sessionId, expiresAt) {
  res.cookie(getSessionCookieName(), sessionId, sessionCookieOptions(expiresAt));
}

export async function handleRegister(req, res) {
  const { email, password, name, paymentIntentId, checkoutSessionId, whatsapp } = req.body || {};
  const cleanEmail = normalizeEmail(email);
  const cleanName = String(name || "").trim();
  const cleanPassword = String(password || "");

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: "invalid_email" });
  }
  if (cleanPassword.length < 8) {
    return res.status(400).json({ error: "weak_password" });
  }
  if (cleanName.length < 2) {
    return res.status(400).json({ error: "invalid_name" });
  }
  if (!paymentIntentId && !checkoutSessionId) {
    return res.status(400).json({ error: "payment_intent_required" });
  }

  const db = getDb();
  const existing = db.prepare(`SELECT id FROM users WHERE email = ?`).get(cleanEmail);
  if (existing) {
    return res.status(409).json({ error: "email_in_use" });
  }

  const userId = randomUUID();
  const passwordHash = await bcrypt.hash(cleanPassword, SALT_ROUNDS);

  try {
    db.prepare(
      `INSERT INTO users (id, email, password_hash, name, whatsapp) VALUES (?, ?, ?, ?, ?)`,
    ).run(userId, cleanEmail, passwordHash, cleanName, whatsapp || null);
  } catch {
    return res.status(409).json({ error: "email_in_use" });
  }

  const claim = checkoutSessionId
    ? claimCheckoutSessionForUser(checkoutSessionId, userId)
    : claimPurchaseForUser(paymentIntentId, userId);
  if (!claim.ok) {
    db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
    return res.status(400).json({ error: claim.error });
  }

  const { sessionId, expiresAt } = createSession(userId);
  attachSession(res, sessionId, expiresAt);

  repairEntitlementsForUser(userId);
  const sub = getActiveSubscriptionForUser(userId);

  return res.status(201).json({
    user: publicUser(db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId)),
    entitlements: getUserEntitlements(userId),
    subscription: subscriptionForClient(sub),
  });
}

export async function handleLogin(req, res) {
  const { email, password } = req.body || {};
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = String(password || "");

  if (!cleanEmail || !cleanPassword) {
    return res.status(400).json({ error: "invalid_credentials" });
  }

  const db = getDb();
  const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(cleanEmail);
  if (!user) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const match = await bcrypt.compare(cleanPassword, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const { sessionId, expiresAt } = createSession(user.id);
  attachSession(res, sessionId, expiresAt);

  repairEntitlementsForUser(user.id);
  const sub = getActiveSubscriptionForUser(user.id);

  return res.status(200).json({
    user: publicUser(user),
    entitlements: getUserEntitlements(user.id),
    purchases: getUserPurchases(user.id),
    subscription: subscriptionForClient(sub),
  });
}

export function handleLogout(req, res) {
  const sessionId = req.cookies?.[getSessionCookieName()];
  if (sessionId) destroySession(sessionId);
  res.clearCookie(getSessionCookieName(), { path: "/" });
  return res.status(200).json({ ok: true });
}

export function handleMe(req, res) {
  const sessionId = req.cookies?.[getSessionCookieName()];
  const userId = getUserIdFromSession(sessionId);
  if (!userId) {
    return res.status(401).json({ error: "unauthenticated" });
  }

  const db = getDb();
  const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId);
  if (!user) {
    return res.status(401).json({ error: "unauthenticated" });
  }

  repairEntitlementsForUser(userId);
  const sub = getActiveSubscriptionForUser(userId);

  return res.status(200).json({
    user: publicUser(user),
    entitlements: getUserEntitlements(userId),
    purchases: getUserPurchases(userId),
    subscription: subscriptionForClient(sub),
  });
}

export async function handleClaimPurchase(req, res) {
  const sessionId = req.cookies?.[getSessionCookieName()];
  const userId = getUserIdFromSession(sessionId);
  if (!userId) {
    return res.status(401).json({ error: "unauthenticated" });
  }

  const { paymentIntentId, checkoutSessionId } = req.body || {};
  if (!paymentIntentId && !checkoutSessionId) {
    return res.status(400).json({ error: "payment_intent_required" });
  }

  const claim = checkoutSessionId
    ? claimCheckoutSessionForUser(checkoutSessionId, userId)
    : claimPurchaseForUser(paymentIntentId, userId);
  if (!claim.ok) {
    return res.status(400).json({ error: claim.error });
  }

  repairEntitlementsForUser(userId);
  const sub = getActiveSubscriptionForUser(userId);

  return res.status(200).json({
    entitlements: getUserEntitlements(userId),
    purchases: getUserPurchases(userId),
    subscription: subscriptionForClient(sub),
  });
}
