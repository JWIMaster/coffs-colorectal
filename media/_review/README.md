# Portrait: search results

A record of the search for a higher-resolution photograph of Dr Andrew
Sutherland, so the same ground is not covered twice.

## Resolved: a high-resolution portrait was found

**A 2208x2944 professional portrait is now in use.** It is 110x the pixel area
of the 217x277 file that was previously the best available, and it renders
sharply at every size up to 2x.

- **Source:** Coffs Day Hospital's `/our-surgeons` page
  (<https://www.coffsdayhospital.com.au/our-surgeons>), image
  `IMG_8509+2.jpg` on their Squarespace CDN. `?format=original` returns the same
  2208x2944, so that is the uploaded master.
- **Shows:** him smiling in black scrubs embroidered *"Coffs Colorectal Surgery"*
  and a teal surgical cap, in a hospital corridor. A practice photoshoot, with
  the untouched camera-original filename.
- **Identity, verified independently of the search that found it:** rendering the
  page in a real browser and walking the DOM gives the image-to-name mapping
  directly, and it is self-consistent:

  ```
  IMG_8509+2.jpg                  -> Dr Andrew Sutherland, Colorectal
  680ec3c6..._wilson-home-2000px  -> Dr Wilson Petrushnko, Colorectal
  dr-das-profile.jpg              -> Dr Kamala Das, General
  ```

  The neighbouring entries confirm the ordering is meaningful rather than
  coincidental. The scrubs also carry his own practice name.
- **A copy is kept locally** at `_archive/media/dr_andrew_sutherland_2023_2208x2944.webp`
  so the build does not depend on their CDN, and `src/_lib/images.py` generates
  the responsive set from it.
- **The crop is explicit, not automatic.** He sits left of centre, with a bright
  corridor filling the right of the frame. A plain centre crop loses his head to
  the right-hand third and fills half the circle with room; a tighter crop with
  the same focus then frames him too close, chin near the edge. `images.py`
  takes both a focus point and a zoom, and now uses `(0.40, 0.26)` at `zoom 1.30`
  — close enough that he fills the circle, wide enough to keep his shoulders.
  `media/_review/framing-options.png` shows the four variants that were compared.

### How it sits on the page

The portrait is **not** in a column of its own. It introduces the page directly
beneath the `h1`, as a circular avatar beside his role and credentials, with a
rule under it; the biography and the qualification panel then sit side by side
below, roughly matched in height.

The earlier arrangement put the portrait and the qualification panel stacked in a
narrow left column next to the prose. The prose is roughly three times the
height of that column, so the portrait ended up floating above a large dead gap —
the page read as two unrelated halves. `media/_review/framing-options.png` and
the notes above record the crop work that went with the change.

### Licensing — action required before this is published

The file is hosted on Coffs Day Hospital's CDN and is **their asset, or the
practice's**. It is not public domain and not stock. `IMG_8509` is an untouched
camera original from what is plainly a commissioned shoot, so full-resolution
files exist. **Ask the practice (02 6652 6211) for the master and written
permission to publish**, and while asking, see whether they would rather supply
a different frame from the same shoot — this one is a working portrait in a
surgical cap, and a plain-background headshot would suit the site better. The
current photo can be reverted to the archived 110px file in one line if wanted.

## Superseded notes

The rest of this file records the search before that find. Most of it is now
historical, but the method correction below still matters.

## Conclusion

**No higher-resolution version of the OLD office headshot exists.** The archived
110 × 110 PNG is the largest version of his current portrait that anyone
publishes, and it is the original upload — there is no larger master anywhere.

Two copies of the **same photograph** exist at slightly larger sizes. Neither
improves on what is already in use, because all three look equivalent at the
size the site renders them. See `portrait-options-220px.png` for the
side-by-side at 220px.

| Source | Size | Note |
|---|---|---|
| Archived original (in use) | 110 × 110 | The original upload. Verified byte-identical across every Wayback capture from 2014 to 2017. |
| `candidate-ramsay-217x277.png` | 217 × 277 | Ramsay Health Care specialist directory. Largest available. Soft. |
| `candidate-healthshare-125x143.jpg` | 125 × 143 | HealthShare. A tighter crop, so fewer pixels than Ramsay despite the same photo. |

Measured edge energy at 220px render size: archived 4.3, Ramsay 4.0, HealthShare
5.1. The differences are noise. The source photograph is soft, and every copy
inherits that.

## Why the archived file cannot be improved

The old site's `<img>` declared `width="110" height="110"`, and the file itself
*is* 110 × 110 — the original was uploaded at that size, not resized down by
WordPress. Asking the Wayback Machine for it at six different capture timestamps
(2014–2020) returns the identical 27,856 bytes each time. WordPress's usual
`-150x150`, `-300x300`, `-768x768`, `-1024x1024` derivatives all 404, which they
would not if a larger original had ever existed.

## Correction: a 2023 photograph does exist, and I first got this wrong

An earlier version of this record listed the *News Of The Area* bowel-cancer
coverage under false leads, on the basis that a perceptual-hash comparison put
those images 127–144 away from the archived portrait. **That reasoning was
invalid and the conclusion was wrong.**

The likeness limit: perceptual hashing answers "is this the same *photograph*",
not "is this the same *person*". A 2023 outdoor group shot and a 2014 office
headshot can never hash close, no matter who is in them. The rule I applied
(> 100 means a different person) only holds between photographs taken under
similar conditions. Used this way it produced a confident false negative.

What settles it is ground truth that was sitting in the article the whole time:
the caption names him.

> Donna Blythe, who was symptom free when she was diagnosed with bowel cancer,
> with her colorectal surgeon Dr Andrew Sutherland.

— *News Of The Area*, 19 June 2023,
<https://www.newsofthearea.com.au/coffs-locals-share-importance-of-bowel-cancer-screening>

The group caption names all five subjects in the order they appear, and the man
in the light-blue shirt is second from the left: Dr Andrew Sutherland. The other
surgeon present, Dr Wilson Petrushnko, is the man in the pink shirt and tie —
plainly a different person. Two photographs from that shoot are of him
(`news_bowel_AF_PY2.jpg`, him with Donna Blythe; `news_bowel_AF_PY1.jpg`, the
group of five). Side-by-side verification is in `verify-2023-photo-identity.png`.

**Method rule for next time:** a named caption or byline is ground truth. A
perceptual hash is a heuristic, and it may only be used to rule images *in*;
it cannot rule a person out across different photographs.

### This still does not solve the portrait

The 2023 photograph is a genuine second photograph of him, and it is 9 years
newer, but it is not usable as the site portrait:

| Source | Usable square | Upscale at 1x (220px) | Upscale at 2x (440px) |
|---|---|---|---|
| Archived original (in use) | 110 px | 2.00x | 4.00x |
| Ramsay directory | 217 px | **1.01x** | 2.03x |
| HealthShare | 125 px | 1.76x | 3.52x |
| 2023 news photo, his head | ~261 px | 0.84x | **1.69x** |

Even taking the most generous crop, his head is about 261px in a 765x496 frame,
so it is still smaller than the Ramsay version at high-DPI and only marginally
better than the archived one. It is also the wrong genre: outdoors, at the
jetty, holding a "Help Beat Bowel Cancer" sign, standing beside a patient. For a
practice's portrait that reads as a news photo, not a headshot.

So the conclusion is unchanged, for a different and better-evidenced reason:
**the largest usable headshot remains the Ramsay 217x277, and the fix is still a
commissioned photograph.**

## Sources checked

| Source | Outcome |
|---|---|
| `coffscolorectal.com.au` and `.com` | **Domain no longer resolves.** No live site. |
| Wayback CDX, `wp-content/uploads/*` for 2014–2017 | Four files total. Only the 110px portrait is a person. |
| Wayback CDX, every capture of his bio page (2014–2017) | All reference the same 110px image. |
| Ramsay Health Care specialist directory | Same photo, 217 × 277. **Best available.** |
| Baringa Private Hospital (Ramsay) | Same Ramsay asset. |
| Coffs Day Hospital "Our Surgeons" | His bio text is there, but the photo on that page labelled `dr-das-profile` is **a different surgeon** (Coffs Coast Metabolic Surgery scrubs) — confirmed by perceptual hash, distance 133. |
| HealthShare profile | Same photo, 125 × 143, tighter crop. |
| healthdirect service finder | No photograph. |
| canrefer.org.au | No photograph. |
| ausdocfinder.com | Serves a generic placeholder, literally `/img/male.webp`. |
| Yellow Pages listing | A marketing billboard with a **stock model**, not him. |
| myhospitalnow, aushealthpages | No photograph of him. |
| CSSANZ "Find a Colorectal Surgeon" | iMIS postback form; no images on the public page. |
| AHPRA / RACS finders | No photographs published. |
| `newsofthearea.com.au` bowel-cancer screening (19 Jun 2023) | **He is in two of the photos** — see the correction above. Too small and the wrong genre for the portrait. |
| Red Apple Day 2024 and 2025 coverage | Name him in text only; photos are patients and other staff. |
| `australianseniorsnews.com.au` implant-service story | Different people. |
| DuckDuckGo and Bing image search, four phrasings | Only the sources above. |
| `coffsharboursurgical.com.au`, `coffsms.com.au` | Different practice; no photograph of him. |

## False leads, so nobody chases them again

Search engines conflate this Dr Andrew Sutherland with several others. The
following are **not** him, all confirmed by perceptual-hash comparison against
the archived original:

- Any photograph in "Coffs Coast Metabolic Surgery" scrubs — a different surgeon.
- `gray-adams.com`, `halidonhill.com.au`, `cornwalls.com.au`, ResearchGate
  profiles — other people named Andrew Sutherland.
- Yellow Pages and hospital billboard images — stock photography.

Identity was checked by difference-hash against the archived photo. Distance
≤ 40 is the same photograph, ≤ 95 the same person in a different photograph, and
anything above 100 is a different person. Every reported match was also verified
by eye — same blue striped shirt, same black office chair, same room.

## The actual fix

**Commission a photograph.** A single well-lit headshot from the practice would
resolve this and cannot be found on the web. At least 800 × 800, ideally with
space around the head so it can be cropped square and circular.

If one arrives, process it with `python3 src/_lib/images.py` and it will generate
the responsive set the templates already expect.

## Licensing

Both alternatives are hosted by third parties and are **their** assets — Ramsay
Health Care's and HealthShare's respectively. Publishing either on the practice's
own site would need permission. Neither is an improvement visually, so this is
noted for completeness rather than as a recommendation.
