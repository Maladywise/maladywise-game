# Respiratory: chronic rhinosinusitis, influenza, COVID-19. Run with _scripts/gen_sheets.py
fact("chronic-rhinosinusitis",
 "Chronic Rhinosinusitis: Blocked Nose, Polyps and What Helps",
 "Chronic sinusitis explained: 12 weeks of blockage, discharge, facial pressure or smell loss, nasal polyps, saline rinses, steroid sprays, surgery and new biologic injections.",
 "Chronic Rhinosinusitis", "Chronic rhinosinusitis",
 "A blocked, runny nose with facial pressure or a lost sense of smell for 12 weeks or more. It’s long-term inflammation, not a lingering infection, so antibiotics rarely fix it. Daily rinses and a steroid spray, used properly, are the backbone.",
 h2("Symptoms (for 12 weeks or more)", [
   "Blocked or congested nose, and/or discharge down the front or back of the throat",
   "Facial pain or pressure",
   "Reduced or lost sense of smell, a strong clue to nasal polyps",
   "Some have <b>nasal polyps</b> (soft, grape-like swellings); others don’t"]) +
 '<p class="callout"><b>See a doctor urgently</b> for swelling around the eye, double vision, a severe headache, confusion or a stiff neck. A one-sided blocked nose with bleeding also needs checking.</p>' +
 ladder("What helps", "Most people improve with steps 1–3 used every day for at least 2–3 months.", [
   ("s", "Step 1 · Self-care", "High-volume saltwater rinses", "A squeeze bottle or neti pot, once or twice a day, with boiled or distilled water.", "Reduces symptoms in trials, and helps sprays reach the lining", "About $15–25 for a kit", "Ongoing", "Use boiled-and-cooled or distilled water and clean the bottle.", "Feels like drowning the first time. Feels like breathing by day three."),
   ("s", "Step 2 · Pharmacy", "Steroid nasal spray every day", "e.g. mometasone, fluticasone, budesonide. Aim slightly outwards, away from the middle.", "Improves blockage and shrinks polyps; works best used daily for weeks", "About $15–30", "Ongoing; reassess at 8–12 weeks", "Nosebleeds or dryness; aim away from the middle of the nose.", None),
   ("m", "Step 3 · GP", "Short course of prednisolone for nasal polyps", "Shrinks polyps and brings smell back for a while.", "Helps for weeks to months, not permanently", "Low cost", "1–3 weeks", "Repeated courses add up: bones, sugar, mood and sleep.", None),
   ("m", "Step 4 · GP", "Treat allergies, stop smoking, check for asthma", "Antihistamines help only if you have allergies. Asthma often comes with polyps.", "Better control of the nose often improves asthma too", "Varies", "Ongoing", "", None),
   ("l", "Step 5 · Specialist", "Sinus surgery (endoscopic)", "Opens the sinus drainage and removes polyps, so rinses and sprays reach inside.", "Most people improve; polyps can come back, so sprays continue", "Medicare rebate; private gap", "Day surgery, 1–2 weeks recovery", "Bleeding, rare eye or brain-lining injury.", None),
   ("l", "Step 6 · Specialist", "Biologic injections for severe polyps", "e.g. dupilumab, for severe polyps despite surgery and steroids.", "Large improvements in polyps, blockage and smell in trials", "Specialist-prescribed; PBS-subsidised for some", "Long term", "Eye irritation, injection-site reactions.", None)]) +
 skip([("Repeated antibiotic courses", "Chronic rhinosinusitis is mostly inflammation, not infection. Antibiotics help only flare-ups with signs of bacterial infection."),
   ("Decongestant sprays for more than 5 days", "Oxymetazoline and similar sprays cause rebound blockage (rhinitis medicamentosa)."),
   ("Antihistamines without allergies", "They don’t reduce sinus inflammation unless allergy is part of the problem.")]) +
 h2("Weird but true", ["Some people with polyps and asthma react to aspirin and anti-inflammatories with wheeze and a streaming nose. It’s called aspirin-exacerbated respiratory disease (Samter’s triad)."]),
 [("What is chronic rhinosinusitis?", "Inflammation of the nose and sinuses lasting 12 weeks or more, causing blockage, discharge, facial pressure or reduced smell, with or without nasal polyps."),
  ("Do antibiotics cure chronic sinusitis?", "Usually not. It’s mainly inflammation, so daily saltwater rinses and a steroid nasal spray are the mainstays. Antibiotics are kept for flare-ups with signs of bacterial infection."),
  ("When is sinus surgery needed?", "When symptoms persist despite at least 2–3 months of daily rinses and steroid spray, or with large polyps. Surgery opens the sinuses so treatment can reach inside.")],
 [("ASCIA: Allergic rhinitis and sinusitis", "https://www.allergy.org.au/", "Australasian allergy information. Free.")],
 [("EPOS 2020: European position paper on rhinosinusitis and nasal polyps", "https://www.rhinologyjournal.com/Rhinology_issues/manuscript_2502.pdf"), ("Cochrane: Saline irrigation for chronic rhinosinusitis (2016)", "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD011995.pub2/full")],
 [("Sinusitis", "/sinusitis/"), ("Hay Fever", "/hay-fever/"), ("Common Cold", "/common-cold/")],
 groups=["Ears and nose"], blurb="A blocked nose, discharge, facial pressure or lost smell for 12 weeks. Rinses and steroid spray first.",
 search="chronic sinusitis rhinosinusitis nasal polyps blocked nose loss of smell")

