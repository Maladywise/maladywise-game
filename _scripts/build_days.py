#!/usr/bin/env python3
"""Build /days/index.html (World Health Days calendar) from data/health-days.json.

Writes the full-year list for the current Sydney year into the static HTML so Google can index
every day name, plus ItemList + FAQPage JSON-LD. days/days.js then adds the calendar, search,
filters and region/Normie rules in the browser.

Re-run after any change to data/health-days.json (and once each January):
    python3 _scripts/build_days.py

Also writes data/days-soon.json (yesterday to 35 days ahead) for the home page day box. The daily
GitHub Action .github/workflows/days-soon.yml refreshes it with:
    python3 _scripts/build_days.py --soon-only
"""
import datetime
import html
import json
import os
import re
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import static_nav  # plain footer links
from headkit import fix_html  # shared <head> clean-up: self-hosted fonts, deferred scripts, honest JSON-LD

try:
    from zoneinfo import ZoneInfo
    TODAY = datetime.datetime.now(ZoneInfo("Australia/Sydney")).date()
except Exception:  # pragma: no cover
    TODAY = datetime.date.today()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data", "health-days.json")
WORLD = os.path.join(ROOT, "data", "world-days.json")  # famous non-health days: calendar-only, never themed
OUT = os.path.join(ROOT, "days", "index.html")
SOON = os.path.join(ROOT, "data", "days-soon.json")  # home page day box (see write_soon)
SITEMAP = os.path.join(ROOT, "sitemap.xml")
BASE = "https://maladywise.com/days/"
PUZZLES_FROM = "2026-10-17"  # first day of Malady Wise puzzles; keep in step with days.js
JS_V = "4"
CSS_V = 3

MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"]
DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
TYPE_LABEL = {"who": "WHO", "zebra": "Rare disease", "specialty": "Specialty", "country": "Country",
              "fun": "Fun", "history": "History", "culture": "Culture", "aware": "Awareness"}


def esc(s):
    return html.escape(str(s or ""), quote=True)


def region_of(x):
    """Same as regionOf in days.js / assets/shell.js."""
    tags = x.get("tags") or []
    if "country" in tags and "au" not in tags and not re.search(r"\((Australia|NSW|VIC|Victoria|QLD|Queensland|SA|WA|TAS|Tasmania|NT|ACT)\)\s*$", x.get("name") or "", re.I):
        return ""  # national days are for everyone
    for r in ("au", "uk", "us", "nz", "ca", "ie"):
        if r in tags:
            return r
    m = re.search(r"\(([^()]+)\)\s*$", x.get("name") or "")
    if not m:
        return ""
    k = m.group(1).strip()
    if re.match(r"^(Australia|NSW|VIC|Victoria|QLD|Queensland|SA|WA|TAS|Tasmania|NT|ACT)$", k, re.I):
        return "au"
    if re.match(r"^(UK|United Kingdom|England|Scotland|Wales|Northern Ireland)$", k, re.I):
        return "uk"
    if re.match(r"^(US|USA|United States)$", k, re.I):
        return "us"
    if re.match(r"^(NZ|New Zealand|Aotearoa)$", k, re.I):
        return "nz"
    if re.match(r"^Canada$", k, re.I):
        return "ca"
    if re.match(r"^Ireland$", k, re.I):
        return "ie"
    return ""


def type_of(x):
    t = x.get("tags") or []
    for k in ("who", "zebra", "specialty", "country", "fun", "history", "culture"):
        if k in t:
            return k
    return "aware"


def d(s):
    return datetime.date.fromisoformat(s)


def nice(s, dow=True):
    x = d(s)
    return (DOW[x.weekday()] + " " if dow else "") + "%d %s" % (x.day, MONTHS[x.month - 1][:3])


def span_text(x, yr):
    dt = x["dates"][yr]
    s0, s1 = dt["start"], dt.get("end")
    if x["kind"] == "month":
        a, b = d(s0), d(s1) if s1 else None
        if b and (a.month != b.month) :
            return "%s – %s" % (MONTHS[a.month - 1], MONTHS[b.month - 1])
        return "All of " + MONTHS[a.month - 1]
    if s1 and s1 != s0:
        if s0[5:7] == s1[5:7]:
            return "%s–%s" % (nice(s0), nice(s1, False))
        return "%s – %s" % (nice(s0), nice(s1, False))
    return nice(s0)


def themed(x, yr):
    t = x.get("tags") or []
    return (x.get("puzzle_theme") and x["kind"] in ("day", "week") and "sensitive" not in t
            and region_of(x) != "au" and not re.search("puzzle", x.get("blurb") or "", re.I)
            and x["dates"][yr]["start"] >= PUZZLES_FROM)


