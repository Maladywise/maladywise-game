#!/usr/bin/env python3
"""Eponymous signs pages: /signs/ hub and one page per sign, each with a simple original diagram.
Text comes from Nomulous (nomulous/signs.js + facts.js, our own words); accuracy figures from Sensitosis (sourced).
Run: python3 _scripts/signs_pages.py"""
import os, re, json, html, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/"
E = html.escape
TODAY = "24 November 2026"

def jsdata(path, var):
    out = subprocess.run(["node", "-e", "global.window={};require(%r);console.log(JSON.stringify(window.%s))" % (ROOT + path, var)], capture_output=True, text=True).stdout
    return json.loads(out)
NOM = {x[0]: x for x in jsdata("nomulous/signs.js", "NOMULOUS")}
FACT = jsdata("nomulous/facts.js", "NOMULOUS_FACTS")
SEN = json.load(open(ROOT + "sensitosis/tests.json", encoding="utf-8"))["tests"]
def key(n): return re.sub(r"[^a-z ]", " ", n.lower().replace("’s", "").replace("'s", "")).split()[0]
SENK = {key(v["test"]): v for v in SEN.values() if v.get("kind") == "sign"}

# ---------- drawing kit (viewBox 0 0 320 220) ----------
INK, SKIN, MARK, ARR = "#2B2340", "#F6E3D3", "#E8175D", "#4A3480"
def svg(body, label): return '<svg viewBox="0 0 320 252" role="img" aria-label="%s" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="252" rx="14" fill="#FBF8F3"/>%s</svg>' % (E(label), body)
def dot(x, y, r=9): return '<circle cx="%d" cy="%d" r="%d" fill="%s" stroke="#fff" stroke-width="2.5"/><circle cx="%d" cy="%d" r="%d" fill="none" stroke="%s" stroke-width="2" opacity=".45"><animate attributeName="r" values="%d;%d;%d" dur="1.6s" repeatCount="indefinite"/></circle>' % (x, y, r, MARK, x, y, r + 5, MARK, r + 3, r + 10, r + 3)
def arrow(x1, y1, x2, y2, col=ARR, w=4):
    import math
    a = math.atan2(y2 - y1, x2 - x1); h = 11
    p1 = (x2 - h * math.cos(a - 0.45), y2 - h * math.sin(a - 0.45)); p2 = (x2 - h * math.cos(a + 0.45), y2 - h * math.sin(a + 0.45))
    return '<path d="M%d %d L%d %d" stroke="%s" stroke-width="%d" stroke-linecap="round"/><path d="M%.1f %.1f L%d %d L%.1f %.1f Z" fill="%s"/>' % (x1, y1, x2 - 6 * math.cos(a), y2 - 6 * math.sin(a), col, w, p1[0], p1[1], x2, y2, p2[0], p2[1], col)
def label(x, y, t, anchor="middle", size=12, col=INK):
    # 26 Nov 2026: captions near the bottom move into their own band below the drawing (no overlap),
    # and every label gets a soft halo so it stays readable over lines.
    if y >= 196: y = 234 + round((y - 200) * 0.9)
    return '<text x="%d" y="%d" text-anchor="%s" font-family="Poppins,Arial,sans-serif" font-size="%d" font-weight="600" fill="%s" stroke="#FBF8F3" stroke-width="5" stroke-linejoin="round" paint-order="stroke">%s</text>' % (x, y, anchor, size, col, E(t))
def torso(extra=""):
    b = '<path d="M95 20 Q160 8 225 20 L240 120 Q250 175 228 205 L92 205 Q70 175 80 120 Z" fill="%s" stroke="%s" stroke-width="2.5"/>' % (SKIN, INK)
    b += '<path d="M100 70 Q160 88 220 70" fill="none" stroke="%s" stroke-width="1.5" opacity=".35"/>' % INK  # rib margin
    b += '<circle cx="160" cy="128" r="3.5" fill="%s"/>' % INK  # umbilicus
    b += '<path d="M160 28 V200 M88 128 H232" stroke="%s" stroke-width="1" stroke-dasharray="4 4" opacity=".3"/>' % INK
    return b + extra
def leg_side(extra=""):
    return ('<path d="M30 70 H200 Q220 70 228 90 L236 140 Q238 160 258 162 L298 166 Q306 172 298 180 L236 182 Q214 182 210 160 L200 110 H30 Z" fill="%s" stroke="%s" stroke-width="2.5"/>' % (SKIN, INK)) + extra
def hand(extra=""):
    b = '<path d="M120 210 L120 140 Q112 120 118 100 L122 50 Q126 40 134 50 L138 96 L142 36 Q147 26 153 36 L156 94 L162 40 Q167 30 173 40 L174 98 L182 54 Q187 46 192 56 L190 120 Q196 104 214 96 Q226 94 220 108 L196 150 Q186 172 186 210 Z" fill="%s" stroke="%s" stroke-width="2.5" stroke-linejoin="round"/>' % (SKIN, INK)
    return b + extra
