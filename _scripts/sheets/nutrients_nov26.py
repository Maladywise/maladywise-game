# Vitamins and metals, round 2: riboflavin, niacin, pantothenic acid, biotin; copper, cobalt, thallium, manganese, chromium, aluminium.
# Run with _scripts/gen_sheets.py
ODS = "https://ods.od.nih.gov/factsheets/%s-HealthProfessional/"
NRV = ("Nutrient Reference Values for Australia and New Zealand", "https://www.eatforhealth.gov.au/nutrient-reference-values", "Official daily intake targets. Free.")
POISONS = ("Poisons Information Centre: 13 11 26", "https://www.health.nsw.gov.au/poisons/Pages/default.aspx", "Free advice, 24 hours a day, Australia-wide.")
VIT = [("Vitamins", "/vitamin-a/"), ("Thiamine (B1)", "/thiamine/"), ("Vitamin B6", "/vitamin-b6/"), ("Vitamin B12", "/b12/")]
METAL = [("Heavy metal testing", "/heavy-metal-testing/"), ("Lead", "/lead/"), ("Mercury", "/mercury/"), ("Arsenic", "/arsenic/")]

fact("riboflavin",
 "Riboflavin (Vitamin B2) Deficiency: Cracked Lips, Sore Tongue and Yellow Wee",
 "Riboflavin (vitamin B2) explained: who runs low, cracked mouth corners and a sore magenta tongue, food sources, supplements, migraine prevention and why your wee turns neon yellow.",
 "Riboflavin (Vitamin B2) Deficiency", "Riboflavin deficiency",
 "Riboflavin helps cells turn food into energy and recycle other B vitamins. Deficiency is uncommon in Australia, but it turns up with heavy drinking, very restricted diets and some gut conditions, usually alongside other B vitamin gaps.",
 h2("Who’s at risk", [
   "Heavy alcohol use",
   "Very restricted diets, eating disorders, or vegan diets without fortified foods (dairy is a major source)",
   "Malabsorption: coeliac disease, after bariatric surgery, long-term diarrhoea",
   "Older people with poor appetite",
   "Pregnancy and breastfeeding increase needs"]) +
 h2("Symptoms", [
   "Cracked, sore corners of the mouth (angular cheilitis) and dry, split lips",
   "A sore, smooth, magenta-coloured tongue",
   "Greasy, scaly rash around the nose and mouth",
   "Sore throat, red gritty eyes, sensitivity to light",
   "Anaemia in more severe or longer-term cases"]) +
 '<p class="sass">Cracked mouth corners are usually saliva, lip-licking or thrush. Riboflavin is on the list, not at the top of it.</p>' +
 h2("Treatment", [
   "A B-complex or riboflavin supplement fixes it, usually within days to weeks",
   "Treat the cause: alcohol, diet, or the gut problem",
   "Check for other B vitamin deficiencies, which often come together",
   "Blood tests for riboflavin are specialised and rarely needed: the response to treatment confirms it"]) +
 h2("Food sources", [
   "Milk, yoghurt and cheese",
   "Eggs, meat, fish and liver",
   "Mushrooms, almonds and green vegetables",
   "Fortified breakfast cereals and yeast spreads"]) +
 h2("Migraine", [
   "High-dose riboflavin (400 mg a day) is used to prevent migraines",
   "Trials are small but suggest fewer migraine days after about 3 months",
   "Cheap and well tolerated: ask your GP if it suits you"]) +
 '<p class="sass">Neon yellow wee after a multivitamin isn’t your kidneys failing. It’s riboflavin leaving, loudly.</p>' +
 h2("Weird history", [
   "Its name comes from ribose (a sugar) and flavus, Latin for yellow",
   "It was first isolated as a yellow pigment from milk whey in the 1930s",
   "It glows yellow-green under UV light, which is why it’s used to check spray coverage in labs"]),
 [("What are the signs of riboflavin deficiency?", "Cracked mouth corners, sore dry lips, a sore magenta tongue, a greasy rash around the nose and mouth, sore throat and sore eyes."),
  ("Why does vitamin B2 turn urine yellow?", "Your body excretes the riboflavin it doesn’t need, and riboflavin is bright yellow. It’s harmless."),
  ("Does riboflavin help migraines?", "High-dose riboflavin (400 mg daily) may reduce migraine frequency after about 3 months. Evidence is modest but side effects are minimal.")],
 [NRV], [("NIH Office of Dietary Supplements: Riboflavin", ODS % "Riboflavin")],
 [("Niacin and pellagra", "/niacin/"), ("Thiamine (B1)", "/thiamine/"), ("Vitamin B12", "/b12/"), ("Migraine", "/migraine/")],
 groups=["Blood and nutrition"], blurb="Cracked lips, sore magenta tongue, neon yellow wee. Who runs low and what fixes it.",
 search="riboflavin vitamin b2 deficiency angular cheilitis cracked lips sore tongue yellow urine migraine")

