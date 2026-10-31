import json, html, os, re, sys
SP = sys.argv[1]
D = {}
for f in ['spec-medical.json', 'spec-surgical.json']:
    D.update(json.load(open(os.path.join(SP, f))))
GROUPS = [
 ("Heart, lungs and blood", ["cardiology","respiratory-sleep","haematology","vascular-surgery"]),
 ("Gut, kidneys and hormones", ["gastroenterology","nephrology","endocrinology","general-surgery","urology"]),
 ("Brain, nerves and pain", ["neurology","neurosurgery","pain-medicine","rehabilitation"]),
 ("Mind and development", ["psychiatry-adult","psychiatry-child-adolescent","psychiatry-perinatal","paediatrics-developmental"]),
 ("Children", ["paediatrics-general"]),
 ("Women's and sexual health", ["obstetrics-gynaecology","sexual-health"]),
 ("Bones, joints and muscles", ["rheumatology","ortho-hip-knee","ortho-shoulder","ortho-hand-upper-limb","ortho-foot-ankle","ortho-spine"]),
 ("Skin, eyes, ears and face", ["dermatology","ophthalmology","ent","plastic-surgery"]),
 ("Cancer", ["medical-oncology","radiation-oncology"]),
 ("Immunity and infection", ["immunology-allergy","infectious-diseases"]),
 ("Older people and end of life", ["geriatric-medicine","palliative-care"]),
]
NAMES={"ent":"Ear, nose and throat (ENT)","obstetrics-gynaecology":"Obstetrics and gynaecology","ortho-hand-upper-limb":"Hand and upper limb surgery","ortho-shoulder":"Shoulder surgery","ortho-hip-knee":"Hip and knee surgery","ortho-foot-ankle":"Foot and ankle surgery","ortho-spine":"Spine surgery","general-surgery":"General surgery","psychiatry-adult":"Psychiatry (adults)","psychiatry-child-adolescent":"Child and adolescent psychiatry","psychiatry-perinatal":"Perinatal psychiatry","paediatrics-general":"Paediatrics","paediatrics-developmental":"Developmental paediatrics","immunology-allergy":"Immunology and allergy"}
for k,v in NAMES.items():
    if k in D: D[k]["name"]=v
listed = [s for _, ss in GROUPS for s in ss]
missing = [k for k in D if k not in listed]
if missing: GROUPS.append(("Other", missing))
e = lambda s: html.escape(str(s or ""), quote=True)
src = open('deep-dives/index.html').read()
headtpl = src[:src.index('</head>')]
foot = src[src.index('<footer'):]
def head(title, desc, url):
    h = headtpl
    h = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="https://maladywise.com{url}">', h)
    h = re.sub(r'<title>[^<]*</title>', f'<title>{e(title)}</title>', h)
    h = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + e(desc), h)
    h = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + e(title), h)
    h = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda m: m.group(1) + e(desc), h)
    return h + '</head>\n<body>\n<main class="wrap doc sp-page">\n'
DISC = '<p class="callout"><b>A directory, not a recommendation.</b> Built from public sources (practice websites, hospital profiles, Healthdirect). Details change: confirm with the practice. Most specialists need a GP referral. Inclusive-practice notes only quote what a practice says publicly. Spot an error? <a href="/contact/">Tell us</a>.</p>'
def yn(v):
    return {True: "Yes", False: "No"}.get(v, "")
def card(p):
    pr = p.get("practical") or {}
    lines = []
    if p.get("practice"): lines.append(f'<span class="sp-prac">{e(p["practice"])}</span>')
    if p.get("address"): lines.append(f'<span>{e(p["address"])}</span>')
    contact = []
    if p.get("phone"): contact.append(f'<a href="tel:{e(re.sub(r"[^0-9+]", "", p["phone"]))}">{e(p["phone"])}</a>')
    if p.get("fax"): contact.append(f'Fax {e(p["fax"])}')
    if p.get("website"): contact.append(f'<a href="{e(p["website"])}" rel="noopener">Website</a>')
    if contact: lines.append('<span>' + ' · '.join(contact) + '</span>')
    if p.get("ereferral"): lines.append(f'<span>E-referral: {e(p["ereferral"])}</span>')
    tags = []
    if p.get("interests"): tags.append(f'<p class="sp-int"><b>Interests:</b> {e("; ".join(p["interests"]))}</p>')
    facts = []
    if pr.get("telehealth") is True: facts.append("Telehealth")
    bb = pr.get("bulk_billing")
    if bb in ("yes", "some"): facts.append("Bulk billing" + (" (some)" if bb == "some" else ""))
    if pr.get("ages"): facts.append("Ages: " + pr["ages"])
    if pr.get("wait"): facts.append("Wait: " + pr["wait"])
    if pr.get("languages"): facts.append("Languages: " + ", ".join(pr["languages"]))
    if pr.get("hospitals"): facts.append("Hospitals: " + ", ".join(pr["hospitals"]))
    if facts: tags.append('<p class="sp-facts">' + e(" · ".join(facts)) + '</p>')
    if p.get("inclusive"): tags.append('<p class="sp-inc">' + "".join(f'<span>{e(x)}</span>' for x in p["inclusive"]) + '</p>')
    srcs = " ".join(f'<a href="{e(u)}" rel="noopener">[{i+1}]</a>' for i, u in enumerate(p.get("sources") or []))
    return (f'<li class="sp-card" data-q="{e((p.get("name","")+" "+p.get("practice","")+" "+p.get("suburb","")+" "+" ".join(p.get("interests") or [])).lower())}">'
            f'<h3>{e(p["name"])}</h3><p class="sp-sub">{e(p.get("specialty",""))}</p><p class="sp-lines">{"".join(lines)}</p>{"".join(tags)}'
            f'<p class="sp-src">Checked {e(p.get("checked",""))} · Sources {srcs}</p></li>')
