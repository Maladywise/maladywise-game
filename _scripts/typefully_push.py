#!/usr/bin/env python3
"""Send queued X posts to Typefully (API v2), one per slot (7:30am and 12:30pm Sydney), always as an image post + link reply.

Queue: _social/queue.json  ->  {"posts": [{"date": "YYYY-MM-DD", "slot": "am"|"noon", "thread": ["post 1", ...], "note": "...", "card": true}]}
- Two slots a day: "am" = 7:30am (the weekly mix; the default when "slot" is missing) and "noon" = 12:30pm
  (world health day posts: history, facts, why it matters). One post per slot.
- Entries without "typefully_id" whose date is today..today+10 (Sydney) are created as scheduled drafts.
- X shows posts with links to far fewer people, so every draft is sent as a thread: post 1 has an image
  and NO link; the link goes in post 2 (the first reply), e.g. "Play today's puzzle → https://...".
  Queue text is converted at send time: links are moved out of post 1 (into post 2, or a new post 2 if
  it won't fit), and a single post gets a reply with its link (or the home page if it had none).
- Image on post 1: "card": true -> that date's World Day card (_scripts/day_card.py); "card": "<day id>" -> the
  card for that specific day from data/health-days.json (when the post isn't about the home page's lead day); otherwise the
  linked page's og:image read from its HTML at push time (games: assets/og/<game>.png; deep dives:
  their own page card); a game whose og:image is the generic share card gets a generated card with its
  name and teaser; fallback assets/og/<first path segment>.png, then the site share card.
- Empty NOON slots with a strong day (priority 1-3) get an automatic single World Day post with its card
  (skipped when that day's 7:30am entry already carries the day card),
  but only from AUTO_FROM, only once that week's Friday batch has been written (so the weekly mix
  always wins), and only if Typefully has nothing already scheduled that day (hand-made posts).
- After each successful post the script writes back "typefully_id" and "queued_at" to the queue file
  straight away (auto posts are added to the queue too), so a later failure never causes a re-send.
- Every post is length-checked (X counts each link as 23) before anything is sent. A post over 280
  characters is skipped with an error, the rest still go, and the script exits with status 1.
- Weekly Short: an entry with "short": {"series": "ecg|sign|rarest", "puzzle_date": "YYYY-MM-DD"} gets a
  1080x1920 MP4 rendered on the fly by _scripts/shorts/shorts.py (needs Playwright + Chromium + ffmpeg)
  and uploaded as post 1's media instead of an image. MP4s are never committed. If the render or upload
  fails, the entry is held back (exit status 1) and retried on the next run; within 36 hours of its slot
  it goes out with the game's picture instead, so the day is never left empty.
- ONE POST PER SLOT: before sending, the script lists Typefully's scheduled drafts. A queue entry whose date
  already has a post moves to the next free 7:30am slot (entries with "pin": true wait instead), and auto
  World Day posts skip taken days. If Typefully can't be checked, nothing is sent that run.
- Needs env TYPEFULLY_API_KEY (a GitHub Actions secret; never stored in the repo).

    python3 _scripts/typefully_push.py --dry-run [--days 14] [--today YYYY-MM-DD] [--out DIR]
--dry-run (or DRY_RUN=1) prints what would be sent and saves the cards (PNG) and Shorts (MP4) in a temp folder.
"""
import argparse, datetime, html, http.client, json, os, re, sys, tempfile, time, urllib.error, urllib.parse, urllib.request
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "shorts"))
import day_card  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUEUE = os.path.join(ROOT, "_social", "queue.json")
API = "https://api.typefully.com/v2"
SYD = ZoneInfo("Australia/Sydney")
SLOTS = {"am": (7, 30), "noon": (12, 30)}   # 7:30am Sydney (weekly mix); 12:30pm Sydney (world health day posts)


def slot_of(p):
    return p.get("slot") or "am"


def key_of(p):
    return "%s|%s" % (p["date"], slot_of(p))
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


VIDEO_EXT = (".mp4", ".mov")
POLL_SECONDS = 3


