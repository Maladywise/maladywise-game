# ADHD / autism: late-diagnosis starter kit, strengths-first explainer for kids, clinician algorithms.
G = {"A": ("s", "A · Strong"), "B": ("m", "B · Moderate"), "C": ("l", "C · Weak / mixed"), "D": ("l", "D · Anecdotal or mechanistic"), "X": ("n", "X · Avoid")}
def opts(items):
    out = '<ol class="tx ladder">'
    for gr, name, what, ev, how, watch in items:
        c, lab = G[gr]
        out += ('<li><span class="ev %s">%s</span><b>%s</b>%s<dl><dt>Evidence</dt><dd>%s</dd><dt>How</dt><dd>%s</dd><dt>Watch for</dt><dd>%s</dd></dl></li>' % (c, lab, name, what, ev, how, watch))
    return out + "</ol>\n"
def sec(t, intro, items): return "<h2>%s</h2>\n<p class=\"evkey\">%s</p>\n%s" % (t, intro, opts(items))
CR = lambda last, url: [("Malady Wise", "/"), ("Conditions", "/conditions/"), (last, url)]

# ---------------- Late diagnosis starter kit ----------------
kit = '''<p class="lede">Diagnosed with ADHD, autism or both (AuDHD) as an adult? Welcome. You’re not broken, lazy or “too much”: you’ve been running a different operating system without the manual. Here’s the manual, or at least the quick-start guide.</p>
<div class="glance"><ul>
<li><b>First feelings are all valid:</b> relief, grief, anger at the lost years, imposter syndrome, all in the same afternoon.</li>
<li><b>Nothing has to change overnight.</b> The diagnosis is information, not a sentence.</li>
<li><b>ADHD has effective medicines;</b> autism doesn’t need “treating”, but the things that come with it (anxiety, sleep, burnout) do.</li>
<li><b>Your best tools are boring and brilliant:</b> sleep, routines, external reminders, and fewer things that drain you.</li>
</ul><p class="sass">Congratulations, you’ve unlocked the explanation for your entire personality. Please don’t rewrite your whole life by Tuesday.</p></div>

<h2>The first 30 days</h2>
<ul>
<li><b>Read, but don’t binge.</b> Pick 2–3 trusted sources (below). Social media is great for “oh, that’s me!” and terrible for medical facts.</li>
<li><b>Write your “brain owner’s manual”.</b> What drains you, what recharges you, your sensory no-gos, your best and worst times of day.</li>
<li><b>Book a follow-up</b> with your GP to plan treatment and support, and to check sleep, mood, iron, thyroid and anything else that’s been ignored.</li>
<li><b>Decide who to tell, if anyone.</b> You don’t owe anyone your diagnosis. Telling a few safe people first is a good test run.</li>
</ul>

<h2>ADHD: medication, honestly</h2>
<ul>
<li><b>Stimulants</b> (methylphenidate, dexamfetamine, lisdexamfetamine) help about 7 in 10 adults. They’re started low and adjusted over weeks.</li>
<li><b>Non-stimulants</b> (atomoxetine, guanfacine) are options when stimulants don’t suit.</li>
<li>Expect some trial and error with dose, timing and brand. Track sleep, appetite, mood, heart rate and blood pressure.</li>
<li><b>Good medication feels like “finally, a quiet desk”,</b> not a buzz. If you feel wired, flat or like a robot, the dose or medicine needs changing.</li>
<li>Stimulants are controlled (Schedule 8) medicines with state rules on who can prescribe. Carry your script details when travelling.</li>
<li>Driving: stable, well-treated ADHD usually makes driving safer. Check with your doctor if you’ve had problems.</li>
</ul>
<p><a href="/medicines/methylphenidate/">Methylphenidate</a> · <a href="/medicines/dexamfetamine/">Dexamfetamine</a> · <a href="/medicines/atomoxetine/">Atomoxetine</a> · <a href="/medicines/guanfacine/">Guanfacine</a></p>

<h2>Autism: support, not a cure</h2>
<ul>
<li>There’s no medicine for autism itself, and it doesn’t need one.</li>
<li>What helps: understanding your sensory and social energy budget, fewer masking marathons, routines that protect recovery time, and treating anxiety, depression or sleep problems if they’re there.</li>
<li>An occupational therapist can help with sensory and daily-living strategies; a neurodiversity-affirming psychologist can help with burnout, anxiety and self-understanding.</li>
</ul>

<h2>Your starter toolkit</h2>
<ul>
<li><b>External brain:</b> one calendar, alarms for everything, visible to-do lists, “launch pad” by the door for keys, wallet and meds.</li>
<li><b>Body doubling:</b> doing boring tasks alongside someone else (in person or online). Weirdly effective.</li>
<li><b>Sensory kit:</b> noise-reducing earplugs, sunglasses, soft layers, a fidget, a “leave early” plan.</li>
<li><b>Energy accounting:</b> socialising, masking and noise cost energy. Budget it like money and schedule recovery.</li>
<li><b>Make it easy:</b> automate bills, subscribe-and-save essentials, simplify wardrobes and meals. Willpower is not a strategy.</li>
<li><b>Sleep first:</b> regular wake time, screens down earlier, light in the morning. Everything is harder tired.</li>
</ul>

<h2>Work and study</h2>
<ul>
<li>Employers and education providers must make reasonable adjustments under disability discrimination law, if you choose to disclose.</li>
<li>Common adjustments: written instructions, quiet space or headphones, flexible hours, fewer open-plan days, clear deadlines, regular check-ins.</li>
<li>University disability services can give extensions, exam adjustments and note-taking support.</li>
</ul>

<h2>Watch for</h2>
<ul>
<li><b>Burnout:</b> exhaustion, loss of skills and shutdowns after long periods of masking or overload. Rest and reducing demands help; it isn’t laziness.</li>
<li><b>Co-occurring conditions:</b> anxiety, depression, eating problems, substance use, sleep disorders, hypermobility and POTS are more common. Mention them.</li>
<li><b>Thoughts of self-harm</b> are more common in neurodivergent adults. Please reach out: Lifeline 13 11 14, 13YARN 13 92 76, or 000.</li>
</ul>

<h2>Save your money</h2>
<ul class="skip">
<li><b>Supplement stacks and “ADHD diets”</b><span>Omega-3 has a tiny effect at best; elimination diets and supplement bundles mostly sell hope.</span></li>
<li><b>Neurofeedback and brain-training apps</b><span>Well-blinded trials show little or no benefit over sham.</span></li>
<li><b>Quick online “diagnoses” with no proper assessment</b><span>A good assessment includes your history, a collateral history and co-occurring conditions. Cheap and fast can mean wrong.</span></li>
<li><b>Anything promising to “cure” autism</b><span>Chelation, bleach (MMS), stem cells and hyperbaric oxygen: no benefit, real harms.</span></li>
</ul>

<h2>Find your people</h2>
<ul class="res">
<li><a href="https://www.adhdaustralia.org.au/" rel="noopener">ADHD Australia</a><span>Information and support. Free.</span></li>
<li><a href="https://reframingautism.org.au/" rel="noopener">Reframing Autism</a><span>Autistic-led education and community. Free resources.</span></li>
<li><a href="https://www.yellowladybugs.com.au/" rel="noopener">Yellow Ladybugs</a><span>Autistic girls, women and gender-diverse people.</span></li>
<li><a href="https://www.autismawareness.com.au/" rel="noopener">Autism Awareness Australia</a><span>Information for autistic people and families. Free.</span></li>
</ul>
'''
page("/late-diagnosis-adhd-autism/", "Late Diagnosis ADHD, Autism or AuDHD: Your Adult Starter Kit",
 "Just diagnosed with ADHD, autism or AuDHD as an adult? A sassy, practical starter kit: the first 30 days, medication honestly, sensory and energy tools, work adjustments, burnout and what to skip.",
 "Late Diagnosis Starter Kit: ADHD, Autism and AuDHD", "Attention deficit hyperactivity disorder", "Guide",
 [("Malady Wise", "/"), ("Conditions", "/conditions/"), ("Late diagnosis starter kit", "/late-diagnosis-adhd-autism/")], kit,
 [("What should I do after an adult ADHD or autism diagnosis?", "Give yourself time, read a few trusted sources, book a GP follow-up to plan treatment and support, and set up simple tools: one calendar, reminders, a sensory kit and protected recovery time."),
  ("What is AuDHD?", "An informal term for being both autistic and ADHD. It’s common: many autistic people also meet criteria for ADHD."),
  ("Do I have to tell my employer?", "No. Disclosure is your choice. If you do disclose, employers must consider reasonable adjustments under disability discrimination law.")],
 [("Australian evidence-based clinical practice guideline for ADHD (AADPA 2022)", "https://adhdguideline.aadpa.com.au/"), ("National guideline for the assessment and diagnosis of autism in Australia (Autism CRC)", "https://www.autismcrc.com.au/access/national-guideline")],
 [("ADHD in Adults", "/adhd-adults/"), ("Autism in Adults", "/autism-adults/"), ("ADHD deep dive", "/deep-dives/adhd/"), ("Explaining ADHD and autism to kids", "/explaining-adhd-autism-to-kids/")],
 audience="Patient")

