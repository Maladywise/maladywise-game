# /quizzes/: practice quizzes hub, styled like /doctors/ and /patients/ (dh-grid cards). Quiz pages are built by _scripts/quizkit/.
import sys as _sys, os as _osq, re as _req
_sys.path.insert(0, "_scripts/quizkit")
from anat import QUIZZES as _QZ
_IMG = {"brain": "neurology", "cranial-nerves": "research", "skull": "dental", "muscles": "ortho", "upper-limb": "ortho", "lower-limb": "exercises",
        "head-and-neck": "gridectomy", "bones": "ortho", "heart": "arrhythmix", "digestive-system": "nutrition", "lungs": "sleep", "eye": "research", "ear": "gridectomy", "dermatomes": "dactylosis", "spine": "ortho", "coronary-arteries": "arrhythmix", "circle-of-willis": "neurology"}
def _c(href, img, t, d, best=None, n=None):
    tag = ('<i data-qq="%s" data-n="%s" hidden></i>' % (best, n)) if best else ""
    return ('<a class="dh-c" href="%s"><img src="/assets/mascots/%s.svg" width="48" height="48" alt="" loading="lazy"><span><b>%s</b>%s<span>%s</span></span></a>\n'
            % (href, img, t, tag, d))
_anat = "".join(_c("/anatomy-quiz/%s/" % q["slug"], _IMG.get(q["slug"], "dx"), q["h1"].replace(" Quiz", "").replace("Bones: The Human Skeleton", "Bones"),
                   q["card"], "anat-" + q["slug"], len(q["qs"])) for q in _QZ)
