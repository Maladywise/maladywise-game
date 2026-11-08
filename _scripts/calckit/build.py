#!/usr/bin/env python3
"""Build the Malady Wise calculator pages (/tools/...) and comparison pages (/compare/...).

HOW TO RUN (from the repo root)
    python3 _scripts/calckit/build.py
    node _scripts/calckit/test_calc.js        # checks the calculator maths

Calculation code lives in tools/calckit/calc.js (pure functions, shared by every calculator page);
styles in tools/calckit/calc.css. Page text lives in calc_pages.py and compare_pages.py next to this file.
Asset <script>/<link> tags are copied from tools/iron-infusion/index.html so versions stay in step.
"""
import html, json, os, re, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from headkit import fix_html  # shared <head> clean-up: self-hosted fonts, deferred scripts, honest JSON-LD
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
BASE = "https://maladywise.com"
REV_DATE = "2026-11-08"
REV = "Reviewed 8 November 2026"
CALC_V = "1"

ref = open(os.path.join(ROOT, "tools", "iron-infusion", "index.html"), encoding="utf-8").read()
m = re.search(r'(<link rel="preconnect".*?<script src="/assets/shell\.js\?v=\d+"></script>)', ref, re.S)
if not m:
    m = re.search(r'(<link rel="stylesheet" href="/assets/shell\.css.*?<script src="/assets/shell\.js\?v=\d+"></script>)', ref, re.S)
ASSETS = m.group(1)

def esc(s): return html.escape(s, quote=True)
def strip(s): return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s)).strip()

ORG = {"@type": "Organization", "name": "Malady Wise", "url": BASE + "/"}

def crumbs(items):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": BASE + u} for i, (n, u) in enumerate(items)]}

def faq_ld(faqs):
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": strip(a)}} for q, a in faqs]}

def faq_html(faqs):
    return '<section class="faq"><h2>Common questions</h2>' + "".join(
        f"<details><summary>{esc(q)}</summary><p>{a}</p></details>" for q, a in faqs) + "</section>"

def head(path, title, desc, lds, og="tools"):
    t = title + " | Malady Wise"
    assert len(title) <= 60, (title, len(title))
    ld = "".join('<script type="application/ld+json"' + (' id="mw-page-ld"' if i == 0 else "") + ">" +
                 json.dumps(x, ensure_ascii=False) + "</script>\n" for i, x in enumerate(lds))
    return f'''<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<link rel="canonical" href="{BASE}{path}">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{esc(t)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<meta name="theme-color" content="#4A3480">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Malady Wise">
<meta property="og:type" content="website">
<meta property="og:url" content="{BASE}{path}">
<meta property="og:title" content="{esc(t)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:image" content="https://maladywise.com/assets/og/{og}.png?v=2">
<meta name="twitter:card" content="summary_large_image">
{ASSETS}
<link rel="stylesheet" href="/tools/calckit/calc.css?v={CALC_V}">
{ld}</head>
<body>
'''

FOOTER = '''<footer class="site">General education, not personal medical advice.<br><a href="/">Malady Wise</a> · <a href="/about/">About</a> · <a href="/disclaimer/">Disclaimer</a> · <a href="/privacy/">Privacy</a> · <a href="/contact/">Contact</a></footer>
</main>
'''

def related(items):
    return '<section class="related"><h2>Related</h2><ul>' + "".join(
        f'<li><a href="{u}"><span>{k}</span>{n}</a></li>' for k, n, u in items) + "</ul></section>"

def sources(items):
    return '<h2>Sources</h2>\n<ul class="src">' + "".join(
        f'<li><a href="{u}" rel="noopener">{t}</a>{(". " + note) if note else ""}</li>' for t, u, note in items) + "</ul>"

def write(path, s):
    p = os.path.join(ROOT, path.strip("/"), "index.html")
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(fix_html(s))
    print("wrote", os.path.relpath(p, ROOT), len(s))

