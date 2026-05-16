export default function ResearchSection() {
  return (
    <div className="dark-card rounded-2xl p-8 md:p-10 space-y-6">
      <div className="text-center space-y-3">
        <p className="text-yellow-400/80 text-sm font-bold">🔬 ليش يشتغل؟</p>
        <h2 className="text-2xl md:text-3xl font-black text-white">
          تقدر تسوّيه — <span className="gold-gradient">بنظام مثبت</span>
        </h2>
      </div>
      <div className="space-y-4 text-gray-300 text-sm md:text-base leading-relaxed max-w-3xl mx-auto">
        <p>
          🎓 أبحاث جامعة دوك تشير إلى أن حتى <strong className="text-white">45%</strong> من سلوكنا اليومي عادات تلقائية، مو قرارات واعية.
        </p>
        <p>
          📑 ودراسة في <em>European Journal of Social Psychology</em> تؤكد أن بناء العادات يعتمد على{" "}
          <strong className="text-white">التكرار المرئي والتغذية الراجعة الفورية</strong> — مو الحماس فقط.
        </p>
        <p className="text-yellow-200/90 font-medium text-center pt-2">
          ✨ مسار يستخدم نفس المحفّزات النفسية عشان الاستمرارية تصير أسهل والنجاح أوضح.
        </p>
      </div>
    </div>
  );
}