# ---------------- Strengths-first explainer for kids ----------------
kids = '''<p class="lede">How you explain ADHD or autism to a child shapes how they see themselves for years. Lead with what their brain is great at, be honest about what it finds hard, and make it clear nothing is wrong with them.</p>
<div class="glance"><ul>
<li><b>Tell them.</b> Autistic adults who learned their diagnosis as children report better wellbeing than those who found out later.</li>
<li><b>Strengths first, then challenges,</b> then what helps. In that order.</li>
<li><b>Different, not less.</b> Brains come in different styles, like left- and right-handedness.</li>
<li><b>Keep it ongoing:</b> one big talk is less useful than lots of small ones.</li>
</ul><p class="sass">Every brain comes with a factory settings sheet. Theirs just wasn’t in the box.</p></div>

<h2>The “brain style” idea</h2>
<p>For younger children: “Everyone’s brain works a bit differently. Your brain has a style called ADHD (or autism). It means some things are extra easy for you, and some things take more energy. Lots of brilliant people have brains like yours.”</p>

<h2>ADHD strengths to name</h2>
<ul>
<li><b>Energy and enthusiasm:</b> you bring the fun and get things moving.</li>
<li><b>Curiosity and creativity:</b> you notice ideas other people miss.</li>
<li><b>Hyperfocus:</b> when something interests you, you can dive deeper than almost anyone.</li>
<li><b>Calm in a crisis:</b> many ADHD brains think fast when things get exciting or urgent.</li>
<li><b>Big heart and humour:</b> quick, funny, kind and quick to forgive.</li>
</ul>
<p><b>What it finds harder:</b> starting boring tasks, waiting, remembering several steps, sitting still for long. “That’s why we use timers, lists and movement breaks: they’re tools, like glasses.”</p>

<h2>Autism strengths to name</h2>
<ul>
<li><b>Deep interests:</b> you can become a real expert in the things you love.</li>
<li><b>Honesty and fairness:</b> you say what’s true and care about what’s right.</li>
<li><b>Noticing details and patterns</b> other people miss.</li>
<li><b>Loyalty:</b> you’re a true friend once you trust someone.</li>
<li><b>Logical thinking</b> and a great memory for facts.</li>
</ul>
<p><b>What it finds harder:</b> loud or busy places, sudden changes, guessing what people mean when they don’t say it. “That’s why we use headphones, warnings before changes and clear words.”</p>

<h2>How to have the talk</h2>
<ul>
<li>Choose a calm moment and a familiar place. Short is fine.</li>
<li>Use their interests: “Your brain is like a race car: very fast, needs good brakes.” or “like a specialist computer: amazing at some jobs, needs the right settings.”</li>
<li>Normalise: name people they admire who think differently, if that’s been shared publicly.</li>
<li>Invite questions, and come back to it often. Teens may prefer to read first, then talk.</li>
<li>Never use the diagnosis as a punishment or excuse (“that’s just your ADHD”).</li>
</ul>

<h2>Words that help (and hurt)</h2>
<ul>
<li><b>Try:</b> “different”, “your brain style”, “things that take more energy”, “tools that help”.</li>
<li><b>Avoid:</b> “broken”, “naughty brain”, “suffers from”, “normal kids”.</li>
<li>Many autistic people prefer “autistic person”; others prefer “person with autism”. Ask your child what they like as they get older.</li>
</ul>

<h2>Tell school too</h2>
<ul>
<li>Share strengths and what helps, not just the diagnosis. A one-page “all about me” sheet works well.</li>
<li>Ask about adjustments: movement breaks, quiet space, visual timetables, extra time, warnings before changes.</li>
</ul>
'''
page("/explaining-adhd-autism-to-kids/", "Explaining ADHD and Autism to Kids: A Strengths-First Guide",
 "How to tell a child they have ADHD or autism: strengths-first words, the brain style idea, what each brain finds easy and hard, scripts for different ages, and telling school.",
 "Explaining ADHD and Autism to Kids, Strengths First", "Attention deficit hyperactivity disorder", "Guide",
 [("Malady Wise", "/"), ("Conditions", "/conditions/"), ("Explaining ADHD and autism to kids", "/explaining-adhd-autism-to-kids/")], kids,
 [("Should I tell my child they have ADHD or autism?", "Yes, in age-appropriate words. Research in autistic adults found that learning the diagnosis earlier was linked to better wellbeing, and children usually already know they’re different."),
  ("How do I explain autism to a child?", "Describe it as a brain style with real strengths, such as deep interests, honesty and noticing details, and some things that take more energy, such as noisy places or sudden changes. Then talk about the tools that help."),
  ("How do I explain ADHD positively?", "Lead with strengths like energy, curiosity, creativity and hyperfocus, then explain what’s harder, like starting boring tasks or waiting, and the tools that help, like timers and movement breaks.")],
 [("Oredipe T et al. Does learning you are autistic at a younger age lead to better adult outcomes? (Autism in Adulthood 2023)", "https://pubmed.ncbi.nlm.nih.gov/?term=Oredipe+learning+you+are+autistic+younger+age"), ("National guideline for supporting the learning, participation and wellbeing of autistic children and their families (Autism CRC 2022)", "https://www.autismcrc.com.au/access/national-guideline")],
 [("ADHD in Children", "/adhd-kids/"), ("Autism in Children", "/autism-kids/"), ("Late diagnosis starter kit", "/late-diagnosis-adhd-autism/")],
 audience="Patient")

