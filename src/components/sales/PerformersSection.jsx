import { useTranslation } from "react-i18next";

export default function PerformersSection() {
  const { t } = useTranslation();
  const pillars = t("performers.pillars", { returnObjects: true });

  return (
    <div className="space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-yellow-400/80 text-sm font-bold mb-2">🏆 {t("performers.eyebrow")}</p>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
          {t("performers.title")} <span className="gold-gradient">{t("performers.titleHighlight")}</span>
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed">{t("performers.subtitle")}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {Array.isArray(pillars) &&
          pillars.map((item) => (
            <div key={item.title} className="dark-card rounded-2xl p-6 flex gap-4">
              <span className="text-3xl flex-shrink-0" role="img" aria-hidden>
                {item.emoji || "✨"}
              </span>
              <div>
                <h3 className="text-white font-black text-base mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
