#!/usr/bin/env python3
"""Normalise content JSON to Australian English and Australian Government
Style Manual conventions, and merge in the surgeon-authored pages.

Run from the project root:  python3 src/_lib/normalise.py
"""

import json, re, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Title / capitalisation corrections. The Style Manual: no initial capital for
# diseases, procedures or syndromes unless a proper noun is involved.
TITLE_MAP = {
    "Crohn's Disease": "Crohn disease",
    "Ulcerative Colitis": "Ulcerative colitis",
    "Haemorrhoids (Piles)": "Haemorrhoids",
    "Anal Fissure": "Anal fissure",
    "Anal Abscess and Fistula": "Anal abscess and fistula",
    "Pilonidal Sinus (Pilonidal Disease)": "Pilonidal sinus",
    "Diverticular Disease": "Diverticular disease",
}

ALIAS = {
    "crohns-disease": "Also called Crohn's disease or IBD",
    "ulcerative-colitis": "Also called colitis, or IBD",
    "haemorrhoids": "Also called piles",
    "anal-fissure": "A tear in the lining of the anus",
    "anal-abscess-and-fistula": "Two related problems: abscess and fistula",
    "pilonidal-sinus": "Also called pilonidal disease or a pilonidal cyst",
    "diverticular-disease": "Includes diverticulosis and diverticulitis",
}

# Ordered text replacements. Longest / most specific first.
REPLACEMENTS = [
    # Eponym loses the possessive per the Style Manual, except where it is the
    # name of an organisation that styles itself with an apostrophe.
    (r"Crohn's & Colitis Australia", "\x00CCA\x00"),
    (r"Crohn's disease", "Crohn disease"),
    (r"Crohn's Disease", "Crohn disease"),
    (r"\x00CCA\x00", "Crohn's & Colitis Australia"),
    # Obsolete branding and older lay terms.
    (r"bowel scan", "bowel screening test"),
    (r"faecal occult blood test \(FOBT\)", "faecal immunochemical test (FIT)"),
    (r"\bFOBT\b", "bowel screening test"),
    (r"CT or CAT scan", "CT scan"),
    (r"\bCAT scan\b", "CT scan"),
    (r"\bdevestating\b", "devastating"),
    (r"[Aa]bdomino-perineal", "abdominoperineal"),
    # Stoma terminology — non-stigmatising, and "stoma" rather than "bag".
    (r'"bag"', '"stoma"'),
    (r"colostomy bag", "stoma appliance"),
    (r"\bthe bag\b", "the stoma"),
    # "at Coffs Harbour this is Coffs Harbour Base Hospital" reads awkwardly and
    # the campus has been renamed.
    (
        r"at Coffs Harbour this is Coffs Harbour Base Hospital",
        "the nearest is Coffs Harbour Health Campus",
    ),
    (r"Coffs Harbour Base Hospital", "Coffs Harbour Health Campus"),
    # Person-first language.
    (r"\bCrohn's patients\b", "people with Crohn disease"),
    (r"\bostomates\b", "people with a stoma"),
    # Punctuation spacing (deliberately conservative — only collapse runs of
    # ordinary spaces, never indentation or newlines).
    (r"([a-z0-9\)])  +([a-z0-9\(])", r"\1 \2"),
]


def fix_text(value):
    if isinstance(value, str):
        out = value
        for pattern, repl in REPLACEMENTS:
            out = re.sub(pattern, repl, out)
        return out
    if isinstance(value, list):
        return [fix_text(v) for v in value]
    if isinstance(value, dict):
        return {k: fix_text(v) for k, v in value.items()}
    return value


