#!/usr/bin/env python3
"""Export the site's original diagrams as real image files, for Google Images and Discover.

    python3 _scripts/export_diagrams.py            render images, update pages, write sitemap-images.xml
    python3 _scripts/export_diagrams.py --pages    skip rendering (pages + image sitemap only)

Safe to re-run any time (idempotent). Needs Playwright (Python) + Pillow, like og_cards.py.

What it does
  1. Exercise handouts (any page with <ol class="ex"><li data-ex="key">, figures drawn by assets/exfig.js):
     each figure is rendered at 2x (1280x880) to /img/exercises/<descriptive-name>.webp, and the page gets
     a static <figure class="exfig"><img ...></figure> in each <li>, so the picture is in the HTML for
     crawlers. exfig.js keeps that <img> instead of drawing the SVG (same drawing, fixed colours, so it
     looks identical, in print too). Keys with no entry in EXERCISES below are skipped with a warning and
     keep the inline SVG: add a name + alt text there for every new exercise figure.
  2. Deep dives (<figure class="ddfig"> inline SVG): rendered in light mode to /img/deep-dives/<name>.webp.
     The inline SVG stays on the page (it follows dark mode); the figcaption gets a "Download this diagram"
     link to the file. Add new deep dives to DEEP_DIVES below (otherwise named <slug>-diagram).
  3. Each page gets an ImageObject JSON-LD block (id="mw-image-ld"): contentUrl, caption, licence, credit.
  4. sitemap-images.xml lists every exported image under its page (robots.txt points to it).
Puzzle images (Glimpsis, Opacitis, Dxtective, quizzes etc.) are never touched: they keep date-based names.
"""
import html
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://maladywise.com"
LICENCE = SITE + "/about/"
CREDIT = "Malady Wise"
EX_W, EX_H = 1280, 880          # exfig viewBox 160x110, rendered 640 CSS px wide at 2x
MAX_BYTES = 80 * 1024
EXFIG_V = 4                     # ?v= for assets/exfig.js on handout pages
SKIP_DIRS = {".git", "node_modules", "_data", "__pycache__", "_scripts", "_social", ".claude",
             "glimpsis", "opacitis", "dx", "x-ray-quiz", "specialists", "mental-health-check"}

