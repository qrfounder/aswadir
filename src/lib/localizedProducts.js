import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PRODUCTS as BASE_PRODUCTS } from "@/lib/products";
import { getProductPrices } from "@/lib/currency";
import { useLocale } from "@/lib/LocaleContext";

/** Future: locale-specific product hero images (user will supply assets). */
const PRODUCT_IMAGE_BY_LOCALE = {
  task: { en: "/products/tasks.png", ar: "/products/tasks.png", th: "/products/tasks.png" },
  habit: { en: "/products/habits.png", ar: "/products/habits.png", th: "/products/habits.png" },
  bundle: { en: "/products/box.png", ar: "/products/box.png", th: "/products/box.png" },
};

function productImage(id, locale) {
  const map = PRODUCT_IMAGE_BY_LOCALE[id];
  if (!map) return BASE_PRODUCTS.find((p) => p.id === id)?.image;
  return map[locale] || map.en;
}

/**
 * Catalog with translated copy; prices follow the active display currency.
 */
export function useLocalizedProducts() {
  const { t, i18n } = useTranslation();
  const { currency } = useLocale();
  const locale = i18n.language?.split("-")[0] || "en";

  return useMemo(
    () =>
      BASE_PRODUCTS.map((p) => {
        const badge = t(`products.${p.id}.badge`, { defaultValue: "" });
        const prices = getProductPrices(p.id, currency);
        return {
          ...p,
          name: t(`products.${p.id}.name`),
          subtitle: t(`products.${p.id}.subtitle`),
          billingLabel: t("products.billingLabel"),
          features: t(`products.${p.id}.features`, { returnObjects: true }),
          image: productImage(p.id, locale),
          badge: badge || p.badge,
          salePrice: prices.sale,
          originalPrice: prices.original,
          displayCurrency: currency,
        };
      }),
    [t, locale, currency],
  );
}

export function useLocalizedProduct(productId) {
  const products = useLocalizedProducts();
  return useMemo(
    () => products.find((p) => p.id === productId) || products.find((p) => p.popular) || products[0],
    [products, productId],
  );
}

export function useBundleProduct() {
  const products = useLocalizedProducts();
  return useMemo(() => products.find((p) => p.id === "bundle") || products[0], [products]);
}
