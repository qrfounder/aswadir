import { getCheckoutCharge } from "../shared/product-prices.js";

/** @type {Map<string, string>} */
const stripeProductIdByPriceId = new Map();

/**
 * Resolve Stripe Product id from the configured USD Price id (catalog anchor).
 * @param {import('stripe').Stripe} stripe
 * @param {string} catalogPriceId
 */
export async function resolveStripeProductId(stripe, catalogPriceId) {
  const cached = stripeProductIdByPriceId.get(catalogPriceId);
  if (cached) return cached;

  const price = await stripe.prices.retrieve(catalogPriceId);
  const productId =
    typeof price.product === "string" ? price.product : price.product?.id;
  if (!productId) throw new Error("stripe_product_missing");
  stripeProductIdByPriceId.set(catalogPriceId, productId);
  return productId;
}

/**
 * Build subscription line item in the customer's display currency.
 * @param {import('stripe').Stripe} stripe
 * @param {{ productId: string, priceId: string }} catalogProduct
 * @param {string} displayCurrency
 */
export async function buildSubscriptionLineItem(stripe, catalogProduct, displayCurrency) {
  const charge = getCheckoutCharge(catalogProduct.productId, displayCurrency);
  const stripeProductId = await resolveStripeProductId(stripe, catalogProduct.priceId);

  return {
    lineItem: {
      price_data: {
        currency: charge.stripeCurrency,
        unit_amount: charge.unitAmount,
        recurring: { interval: "month" },
        product: stripeProductId,
      },
      quantity: 1,
    },
    charge,
  };
}