fact("niacin",
 "Niacin (Vitamin B3) and Pellagra: Rash, Diarrhoea and Confusion",
 "Niacin (vitamin B3) explained: pellagra and its 4 Ds, who gets it today, treatment, food sources, nicotinamide for skin cancer prevention, and why high-dose niacin fell out of favour for cholesterol.",
 "Niacin (Vitamin B3) and Pellagra", "Pellagra",
 "Severe niacin deficiency causes pellagra: a rash on sun-exposed skin, diarrhoea and confusion. It’s rare in Australia now, but still seen with heavy drinking, eating disorders, malabsorption and some medicines. It’s easy to treat once someone thinks of it.",
 h2("The 4 Ds", [
   "<b>Dermatitis:</b> a red-brown, sunburn-like rash on sun-exposed skin, often a band around the neck (Casal’s necklace)",
   "<b>Diarrhoea</b> and a sore red tongue and mouth",
   "<b>Dementia:</b> confusion, poor memory, low mood, irritability",
   "<b>Death</b> if left untreated"]) +
 '<p class="sass">Few conditions come with their own alliterative checklist. Pellagra wants to be remembered.</p>' +
 h2("Who’s at risk", [
   "Heavy alcohol use (the most common cause in Australia)",
   "Eating disorders, very restricted diets, homelessness",
   "Malabsorption, including after bariatric surgery",
   "Medicines such as isoniazid (for tuberculosis) and some anticonvulsants",
   "Rare conditions: carcinoid syndrome and Hartnup disease (both use up tryptophan, which the body turns into niacin)"]) +
 h2("Treatment", [
   "Nicotinamide tablets for several weeks, usually with a B-complex",
   "Mouth and gut symptoms often improve within days; the rash over weeks",
   "Sun protection while the skin heals",
   "Treat the underlying cause"]) +
 h2("Food sources", [
   "Meat, chicken, fish and liver",
   "Peanuts, legumes and wholegrains",
   "Fortified cereals and breads",
   "Eggs and milk (rich in tryptophan, which your body converts to niacin)"]) +
 h2("Nicotinamide and skin cancer", [
   "In an Australian trial of people with frequent skin cancers, nicotinamide 500 mg twice daily cut new non-melanoma skin cancers by 23% over a year",
   "The benefit stops when you stop taking it",
   "Worth discussing if you’ve had several skin cancers; it doesn’t replace sun protection or skin checks"]) +
 h2("Niacin for cholesterol?", [
   "High-dose niacin (nicotinic acid) lowers cholesterol, but large trials found no fewer heart attacks",
   "It causes flushing and raises blood sugar, so it’s rarely used now",
   "Nicotinamide doesn’t cause flushing and doesn’t lower cholesterol: they’re different forms"]) +
 '<p class="sass">Same vitamin, two forms, very different jobs. Read the label before you flush.</p>' +
 h2("Weird history", [
   "In the early 1900s pellagra killed thousands in the southern US, where diets relied on untreated corn",
   "Doctor Joseph Goldberger proved it was dietary, not infectious, partly by injecting himself and volunteers with patients’ blood and eating scabs at “filth parties”. Nobody caught it",
   "Mexican and Central American cooks had long prevented it by soaking corn in limewater (nixtamalisation), which frees its niacin"]),
 [("What is pellagra?", "Severe niacin (vitamin B3) deficiency causing the 4 Ds: dermatitis on sun-exposed skin, diarrhoea, dementia or confusion, and death if untreated."),
  ("Who gets pellagra today?", "Mostly people with heavy alcohol use, eating disorders, malabsorption or certain medicines such as isoniazid."),
  ("Does nicotinamide prevent skin cancer?", "In people with several previous skin cancers, nicotinamide 500 mg twice daily reduced new non-melanoma skin cancers by about 23% in an Australian trial, while it was being taken.")],
 [NRV, ("Cancer Council: skin cancer", "https://www.cancer.org.au/cancer-information/types-of-cancer/skin-cancer", "Prevention and checks. Free.")],
 [("Chen AC et al. Phase 3 randomised trial of nicotinamide for skin-cancer chemoprevention (NEJM 2015)", "https://pubmed.ncbi.nlm.nih.gov/26488693/"),
  ("Litaiem N et al. Pellagra in contemporary clinical practice: systematic review (Int J Dermatol 2026)", "https://pubmed.ncbi.nlm.nih.gov/41876960/"),
  ("NIH Office of Dietary Supplements: Niacin", ODS % "Niacin")],
 [("Riboflavin (B2)", "/riboflavin/"), ("Thiamine (B1)", "/thiamine/"), ("Alcohol", "/alcohol/"), ("Skin cancer", "/skin-cancer/")],
 groups=["Blood and nutrition"], blurb="Pellagra’s 4 Ds, who gets it now, and nicotinamide for skin cancer prevention.",
 search="niacin vitamin b3 pellagra dermatitis diarrhoea dementia nicotinamide skin cancer alcohol casal necklace")

