# ME/CFS and long COVID treatment algorithm (clinician). Run with _scripts/gen_sheets.py
G = {"A": ("s", "A · Strong"), "B": ("m", "B · Moderate"), "C": ("l", "C · Weak / mixed"), "D": ("l", "D · Anecdotal or mechanistic"), "X": ("n", "X · Avoid")}

def opts(items):
    out = '<ol class="tx ladder">'
    for gr, name, what, ev, how, watch in items:
        c, lab = G[gr]
        out += ('<li><span class="ev %s">%s</span><b>%s</b>%s<dl><dt>Evidence</dt><dd>%s</dd><dt>How</dt><dd>%s</dd><dt>Watch for</dt><dd>%s</dd></dl></li>'
                % (c, lab, name, what, ev, how, watch))
    return out + "</ol>\n"

def sec(t, intro, items):
    return "<h2>%s</h2>\n<p class=\"evkey\">%s</p>\n%s" % (t, intro, opts(items))

body = '''<p class="drug-tags"><span class="ev m">For health professionals</span> <span class="ev m">General practice</span></p>
<p class="lede">A practical, evidence-graded path for adults with ME/CFS or long COVID: confirm and exclude, protect the energy envelope, then treat the dominant symptom clusters. Options run from guideline-backed to anecdotal but worth a careful trial in selected patients. No treatment is TGA-approved for either condition.</p>
<h2>At a glance</h2>
<div class="glance"><ul>
<li><b>First, do no harm:</b> screen every patient for post-exertional malaise (PEM). If present, avoid fixed graded exercise; pace instead.</li>
<li><b>Exclude the treatables:</b> anaemia, iron deficiency, thyroid, coeliac, sleep apnoea, depression, medicines, POTS. One afternoon of bloods and a 10-minute stand test.</li>
<li><b>Treat by cluster:</b> orthostatic intolerance, sleep, pain, cognition, breathing, smell, mast-cell-type symptoms, gut.</li>
<li><b>One change at a time,</b> start low, review at 4–8 weeks with the same outcome measures, and stop what doesn’t help.</li>
<li><b>Severe and very severe ME/CFS</b> (housebound or bedbound) need home visits, sensory reduction and careful nutrition, not clinic-style plans.</li>
</ul>
<p class="sass">Most of what helps is unglamorous: pacing, salt and fluids, sleep, and stopping the things that make it worse.</p></div>
<p class="callout"><b>Evidence grades used here.</b> <b>A</b> strong: guidelines plus consistent randomised trials. <b>B</b> moderate: at least one decent RCT or strong evidence in a closely related condition. <b>C</b> weak or mixed: small or conflicting trials. <b>D</b> anecdotal or mechanistic: case series or expert experience; a reasonable trial in selected patients with clear stop rules. <b>X</b> avoid: harmful or shown not to work.</p>

<h2>Step 0 · Confirm and exclude</h2>
<ul>
<li><b>ME/CFS</b> (NICE 2021; IOM 2015): substantially reduced activity with debilitating fatigue for at least 3 months (NICE suspects it at 6 weeks and diagnoses at 3 months; IOM uses 6 months), PEM, unrefreshing sleep, plus cognitive problems and/or orthostatic intolerance.</li>
<li><b>Long COVID</b> (WHO): symptoms 3 months after probable or confirmed COVID-19, lasting at least 2 months, not explained by another diagnosis. Many meet ME/CFS criteria; many don’t.</li>
<li><b>Screen for PEM:</b> “What happens the day after you do more than usual?” Delayed worsening (12–72 hours) lasting days is the key feature. The DePaul Symptom Questionnaire PEM items help.</li>
<li><b>Baseline tests:</b> FBC, iron studies (ferritin), B12, folate, UEC, LFT, calcium, glucose or HbA1c, TSH, CRP or ESR, CK, coeliac serology, vitamin D, urinalysis. Consider morning cortisol, HIV, hepatitis and syphilis by risk, pregnancy test, and ECG.</li>
<li><b>Bedside:</b> 10-minute active stand test (lying then standing heart rate and BP), STOP-BANG for sleep apnoea, PHQ-9 and GAD-7, medication review (sedatives, beta blockers, antihistamines, opioids).</li>
<li><b>Red flags needing other workup:</b> weight loss, fevers or night sweats, focal neurology, chest pain, haemoptysis, persistent lymphadenopathy, desaturation on exertion, abnormal bloods.</li>
<li><b>Long COVID specifics:</b> exertional breathlessness or desaturation needs a chest X-ray and lung function; chest pain or palpitations need ECG ± troponin and echo; consider pulmonary embolism, myocarditis, new diabetes and thyroiditis.</li>
</ul>
''' + sec("Step 1 · Core management for everyone", "These apply whatever the cluster. They carry the most consensus and the least risk.", [
 ("B", "Education, validation and a diagnosis", "Name it, explain PEM and the energy envelope, and set realistic goals. Being believed is itself therapeutic.", "Guideline consensus (NICE 2021, CDC, WHO); strong patient-reported benefit", "Plain-language handout (/me/, /long-covid/); a named GP; a written plan", "Language that implies laziness or “just anxiety”."),
 ("B", "Pacing within the energy envelope", "Plan, prioritise and break up activity; rest before crashing; stay within what’s sustainable on a bad day.", "Recommended by NICE 2021 and most patient bodies; trial evidence is limited, but harm from boom-bust cycles is well described", "Activity diary, heart rate monitor (some aim to stay under about 55–60% of age-predicted maximum), step counts, scheduled rests", "Pacing that becomes avoidance of all activity in people without PEM."),
 ("B", "Symptom-titrated activity (only if no PEM)", "Long COVID without PEM: gentle, gradual rehab, adjusted to symptoms rather than fixed increments.", "Rehabilitation trials in long COVID show benefit in people without PEM", "Physio or exercise physiologist; recumbent options first if orthostatic", "Any delayed crash: drop back and reassess for PEM."),
 ("X", "Graded exercise therapy with fixed increments (in ME/CFS)", "Pushing through symptoms on a fixed schedule.", "NICE 2021 advises against it; surveys report harm in many patients with PEM", "Don’t", "If used historically, ask about relapse."),
 ("B", "CBT as support, not cure", "For coping, distress, sleep and mood. Not to “change illness beliefs” or as a cure.", "Helps distress and coping (NICE 2021 supports this framing)", "Psychologist via a GP Mental Health Treatment Plan", "Programs that promise recovery through thinking differently."),
 ("A", "Treat what’s treatable", "Iron if ferritin is low, B12 or vitamin D if deficient, thyroid, CPAP for sleep apnoea, depression, anaemia.", "Strong evidence for each underlying condition", "Usual treatment; recheck in 3 months", "Over-replacement (iron overload, high-dose vitamin D)."),
 ("B", "Practical supports", "Workplace or study adjustments, carers, mobility aids, disability and income support.", "Consensus; large real-world impact", "Letters for work or uni, Centrelink, NDIS for severe long-term disability, aids such as shower chairs and wheelchairs for longer trips", "Under-recognising how disabling severe ME/CFS is.")]) + sec("Step 2a · Orthostatic intolerance and POTS", "Common in both. Check a 10-minute stand test. See the POTS deep dive for detail.", [
 ("B", "Fluids, salt and compression", "2–3 L of fluid a day, extra salt where safe, waist-high or abdominal compression.", "Physiological rationale and small trials; guideline-recommended for POTS", "Salt tablets or electrolyte drinks; bolus 500 mL water before getting up", "Hypertension, kidney or heart disease."),
 ("C", "Low-dose propranolol", "Blunts the standing heart rate.", "Small RCT: low dose (10 mg) improved symptoms more than higher dose (Raj 2009)", "10 mg once or twice daily", "Asthma, low BP, fatigue, low mood."),
 ("C", "Ivabradine", "Slows the sinus node without lowering BP.", "Small trials lowered heart rate; a larger RCT lowered heart rate but didn’t improve symptoms", "2.5–5 mg twice daily (off label)", "Visual phosphenes, bradycardia; contraception needed."),
 ("C", "Fludrocortisone or midodrine", "Expand volume or tighten vessels for low-BP-type symptoms.", "Small studies, mostly in orthostatic hypotension or POTS", "Fludrocortisone 50–100 µg; midodrine 2.5–10 mg three times daily, not within 4 hours of bed", "Low potassium, oedema, supine hypertension."),
 ("D", "Pyridostigmine", "Boosts autonomic signalling.", "Case series and small studies", "30 mg twice to three times daily, titrate", "Cramps, diarrhoea, increased secretions.")]) + sec("Step 2b · Sleep", "Unrefreshing sleep is near-universal. Treat sleep disorders first.", [
 ("A", "Exclude and treat sleep apnoea and restless legs", "STOP-BANG, sleep study if indicated; ferritin for restless legs.", "Strong evidence for CPAP and iron in RLS", "Home sleep study; iron if ferritin under about 75", "Sedatives worsening untreated apnoea."),
 ("B", "Regular sleep window and adapted CBT-I", "Fixed wake time, wind-down routine, limit long daytime naps but allow planned rest.", "CBT-I is first line for insomnia; strict sleep restriction may need adapting in ME/CFS", "Psychologist or online CBT-I programs", "Over-strict sleep restriction triggering crashes."),
 ("C", "Melatonin", "For delayed sleep onset.", "Helps sleep onset in general populations; small studies in ME/CFS", "1–2 mg 1–2 hours before bed", "Morning grogginess."),
 ("C", "Low-dose amitriptyline", "When sleep and pain coexist.", "Good evidence in fibromyalgia for sleep and pain; small effects", "5–10 mg at night, up to 25–30 mg", "Morning hangover, dry mouth, constipation, orthostatic worsening.")]) + sec("Step 2c · Pain", "Myalgia, headache and neuropathic-type pain overlap with fibromyalgia. Borrow fibromyalgia evidence.", [
 ("B", "Duloxetine or amitriptyline", "Central pain modulation.", "Moderate evidence in fibromyalgia (Cochrane); benefit for a minority", "Duloxetine 30 mg, then 60 mg; amitriptyline as above", "Nausea, sweating, orthostatic effects."),
 ("C", "Pregabalin", "For neuropathic-type pain.", "Modest benefit in fibromyalgia; frequent side effects", "Start 25–75 mg at night", "Dizziness, sedation, weight gain, cognitive dulling; misuse."),
 ("C", "Low-dose naltrexone (LDN)", "Thought to modulate microglia and pain signalling.", "Small RCTs in fibromyalgia (mixed, mostly small benefit); open-label long COVID studies positive; larger RCTs under way", "Compounded 1.5 mg at night, rising to 3–4.5 mg over weeks", "Vivid dreams, insomnia; not with opioids."),
 ("X", "Opioids for chronic symptoms", "Long-term opioids for widespread pain.", "No benefit for central pain; risks of dependence and worse pain", "Avoid", "")]) + sec("Step 2d · Cognition (“brain fog”)", "Pace cognitive load like physical load.", [
 ("B", "Cognitive pacing and aids", "Short tasks, breaks, lists, alarms, reduced multitasking.", "Consensus and occupational therapy experience", "OT; written plans; quiet workspace", ""),
 ("D", "Guanfacine plus N-acetylcysteine", "Prefrontal noradrenergic support plus antioxidant.", "Case series in long COVID brain fog (Yale, 2023)", "Guanfacine 1 mg at night, rising to 2 mg; NAC 600 mg daily", "Low BP, sedation."),
 ("D", "Stimulants or modafinil", "For marked fatigue or cognitive slowing.", "Small, mixed trials in ME/CFS; may cause crashes by masking limits", "Low dose, cautious trial with clear goals", "Overdoing it then crashing; insomnia; misuse."),
 ("D", "Low-dose aripiprazole", "Proposed to modulate neuroinflammation.", "Retrospective series only (Crosby 2021)", "0.25–2 mg daily", "Akathisia, insomnia.")]) + sec("Step 2e · Mast-cell-type symptoms", "Flushing, itch, hives, food reactions, gut upset, palpitations. Don’t label MCAS without evidence; treat symptoms.", [
 ("D", "H1 plus H2 antihistamines", "e.g. fexofenadine or cetirizine plus famotidine.", "Observational long COVID reports of improvement (Glynne 2022); no RCTs", "Fexofenadine 180 mg daily (up to twice daily) plus famotidine 20 mg twice daily; trial 4–6 weeks", "Sedation (cetirizine), headache."),
 ("D", "Ketotifen or sodium cromoglycate", "Mast-cell stabilisers.", "Small studies in mastocytosis; anecdotal in long COVID", "Specialist or compounded", "Weight gain, sedation (ketotifen)."),
 ("D", "Quercetin", "Flavonoid with mast-cell-stabilising effects in the lab.", "Mechanistic and small studies only", "500 mg daily or twice daily", "Interactions; liver.")]) + sec("Step 2f · Breathing and smell (long COVID)", "", [
 ("B", "Breathing retraining", "For dysfunctional breathing: nasal, slow, diaphragmatic.", "Physiotherapy evidence in dysfunctional breathing; long COVID pilot trials", "Respiratory physio", "Exclude PE, lung and heart causes first."),
 ("B", "Olfactory training", "Sniff 4 strong scents twice a day for 3–6 months.", "Supported by meta-analyses in post-viral smell loss", "Rose, lemon, clove, eucalyptus", "Parosmia can be distressing; persist."),
 ("C", "Steroid nasal spray or rinse", "For smell loss with nasal inflammation.", "Mixed evidence", "Mometasone daily; budesonide rinse via specialist", "")]) + sec("Step 2g · Gut", "Many have IBS-type symptoms, reflux or nausea.", [
 ("B", "Treat as for IBS or functional dyspepsia", "Soluble fibre, low-FODMAP with a dietitian, antispasmodics, gut-brain modulators.", "Strong evidence in IBS; extrapolated", "See /ibs/", "Weight loss or restrictive eating in severe illness.")]) + sec("Step 3 · Specialist, experimental or emerging", "For selected patients, ideally in trials or with specialist input.", [
 ("C", "Hyperbaric oxygen (long COVID)", "High-pressure oxygen sessions.", "One sham-controlled RCT (Israel, 2022) improved cognition and energy; needs replication", "40 sessions in specialist centres; costly", "Ear barotrauma; cost; access."),
 ("C", "Coenzyme Q10 with NADH", "Mitochondrial support.", "One small RCT in ME/CFS showed modest fatigue benefit; a long COVID CoQ10 RCT was negative", "CoQ10 200 mg + NADH 20 mg daily", "Cost; interactions with warfarin."),
 ("D", "Stellate ganglion block", "Proposed to reset autonomic signalling.", "Case series; controlled data lacking", "Interventional pain specialist", "Procedural risks, cost."),
 ("D", "Immunoadsorption, IVIG, other immunotherapies", "For suspected autoimmunity.", "Small or negative trials; experimental", "Trials only", "Cost, risk."),
 ("B", "Metformin during acute COVID (prevention)", "Taken for 2 weeks during acute infection.", "COVID-OUT RCT: about 41% fewer long COVID diagnoses in overweight or obese adults", "500 mg, titrated to 1,500 mg daily for 14 days (off label)", "Gut upset; not for long COVID once established."),
 ("X", "Rituximab", "B-cell depletion.", "Large RCT (RituxME, 2019) showed no benefit in ME/CFS", "Avoid", ""),
 ("X", "Extended Paxlovid for established long COVID", "15–25-day courses.", "RCTs (STOP-PASC, others) showed no benefit", "Avoid outside trials", ""),
 ("X", "Unproven clinics", "Stem cells, IV vitamin infusions, chelation, ozone, “detox”.", "No evidence; cost and harm", "Avoid", "")]) + '''
<h2>Severe and very severe ME/CFS</h2>
<ul>
<li>Home visits or telehealth; reduce light, noise and touch; short, planned contacts.</li>
<li>Watch nutrition and hydration, pressure care, bone health and orthostatic tolerance.</li>
<li>Admissions need a plan: quiet single room, minimal handling, a support person.</li>
<li>Coordinate care and disability support (NDIS, carers, equipment).</li>
</ul>
<h2>Measuring progress</h2>
<ul>
<li>Pick 2–3 measures and repeat them at each review: Bell CFS disability scale, daily steps or upright time, DePaul PEM frequency, a single 0–10 fatigue score, sleep quality.</li>
<li>Change one thing at a time; trial 4–8 weeks; stop what doesn’t help.</li>
<li>Expect fluctuation. Many people improve slowly; some recover, especially in long COVID.</li>
</ul>
<p class="callout"><b>For patients:</b> plain-English pages on <a href="/me/">ME/CFS</a>, <a href="/long-covid/">long COVID</a> and <a href="/pots/">POTS</a>.</p>
'''