# exfig key -> (file name, alt text). Alt: specific, under 125 characters, no "image of".
EXERCISES = {
    "bridge": ("glute-bridge-exercise", "Glute bridge: lying on the back with knees bent, lifting the hips off the floor, then lowering"),
    "bridge-line": ("glute-bridge-hold-straight-line", "Glute bridge hold: hips lifted so the body makes a straight line from shoulders to knees"),
    "sit-stand": ("sit-to-stand-chair-exercise", "Sit to stand: rising from a chair to stand tall, then sitting back down slowly"),
    "heel-raise": ("double-heel-raise-calf-exercise", "Double heel raise: standing on both feet, rising onto the toes, then lowering slowly"),
    "heel-raise-wall": ("heel-raise-hand-on-wall-achilles", "Heel raise with a hand on the wall for balance, rising onto the toes, then lowering"),
    "heel-raise-bench": ("heel-raise-holding-kitchen-bench", "Heel raise holding a kitchen bench, rising up onto the toes, then lowering slowly"),
    "seated-heel": ("seated-heel-raise-soleus-exercise", "Seated heel raise with a heavy bag on the knees, lifting both heels high, then lowering slowly"),
    "sl-heel-raise": ("single-leg-heel-raise-calf-exercise", "Single-leg heel raise, holding on for balance, rising onto the toes, then lowering"),
    "eccentric-heel": ("eccentric-heel-drop-achilles-exercise", "Eccentric heel drop: up on both feet, then lowering slowly on one leg for Achilles tendon pain"),
    "bounce": ("calf-bounces-on-toes-achilles", "Calf bounces: small, quick, springy bounces on the toes of both feet"),
    "hops2": ("two-foot-hops-ankle-exercise", "Two-foot hops on the spot, knees bent, springing up and landing softly"),
    "hop1": ("single-leg-hops-achilles-exercise", "Single-leg hops: small springy hops on one leg, landing softly with a bent knee"),
    "ankle-alpha": ("ankle-alphabet-exercise", "Ankle alphabet: seated with one foot raised, drawing letters in the air with the big toe"),
    "sl-stand-bench": ("single-leg-balance-stand-at-bench", "Single-leg balance beside a bench with light fingertip support, other foot lifted"),
    "balance-reach": ("single-leg-balance-reach-exercise", "Balance reach: standing on one leg, tapping the other foot forwards, sideways and back"),
    "band-evert": ("ankle-eversion-resistance-band-exercise", "Ankle eversion: legs out straight, pushing the foot outwards against a band, seen from above"),
    "walk": ("walking-for-back-pain", "Walking tall at a comfortable pace for lower back pain"),
    "knee-rock": ("lying-knee-rocks-lower-back-stretch", "Knee rocks: lying with knees bent, letting both knees fall gently to one side, then the other"),
    "cat-camel": ("cat-camel-back-mobility-exercise", "Cat-camel: on hands and knees, rounding the back up slowly, then letting it sag gently"),
    "bird-dog": ("bird-dog-core-exercise", "Bird dog: on hands and knees, reaching one arm forward and the opposite leg straight back"),
    "knee-ext": ("seated-knee-extension-exercise", "Seated knee extension: sitting tall, slowly straightening one knee, then lowering"),
    "knee-ext-hold": ("seated-knee-extension-hold-quadriceps", "Seated knee extension hold: straightening one knee fully for 2 seconds, then lowering slowly"),
    "knee-ext-band": ("seated-knee-extension-resistance-band", "Seated knee extension against a band tied to the chair leg behind"),
    "side-hip-bench": ("standing-hip-abduction-at-bench", "Standing hip abduction: holding a bench, lifting one leg out to the side, toes forward"),
    "side-hip-band": ("standing-hip-abduction-resistance-band", "Standing hip abduction with a band around both ankles, moving one leg out to the side"),
    "tandem-stand": ("tandem-stance-balance-exercise", "Tandem stance: holding a bench, one foot directly in front of the other, heel to toe"),
    "tandem-walk": ("heel-to-toe-tandem-walk-balance", "Heel-to-toe walk in a straight line near a bench, one foot in front of the other"),
    "side-back-walk": ("sideways-and-backwards-walking-balance", "Walking sideways along a kitchen bench, then backwards, holding on as needed"),
    "clam-band": ("clamshell-exercise-resistance-band", "Clamshell: lying on the side with a band above the knees, feet together, lifting the top knee"),
    "side-step-band": ("lateral-band-walk-exercise", "Lateral band walk: knees slightly bent, band around the knees, stepping sideways"),
    "side-step": ("side-steps-hip-exercise", "Side steps: small sideways steps with the pelvis level and toes pointing forward"),
    "squat-chair": ("chair-squat-exercise", "Chair squat: sitting back towards a chair with knees in line with the toes, then standing"),
    "squat": ("squat-exercise-sit-back", "Squat: feet hip-width, sitting back as if into a chair, knees over toes, then standing"),
    "step-down": ("forward-step-down-knee-exercise", "Step down: on a low step on one leg, bending that knee to touch the other heel to the floor"),
    "step-up": ("step-up-exercise-knee", "Step up onto a low step with one leg, bringing the other foot up, then stepping down slowly"),
    "slides": ("standing-towel-slides-leg-exercise", "Towel slides: holding a bench, sliding the other foot on a towel forwards, back and sideways"),
    "hip-ext-bench": ("standing-hip-extension-at-bench", "Standing hip extension: holding a bench, moving a straight leg back without arching the back"),
    "knee-chest": ("single-knee-to-chest-stretch", "Single knee to chest stretch: lying on the back, drawing one knee gently towards the chest"),
    "hip-iso": ("isometric-hip-abduction-belt-exercise", "Isometric hip abduction: lying with a belt round the thighs, pushing out against it, from above"),
    "neck-move": ("neck-range-of-motion-exercises", "Neck movements: turning to look over each shoulder, tilting each ear down, nodding the chin"),
    "shrug": ("dumbbell-shoulder-shrug", "Shoulder shrug holding a weight in each hand, lifting the shoulders to the ears, then lowering"),
    "lat-raise": ("dumbbell-lateral-raise", "Lateral raise: lifting weights out to the sides to shoulder height, no higher, then lowering"),
    "upright-row": ("dumbbell-upright-row", "Upright row: pulling weights up close to the body to chest height, elbows leading"),
    "press": ("dumbbell-overhead-press", "Overhead press: standing tall, pushing weights overhead from shoulder height"),
    "rev-fly": ("bent-over-reverse-fly", "Reverse fly: leaning forward with a flat back, raising the arms out to the sides"),
    "row-1arm": ("single-arm-dumbbell-row-bench", "Single-arm row: one hand and knee on a bench, pulling a weight up towards the lower ribs"),
    "er-side": ("side-lying-shoulder-external-rotation", "Side-lying external rotation: elbow bent at 90° against the ribs, forearm lifted towards the ceiling"),
    "scaption": ("scaption-shoulder-raise-thumb-up", "Scaption: thumb up, raising the arm at an angle between front and side to shoulder height"),
    "band-row": ("resistance-band-row-door", "Band row: band looped round a door handle, pulling the elbows back and squeezing the shoulder blades"),
    "wall-push": ("wall-push-up-plus", "Wall push-up plus: slow push-up against a wall, pushing further at the top to spread the shoulder blades"),
    "prone-y": ("prone-y-raise-off-bed", "Prone Y raise: lying face down, lifting the hanging arm forwards and up in a Y, thumb up"),
    "cross-stretch": ("cross-body-shoulder-stretch", "Cross-body stretch: pulling the sore arm across the chest at the elbow, seen from the front"),
    "deadlift": ("deadlift-from-box-hip-hinge", "Deadlift: bending from the hips with a straight back to lift a weight from a box, then standing"),
    "back-ext": ("prone-back-extension-exercise", "Back extension: lying face down on a pillow, lifting the head and shoulders a little"),
    "heel-drop": ("heel-drops-bone-loading-exercise", "Heel drops: rising onto the toes, then dropping firmly onto the heels to load the bones"),
    "calf-straight": ("calf-stretch-straight-knee-wall", "Calf stretch at a wall: back knee straight, heel down, leaning forward"),
    "calf-bent": ("soleus-stretch-bent-knee-wall", "Soleus stretch at a wall: back knee bent and heel down to stretch the lower calf"),
    "rathleff": ("heel-raise-towel-under-toes-plantar-fasciitis", "Plantar fasciitis heel raise on a step, rolled towel under the toes, rising and lowering slowly"),
    "arch-stretch": ("plantar-fascia-arch-stretch-seated", "Plantar fascia stretch: seated, foot crossed over the knee, pulling the toes back towards the shin"),
    "wrist-iso": ("isometric-wrist-extension-tennis-elbow", "Isometric wrist extension: forearm on a table, other hand pressing on the back of the still hand"),
    "wrist-ecc": ("eccentric-wrist-extension-tennis-elbow", "Wrist extension with a light weight over the table edge, lifting and lowering over 4 seconds each"),
    "grip": ("grip-strengthening-ball-squeeze", "Grip strengthening: squeezing a soft ball or exercise putty, then letting go slowly"),
    "forearm-rot": ("forearm-supination-pronation-weight", "Forearm rotation: elbow bent at the side holding a light weight, turning the palm up, then down"),
    "pf-find": ("pelvic-floor-squeeze-sitting", "Pelvic floor squeeze: sitting relaxed, lifting the highlighted pelvic floor muscles up and in"),
    "pf-hold": ("pelvic-floor-hold-lying-knees-bent", "Pelvic floor hold: lying with knees bent, squeezing and holding, then fully letting go"),
    "pf-positions": ("pelvic-floor-exercise-positions", "Three positions for pelvic floor exercises: lying, sitting and standing"),
    "pf-knack": ("pelvic-floor-knack-squeeze-before-cough", "The knack: squeezing the pelvic floor just before a cough or sneeze"),
    "pf-harder": ("pelvic-floor-exercise-progression", "Pelvic floor progression chart: longer holds, more squeezes and shorter rests over time"),
    "knee-chest-2": ("double-knee-to-chest-stretch", "Double knee to chest stretch: lying on the back, hugging both knees gently to the chest"),
    "child-pose": ("childs-pose-back-stretch", "Child's pose: kneeling, sitting back to the heels with the hands slid forward on the floor"),
    "sphinx": ("sphinx-pose-lower-back-stretch", "Sphinx stretch: lying face down propped on the forearms, hips on the floor, lower back relaxed"),
    "fig4": ("figure-four-glute-stretch-lying", "Figure-four stretch: lying with an ankle on the other knee, drawing the leg in to stretch the buttock"),
    "hip-flexor": ("half-kneeling-hip-flexor-stretch", "Half-kneeling hip flexor stretch: tailbone tucked, easing the hips forward"),
    "pendulum": ("pendulum-exercise-frozen-shoulder", "Pendulum exercise: leaning on a table, letting the sore arm hang and swing in small circles"),
    "table-slide": ("table-slide-shoulder-exercise", "Table slide: seated, sliding the sore hand forward on a towel while leaning the body forward"),
    "wall-walk": ("finger-wall-walk-shoulder-exercise", "Finger wall walk: walking the fingers of the sore arm up a wall, then back down"),
    "er-stick": ("stick-assisted-shoulder-external-rotation", "Stick-assisted external rotation: elbows at the sides, the good arm pushing the sore hand outwards"),
    "towel-behind": ("towel-stretch-hand-behind-back", "Towel stretch: the good hand pulls a towel up so the sore hand slides up the back"),
    "pf-quick": ("quick-pelvic-floor-squeezes-sitting", "Quick pelvic floor squeezes while sitting, letting go fully between each one"),
    "pf-dribble": ("pelvic-floor-squeeze-after-urinating", "Squeezing the pelvic floor hard after weeing to clear the last drops (after-dribble)"),
    "iso-er": ("isometric-shoulder-external-rotation-wall", "Isometric external rotation: elbow at 90°, pressing the back of the hand into a wall, from above"),
    "iso-ir": ("isometric-shoulder-internal-rotation-door-frame", "Isometric internal rotation: elbow at 90°, pressing the palm into a door frame, from above"),
    "band-er": ("resistance-band-shoulder-external-rotation", "Band external rotation: elbow tucked at 90°, turning the forearm outwards against a band"),
    "scap-set": ("shoulder-blade-setting-exercise", "Shoulder blade setting: drawing the shoulder blades back and down and holding, seen from behind"),
    "wall-slide": ("forearm-wall-slide-shoulder", "Wall slide: forearm resting on a wall, sliding the arm up as far as comfortable, then down"),
}

