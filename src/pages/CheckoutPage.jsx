import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Check,
  CheckCircle,
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
import { client } from "@/api/client";
import EmbeddedStripeCheckout from "@/components/checkout/EmbeddedStripeCheckout";
import { fetchStripeConfig } from "@/lib/stripe";
import TrustBadges from "@/components/sales/TrustBadges";
import DevApiBanner from "@/components/checkout/DevApiBanner";
import StripeConfigBanner from "@/components/checkout/StripeConfigBanner";
import PhoneDialSelect, { formatDialPrefix } from "@/components/checkout/PhoneDialSelect";
import BrandLogo from "@/components/BrandLogo";
import { BackChevron, ForwardChevron } from "@/lib/locale-ui";
import {
  getDefaultDialIso,
  getDialCountry,
  validateNationalNumber,
} from "@/lib/phoneDialCodes";
import {
  trackCheckoutStarted,
  trackCheckoutView,
  trackAddToCart,
} from "@/lib/analytics-tracker";

function StepDot({ active, done, num, label }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-0">
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-sm transition-all flex-shrink-0 ${
          done
            ? "bg-primary text-primary-foreground"
            : active
              ? "bg-brand/15 text-primary ring-2 ring-primary"
              : "bg-gray-800 text-gray-500"
        }`}
      >
        {done ? <Check className="w-4 h-4" strokeWidth={3} /> : num}
      </div>
      <span
        className={`checkout-step-label text-xs sm:text-sm font-bold ${active ? "text-white" : "text-gray-500"}`}
      >
        {label}
      </span>
    </div>
  );
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { locale, currency, detectedCountry } = useLocale();
  const { format, priceFor, perDayPriceFor, originalPriceFor, checkoutNoteNeeded, chargeCurrency } = usePricing();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const product = useLocalizedProduct("bundle");

  useEffect(() => {
    const requested = searchParams.get("product");
    if (requested && requested !== "bundle") {
      const next = new URLSearchParams(searchParams);
      next.set("product", "bundle");
      navigate(`/checkout?${next.toString()}`, { replace: true });
    }
  }, [searchParams, navigate]);

  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    whatsapp: "",
    dialIso: getDefaultDialIso(locale, null),
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentsEnabled, setPaymentsEnabled] = useState(null);
  const dialInitialized = useRef(false);

  const dialCountry = getDialCountry(customer.dialIso);

  useEffect(() => {
    if (detectedCountry && !dialInitialized.current) {
      dialInitialized.current = true;
      setCustomer((c) => ({
        ...c,
        dialIso: getDefaultDialIso(locale, detectedCountry),
      }));
    }
  }, [detectedCountry, locale]);

  useEffect(() => {
    fetchStripeConfig().then((cfg) => setPaymentsEnabled(cfg.paymentsEnabled));
  }, []);

  useEffect(() => {
    trackCheckoutView(productId);
  }, [productId]);

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
    if (!validateNationalNumber(customer.dialIso, phone)) {
      setFormError(t("checkout.errors.phone"));
      return;
    }
    if (customer.password.length < 8) {
      setFormError(t("auth.errors.weak_password"));
      return;
    }
    if (customer.password !== customer.confirmPassword) {
      setFormError(t("auth.passwordMismatch"));
      return;
    }
    trackAddToCart(product.id);
    setStep(2);
  };

  const startSubscription = async () => {
    setSubmitting(true);
    setFormError(null);
    trackCheckoutStarted(product.id, { email: customer.email.trim().toLowerCase() });
    try {
      const res = await client.functions.invoke("createCheckoutSession", {
        productId: product.id,
        customerName: customer.name.trim(),
        customerEmail: customer.email.trim().toLowerCase(),
        password: customer.password,
        whatsapp: customer.whatsapp.trim(),
        whatsappDialCode: dialCountry.dial,
        locale,
        embedded: true,
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
        navigate(`/checkout/success?${q.toString()}`);
        return;
      }

      setFormError(t("checkout.errors.generic"));
    } catch (err) {
      console.error(err);
      const code = err.data?.error;
      const rawDetail = err.data?.detail || "";
      const showDetail =
        import.meta.env.DEV && rawDetail && !/is not defined/i.test(rawDetail);
      setFormError(
        t(`checkout.errors.${code}`, { defaultValue: "" }) ||
          (showDetail ? rawDetail : "") ||
          t("checkout.errors.generic"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page min-h-screen bg-background">
      <header className="bg-black/60 backdrop-blur-md border-b border-brand/10 py-3 sm:py-4 sticky top-0 z-40 overflow-visible">
        <div className="checkout-header-inner flex items-center justify-between gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          >
            <BrandLogo size="header" className="group-hover:opacity-90 transition-opacity" />
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <CurrencySwitcher />
            <LanguageSwitcher />
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-green-900/20 border border-green-500/30 px-2.5 sm:px-3 py-1.5 rounded-full">
              <Lock className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              <span className="text-green-300 font-bold whitespace-nowrap">{t("nav.securePay")}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="checkout-main py-6 sm:py-8 md:py-10 lg:py-12">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-primary text-sm sm:text-base flex items-center gap-1.5 mb-5 sm:mb-6 transition-colors"
        >
          <BackChevron className="w-4 h-4" /> {t("nav.back")}
        </button>

        <div
          className={
            step === 2
              ? "space-y-6 sm:space-y-8 max-w-3xl mx-auto w-full"
              : "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_min(100%,24rem)] gap-6 lg:gap-10"
          }
        >
          <div
            className={`space-y-5 sm:space-y-6 order-2 lg:order-1 min-w-0 w-full ${
              step === 2 ? "" : ""
            }`}
          >
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                <span className="gold-gradient">{t("checkout.title")}</span>
              </h1>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-2xl">
                {step === 1 ? t("checkout.subtitleBlind") : t("checkout.subtitle", { price: priceFor(product.id) })}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <StepDot active={step >= 1} done={step > 1} num={1} label={t("checkout.stepInfo")} />
              <div
                className={`h-0.5 flex-1 rounded-full transition-colors ${
                  step > 1 ? "bg-primary" : "bg-gray-700"
                }`}
              />
              <StepDot active={step >= 2} done={false} num={2} label={t("checkout.stepPay")} />
            </div>

            {step === 1 && (
              <form
                onSubmit={proceedToPayment}
                className="checkout-card dark-card p-5 sm:p-6 md:p-7 space-y-5 sm:space-y-6"
              >
                <h3 className="text-white font-black text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
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
                    className="checkout-field w-full bg-black/40 border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-white placeholder:text-gray-500 outline-none transition-colors"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-300 text-sm sm:text-[15px] font-bold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
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
                    className="checkout-field w-full bg-black/40 border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-white placeholder:text-gray-500 outline-none transition-colors text-left"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-300 text-sm sm:text-[15px] font-bold mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    {t("checkout.accountPassword")}
                  </span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={customer.password}
                    onChange={(e) => setCustomer((c) => ({ ...c, password: e.target.value }))}
                    className="checkout-field w-full bg-black/40 border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-white outline-none transition-colors"
                  />
                  <p className="text-gray-500 text-xs mt-1.5">{t("checkout.accountPasswordHint")}</p>
                </label>

                <label className="block">
                  <span className="text-gray-300 text-sm font-bold mb-2 block">{t("auth.confirmPassword")}</span>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={customer.confirmPassword}
                    onChange={(e) =>
                      setCustomer((c) => ({ ...c, confirmPassword: e.target.value }))
                    }
                    className="checkout-field w-full bg-black/40 border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-white outline-none transition-colors"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-300 text-sm sm:text-[15px] font-bold mb-2 block">{t("checkout.whatsapp")}</span>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5" dir="ltr">
                    <PhoneDialSelect
                      value={customer.dialIso}
                      onChange={(iso) => setCustomer((c) => ({ ...c, dialIso: iso }))}
                    />
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
                      placeholder={t("checkout.whatsappPlaceholder")}
                      maxLength={dialCountry.max}
                      className="checkout-field flex-1 min-w-0 bg-black/40 border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-white outline-none text-left"
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
                  className="cta-button checkout-cta w-full rounded-2xl font-black flex items-center justify-center gap-2 pulse-gold"
                >
                  {t("checkout.continuePay")}
                  <ForwardChevron />
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-5 w-full min-w-0">
                <div className="dark-card rounded-2xl p-5 border border-success/25 space-y-2 w-full">
                  <p className="text-success/90 text-xs font-black uppercase tracking-wide">{t("checkout.valueFramingTitle")}</p>
                  <p className="text-white font-black text-2xl">
                    {format(product.salePrice)}{" "}
                    <span className="text-brand text-sm font-bold">{t("pricing.perMonth")}</span>
                  </p>
                  <p className="text-success/90 text-sm font-bold">{t("checkout.valuePerDay", { perDay: perDayPriceFor(product.id) })}</p>
                  <p className="text-gray-500 text-xs line-through">{t("checkout.valueAnchor", { anchor: originalPriceFor(product.id), price: priceFor(product.id) })}</p>
                </div>
                <DevApiBanner />
                <StripeConfigBanner />
                <div className="dark-card rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate">{customer.name}</p>
                    <p className="text-gray-400 text-xs truncate" dir="ltr">
                      {customer.email}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5" dir="ltr">
                      {formatDialPrefix(customer.dialIso)} {customer.whatsapp}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-primary text-xs font-bold hover:underline"
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
                      className="cta-button checkout-cta w-full rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-60"
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
                  <>
                    <EmbeddedStripeCheckout
                      product={product}
                      customer={customer}
                      password={customer.password}
                      locale={locale}
                      onError={(err) => {
                        console.error(err);
                        const code = err?.data?.error;
                        const rawDetail = err?.data?.detail || "";
                        const showDetail =
                          import.meta.env.DEV && rawDetail && !/is not defined/i.test(rawDetail);
                        setFormError(
                          t(`checkout.errors.${code}`, { defaultValue: "" }) ||
                            (showDetail ? rawDetail : "") ||
                            t("checkout.errors.generic"),
                        );
                      }}
                    />
                    <p className="text-center text-gray-600 text-[11px]">{t("checkout.payAgree")}</p>
                  </>
                )}

                <div className="dark-card rounded-2xl p-5 space-y-3">
                  <ul className="text-xs text-gray-400 space-y-2">
                    <li className="flex gap-2 items-start">
                      <RefreshCw className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                      {t("checkout.renewMonthly", { price: priceFor(product.id) })}
                    </li>
                    <li className="flex gap-2 items-start">
                      <ShieldCheck className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                      {t("checkout.billedToday", { price: priceFor(product.id) })}
                    </li>
                    <li className="flex gap-2 items-start">
                      <ShieldCheck className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
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
            <div className="lg:sticky lg:top-[5.5rem] space-y-4 sm:space-y-5">
              <div className="dark-card rounded-2xl p-5 space-y-4 border border-brand/20 glow-gold-sm">
                <h3 className="text-white font-black text-base flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  {t("checkout.summaryBlindTitle")}
                </h3>
                <div className="flex gap-3 items-start">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover border border-brand/20"
                  />
                  <div>
                    <p className="text-white font-bold text-sm">{product.name}</p>
                    <p className="text-gray-400 text-xs mt-2 leading-relaxed">{t("checkout.summaryBlindBody")}</p>
                  </div>
                </div>
                <ul className="space-y-1.5 border-t border-brand/10 pt-3">
                  {product.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex gap-2 text-gray-300 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
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
