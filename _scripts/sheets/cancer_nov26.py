# Cancer series, batch 1: bowel, breast, lung, kidney, mesothelioma. Run with _scripts/gen_sheets.py
# Figures: Cancer Australia / AIHW 2025 estimates and 2017–2021 five-year relative survival; mesothelioma from the
# Australian Mesothelioma Registry (AIHW 2025). Screening: health.gov.au program pages.
CC = ("Cancer Council 13 11 20", "https://www.cancer.org.au/", "Information and support line for anyone affected by cancer. Free.")
QUIT = ("Quitline 13 7848", "https://www.quit.org.au/", "Free help to quit smoking or vaping.")
def sass(t): return '<p class="sass">%s</p>' % t
def soon(t): return '<p class="callout"><b>See your GP soon</b> %s</p>' % t

fact("bowel-cancer",
 "Bowel Cancer: Symptoms, Free Screening and Treatment",
 "Bowel cancer explained: warning signs, the free bowel screening test from 45, rising cases in younger adults, colonoscopy, treatment and survival in Australia.",
 "Bowel Cancer", "Bowel cancer",
 "Bowel cancer is one of Australia’s most common cancers: about 14,800 new cases a year. Found early, it’s very treatable, and a free poo test at home can find it before you have any symptoms.",
 sass("The free kit is a stick, a tube and some dignity. Two of those come in the envelope.") +
 soon("for any of these: blood in your poo or bleeding from the bottom, a change in your bowel habit that lasts more than a few weeks, unexplained weight loss, tiredness from low iron, or a lump or pain in the tummy. Don’t wait for a screening kit if you have symptoms.") +
 h2("The numbers", [
   "About <b>14,800</b> Australians are diagnosed each year, men and women in similar numbers",
   "About <b>1 in 23</b> people are diagnosed by age 85",
   "<b>72%</b> are alive 5 years after diagnosis, up from 52% in the late 1980s",
   "Cases in people under 50 are rising, which is why screening now starts at 45"]) +
 h2("Screening: the free test", [
   "The <b>National Bowel Cancer Screening Program</b> mails a free poo test (FIT) every 2 years from 50 to 74",
   "From 45 to 49 you can ask for a kit yourself, free",
   "It finds tiny amounts of blood you can’t see. A positive test means a colonoscopy, not a diagnosis",
   "Most positive tests aren’t cancer: often polyps or piles. Removing polyps prevents cancer"]) +
 sass("Most bowel cancers start as polyps that sit quietly for years. Screening catches them while they’re still just squatters.") +
 h2("Risk factors", [
   "Age, and a family history of bowel cancer (a parent, brother or sister, especially if diagnosed young)",
   "Inflammatory bowel disease (Crohn’s or ulcerative colitis) for many years",
   "Smoking, alcohol, being above a healthy weight and not moving much",
   "Lots of red and processed meat; little fibre",
   "Inherited syndromes such as Lynch syndrome (rare, but important to know about)"]) +
 h2("Tests and treatment", [
   "<b>Colonoscopy</b> is the main test: a camera looks at the whole bowel and can remove polyps or take samples",
   "<b>CT scans</b> check whether it has spread",
   "<b>Surgery</b> removes the cancer in most people with early bowel cancer",
   "<b>Chemotherapy</b> after surgery lowers the chance of it coming back in some stages",
   "Rectal cancer may need radiotherapy and chemotherapy before surgery",
   "Advanced cancer: chemotherapy, targeted drugs and immunotherapy for some tumour types"]) +
 sass("‘I’m too young for bowel cancer’ is a sentence a lot of young people with bowel cancer have heard. Blood in your poo deserves a proper look at any age.") +
 skip([("Colon cleanses and detox kits", "They don’t prevent bowel cancer and can upset your gut and your salts."),
   ("Blood tests that ‘detect cancer’ instead of the free kit", "Not a replacement for screening. Do the free test.")]),
 [("What are the first signs of bowel cancer?", "Often none. When there are symptoms, they include blood in the poo, a lasting change in bowel habit, unexplained weight loss, tiredness from low iron and tummy pain."),
  ("At what age should I start bowel cancer screening?", "In Australia the free test is mailed every 2 years from 50 to 74, and people aged 45 to 49 can request one. People with a strong family history may need colonoscopy instead: ask your GP."),
  ("Is bowel cancer curable?", "Yes, especially when found early. About 72% of people are alive 5 years after diagnosis, and many more when it’s caught at an early stage.")],
 [CC, ("National Bowel Cancer Screening Program", "https://www.health.gov.au/our-work/national-bowel-cancer-screening-program", "Free test every 2 years. Free."),
  ("Bowel Cancer Australia", "https://www.bowelcanceraustralia.org/", "Information and support.")],
 [("Cancer Australia: Bowel cancer statistics", "https://www.canceraustralia.gov.au/cancer-types/bowel-cancer/statistics"),
  ("National Bowel Cancer Screening Program (health.gov.au)", "https://www.health.gov.au/our-work/national-bowel-cancer-screening-program"),
  ("Cancer Council: Bowel screening", "https://www.cancer.org.au/bowelscreening/why-take-the-test")],
 [("Cancer Screening", "/cancer-screening/"), ("Inflammatory Bowel Disease", "/inflammatory-bowel-disease/"), ("Iron", "/iron/"), ("Genetics", "/genetics/")],
 groups=["Gut", "Other"], blurb="Very treatable when found early. The free poo test starts at 45.",
 search="bowel cancer colon cancer colorectal rectal cancer blood in poo screening fit colonoscopy")

