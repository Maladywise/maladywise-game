# Cancer series, batch 2: ovarian, cervical, melanoma, thyroid, lymphoma. Run with _scripts/gen_sheets.py
# Figures: Cancer Australia statistics pages (AIHW data) and the AIHW World Cancer Day 2026 release (ovarian 2025 estimates).
# Thyroid figures are Cancer Australia's 2022 estimates (page awaiting the Oct 2025 AIHW update): worded as "about".
CC = ("Cancer Council 13 11 20", "https://www.cancer.org.au/", "Information and support line for anyone affected by cancer. Free.")
def sass(t): return '<p class="sass">%s</p>' % t
def soon(t): return '<p class="callout"><b>See your GP soon</b> %s</p>' % t

fact("ovarian-cancer",
 "Ovarian Cancer: Symptoms, Risk, Genes and Treatment",
 "Ovarian cancer explained: the quiet symptoms to know (bloating, feeling full fast, pelvic pain), why there's no screening test, BRCA genes, treatment and survival in Australia.",
 "Ovarian Cancer", "Ovarian cancer",
 "About 1,900 Australians are diagnosed with ovarian cancer each year. It’s hard to find early because the symptoms are vague and there’s no screening test, so knowing the pattern matters.",
 sass("Bloating that won’t quit is not a personality trait. If it’s new and every day, it deserves a look.") +
 soon("if any of these are new and happen on most days for more than a few weeks: bloating or a swollen tummy, pain in the tummy or pelvis, feeling full quickly or not wanting to eat, needing to wee more often or urgently. A change in bowel habit, tiredness or weight loss can come with them.") +
 h2("The numbers", [
   "About <b>1,900</b> new cases and <b>1,100</b> deaths a year in Australia (2025 estimates)",
   "It’s about a quarter of gynaecological cancers but almost half of gynaecological cancer deaths",
   "<b>49%</b> of people are alive 5 years after diagnosis, up from 31% in the late 1980s",
   "Most are diagnosed after 50, but it can happen at any age"]) +
 h2("Why it’s hard to catch", [
   "The ovaries sit deep in the pelvis, so small cancers rarely cause symptoms",
   "Early symptoms look like everyday tummy troubles, so they’re easy to brush off",
   "There is <b>no screening test</b>: the Pap or cervical screening test doesn’t check the ovaries",
   "The CA-125 blood test and ultrasound don’t work as screening for the general population, though they help when symptoms are present"]) +
 h2("Who is at higher risk", [
   "Getting older, especially after menopause",
   "Inherited gene changes such as <b>BRCA1</b>, <b>BRCA2</b> and Lynch syndrome",
   "A strong family history of ovarian, breast or bowel cancer",
   "Endometriosis (a small increase in risk)",
   "The pill, pregnancy and breastfeeding all <b>lower</b> the risk"]) +
 sass("Many ovarian cancers actually start in the fallopian tube. Anatomy loves a plot twist.") +
 h2("Tests and treatment", [
   "Your GP will feel the tummy, may do a pelvic examination and order a <b>CA-125</b> blood test and a pelvic <b>ultrasound</b>",
   "A <b>gynaecological oncologist</b> (a specialist surgeon) should lead treatment",
   "<b>Surgery</b> to remove as much cancer as possible, usually with <b>chemotherapy</b>",
   "<b>PARP inhibitors</b> help many people with BRCA changes and some others",
   "Everyone with high-grade ovarian cancer should be offered <b>genetic testing</b>: it guides treatment and helps relatives"]) +
 h2("If ovarian cancer runs in your family", [
   "Ask your GP about a referral to a <b>family cancer clinic</b>",
   "People with BRCA changes can lower their risk a lot with surgery to remove the tubes and ovaries, usually once they’ve finished having children",
   "Removing the fallopian tubes during other planned surgery may lower risk for others: ask your surgeon"]) +
 skip([("CA-125 as a yearly check-up test", "It misses early cancers and flags lots of harmless things. It’s for people with symptoms or known cancer."),
   ("Talc and ‘natural’ hormone products", "Don’t replace seeing a doctor about symptoms.")]),
 [("What are the first signs of ovarian cancer?", "Often vague: bloating, a swollen tummy, pelvic or tummy pain, feeling full quickly and needing to wee more often. The clue is that they’re new and happen most days for weeks."),
  ("Does a cervical screening test check for ovarian cancer?", "No. It only checks the cervix for HPV. There is no screening test for ovarian cancer, so report persistent symptoms."),
  ("Is ovarian cancer hereditary?", "Some is. Up to about 1 in 5 is linked to inherited gene changes such as BRCA1 and BRCA2. A strong family history is worth discussing with your GP.")],
 [CC, ("Ovarian Cancer Australia", "https://www.ovariancancer.net.au/", "Support, nurses and information. Free.")],
 [("Cancer Australia: Ovarian cancer statistics", "https://www.canceraustralia.gov.au/cancer-types/ovarian-cancer/statistics"),
  ("AIHW: Cancer data in Australia", "https://www.aihw.gov.au/reports/cancer/cancer-data-in-australia"),
  ("Cancer Council: Ovarian cancer", "https://www.cancer.org.au/cancer-information/types-of-cancer/ovarian-cancer")],
 [("Breast Cancer", "/breast-cancer/"), ("Genetics", "/genetics/"), ("Endometriosis", "/endometriosis/"), ("Menopause", "/menopause/")],
 groups=["Women’s health", "Other"], blurb="Quiet symptoms, no screening test. Know the pattern.",
 search="ovarian cancer ovary bloating pelvic pain ca125 ca-125 brca fallopian tube")

