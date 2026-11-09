"""Build the Specialists page: ONE alphabetical list (no categories), private practice only.
Run from the repo root:  python3 specialists/_data/build.py specialists/_data
Reads every *.json in the data folder ({slug:{name, people:[...]}}). Public-only services are filtered out."""
import json, html, os, re, sys, glob, datetime, urllib.parse
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "_scripts"))
from headkit import fix_html  # shared <head> clean-up: self-hosted fonts, deferred scripts, honest JSON-LD
DD = sys.argv[1] if len(sys.argv) > 1 else 'specialists/_data'
CHECKED = "9 November 2026"
PUB = re.compile(r"John Hunter|Calvary Mater|\bHNE\b|Hunter New England|Rankin Park|Mater Mental Health|CAMHS|Nexus|headspace|Pacific Clinic|Child Development Team|Integrated Pain Service|Newcastle Eye Hospital|Belmont Hospital|Maitland Hospital|Royal Newcastle|District Health|outreach|public", re.I)
PRIV = re.compile(r"Private|GenesisCare|Hunter Eye Surgeons|rooms", re.I)
NAMES = {"ent": "ENT (ear, nose and throat)", "obstetrics-gynaecology": "Obstetrics and gynaecology", "ortho-hand-upper-limb": "Orthopaedics: hand and wrist", "ortho-shoulder": "Orthopaedics: shoulder and elbow", "ortho-hip-knee": "Orthopaedics: hip and knee", "ortho-foot-ankle": "Orthopaedics: foot and ankle", "ortho-spine": "Orthopaedics: spine", "general-surgery": "General surgery", "psychiatry-adult": "Psychiatry", "psychiatry-child-adolescent": "Child and adolescent psychiatry", "psychiatry-perinatal": "Perinatal psychiatry", "paediatrics-general": "Paediatrics", "paediatrics-developmental": "Developmental paediatrics", "immunology-allergy": "Immunology and allergy", "respiratory-sleep": "Respiratory and sleep medicine", "exercise-physiology": "Exercise physiology", "occupational-therapy-adult": "Occupational therapy (adults)", "occupational-therapy-paediatric": "Occupational therapy (children)", "speech-pathology-paediatric": "Speech pathology (children)", "speech-pathology-adult": "Speech pathology (adults)", "dietetics": "Dietitians", "diabetes-education": "Diabetes educators", "continence": "Continence services", "lactation": "Lactation consultants", "social-work": "Mental health social workers", "psychology-children": "Psychology (children)", "geriatric-medicine": "Geriatric medicine", "medical-oncology": "Medical oncology", "pain-medicine": "Pain medicine", "plastic-surgery": "Plastic and reconstructive surgery", "radiation-oncology": "Radiation oncology", "rehabilitation": "Rehabilitation medicine"}
BADGES = [
 ("nd", "Neuro-affirming", r"neuro\s*-?\s*(diversity|divergen\w*)?\s*-?\s*affirm|neuroaffirm|neurodiversity|neurodivergen|autism[- ]affirm|adhd[- ]affirm",
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.5C3.5 8.5 2 10.3 2 12s1.5 3.5 4.5 3.5c3.5 0 7.5-7 11-7 3 0 4.5 1.8 4.5 3.5s-1.5 3.5-4.5 3.5c-3.5 0-7.5-7-11-7z" fill="none" stroke="#D4A017" stroke-width="2.4" stroke-linecap="round"/></svg>'),
 ("ga", "LGBTQIA+ affirming", r"gender[- ]affirm|gender[- ]diverse|transgender|\btrans\b|lgbt|rainbow|queer|non-binary|nonbinary",
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="2.3" fill="#E40303"/><rect x="2" y="7.3" width="20" height="2.3" fill="#FF8C00"/><rect x="2" y="9.6" width="20" height="2.3" fill="#FFED00"/><rect x="2" y="11.9" width="20" height="2.3" fill="#008026"/><rect x="2" y="14.2" width="20" height="2.3" fill="#004DFF"/><rect x="2" y="16.5" width="20" height="2.3" fill="#750787"/><path d="M2 5 L9 11.9 L2 18.8z" fill="#fff"/><path d="M2 6.6 L7.4 11.9 L2 17.2z" fill="#F5A9B8"/><path d="M2 8.2 L5.8 11.9 L2 15.6z" fill="#5BCEFA"/><path d="M2 9.8 L4.2 11.9 L2 14z" fill="#613915"/></svg>'),
 ("ti", "Trauma-informed", r"trauma[- ]informed|trauma[- ]aware|trauma[- ]sensitive",
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 8.2a4.3 4.3 0 0 1 7.5 2.6C19.5 16.4 12 21 12 21z" fill="none" stroke="#2E7D6B" stroke-width="2"/><path d="M8.5 13.5h7" stroke="#2E7D6B" stroke-width="2" stroke-linecap="round"/></svg>'),
 ("ab", "Aboriginal and Torres Strait Islander", r"aboriginal|torres strait|first nations|indigenous",
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="7" fill="#000"/><rect x="2" y="12" width="20" height="7" fill="#CC0000"/><circle cx="12" cy="12" r="3.4" fill="#FFD700"/></svg>'),
]

# Practical badges from practice pages (scratch sweep, Nov 2026): keyed by practice name.
_pf = os.path.join(DD, "extra", "practical.json")
PRACT = json.load(open(_pf)) if os.path.exists(_pf) else {}
PB = [("fees", "💲 Fees online"), ("eref", "📨 E-referrals"), ("short", "⏱️ Short wait"), ("urg", "🚨 Urgent GP slots"), ("wc", "♿ Wheelchair access"), ("tr", "🚆 Near transport"), ("int", "🗣️ Interpreters or languages"), ("sen", "🎧 Sensory-friendly")]
PBL = dict(PB)
def pbadges(p):
    d = PRACT.get(p.get("practice") or "") or PRACT.get(p["name"]) or {}
    out = []
    def add(code, txt, url):
        out.append((code, PBL[code], "", [(txt, url)]))
    if d.get("fees_online"): add("fees", "Fees are published on the practice website.", d["fees_online"].get("url"))
    if d.get("ereferral"): add("eref", "Accepts " + ", ".join(d["ereferral"].get("systems") or []) + ". " + "“" + d["ereferral"].get("quote", "") + "”", d["ereferral"].get("url"))
    w = d.get("wait")
    if w and isinstance(w.get("weeks"), (int, float)) and w["weeks"] <= 4: add("short", "“" + w.get("text", "") + "”", w.get("url"))
    for k, c in (("urgent_gp", "urg"), ("wheelchair", "wc"), ("transit", "tr"), ("interpreters", "int"), ("sensory", "sen")):
        if d.get(k): add(c, "“" + d[k].get("quote", "") + "”", d[k].get("url"))
    return out
def pwait(p):
    d = PRACT.get(p.get("practice") or "") or PRACT.get(p["name"]) or {}
    w = d.get("wait"); return w.get("text") if w and w.get("text") else None
_lf = os.path.join(DD, "extra", "languages.json")
LANGX = json.load(open(_lf)) if os.path.exists(_lf) else {}
def langs(p):
    l = list((p.get("practical") or {}).get("languages") or []) + list((LANGX.get(p["name"]) or {}).get("languages") or [])
    out = []
    for x in l:
        x = re.sub(r"\s*\((basic|partial)\)", "", x).strip()
        if x and x.lower() != "english" and x not in out: out.append(x)
    return out
def badges(p):
    out = []
    if re.sub(r"\W+", "", TITLE.sub("", p["name"]).lower()) in APPROVED: out.append(("mw", "Malady Wise approved", MW_SVG, [APPROVED_TXT]))
    for code, label, rx, svg in BADGES:
        hits = [x for x in (p.get("inclusive") or []) if re.search(rx, x, re.I) and not re.search(r"flag displayed|acknowledgement of country|article", x, re.I)]
        if hits: out.append((code, label, svg, hits))
    return out
def ortho_labels(p):
    t = (p.get("specialty", "") + " " + " ".join(p.get("interests") or [])).lower(); out = []
    if re.search(r"hand|wrist|microsurg", t): out.append("Orthopaedics: hand and wrist")
    if re.search(r"shoulder|elbow|upper limb", t): out.append("Orthopaedics: shoulder and elbow")
    if re.search(r"hip|knee|lower limb arthroplasty|joint replacement", t): out.append("Orthopaedics: hip and knee")
    if re.search(r"foot|ankle", t): out.append("Orthopaedics: foot and ankle")
    if re.search(r"spine|spinal", t): out.append("Orthopaedics: spine")
    if not out or re.search(r"trauma|general orthopaedic", t): out.append("Orthopaedics: general and trauma")
    return out
ALLIED = {"physiotherapy", "exercise-physiology", "podiatry", "occupational-therapy-adult", "occupational-therapy-paediatric", "speech-pathology-paediatric", "speech-pathology-adult", "psychology", "psychology-children", "dietetics", "audiology", "diabetes-education", "continence", "lactation", "social-work"}
KEEP = re.compile(r"Pacific Clinic", re.I)  # free public services kept on purpose (no referral or Medicare card needed)
def is_public(p):
    txt = p.get("name", "") + " | " + p.get("practice", "")
    if KEEP.search(txt): return False
    hosp = " ".join((p.get("practical") or {}).get("hospitals") or [])
    return bool(PUB.search(txt)) and not PRIV.search(txt + " " + hosp)
TITLE = re.compile(r"^(Dr|Prof|Professor|A/Prof|Assoc Prof|Associate Professor|Conjoint Associate Professor|Clinical Associate Professor)\.?\s+", re.I)
APPROVED_TXT = "A Malady Wise GP pick for the referral experience: easy to book, clear letters back to the GP, friendly rooms. Not a rating of clinical skill. No payment, perks or referral fees."
_ap = os.path.join(DD, "approved.txt")
APPROVED = {re.sub(r"\W+", "", TITLE.sub("", l.strip()).lower()) for l in (open(_ap).read().splitlines() if os.path.exists(_ap) else []) if l.strip() and not l.startswith("#")}
MW_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#1F5FBF"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
def sortkey(n):
    BIZ = re.compile(r"(Therapy|Health|Clinic|Physio|Speech|Pathology|Centre|Center|Group|Services|Medical|Hearing|Psychology|Podiatry|Rehab|Studio|Care|Diabetes|Alliance|Hub|Project|Club|Kids|Ethos|Audiology|Dietitian|Nutrition|Wellness|Practice|Specialists|Paediatrics|Dermatology|Orthopaedic|Surgery|Hospital|Unit|Service|Inq|Lactation|Haven|Minds|Wise|Oak|Rainbow|Avina|Beam|Aspire|Uplift|Tundra|Earport|Audika|Caremmunity|Sanctuary|Replenish|Peak|Prime|Sport|Tribe|Psych|Tele|Oasis|United)", re.I)
    if TITLE.match(n) or (re.match(r"^[A-Z][a-z]+(-[A-Z][a-z]+)? [A-Z][a-zA-Z'\-]+$", n) and not BIZ.search(n)):
        base = TITLE.sub("", n); base = re.sub(r"\s*\(.*?\)", "", base).strip()
        parts = base.split(); return (parts[-1] if parts else base).lower() + " " + base.lower()
    return re.sub(r"^the\s+", "", n.lower())
people = {}; removed = []; ALLIED_LABELS = {"Psychology (children)"}
for f in sorted(x for x in glob.glob(os.path.join(DD, "*.json")) if not x.endswith("sp-urls.json")):
    for slug, sec in json.load(open(f)).items():
        label = NAMES.get(slug, sec.get("name", slug))
        if slug in ALLIED: ALLIED_LABELS.add(label)
        for p in sec["people"]:
            if is_public(p): removed.append(p["name"]); continue
            labs = ortho_labels(p) if slug == "orthopaedics" else [label]
            if slug == "psychology-children" and re.search(r"adult", str((p.get("practical") or {}).get("ages") or "") + " " + p.get("specialty", ""), re.I): labs.append("Psychology")
            if slug == "psychology" and re.search(r"child|adolesc|teen|youth|paediatric|kids|infant|parent", " ".join([str((p.get("practical") or {}).get("ages") or ""), " ".join(p.get("interests") or []), p.get("specialty", "")]), re.I): labs.append("Psychology (children)")
            key = re.sub(r"\W+", "", TITLE.sub("", p["name"]).lower())
            if key in people:
                q = people[key]
                for label2 in labs:
                    if label2 not in q["_labels"]: q["_labels"].append(label2)
                if p.get("practice") and p["practice"] != q.get("practice") and all(p["practice"] != x[0] for x in q.setdefault("_also", [])):
                    q["_also"].append((p["practice"], p.get("suburb") or p.get("address", ""), p.get("phone", "")))
                for k in ("interests", "inclusive", "sources", "listed_by"):
                    for x in p.get(k) or []:
                        if x not in q.setdefault(k, []): q[k].append(x)
            else:
                p = dict(p); p["_labels"] = list(labs); people[key] = p
L = sorted(people.values(), key=lambda p: sortkey(p["name"]))
e = lambda s: html.escape(str(s or ""), quote=True)

# "Find by interest": canonical interest tags from free-text interests, with a small synonym map.
TAGMAP = [
 ("ADHD", r"\badhd\b|attention[- ]deficit"), ("autism", r"autis|\basd\b|ados|asperger"), ("trauma", r"trauma|ptsd|post[- ]?traumatic"),
 ("EMDR", r"\bemdr\b|eye movement desensiti"), ("eating disorders", r"eating disorder|disordered eating|anorexi|bulimi|binge|arfid|osfed|cbt-e|body image"),
 ("perinatal", r"perinatal|post[- ]?natal|postpartum|ante[- ]?natal|pre[- ]?natal|pregnan|birth trauma|new parents|infertility|fertility"),
 ("child and adolescent", r"child|adolesc|\bteen|youth|paediatric|\bkids\b|infant|toddler|young people|school"),
 ("couples", r"couple|relationship counsel|marriage|relationship therap"), ("family", r"\bfamil"),
 ("OCD", r"\bocd\b|obsessive"), ("anxiety", r"anxi|panic|phobi|worry"), ("depression", r"depress|low mood|mood disorder|\bmood\b"),
 ("DBT", r"\bdbt\b|dialectical"), ("CBT", r"\bcbt|cognitive behaviour"), ("ACT", r"\bact\b|acceptance and commitment"), ("schema therapy", r"schema"),
 ("chronic pain", r"chronic pain|persistent pain|pain management|pain psych|pain program|chronic illness and pain"),
 ("LGBTIQA+-affirming", r"lgbt|queer|rainbow|sexualit|gender and sexual"), ("trans and gender-affirming", r"\btrans\b|transgender|gender[- ]affirm|gender dysphoria|gender[- ]diverse|non-binary|auspath"),
 ("First Nations", r"aboriginal|torres strait|first nations|indigenous"), ("neuropsychology", r"neuropsych|cognitive (and|assess)|\biq\b|acquired brain|intellectual disab|capacity assess|dementia assess"),
 ("grief", r"grief|bereave"), ("addiction", r"addict|substance|alcohol|\bdrug|gambl"), ("personality disorders", r"personality disorder|\bbpd\b|borderline"),
 ("veterans", r"veteran|\bdva\b|defence|military|\badf\b"), ("sleep", r"sleep|insomnia"), ("bipolar", r"bipolar"), ("self-harm", r"self[- ]harm|suicid"),
 ("stress and burnout", r"stress|burnout"), ("assessment", r"assessment"), ("women's health", r"women|menopaus|perimenopaus|pelvic|pcos|endometrios"),
 ("men's health", r"\bmen's|\bmen\b|prostate"), ("pelvic health", r"pelvic|continence|incontinence|bladder|bowel|prolapse"),
 ("sports injuries", r"sport"), ("falls and balance", r"falls|balance|vestibular|dizz|vertigo"), ("lymphoedema", r"lymph"),
 ("diabetes", r"diabet"), ("swallowing", r"swallow|dysphagia"), ("stuttering", r"stutter|fluency"), ("hand therapy", r"hand therap|\bhand\b|wrist"),
 ("concussion", r"concussion"), ("stroke and neuro rehab", r"stroke|neurolog|parkinson|multiple sclerosis|\bms\b"), ("hypermobility", r"hypermobil|ehlers|\beds\b"),
 ("ME/CFS", r"chronic fatigue|me/cfs|\bcfs\b|myalgic"), ("POTS/dysautonomia", r"\bpots\b|dysautonomia|postural orthostatic"), ("mitochondrial disease", r"mitochondri"),
 ("gut health and IBS", r"\bibs\b|fodmap|irritable bowel|gut health|gastro"), ("coeliac", r"coeliac|celiac"), ("weight", r"weight"), ("kidney", r"kidney|renal"),
 ("heart health", r"cardiac|heart|cholesterol"), ("cancer", r"cancer|oncolog"), ("older adults", r"older adult|ageing|aged care|elderly|dementia"),
 ("feeding", r"feeding|fussy eat"), ("language and literacy", r"language|literacy|dyslex|reading"), ("voice", r"\bvoice\b"),
 ("foot care", r"foot|feet|nail|orthotic|heel"), ("hearing and tinnitus", r"hearing|tinnitus|audiolog"), ("work injury", r"workers comp|work(place)? injur|icare|ctp\b"),
]
TAGRX = [(t, re.compile(rx, re.I)) for t, rx in TAGMAP]
KIDRX = re.compile(r"child|adolesc|\bteen|youth|paediatric|\bkids\b|infant|toddler|young people|babies|preschool|school", re.I)
def itags(p):
    txt = " | ".join([p.get("specialty", ""), " ; ".join(p.get("interests") or []), " ; ".join(p.get("inclusive") or []), " ".join(x.get("tag", "") for x in p.get("listed_by") or [])])
    out = [t for t, rx in TAGRX if rx.search(txt)]
    for b in badges(p):
        if b[0] == "ga" and "LGBTIQA+-affirming" not in out: out.append("LGBTIQA+-affirming")
        if b[0] == "ab" and "First Nations" not in out: out.append("First Nations")
    return out
def flags(p):
    pr = p.get("practical") or {}; f = []
    if pr.get("telehealth") is True: f.append("tele")
    if pr.get("bulk_billing") in ("yes", "some"): f.append("bb")
    if pr.get("ndis") is True: f.append("ndis")
    if KIDRX.search(" ".join([str(pr.get("ages") or ""), " ".join(p["_labels"]), p.get("specialty", "")])) and not re.match(r"^\s*adults?\b", str(pr.get("ages") or ""), re.I): f.append("kids")
    if pr.get("new_patients") in ("yes", "limited"): f.append("np")
    return f
def pid(p): return "p-" + re.sub(r"[^a-z0-9]", "", TITLE.sub("", p["name"]).lower())[:60]
TOGGLES = [("tele", "Telehealth"), ("bb", "Bulk billing stated"), ("ndis", "NDIS"), ("kids", "Kids"), ("np", "Accepting new patients (as stated)")]
FINDNOTE = '<p class="sp-note">Listings are from public professional directories and practice websites, checked on the date shown. Not endorsements. Confirm details with the practice.</p>'
def finder(ppl, hub=False):
    from collections import Counter
    c = Counter(t for p in ppl for t in itags(p) if t not in ("assessment",))
    top = [t for t, n in c.most_common(14) if n >= (2 if len(ppl) > 6 else 1)]
    lab = "Search by name, interest or suburb" + (" (all specialties)" if hub else "")
    ph = "e.g. ADHD, perinatal, Maitland"
    h = (f'<div class="sp-find" role="search"><label class="sp-search"><span>{lab}</span><input type="search" autocomplete="off" placeholder="{ph}" {"data-sp-search" if hub else "data-sp-filter"} aria-describedby="sp-find-note"></label>')
    if top: h += '<div class="sp-chips sp-ichips" role="group" aria-labelledby="sp-gl-i"><span class="sp-gl" id="sp-gl-i">Interests</span>' + "".join(f'<button type="button" class="sp-chip sp-ichip" data-tag="{e(t)}" aria-pressed="false">{e(t)}</button>' for t in top) + "</div>"
    h += '<div class="sp-chips sp-toggles" role="group" aria-labelledby="sp-gl-f"><span class="sp-gl" id="sp-gl-f">Show only</span>' + "".join(f'<button type="button" class="sp-chip sp-tog" data-flag="{k}" aria-pressed="false">{e(v)}</button>' for k, v in TOGGLES) + "</div>"
    return h + f'<p class="sp-note" id="sp-find-note">Listings are from public professional directories and practice websites, checked on the date shown. Not endorsements. Confirm details with the practice.</p></div>'

# Condition support organisations with their own provider lists (checked Nov 2026). "used": names matched to our listings (shown as badges);
# otherwise link only (results not readable without a search app, no Hunter listings seen, or no public list).
ORGS = [
 ("AusPATH", "Find a provider", "https://auspath.org.au/providers/", "Trans and gender-diverse affirming health providers (GPs, specialists, psychologists, allied health).", True, ["psychology", "endocrinology", "psychiatry", "mental-health-social-workers", "sexual-health", "speech-pathology-adults"]),
 ("TransHub (ACON)", "Find a doctor", "https://www.transhub.org.au/doctor/", "Gender-affirming doctors in NSW.", False, ["endocrinology", "sexual-health", "psychiatry"]),
 ("InsideOut Institute", "Treatment Services Database", "https://insideoutinstitute.org.au/treatment-team-builder", "Eating disorder clinicians and services (psychologists, dietitians, psychiatrists).", True, ["psychology", "psychology-children", "dietitians", "psychiatry"]),
 ("ANZAED", "Find eating disorder help (credentialed clinicians)", "https://connected.anzaed.org.au/Connected/Connected/Find-Eating-Disorder-Help/Find-Eating-Disorder-Help.aspx", "ANZAED-credentialed eating disorder clinicians, by location or telehealth.", False, ["psychology", "psychology-children", "dietitians", "mental-health-social-workers"]),
 ("Butterfly Foundation", "Find a professional", "https://butterfly.org.au/get-support/butterflys-referral-database/", "Eating disorder and body image referral database.", False, ["psychology", "dietitians"]),
 ("AADPA", "ADHD Professionals Directory", "https://directory.aadpa.com.au/", "ADHD clinicians: psychiatrists, paediatricians, GPs, psychologists, coaches.", False, ["psychology", "psychology-children", "psychiatry", "psychiatry-telehealth", "developmental-paediatrics", "occupational-therapy-children"]),
 ("ADHD Australia", "ADHD treatment by state", "https://www.adhdaustralia.org.au/adhd-treatment-by-state/", "Where to start with ADHD care in each state.", False, ["psychology", "psychiatry"]),
 ("Amaze (Autism Connect)", "National autism helpline", "https://www.amaze.org.au/support/", "Free helpline that helps find autism assessment and supports (no public practitioner list).", False, ["psychology-children", "developmental-paediatrics", "speech-pathology-children", "occupational-therapy-children"]),
 ("Aspect", "Autism assessments", "https://www.autismspectrum.org.au/how-can-we-help/getting-a-diagnosis", "Aspect's own autism assessment and therapy services.", False, ["psychology-children", "developmental-paediatrics"]),
 ("Australian POTS Foundation", "Clinician directory", "https://potsfoundation.org.au/clinician-directory/", "Clinicians with an interest in POTS and dysautonomia.", False, ["cardiology", "neurology", "exercise-physiology", "physiotherapy"]),
 ("Mito Foundation", "Find a health professional", "https://www.mito.org.au/find-a-professional/", "Mito-aware clinicians and clinics (details via the Mito helpline).", False, ["neurology", "dietitians", "exercise-physiology"]),
 ("Emerge Australia", "ME/CFS health practitioner directory", "https://directory.emerge.org.au/", "ME/CFS-aware GPs and health practitioners.", False, ["exercise-physiology", "physiotherapy", "occupational-therapy-adults", "dietitians"]),
 ("Australasian Lymphology Association", "Find an accredited lymphoedema practitioner", "https://www.lymphoedema.org.au/accreditation-nlpr/find-a-practitioner/", "ALA-accredited lymphoedema practitioners (mostly physios and OTs).", False, ["physiotherapy", "occupational-therapy-adults", "medical-oncology", "radiation-oncology"]),
 ("MS Australia", "MS clinics", "https://www.msaustralia.org.au/clinics/", "MS clinics by state (the Hunter listing is a public hospital clinic).", False, ["neurology", "physiotherapy"]),
 ("Parkinson's NSW", "Parkinson's InfoLine", "https://www.parkinsonsnsw.org.au/have-you-called-the-parkinsons-infoline-yet/", "Phone line for finding Parkinson's nurses, clinics and allied health.", False, ["neurology", "physiotherapy", "speech-pathology-adults"]),
 ("Coeliac Australia", "Ongoing management", "https://coeliac.org.au/learn/ongoing-management/", "Advice on seeing an accredited practising dietitian for coeliac disease.", False, ["dietitians", "gastroenterology"]),
 ("Jean Hailes", "Persistent pelvic pain", "https://www.jeanhailes.org.au/health-topics/persistent-pelvic-pain/", "Pelvic pain and endometriosis information, and who can help.", False, ["obstetrics-and-gynaecology", "physiotherapy", "pain-medicine"]),
 ("PANDA", "Perinatal mental health helpline", "https://www.panda.org.au/", "National perinatal anxiety and depression helpline.", False, ["psychology", "perinatal-psychiatry"]),
 ("Gidget Foundation", "Gidget House", "https://www.gidgetfoundation.org.au/support/gidget-house", "Free perinatal psychology, including Gidget House Green Hills (East Maitland).", True, ["psychology", "perinatal-psychiatry", "obstetrics-and-gynaecology"]),
]
def orgsection():
    li = "".join(f'<li><a href="{e(u)}" rel="noopener"><b>{e(o)}</b>: {e(t)}</a> {e(w)}</li>' for o, t, u, w, used, sl in ORGS)
    return ('<section class="sp-orgs" id="condition-orgs"><h2>Condition support organisations with their own provider lists</h2>'
            '<p>These organisations keep their own lists. Where we found one of our listings on a list, its card shows a small badge, e.g. “Listed by AusPATH”. Checked ' + CHECKED + '.</p><ul>' + li + '</ul></section>')
def orgbox(slug):
    hits = [(o, t, u) for o, t, u, w, used, sl in ORGS if slug in sl]
    if not hits: return ""
    return '<details class="sp-orgbox"><summary>Find a specialist through a condition organisation</summary><ul>' + "".join(f'<li><a href="{e(u)}" rel="noopener">Find through {e(o)}</a>: {e(t)}</li>' for o, t, u in hits) + '</ul><p><a href="/specialists/#condition-orgs">All condition organisations</a></p></details>'
def card(p):
    pr = p.get("practical") or {}; lines = []
    if p.get("practice") and p["practice"] != p["name"]: lines.append(f'<span class="sp-prac">{e(p["practice"])}</span>')
    if p.get("address"): lines.append(f'<span>{e(p["address"])}</span>')
    c = []
    if p.get("phone"): c.append(f'<a href="tel:{e(re.sub(r"[^0-9+]", "", p["phone"]))}">{e(p["phone"])}</a>')
    if p.get("fax"): c.append(f'Fax {e(p["fax"])}')
    if p.get("website"): c.append(f'<a href="{e(p["website"])}" rel="noopener">Website</a>')
    mq = p.get("address") or ""
    if not re.search(r"\d", mq): mq = " ".join(x for x in [p.get("practice", ""), p.get("suburb", "")] if x)
    if mq: c.append('<a href="https://www.google.com/maps/search/?api=1&amp;query=' + e(urllib.parse.quote_plus(mq + " NSW")) + '" rel="noopener">Map and reviews</a>')
    if c: lines.append("<span>" + " · ".join(c) + "</span>")
    if p.get("ereferral"): lines.append(f'<span>E-referral: {e(p["ereferral"])}</span>')
    for pr2, sub2, ph2 in p.get("_also") or []:
        lines.append(f'<span>Also: {e(pr2)}' + (f', {e(sub2)}' if sub2 else '') + (f' · <a href="tel:{e(re.sub(r"[^0-9+]", "", ph2))}">{e(ph2)}</a>' if ph2 else '') + '</span>')
    extra = []
    if p.get("interests"): extra.append(f'<p class="sp-int"><b>Interests:</b> {e("; ".join(p["interests"]))}</p>')
    facts = []
    np_ = pr.get("new_patients")
    np_txt = {"yes": "Taking new patients", "limited": "Limited new patients", "no": "Not taking new patients"}.get(np_)
    if np_txt: extra.append(f'<p class="sp-np sp-np-{e(np_)}">{np_txt}' + (f' · {e(pr["np_note"])}' if pr.get("np_note") else "") + (f' <span>(as stated {e(pr.get("np_checked") or p.get("checked", ""))})</span>' if True else "") + '</p>')
    tags = []
    if langs(p): tags.append(("lang", "🗣️ Speaks " + ", ".join(langs(p))))
    if pr.get("pets") == "therapy_dog": tags.append(("pet", "🐶 Therapy dog on staff"))
    elif pr.get("pets") == "pets_welcome": tags.append(("pet", "🐾 Pet friendly"))
    if pr.get("telehealth") is True: tags.append(("", "Telehealth (pants optional)"))
    bb = pr.get("bulk_billing")
    if bb == "yes": tags.append(("bb", "🦄 Bulk billing"))
    elif bb == "some": tags.append(("bb", "Some bulk billing"))
    if pr.get("weekend") is True: tags.append(("", "Weekend appointments"))
    if pr.get("after_hours") is True: tags.append(("", "After hours (night owls welcome)"))
    if pr.get("parking") == "free": tags.append(("", "Free parking (a Newcastle miracle)"))
    if pr.get("ndis") is True: tags.append(("", "NDIS"))
    if pr.get("medicare_cdm") is True: tags.append(("", "Medicare care plans"))
    if tags: extra.append('<p class="sp-tags">' + "".join(f'<span class="sp-t {("sp-t-" + c) if c else ""}">{e(t)}</span>' for c, t in tags) + "</p>")
    if pr.get("ages"): facts.append("Ages: " + pr["ages"])
    if pr.get("wait"): facts.append("Wait: " + pr["wait"])
    if pr.get("hospitals"): facts.append("Hospitals: " + ", ".join(pr["hospitals"]))
    if facts: extra.append('<p class="sp-facts">' + e(" · ".join(facts)) + "</p>")
    bd = badges(p); used = {h for b in bd for h in b[3]}
    if bd: extra.append('<div class="sp-badges">' + "".join(f'<details class="sp-b sp-b-{c}"><summary>{svg}{e(lab)}</summary><p>' + "<br>".join((e(h) if c == "mw" else f"“{e(h)}”") for h in hits) + '</p></details>' for c, lab, svg, hits in bd) + "</div>")
    pb = pbadges(p)
    if pb: extra.append('<div class="sp-badges sp-pbs">' + "".join(f'<details class="sp-b sp-pb sp-pb-{c}"><summary>{e(lab)}</summary><p>' + "<br>".join(e(t) + (f' <a href="{e(u)}" rel="noopener">source</a>' if u else "") for t, u in hits) + '</p></details>' for c, lab, svg, hits in pb) + "</div>")
    pw = pwait(p)
    if pw and not any(b[0] == "short" for b in pb): extra.append(f'<p class="sp-facts">Stated wait: “{e(pw)}”</p>')
    rest = [x for x in (p.get("inclusive") or []) if x not in used]
    if rest: extra.append('<p class="sp-inc">' + "".join(f"<span>{e(x)}</span>" for x in rest) + "</p>")
    srcs = " ".join(f'<a href="{e(u)}" rel="noopener">[{i+1}]</a>' for i, u in enumerate(p.get("sources") or []))
    lb = p.get("listed_by") or []
    if lb: extra.append('<p class="sp-lb">' + "".join(f'<a class="sp-lbb" href="{e(x.get("url", ""))}" rel="noopener" title="Checked {e(x.get("checked", ""))}">{e(x.get("label") or ("Listed by " + x.get("org", "")))}</a>' for x in lb) + "</p>")
    tg = itags(p)
    q = " ".join([p["name"], p.get("practice", ""), p.get("suburb", ""), p.get("address", ""), " ".join(p["_labels"]), " ".join(p.get("interests") or []), " ".join(p.get("inclusive") or []), " ".join(langs(p)), " ".join(tg), " ".join(x.get("org", "") for x in lb)]).lower()
    return (f'<li class="sp-card" id="{pid(p)}" data-t="{e("|".join(tg))}" data-f="{" ".join(flags(p))}" data-l="{e("|".join(langs(p)))}" data-id="{re.sub(r"[^a-z0-9]", "", TITLE.sub("", p["name"]).lower())[:60]}" data-q="{e(q)}" data-b="{" ".join([b[0] for b in badges(p)] + [b[0] for b in pbadges(p)])}"><h3>{e(p["name"])}</h3><p class="sp-sub">{e(p.get("specialty") if p.get("specialty") and len(p["_labels"]) == 1 else " · ".join(p["_labels"]))}</p>'
            f'<p class="sp-lines">{"".join(lines)}</p>{"".join(extra)}<p class="sp-src">Checked {e(p.get("checked", ""))} · Sources {srcs}</p><p class="sp-act"><button type="button" class="sp-sug">Suggest a tag</button> · <button type="button" class="sp-pr1">Print</button> · <a href="/contact/">Something wrong?</a></p></li>')
CHIPS = '<div class="sp-chips" role="group" aria-label="Show only">' + "".join(f'<button type="button" class="sp-chip sp-b-{c}" data-badge="{c}" aria-pressed="false">{svg}{e(lab)}</button>' for c, lab, svg in ([("mw", "Malady Wise approved", MW_SVG)] if APPROVED else []) + [(c, lab, svg) for c, lab, rx, svg in BADGES]) + '</div><details class="sp-pf"><summary>More filters: fees, e-referrals, wait, access</summary><div class="sp-chips sp-pchips" role="group" aria-label="Practical">' + "".join(f'<button type="button" class="sp-chip sp-pb sp-pb-{c}" data-badge="{c}" aria-pressed="false">{e(lab)}</button>' for c, lab in PB) + '</div></details><p class="sp-bnote">Badges show only where a practice says so publicly. Tap a badge to see its wording and source. Many practices offer this care without advertising it.</p>'
def slugify(t): return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")
CATS = {}
for p in L:
    for lab in p["_labels"]: CATS.setdefault(lab, []).append(p)
src = open("deep-dives/index.html").read()
headtpl = src[:src.index("</head>")]
def sub(h, pat, val): return re.sub(pat, lambda m: m.group(1) + val, h)
def head(title, desc, url):
    h = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="https://maladywise.com{url}">', headtpl)
    h = re.sub(r"<title>[^<]*</title>", f"<title>{e(title)}</title>", h)
    for prop in ('name="description"', 'property="og:description"'): h = sub(h, r'(<meta ' + prop + r' content=")[^"]*', e(desc))
    h = sub(h, r'(<meta property="og:title" content=")[^"]*', e(title))
    return h + SPCSS + '</head>\n<body>\n<main class="wrap doc sp-page">\n'
foot = src[src.index("<footer"):]
SPCSS = "<style>.sp-find{margin:4px 0 6px}.sp-ichips{margin-top:2px}.sp-chip.sp-ichip,.sp-chip.sp-tog{padding:5px 11px;background:var(--card);border-color:var(--line);color:var(--ink);font-weight:600;font-size:12.5px;min-height:32px}.sp-chip.sp-ichip[aria-pressed=true]{background:#4A3480;border-color:#4A3480;color:#fff}.sp-chip.sp-tog[aria-pressed=true]{background:#1F6457;border-color:#1F6457;color:#fff}.sp-chip.sp-tog[aria-pressed=true]::before,.sp-chip.sp-ichip[aria-pressed=true]::before{content:\"\\2713\";margin-right:2px}.sp-chip:focus-visible{outline:2px solid #4A3480;outline-offset:2px}.sp-gl{align-self:center;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-right:2px}.sp-toggles{margin-top:6px}.sp-note{font-size:12px;color:var(--muted);margin:4px 0 8px}.sp-card .sp-lb{margin-top:4px}.sp-lbb{display:inline-block;margin:2px 6px 0 0;padding:2px 9px;border-radius:999px;border:1px solid #A8C3EE;background:#E6EFFC;color:#17468F;font-size:12px;font-weight:600;text-decoration:none}.sp-card.sp-hit,.sp-card:target{outline:3px solid #D4A017;outline-offset:2px}.sp-card{scroll-margin-top:80px}.sp-orgbox{margin:4px 0 10px;border:1px solid var(--line);border-radius:12px;padding:8px 12px;background:var(--card)}.sp-orgbox summary{cursor:pointer;font-weight:600;font-size:14px}.sp-orgbox ul,.sp-orgs ul{margin:6px 0;padding-left:18px;font-size:14px}.sp-orgs li{margin:4px 0}.sp-results b{overflow-wrap:anywhere}@media print{.sp-find,.sp-orgbox{display:none!important}}</style>"
SPJS = '<script src="/specialists/sp.js?v=7"></script>'
if "<script>MW.page();</script>" in foot: foot = foot.replace("<script>MW.page();</script>", "<script>MW.page();</script>\n" + SPJS)
else: foot = foot.replace("</body>", SPJS.replace("<script ", "<script defer ") + "\n</body>", 1)  # template already deferred by headkit
DISC = '<p class="callout"><b>A directory, not a recommendation.</b> Private practices only, built from public sources (practice websites, hospital profiles, Healthdirect, professional directories). Details change: confirm with the practice. Specialists need a GP referral. Inclusive-practice notes only quote what a practice says publicly. Spot an error? <a href="/contact/">Tell us</a>.</p>'
for d in glob.glob("specialists/*/"):
    if not d.rstrip("/").endswith("_data"):
        import shutil; shutil.rmtree(d)
PAGE_NOTE = {"Psychiatry (telehealth)": '<p class="callout"><b>Video appointments, Australia-wide.</b> Still needs a GP referral. Most telehealth bulk billing is for rural patients only, and Newcastle counts as metro, so expect private fees with a Medicare rebate. Check fees, wait times and whether the first visit can be by video before booking.</p>'}

REL_SPEC = {"psychology-children":["child-and-adolescent-psychiatry","developmental-paediatrics","speech-pathology-children"],"cardiology":["vascular-surgery","endocrinology","respiratory-and-sleep-medicine"],"dermatology":["plastic-and-reconstructive-surgery","immunology-and-allergy","rheumatology"],"endocrinology":["diabetes-educators","dietitians","cardiology"],"gastroenterology":["general-surgery","dietitians","immunology-and-allergy"],"general-surgery":["gastroenterology","vascular-surgery","plastic-and-reconstructive-surgery"],"rheumatology":["immunology-and-allergy","physiotherapy","pain-medicine"],"neurology":["neurosurgery","rehabilitation-medicine","pain-medicine"],"neurosurgery":["orthopaedics-spine","neurology","pain-medicine"],"psychiatry":["psychiatry-telehealth","psychology","mental-health-social-workers"],"psychiatry-telehealth":["psychiatry","psychology","perinatal-psychiatry"],"psychology":["psychiatry","mental-health-social-workers","psychiatry-telehealth"],"paediatrics":["developmental-paediatrics","child-and-adolescent-psychiatry","speech-pathology-children"],"developmental-paediatrics":["occupational-therapy-children","speech-pathology-children","child-and-adolescent-psychiatry"],"obstetrics-and-gynaecology":["perinatal-psychiatry","lactation-consultants","continence-services"],"urology":["continence-services","nephrology","general-surgery"],"nephrology":["urology","endocrinology","cardiology"],"respiratory-and-sleep-medicine":["ent-ear-nose-and-throat","cardiology","immunology-and-allergy"],"ent-ear-nose-and-throat":["audiology","immunology-and-allergy","respiratory-and-sleep-medicine"],"ophthalmology":["neurology","endocrinology","dermatology"],"physiotherapy":["exercise-physiology","podiatry","orthopaedics-general-and-trauma"],"podiatry":["orthopaedics-foot-and-ankle","physiotherapy","diabetes-educators"],"medical-oncology":["radiation-oncology","haematology","palliative-care"],"radiation-oncology":["medical-oncology","haematology","general-surgery"],"haematology":["medical-oncology","immunology-and-allergy","infectious-diseases"],"geriatric-medicine":["rehabilitation-medicine","neurology","occupational-therapy-adults"]}
REL_FACT = {"psychology-children":["adhd","autism","sleep"],"cardiology":["blood-pressure","pots"],"dermatology":["acne","eczema","psoriasis","rosacea"],"endocrinology":["osteoporosis","b12","addisons-disease"],"gastroenterology":["coeliac","reflux","ibs","gallstones","inflammatory-bowel-disease","eosinophilic-oesophagitis","haemochromatosis"],"general-surgery":["gallstones","haemorrhoids","diverticulitis"],"rheumatology":["gout","knee-oa","lupus","scleroderma","ehlers-danlos-syndrome"],"neurology":["migraine","restless-legs","myasthenia-gravis"],"psychiatry":["adhd","ptsd","sleep"],"psychiatry-telehealth":["adhd","ptsd","sleep"],"psychology":["ptsd","sleep","adhd"],"developmental-paediatrics":["autism","adhd"],"child-and-adolescent-psychiatry":["adhd","autism"],"obstetrics-and-gynaecology":["endometriosis","period-pain","pms"],"urology":["uti"],"respiratory-and-sleep-medicine":["sleep-apnoea","sleep","sarcoidosis"],"ent-ear-nose-and-throat":["tinnitus","eustachian-tube","hay-fever"],"immunology-and-allergy":["hay-fever","hives","mcas","eosinophilic-oesophagitis"],"audiology":["tinnitus"],"orthopaedics-hip-and-knee":["knee-oa","hip-pain"],"orthopaedics-foot-and-ankle":["plantar-fasciitis","ankle-sprain"],"orthopaedics-shoulder-and-elbow":["tennis-elbow"],"orthopaedics-spine":["back-pain"],"physiotherapy":["back-pain","ankle-sprain","tennis-elbow"],"podiatry":["plantar-fasciitis","ankle-sprain"],"pain-medicine":["back-pain","migraine"],"dietitians":["coeliac","ibs","iron"],"geriatric-medicine":["dementia-prevention","osteoporosis"],"haematology":["iron","b12","haemochromatosis","porphyria"],"sexual-health":["thrush","uti"]}
GAMES = [("/wordemic/","Wordemic","Guess the medical word"),("/triviosis/","Triviosis","Ten quick questions"),("/dx/","Dxtective","Crack today's diagnosis"),("/glimpsis/","Glimpsis","Spot the sign"),("/linkase/","Linkase","Chain the medical words"),("/basil/","Basil + Clover","Kick things off the bench")]
def _title(path):
    try:
        t = re.search(r"<h1[^>]*>(.*?)</h1>", open(path.strip("/") + "/index.html").read(), re.S).group(1)
        return re.sub(r"<[^>]+>", "", t).strip()
    except Exception: return None
def langsel(ppl):
    L = sorted({x for p in ppl for x in langs(p)})
    if not L: return ""
    return '<label class="sp-lang"><span>Speaks</span><select data-sp-lang><option value="">Any language</option>' + "".join(f'<option>{e(x)}</option>' for x in L) + "</select></label>"
def keep_going(slug):
    items = []
    for s2 in REL_SPEC.get(slug, []):
        if s2 in SLUGS: items.append((f"/specialists/{s2}/", "Specialists and allied health", SLUGS[s2]))
    for f2 in REL_FACT.get(slug, [])[:6]:
        t = _title(f2)
        if t: items.append((f"/{f2}/", "Fact sheet", t))
    h = sum(map(ord, slug))
    for i in range(2):
        u, n, d = GAMES[(h + i * 3) % len(GAMES)]; items.append((u, "Daily puzzle", f"{n}: {d}"))
    items.append(("/specialists/", "Specialists and allied health", "All specialties A–Z"))
    return '<section class="related sp-more"><h2>Keep exploring</h2><ul>' + "".join(f'<li><a href="{u}"><span>{k}</span>{e(t)}</a></li>' for u, k, t in items) + "</ul></section>"
SLUGS = {slugify(l): l for l in CATS}
urls = ["/specialists/"]
for lab, ppl in CATS.items():
    slug = slugify(lab); url = f"/specialists/{slug}/"; urls.append(url)
    os.makedirs("specialists/" + slug, exist_ok=True)
    title = f"{lab} in Newcastle and the Hunter | Malady Wise"
    desc = f"{lab} in Newcastle and the Hunter, NSW: private practice contacts, addresses, stated interests and inclusive-practice notes. A directory, not a recommendation."
    body = (f'<p class="meta"><a href="/specialists/">Specialists and allied health</a> · Newcastle and the Hunter</p><h1>{e(lab)}</h1>'
            f'<p class="lede">{len(ppl)} listed, A–Z. Last checked {CHECKED}.</p>' + PAGE_NOTE.get(lab, "") +
            finder(ppl) + langsel(ppl) + CHIPS + orgbox(slug) + '<p class="sp-tools"><span class="sp-count" aria-live="polite"></span><button type="button" class="sp-prall">🖨️ Print this list</button></p>'
            f'<ul class="sp-list">{"".join(card(p) for p in ppl)}</ul>{keep_going(slug)}{DISC}<p class="meta"><em>Last checked {CHECKED}.</em></p>\n')
    open(f"specialists/{slug}/index.html", "w").write(fix_html(head(title, desc, url) + body + foot))
labs = sorted(CATS, key=lambda x: x.lower())
SURG = re.compile(r"surg|ENT \(|Obstetrics|Ophthalm|Orthopaed|^Urology", re.I)
# Short tile names so each fits on one line on a phone (pages and URLs keep the full name).
SHORT = {"Orthopaedics: shoulder and elbow": "Ortho: shoulder & elbow", "Orthopaedics: hand and wrist": "Ortho: hand & wrist", "Orthopaedics: hip and knee": "Ortho: hip & knee", "Orthopaedics: foot and ankle": "Ortho: foot & ankle", "Orthopaedics: spine": "Ortho: spine", "Orthopaedics: general and trauma": "Ortho: general & trauma", "Plastic and reconstructive surgery": "Plastic surgery", "ENT (ear, nose and throat)": "ENT", "Obstetrics and gynaecology": "Obstetrics & gynae", "Child and adolescent psychiatry": "Psychiatry: child/teen", "Psychology (children)": "Psychology: kids", "Perinatal psychiatry": "Psychiatry: perinatal", "Psychiatry (telehealth)": "Psychiatry: telehealth", "Developmental paediatrics": "Paediatrics: developmental", "Respiratory and sleep medicine": "Respiratory & sleep", "Occupational therapy (adults)": "OT: adults", "Occupational therapy (children)": "OT: kids", "Speech pathology (children)": "Speech pathology: kids", "Speech pathology (adults)": "Speech pathology: adults", "Mental health social workers": "Mental health social work"}
def tiles(keys):
    keys = sorted(keys, key=lambda k: SHORT.get(k, k).lower())
    return '<ul class="sp-specs">' + "".join(f'<li><a href="/specialists/{slugify(k)}/" title="{e(k)}"><b>{e(SHORT.get(k, k))}</b><span>{len(CATS[k])}</span></a></li>' for k in keys) + "</ul>"
allc = [{"n": p["name"], "s": " · ".join(p["_labels"]), "u": "/specialists/" + slugify(p["_labels"][0]) + "/#" + pid(p), "q": " ".join([p["name"], p.get("practice", ""), p.get("suburb", ""), p.get("address", ""), " ".join(p["_labels"]), " ".join(p.get("interests") or []), " ".join(itags(p)), " ".join(x.get("org", "") for x in p.get("listed_by") or [])]).lower(), "sub": p.get("suburb", ""), "t": itags(p), "f": flags(p), "b": [b[0] for b in badges(p)] + [b[0] for b in pbadges(p)]} for p in L]
json.dump({"checked": CHECKED, "items": allc}, open("specialists/search-index.json", "w"), ensure_ascii=False, separators=(",", ":"))
title = "Specialists and allied health in Newcastle and the Hunter | Malady Wise"
desc = "Directory of private specialists and allied health in Newcastle and the Hunter, NSW, by specialty: practice contacts, stated interests and inclusive-practice notes from public sources."
page = (head(title, desc, "/specialists/") + '<h1>Specialists and allied health</h1><p class="lede">Private specialists and allied health in Newcastle and the Hunter.</p>'
        f'<p class="evkey"><span class="ev m">Newcastle and the Hunter</span> {len(L)} listings across {len(CATS)} specialties. Last checked {CHECKED}.</p>'
        + finder(L, hub=True) + CHIPS + '<p class="sp-count" aria-live="polite"></p><ul class="sp-results" hidden></ul>'
        '<h2>Medical specialists</h2>' + tiles([k for k in labs if k not in ALLIED_LABELS and not SURG.search(k)]) + '<h2>Surgical specialists</h2>' + tiles([k for k in labs if k not in ALLIED_LABELS and SURG.search(k)]) + '<h2>Allied health</h2>' + tiles([k for k in labs if k in ALLIED_LABELS]) + orgsection() + DISC +
        '<script>window.SP_ALL=' + json.dumps(allc, ensure_ascii=False).replace("</", "<\\/") + ';</script>\n' + foot)
open("specialists/index.html", "w").write(fix_html(page))
json.dump(urls, open(os.path.join(DD, "sp-urls.json"), "w"))
print(len(L), "listed;", len(CATS), "specialties;", len(removed), "public-only removed")
# Optional: private referral-fit scores for the owner's private doc (never written into the repo).
if os.environ.get("SP_SCORES"):
    out = []
    for p in L:
        pr = p.get("practical") or {}; sc = 0; why = []
        if pr.get("telehealth") is True: sc += 2; why.append("telehealth +2")
        bb = pr.get("bulk_billing")
        if bb == "yes": sc += 2; why.append("bulk bills +2")
        elif bb == "some": sc += 1; why.append("some bulk billing +1")
        if p.get("ereferral"): sc += 2; why.append("e-referral +2")
        if p.get("inclusive"): sc += 2; why.append("inclusive statement +2")
        if pr.get("wait"): sc += 1; why.append("wait time published +1")
        if p.get("phone") and p.get("website"): sc += 1; why.append("phone and website +1")
        out.append({"n": p["name"], "s": " · ".join(p["_labels"]), "sub": p.get("suburb", ""), "sc": sc, "why": why})
    json.dump(out, open(os.environ["SP_SCORES"], "w"), ensure_ascii=False)
