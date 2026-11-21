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
.pr-sheet{background:#fff;color:#1a1a1a;border:1px solid var(--line,#E7E0F2);border-radius:14px;padding:18px 18px 14px;font-size:13.5px;line-height:1.4}
.pr-sheet h2{font-size:19px;margin:0 0 2px;color:#1a1a1a}.pr-sheet .pr-sub{margin:0 0 10px;color:#444}
.pr-who{display:grid;grid-template-columns:2fr 1fr;gap:8px;margin:0 0 10px}.pr-who span{border-bottom:1px solid #999;padding:6px 0 2px;color:#555;font-size:12px}
.pr-t{width:100%;border-collapse:collapse;margin:0 0 8px}.pr-t th,.pr-t td{border:1px solid #bbb;padding:5px 6px;vertical-align:middle}
.pr-t th{background:#F1ECF8;font-size:11.5px;font-weight:600;text-align:center}.pr-t td.n{width:22px;text-align:center;color:#555}.pr-t td.b{text-align:center;width:9%;font-size:11px;color:#555}.pr-t td.q{width:auto;min-width:45%}
.pr-t td.b i{display:inline-block;width:13px;height:13px;border:1.5px solid #333;border-radius:2px;margin-right:4px;vertical-align:-2px}
.pr-t td.sh{background:#CFC6DE;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pr-score{display:flex;gap:16px;flex-wrap:wrap;margin:6px 0}.pr-score span{border:1.5px solid #333;border-radius:6px;padding:6px 12px;font-weight:600}
.pr-key{margin:6px 0 0;padding-left:18px}.pr-key li{margin:2px 0}
.pr-crit h3{font-size:14.5px;margin:12px 0 4px}.pr-crit ul{margin:0 0 4px;padding-left:0;list-style:none}.pr-crit li{margin:3px 0;padding-left:22px;position:relative}
.pr-crit li::before{content:"";position:absolute;left:0;top:2px;width:12px;height:12px;border:1.5px solid #333;border-radius:2px}
.pr-crit li.nb::before{display:none}
.pr-foot{margin:10px 0 0;font-size:11px;color:#555;border-top:1px solid #ddd;padding-top:6px}
.pr-hub{list-style:none!important;padding:0!important;display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
.pr-hub li{margin:0!important}.pr-hub a{display:block;background:var(--card,#fff);border:1px solid var(--line,#E7E0F2);border-radius:14px;padding:12px 14px;text-decoration:none;color:var(--ink)}
.pr-hub b{display:block;color:var(--brand,#4A3480)}.pr-hub span{font-size:14px}
@media print{@page{size:A4;margin:12mm}
 body *{visibility:hidden!important}.pr-sheet,.pr-sheet *{visibility:visible!important}
 .pr-sheet{position:absolute;left:0;top:0;width:100%;border:0;border-radius:0;padding:0;font-size:9.5pt}.pr-t th,.pr-t td{padding:3px 5px}.pr-crit li{margin:1px 0}.pr-crit h3{margin:8px 0 3px}
 html,body{background:#fff!important}}
</style>"""

def page(slug, title, desc, main):
    url = "https://maladywise.com/printables/%s" % (slug + "/" if slug else "")
    h = HEAD
    h = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="%s">' % url, h)
    h = re.sub(r'<title>.*?</title>', "<title>%s</title>" % E(title), h)
    h = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + E(desc), h)
    h = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + E(title), h)
    h = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda m: m.group(1) + E(desc), h)
    h = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + url, h)
    out = h + '<main class="wrap doc">\n' + main + "\n" + CSS + '\n<p class="meta">Updated %s.</p>\n</main>\n<script>document.addEventListener("click",function(e){if(e.target.closest("[data-print]")){e.preventDefault();window.print();}});</script>\n<script>MW.page();</script>\n</body>\n</html>\n' % TODAY
    d = ROOT + "printables/" + (slug + "/" if slug else "")
    os.makedirs(d, exist_ok=True)
    open(d + "index.html", "w", encoding="utf-8").write(out)

WHO = '<div class="pr-who"><span>Name</span><span>Date</span></div>'

def bar(extra=""):
    return '<p class="pr-bar"><button type="button" class="pr-btn" data-print>&#128424; Print or save as PDF</button>' + extra + "</p>"

# ---------- questionnaires ----------
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
]
FREQ = [("Never", 0), ("Less than monthly", 1), ("Monthly", 2), ("Weekly", 3), ("Daily or almost daily", 4)]
YES = [("No", 0), ("Yes, but not in the last year", 2), ("Yes, during the last year", 4)]

def qsheet(q):
    rows = []
    if q["opts"]:
        sh = q.get("shade")
        head = "<tr><th></th><th style='text-align:left'>" + E(q["stem"]) + "</th>" + "".join(("<th>%s</th>" % E(o)) if sh else ("<th>%s<br>(%d)</th>" % (E(o), p)) for o, p in q["opts"]) + "</tr>"
        for i, it in enumerate(q["items"], 1):
            rows.append("<tr><td class='n'>%d</td><td class='q'>%s</td>%s</tr>" % (i, E(it), "".join("<td class='b%s'><i></i></td>" % (" sh" if sh and j in sh[i - 1] else "") for j in range(len(q["opts"])))))
        if not sh: rows.append("<tr><td></td><td style='text-align:right'><b>Column totals</b></td>%s</tr>" % "".join("<td class='b'>+ ____</td>" for _ in q["opts"]))
        t = "<table class='pr-t'>" + head + "".join(rows) + "</table>"
    else:
        body = ""
        for i, (it, op) in enumerate(q["items"], 1):
            op = FREQ if op == "F" else YES if op == "Y" else op
            body += "<tr><td class='n'>%d</td><td>%s</td><td>%s</td><td class='b'>____</td></tr>" % (i, E(it), " ".join('<span style="display:inline-block;margin:1px 10px 1px 0"><i style="display:inline-block;width:12px;height:12px;border:1.5px solid #333;border-radius:2px;vertical-align:-2px"></i> %s <small>(%d)</small></span>' % (E(o), p) for o, p in op))
        t = "<p class='pr-sub'>" + E(q["stem"]) + "</p><table class='pr-t'><tr><th></th><th style='text-align:left'>Question</th><th style='text-align:left'>Answer (points)</th><th>Score</th></tr>" + body + "</table>"
    ex = "<p>%s</p>" % q["extra"] if q["extra"] else ""
    return ('<div class="pr-sheet"><h2>%s</h2>%s%s%s<p class="pr-score"><span>%s: ______</span></p>'
            '<ul class="pr-key">%s</ul><p class="pr-foot">%s Printed from maladywise.com/printables/%s/. A screening tool, not a diagnosis.</p></div>') % (
        E(q["full"]), WHO, t, ex, ("Ticks in shaded boxes" if q.get("shade") else "Total score"), "".join("<li>%s</li>" % E(k) for k in q["key"]), E(q["credit"]), q["slug"])

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
]
for c in C:
    secs = ""
    for h, items in c["body"]:
        if h == "Safety":
            secs += '<h3>Safety</h3><ul><li class="nb">If you have thoughts of suicide, talk to someone today: Lifeline 13 11 14, or 000 in an emergency.</li></ul>'
            continue
        secs += "<h3>%s</h3><ul>%s</ul>" % (E(h), "".join("<li>%s</li>" % E(x) for x in items))
    sheet = '<div class="pr-sheet pr-crit"><h2>%s</h2>%s%s<p class="pr-foot">%s Printed from maladywise.com/printables/%s/. For discussion with a clinician; it can’t diagnose on its own.</p></div>' % (E(c["name"]), WHO, secs, E(c["src"]), c["slug"])
    main = ('<p class="meta"><a href="/printables/">Printables</a> · Criteria</p>\n<h1>Printable %s</h1>\n<p class="lede">%s</p>\n%s\n%s') % (E(c["name"]), E(c["lede"]), bar(), sheet)
    page(c["slug"], "Printable %s (Free Checklist PDF)" % c["name"], c["lede"] + " One A4 page, free to print or save as a PDF.", main)

# ---------- hub ----------
def li(slug, t, s): return '<li><a href="/printables/%s/"><b>%s</b><span>%s</span></a></li>' % (slug, E(t), E(s))
hub = ('<p class="meta"><a href="/tools/">Tools</a> · Printables</p>\n<h1>Printables</h1>\n'
       '<p class="lede">Free one-page questionnaires and criteria checklists. Print them or save as a PDF. Nothing you fill in online is stored.</p>\n'
       '<h2>Questionnaires</h2><ul class="pr-hub">' + "".join(li(q["slug"], q["name"], q["full"].split(" (")[0]) for q in Q) + '</ul>\n'
       '<h2>Diagnostic criteria checklists</h2><ul class="pr-hub">' + "".join(li(c["slug"], c["name"], c["lede"].split(":")[0]) for c in C) + '</ul>\n'
       '<h2>Not here, and why</h2><ul>'
       '<li><b>DASS-21:</b> free for clinicians, but its authors ask that it isn’t offered to the public on websites. Ask your GP or psychologist. Details: www2.psy.unsw.edu.au/dass.</li>'
       '<li><b>ASRS 18-question checklist:</b> needs permission; the free 6-question screener is here.</li><li><b>Epworth Sleepiness Scale:</b> licensed, so we can’t reproduce it. Your GP or sleep clinic will have a copy.</li>'
       '<li><b>RAADS-R:</b> copyrighted; ask the clinician doing your autism assessment.</li></ul>')
page("", "Printables: Free Printable Health Questionnaires and Criteria", "Free printable PHQ-9, GAD-7, K10, AUDIT, EPDS and ASRS questionnaires, plus checklists for fibromyalgia, hEDS, ADHD and depression criteria. One A4 page each.", hub)
print("printables built:", len(Q) + len(C) + 1)