fact("breast-cancer",
 "Breast Cancer: Signs, Screening, Treatment and Survival",
 "Breast cancer explained: lumps and other changes to check, free BreastScreen mammograms, risk factors, treatment options and survival in Australia.",
 "Breast Cancer", "Breast cancer",
 "Breast cancer is the most common cancer in Australian women: about 20,000 diagnoses a year, and around 200 in men. Survival is among the best of any cancer, at 93% after 5 years.",
 sass("Know what’s normal for your breasts. No special technique required, just attention.") +
 soon("for any new breast change: a lump or thickening, a change in shape or size, skin dimpling or redness, nipple changes or discharge, or a lump in the armpit. Most changes aren’t cancer, but all need checking.") +
 h2("The numbers", [
   "About <b>20,100</b> women and <b>200</b> men are diagnosed each year",
   "About <b>1 in 8 women</b> are diagnosed by age 85",
   "<b>93%</b> of women are alive 5 years after diagnosis"]) +
 h2("Screening: BreastScreen", [
   "Free mammograms every 2 years for women aged <b>50 to 74</b>, who get an invitation",
   "Women 40 and over can book a free BreastScreen too",
   "No GP referral needed. Call 13 20 50",
   "Screening is for people without symptoms. A new lump needs your GP, not a screening appointment"]) +
 h2("Risk factors", [
   "Being a woman, and getting older: most cases are after 50",
   "A strong family history, or an inherited gene change such as BRCA1 or BRCA2",
   "Alcohol: risk rises with every regular drink",
   "Being above a healthy weight after menopause, and not moving much",
   "Combined menopausal hormone therapy, especially for more than 5 years (a small increase; worth discussing, not panicking over)"]) +
 sass("Deodorant, underwire bras and bumping your breast don’t cause breast cancer. The internet has had a long time to drop these.") +
 h2("Tests and treatment", [
   "<b>Triple test:</b> a clinical check, imaging (mammogram and ultrasound) and a needle biopsy",
   "<b>Surgery:</b> removing the lump (with radiotherapy after) works as well as mastectomy for many early cancers",
   "<b>Hormone therapy</b> for cancers driven by oestrogen, usually for 5 to 10 years",
   "<b>Chemotherapy, targeted drugs</b> (such as HER2 treatments) and immunotherapy depending on the type",
   "Breast reconstruction can be done at the same time or later, if you want it"]) +
 skip([("Thermography instead of a mammogram", "Not a substitute. It misses cancers and finds things that aren’t there."),
   ("‘Alkaline’ or ‘sugar-free’ diets to starve cancer", "Sugar doesn’t feed one cancer more than the rest of you. Eat well, but don’t replace treatment.")]),
 [("What does a breast cancer lump feel like?", "Often hard and painless, but not always. Any new lump or change should be checked by your GP, even if your last mammogram was normal."),
  ("Who can get a free mammogram in Australia?", "BreastScreen offers free mammograms every 2 years to women aged 50 to 74, and women aged 40 and over can book too. Call 13 20 50."),
  ("Can men get breast cancer?", "Yes. About 200 Australian men are diagnosed each year. A lump behind the nipple is the usual sign.")],
 [CC, ("BreastScreen Australia 13 20 50", "https://www.health.gov.au/our-work/breastscreen-australia-program", "Free mammograms. Free."),
  ("Breast Cancer Network Australia", "https://www.bcna.org.au/", "Support and information for people with breast cancer. Free.")],
 [("Cancer Australia: Breast cancer statistics", "https://www.canceraustralia.gov.au/cancer-types/breast-cancer/breast-cancer-australia-statistics"),
  ("BreastScreen Australia Program (health.gov.au)", "https://www.health.gov.au/our-work/breastscreen-australia-program"),
  ("Cancer Council: Breast cancer", "https://www.cancer.org.au/cancer-information/types-of-cancer/breast-cancer")],
 [("Cancer Screening", "/cancer-screening/"), ("Genetics", "/genetics/"), ("Smoking", "/smoking/")],
 groups=["Women’s health", "Other"], blurb="The most common cancer in women, with 93% surviving 5 years. Free mammograms from 40.",
 search="breast cancer lump mammogram breastscreen brca mastectomy")

