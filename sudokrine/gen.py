#!/usr/bin/env python3
"""Sudokrine puzzle generator and checker.

Usage:
  python3 sudokrine/gen.py [START END]   # default 2026-10-26 2026-12-31; writes sudokrine/puzzles/YYYY-MM.json
  python3 sudokrine/gen.py --check        # re-verify every puzzle file (unique solution + logical grade)

Every puzzle is deterministic from its date (seeded PRNG), has exactly one solution (checked by a
brute-force counter) and is graded by a human-style logical solver. Difficulty by weekday:
  Mon/Tue Easy    6x6 (2x3 boxes)  singles only
  Wed/Thu Medium  6x6              needs locked candidates or pairs
  Fri/Sat Hard    9x9              needs locked candidates (pointing/claiming)
  Sun     Genius  9x9              needs pairs/triples (naked or hidden)
  Einstein        9x9              needs X-wing/swordfish, XY-wing or colouring chains (dates in EINSTEIN)
Entry: {date, number, difficulty, size, box:[rows, cols], puzzle, solution, clues, techniques, fact, nfact}
puzzle/solution are strings of digits (0 = empty); digit k shows as symbol k (Medical icon or Normie fruit).
"""
import datetime as dt
import json
import os
import random
import sys
from itertools import combinations

HERE = os.path.dirname(os.path.abspath(__file__))
LAUNCH = "2026-10-26"
EINSTEIN = ["2026-11-21"]  # keep in sync with MW_EINSTEIN.sudokrine in assets/games.js
DIFF = {0: "Easy", 1: "Easy", 2: "Medium", 3: "Medium", 4: "Hard", 5: "Hard", 6: "Genius"}  # Python weekday(): Mon=0

