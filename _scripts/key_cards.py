#!/usr/bin/env python3
"""Hand-designed share cards (og:image) for the home page, hubs, quizzes and every game: 1200x630 PNGs.

HOW TO RUN (from the repo root; needs Playwright + Chromium and Pillow)
    python3 _scripts/key_cards.py            draw new or changed cards, then point the pages' meta tags at them
    python3 _scripts/key_cards.py --force    redraw every card
    python3 _scripts/key_cards.py --meta     only update meta tags (no Playwright)
    python3 _scripts/key_cards.py --html wordemic   print one card's HTML (for tweaking)

Style: the deep dive card family (cream background, lilac circle, big Lora title, one punchy line, a drawing
on the right, maladywise.com pill). Games show their mascot plus a tiny stylised glimpse of the game; the
glimpse never shows a real answer (blank tiles, neutral letters, generic traces only). Hubs show a collage.
Files: games keep assets/og/<game>.png (links stay valid), the home card is assets/share.png, other hubs go
to assets/og/key/<name>.png. assets/og/key/cards.json records each card's hash; ?v= is the image's hash.

To change a card, edit CARDS below and re-run. og_cards.py skips any page listed here, and
_scripts/share_block.py then copies the card into the page's JSON-LD and visible "Share this page" block.
"""
import hashlib
import html
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import og_cards
import static_nav

ROOT = static_nav.ROOT
BASE = "https://maladywise.com"
W, H = 1200, 630
MAX_BYTES = 80 * 1024
TEMPLATE_V = "1"
MANIFEST = os.path.join(ROOT, "assets", "og", "key", "cards.json")

# ---------- tiny glimpses of each game (viewBox 0 0 340 250, no answers) ----------
INK, PUR, LIL, GRN, YEL, GRY, PNK, LINE = "#2A2140", "#4A3A8A", "#E8E2F0", "#3FB98A", "#F2C14E", "#B9B3C6", "#F4A6C0", "#D8CFE8"


def svg(body, vb="0 0 340 250"):
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s">%s</svg>' % (vb, body)


def tiles(rows, size, gap, colours, x0=None, y0=None, r=8, stroke=LINE, vb=(340, 250)):
    nr, nc = len(rows), len(rows[0])
    tw, th = nc * size + (nc - 1) * gap, nr * size + (nr - 1) * gap
    x0 = (vb[0] - tw) / 2 if x0 is None else x0
    y0 = (vb[1] - th) / 2 if y0 is None else y0
    out = []
    for i, row in enumerate(rows):
        for j, c in enumerate(row):
            fill = colours.get(c, "#fff")
            out.append('<rect x="%g" y="%g" width="%d" height="%d" rx="%d" fill="%s"%s/>' % (
                x0 + j * (size + gap), y0 + i * (size + gap), size, size, r, fill,
                ' stroke="%s" stroke-width="3"' % stroke if c == "." else ""))
    return "".join(out)


def grid_lines(n, size, x0, y0, black=(), thick=None, nums=()):
    out = ['<rect x="%g" y="%g" width="%d" height="%d" fill="#fff" stroke="%s" stroke-width="4"/>' % (x0, y0, n * size, n * size, INK)]
    for (i, j) in black:
        out.append('<rect x="%g" y="%g" width="%d" height="%d" fill="%s"/>' % (x0 + j * size, y0 + i * size, size, size, INK))
    for k in range(1, n):
        w = 3.5 if thick and (k % thick[0] == 0) else 1.5
        out.append('<path d="M%g %gV%g" stroke="%s" stroke-width="%s"/>' % (x0 + k * size, y0, y0 + n * size, INK, 3.5 if thick and k % thick[1] == 0 else 1.5))
        out.append('<path d="M%g %gH%g" stroke="%s" stroke-width="%s"/>' % (x0, y0 + k * size, x0 + n * size, INK, w))
    for (i, j, t) in nums:
        out.append('<text x="%g" y="%g" font-family="Poppins" font-weight="600" font-size="11" fill="%s">%s</text>' % (x0 + j * size + 4, y0 + i * size + 13, INK, t))
    return "".join(out)


def bar(x, y, w, h=12, c="#E4DEEC"):
    return '<rect x="%g" y="%g" width="%g" height="%g" rx="%g" fill="%s"/>' % (x, y, w, h, h / 2, c)


def ecg_path(x0, y0, beats, w, amp=1.0):
    d, x = ["M%g %g" % (x0, y0)], x0
    for _ in range(beats):
        d.append("h%g q6 -10 12 0 h8 l5 6 l7 %g l7 %g l6 %g h12 q10 -16 20 0 h%g" % (
            w * .08, -46 * amp, 58 * amp, -18 * amp, w * .2))
    return "".join(d)


def g_wordemic():
    rows = ["xyxgx", "gxygx", ".....", "....."]
    return svg(tiles(rows, 44, 8, {"x": GRY, "y": YEL, "g": GRN}))


def g_dx():
    b = []
    for i, w in enumerate((190, 150, 210)):
        y = 34 + i * 50
        b.append('<circle cx="52" cy="%d" r="15" fill="%s"/><text x="52" y="%d" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="16" fill="#fff">%d</text>' % (y, PUR, y + 6, i + 1))
        b.append(bar(80, y - 7, w, 14))
    b.append('<rect x="38" y="178" width="264" height="50" rx="14" fill="#fff" stroke="%s" stroke-width="3" stroke-dasharray="8 7"/>' % PUR)
    b.append('<text x="170" y="213" text-anchor="middle" font-family="Lora" font-weight="700" font-size="30" fill="%s">?</text>' % PUR)
    return svg("".join(b))


def g_panelysis():
    b = ['<rect x="30" y="22" width="280" height="206" rx="14" fill="#fff" stroke="%s" stroke-width="3"/>' % LINE]
    flags = [("#E0566B", "M0 8l7-10l7 10z"), (None, ""), ("#4C7BD9", "M0 -2l7 10l7-10z"), (None, ""), ("#E0566B", "M0 8l7-10l7 10z")]
    for i, (c, p) in enumerate(flags):
        y = 50 + i * 38
        b.append(bar(52, y - 6, 90, 12))
        b.append(bar(170, y - 6, 60, 12, "#CFC6DE" if c else "#E4DEEC"))
        if c:
            b.append('<path transform="translate(256 %d)" d="%s" fill="%s"/>' % (y - 2, p, c))
    return svg("".join(b))


