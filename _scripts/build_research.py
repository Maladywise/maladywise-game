#!/usr/bin/env python3
"""Build /research/ (the research hub) from data/research.json. Head and footer are copied from /deep-dives/.
   python3 _scripts/build_research.py"""
import json, re, html, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(ROOT, "data/research.json"), encoding="utf-8"))
e = lambda s: html.escape(s, quote=True)
src = open(os.path.join(ROOT, "deep-dives/index.html"), encoding="utf-8").read()
TITLE = "Research Hub: New Medical Studies and Trials to Watch"
DESC = "The week’s most interesting medical studies in plain English, how strong the evidence is, and the big trials still to report. Hosted by Pebble the penguin."
head = src[:src.index("</head>")]
head = re.sub(r'<script type="application/ld\+json".*?</script>\n?', "", head, flags=re.S)
head = head.replace("https://maladywise.com/deep-dives/", "https://maladywise.com/research/")
head = re.sub(r"<title>.*?</title>", "<title>" + e(TITLE) + " | Malady Wise</title>", head)
for p in ('name="description"', 'property="og:description"'):
    head = re.sub(r'(<meta ' + p + r' content=")[^"]*', lambda m: m.group(1) + e(DESC), head)
head = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + e(TITLE + " | Malady Wise"), head)
head = re.sub(r'/assets/og/pages/deep-dives\.png\?v=[0-9a-f]+', "/assets/og/pages/research.png", head)
head = head.replace("Deep dives for clinicians: Evidence-dense topic reviews", "Research hub: New studies and trials to watch")
ld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Malady Wise", "item": "https://maladywise.com/"}, {"@type": "ListItem", "position": 2, "name": "Research hub", "item": "https://maladywise.com/research/"}]}
head += '<script type="application/ld+json" id="mw-breadcrumb-ld">' + json.dumps(ld, ensure_ascii=False) + "</script>\n"
head += "<style>.rh-ev{display:inline-block;font:700 11px Poppins,sans-serif;letter-spacing:.06em;text-transform:uppercase;border-radius:999px;padding:2px 9px;margin-right:6px}.rh-ev.Strong{background:#DDF3E6;color:#1F6B3A}.rh-ev.Moderate{background:#FFF1CC;color:#7A5300}.rh-ev.Early{background:#FBE1DC;color:#9A3220}.rh-card{border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin:10px 0;background:var(--card)}.rh-card h3{margin:0 0 6px;font-size:18px}.rh-card p{margin:6px 0}.rh-src{font-size:13px;color:var(--muted)}.rh-trials li{margin:10px 0}.rh-when{display:block;font-size:13px;color:#6B5A93;font-weight:600}</style>\n"
foot = src[src.index('<p class="print-url">') if '<p class="print-url">' in src else src.index("<footer"):].replace("maladywise.com/deep-dives/", "maladywise.com/research/")
def card(s):
    return ('<div class="rh-card"><h3>' + e(s["title"]) + '</h3><p><span class="rh-ev ' + e(s["evidence"]) + '">' + e(s["evidence"]) + " evidence</span>" + e(s.get("evnote", "")) + "</p>"
            '<p><b>What they found.</b> ' + e(s["what"]) + '</p><p><b>So what.</b> ' + e(s["sowhat"]) + '</p><p class="rh-src">Source: <a href="' + e(s["url"]) + '" rel="noopener">' + e(s["source"]) + "</a></p></div>")
w0 = D["weeks"][0]
body = ['</head>\n<body>\n<main class="wrap doc">',
  '<div class="dd-hero" style="display:flex;align-items:center;gap:12px;margin:8px 0 4px"><img src="/assets/mascots/deepdives.svg" width="84" height="84" alt="Pebble the penguin in a diving mask, holding a pebble" style="flex:0 0 auto"><div><h1 style="margin:0">Research hub</h1><p style="margin:2px 0 0;font:600 13px Poppins,sans-serif;color:#6B5A93">Pebble dives into the journals so you don’t have to.</p></div></div>',
  '<p class="lede">The week’s most interesting medical studies in plain English, how much to trust each one, and the big trials still to come.</p>',
  '<h2>This week in research</h2><p class="meta">' + e(w0["week"]) + "</p>"] + [card(s) for s in w0["studies"]]
body += ['<h2>Trials to watch</h2><p class="evkey">Big studies still running. Results could change practice.</p><ul class="rh-trials">'] + ['<li><b><a href="' + e(t["url"]) + '" rel="noopener">' + e(t["name"]) + "</a></b> " + e(t["q"]) + '<span class="rh-when">' + e(t["when"]) + "</span></li>" for t in D["trials"]] + ["</ul>"]
if len(D["weeks"]) > 1:
    body.append("<h2>Earlier weeks</h2>")
    for w in D["weeks"][1:8]:
        body.append('<details><summary>' + e(w["week"]) + "</summary>" + "".join(card(s) for s in w["studies"]) + "</details>")
body += ['<h2>How to read the evidence labels</h2><ul><li><span class="rh-ev Strong">Strong</span>Large randomised trials or good reviews of them. Likely to hold up.</li><li><span class="rh-ev Moderate">Moderate</span>Smaller trials, or large observational studies. Promising, not proven.</li><li><span class="rh-ev Early">Early</span>Lab, animal or small early studies. Interesting, often doesn’t pan out in people.</li></ul>',
  '<h2>Join a trial</h2><ul class="res"><li><a href="https://www.australianclinicaltrials.gov.au" rel="noopener">Australian Clinical Trials</a><span>Government site for finding Australian trials that are recruiting. Free.</span></li><li><a href="https://www.anzctr.org.au" rel="noopener">ANZCTR</a><span>The Australian New Zealand Clinical Trials Registry. Free.</span></li></ul>',
  '<p class="meta"><em>Updated ' + e(w0["week"].split("–")[-1].strip()) + '. General education, not personal medical advice. Studies get summarised fast and sometimes revised: check the source.</em></p>',
  '<!-- share-card -->\n<!-- /share-card -->',
  '<section class="related"><h2>Related</h2><ul><li><a href="/deep-dives/"><span>For doctors</span>Deep dives</a></li><li><a href="/zebra-mail/"><span>News</span>Weekly Dose</a></li><li><a href="/peptides/"><span>Fact sheet</span>Peptides: hype vs evidence</a></li></ul></section>']
os.makedirs(os.path.join(ROOT, "research"), exist_ok=True)
open(os.path.join(ROOT, "research/index.html"), "w", encoding="utf-8").write(head + "\n".join(body) + "\n" + foot)
print("research/index.html built:", len(w0["studies"]), "studies,", len(D["trials"]), "trials")
