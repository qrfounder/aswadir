import { useCallback, useMemo } from "react";
import { useLocale } from "@/lib/LocaleContext";
import {
  formatMoney,
  formatPerDayFromMonthlySale,
  formatProductPrice,
  getLowestSalePrice,
  getProductPrices,
} from "@/lib/currency";

/** Format catalog amounts for the active display currency. */
export function usePricing() {
  const { currency, locale, changeCurrency } = useLocale();

  const format = useCallback(
    (amount) => formatMoney(amount, currency, locale),
    [currency, locale],
  );

  const priceFor = useCallback(
    (productId, kind = "sale") => formatProductPrice(productId, kind, currency, locale),
    [currency, locale],
  );

  const amountsFor = useCallback(
    (productId) => getProductPrices(productId, currency),
    [currency],
  );

  const lowestSaleAmount = useMemo(() => getLowestSalePrice(currency), [currency]);

  const lowestPriceFor = useCallback(
    () => format(lowestSaleAmount),
    [format, lowestSaleAmount],
  );

  const originalPriceFor = useCallback(
    (productId) => formatProductPrice(productId, "original", currency, locale),
    [currency, locale],
  );

  const perDayPriceFor = useCallback(
    (productId) => formatPerDayFromMonthlySale(productId, currency, locale),
    [currency, locale],
  );

  return useMemo(
    () => ({
      currency,
      locale,
      changeCurrency,
      format,
      priceFor,
      originalPriceFor,
      perDayPriceFor,
      amountsFor,
      lowestSaleAmount,
      lowestPriceFor,
      /** Stripe checkout uses the same currency as the site switcher. */
      chargeCurrency: currency,
    }),
    [
      currency,
      locale,
      changeCurrency,
      format,
      priceFor,
      originalPriceFor,
      perDayPriceFor,
      amountsFor,
      lowestSaleAmount,
      lowestPriceFor,
    ],
  );
}
