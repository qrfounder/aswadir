import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Lock, Mail, User, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/AuthContext";
import { client } from "@/api/client";
import BrandLogo from "@/components/BrandLogo";

export default function SetupAccountPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isAuthenticated, claimPurchase, checkUserAuth } = useAuth();

  const checkoutSessionId = searchParams.get("session_id") || "";
  const paymentIntentId =
    searchParams.get("payment_intent") || searchParams.get("pi") || "";
  const paymentRef = checkoutSessionId || paymentIntentId;

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(Boolean(checkoutSessionId));
  const [paymentReady, setPaymentReady] = useState(!checkoutSessionId);

  useEffect(() => {
    if (!checkoutSessionId) return;

    let cancelled = false;

    const verify = async (attempt = 0) => {
      try {
        const data = await client.checkout.complete(checkoutSessionId);
        if (cancelled) return;

        if (data.customerEmail) {
          setForm((f) => ({
            ...f,
            email: data.customerEmail,
            name: f.name || data.customerName || "",
          }));
        }

        if (data.paid) {
          setPaymentReady(true);
          setVerifying(false);
          return;
        }

        throw new Error("payment_not_confirmed");
      } catch (err) {
        if (cancelled) return;
        if (attempt < 8) {
          setTimeout(() => verify(attempt + 1), 800);
          return;
        }
        setVerifying(false);
        setError(t("auth.errors.payment_not_confirmed"));
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [checkoutSessionId, t]);

  useEffect(() => {
    if (!isAuthenticated || !paymentRef) return;

    let cancelled = false;

    (async () => {
      try {
        if (checkoutSessionId) {
          await client.checkout.complete(checkoutSessionId);
        }
        await claimPurchase({
          checkoutSessionId: checkoutSessionId || undefined,
          paymentIntentId: paymentIntentId || undefined,
        });
        if (!cancelled) navigate("/dashboard", { replace: true });
      } catch {
        if (!cancelled) navigate("/dashboard", { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    paymentRef,
    checkoutSessionId,
    paymentIntentId,
    claimPurchase,
    navigate,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!paymentRef) {
      setError(t("auth.errors.payment_intent_required"));
      return;
    }
    if (form.password !== form.confirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      if (checkoutSessionId) {
        await client.checkout.complete(checkoutSessionId);
      }

      await register({
        email: form.email,
        password: form.password,
        name: form.name,
        paymentIntentId: paymentIntentId || undefined,
        checkoutSessionId: checkoutSessionId || undefined,
      });
      await checkUserAuth();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const code = err.data?.error;
      if (code === "payment_not_confirmed" && checkoutSessionId) {
        try {
          await client.checkout.complete(checkoutSessionId);
          await register({
            email: form.email,
            password: form.password,
            name: form.name,
            checkoutSessionId,
          });
          navigate("/dashboard", { replace: true });
          return;
        } catch (retryErr) {
          const retryCode = retryErr.data?.error;
          setError(
            t(`auth.errors.${retryCode}`, { defaultValue: "" }) || t("auth.genericError"),
          );
        }
      } else {
        setError(t(`auth.errors.${code}`, { defaultValue: "" }) || t("auth.genericError"));
      }
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background font-cairo flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-cairo">
      <div className="max-w-md mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-3">
          <BrandLogo size="auth" className="mx-auto object-center" />
          <h1 className="text-2xl font-black text-white">{t("auth.setupTitle")}</h1>
          <p className="text-gray-400 text-sm leading-relaxed">{t("auth.setupSub")}</p>
        </div>

        {verifying && (
          <div className="dark-card rounded-xl p-4 flex items-center justify-center gap-2 text-gray-300 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
            {t("auth.setupVerifying")}
          </div>
        )}

        {!paymentRef && (
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 text-amber-100 text-sm">
            {t("auth.setupNoPaymentRef")}{" "}
            <Link to="/login" className="text-yellow-400 font-bold hover:underline">
              {t("auth.loginLink")}
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="dark-card rounded-2xl p-6 space-y-5">
          <label className="block">
            <span className="text-gray-300 text-sm font-bold mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-yellow-400" /> {t("auth.name")}
            </span>
            <input
              type="text"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-black/40 border border-gray-700 focus:border-yellow-400 rounded-xl px-4 py-3 text-white outline-none"
            />
          </label>

          <label className="block">
            <span className="text-gray-300 text-sm font-bold mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-yellow-400" /> {t("auth.email")}
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              dir="ltr"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full bg-black/40 border border-gray-700 focus:border-yellow-400 rounded-xl px-4 py-3 text-white outline-none text-left"
            />
          </label>

          <label className="block">
            <span className="text-gray-300 text-sm font-bold mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-yellow-400" /> {t("auth.password")}
            </span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full bg-black/40 border border-gray-700 focus:border-yellow-400 rounded-xl px-4 py-3 text-white outline-none"
            />
          </label>

          <label className="block">
            <span className="text-gray-300 text-sm font-bold mb-2">{t("auth.confirmPassword")}</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              className="w-full bg-black/40 border border-gray-700 focus:border-yellow-400 rounded-xl px-4 py-3 text-white outline-none"
            />
          </label>

          {error && (
            <div className="bg-red-900/30 border border-red-500/40 text-red-300 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || verifying || !paymentRef || !paymentReady}
            className="cta-button w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> {t("auth.setupCreating")}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> {t("auth.setupEnterDashboard")}
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm">
          {t("auth.hasAccount")}{" "}
          <Link to="/login" className="text-yellow-400 font-bold hover:underline">
            {t("auth.loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