# ---------------- ADHD algorithm ----------------
adhd = '''<p class="drug-tags"><span class="ev m">For health professionals</span> <span class="ev m">General practice</span></p>
<p class="lede">An evidence-graded path for ADHD in children and adults, built on the AADPA 2022 Australian guideline and NICE: assess well, treat co-occurring conditions, then titrate medication with clear monitoring. Prescribing rules for stimulants vary by state: check yours.</p>
<p class="callout"><b>Evidence grades:</b> <b>A</b> strong · <b>B</b> moderate · <b>C</b> weak or mixed · <b>D</b> anecdotal · <b>X</b> avoid.</p>
<h2>Step 0 · Assess</h2>
<ul>
<li>DSM-5 criteria: symptoms before 12, in 2 or more settings, with impairment. Collateral history (family, school reports) matters.</li>
<li>Screen: ASRS v1.1 (adults), Vanderbilt or Conners (children). Screens don’t diagnose.</li>
<li>Look for co-occurring and mimicking conditions: autism, anxiety, depression, bipolar disorder, substance use, sleep apnoea and poor sleep, learning disorders, thyroid disease, iron deficiency, hearing or vision problems, trauma.</li>
<li>Cardiac screen before stimulants: personal or family history of sudden death, syncope on exertion, structural heart disease; BP and heart rate. ECG only if indicated.</li>
<li>Baseline height, weight, BP, heart rate, sleep and appetite.</li>
</ul>
''' + sec("Step 1 · For everyone", "", [
 ("A", "Psychoeducation", "Explain ADHD, strengths and challenges, and treatment options.", "Guideline-recommended; improves engagement", "Written plan; reputable sources", ""),
 ("A", "Parent training (children)", "First line for preschoolers and alongside medication in older children.", "Strong evidence for behaviour and family outcomes (AADPA, NICE)", "Triple P, Tuning in to Kids and similar programs", ""),
 ("B", "CBT for adult ADHD", "Organisation, planning, procrastination skills.", "Moderate evidence, especially combined with medication", "Psychologist via a Mental Health Treatment Plan; group programs", ""),
 ("B", "School and workplace adjustments", "Seating, breaks, extra time, written instructions.", "Consensus; practical benefit", "Letters to school or employer", "")]) + sec("Step 2 · Medication", "Titrate weekly to effect or side effects; review at each step.", [
 ("A", "Stimulants: methylphenidate (children first line) or lisdexamfetamine / dexamfetamine (adults first line)", "Short- or long-acting; long-acting preferred for adherence.", "Large effect sizes in a network meta-analysis (Cortese 2018): roughly 0.8–1.0 in children and 0.5–0.8 in adults", "Start low; titrate weekly; S8 rules apply", "Appetite, sleep, heart rate and BP, mood, tics, growth in children."),
 ("A", "Atomoxetine", "When stimulants fail, aren’t tolerated or misuse is a concern.", "Moderate effect size (~0.5); 4–12 weeks to work", "0.5 then 1.2 mg/kg in children; 40 then 80 mg in adults", "Nausea, sexual side effects, suicidal thoughts in youth, liver."),
 ("B", "Guanfacine extended release", "Non-stimulant; helpful with tics, sleep, emotional dysregulation, or as an add-on.", "Moderate evidence in children and adolescents; adult evidence growing", "1 mg, titrate weekly to 0.05–0.12 mg/kg; PBS for 6–17 with criteria", "Sedation, low BP, rebound hypertension if stopped suddenly."),
 ("C", "Clonidine", "Sleep onset, tics, aggression; add-on.", "Small trials", "50 µg at night, titrate", "Sedation, low BP; taper to stop."),
 ("C", "Bupropion (off label)", "Adults with co-occurring depression or substance use concerns.", "Small to moderate benefit, less than stimulants", "150 mg, then 150 mg twice daily", "Seizure risk, insomnia; CYP2D6 interactions."),
 ("D", "Modafinil (off label)", "Occasionally tried in adults.", "Trials in adults negative or mixed", "", "Contraception interaction; rash."),
 ("X", "Neurofeedback, elimination diets, supplement stacks", "", "Blinded trials show little or no benefit", "", "")]) + '''
<h2>Special situations</h2>
<ul>
<li><b>ADHD and autism:</b> stimulants still help, though response is lower and side effects (irritability) more common: start lower, go slower.</li>
<li><b>Anxiety:</b> treat the most impairing first; stimulants often reduce anxiety caused by ADHD chaos. Atomoxetine or guanfacine if anxiety worsens.</li>
<li><b>Substance use:</b> long-acting formulations (lisdexamfetamine) have lower misuse potential; consider atomoxetine.</li>
<li><b>Bipolar disorder:</b> stabilise mood first.</li>
<li><b>Pregnancy:</b> individualise; recent data are reassuring for stimulants, but discuss risks and benefits.</li>
<li><b>Monitoring:</b> BP, heart rate, weight (height in children) every 6 months; yearly review of need and dose.</li>
</ul>
'''
page("/algorithms/adhd/", "ADHD Treatment Algorithm for GPs (Children and Adults, Evidence-Graded)",
 "An evidence-graded ADHD algorithm for GPs: assessment and co-occurring conditions, psychoeducation and parent training, stimulant titration, non-stimulants, special situations and monitoring.",
 "ADHD: Treatment Algorithm", "Attention deficit hyperactivity disorder", "Clinician guide",
 [("Malady Wise", "/"), ("For doctors", "/doctors/"), ("Algorithms", "/algorithms/"), ("ADHD", "/algorithms/adhd/")], adhd,
 [("What is first-line medication for ADHD?", "Stimulants: methylphenidate first in children, and lisdexamfetamine or methylphenidate in adults, titrated weekly. Atomoxetine and guanfacine are alternatives."),
  ("Do children need an ECG before stimulants?", "Not routinely. Take a cardiac history and measure BP and heart rate; do an ECG if there’s personal or family cardiac history or abnormal findings.")],
 [("AADPA: Australian evidence-based clinical practice guideline for ADHD (2022)", "https://adhdguideline.aadpa.com.au/"), ("NICE NG87: ADHD diagnosis and management", "https://www.nice.org.uk/guidance/ng87"),
  ("Cortese S et al. Comparative efficacy and tolerability of medications for ADHD (Lancet Psychiatry 2018)", "https://pubmed.ncbi.nlm.nih.gov/30097390/"),
  ("RUPP Autism Network. Methylphenidate in children with pervasive developmental disorders and hyperactivity (2005)", "https://pubmed.ncbi.nlm.nih.gov/16275810/")],
 [("ADHD deep dive", "/deep-dives/adhd/"), ("ADHD", "/adhd/"), ("Atomoxetine", "/medicines/atomoxetine/"), ("Guanfacine", "/medicines/guanfacine/")])

