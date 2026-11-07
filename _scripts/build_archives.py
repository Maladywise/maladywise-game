#!/usr/bin/env python3
"""Build the Google-readable puzzle archive pages for Malady Wise.

HOW TO RUN
    python3 _scripts/build_archives.py          (from the repo root, or any folder)

What it does
    * Works out today's date in Sydney (Australia/Sydney).
    * Reads each game's Medical-mode puzzle files and writes
      /<game>/archive/index.html listing every PAST puzzle (date strictly
      before today, newest first, grouped by month). Today's and future
      puzzles are never included, so there are no spoilers.
    * Adds each archive URL to sitemap.xml if missing and sets its
      <lastmod> to today.
    * Safe to re-run any time (the weekly scheduled task does this): the
      same inputs on the same day give the same files.

No external dependencies (Python 3.9+ standard library only).
To add a game: write a loader and a renderer, then add it to GAMES below.
"""
import glob
import html
import json
import os
import re
import sys
from datetime import date, datetime
from zoneinfo import ZoneInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://maladywise.com"

# Asset versions are copied from the existing content pages (days/index.html) so
# the archive pages share the same cached files. Re-read on each run.
DEFAULT_VERSIONS = {"shell.css": "168", "games.js": "98", "site.js": "36", "shell.js": "171"}

MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def esc(s):
    return html.escape("" if s is None else str(s), quote=True)


def sydney_today():
    return datetime.now(ZoneInfo("Australia/Sydney")).date().isoformat()


def nice_date(d):
    y, m, dd = map(int, d.split("-"))
    w = date(y, m, dd).weekday()
    return "%s %d %s %d" % (DAYS[w], dd, MONTHS[m - 1], y)


def month_label(d):
    y, m = map(int, d.split("-")[:2])
    return "%s %d" % (MONTHS[m - 1], y)


def asset_versions():
    v = dict(DEFAULT_VERSIONS)
    try:
        src = open(os.path.join(ROOT, "days", "index.html"), encoding="utf-8").read()
        for name in v:
            m = re.search(r"/assets/" + re.escape(name) + r"\?v=(\d+)", src)
            if m:
                v[name] = m.group(1)
    except OSError:
        pass
    return v


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def load_months(folder):
    """Entries from <folder>/YYYY-MM.json files (Medical mode only)."""
    out = []
    for f in sorted(glob.glob(os.path.join(ROOT, folder, "[0-9][0-9][0-9][0-9]-[0-9][0-9].json"))):
        data = load_json(f)
        if isinstance(data, list):
            out.extend(x for x in data if isinstance(x, dict) and x.get("date"))
    return out


def load_list(path):
    data = load_json(os.path.join(ROOT, path))
    return [x for x in data if isinstance(x, dict) and x.get("date")] if isinstance(data, list) else []


# ---------- small render helpers ----------

def p(text, cls=None):
    if not text:
        return ""
    c = ' class="%s"' % cls if cls else ""
    return "<p%s>%s</p>" % (c, esc(text))


def labelled(label, text, cls=None):
    if not text:
        return ""
    c = ' class="%s"' % cls if cls else ""
    return "<p%s><b>%s</b> %s</p>" % (c, esc(label), esc(text))


def link(url, text):
    return '<a href="%s" target="_blank" rel="noopener">%s</a>' % (esc(url), esc(text))


# ---------- per-game renderers (return inner HTML of the puzzle card) ----------

def r_wordemic(x, ctx):
    return ('<p class="ar-ans"><b>Answer:</b> %s</p>' % esc(str(x.get("word", "")).upper())
            + labelled("Definition:", x.get("definition")))


def pct(v):
    if v is None:
        return ""
    return ("%g" % v) + "%"


