#!/usr/bin/env python3
"""Put the mascot explainers (slides + video, built by _scripts/video/build_video.py) on the pages they belong to.
Idempotent: a block already on a page (id="mw-x-<name>") is replaced, so re-run after rebuilding a video.

    python3 _scripts/explainers.py
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
X = {  # name: (title, pages)
    "adhd": ("What is ADHD?", ["adhd", "adhd-adults", "adhd-kids", "late-diagnosis-adhd-autism"]),
    "autism": ("What is autism?", ["autism", "autism-adults", "autism-kids", "late-diagnosis-adhd-autism"]),
}


def block(name, title):
    d = "assets/video/what-is-%s" % name
    alts = json.load(open(os.path.join(ROOT, d + "-slides", "alt.json"), encoding="utf-8"))
    secs = os.popen("ffprobe -v error -show_entries format=duration -of csv=p=0 %s.mp4" % os.path.join(ROOT, d)).read().strip()
    mins = "About %d seconds" % (round(float(secs) / 5) * 5) if secs else "Short"
    imgs = "".join('<img src="/%s-slides/%02d.webp" width="720" height="720" loading="lazy" alt="%s">' % (d, k + 1, a.replace('"', "&quot;")) for k, a in enumerate(alts))
    return ('<section class="mw-x" id="mw-x-%s"><h2>%s</h2><p class="evkey">A short picture guide. Tap through the slides, or watch the video.</p>'
            '<div class="mw-slides" tabindex="0" aria-roledescription="slideshow" aria-label="%s Slides"><div class="mws-track">%s</div>'
            '<div class="mws-bar"><button type="button" class="mws-prev">&larr; Back</button><button type="button" class="mws-next">Next &rarr;</button><span class="mws-count" aria-live="polite"></span></div></div>'
            '<figure class="mw-video" style="margin:1.4em 0"><video controls playsinline preload="none" poster="/%s.png" width="1080" height="1080" '
            'style="width:100%%;max-width:560px;height:auto;border-radius:18px;display:block;background:#FAF7F2"><source src="/%s.mp4" type="video/mp4"></video>'
            '<figcaption style="font-size:.9em;color:#6B5A93;margin-top:.4em">Prefer it as a video? %s, no sound needed.</figcaption></figure></section>\n') % (
        name, title, title, imgs, d, d, mins)


def main():
    n = 0
    for name, (title, pages) in X.items():
        b = block(name, title)
        for slug in pages:
            p = os.path.join(ROOT, slug, "index.html")
            if not os.path.exists(p):
                print("missing", slug); continue
            s = open(p, encoding="utf-8").read()
            old = re.search(r'<section class="mw-x" id="mw-x-%s">.*?</section>\n' % name, s, re.S)
            if old:
                s = s[:old.start()] + b + s[old.end():]
            else:
                if 'id="mw-x-' in s:  # a second explainer goes straight after the first
                    pos = [m.end() for m in re.finditer(r'<section class="mw-x" id="mw-x-[a-z]+">.*?</section>\n', s, re.S)][-1]
                else:
                    m = re.search(r'<p class="lede">.*?</p>\n?', s, re.S)
                    if not m:
                        print("no lede", slug); continue
                    pos = m.end()
                    g = re.match(r'\s*(<p class="sass">.*?</p>\s*)?<div class="glance">.*?</div>\n?', s[pos:], re.S)
                    if g: pos += g.end()
                s = s[:pos] + b + s[pos:]
            open(p, "w", encoding="utf-8").write(s); n += 1
    print("explainers: %d page(s)" % n)


if __name__ == "__main__":
    main()
