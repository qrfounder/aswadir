import { Check, Info, Lock, Star, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import CountdownTimer from "./CountdownTimer";
import { useBundleProduct } from "@/lib/localizedProducts";
import { usePricing } from "@/lib/usePricing";

/**
 * @param {{ onSelectProduct: (p: import('@/lib/localizedProducts').LocalizedProduct) => void, hideAmounts?: boolean }} props
 */
export default function PricingSection({ onSelectProduct, hideAmounts = false }) {
  const { t } = useTranslation();
  const { format } = usePricing();
  const bundle = useBundleProduct();

  if (!bundle) return null;

  const handleBuy = () => onSelectProduct(bundle);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between dark-card rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-gray-300 text-sm font-bold">{t("pricing.discountEnds")}</span>
        </div>
        <CountdownTimer initialMinutes={47} />
      </div>

      <div className="w-full text-start rounded-2xl p-5 border-2 border-brand/25 bg-brand/5 glow-gold-sm relative">
        <div className="absolute -top-3 end-4">
          <span className="gold-bg text-black text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" fill="currentColor" />
            {bundle.badge || t("pricing.bestSeller")}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div className="min-w-0">
            <p className="text-white font-black text-xl">{bundle.name}</p>
            <p className="text-gray-400 text-sm mt-1">{bundle.subtitle}</p>
            <ul className="mt-3 space-y-1.5">
              {bundle.features.slice(0, 5).map((f, i) => (
                <li key={i} className="text-gray-300 text-sm flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-end flex-shrink-0 sm:min-w-[120px]">
            {hideAmounts ? (
              <div className="flex flex-col items-end gap-1">
                <span className="inline-flex items-center gap-1 text-brand/90 text-[11px] font-black bg-black/40 border border-brand/25 px-2 py-1 rounded-lg">
                  <Lock className="w-3.5 h-3.5" aria-hidden />
                  {t("pricing.atCheckout")}
                </span>
                <span className="text-gray-500 text-[10px] leading-snug max-w-[140px]">{t("pricing.valueStack")}</span>
              </div>
            ) : (
              <>
                <span className="bg-red-500/20 text-red-400 text-xs font-black px-2 py-0.5 rounded border border-red-500/30">
                  -{bundle.discount}
                </span>
                <p className="text-gray-500 text-xs line-through mt-2">{format(bundle.originalPrice)}</p>
                <p className="text-primary text-3xl font-black price-tag">{format(bundle.salePrice)}</p>
                <p className="text-brand text-xs">{t("pricing.perMonth")}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="dark-card rounded-xl p-4 border border-brand/15 flex gap-3 items-start">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-start space-y-2">
          <p className="text-white font-black text-sm">{t("pricing.infoTitle")}</p>
          <p className="text-gray-400 text-xs leading-relaxed">{t("pricing.infoBody")}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleBuy}
        className="cta-button w-full py-5 rounded-2xl text-lg font-black flex items-center justify-center gap-2 pulse-gold"
      >
        <Zap className="w-5 h-5" />
        {hideAmounts
          ? t("pricing.subscribeBtnBlind")
          : t("pricing.subscribeBtn", { price: format(bundle.salePrice) })}
      </button>

      <p className="text-center text-gray-400 text-xs flex items-center justify-center gap-2 flex-wrap">
        {t("pricing.billingNote")}
      </p>
    </div>
  );
}
