/**
 * TikTok Pixel — loads once, tracks standard events for ads optimization.
 * Pixel ID: VITE_TIKTOK_PIXEL_ID (default CU1EACBC77UAQJITPDR0)
 */

export const TIKTOK_PIXEL_ID =
  import.meta.env.VITE_TIKTOK_PIXEL_ID || "CU1EACBC77UAQJITPDR0";

let loadPromise = null;

function getTtq() {
  if (typeof window === "undefined") return null;
  return window.ttq;
}

/** Bootstrap TikTok base code (idempotent). */
export function initTikTokPixel() {
  if (typeof window === "undefined" || !TIKTOK_PIXEL_ID) return Promise.resolve();

  if (getTtq()?.loaded) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const w = window;
    const d = document;
    const t = "ttq";

    if (!w.TiktokAnalyticsObject) {
      w.TiktokAnalyticsObject = t;
      const ttq = (w[t] = w[t] || []);
      ttq.methods = [
        "page",
        "track",
        "identify",
        "instances",
        "debug",
        "on",
        "off",
        "once",
        "ready",
        "alias",
        "group",
        "enableCookie",
        "disableCookie",
      ];
      ttq.setAndDefer = (target, method) => {
        target[method] = (...args) => {
          target.push([method, ...args]);
        };
      };
      for (let i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(ttq, ttq.methods[i]);
      }
      ttq.instance = (id) => {
        const inst = ttq._i[id] || [];
        for (let i = 0; i < ttq.methods.length; i++) {
          ttq.setAndDefer(inst, ttq.methods[i]);
        }
        return inst;
      };
      ttq.load = (id, opts) => {
        const url = "https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i = ttq._i || {};
        ttq._i[id] = [];
        ttq._i[id]._u = url;
        ttq._t = ttq._t || {};
        ttq._t[id] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[id] = opts || {};
        const script = d.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.src = `${url}?sdkid=${id}&lib=${t}`;
        script.onload = () => {
          ttq.loaded = true;
          resolve();
        };
        script.onerror = () => resolve();
        const first = d.getElementsByTagName("script")[0];
        first?.parentNode?.insertBefore(script, first);
      };
    }

    const ttq = getTtq();
    if (ttq?.loaded) {
      resolve();
      return;
    }
    ttq.load(TIKTOK_PIXEL_ID);
    if (ttq?.loaded) resolve();
  });

  return loadPromise;
}

/**
 * @param {string} event TikTok standard event name
 * @param {Record<string, unknown>} [props]
 */
export function tiktokTrack(event, props = {}) {
  if (typeof window === "undefined") return;
  initTikTokPixel().then(() => {
    try {
      getTtq()?.track?.(event, props);
    } catch {
      /* ignore */
    }
  });
}

/** SPA / full page view */
export function tiktokPage() {
  if (typeof window === "undefined") return;
  initTikTokPixel().then(() => {
    try {
      getTtq()?.page?.();
    } catch {
      /* ignore */
    }
  });
}

/**
 * @param {string} productId
 * @param {{ value?: number, currency?: string }} [opts]
 */
export function tiktokEventProps(productId, opts = {}) {
  const contentId = productId || "bundle";
  const payload = {
    contents: [{ content_id: contentId, content_type: "product", quantity: 1 }],
    content_id: contentId,
    content_type: "product",
  };
  if (opts.value != null && Number.isFinite(opts.value)) {
    payload.value = opts.value;
    payload.currency = (opts.currency || "USD").toUpperCase();
  }
  return payload;
}
