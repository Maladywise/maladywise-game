#!/usr/bin/env python3
"""Printable questionnaires and diagnostic criteria (A4, one page each) under /printables/.
Questionnaires: only free-to-reproduce tools, wording checked against the published form (see each SRC).
Criteria: written in our own words (DSM and other criteria wording is copyrighted). Run: python3 _scripts/printables.py"""
import os, html, json, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/"
TPL = open(ROOT + "tools/ace-score/index.html", encoding="utf-8").read()
HEAD = TPL[:TPL.index("<main")]
HEAD = re.sub(r'<meta property="og:image[^>]*>\n?|<meta name="twitter:image[^>]*>\n?', "", HEAD)
HEAD = re.sub(r'<script type="application/ld\+json".*?</script>\n?', "", HEAD, flags=re.S)
HEAD = HEAD.replace('<link rel="stylesheet" href="/tools/calckit/calc.css?v=2">\n', "")
E = html.escape
TODAY = "21 November 2026"
CSS = """<style>
.pr-bar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:10px 0 16px}
.pr-btn{font:600 15px var(--body);border:0;border-radius:999px;padding:11px 20px;background:var(--brand,#4A3480);color:#fff;cursor:pointer}
.pr-sheet{background:#fff;color:#1d1a24;border:1px solid var(--line,#E7E0F2);border-radius:14px;padding:20px 20px 16px;font-size:14px;line-height:1.5}
.pr-sheet li,.pr-sheet p,.pr-sheet td,.pr-sheet th,.pr-sheet span,.pr-sheet h3{color:#1d1a24}.pr-sheet li{font-size:1em!important;line-height:inherit}
.pr-brand{margin:0 0 4px;font:700 10.5px var(--body);letter-spacing:.14em;text-transform:uppercase;color:#6B5A93}
.pr-sheet h2{font-size:18px;line-height:1.25;margin:0 0 10px;color:#2E1F57}.pr-sheet .pr-sub{margin:0 0 10px;color:#3b3646}
.pr-who{display:grid;grid-template-columns:2fr 1fr;gap:14px;margin:0 0 14px}.pr-who span{border-bottom:1px solid #8a8496;padding:8px 0 2px;color:#555;font-size:12px}
.pr-t{width:100%;border-collapse:collapse;margin:0 0 10px}.pr-t th,.pr-t td{border:1px solid #cfc9d9;padding:7px 8px;vertical-align:middle}
.pr-t tr:nth-child(even) td{background:#FAF8FD}
.pr-t th{background:#F1ECF8;font-size:12px;font-weight:700;text-align:center;color:#2E1F57}.pr-t td.n{width:22px;text-align:center;color:#6B5A93;font-weight:700}.pr-t td.b{text-align:center;width:9%;font-size:12px;color:#555}.pr-t td.q{width:auto;min-width:45%}
.pr-t td.q b{color:#2E1F57}.pr-t td.a{font-size:13px;min-width:150px}.pr-t.qa td.q{width:40%;min-width:0}
.pr-opt{display:inline-block;margin:1px 12px 1px 0;white-space:nowrap}.pr-t td.b i{display:inline-block;width:13px;height:13px;border:1.5px solid #333;border-radius:2px;margin-right:5px;vertical-align:-2px}
.pr-t td.sh{background:#CFC6DE!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pr-score{display:flex;gap:16px;flex-wrap:wrap;margin:10px 0 8px}.pr-score span{border:1.5px solid #2E1F57;border-radius:8px;padding:7px 14px;font-weight:700}
.pr-key{margin:6px 0 0;padding:10px 14px 10px 30px;background:#F6F3FB;border-radius:10px;-webkit-print-color-adjust:exact;print-color-adjust:exact}.pr-key li{margin:3px 0}
.pr-crit h3{font-size:15px;margin:14px 0 6px;color:#2E1F57}.pr-hs{font-weight:500;color:#3b3646}
.pr-crit ul{margin:0 0 4px;padding-left:0;list-style:none}.pr-crit li{margin:5px 0;padding-left:24px;position:relative}
.pr-crit li::before{content:"";position:absolute;left:0;top:.2em;width:13px;height:13px;border:1.5px solid #333;border-radius:2px}
.pr-crit li.nb::before{display:none}.pr-crit ul.c2{columns:2;column-gap:28px}.pr-crit ul.c2 li{break-inside:avoid}.pr-crit li b{color:#2E1F57}
.pr-foot{margin:14px 0 0;font-size:11px;line-height:1.45;color:#5b5666;border-top:1px solid #ddd;padding-top:8px}
.pr-hub{list-style:none!important;padding:0!important;display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
.pr-hub li{margin:0!important}.pr-hub a{display:block;background:var(--card,#fff);border:1px solid var(--line,#E7E0F2);border-radius:14px;padding:12px 14px;text-decoration:none;color:var(--ink)}
.pr-hub b{display:block;color:var(--brand,#4A3480)}.pr-hub span{font-size:14px}
@media print{@page{size:A4;margin:14mm 14mm 12mm}
 html,body{background:#fff!important;height:auto!important}
 body>*:not(main),main>*:not(.pr-sheet),.mw-secret-pill{display:none!important}
 main{padding:0!important;margin:0!important;max-width:none!important}
 .pr-sheet{border:0;border-radius:0;padding:4mm 0 0;font-size:10.5pt;line-height:1.45}
 .pr-sheet h2{font-size:15pt;margin:0 0 4mm}.pr-t th,.pr-t td{padding:4px 6px}.pr-crit li{margin:2px 0}.pr-crit h3{font-size:11.5pt;margin:4mm 0 1.5mm}
 .pr-crit{font-size:11pt}.pr-crit li{margin:1.2mm 0}
 .pr-sheet.tight{font-size:9.5pt;line-height:1.35}.pr-sheet.tight .pr-t th,.pr-sheet.tight .pr-t td{padding:2px 5px}.pr-sheet.tight .pr-crit h3,.pr-sheet.tight h3{margin:2.5mm 0 1mm}
 .pr-t tr,.pr-crit li{break-inside:avoid}}
</style>"""

