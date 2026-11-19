# X and Y fact sheets (Nov 2026, owner's request): X-rays and radiation dose, xanthelasma, yellow fever
ARP = ("ARPANSA: Radiation in medical imaging (patient handout)", "https://www.arpansa.gov.au/sites/default/files/documents/2024-05/patienthandout.pdf")
ACSQHC = ("Australian Commission on Safety and Quality in Health Care: CT scans for children", "https://www.safetyandquality.gov.au/sites/default/files/migrated/CT-scans-for-children-information-for-referrers.pdf")

fact("x-rays-and-radiation",
 "X-Rays and Radiation Dose: How Risky Are Scans?",
 "X-ray, CT and nuclear medicine radiation doses compared with background radiation and flights, the real cancer risk, children, pregnancy, and which scans use no radiation.",
 "X-Rays and Radiation Dose", "X-rays and radiation",
 "Medical scans that use X-rays give a small dose of radiation. For most tests the dose is tiny, often less than a few weeks or months of the natural radiation we all get anyway. CT scans give more, so they’re used when the answer matters. The benefit of a scan you need almost always outweighs the risk.",
 h2("How big are the doses?", [
   "We all get about <b>1.5 mSv a year</b> of natural background radiation in Australia, from the ground, air, food and space.",
   "<b>Arm, leg, hand or foot X-ray:</b> about 0.001 mSv (a few hours of background).",
   "<b>Chest X-ray:</b> about 0.02 mSv, similar to a Sydney to Cairns flight, or 5 days of background.",
   "<b>Dental bitewing X-ray:</b> about 0.01 mSv. <b>Bone density (DEXA):</b> about 0.001 mSv.",
   "<b>Mammogram:</b> about 0.3 mSv. <b>Lumbar spine X-ray:</b> about 1.5 mSv.",
   "<b>CT head:</b> about 2 mSv. <b>CT chest:</b> about 7 mSv. <b>CT abdomen:</b> about 8 mSv.",
   "<b>Bone scan:</b> about 5 mSv. <b>PET-CT:</b> about 14 mSv.",
   "<b>MRI and ultrasound use no radiation at all.</b>"]) +
 h2("What’s the actual risk?", [
   "Radiation can very slightly raise the chance of cancer many years later. Small doses haven’t been shown to cause harm; risk estimates assume a little risk at any dose to be safe.",
   "Plain X-rays: negligible to minimal (well under 1 in 100,000).",
   "A single CT scan: low, roughly 1 in 10,000 to 1 in 1,000 extra lifetime risk, depending on the area and your age.",
   "For comparison, about <b>1 in 5</b> of us will die of cancer anyway, for other reasons.",
   "The risk from <b>missing a diagnosis</b> because a needed scan wasn’t done is usually far greater."]) +
 h2("Children", [
   "Children’s tissues are more sensitive to radiation and they have more years ahead, so their risk per scan is higher.",
   "Radiology services use child-sized settings. Ultrasound or MRI is used instead when it can answer the question.",
   "It’s fine to ask: ‘Is this scan needed, and is there a non-radiation option?’"]) +
 h2("Pregnancy", [
   "Tell the staff if you might be pregnant.",
   "Most X-rays away from the belly (chest, limbs, teeth) give the baby almost no dose.",
   "Even most scans of the abdomen give a baby a dose well below levels linked with harm. If a CT is needed for a serious problem, it’s usually safer to have it.",
   "Ultrasound and MRI are preferred in pregnancy where they can do the job."]) +
 h2("Keeping doses down", [
   "Keep a list of scans you’ve had, so they aren’t repeated unnecessarily.",
   "Ask your doctor what the scan will change. Many back-pain and headache scans aren’t needed.",
   "Imaging services in Australia are monitored against national reference doses, and CT doses have been falling."]),
 [("How much radiation is in a chest X-ray?", "About 0.02 mSv: roughly the same as 5 days of natural background radiation, or a Sydney to Cairns flight."),
  ("Is a CT scan dangerous?", "A CT gives more radiation than a plain X-ray, adding a small extra lifetime cancer risk (roughly 1 in 10,000 to 1 in 1,000). When a CT is needed, the benefit is almost always much greater."),
  ("Do MRI and ultrasound use radiation?", "No. MRI uses magnets and radio waves; ultrasound uses sound waves. Neither uses ionising radiation."),
  ("Can I have an X-ray when pregnant?", "Tell the staff. X-rays away from the belly give the baby almost no dose, and most scans give doses well below levels linked with harm. Ultrasound and MRI are preferred when they can answer the question.")],
 [ARP + ("Australia’s radiation safety agency: dose table and risk levels. Free.",)],
 [ARP, ACSQHC, ("ARPANSA: Patients receiving less radiation from CT scans", "https://arpansa.gov.au/news/patients-receiving-less-radiation-ct-scans")],
 [("X-ray quiz", "/x-ray-quiz/"), ("Lung cancer", "/lung-cancer/"), ("Breast cancer", "/breast-cancer/")],
 groups=["Other"], blurb="Scan radiation doses compared with everyday life, and what the risk really is.",
 search="x-ray xray radiation dose ct scan mri ultrasound mSv cancer risk pregnancy children chest x-ray mammogram background radiation flight")

