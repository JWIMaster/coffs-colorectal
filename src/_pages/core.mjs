/** Core pages: home, conditions index, procedures index. */

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
  card,
  absUrl,
  TEL,
} from "../_lib/render.mjs";

export function render() {
  /* ------------------------------------------------------------------ home */
  {
    const h = site.home;
    const body = `
<section class="hero">
  <div class="hero__media">
    <picture>
      <source srcset="/media/coffs-creek-estuary.webp" type="image/webp">
      <img src="/media/coffs-creek-estuary.jpg" alt="" width="800" height="150" fetchpriority="high" decoding="async">
    </picture>
  </div>
  <div class="shell hero__inner">
    <div class="hero__copy">
      <h1>${escapeHTML(h.heroTitle)}</h1>
      <p class="lede" style="margin-top:var(--space-s)">${inline(h.heroLede)}</p>
      <p class="hero__actions">
        <a class="btn btn--primary" href="tel:${TEL}">${icon("phone")}Call ${escapeHTML(site.contact.phone)}</a>
        <a class="btn btn--ghost" href="/dr-andrew-sutherland/">Meet Dr Andrew Sutherland</a>
      </p>
      <p class="hero__links">
        <a href="/conditions/">Conditions</a>
        <a href="/procedures/">Procedures</a>
        <a href="/your-visit/">Your visit</a>
      </p>
    </div>
    <div class="hero__panel">
      <h2>${icon("shield")} About the practice</h2>
      <p class="small" style="margin-top:0.4rem">${inline(site.practice.intro)}</p>
      <p class="small" style="margin-top:0.5rem">
        <a class="hero__panel-link" href="/dr-andrew-sutherland/">Read Dr Sutherland's qualifications and experience</a>
      </p>
      <div class="hero__divider"></div>
      <ul class="hero__facts">
        ${site.practice.credentials
          .map((c) => `<li>${icon("check")}<span>${inline(c)}</span></li>`)
          .join("\n        ")}
      </ul>
      <div class="hero__divider"></div>
      <p class="small">${escapeHTML(site.contact.street)}, ${escapeHTML(site.contact.suburb)}<br>
        <a class="quiet-link" href="/contact-us/">Contact and directions</a>
      </p>
    </div>
  </div>
</section>


<section class="section" aria-labelledby="start-h">
  <div class="shell">
    <div class="section-head">
      <div>
        <h2 id="start-h">Where would you like to go?</h2>
      </div>
      <p class="muted" style="max-width:38ch">If you are not sure which section you
      need, start with the symptom list. It will point you in the right direction.</p>
    </div>
    <div class="routemap">
      ${[
        ["/your-visit/symptoms/", "I have symptoms", "Bleeding, a change in bowel habit, pain or weight loss. Start here for what to do next and when to see your GP.", true],
        ["/your-visit/bowel-preparation/", "I am having a colonoscopy", "Bowel preparation instructions, the low-fibre diet, clear fluids, and what happens on the day."],
        ["/conditions/", "I have a diagnosis", "Plain-language information about bowel cancer and the other conditions treated here."],
        ["/procedures/", "I am having an operation", "What each operation involves, and what to expect afterwards."],
        ["/your-visit/referrals/", "I need a referral", "How to get one from your GP, and what to bring."],
        ["/your-visit/fees/", "I want to know the cost", "Consultation fees, Medicare rebates and the safety net."],
      ]
        .map(
          ([href, label, text, primary]) => `<a class="route${primary ? " route--primary" : ""}" href="${href}">
        <span class="route__label">${escapeHTML(label)}${icon("arrow")}</span>
        <span class="route__text">${escapeHTML(text)}</span>
      </a>`,
        )
        .join("\n      ")}
    </div>
  </div>
</section>

<section class="section section--sunken" aria-labelledby="about-h">
  <div class="shell">
    <div class="grid grid--2" style="align-items:center;gap:var(--space-xl)">
      <div class="prose">
        <h2 id="about-h">${escapeHTML(site.practice.name)}</h2>
        ${prose(h.about)}
      </div>
      <figure style="margin:0">
        <img class="figure-img" src="/media/29-orlando-street.webp"
             width="1260" height="340"
             alt="The building at 29 Orlando Street, Coffs Harbour, where the practice is located."
             loading="lazy" decoding="async">
        <figcaption class="small subtle" style="margin-top:0.6rem">
          Suite 4, 29 Orlando Street, Coffs Harbour, opposite NBN and Cooper's Surf Shop.
        </figcaption>
      </figure>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="bc-h">
  <div class="shell">
    <div class="grid grid--2" style="align-items:start">
      <div class="prose">
        <h2 id="bc-h">${escapeHTML(h.screening.title)}</h2>
        ${prose(h.screening.body)}
      </div>
      <div class="card">
        <h3 style="font-size:var(--step-1)">${icon("info")} Symptoms worth checking</h3>
        <p class="small muted" style="margin-top:0.4rem">Most people with these
        symptoms do not have cancer, but they should be checked by a GP.</p>
        <ul style="margin-top:var(--space-xs);padding-left:1.2rem;display:grid;gap:0.4rem">
          ${h.screening.symptoms.map((s) => `<li>${inline(s)}</li>`).join("\n          ")}
        </ul>
        <p style="margin-top:var(--space-s)">
          <a class="btn btn--quiet" href="/your-visit/symptoms/">More about symptoms</a>
        </p>
      </div>
    </div>
  </div>
</section>
`;
    writePage({
      url: "/",
      title: `${site.practice.name} — specialist colorectal surgery in Coffs Harbour`,
      description: h.metaDescription,
      body,
      jsonld: {
        "@context": "https://schema.org",
        "@type": "MedicalClinic",
        name: site.practice.name,
        url: absUrl("/"),
        telephone: site.contact.phone,
        faxNumber: site.contact.fax,
        email: site.contact.email,
        medicalSpecialty: "Colorectal surgery",
        address: {
          "@type": "PostalAddress",
          streetAddress: site.contact.street,
          addressLocality: site.contact.suburb,
          addressRegion: site.contact.state,
          postalCode: site.contact.postcode,
          addressCountry: "AU",
        },
      },
    });
  }

  /* -------------------------------------------------------- conditions list */
  {
    const body = `${pageHead("Conditions", site.conditionsIntro, [
      { label: "Home", href: "/" },
      { label: "Conditions" },
    ])}

<section class="section">
  <div class="shell">
    <div class="index">
      ${conditions
        .map(
          (c) => `<a class="index__row" href="/conditions/${c.slug}/">
        <span class="index__name">${escapeHTML(c.title)}${icon("arrow")}</span>
        <span>
          <span class="index__text">${escapeHTML(c.summary)}</span>
          ${c.alsoKnownAs ? `<span class="index__meta">${escapeHTML(c.alsoKnownAs)}</span>` : ""}
        </span>
      </a>`,
        )
        .join("\n      ")}
    </div>
  </div>
</section>

`;
    writePage({
      url: "/conditions/",
      title: "Conditions",
      description:
        "Plain-language information about bowel cancer and other colorectal conditions, including symptoms, diagnosis and treatment options.",
      body,
      trail: [{ label: "Home", href: "/" }, { label: "Conditions" }],
    });
  }

  /* -------------------------------------------------------- procedures list */
  {
    const body = `${pageHead("Procedures", site.proceduresIntro, [
      { label: "Home", href: "/" },
      { label: "Procedures" },
    ])}

<section class="section">
  <div class="shell">
    <div class="callout callout--info" style="margin-bottom:var(--space-l)">
      ${icon("info")}
      <div>
        <p class="callout__title">Informed consent</p>
        <p>${inline(site.consentNote)}</p>
      </div>
    </div>
    <div class="index">
      ${procedures
        .map(
          (p) => `<a class="index__row" href="/procedures/${p.slug}/">
        <span class="index__name">${escapeHTML(p.title)}${icon("arrow")}</span>
        <span class="index__text">${escapeHTML(p.summary)}</span>
      </a>`,
        )
        .join("\n      ")}
    </div>
  </div>
</section>

`;
    writePage({
      url: "/procedures/",
      title: "Procedures",
      description:
        "What each colorectal procedure involves, how to prepare, what to expect during recovery, and the risks explained honestly.",
      body,
      trail: [{ label: "Home", href: "/" }, { label: "Procedures" }],
    });
  }
}
