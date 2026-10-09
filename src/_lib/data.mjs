/**
 * Site data loader. Populates globalThis.__SITE__ so that page modules can be
 * plain scripts that share one context. Paths resolve from the project root.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

const readJSON = (p) => JSON.parse(readFileSync(p, "utf8"));

const site = readJSON(join(ROOT, "src", "_data", "site.json"));

/* Content is authored in two parts: the seven drafts prepared for review, and
   the pages adapted from Dr Sutherland's original site content. They are
   concatenated, then ordered to match a sensible clinical reading order. */
const CONDITIONS_ORDER = [
  "colon-cancer",
  "rectal-cancer",
  "diverticular-disease",
  "crohns-disease",
  "ulcerative-colitis",
  "haemorrhoids",
  "anal-fissure",
  "anal-abscess-and-fistula",
  "pilonidal-sinus",
];

const bySlug = (a, b) => {
  const ia = CONDITIONS_ORDER.indexOf(a.slug);
  const ib = CONDITIONS_ORDER.indexOf(b.slug);
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
};

const conditions = [
  ...(readJSON(join(ROOT, "content", "conditions.json")).conditions || []),
  ...(readJSON(join(ROOT, "content", "conditions-cancer.json")) || []),
].sort(bySlug);

const procedures = readJSON(join(ROOT, "content", "procedures.json")).procedures || [];

export { ROOT, site, procedures, conditions };

globalThis.__SITE__ = { ROOT, site, procedures, conditions };
