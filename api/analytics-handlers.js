import { insertAnalyticsEvent } from "./analytics-store.js";
import { resolveRequestGeo } from "./request-geo.js";

export async function handleAnalyticsEvent(req, res) {
  const body = req.body || {};
  try {
    const geo = await resolveRequestGeo(req);
    const countryCode =
      body.country ||
      geo.countryCode ||
      (geo.country && geo.country.length === 2 ? geo.country : null);

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
      country: countryCode,
      ipAddress: geo.ip,
      city: geo.city,
      region: geo.region,
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
