# Content for /blood-tests/ (built by gen_bloodtests.py). Numbers checked against the sources listed on each page, November 2026.
UPDATED = "Updated 8 November 2026"
UPDATED_ISO = "2026-11-08"

PTEX = "https://ptex.au/ptests.php?q="
HUB_R = ("/blood-tests/", "Guide", "Blood Test Results Explained")

PAGES = [
# ---------------------------------------------------------------- ferritin
dict(
slug="high-ferritin", crumb="High ferritin", test="Serum ferritin", group="Iron", cls="l",
title="High Ferritin: What It Means and When to Worry",
h1="High Ferritin",
desc="High ferritin explained: normal ranges, why it’s usually fatty liver, alcohol or inflammation, when to test for haemochromatosis, and when to worry.",
card="Usually fatty liver, alcohol or inflammation, not too much iron. When to check for haemochromatosis.",
lede="Ferritin is the protein that stores iron. A high level can mean too much iron, but far more often it’s a sign of inflammation, alcohol or a fatty liver. Your doctor works out which with a couple of simple follow-up tests.",
qa="A ferritin above about 200 µg/L in women or 300 µg/L in men is high. About 9 in 10 high results come from fatty liver, alcohol, inflammation or infection, not iron overload. A fasting transferrin saturation over 45% points to haemochromatosis. Ferritin over 1000 µg/L needs specialist review.",
body="""
<h2>What the test measures</h2>
<p>Ferritin stores iron inside your cells, and a little leaks into the blood, so the blood level mirrors your iron stores. But ferritin is also an <b>acute-phase protein</b>: it rises with inflammation, infection, liver damage and alcohol whether or not you have extra iron. That’s why a high ferritin on its own doesn’t prove iron overload.</p>
<h2>Typical adult ranges</h2>
<ul><li><b>Women:</b> about 30–200 µg/L</li><li><b>Men:</b> about 30–300 µg/L</li><li>µg/L is the same number as ng/mL, the unit used in the US.</li><li>There is no single standard range, and some labs use a lower limit of 15–20 µg/L. Use the range on your report.</li></ul>
<h2>What a high result usually means</h2>
<p><b>Common causes</b> (about 90% of high results):</p>
<ul><li><b>Fatty liver and metabolic syndrome</b>: carrying extra weight around the middle, type 2 diabetes or prediabetes, high triglycerides. See <a href="/fatty-liver/">fatty liver</a>.</li><li><b>Alcohol</b>, even regular moderate drinking.</li><li><b>Inflammation or infection</b>: a recent virus, a flare of arthritis, inflammatory bowel disease.</li><li><b>Liver disease</b> such as hepatitis B or C.</li><li><b>Iron tablets or an iron infusion</b> in the last few weeks or months.</li><li>Kidney disease and some cancers.</li></ul>
<p><b>Less common but important:</b></p>
<ul><li><b>Haemochromatosis</b>: an inherited tendency to absorb too much iron. About 1 in 200 people of northern European ancestry carry the high-risk gene pair (two copies of C282Y), though not all of them build up harmful amounts of iron.</li><li><b>Iron overload from repeated blood transfusions</b>, for example in thalassaemia.</li><li><b>Blood disorders</b> that break down red cells or make them poorly.</li><li><b>Extremely high ferritin</b>, often in the tens of thousands, in someone who is very unwell with fever: rare conditions such as haemophagocytic lymphohistiocytosis (HLH) or adult-onset Still’s disease. These are hospital problems, not GP-letter problems.</li></ul>
<h2>Symptoms</h2>
<p>High ferritin itself causes no symptoms. The cause might: tiredness, joint pain (classically the knuckles of the index and middle fingers in haemochromatosis), low libido or erectile problems, and abnormal liver tests. Many people with early haemochromatosis feel completely well.</p>
<h2>What happens next</h2>
<ul><li><b>Repeat iron studies</b>, ideally fasting and in the morning, including <b>transferrin saturation</b> (how full your iron transport protein is). Repeat once you’ve recovered from any recent illness.</li><li><b>Transferrin saturation over 45%</b> suggests iron overload, and your GP will usually order an <b>HFE gene test</b>. A normal transferrin saturation makes haemochromatosis very unlikely.</li><li><b>Liver tests, CRP, glucose and lipids</b>, and often a liver ultrasound if fatty liver is likely.</li><li><b>Treat the cause.</b> Weight loss and less alcohol often bring ferritin down over months. Stop iron supplements unless you’ve been told to take them.</li><li><b>Haemochromatosis</b> is treated by regularly removing blood (venesection). In Australia, Lifeblood can collect this blood from many people with haemochromatosis.</li><li><b>Referral</b> to a gastroenterologist, hepatologist or haematologist if ferritin is over 1000 µg/L, liver tests are abnormal, or the cause isn’t clear.</li></ul>
""",
urgent="<b>See your GP within a week or two</b> if your ferritin is over 1000 µg/L: specialist review is advised because of the risk of liver scarring. <b>See a doctor the same day</b> for yellow skin or eyes, a swollen tummy, vomiting blood or confusion. <b>Get urgent help</b> (000 in Australia, or your local emergency number) if someone is very unwell with a high fever and has been told their ferritin is in the thousands.",
faqs=[
("Is a ferritin of 500 dangerous?", "Usually not on its own. Most ferritin results between 300 and 1000 µg/L come from fatty liver, alcohol or inflammation rather than iron overload, and below 1000 µg/L the risk of iron damaging your liver is very low unless you have haemochromatosis. Your doctor will check transferrin saturation and liver tests to find the cause."),
("What ferritin level is too high?", "Above about 200 µg/L in women or 300 µg/L in men is above the usual range. Over 1000 µg/L calls for specialist review because the risk of liver scarring rises. Extremely high levels, in the tens of thousands, are rare and usually found in people who are already very unwell."),
("Does high ferritin mean I have haemochromatosis?", "Probably not. Only about 1 in 10 high ferritin results is due to iron overload. A transferrin saturation over 45% raises the possibility, and a gene test confirms it. A normal transferrin saturation makes haemochromatosis very unlikely."),
("Can alcohol raise ferritin?", "Yes. Regular drinking is one of the commonest causes of a high ferritin, even without liver disease. Cutting back often brings it down over a few months, and your doctor may simply repeat the test."),
("Can an infection or a cold raise ferritin?", "Yes. Ferritin rises with infection and inflammation, so a result taken during or soon after an illness can be falsely high. Many doctors repeat the test a few weeks after you’ve recovered."),
("Should I stop my iron tablets if my ferritin is high?", "Usually yes, unless a doctor has told you to keep taking them, for example after an infusion plan for a specific reason. Check multivitamins too, since many contain iron. Talk to your GP before stopping anything prescribed."),
],
sources=[
(PTEX + "Ferritin", "Pathology Tests Explained (RCPA): Ferritin (ranges and what affects the result)"),
(PTEX + "Iron+studies", "Pathology Tests Explained (RCPA): Iron studies"),
("https://www.racgp.org.au/afp/2012/december/elevated-serum-ferritin", "Australian Family Physician 2012: Elevated serum ferritin, what should GPs know? (causes, transferrin saturation, the 1000 µg/L threshold)"),
("https://pubmed.ncbi.nlm.nih.gov/29672840/", "Cullis et al, British Journal of Haematology 2018: BSH guideline on investigating a raised serum ferritin"),
("https://www.nnuh.nhs.uk/publication/download/investigations-of-a-raised-ferritin-result-guidance-8568-v7", "Norfolk and Norwich University Hospitals NHS: Investigating a raised ferritin result (GP guidance)"),
],
related=[HUB_R, ("/iron/", "Fact sheet", "Iron Deficiency"), ("/fatty-liver/", "Fact sheet", "Fatty Liver (MASLD)"), ("/blood-tests/high-alt/", "Blood test", "High ALT (SGPT)")],
),
# ---------------------------------------------------------------- platelets
dict(
slug="low-platelets", crumb="Low platelets", test="Platelet count", group="Blood count", cls="n",
title="Low Platelets (Thrombocytopenia): Causes and Next Steps",
h1="Low Platelets (Thrombocytopenia)",
desc="Low platelets explained: normal range, common causes like viruses, medicines and ITP, symptoms, next tests, and the counts that need same-day care.",
card="Normal range, common causes, bruising and bleeding, and why under 20 needs same-day care.",
lede="Platelets are tiny cell fragments that plug leaks in blood vessels. A mildly low count is common and often harmless, especially after a virus. Very low counts raise the risk of bleeding and need prompt attention.",
qa="Platelets below 150 × 10⁹/L are low. Mild drops of 100–150 are common after viral infections, with some medicines, alcohol or in pregnancy, and often need just a repeat test. Below 50, bleeding after injury becomes more likely. Below 20 needs same-day medical review; below 10 is an emergency.",
body="""
<h2>What the test measures</h2>
<p>The platelet count is part of a full blood count (FBC). Platelets are made in the bone marrow, live about a week, and clump together with clotting proteins to stop bleeding. A low count is called <b>thrombocytopenia</b>.</p>
<h2>Typical adult ranges</h2>
<ul><li><b>Normal:</b> 150–400 × 10⁹/L (150,000–400,000 per microlitre in US units)</li><li><b>Mildly low:</b> 100–149</li><li><b>Moderately low:</b> 50–99</li><li><b>Severely low:</b> under 50</li></ul>
<p><b>A false low is common.</b> Platelets sometimes clump in the blood tube (pseudothrombocytopenia), so the machine undercounts them. A blood film or a repeat sample in a different tube (citrate) sorts this out.</p>
<h2>What a low result usually means</h2>
<p><b>Common causes:</b></p>
<ul><li><b>A recent viral infection</b>, including glandular fever, flu and COVID-19. Counts usually recover within weeks.</li><li><b>Medicines</b>: heparin, some antibiotics, valproate, quinine and others.</li><li><b>Alcohol and liver disease</b>: alcohol slows platelet production, and an enlarged spleen from liver disease holds on to platelets.</li><li><b>Immune thrombocytopenia (ITP)</b>: the immune system destroys platelets. One of the commonest causes of an isolated low count.</li><li><b>Pregnancy</b>: gestational thrombocytopenia affects up to 1 in 10 pregnancies, is usually mild and settles after birth.</li><li><b>Low B12 or folate.</b> See <a href="/blood-tests/low-b12/">low B12</a>.</li></ul>
<p><b>Less common but important:</b></p>
<ul><li><b>Leukaemia, lymphoma, myelodysplasia</b> or other bone marrow problems, usually with other abnormal counts.</li><li><b>Heparin-induced thrombocytopenia (HIT)</b>: a fall of more than half, 5–10 days after starting heparin. Paradoxically it causes clots.</li><li><b>Thrombotic thrombocytopenic purpura (TTP) and haemolytic uraemic syndrome (HUS)</b>: low platelets with broken red cells, kidney problems, fever or confusion.</li><li><b>HELLP syndrome</b> in late pregnancy, and sepsis with abnormal clotting (DIC).</li><li>Rare inherited platelet disorders.</li></ul>
<h2>Symptoms</h2>
<ul><li>Often none, especially above 50 × 10⁹/L.</li><li>Easy bruising, and tiny red or purple dots on the skin that don’t fade when pressed (petechiae), often on the lower legs.</li><li>Nosebleeds or bleeding gums, heavy periods, or bleeding that takes longer to stop after a cut.</li><li>Blood in urine or bowel motions.</li></ul>
<h2>What happens next</h2>
<ul><li><b>Repeat the FBC with a blood film</b> to rule out clumping and look at the other cells.</li><li><b>Review medicines, alcohol and recent illnesses.</b></li><li><b>Other tests</b> may include B12 and folate, liver tests, HIV and hepatitis C, and a pregnancy test.</li><li><b>A mild, stable drop</b> with normal other counts and no bleeding is usually rechecked over a few weeks.</li><li><b>Haematology referral</b> for a new moderate or severe drop without a clear cause, a falling count, or other abnormal blood cells.</li><li>Until you know more, avoid aspirin and anti-inflammatories such as ibuprofen unless a doctor says otherwise. Paracetamol is usually fine.</li></ul>
""",
urgent="<b>See a doctor the same day</b> if your platelets are under 20 × 10⁹/L (20,000 per microlitre): hospital admission is often advised when this is a new finding. <b>Under 10 × 10⁹/L is an emergency.</b> <b>Get urgent help</b> (000 in Australia, or your local emergency number) at any count for bleeding that won’t stop, vomiting blood, black or bloody bowel motions, a sudden severe headache, or low platelets with confusion, fever or reduced urine. Tell a doctor straight away if your count falls by half within 5–10 days of starting heparin, or if you’re pregnant with headache, upper tummy pain or high blood pressure.",
faqs=[
("What platelet count is dangerous?", "Bleeding risk rises as the count falls, but not in a straight line. Above 50 × 10⁹/L most people have no symptoms; 20–50 can cause easy bruising and longer bleeding after injury; under 20 needs same-day review; and under 10 carries a high risk of spontaneous bleeding and is treated as an emergency."),
("Is a platelet count of 120 bad?", "It’s mildly low and often harmless. Common reasons include a recent virus, alcohol, some medicines or pregnancy, and some people simply run a little low. Your GP will usually repeat it with a blood film and look at your other counts."),
("Can a virus lower platelets?", "Yes. Many viral infections, including glandular fever, flu and COVID-19, can lower platelets for a few weeks. A repeat test after you’ve recovered usually shows the count coming back up."),
("Can low platelets be a sign of leukaemia?", "Occasionally, but leukaemia usually affects the other blood counts too, and often causes symptoms such as fevers, weight loss, tiredness or swollen glands. A mildly low platelet count with otherwise normal results is far more likely to have a harmless cause."),
("What should I avoid if my platelets are low?", "Avoid aspirin and anti-inflammatories like ibuprofen unless your doctor says otherwise, as they make platelets work less well. Go easy on alcohol. If your count is very low, avoid contact sports and tell your dentist or surgeon before any procedure."),
("Are low platelets in pregnancy normal?", "A mild fall is common: gestational thrombocytopenia affects up to 1 in 10 pregnancies and settles after birth. Your midwife or doctor will still check it, because conditions like pre-eclampsia, HELLP and ITP can also lower platelets."),
],
sources=[
(PTEX + "Platelet+count", "Pathology Tests Explained (RCPA): Platelet count (range and causes)"),
("https://www.aafp.org/pubs/afp/issues/2022/0900/thrombocytopenia.html", "Gauer and Whitaker, American Family Physician 2022: Thrombocytopenia, evaluation and management (severity, red flags, pseudothrombocytopenia)"),
("https://www.hematology.org/-/media/Hematology/Files/Education/Clinicians/Guidelines-Quality/Documents/ASH-ITP-Pocket-Guide-FOR-WEB-1204.pdf", "American Society of Hematology 2019: ITP guideline pocket guide (admission under 20 × 10⁹/L, treatment under 30)"),
],
related=[HUB_R, ("/blood-tests/low-neutrophils/", "Blood test", "Low Neutrophils"), ("/heavy-periods/", "Fact sheet", "Heavy Periods"), ("/glandular-fever/", "Fact sheet", "Glandular Fever")],
),
# ---------------------------------------------------------------- CRP
dict(
slug="high-crp", crumb="High CRP", test="C-reactive protein (CRP)", group="Inflammation", cls="m",
title="High CRP and hs-CRP: What Your Result Means",
h1="High CRP (C-Reactive Protein)",
desc="High CRP explained: normal range, what mild and very high results mean, hs-CRP and heart risk, whether stress raises CRP, and when it’s urgent.",
card="Mild, moderate and very high results, hs-CRP for heart risk, and whether stress counts.",
lede="CRP is made by your liver when there’s inflammation anywhere in the body. It rises within hours of an infection or injury and falls quickly as you get better. It tells you something is going on, not what or where.",
qa="Most labs call CRP under 5 mg/L normal. Mild rises of 5–10 are common with colds, smoking, extra weight or poor sleep. Most infections and inflammatory flares push it over 10, and results in the hundreds suggest bacterial infection or major inflammation. hs-CRP over 3 mg/L signals higher heart risk.",
body="""
<h2>What the test measures</h2>
<p>C-reactive protein is an acute-phase protein: the liver pumps it out within hours of infection, injury or an inflammatory flare, and levels can rise several hundred-fold. Because it falls within days once the cause settles, it’s useful for tracking whether treatment is working. It doesn’t show where the inflammation is.</p>
<p><b>Standard CRP vs hs-CRP.</b> It’s the same protein. The high-sensitivity (hs-CRP) test measures very low levels accurately and is used to fine-tune heart disease risk in people who are otherwise well.</p>
<h2>Typical adult ranges</h2>
<ul><li><b>Standard CRP:</b> under 5 mg/L in most Australian labs (some use under 3 or under 10).</li><li>US labs often report mg/dL: 10 mg/L is 1 mg/dL.</li><li><b>hs-CRP and heart risk</b> (AHA/CDC): under 1 mg/L lower risk, 1–3 average, over 3 higher. An hs-CRP over 10 mg/L isn’t used for heart risk: it points to infection or inflammation instead.</li></ul>
<h2>What a high result usually means</h2>
<p><b>Common causes:</b></p>
<ul><li><b>Mild rises (about 5–10 mg/L):</b> a cold, extra weight, smoking, poor sleep, diabetes, pregnancy, gum disease, and oral oestrogen (the pill or HRT tablets).</li><li><b>Infections</b>: chest, urine, skin and throat infections, and viruses. Most infections push CRP over 10 mg/L.</li><li><b>Injury and surgery</b>: CRP rises for several days after an operation.</li><li><b>Inflammatory conditions</b>: rheumatoid arthritis, polymyalgia rheumatica, gout flares, inflammatory bowel disease.</li></ul>
<p><b>Less common but important:</b></p>
<ul><li>Abscesses, bone or heart valve infections.</li><li>Giant cell arteritis and other vasculitis.</li><li>Pancreatitis and some cancers.</li></ul>
<p>Very high results, in the hundreds, are more typical of bacterial infection, major injury or surgery than of viruses, but there’s overlap.</p>
<h2>Symptoms</h2>
<p>CRP causes no symptoms itself. What matters is the cause: fever, pain, swelling, cough, burning urine, joint stiffness, weight loss or night sweats.</p>
<h2>What happens next</h2>
<ul><li><b>Interpret it with your symptoms.</b> A CRP of 15 in someone with a cold and a CRP of 15 in someone with unexplained weight loss mean different things.</li><li><b>Repeat it</b> in a few weeks if it’s mildly high with no obvious cause and you feel well.</li><li><b>Other tests</b> may include a full blood count, ESR, urine test, kidney and liver tests, or a chest X-ray, guided by symptoms.</li><li><b>For hs-CRP</b>, two results at least 2 weeks apart are averaged, taken when you’re well.</li></ul>
""",
urgent="<b>Get urgent help</b> (000 in Australia, or your local emergency number) for a high CRP with signs of sepsis: confusion, fast breathing, shaking chills, mottled or very pale skin, or feeling the sickest you’ve ever felt. <b>See a doctor the same day</b> if you’re over 50 with a new headache, scalp tenderness, jaw pain when chewing or any change in vision: this can be giant cell arteritis, which can threaten sight. <b>See your GP soon</b> for a raised CRP with weight loss, night sweats or persistent pain.",
faqs=[
("Can stress raise CRP?", "A little. Long-term stress, depression and poor sleep are linked with slightly higher CRP, usually in the low single digits. Stress won’t explain a CRP of 30 or 100: that needs a proper look for infection or inflammation."),
("What CRP level is concerning?", "It depends on how you are. Most infections and inflammatory flares push CRP over 10 mg/L, and results in the hundreds suggest bacterial infection or major inflammation. A mildly raised CRP in someone who feels well is often from a recent cold, smoking or extra weight."),
("Is a CRP of 7 bad?", "It’s mildly raised and usually not worrying on its own. A recent cold, carrying extra weight, smoking, poor sleep or the contraceptive pill can all do it. If you feel well, your doctor may repeat it in a few weeks."),
("What’s the difference between CRP and hs-CRP?", "They measure the same protein. Standard CRP looks for infection and inflammation; hs-CRP measures very low levels to help estimate heart disease risk in otherwise healthy people. Under 1 mg/L is lower risk, 1–3 average and over 3 higher."),
("Can CRP be high without an infection?", "Yes. Injury, surgery, autoimmune conditions such as rheumatoid arthritis and polymyalgia rheumatica, gout, inflammatory bowel disease, some cancers and even obesity can raise CRP."),
("How fast does CRP go down?", "Quickly. CRP falls within days once the cause starts to settle, which is why doctors use it to check whether treatment is working. A CRP that isn’t falling after a few days of treatment can be a sign the infection isn’t responding."),
],
sources=[
(PTEX + "C-reactive+protein", "Pathology Tests Explained (RCPA): C-reactive protein"),
("https://doi.org/10.1161/01.CIR.0000052939.59093.45", "Pearson et al, Circulation 2003: AHA/CDC statement on inflammatory markers and cardiovascular disease (hs-CRP categories)"),
("https://www.ccjm.org/content/ccjom/70/7/634.full.pdf", "Shishehbor, Bhatt and Topol, Cleveland Clinic Journal of Medicine 2003: Using CRP to assess cardiovascular risk"),
("https://ueaeprints.uea.ac.uk/73818/1/Accepted_Manuscript.pdf", "Mackie et al, Rheumatology 2020: British Society for Rheumatology guideline on giant cell arteritis"),
],
related=[HUB_R, ("/blood-tests/high-esr/", "Blood test", "High ESR"), ("/polymyalgia/", "Fact sheet", "Polymyalgia Rheumatica"), ("/blood-tests/high-ferritin/", "Blood test", "High Ferritin")],
),
# ---------------------------------------------------------------- ALT
dict(
slug="high-alt", crumb="High ALT", test="Alanine aminotransferase (ALT)", group="Liver", cls="l",
title="High ALT (SGPT): What Raised Liver Enzymes Mean",
h1="High ALT (SGPT)",
desc="High ALT (SGPT) explained: normal range, common causes like fatty liver, alcohol and medicines, the other liver tests, next steps and red flags.",
card="ALT and SGPT are the same test. Fatty liver, alcohol and medicines lead the list. The other liver tests, decoded.",
lede="ALT is an enzyme that sits mostly inside liver cells. When they’re irritated or damaged, ALT leaks into the blood. Its old name is SGPT, so if your report says SGPT, it’s the same test.",
qa="ALT (also called SGPT) above about 40 U/L in men or 35 U/L in women is raised. Fatty liver is the commonest cause, followed by alcohol, medicines and supplements, hard exercise and viral hepatitis. Even mild rises deserve a cause. ALT over 10 times the upper limit usually means acute hepatitis and needs prompt review.",
body="""
<h2>What the test measures</h2>
<p>Alanine aminotransferase (ALT), once called serum glutamic-pyruvic transaminase (SGPT), is part of your liver function tests (LFTs). It’s the most liver-specific of the liver enzymes. A high ALT means liver cells are irritated, but the level doesn’t always match how serious the cause is.</p>
<h2>Typical adult ranges</h2>
<ul><li><b>Men:</b> 5–40 U/L</li><li><b>Women:</b> 5–35 U/L</li><li>These are the common Australian ranges. U/L and IU/L are the same number. Some experts, including the American College of Gastroenterology, suggest healthy upper limits closer to 29–33 U/L for men and 19–25 U/L for women.</li></ul>
<h2>The other liver tests</h2>
<ul><li><b>AST (SGOT):</b> also found in muscle and heart, so it rises with exercise and muscle injury. AST more than twice ALT is a classic pattern in alcohol-related liver disease.</li><li><b>GGT:</b> raised by alcohol, fatty liver, some medicines and bile duct problems.</li><li><b>ALP:</b> comes from bile ducts and bone. Raised with bile duct blockage, and normally higher in growing teenagers and pregnancy.</li><li><b>Bilirubin:</b> high levels cause jaundice. A mildly raised bilirubin with otherwise normal tests is often Gilbert’s syndrome, which is harmless.</li><li><b>Albumin and INR:</b> show how well the liver is making proteins. These fall late in serious liver disease.</li></ul>
<h2>What a high result usually means</h2>
<p><b>Common causes:</b></p>
<ul><li><b>Fatty liver</b> (MASLD), linked with weight, type 2 diabetes and high triglycerides. The commonest cause. See <a href="/fatty-liver/">fatty liver</a>.</li><li><b>Alcohol.</b></li><li><b>Medicines and supplements</b>: paracetamol above the recommended dose, statins (usually mild), some antibiotics such as amoxicillin-clavulanate, methotrexate, and herbal products such as green tea extract and turmeric supplements.</li><li><b>Hard exercise or muscle injury</b>, for several days afterwards.</li><li><b>Viral hepatitis</b>: hepatitis B and C (long-term), or a recent infection such as glandular fever.</li></ul>
<p><b>Less common but important:</b></p>
<ul><li>Haemochromatosis (see <a href="/blood-tests/high-ferritin/">high ferritin</a>), autoimmune hepatitis, coeliac disease and thyroid disease.</li><li>Wilson disease (in younger people) and alpha-1 antitrypsin deficiency.</li><li><b>Very high ALT (over 10 times normal):</b> acute viral hepatitis (A, B or E), paracetamol overdose, drug reactions, a passing gallstone, or a sudden drop in blood flow to the liver.</li></ul>
<h2>Symptoms</h2>
<p>Usually none. Some people have tiredness or discomfort under the right ribs. Yellow skin or eyes, dark urine, pale bowel motions and itch suggest a more serious problem.</p>
<h2>What happens next</h2>
<ul><li><b>Look for the cause</b>, even if the rise is mild. UK guidance advises a liver screen rather than simply repeating the test, unless a short-lived cause (like a recent hard workout) is likely.</li><li><b>Usual tests:</b> liver ultrasound, hepatitis B and C, ferritin and transferrin saturation, liver autoantibodies and immunoglobulins; sometimes coeliac and thyroid tests.</li><li><b>Review alcohol, medicines and supplements</b>, including anything from a health-food shop or online.</li><li><b>If fatty liver is likely</b>, a FIB-4 score (from your age, ALT, AST and platelets) or a FibroScan estimates liver scarring.</li><li><b>Referral</b> to a liver specialist if scarring is likely, the cause is unclear, or ALT stays high.</li></ul>
""",
urgent="<b>See a doctor the same day</b> for yellow skin or eyes, dark urine with pale bowel motions, or an ALT over 10 times the upper limit (roughly 400 U/L or more) if you feel unwell. <b>Get urgent help</b> (000 in Australia, or your local emergency number) for confusion or drowsiness, vomiting blood or black bowel motions, or if you’ve taken more paracetamol than the recommended dose, even if you feel fine.",
faqs=[
("What does SGPT high mean?", "SGPT is the old name for ALT, so a high SGPT means the same as a high ALT: liver cells are irritated. The commonest causes are fatty liver, alcohol and medicines or supplements. Your doctor will look for the cause with a few more tests."),
("Is an ALT of 60 dangerous?", "It’s mildly raised and not dangerous in itself, but it’s worth finding out why. Fatty liver and alcohol are the usual causes. Your GP will usually check for hepatitis, iron overload and other causes, and may arrange a liver ultrasound."),
("Can exercise raise ALT?", "Yes. Heavy weights, long runs or a muscle injury can raise ALT and especially AST for several days. Avoid hard workouts for a few days before a repeat test so the result isn’t muddied."),
("Which medicines and supplements raise ALT?", "Common ones include paracetamol above the recommended dose, statins (usually a small rise), some antibiotics such as amoxicillin-clavulanate, methotrexate, and some herbal products such as green tea extract and turmeric supplements. Never stop a prescribed medicine without talking to your doctor."),
("How can I lower my ALT?", "Treat the cause. For fatty liver, losing 7–10% of your body weight often brings ALT down and can reverse liver fat. Cutting back on alcohol and stopping unnecessary supplements also help."),
("What’s the difference between ALT and AST?", "Both are liver enzymes, but AST is also found in muscle and heart, so ALT is more specific to the liver. AST more than twice ALT is a classic clue to alcohol-related liver disease."),
],
sources=[
(PTEX + "Alanine+Aminotransferase+%28ALT%29", "Pathology Tests Explained (RCPA): Alanine aminotransferase (ALT)"),
(PTEX + "LFT+%28Liver+function+tests%29", "Pathology Tests Explained (RCPA): Liver function tests"),
("https://pubmed.ncbi.nlm.nih.gov/29122851/", "Newsome et al, Gut 2018: British Society of Gastroenterology guideline on abnormal liver blood tests"),
("https://doi.org/10.1038/ajg.2016.517", "Kwo, Cohen and Lim, American Journal of Gastroenterology 2017: ACG guideline on abnormal liver chemistries"),
],
related=[HUB_R, ("/fatty-liver/", "Fact sheet", "Fatty Liver (MASLD)"), ("/blood-tests/high-ferritin/", "Blood test", "High Ferritin"), ("/coeliac/", "Fact sheet", "Coeliac Disease")],
),
# ---------------------------------------------------------------- eGFR
dict(
slug="low-egfr", crumb="Low eGFR", test="Estimated glomerular filtration rate (eGFR)", group="Kidney", cls="m",
title="Low eGFR: What Your Kidney Result Means",
h1="Low eGFR",
desc="Low eGFR explained: kidney stages, one-off dips from dehydration, meat or creatine, chronic kidney disease, next tests and when to see a specialist.",
card="Kidney stages G1–G5, the one-off dips, and when to see a kidney specialist.",
lede="eGFR estimates how much blood your kidneys filter each minute. It’s worked out from creatinine, a waste product from muscle, plus your age and sex. A single low result is often a temporary dip, so it’s always worth a repeat.",
qa="An eGFR over 90 is normal and 60–89 is often normal for age. Under 60 for at least 3 months, or albumin in the urine, means chronic kidney disease. One-off dips are common with dehydration, illness, a big meat meal or creatine. Retest within a week. Under 30 needs a kidney specialist.",
body="""
<h2>What the test measures</h2>
<p>Healthy kidneys filter waste such as creatinine out of the blood. When filtering slows, creatinine builds up and the calculated eGFR falls. Australian labs report it in mL/min/1.73 m² and usually show anything above 90 simply as “&gt;90”. Want to see how it’s calculated? Try our <a href="/tools/egfr-calculator/">eGFR calculator</a>.</p>
<h2>Kidney stages (KDIGO)</h2>
<ul><li><b>G1, 90 or more:</b> normal (kidney disease only if there are other signs of damage, such as albumin in urine)</li><li><b>G2, 60–89:</b> mildly reduced, and normal for many older adults</li><li><b>G3a, 45–59:</b> mildly to moderately reduced</li><li><b>G3b, 30–44:</b> moderately to severely reduced</li><li><b>G4, 15–29:</b> severely reduced</li><li><b>G5, under 15:</b> kidney failure</li></ul>
<p>Chronic kidney disease (CKD) means an eGFR under 60, or signs of kidney damage, for at least 3 months. eGFR falls slowly with age. It isn’t reliable in pregnancy, children, people on dialysis or at extremes of body size.</p>
<h2>What a low result usually means</h2>
<p><b>Temporary or misleading causes</b> (why a repeat matters):</p>
<ul><li><b>Dehydration</b> or a recent illness, especially vomiting and diarrhoea.</li><li><b>A meal of cooked meat</b> in the hours before the test.</li><li><b>Creatine supplements</b>, a very high-protein diet or a lot of muscle.</li><li><b>Medicines</b> that raise creatinine without harming the kidney, such as trimethoprim and fenofibrate. Blood pressure medicines (ACE inhibitors and ARBs) and SGLT2 inhibitors often cause a small, expected dip when started.</li></ul>
<p><b>Common long-term causes:</b></p>
<ul><li><b>Diabetes</b> and <b>high blood pressure</b>, the two biggest causes of CKD.</li><li>Ageing kidneys, heart disease and smoking.</li><li>Regular use of anti-inflammatories such as ibuprofen.</li></ul>
<p><b>Less common but important:</b></p>
<ul><li><b>Acute kidney injury</b>: a sudden drop from dehydration, infection, blockage or medicines.</li><li><b>Glomerulonephritis</b> (inflammation of the kidney filters), often with blood or protein in the urine.</li><li><b>Blockage</b>, for example from an enlarged prostate or kidney stones; polycystic kidney disease and other inherited conditions.</li></ul>
<h2>Symptoms</h2>
<p>Usually none until kidney function is quite low, which is why testing matters. Later symptoms include tiredness, swollen ankles, itch, poor appetite, nausea and getting up at night to pass urine.</p>
<h2>What happens next</h2>
<ul><li><b>Repeat the test within 7 days</b> if this is a new result under 60, to check for a sudden change. Avoid cooked meat for several hours beforehand.</li><li><b>Urine albumin-to-creatinine ratio (ACR)</b>: protein in the urine is as important as eGFR for predicting risk.</li><li><b>Blood pressure, blood sugar, cholesterol</b> and a urine test for blood.</li><li><b>A medicine review</b>: avoid anti-inflammatories, and some doses may need adjusting.</li><li><b>Treatment</b> focuses on protecting the kidneys: blood pressure control, an ACE inhibitor or ARB if there’s albumin in the urine, and often an <a href="/medicines/sglt2-inhibitors/">SGLT2 inhibitor</a>.</li><li><b>Kidney specialist referral</b> (Kidney Health Australia) for an eGFR under 30, an ACR of 30 mg/mmol or more, a sustained fall of 25% or more within 12 months (or 15 mL/min/1.73 m² in a year), or blood pressure above target despite three medicines.</li></ul>
""",
urgent="<b>See a doctor the same day</b> if your eGFR has dropped sharply from your usual level, especially if you’re passing much less urine, vomiting or feeling very unwell, or if you have blood in your urine with swelling and high blood pressure. <b>Get urgent help</b> (000 in Australia, or your local emergency number) for confusion, severe breathlessness or chest pain. An eGFR under 15 needs prompt specialist care.",
faqs=[
("Is an eGFR of 55 bad?", "It’s stage G3a, mildly to moderately reduced. If it stays there for 3 months it counts as chronic kidney disease, but most people at this level never need dialysis, especially without protein in the urine. The key steps are a repeat test, a urine ACR, and good blood pressure and diabetes control."),
("Can my eGFR go back up?", "Yes, if the low result was a temporary dip from dehydration, illness, a meat meal or a medicine. Loss from long-term kidney disease usually doesn’t recover, but treatment can slow or stop further decline."),
("Will drinking more water improve my eGFR?", "Only if you were dehydrated. Rehydrating can bring a dipped result back to your usual level, but drinking extra water beyond your normal needs won’t improve kidney function."),
("What eGFR level needs dialysis?", "Dialysis or a transplant is usually considered when eGFR falls below 15 with symptoms of kidney failure, though the decision depends on how you feel, not just the number. Many people with low eGFR are managed for years without dialysis."),
("Does eGFR go down with age?", "Yes. Kidney filtering slowly declines with age, so an eGFR of 60–89 is common and often normal in older adults if there are no other signs of kidney damage."),
("Can creatine supplements or protein shakes affect eGFR?", "Yes. Creatine supplements, a very high-protein diet and big muscles all raise creatinine, which makes eGFR look lower than your real kidney function. Tell your doctor if you use them; a cystatin C test can help."),
],
sources=[
(PTEX + "eGFR+%28Estimated+glomerular+filtration+rate%29", "Pathology Tests Explained (RCPA): eGFR"),
("https://kidney.org.au/wp-content/uploads/2025/12/CKD-Management-in-Primary-Care_handbook_2020.1.pdf", "Kidney Health Australia: CKD Management in Primary Care handbook (retesting, referral criteria)"),
("https://kdigo.org/guidelines/ckd-evaluation-and-management/", "KDIGO 2024 clinical practice guideline for the evaluation and management of CKD"),
("https://kidney.org.au/your-kidneys/what-is-kidney-disease/stages-of-kidney-disease/", "Kidney Health Australia: Stages of kidney disease"),
],
related=[HUB_R, ("/tools/egfr-calculator/", "Tool", "eGFR Calculator"), ("/blood-pressure/", "Fact sheet", "High Blood Pressure"), ("/type-2-diabetes/", "Fact sheet", "Type 2 Diabetes"), ("/medicines/sglt2-inhibitors/", "Medicine", "SGLT2 inhibitors")],
),
# ---------------------------------------------------------------- TSH
dict(
slug="high-tsh", crumb="High TSH", test="Thyroid stimulating hormone (TSH)", group="Thyroid", cls="s",
title="High TSH: What It Means and When to Treat",
h1="High TSH",
desc="High TSH explained: normal range, subclinical vs overt underactive thyroid, why it’s repeated, when levothyroxine is advised, pregnancy and biotin.",
card="Subclinical vs overt underactive thyroid, why it’s repeated, and when treatment starts.",
lede="TSH is the pituitary gland’s message to your thyroid. When the thyroid slows down, the pituitary shouts louder, so TSH goes up. A high TSH is the earliest sign of an underactive thyroid, but mild rises often settle by themselves.",
qa="TSH above about 4.0 mIU/L is high. With a low free T4, it means an underactive thyroid. With a normal free T4 it’s subclinical, and the test is usually repeated in 3 months because many settle. Treatment is generally recommended when TSH is 10 or more on two tests, and sooner in pregnancy.",
body="""
<h2>What the test measures</h2>
<p>Thyroid stimulating hormone (TSH) is made by the pituitary gland in the brain and tells the thyroid to make thyroxine (T4). Because TSH reacts strongly to small changes in thyroid hormone, it’s the best first test. If it’s abnormal, labs usually add <b>free T4</b>.</p>
<h2>Typical adult ranges</h2>
<ul><li><b>TSH:</b> about 0.4–4.0 mIU/L (some labs go up to 4.5–5.0). mIU/L and µIU/mL are the same number.</li><li>TSH tends to run a little higher in older people and varies through the day, peaking overnight.</li><li>Pregnancy uses its own, lower trimester ranges.</li></ul>
<p><b>Two patterns:</b></p>
<ul><li><b>High TSH, low free T4:</b> overt underactive thyroid (hypothyroidism). Usually treated.</li><li><b>High TSH, normal free T4:</b> subclinical hypothyroidism. Often watched first.</li></ul>
<h2>What a high result usually means</h2>
<p><b>Common causes:</b></p>
<ul><li><b>Hashimoto’s thyroiditis</b>, an autoimmune condition and the commonest cause in Australia. Thyroid antibodies (TPO antibodies) are usually positive.</li><li><b>Recovery from an illness</b>: TSH can rise for a while as you get better. Retest when you’re well.</li><li><b>After thyroiditis</b>, including after having a baby, or after treatment for an overactive thyroid.</li><li><b>Not enough levothyroxine</b>, or taking it with food, coffee, iron or calcium, which block absorption.</li><li><b>Medicines</b>: amiodarone, lithium and some cancer immunotherapies.</li></ul>
<p><b>Less common but important:</b></p>
<ul><li>Iodine deficiency (still common in parts of the world).</li><li>Rare pituitary causes and thyroid hormone resistance.</li><li><b>Lab interference</b>: high-dose biotin supplements and unusual antibodies can give false results.</li></ul>
<h2>Symptoms</h2>
<p>Tiredness, feeling cold, weight gain, constipation, dry skin, thinning hair, low mood, heavy periods and a slow pulse. Many people with a mildly high TSH have no symptoms at all. See <a href="/underactive-thyroid/">underactive thyroid</a>.</p>
<h2>What happens next</h2>
<ul><li><b>Repeat TSH and free T4 in about 3 months</b> (NICE), when you’re well, before deciding on treatment.</li><li><b>TPO antibodies</b>: if positive, the thyroid is more likely to slow down further over time.</li><li><b>Treatment</b> with levothyroxine is generally considered when TSH is <b>10 mIU/L or more on two tests 3 months apart</b>. Under 65 with symptoms and TSH above range but under 10, a 6-month trial may be offered.</li><li><b>If untreated</b>, recheck yearly if you have thyroid antibodies or past thyroid problems, or every 2–3 years if not.</li><li><b>Pregnant or trying?</b> Tell your GP promptly: targets are lower and treatment starts at lower levels.</li><li>Stop biotin (often in hair, skin and nail supplements) for a few days before testing; ask your lab how long.</li></ul>
""",
urgent="<b>See your GP within a few days</b> if you’re pregnant or planning pregnancy and your TSH is high, or if you have a new neck lump or hoarse voice. <b>Get urgent help</b> (000 in Australia, or your local emergency number) for someone with known or likely underactive thyroid who becomes very drowsy or confused, unusually cold or has a very slow pulse: severe hypothyroidism (myxoedema coma) is rare but serious.",
faqs=[
("What TSH level is too high?", "Anything above your lab’s range, usually about 4.0–5.0 mIU/L, is high. Treatment is generally recommended at 10 mIU/L or more on two tests 3 months apart, or with a low free T4. Between the top of the range and 10, the decision depends on symptoms, age, antibodies and pregnancy plans."),
("Is a TSH of 6 bad?", "It’s mildly raised. If your free T4 is normal, it’s subclinical hypothyroidism, and the usual step is to repeat the test in about 3 months, because mild rises often return to normal. A thyroid antibody test helps predict whether it will progress."),
("Can illness or stress raise TSH?", "Recovering from an illness can push TSH up for a few weeks, so tests are best done when you’re well. TSH also varies through the day. There’s no good evidence that everyday stress causes a meaningful rise."),
("Does biotin affect thyroid tests?", "Yes. High-dose biotin, common in hair, skin and nail supplements, can make thyroid results falsely high or low. Stop it for a few days before your blood test and tell your doctor you take it."),
("Do I need levothyroxine for a high TSH?", "Not always. It’s usually recommended if TSH is 10 or more on two occasions, if free T4 is low, or in pregnancy. For milder rises, many people are simply monitored, though a trial may help younger people with symptoms."),
("What about a high TSH in pregnancy?", "Tell your GP or midwife promptly. Pregnancy has lower TSH targets, and an underactive thyroid matters more because the baby relies on your thyroid hormone early on. Treatment, if needed, is safe in pregnancy."),
],
sources=[
("https://www.nice.org.uk/guidance/ng145/chapter/recommendations", "NICE NG145: Thyroid disease, assessment and management (subclinical hypothyroidism thresholds and monitoring)"),
(PTEX + "Thyroid+stimulating+hormone+%28TSH%29", "Pathology Tests Explained (RCPA): Thyroid stimulating hormone (TSH)"),
(PTEX + "Thyroid+antibodies", "Pathology Tests Explained (RCPA): Thyroid antibodies"),
("https://doi.org/10.1159/000356507", "Pearce et al, European Thyroid Journal 2013: ETA guideline on management of subclinical hypothyroidism"),
],
related=[HUB_R, ("/underactive-thyroid/", "Fact sheet", "Underactive Thyroid"), ("/tired-all-the-time/", "Fact sheet", "Tired All the Time"), ("/blood-tests/low-b12/", "Blood test", "Low B12 Result")],
),
# ---------------------------------------------------------------- neutrophils
dict(
slug="low-neutrophils", crumb="Low neutrophils", test="Absolute neutrophil count", group="Blood count", cls="n",
title="Low Neutrophils (Neutropenia): Causes and When to Worry",
h1="Low Neutrophils (Neutropenia)",
desc="Low neutrophils explained: normal range, viral and medicine causes, Duffy-null counts, next tests, and why fever with a count under 0.5 is an emergency.",
card="Mild to severe, viruses and medicines, Duffy-null counts, and the fever rule under 0.5.",
lede="Neutrophils are the white blood cells that fight bacteria and fungi first. A mildly low count is common and often harmless, after a virus or simply as your normal. A very low count makes serious infections more likely.",
qa="Neutrophils under about 2.0 × 10⁹/L are low on most reports; neutropenia proper starts under 1.5. Mild drops often follow viruses or medicines, and many people of African or Middle Eastern ancestry naturally run lower. Under 0.5 is severe. Neutrophils under 0.5 with a temperature of 38°C or more is an emergency.",
body="""
<h2>What the test measures</h2>
<p>The full blood count reports each type of white blood cell. Neutrophils are usually the largest group and are the body’s first responders to bacterial and fungal infection. The important figure is the <b>absolute neutrophil count</b>, not the percentage.</p>
<h2>Typical adult ranges</h2>
<ul><li><b>Normal:</b> about 2.0–7.5 × 10⁹/L (some labs use a lower limit of 1.5 or 1.8)</li><li>US units: multiply by 1000 for cells per microlitre (2.0 × 10⁹/L is 2,000/µL)</li><li><b>Mild neutropenia:</b> 1.0–1.5</li><li><b>Moderate:</b> 0.5–1.0</li><li><b>Severe:</b> under 0.5</li></ul>
<h2>What a low result usually means</h2>
<p><b>Common causes:</b></p>
<ul><li><b>A recent viral infection</b>, such as flu, COVID-19 or glandular fever. Counts usually recover within weeks.</li><li><b>Duffy-null associated neutrophil count</b> (once called benign ethnic neutropenia): many people with African or Middle Eastern ancestry have the Duffy-null blood type and naturally lower, healthy neutrophil counts. In one US study, two-thirds of healthy Black adults were Duffy-null, and about 1 in 4 of them had counts under 2.0.</li><li><b>Medicines</b>: chemotherapy, carbimazole and propylthiouracil (for overactive thyroid), clozapine, methotrexate, sulfasalazine, some antibiotics such as trimethoprim-sulfamethoxazole, and others.</li><li><b>Low B12, folate or copper.</b></li><li><b>Alcohol</b>, and an enlarged spleen.</li><li><b>Autoimmune conditions</b> such as lupus and rheumatoid arthritis.</li></ul>
<p><b>Less common but important:</b></p>
<ul><li><b>Leukaemia, myelodysplasia, aplastic anaemia</b> and other bone marrow problems, often with other abnormal counts.</li><li><b>Severe infection or sepsis</b>, which can use up neutrophils.</li><li>Cyclic neutropenia and inherited forms, usually found in childhood.</li></ul>
<h2>Symptoms</h2>
<p>A low count causes no symptoms by itself. When it’s very low, infections become more frequent or severe: fevers, mouth ulcers, sore throat, gum infections, skin infections or chest infections.</p>
<h2>What happens next</h2>
<ul><li><b>Repeat the full blood count with a blood film</b> in a few weeks, especially after a virus.</li><li><b>Review medicines</b>, including recent antibiotics.</li><li><b>Other tests</b> may include B12, folate, copper, liver tests, HIV, hepatitis, and autoimmune tests.</li><li><b>If your ancestry fits</b>, Duffy-null testing can explain a lifelong lower count and spare you unnecessary tests.</li><li><b>Haematology referral</b> if the count stays under 1.0 without an explanation, keeps falling, or other blood counts are abnormal.</li><li>With a very low count: good hand hygiene, food safety, and a thermometer at home.</li></ul>
""",
urgent="<b>Get urgent help</b> (go to an emergency department or call 000 in Australia, or your local emergency number) if your neutrophils are under 0.5 × 10⁹/L, or you’re on chemotherapy, and you have a temperature of 38°C or more, shivers, or feel suddenly unwell: neutropenic sepsis can become life-threatening within hours. <b>If you take carbimazole, propylthiouracil or clozapine</b> and develop a sore throat, mouth ulcers or fever, get an urgent blood count and don’t take the next dose until a doctor says it’s safe.",
faqs=[
("Is a neutrophil count of 1.2 bad?", "It’s mildly low. In someone who feels well it’s often from a recent virus or a medicine, or it may be a normal level for you, especially with African or Middle Eastern ancestry. Your GP will usually repeat it in a few weeks with a blood film."),
("What causes low neutrophils in adults?", "The commonest causes are recent viral infections, medicines, and naturally lower counts linked with the Duffy-null blood type. Others include low B12 or folate, alcohol and autoimmune conditions. Bone marrow problems are less common and usually affect other counts too."),
("When is a low neutrophil count an emergency?", "When it’s under 0.5 × 10⁹/L, or you’re having chemotherapy, and you have a temperature of 38°C or more or feel unwell. That’s neutropenic sepsis, which needs antibiotics within the hour, so go straight to an emergency department."),
("What is a Duffy-null associated neutrophil count?", "It’s a healthy, lower neutrophil count seen in many people with the Duffy-null blood type, which is common in people with African or Middle Eastern ancestry. It doesn’t raise infection risk. It used to be called benign ethnic neutropenia."),
("Can stress cause low neutrophils?", "Not usually. Stress hormones and steroid medicines tend to raise neutrophil counts rather than lower them. A low count is more likely to come from a virus, a medicine or your natural baseline."),
("How long does it take neutrophils to recover after a virus?", "Usually a few weeks. That’s why doctors often repeat the count 2–6 weeks after you’ve recovered rather than testing straight away."),
],
sources=[
(PTEX + "White+cell+count", "Pathology Tests Explained (RCPA): White blood cell count and differential"),
("https://www.aafp.org/afp/2025/1200/neutropenia", "Kim, Forlini and Kremsreiter, American Family Physician 2025: Neutropenia, evaluation and management in primary care"),
("https://pubmed.ncbi.nlm.nih.gov/24869938/", "Gibson and Berliner, Blood 2014: How we evaluate and treat neutropenia in adults"),
("https://doi.org/10.1182/bloodadvances.2022007679", "Merz et al, Blood Advances 2023: Absolute neutrophil count by Duffy status among healthy Black and African American adults"),
("https://www.nice.org.uk/guidance/cg151", "NICE CG151: Neutropenic sepsis, prevention and management in people with cancer"),
],
related=[HUB_R, ("/blood-tests/low-platelets/", "Blood test", "Low Platelets"), ("/glandular-fever/", "Fact sheet", "Glandular Fever"), ("/b12/", "Fact sheet", "Vitamin B12 Deficiency")],
),
# ---------------------------------------------------------------- ESR
dict(
slug="high-esr", crumb="High ESR", test="Erythrocyte sedimentation rate (ESR)", group="Inflammation", cls="m",
title="High ESR (Sed Rate): What It Means",
h1="High ESR (Sed Rate)",
desc="High ESR explained: how normal rises with age, common causes, what an ESR over 100 means, ESR vs CRP, and giant cell arteritis warning signs.",
card="Why normal rises with age, what over 100 means, and the giant cell arteritis warning signs.",
lede="The ESR, or sed rate, measures how quickly red blood cells sink to the bottom of a tube in an hour. Inflammation makes them clump and fall faster. It’s an old, simple test that says “something’s up” without saying what.",
qa="Normal ESR rises with age and is higher in women: a rough upper limit is age ÷ 2 for men and (age + 10) ÷ 2 for women. Mild rises are common with infection, anaemia, pregnancy and kidney disease. Over 100 mm/hr usually has a serious cause and needs prompt investigation.",
body="""
<h2>What the test measures</h2>
<p>Blood is left to stand in a tall tube, and the lab measures how far the red cells fall in one hour, in millimetres. Inflammation raises proteins such as fibrinogen and antibodies, which make red cells stack and sink faster. ESR rises and falls more slowly than <a href="/blood-tests/high-crp/">CRP</a>, over days to weeks.</p>
<h2>Typical adult ranges</h2>
<ul><li><b>Men 12–65:</b> 1–15 mm/hr; <b>over 65:</b> 1–30</li><li><b>Women 18–65:</b> 1–20 mm/hr; <b>over 65:</b> 1–35</li><li><b>Rule of thumb</b> for the upper limit: age ÷ 2 for men, (age + 10) ÷ 2 for women. So 40 can be normal for an 80-year-old woman but high for a 30-year-old man.</li></ul>
<h2>What a high result usually means</h2>
<p><b>Common causes:</b></p>
<ul><li><b>Infection</b>, including a recent one: ESR can stay up for weeks.</li><li><b>Older age</b> and being female.</li><li><b>Anaemia</b>, <b>pregnancy</b> and <b>kidney disease</b>.</li><li><b>Inflammatory arthritis</b> such as rheumatoid arthritis, and <a href="/polymyalgia/">polymyalgia rheumatica</a>.</li><li>Obesity (a small rise) and some medicines, including the contraceptive pill.</li></ul>
<p><b>Less common but important:</b></p>
<ul><li><b>Giant cell arteritis</b>: almost everyone with it has a raised ESR, often very high.</li><li><b>Myeloma</b>: a very high ESR with a normal or only mildly raised CRP is a classic clue, as myeloma proteins make red cells stack.</li><li>Other cancers, lupus and vasculitis, tuberculosis, and bone or heart valve infections.</li></ul>
<p><b>ESR over 100 mm/hr</b> almost always has a cause: infection is the most common, followed by autoimmune and vasculitis conditions, cancer and kidney disease. No cause is found in fewer than 2 in 100 people.</p>
<h2>Symptoms</h2>
<p>ESR causes no symptoms itself. The cause might: fever, joint pain or stiffness, shoulder and hip stiffness in the morning, headache, bone pain, weight loss, night sweats or tiredness.</p>
<h2>What happens next</h2>
<ul><li><b>Interpret it for your age and sex</b>, alongside your symptoms.</li><li><b>Repeat it</b> in a few weeks if it’s mildly high, you feel well and there’s an obvious reason such as a recent infection.</li><li><b>Other tests</b> often include CRP, a full blood count, kidney and liver tests, and urine tests.</li><li><b>If myeloma is possible</b> (for example, a high ESR with anaemia, back or bone pain, high calcium or kidney problems), protein electrophoresis and free light chains.</li><li><b>An ESR over 100</b> calls for a careful search for a cause, even if you feel fairly well.</li></ul>
""",
urgent="<b>See a doctor the same day</b> if you’re over 50 with a new headache, scalp tenderness, pain in the jaw when chewing, or any change in vision (blurring, double vision or loss): giant cell arteritis can cause permanent sight loss, and treatment shouldn’t wait for test results. Sudden vision loss needs emergency care. <b>See your GP within days</b> for new stiffness in both shoulders or hips with a raised ESR, or an ESR over 100 with weight loss, bone pain or night sweats.",
faqs=[
("What is a dangerous ESR level?", "There’s no single dangerous number, but an ESR over 100 mm/hr almost always has a significant cause, such as infection, vasculitis, an autoimmune condition, cancer or kidney disease, and needs prompt investigation."),
("Is an ESR of 30 high?", "It depends on your age and sex. A rough upper limit is age ÷ 2 for men and (age + 10) ÷ 2 for women, so 30 can be normal for a woman in her 60s but is high for a man in his 30s."),
("Can ESR be high without disease?", "Yes. Older age, being female, anaemia, pregnancy, kidney disease and obesity can all raise ESR. A recent infection can keep it raised for weeks."),
("What’s the difference between ESR and CRP?", "Both measure inflammation. CRP rises and falls within days, so it tracks acute illness better. ESR changes more slowly and is affected by more things, such as age and anaemia, but it’s useful in giant cell arteritis, polymyalgia rheumatica and myeloma."),
("Does a high ESR mean cancer?", "Usually not. Most raised ESRs come from infection, inflammation, anaemia, age or pregnancy. A very high ESR, especially with weight loss, bone pain or anaemia, does need checking for cancers such as myeloma."),
("How long does ESR stay high after an infection?", "Often several weeks. ESR falls more slowly than CRP, so it can still be raised after you feel better. A repeat test 4–6 weeks later usually shows it coming down."),
],
sources=[
(PTEX + "Erythrocyte+sedimentation+rate+%28ESR%29", "Pathology Tests Explained (RCPA): Erythrocyte sedimentation rate (age and sex ranges)"),
("https://aafp.org/pubs/afp/issues/1999/1001/p1443.html", "Brigden, American Family Physician 1999: Clinical utility of the ESR (causes of ESR over 100)"),
("https://doi.org/10.1136/bmj.286.6361.266", "Miller, Green and Robinson, BMJ 1983: Simple rule for calculating normal ESR"),
("https://ueaeprints.uea.ac.uk/73818/1/Accepted_Manuscript.pdf", "Mackie et al, Rheumatology 2020: British Society for Rheumatology guideline on giant cell arteritis"),
],
related=[HUB_R, ("/blood-tests/high-crp/", "Blood test", "High CRP"), ("/polymyalgia/", "Fact sheet", "Polymyalgia Rheumatica"), ("/blood-tests/high-calcium/", "Blood test", "High Calcium")],
),
# ---------------------------------------------------------------- calcium
dict(
slug="high-calcium", crumb="High calcium", test="Serum calcium", group="Hormones", cls="s",
title="High Calcium (Hypercalcaemia): Causes and PTH",
h1="High Calcium (Hypercalcaemia)",
desc="High calcium explained: normal range, why PTH is the key next test, hyperparathyroidism and other causes, symptoms, and why over 3.5 is an emergency.",
card="Corrected calcium, why PTH is the next test, and why over 3.5 mmol/L is an emergency.",
lede="Calcium keeps bones strong and nerves, muscles and the heart working. Its level is tightly controlled by parathyroid hormone (PTH) and vitamin D. When it’s high, PTH is the test that points to the cause.",
qa="Adjusted calcium above 2.60 mmol/L (10.4 mg/dL) is high. About 9 in 10 cases are due to an overactive parathyroid gland or cancer, so PTH is the key next test. Under 3.0 is mild and often symptom-free. Over 3.5 mmol/L (14 mg/dL) is an emergency.",
body="""
<h2>What the test measures</h2>
<p>About half the calcium in blood is attached to albumin, a protein. Because albumin levels vary, labs often report an <b>adjusted</b> or <b>corrected</b> calcium. Some also measure <b>ionised</b> (free) calcium directly. Calcium is controlled by parathyroid hormone from four tiny glands in the neck, by vitamin D, and by the kidneys.</p>
<h2>Typical adult ranges</h2>
<ul><li><b>Total or adjusted calcium:</b> 2.10–2.60 mmol/L (8.4–10.4 mg/dL)</li><li><b>Mildly high:</b> up to 3.0 mmol/L (12 mg/dL)</li><li><b>Moderately high:</b> 3.0–3.5 mmol/L</li><li><b>Severely high:</b> over 3.5 mmol/L (14 mg/dL)</li></ul>
<h2>What a high result usually means</h2>
<p><b>Common causes:</b></p>
<ul><li><b>Primary hyperparathyroidism</b>: usually one small, benign parathyroid gland growth making too much PTH. The commonest cause in people who feel well, often found by chance, and more common in women after menopause.</li><li><b>Cancer</b>: the commonest cause in people who are unwell in hospital, from bone spread or a PTH-like hormone. Together, these two cause about 90% of cases.</li><li><b>Medicines</b>: thiazide diuretics (such as hydrochlorothiazide and indapamide), lithium, and too much vitamin D or calcium with vitamin D.</li><li><b>Dehydration</b>, and a tourniquet left on too long when blood is taken (a false high).</li></ul>
<p><b>Less common but important:</b></p>
<ul><li><b>Familial hypocalciuric hypercalcaemia (FHH)</b>: an inherited, harmless rise, picked up with a urine calcium test. It doesn’t need surgery.</li><li>Myeloma, sarcoidosis and tuberculosis.</li><li>Overactive thyroid, long periods in bed, Paget’s disease of bone, and adrenal insufficiency.</li></ul>
<p><b>How PTH helps:</b> high calcium with a high or high-normal PTH points to hyperparathyroidism (or FHH). High calcium with a low PTH points away from the parathyroids, towards cancer, vitamin D excess, sarcoidosis and other causes.</p>
<h2>Symptoms</h2>
<ul><li>Often none when mild.</li><li>Thirst and passing a lot of urine, constipation, nausea and tummy pain.</li><li>Kidney stones, bone pain and fractures.</li><li>Tiredness, low mood, poor concentration, muscle weakness, and confusion when severe.</li></ul>
<h2>What happens next</h2>
<ul><li><b>Repeat adjusted calcium with PTH</b> at the same time. NICE advises measuring PTH when adjusted calcium is 2.6 mmol/L or more on two occasions, or 2.5 or more twice if hyperparathyroidism is suspected.</li><li><b>Kidney function, phosphate and vitamin D</b>, and a medicine review.</li><li><b>Urine calcium</b> to rule out FHH.</li><li><b>Hyperparathyroidism:</b> referral to a parathyroid surgeon is advised for symptoms, kidney stones, fragility fractures or osteoporosis, or an adjusted calcium of 2.85 mmol/L or more. Surgery cures most people.</li><li><b>Low PTH:</b> tests for cancer, myeloma, vitamin D excess and sarcoidosis, often with a specialist.</li><li>Drink enough fluids, and don’t take extra calcium or vitamin D supplements until you’ve spoken to your doctor.</li></ul>
""",
urgent="<b>Get urgent help</b> (go to an emergency department or call 000 in Australia, or your local emergency number) if your adjusted calcium is over 3.5 mmol/L (14 mg/dL), or at any level with confusion, drowsiness, severe vomiting, severe thirst with dehydration or palpitations: very high calcium can affect the heart rhythm. <b>See a doctor the same day</b> for a calcium of 3.0–3.5 mmol/L, especially with symptoms.",
faqs=[
("Is a calcium of 2.7 dangerous?", "It’s mildly high and not an emergency if you feel well. The next step is a repeat adjusted calcium with a PTH level, kidney function and vitamin D, and a check of your medicines. The commonest cause at this level is an overactive parathyroid gland."),
("What is the most common cause of high calcium?", "In people who feel well, primary hyperparathyroidism, usually a single benign parathyroid gland growth. In people unwell in hospital, cancer is more common. Together they cause about 90% of high calcium results."),
("Can calcium tablets cause high calcium?", "Not usually on their own at normal doses. Large doses, especially combined with high-dose vitamin D, or in people with kidney problems, can raise calcium. Bring a list of your supplements to your GP."),
("Is high calcium a sign of cancer?", "Sometimes, but in people who feel well an overactive parathyroid gland is far more common. Cancer is more likely when calcium is very high, rising quickly, PTH is low, or there are symptoms such as weight loss or bone pain."),
("What is corrected or adjusted calcium?", "About half of blood calcium is bound to albumin. Corrected (adjusted) calcium is a calculation that allows for your albumin level, so the result reflects the active calcium more accurately."),
("Does hyperparathyroidism need surgery?", "Not always. Surgery is advised for symptoms, kidney stones, osteoporosis or fractures, or a calcium of 2.85 mmol/L or more. Removing the overactive gland cures most people. Others are monitored."),
],
sources=[
(PTEX + "Calcium", "Pathology Tests Explained (RCPA): Calcium (adult range and causes)"),
(PTEX + "Parathyroid+Hormone+%28PTH%29", "Pathology Tests Explained (RCPA): Parathyroid hormone (PTH)"),
("https://www.endocrinology.org/media/4277/emergency-guidance_acute-hypercalcaemia-in-adults.pdf", "Society for Endocrinology: Emergency guidance, acute hypercalcaemia in adults (severity bands)"),
("https://www.nice.org.uk/guidance/ng132/chapter/Recommendations", "NICE NG132: Hyperparathyroidism (primary), diagnosis, assessment and initial management"),
],
related=[HUB_R, ("/kidney-stones/", "Fact sheet", "Kidney Stones"), ("/osteoporosis/", "Fact sheet", "Osteoporosis"), ("/vitamin-d/", "Fact sheet", "Vitamin D Deficiency")],
),
# ---------------------------------------------------------------- B12
dict(
slug="low-b12", crumb="Low B12 result", test="Vitamin B12 (cobalamin)", group="Vitamins", cls="l",
title="Low B12 Blood Test: What Your Result Means",
h1="Low B12 Result",
desc="Low B12 result explained: total vs active B12, deficient and borderline cut-offs in pmol/L and pg/mL, the MMA test, and when to treat straight away.",
card="Total vs active B12, borderline results, and when not to wait for more tests.",
lede="This page is about reading the number. For symptoms, causes and treatment, see our <a href=\"/b12/\">vitamin B12 deficiency fact sheet</a>.",
qa="Total B12 under 133 pmol/L (180 pg/mL) confirms deficiency, and over 258 pmol/L (350 pg/mL) makes it unlikely. In between is borderline: a methylmalonic acid test or a treatment trial helps. Active B12 under 25 pmol/L is low. Numbness, unsteadiness or memory change means start treatment without waiting.",
body="""
<h2>What the test measures</h2>
<ul><li><b>Total B12</b> (serum cobalamin) measures all B12 in blood, including the part bound to a carrier your cells can’t use. It’s the usual first test.</li><li><b>Active B12</b> (holotranscobalamin) measures only the usable fraction. It’s the preferred first test in pregnancy, when total B12 falls naturally.</li><li><b>Methylmalonic acid (MMA)</b> builds up when cells are short of B12. It helps settle borderline results.</li></ul>
<h2>Cut-offs (NICE 2024)</h2>
<ul><li><b>Total B12:</b> under 133 pmol/L (180 pg/mL) deficient; 133–258 pmol/L (180–350 pg/mL) borderline; over 258 pmol/L deficiency unlikely.</li><li><b>Active B12:</b> under 25 pmol/L deficient; 25–70 borderline; over 70 unlikely.</li><li>Australian and UK labs report pmol/L; US labs use pg/mL (the same as ng/L). Multiply pmol/L by 1.355 to get pg/mL.</li><li>Labs set their own ranges, so a “low” flag can appear at different numbers. People of Black ethnicity may have higher normal B12 levels.</li></ul>
<h2>What a low result usually means</h2>
<p><b>Common causes:</b> a vegan or vegetarian diet, long-term metformin or acid-reducing medicines (PPIs), pernicious anaemia (autoimmune gastritis), older age, coeliac or Crohn’s disease, stomach or bowel surgery, and heavy alcohol use.</p>
<p><b>Important to know:</b> recreational nitrous oxide (“nangs”) inactivates B12 and can cause serious nerve damage even when the blood level looks normal.</p>
<h2>Symptoms</h2>
<p>Tiredness, anaemia, pins and needles, unsteadiness, memory problems and a sore tongue. Full details in the <a href="/b12/">B12 fact sheet</a>.</p>
<h2>What happens next</h2>
<ul><li><b>Borderline result with symptoms:</b> an MMA test, or a trial of B12 treatment.</li><li><b>Full blood count and folate</b>, and <b>intrinsic factor antibodies</b> to check for pernicious anaemia.</li><li><b>Treatment</b> is injections or tablets depending on the cause. Don’t take high-dose folic acid alone until B12 is sorted.</li><li>Repeating B12 blood levels during injections isn’t usually needed; how you feel and your blood count matter more.</li></ul>
""",
urgent="<b>See your GP within days, and start treatment without waiting for more tests,</b> if you have numbness, tingling, weakness, unsteady walking or memory changes with a low or borderline B12: nerve damage can become permanent. The same applies if you’re pregnant or breastfeeding with a low result. <b>Get urgent help</b> (000 in Australia, or your local emergency number) for sudden weakness, trouble walking or loss of bladder control, especially after nitrous oxide use.",
faqs=[
("What B12 level is too low?", "Total B12 under 133 pmol/L (180 pg/mL) or active B12 under 25 pmol/L confirms deficiency. Levels between 133 and 258 pmol/L (180–350 pg/mL) are borderline, and your doctor will weigh symptoms and may order an MMA test."),
("Is a B12 of 200 low?", "It’s borderline whether your lab uses pmol/L or pg/mL: 200 pmol/L and 200 pg/mL both sit in the grey zone. With symptoms or risk factors, your GP may check MMA or start a trial of treatment."),
("What’s the difference between total B12 and active B12?", "Total B12 measures all B12 in your blood, including a part your cells can’t use. Active B12 measures only the usable fraction, so it can be more accurate, particularly in pregnancy."),
("Can I have B12 deficiency with a normal result?", "Yes. B12 tests aren’t perfect, and some people have deficiency symptoms with a result in the normal or borderline range. If symptoms strongly suggest it, your doctor may check MMA or treat anyway."),
("How quickly will my B12 come up with treatment?", "Injections raise blood levels quickly. Tiredness often improves within days to weeks, while nerve symptoms can take months and may not fully recover, which is why treatment shouldn’t be delayed."),
],
sources=[
("https://www.nice.org.uk/guidance/ng239/chapter/recommendations", "NICE NG239 (2024): Vitamin B12 deficiency in over 16s, diagnosis and management (test cut-offs)"),
(PTEX + "Vitamin+B12+and+folate", "Pathology Tests Explained (RCPA): Vitamin B12 and folate"),
("https://doi.org/10.1111/bjh.12959", "Devalia et al, British Journal of Haematology 2014: BSH guideline on cobalamin and folate disorders"),
],
related=[HUB_R, ("/b12/", "Fact sheet", "Vitamin B12 Deficiency"), ("/medicines/metformin/", "Medicine", "Metformin"), ("/medicines/ppis/", "Medicine", "Proton pump inhibitors (PPIs)")],
),
]

