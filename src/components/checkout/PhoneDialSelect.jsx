import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { flagEmoji, getDialCountry, getDialOptions } from "@/lib/phoneDialCodes";

/**
 * @param {{ value: string; onChange: (iso: string) => void; className?: string }} props
 */
export default function PhoneDialSelect({ value, onChange, className = "" }) {
  const { i18n, t } = useTranslation();
  const locale = i18n.language?.split("-")[0] || "en";

  const { popular, all } = useMemo(() => getDialOptions(locale), [locale]);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={t("checkout.phoneDialLabel")}
      className={`checkout-field bg-black/40 border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-2.5 sm:px-3 text-white outline-none transition-colors w-full sm:w-auto sm:max-w-[11rem] sm:shrink-0 ${className}`}
    >
      <optgroup label={t("checkout.phonePopularCountries")}>
        {popular.map((c) => (
          <option key={`p-${c.iso}`} value={c.iso}>
            {c.flag} {c.dial}
          </option>
        ))}
      </optgroup>
      <optgroup label={t("checkout.phoneAllCountries")}>
        {all.map((c) => (
          <option key={c.iso} value={c.iso}>
            {c.flag} {c.dial} {c.label}
          </option>
        ))}
      </optgroup>
    </select>
  );
}

/** @param {string} iso */
export function formatDialPrefix(iso) {
  const c = getDialCountry(iso);
  return `${flagEmoji(iso)} ${c.dial}`;
}
