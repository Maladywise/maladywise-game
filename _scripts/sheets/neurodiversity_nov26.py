# Neurodiversity explained, strengths first (25 Nov 2026). Run: python3 _scripts/gen_sheets.py _scripts/sheets/neurodiversity_nov26.py
ABS = ("ABS: Autism in Australia, 2022", "https://www.abs.gov.au/articles/autism-australia-2022/autism-australia-2022-key-findings-plain-language")
WHO = ("WHO: Mental disorders fact sheet", "https://www.who.int/news-room/fact-sheets/detail/mental-disorders")
SONG = ("Song P et al. Global prevalence of adult ADHD: meta-analysis. J Glob Health 2021", "https://doi.org/10.7189/jogh.11.04009")
SEDG = ("Sedgwick JA et al. Positive aspects of ADHD in successful adults. Atten Defic Hyperact Disord 2019", "https://doi.org/10.1007/s12402-018-0277-6")
RUSS = ("Russell G et al. Mapping the autistic advantage: qualitative study. Autism Adulthood 2019", "https://doi.org/10.1089/aut.2018.0035")
HOURS = ("Hours C et al. ASD and ADHD comorbidity. Front Psychiatry 2022", "https://doi.org/10.3389/fpsyt.2022.837424")
KYAGA = ("Kyaga S et al. Mental illness, suicide and creativity: 40-year Swedish population study. J Psychiatr Res 2013", "https://doi.org/10.1016/j.jpsychires.2012.09.010")

def card(icon, name, style, strengths, hard, helps):
    return ('<section class="nd-card"><h2>%s %s</h2><p class="nd-style">%s</p>'
            '<h3>Often good at</h3><ul>%s</ul><h3>Often hard</h3><ul>%s</ul><h3>What helps</h3><ul>%s</ul></section>\n') % (
            icon, name, style, "".join("<li>%s</li>" % s for s in strengths), "".join("<li>%s</li>" % s for s in hard), "".join("<li>%s</li>" % s for s in helps))

CSS = ("<style>.nd-card{background:var(--card,#fff);border:1px solid var(--line,#E7E0F2);border-radius:16px;padding:14px 16px;margin:0 0 16px}"
       ".nd-card h2{margin:0 0 6px}.nd-card h3{font-size:15px;margin:10px 0 2px;color:var(--brand,#4A3480)}.nd-card ul{margin:2px 0 4px}"
       ".nd-style{font-size:15px;margin:0 0 4px;color:var(--muted,#6B5A93)}</style>\n")

