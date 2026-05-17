/** Resolve stored tracker rows to the active UI language (EN / AR / TH). */

export const HABIT_ICON_BY_ID = {
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

export const DEFAULT_TASK_TEMPLATE_KEYS = {
  t1: "tracker.defaultTasks.t1",
  t2: "tracker.defaultTasks.t2",
  t3: "tracker.defaultTasks.t3",
  t4: "tracker.defaultTasks.t4",
  t5: "tracker.defaultTasks.t5",
};

const METRIC_ICONS = { energy: "⚡", mood: "😊", drive: "🔥" };

/** Habits persisted in localStorage — id + icon only for built-ins; custom rows keep user title. */
export function defaultHabitDefs() {
  return Object.entries(HABIT_ICON_BY_ID).map(([id, icon]) => ({ id, icon }));
}

/**
 * @param {Array<{ id: string; icon?: string; name?: string }>} habits
 * @param {(key: string, opts?: object) => string} t
 */
export function localizeHabits(habits, t) {
  if (!habits?.length) return defaultHabitDefs().map((h) => localizeHabitRow(h, t));
  return habits.map((h) => localizeHabitRow(h, t));
}

function localizeHabitRow(h, t) {
  const id = h?.id || `c${Date.now()}`;
  const icon = h?.icon || HABIT_ICON_BY_ID[id] || "✨";
  if (String(id).startsWith("c")) {
    return { id, icon, name: h?.name || "" };
  }
  return {
    id,
    icon,
    name: t(`tracker.habits.${id}`, { defaultValue: h?.name || id }),
  };
}

/**
 * @param {Array<{ id: string; title?: string; day: number; priority: string; done?: boolean }>} items
 * @param {(key: string, opts?: object) => string} t
 */
export function localizeTasks(items, t) {
  if (!items?.length) return defaultTaskItems(t);
  return items.map((item) => {
    const key = DEFAULT_TASK_TEMPLATE_KEYS[item.id];
    if (key) {
      return { ...item, title: t(key) };
    }
    return item;
  });
}

export function defaultTaskItems(t) {
  return Object.entries(DEFAULT_TASK_TEMPLATE_KEYS).map(([id, key]) => {
    const meta = {
      t1: { day: 0, priority: "high" },
      t2: { day: 0, priority: "med" },
      t3: { day: 1, priority: "med" },
      t4: { day: 2, priority: "high" },
      t5: { day: 6, priority: "low" },
    }[id];
    return {
      id,
      title: t(key),
      day: meta.day,
      priority: meta.priority,
      done: false,
    };
  });
}

/** Mental metric rows for analytics UI — labels from i18n at render time. */
export function mentalMetricDefs(t) {
  return ["energy", "mood", "drive"].map((id) => ({
    id,
    icon: METRIC_ICONS[id],
    label: t(`tracker.metrics.${id}`),
  }));
}
