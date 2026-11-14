# /mascots/: the mascot hub (every mascot, click through), plus one page per mascot at /mascots/<name>/.
# Game mascots come from assets/games.js (MW_MASCOTS); section hosts and topic mascots from data/mascot-cast.json.
# After page() writes each file, _fix() drops the print button and the clinician footer, and adds the big hero.
import json as _j, re as _re, html as _h, os as _os, unicodedata as _ud
_src = open("assets/games.js", encoding="utf-8").read()
_M = _j.loads(_re.search(r"window\.MW_MASCOTS = (\{.*?\});\n", _src, _re.S).group(1))
_C = _j.load(open("data/mascot-cast.json", encoding="utf-8"))["mascots"]
_GAMES = [("dx", "Dxtective", "/dxtective/"), ("wordemic", "Wordemic", "/wordemic/"), ("triviosis", "Triviosis", "/triviosis/"), ("glimpsis", "Glimpsis", "/glimpsis/"),
          ("opacitis", "Opacitis", "/opacitis/"), ("panelysis", "Panelysis", "/panelysis/"), ("comorbix", "Comorbix", "/comorbix/"), ("labelosis", "Anatomegaly", "/anatomegaly/"),
          ("linkase", "Linkase", "/linkase/"), ("zebritis", "Zebritis", "/zebritis/"), ("gridectomy", "Gridectomy", "/gridectomy/"), ("suturix", "Suturix", "/suturix/"),
          ("morphemia", "Morphemia", "/morphemia/"), ("sensitosis", "Sensitosis", "/sensitosis/"), ("sudokrine", "Sudokrine", "/sudokrine/"), ("arrhythmix", "Arrhythmix", "/arrhythmix/"),
          ("cryptogenic", "Cryptoplexy", "/cryptoplexy/"), ("grandrounds", "Grand Rounds", "/grand-rounds/"), ("deepdives", "Deep dives", "/deep-dives/"), ("stackulus", "Stackulus", "/stackulus/"),
          ("mergeon", "Mergeon", "/mergeon/")]
# where each host works (only pages that exist and aren't redirects)
_HOME = {"medicines": "/medicines/", "normie/norm": "/normie/", "gphub": "/doctors/", "gpschool": "/gp-school/", "specialists": "/specialists/",
         "research": "/research/", "exercises": "/exercises/", "layla": "/tiredwise/", "patients": "/patients/", "mentalhealth": "/mental-health/",
         "sleep": "/sleep/", "travel": "/travel/"}
_HE = ("Norm", "Percy", "Magnus", "Brix", "Otto")
_e = _h.escape
def _slug(n): return _re.sub(r"[^a-z0-9]+", "-", _ud.normalize("NFKD", n).encode("ascii", "ignore").decode().lower()).strip("-")
def _live(href):
    if not href: return None
    f = _os.path.join(href.strip("/"), "index.html")
    return href if _os.path.exists(f) and 'http-equiv="refresh"' not in open(f, encoding="utf-8").read(3000) else None

# one list of every mascot: (img key, name, role, href, what, vibe, story, cheer, kind)
ALL = []
for k, g, href in _GAMES:
    m = _M.get(k)
    if m: ALL.append((k, m["name"], g + " mascot", _live(href), m.get("what", ""), m.get("vibe", ""), m.get("story", ""), m.get("cheer") or [], "game"))
for k, v in _C.items():
    ALL.append((k, v["name"], v["role"], _live(_HOME.get(k)), v["animal"], v["vibe"], v["story"], [], "host"))
_seen = {}
for i, a in enumerate(ALL):
    s = _slug(a[1]); s = s if s not in _seen else s + "-" + _slug(a[2]).split("-")[0]
    _seen[s] = 1; ALL[i] = a + (s,)

def _fix(url, hero):
    f = url.strip("/") + "/index.html"
    if not _os.path.exists(f): return
    s = open(f, encoding="utf-8").read()
    s = _re.sub(r'<div class="fs-top">.*?</div>\n', "", s, count=1)
    s = _re.sub(r'<p class="meta"><em>Updated ([^.]+)\. For health professionals\.[^<]*</em></p>', r'<p class="meta">Updated \1.</p>', s)
    if hero: s = _re.sub(r"<h1>(.*?)</h1>", hero, s, count=1)
    open(f, "w", encoding="utf-8").write(s)

_CSS = ('<style>.mcg{list-style:none!important;margin:12px 0 24px!important;padding:0!important;display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}'
        '.mcg li{margin:0!important}.mcg a{display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px;background:var(--card,#fff);border:1px solid var(--line,#E7E0F2);border-radius:16px;padding:14px 10px;text-decoration:none;color:var(--ink);height:100%;box-sizing:border-box;transition:border-color .15s,transform .15s}'
        '.mcg a:hover,.mcg a:focus-visible{border-color:var(--brand,#4A3480);transform:translateY(-2px)}.mcg img{width:84px;height:84px}.mcg b{font-size:17px}.mcg span{font-size:12.5px;color:var(--muted,#5C4E7E);line-height:1.35}'
        '.mcg i{font-style:normal;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--accent,#4A3480)}</style>\n')
def _tile(a):
    k, name, role, href, what, vibe, story, cheer, kind, slug = a
    return ('<li><a href="/mascots/%s/"><img src="/assets/mascots/%s.svg" alt="" width="84" height="84" loading="lazy"><b>%s</b><i>%s</i><span>%s</span></a></li>'
            % (slug, k, _e(name), _e(role), _e(what[:1].upper() + what[1:])))
