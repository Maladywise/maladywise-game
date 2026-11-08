#!/usr/bin/env python3
"""Add BreadcrumbList JSON-LD to every indexable page (idempotent, stdlib only).

HOW TO RUN
    python3 _scripts/add_breadcrumbs.py            (writes changes)
    python3 _scripts/add_breadcrumbs.py --dry-run  (lists what would change)
    python3 _scripts/add_breadcrumbs.py --skip-dirty   (leave files with
        uncommitted changes alone, e.g. another task's work in progress)

What it does
  - Pages that already carry a BreadcrumbList (standalone or nested inside
    MedicalWebPage "breadcrumb") are left alone, except a standalone list that
    does not start at the home page gets "Malady Wise" prepended.
  - Other indexable pages (self canonical, not noindex, not a redirect stub)
    get <script type="application/ld+json" id="mw-breadcrumb-ld"> before
    </head>. Re-running regenerates that block in place.
  - The trail comes from the URL path plus the SECTIONS / GAME_HUBS maps below.
    Daily games and practice quizzes sit under "Medical games"; the bonus
    arcade games under "Arcade".

The visible breadcrumb line on content pages is drawn by assets/shell.js from
this same JSON-LD, so this file is the single source of truth.
"""
import json
import os
import re
import subprocess
import sys
from html import unescape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://maladywise.com"
SKIP_DIRS = {".git", "node_modules", "_data", "__pycache__", "_scripts", "_social"}
HOME = ("Malady Wise", "/")

# Section hubs: folder -> display name (used for the hub page itself and as the
# middle crumb for anything below it).
SECTIONS = {
    "conditions": "Conditions",
    "medicines": "Medicines",
    "exercises": "Exercise handouts",
    "deep-dives": "Deep dives",
    "tools": "Tools",
    "specialists": "Specialists and allied health",
    "medical-games": "Medical games",
    "arcade": "Arcade",
    "zebra-mail": "Zebra Mail",
    "mental-health-check": "Mental health check",
    "anatomy-quiz": "Anatomy quizzes",
    "days": "World health days",
    "normie": "Normie mode",
    "rare-conditions": "Zebra Atlas",
    "blood-tests": "Blood test results",
    "glp-1": "GLP-1 medicines",
}
# Top-level pages that live under a hub even though their URL is /<name>/.
ARCADE = {"basil-clover", "stackulus", "mergeon"}
QUIZZES = {"ecg-quiz", "x-ray-quiz", "medical-terminology-quiz", "medical-specialty-quiz", "anatomy-quiz"}
# Folders this script never edits (owned elsewhere).
EXCLUDE = {"days"}

LD_RE = re.compile(r'<script type="application/ld\+json"([^>]*)>(.*?)</script>', re.S)


def read(p):
    with open(p, encoding="utf-8") as fh:
        return fh.read()


def head_of(src):
    i = src.find("</head>")
    return src[:i] if i >= 0 else src[:8000]


def is_indexable(src, url):
    h = head_of(src).lower()
    if re.search(r'<meta[^>]+name=["\']robots["\'][^>]+noindex', h) or 'http-equiv="refresh"' in h:
        return False
    m = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)', head_of(src))
    return bool(m) and m.group(1) == url


def find_crumbs(o):
    if isinstance(o, dict):
        if o.get("@type") == "BreadcrumbList":
            yield o
        for v in o.values():
            yield from find_crumbs(v)
    elif isinstance(o, list):
        for v in o:
            yield from find_crumbs(v)


def lds(src):
    out = []
    for m in LD_RE.finditer(src):
        try:
            out.append((m, json.loads(m.group(2))))
        except ValueError:
            out.append((m, None))
    return out


def clean(t):
    t = re.sub(r"<[^>]+>", "", t)
    t = unescape(t).strip()
    t = re.sub(r"\s+", " ", t)
    # drop trailing emoji / symbols
    t = re.sub(r"[\s\U0001F000-\U0001FFFF☀-➿️]+$", "", t)
    return t


