import { Flame, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import CountdownTimer from "./CountdownTimer";

export default function UrgencyBar() {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 py-1.5 sm:py-2 px-2 sm:px-4 text-center sticky top-0 z-50 border-b border-red-700/50 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3 flex-nowrap min-w-max mx-auto w-max max-w-full">
        <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 animate-pulse shrink-0" aria-hidden />
        <span className="text-white text-[11px] sm:text-sm font-bold whitespace-nowrap shrink-0">
          {t("urgency.bar")}
        </span>
        <CountdownTimer initialMinutes={47} initialSeconds={0} compact />
        <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-200 shrink-0 hidden min-[400px]:block" aria-hidden />
        <span className="text-yellow-300 text-[11px] sm:text-sm font-black whitespace-nowrap shrink-0">
          {t("urgency.discount")}
        </span>
      </div>
    </div>
  );
}
