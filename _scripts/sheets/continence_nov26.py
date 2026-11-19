# Incontinence types + bladder/prostate medicines (19 Nov 2026, owner's request).
V, C, U, R, VR = ("v", "Very common", "more than 1 in 10"), ("c", "Common", "1 in 10 to 1 in 100"), ("u", "Uncommon", "1 in 100 to 1 in 1,000"), ("r", "Rare", "1 in 1,000 to 1 in 10,000"), ("vr", "Very rare", "fewer than 1 in 10,000")
def g(t, items): return (t[0], t[1], t[2], items)
PBS = "https://www.pbs.gov.au/pbs/search?term="
CHA = ("Continence Health Australia", "https://www.continence.org.au/")
HL = "National Continence Helpline: 1800 33 00 66 (free)"
COST = ("Cost", "PBS: up to $25 a script ($7.70 concession)")

fact("incontinence",
 "Types of Incontinence: Stress, Urge, Overflow, Functional and Bowel",
 "The types of urinary incontinence explained: stress, urge (overactive bladder), mixed, overflow and functional, plus bowel leakage. How to tell them apart and what treats each.",
 "Types of incontinence", "incontinence",
 "Leaking isn’t a normal part of ageing, having babies or being a man over 60. Working out which type you have matters, because the treatments are different, and most people improve.",
 h2("The main types", [
   "<b>Stress incontinence</b>: leaks with coughing, sneezing, laughing, lifting or exercise. Weak pelvic floor or urethral support. Common after childbirth and menopause. See <a href=\"/stress-incontinence/\">stress incontinence</a>.",
   "<b>Urge incontinence (overactive bladder)</b>: a sudden, strong urge, then leaking before reaching the toilet; often frequency and getting up at night. See <a href=\"/overactive-bladder/\">overactive bladder</a>.",
   "<b>Mixed</b>: both stress and urge; treat the more bothersome one first.",
   "<b>Overflow</b>: the bladder doesn’t empty, so it dribbles; weak stream, straining. Common with an enlarged prostate, constipation, diabetes or some medicines. See <a href=\"/overflow-incontinence/\">overflow incontinence</a>.",
   "<b>Functional</b>: the bladder works but getting to the toilet is the problem: mobility, arthritis, dementia, distance.",
   "<b>Bowel (faecal) leakage</b>: common, under-reported, and often helped by treating constipation or diarrhoea and pelvic floor training."]) +
 h2("Helpful first steps", [
   "Keep a 3-day bladder diary: how much you drink, when you pass urine and when you leak.",
   "See your GP for a urine test, examination and, for some, a scan of how well the bladder empties.",
   "Continence physiotherapists and continence nurses are the specialists for most types.",
   "Treat constipation, cough and weight; review medicines (diuretics, sedatives, anticholinergics)."]) +
 h2("Where to get help", [HL, "Your GP, a continence physio or continence nurse"]),
 [("What are the types of urinary incontinence?", "Stress (leaks with cough or exercise), urge (sudden urge then leak), mixed, overflow (bladder doesn’t empty) and functional (trouble getting to the toilet)."),
  ("Is incontinence a normal part of ageing?", "No. It’s common, but most people can improve or be cured with the right treatment."),
  ("Who treats incontinence?", "Start with your GP. Continence physiotherapists and nurses treat most people; urologists and urogynaecologists help when needed.")],
 [CHA + ("Free helpline and continence resources.",)],
 [CHA],
 [("Bladder leaks", "/bladder-leaks/"), ("Stress incontinence", "/stress-incontinence/"), ("Overactive bladder", "/overactive-bladder/"), ("Overflow incontinence", "/overflow-incontinence/")],
 groups=["Women's health", "Men's health"], blurb="Stress, urge, mixed, overflow, functional and bowel leakage: how to tell them apart.",
 search="incontinence types urinary incontinence stress urge mixed overflow functional faecal incontinence bowel leakage bladder diary")