fact("pantothenic-acid",
 "Pantothenic Acid (Vitamin B5): Deficiency, Burning Feet and Acne Claims",
 "Pantothenic acid (vitamin B5) explained: why deficiency is so rare, burning feet syndrome, who might run low, food sources, and what the evidence says about B5 for acne and hair.",
 "Pantothenic Acid (Vitamin B5)", "Pantothenic acid deficiency",
 "Pantothenic acid is in almost every food: its name comes from the Greek for “from everywhere”. Deficiency on its own is very rare and usually only happens with severe malnutrition, alongside other vitamin deficiencies.",
 h2("When deficiency happens", [
   "Severe malnutrition or starvation",
   "Heavy alcohol use with a poor diet",
   "Rare genetic conditions affecting how it’s used",
   "Almost always together with other B vitamin deficiencies"]) +
 h2("Symptoms", [
   "<b>Burning feet:</b> burning, numbness and tingling in the feet",
   "Tiredness, irritability and poor sleep",
   "Nausea, cramps and abdominal pain",
   "These overlap with many other conditions, so check for more common causes first"]) +
 h2("Treatment", [
   "A B-complex supplement, plus fixing the overall diet",
   "Look for and treat other deficiencies at the same time",
   "Burning feet has many common causes (diabetes, B12 deficiency, alcohol): see your GP"]) +
 '<p class="sass">If your feet are burning, it’s far more likely to be diabetes, B12 or alcohol than a vitamin that’s literally in everything.</p>' +
 h2("Food sources", [
   "Meat, chicken, liver and eggs",
   "Mushrooms, avocado and potatoes",
   "Wholegrains, legumes and milk",
   "Practically every food, in small amounts"]) +
 skip([("High-dose B5 for acne", "One small trial showed a modest benefit; evidence is too weak to recommend it over proven acne treatments."),
   ("B5 for hair growth or grey hair", "Grey fur in vitamin-deficient rats doesn’t translate to greying people."),
   ("Dexpanthenol shampoos for hair loss", "A moisturiser for hair, not a treatment for thinning.")]) +
 h2("Weird history", [
   "Burning feet syndrome was described in prisoners of war in Asia during World War II, living on polished rice",
   "In 1940s experiments, volunteers fed a B5 antagonist developed burning feet, which settled with pantothenic acid"]),
 [("Is pantothenic acid deficiency common?", "No. Pantothenic acid is in almost every food, so deficiency only happens with severe malnutrition, usually with other deficiencies."),
  ("What is burning feet syndrome?", "Burning, tingling feet that can occur with pantothenic acid deficiency, but diabetes, B12 deficiency and alcohol are far more common causes."),
  ("Does vitamin B5 help acne?", "Evidence is limited to one small trial with a modest effect. Proven acne treatments work better.")],
 [NRV], [("NIH Office of Dietary Supplements: Pantothenic acid", ODS % "PantothenicAcid")],
 [("Biotin (B7)", "/biotin/"), ("Riboflavin (B2)", "/riboflavin/"), ("Acne", "/acne/"), ("Vitamin B12", "/b12/")],
 groups=["Blood and nutrition"], blurb="The vitamin found almost everywhere, so deficiency is rare. Burning feet and acne claims.",
 search="pantothenic acid vitamin b5 deficiency burning feet acne hair dexpanthenol")