fact("cervical-cancer",
 "Cervical Cancer: Screening, HPV, Self-Collection and Symptoms",
 "Cervical cancer explained: HPV, the 5-yearly cervical screening test (including the do-it-yourself swab), the free HPV vaccine, symptoms and treatment. Australia is on track to eliminate it.",
 "Cervical Cancer", "Cervical cancer",
 "Almost all cervical cancer is caused by HPV, a very common virus. Between the free vaccine and 5-yearly screening, Australia is on track to be one of the first countries to eliminate it.",
 sass("The cervical screening test now comes in a take-it-yourself version. No stirrups. No small talk about the weather.") +
 soon("for bleeding after sex, between periods or after menopause, unusual discharge, or pain during sex. These are usually not cancer, but they need checking, even if your last screening test was normal.") +
 h2("The numbers", [
   "About <b>950</b> new cases and <b>250</b> deaths a year in Australia (2025 estimates)",
   "About <b>1 in 190</b> women and people with a cervix are diagnosed by age 85",
   "<b>77%</b> are alive 5 years after diagnosis, and far more when found early",
   "Most cases are in people who have never been screened or are overdue"]) +
 h2("Screening: the cervical screening test", [
   "Every <b>5 years</b> from 25 to 74 if you’ve ever been sexually active, whatever your sexual history or gender",
   "It tests for <b>HPV</b>, which causes almost all cervical cancers, not for cancer itself",
   "You can choose <b>self-collection</b>: a quick swab from the vagina, done privately in the clinic. It’s as accurate as a doctor-collected test",
   "Vaccinated? Still screen. The vaccine doesn’t cover every cancer-causing HPV type",
   "A positive HPV result usually means a follow-up test, not cancer"]) +
 h2("The HPV vaccine", [
   "Free at school for 12 and 13 year olds: one dose is enough",
   "Free catch-up for people up to 25 who missed it",
   "It also prevents most anal and throat cancers and genital warts"]) +
 sass("HPV is so common that most sexually active people have it at some point. Catching it isn’t a moral failing. Skipping the screen is just a missed opportunity.") +
 h2("Tests and treatment", [
   "Abnormal results lead to a <b>colposcopy</b>: a magnified look at the cervix, sometimes with a small biopsy",
   "Pre-cancer changes are removed with a quick procedure, usually under local anaesthetic",
   "Early cancer: surgery, sometimes keeping fertility",
   "Larger cancers: radiotherapy with chemotherapy"]) +
 skip([("Skipping screening after menopause", "Keep going until 74. Bleeding after menopause always needs checking."),
   ("Supplements to ‘clear HPV’", "No good evidence. Your immune system usually clears HPV by itself within two years.")]),
 [("How often do I need a cervical screening test?", "Every 5 years from 25 to 74 if your HPV test is negative. You may need tests more often after an abnormal result."),
  ("Can I do my own cervical screening test?", "Yes. Everyone eligible can choose self-collection: a simple swab from the vagina, done privately. It’s as accurate as a clinician-collected sample for HPV."),
  ("Do I still need screening if I had the HPV vaccine?", "Yes. The vaccine prevents most but not all cancer-causing HPV types, so keep screening every 5 years.")],
 [CC, ("National Cervical Screening Program", "https://www.health.gov.au/our-work/national-cervical-screening-program", "Who, when and how. Free."),
  ("National Cancer Screening Register 1800 627 701", "https://www.ncsr.gov.au/", "Check when you’re due.")],
 [("Cancer Australia: Cervical cancer statistics", "https://www.canceraustralia.gov.au/cancer-types/cervical-cancer/statistics"),
  ("National Cervical Screening Program (health.gov.au)", "https://www.health.gov.au/our-work/national-cervical-screening-program"),
  ("Cancer Council: Cervical screening", "https://www.cancer.org.au/cancer-information/causes-and-prevention/early-detection-and-screening/cervical-screening")],
 [("Cancer Screening", "/cancer-screening/"), ("Menopause", "/menopause/"), ("Ovarian Cancer", "/ovarian-cancer/")],
 groups=["Women’s health"], blurb="Caused by HPV. Screen every 5 years, and you can do the swab yourself.",
 search="cervical cancer cervix hpv pap smear cervical screening self collection colposcopy")

