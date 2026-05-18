/**
 * E.164 dial codes (sovereign states + common territories).
 * @typedef {{ iso: string; dial: string; min: number; max: number }} PhoneDialCountry
 */

/** @type {Record<string, [dialWithoutPlus, minDigits, maxDigits]>} */
const RAW = {
  AD: ["376", 6, 9],
  AE: ["971", 9, 9],
  AF: ["93", 9, 9],
  AG: ["1268", 7, 10],
  AI: ["1264", 7, 10],
  AL: ["355", 8, 9],
  AM: ["374", 8, 8],
  AO: ["244", 9, 9],
  AR: ["54", 10, 10],
  AS: ["1684", 7, 10],
  AT: ["43", 9, 13],
  AU: ["61", 9, 9],
  AW: ["297", 7, 7],
  AZ: ["994", 9, 9],
  BA: ["387", 8, 8],
  BB: ["1246", 7, 10],
  BD: ["880", 10, 10],
  BE: ["32", 9, 9],
  BF: ["226", 8, 8],
  BG: ["359", 8, 9],
  BH: ["973", 8, 8],
  BI: ["257", 8, 8],
  BJ: ["229", 8, 8],
  BM: ["1441", 7, 10],
  BN: ["673", 7, 7],
  BO: ["591", 8, 8],
  BR: ["55", 10, 11],
  BS: ["1242", 7, 10],
  BT: ["975", 8, 8],
  BW: ["267", 7, 8],
  BY: ["375", 9, 9],
  BZ: ["501", 7, 7],
  CA: ["1", 10, 10],
  CD: ["243", 9, 9],
  CF: ["236", 8, 8],
  CG: ["242", 9, 9],
  CH: ["41", 9, 9],
  CI: ["225", 8, 10],
  CK: ["682", 5, 5],
  CL: ["56", 9, 9],
  CM: ["237", 9, 9],
  CN: ["86", 11, 11],
  CO: ["57", 10, 10],
  CR: ["506", 8, 8],
  CU: ["53", 8, 8],
  CV: ["238", 7, 7],
  CY: ["357", 8, 8],
  CZ: ["420", 9, 9],
  DE: ["49", 10, 11],
  DJ: ["253", 8, 8],
  DK: ["45", 8, 8],
  DM: ["1767", 7, 10],
  DO: ["1809", 7, 10],
  DZ: ["213", 9, 9],
  EC: ["593", 9, 9],
  EE: ["372", 7, 8],
  EG: ["20", 10, 10],
  ER: ["291", 7, 7],
  ES: ["34", 9, 9],
  ET: ["251", 9, 9],
  FI: ["358", 9, 10],
  FJ: ["679", 7, 7],
  FK: ["500", 5, 5],
  FM: ["691", 7, 7],
  FO: ["298", 6, 6],
  FR: ["33", 9, 9],
  GA: ["241", 8, 8],
  GB: ["44", 10, 10],
  GD: ["1473", 7, 10],
  GE: ["995", 9, 9],
  GF: ["594", 9, 9],
  GH: ["233", 9, 9],
  GI: ["350", 8, 8],
  GL: ["299", 6, 6],
  GM: ["220", 7, 7],
  GN: ["224", 9, 9],
  GP: ["590", 9, 9],
  GQ: ["240", 9, 9],
  GR: ["30", 10, 10],
  GT: ["502", 8, 8],
  GU: ["1671", 7, 10],
  GW: ["245", 7, 7],
  GY: ["592", 7, 7],
  HK: ["852", 8, 8],
  HN: ["504", 8, 8],
  HR: ["385", 8, 9],
  HT: ["509", 8, 8],
  HU: ["36", 9, 9],
  ID: ["62", 9, 12],
  IE: ["353", 9, 9],
  IL: ["972", 9, 9],
  IN: ["91", 10, 10],
  IQ: ["964", 10, 10],
  IR: ["98", 10, 10],
  IS: ["354", 7, 9],
  IT: ["39", 9, 10],
  JM: ["1876", 7, 10],
  JO: ["962", 9, 9],
  JP: ["81", 10, 10],
  KE: ["254", 9, 9],
  KG: ["996", 9, 9],
  KH: ["855", 8, 9],
  KI: ["686", 5, 8],
  KM: ["269", 7, 7],
  KN: ["1869", 7, 10],
  KP: ["850", 8, 10],
  KR: ["82", 9, 10],
  KW: ["965", 8, 8],
  KY: ["1345", 7, 10],
  KZ: ["7", 10, 10],
  LA: ["856", 8, 10],
  LB: ["961", 7, 8],
  LC: ["1758", 7, 10],
  LI: ["423", 7, 9],
  LK: ["94", 9, 9],
  LR: ["231", 7, 8],
  LS: ["266", 8, 8],
  LT: ["370", 8, 8],
  LU: ["352", 9, 9],
  LV: ["371", 8, 8],
  LY: ["218", 9, 9],
  MA: ["212", 9, 9],
  MC: ["377", 8, 9],
  MD: ["373", 8, 8],
  ME: ["382", 8, 8],
  MG: ["261", 9, 9],
  MH: ["692", 7, 7],
  MK: ["389", 8, 8],
  ML: ["223", 8, 8],
  MM: ["95", 8, 10],
  MN: ["976", 8, 8],
  MO: ["853", 8, 8],
  MP: ["1670", 7, 10],
  MQ: ["596", 9, 9],
  MR: ["222", 8, 8],
  MS: ["1664", 7, 10],
  MT: ["356", 8, 8],
  MU: ["230", 8, 8],
  MV: ["960", 7, 7],
  MW: ["265", 9, 9],
  MX: ["52", 10, 10],
  MY: ["60", 9, 10],
  MZ: ["258", 9, 9],
  NA: ["264", 9, 9],
  NC: ["687", 6, 6],
  NE: ["227", 8, 8],
  NG: ["234", 10, 10],
  NI: ["505", 8, 8],
  NL: ["31", 9, 9],
  NO: ["47", 8, 8],
  NP: ["977", 10, 10],
  NR: ["674", 7, 7],
  NU: ["683", 4, 4],
  NZ: ["64", 8, 10],
  OM: ["968", 8, 8],
  PA: ["507", 8, 8],
  PE: ["51", 9, 9],
  PF: ["689", 8, 8],
  PG: ["675", 8, 8],
  PH: ["63", 10, 10],
  PK: ["92", 10, 10],
  PL: ["48", 9, 9],
  PR: ["1", 10, 10],
  PS: ["970", 9, 9],
  PT: ["351", 9, 9],
  PW: ["680", 7, 7],
  PY: ["595", 9, 9],
  QA: ["974", 8, 8],
  RE: ["262", 9, 9],
  RO: ["40", 9, 9],
  RS: ["381", 8, 9],
  RU: ["7", 10, 10],
  RW: ["250", 9, 9],
  SA: ["966", 9, 9],
  SB: ["677", 7, 7],
  SC: ["248", 7, 7],
  SD: ["249", 9, 9],
  SE: ["46", 9, 10],
  SG: ["65", 8, 8],
  SI: ["386", 8, 8],
  SK: ["421", 9, 9],
  SL: ["232", 8, 8],
  SM: ["378", 8, 10],
  SN: ["221", 9, 9],
  SO: ["252", 8, 9],
  SR: ["597", 7, 7],
  SS: ["211", 9, 9],
  ST: ["239", 7, 7],
  SV: ["503", 8, 8],
  SY: ["963", 9, 9],
  SZ: ["268", 8, 8],
  TD: ["235", 8, 8],
  TG: ["228", 8, 8],
  TH: ["66", 9, 9],
  TJ: ["992", 9, 9],
  TL: ["670", 8, 8],
  TM: ["993", 8, 8],
  TN: ["216", 8, 8],
  TO: ["676", 5, 7],
  TR: ["90", 10, 10],
  TT: ["1868", 7, 10],
  TV: ["688", 5, 6],
  TW: ["886", 9, 9],
  TZ: ["255", 9, 9],
  UA: ["380", 9, 9],
  UG: ["256", 9, 9],
  US: ["1", 10, 10],
  UY: ["598", 8, 8],
  UZ: ["998", 9, 9],
  VA: ["39", 9, 10],
  VC: ["1784", 7, 10],
  VE: ["58", 10, 10],
  VG: ["1284", 7, 10],
  VI: ["1340", 7, 10],
  VN: ["84", 9, 10],
  VU: ["678", 5, 7],
  WS: ["685", 5, 7],
  XK: ["383", 8, 8],
  YE: ["967", 9, 9],
  ZA: ["27", 9, 9],
  ZM: ["260", 9, 9],
  ZW: ["263", 9, 9],
};

