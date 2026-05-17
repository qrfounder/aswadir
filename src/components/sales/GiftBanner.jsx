import { useTranslation } from "react-i18next";

export default function GiftBanner() {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-yellow-900/40 via-yellow-800/30 to-yellow-900/40 border border-yellow-400/25 rounded-xl px-4 py-3 text-center">
      <p className="text-yellow-100 text-sm font-bold leading-relaxed">🎁 {t("gift.text")}</p>
    </div>
  );
}
