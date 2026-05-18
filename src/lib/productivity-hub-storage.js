function key(userId) {
  return `massar_productivity_hub_${userId}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function defaultState() {
  return {
    todos: [],
    gratitude: ["", "", ""],
    weeklyReview: "",
    goals: [
      { id: "g1", title: "", progress: 0 },
      { id: "g2", title: "", progress: 0 },
      { id: "g3", title: "", progress: 0 },
    ],
    money: { goal: 0, saved: 0 },
    pomodoro: { sessionsByDay: {} },
    pomodoroSecondsLeft: 25 * 60,
    pomodoroRunning: false,
    pomodoroMode: "work",
  };
}

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function loadProductivityHub(userId) {
  const raw = localStorage.getItem(key(userId));
  const parsed = safeParse(raw);
  const base = defaultState();
  if (!parsed || typeof parsed !== "object") return base;
  return {
    ...base,
    ...parsed,
    todos: Array.isArray(parsed.todos) ? parsed.todos : base.todos,
    gratitude: Array.isArray(parsed.gratitude) ? parsed.gratitude.slice(0, 3) : base.gratitude,
    weeklyReview: typeof parsed.weeklyReview === "string" ? parsed.weeklyReview : base.weeklyReview,
    goals: Array.isArray(parsed.goals) && parsed.goals.length ? parsed.goals : base.goals,
    money: parsed.money && typeof parsed.money === "object" ? { ...base.money, ...parsed.money } : base.money,
    pomodoro: parsed.pomodoro && typeof parsed.pomodoro === "object"
      ? { ...base.pomodoro, ...parsed.pomodoro }
      : base.pomodoro,
  };
}

export function saveProductivityHub(userId, data) {
  localStorage.setItem(key(userId), JSON.stringify(data));
}

export function pomodoroSessionsToday(userId) {
  const { pomodoro } = loadProductivityHub(userId);
  const d = todayKey();
  const map = pomodoro.sessionsByDay && typeof pomodoro.sessionsByDay === "object" ? pomodoro.sessionsByDay : {};
  return Number(map[d]) || 0;
}

export function incrementPomodoroSession(userId) {
  const data = loadProductivityHub(userId);
  const d = todayKey();
  const map = { ...(data.pomodoro.sessionsByDay || {}) };
  map[d] = (Number(map[d]) || 0) + 1;
  saveProductivityHub(userId, {
    ...data,
    pomodoro: { ...data.pomodoro, sessionsByDay: map },
  });
}
