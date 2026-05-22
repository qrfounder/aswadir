import { getDb } from "./db.js";
import { publicUser } from "./auth-handlers.js";
import { subscriptionForClient } from "./subscriptions.js";
import {
  clearAnalyticsEvents,
  eventCountsSince,
  listRecentEvents,
  listVisitors,
  pageViewsByPath,
  trafficBreakdown,
} from "./analytics-store.js";
import { getCatalog } from "./catalog.js";

function parseMetadata(row) {
  if (!row?.metadata) return null;
  try {
    return JSON.parse(row.metadata);
  } catch {
    return row.metadata;
  }
}

function mapEvent(row) {
  return {
    id: row.id,
    eventType: row.event_type,
    sessionId: row.session_id,
    userId: row.user_id,
    path: row.path,
    productId: row.product_id,
    locale: row.locale,
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    referrer: row.referrer,
    country: row.country,
    ipAddress: row.ip_address,
    city: row.city,
    region: row.region,
    metadata: parseMetadata(row),
    createdAt: row.created_at,
  };
}

function formatVisitorLabel(row) {
  const parts = [row.city, row.region, row.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "Unknown";
}

export function handleAdminOverview(_req, res) {
  const db = getDb();

  const users = db.prepare(`SELECT COUNT(*) AS c FROM users`).get().c;
  const paidPurchases = db
    .prepare(`SELECT COUNT(*) AS c, COALESCE(SUM(amount), 0) AS revenue FROM purchases WHERE status = 'paid'`)
    .get();
  const pendingPurchases = db
    .prepare(`SELECT COUNT(*) AS c FROM purchases WHERE status = 'pending'`)
    .get().c;
  const unclaimed = db
    .prepare(`SELECT COUNT(*) AS c FROM purchases WHERE status = 'paid' AND user_id IS NULL`)
    .get().c;
  const activeSubs = db
    .prepare(
      `SELECT COUNT(*) AS c FROM subscriptions WHERE status IN ('active', 'trialing', 'past_due')`,
    )
    .get().c;
  const events24h = db
    .prepare(`SELECT COUNT(*) AS c FROM analytics_events WHERE created_at >= datetime('now', '-24 hours')`)
    .get().c;
  const pageViews24h = db
    .prepare(
      `SELECT COUNT(*) AS c FROM analytics_events
       WHERE event_type = 'page_view' AND created_at >= datetime('now', '-24 hours')`,
    )
    .get().c;

  const recentUsers = db
    .prepare(`SELECT * FROM users ORDER BY created_at DESC LIMIT 8`)
    .all()
    .map(publicUser);

  const recentPaid = db
    .prepare(
      `SELECT payment_intent_id, product_id, product_name, amount, currency, customer_email,
              customer_name, status, paid_at, user_id
       FROM purchases WHERE status = 'paid' ORDER BY paid_at DESC LIMIT 8`,
    )
    .all();

  return res.status(200).json({
    stats: {
      users,
      paidPurchases: paidPurchases.c,
      revenueCents: paidPurchases.revenue,
      pendingPurchases,
      unclaimedPaid: unclaimed,
      activeSubscriptions: activeSubs,
      events24h,
      pageViews24h,
    },
    eventBreakdown: eventCountsSince(24),
    recentUsers,
    recentPurchases: recentPaid,
    products: Object.keys(getCatalog()),
    siteUrl: process.env.SITE_URL || "",
  });
}

export function handleAdminLive(req, res) {
  const since = req.query.since || null;
  const limit = req.query.limit;
  const rows = listRecentEvents({ since, limit });
  return res.status(200).json({
    events: rows.map(mapEvent),
    serverTime: new Date().toISOString(),
  });
}

export function handleAdminUsers(req, res) {
  const db = getDb();
  const q = String(req.query.q || "").trim().toLowerCase();
  const limit = Math.min(Number(req.query.limit) || 100, 500);

  let rows;
  if (q) {
    rows = db
      .prepare(
        `SELECT u.*,
          (SELECT COUNT(*) FROM entitlements e WHERE e.user_id = u.id) AS entitlement_count,
          (SELECT status FROM subscriptions s WHERE s.user_id = u.id
           ORDER BY updated_at DESC LIMIT 1) AS sub_status
         FROM users u
         WHERE LOWER(u.email) LIKE ? OR LOWER(u.name) LIKE ?
         ORDER BY u.created_at DESC LIMIT ?`,
      )
      .all(`%${q}%`, `%${q}%`, limit);
  } else {
    rows = db
      .prepare(
        `SELECT u.*,
          (SELECT COUNT(*) FROM entitlements e WHERE e.user_id = u.id) AS entitlement_count,
          (SELECT status FROM subscriptions s WHERE s.user_id = u.id
           ORDER BY updated_at DESC LIMIT 1) AS sub_status
         FROM users u ORDER BY u.created_at DESC LIMIT ?`,
      )
      .all(limit);
  }

  return res.status(200).json({
    users: rows.map((row) => ({
      ...publicUser(row),
      entitlementCount: row.entitlement_count,
      subscriptionStatus: row.sub_status || null,
    })),
  });
}

export function handleAdminUserDetail(req, res) {
  const db = getDb();
  const userId = req.params.id;
  const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId);
  if (!user) {
    return res.status(404).json({ error: "not_found" });
  }

  const entitlements = db
    .prepare(`SELECT product_key, created_at FROM entitlements WHERE user_id = ?`)
    .all(userId);
  const purchases = db
    .prepare(`SELECT * FROM purchases WHERE user_id = ? OR customer_email = ? ORDER BY created_at DESC`)
    .all(userId, user.email);
  const subscription = subscriptionForClient(
    db.prepare(`SELECT * FROM subscriptions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1`).get(userId),
  );
  const syncRows = db
    .prepare(`SELECT namespace, updated_at FROM member_tracker_data WHERE user_id = ?`)
    .all(userId);
  const notesCount = db
    .prepare(`SELECT COUNT(*) AS c FROM member_daily_notes WHERE user_id = ? AND TRIM(content) != ''`)
    .get(userId).c;

  return res.status(200).json({
    user: publicUser(user),
    entitlements,
    purchases,
    subscription,
    sync: syncRows,
    notesCount,
  });
}

