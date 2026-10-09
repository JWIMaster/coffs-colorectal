/* Formatting regression suite.
   Checks rendered formatting rather than source, across every page and both
   themes. Every assertion here exists because a real defect shipped without it:
   a missing heading marker, a clipped icon, a card with no contrast against the
   page, a grid leaving a dead column. */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { chromium } from "playwright";

const ROOT = process.cwd();
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".webp": "image/webp", ".woff2": "font/woff2" };

const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const f = join(ROOT, p);
  if (!existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "text/plain" });
  res.end(await readFile(f));
});
const PORT = 4399;
await new Promise((r) => server.listen(PORT, "127.0.0.1", r));

function pages() {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d)) {
      if (e === "node_modules" || e.startsWith(".") || e === "dist" || e === "qa-shots") continue;
      const f = join(d, e);
      if (statSync(f).isDirectory()) walk(f);
      else if (e === "index.html") out.push("/" + relative(ROOT, f).replace(/index\.html$/, ""));
    }
  };
  walk(ROOT);
  return out.sort();
}

const lum = ([r, g, b]) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const l1 = lum(a), l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};
const rgb = (s) => (s.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);

const findings = [];
const add = (page, theme, kind, detail) => findings.push({ page, theme, kind, detail });

const browser = await chromium.launch();
const list = pages();
for (const theme of ["light", "dark"]) {
  for (const width of [390, 768, 1280, 1440]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    for (const url of list) {
      await page.goto(`http://127.0.0.1:${PORT}${url}`, { waitUntil: "networkidle" });
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
      await page.evaluate(async () => { await document.fonts.ready; });
      const r = await page.evaluate(() => {
        const out = { markers: [], clipped: [], lowCard: [], deadGrid: [], overflow: 0, squashed: [] };
        out.overflow = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);

        // Heading markers: every h2 inside a prose block must show its rule.
        document.querySelectorAll("main .prose h2").forEach((h, i) => {
          const cs = getComputedStyle(h, "::before");
          const shown = cs.content !== "" && cs.content !== "none" && cs.display !== "none" &&
                        parseFloat(cs.width) > 0 && cs.backgroundColor !== "rgba(0, 0, 0, 0)";
          if (!shown) out.markers.push(`${i}:${h.textContent.trim().slice(0, 34)}`);
        });

        // Nothing should be clipped to a sliver inside a control.
        document.querySelectorAll("main svg, main img, main .btn").forEach((e) => {
          const b = e.getBoundingClientRect();
          if (b.width === 0 && b.height === 0) return;
          if (e.closest(".sr-only")) return;
          const ar = b.width / (b.height || 1);
          if (b.width < 8 || b.height < 8) out.clipped.push(`${e.tagName}.${e.className} ${Math.round(b.width)}x${Math.round(b.height)}`);
          else if (e.tagName === "svg" && (ar > 2.4 || ar < 0.42)) out.clipped.push(`svg aspect ${ar.toFixed(2)} ${Math.round(b.width)}x${Math.round(b.height)}`);
          if (e.tagName === "IMG" && e.naturalWidth) {
            const nat = e.naturalWidth / e.naturalHeight;
            if (Math.abs(nat - ar) > 0.06) out.squashed.push(`img ${nat.toFixed(2)} vs ${ar.toFixed(2)}`);
          }
        });

        // Cards must be distinguishable from the page they sit on.
        const pageBg = (() => { let e = document.querySelector("main"); while (e) {
          const bg = getComputedStyle(e).backgroundColor;
          if (bg && bg !== "rgba(0, 0, 0, 0)") return bg; e = e.parentElement; } return "rgb(255,255,255)"; })();
        document.querySelectorAll("main .risk, main .facts li, main .panel, main .card").forEach((c) => {
          const cs = getComputedStyle(c);
          const bg = cs.backgroundColor;
          if (!bg || bg === "rgba(0, 0, 0, 0)") return;
          const contrast = (() => {
            const L = ([r,g,b]) => { const f=v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4;}; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
            const l1 = L(bg.match(/\d+/g).slice(0,3).map(Number));
            const l2 = L(pageBg.match(/\d+/g).slice(0,3).map(Number));
            return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
          })();
          const borderShown = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopColor !== bg;
          if (contrast < 1.06 && !borderShown)
            out.lowCard.push(`${c.className.split(" ")[0]} bg ${bg} on ${pageBg}`);
        });

        // A grid should not leave a column of empty space beside short content.
        // Threshold is a ratio as well as an absolute: two columns of naturally
        // different length (a form beside details) are fine, but one column
        // running several times the other means the grid is the wrong shape.
        document.querySelectorAll("main .grid--2").forEach((g) => {
          const kids = [...g.children].filter((k) => k.getBoundingClientRect().height > 20);
          if (kids.length < 2) return;
          const hs = kids.map((k) => k.getBoundingClientRect().height);
          const dead = Math.max(...hs) - Math.min(...hs);
          const worseOff = Math.max(...hs) / Math.max(1, Math.min(...hs));
          if (dead > 600 || worseOff > 2.2)
            out.deadGrid.push(`${g.className} dead ${Math.round(dead)}px (${worseOff.toFixed(1)}x)`);
        });
        return out;
      });

      const at = `${url} @${width} [${theme}]`;
      if (r.overflow > 1) add(at, theme, "overflow", `${r.overflow}px`);
      for (const m of r.markers) add(at, theme, "missing heading marker", m);
      for (const c of r.clipped) add(at, theme, "clipped/deformed element", c);
      for (const s of r.squashed) add(at, theme, "squashed image", s);
      for (const l of r.lowCard) add(at, theme, "card indistinguishable from page", l);
      for (const d of r.deadGrid) add(at, theme, "dead column", d);
    }
    await ctx.close();
  }
}
await browser.close();
server.close();

console.log(`\n  ${list.length} pages x 2 themes x 4 widths = ${list.length * 8} renders`);
if (!findings.length) {
  console.log("\n  No formatting problems found.\n");
  process.exit(0);
}
const byKind = {};
for (const f of findings) (byKind[f.kind] = byKind[f.kind] || []).push(f);
console.log("\n===== FINDINGS =====");
for (const [kind, items] of Object.entries(byKind)) {
  console.log(`\n  ${kind}: ${items.length}`);
  for (const i of items.slice(0, 12)) console.log(`    ${i.page}\n        ${i.detail}`);
  if (items.length > 12) console.log(`    ... and ${items.length - 12} more`);
}
console.log();
process.exit(1);
