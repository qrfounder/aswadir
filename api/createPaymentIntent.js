import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

/**
 * Server-side product catalog. Amounts are in halalas (1 SAR = 100).
 * Never trust the client to send the price.
 */
const PRODUCTS = {
  task: { amount: 2600, name: "متتبع المهام" },
  habit: { amount: 2600, name: "متتبع العادات" },
  bundle: { amount: 3700, name: "الباقة الكاملة" },
};

export default async function createPaymentIntent(req, res) {
  try {
    const { productId, customerName, whatsapp } = req.body || {};

    const product = PRODUCTS[productId];
    if (!product) {
      return res.status(400).json({ error: "invalid_product" });
    }

    const cleanPhone = String(whatsapp || "").replace(/[^0-9]/g, "");
    if (cleanPhone.length < 8 || cleanPhone.length > 12) {
      return res.status(400).json({ error: "invalid_phone" });
    }
    if (!customerName || String(customerName).trim().length < 2) {
      return res.status(400).json({ error: "invalid_name" });
    }

    const intent = await stripe.paymentIntents.create(
      {
        amount: product.amount,
        currency: "sar",
        automatic_payment_methods: { enabled: true },
        description: product.name,
        metadata: {
          productId,
          productName: product.name,
          customerName: String(customerName).trim(),
          whatsapp: `+966${cleanPhone}`,
        },
      },
      {
        idempotencyKey: `pi_${productId}_${cleanPhone}_${Date.now()}`,
      },
    );

    return res.status(200).json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    });
  } catch (err) {
    console.error("[createPaymentIntent]", err);
    return res.status(500).json({ error: err.message || "server_error" });
  }
}
