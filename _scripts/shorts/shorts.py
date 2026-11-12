#!/usr/bin/env python3
"""Malady Wise weekly Short: a 1080x1920 H.264 MP4 quiz video from a PAST puzzle, for X.

Three series, rotated week by week (ECG, Spot the sign, Rarest answer):
  ecg     Arrhythmix   "Guess the ECG in 10 seconds"  (fictional case, ecg.js strip; key features after the reveal)
  sign    Glimpsis     "Spot the sign"                (only images licensed PD / CC0 / CC BY / CC BY-SA; credit on screen)
  rarest  Zebritis     "Rarest answer wins"           (one prompt's answers, horse to unicorn)
Frames are drawn by Chromium (Playwright) from _scripts/shorts/page/*.html using repo assets only
(self-hosted fonts, mascots, arrhythmix/ecg.js) and piped to ffmpeg. Treatment pearls are never shown.

Puzzle pick: the oldest puzzle of that series dated at least 7 days before the post date (and before
today), not already in _social/shorts-log.json or used by a queue entry.

    python3 _scripts/shorts/shorts.py queue [--today YYYY-MM-DD] [--date YYYY-MM-DD] [--dry-run] [--out DIR]
        Adds the coming Thursday's Short (7:30am Sydney) to _social/queue.json and logs the puzzle.
        If Thursday is taken it uses Friday, then Wed/Tue/Mon of that week; never double-books a day.
        It renders the video once as a check (the MP4 is not committed; typefully_push.py renders it again).
    python3 _scripts/shorts/shorts.py render SERIES PUZZLE_DATE OUT.mp4 [--stills]
    python3 _scripts/shorts/shorts.py selftest [--series ecg,sign,rarest] [--out DIR]
        Lays out every eligible puzzle and samples frames for text overflow / safe-area problems.
"""
import argparse, datetime, glob, json, os, random, re, shutil, subprocess, sys, tempfile
from zoneinfo import ZoneInfo

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
PAGE = os.path.join(HERE, "page")
QUEUE = os.path.join(ROOT, "_social", "queue.json")
LOG = os.path.join(ROOT, "_social", "shorts-log.json")
SYD = ZoneInfo("Australia/Sydney")
SITE = "https://maladywise.com/"
FPS = 30
MIN_AGE_DAYS = 7
ROTATION = ["ecg", "sign", "rarest"]
ANCHOR = datetime.date(2026, 11, 16)   # Monday of the first automated week (ECG)
GAME = {"ecg": "arrhythmix", "sign": "glimpsis", "rarest": "zebritis"}
NAME = {"ecg": "Arrhythmix", "sign": "Glimpsis", "rarest": "Zebritis"}
LABEL = {"ecg": "Guess the ECG", "sign": "Spot the sign", "rarest": "Rarest answer wins"}
TREAT_RE = re.compile(r"\b(prescrib\w*|antivirals?|antibiotics?|treat(ment|ed with)?|first[- ]line|\d+ ?mg|dose)\b", re.I)
OK_LIC = re.compile(r"^(public domain|pd|cc0( 1\.0)?|cc by(-sa)? [1-4]\.\d( [a-z\-]+)?)$", re.I)


# ---------- puzzles ----------
def _load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def puzzles(series):
    """All medical puzzles of a series, sorted by date."""
    g = GAME[series]
    if series == "ecg":
        out = _load(os.path.join(ROOT, g, "puzzles", "puzzles.json"))
    else:
        out = [p for f in sorted(glob.glob(os.path.join(ROOT, g, "puzzles", "????-??.json"))) for p in _load(f)]
    return sorted(out, key=lambda p: p["date"])


def puzzle(series, date):
    for p in puzzles(series):
        if p["date"] == date:
            return p
    raise SystemExit("No %s puzzle dated %s" % (NAME[series], date))


def licence_ok(lic):
    lic = (lic or "").strip()
    return bool(OK_LIC.match(lic)) and not re.search(r"\b(nc|nd)\b|non-?commercial|no ?deriv", lic, re.I)


