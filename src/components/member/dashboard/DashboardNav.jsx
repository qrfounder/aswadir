import {
  Bell,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const NAV_ITEMS = [
  { id: "track", icon: LayoutDashboard, labelKey: "dashboard.nav.track" },
  { id: "tools", icon: Sparkles, labelKey: "dashboard.nav.tools" },
  { id: "news", icon: Bell, labelKey: "dashboard.nav.news" },
  { id: "account", icon: Settings, labelKey: "dashboard.nav.account" },
];

function NavButton({ item, active, onSelect, compact }) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const label = t(item.labelKey);

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={active ? "page" : undefined}
      className={`flex items-center justify-center gap-2 rounded-xl font-bold transition-all min-h-[44px] ${
        compact
          ? `flex-1 flex-col gap-0.5 py-1.5 px-1 text-[10px] sm:text-[11px] ${
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground/85"
            }`
          : `w-full px-3 py-2.5 text-sm text-start ${
              active
                ? "bg-primary/15 text-primary border border-primary/35 shadow-sm shadow-primary/10"
                : "text-muted-foreground border border-transparent hover:bg-muted hover:text-foreground"
            }`
      }`}
    >
      <Icon
        className={`shrink-0 ${compact ? "w-5 h-5" : "w-4 h-4"}`}
        aria-hidden
      />
      <span className={compact ? "leading-tight text-center max-w-[4.5rem] truncate" : ""}>{label}</span>
    </button>
  );
}

/** Desktop / tablet sidebar */
export function DashboardNavSidebar({ section, onSectionChange }) {
  const { t } = useTranslation();

  return (
    <nav
      className="dashboard-sidebar hidden md:flex md:flex-col gap-1.5 shrink-0 w-52 lg:w-60 border-e border-brand/10 md:sticky md:top-[4.25rem] md:self-start md:max-h-[calc(100dvh-4.25rem)] md:overflow-y-auto py-5 px-3 lg:px-4"
      aria-label={t("dashboard.nav.aria")}
    >
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-2 mb-2 hidden lg:block">
        {t("dashboard.nav.menuLabel")}
      </p>
      {NAV_ITEMS.map((item) => (
        <NavButton
          key={item.id}
          item={item}
          active={section === item.id}
          onSelect={onSectionChange}
        />
      ))}
    </nav>
  );
}

/** Mobile bottom bar */
export function DashboardNavBottom({ section, onSectionChange }) {
  const { t } = useTranslation();

  return (
    <nav
      className="dashboard-bottom-nav md:hidden fixed bottom-0 inset-x-0 z-50 px-2 pt-1.5"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      aria-label={t("dashboard.nav.aria")}
    >
      <div className="max-w-lg mx-auto flex gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={section === item.id}
            onSelect={onSectionChange}
            compact
          />
        ))}
      </div>
    </nav>
  );
}
