#!/usr/bin/env python3
"""Make each page's share card the picture Google uses for it. Stdlib only, idempotent.

HOW TO RUN (from the repo root, after og_cards.py / key_cards.py)
    python3 _scripts/share_block.py            update every indexable page
    python3 _scripts/share_block.py --check    list pages that would change (no writes)

For every indexable page it reads the page's og:image (the card from og_cards.py or key_cards.py) and:
  1. makes twitter:image the same URL and twitter:card "summary_large_image";
  2. puts "image" (an ImageObject: url, width 1200, height 630) on the page's main JSON-LD node, plus
     "primaryImageOfPage" when that node is a WebPage type. Pages whose main JSON-LD isn't a WebPage
     (games, quizzes, the home page, or pages with only a breadcrumb) get a small WebPage block
     (id="mw-share-ld") carrying both;
  3. adds a visible "Share this page" card (the same image, lazy-loaded, with a share/copy-link button
     wired up in assets/shell.js) between <!-- share-card --> and <!-- /share-card --> markers:
     before the Related list on health pages, after the About block on game pages, otherwise at the
     end of <main> before its footer. Hidden in print (assets/shell.css .mw-sharecard).
Skipped: /mental-health-check/ (private self-checks) and /<game>/archive/ pages get nothing (old blocks
are removed); /specialists/ gets the JSON-LD image only, no visible block.
Page generators run this via static_nav.postbuild().
"""
import html
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import static_nav

BASE = "https://maladywise.com"
W, H = 1200, 630
START, END = "<!-- share-card -->", "<!-- /share-card -->"
BLOCK_RE = re.compile(r"\n?" + re.escape(START) + r".*?" + re.escape(END) + r"\n?", re.S)
LD_RE = re.compile(r'(<script type="application/ld\+json"([^>]*)>)(.*?)(</script>)', re.S)
SHARE_LD_RE = re.compile(r'\n?<script type="application/ld\+json" id="mw-share-ld">.*?</script>', re.S)
PAGE_TYPES = {"WebPage", "MedicalWebPage", "CollectionPage", "ItemPage", "AboutPage", "ContactPage", "FAQPage", "QAPage", "SearchResultsPage"}
MAIN_ORDER = ["MedicalWebPage", "CollectionPage", "WebPage", "AboutPage", "ContactPage", "WebApplication", "Quiz", "ItemList", "WebSite"]


def skip(u):
    return u.startswith("/mental-health-check/") or u.endswith("/archive/")


def meta(src, prop):
    head = src[:src.find("</head>")]
    m = re.search(r'<meta (?:property|name)="%s" content="([^"]*)">' % re.escape(prop), head)
    return html.unescape(m.group(1)) if m else None


def types(node):
    t = node.get("@type")
    return set(t if isinstance(t, list) else [t])


def nodes_of(j):
    if isinstance(j, list):
        return [n for n in j if isinstance(n, dict)]
    if isinstance(j, dict) and isinstance(j.get("@graph"), list):
        return [n for n in j["@graph"] if isinstance(n, dict)]
    return [j] if isinstance(j, dict) else []


def dump(j, raw):
    compact = '": "' not in raw and '", "' not in raw
    txt = json.dumps(j, ensure_ascii=False, separators=(",", ":") if compact else None)
    return txt.replace("</", "<\\/")


def fix_ld(src, u, img):
    obj = {"@type": "ImageObject", "url": img, "width": W, "height": H}
    blocks = []   # (match, parsed)
    for m in LD_RE.finditer(src):
        if 'id="mw-share-ld"' in m.group(2):
            continue
        try:
            blocks.append((m, json.loads(m.group(3))))
        except ValueError:
            pass
    main = None
    for want in MAIN_ORDER:
        for bi, (m, j) in enumerate(blocks):
            for n in nodes_of(j):
                if want in types(n):
                    main = (bi, n)
                    break
            if main:
                break
        if main:
            break
    edits = {}
    page_node = main and (types(main[1]) & PAGE_TYPES)
    if main:
        bi, n = main
        before = json.dumps(blocks[bi][1], sort_keys=True)
        n["image"] = dict(obj)
        if page_node:
            n["primaryImageOfPage"] = dict(obj)
        if json.dumps(blocks[bi][1], sort_keys=True) != before:
            edits[bi] = True
    out, last = [], 0
    for bi, (m, j) in enumerate(blocks):
        if bi in edits:
            out.append(src[last:m.start(3)] + dump(j, m.group(3)))
            last = m.end(3)
    src = "".join(out) + src[last:]
    # dedicated WebPage block for pages without a WebPage-type main node
    src = SHARE_LD_RE.sub("", src)
    if not page_node:
        title = meta(src, "og:title") or ""
        if not title:
            t = re.search(r"<title>(.*?)</title>", src, re.S)
            title = html.unescape(t.group(1)).strip() if t else ""
        canon = re.search(r'<link rel="canonical" href="([^"]+)"', src)
        url = canon.group(1) if canon else BASE + u
        ld = {"@context": "https://schema.org", "@type": "WebPage", "@id": url + "#webpage", "url": url, "name": title,
              "image": dict(obj), "primaryImageOfPage": dict(obj)}
        tag = '<script type="application/ld+json" id="mw-share-ld">%s</script>' % json.dumps(ld, ensure_ascii=False).replace("</", "<\\/")
        i = src.find("</head>")
        src = src[:i] + tag + "\n" + src[i:]
    return src