body = ('<p class="lede">Free practice quizzes with diagrams, real X-rays and ECG strips. Twenty questions each, easy to hard. No login. Best scores stay on your device.</p>\n'
 '<h2>Start here</h2>\n<div class="dh-grid">\n'
 + _c("/ecg-quiz/", "arrhythmix", "ECG quiz", "Rhythm strips and 12-leads, from sinus rhythm to Brugada.", "ecg", 20)
 + _c("/x-ray-quiz/", "opacitis", "X-ray quiz", "Real chest, abdominal and bone X-rays to read.", "x-ray", None)
 + _c("/anatomy-quiz/", "dx", "Mixed anatomy", "Ten questions from all over the body. A good warm-up.", "anat-mixed", None)
 + _c("/physiology-quiz/", "dx", "Physiology", "How the heart, lungs, kidneys and hormones work.", "physiology", 20)
 + '</div>\n<h2>Anatomy</h2>\n<div class="dh-grid">\n' + _anat
 + '</div>\n<h2>Imaging</h2>\n<div class="dh-grid">\n'
 + _c("/ct-quiz/", "opacitis", "CT quiz", "Real CT scans: bleeds, clots, obstructions.", "ct", None)
 + _c("/mri-quiz/", "neurology", "MRI quiz", "Brain and spine MRI, from MS to Chiari.", "mri", None)
 + _c("/ultrasound-quiz/", "pregnancy", "Ultrasound quiz", "Gallstones, AAA, DVT, ectopic and FAST.", "ultrasound", None)
 + _c("/nuclear-medicine-quiz/", "research", "Nuclear medicine quiz", "Bone scans, PET, V/Q and thyroid scans.", "nuclear", None)
 + '</div>\n<h2>Conditions</h2>\n<div class="dh-grid">\n'
 + _c("/asthma-quiz/", "sleep", "Asthma", "Puffers, first aid and warning signs.", "asthma", 12)
 + _c("/type-2-diabetes-quiz/", "nutrition", "Type 2 diabetes", "HbA1c, metformin, SGLT2s and remission.", "type-2-diabetes", 12)
 + _c("/heart-attack-quiz/", "arrhythmix", "Heart attack", "Warning signs, aspirin, stents and recovery.", "heart-attack", 12)
 + _c("/stroke-quiz/", "neurology", "Stroke", "FAST, time windows and TIA.", "stroke", 12)
 + _c("/adhd-quiz/", "mentalhealth", "ADHD", "Symptoms, diagnosis, medicines and myths.", "adhd", 12)
 + _c("/pots-quiz/", "zebritis", "POTS", "The stand test, salt, fluids and exercise.", "pots", 12)
 + _c("/myasthenia-gravis-quiz/", "neurology", "Myasthenia gravis", "Fatigable weakness, thymoma and crisis.", "myasthenia-gravis", 12)
 + _c("/addisons-disease-quiz/", "emergency", "Addison’s disease", "Adrenal crisis and sick day rules.", "addisons-disease", 12)
 + _c("/haemochromatosis-quiz/", "panelysis", "Haemochromatosis", "Iron overload, ferritin and venesection.", "haemochromatosis", 12)
 + _c("/wilson-disease-quiz/", "zebritis", "Wilson disease", "Copper, eye rings and lifelong treatment.", "wilson-disease", 12)
 + '</div>\n<h2>Medicines and words</h2>\n<div class="dh-grid">\n'
 + _c("/pharmacology-quiz/", "medicines", "Pharmacology", "Drug classes, antidotes and interactions.", "pharmacology", 20)
 + _c("/medical-terminology-quiz/", "morphemia", "Medical terminology", "Prefixes, suffixes and word roots, with a cheat sheet.", "terms-prefixes", None)
 + _c("/morphemia/", "morphemia", "Morphemia", "The daily game: build a long medical word from its parts.")
 + _c("/medical-abbreviations-quiz/", "morphemia", "Medical abbreviations", "From BP and PRN to the ones that cause errors.", "abbreviations", 20)
 + '</div>\n<h2>Clinical skills</h2>\n<div class="dh-grid">\n'
 + _c("/first-aid-quiz/", "emergency", "CPR and first aid", "DRSABCD, CPR, choking, burns, bites and stings.", "first-aid", 20)
 + _c("/dosage-calculation-quiz/", "medicines", "Dosage calculation", "Tablets, liquids, IV rates and infusions.", "dosage", 20)
 + '</div>\n<h2>Want more?</h2>\n<div class="dh-grid">\n'
 + _c("/", "dx", "Today’s puzzles", "The daily games, fresh at midnight.")
 + _c("/gp-school/", "gpschool", "GP School", "Free, game-style GP training for clinicians.")
 + _c("/arcade/", "basil", "Arcade", "Bonus games. Play all day.")
 + '</div>\n<p class="sass">Keyboard fans: arrow keys move between questions, and A to D or 1 to 4 answers.</p>\n'
 '<style>.dh-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin:14px 0 8px}'
 '.dh-c{display:flex;gap:12px;align-items:flex-start;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;text-decoration:none;color:var(--ink);transition:border-color .15s,transform .15s}'
 '.dh-c:hover,.dh-c:focus-visible{border-color:var(--brand);transform:translateY(-1px)}.dh-c img{flex:0 0 auto}.dh-c b{display:block;font-size:16px;margin-bottom:2px}'
 '.dh-c span{font-size:13.5px;color:var(--muted);line-height:1.4}.dh-c i{display:table;font-style:normal;font-size:11px;font-weight:700;background:#E6F4EA;color:#1E6B3A;border-radius:6px;padding:1px 6px;margin:0 0 4px}</style>\n'
 '<script>(function(){document.querySelectorAll("[data-qq]").forEach(function(el){var b=null;try{b=localStorage.getItem("qk-best-"+el.getAttribute("data-qq"))}catch(e){}'
 'if(b==null)return;var n=el.getAttribute("data-n");el.textContent="Best "+b+(n&&n!=="None"?"/"+n:"");el.hidden=false;});})();</script>\n')
page("/quizzes/", "Free Medical Practice Quizzes: Anatomy, ECG, X-ray",
 "Free practice quizzes with diagrams: anatomy (brain, heart, bones, muscles and more), ECG strips, real X-rays and medical terminology. Twenty questions each.",
 "Practice quizzes", "Practice quizzes", "Hub", [("Malady Wise", "/"), ("Practice quizzes", "/quizzes/")], body, [], [],
 [("All games", "/medical-games/"), ("GP School", "/gp-school/"), ("For doctors", "/doctors/")], audience="Patient", about_type="WebPage")
_fq = _osq.path.join("quizzes", "index.html")
if _osq.path.exists(_fq):
    _s = open(_fq, encoding="utf-8").read()
    _s = _req.sub(r'<div class="fs-top">.*?</div>\n', "", _s, count=1)
    _s = _s.replace("<h1>Practice quizzes</h1>", '<div class="mw-sec-hero" style="display:flex;align-items:center;gap:12px;margin:8px 0 4px"><img src="/assets/mascots/arrhythmix.svg" width="64" height="64" alt="Riff, host of the practice quizzes" style="flex:0 0 auto"><h1 style="margin:0">Practice quizzes</h1></div>', 1)
    _s = _req.sub(r'<p class="meta"><em>Updated ([^.]+)\. For health professionals\.[^<]*</em></p>', r'<p class="meta">Updated \1.</p>', _s)
    open(_fq, "w", encoding="utf-8").write(_s)
