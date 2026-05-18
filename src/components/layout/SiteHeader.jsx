import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BrandLogo from "@/components/BrandLogo";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function SiteHeader({ className = "" }) {
  const { t } = useTranslation();

  return (
    <header
      className={`bg-black/60 backdrop-blur-md border-b border-yellow-400/10 py-3 sm:py-4 px-4 sticky top-0 z-40 ${className}`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-3 min-w-0">
        <Link
          to="/"
          className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-lg shrink-0 min-w-0"
        >
          <BrandLogo size="header" className="group-hover:opacity-90 transition-opacity" />
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 flex-nowrap">
          <CurrencySwitcher />
          <LanguageSwitcher />
          <Link
            to="/login"
            className="text-gray-400 hover:text-yellow-400 text-xs sm:text-sm font-bold px-2 py-1.5 sm:py-2 whitespace-nowrap"
          >
            {t("nav.memberLogin")}
          </Link>
        </div>
      </div>
    </header>
  );
}
