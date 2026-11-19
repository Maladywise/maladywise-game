#!/usr/bin/env python3
"""Mascot poses and emotions (pilot, Nov 2026).

Front emotions are made automatically from each mascot's base SVG (assets/mascots/<id>.svg): its eye groups
<g><circle pupil/><circle highlight/></g> are swapped for emotion eyes, brows and extras are added.
Three-quarter views shift the face elements listed in TURN[id]; side profiles are hand-drawn in SIDE[id].
    python3 _scripts/mascot_poses/poses.py [id ...]   -> assets/mascots/poses/<id>-<pose>.svg
"""
import os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, "assets", "mascots")
OUT = os.path.join(SRC, "poses")
INK = "#2B2340"
LINE = INK  # stroke colour for brows, closed eyes and mouths (light on dark faces)
EYE = re.compile(r'<g><circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)" fill="#2B2340"/><circle [^>]*/></g>')

def parts(svg):
    """Top-level child elements of the svg, groups kept whole."""
    body = svg[svg.index(">") + 1: svg.rindex("</svg>")]
    out, i = [], 0
    while i < len(body):
        if body.startswith("<g", i):
            depth, j = 0, i
            while True:
                if body.startswith("<g", j) and body[j + 2] in " >": depth += 1
                if body.startswith("</g>", j):
                    depth -= 1
                    if depth == 0: j += 4; break
                j += 1
            out.append(body[i:j]); i = j
        else:
            j = body.index(">", i) + 1
            if not body[j - 2] == "/":            # <text ...>..</text>
                j = body.index(">", body.index("</", j)) + 1
            out.append(body[i:j]); i = j
    return out

NUM = r"(-?[\d.]+)"
PUP = re.compile(r'(?:<g>)?<(circle|ellipse) cx="%s" cy="%s" (?:r="%s"|rx="%s" ry="%s") fill="#2B2340"/>(<circle cx="[\d.]+" cy="[\d.]+" r="[\d.]+" fill="#fff"/>)?(?:</g>)?' % (NUM, NUM, NUM, NUM, NUM))

def find_eyes(svg):
    """The pair of ink pupils that are the eyes: similar size, level, 10-85 apart. Returns [(start, end, x, y, r)] left to right."""
    c = []
    for m in PUP.finditer(svg):
        txt = m.group(0)
        if txt.startswith("<g>") != txt.endswith("</g>"): continue
        x, y = float(m.group(2)), float(m.group(3))
        r = float(m.group(4) or m.group(6))
        if 2 <= r <= 9: c.append((m.start(), m.end(), x, y, r))
    best = None
    for i in range(len(c)):
        for j in range(i + 1, len(c)):
            a, b = c[i], c[j]
            if abs(a[3] - b[3]) < 3 and 10 <= abs(a[2] - b[2]) <= 85 and abs(a[4] - b[4]) < 1.5:
                if best is None or a[4] > best[0][4]: best = (a, b)
    if not best:
        big = [e for e in c if e[4] >= 4]
        return [max(big, key=lambda e: e[4])] if len(big) == 1 else []
    return sorted(best, key=lambda e: e[2])

def eyes_of(svg):
    return [(e[2], e[3], e[4]) for e in find_eyes(svg)]

SMILE = re.compile(r'<path d="M%s %sq%s %s %s 0"[^>]*stroke="#2B2340"[^>]*/>' % (NUM, NUM, NUM, NUM, NUM))
def find_mouth(svg, eyes):
    (lx, ly, r), (rx, _, _) = eyes
    for m in SMILE.finditer(svg):
        x, y, w = float(m.group(1)), float(m.group(2)), float(m.group(5))
        if lx - 4 <= x and x + w <= rx + 4 and y > ly + r and 4 <= w <= 18 and float(m.group(4)) > 0:
            return m.start(), m.end(), x + w / 2, y, w / 2
    return None

def f(x): return ("%.1f" % x).rstrip("0").rstrip(".")

# ---- emotion eye kits: (cx, cy, r, side) -> svg; side = -1 left eye, +1 right eye
def happy(x, y, r, s):    # ^ ^ closed smiling eyes
    return '<path d="M%s %sq%s %s %s 0" stroke="%s" stroke-width="%s" fill="none" stroke-linecap="round"/>' % (
        f(x - r), f(y + r * .3), f(r), f(-r * 1.5), f(r * 2), LINE, f(r * .55))
