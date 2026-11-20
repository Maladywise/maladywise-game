#!/usr/bin/env python3
"""Builds /mri-quiz/ (crawlable quizkit quiz with real MRI images).

Images: freely licensed Wikimedia Commons files (public domain, CC BY, CC BY-SA), shown from Wikimedia's
servers (not copied into the repo). Credits under each image: author, licence and source; the Commons page link
(whose file name may give the answer away) only in the answer and the credits list.

Run: python3 _scripts/quizkit/mri.py
"""
import hashlib, html, json, os, random, re, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from headkit import fix_html  # shared <head> clean-up: self-hosted fonts, deferred scripts, honest JSON-LD

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = "https://maladywise.com"
PATH = "/mri-quiz/"
ISO = "2026-11-20"
REVIEWED = "20 November 2026"
QKV = "7"


def esc(s):
    return html.escape(s, quote=True)


def commons(file, thumb, author, licence, licence_url):
    return dict(page="https://commons.wikimedia.org/wiki/File:" + file.replace(" ", "_").replace("(", "%28").replace(")", "%29"),
                file=file, url=thumb, author=author, licence=licence, licence_url=licence_url, source="Wikimedia Commons")


def X(img, case, q, a, w, why, tip, alt, region):
    assert len(w) == 3 and a not in w
    return dict(img=img, case=case, q=q, a=a, w=w, why=why, tip=tip, alt=alt, region=region)


BYSA3 = "https://creativecommons.org/licenses/by-sa/3.0"
WM = "https://upload.wikimedia.org/wikipedia/commons/"
TH = "https://upload.wikimedia.org/wikipedia/commons/thumb/"

