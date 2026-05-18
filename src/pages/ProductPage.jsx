import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Users, Award, Link2, TrendingUp, Brain, Target, BarChart, Zap, Smartphone, Rocket } from "lucide-react";

import UrgencyBar from "@/components/sales/UrgencyBar";
import PricingSection from "@/components/sales/PricingSection";
import BeforeAfter from "@/components/sales/BeforeAfter";
import ReviewsCarousel from "@/components/sales/ReviewsCarousel";
import FAQSection from "@/components/sales/FAQSection";
import TrustBadges from "@/components/sales/TrustBadges";
import BrandLogo from "@/components/BrandLogo";
import SocialProofBar from "@/components/sales/SocialProofBar";
import StarRating from "@/components/sales/StarRating";
import StatsResults from "@/components/sales/StatsResults";
import GiftBanner from "@/components/sales/GiftBanner";
import TrustPillars from "@/components/sales/TrustPillars";
import VideoTestimonialsStrip from "@/components/sales/VideoTestimonialsStrip";
import { useBundleProduct } from "@/lib/localizedProducts";
import { getProductGallery } from "@/lib/productGallery";
import { useLocale } from "@/lib/LocaleContext";
import SiteHeader from "@/components/layout/SiteHeader";
import { getTestimonials } from "@/i18n/testimonials";


const FEATURE_ICONS = [Link2, TrendingUp, Brain, Target];
const HERO_BULLET_ICONS = [Link2, BarChart, Zap, Smartphone];

