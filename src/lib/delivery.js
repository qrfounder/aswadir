/**
 * External product delivery URLs (Google Sheets "Make a copy" links, etc.).
 * Hosted outside this website — configure per product in Easypanel / .env.
 *
 * Google Sheets copy link format:
 * https://docs.google.com/spreadsheets/d/YOUR_ID/copy
 */
const DELIVERY_URLS = {
  habit: import.meta.env.VITE_DELIVERY_URL_HABIT ?? "",
  task: import.meta.env.VITE_DELIVERY_URL_TASK ?? "",
  bundle: import.meta.env.VITE_DELIVERY_URL_BUNDLE ?? "",
};

/** @param {"habit"|"task"|"bundle"|string} productId */
export function getDeliveryUrl(productId) {
  const url = DELIVERY_URLS[productId] || DELIVERY_URLS.bundle;
  return typeof url === "string" ? url.trim() : "";
}

export function hasDeliveryUrl(productId) {
  return getDeliveryUrl(productId).length > 0;
}
