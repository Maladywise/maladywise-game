#!/usr/bin/env python3
"""Build /llms.txt (and /llms-full.txt index) from sitemap.xml: a plain-text map of the site for AI assistants.
See https://llmstxt.org. Run after adding pages; the daily days-soon workflow also runs it."""
import os, re, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SM = open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8").read()
urls = re.findall(r"<loc>https://maladywise\.com(/[^<]*)</loc>", SM)

SECTIONS = [
    ("Daily medical puzzles and games", lambda p: p.count("/") == 2 and os.path.exists(os.path.join(ROOT, p.strip("/"), "puzzles")) or p in ("/medical-games/", "/arcade/", "/normie/") or p.rstrip("/").split("/")[-1] in ("stackulus", "mergeon", "basil-clover")),
    ("Quizzes", lambda p: "quiz" in p and "/archive" not in p),
    ("Blood test results explained", lambda p: p.startswith("/blood-tests/")),
    ("GLP-1 medicines (semaglutide, tirzepatide)", lambda p: p.startswith("/glp-1/")),
    ("Medicines", lambda p: p.startswith("/medicines/")),
    ("Exercise handouts", lambda p: "/exercises/" in p or "/stretches/" in p),
    ("Calculators and tools", lambda p: p.startswith("/tools/")),
    ("Comparisons", lambda p: p.startswith("/compare/")),
    ("Deep dives for health professionals", lambda p: p.startswith("/deep-dives/")),
    ("World health days", lambda p: p.startswith("/days/")),
    ("Newsletter (Zebra Mail)", lambda p: p.startswith("/zebra-mail/")),
    ("For doctors and GPs", lambda p: p.startswith(("/mbs-billing/", "/gp-school/", "/rare-conditions/"))),
]
SKIP = ("/archive", "/specialists/", "/tag-review/", "/case-1/", "/mental-health-check/")

def meta(p):
    f = os.path.join(ROOT, p.strip("/"), "index.html") if p != "/" else os.path.join(ROOT, "index.html")
    if not os.path.exists(f):
        return None, None
    s = open(f, encoding="utf-8", errors="ignore").read()
    t = re.search(r"<title>(.*?)</title>", s, re.S)
    d = re.search(r'<meta name="description" content="([^"]*)"', s)
    title = html.unescape(t.group(1)).replace(" | Malady Wise", "").strip() if t else p
    return title, html.unescape(d.group(1)).strip() if d else ""

groups = {name: [] for name, _ in SECTIONS}
groups["Health fact sheets (conditions)"] = []
for p in urls:
    if p == "/" or any(x in p for x in SKIP):
        continue
    title, desc = meta(p)
    if not title:
        continue
    for name, test in SECTIONS:
        try:
            ok = test(p)
        except Exception:
            ok = False
        if ok:
            groups[name].append((p, title, desc)); break
    else:
        if p.count("/") == 2:
            groups["Health fact sheets (conditions)"].append((p, title, desc))

order = ["Daily medical puzzles and games", "Quizzes", "Health fact sheets (conditions)", "Blood test results explained",
         "GLP-1 medicines (semaglutide, tirzepatide)", "Medicines", "Exercise handouts", "Calculators and tools", "Comparisons", "Deep dives for health professionals",
         "For doctors and GPs", "World health days", "Newsletter (Zebra Mail)"]
out = ["# Malady Wise", "",
       "> Free daily medical puzzles and games (Medical and non-medical 'Normie' modes), plus plain-English health fact sheets, blood test explainers, exercise handouts, calculators and evidence-based deep dives for clinicians. Made with AI tools and overseen by an Australian GP. General education, not personal medical advice.", "",
       "- Audience: the public, students and health professionals worldwide; Australian details where relevant.",
       "- Spelling: Australian/British English. Units: SI.",
       "- How pages are made: https://maladywise.com/about/#how-we-make-pages",
       "- Privacy: https://maladywise.com/privacy/",
       "- Sponsorship and advertising policy: https://maladywise.com/sponsorship/", ""]
for name in order:
    items = sorted(groups.get(name, []), key=lambda x: x[1].lower())
    if not items:
        continue
    out.append("## " + name)
    out.append("")
    for p, t, d in items:
        out.append(f"- [{t}](https://maladywise.com{p})" + (f": {d}" if d else ""))
    out.append("")
open(os.path.join(ROOT, "llms.txt"), "w", encoding="utf-8").write("\n".join(out))
print("llms.txt:", sum(len(v) for v in groups.values()), "pages")

# Home page "Read this week" row (data/home-reads.json)
import subprocess as _sp, sys as _sys
_sp.run([_sys.executable, __import__("os").path.join(__import__("os").path.dirname(__file__), "build_home_reads.py")])