def g_glimpsis():
    return svg('<defs><radialGradient id="gs" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#F6DCCB"/><stop offset="1" stop-color="#E9BFA6"/></radialGradient>'
               '<filter id="bl"><feGaussianBlur stdDeviation="6"/></filter></defs>'
               '<rect x="30" y="22" width="280" height="206" rx="16" fill="url(#gs)"/>'
               '<ellipse cx="150" cy="120" rx="44" ry="34" fill="#D98C86" opacity=".55" filter="url(#bl)"/>'
               '<circle cx="196" cy="108" r="54" fill="#fff" fill-opacity=".25" stroke="%s" stroke-width="9"/>'
               '<path d="M236 148l40 40" stroke="%s" stroke-width="16" stroke-linecap="round"/>' % (INK, INK))


def g_opacitis():
    ribs = "".join('<path d="M170 %d q-%d 4 -%d 34" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="7" stroke-linecap="round"/>'
                   '<path d="M170 %d q%d 4 %d 34" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="7" stroke-linecap="round"/>'
                   % (y, 70 + k * 6, 92 + k * 6, y, 70 + k * 6, 92 + k * 6) for k, y in enumerate(range(52, 180, 26)))
    return svg('<rect x="30" y="18" width="280" height="214" rx="16" fill="#1E1A2B"/>'
               '<rect x="163" y="30" width="14" height="190" rx="6" fill="#fff" fill-opacity=".7"/>' + ribs +
               '<ellipse cx="190" cy="198" rx="58" ry="14" fill="#fff" fill-opacity=".18"/>')


def g_triviosis():
    b = [bar(40, 22, 260, 14, "#CFC6DE"), bar(40, 46, 180, 14, "#CFC6DE")]
    for i, L in enumerate("ABCD"):
        y = 78 + i * 40
        ok = i == 2
        b.append('<rect x="40" y="%d" width="260" height="32" rx="16" fill="%s" stroke="%s" stroke-width="3"/>' % (y, "#DDF3E8" if ok else "#fff", GRN if ok else LINE))
        b.append('<text x="60" y="%d" font-family="Poppins" font-weight="600" font-size="16" fill="%s">%s</text>' % (y + 22, INK, L))
        b.append(bar(86, y + 10, 120 + (i * 37) % 70, 12))
    return svg("".join(b))


def g_comorbix():
    return svg(tiles(["yyyy", "....", "....", "...."], 48, 8, {"y": YEL}, r=10))


def g_linkase():
    b = []
    for i in range(4):
        y = 18 + i * 56
        b.append('<rect x="70" y="%d" width="200" height="40" rx="20" fill="%s" stroke="%s" stroke-width="3"/>' % (y, "#DCD3F0" if i == 0 else "#fff", PUR if i == 0 else LINE))
        b.append(bar(110, y + 14, 120, 12, "#CFC6DE" if i == 0 else "#E4DEEC"))
        if i < 3:
            b.append('<rect x="160" y="%d" width="20" height="26" rx="10" fill="none" stroke="%s" stroke-width="4"/>' % (y + 35, PUR))
    return svg("".join(b))


def g_zebritis():
    b = []
    for i, (pts, c) in enumerate((("1", GRY), ("10", "#7FB7E8"), ("20", "#C69CF0"))):
        y = 30 + i * 66
        b.append('<rect x="34" y="%d" width="210" height="46" rx="23" fill="#fff" stroke="%s" stroke-width="3"/>' % (y, LINE))
        b.append(bar(58, y + 17, 140 - i * 20, 12))
        b.append('<circle cx="282" cy="%d" r="24" fill="%s"/><text x="282" y="%d" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="17" fill="#fff">%s</text>' % (y + 23, c, y + 29, pts))
    return svg("".join(b))


def g_gridectomy():
    s = 42
    return svg(grid_lines(5, s, 65, 20, black=[(0, 0), (0, 4), (4, 0), (4, 4)], nums=[(0, 1, "1"), (0, 2, "2"), (0, 3, "3"), (1, 0, "4"), (2, 0, "5")]))


def g_sudokrine():
    s = 36
    letters = {(0, 1): "A", (1, 4): "E", (2, 2): "O", (3, 0): "N", (4, 5): "R", (5, 3): "T", (2, 5): "S", (4, 1): "I"}
    b = [grid_lines(6, s, 62, 17, thick=(2, 3))]
    for (i, j), t in letters.items():
        b.append('<text x="%g" y="%g" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="20" fill="%s">%s</text>' % (62 + j * s + s / 2, 17 + i * s + 26, PUR, t))
    return svg("".join(b))


def g_suturix():
    rows = ["QXBKZJ", "VWPHGF", "KMQZXB", "JTLCYW", "FHVKQD", "BZXJPM"]
    s = 36
    x0, y0 = 62, 17
    b = ['<rect x="%d" y="%d" width="%d" height="%d" rx="14" fill="#fff" stroke="%s" stroke-width="3"/>' % (x0 - 6, y0 - 6, 6 * s + 12, 6 * s + 12, LINE),
         '<path d="M%g %g L%g %g" stroke="%s" stroke-opacity=".45" stroke-width="30" stroke-linecap="round"/>' % (x0 + s / 2, y0 + s / 2, x0 + 3.5 * s, y0 + 3.5 * s, PNK),
         '<path d="M%g %g H%g" stroke="%s" stroke-opacity=".5" stroke-width="30" stroke-linecap="round"/>' % (x0 + 1.5 * s, y0 + 5.5 * s, x0 + 4.5 * s, "#9ED9C2")]
    for i, r in enumerate(rows):
        for j, ch in enumerate(r):
            b.append('<text x="%g" y="%g" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="18" fill="%s">%s</text>' % (x0 + j * s + s / 2, y0 + i * s + 25, INK, ch))
    return svg("".join(b))


def hexagon(cx, cy, r, fill, stroke):
    import math
    pts = " ".join("%.1f,%.1f" % (cx + r * math.cos(math.radians(60 * k)), cy + r * math.sin(math.radians(60 * k))) for k in range(6))
    return '<polygon points="%s" fill="%s" stroke="%s" stroke-width="3" stroke-linejoin="round"/>' % (pts, fill, stroke)


def g_morphemia():
    import math
    b = [hexagon(170, 125, 38, YEL, "#D9A52E")]
    for k in range(6):
        a = math.radians(30 + 60 * k)
        b.append(hexagon(170 + 70 * math.cos(a), 125 + 70 * math.sin(a), 38, "#fff", LINE))
    return svg("".join(b))


