/** Tracker IDs and icons — all display strings come from i18n (tracker.*). */

export { defaultHabitDefs as DEFAULT_HABITS, HABIT_ICON_BY_ID } from "@/lib/tracker-resolve.js";

export const MENTAL_METRIC_IDS = ["energy", "mood", "drive"];

/** @deprecated Use MENTAL_METRIC_IDS + i18n */
export const MENTAL_METRICS = MENTAL_METRIC_IDS.map((id) => ({ id }));

export function daysInMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function monthStorageKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
