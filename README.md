# Coffs Colorectal Surgery — website

A rebuild of `coffscolorectal.com.au`, which was last published in 2017 and had
been built on WordPress in 2014. The old site's procedure pages all said
"Coming soon.", eight of nine condition pages were stubs, and there was no
privacy policy, no fee information, no referral guidance, and no bowel
preparation instructions.

This is a **static site** — plain HTML, CSS and JavaScript. There is no
framework, no build dependency, and nothing to install. It can be hosted
anywhere, including a simple shared host or an object store.

---

## Quick start

```bash
node build.mjs          # build the whole site
python3 src/_lib/images.py     # regenerate responsive images (only if sources change)
python3 src/_lib/normalise.py  # re-apply Australian English rules to content
node src/_lib/audit.mjs        # link, accessibility and contrast audit
node src/_lib/shoot.mjs        # screenshots into qa-shots/ for visual review
```

`build.mjs` is the only command needed for normal work. The other four are
maintenance and verification tools.

To preview, open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
```

---

## How it is put together

```
build.mjs                  Build entry point: copies assets, then renders every page
src/
  _data/site.json          Practice details, contact, nav, footer, home page copy
  _partials/               shell.html, header.html, footer.html — the page chrome
  _lib/
    data.mjs               Loads and orders site + content data
    render.mjs             Icons, markup helpers, page chrome, writePage()
    normalise.py           Australian English + terminology corrections
    images.py              Responsive WebP/JPEG pipeline
    audit.mjs              Full-site audit (links, WCAG 2.2 AA proxies, contrast)
    shoot.mjs              Playwright screenshot harness
  _pages/
    core.mjs               Home, Conditions index, Procedures index
    clinical.mjs           One page per condition and per procedure
    visit.mjs              Your visit, symptoms, referrals, fees, bowel prep,
                           after surgery, resources, contact
    about.mjs              Biography, privacy policy, accessibility statement
  assets/
    css/tokens.css         Design tokens, light + dark, preference overrides
    css/site.css           Layout and components
    js/site.js             Theme, scroll chrome, menu sheet with drag, reveals
content/
  conditions.json          Seven condition pages
  conditions-cancer.json   Colon and rectal cancer, adapted from the original site
  procedures.json          Ten procedure pages
