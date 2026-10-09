/** Clinical pages: one per condition and one per procedure. */

import {
  site,
  procedures,
  conditions,
  writePage,
  inline,
  prose,
  icon,
  escapeHTML,
  pageHead,
  emergencyStrip,
  relatedBlock,
  sourcesBlock,
  factsStrip,
  riskGrid,
  faqBlock,
  sectionStack,
  card,
} from "../_lib/render.mjs";

/* Cross-links. Patients arrive with a condition, not a procedure name, so each
   page points at the other side of the pair. */
const CONDITION_TO_PROCEDURES = {
  "colon-cancer": ["colon-resection", "laparoscopic-colon-resection", "colonoscopy", "enhanced-recovery-after-colorectal-surgery"],
  "rectal-cancer": ["rectal-resection", "abdominoperineal-resection", "colonoscopy", "enhanced-recovery-after-colorectal-surgery"],
  "crohns-disease": ["colon-resection", "laparoscopic-colon-resection", "colonoscopy"],
  "ulcerative-colitis": ["colon-resection", "laparoscopic-colon-resection", "colonoscopy"],
  haemorrhoids: ["haemorrhoid-surgery", "colonoscopy"],
  "anal-fissure": ["anal-fissure-surgery", "colonoscopy"],
  "anal-abscess-and-fistula": ["anal-fistula-surgery", "colonoscopy"],
  "pilonidal-sinus": ["pilonidal-sinus-surgery"],
  "diverticular-disease": ["colon-resection", "laparoscopic-colon-resection", "colonoscopy"],
};

const PROCEDURE_TO_CONDITIONS = {
  colonoscopy: ["colon-cancer", "rectal-cancer", "diverticular-disease", "ulcerative-colitis", "crohns-disease", "haemorrhoids"],
  "colon-resection": ["colon-cancer", "diverticular-disease", "crohns-disease", "ulcerative-colitis"],
  "laparoscopic-colon-resection": ["colon-cancer", "diverticular-disease", "crohns-disease", "ulcerative-colitis"],
  "enhanced-recovery-after-colorectal-surgery": ["colon-cancer", "rectal-cancer"],
  "rectal-resection": ["rectal-cancer"],
  "abdominoperineal-resection": ["rectal-cancer"],
  "haemorrhoid-surgery": ["haemorrhoids"],
  "anal-fissure-surgery": ["anal-fissure"],
  "anal-fistula-surgery": ["anal-abscess-and-fistula"],
  "rectal-prolapse-surgery": [],
};

/* Procedures with an inpatient recovery, which get a cross-link to the
   after-surgery guidance rather than duplicating it. */
const INPATIENT = new Set([
  "colon-resection",
  "laparoscopic-colon-resection",
  "rectal-resection",
  "abdominoperineal-resection",
  "rectal-prolapse-surgery",
]);

const bySlug = (list, slug) => list.find((x) => x.slug === slug);

const linkList = (slug, kind) => {
  const map = kind === "condition" ? CONDITION_TO_PROCEDURES : PROCEDURE_TO_CONDITIONS;
  const pool = kind === "condition" ? procedures : conditions;
  const base = kind === "condition" ? "/procedures/" : "/conditions/";
  return (map[slug] || [])
    .map((s) => bySlug(pool, s))
    .filter(Boolean)
    .map((x) => ({ href: `${base}${x.slug}/`, label: x.title, text: x.summary }));
};

/* ---------------------------------------------------------------- procedure */

