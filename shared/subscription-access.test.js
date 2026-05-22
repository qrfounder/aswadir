import test from "node:test";
import assert from "node:assert/strict";
import {
  getTrialPeriodDays,
  subscriptionGrantsMemberAccess,
  checkoutPaymentConfirmed,
} from "../api/subscription-access.js";

test("getTrialPeriodDays is always zero", () => {
  assert.equal(getTrialPeriodDays(), 0);
});

test("subscriptionGrantsMemberAccess", () => {
  assert.equal(subscriptionGrantsMemberAccess("active"), true);
  assert.equal(subscriptionGrantsMemberAccess("past_due"), true);
  assert.equal(subscriptionGrantsMemberAccess("trialing"), false);
  assert.equal(subscriptionGrantsMemberAccess("incomplete"), false);
});

test("checkoutPaymentConfirmed rejects trial checkout", () => {
  const session = {
    status: "complete",
    mode: "subscription",
    payment_status: "no_payment_required",
  };
  const subscription = { status: "trialing" };
  assert.equal(checkoutPaymentConfirmed(session, subscription), false);
});

test("checkoutPaymentConfirmed accepts paid active subscription", () => {
  const session = {
    status: "complete",
    mode: "subscription",
    payment_status: "paid",
  };
  const subscription = { status: "active" };
  assert.equal(checkoutPaymentConfirmed(session, subscription), true);
});