fact("influenza",
 "Flu (Influenza): Symptoms, Antivirals, Vaccine and Who’s at Risk",
 "Influenza explained: how flu differs from a cold, who needs to see a doctor early for antivirals, the yearly flu vaccine and who gets it free in Australia, and when to stay home.",
 "Flu (Influenza)", "Influenza",
 "Flu hits suddenly: fever, aches, exhaustion and a dry cough, often wiping you out for a week. Most people recover at home, but it can be dangerous for babies, older people, pregnant women and people with chronic illness. The yearly vaccine is the best protection.",
 h2("Symptoms", [
   "Sudden fever and chills, muscle aches, headache and exhaustion",
   "Dry cough and sore throat; children may have vomiting or diarrhoea",
   "Worst for 3–4 days; tiredness and cough can linger for 2 weeks or more"]) +
 '<p class="callout"><b>Call 000 or go to an emergency department</b> for trouble breathing, chest pain, confusion, a seizure, blue lips, not passing urine, or a baby who is floppy, not feeding or hard to wake. Getting better then suddenly worse again also needs urgent care.</p>' +
 h2("Who should see a doctor early (within 48 hours)", [
   "People 65 and over, pregnant women, babies and young children",
   "Aboriginal and Torres Strait Islander people",
   "Anyone with heart, lung, kidney or liver disease, diabetes, obesity or a weak immune system",
   "Residents of aged care"]) +
 ladder("What helps", "Testing (a combined flu and COVID rapid test or a nose swab PCR) helps decide on antivirals.", [
   ("s", "Step 1 · Self-care", "Rest, fluids, paracetamol or ibuprofen", "Treat fever and aches; stay home until 24 hours fever-free.", "Eases symptoms; most people recover in 1–2 weeks", "Low cost", "Days", "Don’t give aspirin to children.", "Flu isn’t a bad cold. If you could go to work, it probably isn’t flu."),
   ("m", "Step 2 · Prescription", "Oseltamivir (Tamiflu) antiviral", "Best started within 48 hours, mainly for people at higher risk or very unwell.", "Shortens symptoms by about a day on average; may lower complications in high-risk people", "$25 on the PBS for eligible people; otherwise private", "5 days", "Nausea; take with food.", None)]) +
 h2("The flu vaccine", [
   "A new vaccine each year, ideally from April so you’re protected for the winter peak.",
   "<b>Free under the National Immunisation Program</b> for children 6 months to under 5, people 65 and over, pregnant women (any stage), Aboriginal and Torres Strait Islander people from 6 months, and people with certain medical conditions. Some states fund it more widely.",
   "Protection varies year to year, roughly 40–60%, and it also makes illness milder.",
   "You can’t catch flu from the vaccine. A sore arm and feeling a bit flat for a day are common."]),
 [("How is the flu different from a cold?", "Flu starts suddenly with fever, aches and exhaustion, and often knocks you out for days. A cold comes on gradually, is mainly a runny nose and sore throat, and you can usually keep going."),
  ("Who gets a free flu vaccine in Australia?", "Children 6 months to under 5, people 65 and over, pregnant women, Aboriginal and Torres Strait Islander people from 6 months, and people with certain medical conditions. Some states fund it for more people."),
  ("Should I take Tamiflu?", "It’s mainly for people at higher risk or who are very unwell, started within 48 hours. On average it shortens symptoms by about a day.")],
 [("healthdirect 1800 022 222", "https://www.healthdirect.gov.au/flu", "24/7 nurse advice. Free.")],
 [("Australian Immunisation Handbook: Influenza", "https://immunisationhandbook.health.gov.au/contents/vaccine-preventable-diseases/influenza-flu"), ("Cochrane: Neuraminidase inhibitors for influenza (2014)", "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD008965.pub4/full")],
 [("Flu and COVID", "/flu-and-covid/"), ("COVID-19", "/covid/"), ("Common Cold", "/common-cold/"), ("Bird Flu (H5N1)", "/bird-flu/")],
 groups=["Lungs and breathing"], blurb="Sudden fever, aches and exhaustion. Who needs antivirals early, and the yearly vaccine.",
 search="flu influenza tamiflu oseltamivir flu vaccine fever aches")