def zebritis_rows(p):
    """(prompt, rows, hidden_count): one prompt with a unicorn; up to 8 rows + the unicorn last."""
    best = None
    for q in p.get("prompts", []):
        ans = [a for a in q.get("a", []) if isinstance(a, list) and len(a) >= 2 and a[1] in (1, 3, 6, 10, 20)]
        if not any(a[1] == 20 for a in ans) or len(ans) < 4:
            continue
        key = (len(ans) > 9, len(ans) if len(ans) > 9 else 0, len(q["q"]))
        if best is None or key < best[0]:
            best = (key, q, ans)
    if not best:
        return None
    _, q, ans = best
    uni = [a for a in ans if a[1] == 20][0]
    rest = sorted([a for a in ans if a[1] != 20], key=lambda a: a[1])   # stable: keeps file order within a tier
    if len(ans) > 9:
        keep = []
        for tier in (1, 3, 6, 10):
            keep += [a for a in rest if a[1] == tier][:2]
        rest = keep
    rows = [[a[0], a[1]] for a in rest] + [[uni[0], 20]]
    return q["q"], rows, len(ans) - len(rows)


def eligible(series, p):
    """Can this puzzle be made into a Short at all?"""
    if series == "sign":
        im = p.get("img") or {}
        return licence_ok(im.get("licence")) and bool(im.get("author")) and \
            os.path.isfile(os.path.join(ROOT, "glimpsis", im.get("url", ""))) and bool(p.get("why"))
    if series == "rarest":
        return zebritis_rows(p) is not None
    return bool(p.get("ecg") and p.get("features") and p.get("answer"))


def load_log():
    if os.path.isfile(LOG):
        return _load(LOG)
    return {"used": []}


def used_puzzles():
    """{(series, puzzle_date)} already used: the log plus any queue entry with a short."""
    used = {(u["series"], u["puzzle_date"]) for u in load_log().get("used", [])}
    if os.path.isfile(QUEUE):
        for e in _load(QUEUE).get("posts", []):
            s = e.get("short")
            if s:
                used.add((s["series"], s["puzzle_date"]))
    return used


def series_for(day):
    """Week-by-week rotation, ECG first in the week of ANCHOR."""
    weeks = (day - ANCHOR).days // 7
    return ROTATION[weeks % len(ROTATION)]


def pick(series, post_date, today, used=None):
    """Oldest unused eligible puzzle dated <= post_date - 7 days and before today. None if there is none."""
    used = used_puzzles() if used is None else used
    latest = min(post_date - datetime.timedelta(days=MIN_AGE_DAYS), today - datetime.timedelta(days=1)).isoformat()
    for p in puzzles(series):
        if p["date"] <= latest and (series, p["date"]) not in used and eligible(series, p):
            return p
    return None


# ---------- page data + post text ----------
def _options(answer, wrongs, seed):
    rnd = random.Random(seed)
    wrongs = [w for w in wrongs if w and w != answer]
    opts = rnd.sample(wrongs, min(3, len(wrongs))) + [answer]
    rnd.shuffle(opts)
    return opts, opts.index(answer)


def data_for(series, p):
    """Everything the page needs, with no treatment pearls (diagnostic features only)."""
    seed = "%s-%s" % (series, p["date"])
    if series == "ecg":
        ecg = dict(p["ecg"])
        h = p.get("highlight") or {}
        ecg["marks"], ecg["boxes"] = h.get("marks", []), h.get("boxes", [])
        opts, ok = _options(p["answer"], p.get("options", []), seed)
        return {"vignette": p["vignette"], "ecg": ecg, "seed": p.get("seed") or p["date"], "features": p["features"][:3],
                "options": opts, "correct": ok, "end_line": "New ECG every Monday and Thursday"}
    if series == "sign":
        im = p["img"]
        opts, ok = _options(p["answer"], p.get("wrong", []), seed)
        return {"image": "file://" + os.path.join(ROOT, "glimpsis", im["url"]), "credit": credit(p), "context": p["context"],
                "question": p.get("question") or "What’s the diagnosis?", "hint": (p.get("hints") or [""])[0],
                "why": p["why"], "options": opts, "correct": ok, "end_line": "A new picture to diagnose every day"}
    q, rows, hidden = zebritis_rows(p)
    note = ("+%d more correct answer%s in the game" % (hidden, "" if hidden == 1 else "s")) if hidden else "Rarer correct answers score more"
    return {"prompt": q, "rows": rows, "note": note, "end_line": "Can you find the unicorn?"}


def credit(p):
    im = p["img"]
    src = im.get("source", "")
    author = im["author"].strip()
    first = src.split()[0].lower() if src else ""
    if not src or src.lower() in author.lower():
        who = author
    elif author.lower() == first:          # "CDC" + "CDC Public Health Image Library"
        who = src
    elif first and first in author.lower():  # "CDC/K.L. Herrmann" + "CDC Public Health Image Library"
        who = author
    else:
        who = "%s, %s" % (author, src)
    return "Photo: %s · %s" % (who, im["licence"])


