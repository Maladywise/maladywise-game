#!/usr/bin/env python3
"""Malady Wise site checker (stdlib only).

HOW TO RUN
    python3 _scripts/site_check.py            (from the repo root, or any folder)

Crawls every *.html file in the repo (skips .git, node_modules, _data and
__pycache__ folders; the public /tools/ pages are content, so their HTML is
checked) and reports:
  1. Broken internal links (href/src, inline url(...), og:image/twitter:image)
  2. Asset ?v= version drift for shell.js, shell.css, site.js, games.js
  3. Pages missing <title>, meta description or canonical
     (redirect stubs and noindex pages are excluded)
  4. Images over 400 KB, and <img> tags without alt
  5. Sitemap URLs whose file is missing, indexable pages not in the sitemap, and sitemap-images.xml
     entries whose page or image is missing
  6. JSON files under */puzzles/ and data/ that fail to parse

Exit code is 0 when clean, 1 when anything is reported.
"""
import json
import os
import re
import sys
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "maladywise.com"
SKIP_DIRS = {".claude", ".git", "node_modules", "_data", "__pycache__"}
VERSIONED = ("shell.js", "shell.css", "site.js", "games.js")
IMG_LIMIT = 400 * 1024
IMG_EXT = (".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif")


def walk(exts):
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = sorted(x for x in dirs if x not in SKIP_DIRS)
        for f in sorted(files):
            if f.lower().endswith(exts):
                yield os.path.join(d, f)


def rel(p):
    return os.path.relpath(p, ROOT)


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs = []          # (attr, value)
        self.title = False
        self.desc = False
        self.canonical = None
        self.noindex = False
        self.refresh = False
        self.imgs_no_alt = []   # src
        self._in_script = False

    def handle_starttag(self, tag, attrs):
        a = {k.lower(): (v or "") for k, v in attrs}
        if tag == "title":
            self.title = True
        if tag == "script":
            self._in_script = True
        if tag == "meta":
            name = (a.get("name") or a.get("property") or "").lower()
            if name == "description" and a.get("content", "").strip():
                self.desc = True
            if name == "robots" and "noindex" in a.get("content", "").lower():
                self.noindex = True
            if a.get("http-equiv", "").lower() == "refresh":
                self.refresh = True
            if name in ("og:image", "twitter:image") and a.get("content"):
                self.refs.append(("meta", a["content"]))
        if tag == "link" and "canonical" in a.get("rel", "").lower().split():
            self.canonical = a.get("href")
        for k in ("href", "src"):
            if k in a and a[k]:
                self.refs.append((k, a[k]))
        if "style" in a:
            for u in re.findall(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)", a["style"]):
                self.refs.append(("style", u))
        if tag == "img" and "alt" not in a:
            self.imgs_no_alt.append(a.get("src", "?"))

    def handle_endtag(self, tag):
        if tag == "script":
            self._in_script = False


def resolve(page_path, url):
    """Map a link to a repo path, or None if it is not an internal file link."""
    url = url.strip()
    low = url.lower()
    if not url or low.startswith(("#", "mailto:", "tel:", "javascript:", "data:", "blob:", "sms:")):
        return None
    if "${" in url or "{{" in url or "' +" in url or '" +' in url:
        return None  # template fragments
    parts = urlsplit(url)
    if parts.scheme or url.startswith("//"):
        host = parts.netloc.lower()
        if host in (SITE, "www." + SITE):
            path = parts.path or "/"
        else:
            return None
    else:
        path = parts.path
    if not path:
        return None
    path = unquote(path)
    if path.startswith("/"):
        target = os.path.join(ROOT, path.lstrip("/"))
    else:
        target = os.path.join(os.path.dirname(page_path), path)
    return os.path.normpath(target), path


def exists(target, path):
    if path.endswith("/") or os.path.isdir(target):
        return os.path.isfile(os.path.join(target, "index.html"))
    return os.path.isfile(target)


def url_to_file(loc):
    p = urlsplit(loc).path or "/"
    t = os.path.join(ROOT, unquote(p).lstrip("/"))
    if p.endswith("/") or os.path.isdir(t):
        t = os.path.join(t, "index.html")
    return os.path.normpath(t)