fact("lung-cancer",
 "Lung Cancer: Symptoms, the New Screening Program and Treatment",
 "Lung cancer explained: symptoms to check, the free National Lung Cancer Screening Program for people who smoke or used to, causes beyond smoking, and modern treatment.",
 "Lung Cancer", "Lung cancer",
 "Lung cancer causes more cancer deaths in Australia than any other: about 15,000 diagnoses and 9,000 deaths a year. Survival is improving fast, and a free screening scan now helps find it early in people at high risk.",
 soon("for a cough that lasts more than 3 weeks or changes, coughing up blood, breathlessness, chest pain, a chest infection that won’t clear, hoarseness, or weight loss you can’t explain. Coughing up blood needs a check straight away.") +
 h2("The numbers", [
   "About <b>15,100</b> new cases a year, in men and women in similar numbers",
   "The leading cause of cancer death, at about <b>9,000</b> deaths a year",
   "<b>27%</b> are alive 5 years after diagnosis, up from under 10% in the late 1980s",
   "People who have never smoked get it too, and they shouldn’t be made to feel it’s their fault"]) +
 h2("Free screening for people at high risk", [
   "The <b>National Lung Cancer Screening Program</b> started in July 2025",
   "For people aged <b>50 to 70</b> with no symptoms, who smoke or quit in the last 10 years, with at least 30 pack-years of smoking",
   "A pack-year is one pack a day for one year (or two packs a day for six months)",
   "A low-dose CT scan every 2 years, bulk billed. Ask your GP to check if you’re eligible",
   "You don’t have to quit to be screened, though quitting is still the best thing you can do"]) +
 sass("The screening program asks how much you’ve smoked, not to judge you. Honest answers get you the scan.") +
 h2("Causes", [
   "<b>Smoking</b> causes most cases. Quitting at any age lowers the risk",
   "Second-hand smoke, radon, asbestos, diesel exhaust and silica dust at work",
   "Air pollution and a family history",
   "In people who’ve never smoked, specific gene changes in the tumour (such as EGFR or ALK) are common, and they can often be targeted with tablets"]) +
 sass("Vapes aren’t a lung-health product. Swapping smoke for vapour isn’t the same as quitting.") +
 h2("Tests and treatment", [
   "<b>Tests:</b> chest X-ray, CT scan, PET scan, then a biopsy (often through a bronchoscope or needle)",
   "<b>Early lung cancer:</b> surgery, or precise radiotherapy if surgery isn’t suitable",
   "<b>More advanced cancer:</b> chemotherapy, radiotherapy, immunotherapy and targeted tablets, often combined",
   "Testing the tumour for gene changes guides treatment. Ask about it",
   "Palliative care alongside treatment improves comfort and quality of life, and isn’t only for the end"]) +
 skip([("‘It’s too late to quit, the damage is done’", "Quitting improves lung function, treatment results and survival, even after a diagnosis."),
   ("Unproven ‘lung detox’ supplements", "No evidence they remove anything or prevent cancer.")]),
 [("What are the early signs of lung cancer?", "Often none. Symptoms can include a cough that won’t go away, coughing up blood, breathlessness, chest pain, repeated chest infections and weight loss."),
  ("Who can get lung cancer screening in Australia?", "People aged 50 to 70 with no symptoms who smoke or quit in the past 10 years and have at least 30 pack-years of smoking history. The low-dose CT scan is free; ask your GP."),
  ("Can people who never smoked get lung cancer?", "Yes. A significant share of lung cancers occur in people who have never smoked, often with specific gene changes that can be treated with targeted tablets.")],
 [CC, QUIT, ("Lung Foundation Australia 1800 654 301", "https://lungfoundation.com.au/", "Lung cancer information and support. Free.")],
 [("Cancer Australia: Lung cancer statistics", "https://www.canceraustralia.gov.au/cancer-types/lung-cancer/lung-cancer-australia-statistics"),
  ("How the National Lung Cancer Screening Program works (health.gov.au)", "https://www.health.gov.au/our-work/nlcsp/how-it-works"),
  ("Cancer Council: Lung cancer", "https://www.cancer.org.au/cancer-information/types-of-cancer/lung-cancer")],
 [("Quit Smoking", "/quit-smoking/"), ("Smoking", "/smoking/"), ("Cancer Screening", "/cancer-screening/"), ("Mesothelioma", "/mesothelioma/")],
 groups=["Lungs and breathing", "Other"], blurb="Australia’s biggest cancer killer. Free screening scans for people at high risk.",
 search="lung cancer cough blood smoking screening low dose ct nlcsp")

