import { useTranslation } from "react-i18next";
import MemberTrackerHub from "@/components/member/MemberTrackerHub";
import BundleUpgradeBanner from "@/components/member/BundleUpgradeBanner";
import SubscriptionBanner from "@/components/member/SubscriptionBanner";

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
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
          {t("dashboard.nav.trackTitle")}{" "}
          <span className="gold-gradient">{firstName}</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-2xl">
          {t("dashboard.nav.trackLead")}
        </p>
      </header>

      {subscription && (
        <SubscriptionBanner subscription={subscription} />
      )}

      {loading && (
        <p className="text-gray-500 text-sm py-2" role="status">
          {t("dashboard.loading")}
        </p>
      )}
      {error && (
        <p className="text-red-300 text-sm py-2 px-4 rounded-xl bg-red-950/30 border border-red-400/20">
          {error}
        </p>
      )}

      {showUpsell && <BundleUpgradeBanner ownedKeys={ownedKeys} />}

      {userId && (hasHabit || hasTask) ? (
        <MemberTrackerHub
          userId={userId}
          hasHabit={hasHabit}
          hasTask={hasTask}
          hasBundle={hasBundle}
        />
      ) : (
        !loading && (
          <p className="text-gray-500 text-sm text-center py-10 px-4 dark-card rounded-2xl border border-gray-800">
            {t("tracker.noSystem")}
          </p>
        )
      )}
    </div>
  );
}
