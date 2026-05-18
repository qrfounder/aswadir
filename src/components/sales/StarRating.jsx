import { useTranslation } from "react-i18next";

export default function StarRating({ rating = 5, size = "md" }) {
  const { t } = useTranslation();
  const sizes = { sm: "text-sm", md: "text-base", lg: "text-xl", xl: "text-2xl" };
  return (
    <span className={`star-gold ${sizes[size]}`} aria-label={t("common.starsAria", { rating })}>
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
    </span>
  );
}