fact("kidney-cancer",
 "Kidney Cancer: Signs, Causes and Treatment",
 "Kidney cancer explained: why most are found by accident on scans, warning signs like blood in the urine, risk factors, surgery, newer medicines and survival.",
 "Kidney Cancer", "Kidney cancer",
 "About 4,900 Australians are diagnosed with kidney cancer each year, twice as many men as women. Most are now found by accident on a scan done for something else, often early, and 83% of people are alive after 5 years.",
 sass("The kidney’s version of a surprise party: found on a scan you had for your back.") +
 soon("if you see blood in your urine, even once, or have a lasting pain in your side or a lump in your tummy, or weight loss, fevers or night sweats you can’t explain.") +
 h2("The numbers", [
   "About <b>4,900</b> new cases a year: about 3,300 men and 1,600 women",
   "About <b>1 in 66</b> people are diagnosed by age 85",
   "<b>83%</b> are alive 5 years after diagnosis, up from 51% in the late 1980s"]) +
 h2("Signs", [
   "Often <b>none</b>: most are found on an ultrasound or CT done for another reason",
   "Blood in the urine",
   "Pain in the side or back that doesn’t go away",
   "A lump in the tummy, tiredness, weight loss or fevers"]) +
 h2("Risk factors", [
   "<b>Smoking</b>",
   "Being above a healthy weight, and high blood pressure",
   "Long-term kidney failure, especially on dialysis",
   "Rare inherited conditions such as von Hippel–Lindau disease"]) +
 sass("Kidney ‘cleanses’ and detox teas do nothing for cancer risk. Not smoking and a healthy blood pressure do.") +
 h2("Tests and treatment", [
   "<b>Tests:</b> CT or MRI scans; sometimes a biopsy",
   "<b>Small tumours:</b> careful watching with scans, removing part of the kidney, or freezing or heating the tumour",
   "<b>Larger tumours:</b> removing the whole kidney. One healthy kidney does the job",
   "<b>Advanced cancer:</b> immunotherapy and targeted medicines have greatly improved survival in the last decade"]),
 [("What are the first signs of kidney cancer?", "Usually none. Most are found by chance on a scan. Signs can include blood in the urine, a lasting pain in the side and a lump in the tummy."),
  ("Can you live with one kidney?", "Yes. After removing a kidney, most people live a normal life with the remaining one, with regular checks of kidney function and blood pressure."),
  ("Is kidney cancer curable?", "Often, when found early. About 83% of people are alive 5 years after diagnosis.")],
 [CC, QUIT, ("Kidney Health Australia 1800 454 363", "https://kidney.org.au/", "Kidney information and support. Free.")],
 [("Cancer Australia: Kidney cancer statistics", "https://canceraustralia.gov.au/cancer-types/kidney-cancer/kidney-cancer-australia-statistics"),
  ("Cancer Australia: What is kidney cancer?", "https://canceraustralia.gov.au/cancer-types/kidney-cancer"),
  ("Cancer Council: Kidney cancer", "https://www.cancer.org.au/cancer-information/types-of-cancer/kidney-cancer")],
 [("Bladder Cancer", "/bladder-cancer/"), ("Chronic Kidney Disease", "/chronic-kidney-disease/"), ("Kidney Stones", "/kidney-stones/"), ("Smoking", "/smoking/")],
 groups=["Other"], blurb="Usually found by accident on a scan, often early. 83% survive 5 years.",
 search="kidney cancer renal cell carcinoma blood in urine nephrectomy")

