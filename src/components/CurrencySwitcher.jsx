import { Banknote, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/lib/LocaleContext";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import AnchoredDropdownMenu from "@/components/ui/AnchoredDropdownMenu";
import { useAnchoredDropdown } from "@/hooks/useAnchoredDropdown";

export default function CurrencySwitcher({ className = "" }) {
  const { t } = useTranslation();
  const { currency, changeCurrency } = useLocale();
  const { anchorRef, menuRef, open, toggle, close, pos } = useAnchoredDropdown();

  return (
    <div className={`relative ${className}`} ref={anchorRef}>
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1 rounded-lg border border-yellow-400/25 bg-white/5 px-2 py-1.5 text-xs font-bold text-gray-200 hover:border-yellow-400/50 hover:text-white transition-colors min-w-[2.75rem] justify-center"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("currency.label")}
      >
        <Banknote className="w-3.5 h-3.5 text-yellow-400" />
        <span>{currency}</span>
      </button>
      <AnchoredDropdownMenu
        open={open}
        menuRef={menuRef}
        pos={pos}
        listboxLabel={t("currency.label")}
        className="min-w-[10rem]"
      >
        {SUPPORTED_CURRENCIES.map((code) => (
          <li key={code}>
            <button
              type="button"
              role="option"
              aria-selected={code === currency}
              onClick={() => {
                changeCurrency(code);
                close();
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-sm text-gray-200 hover:bg-yellow-400/15 hover:text-white text-start"
            >
              <span>
                <span className="font-bold">{code}</span>
                <span className="text-gray-500 text-xs ms-2">{t(`currency.names.${code}`)}</span>
              </span>
              {code === currency && <Check className="w-4 h-4 text-yellow-400 shrink-0" />}
            </button>
          </li>
        ))}
      </AnchoredDropdownMenu>
    </div>
  );
}
