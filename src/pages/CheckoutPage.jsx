import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  CreditCard,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Tag,
  User,
} from "lucide-react";

import { stripePromise, isStripeConfigured } from "@/lib/stripe";
import { getProduct } from "@/lib/products";
import { client } from "@/api/client";
import TrustBadges from "@/components/sales/TrustBadges";

/* -------------------------------------------------------------------------- */
/*  Inner Stripe payment form (must live inside <Elements>)                   */
/* -------------------------------------------------------------------------- */
function PaymentForm({ product, customer, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    try {
      const { error: submitErr } = await elements.submit();
      if (submitErr) {
        setError(submitErr.message);
        setSubmitting(false);
        return;
      }

      const res = await client.functions.invoke("createPaymentIntent", {
        productId: product.id,
        customerName: customer.name,
        customerEmail: customer.email,
        whatsapp: customer.whatsapp,
      });

      if (res.data?.simulated) {
        await new Promise((r) => setTimeout(r, 700));
        onSuccess({ paymentIntentId: res.data.paymentIntentId });
        return;
      }

      const { clientSecret, paymentIntentId } = res.data;
      const returnParams = new URLSearchParams({
        productId: product.id,
        product: product.name,
        price: String(product.salePrice),
      });
      if (paymentIntentId) returnParams.set("payment_intent", paymentIntentId);

      const { error: confirmErr } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/thank-you?${returnParams.toString()}`,
          payment_method_data: {
            billing_details: {
              name: customer.name,
              email: customer.email,
              phone: `+966${customer.whatsapp}`,
            },
          },
        },
      });

      if (confirmErr) {
        setError(confirmErr.message || "صار خطأ في الدفع. حاول مرة ثانية.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "صار خطأ. حاول مرة ثانية.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ضمان استرداد 21 يوم
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-yellow-400/90" />
          Stripe + تشفير SSL
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-yellow-400/90" />
          وصول فوري بعد الدفع
        </span>
      </div>
      <p className="text-center">
        <Link
          to="/#faq"
          className="text-yellow-400/90 text-xs font-bold hover:text-yellow-300 transition-colors"
        >
          سؤال قبل إتمام الدفع؟ الأسئلة الشائعة
        </Link>
      </p>

      <div className="dark-card rounded-2xl p-5">
        <h3 className="text-white font-black text-base mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-yellow-400" />
          معلومات البطاقة
        </h3>
        <PaymentElement
          options={{
            layout: "tabs",
            wallets: { applePay: "auto", googlePay: "auto" },
          }}
        />
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/40 text-red-300 rounded-xl p-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="cta-button w-full py-4 md:py-5 rounded-2xl text-lg font-black flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed pulse-gold"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> جاري معالجة الدفع...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" /> ادفع الآن {product.salePrice} ر.س
          </>
        )}
      </button>

      <p className="text-center text-gray-500 text-xs flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3" /> دفع آمن ومشفر عبر Stripe • SSL 256-bit
      </p>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step indicator                                                            */
/* -------------------------------------------------------------------------- */
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
      <span
        className={`text-sm font-bold ${active ? "text-white" : "text-gray-500"}`}
      >
        {label}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main checkout page                                                        */
/* -------------------------------------------------------------------------- */
export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const productId = searchParams.get("product") || "bundle";
  const product = useMemo(() => getProduct(productId), [productId]);

  const [step, setStep] = useState(1); // 1 = customer info, 2 = payment
  const [customer, setCustomer] = useState({ name: "", email: "", whatsapp: "" });
  const [formError, setFormError] = useState(null);

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
      setFormError("اكتب اسمك الكامل من فضلك.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("اكتب إيميلاً صحيحاً — نستخدمه لحسابك في مسار.");
      return;
    }
    if (!/^[0-9]{8,12}$/.test(phone)) {
      setFormError("رقم الواتساب لازم يكون أرقام فقط (٨ إلى ١٢ خانة).");
      return;
    }
    setStep(2);
  };

  const goSuccess = ({ paymentIntentId } = {}) => {
    const q = new URLSearchParams({
      productId: product.id,
      product: product.name,
      price: String(product.salePrice),
    });
    if (paymentIntentId) q.set("payment_intent", paymentIntentId);
    navigate(`/thank-you?${q.toString()}`);
  };

  const stripeOptions = useMemo(
    () => ({
      mode: "payment",
      amount: product.salePrice * 100,
      currency: "sar",
      locale: "ar",
      paymentMethodCreation: "manual",
      appearance: {
        theme: "night",
        labels: "above",
        variables: {
          colorPrimary: "#D4AF37",
          colorBackground: "#0f1424",
          colorText: "#e5e7eb",
          colorTextSecondary: "#9ca3af",
          colorTextPlaceholder: "#6b7280",
          colorDanger: "#ef4444",
          fontFamily: "Cairo, Tajawal, sans-serif",
          fontSizeBase: "15px",
          borderRadius: "12px",
          spacingUnit: "5px",
        },
        rules: {
          ".Input": {
            backgroundColor: "rgba(0,0,0,0.4)",
            border: "1px solid #374151",
            boxShadow: "none",
          },
          ".Input:focus": {
            border: "1px solid #D4AF37",
            boxShadow: "0 0 0 1px #D4AF37",
          },
          ".Tab": {
            backgroundColor: "rgba(0,0,0,0.4)",
            border: "1px solid #374151",
          },
          ".Tab--selected": {
            backgroundColor: "rgba(212,175,55,0.08)",
            border: "1px solid #D4AF37",
            color: "#F5E17A",
          },
          ".Label": {
            color: "#d1d5db",
            fontWeight: "700",
          },
        },
      },
    }),
    [product.salePrice],
  );

  return (
    <div className="min-h-screen bg-background font-cairo" dir="rtl">
      {/* Header */}
      <header className="bg-black/60 backdrop-blur-md border-b border-yellow-400/10 py-4 px-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 group"
          >
            <img
              src="/logo.png"
              alt="مسار · Massar"
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-yellow-400/30 group-hover:ring-yellow-400/60 transition"
            />
            <div className="text-right hidden sm:block">
              <p className="text-yellow-400 font-black text-sm leading-tight">
                مسار · Massar
              </p>
              <p className="text-gray-500 text-xs">إتمام الطلب</p>
            </div>
          </button>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-green-900/20 border border-green-500/30 px-3 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-300 font-bold">دفع آمن</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-yellow-400 text-sm flex items-center gap-1.5 mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" /> رجوع
        </button>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* ───────────────── LEFT COLUMN ───────────────── */}
          <div className="space-y-6 order-2 lg:order-1">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                <span className="gold-gradient">إتمام الطلب</span>
              </h1>
              <p className="text-gray-400 text-sm md:text-base">
                دقيقة وتبدأ رحلتك مع{" "}
                <strong className="text-yellow-400">مسار · Massar</strong>
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-3">
              <StepDot
                active={step >= 1}
                done={step > 1}
                num={1}
                label="بياناتك"
              />
              <div
                className={`h-0.5 flex-1 rounded-full transition-colors ${
                  step > 1 ? "bg-yellow-400" : "bg-gray-700"
                }`}
              />
              <StepDot active={step >= 2} num={2} label="الدفع" />
            </div>

            {/* ─── STEP 1: customer info ─── */}
            {step === 1 && (
              <form
                onSubmit={proceedToPayment}
                className="dark-card rounded-2xl p-5 md:p-6 space-y-5"
              >
                <h3 className="text-white font-black text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-yellow-400" />
                  بياناتك الشخصية
                </h3>

                <label className="block">
                  <span className="text-gray-300 text-sm font-bold mb-2 block">
                    الاسم الكامل
                  </span>
                  <input
                    type="text"
                    required
                    autoFocus
                    autoComplete="name"
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer((c) => ({ ...c, name: e.target.value }))
                    }
                    placeholder="مثال: محمد العمري"
                    className="w-full bg-black/40 border border-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-colors"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-300 text-sm font-bold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-yellow-400" />
                    الإيميل (لحسابك في مسار)
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    dir="ltr"
                    value={customer.email}
                    onChange={(e) =>
                      setCustomer((c) => ({ ...c, email: e.target.value }))
                    }
                    placeholder="you@example.com"
                    className="w-full bg-black/40 border border-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-colors text-left"
                  />
                  <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                    بعد الدفع تنشئ كلمة مرور وتدخل لوحة التحكم — كل منتجاتك وتحديثاتك من مكان واحد.
                  </p>
                </label>

                <label className="block">
                  <span className="text-gray-300 text-sm font-bold mb-2 block">
                    رقم الواتساب
                  </span>
                  <div className="flex gap-2" dir="ltr">
                    <span className="bg-black/40 border border-gray-700 rounded-xl px-3 py-3 text-gray-300 text-sm font-mono flex items-center">
                      🇸🇦 +966
                    </span>
                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={customer.whatsapp}
                      onChange={(e) =>
                        setCustomer((c) => ({
                          ...c,
                          whatsapp: e.target.value.replace(/[^0-9]/g, ""),
                        }))
                      }
                      placeholder="5XXXXXXXX"
                      maxLength={12}
                      className="flex-1 bg-black/40 border border-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-colors text-left"
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                    بنرسل لك رابط التحميل والوصول الفوري على هذا الرقم بعد الدفع.
                  </p>
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
                  متابعة للدفع
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <p className="text-center text-gray-500 text-xs flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  بياناتك محفوظة وآمنة، ما نشاركها مع أي طرف.
                </p>
              </form>
            )}

            {/* ─── STEP 2: stripe payment ─── */}
            {step === 2 && (
              <div className="space-y-5">
                {/* Customer recap */}
                <div className="dark-card rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold text-sm truncate">
                        {customer.name}
                      </p>
                      <p className="text-gray-400 text-xs" dir="ltr">
                        +966 {customer.whatsapp}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-yellow-400 text-xs font-bold hover:underline flex-shrink-0"
                  >
                    تعديل
                  </button>
                </div>

                <Elements stripe={stripePromise} options={stripeOptions}>
                  <PaymentForm
                    product={product}
                    customer={customer}
                    onSuccess={goSuccess}
                  />
                </Elements>

                {!isStripeConfigured() && (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 text-xs text-blue-200 flex gap-2">
                    <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-300" />
                    <span className="leading-relaxed">
                      <strong className="text-blue-100">وضع تجريبي.</strong>{" "}
                      اضبط{" "}
                      <code className="bg-black/40 px-1 py-0.5 rounded text-blue-100">
                        VITE_STRIPE_PUBLISHABLE_KEY
                      </code>{" "}
                      و{" "}
                      <code className="bg-black/40 px-1 py-0.5 rounded text-blue-100">
                        VITE_API_BASE_URL
                      </code>{" "}
                      في <code>.env.local</code> لتفعيل الدفع الحقيقي. حالياً
                      الضغط على «ادفع» يحوّلك مباشرة لصفحة الشكر.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ───────────────── RIGHT COLUMN, order summary ───────────────── */}
          <aside className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="dark-card rounded-2xl p-5 space-y-4 border border-yellow-400/20 glow-gold-sm">
                <h3 className="text-white font-black text-base flex items-center gap-2">
                  <Tag className="w-5 h-5 text-yellow-400" />
                  ملخص الطلب
                </h3>

                <div className="flex gap-3 items-start">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-yellow-400/20"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm leading-snug">
                      {product.name}
                    </p>
                    <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                      {product.subtitle}
                    </p>
                    <div className="inline-flex items-center gap-1 mt-2 bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-black px-2 py-0.5 rounded">
                      خصم {product.discount}
                    </div>
                  </div>
                </div>

                <ul className="space-y-1.5 border-t border-yellow-400/10 pt-3">
                  {product.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-gray-300 text-xs leading-relaxed"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-yellow-400/10 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">السعر الأصلي</span>
                    <span className="text-gray-500 line-through">
                      {product.originalPrice} ر.س
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">خصمك</span>
                    <span className="text-green-400 font-bold">
                      -{product.originalPrice - product.salePrice} ر.س
                    </span>
                  </div>
                </div>

                <div className="border-t border-yellow-400/20 pt-3 flex justify-between items-baseline">
                  <span className="text-white font-black text-base">الإجمالي</span>
                  <div>
                    <span className="text-yellow-400 font-black text-3xl price-tag">
                      {product.salePrice}
                    </span>
                    <span className="text-yellow-600 text-sm mr-1">ر.س</span>
                  </div>
                </div>
              </div>

              <TrustBadges />

              <div className="dark-card rounded-2xl p-4 flex gap-3 items-start">
                <ShieldCheck className="w-6 h-6 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-white font-bold text-sm">
                    ضمان استرداد 21 يوم
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
                    ما ناسبك؟ كلّمنا ونرجع لك فلوسك كاملة، بدون أي أسئلة.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-yellow-400/10 py-6 px-4 text-center mt-8">
        <p className="text-gray-600 text-xs">
          © 2026 Massar (مسار). جميع الحقوق محفوظة. • دفع آمن عبر Stripe
        </p>
      </footer>
    </div>
  );
}