def fix_twitter(src, img):
    i = src.find("</head>")
    head, rest = src[:i], src[i:]
    esc = html.escape(img, quote=True)
    if re.search(r'<meta name="twitter:image" content="[^"]*">', head):
        head = re.sub(r'<meta name="twitter:image" content="[^"]*">', '<meta name="twitter:image" content="%s">' % esc, head, count=1)
    else:
        head += '<meta name="twitter:image" content="%s">\n' % esc
    if re.search(r'<meta name="twitter:card" content="[^"]*">', head):
        head = re.sub(r'<meta name="twitter:card" content="[^"]*">', '<meta name="twitter:card" content="summary_large_image">', head, count=1)
    else:
        head += '<meta name="twitter:card" content="summary_large_image">\n'
    return head + rest


KINDS = {"Condition": "fact sheet", "Medicine": "medicine guide", "Blood test": "what it means", "Exercise handout": "exercise handout",
         "Deep dive for clinicians": "deep dive for clinicians", "Compare": "comparison", "Tool": "free tool"}


def alt_text(u, p, pages):
    import key_cards
    c = key_cards.BY_URL.get(u)
    if c:
        a = "%s – %s" % (c["title"], c["line"].rstrip("."))
    else:
        a = p.get("label") or ""
        try:
            import og_cards
            spec = og_cards.spec_for(u, p, pages)
            if spec:
                kind = spec[0].split(" · ")[0]
                a = "%s – %s" % (spec[1], KINDS.get(kind, kind.lower()))
        except Exception:
            pass
    a = "Share card: " + a
    return a if len(a) <= 120 else a[:117].rsplit(" ", 1)[0] + "…"


def block(img, alt):
    path = img[len(BASE):] if img.startswith(BASE) else img
    e = lambda s: html.escape(s, quote=True)
    return (START + '\n<aside class="mw-sharecard" aria-label="Share this page"><p class="mw-sc-h">Share this page</p>'
            '<img src="%s" width="%d" height="%d" loading="lazy" decoding="async" alt="%s">'
            '<p class="mw-sc-row"><button type="button" class="mw-sc-btn" data-mw-share>Share link</button></p></aside>\n' % (e(path), W, H, e(alt))
            + END)


def place(src, blk):
    s = BLOCK_RE.sub("\n", src) if START in src else src
    if blk is None:
        return s
    main_end = s.rfind("</main>")
    if main_end < 0:
        main_end = s.rfind("</body>")
    i = s.find('<section class="related"')
    if 0 <= i < main_end:
        return s[:i] + blk + "\n" + s[i:]
    k = s.find("<!-- /mw-about-static -->")
    if 0 <= k < main_end:
        k += len("<!-- /mw-about-static -->")
        return s[:k] + "\n" + blk + s[k:]
    f = s.rfind('<footer class="site"', 0, main_end)
    if f >= 0:
        ls = s.rfind("\n", 0, f) + 1
        if s[ls:f].strip() == "":
            return s[:ls] + blk + "\n" + s[ls:]
        return s[:f] + "\n" + blk + "\n" + s[f:]
    ls = s.rfind("\n", 0, main_end) + 1
    if s[ls:main_end].strip() == "":
        return s[:ls] + blk + "\n" + s[ls:]
    return s[:main_end] + "\n" + blk + "\n" + s[main_end:]


def page_update(u, p, pages):
    src = p["src"]
    if skip(u):
        return place(src, None)
    og = meta(src, "og:image")
    if not og:
        return src
    img = og if og.startswith("http") else BASE + "/" + og.lstrip("/")
    src = fix_twitter(src, img)
    src = fix_ld(src, u, img)
    if u.startswith("/specialists/"):
        return place(src, None)
    return place(src, block(img, alt_text(u, p, pages)))


def run(quiet=False, check=False):
    pages, idx, _, _ = static_nav.load()
    n = 0
    for u, p in sorted(pages.items()):
        if u in idx:
            new = page_update(u, p, pages)
        elif START in p["src"]:
            new = place(p["src"], None)
        else:
            continue
        if new != p["src"]:
            n += 1
            if check:
                print(u)
            else:
                open(p["fp"], "w", encoding="utf-8").write(new)
                p["src"] = new
    if not quiet:
        print("share_block: %d page(s) %s" % (n, "would change" if check else "updated"))
    return n


if __name__ == "__main__":
    run(check="--check" in sys.argv)
