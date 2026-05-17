import { getSessionCookieName, getUserIdFromSession } from "./session.js";
import { getDb } from "./db.js";
import { getUserEntitlements, getUserPurchases } from "./purchases.js";
import {
  getActiveSubscriptionForUser,
  subscriptionForClient,
} from "./subscriptions.js";

export function handleDashboard(req, res) {
  const sessionId = req.cookies?.[getSessionCookieName()];
  const userId = getUserIdFromSession(sessionId);
  if (!userId) {
    return res.status(401).json({ error: "unauthenticated" });
  }

  const db = getDb();
  const user = db.prepare(`SELECT id, email, name, whatsapp, created_at FROM users WHERE id = ?`).get(userId);

  const sub = getActiveSubscriptionForUser(userId);

  return res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      whatsapp: user.whatsapp,
      createdAt: user.created_at,
    },
    entitlements: getUserEntitlements(userId),
    purchases: getUserPurchases(userId),
    subscription: subscriptionForClient(sub),
  });
}