fact("xanthelasma",
 "Xanthelasma: Yellow Cholesterol Patches on the Eyelids",
 "Xanthelasma: soft yellow patches on the eyelids. What causes them, the link with cholesterol and heart disease, which checks to have, and removal options.",
 "Xanthelasma", "xanthelasma",
 "Soft, flat, yellow patches on the eyelids, usually near the inner corner. They’re deposits of cholesterol-filled cells. Harmless in themselves, but they’re a good reason to check your cholesterol and heart risk.",
 h2("What they look like", [
   "Painless, soft, yellowish patches on the upper or lower eyelids, often on both sides.",
   "They usually grow slowly and don’t go away on their own.",
   "Most common in middle age, and slightly more common in women."]) +
 h2("Why they matter", [
   "About half of people with xanthelasma have <b>high cholesterol</b>; the other half have normal levels.",
   "A large Danish study (the Copenhagen City Heart Study, about 12,700 people) found people with xanthelasma had a higher risk of heart attack and heart disease, even after cholesterol and other risk factors were taken into account.",
   "So they’re a nudge to check your overall heart risk, not just your cholesterol."]) +
 h2("Checks your GP may suggest", [
   "Fasting or non-fasting cholesterol (lipid) test.",
   "Blood sugar, thyroid and liver tests, as these can affect cholesterol.",
   "A heart risk check (blood pressure, smoking, family history, weight)."]) +
 h2("Treatment", [
   "Treating high cholesterol is good for your heart, but rarely shrinks existing patches.",
   "Removal is cosmetic: <b>surgery, laser, cryotherapy (freezing) or chemical peels</b> by an experienced doctor.",
   "They often come back after removal, so lowering heart risk factors still matters."]),
 [("Are xanthelasma dangerous?", "Not in themselves. But they can be linked with high cholesterol and higher heart disease risk, so get your cholesterol and heart risk checked."),
  ("Will xanthelasma go away if I lower my cholesterol?", "Usually not. Treating cholesterol protects the heart, but the patches generally need removal if they bother you."),
  ("Can xanthelasma come back after removal?", "Yes. They often return, especially if cholesterol is high.")],
 [("Heart Foundation: Know your risks", "https://www.heartfoundation.org.au/your-heart/know-your-risks", "Heart risk and cholesterol information. Free.")],
 [("Christoffersen M et al. Xanthelasmata, arcus corneae and ischaemic vascular disease (BMJ, 2011): summary", "https://www.eurekalert.org/pub_releases/2011-09/bmj-ypa091411.php")],
 [("Cholesterol", "/cholesterol/"), ("High blood pressure", "/high-blood-pressure/")],
 groups=["Skin", "Heart and lifestyle"], blurb="Yellow cholesterol patches on the eyelids: harmless, but a reason to check heart risk.",
 search="xanthelasma yellow patches eyelids cholesterol deposits xanthelasma palpebrarum heart disease removal laser")