fact("melanoma",
 "Melanoma: Signs, Mole Checks, Sun Safety and Treatment",
 "Melanoma explained: how to spot a changing mole, who's at higher risk, skin checks, sun protection and treatment, including immunotherapy, in Australia.",
 "Melanoma", "Melanoma",
 "Australia has one of the highest melanoma rates in the world: about 17,400 new cases a year. Most are found as a new or changing spot, and found early, almost everyone is cured.",
 sass("A tan is your skin filing a damage report. Nobody needs that much paperwork.") +
 soon("for a new spot, or a mole that’s changing in size, shape or colour, looks different from your other moles, bleeds, itches or won’t heal. A fast-growing, firm, raised red or skin-coloured lump needs to be seen within days.") +
 h2("The numbers", [
   "About <b>17,400</b> new cases a year in Australia: the third most common cancer here (2025 estimates)",
   "About <b>1 in 19</b> Australians are diagnosed by age 85",
   "<b>94%</b> are alive 5 years after diagnosis",
   "About <b>1,450</b> deaths a year, mostly from melanoma found late"]) +
 h2("What to look for", [
   "<b>Change</b> is the most important sign: size, shape, colour or height",
   "An <b>ugly duckling</b>: a spot that looks different from your others",
   "Uneven shape or edges, several colours, or bigger than about 6 mm",
   "<b>Nodular melanoma</b> is the exception: firm, raised, often one colour (even pink), and fast. Don’t wait on it",
   "Melanoma can appear anywhere, including soles, nails, scalp and places the sun doesn’t reach"]) +
 h2("Who is at higher risk", [
   "Lots of moles, or large unusual-looking moles",
   "Fair skin that burns easily, red or fair hair, freckles",
   "A past melanoma, or a parent, brother or sister with melanoma",
   "Lots of sunburn, especially in childhood, and any solarium use",
   "A weakened immune system"]) +
 sass("Solariums were banned in Australia in 2015. If someone is still selling a ‘base tan’, they are selling skin cancer with extra steps.") +
 h2("Prevention", [
   "<b>Slip, slop, slap, seek, slide</b> whenever the UV index is 3 or more",
   "SPF 50+ broad-spectrum sunscreen, reapplied every 2 hours and after swimming",
   "Check the daily UV forecast (the SunSmart app is free)",
   "Get to know your own skin and check it every few months. Ask your GP how often you need a skin check"]) +
 h2("Tests and treatment", [
   "Your GP or skin doctor looks with a <b>dermatoscope</b> and may photograph spots to compare later",
   "Suspicious spots are cut out and sent to the lab",
   "Thin melanomas: a wider cut around the scar is usually all that’s needed",
   "Thicker ones may need a <b>sentinel lymph node</b> check",
   "Advanced melanoma: <b>immunotherapy</b> and targeted drugs have transformed survival. Australian researchers helped lead this"]) +
 skip([("Mole-mapping apps as a diagnosis", "Handy reminders to check, but they miss melanomas. A changing spot needs a person to look."),
   ("Black salve and ‘natural’ mole removers", "They burn the skin, can leave cancer behind and hide the evidence. Dangerous.")]),
 [("What does early melanoma look like?", "Usually a new spot or a mole that’s changing. Look for uneven shape, several colours, growth, or a spot that looks different from your others. Fast, firm, raised lumps need checking within days."),
  ("How often should I get a skin check?", "It depends on your risk. People at high risk (many moles, past melanoma, strong family history) need regular checks. Ask your GP what suits you, and check your own skin every few months."),
  ("Is melanoma curable?", "Yes, especially when found early. 94% of Australians are alive 5 years after diagnosis, and immunotherapy now helps many people with advanced melanoma.")],
 [CC, ("Melanoma Institute Australia", "https://melanoma.org.au/", "Information on melanoma and skin checks.")],
 [("Cancer Australia: Melanoma statistics", "https://www.canceraustralia.gov.au/cancer-types/melanoma/statistics"),
  ("Cancer Council: Melanoma", "https://www.cancer.org.au/cancer-information/types-of-cancer/melanoma"),
  ("Cancer Council: SunSmart", "https://www.sunsmart.com.au/")],
 [("Skin Cancer", "/skin-cancer/"), ("Moles", "/moles/"), ("Vitamin D", "/vitamin-d/"), ("Cancer Screening", "/cancer-screening/")],
 groups=["Skin"], blurb="Watch for new or changing spots. Found early, almost always cured.",
 search="melanoma skin cancer mole changing spot nodular sun safety skin check dermatoscope")

