#!/usr/bin/env python3
"""Shared <head> clean-up for every Malady Wise page (stdlib only, idempotent).

    python3 _scripts/headkit.py            fix every *.html in the repo
    python3 _scripts/headkit.py --check    list pages that would change (no writes)

Page generators (build_archives, build_days, gen_mh, gen_sq, quizkit, calckit, specialists) call
fix_html() on their output too, so rebuilt pages come out the same.

What fix_html() does
  1. Fonts are self-hosted (assets/fonts/, @font-face in assets/shell.css): removes the Google Fonts
     preconnects and stylesheet link, and preloads the main body font instead.
  2. Speed: the shared scripts (games.js, site.js, shell.js) and the page's own scripts get `defer`, and
     the start-up call (MW.page() / MW.hub() / MW.game("x")) moves into /assets/boot.js, which runs in the
     same order once the page has loaded. A tiny inline script sets the light/dark theme first so there's
     no flash. Pages with other inline code that needs the site scripts are left as they are.
  3. Honesty: JSON-LD only claims GP review ("reviewedBy", "lastReviewed") on pages that carry
     data-gp-reviewed="YYYY-MM-DD" on <body> or <main> (see STYLE.md). Elsewhere lastReviewed becomes
     dateModified and reviewedBy is removed.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {".git", "node_modules", "_data", "__pycache__", "_scripts", "_social"}
BOOT_V = "1"
FONT_PRELOAD = '<link rel="preload" href="/assets/fonts/poppins-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>'
THEME = ('<script>try{var r=document.documentElement,t=localStorage.getItem("mw-theme");r.setAttribute("data-pre","");try{t=JSON.parse(t)}catch(e){}'
         'r.setAttribute("data-theme",t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light")}catch(e){}</script>')

GF_RE = re.compile(r'[ \t]*<link rel="(?:preconnect|dns-prefetch)" href="https://fonts\.(?:googleapis|gstatic)\.com"[^>]*>\n?'
                   r'|[ \t]*<link rel="stylesheet" href="https://fonts\.googleapis\.com/[^"]*"[^>]*>\n?')
SCRIPT_RE = re.compile(r'<script\b([^>]*)>(.*?)</script>', re.S)
SHARED_RE = re.compile(r'(?:\.\./|/)?assets/(?:games|site|shell)\.js')
BOOT_RES = [
    (re.compile(r'^\s*(?:if\s*\(window\.MW\s*&&\s*MW\.page\)\s*)?MW\.page\(\);?\s*$'), "page", ""),
    (re.compile(r'^\s*MW\.hub\(\);?\s*$'), "hub", ""),
]
GAME_BOOT = re.compile(r'^\s*MW\.game\("([a-z0-9-]+)"\);?\s*$')
LD_RE = re.compile(r'(<script type="application/ld\+json"[^>]*>)(.*?)(</script>)', re.S)


def gp_reviewed(src):
    m = re.search(r'<(?:body|main)\b[^>]*\bdata-gp-reviewed="(\d{4}-\d{2}-\d{2})"', src)
    return m.group(1) if m else ""


def fix_fonts(src):
    if "fonts.googleapis.com" not in src and "fonts.gstatic.com" not in src:
        return src
    had_sheet = 'href="https://fonts.googleapis.com/' in src and 'rel="stylesheet"' in src
    out, done = [], False

    def rep(m):
        nonlocal done
        if "stylesheet" in m.group(0) and not done and FONT_PRELOAD not in src:
            done = True
            return FONT_PRELOAD + "\n"
        return ""
    src = GF_RE.sub(rep, src)
    if had_sheet and not done and FONT_PRELOAD not in src:
        src = src.replace("</head>", FONT_PRELOAD + "\n</head>", 1)
    return src


def fix_ld(src):
    if gp_reviewed(src):
        return src

    def rep(m):
        raw = m.group(2)
        if "reviewedBy" not in raw and "lastReviewed" not in raw:
            return m.group(0)
        try:
            j = json.loads(raw)
        except ValueError:
            return m.group(0)
        changed = [False]

        def walk(o):
            if isinstance(o, dict):
                if "reviewedBy" in o:
                    del o["reviewedBy"]; changed[0] = True
                if "lastReviewed" in o:
                    v = o.pop("lastReviewed"); changed[0] = True
                    o.setdefault("dateModified", v)
                for v in o.values():
                    walk(v)
            elif isinstance(o, list):
                for v in o:
                    walk(v)
        walk(j)
        if not changed[0]:
            return m.group(0)
        compact = '": "' not in raw and '", "' not in raw
        txt = json.dumps(j, ensure_ascii=False, separators=(",", ":") if compact else None)
        if "<\\/" in raw or "</" in txt:
            txt = txt.replace("</", "<\\/")
        return m.group(1) + txt + m.group(3)
    return LD_RE.sub(rep, src)


def fix_defer(src):
    hi = src.find("</head>")
    if hi < 0 or "/assets/boot.js" in src:
        return src
    scripts = list(SCRIPT_RE.finditer(src))
    shared = [m for m in scripts if m.start() < hi and "src=" in m.group(1) and SHARED_RE.search(m.group(1))]
    if not shared:
        return src
    edits, seen_ext, seen_boot = [], False, False  # edits: (start, end, new text)
    for m in scripts:
        attrs, body = m.group(1), m.group(2)
        if "application/ld+json" in attrs:
            continue
        if "src=" in attrs:
            if "defer" in attrs or "async" in attrs or "type=\"module\"" in attrs:
                if "async" in attrs and m.start() > hi:
                    return src  # async page scripts: order unknown, leave the page alone
                seen_ext = True
                continue
            seen_ext = True
            edits.append((m.start(), m.end(), "<script defer" + attrs + "></script>"))
            continue
        if m.start() < hi:
            if "MW" in body:
                return src
            continue  # e.g. the theme script
        boot = None
        for rx, kind, _ in BOOT_RES:
            if rx.match(body):
                boot = '<script defer src="/assets/boot.js?v=%s" data-mw="%s"></script>' % (BOOT_V, kind)
        g = GAME_BOOT.match(body)
        if g:
            boot = '<script defer src="/assets/boot.js?v=%s" data-mw="game" data-g="%s"></script>' % (BOOT_V, g.group(1))
        if boot:
            edits.append((m.start(), m.end(), boot))
            seen_boot = True
            continue
        # other inline code: fine only if it needs nothing from the site scripts or a page script before it
        if re.search(r"\bMW", body) or seen_boot or seen_ext_after_head(scripts, m, hi):
            return src
    if not seen_boot:
        return src  # no start-up call (redirect stubs etc.): nothing to gain, leave as is
    for a, b, t in sorted(edits, reverse=True):
        src = src[:a] + t + src[b:]
    if THEME not in src:
        i = src.find("<link rel=\"stylesheet\"")
        i = i if 0 <= i < src.find("</head>") else src.find("</head>")
        src = src[:i] + THEME + "\n" + src[i:]
    return src


def seen_ext_after_head(scripts, cur, hi):
    for m in scripts:
        if m.start() >= cur.start():
            return False
        if m.start() > hi and "src=" in m.group(1):
            return True
    return False


def fix_html(src):
    return fix_defer(fix_ld(fix_fonts(src)))


def pages():
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = sorted(x for x in dirs if x not in SKIP_DIRS)
        for f in sorted(files):
            if f.endswith(".html"):
                yield os.path.join(d, f)


def main():
    check = "--check" in sys.argv
    n = 0
    for p in pages():
        s = open(p, encoding="utf-8").read()
        t = fix_html(s)
        if t != s:
            n += 1
            if check:
                print(os.path.relpath(p, ROOT))
            else:
                open(p, "w", encoding="utf-8").write(t)
    print("%d page(s) %s" % (n, "would change" if check else "updated"))
    return 1 if check and n else 0


if __name__ == "__main__":
    sys.exit(main())
