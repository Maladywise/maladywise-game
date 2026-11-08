#!/usr/bin/env python3
"""Share cards (og:image / twitter:image) for health pages: one 1200x630 PNG per page.

HOW TO RUN (from the repo root; needs Playwright + Chromium and Pillow)
    python3 _scripts/og_cards.py             make cards for new or changed pages, then update the meta tags
    python3 _scripts/og_cards.py --force     redraw every card
    python3 _scripts/og_cards.py --meta      only update meta tags for cards that already exist (no Playwright)
    python3 _scripts/og_cards.py --only /gout/ /medicines/statins/     just these pages

Which pages get a card
    Fact sheets, medicines, blood tests, exercise handouts, deep dives, compare pages, tools, specialists,
    mental health self-checks (and some of their hub pages), plus Mergeon. Games and the home page keep
    their own hand-made cards. A page is picked up automatically when its section is one of those.

Each card shows the page's short title (the same name the footer links use, from _scripts/static_nav.py),
a section label and maladywise.com, in the site's fonts (assets/fonts/) and colours, with a small mascot.
Cards are saved to assets/og/pages/<slug>.png (quantised with Pillow, under ~120 KB) and listed in
assets/og/pages/cards.json, so only new or renamed pages are redrawn. The page's og:image, og:image:width,
og:image:height, og:image:alt and twitter:image tags are then pointed at the card (?v= is the card's hash).
If the cards ever pass 40 MB in total, set FORMAT = "jpg".
"""
import base64
import hashlib
import html
import io
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import static_nav  # same page list, sections and short names as the footer links

ROOT = static_nav.ROOT
OUT_DIR = os.path.join(ROOT, "assets", "og", "pages")
MANIFEST = os.path.join(OUT_DIR, "cards.json")
BASE = "https://maladywise.com"
W, H = 1200, 630
FORMAT = "png"          # "jpg" if the folder ever grows past 40 MB
MAX_BYTES = 120 * 1024
TEMPLATE_V = "2"        # bump to redraw every card after changing the template

# section -> (label on the card, mascot/icon under assets/)
SECTIONS = {
    "fact": ("Condition", "days/stethoscope.svg"),
    "medicines": ("Medicine", "days/syringe.svg"),
    "blood-tests": ("Blood test", "mascots/panelysis.svg"),
    "exercises": ("Exercise handout", "days/tess-bone.svg"),
    "sub": ("Exercise handout", "days/tess-bone.svg"),
    "deep-dives": ("Deep dive for clinicians", "days/zebra-rare.svg"),
    "compare": ("Compare", "mascots/sensitosis.svg"),
    "tools": ("Tool", "days/octavia-tools.svg"),
    "mental-health-check": ("Tool", "days/heart-calm.svg"),
    "specialists": ("Specialists", "days/cadi-rod.svg"),
}
# Pages outside those sections (hubs and one-offs): (label, title, subtitle, icon)
SPECIAL = {
    "/blood-tests/": ("Blood tests", "Blood test results explained", "What high and low results mean, in plain English", "mascots/panelysis.svg"),
    "/compare/": ("Compare", "Medicines and symptoms, side by side", "", "mascots/sensitosis.svg"),
    "/deep-dives/": ("Deep dives for clinicians", "Evidence-dense topic reviews", "", "days/zebra-rare.svg"),
    "/exercises/": ("Exercise handouts", "Printable rehab plans", "", "days/tess-bone.svg"),
    "/specialists/": ("Specialists", "Specialists and allied health", "Newcastle and the Hunter", "days/cadi-rod.svg"),
    "/mental-health-check/": ("Tool", "Mental health check", "Free, private self-checks", "days/heart-calm.svg"),
    "/words/": ("Medical word of the week", "Word of the week", "Where medical words come from", "mascots/morphemia.svg"),
    "/mergeon/": ("Arcade game", "Mergeon", "Drop, match and merge from microbe to brain", "days/brain.svg"),
}
SUBTITLE = {"specialists": "Newcastle and the Hunter"}


def slug(u):
    return u.strip("/").replace("/", "-") or "home"


def spec_for(u, p):
    """(label, title, subtitle, icon) for page u, or None if it doesn't get a card."""
    if u in SPECIAL:
        return SPECIAL[u]
    if p["sec"] not in SECTIONS or u in static_nav.HUBS:
        return None
    label, icon = SECTIONS[p["sec"]]
    title, sub = p["label"], SUBTITLE.get(p["sec"], "")
    if ": " in title and p["sec"] != "specialists":
        title, sub = title.split(": ", 1)
        sub = sub[:1].upper() + sub[1:]
    return label, title, sub, icon


def data_uri(rel):
    fp = os.path.join(ROOT, "assets", rel)
    mime = "image/svg+xml" if rel.endswith(".svg") else "image/png"
    return "data:%s;base64,%s" % (mime, base64.b64encode(open(fp, "rb").read()).decode())


_FONTS = None


