#!/usr/bin/env python3
"""Check (and optionally fix) sitemap.xml against the pages in the repo. Stdlib only.

HOW TO RUN
    python3 _scripts/check_sitemap.py          report only (exit 1 if anything is off)
    python3 _scripts/check_sitemap.py --fix    rewrite sitemap.xml

Reports
  - indexable pages missing from the sitemap (self canonical, no noindex, not a
    meta-refresh redirect stub, not 404.html)
  - sitemap entries that are missing, noindex, redirects or canonical elsewhere
  - <lastmod> values that don't match the page's last real content change

lastmod = Sydney date of the last commit that changed the page's HTML for real
(commits that only bump shared-asset ?v= numbers or add breadcrumb JSON-LD
are ignored). For daily games
(and their archives) the latest commit to that game's puzzles/ folder also counts.
Pages with uncommitted edits count as changed today.

--fix keeps existing order and changefreq, drops bad entries, appends new pages
(changefreq weekly) and corrects lastmod. Run it before committing new pages.
"""
import datetime as dt
import os
import re
import subprocess
import sys
from collections import Counter
from zoneinfo import ZoneInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://maladywise.com"
SKIP_DIRS = {".git", "node_modules", "_data", "__pycache__"}
SYD = ZoneInfo("Australia/Sydney")
VBUMP = re.compile(r"\?v=\d+")
# lines that never count as a content change: breadcrumb JSON-LD added by add_breadcrumbs.py
NOISE = re.compile(r'^\s*<script type="application/ld\+json" id="mw-breadcrumb-ld">.*</script>\s*$')
TODAY = dt.datetime.now(SYD).date().isoformat()


def git(*a):
    return subprocess.run(["git", "-C", ROOT] + list(a), capture_output=True, text=True).stdout


def syd_date(iso):
    return dt.datetime.fromisoformat(iso).astimezone(SYD).date().isoformat()


def page_url(rel):
    rel = rel.replace(os.sep, "/")
    if rel == "index.html":
        return SITE + "/"
    if rel.endswith("/index.html"):
        return SITE + "/" + rel[:-10]
    return SITE + "/" + rel


def url_file(loc):
    p = loc[len(SITE):] if loc.startswith(SITE) else loc
    p = p.lstrip("/")
    if p == "" or p.endswith("/"):
        p += "index.html"
    return p


def info(path):
    """(indexable, reason) for a repo-relative HTML path."""
    full = os.path.join(ROOT, path)
    if not os.path.isfile(full):
        return False, "file missing"
    src = open(full, encoding="utf-8", errors="replace").read()
    head = src[: src.find("</head>")] if "</head>" in src else src[:8000]
    low = head.lower()
    if 'http-equiv="refresh"' in low:
        return False, "redirect stub"
    if re.search(r'<meta[^>]+name=["\']robots["\'][^>]+noindex', low):
        return False, "noindex"
    m = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)', head)
    if not m:
        return False, "no canonical"
    if m.group(1) != page_url(path):
        return False, "canonical points to " + m.group(1)
    return True, ""


def content_date(path, dirty):
    """Sydney date of the last commit that really changed this file."""
    if path in dirty:
        return TODAY
    out = git("log", "--format=@@%cI", "-p", "-U0", "--no-renames", "--", path)
    commits = re.split(r"^@@(?=\d{4}-\d\d-\d\dT)", out, flags=re.M)
    for c in commits:
        if not c.strip():
            continue
        date = c.split("\n", 1)[0].strip()
        rem, add = Counter(), Counter()
        for line in c.split("\n"):
            if line.startswith("---") or line.startswith("+++"):
                continue
            if NOISE.match(line[1:]):
                continue
            if line.startswith("-"):
                rem[VBUMP.sub("", line[1:])] += 1
            elif line.startswith("+"):
                add[VBUMP.sub("", line[1:])] += 1
        if rem != add or (not rem and not add):
            return syd_date(date)
    return TODAY


def last_commit(path):
    d = git("log", "-1", "--format=%cI", "--", path).strip()
    return syd_date(d) if d else ""


def main():
    fix = "--fix" in sys.argv
    dirty = set()
    for line in git("status", "--porcelain").splitlines():
        dirty.add(line[3:].strip().strip('"'))

    pages = []
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = sorted(x for x in dirs if x not in SKIP_DIRS and not x.startswith(("_", ".")))
        for f in sorted(files):
            if f.endswith(".html") and f != "404.html":
                pages.append(os.path.relpath(os.path.join(d, f), ROOT).replace(os.sep, "/"))
    indexable = {p for p in pages if info(p)[0]}

    sm_path = os.path.join(ROOT, "sitemap.xml")
    xml = open(sm_path, encoding="utf-8").read()
    blocks = re.findall(r"[ \t]*<url>.*?</url>\n?", xml, re.S)
    entries = []
    for b in blocks:
        loc = re.search(r"<loc>\s*([^<]+?)\s*</loc>", b).group(1)
        lm = re.search(r"<lastmod>\s*([^<]+?)\s*</lastmod>", b)
        cf = re.search(r"<changefreq>\s*([^<]+?)\s*</changefreq>", b)
        entries.append([loc, lm.group(1) if lm else "", cf.group(1) if cf else ""])

    problems, keep, seen = [], [], set()
    for e in entries:
        f = url_file(e[0])
        ok, why = info(f)
        if e[0] in seen:
            problems.append("duplicate in sitemap: " + e[0])
            continue
        seen.add(e[0])
        if not ok:
            problems.append("in sitemap but %s: %s" % (why, e[0]))
            continue
        keep.append(e)
    in_map = {url_file(e[0]) for e in keep}
    for p in sorted(indexable - in_map):
        problems.append("not in sitemap: " + page_url(p))
        keep.append([page_url(p), "", "weekly"])

    for e in keep:
        f = url_file(e[0])
        want = content_date(f, dirty)
        top = f.split("/")[0]
        puzzles = os.path.join(top, "puzzles")
        if "/" in f and os.path.isdir(os.path.join(ROOT, puzzles)):
            pd = TODAY if any(x.startswith(puzzles + "/") for x in dirty) else last_commit(puzzles)
            want = max(want, pd)
        if e[1] != want:
            problems.append("lastmod %s, should be %s: %s" % (e[1] or "(none)", want, e[0]))
            e[1] = want

    for p in problems:
        print("  - " + p)
    print("%d sitemap issue(s)." % len(problems))
    if fix and problems:
        lines = ['<?xml version="1.0" encoding="UTF-8"?>',
                 '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
        for loc, lm, cf in keep:
            lines.append("  <url><loc>%s</loc><lastmod>%s</lastmod>%s</url>" % (
                loc, lm, "<changefreq>%s</changefreq>" % cf if cf else ""))
        lines.append("</urlset>")
        with open(sm_path, "w", encoding="utf-8") as fh:
            fh.write("\n".join(lines) + "\n")
        print("sitemap.xml rewritten (%d URLs)." % len(keep))
    return 1 if problems and not fix else 0


if __name__ == "__main__":
    sys.exit(main())
