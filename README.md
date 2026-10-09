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

## Deployment

The site is live at **https://jwimaster.github.io/coffs-colorectal/**

Repository: https://github.com/JWIMaster/coffs-colorectal

GitHub Actions builds and deploys on every push to `main`
(`.github/workflows/deploy-pages.yml`). Nothing is committed as build output:
the workflow runs the build into a clean `dist/`, verifies it, and publishes
that artifact.

### Hosting from a subpath

GitHub Pages serves project repositories from `https://<owner>.github.io/<repo>/`,
so every root-relative link has to carry that prefix. The build takes a base
path for this:

```bash
node build.mjs --base=/coffs-colorectal --out=dist
```

A `<base href>` tag would have been less code, but it also rewrites fragment
anchors and relative links, so the build instead applies the prefix explicitly
in a single pass over the finished markup.

The workflow derives the base from the repository name, so renaming the repo
needs no change here. Two environment variables control absolute URLs:

| Variable | Purpose |
| --- | --- |
| `SITE_BASE` | Path prefix for root-relative links |
| `SITE_ORIGIN` | Public origin used for canonical and schema.org URLs |

`SITE_ORIGIN` is deliberately **not** called `SITE_URL`: the
`actions/configure-pages` action injects its own `SITE_URL` partway through the
job, which silently overrode ours and produced canonical URLs pointing at a
host with no path. If you wire up other Actions, keep an eye out for the same
collision.

### Pointing the real domain at it

Canonical URLs currently point at the GitHub Pages address, because
`coffscolorectal.com.au` does not yet serve this site. Once DNS is moved:

1. Add a file named `CNAME` containing `coffscolorectal.com.au`.
2. Set `SITE_ORIGIN=https://www.coffscolorectal.com.au` and `SITE_BASE=` (empty)
   in the workflow, since a custom domain serves from the root.
3. Re-run the workflow.

### Verifying a deployment

`src/_lib/verify.py` inspects the built artifact rather than trusting the build.
It is what caught the canonical-URL faults on the first deploy. It checks that
every page exists, the base path has been applied, no template placeholders
survived, every internal link resolves to a real file, each page has exactly one
`h1`, the required accessibility and safety elements are present, and the
canonical URL for each page is the one expected.

```bash
node build.mjs --base=/coffs-colorectal --out=dist
python3 src/_lib/verify.py dist /coffs-colorectal https://jwimaster.github.io/coffs-colorectal/
```

---

## Quick start

