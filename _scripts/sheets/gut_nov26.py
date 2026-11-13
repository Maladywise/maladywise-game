# Gut: functional dyspepsia, SIBO, Crohn's disease, ulcerative colitis. Run with _scripts/gen_sheets.py
RED = '<p class="callout"><b>See your GP soon</b> for any of these: weight loss you can’t explain, vomiting that won’t settle, trouble swallowing, black or bloody stools, low iron or anaemia, a family history of bowel or stomach cancer, or new symptoms after 60.</p>'

fact("functional-dyspepsia",
 "Functional Dyspepsia: Indigestion With a Normal Scope",
 "Functional dyspepsia explained: early fullness, bloating and upper tummy pain with normal tests, why it happens, H. pylori testing, acid tablets, low-dose amitriptyline and what to skip.",
 "Functional Dyspepsia", "Functional dyspepsia",
 "Ongoing upper tummy pain, burning, early fullness or uncomfortable fullness after meals, with tests that look normal. It’s a real gut–brain problem, not imagination, and about 1 in 14 people have it. Treatments work best stepped and combined.",
 h2("Symptoms", [
   "<b>Fullness type:</b> feeling uncomfortably full after normal meals, or full after a few bites",
   "<b>Pain type:</b> burning or pain in the upper tummy, not only after meals",
   "Many people have both, and many also have IBS or reflux",
   "Symptoms come and go, often worse with stress, big or fatty meals"]) + RED +
 h2("Why it happens", [
   "The stomach doesn’t relax properly to receive food, or empties unevenly",
   "The stomach and duodenum are oversensitive: normal stretching feels painful",
   "Mild inflammation in the duodenum, sometimes after a gut infection",
   "The gut–brain connection amplifies signals, especially with stress, anxiety or poor sleep"]) +
 h2("Tests", [
   "A breath or stool test for <b>Helicobacter pylori</b>",
   "Blood tests: full blood count, iron, coeliac serology",
   "A gastroscopy for red flags or new symptoms after 60",
   "Repeated scopes and scans don’t help once the diagnosis is made"]) +
 ladder("What helps", "Most people need 2 or 3 of these together.", [
   ("s", "Step 1 · Self-care", "Smaller, more frequent meals; less fat; eat slowly", "Big, fatty meals are the classic trigger for the fullness type.", "Helps many with fullness symptoms", "Free", "Ongoing", "", "Your stomach isn’t a storage unit. Graze, don’t feast."),
   ("m", "Step 2 · GP", "Test for and treat H. pylori", "If positive, a week or two of antibiotics plus an acid-reducing tablet.", "Cures dyspepsia in a small minority (about 1 in 14 treated) and prevents ulcers", "Script costs", "1–2 weeks", "Antibiotic side effects; confirm it’s gone afterwards.", None),
   ("m", "Step 3 · Pharmacy or GP", "Acid-reducing tablets (PPIs) for 4–8 weeks", "Best for the pain or burning type.", "Helps about 1 in 10 more people than placebo", "$10–25", "4–8 weeks, then stop or step down", "Don’t stay on them long term without a reason.", None),
   ("m", "Step 4 · GP", "Low-dose amitriptyline or another gut–brain medicine", "Turns down oversensitive gut nerves. Mirtazapine helps early fullness with weight loss.", "Amitriptyline helps about 1 in 6 more people than placebo in trials, especially the pain type", "$25 script or less", "Trial 8–12 weeks", "Sleepiness, dry mouth, constipation.", "An antidepressant at a fraction of the dose. Your gut nerves don’t care what the box says."),
   ("m", "Step 5 · GP or psychologist", "Gut-directed hypnotherapy or CBT", "Retrains the gut–brain loop.", "Good evidence in IBS, promising in dyspepsia", "Medicare rebates for some sessions with a GP plan; apps available", "6–12 sessions", "", None),
   ("l", "Step 6 · Specialist", "Prokinetics or buspirone", "Help the stomach relax and empty.", "Modest benefit for fullness-type symptoms", "Script costs", "Weeks", "Domperidone can affect heart rhythm; metoclopramide isn’t for long-term use.", None)]) +
 skip([("IgG food intolerance tests", "They measure normal exposure, not intolerance. No value for dyspepsia."),
   ("Removing the gallbladder for normal-gallbladder pain", "Doesn’t help functional dyspepsia unless there’s proven gallbladder disease."),
   ("Repeated scopes", "Once a good gastroscopy is normal, repeating it rarely changes anything.")]),
 [("What is functional dyspepsia?", "Ongoing upper tummy pain, burning or early fullness with normal tests such as a gastroscopy. It’s caused by an oversensitive, slow-to-relax stomach and gut–brain signalling, not by an ulcer or cancer."),
  ("How is functional dyspepsia treated?", "Small, low-fat meals, H. pylori treatment if positive, a short course of acid tablets, and if needed low-dose amitriptyline, gut-directed hypnotherapy or medicines that help the stomach empty."),
  ("Is functional dyspepsia serious?", "It doesn’t cause cancer or shorten life, but it can affect quality of life. New symptoms after 60, weight loss, vomiting, bleeding or anaemia need checking.")],
 [("Gastroenterological Society of Australia (GESA)", "https://www.gesa.org.au/", "Patient information on gut conditions. Free.")],
 [("Ford AC et al. Functional dyspepsia (Lancet 2020)", "https://pubmed.ncbi.nlm.nih.gov/33049222/"), ("Moayyedi P et al. ACG and CAG clinical guideline: management of dyspepsia (2017)", "https://pubmed.ncbi.nlm.nih.gov/28631728/")],
 [("IBS", "/ibs/"), ("Reflux", "/reflux/"), ("SIBO", "/sibo/"), ("Amitriptyline", "/medicines/amitriptyline/")],
 groups=["Gut"], blurb="Upper tummy pain or early fullness with normal tests. A gut–brain problem with real treatments.",
 search="functional dyspepsia indigestion bloating early fullness epigastric pain normal gastroscopy")

