import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Brain,
  CheckCircle2,
  Circle,
  Flame,
  ListTodo,
  PiggyBank,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";
import { usePricing } from "@/lib/usePricing";
import {
  incrementPomodoroSession,
  loadProductivityHub,
  pomodoroSessionsToday,
  saveProductivityHub,
} from "@/lib/productivity-hub-storage";

const WORK_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;

function TabBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all min-h-[44px] snap-start ${
        active
          ? "bg-brand/15 text-brand border border-brand/40"
          : "text-gray-400 border border-gray-800 bg-black/30 hover:border-gray-600"
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" aria-hidden />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

export default function MemberProductivitySuite({ userId }) {
  const { t } = useTranslation();
  const { format } = usePricing();
  const [tab, setTab] = useState("today");
  const [data, setData] = useState(() => loadProductivityHub(userId));
  const [todoDraft, setTodoDraft] = useState("");
  const initialHub = loadProductivityHub(userId);
  const [pomLeft, setPomLeft] = useState(() => initialHub.pomodoroSecondsLeft ?? WORK_SEC);
  const [pomRunning, setPomRunning] = useState(() => Boolean(initialHub.pomodoroRunning));
  const [pomMode, setPomMode] = useState(() => initialHub.pomodoroMode || "work");
  const pomModeRef = useRef("work");
  const [sessionsToday, setSessionsToday] = useState(() => pomodoroSessionsToday(userId));

  useEffect(() => {
    pomModeRef.current = pomMode;
  }, [pomMode]);

  const persist = useCallback(
    (next) => {
      saveProductivityHub(userId, next);
      setData(next);
    },
    [userId],
  );

  useEffect(() => {
    const hub = loadProductivityHub(userId);
    setData(hub);
    setPomLeft(hub.pomodoroSecondsLeft ?? WORK_SEC);
    setPomRunning(Boolean(hub.pomodoroRunning));
    const mode = hub.pomodoroMode === "break" ? "break" : "work";
    setPomMode(mode);
    pomModeRef.current = mode;
    setSessionsToday(pomodoroSessionsToday(userId));
  }, [userId]);

  useEffect(() => {
    const id = setTimeout(() => {
      setData((prev) => {
        const next = {
          ...prev,
          pomodoroSecondsLeft: pomLeft,
          pomodoroRunning: pomRunning,
          pomodoroMode: pomMode,
        };
        saveProductivityHub(userId, next);
        return next;
      });
    }, 500);
    return () => clearTimeout(id);
  }, [pomLeft, pomRunning, pomMode, userId]);

  useEffect(() => {
    if (!pomRunning) return undefined;
    const id = setInterval(() => {
      setPomLeft((s) => {
        if (s <= 1) {
          setPomRunning(false);
          const mode = pomModeRef.current;
          if (mode === "work") {
            incrementPomodoroSession(userId);
            setSessionsToday((c) => c + 1);
            setPomMode("break");
            pomModeRef.current = "break";
            return BREAK_SEC;
          }
          setPomMode("work");
          pomModeRef.current = "work";
          return WORK_SEC;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [pomRunning, userId]);

  const chips = useMemo(() => {
    const raw = t("member.productivity.chips", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const pctMoney = useMemo(() => {
    const g = Number(data.money.goal) || 0;
    const s = Number(data.money.saved) || 0;
    if (g <= 0) return 0;
    return Math.min(100, Math.round((s / g) * 100));
  }, [data.money]);

  const addTodo = () => {
    const text = todoDraft.trim();
    if (!text) return;
    const id = `td_${Date.now()}`;
    persist({
      ...data,
      todos: [{ id, text, done: false }, ...data.todos].slice(0, 24),
    });
    setTodoDraft("");
  };

  const toggleTodo = (id) => {
    persist({
      ...data,
      todos: data.todos.map((x) => (x.id === id ? { ...x, done: !x.done } : x)),
    });
  };

  const removeTodo = (id) => {
    persist({ ...data, todos: data.todos.filter((x) => x.id !== id) });
  };

  const fmtClock = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <section
      className="dark-card rounded-2xl border border-success/15 overflow-hidden"
      aria-label={t("member.productivity.aria")}
    >
      <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-gray-800/80 bg-black/40 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="w-5 h-5 text-success flex-shrink-0" aria-hidden />
          <div>
            <p className="text-success/90 text-xs font-black">{t("member.productivity.kicker")}</p>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{t("member.productivity.lead")}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span
              key={c}
              className="text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded-lg bg-success/10 text-success/90/90 border border-success/20"
            >
              {c}
            </span>
          ))}
        </div>
        <div className="member-tabs-scroll flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory" role="tablist">
          <TabBtn active={tab === "today"} onClick={() => setTab("today")} icon={ListTodo} label={t("member.productivity.tabToday")} />
          <TabBtn active={tab === "wealth"} onClick={() => setTab("wealth")} icon={PiggyBank} label={t("member.productivity.tabWealth")} />
          <TabBtn active={tab === "focus"} onClick={() => setTab("focus")} icon={Timer} label={t("member.productivity.tabFocus")} />
          <TabBtn active={tab === "reflect"} onClick={() => setTab("reflect")} icon={Brain} label={t("member.productivity.tabReflect")} />
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6" role="tabpanel">
        {tab === "today" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                value={todoDraft}
                onChange={(e) => setTodoDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTodo())}
                placeholder={t("member.productivity.todoPlaceholder")}
                className="flex-1 bg-black/40 border border-gray-700 rounded-xl px-3 py-3 text-white text-sm min-h-[44px] outline-none focus:border-success/50"
              />
              <button
                type="button"
                onClick={addTodo}
                className="bg-success/15 border border-success/40 text-success/90 px-4 rounded-xl font-black text-sm min-h-[44px]"
              >
                {t("member.productivity.add")}
              </button>
            </div>
            <ul className="space-y-2">
              {data.todos.length === 0 ? (
                <li className="text-gray-500 text-sm">{t("member.productivity.todoEmpty")}</li>
              ) : (
                data.todos.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 bg-black/35 border border-gray-800/80 rounded-xl px-3 py-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => toggleTodo(item.id)}
                      className="mt-0.5 text-success"
                      aria-label={item.done ? t("member.productivity.markOpen") : t("member.productivity.markDone")}
                    >
                      {item.done ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 text-gray-500" />}
                    </button>
                    <span className={`flex-1 text-sm leading-relaxed ${item.done ? "line-through text-gray-500" : "text-gray-100"}`}>
                      {item.text}
                    </span>
                    <button type="button" onClick={() => removeTodo(item.id)} className="text-xs text-gray-600 hover:text-red-400 font-bold">
                      {t("member.productivity.remove")}
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="rounded-xl border border-gray-800/80 bg-black/25 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" aria-hidden />
                <p className="text-white font-black text-sm">{t("member.productivity.okrTitle")}</p>
              </div>
              <div className="space-y-3">
                {data.goals.map((g, idx) => (
                  <div key={g.id || `goal-${idx}`}>
                    <input
                      value={g.title}
                      onChange={(e) => {
                        const goals = data.goals.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x));
                        persist({ ...data, goals });
                      }}
                      placeholder={t("member.productivity.okrPlaceholder", { n: idx + 1 })}
                      className="w-full bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs mb-1.5 outline-none focus:border-primary/40"
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={g.progress}
                      onChange={(e) => {
                        const goals = data.goals.map((x, i) =>
                          i === idx ? { ...x, progress: Number(e.target.value) } : x,
                        );
                        persist({ ...data, goals });
                      }}
                      className="w-full accent-primary h-1.5"
                    />
                    <p className="text-brand/80 text-[11px] font-bold text-end">{g.progress}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "wealth" && (
          <div className="space-y-4">
            <p className="text-gray-400 text-xs leading-relaxed">{t("member.productivity.wealthHint")}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-gray-500 text-[11px] font-bold">{t("member.productivity.goalLabel")}</span>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={data.money.goal || ""}
                  onChange={(e) =>
                    persist({ ...data, money: { ...data.money, goal: Number(e.target.value) || 0 } })
                  }
                  className="w-full bg-black/40 border border-gray-700 rounded-xl px-3 py-3 text-white text-sm outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-gray-500 text-[11px] font-bold">{t("member.productivity.savedLabel")}</span>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={data.money.saved || ""}
                  onChange={(e) =>
                    persist({ ...data, money: { ...data.money, saved: Number(e.target.value) || 0 } })
                  }
                  className="w-full bg-black/40 border border-gray-700 rounded-xl px-3 py-3 text-white text-sm outline-none"
                />
              </label>
            </div>
            <div className="rounded-xl border border-success/25 bg-success/15 p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-success/90 text-xs font-bold">{t("member.productivity.progress")}</span>
                <span className="text-success font-black">{pctMoney}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-success to-info transition-all" style={{ width: `${pctMoney}%` }} />
              </div>
              <p className="text-gray-500 text-[11px] mt-2">{t("member.productivity.wealthFoot", { saved: format(data.money.saved || 0) })}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[10, 25, 50, 100].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() =>
                    persist({
                      ...data,
                      money: { ...data.money, saved: (Number(data.money.saved) || 0) + n },
                    })
                  }
                  className="px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-success/90 text-xs font-black hover:border-success/40"
                >
                  +{format(n)}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "focus" && (
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center gap-2 text-amber-300/90 text-xs font-bold">
              <Flame className="w-4 h-4" aria-hidden />
              {t("member.productivity.pomSessions", { count: sessionsToday })}
            </div>
            <p className="text-4xl sm:text-5xl font-black text-white tabular-nums tracking-tight">{fmtClock(pomLeft)}</p>
            <p className="text-gray-500 text-xs">
              {pomMode === "work" ? t("member.productivity.pomWork") : t("member.productivity.pomBreak")}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setPomRunning((r) => !r)}
                className="cta-button px-8 py-3 rounded-xl font-black text-sm"
              >
                {pomRunning ? t("member.productivity.pomPause") : t("member.productivity.pomStart")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPomRunning(false);
                  setPomMode("work");
                  setPomLeft(WORK_SEC);
                }}
                className="px-6 py-3 rounded-xl border border-gray-600 text-gray-300 text-sm font-bold hover:bg-gray-800/80"
              >
                {t("member.productivity.pomReset")}
              </button>
            </div>
            <p className="text-gray-600 text-[11px] max-w-md mx-auto leading-relaxed">{t("member.productivity.pomHint")}</p>
          </div>
        )}

        {tab === "reflect" && (
          <div className="space-y-5">
            <div>
              <p className="text-white font-black text-sm mb-2">{t("member.productivity.gratitudeTitle")}</p>
              <div className="space-y-2">
                {data.gratitude.map((line, i) => (
                  <input
                    key={i}
                    value={line}
                    onChange={(e) => {
                      const gratitude = [...data.gratitude];
                      gratitude[i] = e.target.value;
                      persist({ ...data, gratitude });
                    }}
                    placeholder={t("member.productivity.gratitudeLine", { n: i + 1 })}
                    className="w-full bg-black/40 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-primary/40"
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-white font-black text-sm mb-2">{t("member.productivity.reviewTitle")}</p>
              <textarea
                value={data.weeklyReview}
                onChange={(e) => persist({ ...data, weeklyReview: e.target.value })}
                rows={5}
                placeholder={t("member.productivity.reviewPlaceholder")}
                className="w-full bg-black/40 border border-gray-700 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-primary/40 resize-y min-h-[120px]"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