```bash
node build.mjs                                          # build into the project root
node build.mjs --base=/coffs-colorectal --out=dist       # build for GitHub Pages
python3 src/_lib/verify.py dist /coffs-colorectal        # verify a built artifact
python3 src/_lib/images.py                               # regenerate images (only if sources change)
python3 src/_lib/normalise.py                            # re-apply Australian English to content
node src/_lib/audit.mjs                                  # link, a11y and contrast audit (needs playwright)
node src/_lib/shoot.mjs                                  # screenshots into qa-shots/ (needs playwright)
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
    verify.py              Pre-publish artifact checks
_archive/
  content-extracted/       Text extracted from the crawl (committed)
  html/, media/            Raw crawl and original images (excluded from git)
.github/workflows/         Build and deploy to GitHub Pages
dist/                      Built artifact for publishing (excluded from git)
qa-shots/                  Screenshots from the visual harness (excluded from git)
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

## Design review

The interface was reviewed with [Impeccable](https://github.com/pbakaus/impeccable),
which ships a deterministic detector for AI-generated frontend design.
`.impeccable/config.json` records the run configuration.

```bash
npx impeccable detect dist        # or: impeccable detect dist
```

The first pass found 101 issues. The substantive ones were fixed:

- **A tracked-caps "kicker" above every heading**, plus a pill-shaped eyebrow
  above the hero headline. This is the single most recognisable generated-design
  tell, and Impeccable bans it outright rather than treating it as a default. All
  ten instances are gone. The region the hero eyebrow carried now reads as a
  sentence in the supporting line beneath the headline, where it does actual
  work; the section kickers ("About", "Start here", "Screening") were redundant
  with the headings below them and were deleted. The "Key facts" label survived,
  because it labels a strip rather than sitting above a display headline, but it
  is now a normal sentence-case label instead of a letter-spaced chip.
- **Em-dash saturation**, an AI cadence tell in body copy. The worst page had
  21; em-dashes in prose and in `Label — description` lists became colons,
  commas and parentheses. Em-dashes inside source citations were left alone,
  because they are correct there. Prose em-dash density across the site fell
  from 84 to 15.
- **Line heights below the 1.3 readability floor** on multi-line interface text
  (the brand lockup and link-card titles).

### What the detector could not see

The detector checks rules, not composition, so it missed the largest tell of
all: **the site was built out of card grids.** The conditions index was nine
identical bordered cards and the procedures index was ten — the "icon plus
heading plus text as the page structure" scaffold, which is the category
default the craft guidance names first ("cards are the lazy container"). The
home page had six equal tiles, the resources page twenty more.

Those were replaced with structures that carry their own hierarchy:

- **Conditions and procedures** are now an editorial index: the name carries the
  type weight in the left column, the summary sets in the right, and hairlines
  do the separating. It reads as a reference document rather than a wall of
  boxes, and the titles finally outrank each other visually.
- **The home page** is a weighted routemap rather than six equal choices. "I
  have symptoms" leads at full width and display size, because it is the entry
  point most people need, and the other five fall in beneath it at a third
  width. Hierarchy replaces uniformity.
- **Related links** on clinical pages and the resources index use the same
  index treatment.

Also applied from the same guidance:

- **Browser surfaces.** Text selection, placeholder text, caret colour,
  scrollbars in both engines, focus rings with a surface spacer so the indicator
  clears whatever it sits on, and underline offset. The guidance calls this "the
  cheapest signal that a page was built rather than assembled, and the one
  models skip most reliably" — it was entirely absent before.
- **One authored moment.** The hero panel now arrives as a material: blur
  radius, scale and opacity animate together over 720 ms on an exponential
  ease-out, so the surface reads as glass settling rather than a plain fade.
  Everything else on the page is static at rest.
- **Deleted a generic entrance.** A scroll-reveal system had been written into
  the CSS and JavaScript and applied to zero elements — dead code that would
  have put the same fade-up on every section, which the guidance explicitly
  rules out in favour of one authored moment. Removed entirely, along with the
  2.2 KB of CSS the old card components left behind.

Under `prefers-reduced-motion` the hero is fully visible with no animation, and
under `prefers-reduced-transparency` the panel becomes near-solid; both are
asserted in the verification pass.

### Verified exceptions

Two rules are ignored in `.impeccable/config.json`, both confirmed false
positives by measurement rather than by judgement. They are recorded here so
that nobody re-litigates them, and so that the ignores are not mistaken for a
clean bill of health:

- **`low-contrast` (33 findings).** The detector resolves CSS custom properties
  across theme blocks, pairing light-theme `--brand-text` (`#113d47`) with
  dark-theme `--brand-hover` (`#124b58`) and reporting 1.20:1. Those two values
  never coexist; each theme defines both halves. Measured in a real browser per
  theme, every link state passes: light `#175d6d` on `#fdfcfa` is 7.26:1, dark
  `#9ed4e0` on `#0e181d` is 11.09:1, and forced `:hover` states measure 8.46:1
  and 9.66:1. `src/_lib/audit.mjs` independently re-checks rendered contrast on
  all 33 pages and reports no failures.
- **`cramped-padding` (61 findings).** Reports that section children are "flush
  against bg on all sides". Sections are full-bleed by design and their content
  sits inside `.shell`, which constrains width and centres it; nothing touches
  the background edge. Adding `padding-inline` to `.section` left the count
  unchanged at 61, so the rule is not responding to the property it names.

Both exceptions are also worth treating as a caution: a detector result is
defect evidence, not a verdict, and 94 of the original 101 findings were noise.

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

`_archive/content-extracted/` holds the text extracted from the crawl, so the
rebuild stays traceable. The raw captured HTML and original images are kept
locally but **excluded from the repository**: portions of the captured pages
contain verbatim third-party patient-information text (ASCRS, NHS and others)
that is not ours to redistribute.

Locally, `_archive/` preserves the full crawl:

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
