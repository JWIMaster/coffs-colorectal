/**
 * Shared render layer: icons, markup helpers, page chrome, and the page writer.
 * Imported by build.mjs and by every page module.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const SRC = join(ROOT, "src");

const { site, procedures, conditions } = await import("./data.mjs");

const read = (p) => readFileSync(p, "utf8");

/* ------------------------------------------------------------------ escaping */

export const escapeHTML = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const interpolate = (str, map) =>
  str.replace(/\{\{(\w+)\}\}/g, (m, k) => (map[k] !== undefined ? map[k] : m));

/**
 * Narrow inline markup: **bold**, *italic*, `code`, [text](url).
 * Escaped first, so content can never inject HTML.
 */
export function inline(text) {
  let s = escapeHTML(text);
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, href) => {
    const external = /^https?:/i.test(href);
    return `<a href="${href}"${external ? ' rel="noopener noreferrer"' : ""}>${label}</a>`;
  });
  return s;
}

/**
 * Paragraph / bullet blocks.
 *
 * A plain string renders as a paragraph. A string beginning with "- " is a list
 * item, and consecutive ones join into a single list — that convention is the
 * documented content format, so it is honoured here rather than being left to
 * each caller to remember.
 */
export function prose(blocks) {
  if (!blocks) return "";
  const out = [];
  let list = null;

  const flush = () => {
    if (list) {
      out.push(`<ul>${list.map((li) => `<li>${inline(li)}</li>`).join("")}</ul>`);
      list = null;
    }
  };

  for (const b of blocks) {
    if (typeof b === "string") {
      if (b.startsWith("- ")) {
        (list = list || []).push(b.slice(2));
      } else {
        flush();
        out.push(`<p>${inline(b)}</p>`);
      }
    } else if (b.bullets) {
      flush();
      const tag = b.ordered ? "ol" : "ul";
      out.push(
        `<${tag}>${b.bullets.map((li) => `<li>${inline(li)}</li>`).join("")}</${tag}>`,
      );
    } else if (b.note) {
      flush();
      out.push(`<p class="small muted">${inline(b.note)}</p>`);
    }
  }
  flush();
  return out.join("\n");
}

export const list = (items) =>
  (items || []).map((i) => `<li>${inline(i)}</li>`).join("");

/* ------------------------------------------------------------------ icons */

const ICONS = {
  /* A handset. Lucide's "phone" geometry, which draws the receiver as one
     smooth outline with a rounded thumb notch, rather than the hand-authored
     path's kinked joint and blunt foot that read as a squiggle at 17px. */
  phone:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
  arrow:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12.5 5.5 19 12l-6.5 6.5"/></svg>',
  chevron:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
  chevronDown:
    '<svg class="faq__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4.5 12.5 5 5 10-11"/></svg>',
  alert:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5 2.7 19.5h18.6L12 3.5Z"/><path d="M12 10v4"/><path d="M12 17h.01"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></svg>',
  shield:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>',
  print:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="7" rx="2"/><path d="M7 14h10v6H7z"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/></svg>',
  sun: '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/></svg>',
  moon: '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  stethoscope:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3v5a4 4 0 0 0 8 0V3"/><path d="M10 12v3a5 5 0 0 0 5 5 5 5 0 0 0 5-5v-1"/><circle cx="20" cy="11" r="1.6"/></svg>',
  external:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>',
};

export const icon = (name, cls = "") => {
  const svg = ICONS[name];
  if (!svg) return "";
  if (!cls) {
    // Never leave an empty class attribute behind.
    return svg.replace('class="" ', "");
  }
  // Merge with any class the icon already carries rather than duplicating the
  // attribute.
  const existing = svg.match(/class="([^"]*)"/);
  if (existing) {
    return svg.replace(`class="${existing[1]}"`, `class="${cls} ${existing[1]}"`);
  }
  return svg.replace("<svg ", `<svg class="${cls}" `);
};

/* ------------------------------------------------------------------ context */

/**
 * Output directory. Defaults to the project root so that opening index.html
 * works with no server, but a clean build for publishing can be sent to a
 * subdirectory with --out=dist.
 */
const OUT = (() => {
  const arg = process.argv.find((a) => a.startsWith("--out="));
  const dir = (arg ? arg.slice(6) : process.env.SITE_OUT || "").replace(/^\/+|\/+$/g, "");
  return dir ? join(ROOT, dir) : ROOT;
})();