def r_sensitosis(x, ctx):
    tests = ctx["tests"]
    items = []
    for rnd in x.get("rounds", []):
        t = tests.get(rnd.get("test"))
        if not t:
            continue
        s, sp = t.get("sens"), t.get("spec")
        stats = []
        if s:
            stats.append("Sensitivity %s (range %s–%s)" % (pct(s.get("v")), pct(s.get("lo")), pct(s.get("hi"))))
        if sp:
            stats.append("specificity %s (range %s–%s)" % (pct(sp.get("v")), pct(sp.get("lo")), pct(sp.get("hi"))))
        else:
            stats.append("no reliable specificity figure")
        h = ['<li><p class="ar-ans"><b>%s</b> for %s</p>' % (esc(t.get("test")), esc(t.get("condition")))]
        h.append(p(t.get("scenario"), "ar-q"))
        h.append("<p><b>%s.</b></p>" % esc("; ".join(stats)))
        h.append(p(t.get("says")))
        tw = rnd.get("twist")
        if tw and tw.get("where"):
            h.append("<p><b>Twist:</b> %s</p>" % esc(tw["where"]))
        if t.get("note"):
            h.append(p(t["note"], "ar-m"))
        srcs = [link(u, n) for n, u in (t.get("src") or []) if u]
        if srcs:
            h.append('<p class="ar-m">Source: %s</p>' % "; ".join(srcs))
        h.append("</li>")
        items.append("".join(h))
    return '<ol class="ar-sub">%s</ol>' % "".join(items)


def r_zebritis(x, ctx):
    items = []
    for q in x.get("prompts", []):
        ans = [a for a in q.get("a", []) if isinstance(a, list) and a]
        ranked = ans and all(len(a) > 4 and isinstance(a[4], (int, float)) for a in ans)
        h = ['<li><p class="ar-q"><b>%s</b></p>' % esc(q.get("q"))]
        if ranked:
            rows = sorted(ans, key=lambda a: (a[4], str(a[0])))
            lis = []
            for a in rows:
                val = (" (%s)" % esc(a[5])) if len(a) > 5 and a[5] else ""
                lis.append("<li>%d. %s%s</li>" % (int(a[4]), esc(a[0]), val))
            h.append('<p class="ar-m">Ranked answers:</p><ul class="ar-rank">%s</ul>' % "".join(lis))
        else:
            h.append("<p><b>Answers:</b> %s</p>" % esc(", ".join(str(a[0]) for a in sorted(ans, key=lambda a: a[1] if len(a) > 1 and isinstance(a[1], (int, float)) else 99))))
        if q.get("src"):
            h.append('<p class="ar-m">Source: %s</p>' % esc(q["src"]))
        h.append("</li>")
        items.append("".join(h))
    return ('<p class="ar-m">Rarer correct answers score more. Common answers listed first.</p>'
            '<ol class="ar-sub">%s</ol>' % "".join(items))


def r_triviosis(x, ctx):
    items = []
    for q in x.get("questions", []):
        items.append('<li><p class="ar-q">%s</p><p><b>Answer:</b> %s</p>%s</li>'
                     % (esc(q.get("q")), esc(q.get("a")), p(q.get("e"), "ar-m")))
    return labelled("Theme:", x.get("theme")) + '<ol class="ar-sub">%s</ol>' % "".join(items)


def r_dx(x, ctx):
    clues = [c.get("t") for c in x.get("clues", []) if isinstance(c, dict) and c.get("t")]
    h = [p(x.get("title"), "ar-title")]
    if clues:
        h.append('<p class="ar-m">The clues:</p><ul class="ar-clues">%s</ul>'
                 % "".join("<li>%s</li>" % esc(c) for c in clues))
    h.append('<p class="ar-ans"><b>Diagnosis:</b> %s</p>' % esc(x.get("answer")))
    h.append(labelled("Pearl:", x.get("pearl")))
    f = x.get("fact")
    if isinstance(f, str) and f.startswith("/"):
        h.append('<p class="ar-m"><a href="%s">Read the fact sheet</a></p>' % esc(f))
    return "".join(h)


