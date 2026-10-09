/**
 * Full-site audit: internal links, WCAG 2.2 AA proxies, colour contrast,
 * text-spacing resilience, and reduced-motion behaviour.
 *
 *   node src/_lib/audit.mjs
 */

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, extname, normalize, relative } from "node:path";

const ROOT = process.cwd();
const PORT = 4175;

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".webp": "image/webp", ".json": "application/json",
};

const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const f = join(ROOT, normalize(p));
  if (!existsSync(f) || statSync(f).isDirectory()) {
    res.writeHead(404); res.end("nf"); return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
  res.end(await readFile(f));
});
await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
const base = `http://127.0.0.1:${PORT}`;

/* Discover every built page from the filesystem. */
function findPages(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    // Skip build output and tooling dirs: dist/ is a base-prefixed artifact
    // verified by src/_lib/verify.py, not a root-served page.
    if (e.name.startsWith("_") || e.name === "node_modules" || e.name === "qa-shots"
        || e.name === "dist" || e.name === ".git") continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) findPages(full, acc);
    else if (e.name === "index.html") {
      acc.push("/" + relative(ROOT, dir).replace(/\\/g, "/") + (dir === ROOT ? "" : "/"));
    }
  }
  return acc;
}
const pages = findPages(ROOT).map((p) => p.replace("//", "/"));
const urls = [...new Set(pages)].sort();

const { chromium } = await import("playwright");
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

const problems = [];
const seenLinks = new Set();

