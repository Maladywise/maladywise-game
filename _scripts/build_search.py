#!/usr/bin/env python3
"""Builds data/search-index.json for the site search (magnifier in the top bar, assets/shell.js "site search").
One entry per sitemap page: [url, title, kind, description]. Run after adding pages (build_llms.py calls it).
    python3 _scripts/build_search.py
"""
import html, json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP = re.compile(r"^/(specialists/(?!$)|mental-health-check/|nightshift/|[a-z-]+/archive/)")

GAMES = {"/%s/" % g for g in "dxtective wordemic comorbix morphemia linkase gridectomy suturix triviosis zebritis glimpsis opacitis panelysis arrhythmix sudokrine cryptoplexy grand-rounds anatomegaly sensitosis basil-clover stackulus mergeon gp-school".split()}
HUBS = {"/%s/" % h for h in "normie conditions tools zebra-mail medicines deep-dives arcade weird specialists rare-conditions medical-games compare glp-1 blood-tests research doctors mascots shop patients days exercises site-stats quizzes".split()}

def kind(u):
    p = u.strip("/").split("/")
    if not p[0]: return "Home"
    if p[0] in ("medicines",) and len(p) > 1: return "Medicine"
    if p[0] == "blood-tests" and len(p) > 1: return "Blood test"
    if p[0] == "deep-dives" and len(p) > 1: return "Deep dive"
    if p[0] == "tools" and len(p) > 1: return "Tool"
    if p[0] == "compare" and len(p) > 1: return "Compare"
    if p[0] in ("anatomy-quiz", "ecg-quiz", "medical-terminology-quiz") or p[0].endswith("-quiz"): return "Quiz"
    if p[0] == "zebra-mail" and len(p) > 1: return "News"
    if p[0] == "mascots" and len(p) > 1: return "Mascot"
    if len(p) > 1 and p[1] == "exercises": return "Exercises"
    return None

def main():
    sm = open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8").read()
    urls = re.findall(r"<loc>https://maladywise\.com(/[^<]*)</loc>", sm)
    games = {}
    gs = open(os.path.join(ROOT, "assets", "games.js"), encoding="utf-8").read()
    for m in re.finditer(r'(?:kind: "([^"]+)", )?name: "([^"]+)", path: "([a-z-]+)/"', gs):
        games["/" + m.group(3) + "/"] = (m.group(2), m.group(1) or "Daily puzzle")
    out = []
    for u in urls:
        if SKIP.match(u) and u != "/specialists/": continue
        f = os.path.join(ROOT, u.strip("/"), "index.html") if u != "/" else os.path.join(ROOT, "index.html")
        if not os.path.exists(f): continue
        s = open(f, encoding="utf-8").read()
        if 'http-equiv="refresh"' in s[:3000] or "noindex" in s[:3000]: continue
        t = re.search(r"<title>(.*?)</title>", s, re.S)
        d = re.search(r'<meta name="description" content="([^"]*)"', s)
        title = html.unescape(t.group(1)).replace(" | Malady Wise", "").strip() if t else u
        desc = html.unescape(d.group(1)).strip() if d else ""
        k = kind(u)
        if u in games: k = "Game · " + games[u][1]
        elif u in GAMES: k = "Game"
        elif u in HUBS: k = "Section"
        if not k:
            k = "Fact sheet" if re.search(r'"@type":\s*"MedicalCondition"|class="fs-top"', s) else "Page"
        out.append([u, title[:90], k, desc[:160]])
    json.dump(out, open(os.path.join(ROOT, "data", "search-index.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("search-index: %d pages" % len(out))

if __name__ == "__main__":
    main()
