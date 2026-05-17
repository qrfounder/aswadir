import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BrandLogo from "@/components/BrandLogo";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function SiteHeader({ rightSlot = null, className = "" }) {
  const { t } = useTranslation();

  return (
    <header
      className={`bg-black/60 backdrop-blur-md border-b border-yellow-400/10 py-4 px-4 sticky top-0 z-40 ${className}`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <Link
          to="/"
          className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-lg shrink-0"
        >
          <BrandLogo size="header" className="group-hover:opacity-90 transition-opacity" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          <CurrencySwitcher />
          <LanguageSwitcher />
          <Link
            to="/login"
            className="text-gray-400 hover:text-yellow-400 text-sm font-bold px-2 py-2 hidden sm:inline"
          >
            {t("nav.memberLogin")}
          </Link>
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
