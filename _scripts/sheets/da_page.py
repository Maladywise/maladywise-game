# /da/: hidden tribute page (secret: type "astle" anywhere). noindex, not in the sitemap. Original puzzles only.
import os as _osd, re as _red
_SVG = r'''<svg viewBox="0 0 760 420" role="img" aria-label="A puzzle-setter's desk with crossword, pencils, dictionary, letter tiles and tea. Five DAs are hidden in it." class="da-desk">
<rect width="760" height="420" rx="18" fill="#7A5236"/><rect y="350" width="760" height="70" rx="0" fill="#6B4630"/>
<g opacity=".18" stroke="#3E2616" stroke-width="2"><path d="M0 60 Q380 40 760 70M0 150 Q380 130 760 160M0 250 Q380 230 760 260"/></g>
<!-- newspaper -->
<g transform="rotate(-6 200 190)"><rect x="40" y="70" width="330" height="250" fill="#F4EFE4" stroke="#CFC5B0"/><text x="58" y="100" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#2B2340">The Daily Cryptic</text>
<g fill="#C8BFAA"><rect x="58" y="112" width="150" height="5"/><rect x="58" y="124" width="140" height="5"/><rect x="58" y="136" width="150" height="5"/><rect x="58" y="148" width="120" height="5"/><rect x="58" y="160" width="146" height="5"/><rect x="58" y="172" width="150" height="5"/><rect x="58" y="184" width="132" height="5"/></g>
<g transform="translate(220 112)" stroke="#2B2340" stroke-width="1.2">
<rect width="130" height="130" fill="#fff"/>
<g fill="#2B2340"><rect x="26" y="0" width="26" height="26"/><rect x="104" y="26" width="26" height="26"/><rect x="52" y="52" width="26" height="26"/><rect x="0" y="78" width="26" height="26"/><rect x="78" y="104" width="26" height="26"/></g>
<path d="M26 0V130M52 0V130M78 0V130M104 0V130M0 26H130M0 52H130M0 78H130M0 104H130" fill="none"/>
<text x="5" y="20" font-family="Georgia,serif" font-size="15" fill="#4A3480">C</text><text x="57" y="20" font-size="15" font-family="Georgia,serif" fill="#4A3480">L</text>
<text x="83" y="20" font-size="15" font-family="Georgia,serif" fill="#4A3480">U</text><text x="109" y="20" font-size="15" font-family="Georgia,serif" fill="#4A3480">E</text>
<g class="da" data-i="0"><text x="5" y="124" font-size="15" font-family="Georgia,serif" fill="#4A3480">D</text><text x="31" y="124" font-size="15" font-family="Georgia,serif" fill="#4A3480">A</text><rect x="0" y="104" width="52" height="26" fill="transparent" stroke="none"/></g>
</g>
<g fill="#C8BFAA"><rect x="58" y="258" width="300" height="5"/><rect x="58" y="270" width="280" height="5"/><rect x="58" y="282" width="296" height="5"/><rect x="58" y="294" width="250" height="5"/></g></g>
<!-- dictionary -->
<g transform="translate(430 70)"><rect width="150" height="200" rx="8" fill="#4A3480"/><rect x="10" y="0" width="8" height="200" fill="#2E1F57"/><rect x="30" y="40" width="100" height="44" rx="4" fill="#E9DFF7"/>
<text x="80" y="68" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-weight="700" fill="#2E1F57">WORDS</text><text x="80" y="110" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#E9DFF7">a to z, and back</text>
<g class="da" data-i="1"><text x="122" y="188" font-family="Georgia,serif" font-size="11" font-style="italic" fill="#B9A6E0" opacity=".75">da</text><rect x="114" y="176" width="26" height="18" fill="transparent"/></g></g>
<!-- tea -->
<g transform="translate(615 95)"><ellipse cx="55" cy="96" rx="64" ry="14" fill="#E9E2D6"/><path d="M14 20h82l-8 72a10 10 0 0 1-10 9H32a10 10 0 0 1-10-9z" fill="#FBF6EC" stroke="#CFC5B0" stroke-width="2"/><path d="M96 36a18 18 0 0 1 0 36" fill="none" stroke="#CFC5B0" stroke-width="6"/><ellipse cx="55" cy="22" rx="41" ry="7" fill="#8B5A3C"/>
<path d="M40 6c-6-10 6-14 0-24M60 6c-6-10 6-14 0-24" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>
<g class="da" data-i="2"><text x="44" y="70" font-family="Poppins,sans-serif" font-size="16" font-weight="700" fill="#D69A00">DA</text><rect x="38" y="52" width="36" height="24" fill="transparent"/></g></g>
<!-- tiles -->
<g font-family="Georgia,serif" font-size="20" font-weight="700" fill="#2B2340" text-anchor="middle">
<g transform="translate(440 300) rotate(-8)"><rect width="34" height="34" rx="4" fill="#F1E4C4"/><text x="17" y="25">S</text></g>
<g transform="translate(480 296) rotate(4)"><rect width="34" height="34" rx="4" fill="#F1E4C4"/><text x="17" y="25">O</text></g>
<g transform="translate(520 302) rotate(-3)"><rect width="34" height="34" rx="4" fill="#F1E4C4"/><text x="17" y="25">L</text></g>
<g transform="translate(560 298) rotate(6)"><rect width="34" height="34" rx="4" fill="#F1E4C4"/><text x="17" y="25">V</text></g>
<g transform="translate(600 303) rotate(-5)"><rect width="34" height="34" rx="4" fill="#F1E4C4"/><text x="17" y="25">E</text></g>
<g class="da" data-i="3"><rect x="655" y="310" width="72" height="56" fill="transparent"/><g transform="translate(662 318) rotate(12)"><rect width="30" height="30" rx="4" fill="#F1E4C4"/><text x="15" y="22" font-size="17">D</text></g><g transform="translate(690 330) rotate(-14)"><rect width="30" height="30" rx="4" fill="#F1E4C4"/><text x="15" y="22" font-size="17">A</text></g></g></g>
<!-- pencil and rubber -->
<g transform="translate(70 352) rotate(-4)"><rect width="240" height="18" rx="3" fill="#F2C14E"/><path d="M240 0l26 9-26 9z" fill="#E9C9A0"/><path d="M258 6l8 3-8 3z" fill="#2B2340"/><rect x="-22" width="22" height="18" rx="3" fill="#E58C9A"/><rect x="0" width="8" height="18" fill="#B9B9B9"/>
<g class="da" data-i="4"><text x="120" y="14" font-family="Poppins,sans-serif" font-size="11" font-weight="700" fill="#9A6D10">HB · DA</text><rect x="114" y="2" width="56" height="16" fill="transparent"/></g></g>
<!-- magnifier -->
<g transform="translate(330 330)"><circle r="28" fill="rgba(255,255,255,.18)" stroke="#2B2340" stroke-width="6"/><path d="M20 20l30 30" stroke="#2B2340" stroke-width="10" stroke-linecap="round"/></g>
</svg>'''
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
body = ('<p class="lede">You found the secret room. This one is for David Astle, aka DA: Australia’s cryptic crossword setter, word nerd and all-round force for good in the puzzle world.</p>\n'
 '<h2>Find the five DAs</h2>\n<p>DA’s byline hides in plain sight in the newspaper. Five DAs are hiding on this desk. Tap each one.</p>\n'
 '<div class="da-wrap">' + _SVG + '<p class="da-count" aria-live="polite">Found 0 of 5</p></div>\n'
 '<h2>Who is DA?</h2>\n<ul>'
 '<li>Sets cryptic crosswords as <b>DA</b> for <i>The Sydney Morning Herald</i> and <i>The Age</i>, and writes their Wordplay column.</li>'
 '<li>Was the word expert on SBS’s <i>Letters and Numbers</i> from 2010, alongside Richard Morecroft and Lily Serna.</li>'
 '<li>Hosts Evenings on ABC Radio Melbourne.</li>'
 '<li>Books include <i>Puzzled</i> (2010), <i>Cluetopia</i> (2013) and <i>Rewording the Brain</i> (2018), on what puzzles do for the brain.</li>'
 '<li>Runs a “carnival of words” at <a href="https://davidastle.com/" target="_blank" rel="noopener">davidastle.com</a>: word of the week, riddles and puzzles. Go and play.</li></ul>\n'
 '<h2>A tribute mini cryptic</h2>\n<p>Six medical clues, one of each classic trick DA teaches: anagram, hidden word, charade, container, homophone and double definition. Our clues, his school.</p>\n'
 '<ol class="da-clues">' + _cl + '</ol>\n'
 '<h2>Word of the week, Malady Wise style</h2>\n'
 '<div class="callout"><p><b>borborygmus</b> <i>(bor-buh-RIG-mus)</i>, noun. The rumble of gas moving through your gut.</p>'
 '<p><b>Origin:</b> Greek <i>borborygmos</i>, a word that imitates the sound it names. The plural, borborygmi, is how a stomach applauds.</p>'
 '<p><b>In a sentence:</b> In the silent exam hall, her borborygmi solved 14 across before she did.</p></div>\n'
 '<p class="meta">A fan page. Not made with, or endorsed by, David Astle. Want more cryptics? Try <a href="/cryptoplexy/">Cryptoplexy</a>, our weekly medical cryptic.</p>\n'
 '<style>.da-wrap{position:relative;margin:10px 0 6px}.da-desk{width:100%;height:auto;display:block;border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.18)}'
 '.da-desk .da{cursor:pointer}.da-desk .da.got text{fill:#E5484D!important;opacity:1!important}.da-desk .da.got{filter:drop-shadow(0 0 4px #FFD66B)}'
 '.da-count{font:600 14px var(--body);color:var(--muted);text-align:center;margin:8px 0 0}.da-count.win{color:var(--brand);font-size:16px}'
 '.da-clues{padding-left:0;list-style:none;display:grid;gap:10px}.da-c{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;line-height:1.5}'
 '.da-in{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}.da-in input{font:600 16px var(--body);letter-spacing:.18em;text-transform:uppercase;width:11ch;padding:6px 10px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink)}'
 '.da-in button{font:600 13px var(--body);padding:6px 12px;border-radius:999px;border:1px solid var(--line);background:transparent;color:var(--ink);cursor:pointer;min-height:36px}'
 '.da-c.ok input{border-color:#2E9D5B;background:color-mix(in srgb,#2E9D5B 12%,var(--bg))}.da-c.no input{border-color:#E5484D}.da-why{display:block;margin-top:6px;font-size:14px;color:var(--muted)}</style>\n'
 '<script>(function(){var got={},n=0,c=document.querySelector(".da-count");'
 'document.querySelectorAll(".da-desk .da").forEach(function(g){g.addEventListener("click",function(){var i=g.getAttribute("data-i");if(got[i])return;got[i]=1;n++;g.classList.add("got");'
 'c.textContent=n<5?"Found "+n+" of 5":"Bingo. All five DAs found.";if(n===5){c.classList.add("win");try{localStorage.setItem("mw-secret-da","1")}catch(e){}}});});'
 'document.querySelectorAll(".da-c").forEach(function(li){var a=li.getAttribute("data-a"),inp=li.querySelector("input"),b=li.querySelectorAll("button"),w=li.querySelector(".da-why");'
 'function chk(){var v=inp.value.replace(/[^a-z]/gi,"").toUpperCase();li.classList.remove("ok","no");if(!v)return;if(v===a){li.classList.add("ok");w.hidden=false}else li.classList.add("no")}'
 'b[0].onclick=chk;inp.addEventListener("keydown",function(e){if(e.key==="Enter")chk()});b[1].onclick=function(){inp.value=a;chk()};});'
 'try{localStorage.setItem("mw-secret-daroom","1")}catch(e){}})();</script>\n')
page("/da/", "The DA Room: A Puzzle Tribute", "A secret Malady Wise tribute to David Astle, aka DA: find the hidden DAs and solve a six-clue medical mini cryptic.",
     "The DA Room", "The DA Room", "Secret", [("Malady Wise", "/"), ("The DA Room", "/da/")], body, [], [], [("Cryptoplexy", "/cryptoplexy/"), ("Practice quizzes", "/quizzes/")], audience="Patient", about_type="WebPage")
_fd = "da/index.html"
if _osd.path.exists(_fd):
    _s = open(_fd, encoding="utf-8").read()
    _s = _red.sub(r'<div class="fs-top">.*?</div>\n', "", _s, count=1)
    _s = _red.sub(r'<p class="meta"><em>Updated [^<]*</em></p>', "", _s)
    _s = _red.sub(r'<meta name="robots" content="[^"]*">', '<meta name="robots" content="noindex, nofollow">', _s)
    open(_fd, "w", encoding="utf-8").write(_s)
