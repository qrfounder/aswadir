import { Check, Minus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

function Cell({ level, titleFull, titlePartial, titleNone }) {
  if (level === "full")
    return (
      <span className="inline-flex justify-center text-success" title={titleFull}>
        <Check className="w-5 h-5" strokeWidth={2.5} />
      </span>
    );
  if (level === "partial")
    return (
      <span className="inline-flex justify-center text-amber-400/90" title={titlePartial}>
        <Minus className="w-5 h-5" strokeWidth={2.5} />
      </span>
    );
  return (
    <span className="inline-flex justify-center text-red-400/70" title={titleNone}>
      <X className="w-5 h-5" strokeWidth={2.5} />
    </span>
  );
}

export default function ComparisonTableSection() {
  const { t } = useTranslation();
  const rows = t("landing.comparisonRows", { returnObjects: true });

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
          {t("landing.comparisonTitle")}
        </h2>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-brand/15 dark-card">
        <table className="w-full min-w-[520px] text-sm border-collapse">
          <thead>
            <tr className="border-b border-brand/15 bg-brand/5">
              <th className="text-start p-4 font-black text-white w-[36%]">Feature</th>
              <th className="p-4 text-center font-black text-brand w-[21%]">{t("landing.comparisonMassar")}</th>
              <th className="p-4 text-center font-bold text-gray-300 w-[21%]">{t("landing.comparisonApps")}</th>
              <th className="p-4 text-center font-bold text-gray-300 w-[22%]">{t("landing.comparisonNotes")}</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(rows) &&
              rows.map((row) => (
                <tr key={row.feature} className="border-b border-brand/10 last:border-0">
                  <td className="p-4 text-gray-200 leading-relaxed align-middle">{row.feature}</td>
                  <td className="p-4 text-center align-middle bg-brand/5">
                    <Cell level={row.massar} titleFull="Full" titlePartial="Partial" titleNone="None" />
                  </td>
                  <td className="p-4 text-center align-middle">
                    <Cell level={row.apps} titleFull="Full" titlePartial="Partial" titleNone="None" />
                  </td>
                  <td className="p-4 text-center align-middle">
                    <Cell level={row.notes} titleFull="Full" titlePartial="Partial" titleNone="None" />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
