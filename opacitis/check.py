#!/usr/bin/env python3
"""Validate Glimpsis puzzle files: python3 glimpsis/check.py"""
import json, glob, sys, datetime, re
DIFF = {0: "Easy", 1: "Easy", 2: "Medium", 3: "Medium", 4: "Hard", 5: "Hard", 6: "Genius"}  # Mon=0
OK_LIC = re.compile(r"^(Public domain|CC0( 1\.0)?|CC BY(-SA)? [1-4]\.0( [A-Za-z\-]+)?|CC BY(-SA)? 2\.[05]( [A-Za-z\-]+)?)$")
bad = 0; seen = {}
def err(m):
    global bad; bad += 1; print("ERROR", m)
for f in sorted(glob.glob("opacitis/puzzles/20*.json")):
    for p in json.load(open(f)):
        d = p.get("date", "?"); w = f"{d}:"
        for k in ("date", "number", "difficulty", "title", "context", "question", "img", "answer", "wrong", "hints", "why", "pearl"):
            if not p.get(k): err(f"{w} missing {k}")
        if len(p.get("wrong", [])) != 5: err(f"{w} needs 5 wrong options")
        opts = [p.get("answer")] + p.get("wrong", [])
        if len(set(o.lower() for o in opts if o)) != 6: err(f"{w} duplicate options")
        if len(p.get("hints", [])) < 2: err(f"{w} needs 2 hints")
        dd = datetime.date.fromisoformat(d)
        if p.get("difficulty") not in (DIFF[dd.weekday()], "Einstein"): err(f"{w} difficulty {p.get('difficulty')} != {DIFF[dd.weekday()]}")
        i = p.get("img", {})
        if not (i.get("file") or i.get("url")): err(f"{w} img needs file or url")
        for k in ("author", "licence", "page"):
            if not i.get(k): err(f"{w} img.{k} missing")
        if i.get("licence") and not OK_LIC.match(i["licence"]): err(f"{w} licence not allowed: {i['licence']}")
        if "NC" in i.get("licence", "") or "ND" in i.get("licence", ""): err(f"{w} NC/ND licence")
        a = p.get("answer", "").lower()
        for t in (p.get("title", ""), p.get("context", ""), " ".join(p.get("hints", []))):
            if a and a in t.lower(): err(f"{w} answer given away in text")
        key = i.get("file") or i.get("url")
        if key in seen: err(f"{w} image reused from {seen[key]}")
        seen[key] = d
print("OK" if not bad else f"{bad} problem(s)"); sys.exit(1 if bad else 0)
