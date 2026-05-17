import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { buildInsight, computeFullAnalytics } from "@/lib/tracker-analytics";

const TrackerContext = createContext(null);

export function TrackerProvider({ userId, hasHabit, hasTask, children }) {
  const { t } = useTranslation();
  const [tick, setTick] = useState(0);
  const [insight, setInsight] = useState(null);

  const analytics = useMemo(
    () => computeFullAnalytics(userId, { hasHabit, hasTask }),
    [userId, hasHabit, hasTask, tick],
  );

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const flashInsight = useCallback(
    (payload) => {
      const next = buildInsight(
        { ...payload, analytics: computeFullAnalytics(userId, { hasHabit, hasTask }) },
        t,
      );
      if (next) setInsight({ ...next, id: Date.now() });
      setTick((n) => n + 1);
    },
    [userId, hasHabit, hasTask, t],
  );

  const dismissInsight = useCallback(() => setInsight(null), []);

  useEffect(() => {
    if (!insight) return undefined;
    const t = setTimeout(() => setInsight(null), 4500);
    return () => clearTimeout(t);
  }, [insight]);

  return (
    <TrackerContext.Provider
      value={{ analytics, refresh, flashInsight, insight, dismissInsight, tick }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error("useTracker must be used within TrackerProvider");
  return ctx;
}
