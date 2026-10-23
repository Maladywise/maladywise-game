import sys; sys.exit("Retired: edit data/health-days.json directly. Re-running this would wipe hand-added days.")
import json, datetime as dt, calendar

W="https://www.who.int/campaigns/"
# (id, name, rule, kind, tags, link, blurb, puzzle_theme)
# rule: "MM-DD" fixed | "nth:N:WD:MM" (N=1..4 or -1 last, WD 0=Mon) | "lastday:MM" | "range:MM-DD:MM-DD" | "month:MM" | "sleep"
D = [
 # January / February
 ("ntd","World Neglected Tropical Diseases Day","01-30","day",["who"],W+"world-ntd-day","A billion-plus people live with diseases most doctors only meet in exams. Today they get the spotlight.","Neglected tropical diseases: leprosy, schisto, trachoma, dengue, leishmaniasis"),
 ("cancer","World Cancer Day","02-04","day",[],"https://www.worldcancerday.org","Prevention, screening and catching it early. Today's puzzles are all about cancer.","Oncology: tumour types, screening, markers, staging"),
 ("epilepsy","International Epilepsy Day","nth:2:0:02","day",[],"https://www.epilepsy.org","Seizures are more than shaking. Brush up on epilepsy today.","Epilepsy and seizures: types, EEG, triggers, history of neurology"),
 ("childcancer","International Childhood Cancer Day","02-15","day",[],"https://www.siop-online.org","Children's cancers are rare, and survival has climbed hugely. Today is for them.","Paediatric oncology: leukaemia, neuroblastoma, Wilms, retinoblastoma"),
 ("encephalitis","World Encephalitis Day","02-22","day",[],"https://www.encephalitis.info","Brain inflammation is rare, serious and often missed. Know the signs.","Encephalitis: viral, autoimmune (anti-NMDA), meningitis vs encephalitis"),
 ("rare","Rare Disease Day","lastday:02","day",["zebra"],"https://www.rarediseaseday.org","When you hear hoofbeats, sometimes it IS a zebra. Today is all zebras.","Rare diseases and zebras: eponymous syndromes, genetic conditions"),
 # March
 ("hearing","World Hearing Day","03-03","day",["who"],W+"world-hearing-day","Turn it down a notch. Today is about ears and hearing.","ENT and hearing: ear anatomy, hearing loss, tinnitus, audiology"),
 ("obesity","World Obesity Day","03-04","day",[],"https://www.worldobesityday.org","Obesity is a chronic disease, not a character flaw. Today's puzzles take it seriously.","Obesity medicine: metabolism, hormones (leptin, GLP-1), bariatrics. No body-shaming."),
 ("kidney","World Kidney Day","nth:2:3:03","day",[],"https://www.worldkidneyday.org","Two bean-shaped organs filtering about 180 litres a day. Show them some love.","Nephrology: nephron, eGFR, dialysis, kidney stones, transplant"),
 ("sleep","World Sleep Day","sleep","day",[],"https://worldsleepday.org","Sleep is medicine. Today's puzzles are best done well-rested.","Sleep medicine: circadian rhythm, sleep apnoea, narcolepsy, melatonin"),
 ("oral","World Oral Health Day","03-20","day",[],"https://www.worldoralhealthday.org","Your mouth is part of your body too. Today is for teeth and gums.","Dentistry and oral health: teeth, gums, salivary glands, oral signs of disease"),
 ("downs","World Down Syndrome Day","03-21","day",[],"https://www.worlddownsyndromeday.org","21/3 for three copies of chromosome 21. Celebrate, include, learn.","Genetics and trisomies: chromosomes, karyotypes, inclusion. Respectful tone."),
 ("optometry","World Optometry Day","03-23","day",["specialty"],"https://worldcouncilofoptometry.info","Eyes front. Today celebrates optometrists.","Optometry: refraction, myopia, lenses, eye anatomy"),
 ("tb","World TB Day","03-24","day",["who"],W+"world-tb-day","TB is one of the world's deadliest infectious diseases, and it's curable. Learn the history.","Tuberculosis: Koch, Mantoux, BCG, consumption in history, treatment"),
 ("bipolar","World Bipolar Day","03-30","day",["gentle"],"https://www.isbd.org","Van Gogh's birthday. Today is about understanding bipolar disorder.","Mood disorders, gently: history, lithium, neuroscience. No jokes about patients."),
 # April
 ("autism","World Autism Awareness Day","04-02","day",["gentle"],"https://www.un.org/en/observances/autism-day","Neurodiversity day. Different brains, not broken ones.","Neurodiversity: autism history, sensory processing, strengths. Respectful."),
 ("health","World Health Day","04-07","day",["who"],W+"world-health-day","The WHO's birthday. Today's puzzles cover the whole of global health.","Global health: WHO history, public health milestones, epidemics, vaccines"),
 ("parkinsons","World Parkinson's Day","04-11","day",[],"https://www.epda.eu.com","James Parkinson's birthday. Today is about the shaking palsy.","Movement disorders: dopamine, substantia nigra, tremor, levodopa history"),
 ("chagas","World Chagas Disease Day","04-14","day",["who","zebra"],W+"world-chagas-disease-day","The kissing bug's not-so-romantic gift. A classic zebra.","Parasitology: Chagas, trypanosomes, vectors, tropical cardiomyopathy"),
 ("haemophilia","World Haemophilia Day","04-17","day",[],"https://wfh.org","Royal blood, literally. Today is about bleeding disorders.","Haematology: clotting cascade, factor VIII/IX, von Willebrand, royal history"),
 ("immunization","World Immunization Week","range:04-24:04-30","week",["who"],W+"world-immunization-week","Vaccines: the most successful prevention in history. Celebrate them this week.","Vaccines and immunology: Jenner, smallpox, herd immunity, antibodies"),
 ("malaria","World Malaria Day","04-25","day",["who"],W+"world-malaria-day","A mosquito-borne parasite that's shaped human history. Today we take it on.","Malaria: Plasmodium, Anopheles, quinine, sickle cell link, Ross"),
 # May
 ("eds","Ehlers-Danlos Syndromes Awareness Month","month:05","month",["zebra"],"https://www.ehlers-danlos.com","May is EDS month. Bendy, often missed, and the original medical zebra.","Connective tissue and zebras: collagen, hypermobility, dysautonomia"),
 ("asthma","World Asthma Day","nth:1:1:05","day",[],"https://ginasthma.org","Breathe in, breathe out. Today is about airways.","Respiratory: asthma, bronchi, spirometry, inhalers history"),
 ("midwife","International Day of the Midwife","05-05","day",["specialty"],"https://internationalmidwives.org","Midwives have been catching babies since forever. Today is theirs.","Midwifery and obstetrics: pregnancy, labour, newborn care"),
 ("handhygiene","World Hand Hygiene Day","05-05","day",["who"],W+"world-hand-hygiene-day","Semmelweis was right. Wash your hands.","Infection prevention: Semmelweis, germ theory, hand hygiene"),
 ("thalassaemia","World Thalassaemia Day","05-08","day",[],"https://thalassaemia.org.cy","Today is about haemoglobin gone slightly wrong.","Haemoglobinopathies: thalassaemia, globin genes, transfusion"),
 ("lupus","World Lupus Day","05-10","day",["zebra"],"https://www.worldlupusday.org","It's not always lupus... but today it is.","Autoimmunity: lupus, ANA, butterfly rash, mimics"),
 ("nurses","International Nurses Day","05-12","day",["specialty"],"https://www.icn.ch","Florence Nightingale's birthday. Every puzzle today is for nurses.","Nursing: Nightingale, observations, wards, nursing history and skills"),
 ("hypertension","World Hypertension Day","05-17","day",[],"https://www.whleague.org","The silent killer. Know your numbers.","Hypertension and BP: Korotkoff, sphygmomanometers, cardiovascular risk"),
 ("familydoctor","World Family Doctor Day","05-19","day",["specialty"],"https://www.globalfamilydoctor.com","Here's to GPs, the first port of call. Today's puzzles are for general practice.","General practice: common presentations, history-taking, preventive care"),
 ("emergency","World Emergency Medicine Day","05-27","day",["specialty"],"https://www.ifem.cc","Today is for the people running towards the chaos.","Emergency medicine: triage, resus, ABCDE, trauma, toxicology"),
 ("ms","World MS Day","05-30","day",[],"https://worldmsday.org","Multiple sclerosis: myelin under attack. Learn about it today.","Neurology: MS, myelin, demyelination, MRI, Charcot"),
 ("tobacco","World No Tobacco Day","05-31","day",["who"],W+"world-no-tobacco-day","Today is all about the lungs, and what tobacco does to them.","Tobacco harm: lungs, COPD, cancers, nicotine, quitting"),
 # June - August
 ("foodsafety","World Food Safety Day","06-07","day",["who"],W+"world-food-safety-day","Today's puzzles are about what's lurking in your lunch.","Foodborne illness: Salmonella, Listeria, botulism, gastro"),
 ("blood","World Blood Donor Day","06-14","day",["who"],W+"world-blood-donor-day","Karl Landsteiner's birthday. Blood groups all day.","Transfusion: blood groups, Landsteiner, donation, plasma"),
 ("sicklecell","World Sickle Cell Day","06-19","day",[],"https://www.un.org/en/observances/sickle-cell-day","One amino acid swap, huge consequences. Today is about sickle cell.","Sickle cell disease: HbS, crises, malaria protection, genetics"),
 ("vitiligo","World Vitiligo Day","06-25","day",[],"https://vrfoundation.org","Skin with a story. Today is about vitiligo and pigment.","Dermatology: melanocytes, pigment disorders, autoimmune skin"),
 ("paramedics","International Paramedics Day","07-08","day",["specialty"],"https://www.paramedicsday.com","Lights, sirens, respect. Today is for paramedics.","Prehospital care: trauma, CPR, defibrillation, ambulance history"),
 ("brain","World Brain Day","07-22","day",[],"https://wfneurology.org","Today's puzzles are about the organ doing the puzzles.","Neuroanatomy: lobes, cranial nerves, neurons, famous brain cases"),
 ("drowning","World Drowning Prevention Day","07-25","day",["who","gentle"],W+"world-drowning-prevention-day","Drowning is preventable. Supervise, swim, learn CPR.","Water safety and resuscitation: CPR, hypothermia, physiology. No jokes about drowning."),
 ("hepatitis","World Hepatitis Day","07-28","day",["who"],W+"world-hepatitis-day","Baruch Blumberg's birthday. Hep A to E today.","Liver and hepatitis: viruses A–E, LFTs, cirrhosis, Blumberg"),
 ("breastfeeding","World Breastfeeding Week","range:08-01:08-07","week",[],"https://worldbreastfeedingweek.org","This week is about infant feeding and the science of milk.","Lactation and infant nutrition: milk science, newborns"),
 ("mosquito","World Mosquito Day","08-20","day",[],"https://www.lshtm.ac.uk","Ross proved mosquitoes carry malaria on this day in 1897. The deadliest animal, all day.","Vector-borne disease: mosquitoes, dengue, Zika, yellow fever, malaria"),
 # September
 ("physio","World Physiotherapy Day","09-08","day",["specialty"],"https://world.physio","Move it. Today is for physios.","Physiotherapy and musculoskeletal: muscles, joints, rehab"),
 ("suicideprev","World Suicide Prevention Day","09-10","day",["sensitive"],W+"world-suicide-prevention-day","Today is World Suicide Prevention Day. If you're struggling, reach out: Lifeline 13 11 14.",None),
 ("firstaid","World First Aid Day","nth:2:5:09","day",[],"https://www.ifrc.org","A few skills can save a life. Today is about first aid.","First aid: DRSABCD, CPR, bleeding, burns, choking"),
 ("sepsis","World Sepsis Day","09-13","day",[],"https://www.worldsepsisday.org","Sepsis kills more people than many cancers. Know the signs.","Sepsis and infection: SIRS, lactate, antibiotics, shock"),
 ("patientsafety","World Patient Safety Day","09-17","day",["who"],W+"world-patient-safety-day","First, do no harm. Today is about safer care.","Patient safety: errors, checklists, handover, famous safety lessons"),
 ("alzheimers","World Alzheimer's Day","09-21","day",["gentle"],"https://www.alzint.org","Memory matters. Today is about dementia.","Dementia: Alzheimer, plaques and tangles, memory, cognition. Respectful."),
 ("pharmacists","World Pharmacists Day","09-25","day",["specialty"],"https://www.fip.org","Here's to the people who decode our handwriting. Today is for pharmacists.","Pharmacology: drug classes, history of drugs, pharmacy"),
 ("lung","World Lung Day","09-25","day",[],"https://www.firsnet.org","Your lungs take about 20,000 breaths a day. Today we thank them.","Respiratory: lungs, alveoli, gas exchange, lung disease"),
 ("rabies","World Rabies Day","09-28","day",["who"],W+"world-rabies-day","Louis Pasteur died on this day. Rabies is almost 100% fatal and fully preventable.","Rabies and zoonoses: Pasteur, bats, vaccines, Negri bodies"),
 ("heart","World Heart Day","09-29","day",[],"https://world-heart-federation.org","About 100,000 beats a day. Today is all heart.","Cardiology: ECG, valves, coronary arteries, heart history"),
 # October
 ("dysautonomia","Dysautonomia Awareness Month","month:10","month",["zebra"],"https://www.dysautonomiainternational.org","October is for POTS and dysautonomia. Stand up slowly.","Autonomic nervous system: POTS, orthostatic hypotension, MCAS"),
 ("sight","World Sight Day","nth:2:3:10","day",[],"https://www.iapb.org","Today's puzzles focus on the eyes.","Ophthalmology: retina, cataract, glaucoma, visual pathways"),
 ("mentalhealth","World Mental Health Day","10-10","day",["gentle"],W+"world-mental-health-day","Mental health is health. Look after yours.","Mental health, gently: history of psychiatry, neuroscience, wellbeing. No jokes about patients."),
 ("arthritis","World Arthritis Day","10-12","day",[],"https://www.eular.org","Creaky joints, all day.","Rheumatology: RA, OA, gout, joints, autoimmune arthritis"),
 ("thrombosis","World Thrombosis Day","10-13","day",[],"https://www.worldthrombosisday.org","Rudolf Virchow's birthday. Clots, triads and anticoagulants today.","Thrombosis: Virchow's triad, DVT, PE, anticoagulation"),
 ("handwashing","Global Handwashing Day","10-15","day",[],"https://globalhandwashing.org","Soap: the original public health tech.","Hygiene and infection: germs, soap, outbreaks"),
 ("anaesthesia","World Anaesthesia Day","10-16","day",["specialty"],"https://wfsahq.org","Ether Day, 1846: the first public anaesthetic. Every puzzle today is for the gas crew.","Anaesthetics: ether, airway, induction agents, monitoring, ASA grades"),
 ("osteoporosis","World Osteoporosis Day","10-20","day",[],"https://www.worldosteoporosisday.org","Bones are living tissue. Keep them strong.","Bone health: osteoporosis, DEXA, calcium, vitamin D, fractures"),
 ("polio","World Polio Day","10-24","day",[],"https://www.endpolio.org","Jonas Salk's birthday. Polio is nearly gone.","Polio and vaccines: Salk, Sabin, iron lungs, eradication"),
 ("ot","World Occupational Therapy Day","10-27","day",["specialty"],"https://wfot.org","Today is for OTs, who get people back to doing what matters.","Occupational therapy: function, ADLs, rehab, adaptive equipment"),
 ("stroke","World Stroke Day","10-29","day",[],"https://www.world-stroke.org","Time is brain. Today is about stroke.","Stroke: FAST, ischaemic vs haemorrhagic, vascular territories, thrombolysis"),
 ("psoriasis","World Psoriasis Day","10-29","day",[],"https://ifpa-pso.com","More than skin deep. Today is about psoriasis.","Dermatology: psoriasis, plaques, nail signs, psoriatic arthritis"),
 # November / December
 ("radiology","International Day of Radiology","11-08","day",["specialty"],"https://www.internationaldayofradiology.com","Röntgen discovered X-rays on this day in 1895. Today's puzzles are for radiology.","Radiology and imaging: X-ray, CT, MRI, ultrasound, famous films"),
 ("pneumonia","World Pneumonia Day","11-12","day",[],"https://stoppneumonia.org","The old man's friend, and a leading killer of kids. Today is about pneumonia.","Respiratory infection: pneumonia, consolidation, organisms, CXR"),
 ("diabetes","World Diabetes Day","11-14","day",[],"https://worlddiabetesday.org","Frederick Banting's birthday. Insulin, glucose and HbA1c all day.","Diabetes: insulin, Banting and Best, pancreas, HbA1c, complications"),
 ("prematurity","World Prematurity Day","11-15","day",["who"],W+"world-prematurity-day","About 1 in 10 babies arrive early. Today is for them.","Neonatology: prematurity, NICU, surfactant, newborn care"),
 ("cervical","World Cervical Cancer Elimination Day","11-17","day",["who"],W+"world-cervical-cancer-elimination-day","The first cancer we could eliminate. HPV vaccines and screening make it possible.","Cervical cancer: HPV, Pap smear history, screening, vaccines"),
 ("copd","World COPD Day","nth:3:2:11","day",[],"https://goldcopd.org","Today is about COPD.","COPD: emphysema, bronchitis, spirometry, smoking"),
 ("amr","World AMR Awareness Week","range:11-18:11-24","week",["who"],W+"world-amr-awareness-week","Antibiotics are running out of road. Use them wisely.","Antimicrobials: Fleming, penicillin, resistance, superbugs (MRSA)"),
 ("aids","World AIDS Day","12-01","day",["who","gentle"],W+"world-aids-day","From a death sentence to a manageable condition. Today is about HIV.","HIV and immunology: CD4, antiretrovirals, history. No jokes about patients."),
 ("disability","International Day of Persons with Disabilities","12-03","day",["gentle"],"https://www.un.org/en/observances/day-of-persons-with-disabilities","Accessibility is for everyone.","Disability and inclusion, gently: accessibility, rehab, adaptive tech."),
 ("uhc","Universal Health Coverage Day","12-12","day",[],"https://www.who.int/campaigns/universal-health-coverage-day","Health care for everyone, everywhere. Today is about health systems.","Health systems: public health, history of medicine, global health"),
 # Sensitive: blurb only, no themed puzzles
 ("eatingdisorders","World Eating Disorders Action Day","06-02","day",["sensitive"],"https://www.worldeatingdisordersday.org","Today is World Eating Disorders Action Day. Support is available: Butterfly Foundation 1800 33 4673.",None),
 ("elderabuse","World Elder Abuse Awareness Day","06-15","day",["sensitive"],"https://www.un.org/en/observances/elder-abuse-awareness-day","Today is World Elder Abuse Awareness Day.",None),
 ("gbv","16 Days of Activism against Gender-Based Violence","range:11-25:12-10","week",["sensitive"],"https://www.unwomen.org","Support is available: 1800RESPECT (1800 737 732).",None),
]

