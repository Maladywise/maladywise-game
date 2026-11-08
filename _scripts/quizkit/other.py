import json
from anat import Q

PZ = {p["date"]: p for p in json.load(open("/home/claude/maladywise-game/arrhythmix/puzzles/puzzles.json"))}


def E(date, q, case, a, w, why):
    p = PZ[date]
    assert p["answer"] == a, (date, p["answer"])
    for x in w:
        assert x in p["options"], (date, x)
    cfg = dict(p["ecg"])
    hl = p.get("highlight") or {}
    if hl.get("marks"): cfg["marks"] = hl["marks"]
    if hl.get("boxes"): cfg["boxes"] = hl["boxes"]
    d = Q(q, a, w, why)
    d.update(case=case, ecg=cfg, seed=p.get("seed") or p["date"], src=date, num=p["number"], lay=p["ecg"].get("layout"))
    return d


def G(q, case, a, w, why, cfg, seed):
    d = Q(q, a, w, why)
    d.update(case=case, ecg=cfg, seed=seed, lay=cfg.get("layout"))
    return d


ECG = dict(
    slug="ecg-quiz", emoji="💓", h1="ECG Quiz: Practice ECG Interpretation",
    title="ECG Quiz: Practice ECG Interpretation",
    desc="Free ECG quiz: 15 questions with real-style rhythm strips and a 12-lead, from SVT and VT to heart block and STEMI. Practise ECG interpretation.",
    lede="Fifteen questions: rhythm strips and a 12-lead from past Arrhythmix puzzles, plus the basics every ECG reader needs. Tap an answer to see if you’re right, and the key features light up on the trace.",
    qs=[
        G("What is this rhythm?", "A 30-year-old woman at a routine check-up. Pulse 72 and regular. Lead II rhythm strip:",
          "Normal sinus rhythm", ["Sinus bradycardia", "Junctional rhythm", "First-degree AV block"],
          "A P wave before every QRS, a normal PR interval, narrow QRS complexes and a regular rate between 60 and 100.",
          {"layout": "strip", "rhythm": {"type": "sinus", "rate": 72}, "marks": ["p", "pr"]}, "qk-nsr-1"),
        G("What is this rhythm?", "A 58-year-old man on a beta blocker feels well. Pulse 44. Lead II rhythm strip:",
          "Sinus bradycardia", ["Complete heart block", "Junctional rhythm", "Normal sinus rhythm"],
          "Every QRS has its own P wave and a normal PR interval, but the rate is under 60. Beta blockers, fitness and sleep are common causes.",
          {"layout": "strip", "rhythm": {"type": "sinus", "rate": 44}, "marks": ["p", "rr"]}, "qk-brady-2"),
        E("2026-10-19", "What is this rhythm?", "A 19-year-old woman felt her heart start pounding suddenly while bending to tie her shoelaces. She is otherwise well. Lead II rhythm strip:",
          "Supraventricular tachycardia (AVNRT)", ["Sinus tachycardia", "Atrial fibrillation", "Ventricular tachycardia"],
          "Regular, narrow and about 185 a minute with no visible P waves, starting suddenly: AV nodal re-entrant tachycardia, the commonest regular SVT."),
        E("2026-10-29", "What is this rhythm?", "A 74-year-old woman with high blood pressure and type 2 diabetes says her smartwatch keeps flagging an irregular pulse. Lead II rhythm strip:",
          "Atrial fibrillation", ["Atrial flutter with variable block", "Sinus arrhythmia", "Multifocal atrial tachycardia"],
          "Irregularly irregular, no P waves and a wavy baseline. AF raises stroke risk about five-fold, so her stroke risk needs assessing."),
        E("2026-10-26", "What is this rhythm?", "A 63-year-old man who had a heart attack two years ago has palpitations and feels light-headed. BP 92/60. Lead II rhythm strip:",
          "Ventricular tachycardia", ["Supraventricular tachycardia (AVNRT)", "Atrial flutter with 2:1 block", "Sinus tachycardia"],
          "Regular, broad and fast, with P waves marching through on their own. After a heart attack, a broad-complex tachycardia is VT until proven otherwise."),
        E("2026-10-22", "What is this rhythm?", "An 82-year-old woman feels exhausted and dizzy. Pulse 38 and regular. Lead II rhythm strip:",
          "Complete heart block", ["Second-degree AV block, Mobitz II", "Sinus bradycardia", "Junctional rhythm"],
          "P waves at about 88 a minute and broad QRS complexes at about 38, with no link between them: complete (third-degree) heart block."),
        E("2026-11-02", "What is this rhythm?", "A 34-year-old woman ran a marathon yesterday and is having a routine check. She feels well; her resting pulse is slow and a little irregular. Lead II rhythm strip:",
          "Second-degree AV block, Mobitz I (Wenckebach)", ["Second-degree AV block, Mobitz II", "First-degree AV block", "Sinus arrhythmia"],
          "The PR interval gets longer with each beat until a P wave doesn’t conduct, then resets. Often harmless in fit people with high vagal tone."),
        G("What is this rhythm?", "A 71-year-old man has had two fainting spells this week. Lead II rhythm strip:",
          "Second-degree AV block, Mobitz II", ["Second-degree AV block, Mobitz I (Wenckebach)", "Complete heart block", "Sinus arrhythmia"],
          "The PR interval stays the same, then a P wave suddenly fails to conduct. Mobitz II can progress to complete heart block and usually needs a pacemaker.",
          {"layout": "strip", "rhythm": {"type": "mobitz2", "rate": 80, "conduct": [1, 1, 1, 0]}, "marks": ["p", "pr", "dropped"]}, "qk-mob2-3"),
        G("What is this rhythm?", "A 66-year-old man collapses in a shopping centre. He is unresponsive and not breathing normally. The defibrillator shows:",
          "Ventricular fibrillation", ["Ventricular tachycardia", "Torsades de pointes", "Atrial fibrillation"],
          "Chaotic, disorganised activity with no recognisable QRS complexes. This is cardiac arrest: start CPR and defibrillate as soon as possible.",
          {"layout": "strip", "rhythm": {"type": "vf"}}, "qk-vf-4"),
        E("2026-11-05", "What does this 12-lead ECG show?", "A 63-year-old woman has had 40 minutes of heavy central chest pain spreading to her jaw. She is sweaty and nauseated. 12-lead ECG (scroll sideways inside the box on a phone):",
          "Inferior STEMI", ["Acute pericarditis", "Anterior STEMI", "Posterior MI"],
          "ST elevation in II, III and aVF with reciprocal ST depression in aVL: an inferior STEMI, usually from the right coronary artery. Call for urgent reperfusion."),
        Q("On standard ECG paper (25 mm/s), how long is one small square?", "0.04 seconds (40 ms)", ["0.02 seconds (20 ms)", "0.2 seconds (200 ms)", "0.1 seconds (100 ms)"],
          "One small square is 40 ms and one big square (five small) is 200 ms, so five big squares make one second."),
        Q("What is a normal PR interval?", "120 to 200 ms (3 to 5 small squares)", ["40 to 80 ms (1 to 2 small squares)", "200 to 300 ms (5 to 7.5 small squares)", "Over 300 ms (more than 7.5 small squares)"],
          "Longer than 200 ms (one big square) is first-degree AV block. Shorter than 120 ms raises the possibility of a pre-excitation pathway such as WPW."),
        Q("The rhythm is regular with 4 big squares between R waves. What is the heart rate?", "75 a minute", ["60 a minute", "100 a minute", "50 a minute"],
          "For a regular rhythm, rate = 300 ÷ big squares between R waves. 300 ÷ 4 = 75. For irregular rhythms, count QRS complexes in 10 seconds and multiply by 6."),
        Q("A QRS complex counts as broad when it is longer than:", "120 ms (3 small squares)", ["80 ms (2 small squares)", "200 ms (5 small squares)", "40 ms (1 small square)"],
          "Normal QRS is under about 120 ms. Broad complexes mean the impulse is travelling the slow way: bundle branch block, a ventricular rhythm, pacing or hyperkalaemia."),
        Q("Which leads look at the inferior wall of the heart?", "II, III and aVF", ["I, aVL, V5 and V6", "V1 and V2", "V3 and V4"],
          "II, III and aVF are inferior; I, aVL, V5 and V6 are lateral; V1 to V4 cover the septum and anterior wall."),
    ],
    faqs=[
        ("How do you read an ECG?", "Use the same order every time: check the patient details and calibration, then the rate, the rhythm (regular or not, P waves before every QRS?), the axis, the PR interval, the QRS width, the ST segments and T waves, and the QT interval. Finish by comparing with an old ECG if there is one."),
        ("How do you work out the heart rate from an ECG?", "For a regular rhythm, divide 300 by the number of big squares between two R waves (or 1,500 by the number of small squares). For an irregular rhythm, count the QRS complexes on a 10-second strip and multiply by 6."),
        ("What does a normal ECG look like?", "Sinus rhythm at 60 to 100 a minute, a P wave before every QRS, a PR interval of 120 to 200 ms, a narrow QRS under about 120 ms, no significant ST elevation or depression, upright T waves in most leads and a normal QTc."),
        ("Are these real ECGs?", "No. The traces are computer-generated from parameters to show the textbook features, and the cases are fictional. They’re for learning, not for interpreting a real person’s ECG."),
    ],
)

