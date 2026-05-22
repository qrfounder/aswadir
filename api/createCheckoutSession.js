import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { getCatalogProduct } from "./catalog.js";
import { createPendingCheckout, createDevSimulatedCheckout } from "./purchases.js";
import { isStripeConfigured } from "./stripe-config.js";
import { getCheckoutCharge, normalizeCurrency } from "../shared/product-prices.js";
import { buildSubscriptionLineItem } from "./stripe-line-items.js";
import {
  normalizeAppLocale,
  stripeCheckoutSessionLocale,
} from "./stripe-locale.js";

const SALT_ROUNDS = 12;

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

function simulateCheckout(
  res,
  { product, productId, charge, cleanName, cleanEmail, whatsappE164, pendingPasswordHash },
) {
  const checkoutSessionId = createDevSimulatedCheckout({
    productId,
    productName: product.name,
    amount: charge.unitAmount,
    currency: charge.stripeCurrency,
    customerName: cleanName,
    customerEmail: cleanEmail,
    whatsapp: whatsappE164,
    pendingPasswordHash,
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
      password,
      currency: requestedCurrency,
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

    const cleanPassword = String(password || "");
    if (cleanPassword.length < 8) {
      return res.status(400).json({ error: "weak_password" });
    }
    const pendingPasswordHash = await bcrypt.hash(cleanPassword, SALT_ROUNDS);

    const displayCurrency = normalizeCurrency(requestedCurrency);
    let charge;
    try {
      charge = getCheckoutCharge(productId, displayCurrency);
    } catch (err) {
      if (err?.message === "invalid_checkout_amount") {
        return res.status(400).json({ error: "invalid_currency" });
      }
      throw err;
    }

    if (!isStripeConfigured()) {
      if (process.env.NODE_ENV === "production") {
        return res.status(503).json({ error: "payments_not_configured" });
      }
      return simulateCheckout(res, {
        product,
        productId,
        charge,
        cleanName,
        cleanEmail,
        whatsappE164,
        pendingPasswordHash,
      });
    }

    const base = siteUrl(req, preferredReturnOrigin);
    const stripe = getStripe();
    const { lineItem } = await buildSubscriptionLineItem(
      stripe,
      { productId, priceId: product.priceId },
      displayCurrency,
    );
    const useEmbedded = embedded === true || embedded === "true";
    const returnParams = `session_id={CHECKOUT_SESSION_ID}&productId=${encodeURIComponent(productId)}&product=${encodeURIComponent(product.name)}&price=${charge.displaySale}&currency=${charge.stripeCurrency}`;

    const sessionParams = {
      mode: "subscription",
      ui_mode: useEmbedded ? "embedded" : "hosted",
      customer_email: cleanEmail,
      line_items: [lineItem],
      locale: stripeCheckoutSessionLocale(preferredLocale),
      payment_method_collection: "always",
      metadata: {
        productId,
        productName: product.name,
        customerName: cleanName,
        customerEmail: cleanEmail,
        whatsapp: whatsappE164,
        appLocale: normalizeAppLocale(preferredLocale),
        checkoutCurrency: charge.displayCurrency,
      },
      subscription_data: {
        metadata: {
          productId,
          customerName: cleanName,
          customerEmail: cleanEmail,
          whatsapp: whatsappE164,
          checkoutCurrency: charge.displayCurrency,
        },
      },
      allow_promotion_codes: true,
    };

    const postCheckoutPath = `/checkout/success?${returnParams}`;

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
      amount: charge.unitAmount,
      currency: charge.stripeCurrency,
      customerName: cleanName,
      customerEmail: cleanEmail,
      whatsapp: whatsappE164,
      pendingPasswordHash,
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
