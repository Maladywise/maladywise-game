#!/usr/bin/env python3
"""Generate the /glp-1/ hub and its topic pages.

    python3 _scripts/gen_glp1.py

Content lives in _scripts/glp1_data.py (one dict per page). Shares the page shell with gen_bloodtests.py
(same head, footer, JSON-LD helpers and headkit.fix_html()). After a brand-new page: add it to sitemap.xml,
then run og_cards.py, share_block.py, static_nav.py, build_llms.py and site_check.py (STYLE.md).
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen_bloodtests as gb  # shared page shell and helpers
from glp1_data import PAGES, HUB, UPDATED, UPDATED_ISO, GAME

HUB_PATH = "/glp-1/"
HUB_NAME = "GLP-1 medicines"
ABOUT = {"@type": "DrugClass", "name": "GLP-1 receptor agonists",
         "alternateName": ["GLP-1 medicines", "semaglutide", "tirzepatide"]}
TRUST = '<p class="trust"><a href="/about/#how-we-make-pages">Made with AI tools and overseen by an Australian GP</a> · %s</p>\n' % UPDATED
NOTE = ("General education, not personal medical advice, and not a recommendation for any medicine. "
        "Whether a medicine suits you depends on your health and other medicines, so talk to your doctor or pharmacist.")


def page_ld(path, name, desc, trail):
    d = gb.page_ld(path, name, desc, trail, ABOUT)
    d["dateModified"] = UPDATED_ISO
    return d


def check(P, title, qa, faqs, sources):
    assert len(title) <= 60, (P, len(title))
    n = gb.qa_words(qa)
    assert 40 <= n <= 62, (P, "quick answer words", n)
    assert 5 <= len(faqs) <= 7, P
    assert 3 <= len(sources) <= 7, P


def build_page(P):
    path = HUB_PATH + P["slug"] + "/"
    check(P["slug"], P["title"], P["qa"], P["faqs"], P["sources"])
    trail = [("Malady Wise", "/"), (HUB_NAME, HUB_PATH), (P["crumb"], path)]
    lds = [("mw-page-ld", page_ld(path, P["title"], P["desc"], trail)), ("mw-faq-ld", gb.faq_ld(P["faqs"]))]
    s = gb.head(path, P["title"], P["desc"], lds)
    s += '<div class="fs-top"><p class="meta"><a href="/glp-1/">GLP-1 medicines guide</a></p><button class="printbtn" type="button" onclick="window.print()">🖨 Print or save as PDF</button></div>\n'
    s += "<h1>%s</h1>\n" % P["h1"] + TRUST
    s += '<p class="lede">%s</p>\n' % P["lede"]
    s += '<p class="quick-answer"><b>Quick answer:</b> %s</p>\n' % P["qa"]
    s += P["body"].strip() + "\n"
    s += '<p class="callout">%s</p>\n' % P["urgent"]
    s += GAME + "\n"
    s += gb.faq_html(P["faqs"])
    s += gb.sources(P["sources"])
    s += '<p class="meta"><em>%s. %s</em></p>\n' % (UPDATED, NOTE)
    s += gb.related(P["related"])
    s += '<p class="print-url">maladywise.com%s</p>\n' % path
    s += gb.FOOT
    gb.write(path, s)
    return path


def build_hub():
    H = HUB
    check("hub", H["title"], H["qa"], H["faqs"], H["sources"])
    trail = [("Malady Wise", "/"), (HUB_NAME, HUB_PATH)]
    items = [{"@type": "ListItem", "position": i + 1, "url": gb.BASE + HUB_PATH + P["slug"] + "/", "name": gb.strip(P["h1"])}
             for i, P in enumerate(PAGES)]
    pld = page_ld(HUB_PATH, H["title"], H["desc"], trail)
    pld["mainEntity"] = {"@type": "ItemList", "itemListElement": items}
    lds = [("mw-page-ld", pld), ("mw-faq-ld", gb.faq_ld(H["faqs"]))]
    s = gb.head(HUB_PATH, H["title"], H["desc"], lds)
    s += "<h1>%s</h1>\n" % H["h1"] + TRUST
    s += '<p class="lede">%s</p>\n' % H["lede"]
    s += '<p class="quick-answer"><b>Quick answer:</b> %s</p>\n' % H["qa"]
    s += H["intro"].strip() + "\n"
    s += "<h2>GLP-1 guides</h2>\n"
    guides = [(P["cls"], P["group"], HUB_PATH + P["slug"] + "/", P["crumb"], P["card"]) for P in PAGES]
    guides.insert(1, ("m", "Compare", "/compare/ozempic-vs-mounjaro/", "Semaglutide vs tirzepatide",
                      "Ozempic vs Mounjaro: weight loss head to head, diabetes, heart benefits and side effects."))
    s += '<ul class="tx">' + "".join(
        '<li><span class="ev %s">%s</span><b><a href="%s">%s</a></b>%s</li>' % g for g in guides) + "</ul>\n"
    s += H["after"].strip() + "\n"
    s += GAME + "\n"
    s += gb.faq_html(H["faqs"])
    s += gb.sources(H["sources"])
    s += '<p class="meta"><em>%s. %s</em></p>\n' % (UPDATED, NOTE)
    s += '<p class="print-url">maladywise.com%s</p>\n' % HUB_PATH
    s += gb.FOOT
    gb.write(HUB_PATH, s)
    return HUB_PATH


if __name__ == "__main__":
    done = [build_hub()] + [build_page(P) for P in PAGES]
    gb.qr(done)
    print("\n".join(done))
    import static_nav  # footer links and share-card tags (STYLE.md)
    static_nav.postbuild()
