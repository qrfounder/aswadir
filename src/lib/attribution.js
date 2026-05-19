const STORAGE_KEY = "massar_attribution_v1";

export function captureAttributionFromUrl(search = window.location.search) {
  const params = new URLSearchParams(search);
  const patch = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const val = params.get(key);
    if (val) patch[key] = val;
  }
  const lang = params.get("lang");
  if (lang) patch.lang = lang;
  const product = params.get("product");
  if (product) patch.product = product;

  if (!Object.keys(patch).length) return readAttribution();

  try {
    const prev = readAttribution();
    const next = { ...prev, ...patch, capturedAt: new Date().toISOString() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return patch;
  }
}

export function readAttribution() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function attributionPayload() {
  const a = readAttribution();
  return {
    utmSource: a.utm_source || null,
    utmMedium: a.utm_medium || null,
    utmCampaign: a.utm_campaign || null,
    utmContent: a.utm_content || null,
    utmTerm: a.utm_term || null,
    productId: a.product || null,
    locale: a.lang || null,
    referrer: typeof document !== "undefined" ? document.referrer || null : null,
  };
}
