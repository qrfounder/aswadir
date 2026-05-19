import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

import TestimonialCard from "./TestimonialCard";

const INITIAL_COUNT = 6;

/**
 * First 6 reviews visible; "View more" smooth-scrolls to the rest below (no in-place swap).
 * @param {{ testimonials: Array<Record<string, unknown>> }} props
 */
export default function ReviewsCarousel({ testimonials }) {
  const { t } = useTranslation();
  const moreRef = useRef(null);
  const total = testimonials.length;
  const hasMore = total > INITIAL_COUNT;

  const initial = testimonials.slice(0, INITIAL_COUNT);
  const more = testimonials.slice(INITIAL_COUNT);

  const scrollToMore = useCallback(() => {
    const el = moreRef.current;
    if (!el) return;
    const headerOffset = 120;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (window.location.hash === "#reviews-more") {
      requestAnimationFrame(scrollToMore);
    }
  }, [scrollToMore, testimonials]);

  if (!total) return null;

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {initial.map((item) => (
          <TestimonialCard key={item.id} {...cardProps(item)} />
        ))}
      </div>

      {hasMore && (
        <>
          <div className="flex flex-col items-center gap-3 pt-2">
            <p className="text-gray-500 text-sm text-center">
              {t("testimonials.reviewsCounter", { from: 1, to: INITIAL_COUNT, total })}
            </p>
            <button
              type="button"
              onClick={scrollToMore}
              className="inline-flex items-center justify-center gap-2 min-w-[14rem] px-6 py-3.5 rounded-2xl border border-brand/50 bg-brand/10 text-brand font-black text-sm hover:bg-primary/20 hover:border-primary/40/70 transition-colors shadow-lg shadow-primary/5"
            >
              {t("testimonials.reviewsScrollMore")}
              <ChevronDown className="w-5 h-5 animate-bounce" aria-hidden />
            </button>
          </div>

          <div
            id="reviews-more"
            ref={moreRef}
            tabIndex={-1}
            className="scroll-mt-28 space-y-6 pt-4 border-t border-brand/15 outline-none"
            aria-label={t("testimonials.reviewsMoreRegion")}
          >
            <p className="text-center text-gray-400 text-sm font-bold">
              {t("testimonials.reviewsMoreHeading", { from: INITIAL_COUNT + 1, total })}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {more.map((item) => (
                <TestimonialCard key={item.id} {...cardProps(item)} />
              ))}
            </div>
            <p className="text-gray-500 text-sm text-center">
              {t("testimonials.reviewsCounter", {
                from: INITIAL_COUNT + 1,
                to: total,
                total,
              })}
            </p>
          </div>
        </>
      )}

      <p className="text-center text-gray-600 text-[11px] leading-relaxed max-w-2xl mx-auto">
        {t("testimonials.reviewsIllustrative")}
      </p>
    </div>
  );
}

function cardProps(item) {
  return {
    name: item.name,
    role: item.role,
    text: item.text,
    avatar: item.avatar,
    country: item.country,
    date: item.date,
    verified: true,
  };
}
