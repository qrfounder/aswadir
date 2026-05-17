import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  Lock,
  LogOut,
  Package,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/AuthContext";
import { client } from "@/api/client";
import { useTrackerCatalog } from "@/lib/useTrackerCatalog";
import MemberTrackerHub from "@/components/member/MemberTrackerHub";
import BundleUpgradeBanner from "@/components/member/BundleUpgradeBanner";
import SubscriptionBanner from "@/components/member/SubscriptionBanner";
import BrandLogo from "@/components/BrandLogo";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLocale } from "@/lib/LocaleContext";

function TrustStrip() {
  const { t } = useTranslation();
  return (
    <div
      className="member-trust-strip flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-4 rounded-xl border border-yellow-400/10 px-4 py-3 text-xs text-gray-400"
      role="note"
    >
      <span className="inline-flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-yellow-400/80" aria-hidden />
        {t("dashboard.trustSecure")}
      </span>
      <span className="hidden sm:inline text-gray-700" aria-hidden>
        ·
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5 text-yellow-400/80" aria-hidden />
        {t("dashboard.trustLocal")}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { dir } = useLocale();
  const { packMeta } = useTrackerCatalog();
  const updates = useMemo(() => {
    const items = t("dashboard.updateItems", { returnObjects: true });
    return Array.isArray(items) ? items : [];
  }, [t, i18n.language]);
  const { user, logout, hasEntitlement, subscription: authSubscription } = useAuth();
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
        if (!cancelled) setError(t("dashboard.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const ownedKeys = [...new Set(data?.entitlements?.map((e) => e.product_key) || [])];
  const hasHabit = hasEntitlement("habit");
  const hasTask = hasEntitlement("task");
  const hasBundle = hasEntitlement("bundle");
  const showUpsell = !hasBundle && (hasHabit || hasTask);
  const firstName = user?.name?.split(" ")[0] || t("dashboard.defaultName");

  const productLabel = (key) => t(`dashboard.products.${key}`, { defaultValue: key });

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <header className="bg-black/70 border-b border-yellow-400/10 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogo size="compact" className="flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-yellow-400 font-black text-xs sm:text-sm">{t("dashboard.memberArea")}</p>
              <p className="text-gray-500 text-[11px] sm:text-xs truncate">{user?.name || user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <CurrencySwitcher />
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => logout(true)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-red-300 text-sm font-bold px-3 py-2 rounded-lg hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t("dashboard.logout")}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <section className="hero-gradient rounded-2xl p-5 sm:p-6 md:p-8 border border-yellow-400/20">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <LayoutDashboard
              className="w-8 h-8 text-yellow-400 flex-shrink-0 hidden sm:block"
              aria-hidden
            />
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
                {t("dashboard.hello")}{" "}
                <span className="gold-gradient">{firstName}</span>
              </h1>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                {t("dashboard.welcome", {
                  bundle: hasBundle ? t("dashboard.welcomeBundle") : t("dashboard.welcomeUpgrade"),
                })}
              </p>
            </div>
          </div>
        </section>

        <TrustStrip />

        {(data?.subscription || authSubscription) && (
          <SubscriptionBanner subscription={data?.subscription || authSubscription} />
        )}

        {loading && (
          <p className="text-center text-gray-500 text-sm py-4" role="status">
            {t("dashboard.loading")}
          </p>
        )}
        {error && (
          <p className="text-center text-red-300 text-sm py-2 px-4 rounded-xl bg-red-950/30 border border-red-400/20">
            {error}
          </p>
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

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <aside className="space-y-4 order-2 lg:order-1">
            <h2 className="text-white font-black text-base sm:text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-yellow-400" aria-hidden />
              {t("dashboard.yourProducts")}
            </h2>
            {ownedKeys.length === 0 ? (
              <p className="text-gray-500 text-sm">{t("dashboard.noProducts")}</p>
            ) : (
              <ul className="space-y-3">
                {ownedKeys
                  .filter((k) => packMeta[k])
                  .map((key) => (
                    <li key={key} className="dark-card rounded-xl p-4 border border-gray-800/80">
                      <p className="text-white font-bold text-sm leading-snug">
                        {packMeta[key].icon} {productLabel(key)}
                      </p>
                      <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                        {packMeta[key].tagline}
                      </p>
                      <p className="text-yellow-400/80 text-[11px] mt-2 font-bold">
                        {t("dashboard.inDashboard")}
                      </p>
                    </li>
                  ))}
              </ul>
            )}
          </aside>

          <section className="lg:col-span-2 space-y-4 order-1 lg:order-2">
            <h2 className="text-white font-black text-base sm:text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" aria-hidden />
              {t("dashboard.updates")}
            </h2>
            <div className="space-y-3">
              {updates.length === 0 && !loading ? (
                <p className="text-gray-500 text-sm dark-card rounded-xl p-4 border border-gray-800">
                  {t("dashboard.noUpdates")}
                </p>
              ) : (
                updates.map((item) => (
                  <article
                    key={item.id}
                    className="dark-card rounded-2xl p-4 sm:p-5 border border-yellow-400/10 hover:border-yellow-400/25 transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-black bg-yellow-400/15 text-yellow-300 px-2 py-0.5 rounded">
                        {item.tag}
                      </span>
                      <span className="text-gray-600 text-xs">{item.publishedAt}</span>
                    </div>
                    <h3 className="text-white font-bold text-sm sm:text-base mb-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.body}</p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="dark-card rounded-2xl p-5 sm:p-6 text-center border border-dashed border-yellow-400/25">
          <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-400 mx-auto mb-3" aria-hidden />
          <h3 className="text-white font-black text-base sm:text-lg mb-2">{t("dashboard.comingTitle")}</h3>
          <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">{t("dashboard.comingBody")}</p>
        </section>

        <p className="text-center text-gray-600 text-xs pb-6 sm:pb-8">
          <Link to="/" className="text-yellow-400/80 hover:text-yellow-300 underline-offset-2 hover:underline">
            {t("dashboard.backHome")}
          </Link>
        </p>
      </main>
    </div>
  );
}
