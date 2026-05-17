import { randomUUID } from "node:crypto";
import { getDb } from "./db.js";
import { entitlementsForProduct } from "./catalog.js";
import {
  createDevSimulatedSubscription,
  getSubscriptionByCheckoutSession,
  linkSubscriptionToUser,
  syncEntitlementsFromSubscription,
} from "./subscriptions.js";

export function createPendingPurchase({
  paymentIntentId,
  productId,
  productName,
  amount,
  customerName,
  customerEmail,
  whatsapp,
}) {
  const db = getDb();
  db.prepare(
    `INSERT INTO purchases (
      payment_intent_id, product_id, product_name, amount,
      customer_name, customer_email, whatsapp, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    ON CONFLICT(payment_intent_id) DO NOTHING`,
  ).run(
    paymentIntentId,
    productId,
    productName,
    amount,
    customerName,
    customerEmail || null,
    whatsapp || null,
  );
}

export function createPendingCheckout({
  checkoutSessionId,
  productId,
  productName,
  amount,
  customerName,
  customerEmail,
  whatsapp,
}) {
  const db = getDb();
  const ref = checkoutSessionId;
  db.prepare(
    `INSERT INTO purchases (
      payment_intent_id, checkout_session_id, product_id, product_name, amount,
      customer_name, customer_email, whatsapp, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    ON CONFLICT(payment_intent_id) DO NOTHING`,
  ).run(
    ref,
    checkoutSessionId,
    productId,
    productName,
    amount,
    customerName,
    customerEmail || null,
    whatsapp || null,
  );
}

export function markPurchasePaid(paymentIntentId) {
  const db = getDb();
  const result = db
    .prepare(
      `UPDATE purchases
       SET status = 'paid', paid_at = datetime('now')
       WHERE payment_intent_id = ? AND status != 'paid'`,
    )
    .run(paymentIntentId);
  return result.changes > 0;
}

export function markCheckoutPaid(checkoutSessionId, { subscriptionId } = {}) {
  const db = getDb();
  const result = db
    .prepare(
      `UPDATE purchases
       SET status = 'paid', paid_at = datetime('now'), subscription_id = COALESCE(?, subscription_id)
       WHERE checkout_session_id = ? AND status != 'paid'`,
    )
    .run(subscriptionId || null, checkoutSessionId);
  return result.changes > 0;
}

export function getPurchase(paymentIntentId) {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM purchases WHERE payment_intent_id = ?`)
    .get(paymentIntentId);
}

export function getPurchaseByCheckoutSession(checkoutSessionId) {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM purchases WHERE checkout_session_id = ?`)
    .get(checkoutSessionId);
}

export function getPurchaseByRef(ref) {
  return getPurchase(ref) || getPurchaseByCheckoutSession(ref);
}

export function createDevSimulatedPurchase({ productId, productName, amount, customerName, customerEmail, whatsapp }) {
  const paymentIntentId = `dev_${randomUUID()}`;
  const db = getDb();
  db.prepare(
    `INSERT INTO purchases (
      payment_intent_id, product_id, product_name, amount,
      customer_name, customer_email, whatsapp, status, paid_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'paid', datetime('now'))`,
  ).run(
    paymentIntentId,
    productId,
    productName,
    amount,
    customerName,
    customerEmail,
    whatsapp || null,
  );
  return paymentIntentId;
}

function grantEntitlementsForPurchase(userId, purchase) {
  const db = getDb();
  const keys = entitlementsForProduct(purchase.product_id);
  const sourceRef = purchase.subscription_id || purchase.checkout_session_id || purchase.payment_intent_id;
  const insert = db.prepare(
    `INSERT OR IGNORE INTO entitlements (user_id, product_key, source_purchase_id)
     VALUES (?, ?, ?)`,
  );
  for (const key of keys) {
    insert.run(userId, key, sourceRef);
  }
}

export function claimPurchaseForUser(paymentIntentId, userId) {
  const purchase = getPurchase(paymentIntentId);
  if (!purchase) return { ok: false, error: "purchase_not_found" };
  if (purchase.status !== "paid") return { ok: false, error: "payment_not_confirmed" };
  if (purchase.user_id && purchase.user_id !== userId) {
    return { ok: false, error: "purchase_already_claimed" };
  }

  const db = getDb();
  const claim = db.transaction(() => {
    db.prepare(`UPDATE purchases SET user_id = ? WHERE payment_intent_id = ?`).run(
      userId,
      paymentIntentId,
    );
    grantEntitlementsForPurchase(userId, purchase);

    const sub = purchase.checkout_session_id
      ? getSubscriptionByCheckoutSession(purchase.checkout_session_id)
      : null;
    if (sub) {
      linkSubscriptionToUser(sub.stripe_subscription_id, userId);
      syncEntitlementsFromSubscription({ ...sub, user_id: userId });
    }
  });
  claim();
  return { ok: true, purchase };
}

export function claimCheckoutSessionForUser(checkoutSessionId, userId) {
  const purchase = getPurchaseByCheckoutSession(checkoutSessionId);
  if (!purchase) return { ok: false, error: "purchase_not_found" };
  if (purchase.status !== "paid") return { ok: false, error: "payment_not_confirmed" };
  if (purchase.user_id && purchase.user_id !== userId) {
    return { ok: false, error: "purchase_already_claimed" };
  }

  const db = getDb();
  const claim = db.transaction(() => {
    db.prepare(`UPDATE purchases SET user_id = ? WHERE checkout_session_id = ?`).run(
      userId,
      checkoutSessionId,
    );
    grantEntitlementsForPurchase(userId, purchase);

    const sub = getSubscriptionByCheckoutSession(checkoutSessionId);
    if (sub) {
      linkSubscriptionToUser(sub.stripe_subscription_id, userId);
      syncEntitlementsFromSubscription({ ...sub, user_id: userId });
    }
  });
  claim();
  return { ok: true, purchase };
}

export function grantEntitlementsForUser(userId, productId, paymentIntentId) {
  const db = getDb();
  const keys = entitlementsForProduct(productId);
  const insert = db.prepare(
    `INSERT OR IGNORE INTO entitlements (user_id, product_key, source_purchase_id)
     VALUES (?, ?, ?)`,
  );
  for (const key of keys) {
    insert.run(userId, key, paymentIntentId);
  }
}

export function getUserEntitlements(userId) {
  const db = getDb();
  return db
    .prepare(
      `SELECT product_key, created_at FROM entitlements WHERE user_id = ? ORDER BY created_at`,
    )
    .all(userId);
}

export function getUserPurchases(userId) {
  const db = getDb();
  return db
    .prepare(
      `SELECT payment_intent_id, checkout_session_id, product_id, product_name, amount, paid_at, subscription_id
       FROM purchases WHERE user_id = ? AND status = 'paid' ORDER BY paid_at DESC`,
    )
    .all(userId);
}

/** Dev: simulate subscription checkout without Stripe */
export function createDevSimulatedCheckout({ productId, productName, amount, customerName, customerEmail, whatsapp }) {
  const checkoutSessionId = `dev_cs_${randomUUID()}`;
  const db = getDb();
  db.prepare(
    `INSERT INTO purchases (
      payment_intent_id, checkout_session_id, product_id, product_name, amount,
      customer_name, customer_email, whatsapp, status, paid_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'paid', datetime('now'))`,
  ).run(
    checkoutSessionId,
    checkoutSessionId,
    productId,
    productName,
    amount,
    customerName,
    customerEmail,
    whatsapp || null,
  );

  createDevSimulatedSubscription({
    productId,
    checkoutSessionId,
  });

  return checkoutSessionId;
}