def upload_card(sid, path, day, alt=None):
    """Create an upload, PUT the file (image or MP4), wait until Typefully has processed it. Returns the media_id.
    Typefully detects the type from file_name's extension (.png/.jpg/.mp4/.mov ...); the PUT carries no headers.
    Then GET /media/{id} is polled until its status is "ready" (videos take longer: up to 10 minutes)."""
    ext = os.path.splitext(path)[1].lower() or ".png"
    video = ext in VIDEO_EXT
    body = {"file_name": "maladywise-%s%s%s" % ("short-" if video else "", day, ext)}
    if alt:
        body["alt_text"] = alt[:1000]
    res = call("POST", "/social-sets/%s/media/upload" % sid, body)
    mid, url = res.get("media_id"), res.get("upload_url")
    if not mid or not url:
        raise RuntimeError("no media_id/upload_url in %r" % res)
    with open(path, "rb") as f:
        put_file(url, f.read())
    tries = 200 if video else 30
    for _ in range(tries):
        st = (call("GET", "/social-sets/%s/media/%s" % (sid, mid)).get("status") or "ready").lower()
        if st == "ready":
            return mid
        if st in ("failed", "error"):
            raise RuntimeError("Typefully could not process the %s" % ("video" if video else "image"))
        time.sleep(POLL_SECONDS)
    raise RuntimeError("%s still processing after %d s" % ("video" if video else "image", tries * POLL_SECONDS))


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
            t = datetime.datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(SYD)
            out.add("%s|%s" % (t.date().isoformat(), "noon" if t.hour >= 11 else "am"))
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


def invalid_posts(todo):
    """[(entry, reason)] for queue entries that must not be sent: empty or over 280 X characters (after the link move)."""
    out = []
    for p in todo:
        th = p.get("thread")
        if not isinstance(th, list) or not th or not all(isinstance(t, str) and t.strip() for t in th):
            out.append((p, "empty or malformed thread"))
            continue
        if any("/specialists" in t.lower() for t in th):
            out.append((p, "links to the specialists directory (owner rule: never post specialist pages to X)"))
            continue
        th, _ = to_x_thread(th)
        if len(re.findall(r"(?<!\w)#\w+", th[0])) > 1:
            print("Warning: %s post 1 has more than one hashtag (style: at most 1)." % p["date"], file=sys.stderr)
        for i, t in enumerate(th, 1):
            n = x_len(t)
            if n > 280:
                out.append((p, "post %d is %d characters (max 280, links count as 23): %r" % (i, n, t[:60])))
                break
    return out


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
        texts = ["Today is %s. %s" % (name, hook), "Today is %s." % name]
        reply = "Find out more → %s" % link
    else:
        tail = (TAILS if day_card.themed(x, day) else TAILS_PLAIN)
        tail = tail[n % len(tail)]
        tag = "#" + "".join(w[:1].upper() + w[1:] for w in re.findall(r"[A-Za-z0-9]+", name))
        tag = tag if len(tag) <= 30 else ""
        lead = "It's %s." % name
        texts = ["%s %s\n\n%s%s" % (lead, hook, tail, "\n\n" + tag if tag else ""),
                 "%s %s\n\n%s" % (lead, hook, tail),
                 "%s %s" % (lead, hook),
                 "%s\n\n%s" % (lead, tail)]
        reply = "Play today's puzzles → %s" % SITE
        if link != SITE:
            reply += "\nRead more → %s" % link
    for t in texts:
        if x_len(t) <= 280:
            return {"date": day, "slot": "noon", "note": "Auto World Day: %s" % name, "thread": [t, reply], "card": True, "auto": True}
    return None


# ---------- image post + link reply ----------
URL_RE = re.compile(r"https?://[^\s<>\"]+")


def urls_in(text):
    return [u.rstrip(".,;:!?)]'’”") for u in URL_RE.findall(text)]


def cta_for(url):
    """Short call to action for the reply, from the link's shape."""
    path = urllib.parse.urlsplit(url).path.strip("/")
    seg = path.split("/")[0] if path else ""
    if "maladywise.com" not in url:
        return "Read more"
    if not seg:
        return "Play today's puzzles"
    if seg == "deep-dives":
        return "Read the full deep dive"
    if seg in ("zebra-mail", "subscribe", "newsletter"):
        return "Subscribe free"
    if seg in ("stackulus", "mergeon", "basil-clover", "arcade"):
        return "Play it free"
    if seg in games():
        return "Play today's puzzle" if "date=" in url else "Play it free"
    return "Read more"


