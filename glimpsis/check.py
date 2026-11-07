#!/usr/bin/env python3
"""Validate Glimpsis puzzle files (Medical and Normie): python3 glimpsis/check.py"""
import json, glob, sys, datetime, re, os
G = "glimpsis"
DIFF = {0: "Easy", 1: "Easy", 2: "Medium", 3: "Medium", 4: "Hard", 5: "Hard", 6: "Genius"}  # Mon=0
OK_LIC = re.compile(r"^(Public domain|CC0( 1\.0)?|CC BY(-SA)? [1-4]\.0( [A-Za-z\-]+)?|CC BY(-SA)? 2\.[05]( [A-Za-z\-]+)?)$")
BANNED = re.compile(r"dermnet|radiopaedia", re.I)
# Normie must stay non-medical: flag clinical words in player-facing text
MEDWORDS = re.compile(r"\b(patient|diagnos\w*|clinical|disease|symptom\w*|doctor|hospital|radiolog\w*|fracture|tumou?r|infection)\b", re.I)
bad = 0
def err(m):
    global bad; bad += 1; print("ERROR", m)
def check(files, normie):
    seen, ans, num = {}, {}, None
    for f in files:
        for p in json.load(open(f)):
            d = p.get("date", "?"); w = ("N " if normie else "") + f"{d}:"
            for k in ("date", "number", "difficulty", "title", "context", "question", "img", "answer", "wrong", "hints", "why", "pearl"):
                if not p.get(k): err(f"{w} missing {k}")
            if num is not None and p.get("number") != num + 1: err(f"{w} number {p.get('number')} should be {num + 1}")
            num = p.get("number")
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
            if BANNED.search(json.dumps(i)): err(f"{w} banned image source")
            u = i.get("url", "")
            if u and not u.startswith("http") and not os.path.exists(os.path.join(G, u)): err(f"{w} image file missing: {u}")
            a = p.get("answer", "").lower()
            for t in (p.get("title", ""), p.get("context", ""), " ".join(p.get("hints", []))):
                if a and a in t.lower(): err(f"{w} answer given away in text")
            key = i.get("file") or i.get("url")
            if key in seen: err(f"{w} image reused from {seen[key]}")
            seen[key] = d
            if a in ans and (dd - ans[a]).days < 180: err(f"{w} answer repeats within 180 days ({ans[a]})")
            ans[a] = dd
            if normie:
                txt = " ".join([p.get(k, "") for k in ("title", "context", "question", "why", "pearl", "answer")] + p.get("wrong", []) + p.get("hints", []))
                m = MEDWORDS.search(txt)
                if m: err(f"{w} medical word in Normie text: {m.group(0)}")
    return len(seen)
n1 = check(sorted(glob.glob(G + "/puzzles/20*.json")), False)
n2 = check(sorted(glob.glob(G + "/puzzles/normie/20*.json")), True)
print(f"Medical {n1}, Normie {n2}.", "OK" if not bad else f"{bad} problem(s)"); sys.exit(1 if bad else 0)
