# Common childhood illnesses (Nov 2026, owner's request). Run with _scripts/gen_sheets.py
G = ["Babies and children"]
PBB = ("Pregnancy, Birth and Baby helpline: 1800 882 436", "https://www.pregnancybirthbaby.org.au/", "Free advice from maternal child health nurses, 7am to midnight, 7 days.")

fact("febrile-seizures",
 "Febrile Seizures (Febrile Convulsions) in Children",
 "Febrile seizures (febrile convulsions): fits with fever in children aged 6 months to 6 years. What to do, when to call 000, and why they don’t cause brain damage or mean epilepsy.",
 "Febrile Seizures", "febrile seizures",
 "A fit (seizure) triggered by a fever in a young child. It’s terrifying to watch, but most last only a minute or two and leave no lasting harm. Knowing what to do makes a big difference.",
 h2("What it is", [
   "A seizure caused by a quick rise in temperature, usually with a fever of 38°C or more. Sometimes the seizure is the first sign of the fever.",
   "Most common between about <b>6 months and 6 years</b>.",
   "The child may go stiff, jerk, roll their eyes or go floppy, and won’t respond. Most seizures last <b>1 to 2 minutes</b>.",
   "Afterwards the child is usually sleepy or grumpy, and back to normal within 30 to 60 minutes."]) +
 h2("What to do during a seizure", [
   "Stay calm and note the time.",
   "Lay your child on their side on a soft, low surface, away from anything hard or sharp.",
   "Don’t hold them down, don’t put anything in their mouth, and don’t put them in a bath.",
   "Stay with them until they wake up."]) +
 h2("Call 000 if", [
   "It’s your child’s <b>first</b> seizure.",
   "The seizure lasts <b>more than 5 minutes</b>.",
   "Your child doesn’t wake up after it stops, or is still very drowsy 30 minutes later.",
   "They have trouble breathing, look blue or very pale, or seem very sick.",
   "Also see a doctor urgently if your baby is under 1 month old, or has a rash that doesn’t fade when pressed."]) +
 h2("Reassuring facts", [
   "Febrile seizures <b>don’t cause brain damage</b>, even long ones.",
   "They <b>don’t mean epilepsy</b>, even if a child has more than one. Epilepsy is repeated seizures without fever.",
   "Many children only ever have one. Some have another with a later fever; most grow out of it by about age 6.",
   "Paracetamol and ibuprofen make a child more comfortable, but they <b>don’t prevent</b> febrile seizures."]),
 [("Do febrile seizures cause brain damage?", "No. Febrile seizures don’t cause brain damage or learning problems, even when they last a long time."),
  ("Will my child get epilepsy?", "A febrile seizure doesn’t mean a child has epilepsy, even if they have several. Epilepsy is repeated seizures without a fever."),
  ("Can I prevent febrile seizures with paracetamol?", "No. Fever medicines can make a child more comfortable, but they don’t stop febrile seizures."),
  ("When should I call an ambulance for a febrile seizure?", "If it’s the first seizure, it lasts more than 5 minutes, your child doesn’t wake up afterwards, has trouble breathing, or looks very unwell.")],
 [("Royal Children’s Hospital Melbourne: Febrile seizures", "https://www.rch.org.au/kidsinfo/fact_sheets/Febrile_seizures/", "Family fact sheet. Free."), PBB],
 [("Royal Children’s Hospital Melbourne: Febrile seizures", "https://www.rch.org.au/kidsinfo/fact_sheets/Febrile_seizures/"),
  ("Better Health Channel: Fever and febrile convulsions", "https://betterhealth.vic.gov.au/health/conditionsandtreatments/fever-febrile-convulsions"),
  ("Children’s Health Queensland: Febrile convulsions", "https://childrens.health.qld.gov.au/fact-sheet-febrile-convulsions")],
 [("Fever in children", "/fever-in-children/"), ("Common newborn problems", "/newborn-problems/")],
 groups=G + ["Brain and nerves"], blurb="Fits with fever in young children. What to do, when to call 000, and why they’re rarely harmful.",
 search="febrile seizure febrile convulsion fit with fever child seizure fever toddler convulsion what to do 000 epilepsy paracetamol")

