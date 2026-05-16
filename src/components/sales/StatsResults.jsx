const STATS = [
  { emoji: "🎯", value: "92%", label: "أبلغوا عن تركيز أوضح وأقل تشتت خلال 3 أيام" },
  { emoji: "🔥", value: "89%", label: "بنوا عادات يومية أقوى خلال 14 يوم" },
  { emoji: "📈", value: "95%", label: "حسّوا بمساءلة أعلى من أي نظام سابق" },
];

export default function StatsResults() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-yellow-400/80 text-sm font-bold mb-2">📊 نتائج مجتمع مسار</p>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
          نظام بسيط + <span className="gold-gradient">إجراء يومي</span> = تقدم حقيقي
        </h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          الاستمرارية مو حظ — هي نظام. هذي نتائج استطلاعات من مستخدمينا النشطين.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.value}
            className="dark-card rounded-2xl p-6 text-center border border-yellow-400/10 hover:border-yellow-400/30 transition-colors"
          >
            <span className="text-4xl mb-3 block" role="img" aria-hidden>
              {stat.emoji}
            </span>
            <p className="text-4xl md:text-5xl font-black gold-gradient mb-3">{stat.value}</p>
            <p className="text-gray-300 text-sm leading-relaxed">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
