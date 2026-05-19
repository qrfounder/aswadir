import { Users, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import StarRating from "./StarRating";

export default function SocialProofBar() {
  const { t } = useTranslation();

  return (
    <div className="dark-card rounded-2xl p-5">
      <div className="grid grid-cols-3 gap-4 text-center divide-x divide-brand/20 [&>*]:px-2">
        <div className="flex flex-col items-center gap-1">
          <Users className="w-7 h-7 text-primary mb-1" />
          <p className="text-2xl md:text-3xl font-black gold-gradient leading-none">+15,000</p>
          <p className="text-gray-400 text-xs">{t("socialBar.users")}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex justify-center">
            <StarRating size="md" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-white leading-none">4.9/5</p>
          <p className="text-gray-400 text-xs">+2,544 {t("socialBar.rating")}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <ShieldCheck className="w-7 h-7 text-primary mb-1" />
          <p className="text-2xl md:text-3xl font-black gold-gradient leading-none">21</p>
          <p className="text-gray-400 text-xs">{t("socialBar.guarantee")}</p>
        </div>
      </div>
    </div>
  );
}
