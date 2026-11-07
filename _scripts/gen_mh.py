#!/usr/bin/env python3
"""Generate /mental-health-check/ pages. Run: python3 gen_mh.py <repo>"""
import json, re, sys, os, html
R = sys.argv[1]
idx = open(os.path.join(R, "index.html")).read()
V = {k: re.search(k + r"\?v=(\d+)", idx).group(1) for k in ("shell.css", "games.js", "site.js", "shell.js")}
BASE = "https://maladywise.com"
REV = "Reviewed 8 November 2026"

def esc(s): return html.escape(s, quote=True)

def head(path, title, desc, lds):
    t = title + " | Malady Wise"
    ld = "".join('<script type="application/ld+json">' + json.dumps(x, ensure_ascii=False) + "</script>\n" for x in lds)
    return f'''<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<link rel="canonical" href="{BASE}{path}">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{esc(t)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<meta name="theme-color" content="#4A3480">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Malady Wise">
<meta property="og:type" content="website">
<meta property="og:url" content="{BASE}{path}">
<meta property="og:title" content="{esc(t)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:image" content="https://maladywise.com/assets/og/facts.png?v=2">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@600;700&amp;family=Poppins:wght@400;500;600&amp;display=swap">
<link rel="stylesheet" href="/assets/shell.css?v={V['shell.css']}">
<link rel="stylesheet" href="/mental-health-check/mhc.css?v=1">
<script src="/assets/games.js?v={V['games.js']}"></script>
<script src="/assets/site.js?v={V['site.js']}"></script>
<script src="/assets/shell.js?v={V['shell.js']}"></script>
{ld}</head>
<body>
<main class="wrap doc mhc">
'''

HELP_NOW = ('<p class="help-now" role="note"><b>Need help now?</b> In Australia call Lifeline on <a href="tel:131114">13 11 14</a> (24/7) '
            'or <a href="tel:000">000</a> in an emergency. Elsewhere, see <a href="#crisis">support lines by country</a> or '
            '<a href="https://findahelpline.com/" rel="noopener">findahelpline.com</a>.</p>')

CRISIS = '''<section id="crisis" class="support" aria-labelledby="crisis-h">
<h2 id="crisis-h">Support lines</h2>
<p>If you or someone else is in danger right now, call your emergency number. To talk to someone, any time:</p>
<ul>
<li><b>Australia:</b> Lifeline <a href="tel:131114">13 11 14</a> (24/7, or text <a href="sms:0477131114">0477 13 11 14</a>), Suicide Call Back Service <a href="tel:1300659467">1300 659 467</a>, Beyond Blue <a href="tel:1300224636">1300 22 4636</a>, 13YARN <a href="tel:139276">13 92 76</a> for Aboriginal and Torres Strait Islander people. Emergency: <a href="tel:000">000</a>.</li>
<li><b>Young people in Australia:</b> Kids Helpline <a href="tel:1800551800">1800 55 1800</a> (24/7, ages 5 to 25) or <a href="https://headspace.org.au/" rel="noopener">headspace</a> (ages 12 to 25).</li>
<li><b>New Zealand:</b> call or text <a href="tel:1737">1737</a>. Emergency: <a href="tel:111">111</a>.</li>
<li><b>UK and Ireland:</b> Samaritans <a href="tel:116123">116 123</a>. Emergency: <a href="tel:999">999</a> (or 112).</li>
<li><b>US and Canada:</b> call or text <a href="tel:988">988</a>. Emergency: <a href="tel:911">911</a>.</li>
<li><b>Anywhere else:</b> <a href="https://findahelpline.com/" rel="noopener">findahelpline.com</a> lists free helplines in more than 100 countries.</li>
</ul>
</section>'''