fact("thyroid-cancer",
 "Thyroid Cancer: Lumps, Nodules, Tests and Treatment",
 "Thyroid cancer explained: most thyroid lumps aren't cancer, when a nodule needs a needle test, overdiagnosis, surgery, radioactive iodine and life after treatment.",
 "Thyroid Cancer", "Thyroid cancer",
 "Thyroid cancer is uncommon, about 4,000 Australians a year, and most types are very treatable: about 97 in 100 people are alive 5 years later. Most thyroid lumps are not cancer at all.",
 sass("Thyroid nodules are like emails marked ‘urgent’: very common, and most of them aren’t.") +
 soon("for a lump in the neck that’s new or growing, a hoarse voice lasting more than 3 weeks, trouble swallowing, or swollen glands in the neck that don’t settle.") +
 h2("The numbers", [
   "About <b>4,000</b> new cases a year in Australia, about 7 in 10 in women",
   "About <b>97%</b> are alive 5 years after diagnosis",
   "Thyroid nodules are very common: about half of people over 60 have one on ultrasound. Over 9 in 10 are harmless",
   "Cases rose for years mainly because scans pick up tiny, slow cancers that may never have caused harm"]) +
 h2("Types", [
   "<b>Papillary</b>: the most common. Slow-growing, usually curable",
   "<b>Follicular</b>: also usually very treatable",
   "<b>Medullary</b>: rarer. Sometimes runs in families (ask about gene testing)",
   "<b>Anaplastic</b>: rare and aggressive, mostly in older people"]) +
 h2("Tests", [
   "A <b>TSH</b> blood test to check how the thyroid is working",
   "A neck <b>ultrasound</b>: the shape and features of a nodule decide whether it needs testing",
   "A <b>fine-needle biopsy</b> takes cells from suspicious nodules. Small, low-risk-looking nodules are often just watched"]) +
 sass("Sometimes the best treatment for a tiny thyroid cancer is a calendar reminder for the next ultrasound. Doing less can be the right call.") +
 h2("Treatment", [
   "<b>Surgery</b> to remove half or all of the thyroid is the main treatment",
   "<b>Radioactive iodine</b> after surgery for some, to mop up remaining thyroid cells",
   "After removing the whole thyroid you take <b>thyroxine</b> tablets every day for life",
   "<b>Active surveillance</b> (regular ultrasounds) is an option for some very small papillary cancers",
   "Regular blood tests (thyroglobulin) and ultrasounds check it hasn’t come back"]) +
 skip([("Iodine or ‘thyroid support’ supplements to shrink nodules", "They don’t treat thyroid cancer and can upset thyroid levels."),
   ("Full-body scans to ‘check for cancer’", "They find lots of harmless thyroid nodules and lead to tests you didn’t need.")]),
 [("Is a thyroid nodule cancer?", "Usually not. More than 9 in 10 thyroid nodules are harmless. An ultrasound decides which few need a needle test."),
  ("Is thyroid cancer curable?", "Most types are very treatable: about 97% of Australians are alive 5 years after diagnosis. Anaplastic thyroid cancer is the rare exception."),
  ("Will I need thyroid tablets after surgery?", "If the whole thyroid is removed, yes: one thyroxine tablet a day for life, with regular blood tests. After half is removed, many people don’t need them.")],
 [CC],
 [("Cancer Australia: Thyroid cancer statistics", "https://www.canceraustralia.gov.au/cancer-types/thyroid-cancer/thyroid-cancer-australia-statistics"),
  ("Cancer Council: Thyroid cancer", "https://www.cancer.org.au/cancer-information/types-of-cancer/thyroid-cancer")],
 [("Thyroid", "/thyroid/"), ("Genetics", "/genetics/"), ("Cancer Screening", "/cancer-screening/")],
 groups=["Other"], blurb="Most thyroid lumps aren’t cancer, and most thyroid cancer is very treatable.",
 search="thyroid cancer thyroid nodule neck lump papillary follicular medullary radioactive iodine thyroxine")

