#!/usr/bin/env python3
"""/tools/tiredwise/protocol/: Tiredwise treatment protocol for the overlap patient
(ME/CFS, POTS, MCAS, fibromyalgia, FND, chronic pain, neurodivergence, hypermobility, long COVID).
Clinician-facing, noindex, beta. Run: python3 _scripts/tiredwise_protocol.py"""
import os, re, html, json
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/"
E = html.escape
TODAY = "25 November 2026"

# ---- sources (checked 25 Nov 2026) ----
S = {
 "nice": ("NICE NG206. ME/CFS: diagnosis and management (2021)", "https://www.nice.org.uk/guidance/ng206"),
 "vernino": ("Vernino S et al. POTS: state of the science and clinical care (NIH consensus). Auton Neurosci 2021", "https://doi.org/10.1016/j.autneu.2021.102828"),
 "raj": ("Raj SR et al. Low-dose propranolol in POTS. Circulation 2009", "https://doi.org/10.1161/CIRCULATIONAHA.108.846501"),
 "taub": ("Taub PR et al. Ivabradine in hyperadrenergic POTS: crossover RCT (n=22). JACC 2021", "https://doi.org/10.1016/j.jacc.2020.12.029"),
 "ross": ("Ross AJ et al. Midodrine in neuropathic vs hyperadrenergic POTS: crossover RCT. Clin Sci 2014", "https://doi.org/10.1042/CS20130222"),
 "coffin": ("Coffin ST et al. Desmopressin acutely lowers heart rate in POTS. Heart Rhythm 2012", "https://pubmed.ncbi.nlm.nih.gov/22561596/"),
 "tvns": ("Stavrakis S et al. Ear (tragus) vagus nerve stimulation in POTS: sham RCT (n=26). JACC Clin Electrophysiol 2024", "https://doi.org/10.1016/j.jacep.2023.10.015"),
 "istand": ("Vernino S et al. IVIG for autoimmune POTS (iSTAND): RCT. Clin Auton Res 2024", "https://doi.org/10.1007/s10286-024-01020-9"),
 "pyr": ("Joseph P et al. Pyridostigmine and exercise capacity in ME/CFS: RCT. Chest 2022", "https://doi.org/10.1016/j.chest.2022.04.146"),
 "abil": ("Crosby LD et al. Off-label low-dose aripiprazole in ME/CFS: retrospective (n=101). J Transl Med 2021", "https://doi.org/10.1186/s12967-021-02721-9"),
 "ldnlc": ("Bonilla H et al. Low-dose naltrexone in long COVID: retrospective cohort. Int Immunopharmacol 2023", "https://doi.org/10.1016/j.intimp.2023.110966"),
 "ldnfm": ("Bruun KD et al. Low-dose naltrexone vs placebo in fibromyalgia: RCT. Lancet Rheumatol 2024", "https://pubmed.ncbi.nlm.nih.gov/38258677/"),
 "coq": ("Castro-Marrero J et al. CoQ10 plus NADH in ME/CFS: RCT (n=207). Nutrients 2021", "https://doi.org/10.3390/nu13082658"),
 "rtx": ("Fluge Ø et al. Rituximab in ME/CFS: RCT, no benefit. Ann Intern Med 2019", "https://doi.org/10.7326/M18-1451"),
 "vaucher": ("Vaucher P et al. Iron for fatigued non-anaemic women (ferritin <50): RCT. CMAJ 2012", "https://pubmed.ncbi.nlm.nih.gov/22777991/"),
 "eular": ("Macfarlane GJ et al. EULAR revised recommendations for fibromyalgia. Ann Rheum Dis 2017", "https://doi.org/10.1136/annrheumdis-2016-209724"),
 "taichi": ("Wang C et al. Tai chi vs aerobic exercise for fibromyalgia: RCT (n=226). BMJ 2018", "https://doi.org/10.1136/bmj.k851"),
 "ascia": ("ASCIA. Mast cell disorders (2025)", "https://www.allergy.org.au/images/stories/pospapers/ASCIA_HP_Mast_Cell_Disorders_2025.pdf"),
 "urt": ("Zuberbier T et al. International urticaria guideline (antihistamine up-dosing). Allergy 2022", "https://doi.org/10.1111/all.15090"),
 "p4fmd": ("Nielsen G et al. Specialist physiotherapy for functional motor disorder (Physio4FMD): RCT. Lancet Neurol 2024", "https://doi.org/10.1016/S1474-4422(24)00135-2"),
 "codes": ("Goldstein LH et al. CBT for dissociative seizures (CODES): RCT. Lancet Psychiatry 2020", "https://doi.org/10.1016/S2215-0366(20)30128-0"),
 "sfnivig": ("Gibbons CH et al. IVIG for antibody-positive small fibre neuropathy: pilot RCT. Muscle Nerve 2023", "https://doi.org/10.1002/mus.27745"),
 "hbot": ("Zilberman-Itskovich S et al. Hyperbaric oxygen in post-COVID condition: sham RCT (n=73). Sci Rep 2022", "https://doi.org/10.1038/s41598-022-15565-0"),
 "stoppasc": ("Geng LN et al. Nirmatrelvir–ritonavir for long COVID (STOP-PASC): RCT, no benefit. JAMA Intern Med 2024", "https://pubmed.ncbi.nlm.nih.gov/38848477/"),
 "covidout": ("Bramante CT et al. Metformin in acute COVID-19 and later long COVID (COVID-OUT). Lancet Infect Dis 2023", "https://pubmed.ncbi.nlm.nih.gov/37302406/"),
 "atlantis": ("Ford AC et al. Low-dose amitriptyline for IBS in primary care (ATLANTIS). Lancet 2023", "https://doi.org/10.1016/S0140-6736(23)01523-4"),
 "bc007": ("BC 007 in long COVID: phase 2 (n=119) unsuccessful. The Sick Times 2025", "https://thesicktimes.org/2025/07/22/berlin-cures-failed-long-covid-clinical-trial-yields-lessons-on-study-design"),
 "efg": ("Efgartigimod in post-COVID POTS: not clinically meaningful (2024)", "https://thepharmaletter.com/in-brief/brief-efgartigimod-in-pc-pots-is-not-clinically-meaningful"),
}

