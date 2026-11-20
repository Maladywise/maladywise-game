#!/usr/bin/env python3
"""Builds /ultrasound-quiz/ (crawlable quizkit quiz with real ultrasound images).

Images: freely licensed Wikimedia Commons files (public domain, CC BY, CC BY-SA), shown from Wikimedia's
servers (not copied into the repo). Credits under each image: author, licence and source; the Commons page link
(whose file name may give the answer away) only in the answer and the credits list.

Run: python3 _scripts/quizkit/us.py
"""
import hashlib, html, json, os, random, re, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from headkit import fix_html  # shared <head> clean-up: self-hosted fonts, deferred scripts, honest JSON-LD

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = "https://maladywise.com"
PATH = "/ultrasound-quiz/"
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
    X(commons("Gallstones.PNG", WM + "a/af/Gallstones.PNG", "James Heilman, MD", "CC BY-SA 3.0", BYSA3),
      "A 44-year-old has pain under the right ribs that comes on an hour after fatty meals and lasts a few hours.",
      "What does this ultrasound of the gallbladder show (arrow)?", "Gallstone in the neck of the gallbladder",
      ["Gallbladder polyp", "Gas in the bowel", "Normal gallbladder"],
      "A bright (echogenic) curved object (arrowed) sits in the neck of the gallbladder and casts a dark acoustic shadow behind it. A stone stuck in the neck can block the gallbladder and lead to cholecystitis.",
      "Stones are bright, cast a shadow and usually move when the patient rolls over. Polyps don’t shadow and don’t move.",
      "Ultrasound of the gallbladder with an arrow", "Abdomen"),
    X(commons("Pacutecholecystitits.png", WM + "1/13/Pacutecholecystitits.png", "James Heilman, MD", "CC BY-SA 3.0", BYSA3),
      "A 52-year-old has a day of constant right upper abdominal pain, fever, and pain when the probe presses over the gallbladder.",
      "What does this ultrasound show (arrows)?", "Acute cholecystitis",
      ["Biliary colic with a normal gallbladder", "Liver abscess", "Gallbladder cancer"],
      "The gallbladder wall is thickened (one arrow) and there are stones inside it (the other arrow). Wall thickening over 3 mm, stones and tenderness under the probe (a sonographic Murphy’s sign) point to acute cholecystitis.",
      "Biliary colic comes and goes within hours. Constant pain, fever and a tender gallbladder suggest cholecystitis: admit for antibiotics and early surgery.",
      "Ultrasound of the gallbladder with two arrows", "Abdomen"),
    X(commons("Ultrasonography of hydronephrosis with dilated anechoic pelvis and calyces, along with cortical atrophy.jpg", TH + "5/52/Ultrasonography_of_hydronephrosis_with_dilated_anechoic_pelvis_and_calyces%2C_along_with_cortical_atrophy.jpg/960px-Ultrasonography_of_hydronephrosis_with_dilated_anechoic_pelvis_and_calyces%2C_along_with_cortical_atrophy.jpg", "Kristoffer Lindskov Hansen, Michael Bachmann Nielsen and Caroline Ewertsen", "CC BY 4.0", "https://creativecommons.org/licenses/by/4.0"),
      "A 79-year-old man has trouble passing urine and a rising creatinine on his blood tests.",
      "What does this kidney ultrasound show?", "Hydronephrosis (a swollen, obstructed kidney)",
      ["Simple kidney cysts", "Kidney stone without obstruction", "Normal kidney"],
      "The middle of the kidney is full of dark, fluid-filled spaces that join up: the renal pelvis and calyces are swollen with urine. The kidney tissue around them (the cortex) is thin.",
      "Joined-up dark spaces in the middle of the kidney = hydronephrosis. Separate round dark spaces = cysts. In an older man, check the bladder too: a blocked prostate can back up both kidneys.",
      "Ultrasound of a kidney in long axis with a measurement", "Abdomen"),
    X(commons("Ultrasonography of abdominal aortic aneurysm in axial plane.jpg", WM + "d/d6/Ultrasonography_of_abdominal_aortic_aneurysm_in_axial_plane.jpg", "Mikael Häggström, M.D.", "CC0", "http://creativecommons.org/publicdomain/zero/1.0/deed.en"),
      "A 78-year-old former smoker has a pulsatile mass in the middle of her abdomen found at a routine check.",
      "What does this abdominal ultrasound show?", "Abdominal aortic aneurysm",
      ["Simple liver cyst", "Horseshoe kidney", "Normal abdominal aorta"],
      "A round, dark vessel lies in front of the spine in the middle of the abdomen, much wider than a normal aorta. An aorta over 3 cm wide is an aneurysm.",
      "Screen men over 65 who have ever smoked. Refer urgently at 5.5 cm or more (or growing fast). A known aneurysm with back or abdominal pain and low blood pressure is a rupture until proven otherwise.",
      "Axial (cross-section) ultrasound of the abdomen", "Vascular"),
    X(commons("Ultrasonography of deep vein thrombosis of the femoral vein -annotated.jpg", WM + "4/4f/Ultrasonography_of_deep_vein_thrombosis_of_the_femoral_vein_-annotated.jpg", "Mikael Häggström, M.D.", "CC0", "http://creativecommons.org/publicdomain/zero/1.0/deed.en"),
      "A 65-year-old has a swollen, aching right leg after a long-haul flight.",
      "What does this Doppler ultrasound of the thigh show?", "Deep vein thrombosis in the femoral (subsartorial) vein",
      ["Normal leg veins", "Superficial thrombophlebitis", "Baker’s cyst"],
      "Colour shows blood flowing in the femoral artery and the deep femoral vein, but the labelled subsartorial (femoral) vein has no colour at all: it is blocked with clot.",
      "A vein full of clot has no colour flow and won’t squash flat when you press with the probe. Normal veins compress completely.",
      "Colour Doppler ultrasound of the thigh vessels with labels", "Vascular"),
    X(commons("Ectopicleftmass.PNG", WM + "6/6f/Ectopicleftmass.PNG", "James Heilman, MD", "CC BY-SA 3.0", BYSA3),
      "A 29-year-old with a positive pregnancy test has left lower abdominal pain and spotting. Her period is 6 weeks late.",
      "What does this pelvic ultrasound show?", "Ectopic pregnancy",
      ["Early pregnancy in the uterus", "Ovarian cyst", "Miscarriage in progress"],
      "A small gestational sac sits next to the left ovary, outside the uterus. Any pregnancy outside the uterine cavity is ectopic, most often in the fallopian tube.",
      "Positive pregnancy test, pain and no pregnancy seen in the uterus = ectopic until proven otherwise. Shoulder-tip pain or fainting suggests rupture: an emergency.",
      "Transvaginal ultrasound of the left adnexa", "Pelvis"),
    X(commons("Intussusception on ultrasound.jpg", WM + "d/d9/Intussusception_on_ultrasound.jpg", "Frank Gaillard", "CC BY-SA 3.0", BYSA3),
      "A 3-year-old has bouts of screaming and pulling up his legs every 15 minutes, with vomiting and a red-jelly stool.",
      "What does this abdominal ultrasound show?", "Intussusception",
      ["Appendicitis", "Pyloric stenosis", "Normal bowel"],
      "A round ‘target’ (or ‘doughnut’) of rings: bowel telescoped inside bowel, usually where the small bowel meets the colon.",
      "The typical age is 6 months to 3 years. Ultrasound is the first test, and an air or contrast enema often fixes it without surgery.",
      "Ultrasound of the abdomen in a child", "Paediatric"),
    X(commons("PyloricStenosisUS.jpg", WM + "7/72/PyloricStenosisUS.jpg", "Dr Laughlin Dawes", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0"),
      "A 6-week-old boy has projectile vomiting after every feed and is hungry straight afterwards.",
      "What does this ultrasound show?", "Pyloric stenosis",
      ["Intussusception", "Malrotation with volvulus", "Normal pylorus"],
      "The muscle wall of the pylorus (the outlet of the stomach) is thick and long, and food can’t get past even after a feed.",
      "Usual measurements: pyloric muscle 3 mm or thicker, channel 15 to 17 mm or longer. Check for a low chloride, low potassium metabolic alkalosis and correct it before surgery.",
      "Ultrasound of the upper abdomen in an infant after a feed", "Paediatric"),
    X(commons("Ultrasound of upper right liver lobe showing fatty liver.jpg", TH + "e/ea/Ultrasound_of_upper_right_liver_lobe_showing_fatty_liver.jpg/960px-Ultrasound_of_upper_right_liver_lobe_showing_fatty_liver.jpg", "Cerevisae", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0"),
      "A 50-year-old with type 2 diabetes and a large waist has mildly raised ALT on routine blood tests.",
      "What does this liver ultrasound show?", "Fatty liver (steatosis)",
      ["Liver cirrhosis", "Liver metastases", "Normal liver"],
      "The liver is bright (more echogenic than normal), and the walls of the portal veins fade into the background. The deeper parts of the liver are hard to see.",
      "Fatty liver is very common with obesity and diabetes. Work out the fibrosis risk (for example a FIB-4 score) to decide who needs a FibroScan or specialist referral.",
      "Ultrasound of the right lobe of the liver with labels", "Abdomen"),
    X(commons("Morison003.jpg", TH + "9/97/Morison003.jpg/960px-Morison003.jpg", "Drahreg01", "CC BY-SA 3.0", "http://creativecommons.org/licenses/by-sa/3.0/"),
      "A 31-year-old cyclist hit a car door at speed. His pulse is 120 and his blood pressure is falling. A bedside FAST scan is done.",
      "What does this view between the liver and right kidney show?", "Free fluid in Morison’s pouch (blood, in this setting)",
      ["Normal Morison’s pouch", "Gallstones", "Kidney cyst"],
      "A dark (anechoic) stripe of fluid separates the liver from the right kidney. In trauma, free fluid on a FAST scan means bleeding until proven otherwise.",
      "Morison’s pouch is the lowest space in the upper abdomen when lying flat, so it’s the first place to look. Unstable plus positive FAST = straight to surgery.",
      "Ultrasound of the right upper abdomen showing liver and kidney", "Abdomen"),
]

FAQS = [
    ("How does ultrasound work?",
     "A probe sends high-frequency sound waves into the body and listens for echoes. Solid tissue reflects some sound (grey), fluid lets it straight through (black), and stones, bone and gas reflect almost all of it (bright, often with a shadow behind)."),
    ("What does black mean on an ultrasound?",
     "Black (anechoic) means fluid: urine in the bladder, bile in the gallbladder, blood in vessels, or free fluid in the abdomen. Bright (echogenic) means a strong reflector, such as a stone, fat or gas."),
    ("What is a FAST scan?",
     "A Focused Assessment with Sonography in Trauma: a quick bedside ultrasound looking for free fluid (usually blood) around the liver, spleen, pelvis and heart. It takes a few minutes and can be repeated."),
    ("When is ultrasound the best first test?",
     "For gallstones, kidney obstruction, early pregnancy problems, DVT, many children’s problems (such as intussusception and pyloric stenosis) and checking the aorta. It uses no radiation, is cheap and can be done at the bedside."),
    ("Who is this ultrasound quiz for?",
     "Medical, nursing, midwifery, paramedic and sonography students, junior doctors and GPs learning point-of-care ultrasound, and anyone curious about what scans show. Every answer comes with the key finding and a practical tip."),
    ("Are these real ultrasound images?",
     "Yes. They’re real, anonymised ultrasound images shared under free licences on Wikimedia Commons, credited under each image. The patient stories are fictional and written to match each image."),
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
    pos = positions(n, "ultrasound-quiz")
    items = []
    for k, q in enumerate(QS):
        i = q["img"]
        opts = shuffled(q, "ultrasound-quiz", pos[k])
        cap = "Image: %s · %s · %s." % (esc(i["author"]), lic_html(i), esc(i["source"]))
        items.append("".join([
            '<li class="qk-q" id="us-q%d" data-a="%d">' % (k + 1, pos[k]),
            '<p class="qk-n">Question %d of %d · %s</p>' % (k + 1, n, esc(q["region"])),
            '<p class="qk-case">%s</p>' % esc(q["case"]),
            '<h3 class="qk-p">%s</h3>' % esc(q["q"]),
            '<figure class="qk-xr"><img src="%s" alt="%s" loading="%s" decoding="async" referrerpolicy="no-referrer"><figcaption>%s</figcaption></figure>' % (
                esc(i["url"]), esc(q["alt"]), "eager" if k == 0 else "lazy", cap),
            '<ol class="qk-opts" type="A">%s</ol>' % "".join("<li>%s</li>" % esc(x) for x in opts),
            '<details class="qk-ans"><summary>Show answer</summary><p><b>Answer: %s.</b> <span class="why">%s <span class="qk-tip"><strong>Tip:</strong> %s</span> <span class="qk-src">Image source: %s by %s.</span></span></p></details>' % (
                esc(q["a"]), esc(q["why"]), esc(q["tip"]), src_link(i), esc(i["author"])),
            "</li>"]))
    quiz = '<section class="qk" id="quiz" data-id="ultrasound" data-title="Ultrasound quiz" data-emoji="🔊">\n<ol class="qk-list">\n%s\n</ol>\n</section>' % "\n".join(items)

    regions = {}
    for q in QS:
        regions[q["region"]] = regions.get(q["region"], 0) + 1
    title = "Ultrasound Quiz: Real Ultrasound Images"
    desc = "Free ultrasound quiz: %d real scans: gallstones, AAA, DVT, ectopic, intussusception, pyloric stenosis and FAST, with key findings and tips." % n
    h1 = "Ultrasound Quiz: Practise Reading Real Scans"
    lede = ("Ten real ultrasound images to read: the gallbladder, kidneys, aorta, leg veins, early pregnancy, children’s tummies and trauma. "
            "Read the short story, look at the scan, pick a diagnosis, and the answer explains what you should have spotted.")
    about = ('<section class="qk-about"><h2>About this quiz</h2><ul>'
             '<li><b>%d questions:</b> %d abdomen, %d vascular, %d pelvis, %d paediatric.</li>'
             '<li><b>Bedside focus:</b> the findings that change what happens next, including point-of-care scans.</li>'
             '<li><b>Real images:</b> anonymised ultrasound images under free licences, credited under each image. Patient stories are fictional.</li>'
             '<li><b>Free, no sign-up:</b> your best score is saved on your device only.</li></ul></section>') % (
        n, regions.get("Abdomen", 0), regions.get("Vascular", 0), regions.get("Pelvis", 0), regions.get("Paediatric", 0))
    credits = '<details class="qk-credits"><summary>Image credits (contains answers)</summary><ol>%s</ol></details>' % "".join(
        "<li>%s by %s · %s · via %s.</li>" % (src_link(q["img"]), esc(q["img"]["author"]), lic_html(q["img"]), esc(q["img"]["source"])) for q in QS)
    faq = '<section class="faq"><h2>Common questions</h2>' + "".join("<details><summary>%s</summary><p>%s</p></details>" % (esc(a), esc(b)) for a, b in FAQS) + "</section>"
    body = "\n".join([
        "<h1>%s</h1>" % esc(h1),
        '<p class="lede">%s</p>' % esc(lede),
        '<p class="meta">Ultrasound images show a slice under the probe: the top of the image is closest to the skin.</p>',
        quiz,
        '<p class="qk-cta"><b>Want more?</b> Try the <a href="/ct-quiz/">CT scan quiz</a>, <a href="/mri-quiz/">MRI quiz</a> and <a href="/x-ray-quiz/">X-ray quiz</a>, or <a href="/opacitis/">play a new X-ray every day</a> in Opacitis, our daily X-ray puzzle: one film, one story, six diagnoses. Past films are in the <a href="/opacitis/archive/">Opacitis archive</a>, and there are more games in <a href="/medical-games/">Medical games</a>.</p>',
        about,
        faq,
        '<h2>More medical quizzes</h2><nav id="more" data-label="Try another quiz"><ul><li><a href="/ct-quiz/">CT scan quiz</a></li><li><a href="/mri-quiz/">MRI quiz</a></li><li><a href="/nuclear-medicine-quiz/">Nuclear medicine quiz</a></li><li><a href="/x-ray-quiz/">X-ray quiz</a></li><li><a href="/ecg-quiz/">ECG quiz</a></li><li><a href="/anatomy-quiz/">Anatomy quizzes</a></li><li><a href="/anatomy-quiz/bones/">Bones quiz</a></li><li><a href="/medical-terminology-quiz/">Medical terminology quiz</a></li><li><a href="/opacitis/">Opacitis: a daily X-ray</a></li><li><a href="/medical-games/">All medical games</a></li></ul></nav>',
        credits,
        '<p class="meta"><em>Updated %s. Real ultrasound images, fictional cases. General education, not personal medical advice.</em></p>' % REVIEWED,
    ])
    url = SITE + PATH
    lds = [
        {"@context": "https://schema.org", "@type": "Quiz", "name": "Ultrasound quiz", "url": url, "inLanguage": "en-AU",
         "about": {"@type": "Thing", "name": "Ultrasound interpretation"}, "educationalUse": "Self-assessment", "learningResourceType": "Quiz",
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
        {"@type": "ListItem", "position": 3, "name": "Ultrasound Quiz", "item": url}]}
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
