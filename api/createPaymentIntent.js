import Stripe from "stripe";
import { getCatalogProduct } from "./catalog.js";
import { createPendingPurchase } from "./purchases.js";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

export default async function createPaymentIntent(req, res) {
  try {
    const { productId, customerName, customerEmail, whatsapp } = req.body || {};

    const product = getCatalogProduct(productId);
    if (!product) {
      return res.status(400).json({ error: "invalid_product" });
    }

    const cleanPhone = String(whatsapp || "").replace(/[^0-9]/g, "");
    if (cleanPhone.length < 8 || cleanPhone.length > 12) {
      return res.status(400).json({ error: "invalid_phone" });
    }
    const cleanName = String(customerName || "").trim();
    if (cleanName.length < 2) {
      return res.status(400).json({ error: "invalid_name" });
    }

    const cleanEmail = String(customerEmail || "")
      .trim()
      .toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: "invalid_email" });
    }

    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create(
      {
        amount: product.amount,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        description: product.name,
        receipt_email: cleanEmail,
        metadata: {
          productId,
          productName: product.name,
          customerName: cleanName,
          customerEmail: cleanEmail,
          whatsapp: `+966${cleanPhone}`,
        },
      },
      {
        idempotencyKey: `pi_${productId}_${cleanPhone}_${Date.now()}`,
      },
    );

    createPendingPurchase({
      paymentIntentId: intent.id,
      productId,
      productName: product.name,
      amount: product.amount,
      customerName: cleanName,
      customerEmail: cleanEmail,
      whatsapp: `+966${cleanPhone}`,
    });

    return res.status(200).json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    });
  } catch (err) {
    console.error("[createPaymentIntent]", err);
    return res.status(500).json({ error: err.message || "server_error" });
  }
}
