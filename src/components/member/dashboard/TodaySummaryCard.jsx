import { Flame, ListTodo, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTracker } from "@/lib/TrackerContext";
import AnimatedValue from "@/components/member/analytics/AnimatedValue";

export default function TodaySummaryCard() {
  const { t } = useTranslation();
  const { analytics } = useTracker();
  const habit = analytics.habit;
  const task = analytics.task;
  const score = analytics.lifeScore;

  if (!habit && !task) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
      {habit && (
        <div className="rounded-xl border border-brand/25 bg-brand/15 px-3 py-3">
          <p className="text-[10px] uppercase tracking-wide text-brand/80 font-bold flex items-center gap-1">
            <Flame className="w-3 h-3" aria-hidden />
            {t("dashboard.todaySummary.habits")}
          </p>
          <p className="text-white font-black text-xl mt-1">
            <AnimatedValue value={habit.todayRate} suffix="%" />
          </p>
          <p className="text-gray-500 text-[11px] mt-0.5">
            {t("dashboard.todaySummary.habitsDetail", {
              done: habit.completedToday,
              total: habit.totalHabits,
            })}
          </p>
        </div>
      )}
      {task && (
        <div className="rounded-xl border border-success/25 bg-success/20 px-3 py-3">
          <p className="text-[10px] uppercase tracking-wide text-success/80 font-bold flex items-center gap-1">
            <ListTodo className="w-3 h-3" aria-hidden />
            {t("dashboard.todaySummary.tasks")}
          </p>
          <p className="text-white font-black text-xl mt-1">
            <AnimatedValue value={task.done} />
          </p>
          <p className="text-gray-500 text-[11px] mt-0.5">
            {t("dashboard.todaySummary.tasksDetail", { total: task.total })}
          </p>
        </div>
      )}
      {habit?.mentalToday != null && (
        <div className="rounded-xl border border-sky-400/25 bg-sky-950/30 px-3 py-3">
          <p className="text-[10px] uppercase tracking-wide text-sky-400/80 font-bold">
            {t("dashboard.todaySummary.mental")}
          </p>
          <p className="text-white font-black text-xl mt-1">
            <AnimatedValue value={habit.mentalToday} suffix="%" />
          </p>
          <p className="text-gray-500 text-[11px] mt-0.5">{t("dashboard.todaySummary.mentalHint")}</p>
        </div>
      )}
      {score != null && (
        <div className="rounded-xl border border-violet-400/25 bg-violet-950/30 px-3 py-3 col-span-2 sm:col-span-1">
          <p className="text-[10px] uppercase tracking-wide text-violet-400/80 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" aria-hidden />
            {t("dashboard.todaySummary.momentum")}
          </p>
          <p className="text-white font-black text-xl mt-1">
            <AnimatedValue value={score} suffix="%" />
          </p>
          <p className="text-gray-500 text-[11px] mt-0.5">{t("dashboard.todaySummary.momentumHint")}</p>
        </div>
      )}
    </div>
  );
}