QS = [
    X(commons("Acoustic schwannoma.jpg", WM + "2/26/Acoustic_schwannoma.jpg", "Collins SP et al., Radiation Oncology 2007", "CC BY 2.0", "https://creativecommons.org/licenses/by/2.0"),
      "A 51-year-old has slowly worsening hearing and ringing (tinnitus) in her left ear.",
      "What does this contrast-enhanced MRI of the brain show?", "Vestibular schwannoma (acoustic neuroma)",
      ["Meningioma of the falx", "Glioblastoma", "Normal MRI"],
      "A bright, enhancing mass sits at the left cerebellopontine angle (right of the image), right next to the internal auditory canal. It grows from the vestibular nerve, so one-sided hearing loss and tinnitus usually come first.",
      "Unexplained one-sided (asymmetrical) sensorineural hearing loss or tinnitus warrants an MRI of the internal auditory canals. Schwannomas on both sides mean neurofibromatosis type 2.",
      "Axial contrast-enhanced MRI of the brain at the level of the posterior fossa", "Brain"),
    X(commons("Acromegaly pituitary macroadenoma.JPEG", WM + "f/f0/Acromegaly_pituitary_macroadenoma.JPEG", "Philippe Chanson and Sylvie Salenave", "CC BY 2.0", "https://creativecommons.org/licenses/by/2.0"),
      "A 45-year-old has headaches, his rings no longer fit, and he keeps bumping into door frames.",
      "What does this coronal MRI of the pituitary show?", "Pituitary macroadenoma",
      ["Craniopharyngioma", "Meningioma", "Normal pituitary gland"],
      "A large mass (over 10 mm) grows up out of the pituitary fossa and presses on the optic chiasm above it. Pressure on the crossing fibres of the chiasm takes out the outer half of vision in both eyes (bitemporal hemianopia).",
      "Growing hands and feet point to growth hormone excess (acromegaly). Check visual fields and the pituitary hormones, including IGF-1, prolactin, cortisol and thyroid tests.",
      "Two coronal MRI images of the pituitary region", "Brain"),
    X(commons("Severe herniation of L4-L5 disc.png", WM + "9/9c/Severe_herniation_of_L4-L5_disc.png", "Jay Moore", "CC0", "http://creativecommons.org/publicdomain/zero/1.0/deed.en"),
      "A 38-year-old has low back pain shooting down the back of his leg to below the knee after lifting a heavy box.",
      "What does this sagittal T2 MRI of the lumbar spine show?", "Disc herniation (prolapse) at L4–L5",
      ["Spinal stenosis from facet joint arthritis", "Vertebral fracture", "Spondylolisthesis"],
      "The disc between L4 and L5 bulges well backwards into the spinal canal, narrowing the space for the nerve roots. The discs above it look normal.",
      "Most sciatica settles within 6 to 12 weeks without surgery. Red flags (saddle numbness, new bladder or bowel trouble, symptoms in both legs) need an urgent MRI for cauda equina syndrome.",
      "Sagittal T2-weighted MRI of the lumbar spine", "Spine"),
    X(commons("AFIP-00405558-Glioblastoma-Radiology.jpg", WM + "a/a3/AFIP-00405558-Glioblastoma-Radiology.jpg", "Armed Forces Institute of Pathology", "Public domain", ""),
      "A 62-year-old has six weeks of worsening headaches and new trouble finding words.",
      "What does this contrast-enhanced MRI of the brain show?", "Glioblastoma",
      ["Brain abscess", "Meningioma", "Ischaemic stroke"],
      "An irregular mass with a thick ring of enhancement around a dark, dead (necrotic) centre sits in the left temporal lobe (right of the image), with swelling around it. A thick, irregular ring in an older adult is typical of glioblastoma.",
      "Ring-enhancing lesions have a short list: metastasis, abscess, glioblastoma, resolving bleed or infarct, demyelination and radiation necrosis. Diffusion MRI helps: pus in an abscess restricts diffusion.",
      "Axial contrast-enhanced MRI of the brain", "Brain"),
    X(commons("Meningioma-MRT.jpg", WM + "1/13/Meningioma-MRT.jpg", "Всеволод Лучанский (vvray)", "CC BY-SA 3.0", BYSA3),
      "A 58-year-old has a year of slowly worsening headaches, and her family says her personality has changed.",
      "What does this MRI of the brain show?", "Meningioma",
      ["Glioblastoma", "Vestibular schwannoma", "Subdural haematoma"],
      "A large, well-defined mass sits against the lining of the brain (outside the brain tissue) in the left frontotemporal region, pushing the brain across rather than growing out of it.",
      "Meningiomas are the commonest primary brain tumour and are mostly benign and slow-growing. Many are found by chance. Clues: a broad base on the dura and a ‘dural tail’ of enhancement.",
      "Four MRI images of the brain, sagittal and axial", "Brain"),
    X(commons("Chiari-1-Malformation 13W - MR T2 sagittal - 001.jpg", WM + "7/7d/Chiari-1-Malformation_13W_-_MR_T2_sagittal_-_001.jpg", "Hellerhoff", "CC BY-SA 3.0", BYSA3),
      "A 13-year-old has headaches at the back of her head that get worse when she coughs, laughs or strains.",
      "What does this sagittal T2 MRI show?", "Chiari I malformation",
      ["Hydrocephalus", "Medulloblastoma", "Normal MRI"],
      "The lowest parts of the cerebellum (the tonsils) sit below the opening at the base of the skull (the foramen magnum), crowding the space around the brainstem. More than 5 mm below is the usual cut-off.",
      "Headache triggered by coughing or straining is the classic symptom. Image the whole spine too: Chiari I often comes with a fluid cavity (syrinx) in the spinal cord.",
      "Sagittal T2-weighted MRI of the head and upper neck", "Brain"),
    X(commons("Syringomyelia (with arrow).png", WM + "0/07/Syringomyelia_%28with_arrow%29.png", "Cyborg Ninja at English Wikipedia (derivative: SUM1)", "CC BY 4.0", "https://creativecommons.org/licenses/by/4.0"),
      "A 30-year-old has burns on his hands that he didn’t feel, and numbness across his shoulders in a cape-like pattern.",
      "What does this sagittal T2 MRI of the neck show (arrow)?", "Syringomyelia (a syrinx in the spinal cord)",
      ["Multiple sclerosis plaque", "Disc herniation", "Spinal cord tumour"],
      "A fluid-filled cavity, bright on T2 (arrowed), runs down the centre of the cervical spinal cord. It damages the crossing pain and temperature fibres first, so pain and heat go while light touch is spared.",
      "‘Cape-like’ loss of pain and temperature with preserved touch is the classic pattern. Look at the top of the scan for a Chiari I malformation.",
      "Sagittal T2-weighted MRI of the cervical spine with an arrow", "Spine"),
    X(commons("Axial DIR MRI of a brain with multiple sclerosis lesions.jpg", TH + "c/ce/Axial_DIR_MRI_of_a_brain_with_multiple_sclerosis_lesions.jpg/960px-Axial_DIR_MRI_of_a_brain_with_multiple_sclerosis_lesions.jpg", "Favaretto A et al.", "CC BY 4.0", "https://creativecommons.org/licenses/by/4.0"),
      "A 29-year-old woman had painful, blurred vision in one eye last year. Now she has tingling and numbness in both legs.",
      "What is the most likely diagnosis on this MRI (arrows and circles)?", "Multiple sclerosis",
      ["Small vessel ischaemic disease", "Migraine-related white matter spots", "Brain metastases"],
      "Several bright lesions (arrowed and circled) are scattered through the brain, including in and next to the cortex. Lesions in different places at different times, with optic neuritis then a new episode, fit multiple sclerosis.",
      "MS lesions favour four places: around the ventricles, in or next to the cortex, below the tentorium and in the spinal cord. Ovoid lesions pointing away from the ventricles are ‘Dawson’s fingers’.",
      "Axial MRI of the brain with arrows and circles", "Brain"),
    X(commons("Hsv encephalitis.jpg", WM + "d/d5/Hsv_encephalitis.jpg", "Laughlin Dawes", "CC BY 3.0", "https://creativecommons.org/licenses/by/3.0"),
      "A 33-year-old woman has three days of fever, confusion and agitation, and has stopped speaking.",
      "What does this coronal T2 MRI show?", "Herpes simplex encephalitis",
      ["Ischaemic stroke", "Glioblastoma", "Multiple sclerosis"],
      "The temporal lobes are bright and swollen, one much more than the other. Herpes simplex virus type 1 has a strong preference for the temporal lobes and insula.",
      "Start IV aciclovir as soon as you suspect it. Don’t wait for the MRI or the lumbar puncture result: delay worsens the outcome.",
      "Coronal T2-weighted MRI of the brain", "Brain"),
    X(commons("NPH MRI 088.png", WM + "2/22/NPH_MRI_088.png", "Nevit Dilmen", "CC BY-SA 3.0", BYSA3),
      "A 74-year-old has a shuffling, ‘magnetic’ walk, urinary urgency and slowly worsening memory.",
      "What does this MRI of the brain show?", "Normal pressure hydrocephalus",
      ["Alzheimer’s disease", "Parkinson’s disease", "Normal ageing"],
      "The ventricles are much bigger than you’d expect for the size of the grooves (sulci) on the brain surface. Ventricles out of proportion to atrophy, plus the triad of walking trouble, incontinence and confusion, suggest normal pressure hydrocephalus.",
      "‘Wet, wobbly and wacky.’ Walking is the symptom most likely to improve with a shunt, and a large-volume lumbar puncture (tap test) can help predict who will benefit.",
      "Axial T1-weighted MRI of the brain", "Brain"),
]

