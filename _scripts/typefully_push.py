#!/usr/bin/env python3
"""Send queued X posts to Typefully (API v2), one per day at 7:30am Sydney, with optional World Day cards.

Queue: _social/queue.json  ->  {"posts": [{"date": "YYYY-MM-DD", "thread": ["post 1", ...], "note": "...", "card": true}]}
- Entries without "typefully_id" whose date is today..today+10 (Sydney) are created as scheduled drafts.
- "card": true attaches that date's World Day picture card (_scripts/day_card.py) to the first post.
- Empty dates with a strong day (priority 1-3) get an automatic single World Day post with its card,
  but only from AUTO_FROM, only once that week's Friday batch has been written (so the weekly mix
  always wins), and only if Typefully has nothing already scheduled that day (hand-made posts).
- After success the script writes back "typefully_id" and "queued_at" (auto posts are added to the
  queue too), so nothing is sent twice.
- Needs env TYPEFULLY_API_KEY (a GitHub Actions secret; never stored in the repo).

    python3 _scripts/typefully_push.py --dry-run [--days 14] [--today YYYY-MM-DD] [--out DIR]
--dry-run (or DRY_RUN=1) prints what would be sent and saves the cards as PNGs in a temp folder.
"""
import argparse, datetime, http.client, json, os, sys, tempfile, time, urllib.error, urllib.parse, urllib.request
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import day_card  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUEUE = os.path.join(ROOT, "_social", "queue.json")
API = "https://api.typefully.com/v2"
SYD = ZoneInfo("Australia/Sydney")
SLOT = (7, 30)          # 7:30am Sydney
AHEAD_DAYS = 10
AUTO_FROM = datetime.date(2026, 11, 16)   # first automated queue date; earlier dates were scheduled by hand
SITE = "https://maladywise.com/"
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


def put_file(url, data):
    """PUT raw bytes to the presigned upload URL with no extra headers (extra headers break the S3 signature)."""
    u = urllib.parse.urlsplit(url)
    conn = (http.client.HTTPSConnection if u.scheme == "https" else http.client.HTTPConnection)(u.netloc, timeout=60)
    try:
        conn.putrequest("PUT", u.path + ("?" + u.query if u.query else ""), skip_accept_encoding=True)
        conn.putheader("Content-Length", str(len(data)))
        conn.endheaders()
        conn.send(data)
        r = conn.getresponse()
        r.read()
        if r.status not in (200, 201, 204):
            raise RuntimeError("upload PUT failed: HTTP %s" % r.status)
    finally:
        conn.close()


def upload_card(sid, png_path, day):
    """Create an upload, PUT the PNG, wait until Typefully has processed it. Returns the media_id."""
    res = call("POST", "/social-sets/%s/media/upload" % sid, {"file_name": "maladywise-day-%s.png" % day})
    mid, url = res.get("media_id"), res.get("upload_url")
    if not mid or not url:
        raise RuntimeError("no media_id/upload_url in %r" % res)
    put_file(url, open(png_path, "rb").read())
    for _ in range(30):
        st = call("GET", "/social-sets/%s/media/%s" % (sid, mid)).get("status", "ready")
        if st == "ready":
            return mid
        if st == "failed":
            raise RuntimeError("Typefully could not process the image")
        time.sleep(2)
    raise RuntimeError("image still processing after 60 s")


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


def scheduled_dates(sid):
    """Sydney dates that already have a scheduled draft in Typefully (e.g. posts made by hand). None if unknown."""
    try:
        data = call("GET", "/social-sets/%s/drafts?status=scheduled&limit=50" % sid)
    except SystemExit as e:
        print("Could not list scheduled drafts (%s); skipping auto World Day posts this run." % e)
        return None
    out = set()
    for d in data.get("results", []):
        s = d.get("scheduled_date") or d.get("publish_at")
        if s:
            out.add(datetime.datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(SYD).date().isoformat())
    return out


# ---------- automatic World Day post ----------
TAILS = ["Themed puzzles are up. Diagnose them before your coffee goes cold.",
         "Today's puzzles are themed. No referral needed.",
         "The puzzles are themed today. Stethoscope optional.",
         "Themed puzzles today. Five minutes, no waiting room."]
TAILS_PLAIN = ["Today's puzzles are waiting. No referral needed.",
               "Fresh puzzles are up. Stethoscope optional."]