def name_of(rel_dir):
    """Display name for the page in folder rel_dir ('' = home)."""
    if rel_dir in SECTIONS:
        return SECTIONS[rel_dir]
    p = os.path.join(ROOT, rel_dir, "index.html")
    if not os.path.isfile(p):
        return None
    src = read(p)
    for _, j in lds(src):
        if isinstance(j, dict) and j.get("@type") in ("WebApplication", "VideoGame") and j.get("name"):
            return j["name"]
    if rel_dir.endswith("/archive") or rel_dir == "archive":
        return "Archive"
    m = re.search(r"<h1[^>]*>(.*?)</h1>", src, re.S)
    t = clean(m.group(1)) if m else ""
    if not t or t.lower() in ("bonus game",):
        tm = re.search(r"<title>([^<]*)</title>", src)
        t = clean(tm.group(1).split("|")[0]) if tm else rel_dir
    if ":" in t and len(t) > 24:
        t = t.split(":")[0].strip()
    return t


def is_game(rel_dir):
    p = os.path.join(ROOT, rel_dir, "index.html")
    if not os.path.isfile(p):
        return False
    return any(isinstance(j, dict) and j.get("@type") == "WebApplication" for _, j in lds(read(p)))


def trail(rel_dir):
    parts = [x for x in rel_dir.split("/") if x]
    if not parts:
        return None
    items = [HOME]
    top = parts[0]
    if top in ARCADE:
        items.append((SECTIONS["arcade"], "/arcade/"))
    elif top in QUIZZES or (top not in SECTIONS and is_game(top)):
        items.append((SECTIONS["medical-games"], "/medical-games/"))
    for i in range(len(parts)):
        d = "/".join(parts[: i + 1])
        n = name_of(d)
        if n is None:
            continue  # folder without its own page
        items.append((n, "/" + d + "/"))
    return items


def to_ld(items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": SITE + u}
                                for i, (n, u) in enumerate(items)]}


def dump(o):
    return json.dumps(o, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def dirty_files():
    try:
        out = subprocess.run(["git", "-C", ROOT, "status", "--porcelain"], capture_output=True, text=True).stdout
    except OSError:
        return set()
    return {os.path.normpath(os.path.join(ROOT, line[3:].strip().strip('"'))) for line in out.splitlines()}


def main():
    dry = "--dry-run" in sys.argv
    dirty = dirty_files() if "--skip-dirty" in sys.argv else set()
    changed = []
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = sorted(x for x in dirs if x not in SKIP_DIRS)
        if "index.html" not in files:
            continue
        p = os.path.join(d, "index.html")
        rel_dir = os.path.relpath(d, ROOT).replace(os.sep, "/")
        rel_dir = "" if rel_dir == "." else rel_dir
        if rel_dir.split("/")[0] in EXCLUDE or os.path.normpath(p) in dirty:
            continue
        url = SITE + "/" + (rel_dir + "/" if rel_dir else "")
        src = read(p)
        if not rel_dir or not is_indexable(src, url):
            continue
        new = src
        existing = [(m, j) for m, j in lds(src) if j is not None and list(find_crumbs(j))]
        ours = [m for m, j in lds(src) if 'id="mw-breadcrumb-ld"' in m.group(1)]
        if existing and not ours:
            # fix a standalone list that skips the home page
            for m, j in existing:
                if isinstance(j, dict) and j.get("@type") == "BreadcrumbList":
                    el = j.get("itemListElement") or []
                    if el and el[0].get("item") != SITE + "/":
                        items = trail(rel_dir)
                        items[-1] = (el[-1]["name"], items[-1][1])
                        fixed = to_ld(items)
                        new = new.replace(m.group(0), "<script type=\"application/ld+json\"%s>%s</script>" % (m.group(1), dump(fixed)), 1)
        else:
            items = trail(rel_dir)
            if not items or len(items) < 2:
                continue
            block = '<script type="application/ld+json" id="mw-breadcrumb-ld">%s</script>' % dump(to_ld(items))
            if ours:
                new = new.replace(ours[0].group(0), block, 1)
            else:
                new = new.replace("</head>", block + "\n</head>", 1)
        if new != src:
            changed.append(rel_dir)
            if not dry:
                with open(p, "w", encoding="utf-8") as fh:
                    fh.write(new)
    for c in changed:
        print(("would update " if dry else "updated ") + c)
    print(f"{len(changed)} page(s) {'to change' if dry else 'changed'}.")


if __name__ == "__main__":
    main()
