import { attributionPayload, readAttribution } from "@/lib/attribution";

const SESSION_KEY = "massar_analytics_sid";

function analyticsSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID?.() || `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `s_${Date.now()}`;
  }
}

export function trackEvent(eventType, extra = {}) {
  if (typeof window === "undefined") return;
  const body = {
    eventType,
    sessionId: analyticsSessionId(),
    path: window.location.pathname,
    referrer: document.referrer || null,
    ...attributionPayload(),
    ...extra,
  };

  const payload = JSON.stringify(body);
  const url = "/api/analytics/event";

  if (navigator.sendBeacon) {
    try {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    } catch {
      /* fall through */
    }
  }

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => {});
}

export function trackPageView(pathname = window.location.pathname) {
  trackEvent("page_view", { path: pathname });
}

export function trackCheckoutView(productId) {
  trackEvent("checkout_view", {
    productId: productId || readAttribution().product || null,
    path: "/checkout",
  });
}

export function trackAddToCart(productId) {
  trackEvent("add_to_cart", { productId, path: "/checkout" });
}

export function trackCheckoutStarted(productId, metadata) {
  trackEvent("checkout_started", { productId, path: "/checkout", metadata });
}