def x_len(text):
    return len(re.sub(r"https?://\S+", "x" * 23, text))


def post_text(series, p):
    """[main post (no link, at most 1 hashtag), reply with the game link]. Never names the answer."""
    url = SITE + GAME[series] + "/"
    if series == "ecg":
        opts = ["10 seconds. One ECG. Four options.\n\n%s\n\nRead the strip before the clock runs out. Fictional case, computer-generated ECG. #ECG" % p["vignette"],
                "10 seconds. One ECG. Four options.\n\n%s\n\nFictional case, computer-generated ECG. #ECG" % p["vignette"],
                "10 seconds. One ECG. Four options. Read the strip before the clock runs out. Fictional case, computer-generated ECG. #ECG"]
        reply = "New ECG every Monday and Thursday → " + url
    elif series == "sign":
        c = credit(p).replace(" · ", " (") + ")"
        opts = ["Spot the sign. %s\n\nFour options, five seconds. Your gut call?\n\n%s #MedEd" % (p["context"], c),
                "Spot the sign. %s\n\nFour options, five seconds.\n\n%s" % (p["context"], c),
                "Spot the sign: four options, five seconds. Your gut call?\n\n%s" % c]
        reply = "A new picture to diagnose every day → " + url
    else:
        q = zebritis_rows(p)[0].rstrip(".?!")
        opts = ["%s. Easy, right? The common answer scores 1 point. The rarest scores 20. Did you know the unicorn before the end of the video? #MedTwitter" % q,
                "%s. The common answer scores 1. The rarest scores 20. Did you know the unicorn? #MedTwitter" % q,
                "%s. The rarest correct answer scores 20." % q,
                "Rarest answer wins: the common answer scores 1, the unicorn scores 20. Did you know it before the end? #MedTwitter"]
        reply = "Can you find the unicorn? → " + url
    main = next(t for t in opts if x_len(t) <= 280)
    return [main, reply]


def note_for(series, p):
    d = datetime.date.fromisoformat(p["date"])
    return "Weekly Short (video): %s #%s, %d %s %d" % (NAME[series], p.get("number", "?"), d.day, d.strftime("%b"), d.year)


# ---------- rendering ----------
class Renderer:
    """Holds one Chromium; render() writes an MP4, stills() PNGs, check() overflow problems."""

    def __init__(self, browser=None):
        self._own = browser is None
        self.pw = None
        if browser is None:
            from playwright.sync_api import sync_playwright
            self.pw = sync_playwright().start()
            browser = self.pw.chromium.launch()
        self.browser = browser

    def close(self):
        if self._own:
            self.browser.close()
            self.pw.stop()

    def page(self, series, data):
        pg = self.browser.new_page(viewport={"width": 1080, "height": 1920})
        pg.goto("file://" + os.path.join(PAGE, series + ".html"))
        pg.evaluate("document.fonts.ready.then(() => true)")
        pg.evaluate("D => setup(D)", data)
        pg.evaluate("() => Promise.all([document.fonts.ready, ...Array.from(document.images).map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))])")
        pg.evaluate("() => { fitAll(); if (window.declutter) declutter(); }")   # again, now fonts and images are certainly in
        missing = pg.evaluate("() => ['700 40px Lora', '500 30px Poppins', '600 30px Poppins'].filter(f => !document.fonts.check(f))")
        if missing:
            raise RuntimeError("fonts not loaded: %s" % missing)
        bad_img = pg.evaluate("() => Array.from(document.images).filter(i => !i.naturalWidth).map(i => i.src)")
        if bad_img:
            raise RuntimeError("images failed to load: %s" % bad_img)
        return pg

    def check(self, series, data, stills_dir=None, tag=""):
        """Sample the page's CHECK_TIMES; return a list of problems."""
        pg = self.page(series, data)
        try:
            bad = []
            for t in pg.evaluate("CHECK_TIMES"):
                pg.evaluate("t => render(t)", t)
                bad += ["t=%.1fs %s" % (t, b) for b in pg.evaluate("checkFit()")]
                if stills_dir:
                    pg.screenshot(path=os.path.join(stills_dir, "%s%s-%05.1f.png" % (tag, series, t)))
            return bad
        finally:
            pg.close()

    def render(self, series, data, out_mp4):
        pg = self.page(series, data)
        try:
            dur = pg.evaluate("DUR")
            os.makedirs(os.path.dirname(os.path.abspath(out_mp4)), exist_ok=True)
            tmp = out_mp4 + ".v.mp4"
            ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-",
                                   "-c:v", "libx264", "-crf", "20", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-profile:v", "high",
                                   "-r", str(FPS), "-movflags", "+faststart", tmp], stdin=subprocess.PIPE)
            try:
                for n in range(int(round(dur * FPS))):
                    pg.evaluate("t => render(t)", n / FPS)
                    ff.stdin.write(pg.screenshot(type="jpeg", quality=92))
            finally:
                ff.stdin.close()
            if ff.wait() != 0:
                raise RuntimeError("ffmpeg failed while encoding")
            # silent stereo AAC track: some platforms reject video-only uploads
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
                            "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "64k", "-shortest",
                            "-movflags", "+faststart", out_mp4], check=True)
            os.remove(tmp)
            return out_mp4
        finally:
            pg.close()


