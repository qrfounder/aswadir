import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Check,
  CheckCircle,
  CreditCard,
  ExternalLink,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Tag,
  User,
} from "lucide-react";

import { useLocalizedProduct } from "@/lib/localizedProducts";
import { useLocale } from "@/lib/LocaleContext";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { usePricing } from "@/lib/usePricing";
import { useTranslation } from "react-i18next";
import { LOCALE_META } from "@/i18n/constants";
import { client } from "@/api/client";
import { fetchStripeConfig } from "@/lib/stripe";
import TrustBadges from "@/components/sales/TrustBadges";
import DevApiBanner from "@/components/checkout/DevApiBanner";
import BrandLogo from "@/components/BrandLogo";
import { BackChevron, ForwardChevron } from "@/lib/locale-ui";

function StepDot({ active, done, num, label }) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all ${
          done
            ? "bg-yellow-400 text-black"
            : active
              ? "bg-yellow-400/15 text-yellow-400 ring-2 ring-yellow-400"
              : "bg-gray-800 text-gray-500"
        }`}
      >
        {done ? <Check className="w-4 h-4" strokeWidth={3} /> : num}
      </div>
      <span className={`text-sm font-bold ${active ? "text-white" : "text-gray-500"}`}>
        {label}
      </span>
    </div>
  );
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { locale, currency } = useLocale();
  const { format, priceFor, checkoutNoteNeeded, chargeCurrency } = usePricing();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const productId = searchParams.get("product") || "bundle";
  const product = useLocalizedProduct(productId);

  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState({ name: "", email: "", whatsapp: "" });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentsEnabled, setPaymentsEnabled] = useState(null);

  useEffect(() => {
    fetchStripeConfig().then((cfg) => setPaymentsEnabled(cfg.paymentsEnabled));
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const proceedToPayment = (e) => {
    e.preventDefault();
    setFormError(null);
    const name = customer.name.trim();
    const email = customer.email.trim().toLowerCase();
    const phone = customer.whatsapp.trim();
    if (name.length < 2) {
      setFormError(t("checkout.errors.name"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError(t("checkout.errors.email"));
      return;
    }
    if (!/^[0-9]{8,12}$/.test(phone)) {
      setFormError(t("checkout.errors.phone"));
      return;
    }
    setStep(2);
  };

  const startSubscription = async () => {
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await client.functions.invoke("createCheckoutSession", {
        productId: product.id,
        customerName: customer.name.trim(),
        customerEmail: customer.email.trim().toLowerCase(),
        whatsapp: customer.whatsapp.trim(),
        locale: LOCALE_META[locale]?.stripe || locale,
        returnOrigin: window.location.origin,
      });

      const { url, checkoutSessionId, simulated } = res.data || {};

      if (simulated && checkoutSessionId) {
        const q = new URLSearchParams({
          session_id: checkoutSessionId,
          productId: product.id,
          product: product.name,
          price: String(product.salePrice),
        });
        navigate(`/setup-account?${q.toString()}`);
        return;
      }

      if (url) {
        window.location.href = url;
        return;
      }

      setFormError(t("checkout.errors.generic"));
    } catch (err) {
      console.error(err);
      const code = err.data?.error;
      setFormError(
        t(`checkout.errors.${code}`, { defaultValue: "" }) ||
          err.data?.detail ||
          err.message ||
          t("checkout.errors.generic"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-cairo">
      <header className="bg-black/60 backdrop-blur-md border-b border-yellow-400/10 py-4 px-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-lg"
          >
            <BrandLogo size="header" className="group-hover:opacity-90 transition-opacity" />
          </button>
          <div className="flex items-center gap-2">
            <CurrencySwitcher />
            <LanguageSwitcher />
            <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-green-900/20 border border-green-500/30 px-3 py-1.5 rounded-full">
              <Lock className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-300 font-bold">{t("nav.securePay")}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-yellow-400 text-sm flex items-center gap-1.5 mb-6 transition-colors"
        >
          <BackChevron className="w-4 h-4" /> {t("nav.back")}
        </button>

        <div className={step === 2 ? "space-y-8" : "grid lg:grid-cols-[1fr_400px] gap-8"}>
          <div
            className={`space-y-6 order-2 lg:order-1 min-w-0 ${
              step === 2 ? "w-full max-w-3xl mx-auto" : ""
            }`}
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                <span className="gold-gradient">{t("checkout.title")}</span>
              </h1>
              <p className="text-gray-400 text-sm md:text-base">
                {t("checkout.subtitle", { price: priceFor(product.id) })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <StepDot active={step >= 1} done={step > 1} num={1} label={t("checkout.stepInfo")} />
              <div
                className={`h-0.5 flex-1 rounded-full transition-colors ${
                  step > 1 ? "bg-yellow-400" : "bg-gray-700"
                }`}
              />
              <StepDot active={step >= 2} num={2} label={t("checkout.stepPay")} />
            </div>

            {step === 1 && (
              <form
                onSubmit={proceedToPayment}
                className="dark-card rounded-2xl p-5 md:p-6 space-y-5"
              >
                <h3 className="text-white font-black text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-yellow-400" />
                  {t("checkout.personalInfo")}
                </h3>

                <label className="block">
                  <span className="text-gray-300 text-sm font-bold mb-2 block">{t("checkout.fullName")}</span>
                  <input
                    type="text"
                    required
                    autoFocus
                    autoComplete="name"
                    value={customer.name}
                    onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
                    placeholder={t("common.exampleName")}
                    className="w-full bg-black/40 border border-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-colors"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-300 text-sm font-bold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-yellow-400" />
                    {t("checkout.email")}
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    dir="ltr"
                    value={customer.email}
                    onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full bg-black/40 border border-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-colors text-left"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-300 text-sm font-bold mb-2 block">{t("checkout.whatsapp")}</span>
                  <div className="flex gap-2" dir="ltr">
                    <span className="bg-black/40 border border-gray-700 rounded-xl px-3 py-3 text-gray-300 text-sm font-mono flex items-center">
                      🇸🇦 {t("checkout.whatsappPrefix")}
                    </span>
                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      value={customer.whatsapp}
                      onChange={(e) =>
                        setCustomer((c) => ({
                          ...c,
                          whatsapp: e.target.value.replace(/[^0-9]/g, ""),
                        }))
                      }
                      placeholder="5XXXXXXXX"
                      maxLength={12}
                      className="flex-1 bg-black/40 border border-gray-700 focus:border-yellow-400 rounded-xl px-4 py-3 text-white outline-none text-left"
                    />
                  </div>
                </label>

                {formError && (
                  <div className="bg-red-900/30 border border-red-500/40 text-red-300 rounded-xl p-3 text-sm">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  className="cta-button w-full py-4 rounded-2xl text-base font-black flex items-center justify-center gap-2"
                >
                  {t("checkout.continuePay")}
                  <ForwardChevron />
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-5 w-full min-w-0">
                <DevApiBanner />
                <div className="dark-card rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate">{customer.name}</p>
                    <p className="text-gray-400 text-xs truncate" dir="ltr">
                      {customer.email}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5" dir="ltr">
                      +966 {customer.whatsapp}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-yellow-400 text-xs font-bold hover:underline"
                  >
                    {t("checkout.edit")}
                  </button>
                </div>

                {paymentsEnabled === false && (
                  <div className="bg-amber-900/25 border border-amber-500/40 rounded-xl p-4 space-y-3">
                    <p className="text-amber-100 text-sm font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      {t("checkout.trialDev")}
                    </p>
                    <p className="text-amber-200/90 text-xs leading-relaxed">{t("checkout.trialDevHint")}</p>
                    <button
                      type="button"
                      onClick={startSubscription}
                      disabled={submitting}
                      className="cta-button w-full py-4 rounded-2xl text-base font-black flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" /> {t("checkout.trialDevBtn")}
                        </>
                      )}
                    </button>
                  </div>
                )}

                {paymentsEnabled === null && (
                  <p className="text-gray-400 text-sm flex items-center gap-2 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> {t("checkout.checkingPayments")}
                  </p>
                )}

                {paymentsEnabled === true && (
                  <div className="dark-card rounded-2xl p-5 md:p-6 space-y-5 border border-yellow-400/25">
                    <h3 className="text-white font-black text-lg flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-yellow-400" />
                      {t("checkout.paySecure")}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{t("checkout.payStripeLead")}</p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-gray-500">
                      <span className="inline-flex items-center gap-1 bg-black/30 border border-gray-700 rounded-lg px-2.5 py-1">
                        <Lock className="w-3 h-3 text-green-400" />
                        {t("common.ssl")}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-black/30 border border-gray-700 rounded-lg px-2.5 py-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        {t("common.freeTrialBadge")}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={startSubscription}
                      disabled={submitting}
                      className="cta-button w-full py-4 md:py-5 rounded-2xl text-base md:text-lg font-black flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t("checkout.payStripeLoading")}
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-5 h-5" />
                          {t("checkout.payStripeBtn")}
                        </>
                      )}
                    </button>
                    <p className="text-center text-gray-600 text-[11px]">
                      {t("checkout.payAgree")}
                    </p>
                  </div>
                )}

                <div className="dark-card rounded-2xl p-5 space-y-3">
                  <ul className="text-xs text-gray-400 space-y-2">
                    <li className="flex gap-2 items-start">
                      <RefreshCw className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      {t("checkout.renewMonthly", { price: priceFor(product.id) })}
                    </li>
                    <li className="flex gap-2 items-start">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {t("checkout.trialDay", { price: priceFor(product.id) })}
                    </li>
                    <li className="flex gap-2 items-start">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {t("checkout.refund")}
                    </li>
                  </ul>

                  {formError && (
                    <div className="bg-red-900/30 border border-red-500/40 text-red-300 rounded-xl p-3 text-sm">
                      {formError}
                    </div>
                  )}

                </div>

              </div>
            )}
          </div>

          {step !== 2 && (
          <aside className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="dark-card rounded-2xl p-5 space-y-4 border border-yellow-400/20 glow-gold-sm">
                <h3 className="text-white font-black text-base flex items-center gap-2">
                  <Tag className="w-5 h-5 text-yellow-400" />
                  {t("checkout.summary")}
                </h3>
                <div className="flex gap-3 items-start">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover border border-yellow-400/20"
                  />
                  <div>
                    <p className="text-white font-bold text-sm">{product.name}</p>
                    <p className="text-yellow-400 font-black text-2xl mt-1">
                      {format(product.salePrice)}{" "}
                      <span className="text-sm text-yellow-600">{t("pricing.perMonth")}</span>
                    </p>
                    {checkoutNoteNeeded && (
                      <p className="text-gray-500 text-[11px] mt-2 leading-relaxed">
                        {t("currency.chargeNote", {
                          display: currency,
                          charge: chargeCurrency,
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <ul className="space-y-1.5 border-t border-yellow-400/10 pt-3">
                  {product.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex gap-2 text-gray-300 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <TrustBadges />
            </div>
          </aside>
          )}
        </div>
      </main>
    </div>
  );
}