def display_name(x):
    n = x["name"]
    return re.sub(r"\s*\([^()]+\)\s*$", "", n) if region_of(x) else n


def item_html(x, yr):
    dt = x["dates"][yr]
    tags = x.get("tags") or []
    ty = type_of(x)
    keys = set(tags) | {x["kind"], ty}
    if x["kind"] in ("week", "month"):
        keys.add("span")
    badge = TYPE_LABEL[ty] if x["kind"] == "day" else ("Week" if x["kind"] == "week" else "Month")
    puz = ' <span class="dl-pz" title="Themed puzzles">🧩</span>' if themed(x, yr) else ""
    link = ('<a href="%s" target="_blank" rel="noopener">Learn more<span class="sr"> about %s</span></a>'
            % (esc(x["link"]), esc(display_name(x)))) if x.get("link") else ""
    return ('<li class="dl-i t-%s" id="day-%s" data-s="%s" data-e="%s" data-k="%s">'
            '<time datetime="%s">%s</time><div class="dl-tx"><h4>%s%s</h4>'
            '<p class="dl-m"><span class="dl-b">%s</span></p><p>%s</p>%s</div></li>'
            % (ty, esc(x["id"]), dt["start"], dt.get("end") or dt["start"], " ".join(sorted(keys)),
               dt["start"], esc(span_text(x, yr)), esc(display_name(x)), puz, esc(badge),
               esc(x.get("blurb")), link))


def sort_key(x, yr):
    order = {"month": 0, "week": 1, "day": 2}
    return (x["dates"][yr]["start"], order.get(x["kind"], 3), x.get("priority") or 9, x["name"])


def asset_versions():
    """Newest ?v= used across the site for each shared asset, so this page never drifts (site_check rule 2)."""
    best = {"shell.css": 173, "shell.js": 191, "games.js": 103, "site.js": 39}
    for top in os.listdir(ROOT):
        f = os.path.join(ROOT, top, "index.html")
        if top == "days" or not os.path.isfile(f):
            continue
        for name, v in re.findall(r"/assets/(shell\.css|shell\.js|games\.js|site\.js)\?v=(\d+)", open(f, encoding="utf-8").read()):
            best[name] = max(best[name], int(v))
    return best


def write_soon(days):
    """data/days-soon.json: the health days from yesterday to 35 days ahead (Sydney), so the home page day box
    loads a few KB instead of the whole health-days.json. Same entries and fields; only nearby dates kept.
    shell.js falls back to the full file when today is outside from..to, so a missed run never breaks the box."""
    a, b = (TODAY - datetime.timedelta(days=1)).isoformat(), (TODAY + datetime.timedelta(days=35)).isoformat()
    out = []
    for x in days:
        if x.get("kind") == "month":
            continue  # the home box never shows months
        ds = {}
        for yr, dt in (x.get("dates") or {}).items():
            if not isinstance(dt, dict) or not dt.get("start"):
                continue
            if dt["start"] <= b and (dt.get("end") or dt["start"]) >= a:
                ds[yr] = dt
        if ds:
            y = dict(x)
            y["dates"] = ds
            out.append(y)
    doc = {"note": "Generated by _scripts/build_days.py from data/health-days.json. Do not edit.",
           "from": a, "to": b, "days": out}
    txt = json.dumps(doc, ensure_ascii=False, separators=(",", ":")) + "\n"
    old = open(SOON, encoding="utf-8").read() if os.path.exists(SOON) else ""
    if old != txt:
        open(SOON, "w", encoding="utf-8").write(txt)
        print("data/days-soon.json written: %d events, %s to %s" % (len(out), a, b))


