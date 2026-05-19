import { motion } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import { useTracker } from "@/lib/TrackerContext";
import { useTrackerCatalog } from "@/lib/useTrackerCatalog";

/** Compact mood summary — links mental sliders to overview metrics */
export default function MentalMoodLive({ variant = "overview" }) {
  const { t } = useTranslation();
  const { mentalMetrics } = useTrackerCatalog();
  const { analytics } = useTracker();
  const breakdown = analytics.habit?.mentalBreakdown;
  const score = analytics.habit?.mentalToday;

  if (!breakdown?.length) return null;

  if (variant === "habits") {
    return (
      <div className="rounded-xl border border-info/25 bg-info/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-info text-xs font-bold">{t("member.analytics.mentalToday")}</p>
          <p className="text-muted-foreground text-[11px] mt-0.5">{t("member.analytics.mentalLiveHint")}</p>
        </div>
        <p className="text-2xl font-black text-info tabular-nums">
          {score != null ? `${score}%` : "—"}
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-info/20 bg-info/5 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h4 className="text-foreground font-black text-sm">🧠 {t("member.analytics.mentalTitle")}</h4>
        <span className="text-info font-black text-lg tabular-nums">
          {score != null ? `${score}%` : t("member.analytics.mentalNotRecorded")}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {breakdown.map((m) => (
          <div key={m.id} className="rounded-lg bg-muted border border-border px-3 py-2">
            <div className="flex justify-between items-center gap-2 text-xs mb-1.5">
              <span className="text-foreground/85">
                {mentalMetrics.find((x) => x.id === m.id)?.icon}{" "}
                {mentalMetrics.find((x) => x.id === m.id)?.label}
              </span>
              <span className="text-info font-bold tabular-nums">
                {m.value != null ? `${m.value}/10` : "—"}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-border overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-e from-info to-primary"
                initial={false}
                animate={{ width: `${m.pct ?? 0}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                style={{ marginInlineStart: "auto", opacity: m.pct != null ? 1 : 0.25 }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground text-[11px] mt-3 text-center">
        <Trans
          i18nKey="member.analytics.mentalEditHint"
          components={{
            1: <strong className="text-primary/90" />,
          }}
        />
      </p>
    </section>
  );
}
