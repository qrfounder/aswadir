import { countryFromRequestHeaders } from "./request-geo.js";

const COUNTRY_TO_CURRENCY = {
  SA: "SAR",
  AE: "AED",
  KW: "KWD",
  QA: "QAR",
  BH: "AED",
  OM: "AED",
  MA: "MAD",
  EG: "EGP",
  TH: "THB",
  US: "USD",
  GB: "USD",
  CA: "USD",
  AU: "USD",
  DE: "USD",
  ES: "USD",
  IN: "USD",
  PK: "USD",
  CN: "USD",
  TW: "USD",
  HK: "USD",
  SG: "USD",
  FR: "USD",
  JO: "USD",
  LB: "USD",
};

const LOCALE_DEFAULT_CURRENCY = { ar: "SAR", th: "THB", en: "USD" };

const COUNTRY_TO_LOCALE = {
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

function normalizeLocale(code) {
  if (!code) return "en";
  const lower = String(code).toLowerCase().split("-")[0];
  if (["en", "ar", "th"].includes(lower)) return lower;
  return "en";
}

function localeFromAcceptLanguage(header) {
  if (!header) return null;
  for (const part of String(header).split(",")) {
    const tag = part.split(";")[0].trim();
    if (tag) return normalizeLocale(tag);
  }
  return null;
}

/** GET /api/locale/detect — suggest locale from IP country + Accept-Language */
export function handleLocaleDetect(req, res) {
  const country = countryFromRequestHeaders(req);
  const fromCountry = country && COUNTRY_TO_LOCALE[country];
  const fromHeader = localeFromAcceptLanguage(req.headers["accept-language"]);

  const locale = normalizeLocale(fromCountry || fromHeader || "en");
  const suggestedCurrency =
    (country && COUNTRY_TO_CURRENCY[country]) || LOCALE_DEFAULT_CURRENCY[locale] || "USD";

  res.setHeader("Cache-Control", "private, max-age=3600");
  res.status(200).json({
    locale,
    currency: suggestedCurrency,
    country: country || null,
    source: fromCountry ? "ip" : fromHeader ? "browser" : "default",
    supported: ["en", "ar", "th"],
    currencies: ["SAR", "AED", "USD", "THB", "MAD", "KWD", "QAR", "EGP"],
  });
}
