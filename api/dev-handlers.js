import { getCatalogProduct } from "./catalog.js";
import { createDevSimulatedCheckout } from "./purchases.js";

/** Local checkout simulation without Stripe — development only */
export function handleDevSimulateOrder(req, res) {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "not_found" });
  }

  const { productId, customerName, customerEmail, whatsapp } = req.body || {};
  const product = getCatalogProduct(productId);
  if (!product) {
    return res.status(400).json({ error: "invalid_product" });
  }

  const cleanName = String(customerName || "").trim();
  const cleanEmail = String(customerEmail || "").trim().toLowerCase();
  const cleanPhone = String(whatsapp || "").replace(/[^0-9]/g, "");

  if (cleanName.length < 2) return res.status(400).json({ error: "invalid_name" });
  if (!cleanEmail) return res.status(400).json({ error: "invalid_email" });
  if (cleanPhone.length < 8) return res.status(400).json({ error: "invalid_phone" });

  const checkoutSessionId = createDevSimulatedCheckout({
    productId,
    productName: product.name,
    amount: product.amount,
    customerName: cleanName,
    customerEmail: cleanEmail,
    whatsapp: `+966${cleanPhone}`,
  });

  return res.status(200).json({
    checkoutSessionId,
    customerEmail: cleanEmail,
    simulated: true,
  });
}