fact("hand-foot-and-mouth",
 "Hand, Foot and Mouth Disease: Symptoms and Care",
 "Hand, foot and mouth disease: a common childhood virus causing mouth ulcers and spots on the hands, feet and bottom. How long it lasts, care at home, childcare exclusion and warning signs.",
 "Hand, Foot and Mouth Disease", "hand, foot and mouth disease",
 "A common, mild virus in young children: mouth ulcers plus spots or small blisters on the hands, feet and bottom. It usually clears in 7 to 10 days. It has nothing to do with foot-and-mouth disease in animals.",
 h2("What it is", [
   "A viral infection, usually from a Coxsackie virus. It spreads easily in childcare through coughs, sneezes, saliva, blister fluid and poo.",
   "Starts with a mild fever, tiredness and sore mouth, then <b>mouth ulcers</b> and small spots or blisters on the hands, feet, nappy area and sometimes legs.",
   "It usually lasts <b>7 to 10 days</b>.",
   "Some children shed fingernails or toenails a few weeks later. They regrow normally."]) +
 h2("Care at home", [
   "There’s no specific treatment, and antibiotics don’t help a virus.",
   "Offer small, frequent sips of fluid. Cold drinks, ice blocks and soft foods are easier on a sore mouth.",
   "Paracetamol or ibuprofen for pain. Don’t give aspirin to children.",
   "Leave blisters to dry. Don’t pop them."]) +
 h2("Stopping the spread", [
   "Keep your child home from childcare or school until the <b>blisters have dried</b>.",
   "The virus can stay in poo for weeks, so wash hands well after nappy changes and toileting.",
   "Don’t share cups, cutlery or towels."]) +
 h2("See a doctor if", [
   "Your child isn’t drinking, has fewer wet nappies or seems dehydrated.",
   "Spots look infected: larger, red, swollen or oozing pus.",
   "<b>Get help urgently</b> if your child is very drowsy, pale, has a stiff neck, trouble breathing, a seizure, or a rash that doesn’t fade when pressed."]),
 [("How long is hand, foot and mouth disease contagious?", "It spreads most easily in the first week, but the virus can be in poo for weeks. Keep children home until blisters have dried, and keep up handwashing."),
  ("Is it the same as foot-and-mouth disease in animals?", "No. They’re different viruses. People don’t catch hand, foot and mouth disease from animals."),
  ("Can adults get hand, foot and mouth disease?", "Yes, though it’s less common. Adults may have no symptoms or a mild illness."),
  ("Why are my child’s nails falling off after hand, foot and mouth?", "Nail shedding can happen a few weeks after the illness. It’s harmless and the nails grow back.")],
 [("Royal Children’s Hospital Melbourne: Hand, foot and mouth disease", "https://www.rch.org.au/kidsinfo/fact_sheets/hand_foot_and_mouth_disease", "Family fact sheet. Free."), PBB],
 [("Royal Children’s Hospital Melbourne: Hand, foot and mouth disease", "https://www.rch.org.au/kidsinfo/fact_sheets/hand_foot_and_mouth_disease"),
  ("NSW Health: Hand, foot and mouth disease fact sheet", "https://www.health.nsw.gov.au/Infectious/factsheets/Pages/handfootmouth.aspx"),
  ("Healthdirect: Hand, foot and mouth disease", "https://www.healthdirect.gov.au/amp/article/hand-foot-and-mouth-disease")],
 [("Fever in children", "/fever-in-children/"), ("Chickenpox", "/chickenpox/"), ("Slapped cheek", "/slapped-cheek/")],
 groups=G + ["Infections"], blurb="Mouth ulcers and spots on hands and feet. Usually clears in 7 to 10 days.",
 search="hand foot and mouth disease HFMD coxsackie mouth ulcers blisters hands feet toddler childcare exclusion nails falling off")

