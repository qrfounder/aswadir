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
                ? "text-yellow-300"
                : "text-gray-500 hover:text-gray-300"
            }`
          : `w-full px-3 py-2.5 text-sm text-start ${
              active
                ? "bg-yellow-400/15 text-yellow-100 border border-yellow-400/35 shadow-sm"
                : "text-gray-400 border border-transparent hover:bg-white/5 hover:text-gray-200"
            }`
      }`}
    >
      <Icon
        className={`shrink-0 ${compact ? "w-5 h-5" : "w-4 h-4"} ${active && compact ? "text-yellow-400" : ""}`}
        aria-hidden
      />
      <span className={compact ? "leading-tight text-center max-w-[4.5rem] truncate" : ""}>{label}</span>
    </button>
  );
}

/** Desktop / tablet sidebar + top row on md+ */
export function DashboardNavSidebar({ section, onSectionChange }) {
  const { t } = useTranslation();

  return (
    <nav
      className="hidden md:flex md:flex-col gap-1.5 md:w-52 lg:w-56 shrink-0"
      aria-label={t("dashboard.nav.aria")}
    >
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
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-yellow-400/15 bg-[#060911]/95 backdrop-blur-lg px-2 pt-1.5"
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

/** Tablet horizontal pills under header (md only) — optional; sidebar handles md+. Skip to avoid duplication. */
