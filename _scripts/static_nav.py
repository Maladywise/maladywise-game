#!/usr/bin/env python3
"""Plain-HTML footer links on every indexable page, so crawlers that don't run JavaScript
(Bing, AI crawlers) can still find every section and page. Stdlib only, idempotent.

HOW TO RUN (from the repo root)
    python3 _scripts/static_nav.py            add or refresh the block on every indexable page
    python3 _scripts/static_nav.py --report   count static inbound links per page (no writes)

Run it after adding or rebuilding pages (STYLE.md). Page generators call run() at the end too.

What it writes
    Between <!-- static-nav --> and <!-- /static-nav --> markers, right after </main>
    (or before </body>), a small <nav class="static-nav"> with:
      - the main sections (games hub, conditions, medicines, blood tests, ... about), and
      - 6 to 10 related links picked by section: the page's own "related" list in assets/site.js
        (MW_FACTS), its parent page, then its neighbours in the same section (in path order,
        wrapping round), so every page gets inbound links from the pages just before it.
    Links that the page already has in its body or footer are skipped, so nothing shows twice.
    Medical-only links carry class "sn-med" and are hidden in Normie mode (assets/shell.css).
    Pages that are noindex, redirects or 404 get no block (and lose any old one).
"""
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {".git", "node_modules", "_data", "__pycache__", "_scripts", "_social", ".claude", ".github"}
BASE = "https://maladywise.com"
START, END = "<!-- static-nav -->", "<!-- /static-nav -->"
BLOCK_RE = re.compile(r"\n?" + re.escape(START) + r".*?" + re.escape(END) + r"\n?", re.S)

# Main sections: (label, href, medical-only). Same places as the JS top menu (assets/site.js MW_HOME.nav).
SECTIONS = [
    ("Puzzles", "/medical-games/", False),
    ("Conditions", "/conditions/", True),
    ("Medicines", "/medicines/", True),
    ("Blood tests", "/blood-tests/", True),
    ("Exercises", "/exercises/", True),
    ("Tools", "/tools/", True),
    ("Compare", "/compare/", True),
    ("Quizzes", "/medical-games/#quizzes", False),
    ("Deep dives", "/deep-dives/", True),
    ("Specialists", "/specialists/", True),
    ("World Health Days", "/days/", False),
    ("Arcade", "/arcade/", False),
    ("Zebra Mail", "/zebra-mail/", False),
    ("About", "/about/", False),
]
# Links the home page's JS-drawn footer already shows (the home page has no static footer).
HOME_FOOTER = {"/medical-games/", "/about/", "/disclaimer/", "/privacy/", "/contact/"}

# Short link names where the page's own <h1>/<title> is too long or missing.
LABELS = {
    "/": "Today's puzzles", "/medical-games/": "All medical games", "/unspecialist/": "GP School",
    "/rare-conditions/": "Zebra Atlas", "/mbs-billing/": "GP MBS billing guide", "/normie/": "Normie mode",
    "/weird/": "Weird and wonderful", "/days/": "World Health Days", "/zebra-mail/": "Zebra Mail",
    "/arcade/": "Arcade games", "/mental-health-check/": "Mental health check", "/basil-clover/": "Basil + Clover",
    "/grandrounds/": "Grand Rounds", "/dx/": "Dxtective", "/about/": "About", "/contact/": "Contact",
    "/privacy/": "Privacy", "/disclaimer/": "Disclaimer", "/conditions/": "Conditions A–Z",
    "/specialists/": "Specialists", "/compare/": "Comparisons", "/tools/": "Tools", "/deep-dives/": "Deep dives",
    "/exercises/": "Exercise handouts", "/medicines/": "Medicines", "/blood-tests/": "Blood tests",
}
# Pages for doctors, curious minds and practice quizzes: they link to each other, round-robin.
EXTRA = ["/unspecialist/", "/rare-conditions/", "/mbs-billing/", "/medical-specialty-quiz/", "/medical-terminology-quiz/",
         "/anatomy-quiz/", "/ecg-quiz/", "/x-ray-quiz/", "/weird/", "/normie/", "/mental-health-check/", "/days/", "/arcade/"]
