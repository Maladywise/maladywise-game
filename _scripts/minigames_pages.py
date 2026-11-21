"""Builds the pages for the small time-gated / secret games: /triagic/ (secret, unlocked by typing "quiet"),
/lunicorn/ (full-moon nights only) and /fridaemia/ (Fridays 4:30-7pm local). Run: python3 _scripts/minigames_pages.py"""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/"
HEAD = """<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
%(canon)s<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="%(robots)s">
<title>%(title)s | Malady Wise</title>
<meta name="description" content="%(desc)s">
<link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="48x48" href="../assets/favicon-48.png">
<link rel="icon" type="image/png" sizes="96x96" href="../assets/favicon-96.png">
<link rel="icon" type="image/png" sizes="192x192" href="../assets/favicon-192.png">
<link rel="icon" type="image/png" sizes="512x512" href="../assets/favicon.png">
<link rel="apple-touch-icon" href="../assets/apple-touch-icon.png">
<meta name="theme-color" content="%(theme)s">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Malady Wise">
<link rel="preload" href="/assets/fonts/poppins-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<script>try{var r=document.documentElement,t=localStorage.getItem("mw-theme");r.setAttribute("data-pre","");try{t=JSON.parse(t)}catch(e){}r.setAttribute("data-theme",t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light")}catch(e){}</script>
<link rel="stylesheet" href="../assets/shell.css?v=249">
<link rel="stylesheet" href="../assets/mg.css?v=1">
<style>%(css)s</style>
<script defer src="../assets/games.js?v=127"></script>
<script defer src="../assets/shell.js?v=299"></script>
</head>
<body>
<main class="wrap mg-page">
%(body)s
  <footer class="site"><p class="ft-base"><span class="ft-note">%(foot)s</span> <span class="ft-links"><a href="/about/">About</a> <a href="/disclaimer/">Disclaimer</a> <a href="/privacy/">Privacy</a> <a href="/contact/">Contact</a></span></p></footer>
</main>
<script defer src="/assets/boot.js?v=1" data-mw="page"></script>
<script defer src="/assets/mg.js?v=2"></script>
%(scripts)s
</body>
</html>
"""
END = """  <section class="mg-card mg-end" id="%(p)s-end" hidden>
    <p class="mg-q" id="%(p)s-etitle">%(etitle)s</p>
    <p class="mg-score" id="%(p)s-final"></p>
    <p id="%(p)s-verdict"></p>
    <div class="mg-btns"><button class="big" type="button" id="%(p)s-again">%(again)s</button><button class="mg-sbtn" type="button" id="%(p)s-share">Share</button></div>
  </section>
  <p class="mg-foot"><a href="/">&larr; Back to the puzzles</a></p>"""

