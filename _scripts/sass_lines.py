#!/usr/bin/env python3
"""Add a sass line under the lede of fact sheets that have none. Idempotent: pages that already have a
<p class="sass"> are skipped, so it is safe to re-run after pages are regenerated.

    python3 _scripts/sass_lines.py          # add missing lines
    python3 _scripts/sass_lines.py --report # list fact sheets with fewer than 2 sass lines

Sass targets the myth, the hype or the condition, never the patient. Gentle topics (dementia, premature birth,
life-threatening infection, cancers with poor outlook) are left without sass on purpose.
"""
import glob, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GENTLE = {"frontotemporal-dementia", "premature-birth", "meningococcal", "pancreatic-cancer", "mesothelioma"}

SASS = {
 "addisons-disease": "Salt cravings, a tan you didn’t earn and fainting when you stand? That’s not ‘just stress’. Ask for a cortisol test.",
 "anaphylaxis": "The EpiPen in your bag only works if it leaves your bag. Thigh first, questions later.",
 "antibiotics": "Antibiotics don’t do viruses. Your cold will take 7 days with them, or about a week without.",
 "arsenic": "Arsenic: the original ‘natural’ product. Natural isn’t a safety rating.",
 "bird-flu": "Don’t pat the dead seabird. Not even for the photo.",
 "bladder-cancer": "Blood in your wee is never ‘probably nothing’ until someone has actually looked.",
 "bunions": "Your feet are not the shape of your shoes. Buy shoes the shape of your feet.",
 "cadmium": "Cigarettes: now with bonus heavy metal. Quitting is the best detox there is.",
 "chronic-kidney-disease": "Your kidneys don’t complain until they’re down to a fraction of their job. A yearly blood and urine test does the complaining for them.",
 "concussion": "‘I didn’t get knocked out’ isn’t a clearance certificate. If in doubt, sit them out.",
 "cte": "‘Toughen up’ is not a brain-protection strategy. Fewer head knocks is.",
 "cteph": "‘You’re just unfit after the clot’ is a diagnosis that deserves a second opinion if you’re still puffed at 3 months.",
 "d-mer": "It’s a hormone glitch, not a verdict on you as a parent. Your brain is just being dramatic about milk.",
 "ehlers-danlos-syndrome": "Party tricks with your thumbs aren’t a diagnosis. Neither is ‘you’re just clumsy’.",
 "eosinophilic-oesophagitis": "If you’ve perfected the cut-it-tiny, sip-water-between-bites routine, that’s not a personality. That’s a symptom.",
 "fibroids": "Changing a pad every hour isn’t ‘a heavy period’. It’s a reason to book in.",
 "flu-and-covid": "‘It’s just a cold’ is a diagnosis best made by a test, not by optimism.",
 "folate": "Start it before the pregnancy test is positive. By then, the important bit has already happened.",
 "gilbert-syndrome": "A slightly yellow tinge after a big night or a missed lunch? Congratulations, your liver is just running on island time.",
 "h-pylori": "An Australian doctor drank the bacteria to prove it causes ulcers, and it helped win a Nobel Prize. You just need a breath test.",
 "haemochromatosis": "The one time ‘iron-rich’ isn’t a compliment. Blood donation is the treatment, and it helps someone else too.",
 "heart-failure": "Your heart hasn’t failed, it’s just struggling. And the modern pills are genuinely good at helping it.",
 "heavy-metal-testing": "If a test finds ‘toxins’ in everyone and the cure is sold by the same clinic, that’s not a diagnosis. That’s a business model.",
 "inflammatory-bowel-disease": "No, it’s not ‘just IBS’. Blood, weight loss and night-time trips to the loo need proper tests.",
 "keratoconus": "Stop rubbing your eyes. Seriously. Your cornea is not a stress ball.",
 "keratosis-pilaris": "Scrubbing harder just gives you angry chicken skin. Gentle wins.",
 "lactose-intolerance": "You probably don’t need to quit dairy. A splash of milk and a slab of cheddar are very different beasts.",
 "lead": "Old house, new renovation, sanding the paint? Lead dust is the souvenir nobody wants.",
 "leptospirosis": "Flood water is not a paddling pool. Cover those cuts.",
 "long-covid": "Pushing through is how you crash. Pacing isn’t laziness, it’s strategy.",
 "lupus": "‘But you don’t look sick’ is not the compliment people think it is.",
 "mercury": "Eat the fish. Just don’t make shark your daily habit.",
 "mould": "Bleach makes mould look clean. Fixing the damp actually makes it gone.",
 "myasthenia-gravis": "Fine in the morning, droopy by dinner: that’s not you being tired, that’s the pattern doctors look for.",
 "niacin": "The niacin flush feels like a sunburn from the inside. Not a sign it’s ‘working’.",
 "ovarian-cysts": "Most ovarian cysts pack their bags and leave on their own. A repeat scan is usually the treatment.",
 "peptides": "If it’s sold ‘for research purposes only’ and you’re injecting it, you’re the research.",
 "pharmacogenomics": "Your genes can’t tell you which antidepressant you’ll love. They can tell you which ones your liver might mishandle.",
 "porphyria": "No, it doesn’t make people vampires. Yes, someone has asked.",
 "prostate-cancer": "Many prostate cancers are the slow, lazy kind. The trick is finding out which kind you have before anyone reaches for a scalpel.",
 "riboflavin": "Bright yellow wee after a multivitamin? That’s just riboflavin leaving the building.",
 "sarcoidosis": "A disease that mimics half the textbook. Doctors have been fooled by it since the 1800s, so don’t feel bad if it took a while.",
 "scleroderma": "Fingers that go white then blue in the cold aren’t just ‘bad circulation’ if they come with tight skin. Get them checked.",
 "scombroid": "It’s not a fish allergy, it’s badly stored fish. Blame the fridge, not your immune system.",
 "sibo": "If an online quiz diagnoses you with SIBO and then sells you the herbs, that’s not a test. That’s a shop.",
 "smith-magenis-syndrome": "Up at 3am and asleep by dinner? The body clock is upside down, not the parenting.",
 "stiff-person-syndrome": "Often misread as anxiety for years. Muscles locking up when startled is a neurology question, not a nerves one.",
 "thallium": "Odourless, tasteless and slow. Agatha Christie used it in a novel, and a real nurse in England spotted a real poisoning because she’d read it.",
 "thiamine": "Your body only stores a few weeks’ worth. Pizza and wine are not a thiamine strategy.",
 "tourette-syndrome": "Most people with Tourette never swear involuntarily. TV just finds the swearing funnier.",
 "travel-vaccines": "The airport is the wrong time to remember your typhoid shot.",
 "varicose-veins": "Crossing your legs doesn’t cause them. Your parents probably did.",
 "vitamin-a": "Polar bear liver: the original vitamin overdose. Supplements can get you there too, more slowly.",
 "vitamin-b6": "More isn’t better. B6 ‘energy’ powders can leave you with numb feet instead.",
 "vitamin-c": "Scurvy isn’t just for pirates. A diet of toast and coffee can get you there too.",
 "vitamin-e": "Vitamin E pills promised to save hearts. The trials said no, and some showed a little harm.",
}


