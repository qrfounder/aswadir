import { useMemo, useState } from "react";
import { PACK_META } from "@/lib/tracker-catalog";
import DailyHabitsPanel from "@/components/member/DailyHabitsPanel";
import TaskWeeklyBoard from "@/components/member/TaskWeeklyBoard";

export default function MemberTrackerHub({ userId, hasHabit, hasTask, hasBundle }) {
  const tabs = useMemo(() => {
    const list = [];
    if (hasHabit) list.push({ id: "habit", ...PACK_META.habit });
    if (hasTask) list.push({ id: "task", ...PACK_META.task });
    return list;
  }, [hasHabit, hasTask]);

  const [active, setActive] = useState(tabs[0]?.id || "habit");

  if (!tabs.length) {
    return (
      <p className="text-gray-500 text-sm text-center py-8">
        لا يوجد نظام مفعّل بعد. أكمل الشراء من الصفحة الرئيسية.
      </p>
    );
  }

  return (
    <section className="dark-card rounded-2xl border border-yellow-400/15 overflow-hidden">
      <div className="px-4 pt-4 pb-2 border-b border-gray-800/80 bg-black/30">
        <p className="text-gray-400 text-xs mb-3">
          {hasBundle
            ? "✦ الباقة الكاملة — لوحة موحّدة بنفس هيكل Google Sheets"
            : "أنظمتك المفعّلة — تبديل بين المتتبعات"}
        </p>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-colors ${
                active === tab.id
                  ? tab.id === "task"
                    ? "bg-emerald-400/20 text-emerald-200 border border-emerald-400/40"
                    : "bg-yellow-400/20 text-yellow-200 border border-yellow-400/40"
                  : "text-gray-500 border border-transparent hover:border-gray-700"
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-5">
        {active === "habit" && hasHabit && <DailyHabitsPanel userId={userId} />}
        {active === "task" && hasTask && <TaskWeeklyBoard userId={userId} />}
      </div>
    </section>
  );
}