NEXT = '''<section id="next-steps" class="next" aria-labelledby="next-h">
<h2 id="next-h">What to do next</h2>
<h3>In Australia</h3>
<ul>
<li><b>See your GP.</b> Take your score with you if it helps start the conversation. Your GP can talk through how you’ve been, check for physical causes (such as thyroid problems, anaemia or medicine side effects) and discuss options.</li>
<li><b>Mental Health Treatment Plan.</b> If it would help, your GP can prepare a Mental Health Treatment Plan. Under the Better Access program, this gives Medicare rebates for up to 10 individual sessions a calendar year with a psychologist or another eligible mental health professional. Since 1 November 2025, the plan is made by your usual GP or at the practice where you’re registered with MyMedicare.</li>
<li><b>Free help without a referral:</b> <a href="https://www.mindspot.org.au/" rel="noopener">MindSpot</a> (free online and phone assessment and courses for adults), <a href="https://www.medicarementalhealth.gov.au/" rel="noopener">Medicare Mental Health</a> (formerly Head to Health; phone <a href="tel:1800595212">1800 595 212</a>, weekdays) and <a href="https://www.beyondblue.org.au/get-support" rel="noopener">Beyond Blue</a> (24/7 phone and web chat).</li>
</ul>
<h3>Outside Australia</h3>
<ul>
<li><b>See your GP or family doctor</b> and mention your score.</li>
<li><b>UK:</b> in England you can refer yourself to <a href="https://www.nhs.uk/nhs-services/mental-health-services/find-nhs-talking-therapies-for-anxiety-and-depression/" rel="noopener">NHS Talking Therapies</a> without seeing a GP first.</li>
<li><b>US:</b> the <a href="https://www.samhsa.gov/find-help/helplines/national-helpline" rel="noopener">SAMHSA National Helpline</a> (<a href="tel:18006624357">1-800-662-4357</a>) offers free, confidential treatment referral 24/7, and <a href="https://988lifeline.org/" rel="noopener">988</a> is there for anyone in distress.</li>
<li><b>New Zealand:</b> your GP, or call or text <a href="tel:1737">1737</a> to talk with a trained counsellor.</li>
</ul>
<h3>Things that often help</h3>
<ul>
<li>Tell one person you trust how you’re really going.</li>
<li>Keep regular sleep and wake times, move your body most days, and go easy on alcohol.</li>
<li>Plan one small, doable thing each day that you enjoy or that gives a sense of achievement.</li>
<li>Read more in our <a href="/depression/">depression</a> and <a href="/anxiety/">anxiety</a> fact sheets.</li>
</ul>
</section>'''

ADULTS = ('<p class="intro-note"><b>For adults (18 and over).</b> For young people, talk to a GP, or contact '
          '<a href="https://kidshelpline.com.au/" rel="noopener">Kids Helpline</a> on <a href="tel:1800551800">1800 55 1800</a> or '
          '<a href="https://headspace.org.au/" rel="noopener">headspace</a> (Australia).</p>')

PRIV = ('<p class="privacy"><b>Private by design:</b> your answers stay in this browser tab. They aren’t saved, sent or '
        'tracked, and they disappear when you close or refresh the page. (Like every page on Malady Wise, we count anonymous page visits, '
        'without cookies, but never your answers or score.)</p>')

def faq_html(faqs):
    return '<section class="faq"><h2>Common questions</h2>' + "".join(
        f"<details><summary>{esc(q)}</summary><p>{a}</p></details>" for q, a in faqs) + "</section>"

def faq_ld(faqs):
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": re.sub("<[^>]+>", "", a)}} for q, a in faqs]}

def page_ld(path, name, desc, crumbs, about=None):
    d = {"@context": "https://schema.org", "@type": "MedicalWebPage", "name": name, "description": desc,
         "url": BASE + path, "inLanguage": "en-AU",
         "audience": {"@type": "MedicalAudience", "audienceType": "Patient"},
         "author": {"@type": "Organization", "name": "Malady Wise", "url": BASE + "/"},
         "publisher": {"@type": "Organization", "name": "Malady Wise", "url": BASE + "/"},
         "reviewedBy": {"@type": "Person", "jobTitle": "General Practitioner", "description": "Australian GP"},
         "lastReviewed": "2026-11-08",
         "isAccessibleForFree": True,
         "breadcrumb": {"@type": "BreadcrumbList", "itemListElement": [
             {"@type": "ListItem", "position": i + 1, "name": n, "item": BASE + u} for i, (n, u) in enumerate(crumbs)]}}
    if about: d["about"] = about
    return d

