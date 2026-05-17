/** Free trial length for new subscriptions (days). Default: 1 */
export function getTrialPeriodDays() {
  const n = Number.parseInt(process.env.STRIPE_TRIAL_DAYS || "1", 10);
  if (!Number.isFinite(n) || n < 0) return 1;
  return Math.min(n, 730);
}
