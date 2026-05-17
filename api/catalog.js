/**
 * Server-side catalog — amounts in USD cents ($1 = 100).
 * priceId must match recurring Prices in Stripe Dashboard (monthly).
 * Keep in sync with src/lib/products.js
 */
export const CATALOG = {
  task: {
    amount: 499,
    name: "متتبع المهام",
    originalPrice: 14.99,
    salePrice: 4.99,
    priceId: process.env.STRIPE_PRICE_TASK || "price_1TXxEPAUbMU3KadXuDkMv590",
  },
  habit: {
    amount: 499,
    name: "متتبع العادات",
    originalPrice: 14.99,
    salePrice: 4.99,
    priceId: process.env.STRIPE_PRICE_HABIT || "price_1TWfyIBlMHf0a8IXhqhlxL2I",
  },
  bundle: {
    amount: 999,
    name: "الباقة الكاملة",
    originalPrice: 24.99,
    salePrice: 9.99,
    priceId: process.env.STRIPE_PRICE_BUNDLE || "price_1TXxETAUbMU3KadXYl2vFgih",
  },
};

export function getCatalogProduct(productId) {
  return CATALOG[productId] ?? null;
}

/** Products included in each purchase for entitlements */
export function entitlementsForProduct(productId) {
  if (productId === "bundle") return ["habit", "task", "bundle"];
  if (productId === "habit" || productId === "task") return [productId];
  return [];
}