FAQS = [
    ("What’s the difference between T1 and T2 MRI?",
     "On T1 images fluid (CSF) is dark and fat is bright, so anatomy looks crisp. On T2 images fluid is bright, so swelling, inflammation and cysts stand out. A handy memory aid: on T2, water is white (‘World War Two’). FLAIR is a T2 image with the CSF signal switched off, so lesions next to the ventricles are easier to see."),
    ("Why is contrast (gadolinium) used in MRI?",
     "Gadolinium shows where the blood–brain barrier is broken or where tissue has a rich blood supply, so tumours, abscesses, active MS plaques and infection light up. It isn’t needed for many scans, such as most disc problems."),
    ("When is MRI better than CT?",
     "MRI shows soft tissue in much more detail: the brain, spinal cord, discs, ligaments, muscles and the pituitary. CT is faster and better for acute bleeding in the head, fractures and lung problems, and is easier for unwell patients."),
    ("Who can’t have an MRI?",
     "MRI uses a powerful magnet, so some pacemakers, cochlear implants, older aneurysm clips and metal fragments in the eye can be dangerous. Many modern devices are ‘MRI conditional’. Always check with the radiology department beforehand."),
    ("Who is this MRI quiz for?",
     "Medical, nursing, physiotherapy and radiography students, junior doctors and GPs brushing up on common MRI findings, and anyone curious about what MRI scans show. Every answer comes with the key finding and a practical tip."),
    ("Are these real MRI scans?",
     "Yes. They’re real, anonymised MRI images shared under free licences or in the public domain on Wikimedia Commons, credited under each image. The patient stories are fictional and written to match each scan."),
]


# ---------- build ----------
def shuffled(q, salt, pos):
    w = list(q["w"])
    random.Random(hashlib.md5((salt + q["q"] + q["a"]).encode()).hexdigest()).shuffle(w)
    w.insert(pos, q["a"])
    return w


def positions(n, salt):
    out = []
    k = 0
    while len(out) < n:
        blk = [0, 1, 2, 3]
        random.Random(salt + str(k)).shuffle(blk)
        out += blk
        k += 1
    return out[:n]


