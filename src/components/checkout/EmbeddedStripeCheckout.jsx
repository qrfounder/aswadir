import { useEffect, useRef, useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { stripePromise } from "@/lib/stripe";
import { client } from "@/api/client";

const STRIPE_LOCALE = { ar: "ar", en: "en", th: "th" };

/**
 * Stripe Embedded Checkout — mount in LTR full-width host (avoids RTL clip).
 */
export default function EmbeddedStripeCheckout({ product, customer, onError }) {
  const { t, i18n } = useTranslation();
  const mountRef = useRef(null);
  const checkoutRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const lang = i18n.language?.split("-")[0] || "en";
  const stripeLocale = STRIPE_LOCALE[lang] || "auto";

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
          whatsapp: customer.whatsapp.trim(),
          whatsappDialCode: t("checkout.whatsappPrefix"),
          embedded: true,
          locale: stripeLocale,
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
          window.location.href = `/setup-account?${q.toString()}`;
          return;
        }

        if (!clientSecret) {
          throw new Error("no_client_secret");
        }

        const stripe = await stripePromise;
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
    onError,
    stripeLocale,
  ]);

  return (
    <section className="checkout-stripe-section w-full min-w-0" aria-labelledby="stripe-checkout-heading">
      <h3
        id="stripe-checkout-heading"
        className="text-white font-black text-base flex items-center gap-2 mb-4"
      >
        <CreditCard className="w-5 h-5 text-yellow-400" />
        {t("checkout.stripeCardTitle")}
      </h3>

      <div className="checkout-stripe-frame rounded-2xl border border-yellow-400/15 bg-[#0a0e1a]/80 p-1 sm:p-2">
        {loading && (
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2 py-12">
            <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />
            {t("checkout.stripeLoading")}
          </p>
        )}
        <div
          ref={mountRef}
          dir="ltr"
          lang="en"
          className={`embedded-checkout-host w-full min-w-0 ${loading && !mounted ? "min-h-0 h-0 overflow-hidden" : "min-h-[480px]"}`}
          aria-label={t("checkout.stripeFormAria")}
        />
      </div>
    </section>
  );
}
