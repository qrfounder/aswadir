import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import DailyNotesPanel from "@/components/member/dashboard/DailyNotesPanel";
import DashboardHero from "@/components/member/dashboard/DashboardHero";
import TodaySummaryCard from "@/components/member/dashboard/TodaySummaryCard";
import MemberTrackerHub from "@/components/member/MemberTrackerHub";
import BundleUpgradeBanner from "@/components/member/BundleUpgradeBanner";
import SubscriptionBanner from "@/components/member/SubscriptionBanner";
import { TrackerProvider } from "@/lib/TrackerContext";

export default function DashboardTrackPanel({
  firstName,
  hasBundle,
  showUpsell,
  ownedKeys,
  userId,
  hasHabit,
  hasTask,
  subscription,
  loading,
  error,
  syncStatus,
}) {
  const { t } = useTranslation();
  const hubRef = useRef(null);
  const [hubTab, setHubTab] = useState("overview");

  const scrollToHub = useCallback(() => {
    hubRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const goHabits = useCallback(() => {
    setHubTab("habit");
    scrollToHub();
  }, [scrollToHub]);

  const goTasks = useCallback(() => {
    setHubTab("task");
    scrollToHub();
  }, [scrollToHub]);

  const trackerBody =
    userId && (hasHabit || hasTask) ? (
      <TrackerProvider userId={userId} hasHabit={hasHabit} hasTask={hasTask}>
        <div className="space-y-5 sm:space-y-6">
          <DashboardHero
            firstName={firstName}
            hasHabit={hasHabit}
            hasTask={hasTask}
            onGoHabits={goHabits}
            onGoTasks={goTasks}
          />
          <TodaySummaryCard />
          <DailyNotesPanel userId={userId} syncStatus={syncStatus} />
          <div ref={hubRef} className="scroll-mt-24">
            <MemberTrackerHub
              userId={userId}
              hasHabit={hasHabit}
              hasTask={hasTask}
              hasBundle={hasBundle}
              activeTab={hubTab}
              onTabChange={setHubTab}
              showTodaySummary={false}
            />
          </div>
        </div>
      </TrackerProvider>
    ) : (
      <div className="space-y-5 sm:space-y-6">
        <header className="dashboard-section-header">
          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {t("dashboard.nav.trackTitle")}{" "}
            <span className="gold-gradient">{firstName}</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-2xl">
            {t("dashboard.nav.trackLead")}
          </p>
        </header>
        {userId && <DailyNotesPanel userId={userId} syncStatus={syncStatus} />}
        {!loading && (
          <p className="text-gray-500 text-sm text-center py-10 px-4 dark-card rounded-2xl border border-gray-800">
            {t("tracker.noSystem")}
          </p>
        )}
      </div>
    );

  return (
    <div className="space-y-5 sm:space-y-6">
      {subscription && <SubscriptionBanner subscription={subscription} />}

      {loading && (
        <p className="text-gray-500 text-sm py-2 flex items-center gap-2" role="status">
          <span className="dashboard-loading-dot" aria-hidden />
          {t("dashboard.loading")}
        </p>
      )}
      {error && (
        <p className="text-red-300 text-sm py-2 px-4 rounded-xl bg-red-950/30 border border-red-400/20">
          {error}
        </p>
      )}

      {showUpsell && <BundleUpgradeBanner ownedKeys={ownedKeys} />}

      {trackerBody}
    </div>
  );
}
