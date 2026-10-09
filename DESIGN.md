# DESIGN.md — Coffs Colorectal Surgery

The design contract for this site. Every page is built from these tokens; nothing
is invented per page. Written after an audit against the AI-design tell catalog,
which found the previous look sitting in a second-order default cluster.

## The direction

**Clinical, not editorial.**

The subject is a specialist surgical practice. Its own artefacts are theatre
lists, endoscopy reports, patient information sheets, screening kits and hospital
wayfinding. Those are high-contrast, information-dense, functional objects, built
to be read accurately by people who are anxious, in a hurry, or older.

The previous design was neither clinical nor editorial — it was warm and soft:
parchment ground, sand-toned surfaces, a decorative ocean-to-banksia colour ramp,
18–26px radii, and frosted glass on two surfaces. It read as "tasteful" rather
than as anything to do with colorectal surgery, which is what the tell catalog
calls a second-order default: the look a model reaches for once purple is ruled
out. It was replaced rather than softened.

Two decisions carry the direction:

1. **One accent with one job.** Blue-teal is the practice's own colour, and it
   marks only what you can act on — links, primary actions, the current section.
   It is never decoration. Everything else is ink on a cool near-white ground.
2. **Hierarchy from weight and rule, not from softness.** Public Sans at 400 /
   600 / 700 / 800, tight radii, and hairlines separating content. Depth is a
   defined border first and a tight shadow second, never a halo.

## Colour

Every value is measured against WCAG 2.2 AA; ratios are against `--bg` unless
noted. `src/_lib/audit.mjs` re-checks rendered contrast on all 33 pages.

| Token | Light | Role | Evidence |
|---|---|---|---|
| `--bg` | `#f7f9fa` | Page ground | Cool near-white. Deliberately off the warm/parchment coordinates that define the SD1 cluster. |
| `--surface` | `#ffffff` | Panels, index rows | |
| `--bg-sunken` | `#eff3f5` | Alternating sections | |
| `--text` | `#0b1b22` | Body and headings | Blue-black. 16.65:1 |
| `--text-muted` | `#4a5d66` | Supporting prose | 6.52:1 |
| `--text-subtle` | `#5c7078` | Captions, meta | 4.92:1 |
| `--brand` | `#0b5666` | Actions, links, current section | 7.84:1. The practice's identity colour, kept. |
| `--accent` | `var(--brand)` | — | Aliased deliberately: one hue cannot do two jobs. |
| `--red-600` | `#a8241a` | Genuine urgency only | 6.78:1. Never emphasis. |
| `--amber-700` | `#6b4708` | "Get help" states | |
| `--positive-700` | `#14532d` | Reassurance states | |

There is no decorative ramp. The former `--ocean-*`, `--sand-*` and `--banksia-*`
scales were deleted, not left unused.

**Dark appearance** is a separate considered palette, not an inversion: ground
`#0a1519`, ink `#eef4f5`, brand `#7cc3d4`. It follows the operating system unless
the reader chooses otherwise.

## Type

**Public Sans** (US Web Design System, SIL OFL 1.1), self-hosted, Latin subset,
180 KB across five files. Chosen because it was designed for legible
public-service information — the same job this site does.

- Display and headings: 700–800
- Body: 400, 17–19px fluid
- Interface and labels: 600
- Scale: `--step-4` down to `--step--1`, fluid `clamp()`, all in `rem` so the
  layout scales with the reader's text-size setting.

There is deliberately **no second family**, and no system-stack fallback doing
the design work. Weight contrast carries the hierarchy.

**Sentence case throughout.** No tracked all-caps labels, no eyebrows above
headings. Both were removed: the catalog names them as the single most common
generated-page tell, and they were doing no informational work.

## Layout

- One shell, `min(100% - 2.5rem, 78rem)`.
- Sections are full-bleed; content sits inside `.shell`.
- **Conditions and procedures are an editorial index**, not a card grid: name in
  the left column, summary in the right, hairlines between. The name carries the
  type weight, so entries outrank each other visually.
- **The home page is a weighted routemap**, not six equal tiles. "I have symptoms"
  leads at full width and display size because it is the entry point most people
  need; the other five fall in beneath at a third width.
- Cards are used only where a surface genuinely is a discrete, self-contained
  object. They are never the page's structure.

## Profile page

The surgeon's page leads with his role, not his name repeated: the `h1` carries
the name, a circular portrait sits beside a one-line role and a short credential
sentence, and a rule closes the block. The biography and the qualifications panel
then sit side by side, deliberately allowed to differ in height because they are
different kinds of content — reference material beside prose.

The portrait is a circular cut-out supplied with its own alpha edge, so it takes
no border and no radius: the shape is the image. It is framed from the 2208x2944
source with an explicit focus point and zoom rather than a centre crop, because
the subject sits left of centre with a corridor behind him.

## Signature detail

The **index row**: name, hairline, summary in a second column, arrow only on
hover. It is the whole site's organising unit, and it is what makes the
conditions and procedures pages read as a reference rather than a brochure.

## Motion

One authored moment, not an entrance on everything:

- The hero panel settles over 720ms on an exponential ease-out — opacity 0 → 1
  and scale 0.985 → 1, sampled frame by frame to confirm continuity.
- Everything else is static at rest.
- `prefers-reduced-motion: reduce` renders the hero fully visible with no
  animation. `prefers-reduced-transparency` makes the header opaque.
- A scroll-reveal system that applied the same fade-up to every section was
  written, never applied to a single element, and has been deleted.

## Browser surfaces

Themed from the palette, because leaving them at browser defaults is the
clearest sign a page was assembled rather than built: `::selection`, placeholder
colour, `caret-color`, scrollbars in both engines, focus rings with a surface
spacer, and underline offset.

## Known departures

| Tell | Status |
|---|---|
| `K3` glassmorphism | **Kept, earned.** One `backdrop-filter`, on the sticky header, whose entire job is to sit over content scrolling beneath it. Every reflexive blur was removed, including the hero panel's. |
| `K7` no visible focus | **False positive.** Defined once, globally, in `site.css`; the scanner reports it per partial because it cannot see across files. |
| `C8` one hue pretending to be two | **False positive.** The scanner compares `#7cc3d4` with itself after the accent was aliased to the brand. Two identical values are self-evidently one colour. |
| `cramped-padding` (Impeccable) | **False positive.** Sections are full-bleed by design; content sits inside `.shell`. Adding padding changed the finding count by zero. |
| `low-contrast` (Impeccable) | **False positive.** The detector resolves custom properties across theme blocks and pairs a light-theme value with a dark-theme one. Measured per theme, every combination passes. |

## Not done, and why

- **The portrait is a 110×110px image centre-cropped to a circle.** A geometric
  mask approximating a photographic edge is the cheap substitute for a real
  cut-out. The fix is photography, not CSS.
- **The hero and building photographs are low-resolution.** The banner is a
  real-estate listing shot. The design works around them; it cannot fix them.
