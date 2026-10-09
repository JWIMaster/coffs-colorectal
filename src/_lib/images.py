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


def centre_circle(img, size):
    """Crop to a centred square, then mask to a circle with transparency."""
    img = ImageOps.exif_transpose(img).convert("RGBA")
    side = min(img.width, img.height)
    left = (img.width - side) // 2
    top = (img.height - side) // 2
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
    head = Image.open(os.path.join(SRC, "dr_andrew_sutherland.png"))
    for size in (220, 440):
        circle = centre_circle(head, size)
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