games = [a for a in ALL if a[8] == "game"]; hosts = [a for a in ALL if a[8] == "host"]
body = ('<p class="lede">Every Malady Wise puzzle has a mascot, and every part of the site has a host. Tap one to read her story.</p>\n'
        '<p class="sass">All characters are fictional. Any resemblance to your registrar is a coincidence.</p>\n'
        '<h2>Game mascots</h2>\n<ul class="mcg">' + "".join(_tile(a) for a in games) + '</ul>\n'
        '<h2>Hosts and topic mascots</h2>\n<p>They look after hubs, sections and health topics.</p>\n<ul class="mcg">' + "".join(_tile(a) for a in hosts) + '</ul>\n'
        '<h2>Basil and Clover</h2>\n<p>The two real cats who started it all, drawn as cartoons. They star in the <a href="/basil-clover/">Basil + Clover</a> arcade game and most of the <a href="/shop/">stickers</a>.</p>\n' + _CSS)
page("/mascots/", "Meet the Malady Wise Mascots: Back Stories and Win Lines",
     "Meet the mascots behind every Malady Wise puzzle and section: Dex the fox detective, Lumo the see-through jellyfish, Pippa the elephant and the rest, each with a back story.",
     "Meet the mascots", "Malady Wise mascots", "About", [("Malady Wise", "/"), ("Mascots", "/mascots/")], body, [], [],
     [("All puzzles", "/medical-games/"), ("Stickers", "/shop/"), ("About", "/about/")], audience="Patient", about_type="WebPage")
_fix("/mascots/", None)

# one page per mascot
_PCSS = ('<style>.mz-hero{display:flex;align-items:center;gap:16px;margin:8px 0 6px}.mz-hero img{flex:none;width:120px;height:120px}.mz-hero h1{margin:0}'
         '.mz-role{margin:2px 0 0;font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--accent,#4A3480)}'
         '.mz-story p{font-size:17px;line-height:1.65}.mz-cheer{list-style:none!important;padding:0!important;display:grid;gap:8px}'
         '.mz-cheer li{margin:0!important;background:var(--card,#fff);border:1px solid var(--line,#E7E0F2);border-radius:12px;padding:10px 12px;font-style:italic}'
         '.mz-nav{display:flex;justify-content:space-between;gap:10px;margin:22px 0 6px;flex-wrap:wrap}.mz-nav a{display:flex;align-items:center;gap:8px;text-decoration:none;font-weight:600}'
         '.mz-vid{margin:6px 0 18px}.mz-vid summary{cursor:pointer;font-weight:600;color:var(--accent,#4A3480)}.mz-vid video{display:block;margin:10px auto 0;width:min(100%,360px);height:auto;border-radius:14px;background:#1B1430}'
         '.mz-nav img{width:40px;height:40px}@media(max-width:520px){.mz-hero img{width:92px;height:92px}}</style>\n')
for i, a in enumerate(ALL):
    k, name, role, href, what, vibe, story, cheer, kind, slug = a
    pr, pv = ("him", "his") if name in _HE else ("her", "her")
    prv, nxt = ALL[i - 1], ALL[(i + 1) % len(ALL)]
    sents = _re.split(r"(?<=[.!?])\s+", story)
    paras = [" ".join(sents[j:j + 3]) for j in range(0, len(sents), 3)] if story else []
    b = ('<p class="lede">%s</p>\n' % _e(vibe)
         + '<h2>%s story</h2>\n<div class="mz-story">%s</div>\n' % (("His" if pv == "his" else "Her"), "".join("<p>%s</p>" % _e(p) for p in paras))
         + (('<details class="mz-vid"><summary>▶ Watch %s story (short video)</summary><video controls playsinline preload="none" poster="/assets/video/mascots/%s.jpg" width="360" height="640">'
             '<source src="/assets/video/mascots/%s.mp4" type="video/mp4"></video></details>\n') % (pv, slug, slug) if _os.path.exists("assets/video/mascots/%s.mp4" % slug) else "")
         + (('<h2>What %s says when you win</h2>\n<ul class="mz-cheer">' % ("he" if pr == "him" else "she")) + "".join("<li>“%s”</li>" % _e(c) for c in cheer[:6]) + "</ul>\n" if cheer else "")
         + ('<p>Find %s in <a href="%s">%s</a>.</p>\n' % (pr, href, _e(role.replace(" mascot", "")))) if href else "")
    b += ('<nav class="mz-nav" aria-label="More mascots"><a href="/mascots/%s/"><img src="/assets/mascots/%s.svg" alt="" width="40" height="40" loading="lazy">← %s</a>'
          '<a href="/mascots/">All mascots</a><a href="/mascots/%s/">%s → <img src="/assets/mascots/%s.svg" alt="" width="40" height="40" loading="lazy"></a></nav>\n'
          % (prv[9], prv[0], _e(prv[1]), nxt[9], _e(nxt[1]), nxt[0])) + _PCSS
    url = "/mascots/%s/" % slug
    what1 = what[:1].upper() + what[1:]
    page(url, "%s: %s | Malady Wise Mascots" % (name, what1[:60]),
         "Meet %s, %s, the %s at Malady Wise. %s" % (name, what, role[:1].lower() + role[1:], vibe)[:160],
         name, name, "About", [("Malady Wise", "/"), ("Mascots", "/mascots/"), (name, url)], b, [], [],
         [("All mascots", "/mascots/")] + ([(role.replace(" mascot", ""), href)] if href else []), audience="Patient", about_type="WebPage")
    _fix(url, '<div class="mz-hero"><img src="/assets/mascots/%s.svg" width="120" height="120" alt="%s, %s"><div><h1>%s</h1><p class="mz-role">%s</p></div></div>'
         % (k, _e(name), _e(what), _e(name), _e(role)))
