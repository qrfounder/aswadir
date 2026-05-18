import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import BrandLogo from "@/components/BrandLogo";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function SiteHeader({ className = "", embedded = false }) {
  const { t } = useTranslation();

  return (
    <header
      className={`bg-black/60 backdrop-blur-md border-b border-yellow-400/10 py-2.5 sm:py-4 px-3 sm:px-4 w-full overflow-x-hidden ${
        embedded ? "" : "sticky top-0 z-40"
      } ${className}`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3 min-w-0">
        <Link
          to="/"
          className="flex items-center min-w-0 flex-1 group focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-lg"
        >
          <BrandLogo
            size="header"
            className="group-hover:opacity-90 transition-opacity max-w-[min(42vw,9.5rem)] sm:max-w-[280px]"
          />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <CurrencySwitcher />
          <LanguageSwitcher compact />
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-1.5 text-gray-400 hover:text-yellow-400 text-xs sm:text-sm font-bold p-2 sm:px-2 sm:py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            aria-label={t("nav.memberLogin")}
            title={t("nav.memberLogin")}
          >
            <LogIn className="w-4 h-4 shrink-0 sm:hidden" aria-hidden />
            <span className="hidden sm:inline whitespace-nowrap">{t("nav.memberLogin")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
