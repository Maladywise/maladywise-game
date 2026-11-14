#!/usr/bin/env python3
"""Update one mascot in window.MW_MASCOTS (assets/games.js) from a JSON file of fields to merge.
    python3 _scripts/mascot_set.py <id> fields.json      e.g. {"vibe": "...", "story": "...", "cheer": [...20 lines]}
"""
import json, re, sys, os
P = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "games.js")
mid, f = sys.argv[1], sys.argv[2]
s = open(P, encoding="utf-8").read()
m = re.search(r"(window\.MW_MASCOTS = )(\{.*?\})(;\n)", s, re.S)
d = json.loads(m.group(2))
d.setdefault(mid, {}).update(json.load(open(f, encoding="utf-8")))
s = s[:m.start(2)] + json.dumps(d, ensure_ascii=False) + s[m.end(2):]
open(P, "w", encoding="utf-8").write(s)
print(mid, "updated:", ", ".join(sorted(json.load(open(f)).keys())), "| lines:", len(d[mid].get("cheer", [])))
