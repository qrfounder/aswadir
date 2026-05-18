import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/lib/LocaleContext";
import { LOCALE_META, SUPPORTED_LOCALES } from "@/i18n/constants";

export default function LanguageSwitcher({ className = "", compact = false }) {
  const { t } = useTranslation();
  const { locale, changeLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 rounded-lg border border-yellow-400/25 bg-white/5 text-xs font-bold text-gray-200 hover:border-yellow-400/50 hover:text-white transition-colors ${
          compact ? "px-2 py-1.5 min-w-[2.75rem] justify-center" : "gap-1.5 px-2.5 py-1.5"
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("lang.label")}
      >
        <Globe className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
        {compact ? (
          <>
            <span className="uppercase tabular-nums sm:hidden">{locale}</span>
            <span className="hidden sm:inline">{LOCALE_META[locale]?.native || locale}</span>
          </>
        ) : (
          <span>{LOCALE_META[locale]?.native || locale}</span>
        )}
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute top-full mt-1 end-0 z-[60] min-w-[9rem] rounded-xl border border-yellow-400/20 bg-[#0f1424] py-1 shadow-xl"
        >
          {SUPPORTED_LOCALES.map((code) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={code === locale}
                onClick={() => {
                  changeLocale(code);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-yellow-400/10 hover:text-white text-start"
              >
                <span>{t(`lang.${code}`)}</span>
                {code === locale && <Check className="w-4 h-4 text-yellow-400 shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
