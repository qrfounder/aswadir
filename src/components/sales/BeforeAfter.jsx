const beforeItems = [
  "تبدأ يومك وما تدري وش بتسوي",
  "تنسى مهامك وتتكدّس عليك الأشغال",
  "تبدأ عادة وتتركها بعد أسبوع",
  "تحس بتشتت وإرهاق كل يوم",
  "تضيّع وقت طويل بس تفكر وش تسوي",
];

const afterItems = [
  "تصحى وأنت عارف بالضبط وش بتسوي",
  "مهامك مرتبة وتخلّصها يوم بيوم",
  "عاداتك تتراكم وتصير جزء من حياتك",
  "وضوح تام وتركيز عالي طول اليوم",
  "5 دقايق بس وتنظّم يومك كامل",
];

import { Frown, Trophy } from "lucide-react";

export default function BeforeAfter() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Before */}
      <div className="before-after-card bg-red-950/20 border border-red-800/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <Frown className="w-8 h-8 text-red-400" />
          <h3 className="text-red-300 font-black text-lg">قبل نظام الانضباط</h3>
        </div>
        <ul className="space-y-3">
          {beforeItems.map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-xs text-red-400 flex-shrink-0 font-bold">✕</span>
              <span className="text-gray-300 text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* After */}
      <div className="before-after-card bg-green-950/20 border border-green-700/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h3 className="text-green-300 font-black text-lg">بعد نظام الانضباط</h3>
        </div>
        <ul className="space-y-3">
          {afterItems.map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs text-green-400 flex-shrink-0 font-bold">✓</span>
              <span className="text-gray-200 text-sm font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}