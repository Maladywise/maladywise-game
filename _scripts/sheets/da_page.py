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
# Weekly rotation (Nov 2026): eight sets of six, one per trick, picked by week (Monday, Sydney time) in the browser. Set 1 is also the static fallback.
_SETS = [_CLUES,
 [("1","Each reeling with pain (4)","ACHE","Anagram: EACH, “reeling”, gives ACHE."),("2","Breathing organ found in pool, ungainly (4)","LUNG","Hidden word: poo<b>L UNG</b>ainly."),
  ("3","Small container used for imaging (4)","SCAN","Charade: S (small) + CAN (container)."),("4","Artist in rubbish container shows intelligence (5)","BRAIN","Container: RA (artist) inside BIN."),
  ("5","Blood vessel, conceited, we hear (4)","VEIN","Homophone: sounds like VAIN."),("6","Place of worship at the side of the head (6)","TEMPLE","Double definition: a place of worship, and the side of the head.")],
 [("1","Earth shaken, a vital organ (5)","HEART","Anagram: EARTH, “shaken”, gives HEART."),("2","Joint found in chip (3)","HIP","Hidden word: c<b>HIP</b>."),
  ("3","Church at home for the bottom of the face (4)","CHIN","Charade: CH (church) + IN (at home)."),("4","About inside senior, a mark from an old wound (4)","SCAR","Container: CA (about) inside SR (senior)."),
  ("5","Spirit, we hear, under the foot (4)","SOLE","Homophone: sounds like SOUL."),("6","Throw plaster (4)","CAST","Double definition: to throw, and a plaster cast.")],
 [("1","Below, unfortunately, the arm’s hinge (5)","ELBOW","Anagram: BELOW, “unfortunately”, gives ELBOW."),("2","Limb found in farmyard (3)","ARM","Hidden word: f<b>ARM</b>yard."),
  ("3","Father at home, and it hurts (4)","PAIN","Charade: PA (father) + IN (at home)."),("4","Hospital in wrongdoing, at the front of the leg (4)","SHIN","Container: H (hospital) inside SIN."),
  ("5","Roof of the mouth, an artist’s board we hear (6)","PALATE","Homophone: sounds like PALETTE."),("6","Student in the eye (5)","PUPIL","Double definition: a student, and the centre of the eye.")],
 [("1","Elation, wildly, at the end of a foot (7)","TOENAIL","Anagram: ELATION, “wildly”, gives TOENAIL."),("2","Hearing organ in clearing (3)","EAR","Hidden word: cl<b>EAR</b>ing."),
  ("3","Party in the south-east, a measured amount of medicine (4)","DOSE","Charade: DO (party) + SE (south-east)."),("4","New in a winning serve, a pimply problem (4)","ACNE","Container: N (new) inside ACE."),
  ("5","Went by air, we hear, with a fever (3)","FLU","Homophone: sounds like FLEW."),("6","Whip on the eyelid (4)","LASH","Double definition: a whip, and an eyelash.")],
 [("1","Aliens wandering in a drip (6)","SALINE","Anagram: ALIENS, “wandering”, gives SALINE."),("2","Bone hidden in scribble (3)","RIB","Hidden word: sc<b>RIB</b>ble."),
  ("3","Turn east to find the backbone (5)","SPINE","Charade: SPIN (turn) + E (east)."),("4","Toilet in bed? It’s red (5)","BLOOD","Container: LOO (toilet) inside BD (bed)."),
  ("5","Shellfish, we hear, for strength (6)","MUSCLE","Homophone: sounds like MUSSEL."),("6","Idiot forming in the blood (4)","CLOT","Double definition: a fool, and a blood clot.")],
 [("1","Spain, unfortunately, hurts (5)","PAINS","Anagram: SPAIN, “unfortunately”, gives PAINS."),("2","Vessel in Steve in a hurry (4)","VEIN","Hidden word: ste<b>VE IN</b> a hurry."),
  ("3","Number and university teacher join muscle to bone (6)","TENDON","Charade: TEN (number) + DON (university teacher)."),("4","Al held by the PM, part of the hand (4)","PALM","Container: AL inside PM."),
  ("5","Rubbish, we hear, round the middle (5)","WAIST","Homophone: sounds like WASTE."),("6","Bore fed into a vein (4)","DRIP","Double definition: a dull person, and an IV drip.")],
 [("1","Learn to adjust, about the kidneys (5)","RENAL","Anagram: LEARN, “to adjust”, gives RENAL."),("2","Belly found in big utensil (3)","GUT","Hidden word: bi<b>G UT</b>ensil."),
  ("3","Group plus time to wrap a wound (7)","BANDAGE","Charade: BAND (group) + AGE (time)."),("4","New in a painful state, making noise asleep (5)","SNORE","Container: N (new) inside SORE."),
  ("5","Understands, we hear, what’s on the face (4)","NOSE","Homophone: sounds like KNOWS."),("6","Hanky made of cells (6)","TISSUE","Double definition: a hanky, and a layer of cells.")]]