def is_fact(s):
    m = re.search(r'class="fs-top".{0,400}', s, re.S)
    return bool(m and "Fact sheet" in m.group(0))


def main():
    report = "--report" in sys.argv
    added = 0
    for p in sorted(glob.glob(os.path.join(ROOT, "*", "index.html"))):
        slug = os.path.basename(os.path.dirname(p))
        s = open(p, encoding="utf-8").read()
        if not is_fact(s):
            continue
        n = s.count('class="sass"')
        if report:
            if n < 2 and slug not in GENTLE:
                print(n, slug)
            continue
        if n or slug in GENTLE or slug not in SASS:
            continue
        m = re.search(r'<p class="lede">.*?</p>\n?', s, re.S)
        if not m:
            print("no lede:", slug); continue
        s = s[:m.end()] + '<p class="sass">%s</p>\n' % SASS[slug] + s[m.end():]
        open(p, "w", encoding="utf-8").write(s); added += 1
    if not report:
        print("sass_lines: added to %d page(s)" % added)
        print("sass_lines: extra lines on %d page(s)" % more())


def more():
    """Spread the extra lines in _scripts/sass_more.json through the body: before the 2nd heading and before the last
    heading ahead of the FAQ. A line already on the page is skipped, so re-runs change nothing."""
    import json, html
    extra = json.load(open(os.path.join(ROOT, "_scripts", "sass_more.json"), encoding="utf-8"))
    done = 0
    for slug, lines in extra.items():
        p = os.path.join(ROOT, slug, "index.html")
        if slug in GENTLE or not os.path.exists(p):
            continue
        s = open(p, encoding="utf-8").read()
        todo = [l for l in lines if html.escape(l, quote=False) not in s and l not in s]
        if not todo:
            continue
        end = min([i for i in (s.find('<section class="faq"'), s.find("<h2>Evidence")) if i > 0] or [len(s)])
        start = s.find('class="lede"')
        hs = [m.start() for m in re.finditer(r"<h2[ >]", s) if start < m.start() < end]
        spots = [hs[1]] if len(hs) > 1 else []
        if len(hs) > 2:
            spots.append(hs[-1])
        while len(spots) < len(todo):
            spots.append(spots[-1] if spots else end)
        for pos, line in sorted(zip(spots, todo), reverse=True):
            s = s[:pos] + '<p class="sass">%s</p>' % html.escape(line, quote=False) + s[pos:]
        open(p, "w", encoding="utf-8").write(s); done += 1
    return done


if __name__ == "__main__":
    main()