def main():
    path = os.path.join(ROOT, "content", "conditions.json")
    data = json.load(open(path, encoding="utf-8"))
    conds = data["conditions"]

    for c in conds:
        c["title"] = TITLE_MAP.get(c["title"], c["title"])
        c["alsoKnownAs"] = ALIAS.get(c["slug"], c.get("alsoKnownAs"))
        # The "when to seek help urgently" bullets duplicate the urgent array.
        c["sections"] = [
            s
            for s in fix_text(c["sections"])
            if s.get("heading", "").strip().lower() != "when to seek help urgently"
        ]
        c = fix_text(c)
        # Re-apply after fix_text (it returns a new object).
        c["title"] = TITLE_MAP.get(c["title"], c["title"])
        c["alsoKnownAs"] = ALIAS.get(c["slug"], c.get("alsoKnownAs"))

    # Write the normalised drafts back.
    json.dump({"conditions": conds}, open(path, "w", encoding="utf-8"),
              indent=2, ensure_ascii=False)

    # Normalise the surgeon-authored cancer pages too.
    cpath = os.path.join(ROOT, "content", "conditions-cancer.json")
    cancer = fix_text(json.load(open(cpath, encoding="utf-8")))
    json.dump(cancer, open(cpath, "w", encoding="utf-8"),
              indent=2, ensure_ascii=False)

    print("conditions normalised:")
    for c in conds:
        print(f"  {c['slug']:28s} {c['title']}")
    for c in cancer:
        print(f"  {c['slug']:28s} {c['title']}  (surgeon-authored)")

    normalise_procedures()


# Procedure titles: Australian English, and the terms used in Australian
# colorectal practice rather than their American equivalents.
PROC_TITLES = {
    "colonoscopy": "Colonoscopy",
    "colon-resection": "Colon resection (colectomy)",
    "laparoscopic-colon-resection": "Laparoscopic colon resection",
    "enhanced-recovery-after-colorectal-surgery": "Enhanced recovery after surgery",
    "rectal-resection": "Rectal resection",
    "abdomino-perineal-resection": "Abdominoperineal resection",
    "abdominoperineal-resection": "Abdominoperineal resection",
    "haemorrhoid-surgery": "Surgery for haemorrhoids",
    "anal-fissure-surgery": "Surgery for anal fissure",
    "anal-fistula-surgery": "Surgery for anal fistula",
    "rectal-prolapse-surgery": "Surgery for rectal prolapse",
}

PROC_SLUGS = {"abdomino-perineal-resection": "abdominoperineal-resection"}

PROC_TEXTS = [
    (r"[Hh]emorrhoid", lambda m: ("H" if m.group(0)[0] == "H" else "h") + "aemorrhoid"),
    (r"[Hh]emorrhoidectomy", lambda m: ("H" if m.group(0)[0] == "H" else "h") + "aemorrhoidectomy"),
    (r"\bfecal\b", "faecal"),
    (r"\bFecal\b", "Faecal"),
    (r"\banesthesia\b", "anaesthesia"),
    (r"\banesthetic\b", "anaesthetic"),
    (r"\besophagus\b", "oesophagus"),
    (r"\btumor\b", "tumour"),
    (r"\btumors\b", "tumours"),
    (r"\bhemorrhage\b", "haemorrhage"),
    (r"\bdiarrhea\b", "diarrhoea"),
    (r"\banalyze\b", "analyse"),
    (r"abdomino-perineal", "abdominoperineal"),
    (r"Abdomino-perineal", "Abdominoperineal"),
]


def normalise_procedures():
    path = os.path.join(ROOT, "content", "procedures.json")
    procs = json.load(open(path, encoding="utf-8"))["procedures"]

    for p in procs:
        p["slug"] = PROC_SLUGS.get(p["slug"], p["slug"])
        p["title"] = PROC_TITLES.get(p["slug"], p["title"])

        def walk(v):
            if isinstance(v, str):
                out = v
                for pattern, repl in PROC_TEXTS:
                    out = re.sub(pattern, repl, out)
                # Reuse the shared corrections (Crohn's, CT scan, stoma terms).
                for pattern, repl in REPLACEMENTS:
                    out = re.sub(pattern, repl, out)
                return out
            if isinstance(v, list):
                return [walk(x) for x in v]
            if isinstance(v, dict):
                return {k: walk(x) for k, x in v.items()}
            return v

        clean = walk({k: v for k, v in p.items() if k != "slug"})
        clean["slug"] = p["slug"]
        p.clear()
        p.update(clean)

    json.dump({"procedures": procs}, open(path, "w", encoding="utf-8"),
              indent=2, ensure_ascii=False)

    print("\nprocedures normalised:")
    for p in procs:
        print(f"  {p['slug']:46s} {p['title']}")


if __name__ == "__main__":
    main()