def image_block(x, folder):
    i = x.get("img") or {}
    url = i.get("url")
    if not url or re.match(r"^[a-z]+:", url) or url.startswith("/"):
        src = url
    else:
        src = "../" + url  # archive lives one folder below the game
    if not src:
        return ""
    lic = link(i["licence_url"], i.get("licence", "")) if i.get("licence_url") else esc(i.get("licence", ""))
    via = i.get("source") or "Wikimedia Commons"
    by = (" by " + esc(i["author"])) if i.get("author") else ""
    page = link(i["page"], "Source page") if i.get("page") else "Image"
    alt = i.get("alt") or x.get("title") or "Puzzle image"
    return ('<figure class="ar-fig"><img src="%s" alt="%s" loading="lazy" decoding="async" width="160">'
            '<figcaption>%s%s · %s · via %s</figcaption></figure>' % (esc(src), esc(alt), page, by, lic, esc(via)))


def r_image_game(folder):
    def r(x, ctx):
        h = ['<div class="ar-img">', image_block(x, folder), "<div>"]
        h.append(p(x.get("title"), "ar-title"))
        h.append(p(x.get("context"), "ar-q"))
        h.append('<p class="ar-ans"><b>Answer:</b> %s</p>' % esc(x.get("answer")))
        h.append("</div></div>")
        h.append(labelled("Why:", x.get("why")))
        h.append(labelled("Pearl:", x.get("pearl")))
        return "".join(h)
    return r


def r_panelysis(x, ctx):
    h = [labelled("Patient:", x.get("patient")), p(x.get("story"), "ar-q")]
    keys = x.get("key") or []
    found = []
    for k in keys:
        for panel in x.get("panels", []):
            for row in panel.get("rows", []):
                if row and row[0] == k:
                    flag = (" (%s)" % row[4]) if len(row) > 4 and row[4] else ""
                    rng = (", ref %s" % row[3]) if len(row) > 3 and row[3] else ""
                    found.append("%s %s %s%s%s" % (row[0], row[1], row[2] if len(row) > 2 else "", flag, rng))
                    break
            else:
                continue
            break
    if found:
        h.append('<p class="ar-m"><b>Key results:</b> %s</p>' % esc("; ".join(re.sub(r"\s+", " ", f) for f in found)))
    h.append('<p class="ar-ans"><b>Diagnosis:</b> %s</p>' % esc(x.get("answer")))
    h.append(labelled("Why:", x.get("why")))
    h.append(labelled("Teaching point:", x.get("pearl")))
    return "".join(h)


def r_arrhythmix(x, ctx):
    h = [p(x.get("vignette"), "ar-q"),
         '<p class="ar-ans"><b>Rhythm:</b> %s</p>' % esc(x.get("answer")),
         labelled("Explanation:", x.get("explanation"))]
    feats = x.get("features") or []
    if feats:
        h.append('<ul class="ar-clues">%s</ul>' % "".join("<li>%s</li>" % esc(f) for f in feats))
    h.append(labelled("Pearl:", x.get("pearl")))
    return "".join(h)


def r_comorbix(x, ctx):
    items = []
    for gr in sorted(x.get("groups", []), key=lambda g: g.get("level") or 0):
        items.append('<li><p><b>%s:</b> %s</p></li>' % (esc(gr.get("label")), esc(", ".join(gr.get("words") or []))))
    return '<p class="ar-m">The four groups, easiest first:</p><ul class="ar-clues">%s</ul>' % "".join(items)


def r_linkase(x, ctx):
    ch = [str(w) for w in (x.get("chain") or [])]
    h = ['<p class="ar-ans"><b>Chain:</b> %s</p>' % esc(" → ".join(ch))]
    links = ["%s %s" % (ch[i], ch[i + 1]) for i in range(len(ch) - 1)]
    if links:
        h.append('<p class="ar-m">The links:</p><ul class="ar-clues">%s</ul>' % "".join("<li>%s</li>" % esc(l.lower()) for l in links))
    alt = x.get("alt") or {}
    if alt:
        h.append('<p class="ar-m">Also accepted: %s</p>' % esc("; ".join("%s for %s" % (", ".join(v), k) for k, v in alt.items())))
    return "".join(h)


