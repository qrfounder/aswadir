import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/AuthContext";
import { client } from "@/api/client";
import BrandLogo from "@/components/BrandLogo";

export default function CheckoutSuccessPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkUserAuth } = useAuth();
  const [error, setError] = useState(null);

  const checkoutSessionId = searchParams.get("session_id") || "";

  useEffect(() => {
    if (!checkoutSessionId) {
      setError(t("auth.errors.payment_intent_required"));
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await client.checkout.activate(checkoutSessionId);
        if (cancelled) return;
        await checkUserAuth();
        if (!cancelled) navigate("/dashboard", { replace: true });
      } catch (err) {
        if (cancelled) return;
        const code = err.data?.error;
        if (code === "email_in_use") {
          navigate(
            `/login?session_id=${encodeURIComponent(checkoutSessionId)}&next=${encodeURIComponent("/dashboard")}`,
            { replace: true },
          );
          return;
        }
        if (code === "account_password_required") {
          navigate(`/setup-account?session_id=${encodeURIComponent(checkoutSessionId)}`, {
            replace: true,
          });
          return;
        }
        setError(t(`auth.errors.${code}`, { defaultValue: "" }) || t("auth.genericError"));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [checkoutSessionId, checkUserAuth, navigate, t]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <BrandLogo size="auth" className="mb-6" />
      {error ? (
        <div className="max-w-md text-center space-y-4">
          <p className="text-red-300 text-sm">{error}</p>
          <Link to="/login" className="text-primary font-bold hover:underline">
            {t("auth.loginLink")}
          </Link>
        </div>
      ) : (
        <div className="text-center space-y-3">
          <Sparkles className="w-8 h-8 text-primary mx-auto animate-pulse" aria-hidden />
          <p className="text-white font-black text-lg">{t("checkout.successActivating")}</p>
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            {t("checkout.successRedirect")}
          </p>
        </div>
      )}
    </div>
  );
}