def render_short(series, puzzle_date, out_mp4, browser=None, check=True):
    """Render one Short to out_mp4. Raises if the layout check finds a problem. Returns the path."""
    p = puzzle(series, puzzle_date)
    if not eligible(series, p):
        raise RuntimeError("%s %s cannot be used for a Short (licence, image or data)" % (NAME[series], puzzle_date))
    data = data_for(series, p)
    r = Renderer(browser)
    try:
        if check:
            bad = r.check(series, data)
            if bad:
                raise RuntimeError("layout problems in %s %s: %s" % (series, puzzle_date, "; ".join(bad)))
        return r.render(series, data, out_mp4)
    finally:
        r.close()


def alt_text(series, p):
    if series == "ecg":
        return "Quiz video: guess the ECG in 10 seconds from four options, then the answer and key features. Fictional case, computer-generated ECG."
    if series == "sign":
        return "Quiz video: a clinical photo with a short case and four options, a five-second countdown, then the answer. %s." % credit(p)
    return "Quiz video: Zebritis, where rarer correct answers score more. The answers are revealed from most common to the rarest."


# ---------- queue ----------
def typefully_dates():
    """Sydney dates that already have a scheduled X post in Typefully (incl. drafts made by hand)."""
    key = os.environ.get("TYPEFULLY_API_KEY")
    if not key:
        return set()
    import urllib.request
    out, offset = set(), 0
    try:
        while True:
            url = "https://api.typefully.com/v2/social-sets/354708/drafts?status=scheduled&limit=50&offset=%d" % offset
            req = urllib.request.Request(url, headers={"Authorization": "Bearer " + key})
            data = json.load(urllib.request.urlopen(req, timeout=30))
            for d in data.get("results", []):
                sd = d.get("scheduled_date")
                if sd:
                    t = datetime.datetime.fromisoformat(sd.replace("Z", "+00:00")).astimezone(SYD)
                    if t.hour < 11:   # only the 7:30am slot; 12:30pm is for world health day posts
                        out.add(t.date().isoformat())
            if not data.get("next"):
                break
            offset += 50
    except Exception as e:  # never block queuing on this; the push script still refuses double-booking
        print("Warning: could not read Typefully schedule:", e)
    return out


def plan_day(today, posts, target=None, extra_taken=()):
    """(post_date, reason) for this week's Short: the coming Thursday, else Fri, Wed, Tue, Mon of that week.
    A day counts as taken if the queue has an entry OR Typefully already has a scheduled post that day."""
    thu = target or today + datetime.timedelta(days=(3 - today.weekday()) % 7 or 7)
    mon = thu - datetime.timedelta(days=thu.weekday())
    taken = {e["date"] for e in posts if (e.get("slot") or "am") == "am"} | set(extra_taken)
    week = {(mon + datetime.timedelta(days=i)).isoformat() for i in range(7)}
    if any(e.get("short") and e["date"] in week for e in posts):
        return None, "this week (from %s) already has a Short" % mon
    for off in (3, 4, 2, 1, 0):
        d = mon + datetime.timedelta(days=off)
        if d > today and d.isoformat() not in taken:
            return d, "ok"
    return None, "no free weekday in the week of %s" % mon