# "Learn more" under each printable (screen only; print shows the sheet alone). 26 Nov 2026
LEARN = {
 "phq-9": [("/depression/", "Depression fact sheet"), ("https://www.beyondblue.org.au/", "Beyond Blue: support for depression and anxiety")],
 "depression-criteria": [("/depression/", "Depression fact sheet"), ("https://www.beyondblue.org.au/", "Beyond Blue: support for depression and anxiety")],
 "gad-7": [("/anxiety/", "Anxiety fact sheet"), ("https://www.beyondblue.org.au/", "Beyond Blue: support for anxiety")],
 "k10": [("/mental-health-check/", "Mental health self-checks"), ("https://www.beyondblue.org.au/", "Beyond Blue: support and 24/7 counselling")],
 "epds": [("/depression/", "Depression fact sheet"), ("https://panda.org.au/", "PANDA: perinatal anxiety and depression support")],
 "audit": [("/alcohol/", "Alcohol fact sheet"), ("https://adf.org.au/", "Alcohol and Drug Foundation")],
 "asrs": [("/adhd/", "ADHD fact sheet"), ("https://www.adhdaustralia.org.au/", "ADHD Australia")],
 "adhd-criteria": [("/adhd/", "ADHD fact sheet"), ("https://www.adhdaustralia.org.au/", "ADHD Australia")],
 "autism-criteria": [("/autism-adults/", "Autism in adults"), ("https://reframingautism.org.au/", "Reframing Autism: autistic-led support")],
 "stop-bang": [("/sleep-apnoea/", "Sleep apnoea fact sheet"), ("https://www.sleephealthfoundation.org.au/", "Sleep Health Foundation")],
 "falls-risk": [("https://www.nhs.uk/conditions/falls/", "NHS: preventing falls")],
 "fibromyalgia-criteria": [("/fibromyalgia/", "Fibromyalgia fact sheet"), ("https://www.painaustralia.org.au/", "Painaustralia")],
 "gca-criteria": [("https://www.nhs.uk/conditions/giant-cell-arteritis/", "NHS: giant cell arteritis")],
 "heds-criteria": [("/ehlers-danlos-syndrome/", "EDS and hypermobility fact sheet"), ("https://www.ehlers-danlos.com/", "The Ehlers-Danlos Society")],
 "beighton-score": [("/ehlers-danlos-syndrome/", "EDS and hypermobility fact sheet"), ("https://www.ehlers-danlos.com/", "The Ehlers-Danlos Society")],
 "ibs-criteria": [("/ibs/", "IBS fact sheet"), ("https://www.monashfodmap.com/", "Monash University FODMAP diet")],
 "mcas-criteria": [("/mcas/", "MCAS fact sheet"), ("https://tmsforacure.org/", "The Mastocytosis Society")],
 "mecfs-criteria": [("/me-cfs/", "ME/CFS fact sheet"), ("https://www.emerge.org.au/", "Emerge Australia: ME/CFS support")],
 "pcos-criteria": [("/pcos/", "PCOS fact sheet"), ("https://www.jeanhailes.org.au/", "Jean Hailes for Women's Health")],
 "pots-stand-test": [("/pots/", "POTS fact sheet"), ("https://www.dysautonomiainternational.org/", "Dysautonomia International")],
}
def learn(slug):
    L = LEARN.get(slug)
    if not L: return ""
    return '<h2 class="pr-learn">Learn more</h2><ul class="res pr-learn">' + "".join(
        '<li><a href="%s"%s>%s</a></li>' % (u, ' rel="noopener"' if u.startswith("http") else "", E(t)) for u, t in L) + "</ul>"

def page(slug, title, desc, main):
    url = "https://maladywise.com/printables/%s" % (slug + "/" if slug else "")
    h = HEAD
    h = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="%s">' % url, h)
    h = re.sub(r'<title>.*?</title>', "<title>%s</title>" % E(title), h)
    h = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + E(desc), h)
    h = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + E(title), h)
    h = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda m: m.group(1) + E(desc), h)
    h = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + url, h)
    out = h + '<main class="wrap doc">\n' + main + "\n" + learn(slug) + "\n" + CSS + '\n<p class="meta">Updated %s.</p>\n</main>\n<script>document.addEventListener("click",function(e){if(e.target.closest("[data-print]")){e.preventDefault();window.print();}});</script>\n<script>MW.page();</script>\n</body>\n</html>\n' % TODAY
    d = ROOT + "printables/" + (slug + "/" if slug else "")
    os.makedirs(d, exist_ok=True)
    open(d + "index.html", "w", encoding="utf-8").write(out)

def L(t):
    """Bold a leading 'Label:' (e.g. 'Snoring: Do you snore…') and number ranges in keys, for easy scanning."""
    m = re.match(r"^([A-Z][^:]{1,38}):\s+(.*)$", t)
    if m and not re.search(r"\d:\d", m.group(1)): return "<b>%s:</b> %s" % (E(m.group(1)), E(m.group(2)))
    return E(t)
def K(t):
    out = L(t)
    return re.sub(r"(?<![\w>])(\d+\s?(?:–|to)\s?\d+|\d+ or more)(?=\s)", r"<b>\1</b>", out)
def H(t):
    m = re.match(r"^(.*?):\s+(.*)$", t)
    return ("%s<span class=\"pr-hs\">: %s</span>" % (E(m.group(1)), E(m.group(2)))) if m else E(t)

WHO = '<div class="pr-who"><span>Name</span><span>Date</span></div>'

def bar(extra=""):
    return '<p class="pr-bar"><button type="button" class="pr-btn" data-print>&#128424; Print or save as PDF</button>' + extra + "</p>"

