# /da/: hidden nod to cryptic setter DA (secret: type "astle", or the Cabinet of Curiosities). noindex, not in the sitemap. Original clues only.
import os as _osd, re as _red
_CLUES = [
  ("1", "Severn flowing, giving you the jitters (6)", "NERVES", "Anagram: SEVERN, “flowing”, rearranges to NERVES. Jitters is the definition."),
  ("2", "Organ hidden in Bali very much (5)", "LIVER", "Hidden word: ba<b>LI VER</b>y."),
  ("3", "Tablet: a constant, then two lefts (4)", "PILL", "Charade: PI (a constant) + L + L (two lefts)."),
  ("4", "Like inside right hand? It’s an outbreak on the skin (4)", "RASH", "Container: AS (like) inside R (right) + H (hand)."),
  ("5", "Get better, we hear, at the back of the foot (4)", "HEEL", "Homophone: sounds like HEAL."),
  ("6", "Calm person in the waiting room (7)", "PATIENT", "Double definition: calm, and someone waiting to see the doctor."),
]
_cl = "".join('<li class="da-c" data-a="%s"><b>%s.</b> %s <span class="da-in"><input aria-label="Answer to clue %s" maxlength="%d" autocomplete="off" spellcheck="false"><button type="button">Check</button><button type="button" class="rv">Reveal</button></span><span class="da-why" hidden>%s</span></li>'
              % (a, n, q, n, len(a), w) for n, q, a, w in _CLUES)
body = ('<p class="lede">A quiet nod to DA, who has been bending Australian brains with cryptic clues for decades. If you enjoy these, his are better: <a href="https://davidastle.com/" target="_blank" rel="noopener">davidastle.com</a>.</p>\n'
 '<h2>Six clues, six tricks</h2>\n<p>Anagram, hidden word, charade, container, homophone and double definition. All medical, all ours.</p>\n'
 '<ol class="da-clues">' + _cl + '</ol>\n<p class="da-count" aria-live="polite"></p>\n'
 '<p class="meta">Want more? <a href="/cryptoplexy/">Cryptoplexy</a> is our weekly medical cryptic.</p>\n'
 '<style>.da-clues{padding-left:0;list-style:none;display:grid;gap:10px}.da-c{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;line-height:1.5}'
 '.da-in{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}.da-in input{font:600 16px var(--body);letter-spacing:.18em;text-transform:uppercase;width:11ch;padding:6px 10px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink)}'
 '.da-in button{font:600 13px var(--body);padding:6px 12px;border-radius:999px;border:1px solid var(--line);background:transparent;color:var(--ink);cursor:pointer;min-height:36px}'
 '.da-c.ok input{border-color:#2E9D5B;background:color-mix(in srgb,#2E9D5B 12%,var(--bg))}.da-c.no input{border-color:#E5484D}.da-why{display:block;margin-top:6px;font-size:14px;color:var(--muted)}'
 '.da-count{font:600 15px var(--body);color:var(--brand);text-align:center;margin:12px 0 0;min-height:1.4em}</style>\n'
 '<script>(function(){var solved={},c=document.querySelector(".da-count");'
 'document.querySelectorAll(".da-c").forEach(function(li){var a=li.getAttribute("data-a"),inp=li.querySelector("input"),b=li.querySelectorAll("button"),w=li.querySelector(".da-why"),peek=false;'
 'function chk(){var v=inp.value.replace(/[^a-z]/gi,"").toUpperCase();li.classList.remove("ok","no");if(!v)return;if(v===a){li.classList.add("ok");w.hidden=false;if(!peek){solved[a]=1;if(Object.keys(solved).length===6){c.textContent="Bingo. All six, no peeking.";try{localStorage.setItem("mw-secret-da","1")}catch(e){}}}}else li.classList.add("no")}'
 'b[0].onclick=chk;inp.addEventListener("keydown",function(e){if(e.key==="Enter")chk()});b[1].onclick=function(){peek=true;inp.value=a;chk()};});'
 'try{localStorage.setItem("mw-secret-daroom","1")}catch(e){}})();</script>\n')
page("/da/", "For DA: A Mini Cryptic", "A hidden nod to cryptic setter DA: six medical cryptic clues, one for each classic trick.",
     "For DA", "For DA", "Secret", [("Malady Wise", "/"), ("For DA", "/da/")], body, [], [], [("Cryptoplexy", "/cryptoplexy/"), ("Practice quizzes", "/quizzes/")], audience="Patient", about_type="WebPage")
_fd = "da/index.html"
if _osd.path.exists(_fd):
    _s = open(_fd, encoding="utf-8").read()
    _s = _red.sub(r'<div class="fs-top">.*?</div>\n', "", _s, count=1)
    _s = _red.sub(r'<p class="meta"><em>Updated [^<]*</em></p>', "", _s)
    _s = _red.sub(r'<meta name="robots" content="[^"]*">', '<meta name="robots" content="noindex, nofollow">', _s)
    open(_fd, "w", encoding="utf-8").write(_s)
