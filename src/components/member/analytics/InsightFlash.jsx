import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTracker } from "@/lib/TrackerContext";

export default function InsightFlash() {
  const { t } = useTranslation();
  const { insight, dismissInsight } = useTracker();

  return (
    <AnimatePresence mode="wait">
      {insight && (
        <motion.div
          key={insight.id}
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.99 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="relative overflow-hidden rounded-xl border border-brand/35 bg-gradient-to-e from-brand/15 via-[#0a0e14] to-black/95 p-3.5 sm:p-4 shadow-md shadow-primary/5"
          role="status"
          aria-live="polite"
        >
          <div
            className="absolute -top-6 -start-6 w-20 h-20 rounded-full bg-brand/10 blur-2xl pointer-events-none"
            aria-hidden
          />
          <div className="relative flex items-start gap-3">
            <span className="text-2xl sm:text-3xl leading-none flex-shrink-0" aria-hidden>
              {insight.emoji}
            </span>
            <div className="flex-1 min-w-0 pe-1">
              <p className="text-brand font-black text-sm leading-snug">{insight.title}</p>
              <p className="text-gray-300 text-xs sm:text-sm mt-1 leading-relaxed text-pretty">
                {insight.body}
              </p>
            </div>
            <button
              type="button"
              onClick={dismissInsight}
              className="text-gray-500 hover:text-white p-2 -m-1 flex-shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-white/5"
              aria-label={t("member.insight.dismiss")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
