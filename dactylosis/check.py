#!/usr/bin/env python3
"""Validate Dactylosis puzzle files: python3 dactylosis/check.py"""
import json, glob, sys, datetime, os
DIFF = {0: "Easy", 1: "Easy", 2: "Medium", 3: "Medium", 4: "Hard", 5: "Hard", 6: "Genius"}  # Mon=0
LEN = {"Easy": (4, 5), "Medium": (6, 7), "Hard": (7, 9), "Genius": (9, 11), "Einstein": (12, 15)}
MS = {"Easy": (1200, 1600), "Medium": (950, 1250), "Hard": (750, 950), "Genius": (600, 800), "Einstein": (500, 700)}
bad = 0
def err(m):
    global bad; bad += 1; print("ERROR", m)
for folder in ("dactylosis/puzzles/", "dactylosis/puzzles/normie/"):
    words = {}; dates = []
    for f in sorted(glob.glob(folder + "20*.json")):
        for p in json.load(open(f)):
            d = p.get("date", "?"); w = f"{folder}{d}:"
            for k in ("date", "number", "difficulty", "word", "ms", "clue", "why", "pearl"):
                if not p.get(k): err(f"{w} missing {k}")
            wd = p.get("word", "")
            if not wd.isascii() or not wd.isalpha() or wd != wd.upper(): err(f"{w} word must be A-Z capitals only: {wd}")
            dd = datetime.date.fromisoformat(d); dates.append(dd)
            df = p.get("difficulty")
            if df not in (DIFF[dd.weekday()], "Einstein"): err(f"{w} difficulty {df} != {DIFF[dd.weekday()]}")
            if df in LEN and not LEN[df][0] <= len(wd) <= LEN[df][1]: err(f"{w} {df} word length {len(wd)} outside {LEN[df]}")
            if df in MS and not MS[df][0] <= p.get("ms", 0) <= MS[df][1]: err(f"{w} ms {p.get('ms')} outside {MS[df]}")
            if wd and wd.lower() in (p.get("clue", "")).lower(): err(f"{w} clue gives the word away")
            if wd in words and (dd - words[wd]).days < 365: err(f"{w} {wd} repeated within a year")
            words[wd] = dd
    dates.sort()
    for a, b in zip(dates, dates[1:]):
        if (b - a).days != 1: err(f"{folder} gap or duplicate between {a} and {b}")
for c in "abcdefghijklmnopqrstuvwxyz":
    if not os.path.exists(f"dactylosis/hands/{c}.webp"): err(f"missing hand image {c}")
print("OK" if not bad else f"{bad} problem(s)"); sys.exit(1 if bad else 0)