# ---------- questionnaires ----------
YN = [("No", 0), ("Yes", 1)]
Q = [
 dict(slug="phq-9", name="PHQ-9", full="Patient Health Questionnaire (PHQ-9)", what="depression",
  stem="Over the last 2 weeks, how often have you been bothered by any of the following problems?",
  opts=[("Not at all", 0), ("Several days", 1), ("More than half the days", 2), ("Nearly every day", 3)],
  items=["Little interest or pleasure in doing things", "Feeling down, depressed, or hopeless", "Trouble falling or staying asleep, or sleeping too much", "Feeling tired or having little energy", "Poor appetite or overeating", "Feeling bad about yourself — or that you are a failure or have let yourself or your family down", "Trouble concentrating on things, such as reading the newspaper or watching television", "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual", "Thoughts that you would be better off dead or of hurting yourself in some way"],
  extra="If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people? &#9744; Not difficult at all &#9744; Somewhat difficult &#9744; Very difficult &#9744; Extremely difficult",
  key=["Add the column scores. Total 0 to 27.", "0–4 minimal · 5–9 mild · 10–14 moderate · 15–19 moderately severe · 20–27 severe.", "Any answer above 0 on question 9 needs a same-day conversation about safety."],
  credit="Developed by Drs Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues, with an educational grant from Pfizer Inc. No permission required to reproduce, translate, display or distribute.",
  online="/mental-health-check/depression-test/"),
 dict(slug="gad-7", name="GAD-7", full="Generalised Anxiety Disorder scale (GAD-7)", what="anxiety",
  stem="Over the last 2 weeks, how often have you been bothered by the following problems?",
  opts=[("Not at all", 0), ("Several days", 1), ("More than half the days", 2), ("Nearly every day", 3)],
  items=["Feeling nervous, anxious or on edge", "Not being able to stop or control worrying", "Worrying too much about different things", "Trouble relaxing", "Being so restless that it is hard to sit still", "Becoming easily annoyed or irritable", "Feeling afraid as if something awful might happen"],
  extra="If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people? &#9744; Not difficult at all &#9744; Somewhat difficult &#9744; Very difficult &#9744; Extremely difficult",
  key=["Add the column scores. Total 0 to 21.", "0–4 minimal · 5–9 mild · 10–14 moderate · 15–21 severe.", "10 or more is a common cut-off for further assessment."],
  credit="Developed by Drs Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues, with an educational grant from Pfizer Inc. No permission required to reproduce, translate, display or distribute.",
  online="/mental-health-check/anxiety-test/"),
 dict(slug="k10", name="K10", full="Kessler Psychological Distress Scale (K10)", what="psychological distress",
  stem="These questions are about how you have been feeling in the past 4 weeks.",
  opts=[("None of the time", 1), ("A little of the time", 2), ("Some of the time", 3), ("Most of the time", 4), ("All of the time", 5)],
  items=["In the past 4 weeks, about how often did you feel tired out for no good reason?", "In the past 4 weeks, about how often did you feel nervous?", "In the past 4 weeks, about how often did you feel so nervous that nothing could calm you down?", "In the past 4 weeks, about how often did you feel hopeless?", "In the past 4 weeks, about how often did you feel restless or fidgety?", "In the past 4 weeks, about how often did you feel so restless you could not sit still?", "In the past 4 weeks, about how often did you feel depressed?", "In the past 4 weeks, about how often did you feel that everything was an effort?", "In the past 4 weeks, about how often did you feel so sad that nothing could cheer you up?", "In the past 4 weeks, about how often did you feel worthless?"],
  extra="",
  key=["Add the column scores. Total 10 to 50.", "Common Australian bands: 10–15 low · 16–21 moderate · 22–29 high · 30–50 very high distress.", "A screen, not a diagnosis. Talk to a GP about a high score."],
  credit="Kessler RC and colleagues. The K10 is free to use; Australian scoring bands as used in Australian health surveys.",
  online="/mental-health-check/k10/"),
 dict(slug="audit", name="AUDIT", full="Alcohol Use Disorders Identification Test (AUDIT)", what="alcohol use",
  stem="One drink = one standard drink (in Australia, 10 g of alcohol). Tick one answer for each question.",
  opts=None,
  items=[("How often do you have a drink containing alcohol?", [("Never", 0), ("Monthly or less", 1), ("2–4 times a month", 2), ("2–3 times a week", 3), ("4 or more times a week", 4)]),
         ("How many drinks containing alcohol do you have on a typical day when you are drinking?", [("1 or 2", 0), ("3 or 4", 1), ("5 or 6", 2), ("7 to 9", 3), ("10 or more", 4)]),
         ("How often do you have six or more drinks on one occasion?", "F"),
         ("How often during the last year have you found that you were not able to stop drinking once you had started?", "F"),
         ("How often during the last year have you failed to do what was normally expected of you because of drinking?", "F"),
         ("How often during the last year have you needed a first drink in the morning to get yourself going after a heavy drinking session?", "F"),
         ("How often during the last year have you had a feeling of guilt or remorse after drinking?", "F"),
         ("How often during the last year have you been unable to remember what happened the night before because of your drinking?", "F"),
         ("Have you or someone else been injured because of your drinking?", "Y"),
         ("Has a relative, friend, doctor, or other health care worker been concerned about your drinking or suggested you cut down?", "Y")],
  extra="",
  key=["Add the scores. Total 0 to 40.", "8 or more suggests hazardous or harmful drinking. 15 or more: assess for alcohol dependence.", "Questions 1 to 3 alone are the AUDIT-C (5 or more needs further assessment)."],
  credit="World Health Organization. AUDIT: The Alcohol Use Disorders Identification Test, guidelines for use in primary care (Babor et al.). Free to reproduce.",
  online=""),
 dict(slug="epds", name="EPDS", full="Edinburgh Postnatal Depression Scale (EPDS)", what="depression in pregnancy and after birth",
  stem="As you are pregnant or have recently had a baby, we would like to know how you are feeling. Please tick the answer that comes closest to how you have felt in the past 7 days, not just how you feel today.",
  opts=None,
  items=[("I have been able to laugh and see the funny side of things", [("As much as I always could", 0), ("Not quite so much now", 1), ("Definitely not so much now", 2), ("Not at all", 3)]),
         ("I have looked forward with enjoyment to things", [("As much as I ever did", 0), ("Rather less than I used to", 1), ("Definitely less than I used to", 2), ("Hardly at all", 3)]),
         ("I have blamed myself unnecessarily when things went wrong", [("Yes, most of the time", 3), ("Yes, some of the time", 2), ("Not very often", 1), ("No, never", 0)]),
         ("I have been anxious or worried for no good reason", [("No, not at all", 0), ("Hardly ever", 1), ("Yes, sometimes", 2), ("Yes, very often", 3)]),
         ("I have felt scared or panicky for no very good reason", [("Yes, quite a lot", 3), ("Yes, sometimes", 2), ("No, not much", 1), ("No, not at all", 0)]),
         ("Things have been getting on top of me", [("Yes, most of the time I haven’t been able to cope at all", 3), ("Yes, sometimes I haven’t been coping as well as usual", 2), ("No, most of the time I have coped quite well", 1), ("No, I have been coping as well as ever", 0)]),
         ("I have been so unhappy that I have had difficulty sleeping", [("Yes, most of the time", 3), ("Yes, sometimes", 2), ("Not very often", 1), ("No, not at all", 0)]),
         ("I have felt sad or miserable", [("Yes, most of the time", 3), ("Yes, quite often", 2), ("Not very often", 1), ("No, not at all", 0)]),
         ("I have been so unhappy that I have been crying", [("Yes, most of the time", 3), ("Yes, quite often", 2), ("Only occasionally", 1), ("No, never", 0)]),
         ("The thought of harming myself has occurred to me", [("Yes, quite often", 3), ("Sometimes", 2), ("Hardly ever", 1), ("Never", 0)])],
  extra="",
  key=["Add the scores. Total 0 to 30.", "In Australia, 13 or more suggests probable depression; 10 to 12 needs follow-up. It doesn’t measure severity.", "Any answer other than ‘Never’ on question 10 needs a same-day conversation about safety."],
  credit="Cox JL, Holden JM, Sagovsky R. Detection of postnatal depression: development of the 10-item Edinburgh Postnatal Depression Scale. British Journal of Psychiatry 1987;150:782–6. Reproduced without further permission, as the authors allow, with this citation.",
  online=""),
 dict(slug="asrs", name="ASRS screener", full="Adult ADHD Self-Report Scale screener (ASRS v1.1, Part A)", what="adult ADHD",
  stem="Rate how you have felt and conducted yourself over the past 6 months. Shaded boxes count.",
  opts=[("Never", 0), ("Rarely", 0), ("Sometimes", 0), ("Often", 0), ("Very often", 0)],
  shade=[[2, 3, 4], [2, 3, 4], [2, 3, 4], [3, 4], [3, 4], [3, 4]],
  items=["How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?", "How often do you have difficulty getting things in order when you have to do a task that requires organization?", "How often do you have problems remembering appointments or obligations?", "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?", "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?", "How often do you feel overly active and compelled to do things, like you were driven by a motor?"],
  extra="",
  key=["Count the ticks in shaded boxes.", "4 or more suggests symptoms consistent with adult ADHD and that a full assessment is worthwhile.", "A screen only: diagnosis needs a clinical assessment, including childhood history."],
  credit="© New York University and Ronald C. Kessler, PhD. All rights reserved. Kessler RC et al. Psychological Medicine 2005;35:245–56. Free to use; the official version is at hcp.med.harvard.edu/ncs/asrs.php.",
  online=""),
 dict(slug="stop-bang", name="STOP-Bang", full="STOP-Bang questionnaire", what="obstructive sleep apnoea risk",
  stem="Answer yes or no to each question.",
  opts=None,
  items=[("Snoring: Do you snore loudly (louder than talking or loud enough to be heard through closed doors)?", YN),
         ("Tired: Do you often feel tired, fatigued or sleepy during the daytime?", YN),
         ("Observed: Has anyone observed you stop breathing during your sleep?", YN),
         ("Pressure: Do you have or are you being treated for high blood pressure?", YN),
         ("BMI: Is your body mass index more than 35 kg/m²?", YN),
         ("Age: Are you over 50 years old?", YN),
         ("Neck: Is your neck circumference greater than 40 cm?", YN),
         ("Gender: Are you male?", YN)],
  extra="",
  key=["Count the yes answers. Total 0 to 8.", "0–2 low risk · 3–4 intermediate risk · 5–8 high risk of obstructive sleep apnoea.", "Also high risk: 2 or more of the first four (STOP) plus male, BMI over 35 or neck over 40 cm. A sleep study confirms it."],
  credit="STOP-Bang © University Health Network (Chung F et al., Anesthesiology 2008; Chest 2016). Free for clinical, academic and non-commercial use; reproduced unmodified with this notice. www.stopbang.ca",
  online=""),
 dict(slug="falls-risk", name="Falls risk check", full="Falls risk self-check (Stay Independent)", what="risk of falls in older adults",
  stem="Tick yes or no for each statement.",
  opts=None,
  items=[("I have fallen in the past year.", [("No", 0), ("Yes", 2)]),
         ("I use or have been advised to use a walking stick or walker to get around safely.", [("No", 0), ("Yes", 2)]),
         ("Sometimes I feel unsteady when I am walking.", YN),
         ("I steady myself by holding onto furniture when walking at home.", YN),
         ("I am worried about falling.", YN),
         ("I need to push with my hands to stand up from a chair.", YN),
         ("I have some trouble stepping up onto a kerb.", YN),
         ("I often have to rush to the toilet.", YN),
         ("I have lost some feeling in my feet.", YN),
         ("I take medicine that sometimes makes me feel light-headed or more tired than usual.", YN),
         ("I take medicine to help me sleep or improve my mood.", YN),
         ("I often feel sad or depressed.", YN)],
  extra="",
  key=["Add the points. 4 or more means you may be at risk of falling.", "Take this to your GP: many causes can be fixed (medicines, eyesight, feet, home hazards, strength and balance exercise).", "Strength and balance programs (such as tai chi) reduce falls by about a quarter."],
  credit="Adapted from the CDC STEADI ‘Stay Independent’ brochure (Rubenstein et al., J Safety Res 2011), a US public domain resource; spelling adapted for Australia.",
  online=""),
]
FREQ = [("Never", 0), ("Less than monthly", 1), ("Monthly", 2), ("Weekly", 3), ("Daily or almost daily", 4)]
YES = [("No", 0), ("Yes, but not in the last year", 2), ("Yes, during the last year", 4)]

