#!/usr/bin/env python3
"""Generate /medical-specialty-quiz/. Run: python3 gen_sq.py <repo>"""
import json, re, sys, os, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from headkit import fix_html  # shared <head> clean-up: self-hosted fonts, deferred scripts, honest JSON-LD
R = sys.argv[1]
idx = open(os.path.join(R, "index.html")).read()
V = {k: re.search(k + r"\?v=(\d+)", idx).group(1) for k in ("shell.css", "games.js", "site.js", "shell.js")}
esc = lambda s: html.escape(s, quote=True)
PATH = "/medical-specialty-quiz/"
URL = "https://maladywise.com" + PATH

# id: name, emoji, blurb (witty, kind), aus training, elsewhere, day, also suits, games [(name, path, why)]
SP = {
 "gp": ("General practice", "\U0001fa7a",
   "You like people, puzzles and a cup of tea in between. General practice is medicine’s widest front door: anything can walk in, from a splinter to a life-changing diagnosis, and you might look after the same family for decades.",
   "About 3 years of GP training (RACGP or ACRRM) after internship, usually after a year or more in hospital.",
   "UK: 3 years after the 2-year Foundation Programme. US (family medicine): a 3-year residency.",
   "Around 20 to 35 consults a day: chronic disease, mental health, kids, skin checks, women’s and men’s health, and a lot of “while I’m here…”.",
   "Practice nurse, nurse practitioner, pharmacist, Aboriginal health practitioner.",
   [("GP School: free GP training", "/unspecialist/"), ("Dxtective", "/dx/")]),
 "ed": ("Emergency medicine", "\U0001f6a8",
   "You run towards the noise. Emergency doctors see anyone with anything at any hour, and make sense of the first hour of someone’s worst day, then do it again with the next patient.",
   "At least 5 years of ACEM training for fellowship (FACEM), after early hospital years.",
   "UK: about 6 years after Foundation. US: a 3 to 4-year residency.",
   "Shift work, nights and weekends included: triage, resuscitation, fractures, chest pain, procedures, and many handovers.",
   "Emergency nurse, paramedic, triage nurse.",
   [("Dxtective", "/dx/"), ("Arrhythmix", "/arrhythmix/")]),
 "surg": ("Surgery", "\U0001f52a",
   "You like a problem you can see, a plan you can carry out and a result before lunch. Surgeons fix things with their hands, and quietly enjoy a 6am ward round more than they admit.",
   "Usually 5 to 6 years on the RACS Surgical Education and Training (SET) program, across 9 specialties, after several years of hospital work (and often research) to get in.",
   "UK: about 8 years after Foundation. US (general surgery): a 5-year residency, often plus research years.",
   "Early ward rounds, theatre lists, clinics and on call, with long days and a strong team around you.",
   "Perioperative (theatre) nurse, surgical assistant, physiotherapist.",
   [("Anatomegaly", "/anatomegaly/"), ("Suturix", "/suturix/")]),
 "anaes": ("Anaesthetics", "\U0001f634",
   "Calm hands, and a plan B, C and D for everything. Anaesthetists keep people asleep, safe and comfortable through surgery, then hand them back as if nothing happened. You make it look easy because you planned it.",
   "5 years of ANZCA training (FANZCA) after at least 2 years of hospital work.",
   "UK: about 7 years after Foundation. US: a 4-year residency.",
   "Pre-op checks, theatre lists, airway and drug decisions in real time, labour epidurals, pain management and emergency calls.",
   "Anaesthetic nurse, anaesthetic technician, operating department practitioner (UK).",
   [("Arrhythmix", "/arrhythmix/"), ("Panelysis", "/panelysis/")]),
 "paeds": ("Paediatrics", "\U0001f9f8",
   "You speak fluent toddler, worried parent and eye-rolling teenager. Paediatrics is medicine for growing people, with stickers, growth charts and a lot of reassurance.",
   "At least 6 years with the RACP: 3 years of basic training and 3 of advanced training.",
   "UK: about 7 years after Foundation. US: a 3-year residency.",
   "Wards, newborn checks, clinics, and the art of examining someone who is trying to eat your stethoscope.",
   "Paediatric nurse, child and family health nurse, speech pathologist, child psychologist.",
   [("Dxtective", "/dx/"), ("Triviosis", "/triviosis/")]),
 "og": ("Obstetrics and gynaecology", "\U0001f476",
   "Happy at 2am in birth suite and back in clinic at 9. Obstetrics and gynaecology mixes surgery, medicine and some of the biggest moments of people’s lives.",
   "6 years of RANZCOG training (4 core years and 2 advanced), after hospital years.",
   "UK: about 7 years after Foundation. US: a 4-year residency.",
   "Birth suite, caesareans and gynae surgery, antenatal and gynaecology clinics, and on call.",
   "Midwife, sonographer, women’s health nurse.",
   [("Sudokrine", "/sudokrine/"), ("Anatomegaly", "/anatomegaly/")]),
 "psych": ("Psychiatry", "\U0001f9e0",
   "You’re curious about the story behind the story, and good at sitting with hard things without rushing to fix them. Psychiatry is where medicine, biology and people’s lives meet.",
   "5 years of RANZCP training after hospital years.",
   "UK: about 6 years after Foundation. US: a 4-year residency.",
   "Long assessments, talking and medicines, team meetings, community and hospital work, and mental health law.",
   "Mental health nurse, psychologist, occupational therapist, social worker.",
   [("Linkase", "/linkase/"), ("Grand Rounds", "/grandrounds/")]),
 "rad": ("Radiology", "\U0001fa7b",
   "You’d rather find the answer than chase it. A quiet room, big screens and the deep satisfaction of spotting the thing everyone else walked past.",
   "5 years of RANZCR clinical radiology training after hospital years.",
   "UK: about 5 years after Foundation. US: 4 years after an intern year.",
   "Reporting X-rays, CT, MRI and ultrasound; image-guided procedures such as biopsies and drains; multidisciplinary meetings; and on call.",
   "Radiographer, sonographer, nuclear medicine scientist.",
   [("Opacitis", "/opacitis/")]),
 "path": ("Pathology", "\U0001f52c",
   "Detective by day, and by night if the lab is busy. Nearly every blood test, biopsy and swab passes through a pathologist’s world, and the rest of medicine relies on you being right.",
   "About 5 years of RCPA training, in areas such as anatomical pathology, haematology, microbiology or chemical pathology.",
   "UK (histopathology): about 5 years after Foundation. US: a 4-year residency.",
   "Microscopes, reports, lab quality checks, cancer meetings and, in haematology or immunology, seeing patients too.",
   "Medical scientist, laboratory technician, phlebotomist.",
   [("Panelysis", "/panelysis/"), ("Zebritis", "/zebritis/")]),
 "derm": ("Dermatology", "✨",
   "You have a sharp eye and a reassuring manner. Skin is the body’s billboard, and you can read the fine print across a crowded room.",
   "4 years of Australasian College of Dermatologists training, after hospital years. Famously competitive to get into.",
   "UK: about 6 years (2 years of internal medicine, then 4 of dermatology). US: 3 years after an intern year.",
   "Clinics, skin checks and skin cancer, eczema, psoriasis and acne, biopsies and small operations.",
   "Dermatology nurse, skin cancer clinic nurse.",
   [("Glimpsis", "/glimpsis/")]),
 "cardio": ("Cardiology", "❤️",
   "Rhythm is your love language. Cardiology is physiology you can measure, image and fix, from a racing heart to a blocked artery at 3am.",
   "At least 6 years with the RACP (3 years of basic physician training and 3 of advanced cardiology), and often an extra fellowship.",
   "UK: about 7 to 8 years after Foundation, including internal medicine. US: 3 years of internal medicine, then a 3-year fellowship.",
   "Clinics, echocardiograms, cath lab or pacemaker work, ward consults and on call.",
   "Cardiac nurse, cardiac physiologist, cardiac sonographer.",
   [("Arrhythmix", "/arrhythmix/")]),
 "icu": ("Intensive care", "\U0001f6cf️",
   "Big physiology, small margins. Intensive care doctors look after the sickest people in the hospital, and the families beside them, one careful decision at a time.",
   "6 years of CICM training after hospital years.",
   "UK: about 7 years after Foundation. US: 3 years of residency (often internal medicine), then a 1 to 3-year fellowship.",
   "Ward rounds on very unwell patients, ventilators and lines, emergency calls, family meetings and end-of-life care.",
   "ICU nurse, physiotherapist, ICU pharmacist.",
   [("Panelysis", "/panelysis/"), ("Arrhythmix", "/arrhythmix/")]),
 "ph": ("Public health", "\U0001f4ca",
   "Your patient is a whole population. One good policy can prevent more illness than a lifetime of clinics, and you are not afraid of a spreadsheet.",
   "3 years of Australasian Faculty of Public Health Medicine (RACP) training, usually alongside a Master of Public Health, after some years of clinical work.",
   "UK: 5 years of specialty training (open to non-doctors too). US (preventive medicine): a 2 to 3-year residency, often with a public health degree.",
   "Outbreak response, screening programs, data and research, policy advice and health promotion, with plenty of graphs.",
   "Epidemiologist, environmental health officer, health promotion officer, biostatistician.",
   [("Sensitosis", "/sensitosis/")]),
 "rural": ("Rural generalism", "\U0001f69c",
   "You’re the Swiss Army knife of medicine. A rural generalist does GP clinic in the morning, the town’s emergency department at night, and an extra skill such as obstetrics, anaesthetics or mental health in between.",
   "About 4 years of rural generalist training (FACRRM with ACRRM, or FRACGP with Rural Generalist training with RACGP), including an advanced skill.",
   "Few countries train it as its own path. Canada has rural family medicine with optional enhanced skills, and New Zealand has rural hospital medicine.",
   "Clinic, ward round, emergency call-outs, maybe a birth, and being a familiar face around town.",
   "Remote area nurse, rural and isolated practice nurse, flight nurse, Aboriginal health worker.",
   [("GP School: free GP training", "/unspecialist/"), ("Grand Rounds", "/grandrounds/")]),
}
ORDER = list(SP)

