import { useEffect, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";

const defaultHabits = ["شرب الماء", "قراءة 10 صفحات", "تمرين 20 دقيقة"];

export default function DailyHabitsPanel({ userId }) {
  const storageKey = `massar_habits_${userId}`;
  const todayKey = new Date().toISOString().slice(0, 10);

  const [habits, setHabits] = useState(defaultHabits);
  const [done, setDone] = useState({});
  const [newHabit, setNewHabit] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.habits)) setHabits(parsed.habits);
        if (parsed.done?.[todayKey]) setDone(parsed.done[todayKey]);
      }
    } catch {
      /* ignore */
    }
  }, [storageKey, todayKey]);

  const persist = (nextHabits, nextDone) => {
    try {
      const raw = localStorage.getItem(storageKey);
      const base = raw ? JSON.parse(raw) : { habits: defaultHabits, done: {} };
      base.habits = nextHabits;
      base.done = { ...base.done, [todayKey]: nextDone };
      localStorage.setItem(storageKey, JSON.stringify(base));
    } catch {
      /* ignore */
    }
  };

  const toggle = (habit) => {
    const next = { ...done, [habit]: !done[habit] };
    setDone(next);
    persist(habits, next);
  };

  const addHabit = () => {
    const label = newHabit.trim();
    if (!label || habits.includes(label)) return;
    const next = [...habits, label];
    setHabits(next);
    setNewHabit("");
    persist(next, done);
  };

  const removeHabit = (habit) => {
    const next = habits.filter((h) => h !== habit);
    const nextDone = { ...done };
    delete nextDone[habit];
    setHabits(next);
    setDone(nextDone);
    persist(next, nextDone);
  };

  const completed = habits.filter((h) => done[h]).length;

  return (
    <div className="dark-card rounded-2xl p-5 space-y-4 border border-yellow-400/15">
      <div>
        <h3 className="text-white font-black text-lg">تسجيل اليوم</h3>
        <p className="text-gray-400 text-xs">
          نسخة أولى داخل الموقع — قريباً تتزامن مع نظامك الكامل على السحابة.
        </p>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">إنجاز اليوم</span>
        <span className="text-yellow-400 font-black">
          {completed}/{habits.length}
        </span>
      </div>

      <ul className="space-y-2">
        {habits.map((habit) => (
          <li
            key={habit}
            className="flex items-center gap-3 bg-black/30 rounded-xl px-3 py-2.5 border border-gray-800"
          >
            <button
              type="button"
              onClick={() => toggle(habit)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                done[habit]
                  ? "bg-yellow-400 text-black"
                  : "bg-gray-800 text-gray-500 hover:bg-gray-700"
              }`}
              aria-label={done[habit] ? "تم" : "علّم كمنجز"}
            >
              {done[habit] ? <Check className="w-4 h-4" strokeWidth={3} /> : null}
            </button>
            <span className={`flex-1 text-sm ${done[habit] ? "text-gray-500 line-through" : "text-gray-200"}`}>
              {habit}
            </span>
            <button
              type="button"
              onClick={() => removeHabit(habit)}
              className="text-gray-600 hover:text-red-400 p-1"
              aria-label="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHabit())}
          placeholder="عادة جديدة..."
          className="flex-1 bg-black/40 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-yellow-400"
        />
        <button
          type="button"
          onClick={addHabit}
          className="bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 px-3 rounded-xl hover:bg-yellow-400/25"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
