#!/usr/bin/env python3
"""Builds /anatomy-quiz/, /ecg-quiz/ and /medical-terminology-quiz/ pages from anat.py and other.py (/x-ray-quiz/ is built by xray.py).
After running, re-run _scripts/add_breadcrumbs.py (this script drops the breadcrumb JSON-LD on the hub, ECG and terminology pages)."""
import collections, glob, hashlib, html, json, os, random, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from anat import QUIZZES
from other import ECG, TERMS
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from headkit import fix_html  # shared <head> clean-up: self-hosted fonts, deferred scripts, honest JSON-LD

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERE = os.path.dirname(os.path.abspath(__file__))
SITE = "https://maladywise.com"
REVIEWED = "8 November 2026"
ISO = "2026-11-08"
QKV = "4"  # 4: redrawn rotator cuff and dermatome maps; labels shown once answered


def esc(s):
    return html.escape(s, quote=True)


def versions():
    c = collections.defaultdict(collections.Counter)
    for f in glob.glob(ROOT + "/*/index.html"):
        for m in re.finditer(r"/assets/(shell\.css|shell\.js|site\.js|games\.js)\?v=(\d+)", open(f, encoding="utf-8").read()):
            c[m.group(1)][m.group(2)] += 1
    return {k: max(v.items(), key=lambda kv: (kv[1], int(kv[0])))[0] for k, v in c.items()}


V = versions()

# ---------- anatomy diagrams (pre-rendered from anatomegaly/art.js) ----------
ART_REQ = []
for qz in QUIZZES:
    for q in qz["qs"]:
        if q.get("art"):
            ART_REQ.append([q["art"][0], q["art"][1]])
open(HERE + "/artreq.json", "w").write(json.dumps(ART_REQ))
ART_OUT = json.loads(subprocess.check_output(["node", HERE + "/art.js", HERE + "/artreq.json"]))
ART = {json.dumps(r): o for r, o in zip(ART_REQ, ART_OUT)}


POS = {}


def shuffled(q, salt):
    opts = [q["a"]] + list(q["w"])
    assert len(set(opts)) == len(opts), q["q"]
    r = random.Random(hashlib.md5((salt + q["q"] + q["a"]).encode()).hexdigest())
    if not POS.get(salt):  # balanced answer positions: each block of 4 questions uses A, B, C and D once
        POS[salt + "#"] = POS.get(salt + "#", 0) + 1; blk = [0, 1, 2, 3]; random.Random(salt + str(POS[salt + "#"])).shuffle(blk); POS[salt] = blk
    pos = POS[salt].pop()
    w = list(q["w"]); r.shuffle(w)
    w.insert(pos, q["a"])
    return w, pos


def qhtml(q, i, n, salt, label="Question"):
    opts, ai = shuffled(q, salt)
    o = ['<li class="qk-q" id="%s-q%d" data-a="%d">' % (salt, i + 1, ai), '<p class="qk-n">%s %d of %d</p>' % (label, i + 1, n)]
    if q.get("case"):
        o.append('<p class="qk-case">%s</p>' % esc(q["case"]))
    o.append('<h3 class="qk-p">%s</h3>' % esc(q["q"]))
    if q.get("art"):
        a = ART[json.dumps([q["art"][0], q["art"][1]])]
        o.append('<figure class="qk-art">%s<figcaption>%s</figcaption></figure>' % (a["svg"], esc(a["cap"])))
    if q.get("ecg"):
        o.append('<div class="qk-ecg" data-ecg="%s" data-seed="%s"><p>The ECG trace is drawn here by your browser (it needs JavaScript).</p></div>' % (esc(json.dumps(q["ecg"], separators=(",", ":"))), esc(q["seed"])))
        if q.get("src"):
            o.append('<p class="qk-ecgcap">From <a href="/arrhythmix/archive/#d%s">Arrhythmix #%d</a>. Computer-generated trace, fictional case.</p>' % (q["src"], q["num"]))
    o.append('<ol class="qk-opts" type="A">%s</ol>' % "".join("<li>%s</li>" % esc(x) for x in opts))
    o.append('<details class="qk-ans"><summary>Show answer</summary><p><b>Answer: %s.</b> <span class="why">%s</span></p></details>' % (esc(q["a"]), esc(q["why"])))
    o.append("</li>")
    return "".join(o)