os.makedirs('specialists', exist_ok=True)
total = 0; urls = []; index_groups = []
for gname, slugs in GROUPS:
    items = []
    for s in slugs:
        if s not in D: continue
        sec = D[s]; ppl = sorted(sec["people"], key=lambda p: (not p["name"].startswith(("Dr", "A/Prof", "Prof", "Assoc")), re.sub(r"^(Dr|A/Prof|Prof|Assoc Prof|Associate Professor)\.? ", "", p["name"]).split()[-1] if p["name"] else ""))
        total += len(ppl); url = f'/specialists/{s}/'; urls.append(url)
        title = f'{sec["name"]} specialists in Newcastle and the Hunter | Malady Wise'
        desc = f'{sec["name"]} in Newcastle and the Hunter, NSW: practice contacts, addresses, stated interests and public info. Directory, not a recommendation.'
        os.makedirs('specialists/' + s, exist_ok=True)
        body = (f'<p class="meta"><a href="/specialists/">Specialists</a> · Newcastle and the Hunter</p><h1>{e(sec["name"])}</h1>'
                f'<p class="lede">{len(ppl)} listed. Sorted by surname. Last checked 31 October 2026.</p>'
                f'<label class="sp-search"><span>Filter</span><input type="search" placeholder="Name, suburb or interest" data-sp-filter></label>'
                f'<ul class="sp-list">{"".join(card(p) for p in ppl)}</ul>{DISC}'
                f'<p class="meta"><em>Last checked 31 October 2026.</em></p>')
        open(f'specialists/{s}/index.html', 'w').write(head(title, desc, url) + body + '\n' + foot.replace('<script>MW.page();</script>', '<script>MW.page();</script>\n<script src="/specialists/sp.js?v=1"></script>'))
        items.append(f'<li><a href="{url}"><b>{e(sec["name"])}</b><span>{len(ppl)}</span></a></li>')
    if items: index_groups.append(f'<h2>{e(gname)}</h2><ul class="sp-specs">{"".join(items)}</ul>')
allcards = []
for s, sec in D.items():
    for p in sec["people"]:
        allcards.append({"n": p["name"], "s": sec["name"], "u": f"/specialists/{s}/", "q": (p["name"]+" "+p.get("practice","")+" "+p.get("suburb","")+" "+sec["name"]+" "+" ".join(p.get("interests") or [])).lower(), "sub": p.get("suburb","")})
body = ('<h1>Specialists</h1><p class="lede">Specialists in Newcastle and the Hunter, NSW, grouped by area. Practice contacts, stated interests and inclusive-practice notes from public sources.</p>'
        f'<p class="evkey"><span class="ev m">Newcastle and the Hunter</span> {total} listings across {len(urls)} specialties. Last checked 31 October 2026.</p>'
        '<label class="sp-search"><span>Search</span><input type="search" placeholder="Name, suburb, specialty or interest" data-sp-search></label><ul class="sp-results" hidden></ul>'
        + "".join(index_groups) + DISC +
        '<script>window.SP_ALL=' + json.dumps(allcards, ensure_ascii=False).replace('</', '<\\/') + ';</script>')
open('specialists/index.html', 'w').write(head('Specialists in Newcastle and the Hunter | Malady Wise', 'Directory of specialists in Newcastle and the Hunter, NSW, by specialty: practice contacts, interests and inclusive-practice notes from public sources.', '/specialists/') + body + '\n' + foot.replace('<script>MW.page();</script>', '<script>MW.page();</script>\n<script src="/specialists/sp.js?v=1"></script>'))
json.dump(urls, open(os.path.join(SP, 'sp-urls.json'), 'w'))
print(total, len(urls))
