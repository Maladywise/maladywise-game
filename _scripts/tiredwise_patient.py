#!/usr/bin/env python3
"""/tiredwise/what-to-try/: plain-English patient version of the Tiredwise protocol.
Beta, noindex (like the rest of Tiredwise). Run: python3 _scripts/tiredwise_patient.py"""
import os, re, html, json
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/"
E = html.escape
TODAY = "25 November 2026"

# (id, icon, title, sounds-like-you, do-now[], ask-gp[], skip[])
P = [
 ("pem", "🔋", "Crashes after doing things", "You feel much worse 12–72 hours after effort (even a shower, a phone call or a busy shop), sleep doesn’t refresh you, and it’s been months. Doctors call this post-exertional malaise; it’s the hallmark of ME/CFS.",
  ["Find your energy envelope: track activity and crashes for 2–4 weeks, then plan days under your crash line.",
   "Rest before you need to, lying down if you can. Thinking, talking and noise count as effort too.",
   "Hold steady at a level you can manage for a few weeks before trying more."],
  ["A proper ME/CFS assessment (and a 10-minute stand test for POTS).",
   "CoQ10 with NADH: a supplement with two small positive trials.",
   "Newer off-label options some doctors try: low-dose naltrexone, very-low-dose aripiprazole, pyridostigmine. Evidence is early, so start low and track it.",
   "Help with work, study or disability support letters."],
  ["Graded exercise programs that push on regardless of symptoms.", "‘Pushing through’ on good days, then crashing."]),
 ("pots", "🫀", "Dizzy or racing heart when standing", "Your heart races, you feel faint, foggy or shaky standing still, in queues, showers or heat, and lying down helps.",
  ["Drink 2–3 litres a day, starting with a big glass before you get up.",
   "Ask your GP whether extra salt suits you (not with high blood pressure, kidney or heart problems).",
   "Waist-high compression or an abdominal binder; calf socks do little.",
   "Cross your legs and clench your muscles when standing; sit or squat when it hits.",
   "Smaller meals, cooler showers, raise the head of your bed a little.",
   "Gentle exercise lying or sitting (recumbent bike, rowing, swimming), only within your energy envelope."],
  ["A 10-minute stand test: lie 5 minutes, then stand 10 while your heart rate is checked.",
   "Medicines that help some people: low-dose propranolol, ivabradine, midodrine, fludrocortisone or pyridostigmine. Most are off-label for this.",
   "Iron levels (ferritin): low iron makes POTS worse."],
  ["Long-term IV drips through a permanent line: clot and infection risk."]),
 ("mcas", "🌡️", "Flushing, hives or reactions", "Flushing, itch, hives, swelling, tummy cramps, wheeze or feeling faint, often several at once, set off by heat, food, alcohol, stress or scents.",
  ["Keep a symptom and trigger diary for a few weeks, with photos of rashes.",
   "A daily non-drowsy antihistamine (cetirizine or fexofenadine) is a reasonable first step. Check with your GP before going above the packet dose."],
  ["Whether you meet the criteria for mast cell activation syndrome. Australian allergy experts use strict criteria, including a blood test (tryptase) taken during and after a reaction.",
   "Adding famotidine, or trying montelukast (ask about the mood and nightmare warning), ketotifen or cromoglicate (made up by a compounding pharmacy).",
   "An adrenaline autoinjector and action plan if you’ve ever had a severe reaction."],
  ["Very restrictive diets for months. If you try low-histamine eating, keep it to 4 weeks, with a dietitian."]),
 ("pain", "⚡", "Pain everywhere", "Widespread aching or burning pain for 3 months or more, with tiredness, poor sleep and foggy thinking.",
  ["Gentle movement most days: tai chi, water exercise or walking, starting tiny and building slowly.",
   "Pace pain like energy: break tasks up and rest before it flares.",
   "Heat, sleep routine and things that calm your nervous system (breathing, mindfulness) all help a little each."],
  ["Medicines with modest benefit: low-dose amitriptyline, duloxetine or pregabalin.",
   "A pain psychologist or pain program: it’s about coping with real pain, not ‘it’s in your head’.",
   "Tests for small fibre neuropathy if pain is burning or prickly, including vitamin B6 levels."],
  ["Long-term strong opioids or tramadol: little benefit, more harm.", "High-dose vitamin B6 supplements and energy drinks: too much B6 damages nerves."]),
 ("fnd", "🧠", "Functional neurological symptoms (FND)", "You have weakness, shaking, walking problems, seizures or numbness, and a neurologist has diagnosed functional neurological disorder.",
  ["Learn how FND works: neurosymptoms.org is written by neurologists for patients.",
   "Remember: it’s a real problem with how the brain sends and receives signals. It isn’t faking and it isn’t damage."],
  ["FND-trained physiotherapy and occupational therapy.",
   "Psychological therapy, especially for functional seizures.",
   "Help for the things that travel with it: pain, fatigue, sleep, mood."],
  ["Epilepsy medicines for functional seizures (only if you also have epilepsy)."]),
 ("nd", "🧩", "ADHD or autism (diagnosed or wondering)", "Lifelong differences in focus, senses, routines or social energy. Very common in people with these conditions, and often missed in women and adults.",
  ["Cut sensory load: headphones, softer lighting, quieter spaces, comfy clothes.",
   "Plan recovery time after social or sensory-heavy days.",
   "Use simple trackers (step count, heart rate, a 0–10 score) rather than memory."],
  ["An ADHD or autism assessment, if it would change your care.",
   "ADHD treatment: it can lift brain fog. Your doctor should check your standing heart rate if you have POTS.",
   "Melatonin for a body clock that runs late."],
  []),
 ("hyp", "🤸", "Very bendy joints", "Joints that bend further than most, partial dislocations, easy bruising or stretchy skin, often alongside POTS, gut or mast cell symptoms.",
  ["Slow, steady strength work for joint control, with a hypermobility-aware physio."],
  ["Whether you meet criteria for hEDS or hypermobility spectrum disorder.", "Occupational therapy for splints and aids."],
  ["Rushing into surgery for loose joints: try physio first."]),
 ("gut", "🫃", "Tummy and bowel trouble", "Bloating, pain, constipation or diarrhoea, or feeling full fast.",
  ["Smaller meals; try soluble fibre (e.g. psyllium) slowly."],
  ["A coeliac blood test BEFORE going gluten-free.", "Low-dose amitriptyline, which helped IBS in a big UK trial.", "A dietitian for a short low-FODMAP trial."],
  ["Long elimination diets without a dietitian."]),
 ("lc", "🦠", "It started after COVID-19", "Symptoms for 3 months or more after COVID-19. Use the sections above that fit: most people have a mix.",
  ["Avoid reinfection where you can, and rest early when you do get sick."],
  ["Whether metformin early in a NEW COVID infection suits you: one trial cut later long COVID by about 40%.",
   "Paxlovid doesn’t help established long COVID (a 2024 trial found no benefit)."],
  []),
]