def quiz_section(qs, qid, title, emoji, sec_id="quiz", extra="", heading=None, label="Question"):
    h = ['<section class="qk" id="%s" data-id="%s" data-title="%s" data-emoji="%s">' % (sec_id, qid, esc(title), emoji)]
    if heading:
        h.append('<h2 class="qk-h">%s</h2>' % esc(heading))
    h.append('<ol class="qk-list">')
    h += [qhtml(q, i, len(qs), sec_id if sec_id != "quiz" else qid, label) for i, q in enumerate(qs)]
    h.append("</ol>" + extra + "</section>")
    return "\n".join(h)


def quiz_ld(name, url, qs, about):
    return {"@context": "https://schema.org", "@type": "Quiz", "name": name, "url": url, "inLanguage": "en-AU",
            "about": {"@type": "Thing", "name": about}, "educationalUse": "Self-assessment", "learningResourceType": "Quiz",
            "isAccessibleForFree": True, "dateModified": ISO,
            "publisher": {"@type": "Organization", "name": "Malady Wise", "url": SITE + "/"},
            "hasPart": [{"@type": "Question", "eduQuestionType": "Multiple choice", "position": i + 1,
                         "text": ((q["case"] + " ") if q.get("case") else "") + q["q"],
                         "suggestedAnswer": [{"@type": "Answer", "text": w} for w in q["w"]],
                         "acceptedAnswer": {"@type": "Answer", "text": q["a"], "answerExplanation": {"@type": "Comment", "text": q["why"]}}}
                        for i, q in enumerate(qs)]}


def faq_ld(faqs):
    return {"@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": a, "acceptedAnswer": {"@type": "Answer", "text": b}} for a, b in faqs]}


