import { useTranslation } from "react-i18next";

const EMOJIS = ["⏱️", "🧠", "🛡️"];

export default function TrustPillars() {
  const { t } = useTranslation();
  const items = t("trustPillars.items", { returnObjects: true });

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {Array.isArray(items) &&
        items.map((item, i) => (
          <div
            key={item.title}
            className="dark-card rounded-2xl p-6 text-center border border-brand/10"
          >
            <span className="text-4xl mb-4 block" role="img" aria-hidden>
              {EMOJIS[i]}
            </span>
            <h3 className="text-white font-black text-base mb-2">{item.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
    </div>
  );
}