def weekly_batch_written(day, today):
    """The Friday task writes Sat-Fri. A date is only free for an auto post once its Friday batch has run."""
    fri = day - datetime.timedelta(days=(day.weekday() - 4) % 7 or 7)   # last Friday strictly before `day`
    return today > fri


def site_link(x):
    """Matching fact sheet, else the day's entry on /days/, else the home page."""
    import re
    gen = set("world international national global day days week month awareness of the for and on to a in "
              "elimination remembrance victims".split())
    core = " ".join(w for w in re.findall(r"[A-Za-z0-9']+", re.sub(r"\([^)]*\)", "", x["name"])) if w.lower() not in gen).lower()
    vague = {"cancer", "kidney", "heart", "liver", "health", "mental health", "eye", "skin", "lung", "brain", "blood"}
    try:
        idx = open(os.path.join(ROOT, "conditions", "index.html"), encoding="utf-8").read()
        sheets = re.findall(r'<a href="/([a-z0-9-]+)/"><b>([^<]+)</b>', idx)
    except FileNotFoundError:
        sheets = []
    if core:
        exact = [s for s, t in sheets if t.lower() == core or s == core.replace(" ", "-")]
        loose = [s for s, t in sheets if re.search(r"\b%s\b" % re.escape(core), t.lower())] if core not in vague else []
        hit = exact or (loose if len(loose) == 1 else [])
        if hit and os.path.isfile(os.path.join(ROOT, hit[0], "index.html")):
            return SITE + hit[0] + "/"
    try:
        if ('id="day-%s"' % x["id"]) in open(os.path.join(ROOT, "days", "index.html"), encoding="utf-8").read():
            return SITE + "days/#day-" + x["id"]
    except (FileNotFoundError, KeyError):
        pass
    return SITE


def x_len(text):
    """X length: every link counts as 23."""
    import re
    return len(re.sub(r"https?://\S+", "x" * 23, text))


