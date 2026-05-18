/**
 * Server-side catalog — amounts in USD cents ($1 = 100).
 * Price IDs are read from env on each request (no stale cache after .env updates).
 * Keep in sync with src/lib/products.js
 */

const DEV_FALLBACKS = {
  task: "price_1TXxEPAUbMU3KadXuDkMv590",
  habit: "price_1TWfyIBlMHf0a8IXhqhlxL2I",
  bundle: "price_1TXxETAUbMU3KadXYl2vFgih",
};

/** @param {string} envKey @param {string} [devFallback] */
function priceIdFromEnv(envKey, devFallback) {
  const configured = String(process.env[envKey] || "").trim();
  if (configured && !configured.includes("REPLACE")) return configured;
  if (process.env.NODE_ENV === "production") return "";
  return devFallback || "";
}

const CATALOG_BASE = {
  task: {
    amount: 499,
    name: "متتبع المهام",
    originalPrice: 14.99,
    salePrice: 4.99,
    priceEnv: "STRIPE_PRICE_TASK",
  },
  habit: {
    amount: 499,
    name: "متتبع العادات",
    originalPrice: 14.99,
    salePrice: 4.99,
    priceEnv: "STRIPE_PRICE_HABIT",
  },
  bundle: {
    amount: 999,
    name: "الباقة الكاملة",
    originalPrice: 24.99,
    salePrice: 9.99,
    priceEnv: "STRIPE_PRICE_BUNDLE",
  },
};

/** @param {string} productId */
export function getCatalogProduct(productId) {
  const base = CATALOG_BASE[productId];
  if (!base) return null;
  const { priceEnv, ...rest } = base;
  return {
    ...rest,
    priceId: priceIdFromEnv(priceEnv, DEV_FALLBACKS[productId]),
  };
}

/** @returns {Record<string, ReturnType<typeof getCatalogProduct>>} */
export function getCatalog() {
  return Object.fromEntries(
    Object.keys(CATALOG_BASE).map((id) => [id, getCatalogProduct(id)]),
  );
}

/** Products included in each purchase for entitlements */
export function entitlementsForProduct(productId) {
  if (productId === "bundle") return ["habit", "task", "bundle"];
  if (productId === "habit" || productId === "task") return [productId];
  return [];
}
