/* Fridaemia: the Friday 5pm results inbox. Open all day Friday, the player's local time.
   Eight results land at knock-off time. For each: ED now, call today, or Monday is fine. Same eight for everyone that week; no repeats until the whole bank is used. */
(function () {
  var G = window.MG, $ = G.$;
  var ED = "ed", CALL = "call", MON = "mon";
  var LABEL = { ed: "🚑 ED now", call: "📞 Call today", mon: "📅 Monday is fine" };
  // [result, patient context, right answer, why]. Teaching scenarios only: real decisions depend on the whole patient and local guidelines.
  var POOL = [
    ["High-sensitivity troponin 450 ng/L (normal under about 15).", "52-year-old man. Chest tightness this morning, now at home feeling ‘a bit off’.", ED, "A troponin that high after chest pain is a heart attack until proven otherwise. He needs an ECG and cardiology tonight, not a phone call."],
    ["Potassium 6.8 mmol/L. Sample not haemolysed.", "71-year-old with kidney disease, recently started spironolactone.", ED, "Potassium of 6.5 or more can stop the heart without warning. Send to ED for an ECG, monitoring and treatment. Stop the spironolactone."],
    ["INR 9.2.", "80-year-old on warfarin for AF. No bleeding, feels well.", CALL, "Very high INR without bleeding: withhold warfarin, give vitamin K (2.5 to 5 mg orally, or 1 mg IV) and recheck the INR the next day. Call tonight. ED only if bleeding or a fall."],
    ["Sodium 118 mmol/L.", "68-year-old on a thiazide. Family say she’s been muddled since yesterday.", ED, "Severe low sodium with confusion risks seizures. She needs ED for careful, monitored correction (too fast can cause brain damage)."],
    ["Sodium 131 mmol/L (was 134 last year).", "60-year-old on a thiazide. Feels completely well.", MON, "Mild, stable and symptom-free. Review the diuretic and recheck next week. Not a weekend problem."],
    ["Blood culture: gram-positive cocci in clusters.", "45-year-old you saw yesterday with fever. Sent home on oral antibiotics.", ED, "Clusters usually means Staphylococcus aureus. Staph in the blood always needs admission, IV antibiotics and a search for the source. Recall to ED tonight."],
    ["Corrected calcium 3.6 mmol/L.", "74-year-old with weight loss, thirst and constipation.", ED, "Calcium this high is dangerous (heart rhythm, kidneys, confusion) and often means cancer. ED for IV fluids and workup."],
    ["Neutrophils 0.3 × 10⁹/L.", "55-year-old on chemotherapy. Phoned in with a temperature of 38.4.", ED, "Fever plus neutropenia is febrile neutropenia: antibiotics within the hour. Straight to ED, don’t wait for a GP appointment."],
    ["Neutrophils 0.4 × 10⁹/L.", "34-year-old on clozapine. No fever, feels well.", CALL, "Clozapine plus low neutrophils needs action today: follow the clozapine monitoring protocol (usually stop it) and contact the treating team. Tell her to go to ED if any fever."],
    ["Glucose 28 mmol/L, blood ketones 3.8 mmol/L.", "19-year-old with type 1 diabetes. Vomiting since lunch.", ED, "High ketones, high sugar and vomiting is diabetic ketoacidosis. Needs IV fluids and insulin in hospital now."],
    ["HbA1c 8.1% (was 7.6%).", "58-year-old with type 2 diabetes. No symptoms.", MON, "Worth a medication review, but nothing changes over a weekend. Book a routine appointment."],
    ["Vitamin D 38 nmol/L.", "40-year-old office worker. Mild tiredness.", MON, "Low-ish vitamin D is common and never an emergency. Discuss at the next routine visit."],
    ["Ferritin 4 µg/L, haemoglobin 118 g/L.", "28-year-old with heavy periods. Bit tired, otherwise well.", MON, "Iron deficiency: important, but not urgent. Start iron and investigate the cause next week."],
    ["Lithium level 2.1 mmol/L (target 0.6–1.0).", "50-year-old on lithium. New tremor, diarrhoea and unsteadiness.", ED, "Lithium toxicity with symptoms can cause seizures and kidney damage. ED tonight: stop lithium, fluids, sometimes dialysis."],
    ["Platelets 8 × 10⁹/L.", "22-year-old with new bruises and tiny red spots on her legs.", ED, "Platelets under 10 with bleeding signs risk serious bleeding, including into the brain. ED tonight."],
    ["ALT 1,450 U/L.", "17-year-old who took ‘a handful’ of paracetamol yesterday after an argument.", ED, "Liver injury after paracetamol overdose. Acetylcysteine (the antidote) and assessment, including mental health, in ED now."],
    ["Urine culture: E. coli, sensitive to the antibiotic already prescribed.", "35-year-old with cystitis. Feeling better on day 2.", MON, "Right bug, right drug, getting better. Nothing to do. The best kind of result."],
    ["CK 15,000 U/L.", "26-year-old after his first marathon. Dark brown urine, aching legs.", ED, "Rhabdomyolysis with dark urine risks kidney failure. ED for IV fluids and kidney monitoring."],
    ["Positive pregnancy test (serum hCG).", "24-year-old who started isotretinoin for acne 2 months ago.", CALL, "Isotretinoin causes severe birth defects. Call today: stop it now and arrange urgent review. Not an ED problem. Pregnancy tests are required before and during isotretinoin for this reason."],
    ["Chest X-ray: new 2.5 cm mass in the right upper lobe.", "66-year-old smoker. Cough for 6 weeks, otherwise well.", CALL, "Not an emergency tonight, but don’t let it sit over the weekend. Call to explain, arrange CT and an urgent lung cancer referral."],
    ["Magnesium 0.38 mmol/L.", "62-year-old on a proton pump inhibitor. Palpitations and muscle cramps.", ED, "Very low magnesium with palpitations can trigger dangerous heart rhythms. ED for an ECG and IV magnesium."],
    ["Haemoglobin 128 g/L (range 115–165).", "45-year-old having routine bloods.", MON, "Normal. File it and go home."],
    ["Syphilis serology positive (new).", "29-year-old, 16 weeks pregnant. Routine antenatal bloods.", CALL, "Syphilis in pregnancy can infect the baby. Call today and arrange treatment within days with the antenatal and sexual health teams."],
    ["TSH 0.01 mU/L, free T4 mildly raised.", "38-year-old with mild palpitations, otherwise well.", CALL, "Overactive thyroid. Call to explain and start symptom control (often a beta blocker) and referral. ED only if very unwell, fast AF or a fever."],
    ["Creatinine 290 µmol/L (was 95 three months ago).", "75-year-old on an ACE inhibitor, diuretic and ibuprofen. Vomiting for 2 days.", ED, "Acute kidney injury: the ‘triple whammy’ plus dehydration. ED for fluids and monitoring. Stop all three medicines."],
    ["PSA 5.2 ng/mL.", "61-year-old, no urinary symptoms.", MON, "Raised but not urgent. Repeat and consider referral or MRI through normal channels next week."]
,
    ["Potassium 2.6 mmol/L.", "70-year-old on a thiazide and laxatives. Weak legs, palpitations.", ED, "Severe low potassium with symptoms can cause dangerous rhythms. ED for an ECG and IV replacement."],
    ["Potassium 3.2 mmol/L.", "55-year-old on a thiazide. Feels well.", MON, "Mild low potassium. Oral supplements or a dose review next week."],
    ["Potassium 5.6 mmol/L. Sample haemolysed.", "40-year-old, routine bloods, well.", MON, "Haemolysis falsely raises potassium. Repeat the test next week, collected carefully."],
    ["Sodium 126 mmol/L (was 135 a month ago).", "78-year-old started on sertraline 3 weeks ago. Mildly unsteady.", CALL, "SSRIs can cause SIADH in older people. Call today: stop or review the SSRI, fluid restrict, recheck in a day or two. ED if confused or vomiting."],
    ["Glucose 2.4 mmol/L on a lab sample taken this morning.", "Well 50-year-old, no diabetes. Sample sat in the courier van all day.", MON, "Delayed processing lets cells eat the glucose (pseudohypoglycaemia). Repeat with a proper sample."],
    ["Glucose 31 mmol/L, ketones 0.4 mmol/L.", "68-year-old with type 2 diabetes, thirsty, weeing a lot, drinking well.", CALL, "Very high sugar without ketones. Call today: fluids, medicine review, repeat tomorrow. ED if drowsy, vomiting or ketones rise (risk of HHS)."],
    ["HbA1c 6.6% (no previous result).", "52-year-old, no symptoms.", MON, "Diabetes range on one HbA1c. Confirm and start the conversation next week."],
    ["TSH 85 mU/L, free T4 very low.", "62-year-old, very slow, cold, puffy, now drowsy and confused.", ED, "Possible myxoedema coma: a medical emergency needing IV thyroid hormone and support."],
    ["TSH 7.2 mU/L, free T4 normal.", "35-year-old, tired, otherwise well.", MON, "Subclinical hypothyroidism. Repeat in 6 to 12 weeks with antibodies before treating."],
    ["Free T4 high, TSH suppressed.", "30-year-old, 6 weeks postpartum, palpitations, mild.", CALL, "Postpartum thyroiditis or Graves’. Call today for a beta blocker if symptomatic and arrange follow-up."],
    ["Haemoglobin 62 g/L (was 128 two months ago).", "70-year-old, black stools this week, dizzy.", ED, "A big drop with melaena means a GI bleed. ED for transfusion and scope."],
    ["Haemoglobin 98 g/L, MCV 72, ferritin 6.", "45-year-old man, no symptoms.", CALL, "Iron deficiency in a man means a GI bleed or cancer until proven otherwise. Call to arrange urgent scopes."],
    ["Haemoglobin 105 g/L, B12 90 pmol/L (low).", "58-year-old on metformin. Tingling feet.", CALL, "B12 deficiency with nerve symptoms. Call to start injections soon; nerve damage can become permanent."],
    ["White cell count 85 × 10⁹/L, blasts present.", "24-year-old with bruising and fever.", ED, "Possible acute leukaemia. Same-day haematology via ED."],
    ["Lymphocytes 6.2 × 10⁹/L, stable for 3 years.", "72-year-old, no symptoms.", MON, "Likely chronic lymphocytic leukaemia, slowly progressive. Routine haematology referral."],
    ["Platelets 950 × 10⁹/L.", "65-year-old, burning red fingers, no infection.", CALL, "Possible essential thrombocythaemia. Call: aspirin may be advised and urgent haematology referral."],
    ["Platelets 120 × 10⁹/L.", "Pregnant at 34 weeks, BP 130/80, well.", MON, "Mild gestational thrombocytopenia is common. Check the trend and BP at the next visit (sooner if BP rises or headache)."],
    ["Neutrophils 1.1 × 10⁹/L.", "Well 30-year-old of African heritage, previous results the same.", MON, "Benign ethnic neutropenia (Duffy-null). Nothing to do."],
    ["INR 1.4.", "On warfarin for a mechanical mitral valve, target 2.5 to 3.5.", CALL, "Subtherapeutic on a mechanical valve risks valve clots. Call today: dose increase and bridging per specialist advice."],
    ["INR 4.1, no bleeding.", "On warfarin for AF.", CALL, "Skip a dose or two, recheck in a few days. Call to adjust; vitamin K not usually needed at this level."],
    ["D-dimer 2.8 mg/L.", "40-year-old, sent home from a GP appointment with a sore calf.", CALL, "Raised D-dimer with a possible DVT needs a same-day or next-day ultrasound. Call today; anticoagulate if delay and high risk."],
    ["eGFR 22 (was 65 a month ago).", "80-year-old started on an NSAID for knee pain.", ED, "Acute kidney injury. ED or same-day review: stop the NSAID, check potassium, fluids."],
    ["eGFR 52, stable for 2 years.", "70-year-old with hypertension.", MON, "Stable CKD stage 3a. Routine monitoring, BP and ACR."],
    ["Urine ACR 45 mg/mmol.", "48-year-old with type 2 diabetes.", MON, "Significant albuminuria: SGLT2 inhibitor and ACE inhibitor discussion. Routine visit."],
    ["Urea 22, creatinine 160, normal last year.", "88-year-old, poor oral intake for a week, hot weather.", CALL, "Pre-renal kidney injury from dehydration. Call: fluids, hold diuretics and ACE inhibitors, recheck in 48 hours."],
    ["ALT 340, ALP normal.", "28-year-old, tired, dark urine, recent travel to India.", CALL, "Acute hepatitis (hepatitis A or E). Call today, check INR and hepatitis serology; ED if confused or INR rising."],
    ["ALT 62, GGT 110.", "50-year-old who drinks 4 beers a night.", MON, "Alcohol-related liver changes. Routine visit to talk about alcohol and check fibrosis."],
    ["Bilirubin 48, ALT normal, ALP normal.", "22-year-old, well, after fasting.", MON, "Likely Gilbert syndrome. Harmless."],
    ["Lipase 1,200 U/L.", "45-year-old, severe upper tummy pain to the back, vomiting.", ED, "Acute pancreatitis. ED for fluids and pain relief."],
    ["Calcium 2.85, PTH high.", "60-year-old, mild aches, no confusion.", MON, "Primary hyperparathyroidism, mild. Routine endocrine referral; check bones and kidneys."],
    ["Calcium 1.75 (corrected), tingling fingers and cramps.", "3 days after thyroid surgery.", ED, "Post-surgical hypoparathyroidism. ED for IV calcium if symptomatic."],
    ["Magnesium 0.62 mmol/L.", "50-year-old on a PPI, well.", MON, "Mildly low. Consider stopping the PPI or oral magnesium. Routine."],
    ["CK 1,800 U/L.", "55-year-old on a statin, mild muscle aches.", CALL, "Call today: stop the statin, check kidney function, recheck CK in a week."],
    ["CRP 190, white cells 18.", "75-year-old, fever, confused, sample from home visit.", ED, "Probable serious infection in an older person with confusion. ED."],
    ["CRP 12.", "35-year-old after a cold, well.", MON, "Mildly raised after a viral illness. Nothing to do."],
    ["ESR 95, CRP 60.", "74-year-old, new headache and jaw pain chewing.", ED, "Possible giant cell arteritis: start high-dose prednisolone today and same-day review to protect vision."],
    ["Troponin 18 ng/L (normal under 15), repeat 19.", "80-year-old with CKD, no chest pain, routine bloods.", MON, "Stable, mildly raised troponin in CKD is common. Not an acute MI pattern."],
    ["Troponin 2,400 ng/L.", "60-year-old who had chest pain 3 days ago, now pain-free.", ED, "A missed or late heart attack still needs cardiology assessment today."],
    ["BNP 1,800 pg/mL.", "78-year-old, ankles swelling, breathless walking to the letterbox, no breathlessness at rest.", CALL, "Likely heart failure. Call today to start a diuretic and arrange an echo; ED if breathless at rest."],
    ["Blood culture: gram-negative rods.", "68-year-old treated yesterday for UTI, now shaky and feverish.", ED, "Bacteraemia. ED for IV antibiotics."],
    ["Blood culture: coagulase-negative staph in 1 of 2 bottles.", "Well 45-year-old, no lines or implants.", MON, "Usually a skin contaminant. Repeat cultures only if clinically unwell."],
    ["Urine culture: no growth.", "30-year-old with burning on urination, treated with antibiotics 2 days ago, now better.", MON, "Fine. Stop antibiotics if the course is complete."],
    ["Urine culture: E. coli resistant to the prescribed antibiotic.", "Pregnant at 20 weeks, still has symptoms.", CALL, "UTI in pregnancy must be treated: call today to switch antibiotics. Fever or back pain means ED."],
    ["Throat swab: group A strep.", "8-year-old, sore throat, now fine on no antibiotics.", CALL, "Call to start penicillin to prevent rheumatic fever, especially in high-risk groups."],
    ["Chlamydia PCR positive.", "21-year-old, no symptoms.", CALL, "Call to treat (doxycycline 100 mg twice daily for 7 days) and arrange partner notification. Not urgent tonight."],
    ["Gonorrhoea PCR positive, culture pending.", "25-year-old with discharge.", CALL, "Call to arrange ceftriaxone injection plus azithromycin and partner notification."],
    ["HIV antibody/antigen positive (new).", "32-year-old, routine screen.", CALL, "Call to explain in person soon, confirm, and link to specialist care quickly. Don’t leave this over a weekend without contact."],
    ["Hepatitis B surface antigen positive.", "Pregnant at 12 weeks.", CALL, "Call to arrange viral load and specialist care; the baby needs vaccine and immunoglobulin at birth."],
    ["Pertussis PCR positive.", "Unvaccinated 6-week-old baby, coughing fits, pauses in breathing.", ED, "Whooping cough in a young infant can cause apnoea and death. ED now."],
    ["COVID-19 PCR positive.", "78-year-old, mild symptoms day 2, on several medicines.", CALL, "Call today: antivirals (check interactions) can reduce severe outcomes in high-risk people."],
    ["Influenza A positive.", "29-year-old, healthy, day 4, improving.", MON, "No antivirals needed for healthy adults after 48 hours. Nothing to do."],
    ["Stool: Campylobacter.", "35-year-old, diarrhoea now settled.", MON, "Usually self-limiting. Antibiotics only if severe or immunocompromised."],
    ["Stool: Shiga toxin-producing E. coli.", "5-year-old, bloody diarrhoea, passing less urine.", ED, "Risk of haemolytic uraemic syndrome. ED for bloods and kidney monitoring. Avoid antibiotics and antidiarrhoeals."],
    ["Faecal occult blood (bowel screening kit) positive.", "62-year-old, no symptoms.", CALL, "Call to explain and arrange a colonoscopy within 30 days. Not an emergency."],
    ["Pap/cervical screen: HPV 16 positive, high-grade changes.", "34-year-old.", CALL, "Call to explain and refer for colposcopy. Not an ED problem."],
    ["Mammogram: suspicious 2 cm mass.", "55-year-old.", CALL, "Call to explain and arrange urgent breast assessment. Don’t leave a cancer suspicion unexplained over the weekend."],
    ["CT abdomen: 5.8 cm abdominal aortic aneurysm, not leaking.", "72-year-old, no pain.", CALL, "Call to arrange vascular surgery review soon. ED immediately if new pain, collapse or back pain."],
    ["Chest X-ray: small left pleural effusion.", "78-year-old with known heart failure, comfortable.", MON, "Likely heart failure related. Review diuretic at the next visit."],
    ["Chest X-ray: right-sided pneumothorax, 3 cm.", "Tall 22-year-old with chest pain yesterday.", ED, "A sizeable pneumothorax needs ED assessment for aspiration or a drain."],
    ["CT head: chronic subdural haematoma.", "84-year-old on apixaban, increasingly confused.", ED, "Needs neurosurgical assessment and anticoagulation reversal. ED now."],
    ["Ultrasound: 7 mm gallstones, no inflammation.", "45-year-old with occasional pain after fatty meals.", MON, "Symptomatic gallstones: routine surgical referral."],
    ["Ultrasound: thickened gallbladder wall, pericholecystic fluid.", "50-year-old, fever and right upper pain since yesterday.", ED, "Acute cholecystitis. ED for antibiotics and surgical review."],
    ["Pelvic ultrasound: no intrauterine pregnancy, hCG 2,100.", "26-year-old, 6 weeks since last period, mild pain.", ED, "Possible ectopic pregnancy. ED for urgent gynaecology review."],
    ["Bone density T-score −3.1.", "68-year-old woman, no fractures.", MON, "Osteoporosis: start treatment at a routine visit."],
    ["ECG (from a pharmacy check): new AF, rate 92.", "70-year-old, no symptoms.", CALL, "New AF: call today to start stroke-risk assessment and anticoagulation discussion."],
    ["ECG: QTc 560 ms.", "35-year-old on methadone and a new antibiotic, palpitations.", ED, "Very long QT risks torsades. ED for monitoring; stop QT-prolonging drugs."],
    ["Holter: 3 runs of non-sustained VT.", "55-year-old with previous heart attack, dizzy spells.", CALL, "Call today and arrange urgent cardiology. ED if fainting or ongoing palpitations."],
    ["Lithium 0.4 mmol/L (target 0.6 to 1.0).", "Stable patient.", MON, "Low level: check adherence, adjust at the next visit."],
    ["Digoxin 3.4 nmol/L.", "82-year-old, nausea, seeing yellow, pulse 44.", ED, "Digoxin toxicity with symptoms. ED; digoxin antibodies may be needed."],
    ["Vancomycin trough 32 mg/L.", "Home IV antibiotics patient, creatinine rising.", CALL, "Call today: hold the next dose, check kidney function, adjust with the hospital team."],
    ["Paracetamol level 160 mg/L at 6 hours.", "17-year-old with overdose, at home, tummy upset.", ED, "Above the treatment line. ED for acetylcysteine now."],
    ["Ferritin 1,400, transferrin saturation 78%.", "45-year-old man, tired, aching joints.", CALL, "Likely haemochromatosis. Call to arrange HFE gene test and venesection referral. Not urgent tonight."],
    ["Prolactin 2,800 mU/L.", "28-year-old, no periods, headaches, vision problems.", CALL, "Possible pituitary tumour pressing on the optic nerves. Call to arrange urgent MRI and visual fields; ED if vision is worsening quickly."],
    ["Cortisol 9am: 40 nmol/L.", "50-year-old, tired, dizzy, salt craving, darker skin.", ED, "Very low morning cortisol with symptoms suggests adrenal insufficiency. ED: hydrocortisone, risk of crisis."],
    ["Testosterone 6 nmol/L.", "45-year-old man, low libido, sample taken at 4pm.", MON, "Repeat as a fasting morning sample before acting."],
    ["PSA 48 ng/mL.", "76-year-old with new back pain.", CALL, "Possible metastatic prostate cancer. Call today: urgent urology and imaging. ED if leg weakness or bladder problems (cord compression)."],
    ["CA-125 410 U/mL.", "62-year-old with bloating and early fullness.", CALL, "Possible ovarian cancer. Call to arrange urgent imaging and gynaecology oncology referral."],
    ["Coeliac serology (tTG IgA) strongly positive.", "25-year-old with bloating.", MON, "Refer for gastroscopy; keep eating gluten until then."],
    ["Pregnancy test (serum hCG) positive.", "38-year-old on methotrexate for psoriasis.", CALL, "Methotrexate is teratogenic. Call today: stop it, start folic acid 5 mg, arrange urgent review."],
    ["Vitamin D 18 nmol/L.", "Housebound 85-year-old, frequent falls.", MON, "Severe deficiency. Start replacement next week; falls risk review."],
    ["Lead level 2.1 µmol/L.", "2-year-old who chews old window sills.", CALL, "Very high lead in a child. Call today to remove exposure and refer urgently."],
    ["Ammonia high.", "Known cirrhosis, more confused today, sleepy.", ED, "Hepatic encephalopathy. ED: lactulose, look for triggers (infection, bleeding)."],
    ["Urine drug screen positive for benzodiazepines.", "Patient who was given diazepam in ED last week.", MON, "Explained. Nothing to do."],
    ["Fasting glucose 6.4 mmol/L.", "40-year-old, overweight, well.", MON, "Impaired fasting glucose (prediabetes). Lifestyle conversation at a routine visit."],
    ["Cholesterol: LDL 6.8 mmol/L.", "30-year-old, father had a heart attack at 45.", MON, "Likely familial hypercholesterolaemia. Routine visit to start a statin and family testing."],
    ["Hb 168 g/L, haematocrit 0.52.", "55-year-old smoker, headaches.", CALL, "High red cell mass. Call to arrange JAK2 testing and review; ED if neurological symptoms."],
    ["Sodium 152 mmol/L.", "90-year-old in a nursing home, drowsy, not drinking.", ED, "Severe high sodium from dehydration with drowsiness. ED for careful fluids."],
    ["Bicarbonate 12, anion gap 24.", "19-year-old with type 1 diabetes, vomiting, sample from this morning.", ED, "Likely DKA. ED now: insulin and fluids."],
    ["Urine: protein 3+, blood 2+.", "8-year-old, puffy face, cola-coloured urine, BP 140/95.", ED, "Nephritic syndrome with high BP in a child. ED today."],
    ["Swab from a leg ulcer: MRSA.", "Well 70-year-old, ulcer healing, no spreading redness.", MON, "Colonisation, not infection. No antibiotics needed if healing."],
    ["Sputum: Mycobacterium tuberculosis on PCR.", "35-year-old with cough for 2 months, lives with young children.", CALL, "Call today: TB service, start treatment, contact tracing (especially the children). Not usually an ED problem."],
    ["Carboxyhaemoglobin 18%.", "34-year-old with headaches. Her partner and kids have them too. Gas heater on all week.", ED, "Carbon monoxide poisoning. ED for high-flow oxygen, and get the whole household out and checked tonight. Turn the heater off."],
    ["Blood film: fragmented red cells (schistocytes), platelets 22 × 10⁹/L.", "31-year-old, bruising, new confusion this afternoon.", ED, "Suspect TTP: a blood emergency treated with urgent plasma exchange. ED now. Don’t give platelets."],
    ["Blood culture: gram-negative diplococci.", "19-year-old seen this morning with fever and aches, sent home.", ED, "Likely meningococcus. Recall to ED immediately for IV antibiotics; close contacts need clearance antibiotics."],
    ["Malaria film: Plasmodium falciparum, 3% of red cells.", "26-year-old, back from Papua New Guinea 10 days ago, fevers.", ED, "Falciparum can turn severe within hours. ED now for IV artesunate assessment."],
    ["Ultrasound: no blood flow to the left testis.", "15-year-old, sudden testicular pain this afternoon.", ED, "Torsion. Surgery within about 6 hours saves the testis. ED now, nil by mouth."],
    ["CT KUB: 6 mm stone blocking the right ureter, swollen kidney.", "48-year-old, now shivering with a fever of 38.9 °C.", ED, "An infected, blocked kidney needs urgent drainage plus IV antibiotics. ED now."],
    ["ECG: type 1 Brugada pattern.", "29-year-old who fainted while resting yesterday. Brother died suddenly at 32.", ED, "Brugada with unexplained fainting and family sudden death risks fatal arrhythmia. ED and cardiology tonight. Treat any fever promptly."],
    ["Staging CT: large pulmonary embolism at the split of the pulmonary arteries.", "66-year-old having cancer staging, ‘a bit puffed’.", ED, "An incidental large PE still needs urgent anticoagulation and assessment of heart strain. ED now."],
    ["MRI spine: metastasis pressing on the spinal cord at T8.", "72-year-old with prostate cancer, legs weaker this week.", ED, "Spinal cord compression. Dexamethasone and urgent oncology or surgery decide whether he walks again. ED now."],
    ["Haemoglobin 58 g/L (was 131 last month).", "70-year-old on aspirin and ibuprofen, black stools for 3 days.", ED, "Upper GI bleed until proven otherwise. ED for transfusion and endoscopy. Stop the ibuprofen."],
    ["INR 3.0 (in range).", "82-year-old on warfarin who fell this morning, hit her head, now has a headache.", ED, "A head strike on an anticoagulant needs a CT head, even with an in-range INR. ED now."],
    ["Glucose 42 mmol/L, sodium 151, osmolality 345.", "79-year-old with type 2 diabetes, drowsy and not drinking.", ED, "Hyperosmolar hyperglycaemic state. ED for slow IV fluids and monitoring. It can be deadlier than DKA."],
    ["Blood culture: Listeria monocytogenes.", "29-year-old, 30 weeks pregnant, fever 2 days ago.", ED, "Listeria in pregnancy can harm the baby. ED for IV amoxicillin and fetal monitoring."],
    ["Chest X-ray: free air under the diaphragm.", "68-year-old with sudden severe tummy pain this morning.", ED, "A perforated bowel or ulcer. ED now, nil by mouth, surgical review."],
    ["Home ECG monitor: complete heart block, rate 34.", "84-year-old, dizzy and tired for a week.", ED, "Third-degree block with symptoms needs monitoring and usually a pacemaker. ED now."],
    ["Full blood count: haemoglobin 82, platelets 40, neutrophils 0.9.", "67-year-old, tired and bruising, no fever.", CALL, "All three cell lines are low. Call today for urgent haematology review this week. ED tonight if fever or bleeding."],
    ["Ultrasound: DVT in the left femoral vein.", "52-year-old, swollen calf after a long drive, not breathless.", CALL, "Call today and start a blood thinner (e.g. apixaban) tonight. ED if chest pain or breathlessness."],
    ["Serum hCG 48, then 52 two days later.", "28-year-old, 6 weeks since last period, no pain or bleeding.", CALL, "A flat hCG with no pregnancy seen means an ectopic is possible. Call today, refer to the early pregnancy unit, and ED if pain, bleeding or fainting."],
    ["Measles IgM positive.", "22-year-old with a rash, back from Bali, works in childcare.", CALL, "Call today and notify public health. Isolate until 4 days after the rash; contacts may need vaccine or immunoglobulin."],
    ["Skin biopsy: melanoma, 1.2 mm thick.", "58-year-old, mole removed last week.", CALL, "Call to explain and arrange wider excision and specialist review. Urgent, but not an emergency."],
    ["Ultrasound: new 3 cm liver lesion.", "64-year-old, bowel cancer treated 2 years ago.", CALL, "Possible metastasis. Call today, arrange CT and oncology review."],
    ["Hepatitis A IgM positive.", "31-year-old cook with jaundice, feels okay.", CALL, "Call today: public health notification, exclusion from food handling, vaccine for close contacts within 2 weeks."],
    ["INR 1.2.", "61-year-old on warfarin for a mechanical mitral valve.", CALL, "A low INR with a mechanical mitral valve risks clotting on the valve. Call today: start enoxaparin bridging and adjust warfarin."],
    ["Phenytoin level 110 µmol/L (target 40–80).", "45-year-old, slightly unsteady, no falls, no vomiting.", CALL, "Toxic level. Call today to withhold doses and recheck. ED if confused, falling or vomiting."],
    ["Echo: severe aortic stenosis (valve area 0.8 cm²).", "77-year-old breathless walking uphill, no fainting.", CALL, "Symptomatic severe AS needs prompt cardiology review for valve replacement. Call to arrange; avoid heavy exertion. ED if fainting or chest pain."],
    ["Strongyloides serology positive.", "50-year-old born in Vietnam, starting high-dose prednisolone on Monday.", CALL, "Steroids can trigger fatal hyperinfection. Call today: treat with ivermectin before the steroids start."],
    ["Potassium 5.9 mmol/L, not haemolysed.", "66-year-old on an ACE inhibitor, well, normal ECG.", CALL, "Call today: stop potassium-raising medicines and supplements, cut back high-potassium foods, repeat in 1–2 days."],
    ["Hepatitis C RNA positive (new).", "38-year-old, well, normal liver tests.", MON, "Curable with 8–12 weeks of tablets. Call next week to discuss treatment and testing contacts."],
    ["Faecal calprotectin 1,200 µg/g.", "24-year-old with loose stools for 6 weeks, no blood, eating well.", MON, "Suggests bowel inflammation such as Crohn’s. Refer to gastroenterology next week. Sooner if bleeding, weight loss or night symptoms."],
    ["Skin biopsy: basal cell carcinoma.", "70-year-old, small spot on the back.", MON, "Slow-growing. Plan excision in the coming weeks."],
    ["Thyroid ultrasound: 1.8 cm nodule, TI-RADS 5.", "44-year-old, normal thyroid tests.", MON, "Needs a fine needle biopsy, arranged next week. Not an emergency."],
    ["Trichomonas PCR positive.", "27-year-old with discharge.", MON, "Treat with metronidazole, plus partner treatment. Monday is fine."],
    ["Haemoglobin 92 g/L, ferritin 9.", "29-year-old, 28 weeks pregnant, tired.", MON, "Iron deficiency in pregnancy. Start iron or arrange an infusion next week."],
    ["Urine culture: E. coli.", "74-year-old with a long-term catheter, no fever or new symptoms.", MON, "Catheters are almost always colonised. No antibiotics without symptoms."],
    ["Lipoprotein(a) 250 nmol/L.", "45-year-old with a family history of early heart attacks.", MON, "A lifelong inherited risk. Tighten other risk factors (LDL, blood pressure, smoking) at the next visit."],
    ["Uric acid 0.52 mmol/L.", "50-year-old, no gout ever.", MON, "High urate without gout or kidney stones usually doesn’t need medicine."],
    ["ANA positive 1:160, speckled.", "36-year-old, well, tested for tiredness.", MON, "A low-titre positive ANA is common in healthy people. Only follow up if symptoms of autoimmune disease."],
    ["Vitamin B12 180 pmol/L (borderline), active B12 normal.", "55-year-old, no nerve symptoms.", MON, "Normal active B12 makes true deficiency unlikely. Recheck in a few months."],
    ["Chest X-ray: old healed rib fractures.", "60-year-old, no history of injury mentioned.", MON, "Worth asking about falls, alcohol and bone health at the next visit, and screening for safety at home."],
    ["MRI knee: degenerative tear of the medial meniscus.", "58-year-old with knee aches, no locking.", MON, "Common with age. Physio and exercise work as well as keyhole surgery."],
    ["CT chest: 4 mm lung nodule.", "45-year-old non-smoker.", MON, "Tiny nodules in low-risk people usually need no follow-up scan."],
    ["Ultrasound: simple 3 cm kidney cyst.", "62-year-old, scanned for back pain.", MON, "Simple cysts are harmless and need no follow-up."],
    ["Ultrasound: fatty liver.", "48-year-old, ALT mildly raised.", MON, "Check a fibrosis score (FIB-4), weight, diabetes and alcohol at the next visit."]
  ];
  function now() {
    var q = new URLSearchParams(location.search).get("t"); // testing: ?t=open
    return q === "open" ? (function () { var d = new Date(); while (d.getDay() !== 5) d.setDate(d.getDate() - 1); d.setHours(17, 0, 0, 0); return d; })() : new Date();
  }
  function isOpen(d) { return d.getDay() === 5 && (d >= new Date(2026, 11, 11) || /t=open/.test(location.search)); } // launches Fri 11 Dec 2026
  function nextOpen(d) { var n = new Date(d); n.setSeconds(0, 0); for (var i = 0; i < 21; i++) { var c = new Date(n); c.setDate(n.getDate() + i); c.setHours(0, 0, 0, 0); if (c.getDay() === 5 && c > d && c >= new Date(2026, 11, 11)) return c; } return null; }
  var T = now(), WK = G.week(T), r = G.rng("fridaemia-" + WK);
  // Fixed order (22 Nov 2026): each result is used once before any repeats. Results are dealt ED / call / Monday in turn,
  // so every week gets a mix; the 20-week cycle restarts after the whole bank is used. Append new rows at the end of POOL.
  var ORDER = (function () {
    var o = G.rng("fridaemia-order-v1"), by = { ed: [], call: [], mon: [] }, out = [];
    POOL.forEach(function (x) { by[x[2]].push(x); });
    ["ed", "call", "mon"].forEach(function (k) { by[k] = G.shuffle(by[k], o); });
    while (by.ed.length || by.call.length || by.mon.length) ["ed", "call", "mon"].forEach(function (k) { if (by[k].length) out.push(by[k].shift()); });
    return out;
  })();
  var WN = Math.floor((Date.UTC(T.getFullYear(), T.getMonth(), T.getDate()) / 864e5 + 3) / 7), BLOCKS = Math.floor(ORDER.length / 8);
  var SET = G.shuffle(ORDER.slice((WN % BLOCKS) * 8, (WN % BLOCKS) * 8 + 8), r), idx = 0, score = 0, marks = [];
  var KEY = "mw-fridaemia-" + WK;

  function lockView() {
    var n = nextOpen(T), el = $("fr-lock");
    $("fr-play").disabled = true;
    function tick() {
      var ms = n - new Date();
      if (ms <= 0) { location.reload(); return; }
      var d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
      el.innerHTML = "🔒 The inbox is closed. Opens on Friday, all day, your time.<br><b>" + (d ? d + "d " : "") + h + "h " + m + "m</b> to go.";
    }
    tick(); setInterval(tick, 30000);
  }
  var LOG = [];
  function card() {
    var c = SET[idx];
    $("fr-n").textContent = (idx + 1) + "/" + SET.length;
    $("fr-q").innerHTML = '<span class="mg-tag">Result ' + (idx + 1) + " of " + SET.length + '</span><p class="fr-res">' + G.esc(c[0]) + '</p><p class="mg-case">' + G.esc(c[1]) + '</p><p class="mg-q">It’s 5pm Friday. What now?</p><div class="mg-opts">' +
      [ED, CALL, MON].map(function (k) { return '<button type="button" data-k="' + k + '">' + LABEL[k] + "</button>"; }).join("") + '</div><div id="fr-why"></div>';
    var btns = $("fr-q").querySelectorAll("button[data-k]");
    Array.prototype.forEach.call(btns, function (b) {
      b.onclick = function () {
        var ok = b.getAttribute("data-k") === c[2];
        Array.prototype.forEach.call(btns, function (x) { x.disabled = true; if (x.getAttribute("data-k") === c[2]) x.classList.add("ok"); });
        if (!ok) b.classList.add("no");
        if (ok) score++; marks.push(ok ? "🟢" : "🔴"); LOG.push({ c: c, pick: b.getAttribute("data-k"), ok: ok });
        $("fr-s").textContent = score;
        $("fr-why").innerHTML = '<p class="mg-why"><b>' + (ok ? "Safe call." : "Not quite: " + LABEL[c[2]] + ".") + "</b> " + G.esc(c[3]) + '</p><p style="text-align:right;margin-top:10px"><button class="big mg-next" type="button" id="fr-next">' + (idx + 1 < SET.length ? "Next result" : "Clock off") + "</button></p>";
        $("fr-next").onclick = function () { idx++; if (idx < SET.length) card(); else end(); };
        $("fr-next").focus();
      };
    });
  }
  var VERDICT = ["You’ve clocked off. So has your registration.", "The coroner would like a word.", "Rough weekend ahead. Check your phone.", "Half the inbox is on fire.", "Safe-ish. Sleep with the phone on.", "Solid. A quiet weekend, probably.", "Very safe. Your practice manager approves.", "Nearly perfect. One small wobble.", "Flawless. Zero calls from ED all weekend."];
  function end() {
    G.set(KEY, { score: score, marks: marks.join("") }); if (window.MW_timedDone) window.MW_timedDone("fridaemia");
    $("fr-game").hidden = true; $("fr-end").hidden = false;
    $("fr-final").textContent = score + "/" + SET.length;
    $("fr-verdict").textContent = VERDICT[Math.round(score / SET.length * 8)];
    var rv = $("fr-review"); if (!rv) { rv = document.createElement("div"); rv.id = "fr-review"; rv.className = "fr-rev"; $("fr-end").appendChild(rv); }
    rv.innerHTML = '<p class="mg-q" style="margin-top:14px">Your inbox, result by result</p>' + LOG.map(function (x, i) {
      return '<details class="fr-rv' + (x.ok ? " ok" : " no") + '"' + (x.ok ? "" : " open") + '><summary><span>' + (x.ok ? "&#9989;" : "&#10060;") + "</span> " + G.esc(x.c[0]) + "</summary>" +
        '<p class="mg-case">' + G.esc(x.c[1]) + "</p><p><b>Safe call:</b> " + LABEL[x.c[2]] + (x.ok ? "" : "<br><b>You said:</b> " + LABEL[x.pick]) + '</p><p class="mg-why">' + G.esc(x.c[3]) + "</p></details>";
    }).join("");
    $("fr-share").onclick = function () { G.share("Fridaemia " + WK.replace("-", " ") + " 📥 " + score + "/" + SET.length + "\n" + marks.join("") + "\nThe 5pm Friday inbox. maladywise.com/fridaemia/"); };
  }
  function start() { idx = 0; score = 0; marks = []; LOG = []; $("fr-s").textContent = 0; $("fr-intro").hidden = true; $("fr-end").hidden = true; $("fr-game").hidden = false; card(); }

  var done = G.get(KEY, null);
  if (!isOpen(T)) lockView();
  else if (done) { $("fr-play").textContent = "Play again"; $("fr-best").innerHTML = "This week’s inbox: <b>" + done.score + "/8</b> " + (done.marks || ""); }
  $("fr-play").onclick = function () { if (!$("fr-play").disabled) start(); };
  $("fr-again").onclick = function () { location.reload(); };
})();
