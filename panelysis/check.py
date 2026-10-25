#!/usr/bin/env python3
"""Panelysis puzzle checker. Run: python3 panelysis/check.py
Checks every puzzle file in panelysis/puzzles/:
- dates consecutive, numbers sequential, difficulty matches weekday (Mon-Tue Easy ... Sun Genius; Einstein allowed)
- 6 unique options, answer not among the wrong ones
- every H/L/! flag matches the value against its reference range (and every out-of-range value is flagged)
- sex-specific adult ranges used consistently (Hb, Hct, RBC, creatinine, ALT, GGT, ferritin, CK)
- hint and key test names exist in the panel
Prints derived values (anion gap, corrected calcium, transferrin saturation, calculated osmolality) for eyeballing.
Exit code 1 on any error."""
import json, glob, os, re, sys, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
DIFF = ["Easy", "Easy", "Medium", "Medium", "Hard", "Hard", "Genius"]  # Mon..Sun
SEX_RANGES = {  # test: (female, male)
    "Haemoglobin": ("115–165", "130–180"), "Haematocrit": ("0.35–0.47", "0.40–0.54"), "Red cell count": ("3.8–5.8", "4.5–6.5"),
    "Creatinine": ("45–90", "60–110"), "ALT": ("<30", "<40"), "GGT": ("<35", "<50"), "Ferritin": ("30–200", "30–500"), "Creatine kinase": ("<150", "<200"),
}
errs = []
def err(p, m): errs.append("%s #%s: %s" % (p.get("date"), p.get("number"), m))

def num(s):
    s = s.replace(",", "").replace("−", "-").strip()
    m = re.fullmatch(r"([<>]?)\s*([+-]?\d+(?:\.\d+)?)", s)
    if not m: return None
    v = float(m.group(2))
    return v - 1e-9 if m.group(1) == "<" else v + 1e-9 if m.group(1) == ">" else v

def parse_range(r):
    r = r.replace("−", "-").strip()
    m = re.fullmatch(r"([+-]?\d+(?:\.\d+)?)\s*(?:–|-|to)\s*([+-]?\d+(?:\.\d+)?)", r)
    if m: return ("between", float(m.group(1)), float(m.group(2)))
    m = re.fullmatch(r"<\s*(\d+(?:\.\d+)?)", r)
    if m: return ("below", None, float(m.group(1)))
    m = re.fullmatch(r">\s*(\d+(?:\.\d+)?)", r)
    if m: return ("above", float(m.group(1)), None)
    return ("text", r, None) if r else ("none", None, None)

def expected(v, r):
    kind, lo, hi = parse_range(r)
    x = num(v)
    if kind == "none": return None  # anything allowed except H/L
    if kind == "text": return "" if v.strip().lower() == lo.lower() else "!"
    if x is None: return "?"
    if kind == "between": return "L" if x < lo else "H" if x > hi else ""
    if kind == "below": return "H" if x >= hi + 1e-12 else ""
    if kind == "above": return "L" if x <= lo - 1e-12 else ""

files = sorted(glob.glob(os.path.join(HERE, "puzzles", "*.json")))
allp = []
for f in files:
    allp += json.load(open(f, encoding="utf-8"))
allp.sort(key=lambda p: p["date"])
prev = None
for i, p in enumerate(allp):
    d = datetime.date.fromisoformat(p["date"])
    if prev and (d - prev).days != 1: err(p, "date gap after %s" % prev)
    prev = d
    if p["number"] != i + 1: err(p, "number should be %d" % (i + 1))
    if p["difficulty"] not in (DIFF[d.weekday()], "Einstein"): err(p, "difficulty %s, weekday wants %s" % (p["difficulty"], DIFF[d.weekday()]))
    opts = [p["answer"]] + p["wrong"]
    if len(opts) != 6 or len(set(o.lower() for o in opts)) != 6: err(p, "need 6 unique options")
    for k in ("patient", "story", "why", "pearl"):
        if not p.get(k): err(p, "missing " + k)
    sex = "female" if "female" in p["patient"] else "male" if "male" in p["patient"] else None
    if not sex: err(p, "patient line should state sex")
    tests, vals = set(), {}
    for pan in p["panels"]:
        for row in pan["rows"]:
            t, v, u, r, fl = row
            if t in tests: err(p, "duplicate test " + t)
            tests.add(t); vals[t] = num(v)
            e = expected(v, r)
            if e is None:
                if fl not in ("", "!"): err(p, "%s has no range but flag %r" % (t, fl))
            elif e == "?": err(p, "%s: cannot compare %r with range %r" % (t, v, r))
            elif e != fl: err(p, "%s = %s (range %s): flag %r, expected %r" % (t, v, r, fl, e))
            if t in SEX_RANGES and sex and r != SEX_RANGES[t][0 if sex == "female" else 1]:
                err(p, "%s range %s doesn't match %s adult range %s" % (t, r, sex, SEX_RANGES[t][0 if sex == "female" else 1]))
    for h in p["hints"]:
        if len(h) != 2 or not h[0]: err(p, "bad hint")
        for t in h[1]:
            if t not in tests: err(p, "hint test not in panel: " + t)
    if len(p["hints"]) != 2: err(p, "need exactly 2 hints")
    for t in p["key"]:
        if t not in tests: err(p, "key test not in panel: " + t)
    # derived values for eyeballing
    der = []
    g = lambda k: vals.get(k)
    if g("Sodium") and g("Chloride") and g("Bicarbonate"): der.append("AG %.0f" % (g("Sodium") - g("Chloride") - g("Bicarbonate")))
    if g("Calcium") and g("Albumin") and g("Corrected calcium"):
        cc = g("Calcium") + 0.02 * (40 - g("Albumin"))
        der.append("corrCa calc %.2f vs %.2f" % (cc, g("Corrected calcium")))
        if abs(cc - g("Corrected calcium")) > 0.03: err(p, "corrected calcium inconsistent")
    if g("Iron") and g("Transferrin") and g("Transferrin saturation"):
        ts = g("Iron") / (g("Transferrin") * 25.1) * 100
        der.append("TSAT calc %.0f%% vs %.0f%%" % (ts, g("Transferrin saturation")))
        if abs(ts - g("Transferrin saturation")) > 2.5: err(p, "transferrin saturation inconsistent")
    gl = g("Glucose") or g("Glucose (random)")
    if g("Sodium") and gl and g("Urea"): der.append("calc osm %.0f" % (2 * g("Sodium") + gl + g("Urea")) + (" vs %.0f" % g("Osmolality") if g("Osmolality") else ""))
    if g("MCV") and g("Red cell count"): der.append("Mentzer %.1f" % (g("MCV") / g("Red cell count")))
    print("%s #%-2d %-7s %-46s %s" % (p["date"], p["number"], p["difficulty"], p["answer"][:46], "; ".join(der)))

print("\n%d puzzles, %d files" % (len(allp), len(files)))
if errs:
    print("\nERRORS:"); [print(" -", e) for e in errs]; sys.exit(1)
print("All flags match their ranges. OK.")
