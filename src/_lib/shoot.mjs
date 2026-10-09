/**
 * Visual QA harness.
 *
 * Serves the built site from memory and screenshots key pages at desktop and
 * mobile widths, in both appearances. Also reports console errors, failed
 * requests, horizontal overflow, and a few accessibility proxies.
 *
 *   node src/_lib/shoot.mjs
 */

import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, normalize } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "qa-shots");
const PORT = 4173;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".json": "application/json",
  ".xml": "application/xml",
};

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = join(ROOT, normalize(p).replace(/^(\.\.[/\\])+/, ""));
    if (!existsSync(file)) {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("not found: " + p);
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch (e) {
    res.writeHead(500);
    res.end(String(e));
  }
});

await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
const base = `http://127.0.0.1:${PORT}`;

const { chromium } = await import("playwright");
const browser = await chromium.launch();

await mkdir(OUT, { recursive: true });

const PAGES = [
  ["home", "/"],
  ["conditions", "/conditions/"],
  ["procedures", "/procedures/"],
  ["condition-colon-cancer", "/conditions/colon-cancer/"],
  ["condition-haemorrhoids", "/conditions/haemorrhoids/"],
  ["your-visit", "/your-visit/"],
  ["bowel-preparation", "/your-visit/bowel-preparation/"],
  ["contact", "/contact-us/"],
  ["privacy", "/privacy/"],
  ["procedure-colonoscopy", "/procedures/colonoscopy/"],
  ["procedure-colon-resection", "/procedures/colon-resection/"],
  ["procedure-eras", "/procedures/enhanced-recovery-after-colorectal-surgery/"],
  ["condition-diverticular", "/conditions/diverticular-disease/"],
  ["bio", "/dr-andrew-sutherland/"],
  ["accessibility", "/accessibility/"],
  ["resources", "/resources/"],
];

const VIEWPORTS = [
  ["desktop", 1440, 1000],
  ["mobile", 390, 844],
];

const problems = [];

for (const [vpName, width, height] of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`[console] ${vpName} ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`[pageerror] ${vpName} ${e.message}`));
  page.on("requestfailed", (r) => {
    const u = r.url();
    if (u.startsWith(base)) problems.push(`[404] ${vpName} ${u}`);
  });

  for (const [name, path] of PAGES) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    // Settle any reveal transitions.
    await page.waitForTimeout(220);

    await page.screenshot({
      path: join(OUT, `${name}-${vpName}.png`),
      fullPage: false,
    });

    const audit = await page.evaluate(() => {
      const de = document.documentElement;
      const overflow = de.scrollWidth - de.clientWidth;
      // Find elements wider than the viewport.
      const wide = [];
      document.querySelectorAll("body *").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > de.clientWidth + 2 && r.height > 0) {
          wide.push(
            el.tagName.toLowerCase() +
              (el.className && typeof el.className === "string"
                ? "." + el.className.split(" ").slice(0, 2).join(".")
                : "") +
              ` (${Math.round(r.width)}px)`,
          );
        }
      });
      const imgsMissingAlt = Array.from(document.querySelectorAll("img"))
        .filter((i) => !i.hasAttribute("alt"))
        .map((i) => i.getAttribute("src"));
      const h1s = document.querySelectorAll("h1").length;
      const unlabelled = Array.from(
        document.querySelectorAll("input, select, textarea"),
      )
        .filter((el) => {
          if (el.type === "hidden") return false;
          if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby"))
            return false;
          return !(el.id && document.querySelector(`label[for="${el.id}"]`));
        })
        .map((el) => el.tagName + "#" + (el.id || "?"));
      const buttonsNoName = Array.from(document.querySelectorAll("button"))
        .filter(
          (b) =>
            !b.textContent.trim() &&
            !b.getAttribute("aria-label") &&
            !b.getAttribute("aria-labelledby"),
        ).length;
      return {
        overflow,
        wide: [...new Set(wide)].slice(0, 4),
        imgsMissingAlt,
        h1s,
        unlabelled,
        buttonsNoName,
      };
    });

    if (audit.overflow > 1)
      problems.push(
        `[overflow] ${vpName} ${path} scrollWidth exceeds clientWidth by ${audit.overflow}px ${JSON.stringify(audit.wide)}`,
      );
    if (audit.h1s !== 1) problems.push(`[h1] ${vpName} ${path} has ${audit.h1s} h1 elements`);
    if (audit.imgsMissingAlt.length)
      problems.push(`[alt] ${path} ${JSON.stringify(audit.imgsMissingAlt)}`);
    if (audit.unlabelled.length)
      problems.push(`[label] ${path} ${JSON.stringify(audit.unlabelled)}`);
    if (audit.buttonsNoName)
      problems.push(`[btnname] ${path} ${audit.buttonsNoName} unnamed buttons`);

    console.log(`shot ${name}-${vpName}  overflow=${audit.overflow} h1=${audit.h1s}`);
  }

  await ctx.close();
}

/* Dark appearance + the open menu sheet */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(base + "/conditions/haemorrhoids/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
  await page.waitForTimeout(200);
  await page.screenshot({ path: join(OUT, "dark-condition.png") });
  console.log("shot dark-condition");
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.click("[data-menu-open]");
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(OUT, "mobile-menu-open.png") });
  console.log("shot mobile-menu-open");
  await ctx.close();
}

await browser.close();
server.close();

console.log("\n===== PROBLEMS =====");
if (!problems.length) console.log("none");
else problems.forEach((p) => console.log("  " + p));
