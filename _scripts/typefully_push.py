#!/usr/bin/env python3
"""Send queued X posts to Typefully (API v2), one per day at 7:30am Sydney.

Queue: _social/queue.json  ->  {"posts": [{"date": "YYYY-MM-DD", "thread": ["post 1", "post 2", ...], "note": "..."}]}
- Entries without "typefully_id" whose date is today..today+10 (Sydney) are created as scheduled drafts.
- After success the script writes back "typefully_id" and "queued_at", so nothing is sent twice.
- Needs env TYPEFULLY_API_KEY (a GitHub Actions secret; never stored in the repo).
- DRY_RUN=1 prints what would be sent.
"""
import json, os, sys, datetime, urllib.request, urllib.error
from zoneinfo import ZoneInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUEUE = os.path.join(ROOT, "_social", "queue.json")
API = "https://api.typefully.com/v2"
SYD = ZoneInfo("Australia/Sydney")
SLOT = (7, 30)          # 7:30am Sydney
AHEAD_DAYS = 10
DRY = os.environ.get("DRY_RUN") == "1"
KEY = os.environ.get("TYPEFULLY_API_KEY", "").strip()


def call(method, path, body=None):
    req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Authorization": "Bearer " + KEY, "Content-Type": "application/json", "Accept": "application/json",
                                          "User-Agent": "maladywise-queue/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        raise SystemExit("Typefully API %s %s failed: HTTP %s %s" % (method, path, e.code, e.read().decode()[:400]))


def social_set_id():
    if os.environ.get("TYPEFULLY_SOCIAL_SET_ID"):
        return os.environ["TYPEFULLY_SOCIAL_SET_ID"]
    data = call("GET", "/social-sets")
    sets = data.get("results", data if isinstance(data, list) else [])
    if not sets:
        raise SystemExit("No Typefully social sets found for this API key.")
    for s in sets:  # prefer the Malady Wise account if there are several
        blob = json.dumps(s).lower()
        if "maladywise" in blob:
            return s["id"]
    return sets[0]["id"]


def main():
    q = json.load(open(QUEUE, encoding="utf-8"))
    today = datetime.datetime.now(SYD).date()
    todo = []
    for p in q.get("posts", []):
        if p.get("typefully_id") or not p.get("thread"):
            continue
        d = datetime.date.fromisoformat(p["date"])
        if today <= d <= today + datetime.timedelta(days=AHEAD_DAYS):
            todo.append(p)
    if not todo:
        print("Nothing to queue.")
        return 0
    if not KEY and not DRY:
        raise SystemExit("TYPEFULLY_API_KEY is not set.")
    sid = None if DRY else social_set_id()
    changed = False
    for p in todo:
        d = datetime.date.fromisoformat(p["date"])
        when = datetime.datetime(d.year, d.month, d.day, SLOT[0], SLOT[1], tzinfo=SYD)
        if when <= datetime.datetime.now(SYD) + datetime.timedelta(minutes=10):
            print("Skip (slot already passed):", p["date"]); continue
        body = {"platforms": {"x": {"enabled": True, "posts": [{"text": t} for t in p["thread"]]}},
                "publish_at": when.astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}
        for t in p["thread"]:
            if len(t) > 280:
                raise SystemExit("Post over 280 characters on %s: %r" % (p["date"], t[:60]))
        if DRY:
            print("DRY", p["date"], body["publish_at"], len(p["thread"]), "post(s):", p["thread"][0][:70]); continue
        res = call("POST", "/social-sets/%s/drafts" % sid, body)
        p["typefully_id"] = str(res.get("id", "ok"))
        p["queued_at"] = datetime.datetime.now(SYD).isoformat(timespec="minutes")
        changed = True
        print("Queued", p["date"], "->", p["typefully_id"])
    if changed:
        with open(QUEUE, "w", encoding="utf-8") as f:
            json.dump(q, f, ensure_ascii=False, indent=1)
            f.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
