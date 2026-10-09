#!/usr/bin/env python3
"""Process the media recovered from the archive into responsive, modern formats.

Inputs are the original 2014 assets, so we only ever downscale or re-encode —
never upscale and pretend. Outputs WebP (primary) and JPEG (fallback), at 1x and
2x device pixel ratios where the source supports it.

Run:  python3 src/_lib/images.py
"""

import os, shutil
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, "_archive", "media")
OUT = os.path.join(ROOT, "media")

os.makedirs(OUT, exist_ok=True)


def save(img, name, widths, focal=None):
    """Write `name-<w>.webp` and `.jpg` for each width, skipping anything the
    source cannot support."""
    for w in widths:
        if w > img.width:
            continue
        h = round(img.height * (w / img.width))
        resized = img.resize((w, h), Image.LANCZOS)
        for fmt, ext, kw in (
            ("WEBP", "webp", {"quality": 82, "method": 6}),
            ("JPEG", "jpg", {"quality": 84, "optimize": True, "progressive": True}),
        ):
            out = os.path.join(OUT, f"{name}-{w}.{ext}")
            copy = resized
            if fmt == "JPEG" and copy.mode in ("RGBA", "LA", "P"):
                bg = Image.new("RGB", copy.size, (255, 255, 255))
                bg.paste(copy.convert("RGBA"), mask=copy.convert("RGBA").split()[-1])
                copy = bg
            copy.save(out, fmt, **kw)
            print(f"  {os.path.basename(out):44s} {os.path.getsize(out):>7d} B  {w}x{h}")


def centre_circle(img, size, focus=(0.5, 0.5)):
    """Crop to a square centred on `focus`, then mask to a circle.

    focus is the point of the source, as a fraction of width and height, that
    should land at the centre of the square. A default of (0.5, 0.5) is a plain
    centre crop; a portrait where the subject sits off-centre needs the focus
    moved rather than the whole frame thrown away.
    """
    img = ImageOps.exif_transpose(img).convert("RGBA")
    side = min(img.width, img.height)
    cx, cy = img.width * focus[0], img.height * focus[1]
    left = max(0, min(img.width - side, int(round(cx - side / 2))))
    top = max(0, min(img.height - side, int(round(cy - side / 2))))
    img = img.crop((left, top, left + side, top + side)).resize(
        (size, size), Image.LANCZOS
    )
    mask = Image.new("L", (size, size), 0)
    from PIL import ImageDraw

    ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def main():
    print("29 Orlando Street (practice building) — wide banner")
    building = Image.open(os.path.join(SRC, "coffs_colorectal_building1.jpg"))
    save(building, "29-orlando-street", [640, 960, 1260])

    print("\nCoffs Creek estuary — hero background")
    estuary = Image.open(os.path.join(SRC, "coffs_harbour_and_surrounds.jpg"))
    save(estuary, "coffs-creek-estuary", [800])

    print("\nDr Andrew Sutherland — circular portrait")
    # Preferred source: the 2208x2944 practice photoshoot portrait of 2023, in
    # which he sits slightly left of centre with the corridor behind him. Falls
    # back to the original 110x110 archived file if the larger one is absent.
    modern = os.path.join(SRC, "dr_andrew_sutherland_2023_2208x2944.webp")
    if os.path.exists(modern):
        head = Image.open(modern)
        focus = (0.44, 0.30)          # his face, not the frame centre
        print(f"  using {os.path.basename(modern)} ({head.width}x{head.height})")
    else:
        head = Image.open(os.path.join(SRC, "dr_andrew_sutherland.png"))
        focus = (0.5, 0.5)
        print("  using the archived 110x110 file (larger source not present)")
    for size in (220, 440):
        circle = centre_circle(head, size, focus)
        circle.save(os.path.join(OUT, f"dr-andrew-sutherland-{size}.webp"),
                    "WEBP", quality=88, method=6)
        circle.save(os.path.join(OUT, f"dr-andrew-sutherland-{size}.png"))
        print(f"  dr-andrew-sutherland-{size}.webp / .png")

    # Convenience 1x names used by the markup.
    print("\nAliases")
    pairs = [
        ("29-orlando-street-1260.webp", "29-orlando-street.webp"),
        ("coffs-creek-estuary-800.webp", "coffs-creek-estuary.webp"),
        ("coffs-creek-estuary-800.jpg", "coffs-creek-estuary.jpg"),
        ("dr-andrew-sutherland-440.webp", "dr-andrew-sutherland.webp"),
    ]
    for src_name, dst in pairs:
        s = os.path.join(OUT, src_name)
        if os.path.exists(s):
            shutil.copyfile(s, os.path.join(OUT, dst))
            print(f"  {dst}")

    print("\nDone. Output in media/")


if __name__ == "__main__":
    main()
