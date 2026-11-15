# Psoriasis extras: psoriatic arthritis, scalp psoriasis, nail psoriasis. Run with _scripts/gen_sheets.py
PSO_RES = [("Psoriasis Australia", "https://www.psoriasisaustralia.org.au/", "Patient support and information. Free."),
           ("Arthritis Australia", "https://arthritisaustralia.com.au/", "Information on psoriatic arthritis and living with it. Free."),
           ("Australasian College of Dermatologists: A–Z of skin", "https://www.dermcoll.edu.au/a-to-z-of-skin/", "Dermatologist-written patient information. Free.")]

fact("psoriatic-arthritis",
 "Psoriatic Arthritis: Signs, Tests and Treatment",
 "Psoriatic arthritis explained: who gets it, the clues (sausage fingers, heel pain, morning stiffness, nail changes), why early treatment matters, and the medicines that protect your joints.",
 "Psoriatic Arthritis", "Psoriatic arthritis",
 "About 1 in 5 people with psoriasis also get inflammation in their joints, tendons or spine. It usually starts years after the skin, but sometimes before. Joint damage can begin early, so the clues are worth knowing, and modern treatment works well.",
 h2("The clues", [
   "<b>Sausage finger or toe:</b> a whole digit swells up (dactylitis)",
   "<b>Heel or sole pain:</b> where tendons attach to bone, such as the Achilles (enthesitis)",
   "<b>Morning stiffness</b> lasting more than 30 minutes, easing as you move",
   "<b>Swollen, warm joints</b>, often a few on one side, including the end finger joints",
   "<b>Back or buttock pain</b> that’s worse after rest and better with exercise",
   "<b>Nail changes</b> (pits, lifting) and scalp or buttock-crease psoriasis raise the risk"]) +
 '<p class="callout"><b>See your GP within a few weeks</b> if you have psoriasis and new joint swelling, a sausage digit or morning stiffness. In one study, waiting more than 6 months for a diagnosis led to more joint damage and worse function.</p>' +
 '<p class="sass">Your joints don’t care that your skin is “only mild”. Skin severity barely predicts who gets arthritis.</p>' +
 h2("Tests", [
   "There’s no single blood test: diagnosis is mostly the story and examination",
   "Blood tests (CRP, ESR) can be normal even with active arthritis",
   "Rheumatoid factor is usually negative, which helps tell it from rheumatoid arthritis",
   "X-rays or ultrasound show joint and tendon inflammation or damage",
   "A yearly 5-question screen (PEST) helps GPs and dermatologists pick it up early"]) +
 ladder("What helps", "Treatment is stepped up until the inflammation is quiet. Most people need a rheumatologist.", [
   ("s", "Step 1 · Everyone", "Keep moving, lose weight if needed, stop smoking", "Exercise eases stiffness. Weight loss improves how well medicines work.", "Weight loss of 5–10% improves joint scores in trials", "Free", "Ongoing", "", "The best joint supplement is a walk."),
   ("m", "Step 2 · GP", "Anti-inflammatory tablets (NSAIDs) or a steroid injection into a joint", "Settles pain and swelling while waiting for a specialist.", "Good for symptoms; doesn’t prevent damage", "$10–25", "Short term", "Stomach, kidneys and blood pressure with long use.", None),
   ("m", "Step 3 · Rheumatologist", "Methotrexate, leflunomide or sulfasalazine", "Standard disease-modifying tablets (DMARDs). Methotrexate also helps the skin.", "Help many people with joint swelling", "PBS: $25 or $7.70 concession", "Takes 8–12 weeks to work", "Regular blood tests; no alcohol binges on methotrexate; avoid pregnancy.", None),
   ("l", "Step 4 · Rheumatologist", "Biologic injections or JAK inhibitor tablets", "Target TNF, IL-17 or IL-23 (e.g. adalimumab, secukinumab, guselkumab), or tablets such as upadacitinib. They also clear skin.", "Around half to two-thirds of people get at least a 50% improvement in joint symptoms", "PBS for people who meet criteria, including trying standard medicines first", "Weeks to months; ongoing", "Infections; TB and hepatitis checks first; some aren’t suitable with bowel disease or heart risks.", "Expensive molecules, cheap co-payment. The PBS is doing the heavy lifting.")]) +
 h2("Look after your heart too", [
   "Psoriatic disease raises the risk of heart disease, diabetes and fatty liver",
   "Ask your GP for a yearly check: blood pressure, cholesterol, sugar and weight",
   "Low mood is common with any long-term inflammatory disease: say so if it’s happening"]) +
 skip([("Gluten-free diet without coeliac disease", "Only helps if you test positive for coeliac antibodies."),
   ("Turmeric, fish oil or collagen as treatment", "Small or no benefit in trials. Fine as food, not as a substitute for a DMARD."),
   ("“Alkaline” or detox diets", "Don’t change joint inflammation."),
   ("Waiting it out", "Psoriatic arthritis doesn’t usually burn out on its own, and damage is permanent.")]) +
 '<p class="sass">If a supplement could switch off IL-17, it would cost $2,000 a month and need a script.</p>',
 [("How common is psoriatic arthritis?", "About 1 in 5 people with psoriasis develop it, usually years after the skin started, but sometimes before."),
  ("What are the early signs of psoriatic arthritis?", "A swollen sausage-like finger or toe, heel or sole pain, morning stiffness over 30 minutes, swollen joints, or back pain that eases with movement."),
  ("Is there a blood test for psoriatic arthritis?", "No single test. Diagnosis is based on symptoms and examination, sometimes with X-rays or ultrasound. Blood markers of inflammation can be normal."),
  ("Can psoriatic arthritis be cured?", "Not cured, but treatment can switch off the inflammation and prevent joint damage. Many people reach low or no disease activity on modern medicines.")],
 PSO_RES,
 [("Gossec L et al. EULAR recommendations for psoriatic arthritis: 2023 update (Ann Rheum Dis 2024)", "https://pubmed.ncbi.nlm.nih.gov/38499325/"),
  ("Soriano ER et al. GRAPPA 2021 treatment recommendations for psoriatic arthritis (J Rheumatol 2023)", "https://pubmed.ncbi.nlm.nih.gov/37419619/"),
  ("Alinaghi F et al. Prevalence of psoriatic arthritis in psoriasis: meta-analysis (JAAD 2019)", "https://pubmed.ncbi.nlm.nih.gov/29928910/"),
  ("Haroon M et al. Diagnostic delay of more than 6 months worsens outcome in psoriatic arthritis (Ann Rheum Dis 2015)", "https://pubmed.ncbi.nlm.nih.gov/24525911/")],
 [("Psoriasis", "/psoriasis/"), ("Nail psoriasis", "/nail-psoriasis/"), ("Scalp psoriasis", "/scalp-psoriasis/"), ("Gout", "/gout/")],
 groups=["Skin"], blurb="About 1 in 5 people with psoriasis get joint inflammation. The clues, and why early treatment matters.",
 search="psoriatic arthritis psa joint pain dactylitis sausage finger enthesitis heel pain psoriasis arthritis biologics methotrexate")