fact("biotin",
 "Biotin (Vitamin B7): Deficiency, Hair and Nail Claims, and Blood Test Interference",
 "Biotin (vitamin B7) explained: who becomes deficient, raw egg whites, newborn screening, the weak evidence for hair and nails, and how biotin supplements can wreck thyroid and heart blood tests.",
 "Biotin (Vitamin B7)", "Biotin deficiency",
 "Biotin deficiency is rare: gut bacteria make some, and most diets have plenty. The bigger problem today is the opposite: high-dose biotin supplements for hair and nails can give falsely high or low results on some blood tests, including thyroid and heart tests.",
 h2("Who becomes deficient", [
   "<b>Biotinidase deficiency:</b> an inherited condition picked up by newborn screening in Australia",
   "Eating lots of raw egg whites over months (a protein called avidin binds biotin; cooking destroys it)",
   "Long-term use of some anticonvulsants",
   "Long-term tube or intravenous feeding without biotin, heavy alcohol use, malabsorption"]) +
 h2("Symptoms", [
   "Thinning hair, sometimes loss of eyelashes and eyebrows",
   "A red, scaly rash around the eyes, nose and mouth",
   "Brittle nails",
   "Low mood, tiredness, tingling; seizures and developmental problems in babies with biotinidase deficiency"]) +
 '<p class="callout"><b>Taking biotin? Tell whoever orders your blood tests.</b> High-dose biotin (often 5–10 mg in hair, skin and nail products) can make thyroid, hormone and troponin (heart attack) tests wrong. Ask whether to stop it for a few days before testing.</p>' +
 h2("Hair and nails", [
   "Biotin only helps hair and nails if you’re actually deficient, which is rare",
   "In people with normal levels, there’s no good evidence it improves hair loss or nail strength",
   "Common causes of hair thinning include iron deficiency, thyroid problems, stress and genetics: worth checking first"]) +
 '<p class="sass">Biotin gummies grow one thing reliably: the supplement industry.</p>' +
 h2("Treatment", [
   "Biotin supplements correct deficiency quickly",
   "Babies with biotinidase deficiency take biotin for life and usually do very well",
   "Cook your eggs"]) +
 h2("Food sources", [
   "Cooked eggs (especially the yolk), liver and meat",
   "Nuts, seeds and legumes",
   "Sweet potato, mushrooms and avocado"]) +
 h2("Weird history", [
   "Biotin deficiency was first seen in rats fed raw egg whites, which gave them “egg-white injury”: hair loss and dermatitis",
   "It was once called vitamin H, from the German words for hair and skin (Haar and Haut)"]),
 [("Does biotin help hair growth?", "Only if you’re deficient, which is rare. In people with normal levels there’s no good evidence it helps hair loss."),
  ("Can biotin affect blood tests?", "Yes. High-dose biotin can make some thyroid, hormone and troponin (heart) tests falsely high or low. Tell your doctor and ask whether to pause it before blood tests."),
  ("What causes biotin deficiency?", "Rarely: inherited biotinidase deficiency (found on newborn screening), eating many raw egg whites, some anticonvulsants, or long-term tube or IV feeding.")],
 [NRV], [("Dasgupta A et al. Immunoassay design and biotin interference (Adv Clin Chem 2022)", "https://pubmed.ncbi.nlm.nih.gov/35953126/"), ("NIH Office of Dietary Supplements: Biotin", ODS % "Biotin")],
 [("Hair loss", "/hair-loss/"), ("Thyroid", "/thyroid/"), ("Pantothenic acid (B5)", "/pantothenic-acid/"), ("Iron", "/iron/")],
 groups=["Blood and nutrition"], blurb="Rare deficiency, weak hair claims, and a supplement that can wreck thyroid and heart tests.",
 search="biotin vitamin b7 deficiency hair loss nails raw egg white avidin biotinidase blood test interference thyroid troponin")

