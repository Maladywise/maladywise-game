#!/usr/bin/env python3
"""World Day picture card for X (1200x675 PNG), in the style of the home-page "today" box.

    python3 _scripts/day_card.py 2026-11-18 [out.png]

Picks the date's main day with the same rules as the home page (healthDay in assets/shell.js):
days and weeks only (months are background themes), shown as an Australian visitor in Medical mode,
days and weeks that start on the date come first, then lowest priority number, sensitive days only
if nothing else is on. If the main day isn't priority 1-3 (or is sensitive), there is no card.

The hook is the day's existing, checked blurb (minus any "today's puzzles" sentence). Never write
new medical facts here. Rendered with Playwright (Chromium) from the HTML template below, using
local Lora/Poppins if installed, otherwise Google Fonts.
"""
import base64
import datetime
import html
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_days import region_of  # same rule as regionOf in days.js / shell.js

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILES = [os.path.join(ROOT, "data", "health-days.json"), os.path.join(ROOT, "data", "world-days.json")]
ICONS = os.path.join(ROOT, "assets", "days")
PUZZLES_FROM = "2026-10-17"
STRONG = 3          # priority 1-3 = strong day
W, H = 1200, 675
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"]
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

_ALL = None


def all_days():
    global _ALL
    if _ALL is None:
        _ALL = []
        for f in DATA_FILES:
            try:
                _ALL += json.load(open(f, encoding="utf-8")).get("days", [])
            except FileNotFoundError:
                pass
    return _ALL


def tags(x):
    return x.get("tags") or []


def sens(x):
    return "sensitive" in tags(x)


def visible(x):
    """Australian visitor: everyone-days plus "au" days; other countries' regional days hidden."""
    return region_of(x) in ("", "au")


def on_date(day):
    """All non-month events visible on this ISO date."""
    yr = day[:4]
    out = []
    for x in all_days():
        d = (x.get("dates") or {}).get(yr)
        if not d or x.get("kind") == "month" or not visible(x):
            continue
        if (d["start"] <= day <= d["end"]) if d.get("end") else d["start"] == day:
            out.append(x)
    return out


def lead_of(day):
    """The home page's lead event for this date (or None), plus whether a sensitive day is also on."""
    on = on_date(day)
    if not on:
        return None, False
    yr = day[:4]
    normal = sorted((x for x in on if not sens(x)),
                    key=lambda x: (0 if x.get("kind") == "day" or x["dates"][yr]["start"] == day else 1, x.get("priority", 9)))
    lead = normal[0] if normal else [x for x in on if sens(x)][0]
    return lead, any(sens(x) for x in on)


def main_day(day):
    """Strong main day for this date, or None."""
    lead, _ = lead_of(day)
    if not lead or sens(lead) or lead.get("priority", 9) > STRONG:
        return None
    return lead


def display_name(x):
    n = x["name"]
    return re.sub(r"\s*\([^()]+\)\s*$", "", n) if region_of(x) else n


def hook(x):
    """One line from the checked blurb: drop sentences about puzzles, keep the rest (max ~190 chars)."""
    b = (x.get("blurb") or "").strip()
    sents = [s for s in re.split(r"(?<=[.!?])\s+(?=[A-Z0-9\"'‘“])", b) if s and not re.search(r"puzzle", s, re.I)]
    out = ""
    for s in sents:
        if out and len(out) + 1 + len(s) > 190:
            break
        out = (out + " " + s).strip()
    return out


def themed(x, day):
    """Same test the home page uses before saying "Look out for themed puzzles today"."""
    yr = day[:4]
    first = x["dates"][yr]["start"] == day
    return bool(x.get("puzzle_theme") and not sens(x) and (x.get("kind") == "day" or first)
                and region_of(x) != "au" and x["dates"][yr]["start"] >= PUZZLES_FROM)


def nice_date(day):
    d = datetime.date.fromisoformat(day)
    return "%s %d %s %d" % (DAYS[d.weekday()], d.day, MONTHS[d.month - 1], d.year)


def span_line(x, day):
    yr = day[:4]
    s0, s1 = x["dates"][yr]["start"], x["dates"][yr].get("end")
    if x.get("kind") != "week" or not s1:
        return ""
    a, b = datetime.date.fromisoformat(s0), datetime.date.fromisoformat(s1)
    if a.month == b.month:
        return "Runs %d–%d %s" % (a.day, b.day, MONTHS[b.month - 1])
    return "Runs %d %s – %d %s" % (a.day, MONTHS[a.month - 1][:3], b.day, MONTHS[b.month - 1][:3])


def icon_uri(x):
    ic = x.get("icon")
    p = os.path.join(ICONS, "%s.svg" % ic) if ic else ""
    if p and not os.path.isfile(p):
        p = ""
    if (not p or not os.path.isfile(p)) and "gentle" not in tags(x):
        p = os.path.join(ICONS, "stethoscope.svg")  # cheerful fallback, but not on solemn days
    if not p or not os.path.isfile(p):
        return ""
    return "data:image/svg+xml;base64," + base64.b64encode(open(p, "rb").read()).decode()