REGIONS = {"skeleton": "Skeleton", "hand": "Hand bones", "palm": "Hand, palm side", "handback": "Hand, back",
           "heart": "Heart", "brain": "Brain", "eye": "Eye", "ear": "Ear", "gut": "Abdomen", "lungs": "Lungs",
           "knee": "Knee", "spine": "Spine"}


def r_anatomegaly(x, ctx):
    items = []
    for rnd in x.get("rounds", []):
        region = REGIONS.get(rnd.get("art"), "")
        head = esc(rnd.get("kind")) + ((" · " + esc(region)) if region else "")
        items.append('<li><p class="ar-m">%s</p><p class="ar-q">%s</p><p><b>Answer:</b> %s</p>%s</li>'
                     % (head, esc(rnd.get("q")), esc(rnd.get("answer")), p(rnd.get("why"), "ar-m")))
    return '<ol class="ar-sub">%s</ol>' % "".join(items)


def load_grandrounds():
    out = []
    for x in load_json(os.path.join(ROOT, "grandrounds", "quizzes.json")):
        if isinstance(x, dict) and (x.get("week") or x.get("date")):
            y = dict(x)
            y["date"] = y.get("date") or y["week"]  # keyed by week (the Sunday it is released)
            out.append(y)
    return out


def r_grandrounds(x, ctx):
    items = []
    for q in x.get("questions", []):
        items.append('<li><p class="ar-m">%s</p><p class="ar-q">%s</p><p><b>Answer:</b> %s</p>%s</li>'
                     % (esc(q.get("c")), esc(q.get("q")), esc(q.get("a")), p(q.get("e"), "ar-m")))
    return '<ol class="ar-sub">%s</ol>' % "".join(items)


def cryptic_answer(rows, cl, down):
    try:
        r, c, n = int(cl["r"]), int(cl["c"]), int(cl["len"])
        s = "".join(rows[r + i][c] for i in range(n)) if down else rows[r][c:c + n]
        return "" if "#" in s or len(s) != n else s
    except (KeyError, IndexError, ValueError, TypeError):
        return ""


def r_cryptogenic(x, ctx):
    rows = x.get("rows") or []
    h = []
    for key, title in (("across", "Across"), ("down", "Down")):
        items = []
        for cl in x.get(key, []):
            ans = cryptic_answer(rows, cl, key == "down")
            items.append('<li><p class="ar-q">%s. %s %s</p>%s%s</li>'
                         % (esc(cl.get("n")), esc(cl.get("clue")), esc(cl.get("enum")),
                            ('<p><b>Answer:</b> %s</p>' % esc(ans)) if ans else "", p(cl.get("expl"), "ar-m")))
        if items:
            h.append('<p class="ar-title">%s</p><ul class="ar-sub" style="list-style:none;padding-left:4px">%s</ul>' % (title, "".join(items)))
    return "".join(h)


# ---------- game list (ids match MW_GAMES in assets/games.js) ----------