BASE = [
 "<b>One change at a time.</b> Give each change 4–8 weeks, track it, then keep it or drop it.",
 "<b>Pace yourself.</b> Most people with these conditions improve more from pacing than from any pill.",
 "<b>Check the basics with your GP:</b> iron (ferritin), thyroid, vitamin B12, coeliac, sugar levels, and your sleep (snoring or stopping breathing).",
 "<b>Review your medicines.</b> Some add tiredness or fog: sleeping tablets, strong painkillers, some allergy and bladder tablets, alcohol and cannabis.",
 "<b>Look after mood too.</b> Depression and anxiety often come along with these conditions. Treating them helps, and doesn’t mean it was ‘all in your head’.",
]

SKIP = [
 ("Unproven tests", "food ‘IgG intolerance’ panels, urine mould (mycotoxin) tests, provoked heavy-metal tests and private ‘chronic Lyme’ panels. They often give false answers."),
 ("Unproven treatments", "chelation, ozone, stem cell clinics and high-dose vitamin drips."),
 ("Supplement stacks", "10 products at once with no way of knowing what helps. Add one at a time, if any."),
 ("Rituximab, IVIG or other immune treatments outside research trials", "big trials haven’t shown benefit."),
]

QS = [
 "Could this be ME/CFS, POTS, mast cell activation, fibromyalgia or a mix?",
 "Can we do a 10-minute stand test?",
 "Can we check my iron (ferritin), thyroid, B12, coeliac screen and sugar levels?",
 "Could sleep apnoea, ADHD or autism be part of this?",
 "Which medicines might be worth a trial, and what’s the evidence?",
 "If something is off-label, what are the risks, and how will we know it’s working?",
 "Can you write a plan for work, study or support services?",
]

