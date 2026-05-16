import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { TASK_PRIORITIES, WEEK_DAYS_AR } from "@/lib/tracker-catalog";
import { loadTaskTracker, saveTaskTracker } from "@/lib/tracker-storage";

export default function TaskWeeklyBoard({ userId }) {
  const [{ week, data }, setState] = useState(() => loadTaskTracker(userId));
  const weekData = data.weeks[week] || { items: [] };
  const items = weekData.items;
  const [draft, setDraft] = useState({ title: "", day: 0, priority: "med" });

  const persist = (next) => {
    saveTaskTracker(userId, next);
    setState(loadTaskTracker(userId));
  };

  const toggleDone = (id) => {
    const nextItems = items.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    persist({ ...data, weeks: { ...data.weeks, [week]: { items: nextItems } } });
  };

  const removeTask = (id) => {
    persist({
      ...data,
      weeks: { ...data.weeks, [week]: { items: items.filter((t) => t.id !== id) } },
    });
  };

  const addTask = () => {
    const title = draft.title.trim();
    if (!title) return;
    const next = {
      id: `task_${Date.now()}`,
      title,
      day: draft.day,
      priority: draft.priority,
      done: false,
    };
    persist({ ...data, weeks: { ...data.weeks, [week]: { items: [...items, next] } } });
    setDraft({ title: "", day: 0, priority: "med" });
  };

  const doneCount = items.filter((t) => t.done).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-emerald-400/90 text-xs font-bold">✅ المخطط الأسبوعي · Massar</p>
          <h3 className="text-white font-black text-xl">مهام الأسبوع</h3>
        </div>
        <div className="rounded-xl bg-black/40 border border-emerald-400/25 px-4 py-2 text-center">
          <p className="text-gray-500 text-[10px] font-bold">إنجاز</p>
          <p className="text-emerald-300 font-black text-lg">
            {doneCount}/{items.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-2">
        {WEEK_DAYS_AR.map((dayLabel, dayIndex) => {
          const dayTasks = items.filter((t) => t.day === dayIndex);
          return (
            <div
              key={dayLabel}
              className="rounded-xl border border-emerald-400/15 bg-[#0d1117]/90 min-h-[200px] flex flex-col"
            >
              <div className="px-2 py-2 bg-emerald-900/40 border-b border-emerald-400/20 text-center">
                <p className="text-emerald-200 font-black text-xs">{dayLabel}</p>
                <p className="text-gray-500 text-[10px]">
                  {dayTasks.filter((t) => t.done).length}/{dayTasks.length}
                </p>
              </div>
              <ul className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[280px]">
                {dayTasks.map((task) => {
                  const pri = TASK_PRIORITIES.find((p) => p.id === task.priority);
                  return (
                    <li
                      key={task.id}
                      className="bg-black/40 rounded-lg p-2 border border-gray-800 group"
                    >
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => toggleDone(task.id)}
                          className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center ${
                            task.done ? "bg-emerald-400 text-black" : "bg-gray-800 text-gray-500"
                          }`}
                        >
                          {task.done ? <Check className="w-3 h-3" strokeWidth={3} /> : null}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-medium leading-snug ${
                              task.done ? "line-through text-gray-500" : "text-gray-200"
                            }`}
                          >
                            {pri?.icon} {task.title}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400"
                          aria-label="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="dark-card rounded-xl p-4 border border-emerald-400/20 space-y-3">
        <p className="text-white font-bold text-sm">➕ مهمة جديدة</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTask())}
            placeholder="ماذا ستنجز؟"
            className="flex-1 bg-black/40 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-emerald-400"
          />
          <select
            value={draft.day}
            onChange={(e) => setDraft({ ...draft, day: Number(e.target.value) })}
            className="bg-black/40 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm"
          >
            {WEEK_DAYS_AR.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={draft.priority}
            onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
            className="bg-black/40 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm"
          >
            {TASK_PRIORITIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.icon} {p.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addTask}
            className="bg-emerald-400/20 border border-emerald-400/40 text-emerald-200 px-4 py-2 rounded-xl font-bold hover:bg-emerald-400/30"
          >
            <Plus className="w-5 h-5 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
}