def save_img(q, k):
    from PIL import Image
    name = "xr-%02d.jpg" % k
    out = ROOT + PATH + "img/" + name
    if q["img"]["path"] is None:  # Commons original not supplied: keep the committed file
        assert os.path.exists(out), out
    else:
        im = Image.open(q["img"]["path"]).convert("RGB")
        c = q["img"].get("crop")
        if c:
            W, H = im.size
            im = im.crop((round(c[0] * W), round(c[1] * H), round(c[2] * W), round(c[3] * H)))
        im.thumbnail((1000, 1000), Image.LANCZOS)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        im.save(out, "JPEG", quality=85, optimize=True, progressive=True)
    from PIL import Image as I2
    w, h = I2.open(out).size
    return name, w, h


def lic_html(i):
    return ('<a href="%s" target="_blank" rel="noopener">%s</a>' % (esc(i["licence_url"]), esc(i["licence"]))) if i["licence_url"] else esc(i["licence"])


def src_link(i):
    nm = re.sub(r"\.[a-z]+$", "", i["file"], flags=re.I).replace("_", " ") if i.get("file") else "Source page"
    return '<a href="%s" target="_blank" rel="noopener">%s</a>' % (esc(i["page"]), esc(nm))


def build():
    n = len(QS)
    assert 10 <= n <= 20, n
    pos = positions(n, "mri-quiz")
    items = []
    for k, q in enumerate(QS):
        i = q["img"]
        opts = shuffled(q, "mri-quiz", pos[k])
        cap = "Image: %s · %s · %s." % (esc(i["author"]), lic_html(i), esc(i["source"]))
        items.append("".join([
            '<li class="qk-q" id="mri-q%d" data-a="%d">' % (k + 1, pos[k]),
            '<p class="qk-n">Question %d of %d · %s</p>' % (k + 1, n, esc(q["region"])),
            '<p class="qk-case">%s</p>' % esc(q["case"]),
            '<h3 class="qk-p">%s</h3>' % esc(q["q"]),
            '<figure class="qk-xr"><img src="%s" alt="%s" loading="%s" decoding="async" referrerpolicy="no-referrer"><figcaption>%s</figcaption></figure>' % (
                esc(i["url"]), esc(q["alt"]), "eager" if k == 0 else "lazy", cap),
            '<ol class="qk-opts" type="A">%s</ol>' % "".join("<li>%s</li>" % esc(x) for x in opts),
            '<details class="qk-ans"><summary>Show answer</summary><p><b>Answer: %s.</b> <span class="why">%s <span class="qk-tip"><strong>Tip:</strong> %s</span> <span class="qk-src">Image source: %s by %s.</span></span></p></details>' % (
                esc(q["a"]), esc(q["why"]), esc(q["tip"]), src_link(i), esc(i["author"])),
            "</li>"]))
    quiz = '<section class="qk" id="quiz" data-id="mri" data-title="MRI quiz" data-emoji="🧲">\n<ol class="qk-list">\n%s\n</ol>\n</section>' % "\n".join(items)

    regions = {}
    for q in QS:
        regions[q["region"]] = regions.get(q["region"], 0) + 1
    title = "MRI Quiz: Brain and Spine MRI Scans"
    desc = "Free MRI quiz: %d real brain and spine MRI scans, from MS and glioblastoma to Chiari, syrinx and disc prolapse, with key findings and tips." % n
    h1 = "MRI Quiz: Practise Reading Real MRI Scans"
    lede = ("Ten real MRI scans to read: tumours, inflammation and structural problems in the brain and spine. "
            "Read the short story, look at the scan, pick a diagnosis, and the answer explains what you should have spotted.")
    about = ('<section class="qk-about"><h2>About this quiz</h2><ul>'
             '<li><b>%d questions:</b> %d brain, %d spine.</li>'
             '<li><b>Core findings:</b> the MRI diagnoses GPs, students and juniors meet most.</li>'
             '<li><b>Real images:</b> anonymised MRI scans under free licences, credited under each image. Patient stories are fictional.</li>'
             '<li><b>Free, no sign-up:</b> your best score is saved on your device only.</li></ul></section>') % (
        n, regions.get("Brain", 0), regions.get("Spine", 0))
    credits = '<details class="qk-credits"><summary>Image credits (contains answers)</summary><ol>%s</ol></details>' % "".join(
        "<li>%s by %s · %s · via %s.</li>" % (src_link(q["img"]), esc(q["img"]["author"]), lic_html(q["img"]), esc(q["img"]["source"])) for q in QS)
    faq = '<section class="faq"><h2>Common questions</h2>' + "".join("<details><summary>%s</summary><p>%s</p></details>" % (esc(a), esc(b)) for a, b in FAQS) + "</section>"
    body = "\n".join([
        "<h1>%s</h1>" % esc(h1),
        '<p class="lede">%s</p>' % esc(lede),
        '<p class="meta">Axial and coronal MRI images are viewed as if facing the patient, so the patient’s right is on the left of the image.</p>',
        quiz,
        '<p class="qk-cta"><b>Want more?</b> Try the <a href="/ct-quiz/">CT scan quiz</a> and <a href="/x-ray-quiz/">X-ray quiz</a>, or <a href="/opacitis/">play a new X-ray every day</a> in Opacitis, our daily X-ray puzzle: one film, one story, six diagnoses. Past films are in the <a href="/opacitis/archive/">Opacitis archive</a>, and there are more games in <a href="/medical-games/">Medical games</a>.</p>',
        about,
        faq,
        '<h2>More medical quizzes</h2><nav id="more" data-label="Try another quiz"><ul><li><a href="/ct-quiz/">CT scan quiz</a></li><li><a href="/ultrasound-quiz/">Ultrasound quiz</a></li><li><a href="/nuclear-medicine-quiz/">Nuclear medicine quiz</a></li><li><a href="/x-ray-quiz/">X-ray quiz</a></li><li><a href="/ecg-quiz/">ECG quiz</a></li><li><a href="/anatomy-quiz/">Anatomy quizzes</a></li><li><a href="/anatomy-quiz/bones/">Bones quiz</a></li><li><a href="/medical-terminology-quiz/">Medical terminology quiz</a></li><li><a href="/opacitis/">Opacitis: a daily X-ray</a></li><li><a href="/medical-games/">All medical games</a></li></ul></nav>',
        credits,
        '<p class="meta"><em>Updated %s. Real MRI scans, fictional cases. General education, not personal medical advice.</em></p>' % REVIEWED,
    ])
    url = SITE + PATH
    lds = [
        {"@context": "https://schema.org", "@type": "Quiz", "name": "MRI quiz", "url": url, "inLanguage": "en-AU",
         "about": {"@type": "Thing", "name": "MRI interpretation"}, "educationalUse": "Self-assessment", "learningResourceType": "Quiz",
         "isAccessibleForFree": True, "dateModified": ISO, "publisher": {"@type": "Organization", "name": "Malady Wise", "url": SITE + "/"},
         "hasPart": [{"@type": "Question", "eduQuestionType": "Multiple choice", "position": k + 1, "text": q["case"] + " " + q["q"],
                      "suggestedAnswer": [{"@type": "Answer", "text": x} for x in q["w"]],
                      "acceptedAnswer": {"@type": "Answer", "text": q["a"], "answerExplanation": {"@type": "Comment", "text": q["why"] + " Tip: " + q["tip"]}}}
                     for k, q in enumerate(QS)]},
        {"@context": "https://schema.org", "@type": "FAQPage",
         "mainEntity": [{"@type": "Question", "name": a, "acceptedAnswer": {"@type": "Answer", "text": b}} for a, b in FAQS]},
    ]
    crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Malady Wise", "item": SITE + "/"},
        {"@type": "ListItem", "position": 2, "name": "Medical games", "item": SITE + "/medical-games/"},
        {"@type": "ListItem", "position": 3, "name": "MRI Quiz", "item": url}]}
    assert len(title) <= 60 and len(desc) <= 155, (len(title), len(desc))
    full = title + " | Malady Wise"
    V = {}
    for m in re.finditer(r"/assets/(shell\.css|shell\.js|site\.js|games\.js)\?v=(\d+)", open(ROOT + "/ecg-quiz/index.html", encoding="utf-8").read()):
        V[m.group(1)] = m.group(2)
    ld = "\n".join('<script type="application/ld+json">%s</script>' % json.dumps(x, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") for x in lds)
    ld += '\n<script type="application/ld+json" id="mw-breadcrumb-ld">%s</script>' % json.dumps(crumbs, ensure_ascii=False, separators=(",", ":"))
    s = """<!doctype html>
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
<meta property="og:image" content="{SITE}/assets/og/opacitis.png">
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
<script src="/assets/quizkit.js?v={qkv}"></script>
<script>MW.page();</script>
</body>
</html>
""".format(url=url, full=esc(full), desc=esc(desc), SITE=SITE, vcss=V["shell.css"], vj=V["shell.js"], vs=V["site.js"], vg=V["games.js"], qkv=QKV, ld=ld, body=body)
    os.makedirs(ROOT + PATH, exist_ok=True)
    open(ROOT + PATH + "index.html", "w", encoding="utf-8").write(fix_html(s))
    print("wrote", PATH, len(s), "questions", n, regions)


if __name__ == "__main__":
    build()
