#!/usr/bin/env python3
"""Tell IndexNow search engines (Bing, Yandex, Seznam, Naver...) which pages changed.

HOW TO RUN
    python3 _scripts/indexnow.py --before <sha> --after <sha>   changed pages between two commits
    python3 _scripts/indexnow.py --all                          every URL in sitemap.xml
    add --dry-run to print the URLs without sending anything.

Run automatically by .github/workflows/indexnow.yml on every push to main, and
by hand from the Actions tab ("Run workflow") to submit the whole sitemap.

Which URLs are sent (push mode)
  - every changed or added .html page, mapped to its public URL
    (folder/index.html -> https://maladywise.com/folder/), using the page's own
    canonical; redirect stubs, noindex pages and 404.html are skipped
  - deleted pages (so engines drop them)
  - sitemap.xml entries that are new or whose <lastmod> changed
The key file is /<KEY>.txt at the site root (public by design: it only proves
we own the host).
"""
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOST = "maladywise.com"
SITE = "https://" + HOST
KEY = "857984d976100d5029a390338e4856f9"
ENDPOINT = "https://api.indexnow.org/indexnow"
MAX_URLS = 10000
SKIP_PREFIXES = ("_", ".")          # _scripts/, _social/, .github/ are never published as pages
ZERO = "0" * 40
VBUMP = re.compile(r"\?v=\d+")


def git(*args):
    return subprocess.run(["git", "-C", ROOT] + list(args), capture_output=True, text=True, check=True).stdout


def git_show(sha, path):
    try:
        return git("show", "%s:%s" % (sha, path))
    except subprocess.CalledProcessError:
        return ""


def url_for(path):
    path = path.replace(os.sep, "/")
    if path == "index.html":
        return SITE + "/"
    if path.endswith("/index.html"):
        return SITE + "/" + path[: -len("index.html")]
    return SITE + "/" + path


def page_info(src):
    """(indexable, canonical) for an HTML source string."""
    head = src[: src.find("</head>")] if "</head>" in src else src[:8000]
    low = head.lower()
    if re.search(r'<meta[^>]+name=["\']robots["\'][^>]+noindex', low) or "http-equiv=\"refresh\"" in low:
        return False, None
    m = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)', head)
    return True, (m.group(1) if m else None)


def sitemap_entries(xml):
    out = {}
    for block in re.findall(r"<url>(.*?)</url>", xml, re.S):
        loc = re.search(r"<loc>\s*([^<]+?)\s*</loc>", block)
        lm = re.search(r"<lastmod>\s*([^<]+?)\s*</lastmod>", block)
        if loc:
            out[loc.group(1)] = lm.group(1) if lm else ""
    return out


def changed_urls(before, after):
    if not before or before == ZERO:
        before = after + "~1"
    try:
        git("cat-file", "-e", before + "^{commit}")
    except subprocess.CalledProcessError:
        before = after + "~1"
    diff = git("diff", "--name-status", "--no-renames", before, after)
    urls = []
    for line in diff.splitlines():
        parts = line.split("\t")
        status, path = parts[0], parts[-1]
        if not path.endswith(".html") or path.startswith(SKIP_PREFIXES) or "/_" in path:
            continue
        if os.path.basename(path) == "404.html":
            continue
        if status.startswith("D"):
            old_ok, _ = page_info(git_show(before, path))
            if old_ok:
                urls.append(url_for(path))   # gone: let engines recrawl and drop it
            continue
        new_src = git_show(after, path)
        ok, canon = page_info(new_src)
        if not ok:
            continue
        if status.startswith("M") and VBUMP.sub("", new_src) == VBUMP.sub("", git_show(before, path)):
            continue  # only shared-asset ?v= numbers changed: not a content change
        url = url_for(path)
        if canon and canon.split("?")[0].split("#")[0] != url:
            continue  # page points elsewhere: not its own URL
        urls.append(url)
    old_map = sitemap_entries(git_show(before, "sitemap.xml"))
    new_map = sitemap_entries(git_show(after, "sitemap.xml"))
    for loc, lm in new_map.items():
        if old_map.get(loc) != lm:
            urls.append(loc)
    return urls


def all_urls():
    with open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8") as fh:
        return list(sitemap_entries(fh.read()))


def submit(urls):
    body = json.dumps({"host": HOST, "key": KEY, "keyLocation": "%s/%s.txt" % (SITE, KEY),
                       "urlList": urls}).encode("utf-8")
    req = urllib.request.Request(ENDPOINT, data=body, method="POST",
                                 headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            print("IndexNow response:", r.status, r.reason)
            return r.status in (200, 202)
    except urllib.error.HTTPError as e:
        print("IndexNow error:", e.code, e.reason, e.read()[:500].decode("utf-8", "replace"))
        # 403 = key file not reachable yet, 422 = URL not on host, 429 = too many requests
        return False


def main():
    a = sys.argv[1:]
    dry = "--dry-run" in a
    if "--all" in a:
        urls = all_urls()
    else:
        try:
            before, after = a[a.index("--before") + 1], a[a.index("--after") + 1]
        except (ValueError, IndexError):
            print(__doc__)
            return 2
        urls = changed_urls(before, after)
    seen, uniq = set(), []
    for u in urls:
        if u.startswith(SITE + "/") and u not in seen:
            seen.add(u)
            uniq.append(u)
    uniq = uniq[:MAX_URLS]
    sys.stdout.reconfigure(errors="replace")
    print("%d URL(s)%s" % (len(uniq), " (dry run)" if dry else ""))
    for u in uniq:
        print("  " + u)
    if dry or not uniq:
        return 0
    return 0 if submit(uniq) else 1


if __name__ == "__main__":
    sys.exit(main())