def auto_post(day):
    """Text for an automatic World Day post on ISO date `day`, or None if the day doesn't qualify."""
    import re
    x = day_card.main_day(day)
    if not x:
        return None
    yr = day[:4]
    if x.get("kind") == "week" and x["dates"][yr]["start"] != day:
        return None  # a week gets one post, on its first day
    _, sens_too = day_card.lead_of(day)
    name, hook, link = day_card.display_name(x), day_card.hook(x), site_link(x)
    n = datetime.date.fromisoformat(day).toordinal()
    gentle = "gentle" in (x.get("tags") or []) or sens_too
    if gentle:  # respectful: no sass, no hashtag
        texts = ["Today is %s. %s\n\n%s" % (name, hook, link), "Today is %s.\n\n%s" % (name, link)]
    else:
        tail = (TAILS if day_card.themed(x, day) else TAILS_PLAIN)
        tail = tail[n % len(tail)]
        tag = "#" + "".join(w[:1].upper() + w[1:] for w in re.findall(r"[A-Za-z0-9]+", name))
        tag = tag if len(tag) <= 30 else ""
        lead = "It's %s." % name
        texts = ["%s %s\n\n%s\n%s%s" % (lead, hook, tail, link, "\n\n" + tag if tag else ""),
                 "%s %s\n\n%s\n%s" % (lead, hook, tail, link),
                 "%s %s\n\n%s" % (lead, hook, link),
                 "%s\n\n%s\n%s" % (lead, tail, link)]
    for t in texts:
        if x_len(t) <= 280:
            return {"date": day, "note": "Auto World Day: %s" % name, "thread": [t], "card": True, "auto": True}
    return None


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true", help="print what would be sent; save cards to a temp folder")
    ap.add_argument("--days", type=int, default=AHEAD_DAYS, help="days ahead to look (default %d)" % AHEAD_DAYS)
    ap.add_argument("--today", help="pretend today is this Sydney date (testing)")
    ap.add_argument("--out", help="folder for dry-run PNGs (default: a new temp folder)")
    a = ap.parse_args()
    dry = a.dry_run or os.environ.get("DRY_RUN") == "1"

    q = json.load(open(QUEUE, encoding="utf-8"))
    now = datetime.datetime.now(SYD)
    today = datetime.date.fromisoformat(a.today) if a.today else now.date()
    if a.today:
        now = datetime.datetime(today.year, today.month, today.day, 5, 0, tzinfo=SYD)
    last = today + datetime.timedelta(days=a.days)
    posts = q.setdefault("posts", [])
    have = {p["date"] for p in posts}

    def slot(d):
        return datetime.datetime(d.year, d.month, d.day, SLOT[0], SLOT[1], tzinfo=SYD)

    todo = []
    for p in posts:
        if p.get("typefully_id") or not p.get("thread"):
            continue
        d = datetime.date.fromisoformat(p["date"])
        if today <= d <= last:
            todo.append(p)
    autos = []
    d = max(today, AUTO_FROM)
    while d <= last:
        iso = d.isoformat()
        if iso not in have and slot(d) > now + datetime.timedelta(minutes=10):
            if not weekly_batch_written(d, today):
                if auto_post(iso):
                    print("Wait (weekly batch not written yet):", iso, auto_post(iso)["note"])
            else:
                e = auto_post(iso)
                if e:
                    autos.append(e)
        d += datetime.timedelta(days=1)
    todo = sorted(todo + autos, key=lambda p: p["date"])
    if not todo:
        print("Nothing to queue.")
        return 0
    if not KEY and not dry:
        raise SystemExit("TYPEFULLY_API_KEY is not set.")
    sid = None if dry else social_set_id()
    busy = set() if dry or not autos else scheduled_dates(sid)
    out_dir = a.out or tempfile.mkdtemp(prefix="mw-cards-")
    os.makedirs(out_dir, exist_ok=True)

    browser = pw = None

    def card_for(day):
        nonlocal browser, pw
        if browser is None:
            from playwright.sync_api import sync_playwright
            pw = sync_playwright().start()
            browser = pw.chromium.launch()
        path = os.path.join(out_dir, "day-card-%s.png" % day)
        return path if day_card.render(day, path, browser) else None

    changed = False
    try:
        for p in todo:
            d = datetime.date.fromisoformat(p["date"])
            when = slot(d)
            if when <= now + datetime.timedelta(minutes=10):
                print("Skip (slot already passed):", p["date"]); continue
            if p.get("auto") and (busy is None or p["date"] in busy):
                print("Skip auto post (Typefully already has a post that day):", p["date"]); continue
            for t in p["thread"]:
                if x_len(t) > 280:
                    raise SystemExit("Post over 280 characters on %s: %r" % (p["date"], t[:60]))
            post0 = {"text": p["thread"][0]}
            body = {"platforms": {"x": {"enabled": True, "posts": [post0] + [{"text": t} for t in p["thread"][1:]]}},
                    "publish_at": when.astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}
            png = None
            if p.get("card"):
                try:
                    png = card_for(p["date"])
                    if not png:
                        print("No strong day on %s, so no card." % p["date"])
                except Exception as e:  # never lose the post over the picture
                    print("Card render failed for %s: %s" % (p["date"], e))
            if dry:
                print("DRY", p["date"], body["publish_at"], "AUTO" if p.get("auto") else "queue",
                      len(p["thread"]), "post(s)", "+ card " + png if png else "")
                print("   " + p["thread"][0].replace("\n", "\n   "))
                continue
            if png:
                try:
                    post0["media_ids"] = [upload_card(sid, png, p["date"])]
                except (Exception, SystemExit) as e:
                    print("Card upload failed for %s (%s); posting without it." % (p["date"], e))
            res = call("POST", "/social-sets/%s/drafts" % sid, body)
            p["typefully_id"] = str(res.get("id", "ok"))
            p["queued_at"] = datetime.datetime.now(SYD).isoformat(timespec="minutes")
            if p.pop("auto", None):
                posts.append(p)
            changed = True
            print("Queued", p["date"], "->", p["typefully_id"], "with card" if "media_ids" in post0 else "")
        if dry:  # preview every card in the window, attached or not
            d = today
            while d <= last:
                path = os.path.join(out_dir, "day-card-%s.png" % d.isoformat())
                if not os.path.exists(path) and day_card.main_day(d.isoformat()):
                    card_for(d.isoformat())
                d += datetime.timedelta(days=1)
    finally:
        if browser is not None:
            browser.close()
            pw.stop()
    if dry:
        print("Cards saved in", out_dir)
    if changed:
        posts.sort(key=lambda p: p["date"])
        with open(QUEUE, "w", encoding="utf-8") as f:
            json.dump(q, f, ensure_ascii=False, indent=1)
            f.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
