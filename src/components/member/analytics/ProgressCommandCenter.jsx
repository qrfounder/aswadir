import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useTrackerCatalog } from "@/lib/useTrackerCatalog";
import { useTracker } from "@/lib/TrackerContext";
import AnimatedValue from "./AnimatedValue";
import HabitProgressBars from "./HabitProgressBars";
import MentalMoodLive from "./MentalMoodLive";
import ProgressRing from "./ProgressRing";

function MetricTile({ label, value, suffix = "%", accent = "text-yellow-300", empty = false }) {
  return (
    <div className="rounded-xl border border-gray-800/90 bg-black/50 px-2.5 sm:px-3 py-2.5 text-center min-h-[64px] flex flex-col justify-center">
      <p className="text-gray-500 text-[10px] sm:text-[11px] font-bold mb-1 leading-tight">{label}</p>
      {empty ? (
        <span className={`font-black text-lg ${accent} opacity-60`}>—</span>
      ) : (
        <AnimatedValue value={value} suffix={suffix} className={`font-black text-base sm:text-lg ${accent}`} />
      )}
    </div>
  );
}

function ChartLegend({ t }) {
  return (
    <div className="flex flex-wrap justify-center gap-4 text-[10px] sm:text-xs text-gray-400 mb-2">
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" aria-hidden />
        {t("member.analytics.legendHabits")}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-sky-400" aria-hidden />
        {t("member.analytics.legendMental")}
      </span>
    </div>
  );
}

