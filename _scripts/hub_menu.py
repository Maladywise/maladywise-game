#!/usr/bin/env python3
"""Put the most-used topic hubs in the top menu's Hubs dropdown.

    python3 _scripts/hub_menu.py                 # fetch ranking from mw-presence, update assets/site.js
    python3 _scripts/hub_menu.py --rank r.json   # use a saved ranking ({"key": score, ...})
    python3 _scripts/hub_menu.py --dry           # show the choice, change nothing

Score = minutes people spent on each hub's pages over the last 28 days (mw-presence counts the
"still here" pings every page sends; no personal data). Hubs with "menu": true in data/hubs.json
compete for menu_size places; ties keep the hubs.json order. An "All hubs" link always ends the list.
With too little data (under MIN_TOTAL pings) the menu is left as it is.
"""
import json, os, re, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = "https://mw-presence.onrender.com/hubrank?days=28"
MIN_TOTAL = 40


def js(s):
    return json.dumps(s, ensure_ascii=False)


def bump(asset="site.js"):
    """Raise the ?v= cache-buster for an asset on every page (same as the manual version-bump loop)."""
    import glob
    pat = re.compile(re.escape(asset) + r"\?v=(\d+)\b")
    files = [f for ext in ("html", "py", "js") for f in glob.glob(os.path.join(ROOT, "**", "*." + ext), recursive=True) if "/.claude/" not in f]
    cur = None
    for f in files:
        if f.endswith(".html"):
            m = pat.search(open(f, encoding="utf-8", errors="ignore").read())
            if m: cur = int(m.group(1)); break
    if cur is None: return
    for f in files:
        s = open(f, encoding="utf-8", errors="ignore").read()
        n = re.sub(re.escape(asset) + r"\?v=%d\b" % cur, "%s?v=%d" % (asset, cur + 1), s)
        if n != s: open(f, "w", encoding="utf-8").write(n)


def main():
    a = sys.argv[1:]
    hubs = json.load(open(os.path.join(ROOT, "data", "hubs.json"), encoding="utf-8"))
    if "--rank" in a:
        rank = json.load(open(a[a.index("--rank") + 1]))
    else:
        rank = None
        for _ in range(3):  # the free Render service may be asleep: the first call wakes it
            try:
                rank = json.load(urllib.request.urlopen(URL, timeout=60)).get("hubs", {}); break
            except Exception as e:
                print("fetch failed:", e)
        if rank is None:
            print("no ranking; menu unchanged"); return
    cands = [i for g in hubs["groups"] for i in g["items"] if i.get("menu")]
    order = {i["key"]: n for n, i in enumerate(cands)}
    total = sum(int(rank.get(i["key"][:24], rank.get(i["key"], 0))) for i in cands)
    pick = sorted(cands, key=lambda i: (-int(rank.get(i["key"][:24], rank.get(i["key"], 0))), order[i["key"]]))[: hubs.get("menu_size", 4)]
    for i in cands:
        print("%5d  %s%s" % (int(rank.get(i["key"][:24], rank.get(i["key"], 0))), i["t"], "  <- menu" if i in pick else ""))
    if total < MIN_TOTAL:
        print("only %d pings in total; menu unchanged" % total); return
    pick.sort(key=lambda i: order[i["key"]])  # keep a stable, familiar order inside the menu
    lines = ['      { t: %s, href: %s, d: %s }' % (js(i["t"]), js(i["href"]), js(i["d"])) for i in pick]
    lines.append('      { t: "All hubs", href: "/hubs/", d: "Every hub on the site" }')
    block = '    { t: "Hubs", medical: true, items: [\n' + ",\n".join(lines) + "\n    ] },\n"
    p = os.path.join(ROOT, "assets", "site.js")
    s = open(p, encoding="utf-8").read()
    m = re.search(r'    \{ t: "Hubs".*?\n    \] \},\n', s, re.S)
    if not m:
        print("Hubs block not found in site.js"); sys.exit(1)
    if s[m.start():m.end()] == block:
        print("menu already up to date"); return
    if "--dry" in a:
        print(block); return
    open(p, "w", encoding="utf-8").write(s[:m.start()] + block + s[m.end():])
    bump("site.js")
    print("site.js Hubs menu updated")


if __name__ == "__main__":
    main()
