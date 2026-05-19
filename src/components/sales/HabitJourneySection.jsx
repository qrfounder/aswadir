import { useTranslation } from "react-i18next";

export default function HabitJourneySection() {
  const { t } = useTranslation();
  const weeks = t("journey.weeks", { returnObjects: true });

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-brand/80 text-sm font-bold mb-2">{t("journey.eyebrow")}</p>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
          {t("journey.title")} <span className="gold-gradient">{t("journey.titleHighlight")}</span>
        </h2>
        <p className="text-gray-400 text-sm">{t("journey.subtitle")}</p>
      </div>

      <div className="relative max-w-3xl mx-auto space-y-6 me-0">
        <div
          className="hidden md:block absolute end-[1.125rem] top-3 bottom-3 w-px bg-brand/25"
          aria-hidden
        />
        {Array.isArray(weeks) &&
          weeks.map((step, i) => (
            <div key={step.w} className="relative flex gap-4 md:gap-6 items-start md:pe-10">
              <div className="flex flex-col items-center flex-shrink-0">
                <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-black text-sm flex items-center justify-center ring-4 ring-black z-10">
                  {i + 1}
                </span>
              </div>
              <div className="dark-card rounded-2xl p-5 flex-1 border border-brand/10">
                <p className="text-primary/90 text-xs font-bold mb-1">{step.w}</p>
                <h3 className="text-white font-black text-base mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