PAGES = {
 "fridaemia": dict(
  title="Fridaemia: The 5pm Friday Results Inbox", robots="noindex", theme="#7A1F2B",
  canon="",
  desc="Fridaemia is a free weekly GP game, open Fridays 4:30 to 7pm only: eight results land at knock-off time. ED now, call today, or Monday?",
  foot="A teaching game with fictional patients. Real decisions depend on the whole patient and local guidelines.",
  css=":root{--mg-a:#7A1F2B;--mg-b:#4A1220;--mg-hi:#FFD3D8;--mg-soft:#FBEDEF}.fr-res{font:700 20px/1.35 var(--body);color:var(--mg-a)}html[data-theme=dark] .fr-res{color:var(--mg-hi)}",
  body="""  <section class="mg-intro" id="fr-intro">
    <img class="mg-masc" src="/assets/mascots/panelysis.svg" alt="Ruby the vampire, host of the blood test games" width="104" height="104">
    <p class="mg-kick">&#128229; Fridays, 4:30 to 7pm only</p>
    <h1>Fridaemia</h1>
    <p class="mg-lede">It&rsquo;s 5pm on a Friday. You&rsquo;re reaching for your keys when eight results land in your inbox. For each one: ED now, call today, or Monday is fine?</p>
    <p class="mg-small">Same eight results for everyone this week. Ruby hosts.</p>
    <p class="mg-lock" id="fr-lock"></p>
    <button class="big" type="button" id="fr-play">Open the inbox</button>
    <p class="mg-best" id="fr-best"></p>
  </section>
  <section class="mg-game" id="fr-game" hidden>
    <div class="mg-hud"><span class="mg-grow"><small>Fridaemia</small><b>Inbox</b></span><span><small>Result</small><b id="fr-n">1/8</b></span><span><small>Safe calls</small><b id="fr-s">0</b></span></div>
    <div class="mg-card" id="fr-q"></div>
  </section>
""" + END % dict(p="fr", etitle="Inbox cleared. Keys in hand.", again="Back to the start"),
  scripts='<script defer src="fridaemia.js?v=2"></script>'),
 "triagic": dict(
  title="Triagic", robots="noindex", theme="#B3261E", canon="",
  desc="Shh. You said the Q word. A secret Malady Wise game.",
  foot="A secret game with fictional patients. Not medical advice.",
  css=""":root{--mg-a:#B3261E;--mg-b:#5A0F0B;--mg-hi:#FFE08A;--mg-soft:#FDECEA}
.tr-bar{flex:1 1 140px;min-width:120px;height:14px;border-radius:999px;background:rgba(255,255,255,.2);overflow:hidden;position:relative}
.tr-bar i{position:absolute;inset:0 auto 0 0;background:#FFE08A;transition:width .25s}.tr-bar.warm i{background:#FFB547}.tr-bar.hot i{background:#FF5A4E}
.tr-room{display:grid;gap:8px}
.tr-pt{position:relative;display:flex;gap:12px;align-items:center;text-align:left;font:500 15px/1.35 var(--body);padding:12px 14px 16px;border-radius:16px;border:2px solid var(--line,#E4DCF0);background:var(--card,#fff);color:inherit;cursor:pointer;overflow:hidden}
.tr-pt b{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase}
.tr-pt.c1{border-color:#D93025}.tr-pt.c1 b{color:#D93025}.tr-pt.c2{border-color:#F29900}.tr-pt.c2 b{color:#B06F00}.tr-pt.c3{border-color:#1E8E3E}.tr-pt.c3 b{color:#1E8E3E}
.tr-pt.bad{animation:trpulse 1s infinite}@keyframes trpulse{50%{background:#FDECEA}}
.tr-pt i{position:absolute;left:0;bottom:0;height:4px;background:currentColor;opacity:.35}
.tr-em,.tr-big{font-size:28px;line-height:1}
.tr-empty{text-align:center;color:var(--muted,#6B5A93);padding:20px}
.tr-curve{position:fixed;inset:0;z-index:50;display:grid;place-items:center;background:rgba(40,8,6,.55);padding:16px}
.tr-cb{background:#FAF7F2;color:#2B2340;border-radius:20px;padding:20px;max-width:340px;text-align:center;display:grid;gap:10px;justify-items:center;animation:trshake .4s}
.tr-cb span{font-size:42px}.tr-cb p{margin:0;font:600 17px var(--body)}
@keyframes trshake{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
.tr-siren{animation:trsiren 1s steps(2) 3}@keyframes trsiren{50%{filter:hue-rotate(-40deg) saturate(1.6)}}
@media (prefers-reduced-motion:reduce){.tr-pt.bad,.tr-cb,.tr-siren{animation:none}}""",
  body="""  <section class="mg-intro tr-siren" id="tr-intro">
    <img class="mg-masc" src="/assets/mascots/sensitosis.svg" alt="Sunny the meerkat, on lookout" width="104" height="104">
    <p class="mg-kick">&#128680; You said the Q word</p>
    <h1>Triagic</h1>
    <p class="mg-lede">Never say &ldquo;quiet&rdquo; in ED. Now the waiting room is filling up. Three minutes, one shift: tap a patient, make the call, keep the chaos under 100%.</p>
    <p class="mg-small">Cat 1 can&rsquo;t wait. Long waits, wrong calls and a full waiting room all add chaos.</p>
    <button class="big" type="button" id="tr-play">Start the shift</button>
    <p class="mg-best" id="tr-best"></p>
    <p class="mg-small"><i>Shh. It&rsquo;s not on the menu.</i></p>
  </section>
  <section class="mg-game" id="tr-game" hidden>
    <div class="mg-hud"><span><small>Shift left</small><b id="tr-time">3:00</b></span><span><small>Score</small><b id="tr-score">0</b></span><span><small>Sorted</small><b id="tr-saved">0</b></span>
      <span class="mg-grow" style="flex:1 1 160px"><small>Chaos <span id="tr-chaosn">0%</span></small><span class="tr-bar" id="tr-chaosbar"><i id="tr-chaos" style="width:0"></i></span></span></div>
    <div class="tr-room" id="tr-room"></div>
    <div class="mg-card" id="tr-case" hidden></div>
  </section>
  <div class="tr-curve" id="tr-curve" hidden></div>
  <section class="mg-card mg-end" id="tr-end" hidden>
    <p class="mg-q" id="tr-etitle"></p>
    <p class="mg-score" id="tr-escore"></p>
    <p id="tr-emsg"></p>
    <p class="mg-small" id="tr-ebest"></p>
    <div class="mg-btns"><button class="big" type="button" id="tr-again">Another shift</button><button class="mg-sbtn" type="button" id="tr-share">Share</button></div>
  </section>
  <p class="mg-foot"><a href="/">&larr; Back to the puzzles</a></p>""",
  scripts='<script defer src="cases.js?v=3"></script>\n<script defer src="triagic.js?v=2"></script>'),
 "lunicorn": dict(
  title="Lunicorn", robots="noindex", theme="#2E1F57", canon="",
  desc="Ziggy only comes out under a full moon. A secret Malady Wise game.",
  foot="A secret game. Not medical advice, just moonlight and unicorns.",
  css=""":root{--mg-a:#3B2A73;--mg-b:#120B2E;--mg-hi:#FFE08A;--mg-soft:#F1ECF8}
:root[data-moon=blue]{--mg-a:#1F4FA8;--mg-b:#0A1A44;--mg-hi:#9FD3FF;--mg-soft:#E6F0FC}
:root[data-moon=blood]{--mg-a:#8E1B1B;--mg-b:#2A0606;--mg-hi:#FFB199;--mg-soft:#FBE9E7}
.lu-intro::before{content:"";position:absolute;right:22px;top:18px;width:58px;height:58px;border-radius:50%;background:#FFF6D6;box-shadow:0 0 40px 10px rgba(255,246,214,.45)}
:root[data-moon=blue] .lu-intro::before{background:#CFE6FF;box-shadow:0 0 40px 10px rgba(159,211,255,.5)}
:root[data-moon=blood] .lu-intro::before{background:#C0392B;box-shadow:0 0 40px 10px rgba(192,57,43,.55)}
.lu-ziggy{animation:lurainbow 6s linear infinite}
@keyframes lurainbow{0%{filter:drop-shadow(0 0 10px #ff5e5e)}20%{filter:drop-shadow(0 0 10px #ffb347)}40%{filter:drop-shadow(0 0 10px #fff275)}60%{filter:drop-shadow(0 0 10px #6fe38a)}80%{filter:drop-shadow(0 0 10px #6fb7ff)}100%{filter:drop-shadow(0 0 10px #c58bff)}}
:root[data-moon=blue] .lu-ziggy{animation:none;filter:drop-shadow(0 0 12px #6fb7ff) hue-rotate(200deg)}
:root[data-moon=blood] .lu-ziggy{animation:none;filter:drop-shadow(0 0 12px #ff5e5e) sepia(.6) saturate(3) hue-rotate(-30deg)}
.lu-horn{position:absolute;font-size:30px;margin:-6px 0 0 34px;transform:rotate(-20deg)}
.lu-chip{width:46px;height:46px;border-radius:14px;box-shadow:inset 0 0 0 2px rgba(0,0,0,.08)}
.lu-stripe{display:flex;gap:4px;height:12px}.lu-stripe i{flex:1;border-radius:999px;border:1px solid var(--line,#E4DCF0);transition:background .4s}
@media (prefers-reduced-motion:reduce){.lu-ziggy{animation:none}}""",
  body="""  <section class="mg-intro lu-intro" id="lu-intro">
    <div style="position:relative"><img class="mg-masc lu-ziggy" src="/assets/mascots/zebritis.svg" alt="Ziggy the zebra, secretly a unicorn" width="104" height="104"><span class="lu-horn" aria-hidden="true">&#129412;</span></div>
    <p class="mg-kick" id="lu-kick">&#127765; Full moon tonight</p>
    <h1 id="lu-h1">Lunicorn</h1>
    <p class="mg-lede" id="lu-lede"></p>
    <p class="mg-lock" id="lu-lock" style="empty-cells:hide"></p>
    <button class="big" type="button" id="lu-play">Find Ziggy</button>
    <p class="mg-best" id="lu-best"></p>
    <p class="mg-small"><i>Emergency departments aren&rsquo;t actually busier on full moons. We are.</i></p>
  </section>
  <section class="mg-game" id="lu-game" hidden>
    <div class="mg-hud"><span class="mg-grow"><small>Lunicorn</small><b>Colours of medicine</b></span><span><small>Colour</small><b id="lu-n">1/10</b></span><span><small>Unicorns</small><b id="lu-s">0</b></span></div>
    <div class="lu-stripe" id="lu-stripe" aria-hidden="true"></div>
    <div class="mg-card" id="lu-q"></div>
  </section>
""" + END % dict(p="lu", etitle="Your rainbow", again="Play again"),
  scripts='<script defer src="sets.js?v=2"></script>\n<script defer src="lunicorn.js?v=1"></script>'),
}
for k, v in PAGES.items():
    os.makedirs(ROOT + k, exist_ok=True)
    open(ROOT + k + "/index.html", "w").write(HEAD % v)
    print("wrote /%s/" % k)