# (question, [(answer, {spec: points})])
Q = [
 ("A patient’s ECG looks odd at 3am. You feel…", [
   ("Wide awake. Let’s go.", {"ed": 2, "icu": 1}),
   ("Delighted. I want to know exactly which wave is misbehaving.", {"cardio": 2, "anaes": 1}),
   ("Glad I’ll see it on a big screen tomorrow, with coffee.", {"rad": 2, "path": 1}),
   ("Curious what the patient was doing when it started.", {"gp": 2, "psych": 1})]),
 ("Pick your ideal workday soundtrack.", [
   ("Monitors beeping in a calm, steady rhythm", {"anaes": 2, "icu": 1}),
   ("Quiet. A dark room. Possibly a podcast.", {"rad": 2, "path": 1}),
   ("A different story every 15 minutes", {"gp": 2, "rural": 1}),
   ("The happy chaos of a waiting room full of toys", {"paeds": 2, "gp": 1}),
   ("The clink of instruments and someone asking for suction", {"surg": 2, "og": 1})]),
 ("Pick a superpower.", [
   ("Seeing through things", {"rad": 2}),
   ("Spotting a rash across a crowded room", {"derm": 2}),
   ("Staying calm while everyone else panics", {"ed": 2, "icu": 1}),
   ("Knowing what someone is really thinking", {"psych": 2}),
   ("Keeping a whole town well at once", {"ph": 2, "rural": 1})]),
 ("Which would you most enjoy fixing?", [
   ("Something you can see and cut out", {"surg": 2, "derm": 1}),
   ("A failing organ system, minute by minute", {"icu": 2, "anaes": 1}),
   ("A whole region’s vaccination rates", {"ph": 2}),
   ("A toddler’s ear and a parent’s worries, in one visit", {"paeds": 2, "gp": 1}),
   ("A heart that won’t keep time", {"cardio": 2})]),
 ("How do you feel about blood?", [
   ("Love it, especially under a microscope", {"path": 2}),
   ("Fine. I’ll deliver a baby while I’m at it.", {"og": 2, "rural": 1}),
   ("Prefer it on a scan, thanks", {"rad": 2}),
   ("Happy to put a drip in, then talk about something else", {"gp": 1, "psych": 2}),
   ("Happiest when it’s staying inside the patient", {"surg": 1, "anaes": 2})]),
 ("Long relationships with patients sound…", [
   ("The best bit. Decades of the same families.", {"gp": 2, "rural": 1}),
   ("Lovely, but I’d rather fix it and hand them back", {"surg": 2, "ed": 1}),
   ("I may never meet them, and that’s fine", {"path": 2, "rad": 1}),
   ("Wonderful, especially watching them grow up", {"paeds": 2}),
   ("Essential. Recovery takes time.", {"psych": 2, "cardio": 1})]),
 ("Choose your weekend away.", [
   ("A remote town with one pub, one airstrip and you", {"rural": 2}),
   ("A big city with a great coffee scene", {"cardio": 2, "ed": 1}),
   ("Somewhere shady with excellent sunscreen", {"derm": 2}),
   ("A conference with a really good graph in it", {"ph": 2, "path": 1}),
   ("Anywhere, as long as my pager stays quiet", {"og": 1, "anaes": 1, "icu": 1})]),
 ("In a group project, you’re the one who…", [
   ("Takes charge when it all goes wrong", {"ed": 2, "icu": 1}),
   ("Quietly checks everyone’s work for errors", {"path": 2, "rad": 1}),
   ("Keeps everyone calm and comfortable", {"anaes": 2, "psych": 1}),
   ("Thinks about who isn’t in the room", {"ph": 2, "gp": 1}),
   ("Does the hands-on bit while others talk", {"surg": 2, "og": 1})]),
 ("Night shifts are…", [
   ("Part of the thrill", {"ed": 2, "icu": 1}),
   ("Fine if there’s a good reason, like a baby on the way", {"og": 2, "paeds": 1}),
   ("Something I’d happily swap for a reliable 5pm finish", {"derm": 2, "ph": 1}),
   ("Fine, from home, on call for my whole town", {"rural": 2, "gp": 1}),
   ("Best spent with a stack of scans and total silence", {"rad": 2})]),
 ("The case that fascinates you most:", [
   ("A heart that skips a beat", {"cardio": 2}),
   ("A rare tumour only a handful of people have seen", {"path": 2, "derm": 1}),
   ("Symptoms that only make sense once you hear the person’s life story", {"psych": 2, "gp": 1}),
   ("Why one suburb has twice the asthma of the next", {"ph": 2}),
   ("A complicated pregnancy with two patients at once", {"og": 2})]),
 ("Your favourite tool:", [
   ("A scalpel", {"surg": 2}),
   ("A dermatoscope (a fancy skin magnifier)", {"derm": 2}),
   ("A stethoscope and a good chat", {"gp": 2, "paeds": 1}),
   ("An airway kit", {"anaes": 2, "ed": 1}),
   ("A spreadsheet", {"ph": 2})]),
 ("Pick the compliment you’d love most.", [
   ("“You never miss a thing on a scan.”", {"rad": 2}),
   ("“You made my kid laugh while you checked their ears.”", {"paeds": 2}),
   ("“You got my mum through last night.”", {"icu": 2, "anaes": 1}),
   ("“You listened when no one else did.”", {"psych": 2, "gp": 1}),
   ("“Is there anything you can’t do?”", {"rural": 2, "ed": 1})]),
 ("How do you handle uncertainty?", [
   ("Watch, wait and review next week", {"gp": 2, "rural": 1}),
   ("Rule out the worst first, then breathe", {"ed": 2}),
   ("Get more data: another test, another view", {"cardio": 2, "rad": 1}),
   ("Plan for every possible problem before I start", {"anaes": 2, "surg": 1}),
   ("Think in probabilities across thousands of people", {"ph": 2})]),
 ("What would you happily read about for fun?", [
   ("Hormones, and how a body grows a whole new person", {"og": 2, "paeds": 1}),
   ("Skin, hair and nails: the body’s billboard", {"derm": 2}),
   ("What every drug does to every organ", {"anaes": 2, "icu": 1}),
   ("The mind, sleep and memory", {"psych": 2}),
   ("Cells, germs and why things go wrong at the smallest scale", {"path": 2}),
   ("Honestly? Everything.", {"rural": 2, "gp": 1})]),
]

