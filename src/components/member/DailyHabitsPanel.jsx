import { useMemo, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { DEFAULT_HABITS, MENTAL_METRICS, daysInMonth, monthLabelAr } from "@/lib/tracker-catalog";
import { habitCompletionRate, habitDayRate, loadHabitTracker, saveHabitTracker } from "@/lib/tracker-storage";

export default function DailyHabitsPanel({ userId }) {
  const today = new Date();
  const dayCount = daysInMonth(today);
  const todayNum = today.getDate();
  const [{ month, data }, setState] = useState(() => loadHabitTracker(userId));
  const monthData = data.months[month] || { checks: {}, mental: {} };
  const { checks, mental } = monthData;
  const habits = data.habits?.length ? data.habits : DEFAULT_HABITS;
  const [newHabit, setNewHabit] = useState("");

  const persist = (next) => { saveHabitTracker(userId, next); setState(loadHabitTracker(userId)); };
  const toggle = (hid, d) => {
    const k = d + ":" + hid;
    persist({ ...data, months: { ...data.months, [month]: { ...monthData, checks: { ...checks, [k]: !checks[k] } } } });
  };
  const setMental = (mid, v) => {
    persist({ ...data, months: { ...data.months, [month]: { ...monthData, mental: { ...mental, [todayNum + ":" + mid]: v } } } });
  };
  const addHabit = () => {
    const name = newHabit.trim(); if (!name) return;
    persist({ ...data, habits: [...habits, { id: "c" + Date.now(), icon: "✨", name }] }); setNewHabit("");
  };
  const removeHabit = (hid) => {
    const nc = { ...checks }; for (let d = 1; d <= dayCount; d++) delete nc[d + ":" + hid];
    persist({ ...data, habits: habits.filter(h => h.id !== hid), months: { ...data.months, [month]: { ...monthData, checks: nc } } });
  };
  const monthRate = useMemo(() => habitCompletionRate(habits, checks, dayCount), [habits, checks, dayCount]);
  const todayRate = useMemo(() => habitDayRate(habits, checks, todayNum), [habits, checks, todayNum]);
  const days = useMemo(() => Array.from({ length: dayCount }, (_, i) => i + 1), [dayCount]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-yellow-400/90 text-xs font-bold">🗓️ لوحة العادات · Massar</p>
          <h3 className="text-white font-black text-xl">{monthLabelAr(today)}</h3>
        </div>
        <div className="flex gap-2">
          <div className="rounded-xl bg-black/40 border border-gray-800 px-3 py-2 text-center min-w-[72px]"><p className="text-gray-500 text-[10px] font-bold">اليوم</p><p className="font-black text-lg text-yellow-300">{todayRate}%</p></div>
          <div className="rounded-xl bg-black/40 border border-gray-800 px-3 py-2 text-center min-w-[72px]"><p className="text-gray-500 text-[10px] font-bold">الشهر</p><p className="font-black text-lg text-emerald-300">{monthRate}%</p></div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-yellow-400/20 bg-[#0d1117]/80">
        <table className="w-full min-w-[640px] border-collapse text-xs"><thead><tr className="bg-[#1a2744] text-white"><th className="sticky right-0 z-10 bg-[#1a2744] px-3 py-2 text-right font-black">العادة</th><th className="w-10">📊</th>{days.map((d)=>(<th key={d} className={`w-7 py-2 text-center ${d===todayNum?"bg-yellow-400/25 text-yellow-200":"text-gray-400"}`}>{d}</th>))}</tr></thead><tbody>{habits.map((habit,rowIdx)=>{const doneCount=days.filter((d)=>checks[`${d}:${habit.id}`]).length;const bar=Math.round((doneCount/dayCount)*10);return(<tr key={habit.id} className={rowIdx%2===0?"bg-[#12181f]":"bg-[#0f1419]"}><td className="sticky right-0 z-10 px-2 py-1.5 border-l border-gray-800/80 bg-inherit"><div className="flex items-center gap-1"><span>{habit.icon}</span><span className="text-gray-200 text-xs truncate max-w-[100px]">{habit.name}</span><button type="button" onClick={()=>removeHabit(habit.id)} className="ms-auto text-gray-600 hover:text-red-400"><Trash2 className="w-3 h-3"/></button></div></td><td className="text-center text-orange-300 text-[10px]">{"█".repeat(bar)}</td>{days.map((d)=>{const on=checks[`${d}:${habit.id}`];return(<td key={d} className="p-0.5"><button type="button" onClick={()=>toggle(habit.id,d)} className={`w-6 h-6 rounded-md mx-auto flex items-center justify-center ${on?"bg-yellow-400 text-black":"bg-gray-800"}`}>{on?<Check className="w-3 h-3" strokeWidth={3}/>:null}</button></td>);})}</tr>);})}</tbody></table>
      </div>
      <div className="flex gap-2"><input type="text" value={newHabit} onChange={(e)=>setNewHabit(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&(e.preventDefault(),addHabit())} placeholder="➕ عادة جديدة..." className="flex-1 bg-black/40 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm"/><button type="button" onClick={addHabit} className="bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 px-4 rounded-xl"><Plus className="w-5 h-5"/></button></div>
      <section className="rounded-xl border border-blue-400/20 bg-blue-950/20 p-4"><h4 className="text-white font-black text-sm mb-3">🧠 الحالة الذهنية · اليوم ({todayNum})</h4><div className="grid sm:grid-cols-3 gap-3">{MENTAL_METRICS.map((m)=>{const val=mental[`${todayNum}:${m.id}`]??5;return(<div key={m.id} className="bg-black/30 rounded-lg p-3 border border-gray-800"><p className="text-gray-300 text-xs font-bold mb-2">{m.icon} {m.label}</p><input type="range" min={1} max={10} value={val} onChange={(e)=>setMental(m.id,Number(e.target.value))} className="w-full accent-yellow-400"/><p className="text-yellow-400 font-black text-center text-sm mt-1">{val}/10</p></div>);})}</div></section>
    </div>
  );
}
