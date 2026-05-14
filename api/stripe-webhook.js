import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Called when a payment succeeds. Plug in WhatsApp / email delivery here.
 * Keep this idempotent: Stripe may retry the same event.
 */
async function fulfillOrder({ productId, productName, customerName, whatsapp, amount }) {
  console.log("[fulfill] Order paid", {
    productId,
    productName,
    customerName,
    whatsapp,
    amount,
  });
}

export default async function stripeWebhook(req, res) {
  let event;
  try {
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(req.body, signature, WEBHOOK_SECRET);
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