fact("copper",
 "Copper: Deficiency, Toxicity and Wilson Disease",
 "Copper explained: deficiency after bariatric surgery or too much zinc, the nerve and blood problems it causes, copper toxicity, and Wilson disease, the inherited copper overload that can hit the liver and brain.",
 "Copper: Deficiency, Excess and Wilson Disease", "Copper deficiency",
 "Copper is essential for blood cells, nerves and connective tissue, but too much is toxic. Deficiency is uncommon and often missed because it mimics B12 deficiency. Wilson disease is a rare inherited condition where copper builds up in the liver and brain.",
 h2("Copper deficiency: causes", [
   "Bariatric (weight-loss) surgery, especially gastric bypass",
   "<b>Too much zinc:</b> high-dose supplements or large amounts of zinc-containing denture cream block copper absorption",
   "Malabsorption, coeliac disease, long-term tube or IV feeding",
   "Very poor diets"]) +
 h2("Copper deficiency: effects", [
   "Anaemia and low white cell count",
   "Numbness, unsteadiness and leg weakness from spinal cord damage, looking just like B12 deficiency",
   "Nerve damage can become permanent if the deficiency isn’t found early"]) +
 '<p class="sass">If B12 is normal but the symptoms scream B12, check copper. And ask about the denture cream.</p>' +
 h2("Treatment", [
   "Copper supplements by mouth, or intravenously if severe",
   "Stop excess zinc",
   "Blood counts usually recover; nerve symptoms may only partly improve"]) +
 h2("Wilson disease", [
   "An inherited condition (about 1 in 30,000 people) where the liver can’t excrete copper",
   "Usually shows between ages 5 and 40: liver disease, tremor, stiffness, slurred speech, mood or behaviour changes",
   "Copper-brown rings at the edge of the cornea (Kayser–Fleischer rings) are a classic clue",
   "Tests include ceruloplasmin and a 24-hour urine copper, then specialist assessment",
   "Lifelong treatment with medicines that remove copper or block absorption works well; untreated it can be fatal"]) +
 '<p class="callout"><b>Young person with unexplained liver disease, tremor or new psychiatric symptoms?</b> Wilson disease is rare but treatable, and worth considering.</p>' +
 h2("Too much copper", [
   "Rare from food or water in Australia",
   "Possible with large supplement doses or deliberate ingestion: vomiting, abdominal pain, liver and kidney damage",
   "A copper IUD doesn’t cause copper toxicity"]) +
 h2("Weird history", [
   "Wilson disease was described by neurologist Samuel Kinnier Wilson in 1912",
   "Copper bracelets for arthritis have been tested in randomised trials and work no better than a placebo bracelet"]),
 [("What causes copper deficiency?", "Most often bariatric surgery, too much zinc (supplements or denture cream), malabsorption or long-term tube feeding."),
  ("What does copper deficiency do?", "Anaemia, a low white cell count, and spinal cord and nerve damage that mimics B12 deficiency."),
  ("What is Wilson disease?", "A rare inherited condition where copper builds up in the liver and brain, causing liver disease and neurological or psychiatric symptoms. It’s treatable with lifelong medicine.")],
 [POISONS, ("Wilson Disease Association", "https://wilsondisease.org/", "Patient information and support. Free.")],
 [("Marotta P et al. Myeloneuropathy with hypocupraemia: copper-related pathophysiology (Cureus 2021)", "https://pubmed.ncbi.nlm.nih.gov/34373815/"), ("NIH Office of Dietary Supplements: Copper", ODS % "Copper")],
 [("Zinc", "/zinc/"), ("Vitamin B12", "/b12/"), ("Haemochromatosis", "/haemochromatosis/"), ("Heavy metal testing", "/heavy-metal-testing/")],
 groups=["Blood and nutrition"], blurb="Deficiency that mimics B12, too much zinc, and Wilson disease.",
 search="copper deficiency toxicity wilson disease zinc denture cream bariatric surgery anaemia neuropathy kayser fleischer ceruloplasmin")

fact("cobalt",
 "Cobalt Toxicity: Metal-on-Metal Hips, Supplements and Symptoms",
 "Cobalt explained: how worn metal-on-metal hip replacements release cobalt and chromium, the symptoms of cobalt toxicity, blood tests and monitoring, and other rarer sources.",
 "Cobalt Toxicity", "Cobalt toxicity",
 "Cobalt is part of vitamin B12, so you need a tiny amount. Too much, usually from a worn metal-on-metal hip replacement, can damage tissue around the joint and, rarely, the heart, nerves, thyroid, eyes and ears.",
 h2("Sources", [
   "<b>Metal-on-metal hip replacements</b> and resurfacings, mostly put in between the late 1990s and around 2010",
   "Worn or failed implants of other types, especially after a ceramic part breaks",
   "High-dose cobalt supplements, including some sold for “energy” or sports",
   "Hard-metal and some mining or manufacturing jobs"]) +
 h2("Symptoms", [
   "Hip pain, swelling or a clunking hip; a lump of inflamed tissue (pseudotumour) near the joint",
   "Rarely, whole-body effects: heart muscle weakness, hearing or vision loss, nerve damage, an underactive thyroid, fatigue, low mood or poor memory"]) +
 '<p class="callout"><b>Have a metal-on-metal hip?</b> You should have regular review with your surgeon, including blood cobalt and chromium levels and sometimes imaging. If you’re not sure what type of hip you have, ask the hospital or check with your GP.</p>' +
 h2("Testing and treatment", [
   "Whole-blood cobalt and chromium levels, repeated over time",
   "Ultrasound or MRI to look for tissue damage around the hip",
   "Revision surgery (replacing the implant) when levels are rising, symptoms appear or tissue is damaged",
   "Levels usually fall after revision"]) +
 '<p class="sass">Hip replacements are usually brilliant. A clunky one with rising cobalt is not a “wait and see” hip.</p>' +
 skip([("Cobalt supplements", "No proven benefit, and serious heart and thyroid harm has been reported."),
   ("Chelation “detox” for mildly raised levels", "Not routine; the fix is removing the source.")]) +
 h2("Weird history", [
   "In the 1960s, breweries in Quebec, Minneapolis and Belgium added cobalt to beer to stabilise the foam. Heavy drinkers developed a deadly heart condition, “beer drinkers’ cardiomyopathy”",
   "Cobalt was named after the kobold, a mischievous German goblin blamed by miners for troublesome ores"]),
 [("Can a hip replacement cause cobalt poisoning?", "Rarely. Worn metal-on-metal hips can release cobalt and chromium, damaging tissue around the joint and, uncommonly, the heart, nerves, thyroid, eyes and ears."),
  ("What are the symptoms of cobalt toxicity?", "Hip pain or swelling, and rarely heart weakness, hearing or vision loss, nerve damage, thyroid problems and fatigue."),
  ("How is it treated?", "Monitoring blood cobalt and chromium, imaging, and revision surgery when needed. Levels usually fall afterwards.")],
 [("Australian Orthopaedic Association National Joint Replacement Registry", "https://aoanjrr.sahmri.com/", "Implant outcomes data. Free.")],
 [("Zhong Q et al. Prosthetic metals: release, metabolism and toxicity (Int J Nanomedicine 2024)", "https://pubmed.ncbi.nlm.nih.gov/38855732/")],
 [("Chromium", "/chromium/"), ("Heavy metal testing", "/heavy-metal-testing/"), ("Hip osteoarthritis", "/osteoarthritis/"), ("Vitamin B12", "/b12/")],
 groups=["Other"], blurb="Worn metal-on-metal hips, rising blood levels and the rare whole-body effects.",
 search="cobalt toxicity metal on metal hip replacement chromium blood levels pseudotumour cardiomyopathy hearing loss")