def ecg_paper(x, y, w, h):
    small = "".join('<path d="M%g %gV%g" stroke="#F3B9C6" stroke-width="%s"/>' % (x + k * 12, y, y + h, 2 if k % 5 == 0 else .8) for k in range(int(w / 12) + 1))
    small += "".join('<path d="M%g %gH%g" stroke="#F3B9C6" stroke-width="%s"/>' % (x, y + k * 12, x + w, 2 if k % 5 == 0 else .8) for k in range(int(h / 12) + 1))
    return '<rect x="%g" y="%g" width="%g" height="%g" fill="#FFF4F6"/>%s' % (x, y, w, h, small)


def g_arrhythmix():
    return svg('<defs><clipPath id="ep"><rect x="20" y="40" width="300" height="168" rx="12"/></clipPath></defs><g clip-path="url(#ep)">'
               + ecg_paper(20, 40, 300, 168) + '<path d="%s" fill="none" stroke="%s" stroke-width="4" stroke-linejoin="round"/></g>'
               % (ecg_path(20, 140, 4, 100, 1.0), INK) + '<rect x="20" y="40" width="300" height="168" rx="12" fill="none" stroke="%s" stroke-width="3"/>' % LINE)


def g_ecgquiz():
    b = ['<defs><clipPath id="eq"><rect x="20" y="16" width="300" height="218" rx="12"/></clipPath></defs><g clip-path="url(#eq)">', ecg_paper(20, 16, 300, 218)]
    for i, (beats, amp) in enumerate(((4, .55), (5, .5), (3, .6))):
        b.append('<path d="%s" fill="none" stroke="%s" stroke-width="3" stroke-linejoin="round"/>' % (ecg_path(20, 64 + i * 66, beats, 80 - beats * 6, amp), INK))
    b.append('</g><rect x="20" y="16" width="300" height="218" rx="12" fill="none" stroke="%s" stroke-width="3"/>' % LINE)
    return svg("".join(b))


BODY = ('<g fill="#fff" stroke="%s" stroke-width="4" stroke-linejoin="round">'
        '<circle cx="120" cy="40" r="22"/>'
        '<path d="M92 70h56q14 0 16 16l10 70q1 8-7 9q-7 1-9-7l-8-52v138q0 9-10 9q-9 0-10-9l-4-70l-4 70q-1 9-10 9q-10 0-10-9v-138l-8 52q-2 8-9 7q-8-1-7-9l10-70q2-16 16-16z"/></g>') % INK


def g_anatomegaly():
    return svg('<g transform="translate(10 4)">' + BODY + '</g>'
               '<circle cx="152" cy="104" r="11" fill="#F4A6C0" stroke="%s" stroke-width="3"/>'
               '<path d="M162 104H226" stroke="%s" stroke-width="3"/>'
               '<rect x="226" y="84" width="84" height="40" rx="12" fill="%s"/><text x="268" y="112" text-anchor="middle" font-family="Lora" font-weight="700" font-size="24" fill="#fff">?</text>' % (INK, INK, PUR))


def g_anatomyquiz():
    b = ['<g transform="translate(-6 4)">' + BODY + '</g>']
    for (x, y, ty) in ((134, 44, 30), (150, 112, 102), (128, 196, 174)):
        b.append('<circle cx="%d" cy="%d" r="8" fill="%s" stroke="%s" stroke-width="3"/>' % (x, y, PNK, INK))
        b.append('<path d="M%d %d L210 %d" stroke="%s" stroke-width="2.5"/>' % (x + 8, y, ty + 14, INK))
        b.append('<rect x="210" y="%d" width="100" height="28" rx="10" fill="#fff" stroke="%s" stroke-width="3"/>' % (ty, LINE))
        b.append(bar(224, ty + 8, 60, 12))
    return svg("".join(b))


def g_sensitosis():
    dots = []
    for i in range(30):
        r, c = divmod(i, 10)
        col = GRN if i in (0, 1, 2, 3, 4, 5, 10, 11, 12, 20, 21) else ("#E0566B" if i in (6, 13) else GRY)
        dots.append('<circle cx="%d" cy="%d" r="9" fill="%s"/>' % (62 + c * 24, 160 + r * 24, col))
    return svg('<rect x="40" y="62" width="260" height="14" rx="7" fill="%s"/><rect x="40" y="62" width="180" height="14" rx="7" fill="%s"/>'
               '<circle cx="220" cy="69" r="17" fill="#fff" stroke="%s" stroke-width="5"/>'
               '<rect x="186" y="10" width="68" height="34" rx="10" fill="%s"/><text x="220" y="34" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="17" fill="#fff">?%%</text>'
               % (LIL, "#C9B8EA", PUR, PUR) + "".join(dots))


def g_cryptoplexy():
    s = 30
    black = [(i, j) for i in range(7) for j in range(7) if i % 2 and j % 2]
    return svg(grid_lines(7, s, 65, 20, black=black, nums=[(0, 0, "1"), (0, 2, "2"), (0, 4, "3"), (0, 6, "4"), (2, 0, "5"), (4, 0, "6")]))


def g_grandrounds():
    return svg('<rect x="30" y="18" width="280" height="214" rx="16" fill="#fff" stroke="%s" stroke-width="3"/>' % LINE
               + '<rect x="52" y="38" width="64" height="28" rx="14" fill="%s"/>' % PUR + bar(66, 47, 36, 10, "#fff")
               + bar(52, 86, 236, 14, "#CFC6DE") + bar(52, 110, 190, 14, "#CFC6DE") + bar(52, 134, 120, 14, "#CFC6DE")
               + '<rect x="52" y="168" width="236" height="42" rx="12" fill="#FAF7F2" stroke="%s" stroke-width="3"/>' % PUR
               + '<path d="M70 178v22" stroke="%s" stroke-width="3"/>' % INK)


def g_stackulus():
    blocks = [(70, 186, 66, PNK), (138, 186, 66, "#E0566B"), (206, 186, 66, "#B5764A"),
              (70, 140, 100, "#9ED9C2"), (172, 140, 66, YEL), (104, 94, 66, "#C9B8EA")]
    b = ['<path d="M60 20V232H282V20" fill="none" stroke="%s" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' % INK]
    for x, y, w, c in blocks:
        b.append('<rect x="%d" y="%d" width="%d" height="42" rx="16" fill="%s" stroke="%s" stroke-width="3"/>' % (x, y, w, c, INK))
    b.append('<rect x="190" y="30" width="66" height="42" rx="16" fill="#E0566B" stroke="%s" stroke-width="3"/>' % INK)
    b.append('<path d="M223 80v12M213 84l10 10l10-10" fill="none" stroke="%s" stroke-width="3" stroke-linecap="round"/>' % PUR)
    return svg("".join(b))