GAMES = [
    {"id": "dx", "folder": "dx", "name": "Dxtective",
     "load": lambda: load_months("cases"), "render": r_dx,
     "desc": "Every past Dxtective case: the clues, the diagnosis and a clinical pearl for each daily medical mystery.",
     "lede": "Every past daily case, with its clues, diagnosis and pearl. Newest first."},
    {"id": "wordemic", "folder": "wordemic", "name": "Wordemic",
     "load": lambda: load_months("wordemic/puzzles"), "render": r_wordemic,
     "desc": "Every past Wordemic puzzle: the daily medical word and what it means.",
     "lede": "Every past daily medical word, with its definition. Newest first."},
    {"id": "panelysis", "folder": "panelysis", "name": "Panelysis",
     "load": lambda: load_months("panelysis/puzzles"), "render": r_panelysis,
     "desc": "Every past Panelysis puzzle: the patient, the key blood results, the diagnosis and the teaching point.",
     "lede": "Every past blood-results puzzle, with the patient story, diagnosis and teaching point. Newest first."},
    {"id": "glimpsis", "folder": "glimpsis", "name": "Glimpsis",
     "load": lambda: load_months("glimpsis/puzzles"), "render": r_image_game("glimpsis"),
     "desc": "Every past Glimpsis puzzle: real clinical images, the sign or diagnosis, why it fits and a clinical pearl.",
     "lede": "Every past spot-the-sign image, with the answer, why it fits and a pearl. Newest first."},
    {"id": "opacitis", "folder": "opacitis", "name": "Opacitis",
     "load": lambda: load_months("opacitis/puzzles"), "render": r_image_game("opacitis"),
     "desc": "Every past Opacitis puzzle: real X-rays and scans, the diagnosis, the findings and a clinical pearl.",
     "lede": "Every past scan, with the diagnosis, the findings and a pearl. Newest first."},
    {"id": "sensitosis", "folder": "sensitosis", "name": "Sensitosis",
     "load": lambda: load_months("sensitosis/puzzles"), "render": r_sensitosis,
     "ctx": lambda: {"tests": load_json(os.path.join(ROOT, "sensitosis", "tests.json")).get("tests", {})},
     "desc": "Every past Sensitosis puzzle: real medical tests, their sensitivity and specificity, and the studies behind them.",
     "lede": "Every past round of real medical tests, with their sensitivity, specificity and sources. Newest first."},
    {"id": "triviosis", "folder": "triviosis", "name": "Triviosis",
     "load": lambda: load_list("triviosis/quizzes.json"), "render": r_triviosis,
     "desc": "Every past Triviosis quiz: ten medical trivia questions a day, with answers and explanations.",
     "lede": "Every past daily medical quiz, with each answer explained. Newest first."},
    {"id": "zebritis", "folder": "zebritis", "name": "Zebritis",
     "load": lambda: load_months("zebritis/puzzles"), "render": r_zebritis,
     "desc": "Every past Zebritis puzzle: each medical prompt and its full list of accepted answers, ranked where the data allows.",
     "lede": "Every past prompt and its full list of accepted answers. Newest first."},
    {"id": "arrhythmix", "folder": "arrhythmix", "name": "Arrhythmix",
     "load": lambda: load_list("arrhythmix/puzzles/puzzles.json"), "render": r_arrhythmix,
     "desc": "Every past Arrhythmix puzzle: the clinical vignette, the heart rhythm and how to read it.",
     "lede": "Every past rhythm strip puzzle, with the vignette, the rhythm and how to read it. Newest first."},
    {"id": "comorbix", "folder": "comorbix", "name": "Comorbix",
     "load": lambda: load_months("comorbix/puzzles"), "render": r_comorbix,
     "desc": "Every past Comorbix puzzle: the four hidden medical word groups and the four words in each.",
     "lede": "Every past word-groups puzzle, with each group and its four words. Newest first."},
    {"id": "linkase", "folder": "linkase", "name": "Linkase",
     "load": lambda: load_months("linkase/puzzles"), "render": r_linkase,
     "desc": "Every past Linkase puzzle: the full medical word chain and each link in it.",
     "lede": "Every past word chain, with each link spelled out. Newest first."},
    {"id": "labelosis", "folder": "anatomegaly", "name": "Anatomegaly",
     "load": lambda: load_months("anatomegaly/puzzles"), "render": r_anatomegaly,
     "desc": "Every past Anatomegaly puzzle: each day's five anatomy rounds, the body region, the answer and why.",
     "lede": "Every past anatomy set, with each round's body region, answer and explanation. Newest first."},
    {"id": "cryptogenic", "folder": "cryptoplexy", "name": "Cryptoplexy",
     "load": lambda: load_list("cryptoplexy/puzzles.json"), "render": r_cryptogenic,
     "desc": "Every past Cryptoplexy crossword: each medical cryptic clue with its answer and how the wordplay works.",
     "lede": "Every past Saturday cryptic, with each clue, its answer and the parsing. Newest first."},
    {"id": "grandrounds", "folder": "grandrounds", "name": "Grand Rounds",
     "load": load_grandrounds, "render": r_grandrounds,
     "desc": "Every past Grand Rounds quiz: twenty hard medical trivia questions a week, with answers and explanations.",
     "lede": "Every past Sunday quiz, with each question's category, answer and explanation. Newest first."},
]

