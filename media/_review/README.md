# Portrait: search results

A record of the search for a higher-resolution photograph of Dr Andrew
Sutherland, so the same ground is not covered twice.

## Conclusion

**No higher-resolution photograph exists on the public web.** The archived
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
