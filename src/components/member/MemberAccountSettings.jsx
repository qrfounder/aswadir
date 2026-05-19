import { useState } from "react";
import { KeyRound, Mail, Shield, Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";
import { client } from "@/api/client";

export default function MemberAccountSettings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme, toggleTheme, isLight } = useTheme();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (form.next !== form.confirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    if (form.next.length < 8) {
      setError(t("auth.errors.weak_password"));
      return;
    }
    setSaving(true);
    try {
      await client.auth.changePassword(form.current, form.next);
      setMessage(t("dashboard.settings.passwordUpdated"));
      setForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      const code = err.data?.error;
      setError(
        t(`auth.errors.${code}`, { defaultValue: "" }) ||
          t("auth.invalidCredentials"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      className="dark-card rounded-2xl p-5 sm:p-6 border border-brand/15 space-y-6"
      aria-labelledby="account-settings-heading"
    >
      <div>
        <h2
          id="account-settings-heading"
          className="text-foreground font-black text-base sm:text-lg flex items-center gap-2"
        >
          <Shield className="w-5 h-5 text-primary" aria-hidden />
          {t("dashboard.settings.title")}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">{t("dashboard.settings.subtitle")}</p>
      </div>

      <div className="rounded-xl border border-gray-800/80 bg-black/20 p-4 space-y-3">
        <p className="text-gray-300 text-sm font-bold flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" aria-hidden />
          {t("dashboard.settings.emailLabel")}
        </p>
        <p className="text-white text-sm font-mono" dir="ltr">
          {user?.email}
        </p>
        <p className="text-gray-500 text-xs">{t("dashboard.settings.emailHint")}</p>
      </div>

      <div className="rounded-xl border border-gray-800/80 bg-black/20 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-gray-300 text-sm font-bold flex items-center gap-2">
            {isLight ? (
              <Sun className="w-4 h-4 text-primary" aria-hidden />
            ) : (
              <Moon className="w-4 h-4 text-primary" aria-hidden />
            )}
            {t("dashboard.settings.appearance")}
          </p>
          <p className="text-gray-500 text-xs mt-1">{t("dashboard.settings.appearanceHint")}</p>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="px-4 py-2 rounded-xl border border-brand/30 text-brand/90 text-sm font-bold hover:bg-primary/90/10 transition-colors"
          aria-pressed={isLight}
        >
          {isLight ? t("dashboard.settings.themeDark") : t("dashboard.settings.themeLight")}
        </button>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <p className="text-gray-300 text-sm font-bold flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" aria-hidden />
          {t("dashboard.settings.changePassword")}
        </p>
        <label className="block">
          <span className="text-gray-500 text-xs font-bold mb-1 block">
            {t("dashboard.settings.currentPassword")}
          </span>
          <input
            type="password"
            autoComplete="current-password"
            value={form.current}
            onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))}
            className="w-full bg-black/40 border border-gray-700 focus:border-primary rounded-xl px-4 py-2.5 text-foreground outline-none text-sm"
          />
        </label>
        <label className="block">
          <span className="text-gray-500 text-xs font-bold mb-1 block">
            {t("dashboard.settings.newPassword")}
          </span>
          <input
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={form.next}
            onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))}
            className="w-full bg-black/40 border border-gray-700 focus:border-primary rounded-xl px-4 py-2.5 text-foreground outline-none text-sm"
          />
        </label>
        <label className="block">
          <span className="text-gray-500 text-xs font-bold mb-1 block">
            {t("auth.confirmPassword")}
          </span>
          <input
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
            className="w-full bg-black/40 border border-gray-700 focus:border-primary rounded-xl px-4 py-2.5 text-foreground outline-none text-sm"
          />
        </label>
        {error && (
          <p className="text-red-300 text-sm bg-red-900/30 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {message && (
          <p className="text-success text-sm bg-success/15 border border-success/30 rounded-lg px-3 py-2">
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="cta-button px-5 py-2.5 rounded-xl text-sm font-black disabled:opacity-50"
        >
          {saving ? t("dashboard.settings.saving") : t("dashboard.settings.savePassword")}
        </button>
      </form>

      <ul className="text-xs text-gray-500 space-y-1.5 list-disc ps-4">
        <li>{t("dashboard.settings.securityTip1")}</li>
        <li>{t("dashboard.settings.securityTip2")}</li>
      </ul>
    </section>
  );
}
