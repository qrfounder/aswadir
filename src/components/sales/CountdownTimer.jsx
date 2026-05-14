import { useState, useEffect } from "react";

export default function CountdownTimer({ initialMinutes = 47, initialSeconds = 0 }) {
  const [time, setTime] = useState({ hours: 0, minutes: initialMinutes, seconds: initialSeconds });

  useEffect(() => {
    // Initialize from localStorage or start fresh
    const stored = localStorage.getItem("countdown_end");
    let endTime;
    if (stored) {
      endTime = parseInt(stored);
    } else {
      endTime = Date.now() + (initialMinutes * 60 + initialSeconds) * 1000;
      localStorage.setItem("countdown_end", endTime.toString());
    }

    const tick = () => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        // Reset timer when it hits 0
        const newEnd = Date.now() + (47 * 60) * 1000;
        localStorage.setItem("countdown_end", newEnd.toString());
        endTime = newEnd;
        return;
      }
      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTime({ hours: h, minutes: m, seconds: s });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1 font-cairo">
      {time.hours > 0 && (
        <>
          <div className="bg-black/50 rounded px-2 py-1 text-center min-w-[36px]">
            <span className="text-lg font-black text-yellow-400 tabular-nums">{pad(time.hours)}</span>
          </div>
          <span className="text-yellow-400 font-black">:</span>
        </>
      )}
      <div className="bg-black/50 rounded px-2 py-1 text-center min-w-[36px]">
        <span className="text-lg font-black text-yellow-400 tabular-nums">{pad(time.minutes)}</span>
      </div>
      <span className="text-yellow-400 font-black">:</span>
      <div className="bg-black/50 rounded px-2 py-1 text-center min-w-[36px]">
        <span className="text-lg font-black text-yellow-400 tabular-nums">{pad(time.seconds)}</span>
      </div>
    </div>
  );
}