/**
 * Coffs Colorectal Surgery — static site build
 *
 *   node build.mjs                       # build into the project root
 *   node build.mjs --base=/repo-name     # for GitHub Pages project hosting
 *   node build.mjs --out=dist            # clean output for publishing
 *
 * Reads JSON content and HTML partials, renders every page, and writes a
 * complete static site. No dependencies, no network.
 */

import {
  writeFileSync,
  rmSync,
  mkdirSync,
  readdirSync,
  copyFileSync,
  existsSync,
} from "node:fs";
import { join, relative } from "node:path";
import {
  built,
  ROOT,
  SRC,
  OUT,
  BASE,
  site,
  procedures,
  conditions,
} from "./src/_lib/render.mjs";

/* ---------------------------------------------------------------- output dir */

// Remove a stale build when writing to a dedicated directory, so that deleted
// pages do not linger in the published artifact.
if (OUT !== ROOT) {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
} else {
  rmSync(join(OUT, "index.html"), { force: true });
}
if (OUT !== ROOT) rmSync(join(ROOT, "index.html"), { force: true });

/* -------------------------------------------------------------- static files */

/** Publish genuinely separate files (the favicon, .nojekyll). The stylesheet
 *  and script are inlined into every page, so they are skipped. */
function copyDir(from, to, skip = []) {
  let count = 0;
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    if (skip.includes(entry.name)) continue;
    const src = join(from, entry.name);
    const dest = join(to, entry.name);
    if (entry.isDirectory()) {
      mkdirSync(dest, { recursive: true });
      count += copyDir(src, dest, []);
    } else {
      copyFileSync(src, dest);
      count += 1;
    }
  }
  return count;
}

let assetCount = 0;
for (const entry of readdirSync(join(SRC, "assets"), { withFileTypes: true })) {
  if (entry.name === "css" || entry.name === "js") continue; // inlined into pages
  const from = join(SRC, "assets", entry.name);
  const to = join(OUT, "assets", entry.name);
  if (entry.isDirectory()) {
    mkdirSync(to, { recursive: true });
    assetCount += copyDir(from, to);
  } else {
    mkdirSync(join(OUT, "assets"), { recursive: true });
    copyFileSync(from, to);
    assetCount += 1;
  }
}

// Images live at the project root and are referenced by the pages.
if (existsSync(join(ROOT, "media"))) {
  mkdirSync(join(OUT, "media"), { recursive: true });
  assetCount += copyDir(join(ROOT, "media"), join(OUT, "media"));
}

// .nojekyll tells GitHub Pages to serve the files as-is, without Jekyll.
writeFileSync(join(OUT, ".nojekyll"), "");

/* -------------------------------------------------------------------- render */

const core = await import("./src/_pages/core.mjs");
const clinical = await import("./src/_pages/clinical.mjs");
const visit = await import("./src/_pages/visit.mjs");
const about = await import("./src/_pages/about.mjs");

core.render();
clinical.render();
visit.render();
about.render();

/* -------------------------------------------------------------------- report */

writeFileSync(
  join(OUT, "build-report.json"),
  JSON.stringify(
    {
      generated: new Date().toISOString(),
      base: BASE || "/",
      output: relative(ROOT, OUT) || ".",
      pageCount: built.length,
      assetsCopied: assetCount,
      counts: { procedures: procedures.length, conditions: conditions.length },
      pages: built,
    },
    null,
    2,
  ),
);

console.log(
  `\n  Built ${built.length} pages, ${assetCount} files copied` +
    `\n  base: ${BASE || "/"}   output: ${relative(ROOT, OUT) || "."}\n`,
);
for (const p of built) {
  console.log(`  ${p.url.padEnd(52)} ${String(p.bytes).padStart(7)} B`);
}
console.log("");