ROUNDS = [
    dict(id="prefixes", h="Round 1: Prefixes", title="Medical prefixes quiz", qs=[
        Q("What does the prefix brady- mean?", "Slow", ["Fast", "Short", "Heavy"],
          "Bradycardia is a slow heart rate (under 60 a minute). From Greek bradys, slow."),
        Q("What does the prefix tachy- mean?", "Fast", ["Slow", "Irregular", "Strong"],
          "Tachycardia is a fast heart rate; tachypnoea is fast breathing."),
        Q("What does hyper- mean?", "Above or excessive", ["Below or deficient", "Beside", "Within"],
          "Hypertension is high blood pressure; hyperglycaemia is too much glucose in the blood."),
        Q("What does hypo- mean?", "Below or deficient", ["Above or excessive", "Around", "After"],
          "Hypoglycaemia is low blood glucose; hypothyroidism is an underactive thyroid."),
        Q("Which prefix means difficult, painful or abnormal?", "dys-", ["dia-", "di-", "dis-"],
          "Dyspnoea is difficult breathing; dysphagia is difficulty swallowing; dysuria is painful urination."),
        Q("Which prefix means around?", "peri-", ["para-", "pre-", "post-"],
          "The pericardium is the sac around the heart; perioral means around the mouth. Para- means beside."),
        Q("What does endo- mean?", "Within or inside", ["Outside", "Through", "Against"],
          "Endoscopy looks inside the body; the endometrium lines the inside of the uterus."),
        Q("What does poly- mean?", "Many or much", ["Few", "Half", "Equal"],
          "Polyuria is passing a lot of urine; polycystic means many cysts."),
        Q("What does the prefix a- (or an-) mean?", "Without or absence of", ["Towards", "Again", "Double"],
          "Anaemia is literally ‘without blood’ (really, too little haemoglobin); apnoea means no breathing."),
        Q("Which prefix means half?", "hemi-", ["hyper-", "bi-", "uni-"],
          "Hemiplegia is paralysis of one half of the body. Semi- means half too (semilunar valves); bi- means two and uni- one."),
    ]),
    dict(id="suffixes", h="Round 2: Suffixes", title="Medical suffixes quiz", qs=[
        Q("What does the suffix -itis mean?", "Inflammation", ["Disease", "Infection only", "Tumour"],
          "Appendicitis, arthritis, tonsillitis. Inflammation can have many causes, not just infection."),
        Q("What does -ectomy mean?", "Surgical removal", ["Cutting into", "Making an opening", "Surgical repair"],
          "Appendicectomy (appendectomy in the US) removes the appendix; mastectomy removes a breast."),
        Q("What does -otomy mean?", "Cutting into (incision)", ["Removal", "Permanent opening", "Viewing"],
          "A laparotomy is cutting into the abdomen; a tracheotomy is an incision into the trachea."),
        Q("What does -ostomy mean?", "A surgically made opening", ["Cutting out", "Stitching", "Crushing"],
          "A colostomy brings the colon out through an opening in the abdominal wall. Add ‘-ectomy’ and ‘-otomy’ and you have the surgical trio."),
        Q("Which suffix means pain?", "-algia", ["-plegia", "-pathy", "-trophy"],
          "Neuralgia is nerve pain; myalgia is muscle pain. -dynia also means pain, as in coccydynia."),
        Q("What does -megaly mean?", "Enlargement", ["Shrinking", "Hardening", "Softening"],
          "Splenomegaly is an enlarged spleen; cardiomegaly is an enlarged heart."),
        Q("What does -penia mean?", "Deficiency or lack", ["Excess", "Destruction", "Swelling"],
          "Neutropenia is too few neutrophils; osteopenia is lower than normal bone density."),
        Q("What does -plasty mean?", "Surgical repair or reshaping", ["Removal", "Paralysis", "Formation of a tumour"],
          "Rhinoplasty reshapes the nose; angioplasty widens a narrowed blood vessel."),
        Q("What does -scopy mean?", "Looking inside with an instrument", ["Recording a trace", "Measuring", "Cutting into"],
          "Colonoscopy, arthroscopy, bronchoscopy. -graphy means recording, as in electrocardiography."),
        Q("What does -aemia (US: -emia) mean?", "A condition of the blood", ["Vomiting", "Flow or discharge", "Swelling"],
          "Hyperkalaemia is high blood potassium; septicaemia is infection in the blood."),
    ]),
    dict(id="roots", h="Round 3: Word roots", title="Medical word roots quiz", qs=[
        Q("Which organ does the root hepat/o refer to?", "Liver", ["Heart", "Kidney", "Spleen"],
          "Hepatitis is inflammation of the liver; hepatomegaly is an enlarged liver."),
        Q("Which organ does nephr/o refer to?", "Kidney", ["Nerve", "Lung", "Bladder"],
          "Nephritis is kidney inflammation. Ren/o (as in renal) also means kidney, from Latin."),
        Q("Which root means heart?", "cardi/o", ["cephal/o", "carcin/o", "cost/o"],
          "Cardiology, cardiomyopathy. Cephal/o means head; carcin/o means cancer; cost/o means rib."),
        Q("What does oste/o mean?", "Bone", ["Joint", "Muscle", "Ear"],
          "Osteoporosis is porous bone. Arthr/o is joint, my/o is muscle and ot/o is ear."),
        Q("What does dermat/o (or derm/o) mean?", "Skin", ["Tooth", "Fat", "Hair"],
          "Dermatitis is skin inflammation. Dent/o is tooth, lip/o is fat, trich/o is hair."),
        Q("What does gastr/o mean?", "Stomach", ["Gut in general", "Gallbladder", "Oesophagus"],
          "Gastritis is inflammation of the stomach lining. Enter/o is the intestine."),
        Q("What does haem/o (US: hem/o) mean?", "Blood", ["Liver", "Half", "Water"],
          "Haematology, haemorrhage. Hem- with no ‘a’ is the US spelling; hemi- means half."),
        Q("What does encephal/o mean?", "Brain", ["Spinal cord", "Head", "Nerve"],
          "Encephalitis is inflammation of the brain. Neur/o is nerve; myel/o can mean spinal cord or bone marrow."),
        Q("What is a cholecystectomy?", "Removal of the gallbladder", ["Removal of the bladder", "Cutting into the bile duct", "Inflammation of the gallbladder"],
          "Chole (bile) + cyst (sac or bladder) + ectomy (removal). Inflammation would be cholecystitis."),
        Q("What does pneum/o (or pneumon/o) mean?", "Lung or air", ["Kidney", "Throat", "Nose"],
          "Pneumonia is lung infection; a pneumothorax is air in the chest outside the lung. Pulmon/o also means lung."),
    ]),
]

