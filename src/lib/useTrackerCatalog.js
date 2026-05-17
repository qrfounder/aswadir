import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { daysInMonth } from "@/lib/tracker-catalog";

const HABIT_IDS = [
  "wake",
  "gym",
  "read",
  "plan",
  "project",
  "no-alcohol",
  "social",
  "journal",
  "shower",
  "quran",
];

const METRIC_IDS = ["energy", "mood", "drive"];
const PRIORITY_IDS = ["high", "med", "low"];
const PACK_IDS = ["habit", "task", "bundle"];

const HABIT_ICONS = {
  wake: "⏰",
  gym: "💪",
  read: "📖",
  plan: "📋",
  project: "🎯",
  "no-alcohol": "🚫",
  social: "📵",
  journal: "📝",
  shower: "🚿",
  quran: "🕌",
};

const METRIC_ICONS = { energy: "⚡", mood: "😊", drive: "🔥" };
const PRIORITY_ICONS = { high: "🔴", med: "🟡", low: "🟢" };
const PACK_ICONS = { habit: "🌱", task: "✅", bundle: "✦" };

const INTL_LOCALE = { en: "en-US", ar: "ar-SA", th: "th-TH" };

/** Localized tracker labels (habits, days, metrics, packs). */
export function useTrackerCatalog() {
  const { t, i18n } = useTranslation();
  const intlLocale = INTL_LOCALE[i18n.language?.split("-")[0]] || i18n.language || "en-US";

  return useMemo(() => {
    const defaultHabits = HABIT_IDS.map((id) => ({
      id,
      icon: HABIT_ICONS[id],
      name: t(`tracker.habits.${id}`),
    }));

    const weekDays = t("tracker.weekDays", { returnObjects: true });
    const weekDaysList = Array.isArray(weekDays) ? weekDays : [];

    const mentalMetrics = METRIC_IDS.map((id) => ({
      id,
      icon: METRIC_ICONS[id],
      label: t(`tracker.metrics.${id}`),
    }));

    const taskPriorities = PRIORITY_IDS.map((id) => ({
      id,
      icon: PRIORITY_ICONS[id],
      label: t(`tracker.priorities.${id}`),
    }));

    const packMeta = Object.fromEntries(
      PACK_IDS.map((id) => [
        id,
        {
          id,
          icon: PACK_ICONS[id],
          name: t(`tracker.packs.${id}.name`),
          tagline: t(`tracker.packs.${id}.tagline`),
          sheetLabel: t(`tracker.packs.${id}.sheet`),
        },
      ]),
    );

    const monthLabel = (date = new Date()) =>
      new Intl.DateTimeFormat(intlLocale, { month: "long" }).format(date);

    return {
      defaultHabits,
      weekDays: weekDaysList,
      weekDaysList,
      mentalMetrics,
      taskPriorities,
      packMeta,
      monthLabel,
      daysInMonth,
    };
  }, [t, intlLocale]);
}