fact("stress-incontinence",
 "Stress Incontinence: Leaking When You Cough, Sneeze or Exercise",
 "Stress urinary incontinence explained: why it happens, pelvic floor muscle training that works, pessaries, and surgery options (including the mesh history in Australia).",
 "Stress incontinence", "stress incontinence",
 "Leaking when you cough, sneeze, laugh, jump or lift. It’s very common, especially after childbirth and menopause, and supervised pelvic floor training cures or improves most people.",
 h2("Why it happens", [
   "The pelvic floor muscles and tissues that support the urethra are weakened or stretched.",
   "Risks: pregnancy and vaginal birth, menopause, chronic cough, constipation and straining, obesity, heavy lifting, high-impact sport.",
   "In men, it’s most often after prostate surgery."]) +
 h2("Treatment", [
   "<b>Pelvic floor muscle training</b>, ideally supervised by a continence physiotherapist, for at least 3 months: the first-line treatment, with good evidence.",
   "Lose weight if overweight; treat cough and constipation.",
   "<b>Vaginal pessaries</b> or continence devices support the urethra, handy for exercise.",
   "Vaginal oestrogen may help tissue health after menopause.",
   "<b>Surgery</b> if conservative treatment fails: colposuspension, autologous fascial sling, urethral bulking injections, or a mid-urethral sling. Transvaginal mesh for prolapse was removed in Australia in 2017–18; mid-urethral slings for stress incontinence remain available with stricter consent and credentialing. Discuss risks carefully."]) +
 h2("When to see a doctor", ["Leaks are bothering you or stopping you exercising", "Blood in the urine, pain, or recurrent UTIs", "A bulge or dragging feeling in the vagina (possible prolapse)"]) +
 h2("Where to get help", [HL]),
 [("Can pelvic floor exercises cure stress incontinence?", "For many people, yes. Supervised training for at least 3 months cures or greatly improves most mild to moderate stress incontinence."),
  ("Is mesh still used for incontinence in Australia?", "Transvaginal mesh for prolapse was removed in 2017–18. Mid-urethral slings for stress incontinence are still available, with stricter consent rules, alongside non-mesh operations."),
  ("Does stress incontinence get worse with age?", "It can, especially after menopause, but pelvic floor training helps at any age.")],
 [CHA + ("Pelvic floor resources and the National Continence Helpline.",)],
 [CHA],
 [("Types of incontinence", "/incontinence/"), ("Bladder leaks", "/bladder-leaks/"), ("Vaginal oestrogen", "/medicines/vaginal-oestrogen/")],
 groups=["Women's health"], blurb="Leaks with cough or exercise, pelvic floor training, pessaries and surgery.",
 search="stress incontinence leaking cough sneeze exercise pelvic floor exercises kegels pessary sling surgery mesh colposuspension")

fact("overactive-bladder",
 "Overactive Bladder: Urgency, Frequency and Urge Leaks",
 "Overactive bladder (urge incontinence) explained: sudden urges, frequency and night-time urination, bladder training, caffeine, medicines (oxybutynin, solifenacin, mirabegron), Botox and nerve stimulation.",
 "Overactive bladder", "overactive bladder",
 "A sudden, hard-to-delay urge to pass urine, often with frequent trips and getting up at night, sometimes with leaks. Bladder training helps most people; medicines and other options help the rest.",
 h2("Symptoms", ["Urgency: a sudden compelling need to go", "Frequency: more than about 8 times a day", "Night-time urination (nocturia)", "Urge leaks before reaching the toilet"]) +
 h2("Check first", ["A urine test to rule out infection or blood", "Diabetes, constipation, and medicines like diuretics", "In men, prostate enlargement; in anyone, incomplete bladder emptying"]) +
 h2("Treatment", [
   "<b>Bladder training</b>: gradually stretching the time between toilet visits over 6 weeks or more.",
   "Cut back caffeine, fizzy drinks and alcohol; drink steadily rather than in large amounts; reduce evening fluids.",
   "Pelvic floor exercises to help suppress urges.",
   "<b>Medicines</b>: anticholinergics (oxybutynin, solifenacin) or beta-3 agonists (mirabegron, vibegron). See <a href=\"/medicines/overactive-bladder-medicines/\">bladder medicines</a>.",
   "Vaginal oestrogen after menopause.",
   "Specialist options: <b>botulinum toxin injections</b> into the bladder, and nerve stimulation (tibial or sacral)."]) +
 h2("Where to get help", [HL]),
 [("What causes an overactive bladder?", "Often no single cause is found. The bladder muscle contracts before it’s full. Caffeine, alcohol, UTIs, constipation, menopause and some nerve conditions can contribute."),
  ("What is bladder training?", "A program of gradually holding on for longer between toilet visits, usually over 6 weeks or more, to retrain the bladder."),
  ("What if tablets don’t work?", "Botox injections into the bladder or nerve stimulation can help. Ask about a referral to a urologist or urogynaecologist.")],
 [CHA + ("Bladder training guides and the helpline.",)],
 [CHA],
 [("Overactive bladder medicines", "/medicines/overactive-bladder-medicines/"), ("Types of incontinence", "/incontinence/"), ("UTI", "/uti/")],
 groups=["Women's health", "Men's health"], blurb="Urgency, frequency and urge leaks: bladder training, medicines and more.",
 search="overactive bladder urge incontinence urgency frequency nocturia bladder training oxybutynin solifenacin mirabegron botox")

