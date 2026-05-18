import { Bell } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export default function DashboardNewsPanel({ loading }) {
  const { t, i18n } = useTranslation();
  const updates = useMemo(() => {
    const items = t("dashboard.updateItems", { returnObjects: true });
    return Array.isArray(items) ? items : [];
  }, [t, i18n.language]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 text-yellow-400/90 text-xs font-bold">
          <Bell className="w-4 h-4" aria-hidden />
          {t("dashboard.nav.newsKicker")}
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
          {t("dashboard.nav.newsTitle")}
        </h1>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-2xl">
          {t("dashboard.nav.newsLead")}
        </p>
      </header>

      <div className="space-y-3">
        {updates.length === 0 && !loading ? (
          <p className="text-gray-500 text-sm dark-card rounded-xl p-5 border border-gray-800">
            {t("dashboard.noUpdates")}
          </p>
        ) : (
          updates.map((item) => (
            <article
              key={item.id}
              className="dark-card rounded-2xl p-4 sm:p-5 border border-yellow-400/10 hover:border-yellow-400/25 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-black bg-yellow-400/15 text-yellow-300 px-2 py-0.5 rounded">
                  {item.tag}
                </span>
                <span className="text-gray-600 text-xs">{item.publishedAt}</span>
              </div>
              <h2 className="text-white font-bold text-sm sm:text-base mb-2 leading-snug">
                {item.title}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">{item.body}</p>
            </article>
          ))
        )}
      </div>

      <section className="dark-card rounded-2xl p-5 sm:p-6 border border-dashed border-yellow-400/20">
        <h2 className="text-white font-black text-base mb-2">{t("dashboard.comingTitle")}</h2>
        <p className="text-gray-400 text-sm leading-relaxed">{t("dashboard.comingBody")}</p>
      </section>
    </div>
  );
}
