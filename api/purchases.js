import { randomUUID } from "node:crypto";
import { getDb } from "./db.js";
import { entitlementsForProduct } from "./catalog.js";

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

export function getPurchase(paymentIntentId) {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM purchases WHERE payment_intent_id = ?`)
    .get(paymentIntentId);
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

export function claimPurchaseForUser(paymentIntentId, userId) {
  const db = getDb();
  const purchase = getPurchase(paymentIntentId);
  if (!purchase) return { ok: false, error: "purchase_not_found" };
  if (purchase.status !== "paid") return { ok: false, error: "payment_not_confirmed" };
  if (purchase.user_id && purchase.user_id !== userId) {
    return { ok: false, error: "purchase_already_claimed" };
  }

  const claim = db.transaction(() => {
    db.prepare(
      `UPDATE purchases SET user_id = ? WHERE payment_intent_id = ?`,
    ).run(userId, paymentIntentId);

    const keys = entitlementsForProduct(purchase.product_id);
    const insert = db.prepare(
      `INSERT OR IGNORE INTO entitlements (user_id, product_key, source_purchase_id)
       VALUES (?, ?, ?)`,
    );
    for (const key of keys) {
      insert.run(userId, key, paymentIntentId);
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
      `SELECT payment_intent_id, product_id, product_name, amount, paid_at
       FROM purchases WHERE user_id = ? AND status = 'paid' ORDER BY paid_at DESC`,
    )
    .all(userId);
}