export function handleAdminPurchases(req, res) {
  const db = getDb();
  const status = req.query.status;
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  let rows;
  if (status) {
    rows = db
      .prepare(
        `SELECT * FROM purchases WHERE status = ? ORDER BY created_at DESC LIMIT ?`,
      )
      .all(status, limit);
  } else {
    rows = db
      .prepare(`SELECT * FROM purchases ORDER BY created_at DESC LIMIT ?`)
      .all(limit);
  }
  return res.status(200).json({ purchases: rows });
}

export function handleAdminSubscriptions(req, res) {
  const db = getDb();
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const rows = db
    .prepare(
      `SELECT s.*, u.email, u.name
       FROM subscriptions s
       LEFT JOIN users u ON u.id = s.user_id
       ORDER BY s.updated_at DESC LIMIT ?`,
    )
    .all(limit);
  return res.status(200).json({ subscriptions: rows });
}

export function handleAdminAnalytics(req, res) {
  const hours = Number(req.query.hours) || 168;
  const visitors = listVisitors({ hours, limit: 150 }).map((row) => ({
    sessionId: row.sessionId,
    ipAddress: row.ipAddress,
    city: row.city,
    region: row.region,
    country: row.country,
    locationLabel: formatVisitorLabel(row),
    firstSeen: row.firstSeen,
    lastSeen: row.lastSeen,
    eventCount: row.eventCount,
    pageViews: row.pageViews,
  }));
  return res.status(200).json({
    eventCounts: eventCountsSince(hours),
    traffic: trafficBreakdown(hours),
    topPages: pageViewsByPath(hours),
    funnel: buildFunnel(hours),
    visitors,
    visitorCount: visitors.length,
  });
}

export function handleAdminResetAnalytics(_req, res) {
  const result = clearAnalyticsEvents();
  return res.status(200).json({
    ok: true,
    deleted: result.deleted,
    message: `Cleared ${result.deleted} analytics events. New visitors will be tracked with IP and location.`,
  });
}

function buildFunnel(hours) {
  const db = getDb();
  const window = `-${hours} hours`;
  const types = [
    "page_view",
    "checkout_view",
    "add_to_cart",
    "checkout_started",
    "add_payment_info",
    "payment_success",
  ];
  const counts = {};
  for (const type of types) {
    counts[type] =
      db
        .prepare(
          `SELECT COUNT(DISTINCT session_id) AS c FROM analytics_events
           WHERE event_type = ? AND created_at >= datetime('now', ?) AND session_id IS NOT NULL`,
        )
        .get(type, window)?.c || 0;
  }
  return counts;
}

export function handleAdminCampaignLinks(_req, res) {
  const base = (process.env.SITE_URL || "").replace(/\/$/, "");
  const products = ["bundle"];
  const locales = ["en", "ar", "th"];
  const utmPresets = [
    { source: "facebook", medium: "paid", campaign: "massar_launch" },
    { source: "instagram", medium: "paid", campaign: "massar_launch" },
    { source: "tiktok", medium: "paid", campaign: "massar_launch" },
    { source: "google", medium: "cpc", campaign: "massar_search" },
  ];

  const links = [];

  for (const locale of locales) {
    for (const preset of utmPresets) {
      const params = new URLSearchParams({
        lang: locale,
        utm_source: preset.source,
        utm_medium: preset.medium,
        utm_campaign: preset.campaign,
      });
      links.push({
        id: `landing-${locale}-${preset.source}`,
        label: `Landing · ${locale.toUpperCase()} · ${preset.source}`,
        locale,
        productId: null,
        page: "landing",
        url: `${base}/?${params}`,
      });
    }

    for (const productId of products) {
      const params = new URLSearchParams({
        lang: locale,
        product: productId,
        utm_source: "direct",
        utm_medium: "admin",
        utm_campaign: `product_${productId}`,
      });
      links.push({
        id: `checkout-${productId}-${locale}`,
        label: `Checkout · ${productId} · ${locale.toUpperCase()}`,
        locale,
        productId,
        page: "checkout",
        url: `${base}/checkout?${params}`,
      });
    }
  }

  return res.status(200).json({ baseUrl: base, links });
}