/* ---------------------------------------------------------------- contrast */
function srgb(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function lum(rgb) { return 0.2126 * srgb(rgb[0]) + 0.7152 * srgb(rgb[1]) + 0.0722 * srgb(rgb[2]); }
function ratio(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
function parseRGB(s) {
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
  if (p.length >= 4 && p[3] < 0.95) return null; // translucent: skip, layered
  return [p[0], p[1], p[2]];
}

console.log(`Auditing ${urls.length} pages\n`);

for (const url of urls) {
  const resp = await page.goto(base + url, { waitUntil: "networkidle" });

  /* --- internal links resolve --- */
  const links = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
  for (const href of links) {
    if (!href || href.startsWith("http") || href.startsWith("mailto:") ||
        href.startsWith("tel:") || href.startsWith("#")) continue;
    const clean = href.split("#")[0];
    if (!clean || seenLinks.has(clean)) continue;
    seenLinks.add(clean);
    const r = await fetch(base + clean, { method: "GET" });
    if (!r.ok) problems.push(`[link] ${url} → ${clean} returns ${r.status}`);
  }

  /* --- WCAG proxies --- */
  const audit = await page.evaluate(() => {
    const out = {};
    const de = document.documentElement;
    out.overflow = de.scrollWidth - de.clientWidth;
    out.h1 = document.querySelectorAll("h1").length;
    out.lang = de.getAttribute("lang");
    out.viewport = document.querySelector('meta[name="viewport"]')?.getAttribute("content") || "";
    // aria-hidden must not contain focusable content
    out.hiddenFocusable = [];
    document.querySelectorAll('[aria-hidden="true"]').forEach((el) => {
      if (el.querySelector("a[href],button,input,select,textarea")) {
        out.hiddenFocusable.push(el.tagName + "." + (el.className || ""));
      }
    });
    // unnamed interactive elements
    out.unnamed = [];
    document.querySelectorAll("a[href],button").forEach((el) => {
      const name = (el.textContent || "").trim() ||
        el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") ||
        el.querySelector("img[alt]")?.getAttribute("alt");
      if (!name) out.unnamed.push(el.outerHTML.slice(0, 70));
    });
    // tap targets smaller than 24x24 (excluding inline text links)
    out.smallTargets = [];
    document.querySelectorAll("button, .btn, .icon-btn, .nav__link, .nav-sheet__link, summary").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.width < 24 || r.height < 24)) {
        out.smallTargets.push(`${el.tagName}.${(el.className || "").slice(0, 24)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    });
    // images without alt
    out.noAlt = [...document.querySelectorAll("img:not([alt])")].map((i) => i.src);
    // iframes need a title
    out.iframesNoTitle = [...document.querySelectorAll("iframe:not([title])")].length;
    // heading order
    const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => +h.tagName[1]);
    out.skips = [];
    for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) out.skips.push(`${hs[i - 1]}→${hs[i]}`);
    return out;
  });

  if (audit.overflow > 1) problems.push(`[reflow] ${url} overflows by ${audit.overflow}px`);
  if (audit.h1 !== 1) problems.push(`[h1] ${url} has ${audit.h1}`);
  if (audit.lang !== "en-AU") problems.push(`[lang] ${url} lang=${audit.lang}`);
  if (/maximum-scale|user-scalable\s*=\s*no/.test(audit.viewport))
    problems.push(`[zoom] ${url} blocks zoom: ${audit.viewport}`);
  if (audit.hiddenFocusable.length)
    problems.push(`[aria-hidden] ${url} ${JSON.stringify(audit.hiddenFocusable)}`);
  if (audit.unnamed.length) problems.push(`[name] ${url} ${JSON.stringify(audit.unnamed)}`);
  if (audit.smallTargets.length) problems.push(`[target] ${url} ${JSON.stringify(audit.smallTargets)}`);
  if (audit.noAlt.length) problems.push(`[alt] ${url} ${JSON.stringify(audit.noAlt)}`);
  if (audit.iframesNoTitle) problems.push(`[iframe] ${url} ${audit.iframesNoTitle} without title`);
  if (audit.skips.length) problems.push(`[heading] ${url} skips ${JSON.stringify(audit.skips)}`);

  /* --- contrast of body text and muted text on the page background --- */
  const colours = await page.evaluate(() => {
    function bgOf(el) {
      let n = el;
      while (n && n !== document.documentElement) {
        const bg = getComputedStyle(n).backgroundColor;
        if (bg && !/rgba?\([^)]*,\s*0\)/.test(bg) && bg !== "transparent") return bg;
        n = n.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    }
    const samples = [];
    const push = (label, el) => {
      if (!el) return;
      const cs = getComputedStyle(el);
      samples.push({
        label,
        fg: cs.color,
        bg: bgOf(el),
        size: parseFloat(cs.fontSize),
        weight: parseInt(cs.fontWeight, 10) || 400,
      });
    };
    push("body", document.querySelector(".lede") || document.querySelector("p"));
    push("prose p", document.querySelector(".prose p"));
    push("muted", document.querySelector(".muted"));
    push("small subtle", document.querySelector(".small.subtle") || document.querySelector(".subtle"));
    push("card text", document.querySelector(".link-card__text"));
    push("facts", document.querySelector(".facts li"));
    push("risk detail", document.querySelector(".risk__detail"));
    push("crumb", document.querySelector(".crumbs a"));
    push("nav link", document.querySelector(".nav__link"));
    push("group label", document.querySelector(".group-label"));
    push("footer link", document.querySelector(".footer a"));
    push("callout p", document.querySelector(".callout p"));
    push("table cell", document.querySelector(".prose td"));
    return samples.filter((s) => s.fg && s.bg);
  });

  for (const s of colours) {
    const fg = parseRGB(s.fg), bg = parseRGB(s.bg);
    if (!fg || !bg) continue;
    const large = s.size >= 24 || (s.size >= 18.66 && s.weight >= 700);
    const need = large ? 3 : 4.5;
    const r = ratio(fg, bg);
    if (r < need) {
      problems.push(
        `[contrast] ${url} ${s.label}: ${r.toFixed(2)}:1 (need ${need}) fg=${s.fg} bg=${s.bg} size=${s.size}`,
      );
    }
  }
}

/* --------------------------------------------- text-spacing override (1.4.12) */
{
  await page.goto(base + "/conditions/haemorrhoids/", { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `* { line-height: 1.5 !important; letter-spacing: 0.12em !important;
                  word-spacing: 0.16em !important; }
              p { margin-bottom: 2em !important; }`,
  });
  const clipped = await page.evaluate(() =>
    [...document.querySelectorAll(".prose p, .facts li, .risk, .callout, h1, h2, h3")]
      .filter((el) => el.scrollHeight > el.clientHeight + 2 && getComputedStyle(el).overflow !== "visible")
      .map((el) => el.tagName + "." + (el.className || "").slice(0, 30)),
  );
  if (clipped.length) problems.push(`[spacing] content clipped: ${JSON.stringify(clipped)}`);
  console.log("text-spacing override: ok");
}

/* --------------------------------------------------- reduced motion honoured */
{
  const rmCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const p2 = await rmCtx.newPage();
  await p2.goto(base + "/", { waitUntil: "networkidle" });
  const still = await p2.evaluate(() => {
    const dur = [];
    document.querySelectorAll(".reveal, .btn, .link-card, .nav-sheet__panel").forEach((el) => {
      const cs = getComputedStyle(el);
      dur.push(cs.transitionDuration);
    });
    const hidden = [...document.querySelectorAll(".reveal")].filter(
      (el) => getComputedStyle(el).opacity === "0",
    ).length;
    return { dur, hidden };
  });
  // With reduced motion, reveal elements must already be visible.
  if (still.hidden) problems.push(`[reduced-motion] ${still.hidden} reveal elements left at opacity 0`);
  console.log(`reduced motion: ${still.hidden} hidden reveal elements`);
  await rmCtx.close();
}

await browser.close();
server.close();

console.log("\n===== FINDINGS =====");
if (!problems.length) console.log("No issues found.\n");
else {
  const grouped = {};
  for (const p of problems) {
    const k = p.slice(1, p.indexOf("]"));
    grouped[k] = grouped[k] || [];
    grouped[k].push(p);
  }
  for (const [k, list] of Object.entries(grouped)) {
    console.log(`\n-- ${k} (${list.length})`);
    list.slice(0, 12).forEach((l) => console.log("   " + l));
    if (list.length > 12) console.log(`   ... and ${list.length - 12} more`);
  }
  console.log("");
}
