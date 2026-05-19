import { useCallback, useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/AuthContext";
import { client } from "@/api/client";
import { useLocale } from "@/lib/LocaleContext";
import BrandLogo from "@/components/BrandLogo";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { DashboardNavBottom, DashboardNavSidebar } from "@/components/member/dashboard/DashboardNav";
import { isDashboardSection } from "@/components/member/dashboard/constants";
import DashboardTrackPanel from "@/components/member/dashboard/DashboardTrackPanel";
import DashboardToolsPanel from "@/components/member/dashboard/DashboardToolsPanel";
import DashboardNewsPanel from "@/components/member/dashboard/DashboardNewsPanel";
import DashboardAccountPanel from "@/components/member/dashboard/DashboardAccountPanel";
import { hydrateMemberDataFromServer } from "@/lib/member-sync";

function readSectionFromHash() {
  const raw = window.location.hash.replace(/^#/, "");
  return isDashboardSection(raw) ? raw : "track";
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { dir } = useLocale();
  const { user, logout, hasEntitlement, subscription: authSubscription } = useAuth();
  const [section, setSection] = useState(readSectionFromHash);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);

  const goToSection = useCallback((next) => {
    if (!isDashboardSection(next)) return;
    setSection(next);
    const hash = `#${next}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${hash}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onHash = () => setSection(readSectionFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

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

  useEffect(() => {
    if (!user?.id) return undefined;
    let cancelled = false;
    (async () => {
      const result = await hydrateMemberDataFromServer(user.id);
      if (!cancelled) setSyncStatus(result);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const ownedKeys = [...new Set(data?.entitlements?.map((e) => e.product_key) || [])];
  const hasHabit = hasEntitlement("habit");
  const hasTask = hasEntitlement("task");
  const hasBundle = hasEntitlement("bundle");
  const showUpsell = !hasBundle && (hasHabit || hasTask);
  const firstName = user?.name?.split(" ")[0] || t("dashboard.defaultName");
  const subscription = data?.subscription || authSubscription;

  return (
    <div className="dashboard-shell min-h-screen bg-background flex flex-col w-full" dir={dir}>
      <header className="dashboard-topbar sticky top-0 z-40 overflow-visible shrink-0 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogo size="compact" className="flex-shrink-0" />
            <div className="min-w-0 hidden min-[400px]:block">
              <p className="text-primary font-black text-xs sm:text-sm tracking-wide">{t("dashboard.memberArea")}</p>
              <p className="text-muted-foreground text-[11px] sm:text-xs truncate max-w-[10rem] sm:max-w-none">
                {user?.name || user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5">
              <CurrencySwitcher />
              <LanguageSwitcher compact />
            </div>
            <button
              type="button"
              onClick={() => logout(true)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-red-300 text-sm font-bold px-2.5 py-2 rounded-lg hover:bg-red-900/20 min-h-[44px]"
              aria-label={t("dashboard.logout")}
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden />
              <span className="hidden md:inline">{t("dashboard.logout")}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 w-full min-w-0">
        <DashboardNavSidebar section={section} onSectionChange={goToSection} />

        <div className="flex-1 min-w-0 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-8 pb-24 md:pb-8">
          <main className="dashboard-main w-full" id="dashboard-main">
            {section === "track" && (
              <DashboardTrackPanel
                firstName={firstName}
                hasBundle={hasBundle}
                showUpsell={showUpsell}
                ownedKeys={ownedKeys}
                userId={user?.id}
                hasHabit={hasHabit}
                hasTask={hasTask}
                subscription={subscription}
                loading={loading}
                error={error}
                syncStatus={syncStatus}
              />
            )}
            {section === "tools" && <DashboardToolsPanel userId={user?.id} />}
            {section === "news" && <DashboardNewsPanel loading={loading} />}
            {section === "account" && (
              <DashboardAccountPanel
                ownedKeys={ownedKeys}
                subscription={subscription}
                user={user}
              />
            )}
          </main>
        </div>
      </div>

      <DashboardNavBottom section={section} onSectionChange={goToSection} />
    </div>
  );
}
