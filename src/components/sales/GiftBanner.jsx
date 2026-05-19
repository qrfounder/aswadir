import { useTranslation } from "react-i18next";

export default function GiftBanner() {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-brand/30 via-brand/20 to-brand/30 border border-brand/25 rounded-xl px-4 py-3 text-center">
      <p className="text-brand text-sm font-bold leading-relaxed">🎁 {t("gift.text")}</p>
    </div>
  );
}