TEMPLATE = """<!doctype html><html><head><meta charset="utf-8">
<style>
%(fonts)s
:root{--bg:#FAF7F2;--ink:#2B2340;--muted:#6B5A93;--line:#E6DEEE;--brand:#4A3480;--tint:#F1ECF8;
 --title:Lora,Georgia,serif;--body:Poppins,"Segoe UI",system-ui,sans-serif}
*{box-sizing:border-box;margin:0}
html,body{width:%(w)dpx;height:%(h)dpx;overflow:hidden;background:var(--bg);color:var(--ink);font-family:var(--body)}
.wrap{position:absolute;inset:0;padding:40px 52px 36px;display:flex;flex-direction:column;gap:22px}
.top{display:flex;align-items:baseline;justify-content:space-between;gap:20px}
.logo{font:700 34px var(--title);color:var(--brand);white-space:nowrap}
.logo span{font:500 15px var(--body);letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-left:10px}
.date{font:500 21px var(--body);color:var(--muted);white-space:nowrap}
.card{flex:1;min-height:0;position:relative;background:var(--tint);border:2px solid var(--line);border-left:12px solid var(--brand);
 border-radius:30px;padding:40px 330px 40px 52px;display:flex;flex-direction:column;justify-content:center;gap:16px;overflow:hidden}
.k{font:600 17px var(--body);letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
h1{font:700 64px/1.1 var(--title);color:var(--ink);text-wrap:balance}
.span{font:500 20px var(--body);color:var(--muted)}
p.hook{font:400 28px/1.45 var(--body);color:var(--ink);text-wrap:pretty}
.ic{position:absolute;right:46px;top:50%%;transform:translateY(-50%%);width:250px;height:250px;border-radius:50%%;
 background:#fff;border:2px solid var(--line);display:grid;place-items:center}
.ic img{width:190px;height:190px}
.foot{display:flex;align-items:center;justify-content:space-between;gap:20px}
.play{padding:13px 30px;border-radius:999px;background:var(--brand);color:#fff;font:600 23px var(--body);white-space:nowrap}
.url{font:700 32px var(--title);color:var(--brand);white-space:nowrap}
</style></head><body><div class="wrap">
<div class="top"><div class="logo">Malady Wise<span>World Day</span></div><div class="date">%(date)s</div></div>
<div class="card" id="card"><div class="k">%(kicker)s</div><h1 id="t">%(name)s</h1>%(span)s<p class="hook" id="p">%(hook)s</p>
%(icon)s</div>
<div class="foot"><div class="play">Play today&#8217;s puzzles &#8250;</div><div class="url">maladywise.com</div></div>
</div></body></html>"""

# Shrink the title, then the hook, until the card's content fits. Returns true if it fits.
FIT_JS = """() => {
  const c = document.getElementById('card'), t = document.getElementById('t'), p = document.getElementById('p');
  const fits = () => { const k = c.querySelector('.k'), last = p.textContent ? p : t;
    const top = k.getBoundingClientRect().top, bot = last.getBoundingClientRect().bottom, r = c.getBoundingClientRect();
    return top >= r.top + 20 && bot <= r.bottom - 20 && c.scrollHeight <= c.clientHeight + 1; };
  let ts = 64, ps = 28;
  while (!fits() && (ts > 40 || ps > 21)) {
    if (ts > 40 && (ts - 40) / 24 >= (ps - 21) / 7) ts -= 2; else ps -= 1;
    t.style.fontSize = ts + 'px'; p.style.fontSize = ps + 'px';
  }
  return fits();
}"""


def card_html(x, day):
    e = html.escape
    first = x["dates"][day[:4]]["start"] == day
    kicker = "This week" if x.get("kind") == "week" else "Today"
    if x.get("kind") == "week" and first:
        kicker = "Starts today"
    sp = span_line(x, day)
    ic = icon_uri(x)
    return TEMPLATE % {
        "fonts": font_css(), "w": W, "h": H, "date": e(nice_date(day)), "kicker": e(kicker), "name": e(display_name(x)),
        "span": '<div class="span">%s</div>' % e(sp) if sp else "", "hook": e(hook(x)),
        "icon": '<div class="ic"><img src="%s" alt=""></div>' % ic if ic else "",
    }


_FONTS = None


def font_css():
    """The site's self-hosted fonts (assets/fonts/) inlined as data URIs, so cards render offline with the same look."""
    global _FONTS
    if _FONTS is None:
        rules = []
        for fam, w in (("Lora", 600), ("Lora", 700), ("Poppins", 400), ("Poppins", 500), ("Poppins", 600)):
            f = os.path.join(ROOT, "assets", "fonts", "%s-latin-%d-normal.woff2" % (fam.lower(), w))
            if os.path.isfile(f):
                b = base64.b64encode(open(f, "rb").read()).decode()
                rules.append("@font-face{font-family:%s;font-weight:%d;font-display:block;src:url(data:font/woff2;base64,%s) format('woff2')}" % (fam, w, b))
        _FONTS = "".join(rules)
    return _FONTS


def render(day, out_path, browser=None):
    """Render the card for ISO date `day` to out_path. Returns the chosen day dict, or None (no card)."""
    x = main_day(day)
    if not x:
        return None
    doc = card_html(x, day)
    if 'class="ic"' not in doc:  # no icon at all: let the text use the full width
        doc = doc.replace("padding:40px 330px 40px 52px", "padding:40px 52px")

    def go(b):
        page = b.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        try:
            try:
                page.set_content(doc, wait_until="networkidle", timeout=15000)
            except Exception:
                pass  # fonts CDN slow or offline: carry on with local/system fonts
            try:
                page.evaluate("() => document.fonts.ready.then(() => true)")
            except Exception:
                pass
            ok = page.evaluate(FIT_JS)
            if not ok:
                print("Warning: card text for %s still overflows after shrinking" % day, file=sys.stderr)
            page.screenshot(path=out_path, clip={"x": 0, "y": 0, "width": W, "height": H})
        finally:
            page.close()

    if browser is not None:
        go(browser)
    else:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            b = p.chromium.launch()
            try:
                go(b)
            finally:
                b.close()
    return x


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    day = argv[1]
    datetime.date.fromisoformat(day)
    out = argv[2] if len(argv) > 2 else "day-card-%s.png" % day
    x = render(day, out)
    if not x:
        print("No strong day on %s: no card." % day)
        return 0
    print("%s: %s -> %s" % (day, display_name(x), out))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
