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

def zebra():
    """Zebra of the week from the Zebra Atlas: a worldwide condition, 1 in 10,000 to 1 in a million, rotating by ISO week."""
    try: d = json.load(open("data/rare-conditions.json", encoding="utf-8"))
    except Exception: return None
    rows = [r for r in d["rows"] if r[2] == "prev" and r[4] == "Worldwide" and 1 <= r[5] <= 100 and "," not in r[0] and len(r[0]) <= 40 and not re.search(r"\b(type|due to|deficiency of)\b", r[0], re.I)]
    if not rows: return None
    rows.sort(key=lambda r: r[1])
    from datetime import date
    y, w, _ = date.today().isocalendar()
    r = rows[(y * 53 + w) * 7919 % len(rows)]
    from urllib.parse import quote
    name = r[0][0].upper() + r[0][1:]
    return {"href": "/rare-conditions/?q=" + quote(r[0]), "title": name, "text": r[3][0].upper() + r[3][1:] + " people. One of %s rare conditions, ranked by rarity." % format(len(d["rows"]), ",")}

def guide():
    """Health guide: the newest fact sheet (added in the last 14 days, by git history), else a weekly rotation."""
    import subprocess
    from datetime import date, timedelta
    m = re.search(r"window\.MW_FACTS = (\{.*?\});\n", open("assets/site.js", encoding="utf-8").read(), re.S)
    if not m: return None
    F = json.loads(m.group(1)); facts = sorted(k for k, v in F.items() if v.get("k") == "fact" and os.path.exists("." + k + "index.html"))
    if not facts: return None
    pick, cut = None, (date.today() - timedelta(days=14)).isoformat()
    try:
        log = subprocess.run(["git", "log", "--diff-filter=A", "--format=@%as", "--name-only", "--since=" + cut, "--", "*/index.html"], capture_output=True, text=True, timeout=60).stdout
        when = ""
        for line in log.splitlines():
            if line.startswith("@"): when = line[1:]; continue
            k = "/" + line.strip()[:-len("index.html")] if line.strip().endswith("/index.html") else None
            if k in F and F[k].get("k") == "fact": pick = k; break  # newest first
    except Exception: pass
    if not pick:
        y, w, _ = date.today().isocalendar(); pick = facts[(y * 53 + w) * 7919 % len(facts)]
    h = open("." + pick + "index.html", encoding="utf-8").read()
    d = re.search(r'<meta name="description" content="([^"]*)"', h); t = html.unescape(d.group(1)) if d else ""
    t = t.split(":", 1)[1].strip() if ":" in t[:60] else t
    t = t[0].upper() + t[1:] if t else t
    t = t if len(t) <= 95 else t[:t.rfind(" ", 0, 92)].rstrip(",;:") + "…"
    return {"href": pick, "title": F[pick]["t"], "text": t}

out = {k: v for k, v in (("deep", deep_dive()), ("guide", guide()), ("zebra", zebra()), ("research", research()), ("dose", dose())) if v}
os.makedirs("data", exist_ok=True)
old = open("data/home-reads.json").read() if os.path.exists("data/home-reads.json") else ""
new = json.dumps(out, ensure_ascii=False, indent=1)
if new != old: open("data/home-reads.json", "w").write(new)
print("home-reads:", ", ".join(out))