GR = {"A": ("A", "Strong: several good trials or a strong guideline"),
      "B": ("B", "Moderate: at least one decent RCT, or a guideline recommendation"),
      "C": ("C", "Emerging: small or crossover trials, cohorts, plausible mechanism"),
      "D": ("D", "Experimental: expert practice or case reports only"),
      "X": ("Avoid", "Tested and failed, or harm outweighs benefit")}

# item: (name, grade, tags, how, watch, sources)
# tags: "off" = off-label, "sp" = specialist-led, "aus" = availability note in 'how'
M = [
 dict(id="base", t="Foundations: everyone", ic="🧱",
  fit="Start here for every overlap patient, before or alongside any medicine. Most of the gains come from this layer.",
  items=[
   ("Pacing inside the energy envelope", "B", [], "Plan the day under the crash threshold. Break tasks up, rest before you need to, and count thinking, talking and sensory load as effort too.", "Push–crash cycles keep people stuck. Expect a plateau before improvement.", ["nice"]),
   ("No graded exercise therapy when PEM is present", "X", [], "Fixed, incremental exercise targets regardless of symptoms. Use symptom-led activity instead.", "Harm reported by patients; removed from NICE 2021.", ["nice"]),
   ("Heart-rate-guided pacing", "D", [], "A wearable alarm set roughly 15 beats above resting heart rate, or about 55% of (220 − age), as a rough guide to the crash zone.", "An estimate only. Beta-blockers and ivabradine blunt heart rate, so adjust or rely on symptoms.", []),
   ("Rest lying down", "D", [], "Recline or lie flat for rest breaks, especially with orthostatic symptoms. Sitting is not full rest.", "", []),
   ("Iron if ferritin is under 50 µg/L", "B", [], "Oral iron for 12 weeks, alternate days if gut upset (e.g. 60–100 mg elemental). IV iron if not tolerated or not absorbed.", "Fatigue improved in non-anaemic women with low ferritin. Recheck ferritin; stop when replete.", ["vaucher"]),
   ("Screen sleep properly", "A", [], "STOP-Bang and sleep study when apnoea is possible; CBT for insomnia, adapted to energy limits; fixed wake time.", "Sleep apnoea and insomnia are treatable drivers hiding in plain sight.", []),
   ("Medicine and substance review", "B", [], "Look for sedatives, anticholinergics, opioids, gabapentinoids, beta-blockers, alcohol and cannabis that add fatigue or brain fog.", "Deprescribing one item can beat adding three.", []),
   ("Treat mood and anxiety when present", "A", [], "Depression and anxiety are common alongside, not instead of, these conditions. Treat them on their own merits.", "Don’t let a mood diagnosis end the search for physical drivers.", []),
   ("Small, frequent meals", "D", [], "Smaller meals, fewer large carbohydrate loads, especially before standing tasks.", "Big meals pool blood in the gut and worsen orthostatic symptoms.", []),
   ("Practical supports", "B", [], "Work or study adjustments, disability and carer supports, written plans, and a named clinician to coordinate.", "Function and income protection matter as much as any drug.", []),
   ("Protect against re-infection", "C", [], "Up-to-date vaccines; plan for the next infection (rest early, avoid pushing through).", "Infections commonly trigger relapses.", []),
  ]),
 dict(id="pem", t="ME/CFS and post-exertional malaise", ic="🔋",
  fit="Delayed crash 12–72 hours after effort, unrefreshing sleep, brain fog, for 6 months or more (IOM 2015). Check with the Tiredwise workup tool.",
  items=[
   ("Pacing and activity diary", "B", [], "Track activity, symptoms and crashes for 2–4 weeks to find the envelope. Reduce to a stable baseline before any increase.", "", ["nice"]),
   ("CoQ10 200 mg + NADH 20 mg daily", "C", [], "Trial for 8–12 weeks.", "Two Spanish RCTs showed small fatigue gains. Cost adds up; stop if no change.", ["coq"]),
   ("Low-dose naltrexone (LDN)", "C", ["off"], "Compounded. Start 0.5–1.5 mg at night, increase by 0.5–1.5 mg every 1–2 weeks to 3–4.5 mg. Morning dosing if vivid dreams.", "No opioids at the same time. Early insomnia or headache. Evidence is mostly observational; placebo-controlled trials are under way.", ["ldnlc"]),
   ("Low-dose aripiprazole", "C", ["off"], "0.25–2 mg daily, usually as a compounded liquid or capsule. Start at 0.25–0.5 mg.", "About 3 in 4 reported benefit in a retrospective series, with no control group. Watch for akathisia, insomnia, weight gain and impulse-control changes.", ["abil"]),
   ("Pyridostigmine", "C", ["off"], "30 mg up to three times daily, increasing to 60 mg if tolerated.", "A single dose improved peak oxygen uptake in an invasive exercise RCT. Gut cramps and diarrhoea; caution with asthma and slow heart rate.", ["pyr"]),
   ("Stimulants or modafinil for cognitive fatigue", "D", ["off"], "Only in selected patients with stable pacing, at low doses.", "They mask the warning signs and invite push–crash. ADHD is a separate, stronger reason (see Neurodivergence).", []),
   ("Low-dose amitriptyline at night", "C", ["off"], "5–10 mg, increasing to 25 mg, 2 hours before bed, for sleep and pain.", "Morning hangover, dry mouth, constipation, faster heart rate (watch with POTS).", []),
   ("Rituximab", "X", [], "", "A large RCT showed no benefit, with more side effects.", ["rtx"]),
   ("Immunoadsorption, BC 007 and other antibody-targeted therapies", "X", ["sp"], "Trials only.", "Repeated failures in proper trials so far.", ["bc007", "efg"]),
  ]),
 dict(id="pots", t="POTS and orthostatic intolerance", ic="🫀",
  fit="Heart rate up 30+ (40+ if aged 12–19) within 10 minutes of standing, with symptoms for 3 months, and no orthostatic hypotension. Worse with heat, meals, showers and standing still.",
  items=[
   ("Fluids 2–3 L a day plus salt", "C", [], "Add salt to reach about 6–10 g a day (2.4–4 g sodium) if blood pressure and kidneys are normal. A 500 mL drink before getting up helps mornings.", "Avoid with hypertension, kidney disease or heart failure.", ["vernino"]),
   ("Compression", "C", [], "Waist-high 20–30 mmHg stockings, or an abdominal binder, on upright days.", "Calf-only stockings do little; the abdomen holds more blood.", ["vernino"]),
   ("Counter-manoeuvres and positioning", "C", [], "Leg crossing, muscle tensing, squatting when symptomatic; head of the bed raised 10–15 cm.", "", ["vernino"]),
   ("Recumbent exercise, within the envelope", "B", [], "Recumbent bike, rowing or swimming, building very slowly.", "Helps deconditioning in POTS, but with PEM only symptom-led activity is safe.", ["vernino"]),
   ("Low-dose propranolol", "B", ["off"], "10–20 mg up to three or four times daily.", "Low doses worked better than high doses. Avoid with asthma; can worsen fatigue or low mood.", ["raj"]),
   ("Ivabradine", "B", ["off"], "2.5 mg twice daily, up to 7.5 mg twice daily. Usually a private prescription for this use.", "Lowers heart rate without lowering blood pressure. Not in pregnancy (needs contraception); flashes of light in vision.", ["taub"]),
   ("Midodrine", "B", ["off"], "2.5 mg, increasing to 10 mg, three times daily while upright; last dose at least 4 hours before lying down.", "Best for low-resistance (neuropathic) POTS. Lying blood pressure can rise; scalp tingling; urinary retention.", ["ross"]),
   ("Fludrocortisone", "C", ["off"], "0.05–0.1 mg daily, up to 0.2 mg.", "Check potassium and blood pressure at 2 weeks. Headache, swelling.", ["vernino"]),
   ("Pyridostigmine", "C", ["off"], "30–60 mg up to three times daily.", "Useful when constipation is also a problem. Diarrhoea and cramps.", ["vernino"]),
   ("Desmopressin for bad days", "C", ["off"], "0.1–0.2 mg occasionally, not daily.", "Check sodium; restrict fluids that evening.", ["coffin"]),
   ("Clonidine or guanfacine for hyperadrenergic POTS", "D", ["off"], "Low doses at night, increasing slowly.", "Can drop blood pressure and add tiredness.", ["vernino"]),
   ("IV saline for flares", "C", ["sp"], "1–2 L for severe flares or before procedures.", "Short-term relief only. Avoid long-term lines and ports: clot and infection risk.", ["vernino"]),
   ("Ear vagus nerve stimulation", "C", ["off"], "Tragus clip stimulation, 1 hour daily (devices vary).", "A small sham-controlled trial lowered postural heart rise. Cheap and low risk; consumer devices aren’t standardised.", ["tvns"]),
   ("IVIG for ‘autoimmune POTS’", "X", ["sp"], "Trials only.", "The iSTAND RCT showed no benefit over albumin.", ["istand"]),
  ]),
 dict(id="mcas", t="Mast cell symptoms (MCAS)", ic="🌡️",
  fit="Episodes of flushing, hives, swelling, wheeze, cramps or low blood pressure in 2+ systems at once. Strict ASCIA 2025 criteria need a tryptase rise and a treatment response; many patients have mast-cell-type symptoms without meeting them. A structured treatment trial is still reasonable.",
  items=[
   ("Non-sedating H1 antihistamine", "B", ["off"], "Cetirizine 10 mg or fexofenadine 180 mg daily, up to twice daily; urticaria guidelines allow up to 4 times the standard dose.", "Judge after 4–6 weeks with a symptom diary.", ["urt", "ascia"]),
   ("Add an H2 blocker", "C", ["off"], "Famotidine 20 mg twice daily.", "Most useful for gut and flushing symptoms.", ["ascia"]),
   ("Montelukast", "C", ["off"], "10 mg at night.", "Neuropsychiatric warning: nightmares, mood change, suicidal thoughts. Ask about these at every review.", ["ascia"]),
   ("Oral ketotifen", "C", ["off"], "Compounded. 0.5–1 mg at night, up to 1–2 mg twice daily.", "Sedation and weight gain. The Australian product is eye drops only.", ["ascia"]),
   ("Oral sodium cromoglicate", "C", ["off", "sp"], "100–200 mg four times daily before meals and bed, via compounding or Special Access. Check availability.", "Gut symptoms respond best. Takes 4–6 weeks.", ["ascia"]),
   ("Trigger review", "C", [], "Heat, alcohol, friction, NSAIDs, opioids, stress, specific foods: a diary beats a blanket ban.", "", ["ascia"]),
   ("Low-histamine diet trial", "D", [], "4 weeks maximum, then reintroduce foods one at a time, ideally with a dietitian.", "Easily becomes over-restriction. Avoid with any history of disordered eating or ARFID.", []),
   ("Adrenaline autoinjector", "A", [], "If there has been anaphylaxis, with an action plan.", "", ["ascia"]),
   ("Omalizumab", "D", ["sp", "off"], "Immunologist only, for severe refractory cases.", "Case series only outside mastocytosis and urticaria.", ["ascia"]),
  ]),
 dict(id="pain", t="Fibromyalgia and widespread pain", ic="⚡",
  fit="Widespread pain for 3+ months (ACR 2016), with tiredness, sleep and thinking symptoms. Check for small fibre neuropathy, hypermobility and inflammatory disease.",
  items=[
   ("Explain it as nervous system sensitisation", "B", [], "Real pain from an over-amplified pain system, with known small-fibre and immune changes in some patients. It is not ‘in your head’.", "Validation itself lowers distress and improves engagement.", ["eular"]),
   ("Gentle movement: tai chi, hydrotherapy, walking", "A", [], "Exercise is the only ‘strong for’ EULAR recommendation. Tai chi matched or beat aerobic exercise in a 226-person RCT.", "If PEM is present, movement must be symptom-led and tiny to start.", ["eular", "taichi"]),
   ("CBT, ACT or pain psychology", "B", [], "For coping, sleep and mood: not as a cure for ‘wrong beliefs’.", "", ["eular"]),
   ("Low-dose amitriptyline", "B", ["off"], "5–25 mg at night.", "Sleep and pain. Watch heart rate with POTS.", ["eular"]),
   ("Duloxetine", "B", ["off"], "30 mg, increasing to 60 mg daily.", "Nausea early; helps mood too. Not with other serotonergic drugs without checking.", ["eular"]),
   ("Pregabalin", "B", ["off"], "25–75 mg at night, slowly up to 150 mg twice daily.", "Modest benefit. Dizziness, weight gain, dependence; worse brain fog for some.", ["eular"]),
   ("Low-dose naltrexone", "C", ["off"], "As in the ME/CFS section.", "The largest RCT (n=99) found no benefit over placebo; smaller earlier trials were positive. A fair trial if other options fail.", ["ldnfm"]),
   ("Strong opioids and tramadol long term", "X", [], "", "Little benefit, rising doses, worse sensitisation and fatigue.", ["eular"]),
  ]),
 dict(id="sfn", t="Burning pain and small fibre neuropathy", ic="🔥",
  fit="Burning, prickling or electric pain, often in feet and hands or patchy, with skin sensitivity, sweating or colour changes; nerve conduction studies are normal.",
  items=[
   ("Find a cause", "A", [], "HbA1c (or glucose tolerance), B12, coeliac serology, TSH, ANA and ENA, protein electrophoresis, alcohol history, and vitamin B6 level.", "Excess B6 from supplements and energy drinks causes neuropathy; Australia has had many cases.", []),
   ("Skin biopsy", "B", ["sp"], "Intra-epidermal nerve fibre density, via neurology.", "Limited availability; turns a vague label into an objective one.", []),
   ("Neuropathic pain medicines", "A", [], "Amitriptyline, duloxetine or pregabalin, as above.", "", []),
   ("Topical options", "C", [], "Lidocaine patches or cream; high-strength capsaicin in a pain clinic.", "", []),
   ("IVIG", "C", ["sp", "off"], "Neurology only, for antibody-positive or clearly autoimmune cases.", "Trials are small and mixed.", ["sfnivig"]),
  ]),
 dict(id="fnd", t="Functional neurological disorder (FND)", ic="🧠",
  fit="Weakness, tremor, gait change, seizures or sensory loss with positive signs of FND (e.g. Hoover’s sign, entrainment). A rule-in diagnosis, not a diagnosis of exclusion.",
  items=[
   ("Explain the diagnosis with the positive signs", "B", [], "Show the patient their own signs; name it as a problem of brain function, not damage and not ‘faking’. neurosymptoms.org is a good handout.", "A confident explanation is a treatment in itself.", []),
   ("FND-informed physiotherapy", "B", ["sp"], "Retraining automatic movement, attention diversion, self-management plan.", "Physio4FMD (n=355): no difference in physical function at 12 months vs community neuro physio, but more patients rated their symptoms better.", ["p4fmd"]),
   ("Psychological therapy (CBT-based)", "B", ["sp"], "Especially for dissociative (functional) seizures.", "CODES (n=368): seizure frequency not significantly lower, but less bothersome seizures and better function and quality of life.", ["codes"]),
   ("Treat the passengers", "B", [], "Pain, fatigue, sleep, dissociation, trauma and mood each need their own plan.", "", []),
   ("Anti-seizure medicines for functional seizures", "X", [], "", "No benefit for functional seizures; side effects and wasted time. Taper with a neurologist if epilepsy has been excluded.", []),
  ]),
 dict(id="nd", t="Neurodivergence (ADHD, autism)", ic="🧩",
  fit="Lifelong attention, sensory, social or routine differences. Common in this group, often undiagnosed in women and in adults, and it changes how symptoms show and which plans stick.",
  items=[
   ("Assess for ADHD and autism", "B", [], "ASRS screener for ADHD; referral for adult assessment where it would change care.", "Undiagnosed ADHD looks like fatigue and brain fog; autistic burnout looks like ME/CFS.", []),
   ("Treat ADHD", "A", [], "Stimulants or non-stimulants as per ADHD guidelines.", "Stimulants raise heart rate: check orthostatic vitals. Guanfacine lowers blood pressure, so caution with POTS.", []),
   ("Autistic burnout plan", "C", [], "Cut demands and sensory load, more recovery time, predictable routines, ‘spoons’ or energy accounting.", "Often mistaken for depression or ME/CFS; they can co-exist.", []),
   ("Sensory accommodations", "C", [], "Noise-cancelling headphones, lighting, clothing, quiet waiting rooms.", "Sensory load uses energy and can trigger crashes.", []),
   ("Melatonin for delayed sleep", "B", ["off"], "2 mg modified-release, 1–2 hours before the target bedtime.", "", []),
   ("Objective measures", "D", [], "Interoception can differ, so track heart rate, step counts and a simple 0–10 diary rather than recall.", "", []),
  ]),
 dict(id="hyp", t="Hypermobility (hEDS and hypermobility spectrum)", ic="🤸",
  fit="Beighton score 5+ (adults), joint instability, easy bruising, stretchy skin; often travels with POTS, MCAS, gut symptoms and pain.",
  items=[
   ("Slow strength and proprioception physio", "B", [], "Closed-chain strengthening, joint control, very gradual progression.", "Hypermobility-aware physio; slower if PEM.", []),
   ("OT and joint protection", "C", [], "Splints for specific tasks, pacing, aids.", "", []),
   ("Think twice before surgery for instability", "C", ["sp"], "Physio first; surgical outcomes are less predictable.", "", []),
   ("Screen for the overlaps", "C", [], "Orthostatic vitals, mast cell symptoms, gut motility, pelvic floor.", "", []),
  ]),
 dict(id="gut", t="Gut and bladder", ic="🫃",
  fit="Bloating, pain, altered bowel habit, early fullness or bladder pain, common in all of the above.",
  items=[
   ("Rule out coeliac and bile acid diarrhoea", "A", [], "Coeliac serology before any gluten-free trial; bile acid malabsorption if diarrhoea predominant.", "", []),
   ("Low-dose amitriptyline for IBS", "A", ["off"], "10 mg at night, up to 30 mg.", "Best for diarrhoea and pain; ATLANTIS showed benefit in primary care.", ["atlantis"]),
   ("Low-FODMAP diet with a dietitian", "B", [], "Short elimination, then structured reintroduction.", "Not without a dietitian if eating is already restricted.", []),
   ("Small meals for slow emptying", "C", [], "Smaller, lower-fat meals; liquids later in the day.", "Common with POTS.", []),
  ]),
 dict(id="lc", t="Long COVID specifics", ic="🦠",
  fit="Symptoms 3+ months after COVID-19 (NASEM 2024). Treat the components (PEM, POTS, MCAS, sleep, mood) as above.",
  items=[
   ("Hyperbaric oxygen", "C", ["sp", "off"], "40 sessions in a single-centre sham-controlled trial.", "Improved thinking, energy and pain in one small trial (n=73). Costly and not funded for this use in Australia.", ["hbot"]),
   ("Metformin during a new COVID infection", "B", ["off"], "In the COVID-OUT trial, 14 days of metformin started early lowered later long COVID by about 40%.", "Prevention for the next infection, not treatment of existing long COVID.", ["covidout"]),
   ("Paxlovid as a treatment for established long COVID", "X", [], "", "STOP-PASC: no benefit over placebo.", ["stoppasc"]),
  ]),
]