fact("scalp-psoriasis",
 "Scalp Psoriasis: Shampoos, Scale Removal and Treatments",
 "Scalp psoriasis explained: how to tell it from dandruff, lifting thick scale, medicated shampoos, steroid lotions and foams, and when tablets or injections make sense.",
 "Scalp Psoriasis", "Scalp psoriasis",
 "Scalp psoriasis causes thick, silvery, well-defined plaques that often spill past the hairline and behind the ears. At least half of people with psoriasis get it, and it’s one of the itchiest, most visible spots. The trick is to lift the scale first, then treat the skin underneath.",
 h2("Psoriasis or dandruff?", [
   "<b>Psoriasis:</b> thick, silvery scale on red plaques with sharp edges; often past the hairline, behind the ears and on the neck",
   "<b>Seborrhoeic dermatitis (dandruff):</b> thinner, greasier, yellowish flakes, more diffuse, often eyebrows and beside the nose",
   "Some people have features of both (“sebopsoriasis”), and treatments overlap",
   "Psoriasis elsewhere (elbows, knees, nails) supports the diagnosis"]) +
 '<p class="sass">Dandruff flakes. Psoriasis builds plaques with planning permission.</p>' +
 ladder("What helps", "Lift the scale, then treat. Most people need 2 or 3 steps.", [
   ("s", "Step 1 · Pharmacy", "Medicated shampoos: coal tar, salicylic acid or ketoconazole", "Leave on for 5–10 minutes before rinsing. Rotate if one stops working.", "Helps mild scaling and itch", "$15–30", "2–3 times a week, ongoing", "Tar smells and can stain light hair.", None),
   ("s", "Step 2 · Pharmacy", "Descale: salicylic acid or tar-based scalp ointment, or oil, overnight", "Massage in, cover with a shower cap, wash out in the morning, comb scale gently.", "Makes every other treatment work better", "$15–25", "Nightly for a week, then as needed", "Don’t pick or scratch scale off: it triggers more psoriasis.", "Gentle combing, not excavation."),
   ("m", "Step 3 · GP", "Strong steroid scalp lotion, foam or short-contact shampoo", "Clobetasol shampoo left on for 15 minutes, or betamethasone lotion.", "Clears or nearly clears many people in 2–4 weeks", "PBS or $20–40", "Daily for 2–4 weeks, then twice weekly", "Fine for the scalp short term; don’t use on the face.", None),
   ("m", "Step 4 · GP", "Calcipotriol plus betamethasone gel or foam", "Combines vitamin D and steroid; often the most effective cream-type treatment for scalp.", "Better than either ingredient alone in trials", "PBS or about $50–90", "Daily for 4 weeks, then twice weekly", "Mild irritation; limit the amount per week.", None),
   ("l", "Step 5 · Dermatologist", "Tablets or biologic injections for severe or stubborn disease", "Methotrexate, apremilast, or biologics targeting IL-17 or IL-23, which clear scalp psoriasis well.", "IL-17 and IL-23 biologics clear the scalp in most people in trials", "PBS for severe chronic psoriasis that meets criteria", "Weeks to months; ongoing", "Blood tests and infection screening.", None)]) +
 h2("Hair loss", [
   "Thick plaques and scratching can thin the hair temporarily",
   "Hair grows back once the psoriasis is controlled",
   "Be gentle: no tight hairstyles, harsh brushing or very hot hair dryers on active plaques"]) +
 skip([("Apple cider vinegar", "Can sting and burn broken skin, with no trial evidence."),
   ("Expensive “natural” psoriasis shampoos", "Often tar or salicylic acid with a markup."),
   ("Shaving the head", "Not needed: lotions, foams and shampoos are made to reach the scalp through hair.")]) +
 '<p class="sass">Covering it with a hat treats the embarrassment, not the plaques.</p>',
 [("How do I get rid of thick scale on my scalp?", "Soften it first with a salicylic acid or tar scalp ointment, or oil, left on overnight under a shower cap, then wash and comb gently. Then use a steroid or combination scalp treatment."),
  ("Is scalp psoriasis the same as dandruff?", "No. Psoriasis has thick, silvery scale on sharply edged plaques, often past the hairline. Dandruff (seborrhoeic dermatitis) is thinner, greasier and more diffuse. They can overlap."),
  ("Does scalp psoriasis cause hair loss?", "It can thin the hair temporarily, mainly from scratching and scale removal, but hair usually grows back once it’s controlled.")],
 PSO_RES,
 [("Zhang S et al. Biologics targeting IL-17/IL-23 in scalp, nail and palmoplantar psoriasis: network meta-analysis (Front Immunol 2026)", "https://pubmed.ncbi.nlm.nih.gov/42558790/"),
  ("Australasian College of Dermatologists: A–Z of skin", "https://www.dermcoll.edu.au/a-to-z-of-skin/")],
 [("Psoriasis", "/psoriasis/"), ("Seborrhoeic dermatitis", "/seb-derm/"), ("Nail psoriasis", "/nail-psoriasis/"), ("Psoriatic arthritis", "/psoriatic-arthritis/")],
 groups=["Skin"], blurb="Thick, silvery scalp plaques: lift the scale, then treat. Shampoos, lotions and foams that work.",
 search="scalp psoriasis dandruff seborrhoeic dermatitis scale shampoo coal tar clobetasol calcipotriol hairline itch")

