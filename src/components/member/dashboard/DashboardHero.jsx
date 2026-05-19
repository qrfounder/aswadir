import { motion } from "framer-motion";
import { Flame, ListTodo, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import ProgressRing from "@/components/member/analytics/ProgressRing";
import { useTracker } from "@/lib/TrackerContext";

function greetingKey() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 22) return "evening";
  return "night";
}

export default function DashboardHero({
  firstName,
  hasHabit,
  hasTask,
  onGoHabits,
  onGoTasks,
}) {
  const { t } = useTranslation();
  const { analytics } = useTracker();
  const period = greetingKey();
  const habit = analytics?.habit;
  const task = analytics?.task;
  const score = analytics?.lifeScore ?? 0;
  const streak = habit?.bestStreak ?? 0;

  const coachKey =
    score >= 80
      ? "high"
      : score >= 50
        ? "mid"
        : score > 0
          ? "low"
          : "start";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="dashboard-hero relative overflow-hidden rounded-2xl sm:rounded-3xl border border-brand/20 p-4 sm:p-6 md:p-7"
      aria-labelledby="dashboard-hero-heading"
    >
      <motion.div
        className="absolute -top-20 -end-16 w-56 h-56 rounded-full bg-primary/15 blur-3xl pointer-events-none"
        animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.06, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
        aria-hidden
      />
      <motion.div
        className="absolute -bottom-24 -start-12 w-48 h-48 rounded-full bg-brand/10 blur-3xl pointer-events-none"
        animate={{ opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 7, repeat: Infinity, delay: 1 }}
        aria-hidden
      />

      <motion.div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent"
        aria-hidden
      />

      <motion.div
        className="relative flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8"
      >
        <div className="flex-1 min-w-0 space-y-3">
          <p className="text-primary text-xs font-bold uppercase tracking-widest">
            {t(`dashboard.hero.kicker.${period}`)}
          </p>
          <h1
            id="dashboard-hero-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-[1.15] text-pretty"
          >
            {t(`dashboard.hero.greeting.${period}`, { name: firstName })}
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl">
            {t(`dashboard.hero.coach.${coachKey}`)}
          </p>

          <motion.div
            className="flex flex-wrap gap-2 pt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {hasHabit && (
              <button
                type="button"
                onClick={onGoHabits}
                className="inline-flex items-center gap-2 rounded-xl bg-brand/15 border border-brand/30 text-brand px-3.5 py-2.5 text-xs sm:text-sm font-bold hover:bg-brand/25 transition-colors min-h-[44px]"
              >
                <Flame className="w-4 h-4 shrink-0" aria-hidden />
                {t("dashboard.hero.actionHabits")}
              </button>
            )}
            {hasTask && (
              <button
                type="button"
                onClick={onGoTasks}
                className="inline-flex items-center gap-2 rounded-xl bg-primary/15 border border-primary/35 text-primary px-3.5 py-2.5 text-xs sm:text-sm font-bold hover:bg-primary/25 transition-colors min-h-[44px]"
              >
                <ListTodo className="w-4 h-4 shrink-0" aria-hidden />
                {t("dashboard.hero.actionTasks")}
              </button>
            )}
            {streak > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-black/40 border border-brand/25 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-brand min-h-[44px]">
                <span aria-hidden>🔥</span>
                {t("dashboard.hero.streak", { count: streak })}
              </span>
            )}
          </motion.div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-4 shrink-0">
          {(hasHabit || hasTask) && (
            <ProgressRing
              value={score}
              size={120}
              stroke={9}
              accent="hsl(168 62% 42%)"
              label={t("dashboard.todaySummary.momentum")}
              sublabel={t("dashboard.hero.momentumHint")}
            />
          )}
          {!hasHabit && !hasTask && (
            <motion.div
              className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 max-w-xs"
              whileHover={{ scale: 1.01 }}
            >
              <Target className="w-8 h-8 text-primary shrink-0" aria-hidden />
              <p className="text-gray-300 text-sm leading-snug">{t("dashboard.hero.noTracker")}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.section>
  );
}
