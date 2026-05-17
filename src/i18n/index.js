import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { applyDocumentLocale, DEFAULT_LOCALE, normalizeLocale, SUPPORTED_LOCALES } from "./constants.js";
import en from "./locales/en.json";
import ar from "./locales/ar.json";
import th from "./locales/th.json";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  th: { translation: th },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

/**
 * @param {import('./constants.js').AppLocale} locale
 */
export function setAppLocale(locale) {
  const normalized = normalizeLocale(locale);
  void i18n.changeLanguage(normalized);
  applyDocumentLocale(normalized);
  return normalized;
}

export default i18n;
