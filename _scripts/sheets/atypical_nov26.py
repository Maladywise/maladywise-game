# Atypical presentations (25 Nov 2026). Run: python3 _scripts/gen_sheets.py _scripts/sheets/atypical_nov26.py
HF = ("Heart Foundation: 5 warning signs of a heart attack you may not know", "https://www.heartfoundation.org.au/blog/5-warning-signs-of-a-heart-attack-you-may-not-know")
HD = ("healthdirect: Differences in heart disease between women and men", "https://www.healthdirect.gov.au/differences-between-heart-disease-women-and-men")
CANTO = ("Canto JG et al. Myocardial infarction presenting without chest pain. JAMA 2000 (PubMed)", "https://doi.org/10.1001/jama.283.24.3223")
BAYER = ("Bayer AJ et al. Changing presentation of myocardial infarction with increasing old age. J Am Geriatr Soc 1986 (PubMed)", "https://doi.org/10.1111/j.1532-5415.1986.tb04221.x")
DUKE = ("Duke University: Women are less likely to get bystander CPR (JAHA, 2024)", "https://medschool.duke.edu/news/no-matter-where-they-live-women-are-less-likely-get-bystander-cpr")
BHC_STROKE = ("Better Health Channel: Women and stroke", "https://www.betterhealth.vic.gov.au/health/conditionsandtreatments/women-and-stroke")
SEPSIS = ("healthdirect: Sepsis", "https://www.healthdirect.gov.au/sepsis-septicaemia")
ACSQHC = ("Australian Commission on Safety and Quality in Health Care: Sepsis Clinical Care Standard", "https://www.safetyandquality.gov.au/clinical-care-standards/sepsis")
AIHW = ("AIHW: Heart, stroke and vascular disease, First Nations people", "https://www.aihw.gov.au/reports/heart-stroke-vascular-diseases/hsvd-facts/contents/first-nations-australians")
SPO2 = ("Sjoding MW et al. Racial bias in pulse oximetry measurement. NEJM 2020 (PubMed)", "https://doi.org/10.1056/NEJMc2029240")

