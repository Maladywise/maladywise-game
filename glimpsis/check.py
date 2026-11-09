#!/usr/bin/env python3
"""Validate Glimpsis puzzle files (Medical and Normie), daily and Glimpsathon: python3 glimpsis/check.py"""
import json, glob, sys, datetime, re, os, hashlib
G = "glimpsis"
DIFF = {0: "Easy", 1: "Easy", 2: "Medium", 3: "Medium", 4: "Hard", 5: "Hard", 6: "Genius"}  # Mon=0
OK_LIC = re.compile(r"^(Public domain|CC0( 1\.0)?|CC BY(-SA)? [1-4]\.0( [A-Za-z\-]+)?|CC BY(-SA)? 2\.[05]( [A-Za-z\-]+)?)$")
BANNED = re.compile(r"dermnet|radiopaedia", re.I)
# Normie must stay non-medical: flag clinical words in player-facing text
MEDWORDS = re.compile(r"\b(patient|diagnos\w*|clinical|disease|symptom\w*|doctor|hospital|radiolog\w*|fracture|tumou?r|infection)\b", re.I)
bad = 0
DAILY = {False: [], True: []}   # (date, answer, image key) per mode, for the Glimpsathon checks
IMGKEYS = {}                    # image page/url/file -> where it was used (all of Glimpsis)
def norm_ans(a): return re.sub(r"\s+", " ", (a or "").lower().strip())
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
            for k2 in {i.get("page"), key}:
                if k2: IMGKEYS[k2] = ("N " if normie else "") + d
            DAILY[normie].append((dd, norm_ans(p.get("answer")), norm_ans(p.get("answer")).split(" (")[0]))
            if a in ans and (dd - ans[a]).days < 180: err(f"{w} answer repeats within 180 days ({ans[a]})")
            ans[a] = dd
            if normie:
                txt = " ".join([p.get(k, "") for k in ("title", "context", "question", "why", "pearl", "answer")] + p.get("wrong", []) + p.get("hints", []))
                m = MEDWORDS.search(txt)
                if m: err(f"{w} medical word in Normie text: {m.group(0)}")
    return len(seen)

# ---------- Glimpsathon (Tuesdays from 2026-11-17): puzzles/athon/YYYY-MM-DD.json, puzzles/athon/normie/YYYY-MM-DD.json ----------
ATHON_FROM = datetime.date(2026, 11, 17)
RAMP = ["Easy"] * 3 + ["Medium"] * 3 + ["Hard"] * 3 + ["Genius"]
HASHES = {}
def sha(path):
    try: return hashlib.sha1(open(path, "rb").read()).hexdigest()
    except OSError: return None
def check_athon(normie):
    tag = "N athon " if normie else "athon "
    files = sorted(glob.glob(G + ("/puzzles/athon/normie/" if normie else "/puzzles/athon/") + "20*.json"))
    past = []  # (date, answer)
    for f in files:
        fd = os.path.basename(f)[:-5]
        try: A = json.load(open(f))
        except Exception as e: err(f"{tag}{fd}: bad JSON {e}"); continue
        w = f"{tag}{fd}:"
        try: dd = datetime.date.fromisoformat(fd)
        except ValueError: err(f"{w} file name is not a date"); continue
        if A.get("date") != fd: err(f"{w} date field {A.get('date')} != file name")
        if dd.weekday() != 1: err(f"{w} not a Tuesday")
        if dd < ATHON_FROM: err(f"{w} before {ATHON_FROM}")
        want = (dd - ATHON_FROM).days // 7 + 1
        if A.get("number") != want: err(f"{w} number {A.get('number')} should be {want}")
        items = A.get("items") or []
        if len(items) != 10: err(f"{w} needs 10 items, has {len(items)}")
        mine = set()
        for n, p in enumerate(items):
            wi = f"{w} item {n + 1}"
            for k in ("img", "answer", "wrong", "why", "pearl"):
                if not p.get(k): err(f"{wi} missing {k}")
            if p.get("hints"): err(f"{wi} Glimpsathon items have no hints")
            if p.get("difficulty") and n < 10 and p["difficulty"] != RAMP[n]: err(f"{wi} difficulty {p['difficulty']} should be {RAMP[n]}")
            if len(p.get("wrong", [])) != 5: err(f"{wi} needs 5 wrong options")
            opts = [p.get("answer")] + p.get("wrong", [])
            if len(set(norm_ans(o) for o in opts if o)) != 6: err(f"{wi} duplicate options")
            i = p.get("img", {})
            for k in ("url", "source", "page", "author", "licence", "alt"):
                if not i.get(k): err(f"{wi} img.{k} missing")
            if "licence_url" not in i: err(f"{wi} img.licence_url missing (use \"\" for public domain)")
            if i.get("licence") and not OK_LIC.match(i["licence"]): err(f"{wi} licence not allowed: {i['licence']}")
            if BANNED.search(json.dumps(i)): err(f"{wi} banned image source")
            want_url = f"img/athon/{'normie/' if normie else ''}{fd}-{n + 1:02d}.jpg"
            if i.get("url") != want_url: err(f"{wi} img.url should be {want_url}")
            path = os.path.join(G, i.get("url", ""))
            if not os.path.isfile(path): err(f"{wi} image file missing: {i.get('url')}")
            h = sha(path)
            if h:
                if h in HASHES: err(f"{wi} same image file as {HASHES[h]}")
                HASHES[h] = f"{tag}{fd}#{n + 1}"
            pg = i.get("page")
            if pg in IMGKEYS: err(f"{wi} image already used in Glimpsis ({IMGKEYS[pg]})")
            if pg: IMGKEYS[pg] = f"{tag}{fd}#{n + 1}"
            a = norm_ans(p.get("answer")); a0 = a.split(" (")[0]
            if a in mine: err(f"{wi} answer repeated within this Glimpsathon: {a}")
            mine.add(a)
            for pd, pa in past:
                if (a == pa or a0 == pa.split(" (")[0]) and 0 < (dd - pd).days < 90: err(f"{wi} answer '{a}' was in the Glimpsathon of {pd} (<90 days)")
            for qd, qa, qa0 in DAILY[normie]:
                gap = (dd - qd).days
                if (a == qa or a0 == qa0) and -7 <= gap <= 60: err(f"{wi} answer '{a}' matches daily Glimpsis {qd} (needs >60 days before, never that day or the next 7)")
            if normie:
                txt = " ".join([p.get(k, "") for k in ("context", "why", "pearl", "answer")] + p.get("wrong", []))
                m = MEDWORDS.search(txt)
                if m: err(f"{wi} medical word in Normie text: {m.group(0)}")
        past += [(dd, norm_ans(p.get("answer"))) for p in items]
    return len(files)

n1 = check(sorted(glob.glob(G + "/puzzles/20*.json")), False)
n2 = check(sorted(glob.glob(G + "/puzzles/normie/20*.json")), True)
for k in list(IMGKEYS):  # daily image files count too
    if not k.startswith("http") and os.path.isfile(os.path.join(G, k)): HASHES.setdefault(sha(os.path.join(G, k)), IMGKEYS[k])
a1 = check_athon(False)
a2 = check_athon(True)
print(f"Medical {n1}, Normie {n2}, Glimpsathon {a1} + Normie {a2}.", "OK" if not bad else f"{bad} problem(s)"); sys.exit(1 if bad else 0)