def qsheet(q):
    rows = []
    if q["opts"]:
        sh = q.get("shade")
        head = "<tr><th></th><th style='text-align:left'>" + E(q["stem"]) + "</th>" + "".join(("<th>%s</th>" % E(o)) if sh else ("<th>%s<br>(%d)</th>" % (E(o), p)) for o, p in q["opts"]) + "</tr>"
        for i, it in enumerate(q["items"], 1):
            rows.append("<tr><td class='n'>%d</td><td class='q'>%s</td>%s</tr>" % (i, L(it), "".join("<td class='b%s'><i></i></td>" % (" sh" if sh and j in sh[i - 1] else "") for j in range(len(q["opts"])))))
        if not sh: rows.append("<tr><td></td><td style='text-align:right'><b>Column totals</b></td>%s</tr>" % "".join("<td class='b'>+ ____</td>" for _ in q["opts"]))
        t = "<table class='pr-t'>" + head + "".join(rows) + "</table>"
    else:
        body = ""
        for i, (it, op) in enumerate(q["items"], 1):
            op = FREQ if op == "F" else YES if op == "Y" else op
            body += "<tr><td class='n'>%d</td><td class='q'>%s</td><td class='a'>%s</td><td class='b'>____</td></tr>" % (i, L(it), " ".join('<span class="pr-opt"><i style="display:inline-block;width:12px;height:12px;border:1.5px solid #333;border-radius:2px;vertical-align:-2px"></i> %s <small>(%d)</small></span>' % (E(o), p) for o, p in op))
        t = "<p class='pr-sub'>" + E(q["stem"]) + "</p><table class='pr-t qa'><tr><th></th><th style='text-align:left'>Question</th><th style='text-align:left'>Answer (points)</th><th>Score</th></tr>" + body + "</table>"
    ex = "<p>%s</p>" % q["extra"] if q["extra"] else ""
    return ('<div class="pr-sheet' + (' tight' if q["slug"] in ("audit", "epds", "k10") else '') + '"><p class="pr-brand">Malady Wise · Printable</p><h2>%s</h2>%s%s%s<p class="pr-score"><span>%s: ______</span></p>'
            '<ul class="pr-key">%s</ul><p class="pr-foot">%s Printed from maladywise.com/printables/%s/. A screening tool, not a diagnosis.</p></div>') % (
        E(q["full"]), WHO, t, ex, ("Ticks in shaded boxes" if q.get("shade") else "Total score"), "".join("<li>%s</li>" % K(k) for k in q["key"]), E(q["credit"]), q["slug"])