def g_mergeon():
    b = []
    xs, rs, cs = (34, 88, 160, 254), (10, 18, 28, 40), (GRN, YEL, "#E0566B", PNK)
    for k in range(4):
        b.append('<circle cx="%d" cy="125" r="%d" fill="%s" stroke="%s" stroke-width="3"/>' % (xs[k], rs[k], cs[k], INK))
        if k < 3:
            a = xs[k] + rs[k] + 8
            b.append('<path d="M%d 125h%d m-8 -7l8 7l-8 7" fill="none" stroke="%s" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' % (a, xs[k + 1] - rs[k + 1] - 8 - a, PUR))
    b.append('<circle cx="254" cy="125" r="40" fill="none"/><path d="M236 116q8 -10 16 0q8 -10 16 0M236 134q8 -8 16 0q8 -8 16 0" fill="none" stroke="#D4789A" stroke-width="3"/>')
    return svg("".join(b))


def g_basil():
    return svg('<rect x="20" y="150" width="300" height="20" rx="6" fill="#C9B8EA" stroke="%s" stroke-width="3"/>'
               '<rect x="34" y="170" width="272" height="64" fill="#E8E2F0" stroke="%s" stroke-width="3"/>'
               '<path d="M60 108h44v34q0 10-10 10h-24q-10 0-10-10z" fill="#fff" stroke="%s" stroke-width="3"/><path d="M104 116q16 0 16 12t-16 12" fill="none" stroke="%s" stroke-width="3"/>'
               '<path d="M150 150l8-30h32l8 30z" fill="#E0566B" stroke="%s" stroke-width="3"/><path d="M174 120q-12-24 4-36M174 120q14-20 26-14" fill="none" stroke="%s" stroke-width="4" stroke-linecap="round"/>'
               '<g transform="rotate(24 270 80)"><rect x="250" y="60" width="40" height="44" rx="6" fill="%s" stroke="%s" stroke-width="3"/></g>'
               '<path d="M236 64q-10 6-14 18M228 48q-14 4-22 14" fill="none" stroke="%s" stroke-width="3" stroke-linecap="round"/>'
               % (INK, INK, INK, INK, INK, GRN, YEL, INK, PUR))


def g_xray():
    return svg('<rect x="30" y="18" width="280" height="214" rx="16" fill="#1E1A2B"/>'
               '<g fill="#fff" fill-opacity=".72"><path d="M110 40q-20 -4 -22 14q0 14 18 16l90 100q-6 18 8 24q16 2 18 -14q18 2 20 -14q0 -18 -20 -16l-90 -100q4 -16 -10 -18q-12 0 -12 8z"/></g>'
               '<circle cx="260" cy="60" r="18" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="4"/>')


# ---------- small drawings for hub tiles (viewBox 0 0 120 120) ----------
def t(body):
    return svg(body, "0 0 120 120")


T_CAPSULE = t('<g transform="rotate(-35 60 60)"><rect x="20" y="42" width="80" height="36" rx="18" fill="#fff" stroke="%s" stroke-width="4"/>'
              '<path d="M60 42h22a18 18 0 0 1 0 36h-22z" fill="%s" stroke="%s" stroke-width="4"/></g>' % (INK, "#E0566B", INK))
