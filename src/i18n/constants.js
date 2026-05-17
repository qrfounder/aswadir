/** @typedef {'en' | 'ar' | 'th'} AppLocale */

export const STORAGE_KEY = "massar_locale";

/** @type {AppLocale[]} */
export const SUPPORTED_LOCALES = ["en", "ar", "th"];

/** @type {Record<AppLocale, { label: string; native: string; dir: 'ltr' | 'rtl'; stripe: string }>} */
export const LOCALE_META = {
  en: { label: "English", native: "English", dir: "ltr", stripe: "en" },
  ar: { label: "Arabic", native: "العربية", dir: "rtl", stripe: "auto" },
  th: { label: "Thai", native: "ไทย", dir: "ltr", stripe: "th" },
};

/** ISO 3166-1 alpha-2 → default locale (Gulf + Thailand + international English) */
export const COUNTRY_TO_LOCALE = {
  SA: "ar",
  AE: "ar",
  KW: "ar",
  QA: "ar",
  BH: "ar",
  OM: "ar",
  EG: "ar",
  JO: "ar",
  LB: "ar",
  MA: "ar",
  TH: "th",
  US: "en",
  GB: "en",
  CA: "en",
  AU: "en",
  DE: "en",
  ES: "en",
  IN: "en",
  PK: "en",
  CN: "en",
  TW: "en",
  HK: "en",
  SG: "en",
  FR: "en",
};

export const DEFAULT_LOCALE = "en";

/**
 * @param {string | null | undefined} code
 * @returns {AppLocale}
 */
export function normalizeLocale(code) {
  if (!code) return DEFAULT_LOCALE;
  const lower = String(code).toLowerCase().split("-")[0];
  if (lower === "ar") return "ar";
  if (lower === "th") return "th";
  if (lower === "en") return "en";
  /* legacy stored zh/fr → English */
  return DEFAULT_LOCALE;
}

/**
 * @param {AppLocale} locale
 */
export function applyDocumentLocale(locale) {
  const normalized = normalizeLocale(locale);
  const meta = LOCALE_META[normalized] || LOCALE_META.en;
  const html = document.documentElement;
  html.lang = normalized;
  html.dir = meta.dir;
  document.body?.setAttribute("data-locale", normalized);
  document.body?.setAttribute("dir", meta.dir);
}