# Nested sections that borrow links from a partner section when they are small.
PARTNERS = {
    "medicines": ["compare", "tools"], "compare": ["medicines", "fact"], "blood-tests": ["fact", "tools"],
    "exercises": ["fact"], "deep-dives": ["extra", "tools"], "tools": ["extra", "blood-tests"],
    "specialists": [], "anatomy-quiz": ["game", "extra"], "mental-health-check": ["fact"],
    "zebra-mail": ["game", "extra"], "game": ["extra"], "extra": ["game"], "fact": ["blood-tests"],
    "hub": ["game"], "sub": ["exercises"],
}
MEDICAL_SECTIONS = {"fact", "medicines", "compare", "blood-tests", "exercises", "tools", "deep-dives", "specialists",
                    "mental-health-check", "sub"}
HUBS = {"/conditions/", "/medicines/", "/blood-tests/", "/exercises/", "/tools/", "/compare/", "/deep-dives/",
        "/specialists/", "/zebra-mail/", "/medical-games/", "/about/", "/contact/", "/privacy/", "/disclaimer/",
        "/fact-sheets/", "/cases/", "/words/", "/reads/", "/news/", "/"}
WANT = 8   # related links per page (6-10)


# ---------- reading the site ----------
def html_files():
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = sorted(x for x in dirs if x not in SKIP_DIRS)
        for f in sorted(files):
            if f.endswith(".html"):
                yield os.path.join(d, f)


def url_of(fp):
    r = os.path.relpath(fp, ROOT).replace(os.sep, "/")
    if r == "index.html":
        return "/"
    if r.endswith("/index.html"):
        return "/" + r[:-len("index.html")]
    return "/" + r


def indexable(src):
    head = src[:src.find("</head>")] if "</head>" in src else src[:6000]
    if re.search(r'<meta[^>]+http-equiv="refresh"', head, re.I):
        return False
    if re.search(r'<meta[^>]+name="robots"[^>]+noindex', head, re.I):
        return False
    return bool(re.search(r'<link rel="canonical"', head))


def mw_data():
    """MW_FACTS (fact sheets, medicines, tools: title, kind, groups, related) and MW_GAMES paths."""
    site = open(os.path.join(ROOT, "assets", "site.js"), encoding="utf-8").read()
    m = re.search(r"window\.MW_FACTS\s*=\s*(\{.*?\});?\s*$", site, re.S | re.M)
    facts = json.loads(m.group(1)) if m else {}
    games = []
    try:
        g = open(os.path.join(ROOT, "assets", "games.js"), encoding="utf-8").read()
        i = g.find("MW_GAMES")
        games = ["/" + p.strip("/") + "/" for p in re.findall(r'"?\bpath"?:\s*"([a-z0-9-]+/?)"', g[i:])]
    except OSError:
        pass
    return facts, games


def clean(t):
    t = re.sub(r"<[^>]+>", "", t or "")
    return re.sub(r"\s+", " ", html.unescape(t)).strip()


def label_from(src, url, facts=None):
    """Short human name for a page (also used on share cards)."""
    if url in LABELS:
        return LABELS[url]
    if facts and url in facts and facts[url].get("t"):
        return facts[url]["t"]
    m = re.search(r"<h1[^>]*>(.*?)</h1>", src, re.S)
    h1 = clean(m.group(1)) if m else ""
    h1 = re.sub(r"\s*[\U0001F300-\U0001FAFF☀-➿]+\s*$", "", h1)
    if h1 and len(h1) <= 44:
        return h1
    m = re.search(r"<title>(.*?)</title>", src, re.S)
    t = clean(m.group(1)) if m else ""
    t = t.split(" | ")[0]
    if h1 and len(h1) < len(t):
        t = h1
    if len(t) > 44 and ":" in t:
        t = t.split(":")[0]
    if len(t) > 44 and " (" in t:
        t = t.split(" (")[0]
    return t or url.strip("/").split("/")[-1].replace("-", " ").capitalize()


