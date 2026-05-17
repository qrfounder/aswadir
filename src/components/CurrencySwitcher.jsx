import { useRef, useState, useEffect } from "react";
import { Banknote, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/lib/LocaleContext";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";

export default function CurrencySwitcher({ className = "" }) {
  const { t } = useTranslation();
  const { currency, changeCurrency } = useLocale();
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
        className="flex items-center gap-1.5 rounded-lg border border-yellow-400/25 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-gray-200 hover:border-yellow-400/50 hover:text-white transition-colors"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("currency.label")}
      >
        <Banknote className="w-3.5 h-3.5 text-yellow-400" />
        <span>{currency}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute top-full mt-1 end-0 z-[60] min-w-[10rem] max-h-[min(18rem,70vh)] overflow-y-auto rounded-xl border border-yellow-400/20 bg-[#0f1424] py-1 shadow-xl"
        >
          {SUPPORTED_CURRENCIES.map((code) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={code === currency}
                onClick={() => {
                  changeCurrency(code);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-yellow-400/10 hover:text-white text-start"
              >
                <span>
                  <span className="font-bold">{code}</span>
                  <span className="text-gray-500 text-xs ms-2">{t(`currency.names.${code}`)}</span>
                </span>
                {code === currency && <Check className="w-4 h-4 text-yellow-400 shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
