import bcrypt from "bcryptjs";
import { getCatalogProduct } from "./catalog.js";
import { createDevSimulatedCheckout } from "./purchases.js";
import { getCheckoutCharge, normalizeCurrency } from "../shared/product-prices.js";

const SALT_ROUNDS = 12;

/** Local checkout simulation without Stripe — development only */
export async function handleDevSimulateOrder(req, res) {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "not_found" });
  }

  const { productId, customerName, customerEmail, whatsapp, password, currency } = req.body || {};
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

  let pendingPasswordHash = null;
  const cleanPassword = String(password || "");
  if (cleanPassword) {
    if (cleanPassword.length < 8) {
      return res.status(400).json({ error: "weak_password" });
    }
    pendingPasswordHash = await bcrypt.hash(cleanPassword, SALT_ROUNDS);
  }

  const charge = getCheckoutCharge(productId, normalizeCurrency(currency));
  const checkoutSessionId = createDevSimulatedCheckout({
    productId,
    productName: product.name,
    amount: charge.unitAmount,
    currency: charge.stripeCurrency,
    customerName: cleanName,
    customerEmail: cleanEmail,
    whatsapp: `+966${cleanPhone}`,
    pendingPasswordHash,
  });

  return res.status(200).json({
    checkoutSessionId,
    customerEmail: cleanEmail,
    simulated: true,
  });
}