def fonts():
    global _FONTS
    if _FONTS is None:
        rules = []
        for fam, w in (("Lora", 700), ("Poppins", 500), ("Poppins", 600)):
            for sub in ("latin", "latin-ext"):
                f = os.path.join(ROOT, "assets", "fonts", "%s-%s-%d-normal.woff2" % (fam.lower(), sub, w))
                if os.path.isfile(f):
                    rules.append("@font-face{font-family:%s;font-weight:%d;font-display:block;src:url(data:font/woff2;base64,%s) format('woff2')}"
                                 % (fam, w, base64.b64encode(open(f, "rb").read()).decode()))
        _FONTS = "".join(rules)
    return _FONTS


TEMPLATE = """<!doctype html><html><head><meta charset="utf-8"><style>
%(fonts)s
:root{--bg:#FAF7F2;--ink:#2B2340;--muted:#6B5A93;--brand:#4A3480;--tint:#E9E4F0;--chip:#fff;--line:#DCD3E8}
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;overflow:hidden;background:var(--bg);font-family:Poppins,system-ui,sans-serif;color:var(--ink)}
.blob{position:absolute;right:-150px;top:50%%;transform:translateY(-50%%);width:640px;height:640px;border-radius:50%%;background:var(--tint)}
.ic{position:absolute;right:70px;top:50%%;transform:translateY(-50%%);width:340px;height:340px;display:grid;place-items:center}
.ic img{max-width:340px;max-height:340px}
.l{position:absolute;left:84px;top:62px;bottom:52px;width:700px;display:flex;flex-direction:column}
.logo{display:flex;align-items:center;gap:18px;font:600 21px Poppins;letter-spacing:.2em;color:var(--muted);text-transform:uppercase}
.logo img{width:64px;height:64px;border-radius:14px}
.mid{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:18px;padding:18px 0}
.k{align-self:flex-start;font:600 22px Poppins;letter-spacing:.08em;text-transform:uppercase;color:var(--brand);background:var(--chip);border:2px solid var(--line);border-radius:999px;padding:8px 22px}
h1{font:700 84px/1.08 Lora,Georgia,serif;color:var(--ink);text-wrap:balance;overflow-wrap:normal}
.sub{font:500 30px/1.35 Poppins;color:var(--brand);text-wrap:balance}
.url{align-self:flex-start;font:600 28px Poppins;color:#fff;background:#2B2340;border-radius:999px;padding:12px 30px}
</style></head><body>
<div class="blob"></div><div class="ic"><img src="%(icon)s" alt=""></div>
<div class="l"><div class="logo"><img src="%(logo)s" alt="">Malady Wise</div>
<div class="mid" id="mid"><div class="k">%(label)s</div><h1 id="t">%(title)s</h1>%(sub)s</div>
<div class="url">maladywise.com</div></div>
</body></html>"""

# Shrink the title (then the subtitle) until it fits its box without spilling or overflowing sideways.
FIT_JS = """() => {
  const m = document.getElementById('mid'), t = document.getElementById('t'), s = document.querySelector('.sub');
  const fits = () => m.scrollHeight <= m.clientHeight + 1 && t.scrollWidth <= t.clientWidth + 1 && (!s || s.scrollWidth <= s.clientWidth + 1);
  let ts = 84, ss = 30;
  while (!fits() && (ts > 44 || ss > 22)) {
    if (ts > 44) ts -= 2; else ss -= 1;
    t.style.fontSize = ts + 'px'; if (s) s.style.fontSize = ss + 'px';
  }
  return fits();
}"""


def card_html(spec):
    label, title, sub, icon = spec
    e = html.escape
    return TEMPLATE % {"fonts": fonts(), "icon": data_uri(icon), "logo": data_uri("icon-192.png"), "label": e(label),
                       "title": re.sub(r"(\S+-\S+)", r'<span style="white-space:nowrap">\1</span>', e(title)), "sub": '<div class="sub">%s</div>' % e(sub) if sub else ""}