AVOID = [
 ("Graded exercise therapy with PEM", "NICE 2021 removed it; patient reports of harm."),
 ("Rituximab, IVIG, immunoadsorption or antibody therapies outside trials", "Repeated null trials."),
 ("Long-term opioids and benzodiazepines", "Tolerance, sensitisation, dependence, worse fatigue."),
 ("Unvalidated tests", "IgG food panels, urine mycotoxins, provoked heavy-metal tests, private ‘chronic Lyme’ panels. They create false diagnoses and costly, sometimes harmful treatment."),
 ("Chelation, ozone, stem cell clinics, high-dose IV vitamin drips", "No benefit shown; real risks."),
 ("Megadose supplements", "Especially vitamin B6 (neuropathy) and stacks of 10+ products with no tracking."),
 ("Permanent central lines for IV fluids", "Clot and infection risk."),
]

WATCH = [
 "Low-dose naltrexone RCTs in post-COVID fatigue (results due).",
 "Low-dose aripiprazole controlled trials in ME/CFS.",
 "DecodeME genetics: subgroups and drug targets in ME/CFS.",
 "Neuromodulation (ear vagus stimulation, transcranial stimulation) in POTS, FND and fibromyalgia.",
 "Biomarker-led subgrouping: small fibre, autoantibody, mast cell and mitochondrial phenotypes.",
]