FOOT = '''<p class="meta"><em>{rev}. General education, not personal medical advice. These checks don’t diagnose any condition; talk to your GP or doctor about your results.</em></p>
<footer class="site">General education, not personal medical advice.<br><a href="/">Malady Wise</a> · <a href="/about/">About</a> · <a href="/disclaimer/">Disclaimer</a> · <a href="/privacy/">Privacy</a> · <a href="/contact/">Contact</a></footer>
</main>
{scripts}<script>MW.page();</script>
</body>
</html>
'''

def write(path, s):
    p = os.path.join(R, path.strip("/"), "index.html")
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w").write(s)
    print("wrote", p, len(s))

# ---------- scales ----------
F4 = [("Not at all", 0), ("Several days", 1), ("More than half the days", 2), ("Nearly every day", 3)]
K5 = [("None of the time", 1), ("A little of the time", 2), ("Some of the time", 3), ("Most of the time", 4), ("All of the time", 5)]
DIFF = ["Not difficult at all", "Somewhat difficult", "Very difficult", "Extremely difficult"]

PHQ = ["Little interest or pleasure in doing things",
       "Feeling down, depressed, or hopeless",
       "Trouble falling or staying asleep, or sleeping too much",
       "Feeling tired or having little energy",
       "Poor appetite or overeating",
       "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
       "Trouble concentrating on things, such as reading the newspaper or watching television",
       "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
       "Thoughts that you would be better off dead or of hurting yourself in some way"]
GAD = ["Feeling nervous, anxious or on edge",
       "Not being able to stop or control worrying",
       "Worrying too much about different things",
       "Trouble relaxing",
       "Being so restless that it is hard to sit still",
       "Becoming easily annoyed or irritable",
       "Feeling afraid as if something awful might happen"]
K10 = ["tired out for no good reason", "nervous", "so nervous that nothing could calm you down", "hopeless",
       "restless or fidgety", "so restless you could not sit still", "depressed", "that everything was an effort",
       "so sad that nothing could cheer you up", "worthless"]

def fieldsets(items, opts, prefix=""):
    h = []
    for i, it in enumerate(items, 1):
        lab = (prefix + it + "?") if prefix else it
        o = "".join(f'<label><input type="radio" name="q{i}" value="{v}"><span>{esc(t)}</span><span class="pts" aria-hidden="true">{v}</span></label>' for t, v in opts)
        h.append(f'<fieldset class="q" data-i="{i}"><legend><span class="qn">{i}.</span> {esc(lab)}</legend><div class="opts" style="--n:{len(opts)}">{o}</div></fieldset>')
        if prefix == "" and i == 9 and len(items) == 9:
            h.append('<div id="q9-support" aria-live="polite" hidden></div>')
    return "\n".join(h)

def diff_fs():
    o = "".join(f'<label><input type="radio" name="diff" value="{i}"><span>{esc(t)}</span></label>' for i, t in enumerate(DIFF))
    return ('<fieldset class="q" data-i="diff"><legend>If you checked off any problems, how difficult have these problems made it for you to do your work, '
            'take care of things at home, or get along with other people? <span class="qn">(optional, not scored)</span></legend>'
            f'<div class="opts" style="--n:4">{o}</div></fieldset>')

def actions():
    return ('<p class="form-msg" role="alert"></p><div class="actions"><button type="submit" class="go">See my result</button>'
            '<button type="reset" class="clear">Clear my answers</button></div>')

