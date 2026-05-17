import { defaultHabitDefs, defaultTaskItems } from "@/lib/tracker-resolve";
import { monthStorageKey } from "@/lib/tracker-catalog";

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function key(userId, namespace) {
  return `massar_tracker_${userId}_${namespace}`;
}

function stripHabitsForStorage(habits) {
  return (habits || []).map((h) => ({
    id: h.id,
    icon: h.icon || "✨",
    ...(String(h.id).startsWith("c") && h.name ? { name: h.name } : {}),
  }));
}

export function loadHabitTracker(userId) {
  const month = monthStorageKey();
  const raw = localStorage.getItem(key(userId, "habits"));
  const parsed = safeParse(raw, null);
  const data = parsed || { habits: defaultHabitDefs(), months: {} };
  if (!data.habits?.length) data.habits = defaultHabitDefs();
  data.habits = stripHabitsForStorage(data.habits);
  if (!data.months[month]) {
    data.months[month] = { checks: {}, mental: {} };
  }
  return { month, data };
}

export function saveHabitTracker(userId, data) {
  const toSave = {
    ...data,
    habits: stripHabitsForStorage(data.habits),
  };
  localStorage.setItem(key(userId, "habits"), JSON.stringify(toSave));
}

export function loadTaskTracker(userId) {
  const week = weekStorageKey();
  const raw = localStorage.getItem(key(userId, "tasks"));
  const data = safeParse(raw, { weeks: {} });
  if (!data.weeks[week]) {
    data.weeks[week] = { items: [] };
  }
  return { week, data };
}

/** Seed default week tasks when empty (titles resolved in UI via i18n). */
export function ensureDefaultWeekTasks(userId, t) {
  const { week, data } = loadTaskTracker(userId);
  const weekData = data.weeks[week] || { items: [] };
  if (weekData.items.length > 0) return { week, data };
  const next = {
    ...data,
    weeks: { ...data.weeks, [week]: { items: defaultTaskItems(t) } },
  };
  saveTaskTracker(userId, next);
  return loadTaskTracker(userId);
}

export function saveTaskTracker(userId, data) {
  localStorage.setItem(key(userId, "tasks"), JSON.stringify(data));
}

function weekStorageKey(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const sunday = new Date(d.setDate(diff));
  return sunday.toISOString().slice(0, 10);
}

export function habitCompletionRate(habits, checks, dayCount) {
  if (!habits.length || !dayCount) return 0;
  let total = 0;
  let hit = 0;
  for (let d = 1; d <= dayCount; d++) {
    for (const h of habits) {
      total += 1;
      if (checks[`${d}:${h.id}`]) hit += 1;
    }
  }
  return total ? Math.round((hit / total) * 100) : 0;
}

export function habitDayRate(habits, checks, day) {
  if (!habits.length) return 0;
  const done = habits.filter((h) => checks[`${day}:${h.id}`]).length;
  return Math.round((done / habits.length) * 100);
}