GRC = {"A": "a", "B": "b", "C": "c", "D": "d", "X": "x"}

def item_html(mid, n, it):
    name, g, tags, how, watch, src = it
    iid = "%s-%d" % (mid, n)
    tg = "".join('<span class="pt-tag %s">%s</span>' % (t, {"off": "Off-label", "sp": "Specialist"}[t]) for t in tags)
    srcs = " ".join('<a href="%s" rel="noopener">[%d]</a>' % (S[k][1], KEYS.index(k) + 1) for k in src)
    chk = '' if g == "X" else '<label class="pt-add"><input type="checkbox" data-id="%s"> Plan</label>' % iid
    return ('<li class="pt-i g%s" data-g="%s"><div class="pt-h"><span class="pt-g %s" title="%s">%s</span><b>%s</b>%s%s</div>'
            '%s%s%s</li>') % (g, g, GRC[g], E(GR[g][1]), GR[g][0], E(name), tg, chk,
            ('<p class="pt-how">%s</p>' % E(how)) if how else "",
            ('<p class="pt-w">%s</p>' % E(watch)) if watch else "",
            ('<p class="pt-s">%s</p>' % srcs) if srcs else "")

KEYS = []
for m in M:
    for it in m["items"]:
        for k in it[5]:
            if k not in KEYS: KEYS.append(k)