def test_page(slug, scale, title, h1, desc, lede, stem, items, opts, prefix, extra_fs, how, lic, faqs, about, crumbname):
    path = f"/mental-health-check/{slug}/"
    crumbs = [("Malady Wise", "/"), ("Mental health check", "/mental-health-check/"), (crumbname, path)]
    s = head(path, title, desc, [page_ld(path, title, desc, crumbs, about), faq_ld(faqs)])
    s += f'''<p class="meta"><a href="/mental-health-check/">Mental health check</a> · Self-check</p>
<h1>{esc(h1)}</h1>
{HELP_NOW}
<p class="lede">{lede}</p>
{ADULTS}
{PRIV}
<form id="mhc-form" class="mhc-form" data-scale="{scale}" autocomplete="off" novalidate aria-describedby="stem">
<p class="stem" id="stem">{esc(stem)}</p>
{fieldsets(items, opts, prefix)}
{extra_fs}
{actions()}
</form>
<section id="result" aria-live="polite" hidden></section>
{NEXT}
{CRISIS}
<h2>How it works</h2>
{how}
{faq_html(faqs)}
<h2>About this questionnaire</h2>
{lic}
<p class="meta">More checks: <a href="/mental-health-check/depression-test/">Depression (PHQ-9)</a> · <a href="/mental-health-check/anxiety-test/">Anxiety (GAD-7)</a> · <a href="/mental-health-check/k10/">Distress (K10)</a></p>
'''
    s += FOOT.format(rev=REV, scripts='<script src="/mental-health-check/mhc.js?v=1"></script>\n')
    write(path, s)

# PHQ-9
test_page("depression-test", "phq9",
  "Depression Test (PHQ-9): Free Online Self-Check",
  "Depression self-check (PHQ-9)",
  "Free PHQ-9 depression self-check: 9 questions about the last 2 weeks, standard scoring and next steps. Private: answers stay on your device.",
  "The PHQ-9 is a 9-question checklist used by GPs around the world to screen for symptoms of depression and to track how they change. It takes about 2 minutes. It’s a screening check, not a diagnosis.",
  "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
  PHQ, F4, "", diff_fs(),
  '''<ul>
<li>Each of the 9 questions scores 0 (not at all) to 3 (nearly every day), for a total of 0 to 27.</li>
<li>Standard score ranges: 0–4 minimal, 5–9 mild, 10–14 moderate, 15–19 moderately severe, 20–27 severe.</li>
<li>In the original study, a score of 10 or more picked up about 88 in 100 people with major depression, while about 12 in 100 people without it also scored 10 or more. That’s why a score is a reason to talk to your GP, not a diagnosis.</li>
<li>Question 9 asks about thoughts of death or self-harm. Any answer other than “Not at all” is important to discuss with a doctor, whatever your total score.</li>
<li>The last question (how difficult things have been) isn’t scored, but it helps show how much symptoms are affecting your life.</li>
</ul>''',
  '''<p class="lic">PHQ-9 © Pfizer Inc. Developed by Drs Robert L Spitzer, Janet BW Williams, Kurt Kroenke and colleagues, with an educational grant from Pfizer Inc. No permission required to reproduce, translate, display or distribute. The questions are reproduced in their original validated wording, which uses some US spelling.</p>
<p class="lic">Source: Kroenke K, Spitzer RL, Williams JBW. The PHQ-9: validity of a brief depression severity measure. <i>J Gen Intern Med</i> 2001;16(9):606–613. <a href="https://doi.org/10.1046/j.1525-1497.2001.016009606.x" rel="noopener">doi:10.1046/j.1525-1497.2001.016009606.x</a>. More at <a href="https://www.phqscreeners.com/" rel="noopener">phqscreeners.com</a>.</p>''',
  [("Is this an official depression test?",
    "The PHQ-9 is a real, widely used questionnaire that GPs and researchers use to screen for depression and track symptoms. But no questionnaire can diagnose depression on its own, online or in a clinic. A diagnosis comes from a conversation with a health professional who can ask follow-up questions and check for other causes."),
   ("What does my PHQ-9 score mean?",
    "Scores of 0–4 suggest minimal symptoms, 5–9 mild, 10–14 moderate, 15–19 moderately severe and 20–27 severe. A score of 10 or more is the usual point where a GP would look further. Whatever your score, if you’re struggling, or you answered anything other than “Not at all” to question 9, talk to your GP."),
   ("Can I do this for my teenager?",
    "This version is for adults filling it in about themselves. Young people’s mood can look different, and teenagers need a check with a GP or a youth service. In Australia, headspace (ages 12 to 25) and Kids Helpline (1800 55 1800, ages 5 to 25) can help. If you’re worried about their safety, call 000 or your local emergency number."),
   ("How often can I repeat the PHQ-9?",
    "It asks about the last 2 weeks, so repeating it every 2 to 4 weeks can show whether things are improving. Many GPs use it this way during treatment."),
   ("Are my answers saved?",
    "No. Your answers stay in this browser tab and disappear when you close or refresh the page. Nothing is stored or sent.")],
  {"@type": "MedicalCondition", "name": "Depression"}, "Depression test (PHQ-9)")

