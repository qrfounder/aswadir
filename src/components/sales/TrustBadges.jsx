import { ShieldCheck, Zap, Lock, Infinity } from "lucide-react";

const badges = [
  { emoji: "🛡️", icon: ShieldCheck, text: "ضمان استرداد 21 يوم", sub: "بدون أي أسئلة" },
  { emoji: "⚡", icon: Zap, text: "توصلك فوري", sub: "خلال 60 ثانية" },
  { emoji: "🔒", icon: Lock, text: "دفع آمن 100%", sub: "تشفير SSL" },
  { emoji: "♾️", icon: Infinity, text: "وصول مدى الحياة", sub: "تحديثات مجانية" },
];

export default function TrustBadges({ className = "" }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${className}`}>
      {badges.map((badge, i) => (
        <div key={i} className="flex flex-col items-center gap-2 dark-card rounded-xl p-4 text-center">
          <span className="text-2xl" role="img" aria-hidden>{badge.emoji}</span>
          <badge.icon className="w-6 h-6 text-yellow-400/80" />
          <p className="text-white text-xs font-bold leading-snug">{badge.text}</p>
          <p className="text-gray-400 text-xs">{badge.sub}</p>
        </div>
      ))}
    </div>
  );
}