export default function ProductPage() {
  const { t, i18n } = useTranslation();
  const { locale } = useLocale();
  const bundle = useBundleProduct();
  const testimonials = useMemo(
    () => getTestimonials(i18n.language?.split("-")[0] || "en"),
    [i18n.language],
  );
  const navigate = useNavigate();
  const pricingRef = useRef(null);
  const [activeImage, setActiveImage] = useState(0);
  const [showStickyBuy, setShowStickyBuy] = useState(false);

  const features = useMemo(() => {
    const list = t("landing.features", { returnObjects: true });
    if (!Array.isArray(list)) return [];
    return list.map((feat, i) => ({ ...feat, icon: FEATURE_ICONS[i] ?? Link2 }));
  }, [t]);

  const heroBullets = useMemo(() => {
    const list = t("landing.heroBullets", { returnObjects: true });
    if (!Array.isArray(list)) return [];
    return list.map((text, i) => ({ text, icon: HERO_BULLET_ICONS[i] ?? Zap }));
  }, [t]);

  const productGallery = useMemo(
    () => getProductGallery(locale, t),
    [locale, t, i18n.language],
  );

  useEffect(() => {
    setActiveImage(0);
  }, [locale, i18n.language]);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBuy(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSelectProduct = (product) => {
    if (window.self !== window.top) {
      alert(t("common.publishedAppOnly"));
      return;
    }
    navigate(`/checkout?product=${encodeURIComponent(product.id)}`);
  };

  const startBundleTrial = () => {
    if (bundle) handleSelectProduct(bundle);
  };

  return (
    <div className="min-h-screen bg-background">
      <UrgencyBar />

      <SiteHeader className="top-[44px]" />

      <main className="pb-28 md:pb-16">
        {/* ─── HERO ─── */}
        <section className="hero-gradient pt-10 pb-14 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Copy */}
              <div className="order-2 lg:order-1 space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-2">
                  <Users className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-300 text-sm font-bold">{t("social.users")}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-white">
                  {t("landing.heroLine1")}
                  <br />
                  <span className="gold-gradient">
                    {t("landing.heroLine2")}
                    <br />
                    {t("landing.heroLine3")}
                  </span>
                </h1>

                <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                  {t("hero.title")}{" "}
                  <strong className="text-white">{t("hero.titleHighlight")}</strong>. {t("hero.subtitle")}
                </p>

                <div className="flex items-center gap-3">
                  <StarRating size="lg" />
                  <span className="text-gray-300 text-sm">
                    <strong className="text-white">{t("common.ratingValue")}</strong> {t("common.reviewsCount")}
                  </span>
                </div>
                <p className="text-gray-500 text-[11px] leading-relaxed -mt-2">* {t("landing.disclaimer")}</p>

                <ul className="space-y-2.5">
                  {heroBullets.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-200 text-sm">
                      <span className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-yellow-400" />
                      </span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>

                <button onClick={startBundleTrial} className="cta-button w-full py-4 md:py-5 rounded-2xl text-lg md:text-xl font-black pulse-gold flex justify-center items-center gap-2">
                  <Rocket className="w-6 h-6" /> {t("landing.heroCta")}
                </button>
                <p className="text-center text-yellow-300/90 text-sm font-bold">
                  {t("landing.heroCtaSubNoPrice")}
                </p>
                <p className="text-center text-gray-500 text-xs">✅ {t("landing.heroGuarantee")}</p>
              </div>

              {/* Product image */}
              <div className="order-1 lg:order-2 space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-yellow-400/20 glow-gold">
                  <img
                    src={productGallery[activeImage].src}
                    alt={t("landing.productAlt", { label: productGallery[activeImage].label })}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute top-3 end-3 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full">
                    {t("common.discount")} {bundle.discount}
                  </div>
                </div>
                <div className="flex gap-2">
                  {productGallery.map((item, i) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`flex-1 flex flex-col gap-1 min-w-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/80 ${
                        activeImage === i ? "ring-2 ring-yellow-400/60 rounded-lg" : ""
                      }`}
                    >
                      <span
                        className={`block rounded-lg overflow-hidden border-2 transition-all ${
                          activeImage === i ? "border-yellow-400" : "border-gray-700"
                        }`}
                      >
                        <img src={item.src} alt="" className="w-full h-14 sm:h-16 object-cover" />
                      </span>
                      <span className="text-[10px] text-center text-gray-500 font-bold truncate">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SOCIAL PROOF BAR ─── */}
        <section className="py-6 px-4 bg-black/30 border-y border-yellow-400/10">
          <div className="max-w-3xl mx-auto space-y-4">
            <SocialProofBar />
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <StatsResults />
          </div>
        </section>

        {/* ─── BEFORE / AFTER ─── */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                {t("landing.beforeTitle")}{" "}
                <span className="gold-gradient">{t("landing.beforeTitleHighlight")}</span>
              </h2>
              <p className="text-gray-400 text-base">{t("landing.beforeSubtitle")}</p>
            </div>
            <BeforeAfter />
          </div>
        </section>

        <hr className="section-divider mx-8" />

        {/* ─── PRODUCT DEMO GIF ─── */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
              {t("landing.demoTitle")}{" "}
              <span className="gold-gradient">{t("landing.demoTitleHighlight")}</span>
            </h2>
            <p className="text-gray-400 mb-8">{t("landing.demoSubtitle")}</p>
            <div className="rounded-2xl overflow-hidden border border-yellow-400/20 glow-gold max-w-2xl mx-auto">
              <img
                src="https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_3.gif?v=1765128020"
                alt={t("landing.demoAlt")}
                className="w-full"
              />
            </div>
          </div>
        </section>

        <section className="py-12 px-4 bg-black/15">
          <div className="max-w-6xl mx-auto">
            <VideoTestimonialsStrip />
          </div>
        </section>

        <hr className="section-divider mx-8" />

        {/* ─── FEATURES ─── */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                {t("landing.featuresTitle")}{" "}
                <span className="gold-gradient">{t("landing.featuresTitleHighlight")}</span>
              </h2>
              <p className="text-gray-400">{t("landing.featuresSubtitle")}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {features.map((feat, i) => (
                <div key={i} className="dark-card rounded-2xl p-6 flex gap-4">
                  <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feat.icon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-base mb-2">{feat.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── MORE GIFS ─── */}
        <section className="py-10 px-4 bg-black/20">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_1.gif?v=1765127696",
                "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_2.gif?v=1765128013",
                "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_3.gif?v=1765128020",
              ].map((gif, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-yellow-400/10">
                  <img src={gif} alt="" className="w-full h-auto" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="section-divider mx-8" />

        {/* ─── TESTIMONIALS ─── */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-2 mb-4">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-300 text-sm font-bold">{t("testimonials.pillBadge")}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                {t("testimonials.sectionTitle")}
              </h2>
              <p className="text-gray-500 text-sm max-w-xl mx-auto mb-2">{t("testimonials.sectionSubtitle")}</p>
              <div className="flex justify-center items-center gap-2 mt-2">
                <StarRating size="xl" />
                <span className="text-white font-black text-2xl">4.9</span>
                <span className="text-gray-400">/ 5</span>
              </div>
            </div>
            <ReviewsCarousel testimonials={testimonials} />
          </div>
        </section>

        <hr className="section-divider mx-8" />

        {/* ─── PRICING ─── */}
        <section ref={pricingRef} className="py-16 px-4" id="pricing">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10 space-y-5">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                {t("landing.pricingTitle")}{" "}
                <span className="gold-gradient">{t("landing.pricingTitleHighlight")}</span>
              </h2>
              <p className="text-gray-400">{t("landing.pricingSubtitle")}</p>
              <GiftBanner />
              <TrustPillars />
            </div>
            <PricingSection hideAmounts onSelectProduct={handleSelectProduct} />
            <div className="mt-6">
              <TrustBadges />
            </div>
          </div>
        </section>

        <hr className="section-divider mx-8" />

        {/* ─── FAQ ─── */}
        <section className="py-16 px-4" id="faq">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                {t("landing.faqTitle")}{" "}
                <span className="gold-gradient">{t("landing.faqTitleHighlight")}</span>
              </h2>
            </div>
            <FAQSection />
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="py-16 px-4 hero-gradient">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-black text-white">
              {t("landing.finalTitle")}{" "}
              <span className="gold-gradient">{t("landing.finalTitleHighlight")}</span>
              <br />
              {t("landing.finalTitle2")}
            </h2>
            <p className="text-gray-300 text-base md:text-lg">{t("landing.finalSubtitle")}</p>
            <button
              type="button"
              onClick={startBundleTrial}
              className="cta-button w-full max-w-sm px-8 py-4 md:py-5 rounded-2xl text-lg md:text-xl font-black flex justify-center items-center gap-2 mx-auto pulse-gold"
            >
              <Rocket className="w-6 h-6" /> {t("landing.finalCta")}
            </button>
            <p className="text-gray-500 text-sm">✅ {t("landing.finalNote")}</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 border-t border-yellow-400/10 py-8 px-4 text-center">
        <div className="flex items-center justify-center mb-3">
          <BrandLogo size="footer" className="mx-auto object-center" />
        </div>
        <p className="text-gray-600 text-xs">{t("footer.rights")}</p>
        <p className="text-gray-700 text-xs mt-1">{t("footer.regions")}</p>
      </footer>

      {/* Sticky Buy CTA */}
      {showStickyBuy && (
        <div className="sticky-cta fixed bottom-0 left-0 right-0 z-50 px-4 pt-3">
          <div className="max-w-lg mx-auto space-y-2.5">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] sm:text-xs text-gray-400">
              <span className="inline-flex items-center gap-1">
                <span className="text-emerald-400">✓</span> {t("landing.stickyGuarantee")}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="text-emerald-400">✓</span> {t("landing.stickySecure")}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="text-emerald-400">✓</span> {t("landing.stickyInstant")}
              </span>
            </div>
            <div className="flex items-center gap-3 pb-1">
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-sm truncate">{t("landing.stickyBundle")}</p>
                <p className="text-emerald-400/90 text-[10px] font-bold">{t("landing.stickyTrial")}</p>
                <p className="text-gray-400 text-[10px] leading-snug">{t("landing.stickyBundlePitch")}</p>
                <span className="inline-flex items-center gap-1 bg-red-500/15 text-red-300 text-[10px] font-black px-2 py-0.5 rounded border border-red-500/25">
                  -{bundle.discount}
                </span>
              </div>
              <button
                type="button"
                onClick={startBundleTrial}
                className="cta-button px-6 py-3 rounded-xl text-sm font-black flex-shrink-0"
              >
                {t("landing.stickyCta")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}