FAQS = [
 ("Is this specialty quiz accurate?",
  "It’s just for fun. It matches your answers to the kinds of work, pace and patients each specialty involves, but real career choices depend on experience, rotations, mentors and life. Use it as a conversation starter, then talk to people who do the job."),
 ("How long does it take to become a specialist doctor in Australia?",
  "After a medical degree and an intern year, most doctors spend 1 to 3 more years in hospital jobs, then specialty training of about 3 years (general practice) to 6 years (for example paediatrics, cardiology, obstetrics and gynaecology or intensive care). Surgery is usually 5 to 6 years on the training program, after several years of getting in."),
 ("Can nurses, students or allied health workers take it?",
  "Yes. Every result also lists nursing and allied health roles in a similar area, such as radiographers for radiology, midwives for obstetrics and paramedics for emergency."),
]

def qhtml():
    out = []
    for i, (q, ans) in enumerate(Q, 1):
        opts = "".join(
            f'<label><input type="radio" name="q{i}" value="{j}" data-s="{esc(json.dumps(sc))}"><span>{esc(a)}</span></label>'
            for j, (a, sc) in enumerate(ans))
        out.append(f'<fieldset class="sq-q" data-i="{i}"><legend><span class="sq-n">Question {i} of {len(Q)}</span>{esc(q)}</legend><div class="sq-opts">{opts}</div></fieldset>')
    return "\n".join(out)