def main():
    j = json.load(open(DATA, encoding="utf-8"))
    write_soon(j["days"])
    if "--soon-only" in sys.argv:
        return 0
    days = j["days"]
    if os.path.exists(WORLD):
        days = days + json.load(open(WORLD, encoding="utf-8"))["days"]
    yr = str(TODAY.year)
    nxt = str(TODAY.year + 1)
    ev = [x for x in days if x.get("dates", {}).get(yr) and not region_of(x)]
    ev.sort(key=lambda x: sort_key(x, yr))
    n_next = len([x for x in days if x.get("dates", {}).get(nxt) and not region_of(x)])

    # static list grouped by month
    groups = []
    for m in range(1, 13):
        items = [x for x in ev if int(x["dates"][yr]["start"][5:7]) == m]
        if not items:
            continue
        groups.append('<section class="dl-mo" id="m-%s-%02d"><h3>%s %s</h3><ol class="dl">%s</ol></section>'
                      % (yr, m, MONTHS[m - 1], yr, "".join(item_html(x, yr) for x in items)))
    static_list = "\n".join(groups)

    yshort = "%s–%s" % (yr, nxt[2:])
    title = "Health Awareness Days %s: World Days Calendar" % yshort
    assert len(title) <= 60, (len(title), title)
    full_title = title + " | Malady Wise"
    desc = ("World health days, awareness weeks and months for %s and %s, plus festivals and famous "
            "days. WHO, rare disease, fun and cultural days in one calendar." % (yr, nxt))
    assert len(desc) <= 155, (len(desc), desc)

    who_names = ("World Health Day (7 April), World TB Day (24 March), World Immunization Week "
                 "(last week of April), World Malaria Day (25 April), World No Tobacco Day (31 May), "
                 "World Blood Donor Day (14 June), World Hepatitis Day (28 July), World Patient Safety Day "
                 "(17 September), World AMR Awareness Week (18–24 November) and World AIDS Day (1 December)")
    faqs = [
        ("What health awareness day is today?",
         "Check the top of this page: it shows today’s health day, awareness week or medical-history "
         "anniversary (Sydney time) and the next 30 days. Every date on Malady Wise has a theme, and "
         "days marked 🧩 get themed puzzles."),
        ("When is World Health Day?",
         "World Health Day is on 7 April every year. It marks the founding of the World Health "
         "Organization in 1948, and each year WHO picks a different global health theme."),
        ("What are the WHO official health days?",
         "WHO runs a set of official global public health campaigns, including " + who_names +
         ". It also backs days such as World NTD Day, World Chagas Disease Day and World Hand Hygiene Day. "
         "Tap the WHO filter in the list below to see them all with dates."),
    ]
    faq_html = '<section class="faq" id="faq"><h2>Common questions</h2>' + "".join(
        "<details><summary>%s</summary><p>%s</p></details>" % (esc(q), esc(a)) for q, a in faqs) + "</section>"
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]}
    list_ld = {"@context": "https://schema.org", "@type": "ItemList",
               "name": "World health days, awareness events and famous days %s" % yr,
               "numberOfItems": len(ev),
               "itemListElement": [{"@type": "ListItem", "position": i + 1,
                                    "name": display_name(x),
                                    "url": BASE + "#day-" + x["id"]} for i, x in enumerate(ev)]}

    def ld(o, i):
        return '<script type="application/ld+json" id="%s">%s</script>' % (
            i, json.dumps(o, ensure_ascii=False).replace("</", "<\\/"))

    lede = ("Every day has a theme: a world health day, an awareness week or a moment from medical history, plus "
            "festivals and famous days from around the world. See today and the next 30 days, browse the %s calendar, "
            "or search every day of the year." % yshort)
    page = TEMPLATE.format(
        title=esc(full_title), nxt2=nxt, desc=esc(desc), lede=esc(lede), yr=yr, nxt=nxt,
        count=len(ev), n_next=n_next, static_list=static_list, faq=faq_html,
        ld=ld(list_ld, "mw-days-ld") + "\n" + ld(faq_ld, "mw-faq-ld"),
        cssv=CSS_V, jsv=JS_V, v=asset_versions(), months_opts="".join('<option value="%d">%s</option>' % (i, m) for i, m in enumerate(MONTHS)))

    page = fix_html(page)
    old = open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
    if static_nav.strip(old) != page:
        open(OUT, "w", encoding="utf-8").write(page)
        static_nav.postbuild()
        sm = open(SITEMAP, encoding="utf-8").read()
        sm2 = re.sub(r"(<loc>https://maladywise\.com/days/</loc><lastmod>)[0-9-]+(</lastmod>)",
                     r"\g<1>%s\g<2>" % TODAY.isoformat(), sm)
        if sm2 != sm:
            open(SITEMAP, "w", encoding="utf-8").write(sm2)
        print("days/index.html written: %d events for %s (sitemap lastmod %s)" % (len(ev), yr, TODAY))
    else:
        print("days/index.html unchanged (%d events for %s)" % (len(ev), yr))