def links_in(src, keep_nav=False):
    """Internal page links already in the page (outside any static-nav block unless keep_nav)."""
    s = src if keep_nav else BLOCK_RE.sub("\n", src)
    out = set()
    for h in re.findall(r'href="([^"#?]*)', s):
        if h.startswith(BASE):
            h = h[len(BASE):]
        if h.startswith("/") and not h.startswith("//"):
            out.add(h if h.endswith("/") or "." in h.split("/")[-1] else h + "/")
    return out


def load():
    facts, games = mw_data()
    pages = {}
    for fp in html_files():
        src = open(fp, encoding="utf-8").read()
        u = url_of(fp)
        pages[u] = {"fp": fp, "src": src, "idx": indexable(src) and os.path.basename(fp) != "404.html"}
    idx = {u for u, p in pages.items() if p["idx"]}
    for u in idx:
        pages[u]["label"] = label_from(pages[u]["src"], u, facts)
        pages[u]["sec"] = section_of(u, facts, games, idx)
    for u in sorted(idx, key=len):   # games and quizzes: just the name; archives: "<game> archive"
        if pages[u]["sec"] in ("extra", "anatomy-quiz") and ": " in pages[u]["label"]:
            pages[u]["label"] = pages[u]["label"].split(": ")[0]
        if pages[u]["sec"] == "game":
            parts = u.strip("/").split("/")
            if len(parts) == 1:
                pages[u]["label"] = pages[u]["label"].split(": ")[0]
            elif parts[-1] == "archive" and "/" + parts[0] + "/" in idx:
                pages[u]["label"] = pages["/" + parts[0] + "/"]["label"] + " archive"
    return pages, idx, facts, games


def section_of(u, facts, games, idx):
    parts = u.strip("/").split("/")
    if u in HUBS:
        return "hub"
    if u in EXTRA:
        return "extra"
    if len(parts) == 1:
        if u in games or u in ("/stackulus/", "/mergeon/", "/basil-clover/") or u + "archive/" in idx:
            return "game"
        if facts.get(u, {}).get("k") == "fact":
            return "fact"
        if facts.get(u, {}).get("k") == "tool":
            return "tools"
        return "extra"
    if parts[0] in ("medicines", "compare", "blood-tests", "exercises", "tools", "deep-dives", "specialists",
                    "anatomy-quiz", "mental-health-check", "zebra-mail"):
        return parts[0]
    if "/" + parts[0] + "/" in games or "/" + parts[0] + "/archive/" in idx:
        return "game"
    return "sub"   # e.g. /back-pain/exercises/: handouts under a fact sheet


# ---------- choosing links ----------
def groups(pages, idx, facts):
    g = {}
    for u in sorted(idx):
        g.setdefault(pages[u]["sec"], []).append(u)
    # fact sheets: neighbours within the same body-system group first
    fg = {}
    for u in g.get("fact", []):
        key = (facts.get(u, {}).get("g") or ["Other"])[0]
        fg.setdefault(key, []).append(u)
    extra = [u for u in EXTRA if u in idx]
    g["extra"] = extra + [u for u in g.get("extra", []) if u not in extra]
    return g, fg


def ring(lst, me, n, offset=1):
    """n items after `me` in lst, wrapping round (or from a stable offset if `me` isn't in it)."""
    if not lst:
        return []
    i = lst.index(me) if me in lst else (sum(map(ord, me)) % len(lst)) - 1
    return [lst[(i + offset + k) % len(lst)] for k in range(min(n, len(lst)))]


def related(u, pages, idx, facts, g, fg):
    sec = pages[u]["sec"]
    have = links_in(pages[u]["src"])
    cand = []
    cand += [r for r in facts.get(u, {}).get("r", [])]
    parts = u.strip("/").split("/")
    if len(parts) > 1:
        parent = "/" + "/".join(parts[:-1]) + "/"
        cand.append(parent)
        if sec == "sub":
            cand += [x for x in idx if x.startswith(parent) and x != u and x.count("/") == u.count("/")]
    if sec == "fact":
        key = (facts.get(u, {}).get("g") or ["Other"])[0]
        cand += ring(fg.get(key, []), u, 4)
        cand += ring(g.get("fact", []), u, 4)
    elif sec == "hub":
        cand += ring(g.get("extra", []), u, WANT, offset=HUB_OFFSET.get(u, 0))
    else:
        cand += ring(g.get(sec, []), u, WANT)
    for p in PARTNERS.get(sec, []):
        cand += ring(g.get(p, []), u, 4)
    out = []
    for c in cand:
        if c == u or c not in idx or c in out or c in have or c in SECTION_HREFS:
            continue
        out.append(c)
        if len(out) >= WANT:
            break
    return out


