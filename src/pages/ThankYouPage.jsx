import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  LayoutDashboard,
  PartyPopper,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function ThankYouPage() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("productId") || "bundle";
  const productName = params.get("product") || "مسار · Massar";
  const price = params.get("price") || "149";
  const paymentIntentId =
    params.get("payment_intent") ||
    params.get("payment_intent_client_secret")?.split("_secret")[0] ||
    "";

  const setupHref = paymentIntentId
    ? `/setup-account?payment_intent=${encodeURIComponent(paymentIntentId)}`
    : "/setup-account";

  const [step, setStep] = useState(0);

  useEffect(() => {
    const fire = () => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#D4AF37", "#F5E17A", "#B8860B", "#ffffff"],
      });
    };
    setTimeout(fire, 300);
    setTimeout(fire, 800);

    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = [
    {
      title: "أنشئ حسابك الآن",
      desc: "دقيقة واحدة: إيميل وكلمة مرور — وتدخل لوحة التحكم داخل موقع مسار.",
    },
    {
      title: "ابدأ تسجيل عاداتك",
      desc: "من اللوحة تتابع يومك، وتستقبل تحديثات ومنتجات جديدة لاحقاً بدون روابط متفرقة.",
    },
  ];

  return (
    <div className="min-h-screen bg-background font-cairo flex flex-col items-center justify-start" dir="rtl">
      <div className="w-full bg-green-900/30 border-b border-green-500/30 py-3 px-4 text-center">
        <p className="text-green-300 text-sm font-bold flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          تم تأكيد طلبك بنجاح، يعطيك العافية!
        </p>
      </div>

      <div className="max-w-2xl w-full mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-500/20 border-2 border-green-400/40 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-black text-white flex flex-col items-center justify-center gap-2">
            <span className="flex items-center gap-3">
              مبروووك! <PartyPopper className="w-8 h-8 text-yellow-400" />
            </span>
            <span className="gold-gradient">وصولك جاهز — الخطوة التالية حسابك</span>
          </h1>
          <p className="text-gray-300 text-base leading-relaxed">
            اشتريت <strong className="text-white">{productName}</strong>. أنشئ حسابك لتفتح
            منطقة الأعضاء: تطبيق مسار، تحديثات، ومنتجات تطوير الذات القادمة.
          </p>
          <div className="inline-flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl px-6 py-3">
            <span className="text-gray-400 text-sm">المبلغ المدفوع:</span>
            <span className="text-yellow-400 font-black text-xl">{price} ر.س</span>
          </div>
        </div>

        <Link
          to={setupHref}
          className="cta-button w-full py-5 rounded-2xl text-lg font-black flex items-center justify-center gap-2 pulse-gold"
        >
          <LayoutDashboard className="w-6 h-6" />
          أنشئ حسابك وادخل اللوحة
        </Link>

        <p className="text-center text-gray-500 text-xs flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          دفعة واحدة · وصول مدى الحياة · تحديثات عبر اللوحة
        </p>

        <div className="dark-card rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-black text-lg text-center mb-4">الخطوات التالية</h2>
          {steps.map((s, i) => (
            <div
              key={s.title}
              className={`flex items-start gap-4 transition-all duration-500 ${
                step > i ? "opacity-100" : "opacity-40"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black ${
                  step > i ? "bg-yellow-400 text-black" : "bg-gray-700 text-gray-400"
                }`}
              >
                {i + 1}
              </div>
              <div>
                <p className="text-white font-bold">{s.title}</p>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-5 flex gap-4 items-center">
          <ShieldCheck className="w-8 h-8 text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-white font-bold text-sm">ضمان استرداد 21 يوم</p>
            <p className="text-gray-400 text-xs mt-1">
              ما ناسبك؟ نرجع لك المبلغ كاملاً بدون أسئلة.
            </p>
          </div>
        </div>

        <div className="text-center">
          <a
            href={`https://wa.me/?text=${encodeURIComponent("🚀 انضممت لمسار — نظام عادات ومهام مع لوحة أعضاء!")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-300 text-sm font-bold"
          >
            <Share2 className="w-4 h-4" /> شارك عبر واتساب
          </a>
        </div>
      </div>
    </div>
  );
}