# ---------------- Autism algorithm ----------------
aut = '''<p class="drug-tags"><span class="ev m">For health professionals</span> <span class="ev m">General practice</span></p>
<p class="lede">Autism isn’t a disease to cure. The GP’s job is a timely, respectful diagnosis, support that fits the person, and treating the co-occurring conditions that cause the most distress. Graded options, built on the Australian national guidelines.</p>
<p class="callout"><b>Evidence grades:</b> <b>A</b> strong · <b>B</b> moderate · <b>C</b> weak or mixed · <b>D</b> anecdotal · <b>X</b> avoid.</p>
<h2>Step 0 · Recognise and refer</h2>
<ul>
<li>Children: speech delay, limited joint attention or pointing, loss of skills, repetitive play, strong sensory responses, parental concern. Adults: lifelong social differences, burnout, anxiety or depression not responding, family history.</li>
<li>Girls and women are under-recognised and often mask; ask about camouflaging and exhaustion.</li>
<li>Refer for assessment following the national guideline (paediatrician, psychiatrist or psychologist; multidisciplinary when needed). Hearing test in children.</li>
<li>Check co-occurring conditions: ADHD, anxiety, depression, sleep, epilepsy, GI problems, intellectual disability, eating problems, hypermobility.</li>
</ul>
''' + sec("Step 1 · Supports (children)", "Goals set with the family; neurodiversity-affirming.", [
 ("B", "Parent-mediated and naturalistic developmental behavioural interventions", "e.g. PACT, JASPER: build communication through everyday play.", "RCTs show gains in social communication; PACT effects persisted 6 years later", "Speech pathologists and early intervention services; NDIS early childhood approach", ""),
 ("B", "Speech pathology and occupational therapy", "Communication (including AAC) and sensory or daily-living goals.", "Moderate evidence for targeted goals", "Allied health; NDIS for eligible children", ""),
 ("B", "School supports", "Visual schedules, quiet spaces, predictable routines.", "Guideline consensus", "School learning support plans", "")]) + sec("Step 2 · Co-occurring conditions", "Treat what causes distress; most medicines target these, not autism itself.", [
 ("A", "ADHD medication", "As in the ADHD algorithm; start lower, go slower.", "Methylphenidate helps about half (RUPP), with more side effects than in ADHD alone", "See /algorithms/adhd/", "Irritability, appetite."),
 ("B", "Adapted CBT for anxiety", "Concrete, visual, interest-based CBT.", "Moderate evidence in autistic children and adults", "Psychologist with autism experience", ""),
 ("B", "Melatonin for sleep", "After sleep hygiene and routine.", "RCTs show faster sleep onset and longer sleep in autistic children", "Prolonged-release paediatric melatonin (Slenyto) 2–5 mg", "Morning drowsiness."),
 ("A", "Risperidone or aripiprazole for severe irritability or aggression", "When behaviour support hasn’t worked and there’s risk of harm.", "RCTs show large reductions in irritability", "Low dose; specialist-guided", "Weight gain, metabolic effects, sedation, prolactin (risperidone)."),
 ("C", "SSRIs for repetitive behaviours", "", "Trials in children negative; some benefit for anxiety or depression in adults", "Start very low", "Activation and agitation."),
 ("X", "Chelation, hyperbaric oxygen, MMS (bleach), stem cells, secretin, strict special diets", "", "No benefit; some cause serious harm", "Avoid", "")]) + '''
<h2>Adults</h2>
<ul>
<li>Psychoeducation and connection with autistic-led community help self-understanding and wellbeing.</li>
<li>Reasonable adjustments at work or study; written communication; sensory accommodations.</li>
<li>Recognise autistic burnout: reduce demands, sensory load and masking; it isn’t depression, though both can coexist.</li>
<li>Treat anxiety, depression, sleep and ADHD as usual, with adapted approaches and lower starting doses.</li>
<li>Higher suicide risk: ask directly and plan safety.</li>
</ul>
'''
page("/algorithms/autism/", "Autism Support and Treatment Algorithm for GPs (Evidence-Graded)",
 "An evidence-graded autism algorithm for GPs: recognising and referring, neurodiversity-affirming supports, treating co-occurring ADHD, anxiety, sleep and irritability, and therapies to avoid.",
 "Autism: Support and Treatment Algorithm", "Autism spectrum disorder", "Clinician guide",
 [("Malady Wise", "/"), ("For doctors", "/doctors/"), ("Algorithms", "/algorithms/"), ("Autism", "/algorithms/autism/")], aut,
 [("Is there medication for autism?", "Not for autism itself. Medicines treat co-occurring conditions such as ADHD, anxiety, sleep problems and severe irritability or aggression."),
  ("What therapies help autistic children?", "Parent-mediated and naturalistic developmental approaches (such as PACT and JASPER), speech pathology and occupational therapy, chosen around the child’s and family’s goals.")],
 [("Autism CRC: National guideline for the assessment and diagnosis of autism in Australia", "https://www.autismcrc.com.au/access/national-guideline"), ("Autism CRC: National guideline for supporting autistic children and their families (2022)", "https://www.autismcrc.com.au/supporting-children-guideline"),
  ("Pickles A et al. Parent-mediated social communication therapy for young children with autism (PACT): long-term follow-up (Lancet 2016)", "https://pubmed.ncbi.nlm.nih.gov/27793431/"),
  ("RUPP Autism Network. Risperidone in children with autism and serious behavioral problems (NEJM 2002)", "https://pubmed.ncbi.nlm.nih.gov/12151468/")],
 [("Autism deep dive", "/deep-dives/autism/"), ("Autism", "/autism/"), ("ADHD algorithm", "/algorithms/adhd/")])

reg("/late-diagnosis-adhd-autism/", "Late Diagnosis Starter Kit: ADHD, Autism, AuDHD", ["Brain and nerves"], ["/adhd-adults/", "/autism-adults/", "/explaining-adhd-autism-to-kids/"],
    "Just diagnosed as an adult? The first 30 days, medication, sensory tools, work and burnout.", "late diagnosis adhd autism audhd adult diagnosis starter kit neurodivergent")
reg("/explaining-adhd-autism-to-kids/", "Explaining ADHD and Autism to Kids", ["Brain and nerves"], ["/adhd-kids/", "/autism-kids/", "/late-diagnosis-adhd-autism/"],
    "Strengths-first words for telling a child about their ADHD or autism.", "explain adhd autism to child kids strengths telling diagnosis neurodiversity")