fact("slapped-cheek",
 "Slapped Cheek (Fifth Disease, Parvovirus B19)",
 "Slapped cheek (fifth disease, parvovirus B19): bright red cheeks and a lacy rash in children. Why kids are no longer contagious once the rash appears, and who should see a doctor, including in pregnancy.",
 "Slapped Cheek (Fifth Disease)", "slapped cheek",
 "Bright red cheeks, as if slapped, then a lacy rash on the arms and legs. It’s a mild virus in children. The odd twist: by the time the rash appears, they’re usually no longer contagious.",
 h2("What it is", [
   "An infection with <b>parvovirus B19</b>, spread by coughs and sneezes. Common in school-aged children, often in late winter and spring.",
   "Starts like a mild cold: runny nose, low fever, aches.",
   "A few days later, <b>bright red cheeks</b> appear, then a lacy, pink rash on the arms, legs and body.",
   "The rash can fade and come back with heat, sun, baths or exercise, and usually clears in 7 to 10 days.",
   "Older children and adults may get sore, swollen joints."]) +
 h2("Care", [
   "No specific treatment. Rest, fluids and paracetamol if needed.",
   "Children are usually contagious <b>before</b> the rash, so there’s usually no need to keep a child with just the rash home if they feel well. Check your childcare or school’s policy."]) +
 h2("Pregnancy", [
   "About half of adults are already immune.",
   "Most pregnant women who catch it, and their babies, are fine. Rarely, it causes anaemia in the baby or miscarriage, mostly in the first half of pregnancy. It doesn’t cause birth defects.",
   "If you’re pregnant and have been around slapped cheek, or have a rash, tell your doctor or midwife. A blood test can show whether you’re immune."]) +
 h2("See a doctor urgently if", [
   "Your child has a blood disorder (such as sickle cell, thalassaemia or another anaemia) or a weakened immune system, and has been exposed.",
   "Your child is pale, very tired, breathless or seems very unwell."]),
 [("Is slapped cheek contagious once the rash appears?", "Usually not. Children are most contagious in the cold-like stage before the rash shows."),
  ("Is slapped cheek dangerous in pregnancy?", "Usually not, and about half of adults are already immune. Rarely it affects the baby, mostly in the first half of pregnancy. If you’re pregnant and exposed, tell your doctor or midwife."),
  ("Why does the slapped cheek rash keep coming back?", "The lacy rash can flare with heat, sun, exercise or a warm bath for a few weeks. It isn’t a sign of new infection."),
  ("Is slapped cheek the same as fifth disease?", "Yes. Slapped cheek, fifth disease and erythema infectiosum are all names for parvovirus B19 infection.")],
 [("Sydney Children’s Hospitals Network: Slapped cheek disease or fifth disease", "https://www.schn.health.nsw.gov.au/fact-sheets/slapped-cheek-disease-or-fifth-disease", "Family fact sheet. Free."), PBB],
 [("Sydney Children’s Hospitals Network: Slapped cheek disease or fifth disease", "https://www.schn.health.nsw.gov.au/fact-sheets/slapped-cheek-disease-or-fifth-disease"),
  ("Victorian Department of Health: Erythema infectiosum (human parvovirus or slapped cheek)", "https://health.vic.gov.au/infectious-diseases/erythema-infectiosum-human-parvovirus-or-slapped-cheek"),
  ("NHMRC Staying Healthy: Fifth disease", "https://www.nhmrc.gov.au/sites/default/files/documents/attachments/Staying-Healthy/Fifth-disease.pdf")],
 [("Hand, foot and mouth disease", "/hand-foot-and-mouth/"), ("Scarlet fever", "/scarlet-fever/"), ("Measles", "/measles/")],
 groups=G + ["Infections"], blurb="Bright red cheeks and a lacy rash. Mild in kids; what it means in pregnancy.",
 search="slapped cheek fifth disease parvovirus B19 erythema infectiosum red cheeks lacy rash child pregnancy parvo")

fact("scarlet-fever",
 "Scarlet Fever: Symptoms and Treatment",
 "Scarlet fever: a strep throat infection with a sandpaper-like rash and strawberry tongue. Antibiotics for 10 days, return to school, and why finishing the course protects the heart.",
 "Scarlet Fever", "scarlet fever",
 "A strep throat with a rough, red rash. It sounds old-fashioned, but it’s still around and easily treated with penicillin. Finishing the full course matters, to protect against rheumatic fever.",
 h2("What it is", [
   "An infection with group A streptococcus (strep), the same bacteria that causes strep throat. Most common in children aged 5 to 15.",
   "Fever, sore red throat, swollen neck glands, and a red bumpy <b>strawberry tongue</b>.",
   "A red rash that feels like <b>sandpaper</b> starts on the neck and chest and spreads, usually within 1 to 2 days. It fades after 3 to 4 days, and skin may peel, especially on the hands and feet."]) +
 h2("Treatment", [
   "See your GP. A throat swab can confirm it.",
   "<b>Penicillin for 10 days</b> is usual. Children often feel better within 2 days, but finish the whole course.",
   "Paracetamol or ibuprofen for fever and sore throat, and plenty of fluids."]) +
 h2("Back to school", [
   "Children can return once they’ve had at least 2 days of antibiotics (some guidance says 24 hours) and feel well enough. Check your school’s policy."]) +
 h2("Why finishing antibiotics matters", [
   "Untreated strep can lead to <b>acute rheumatic fever</b>, which can damage the heart (rheumatic heart disease). It’s rare in most of Australia but still far too common in some Aboriginal and Torres Strait Islander communities.",
   "Rarely, strep spreads into the blood or deep tissues (invasive group A strep). <b>Get help urgently</b> for a child who is very drowsy, has severe pain, difficulty breathing, or a rapidly spreading red, painful patch of skin."]),
 [("Is scarlet fever serious?", "Usually not when treated. Antibiotics clear it quickly. Finishing the full course helps prevent rare complications like rheumatic fever."),
  ("How long is scarlet fever contagious?", "Until about a day or two after starting antibiotics. Children can usually return to school after at least 2 days of treatment if they feel well."),
  ("What does the scarlet fever rash feel like?", "Rough, like sandpaper. It often starts on the neck and chest, and the skin may peel as it fades."),
  ("Can adults get scarlet fever?", "Yes, but it’s much more common in school-aged children.")],
 [("Children’s Health Queensland: Scarlet fever", "https://www.childrens.health.qld.gov.au/health-a-to-z/scarlet-fever", "Family fact sheet. Free."), PBB],
 [("Children’s Health Queensland: Scarlet fever", "https://www.childrens.health.qld.gov.au/health-a-to-z/scarlet-fever"),
  ("Healthdirect: Scarlet fever", "https://healthdirect.gov.au/amp/article/scarlet-fever"),
  ("CDC: Clinical guidance for scarlet fever", "https://cdc.gov/group-a-strep/hcp/clinical-guidance/scarlet-fever.html")],
 [("Sore throat", "/sore-throat/"), ("Slapped cheek", "/slapped-cheek/"), ("Fever in children", "/fever-in-children/")],
 groups=G + ["Infections"], blurb="Strep throat with a sandpaper rash. Penicillin for 10 days; finish the course.",
 search="scarlet fever scarlatina strep throat group A streptococcus sandpaper rash strawberry tongue penicillin rheumatic fever iGAS")

