import { useState } from "react";
import { CalendarClock, CreditCard, Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/lib/LocaleContext";
import { client } from "@/api/client";

const INTL_LOCALE = { en: "en-US", ar: "ar-SA", th: "th-TH" };

const STATUS_KEYS = {
  active: "member.subscriptionActive",
  trialing: "member.subscriptionTrial",
  past_due: "member.subscriptionPastDue",
  canceled: "member.subscriptionCanceled",
  unpaid: "member.subStatusUnpaid",
};

export default function SubscriptionBanner({ subscription }) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!subscription) return null;

  const intlLocale = INTL_LOCALE[locale] || "en-US";

  const periodLabel = subscription.currentPeriodEnd
    ? (() => {
        try {
          return new Intl.DateTimeFormat(intlLocale, {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date(subscription.currentPeriodEnd));
        } catch {
          return null;
        }
      })()
    : null;

  const statusKey = STATUS_KEYS[subscription.status];
  const statusLabel = statusKey ? t(statusKey) : subscription.status;

  const openPortal = async () => {
    setLoading(true);
    setError(null);
    try {
      const { url } = await client.billing.openPortal();
      if (url) window.location.href = url;
    } catch (err) {
      setError(
        err.data?.error === "no_subscription" ? t("member.subNoSubscription") : t("member.subPortalError"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark-card rounded-2xl p-4 sm:p-5 border border-yellow-400/20 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div className="flex gap-3 items-start min-w-0">
        <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-black text-sm">
            {t("member.subYourPlan", { name: subscription.productName })}
          </p>
          <p className="text-gray-400 text-xs mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-emerald-400/90 font-bold">{statusLabel}</span>
            {periodLabel && (
              <>
                <span className="text-gray-600" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" />
                  {t("member.subRenews", { date: periodLabel })}
                </span>
              </>
            )}
            {subscription.cancelAtPeriodEnd && (
              <span className="text-amber-300/90">{t("member.subCancelAtPeriodEnd")}</span>
            )}
          </p>
          {error && <p className="text-red-300 text-xs mt-2">{error}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={openPortal}
        disabled={loading}
        className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-yellow-400/30 text-yellow-300 text-sm font-bold hover:bg-yellow-400/10 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
        {t("member.manageBilling")}
      </button>
    </div>
  );
}
