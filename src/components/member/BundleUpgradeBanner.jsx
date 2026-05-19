import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { ForwardChevron } from "@/lib/locale-ui";
import { useTranslation } from "react-i18next";
import { useBundleProduct, useLocalizedProducts } from "@/lib/localizedProducts";
import { usePricing } from "@/lib/usePricing";

export default function BundleUpgradeBanner({ ownedKeys }) {
  const { t } = useTranslation();
  const { format, priceFor } = usePricing();
  const products = useLocalizedProducts();
  const bundle = useBundleProduct();
  const hasHabit = ownedKeys.includes("habit");
  const hasTask = ownedKeys.includes("task");
  const missing = [];
  if (!hasHabit) missing.push(t("dashboard.products.habit"));
  if (!hasTask) missing.push(t("dashboard.products.task"));

  const habitProduct = products.find((p) => p.id === "habit");
  const taskProduct = products.find((p) => p.id === "task");
  const singlesTotal =
    (hasHabit ? 0 : habitProduct?.salePrice || 0) + (hasTask ? 0 : taskProduct?.salePrice || 0);

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-e from-brand/12 via-card to-muted p-5 md:p-6"
      aria-label={t("member.upgradeAria")}
    >
      <Glow className="-top-10 -end-10 bg-brand/10" />
      <Glow className="-bottom-8 -start-8 bg-success/10" />

      <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="flex-1 space-y-2">
          <p className="inline-flex items-center gap-1.5 text-xs font-black text-brand bg-brand/15 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            {t("member.upgradeBadge")}
          </p>
          <h2 className="text-foreground font-black text-lg md:text-xl leading-snug">
            {hasHabit && hasTask
              ? t("member.upgradeTitleBoth")
              : t("member.upgradeTitleMissing", { items: missing.join(" + ") })}
          </h2>
          <p className="text-foreground/85 text-sm leading-relaxed max-w-xl">
            {hasHabit && !hasTask && t("member.upgradeBodyHabitOnly")}
            {hasTask && !hasHabit && t("member.upgradeBodyTaskOnly")}
            {hasHabit && hasTask && t("member.upgradeBodyBoth")}
          </p>
          {singlesTotal > bundle.salePrice && (
            <p className="text-muted-foreground text-xs">
              {t("member.upgradePriceCompare", {
                singles: format(singlesTotal),
                bundle: priceFor("bundle"),
              })}
            </p>
          )}
        </div>
        <Link
          to="/checkout?product=bundle"
          className="w-full md:w-auto flex-shrink-0 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black text-sm px-6 py-3.5 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 min-h-[48px] text-center"
        >
          {t("member.upgradeCta", { price: priceFor("bundle") })}
          <ForwardChevron className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

function Glow({ className = "" }) {
  return (
    <div
      className={`pointer-events-none absolute w-40 h-40 rounded-full blur-3xl ${className}`}
      aria-hidden
    />
  );
}