fact("sibo",
 "SIBO (Small Intestinal Bacterial Overgrowth): Facts vs Hype",
 "SIBO explained: who really gets it, why breath tests are unreliable, rifaximin and other antibiotics, recurrence, and the expensive SIBO extras that don’t have evidence.",
 "SIBO", "Small intestinal bacterial overgrowth",
 "SIBO means too many bacteria in the small intestine, causing bloating, wind, diarrhoea and sometimes poor absorption. It’s real and treatable in people with clear risk factors. It’s also heavily overdiagnosed with unreliable breath tests, at considerable cost.",
 h2("Who really gets it", [
   "People who’ve had bowel or stomach surgery, especially loops or bypasses",
   "Slow gut movement: scleroderma, diabetes with nerve damage, intestinal pseudo-obstruction",
   "Very low stomach acid, older age, cirrhosis, some immune problems",
   "Long-term opioids or strong acid suppression may add to risk",
   "Its role in everyday IBS is debated"]) +
 h2("Symptoms", ["Bloating, wind, tummy discomfort and diarrhoea", "In more severe cases: weight loss, low B12, iron or fat-soluble vitamins, fatty pale stools"]) + RED +
 h2("Testing", [
   "<b>Breath tests</b> (glucose or lactulose) are widely used but often wrong: false positives with fast gut transit, false negatives otherwise.",
   "The gold standard, sampling fluid from the small bowel, is rarely done outside research.",
   "In people with strong risk factors, doctors sometimes treat without a test.",
   "Also check for coeliac disease, IBD, pancreatic problems and bile acid diarrhoea, which cause similar symptoms."]) +
 ladder("What helps", "Treat the cause where possible; antibiotics treat the overgrowth.", [
   ("m", "Step 1 · GP or specialist", "Antibiotics: rifaximin, or amoxicillin-clavulanate, metronidazole or doxycycline", "A 1–2 week course.", "Relieves symptoms in many with true SIBO; rifaximin isn’t PBS-listed for SIBO in Australia, so it’s expensive", "Low cost for older antibiotics; rifaximin costs hundreds privately", "1–2 weeks", "Recurrence is common, especially when the underlying cause stays.", None),
   ("m", "Step 2 · Treat the cause", "Review medicines, treat motility problems, correct anatomy where possible", "Opioids and acid suppression reviewed; prokinetics for slow motility.", "Reduces recurrence", "Varies", "Ongoing", "", None),
   ("m", "Step 3 · Nutrition", "Correct deficiencies: B12, iron, vitamin D and others", "With a dietitian if weight is falling.", "Essential when absorption is affected", "Varies", "Ongoing", "", None),
   ("l", "Step 4 · Specialist", "Rotating antibiotic courses for frequent relapse", "For clear underlying causes like surgery or scleroderma.", "Helpful for selected people", "Varies", "Long term", "Antibiotic resistance, C. difficile.", None)]) +
 skip([("Repeated breath tests to “track” SIBO", "They’re unreliable and don’t guide treatment well."),
   ("Long-term restrictive “SIBO diets”", "Can harm nutrition and gut bacteria diversity. Short low-FODMAP trials with a dietitian are better evidenced for IBS."),
   ("Herbal antimicrobial protocols", "One small study; quality and dosing vary. Not proven."),
   ("Elemental diets", "Some evidence, but very hard to tolerate and expensive. Specialist-guided only.")]),
 [("What is SIBO?", "Too many bacteria in the small intestine, usually because of bowel surgery, slow gut movement or low stomach acid. It causes bloating, wind and diarrhoea, and sometimes vitamin deficiencies."),
  ("Are SIBO breath tests accurate?", "Not very. They give false positives and false negatives. Results should be interpreted with your symptoms and risk factors, and other causes considered."),
  ("Is rifaximin on the PBS for SIBO?", "No. In Australia rifaximin is PBS-listed for a liver condition (hepatic encephalopathy), so for SIBO it’s a private prescription. Older antibiotics are cheaper alternatives.")],
 [("GESA", "https://www.gesa.org.au/", "Patient information on gut conditions. Free.")],
 [("Pimentel M et al. ACG clinical guideline: small intestinal bacterial overgrowth (2020)", "https://pubmed.ncbi.nlm.nih.gov/32023228/"), ("Rezaie A et al. Hydrogen and methane-based breath testing: North American consensus (2017)", "https://pubmed.ncbi.nlm.nih.gov/28323273/")],
 [("IBS", "/ibs/"), ("Coeliac Disease", "/coeliac/"), ("Functional Dyspepsia", "/functional-dyspepsia/")],
 groups=["Gut"], blurb="Too many small-bowel bacteria: real in people with risk factors, overdiagnosed with unreliable breath tests.",
 search="sibo small intestinal bacterial overgrowth breath test rifaximin bloating")