fact("atypical-presentations", "Atypical Symptoms: Heart Attack, Stroke and Sepsis Without the Textbook Signs",
 "Heart attacks without chest pain, strokes that look like confusion, sepsis without a fever: how emergencies often look in women, older people, people with diabetes and First Nations people.",
 "Not textbook: emergencies that don’t look like the poster", "Atypical presentations of emergencies",
 "The ‘classic’ heart attack is a middle-aged man clutching his chest. Plenty of real ones look nothing like that. Women, older people, people with diabetes and others often have quieter or different symptoms, wait longer for help, and get treated later.",
 "<h2>Heart attack without chest pain</h2>\n<ul><li>In a US registry of over 430,000 heart attacks, <b>1 in 3 people had no chest pain</b> when they arrived at hospital.</li>"
 "<li>That group was older, more often female and more often had diabetes. They arrived later, were less often treated, and were more than twice as likely to die in hospital.</li>"
 "<li><b>Other signs:</b> breathlessness, sweating, nausea or vomiting, ‘indigestion’, unusual tiredness, dizziness or fainting, and pain in the jaw, neck, back, shoulder or arm.</li>"
 "<li><b>Women</b> are more likely than men to have these non-chest-pain symptoms.</li>"
 "<li><b>Diabetes</b> can blunt nerve signals from the heart, so pain may be mild or absent.</li>"
 "<li><b>Over 85</b>, ‘atypical’ becomes the rule: breathlessness, fainting, a fall, stroke-like symptoms or sudden confusion can be the only sign.</li></ul>\n"
 "<h2>Stroke</h2>\n<ul><li>Stroke kills more Australian women than men, and more women than breast cancer.</li>"
 "<li>FAST still applies to everyone: <b>F</b>ace drooping, <b>A</b>rm weakness, <b>S</b>peech trouble, <b>T</b>ime to call 000.</li>"
 "<li>Less obvious signs: sudden confusion, dizziness or loss of balance, double vision or vision loss, a sudden severe headache. These are easily blamed on migraine, an inner-ear problem or ‘being a bit off’.</li>"
 "<li>Young people have strokes too. Women have extra risks: pregnancy and the months after birth, pre-eclampsia, migraine with aura (especially with smoking or the combined pill).</li></ul>\n"
 "<h2>Cardiac arrest</h2>\n<ul><li>In a US study of over 300,000 cardiac arrests, women who collapsed in public were <b>less likely to get bystander CPR</b> and defibrillation than men.</li>"
 "<li>Hesitating to touch a woman’s chest costs lives. CPR goes through clothing, and a defibrillator pad can go under a bra or beside the breast.</li>"
 "<li>Gasping or ‘snoring’ breaths after a collapse are not normal breathing: start CPR.</li></ul>\n"
 "<h2>Sepsis</h2>\n<ul><li>Older people may have <b>no fever</b>, or a low temperature. New confusion, a fall, being off their food or just ‘not themselves’ can be the first sign.</li>"
 "<li>Babies often show vague signs: poor feeding, not settling, floppiness, few wet nappies.</li>"
 "<li>Higher risk: babies, older people, diabetes, cancer treatment, kidney disease, recent surgery, and Aboriginal and Torres Strait Islander people.</li>"
 "<li>Ask: <b>‘Could it be sepsis?’</b> Australia’s Sepsis Clinical Care Standard encourages patients and families to ask this out loud.</li></ul>\n"
 "<h2>Aboriginal and Torres Strait Islander people</h2>\n<ul><li>Heart disease and stroke come earlier and harder: hospital and death rates are about double those of other Australians, with high rates from middle age.</li>"
 "<li>The gap is generally wider for women.</li>"
 "<li>Rheumatic heart disease, almost gone elsewhere in Australia, still affects young people, especially young women.</li>"
 "<li>Heart Health Checks are recommended from age 30, not 45.</li></ul>\n"
 "<h2>Darker skin</h2>\n<ul><li>Blueness, paleness and some rashes are harder to see on darker skin. Check lips, gums, tongue, inner eyelids, palms and soles.</li>"
 "<li>Finger pulse oximeters can <b>overestimate</b> oxygen levels in people with darker skin, so a ‘normal’ reading can hide low oxygen.</li></ul>\n"
 "<h2>When to call 000</h2>\n<ul><li>Any sudden breathlessness, sweating, collapse, new confusion, face or arm weakness, or ‘something is very wrong’, even without chest pain or fever.</li>"
 "<li>Trust the person, or the family, who says ‘this isn’t normal for them’.</li></ul>\n",
 [("Can you have a heart attack without chest pain?", "Yes. About 1 in 3 people having a heart attack have no chest pain when they reach hospital. Breathlessness, sweating, nausea, tiredness or jaw, back or arm pain can be the main symptoms."),
  ("Are heart attack symptoms different in women?", "Chest pain is still the most common symptom, but women more often have other symptoms such as breathlessness, nausea, sweating, tiredness or pain in the jaw, neck or back."),
  ("Why are heart attacks ‘silent’ in diabetes?", "Long-term high blood sugar can damage the nerves that carry pain signals from the heart, so pain may be mild or missing."),
  ("Can older people have sepsis without a fever?", "Yes. Older people may have a normal or low temperature. New confusion, a fall or suddenly being unwell can be the first signs."),
  ("Are women less likely to get CPR?", "A large US study found women who collapsed in public were less likely than men to receive bystander CPR and defibrillation. CPR works the same for everyone.")],
 [("Heart Foundation: heart attack warning signs", HF[1], "Australian warning signs and action plan"),
  ("healthdirect: Sepsis", SEPSIS[1], "Symptoms in adults and children, and who is at risk")],
 [CANTO, BAYER, HF, HD, BHC_STROKE, DUKE, SEPSIS, ACSQHC, AIHW, SPO2],
 [("Heart attack quiz", "/heart-attack-quiz/"), ("Stroke quiz", "/stroke-quiz/"), ("First aid quiz", "/first-aid-quiz/"), ("Atypical presentations quiz", "/atypical-presentations-quiz/")],
 groups=["Heart and blood vessels"], blurb="Heart attacks without chest pain, sepsis without fever: how emergencies hide in women, older people and others.",
 search="atypical presentation heart attack women no chest pain silent MI diabetes elderly sepsis no fever stroke women CPR women bystander First Nations")
