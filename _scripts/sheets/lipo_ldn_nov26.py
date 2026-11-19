# Lipoedema fact sheet and low-dose naltrexone (LDN) medicine guide (Nov 2026, owner's request)
BH_LIPO = ("Better Health Channel (Vic): Lipoedema", "https://www.betterhealth.vic.gov.au/health/conditionsandtreatments/lipoedema")

fact("lipoedema",
 "Lipoedema: Painful Fat in the Legs and Arms That Diet Doesn’t Shift",
 "Lipoedema: symmetrical, painful fat on the legs (and often arms) in women, sparing the feet. How it differs from obesity and lymphoedema, stages, and what helps.",
 "Lipoedema", "lipoedema",
 "A long-term condition where fat builds up in a symmetrical, often painful way on the legs, hips and sometimes arms, almost always in women. The feet and hands are spared. It isn’t caused by overeating, and dieting shrinks the rest of the body much more than the affected areas.",
 h2("What it looks and feels like", [
   "<b>Both legs</b> (and often both arms) enlarged in the same way, out of proportion to the waist and upper body.",
   "The <b>feet and hands are spared</b>, so there’s a ‘cuff’ or ‘bracelet’ of fat just above the ankles or wrists.",
   "The fat is often <b>tender or painful</b> to touch or pressure, and <b>bruises easily</b>.",
   "Legs feel heavy and achy, worse later in the day, after standing, and in hot weather.",
   "Skin may feel cool, soft or lumpy, with small spider veins."]) +
 h2("Who gets it", [
   "Almost only women. It usually starts or worsens with hormone changes: <b>puberty, pregnancy or menopause</b>.",
   "It often runs in families.",
   "It affects people of every size, including slim people. How common it is isn’t known: estimates range from under 1% to about 1 in 10 women, because it’s often missed or mislabelled as obesity."]) +
 h2("Lipoedema, obesity or lymphoedema?", [
   "<b>Obesity:</b> fat is spread across the body, including the feet, and usually isn’t painful. It shrinks with weight loss.",
   "<b>Lymphoedema:</b> fluid swelling, usually one-sided at first, and it <b>includes the foot</b> (you can’t pinch the skin on top of the second toe).",
   "<b>Lipoedema:</b> symmetrical, spares the feet, tender, bruises easily, and resists dieting.",
   "They can overlap: many people with lipoedema also have obesity, and late lipoedema can damage lymph drainage (lipo-lymphoedema)."]) +
 h2("Stages", [
   "<b>Stage 1:</b> smooth skin, soft fat with small nodules.",
   "<b>Stage 2:</b> uneven, dimpled skin with larger lumps.",
   "<b>Stage 3:</b> large, overhanging lobes of fat, especially around the thighs and knees.",
   "Some add a stage 4 for lipoedema with lymphoedema. Not everyone progresses."]) +
 h2("Diagnosis", [
   "There’s no blood test or scan for it. Diagnosis is clinical: the history, the shape, the spared feet and the tenderness.",
   "Your GP may check for other causes of leg swelling (heart, kidney, liver, thyroid, veins, medicines) and refer to a lymphoedema therapist, vascular or plastic surgeon."]) +
 h2("What helps", [
   "<b>Compression garments</b> fitted by a trained therapist: often ease pain, heaviness and swelling.",
   "<b>Movement</b>, especially in water (swimming, aqua aerobics, walking in a pool): the water pressure acts like compression.",
   "<b>Manual lymphatic drainage</b> (a gentle massage technique): some find it eases symptoms; evidence is limited.",
   "<b>Weight management</b> helps the non-lipoedema fat and protects joints, even though lipoedema fat itself resists diets. Crash dieting isn’t recommended.",
   "<b>Liposuction</b> (special lymph-sparing techniques) can reduce pain, bruising and improve mobility in selected people when other measures haven’t worked. It isn’t a cure, compression is usually still needed, and it can be costly.",
   "Look after mental health too: years of being told to ‘just lose weight’ take a toll."]) +
 h2("See your GP if", [
   "Your legs or arms are enlarging in a symmetrical, painful way that doesn’t match the rest of your body.",
   "New swelling of one leg, especially with pain, redness or warmth (rule out a clot), or swelling that now includes the feet."]),
 [("Is lipoedema just obesity?", "No. Lipoedema fat is symmetrical, spares the feet and hands, is often tender and bruises easily, and doesn’t shrink much with dieting. Some people have both."),
  ("Can you lose lipoedema fat by dieting?", "Not much. Diet and exercise reduce other body fat and help symptoms and fitness, but lipoedema fat tends to stay. Compression and, for some, specialised liposuction help more."),
  ("What causes lipoedema?", "The cause isn’t fully known. It runs in families and starts with hormone changes, so genes and oestrogen are thought to play a part."),
  ("Is lipoedema the same as lymphoedema?", "No. Lymphoedema is fluid build-up and usually includes the foot. Late lipoedema can damage the lymph system and lead to both (lipo-lymphoedema).")],
 [BH_LIPO + ("Plain-English overview with Australian support links. Free.",)],
 [BH_LIPO,
  ("RACGP check: Lipoedema (2025)", "https://www.racgp.org.au/check/check-issues/2025-1/lipoedema"),
  ("Lipedema World Alliance: Delphi consensus position paper on definition and management", "https://www.sochob.cl/web1/wp-content/uploads/2026/01/Lipedema-World-Alliance-Delphi-Consensus-Based-Position-Paper-on-the-Definition-and-Management-of-Lipedema.pdf")],
 [("Varicose veins", "/varicose-veins/"), ("Chronic pain", "/chronic-pain/"), ("Weight", "/weight/")],
 groups=["Women’s health", "Skin"], blurb="Painful, symmetrical fat on legs and arms that spares the feet and resists dieting.",
 search="lipoedema lipedema painful fat legs thighs arms women sparing feet cuff sign bruising compression liposuction lymphoedema obesity")