for k in S:
    if k not in KEYS: KEYS.append(k)
used = set(k for m in M for it in m["items"] for k in it[5])
KEYS = [k for k in KEYS if k in used]

chips = "".join('<label class="pt-chip"><input type="checkbox" value="%s" checked> %s %s</label>' % (m["id"], m["ic"], E(m["t"].split(" (")[0].split(":")[0])) for m in M)
mods = ""
for m in M:
    lis = "".join(item_html(m["id"], i, it) for i, it in enumerate(m["items"]))
    mods += ('<details class="card pt-m" id="m-%s" open><summary><span>%s %s</span><span class="res">%d</span></summary>'
             '<p class="pt-fit">%s</p><ul class="pt-l">%s</ul></details>\n') % (m["id"], m["ic"], E(m["t"]), len(m["items"]), E(m["fit"]), lis)
avoid = "".join("<li><b>%s.</b> %s</li>" % (E(a), E(b)) for a, b in AVOID)
watch = "".join("<li>%s</li>" % E(w) for w in WATCH)
refs = "".join('<li><a href="%s" rel="noopener">%s</a></li>' % (S[k][1], E(S[k][0])) for k in KEYS)
key = "".join('<li><span class="pt-g %s">%s</span> %s</li>' % (GRC[g], GR[g][0], E(GR[g][1])) for g in "ABCDX")
PLAN = {("%s-%d" % (m["id"], i)): ("%s: %s%s" % (m["t"].split(" (")[0], it[0], (" — " + it[3]) if it[3] else "")) for m in M for i, it in enumerate(m["items"])}

