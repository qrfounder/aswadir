import { Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/lib/LocaleContext";
import { LOCALE_META, SUPPORTED_LOCALES } from "@/i18n/constants";
import AnchoredDropdownMenu from "@/components/ui/AnchoredDropdownMenu";
import { useAnchoredDropdown } from "@/hooks/useAnchoredDropdown";

export default function LanguageSwitcher({ className = "", compact = false }) {
  const { t } = useTranslation();
  const { locale, changeLocale } = useLocale();
  const { anchorRef, menuRef, open, toggle, close, pos } = useAnchoredDropdown();

  return (
    <div className={`relative ${className}`} ref={anchorRef}>
      <button
        type="button"
        onClick={toggle}
        className={`flex items-center gap-1 rounded-lg border border-brand/25 bg-white/5 text-xs font-bold text-gray-200 hover:border-primary/40/50 hover:text-white transition-colors ${
          compact ? "px-2 py-1.5 min-w-[2.75rem] justify-center" : "gap-1.5 px-2.5 py-1.5"
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("lang.label")}
      >
        <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
        {compact ? (
          <>
            <span className="uppercase tabular-nums sm:hidden">{locale}</span>
            <span className="hidden sm:inline">{LOCALE_META[locale]?.native || locale}</span>
          </>
        ) : (
          <span>{LOCALE_META[locale]?.native || locale}</span>
        )}
      </button>
      <AnchoredDropdownMenu
        open={open}
        menuRef={menuRef}
        pos={pos}
        listboxLabel={t("lang.label")}
        className="min-w-[9rem]"
      >
        {SUPPORTED_LOCALES.map((code) => (
          <li key={code}>
            <button
              type="button"
              role="option"
              aria-selected={code === locale}
              onClick={() => {
                changeLocale(code);
                close();
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-sm text-gray-200 hover:bg-primary/90/15 hover:text-white text-start"
            >
              <span>{t(`lang.${code}`)}</span>
              {code === locale && <Check className="w-4 h-4 text-primary shrink-0" />}
            </button>
          </li>
        ))}
      </AnchoredDropdownMenu>
    </div>
  );
}
