import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Lock, Mail, KeyRound } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { client } from "@/api/client";
import BrandLogo from "@/components/BrandLogo";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, claimPurchase, isAuthenticated } = useAuth();

  const checkoutSessionId = searchParams.get("session_id") || "";
  const next = searchParams.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [claimId, setClaimId] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showClaim, setShowClaim] = useState(false);

  if (isAuthenticated) {
    navigate(next, { replace: true });
    return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      if (checkoutSessionId) {
        await client.checkout.complete(checkoutSessionId);
        await claimPurchase({ checkoutSessionId });
      } else if (claimId.trim()) {
        const ref = claimId.trim();
        if (ref.startsWith("cs_") || ref.startsWith("dev_cs_")) {
          await claimPurchase({ checkoutSessionId: ref });
        } else {
          await claimPurchase({ paymentIntentId: ref });
        }
      }
      navigate(next, { replace: true });
    } catch (err) {
      setError(
        err.data?.error === "invalid_credentials"
          ? t("auth.invalidCredentials")
          : t("auth.genericError"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 pt-4 flex justify-end gap-2">
        <CurrencySwitcher />
        <LanguageSwitcher />
      </div>
      <div className="max-w-md mx-auto px-4 pb-12 space-y-8">
        <div className="text-center space-y-3">
          <BrandLogo size="auth" className="mx-auto object-center" />
          <h1 className="text-2xl font-black text-white">{t("auth.loginTitle")}</h1>
          <p className="text-gray-400 text-sm">{t("auth.loginSub")}</p>
        </div>

        <form onSubmit={handleLogin} className="dark-card rounded-2xl p-6 space-y-5">
          <label className="block">
            <span className="text-gray-300 text-sm font-bold mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" /> {t("auth.email")}
            </span>
            <input
              type="email"
              required
              dir="ltr"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-gray-700 focus:border-primary rounded-xl px-4 py-3 text-white outline-none text-left"
            />
          </label>

          <label className="block">
            <span className="text-gray-300 text-sm font-bold mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" /> {t("auth.password")}
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-gray-700 focus:border-primary rounded-xl px-4 py-3 text-white outline-none"
            />
          </label>

          <button
            type="button"
            onClick={() => setShowClaim(!showClaim)}
            className="text-primary/90 text-xs font-bold hover:underline flex items-center gap-1"
          >
            <KeyRound className="w-3.5 h-3.5" />
            {t("auth.claimPrompt")}
          </button>

          {showClaim && (
            <label className="block">
              <span className="text-gray-400 text-xs mb-2 block">
                {t("auth.claimLabel")}
              </span>
              <input
                type="text"
                dir="ltr"
                value={claimId}
                onChange={(e) => setClaimId(e.target.value)}
                placeholder="pi_..."
                className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm outline-none text-left"
              />
            </label>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-500/40 text-red-300 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cta-button w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {t("auth.loginBtn")}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm">
          <Link to="/" className="text-gray-400 hover:text-primary">
            {t("auth.backHome")}
          </Link>
        </p>
      </div>
    </div>
  );
}