fact("crohns-disease",
 "Crohn’s Disease: Symptoms, Diagnosis and Treatment",
 "Crohn’s disease explained: symptoms, how it differs from ulcerative colitis, calprotectin and colonoscopy, steroids, immunomodulators, biologics, surgery, smoking and living well.",
 "Crohn’s Disease", "Crohn disease",
 "Crohn’s disease is a lifelong inflammatory bowel disease that can affect any part of the gut, from mouth to anus, most often the end of the small bowel. It comes in flares and quiet spells. Modern treatments keep most people well, and stopping smoking is one of the most powerful things you can do.",
 h2("Symptoms", [
   "Tummy pain (often lower right), diarrhoea, sometimes with blood or mucus",
   "Weight loss, tiredness, fevers, low iron or B12",
   "Around the anus: fissures, abscesses or fistulas (abnormal tunnels)",
   "Mouth ulcers, joint pain, red eyes or skin rashes",
   "Usually starts between 15 and 40, but any age"]) + RED +
 h2("How it’s diagnosed", [
   "Bloods (inflammation, iron, B12) and a <b>faecal calprotectin</b> stool test for gut inflammation",
   "Colonoscopy with biopsies, plus MRI or ultrasound of the small bowel",
   "Stool tests to exclude infection"]) +
 h2("Crohn’s vs ulcerative colitis", [
   "Crohn’s: anywhere in the gut, patchy, through the full bowel wall; strictures and fistulas can form",
   "UC: only the large bowel, continuous from the rectum, the inner lining only",
   "Smoking makes Crohn’s worse; it oddly seems to protect against UC, but is never worth it"]) +
 ladder("Treatment", "Usually led by a gastroenterologist, with your GP. The aim is healing the bowel, not just easing symptoms.", [
   ("s", "Step 1 · Lifestyle", "Stop smoking", "The single most important change for Crohn’s.", "Quitting lowers flares and the need for surgery; ex-smokers do about as well as people who never smoked", "Free help: Quitline 13 7848", "Ongoing", "", "Smoking and Crohn’s: worst double act in gastroenterology."),
   ("m", "Step 2 · Flares", "Steroids (budesonide or prednisolone), or exclusive liquid nutrition in children", "To settle a flare, not for long-term use.", "Induce remission in most", "Low cost", "Weeks", "Steroid side effects: mood, sleep, sugar, bones.", None),
   ("m", "Step 3 · Maintenance", "Immunomodulators: azathioprine, mercaptopurine or methotrexate", "Keep the disease quiet.", "Maintain remission in many", "$25 PBS script", "Long term", "Blood test monitoring; TPMT test before azathioprine.", None),
   ("l", "Step 4 · Specialist", "Biologics and newer tablets: infliximab, adalimumab, vedolizumab, ustekinumab, risankizumab, upadacitinib", "For moderate to severe disease.", "Many people reach remission and avoid surgery", "PBS-subsidised for eligible people", "Long term", "Infection risk; screening for TB and hepatitis first.", None),
   ("l", "Step 5 · Surgery", "Removing a narrowed or damaged section, or treating fistulas", "For strictures, abscesses, fistulas or disease that won’t respond.", "Often gives years of relief; treatment continues afterwards", "Medicare or public hospital", "One-off", "Disease can return at the join.", None)]) +
 h2("Living with Crohn’s", [
   "Vaccines before starting immune-lowering medicines; avoid live vaccines on some treatments",
   "Bone health, iron, B12 and vitamin D checks",
   "Bowel cancer surveillance colonoscopies if the large bowel is involved",
   "Mental health support: anxiety and low mood are common, and treatable"]),
 [("What causes Crohn’s disease?", "A mix of genes, the immune system and gut bacteria, with triggers like smoking. It isn’t caused by stress or diet, though both can affect symptoms."),
  ("Can Crohn’s disease be cured?", "Not yet, but treatments can keep most people in long-term remission. Surgery can remove damaged sections but doesn’t cure it."),
  ("What is the difference between Crohn’s and colitis?", "Crohn’s can affect any part of the gut, in patches, through the full bowel wall. Ulcerative colitis affects only the large bowel, continuously from the rectum, in the lining only.")],
 [("Crohn’s & Colitis Australia", "https://crohnsandcolitis.org.au/", "Information, support and helpline. Free."),
  ("Quitline 13 7848", "https://www.quit.org.au/", "Free help to quit smoking.")],
 [("Crohn’s & Colitis Australia: About IBD", "https://crohnsandcolitis.org.au/"), ("Torres J et al. ECCO guidelines on therapeutics in Crohn’s disease (2020)", "https://pubmed.ncbi.nlm.nih.gov/31711158/")],
 [("Ulcerative Colitis", "/ulcerative-colitis/"), ("Inflammatory Bowel Disease", "/inflammatory-bowel-disease/"), ("Behçet’s deep dive", "/deep-dives/behcets/")],
 groups=["Gut"], blurb="Lifelong inflammation anywhere in the gut. Flares, treatments that heal the bowel, and why quitting smoking matters.",
 search="crohns crohn's disease ibd inflammatory bowel disease ileitis biologics")

