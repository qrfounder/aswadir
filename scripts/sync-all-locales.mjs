#!/usr/bin/env node
/**
 * Merge extended keys into en.json, then build ar/th/zh/fr from English master + locale overrides.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "../src/i18n/locales");

function deepMerge(target, source) {
  const out = { ...target };
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v) && typeof target[k] === "object" && !Array.isArray(target[k])) {
      out[k] = deepMerge(target[k] || {}, v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

const extended = JSON.parse(fs.readFileSync(path.join(__dirname, "i18n-extended.json"), "utf8"));
const enBase = JSON.parse(fs.readFileSync(path.join(localesDir, "en.json"), "utf8"));
const masterEn = deepMerge(enBase, extended);
fs.writeFileSync(path.join(localesDir, "en.json"), JSON.stringify(masterEn, null, 2) + "\n");

const arOverrides = JSON.parse(fs.readFileSync(path.join(__dirname, "locale-overrides/ar.json"), "utf8"));
const thOverrides = JSON.parse(fs.readFileSync(path.join(__dirname, "locale-overrides/th.json"), "utf8"));
const zhOverrides = JSON.parse(fs.readFileSync(path.join(__dirname, "locale-overrides/zh.json"), "utf8"));
const frOverrides = JSON.parse(fs.readFileSync(path.join(__dirname, "locale-overrides/fr.json"), "utf8"));

for (const [code, overrides] of [
  ["ar", arOverrides],
  ["th", thOverrides],
  ["zh", zhOverrides],
  ["fr", frOverrides],
]) {
  const merged = deepMerge(masterEn, overrides);
  fs.writeFileSync(path.join(localesDir, `${code}.json`), JSON.stringify(merged, null, 2) + "\n");
}

console.log("Locales synced: en, ar, th, zh, fr");
