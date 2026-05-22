import test from "node:test";
import assert from "node:assert/strict";
import { checkoutPaymentMethodRestrictions } from "../api/stripe-checkout-payment-methods.js";

test("checkoutPaymentMethodRestrictions limits to card and hides Link", () => {
  const opts = checkoutPaymentMethodRestrictions();
  assert.deepEqual(opts.payment_method_types, ["card"]);
  assert.equal(opts.wallet_options?.link?.display, "never");
});
