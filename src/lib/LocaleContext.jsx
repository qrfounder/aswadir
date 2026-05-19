import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n, { setAppLocale } from "@/i18n/index.js";
import {
  DEFAULT_LOCALE,
  LOCALE_META,
  STORAGE_KEY,
  normalizeLocale,
} from "@/i18n/constants.js";
import {
  STORAGE_KEY_CURRENCY,
  STORAGE_KEY_CURRENCY_MANUAL,
  normalizeCurrency,
  suggestCurrency,
} from "@/lib/currency.js";
import { captureAttributionFromUrl } from "@/lib/attribution.js";

/** @typedef {import('@/i18n/constants.js').AppLocale} AppLocale */
/** @typedef {import('@/lib/currency.js').AppCurrency} AppCurrency */

const LocaleContext = createContext(null);

function readUrlLocale() {
  try {
    const lang = new URLSearchParams(window.location.search).get("lang");
    if (lang) return normalizeLocale(lang);
  } catch {
    /* ignore */
  }
  return null;
}

function readStoredLocale() {
  const fromUrl = readUrlLocale();
  if (fromUrl) return fromUrl;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeLocale(raw);
  } catch {
    /* ignore */
  }
  return null;
}

function writeStoredLocale(locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

function readStoredCurrency() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENCY);
    if (raw) return normalizeCurrency(raw);
  } catch {
    /* ignore */
  }
  return null;
}

function writeStoredCurrency(currency) {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENCY, currency);
  } catch {
    /* ignore */
  }
}

function readCurrencyManual() {
  try {
    return localStorage.getItem(STORAGE_KEY_CURRENCY_MANUAL) === "1";
  } catch {
    return false;
  }
}

function writeCurrencyManual(manual) {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENCY_MANUAL, manual ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function DocumentMetaSync() {
  const { t, i18n: i18nInst } = useTranslation();
  useEffect(() => {
    document.title = t("meta.title");
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", t("meta.description"));
  }, [t, i18nInst.language]);
  return null;
}

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => readStoredLocale() || DEFAULT_LOCALE);
  const [currency, setCurrency] = useState(() => readStoredCurrency() || "USD");
  const [ready, setReady] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      captureAttributionFromUrl(window.location.search);
      const storedLocale = readStoredLocale();
      const storedCurrency = readStoredCurrency();
      const currencyManual = readCurrencyManual();
      let nextLocale = storedLocale;
      let country = null;
      let detectedCurrency = null;

      if (!storedLocale) {
        try {
          const res = await fetch("/api/locale/detect", { credentials: "same-origin" });
          if (res.ok) {
            const data = await res.json();
            if (!cancelled) {
              country = data.country || null;
              setDetectedCountry(country);
              nextLocale = normalizeLocale(data.locale);
              if (data.currency) detectedCurrency = normalizeCurrency(data.currency);
            }
          }
        } catch {
          /* offline */
        }
      }

      const appliedLocale = setAppLocale(nextLocale || DEFAULT_LOCALE);
      let appliedCurrency = storedCurrency;
      if (!currencyManual) {
        appliedCurrency = normalizeCurrency(
          storedCurrency ||
            detectedCurrency ||
            (country ? suggestCurrency(appliedLocale, country) : suggestCurrency(appliedLocale, null)),
        );
        writeStoredCurrency(appliedCurrency);
      }

      if (!cancelled) {
        setLocale(appliedLocale);
        setCurrency(appliedCurrency || "USD");
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const changeLocale = useCallback(
    (code) => {
      const applied = setAppLocale(code);
      writeStoredLocale(applied);
      setLocale(applied);

      if (!readCurrencyManual()) {
        const next = suggestCurrency(applied, detectedCountry);
        writeStoredCurrency(next);
        setCurrency(next);
      }
    },
    [detectedCountry],
  );

  const changeCurrency = useCallback((code) => {
    const applied = normalizeCurrency(code);
    writeStoredCurrency(applied);
    writeCurrencyManual(true);
    setCurrency(applied);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      currency,
      ready,
      detectedCountry,
      dir: LOCALE_META[locale]?.dir || "ltr",
      meta: LOCALE_META[locale] || LOCALE_META.en,
      changeLocale,
      changeCurrency,
      t: i18n.t.bind(i18n),
    }),
    [locale, currency, ready, detectedCountry, changeLocale, changeCurrency],
  );

  if (!ready) {
    return (
      <div
        className="min-h-screen bg-[#0a0e1a] flex items-center justify-center"
        aria-busy="true"
        aria-label="Loading"
      />
    );
  }

  return (
    <LocaleContext.Provider value={value}>
      <DocumentMetaSync />
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