for q in Q:
    main = ('<p class="meta"><a href="/printables/">Printables</a> · Questionnaire</p>\n<h1>Printable %s</h1>\n'
            '<p class="lede">A one-page %s for %s, ready to print or save as a PDF. Free to copy and share.</p>\n%s\n%s\n'
            '<h2>Good to know</h2><ul><li>It screens; it doesn’t diagnose. A clinician puts the score together with the whole story.</li>'
            '<li>If you’re not safe right now, call 000. Lifeline is 13 11 14 (24 hours).</li></ul>') % (
        E(q["name"]), E(q["full"]), E(q["what"]),
        bar(' <a href="%s">Or do it online</a>' % q["online"] if q["online"] else ""), qsheet(q))
    page(q["slug"], "Printable %s: Free %s (PDF)" % (q["name"], q["full"].split(" (")[0]),
         "Free printable %s for %s: one A4 page with scoring key. Print or save as a PDF." % (q["full"], q["what"]), main)

# ---------- criteria, in our own words ----------
C = [
 dict(slug="fibromyalgia-criteria", name="Fibromyalgia criteria", src="Based on the 2016 revision of the American College of Rheumatology fibromyalgia criteria (Wolfe et al. 2016). Summarised in our own words.",
  lede="A checklist version of the 2016 fibromyalgia criteria: a pain map and a symptom score.",
  body=[("1. Widespread Pain Index (WPI): tick where you’ve had pain in the last week (score 0 to 19)",
         ["Left jaw", "Right jaw", "Left shoulder", "Right shoulder", "Left upper arm", "Right upper arm", "Left lower arm", "Right lower arm", "Left hip or buttock", "Right hip or buttock", "Left upper leg", "Right upper leg", "Left lower leg", "Right lower leg", "Neck", "Upper back", "Lower back", "Chest", "Abdomen"]),
        ("2. Symptom Severity (SS) score (0 to 12)",
         ["Tiredness over the last week: 0 none · 1 mild · 2 moderate · 3 severe", "Waking unrefreshed: 0 none · 1 mild · 2 moderate · 3 severe", "Thinking or memory problems: 0 none · 1 mild · 2 moderate · 3 severe", "In the last 6 months, headaches (1 point)", "In the last 6 months, pain or cramps in the lower abdomen (1 point)", "In the last 6 months, depression (1 point)"]),
        ("3. The criteria are met when all of these apply",
         ["WPI 7 or more and SS 5 or more, OR WPI 4 to 6 and SS 9 or more", "Pain in at least 4 of the 5 body regions (left upper, right upper, left lower, right lower, axial); jaw, chest and abdomen don’t count towards regions", "Symptoms at a similar level for at least 3 months", "A fibromyalgia diagnosis can stand alongside other diagnoses; it doesn’t exclude them"])],
  ),
 dict(slug="heds-criteria", name="hEDS criteria", src="Based on the 2017 International Classification of the Ehlers-Danlos Syndromes (Malfait et al. 2017). Summarised in our own words.",
  lede="A checklist version of the 2017 criteria for hypermobile Ehlers-Danlos syndrome. All three criteria must be met.",
  body=[("Criterion 1: generalised joint hypermobility (Beighton score)",
         ["Score 5 or more out of 9 for adults (6 or more before puberty; 4 or more over age 50)", "If the score is one point short, a ‘yes’ to 2 or more of the 5-point hypermobility questionnaire can count"]),
        ("Criterion 2, Feature A: tick each (5 or more needed for Feature A)",
         ["Unusually soft or velvety skin", "Mildly stretchy skin", "Unexplained stretch marks (back, groin, thighs, breasts, abdomen) without big weight changes", "Small fatty bumps on both heels when standing (piezogenic papules)", "Recurrent or multiple abdominal hernias", "Thin, wide scars at 2 or more sites (not the typical scars of classical EDS)", "Pelvic floor, rectal or uterine prolapse in a child, man or woman who hasn’t given birth, without another cause", "Crowded teeth and a high or narrow palate", "Long, slender fingers on both hands (positive thumb or wrist sign)", "Arm span at least 1.05 times height", "Mitral valve prolapse on echo (strict criteria)", "Widened aortic root (Z-score above +2)"]),
        ("Criterion 2, Features B and C (need 2 of A, B and C)",
         ["Feature B: a first-degree relative who independently meets these criteria", "Feature C: limb pain in 2 or more limbs, daily for 3 months or more", "Feature C: widespread pain for 3 months or more", "Feature C: repeated dislocations or clear joint instability without injury"]),
        ("Criterion 3: all of these",
         ["No unusual skin fragility (which points to another EDS type)", "Other inherited and acquired connective tissue conditions, including autoimmune rheumatic disease, ruled out", "Other causes of joint hypermobility (e.g. low muscle tone, other connective tissue conditions) ruled out"])],
  ),
 dict(slug="adhd-criteria", name="ADHD criteria checklist", src="Structure based on the DSM-5-TR criteria for ADHD. Symptom descriptions are in our own words, not the DSM wording. Diagnosis needs a full clinical assessment.",
  lede="A plain-English checklist that follows the structure of the DSM-5-TR ADHD criteria, for taking to an appointment.",
  body=[("Inattention: tick each that has often been true for 6 months or more",
         ["Misses details or makes careless mistakes", "Struggles to keep attention on tasks or play", "Seems not to listen when spoken to directly", "Doesn’t follow through or finish tasks", "Has trouble organising tasks and belongings", "Avoids or dislikes tasks needing sustained mental effort", "Loses things needed for tasks", "Easily distracted by things going on around them (or by thoughts, in adults)", "Forgetful in daily activities"]),
        ("Hyperactivity and impulsivity: tick each that has often been true for 6 months or more",
         ["Fidgets, taps or squirms", "Leaves their seat when expected to stay put", "Runs or climbs at the wrong times (adults: feels restless)", "Can’t do leisure activities quietly", "Always ‘on the go’, as if driven by a motor", "Talks a lot", "Blurts out answers before questions are finished", "Struggles to wait their turn", "Interrupts or intrudes on others"]),
        ("The rest of the criteria: all of these",
         ["6 or more in either list (5 or more if aged 17 or older)", "Several symptoms were present before age 12", "Several symptoms show up in 2 or more settings (e.g. home, school, work)", "They clearly get in the way of school, work or social life", "Not better explained by another condition (e.g. anxiety, mood, substance use)"])],
  ),
 dict(slug="depression-criteria", name="Depression criteria checklist", src="Structure based on the DSM-5-TR criteria for a major depressive episode. Symptom descriptions are in our own words, not the DSM wording. Diagnosis needs a clinical assessment.",
  lede="A plain-English checklist that follows the structure of the DSM-5-TR criteria for a major depressive episode.",
  body=[("Symptoms: tick each present most of the day, nearly every day, for the same 2 weeks",
         ["Low, sad or empty mood (or irritable, in young people)", "Lost interest or pleasure in most things", "Big change in appetite or weight", "Sleeping much less or much more than usual", "Moving or thinking noticeably slower, or restless, as seen by others", "Tired or low on energy", "Feeling worthless or excessively guilty", "Trouble thinking, concentrating or making decisions", "Thoughts of death or suicide, or a plan or attempt"]),
        ("The rest of the criteria: all of these",
         ["5 or more ticked, including low mood or loss of interest", "Causes real distress or gets in the way of daily life", "Not due to a substance, medicine or another medical condition", "Never had a manic or hypomanic episode (that would suggest bipolar disorder)"]),
        ("Safety", [])],
  ),
 dict(slug="mecfs-criteria", name="ME/CFS criteria", src="Based on the 2015 US National Academy of Medicine (formerly IOM) diagnostic criteria for ME/CFS. Summarised in our own words.",
  lede="A checklist version of the 2015 National Academy of Medicine criteria for ME/CFS (myalgic encephalomyelitis/chronic fatigue syndrome).",
  body=[("Core symptoms: all three needed",
         ["A big drop in what you can do at work, study, home or socially, lasting more than 6 months, with fatigue that is new, often profound, not from overdoing it and not much helped by rest", "Post-exertional malaise: symptoms get worse after physical, mental or emotional effort, often a day or more later, and take days or longer to recover", "Unrefreshing sleep: waking as tired as when you went to bed"]),
        ("Plus at least one of these",
         ["Thinking or memory problems (brain fog) that get worse with effort, stress or time pressure", "Orthostatic intolerance: symptoms worse when upright and better lying down (e.g. dizziness, racing heart; see the POTS stand test)"]),
        ("The rest of the criteria",
         ["Symptoms are present at least half the time, at moderate or severe intensity", "Other causes of fatigue have been looked for (e.g. anaemia, thyroid, sleep apnoea, depression, coeliac disease)", "ME/CFS can sit alongside other conditions such as fibromyalgia, POTS or long COVID"])],
  ),
 dict(slug="ibs-criteria", name="IBS criteria (Rome IV)", src="Based on the Rome IV criteria for irritable bowel syndrome (Lacy et al. 2016). Summarised in our own words.",
  lede="A checklist version of the Rome IV criteria for irritable bowel syndrome (IBS), plus the warning signs that need checking first.",
  body=[("Tummy pain: needed",
         ["Recurring abdominal pain, on average at least 1 day a week over the last 3 months"]),
        ("Plus at least 2 of these",
         ["The pain is linked to doing a poo (better or worse)", "The pain started with a change in how often you go", "The pain started with a change in what your poo looks like (harder or looser)"]),
        ("Timing",
         ["Symptoms for the last 3 months, starting at least 6 months ago"]),
        ("Warning signs to raise with your GP first (they need tests, not just an IBS label)",
         ["New symptoms after age 50", "Weight loss you can’t explain", "Blood in the poo or black poo", "Waking at night to open your bowels", "Low iron or anaemia", "Family history of bowel cancer, coeliac disease or inflammatory bowel disease", "Fever or a lump in the tummy"])],
  ),
 dict(slug="pcos-criteria", name="PCOS criteria", src="Based on the 2023 International Evidence-based Guideline for the Assessment and Management of Polycystic Ovary Syndrome (Monash University). Summarised in our own words.",
  lede="A checklist version of the 2023 international criteria for polycystic ovary syndrome (PCOS) in adults, with the different rules for teenagers.",
  body=[("Adults: tick each (2 or more needed)",
         ["Irregular periods or no ovulation: cycles shorter than 21 or longer than 35 days, or fewer than 8 periods a year", "High androgens: excess hair growth in a male pattern, acne or hair thinning, or high testosterone on a blood test", "Polycystic ovaries on ultrasound, OR a high AMH blood test (adults only)"]),
        ("Teenagers (less than 8 years after the first period)",
         ["Both irregular cycles AND high androgens are needed", "Ultrasound and AMH aren’t used at this age, because many healthy teenage ovaries look ‘polycystic’", "Irregular in the first year after periods start is normal"]),
        ("Ruled out first",
         ["Thyroid problems", "High prolactin", "Non-classic congenital adrenal hyperplasia", "Pregnancy (if no periods)"])],
  ),
 dict(slug="mcas-criteria", name="MCAS criteria", src="Based on the international consensus criteria for mast cell activation syndrome (Valent et al. 2012, updated 2019). Summarised in our own words.",
  lede="A checklist version of the consensus criteria for mast cell activation syndrome (MCAS). All three criteria are needed.",
  body=[("1. Typical episodes: severe, recurring, in 2 or more body systems at once",
         ["Skin: flushing, itch, hives or swelling", "Gut: cramps, diarrhoea, nausea or vomiting", "Heart and circulation: fast heart rate, low blood pressure or fainting", "Breathing: wheeze, throat tightness or a blocked nose", "Eyes: red, itchy eyes"]),
        ("2. Proof that mast cells are involved",
         ["Best test: blood tryptase taken within 1 to 4 hours of an episode is raised by more than 20% plus 2 ng/mL above your own baseline (taken when well)", "Other urine or blood markers (e.g. histamine metabolites, prostaglandin D2 metabolites) can support it"]),
        ("3. Response to treatment",
         ["Symptoms clearly improve with medicines that block mast cell chemicals (e.g. antihistamines for H1 and H2, or mast cell stabilisers)"]),
        ("Also checked",
         ["Other causes, such as allergy, other skin, gut or heart conditions, and mastocytosis (a raised baseline tryptase over 20 ng/mL needs specialist review)"])],
  ),
 dict(slug="autism-criteria", name="Autism criteria checklist", src="Structure based on the DSM-5-TR criteria for autism spectrum disorder. Descriptions are in our own words, not the DSM wording. Diagnosis needs a full assessment by an experienced clinician.",
  lede="A plain-English checklist that follows the structure of the DSM-5-TR autism criteria, for taking to an assessment.",
  body=[("A. Social communication: all three, now or in the past",
         ["Back-and-forth social connection is different (e.g. conversation, sharing interests or feelings)", "Non-verbal communication is different (e.g. eye contact, gestures, facial expressions, tone)", "Making, keeping or understanding relationships is hard (e.g. adjusting to social settings, making friends)"]),
        ("B. Repetitive patterns: at least two, now or in the past",
         ["Repetitive movements, use of objects or speech (e.g. lining things up, echoing phrases, stimming)", "Strong need for sameness, routines or rituals; small changes are very distressing", "Intense, focused interests that are unusual in strength or focus", "Over- or under-sensitivity to sound, light, touch, smell, taste, pain or temperature"]),
        ("The rest of the criteria: all of these",
         ["Signs were present from early childhood, even if they only became obvious later or were masked", "They cause real difficulty in social, work, study or daily life", "Not better explained by intellectual disability or global developmental delay"])],
  ),
 dict(slug="gca-criteria", name="Giant cell arteritis criteria", src="Based on the 2022 American College of Rheumatology/EULAR classification criteria for giant cell arteritis (Ponte et al. 2022). Summarised in our own words.",
  lede="A points checklist following the 2022 ACR/EULAR classification criteria for giant cell arteritis (temporal arteritis).",
  body=[("Entry requirement",
         ["Age 50 or older at diagnosis", "Urgent: new headache with vision changes over age 50 needs same-day medical review; vision loss can be permanent"]),
        ("Clinical points",
         ["Morning stiffness in the shoulders or neck: 2", "Sudden vision loss: 3", "Jaw or tongue pain when chewing or talking: 2", "New headache at the temples: 2", "Scalp tenderness: 2", "Abnormal temporal artery on examination (tender, thickened or weak pulse): 2"]),
        ("Test points",
         ["Highest ESR 50 mm/h or more, or CRP 10 mg/L or more: 3", "Positive temporal artery biopsy, or halo sign on ultrasound: 5", "Both armpit arteries involved on imaging: 2", "PET scan activity along the aorta: 2"]),
        ("Result",
         ["6 or more points (with age 50+) classifies as giant cell arteritis", "These are classification criteria for research; doctors also use clinical judgement, and treatment often starts before tests come back"])],
  ),
]
for c in C:
    secs = ""
    for h, items in c["body"]:
        if h == "Safety":
            secs += '<h3>Safety</h3><ul><li class="nb">If you have thoughts of suicide, talk to someone today: Lifeline 13 11 14, or 000 in an emergency.</li></ul>'
            continue
        secs += "<h3>%s</h3><ul%s>%s</ul>" % (H(h), ' class="c2"' if len(items) > 10 and max(len(x) for x in items) < 60 else "", "".join("<li>%s</li>" % L(x) for x in items))
    sheet = '<div class="pr-sheet pr-crit"><p class="pr-brand">Malady Wise · Checklist</p><h2>%s</h2>%s%s<p class="pr-foot">%s Printed from maladywise.com/printables/%s/. For discussion with a clinician; it can’t diagnose on its own.</p></div>' % (E(c["name"]), WHO, secs, E(c["src"]), c["slug"])
    main = ('<p class="meta"><a href="/printables/">Printables</a> · Criteria</p>\n<h1>Printable %s</h1>\n<p class="lede">%s</p>\n%s\n%s') % (E(c["name"]), E(c["lede"]), bar(), sheet)
    page(c["slug"], "Printable %s (Free Checklist PDF)" % c["name"], c["lede"] + " One A4 page, free to print or save as a PDF.", main)


