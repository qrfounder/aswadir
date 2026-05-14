import { useEffect, useState } from "react";
import { CheckCircle, Download, Mail, Star, Share2, ArrowRight, PartyPopper, ShieldCheck, Rocket } from "lucide-react";
import confetti from "canvas-confetti";
import StarRating from "@/components/sales/StarRating";

export default function ThankYouPage() {
  const params = new URLSearchParams(window.location.search);
  const productName = params.get("product") || "مسار · Massar";
  const price = params.get("price") || "37";

  const [step, setStep] = useState(0);

  useEffect(() => {
    // Fire confetti
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

    // Step animation
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 1900),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = [
    { icon: Mail, title: "شيّك على إيميلك", desc: "أرسلنا لك رابط الوصول الفوري على إيميلك. شيّك صندوق الوارد أو مجلد السبام." },
    { icon: Download, title: "انسخ الملف على Drive حقك", desc: "اضغط على الرابط والملف ينسخ تلقائي على Google Drive حقك. تحتاج بس حساب Gmail مجاني." },
    { icon: Star, title: "ابدأ اليوم، مو بكرة", desc: "افتح الملف، حط عاداتك الأولى، وابدأ السلسلة. أول 5 دقايق بتغيّر يومك كامل." },
  ];

  return (
    <div className="min-h-screen bg-background font-cairo flex flex-col items-center justify-start" dir="rtl">
      {/* Top bar */}
      <div className="w-full bg-green-900/30 border-b border-green-500/30 py-3 px-4 text-center">
        <p className="text-green-300 text-sm font-bold flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          تم تأكيد طلبك بنجاح، يعطيك العافية!
        </p>
      </div>

      <div className="max-w-2xl w-full mx-auto px-4 py-12 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-500/20 border-2 border-green-400/40 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-black text-white flex flex-col items-center justify-center gap-2">
            <span className="flex items-center gap-3">مبروووك! <PartyPopper className="w-8 h-8 text-yellow-400" /></span>
            <span className="gold-gradient">رحلة الانضباط تبدأ الحين</span>
          </h1>
          <p className="text-gray-300 text-base leading-relaxed">
            اتخذت القرار اللي يفرق بين اللي يوصل واللي يتمنى.<br />
            <strong className="text-white">"{productName}"</strong> في طريقه لإيميلك.
          </p>
          <div className="inline-flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl px-6 py-3">
            <span className="text-gray-400 text-sm">المبلغ المدفوع:</span>
            <span className="text-yellow-400 font-black text-xl">{price} ر.س</span>
          </div>
        </div>

        {/* Steps */}
        <div className="dark-card rounded-2xl p-6 space-y-6">
          <h2 className="text-white font-black text-lg text-center mb-4 flex items-center justify-center gap-2">
            <Rocket className="w-5 h-5 text-yellow-400" /> الخطوات التالية
          </h2>
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex items-start gap-4 transition-all duration-500 ${
                step > i ? "opacity-100 translate-y-0" : "opacity-30 translate-y-2"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                step > i ? "bg-yellow-400 text-black" : "bg-gray-700 text-gray-400"
              }`}>
                {step > i ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="font-black text-sm">{i + 1}</span>
                )}
              </div>
              <div>
                <p className="text-white font-bold text-base">{s.title}</p>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee reminder */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-5 flex gap-4 items-center">
          <div className="flex-shrink-0"><ShieldCheck className="w-8 h-8 text-blue-400" /></div>
          <div>
            <p className="text-white font-bold text-sm">أنت محمي بضمان 21 يوم كامل</p>
            <p className="text-gray-400 text-xs mt-1">إذا ما ناسبك لأي سبب، كلّمنا ونرجع لك فلوسك كاملة، بدون أي أسئلة.</p>
          </div>
        </div>

        {/* Social share nudge */}
        <div className="text-center space-y-4">
          <p className="text-gray-400 text-sm">ساعد صاحبك يبدأ رحلة الانضباط:</p>
          <div className="flex gap-3 justify-center">
            <a
              href={`https://wa.me/?text=${encodeURIComponent("🚀 لقيت نظام رهيب لتتبع العادات والمهام، والله غيّر يومي! مسار · Massar بخصم 85%")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-700/30 border border-green-600/40 text-green-300 px-5 py-3 rounded-xl text-sm font-bold hover:bg-green-700/50 transition-all"
            >
              <Share2 className="w-4 h-4" />
              شارك عبر واتساب
            </a>
            <a
              href="/"
              className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 px-5 py-3 rounded-xl text-sm font-bold hover:bg-yellow-400/20 transition-all"
            >
              العودة للرئيسية
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Motivational quote */}
        <div className="text-center py-6 border-t border-yellow-400/10">
          <p className="text-gray-300 text-lg italic leading-relaxed">
            "النجاح مو صدفة، هو نتيجة عادات يومية تتراكم مع الوقت."
          </p>
          <p className="text-yellow-400 font-bold text-sm mt-2">فريق مسار · Massar</p>
        </div>

        {/* Footer */}
        <div className="text-center pb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img
              src="/logo.png"
              alt="مسار · Massar"
              className="w-7 h-7 rounded-md object-cover ring-1 ring-yellow-400/30"
            />
            <span className="text-yellow-400 font-black text-sm">مسار · Massar</span>
          </div>
          <p className="text-gray-600 text-xs">© 2026 Massar (مسار). جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
}