def rhtml():
    out = []
    for k in ORDER:
        n, e, b, au, el, day, also, games = SP[k]
        g = " · ".join(f'<a href="{p}">{esc(t)}</a>' for t, p in games)
        out.append(f'''<article class="sq-res" id="r-{k}" data-id="{k}">
<h3><span aria-hidden="true">{e}</span> {esc(n)}</h3>
<p class="sq-blurb">{esc(b)}</p>
<dl>
<dt>Training in Australia</dt><dd>{esc(au)}</dd>
<dt>Elsewhere</dt><dd>{esc(el)}</dd>
<dt>A typical day</dt><dd>{esc(day)}</dd>
<dt>Not a doctor?</dt><dd>Similar roles: {esc(also[0].lower()+also[1:])}</dd>
</dl>
<p class="sq-try"><b>Try it on Malady Wise:</b> {g}</p>
</article>''')
    return "\n".join(out)

title = "Which Medical Specialty Suits You? (Quiz)"
desc = "Which medical specialty suits you? 14 fun scenario questions match you to GP, emergency, surgery, radiology, psychiatry and more, with real training facts."
LD = [
 {"@context": "https://schema.org", "@type": "Quiz", "name": title, "description": desc, "url": URL,
  "inLanguage": "en-AU", "isAccessibleForFree": True, "educationalUse": "Career exploration",
  "about": [{"@type": "Thing", "name": "Medical specialties"}, {"@type": "Thing", "name": "Medical careers"}],
  "audience": {"@type": "Audience", "audienceType": "Medical students, junior doctors, nurses, allied health students and the curious"},
  "author": {"@type": "Organization", "name": "Malady Wise", "url": "https://maladywise.com/"},
  "publisher": {"@type": "Organization", "name": "Malady Wise", "url": "https://maladywise.com/"},
  "dateModified": "2026-11-08",
  "hasPart": [{"@type": "Question", "name": q, "eduQuestionType": "Multiple choice"} for q, _ in Q]},
 {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
   {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQS]},
]
NAMES = {k: [SP[k][0], SP[k][1]] for k in ORDER}

