import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTrackerCatalog } from "@/lib/useTrackerCatalog";
import { TrackerProvider } from "@/lib/TrackerContext";
import DailyHabitsPanel from "@/components/member/DailyHabitsPanel";
import TaskWeeklyBoard from "@/components/member/TaskWeeklyBoard";
import InsightFlash from "@/components/member/analytics/InsightFlash";
import ProgressCommandCenter from "@/components/member/analytics/ProgressCommandCenter";
import TodaySummaryCard from "@/components/member/dashboard/TodaySummaryCard";

function tabButtonClass(active, tabId) {
  if (!active) {
    return "text-gray-400 border border-gray-800/80 bg-black/20 hover:border-gray-600 hover:text-gray-200";
  }
  if (tabId === "task") {
    return "bg-success/15 text-success border border-success/35 shadow-sm shadow-success/10";
  }
  if (tabId === "habit") {
    return "bg-brand/15 text-brand border border-brand/35 shadow-sm shadow-primary/10";
  }
  return "bg-brand/20 text-brand border border-brand/40 shadow-sm shadow-primary/10";
}

export default function MemberTrackerHub({ userId, hasHabit, hasTask, hasBundle }) {
  const { t } = useTranslation();
  const { packMeta } = useTrackerCatalog();

  const overviewTab = useMemo(
    () => ({
      id: "overview",
      icon: "📊",
      name: t("tracker.overviewTab"),
    }),
    [t],
  );

  const tabs = useMemo(() => {
    const list = [overviewTab];
    if (hasHabit) list.push({ id: "habit", ...packMeta.habit });
    if (hasTask) list.push({ id: "task", ...packMeta.task });
    return list;
  }, [hasHabit, hasTask, overviewTab, packMeta]);

  const [active, setActive] = useState("overview");

  if (!hasHabit && !hasTask) {
    return (
      <p className="text-gray-500 text-sm text-center py-8 px-4">{t("tracker.noSystem")}</p>
    );
  }

  const activeMeta = tabs.find((tab) => tab.id === active);

  return (
    <TrackerProvider userId={userId} hasHabit={hasHabit} hasTask={hasTask}>
      <section
        className="dark-card rounded-2xl border border-brand/15 overflow-hidden"
        aria-label={t("tracker.ariaLabel")}
      >
        <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-gray-800/80 bg-black/40 space-y-3">
          <div className="space-y-1">
            <p className="text-primary/90 text-xs font-bold">{t("tracker.hubLabel")}</p>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              {hasBundle ? t("tracker.hubBundle") : t("tracker.hubTabs")}
            </p>
          </div>

          <InsightFlash />

          <div
            className="member-tabs-scroll flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory"
            role="tablist"
            aria-label={t("tracker.tabsAria")}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active === tab.id}
                onClick={() => setActive(tab.id)}
                className={`flex-shrink-0 snap-start px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all min-h-[44px] ${tabButtonClass(active === tab.id, tab.id)}`}
              >
                <span className="whitespace-nowrap">
                  {tab.icon} {tab.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 sm:px-5 py-1 bg-black/20 border-b border-gray-800/60">
          <p className="text-gray-500 text-[11px] sm:text-xs py-2">
            {active === "overview" && t("member.tabHintOverview")}
            {active === "habit" && t("member.tabHintHabit")}
            {active === "task" && t("member.tabHintTask")}
          </p>
        </div>

        <div className="p-4 sm:p-5 md:p-6" role="tabpanel" aria-label={activeMeta?.name}>
          {active === "overview" && (
            <>
              <TodaySummaryCard />
              <ProgressCommandCenter hasHabit={hasHabit} hasTask={hasTask} />
            </>
          )}
          {active === "habit" && hasHabit && <DailyHabitsPanel userId={userId} />}
          {active === "task" && hasTask && <TaskWeeklyBoard userId={userId} />}
        </div>
      </section>
    </TrackerProvider>
  );
}