# deep dive folder -> (file name, alt / short caption)
DEEP_DIVES = {
    "behcets": ("behcets-disease-pathophysiology-flowchart", "Behçet's disease pathophysiology flowchart: genes and triggers to neutrophils, T cells and vasculitis"),
    "coeliac": ("coeliac-disease-pathophysiology-flowchart", "Coeliac disease flowchart: gluten, tTG and HLA-DQ2/DQ8 to positive serology and a flat biopsy"),
    "mould": ("mould-damp-health-effects-pathways-diagram", "Mould and damp health effects diagram: allergy, irritation, HP, ABPA and invasive disease; CIRS unproven"),
    "pots": ("pots-active-stand-test-flowchart", "POTS active stand test flowchart: lying, then standing 10 minutes with heart rate checks"),
    "prostate-cancer": ("prostate-cancer-psa-testing-pathway-flowchart", "Prostate cancer pathway flowchart: PSA testing, repeat PSA, MRI, biopsy and staging"),
    "stroke": ("stroke-types-ischaemic-haemorrhagic-flowchart", "Stroke types flowchart: ischaemic stroke causes and intracerebral and subarachnoid haemorrhage"),
}

LI_RE = re.compile(r'(<li\b[^>]*\bdata-ex="([a-z0-9-]+)"[^>]*>)(<figure class="exfig">.*?</figure>)?', re.S)
IMG_CSS = '<style id="exfig-img-css">figure.exfig{margin:0}.exfig img{display:block;width:100%;height:auto}</style>'
IMG_LD_RE = re.compile(r'\n?<script type="application/ld\+json" id="mw-image-ld">.*?</script>', re.S)
DL_RE = re.compile(r' ?<a class="ddfig-dl"[^>]*>.*?</a>', re.S)