def main():
    pages = list(walk((".html",)))
    issues = {k: [] for k in ("links", "drift", "meta", "bigimg", "alt", "sitemap", "json")}
    versions = {}      # asset -> {page: [versions]}
    parsed = {}
    for p in pages:
        with open(p, encoding="utf-8", errors="replace") as fh:
            src = fh.read()
        pg = Page()
        try:
            pg.feed(src)
        except Exception as e:  # pragma: no cover
            issues["meta"].append(f"{rel(p)}: HTML parse error {e}")
        parsed[p] = pg
        for attr, val in pg.refs:
            r = resolve(p, val)
            if r and not exists(*r):
                issues["links"].append(f"{rel(p)}: {attr} -> {val}")
        for m in re.finditer(r"assets/(shell\.js|shell\.css|site\.js|games\.js)\?v=(\d+)", src):
            versions.setdefault(m.group(1), {}).setdefault(p, []).append(int(m.group(2)))
        if not pg.refresh and not pg.noindex:
            miss = [n for n, ok in (("title", pg.title), ("description", pg.desc),
                                     ("canonical", pg.canonical)) if not ok]
            if miss:
                issues["meta"].append(f"{rel(p)}: missing {', '.join(miss)}")
        for s in pg.imgs_no_alt:
            issues["alt"].append(f"{rel(p)}: <img src={s}>")

    for asset, by_page in sorted(versions.items()):
        top = max(v for vs in by_page.values() for v in vs)
        for p, vs in sorted(by_page.items()):
            low = sorted({v for v in vs if v < top})
            if low:
                issues["drift"].append(f"{rel(p)}: {asset} v={low} (max {top})")

    for f in walk(IMG_EXT):
        size = os.path.getsize(f)
        if size > IMG_LIMIT:
            issues["bigimg"].append(f"{rel(f)}: {size // 1024} KB")

    sm = os.path.join(ROOT, "sitemap.xml")
    locs = re.findall(r"<loc>\s*([^<]+?)\s*</loc>", open(sm, encoding="utf-8").read()) if os.path.exists(sm) else []
    in_map = set()
    for loc in locs:
        f = url_to_file(loc)
        in_map.add(f)
        if not os.path.isfile(f):
            issues["sitemap"].append(f"in sitemap, file missing: {loc}")
    for p, pg in sorted(parsed.items()):
        if pg.canonical and not pg.noindex and not pg.refresh and os.path.normpath(p) not in in_map:
            if os.path.basename(p) == "404.html":
                continue
            issues["sitemap"].append(f"not in sitemap: {rel(p)} (canonical {pg.canonical})")

    # image sitemap (written by export_diagrams.py): each page must be in sitemap.xml, each image must exist
    ism = os.path.join(ROOT, "sitemap-images.xml")
    if os.path.exists(ism):
        for block in re.findall(r"<url>(.*?)</url>", open(ism, encoding="utf-8").read(), re.S):
            page = re.search(r"<loc>\s*([^<]+?)\s*</loc>", block)
            if page and url_to_file(page.group(1)) not in in_map:
                issues["sitemap"].append(f"sitemap-images.xml page not in sitemap.xml: {page.group(1)}")
            for img in re.findall(r"<image:loc>\s*([^<]+?)\s*</image:loc>", block):
                if not os.path.isfile(url_to_file(img)):
                    issues["sitemap"].append(f"sitemap-images.xml, image missing: {img}")

    for f in walk((".json",)):
        r = rel(f).replace(os.sep, "/")
        if "/puzzles/" in "/" + r or r.startswith("data/"):
            try:
                with open(f, encoding="utf-8") as fh:
                    json.load(fh)
            except Exception as e:
                issues["json"].append(f"{r}: {e}")

    labels = {
        "links": "1. Broken internal links",
        "drift": "2. Asset version drift",
        "meta": "3. Missing title/description/canonical",
        "bigimg": "4a. Images over 400 KB",
        "alt": "4b. <img> without alt",
        "sitemap": "5. Sitemap problems",
        "json": "6. JSON parse failures",
    }
    total = 0
    print(f"Checked {len(pages)} HTML pages.")
    for k, label in labels.items():
        items = issues[k]
        total += len(items)
        print(f"\n{label}: {len(items)}")
        for i in items:
            print("  - " + i)
    print(f"\nTotal issues: {total}")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())