YF_HB = ("Australian Immunisation Handbook: Yellow fever", "https://immunisationhandbook.health.gov.au/contents/vaccine-preventable-diseases/yellow-fever")
fact("yellow-fever",
 "Yellow Fever: Travel Vaccine, Certificate and Symptoms",
 "Yellow fever: where it is, how it spreads, symptoms, the single-dose vaccine, who can’t have it, and Australia’s entry certificate rules for travellers.",
 "Yellow Fever", "yellow fever",
 "A virus spread by mosquitoes in tropical Africa and South America. Most infections are mild, but some people get very sick with jaundice and bleeding, and many of those die. One dose of vaccine protects for life.",
 h2("Where it is", [
   "Parts of <b>sub-Saharan Africa</b> and <b>tropical South America</b>.",
   "It isn’t found in Asia or Australia, though Australia has mosquitoes that could spread it, which is why entry rules are strict."]) +
 h2("Symptoms", [
   "Fever, headache, muscle aches, nausea and tiredness, 3 to 6 days after the bite. Most people recover.",
   "About 1 in 7 then get a <b>second, toxic phase</b>: jaundice (the ‘yellow’), bleeding, and liver and kidney failure. About half of these people die.",
   "There’s no specific antiviral treatment; care is supportive."]) +
 h2("The vaccine", [
   "A single injection of a live vaccine (Stamaril in Australia). It’s only given at <b>approved yellow fever vaccination centres</b>.",
   "One dose gives lifelong protection for most people. The certificate is valid for life, starting 10 days after vaccination.",
   "Get it at least 10 days before travel, and keep your certificate with your passport."]) +
 h2("Who usually shouldn’t have it", [
   "Babies under 9 months (6 months in an outbreak).",
   "People with weakened immune systems, a thymus disorder or severe egg allergy.",
   "Pregnant or breastfeeding people, unless travel to a risk area can’t be avoided.",
   "People over 60 have a higher (but still rare) risk of serious vaccine reactions, so the need is weighed carefully."]) +
 h2("Australia’s entry rules", [
   "Travellers aged 1 year or older who have stayed overnight or longer in a listed yellow fever risk country within 6 days before arriving in Australia need a valid certificate.",
   "Without one you can still enter, but you’ll get information and may be asked to report symptoms. Check the latest rules before you travel."]) +
 h2("Avoid bites", [
   "Repellent with DEET, picaridin or oil of lemon eucalyptus, long loose clothing and screened rooms. The mosquitoes bite during the day."]),
 [("Is the yellow fever vaccine lifelong?", "For most people, yes. One dose gives lifelong protection, and the certificate is valid for life from 10 days after the injection."),
  ("Where can I get the yellow fever vaccine in Australia?", "Only at approved yellow fever vaccination centres. Your GP or a travel clinic can tell you the nearest one."),
  ("Do I need a yellow fever certificate to enter Australia?", "Yes, if you’re 1 year or older and stayed overnight or longer in a listed risk country in the 6 days before arriving."),
  ("Can I get yellow fever in Asia?", "No. Yellow fever is found in parts of Africa and South America, not Asia.")],
 [YF_HB + ("Australian guidance on the vaccine, who needs it and who shouldn’t have it. Free.",),
  ("NSW Health: Yellow fever fact sheet", "https://www.health.nsw.gov.au/Infectious/factsheets/Pages/Yellow-Fever.aspx", "Symptoms and travel advice. Free.")],
 [YF_HB, ("Australian Government: Yellow fever fact sheet", "https://www.health.gov.au/sites/default/files/2026-04/yellow-fever-fact-sheet.pdf"),
  ("NSW Health: Yellow fever fact sheet", "https://www.health.nsw.gov.au/Infectious/factsheets/Pages/Yellow-Fever.aspx")],
 [("Travel vaccines", "/travel-vaccines/"), ("Travel health", "/travel/")],
 groups=["Travel and outdoors", "Infections"], blurb="Mosquito-borne virus in Africa and South America; one vaccine dose protects for life.",
 search="yellow fever vaccine stamaril certificate travel africa south america mosquito jaundice entry requirements australia")