/** Shown first in the dropdown (Massar markets + neighbors). */
export const POPULAR_DIAL_ISOS = [
  "SA",
  "AE",
  "US",
  "TH",
  "EG",
  "KW",
  "QA",
  "BH",
  "OM",
  "JO",
  "LB",
  "MA",
  "GB",
  "IN",
  "PK",
  "FR",
  "DE",
  "TR",
  "SG",
  "MY",
  "ID",
  "PH",
  "AU",
  "CA",
];

const LOCALE_DEFAULT_ISO = { ar: "SA", th: "TH", en: "US" };

/** @type {PhoneDialCountry[]} */
export const PHONE_DIAL_COUNTRIES = Object.entries(RAW).map(([iso, [dial, min, max]]) => ({
  iso,
  dial: `+${dial}`,
  min,
  max,
}));

const BY_ISO = Object.fromEntries(PHONE_DIAL_COUNTRIES.map((c) => [c.iso, c]));

/** @param {string} iso */
export function getDialCountry(iso) {
  return BY_ISO[iso] || BY_ISO.SA;
}

/**
 * @param {string | undefined} locale
 * @param {string | null | undefined} detectedCountry
 */
export function getDefaultDialIso(locale, detectedCountry) {
  if (detectedCountry && BY_ISO[detectedCountry]) return detectedCountry;
  const loc = locale?.split("-")[0] || "en";
  return LOCALE_DEFAULT_ISO[loc] || "SA";
}

