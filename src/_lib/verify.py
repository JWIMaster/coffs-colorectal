#!/usr/bin/env python3
"""Verify a built site before it is published.

Checks the artifact rather than trusting the build: every page exists, the
deployment base path has been applied, no template placeholders survived, and
the safety and accessibility elements are present. Exits non-zero on any
failure, so a broken build never reaches GitHub Pages.

    python3 src/_lib/verify.py dist /coffs-colorectal \
        https://jwimaster.github.io/coffs-colorectal/
"""

import pathlib
import re
import sys

REQUIRED = [
    ('lang="en-AU"', "page language declaration"),
    ('rel="canonical"', "canonical link"),
    ('id="main"', "main landmark"),
    ('name="viewport"', "viewport meta"),
    ("not monitored outside business hours", "after-hours safety notice"),
    ("In an emergency", "emergency notice"),
]

# Assets every page depends on.
ASSETS = [
    "assets/favicon.svg",
    "media/coffs-creek-estuary.webp",
    "media/coffs-creek-estuary.jpg",
    "media/29-orlando-street.webp",
    ".nojekyll",
]


def main():
    if len(sys.argv) < 2:
        print("usage: verify.py <dist-dir> [base-path]", file=sys.stderr)
        return 2

    dist = pathlib.Path(sys.argv[1])
    base = (sys.argv[2] if len(sys.argv) > 2 else "").rstrip("/")
    expect_canonical = sys.argv[3] if len(sys.argv) > 3 else ""

    if not dist.is_dir():
        print(f"FAIL: {dist} is not a directory — did the build run?")
        return 1

    # Discover pages the way a web server would: every directory index.
    pages = sorted(p for p in dist.rglob("index.html"))
    if not pages:
        print("FAIL: no index.html files found")
        return 1

    print(f"verifying {len(pages)} pages (base {base or '/'})")
    errors = []

    for path in pages:
        rel = path.relative_to(dist).as_posix()
        url = "/" + rel[: -len("index.html")]
        html = path.read_text(encoding="utf-8")

        # Clickable path for error messages.
        display = url if url != "/" else "/"

        leftover = set(re.findall(r"\{\{\w+\}\}", html))
        if leftover:
            errors.append(f"{display}: unresolved placeholders {sorted(leftover)}")

        if base:
            unprefixed = [
                m
                for m in re.findall(r'(?:href|src|srcset)="(/[^"]*)"', html)
                if not m.startswith(base + "/")
            ]
            if unprefixed:
                errors.append(
                    f"{display}: links escape the base: {sorted(set(unprefixed))[:4]}"
                )

        for needle, label in REQUIRED:
            if needle not in html:
                errors.append(f"{display}: missing {label}")

        if expect_canonical:
            canonical = re.findall(r'<link rel="canonical" href="([^"]+)"', html)
            expected = expect_canonical + ("" if url == "/" else url.lstrip("/"))
            if canonical != [expected]:
                errors.append(
                    f"{display}: canonical is {canonical or ['none']}, expected {expected}"
                )

        h1s = html.count("<h1")
        if h1s != 1:
            errors.append(f"{display}: {h1s} h1 elements")

        # Every internal link must resolve to a file in the artifact.
        for href in set(re.findall(r'href="(/[^"#?]*)"', html)):
            target = href
            if base and target.startswith(base + "/"):
                target = target[len(base):]
            elif base and target == base:
                target = "/"
            local = dist / target.lstrip("/")
            if not (local.exists() or local.with_suffix(".html").exists()
                    or (local / "index.html").exists()):
                errors.append(f"{display}: broken internal link {href}")

    for asset in ASSETS:
        if not (dist / asset).exists():
            errors.append(f"missing asset: {asset}")

    if errors:
        print(f"\n{len(errors)} problem(s):")
        for e in errors[:40]:
            print("  " + e)
        if len(errors) > 40:
            print(f"  ... and {len(errors) - 40} more")
        return 1

    print("OK: structure, base paths, placeholders, links and required elements verified")
    return 0


if __name__ == "__main__":
    sys.exit(main())