def squeeze(png_bytes):
    """Quantise to a small palette PNG (or JPEG) under MAX_BYTES."""
    from PIL import Image
    im = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    if FORMAT == "jpg":
        for q in (86, 80, 72, 64):
            b = io.BytesIO(); im.save(b, "JPEG", quality=q, optimize=True, progressive=True)
            if b.tell() <= MAX_BYTES:
                break
        return b.getvalue()
    for colours in (128, 96, 64, 48):
        b = io.BytesIO()
        im.quantize(colors=colours, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(b, "PNG", optimize=True)
        if b.tell() <= MAX_BYTES:
            break
    return b.getvalue()


def card_path(u):
    return os.path.join(OUT_DIR, "%s.%s" % (slug(u), FORMAT))


def card_key(spec):
    return hashlib.sha1(json.dumps([TEMPLATE_V, FORMAT, TEMPLATE, FIT_JS] + list(spec), ensure_ascii=False).encode()).hexdigest()[:12]


def load_manifest():
    try:
        return json.load(open(MANIFEST, encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def render(todo, manifest):
    from playwright.sync_api import sync_playwright
    os.makedirs(OUT_DIR, exist_ok=True)
    bad = []
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        page = b.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        for u, spec in todo:
            page.set_content(card_html(spec), wait_until="load")
            page.evaluate("() => document.fonts.ready.then(() => true)")
            if not page.evaluate(FIT_JS):
                bad.append(u)
            data = squeeze(page.screenshot(type="png", clip={"x": 0, "y": 0, "width": W, "height": H}))
            open(card_path(u), "wb").write(data)
            manifest[slug(u)] = {"url": u, "key": card_key(spec), "v": hashlib.md5(data).hexdigest()[:8],
                                 "label": spec[0], "title": spec[1]}
            print("card %-48s %3d KB  %s" % (u, len(data) // 1024, spec[1]))
        b.close()
    for u in bad:
        print("Warning: title still too big for the card on %s" % u, file=sys.stderr)


META_RE = re.compile(r'[ \t]*<meta (?:property="og:image(?::width|:height|:alt|:type|:secure_url)?"|name="twitter:image(?::alt)?") content="[^"]*">\n?')


def set_meta(src, u, entry, spec):
    img = "%s/assets/og/pages/%s.%s?v=%s" % (BASE, slug(u), FORMAT, entry["v"])
    alt = "%s: %s. Malady Wise" % (spec[0], spec[1])
    tags = ('<meta property="og:image" content="%s">\n<meta property="og:image:width" content="%d">\n'
            '<meta property="og:image:height" content="%d">\n<meta property="og:image:alt" content="%s">\n'
            '<meta name="twitter:image" content="%s">\n') % (img, W, H, html.escape(alt, quote=True), img)
    head_end = src.find("</head>")
    if head_end < 0:
        return src
    m = re.search(r'[ \t]*<meta property="og:image" content="[^"]*">\n?', src[:head_end])
    at = m.start() if m else None
    if at is None:
        m = re.search(r'<meta name="twitter:card"[^>]*>\n?', src[:head_end])
        at = m.start() if m else head_end
    head = src[:head_end]
    before, after = head[:at], head[at:]
    before = META_RE.sub("", before)
    after = META_RE.sub("", after)
    if 'name="twitter:card"' not in head:
        tags += '<meta name="twitter:card" content="summary_large_image">\n'
    out = before + tags + after + src[head_end:]
    # JSON-LD "image" that still points at a generic section card
    return re.sub(r'("image":\s*")https://maladywise\.com/assets/(?:og/(?:facts|drugs|tools)\.png|share\.jpg)(?:\?v=\d+)?(")',
                  lambda m: m.group(1) + img + m.group(2), out)


def apply_meta(pages, idx, manifest, only=None):
    n = 0
    for u in sorted(idx):
        if only and u not in only:
            continue
        spec = spec_for(u, pages[u])
        e = manifest.get(slug(u))
        if not spec or not e or not os.path.isfile(card_path(u)):
            continue
        src = pages[u]["src"]
        new = set_meta(src, u, e, spec)
        if new != src:
            open(pages[u]["fp"], "w", encoding="utf-8").write(new)
            pages[u]["src"] = new
            n += 1
    return n


def update_meta(quiet=False):
    """For page generators: point rebuilt pages at their existing cards (no drawing, no Playwright)."""
    pages, idx, _, _ = static_nav.load()
    n = apply_meta(pages, idx, load_manifest())
    if not quiet:
        print("og_cards: share-card tags updated on %d page(s)" % n)
    return n


def main(argv):
    pages, idx, _, _ = static_nav.load()
    manifest = load_manifest()
    only = set(a for a in argv if a.startswith("/")) if "--only" in argv else None
    if "--meta" not in argv:
        todo = []
        for u in sorted(idx):
            if only and u not in only:
                continue
            spec = spec_for(u, pages[u])
            if not spec:
                continue
            e = manifest.get(slug(u))
            if "--force" in argv or not e or e.get("key") != card_key(spec) or not os.path.isfile(card_path(u)):
                todo.append((u, spec))
        if todo:
            render(todo, manifest)
        # forget cards for pages that have gone
        for k in [k for k, e in manifest.items() if e["url"] not in idx or not spec_for(e["url"], pages[e["url"]])]:
            fp = os.path.join(OUT_DIR, "%s.%s" % (k, FORMAT))
            if os.path.isfile(fp):
                os.remove(fp)
            del manifest[k]
        os.makedirs(OUT_DIR, exist_ok=True)
        with open(MANIFEST, "w", encoding="utf-8") as f:
            json.dump(dict(sorted(manifest.items())), f, ensure_ascii=False, indent=0)
            f.write("\n")
        print("og_cards: %d card(s) drawn, %d in total" % (len(todo), len(manifest)))
    n = apply_meta(pages, idx, manifest, only)
    total = sum(os.path.getsize(os.path.join(OUT_DIR, f)) for f in os.listdir(OUT_DIR)) if os.path.isdir(OUT_DIR) else 0
    print("og_cards: tags updated on %d page(s); cards folder %.1f MB" % (n, total / 1e6))
    if total > 40e6 and FORMAT == "png":
        print("Cards are over 40 MB: set FORMAT = \"jpg\" in _scripts/og_cards.py and run with --force", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