def head_side(extra=""):
    b = '<path d="M150 30 Q230 26 240 100 Q244 130 232 150 L236 176 Q228 192 206 186 L196 205 H130 L134 170 Q96 160 92 110 Q90 40 150 30 Z" fill="%s" stroke="%s" stroke-width="2.5"/>' % (SKIN, INK)
    b += '<path d="M150 98 Q140 110 152 122 Q162 118 158 104" fill="#EBCFB8" stroke="%s" stroke-width="2"/>' % INK  # ear
    b += '<circle cx="214" cy="92" r="4" fill="%s"/>' % INK
    return b + extra
def foot_sole(extra=""):
    b = '<path d="M130 205 Q100 180 104 120 Q108 60 140 30 Q160 14 186 26 Q214 44 212 110 Q210 170 190 205 Z" fill="%s" stroke="%s" stroke-width="2.5"/>' % (SKIN, INK)
    for i, (x, y, r) in enumerate([(140, 24, 13), (164, 16, 10), (184, 22, 9), (200, 34, 8), (210, 50, 7)]):
        b += '<circle cx="%d" cy="%d" r="%d" fill="%s" stroke="%s" stroke-width="2"/>' % (x, y - 6, r, SKIN, INK)
    return b + extra
def person_back(extra=""):
    b = '<circle cx="160" cy="34" r="18" fill="%s" stroke="%s" stroke-width="2.5"/>' % (SKIN, INK)
    b += '<path d="M128 56 H192 L198 120 H122 Z" fill="#C9B8F0" stroke="%s" stroke-width="2.5"/>' % INK
    b += '<path d="M122 120 H198 L194 140 H126 Z" fill="#7A5AC9" stroke="%s" stroke-width="2.5"/>' % INK
    return b + extra

def arm_side(extra=""):
    return ('<path d="M20 120 L200 104 Q222 102 232 112 L300 100 Q312 102 304 116 L238 134 Q226 140 206 138 L20 150 Z" fill="%s" stroke="%s" stroke-width="2.5" stroke-linejoin="round"/>' % (SKIN, INK)) + extra
def lying(extra=""):
    b = '<rect x="10" y="150" width="300" height="12" rx="4" fill="#D9D2E6"/>'
    b += '<circle cx="40" cy="124" r="18" fill="%s" stroke="%s" stroke-width="2.5"/>' % (SKIN, INK)
    b += '<path d="M58 118 H190 Q200 118 200 130 V146 H58 Z" fill="#C9B8F0" stroke="%s" stroke-width="2.5"/>' % INK
    return b + extra
def neck_profile(extra=""):
    b = '<path d="M120 200 L128 140 Q100 128 100 90 Q102 40 150 34 Q200 32 208 80 Q212 100 204 112 L210 126 Q204 134 196 132 L194 146 Q186 152 172 150 L168 200 Z" fill="%s" stroke="%s" stroke-width="2.5"/>' % (SKIN, INK)
    b += '<path d="M128 100 Q120 112 130 120 Q138 116 136 104" fill="#EBCFB8" stroke="%s" stroke-width="2"/>' % INK
    b += '<circle cx="180" cy="74" r="4" fill="%s"/>' % INK
    return b + extra

