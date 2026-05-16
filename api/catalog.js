/**
 * Server-side catalog — amounts in halalas (1 SAR = 100).
 * Keep in sync with src/lib/products.js sale/original prices.
 */
export const CATALOG = {
  task: {
    amount: 9900,
    name: "متتبع المهام",
    originalPrice: 249,
    salePrice: 99,
  },
  habit: {
    amount: 9900,
    name: "متتبع العادات",
    originalPrice: 249,
    salePrice: 99,
  },
  bundle: {
    amount: 14900,
    name: "الباقة الكاملة",
    originalPrice: 449,
    salePrice: 149,
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