T_BLISTER = t('<rect x="22" y="18" width="76" height="84" rx="12" fill="#E4DEEC" stroke="%s" stroke-width="4"/>' % INK
              + "".join('<circle cx="%d" cy="%d" r="10" fill="#fff" stroke="%s" stroke-width="3"/>' % (44 + 32 * (k % 2), 38 + 22 * (k // 2), INK) for k in range(6)))
T_CALC = t('<rect x="28" y="14" width="64" height="92" rx="12" fill="#fff" stroke="%s" stroke-width="4"/><rect x="38" y="24" width="44" height="20" rx="4" fill="%s"/>' % (INK, "#9ED9C2")
           + "".join('<rect x="%d" y="%d" width="12" height="10" rx="3" fill="%s"/>' % (38 + 16 * (k % 3), 54 + 14 * (k // 3), PUR if k == 11 else GRY) for k in range(12)))
T_CAL = t('<rect x="18" y="24" width="84" height="76" rx="12" fill="#fff" stroke="%s" stroke-width="4"/><path d="M18 46h84" stroke="%s" stroke-width="4"/>'
          '<rect x="20" y="26" width="80" height="18" rx="9" fill="#E0566B"/><path d="M40 16v16M80 16v16" stroke="%s" stroke-width="5" stroke-linecap="round"/>' % (INK, INK, INK)
          + "".join('<circle cx="%d" cy="%d" r="4" fill="%s"/>' % (34 + 17 * (k % 4), 60 + 16 * (k // 4), PUR if k == 6 else GRY) for k in range(12)))
T_SCALES = t('<path d="M60 22v74M36 100h48" stroke="%s" stroke-width="5" stroke-linecap="round"/><path d="M22 36h76" stroke="%s" stroke-width="5" stroke-linecap="round"/>'
             '<path d="M22 36l-12 30h24zM98 36l-12 30h24z" fill="none" stroke="%s" stroke-width="3" stroke-linejoin="round"/>'
             '<path d="M8 66a14 8 0 0 0 28 0z" fill="%s" stroke="%s" stroke-width="3"/><path d="M84 66a14 8 0 0 0 28 0z" fill="%s" stroke="%s" stroke-width="3"/>' % (INK, INK, INK, PNK, INK, "#9ED9C2", INK))
T_VS = t('<rect x="10" y="38" width="44" height="44" rx="14" fill="%s" stroke="%s" stroke-width="4"/><rect x="66" y="38" width="44" height="44" rx="14" fill="%s" stroke="%s" stroke-width="4"/>'
         '<text x="32" y="69" text-anchor="middle" font-family="Lora" font-weight="700" font-size="24" fill="%s">A</text><text x="88" y="69" text-anchor="middle" font-family="Lora" font-weight="700" font-size="24" fill="%s">B</text>'
         % (PNK, INK, "#9ED9C2", INK, INK, INK))
T_DUMBBELL = t('<g transform="rotate(-30 60 60)"><rect x="34" y="55" width="52" height="10" rx="5" fill="%s"/><rect x="16" y="38" width="16" height="44" rx="6" fill="%s" stroke="%s" stroke-width="4"/>'
               '<rect x="88" y="38" width="16" height="44" rx="6" fill="%s" stroke="%s" stroke-width="4"/></g>' % (INK, PUR, INK, PUR, INK))
T_STRETCH = t('<circle cx="60" cy="22" r="10" fill="%s"/><path d="M60 34v34M60 68l-20 32M60 68l22 30M60 44l-28-18M60 44l28-18" fill="none" stroke="%s" stroke-width="7" stroke-linecap="round"/>'
              '<path d="M14 104h92" stroke="%s" stroke-width="5" stroke-linecap="round"/>' % (PUR, PUR, "#9ED9C2"))
T_ENVELOPE = t('<rect x="14" y="30" width="92" height="64" rx="10" fill="#fff" stroke="%s" stroke-width="5"/><path d="M18 36l42 32l42-32" fill="none" stroke="%s" stroke-width="5" stroke-linejoin="round"/>'
               '<path d="M100 18l4 9l9 1l-7 6l2 9l-8-5l-8 5l2-9l-7-6l9-1z" fill="%s"/>' % (INK, INK, YEL))
T_NEWS = t('<rect x="18" y="16" width="84" height="88" rx="10" fill="#fff" stroke="%s" stroke-width="4"/><rect x="30" y="28" width="60" height="12" rx="4" fill="%s"/>' % (INK, PUR)
           + bar(30, 50, 26, 26, PNK).replace('rx="13"', 'rx="6"') + bar(62, 52, 28, 6) + bar(62, 64, 28, 6) + bar(30, 84, 60, 6) + bar(30, 94, 46, 6))
T_RECEIPT = t('<path d="M26 12h68v96l-11-7l-11 7l-12-7l-12 7l-11-7l-11 7z" fill="#fff" stroke="%s" stroke-width="4" stroke-linejoin="round"/>' % INK
              + '<text x="60" y="38" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="16" fill="%s">MBS</text>' % PUR
              + bar(38, 50, 44, 7) + bar(38, 62, 30, 7) + bar(38, 74, 40, 7) + '<path d="M38 88h44" stroke="%s" stroke-width="3"/>' % INK)
T_DOC = t('<rect x="22" y="12" width="76" height="96" rx="10" fill="#fff" stroke="%s" stroke-width="4"/><path d="M60 30v24M48 42h24" stroke="#E0566B" stroke-width="7" stroke-linecap="round"/>' % INK
          + bar(36, 68, 48, 7) + bar(36, 80, 36, 7) + bar(36, 92, 42, 7))
T_TUBE = t('<g transform="rotate(20 60 60)"><rect x="46" y="10" width="28" height="12" rx="4" fill="%s"/><path d="M48 22h24v70a12 12 0 0 1-24 0z" fill="#fff" stroke="%s" stroke-width="4"/>'
           '<path d="M50 56h20v36a10 10 0 0 1-20 0z" fill="#E0566B"/></g>' % (PUR, INK))


def m(name):
    """A mascot or drawing under assets/ as a data URI."""
    return og_cards.data_uri(name)


# ---------- the cards ----------
GAME_FOOT = "Free · new puzzle daily"


def game(id_, title, pill, line, mascots, glimpse, path, file=None, foot=GAME_FOOT, extra_urls=()):
    urls = ["/%s/" % path] + list(extra_urls)
    return {"id": id_, "kind": "game", "file": file or "assets/og/%s.png" % id_, "urls": urls, "pill": pill,
            "title": title, "line": line, "foot": foot, "pillurl": "maladywise.com/" + path, "mascots": mascots, "glimpse": glimpse}


def hub(id_, path, title, pill, line, tiles_, cols=3, file=None, foot="", big=False, urls=None):
    return {"id": id_, "kind": "hub", "file": file or "assets/og/key/%s.png" % id_, "urls": urls or [path], "pill": pill,
            "title": title, "line": line, "foot": foot, "pillurl": "maladywise.com" + (path.rstrip("/") if path != "/" else ""),
            "tiles": tiles_, "cols": cols, "big": big}


def archives(path):
    return ["/%s/archive/" % path]


CARDS = [
    hub("home", "/", "18 free daily medical puzzles", "Think like a doctor",
        "Diagnose, read the ECG, name the scan, crack the cryptic.",
        ["mascots/dx.svg", "mascots/wordemic.svg", "mascots/comorbix.svg", "mascots/opacitis.svg?v=2", "mascots/arrhythmix.svg",
         "mascots/triviosis.svg", "mascots/cryptogenic.svg", "mascots/panelysis.svg", "mascots/zebritis.svg"],
        file="assets/share.png", foot="Plus a Normie mode for everyone else", big=True,
        urls=["/", "/about/", "/contact/", "/privacy/", "/disclaimer/", "/rare-conditions/"]),
    hub("medical-games", "/medical-games/", "Medical games and quizzes", "All the puzzles",
        "Daily puzzles, practice quizzes and arcade games.",
        ["mascots/dx.svg", "mascots/wordemic.svg", "mascots/triviosis.svg", "mascots/opacitis.svg?v=2", "mascots/arrhythmix.svg", "mascots/gridectomy.svg"],
        foot="All free, no sign-up"),
    hub("arcade", "/arcade/", "Arcade games", "Bonus arcade",
        "Stack organs, merge a brain, wreck the kitchen bench.",
        ["mascots/basil.svg", "mascots/clover.svg", "mascots/stackulus.svg", "mascots/mergeon.svg"], cols=2, foot="Free · play any time"),
    hub("normie", "/normie/", "Normie mode", "No medical degree needed",
        "Daily trivia, word games and a mini crossword for everyone.",
        ["mascots/normie/triviosis.svg", "mascots/normie/wordemic.svg", "mascots/normie/gridectomy.svg",
         "mascots/normie/comorbix.svg", "mascots/normie/norm.svg", "mascots/normie/linkase.svg"], foot=GAME_FOOT),
    hub("blood-tests", "/blood-tests/", "Blood test results", "Blood tests",
        "What high and low results mean, in plain English.",
        ["days/blood-drop.svg", "mascots/panelysis.svg", "svg:T_TUBE", "days/dex-lab.svg", "days/locum-blood.svg", "days/bea-syringe.svg"]),
    hub("conditions", "/conditions/", "Conditions A–Z", "Fact sheets",
        "Plain-English fact sheets, overseen by an Australian GP.",
        ["days/stethoscope.svg", "days/heart-calm.svg", "days/brain.svg", "days/lupus-butterfly.svg", "days/tess-bone.svg", "svg:T_DOC"]),
    hub("weird", "/weird/", "Weird and wonderful", "Odd corners",
        "Word of the week, strange history and medicine's oddest trivia.",
        ["days/zebra-rare.svg", "mascots/zebritis.svg", "days/owl.svg", "mascots/triviosis.svg", "days/star.svg", "mascots/glimpsis.svg"],
        foot="Free · no sign-up"),
    hub("words", "/words/", "Medical word of the week", "Word of the week",
        "Weird, wonderful medical words and where they came from.",
        ["mascots/wordemic.svg", "mascots/morphemia.svg", "days/owl.svg", "mascots/linkase.svg", "days/star.svg", "mascots/triviosis.svg"],
        foot="Free · new word every week"),
    hub("specialty-quiz", "/medical-specialty-quiz/", "Which medical specialty suits you?", "Just for fun",
        "14 quick scenarios. Matched to 1 of 14 specialties.",
        ["days/stethoscope.svg", "mascots/arrhythmix.svg", "mascots/opacitis.svg?v=2", "mascots/dx.svg", "days/brain.svg", "mascots/glimpsis.svg"],
        foot="Free · about 3 minutes"),
    hub("terminology-quiz", "/medical-terminology-quiz/", "Medical terminology quiz", "Practice quiz",
        "Prefixes, suffixes and roots, with every answer explained.",
        ["mascots/morphemia.svg", "mascots/wordemic.svg", "mascots/linkase.svg", "days/owl.svg", "mascots/triviosis.svg", "days/star.svg"],
        foot="Free · no sign-up"),
    hub("medicines", "/medicines/", "Medicines explained", "Medicines",
        "What they do, common side effects and what to ask.",
        ["svg:T_CAPSULE", "days/cadi-bowl.svg", "days/cipher-inhaler.svg", "svg:T_BLISTER", "days/syringe.svg", "days/bea-syringe.svg"]),
    hub("tools", "/tools/", "Free health tools", "Tools and calculators",
        "BMI, eGFR, due dates, CHA₂DS₂-VASc and more.",
        ["svg:T_CALC", "days/octavia-tools.svg", "svg:T_CAL", "mascots/sensitosis.svg", "days/stethoscope.svg", "days/heart-calm.svg"]),
    hub("compare", "/compare/", "Side by side", "Compare",
        "Medicines and symptoms, compared in plain English.",
        ["svg:T_SCALES", "svg:T_VS", "svg:T_CAPSULE", "mascots/sensitosis.svg"], cols=2),
    hub("exercises", "/exercises/", "Exercise handouts", "Rehab plans",
        "Printable home exercise plans with clear diagrams.",
        ["days/tess-bone.svg", "svg:T_STRETCH", "svg:T_DUMBBELL", "days/octavia-ot.svg"], cols=2, foot="Free · print on one page"),
    hub("days", "/days/", "Health Calendar", "Calendar",
        "Every health awareness day of the year, in one place.",
        ["svg:T_CAL", "days/ribbon-pink.svg", "days/daffodil.svg", "days/ribbon-teal.svg", "days/heart-rainbow.svg", "days/star.svg"]),
    hub("zebra-mail", "/zebra-mail/", "Zebra Mail", "The Weekly Dose",
        "Health news, fast and funny, with puzzles at the end.",
        ["svg:T_ENVELOPE", "mascots/zebritis.svg", "svg:T_NEWS", "days/zebra-rare.svg"], cols=2, file="assets/og/zebra-mail.png",
        foot="Free · every Friday", urls=["/zebra-mail/", "/zebra-mail/2026-10-30/", "/zebra-mail/2026-11-06/"]),
    hub("mbs-billing", "/mbs-billing/", "GP MBS billing guide", "For GPs",
        "Items, fees and rules for Australian general practice.",
        ["svg:T_RECEIPT", "days/stethoscope.svg", "svg:T_CALC", "mascots/sensitosis.svg"], cols=2),
    game("anatomy-quiz", "Anatomy quiz", "Practice quiz", "Brain, bones, muscles and more, with diagrams.",
         ["days/tess-bone.svg"], g_anatomyquiz(), "anatomy-quiz", file="assets/og/key/anatomy-quiz.png", foot="Free · answers explained",
         extra_urls=["/anatomy-quiz/%s/" % s for s in ("bones", "brain", "head-and-neck", "heart", "lower-limb", "muscles", "skull", "upper-limb")]),
    game("ecg-quiz", "ECG quiz", "Practice quiz", "Rhythm strips and a 12-lead, from SVT to STEMI.",
         ["mascots/arrhythmix.svg"], g_ecgquiz(), "ecg-quiz", file="assets/og/key/ecg-quiz.png", foot="Free · answers explained"),
    game("x-ray-quiz", "X-ray quiz", "Practice quiz", "Chest, abdominal and bone X-rays, easy to hard.",
         ["mascots/opacitis.svg?v=2"], g_xray(), "x-ray-quiz", file="assets/og/key/x-ray-quiz.png", foot="Free · answers explained"),
    game("dx", "Dxtective", "Diagnosis game", "Six clues. One diagnosis. How few do you need?", ["mascots/dx.svg"], g_dx(), "dxtective", extra_urls=archives("dxtective")),
    game("wordemic", "Wordemic", "Word game", "Daily medical Wordle-style word game.", ["mascots/wordemic.svg"], g_wordemic(), "wordemic", extra_urls=archives("wordemic")),
    game("panelysis", "Panelysis", "Blood test game", "Read the blood results. Name the diagnosis.", ["mascots/panelysis.svg"], g_panelysis(), "panelysis", extra_urls=archives("panelysis")),
    game("glimpsis", "Glimpsis", "Photo quiz", "One real clinical photo. Spot the sign.", ["mascots/glimpsis.svg"], g_glimpsis(), "glimpsis", extra_urls=archives("glimpsis")),
    game("opacitis", "Opacitis", "Scan quiz", "One real scan. Name it in three tries.", ["mascots/opacitis.svg?v=2"], g_opacitis(), "opacitis", extra_urls=archives("opacitis")),
    game("triviosis", "Triviosis", "Daily quiz", "Ten medical trivia questions on one theme.", ["mascots/triviosis.svg"], g_triviosis(), "triviosis", extra_urls=archives("triviosis")),
    game("comorbix", "Comorbix", "Word groups", "Sixteen medical terms. Four hidden groups.", ["mascots/comorbix.svg"], g_comorbix(), "comorbix", extra_urls=archives("comorbix")),
    game("linkase", "Linkase", "Word chain", "Each word links to the next. Fill the chain.", ["mascots/linkase.svg"], g_linkase(), "linkase", extra_urls=archives("linkase")),
    game("zebritis", "Zebritis", "Rarest answer wins", "Name a correct answer. Rare zebras score big.", ["mascots/zebritis.svg"], g_zebritis(), "zebritis", extra_urls=archives("zebritis")),
    game("gridectomy", "Gridectomy", "Mini crossword", "A five-by-five medical mini crossword.", ["mascots/gridectomy.svg"], g_gridectomy(), "gridectomy", extra_urls=archives("gridectomy")),
    game("sudokrine", "Sudokrine", "Word sudoku", "Medical sudoku with a hidden word.", ["mascots/sudokrine.svg"], g_sudokrine(), "sudokrine", extra_urls=archives("sudokrine")),
    game("suturix", "Suturix", "Word search", "Find the theme words and the spangram.", ["mascots/suturix.svg"], g_suturix(), "suturix", extra_urls=archives("suturix")),
    game("morphemia", "Morphemia", "Spelling bee", "Seven letters. Medical words score double.", ["mascots/morphemia.svg"], g_morphemia(), "morphemia", extra_urls=archives("morphemia")),
    game("arrhythmix", "Arrhythmix", "ECG game", "Read the ECG. Name the rhythm in three tries.", ["mascots/arrhythmix.svg"], g_arrhythmix(), "arrhythmix",
         foot="Free · new ECG every Monday and Thursday", extra_urls=archives("arrhythmix")),
    game("anatomegaly", "Anatomegaly", "Anatomy game", "Five body parts. Name every one.", ["mascots/labelosis.svg"], g_anatomegaly(), "anatomegaly", extra_urls=archives("anatomegaly")),
    game("sensitosis", "Sensitosis", "Tests and signs", "How good are real medical tests? Slide your guess.", ["mascots/sensitosis.svg"], g_sensitosis(), "sensitosis", extra_urls=archives("sensitosis")),
    game("cryptoplexy", "Cryptoplexy", "Cryptic crossword", "A medical cryptic, with every clue explained.", ["mascots/cryptogenic.svg"], g_cryptoplexy(), "cryptoplexy",
         foot="Free · new crossword every Saturday", extra_urls=archives("cryptoplexy")),
    game("grandrounds", "Grand Rounds", "Hard trivia", "Twenty hard medical questions. No multiple choice.", ["mascots/grandrounds.svg"], g_grandrounds(), "grand-rounds",
         foot="Free · new quiz every Sunday", extra_urls=archives("grand-rounds")),
    game("stackulus", "Stackulus", "Arcade game", "Organs are falling. Stack them, clear the ward.", ["mascots/stackulus.svg"], g_stackulus(), "stackulus",
         foot="Free · daily challenge and world board"),
    game("mergeon", "Mergeon", "Arcade game", "Drop, match and merge from microbe to brain.", ["mascots/mergeon.svg"], g_mergeon(), "mergeon",
         foot="Free · same drops for everyone, every day"),
    game("basil", "Basil + Clover", "Cat arcade game", "Kick it off the bench. Survive the vet.", ["mascots/basil.svg", "mascots/clover.svg"], g_basil(), "basil-clover",
         foot="Free · play any time"),
]
BY_URL = {u: c for c in CARDS for u in c["urls"]}
URLS = set(BY_URL)

# ---------- template ----------
TEMPLATE = """<!doctype html><html><head><meta charset="utf-8"><style>
%(fonts)s
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;overflow:hidden;background:#F8F5EF;font-family:Poppins,system-ui,sans-serif;color:#2A2140;position:relative}
.circle{position:absolute;right:-120px;top:-60px;width:720px;height:720px;border-radius:50%%;background:#E8E2F0}
.l{position:absolute;left:80px;top:58px;bottom:58px;width:%(lw)dpx;display:flex;flex-direction:column}
.brand{font:600 20px Poppins;letter-spacing:4px;color:#5B4C99;text-transform:uppercase}
.mid{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:16px;padding:14px 0}
.pill{align-self:flex-start;border:2px solid #D8CFE8;border-radius:30px;padding:8px 22px;color:#4A3A8A;font:600 20px Poppins;letter-spacing:2px;background:#fff;text-transform:uppercase;white-space:nowrap}
h1{font:700 %(ts)dpx/1.05 Lora,Georgia,serif;color:#2A2140;text-wrap:balance;overflow-wrap:normal}
.stat{font:600 30px/1.32 Poppins;color:#4A3A8A;text-wrap:balance}
.foot{font:500 22px Poppins;color:#6B5A93}
.url{align-self:flex-start;background:#2A2140;color:#fff;border-radius:40px;padding:14px 30px;font:600 26px Poppins;white-space:nowrap}
.panel{position:absolute;right:118px;top:92px;width:380px;height:290px;border-radius:30px;background:#fff;border:2px solid #D8CFE8;box-shadow:0 10px 30px rgba(74,58,138,.10);padding:20px}
.panel svg{width:100%%;height:100%%;display:block}
.masc{position:absolute;right:34px;bottom:34px;display:flex;align-items:flex-end;gap:0}
.masc img{width:260px;height:260px;display:block}
.masc.two img{width:220px;height:220px;margin-left:-40px}
.grid{position:absolute;right:%(gr)dpx;top:50%%;transform:translateY(-50%%);display:grid;grid-template-columns:repeat(%(cols)d,%(tile)dpx);gap:%(gap)dpx}
.tile{width:%(tile)dpx;height:%(tile)dpx;border-radius:28px;background:#fff;border:2px solid #D8CFE8;display:grid;place-items:center}
.tile img,.tile svg{width:%(img)dpx;height:%(img)dpx;display:block}
</style></head><body>
<div class="circle"></div>%(right)s
<div class="l"><div class="brand">Malady Wise</div>
<div class="mid" id="mid"><div class="pill">%(pill)s</div><h1 id="t">%(title)s</h1><div class="stat">%(line)s</div>%(foot)s</div>
<div class="url">%(pillurl)s</div></div>
</body></html>"""

FIT_JS = """() => {
  const m = document.getElementById('mid'), t = document.getElementById('t'), s = document.querySelector('.stat');
  const l = document.querySelector('.l'), u = document.querySelector('.url');
  const fits = () => m.scrollHeight <= m.clientHeight + 1 && t.scrollWidth <= t.clientWidth + 1 && s.scrollWidth <= s.clientWidth + 1 && u.scrollWidth <= l.clientWidth + 1;
  let ts = parseFloat(getComputedStyle(t).fontSize), ss = 30;
  while (!fits() && (ts > 52 || ss > 22)) {
    if (ts > 64 || ss <= 22) ts -= 2; else ss -= 1;
    t.style.fontSize = ts + 'px'; s.style.fontSize = ss + 'px';
  }
  // nothing on the left may run into the art on the right
  const art = document.querySelector('.panel,.grid'), r = art.getBoundingClientRect();
  const kids = [t, s, u, document.querySelector('.pill'), document.querySelector('.foot')].filter(Boolean);
  const clash = kids.some(k => { const b = k.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(k);
    const w = Math.max(...Array.from(range.getClientRects()).map(x => x.right)); return w > r.left - 12; });
  return fits() && !clash;
}"""


def tile_html(x):
    if x.startswith("svg:"):
        return '<div class="tile">%s</div>' % globals()[x[4:]]
    return '<div class="tile"><img src="%s" alt=""></div>' % m(x)


def card_html(c):
    e = html.escape
    nb = lambda s: re.sub(r"(\S+-\S+)", r'<span style="white-space:nowrap">\1</span>', e(s))
    v = {"fonts": og_cards.fonts(), "pill": e(c["pill"]), "title": nb(c["title"]), "line": nb(c["line"]),
         "foot": '<div class="foot">%s</div>' % e(c["foot"]) if c.get("foot") else "", "pillurl": e(c["pillurl"]),
         "cols": 3, "tile": 158, "img": 120, "gap": 16, "gr": 56, "ts": 88}
    if c["kind"] == "game":
        two = len(c["mascots"]) > 1
        right = '<div class="panel">%s</div><div class="masc%s">%s</div>' % (
            c["glimpse"], " two" if two else "", "".join('<img src="%s" alt="">' % m(x) for x in c["mascots"]))
        v.update(lw=600, ts=92)
    else:
        n = len(c["tiles"])
        cols = c["cols"]
        if c.get("big"):
            v.update(tile=164, img=132, gap=14, gr=40)
        elif cols == 2:
            v.update(tile=206, img=164, gap=18, gr=96)
        v["cols"] = cols
        right = '<div class="grid">%s</div>' % "".join(tile_html(x) for x in c["tiles"][: cols * ((n + cols - 1) // cols)])
        grid_w = cols * v["tile"] + (cols - 1) * v["gap"]
        v.update(lw=1200 - 80 - v["gr"] - grid_w - 40, ts=80 if c.get("big") else 76)
    v["right"] = right
    return TEMPLATE % v


def card_key(c):
    return hashlib.sha1(json.dumps([TEMPLATE_V, TEMPLATE, FIT_JS, card_html(c)], ensure_ascii=False).encode()).hexdigest()[:12]


def load_manifest():
    try:
        return json.load(open(MANIFEST, encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def render(todo, manifest):
    from playwright.sync_api import sync_playwright
    bad = []
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        page = b.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        for c in todo:
            page.set_content(card_html(c), wait_until="load")
            page.evaluate("() => document.fonts.ready.then(() => true)")
            page.wait_for_timeout(50)
            if not page.evaluate(FIT_JS):
                bad.append(c["id"])
            data = og_cards.squeeze(page.screenshot(type="png", clip={"x": 0, "y": 0, "width": W, "height": H}), MAX_BYTES)
            fp = os.path.join(ROOT, c["file"])
            os.makedirs(os.path.dirname(fp), exist_ok=True)
            open(fp, "wb").write(data)
            manifest[c["id"]] = {"file": c["file"], "key": card_key(c), "v": hashlib.md5(data).hexdigest()[:8], "title": c["title"]}
            print("key card %-14s %3d KB  %s" % (c["id"], len(data) // 1024, c["file"]))
        b.close()
    for i in bad:
        print("Warning: text doesn't fit (or runs into the art) on key card %s" % i, file=sys.stderr)


def img_url(c, manifest):
    return "%s/%s?v=%s" % (BASE, c["file"], manifest[c["id"]]["v"])


def alt_for(c):
    return "%s: %s Malady Wise" % (c["title"], c["line"])


def apply_meta(pages, idx, manifest):
    n = 0
    for u in sorted(idx):
        c = BY_URL.get(u)
        if not c or c["id"] not in manifest or not os.path.isfile(os.path.join(ROOT, c["file"])):
            continue
        src = pages[u]["src"]
        new = og_cards.write_tags(src, img_url(c, manifest), alt_for(c))
        if new != src:
            open(pages[u]["fp"], "w", encoding="utf-8").write(new)
            pages[u]["src"] = new
            n += 1
    return n


def update_meta(quiet=False):
    """For page generators: point rebuilt pages back at their key cards (no drawing)."""
    pages, idx, _, _ = static_nav.load()
    n = apply_meta(pages, idx, load_manifest())
    if not quiet:
        print("key_cards: share-card tags updated on %d page(s)" % n)
    return n


def main(argv):
    if "--html" in argv:
        want = argv[argv.index("--html") + 1]
        print(card_html([c for c in CARDS if c["id"] == want][0]))
        return 0
    manifest = load_manifest()
    if "--meta" not in argv:
        only = set(a for a in argv if not a.startswith("-"))
        todo = [c for c in CARDS if (not only or c["id"] in only) and
                ("--force" in argv or c["id"] not in manifest or manifest[c["id"]].get("key") != card_key(c)
                 or not os.path.isfile(os.path.join(ROOT, c["file"])))]
        if todo:
            render(todo, manifest)
        for k in [k for k in manifest if k not in {c["id"] for c in CARDS}]:
            del manifest[k]
        os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
        with open(MANIFEST, "w", encoding="utf-8") as f:
            json.dump(dict(sorted(manifest.items())), f, ensure_ascii=False, indent=0)
            f.write("\n")
        print("key_cards: %d card(s) drawn, %d in total" % (len(todo), len(manifest)))
    pages, idx, _, _ = static_nav.load()
    n = apply_meta(pages, idx, manifest)
    print("key_cards: tags updated on %d page(s)" % n)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