fact("nail-psoriasis",
 "Nail Psoriasis: Pits, Lifting Nails and What Helps",
 "Nail psoriasis explained: pits, oil-drop patches, lifting and crumbling nails, how to tell it from fungal infection, nail care, steroid treatments and when biologics help.",
 "Nail Psoriasis", "Nail psoriasis",
 "Up to half of people with psoriasis have nail changes, and most people with psoriatic arthritis do. Nails are slow and stubborn to treat because they grow slowly, but they do improve, especially with modern injections.",
 h2("What it looks like", [
   "<b>Pits:</b> small dents in the nail surface, like a thimble",
   "<b>Oil-drop or salmon patches:</b> yellow-orange marks under the nail",
   "<b>Lifting (onycholysis):</b> the nail separates from the bed, often from the tip",
   "<b>Thickening and crumbling</b>, with scale building up under the nail",
   "Fingernails are more often affected than toenails"]) +
 '<p class="callout"><b>Nail psoriasis is a clue for psoriatic arthritis.</b> Tell your GP about any joint swelling, heel pain or morning stiffness.</p>' +
 h2("Psoriasis or fungus?", [
   "They look similar, and you can have both",
   "A nail clipping sent to the lab confirms fungus before months of antifungal tablets",
   "Psoriasis elsewhere and pitting point towards psoriasis",
   "Fungus more often starts in one toenail and spreads"]) +
 '<p class="sass">Twelve weeks of antifungal tablets for a nail that never had fungus is a lot of liver tests for nothing.</p>' +
 ladder("What helps", "Expect slow progress: fingernails take about 6 months to grow out, toenails 12–18 months.", [
   ("s", "Step 1 · Everyone", "Nail care: keep nails short, wear gloves for wet or rough work", "Injury makes nail psoriasis worse. Skip aggressive manicures and cleaning under the nail.", "Reduces flares and lifting", "Free", "Ongoing", "", "Your cuticle is a seal, not a decoration. Leave it be."),
   ("m", "Step 2 · GP", "Strong steroid, with or without calcipotriol, to the nail fold and under lifted nail", "Applied nightly to the skin around the nail.", "Modest improvement over months", "PBS or $20–60", "3–6 months", "Thin skin around the nail with long use.", None),
   ("m", "Step 3 · Dermatologist", "Steroid injections into the nail fold", "Triamcinolone injected beside the nail.", "Helps pitting and thickening in many people", "Specialist fees", "Every 4–8 weeks for a few rounds", "Stings; local anaesthetic helps.", None),
   ("l", "Step 4 · Dermatologist or rheumatologist", "Biologic injections or tablets", "IL-17, IL-23 and TNF biologics clear nails better than anything else, especially if there’s skin or joint disease too.", "Many people get clear or near-clear nails within a year", "PBS if criteria are met (usually for skin or joint disease)", "6–12 months to see full effect", "Infection screening first.", None)]) +
 skip([("Antifungal tablets without a positive test", "Won’t help psoriasis and carry side effects."),
   ("Tea tree oil and nail “hardeners”", "No evidence for psoriasis; can irritate."),
   ("Biotin for nails", "No benefit in psoriasis and can upset some blood tests, including thyroid and heart tests.")]),
 [("What does nail psoriasis look like?", "Small pits, yellow-orange oil-drop patches, nails lifting from the bed, thickening and crumbling."),
  ("How do I know if it’s nail psoriasis or fungus?", "They can look the same. A nail clipping test confirms fungus. Psoriasis elsewhere or pitting points to psoriasis."),
  ("How long does nail psoriasis take to improve?", "Months: fingernails take about 6 months to grow out and toenails 12 to 18 months, so treatments need time.")],
 PSO_RES,
 [("Zhang S et al. Biologics targeting IL-17/IL-23 in scalp, nail and palmoplantar psoriasis: network meta-analysis (Front Immunol 2026)", "https://pubmed.ncbi.nlm.nih.gov/42558790/"),
  ("Madani A et al. Intralesional triamcinolone for nail psoriasis: systematic review (Dermatol Online J 2026)", "https://pubmed.ncbi.nlm.nih.gov/42246338/"),
  ("Gossec L et al. EULAR recommendations for psoriatic arthritis: 2023 update (Ann Rheum Dis 2024)", "https://pubmed.ncbi.nlm.nih.gov/38499325/")],
 [("Psoriasis", "/psoriasis/"), ("Psoriatic arthritis", "/psoriatic-arthritis/"), ("Scalp psoriasis", "/scalp-psoriasis/"), ("Fungal nail infection", "/tinea/")],
 groups=["Skin"], blurb="Pits, oil-drop patches and lifting nails. Slow to treat, but they do improve.",
 search="nail psoriasis pitting onycholysis oil drop nail fungus fungal nail psoriatic nails biologics triamcinolone")