/** @param {string} iso */
export function flagEmoji(iso) {
  if (!iso || iso.length !== 2) return "🌐";
  return String.fromCodePoint(
    ...[...iso.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)),
  );
}

/**
 * @param {string} iso
 * @param {string} locale BCP-47
 */
export function countryLabel(iso, locale = "en") {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(iso) || iso;
  } catch {
    return iso;
  }
}

/**
 * @param {string} iso
 * @param {string} digits National number (no country code)
 */
export function validateNationalNumber(iso, digits) {
  const c = getDialCountry(iso);
  if (!/^[0-9]+$/.test(digits)) return false;
  return digits.length >= c.min && digits.length <= c.max;
}

/**
 * @param {string} locale
 * @returns {{ popular: Array<PhoneDialCountry & { label: string; flag: string }>; all: Array<PhoneDialCountry & { label: string; flag: string }> }}
 */
export function getDialOptions(locale) {
  const enrich = (c) => ({
    ...c,
    flag: flagEmoji(c.iso),
    label: countryLabel(c.iso, locale),
  });

  const popularSet = new Set(POPULAR_DIAL_ISOS);
  const popular = POPULAR_DIAL_ISOS.filter((iso) => BY_ISO[iso]).map((iso) => enrich(BY_ISO[iso]));

  const all = PHONE_DIAL_COUNTRIES.filter((c) => !popularSet.has(c.iso))
    .map(enrich)
    .sort((a, b) => a.label.localeCompare(b.label, locale));

  return { popular, all };
}