# ---------- facts shown on the win screen (one per day, cycled) ----------
FACTS = [
    "Gertrude Elion shared the 1988 Nobel Prize in Medicine. Her drugs include allopurinol, azathioprine and aciclovir, and she never finished a PhD.",
    "Tu Youyou found artemisinin, a key malaria drug, after reading a 1,600-year-old Chinese remedy. She won the 2015 Nobel Prize in Medicine.",
    "Virginia Apgar devised the Apgar score in 1952. Every newborn is still checked with it one and five minutes after birth.",
    "Rosalind Franklin’s X-ray image, Photo 51, was key evidence for the double helix structure of DNA.",
    "Françoise Barré-Sinoussi co-discovered HIV in 1983 and shared the 2008 Nobel Prize in Medicine.",
    "Mary Seacole, a Jamaican-born nurse, ran the ‘British Hotel’ near Balaclava, feeding and nursing soldiers in the Crimean War.",
    "Elizabeth Blackwell became the first woman to earn a medical degree in the United States, in 1849.",
    "Adults have about 206 bones. Babies start with around 300, and many fuse as they grow.",
    "The stapes in the middle ear is the smallest bone in the body, about 3 mm long.",
    "René Laennec invented the stethoscope in 1816: a rolled-up tube of paper, so he didn’t have to put his ear to a patient’s chest.",
    "A red blood cell lives about 120 days and laps your circulation many thousands of times.",
    "In 1943 Mary Hunt found a mouldy cantaloupe in a Peoria market. Its strain of mould made far more penicillin and helped mass production.",
    "Stretched out, the DNA in a single human cell would be about 2 metres long.",
    "Your heart beats roughly 100,000 times a day.",
    "The cornea has no blood vessels. It gets most of its oxygen straight from the air.",
    "The brain is about 2% of body weight but uses around 20% of the body’s energy at rest.",
    "The World Health Organization declared smallpox eradicated in 1980, the first human disease wiped out.",
    "Dr Charles Drew, an African American surgeon, pioneered large-scale blood banking and plasma storage in the 1940s.",
    "Associate Professor Kelvin Kong, a Worimi man, became Australia’s first Aboriginal surgeon.",
    "Dr Māui Pōmare, the first Māori doctor, qualified in 1899 and led public health work in Māori communities.",
    "Susan La Flesche Picotte became the first Native American woman to earn a medical degree in the US, in 1889.",
    "Louis Braille, blind from the age of three, published his raised-dot reading system in 1829.",
    "The Paralympic movement grew from the Stoke Mandeville Games, organised by Dr Ludwig Guttmann in 1948.",
    "In 1847 Ignaz Semmelweis showed that handwashing with chlorinated lime cut deaths from childbed fever.",
    "Florence Nightingale used a ‘rose diagram’ to show that most Crimean War soldiers died of preventable disease, not wounds.",
    "Dorothy Hodgkin worked out the structures of penicillin, vitamin B12 and insulin. She won the 1964 Nobel Prize in Chemistry.",
    "Insulin was first given to a patient, 14-year-old Leonard Thompson, in Toronto in January 1922.",
    "Nettie Stevens discovered in 1905 that X and Y chromosomes determine sex.",
    "Cells taken from Henrietta Lacks in 1951, without her consent, became HeLa: the first human cell line to grow indefinitely.",
    "The average age of menopause in Australia is around 51.",
    "Heart attack symptoms in women can include breathlessness, nausea, and jaw, neck or back pain, not just chest pain.",
    "Skin is the body’s largest organ.",
    "The medical name for hiccups is singultus.",
    "Lady Mary Wortley Montagu promoted smallpox inoculation in Britain in 1721, decades before Jenner’s cowpox vaccine.",
    "The first X-ray of a human body part, in 1895, was of Anna Bertha Röntgen’s hand, wedding ring and all.",
    "Professor Fiona Wood co-invented spray-on skin for burns and was named Australian of the Year in 2005.",
    "Dr Dinesh Palipana was injured in a car crash as a medical student, went back, graduated, and became Queensland’s first quadriplegic medical intern.",
    "Oral rehydration solution, refined in Bangladesh and India, is a simple mix of salts and sugar that has saved millions of lives from diarrhoea.",
    "Research by Professor Fiona Stanley and Dr Carol Bower helped show that folate before pregnancy prevents neural tube defects such as spina bifida.",
    "Fingernails grow about 3 mm a month. Toenails are much slower.",
    "The Royal Flying Doctor Service made its first flight in 1928.",
    "A pill’s coating isn’t just for taste: enteric coatings protect some medicines from stomach acid, or the stomach from the medicine.",
    "Insulin was discovered in Toronto in 1921 by Frederick Banting and Charles Best, with James Collip and John Macleod.",
    "The word \u2018hormone\u2019 was coined in 1905 by physiologist Ernest Starling, from the Greek for \u2018to set in motion\u2019.",
    "Japanese chemist Jokichi Takamine isolated adrenaline in 1901, one of the first hormones ever purified.",
    "Rosalyn Yalow co-developed radioimmunoassay, letting labs measure tiny amounts of hormones like insulin. She won the 1977 Nobel Prize in Medicine.",
    "PCOS is one of the most common hormone conditions, affecting roughly 8 to 13% of women of reproductive age.",
    "Melatonin, sometimes called the hormone of darkness, is made by the pineal gland, mostly at night.",
    "The thyroid is a butterfly-shaped gland at the front of the neck. Its hormones help set how fast the body uses energy.",
]
NFACTS = [
    "Honey can keep for decades, even centuries, because it’s low in water and quite acidic.",
    "Octopuses have three hearts and blue blood.",
    "Botanically, bananas are berries. Strawberries are not.",
    "Ada Lovelace published what is often called the first computer program, in 1843.",
    "Katherine Johnson checked the orbit calculations for John Glenn’s 1962 flight. He asked for her by name.",
    "Actor Hedy Lamarr co-invented a frequency-hopping system in 1942, an idea later echoed in Wi-Fi and Bluetooth.",
    "Sudoku began as ‘Number Place’ in a US puzzle magazine in 1979. Japan’s Nikoli named it Sudoku in 1984.",
    "A group of owls is called a parliament.",
    "Owls can’t move their eyes, so they turn their heads, up to about 270 degrees.",
    "A day on Venus is longer than its year.",
    "The Eiffel Tower can grow around 15 cm taller in summer as the iron expands.",
    "Cathy Freeman lit the cauldron at the Sydney 2000 Olympics, then won 400 m gold ten days later.",
    "Dame Whina Cooper led the 1975 Māori Land March to Wellington at the age of 79.",
    "Wilma Rudolph wore a leg brace as a child after polio, then won three sprint golds at the 1960 Olympics.",
    "Paralympian Kurt Fearnley crawled the 96 km Kokoda Track in 2009.",
    "Louise Sauvage won the Boston Marathon wheelchair race four times.",
    "The shortest war on record, between Britain and Zanzibar in 1896, lasted under an hour.",
    "Wombats produce cube-shaped poo.",
    "Sharks are older than trees, by tens of millions of years.",
    "The dot over a lowercase i or j is called a tittle.",
    "Scotland’s national animal is the unicorn.",
    "Kiwifruit used to be sold as ‘Chinese gooseberries’ until New Zealand growers renamed them in 1959.",
    "A pineapple plant takes around two years to grow a single pineapple.",
    "The ‘seeds’ on a strawberry are actually tiny fruits, each with a seed inside.",
    "The Mpemba effect, where hot water sometimes freezes faster than cold, is named after Tanzanian student Erasto Mpemba.",
    "Mary Anning helped uncover one of the first ichthyosaur fossils in 1811, when she was about 12.",
    "Marie Curie is the only person to win Nobel Prizes in two different sciences: physics and chemistry.",
    "Valentina Tereshkova became the first woman in space in 1963.",
    "Neville Bonner became the first Aboriginal member of Australia’s federal parliament in 1971.",
    "Evonne Goolagong Cawley, a Wiradjuri woman, won seven Grand Slam singles titles.",
    "Ash Barty, a Ngarigo woman, won Wimbledon in 2021.",
    "You can’t see the Great Wall of China from the Moon with the naked eye.",
    "Flamingos are pink because of pigments in the algae and shrimp they eat.",
    "Apples float because roughly a quarter of their volume is air.",
    "Lightning is about five times hotter than the surface of the Sun.",
    "Butterflies taste with their feet.",
    "Beethoven wrote his Ninth Symphony while almost completely deaf.",
    "Frida Kahlo painted many works from her bed, using an easel built to fit over it.",
    "Watermelon is about 92% water.",
    "Bubble wrap was first invented in 1957 as a textured wallpaper.",
    "Alan Turing, the code-breaker and computing pioneer, proposed his famous Turing test in 1950.",
    "Earth’s days are getting very slightly longer over time, as the Moon’s tides slow its spin.",
]

