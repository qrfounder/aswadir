import { motion } from "framer-motion";

export default function ProgressRing({
  value,
  size = 88,
  stroke = 7,
  label,
  sublabel,
  accent = "#facc15",
  track = "rgba(255,255,255,0.08)",
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = c - (clamped / 100) * c;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={accent}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: "spring", stiffness: 90, damping: 16 }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center font-black text-white tabular-nums"
          style={{ fontSize: `clamp(0.65rem, ${size * 0.2}px, 1.35rem)` }}
        >
          {clamped}%
        </div>
      </div>
      {label && (
        <p className="text-gray-300 text-xs font-bold text-center leading-tight px-1">{label}</p>
      )}
      {sublabel && (
        <p className="text-gray-500 text-[10px] text-center leading-snug px-1 max-w-[120px]">
          {sublabel}
        </p>
      )}
    </div>
  );
}
