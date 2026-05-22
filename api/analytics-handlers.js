import { insertAnalyticsEvent } from "./analytics-store.js";

export function handleAnalyticsEvent(req, res) {
  const body = req.body || {};
  try {
  const result = insertAnalyticsEvent({
    eventType: body.eventType,
    sessionId: body.sessionId,
    userId: body.userId,
    path: body.path,
    productId: body.productId,
    locale: body.locale,
    utmSource: body.utmSource,
    utmMedium: body.utmMedium,
    utmCampaign: body.utmCampaign,
    utmContent: body.utmContent,
    utmTerm: body.utmTerm,
    referrer: body.referrer,
    country: body.country,
    metadata: body.metadata,
  });

  if (!result.ok) {
    return res.status(400).json({ error: result.error || "invalid_event" });
  }
  return res.status(201).json({ ok: true, id: result.id });
  } catch (err) {
    console.error("[massar] analytics event failed:", err?.message || err);
    return res.status(500).json({ error: "analytics_store_failed" });
  }
}