fact("overflow-incontinence",
 "Overflow Incontinence: Dribbling and a Bladder That Won't Empty",
 "Overflow incontinence explained: dribbling, weak stream and incomplete emptying from an enlarged prostate, constipation, diabetes, nerve problems or medicines, and how it's treated.",
 "Overflow incontinence", "overflow incontinence",
 "When the bladder can’t empty properly, it stays full and overflows in dribbles. It’s more common in men with an enlarged prostate, and in anyone with nerve damage, severe constipation or certain medicines.",
 h2("Symptoms", ["Constant or frequent dribbling", "Weak or slow stream, straining, stopping and starting", "Feeling the bladder never empties", "Frequent small amounts, getting up at night", "Recurrent UTIs"]) +
 h2("Causes", ["Enlarged prostate or urethral narrowing", "Severe constipation pressing on the bladder outlet", "Nerve damage: diabetes, spinal problems, multiple sclerosis", "Medicines: anticholinergics, some antidepressants, opioids, decongestants", "After surgery or anaesthesia"]) +
 h2("Treatment", [
   "A bladder scan after passing urine shows how much is left behind.",
   "Treat the cause: prostate medicines (tamsulosin, dutasteride) or surgery, treat constipation, review medicines.",
   "Catheters: intermittent self-catheterisation is often the most effective and freeing option for long-term poor emptying.",
   "Sudden inability to pass urine with pain is an emergency."]) +
 h2("Where to get help", [HL]),
 [("What is overflow incontinence?", "Leaking because the bladder doesn’t empty properly, so it overflows, usually as dribbling."),
  ("Is overflow incontinence dangerous?", "Long-term retention can cause infections and, rarely, kidney damage. Sudden painful inability to pass urine needs urgent care."),
  ("How is it treated?", "By treating the cause (prostate, constipation, medicines) and sometimes with intermittent self-catheterisation.")],
 [CHA + ("Information and the helpline.",)],
 [CHA],
 [("Enlarged prostate", "/enlarged-prostate/"), ("Tamsulosin", "/medicines/tamsulosin/"), ("Duodart", "/medicines/duodart/"), ("Types of incontinence", "/incontinence/")],
 groups=["Men's health"], blurb="Dribbling from a bladder that won't empty: causes and treatment.",
 search="overflow incontinence dribbling urinary retention incomplete emptying enlarged prostate catheter self-catheterisation weak stream")

