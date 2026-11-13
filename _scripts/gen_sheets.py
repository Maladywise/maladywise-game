#!/usr/bin/env python3
"""Generate fact sheets and medicine guides from small Python content files (stdlib only).

HOW TO RUN (from the repo root)
    python3 _scripts/gen_sheets.py _scripts/sheets/meds_nov26.py [more content files]

A content file calls fact(...) and/or med(...) (both injected here). Each writes <slug>/index.html
(or medicines/<slug>/index.html) and registers the page: window.MW_FACTS in assets/site.js,
the Conditions or Medicines index list, and sitemap.xml. Then run the usual pipeline (STYLE.md):
headkit.py, og_cards.py --only, share_block.py, static_nav.py, build_llms.py, check_sitemap.py --fix,
site_check.py.

Page shapes match the hand-built sheets (see /gout/ and /medicines/modafinil/): FAQ and MedicalWebPage
JSON-LD, the print button (one-page print is handled by assets/shell.js), Related links, an "Updated" line.
"""
import datetime, html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TODAY = datetime.date.today()
UPDATED = "%d %s %d" % (TODAY.day, TODAY.strftime("%B"), TODAY.year)


def asset_v(name):
    s = open(os.path.join(ROOT, "medicines", "modafinil", "index.html"), encoding="utf-8").read()
    m = re.search(re.escape(name) + r"\?v=(\d+)", s)
    return m.group(1) if m else "1"


def ul(items, cls=None):
    return ("<ul class=\"%s\">" % cls if cls else "<ul>") + "".join("<li>%s</li>" % i for i in items) + "</ul>"


def esc_text(s):
    return re.sub(r"<[^>]+>", "", s)


def ladder(title, intro, steps, foot="Costs are rough Australian prices and vary by pharmacy and provider. PBS co-payment: $25, or $7.70 with a concession card. Results are typical figures from trials, not promises."):
    """steps: (cls 's'|'m'|'l', label, title, text, works, cost, how_long, watch, sass)"""
    out = "<h2>%s</h2>\n<p class=\"evkey\">%s</p>\n<ol class=\"tx ladder\">" % (title, intro)
    for c, lab, t, txt, w, co, hl, wf, sass in steps:
        out += ('<li><span class="ev %s">%s</span><b>%s</b>%s<dl><dt>Works</dt><dd>%s</dd><dt>Cost</dt><dd>%s</dd><dt>How long</dt><dd>%s</dd>'
                '<dt>Watch for</dt><dd>%s</dd></dl>%s</li>') % (c, lab, t, txt, w, co, hl, wf, '<p class="sass">%s</p>' % sass if sass else "")
    return out + "</ol>\n<p class=\"evkey\">%s</p>\n" % foot


def skip(items, intro="Popular, heavily marketed or often asked about, but the evidence is weak or says no."):
    return ("<h2>Save your money</h2>\n<p class=\"evkey\">%s</p>\n<ul class=\"skip\">" % intro +
            "".join("<li><b>%s</b><span>%s</span></li>" % (b, t) for b, t in items) + "</ul>\n")


def h2(t, items):
    return "<h2>%s</h2>%s" % (t, ul(items))


