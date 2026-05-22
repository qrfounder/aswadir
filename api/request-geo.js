/** Client IP + geo for analytics (trust proxy enabled on server). */

const GEO_CACHE_MS = 60 * 60 * 1000;
const geoCache = new Map();

function isPrivateIp(ip) {
  if (!ip) return true;
  const n = String(ip).replace(/^::ffff:/, "");
  if (n === "::1" || n === "127.0.0.1" || n === "localhost") return true;
  if (n.startsWith("10.") || n.startsWith("192.168.") || n.startsWith("169.254.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(n)) return true;
  return false;
}

export function getClientIp(req) {
  const headers = req.headers || {};
  const forwarded = headers["x-forwarded-for"];
  if (forwarded) {
    const first = String(forwarded).split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers["x-real-ip"];
  if (realIp) return String(realIp).trim();
  return req.socket?.remoteAddress || req.ip || null;
}

export function countryFromRequestHeaders(req) {
  const headers = req.headers || {};
  const cf = headers["cf-ipcountry"];
  if (cf && cf !== "XX" && String(cf).length === 2) return String(cf).toUpperCase();
  const vercel = headers["x-vercel-ip-country"];
  if (vercel && String(vercel).length === 2) return String(vercel).toUpperCase();
  const fly = headers["fly-client-country"];
  if (fly && String(fly).length === 2) return String(fly).toUpperCase();
  return null;
}

/**
 * @param {string} ip
 * @returns {Promise<{ country: string, countryCode: string, city: string|null, region: string|null }|null>}
 */
export async function lookupIpGeo(ip) {
  if (!ip || isPrivateIp(ip)) return null;

  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.at < GEO_CACHE_MS) return cached.data;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,city,regionName,query`;
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== "success") return null;
    const data = {
      country: json.country || null,
      countryCode: json.countryCode || null,
      city: json.city || null,
      region: json.regionName || null,
    };
    geoCache.set(ip, { data, at: Date.now() });
    return data;
  } catch {
    return null;
  }
}

/** Resolve IP, city, country for an incoming analytics request. */
export async function resolveRequestGeo(req) {
  const ip = getClientIp(req);
  const headerCountry = countryFromRequestHeaders(req);

  if (!ip || isPrivateIp(ip)) {
    return {
      ip: ip || null,
      country: headerCountry,
      countryCode: headerCountry,
      city: null,
      region: null,
    };
  }

  const geo = await lookupIpGeo(ip);
  return {
    ip,
    country: geo?.country || null,
    countryCode: geo?.countryCode || headerCountry || null,
    city: geo?.city || null,
    region: geo?.region || null,
  };
}