# GAD-7
test_page("anxiety-test", "gad7",
  "Anxiety Test (GAD-7): Free Online Self-Check",
  "Anxiety self-check (GAD-7)",
  "Free GAD-7 anxiety self-check: 7 questions about the last 2 weeks, scored with the standard bands, plus next steps. Private: answers stay on your device.",
  "The GAD-7 is a 7-question checklist used by GPs around the world to screen for symptoms of anxiety and to track how they change. It takes about 2 minutes. It’s a screening check, not a diagnosis.",
  "Over the last 2 weeks, how often have you been bothered by the following problems?",
  GAD, F4, "", diff_fs(),
  '''<ul>
<li>Each of the 7 questions scores 0 (not at all) to 3 (nearly every day), for a total of 0 to 21.</li>
<li>Standard score ranges: 0–4 minimal, 5–9 mild, 10–14 moderate, 15–21 severe.</li>
<li>A score of 10 or more is the usual point where a doctor would suggest a fuller check. In the original study, this cut-off picked up about 89 in 100 people with generalised anxiety disorder.</li>
<li>The GAD-7 was designed for generalised anxiety, but it also picks up many people with panic disorder, social anxiety and PTSD. It can’t tell these apart, which is one reason it isn’t a diagnosis.</li>
</ul>''',
  '''<p class="lic">GAD-7 © Pfizer Inc. Developed by Drs Robert L Spitzer, Janet BW Williams, Kurt Kroenke and colleagues, with an educational grant from Pfizer Inc. No permission required to reproduce, translate, display or distribute. The questions are reproduced in their original validated wording.</p>
<p class="lic">Source: Spitzer RL, Kroenke K, Williams JBW, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. <i>Arch Intern Med</i> 2006;166(10):1092–1097. <a href="https://doi.org/10.1001/archinte.166.10.1092" rel="noopener">doi:10.1001/archinte.166.10.1092</a>. More at <a href="https://www.phqscreeners.com/" rel="noopener">phqscreeners.com</a>.</p>''',
  [("Is this an official anxiety test?",
    "The GAD-7 is a real, widely used questionnaire that GPs and researchers use to screen for anxiety and track symptoms. It can’t diagnose an anxiety disorder on its own. That takes a conversation with a health professional."),
   ("What does my GAD-7 score mean?",
    "Scores of 0–4 suggest minimal anxiety symptoms, 5–9 mild, 10–14 moderate and 15–21 severe. A score of 10 or more is a good reason to see your GP for a fuller check."),
   ("Can I do this for my teenager?",
    "This version is for adults filling it in about themselves. Teenagers need a check with a GP or a youth service. In Australia, headspace (ages 12 to 25) and Kids Helpline (1800 55 1800, ages 5 to 25) can help."),
   ("Are my answers saved?",
    "No. Your answers stay in this browser tab and disappear when you close or refresh the page. Nothing is stored or sent.")],
  {"@type": "MedicalCondition", "name": "Anxiety"}, "Anxiety test (GAD-7)")