TERMS = dict(
    slug="medical-terminology-quiz", emoji="📚", h1="Medical Terminology Quiz",
    title="Medical Terminology Quiz: Prefixes and Suffixes",
    desc="Free medical terminology quiz: three 10-question rounds on prefixes, suffixes and word roots, plus a quick list of common medical prefixes and suffixes.",
    lede="Three rounds of ten: prefixes, suffixes and word roots. Learn the parts and you can decode almost any medical word. Tap an answer to see if you’re right. A cheat sheet is at the bottom.",
    rounds=ROUNDS,
    ref=[
        ("Common medical prefixes", [
            ("a-, an-", "without, absence of (apnoea, anaemia)"), ("anti-", "against (antibiotic)"), ("brady-", "slow (bradycardia)"),
            ("tachy-", "fast (tachycardia)"), ("dys-", "difficult, painful, abnormal (dyspnoea)"), ("endo-", "within (endoscopy)"),
            ("epi-", "upon, above (epidermis)"), ("hemi-", "half (hemiplegia)"), ("hyper-", "above, excessive (hypertension)"),
            ("hypo-", "below, deficient (hypoglycaemia)"), ("inter-", "between (intercostal)"), ("intra-", "within (intravenous)"),
            ("micro-", "small (microcytic)"), ("macro-", "large (macrocytic)"), ("neo-", "new (neonate)"),
            ("para-", "beside, abnormal (paramedian, paraesthesia)"), ("peri-", "around (pericardium)"), ("poly-", "many (polyuria)"),
            ("post-", "after (postoperative)"), ("pre-", "before (premenstrual)"), ("sub-", "under (subcutaneous)"),
            ("trans-", "across, through (transdermal)")]),
        ("Common medical suffixes", [
            ("-aemia", "blood condition (hyperkalaemia)"), ("-algia", "pain (myalgia)"), ("-centesis", "puncture to remove fluid (amniocentesis)"),
            ("-ectomy", "surgical removal (appendicectomy)"), ("-gram", "the record or image (angiogram)"), ("-graphy", "the process of recording (mammography)"),
            ("-itis", "inflammation (tonsillitis)"), ("-logy", "study of (cardiology)"), ("-lysis", "breaking down (haemolysis)"),
            ("-megaly", "enlargement (splenomegaly)"), ("-oma", "tumour or swelling (lipoma)"), ("-osis", "abnormal condition (fibrosis)"),
            ("-ostomy", "surgically made opening (colostomy)"), ("-otomy", "cutting into (laparotomy)"), ("-pathy", "disease (neuropathy)"),
            ("-penia", "deficiency (neutropenia)"), ("-plasty", "surgical repair (rhinoplasty)"), ("-plegia", "paralysis (paraplegia)"),
            ("-pnoea", "breathing (dyspnoea)"), ("-rrhoea", "flow, discharge (diarrhoea)"), ("-scopy", "looking inside (colonoscopy)"),
            ("-uria", "urine condition (haematuria)")]),
        ("Common word roots", [
            ("arthr/o", "joint"), ("cardi/o", "heart"), ("cephal/o", "head"), ("chole", "bile"), ("cyst/o", "bladder, sac"),
            ("derm/o, dermat/o", "skin"), ("encephal/o", "brain"), ("enter/o", "intestine"), ("gastr/o", "stomach"), ("haem/o, haemat/o", "blood"),
            ("hepat/o", "liver"), ("my/o", "muscle"), ("nephr/o, ren/o", "kidney"), ("neur/o", "nerve"), ("oste/o", "bone"),
            ("ot/o", "ear"), ("ophthalm/o", "eye"), ("pneum/o, pulmon/o", "lung, air"), ("rhin/o", "nose"), ("vas/o, angi/o", "vessel")]),
    ],
    faqs=[
        ("What is the fastest way to learn medical terminology?", "Learn the building blocks rather than whole words. About 100 common prefixes, suffixes and roots unlock thousands of terms: hepat (liver) + itis (inflammation) = hepatitis. Break every new word into parts, and quiz yourself little and often."),
        ("What is the difference between a prefix, a suffix and a root?", "The root carries the core meaning, usually a body part (cardi = heart). A prefix goes in front and changes the meaning (tachy = fast), and a suffix goes on the end, often naming a condition or procedure (-ectomy = removal). Tachycardia = fast + heart + condition."),
        ("Why do some medical words have two spellings?", "British, Australian and most Commonwealth English keep the Greek-derived ‘ae’ and ‘oe’: haemoglobin, anaemia, oesophagus, diarrhoea. American English simplifies them: hemoglobin, anemia, esophagus, diarrhea. Both are correct in their own countries."),
        ("What are combining vowels?", "Usually an ‘o’ that links a root to another part to make a word easier to say: gastr + o + scopy = gastroscopy. It’s generally dropped before a suffix starting with a vowel: gastr + itis = gastritis."),
    ],
)