fact("ulcerative-colitis",
 "Ulcerative Colitis: Symptoms, Mesalazine, Flares and Surgery",
 "Ulcerative colitis explained: bloody diarrhoea and urgency, how it’s diagnosed, mesalazine tablets and enemas, steroids for flares, biologics, when to go to hospital, and bowel cancer checks.",
 "Ulcerative Colitis", "Ulcerative colitis",
 "Ulcerative colitis is an inflammatory bowel disease of the large bowel lining, starting at the rectum and spreading upwards. It causes bloody diarrhoea and urgency in flares. Most people do well with medicines that keep it quiet, and surgery can cure it if needed.",
 h2("Symptoms", [
   "Diarrhoea with blood or mucus, urgency, and needing to go at night",
   "Cramping tummy pain, tiredness, low iron",
   "Joint pain, red eyes, skin rashes or liver problems (PSC) in some"]) +
 '<p class="callout"><b>Go to hospital the same day</b> with 6 or more bloody stools a day plus fever, a racing heart, feeling very unwell, or a swollen tender tummy. This can be acute severe colitis, which needs urgent treatment.</p>' +
 h2("Diagnosis", ["Bloods, faecal calprotectin and stool tests for infection", "Colonoscopy with biopsies confirms it and shows how much bowel is involved"]) +
 ladder("Treatment", "Usually led by a gastroenterologist, with your GP.", [
   ("m", "Step 1 · Mild to moderate", "Mesalazine (5-ASA): tablets plus suppositories or enemas", "Rectal treatment works fast for rectal and left-sided disease; combining both works best.", "Induces and keeps remission in most people with mild to moderate UC", "$25 PBS script", "Long term", "Rarely kidney problems: yearly kidney blood test.", "The enema isn’t glamorous. It is effective."),
   ("m", "Step 2 · Flares", "Steroids: budesonide MMX or prednisolone", "Short courses only.", "Settle most flares", "Low cost", "Weeks", "Not for long-term use.", None),
   ("m", "Step 3 · Maintenance", "Azathioprine or mercaptopurine", "When steroids are needed too often.", "Keep remission in many", "$25 PBS script", "Long term", "Blood monitoring.", None),
   ("l", "Step 4 · Specialist", "Biologics and small-molecule tablets: infliximab, adalimumab, golimumab, vedolizumab, ustekinumab, mirikizumab, tofacitinib, upadacitinib, ozanimod and others", "For moderate to severe disease.", "Many reach remission", "PBS-subsidised for eligible people", "Long term", "Infection risk; screening first.", None),
   ("l", "Step 5 · Surgery", "Removing the large bowel (colectomy)", "For disease that won’t respond, emergencies or cancer risk. Often with an internal pouch.", "Cures the colitis", "Public or private", "One-off, sometimes staged", "Pouch problems, more frequent bowel motions.", None)]) +
 h2("Long term", [
   "Bowel cancer risk rises after about 8 years of widespread colitis: regular surveillance colonoscopies",
   "Vaccines and bone health checks on immune-lowering treatment",
   "Smoking seems to protect against UC, oddly, but the harms far outweigh it"]),
 [("What is ulcerative colitis?", "An inflammatory bowel disease affecting the lining of the large bowel, continuously from the rectum upwards. It causes bloody diarrhoea, urgency and cramps in flares."),
  ("What is the first treatment for ulcerative colitis?", "For mild to moderate disease, mesalazine tablets plus suppositories or enemas. Steroids are used short term for flares, and other medicines for more severe disease."),
  ("Can ulcerative colitis be cured?", "Surgery to remove the large bowel cures the colitis. Most people instead manage well long term with medicines.")],
 [("Crohn’s & Colitis Australia", "https://crohnsandcolitis.org.au/", "Information, support and helpline. Free.")],
 [("Crohn’s & Colitis Australia: About IBD", "https://crohnsandcolitis.org.au/"), ("Raine T et al. ECCO guidelines on therapeutics in ulcerative colitis (2022)", "https://pubmed.ncbi.nlm.nih.gov/34635919/")],
 [("Crohn’s Disease", "/crohns-disease/"), ("Inflammatory Bowel Disease", "/inflammatory-bowel-disease/"), ("Bowel Cancer Screening", "/cancer-screening/")],
 groups=["Gut"], blurb="Inflammation of the large bowel lining. Bloody diarrhoea in flares, mesalazine first, and surgery can cure it.",
 search="ulcerative colitis uc ibd bloody diarrhoea mesalazine colectomy")
