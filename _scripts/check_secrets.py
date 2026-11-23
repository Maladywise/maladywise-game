"""List where secret code words turn up as puzzle answers (Wordemic, Gridectomy), and flag days with more than one.
Rule (Nov 2026): at most one secret per day across all games; each code word 3-4 times a year. Plan: data/secret-seeds.json."""
import json, glob, re, collections, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, "assets/secrets.js"), encoding="utf-8").read()
body = src[src.index("var CODES = {"):src.index("var CODE_KEYS")]
CODES = set(re.findall(r"^\s{6}([a-z]+): function", body, re.M))
hits = collections.defaultdict(list)
for f in glob.glob(os.path.join(ROOT, "wordemic/puzzles/**/*.json"), recursive=True):
    if "reserve" in f: continue
    for p in json.load(open(f)):
        w = p["word"].lower()
        if w in CODES: hits[p["date"]].append(("wordemic" + ("-normie" if "normie" in f else ""), w))
for f in glob.glob(os.path.join(ROOT, "gridectomy/puzzles/**/*.json"), recursive=True):
    for p in json.load(open(f)):
        rows = p["rows"]; words = set()
        for r in rows: words |= set(x.lower() for x in r.split("#") if len(x) > 2)
        for c in range(len(rows[0])): words |= set(x.lower() for x in "".join(r[c] for r in rows).split("#") if len(x) > 2)
        for w in words & CODES: hits[p["date"]].append(("gridectomy" + ("-normie" if "normie" in f else ""), w))
since = sys.argv[1] if len(sys.argv) > 1 else "0000"
per = collections.Counter(); bad = 0
for d in sorted(hits):
    if d < since: continue
    for g, w in hits[d]: per[w] += 1
    flag = "  <-- more than one" if len(hits[d]) > 1 else ""
    bad += bool(flag); print(d, hits[d], flag)
print("days with more than one:", bad); print("counts:", dict(per.most_common()))