def surprised(x, y, r, s):
    return ('<circle cx="%s" cy="%s" r="%s" fill="#fff" stroke="%s" stroke-width="%s"/><circle cx="%s" cy="%s" r="%s" fill="%s"/>'
            % (f(x), f(y), f(r * 1.25), INK, f(r * .3), f(x), f(y), f(r * .5), INK))
def thinking(x, y, r, s):  # looking up and to the side
    return '<circle cx="%s" cy="%s" r="%s" fill="%s"/><circle cx="%s" cy="%s" r="%s" fill="#fff"/>' % (
        f(x), f(y), f(r), INK, f(x + r * .45), f(y - r * .5), f(r * .38))
def sad(x, y, r, s):
    return '<circle cx="%s" cy="%s" r="%s" fill="%s"/><circle cx="%s" cy="%s" r="%s" fill="#fff"/><circle cx="%s" cy="%s" r="%s" fill="#fff" opacity=".7"/>' % (
        f(x), f(y + r * .15), f(r * .9), INK, f(x - r * .3), f(y - r * .25), f(r * .4), f(x + r * .35), f(y + r * .45), f(r * .18))
def angry(x, y, r, s):
    return '<circle cx="%s" cy="%s" r="%s" fill="%s"/><path d="M%s %sh%s" stroke="%s" stroke-width="%s"/>' % (
        f(x), f(y + r * .2), f(r * .85), INK, f(x - r * 1.1), f(y - r * .55), f(r * 2.2), "none", "0")
def frustrated(x, y, r, s):   # > <
    d = -s
    return '<path d="M%s %sl%s %s-%s %s" stroke="%s" stroke-width="%s" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' % (
        f(x - d * r * .8), f(y - r * .8), f(d * r * 1.4), f(r * .8), f(d * r * 1.4), f(r * .8), LINE, f(r * .5))
def wink(x, y, r, s):
    if s < 0: return happy(x, y, r, s)
    return thinking(x, y, r, s).replace(f(x + r * .45), f(x - r * .3)).replace(f(y - r * .5), f(y - r * .35))

def brow(x, y, r, s, tilt):
    """tilt>0 = worried (inner ends up), tilt<0 = cross / determined."""
    y0 = y - r * 1.9
    inner, outer = (x - s * r * .9, x + s * r * .9)
    return '<path d="M%s %sL%s %s" stroke="%s" stroke-width="%s" stroke-linecap="round"/>' % (
        f(outer), f(y0 + tilt * r * .25), f(inner), f(y0 - tilt * r * .45), LINE, f(r * .45))

def extras(kind, eyes):
    (lx, ly, r), (rx, ry, _) = eyes[0], eyes[-1]
    top = min(ly, ry) - r * 4.5
    if kind == "surprised":
        return '<text x="%s" y="%s" font-family="Georgia" font-weight="700" font-size="20" fill="#E0465E" text-anchor="middle">!</text>' % (f(rx + r * 3.8), f(top + 6))
    if kind == "thinking":
        return ''.join('<circle cx="%s" cy="%s" r="%s" fill="#fff" stroke="%s" stroke-width="1.5"/>' % (f(rx + 8 + i * 7), f(top + 4 - i * 7), f(2 + i * 1.6), INK) for i in range(3))
    if kind == "sad":
        return '<path d="M%s %sq-3 5 0 7q3-2 0-7z" fill="#7CC8F2" stroke="#3C8FC2" stroke-width=".8"/>' % (f(lx - r * .4), f(ly + r * 1.6))
    if kind == "angry":
        x0, y0 = rx + r * 3.6, top + 4
        return '<g stroke="#E0465E" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M%s %sq3 3 6 0M%s %sq3-3 6 0M%s %sq-3 3 0 6M%s %sq3 3 0 6"/></g>' % (
            f(x0 - 3), f(y0 - 5), f(x0 - 3), f(y0 + 5), f(x0 - 5), f(y0 - 3), f(x0 + 5), f(y0 - 3))
    if kind == "frustrated":
        x0, y0 = (lx + rx) / 2, top - 2
        sc = '<path d="M%s %sc4-6 8 6 12 0s8 6 12 0 8 6 12 0" stroke="%s" stroke-width="2" fill="none" stroke-linecap="round"/>' % (f(x0 - 18), f(y0), INK)
        return sc + '<path d="M%s %sq-3 5 0 7q3-2 0-7z" fill="#7CC8F2" stroke="#3C8FC2" stroke-width=".8"/>' % (f(rx + r * 2.2), f(ry - r * 1.6))
    if kind == "celebrate":
        cols = ["#FFD66B", "#FF8FAE", "#7CC8F2", "#9BE3A8", "#C3A6FF"]
        pts = [(14, 22, 20), (104, 18, -25), (20, 52, 40), (102, 50, 15), (60, 8, 0), (30, 10, -30), (92, 32, 35)]
        return ''.join('<rect x="%d" y="%d" width="6" height="3" rx="1" fill="%s" transform="rotate(%d %d %d)"/>' % (x, y, cols[i % 5], a, x, y) for i, (x, y, a) in enumerate(pts))
    if kind == "happy":
        return ''.join('<path d="M%s %sl1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="#FFD66B"/>' % (f(x), f(y)) for x, y in [(lx - r * 3.2, top + 6), (rx + r * 3.4, top + 12)])
    return ""

