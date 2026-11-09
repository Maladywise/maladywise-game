#!/usr/bin/env python3
"""Generate the /blood-tests/ hub and result explainer pages.

    python3 _scripts/gen_bloodtests.py

Content lives in _scripts/bloodtests_data.py (one dict per page). Asset ?v= numbers are read from
the home page, and every page goes through headkit.fix_html() like the other generators.
After running: python3 _scripts/check_sitemap.py --fix (new pages) and python3 _scripts/site_check.py.
"""
import html
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from headkit import fix_html  # shared <head> clean-up: self-hosted fonts, deferred scripts, honest JSON-LD
from bloodtests_data import PAGES, HUB, UPDATED, UPDATED_ISO

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://maladywise.com"
idx = open(os.path.join(R, "index.html"), encoding="utf-8").read()
V = {k: re.search(re.escape(k) + r"\?v=(\d+)", idx).group(1) for k in ("shell.css", "games.js", "site.js", "shell.js")}
HUB_PATH = "/blood-tests/"
HUB_NAME = "Blood test results"
PANELYSIS = ('<p class="callout bt-play"><b>Practise reading results.</b> <a href="/panelysis/">Play Panelysis, the daily blood-test puzzle</a>: '
             'a fictional patient, a real-looking panel, three guesses. More in <a href="/medical-games/">medical games</a>.</p>')


def esc(s):
    return html.escape(s, quote=True)


def strip(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s))).strip()


def head(path, title, desc, lds):
    t = title + " | Malady Wise"
    ld = "".join('<script type="application/ld+json" id="%s">%s</script>\n' % (i, json.dumps(x, ensure_ascii=False)) for i, x in lds)
    return f'''<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<link rel="canonical" href="{BASE}{path}">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{esc(t)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48.png">
<link rel="icon" type="image/png" sizes="96x96" href="/assets/favicon-96.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<meta name="theme-color" content="#4A3480">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Malady Wise">
<meta property="og:title" content="{esc(t)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:image" content="https://maladywise.com/assets/og/facts.png?v=2">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="/assets/fonts/poppins-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/shell.css?v={V['shell.css']}">
<script src="/assets/games.js?v={V['games.js']}"></script>
<script src="/assets/site.js?v={V['site.js']}"></script>
<script src="/assets/shell.js?v={V['shell.js']}"></script>
{ld}</head>
<body>
<main class="wrap doc">
'''


FOOT = '''<footer class="site"><p class="ft-base"><span class="ft-note">General education, not personal medical advice.</span> <span class="ft-links"><a href="/about/">About</a> <a href="/disclaimer/">Disclaimer</a> <a href="/privacy/">Privacy</a> <a href="/contact/">Contact</a></span></p></footer>
</main>
<script>MW.page();</script>
</body>
</html>
'''


def crumbs(items):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": BASE + u} for i, (n, u) in enumerate(items)]}


def page_ld(path, name, desc, trail, about, iso=None):
    d = {"@context": "https://schema.org", "@type": "MedicalWebPage", "name": name, "description": desc, "url": BASE + path,
         "inLanguage": "en-AU", "audience": {"@type": "MedicalAudience", "audienceType": "Patient"},
         "author": {"@type": "Organization", "name": "Malady Wise", "url": BASE + "/"},
         "publisher": {"@type": "Organization", "name": "Malady Wise", "url": BASE + "/"},
         "breadcrumb": crumbs(trail)}
    if about:
        d["about"] = about
    d["dateModified"] = iso or UPDATED_ISO
    return d


def faq_ld(faqs):
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": strip(q), "acceptedAnswer": {"@type": "Answer", "text": strip(a)}} for q, a in faqs]}


def faq_html(faqs):
    return '<section class="faq"><h2>Common questions</h2>' + "".join(
        "<details><summary>%s</summary><p>%s</p></details>" % (q, a) for q, a in faqs) + "</section>\n"


def related(items):
    return '<section class="related"><h2>Related</h2><ul>' + "".join(
        '<li><a href="%s"><span>%s</span>%s</a></li>' % (u, k, t) for u, k, t in items) + "</ul></section>\n"


def sources(items):
    return "<h2>Evidence and more information</h2>\n<ul class=\"src\">" + "".join(
        '<li><a href="%s" rel="noopener">%s</a></li>' % (u, t) for u, t in items) + "</ul>\n"


def write(path, s):
    p = os.path.join(R, path.strip("/"), "index.html")
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as fh:
        fh.write(fix_html(s))


def qa_words(s):
    return len(strip(s).split())


