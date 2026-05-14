import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Award, Link2, TrendingUp, Brain, Target, BarChart, Zap, Smartphone, Rocket } from "lucide-react";

import UrgencyBar from "@/components/sales/UrgencyBar";
import PricingSection from "@/components/sales/PricingSection";
import BeforeAfter from "@/components/sales/BeforeAfter";
import TestimonialCard from "@/components/sales/TestimonialCard";
import FAQSection from "@/components/sales/FAQSection";
import TrustBadges from "@/components/sales/TrustBadges";
import SocialProofBar from "@/components/sales/SocialProofBar";
import StarRating from "@/components/sales/StarRating";
import CountdownTimer from "@/components/sales/CountdownTimer";

const TESTIMONIALS = [
  {
    name: "محمد العمري",
    role: "رائد أعمال، الرياض",
    text: "صراحة أنا من الناس اللي جربت كل شي وما كملت. هالنظام غير، صار لي 6 شهور ما فوّتت يوم. يومي صار واضح ومرتب وأحس بإنجاز حقيقي.",
    verified: true,
    date: "مارس 2026",
    avatar: "/avatars/mohammed.png",
  },
  {
    name: "خالد الشمري",
    role: "مدير تسويق، دبي",
    text: "والله جربت تطبيقات كثير وكلها نفس الشي، تحمّلها وتنساها. هالنظام مختلف، لما تشوف السلسلة تطول قدامك مستحيل تبي توقف.",
    verified: true,
    date: "فبراير 2026",
    avatar: "/avatars/khalid.png",
  },
  {
    name: "عبدالله القحطاني",
    role: "طالب ماجستير، الرياض",
    text: "أحسن 37 ريال صرفتها في حياتي بدون مبالغة. حطيت أهدافي الدراسية والصحية وبديت أشوف نتايج من أول أسبوع. يخليك تحاسب نفسك بنفسك.",
    verified: true,
    date: "أبريل 2026",
    avatar: "/avatars/abdullah.png",
  },
  {
    name: "سارة المطيري",
    role: "مدربة لياقة، الرياض",
    text: "أخيراً لقيت شي يخليني ألتزم! صار لي أكثر من 90 يوم ما قطعت تمريني ولا أكلي الصحي. الأداة ذي تناسب أي أحد يبي يغيّر عاداته.",
    verified: true,
    date: "مارس 2026",
    avatar: "/avatars/sara.png",
  },
  {
    name: "فيصل الدوسري",
    role: "مستشار مالي، جدة",
    text: "أبسط شي وأقوى شي. كل يوم الصبح 5 دقايق وأعرف وش بسوي بيومي كامل. إنتاجيتي ارتفعت بشكل ما توقعته أبداً.",
    verified: true,
    date: "يناير 2026",
    avatar: "/avatars/faisal.png",
  },
  {
    name: "نورة الحربي",
    role: "مديرة مشاريع، الرياض",
    text: "شريته عشان الشغل وصرت أستخدمه بكل شي: عاداتي ومهامي وأهدافي الشخصية. النقاط والرسوم البيانية تخليك تبي تكمل مو تبي توقف.",
    verified: true,
    date: "أبريل 2026",
    avatar: "/avatars/noura.png",
  },
];

const FEATURES = [
  {
    icon: Link2,
    title: "سلاسل ما تبي تقطعها",
    desc: "كل يوم تكمل فيه، السلسلة تطول قدامك. وكل ما طالت، صار أصعب عليك توقفها. مو مجرد عادة، صار تحدّي بينك وبين نفسك.",
  },
  {
    icon: TrendingUp,
    title: "لوحة تحكم تشتغل لحالها",
    desc: "كل شي يتحدّث تلقائي: نقاط ورسوم بيانية ومؤشرات. تشوف تقدمك بعينك وتحس بالإنجاز. هالشي يخلّيك تبي تكمل من نفسك.",
  },
  {
    icon: Brain,
    title: "وداعاً للتشتت",
    desc: "بدال ما تقعد كل صباح تفكر وش بتسوي، النظام يرتّب لك أولوياتك من البداية. طاقتك تروح على الإنجاز مو على التفكير.",
  },
  {
    icon: Target,
    title: "أهدافك تصير أرقام تشوفها",
    desc: "الهدف اللي بس براسك ما يحفّزك. بس لما تشوفه رقم ونسبة ورسم بياني قدامك، تحس إنك فعلاً تتقدم كل يوم.",
  },
];

