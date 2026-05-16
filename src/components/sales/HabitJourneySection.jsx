const WEEKS = [
  {
    w: "الأسبوع 1",
    title: "تثبيت الروتين",
    desc: "5 دقايق يومياً، أول سلسلة تظهر قدامك. التركيز على البساطة مو الكمال.",
  },
  {
    w: "الأسبوع 2",
    title: "السلسلة تشتغل لك",
    desc: "الدماغ يبدأ يربط الشعور بالإنجاز باللون والشكل. التخطيط يصير أسهل.",
  },
  {
    w: "الأسبوع 3–4",
    title: "ثبات أعلى، حماس أعلى",
    desc: "الرسم البياني يوريك زحف التقدّم. وقتها يصير أصعب «تكسر» السلسلة من تخطّي يوم.",
  },
];

export default function HabitJourneySection() {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-yellow-400/80 text-sm font-bold mb-2">رحلة واقعية</p>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
          وش يصير خلال <span className="gold-gradient">أول شهر؟</span>
        </h2>
        <p className="text-gray-400 text-sm">
          مو وعد سحري: هذي مسار غالب المستخدمين لما يلتزمون بالتسجيل اليومي.
        </p>
      </div>

      <div className="relative max-w-3xl mx-auto space-y-6 me-0">
        <div
          className="hidden md:block absolute end-[1.125rem] top-3 bottom-3 w-px bg-yellow-400/25"
          aria-hidden
        />
        {WEEKS.map((step, i) => (
          <div key={step.w} className="relative flex gap-4 md:gap-6 items-start md:pe-10">
            <div className="flex flex-col items-center flex-shrink-0">
              <span className="w-9 h-9 rounded-full bg-yellow-400 text-black font-black text-sm flex items-center justify-center ring-4 ring-black z-10">
                {i + 1}
              </span>
            </div>
            <div className="dark-card rounded-2xl p-5 flex-1 border border-yellow-400/10">
              <p className="text-yellow-400/90 text-xs font-bold mb-1">{step.w}</p>
              <h3 className="text-white font-black text-base mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
