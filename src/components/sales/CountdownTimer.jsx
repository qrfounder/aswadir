import { useState, useEffect } from "react";

const STORAGE_KEY = "countdown_end";

function readEndTime(initialMinutes, initialSeconds) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const endTime = parseInt(stored, 10);
      if (!Number.isNaN(endTime)) return endTime;
    }
    const endTime = Date.now() + (initialMinutes * 60 + initialSeconds) * 1000;
    localStorage.setItem(STORAGE_KEY, endTime.toString());
    return endTime;
  } catch {
    return Date.now() + (initialMinutes * 60 + initialSeconds) * 1000;
  }
}

function persistEndTime(endTime) {
  try {
    localStorage.setItem(STORAGE_KEY, endTime.toString());
  } catch {
    /* ignore */
  }
}

export default function CountdownTimer({ initialMinutes = 47, initialSeconds = 0 }) {
  const [time, setTime] = useState({ hours: 0, minutes: initialMinutes, seconds: initialSeconds });

  useEffect(() => {
    let endTime = readEndTime(initialMinutes, initialSeconds);

    const tick = () => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        const newEnd = Date.now() + 47 * 60 * 1000;
        persistEndTime(newEnd);
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
  }, [initialMinutes, initialSeconds]);

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
