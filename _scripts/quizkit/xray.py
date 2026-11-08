#!/usr/bin/env python3
"""Builds /x-ray-quiz/ (crawlable quizkit quiz with real X-ray images).

Images: past Opacitis puzzles only (never future dates, so daily puzzles aren't spoiled), plus a few
freely licensed Wikimedia Commons files. Each is copied to /x-ray-quiz/img/ under a neutral name
(xr-NN.jpg, max 1000 px, JPEG q85). Credits follow the Opacitis style: author, licence and source
under the image; the source page link (whose file name may give the answer away) only in the answer.

Run: python3 _scripts/quizkit/xray.py   (needs Pillow; Commons originals in --commons DIR on first build)
"""
import hashlib, html, json, os, random, re, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from headkit import fix_html  # shared <head> clean-up: self-hosted fonts, deferred scripts, honest JSON-LD

ROOT = "/home/claude/maladywise-game"
SITE = "https://maladywise.com"
PATH = "/x-ray-quiz/"
ISO = "2026-11-08"
REVIEWED = "8 November 2026"
QKV = "2"  # quizkit.css with .qk-xr image styles
CUTOFF = "2026-11-08"  # Opacitis images used must be on or before this date

COMMONS_DIR = sys.argv[sys.argv.index("--commons") + 1] if "--commons" in sys.argv else None


def esc(s):
    return html.escape(s, quote=True)


# ---------- image sources ----------
OPA = {}
for f in ("2026-10", "2026-11"):
    for p in json.load(open("%s/opacitis/puzzles/%s.json" % (ROOT, f), encoding="utf-8")):
        OPA[p["date"]] = p


def opa(date):
    assert date <= CUTOFF, ("future Opacitis puzzle", date)
    i = OPA[date]["img"]
    return dict(kind="opa", path="%s/opacitis/%s" % (ROOT, i["url"]), page=i["page"], file=i.get("file"),
                author=i["author"], licence=i["licence"], licence_url=i.get("licence_url", ""), source=i["source"])


def commons(local, file, author, licence, licence_url, crop=None):
    return dict(kind="commons", path=(COMMONS_DIR + "/" + local) if COMMONS_DIR else None, crop=crop,
                page="https://commons.wikimedia.org/wiki/File:" + file.replace(" ", "_").replace("(", "%28").replace(")", "%29"),
                file=file, author=author, licence=licence, licence_url=licence_url, source="Wikimedia Commons")


BYSA3 = "https://creativecommons.org/licenses/by-sa/3.0"


def X(img, case, q, a, w, why, tip, alt, region):
    assert len(w) == 3 and a not in w
    return dict(img=img, case=case, q=q, a=a, w=w, why=why, tip=tip, alt=alt, region=region)


