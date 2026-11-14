"""Morphemia Max (Mondays): write nine-letter puzzles into the monthly files.
Usage: python3 morphemia/build_max.py YYYY-MM-DD:pangram:centre [...]          (Medical)
       python3 morphemia/build_max.py --normie YYYY-MM-DD:pangram:centre [...]
The pangram must have exactly 9 distinct letters. Aim for 30-110 words; the script prints the count.
Word lists: suturix/words.txt + dictionary/morphemia-medical.txt + every word already used in Morphemia,
minus dictionary/morphemia-block.txt. Medical (double score) = morphemia-medical + medical-au words that are
also everyday or already-used words. Minimum word length 5. Scoring matches morphemia.js."""
import re, json, glob, sys, random, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
low = lambda it: {w.strip().lower() for w in it if re.fullmatch(r'[A-Za-z]+', w.strip())}
SUT = low(open(R + 'suturix/words.txt').read().split())
MEDH = low(open(R + 'dictionary/morphemia-medical.txt').read().split())
MEDAU = low(open(R + 'dictionary/medical-au.txt').read().split())
BLOCK = low(open(R + 'dictionary/morphemia-block.txt').read().split())
VET = set()
for f in glob.glob(R + 'morphemia/puzzles/**/*.json', recursive=True):
    for p in json.load(open(f)): VET |= low(p['words'])
VALID = (SUT | MEDH | VET) - BLOCK
MEDSET = (MEDH | (MEDAU & (SUT | VET))) - BLOCK
LONG = {8: 8, 9: 10, 10: 12}
def pts(w, L, med):
    p = 1 if len(w) == 4 else len(w); p += 15 if len(w) >= 11 else LONG.get(len(w), 0)
    if set(w) == L: p += 7
    if med and w in MEDSET: p *= 2
    return p
args = sys.argv[1:]; normie = '--normie' in args; args = [a for a in args if a != '--normie']
rnd = random.Random(11)
for a in args:
    date, pw, c = a.split(':'); pw = pw.lower(); c = c.lower(); L = set(pw)
    assert len(L) == 9 and c in L, 'need 9 distinct letters and the centre in the word'
    ws = sorted(w for w in VALID if len(w) >= 5 and c in w and set(w) <= L)
    f = R + 'morphemia/puzzles/' + ('normie/' if normie else '') + date[:7] + '.json'; d = json.load(open(f))
    others = [x for x in sorted(L) if x != c]; rnd.shuffle(others)
    for p in d:
        if p['date'] == date:
            p.update(difficulty='Hard', centre=c.upper(), outer=''.join(others).upper(), words=[w.upper() for w in ws],
                     medical=[w.upper() for w in ws if not normie and w in MEDSET], pangrams=[w.upper() for w in ws if set(w) == L],
                     max=sum(pts(w, L, not normie) for w in ws), min=5, variant='max')
            print(date, pw, c, len(ws), 'words', len(p['medical']), 'medical', p['max'], 'max')
    json.dump(d, open(f, 'w'), indent=1, ensure_ascii=False)