def rel(p):
    return os.path.relpath(p, ROOT).replace(os.sep, "/")


def page_url(path):
    r = rel(path)
    return SITE + "/" + (r[:-10] if r.endswith("index.html") else r)


def pages():
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = sorted(x for x in dirs if x not in SKIP_DIRS and "archive" != x)
        if "index.html" in files:
            yield os.path.join(d, "index.html")


def handout_pages():
    out = []
    for p in pages():
        s = open(p, encoding="utf-8").read()
        if 'class="ex"' in s and "data-ex=" in s and "/assets/exfig.js" in s:
            out.append(p)
    return out


def deep_dive_pages():
    base = os.path.join(ROOT, "deep-dives")
    out = []
    for d in sorted(os.listdir(base)):
        p = os.path.join(base, d, "index.html")
        if os.path.isfile(p) and '<figure class="ddfig">' in open(p, encoding="utf-8").read():
            out.append((d, p))
    return out


def dd_entry(slug, src):
    if slug in DEEP_DIVES:
        return DEEP_DIVES[slug]
    print("WARNING: deep dive %s has no DEEP_DIVES entry; using %s-diagram" % (slug, slug), file=sys.stderr)
    cap = re.search(r'<figure class="ddfig">.*?<figcaption>(.*?)</figcaption>', src, re.S)
    alt = re.sub(r"<[^>]+>", "", cap.group(1)).strip() if cap else slug + " diagram"
    return (slug + "-diagram", html.unescape(alt)[:124])


