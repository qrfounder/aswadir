import Stripe from "stripe";
import { getCatalogProduct } from "./catalog.js";
import { getPurchaseByCheckoutSession, markCheckoutPaid } from "./purchases.js";
import { isStripeConfigured } from "./stripe-config.js";
import {
  getSubscriptionByStripeId,
  linkSubscriptionToUser,
  syncEntitlementsFromSubscription,
  upsertSubscription,
} from "./subscriptions.js";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

export async function syncStripeSubscription(subscription, checkoutSessionId = null) {
  const meta = subscription.metadata || {};
  const productId = meta.productId;
  if (!productId) {
    console.warn("[checkout] subscription missing productId metadata", subscription.id);
    return;
  }

  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  upsertSubscription({
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer,
    productId,
    status: subscription.status,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    checkoutSessionId,
    userId: null,
  });

  const row = getSubscriptionByStripeId(subscription.id);
  if (row?.user_id) {
    syncEntitlementsFromSubscription(row);
  }

  if (checkoutSessionId) {
    markCheckoutPaid(checkoutSessionId, { subscriptionId: subscription.id });
  }
}

function purchasePayload(purchase, extras = {}) {
  const product = getCatalogProduct(purchase.product_id);
  return {
    ok: true,
    paid: purchase.status === "paid",
    checkoutSessionId: purchase.checkout_session_id,
    productId: purchase.product_id,
    productName: purchase.product_name,
    salePrice: product?.salePrice ?? purchase.amount / 100,
    customerEmail: purchase.customer_email,
    customerName: purchase.customer_name,
    whatsapp: purchase.whatsapp,
    ...extras,
  };
}

/**
 * Mark purchase paid from Stripe session (idempotent). Used after redirect and by webhook.
 * @param {string} checkoutSessionId
 */
export async function fulfillCheckoutSession(checkoutSessionId) {
  const id = String(checkoutSessionId || "").trim();
  if (!id) return { ok: false, error: "session_id_required" };

  let purchase = getPurchaseByCheckoutSession(id);
  if (!purchase) return { ok: false, error: "purchase_not_found" };

  if (id.startsWith("dev_cs_")) {
    return purchasePayload(purchase);
  }

  if (!isStripeConfigured()) {
    if (purchase.status === "paid") return purchasePayload(purchase);
    return { ok: false, error: "payment_not_confirmed" };
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(id, {
    expand: ["subscription"],
  });

  if (session.status !== "complete") {
    return {
      ok: false,
      error: "checkout_incomplete",
      status: session.status,
    };
  }

  if (session.mode === "subscription" && session.subscription) {
    const subscription =
      typeof session.subscription === "object"
        ? session.subscription
        : await stripe.subscriptions.retrieve(String(session.subscription));
    await syncStripeSubscription(subscription, id);
  } else if (session.payment_status === "paid") {
    markCheckoutPaid(id);
  } else if (session.payment_status === "no_payment_required") {
    markCheckoutPaid(id);
  }

  purchase = getPurchaseByCheckoutSession(id);
  if (purchase.status !== "paid") {
    return { ok: false, error: "payment_not_confirmed", status: session.payment_status };
  }

  return purchasePayload(purchase, {
    customerEmail: session.customer_details?.email || purchase.customer_email,
    customerName: session.customer_details?.name || purchase.customer_name,
  });
}