def head(url, title, desc, faq, name, kind, about_type, crumbs):
    page_ld = {"@context": "https://schema.org", "@type": "MedicalWebPage", "name": title, "description": desc,
               "url": "https://maladywise.com" + url, "inLanguage": "en-AU",
               "audience": {"@type": "MedicalAudience", "audienceType": "Patient"},
               "author": {"@type": "Organization", "name": "Malady Wise", "url": "https://maladywise.com/"},
               "publisher": {"@type": "Organization", "name": "Malady Wise", "url": "https://maladywise.com/"},
               "breadcrumb": {"@type": "BreadcrumbList", "itemListElement": [
                   {"@type": "ListItem", "position": i + 1, "name": n, "item": "https://maladywise.com" + u} for i, (n, u) in enumerate(crumbs)]},
               "about": {"@type": about_type, "name": name}, "dateModified": TODAY.strftime("%Y-%m")}
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": esc_text(a)}} for q, a in faq]}
    return """<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<link rel="canonical" href="https://maladywise.com%(url)s">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="max-image-preview:large">
<title>%(title)s | Malady Wise</title>
<meta name="description" content="%(desc)s">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48.png">
<link rel="icon" type="image/png" sizes="96x96" href="/assets/favicon-96.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<meta name="theme-color" content="#4A3480">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Malady Wise">
<meta property="og:title" content="%(title)s | Malady Wise">
<meta property="og:description" content="%(desc)s">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="/assets/fonts/poppins-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<script>try{var r=document.documentElement,t=localStorage.getItem("mw-theme");r.setAttribute("data-pre","");try{t=JSON.parse(t)}catch(e){}r.setAttribute("data-theme",t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light")}catch(e){}</script>
<link rel="stylesheet" href="/assets/shell.css?v=%(cssv)s">
<script defer src="/assets/games.js?v=%(gv)s"></script>
<script defer src="/assets/site.js?v=%(sv)s"></script>
<script defer src="/assets/shell.js?v=%(shv)s"></script>
<script type="application/ld+json" id="mw-faq-ld">%(faq)s</script>
<script type="application/ld+json" id="mw-page-ld">%(page)s</script>
</head>
<body>
<main class="wrap doc">
<div class="fs-top"><p class="meta">%(kind)s</p><button class="printbtn" type="button" onclick="window.print()">🖨 Print or save as PDF</button></div>
""" % dict(url=url, title=html.escape(title, False), desc=html.escape(desc), kind=kind,
           cssv=asset_v("shell.css"), gv=asset_v("games.js"), sv=asset_v("site.js"), shv=asset_v("shell.js"),
           faq=json.dumps(faq_ld, ensure_ascii=False), page=json.dumps(page_ld, ensure_ascii=False))


def tail(url, faq, related, label_of):
    rel = "".join('<li><a href="%s"><span>%s</span>%s</a></li>' % (u, label_of(u), t) for t, u in related)
    return ("<section class=\"faq\"><h2>Common questions</h2>" +
            "".join("<details><summary>%s</summary><p>%s</p></details>" % (q, a) for q, a in faq) + "</section>\n"
            ), ("<section class=\"related\"><h2>Related</h2><ul>%s</ul></section>\n<p class=\"print-url\">maladywise.com%s</p>\n"
                "<footer class=\"site\">\n<p class=\"ft-base\"><span class=\"ft-note\">General education, not personal medical advice.</span> "
                "<span class=\"ft-links\"><a href=\"/about/\">About</a> <a href=\"/disclaimer/\">Disclaimer</a> <a href=\"/privacy/\">Privacy</a> "
                "<a href=\"/contact/\">Contact</a></span></p></footer>\n</main>\n<script defer src=\"/assets/boot.js?v=1\" data-mw=\"page\"></script>\n</body>\n</html>\n") % (rel, url)


def label_of(u):
    return "Drug" if u.startswith("/medicines/") else "Deep dive" if u.startswith("/deep-dives/") else "Guide" if u.count("/") > 2 else "Fact sheet"


REG = []  # (url, title, kind, groups, related, index_label, blurb, search)