med("duodart", "Duodart (Dutasteride and Tamsulosin): Enlarged Prostate Combination",
 "Duodart explained: dutasteride plus tamsulosin for an enlarged prostate, how it lowers the risk of urinary retention and surgery, sexual side effects, PSA halving and handling precautions.",
 "Duodart (dutasteride and tamsulosin)", "Duodart",
 [("s", "5-alpha reductase inhibitor + alpha blocker"), ("l", "Prescription only (S4)")],
 "Two prostate medicines in one capsule: tamsulosin eases flow quickly, dutasteride slowly shrinks the prostate. Best for larger prostates.",
 "Duodart combines dutasteride 0.5 mg and tamsulosin 0.4 mg. In the CombAT trial, the combination lowered the risk of acute urinary retention or prostate surgery by about two-thirds compared with tamsulosin alone over 4 years. Dutasteride takes months to work and halves PSA readings.",
 [("For", "Moderate to severe urinary symptoms with an enlarged prostate"),
  ("Works", "Better symptom relief and fewer retention episodes and operations than either alone"),
  COST,
  ("Kicks in", "Flow within weeks (tamsulosin); prostate shrinks over 6 months (dutasteride)"),
  ("Dose", "One capsule daily, 30 minutes after the same meal each day"),
  ("Watch for", "Dizziness on standing, lower libido, erection or ejaculation changes")],
 "Quick relief plus slow shrink.",
 ["Duodart; dutasteride alone: Avodart"],
 "Dutasteride blocks conversion of testosterone to DHT, shrinking the prostate; tamsulosin relaxes prostate and bladder neck muscle.",
 ["Benign prostatic hyperplasia with moderate to severe symptoms and an enlarged prostate"],
 "Side effects come from both parts.",
 [g(C, ["Dizziness, especially standing up", "<b>Reduced or absent ejaculate</b>", "Lower libido, erectile difficulties", "Breast tenderness or enlargement"]), g(U, ["Low mood"]), g(R, ["<b>Floppy iris syndrome</b> during cataract surgery", "Prolonged erection"])],
 ["Unable to pass urine", "Breast lump or nipple discharge", "Fainting"],
 ["Dutasteride roughly halves PSA: your doctor doubles the reading to interpret it.", "Women and children shouldn’t handle leaking capsules (dutasteride is absorbed through skin).", "Don’t donate blood during treatment and for 6 months after.", "Tell your eye surgeon before cataract surgery."],
 [("How long does Duodart take to work?", "Tamsulosin helps flow within weeks; dutasteride shrinks the prostate over about 6 months."),
  ("Does Duodart affect PSA?", "Yes. Dutasteride halves PSA, so results are doubled for interpretation."),
  ("Why not just take tamsulosin?", "For larger prostates, adding dutasteride lowers the risk of urinary retention and surgery.")],
 [("Healthy Male", "https://www.healthymale.org.au/"), ("PBS: Dutasteride with tamsulosin", PBS + "dutasteride")],
 [("Enlarged prostate", "/enlarged-prostate/"), ("Tamsulosin", "/medicines/tamsulosin/"), ("Finasteride", "/medicines/finasteride/")])

med("prazosin", "Prazosin (Minipress): Blood Pressure, Prostate and Nightmares",
 "Prazosin explained: an alpha blocker for blood pressure, enlarged prostate symptoms, Raynaud's and PTSD nightmares, the first-dose fainting warning, and how to start it safely.",
 "Prazosin", "Prazosin",
 [("s", "Alpha-1 blocker"), ("l", "Prescription only (S4)")],
 "An older alpha blocker, now mostly used at night for prostate symptoms, Raynaud’s or trauma nightmares. The first dose can make you faint, so start low at bedtime.",
 "Prazosin relaxes blood vessels and the muscle around the prostate. It treats high blood pressure (less often now), urinary symptoms from an enlarged prostate, Raynaud’s phenomenon and, off-label, PTSD-related nightmares, where trial results are mixed.",
 [("For", "High blood pressure, enlarged prostate symptoms, Raynaud’s, PTSD nightmares (off-label)"),
  ("Works", "Effective for blood pressure and prostate flow; mixed evidence for nightmares"),
  COST,
  ("Kicks in", "Hours for blood pressure; days to weeks for symptoms"),
  ("Dose", "Start 0.5 mg at bedtime, increase slowly"),
  ("Watch for", "Dizziness or fainting (especially the first dose), headache, stuffy nose")],
 "Start low, start lying down.",
 ["Minipress, Pratsiol"],
 "It blocks alpha-1 receptors on blood vessel and prostate smooth muscle, letting them relax.",
 ["High blood pressure", "Urinary symptoms from an enlarged prostate", "Raynaud’s phenomenon", "Nightmares in PTSD (off-label; a large 2018 trial in veterans found no benefit, smaller trials did)"],
 "Dizziness is the main issue, especially early.",
 [g(C, ["Dizziness, light-headedness", "Headache", "Tiredness", "Stuffy nose"]), g(U, ["<b>Fainting with the first dose</b>", "Palpitations", "Swollen ankles"]), g(R, ["Prolonged erection", "Floppy iris syndrome during cataract surgery"])],
 ["Fainting or falls", "Erection lasting over 4 hours"],
 ["Take the first dose at bedtime, and get up slowly at night.", "Increase the dose gradually.", "Extra care with other blood pressure medicines, PDE5 inhibitors (e.g. sildenafil) or alcohol.", "Tell your eye surgeon before cataract surgery."],
 [("Why take prazosin at night?", "The first doses can drop blood pressure and cause fainting. Taking it at bedtime reduces the risk."),
  ("Does prazosin help PTSD nightmares?", "Some trials found benefit, but a large 2018 trial in veterans didn’t. It’s still used for some people under medical advice."),
  ("Is prazosin used for prostate problems?", "Yes, it can improve flow, though once-daily tamsulosin is more commonly used.")],
 [("PBS: Prazosin", PBS + "prazosin")],
 [("Raynaud’s", "/raynauds/"), ("PTSD", "/ptsd/"), ("Tamsulosin", "/medicines/tamsulosin/")])