def nth(year, n, wd, month):
    days=[d for d in range(1,calendar.monthrange(year,month)[1]+1) if dt.date(year,month,d).weekday()==wd]
    return dt.date(year,month,days[n-1] if n>0 else days[-1])

def sleep_day(year):  # Friday before the March equinox (~20 Mar)
    eq=dt.date(year,3,20)
    d=eq-dt.timedelta(days=1)
    while d.weekday()!=4: d-=dt.timedelta(days=1)
    return d

def resolve(rule, y):
    if rule=="sleep": return sleep_day(y), None
    if rule.startswith("nth:"):
        _,n,wd,m=rule.split(":"); return nth(y,int(n),int(wd),int(m)), None
    if rule.startswith("lastday:"):
        m=int(rule.split(":")[1]); return dt.date(y,m,calendar.monthrange(y,m)[1]), None
    if rule.startswith("range:"):
        _,a,b=rule.split(":"); s=dt.date(y,*map(int,a.split("-"))); e=dt.date(y,*map(int,b.split("-")))
        return s, e
    if rule.startswith("month:"):
        m=int(rule.split(":")[1]); return dt.date(y,m,1), dt.date(y,m,calendar.monthrange(y,m)[1])
    return dt.date(y,*map(int,rule.split("-"))), None

out=[]
PRI={"specialty":1,"who":2}
for (i,name,rule,kind,tags,link,blurb,theme) in D:
    dates={}
    for y in (2026,2027,2028):
        s,e=resolve(rule,y)
        dates[str(y)]={"start":s.isoformat(),**({"end":e.isoformat()} if e else {})}
    pri=min([PRI.get(t,3) for t in tags]+[3])
    out.append({"id":i,"name":name,"kind":kind,"rule":rule,"dates":dates,"tags":tags,
                "priority":0 if "sensitive" in tags else pri,"link":link,"blurb":blurb,"puzzle_theme":theme})

doc={"_about":("Malady Wise health-days calendar. Used by the monthly puzzle build and the home page. "
 "kind=day: theme every puzzle that day around puzzle_theme. kind=week: theme the first day only. "
 "kind=month: no full themed day; slip 2-4 related puzzles in across the month. "
 "tags: specialty = profession day; who = official WHO campaign; zebra = rare-disease angle; "
 "gentle = respectful tone, no jokes about patients or the condition; sensitive = home-page blurb only, puzzles NOT themed. "
 "If two days share a date, the lowest priority number leads (1 specialty, 2 WHO, 3 other); the other gets a mention in the blurb. "
 "Dates for variable days are pre-computed for 2026-2028; recompute from 'rule' for later years. "
 "Verify links before publishing; blurbs use Australian spelling."),
 "updated":"2026-10-21","days":sorted(out,key=lambda x:x["dates"]["2027"]["start"])}
json.dump(doc,open("data/health-days.json","w"),indent=1,ensure_ascii=False)
print(len(out),"entries")
for k in ("kidney","sleep","asthma","epilepsy","firstaid","sight","copd","rare"):
    e=[x for x in out if x["id"]==k][0]; print(k, e["dates"]["2026"]["start"], e["dates"]["2027"]["start"])
