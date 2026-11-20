#!/usr/bin/env python3
"""Builds /ct-quiz/ (crawlable quizkit quiz with real CT images).

Images: freely licensed Wikimedia Commons files (public domain, CC BY, CC BY-SA), shown from Wikimedia's
servers (not copied into the repo). Credits under each image: author, licence and source; the Commons page link
(whose file name may give the answer away) only in the answer and the credits list.

Run: python3 _scripts/quizkit/ct.py
"""
import hashlib, html, json, os, random, re, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from headkit import fix_html  # shared <head> clean-up: self-hosted fonts, deferred scripts, honest JSON-LD

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = "https://maladywise.com"
PATH = "/ct-quiz/"
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
    X(commons("Traumatic acute epidual hematoma.jpg", WM + "e/e2/Traumatic_acute_epidual_hematoma.jpg", "Jpogi", "CC BY-SA 3.0", BYSA3),
      "A 19-year-old was knocked out in a football clash, woke up and chatted normally, then became drowsy two hours later.",
      "What does this non-contrast CT head show?", "Extradural (epidural) haematoma",
      ["Acute subdural haematoma", "Subarachnoid haemorrhage", "Intracerebral haemorrhage"],
      "A bright, lens-shaped (biconvex) collection presses in from the inside of the skull at the front of the patient’s right side. Extradural bleeds are held back by the skull sutures, so they bulge inwards rather than spreading out. Most come from a torn middle meningeal artery.",
      "Lens shape = extradural. Crescent shape that follows the brain surface = subdural. The ‘lucid interval’ (awake, then deteriorating) is classic but not always present.",
      "Axial non-contrast CT of the head", "Head"),
    X(commons("Trauma subdural.jpg", TH + "a/a6/Trauma_subdural.jpg/960px-Trauma_subdural.jpg", "Glitzy queen00 at English Wikipedia", "Public domain", ""),
      "An 82-year-old on warfarin fell and bumped her head a week ago. Her family says she is now more confused and drowsy.",
      "What does this non-contrast CT head show?", "Subdural haematoma",
      ["Extradural haematoma", "Ischaemic stroke", "Normal ageing brain"],
      "A crescent-shaped collection of blood follows the curve of the brain over the patient’s left side (right of the image) and pushes the midline across. Subdurals come from torn bridging veins, so they spread along the brain surface and cross suture lines.",
      "Older people, falls and blood thinners: think subdural even after a minor bump. Check for midline shift.",
      "Axial non-contrast CT of the head", "Head"),
    X(commons("Subarachnoid hemorrhage CT.jpg", WM + "1/1e/Subarachnoid_hemorrhage_CT.jpg", "Dr. George Jallo, pediatric neurosurgeon at Johns Hopkins", "CC BY-SA 3.0", BYSA3),
      "A 47-year-old had a sudden ‘worst ever’ headache while lifting weights, then vomited. Her neck is stiff.",
      "What does this non-contrast CT head show?", "Subarachnoid haemorrhage",
      ["Extradural haematoma", "Normal CT head", "Brain abscess"],
      "Bright blood fills the spaces around the base of the brain (the basal cisterns) and runs out into the Sylvian fissures, where fluid should look dark. Most spontaneous subarachnoid bleeds come from a ruptured berry aneurysm.",
      "CT is most sensitive in the first 6 hours. Look where CSF should be dark: the cisterns, fissures and ventricles. Check the temporal horns too: if they’re enlarged, think early hydrocephalus.",
      "Axial non-contrast CT of the head at the level of the basal cisterns", "Head"),
    X(commons("Intracerebral hemorrage (CT scan).jpg", TH + "1/1c/Intracerebral_hemorrage_%28CT_scan%29.jpg/960px-Intracerebral_hemorrage_%28CT_scan%29.jpg", "Glitzy queen00 at English Wikipedia", "Public domain", ""),
      "A 63-year-old with poorly controlled blood pressure suddenly lost power down one side and is now drowsy.",
      "What does this non-contrast CT head show?", "Intracerebral haemorrhage with blood in the ventricles",
      ["Subarachnoid haemorrhage", "Extradural haematoma", "Brain abscess"],
      "Bright blood lies within the brain tissue and has burst into the lateral ventricles, which look cast in white. Blood in the ventricles raises the risk of hydrocephalus.",
      "Deep bleeds (basal ganglia, thalamus) suggest high blood pressure; lobar bleeds in older people suggest amyloid angiopathy. Always ask about anticoagulants: reversal is urgent.",
      "Axial non-contrast CT of the head", "Head"),
    X(commons("DissectionCT.png", TH + "1/12/DissectionCT.png/960px-DissectionCT.png", "James Heilman, MD", "CC BY-SA 3.0", BYSA3),
      "A 66-year-old with high blood pressure has sudden tearing chest pain going through to his back. The blood pressure differs between his arms.",
      "What does this contrast CT of the chest show?", "Aortic dissection involving the ascending aorta (Stanford type A)",
      ["Pulmonary embolism", "Aortic aneurysm without dissection", "Normal CT angiogram"],
      "Contrast fills a widened ascending aorta that is split by a thin line, the intimal flap (arrowed), into a true and a false channel. Involvement of the ascending aorta makes it Stanford type A: a cardiothoracic surgical emergency.",
      "Type A (ascending aorta involved) = urgent surgery. Type B (descending only) = usually blood pressure and heart rate control first.",
      "Axial contrast CT of the chest with an arrow on the ascending aorta", "Chest"),
    X(commons("Pulmonary embolism CTPA.JPEG", WM + "4/4d/Pulmonary_embolism_CTPA.JPEG", "Aung Myat and Arif Ahsan", "CC BY 2.0", "https://creativecommons.org/licenses/by/2.0"),
      "A 58-year-old, 10 days after a knee replacement, is suddenly breathless with a fast heart rate and low oxygen levels.",
      "What does this CT pulmonary angiogram show?", "Pulmonary embolism (saddle embolus)",
      ["Aortic dissection", "Pneumonia", "Pneumothorax"],
      "On a CT pulmonary angiogram the pulmonary arteries should be bright white with contrast. Here dark filling defects (clot) straddle the split of the main pulmonary artery and extend into both branches: a saddle embolus with a heavy clot burden.",
      "Look for ‘holes’ in the white column of contrast in the pulmonary arteries. Then check whether the right ventricle is bigger than the left: that’s right heart strain.",
      "Two CT pulmonary angiogram images, coronal and axial", "Chest"),
    X(commons("Pneumothorax CT.jpg", WM + "5/57/Pneumothorax_CT.jpg", "en:User:Clinical Cases", "CC BY-SA 2.5", "https://creativecommons.org/licenses/by-sa/2.5"),
      "A 25-year-old was in a car crash. He has left-sided chest pain, and a chest drain has already been put in.",
      "What does this CT of the chest show?", "Left pneumothorax",
      ["Left pleural effusion", "Pneumomediastinum", "Normal CT chest"],
      "Black air with no lung markings sits between the chest wall and the edge of the left lung (arrowed, right of the image), even with a drain in place. The patchy lung shows bruising (contusion) too.",
      "CT picks up small pneumothoraces that a lying-down chest X-ray misses. Air rises, so in a patient lying on their back it collects at the front of the chest.",
      "Axial CT of the chest on lung windows with an arrow", "Chest"),
    X(commons("Non-contrast coronal CT of multiple bilateral renal calculi.jpg", WM + "6/62/Non-contrast_coronal_CT_of_multiple_bilateral_renal_calculi.jpg", "Kristie Guite, Louis Hinshaw and Fred Lee", "CC BY 3.0", "https://creativecommons.org/licenses/by/3.0"),
      "A 52-year-old with recurrent flank pain has blood in his urine.",
      "What does this non-contrast CT show (arrows)?", "Kidney stones on both sides",
      ["Calcified renal arteries", "Gallstones", "Normal kidneys"],
      "On this coronal (front-on) non-contrast CT, small, very bright white dots sit within both kidneys (arrowed). Almost all kidney stones are bright on non-contrast CT.",
      "Non-contrast CT KUB is the test of choice for suspected kidney stones. Contrast can hide them, because it makes the urine bright too.",
      "Coronal non-contrast CT of the abdomen with two arrows", "Abdomen"),
    X(commons("PSBOCT.png", TH + "9/95/PSBOCT.png/960px-PSBOCT.png", "James Heilman, MD", "CC BY-SA 3.0", BYSA3),
      "A 70-year-old who had bowel surgery years ago has colicky abdominal pain, a swollen tummy and vomiting, and hasn’t passed wind.",
      "What does this CT of the abdomen show?", "Small bowel obstruction",
      ["Large bowel obstruction", "Free air from a perforation", "Normal CT abdomen"],
      "Many dilated, fluid-filled loops of small bowel fill the abdomen, with air–fluid levels (arrowed). Adhesions from previous surgery are the most common cause.",
      "Small bowel sits centrally, with folds that cross its full width. Look for the transition point, where swollen bowel meets collapsed bowel: that’s where the blockage is.",
      "Axial CT of the abdomen with an arrow", "Abdomen"),
    X(commons("FreeairCT.png", TH + "a/aa/FreeairCT.png/960px-FreeairCT.png", "James Heilman, MD", "CC BY-SA 3.0", BYSA3),
      "A 64-year-old who takes ibuprofen for arthritis has sudden severe abdominal pain. His abdomen is rigid.",
      "What does this CT of the abdomen show?", "Free air in the abdomen (pneumoperitoneum)",
      ["Small bowel obstruction", "Normal gas in the bowel", "Gallstones"],
      "Black gas lies outside the bowel, under the front abdominal wall and over the liver (arrowed). Free air in the abdomen means a hole in the gut, such as a perforated ulcer, until proven otherwise.",
      "Free air rises, so look just under the front abdominal wall and around the liver. A wider (lung) window setting makes small amounts easier to see.",
      "Axial CT of the upper abdomen with an arrow", "Abdomen"),
]

