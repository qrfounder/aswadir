import { Flame, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import CountdownTimer from "./CountdownTimer";

export default function UrgencyBar() {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 py-2 px-4 text-center sticky top-0 z-50 border-b border-red-700/50">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Flame className="w-4 h-4 text-red-400 animate-pulse" />
        <span className="text-white text-sm font-bold">{t("urgency.bar")}</span>
        <CountdownTimer initialMinutes={47} initialSeconds={0} />
        <Zap className="w-4 h-4 text-red-200" />
        <span className="text-yellow-300 text-sm font-black">{t("urgency.discount")}</span>
      </div>
    </div>
  );
}