CSS = """<style>
#tw .pt-key{list-style:none;padding:0;margin:6px 0;display:grid;gap:4px;font-size:13.5px}
#tw .pt-g{display:inline-block;min-width:22px;text-align:center;font:700 12px var(--body);border-radius:6px;padding:2px 6px;margin-right:6px;vertical-align:1px}
#tw .pt-g.a{background:#DDF1E4;color:#1F6B3F}#tw .pt-g.b{background:#E4EEFB;color:#234E8C}#tw .pt-g.c{background:#FFF1CC;color:#7A5A00}#tw .pt-g.d{background:#F1E9FB;color:#5B3E91}#tw .pt-g.x{background:#FBE3DD;color:#8A2F1C}
html[data-theme="dark"] #tw .pt-g.a{background:#1E3A2A;color:#9BE3B8}html[data-theme="dark"] #tw .pt-g.b{background:#1E2D45;color:#A9C7F2}html[data-theme="dark"] #tw .pt-g.c{background:#3A3018;color:#F5D98A}html[data-theme="dark"] #tw .pt-g.d{background:#2E2440;color:#CDB8F2}html[data-theme="dark"] #tw .pt-g.x{background:#3E231C;color:#F0A898}
#tw .pt-chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
#tw .pt-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;padding:6px 11px;font-size:13.5px;background:var(--card);cursor:pointer}
#tw .pt-chip input{accent-color:#4A3480}
#tw .pt-l{list-style:none;padding:0;margin:6px 0 0}
#tw .pt-i{border-top:1px dashed var(--line);padding:9px 0}
#tw .pt-h{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;font-size:15px}
#tw .pt-h b{flex:1 1 55%}
#tw .pt-tag{font:600 11px var(--body);border:1px solid var(--line);border-radius:999px;padding:1px 7px;color:var(--muted)}
#tw .pt-tag.off{border-color:#EBCB78;color:#7A5A00}
#tw .pt-add{font-size:12.5px;color:var(--muted);display:inline-flex;gap:4px;align-items:center;cursor:pointer;margin-left:auto;white-space:nowrap}
#tw .pt-add input{width:18px;height:18px;accent-color:#4A3480}
#tw .pt-how{margin:4px 0 0;font-size:14.5px;line-height:1.5}
#tw .pt-w{margin:3px 0 0;font-size:13.5px;line-height:1.45;color:var(--muted)}
#tw .pt-s{margin:2px 0 0;font-size:12.5px}
#tw .pt-fit{font-size:14px;color:var(--muted);margin:6px 0 2px;line-height:1.5}
#tw .pt-i.gX b{text-decoration:line-through;text-decoration-color:#B23A1E80}
#tw.hide-low .pt-i.gC,#tw.hide-low .pt-i.gD{display:none}
#tw .pt-steps{counter-reset:s;list-style:none;padding:0;margin:8px 0}
#tw .pt-steps li{counter-increment:s;position:relative;padding:6px 0 6px 34px;font-size:14.5px;line-height:1.5}
#tw .pt-steps li::before{content:counter(s);position:absolute;left:0;top:6px;width:24px;height:24px;border-radius:50%;background:#4A3480;color:#fff;font:700 13px/24px var(--body);text-align:center}
#tw .pt-bar{position:sticky;bottom:10px;z-index:5;display:flex;gap:8px;align-items:center;justify-content:space-between;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:8px 10px;box-shadow:0 6px 20px rgba(0,0,0,.12);margin:14px 0}
#tw .pt-bar span{font-size:14px}
@media print{#tw .pt-bar,#tw .pt-chips,#tw .pt-add,#tw .pt-ctl{display:none!important}#tw details{display:block}}
</style>"""