media/                     Processed images (WebP + JPEG)
_archive/                  The Wayback crawl: raw HTML, extracted text, originals
qa-shots/                  Screenshots from the visual harness
```

Output is written to the project root, so `index.html` at the top level is the
home page and every other page is a folder with its own `index.html`. Links are
therefore clean (`/conditions/colonoscopy/`) and work on any static host.

### Editing content

Page copy lives in JSON, not in templates. To change wording, edit
`content/*.json` or `src/_data/site.json` and re-run `node build.mjs`.

Inline markup in content is deliberately limited to four forms, and input is
HTML-escaped first, so content can never inject markup:

| You write | You get |
| --- | --- |
| `**bold**` | **bold** |
| `*italic*` | *italic* |
| `` `code` `` | `code` |
| `[text](url)` | a link (external URLs get `rel="noopener noreferrer"`) |

### Why the CSS and JS are inlined

Every page carries the stylesheet and script inline. The whole site is about
40 KB of CSS and 12 KB of JavaScript uncompressed, so the browser needs no
second request, there is no flash of unstyled content, and the pages render
correctly when opened straight from disk with no server at all. If you later
add analytics or a form service, consider switching to linked files for better
caching.

---

## Design decisions

The interface follows Apple's approach to fluid interfaces, adapted for the web,
in four places where it measurably improves the experience:

1. **Feedback on press, not on release.** Every button and card scales down the
   instant it is pressed, in 100 ms. Nothing waits for the click to complete.
2. **The menu sheet tracks the finger 1:1 and can be grabbed mid-flight.** It
   keeps a short pointer history so it knows the release velocity, uses Apple's
   exponential-decay projection to decide whether the gesture was a dismiss or a
   snap-back, and rubber-bands if you drag the wrong way. It is never locked out
   during a transition, and reversal blends velocity rather than cutting it.
3. **Translucent chrome, not an opaque bar.** The header is a blurred material
   that content scrolls beneath, with a shadow that only appears once content is
   actually passing underneath — a scroll edge effect rather than a hard divider.
4. **Typography that changes shape with size.** Tracking is negative on large
   display text and near zero in body copy; leading tightens as type grows. Type
   sizes are fluid `clamp()` values in `rem`, so the whole layout scales with the
   reader's text-size setting.

Motion is limited to `transform` and `opacity`, and is entirely disabled under
`prefers-reduced-motion: reduce` — where slides become cross-fades and the
light/dark theme still swaps. There are no carousels and no autoplaying media
anywhere on the site.

### Typography and colour

Body text is set in the system font, at a comfortable size with generous leading
and a short measure, because the audience for this content skews older. The
palette is drawn from the place: deep ocean teal for the brand and actions,
warm estuary sand for surfaces, and a restrained banksia accent.

Both a light and a dark appearance are provided. Dark mode follows the operating
system unless the reader overrides it with the toggle in the header.

---

## Compliance

The rebuild was built against the Australian regulatory and accessibility
framework rather than treated as a visual exercise. Specifically:

**Advertising.** Health Practitioner Regulation National Law s133 prohibits
testimonials, comparative or superiority claims, and creating unreasonable
expectations of beneficial treatment. The site therefore has **no patient
testimonials, no review widgets, no star ratings, no before/after imagery, and
no "best" or "leading" language**. Claims are limited to verifiable
qualifications.

**Prescription medicines.** The TGA prohibits advertising prescription-only
medicines to the public, so **no bowel preparation product is named**. The bowel
preparation page refers to "the bowel preparation prescribed for you".

**Privacy.** A privacy policy covers the federal Australian Privacy Principles
and the NSW Health Privacy Principles, and — critically — the contact form
carries a collection notice and an explicit warning **not to send clinical
information**, because the form is not monitored outside business hours.

**Accessibility.** The target is WCAG 2.2 Level AA, which the Australian Human
Rights Commission names as the benchmark under the Disability Discrimination
Act. `src/_lib/audit.mjs` verifies, on every page: 320 px reflow with no
horizontal scrolling, one `h1` per page with no skipped heading levels, text and
UI contrast, zoom not disabled, named interactive elements, tap targets of at
least 24 × 24 px, images with alternative text, titled iframes, and survival of a
user override of line height, letter spacing and word spacing. It also confirms
that reduced-motion leaves no content stuck invisible.

**Australian English.** `normalise.py` enforces Style Manual conventions across
all content: "haemorrhoids", "faecal immunochemical test", "Coffs Harbour Health
Campus", lower-case disease names, and **"Crohn disease"** without the
possessive (except where it is part of an organisation's own name). It also
strips obsolete terms such as "bowel scan" and "CAT scan", and replaces
"colostomy bag" with "stoma".

### Content that still needs clinical sign-off

Every clinical page was drafted from authoritative sources and reviewed for
tone and compliance, but **none of it has been reviewed by Dr Sutherland**. The
procedure and condition pages are new content that replaces "Coming soon."
Placeholders that must be filled in before launch:

- [ ] **Dr Sutherland's clinical review of all 19 clinical pages.**
- [ ] AHPRA registration number, and confirmation of the exact approved
      specialist title against the public register. The site currently says
      "colorectal surgeon" and "specialist colorectal surgeon"; under the s115A
      title provisions, confirm this wording is supported by the register entry.
- [ ] Practice ABN (`src/_data/site.json` → `practice.abn`).
- [ ] Consultation fees (the fees page deliberately directs patients to call
      rather than publishing figures that may be out of date).
- [ ] Confirmation of the practice email address. The current address is a
      placeholder.
- [ ] Confirmation of consulting hours, and whether Saturday or extended hours
      are offered.
- [ ] Confirmation of the admitting hospitals, and whether the practice takes
      part in the CSSANZ Binational Colorectal Cancer Audit.
- [ ] Confirmation that the practice does or does not use My Health Record (the
      privacy policy refers to it conditionally).
- [ ] A current, professional headshot. The only available image is the small
      110 × 110 px portrait recovered from the 2014 site, which is soft when
      displayed larger.
- [ ] The accessibility statement's review date and confirmation of the
      building's access features.

The privacy policy and the accessibility statement are templates written to the
correct legal framework. **They should be reviewed by the practice's adviser
before publication.**

---

## Recovered material

`_archive/` preserves the crawl that this rebuild is based on:

- `html/` — the 24 raw pages from the Wayback Machine, plus two pages recovered
  from later snapshots (the February 2017 capture of those pages failed, so
  April 2014 snapshots were used).
- `content/` — the extracted text of each page as Markdown.
- `media/` — the four original images, unmodified.
- `crawl.sh`, `extract.py` — the tools used to recover them.

Only four images existed on the whole site: a banner photograph of the building
at 29 Orlando Street, a panorama of Coffs Creek, the surgeon's portrait, and a
background texture. All four are preserved in `_archive/media/`, and three are
still used in processed form. **New photography of the practice and the
surgeon would improve the site more than any further design work.**

The original site's own words that were worth keeping — the biography and the
colon and rectal cancer pages — were carried across, corrected for terminology
and spelling. Everything else is new, because the original pages said "Coming
soon."

## Sources

Clinical content is sourced from Australian bodies wherever possible: Cancer
Council Australia, Bowel Cancer Australia, the National Bowel Cancer Screening
Program, healthdirect, the Australian Commission on Safety and Quality in Health
Care, Services Australia, the OAIC and the NSW Information and Privacy
Commission, and Ahpra. Where Australian sources do not cover a procedure risk in
enough detail, ASCRS and NHS sources are used and cited as such. Each clinical
page lists its own sources at the foot of the page, along with a review date.

## Licence and attribution

The original site content is the practice's own. Photographs were recovered from
the Internet Archive and remain the practice's property. The design, templates
and code in this repository were written for this rebuild.
