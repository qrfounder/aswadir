import { useTranslation } from "react-i18next";

export default function ResearchSection() {
  const { t } = useTranslation();

  return (
    <div className="dark-card rounded-2xl p-8 md:p-10 space-y-6">
      <div className="text-center space-y-3">
        <p className="text-brand/80 text-sm font-bold">🔬 {t("research.eyebrow")}</p>
        <h2 className="text-2xl md:text-3xl font-black text-white">
          {t("research.title")} <span className="gold-gradient">{t("research.titleHighlight")}</span>
        </h2>
      </div>
      <div className="space-y-4 text-gray-300 text-sm md:text-base leading-relaxed max-w-3xl mx-auto">
        <p>{t("research.p1")}</p>
        <p>{t("research.p2")}</p>
        <p className="text-brand/90/90 font-medium text-center pt-2">{t("research.p3")}</p>
      </div>
    </div>
  );
}