fact("thallium",
 "Thallium Poisoning: Hair Loss, Painful Nerves and a Notorious History",
 "Thallium poisoning explained: the painful nerve damage and delayed hair loss it causes, how it’s diagnosed and treated with Prussian blue, and its notorious history in Australia.",
 "Thallium Poisoning", "Thallium poisoning",
 "Thallium is a tasteless, odourless metal that was once sold as rat poison. Poisoning is now very rare and usually deliberate. The classic picture is severe, burning nerve pain followed by hair falling out a couple of weeks later.",
 h2("Symptoms", [
   "Early: nausea, vomiting, abdominal pain, constipation",
   "Within days: very painful, burning feet and legs (nerve damage), weakness",
   "Two to three weeks later: hair loss, including scalp and the outer eyebrows",
   "White lines across the nails (Mees’ lines) after a few weeks",
   "Confusion, heart rhythm problems and breathing failure in severe cases"]) +
 '<p class="callout"><b>Painful feet plus hair falling out a few weeks later</b> should prompt a thallium test. Call the Poisons Information Centre (13 11 26) for advice.</p>' +
 h2("Diagnosis and treatment", [
   "A 24-hour urine thallium level confirms it",
   "<b>Prussian blue</b> (the pigment) taken by mouth traps thallium in the gut so it leaves in the stool",
   "Dialysis for severe poisoning",
   "Recovery from nerve damage can take months and may be incomplete"]) +
 h2("Weird history", [
   "In the early 1950s Sydney had a spate of thallium murders and attempted murders using rat poison, dubbed the “thallium craze”, which led NSW to ban thallium rat poisons",
   "In 1977 a London nurse diagnosed thallium poisoning in a sick child after recognising the symptoms from Agatha Christie’s novel The Pale Horse",
   "Thallium was discovered in 1861 from a bright green line in its light spectrum; the name comes from the Greek for a green shoot"]) +
 '<p class="sass">Possibly the only poisoning where crime fiction has a diagnostic hit to its name.</p>',
 [("What are the symptoms of thallium poisoning?", "Gut upset, then very painful burning nerves in the feet and legs, followed by hair loss two to three weeks later."),
  ("How is thallium poisoning treated?", "Prussian blue by mouth to trap thallium in the gut, plus supportive care and sometimes dialysis."),
  ("Is thallium still used in Australia?", "Thallium rat poisons were banned after the 1950s Sydney poisonings. Poisoning is now very rare.")],
 [POISONS],
 [("Mulkey JP, Oehme FW. A review of thallium toxicity (Vet Hum Toxicol 1993)", "https://pubmed.ncbi.nlm.nih.gov/8249271/")],
 METAL, groups=["Other"], blurb="Painful nerves then hair loss, Prussian blue, and Sydney’s 1950s thallium craze.",
 search="thallium poisoning rat poison hair loss alopecia painful neuropathy prussian blue mees lines agatha christie pale horse sydney")