# K10
test_page("k10", "k10",
  "K10 Psychological Distress Test: Free Self-Check",
  "Psychological distress self-check (K10)",
  "Free K10 (Kessler 10) self-check: 10 questions about the past 4 weeks, scored with Australian bands, plus next steps. Answers stay on your device.",
  "The K10 (Kessler Psychological Distress Scale) is a 10-question checklist about feelings of anxiety and low mood in the past 4 weeks. It’s widely used in Australia by GPs, mental health services and national health surveys. It takes about 2 minutes. It’s a screening check, not a diagnosis.",
  "These questions are about how you have been feeling in the past 4 weeks. In the past 4 weeks, about how often did you feel…",
  K10, K5, "In the past 4 weeks, about how often did you feel ", "",
  '''<ul>
<li>Each question scores 1 (none of the time) to 5 (all of the time), for a total of 10 to 50.</li>
<li>Australian score ranges (from the National Survey of Mental Health and Wellbeing): 10–15 low, 16–21 moderate, 22–29 high, 30–50 very high distress.</li>
<li>The K10 measures general distress, not one condition. A high score can reflect depression, anxiety, stress after a hard event, or a mix, and is a reason to talk to your GP.</li>
</ul>''',
  '''<p class="lic">K10 Copyright © Ronald C. Kessler, PhD. All rights reserved. Use of the K10 is free and doesn’t require formal permission; the authors ask that users acknowledge the copyright and cite the source (<a href="https://rckessler.scholars.harvard.edu/k10-and-k6-scales" rel="noopener">Kessler, Harvard</a>). Wording follows the Australian self-report version (“in the past 4 weeks”).</p>
<p class="lic">Sources: Kessler RC, Barker PR, Colpe LJ, et al. Screening for serious mental illness in the general population. <i>Arch Gen Psychiatry</i> 2003;60(2):184–189. <a href="https://doi.org/10.1001/archpsyc.60.2.184" rel="noopener">doi:10.1001/archpsyc.60.2.184</a>. Kessler RC, Andrews G, Colpe LJ, et al. Short screening scales to monitor population prevalences and trends in non-specific psychological distress. <i>Psychol Med</i> 2002;32(6):959–976. <a href="https://doi.org/10.1017/s0033291702006074" rel="noopener">doi:10.1017/s0033291702006074</a>. Score ranges: Andrews G, Slade T. Interpreting scores on the Kessler Psychological Distress Scale (K10). <i>Aust N Z J Public Health</i> 2001;25(6):494–497. <a href="https://doi.org/10.1111/j.1467-842x.2001.tb00310.x" rel="noopener">doi:10.1111/j.1467-842x.2001.tb00310.x</a>.</p>''',
  [("What is the K10?",
    "The Kessler Psychological Distress Scale is a 10-question checklist about how often you’ve felt nervous, hopeless, restless, depressed, worthless or tired out in the past 4 weeks. It was developed in the US and is widely used in Australian health surveys and general practice."),
   ("What does my K10 score mean?",
    "Totals range from 10 to 50. In Australia, 10–15 is usually described as low distress, 16–21 moderate, 22–29 high and 30–50 very high. A high or very high score is a good reason to see your GP. The score can’t tell what’s causing the distress."),
   ("Can I do this for my teenager?",
    "This version is for adults filling it in about themselves. Teenagers need a check with a GP or a youth service. In Australia, headspace (ages 12 to 25) and Kids Helpline (1800 55 1800, ages 5 to 25) can help."),
   ("Are my answers saved?",
    "No. Your answers stay in this browser tab and disappear when you close or refresh the page. Nothing is stored or sent.")],
  None, "Distress test (K10)")

