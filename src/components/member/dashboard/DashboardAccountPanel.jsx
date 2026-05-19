import { Link } from "react-router-dom";
import { ExternalLink, HelpCircle, Home, Package, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTrackerCatalog } from "@/lib/useTrackerCatalog";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MemberAccountSettings from "@/components/member/MemberAccountSettings";
import SubscriptionBanner from "@/components/member/SubscriptionBanner";

function TrustStrip() {
  const { t } = useTranslation();
  return (
    <div
      className="member-trust-strip flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-4 rounded-xl border border-brand/10 px-4 py-3 text-xs text-gray-400"
      role="note"
    >
      <span className="inline-flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-brand/80" aria-hidden />
        {t("dashboard.trustSecure")}
      </span>
      <span className="hidden sm:inline text-gray-700" aria-hidden>
        ·
      </span>
      <span>{t("dashboard.trustLocal")}</span>
    </div>
  );
}

export default function DashboardAccountPanel({
  ownedKeys,
  subscription,
  user,
}) {
  const { t } = useTranslation();
  const { packMeta } = useTrackerCatalog();

  const productLabel = (key) => t(`dashboard.products.${key}`, { defaultValue: key });

  return (
    <div className="space-y-5 sm:space-y-6 w-full">
      <header className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
          {t("dashboard.nav.accountTitle")}
        </h1>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-3xl">
          {t("dashboard.nav.accountLead")}
        </p>
      </header>

      {subscription && <SubscriptionBanner subscription={subscription} />}

      <div className="sm:hidden flex flex-wrap gap-2">
        <CurrencySwitcher />
        <LanguageSwitcher compact />
      </div>

      <div className="dashboard-main--account-grid">
        <div className="space-y-5 sm:space-y-6 min-w-0">
          <MemberAccountSettings />
        </div>

        <div className="space-y-5 sm:space-y-6 min-w-0">
          <section className="dark-card rounded-2xl p-5 sm:p-6 border border-gray-800/80 space-y-4">
            <h2 className="text-white font-black text-base flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" aria-hidden />
              {t("dashboard.yourProducts")}
            </h2>
            {ownedKeys.length === 0 ? (
              <p className="text-gray-500 text-sm">{t("dashboard.noProducts")}</p>
            ) : (
              <ul className="space-y-3">
                {ownedKeys
                  .filter((k) => packMeta[k])
                  .map((key) => (
                    <li
                      key={key}
                      className="rounded-xl border border-gray-800/80 bg-black/25 p-4"
                    >
                      <p className="text-white font-bold text-sm leading-snug">
                        {packMeta[key].icon} {productLabel(key)}
                      </p>
                      <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                        {packMeta[key].tagline}
                      </p>
                    </li>
                  ))}
              </ul>
            )}
            {user?.email && (
              <p className="text-gray-600 text-xs">
                {t("dashboard.nav.signedInAs")}{" "}
                <span className="text-gray-400 font-mono" dir="ltr">
                  {user.email}
                </span>
              </p>
            )}
          </section>

          <section className="dark-card rounded-2xl p-5 sm:p-6 border border-brand/15 space-y-3">
            <h2 className="text-white font-black text-base flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" aria-hidden />
              {t("dashboard.nav.supportTitle")}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">{t("dashboard.nav.supportLead")}</p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-1">
              <Link
                to="/#faq"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-brand/30 text-brand/90 text-sm font-bold hover:bg-primary/90/10 transition-colors"
              >
                {t("dashboard.nav.supportFaq")}
                <ExternalLink className="w-3.5 h-3.5 opacity-70" aria-hidden />
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm font-bold hover:border-gray-500 transition-colors"
              >
                <Home className="w-3.5 h-3.5" aria-hidden />
                {t("dashboard.backHome")}
              </Link>
            </div>
          </section>

          <TrustStrip />
        </div>
      </div>
    </div>
  );
}