fact("manganese",
 "Manganese Toxicity: Welders, Mining and Parkinson-Like Symptoms",
 "Manganese explained: why it’s essential, how high exposure from welding, mining, contaminated drugs or long-term IV feeding can cause a Parkinson-like movement disorder, and testing.",
 "Manganese Toxicity", "Manganese toxicity",
 "Manganese is an essential trace mineral, and deficiency is almost unheard of. Too much, usually breathed in at work, can build up in the brain and cause a movement disorder called manganism that looks a bit like Parkinson’s disease.",
 h2("Sources of too much", [
   "Welding, steel and battery manufacturing, and manganese mining (Australia is a major producer)",
   "Long-term intravenous (IV) feeding with manganese added",
   "Injecting home-made drugs made with potassium permanganate (ephedrone or methcathinone)",
   "Severe liver disease, which reduces manganese removal",
   "Well water with very high natural levels"]) +
 h2("Symptoms", [
   "Early: irritability, mood changes, poor sleep, sometimes compulsive behaviour (“manganese madness”)",
   "Later: slowness, stiffness, soft or slurred speech, poor balance, and a strange high-stepping “cock walk”",
   "Unlike Parkinson’s, tremor is less common and levodopa usually helps little"]) +
 '<p class="sass">Parkinson’s that doesn’t respond to levodopa in a welder deserves a work history, not just a bigger dose.</p>' +
 h2("Testing and treatment", [
   "An MRI can show manganese deposits in the brain",
   "Blood levels help but don’t always reflect brain levels",
   "The key step is removing the exposure: better ventilation, protective equipment, changing IV feeds",
   "Some symptoms may persist after exposure stops"]) +
 h2("At work", [
   "Welding fumes need extraction and respiratory protection",
   "Workplace exposure limits and health monitoring apply under Australian work health and safety laws",
   "Tell your GP about your job if you have new movement or mood symptoms"]) +
 h2("Weird history", [
   "Manganism was first described in 1837 in Scottish workers grinding manganese ore",
   "Ancient cave painters used manganese oxide for black pigment, about 40,000 years ago"]),
 [("What is manganism?", "A movement disorder from too much manganese in the brain, usually from workplace exposure, causing slowness, stiffness, speech and balance problems, and mood changes."),
  ("Who is at risk of manganese toxicity?", "Welders, miners and steel workers, people on long-term IV feeding, people with severe liver disease, and people injecting home-made drugs made with permanganate."),
  ("Can you be deficient in manganese?", "Deficiency is extremely rare, as manganese is in grains, nuts, tea and many other foods.")],
 [("Safe Work Australia: welding", "https://www.safeworkaustralia.gov.au/", "Workplace safety guidance. Free."), POISONS],
 [("NIH Office of Dietary Supplements: Manganese", ODS % "Manganese")],
 [("Thallium", "/thallium/"), ("Heavy metal testing", "/heavy-metal-testing/"), ("Lead", "/lead/"), ("Mercury", "/mercury/")],
 groups=["Brain and nerves"], blurb="Welders, mining and a Parkinson-like movement disorder that levodopa rarely helps.",
 search="manganese toxicity manganism welding fumes mining parkinsonism permanganate ephedrone iv feeding liver disease")

fact("chromium",
 "Chromium: Workplace Exposure, Hip Implants and Supplement Claims",
 "Chromium explained: the difference between the trivalent chromium in food and the toxic hexavalent chromium at work, health effects, metal-on-metal hips, and the weak evidence for chromium supplements in diabetes.",
 "Chromium", "Chromium toxicity",
 "Chromium comes in two very different forms. Trivalent chromium is the form in food and supplements and is low risk. Hexavalent chromium, from chrome plating, welding stainless steel and some industries, is toxic and causes cancer.",
 h2("Hexavalent chromium at work", [
   "Chrome plating, welding and cutting stainless steel, cement work, leather tanning, some paints and pigments",
   "Skin: allergic dermatitis and painful ulcers (“chrome holes”)",
   "Nose: ulcers and a hole in the nasal septum",
   "Lungs: asthma, and a higher risk of lung and sinus cancer with long exposure"]) +
 '<p class="callout"><b>Work with chrome?</b> Use extraction, gloves and respiratory protection, and ask about health monitoring. Tell your GP about your job if you have a persistent rash, nose bleeds or crusting, or breathing symptoms.</p>' +
 h2("Hip implants", [
   "Worn metal-on-metal hips release chromium along with cobalt",
   "Blood chromium and cobalt are monitored together"]) +
 h2("Chromium supplements", [
   "Marketed for blood sugar, weight loss and muscle",
   "Trials show small and inconsistent effects on blood sugar, and little or no effect on weight",
   "Not a substitute for diabetes medicines, diet and exercise",
   "Rare reports of kidney and liver problems with high doses"]) +
 '<p class="sass">Chromium picolinate: big promises, small numbers, shiny label.</p>' +
 h2("Food sources", [
   "Wholegrains, broccoli, meat, nuts and brewer’s yeast",
   "True deficiency is rare and mostly seen with long-term IV feeding"]) +
 h2("Weird history", [
   "Chromium is named from the Greek chroma, colour, because its compounds are so vividly coloured",
   "Rubies are red and emeralds green partly thanks to traces of chromium"]),
 [("Is chromium toxic?", "Hexavalent chromium, found in some workplaces, is toxic and can cause skin ulcers, nasal damage, asthma and cancer. Trivalent chromium in food is low risk."),
  ("Do chromium supplements help diabetes?", "Trials show small, inconsistent effects on blood sugar. They don’t replace proven diabetes treatment."),
  ("What is a chrome hole?", "A painful, slow-healing skin ulcer caused by contact with hexavalent chromium at work.")],
 [("Safe Work Australia", "https://www.safeworkaustralia.gov.au/", "Workplace exposure guidance. Free."), POISONS],
 [("NIH Office of Dietary Supplements: Chromium", ODS % "Chromium"), ("Zhong Q et al. Prosthetic metals: release, metabolism and toxicity (Int J Nanomedicine 2024)", "https://pubmed.ncbi.nlm.nih.gov/38855732/")],
 [("Cobalt", "/cobalt/"), ("Heavy metal testing", "/heavy-metal-testing/"), ("Type 2 diabetes", "/type-2-diabetes/"), ("Contact dermatitis", "/contact-dermatitis/")],
 groups=["Other"], blurb="Toxic hexavalent chromium at work, metal hips, and weak supplement claims.",
 search="chromium hexavalent chrome plating welding nasal septum perforation chrome holes lung cancer picolinate supplement diabetes")

