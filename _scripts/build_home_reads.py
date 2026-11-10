#!/usr/bin/env python3
"""Write data/home-reads.json: the newest deep dive, research week and Weekly Dose for the home page "Read this week" row.
Run from the repo root. Called by build_llms.py, so it refreshes whenever the site pipeline runs."""
import json, os, re, glob, html
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def deep_dive():
    s = open("deep-dives/index.html", encoding="utf-8").read()
    best = None
    for m in re.finditer(r'Deep dive #(\d+)[^<]*</span><b><a href="(/deep-dives/[a-z0-9-]+/)">([^<]+)</a></b>([^<]*)', s):
        n = int(m.group(1))
        if not best or n > best[0]: best = (n, m.group(2), html.unescape(m.group(3)), html.unescape(m.group(4)).strip())
    if not best: return None
    t = best[3]; t = t if len(t) <= 90 else t[:t.rfind(" ", 0, 88)].rstrip(",;:") + "…"
    return {"href": best[1], "title": best[2], "text": t}

def research():
    try: d = json.load(open("data/research.json", encoding="utf-8"))
    except Exception: return None
    w = (d.get("weeks") or [None])[0]
    if not w or not w.get("studies"): return None
    n = len(w["studies"]) - 1
    return {"href": "/research/", "title": w["studies"][0]["title"], "text": ("Plus %d more studies and the trials to watch." % n) if n > 0 else "And the trials to watch."}

def dose():
    ds = sorted(p for p in glob.glob("zebra-mail/20??-??-??/") if os.path.exists(p + "index.html"))
    if not ds: return None
    p = ds[-1]; s = open(p + "index.html", encoding="utf-8").read()
    m = re.search(r'<meta name="description" content="([^"]*)"', s)
    t = html.unescape(m.group(1)) if m else ""
    t = re.sub(r"^The Weekly Dose, [^:]*:\s*", "", t).split(". Plus")[0].rstrip(".") + "."
    from datetime import date
    y, mo, da = map(int, p.strip("/").split("/")[-1].split("-"))
    return {"href": "/" + p, "title": "The Weekly Dose, " + date(y, mo, da).strftime("%-d %b"), "text": t}

out = {k: v for k, v in (("deep", deep_dive()), ("research", research()), ("dose", dose())) if v}
os.makedirs("data", exist_ok=True)
old = open("data/home-reads.json").read() if os.path.exists("data/home-reads.json") else ""
new = json.dumps(out, ensure_ascii=False, indent=1)
if new != old: open("data/home-reads.json", "w").write(new)
print("home-reads:", ", ".join(out))
