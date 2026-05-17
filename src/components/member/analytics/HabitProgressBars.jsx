import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

/** RTL-friendly habit rows — avoids Recharts label/bar overlap on Arabic */
export default function HabitProgressBars({ habits }) {
  const { t } = useTranslation();

  if (!habits?.length) {
    return <p className="text-gray-500 text-sm text-center py-6">{t("member.analytics.noHabitsYet")}</p>;
  }

  return (
    <ul className="space-y-3">
      {habits.map((h, i) => (
        <li key={h.id} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 items-center">
          <div className="flex items-center gap-2 min-w-0 order-1">
            <span className="text-base flex-shrink-0" aria-hidden>
              {h.icon}
            </span>
            <span className="text-gray-200 text-xs sm:text-sm font-medium leading-snug text-start truncate">
              {h.name}
            </span>
          </div>
          <span className="text-yellow-300 text-xs font-black tabular-nums order-2 flex-shrink-0">
            {h.pct}%
          </span>
          <div className="col-span-2 order-3 h-2.5 rounded-full bg-gray-800/90 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-e from-amber-500 to-yellow-400"
              initial={{ width: 0 }}
              animate={{ width: `${h.pct}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 18, delay: i * 0.03 }}
              style={{ marginInlineStart: "auto" }}
            />
          </div>
          {h.streak > 0 && (
            <p className="col-span-2 order-4 text-[10px] text-gray-500 text-start">
              🔥 {t("member.analytics.streakDays", { count: h.streak })}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
