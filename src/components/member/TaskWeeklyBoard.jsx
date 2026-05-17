import { useEffect, useMemo, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { useTrackerCatalog } from "@/lib/useTrackerCatalog";
import { useTranslation } from "react-i18next";
import { useTracker } from "@/lib/TrackerContext";
import { localizeTasks } from "@/lib/tracker-resolve";
import { ensureDefaultWeekTasks, loadTaskTracker, saveTaskTracker } from "@/lib/tracker-storage";
import AnimatedValue from "@/components/member/analytics/AnimatedValue";

function TaskCard({ task, pri, onToggle, onRemove, t }) {
  return (
    <li className="bg-black/45 rounded-lg p-3 border border-gray-800/90">
      <div className="flex items-center justify-between gap-2 mb-2">
        <button
          type="button"
          onClick={onToggle}
          aria-label={task.done ? t("member.taskMarkUndone") : t("member.taskMarkDone")}
          className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors ${
            task.done ? "bg-emerald-400 text-black" : "bg-gray-800 text-gray-500 hover:bg-gray-700"
          }`}
        >
          {task.done ? <Check className="w-4 h-4" strokeWidth={3} /> : null}
        </button>
        <span className="text-[10px] text-gray-500 font-bold px-2 py-0.5 rounded-md bg-gray-800/80">
          {pri?.icon} {pri?.label}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-600 hover:text-red-400 p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-red-950/30"
          aria-label={t("member.taskDelete")}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <p
        className={`text-sm leading-relaxed text-start w-full ${
          task.done ? "line-through text-gray-500" : "text-gray-100"
        }`}
      >
        {task.title}
      </p>
    </li>
  );
}

export default function TaskWeeklyBoard({ userId }) {
  const { t, i18n } = useTranslation();
  const { weekDays, taskPriorities } = useTrackerCatalog();
  const { flashInsight } = useTracker();
  const [{ week, data }, setState] = useState(() => loadTaskTracker(userId));

  useEffect(() => {
    ensureDefaultWeekTasks(userId, t);
    setState(loadTaskTracker(userId));
  }, [userId, t, i18n.language]);

  const weekData = data.weeks[week] || { items: [] };
  const items = useMemo(
    () => localizeTasks(weekData.items, t),
    [weekData.items, t, i18n.language],
  );
  const [draft, setDraft] = useState({ title: "", day: 0, priority: "med" });

  const persist = (next) => {
    saveTaskTracker(userId, next);
    setState(loadTaskTracker(userId));
  };

  const toggleDone = (id) => {
    const task = items.find((t) => t.id === id);
    const turningOn = task && !task.done;
    const nextItems = items.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    persist({ ...data, weeks: { ...data.weeks, [week]: { items: nextItems } } });
    if (turningOn) flashInsight({ type: "task_done" });
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
    flashInsight({ type: "task_add" });
  };

  const doneCount = items.filter((t) => t.done).length;
  const weekPct = useMemo(
    () => (items.length ? Math.round((doneCount / items.length) * 100) : 0),
    [doneCount, items.length],
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-emerald-400/90 text-xs font-bold">{t("member.taskTracker")}</p>
          <h3 className="text-white font-black text-lg sm:text-xl">{t("member.taskWeekTitle")}</h3>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <div className="rounded-xl bg-black/50 border border-emerald-400/25 px-4 py-2 text-center min-w-[80px]">
            <p className="text-gray-500 text-[10px] font-bold mb-0.5">{t("member.taskDoneCol")}</p>
            <p className="text-emerald-300 font-black text-lg tabular-nums">
              {doneCount}/{items.length}
            </p>
          </div>
          <div className="rounded-xl bg-black/50 border border-emerald-400/25 px-3 py-2 text-center min-w-[72px]">
            <p className="text-gray-500 text-[10px] font-bold mb-0.5">{t("member.taskRateCol")}</p>
            <AnimatedValue value={weekPct} suffix="%" className="text-emerald-300 font-black text-lg" />
          </div>
        </div>
      </div>

      <p className="text-gray-500 text-[11px] lg:hidden">{t("member.taskScrollHint")}</p>
      <div
        className="member-tabs-scroll flex lg:grid lg:grid-cols-7 gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 snap-x snap-mandatory lg:[grid-template-columns:repeat(7,minmax(9.5rem,1fr))]"
       
      >
        {weekDays.map((dayLabel, dayIndex) => {
          const dayTasks = items.filter((t) => t.day === dayIndex);
          const dayDone = dayTasks.filter((t) => t.done).length;
          return (
            <div
              key={dayLabel}
              className="flex-shrink-0 w-[min(88vw,300px)] sm:w-[280px] lg:w-full lg:min-w-[9.5rem] snap-center rounded-xl border border-emerald-400/15 bg-[#0d1117]/95 min-h-[240px] flex flex-col"
            >
              <div className="px-3 py-2.5 bg-emerald-900/35 border-b border-emerald-400/20 text-center flex-shrink-0">
                <p className="text-emerald-100 font-black text-sm">{dayLabel}</p>
                <p className="text-gray-500 text-[11px] mt-0.5 tabular-nums">
                  {t("member.taskDayProgress", { done: dayDone, total: dayTasks.length })}
                </p>
              </div>
              <ul className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[320px] lg:max-h-[360px]">
                {dayTasks.length === 0 ? (
                  <li className="text-gray-600 text-xs text-center py-8 px-3 leading-relaxed">
                    {t("member.taskNoTasksDay")}
                    <br />
                    <span className="text-gray-700">{t("member.taskAddBelow")}</span>
                  </li>
                ) : (
                  dayTasks.map((task) => {
                    const pri = taskPriorities.find((p) => p.id === task.priority);
                    return (
                      <TaskCard
                        key={task.id}
                        task={task}
                        pri={pri}
                        t={t}
                        onToggle={() => toggleDone(task.id)}
                        onRemove={() => removeTask(task.id)}
                      />
                    );
                  })
                )}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="dark-card rounded-xl p-4 sm:p-5 border border-emerald-400/20 space-y-3">
        <p className="text-white font-bold text-sm">{t("member.taskNew")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <input
            type="text"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTask())}
            placeholder={t("member.taskPlaceholder")}
            className="sm:col-span-2 bg-black/40 border border-gray-700 rounded-xl px-3 py-3 text-white text-sm min-h-[44px] outline-none focus:border-emerald-400/50"
          />
          <select
            value={draft.day}
            onChange={(e) => setDraft({ ...draft, day: Number(e.target.value) })}
            className="bg-black/40 border border-gray-700 rounded-xl px-3 py-3 text-white text-sm min-h-[44px]"
            aria-label={t("member.taskDayAria")}
          >
            {weekDays.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={draft.priority}
            onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
            className="bg-black/40 border border-gray-700 rounded-xl px-3 py-3 text-white text-sm min-h-[44px]"
            aria-label={t("member.taskPriorityAria")}
          >
            {taskPriorities.map((p) => (
              <option key={p.id} value={p.id}>
                {p.icon} {p.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={addTask}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-400/20 border border-emerald-400/40 text-emerald-100 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-400/30 min-h-[44px]"
        >
          <Plus className="w-5 h-5" />
          {t("member.taskAddBtn")}
        </button>
      </div>
    </div>
  );
}