# ---------- POTS active stand test record (our own form, following the Australian POTS Foundation method) ----------
rows = "".join("<tr><td>%s</td><td></td><td></td><td></td></tr>" % t for t in ["Lying, after 5 minutes", "Standing: straight away", "1 minute", "2 minutes", "3 minutes", "4 minutes", "5 minutes", "6 minutes", "7 minutes", "8 minutes", "9 minutes", "10 minutes"])
sheet = ('<div class="pr-sheet"><p class="pr-brand">Malady Wise · Record sheet</p><h2>POTS active stand test: record sheet</h2>' + WHO +
  '<p class="pr-sub">Lie still for 5 minutes, then stand up without leaning or fidgeting. Have someone record heart rate (HR) and blood pressure (BP). Sit or lie down straight away if you feel faint.</p>'
  '<table class="pr-t"><tr><th style="text-align:left">Time</th><th>Heart rate (beats/min)</th><th>Blood pressure (mmHg)</th><th style="text-align:left">Symptoms (dizzy, foggy, shaky, short of breath, colour change in legs)</th></tr>' + rows + '</table>'
  '<p class="pr-score"><span>Highest standing HR − lying HR = ______</span><span>Lowest standing BP: ______</span></p>'
  '<ul class="pr-key"><li>Supports POTS: heart rate rises by 30 or more (40 or more if under 19) on at least two readings within 10 minutes, without blood pressure falling by 20/10 mmHg or more.</li>'
  '<li>One normal test doesn’t rule POTS out. Repeat on a bad day, in the morning, before caffeine and fluids.</li>'
  '<li>Bring this sheet to your GP. It doesn’t diagnose POTS on its own: other causes need to be checked.</li></ul>'
  '<p class="pr-foot">Method as recommended by the Australian POTS Foundation (Seeley, Healthed 2025); criteria from the Heart Rhythm Society consensus. Printed from maladywise.com/printables/pots-stand-test/.</p></div>')
