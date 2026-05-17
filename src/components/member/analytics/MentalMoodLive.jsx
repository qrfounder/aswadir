import { motion } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import { useTracker } from "@/lib/TrackerContext";

/** Compact mood summary — links mental sliders to overview metrics */
export default function MentalMoodLive({ variant = "overview" }) {
  const { t } = useTranslation();
  const { analytics } = useTracker();
  const breakdown = analytics.habit?.mentalBreakdown;
  const score = analytics.habit?.mentalToday;

  if (!breakdown?.length) return null;

  if (variant === "habits") {
    return (
      <div className="rounded-xl border border-sky-400/25 bg-sky-950/20 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sky-200/90 text-xs font-bold">{t("member.analytics.mentalToday")}</p>
          <p className="text-gray-500 text-[11px] mt-0.5">{t("member.analytics.mentalLiveHint")}</p>
        </div>
        <p className="text-2xl font-black text-sky-300 tabular-nums">
          {score != null ? `${score}%` : "—"}
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-sky-400/20 bg-sky-950/15 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h4 className="text-white font-black text-sm">🧠 {t("member.analytics.mentalTitle")}</h4>
        <span className="text-sky-300 font-black text-lg tabular-nums">
          {score != null ? `${score}%` : t("member.analytics.mentalNotRecorded")}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {breakdown.map((m) => (
          <div key={m.id} className="rounded-lg bg-black/35 border border-gray-800/80 px-3 py-2">
            <div className="flex justify-between items-center gap-2 text-xs mb-1.5">
              <span className="text-gray-300">
                {m.icon} {m.label}
              </span>
              <span className="text-sky-300 font-bold tabular-nums">
                {m.value != null ? `${m.value}/10` : "—"}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-e from-sky-400 to-cyan-400"
                initial={false}
                animate={{ width: `${m.pct ?? 0}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                style={{ marginInlineStart: "auto", opacity: m.pct != null ? 1 : 0.25 }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-gray-500 text-[11px] mt-3 text-center">
        <Trans
          i18nKey="member.analytics.mentalEditHint"
          components={{
            1: <strong className="text-yellow-400/90" />,
          }}
        />
      </p>
    </section>
  );
}
