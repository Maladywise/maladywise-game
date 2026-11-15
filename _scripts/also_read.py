#!/usr/bin/env python3
"""Adds contextual "Related" links from data/also-read.json to pages (body links, not footer).
Idempotent: items it adds carry data-also and are replaced on every run. Run by static_nav.run(),
so links survive page rebuilds. Stdlib only.
    python3 _scripts/also_read.py
"""
import html, json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def kind(u):
    if u.startswith("/blood-tests/"): return "Blood test"
    if u.startswith("/medicines/"): return "Drug"
    if u.startswith("/tools/"): return "Tool"
    if u.startswith("/compare/"): return "Compare"
    if u.startswith("/glp-1/"): return "GLP-1 guide"
    if u.startswith("/anatomy-quiz/"): return "Quiz"
    if u in ("/research/", "/medicine-recalls/"): return "Guide"
    return "Fact sheet"

def label(u):
    p = os.path.join(ROOT, u.strip("/"), "index.html")
    if not os.path.exists(p): return None
    s = open(p, encoding="utf-8").read()
    m = re.search(r"<h1[^>]*>(.*?)</h1>", s, re.S) or re.search(r"<title>(.*?)(?: \| Malady Wise)?</title>", s)
    return re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else None

def run(quiet=False):
    cfg = json.load(open(os.path.join(ROOT, "data", "also-read.json"), encoding="utf-8"))["links"]
    n = 0
    for page, targets in cfg.items():
        p = os.path.join(ROOT, page.strip("/"), "index.html")
        if not os.path.exists(p): continue
        s0 = open(p, encoding="utf-8").read()
        s = re.sub(r'<li data-also>.*?</li>', "", s0)
        s = re.sub(r'<section class="related" data-also>.*?</section>\n?', "", s, flags=re.S)
        items = []
        for t in targets:
            lab = label(t)
            if not lab or ('href="%s"' % t) in s: continue
            items.append('<li data-also><a href="%s"><span>%s</span>%s</a></li>' % (t, kind(t), html.escape(lab, quote=False)))
        if items:
            m = re.search(r'(<section class="related"[^>]*>.*?<ul>)', s, re.S)
            if m:
                s = s[:m.end()] + "".join(items) + s[m.end():]
            else:
                blk = '<section class="related" data-also><h2>Related</h2><ul>%s</ul></section>' % "".join(items)
                anchor = s.find('<div id="nl-slot">')
                if anchor < 0: anchor = s.find("</main>")
                if anchor < 0: continue
                s = s[:anchor] + blk + "\n" + s[anchor:]
        if s != s0:
            open(p, "w", encoding="utf-8").write(s); n += 1
    if not quiet: print("also_read: %d page(s) updated" % n)

if __name__ == "__main__":
    run()