fact("lymphoma",
 "Lymphoma: Symptoms, Hodgkin vs Non-Hodgkin, and Treatment",
 "Lymphoma explained: painless swollen glands, fevers, night sweats and weight loss, the difference between Hodgkin and non-Hodgkin lymphoma, biopsies and modern treatment.",
 "Lymphoma", "Lymphoma",
 "Lymphoma is a cancer of white blood cells called lymphocytes. About 7,800 Australians are diagnosed each year, and many types respond very well to treatment.",
 sass("Most swollen glands are your immune system doing its job after a cold. The ones worth checking are the ones that didn’t get the memo to shrink.") +
 soon("for a painless lump in the neck, armpit or groin that’s still there after 3 to 4 weeks or keeps growing, especially with drenching night sweats, fevers, weight loss you can’t explain, ongoing itch or tiredness.") +
 h2("The numbers", [
   "About <b>7,800</b> new cases a year in Australia (2025 estimates)",
   "<b>79%</b> are alive 5 years after diagnosis",
   "About 9 in 10 are <b>non-Hodgkin lymphoma</b>; the rest are Hodgkin lymphoma",
   "Hodgkin lymphoma is one of the most common cancers in teenagers and young adults, and one of the most curable"]) +
 h2("The two main groups", [
   "<b>Hodgkin lymphoma</b>: peaks in young adults and again in older age. Most people are cured",
   "<b>Non-Hodgkin lymphoma</b>: over 60 types. Some grow fast and need treatment straight away; others grow slowly for years",
   "Slow-growing (indolent) types are often watched rather than treated until they cause problems"]) +
 h2("Tests", [
   "Blood tests, then a <b>biopsy</b> of a swollen gland: the only way to confirm lymphoma and find the type",
   "A <b>PET-CT</b> scan to see where it is",
   "Sometimes a bone marrow biopsy"]) +
 sass("‘Watch and wait’ sounds like doing nothing. For slow lymphomas it’s a proper treatment plan, with check-ups, that spares people years of side effects.") +
 h2("Treatment", [
   "<b>Chemotherapy</b>, often with <b>immunotherapy</b> such as rituximab",
   "<b>Radiotherapy</b> for some early or localised lymphomas",
   "Newer options: targeted tablets, bispecific antibodies and <b>CAR-T cell therapy</b> for lymphoma that has come back",
   "A stem cell transplant for some",
   "Long-term follow-up checks for late effects such as heart, thyroid and fertility problems"]) +
 skip([("Antibiotics for a gland that keeps growing", "Fine for an obvious infection, but a painless gland lasting more than a few weeks needs a proper look, not another course."),
   ("Alkaline diets and high-dose vitamin infusions", "No evidence they treat lymphoma, and some interfere with treatment.")]),
 [("What does a lymphoma lump feel like?", "Usually painless, rubbery and slowly growing, in the neck, armpit or groin. Most swollen glands are from infections and settle within a few weeks."),
  ("What is the difference between Hodgkin and non-Hodgkin lymphoma?", "They look different under the microscope and behave differently. Hodgkin lymphoma often affects young adults and is usually curable. Non-Hodgkin lymphoma covers many types, from slow-growing to fast."),
  ("Is lymphoma curable?", "Many types are. Hodgkin lymphoma and several fast-growing non-Hodgkin types are often cured. Slow-growing types can usually be controlled for many years.")],
 [CC, ("Lymphoma Australia", "https://www.lymphoma.org.au/", "Lymphoma nurses and information. Free."),
  ("Leukaemia Foundation 1800 620 420", "https://www.leukaemia.org.au/", "Support for people with blood cancers, including lymphoma. Free.")],
 [("Cancer Australia: Lymphoma statistics", "https://www.canceraustralia.gov.au/cancer-types/lymphoma/lymphoma-australia-statistics"),
  ("Cancer Council: Lymphoma", "https://www.cancer.org.au/about-cancer/types-of-cancer/lymphoma.html")],
 [("Glandular Fever", "/glandular-fever/"), ("Genetics", "/genetics/"), ("Cancer Screening", "/cancer-screening/")],
 groups=["Blood and nutrition"], blurb="Painless glands that don’t settle. Many types are very treatable.",
 search="lymphoma hodgkin non-hodgkin swollen glands lymph nodes night sweats rituximab car-t")