def build_page(P):
    path = HUB_PATH + P["slug"] + "/"
    assert len(P["title"]) <= 60, (P["slug"], len(P["title"]))
    n = qa_words(P["qa"])
    assert 40 <= n <= 60, (P["slug"], "quick answer words", n)
    assert 5 <= len(P["faqs"]) <= 7, P["slug"]
    assert 3 <= len(P["sources"]) <= 6, P["slug"]
    trail = [("Malady Wise", "/"), (HUB_NAME, HUB_PATH), (P["crumb"], path)]
    about = {"@type": "MedicalTest", "name": P["test"]}
    lds = [("mw-page-ld", page_ld(path, P["title"], P["desc"], trail, about, P.get("updated_iso"))), ("mw-faq-ld", faq_ld(P["faqs"]))]
    s = head(path, P["title"], P["desc"], lds)
    if P.get("og_card"):   # optional custom share card (og_cards.py)
        s = s.replace("</head>", '<script type="application/json" id="og-card">%s</script>\n' % json.dumps(P["og_card"], ensure_ascii=False).replace("</", "<\\/") + "</head>", 1)
    s += '<div class="fs-top"><p class="meta"><a href="/blood-tests/">Blood test results</a></p><button class="printbtn" type="button" onclick="window.print()">🖨 Print or save as PDF</button></div>\n'
    s += "<h1>%s</h1>\n" % P["h1"]
    s += '<p class="lede">%s</p>\n' % P["lede"]
    s += '<p class="quick-answer"><b>Quick answer:</b> %s</p>\n' % P["qa"]
    s += P["body"].strip() + "\n"
    s += '<p class="callout">%s</p>\n' % P["urgent"]
    s += PANELYSIS + "\n"
    s += faq_html(P["faqs"])
    s += sources(P["sources"])
    s += '<p class="meta"><em>%s. General education, not personal medical advice. Reference ranges differ between laboratories, so use the range printed on your own report and talk to your GP about your result.</em></p>\n' % P.get("updated", UPDATED)
    s += related(P["related"])
    s += '<p class="print-url">maladywise.com%s</p>\n' % path
    s += FOOT
    write(path, s)
    return path


def build_hub():
    H = HUB
    assert len(H["title"]) <= 60
    n = qa_words(H["qa"])
    assert 40 <= n <= 60, ("hub quick answer words", n)
    trail = [("Malady Wise", "/"), (HUB_NAME, HUB_PATH)]
    items = [{"@type": "ListItem", "position": i + 1, "url": BASE + HUB_PATH + P["slug"] + "/", "name": P["h1"]} for i, P in enumerate(PAGES)]
    pld = page_ld(HUB_PATH, H["title"], H["desc"], trail, None)
    pld["mainEntity"] = {"@type": "ItemList", "itemListElement": items}
    lds = [("mw-page-ld", pld), ("mw-faq-ld", faq_ld(H["faqs"]))]
    s = head(HUB_PATH, H["title"], H["desc"], lds)
    s += "<h1>%s</h1>\n" % H["h1"]
    s += '<p class="lede">%s</p>\n' % H["lede"]
    s += '<p class="quick-answer"><b>Quick answer:</b> %s</p>\n' % H["qa"]
    s += H["intro"].strip() + "\n"
    s += "<h2>Results explained</h2>\n"
    s += '<ul class="tx">' + "".join(
        '<li><span class="ev %s">%s</span><b><a href="%s%s/">%s</a></b>%s</li>' % (P["cls"], P["group"], HUB_PATH, P["slug"], P["h1"], P["card"])
        for P in PAGES) + "</ul>\n"
    s += PANELYSIS + "\n"
    s += H["after"].strip() + "\n"
    s += faq_html(H["faqs"])
    s += sources(H["sources"])
    s += '<p class="meta"><em>%s. General education, not personal medical advice.</em></p>\n' % UPDATED
    s += FOOT
    write(HUB_PATH, s)
    return HUB_PATH


def qr(paths):
    try:
        import segno
    except ImportError:
        print("segno not installed: skipped print QR codes")
        return
    for p in paths:
        out = os.path.join(R, "assets", "qr", p.strip("/").replace("/", "-") + ".svg")
        segno.make(BASE + p, error="m", micro=False).save(out, kind="svg", border=1, xmldecl=True, svgns=True, nl=False)


if __name__ == "__main__":
    done = [build_hub()] + [build_page(P) for P in PAGES]
    qr(done)
    print("\n".join(done))
    import static_nav  # footer links and share-card tags (STYLE.md)
    static_nav.postbuild()
