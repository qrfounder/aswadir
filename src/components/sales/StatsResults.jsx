import { BarChart3, Flame, Target, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

const STAT_ICONS = [Target, Flame, TrendingUp];

export default function StatsResults() {
  const { t } = useTranslation();
  const items = t("stats.items", { returnObjects: true });

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-brand/80 text-sm font-bold mb-2 inline-flex items-center justify-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" aria-hidden />
          {t("stats.eyebrow")}
        </p>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
          {t("stats.title")} <span className="gold-gradient">{t("stats.titleHighlight")}</span>{" "}
          {t("stats.titleEnd")}
        </h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">{t("stats.subtitle")}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {Array.isArray(items) &&
          items.map((stat, i) => {
            const Icon = STAT_ICONS[i] ?? BarChart3;
            return (
              <div
                key={stat.value}
                className="dark-card rounded-2xl p-6 text-center border border-brand/10 hover:border-primary/30 transition-colors"
              >
                <div
                  className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4"
                  aria-hidden
                >
                  <Icon className="w-7 h-7 text-primary" strokeWidth={2} />
                </div>
                <p className="text-4xl md:text-5xl font-black gold-gradient mb-3">{stat.value}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{stat.label}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
}
