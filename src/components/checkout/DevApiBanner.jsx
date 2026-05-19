import { useEffect, useState } from "react";
import { AlertTriangle, Terminal } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Shown in dev when the Vite app cannot reach the Express API (port 3000).
 */
export default function DevApiBanner() {
  const { t } = useTranslation();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (!cancelled) setStatus(res.ok ? "ok" : "down");
      } catch {
        if (!cancelled) setStatus("down");
      }
    };

    check();
    const id = setInterval(check, 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!import.meta.env.DEV || status !== "down") return null;

  return (
    <div
      className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 space-y-2"
      role="alert"
    >
      <p className="text-red-200 text-sm font-bold flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        {t("checkoutDev.title")}
      </p>
      <p className="text-red-200/90 text-xs leading-relaxed">
        {t("checkoutDev.hint")}{" "}
        <code className="text-brand font-mono text-[11px]">http://localhost:5173</code>{" "}
        {t("checkoutDev.run")}
      </p>
      <pre className="text-[11px] text-gray-300 bg-black/50 rounded-lg p-3 overflow-x-auto font-mono flex items-start gap-2">
        <Terminal className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
        npm run dev:all
      </pre>
      <p className="text-gray-500 text-[11px]">
        {t("checkoutDev.alt")}{" "}
        <code className="text-brand/80">npm run build && npm run dev:server</code> {t("checkoutDev.then")}{" "}
        <code className="text-brand/80">http://localhost:3000</code>
      </p>
    </div>
  );
}
