import { Flame, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import CountdownTimer from "./CountdownTimer";

export default function UrgencyBar({ embedded = false }) {
  const { t } = useTranslation();

  return (
    <div
      className={`bg-gradient-to-r from-red-900 via-red-800 to-red-900 py-1.5 sm:py-2 px-2 sm:px-4 text-center border-b border-red-700/50 overflow-hidden ${
        embedded ? "" : "sticky top-0 z-50"
      }`}
    >
      <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3 flex-nowrap mx-auto w-full max-w-6xl min-w-0">
        <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 animate-pulse shrink-0" aria-hidden />
        <span className="text-white text-[11px] sm:text-sm font-bold whitespace-nowrap shrink-0 max-[360px]:truncate max-[360px]:max-w-[5.5rem] sm:max-w-none">
          {t("urgency.bar")}
        </span>
        <CountdownTimer initialMinutes={47} initialSeconds={0} compact />
        <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-200 shrink-0 hidden min-[400px]:block" aria-hidden />
        <span className="text-brand text-[11px] sm:text-sm font-black whitespace-nowrap shrink-0">
          {t("urgency.discount")}
        </span>
      </div>
    </div>
  );
}