CSS = '''<style>
.sq .sq-intro{font-size:15px}
.sq .sq-prog{position:sticky;top:0;z-index:2;background:var(--bg);padding:8px 0;font:600 14px var(--body);color:var(--muted);display:flex;gap:10px;align-items:center}
.sq .sq-bar{flex:1;height:8px;border-radius:99px;background:var(--line);overflow:hidden}
.sq .sq-bar i{display:block;height:100%;width:0;background:var(--brand);transition:width .25s}
.sq fieldset.sq-q{border:1px solid var(--line);border-radius:14px;background:var(--card);padding:14px 14px 12px;margin:0 0 12px;min-width:0}
.sq fieldset.sq-q legend{font:700 18px/1.35 var(--title);color:var(--ink);max-width:100%;white-space:normal;float:left;width:100%;padding:0;margin:0 0 16px}
.sq .sq-opts{clear:both}
.sq .sq-n{display:block;font:600 12.5px var(--body);color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px}
.sq .sq-opts{display:grid;gap:8px;margin-top:8px}
.sq .sq-opts label{display:flex;gap:10px;align-items:center;border:1px solid var(--line);border-radius:12px;padding:10px 12px;min-height:46px;cursor:pointer;background:var(--bg);color:var(--ink);font-size:15.5px}
.sq .sq-opts label:has(input:checked){border-color:var(--brand);box-shadow:inset 0 0 0 1px var(--brand);font-weight:600}
.sq .sq-opts input{width:20px;height:20px;flex:0 0 auto;accent-color:var(--brand);margin:0}
.sq .sq-nav{display:flex;gap:10px;flex-wrap:wrap;margin:6px 0 14px}
.sq .sq-nav button,.sq .sq-share button{font:600 15.5px var(--body);min-height:46px;padding:10px 18px;border-radius:12px;cursor:pointer;border:2px solid var(--brand);background:transparent;color:var(--ink)}
.sq .sq-nav .sq-go,.sq .sq-share .sq-sh{background:var(--brand);color:var(--bg)}
.sq .sq-nav button[disabled]{opacity:.45;cursor:default}
.sq .sq-msg{font-weight:600;min-height:1.2em}
.sq .sq-step fieldset.sq-q{display:none}
.sq .sq-step fieldset.sq-q.cur{display:block}
.sq .sq-res{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--brand);border-radius:14px;padding:12px 16px;margin:0 0 12px}
.sq .sq-res h3{margin:2px 0 6px;font:700 20px var(--title)}
.sq .sq-res dl{margin:8px 0;display:grid;gap:2px}
.sq .sq-res dt{font-weight:700;font-size:13px;color:var(--muted);text-transform:uppercase;letter-spacing:.03em;margin-top:6px}
.sq .sq-res dd{margin:0;font-size:15px}
.sq #sq-out{margin:8px 0 18px;scroll-margin-top:84px}
.sq #sq-out .sq-res{border-width:2px 2px 2px 6px;border-color:var(--brand)}
.sq .sq-kick{font:600 13px var(--body);color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin:0}
.sq .sq-big{font:800 30px var(--title);color:var(--brand);margin:2px 0 8px;line-height:1.15}
.sq .sq-runner{font-size:14.5px;color:var(--muted)}
.sq .sq-share{display:flex;flex-wrap:wrap;gap:10px;margin:10px 0}
.sq .sq-all summary{cursor:pointer;font-weight:700;font-size:16px;padding:6px 0}
.sq .sq-res:target{outline:3px solid var(--brand)}
@media (prefers-reduced-motion:reduce){.sq .sq-bar i{transition:none}}
</style>'''