MAIN = """<main class="wrap doc" id="tw">
<p class="meta"><a href="/tools/tiredwise/">Tiredwise</a> · Clinician protocol · for registered health professionals only <span class="beta">BETA</span></p>
<h1>Tiredwise protocol: what to try</h1>
<p class="lede">For the patient with overlapping ME/CFS, POTS, mast cell symptoms, fibromyalgia, FND, chronic pain and neurodivergence, who has fallen through the gaps. Proven options first, then the evolving ones, each graded so you and your patient can decide together.</p>
<div class="flags" role="note"><h2>Before you start</h2><p class="note" style="margin:0">Work through the red flags and criteria in the <a href="/tools/tiredwise/">Tiredwise workup</a> first. Overlap labels come after serious causes are excluded. Off-label use needs informed consent, documented reasoning and a stop rule.</p></div>

<h2>How to use it</h2>
<ol class="pt-steps">
<li><b>Name the phenotypes.</b> Most patients fit 2–4 modules below. Untick the ones that don’t apply.</li>
<li><b>Foundations first.</b> Pacing, sleep, iron, orthostatic basics and a medicine review help everyone.</li>
<li><b>One change at a time.</b> Start low, go slow: this group is often drug-sensitive. Change one thing every 2–4 weeks.</li>
<li><b>Measure it.</b> Pick 2–3 targets (e.g. hours upright, crash days per week, standing heart rate, 0–10 symptom score). Judge each trial at 4–8 weeks, then keep it or stop it.</li>
<li><b>Review the whole list every 3–6 months.</b> Stop what isn’t clearly helping. Recovery is often slow and uneven.</li>
</ol>

<h2>Evidence grades</h2>
<ul class="pt-key">""" + key + """</ul>
<p class="note">Doses are usual adult starting and target ranges for an Australian GP; check product information, interactions, pregnancy and kidney function. <b>Off-label</b> = not TGA-approved for this use. <b>Specialist</b> = start with or after specialist input.</p>

<div class="pt-ctl"><h2>Show modules</h2>
<div class="pt-chips" id="pt-chips">""" + chips + """</div>
<label class="pt-chip"><input type="checkbox" id="pt-low"> Hide emerging and experimental (C and D)</label></div>

""" + mods + """
<details class="card" open><summary><span>🚫 Don’t: tested and failed, or harmful</span></summary><ul class="tight">""" + avoid + """</ul></details>
<details class="card"><summary><span>🔭 Watch this space</span></summary><ul class="tight">""" + watch + """</ul><p class="note">The <a href="/research/">Research hub</a> lists Australian trials that are recruiting.</p></details>

<div class="pt-bar" id="pt-bar" hidden><span id="pt-n">0 in plan</span><span style="display:flex;gap:8px"><button class="btn ghost" type="button" id="pt-clr">Clear</button><button class="btn" type="button" id="pt-cpy">Copy plan</button></span></div>
<div id="pt-out" hidden><h2>Plan</h2><div id="tw-sum"></div></div>

<h2>Sources</h2>
<ol class="tight" style="font-size:13px">""" + refs + """</ol>
<p class="meta">Beta. Built from guidelines (NICE NG206, EULAR 2017, ASCIA 2025, NIH POTS consensus 2021) and trials, with the strength of each shown. It supports, and never replaces, clinical judgement. Updated """ + TODAY + """. General education for health professionals; not a substitute for clinical judgement or local protocols.</p>
</main>
<script>
(function () {
  "use strict";
  var PLAN = """ + json.dumps(PLAN, ensure_ascii=False) + """;
  var tw = document.getElementById("tw");
  function mods() {
    Array.prototype.forEach.call(document.querySelectorAll("#pt-chips input"), function (c) {
      var m = document.getElementById("m-" + c.value); if (m) m.hidden = !c.checked;
    });
  }
  document.getElementById("pt-chips").addEventListener("change", mods);
  document.getElementById("pt-low").addEventListener("change", function () { tw.classList.toggle("hide-low", this.checked); });
  function picked() { return Array.prototype.filter.call(document.querySelectorAll(".pt-add input"), function (c) { return c.checked; }).map(function (c) { return c.getAttribute("data-id"); }); }
  function text() {
    var ids = picked();
    return "Tiredwise plan (" + new Date().toLocaleDateString("en-AU") + ")\\n" + ids.map(function (id, i) { return (i + 1) + ". " + PLAN[id]; }).join("\\n") +
      "\\n\\nOne change at a time. Review each trial at 4–8 weeks against agreed targets. Off-label items discussed and consented.";
  }
  function upd() {
    var n = picked().length, bar = document.getElementById("pt-bar"), out = document.getElementById("pt-out");
    bar.hidden = !n; out.hidden = !n;
    document.getElementById("pt-n").textContent = n + " in plan";
    document.getElementById("tw-sum").textContent = n ? text() : "";
  }
  tw.addEventListener("change", function (e) { if (e.target.closest(".pt-add")) upd(); });
  document.getElementById("pt-clr").onclick = function () { Array.prototype.forEach.call(document.querySelectorAll(".pt-add input"), function (c) { c.checked = false; }); upd(); };
  document.getElementById("pt-cpy").onclick = function () {
    var b = this, t = text();
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy plan"; }, 1500); }, function () { b.textContent = "Select the plan below"; });
  };
})();
</script>
<script defer src="/assets/boot.js?v=1" data-mw="page"></script>
</body>
</html>
"""

