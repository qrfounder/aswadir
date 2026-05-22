/**
 * Paid access rules — no free trial: members need an active paid subscription.
 */

/** Always zero: checkout must not create Stripe trial periods. */
export function getTrialPeriodDays() {
  return 0;
}

/** Subscription statuses that unlock entitlements / dashboard. */
export function subscriptionGrantsMemberAccess(status) {
  return status === "active" || status === "past_due";
}

/**
 * Stripe Checkout session + subscription are paid enough to fulfill/activate.
 */
export function checkoutPaymentConfirmed(session, subscription = null) {
  if (!session || session.status !== "complete") return false;

  if (session.mode === "subscription") {
    if (session.payment_status !== "paid") return false;
    const sub =
      subscription && typeof subscription === "object"
        ? subscription
        : null;
    if (!sub) return false;
    return subscriptionGrantsMemberAccess(sub.status);
  }

  return session.payment_status === "paid";
}