export default function ProductPage() {
  const navigate = useNavigate();
  const pricingRef = useRef(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showStickyBuy, setShowStickyBuy] = useState(false);

  const productImages = [
    "/products/hero.png",
    "/products/box.png",
    "/products/habits.png",
    "/products/tasks.png",
  ];

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBuy(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSelectProduct = (product) => {
    if (window.self !== window.top) {
      alert("الدفع يشتغل بس من التطبيق المنشور. افتح الرابط الأصلي للتطبيق.");
      return;
    }
    setIsCheckingOut(true);
    navigate(`/checkout?product=${encodeURIComponent(product.id)}`);
  };

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background font-cairo" dir="rtl">
      <UrgencyBar />

      {/* Header / Nav */}
      <header className="bg-black/50 backdrop-blur-md border-b border-yellow-400/10 py-4 px-4 sticky top-[44px] z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="مسار · Massar"
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-yellow-400/30"
            />
            <div>
              <p className="text-yellow-400 font-black text-sm leading-tight">مسار · Massar</p>
              <p className="text-gray-500 text-xs">متتبع العادات والمهام</p>
            </div>
          </div>
          <button
            onClick={scrollToPricing}
            className="cta-button px-5 py-2 rounded-xl text-sm font-black"
          >
            اشتري الآن
          </button>
        </div>
      </header>

      <main>
        {/* ─── HERO ─── */}
        <section className="hero-gradient pt-10 pb-14 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Copy */}
              <div className="order-2 lg:order-1 space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-2">
                  <Users className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-300 text-sm font-bold">+15,000 مستخدم نشط</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-white">
                  خلاص وقف الفوضى<br />
                  <span className="gold-gradient">
                    رتّب يومك كامل<br />
                    في 5 دقايق
                  </span>
                </h1>

                <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                  النظام الوحيد اللي يخلّي عاداتك ومهامك <strong className="text-white">قدام عينك، ممتعة، ومستحيل تتجاهلها</strong>. مبني على أبحاث علم السلوك ويشتغل على Google Sheets و Excel.
                </p>

                {/* Mini social proof */}
                <div className="flex items-center gap-3">
                  <StarRating size="lg" />
                  <span className="text-gray-300 text-sm">
                    <strong className="text-white">4.9/5</strong> من +2,544 تقييم حقيقي
                  </span>
                </div>

                {/* Quick benefits */}
                <ul className="space-y-2.5">
                  {[
                    { icon: Link2, text: "سلاسل يومية، كل ما طالت صعب توقفها" },
                    { icon: BarChart, text: "لوحة تحكم تشتغل لحالها بدون أي خبرة" },
                    { icon: Zap, text: "تحميل فوري، ابدأ اليوم خلال 60 ثانية" },
                    { icon: Smartphone, text: "يشتغل على الجوال والتابلت واللابتوب" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-200 text-sm">
                      <span className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-yellow-400" />
                      </span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>

                <button onClick={scrollToPricing} className="cta-button w-full py-4 md:py-5 rounded-2xl text-lg md:text-xl font-black pulse-gold flex justify-center items-center gap-2">
                   <Rocket className="w-6 h-6" /> خذه الحين بس 37 ر.س
                </button>
                <p className="text-center text-gray-500 text-xs">✅ ضمان استرداد 21 يوم • بدون أي أسئلة</p>
              </div>

              {/* Product image */}
              <div className="order-1 lg:order-2 space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-yellow-400/20 glow-gold">
                  <img
                    src={productImages[activeImage]}
                    alt="مسار · Massar"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full">
                    خصم 85%
                  </div>
                </div>
                <div className="flex gap-2">
                  {productImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`flex-1 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === i ? "border-yellow-400" : "border-gray-700"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-16 object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SOCIAL PROOF BAR ─── */}
        <section className="py-6 px-4 bg-black/30 border-y border-yellow-400/10">
          <div className="max-w-3xl mx-auto">
            <SocialProofBar />
          </div>
        </section>

        {/* ─── BEFORE / AFTER ─── */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                هل هذا يصف <span className="gold-gradient">واقعك الآن؟</span>
              </h2>
              <p className="text-gray-400 text-base">الفرق بين اللي يوصل واللي يتمنى هو النظام، مو الإرادة</p>
            </div>
            <BeforeAfter />
          </div>
        </section>

        <hr className="section-divider mx-8" />

        {/* ─── PRODUCT DEMO GIF ─── */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
              شاهد النظام في <span className="gold-gradient">العمل</span>
            </h2>
            <p className="text-gray-400 mb-8">كل يوم تسجّل إنجازاتك وتشوف تقدمك يكبر قدام عينك</p>
            <div className="rounded-2xl overflow-hidden border border-yellow-400/20 glow-gold max-w-2xl mx-auto">
              <img
                src="https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_3.gif?v=1765128020"
                alt="نظام الانضباط في العمل"
                className="w-full"
              />
            </div>
          </div>
        </section>

        <hr className="section-divider mx-8" />

        {/* ─── FEATURES ─── */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                لماذا <span className="gold-gradient">يعمل هذا النظام؟</span>
              </h2>
              <p className="text-gray-400">مبني على دراسات علمية في السلوك والتحفيز</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {FEATURES.map((feat, i) => (
                <div key={i} className="dark-card rounded-2xl p-6 flex gap-4">
                  <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feat.icon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-base mb-2">{feat.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── MORE GIFS ─── */}
        <section className="py-10 px-4 bg-black/20">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                "https://mindsetstack.co/cdn/shop/files/Video_1.gif?v=1765127696",
                "https://mindsetstack.co/cdn/shop/files/Video_2.gif?v=1765128013",
                "https://mindsetstack.co/cdn/shop/files/Video_3.gif?v=1765128020",
              ].map((gif, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-yellow-400/10">
                  <img src={gif} alt="" className="w-full h-auto" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="section-divider mx-8" />

        {/* ─── TESTIMONIALS ─── */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-2 mb-4">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-300 text-sm font-bold">+2,544 تقييم حقيقي</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                ماذا يقول <span className="gold-gradient">المستخدمون؟</span>
              </h2>
              <div className="flex justify-center items-center gap-2 mt-2">
                <StarRating size="xl" />
                <span className="text-white font-black text-2xl">4.9</span>
                <span className="text-gray-400">/ 5</span>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TESTIMONIALS.map((t, i) => (
                <TestimonialCard key={i} {...t} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── EXTRA REVIEWS ─── */}
        <section className="py-10 px-4 bg-black/20">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  img: "/avatars/ahmed.png",
                  name: "أحمد الغامدي",
                  role: "مهندس برمجيات، جدة",
                  text: "هالنظام يخلّيك تحاسب نفسك بطريقة ما سوّاها أي تطبيق ثاني. صار لي 7 شهور ما فوّتت أسبوع تمارين. السلاسل والأشرطة تحمّسك بزيادة.",
                },
                {
                  img: "/avatars/omar.png",
                  name: "عمر الحربي",
                  role: "صاحب مشروع، الرياض",
                  text: "أداة بسيطة بس والله غيّرت يومي كامل. لما تشوف السلاسل تطول تحس بحماس، صرت أتحمّس أسجّل إنجازاتي كل مسا.",
                },
              ].map((r, i) => (
                <div key={i} className="testimonial-card rounded-2xl p-5 flex gap-4">
                  <img src={r.img} alt={r.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  <div>
                    <StarRating size="sm" />
                    <p className="text-gray-200 text-sm mt-2 leading-relaxed">{r.text}</p>
                    <p className="text-white text-sm font-bold mt-2">{r.name}</p>
                    <p className="text-gray-500 text-xs">{r.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="section-divider mx-8" />

        {/* ─── PRICING ─── */}
        <section ref={pricingRef} className="py-16 px-4" id="pricing">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                ابدأ <span className="gold-gradient">نظامك اليوم</span>
              </h2>
              <p className="text-gray-400">عرض محدود، السعر هذا ما بيستمر طويل</p>
            </div>
            <PricingSection onSelectProduct={handleSelectProduct} />
            <div className="mt-6">
              <TrustBadges />
            </div>
          </div>
        </section>

        <hr className="section-divider mx-8" />

        {/* ─── FAQ ─── */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                أسئلة <span className="gold-gradient">شائعة</span>
              </h2>
            </div>
            <FAQSection />
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="py-16 px-4 hero-gradient">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-black text-white">
              باقي عليك <span className="gold-gradient">قرار واحد</span><br />
              وتتغير حياتك
            </h2>
            <p className="text-gray-300 text-base md:text-lg">
              كل شخص ناجح عنده نظام. هذا نظامك، جاهز خلال 60 ثانية.
            </p>
            <button onClick={scrollToPricing} className="cta-button w-full max-w-sm px-8 py-4 md:py-5 rounded-2xl text-lg md:text-xl font-black flex justify-center items-center gap-2 mx-auto pulse-gold">
              <Rocket className="w-6 h-6" /> ابدأ الحين بس 37 ر.س
            </button>
            <p className="text-gray-500 text-sm">✅ ضمان استرداد كامل 21 يوم • دفع آمن • تحميل فوري</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 border-t border-yellow-400/10 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <img
            src="/logo.png"
            alt="مسار · Massar"
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-yellow-400/30"
          />
          <span className="text-yellow-400 font-black text-sm">مسار · Massar</span>
        </div>
        <p className="text-gray-600 text-xs">
          © 2026 Massar (مسار). جميع الحقوق محفوظة.
        </p>
        <p className="text-gray-700 text-xs mt-1">السعودية • الإمارات • الكويت • البحرين • قطر • عُمان</p>
      </footer>

      {/* Sticky Buy CTA */}
      {showStickyBuy && (
        <div className="sticky-cta fixed bottom-0 left-0 right-0 z-50 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="flex-1">
              <p className="text-white font-black text-sm">الباقة الكاملة</p>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs line-through">225 ر.س</span>
                <span className="text-yellow-400 font-black">37 ر.س</span>
                <span className="bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded">-85%</span>
              </div>
            </div>
            <button
              onClick={scrollToPricing}
              className="cta-button px-6 py-3 rounded-xl text-sm font-black flex-shrink-0"
            >
              اشتري الآن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}