QS = [
    X(opa("2026-10-29"), "A 23-year-old has a swollen hand and a sunken knuckle after punching a wall.",
      "What does this hand X-ray show?", "Fifth metacarpal neck fracture (boxer’s fracture)",
      ["Scaphoid fracture", "Bennett fracture of the thumb", "Normal hand X-ray"],
      "The neck of the fifth (little-finger) metacarpal is broken just behind the knuckle, and the metacarpal head is tipped towards the palm.",
      "Punch injuries hit the fourth and fifth metacarpals, so start on the little-finger side.",
      "Hand X-ray, palm-down view", "Musculoskeletal"),
    X(opa("2026-10-26"), "A tall, thin 24-year-old has sudden left-sided chest pain and breathlessness at rest.",
      "What is the main finding on this chest X-ray?", "Left pneumothorax",
      ["Left pleural effusion", "Left lower lobe pneumonia", "Normal chest X-ray"],
      "The left side is darker, with no lung markings beyond a thin white line: the edge of the collapsed lung (the visceral pleural line).",
      "Trace the lung markings out to the chest wall on both sides. Where they stop short, look for a pleural line.",
      "Frontal chest X-ray of a young adult", "Chest"),
    X(opa("2026-11-03"), "A 72-year-old woman slipped on wet tiles and landed on her outstretched hand. Her wrist looks like a dinner fork.",
      "What does this wrist X-ray show?", "Colles fracture",
      ["Smith fracture", "Scaphoid fracture", "Barton fracture"],
      "The distal radius is broken just above the wrist, and on the side view the broken end is tilted backwards (dorsally). That gives the ‘dinner fork’ look.",
      "Always look at the lateral view: tilted back is Colles, tilted towards the palm is Smith.",
      "Wrist X-ray, front and side views", "Musculoskeletal"),
    X(opa("2026-11-02"), "A 41-year-old with weeks of cough, night sweats and weight loss is now breathless. The left base is dull to percussion.",
      "What is the main finding on this chest X-ray?", "Left pleural effusion",
      ["Left pneumothorax", "Left lower lobe collapse", "Raised left hemidiaphragm"],
      "A dense white opacity fills the left lower chest, hides the left hemidiaphragm and has a curved upper edge rising towards the side wall (the meniscus sign).",
      "Fluid lies at the bottom on an upright film, so the first sign is a blunted costophrenic angle.",
      "Frontal chest X-ray of an adult", "Chest"),
    X(opa("2026-10-27"), "A 35-year-old fell while skiing. The shoulder looks squared off and the arm is held away from the body.",
      "What does this shoulder X-ray show?", "Anterior shoulder dislocation",
      ["Posterior shoulder dislocation", "Fractured clavicle", "Normal shoulder"],
      "The humeral head sits below and in front of the glenoid (the socket) instead of inside it.",
      "Anterior dislocations are by far the most common. Check the numbness over the deltoid (axillary nerve) before and after reduction.",
      "Frontal shoulder X-ray", "Musculoskeletal"),
    X(commons("nof.png", "Neck of Femur fracture Right side in a 80 years old female patient.png", "Drvaram", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0"),
      "An 84-year-old woman fell at home and can’t stand. Her right leg is shortened and turned outwards. The R marker shows the patient’s right.",
      "What does this pelvic X-ray show?", "Fractured neck of the right femur",
      ["Fractured neck of the left femur", "Fractured right pubic ramus", "Normal pelvis"],
      "On the patient’s right (the left of the image) the femoral neck is broken and the shaft has ridden upwards, so the smooth curve of Shenton’s line is broken. The left hip is intact.",
      "Trace Shenton’s line along the femoral neck and the top of the obturator foramen on both sides. If the film looks normal but she still can’t bear weight, ask for CT or MRI.",
      "Frontal X-ray of an older woman’s pelvis and both hips", "Musculoskeletal"),
    X(commons("knee.jpg", "Osteoarthritis left knee.jpg", "James Heilman, MD", "CC BY-SA 3.0", BYSA3),
      "A 68-year-old woman has years of knee pain that is worse after walking and eases with rest. Morning stiffness lasts only a few minutes.",
      "What does this knee X-ray show?", "Osteoarthritis",
      ["Rheumatoid arthritis", "Tibial plateau fracture", "Normal knee"],
      "The joint space is narrowed more on one side (arrow) than the other, with bony spurs (osteophytes) at the joint margins and denser bone beneath the cartilage.",
      "Remember LOSS: Loss of joint space, Osteophytes, Subchondral sclerosis, Subchondral cysts. Uneven narrowing suggests osteoarthritis; even narrowing with eroded, thin bone suggests rheumatoid.",
      "Frontal knee X-ray with an arrow", "Musculoskeletal"),
    X(opa("2026-11-05"), "A 7-year-old fell off the monkey bars onto an outstretched hand and won’t move the elbow.",
      "What does this elbow X-ray show?", "Supracondylar fracture of the humerus",
      ["Elbow dislocation", "Pulled elbow", "Olecranon fracture"],
      "There is a break across the lower humerus just above the elbow joint, with the lower fragment shifted. This is the most common elbow fracture in children.",
      "On a child’s lateral elbow film, look for a lifted fat pad and check that the anterior humeral line still passes through the capitellum.",
      "Side view of a child’s elbow", "Paediatric"),
    X(commons("sbo.jpg", "Upright X-ray demonstrating small bowel obstruction.jpg", "James Heilman, MD", "CC BY-SA 3.0", BYSA3, crop=(0.07, 0.0, 0.94, 1.0)),
      "A 66-year-old who had bowel surgery years ago has colicky pain, vomiting and a swollen abdomen. Upright abdominal X-ray:",
      "What is the most likely diagnosis?", "Small bowel obstruction",
      ["Sigmoid volvulus", "Pneumoperitoneum", "Normal bowel gas pattern"],
      "Many dilated, centrally placed loops of bowel show stacked air–fluid levels. Adhesions from past surgery are the most common cause.",
      "The 3-6-9 rule: small bowel over 3 cm, colon over 6 cm and caecum over 9 cm is too wide.",
      "Upright abdominal X-ray of an adult", "Abdomen"),
    X(opa("2026-11-08"), "A 12-year-old had a sore throat three weeks ago. Now there are puffy eyes, cola-coloured urine, high blood pressure and breathlessness.",
      "What is the key finding on this chest X-ray?", "Enlarged heart shadow",
      ["Pneumothorax", "Lobar consolidation", "Normal chest X-ray"],
      "The heart shadow is wide, taking up well over half the width of the chest, and the lung vessels look congested. Here fluid overload from post-streptococcal glomerulonephritis is the cause.",
      "Measure the cardiothoracic ratio on a PA film: heart width over chest width above 0.5 is enlarged. AP films and a big thymus in small children make the heart look bigger.",
      "Frontal chest X-ray of a child", "Paediatric"),
    X(commons("trinket.jpg", "X-ray of Trinket Swallowed by a Child (FDA010) (6946959167).jpg", "The U.S. Food and Drug Administration", "Public domain", "", crop=(0.525, 0.52, 0.93, 0.99)),
      "A 1930s print from the pioneering foreign-body surgeon Chevalier Jackson: a toddler has swallowed a metal toy from a sweet. On this old print the tones are reversed, so metal looks black.",
      "Where do swallowed coins and flat objects most often get stuck in young children?", "Upper oesophagus, at the level of the thoracic inlet",
      ["Stomach", "Lower oesophagus, just above the diaphragm", "Right main bronchus"],
      "The narrowest point of a child’s oesophagus is at the top, at the cricopharyngeus near the thoracic inlet, and that is where most swallowed coins lodge. A flat object in the oesophagus is usually seen face-on on a frontal film.",
      "A child who swallowed a button battery needs an X-ray straight away: it can burn through the oesophagus within hours.",
      "Historic frontal chest X-ray print of a child with a swallowed metal toy", "Paediatric"),
    X(commons("pp.jpg", "Pneumoperitoneum.jpg", "Hellerhoff", "CC BY-SA 3.0", BYSA3),
      "A 61-year-old who takes anti-inflammatories for back pain has sudden, severe upper abdominal pain. The abdomen is rigid. Erect chest X-ray:",
      "What does this X-ray show?", "Free gas under the diaphragm (pneumoperitoneum)",
      ["Right pleural effusion", "Bowel between the liver and diaphragm (Chilaiditi sign)", "Normal chest X-ray"],
      "A thin dark crescent of gas separates the right hemidiaphragm (green arrows) from the top of the liver (red arrows). The blue arrows show normal gas inside the bowel on the left. Here a perforated peptic ulcer is the likely cause.",
      "Free gas rises, so the patient needs to sit upright for 10 minutes or so first. A crescent with no bowel folds in it is free gas; folds crossing it suggest Chilaiditi.",
      "Erect frontal chest X-ray with coloured arrows", "Abdomen"),
    X(opa("2026-10-30"), "An 80-year-old nursing-home resident with long-standing constipation has a hugely swollen, tight abdomen and hasn’t passed wind for two days.",
      "What is the most likely diagnosis?", "Sigmoid volvulus",
      ["Small bowel obstruction", "Caecal volvulus", "Faecal loading"],
      "One enormous, inverted-U loop of large bowel rises out of the pelvis towards the upper abdomen: the ‘coffee bean’ sign of a twisted sigmoid colon.",
      "Sigmoid volvulus points from the pelvis up towards the right upper quadrant; caecal volvulus starts on the right and usually points up to the left.",
      "Frontal abdominal X-ray", "Abdomen"),
    X(opa("2026-10-28"), "An 82-year-old woman on long-term steroids has had fevers, chills and weight loss for two weeks.",
      "What is the most likely diagnosis?", "Miliary tuberculosis",
      ["Pulmonary oedema", "Lobar pneumonia", "Pneumothorax"],
      "Countless tiny nodules, each only 1 to 3 mm, are spread evenly through both lungs, like millet seeds. That pattern means spread through the bloodstream.",
      "Tiny, even, everywhere: think miliary TB in anyone immunosuppressed, and look closely, because early films can look almost normal.",
      "Frontal chest X-ray of an older adult", "Chest"),
    X(opa("2026-10-31"), "A 26-year-old has wrist pain after a fall and is tender in the anatomical snuffbox. The arrow marks a spot worth a close look.",
      "What does this wrist X-ray show?", "Scaphoid fracture",
      ["Colles fracture", "Lunate dislocation", "Normal wrist"],
      "A faint lucent (dark) line crosses the waist of the scaphoid. These fractures are easy to miss and can be invisible on the first film.",
      "Snuffbox tenderness with a normal X-ray still needs a splint and follow-up imaging: the scaphoid’s blood supply enters from the far end, so missed fractures risk avascular necrosis.",
      "Close-up of the wrist bones with an arrow", "Musculoskeletal"),
    X(opa("2026-11-06"), "A 29-year-old woman with known ulcerative colitis has bloody diarrhoea, fever, a racing pulse and a tender, swollen abdomen.",
      "What is the most likely diagnosis?", "Toxic megacolon",
      ["Sigmoid volvulus", "Small bowel obstruction", "Paralytic ileus"],
      "The colon is markedly dilated, with the transverse colon well over 6 cm and the normal haustral folds lost, in someone who is systemically unwell with colitis.",
      "It’s a clinical plus X-ray diagnosis: a dilated colon alone isn’t enough without fever, tachycardia or other signs of toxicity.",
      "Frontal abdominal X-ray of an adult", "Abdomen"),
    X(opa("2026-11-01"), "A 38-year-old man has years of morning back stiffness that eases with exercise. He had a red, painful eye last year.",
      "What is the most likely diagnosis?", "Ankylosing spondylitis",
      ["Diffuse idiopathic skeletal hyperostosis (DISH)", "Lumbar spondylosis", "Multiple myeloma"],
      "Thin, smooth bony bridges (syndesmophytes) join the vertebrae into one continuous column, the ‘bamboo spine’ of late ankylosing spondylitis.",
      "Look at the sacroiliac joints first: sacroiliitis comes early, the bamboo spine late. DISH has chunky, flowing bone on the right side of the spine and spares the SI joints.",
      "Frontal X-ray of the lumbar spine", "Musculoskeletal"),
    X(opa("2026-11-07"), "A 45-year-old with a cough for three months, night sweats and weight loss.",
      "What is the most likely diagnosis?", "Cavitating pulmonary tuberculosis",
      ["Lung abscess", "Pulmonary oedema", "Sarcoidosis"],
      "Patchy shadowing in both upper zones with a thick-walled cavity at the right apex. Reactivated TB favours the apical and posterior segments of the upper lobes.",
      "Upper-zone shadowing plus a cavity in someone with weight loss and night sweats is TB until proven otherwise: isolate and send sputum.",
      "Frontal chest X-ray of an adult", "Chest"),
]

FAQS = [
    ("How do you read a chest X-ray?",
     "Check the patient’s name, date and the film quality first (rotation, inspiration, projection and exposure). Then use ABCDE: Airway (trachea central?), Breathing (lungs and pleura, both sides compared), Cardiac (heart size and borders), Diaphragm (outline, free gas underneath) and Everything else (bones, soft tissues, tubes and lines). Finish by looking again at the review areas: apices, behind the heart, below the diaphragm and the hila."),
    ("What does white mean on an X-ray?",
     "White means the X-rays were blocked. Dense things absorb more: metal is brightest, then bone, then soft tissue and fluid (grey), then fat (darker grey). Air lets almost everything through, so it’s black. A white patch in the lung usually means fluid, pus, collapse or a mass is filling space that should hold air."),
    ("What are the five densities on an X-ray?",
     "From black to white: air, fat, soft tissue (which includes fluid and blood), bone and metal. Edges show up only where two different densities meet, which is why pneumonia next to the heart hides the heart border (the silhouette sign)."),
    ("How do you look at an abdominal X-ray?",
     "Look at the bowel gas pattern (small bowel is central with folds across its full width; colon is peripheral with haustra), measure any dilated loops (the 3-6-9 rule), then look for gas where it shouldn’t be (free air, gas in the bowel wall), stones and calcification, and finally the bones. A plain film is often only the first step before CT."),
    ("Who is this X-ray quiz for?",
     "Medical, nursing, physiotherapy, paramedic and radiography students, junior doctors brushing up for exams or night shifts, and anyone curious about what X-rays show. Questions run from easy to hard, and every answer comes with the key findings and a tip."),
    ("Are these real X-rays?",
     "Yes. They’re real, anonymised X-rays shared under free licences on Wikimedia Commons or in the public domain from the CDC and US FDA, credited under each image. The patient stories are fictional and written to match each film."),
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
    assert 15 <= n <= 20, n
    pos = positions(n, "x-ray-quiz")
    items = []
    for k, q in enumerate(QS):
        name, w, h = save_img(q, k + 1)
        i = q["img"]
        opts = shuffled(q, "x-ray-quiz", pos[k])
        cap = "Image: %s · %s · %s." % (esc(i["author"]), lic_html(i), esc(i["source"]))
        items.append("".join([
            '<li class="qk-q" id="xray-q%d" data-a="%d">' % (k + 1, pos[k]),
            '<p class="qk-n">Question %d of %d · %s</p>' % (k + 1, n, esc(q["region"])),
            '<p class="qk-case">%s</p>' % esc(q["case"]),
            '<h3 class="qk-p">%s</h3>' % esc(q["q"]),
            '<figure class="qk-xr"><img src="img/%s" width="%d" height="%d" alt="%s" loading="%s" decoding="async"><figcaption>%s</figcaption></figure>' % (
                name, w, h, esc(q["alt"]), "eager" if k == 0 else "lazy", cap),
            '<ol class="qk-opts" type="A">%s</ol>' % "".join("<li>%s</li>" % esc(x) for x in opts),
            '<details class="qk-ans"><summary>Show answer</summary><p><b>Answer: %s.</b> <span class="why">%s <span class="qk-tip"><strong>Tip:</strong> %s</span> <span class="qk-src">Image source: %s by %s.</span></span></p></details>' % (
                esc(q["a"]), esc(q["why"]), esc(q["tip"]), src_link(i), esc(i["author"])),
            "</li>"]))
    quiz = '<section class="qk" id="quiz" data-id="x-ray" data-title="X-ray quiz" data-emoji="🩻">\n<ol class="qk-list">\n%s\n</ol>\n</section>' % "\n".join(items)

    regions = {}
    for q in QS:
        regions[q["region"]] = regions.get(q["region"], 0) + 1
    title = "X-Ray Quiz: Chest, Abdominal and Bone X-Rays"
    desc = "Free X-ray quiz: %d real chest, abdominal, bone and paediatric X-rays, easy to hard, with key findings and a tip for each. Practise X-ray interpretation." % n
    h1 = "X-Ray Quiz: Practise Reading Real X-Rays"
    lede = ("%s real X-rays to read: chest films, abdominal films, broken bones and children’s X-rays, starting easy and getting harder. "
            "Read the short story, look at the film, pick a diagnosis, and the answer explains what you should have spotted.") % ["Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty"][n - 15]
    about = ('<section class="qk-about"><h2>About this quiz</h2><ul>'
             '<li><b>%d questions:</b> %d chest, %d abdomen, %d bone and joint, %d paediatric.</li>'
             '<li><b>Easy to hard:</b> classic fractures first, subtle and rarer findings later.</li>'
             '<li><b>Real images:</b> anonymised X-rays under free licences, credited under each image. Patient stories are fictional.</li>'
             '<li><b>Free, no sign-up:</b> your best score is saved on your device only.</li></ul></section>') % (
        n, regions.get("Chest", 0), regions.get("Abdomen", 0), regions.get("Musculoskeletal", 0), regions.get("Paediatric", 0))
    credits = '<details class="qk-credits"><summary>Image credits (contains answers)</summary><ol>%s</ol></details>' % "".join(
        "<li>%s by %s · %s · via %s.</li>" % (src_link(q["img"]), esc(q["img"]["author"]), lic_html(q["img"]), esc(q["img"]["source"])) for q in QS)
    faq = '<section class="faq"><h2>Common questions</h2>' + "".join("<details><summary>%s</summary><p>%s</p></details>" % (esc(a), esc(b)) for a, b in FAQS) + "</section>"
    body = "\n".join([
        "<h1>%s</h1>" % esc(h1),
        '<p class="lede">%s</p>' % esc(lede),
        '<p class="meta">Frontal films are viewed as if facing the patient, so the patient’s right is on the left of the image.</p>',
        quiz,
        '<p class="qk-cta"><b>Want more?</b> <a href="/opacitis/">Play a new X-ray every day</a> in Opacitis, our daily X-ray puzzle: one film, one story, six diagnoses. Past films are in the <a href="/opacitis/archive/">Opacitis archive</a>, and there are more games in <a href="/medical-games/">Medical games</a>.</p>',
        about,
        faq,
        '<h2>More medical quizzes</h2><nav id="more" data-label="Try another quiz"><ul><li><a href="/ecg-quiz/">ECG quiz</a></li><li><a href="/anatomy-quiz/">Anatomy quizzes</a></li><li><a href="/anatomy-quiz/bones/">Bones quiz</a></li><li><a href="/medical-terminology-quiz/">Medical terminology quiz</a></li><li><a href="/opacitis/">Opacitis: a daily X-ray</a></li><li><a href="/medical-games/">All medical games</a></li></ul></nav>',
        credits,
        '<p class="meta"><em>Reviewed %s by a Malady Wise GP. Real X-rays, fictional cases. General education, not personal medical advice.</em></p>' % REVIEWED,
    ])
    url = SITE + PATH
    lds = [
        {"@context": "https://schema.org", "@type": "Quiz", "name": "X-ray quiz", "url": url, "inLanguage": "en-AU",
         "about": {"@type": "Thing", "name": "X-ray interpretation"}, "educationalUse": "Self-assessment", "learningResourceType": "Quiz",
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
        {"@type": "ListItem", "position": 3, "name": "X-Ray Quiz", "item": url}]}
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
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
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
<footer class="site">General education, not personal medical advice.<br><a href="/">Malady Wise</a> · <a href="/about/">About</a> · <a href="/disclaimer/">Disclaimer</a> · <a href="/privacy/">Privacy</a> · <a href="/contact/">Contact</a></footer>
</main>
<script src="/assets/quizkit.js?v={qkv}"></script>
<script>MW.page();</script>
</body>
</html>
""".format(url=url, full=esc(full), desc=esc(desc), SITE=SITE, vcss=V["shell.css"], vj=V["shell.js"], vs=V["site.js"], vg=V["games.js"], qkv=QKV, ld=ld, body=body)
    open(ROOT + PATH + "index.html", "w", encoding="utf-8").write(fix_html(s))
    print("wrote", PATH, len(s), "questions", n, regions)


if __name__ == "__main__":
    build()
