#!/usr/bin/env python3
"""Fetch Google Trends "Trending now" (incl. the Health category) for AU, US and GB.

Runs in GitHub Actions (cloud sessions can't reach Google Trends reliably). Writes data/trends-google.json:
{"fetched": ISO time, "regions": {"AU": {"health": [...], "all": [...], "rss": [...]}, ...}}
Each item: {"term", "volume", "started", "related"}. The morning briefing and evening puzzle refresh read it.

Two sources per region:
- the Trending now page's own data call (batchexecute, rpc i0OFE), which returns every trend with its
  category ids; Health is category 7.
- the public RSS feed (top trends, all categories) as a fallback.
"""
import datetime, json, os, re, sys, urllib.parse, urllib.request
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "trends-google.json")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"
REGIONS = ["AU", "US", "GB"]
HEALTH = 7
DEBUG = "--debug" in sys.argv


def get(url, data=None, headers=None):
    h = {"User-Agent": UA, "Accept-Language": "en-AU,en;q=0.9"}
    h.update(headers or {})
    req = urllib.request.Request(url, data=data, headers=h)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def rss(geo):
    xml = get("https://trends.google.com/trending/rss?geo=%s" % geo)
    ns = {"ht": "https://trends.google.com/trending/rss"}
    out = []
    for it in ET.fromstring(xml).iter("item"):
        t = it.findtext("title") or ""
        v = it.findtext("ht:approx_traffic", default="", namespaces=ns)
        news = [n.findtext("ht:news_item_title", default="", namespaces=ns) for n in it.findall("ht:news_item", ns)][:2]
        out.append({"term": t.strip(), "volume": v.strip(), "news": [n for n in news if n]})
    return out


def walk_trends(node, found):
    """Trend rows look like [term, null, geo, [start_secs], [end_secs]|null, null, volume, null, pct, [related...], [cat ids], ...].
    Find lists whose first item is a string and that contain an int list of category ids."""
    if isinstance(node, list):
        if len(node) > 10 and isinstance(node[0], str) and isinstance(node[2], str) and len(node[2]) == 2:
            found.append(node)
            return
        for x in node:
            walk_trends(x, found)


def trending_now(geo, hours=24):
    inner = json.dumps([None, None, geo, 0, "en-US", hours, 1])
    freq = json.dumps([[["i0OFE", inner, None, "generic"]]])
    body = urllib.parse.urlencode({"f.req": freq}).encode()
    raw = get("https://trends.google.com/_/TrendsUi/data/batchexecute?rpcids=i0OFE&source-path=%2Ftrending&hl=en-US&rt=c",
              data=body, headers={"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"})
    if DEBUG:
        print("RAW", geo, raw[:3000])
    rows = []
    for line in raw.splitlines():
        line = line.strip()
        if not line.startswith("[["):
            continue
        try:
            outer = json.loads(line)
        except Exception:
            continue
        for part in outer:
            if isinstance(part, list) and len(part) > 2 and part[0] == "wrb.fr" and isinstance(part[2], str):
                walk_trends(json.loads(part[2]), rows)
    items = []
    for r in rows:
        cats = next((x for x in r[9:] if isinstance(x, list) and x and all(isinstance(c, int) for c in x)), [])
        rel = next((x for x in r[9:] if isinstance(x, list) and x and all(isinstance(c, str) for c in x)), [])
        vol = r[6] if len(r) > 6 and isinstance(r[6], int) else None
        start = r[3][0] if isinstance(r[3], list) and r[3] and isinstance(r[3][0], int) else None
        items.append({"term": r[0], "volume": vol, "pct": r[8] if len(r) > 8 and isinstance(r[8], (int, float)) else None,
                      "started": datetime.datetime.utcfromtimestamp(start).isoformat() + "Z" if start else None,
                      "related": rel[:5], "cats": cats})
    return items


def main():
    out = {"_about": "Google Trends fetched by GitHub Actions (.github/workflows/trends.yml) each morning ~5:40am Sydney. "
                     "health = 'Trending now' Health category (past 24h); all = every category; rss = public RSS top list.",
           "fetched": datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z", "regions": {}, "errors": []}
    for geo in REGIONS:
        reg = {}
        try:
            allt = trending_now(geo)
            reg["all"] = [{k: v for k, v in t.items() if k != "cats"} | {"health": HEALTH in t["cats"]} for t in allt]
            reg["health"] = [{k: v for k, v in t.items() if k != "cats"} for t in allt if HEALTH in t["cats"]]
        except Exception as e:
            out["errors"].append("%s trending: %s" % (geo, str(e)[:160]))
        try:
            reg["rss"] = rss(geo)
        except Exception as e:
            out["errors"].append("%s rss: %s" % (geo, str(e)[:160]))
        out["regions"][geo] = reg
        print(geo, "all:", len(reg.get("all", [])), "health:", len(reg.get("health", [])), "rss:", len(reg.get("rss", [])))
        for t in reg.get("health", [])[:12]:
            print("   ", t["term"], t["volume"])
    json.dump(out, open(OUT, "w"), ensure_ascii=False, indent=1)
    print("errors:", out["errors"])


if __name__ == "__main__":
    main()