def ul(xs): return "<ul>%s</ul>" % "".join("<li>%s</li>" % E(x) for x in xs)
cards = ""
for pid, ic, t, fit, do, ask, skip in P:
    body = '<p class="pt-fit"><b>Sounds like you if:</b> %s</p>' % E(fit)
    if do: body += '<h3>✅ Try now</h3>' + ul(do)
    if ask: body += '<h3>🩺 Ask your GP about</h3>' + ul(ask)
    if skip: body += '<h3>🚫 Skip</h3>' + ul(skip)
    body += '<label class="ck pt-pick"><input type="checkbox" data-p="%s"> <span>Add this to my GP summary</span></label>' % pid
    cards += '<details class="card" id="p-%s"><summary><span>%s %s</span></summary>%s</details>\n' % (pid, ic, E(t), body)
qs = "".join('<label class="ck"><input type="checkbox" data-q="%d"> <span>%s</span></label>' % (i, E(q)) for i, q in enumerate(QS))
skip = "".join("<li><b>%s:</b> %s</li>" % (E(a), E(b)) for a, b in SKIP)
SUMMARY = {pid: {"t": t, "ask": ask} for pid, ic, t, fit, do, ask, skip_ in P}

CSS = """<style>
#tw h3{font-size:15px;margin:12px 0 4px}#tw .pt-fit{font-size:14.5px;line-height:1.5;margin:8px 0}
#tw ul{margin:4px 0 6px;padding-left:20px}#tw li{margin:4px 0;line-height:1.5;font-size:15px}
#tw .pt-pick{border-top:1px dashed var(--line);margin-top:8px;padding-top:9px}
#tw .pt-base li{margin:6px 0}
#tw #tw-out pre{white-space:pre-wrap;font:14px/1.5 var(--body);background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin:8px 0}
</style>"""