main = ('<p class="meta"><a href="/printables/">Printables</a> · Record sheet</p>\n<h1>POTS stand test record sheet</h1>\n'
        '<p class="lede">A one-page sheet for recording lying and standing heart rate and blood pressure, the test GPs use to check for POTS.</p>\n' + bar(' <a href="/pots/">About POTS</a>') + "\n" + sheet)
page("pots-stand-test", "POTS Stand Test Record Sheet (Free Printable PDF)", "Free printable POTS active stand test sheet: lying and standing heart rate and blood pressure every minute for 10 minutes, with what the results mean.", main)


# ---------- Beighton score (public domain scoring; our own layout) ----------
bt = [("Bend the little finger back beyond 90°", True), ("Bring the thumb to touch the forearm", True), ("Elbow straightens past 10°", True), ("Knee straightens past 10°", True), ("Palms flat on the floor with knees straight", False)]
rows = "".join("<tr><td class='n'>%d</td><td class='q'>%s</td><td class='b'><i></i></td><td class='b'>%s</td></tr>" % (i + 1, E(t), "<i></i>" if two else "–") for i, (t, two) in enumerate(bt))
sheet = ('<div class="pr-sheet"><p class="pr-brand">Malady Wise · Score sheet</p><h2>Beighton score: joint hypermobility</h2>' + WHO +
  '<p class="pr-sub">One point for each side that can do it. A clinician should check the angles.</p>'
  "<table class='pr-t'><tr><th></th><th style='text-align:left'>Test</th><th>Left (1)</th><th>Right (1)</th></tr>" + rows + "</table>"
  '<p class="pr-score"><span>Total (out of 9): ______</span></p>'
  '<ul class="pr-key"><li>Generalised hypermobility: 5 or more in adults (6 or more before puberty; 4 or more over age 50).</li>'
  '<li>Hypermobility on its own is common and often harmless. It matters when it comes with pain, injuries or other features: see the <a href="/printables/heds-criteria/">hEDS checklist</a>.</li></ul>'
  '<p class="pr-foot">Beighton P et al., Ann Rheum Dis 1973; age cut-offs from the 2017 hEDS criteria (Malfait et al.). Printed from maladywise.com/printables/beighton-score/.</p></div>')
