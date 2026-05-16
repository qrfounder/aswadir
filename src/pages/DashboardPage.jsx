import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Package,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { client } from "@/api/client";
import { getDeliveryUrl, hasDeliveryUrl } from "@/lib/delivery";
import { PACK_META } from "@/lib/tracker-catalog";
import MemberTrackerHub from "@/components/member/MemberTrackerHub";
import BundleUpgradeBanner from "@/components/member/BundleUpgradeBanner";

const PRODUCT_LABELS = {
  habit: "متتبع العادات",
  task: "متتبع المهام",
  bundle: "الباقة الكاملة",
};

export default function DashboardPage() {
  const { user, logout, hasEntitlement } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dash = await client.member.dashboard();
        if (!cancelled) setData(dash);
      } catch {
        if (!cancelled) setError("تعذّر تحميل لوحة التحكم.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ownedKeys = [...new Set(data?.entitlements?.map((e) => e.product_key) || [])];
  const hasHabit = hasEntitlement("habit");
  const hasTask = hasEntitlement("task");
  const hasBundle = hasEntitlement("bundle");
  const showUpsell = !hasBundle && (hasHabit || hasTask);

  return (
    <div className="min-h-screen bg-background font-cairo" dir="rtl">
      <header className="bg-black/60 border-b border-yellow-400/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="w-10 h-10 rounded-xl ring-1 ring-yellow-400/30" />
            <div>
              <p className="text-yellow-400 font-black text-sm">مسار · منطقة الأعضاء</p>
              <p className="text-gray-500 text-xs truncate max-w-[180px] sm:max-w-none">
                {user?.name || user?.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout(true)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-red-300 text-sm font-bold px-3 py-2 rounded-lg hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <section className="hero-gradient rounded-2xl p-6 md:p-8 border border-yellow-400/20">
          <div className="flex items-start gap-3">
            <LayoutDashboard className="w-8 h-8 text-yellow-400 flex-shrink-0" />
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
                أهلاً، <span className="gold-gradient">{user?.name?.split(" ")[0] || "بك"}</span>
              </h1>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-2xl">
                لوحة مسار الموحّدة: تتبّع عاداتك ومهامك بنفس هيكل Google Sheets — مدمجة هنا.{" "}
                {hasBundle ? "✦ لديك الباقة الكاملة." : "يمكنك الترقية للباقة الكاملة في أي وقت."}
              </p>
            </div>
          </div>
        </section>

        {loading && (
          <p className="text-center text-gray-500 text-sm">جاري التحميل...</p>
        )}
        {error && (
          <p className="text-center text-red-300 text-sm">{error}</p>
        )}

        {showUpsell && <BundleUpgradeBanner ownedKeys={ownedKeys} />}

        {user?.id && (hasHabit || hasTask) && (
          <MemberTrackerHub
            userId={user.id}
            hasHabit={hasHabit}
            hasTask={hasTask}
            hasBundle={hasBundle}
          />
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h2 className="text-white font-black text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-yellow-400" />
              أنظمتك
            </h2>
            {ownedKeys.length === 0 ? (
              <p className="text-gray-500 text-sm">لا توجد منتجات مفعّلة بعد.</p>
            ) : (
              <ul className="space-y-3">
                {ownedKeys.filter((k) => PACK_META[k]).map((key) => (
                  <li key={key} className="dark-card rounded-xl p-4 border border-gray-800">
                    <p className="text-white font-bold text-sm">{PACK_META[key].icon} {PRODUCT_LABELS[key] || key}</p>
                    <p className="text-gray-500 text-xs mt-1">{PACK_META[key].tagline}</p>
                    {hasDeliveryUrl(key) && (
                      <a href={getDeliveryUrl(key)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-xs font-bold text-yellow-400 border border-yellow-400/30 px-3 py-1.5 rounded-lg hover:bg-yellow-400/10 items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> نسخة Google Sheets
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="lg:col-span-2 space-y-4">
        <section className="space-y-4">
          <h2 className="text-white font-black text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            تحديثات ومحتوى جديد
          </h2>
          <div className="space-y-3">
            {(data?.updates || []).map((item) => (
              <article
                key={item.id}
                className="dark-card rounded-2xl p-5 border border-yellow-400/10 hover:border-yellow-400/25 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black bg-yellow-400/15 text-yellow-300 px-2 py-0.5 rounded">
                    {item.tag}
                  </span>
                  <span className="text-gray-600 text-xs">{item.publishedAt}</span>
                </div>
                <h3 className="text-white font-bold text-base mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.body}</p>
              </article>
            ))}
          </div>
        </section>
          </div>
        </div>

        <section className="dark-card rounded-2xl p-6 text-center border border-dashed border-yellow-400/25">
          <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
          <h3 className="text-white font-black mb-2">منتجات قادمة لأعضاء مسار</h3>
          <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
            دورات قصيرة، قوالب إنتاجية، وتتبع متقدّم — ستظهر هنا تلقائياً حسب باقاتك. ما تحتاج تشتري
            من جديد إلا إذا اخترت ترقية اختيارية.
          </p>
        </section>

        <p className="text-center text-gray-600 text-xs pb-8">
          <Link to="/" className="text-yellow-400/80 hover:text-yellow-300">
            الصفحة الرئيسية
          </Link>
        </p>
      </main>
    </div>
  );
}