BODY = (CSS +
 "<h2>The words</h2>\n<ul><li><b>Neurodiversity:</b> the fact that human brains vary, like height or hair colour. Everyone is part of it.</li>"
 "<li><b>Neurotypical:</b> a brain that works the way most schools, offices and social rules expect. Some people jokingly call it <b>‘neurobasic’</b>: a reminder that typical isn’t the same as better.</li>"
 "<li><b>Neurodivergent:</b> a brain that works differently from that expected pattern, e.g. ADHD, autism, dyslexia, dyspraxia or Tourette’s.</li>"
 "<li><b>The idea in one line:</b> many difficulties come from a poor fit between a brain and its environment, not just from the brain itself. Change the environment, and the same brain often thrives.</li></ul>\n"
 "<p>Each description below is a pattern, not a person. Strengths and struggles vary hugely, and the same trait can help in one setting and hinder in another.</p>\n"
 + card("🧠", "Neurotypical (‘neurobasic’)", "The brain the world was built around.",
   ["Reading unspoken social rules quickly", "Switching between tasks and coping with interruptions", "Following routines that others set", "Small talk and group settings"],
   ["Can miss detail or patterns others notice", "May find change in thinking style harder than they expect", "Easy to assume their way is the ‘right’ way"],
   ["Curiosity about how other brains work", "Asking, not assuming, what someone needs"])
 + card("⚡", "ADHD", "An interest-based attention system: hard to aim at boring tasks, superb when engaged. Affects about 2.5% of adults worldwide.",
   ["Hyperfocus on things that matter to them", "Creative, divergent thinking", "Energy, courage and quick action in a crisis", "Resilience and humour"],
   ["Starting and finishing dull tasks, time blindness", "Working memory, losing things", "Big emotions that arrive fast", "Restlessness, impulsivity"],
   ["External structure: timers, lists, body doubling", "Movement and variety", "Medication helps many people", "Short, clear instructions"])
 + card("🧩", "Autism", "Different ways of sensing, communicating and connecting. About 1.1% of Australians were identified as autistic in 2022, and many adults, especially women, are still undiagnosed.",
   ["Attention to detail and spotting patterns", "Deep knowledge of special interests", "Honesty and loyalty", "Memory, focus and fairness"],
   ["Sensory overload (noise, light, textures)", "Unclear social rules and small talk", "Sudden change", "Burnout from ‘masking’ to fit in"],
   ["Clear, direct communication", "Quiet spaces and sensory tools", "Predictability and warning before change", "Being accepted, not ‘fixed’"])
 + card("🌀", "AuDHD (autism and ADHD together)", "Very common: studies report ADHD in 50–70% of autistic people. The two can pull in opposite directions.",
   ["Creative hyperfocus plus deep expertise", "Novel ideas with an eye for detail", "Strong sense of justice"],
   ["Craving routine and novelty at once", "Burnout from juggling both", "Often diagnosed late, one condition hiding the other"],
   ["Flexible structure: a routine with room for variety", "Recovery time built into the week", "Clinicians who assess for both"])
 + card("🌗", "Bipolar disorder", "A mood condition with episodes of depression and of mania or hypomania, usually starting in the late teens or 20s. About 36 million people worldwide.",
   ["Between episodes, most people function well", "A Swedish study of over 1 million people linked bipolar disorder with creative careers", "Deep empathy from lived experience"],
   ["Episodes can disrupt life, sleep and relationships", "Higher risk of suicide: it’s a serious illness, not a personality quirk"],
   ["Mood stabilisers and other treatment work", "Regular sleep and routines", "A plan for early warning signs", "Peer support"])
 + card("🌌", "Schizophrenia", "A condition affecting how a person perceives reality, thinks and feels, at times with psychosis. About 1 in 300 people worldwide.",
   ["Recovery is possible: many people live full lives with the right support", "Relatives of people with schizophrenia are over-represented in creative jobs", "Peer workers with lived experience are transforming mental health care"],
   ["Psychosis, thinking and motivation changes", "Stigma, which often hurts as much as the symptoms", "Shorter life expectancy, mostly from treatable physical illness"],
   ["Early treatment and continuity of care", "Physical health checks", "Housing, work and social support", "Being treated as a person, not a diagnosis"])
 + "<h2>Other kinds of neurodivergence</h2>\n<ul><li><b>Dyslexia:</b> difficulty with reading and spelling, often alongside strong big-picture and verbal reasoning.</li>"
 "<li><b>Dyspraxia (DCD):</b> coordination and planning movements, with persistence and problem-solving often strong.</li>"
 "<li><b>Tourette’s:</b> tics, frequently with ADHD or OCD alongside. See our <a href=\"/tourette-syndrome/\">Tourette syndrome</a> page.</li>"
 "<li><b>OCD:</b> intrusive thoughts and compulsions; very treatable, and nothing to do with just being tidy.</li></ul>\n"
 "<h2>Is mental illness neurodivergence?</h2>\n<ul><li>The word was coined to include any brain that differs from the typical, so some people include bipolar disorder, schizophrenia and others. Many don’t, or describe them as both.</li>"
 "<li>Either way: strengths never cancel the need for treatment. Conditions like bipolar disorder and schizophrenia can be life-threatening, and treatment saves lives.</li>"
 "<li>Use the words the person uses about themselves.</li></ul>\n"
 "<h2>For health professionals</h2>\n<ul><li>Different isn’t broken: ask what support helps, not just what’s wrong.</li>"
 "<li>Watch for diagnostic overshadowing: a known diagnosis doesn’t explain every new symptom.</li>"
 "<li>Autistic and ADHD patients often have more chronic pain, POTS, hypermobility and gut symptoms. Investigate them properly.</li>"
 "<li>Adapt the consult: written plans, longer appointments, a quieter room, fewer surprises.</li></ul>\n")

fact("neurodiversity", "Neurodiversity Explained: Neurotypical vs ADHD vs Autism vs AuDHD and More",
 "Neurodiversity explained, strengths first: neurotypical (‘neurobasic’), ADHD, autism, AuDHD, bipolar disorder, schizophrenia and more, with what helps each brain thrive.",
 "Neurodiversity: every brain, strengths first", "Neurodiversity",
 "Every brain is different. Neurodiversity means seeing ADHD, autism and other brain differences as natural variation with real strengths and real challenges, rather than only as faults to fix.",
 BODY,
 [("What is the difference between neurotypical and neurodivergent?", "Neurotypical brains work the way most schools, workplaces and social rules expect. Neurodivergent brains, such as ADHD, autism or dyslexia, work differently, with their own strengths and challenges."),
  ("What does neurobasic mean?", "A tongue-in-cheek word some people use for neurotypical, as a reminder that typical isn’t the same as better."),
  ("What is AuDHD?", "Having both autism and ADHD. It’s common: studies report ADHD in about half to two-thirds of autistic people."),
  ("Are bipolar disorder and schizophrenia neurodivergent?", "Some people include them under the neurodiversity umbrella and some don’t. Either way, they are serious, treatable illnesses, and strengths don’t replace the need for care.")],
 [("Reframing Autism", "https://reframingautism.org.au/", "Autistic-led Australian organisation"),
  ("ADHD Australia", "https://www.adhdaustralia.org.au/", "Information and support for people with ADHD")],
 [ABS, SONG, SEDG, RUSS, HOURS, WHO, KYAGA],
 [("ADHD", "/adhd/"), ("Autism", "/autism/"), ("Autism in adults", "/autism-adults/"), ("Tourette syndrome", "/tourette-syndrome/")],
 groups=["Brain and nerves"], blurb="Neurotypical vs ADHD vs autism vs AuDHD and more: strengths, challenges and what helps.",
 search="neurodiversity neurodivergent neurotypical neurobasic ADHD autism AuDHD bipolar schizophrenia dyslexia dyspraxia strengths")