TEMPLATE = """<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<link rel="canonical" href="https://maladywise.com/days/">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<meta name="theme-color" content="#4A3480">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Malady Wise">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="https://maladywise.com/assets/share.png?v=4">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="/assets/fonts/poppins-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/shell.css?v={v[shell.css]}">
<link rel="stylesheet" href="/days/days.css?v={cssv}">
<script src="/assets/games.js?v={v[games.js]}"></script>
<script src="/assets/site.js?v={v[site.js]}"></script>
<script src="/assets/shell.js?v={v[shell.js]}"></script>
{ld}
</head>
<body>
<!-- Generated by _scripts/build_days.py from data/health-days.json. Edit the script, not this file. -->
<main class="wrap doc days-doc">
<h1>World Days {yr}–{nxt2}: Health, Awareness and Famous Days</h1>
<p class="lede">{lede}</p>
<nav class="days-jump" aria-label="On this page"><a href="#upcoming">Today</a><a href="#calendar">Calendar</a><a href="#all-days">Search all days</a><a href="#faq">FAQ</a></nav>

<section class="days-sec" id="upcoming" aria-labelledby="up-h">
<h2 id="up-h">Today and the next 30 days</h2>
<p class="note" id="days-mode"></p>
<ol class="days-list" id="days-list" aria-live="polite"><li class="dd dd-empty"><p>Loading the calendar…</p></li></ol>
<button type="button" class="btn dd-more" id="days-more" hidden>Show all 30 days</button>
</section>

<section class="days-sec" id="calendar" aria-labelledby="cal-h">
<div class="cal-head"><h2 id="cal-h">Calendar</h2>
<div class="seg cal-yr" role="group" aria-label="Year"><button type="button" data-y="{yr}" aria-pressed="true">{yr}</button><button type="button" data-y="{nxt}" aria-pressed="false">{nxt}</button></div></div>
<div class="cal-nav" hidden>
<button type="button" class="icon-btn" id="cal-prev" aria-label="Previous month"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
<label class="cal-pick"><span class="sr">Month</span><select id="cal-month">{months_opts}</select></label>
<button type="button" class="cal-today" id="cal-today">Today</button>
<button type="button" class="icon-btn" id="cal-next" aria-label="Next month"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
</div>
<div class="cal-grids" id="cal-grids"><p class="note">The calendar needs JavaScript. The full list of days is below.</p></div>
<ul class="cal-key" aria-label="Key"><li><i class="k-who"></i>WHO</li><li><i class="k-zebra"></i>Rare disease</li><li><i class="k-specialty"></i>Specialty</li><li><i class="k-country"></i>Country</li><li><i class="k-fun"></i>Fun</li><li><i class="k-history"></i>History</li><li><i class="k-culture"></i>Culture</li><li><i class="k-aware"></i>Awareness</li><li><i class="k-week"></i>Week</li></ul>
<div class="cal-day" id="cal-day" aria-live="polite"></div>
</section>

<section class="days-sec" id="all-days" aria-labelledby="all-h">
<h2 id="all-h">Every day in <span id="all-yr">{yr}</span></h2>
<div class="dl-tools" hidden>
<input type="search" class="lsrch" id="dl-q" placeholder="Search days, e.g. diabetes" aria-label="Search health days" autocomplete="off">
<div class="dl-chips" role="group" aria-label="Filter by type">
<button type="button" data-f="" aria-pressed="true">All</button><button type="button" data-f="who" aria-pressed="false">WHO</button><button type="button" data-f="zebra" aria-pressed="false">Rare diseases</button><button type="button" data-f="specialty" aria-pressed="false">Specialties</button><button type="button" data-f="fun" aria-pressed="false">Fun</button><button type="button" data-f="country" aria-pressed="false">Countries</button><button type="button" data-f="history" aria-pressed="false">History</button><button type="button" data-f="culture" aria-pressed="false">Culture &amp; festivals</button><button type="button" data-f="span" aria-pressed="false">Weeks &amp; months</button>
</div>
<div class="dl-row"><p class="meta" id="dl-count">{count} days, weeks and months</p><button type="button" class="cal-today" id="dl-jump">Jump to today</button></div>
</div>
<div id="dl-list">
{static_list}
</div>
<p class="meta" id="dl-none" hidden>No match. Try another word or filter.</p>
</section>

<p class="note">Dates are Sydney time. Some days only show to visitors in the country that marks them. Links go to the organisers or a reputable source. 🧩 = themed puzzles that day.</p>
{faq}
<div id="nl-slot"></div>
<footer class="site">General education, not personal medical advice.<br><a href="/">Malady Wise</a> · <a href="/about/">About</a> · <a href="/disclaimer/">Disclaimer</a> · <a href="/privacy/">Privacy</a> · <a href="/contact/">Contact</a></footer>
</main>
<script>MW.page();</script>
<script src="/days/days.js?v={jsv}"></script>
</body>
</html>
"""

if __name__ == "__main__":
    sys.exit(main())