fact("aluminium",
 "Aluminium: Antacids, Deodorant, Vaccines and Dementia Myths",
 "Aluminium explained: where you’re exposed, when it’s genuinely a problem (kidney failure), and what the evidence says about aluminium, deodorant, cookware, vaccines and Alzheimer’s disease.",
 "Aluminium", "Aluminium toxicity",
 "Aluminium is the most common metal in the Earth’s crust, and it’s in food, water, antacids and many products. Healthy kidneys remove the small amount you absorb. Aluminium toxicity is a real problem mainly for people with kidney failure.",
 h2("When it’s a real problem", [
   "Kidney failure, especially with long-term aluminium-containing antacids or phosphate binders",
   "In the past, dialysis water with aluminium caused bone disease, anaemia and dementia (“dialysis dementia”), now prevented by water treatment",
   "Premature babies on long-term IV feeding",
   "Heavy workplace exposure to aluminium dust"]) +
 h2("Common worries", [
   "<b>Alzheimer’s:</b> despite decades of research, there’s no convincing evidence that everyday aluminium exposure causes Alzheimer’s disease",
   "<b>Deodorant and breast cancer:</b> large studies haven’t shown a link",
   "<b>Cookware and foil:</b> tiny amounts move into acidic or salty foods; this is safe for people with healthy kidneys",
   "<b>Vaccines:</b> the tiny amounts of aluminium in some vaccines help them work and are safe; babies get more aluminium from milk and food"]) +
 '<p class="sass">Aluminium and Alzheimer’s: the myth that refuses to oxidise.</p>' +
 h2("Testing", [
   "Blood aluminium is checked in people on dialysis",
   "Hair and urine “toxic metal” tests from alternative practitioners are unreliable and not recommended"]) +
 skip([("“Detox” chelation for aluminium", "Not needed with healthy kidneys, and chelation has real risks."),
   ("Throwing out aluminium pans to prevent dementia", "No evidence it changes dementia risk.")]) +
 '<p class="sass">Your kidneys are the detox. They don’t charge by the session.</p>' +
 h2("Weird history", [
   "In the 1850s aluminium was worth more than gold. Napoleon III reportedly gave his most honoured guests aluminium cutlery",
   "Australians and Brits say aluminium; Americans say aluminum. The man who named it, Humphry Davy, used both spellings"]),
 [("Does aluminium cause Alzheimer’s?", "There’s no convincing evidence that everyday aluminium exposure from food, cookware, deodorant or vaccines causes Alzheimer’s disease."),
  ("Who is at risk of aluminium toxicity?", "Mainly people with kidney failure, especially if they take aluminium-containing antacids or binders, and premature babies on long-term IV feeding."),
  ("Is the aluminium in vaccines safe?", "Yes. The tiny amounts help vaccines work and are much less than babies get from milk and food.")],
 [("Dementia Australia", "https://www.dementia.org.au/", "Information and support. Free."), ("Australian Immunisation Handbook", "https://immunisationhandbook.health.gov.au/", "Vaccine information. Free.")],
 [("Vlasak T et al. Aluminum exposure and cognitive performance: meta-analysis (Sci Total Environ 2023)", "https://pubmed.ncbi.nlm.nih.gov/37777128/")],
 [("Heavy metal testing", "/heavy-metal-testing/"), ("Dementia prevention", "/dementia-prevention/"), ("Chronic kidney disease", "/chronic-kidney-disease/"), ("Copper", "/copper/")],
 groups=["Other"], blurb="Real risk in kidney failure; myths about deodorant, pans, vaccines and Alzheimer’s.",
 search="aluminium aluminum toxicity alzheimer deodorant cookware foil vaccine adjuvant kidney failure dialysis antacids")