# ---------- rendering ----------
def encode(png_bytes):
    from PIL import Image
    im = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    best = None
    for kw in ({"lossless": True, "method": 6}, {"quality": 90, "method": 6}, {"quality": 82, "method": 6},
               {"quality": 72, "method": 6}, {"quality": 60, "method": 6}):
        b = io.BytesIO()
        im.save(b, "WEBP", **kw)
        data = b.getvalue()
        if best is None or len(data) < len(best):
            best = data
        if len(data) <= MAX_BYTES and not kw.get("lossless"):
            break
        if kw.get("lossless") and len(data) <= MAX_BYTES * 0.6:
            break  # flat line art: lossless is small and pixel-exact
    return best, im.size


def write_if_changed(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if os.path.isfile(path) and open(path, "rb").read() == data:
        return False
    open(path, "wb").write(data)
    return True


def render(ex_keys, dds):
    from playwright.sync_api import sync_playwright
    base = "http://mw.test"
    blank = ('<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/assets/shell.css">'
             '<style>html,body{margin:0;padding:0;background:#fff}</style></head><body>'
             '<script src="/assets/exfig.js"></script></body></html>')

    def route(r):
        u = r.request.url
        if not u.startswith(base):
            return r.abort()
        path = u[len(base):].split("?")[0].split("#")[0]
        if path == "/__blank":
            return r.fulfill(status=200, content_type="text/html", body=blank)
        f = os.path.join(ROOT, path.lstrip("/"))
        if path.endswith("/"):
            f = os.path.join(f, "index.html")
        if not os.path.isfile(f):
            return r.fulfill(status=404, body="")
        ct = {"html": "text/html", "css": "text/css", "js": "application/javascript", "svg": "image/svg+xml",
              "woff2": "font/woff2", "png": "image/png", "json": "application/json"}.get(f.rsplit(".", 1)[-1], "application/octet-stream")
        return r.fulfill(status=200, content_type=ct, body=open(f, "rb").read())

    stats = []
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        ctx = b.new_context(device_scale_factor=2, color_scheme="light", viewport={"width": 1000, "height": 900},
                            service_workers="block")
        ctx.add_init_script('try{localStorage.setItem("mw-theme","\\"light\\"")}catch(e){}')
        ctx.route("**/*", route)
        page = ctx.new_page()
        page.goto(base + "/__blank")
        page.wait_for_function("window.MW_EXFIG")
        for k in ex_keys:
            name = EXERCISES[k][0]
            page.evaluate("""k => { document.body.innerHTML = '<div id="f" style="width:640px;background:#F1ECF8;line-height:0">' +
                MW_EXFIG.svg(k).replace('<svg ', '<svg style="display:block;width:100%;height:auto" ') + '</div>'; }""", k)
            page.evaluate("document.fonts.ready")
            data, size = encode(page.locator("#f").screenshot())
            assert size == (EX_W, EX_H), (k, size)
            out = os.path.join(ROOT, "img", "exercises", name + ".webp")
            write_if_changed(out, data)
            stats.append((rel(out), len(data)))
        for slug, p in dds:
            name = dd_entry(slug, open(p, encoding="utf-8").read())[0]
            page.goto(base + "/deep-dives/%s/" % slug)
            page.evaluate("document.fonts.ready")
            svg = page.locator("figure.ddfig svg").first
            vb = svg.evaluate("e => e.viewBox.baseVal && [e.viewBox.baseVal.width, e.viewBox.baseVal.height]")
            w = 600 if vb[0] >= vb[1] else round(600 * vb[0] / vb[1])
            svg.evaluate("(e, w) => { e.style.maxWidth = 'none'; e.style.width = w + 'px'; }", w)
            data, size = encode(svg.screenshot())
            out = os.path.join(ROOT, "img", "deep-dives", name + ".webp")
            write_if_changed(out, data)
            stats.append((rel(out), len(data)))
        b.close()
    for f, n in stats:
        flag = "  <-- over 80 KB" if n > MAX_BYTES else ""
        print("%-78s %5.1f KB%s" % (f, n / 1024, flag))
    return stats


# ---------- page updates ----------
def image_obj(url, alt, w, h):
    return {"@type": "ImageObject", "contentUrl": url, "url": url, "caption": alt, "width": w, "height": h,
            "license": LICENCE, "acquireLicensePage": LICENCE, "creditText": CREDIT, "copyrightNotice": CREDIT}


def set_image_ld(src, objs):
    src = IMG_LD_RE.sub("", src)
    if not objs:
        return src
    block = '<script type="application/ld+json" id="mw-image-ld">%s</script>' % json.dumps(
        {"@context": "https://schema.org", "@graph": objs}, ensure_ascii=False)
    m = re.search(r'<script type="application/ld\+json" id="mw-page-ld">.*?</script>', src, re.S)
    if m:
        return src[:m.end()] + "\n" + block + src[m.end():]
    return src.replace("</head>", block + "\n</head>", 1)


def img_size(path):
    from PIL import Image
    with Image.open(path) as im:
        return im.size


def update_handout(p, sitemap):
    src = open(p, encoding="utf-8").read()
    objs, seen = [], set()

    def rep(m):
        k = m.group(2)
        if k not in EXERCISES or not os.path.isfile(os.path.join(ROOT, "img", "exercises", EXERCISES[k][0] + ".webp")):
            if k not in EXERCISES:
                print("WARNING: %s: exercise figure %r has no EXERCISES entry (keeps the inline SVG)" % (rel(p), k), file=sys.stderr)
            return m.group(1)
        name, alt = EXERCISES[k]
        url = "/img/exercises/%s.webp" % name
        if k not in seen:
            seen.add(k)
            objs.append(image_obj(SITE + url, alt, EX_W, EX_H))
        return m.group(1) + ('<figure class="exfig"><img src="%s" alt="%s" width="%d" height="%d" loading="lazy" decoding="async"></figure>'
                             % (url, html.escape(alt, quote=True), EX_W, EX_H))

    out = LI_RE.sub(rep, src)
    if objs and IMG_CSS not in out:
        out = re.sub(r'\n?<style id="exfig-img-css">.*?</style>', "", out)
        out = out.replace("</head>", IMG_CSS + "\n</head>", 1)
    out = re.sub(r'/assets/exfig\.js\?v=(\d+)', lambda m: "/assets/exfig.js?v=%d" % max(int(m.group(1)), EXFIG_V), out)
    out = set_image_ld(out, objs)
    sitemap.append((page_url(p), [o["contentUrl"] for o in objs]))
    return write_text(p, src, out)


def update_deep_dive(slug, p, sitemap):
    src = open(p, encoding="utf-8").read()
    name, alt = dd_entry(slug, src)
    f = os.path.join(ROOT, "img", "deep-dives", name + ".webp")
    if not os.path.isfile(f):
        print("WARNING: %s not rendered yet" % rel(f), file=sys.stderr)
        return False
    url = "/img/deep-dives/%s.webp" % name
    w, h = img_size(f)

    def cap(m):
        body = DL_RE.sub("", m.group(2)).rstrip()
        return m.group(1) + body + ' <a class="ddfig-dl" href="%s" download>Download this diagram</a>' % url + m.group(3)

    out = re.sub(r'(<figure class="ddfig">.*?<figcaption>)(.*?)(</figcaption>)', cap, src, count=1, flags=re.S)
    out = set_image_ld(out, [image_obj(SITE + url, alt, w, h)])
    sitemap.append((page_url(p), [SITE + url]))
    return write_text(p, src, out)


def write_text(p, old, new):
    if new == old:
        return False
    try:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import headkit
        new = headkit.fix_html(new)
    except ImportError:
        pass
    open(p, "w", encoding="utf-8").write(new)
    return True


def write_image_sitemap(entries):
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">']
    for loc, imgs in sorted(entries):
        if not imgs:
            continue
        lines.append("  <url><loc>%s</loc>" % html.escape(loc))
        for i in imgs:
            lines.append("    <image:image><image:loc>%s</image:loc></image:image>" % html.escape(i))
        lines.append("  </url>")
    lines.append("</urlset>")
    data = ("\n".join(lines) + "\n").encode()
    write_if_changed(os.path.join(ROOT, "sitemap-images.xml"), data)
    rb = os.path.join(ROOT, "robots.txt")
    s = open(rb, encoding="utf-8").read()
    line = "Sitemap: %s/sitemap-images.xml" % SITE
    if line not in s:
        s = s.replace("Sitemap: %s/sitemap.xml\n" % SITE, "Sitemap: %s/sitemap.xml\n%s\n" % (SITE, line), 1)
        if line not in s:
            s = s.rstrip("\n") + "\n" + line + "\n"
        open(rb, "w", encoding="utf-8").write(s)


def main():
    hps = handout_pages()
    dds = deep_dive_pages()
    keys = []
    for p in hps:
        for k in re.findall(r'data-ex="([a-z0-9-]+)"', open(p, encoding="utf-8").read()):
            if k in EXERCISES and k not in keys:
                keys.append(k)
    names = [v[0] for v in EXERCISES.values()]
    assert len(names) == len(set(names)), "duplicate exercise image names"
    for k, (n, a) in list(EXERCISES.items()) + list(DEEP_DIVES.items()):
        assert len(a) < 125 and not re.match(r"(?i)(image|picture|photo) of", a), (k, len(a))
    if "--pages" not in sys.argv:
        render(keys, dds)
    sitemap, changed = [], 0
    for p in hps:
        changed += update_handout(p, sitemap)
    for slug, p in dds:
        changed += update_deep_dive(slug, p, sitemap)
    write_image_sitemap(sitemap)
    print("%d figure(s) on %d handout(s), %d deep dive diagram(s); %d page(s) updated; sitemap-images.xml: %d image(s)"
          % (len(keys), len(hps), len(dds), changed, sum(len(i) for _, i in sitemap)))


if __name__ == "__main__":
    main()