def calc_page(c):
    path = c["path"]
    pro = c.get("pro")
    crumb = crumbs([("Malady Wise", "/"), ("Tools", "/tools/"), (c["crumb"], path)])
    page = {"@context": "https://schema.org", "@type": "MedicalWebPage", "name": c["title"], "description": c["desc"],
            "url": BASE + path, "inLanguage": "en-AU",
            "audience": {"@type": "MedicalAudience", "audienceType": "Clinician" if pro else "Patient"},
            "author": ORG, "publisher": ORG,
            "reviewedBy": {"@type": "Person", "jobTitle": "General Practitioner", "description": "Australian GP"},
            "lastReviewed": REV_DATE, "isAccessibleForFree": True, "breadcrumb": crumb}
    if c.get("about"): page["about"] = c["about"]
    app = {"@context": "https://schema.org", "@type": "WebApplication", "name": c["h1"], "url": BASE + path,
           "applicationCategory": "HealthApplication", "operatingSystem": "Any", "browserRequirements": "Requires JavaScript",
           "inLanguage": "en-AU", "isAccessibleForFree": True, "description": c["desc"],
           "offers": {"@type": "Offer", "price": "0", "priceCurrency": "AUD"}, "publisher": ORG}
    s = head(path, c["title"], c["desc"], [page, app, faq_ld(c["faqs"])])
    s += '<main class="wrap doc cx">\n'
    s += f'<p class="meta"><a href="/tools/">Tools</a> · {c["kind"]}</p>\n'
    s += f'<h1>{c["h1"]}</h1>\n'
    if pro:
        s += '<p class="pill">For health professionals</p>\n'
    s += f'<p class="lede">{c["lede"]}</p>\n'
    s += f'<p class="callout">{c["callout"]}</p>\n'
    s += c["form"] + "\n"
    s += '<div class="out" id="cx-out" aria-live="polite"><p class="meta">' + c["empty"] + "</p></div>\n"
    s += c["body"] + "\n"
    s += faq_html(c["faqs"]) + "\n"
    s += sources(c["sources"]) + "\n"
    s += f'<p class="meta"><em>{REV}. {c.get("revnote", "General education, not personal medical advice. Talk to your GP or doctor about your own results.")}</em></p>\n'
    s += '<div id="nl-slot"></div>\n'
    s += related(c["related"]) + "\n" + FOOTER
    s += f'<script src="/tools/calckit/calc.js?v={CALC_V}"></script>\n<script>\n{c["js"].strip()}\n</script>\n<script>MW.page();</script>\n</body>\n</html>\n'
    write(path, s)

def compare_page(c):
    path = c["path"]
    crumb = crumbs([("Malady Wise", "/"), ("Comparisons", "/compare/"), (c["crumb"], path)])
    page = {"@context": "https://schema.org", "@type": "MedicalWebPage", "name": c["h1"], "description": c["desc"],
            "url": BASE + path, "inLanguage": "en-AU", "audience": {"@type": "MedicalAudience", "audienceType": "Patient"},
            "author": ORG, "publisher": ORG,
            "reviewedBy": {"@type": "Person", "jobTitle": "General Practitioner", "description": "Australian GP"},
            "lastReviewed": REV_DATE, "isAccessibleForFree": True, "breadcrumb": crumb}
    if c.get("about"): page["about"] = c["about"]
    s = head(path, c["title"], c["desc"], [page, faq_ld(c["faqs"])], og="facts")
    s += '<main class="wrap doc cx">\n'
    s += f'<h1>{c["h1"]}</h1>\n'
    s += f'<p class="answer"><b>Short answer:</b> {c["answer"]}</p>\n'
    s += c["body"] + "\n"
    s += faq_html(c["faqs"]) + "\n"
    s += sources(c["sources"]) + "\n"
    s += f'<p class="meta"><em>{REV}. General education, not personal medical advice. Talk to your GP or pharmacist about what suits you.</em></p>\n'
    s += '<div id="nl-slot"></div>\n'
    s += related(c["related"]) + "\n" + FOOTER
    s += '<script>MW.page();</script>\n</body>\n</html>\n'
    write(path, s)
    return len(strip(c["answer"]).split()), len(strip(c["answer"] + " " + c["body"]).split())

def compare_hub(pages):
    path = "/compare/"
    title = "Medicine and Symptom Comparisons: X vs Y"
    desc = "Plain-English comparisons from a GP: Ozempic vs Mounjaro, ibuprofen vs paracetamol, cold vs flu, sertraline vs escitalopram and vitamin D3 vs D2."
    page = {"@context": "https://schema.org", "@type": "CollectionPage", "name": title, "description": desc, "url": BASE + path,
            "inLanguage": "en-AU", "publisher": ORG, "breadcrumb": crumbs([("Malady Wise", "/"), ("Comparisons", path)]),
            "mainEntity": {"@type": "ItemList", "itemListElement": [
                {"@type": "ListItem", "position": i + 1, "url": BASE + p["path"], "name": p["h1"]} for i, p in enumerate(pages)]}}
    s = head(path, title, desc, [page], og="facts")
    s += '<main class="wrap doc cx">\n<h1>Comparisons</h1>\n'
    s += '<p class="lede">Two medicines, two illnesses, two supplements: side by side, in plain English, with the evidence and the Australian details.</p>\n'
    s += '<ul class="tx">' + "".join(
        f'<li><span class="ev m">{p["kind"]}</span><b><a href="{p["path"]}">{p["h1"]}</a></b>{p["blurb"]}</li>' for p in pages) + "</ul>\n"
    s += '<p class="callout"><b>General education, not personal advice.</b> Medicine choices depend on your health, other medicines and preferences. Talk to your GP or pharmacist. No company paid for or reviewed these pages.</p>\n'
    s += '<p class="meta">Also see our <a href="/tools/">calculators and tools</a> and <a href="/medicines/">medicines guides</a>.</p>\n'
    s += '<div id="nl-slot"></div>\n' + FOOTER + '<script>MW.page();</script>\n</body>\n</html>\n'
    write(path, s)

if __name__ == "__main__":
    from calc_pages import CALCS
    from compare_pages import COMPARES
    for c in CALCS:
        calc_page(c)
    for c in COMPARES:
        a, w = compare_page(c)
        print("   answer words", a, "total words", w)
    compare_hub(COMPARES)