# ---------- hub ----------
path = "/mental-health-check/"
title = "Free Mental Health Check: Depression and Anxiety Self-Tests"
desc = "Free, private mental health self-checks: PHQ-9 for depression, GAD-7 for anxiety and K10 for distress, with plain-English results and where to get help."
faqs = [
  ("Is this an official depression test?",
   "The checks here use real, validated questionnaires (PHQ-9, GAD-7 and K10) that GPs and researchers use every day. But no questionnaire can diagnose depression or anxiety on its own. Your result is a starting point for a conversation with your GP or doctor."),
  ("What does my PHQ-9 score mean?",
   "PHQ-9 scores of 0–4 suggest minimal symptoms of depression, 5–9 mild, 10–14 moderate, 15–19 moderately severe and 20–27 severe. A score of 10 or more is the usual point where a GP would look further. If you answered anything other than “Not at all” to question 9, about thoughts of death or self-harm, talk to someone soon, whatever your total."),
  ("Can I do this for my teenager?",
   "These checks are for adults (18 and over) answering about themselves. Young people need a check with a GP or a youth service. In Australia, headspace (ages 12 to 25) and Kids Helpline (1800 55 1800, ages 5 to 25) can help. If you’re worried about their safety, call 000 or your local emergency number."),
  ("Which check should I do?",
   "If low mood or loss of interest is the main problem, start with the PHQ-9. If worry, nerves or feeling on edge is the main problem, try the GAD-7. The K10 gives a general picture of distress and is often used in Australian general practice. Doing more than one is fine."),
  ("Are my answers stored?",
   "No. Your answers stay in your browser tab and are gone when you close or refresh the page. Nothing is saved or sent anywhere.")]
crumbs = [("Malady Wise", "/"), ("Mental health check", path)]
s = head(path, title, desc, [page_ld(path, title, desc, crumbs, {"@type": "MedicalCondition", "name": "Depression and anxiety"}), faq_ld(faqs)])
s += f'''<p class="meta">Self-checks</p>
<h1>Free mental health check</h1>
{HELP_NOW}
<p class="lede">Three short, private self-checks that GPs use every day. Each takes about 2 minutes and gives a plain-English result with next steps. They are screening checks, not a diagnosis.</p>
<ul class="checks">
<li><a href="/mental-health-check/depression-test/"><b>Depression self-check (PHQ-9)</b><span>9 questions about low mood, interest, sleep, energy and more over the last 2 weeks.</span></a></li>
<li><a href="/mental-health-check/anxiety-test/"><b>Anxiety self-check (GAD-7)</b><span>7 questions about worry, nerves and feeling on edge over the last 2 weeks.</span></a></li>
<li><a href="/mental-health-check/k10/"><b>Psychological distress self-check (K10)</b><span>10 questions about how you’ve been feeling in the past 4 weeks. Widely used in Australia.</span></a></li>
</ul>
{ADULTS}
{PRIV}
<h2>Before you start</h2>
<ul>
<li>Answer about how you’ve actually been feeling, not how you think you should feel.</li>
<li>A score can’t tell you what’s causing symptoms. Physical problems (such as thyroid disease, anaemia or medicine side effects), stress, grief and sleep problems can all play a part.</li>
<li>If you’re struggling, you don’t need a particular score to see your GP or call a support line.</li>
</ul>
{NEXT}
{CRISIS}
{faq_html(faqs)}
<h2>Sources</h2>
<ul class="src">
<li><a href="https://doi.org/10.1046/j.1525-1497.2001.016009606.x" rel="noopener">Kroenke, Spitzer and Williams, J Gen Intern Med 2001: The PHQ-9</a></li>
<li><a href="https://doi.org/10.1001/archinte.166.10.1092" rel="noopener">Spitzer, Kroenke, Williams and Löwe, Arch Intern Med 2006: The GAD-7</a></li>
<li><a href="https://doi.org/10.1111/j.1467-842x.2001.tb00310.x" rel="noopener">Andrews and Slade, Aust N Z J Public Health 2001: Interpreting K10 scores</a></li>
<li><a href="https://www.health.gov.au/our-work/better-access-initiative" rel="noopener">Australian Government: Better Access initiative</a></li>
</ul>
'''
s += FOOT.format(rev=REV, scripts="")
write(path, s)