main = ('<p class="meta"><a href="/printables/">Printables</a> · Score sheet</p>\n<h1>Printable Beighton score</h1>\n'
        '<p class="lede">A one-page sheet for scoring joint hypermobility (the 9-point Beighton score), ready to print or save as a PDF.</p>\n' + bar(' <a href="/ehlers-danlos-syndrome/">About EDS and hypermobility</a>') + "\n" + sheet)
page("beighton-score", "Printable Beighton Score Sheet (Free PDF)", "Free printable Beighton score sheet for joint hypermobility: 9 points, left and right, with adult, child and over-50 cut-offs.", main)

# ---------- hub ----------
def li(slug, t, s): return '<li><a href="/printables/%s/"><b>%s</b><span>%s</span></a></li>' % (slug, E(t), E(s))
hub = ('<p class="meta"><a href="/tools/">Tools</a> · Printables</p>\n<h1>Printables</h1>\n'
       '<p class="lede">Free one-page questionnaires and criteria checklists. Print them or save as a PDF. Nothing you fill in online is stored.</p>\n'
       '<h2>Questionnaires</h2><ul class="pr-hub">' + "".join(li(q["slug"], q["name"], q["full"].split(" (")[0]) for q in Q) + '</ul>\n'
       '<h2>Record sheets</h2><ul class="pr-hub">' + li("pots-stand-test", "POTS stand test", "Lying and standing heart rate, 10 minutes") + li("beighton-score", "Beighton score", "Joint hypermobility, 9 points") + '</ul>\n'
       '<h2>Diagnostic criteria checklists</h2><ul class="pr-hub">' + "".join(li(c["slug"], c["name"], c["lede"].split(":")[0]) for c in C) + '</ul>\n'
       '<h2>Not here, and why</h2><ul>'
       '<li><b>DASS-21:</b> free for clinicians, but its authors ask that it isn’t offered to the public on websites. Ask your GP or psychologist. Details: www2.psy.unsw.edu.au/dass.</li>'
       '<li><b>ASRS 18-question checklist:</b> needs permission; the free 6-question screener is here.</li><li><b>Epworth Sleepiness Scale:</b> licensed, so we can’t reproduce it. Your GP or sleep clinic will have a copy.</li>'
       '<li><b>RAADS-R:</b> copyrighted; ask the clinician doing your autism assessment.</li></ul>')
page("", "Printables: Free Printable Health Questionnaires and Criteria", "Free printable PHQ-9, GAD-7, K10, AUDIT, EPDS, ASRS, STOP-Bang and falls risk questionnaires, a Beighton score sheet, plus checklists for fibromyalgia, hEDS, ME/CFS, IBS, PCOS, MCAS, autism, ADHD, depression and giant cell arteritis criteria. One A4 page each.", hub)
print("printables built:", len(Q) + len(C) + 1)
