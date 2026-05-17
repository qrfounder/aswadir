/** Stripe Checkout supported locales — Arabic (ar) is not supported; use auto. */
export function stripeCheckoutLocale(preferred) {
  const supported = new Set([
    "auto", "bg", "cs", "da", "de", "el", "en", "en-GB", "es", "es-419", "et", "fi", "fil",
    "fr", "fr-CA", "hr", "hu", "id", "it", "ja", "ko", "lt", "lv", "ms", "mt", "nb", "nl",
    "pl", "pt", "pt-BR", "ro", "ru", "sk", "sl", "sv", "th", "tr", "vi", "zh", "zh-HK", "zh-TW",
  ]);
  if (preferred === "ar") return "auto";
  if (preferred && supported.has(preferred)) return preferred;
  return "auto";
}
