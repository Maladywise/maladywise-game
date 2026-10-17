import json, random, datetime
from english_words import get_english_words_set
from wordfreq import zipf_frequency
S='/tmp/claude-0/-home-claude/2f16175d-72cc-57fe-ad9a-4efa517cd673/scratchpad/'
MED=set(w for w in open(S+'medwords.txt').read().split() if len(w)>=4 and w.isalpha() and w not in ('edema','xray'))
BLOCK=set("""titties titty tits boob boobs booby assn comm dist econ cert tron pres vols secs sens cams macs pics toms dona nazi nazis sexy sexual sex orgasm erotic horny nude nudes strip stripper bimbo hussy tramp slag pimp pimps alan anna hanna galilee liang irene rita tara cass carr tania nina dina gina lena lina tina mina rena elena diana dana edna enid ada ida ira eli leon leo nora nell aint dont cant wont isnt anal anus arse arses ass asses bitch boob boobs butt cock cocks coon crap cunt damn dick dildo dyke fag fags fuck gook homo hooker jizz kike nazi nigga paki penis piss poop porn prick pubic queer rape raped rapist scrotum semen shit slut spic tits titty turd twat vagina wank whore""".split())
from spylls.hunspell import Dictionary
from wordfreq import top_n_list
AU=Dictionary.from_files(S+'dict/en_AU')
GEN=set(w for w in top_n_list('en',250000) if 4<=len(w)<=12 and w.isascii() and w.isalpha() and w.islower() and zipf_frequency(w,'en')>=2.9 and AU.lookup(w))
def usmed(w): return False
VALID=set(w for w in (GEN|MED)-BLOCK if not usmed(w))
MED-=BLOCK
def words_for(letters, centre):
    L=set(letters)
    return sorted(w for w in VALID if centre in w and set(w)<=L)
def score(w, letters):
    p=1 if len(w)==4 else len(w)
    if set(w)==set(letters): p+=7
    if w in MED: p*=2
    return p
cands=[]
for pw in sorted(MED):
    s=set(pw)
    if len(s)!=7: continue
    letters=''.join(sorted(s))
    for c in letters:
        ws=words_for(letters,c); med=[w for w in ws if w in MED]
        if 18<=len(ws)<=70 and len(med)>=4:
            cands.append(dict(pangram=pw,letters=letters,centre=c,n=len(ws),med=len(med),z=zipf_frequency(pw,'en')))
print('candidates',len(cands), 'pangrams',len(set(c['pangram'] for c in cands)))
# grade: easy = common pangram & many words; genius = rare pangram/few words
def hardness(c): return -c['z']*2 - c['n']/15
cands.sort(key=hardness)
used=set(); chosen=[]
for c in cands:
    if c['letters'] in used: continue
    used.add(c['letters']); chosen.append(c)
print('distinct letter sets',len(chosen))
n=len(chosen); q=[chosen[:n//4],chosen[n//4:n//2],chosen[n//2:3*n//4],chosen[3*n//4:]]
pools={"Easy":q[0],"Medium":q[1],"Hard":q[2],"Genius":q[3]}
rnd=random.Random(7)
for p in pools.values(): rnd.shuffle(p)
byDow=["Genius","Easy","Easy","Medium","Medium","Hard","Hard"]
d=datetime.date(2026,10,17); out={}; EIN_DATE=datetime.date(2026,11,8)
for i in range(35):
    diff=byDow[(d.weekday()+1)%7]
    if d==EIN_DATE:
        # Einstein: hardest remaining genius-ish set with rarest pangram
        pool=sorted(pools["Genius"]+pools["Hard"], key=lambda c:(c['z'], c['n']))
        c=pool[0]; (pools["Genius"] if c in pools["Genius"] else pools["Hard"]).remove(c); diff="Einstein"
    else:
        c=pools[diff].pop()
    ws=words_for(c['letters'],c['centre'])
    others=[x for x in c['letters'] if x!=c['centre']]; rnd.shuffle(others)
    out.setdefault(d.strftime('%Y-%m'),[]).append({"date":d.isoformat(),"number":i+1,"difficulty":diff,
      "centre":c['centre'].upper(),"outer":''.join(others).upper(),
      "words":[w.upper() for w in ws],"medical":[w.upper() for w in ws if w in MED],
      "pangrams":[w.upper() for w in ws if set(w)==set(c['letters'])],
      "max":sum(score(w,c['letters']) for w in ws)})
    d+=datetime.timedelta(1)
for m,a in out.items():
    json.dump(a,open(f'morphemia/puzzles/{m}.json','w'),separators=(',',':'),ensure_ascii=True)
    for p in a: print(p['date'],p['difficulty'][:3],p['centre'],p['outer'],len(p['words']),'med',len(p['medical']),p['pangrams'])