D = {
 "Murphy’s sign": torso(dot(122, 84) + arrow(56, 62, 110, 80) + label(46, 38, "Press") + label(46, 52, "here") + label(160, 214, "Patient breathes in: stops sharply", size=11)),
 "McBurney’s point": torso('<path d="M122 170 L160 128" stroke="%s" stroke-width="2" stroke-dasharray="5 4"/>' % ARR + dot(134, 156) + '<circle cx="118" cy="176" r="5" fill="%s"/>' % ARR + label(70, 190, "Hip bone (ASIS)", size=11) + label(250, 116, "Umbilicus", size=11)),
 "Rovsing’s sign": torso(arrow(250, 170, 200, 160) + label(268, 196, "Press left", size=11) + dot(124, 160) + label(70, 140, "Pain right", size=11)),
 "Cullen’s sign": torso('<circle cx="160" cy="128" r="22" fill="#6C4FA3" opacity=".45"/>' + arrow(250, 90, 184, 120) + label(262, 82, "Bruising", size=11)),
 "Grey Turner’s sign": torso('<path d="M84 120 Q78 150 92 175 L104 170 Q96 148 100 122 Z" fill="#6C4FA3" opacity=".5"/><path d="M236 120 Q242 150 228 175 L216 170 Q224 148 220 122 Z" fill="#6C4FA3" opacity=".5"/>' + arrow(40, 104, 86, 140) + label(42, 80, "Flank", size=11) + label(42, 94, "bruising", size=11)),
 "Thompson test": leg_side('<ellipse cx="150" cy="110" rx="40" ry="18" fill="#EBCFB8" stroke="%s" stroke-width="2"/>' % INK + arrow(150, 40, 150, 84) + arrow(150, 170, 150, 134) + label(150, 30, "Squeeze calf", size=11) + arrow(284, 150, 300, 196, MARK) + label(200, 210, "Normal: foot points down. Ruptured: no movement", size=10)),
 "Lachman test": '<path d="M20 100 L150 112 L160 128 L28 128 Z" fill="%s" stroke="%s" stroke-width="2.5"/><path d="M168 112 L300 120 L300 140 L160 134 Z" fill="%s" stroke="%s" stroke-width="2.5"/><circle cx="160" cy="120" r="14" fill="#EBCFB8" stroke="%s" stroke-width="2"/>' % (SKIN, INK, SKIN, INK, INK) + arrow(230, 180, 230, 146) + label(230, 200, "Pull shin forward", size=11) + arrow(90, 60, 90, 94, "#9A93AE") + label(90, 50, "Steady thigh", size=11) + label(160, 214, "Knee bent 20 to 30°", size=11),
 "McMurray test": '<path d="M100 200 L140 60 Q148 44 162 56 L176 120 L250 70 Q262 64 268 76 L190 150 Z" fill="%s" stroke="%s" stroke-width="2.5" stroke-linejoin="round"/>' % (SKIN, INK) + dot(176, 122) + arrow(250, 140, 280, 110) + label(250, 170, "Rotate and straighten", size=11) + label(110, 214, "Click or pain at the joint line", size=11),
 "Phalen’s test": '<path d="M60 200 L120 120 L160 60 L172 66 L134 128 L90 206 Z" fill="%s" stroke="%s" stroke-width="2.5"/><path d="M260 200 L200 120 L160 60 L148 66 L186 128 L230 206 Z" fill="%s" stroke="%s" stroke-width="2.5"/>' % (SKIN, INK, SKIN, INK) + dot(160, 70) + label(160, 214, "Backs of hands together, 60 seconds", size=11),
 "Tinel’s sign": hand(dot(154, 190) + arrow(250, 170, 172, 188) + label(262, 160, "Tap", size=11) + label(70, 70, "Tingling in", size=11) + label(70, 84, "the fingers", size=11)),
 "Finkelstein test": '<path d="M70 200 L70 120 Q70 90 100 86 L170 86 Q200 88 200 118 L200 150 Q196 170 170 172 L120 176 L120 200 Z" fill="%s" stroke="%s" stroke-width="2.5"/><path d="M100 120 Q130 104 160 118" fill="none" stroke="%s" stroke-width="2"/>' % (SKIN, INK, INK) + dot(118, 180) + arrow(200, 160, 260, 200) + label(250, 150, "Bend wrist", size=11) + label(250, 164, "to little finger", size=11) + label(150, 30, "Thumb tucked in the fist", size=11),
 "Froment’s sign": hand('<rect x="196" y="40" width="70" height="56" rx="3" fill="#fff" stroke="%s" stroke-width="2" transform="rotate(20 230 68)"/>' % INK + dot(200, 108) + label(240, 200, "Thumb tip bends", size=11) + label(240, 214, "to grip paper", size=11)),
 "Trendelenburg sign": '<path d="M90 70 L230 100" stroke="%s" stroke-width="10" stroke-linecap="round"/>' % INK + '<path d="M110 76 L110 210 M210 98 L230 170" stroke="%s" stroke-width="10" stroke-linecap="round"/>' % SKIN.replace("F6E3D3", "D9B49A") + arrow(250, 70, 238, 98, MARK) + label(250, 60, "Pelvis drops", size=11) + label(90, 214, "Standing leg (weak hip)", size=11),
 "Babinski sign": foot_sole('<path d="M150 200 Q120 150 126 90 Q134 50 170 32" fill="none" stroke="%s" stroke-width="4" stroke-dasharray="1 9" stroke-linecap="round"/>' % ARR + arrow(160, 40, 174, 28) + label(60, 120, "Stroke the", size=11) + label(60, 134, "outer sole", size=11) + label(262, 60, "Big toe", size=11) + label(262, 74, "goes up", size=11) + arrow(110, 40, 128, 8, MARK, 3)),
 "Kernig’s sign": '<path d="M20 170 H140" stroke="%s" stroke-width="14" stroke-linecap="round"/><path d="M140 170 L170 90 L260 120" stroke="%s" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' % (SKIN.replace("F6E3D3", "D9B49A"), SKIN.replace("F6E3D3", "D9B49A")) + arrow(260, 150, 286, 100) + label(250, 180, "Straighten knee:", size=11) + label(250, 194, "pain and resistance", size=11) + label(150, 214, "Hip and knee bent to 90°", size=11),
 "Brudziński’s sign": '<circle cx="60" cy="120" r="20" fill="%s" stroke="%s" stroke-width="2.5"/><path d="M80 130 H220" stroke="#D9B49A" stroke-width="18" stroke-linecap="round"/><path d="M220 130 L250 90 L290 130" stroke="#D9B49A" stroke-width="12" fill="none" stroke-linecap="round"/>' % (SKIN, INK) + arrow(40, 160, 60, 98) + label(60, 190, "Lift the head", size=11) + arrow(250, 60, 250, 84, MARK) + label(250, 50, "Hips and knees bend", size=11),
 "Chvostek’s sign": head_side(dot(186, 124) + arrow(260, 90, 196, 120) + label(270, 80, "Tap here", size=11) + label(160, 214, "Face muscles twitch", size=11)),
 "Trousseau’s sign": '<rect x="40" y="70" width="110" height="60" rx="10" fill="#7A5AC9" stroke="%s" stroke-width="2.5"/>' % INK + '<path d="M150 82 L250 90 Q270 92 272 104 L268 118 L150 120 Z" fill="%s" stroke="%s" stroke-width="2.5"/><path d="M252 92 Q290 80 296 110 Q290 130 262 124" fill="%s" stroke="%s" stroke-width="2.5"/>' % (SKIN, INK, SKIN, INK) + dot(280, 108) + label(95, 60, "Cuff inflated, 3 minutes", size=11) + label(230, 160, "Hand cramps:", size=11) + label(230, 174, "wrist and knuckles bend", size=11),
 "Battle’s sign": head_side('<ellipse cx="146" cy="138" rx="16" ry="20" fill="#6C4FA3" opacity=".55"/>' + arrow(60, 170, 132, 142) + label(64, 190, "Bruise behind the ear", size=11)),
 "Romberg’s sign": person_back('<path d="M140 140 V200 M180 140 V200" stroke="#D9B49A" stroke-width="14" stroke-linecap="round"/><path d="M146 30 H174" stroke="%s" stroke-width="3"/>' % INK + arrow(220, 60, 250, 50, MARK) + arrow(100, 60, 70, 50, MARK) + label(250, 100, "Sways or falls", size=11) + label(250, 114, "with eyes closed", size=11) + label(160, 214, "Feet together", size=11)),
 "Homans’ sign": leg_side(arrow(300, 120, 300, 156, ARR) + label(270, 110, "Bend foot up", size=11) + dot(150, 110) + label(150, 50, "Calf pain? (unreliable)", size=11) + arrow(150, 60, 150, 92)),
 "Lhermitte’s sign": neck_profile('<path d="M150 150 L146 200" stroke="%s" stroke-width="4" stroke-dasharray="3 6"/>' % MARK + '<path d="M140 168 l12 6 -10 6 12 6" fill="none" stroke="%s" stroke-width="3"/>' % MARK + arrow(230, 50, 220, 96) + label(260, 40, "Bend head forward", size=11) + label(165, 214, "Electric shock down the spine", size=11)),
 "Gowers’ sign": '<circle cx="190" cy="40" r="16" fill="%s" stroke="%s" stroke-width="2.5"/><path d="M180 56 L130 110 L110 200 M130 110 L160 200 M175 64 L150 150 M168 70 L176 150" stroke="#D9B49A" stroke-width="10" stroke-linecap="round" fill="none"/>' % (SKIN, INK) + dot(152, 150, 7) + dot(176, 148, 7) + label(250, 120, "Hands walk", size=11) + label(250, 134, "up the thighs", size=11) + label(160, 214, "Getting up from the floor", size=11),
 "Hoffmann’s sign": hand(arrow(250, 30, 172, 42) + label(262, 24, "Flick nail", size=11) + dot(130, 52, 7) + dot(212, 100, 7) + label(70, 200, "Thumb and index", size=11) + label(70, 214, "twitch", size=11)),
 "Spurling’s test": neck_profile(arrow(150, 0, 156, 30) + label(70, 20, "Tilt and press down", size=11) + '<path d="M166 156 Q230 170 300 150" fill="none" stroke="%s" stroke-width="3" stroke-dasharray="5 5"/>' % MARK + label(160, 200, "Pain shoots down the arm", size=11)),
 "Allen’s test": hand('<circle cx="140" cy="196" r="9" fill="#9A93AE"/><circle cx="178" cy="196" r="9" fill="#9A93AE"/>' + label(60, 196, "Press both", size=11) + label(60, 210, "arteries", size=11) + label(262, 120, "Release one:", size=11) + label(262, 134, "colour back", size=11) + label(262, 148, "within 10 s?", size=11)),
 "Apley grind test": '<path d="M20 150 H170 L180 160 L30 166 Z" fill="%s" stroke="%s" stroke-width="2.5"/><path d="M170 152 L182 40 L204 42 L196 160 Z" fill="%s" stroke="%s" stroke-width="2.5"/>' % (SKIN, INK, SKIN, INK) + arrow(193, 0, 193, 34) + label(250, 24, "Press down", size=11) + '<path d="M222 60 a16 10 0 1 1 -2 -2" fill="none" stroke="%s" stroke-width="3"/>' % ARR + label(262, 70, "and twist", size=11) + dot(176, 158) + label(100, 200, "Lying face down, knee at 90°", size=11),
 "Pemberton’s sign": '<circle cx="160" cy="86" r="30" fill="#E58FA0" stroke="%s" stroke-width="2.5"/><path d="M126 120 H194 L204 210 H116 Z" fill="#C9B8F0" stroke="%s" stroke-width="2.5"/><path d="M128 124 L96 20 M192 124 L224 20" stroke="#D9B49A" stroke-width="14" stroke-linecap="round"/>' % (INK, INK) + label(160, 214, "Arms up for 1 minute", size=11) + label(262, 90, "Face flushes", size=11) + arrow(250, 96, 194, 90, MARK),
 "Kehr’s sign": torso(dot(200, 84) + '<path d="M200 84 Q240 40 250 14" fill="none" stroke="%s" stroke-width="3" stroke-dasharray="5 5"/>' % MARK + dot(250, 14, 7) + label(270, 40, "Left shoulder tip", size=11) + label(140, 214, "Blood under the left diaphragm", size=11)),
 "Blumberg’s sign": torso(arrow(130, 100, 130, 150) + arrow(150, 150, 150, 100, MARK) + label(46, 92, "Press", size=11) + label(46, 106, "slowly", size=11) + label(280, 92, "Let go fast:", size=11) + label(280, 106, "pain worse", size=11)),
 "Nikolsky sign": arm_side('<path d="M120 116 Q150 112 180 116 L180 128 Q150 132 120 128 Z" fill="#E58FA0" opacity=".8"/>' + arrow(110, 70, 170, 112) + label(100, 60, "Rub gently", size=11) + label(160, 190, "Top layer of skin slides off", size=11)),
 "Steinberg sign": hand('<path d="M190 120 Q160 130 140 128" fill="none" stroke="%s" stroke-width="6" stroke-linecap="round"/>' % MARK + label(100, 200, "Fist over thumb:", size=11) + label(100, 214, "thumb tip sticks out", size=11) + dot(122, 128, 7)),
 "Walker–Murdoch sign": '<rect x="140" y="20" width="40" height="190" rx="18" fill="%s" stroke="%s" stroke-width="2.5"/><path d="M118 110 Q160 60 202 110 Q160 130 118 110 Z" fill="none" stroke="%s" stroke-width="10" stroke-linecap="round"/>' % (SKIN, INK, "#D9B49A") + dot(118, 110, 7) + dot(202, 110, 7) + label(250, 90, "Thumb and little", size=11) + label(250, 104, "finger overlap", size=11) + label(160, 214, "Grasping the other wrist", size=11),
 "Virchow’s node": neck_profile('<circle cx="160" cy="168" r="12" fill="#B7A2E0" stroke="%s" stroke-width="2"/>' % INK + arrow(240, 190, 174, 172) + label(270, 206, "Left collarbone", size=11) + label(80, 20, "Lump above the collarbone", size=11)),
 "Sister Mary Joseph nodule": torso('<circle cx="160" cy="128" r="10" fill="#8E6BBE" stroke="%s" stroke-width="2"/>' % INK + arrow(256, 142, 174, 130) + label(280, 116, "Nodule at the", size=11) + label(280, 130, "belly button", size=11)),
 "Lasègue’s sign": lying('<path d="M200 140 L300 60" stroke="#D9B49A" stroke-width="14" stroke-linecap="round"/><path d="M200 146 H300" stroke="#D9B49A" stroke-width="12" stroke-linecap="round" opacity=".5"/>' + arrow(250, 140, 268, 92) + label(250, 40, "Lift straight leg", size=11) + '<path d="M210 140 Q230 180 290 160" fill="none" stroke="%s" stroke-width="3" stroke-dasharray="5 5"/>' % MARK + label(150, 200, "Pain shoots below the knee", size=11)),
 "Neer’s test": '<circle cx="100" cy="60" r="20" fill="%s" stroke="%s" stroke-width="2.5"/><path d="M84 82 H120 L126 200 H80 Z" fill="#C9B8F0" stroke="%s" stroke-width="2.5"/><path d="M116 92 L220 20" stroke="#D9B49A" stroke-width="14" stroke-linecap="round"/>' % (SKIN, INK, INK) + dot(118, 92) + arrow(170, 120, 230, 60) + label(240, 140, "Lift the straight,", size=11) + label(240, 154, "thumb-down arm", size=11),
 "Jobe’s test": '<circle cx="160" cy="44" r="20" fill="%s" stroke="%s" stroke-width="2.5"/><path d="M140 66 H180 L188 200 H132 Z" fill="#C9B8F0" stroke="%s" stroke-width="2.5"/><path d="M140 80 L40 120 M180 80 L280 120" stroke="#D9B49A" stroke-width="14" stroke-linecap="round"/>' % (SKIN, INK, INK) + arrow(60, 70, 60, 106, ARR) + arrow(260, 70, 260, 106, ARR) + label(160, 214, "‘Empty can’: thumbs down, press down", size=11) + dot(180, 82),
 "Dix–Hallpike test": lying('<path d="M40 124 L20 140" stroke="%s" stroke-width="2"/>' % INK + '<path d="M60 70 a30 30 0 0 1 -40 40" fill="none" stroke="%s" stroke-width="3"/>' % ARR + label(150, 40, "Quickly lie back,", size=11) + label(150, 54, "head turned 45° and hanging", size=11) + '<path d="M30 118 a8 8 0 1 0 12 4" fill="none" stroke="%s" stroke-width="2.5"/>' % MARK + label(150, 200, "Eyes flicker, room spins", size=11)),
 "Rinne test": neck_profile('<path d="M110 104 L70 104 M70 104 L50 70 M70 104 L50 138" stroke="#7C6A4E" stroke-width="5" stroke-linecap="round"/>' + dot(118, 110, 6) + label(95, 180, "1. Behind the ear (bone)", size=11) + label(95, 196, "2. Beside the ear (air)", size=11) + label(250, 214, "Air louder = normal", size=11)),
}

