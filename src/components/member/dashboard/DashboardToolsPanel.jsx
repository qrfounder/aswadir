import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import MemberProductivitySuite from "@/components/member/MemberProductivitySuite";

export default function DashboardToolsPanel({ userId }) {
  const { t } = useTranslation();

  if (!userId) return null;

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 text-success/90 text-xs font-bold">
          <Sparkles className="w-4 h-4" aria-hidden />
          {t("dashboard.nav.toolsKicker")}
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
          {t("dashboard.nav.toolsTitle")}
        </h1>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-2xl">
          {t("dashboard.nav.toolsLead")}
        </p>
      </header>

      <MemberProductivitySuite userId={userId} />
    </div>
  );
}
