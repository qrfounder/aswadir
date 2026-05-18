import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Warns when the server reports Stripe is misconfigured (e.g. test prices + live keys on Easypanel).
 */
export default function StripeConfigBanner() {
  const { t } = useTranslation();
  const [issues, setIssues] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        if (data.stripeReady === false && data.stripePriceErrors?.length) {
          setIssues(data.stripePriceErrors);
        } else if (data.payments && data.stripeReady === false) {
          setIssues([t("checkout.stripeConfigGeneric")]);
        } else {
          setIssues(null);
        }
      } catch {
        /* ignore */
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, [t]);

  if (!issues?.length) return null;

  return (
    <div
      className="rounded-xl border border-amber-500/50 bg-amber-950/50 p-4 space-y-2"
      role="alert"
    >
      <p className="text-amber-100 text-sm font-bold flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        {t("checkout.stripeConfigTitle")}
      </p>
      <p className="text-amber-200/90 text-xs leading-relaxed">{t("checkout.stripeConfigHint")}</p>
      <ul className="text-[11px] text-amber-100/80 font-mono space-y-1 list-disc ps-4">
        {issues.slice(0, 3).map((line) => (
          <li key={line} className="break-all">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
