import { getDb } from "./db.js";
import { entitlementsForProduct, getCatalogProduct } from "./catalog.js";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export function upsertSubscription({
  stripeSubscriptionId,
  stripeCustomerId,
  productId,
  status,
  currentPeriodEnd,
  cancelAtPeriodEnd = false,
  checkoutSessionId = null,
  userId = null,
}) {
  const db = getDb();
  db.prepare(
    `INSERT INTO subscriptions (
      stripe_subscription_id, stripe_customer_id, user_id, product_id, status,
      current_period_end, cancel_at_period_end, checkout_session_id, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(stripe_subscription_id) DO UPDATE SET
      stripe_customer_id = excluded.stripe_customer_id,
      user_id = COALESCE(excluded.user_id, subscriptions.user_id),
      product_id = excluded.product_id,
      status = excluded.status,
      current_period_end = excluded.current_period_end,
      cancel_at_period_end = excluded.cancel_at_period_end,
      checkout_session_id = COALESCE(excluded.checkout_session_id, subscriptions.checkout_session_id),
      updated_at = datetime('now')`,
  ).run(
    stripeSubscriptionId,
    stripeCustomerId,
    userId,
    productId,
    status,
    currentPeriodEnd || null,
    cancelAtPeriodEnd ? 1 : 0,
    checkoutSessionId,
  );
}

export function linkSubscriptionToUser(stripeSubscriptionId, userId) {
  const db = getDb();
  db.prepare(
    `UPDATE subscriptions SET user_id = ?, updated_at = datetime('now') WHERE stripe_subscription_id = ?`,
  ).run(userId, stripeSubscriptionId);
}

export function getSubscriptionByStripeId(stripeSubscriptionId) {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM subscriptions WHERE stripe_subscription_id = ?`)
    .get(stripeSubscriptionId);
}

export function getSubscriptionByCheckoutSession(checkoutSessionId) {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM subscriptions WHERE checkout_session_id = ?`)
    .get(checkoutSessionId);
}

export function getActiveSubscriptionForUser(userId) {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM subscriptions
       WHERE user_id = ?
         AND status IN ('active', 'trialing', 'past_due')
       ORDER BY updated_at DESC
       LIMIT 1`,
    )
    .get(userId);
}

export function syncEntitlementsFromSubscription(subscription) {
  if (!subscription?.user_id || !subscription.product_id) return;

  const db = getDb();
  const keys = entitlementsForProduct(subscription.product_id);
  const sourceRef = subscription.stripe_subscription_id;
  const isActive = ACTIVE_STATUSES.has(subscription.status);

  const tx = db.transaction(() => {
    if (isActive) {
      const insert = db.prepare(
        `INSERT OR IGNORE INTO entitlements (user_id, product_key, source_purchase_id)
         VALUES (?, ?, ?)`,
      );
      for (const key of keys) {
        insert.run(subscription.user_id, key, sourceRef);
      }
    } else if (
      subscription.status === "canceled" ||
      subscription.status === "unpaid" ||
      subscription.status === "incomplete_expired"
    ) {
      const placeholders = keys.map(() => "?").join(",");
      db.prepare(
        `DELETE FROM entitlements
         WHERE user_id = ? AND product_key IN (${placeholders}) AND source_purchase_id = ?`,
      ).run(subscription.user_id, ...keys, sourceRef);
    }
  });
  tx();
}

export function subscriptionForClient(row) {
  if (!row) return null;
  const product = getCatalogProduct(row.product_id);
  return {
    id: row.stripe_subscription_id,
    productId: row.product_id,
    productName: product?.name || row.product_id,
    status: row.status,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    isActive: ACTIVE_STATUSES.has(row.status) || row.status === "past_due",
  };
}

export function createDevSimulatedSubscription({ productId, userId = null, checkoutSessionId }) {
  const subId = `dev_sub_${Date.now()}`;
  const customerId = `dev_cus_${Date.now()}`;
  const trialDays = Number.parseInt(process.env.STRIPE_TRIAL_DAYS || "1", 10) || 1;
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + trialDays);

  upsertSubscription({
    stripeSubscriptionId: subId,
    stripeCustomerId: customerId,
    productId,
    status: "trialing",
    currentPeriodEnd: periodEnd.toISOString(),
    cancelAtPeriodEnd: false,
    checkoutSessionId,
    userId,
  });

  const sub = getSubscriptionByStripeId(subId);
  if (userId) syncEntitlementsFromSubscription(sub);
  return sub;
}
