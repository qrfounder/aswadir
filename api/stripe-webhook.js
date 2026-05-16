import Stripe from "stripe";
import { markPurchasePaid } from "./purchases.js";

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
