import { Users, ShieldCheck } from "lucide-react";
import StarRating from "./StarRating";

export default function SocialProofBar() {
  return (
    <div className="dark-card rounded-2xl p-5">
      <div className="grid grid-cols-3 gap-4 text-center divide-x divide-x-reverse divide-yellow-400/20">
        <div className="flex flex-col items-center gap-1">
          <Users className="w-7 h-7 text-yellow-400 mb-1" />
          <p className="text-2xl md:text-3xl font-black gold-gradient leading-none">+15,000</p>
          <p className="text-gray-400 text-xs">مستخدم نشط</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex justify-center">
            <StarRating size="md" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-white leading-none">4.9/5</p>
          <p className="text-gray-400 text-xs">+2,544 تقييم</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <ShieldCheck className="w-7 h-7 text-yellow-400 mb-1" />
          <p className="text-2xl md:text-3xl font-black gold-gradient leading-none">21</p>
          <p className="text-gray-400 text-xs">يوم ضمان استرداد</p>
        </div>
      </div>
    </div>
  );
}