def crumbs_ld(items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": SITE + u} for i, (n, u) in enumerate(items)]}


def faq_html(faqs):
    return '<section class="faq"><h2>Common questions</h2>' + "".join("<details><summary>%s</summary><p>%s</p></details>" % (esc(a), esc(b)) for a, b in faqs) + "</section>"


def page(path, title, desc, og, body, lds, ecg=False):
    full = title + " | Malady Wise"
    assert len(title) <= 60, (title, len(title))
    assert len(desc) <= 155, (desc, len(desc))
    url = SITE + path
    ld = "\n".join('<script type="application/ld+json">%s</script>' % json.dumps(x, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") for x in lds)
    return """<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<link rel="canonical" href="{url}">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{full}</title>
<meta name="description" content="{desc}">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png"><link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48.png"><link rel="icon" type="image/png" sizes="96x96" href="/assets/favicon-96.png"><link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<meta name="theme-color" content="#4A3480">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Malady Wise">
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{full}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{SITE}/assets/og/{og}.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="/assets/fonts/poppins-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/shell.css?v={vcss}">
<link rel="stylesheet" href="/assets/quizkit.css?v={qkv}">
<script src="/assets/games.js?v={vg}"></script>
<script src="/assets/site.js?v={vs}"></script>
<script src="/assets/shell.js?v={vj}"></script>
{ld}
</head>
<body>
<main class="wrap doc">
{body}
<footer class="site"><p class="ft-base"><span class="ft-note">General education, not personal medical advice.</span> <span class="ft-links"><a href="/about/">About</a> <a href="/disclaimer/">Disclaimer</a> <a href="/privacy/">Privacy</a> <a href="/contact/">Contact</a></span></p></footer>
</main>
{ecgjs}<script src="/assets/quizkit.js?v={qkv}"></script>
<script>MW.page();</script>
</body>
</html>
""".format(url=url, full=esc(full), desc=esc(desc), SITE=SITE, og=og, vcss=V["shell.css"], vj=V["shell.js"], vs=V["site.js"], vg=V["games.js"], qkv=QKV, ld=ld, body=body,
           ecgjs='<script src="/arrhythmix/ecg.js"></script>\n' if ecg else "")


def write(path, s):
    d = ROOT + path
    os.makedirs(d, exist_ok=True)
    open(d + "index.html", "w", encoding="utf-8").write(fix_html(s))
    print("wrote", path, len(s))


def reviewed(extra=""):
    return '<p class="meta"><em>Updated %s.%s General education, not personal medical advice.</em></p>' % (REVIEWED, extra)


OTHER_LINKS = [("/ecg-quiz/", "ECG quiz", "Rhythm strips and a 12-lead to read."), ("/x-ray-quiz/", "X-ray quiz", "Real chest, abdominal and bone X-rays."), ("/medical-terminology-quiz/", "Medical terminology quiz", "Prefixes, suffixes and word roots.")]


def more_nav(cur=None, heading="More anatomy quizzes", others=True):
    items = ['<li><a href="/anatomy-quiz/%s/">%s</a></li>' % (q["slug"], esc(q["h1"].replace(" Anatomy Quiz", " anatomy quiz").replace(" Quiz", " quiz").replace(": The Human Skeleton", ""))) for q in QUIZZES if q["slug"] != cur]
    if others:
        items += ['<li><a href="%s">%s</a></li>' % (u, esc(t)) for u, t, _ in OTHER_LINKS]
    return '<h2>%s</h2><nav id="more" data-label="Try another quiz"><ul>%s</ul></nav>' % (heading, "".join(items))


# ---------- anatomy subpages ----------
for qz in QUIZZES:
    path = "/anatomy-quiz/%s/" % qz["slug"]
    n = len(qz["qs"])
    assert 10 <= n <= 15, (qz["slug"], n)
    short = qz["h1"]
    body = "\n".join([
        '<p class="meta"><a href="/anatomy-quiz/">Anatomy quizzes</a> › %s</p>' % esc(short.replace(" Quiz", "").replace("Bones: The Human Skeleton", "Bones")),
        "<h1>%s</h1>" % esc(qz["h1"]),
        '<p class="lede">%s</p>' % esc(qz["lede"]),
        quiz_section(qz["qs"], "anat-" + qz["slug"], qz["h1"].split(":")[0], qz["emoji"]),
        '<p class="qk-cta"><b>Want one a day?</b> <a href="/anatomegaly/">Play Anatomegaly, the daily anatomy game</a>: five body parts, four options each, new every midnight.</p>',
        faq_html(qz["faqs"]),
        more_nav(qz["slug"]),
        reviewed(" Diagrams are simplified, original sketches, not to scale."),
    ])
    lds = [quiz_ld(qz["h1"], SITE + path, qz["qs"], qz["h1"].replace(" Quiz", "").split(":")[0]), faq_ld(qz["faqs"]),
           crumbs_ld([("Malady Wise", "/"), ("Medical games", "/medical-games/"), ("Anatomy quizzes", "/anatomy-quiz/"), (qz["h1"], path)])]
    write(path, page(path, qz["title"], qz["desc"], "anatomegaly", body, lds))

# ---------- anatomy hub (with a mixed sampler) ----------
MIX = []
for qz, k in zip(QUIZZES, [4, 0, 3, 4, 4, 0, 5, 0]):
    MIX.append(qz["qs"][k])
for qz, k in [(QUIZZES[0], 9), (QUIZZES[1], 1)]:
    MIX.append(qz["qs"][k])
assert len(MIX) == 10
HUB_FAQ = [
    ("How do I learn anatomy fast?", "Learn a region at a time, starting with the bones, then the muscles and their actions, then the nerves and vessels. Test yourself early and often (retrieval practice beats rereading), space your revision over days, draw and label from memory, and link structures to real problems: a numb little finger points to the ulnar nerve."),
    ("Who are these anatomy quizzes for?", "Students in medicine, nursing, physiotherapy, paramedicine and biology, anyone revising for an anatomy and physiology exam, and curious people who want to know what’s under the skin. Each quiz starts gentle and gets harder."),
    ("Are the anatomy quizzes free?", "Yes. Every quiz is free with no sign-up. Your best score for each quiz is saved on your device only."),
    ("Are the diagrams accurate?", "They’re simplified, original teaching sketches, not to scale. Real anatomy varies from person to person, and textbooks and atlases show the detail."),
]
cards = "".join('<li><a href="/anatomy-quiz/%s/"><b>%s</b><span>%s</span><small data-qk-best="anat-%s" data-qk-n="%d">%d questions</small></a></li>' % (
    q["slug"], esc(q["h1"].replace(" Anatomy Quiz", "").replace(" Quiz", "").replace("Bones: The Human Skeleton", "Bones")), esc(q["card"]), q["slug"], len(q["qs"]), len(q["qs"])) for q in QUIZZES)
hub_body = "\n".join([
    "<h1>Anatomy Quiz: Free Human Anatomy Quizzes</h1>",
    '<p class="lede">Eight free anatomy quizzes with diagrams and short explanations: the brain, skull, muscles, bones, heart, head and neck, and upper and lower limbs. Pick a topic, or warm up with the ten-question mixed quiz below.</p>',
    '<h2>Choose a topic</h2><ul class="qk-cards">%s</ul>' % cards,
    '<h2>Quick mixed anatomy quiz</h2><p>Ten questions, one from each corner of the body.</p>',
    quiz_section(MIX, "anat-mixed", "Mixed anatomy quiz", "🦴"),
    '<p class="qk-cta"><b>Want one a day?</b> <a href="/anatomegaly/">Play Anatomegaly, the daily anatomy game</a>: five body parts, four options each, new every midnight. Past puzzles are in the <a href="/anatomegaly/archive/">Anatomegaly archive</a>.</p>',
    '<h2>More medical quizzes</h2><nav id="more" data-label="Try another quiz"><ul>%s</ul></nav>' % "".join('<li><a href="%s">%s</a>: %s</li>' % (u, esc(t), esc(d)) for u, t, d in OTHER_LINKS + [("/anatomy-quiz/brain/", "Brain anatomy quiz", "Lobes and cranial nerves."), ("/anatomy-quiz/heart/", "Heart anatomy quiz", "Chambers, valves and vessels.")]),
    faq_html(HUB_FAQ),
    reviewed(" Diagrams are simplified, original sketches, not to scale."),
])
hub_lds = [{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Anatomy Quiz: Free Human Anatomy Quizzes", "url": SITE + "/anatomy-quiz/", "inLanguage": "en-AU",
            "mainEntity": {"@type": "ItemList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "url": SITE + "/anatomy-quiz/%s/" % q["slug"], "name": q["h1"]} for i, q in enumerate(QUIZZES)]}},
           quiz_ld("Mixed anatomy quiz", SITE + "/anatomy-quiz/", MIX, "Human anatomy"), faq_ld(HUB_FAQ)]
write("/anatomy-quiz/", page("/anatomy-quiz/", "Anatomy Quiz: Free Human Anatomy Quizzes",
                             "Free anatomy quizzes with diagrams: brain, skull, muscles, bones, heart, head and neck, upper and lower limb. Instant answers and explanations.",
                             "anatomegaly", hub_body, hub_lds))

# ---------- ECG quiz ----------
n = len(ECG["qs"])
ecg_body = "\n".join([
    "<h1>%s</h1>" % esc(ECG["h1"]),
    '<p class="lede">%s</p>' % esc(ECG["lede"]),
    '<p class="meta">Standard paper: 25 mm/s and 10 mm/mV, so one small square is 40 ms and 0.1 mV.</p>',
    quiz_section(ECG["qs"], "ecg", "ECG quiz", "💓"),
    '<p class="qk-cta"><b>Want a new ECG every week?</b> <a href="/arrhythmix/">Play Arrhythmix</a>: one case, one ECG, six diagnoses, three tries. Every past ECG and its answer is in the <a href="/arrhythmix/archive/">Arrhythmix archive</a>.</p>',
    faq_html(ECG["faqs"]),
    '<h2>More medical quizzes</h2><nav id="more" data-label="Try another quiz"><ul><li><a href="/anatomy-quiz/heart/">Heart anatomy quiz</a></li><li><a href="/anatomy-quiz/">Anatomy quizzes</a></li><li><a href="/x-ray-quiz/">X-ray quiz</a></li><li><a href="/medical-terminology-quiz/">Medical terminology quiz</a></li><li><a href="/arrhythmix/archive/">Arrhythmix ECG archive</a></li></ul></nav>',
    reviewed(" ECG traces are computer-generated to show textbook features; cases are fictional."),
])
write("/ecg-quiz/", page("/ecg-quiz/", ECG["title"], ECG["desc"], "arrhythmix", ecg_body,
                         [quiz_ld("ECG quiz", SITE + "/ecg-quiz/", ECG["qs"], "ECG interpretation"), faq_ld(ECG["faqs"])], ecg=True))

# ---------- medical terminology quiz ----------
R = TERMS["rounds"]
secs = []
for k, r in enumerate(R):
    assert len(r["qs"]) == 10
    nxt = R[k + 1] if k + 1 < len(R) else None
    links = ('<a href="#%s">Next: %s</a>' % (nxt["id"], esc(nxt["h"]))) if nxt else ""
    links += '<a href="#reference">Prefix and suffix cheat sheet</a><a href="/anatomy-quiz/">Anatomy quizzes</a><a href="/ecg-quiz/">ECG quiz</a>'
    secs.append(quiz_section(r["qs"], "terms-" + r["id"], r["title"], "📚", sec_id=r["id"], heading=r["h"],
                             extra='<div class="qk-more" hidden data-label="%s">%s</div>' % ("Keep going" if nxt else "Try another quiz", links)))
ref = ['<h2 id="reference">Common medical prefixes and suffixes</h2><p>A quick cheat sheet. Spellings are Australian and British; the US often drops the ‘a’ or ‘o’ (anaemia → anemia, dyspnoea → dyspnea).</p>']
for h3, items in TERMS["ref"]:
    ref.append('<h3>%s</h3><ul class="qk-ref">%s</ul>' % (esc(h3), "".join("<li><b>%s</b>: %s</li>" % (esc(a), esc(b)) for a, b in items)))
allq = [q for r in R for q in r["qs"]]
terms_body = "\n".join([
    "<h1>%s</h1>" % esc(TERMS["h1"]),
    '<p class="lede">%s</p>' % esc(TERMS["lede"]),
    '<p class="qk-rounds">%s<a href="#reference">Cheat sheet</a></p>' % "".join('<a href="#%s">%s</a>' % (r["id"], esc(r["h"].split(": ")[1])) for r in R),
    "\n".join(secs),
    "\n".join(ref),
    '<p class="qk-cta"><b>Like word games?</b> Try <a href="/morphemia/">Morphemia</a>, our daily medical word puzzle, or <a href="/wordemic/">Wordemic</a>, the medical Wordle.</p>',
    faq_html(TERMS["faqs"]),
    '<h2>More medical quizzes</h2><nav id="more" data-label="Try another quiz"><ul><li><a href="/anatomy-quiz/">Anatomy quizzes</a></li><li><a href="/ecg-quiz/">ECG quiz</a></li><li><a href="/x-ray-quiz/">X-ray quiz</a></li><li><a href="/anatomy-quiz/brain/">Brain anatomy quiz</a></li></ul></nav>',
    reviewed(),
])
write("/medical-terminology-quiz/", page("/medical-terminology-quiz/", TERMS["title"], TERMS["desc"], "morphemia", terms_body,
                                         [quiz_ld("Medical terminology quiz", SITE + "/medical-terminology-quiz/", allq, "Medical terminology"), faq_ld(TERMS["faqs"])]))
print("versions", V)
print("counts", {q["slug"]: len(q["qs"]) for q in QUIZZES}, "ecg", len(ECG["qs"]), "terms", len(allq))
import static_nav  # footer links and share-card tags for new or rebuilt pages (STYLE.md)
static_nav.postbuild()
