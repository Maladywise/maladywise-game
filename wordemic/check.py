#!/usr/bin/env python3
"""Wordemic puzzle check: every answer is 5–15 letters, A–Z only, and its length has a guess list
(words.txt for 5, wordsN.txt otherwise) containing the answer. Longer than 15 is never allowed: there
are almost no real words that long, so players couldn't type any guess except the answer itself."""
import glob, json, os, sys
D = os.path.dirname(os.path.abspath(__file__))
MAXLEN, bad = 15, []
lists = {}
def words(n):
    if n not in lists:
        p = os.path.join(D, "words.txt" if n == 5 else "words%d.txt" % n)
        lists[n] = set(open(p).read().split()) if os.path.exists(p) else None
    return lists[n]
for f in sorted(glob.glob(os.path.join(D, "puzzles", "**", "*.json"), recursive=True)):
    data = json.load(open(f, encoding="utf-8"))
    items = data if isinstance(data, list) else data.get("puzzles", [])
    for p in items:
        w = (p.get("word") or "").strip()
        tag = "%s %s %s" % (os.path.relpath(f, D), p.get("date", "reserve"), w)
        if not w.isalpha() or not w.isascii(): bad.append(tag + ": letters A–Z only"); continue
        if not 5 <= len(w) <= MAXLEN: bad.append(tag + ": length %d (allowed 5–%d)" % (len(w), MAXLEN)); continue
        wl = words(len(w))
        if wl is None: bad.append(tag + ": no guess list words%d.txt" % len(w))
        elif w.lower() not in wl: bad.append(tag + ": not in its guess list")
print("\n".join(bad) if bad else "OK")
sys.exit(1 if bad else 0)