LEG = "#D9B49A"
def stick(x, y, extra=""):  # standing person seen from the front, head at (x, y)
    return ('<circle cx="%d" cy="%d" r="18" fill="%s" stroke="%s" stroke-width="2.5"/>' % (x, y, SKIN, INK) +
            '<path d="M%d %d H%d L%d %d H%d Z" fill="#C9B8F0" stroke="%s" stroke-width="2.5"/>' % (x - 20, y + 22, x + 20, x + 26, y + 120, x - 26, INK) +
            '<path d="M%d %d V%d M%d %d V%d" stroke="%s" stroke-width="12" stroke-linecap="round"/>' % (x - 12, y + 124, y + 176, x + 12, y + 124, y + 176, LEG)) + extra
D.update({
 "Carnett’s sign": torso(arrow(262, 66, 188, 110) + label(280, 40, "Press the", size=11) + label(280, 54, "sore spot", size=11) + dot(180, 116) + label(160, 214, "Lift head to tense tummy: still sore = wall pain", size=11)),
 "Hawkins–Kennedy test": stick(90, 40, '<path d="M110 72 L190 76" stroke="%s" stroke-width="12" stroke-linecap="round"/><path d="M190 76 L192 20" stroke="%s" stroke-width="11" stroke-linecap="round"/>' % (LEG, LEG) + '<path d="M214 26 Q236 70 206 100" fill="none" stroke="%s" stroke-width="4"/>' % ARR + arrow(212, 92, 200, 104) + dot(110, 70, 7) + label(250, 140, "Arm at 90°,", size=11) + label(250, 154, "turn it inwards", size=11) + label(250, 172, "Pain at the shoulder", size=11, col=MARK)),
 "Speed’s test": stick(90, 40, '<path d="M110 72 L280 84" stroke="%s" stroke-width="12" stroke-linecap="round"/>' % LEG + arrow(260, 30, 260, 74) + label(262, 22, "Push down", size=11) + dot(114, 74, 7) + label(200, 150, "Patient lifts, palm up:", size=11) + label(200, 166, "pain at the front", size=11) + label(200, 180, "of the shoulder", size=11)),
 "Patrick’s (FABER) test": lying('<path d="M200 140 H300" stroke="%s" stroke-width="12" stroke-linecap="round"/><path d="M196 132 L238 70 L268 134" stroke="%s" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' % (LEG, LEG) + arrow(238, 20, 238, 60) + label(238, 14, "Press knee down", size=11) + dot(196, 132, 7) + label(110, 40, "Ankle on the other knee", size=11) + label(110, 196, "Groin pain = hip; buttock pain = SI joint", size=11)),
 "Thomas test": lying('<path d="M196 132 L168 70 L140 110" stroke="%s" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M200 138 L300 112" stroke="%s" stroke-width="12" stroke-linecap="round"/>' % (LEG, LEG) + arrow(290, 150, 290, 122, MARK) + label(250, 190, "Other thigh lifts off", size=11, col=MARK) + label(150, 40, "Hug one knee to the chest", size=11)),
 "Ober’s test": '<rect x="10" y="170" width="300" height="12" rx="4" fill="#D9D2E6"/><circle cx="44" cy="140" r="18" fill="%s" stroke="%s" stroke-width="2.5"/><path d="M62 128 H180 V166 H62 Z" fill="#C9B8F0" stroke="%s" stroke-width="2.5"/>' % (SKIN, INK, INK) + '<path d="M180 160 H300" stroke="%s" stroke-width="12" stroke-linecap="round"/><path d="M180 136 L296 110" stroke="%s" stroke-width="12" stroke-linecap="round"/>' % (LEG, LEG) + label(240, 70, "Let go: the top leg", size=11) + label(240, 84, "stays up = tight ITB", size=11) + arrow(280, 96, 280, 114, MARK),
 "Ortolani test": '<circle cx="160" cy="80" r="44" fill="none" stroke="%s" stroke-width="3"/><path d="M130 80 a30 30 0 0 1 60 0" fill="#EBCFB8" stroke="%s" stroke-width="2.5"/>' % (INK, INK) + '<circle cx="214" cy="112" r="20" fill="%s" stroke="%s" stroke-width="2.5"/><path d="M226 128 L290 200" stroke="%s" stroke-width="16" stroke-linecap="round"/>' % (SKIN, INK, LEG) + arrow(228, 150, 186, 100, MARK) + label(160, 20, "Socket", size=11) + label(90, 170, "Hip slides back in", size=11) + label(90, 184, "with a clunk", size=11),
 "Barlow test": '<circle cx="160" cy="80" r="44" fill="none" stroke="%s" stroke-width="3"/><path d="M130 80 a30 30 0 0 1 60 0" fill="#EBCFB8" stroke="%s" stroke-width="2.5"/>' % (INK, INK) + '<circle cx="160" cy="84" r="20" fill="%s" stroke="%s" stroke-width="2.5"/><path d="M168 102 L200 200" stroke="%s" stroke-width="16" stroke-linecap="round"/>' % (SKIN, INK, LEG) + arrow(186, 98, 232, 140, MARK) + label(160, 20, "Socket", size=11) + label(250, 170, "Push back:", size=11) + label(250, 184, "hip slips out", size=11),
 "Weber test": '<circle cx="160" cy="120" r="66" fill="%s" stroke="%s" stroke-width="2.5"/><path d="M86 100 q-14 10 0 24 M234 100 q14 10 0 24" fill="#EBCFB8" stroke="%s" stroke-width="2.5"/>' % (SKIN, INK, INK) + '<path d="M160 52 V26 M152 26 V8 M168 26 V8" stroke="#7C6A4E" stroke-width="5" stroke-linecap="round"/>' + dot(160, 54, 6) + '<path d="M60 96 q-12 16 0 32 M48 90 q-18 22 0 44" fill="none" stroke="%s" stroke-width="3"/>' % MARK + label(70, 200, "Louder on one side", size=11, col=MARK) + label(250, 200, "Fork on the forehead", size=11),
 "Schober’s test": person_back('<path d="M160 64 V140" stroke="%s" stroke-width="2"/>' % INK + '<path d="M150 74 H170 M150 128 H170" stroke="%s" stroke-width="4"/>' % MARK + label(240, 80, "Mark 10 cm apart", size=11) + label(240, 150, "Bend forward: a gain", size=11) + label(240, 164, "under 5 cm suggests", size=11) + label(240, 178, "a stiff lower back", size=11)),
 "Heberden’s nodes": hand(dot(129, 62, 6) + dot(148, 50, 6) + dot(168, 54, 6) + dot(187, 66, 6) + label(260, 40, "Bony lumps at the", size=11) + label(260, 54, "fingertip joints", size=11)),
 "Beau’s lines": '<path d="M110 210 V70 Q110 20 160 20 Q210 20 210 70 V210 Z" fill="%s" stroke="%s" stroke-width="2.5"/><rect x="124" y="40" width="72" height="120" rx="30" fill="#F7D9E2" stroke="%s" stroke-width="2"/>' % (SKIN, INK, INK) + '<path d="M128 96 Q160 104 192 96 M128 124 Q160 132 192 124" fill="none" stroke="%s" stroke-width="4" stroke-linecap="round"/>' % MARK + label(262, 100, "Grooves across", size=11) + label(262, 114, "the nail", size=11) + label(262, 140, "~3 mm a month", size=11),
 "Schamroth’s window test": '<path d="M40 30 H140 Q156 30 156 50 L150 92 Q146 104 140 104 H40 Z M40 116 H140 Q146 116 150 128 L156 170 Q156 190 140 190 H40 Z" fill="%s" stroke="%s" stroke-width="2.5"/>' % (SKIN, INK) + '<path d="M148 104 L156 110 L148 116 L140 110 Z" fill="#FBF8F3" stroke="%s" stroke-width="2"/>' % INK + label(80, 212, "Normal: diamond gap", size=11) + '<path d="M180 30 H270 Q292 30 296 60 L294 104 H180 Z M180 116 H294 L296 160 Q292 190 270 190 H180 Z" fill="%s" stroke="%s" stroke-width="2.5"/>' % (SKIN, INK) + label(240, 212, "Clubbing: no gap", size=11, col=MARK),
 "Janeway lesions": hand(dot(148, 150, 6) + dot(166, 166, 5) + dot(140, 176, 5) + dot(170, 140, 5) + label(262, 150, "Painless spots", size=11) + label(262, 164, "on the palm", size=11)),
 "Mulder’s click": foot_sole(arrow(40, 60, 98, 60) + arrow(280, 60, 222, 60) + label(160, 214, "Squeeze the forefoot", size=11) + dot(176, 50, 7) + label(270, 120, "Painful click", size=11, col=MARK) + label(270, 134, "between toes", size=11)),
 "Hoover’s sign": lying('<path d="M200 146 H300" stroke="%s" stroke-width="12" stroke-linecap="round"/><path d="M200 132 L300 80" stroke="%s" stroke-width="12" stroke-linecap="round"/>' % (LEG, LEG) + arrow(300, 60, 300, 84) + label(250, 40, "Lift the good leg", size=11) + label(250, 54, "against my hand", size=11) + arrow(290, 160, 290, 192, MARK) + label(150, 196, "The 'weak' heel pushes down", size=11, col=MARK)),
})

