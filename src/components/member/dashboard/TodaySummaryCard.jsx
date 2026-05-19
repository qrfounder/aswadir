import { motion } from "framer-motion";
import { Brain, Flame, ListTodo, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTracker } from "@/lib/TrackerContext";
import AnimatedValue from "@/components/member/analytics/AnimatedValue";

const tileMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

function SummaryTile({
  icon: Icon,
  label,
  value,
  suffix = "",
  detail,
  variant,
  delay = 0,
  className = "",
}) {
  const variants = {
    brand: "border-brand/30 bg-gradient-to-br from-brand/15 to-black/40",
    success: "border-success/30 bg-gradient-to-br from-success/15 to-black/40",
    info: "border-info/30 bg-gradient-to-br from-info/15 to-black/40",
    momentum: "border-primary/35 bg-gradient-to-br from-primary/15 to-black/40",
  };
  const labelColors = {
    brand: "text-brand",
    success: "text-success",
    info: "text-info",
    momentum: "text-primary",
  };

  return (
    <motion.div
      {...tileMotion}
      transition={{ delay, duration: 0.35 }}
      className={`rounded-2xl border px-3.5 py-3.5 sm:px-4 sm:py-4 ${variants[variant]} ${className}`}
    >
      <p
        className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 ${labelColors[variant]}`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
        {label}
      </p>
      <p className="text-white font-black text-2xl sm:text-3xl mt-1.5 tabular-nums">
        <AnimatedValue value={value} suffix={suffix} />
      </p>
      {detail && <p className="text-gray-500 text-[11px] sm:text-xs mt-1 leading-snug">{detail}</p>}
    </motion.div>
  );
}

export default function TodaySummaryCard() {
  const { t } = useTranslation();
  const { analytics } = useTracker();
  const habit = analytics.habit;
  const task = analytics.task;
  const score = analytics.lifeScore;

  if (!habit && !task) return null;

  return (
    <section aria-labelledby="today-summary-heading" className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id="today-summary-heading" className="text-white font-black text-base sm:text-lg">
            {t("dashboard.todaySummary.title")}
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{t("dashboard.todaySummary.subtitle")}</p>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3"
        initial="initial"
        animate="animate"
      >
        {habit && (
          <SummaryTile
            icon={Flame}
            label={t("dashboard.todaySummary.habits")}
            value={habit.todayRate}
            suffix="%"
            detail={t("dashboard.todaySummary.habitsDetail", {
              done: habit.completedToday,
              total: habit.totalHabits,
            })}
            variant="brand"
            delay={0.05}
          />
        )}
        {task && (
          <SummaryTile
            icon={ListTodo}
            label={t("dashboard.todaySummary.tasks")}
            value={task.pct}
            suffix="%"
            detail={t("dashboard.todaySummary.tasksDetail", {
              done: task.done,
              total: task.total,
            })}
            variant="success"
            delay={0.1}
          />
        )}
        {habit?.mentalToday != null && (
          <SummaryTile
            icon={Brain}
            label={t("dashboard.todaySummary.mental")}
            value={habit.mentalToday}
            suffix="%"
            detail={t("dashboard.todaySummary.mentalHint")}
            variant="info"
            delay={0.15}
          />
        )}
        {score != null && (
          <SummaryTile
            icon={Sparkles}
            label={t("dashboard.todaySummary.momentum")}
            value={score}
            suffix="%"
            detail={t("dashboard.todaySummary.momentumHint")}
            variant="momentum"
            delay={0.2}
            className={!habit?.mentalToday && task ? "" : habit && !task ? "col-span-2 lg:col-span-1" : "col-span-2 lg:col-span-1"}
          />
        )}
      </motion.div>
    </section>
  );
}