def tidy(text):
    """Post text with its links removed, reading cleanly: no dangling colons/arrows or blank-line pile-ups."""
    lines = []
    for ln in text.split("\n"):
        had = bool(URL_RE.search(ln))
        ln = re.sub(r"[ \t]*[:→➡👉👇]?[ \t]*" + URL_RE.pattern, "", ln).rstrip()
        if had:
            ln = re.sub(r"[\s:→➡👉👇\-–—|]+$", "", ln)
            if re.search(r"(here|at|via|link|on)$", ln, re.I) and len(ln.split()) <= 3:
                ln = ""  # "Play here", "Link" etc. mean nothing without the link
        lines.append(re.sub(r"[ \t]{2,}", " ", ln))
    out = re.sub(r"\n{3,}", "\n\n", "\n".join(lines)).strip()
    return out


def to_x_thread(thread):
    """(posts, url): post 1 without links, the link in post 2. Keeps longer threads' structure."""
    th = [t.strip() for t in thread]
    all_urls = [u for t in th for u in urls_in(t)]
    first = urls_in(th[0])
    url = (first or all_urls or [SITE])[0]
    reply = "%s → %s" % (cta_for(url), url)
    if first:
        th[0] = tidy(th[0])
        extra = [u for u in first[1:] if u != url]
        if extra:
            reply += "".join("\n" + u for u in extra)
        if not th[0]:
            th[0] = cta_for(url) + " 👇"
        if len(th) == 1:
            th.append(reply)
        elif url in th[1]:
            pass
        elif x_len(th[1] + "\n\n" + reply) <= 280:
            th[1] = th[1] + "\n\n" + reply
        else:
            th.insert(1, reply)
    elif len(th) == 1:
        th.append(reply)
    return th, url


GAMES = None


def games():
    global GAMES
    if GAMES is None:
        GAMES = load_games()
    return GAMES


def load_games():
    """Folder names that are games: every top-level folder whose og:image lives in assets/og/ (not facts/tools)."""
    out = set()
    for d in os.listdir(ROOT):
        og = page_og(d)
        if og and "/assets/og/" in og and not re.search(r"/(facts|tools|drugs)\.png", og):
            out.add(d)
    return out


def page_file(url):
    """Local HTML file for a maladywise.com URL, or None."""
    u = urllib.parse.urlsplit(url)
    if not u.netloc.endswith("maladywise.com"):
        return None
    path = u.path.strip("/")
    f = os.path.join(ROOT, path, "index.html") if not path.endswith(".html") else os.path.join(ROOT, path)
    return f if os.path.isfile(f) else None


def meta(doc, prop):
    m = re.search(r'<meta[^>]+(?:property|name)="%s"[^>]+content="([^"]*)"' % re.escape(prop), doc) or \
        re.search(r'<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="%s"' % re.escape(prop), doc)
    return html.unescape(m.group(1)) if m else None


def page_og(seg_or_url):
    f = page_file(seg_or_url) if "://" in seg_or_url else os.path.join(ROOT, seg_or_url, "index.html")
    if not f or not os.path.isfile(f):
        return None
    try:
        return meta(open(f, encoding="utf-8").read(), "og:image")
    except (OSError, UnicodeDecodeError):
        return None


def local_asset(og):
    """https://maladywise.com/assets/og/x.png?v=2 -> local path, if that file exists in the repo."""
    if not og:
        return None
    u = urllib.parse.urlsplit(og)
    if u.netloc and not u.netloc.endswith("maladywise.com"):
        return None
    f = os.path.join(ROOT, u.path.lstrip("/"))
    return f if os.path.isfile(f) else None


SHARE = os.path.join(ROOT, "assets", "share.png")


