import { Check, Minus, X } from "lucide-react";

const ROWS = [
  {
    feature: "سلاسل يومية مرئية (تقطع التسويف)",
    massar: "full",
    apps: "partial",
    notes: "none",
  },
  {
    feature: "لوحة تحكم ورسوم بيانية تلقائية",
    massar: "full",
    apps: "partial",
    notes: "none",
  },
  {
    feature: "5 دقايق يومياً بدون تعقيد",
    massar: "full",
    apps: "partial",
    notes: "partial",
  },
  {
    feature: "دفعة واحدة، وصول مدى الحياة",
    massar: "full",
    apps: "none",
    notes: "full",
  },
  {
    feature: "Google Sheets + Excel",
    massar: "full",
    apps: "none",
    notes: "partial",
  },
];

function Cell({ level }) {
  if (level === "full")
    return (
      <span className="inline-flex justify-center text-emerald-400" title="متوفر">
        <Check className="w-5 h-5" strokeWidth={2.5} />
      </span>
    );
  if (level === "partial")
    return (
      <span className="inline-flex justify-center text-amber-400/90" title="جزئي">
        <Minus className="w-5 h-5" strokeWidth={2.5} />
      </span>
    );
  return (
    <span className="inline-flex justify-center text-red-400/70" title="غير متوفر">
      <X className="w-5 h-5" strokeWidth={2.5} />
    </span>
  );
}

export default function ComparisonTableSection() {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-yellow-400/80 text-sm font-bold mb-2">قارن قبل ما تقرر</p>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
          ليش <span className="gold-gradient">مسار</span> مو بس «تطبيق ثاني»؟
        </h2>
        <p className="text-gray-400 text-sm">
          جدول مختصر: نفس الفكرة اللي تقرأها في صفحات العالمية، بس بلغتك وتناسب عادتك العربية.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-yellow-400/15 dark-card">
        <table className="w-full min-w-[520px] text-sm border-collapse">
          <thead>
            <tr className="border-b border-yellow-400/15 bg-yellow-400/5">
              <th className="text-right p-4 font-black text-white w-[36%]">الميزة</th>
              <th className="p-4 text-center font-black text-yellow-300 w-[21%]">مسار</th>
              <th className="p-4 text-center font-bold text-gray-300 w-[21%]">تطبيقات</th>
              <th className="p-4 text-center font-bold text-gray-300 w-[22%]">دفتر / ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.feature} className="border-b border-yellow-400/10 last:border-0">
                <td className="p-4 text-gray-200 leading-relaxed align-middle">{row.feature}</td>
                <td className="p-4 text-center align-middle bg-yellow-400/5">
                  <Cell level={row.massar} />
                </td>
                <td className="p-4 text-center align-middle">
                  <Cell level={row.apps} />
                </td>
                <td className="p-4 text-center align-middle">
                  <Cell level={row.notes} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-center text-gray-500 text-xs max-w-lg mx-auto leading-relaxed">
        الرموز: علامة صح يعني متوفر بشكل قوي، الشرطة تعني يختلف حسب التطبيق أو يحتاج إعداد يدوي،
        والـ X يعني عادة ما يتوفر بنفس الشكل.
      </p>
    </div>
  );
}
