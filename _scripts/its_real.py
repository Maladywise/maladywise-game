#!/usr/bin/env python3
"""Adds an "It's real: what's happening in the body" section and a "Being heard" callout to fact sheets for
conditions too often dismissed as anxiety or "all in your head" (Nov 2026). Idempotent: replaces its own block.
    python3 _scripts/its_real.py
"""
import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
L = lambda u, t: '<a href="%s" target="_blank" rel="noopener">%s</a>' % (u, t)
HEARD = ['Bring a one-page summary: when it started, what makes it better or worse, what you’ve tried, and how it affects work, study or family.',
         'Ask: “What else could this be?” and “What have we ruled out?”',
         'A 2-week symptom diary helps a busy appointment go further.',
         'You can ask for a longer appointment, a referral, or a second opinion. Good doctors won’t mind.']
P = {
 "fibromyalgia": ("Fibromyalgia is a real pain-processing condition. These changes have been measured:", [
   "<b>Damaged small nerve fibres</b> in about half of people with fibromyalgia, on skin biopsy or eye scans (%s)." % L("https://doi.org/10.1016/j.semarthrit.2018.08.003", "Grayston 2019, 8 studies combined"),
   "<b>Antibodies can carry the pain.</b> When antibodies (IgG) from people with fibromyalgia were given to mice, the mice became more sensitive to pain and lost skin nerve fibres; antibodies from healthy people did nothing (%s)." % L("https://doi.org/10.1172/JCI144201", "Goebel 2021"),
   "<b>The volume knob is turned up.</b> Doctors now call this nociplastic pain: real pain from changes in how nerves and the brain process signals, recognised by the International Association for the Study of Pain.",
   "Low mood or stress can make any pain worse, but they don’t cause fibromyalgia, and it isn’t imagined."]),
 "chronic-pain": ("Chronic pain is real, even when scans look normal:", [
   "<b>Nerves and the brain change.</b> After months of pain, the nervous system becomes more sensitive (central sensitisation), so normal signals can hurt. This shows up on testing, not just in reports.",
   "<b>It now has its own name.</b> The World Health Organization’s ICD-11 lists chronic primary pain as a condition in its own right, and pain specialists use “nociplastic pain” for pain from altered nerve processing (%s)." % L("https://www.iasp-pain.org/resources/terminology/", "IASP"),
   "<b>Normal scans don’t mean nothing’s wrong.</b> Scans show structure, not how nerves are firing.",
   "Because the nervous system can change, it can also change back: that’s why active treatments and pain education help."]),
 "ibs": ("IBS is a real disorder of gut–brain signalling, now called a disorder of gut–brain interaction. Findings include:", [
   "<b>It can start after a gut infection.</b> About 1 in 10 people develop IBS within a year of gastroenteritis, and 4 in 10 after a parasite infection (%s)." % L("https://doi.org/10.1053/j.gastro.2016.12.039", "Klem 2017"),
   "<b>Sensitive gut nerves.</b> Many people with IBS feel normal stretching of the bowel as pain (visceral hypersensitivity).",
   "<b>Local immune reactions.</b> After a gut infection, mice made gut-only antibodies to a food that then triggered mast cells and pain when they ate it, with similar local reactions in people with IBS (%s)." % L("https://doi.org/10.1038/s41586-020-03118-2", "Aguilera-Lizarraga 2021"),
   "<b>A hidden cause of diarrhoea.</b> About 1 in 4 to 1 in 3 people with diarrhoea-type IBS absorb bile acids poorly, which is treatable: ask your GP (%s)." % L("https://doi.org/10.1111/j.1365-2036.2009.04081.x", "Wedlake 2009")]),
 "endometriosis": ("Endometriosis is a physical, inflammatory disease, not “bad periods”:", [
   "<b>Real lesions.</b> Tissue similar to the womb lining grows outside the womb, bleeds, inflames and scars, and can grow its own nerve fibres.",
   "<b>Common.</b> About 1 in 7 Australian women aged 44 to 49 has been diagnosed (Australian Institute of Health and Welfare, 2023).",
   "<b>Pain doesn’t match the amount you can see.</b> Small lesions can hurt a lot and large ones a little, so pain levels are real either way.",
   "<b>It’s often missed for years.</b> Period pain that stops you working, studying or sleeping is not normal and deserves investigation (%s)." % L("https://doi.org/10.1093/hropen/hoac009", "ESHRE guideline 2022")]),
 "pots": ("POTS is a measurable problem with the autonomic nervous system, not anxiety:", [
   "<b>You can see it on a stand test.</b> Heart rate rises by 30 or more beats a minute within 10 minutes of standing, without a drop in blood pressure.",
   "<b>Less blood reaches the brain when upright.</b> In a tilt-table study, every person with POTS had an abnormal fall in brain blood flow (%s)." % L("https://doi.org/10.1016/j.cnp.2020.01.003", "van Campen 2020"),
   "<b>Not an anxiety disorder.</b> People with POTS had no more anxiety disorders than the general population, even though the racing heart can feel like panic (%s)." % L("https://doi.org/10.1136/jnnp.2008.144360", "Raj 2009"),
   "In an Australian registry of 500 people, diagnosis took 6.7 years on average, and anxiety was blamed first for about 2 in 3. See our <a href=\"/deep-dives/pots/\">POTS deep dive</a>."]),
}
def block(slug):
    intro, items = P[slug]
    return ('<!-- its-real -->\n<h2>It’s real: what’s happening in the body</h2>\n<p>%s</p>\n<ul>%s</ul>\n'
            '<div class="callout heard"><p><b>Being heard.</b> You know your body. These help a busy appointment:</p><ul>%s</ul></div>\n<!-- /its-real -->\n'
            % (intro, "".join("<li>%s</li>" % i for i in items), "".join("<li>%s</li>" % h for h in HEARD)))
def main():
    for slug in P:
        f = os.path.join(ROOT, slug, "index.html"); s = open(f, encoding="utf-8").read()
        s = re.sub(r"<!-- its-real -->.*?<!-- /its-real -->\n", "", s, flags=re.S)
        hs = [m.start() for m in re.finditer(r"<h2[ >]", s)]
        at = hs[1] if slug == "chronic-pain" else hs[0]
        s = s[:at] + block(slug) + s[at:]
        open(f, "w", encoding="utf-8").write(s); print("its-real:", slug)
if __name__ == "__main__":
    main()
