#!/usr/bin/env python3
"""/funny-scales/: tongue-in-cheek medical scales, each beside the real one.
Jokes are about situations, never about patients. Run: python3 _scripts/funny_scales.py"""
import os, re, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/"
E = html.escape
TODAY = "24 November 2026"

S = [
 dict(id="pain", t="The pain scale, honest edition", ic="\U0001F915",
  rows=[("0", "What pain? Living your best life."), ("1", "Paper cut. Mild outrage."), ("2", "Stubbed toe. Quietly forgiven."), ("3", "Stubbed toe on the bed leg. Loudly not forgiven."),
        ("4", "Stood on a toy brick at 2am."), ("5", "Can still scroll your phone, but resentfully."), ("6", "Cancelled plans and sent the ‘so sorry’ text."),
        ("7", "Searching symptoms at 3am."), ("8", "No comfortable position exists in any dimension."), ("9", "Kidney stone territory."), ("10", "Can’t speak. (If you’re texting us a 10, it’s probably a 7.)")],
  real="Doctors use a 0 to 10 number scale because it’s quick, not because it’s perfect. What matters most is the change over time and what the pain stops you doing. Children often use picture-based faces scales instead.",
  links=[("/chronic-pain/", "Chronic pain fact sheet"), ("/kidney-stones/", "Kidney stones")]),
 dict(id="bristol", t="The Bristol stool chart, after hours", ic="\U0001F4A9",
  rows=[("Type 1", "Gravel. Drink a glass of water. Then another."), ("Type 2", "Lumpy log. A personal struggle."), ("Type 3", "Sausage with cracks. Respectable."),
        ("Type 4", "Smooth, soft sausage. The gold standard. Frame it. (Please don’t.)"), ("Type 5", "Soft blobs with clear edges. A bit hasty."),
        ("Type 6", "Porridge. Stay within sprinting distance of a toilet."), ("Type 7", "Gravy. Sip fluids and read the real version below.")],
  real="The real Bristol stool form scale (Lewis and Heaton, 1997) sorts poo into 7 types: 1–2 suggest constipation, 3–4 are ideal, 5–7 lean towards diarrhoea. See a doctor for blood or black poo, a lasting change in habit, weight loss, or diarrhoea with dehydration.",
  links=[("/constipation/", "Constipation fact sheet"), ("/ibs/", "IBS fact sheet"), ("/printables/ibs-criteria/", "IBS criteria checklist")]),
 dict(id="tabs", t="The ADHD browser-tab scale", ic="\U0001F4BB",
  rows=[("1 tab", "Monk-like focus. Possibly asleep."), ("5 tabs", "A normal Tuesday."), ("12 tabs", "Started a recipe, now reading about medieval cheese."),
        ("25 tabs", "Three of them are playing music. You can’t find which."), ("50 tabs", "One is a form you started in March."),
        ("99+ tabs", "The browser has given up and so has the laptop fan."), ("New window", "Fresh start. Same 99 tabs, just hiding.")],
  real="ADHD isn’t about tabs, but the feeling is familiar to many: attention that’s hard to steer, not absent. Diagnosis needs symptoms from childhood, in more than one setting, that get in the way of life.",
  links=[("/adhd/", "ADHD fact sheet"), ("/printables/asrs/", "ASRS screener (printable)"), ("/printables/adhd-criteria/", "ADHD criteria checklist")]),
 dict(id="bendy", t="The bendiness scale", ic="\U0001F938",
  rows=[("0", "Can’t touch your knees. Respect your hamstrings."), ("2", "Thumb gets close to the wrist if you stare at it."), ("4", "Elbows bend slightly the wrong way. Mildly unsettling."),
        ("6", "Party trick level: everyone says ‘eww, do it again’."), ("8", "Physios ask to take photos."), ("9", "Joints mostly for decoration.")],
  real="The real Beighton score counts 9 points across fingers, thumbs, elbows, knees and spine. 5 or more in adults suggests generalised hypermobility. Being bendy is common and often harmless; it matters when it comes with pain, dislocations or other features.",
  links=[("/printables/beighton-score/", "Beighton score (printable)"), ("/printables/heds-criteria/", "hEDS criteria checklist"), ("/ehlers-danlos-syndrome/", "EDS fact sheet")]),
 dict(id="tired", t="The tiredness scale", ic="\U0001F971",
  rows=[("1", "A small yawn. Coffee is optional."), ("3", "Read the same email four times."), ("5", "Put the milk in the cupboard and the cereal in the fridge."),
        ("7", "Fell asleep in the car park before going into the shops."), ("9", "Too tired to sleep, which feels illegal."), ("10", "Fell asleep reading this list.")],
  real="Tiredness has hundreds of causes, from sleep apnoea and low iron to thyroid problems, depression and ME/CFS. If it lasts weeks, crashes you after effort, or comes with weight loss, fevers or breathlessness, see your GP.",
  links=[("/sleep/", "Sleep fact sheet"), ("/me-cfs/", "ME/CFS fact sheet"), ("/printables/stop-bang/", "Sleep apnoea check (STOP-Bang)")]),
 dict(id="cold", t="The common cold severity scale", ic="\U0001F927",
  rows=[("1", "A tickle. Denial phase."), ("2", "Tissues in every pocket."), ("3", "Voice like a jazz singer."), ("4", "Can taste nothing. Ate a lemon to check."),
        ("5", "Wrote a will. Left everything to the cat."), ("6", "Back at work, coughing near the printer.")],
  real="Colds usually last 7 to 10 days, with a cough that can hang on for 3 weeks. Antibiotics don’t help. See a doctor for trouble breathing, a high fever lasting more than 3 days, chest pain, or if a baby is unwell.",
  links=[("/common-cold/", "Common cold fact sheet")]),
]

