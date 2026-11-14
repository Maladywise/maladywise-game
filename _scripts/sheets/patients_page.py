# /patients/: the patients' hub, styled like /doctors/. Topic hubs come from data/hubs.json.
import json as _j
_H = _j.load(open("data/hubs.json", encoding="utf-8"))
_IMG = {"chronic-pain": "neurology", "tired-all-the-time": "sleep", "late-diagnosis-adhd-autism": "mentalhealth", "glp-1": "nutrition", "tiredwise": "layla"}
def _c(href, img, t, d, tag=""):
    return ('<a class="dh-c" href="%s"><img src="/assets/mascots/%s.svg" width="48" height="48" alt="" loading="lazy"><span><b style="white-space:nowrap">%s</b>%s<span>%s</span></span></a>\n'
            % (href, img, t, ('<i>%s</i>' % tag) if tag else "", d))
_topics = "".join(_c(i["href"], _IMG.get(i["key"], "dx"), i["t"], i["long"]) for g in _H["groups"] if g["t"] == "Topic hubs" for i in g["items"])
body = ('<p class="lede">Plain-English health help in one place. Free, no login, no ads for miracle cures. Written by a GP, for real people.</p>\n'
 '<h2>Big topics</h2>\n<p>Everything on one topic, start to finish.</p>\n<div class="dh-grid">\n' + _topics + '</div>\n'
 '<h2>Look it up</h2>\n<div class="dh-grid">\n'
 + _c("/conditions/", "dx", "Conditions A–Z", "Plain-English fact sheets you can read in two minutes and print in one.")
 + _c("/medicines/", "medicines", "Medicines A–Z", "What each medicine does, common side effects and what to watch for.")
 + _c("/blood-tests/", "panelysis", "Blood tests explained", "What your results mean, and why “a bit high” is often fine.")
 + _c("/compare/", "comorbix", "Comparisons", "Face-offs like cold vs flu and ibuprofen vs paracetamol.")
 + '</div>\n<h2>Do something about it</h2>\n<div class="dh-grid">\n'
 + _c("/exercises/", "exercises", "Exercise handouts", "Printable rehab and stretching plans with pictures.")
 + _c("/specialists/", "specialists", "Specialists / Allied Health", "Who does what, telehealth, bulk billing and wait times as stated.", "Newcastle + Hunter")
 + '</div>\n<h2>Keep up</h2>\n<div class="dh-grid">\n'
 + _c("/zebra-mail/", "triviosis", "Weekly Dose", "The week in health: news, research, oddities and one useful thing.")
 + _c("/days/", "gridectomy", "Health Calendar", "World health days and awareness weeks coming up.")
 + _c("/research/", "research", "Research hub", "New studies in plain English, and trials you can join.")
 + '</div>\n<p class="sass">Pippa never forgets a question. Neither should your GP, so write yours down before the appointment.</p>\n'
 '<style>.dh-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin:14px 0 8px}'
 '.dh-c{display:flex;gap:12px;align-items:flex-start;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;text-decoration:none;color:var(--ink);transition:border-color .15s,transform .15s}'
 '.dh-c:hover,.dh-c:focus-visible{border-color:var(--brand);transform:translateY(-1px)}.dh-c img{flex:0 0 auto}.dh-c b{display:block;font-size:16px;margin-bottom:2px}'
 '.dh-c span{font-size:13.5px;color:var(--muted);line-height:1.4}.dh-c i{display:inline-block;font-style:normal;font-size:11px;font-weight:700;background:#FFF4D6;color:#7A5A00;border-radius:6px;padding:1px 6px;margin:0 0 4px}</style>\n')
page("/patients/", "For Patients: Pain, Fatigue, ADHD, Conditions and Medicines",
 "Plain-English health help in one place: hubs on pain, fatigue, ADHD and autism, GLP-1 medicines, plus conditions, medicines, blood tests, exercise handouts and specialists.",
 "For patients", "For patients", "Hub", [("Malady Wise", "/"), ("For patients", "/patients/")], body, [], [],
 [("For doctors", "/doctors/"), ("Conditions", "/conditions/"), ("Medicines", "/medicines/")], audience="Patient", about_type="MedicalWebPage")
import os as _os, re as _re2
_f = _os.path.join("patients", "index.html")
if _os.path.exists(_f):
    _s = open(_f, encoding="utf-8").read()
    _s = _re2.sub(r'<div class="fs-top">.*?</div>\n', "", _s, count=1)
    _s = _s.replace("<h1>For patients</h1>", '<div class="mw-sec-hero" style="display:flex;align-items:center;gap:12px;margin:8px 0 4px"><img src="/assets/mascots/patients.svg" width="64" height="64" alt="Pippa the elephant, host of the patients\' hub" style="flex:0 0 auto"><h1 style="margin:0">For patients</h1></div>', 1)
    _s = _re2.sub(r'<p class="meta"><em>Updated ([^.]+)\. For health professionals\.[^<]*</em></p>', r'<p class="meta">Updated \1.</p>', _s)
    open(_f, "w", encoding="utf-8").write(_s)
