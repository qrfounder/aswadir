import { useCallback, useEffect, useState } from "react";
import { BookOpen, Cloud, CloudOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  loadDailyNoteForDate,
  scheduleDailyNotePush,
} from "@/lib/member-sync";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyNotesPanel({ userId, syncStatus }) {
  const { t } = useTranslation();
  const date = todayIso();
  const [content, setContent] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    (async () => {
      const note = await loadDailyNoteForDate(userId, date);
      if (!cancelled) {
        setContent(note);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, date]);

  useEffect(() => {
    const onSaved = () => setSaving(false);
    const onError = () => setSaving(false);
    window.addEventListener("massar:sync-saved", onSaved);
    window.addEventListener("massar:sync-error", onError);
    return () => {
      window.removeEventListener("massar:sync-saved", onSaved);
      window.removeEventListener("massar:sync-error", onError);
    };
  }, []);

  const onChange = useCallback(
    (e) => {
      const next = e.target.value;
      setContent(next);
      setSaving(true);
      scheduleDailyNotePush(userId, date, next);
    },
    [userId, date],
  );

  const cloudOk = syncStatus === "ok";
  const cloudOff = syncStatus === "offline" || syncStatus === "error";

  return (
    <section
      className="dashboard-daily-note dark-card rounded-2xl border border-info/25 bg-gradient-to-br from-info/10 via-card to-muted p-4 sm:p-5"
      aria-labelledby="daily-notes-heading"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-5 h-5 text-info flex-shrink-0" aria-hidden />
          <div>
            <h2 id="daily-notes-heading" className="text-foreground font-black text-base sm:text-lg leading-tight">
              {t("dashboard.dailyNote.title")}
            </h2>
            <p className="text-muted-foreground text-xs mt-0.5">{t("dashboard.dailyNote.subtitle", { date })}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-shrink-0" aria-live="polite">
          {cloudOk && <Cloud className="w-3.5 h-3.5 text-success/90" aria-hidden />}
          {cloudOff && <CloudOff className="w-3.5 h-3.5 text-amber-400/80" aria-hidden />}
          <span>
            {saving
              ? t("dashboard.dailyNote.saving")
              : cloudOk
                ? t("dashboard.dailyNote.synced")
                : t("dashboard.dailyNote.localOnly")}
          </span>
        </div>
      </div>
      <textarea
        value={content}
        onChange={onChange}
        disabled={!loaded}
        placeholder={t("dashboard.dailyNote.placeholder")}
        rows={4}
        className="w-full rounded-xl bg-muted border border-border text-foreground text-sm p-3 sm:p-4 resize-y min-h-[6rem] focus:border-info/50 focus:outline-none focus:ring-1 focus:ring-info/30 placeholder:text-muted-foreground"
        aria-label={t("dashboard.dailyNote.title")}
      />
    </section>
  );
}
