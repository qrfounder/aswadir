import Stripe from "stripe";
import { syncStripeSubscription } from "./checkout-fulfillment.js";
import { markPurchasePaid } from "./purchases.js";
import {
  syncEntitlementsFromSubscription,
  linkSubscriptionToUser,
  getSubscriptionByStripeId,
} from "./subscriptions.js";
import { getDb } from "./db.js";
import { recordServerEvent } from "./analytics-store.js";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

async function fulfillOrder({ paymentIntentId, productId, productName, customerName, whatsapp, amount }) {
  const newlyPaid = markPurchasePaid(paymentIntentId);
  console.log("[fulfill] Order paid", {
    paymentIntentId,
    productId,
    productName,
    customerName,
    whatsapp,
    amount,
    newlyPaid,
  });

  if (newlyPaid) {
    recordServerEvent("payment_success", {
      path: "/checkout",
      productId: productId || null,
      metadata: {
        paymentIntentId,
        productName,
        amount,
        customerName,
      },
    });
  }
}

export default async function stripeWebhook(req, res) {
  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    const signature = req.headers["stripe-signature"];
    event = getStripe().webhooks.constructEvent(req.body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const stripe = getStripe();

    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object;
        const meta = intent.metadata || {};
        await fulfillOrder({
          paymentIntentId: intent.id,
          productId: meta.productId,
          productName: meta.productName,
          customerName: meta.customerName,
          whatsapp: meta.whatsapp,
          amount: intent.amount,
        });
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await syncStripeSubscription(subscription, session.id);

          const purchaseUserId = session.metadata?.userId;
          if (purchaseUserId) {
            linkSubscriptionToUser(subscription.id, purchaseUserId);
            const row = getSubscriptionByStripeId(subscription.id);
            syncEntitlementsFromSubscription({ ...row, user_id: purchaseUserId });
          }

          const db = getDb();
          if (subscription.customer) {
            db.prepare(
              `UPDATE purchases SET subscription_id = ? WHERE checkout_session_id = ?`,
            ).run(subscription.id, session.id);
          }

          recordServerEvent("payment_success", {
            path: "/checkout/success",
            productId: session.metadata?.productId || null,
            userId: session.metadata?.userId || null,
            metadata: {
              checkoutSessionId: session.id,
              mode: session.mode,
              amount: session.amount_total,
            },
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await syncStripeSubscription(subscription);
        recordServerEvent("subscription_updated", {
          productId: subscription.metadata?.productId || null,
          metadata: {
            status: subscription.status,
            subscriptionId: subscription.id,
          },
        });
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          await syncStripeSubscription(subscription);
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          await syncStripeSubscription(subscription);
        }
        console.warn("[webhook] Invoice payment failed:", invoice.id);
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object;
        console.warn(
          "[webhook] Payment failed:",
          intent.id,
          intent.last_payment_error?.message,
        );
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        console.log("[webhook] Refund:", charge.id, charge.amount_refunded);
        break;
      }
      default:
        break;
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("[webhook] Handler error:", err);
    return res.status(500).json({ error: "handler_error" });
  }
}