SECTION_HREFS = {h for _, h, _ in SECTIONS}
HUB_OFFSET = {}


def block(u, pages, idx, facts, g, fg):
    p = pages[u]
    have = links_in(p["src"])
    foot = re.search(r'<footer class="site".*?</footer>', p["src"], re.S)
    infoot = links_in(foot.group(0)) if foot else (HOME_FOOTER if u == "/" else set())
    e = lambda s: html.escape(s, quote=True)
    main = []
    for t, h, med in SECTIONS:
        if h.split("#")[0] == u and "#" not in h or h in infoot:
            continue
        main.append('<a href="%s"%s>%s</a>' % (h, ' class="sn-med"' if med else "", e(t)))
    rel = []
    for r in related(u, pages, idx, facts, g, fg):
        med = pages[r]["sec"] in MEDICAL_SECTIONS or r in ("/rare-conditions/", "/mbs-billing/", "/unspecialist/")
        rel.append('<a href="%s"%s>%s</a>' % (r, ' class="sn-med"' if med else "", e(pages[r]["label"])))
    inner = '<p class="sn-main">' + " ".join(main) + "</p>"
    if rel:
        inner += '<p class="sn-rel"><span>See also</span> ' + " ".join(rel) + "</p>"
    return START + '\n<nav class="static-nav" aria-label="Site sections">' + inner + "</nav>\n" + END


def place(src, blk):
    s = BLOCK_RE.sub("\n", src) if START in src else src
    if blk is None:
        return s
    i = s.rfind("</main>")
    if i >= 0:
        j = i + len("</main>")
        return s[:j] + "\n" + blk + "\n" + s[j:].lstrip("\n")
    i = s.rfind("</body>")
    if i < 0:
        return s
    return s[:i] + blk + "\n" + s[i:]


def run(quiet=False):
    """Refresh the block on every page. Returns the number of files changed."""
    pages, idx, facts, games = load()
    g, fg = groups(pages, idx, facts)
    n = 0
    for u, p in sorted(pages.items()):
        if u in idx:
            new = place(p["src"], block(u, pages, idx, facts, g, fg))
        elif START in p["src"]:
            new = place(p["src"], None)
        else:
            continue
        if new != p["src"]:
            open(p["fp"], "w", encoding="utf-8").write(new)
            n += 1
    if not quiet:
        print("static_nav: %d page(s) updated, %d indexable" % (n, len(idx)))
    return n


def strip(src):
    """A page without its footer-links block (generators compare against this before rewriting)."""
    return BLOCK_RE.sub("\n", src) if START in src else src


def postbuild():
    """For page generators: refresh footer links, then point pages at their share cards (no drawing),
    and copy each card into the page's JSON-LD and "Share this page" block."""
    run()
    try:
        import og_cards
        og_cards.update_meta()
        import key_cards
        key_cards.update_meta()
        import share_block   # share card -> JSON-LD image + visible "Share this page" block
        share_block.run()
    except Exception as e:  # never fail a build over share-card tags
        print("share cards skipped: %s" % e)


def report():
    pages, idx, facts, games = load()
    inbound = {u: set() for u in idx}
    for u in idx:
        for h in links_in(pages[u]["src"], keep_nav=True):
            if h in inbound and h != u:
                inbound[h].add(u)
    low = sorted((len(v), u) for u, v in inbound.items() if len(v) < 2)
    counts = sorted(len(v) for v in inbound.values())
    print("Indexable pages: %d" % len(idx))
    print("Static inbound links (distinct pages): min %d, median %d" % (counts[0], counts[len(counts) // 2]))
    print("Pages with fewer than 2: %d" % len(low))
    for c, u in low:
        print("  %d  %s" % (c, u))
    return 1 if low else 0


if __name__ == "__main__":
    if "--report" in sys.argv:
        sys.exit(report())
    run()