# ---------- geometry ----------
class Geo:
    def __init__(self, n):
        self.n = n
        self.br, self.bc = (2, 3) if n == 6 else (3, 3)
        self.N = n * n
        self.full = (1 << n) - 1
        rows = [[r * n + c for c in range(n)] for r in range(n)]
        cols = [[r * n + c for r in range(n)] for c in range(n)]
        boxes = []
        for R in range(0, n, self.br):
            for C in range(0, n, self.bc):
                boxes.append([(R + r) * n + C + c for r in range(self.br) for c in range(self.bc)])
        self.rows, self.cols, self.boxes = rows, cols, boxes
        self.units = rows + cols + boxes
        self.row_of = [i // n for i in range(self.N)]
        self.col_of = [i % n for i in range(self.N)]
        self.box_of = [0] * self.N
        for b, cells in enumerate(boxes):
            for i in cells:
                self.box_of[i] = b
        self.peers = []
        for i in range(self.N):
            s = set(rows[self.row_of[i]]) | set(cols[self.col_of[i]]) | set(boxes[self.box_of[i]])
            s.discard(i)
            self.peers.append(sorted(s))
        self.peerset = [set(p) for p in self.peers]


GEOS = {6: Geo(6), 9: Geo(9)}


def bits(m):
    out, d = [], 1
    while m:
        if m & 1:
            out.append(d)
        m >>= 1
        d += 1
    return out


def pc(m):
    return bin(m).count("1")


def B(d):
    return 1 << (d - 1)


# ---------- brute force (fill + count solutions) ----------
def count_solutions(vals, g, limit=2):
    vals = list(vals)
    cand = [0] * g.N
    for i in range(g.N):
        if not vals[i]:
            m = g.full
            for p in g.peers[i]:
                if vals[p]:
                    m &= ~B(vals[p])
            cand[i] = m
    for i in range(g.N):
        if vals[i]:
            for p in g.peers[i]:
                if vals[p] == vals[i]:
                    return 0
    count = [0]

    def rec():
        best, bm, bc = -1, 0, 99
        for i in range(g.N):
            if not vals[i]:
                m = cand[i]
                c = pc(m)
                if c == 0:
                    return
                if c < bc:
                    best, bm, bc = i, m, c
                    if c == 1:
                        break
        if best < 0:
            count[0] += 1
            return
        for d in bits(bm):
            vals[best] = d
            changed = []
            for p in g.peers[best]:
                if not vals[p] and cand[p] & B(d):
                    cand[p] &= ~B(d)
                    changed.append(p)
            rec()
            for p in changed:
                cand[p] |= B(d)
            vals[best] = 0
            if count[0] >= limit:
                return

    rec()
    return count[0]


def full_grid(g, rng):
    vals = [0] * g.N

    def rec(i):
        if i == g.N:
            return True
        used = 0
        for p in g.peers[i]:
            if vals[p]:
                used |= B(vals[p])
        ds = [d for d in range(1, g.n + 1) if not used & B(d)]
        rng.shuffle(ds)
        for d in ds:
            vals[i] = d
            if rec(i + 1):
                return True
        vals[i] = 0
        return False

    rec(0)
    return vals


# ---------- logical solver ----------
TIER = {"Naked single": 1, "Hidden single": 1, "Pointing": 2, "Claiming": 2, "Naked pair": 3, "Hidden pair": 3,
        "Naked triple": 4, "Hidden triple": 4, "X-wing": 5, "Swordfish": 5, "XY-wing": 5, "Colouring chain": 5}


class Logic:
    def __init__(self, vals, g):
        self.g = g
        self.v = list(vals)
        self.c = [0] * g.N
        for i in range(g.N):
            if not self.v[i]:
                m = g.full
                for p in g.peers[i]:
                    if self.v[p]:
                        m &= ~B(self.v[p])
                self.c[i] = m

    def place(self, i, d):
        self.v[i] = d
        self.c[i] = 0
        for p in self.g.peers[i]:
            self.c[p] &= ~B(d)

    def elim(self, cells, mask):
        hit = False
        for i in cells:
            if not self.v[i] and self.c[i] & mask:
                self.c[i] &= ~mask
                hit = True
        return hit

    # tier 1
    def naked_single(self):
        hit = False
        for i in range(self.g.N):
            if not self.v[i] and pc(self.c[i]) == 1:
                self.place(i, bits(self.c[i])[0])
                hit = True
        return hit

    def hidden_single(self):
        for u in self.g.units:
            for d in range(1, self.g.n + 1):
                pos = [i for i in u if not self.v[i] and self.c[i] & B(d)]
                if len(pos) == 1 and not any(self.v[i] == d for i in u):
                    self.place(pos[0], d)
                    return True
        return False

    # tier 2
    def pointing(self):
        g = self.g
        for bx in g.boxes:
            for d in range(1, g.n + 1):
                pos = [i for i in bx if not self.v[i] and self.c[i] & B(d)]
                if len(pos) < 2:
                    continue
                rs = {g.row_of[i] for i in pos}
                if len(rs) == 1:
                    if self.elim([i for i in g.rows[rs.pop()] if i not in bx], B(d)):
                        return True
                cs = {g.col_of[i] for i in pos}
                if len(cs) == 1:
                    if self.elim([i for i in g.cols[cs.pop()] if i not in bx], B(d)):
                        return True
        return False

    def claiming(self):
        g = self.g
        for line in g.rows + g.cols:
            for d in range(1, g.n + 1):
                pos = [i for i in line if not self.v[i] and self.c[i] & B(d)]
                if len(pos) < 2:
                    continue
                bs = {g.box_of[i] for i in pos}
                if len(bs) == 1:
                    if self.elim([i for i in g.boxes[bs.pop()] if i not in line], B(d)):
                        return True
        return False

    # tiers 3-4
    def naked(self, k):
        for u in self.g.units:
            open_ = [i for i in u if not self.v[i]]
            small = [i for i in open_ if 2 <= pc(self.c[i]) <= k]
            for combo in combinations(small, k):
                m = 0
                for i in combo:
                    m |= self.c[i]
                if pc(m) == k:
                    if self.elim([i for i in open_ if i not in combo], m):
                        return True
        return False

    def hidden(self, k):
        g = self.g
        for u in g.units:
            placed = {self.v[i] for i in u if self.v[i]}
            ds = [d for d in range(1, g.n + 1) if d not in placed]
            pos = {d: [i for i in u if not self.v[i] and self.c[i] & B(d)] for d in ds}
            ds = [d for d in ds if 2 <= len(pos[d]) <= k]
            for combo in combinations(ds, k):
                cells = set()
                for d in combo:
                    cells.update(pos[d])
                if len(cells) == k:
                    keep = 0
                    for d in combo:
                        keep |= B(d)
                    hit = False
                    for i in cells:
                        if self.c[i] & ~keep:
                            self.c[i] &= keep
                            hit = True
                    if hit:
                        return True
        return False

    # tier 5
    def fish(self, k):
        g = self.g
        for d in range(1, g.n + 1):
            for base, cover, bof, cof in ((g.rows, g.cols, g.row_of, g.col_of), (g.cols, g.rows, g.col_of, g.row_of)):
                lines = []
                for li, line in enumerate(base):
                    if any(self.v[i] == d for i in line):
                        continue
                    pos = {cof[i] for i in line if not self.v[i] and self.c[i] & B(d)}
                    if 2 <= len(pos) <= k:
                        lines.append((li, pos))
                for combo in combinations(lines, k):
                    cs = set()
                    for _, p in combo:
                        cs |= p
                    if len(cs) == k:
                        bl = {li for li, _ in combo}
                        targets = [i for cc in cs for i in cover[cc] if bof[i] not in bl]
                        if self.elim(targets, B(d)):
                            return True
        return False

    def xy_wing(self):
        g = self.g
        bi = [i for i in range(g.N) if not self.v[i] and pc(self.c[i]) == 2]
        for p in bi:
            a, b = bits(self.c[p])
            wings = [q for q in g.peers[p] if q in bi and q != p]
            for x in wings:
                for y in wings:
                    if x >= y:
                        continue
                    cx, cy = self.c[x], self.c[y]
                    for (u, w) in ((x, y), (y, x)):
                        cu, cw = self.c[u], self.c[w]
                        if cu & B(a) and not cu & B(b) and cw & B(b) and not cw & B(a):
                            zu, zw = cu & ~B(a), cw & ~B(b)
                            if zu == zw and pc(zu) == 1:
                                targets = [i for i in g.peerset[u] & g.peerset[w] if i != p]
                                if self.elim(targets, zu):
                                    return True
                    del cx, cy
        return False

    def colouring(self):
        g = self.g
        for d in range(1, g.n + 1):
            adj = {}
            for u in g.units:
                pos = [i for i in u if not self.v[i] and self.c[i] & B(d)]
                if len(pos) == 2:
                    a, b = pos
                    adj.setdefault(a, set()).add(b)
                    adj.setdefault(b, set()).add(a)
            seen = {}
            for start in adj:
                if start in seen:
                    continue
                comp = {start: 0}
                stack = [start]
                while stack:
                    x = stack.pop()
                    for y in adj[x]:
                        if y not in comp:
                            comp[y] = 1 - comp[x]
                            stack.append(y)
                seen.update(comp)
                if len(comp) < 4:
                    continue
                groups = [[i for i in comp if comp[i] == k] for k in (0, 1)]
                # colour wrap: two cells of one colour see each other -> that colour is false
                for k in (0, 1):
                    grp = groups[k]
                    if any(b in g.peerset[a] for a, b in combinations(grp, 2)):
                        if self.elim(grp, B(d)):
                            return True
                # colour trap: an uncoloured cell sees both colours
                targets = [i for i in range(g.N) if not self.v[i] and self.c[i] & B(d) and i not in comp
                           and any(j in g.peerset[i] for j in groups[0]) and any(j in g.peerset[i] for j in groups[1])]
                if self.elim(targets, B(d)):
                    return True
        return False

    def steps(self):
        return [
            ("Hidden single", self.hidden_single), ("Naked single", self.naked_single),
            ("Pointing", self.pointing), ("Claiming", self.claiming),
            ("Naked pair", lambda: self.naked(2)), ("Hidden pair", lambda: self.hidden(2)),
            ("Naked triple", lambda: self.naked(3)), ("Hidden triple", lambda: self.hidden(3)),
            ("X-wing", lambda: self.fish(2)), ("XY-wing", self.xy_wing), ("Swordfish", lambda: self.fish(3)),
            ("Colouring chain", self.colouring),
        ]

    def solve(self, max_tier):
        used = {}
        steps = [s for s in self.steps() if TIER[s[0]] <= max_tier]
        while True:
            if all(self.v):
                return True, used
            for name, fn in steps:
                if fn():
                    used[name] = used.get(name, 0) + 1
                    break
            else:
                return False, used


def grade(vals, g, max_tier=5):
    ok, used = Logic(vals, g).solve(max_tier)
    return ok, (max(TIER[k] for k in used) if used else 0), used


# ---------- making a puzzle ----------
def carve(g, rng, max_tier, min_clues):
    sol = full_grid(g, rng)
    puz = list(sol)
    order = list(range(g.N))
    rng.shuffle(order)
    for i in order:
        j = g.N - 1 - i
        if not puz[i] or i > j:
            continue
        keep = (puz[i], puz[j])
        puz[i] = puz[j] = 0
        if sum(1 for x in puz if x) < min_clues or not grade(puz, g, max_tier)[0]:
            puz[i], puz[j] = keep
    return puz, sol


SPEC = {  # size, max tier allowed while carving, tiers accepted, clue floor
    "Easy": (6, 1, {1}, 14),
    "Medium": (6, 3, {2, 3}, 0),
    "Hard": (9, 2, {2}, 0),
    "Genius": (9, 4, {3, 4}, 0),
    "Einstein": (9, 5, {5}, 0),
}


def make(date, diff):
    n, mt, accept, floor = SPEC[diff]
    g = GEOS[n]
    best = None
    for attempt in range(4000):
        rng = random.Random("sudokrine|%s|%d" % (date, attempt))
        puz, sol = carve(g, rng, mt, floor)
        ok, tier, used = grade(puz, g, mt)
        if not ok:
            continue
        if diff == "Genius" and tier == 3 and best is None:
            best = (puz, sol, used)  # fallback: hidden/naked pairs; keep looking for triples a while
        if tier in accept and not (diff == "Genius" and tier == 3 and attempt < 60):
            return puz, sol, used
    if best:
        return best
    raise SystemExit("no %s puzzle for %s" % (diff, date))


def difficulty(date):
    if date in EINSTEIN:
        return "Einstein"
    return DIFF[dt.date.fromisoformat(date).weekday()]


def number(date):
    return (dt.date.fromisoformat(date) - dt.date.fromisoformat(LAUNCH)).days + 1


def pick_fact(lst, num, salt):
    order = list(range(len(lst)))
    random.Random("sudokrine-facts|" + salt).shuffle(order)
    return lst[order[(num - 1) % len(lst)]]


def verify(e):
    n = e["size"]
    g = GEOS[n]
    puz = [int(x) for x in e["puzzle"]]
    sol = [int(x) for x in e["solution"]]
    assert len(puz) == g.N and len(sol) == g.N
    assert all(p == 0 or p == s for p, s in zip(puz, sol)), "givens disagree with solution"
    for u in g.units:
        assert sorted(sol[i] for i in u) == list(range(1, n + 1)), "solution invalid"
    assert count_solutions(puz, g, 2) == 1, "not unique"
    ok, tier, used = grade(puz, g, 5)
    assert ok, "not solvable by logic"
    assert sorted(used) == sorted(e["techniques"]), "technique list mismatch"
    want = {"Easy": (6, {1}), "Medium": (6, {1, 2, 3}), "Hard": (9, {2}), "Genius": (9, {3, 4}), "Einstein": (9, {5})}[e["difficulty"]]
    assert n == want[0] and tier in want[1], "grade %d does not fit %s" % (tier, e["difficulty"])
    return tier, used


def main():
    args = sys.argv[1:]
    out_dir = os.path.join(HERE, "puzzles")
    if args and args[0] == "--check":
        bad = 0
        for f in sorted(os.listdir(out_dir)):
            if not f.endswith(".json"):
                continue
            for e in json.load(open(os.path.join(out_dir, f))):
                try:
                    tier, used = verify(e)
                    assert e["number"] == number(e["date"]) and e["difficulty"] == difficulty(e["date"])
                    print("%s #%-3d %-8s %dx%d clues %2d  tier %d  %s" % (e["date"], e["number"], e["difficulty"], e["size"], e["size"], e["clues"], tier, ", ".join(sorted(used, key=lambda k: TIER[k]))))
                except AssertionError as x:
                    bad += 1
                    print("FAIL", e["date"], x)
        print("OK" if not bad else "%d FAILED" % bad)
        sys.exit(1 if bad else 0)
    start, end = (args + [LAUNCH, "2026-12-31"])[:2] if args else (LAUNCH, "2026-12-31")
    d, last = dt.date.fromisoformat(start), dt.date.fromisoformat(end)
    months = {}
    while d <= last:
        ds = d.isoformat()
        diff = difficulty(ds)
        puz, sol, used = make(ds, diff)
        num = number(ds)
        e = {"date": ds, "number": num, "difficulty": diff, "size": GEOS[6 if diff in ("Easy", "Medium") else 9].n,
             "box": [GEOS[6].br, GEOS[6].bc] if diff in ("Easy", "Medium") else [3, 3],
             "puzzle": "".join(map(str, puz)), "solution": "".join(map(str, sol)),
             "clues": sum(1 for x in puz if x), "techniques": sorted(used, key=lambda k: (TIER[k], k)),
             "fact": pick_fact(FACTS, num, "m"), "nfact": pick_fact(NFACTS, num, "n")}
        verify(e)
        print(ds, diff, e["clues"], e["techniques"], flush=True)
        months.setdefault(ds[:7], []).append(e)
        d += dt.timedelta(days=1)
    os.makedirs(out_dir, exist_ok=True)
    for m, lst in months.items():
        path = os.path.join(out_dir, m + ".json")
        old = []
        if os.path.exists(path):
            old = [x for x in json.load(open(path)) if x["date"] not in {e["date"] for e in lst}]
        lst = sorted(old + lst, key=lambda x: x["date"])
        with open(path, "w") as f:
            f.write("[\n" + ",\n".join(json.dumps(x, ensure_ascii=False) for x in lst) + "\n]\n")
        print("wrote", path, len(lst))


if __name__ == "__main__":
    main()