/**
 * Deployment base path.
 *
 * GitHub Pages serves project repositories from a subpath
 * (https://user.github.io/repo/), which would break every root-relative link.
 * `BASE` is the prefix applied to absolute paths at build time.
 *
 *   node build.mjs --base=/coffs-colorectal
 */
const BASE = (
  process.argv.find((a) => a.startsWith("--base="))?.slice(7) ??
  process.env.SITE_BASE ??
  ""
).replace(/\/+$/, "");

/** Prefix an absolute site path with the deployment base. */
const path = (p) => (p.startsWith("/") ? BASE + p : p);

/** The public origin for this deployment, e.g. https://user.github.io.
 *  Deliberately not SITE_URL: actions/configure-pages injects its own value. */
const SITE_ORIGIN = process.env.SITE_ORIGIN || site.practice.url;

/** Absolute URL for a site path, including the deployment base. */
const absUrl = (p) => `${SITE_ORIGIN}${BASE}${p}`;

export const TEL = site.contact.phone.replace(/[^\d+]/g, "");
export const HELP_TEL = site.emergency.healthdirect.replace(/\s/g, "");

const NAV = [
  { label: "Home", href: "/", match: "/" },
  { label: "About Dr Sutherland", href: "/dr-andrew-sutherland/", match: "/dr-andrew-sutherland/" },
  { label: "Conditions", href: "/conditions/", match: "/conditions/" },
  { label: "Procedures", href: "/procedures/", match: "/procedures/" },
  { label: "Your visit", href: "/your-visit/", match: "/your-visit/" },
];

const isActive = (item, url) =>
  item.match === "/" ? url === "/" : url.startsWith(item.match);

const partial = (name) => read(join(SRC, "_partials", `${name}.html`));

const isHomeUrl = (url) => {
  const clean = url.split("#")[0].split("?")[0];
  return clean === "/" || clean === "" || clean === "/index.html";
};

const BASE_SUBS = {
  phone: escapeHTML(site.contact.phone),
  tel: TEL,
  fax: escapeHTML(site.contact.fax),
  email: escapeHTML(site.contact.email),
  street: escapeHTML(site.contact.street),
  suburb: escapeHTML(site.contact.suburb),
  state: escapeHTML(site.contact.state),
  postcode: escapeHTML(site.contact.postcode),
  abn: escapeHTML(site.practice.abn),
  ambulance: escapeHTML(site.emergency.ambulance),
  healthdirect: escapeHTML(site.emergency.healthdirect),
  emergencyDept: escapeHTML(site.emergency.department),
  acknowledgement: escapeHTML(site.practice.acknowledgement),
  relay: escapeHTML(site.emergency.relay),
  interpreter: escapeHTML(site.emergency.interpreter),
  iconPhone: icon("phone"),
  iconPin: icon("pin"),
  iconAlert: icon("alert"),
  iconMenu: icon("menu"),
  iconClose: icon("close"),
  iconSun: icon("sun"),
  iconMoon: icon("moon"),
  iconStethoscope: icon("stethoscope"),
  brandName: escapeHTML(site.practice.name),
  brandSub: escapeHTML(site.practice.tagline),
};

function renderHeader(url) {
  const navLinks = NAV.map(
    (n) =>
      `<a class="nav__link" href="${n.href}"${isActive(n, url) ? ' aria-current="page"' : ""}>${n.label}</a>`,
  ).join("\n        ");

  const sheetLinks = NAV.map(
    (n) =>
      `<a class="nav-sheet__link" href="${n.href}"${isActive(n, url) ? ' aria-current="page"' : ""}>${n.label}${icon("chevron")}</a>`,
  ).join("\n        ");

  return interpolate(partial("header"), {
    ...BASE_SUBS,
    navLinks,
    sheetLinks,
  });
}

/**
 * Rewrite root-relative links in built markup so they resolve under the
 * deployment base. Doing this on the final string keeps the intent of every
 * `href="/path"` explicit at the point of writing, and means a single pass
 * catches template, partial and generated markup alike.
 */
