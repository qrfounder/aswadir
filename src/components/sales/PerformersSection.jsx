const PILLARS = [
  {
    emoji: "✅",
    title: "مبني للاستمرارية",
    desc: "الانضباط يصير أسهل لما النظام يشتغل عنك. هالأداة تخلّيك ثابت يوم بعد يوم.",
  },
  {
    emoji: "⚡",
    title: "إنتاجية أسرع",
    desc: "تخطيط يومي واضح يقلّل التشتت ويساعدك تنفّذ بسرعة وبتركيز.",
  },
  {
    emoji: "📊",
    title: "تقدم تشوفه بعينك",
    desc: "أشرطة وتقدم مرئي يفعّل دائرة المكافأة في دماغك ويزيد حماسك.",
  },
  {
    emoji: "🔒",
    title: "وصول مدى الحياة",
    desc: "دفعة وحدة واستخدمه للأبد. أداة طويلة المدى لأهداف طويلة المدى.",
  },
];

export default function PerformersSection() {
  return (
    <div className="space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-yellow-400/80 text-sm font-bold mb-2">🏆 مصمّم لطموحين</p>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
          مصمّم لـ <span className="gold-gradient">أصحاب الأداء العالي</span>
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          مو تطبيق عادي — نظام Google Sheets جاهز بصيغ ورسوم بيانية تلقائية، مثل أفضل أنظمة العادات العالمية.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {PILLARS.map((item) => (
          <div key={item.title} className="dark-card rounded-2xl p-6 flex gap-4">
            <span className="text-3xl flex-shrink-0" role="img" aria-hidden>
              {item.emoji}
            </span>
            <div>
              <h3 className="text-white font-black text-base mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
