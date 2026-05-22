import { attributionPayload, readAttribution } from "@/lib/attribution";
import { getProductPrices, normalizeCurrency } from "@/lib/currency";
import { initTikTokPixel, tiktokEventProps, tiktokPage, tiktokTrack } from "@/lib/tiktok-pixel";

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

function purchaseDedupeKey(checkoutSessionId) {
  return checkoutSessionId ? `massar_purchase_${checkoutSessionId}` : "massar_purchase_once";
}

function alreadyTrackedPurchase(checkoutSessionId) {
  try {
    return Boolean(sessionStorage.getItem(purchaseDedupeKey(checkoutSessionId)));
  } catch {
    return false;
  }
}

function markPurchaseTracked(checkoutSessionId) {
  try {
    sessionStorage.setItem(purchaseDedupeKey(checkoutSessionId), String(Date.now()));
  } catch {
    /* ignore */
  }
}

function productValue(productId, currencyCode) {
  const currency = normalizeCurrency(currencyCode);
  const { sale } = getProductPrices(productId || "bundle", currency);
  return { value: sale, currency };
}

export function trackEvent(eventType, extra = {}) {
  if (typeof window === "undefined") return;

  initTikTokPixel();

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
  tiktokPage();
}

export function trackCheckoutView(productId) {
  const id = productId || readAttribution().product || "bundle";
  const { value, currency } = productValue(id);
  trackEvent("checkout_view", { productId: id, path: "/checkout" });
  tiktokTrack("ViewContent", tiktokEventProps(id, { value, currency }));
  tiktokTrack("InitiateCheckout", tiktokEventProps(id, { value, currency }));
}

export function trackAddToCart(productId) {
  const id = productId || "bundle";
  const { value, currency } = productValue(id);
  trackEvent("add_to_cart", { productId: id, path: "/checkout" });
  tiktokTrack("AddToCart", tiktokEventProps(id, { value, currency }));
}

export function trackCheckoutStarted(productId, metadata) {
  const id = productId || "bundle";
  trackEvent("checkout_started", { productId: id, path: "/checkout", metadata });
}

export function trackAddPaymentInfo(productId) {
  try {
    if (sessionStorage.getItem("massar_add_payment_tracked")) return;
    sessionStorage.setItem("massar_add_payment_tracked", "1");
  } catch {
    /* ignore */
  }
  const id = productId || "bundle";
  const { value, currency } = productValue(id);
  trackEvent("add_payment_info", { productId: id, path: "/checkout" });
  tiktokTrack("AddPaymentInfo", tiktokEventProps(id, { value, currency }));
}

/**
 * Purchase / payment complete — fires once per checkout session (deduped).
 * @param {string} productId
 * @param {{ checkoutSessionId?: string, value?: number, currency?: string, path?: string }} [opts]
 */
export function trackPurchase(productId, opts = {}) {
  const id = productId || "bundle";
  const sessionKey = opts.checkoutSessionId || "";
  if (alreadyTrackedPurchase(sessionKey)) return;

  const fromCatalog = productValue(id, opts.currency);
  const value = opts.value ?? fromCatalog.value;
  const currency = (opts.currency || fromCatalog.currency || "USD").toUpperCase();
  const path = opts.path || window.location.pathname;

  markPurchaseTracked(sessionKey);

  trackEvent("payment_success", {
    productId: id,
    path,
    metadata: {
      checkoutSessionId: sessionKey || undefined,
      value,
      currency,
    },
  });

  const ttProps = tiktokEventProps(id, { value, currency });
  tiktokTrack("CompletePayment", ttProps);
  tiktokTrack("Purchase", ttProps);
}
