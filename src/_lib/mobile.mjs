/**
 * Mobile QA harness.
 *
 * Runs every built page at the widths real phones and small tablets report, and
 * measures the things that make a layout feel squashed rather than merely
 * narrow: horizontal overflow, elements wider than the viewport, text clipped
 * by a fixed height, distorted images, images that overflow their box, text
 * with no room around it, and tap targets that fall below the minimum.
 *
 *   node src/_lib/mobile.mjs [--shots]
 */

import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, extname, normalize, relative } from "node:path";

const ROOT = process.cwd();
const PORT = 4190;
const TAKE_SHOTS = process.argv.includes("--shots");

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".webp": "image/webp", ".woff2": "font/woff2", ".json": "application/json",
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

/* Every built page. */
function findPages(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
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
const allPages = [...new Set(findPages(ROOT).map((p) => p.replace("//", "/")))].sort();

/* One page per distinct layout template. The rest reuse the same markup, so
   scanning all of them adds runtime without adding coverage. */
const TEMPLATES = [
  "/",                                        // hero + routemap + figure
  "/conditions/",                             // editorial index
  "/procedures/",                             // editorial index (long)
  "/conditions/haemorrhoids/",                // clinical: facts, risks, FAQ
  "/procedures/colonoscopy/",                 // clinical (longest)
  "/your-visit/bowel-preparation/",           // long prose
  "/your-visit/fees/",                        // prose + panel
  "/contact-us/",                             // form + map + two columns
  "/dr-andrew-sutherland/",                   // portrait figure + definition list
  "/resources/",                              // grouped indexes
  "/privacy/",                                // longest prose
];
const pages = TEMPLATES.filter((p) => allPages.includes(p));

/* Real reported device widths, 320 up to the desktop breakpoint. */
const WIDTHS = [
  [320, "iPhone SE (1st) / smallest supported"],
  [360, "Common Android"],
  [375, "iPhone SE (2nd/3rd)"],
  [390, "iPhone 12-15"],
  [414, "iPhone Plus"],
  [430, "iPhone Pro Max"],
  [768, "iPad portrait"],
  [834, "iPad Air portrait"],
];

const { chromium } = await import("playwright");
const browser = await chromium.launch();
const problems = [];
const summary = [];

if (TAKE_SHOTS) await mkdir(join(ROOT, "qa-shots", "mobile"), { recursive: true });

for (const [width, label] of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width, height: 800 },
    deviceScaleFactor: 2,
    isMobile: width < 768,
    hasTouch: width < 768,
  });
  const page = await ctx.newPage();

  let worstOverflow = 0;
  for (const url of pages) {
    await page.goto(base + url, { waitUntil: "networkidle" });
    // Lazy images report naturalWidth 0 until decoded. Forcing them eager and
    // awaiting decode is far quicker than scrolling the page to trigger them.
    await page.evaluate(async () => {
      await document.fonts.ready;
      const pending = [];
      for (const img of document.images) {
        img.loading = "eager";
        if (!img.complete) pending.push(img.decode().catch(() => null));
      }
      await Promise.all(pending);
    });

    const audit = await page.evaluate((vw) => {
      const de = document.documentElement;
      const out = {
        overflow: de.scrollWidth - de.clientWidth,
        overflowers: [],
        distorted: [],
        overflowingImages: [],
        clippedText: [],
        tinyText: [],
        smallTargets: [],
        flushText: [],
      };

      /* Elements that stick out past the viewport. The closed navigation sheet
         lives off-screen by design, so it is excluded here and below. */
      const inDismissedSheet = (el) => {
        const sheet = el.closest("#nav-sheet");
        return sheet && sheet.getAttribute("data-open") !== "true";
      };
      document.querySelectorAll("body *").forEach((el) => {
        if (inDismissedSheet(el)) return;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        if (r.right > vw + 1.5 || r.left < -1.5) {
          const cs = getComputedStyle(el);
          if (cs.position === "fixed" && cs.visibility === "hidden") return;
          out.overflowers.push(
            `${el.tagName.toLowerCase()}.${String(el.className || "").split(" ").slice(0, 2).join(".")}`
            + ` [${Math.round(r.left)}..${Math.round(r.right)}]`,
          );
        }
      });

      /* Images: aspect distortion, or spilling out of their container. */
      document.querySelectorAll("img").forEach((img) => {
        const r = img.getBoundingClientRect();
        const cs = getComputedStyle(img);
        const nw = img.naturalWidth, nh = img.naturalHeight;
        if (nw && nh && r.width > 0 && r.height > 0 && cs.objectFit === "fill") {
          const rendered = r.width / r.height;
          const natural = nw / nh;
          const drift = Math.abs(rendered - natural) / natural;
          if (drift > 0.02) {
            out.distorted.push(
              `${img.getAttribute("src")?.split("/").pop()} rendered ${Math.round(r.width)}x${Math.round(r.height)}`
              + ` (${rendered.toFixed(2)}) vs natural ${nw}x${nh} (${natural.toFixed(2)})`,
            );
          }
        }
        if (r.right > vw + 1.5 || r.left < -1.5) {
          out.overflowingImages.push(`${img.getAttribute("src")?.split("/").pop()}`);
        }
        if (r.width > vw + 1.5) {
          out.overflowingImages.push(
            `${img.getAttribute("src")?.split("/").pop()} is ${Math.round(r.width)}px wide`,
          );
        }
      });

      /* Text clipped by a height the content cannot fit into. */
      document.querySelectorAll("h1,h2,h3,h4,p,li,dd,dt,span,a,summary,td,th").forEach((el) => {
        const cs = getComputedStyle(el);
        if (cs.overflow === "visible" && cs.overflowY === "visible") return;
        if (el.scrollHeight > el.clientHeight + 2 && el.clientHeight > 0) {
          out.clippedText.push(
            `${el.tagName.toLowerCase()}.${String(el.className || "").split(" ")[0]}`
            + ` ${el.scrollHeight}>${el.clientHeight}`,
          );
        }
      });

      /* Tap targets below the 24px minimum, and below the 44px comfort target. */
      document.querySelectorAll("a[href], button, summary, input, select, textarea, [role=button]").forEach((el) => {
        if (inDismissedSheet(el)) return;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        const cs = getComputedStyle(el);
        if (cs.display === "inline" && el.tagName === "A") return; // inline links exempt
        if (r.width < 24 || r.height < 24) {
          out.smallTargets.push(
            `${el.tagName.toLowerCase()} "${(el.textContent || "").trim().slice(0, 22)}"`
            + ` ${Math.round(r.width)}x${Math.round(r.height)}`,
          );
        }
      });

      /* Text running right up to the edge of the screen. */
      document.querySelectorAll("h1,h2,h3,p,li,dd,dt,td,th").forEach((el) => {
        if (inDismissedSheet(el)) return;
        const r = el.getBoundingClientRect();
        if (r.width === 0) return;
        if (r.left < 6 || r.right > vw - 6) {
          out.flushText.push(
            `${el.tagName.toLowerCase()} ${Math.round(r.left)}..${Math.round(r.right)}`,
          );
        }
      });

      out.overflowers = [...new Set(out.overflowers)].slice(0, 6);
      out.smallTargets = [...new Set(out.smallTargets)].slice(0, 6);
      out.flushText = [...new Set(out.flushText)].slice(0, 6);
      return out;
    }, width);

    worstOverflow = Math.max(worstOverflow, audit.overflow);

    if (audit.overflow > 1) {
      problems.push(`[overflow ${width}px] ${url} page scrolls sideways by ${audit.overflow}px ${JSON.stringify(audit.overflowers)}`);
    }
    if (audit.overflowers.length && audit.overflow <= 1) {
      problems.push(`[sticking out ${width}px] ${url} ${JSON.stringify(audit.overflowers)}`);
    }
    if (audit.distorted.length) problems.push(`[distorted ${width}px] ${url} ${JSON.stringify(audit.distorted)}`);
    if (audit.overflowingImages.length) problems.push(`[image ${width}px] ${url} ${JSON.stringify(audit.overflowingImages)}`);
    if (audit.clippedText.length) problems.push(`[clipped ${width}px] ${url} ${JSON.stringify(audit.clippedText)}`);
    if (audit.smallTargets.length) problems.push(`[target ${width}px] ${url} ${JSON.stringify(audit.smallTargets)}`);
    if (audit.flushText.length) problems.push(`[flush ${width}px] ${url} ${JSON.stringify(audit.flushText)}`);

    if (TAKE_SHOTS && ["/", "/conditions/haemorrhoids/", "/procedures/colonoscopy/", "/your-visit/bowel-preparation/", "/contact-us/", "/dr-andrew-sutherland/", "/resources/"].includes(url)) {
      const name = (url === "/" ? "home" : url.replace(/^\/|\/$/g, "").replace(/\//g, "-"));
      await page.screenshot({ path: join(ROOT, "qa-shots", "mobile", `${name}-${width}.png`), fullPage: true });
    }
  }

  summary.push({ width, label, worstOverflow });
  console.log(`  ${String(width).padStart(4)}px  ${label.padEnd(34)} worst overflow: ${worstOverflow}px`);
  await ctx.close();
}

await browser.close();
server.close();

console.log("\n===== FINDINGS =====");
if (!problems.length) {
  console.log("No layout problems at any tested width.\n");
} else {
  const grouped = {};
  for (const p of problems) {
    const k = p.slice(1, p.indexOf("]"));
    (grouped[k] = grouped[k] || []).push(p);
  }
  for (const [k, list] of Object.entries(grouped)) {
    console.log(`\n-- ${k} (${list.length})`);
    list.slice(0, 10).forEach((l) => console.log("   " + l));
    if (list.length > 10) console.log(`   ... and ${list.length - 10} more`);
  }
  console.log("");
}