JS = '''<script>
(function(){
var NAMES=%s,form=document.getElementById("sq-form"),fs=[].slice.call(form.querySelectorAll("fieldset.sq-q")),N=fs.length,cur=0,
out=document.getElementById("sq-out"),bar=document.querySelector(".sq-bar i"),pt=document.querySelector(".sq-pt"),back=form.querySelector(".sq-back"),go=form.querySelector(".sq-go"),msg=form.querySelector(".sq-msg");
form.classList.add("sq-step");document.querySelector(".sq-prog").hidden=false;
function answered(i){return !!fs[i].querySelector("input:checked");}
function show(i,focus){cur=i;fs.forEach(function(f,j){f.classList.toggle("cur",j===i);});
 var done=fs.filter(function(f,j){return answered(j);}).length;bar.style.width=(100*done/N)+"%%";pt.textContent="Question "+(i+1)+" of "+N;
 back.disabled=i===0;go.textContent=i===N-1?"See my specialty":"Next";msg.textContent="";
 if(focus){var r=fs[i].querySelector("input:checked")||fs[i].querySelector("input");if(r)r.focus({preventScroll:true});fs[i].scrollIntoView({block:"nearest"});}}
fs.forEach(function(f,j){f.addEventListener("change",function(){show(j);if(j<N-1)setTimeout(function(){if(cur===j)show(j+1,true);},260);});});
back.onclick=function(){if(cur>0)show(cur-1,true);};
form.addEventListener("submit",function(e){e.preventDefault();
 if(!answered(cur)){msg.textContent="Pick an answer to carry on.";return;}
 if(cur<N-1){show(cur+1,true);return;}
 var miss=fs.map(function(f,j){return answered(j)?-1:j;}).filter(function(j){return j>=0;});
 if(miss.length){show(miss[0],true);msg.textContent="You skipped this one.";return;}
 var sc={},order=Object.keys(NAMES);order.forEach(function(k){sc[k]=0;});
 fs.forEach(function(f){var s=JSON.parse(f.querySelector("input:checked").getAttribute("data-s"));for(var k in s)sc[k]+=s[k];});
 var rank=order.slice().sort(function(a,b){return sc[b]-sc[a]||order.indexOf(a)-order.indexOf(b);}),w=rank[0];
 var card=document.getElementById("r-"+w).cloneNode(true);card.removeAttribute("id");var h3=card.querySelector("h3");if(h3)h3.remove();
 out.innerHTML='<p class="sq-kick">Your specialty match</p><h2 class="sq-big" id="sq-rh" tabindex="-1">'+NAMES[w][1]+" "+NAMES[w][0]+"</h2>";
 out.appendChild(card);
 out.insertAdjacentHTML("beforeend",'<p class="sq-runner">Close runners-up: '+NAMES[rank[1]][0]+" and "+NAMES[rank[2]][0]+'. <a href="#all">See every result</a>.</p><div class="sq-share"><button type="button" class="sq-sh">Share my result</button><button type="button" class="sq-again">Take it again</button></div><p class="sq-msg2" aria-live="polite"></p><p class="meta">Just for fun, not careers advice. Talk to people who do the job, and try a rotation if you can.</p>');
 out.hidden=false;
 var txt="I got "+NAMES[w][0]+" "+NAMES[w][1]+" on the Malady Wise specialty quiz. Which medical specialty suits you?",url="https://maladywise.com/medical-specialty-quiz/";
 out.querySelector(".sq-sh").onclick=function(){var m=out.querySelector(".sq-msg2");
  if(navigator.share){navigator.share({title:"Which Medical Specialty Suits You?",text:txt,url:url}).catch(function(){});return;}
  var s=txt+" "+url;(navigator.clipboard?navigator.clipboard.writeText(s):Promise.reject()).then(function(){m.textContent="Copied. Paste it anywhere.";},function(){m.textContent=s;});};
 out.querySelector(".sq-again").onclick=function(){form.reset();out.hidden=true;out.innerHTML="";show(0,true);};
 try{if(window.MW_track)MW_track("specialty-quiz/"+w,"Specialty quiz: "+NAMES[w][0]);}catch(e){}
 out.scrollIntoView({block:"start"});document.getElementById("sq-rh").focus({preventScroll:true});
});
show(0);
})();
</script>''' % json.dumps(NAMES, ensure_ascii=False)