import json as _jd
_cl = "".join('<li class="da-c" data-a="%s"><b>%s.</b> %s <span class="da-in"><input aria-label="Answer to clue %s" maxlength="%d" autocomplete="off" spellcheck="false"><button type="button">Check</button><button type="button" class="rv">Reveal</button></span><span class="da-why" hidden>%s</span></li>'
              % (a, n, q, n, len(a), w) for n, q, a, w in _CLUES)
body = ('<p class="lede">A quiet nod to DA, who has been bending Australian brains with cryptic clues for decades. If you enjoy these, his are better: <a href="https://davidastle.com/" target="_blank" rel="noopener">davidastle.com</a>.</p>\n'
 '<h2>Six clues, six tricks</h2>\n<p>Anagram, hidden word, charade, container, homophone and double definition. All medical, all ours. <b>New clues every Monday.</b></p>\n'
 '<ol class="da-clues">' + _cl + '</ol>\n<p class="da-count" aria-live="polite"></p>\n'
 '<p class="meta">Want more? <a href="/cryptoplexy/">Cryptoplexy</a> is our weekly medical cryptic.</p>\n'
 '<style>.da-clues{padding-left:0;list-style:none;display:grid;gap:10px}.da-c{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;line-height:1.5}'
 '.da-in{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}.da-in input{font:600 16px var(--body);letter-spacing:.18em;text-transform:uppercase;width:11ch;padding:6px 10px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink)}'
 '.da-in button{font:600 13px var(--body);padding:6px 12px;border-radius:999px;border:1px solid var(--line);background:transparent;color:var(--ink);cursor:pointer;min-height:36px}'
 '.da-c.ok input{border-color:#2E9D5B;background:color-mix(in srgb,#2E9D5B 12%,var(--bg))}.da-c.no input{border-color:#E5484D}.da-why{display:block;margin-top:6px;font-size:14px;color:var(--muted)}'
 '.da-count{font:600 15px var(--body);color:var(--brand);text-align:center;margin:12px 0 0;min-height:1.4em}</style>\n'
 '<script>(function(){var S=' + _jd.dumps([[list(x) for x in st] for st in _SETS], ensure_ascii=False).replace("</", "<\\/") + ';'
 'try{var d=new Intl.DateTimeFormat("en-CA",{timeZone:"Australia/Sydney"}).format(new Date()),n=Math.floor((Date.parse(d)-Date.parse("2026-11-16"))/6048e5),k=((n%S.length)+S.length)%S.length;'
 'if(k){document.querySelector(".da-clues").innerHTML=S[k].map(function(r){return \'<li class="da-c" data-a="\'+r[2]+\'"><b>\'+r[0]+\'.</b> \'+r[1]+\' <span class="da-in"><input aria-label="Answer to clue \'+r[0]+\'" maxlength="\'+r[2].length+\'" autocomplete="off" spellcheck="false"><button type="button">Check</button><button type="button" class="rv">Reveal</button></span><span class="da-why" hidden>\'+r[3]+\'</span></li>\'}).join("")}}catch(e){}'
 'var solved={},c=document.querySelector(".da-count");'
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
