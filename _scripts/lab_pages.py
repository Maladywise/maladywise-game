#!/usr/bin/env python3
"""Labs games inside the normal site shell (26 Nov 2026).
Source game code lives in _scripts/lab_src/<slug>.html (style + markup + script, standalone).
This wraps it in the Nomulous-style page: header, mascot intro, footer, noindex.
Run: python3 _scripts/lab_pages.py"""
import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/"
TPL = open(ROOT + "nomulous/index.html", encoding="utf-8").read().replace("../assets/", "/assets/")
VARS = ("#lb-game{--true:#0F6B4F;--false:#A3302A;--gold:#F2B544;--dot:#F2B544;--plum:#7A2E5C;--teal:#0F5C4A;--on:#fff;--bad:#B3261E;"
        "--display:var(--title,Georgia,serif);--paper:var(--card)}\n")
def scope(css):
    """Prefix every selector with #lb-game so game classes (.card, .bar, .end...) never clash with the site CSS."""
    out, i = [], 0
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    while i < len(css):
        j = css.find("{", i)
        if j < 0: break
        sel = css[i:j].strip()
        if sel.startswith("@media") or sel.startswith("@supports"):
            depth, k = 1, j + 1
            while depth and k < len(css):
                depth += {"{": 1, "}": -1}.get(css[k], 0); k += 1
            out.append(sel + "{" + scope(css[j + 1:k - 1]) + "}"); i = k; continue
        if sel.startswith("@"):
            depth, k = 1, j + 1
            while depth and k < len(css):
                depth += {"{": 1, "}": -1}.get(css[k], 0); k += 1
            out.append(css[i:k]); i = k; continue
        k = css.find("}", j)
        out.append(",".join("#lb-game " + x.strip() for x in sel.split(",") if x.strip()) + css[j:k + 1]); i = k + 1
    return VARS + "\n".join(out) if not css.startswith("#lb") else "\n".join(out)
GAMES = [
 dict(slug="bunkemia", title="Bunkemia: Myth or Medicine?", desc="Five clinical claims, ten seconds each: myth or medicine? A Malady Wise Labs beta game, judged on the trial evidence.",
      a="#3E5C76", b="#22384D", kick="🧪 Labs beta · Myth or medicine?", h1="Bunkemia",
      lede="Five clinical claims. Ten seconds each. True or bunk? Every answer shows the trial evidence.",
      masc="Ivo the sceptical owl, who wants to see the evidence", small="<i>Ivo trusts randomised trials, not vibes.</i>", path="lab/bunkemia/"),
 dict(slug="gaslitis", title="Gaslitis: Dismiss the Patient, See What You Missed", desc="A role-reversal teaching game: play the dismissive doctor, then see the diagnosis you missed and who usually hears those lines.",
      a="#7A2E5C", b="#4A1A38", kick="🧪 Labs beta · Role reversal", h1="Gaslitis",
      lede="You're the doctor, and every shortcut is a bias. Dismiss eight patients, watch how they react, then see what you missed.",
      masc="Flick the gas lamp, who knows exactly what gaslighting looks like", small="<i>Ageism, weight bias, stigma, overshadowing, racial and gender bias. Every line is something real patients report hearing.</i>", path="lab/gaslitis-r8q/"),
]
for G in GAMES:
    src = open(ROOT + "_scripts/lab_src/" + G["slug"] + ".html", encoding="utf-8").read()
    css = "\n".join(re.findall(r"<style>(.*?)</style>", src, re.S))
    css = scope(css)
    js = "\n".join(re.findall(r"<script>(.*?)</script>", src, re.S))
    body = re.search(r'(<div id="app"></div>.*?)<script>', src, re.S).group(1)
    h = TPL
    h = re.sub(r'<link rel="canonical"[^>]*>', '<link rel="canonical" href="https://maladywise.com/%s">' % G["path"], h)
    h = re.sub(r'<meta name="robots"[^>]*>', '<meta name="robots" content="noindex,nofollow">', h)
    h = re.sub(r"<title>.*?</title>", "<title>%s | Malady Wise</title>" % G["title"], h)
    h = re.sub(r'<meta name="description"[^>]*>', '<meta name="description" content="%s">' % G["desc"], h)
    h = re.sub(r'<script type="application/ld\+json" id="mw-breadcrumb-ld">.*?</script>\n?', "", h, flags=re.S)
    h = re.sub(r"<style>:root\{--mg-a.*?</style>", "<style>:root{--mg-a:%s;--mg-b:%s;--mg-hi:#FFE08A}\n%s</style>" % (G["a"], G["b"], css), h, count=1, flags=re.S)
    h = re.sub(r'<style>\.nm-rv.*?</style>\n?', "", h, flags=re.S)
    h = re.sub(r'<meta property="og:[^>]*>\n?|<meta name="twitter:[^>]*>\n?', "", h)
    main = ('<main class="wrap mg-page">\n  <section class="mg-intro" id="lb-intro">\n'
            '    <img class="mg-masc" src="/assets/mascots/%s.svg" alt="%s" width="104" height="104">\n'
            '    <p class="mg-kick">%s</p>\n    <h1>%s</h1>\n    <p class="mg-lede">%s</p>\n'
            '    <button class="big" type="button" id="lb-play">Start</button>\n    <p class="mg-small">%s</p>\n  </section>\n'
            '  <section class="lb-game" id="lb-game" hidden>\n%s\n  </section>\n'
            '  <p class="mg-foot"><a href="/">&larr; Back to the puzzles</a> · <a href="/contact/">Send feedback</a></p>\n'
            ) % (G["slug"], G["masc"], G["kick"], G["h1"], G["lede"], G["small"], body)
    i = h.index('<main class="wrap mg-page">'); j = h.index("  <footer class=\"site\">")
    h = h[:i] + main + h[j:]
    h = re.sub(r'<p class="ft-base"><span class="ft-note">[^<]*</span>', '<p class="ft-base"><span class="ft-note">A Labs beta teaching game. Education only, not advice for an individual patient.</span>', h)
    # drop Nomulous scripts, add this game's script + start wiring
    h = re.sub(r'<script defer src="/assets/mg.js[^"]*"></script>\n<script defer src="signs.js[^"]*"></script>\n<script defer src="facts.js[^"]*"></script>\n<script defer src="nomulous.js[^"]*"></script>\n', "", h)
    start = ('<script>\ndocument.getElementById("lb-play").onclick=function(){document.getElementById("lb-intro").hidden=true;var g=document.getElementById("lb-game");g.hidden=false;'
             'if(window.LB_start)LB_start();g.scrollIntoView({behavior:"smooth",block:"start"});};\n' + js + "\n</script>\n")
    h = h.replace("</body>", start + "</body>")
    open(ROOT + G["path"] + "index.html", "w", encoding="utf-8").write(h)
    print("wrote", G["path"])