V, C, U, R, VR = ("v", "Very common", "more than 1 in 10"), ("c", "Common", "1 in 10 to 1 in 100"), ("u", "Uncommon", "1 in 100 to 1 in 1,000"), ("r", "Rare", "1 in 1,000 to 1 in 10,000"), ("vr", "Very rare", "fewer than 1 in 10,000")
def g(t, items): return (t[0], t[1], t[2], items)

med("low-dose-naltrexone", "Low-Dose Naltrexone (LDN): Uses, Evidence and Side Effects",
 "Low-dose naltrexone (LDN) explained: how it’s thought to work, the evidence for fibromyalgia, Crohn’s, long COVID and pain, side effects, opioid warnings and cost in Australia.",
 "Low-dose naltrexone (LDN)", "Low-dose naltrexone",
 [("m", "Opioid receptor blocker, tiny dose"), ("l", "Prescription only (S4), compounded")],
 "Naltrexone at about a tenth of the usual dose, made up by compounding pharmacies. Popular for fibromyalgia, chronic pain and other conditions, with promising small studies but mixed results in bigger trials.",
 "Naltrexone is approved at 50 mg to treat alcohol and opioid dependence. At low doses (usually 1 to 4.5 mg at night) it’s used off label for fibromyalgia, chronic pain, Crohn’s disease, long COVID, ME/CFS and other conditions. It’s cheap and usually well tolerated, but the evidence is still early, and it blocks opioid painkillers.",
 [("For", "Off label only: fibromyalgia, chronic pain, Crohn’s disease, long COVID, ME/CFS, CRPS and others"),
  ("Works", "Mixed: some small trials positive; a 2023 Danish trial in about 100 women with fibromyalgia (6 mg) found no benefit over placebo"),
  ("Cost", "Not on the PBS for low-dose use. Compounded, typically a few dollars a day (varies by pharmacy)"),
  ("Kicks in", "Usually judged after 2–3 months"),
  ("Dose", "A common plan: 1.5 mg at night for a week, 3 mg the next week, then 4.5 mg"),
  ("Watch for", "Vivid dreams, poor sleep, nausea and tummy upset. Check with your doctor if you take opioids")],
 "Cheap, gentle and hopeful, but the big trials haven’t caught up with the hype yet.",
 ["Compounded low-dose naltrexone (no TGA-registered low-dose product). Full-dose brands: Revia and generics (50 mg)"],
 "At full dose, naltrexone blocks opioid receptors. At low doses it’s thought to work differently: a brief overnight block may lead the body to make more of its own endorphins, and it may calm overactive immune cells in the nervous system (microglia) through a receptor called TLR4. Both ideas are still being tested.",
 ["Fibromyalgia: a 2023 review in the RACGP’s journal (AJGP) found small studies (8 to 31 people each) all reporting less pain, and called the evidence preliminary. A larger 2023 randomised trial (Lancet Rheumatology, 6 mg) then found no difference from placebo",
  "Crohn’s disease: a Cochrane review found too little evidence to be sure it helps",
  "Long COVID and ME/CFS: mostly observational reports; randomised trials are under way",
  "Chronic pain, CRPS and multiple sclerosis symptoms: small studies with mixed results",
  "Used only off label and usually after standard treatments"],
 "Usually mild and often settle within a couple of weeks. Taking it in the morning can help if dreams or sleep are a problem.",
 [g(C, ["Vivid dreams", "Trouble sleeping", "Nausea", "Tummy pain, diarrhoea or constipation", "Headache"]),
  g(U, ["Anxiety or irritability", "Dizziness", "Stomach upset"]),
  g(R, ["<b>Liver problems</b> (mostly reported at full doses)"])],
 ["Severe stomach pain, yellow skin or eyes, or dark urine", "Withdrawal symptoms if you take opioids (sweating, shaking, vomiting, agitation)", "Signs of an allergic reaction"],
 ["<b>Opioids</b> (codeine, tramadol, oxycodone, morphine and others): LDN can weaken their pain relief and upset the gut. Full withdrawal is unlikely at low doses but possible, so only combine them if your doctor plans it.",
  "Tell any doctor, dentist or hospital you take it, especially before surgery.",
  "Use the same compounding pharmacy for consistent doses.",
  "Take it at bedtime; switch to the morning if dreams or sleep are a problem.", "Give it a fair trial (about 3 months), then review with your doctor whether it’s worth continuing."],
 [("What is low-dose naltrexone used for?", "It’s used off label for fibromyalgia, chronic pain, Crohn’s disease, long COVID, ME/CFS and some other conditions. It isn’t TGA-approved for any of these."),
  ("Does LDN work for fibromyalgia?", "Small early studies looked promising, but a larger randomised trial in 2023 found no benefit over placebo. Some people still report it helps; the evidence is mixed."),
  ("Can I take LDN with opioid painkillers?", "Only if your doctor plans it. Naltrexone blocks opioid receptors, so pain relief may be weaker and gut side effects more likely; withdrawal is unlikely at low doses but possible."),
  ("How much does LDN cost in Australia?", "It isn’t on the PBS at low doses, so you pay the compounding pharmacy’s private price, typically a few dollars a day.")],
 [("Aitcheson N, Lin Z, Tynan K. Low-dose naltrexone in the treatment of fibromyalgia: systematic review (AJGP, RACGP, 2023)", "https://www1.racgp.org.au/getattachment/825cf3ce-fb4c-4fb7-ba64-e071e970579a/Low-dose-naltrexone-in-the-treatment-of-fibromyalg.aspx"),
  ("Bruun KD et al. Naltrexone 6 mg vs placebo in women with fibromyalgia (Lancet Rheumatology, 2023)", "https://www.themednet.org/publications/naltrexone-6-mg-once-daily-versus-placebo-in-women-with-fibromyalgia-a-randomised-double-blind-placebo-controlled-trial"),
  ("Cochrane: Low dose naltrexone for induction of remission in Crohn’s disease", "https://cochranelibrary.com/cdsr/doi/10.1002/14651858.CD010410.pub3/information"),
  ("ClinicalTrials.gov: The FINAL study (fibromyalgia and naltrexone)", "https://clinicaltrials.gov/study/NCT04270877")],
 [("Fibromyalgia", "/fibromyalgia/"), ("Chronic pain", "/chronic-pain/"), ("ME/CFS", "/chronic-fatigue-syndrome/"), ("Long COVID", "/long-covid/")])
