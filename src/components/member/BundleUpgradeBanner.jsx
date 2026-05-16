import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { BUNDLE_PRODUCT, PRODUCTS } from "@/lib/products";

export default function BundleUpgradeBanner({ ownedKeys }) {
  const hasHabit = ownedKeys.includes("habit");
  const hasTask = ownedKeys.includes("task");
  const missing = [];
  if (!hasHabit) missing.push("متتبع العادات");
  if (!hasTask) missing.push("متتبع المهام");

  const singlesTotal =
    (hasHabit ? 0 : PRODUCTS.find((p) => p.id === "habit")?.salePrice || 99) +
    (hasTask ? 0 : PRODUCTS.find((p) => p.id === "task")?.salePrice || 99);

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-yellow-400/35 bg-gradient-to-l from-yellow-400/15 via-black/40 to-black/60 p-5 md:p-6"
      aria-label="ترقية للباقة الكاملة"
    >
      <motionGlow className="-top-10 -right-10 bg-yellow-400/10" />
      <motionGlow className="-bottom-8 -left-8 bg-emerald-400/10" />

      <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="flex-1 space-y-2">
          <p className="inline-flex items-center gap-1.5 text-xs font-black text-yellow-300 bg-yellow-400/15 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            ترقية ذكية
          </p>
          <h2 className="text-white font-black text-lg md:text-xl leading-snug">
            {hasHabit && hasTask
              ? "وفّر وادمج كل شيء في الباقة الكاملة ✦"
              : `أكمل مسارك: ${missing.join(" + ")}`}
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed max-w-xl">
            {hasHabit && !hasTask && (
              <>
                عندك <strong className="text-yellow-300">متتبع العادات</strong> — أضف{" "}
                <strong className="text-emerald-300">المهام الأسبوعية</strong> واللوحة الموحّدة
                بنفس أسلوب Google Sheets داخل مسار.
              </>
            )}
            {hasTask && !hasHabit && (
              <>
                عندك <strong className="text-emerald-300">متتبع المهام</strong> — أضف{" "}
                <strong className="text-yellow-300">شبكة العادات الشهرية</strong> والنقاط والسلاسل.
              </>
            )}
            {hasHabit && hasTask && (
              <>
                عندك النظامين منفصلين — الباقة الكاملة تفتح لوحة واحدة، تحديثات أولوية، ومحتوى
                تطوير ذاتي قادم هنا.
              </>
            )}
          </p>
          {singlesTotal > BUNDLE_PRODUCT.salePrice && (
            <p className="text-gray-500 text-xs">
              بدل {singlesTotal} ر.س منفصلة ←{" "}
              <span className="text-yellow-400 font-bold">{BUNDLE_PRODUCT.salePrice} ر.س</span>{" "}
              للباقة الكاملة
            </p>
          )}
        </div>
        <Link
          to="/checkout?product=bundle"
          className="flex-shrink-0 inline-flex items-center justify-center gap-2 bg-yellow-400 text-black font-black text-sm px-6 py-3.5 rounded-xl hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-400/20"
        >
          احصل على الباقة الكاملة — {BUNDLE_PRODUCT.salePrice} ر.س
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

function motionGlow({ className = "" }) {
  return (
    <div
      className={`pointer-events-none absolute w-40 h-40 rounded-full blur-3xl ${className}`}
      aria-hidden
    />
  );
}