KITS = {"angry": (angry, -1.3), "frustrated": (frustrated, None), "happy": (happy, None), "surprised": (surprised, 0), "thinking": (thinking, None), "sad": (sad, 1), "celebrate": (happy, None), "wink": (wink, None)}

def emotion(svg, kind, mid=None):
    found = find_eyes(svg)
    if not found: return None
    eyes = [(e[2], e[3], e[4]) for e in found]
    if len(eyes) == 1: eyes = eyes * 2
    kit, tilt = KITS[kind]
    mo = find_mouth(svg, eyes) if found[0] is not found[-1] else None
    out, pos = [], 0
    spans = [(e[0], e[1], "eye", e) for e in found] + ([(mo[0], mo[1], "mouth", mo)] if mo else [])
    for st, en, what, e in sorted(spans):
        out.append(svg[pos:st])
        if what == "eye":
            x, y, r = e[2], e[3], e[4]
            sd = -1 if (e is found[0] and len(found) == 2) else 1
            t = kit(x, y, r, sd)
            if tilt is not None: t += brow(x, y, r, sd, tilt)
            if kind == "thinking" and sd > 0: t += brow(x, y, r, sd, 1.4)
            if kind == "frustrated": t += brow(x, y, r, sd, 1.0)
        else:
            t = mouth(kind, e[2], e[3], e[4])
        out.append(t); pos = en
    out.append(svg[pos:])
    svg = "".join(out)
    if not mo and mid in MOUTH:
        x, y, w, _ = MOUTH[mid]
        svg = svg.replace("</svg>", mouth(kind, x, y, w) + "</svg>")
    svg = svg.replace("</svg>", extras(kind, eyes) + "</svg>")
    return svg

# ---- three-quarter view: shift listed face parts sideways and squash the far eye
TURN = {  # indices (in parts()) of elements that move with the head turn: face = full shift, half = half shift
    "zebritis": dict(face=[6, 8, 9, 10, 11, 14, 15], half=[3, 4, 7], dx=8),
    "dx": dict(face=[6, 7, 8, 11, 12], half=[3, 4, 9, 10], dx=8),
    "triviosis": dict(face=[6, 7, 10, 11], half=[5], dx=8),
}

def three_quarter(mid, svg):
    t = TURN.get(mid)
    if not t: return None
    ps = parts(svg)
    head = svg[:svg.index(">") + 1]
    eye_idx = [i for i, p in enumerate(ps) if EYE.fullmatch(p)]
    out = []
    for i, p in enumerate(ps):
        if i in eye_idx:
            x, y, r = eyes_of(p)[0]
            far = eye_idx.index(i) == 0
            sx = .72 if far else 1.0
            nx = x + t["dx"] * (.7 if far else 1.15)
            p = '<g transform="translate(%s %s) scale(%s 1) translate(%s %s)">%s</g>' % (f(nx), f(y), sx, f(-x), f(-y), p)
        elif i in t["face"]:
            p = '<g transform="translate(%s 0)">%s</g>' % (f(t["dx"]), p)
        elif i in t["half"]:
            p = '<g transform="translate(%s 0)">%s</g>' % (f(t["dx"] * .5), p)
        out.append(p)
    return head + "".join(out) + "</svg>"

