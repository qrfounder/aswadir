import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "جربت متتبعات كثير وتركتها، وش يفرق هالنظام؟",
    a: "أغلب المتتبعات يا معقدة يا مملة. نظامنا مبني على فكرة وحدة: لما تشوف تقدمك، يصعب عليك توقف. السلاسل والنقاط والتخطيط اليومي يأخذ منك بس 5 دقايق. بسيط عشان تستمر، وممتع عشان تبي تستمر.",
  },
  {
    q: "أحتاج خبرة في Google Sheets أو Excel؟",
    a: "أبداً ما تحتاج أي خبرة. افتح الملف، حط عاداتك، وعلّم عليها كل يوم. كل شي ثاني (النقاط والسلاسل والرسوم البيانية) يشتغل لحاله تلقائي.",
  },
  {
    q: "يشتغل على الجوال؟",
    a: "إي، يشتغل على أي جهاز: جوال، تابلت، أو لابتوب عن طريق Google Sheets أو Microsoft Excel. أغلب الناس يسجّلون عاداتهم من الجوال الصبح ويراجعون لوحة التحكم على الكمبيوتر.",
  },
  {
    q: "دفعة وحدة ولا اشتراك شهري؟",
    a: "دفعة وحدة بس. لا اشتراكات، لا مبالغ مخفية. تحصل على وصول مدى الحياة للنظام الكامل مع كل التحديثات الجاية.",
  },
  {
    q: "وش لو ما عجبني؟",
    a: "عندك 21 يوم تجرّبه. إذا ما ناسبك لأي سبب، كلّمنا ونرجع لك فلوسك كاملة. بدون أسئلة وبدون لف ودوران.",
  },
  {
    q: "كيف أحصل على المنتج بعد ما أشتري؟",
    a: "بعد تأكيد الدفع، يوصلك إيميل فيه رابط الوصول الفوري. ملف Google Sheets ينسخ تلقائي على Google Drive حقك، تحتاج بس حساب Gmail مجاني. وفيه نسخة Excel بعد.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className="dark-card rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between gap-3 p-4 text-right"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <ChevronDown
              className={`w-5 h-5 text-yellow-400 flex-shrink-0 transition-transform duration-200 ${
                open === i ? "rotate-180" : ""
              }`}
            />
            <span className="text-white font-bold text-sm flex-1 text-right">{faq.q}</span>
          </button>
          {open === i && (
            <div className="px-4 pb-4 border-t border-yellow-400/10">
              <p className="text-gray-300 text-sm leading-relaxed pt-3">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}