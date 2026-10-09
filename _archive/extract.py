#!/usr/bin/env python3
"""Extract readable content + asset inventory from the archived coffscolorectal.com.au pages."""
import re, os, glob, html, json

ARCH = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ARCH, "content")
os.makedirs(OUT, exist_ok=True)

def strip_tags(s):
    s = re.sub(r"<script.*?</script>", "", s, flags=re.S | re.I)
    s = re.sub(r"<style.*?</style>", "", s, flags=re.S | re.I)
    s = re.sub(r"<br\s*/?>", "\n", s, flags=re.I)
    s = re.sub(r"</(p|div|li|h[1-6]|tr|figure)>", "\n\n", s, flags=re.I)
    s = re.sub(r"<li[^>]*>", "- ", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s)
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n\s*\n\s*\n+", "\n\n", s)
    return s.strip()

def inline_md(frag):
    frag = re.sub(r'<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>',
                  lambda m: f"[{strip_tags(m.group(2)) or m.group(1)}]({m.group(1)})", frag, flags=re.S | re.I)
    frag = re.sub(r"<(strong|b)>(.*?)</\1>", r"**\2**", frag, flags=re.S | re.I)
    frag = re.sub(r"<(em|i)>(.*?)</\1>", r"*\2*", frag, flags=re.S | re.I)
    return strip_tags(frag)

pages = {}
for f in sorted(glob.glob(os.path.join(ARCH, "html", "*.html"))):
    raw = open(f, encoding="utf-8", errors="replace").read()
    name = os.path.basename(f)[:-5]
    title = (re.findall(r"<title>(.*?)</title>", raw, re.S) or [name])[0].strip()
    title = html.unescape(re.sub(r"\s*\|\s*Coffs Colorectal Surgery\s*$", "", title))
    m = re.search(r'<div class="entry-content">(.*?)</div>\s*<!-- \.entry-content', raw, re.S) \
        or re.search(r'<div class="entry-content">(.*?)</article>', raw, re.S)
    body = m.group(1) if m else ""

    media = []
    for fm in re.finditer(r"<figure.*?</figure>", body, re.S | re.I):
        fig = fm.group(0)
        src = re.findall(r'src="([^"]+)"', fig)
        cap = strip_tags("".join(re.findall(r"<figcaption[^>]*>(.*?)</figcaption>", fig, re.S | re.I)))
        alt = re.findall(r'alt="([^"]*)"', fig)
        if src:
            media.append({"image": src[0], "alt": (alt or [""])[0], "caption": cap})
        body = body.replace(fig, f"\n[[MEDIA:{src[0] if src else ''}]]\n")

    blocks = []
    for bm in re.finditer(r"<(h[2-4]|p|ul|ol|blockquote|table)([^>]*)>(.*?)</\1>", body, re.S | re.I):
        tag, attrs, inner = bm.group(1).lower(), bm.group(2), bm.group(3)
        txt = inline_md(inner).strip()
        if not txt:
            continue
        if tag.startswith("h"):
            blocks.append(f"{'#' * int(tag[1])} {txt}")
        elif tag in ("ul", "ol"):
            items = [strip_tags(li).strip() for li in re.findall(r"<li[^>]*>(.*?)</li>", inner, re.S | re.I)]
            blocks.append("\n".join(f"- {i}" for i in items if i))
        elif tag == "blockquote":
            blocks.append("> " + txt)
        elif tag == "table":
            rows = re.findall(r"<tr[^>]*>(.*?)</tr>", inner, re.S | re.I)
            out = []
            for i, r in enumerate(rows):
                cells = [strip_tags(c).strip().replace("\n", " ") for c in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", r, re.S | re.I)]
                if cells:
                    out.append("| " + " | ".join(cells) + " |")
                    if i == 0:
                        out.append("|" + "---|" * len(cells))
            blocks.append("\n".join(out))
        else:
            blocks.append(txt)

    linkm = re.search(r"<link[^>]+rel=['\"]canonical['\"][^>]*>", raw, re.I)
    pages[name] = {
        "file": name, "title": title,
        "canonical": (re.findall(r'href="([^"]+)"', linkm.group(0)) or [""])[0] if linkm else "",
        "media": media, "body": "\n\n".join(blocks),
    }

    with open(os.path.join(OUT, name + ".md"), "w", encoding="utf-8") as fh:
        fh.write(f"# {title}\n\n")
        for md in media:
            fh.write(f"![{md['alt'] or md['caption']}]({md['image']})\n\n")
        fh.write(pages[name]["body"] + "\n")

json.dump(pages, open(os.path.join(ARCH, "pages.json"), "w"), indent=2)

allmedia = sorted({m["image"] for p in pages.values() for m in p["media"]})
uploads = sorted(set(re.findall(r"https?://coffscolorectal\.com\.au/wp-content/uploads/[^\"' )>]+",
                                "\n".join(open(f, encoding="utf-8", errors="replace").read()
                                          for f in glob.glob(os.path.join(ARCH, "html", "*.html"))))))
open(os.path.join(ARCH, "media-urls.txt"), "w").write("\n".join(uploads) + "\n")

print(f"pages parsed: {len(pages)}")
for n, p in pages.items():
    print(f"  {n:52s} body={len(p['body']):6d} chars  media={len(p['media'])}")
print("\nfigure media:", len(allmedia))
print("upload urls:", len(uploads))