TPL = open(ROOT + "tools/ace-score/index.html", encoding="utf-8").read()
HEAD = TPL[:TPL.index("<main")]
HEAD = re.sub(r'<meta property="og:image[^>]*>\n?|<meta name="twitter:image[^>]*>\n?', "", HEAD)
HEAD = re.sub(r'<script type="application/ld\+json".*?</script>\n?', "", HEAD, flags=re.S)
HEAD = HEAD.replace('<link rel="stylesheet" href="/tools/calckit/calc.css?v=2">\n', "")
CSS = """<style>.fs-card{background:var(--card,#fff);border:1px solid var(--line,#E7E0F2);border-radius:18px;padding:16px;margin:0 0 18px}
.fs-card h2{margin:0 0 10px;font-size:22px}.fs-rows{list-style:none!important;padding:0!important;margin:0 0 12px;display:grid;gap:6px}
.fs-rows li{display:grid;grid-template-columns:76px 1fr;gap:10px;align-items:baseline;margin:0!important;padding:8px 10px;border-radius:10px;background:var(--bg,#FAF7F2)}
.fs-rows b{font-variant-numeric:tabular-nums;color:var(--brand,#4A3480)}.fs-real{border-left:4px solid var(--brand,#4A3480);padding:8px 12px;background:var(--bg,#FAF7F2);border-radius:0 10px 10px 0;margin:0 0 8px}
.fs-real b{display:block;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted,#6B5A93);margin-bottom:2px}.fs-links{font-size:14px;margin:0}
.fs-toc{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 16px;padding:0!important;list-style:none!important}.fs-toc li{margin:0!important}.fs-toc a{display:inline-block;padding:6px 12px;border:1px solid var(--line,#E7E0F2);border-radius:999px;text-decoration:none;font-size:14px;background:var(--card,#fff)}</style>"""

toc = '<ul class="fs-toc">' + "".join('<li><a href="#%s">%s %s</a></li>' % (x["id"], x["ic"], E(x["t"].split(",")[0])) for x in S) + "</ul>"
cards = ""
for x in S:
    rows = "".join("<li><b>%s</b><span>%s</span></li>" % (E(a), E(b)) for a, b in x["rows"])
    links = " · ".join('<a href="%s">%s</a>' % (h, E(t)) for h, t in x["links"])
    cards += '<section class="fs-card" id="%s"><h2>%s %s</h2><ul class="fs-rows">%s</ul><p class="fs-real"><b>The real one</b>%s</p><p class="fs-links">%s</p></section>\n' % (x["id"], x["ic"], E(x["t"]), rows, E(x["real"]), links)

main = ('<p class="meta"><a href="/tools/">Tools</a> · Just for fun</p>\n<h1>Funny Medical Scales</h1>\n'
        '<p class="lede">Medicine loves a scale. Here are six of them, rewritten for real life, each next to the real one so you still learn something. Laughing at situations, never at patients.</p>\n'
        + toc + cards +
        '<p class="meta">Just for fun, not for diagnosis. If something’s worrying you, see your GP.</p>')
title = "Funny Medical Scales: Pain, Bristol Stool, ADHD and More"
desc = "Tongue-in-cheek versions of the pain scale, Bristol stool chart, Beighton score and more, each beside the real scale and what it actually means."
url = "https://maladywise.com/funny-scales/"
h = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="%s">' % url, HEAD)
h = re.sub(r"<title>.*?</title>", "<title>%s</title>" % E(title), h)
for a in ('<meta name="description" content="', '<meta property="og:description" content="'):
    h = re.sub(r"(%s)[^\"]*" % re.escape(a), lambda m: m.group(1) + E(desc), h)
h = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + E(title), h)
h = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + url, h)
out = h + '<main class="wrap doc">\n' + main + "\n" + CSS + '\n<p class="meta">Updated %s.</p>\n</main>\n<script>MW.page();</script>\n</body>\n</html>\n' % TODAY
os.makedirs(ROOT + "funny-scales", exist_ok=True)
open(ROOT + "funny-scales/index.html", "w", encoding="utf-8").write(out)
print("funny-scales built")
