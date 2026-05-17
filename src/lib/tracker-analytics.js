import { DEFAULT_HABITS, MENTAL_METRICS, daysInMonth } from "@/lib/tracker-catalog";
import {
  habitCompletionRate,
  habitDayRate,
  loadHabitTracker,
  loadTaskTracker,
} from "@/lib/tracker-storage";

function habitStreak(habitId, checks, throughDay) {
  let streak = 0;
  for (let d = throughDay; d >= 1; d--) {
    if (checks[`${d}:${habitId}`]) streak += 1;
    else break;
  }
  return streak;
}

function mentalScoreForDay(mental, day, metrics = MENTAL_METRICS) {
  const vals = metrics
    .map((m) => mental[`${day}:${m.id}`])
    .filter((v) => typeof v === "number");
  if (!vals.length) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round((avg / 10) * 100);
}

export function computeHabitAnalytics(userId, today = new Date()) {
  const state = loadHabitTracker(userId);
  const { month, data } = state;
  const monthData = data.months[month] || { checks: {}, mental: {} };
  const { checks, mental } = monthData;
  const habits = data.habits?.length ? data.habits : DEFAULT_HABITS;
  const dayCount = daysInMonth(today);
  const todayNum = today.getDate();

  const perHabit = habits.map((h) => {
    let done = 0;
    for (let d = 1; d <= dayCount; d++) {
      if (checks[`${d}:${h.id}`]) done += 1;
    }
    const pct = dayCount ? Math.round((done / dayCount) * 100) : 0;
    const todayDone = Boolean(checks[`${todayNum}:${h.id}`]);
    return {
      ...h,
      done,
      pct,
      todayDone,
      streak: habitStreak(h.id, checks, todayNum),
    };
  });

  const todayRate = habitDayRate(habits, checks, todayNum);
  const monthRate = habitCompletionRate(habits, checks, dayCount);
  const mentalToday = mentalScoreForDay(mental, todayNum);
  const mentalMonthAvg = (() => {
    const scores = [];
    for (let d = 1; d <= todayNum; d++) {
      const s = mentalScoreForDay(mental, d);
      if (s != null) scores.push(s);
    }
    return scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;
  })();

  const dailyTrend = [];
  const start = Math.max(1, todayNum - 13);
  for (let d = start; d <= todayNum; d++) {
    dailyTrend.push({
      day: d,
      label: String(d),
      habits: habitDayRate(habits, checks, d),
      mental: mentalScoreForDay(mental, d),
    });
  }

  const bestStreak = perHabit.reduce((max, h) => Math.max(max, h.streak), 0);
  const completedToday = perHabit.filter((h) => h.todayDone).length;

  return {
    todayNum,
    dayCount,
    todayRate,
    monthRate,
    mentalToday,
    mentalMonthAvg,
    perHabit,
    dailyTrend,
    bestStreak,
    completedToday,
    totalHabits: habits.length,
    mentalBreakdown: MENTAL_METRICS.map((m) => {
      const raw = mental[`${todayNum}:${m.id}`];
      return {
        ...m,
        value: raw ?? null,
        pct: raw != null ? Math.round((raw / 10) * 100) : null,
      };
    }),
  };
}

export function computeTaskAnalytics(userId) {
  const { week, data } = loadTaskTracker(userId);
  const weekData = data.weeks[week] || { items: [] };
  const items = weekData.items || [];
  const total = items.length;
  const done = items.filter((t) => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const byDay = Array.from({ length: 7 }, (_, day) => {
    const dayItems = items.filter((t) => t.day === day);
    const dayDone = dayItems.filter((t) => t.done).length;
    return {
      day,
      total: dayItems.length,
      done: dayDone,
      pct: dayItems.length ? Math.round((dayDone / dayItems.length) * 100) : 0,
    };
  });

  return { total, done, pct, byDay, remaining: total - done };
}

export function computeLifeScore({ habit, task, hasHabit, hasTask }) {
  const parts = [];
  let weight = 0;

  if (hasHabit && habit) {
    parts.push({ w: 0.45, v: habit.todayRate });
    parts.push({ w: 0.25, v: habit.monthRate });
    if (habit.mentalToday != null) {
      parts.push({ w: 0.2, v: habit.mentalToday });
    }
    weight += habit.mentalToday != null ? 0.9 : 0.7;
  }

  if (hasTask && task) {
    const tw = hasHabit ? 0.1 : 0.35;
    parts.push({ w: tw, v: task.pct });
    weight += tw;
  }

  if (!parts.length) return 0;
  const sum = parts.reduce((acc, p) => acc + p.w * p.v, 0);
  return Math.round(sum / weight);
}

export function computeFullAnalytics(userId, { hasHabit, hasTask }) {
  const habit = hasHabit ? computeHabitAnalytics(userId) : null;
  const task = hasTask ? computeTaskAnalytics(userId) : null;
  const lifeScore = computeLifeScore({ habit, task, hasHabit, hasTask });

  return { habit, task, lifeScore, at: Date.now() };
}

/** Instant feedback copy after user actions */
export function buildInsight({ type, habit, task, analytics }, t) {
  if (!t) return null;

  if (type === "habit_toggle_on" && habit) {
    const h = analytics.habit?.perHabit?.find((x) => x.id === habit.id);
    if (analytics.habit?.todayRate === 100) {
      return {
        emoji: "🏆",
        title: t("member.insight.legendaryTitle"),
        body: t("member.insight.legendaryBody"),
      };
    }
    if (h?.streak >= 3) {
      return {
        emoji: "🔥",
        title: t("member.insight.streakTitle", { count: h.streak }),
        body: t("member.insight.streakBody", { icon: habit.icon, name: habit.name }),
      };
    }
    return {
      emoji: habit.icon || "✓",
      title: t("member.insight.habitLoggedTitle"),
      body: t("member.insight.habitLoggedBody", {
        name: habit.name,
        pct: analytics.habit?.todayRate,
      }),
    };
  }
  if (type === "habit_toggle_off") {
    return {
      emoji: "💪",
      title: t("member.insight.habitOffTitle"),
      body: t("member.insight.habitOffBody"),
    };
  }
  if (type === "mental" && habit) {
    const score = analytics.habit?.mentalToday;
    if (score >= 80) {
      return {
        emoji: "⚡",
        title: t("member.insight.mentalHighTitle"),
        body: t("member.insight.mentalHighBody", { score }),
      };
    }
    if (score >= 50) {
      return {
        emoji: "🌤️",
        title: t("member.insight.mentalMidTitle"),
        body: t("member.insight.mentalMidBody", { score }),
      };
    }
    return {
      emoji: "🌙",
      title: t("member.insight.mentalLowTitle"),
      body: t("member.insight.mentalLowBody"),
    };
  }
  if (type === "task_done") {
    return {
      emoji: "✅",
      title: t("member.insight.taskDoneTitle"),
      body: t("member.insight.taskDoneBody", {
        pct: analytics.task?.pct,
        done: analytics.task?.done,
        total: analytics.task?.total,
      }),
    };
  }
  if (type === "task_add") {
    return {
      emoji: "🎯",
      title: t("member.insight.taskAddTitle"),
      body: t("member.insight.taskAddBody"),
    };
  }
  return null;
}
