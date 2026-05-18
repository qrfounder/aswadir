import Stripe from "stripe";
import { getCatalogProduct } from "./catalog.js";
import { createPendingCheckout, createDevSimulatedCheckout } from "./purchases.js";
import { isStripeConfigured } from "./stripe-config.js";
import { getTrialPeriodDays } from "./stripe-trial.js";
import { stripeCheckoutLocale } from "./stripe-locale.js";

function mapStripeError(err) {
  const msg = String(err?.message || "");
  if (err?.code === "resource_missing" && msg.includes("price")) {
    return "stripe_price_invalid";
  }
  if (err?.type === "StripeAuthenticationError" || msg.includes("Invalid API Key")) {
    return "stripe_auth_invalid";
  }
  return "stripe_checkout_failed";
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

function formatWhatsApp(digits, dialCode) {
  const code = String(dialCode || "+966").trim().replace(/[^\d+]/g, "");
  const normalized = code.startsWith("+") ? code : `+${code}`;
  return `${normalized}${digits}`;
}

function simulateCheckout(res, { product, productId, cleanName, cleanEmail, whatsappE164 }) {
  const checkoutSessionId = createDevSimulatedCheckout({
    productId,
    productName: product.name,
    amount: product.amount,
    customerName: cleanName,
    customerEmail: cleanEmail,
    whatsapp: whatsappE164,
  });
  return res.status(200).json({
    simulated: true,
    checkoutSessionId,
  });
}

function siteUrl(req, preferredOrigin) {
  const fromClient = String(preferredOrigin || "").replace(/\/$/, "");
  const origin = String(req.headers.origin || "").replace(/\/$/, "");
  const configured = process.env.SITE_URL ? process.env.SITE_URL.replace(/\/$/, "") : "";
  const isDev = process.env.NODE_ENV !== "production";

  if (fromClient && /^https?:\/\//i.test(fromClient)) {
    return fromClient;
  }

  // Vite (5173) proxies /api to Express (3000) — return_url must match the browser origin.
  if (isDev && origin && /localhost|127\.0\.0\.1/i.test(origin)) {
    return origin;
  }

  if (configured) return configured;
  if (origin) return origin;

  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return `${proto}://${host}`;
}

export default async function createCheckoutSession(req, res) {
  try {
    const body = req.body || {};
    const {
      productId,
      customerName,
      customerEmail,
      whatsapp,
      whatsappDialCode,
      embedded = false,
      locale: preferredLocale,
    } = body;
    const preferredReturnOrigin = body.returnOrigin ?? body.return_origin;
    const product = getCatalogProduct(productId);
    if (!product) {
      return res.status(400).json({ error: "invalid_product" });
    }
    if (!product.priceId) {
      return res.status(500).json({ error: "subscription_price_not_configured" });
    }

    const cleanPhone = String(whatsapp || "").replace(/[^0-9]/g, "");
    if (cleanPhone.length < 8 || cleanPhone.length > 12) {
      return res.status(400).json({ error: "invalid_phone" });
    }
    const whatsappE164 = formatWhatsApp(cleanPhone, whatsappDialCode);
    const cleanName = String(customerName || "").trim();
    if (cleanName.length < 2) {
      return res.status(400).json({ error: "invalid_name" });
    }
    const cleanEmail = String(customerEmail || "").trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: "invalid_email" });
    }

    if (!isStripeConfigured()) {
      if (process.env.NODE_ENV === "production") {
        return res.status(503).json({ error: "payments_not_configured" });
      }
      return simulateCheckout(res, {
        product,
        productId,
        cleanName,
        cleanEmail,
        whatsappE164,
      });
    }

    const base = siteUrl(req, preferredReturnOrigin);
    const stripe = getStripe();
    const trialDays = getTrialPeriodDays();
    const useEmbedded = embedded === true || embedded === "true";
    const returnParams = `session_id={CHECKOUT_SESSION_ID}&productId=${encodeURIComponent(productId)}&product=${encodeURIComponent(product.name)}&price=${product.salePrice}&currency=usd&trial=${trialDays}`;

    const sessionParams = {
      mode: "subscription",
      ui_mode: useEmbedded ? "embedded" : "hosted",
      customer_email: cleanEmail,
      line_items: [{ price: product.priceId, quantity: 1 }],
      locale: stripeCheckoutLocale(preferredLocale),
      metadata: {
        productId,
        productName: product.name,
        customerName: cleanName,
        customerEmail: cleanEmail,
        whatsapp: whatsappE164,
      },
      subscription_data: {
        ...(trialDays > 0 ? { trial_period_days: trialDays } : {}),
        metadata: {
          productId,
          customerName: cleanName,
          customerEmail: cleanEmail,
          whatsapp: whatsappE164,
        },
      },
      allow_promotion_codes: true,
    };

    const postCheckoutPath = `/setup-account?${returnParams}`;

    if (useEmbedded) {
      sessionParams.return_url = `${base}${postCheckoutPath}`;
    } else {
      sessionParams.success_url = `${base}${postCheckoutPath}`;
      sessionParams.cancel_url = `${base}/checkout?product=${encodeURIComponent(productId)}`;
    }

    let session;
    try {
      session = await stripe.checkout.sessions.create(sessionParams);
    } catch (stripeErr) {
      if (stripeErr?.code === "resource_missing") {
        console.error("[createCheckoutSession] Invalid price:", {
          productId,
          priceId: product.priceId,
          stripeMessage: stripeErr.message,
        });
      }
      throw stripeErr;
    }

    createPendingCheckout({
      checkoutSessionId: session.id,
      productId,
      productName: product.name,
      amount: product.amount,
      customerName: cleanName,
      customerEmail: cleanEmail,
      whatsapp: whatsappE164,
    });

    if (useEmbedded) {
      return res.status(200).json({
        clientSecret: session.client_secret,
        checkoutSessionId: session.id,
      });
    }

    return res.status(200).json({
      url: session.url,
      checkoutSessionId: session.id,
    });
  } catch (err) {
    console.error("[createCheckoutSession]", err);
    const code = err.type?.startsWith("Stripe") ? mapStripeError(err) : "server_error";
    const safeDetail =
      process.env.NODE_ENV !== "production" && err?.message && !/is not defined/i.test(err.message)
        ? err.message
        : undefined;
    return res.status(500).json({
      error: code,
      detail: safeDetail,
    });
  }
}