# ---- side profiles (hand-drawn, facing right), same palette and 120x120 box
SIDE = {
"zebritis": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><ellipse cx="58" cy="104" rx="30" ry="6" fill="#000" opacity=".08"/>
<rect x="30" y="76" width="50" height="22" rx="11" fill="#fff" stroke="#2B2340" stroke-width="2"/><path d="M42 78v18M54 77v20M66 78v18" stroke="#2B2340" stroke-width="3.5"/>
<path d="M30 84q-10-2-12 8" stroke="#2B2340" stroke-width="4" fill="none" stroke-linecap="round"/>
<ellipse cx="52" cy="34" rx="6" ry="11" fill="#fff" stroke="#2B2340" stroke-width="2" transform="rotate(-15 52 34)"/>
<path d="M36 46q2-20 24-20q24 0 26 26q14 4 14 16q0 14-16 12q-10 0-16-6q-14 4-24-6q-10-10-8-22z" fill="#fff" stroke="#2B2340" stroke-width="2"/>
<path d="M60 26l1-12 5 11z" fill="#FFD66B" stroke="#E0B44A" stroke-width="1"/>
<path d="M44 34q6 5 1 12M56 32q5 7-1 13" stroke="#2B2340" stroke-width="4" stroke-linecap="round" fill="none"/>
<path d="M40 28q12-10 24-4" stroke="#2B2340" stroke-width="5" stroke-linecap="round" fill="none"/>
<path d="M84 60q14 3 15 14q0 10-12 9q-8-1-12-6z" fill="#F3D9E5"/><circle cx="94" cy="70" r="1.6" fill="#2B2340"/>
<path d="M84 78q4 2 8 0" stroke="#2B2340" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<g><circle cx="74" cy="54" r="6" fill="#2B2340"/><circle cx="76" cy="51.6" r="2.3" fill="#fff"/></g>
<ellipse cx="68" cy="68" rx="5" ry="3" fill="#FF8FAE" opacity=".6"/></svg>''',
"dx": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><ellipse cx="58" cy="104" rx="28" ry="6" fill="#000" opacity=".08"/>
<path d="M30 92q-20-4-18-22q12 4 22 16z" fill="#F08A24"/><path d="M14 72q2-6 6-4q-2 6 2 10z" fill="#FFF2E2"/>
<ellipse cx="54" cy="90" rx="20" ry="14" fill="#7A5AC9"/><path d="M54 78v24" stroke="#5B3FA6" stroke-width="2"/>
<path d="M40 40l-2-22 16 14z" fill="#F08A24"/><path d="M41 36l-1-12 8 8z" fill="#FFE2C4"/>
<path d="M32 60q0-28 28-28q20 0 26 18l18 12q4 3 0 6q-12 8-28 8q-10 8-24 6q-20-4-20-22z" fill="#F08A24"/>
<path d="M66 70q16 2 34-6q2 2 0 4q-14 10-32 10z" fill="#FFF2E2"/><circle cx="103" cy="64" r="3" fill="#2B2340"/>
<path d="M32 42q26-20 50-2q-2 8-26 7t-24-5z" fill="#8A6D3B"/><path d="M80 40q8 2 12 6" stroke="#6E552D" stroke-width="3" stroke-linecap="round"/>
<g><circle cx="70" cy="56" r="5.5" fill="#2B2340"/><circle cx="72" cy="53.6" r="2.1" fill="#fff"/></g>
<ellipse cx="60" cy="68" rx="5" ry="3" fill="#FF8FAE" opacity=".6"/>
<circle cx="86" cy="88" r="10" fill="#DDF1FF" stroke="#4A3480" stroke-width="3.5"/><path d="M79 96l-8 9" stroke="#4A3480" stroke-width="4" stroke-linecap="round"/><path d="M82 84q3-3 7 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>''',
"triviosis": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><ellipse cx="56" cy="104" rx="24" ry="6" fill="#000" opacity=".08"/>
<path d="M50 96l-4 10M62 96l2 10" stroke="#F0A830" stroke-width="4" stroke-linecap="round"/>
<path d="M36 96q-22 4-28 14q12 0 34-8z" fill="#E0465E"/>
<ellipse cx="54" cy="84" rx="20" ry="18" fill="#1F9AAE"/><path d="M40 76q-6 14 8 22q-14 0-16-12z" fill="#167A8A"/>
<ellipse cx="62" cy="88" rx="9" ry="12" fill="#B9EEF2"/>
<circle cx="58" cy="56" r="25" fill="#1F9AAE"/><path d="M44 34q0-16 10-6q2-14 10 0" fill="#E0465E"/>
<path d="M78 52q14 2 12 18q-2 6-8 2q0-8-6-10z" fill="#F0A830"/><path d="M78 62q4 6 4 12q-6 0-6-6z" fill="#E09020"/>
<g><circle cx="68" cy="52" r="5.5" fill="#2B2340"/><circle cx="70" cy="49.6" r="2.1" fill="#fff"/></g>
<ellipse cx="62" cy="64" rx="5" ry="3" fill="#FF8FAE" opacity=".6"/></svg>''',
}

MOUTH = {  # mascots with no drawn mouth that should get one: (x, y, half-width, unused)
    "zebritis": (60, 83, 4, None),
}
def mouth(kind, x, y, w):
    st = 'stroke="%s" stroke-width="2.2" fill="none" stroke-linecap="round"' % LINE
    if kind in ("happy", "celebrate"):
        return '<path d="M%s %sq%s %s %s 0z" fill="%s"/><path d="M%s %sq%s %s %s 0" fill="#FF8FAE"/>' % (f(x - w), f(y - 1), f(w), f(w * 1.6), f(w * 2), INK, f(x - w * .5), f(y + w * .55), f(w * .5), f(w * .5), f(w))
    if kind == "surprised": return '<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="%s"/>' % (f(x), f(y + 1), f(w * .45), f(w * .65), INK)
    if kind == "sad": return '<path d="M%s %sq%s %s %s 0" %s/>' % (f(x - w), f(y + 2), f(w), f(-w * .8), f(w * 2), st)
    if kind == "angry": return '<path d="M%s %sq%s %s %s 0" %s/>' % (f(x - w), f(y + 3), f(w), f(-w * 1.1), f(w * 2), st)
    if kind == "frustrated": return '<path d="M%s %sq%s %s %s 0t%s 0" %s/>' % (f(x - w), f(y + 1), f(w * .5), f(-w * .6), f(w), f(w), st)
    if kind == "thinking": return '<path d="M%s %sl%s %s" %s/>' % (f(x - w * .7), f(y + 1), f(w * 1.4), f(-1), st)
    return '<path d="M%s %sq%s %s %s 0" %s/>' % (f(x - w * .8), f(y), f(w * .8), f(w * .7), f(w * 1.6), st)

DARK = {"cryptogenic", "grandrounds", "emergency", "normie/cryptogenic", "normie/grandrounds"}
LIGHT = "#F1ECFA"

POSES = ["happy", "celebrate", "wink", "surprised", "thinking", "sad", "angry", "frustrated"]

SKIP = {"sleep"}   # Kip sleeps with closed eyes; the single-eye fallback would pick her nose

def build(rel):
    """rel = 'dx' or 'normie/dx'. Writes poses/<rel>-<pose>.svg."""
    if rel in SKIP: return []
    base = open(os.path.join(SRC, rel + ".svg"), encoding="utf-8").read()
    mid = rel.split("/")[-1]
    os.makedirs(os.path.dirname(os.path.join(OUT, rel)), exist_ok=True)
    made = []
    for k in POSES:
        s = emotion(base, k, rel if rel in DARK else (None if "/" in rel else mid))
        if s: open(os.path.join(OUT, "%s-%s.svg" % (rel, k)), "w").write(s); made.append(k)
    return made

def all_ids():
    ids = [f[:-4] for f in sorted(os.listdir(SRC)) if f.endswith(".svg")]
    ids += ["normie/" + f[:-4] for f in sorted(os.listdir(os.path.join(SRC, "normie"))) if f.endswith(".svg")]
    return ids

if __name__ == "__main__":
    import json
    ok, miss = [], []
    for rel in sys.argv[1:] or all_ids():
        (ok if build(rel) else miss).append(rel)
    json.dump(sorted(ok), open(os.path.join(OUT, "index.json"), "w"))
    print(len(ok), "with poses; none for:", " ".join(miss))
