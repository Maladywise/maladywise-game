#!/usr/bin/env python3
"""Puts a topic mascot beside the h1 on fact sheets listed in data/topic-heroes.json. Idempotent; run by static_nav.run()."""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def run(quiet=False):
    cfg = json.load(open(os.path.join(ROOT, "data", "topic-heroes.json"), encoding="utf-8"))["heroes"]
    n = 0
    for key, v in cfg.items():
        for u in v["pages"]:
            f = os.path.join(ROOT, u.strip("/"), "index.html")
            if not os.path.exists(f): continue
            s = open(f, encoding="utf-8").read()
            if "mw-sec-hero" in s: continue
            m = re.search(r"<h1>(.*?)</h1>", s, re.S)
            if not m: continue
            hero = ('<div class="mw-sec-hero" style="display:flex;align-items:center;gap:12px;margin:8px 0 4px"><img src="/assets/mascots/%s.svg" width="64" height="64" alt="%s" style="flex:0 0 auto"><h1 style="margin:0">%s</h1></div>'
                    % (key, v["alt"], m.group(1)))
            s = s[:m.start()] + hero + s[m.end():]
            open(f, "w", encoding="utf-8").write(s); n += 1
    if not quiet: print("topic_heroes: %d page(s) updated" % n)
if __name__ == "__main__":
    run()