def fact(slug, title, desc, h1, name, lede, body, faq, res, src, related, groups=("Other",), blurb="", search=""):
    url = "/%s/" % slug
    out = head(url, title, desc, faq, name, "Fact sheet", "MedicalCondition",
               [("Malady Wise", "/"), ("Conditions", "/conditions/"), (h1, url)])
    out += "<h1>%s</h1>\n<p class=\"lede\">%s</p>\n%s\n" % (h1, lede, body)
    f, t = tail(url, faq, related, label_of)
    out += f
    if res:
        out += "<h2>Helpful resources</h2>\n<ul class=\"res\">" + "".join(
            '<li><a href="%s" rel="noopener">%s</a><span>%s</span></li>' % (u, n, d) for n, u, d in res) + "</ul>\n"
    out += "<h2>Evidence and more information</h2>\n<ul class=\"src\">" + "".join('<li><a href="%s">%s</a></li>' % (u, n) for n, u in src) + "</ul>\n"
    out += "<p class=\"meta\"><em>Updated %s. General education, not personal medical advice. Treatment depends on your situation, so talk to your GP or pharmacist.</em></p>\n\n" % UPDATED
    out += t
    write(url, out)
    REG.append((url, h1, "fact", list(groups), [u for _, u in related], None, blurb or esc_text(lede).split(". ")[0] + ".", search))


def med(slug, title, desc, h1, name, tags, lede, quick, glance, sass, brands, how, used, se_summary, se, urgent, good, faq, src, related,
        index_label="", blurb="", extra=""):
    """se = list of (cls, label, range, [items]); cls in v,c,u,r,vr (very common .. very rare)."""
    url = "/medicines/%s/" % slug
    out = head(url, title, desc, faq, name, "Drug info", "Drug", [("Malady Wise", "/"), ("Medicines", "/medicines/"), (h1, url)])
    out += "<h1>%s</h1>\n<p class=\"drug-tags\">%s</p>\n<p class=\"lede\">%s</p>\n" % (
        h1, " ".join('<span class="ev %s">%s</span>' % (c, t) for c, t in tags), lede)
    out += "<p class=\"quick-answer\"><b>Quick answer:</b> %s</p>\n" % quick
    out += "<h2>At a glance</h2><div class=\"glance\"><dl>%s</dl><p class=\"sass\">%s</p></div>\n" % (
        "".join("<dt>%s</dt><dd>%s</dd>" % (k, v) for k, v in glance), sass)
    out += "<h2>Brand names</h2>\n%s\n<h2>How it works</h2>\n<p>%s</p>\n<h2>Used for</h2>\n%s\n" % (ul(brands), how, ul(used))
    out += extra
    out += "<h2>Side effects</h2>\n<p>%s</p>\n" % se_summary
    if se:
        out += ("<details class=\"se-more\"><summary>Full side-effect list (from the product information)</summary>\n"
                "<p class=\"evkey\">How often, from the official product information. <b>Bold</b> = serious.</p>\n<div class=\"se\">")
        for cls, lab, rng, items in se:
            out += "<div class=\"se-g se-%s\"><p class=\"se-h\"><b>%s</b> <span>%s</span></p>%s\n</div>" % (cls, lab, rng, ul(items))
        out += "</div>\n</details>\n"
    out += "<h2>Get help urgently if</h2>\n%s\n<h2>Good to know</h2>\n%s\n" % (ul(urgent), ul(good))
    f, t = tail(url, faq, related, label_of)
    out += f
    out += ("<p class=\"callout\"><b>Information only.</b> Not a recommendation or endorsement of any product. Whether a medicine suits you "
            "depends on your health and other medicines, so talk to your doctor or pharmacist. In an emergency, call 000 (Australia) or your "
            "local emergency number. From a mobile, 112 works in most countries.</p>\n")
    out += "<h2>More information</h2>\n<ul class=\"src\">" + "".join('<li><a href="%s">%s</a></li>' % (u, n) for n, u in src) + "</ul>\n"
    out += "<p class=\"meta\"><em>Updated %s.</em></p>\n\n" % UPDATED
    out += t
    write(url, out)
    REG.append((url, h1, "drug", [], [u for _, u in related], index_label or tags[0][1], blurb or esc_text(lede), ""))


