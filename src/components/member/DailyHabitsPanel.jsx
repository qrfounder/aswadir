import { useMemo, useState } from "react";
import { Check, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { daysInMonth } from "@/lib/tracker-catalog";
import { useTrackerCatalog } from "@/lib/useTrackerCatalog";
import { useTranslation } from "react-i18next";
import { useTracker } from "@/lib/TrackerContext";
import { habitCompletionRate, habitDayRate, loadHabitTracker, saveHabitTracker } from "@/lib/tracker-storage";
import AnimatedValue from "@/components/member/analytics/AnimatedValue";
import MentalMoodLive from "@/components/member/analytics/MentalMoodLive";

export default function DailyHabitsPanel({ userId }) {
  const { t } = useTranslation();
  const { defaultHabits, mentalMetrics, monthLabel } = useTrackerCatalog();
  const { flashInsight, refresh } = useTracker();
  const today = new Date();
  const dayCount = daysInMonth(today);
  const todayNum = today.getDate();
  const [{ month, data }, setState] = useState(() => loadHabitTracker(userId));
  const monthData = data.months[month] || { checks: {}, mental: {} };
  const { checks, mental } = monthData;
  const habits = data.habits?.length ? data.habits : defaultHabits;
  const [newHabit, setNewHabit] = useState("");

  const persist = (next) => {
    saveHabitTracker(userId, next);
    setState(loadHabitTracker(userId));
  };

  const toggle = (habit, d) => {
    const k = `${d}:${habit.id}`;
    const turningOn = !checks[k];
    persist({
      ...data,
      months: {
        ...data.months,
        [month]: { ...monthData, checks: { ...checks, [k]: turningOn } },
      },
    });
    flashInsight({
      type: turningOn ? "habit_toggle_on" : "habit_toggle_off",
      habit,
    });
  };

  const setMental = (mid, v, notify = false) => {
    persist({
      ...data,
      months: {
        ...data.months,
        [month]: { ...monthData, mental: { ...mental, [`${todayNum}:${mid}`]: v } },
      },
    });
    refresh();
    if (notify) flashInsight({ type: "mental" });
  };

  const addHabit = () => {
    const name = newHabit.trim();
    if (!name) return;
    persist({ ...data, habits: [...habits, { id: `c${Date.now()}`, icon: "✨", name }] });
    setNewHabit("");
  };

  const removeHabit = (hid) => {
    const nc = { ...checks };
    for (let d = 1; d <= dayCount; d++) delete nc[`${d}:${hid}`];
    persist({
      ...data,
      habits: habits.filter((h) => h.id !== hid),
      months: { ...data.months, [month]: { ...monthData, checks: nc } },
    });
  };

  const monthRate = useMemo(() => habitCompletionRate(habits, checks, dayCount), [habits, checks, dayCount]);
  const todayRate = useMemo(() => habitDayRate(habits, checks, todayNum), [habits, checks, todayNum]);
  const days = useMemo(() => Array.from({ length: dayCount }, (_, i) => i + 1), [dayCount]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-yellow-400/90 text-xs font-bold">{t("member.habitTracker")}</p>
          <h3 className="text-white font-black text-lg sm:text-xl">{monthLabel(today)}</h3>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <div className="rounded-xl bg-black/50 border border-yellow-400/20 px-3 py-2 text-center min-w-[76px]">
            <p className="text-gray-500 text-[10px] font-bold mb-0.5">{t("member.today")}</p>
            <AnimatedValue value={todayRate} suffix="%" className="font-black text-lg text-yellow-300" />
          </div>
          <div className="rounded-xl bg-black/50 border border-emerald-400/20 px-3 py-2 text-center min-w-[76px]">
            <p className="text-gray-500 text-[10px] font-bold mb-0.5">{t("member.monthCol")}</p>
            <AnimatedValue value={monthRate} suffix="%" className="font-black text-lg text-emerald-300" />
          </div>
        </div>
      </div>

      <div>
        <p className="text-gray-500 text-[11px] mb-2 flex items-center gap-1 md:hidden">
          <ChevronLeft className="w-3.5 h-3.5 text-yellow-400/70" aria-hidden />
          {t("member.scrollHint")}
        </p>
        <div className="member-table-scroll overflow-x-auto rounded-xl border border-yellow-400/20 bg-[#0d1117]/90 -mx-0.5 px-0.5">
          <table className="w-full min-w-[min(100%,520px)] sm:min-w-[640px] border-collapse text-xs">
            <thead>
              <tr className="bg-[#1a2744] text-white">
                <th className="sticky start-0 z-20 bg-[#1a2744] px-2 sm:px-3 py-2.5 text-start font-black min-w-[120px] sm:min-w-[140px] member-sticky-col">
                  {t("member.habitColumn")}
                </th>
                <th className="w-9 sm:w-10 text-center text-[10px] text-gray-400 py-2">{t("member.monthCol")}</th>
                {days.map((d) => (
                  <th
                    key={d}
                    className={`w-8 sm:w-9 py-2 text-center font-bold ${
                      d === todayNum
                        ? "bg-yellow-400/30 text-yellow-100 ring-1 ring-yellow-400/50"
                        : "text-gray-400"
                    }`}
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit, rowIdx) => {
                const doneCount = days.filter((d) => checks[`${d}:${habit.id}`]).length;
                const bar = Math.round((doneCount / dayCount) * 10);
                return (
                  <tr key={habit.id} className={rowIdx % 2 === 0 ? "bg-[#12181f]" : "bg-[#0f1419]"}>
                    <td className="sticky start-0 z-10 px-2 py-2 border-s border-gray-800/80 bg-inherit member-sticky-col">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="flex-shrink-0 text-sm">{habit.icon}</span>
                        <span className="text-gray-200 text-xs leading-snug line-clamp-2 min-w-0 flex-1">
                          {habit.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeHabit(habit.id)}
                          className="flex-shrink-0 text-gray-600 hover:text-red-400 p-1 min-w-[28px] min-h-[28px] flex items-center justify-center"
                          aria-label={t("member.deleteHabitAria", { name: habit.name })}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="text-center text-orange-300/90 text-[9px] sm:text-[10px] px-0.5">
                      {"█".repeat(bar) || "·"}
                    </td>
                    {days.map((d) => {
                      const on = checks[`${d}:${habit.id}`];
                      return (
                        <td key={d} className="p-0.5">
                          <button
                            type="button"
                            onClick={() => toggle(habit, d)}
                            aria-label={t("member.toggleDayAria", {
                              name: habit.name,
                              day: d,
                              done: on ? t("member.toggleDayDone") : "",
                            })}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md mx-auto flex items-center justify-center transition-all active:scale-90 ${
                              on
                                ? "bg-yellow-400 text-black shadow-sm shadow-yellow-400/30"
                                : d === todayNum
                                  ? "bg-gray-700 ring-1 ring-yellow-400/30"
                                  : "bg-gray-800 hover:bg-gray-700"
                            }`}
                          >
                            {on ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : null}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHabit())}
          placeholder={t("member.newHabitPlaceholder")}
          className="flex-1 bg-black/40 border border-gray-700 rounded-xl px-3 py-3 text-white text-sm min-h-[44px] outline-none focus:border-yellow-400/50"
        />
        <button
          type="button"
          onClick={addHabit}
          className="bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 px-5 py-3 rounded-xl min-h-[44px] flex items-center justify-center gap-2 font-bold text-sm sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          {t("member.addHabit")}
        </button>
      </div>

      <MentalMoodLive variant="habits" />

      <section className="rounded-xl border border-blue-400/20 bg-blue-950/25 p-4 sm:p-5">
        <h4 className="text-white font-black text-sm mb-1">{t("member.mentalTitle")}</h4>
        <p className="text-gray-500 text-xs mb-4 leading-relaxed">
          {t("member.mentalHint", { day: todayNum })}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {mentalMetrics.map((m) => {
            const val = mental[`${todayNum}:${m.id}`] ?? 5;
            return (
              <div key={m.id} className="bg-black/40 rounded-xl p-4 border border-gray-800/90">
                <p className="text-gray-200 text-xs font-bold mb-3">
                  {m.icon} {m.label}
                </p>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={val}
                  onChange={(e) => setMental(m.id, Number(e.target.value))}
                  onPointerUp={(e) => setMental(m.id, Number(e.target.value), true)}
                  className="w-full accent-yellow-400 h-2"
                  aria-valuemin={1}
                  aria-valuemax={10}
                  aria-valuenow={val}
                  aria-label={m.label}
                />
                <p className="text-yellow-400 font-black text-center text-base mt-2">{val}/10</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