function procedurePage(p) {
  const trail = [
    { label: "Home", href: "/" },
    { label: "Procedures", href: "/procedures/" },
    { label: p.title },
  ];

  const body = `
${pageHead(p.title, p.summary, trail)}

${p.expect && p.expect.length
  ? `<section class="section section--tight">
  <div class="shell">
    <h2 class="eyebrow" style="margin-bottom:0">Key facts</h2>
    ${factsStrip(p.expect)}
  </div>
</section>`
  : ""}

<section class="section">
  <div class="shell">
    ${p.urgent && p.urgent.length
      ? `<div class="callout callout--urgent" style="margin-bottom:var(--space-l);max-width:64rem">
      ${icon("alert")}
      <div>
        <p class="callout__title">When to get help urgently</p>
        <p>Contact the practice, or attend an emergency department, if you have any of the following:</p>
        <ul>${p.urgent.map((u) => `<li>${inline(u)}</li>`).join("")}</ul>
      </div>
    </div>`
      : ""}

    ${
      p.overview && p.overview.length
        ? `<div class="prose">
      <h2>${escapeHTML(p.overviewHeading || "What this procedure involves")}</h2>
      ${prose(p.overview)}
    </div>`
        : ""
    }

    ${p.sections ? `<div class="prose">${sectionStack(p.sections)}</div>` : ""}

    ${
      p.risks && p.risks.length
        ? `<div class="prose" style="margin-top:var(--space-xl)">
      <h2>Risks and complications</h2>
      <p>Every operation carries some risk. The risks below are the ones worth knowing
      about before you decide. Rare complications are still possible, and Dr Sutherland
      will discuss how they apply to you.</p>
    </div>
    <div style="margin-top:var(--space-m)">${riskGrid(p.risks)}</div>`
        : ""
    }

    ${
      p.questions && p.questions.length
        ? `<div class="prose" style="margin-top:var(--space-xl)">
      <h2>Questions people ask</h2>
    </div>
    <div style="margin-top:var(--space-s)">${faqBlock(p.questions)}</div>`
        : ""
    }

    ${
      INPATIENT.has(p.slug)
        ? `<div class="callout callout--info" style="margin-top:var(--space-xl);max-width:64rem">
      ${icon("info")}
      <div>
        <p class="callout__title">Recovering after this operation</p>
        <p>General guidance on pain relief, eating, bowel function, activity, wound
        care, follow-up and the symptoms that need urgent attention is on the
        <a href="/your-visit/after-surgery/">after your procedure</a> page. You will
        also be given written instructions before you go home.</p>
      </div>
    </div>`
        : ""
    }
  </div>
</section>

${relatedBlock("Conditions this procedure treats", linkList(p.slug, "procedure"))}
${sourcesBlock(p.sources, p.reviewed)}
`;
  writePage({
    url: `/procedures/${p.slug}/`,
    title: p.title,
    description: p.summary,
    body,
    trail,
  });
}

/* ---------------------------------------------------------------- condition */

function conditionPage(c) {
  const trail = [
    { label: "Home", href: "/" },
    { label: "Conditions", href: "/conditions/" },
    { label: c.title },
  ];

  const body = `
${pageHead(c.title, c.summary, trail)}

${c.expect && c.expect.length
  ? `<section class="section section--tight">
  <div class="shell">
    <h2 class="eyebrow" style="margin-bottom:0">Key facts</h2>
    ${factsStrip(c.expect)}
  </div>
</section>`
  : ""}

<section class="section">
  <div class="shell">
    ${
      c.urgent && c.urgent.length
        ? `<div class="callout callout--urgent" style="margin-bottom:var(--space-l);max-width:64rem">
      ${icon("alert")}
      <div>
        <p class="callout__title">When to get help urgently</p>
        <p>Seek urgent medical care if you have any of the following:</p>
        <ul>${c.urgent.map((u) => `<li>${inline(u)}</li>`).join("")}</ul>
      </div>
    </div>`
        : ""
    }

    ${c.sections ? sectionStack(c.sections) : ""}

    ${
      c.questions && c.questions.length
        ? `<div class="prose" style="margin-top:var(--space-xl)">
      <h2>Questions people ask</h2>
    </div>
    <div style="margin-top:var(--space-s)">${faqBlock(c.questions)}</div>`
        : ""
    }
  </div>
</section>

${c.support && c.support.length ? relatedBlock("Support and further information", c.support) : ""}
${relatedBlock("Procedures used to treat this", linkList(c.slug, "condition"))}
${sourcesBlock(c.sources, c.reviewed)}
`;
  writePage({
    url: `/conditions/${c.slug}/`,
    title: c.title,
    description: c.summary,
    body,
    trail,
  });
}

export function render() {
  for (const c of conditions) conditionPage(c);
  for (const p of procedures) procedurePage(p);
}
