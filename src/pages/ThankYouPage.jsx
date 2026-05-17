import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/AuthContext";
import { client } from "@/api/client";

/** Legacy route: Stripe used to land here; forward to setup-account → dashboard. */
export default function ThankYouPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, claimPurchase } = useAuth();

  const checkoutSessionId = searchParams.get("session_id") || "";

  useEffect(() => {
    const qs = searchParams.toString();
    const target = qs ? `/setup-account?${qs}` : "/setup-account";

    if (!checkoutSessionId) {
      navigate(target, { replace: true });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await client.checkout.complete(checkoutSessionId);
        if (cancelled) return;

        if (isAuthenticated) {
          await claimPurchase({ checkoutSessionId });
          navigate("/dashboard", { replace: true });
          return;
        }

        navigate(target, { replace: true });
      } catch {
        if (!cancelled) navigate(target, { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [checkoutSessionId, searchParams, navigate, isAuthenticated, claimPurchase]);

  return (
    <div className="min-h-screen bg-background font-cairo flex flex-col items-center justify-center gap-4 px-4">
      <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
      <p className="text-gray-300 text-sm font-bold">{t("thankYou.redirecting")}</p>
    </div>
  );
}