med("vaginal-oestrogen", "Vaginal Oestrogen: Dryness, Recurrent UTIs and Safety",
 "Vaginal oestrogen (Vagifem, Ovestin) explained: treating dryness and pain after menopause, preventing recurrent UTIs, bladder symptoms, why tiny absorbed doses are safe, and breast cancer considerations.",
 "Vaginal oestrogen", "Vaginal oestrogen",
 [("s", "Local oestrogen"), ("l", "Prescription only (S4); some pharmacist-supplied")],
 "Tiny doses of oestrogen applied to the vagina. Treats dryness and painful sex after menopause and cuts recurrent UTIs, with very little reaching the bloodstream.",
 "Low oestrogen after menopause thins vaginal and urethral tissue (genitourinary syndrome of menopause). Vaginal oestrogen restores it. A classic trial (Raz and Stamm, NEJM 1993) found estriol cream cut UTIs from about 5.9 to 0.5 episodes per woman-year. Large observational studies haven’t found higher rates of breast cancer, endometrial cancer or heart disease. No progestogen is needed.",
 [("For", "Vaginal dryness, itch, painful sex, urinary urgency and recurrent UTIs after menopause; before prolapse surgery; with pessaries"),
  ("Works", "Most women improve within weeks"),
  ("Cost", "Some PBS-listed; about $20 to $40 privately"),
  ("Kicks in", "2 to 12 weeks"),
  ("Dose", "Daily for 2 weeks, then twice weekly (e.g. estradiol 10 microgram pessary or estriol cream)"),
  ("Watch for", "Mild irritation, discharge or spotting early on")],
 "Small dose, big difference, often forgotten.",
 ["Vagifem (estradiol pessary), Vagifem Low, Ovestin (estriol cream and pessaries)"],
 "Oestrogen restores the thickness, moisture, acidity and healthy lactobacilli of vaginal and urethral tissue, which protects against infection.",
 ["Genitourinary syndrome of menopause: dryness, burning, painful sex", "Preventing recurrent UTIs after menopause", "Overactive bladder symptoms after menopause", "Before vaginal surgery and with pessaries", "Women with early menopause or on some cancer treatments (with specialist advice)"],
 "Very well tolerated.",
 [g(C, ["Mild vaginal irritation or burning at first", "Discharge"]), g(U, ["Spotting", "Breast tenderness (rare at low doses)"]), g(R, ["<b>Postmenopausal bleeding</b>: always needs checking"])],
 ["Any vaginal bleeding after menopause", "A breast lump"],
 ["It’s fine long term; review yearly.", "No progestogen is needed with standard low doses.", "Breast cancer survivors: discuss with your oncologist; studies, including a 2024 JAMA Oncology study, haven’t shown higher breast cancer death rates, but those on aromatase inhibitors need specialist advice.", "Lubricants and moisturisers can be used too."],
 [("Is vaginal oestrogen safe?", "Yes for most women. Very little is absorbed, and large studies haven’t shown higher risks of breast cancer, endometrial cancer, stroke or heart disease."),
  ("Does vaginal oestrogen prevent UTIs?", "Yes. In a randomised trial, vaginal estriol cut recurrent UTIs in postmenopausal women by about 90%."),
  ("Do I need a progestogen with vaginal oestrogen?", "Not at standard low doses.")],
 [("Australasian Menopause Society", "https://www.menopause.org.au/"), ("NEJM 1993: Raz and Stamm, intravaginal estriol for recurrent UTI", "https://doi.org/10.1056/NEJM199309093291102"), ("PBS: Estriol", PBS + "estriol")],
 [("Menopause", "/menopause/"), ("UTI", "/uti/"), ("Menopause hormone therapy", "/medicines/menopause-hormone-therapy/"), ("Types of incontinence", "/incontinence/")])