MAIN = """<main class="wrap doc" id="tw">
<p class="meta"><a href="/tiredwise/">Tiredwise</a> · For patients <span class="beta">BETA</span></p>
<div class="host"><img src="/assets/mascots/layla.svg" width="72" height="72" alt="Layla the sloth"><h1>Tiredwise: what to try</h1></div>
<p class="lede">For people living with a mix of ME/CFS, POTS, mast cell symptoms, fibromyalgia, FND, chronic pain, ADHD or autism, who feel they’ve fallen through the gaps. What you can start yourself, what to ask your GP about, and what to skip.</p>
<div class="flags" role="note"><h2>First, rule out the serious stuff</h2><p style="margin:0;font-size:14.5px">Weight loss, fevers, night sweats, chest pain, fainting with exercise, new weakness or bleeding need a doctor soon. Call 000 in an emergency. If you haven’t yet, do the <a href="/tiredwise/check/">Tiredwise self-check</a>.</p></div>

<h2>Start here: everyone</h2>
<ul class="pt-base">""" + "".join("<li>%s</li>" % b for b in BASE) + """</ul>

<h2>Pick what sounds like you</h2>
<p class="note">Most people tick 2–4. Medicine names are to help you start a conversation with your GP: don’t start, stop or change medicines without them.</p>
""" + cards + """
<h2>Be wary of</h2>
<ul>""" + skip + """</ul>

<h2>Take this to your GP</h2>
<p class="note">Tick the questions you want to ask. Your ticks above and below make a one-page summary. Nothing is saved or sent anywhere.</p>
<div class="card">""" + qs + """</div>
<div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" type="button" id="pt-prt">Print summary</button><button class="btn ghost" type="button" id="pt-cpy">Copy summary</button></div>
<div id="tw-out"><pre id="pt-sum"></pre></div>

<h2>Support</h2>
<ul><li><a href="https://emerge.org.au/" rel="noopener">Emerge Australia</a>: ME/CFS and long COVID support.</li>
<li><a href="https://neurosymptoms.org/" rel="noopener">neurosymptoms.org</a>: FND explained by neurologists.</li>
<li><a href="https://www.healthdirect.gov.au/" rel="noopener">healthdirect</a>: 1800 022 222, nurse advice any time.</li>
<li>Struggling? Lifeline 13 11 14, any time.</li></ul>
<p class="note">For your GP: the clinician version with doses, evidence grades and sources is the <a href="/tools/tiredwise/protocol/">Tiredwise protocol</a>.</p>
<p class="meta">Beta. General information, not personal medical advice. Made with AI tools and overseen by a GP. Updated """ + TODAY + """.</p>
</main>
<script>
(function () {
  "use strict";
  var P = """ + json.dumps(SUMMARY, ensure_ascii=False) + """, Q = """ + json.dumps(QS, ensure_ascii=False) + """;
  function $(id) { return document.getElementById(id); }
  function text() {
    var ps = [].filter.call(document.querySelectorAll("[data-p]"), function (c) { return c.checked; }).map(function (c) { return P[c.getAttribute("data-p")]; });
    var qs = [].filter.call(document.querySelectorAll("[data-q]"), function (c) { return c.checked; }).map(function (c) { return Q[+c.getAttribute("data-q")]; });
    var t = "Tiredwise summary for my GP (" + new Date().toLocaleDateString("en-AU") + ")\\n";
    if (ps.length) { t += "\\nWhat sounds like me:\\n"; ps.forEach(function (p) { t += "- " + p.t + "\\n"; }); t += "\\nThings I'd like to ask about:\\n"; ps.forEach(function (p) { p.ask.forEach(function (a) { t += "- " + a + "\\n"; }); }); }
    if (qs.length) { t += "\\nMy questions:\\n"; qs.forEach(function (q) { t += "- " + q + "\\n"; }); }
    if (!ps.length && !qs.length) t += "\\nTick the sections that sound like you, and the questions you want to ask.\\n";
    return t + "\\nClinician protocol: maladywise.com/tools/tiredwise/protocol/";
  }
  function upd() { $("pt-sum").textContent = text(); }
  $("tw").addEventListener("change", upd);
  $("pt-cpy").onclick = function () { var b = this; if (navigator.clipboard) navigator.clipboard.writeText(text()).then(function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy summary"; }, 1500); }); };
  $("pt-prt").onclick = function () { var w = window.open("", "_blank"); if (!w) return; w.document.write("<pre style='font:14px/1.5 system-ui;white-space:pre-wrap;padding:20px'>" + text().replace(/[<&]/g, function (c) { return c === "<" ? "&lt;" : "&amp;"; }) + "</pre>"); w.document.close(); w.focus(); w.print(); };
  upd();
})();
</script>
<script defer src="/assets/boot.js?v=1" data-mw="page"></script>
</body>
</html>
"""

TPL = open(ROOT + "tiredwise/check/index.html", encoding="utf-8").read()
HEAD = TPL[:TPL.index("</head>")]
HEAD = re.sub(r'<script type="application/ld\+json".*?</script>\n?', "", HEAD, flags=re.S)
title = "Tiredwise: what to try for ME/CFS, POTS, MCAS and fibromyalgia"
desc = "Living with a mix of ME/CFS, POTS, mast cell symptoms, fibromyalgia, FND or ADHD? What to start yourself, what to ask your GP about, and what to skip."
url = "https://maladywise.com/tiredwise/what-to-try/"
h = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="%s">' % url, HEAD)
h = re.sub(r"<title>.*?</title>", "<title>%s</title>" % E(title), h)
for a in ('<meta name="description" content="', '<meta property="og:description" content="'):
    h = re.sub(r"(%s)[^\"]*" % re.escape(a), lambda m: m.group(1) + E(desc), h)
h = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + E(title), h)
h = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + url, h)
body_open = TPL[TPL.index("</head>"):TPL.index("<main")]
os.makedirs(ROOT + "tiredwise/what-to-try", exist_ok=True)
open(ROOT + "tiredwise/what-to-try/index.html", "w", encoding="utf-8").write(h + CSS + "\n" + body_open + MAIN)
print("what-to-try built:", len(P), "patterns")
