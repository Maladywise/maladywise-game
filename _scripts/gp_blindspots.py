#!/usr/bin/env python3
"""GP School: Blind spots room (26 Nov 2026). Bias, dismissal, diagnostic overshadowing, atypical presentations.
Appends huddle questions and patient cases to unspecialist/data/*.json (skips ids already there)."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/"
D = ROOT + "unspecialist/data/"

H = [
 ("bs1", "Cardiovascular", "A 58-year-old woman with diabetes has nausea, jaw ache and unusual tiredness since lunch. No chest pain. Best next step?",
  ["Antacid trial and review tomorrow", "ECG now and treat as possible acute coronary syndrome", "Ask about stress at home", "Book a stress test next month"], 1,
  "Women, older people and people with diabetes more often have heart attacks without classic chest pain, and they're treated later. Unexplained nausea, jaw or back ache, breathlessness or exhaustion earns an ECG today.",
  "https://doi.org/10.1161/CIR.0000000000000351"),
 ("bs2", "Women's health", "On average, how long does it take for endometriosis to be diagnosed in Australia after symptoms start?",
  ["Under 1 year", "About 2 years", "About 6.5 years", "It's usually picked up at the first visit"], 2,
  "The National Action Plan for Endometriosis quotes an average delay of 6.5 years. Period pain that stops someone working, studying or having sex isn't ‘normal’. Believe it, treat it, and refer.",
  "https://www.health.gov.au/resources/publications/national-action-plan-for-endometriosis"),
 ("bs3", "Mental health", "A man with schizophrenia says his chest hurts. The nurse says he ‘always complains’. What's the trap?",
  ["Over-investigating him", "Diagnostic overshadowing: blaming new symptoms on his mental illness", "Breaching confidentiality", "Prescribing too many antipsychotics"], 1,
  "Diagnostic overshadowing is when a known diagnosis gets the blame for a new symptom. People with severe mental illness die 10–20 years earlier, mostly from physical illness like heart disease. Assess the chest pain like anyone else's.",
  "https://doi.org/10.1371/journal.pone.0111682"),
 ("bs4", "Neurology", "A meta-analysis of studies that actively screened for autism found a male-to-female ratio closer to…",
  ["10 to 1", "6 to 1", "3 to 1", "1 to 1"], 2,
  "Active screening finds about 3 boys to every girl, not the 4–5 to 1 seen in clinics. Autistic girls and women often mask, so they're missed or labelled with anxiety, depression or a personality disorder first.",
  "https://doi.org/10.1016/j.jaac.2017.03.013"),
 ("bs5", "Respiratory", "A Black patient's pulse oximeter reads 94%. What should you know?",
  ["Oximeters are equally accurate on all skin tones", "Oximeters can overestimate oxygen in darker skin, so hidden low oxygen is more likely", "Oximeters underestimate oxygen in darker skin", "Only use the reading on the forehead"], 1,
  "In a large US study, hidden low oxygen (arterial saturation under 88% with an oximeter reading of 92–96%) was about three times as common in Black patients. If they look unwell, check a blood gas.",
  "https://doi.org/10.1056/NEJMc2029240"),
 ("bs6", "Cardiovascular", "A 27-year-old woman gets palpitations and dizziness on standing. Her notes say ‘anxiety’. Simple test to do today?",
  ["Repeat the anxiety questionnaire", "Active stand test: lying, then standing heart rate and blood pressure for 10 minutes", "Holter monitor in 6 months", "Nothing: anxiety is already diagnosed"], 1,
  "A sustained rise of 30 beats a minute or more within 10 minutes of standing (40 or more under 20), without a big blood pressure drop, with symptoms, suggests POTS. It needs no equipment beyond a cuff and a clock.",
  "https://doi.org/10.1016/j.hrthm.2015.03.029"),
 ("bs7", "Nutrition and obesity", "A woman with a BMI of 41 is newly breathless. What does the evidence on weight bias warn about?",
  ["Larger patients exaggerate symptoms", "Clinicians spend less time, and symptoms get put down to weight before they're assessed", "Weight loss always fixes breathlessness", "Examination is pointless in larger bodies"], 1,
  "Weight stigma shortens consults, delays tests and keeps people away from care. Assess breathlessness the same way you would in anyone: think PE, heart failure, anaemia and asthma before ‘lose weight’.",
  "https://doi.org/10.1111/obr.12266"),
 ("bs8", "Men's health", "A 45-year-old man is angry, drinking more and working 70-hour weeks. He denies feeling sad. What might you be missing?",
  ["Nothing: he just needs to cut back", "Depression, which in men often shows as anger, irritability, risk-taking and drinking", "A personality disorder", "Low testosterone, for sure"], 1,
  "When anger, aggression, substance use and risk-taking are counted, men report depression about as often as women. Ask about mood, sleep and suicide directly.",
  "https://doi.org/10.1001/jamapsychiatry.2013.1985"),
 ("bs9", "Aboriginal and Torres Strait Islander health", "From what age does the Australian CVD risk guideline recommend cardiovascular risk assessment for First Nations people?",
  ["30", "45", "60", "Only with symptoms"], 0,
  "From age 30 for First Nations people (45 for most others), because heart disease starts earlier. Assume nothing; offer it to everyone eligible.",
  "https://www.cvdcheck.org.au/"),
 ("bs10", "Gastro and liver", "A 24-year-old woman has bloating and loose stools. Her last GP said ‘IBS’. What should come before that label?",
  ["Nothing: IBS is a clinical diagnosis", "Coeliac serology while she's still eating gluten, plus a blood count", "A low-FODMAP diet first", "Colonoscopy for everyone"], 1,
  "Guidelines say test for coeliac disease before diagnosing IBS. It's common, mostly in women, and it's missed for years. A gluten-free trial before testing makes the test unreliable.",
  "https://www.nice.org.uk/guidance/cg61"),
 ("bs11", "Quality and safety", "The notes say ‘anxious, frequent attender’. She's back with the same symptom for the third time. Best mindset?",
  ["Same as last time: reassure", "Treat the bounce-back as a red flag and ask ‘what else could this be?’", "Book a longer gap before she's seen again", "Refer to psychology"], 1,
  "Anchoring and premature closure are among the commonest causes of missed diagnosis. A patient returning with the same problem is telling you the first answer didn't fit.",
  "https://doi.org/10.1097/00001888-200308000-00003"),
 ("bs12", "Pain", "In an emergency department study of acute abdominal pain, compared with men, women were…",
  ["Equally likely to get pain relief", "Less likely to get opioid pain relief, and waited longer for it", "More likely to get opioids", "Seen faster"], 1,
  "Same pain scores, less treatment and longer waits. Treat the pain that's reported, not the patient you assume is exaggerating.",
  "https://doi.org/10.1111/j.1553-2712.2008.00100.x"),
 ("bs13", "Women's health", "A woman with a history of sexual assault needs a speculum exam. Trauma-informed approach?",
  ["Be quick so it's over sooner", "Explain each step, offer a chaperone, let her pause or stop any time, and offer choices such as self-insertion", "Avoid the exam altogether", "Only do it under sedation"], 1,
  "Safety, choice, collaboration, trust and empowerment. Asking permission at each step gives back control. Offer self-collected cervical screening if it suits her.",
  "https://blueknot.org.au/"),
 ("bs14", "Neurology", "When can a functional neurological disorder (FND) be diagnosed?",
  ["When the scans are normal", "When the patient seems stressed", "Only with positive signs on exam (e.g. Hoover's sign), after other causes have been properly considered", "When symptoms don't fit a textbook"], 2,
  "FND is a real, positive diagnosis, never just ‘tests normal’ or ‘stress’. It needs specific signs, and it can coexist with other neurological disease, so keep investigating new or changing symptoms.",
  "https://doi.org/10.1001/jamaneurol.2018.1264"),
]

def A(id, g, label, mn, text, key=False, flag=None, why=None, needs=None):
    a = {"id": id, "g": g, "label": label, "min": mn, "text": text}
    if key: a["key"] = True
    if flag: a["flag"] = flag
    if why: a["why"] = why
    if needs: a["needs"] = needs
    return a

C = [
 {"id": "dana", "room": "blind", "cu": "Cardiovascular", "name": "Dana", "age": 27,
  "who": "Childcare worker. Notes from another clinic: ‘anxiety, reassured’ (twice).",
  "blurb": "‘My anxiety again’",
  "opening": "\"I keep nearly fainting at work. Last doctor said it's anxiety, but I don't feel anxious.\"",
  "actions": [
   A("ice", "h", "Ideas, concerns, expectations", 2, "Worried she'll lose her job. Wants someone to take it seriously.", flag="ice"),
   A("hx", "h", "When does it happen?", 2, "Standing in queues, after hot showers, standing up fast. Heart races; better lying down. Brain fog and exhaustion after.", key=True, why="Symptoms on standing that ease lying down point to orthostatic intolerance."),
   A("hyper", "h", "Joints, gut, skin, family history", 2, "Very bendy since childhood, frequent sprains. Reflux and bloating. Mum ‘faints easily’.", why="Hypermobility and gut symptoms often travel with POTS."),
   A("else", "h", "\"Anything else?\"", 2, "\"Heavy periods. I'm tired all the time.\"", flag="else"),
   A("stand", "e", "Active stand test: lying, then standing HR and BP for 10 min", 4, "Lying: HR 68, BP 112/70. Standing at 10 min: HR 112, BP 110/74. Dizzy, legs mottled.", key=True, why="A sustained rise of 30+ beats without a BP drop, with symptoms: consistent with POTS."),
   A("ecg", "t", "ECG", 2, "Sinus rhythm, normal intervals.", key=True, why="Rule out a heart rhythm cause before naming POTS."),
   A("bloods", "t", "Full blood count, ferritin, TSH, electrolytes", 1, "Haemoglobin 118, ferritin 9. TSH and electrolytes normal.", key=True, why="Iron deficiency and thyroid disease mimic and worsen POTS."),
   A("psych", "t", "Refer to psychology for anxiety", 1, "Referred.", flag="low", why="She doesn't describe anxiety. Treating a guess delays the real diagnosis."),
  ],
  "dx": {"options": ["Anxiety disorder", "Probable POTS, with iron deficiency to treat", "Ventricular tachycardia", "Hyperthyroidism"], "answer": 1, "danger": [0]},
  "plan": {"options": ["Treat the iron deficiency and look for the cause (heavy periods)", "Fluids 2–3 L and extra salt (if no heart, kidney or BP problem), compression, slow position changes", "Recumbent exercise (rowing, recumbent bike, swimming), building up slowly", "Refer to a cardiologist or autonomic clinic", "Tell her it's anxiety and to try breathing exercises", "Explain POTS, validate the symptoms, and check she's understood"],
           "correct": [0, 1, 2, 3, 5], "danger": [4], "explain": 5, "critical": [0]},
  "safety": {"options": ["Urgent review or 000 for fainting with chest pain, on exertion, or with injury", "Nothing to worry about", "Come back if the anxiety gets worse", "Stop all fluids"], "answer": 0, "danger": [1, 3]},
  "pearl": "‘Anxiety’ isn't a diagnosis of exclusion you reach by not examining. A cuff, a clock and 10 minutes standing found the answer.",
  "sources": [{"t": "Sheldon RS et al. HRS consensus on POTS. Heart Rhythm 2015", "url": "https://doi.org/10.1016/j.hrthm.2015.03.029"}]},

 {"id": "lorraine", "room": "blind", "cu": "Cardiovascular", "name": "Lorraine", "age": 63, "critical": True,
  "criticalWhy": "A woman with diabetes and ‘indigestion’, sweating in the waiting room, may be having a heart attack.",
  "who": "Type 2 diabetes. Reception wrote: ‘indigestion, probably stress, not urgent’.",
  "blurb": "Indigestion. ‘Probably stress.’",
  "opening": "\"I feel silly. It's just indigestion, and I'm so tired.\"",
  "actions": [
   A("ice", "h", "Ideas, concerns, expectations", 2, "Thinks it's the curry. Doesn't want a fuss.", flag="ice"),
   A("sx", "h", "Characterise it: when, where, what with", 2, "Started 2 hours ago. Heavy feeling high in the belly, aching jaw and between the shoulders. Nauseous, vomited once.", key=True, why="Atypical sites and nausea are common heart attack symptoms in women and people with diabetes."),
   A("else", "h", "\"Anything else?\"", 1, "\"I'm sweating, which is odd.\"", flag="else"),
   A("obs", "e", "Pulse, BP, sats, look at her", 1, "Grey and clammy. Pulse 104, BP 152/92, sats 96%.", key=True),
   A("ecg", "t", "ECG", 2, "ST depression V4–V6.", key=True, why="Any unexplained ‘indigestion’ in a high-risk patient earns an ECG within 10 minutes."),
   A("ppi", "t", "Antacid trial and review tomorrow", 1, "Given.", flag="low", why="This delays a time-critical diagnosis."),
  ],
  "dx": {"options": ["Gastro-oesophageal reflux", "Acute coronary syndrome: call 000 now", "Anxiety", "Gallstones"], "answer": 1, "danger": [0, 2]},
  "plan": {"options": ["Call 000", "Aspirin 300 mg to chew (if not allergic)", "Monitor her and send the ECG with her", "Let her drive home and come back if worse", "Explain what's happening and check she's understood"],
           "correct": [0, 1, 2, 4], "danger": [3], "explain": 4, "critical": [0]},
  "safety": {"options": ["Stay with her until the ambulance arrives", "She can wait in the waiting room", "Book an echo next week", "Call her tomorrow"], "answer": 0, "danger": [1, 3]},
  "pearl": "About 1 in 3 heart attacks arrive without chest pain, more often in women, older people and people with diabetes. Reception's ‘probably stress’ is a label, not a triage.",
  "sources": [{"t": "Mehta LS et al. Acute MI in women: AHA scientific statement. Circulation 2016", "url": "https://doi.org/10.1161/CIR.0000000000000351"}]},

 {"id": "kezia", "room": "blind", "cu": "Women's health", "name": "Kezia", "age": 26,
  "who": "Uni student. Seen 4 times in 3 years for period pain. Told ‘normal’ and to take the pill.",
  "blurb": "‘Bad periods, again’",
  "opening": "\"Everyone says periods hurt. But I'm missing uni every month.\"",
  "actions": [
   A("ice", "h", "Ideas, concerns, expectations", 2, "Scared she's imagining it. Wants a name for it and to know about fertility.", flag="ice"),
   A("mhx", "h", "Pain pattern, sex, bowels, bladder", 3, "Pain starts before bleeding, 9/10. Pain with deep sex, painful bowel motions during periods.", key=True, why="Dysmenorrhoea plus deep dyspareunia and dyschezia strongly suggest endometriosis."),
   A("impact", "h", "Impact: work, study, relationships", 1, "Misses 2–3 days of uni a month. Avoids sex.", key=True, why="Impact on life matters more than how ‘normal’ the bleeding looks."),
   A("else", "h", "\"Anything else?\"", 2, "\"My sister has endometriosis.\"", flag="else"),
   A("consent", "e", "Pelvic exam: trauma-informed consent first", 3, "Explained; she agreed and knew she could stop. Tender, fixed retroverted uterus; nodularity behind the cervix.", key=True, flag="pc", why="Explain, ask, offer a chaperone and the right to stop."),
   A("preg", "t", "Pregnancy test and STI screen", 1, "Negative.", key=True),
   A("us", "t", "Pelvic ultrasound (ideally a specialised endometriosis scan)", 1, "Booked.", key=True, why="A normal standard ultrasound doesn't rule out endometriosis."),
  ],
  "dx": {"options": ["Normal period pain", "Probable endometriosis", "IBS", "Pelvic inflammatory disease"], "answer": 1, "danger": [0]},
  "plan": {"options": ["Regular NSAIDs starting before the period", "Hormonal treatment, e.g. continuous combined pill or a progestogen", "Refer to a gynaecologist with an interest in endometriosis", "Pelvic floor physio and pain support", "Tell her pain is normal and to toughen up", "Explain, believe her, and check she's understood"],
           "correct": [0, 1, 2, 3, 5], "danger": [4], "explain": 5, "critical": [2]},
  "safety": {"options": ["Review in 3 months; sudden severe pain or fever, go to ED", "No follow-up needed", "Come back when she wants a baby", "Only if bleeding stops"], "answer": 0, "danger": [1]},
  "pearl": "Average diagnostic delay in Australia is 6.5 years. Pain that stops life isn't normal, and a clinical diagnosis lets treatment start before surgery.",
  "sources": [{"t": "National Action Plan for Endometriosis", "url": "https://www.health.gov.au/resources/publications/national-action-plan-for-endometriosis"}]},

 {"id": "malcolm", "room": "blind", "cu": "Oncology", "name": "Malcolm", "age": 66,
  "who": "Notes say ‘chronic back pain, frequent attender’. Third visit this month.",
  "blurb": "Back again with his back",
  "opening": "\"Sorry, doc. The back again. Just need something stronger.\"",
  "actions": [
   A("ice", "h", "Ideas, concerns, expectations", 2, "Thinks he's a nuisance. Hasn't mentioned some things because ‘you're busy’.", flag="ice"),
   A("red", "h", "Red flags: night pain, weight, bladder, bowels, legs", 3, "Pain worse at night, lying down. Lost 6 kg. Legs feel heavy; a bit unsteady on the stairs.", key=True, why="New features in a ‘known’ back pain are the signal."),
   A("else", "h", "\"Anything else?\"", 2, "\"Getting up to wee a lot. Never had my prostate checked.\"", flag="else"),
   A("neuro", "e", "Leg neuro exam and spine", 3, "Brisk knee reflexes, upgoing toes, mild weakness in both legs. Tender mid-thoracic spine.", key=True, why="Upper motor neurone signs mean the problem is in the spinal cord."),
   A("psa", "t", "PSA, blood count, calcium, kidney function", 1, "PSA 240. Calcium 2.8.", key=True),
   A("opioid", "t", "Increase his opioid and review in 4 weeks", 1, "Done.", flag="low", why="Stronger painkillers mask a spinal emergency."),
  ],
  "dx": {"options": ["Chronic mechanical back pain", "Suspected metastatic spinal cord compression (likely prostate cancer)", "Opioid-seeking", "Muscle strain"], "answer": 1, "danger": [0, 2]},
  "plan": {"options": ["Same-day emergency referral for whole-spine MRI", "Lie flat and avoid weight bearing until assessed", "Discuss dexamethasone with the on-call team", "Explain what's suspected, and check he's understood", "Review in 4 weeks"],
           "correct": [0, 1, 2, 3], "danger": [4], "explain": 3, "critical": [0]},
  "safety": {"options": ["Go now; call 000 if legs get weaker or he can't pass urine", "Rest at home", "Come back next week", "Physio first"], "answer": 0, "danger": [1, 2]},
  "pearl": "‘Frequent attender’ is a label that stops thinking. A patient who keeps coming back is telling you the first answer didn't fit.",
  "sources": [{"t": "NICE NG234: Spinal metastases and metastatic spinal cord compression", "url": "https://www.nice.org.uk/guidance/ng234"}]},
]

h = json.load(open(D + "huddle.json", encoding="utf-8")); have = {x["id"] for x in h}; n = 0
for (id, cu, q, opts, ans, why, src) in H:
    if id in have: continue
    h.append({"id": id, "room": "blind", "q": q, "options": opts, "answer": ans, "why": why, "source": src, "cu": cu}); n += 1
json.dump(h, open(D + "huddle.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
c = json.load(open(D + "cases.json", encoding="utf-8")); have = {x["id"] for x in c}; m = 0
for x in C:
    if x["id"] in have: continue
    c.append(x); m += 1
json.dump(c, open(D + "cases.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("added", n, "huddle,", m, "cases")