def cmd_queue(a):
    today = datetime.date.fromisoformat(a.today) if a.today else datetime.datetime.now(SYD).date()
    q = _load(QUEUE)
    posts = q.setdefault("posts", [])
    day, why = plan_day(today, posts, datetime.date.fromisoformat(a.date) if a.date else None, typefully_dates())
    if not day:
        print("No Short queued: %s." % why)
        return 0
    used = used_puzzles()
    first = series_for(day)
    order = ROTATION[ROTATION.index(first):] + ROTATION[:ROTATION.index(first)]
    for series in order:
        p = pick(series, day, today, used)
        if p:
            break
        print("No unused %s puzzle old enough; trying the next series." % NAME[series])
    else:
        raise SystemExit("No puzzle available for a Short on %s." % day)
    thread = post_text(series, p)
    entry = {"date": day.isoformat(), "note": note_for(series, p), "thread": thread,
             "short": {"series": series, "puzzle_date": p["date"]}}
    out_dir = a.out or tempfile.mkdtemp(prefix="mw-short-")
    mp4 = os.path.join(out_dir, "short-%s-%s.mp4" % (day.isoformat(), GAME[series]))
    if not a.no_render:
        render_short(series, p["date"], mp4)   # proves it renders and fits before anything is queued
        print("Rendered", mp4)
    print("%s %s: %s #%s (%s)" % ("DRY" if a.dry_run else "QUEUE", day, NAME[series], p.get("number"), p["date"]))
    for i, t in enumerate(thread, 1):
        print("   [%d] %s (%d chars)" % (i, t.replace("\n", "\n       "), x_len(t)))
    if a.dry_run:
        return 0
    posts.append(entry)
    posts.sort(key=lambda e: e["date"])
    _dump(QUEUE, q)
    log = load_log()
    log.setdefault("used", []).append({"post_date": day.isoformat(), "series": series, "game": GAME[series],
                                       "puzzle_date": p["date"], "number": p.get("number"),
                                       "queued_at": datetime.datetime.now(SYD).isoformat(timespec="minutes")})
    _dump(LOG, log)
    if a.github_output and os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a") as f:
            f.write("video=%s\n" % mp4)
    return 0


def _dump(path, obj):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
        f.write("\n")
    os.replace(tmp, path)


def cmd_selftest(a):
    """Lay out every eligible puzzle of each series and sample frames; also check post text."""
    series_list = a.series.split(",")
    out = a.out
    if out:
        os.makedirs(out, exist_ok=True)
    r = Renderer()
    n = fails = 0
    try:
        for s in series_list:
            for p in puzzles(s):
                if not eligible(s, p):
                    continue
                n += 1
                bad = r.check(s, data_for(s, p), out, tag=p["date"] + "-")
                th = post_text(s, p)
                if x_len(th[0]) > 280 or "http" in th[0] or len(re.findall(r"(?<!\w)#\w+", th[0])) > 1:
                    bad.append("post 1 breaks the X rules: %r" % th[0][:80])
                d = data_for(s, p)
                shown = " ".join(d.get("features", []) + [d.get("why", ""), d.get("note", ""), d.get("hint", "")])
                if TREAT_RE.search(shown):
                    bad.append("possible treatment advice on screen: %r" % TREAT_RE.search(shown).group(0))
                for b in bad:
                    print("FAIL %s %s: %s" % (s, p["date"], b))
                fails += bool(bad)
    finally:
        r.close()
    print("Self-test: %d puzzle layouts checked, %d with problems." % (n, fails))
    return 1 if fails else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    qa = sub.add_parser("queue")
    qa.add_argument("--today"); qa.add_argument("--date", help="target Thursday (or any day in the target week)")
    qa.add_argument("--dry-run", action="store_true"); qa.add_argument("--out"); qa.add_argument("--no-render", action="store_true")
    qa.add_argument("--github-output", action="store_true")
    ra = sub.add_parser("render")
    ra.add_argument("series", choices=ROTATION); ra.add_argument("puzzle_date"); ra.add_argument("out")
    sa = sub.add_parser("selftest")
    sa.add_argument("--series", default=",".join(ROTATION)); sa.add_argument("--out")
    a = ap.parse_args()
    if not shutil.which("ffmpeg") and a.cmd in ("render", "queue") and not getattr(a, "no_render", False):
        raise SystemExit("ffmpeg is not installed.")
    if a.cmd == "queue":
        return cmd_queue(a)
    if a.cmd == "render":
        print(render_short(a.series, a.puzzle_date, a.out))
        return 0
    return cmd_selftest(a)


if __name__ == "__main__":
    sys.exit(main())