fact("whooping-cough",
 "Whooping Cough (Pertussis): Symptoms, Babies and Vaccines",
 "Whooping cough (pertussis): the 100-day cough. Why it’s dangerous for young babies, vaccination in pregnancy at 20 to 32 weeks, the childhood schedule, antibiotics and when to get help.",
 "Whooping Cough (Pertussis)", "whooping cough",
 "A long, hacking cough that can last for months in older children and adults, but can be life-threatening for young babies. Vaccinating in pregnancy is the best way to protect a newborn.",
 h2("What it is", [
   "A bacterial infection (<i>Bordetella pertussis</i>) that spreads through coughs and sneezes.",
   "Starts like a cold, then becomes <b>bouts of severe coughing</b>, sometimes ending in a ‘whoop’ when breathing in, or vomiting. It can last weeks to months.",
   "Babies may not whoop. Instead they may <b>stop breathing</b>, go blue, or struggle to feed."]) +
 h2("Why babies are at risk", [
   "Babies under 6 months are too young to be fully protected by their own vaccines, and are most at risk of hospital, pneumonia, seizures and death.",
   "In more than half of babies who catch it, the source is a parent or someone at home."]) +
 h2("Vaccination", [
   "<b>In pregnancy:</b> a whooping cough vaccine in every pregnancy, ideally at <b>20 to 32 weeks</b>. Antibodies pass to the baby and protect them in the first months. It’s free in Australia.",
   "<b>Babies:</b> doses at 2 (from 6 weeks), 4 and 6 months, then boosters at 18 months and 4 years, and in early high school.",
   "<b>Adults</b> around babies, such as partners and grandparents, can have a booster if it’s been 10 years or more."]) +
 h2("Treatment", [
   "Antibiotics stop it spreading if started early, but may not shorten the cough once it’s well established.",
   "Stay away from childcare, school, work and babies until you’ve had 5 days of antibiotics, or as your doctor advises.",
   "Close contacts, especially babies and pregnant women, may need antibiotics too."]) +
 h2("Get help urgently if", [
   "A baby has pauses in breathing, goes blue or pale during coughing, or can’t feed.",
   "Anyone is struggling to breathe or seems very unwell. Call 000 in an emergency."]),
 [("When should I have the whooping cough vaccine in pregnancy?", "In every pregnancy, ideally between 20 and 32 weeks. It’s free, and it protects your baby in the first months of life."),
  ("Why is whooping cough dangerous for babies?", "Babies under 6 months aren’t fully protected yet and can stop breathing, get pneumonia or have seizures. Most catch it from someone at home."),
  ("How long does whooping cough last?", "The cough can last for weeks to months, which is why it’s called the 100-day cough."),
  ("Do grandparents need a whooping cough booster?", "Adults who will be around a new baby can have a booster if it’s been 10 years or more. Ask your GP or pharmacist.")],
 [("Australian Immunisation Handbook: Pertussis (whooping cough)", "https://immunisationhandbook.health.gov.au/contents/vaccine-preventable-diseases/pertussis-whooping-cough", "Official vaccine advice. Free."), PBB],
 [("Australian Immunisation Handbook: Pertussis (whooping cough)", "https://immunisationhandbook.health.gov.au/contents/vaccine-preventable-diseases/pertussis-whooping-cough"),
  ("NCIRS: Antenatal pertussis vaccination timing updated", "https://ncirs.org.au/antenatal-pertussis-vaccination-timing-updated")],
 [("Croup", "/croup/"), ("Bronchiolitis", "/bronchiolitis/"), ("Fever in children", "/fever-in-children/")],
 groups=G + ["Infections", "Lungs and breathing"], blurb="The 100-day cough. Dangerous for babies; vaccinate in pregnancy at 20 to 32 weeks.",
 search="whooping cough pertussis 100 day cough whoop baby vaccine pregnancy 20 32 weeks dTpa booster grandparents bordetella")

