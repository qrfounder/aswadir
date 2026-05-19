import { getDb } from "./db.js";

const ALLOWED_TYPES = new Set([
  "page_view",
  "checkout_view",
  "add_to_cart",
  "checkout_started",
  "payment_success",
  "lead_register",
  "user_login",
  "subscription_updated",
]);

export function insertAnalyticsEvent(payload) {
  const eventType = String(payload.eventType || "").trim();
  if (!ALLOWED_TYPES.has(eventType)) {
    return { ok: false, error: "invalid_event_type" };
  }

  const db = getDb();
  const metadata =
    payload.metadata && typeof payload.metadata === "object"
      ? JSON.stringify(payload.metadata)
      : payload.metadata
        ? String(payload.metadata)
        : null;

  const result = db
    .prepare(
      `INSERT INTO analytics_events (
        event_type, session_id, user_id, path, product_id, locale,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term,
        referrer, country, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      eventType,
      payload.sessionId || null,
      payload.userId || null,
      payload.path || null,
      payload.productId || null,
      payload.locale || null,
      payload.utmSource || null,
      payload.utmMedium || null,
      payload.utmCampaign || null,
      payload.utmContent || null,
      payload.utmTerm || null,
      payload.referrer || null,
      payload.country || null,
      metadata,
    );

  return { ok: true, id: result.lastInsertRowid };
}

export function recordServerEvent(eventType, fields = {}) {
  try {
    return insertAnalyticsEvent({ eventType, ...fields });
  } catch (err) {
    console.warn("[massar] analytics record failed:", err?.message || err);
    return { ok: false };
  }
}

export function listRecentEvents({ since, limit = 80 } = {}) {
  const db = getDb();
  const cap = Math.min(Math.max(Number(limit) || 80, 1), 200);
  if (since) {
    return db
      .prepare(
        `SELECT * FROM analytics_events
         WHERE created_at > ?
         ORDER BY id DESC LIMIT ?`,
      )
      .all(since, cap);
  }
  return db
    .prepare(`SELECT * FROM analytics_events ORDER BY id DESC LIMIT ?`)
    .all(cap);
}

export function eventCountsSince(hours = 24) {
  const db = getDb();
  const window = `-${Number(hours) || 24} hours`;
  return db
    .prepare(
      `SELECT event_type, COUNT(*) AS count
       FROM analytics_events
       WHERE created_at >= datetime('now', ?)
       GROUP BY event_type`,
    )
    .all(window);
}

export function trafficBreakdown(hours = 168) {
  const db = getDb();
  const window = `-${Number(hours) || 168} hours`;
  const bySource = db
    .prepare(
      `SELECT COALESCE(NULLIF(utm_source, ''), '(direct)') AS label, COUNT(*) AS count
       FROM analytics_events
       WHERE created_at >= datetime('now', ?) AND event_type = 'page_view'
       GROUP BY label ORDER BY count DESC LIMIT 20`,
    )
    .all(window);
  const byLocale = db
    .prepare(
      `SELECT COALESCE(NULLIF(locale, ''), 'unknown') AS label, COUNT(*) AS count
       FROM analytics_events
       WHERE created_at >= datetime('now', ?) AND event_type = 'page_view'
       GROUP BY label ORDER BY count DESC`,
    )
    .all(window);
  const byProduct = db
    .prepare(
      `SELECT COALESCE(NULLIF(product_id, ''), '—') AS label, COUNT(*) AS count
       FROM analytics_events
       WHERE created_at >= datetime('now', ?)
         AND event_type IN ('checkout_view', 'add_to_cart', 'checkout_started', 'payment_success')
       GROUP BY label ORDER BY count DESC`,
    )
    .all(window);
  return { bySource, byLocale, byProduct };
}

export function pageViewsByPath(hours = 168, limit = 15) {
  const db = getDb();
  return db
    .prepare(
      `SELECT path AS label, COUNT(*) AS count
       FROM analytics_events
       WHERE created_at >= datetime('now', ?) AND event_type = 'page_view' AND path IS NOT NULL
       GROUP BY path ORDER BY count DESC LIMIT ?`,
    )
    .all(`-${Number(hours) || 168} hours`, Math.min(limit, 50));
}