TPL = open(ROOT + "tools/tiredwise/index.html", encoding="utf-8").read()
HEAD = TPL[:TPL.index("</head>")]
HEAD = re.sub(r'<script type="application/ld\+json".*?</script>\n?', "", HEAD, flags=re.S)
title = "Tiredwise protocol: treatments to try for ME/CFS, POTS, MCAS and fibromyalgia overlap"
desc = "A graded clinician protocol for the overlap patient: pacing, POTS, mast cell, pain, FND and neurodivergence options, from proven to emerging off-label."
url = "https://maladywise.com/tools/tiredwise/protocol/"
h = HEAD.replace('href="https://maladywise.com/tools/tiredwise/"', 'href="%s"' % url)
h = re.sub(r"<title>.*?</title>", "<title>%s</title>" % E(title), h)
for a in ('<meta name="description" content="', '<meta property="og:description" content="'):
    h = re.sub(r"(%s)[^\"]*" % re.escape(a), lambda m: m.group(1) + E(desc), h)
h = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + E(title), h)
h = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + url, h)
ld = '<script type="application/ld+json" id="mw-page-ld">%s</script>\n' % json.dumps({"@context": "https://schema.org", "@type": "MedicalWebPage", "name": title, "audience": {"@type": "MedicalAudience", "audienceType": "Clinician"}, "inLanguage": "en-AU", "url": url})
body_open = TPL[TPL.index("</head>"):TPL.index("<main")]
out = h + CSS + "\n" + ld + body_open + MAIN
os.makedirs(ROOT + "tools/tiredwise/protocol", exist_ok=True)
open(ROOT + "tools/tiredwise/protocol/index.html", "w", encoding="utf-8").write(out)
print("protocol built:", sum(len(m["items"]) for m in M), "items,", len(KEYS), "sources")
