# /mascots/: meet the cast. Game mascots from assets/games.js (MW_MASCOTS), section hosts and topic mascots from data/mascot-cast.json.
import json as _j, re as _re, html as _h
_src = open("assets/games.js", encoding="utf-8").read()
_M = _j.loads(_re.search(r"window\.MW_MASCOTS = (\{.*?\});\n", _src, _re.S).group(1))
_C = _j.load(open("data/mascot-cast.json", encoding="utf-8"))["mascots"]
_GAMES = [("dx", "Dxtective", "/dx/"), ("wordemic", "Wordemic", "/wordemic/"), ("triviosis", "Triviosis", "/triviosis/"), ("glimpsis", "Glimpsis", "/glimpsis/"),
          ("opacitis", "Opacitis", "/opacitis/"), ("panelysis", "Panelysis", "/panelysis/"), ("comorbix", "Comorbix", "/comorbix/"), ("labelosis", "Anatomegaly", "/anatomegaly/"),
          ("linkase", "Linkase", "/linkase/"), ("zebritis", "Zebritis", "/zebritis/"), ("gridectomy", "Gridectomy", "/gridectomy/"), ("suturix", "Suturix", "/suturix/"),
          ("morphemia", "Morphemia", "/morphemia/"), ("sensitosis", "Sensitosis", "/sensitosis/"), ("sudokrine", "Sudokrine", "/sudokrine/"), ("arrhythmix", "Arrhythmix", "/arrhythmix/"),
          ("cryptogenic", "Cryptoplexy", "/cryptoplexy/"), ("grandrounds", "Grand Rounds", "/grandrounds/"), ("deepdives", "Deep dives", "/deep-dives/"), ("stackulus", "Stackulus", "/stackulus/")]
_e = _h.escape
def _card(img, name, role, href, what, vibe, story, cheer=None):
    c = ('<li class="mc"><img src="/assets/mascots/%s.svg" alt="%s, %s" width="96" height="96" loading="lazy"><div>'
         '<p class="mc-r">%s</p><h3>%s</h3><p class="mc-w">%s</p><p class="mc-v">%s</p>') % (img, _e(name), _e(what), (('<a href="%s">%s</a>' % (href, _e(role))) if href else _e(role)), _e(name), _e(what[:1].upper() + what[1:]), _e(vibe))
    if story:
        c += '<details><summary>Read %s story</summary><p>%s</p>%s</details>' % ("her" if name not in ("Norm", "Percy", "Magnus", "Brix", "Otto") else "his", _e(story),
             ('<p class="mc-c"><b>Says when you win:</b> %s</p>' % " · ".join("“%s”" % _e(x) for x in cheer[:4])) if cheer else "")
    return c + "</div></li>"
cards = ""
for k, g, href in _GAMES:
    m = _M.get(k)
    if m: cards += _card(k, m["name"], g, href, m.get("what", ""), m.get("vibe", ""), m.get("story", ""), m.get("cheer"))
hosts = "".join(_card(k, v["name"], v["role"], None, v["animal"], v["vibe"], v["story"]) for k, v in _C.items())
body = ('<p class="lede">Every Malady Wise puzzle has a mascot, and every part of the site has a host. Here they all are, with the back stories nobody asked for.</p>\n'
        '<p class="sass">All characters are fictional. Any resemblance to your registrar is a coincidence.</p>\n'
        '<h2>Game mascots</h2>\n<ul class="mcg">' + cards + '</ul>\n'
        '<h2>Hosts and topic mascots</h2>\n<p>They look after hubs, sections and health topics.</p>\n<ul class="mcg">' + hosts + '</ul>\n'
        '<h2>Basil and Clover</h2>\n<p>The two real cats who started it all, drawn as cartoons. They star in the <a href="/basil-clover/">Basil + Clover</a> arcade game and most of the <a href="/shop/">stickers</a>.</p>\n'
        '<style>.mcg{list-style:none!important;margin:12px 0 24px!important;padding:0!important;display:grid;gap:12px}'
        '.mc{margin:0!important;display:flex;gap:14px;align-items:flex-start;background:var(--card,#fff);border:1px solid var(--line,#E7E0F2);border-radius:16px;padding:14px}'
        '.mc img{flex:none;width:76px;height:76px}.mc h3{margin:0;font-size:18px}.mc-r{margin:0;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted,#6B5A93)}'
        '.mc-w{margin:2px 0 4px;font-size:14px;color:var(--muted,#5C4E7E)}.mc-v{margin:0 0 6px;font-size:15px}.mc details summary{cursor:pointer;font-weight:600;color:var(--accent,#4A3480);font-size:14px}'
        '.mc details p{font-size:15px;margin:6px 0 0}.mc-c{font-size:13.5px!important;color:var(--muted,#5C4E7E)}@media(min-width:900px){.mcg{grid-template-columns:1fr 1fr}}</style>\n')
page("/mascots/", "Meet the Malady Wise Mascots: Back Stories and Win Lines",
     "Meet the mascots behind every Malady Wise puzzle: Dex the fox detective, Lumo the see-through jellyfish, Ruby the blood-drop vampire and the rest, with their back stories.",
     "Meet the mascots", "Malady Wise mascots", "About", [("Malady Wise", "/"), ("Mascots", "/mascots/")], body, [], [],
     [("All puzzles", "/medical-games/"), ("Stickers", "/shop/"), ("About", "/about/")], audience="Patient", about_type="WebPage")
