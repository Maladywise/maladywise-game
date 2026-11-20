#!/usr/bin/env python3
"""Builds /nuclear-medicine-quiz/ (crawlable quizkit quiz with real nuclear medicine images).

Images: freely licensed Wikimedia Commons files (public domain, CC BY, CC BY-SA), shown from Wikimedia's
servers (not copied into the repo). Credits under each image: author, licence and source; the Commons page link
(whose file name may give the answer away) only in the answer and the credits list.

Run: python3 _scripts/quizkit/nm.py
"""
import hashlib, html, json, os, random, re, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from headkit import fix_html  # shared <head> clean-up: self-hosted fonts, deferred scripts, honest JSON-LD

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = "https://maladywise.com"
PATH = "/nuclear-medicine-quiz/"
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
    X(commons("Knochenszintigramm multiple Filiae.jpg", TH + "c/c2/Knochenszintigramm_multiple_Filiae.jpg/960px-Knochenszintigramm_multiple_Filiae.jpg", "Drahreg01", "CC BY-SA 3.0", BYSA3),
      "A 74-year-old man with a PSA of 180 has new back and rib pain.",
      "What does this whole-body bone scan show?", "Multiple bone metastases",
      ["Paget’s disease of bone", "Osteoarthritis only", "Normal bone scan"],
      "Many dark, patchy hot spots are scattered through the spine, pelvis, ribs and breastbone. Random spots in the axial skeleton in a man with a very high PSA mean prostate cancer has spread to bone.",
      "Hot spots = bone turnover, not cancer alone. Arthritis lights up joints symmetrically, and Paget’s lights up a whole bone. Scattered spots in the spine and ribs suggest metastases.",
      "Whole-body bone scan, front and back views", "Bone and cancer"),
    X(commons("Gallium PSMA PET scan.png", WM + "3/31/Gallium_PSMA_PET_scan.png", "Rauscher I, Maurer T, Fendler WP, et al.", "CC BY 4.0", "https://creativecommons.org/licenses/by/4.0"),
      "A 78-year-old man has just been diagnosed with prostate cancer (Gleason 7, PSA 34). This scan is done for staging.",
      "What does this PSMA PET/CT show (arrows)?", "Prostate cancer spread to bone",
      ["Normal kidney and liver uptake only", "Lymphoma", "Osteoporotic fractures"],
      "Spots of tracer in the left iliac bone and the thoracic spine match dense (sclerotic) areas on the CT: the prostate cancer has spread to bone. The bright kidneys, and the liver and spleen, are normal places for PSMA tracer to collect.",
      "PSMA PET finds prostate cancer spread far earlier than a CT or bone scan. It has largely replaced them for staging higher-risk disease and for a rising PSA after treatment.",
      "CT and PSMA PET images of the spine and pelvis", "Bone and cancer"),
    X(commons("Thyroid scintigraphy.jpg", TH + "0/0a/Thyroid_scintigraphy.jpg/960px-Thyroid_scintigraphy.jpg", "Petros Perros", "CC BY-SA 3.0", BYSA3),
      "A 61-year-old has a low TSH, a high T4 and a lump in the neck.",
      "These are five thyroid scans (A to E). Which diagnosis fits scan D?", "Toxic adenoma (one hot nodule)",
      ["Graves’ disease", "Thyroiditis", "Normal thyroid"],
      "In scan D one nodule takes up nearly all the tracer and the rest of the thyroid is switched off. A is normal, B is Graves’ (both lobes evenly hot), C is a toxic multinodular goitre (patchy hot and cold areas) and E is thyroiditis (almost no uptake).",
      "Hyperthyroid? A thyroid uptake scan tells the causes apart: evenly hot = Graves’, one hot nodule = toxic adenoma, patchy = multinodular goitre, cold = thyroiditis.",
      "Diagram of five thyroid scans labelled A to E", "Endocrine"),
    X(commons("Subakute Thyreoiditis vor Therapie.jpg", WM + "4/4a/Subakute_Thyreoiditis_vor_Therapie.jpg", "Drahreg01", "CC BY-SA 3.0", BYSA3),
      "A 38-year-old has a sore, tender neck, a fever and palpitations two weeks after a cold. TSH is suppressed and CRP is high.",
      "What does this thyroid scan show?", "Subacute (de Quervain’s) thyroiditis",
      ["Graves’ disease", "Toxic adenoma", "Normal thyroid"],
      "The thyroid barely shows up at all. Only background activity and the salivary glands (top) are seen. An inflamed thyroid leaks stored hormone but can’t take up tracer, so the scan is ‘cold’ even though the patient is thyrotoxic.",
      "Thyrotoxic plus a cold scan = thyroiditis, not Graves’. Treat with an anti-inflammatory and a beta blocker. Carbimazole won’t help.",
      "Colour thyroid scan of the neck", "Endocrine"),
    X(commons("Parathyroid Sestamibi SPECT-CT.jpg", WM + "a/a5/Parathyroid_Sestamibi_SPECT-CT.jpg", "Weibin Zhou, MD, PhD, Min Chen, MM", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0"),
      "A 55-year-old has kidney stones, a calcium of 2.9 mmol/L and a high PTH. Neck ultrasound didn’t find a parathyroid gland.",
      "What do these sestamibi scans and SPECT/CT show?", "Ectopic parathyroid adenoma in the mediastinum",
      ["Thymoma", "Retrosternal goitre", "Lymphoma"],
      "A spot in the upper chest takes up sestamibi early (B) and holds on to it on the delayed image (C), while the thyroid washes out. SPECT/CT (D) places it in front of the aortic arch: a parathyroid adenoma that has ended up in the chest.",
      "High calcium with a high PTH = primary hyperparathyroidism, usually one adenoma. Sestamibi finds it before surgery, including the ones hiding in the chest.",
      "CT, sestamibi images and SPECT/CT of the neck and chest", "Endocrine"),
    X(commons("Missmatch V-P Szintigrahie der Lunge bei Lungenembolie 58M - NM - 001.jpg", TH + "7/7b/Missmatch_V-P_Szintigrahie_der_Lunge_bei_Lungenembolie_58M_-_NM_-_001.jpg/960px-Missmatch_V-P_Szintigrahie_der_Lunge_bei_Lungenembolie_58M_-_NM_-_001.jpg", "Hellerhoff", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0"),
      "A 58-year-old has sudden breathlessness. He has kidney disease, so a CT pulmonary angiogram is avoided.",
      "What does this ventilation–perfusion (V/Q) scan show?", "Pulmonary embolism (V/Q mismatch)",
      ["Pneumonia", "COPD", "Normal V/Q scan"],
      "The perfusion rows show several wedge-shaped gaps where no blood reaches the lung, while the ventilation rows look full. Air gets in but blood doesn’t: a mismatch, typical of pulmonary embolism.",
      "Mismatch (perfusion gaps, normal ventilation) = PE. Matched gaps in both = lung disease such as COPD or pneumonia. A V/Q scan is a good choice in pregnancy or kidney disease.",
      "Rows of lung perfusion and ventilation scan images", "Chest"),
    X(commons("HodgkinLymphomPETCT.jpg", WM + "f/fa/HodgkinLymphomPETCT.jpg", "Hg6996", "Public domain", ""),
      "A 24-year-old has night sweats, itch and weight loss. A biopsy confirms the diagnosis and this scan is done for staging.",
      "What does this FDG PET/CT show?", "Lymphoma in a mediastinal lymph node (Hodgkin lymphoma)",
      ["Normal thymus", "Thyroid cancer", "Lung abscess"],
      "A small node in front of the great vessels in the mediastinum is very bright on PET (very high glucose use). On the MIP image the rest of the uptake is normal: brain, kidneys and bladder.",
      "FDG PET stages lymphoma and checks the response after treatment. Normal FDG lights up the brain, heart, kidneys and bladder, so don’t mistake those for disease.",
      "CT, PET, fused PET/CT and whole-body PET images", "Chest"),
    X(commons("PET-CT of a tuberculoma.png", WM + "6/69/PET-CT_of_a_tuberculoma.png", "Snoeckx A, Reyntiens P, Desbuquoit D, et al.", "CC BY 4.0", "https://creativecommons.org/licenses/by/4.0"),
      "A 54-year-old treated for small cell lung cancer has a new 22 mm nodule. It is very hot on FDG PET. The nodule is removed.",
      "Surgery found no cancer. What was this hot nodule most likely to be?", "Tuberculoma (infection)",
      ["Recurrent lung cancer", "Pulmonary embolism", "Normal lung"],
      "Infection and inflammation also burn glucose, so TB, fungal infections and sarcoid can glow on FDG PET just like cancer. This nodule turned out to be a tuberculoma.",
      "A hot PET is not proof of cancer, and a cold PET doesn’t always clear a small or slow-growing tumour. Tissue settles it.",
      "Fused PET/CT slice of the chest with a bright nodule", "Chest"),
    X(commons("Gallium 67 Scan (Diagnosis of Sarcoidosis).png", WM + "d/de/Gallium_67_Scan_%28Diagnosis_of_Sarcoidosis%29.png", "A. B. Allard, J. Buscombe, D. P. Kidd", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0"),
      "A 32-year-old has a dry cough, swollen glands in front of the ears and tender red lumps on the shins. Calcium is high.",
      "What does this gallium scan show (arrows A and B)?", "Sarcoidosis (‘panda’ and ‘lambda’ signs)",
      ["Lymphoma", "Tuberculosis", "Normal gallium scan"],
      "Arrow A: tracer in the tear and salivary glands gives the ‘panda face’. Arrow B: uptake in the hilar and mediastinal nodes makes a ‘lambda’ (λ) shape. Together they strongly suggest sarcoidosis.",
      "Gallium scans are rarely used now (FDG PET has largely taken over), but panda plus lambda is a classic exam picture of sarcoid.",
      "Gallium scan of the head and chest with arrows", "Chest"),
    X(commons("Meckel's Diverticulum by Technetium-99m Pertechnetate Scan.jpg", WM + "f/f3/Meckel%27s_Diverticulum_by_Technetium-99m_Pertechnetate_Scan.jpg", "JasonRobertYoungMD", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0"),
      "A 2-year-old is passing large amounts of painless, dark red blood from the bowel and is pale.",
      "What does this pertechnetate scan show?", "Meckel’s diverticulum",
      ["Intussusception", "Normal scan", "Bleeding stomach ulcer"],
      "Apart from the stomach and bladder, a separate spot appears in the right lower abdomen and gets brighter over time. Pertechnetate is taken up by stomach lining, and a Meckel’s diverticulum often contains some.",
      "Rule of 2s: about 2% of people, 2 feet from the ileocaecal valve, 2 inches long, often presents before age 2. Painless heavy bleeding in a toddler: think Meckel’s.",
      "Series of abdominal scan images over an hour", "Abdomen"),
]

FAQS = [
    ("What is nuclear medicine?",
     "A small amount of a radioactive tracer is injected, swallowed or breathed in, and a camera picks up where it goes. Unlike X-ray, CT or MRI, it shows how organs are working (such as bone turnover, thyroid activity or glucose use) rather than just how they look."),
    ("What does a hot spot mean on a scan?",
     "More tracer is collecting there: something is more active. It can be cancer, but also infection, inflammation, healing fractures or arthritis. A cold spot means less uptake than normal."),
    ("What is the difference between a bone scan and a PET scan?",
     "A bone scan uses a technetium tracer that sticks to bone turnover. An FDG PET scan uses radioactive glucose to find tissues using lots of energy, such as many cancers and infections. PSMA PET targets prostate cancer cells."),
    ("How much radiation is a nuclear medicine scan?",
     "Usually similar to or less than a CT scan of the same area. Most tracers clear within a day or so, and drinking fluids and emptying the bladder often helps."),
    ("Who is this nuclear medicine quiz for?",
     "Medical, nursing and radiography students, junior doctors, GPs and anyone curious about scans. Every answer comes with the key finding and a practical tip."),
    ("Are these real nuclear medicine images?",
     "Yes. They’re real, anonymised images shared under free licences on Wikimedia Commons, credited under each image. The patient stories are fictional and written to match each image."),
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


def fetch_local(i, k):
    """Self-host the image under a neutral name (img/xr-NN.jpg) so the file name can't give the answer away."""
    import urllib.request, time
    out = ROOT + PATH + "img/xr-%02d.jpg" % k
    if os.path.exists(out):
        i["path"] = None
        return
    tmp = "/tmp/qk-%s" % hashlib.md5(i["url"].encode()).hexdigest()
    if not os.path.exists(tmp):
        req = urllib.request.Request(i["url"], headers={"User-Agent": "MaladyWiseBot/1.0 (https://maladywise.com; maladywise@gmail.com)"})
        for t in range(2):
            try:
                with urllib.request.urlopen(req, timeout=60) as r:
                    data = r.read()
                break
            except Exception as e:
                if t == 1: raise
                time.sleep(5)
        open(tmp, "wb").write(data)
        time.sleep(5)
    i["path"] = tmp


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
    pos = positions(n, "nuclear-medicine-quiz")
    items = []
    for k, q in enumerate(QS):
        i = q["img"]
        try:  # self-host under a neutral name; if Wikimedia refuses (rate limit), keep hotlinking for now
            fetch_local(i, k + 1)
            name, w, h = save_img(q, k + 1)
            src = "img/" + name
        except Exception as e:
            print("  image %d: kept hotlink (%s)" % (k + 1, str(e)[:60]))
            src, w, h = i["url"], 0, 0
        opts = shuffled(q, "nuclear-medicine-quiz", pos[k])
        cap = "Image: %s · %s · %s." % (esc(i["author"]), lic_html(i), esc(i["source"]))
        items.append("".join([
            '<li class="qk-q" id="nm-q%d" data-a="%d">' % (k + 1, pos[k]),
            '<p class="qk-n">Question %d of %d · %s</p>' % (k + 1, n, esc(q["region"])),
            '<p class="qk-case">%s</p>' % esc(q["case"]),
            '<h3 class="qk-p">%s</h3>' % esc(q["q"]),
            '<figure class="qk-xr"><img src="%s"%s alt="%s" loading="%s" decoding="async" referrerpolicy="no-referrer"><figcaption>%s</figcaption></figure>' % (
                esc(src), (' width="%d" height="%d"' % (w, h)) if w else "", esc(q["alt"]), "eager" if k == 0 else "lazy", cap),
            '<ol class="qk-opts" type="A">%s</ol>' % "".join("<li>%s</li>" % esc(x) for x in opts),
            '<details class="qk-ans"><summary>Show answer</summary><p><b>Answer: %s.</b> <span class="why">%s <span class="qk-tip"><strong>Tip:</strong> %s</span> <span class="qk-src">Image source: %s by %s.</span></span></p></details>' % (
                esc(q["a"]), esc(q["why"]), esc(q["tip"]), src_link(i), esc(i["author"])),
            "</li>"]))
    quiz = '<section class="qk" id="quiz" data-id="nuclear" data-title="Nuclear medicine quiz" data-emoji="☢️">\n<ol class="qk-list">\n%s\n</ol>\n</section>' % "\n".join(items)

    regions = {}
    for q in QS:
        regions[q["region"]] = regions.get(q["region"], 0) + 1
    title = "Nuclear Medicine Quiz: Bone, PET and Thyroid Scans"
    desc = "Free nuclear medicine quiz: %d real scans: bone scan, PET, PSMA, V/Q, thyroid, sestamibi and Meckel’s, with key findings and tips." % n
    h1 = "Nuclear Medicine Quiz: Practise Reading Real Scans"
    lede = ("Ten real nuclear medicine scans to read: bone scans, PET, thyroid, lungs and a toddler’s tummy. "
            "Read the short story, look at the scan, pick a diagnosis, and the answer explains what you should have spotted.")
    about = ('<section class="qk-about"><h2>About this quiz</h2><ul>'
             '<li><b>%d questions:</b> %d chest, %d endocrine, %d bone and cancer, %d abdomen.</li>'
             '<li><b>Core patterns:</b> hot spots, cold spots and the classic scans GPs, students and juniors meet.</li>'
             '<li><b>Real images:</b> anonymised nuclear medicine scans under free licences, credited under each image. Patient stories are fictional.</li>'
             '<li><b>Free, no sign-up:</b> your best score is saved on your device only.</li></ul></section>') % (
        n, regions.get("Chest", 0), regions.get("Endocrine", 0), regions.get("Bone and cancer", 0), regions.get("Abdomen", 0))
    credits = '<details class="qk-credits"><summary>Image credits (contains answers)</summary><ol>%s</ol></details>' % "".join(
        "<li>%s by %s · %s · via %s.</li>" % (src_link(q["img"]), esc(q["img"]["author"]), lic_html(q["img"]), esc(q["img"]["source"])) for q in QS)
    faq = '<section class="faq"><h2>Common questions</h2>' + "".join("<details><summary>%s</summary><p>%s</p></details>" % (esc(a), esc(b)) for a, b in FAQS) + "</section>"
    body = "\n".join([
        "<h1>%s</h1>" % esc(h1),
        '<p class="lede">%s</p>' % esc(lede),
        '<p class="meta">On most nuclear medicine images, dark (or bright colour) means more tracer: a ‘hot’ area.</p>',
        quiz,
        '<p class="qk-cta"><b>Want more?</b> Try the <a href="/ct-quiz/">CT scan quiz</a>, <a href="/mri-quiz/">MRI quiz</a>, <a href="/ultrasound-quiz/">ultrasound quiz</a> and <a href="/x-ray-quiz/">X-ray quiz</a>, or <a href="/opacitis/">play a new X-ray every day</a> in Opacitis, our daily X-ray puzzle: one film, one story, six diagnoses. Past films are in the <a href="/opacitis/archive/">Opacitis archive</a>, and there are more games in <a href="/medical-games/">Medical games</a>.</p>',
        about,
        faq,
        '<h2>More medical quizzes</h2><nav id="more" data-label="Try another quiz"><ul><li><a href="/ct-quiz/">CT scan quiz</a></li><li><a href="/mri-quiz/">MRI quiz</a></li><li><a href="/ultrasound-quiz/">Ultrasound quiz</a></li><li><a href="/x-ray-quiz/">X-ray quiz</a></li><li><a href="/ecg-quiz/">ECG quiz</a></li><li><a href="/anatomy-quiz/">Anatomy quizzes</a></li><li><a href="/anatomy-quiz/bones/">Bones quiz</a></li><li><a href="/medical-terminology-quiz/">Medical terminology quiz</a></li><li><a href="/opacitis/">Opacitis: a daily X-ray</a></li><li><a href="/medical-games/">All medical games</a></li></ul></nav>',
        credits,
        '<p class="meta"><em>Updated %s. Real nuclear medicine images, fictional cases. General education, not personal medical advice.</em></p>' % REVIEWED,
    ])
    url = SITE + PATH
    lds = [
        {"@context": "https://schema.org", "@type": "Quiz", "name": "Nuclear medicine quiz", "url": url, "inLanguage": "en-AU",
         "about": {"@type": "Thing", "name": "Nuclear medicine interpretation"}, "educationalUse": "Self-assessment", "learningResourceType": "Quiz",
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
        {"@type": "ListItem", "position": 3, "name": "Nuclear Medicine Quiz", "item": url}]}
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
