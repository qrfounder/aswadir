import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeAppLocale,
  stripeCheckoutSessionLocale,
  stripeJsLocale,
} from "./stripe-locale.js";

test("normalizeAppLocale", () => {
  assert.equal(normalizeAppLocale("en-US"), "en");
  assert.equal(normalizeAppLocale("th"), "th");
  assert.equal(normalizeAppLocale("ar-SA"), "ar");
  assert.equal(normalizeAppLocale(""), "en");
});

test("stripeCheckoutSessionLocale", () => {
  assert.equal(stripeCheckoutSessionLocale("en"), "en");
  assert.equal(stripeCheckoutSessionLocale("th"), "th");
  assert.equal(stripeCheckoutSessionLocale("ar"), "auto");
});

test("stripeJsLocale", () => {
  assert.equal(stripeJsLocale("en"), "en");
  assert.equal(stripeJsLocale("th"), "th");
  assert.equal(stripeJsLocale("ar"), "ar");
});