ORDER = list(D.keys())
def slug(n): return re.sub(r"[^a-z0-9]+", "-", n.lower().replace("’s", "s").replace("ń", "n").replace("(faber) ", "")).strip("-")

TPL = open(ROOT + "tools/ace-score/index.html", encoding="utf-8").read()
HEAD = TPL[:TPL.index("<main")]
HEAD = re.sub(r'<meta property="og:image[^>]*>\n?|<meta name="twitter:image[^>]*>\n?', "", HEAD)
HEAD = re.sub(r'<script type="application/ld\+json".*?</script>\n?', "", HEAD, flags=re.S)
HEAD = HEAD.replace('<link rel="stylesheet" href="/tools/calckit/calc.css?v=2">\n', "")
CSS = """<style>.sg-fig{margin:10px 0 18px;background:var(--card,#fff);border:1px solid var(--line,#E7E0F2);border-radius:16px;padding:8px}.sg-fig svg{display:block;width:100%;height:auto;max-width:520px;margin:0 auto}
.sg-facts{display:grid;gap:10px;margin:0 0 16px}.sg-facts div{background:var(--card,#fff);border:1px solid var(--line,#E7E0F2);border-radius:14px;padding:12px 14px}.sg-facts dt{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--brand,#4A3480)}.sg-facts dd{margin:3px 0 0;font-size:16px;line-height:1.5}
.sg-hub{list-style:none!important;padding:0!important;display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}.sg-hub li{margin:0!important}.sg-hub a{display:block;background:var(--card,#fff);border:1px solid var(--line,#E7E0F2);border-radius:14px;padding:8px;text-decoration:none;color:var(--ink);font-weight:600;font-size:14px;text-align:center}.sg-hub svg{display:block;width:100%;height:auto;margin-bottom:4px}
.sg-play{display:inline-block;margin:6px 0 14px;font-weight:600}</style>"""

