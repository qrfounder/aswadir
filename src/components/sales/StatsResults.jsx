import { useTranslation } from "react-i18next";

const EMOJIS = ["🎯", "🔥", "📈"];

export default function StatsResults() {
  const { t } = useTranslation();
  const items = t("stats.items", { returnObjects: true });

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-yellow-400/80 text-sm font-bold mb-2">📊 {t("stats.eyebrow")}</p>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
          {t("stats.title")} <span className="gold-gradient">{t("stats.titleHighlight")}</span>{" "}
          {t("stats.titleEnd")}
        </h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">{t("stats.subtitle")}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {Array.isArray(items) &&
          items.map((stat, i) => (
            <div
              key={stat.value}
              className="dark-card rounded-2xl p-6 text-center border border-yellow-400/10 hover:border-yellow-400/30 transition-colors"
            >
              <span className="text-4xl mb-3 block" role="img" aria-hidden>
                {EMOJIS[i] ?? "📊"}
              </span>
              <p className="text-4xl md:text-5xl font-black gold-gradient mb-3">{stat.value}</p>
              <p className="text-gray-300 text-sm leading-relaxed">{stat.label}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