HUB = dict(
title="Blood Test Results Explained: Plain-English Guides",
h1="Blood Test Results Explained",
desc="Blood test results explained in plain English: high ferritin, low platelets, high CRP, ALT, eGFR, TSH and more, with next steps and red flags.",
lede="Got a result flagged H or L and a few days until your appointment? These guides explain what each test measures, the usual reasons it’s high or low, what happens next, and the numbers that can’t wait.",
qa="A result outside the reference range isn’t automatically a problem: ranges cover about 95% of healthy people, so some healthy results land just outside. What matters is how far out it is, your symptoms and the trend. Each guide below lists common causes first, and the numbers that need same-day care.",
intro="""
<h2>How to read a result</h2>
<ul><li><b>The range is on your report.</b> Labs use slightly different methods, so always compare with the range printed next to your result.</li><li><b>H and L flags</b> mean outside that range, not necessarily abnormal for you. A slightly high or low result is often repeated rather than acted on.</li><li><b>Trends beat single numbers.</b> A result that’s stable over years means something different from one that’s changed fast.</li><li><b>Context matters.</b> Recent illness, exercise, pregnancy, medicines and supplements all shift results.</li><li><b>Units differ by country.</b> Australia, the UK and most of the world use SI units (mmol/L, µmol/L); the US often uses mg/dL. Each guide gives both where it helps.</li></ul>
""",
after="""
<p class="meta">Also see our <a href="/conditions/">conditions A–Z</a>, the <a href="/tools/egfr-calculator/">eGFR calculator</a>, and the <a href="/iron/">iron deficiency</a> and <a href="/underactive-thyroid/">underactive thyroid</a> fact sheets.</p>
<p class="callout"><b>Not sure if it’s urgent?</b> In Australia, call healthdirect on <a href="tel:1800022222">1800 022 222</a> for free nurse advice, any time. In an emergency, call 000 or your local emergency number.</p>
""",
faqs=[
("What do H and L mean on a blood test?", "H means your result is above the lab’s reference range and L means below it. Reference ranges are set to include about 95% of healthy people, so roughly 1 in 20 healthy people will have any given result just outside the range."),
("Why do reference ranges differ between labs?", "Labs use different machines and methods, and some set ranges for their local population. That’s why you should always compare your result with the range printed on your own report."),
("Should I worry about a slightly abnormal result?", "Usually not. Slightly high or low results are common and often return to normal on a repeat test. Your doctor will look at how far out it is, your symptoms, your other results and any change over time."),
("Do I need to fast for blood tests?", "Most of the tests on these pages don’t need fasting. Iron studies are best done fasting in the morning, and some glucose and cholesterol tests need fasting. Your request form or lab will tell you."),
("Can I get my results explained here?", "These guides give general information, not advice about your own results. Your GP can interpret them with your history and examination, and decide what, if anything, needs doing."),
("What is Panelysis?", "Panelysis is our free daily blood-test puzzle. Each day you read a fictional patient’s results and pick the diagnosis in three tries. It’s a fun way to practise reading panels."),
],
sources=[
("https://ptex.au/ptests_index.php", "Pathology Tests Explained (RCPA and partners): plain-English guides to pathology tests"),
],
)
