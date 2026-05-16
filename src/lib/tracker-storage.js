import {
  DEFAULT_HABITS,
  monthStorageKey,
} from "@/lib/tracker-catalog";

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

export function loadHabitTracker(userId) {
  const month = monthStorageKey();
  const raw = localStorage.getItem(key(userId, "habits"));
  const data = safeParse(raw, { habits: DEFAULT_HABITS, months: {} });
  if (!data.months[month]) {
    data.months[month] = { checks: {}, mental: {} };
  }
  return { month, data };
}

export function saveHabitTracker(userId, data) {
  localStorage.setItem(key(userId, "habits"), JSON.stringify(data));
}

export function loadTaskTracker(userId) {
  const week = weekStorageKey();
  const raw = localStorage.getItem(key(userId, "tasks"));
  const data = safeParse(raw, { weeks: {} });
  if (!data.weeks[week]) {
    data.weeks[week] = { items: defaultWeekTasks() };
  }
  return { week, data };
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

function defaultWeekTasks() {
  return [
    { id: "t1", title: "مراجعة أهداف الأسبوع", day: 0, priority: "high", done: false },
    { id: "t2", title: "تخطيط المهام الكبرى", day: 0, priority: "med", done: false },
    { id: "t3", title: "متابعة البريد والرسائل", day: 1, priority: "med", done: false },
    { id: "t4", title: "جلسة تركيز عميق 90 د", day: 2, priority: "high", done: false },
    { id: "t5", title: "مراجعة نهاية الأسبوع", day: 6, priority: "low", done: false },
  ];
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