def head():
    t = title + " | Malady Wise"
    ld = "".join('<script type="application/ld+json">' + json.dumps(x, ensure_ascii=False) + "</script>\n" for x in LD)
    return f'''<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<link rel="canonical" href="{URL}">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{esc(t)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png"><link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48.png"><link rel="icon" type="image/png" sizes="96x96" href="/assets/favicon-96.png"><link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<meta name="theme-color" content="#4A3480">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Malady Wise">
<meta property="og:type" content="website">
<meta property="og:url" content="{URL}">
<meta property="og:title" content="{esc(t)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:image" content="https://maladywise.com/assets/og/gpschool.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="/assets/fonts/poppins-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/shell.css?v={V['shell.css']}">
<script src="/assets/games.js?v={V['games.js']}"></script>
<script src="/assets/site.js?v={V['site.js']}"></script>
<script src="/assets/shell.js?v={V['shell.js']}"></script>
{CSS}
{ld}</head>
<body>
<main class="wrap doc sq">
'''

page = head() + f'''<p class="meta">Quiz · Just for fun</p>
<h1>Which medical specialty suits you?</h1>
<p class="lede">{len(Q)} quick scenario questions. Answer with your gut, not your CV, and we’ll match you to one of {len(SP)} specialties, with real facts about training and what the day actually looks like.</p>
<p class="sq-intro"><b>Just for fun.</b> It’s not careers advice or a personality test, and no answer is wrong. Nurses, students and allied health folk welcome: every result lists similar non-doctor roles too.</p>
<form id="sq-form" autocomplete="off" novalidate>
<div class="sq-prog" hidden><span class="sq-pt">Question 1 of {len(Q)}</span><span class="sq-bar" aria-hidden="true"><i></i></span></div>
{qhtml()}
<p class="sq-msg" role="alert"></p>
<div class="sq-nav"><button type="button" class="sq-back">Back</button><button type="submit" class="sq-go">Next</button></div>
</form>
<section id="sq-out" aria-live="polite" hidden></section>
<section id="all">
<details class="sq-all"><summary>See all {len(SP)} specialty results</summary>
{rhtml()}
</details>
</section>
<section class="faq"><h2>Common questions</h2>{"".join(f"<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>" for q, a in FAQS)}</section>
<p class="meta"><em>Updated 8 November 2026. Training times are typical full-time minimums and change over time; check the relevant college for current requirements. Just for fun, not careers advice.</em></p>
<footer class="site"><p class="ft-base"><span class="ft-note">General education, not personal medical advice.</span> <span class="ft-links"><a href="/about/">About</a> <a href="/disclaimer/">Disclaimer</a> <a href="/privacy/">Privacy</a> <a href="/contact/">Contact</a></span></p></footer>
</main>
{JS}
<script>MW.page();</script>
</body>
</html>
'''
p = os.path.join(R, "medical-specialty-quiz", "index.html")
os.makedirs(os.path.dirname(p), exist_ok=True)
open(p, "w").write(fix_html(page))
print("wrote", p, len(page), "title", len(title), "desc", len(desc))
# reachability check: each specialty max points
mx = {k: 0 for k in ORDER}
for q, ans in Q:
    for k in ORDER:
        mx[k] += max([sc.get(k, 0) for _, sc in ans])
print("max points", mx)
import static_nav  # footer links and share-card tags for new or rebuilt pages (STYLE.md)
static_nav.postbuild()
