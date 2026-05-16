const PILLARS = [
  {
    emoji: "⏱️",
    title: "تسجيل يومي بـ 5 دقايق",
    desc: "ما تحتاج ساعات — بس علّم على عاداتك وشوف تقدمك يتحدّث.",
  },
  {
    emoji: "🧠",
    title: "مبني على علم السلوك",
    desc: "سلاسل مرئية + تغذية راجعة فورية = عادات تلتصق بدون حرق.",
  },
  {
    emoji: "🛡️",
    title: "ضمان استرداد 21 يوم",
    desc: "جرّبه براحتك. مو مناسب؟ نرجع فلوسك كاملة بدون أسئلة.",
  },
];

export default function TrustPillars() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {PILLARS.map((item) => (
        <div
          key={item.title}
          className="dark-card rounded-2xl p-6 text-center border border-yellow-400/10"
        >
          <span className="text-4xl mb-4 block" role="img" aria-hidden>
            {item.emoji}
          </span>
          <h3 className="text-white font-black text-base mb-2">{item.title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