fact("mesothelioma",
 "Mesothelioma: Asbestos, Symptoms and Support",
 "Mesothelioma explained: how asbestos causes it decades later, symptoms, diagnosis, treatment, support and compensation in Australia.",
 "Mesothelioma", "Mesothelioma",
 "Mesothelioma is a rare cancer of the lining around the lungs or, less often, the tummy. It’s almost always caused by breathing in asbestos, usually 20 to 50 years earlier. Australia has one of the highest rates in the world, with about 700 people diagnosed each year.",
 soon("if you’ve worked with or lived around asbestos and develop breathlessness, chest pain, a cough that won’t settle, tummy swelling, or weight loss you can’t explain. Tell your GP about the exposure.") +
 h2("The numbers", [
   "About <b>700</b> new diagnoses a year in Australia (684 in 2024)",
   "Most are men; the median age at diagnosis is <b>77</b>",
   "More than 9 in 10 people had possible or probable asbestos exposure",
   "Survival is improving: almost half of people are alive a year after diagnosis, up from under a third in the late 1980s"]) +
 h2("How asbestos causes it", [
   "Asbestos fibres breathed in lodge in the lining of the lungs and stay there for life",
   "Over decades they cause damage that can lead to cancer",
   "Exposure came from building, mining, shipyards, power stations, brake repairs and home renovations",
   "Family members exposed to dust on work clothes were also affected",
   "There’s no safe level of exposure, but most people exposed don’t develop mesothelioma"]) +
 h2("If you’re renovating", [
   "Houses built before 1990 may contain asbestos in sheeting, eaves, flooring and roofs",
   "Don’t drill, cut, sand or water-blast suspected asbestos",
   "Have it tested and removed by a licensed removalist"]) +
 h2("Tests and treatment", [
   "<b>Tests:</b> chest X-ray and CT scan, draining fluid around the lung, and a biopsy (often by keyhole surgery)",
   "<b>Treatment:</b> immunotherapy, chemotherapy, sometimes surgery or radiotherapy, chosen with a specialist team",
   "Draining fluid and procedures to stop it coming back can ease breathlessness quickly",
   "Palliative care from early on improves comfort and quality of life",
   "Clinical trials are an option worth asking about"]) +
 h2("Compensation and support", [
   "People with mesothelioma are often eligible for compensation, and claims can be time-sensitive",
   "Asbestos support groups and Cancer Council can help you find legal and practical help",
   "Your GP can help with records of past work and exposures"]),
 [("What causes mesothelioma?", "Almost always breathing in asbestos fibres, usually 20 to 50 years before the cancer appears."),
  ("What are the symptoms of mesothelioma?", "Breathlessness, chest pain, a lasting cough, tiredness, weight loss and, if it affects the tummy, swelling or pain there."),
  ("Is there compensation for mesothelioma in Australia?", "Often, yes. People diagnosed may be able to claim through workers’ compensation, schemes or the courts. Seek advice early, because some claims are time-sensitive.")],
 [CC, ("Asbestos and Silica Safety and Eradication Agency", "https://www.asbestossafety.gov.au/", "Asbestos safety at home and work. Free."),
  ("Lung Foundation Australia 1800 654 301", "https://lungfoundation.com.au/", "Information and support. Free.")],
 [("Mesothelioma cases hold steady as survival slowly improves (Medical Republic, reporting the Australian Mesothelioma Registry)", "https://www.medicalrepublic.com.au/?p=119813"),
  ("Cancer Australia: Mesothelioma statistics", "https://canceraustralia.gov.au/cancer-types/mesothelioma/mesothelioma-australia-statistics"),
  ("Cancer Council: Mesothelioma", "https://www.cancer.org.au/cancer-information/types-of-cancer/mesothelioma")],
 [("Lung Cancer", "/lung-cancer/"), ("Smoking", "/smoking/"), ("Cancer Screening", "/cancer-screening/")],
 groups=["Lungs and breathing", "Other"], blurb="A rare cancer caused by asbestos, decades after exposure.",
 search="mesothelioma asbestos pleural cancer compensation")
