import test from "node:test";
import assert from "node:assert/strict";
import {
  amountToStripeMinorUnits,
  getCheckoutCharge,
  getProductPrices,
} from "./product-prices.js";

test("amountToStripeMinorUnits", () => {
  assert.equal(amountToStripeMinorUnits(9.99, "USD"), 999);
  assert.equal(amountToStripeMinorUnits(39, "SAR"), 3900);
  assert.equal(amountToStripeMinorUnits(37, "AED"), 3700);
  assert.equal(amountToStripeMinorUnits(349, "THB"), 349);
  assert.equal(amountToStripeMinorUnits(2.9, "KWD"), 2900);
});

test("getCheckoutCharge bundle SAR", () => {
  const charge = getCheckoutCharge("bundle", "SAR");
  assert.equal(charge.stripeCurrency, "sar");
  assert.equal(charge.unitAmount, 3900);
  assert.equal(charge.displaySale, 39);
});

test("getCheckoutCharge matches display catalog", () => {
  assert.equal(getProductPrices("bundle", "AED").sale, 37);
  assert.equal(getCheckoutCharge("bundle", "AED").unitAmount, 3700);
});
