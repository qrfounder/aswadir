/** Subscription trial length (days). Set STRIPE_TRIAL_DAYS=0 for no free trial. */
export function getTrialPeriodDays() {
  const n = Number.parseInt(process.env.STRIPE_TRIAL_DAYS ?? "0", 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, 730);
}