def page(url, title, desc, h1, name, kind, crumbs, body, faq, src, related, audience="Clinician", about_type="MedicalCondition"):
    """A free-form page (clinician guides, algorithms, hubs) with the same head, FAQ, sources and Related."""
    out = head(url, title, desc, faq, name, kind, about_type, crumbs)
    if audience != "Patient":
        out = out.replace('"audienceType": "Patient"', '"audienceType": "%s"' % audience)
    out += "<h1>%s</h1>\n%s\n" % (h1, body)
    f, t = tail(url, faq, related, label_of)
    if faq:
        out += f
    if src:
        out += "<h2>Evidence and references</h2>\n<ul class=\"src\">" + "".join('<li><a href="%s">%s</a></li>' % (u, n) for n, u in src) + "</ul>\n"
    out += "<p class=\"meta\"><em>Updated %s. For health professionals. General information, not a substitute for clinical judgement.</em></p>\n\n" % UPDATED
    out += t
    write(url, out)


def write(url, s):
    d = os.path.join(ROOT, url.strip("/"))
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(s)
    print("wrote", url)


def register():
    p = os.path.join(ROOT, "assets", "site.js")
    s = open(p, encoding="utf-8").read()
    for url, t, k, g, r, lab, blurb, q in REG:
        e = json.dumps({"t": t, "k": k, "g": g, "r": r[:4]}, ensure_ascii=False, separators=(",", ":"))
        m = re.search(r'"%s":\{[^{}]*\}' % re.escape(url), s)
        if m:
            s = s[:m.start()] + '"%s":%s' % (url, e) + s[m.end():]
        else:
            s = s.replace("window.MW_FACTS = {", 'window.MW_FACTS = {"%s":%s,' % (url, e), 1)
    open(p, "w", encoding="utf-8").write(s)
    # index lists, inserted alphabetically
    for url, t, k, g, r, lab, blurb, q in REG:
        if k == "drug":
            ip = os.path.join(ROOT, "medicines", "index.html")
            item = '<li><span class="ev m">%s</span><b><a href="%s">%s</a></b>%s</li>' % (lab, url, t, blurb)
            pat = r'<li><span class="ev m">[^<]*</span><b><a href="(/[^"]+/)">([^<]+)</a></b>'
        else:
            ip = os.path.join(ROOT, "conditions", "index.html")
            item = '<li data-q="%s %s"><a href="%s"><b>%s</b></a><span>%s</span></li>' % (html.escape(q.lower()), html.escape(esc_text(blurb).lower()), url, t, blurb)
            pat = r'<li data-q="[^"]*"><a href="(/[^"]+/)"><b>([^<]+)</b>'
        s = open(ip, encoding="utf-8").read()
        if 'href="%s"' % url in s:
            continue
        lis = re.findall(pat, s)
        nxt = [h for h, b in lis if b.lower() > t.lower()]
        if nxt:
            i = s.find('href="%s"' % nxt[0]); i = s.rfind("<li", 0, i)
        else:
            last = lis[-1][0]; i = s.find('href="%s"' % last); i = s.find("</li>", i) + 5
        s = s[:i] + item + s[i:]
        open(ip, "w", encoding="utf-8").write(s)
    sp = os.path.join(ROOT, "sitemap.xml")
    s = open(sp, encoding="utf-8").read()
    for url, *_ in REG:
        u = "https://maladywise.com" + url
        if "<loc>%s</loc>" % u not in s:
            s = s.replace("</urlset>", "  <url><loc>%s</loc><lastmod>%s</lastmod><changefreq>monthly</changefreq></url>\n</urlset>" % (u, TODAY.isoformat()))
    open(sp, "w", encoding="utf-8").write(s)


if __name__ == "__main__":
    env = {"fact": fact, "med": med, "ul": ul, "ladder": ladder, "skip": skip, "h2": h2, "page": page}
    for f in sys.argv[1:]:
        exec(compile(open(f, encoding="utf-8").read(), f, "exec"), env)
    register()
    print(len(REG), "pages registered")
