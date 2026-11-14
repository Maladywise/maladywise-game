#!/usr/bin/env python3
"""Plain-HTML footer links on every indexable page, so crawlers that don't run JavaScript
(Bing, AI crawlers) can still find every section and page. Stdlib only, idempotent.

HOW TO RUN (from the repo root)
    python3 _scripts/static_nav.py            add or refresh the block on every indexable page
    python3 _scripts/static_nav.py --report   count static inbound links per page (no writes)

Run it after adding or rebuilding pages (STYLE.md). Page generators call run() at the end too.

What it writes
    Between <!-- static-nav --> and <!-- /static-nav --> markers, at the top of the page's
    <footer class="site"> (or, with no footer, right after </main> / before </body>), one
    <nav class="static-nav"> row of the main hubs (SECTIONS, at most 9). shell.js moves a block
    that sits outside the footer (the home page, whose footer is drawn by JS) into it.
    Medical-only links carry class "sn-med" and are hidden in Normie mode (assets/shell.css).
    Pages that are noindex, redirects or 404 get no block (and lose any old one).
    It also tidies every <footer class="site"> into one compact line (FOOT_LINKS):
      <p class="ft-base"><span class="ft-note">note</span> <span class="ft-links">About ... Contact</span></p>
    shell.js adds the follow links and "Report a problem" to it.

Every other page must be linked from the BODY of some page (a hub list, a related list, a
"For clinicians" block): there is no per-page "See also" list any more. --report checks this.
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

# Main hubs, one footer row (max 9): (label, href, medical-only). Compare, Arcade, Zebra Mail and Deep dives
# are reached from their hubs' bodies (Medicines/Conditions, Puzzles, subscribe boxes, Conditions).
SECTIONS = [
    ("Puzzles", "/medical-games/", False),
    ("Conditions", "/conditions/", True),
    ("Medicines", "/medicines/", True),
    ("Blood tests", "/blood-tests/", True),
    ("Exercises", "/exercises/", True),
    ("Tools", "/tools/", True),
    ("Quizzes", "/medical-games/#quizzes", False),
    ("Specialists", "/specialists/", True),
    ("Health days", "/days/", False),
]
# The compact footer line: these links, in this order (the logo already links home).
FOOT_LINKS = [("About", "/about/"), ("Disclaimer", "/disclaimer/"), ("Privacy", "/privacy/"), ("Contact", "/contact/")]
FOOT_NOTE = "General education, not personal medical advice."
FOOT_RE = re.compile(r'<footer class="site">(.*?)</footer>', re.S)
INFOOT_RE = re.compile(r'(<footer class="site">)\n?' + re.escape(START) + r".*?" + re.escape(END) + r"\n?", re.S)

# Short link names where the page's own <h1>/<title> is too long or missing.
LABELS = {
    "/": "Today's puzzles", "/medical-games/": "All medical games", "/unspecialist/": "GP School",
    "/rare-conditions/": "Zebra Atlas", "/mbs-billing/": "GP MBS billing guide", "/normie/": "Normie mode",
    "/weird/": "Weird and wonderful", "/days/": "Health Calendar", "/zebra-mail/": "Zebra Mail",
    "/arcade/": "Arcade games", "/mental-health-check/": "Mental health check", "/basil-clover/": "Basil + Clover",
    "/grandrounds/": "Grand Rounds", "/dx/": "Dxtective", "/about/": "About", "/contact/": "Contact",
    "/privacy/": "Privacy", "/disclaimer/": "Disclaimer", "/sponsorship/": "Sponsorship policy", "/conditions/": "Conditions A–Z",
    "/specialists/": "Specialists", "/compare/": "Comparisons", "/tools/": "Tools", "/deep-dives/": "Deep dives",
    "/exercises/": "Exercise handouts", "/medicines/": "Medicines", "/blood-tests/": "Blood tests",
    "/glp-1/": "GLP-1 medicines guide", "/doctors/": "For doctors", "/algorithms/": "Treatment algorithms", "/hubs/": "All hubs",
}
# Pages for doctors, curious minds and practice quizzes (their section is "extra"; og_cards.py uses sections).
EXTRA = ["/unspecialist/", "/rare-conditions/", "/mbs-billing/", "/medical-specialty-quiz/", "/medical-terminology-quiz/",
         "/anatomy-quiz/", "/ecg-quiz/", "/x-ray-quiz/", "/weird/", "/normie/", "/mental-health-check/", "/days/", "/arcade/"]
HUBS = {"/hubs/", "/algorithms/", "/doctors/", "/conditions/", "/medicines/", "/blood-tests/", "/glp-1/", "/exercises/", "/tools/", "/compare/", "/deep-dives/",
        "/specialists/", "/zebra-mail/", "/medical-games/", "/about/", "/contact/", "/privacy/", "/disclaimer/", "/sponsorship/",
        "/fact-sheets/", "/cases/", "/words/", "/reads/", "/news/", "/"}


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
    s = src if keep_nav else strip(src)
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
    if parts[0] in ("medicines", "compare", "blood-tests", "glp-1", "exercises", "tools", "deep-dives", "algorithms", "specialists",
                    "anatomy-quiz", "mental-health-check", "zebra-mail"):
        return parts[0]
    if "/" + parts[0] + "/" in games or "/" + parts[0] + "/archive/" in idx:
        return "game"
    return "sub"   # e.g. /back-pain/exercises/: handouts under a fact sheet


# ---------- writing ----------
def block(u):
    e = lambda t: html.escape(t, quote=True)
    main = []
    for t, h, med in SECTIONS:
        if h == u:
            continue
        main.append('<a href="%s"%s>%s</a>' % (h, ' class="sn-med"' if med else "", e(t)))
    return START + '<nav class="static-nav" aria-label="Site sections">' + " ".join(main) + "</nav>" + END


def foot_fix(src):
    """Every <footer class="site"> as one compact line: note, then About · Disclaimer · Privacy · Contact."""
    def fix(m):
        inner = INFOOT_RE.sub(r"\1", m.group(0))[len('<footer class="site">'):-len("</footer>")]
        if 'class="ft-base"' in inner:
            return m.group(0)
        parts = re.split(r"<br\s*/?>", inner)
        note = parts[0].strip() if len(parts) > 1 or not parts[0].lstrip().startswith("<a") else ""
        note = note or FOOT_NOTE
        links = " ".join('<a href="%s">%s</a>' % (h, t) for t, h in FOOT_LINKS)
        return ('<footer class="site"><p class="ft-base"><span class="ft-note">%s</span> <span class="ft-links">%s</span></p></footer>'
                % (note, links))
    return FOOT_RE.sub(fix, src)


FOOT_HTML = foot_fix('<footer class="site">' + FOOT_NOTE + "</footer>")   # for page generators


def place(src, blk):
    s = foot_fix(strip(src))
    if blk is None:
        return s
    i = s.find('<footer class="site">')
    if i >= 0:
        j = i + len('<footer class="site">')
        return s[:j] + "\n" + blk + "\n" + s[j:]
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
    n = 0
    for u, p in sorted(pages.items()):
        if u in idx:
            new = place(p["src"], block(u))
        elif START in p["src"] or '<footer class="site">' in p["src"]:
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
    if START not in src:
        return src
    return BLOCK_RE.sub("\n", INFOOT_RE.sub(r"\1", src))


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
    """Every sitemap page needs an inbound link from the body of another page (not the footer)."""
    pages, idx, facts, games = load()
    try:
        sm = open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8").read()
        want = [x[len(BASE):] if x.startswith(BASE) else x for x in re.findall(r"<loc>([^<]+)</loc>", sm)]
    except OSError:
        want = sorted(idx)
    inbound = {u: set() for u in want}
    for u, p in pages.items():
        body = FOOT_RE.sub("", strip(p["src"]))
        for h in links_in(body, keep_nav=True):
            h = h[:-len("index.html")] if h.endswith("/index.html") else h
            if h in inbound and h != u:
                inbound[h].add(u)
    low = sorted(u for u, v in inbound.items() if not v and u != "/")
    counts = sorted(len(v) for v in inbound.values())
    print("Sitemap pages: %d" % len(want))
    print("Body inbound links (distinct pages): min %d, median %d" % (counts[0], counts[len(counts) // 2]))
    print("Orphans (no body link from any other page): %d" % len(low))
    for u in low:
        print("  " + u)
    return 1 if low else 0


if __name__ == "__main__":
    if "--report" in sys.argv:
        sys.exit(report())
    run()