STYLE = """<style>
.ar-month{margin-top:28px!important;font-size:20px!important;color:var(--brand)!important;border-bottom:1px solid var(--line);padding-bottom:4px}
.ar-list{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:12px}
.ar-card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px 14px;min-width:0;overflow-wrap:anywhere}
.doc .ar-card h3{font:700 16px var(--title);margin:0 0 6px;color:var(--ink);display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center}
.ar-d{display:inline-block;padding:2px 9px;border-radius:999px;border:1px solid var(--line);color:var(--brand);font:600 11.5px var(--body);letter-spacing:.04em}
.ar-d.Einstein{background:#4A3480;color:#FFE9A8;border-color:#E8C66A}
.doc .ar-card p{margin:4px 0;font-size:14.5px;line-height:1.55}
.doc .ar-card .ar-m,.ar-card figcaption{color:var(--muted);font-size:13px!important}
.doc .ar-card .ar-q{font-style:italic}
.doc .ar-card .ar-title{font-weight:600}
.ar-sub{margin:8px 0 4px;padding-left:20px;display:grid;gap:8px}
.ar-sub>li{font-size:14.5px}
.ar-clues,.ar-rank{margin:4px 0;padding-left:18px}
.ar-clues li,.ar-rank li{font-size:14px!important;line-height:1.45}
.ar-rank{list-style:none;padding-left:4px}
.ar-img{display:flex;gap:12px;align-items:flex-start}
.ar-fig{margin:0;flex:none;width:160px}
.ar-fig img{width:160px;height:auto;max-height:200px;object-fit:cover;border-radius:10px;display:block;background:var(--line)}
.ar-fig figcaption{margin-top:4px;line-height:1.35}
.ar-play{display:inline-block;margin-top:6px;font-weight:600;font-size:14px}
.ar-top{margin:10px 0 4px}
.doc .ar-top a.btn{text-decoration:none;display:inline-block;background:var(--brand);color:#fff;padding:10px 18px;border-radius:999px;font-weight:600;font-size:14px}
:root[data-theme="dark"] .doc .ar-top a.btn{color:#16121F}
@media (max-width:520px){.ar-img{flex-direction:column}.ar-fig,.ar-fig img{width:100%;max-width:320px}}
</style>"""