def page(path, title, desc, main):
    url = "https://maladywise.com/" + path
    h = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="%s">' % url, HEAD)
    h = re.sub(r'<title>.*?</title>', "<title>%s</title>" % E(title), h)
    for a in ('<meta name="description" content="', '<meta property="og:description" content="'):
        h = re.sub(r'(%s)[^"]*' % re.escape(a), lambda m: m.group(1) + E(desc), h)
    h = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + E(title), h)
    h = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + url, h)
    out = h + '<main class="wrap doc">\n' + main + "\n" + CSS + '\n<p class="meta">Updated %s.</p>\n</main>\n<script>MW.page();</script>\n</body>\n</html>\n' % TODAY
    os.makedirs(ROOT + path, exist_ok=True); open(ROOT + path + "index.html", "w", encoding="utf-8").write(out)

for n in ORDER:
    it = NOM[n]; s = slug(n); acc = SENK.get(key(n))
    rows = [("How it’s done", it[2]), ("What a positive result points to", it[3]), ("Who it’s named after", it[4])]
    if FACT.get(n): rows.append(("Good to know", FACT[n]))
    dl = "".join("<div><dt>%s</dt><dd>%s</dd></div>" % (E(a), E(b)) for a, b in rows)
    accp = ""
    if acc:
        accp = "<h2>How accurate is it?</h2><p>In studies, it picks up about <b>%d%%</b> of people with %s%s. %s</p><p class=\"meta\">Source: <a href=\"%s\" rel=\"noopener\">%s</a></p>" % (
            acc["sens"]["v"], E(acc["condition"]), (", and correctly clears about <b>%d%%</b> of people without it" % acc["spec"]["v"]) if acc.get("spec") else "", E(acc["says"]), E(acc["src"][0][1]), E(acc["src"][0][0]))
    i = ORDER.index(n); prv, nxt = ORDER[i - 1], ORDER[(i + 1) % len(ORDER)]
    main = ('<p class="meta"><a href="/signs/">Eponymous signs</a> · %s</p>\n<h1>%s</h1>\n<p class="lede">%s points to %s.</p>\n<figure class="sg-fig">%s</figure>\n<dl class="sg-facts">%s</dl>\n%s\n'
            '<p><a class="sg-play" href="/nomulous/">&#129408; Test yourself: play Nomulous, the daily eponym quiz</a></p>\n'
            '<p class="meta">Signs are clues, not diagnoses on their own. A doctor puts them together with the whole story.</p>\n'
            '<nav class="mz-nav" style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:18px 0"><a href="/signs/%s/">&larr; %s</a><a href="/signs/%s/">%s &rarr;</a></nav>') % (
        E(it[1].capitalize()), E(n), E(n), E(it[3][0].lower() + it[3][1:] if not it[3][:2].isupper() else it[3]), svg(D[n], "Diagram of " + n), dl, accp, slug(prv), E(prv), slug(nxt), E(nxt))
    page("signs/%s/" % s, "%s: What It Is, How It’s Done and What It Means" % n, "%s, explained simply with a diagram: how it’s done, what a positive result points to (%s), who it’s named after and how accurate it is." % (n, it[3].lower()), main)

hub = ('<p class="meta"><a href="/medical-games/">Learn</a> · Eponymous signs</p>\n<h1>Eponymous signs</h1>\n'
       '<p class="lede">Medicine’s famous named signs and tests, each with a simple diagram, what it means, who it’s named after and how accurate it really is.</p>\n'
       '<p><a class="sg-play" href="/nomulous/">&#129408; Test yourself with Nomulous</a></p>\n<ul class="sg-hub">' +
       "".join('<li><a href="/signs/%s/">%s%s</a></li>' % (slug(n), svg(D[n], n), E(n)) for n in ORDER) + "</ul>")
page("signs/", "Eponymous Medical Signs Explained, with Diagrams", "Murphy’s, McBurney’s, Babinski, Kernig, Spurling, Allen’s and more: famous medical signs explained simply with diagrams, history and accuracy.", hub)
print("signs pages:", len(ORDER) + 1)
