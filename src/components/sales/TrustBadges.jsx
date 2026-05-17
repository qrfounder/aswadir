import { ShieldCheck, Zap, Lock, Infinity } from "lucide-react";
import { useTranslation } from "react-i18next";

const ICONS = [ShieldCheck, Zap, Lock, Infinity];
const EMOJIS = ["🛡️", "⚡", "🔒", "🔄"];

export default function TrustBadges({ className = "" }) {
  const { t } = useTranslation();
  const items = t("trustBadges.items", { returnObjects: true });

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${className}`}>
      {Array.isArray(items) &&
        items.map((badge, i) => {
          const Icon = ICONS[i] ?? ShieldCheck;
          return (
            <div key={i} className="flex flex-col items-center gap-2 dark-card rounded-xl p-4 text-center">
              <span className="text-2xl" role="img" aria-hidden>
                {EMOJIS[i]}
              </span>
              <Icon className="w-6 h-6 text-yellow-400/80" />
              <p className="text-white text-xs font-bold leading-snug">{badge.text}</p>
              <p className="text-gray-400 text-xs">{badge.sub}</p>
            </div>
          );
        })}
    </div>
  );
}