def render_page(g, past, today, versions):
    name, folder = g["name"], g["folder"]
    title = "%s archive: every past puzzle | Malady Wise" % name
    canon = "%s/%s/archive/" % (SITE, folder)
    og = SITE + "/assets/share.png?v=4"
    for k in (g["id"], folder):
        if os.path.exists(os.path.join(ROOT, "assets", "og", k + ".png")):
            og = "%s/assets/og/%s.png" % (SITE, k)
            break
    body = []
    cur = None
    for x in past:
        m = month_label(x["date"])
        if m != cur:
            if cur is not None:
                body.append("</ol>")
            body.append('<h2 class="ar-month">%s</h2>\n<ol class="ar-list">' % esc(m))
            cur = m
        diff = x.get("difficulty") or ""
        num = x.get("number")
        head = "%s%s" % (("#%s · " % esc(num)) if num is not None else "", esc(nice_date(x["date"])))
        badge = ' <span class="ar-d %s">%s</span>' % (esc(diff), esc(diff)) if diff else ""
        body.append('<li class="ar-card" id="d%s"><h3>%s%s</h3>%s<a class="ar-play" href="/%s/?date=%s">Play this puzzle</a></li>'
                    % (esc(x["date"]), head, badge, g["render"](x, g.get("_ctx", {})), folder, esc(x["date"])))
    if cur is not None:
        body.append("</ol>")
    if not past:
        body.append("<p>No past puzzles yet. Check back tomorrow.</p>")
    count = len(past)
    lede = g["lede"]
    return """<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<link rel="canonical" href="{canon}">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<meta name="theme-color" content="#4A3480">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Malady Wise">
<meta property="og:type" content="website">
<meta property="og:url" content="{canon}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{og}">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/assets/shell.css?v={v_css}">
<script src="/assets/games.js?v={v_games}"></script>
<script src="/assets/site.js?v={v_site}"></script>
<script src="/assets/shell.js?v={v_shell}"></script>
{style}
</head>
<body>
<main class="wrap doc">
<h1>{name} archive</h1>
<p class="lede">{lede}</p>
<p class="ar-top"><a class="btn" href="/{folder}/">Play today&#8217;s puzzle</a></p>
<p class="note">{count} past puzzle{plural}, up to {last}. Today&#8217;s and future puzzles are never shown here.</p>
{body}
<div id="nl-slot"></div>
<footer class="site">General education, not personal medical advice.<br><a href="/">Malady Wise</a> · <a href="/about/">About</a> · <a href="/disclaimer/">Disclaimer</a> · <a href="/privacy/">Privacy</a> · <a href="/contact/">Contact</a></footer>
</main>
<script>MW.page();</script>
</body>
</html>
""".format(canon=esc(canon), title=esc(title), desc=esc(g["desc"]), og=esc(og),
           v_css=versions["shell.css"], v_games=versions["games.js"], v_site=versions["site.js"],
           v_shell=versions["shell.js"], style=STYLE, name=esc(name), lede=esc(lede), folder=folder,
           count=count, plural="" if count == 1 else "s",
           last=esc(nice_date(past[0]["date"])) if past else "today",
           body="\n".join(body))


def update_sitemap(urls, today):
    path = os.path.join(ROOT, "sitemap.xml")
    xml = open(path, encoding="utf-8").read()
    orig = xml
    for u in urls:
        pat = re.compile(r"(<url><loc>" + re.escape(u) + r"</loc><lastmod>)([^<]*)(</lastmod>)")
        if pat.search(xml):
            xml = pat.sub(lambda m: m.group(1) + today + m.group(3), xml)
        elif ("<loc>%s</loc>" % u) in xml:
            continue  # present in another format; leave alone
        else:
            line = "<url><loc>%s</loc><lastmod>%s</lastmod><changefreq>weekly</changefreq></url>\n" % (u, today)
            xml = xml.replace("</urlset>", line + "</urlset>", 1)
    if xml != orig:
        with open(path, "w", encoding="utf-8") as f:
            f.write(xml)


def main():
    today = sydney_today()
    versions = asset_versions()
    urls = []
    report = []
    for g in GAMES:
        try:
            entries = g["load"]()
            if g.get("ctx"):
                g["_ctx"] = g["ctx"]()
        except (OSError, ValueError) as e:
            print("skip %s: %s" % (g["id"], e), file=sys.stderr)
            continue
        seen, past = set(), []
        for x in entries:
            d = str(x.get("date"))
            if re.match(r"^\d{4}-\d{2}-\d{2}$", d) and d < today and d not in seen:
                seen.add(d)
                past.append(x)
        past.sort(key=lambda x: x["date"], reverse=True)
        if not past:
            report.append("%s: no past puzzles, skipped" % g["id"])
            continue
        out_dir = os.path.join(ROOT, g["folder"], "archive")
        os.makedirs(out_dir, exist_ok=True)
        page = render_page(g, past, today, versions)
        out = os.path.join(out_dir, "index.html")
        old = open(out, encoding="utf-8").read() if os.path.exists(out) else None
        if old != page:
            with open(out, "w", encoding="utf-8") as f:
                f.write(page)
        urls.append("%s/%s/archive/" % (SITE, g["folder"]))
        report.append("%s: %d past puzzles -> /%s/archive/" % (g["id"], len(past), g["folder"]))
    update_sitemap(urls, today)
    print("Sydney today: " + today)
    print("\n".join(report))


if __name__ == "__main__":
    main()