export default function ProgressCommandCenter({ hasHabit, hasTask }) {
  const { t } = useTranslation();
  const { weekDays, weekDaysList: weekDaysFromCatalog } = useTrackerCatalog();
  const weekDaysList = weekDaysFromCatalog ?? weekDays ?? [];
  const { analytics } = useTracker();
  const habit = analytics?.habit ?? null;
  const task = analytics?.task ?? null;
  const lifeScore = analytics?.lifeScore ?? 0;

  const trendConfig = useMemo(
    () => ({
      habits: { label: t("member.analytics.chartHabits"), color: "hsl(48 96% 53%)" },
      mental: { label: t("member.analytics.chartMental"), color: "hsl(199 89% 48%)" },
    }),
    [t],
  );

  const taskDayConfig = useMemo(
    () => ({
      pct: { label: t("member.analytics.chartTaskDay"), color: "hsl(152 76% 45%)" },
    }),
    [t],
  );

  const trendData =
    habit?.dailyTrend?.map((d) => ({
      ...d,
      mental: d.mental ?? undefined,
    })) ?? [];

  const taskByDay =
    task?.byDay?.map((d, i) => {
      const dayLabel = weekDaysList[i] ?? "";
      return {
        name: dayLabel ? String(dayLabel).slice(0, 4) : String(i),
        fullName: dayLabel || String(i),
        pct: d?.pct ?? 0,
        done: d?.done ?? 0,
        total: d?.total ?? 0,
      };
    }) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-5"
    >
      <section className="relative overflow-hidden rounded-2xl border border-yellow-400/25 bg-gradient-to-bl from-yellow-400/10 via-[#0d1117] to-black p-4 sm:p-5 md:p-6">
        <motion.div
          className="absolute -top-16 -start-16 w-48 h-48 rounded-full bg-yellow-400/10 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 5, repeat: Infinity }}
          aria-hidden
        />

        <div className="relative flex flex-col gap-5 lg:gap-6">
          <div className="flex flex-col items-center lg:flex-row lg:items-center gap-5 lg:gap-8">
            <ProgressRing
              value={lifeScore}
              size={112}
              stroke={8}
              accent="#facc15"
              label={t("member.analytics.lifeScore")}
              sublabel={t("member.analytics.lifeSublabel")}
            />
            <div className="flex-1 w-full text-center lg:text-start space-y-2">
              <p className="text-yellow-400/90 text-xs font-bold">{t("member.analytics.progressBoard")}</p>
              <h3 className="text-white font-black text-lg sm:text-xl md:text-2xl leading-snug">
                {t("member.analytics.progressHeadline")}
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto lg:mx-0">
                {habit && (
                  <>
                    {t("member.analytics.progressToday", {
                      done: habit.completedToday,
                      total: habit.totalHabits,
                    })}
                    {habit.bestStreak > 0
                      ? t("member.analytics.progressStreak", { count: habit.bestStreak })
                      : ""}
                  </>
                )}
                {!habit && hasHabit && t("member.analytics.progressStartHabits")}
                {task && habit && " · "}
                {task && t("member.analytics.progressWeekTasks", { count: task.done })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {hasHabit && habit && (
              <>
                <MetricTile label={t("member.analytics.metricToday")} value={habit.todayRate} accent="text-yellow-300" />
                <MetricTile label={t("member.analytics.metricMonth")} value={habit.monthRate} accent="text-emerald-300" />
                <MetricTile
                  label={t("member.analytics.metricMental")}
                  value={habit.mentalToday ?? 0}
                  empty={habit.mentalToday == null}
                  accent="text-sky-300"
                />
                <MetricTile
                  label={t("member.analytics.metricStreak")}
                  value={habit.bestStreak}
                  suffix=""
                  accent="text-orange-300"
                />
              </>
            )}
            {hasTask && task && (
              <MetricTile label={t("member.analytics.metricWeekTasks")} value={task.pct} accent="text-emerald-300" />
            )}
          </div>

          <div className="hidden md:flex flex-wrap justify-center gap-6 pt-2 border-t border-gray-800/80">
            {hasHabit && habit && (
              <>
                <ProgressRing
                  value={habit.todayRate}
                  size={80}
                  stroke={6}
                  label={t("member.analytics.ringToday")}
                  accent="#facc15"
                />
                <ProgressRing
                  value={habit.monthRate}
                  size={80}
                  stroke={6}
                  label={t("member.analytics.ringMonth")}
                  accent="#34d399"
                />
              </>
            )}
            {hasTask && task && (
              <ProgressRing
                value={task.pct}
                size={80}
                stroke={6}
                label={t("member.analytics.ringTasks")}
                accent="#34d399"
              />
            )}
          </div>
        </div>
      </section>

      {hasHabit && habit && trendData.length > 0 && (
        <section className="rounded-2xl border border-gray-800 bg-[#0d1117]/90 p-3 sm:p-4 member-chart-wrap">
          <h4 className="text-white font-black text-sm mb-1">
            {t("member.analytics.trendTitle", { count: trendData.length })}
          </h4>
          <ChartLegend t={t} />
          <ChartContainer config={trendConfig} className="h-[180px] sm:h-[200px] w-full aspect-auto">
            <AreaChart data={trendData} margin={{ top: 8, right: 4, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="habitFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(48 96% 53%)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="hsl(48 96% 53%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="mentalFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(199 89% 48%)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="habits"
                stroke="var(--color-habits)"
                fill="url(#habitFill)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="mental"
                stroke="var(--color-mental)"
                fill="url(#mentalFill)"
                strokeWidth={2}
                connectNulls
              />
            </AreaChart>
          </ChartContainer>
        </section>
      )}

      {hasHabit && habit && <MentalMoodLive variant="overview" />}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {hasHabit && habit && (
          <section className="rounded-2xl border border-yellow-400/15 bg-black/30 p-3 sm:p-4 min-w-0">
            <h4 className="text-white font-black text-sm mb-1">{t("member.analytics.habitMonthTitle")}</h4>
            <p className="text-gray-500 text-[11px] mb-4">{t("member.analytics.habitMonthSub")}</p>
            <HabitProgressBars habits={habit.perHabit} />
          </section>
        )}

        {hasTask && task && (
          <section className="rounded-2xl border border-emerald-400/15 bg-black/30 p-3 sm:p-4 member-chart-wrap min-w-0">
            <h4 className="text-white font-black text-sm mb-3">{t("member.analytics.taskDayTitle")}</h4>
            <ChartContainer config={taskDayConfig} className="h-[200px] sm:h-[220px] w-full aspect-auto">
              <BarChart data={taskByDay} margin={{ top: 8, right: 4, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <ChartTooltip
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div className="rounded-lg border border-gray-700 bg-black/95 px-3 py-2 text-xs">
                        <p className="text-emerald-300 font-bold">{payload[0].payload.fullName}</p>
                        <p className="text-gray-300 mt-0.5">
                          {payload[0].payload.done}/{payload[0].payload.total} · {payload[0].value}%
                        </p>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]} fill="hsl(152 76% 45%)" maxBarSize={36}>
                  {taskByDay.map((_, i) => (
                    <Cell key={i} fill={`hsl(152 76% ${38 + (i % 3) * 6}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <p className="text-gray-500 text-[11px] mt-2 text-center leading-relaxed">
              {t("member.analytics.taskRemaining", { count: task.remaining })}
            </p>
          </section>
        )}
      </div>
    </motion.div>
  );
}