page("/algorithms/me-cfs-long-covid/",
 "ME/CFS and Long COVID Treatment Algorithm (Evidence-Graded) for GPs",
 "A GP algorithm for ME/CFS and long COVID: diagnosis and exclusions, PEM and pacing, then evidence-graded options for orthostatic, sleep, pain, cognitive, mast-cell-type, breathing and gut symptoms.",
 "ME/CFS and Long COVID: Treatment Algorithm", "Myalgic encephalomyelitis/chronic fatigue syndrome", "Clinician guide",
 [("Malady Wise", "/"), ("For doctors", "/doctors/"), ("Algorithms", "/algorithms/"), ("ME/CFS and long COVID", "/algorithms/me-cfs-long-covid/")],
 body,
 [("Is graded exercise therapy recommended for ME/CFS?", "No. NICE (2021) advises against graded exercise therapy with fixed increments for ME/CFS. People without post-exertional malaise, including many with long COVID, may benefit from symptom-titrated rehabilitation."),
  ("What is the first step in managing ME/CFS or long COVID?", "Confirm the diagnosis, exclude treatable causes, screen for post-exertional malaise and teach pacing within the energy envelope. Then treat the dominant symptom clusters such as orthostatic intolerance, sleep and pain."),
  ("Is there a cure for long COVID?", "Not yet. Many people improve over time. Treatments target symptoms; several promising ideas are still in trials, and some (like extended Paxlovid and rituximab in ME/CFS) have not worked in RCTs.")],
 [("NICE NG206: ME/CFS diagnosis and management (2021)", "https://www.nice.org.uk/guidance/ng206"),
  ("WHO clinical case definition of post COVID-19 condition (2021)", "https://www.who.int/publications/i/item/WHO-2019-nCoV-Post_COVID-19_condition-Clinical_case_definition-2021.1"),
  ("Institute of Medicine: Beyond ME/CFS, redefining an illness (2015)", "https://nap.nationalacademies.org/catalog/19012"),
  ("Emerge Australia: resources for health professionals", "https://www.emerge.org.au/"),
  ("Raj SR et al. Propranolol decreases tachycardia and improves symptoms in POTS (Circulation 2009)", "https://pubmed.ncbi.nlm.nih.gov/19221218/"),
  ("Bramante CT et al. Outpatient treatment of COVID-19 and incidence of post-COVID-19 condition (COVID-OUT, Lancet Infect Dis 2023)", "https://pubmed.ncbi.nlm.nih.gov/37302406/"),
  ("Geng LN et al. Nirmatrelvir-ritonavir and symptoms in adults with post-COVID-19 condition (STOP-PASC, JAMA Intern Med 2024)", "https://pubmed.ncbi.nlm.nih.gov/38848477/"),
  ("Fluge Ø et al. B-lymphocyte depletion in ME/CFS (RituxME, Ann Intern Med 2019)", "https://pubmed.ncbi.nlm.nih.gov/30934066/"),
  ("Zilberman-Itskovich S et al. Hyperbaric oxygen therapy improves neurocognitive functions in post-COVID condition (Sci Rep 2022)", "https://pubmed.ncbi.nlm.nih.gov/35831319/"),
  ("Castro-Marrero J et al. CoQ10 plus NADH supplementation in ME/CFS (2016)", "https://pubmed.ncbi.nlm.nih.gov/?term=Castro-Marrero+coenzyme+Q10+NADH+chronic+fatigue"),
  ("Glynne P et al. Long COVID following mild SARS-CoV-2 infection: antihistamine response (2022)", "https://pubmed.ncbi.nlm.nih.gov/?term=Glynne+long+COVID+antihistamines"),
  ("Fesharaki-Zadeh A et al. Guanfacine and N-acetylcysteine for post-COVID cognitive deficits (2023)", "https://pubmed.ncbi.nlm.nih.gov/?term=guanfacine+N-acetylcysteine+COVID+cognitive"),
  ("Cochrane: Low-dose naltrexone and other evidence summaries (search)", "https://pubmed.ncbi.nlm.nih.gov/?term=low+dose+naltrexone+fibromyalgia+randomized")],
 [("ME/CFS (patient page)", "/me/"), ("Long COVID", "/long-covid/"), ("POTS deep dive", "/deep-dives/pots/"), ("Fibromyalgia", "/fibromyalgia/")])