fact("covid",
 "COVID-19: Symptoms, Testing, Antivirals and Boosters",
 "COVID-19 now: symptoms, rapid tests, who can get Paxlovid or other antivirals (start within 5 days), staying away from vulnerable people, booster timing and long COVID.",
 "COVID-19", "COVID-19",
 "COVID is now a familiar winter (and summer) virus, but it still hits older and immunocompromised people hard. If you’re at higher risk, test early: antivirals work best within 5 days of symptoms starting.",
 h2("Symptoms", [
   "Sore throat, runny nose, cough, fever, tiredness, headache and aches",
   "Loss of smell or taste is less common than early in the pandemic",
   "Most people recover within 1–2 weeks"]) +
 '<p class="callout"><b>Call 000</b> for trouble breathing, chest pain or pressure, confusion, blue lips, or fainting.</p>' +
 h2("Testing", [
   "Rapid antigen tests (RATs) work; a negative test early on may need repeating 24–48 hours later.",
   "Combined COVID and flu RATs are available from pharmacies.",
   "A PCR test may be needed to access antivirals or if you’re at high risk."]) +
 ladder("What helps", "Antivirals are for people at higher risk of severe illness. Ask early: they work best within 5 days.", [
   ("s", "Step 1 · Self-care", "Rest, fluids, paracetamol or ibuprofen", "Stay home while unwell.", "Most people recover in 1–2 weeks", "Low cost", "Days", "Worsening breathlessness or chest pain needs urgent care.", None),
   ("m", "Step 2 · Prescription", "Nirmatrelvir-ritonavir (Paxlovid) or molnupiravir", "Oral antivirals for eligible people: mainly older adults and those with risk factors or a weak immune system.", "Paxlovid cut hospital admission and death substantially in high-risk unvaccinated adults; benefit is smaller in vaccinated people", "$25 on the PBS for eligible people ($7.70 concession)", "5 days", "Paxlovid interacts with many medicines (some statins, heart and seizure medicines, some blood thinners). Tell your doctor everything you take.", "Don’t wait to see if it gets worse. Day 6 is too late for the pills.")]) +
 h2("Protecting others", [
   "Stay home while you have symptoms.",
   "For 7 days, avoid visiting aged care, hospitals and people at high risk; wear a mask in crowded indoor places.",
   "Open windows and good ventilation help."]) +
 h2("Vaccines", [
   "Boosters are recommended every 6 months for people 75 and over, and yearly for people 65–74; other adults can have a yearly dose.",
   "Severely immunocompromised people may need extra doses.",
   "Updated vaccines target recent variants. Check the latest ATAGI advice with your GP or pharmacist."]) +
 h2("After COVID", ["Symptoms lasting beyond 3 months may be long COVID. See your GP; there are treatments for many symptoms."]),
 [("Who can get COVID antivirals in Australia?", "Mainly older people and those with risk factors for severe illness or a weakened immune system. Eligibility rules change, so ask your GP or pharmacist early. Treatment should start within 5 days of symptoms."),
  ("How long should I stay home with COVID?", "Stay home while you have symptoms. For 7 days, avoid aged care, hospitals and high-risk people, and wear a mask in crowded indoor places."),
  ("How often should I get a COVID booster?", "Every 6 months for people 75 and over, and every 12 months for people 65–74. Younger adults can have a yearly dose, and some immunocompromised people need more.")],
 [("healthdirect 1800 022 222", "https://www.healthdirect.gov.au/covid-19", "24/7 nurse advice and the COVID symptom checker. Free.")],
 [("Australian Immunisation Handbook: COVID-19", "https://immunisationhandbook.health.gov.au/contents/vaccine-preventable-diseases/covid-19"), ("Hammond J et al. Oral nirmatrelvir for high-risk, nonhospitalized adults with COVID-19 (EPIC-HR, NEJM 2022)", "https://www.nejm.org/doi/full/10.1056/NEJMoa2118542")],
 [("Flu (Influenza)", "/influenza/"), ("Flu and COVID", "/flu-and-covid/"), ("Long COVID", "/long-covid/")],
 groups=["Lungs and breathing"], blurb="Symptoms, rapid tests, who can get antivirals within 5 days, and booster timing.",
 search="covid covid-19 coronavirus paxlovid rapid antigen test booster")
