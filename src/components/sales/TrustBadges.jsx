import { ShieldCheck, Zap, Lock, Infinity } from "lucide-react";

const badges = [
  { icon: ShieldCheck, text: "ضمان استرداد 21 يوم", sub: "بدون أي أسئلة" },
  { icon: Zap, text: "توصلك فوري", sub: "خلال 60 ثانية" },
  { icon: Lock, text: "دفع آمن 100%", sub: "تشفير SSL" },
  { icon: Infinity, text: "وصول مدى الحياة", sub: "تحديثات مجانية" },
];

export default function TrustBadges({ className = "" }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${className}`}>
      {badges.map((badge, i) => (
        <div key={i} className="flex flex-col items-center gap-2 dark-card rounded-xl p-4 text-center">
          <badge.icon className="w-7 h-7 text-yellow-400" />
          <p className="text-white text-xs font-bold leading-snug">{badge.text}</p>
          <p className="text-gray-400 text-xs">{badge.sub}</p>
        </div>
      ))}
    </div>
  );
}