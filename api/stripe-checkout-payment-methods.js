/**
 * Checkout Session payment method restrictions — card + Apple Pay only (no Link).
 */

/** Stripe Checkout Session fields: card (+ Apple Pay wallet), hide Link. */
export function checkoutPaymentMethodRestrictions() {
  return {
    payment_method_types: ["card"],
    wallet_options: {
      link: {
        display: "never",
      },
    },
  };
}