def page_image(url):
    """("file", path) or ("game", name, teaser) for the page the post links to."""
    seg = urllib.parse.urlsplit(url).path.strip("/").split("/")[0] if "maladywise.com" in url else ""
    og = page_og(url)
    f = local_asset(og)
    generic = f and os.path.basename(f).startswith("share.")
    if f and not (generic and seg):
        return ("file", f)
    if seg:
        pf = page_file(url)
        if generic and pf:  # a game with no picture of its own: draw one from its title and description
            doc = open(pf, encoding="utf-8").read()
            t = re.search(r"<title>([^<]+)</title>", doc)
            name = re.split(r"\s*[|:–—]\s*", html.unescape(t.group(1)))[0].strip() if t else seg.title()
            desc = meta(doc, "og:description") or meta(doc, "description") or ""
            teaser = re.split(r"(?<=[.!?])\s+", desc)[0] if desc else ""
            teaser = re.sub(r"^%s (is|are) " % re.escape(name), "", teaser, flags=re.I)
            teaser = teaser[:1].upper() + teaser[1:]
            return ("game", name, teaser)
        g = os.path.join(ROOT, "assets", "og", seg + ".png")
        if os.path.isfile(g):
            return ("file", g)
    return ("file", SHARE)


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
    have = {key_of(p) for p in posts}

    def slot(d, k="am"):
        h, m = SLOTS[k]
        return datetime.datetime(d.year, d.month, d.day, h, m, tzinfo=SYD)

    def day_already_marked(iso):
        """The 7:30am post that day is already about the day (World Day card, or names the day), so no extra noon post."""
        x = day_card.main_day(iso)
        name = (x or {}).get("name", "").lower()
        for e in posts:
            if e["date"] == iso and slot_of(e) == "am":
                if e.get("card") or (name and name in (e.get("note", "") + " " + " ".join(e.get("thread") or [])).lower()):
                    return True
        return False

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
        if iso + "|noon" not in have and not day_already_marked(iso) and slot(d, "noon") > now + datetime.timedelta(minutes=10):
            if not weekly_batch_written(d, today):
                if auto_post(iso):
                    print("Wait (weekly batch not written yet):", iso, auto_post(iso)["note"])
            else:
                e = auto_post(iso)
                if e:
                    autos.append(e)
        d += datetime.timedelta(days=1)
    todo = sorted(todo + autos, key=lambda p: (p["date"], slot_of(p)))
    bad = invalid_posts(todo)
    for p, why in bad:
        print("ERROR: not sending %s: %s" % (p["date"], why), file=sys.stderr)
    todo = [p for p in todo if p not in [b[0] for b in bad]]
    if not todo:
        print("Nothing to queue.")
        return 1 if bad else 0
    if not KEY and not dry:
        raise SystemExit("TYPEFULLY_API_KEY is not set.")
    sid = None if dry else social_set_id()
    # ONE POST PER SLOT: dates that already have a scheduled Typefully draft (hand-made or earlier runs).
    busy = set() if dry else scheduled_dates(sid)
    out_dir = a.out or tempfile.mkdtemp(prefix="mw-cards-")
    os.makedirs(out_dir, exist_ok=True)

    browser = pw = None
    held = []   # Shorts that failed to render/upload; retried next run

    def card_for(day, day_id=None):
        nonlocal browser, pw
        if browser is None:
            from playwright.sync_api import sync_playwright
            pw = sync_playwright().start()
            browser = pw.chromium.launch()
        path = os.path.join(out_dir, "day-card-%s%s.png" % (day, "-" + day_id if day_id else ""))
        return path if day_card.render(day, path, browser, day_id) else None

    def short_for(p):
        """Render this entry's weekly Short to an MP4 in out_dir. Returns (path, alt text)."""
        nonlocal browser, pw
        import shorts
        if browser is None:
            from playwright.sync_api import sync_playwright
            pw = sync_playwright().start()
            browser = pw.chromium.launch()
        s = p["short"]
        path = os.path.join(out_dir, "short-%s-%s.mp4" % (p["date"], shorts.GAME[s["series"]]))
        shorts.render_short(s["series"], s["puzzle_date"], path, browser)
        return path, shorts.alt_text(s["series"], shorts.puzzle(s["series"], s["puzzle_date"]))

    def image_for(p, url):
        """Local image path for post 1: day card, page og image, generated game card, or the share card."""
        if p.get("card"):
            try:
                png = card_for(p["date"], p["card"] if isinstance(p["card"], str) else None)
                if png:
                    return png
                print("No strong day on %s, so no day card." % p["date"])
            except Exception as e:  # never lose the post over the picture
                print("Card render failed for %s: %s" % (p["date"], e))
        pick = page_image(url)
        if pick[0] == "game":
            try:
                nonlocal browser, pw
                if browser is None:
                    from playwright.sync_api import sync_playwright
                    pw = sync_playwright().start()
                    browser = pw.chromium.launch()
                path = os.path.join(out_dir, "game-card-%s.png" % p["date"])
                return day_card.render_game(pick[1], pick[2], p["date"], path, browser)
            except Exception as e:
                print("Game card render failed for %s: %s" % (p["date"], e))
                return SHARE
        return pick[1]

    def save():
        posts.sort(key=lambda p: p["date"])
        tmp = QUEUE + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(q, f, ensure_ascii=False, indent=1)
            f.write("\n")
        os.replace(tmp, QUEUE)

    try:
        for p in todo:
            d = datetime.date.fromisoformat(p["date"])
            k = slot_of(p)
            when = slot(d, k)
            if when <= now + datetime.timedelta(minutes=10):
                print("Skip (slot already passed):", key_of(p)); continue
            if p.get("auto") and (busy is None or key_of(p) in busy):
                print("Skip auto post (Typefully already has a post that day):", p["date"]); continue
            if busy is None and not dry:
                print("Hold (couldn't check Typefully for clashes; retry next run):", p["date"]); continue
            if busy and key_of(p) in busy:
                # never two posts in one slot: a "pin": true entry waits for its own day (retried next run, dropped
                # once its slot passes); anything else moves to the next free 7:30am slot within the window
                if p.get("pin"):
                    print("Hold pinned post (slot taken in Typefully):", p["date"]); continue
                nd, moved = d, False
                while nd <= last:
                    nd += datetime.timedelta(days=1)
                    iso = nd.isoformat()
                    if iso + "|" + k not in busy and iso + "|" + k not in {key_of(x) for x in posts if x is not p}:
                        print("Moved %s -> %s (%s slot taken in Typefully)" % (p["date"], iso, k))
                        p["moved_from"] = p["date"]; p["date"] = iso; d = nd; when = slot(d, k); moved = True
                        break
                if not moved:
                    print("Hold (no free slot in the next %d days):" % a.days, p["date"]); continue
            xs, url = to_x_thread(p["thread"])
            post0 = {"text": xs[0]}
            body = {"platforms": {"x": {"enabled": True, "posts": [post0] + [{"text": t} for t in xs[1:]]}},
                    "publish_at": when.astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}
            alt = None
            if p.get("short"):
                try:
                    png, alt = short_for(p)
                except Exception as e:  # noqa: BLE001
                    if when - now > datetime.timedelta(hours=36):
                        print("ERROR: Short render failed for %s (%s); holding it back to retry next run." % (p["date"], e), file=sys.stderr)
                        held.append(p["date"])
                        continue
                    print("Short render failed for %s (%s); slot is close, posting with the game picture instead." % (p["date"], e))
                    png = image_for(p, url)
            else:
                png = image_for(p, url)
            if dry:
                print("DRY", key_of(p), body["publish_at"], "AUTO" if p.get("auto") else "queue",
                      len(xs), "post(s) + %s" % ("video" if (png or "").endswith(VIDEO_EXT) else "image"),
                      os.path.relpath(png, ROOT) if png.startswith(ROOT) else png)
                for i, t in enumerate(xs, 1):
                    print("   [%d] " % i + t.replace("\n", "\n       "))
                continue
            if png:
                try:
                    post0["media_ids"] = [upload_card(sid, png, p["date"], alt)]
                except (Exception, SystemExit) as e:
                    if (png or "").endswith(VIDEO_EXT) and when - now > datetime.timedelta(hours=36):
                        print("ERROR: video upload failed for %s (%s); holding it back to retry next run." % (p["date"], e), file=sys.stderr)
                        held.append(p["date"])
                        continue
                    print("%s upload failed for %s (%s); posting without it." % ("Video" if (png or "").endswith(VIDEO_EXT) else "Image", p["date"], e))
            body["publish_at"] = when.astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
            res = call("POST", "/social-sets/%s/drafts" % sid, body)
            if busy is not None:
                busy.add(key_of(p))
            p["typefully_id"] = str(res.get("id", "ok"))
            p["queued_at"] = datetime.datetime.now(SYD).isoformat(timespec="minutes")
            if p.pop("auto", None):
                posts.append(p)
            save()  # write back now, so a crash on a later post can't cause a duplicate
            print("Queued", p["date"], "->", p["typefully_id"],
                  ("with video" if (png or "").endswith(VIDEO_EXT) else "with image") if "media_ids" in post0 else "WITHOUT media")
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
        print("Cards and videos saved in", out_dir)
    return 1 if bad or held else 0


if __name__ == "__main__":
    sys.exit(main())