const applyBase = (html) =>
  BASE
    ? html
        .replace(/(href|src)="\/(?!\/)/g, `$1="${BASE}/`)
        .replace(/(srcset|imagesrcset)="\/(?!\/)/g, `$1="${BASE}/`)
    : html;

function renderFooter(currentUrl) {
  const groups = site.footerNav
    .map(
      (g) => `<div>
        <h2>${escapeHTML(g.title)}</h2>
        <ul>${g.links
          .map((l) => `<li><a href="${l.href}">${escapeHTML(l.label)}</a></li>`)
          .join("")}</ul>
      </div>`,
    )
    .join("\n      ");

  const emergencyNote = `<aside class="callout callout--urgent" style="margin-bottom:var(--space-l)" aria-label="Emergency information">
      ${icon("alert")}
      <div>
        <p class="callout__title">In an emergency, call ${escapeHTML(site.emergency.ambulance)}</p>
        <p>
          For urgent health advice when the rooms are closed, call healthdirect on
          <a href="tel:${HELP_TEL}">${escapeHTML(site.emergency.healthdirect)}</a>
          (free, 24 hours, registered nurses). For life-threatening symptoms, go to
          the nearest emergency department — ${escapeHTML(site.emergency.department)}.
          This website and the enquiry form are <strong>not monitored outside business
          hours</strong> and are not for urgent or clinical matters. National Relay
          Service <strong>${escapeHTML(site.emergency.relay)}</strong>; interpreters
          <strong>${escapeHTML(site.emergency.interpreter)}</strong>.
        </p>
      </div>
    </aside>`;

  return interpolate(partial("footer"), {
    ...BASE_SUBS,
    groups,
    emergencyNote,
    year: String(new Date().getFullYear()),
    secondaryLink:
      currentUrl === "/your-visit/referrals/"
        ? '<a class="btn btn--ghost" href="/contact-us/">Contact and directions</a>'
        : '<a class="btn btn--ghost" href="/your-visit/referrals/">How to get a referral</a>',
  });
}

/* --------------------------------------------------------------- shared blocks */

export function crumbs(trail) {
  if (!trail || trail.length < 2) return "";
  const items = trail
    .map((c, i) => {
      if (i === trail.length - 1)
        return `<li aria-current="page">${escapeHTML(c.label)}</li>`;
      return `<li><a href="${c.href}">${escapeHTML(c.label)}</a></li><li aria-hidden="true">${icon("chevron")}</li>`;
    })
    .join("");
  return `<nav aria-label="Breadcrumb"><ol class="crumbs">${items}</ol></nav>`;
}

export function pageHead(title, lede, trail) {
  return `<header class="page-head">
  <div class="shell">
    ${crumbs(trail)}
    <div class="page-head__inner" style="margin-top:var(--space-s)">
      <h1>${escapeHTML(title)}</h1>
      ${lede ? `<p class="lede">${inline(lede)}</p>` : ""}
    </div>
  </div>
</header>`;
}

export const card = (href, title, text, meta) => `<a class="link-card" href="${href}">
        <span class="link-card__title">${escapeHTML(title)}${icon("arrow")}</span>
        ${text ? `<span class="link-card__text">${escapeHTML(text)}</span>` : ""}
        ${meta ? `<span class="link-card__meta">${escapeHTML(meta)}</span>` : ""}
      </a>`;

export function relatedBlock(title, links) {
  if (!links || !links.length) return "";
  return `<section class="section section--tight" aria-labelledby="rel-h">
  <div class="shell">
    <h2 id="rel-h" style="font-size:var(--step-2)">${escapeHTML(title)}</h2>
    <div class="index" style="margin-top:var(--space-m)">
      ${links
        .map(
          (l) => `<a class="index__row" href="${l.href}">
        <span class="index__name">${escapeHTML(l.label)}${icon("arrow")}</span>
        <span class="index__text">${escapeHTML(l.text || "")}</span>
      </a>`,
        )
        .join("\n      ")}
    </div>
  </div>
</section>`;
}

export function sourcesBlock(sources, reviewed) {
  if ((!sources || !sources.length) && !reviewed) return "";
  return `<section class="section section--tight section--sunken">
  <div class="shell">
    <div class="prose" style="max-width:64ch">
      ${
        sources && sources.length
          ? `<h2 style="font-size:var(--step-1)">Where this information comes from</h2>
      <ul class="small">${sources
        .map(
          (s) =>
            `<li><a href="${s.url}" rel="noopener noreferrer">${escapeHTML(s.title)}</a></li>`,
        )
        .join("")}</ul>`
          : ""
      }
      <p class="small muted" style="margin-top:var(--space-s)">
        This page is general information only. It does not take into account your
        individual circumstances. Please discuss your own situation with Dr Sutherland
        or your general practitioner.
        ${reviewed ? `Information reviewed ${escapeHTML(reviewed)}.` : ""}
      </p>
    </div>
  </div>
</section>`;
}

/** Key-facts strip. */
export const factsStrip = (facts) =>
  facts && facts.length
    ? `<ul class="facts" style="margin-top:var(--space-m)">
        ${facts.map((f) => `<li>${icon("check")}<span>${escapeHTML(f)}</span></li>`).join("\n        ")}
      </ul>`
    : "";

/** Risk grid. */
export const riskGrid = (risks) =>
  risks && risks.length
    ? `<ul class="risk-list">
        ${risks
          .map(
            (r) => `<li class="risk">
          <p class="risk__name">${escapeHTML(r.name)}${
            r.serious ? '<span class="risk__flag">Rare but serious</span>' : ""
          }</p>
          <p class="risk__detail">${inline(r.detail)}</p>
        </li>`,
          )
          .join("\n        ")}
      </ul>`
    : "";

/** FAQ accordion — native details/summary, so it works without JavaScript. */
export const faqBlock = (questions) =>
  questions && questions.length
    ? `<div class="faq">
        ${questions
          .map(
            (q) => `<div class="faq__item">
          <details>
            <summary>${escapeHTML(q.q)}${icon("chevronDown")}</summary>
            <div class="faq__answer">${inline(q.a)}</div>
          </details>
        </div>`,
          )
          .join("\n        ")}
      </div>`
    : "";

/** Sectioned clinical content. */
export const sectionStack = (sections) =>
  sections && sections.length
    ? `<div class="prose">
        ${sections
          .map(
            (s) => `<h2 id="${slugify(s.heading)}">${escapeHTML(s.heading)}</h2>
        ${s.bullets ? prose([{ bullets: s.bullets }]) : prose(s.body)}`,
          )
          .join("\n        ")}
      </div>`
    : "";

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/* ------------------------------------------------------------------ styles/js */

let _css = null;
export const styles = () => {
  if (_css === null) {
    _css = readdirSync(join(SRC, "assets", "css"))
      .filter((f) => f.endsWith(".css"))
      .sort()
      .map((f) => read(join(SRC, "assets", "css", f)))
      .join("\n");

    // Root-relative url() references inside the CSS need the deployment base as
    // well. applyBase only rewrites the HTML shell, so the @font-face sources
    // still pointed at /assets/fonts/... while the files are served from
    // /<base>/assets/fonts/.... Every font 404ed on the subpath deployment and
    // the site silently fell back to a system face.
    if (BASE) {
      _css = _css.replace(/url\((["']?)\/(?!\/)/g, (_m, q) => `url(${q}${BASE}/`);
    }
  }
  return _css;
};

let _js = null;
export const script = () => {
  if (_js === null) _js = read(join(SRC, "assets", "js", "site.js"));
  return _js;
};

/* ------------------------------------------------------------------ writer */

export const built = [];

export function writePage({
  url,
  title,
  description,
  body,
  trail,
  jsonld,
}) {
  const fullTitle = url === "/" ? title : `${title} — ${site.practice.name}`;
  // Deliberately not SITE_URL: the Pages configure-pages action injects its own
  // SITE_URL value, which would silently override this.
  const html = applyBase(
    interpolate(partial("shell"), {
      lang: escapeHTML(site.practice.lang),
      title: escapeHTML(fullTitle),
      description: escapeHTML(description),
      // Absolute, so applyBase must not touch it — the base is built in here.
      url: absUrl(url),
      robots: "",
      styles: styles(),
      script: script(),
      // Lets the script tell the home page without parsing the path, which
      // breaks under a deployment base.
      pageAttr: isHomeUrl(url) ? ' data-page="home"' : "",
      favicon: "/assets/favicon.svg",
      header: renderHeader(url),
      footer: renderFooter(url),
      body,
      jsonld: jsonld
        ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>`
        : "",
    }),
  );

  // Files always land at the output root; only the *links* carry the base.
  const outPath =
    url === "/" ? join(OUT, "index.html") : join(OUT, url, "index.html");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html);
  built.push({
    url: BASE + url,
    title: fullTitle,
    description,
    file: relative(ROOT, outPath),
    bytes: Buffer.byteLength(html),
  });
}

export { ROOT, SRC, OUT, BASE, SITE_ORIGIN, path, absUrl, site, procedures, conditions };