FAQS = [
    ("How do you read a CT scan?",
     "Check the patient, date and whether contrast was given. Then scroll through each body system in turn rather than hunting for one thing, changing the window settings: brain or soft tissue windows for organs and blood, lung windows for air, and bone windows for fractures. Compare left with right, and always look again at the edges of the image."),
    ("What does bright mean on CT?",
     "Bright (white) areas are dense: bone, metal, contrast and fresh blood. Fluid is grey-dark, fat is darker, and air is black. Fresh blood in the head is bright for the first few days, then fades to grey over 1 to 3 weeks."),
    ("What’s the difference between an extradural and a subdural haematoma?",
     "An extradural (epidural) haematoma sits between the skull and its outer lining, is usually arterial, and looks lens-shaped because the skull sutures stop it spreading. A subdural haematoma sits under that lining, comes from torn veins, and spreads as a crescent along the brain surface."),
    ("When is contrast used for CT?",
     "Contrast is injected when blood vessels or organ enhancement matter: CT pulmonary angiograms for clots, CT aortograms for dissection, and most abdominal CTs. It is avoided when it could hide the answer, such as non-contrast CT head for bleeding or CT KUB for kidney stones."),
    ("Who is this CT quiz for?",
     "Medical, nursing, paramedic and radiography students, junior doctors brushing up for exams or night shifts, and anyone curious about what CT scans show. Every answer comes with the key finding and a practical tip."),
    ("Are these real CT scans?",
     "Yes. They’re real, anonymised CT images shared under free licences or in the public domain on Wikimedia Commons, credited under each image. The patient stories are fictional and written to match each scan."),
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
    pos = positions(n, "ct-quiz")
    items = []
    for k, q in enumerate(QS):
        i = q["img"]
        opts = shuffled(q, "ct-quiz", pos[k])
        cap = "Image: %s · %s · %s." % (esc(i["author"]), lic_html(i), esc(i["source"]))
        items.append("".join([
            '<li class="qk-q" id="ct-q%d" data-a="%d">' % (k + 1, pos[k]),
            '<p class="qk-n">Question %d of %d · %s</p>' % (k + 1, n, esc(q["region"])),
            '<p class="qk-case">%s</p>' % esc(q["case"]),
            '<h3 class="qk-p">%s</h3>' % esc(q["q"]),
            '<figure class="qk-xr"><img src="%s" alt="%s" loading="%s" decoding="async" referrerpolicy="no-referrer"><figcaption>%s</figcaption></figure>' % (
                esc(i["url"]), esc(q["alt"]), "eager" if k == 0 else "lazy", cap),
            '<ol class="qk-opts" type="A">%s</ol>' % "".join("<li>%s</li>" % esc(x) for x in opts),
            '<details class="qk-ans"><summary>Show answer</summary><p><b>Answer: %s.</b> <span class="why">%s <span class="qk-tip"><strong>Tip:</strong> %s</span> <span class="qk-src">Image source: %s by %s.</span></span></p></details>' % (
                esc(q["a"]), esc(q["why"]), esc(q["tip"]), src_link(i), esc(i["author"])),
            "</li>"]))
    quiz = '<section class="qk" id="quiz" data-id="ct" data-title="CT scan quiz" data-emoji="🧠">\n<ol class="qk-list">\n%s\n</ol>\n</section>' % "\n".join(items)

    regions = {}
    for q in QS:
        regions[q["region"]] = regions.get(q["region"], 0) + 1
    title = "CT Scan Quiz: Head, Chest and Abdominal CT"
    desc = "Free CT scan quiz: %d real CT images of brain bleeds, aortic dissection, PE, pneumothorax, stones, bowel obstruction and free air, with tips." % n
    h1 = "CT Scan Quiz: Practise Reading Real CT Scans"
    lede = ("Ten real CT scans to read: bleeds in the head, emergencies in the chest and problems in the abdomen. "
            "Read the short story, look at the scan, pick a diagnosis, and the answer explains what you should have spotted.")
    about = ('<section class="qk-about"><h2>About this quiz</h2><ul>'
             '<li><b>%d questions:</b> %d head, %d chest, %d abdomen.</li>'
             '<li><b>Emergency focus:</b> the CT findings you can’t afford to miss on a shift.</li>'
             '<li><b>Real images:</b> anonymised CT scans under free licences, credited under each image. Patient stories are fictional.</li>'
             '<li><b>Free, no sign-up:</b> your best score is saved on your device only.</li></ul></section>') % (
        n, regions.get("Head", 0), regions.get("Chest", 0), regions.get("Abdomen", 0))
    credits = '<details class="qk-credits"><summary>Image credits (contains answers)</summary><ol>%s</ol></details>' % "".join(
        "<li>%s by %s · %s · via %s.</li>" % (src_link(q["img"]), esc(q["img"]["author"]), lic_html(q["img"]), esc(q["img"]["source"])) for q in QS)
    faq = '<section class="faq"><h2>Common questions</h2>' + "".join("<details><summary>%s</summary><p>%s</p></details>" % (esc(a), esc(b)) for a, b in FAQS) + "</section>"
    body = "\n".join([
        "<h1>%s</h1>" % esc(h1),
        '<p class="lede">%s</p>' % esc(lede),
        '<p class="meta">Axial CT slices are viewed from the feet, so the patient’s right is on the left of the image.</p>',
        quiz,
        '<p class="qk-cta"><b>Want more?</b> Try the <a href="/x-ray-quiz/">X-ray quiz</a>, or <a href="/opacitis/">play a new X-ray every day</a> in Opacitis, our daily X-ray puzzle: one film, one story, six diagnoses. Past films are in the <a href="/opacitis/archive/">Opacitis archive</a>, and there are more games in <a href="/medical-games/">Medical games</a>.</p>',
        about,
        faq,
        '<h2>More medical quizzes</h2><nav id="more" data-label="Try another quiz"><ul><li><a href="/x-ray-quiz/">X-ray quiz</a></li><li><a href="/ecg-quiz/">ECG quiz</a></li><li><a href="/anatomy-quiz/">Anatomy quizzes</a></li><li><a href="/anatomy-quiz/bones/">Bones quiz</a></li><li><a href="/medical-terminology-quiz/">Medical terminology quiz</a></li><li><a href="/opacitis/">Opacitis: a daily X-ray</a></li><li><a href="/medical-games/">All medical games</a></li></ul></nav>',
        credits,
        '<p class="meta"><em>Updated %s. Real CT scans, fictional cases. General education, not personal medical advice.</em></p>' % REVIEWED,
    ])
    url = SITE + PATH
    lds = [
        {"@context": "https://schema.org", "@type": "Quiz", "name": "CT scan quiz", "url": url, "inLanguage": "en-AU",
         "about": {"@type": "Thing", "name": "CT interpretation"}, "educationalUse": "Self-assessment", "learningResourceType": "Quiz",
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
        {"@type": "ListItem", "position": 3, "name": "CT Scan Quiz", "item": url}]}
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
