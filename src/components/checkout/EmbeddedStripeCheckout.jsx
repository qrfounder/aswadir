import { useEffect, useRef, useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getStripeForLocale } from "@/lib/stripe";
import { normalizeAppLocale } from "@/lib/stripeLocale";
import { client } from "@/api/client";
import { getDialCountry } from "@/lib/phoneDialCodes";

/**
 * Stripe Embedded Checkout — Apple Pay + cards on-page (no redirect).
 * Locale: session `th`/`en`/`auto` + Stripe.js `th`/`en`/`ar` for UI strings.
 */
export default function EmbeddedStripeCheckout({ product, customer, password, locale, onError }) {
  const { t } = useTranslation();
  const mountRef = useRef(null);
  const checkoutRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const appLocale = normalizeAppLocale(locale);
  const htmlLang = appLocale === "ar" ? "ar" : appLocale === "th" ? "th" : "en";

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setMounted(false);
      try {
        const res = await client.functions.invoke("createCheckoutSession", {
          productId: product.id,
          customerName: customer.name.trim(),
          customerEmail: customer.email.trim().toLowerCase(),
          password: String(password || ""),
          whatsapp: customer.whatsapp.trim(),
          whatsappDialCode: getDialCountry(customer.dialIso || "SA").dial,
          embedded: true,
          locale: appLocale,
          returnOrigin: window.location.origin,
        });

        if (cancelled) return;

        const { clientSecret, simulated, checkoutSessionId } = res.data || {};

        if (simulated && checkoutSessionId) {
          const q = new URLSearchParams({
            session_id: checkoutSessionId,
            productId: product.id,
            product: product.name,
            price: String(product.salePrice),
          });
          window.location.href = `/checkout/success?${q.toString()}`;
          return;
        }

        if (!clientSecret) {
          throw new Error("no_client_secret");
        }

        const stripe = await getStripeForLocale(appLocale);
        if (!stripe) throw new Error("stripe_not_loaded");

        checkoutRef.current?.destroy?.();
        const checkout = await stripe.initEmbeddedCheckout({ clientSecret });
        checkoutRef.current = checkout;

        if (mountRef.current) {
          checkout.mount(mountRef.current);
          if (!cancelled) setMounted(true);
        }
      } catch (err) {
        if (!cancelled) onError?.(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
      checkoutRef.current?.destroy?.();
      checkoutRef.current = null;
    };
  }, [
    product.id,
    product.name,
    product.salePrice,
    customer.name,
    customer.email,
    customer.whatsapp,
    customer.dialIso,
    password,
    onError,
    appLocale,
  ]);

  return (
    <section className="checkout-stripe-section w-full min-w-0" aria-labelledby="stripe-checkout-heading">
      <h3
        id="stripe-checkout-heading"
        className="text-white font-black text-base flex items-center gap-2 mb-2"
      >
        <CreditCard className="w-5 h-5 text-primary" />
        {t("checkout.stripeCardTitle")}
      </h3>
      <p className="text-gray-400 text-sm mb-4 leading-relaxed">{t("checkout.payEmbeddedLead")}</p>
      <p className="text-gray-500 text-xs mb-4">{t("checkout.stripeWalletHint")}</p>

      <div className="checkout-stripe-frame rounded-2xl border border-brand/15 bg-[#0a0e1a]/80 p-1 sm:p-2">
        {loading && (
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2 py-12">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            {t("checkout.stripeLoading")}
          </p>
        )}
        <div
          ref={mountRef}
          dir="ltr"
          lang={htmlLang}
          className={`embedded-checkout-host w-full min-w-0 ${loading && !mounted ? "min-h-0 h-0 overflow-hidden" : "min-h-[480px]"}`}
          aria-label={t("checkout.stripeFormAria")}
        />
      </div>
    </section>
  );
}