fact("bedwetting",
 "Bedwetting in Children: Causes and What Helps",
 "Bedwetting (nocturnal enuresis) in children: how common it is, why it happens, when to treat, bedwetting alarms, desmopressin and practical tips.",
 "Bedwetting", "bedwetting",
 "Very common, nobody’s fault and usually outgrown. Most children don’t need treatment before about age 7, and when they do, a bedwetting alarm is one of the most effective options.",
 h2("Why it happens", [
   "Deep sleep, so the full-bladder signal doesn’t wake the child.",
   "Making a lot of urine overnight, or a smaller or overactive bladder.",
   "It often runs in families.",
   "<b>Constipation</b> is a common hidden cause. Treating it can stop the wetting.",
   "Rarely, other causes such as a urine infection or snoring with sleep apnoea, usually with other symptoms."]) +
 h2("What helps", [
   "Be supportive. Punishment and shame make it worse.",
   "Plenty of drinks during the day, fewer in the evening, and no caffeine (cola, tea, hot chocolate) at night.",
   "A wee just before bed. Waking a child at night to wee doesn’t teach them to wake themselves.",
   "Waterproof mattress covers and pull-ups for sleepovers and camps.",
   "Reward effort, like helping change sheets, not dry nights, which they can’t fully control."]) +
 h2("Treatment, usually from about age 7", [
   "<b>Bedwetting alarms</b> wake the child when they start to wee. They’re one of the best treatments and less likely to relapse than medicine. They take 6 to 8 weeks to work.",
   "<b>Desmopressin</b> reduces urine made overnight. It works only on nights it’s taken, so it’s handy for camps and sleepovers, or if alarms don’t work.",
   "Your GP or a continence service can help choose and support treatment."]) +
 h2("See a doctor sooner if", [
   "Your child was dry for 6 months or more and has started wetting again.",
   "There’s daytime wetting, pain when weeing, a weak stream, unusual thirst, or poo accidents.",
   "Loud snoring or pauses in breathing at night.",
   "Your child is very upset by it, whatever their age."]),
 [("At what age should bedwetting stop?", "Many children stop on their own between ages 5 and 7, and some take longer. Treatment is usually offered from about age 7, or earlier if your child is upset by it."),
  ("Do bedwetting alarms work?", "Yes. They’re one of the most effective treatments and less likely to relapse than medicine. Give them 6 to 8 weeks."),
  ("Should I wake my child at night to go to the toilet?", "It may give a dry bed that night, but it doesn’t help them learn to wake to a full bladder."),
  ("Can constipation cause bedwetting?", "Yes. A full bowel can press on the bladder. Treating constipation can stop bedwetting and help alarms work.")],
 [("Royal Children’s Hospital Melbourne: Bedwetting", "https://www.rch.org.au/kidsinfo/fact_sheets/Bedwetting/", "Family fact sheet. Free."),
  ("Continence Foundation of Australia helpline: 1800 33 00 66", "https://www.continence.org.au/", "Free advice on bedwetting and alarms.")],
 [("Royal Children’s Hospital Melbourne: Bedwetting", "https://www.rch.org.au/kidsinfo/fact_sheets/Bedwetting/"),
  ("RACGP HANDI: Behavioural interventions including alarms for bedwetting", "https://www.racgp.org.au/clinical-resources/clinical-guidelines/handi/conditions/children/behavioural-interventions-including-alarms-bedwett"),
  ("Healthdirect: Bedwetting in children", "https://www.healthdirect.gov.au/bedwetting-in-older-children")],
 [("Constipation", "/constipation/"), ("UTI", "/uti/"), ("ADHD in children", "/adhd-kids/")],
 groups=G + ["Kidneys and bladder"], blurb="Very common and usually outgrown. When to treat, and why alarms work best.",
 search="bedwetting nocturnal enuresis wetting the bed child bedwetting alarm desmopressin minirin dry nights constipation")
