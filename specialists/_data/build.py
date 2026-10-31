"""Build the Specialists page: ONE alphabetical list (no categories), private practice only.
Run from the repo root:  python3 specialists/_data/build.py specialists/_data
Reads every *.json in the data folder ({slug:{name, people:[...]}}). Public-only services are filtered out."""
import json, html, os, re, sys, glob, datetime
DD = sys.argv[1] if len(sys.argv) > 1 else 'specialists/_data'
CHECKED = "31 October 2026"
PUB = re.compile(r"John Hunter|Calvary Mater|\bHNE\b|Hunter New England|Rankin Park|Mater Mental Health|CAMHS|Nexus|headspace|Pacific Clinic|Child Development Team|Integrated Pain Service|Newcastle Eye Hospital|Belmont Hospital|Maitland Hospital|Royal Newcastle|public", re.I)
PRIV = re.compile(r"Private|GenesisCare|Hunter Eye Surgeons|rooms", re.I)
NAMES = {"ent": "ENT", "obstetrics-gynaecology": "Obstetrics and gynaecology", "ortho-hand-upper-limb": "Orthopaedics (hand and upper limb)", "ortho-shoulder": "Orthopaedics (shoulder)", "ortho-hip-knee": "Orthopaedics (hip and knee)", "ortho-foot-ankle": "Orthopaedics (foot and ankle)", "ortho-spine": "Orthopaedics (spine)", "general-surgery": "General surgery", "psychiatry-adult": "Psychiatry", "psychiatry-child-adolescent": "Child and adolescent psychiatry", "psychiatry-perinatal": "Perinatal psychiatry", "paediatrics-general": "Paediatrics", "paediatrics-developmental": "Developmental paediatrics", "immunology-allergy": "Immunology and allergy", "respiratory-sleep": "Respiratory and sleep medicine"}
def is_public(p):
    txt = p.get("name", "") + " | " + p.get("practice", "")
    hosp = " ".join((p.get("practical") or {}).get("hospitals") or [])
    return bool(PUB.search(txt)) and not PRIV.search(txt + " " + hosp)
TITLE = re.compile(r"^(Dr|Prof|Professor|A/Prof|Assoc Prof|Associate Professor|Conjoint Associate Professor|Clinical Associate Professor)\.?\s+", re.I)
def sortkey(n):
    if TITLE.match(n) or re.match(r"^[A-Z][a-z]+ [A-Z][a-zA-Z'\-]+$", n):
        base = TITLE.sub("", n); base = re.sub(r"\s*\(.*?\)", "", base).strip()
        parts = base.split(); return (parts[-1] if parts else base).lower() + " " + base.lower()
    return re.sub(r"^the\s+", "", n.lower())
people = {}; removed = []
for f in sorted(glob.glob(os.path.join(DD, "*.json"))):
    for slug, sec in json.load(open(f)).items():
        label = NAMES.get(slug, sec.get("name", slug))
        for p in sec["people"]:
            if is_public(p): removed.append(p["name"]); continue
            key = re.sub(r"\W+", "", TITLE.sub("", p["name"]).lower())
            if key in people:
                q = people[key]
                if label not in q["_labels"]: q["_labels"].append(label)
                if p.get("practice") and p["practice"] != q.get("practice") and all(p["practice"] != x[0] for x in q.setdefault("_also", [])):
                    q["_also"].append((p["practice"], p.get("suburb") or p.get("address", ""), p.get("phone", "")))
                for k in ("interests", "inclusive", "sources"):
                    for x in p.get(k) or []:
                        if x not in q.setdefault(k, []): q[k].append(x)
            else:
                p = dict(p); p["_labels"] = [label]; people[key] = p
L = sorted(people.values(), key=lambda p: sortkey(p["name"]))
e = lambda s: html.escape(str(s or ""), quote=True)
def card(p):
    pr = p.get("practical") or {}; lines = []
    if p.get("practice") and p["practice"] != p["name"]: lines.append(f'<span class="sp-prac">{e(p["practice"])}</span>')
    if p.get("address"): lines.append(f'<span>{e(p["address"])}</span>')
    c = []
    if p.get("phone"): c.append(f'<a href="tel:{e(re.sub(r"[^0-9+]", "", p["phone"]))}">{e(p["phone"])}</a>')
    if p.get("fax"): c.append(f'Fax {e(p["fax"])}')
    if p.get("website"): c.append(f'<a href="{e(p["website"])}" rel="noopener">Website</a>')
    if c: lines.append("<span>" + " · ".join(c) + "</span>")
    if p.get("ereferral"): lines.append(f'<span>E-referral: {e(p["ereferral"])}</span>')
    for pr2, sub2, ph2 in p.get("_also") or []:
        lines.append(f'<span>Also: {e(pr2)}' + (f', {e(sub2)}' if sub2 else '') + (f' · <a href="tel:{e(re.sub(r"[^0-9+]", "", ph2))}">{e(ph2)}</a>' if ph2 else '') + '</span>')
    extra = []
    if p.get("interests"): extra.append(f'<p class="sp-int"><b>Interests:</b> {e("; ".join(p["interests"]))}</p>')
    facts = []
    if pr.get("telehealth") is True: facts.append("Telehealth")
    bb = pr.get("bulk_billing")
    if bb in ("yes", "some"): facts.append("Bulk billing" + (" (some)" if bb == "some" else ""))
    if pr.get("ndis") is True: facts.append("NDIS")
    if pr.get("medicare_cdm") is True: facts.append("Medicare care plans")
    if pr.get("ages"): facts.append("Ages: " + pr["ages"])
    if pr.get("wait"): facts.append("Wait: " + pr["wait"])
    if pr.get("languages"): facts.append("Languages: " + ", ".join(pr["languages"]))
    if pr.get("hospitals"): facts.append("Hospitals: " + ", ".join(pr["hospitals"]))
    if facts: extra.append('<p class="sp-facts">' + e(" · ".join(facts)) + "</p>")
    if p.get("inclusive"): extra.append('<p class="sp-inc">' + "".join(f"<span>{e(x)}</span>" for x in p["inclusive"]) + "</p>")
    srcs = " ".join(f'<a href="{e(u)}" rel="noopener">[{i+1}]</a>' for i, u in enumerate(p.get("sources") or []))
    q = " ".join([p["name"], p.get("practice", ""), p.get("suburb", ""), " ".join(p["_labels"]), " ".join(p.get("interests") or []), " ".join(p.get("inclusive") or [])]).lower()
    return (f'<li class="sp-card" data-q="{e(q)}"><h3>{e(p["name"])}</h3><p class="sp-sub">{e(" · ".join(p["_labels"]))}</p>'
            f'<p class="sp-lines">{"".join(lines)}</p>{"".join(extra)}<p class="sp-src">Checked {e(p.get("checked", ""))} · Sources {srcs}</p></li>')
# group by first letter for the A–Z jump bar (letters only, not categories)
body, letters, cur = [], [], None
for p in L:
    k = sortkey(p["name"]); ch = k[:1].upper() if k[:1].isalpha() else "#"
    if ch != cur:
        if cur is not None: body.append("</ul>")
        body.append(f'<h2 class="sp-letter" id="l-{ch}">{ch}</h2><ul class="sp-list">'); letters.append(ch); cur = ch
    body.append(card(p))
body.append("</ul>")
src = open("deep-dives/index.html").read()
head = src[:src.index("</head>")]
def sub(h, pat, val): return re.sub(pat, lambda m: m.group(1) + val, h)
title = "Specialists and allied health in Newcastle and the Hunter | Malady Wise"
desc = "A–Z directory of private specialists and allied health practitioners in Newcastle and the Hunter, NSW: practice contacts, stated interests and inclusive-practice notes from public sources."
head = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="https://maladywise.com/specialists/">', head)
head = re.sub(r"<title>[^<]*</title>", f"<title>{e(title)}</title>", head)
for prop in ('name="description"', 'property="og:description"'): head = sub(head, r'(<meta ' + prop + r' content=")[^"]*', e(desc))
head = sub(head, r'(<meta property="og:title" content=")[^"]*', e(title))
foot = src[src.index("<footer"):].replace("<script>MW.page();</script>", '<script>MW.page();</script>\n<script src="/specialists/sp.js?v=2"></script>')
DISC = '<p class="callout"><b>A directory, not a recommendation.</b> Private practices only, built from public sources (practice websites, hospital profiles, Healthdirect, professional directories). Details change: confirm with the practice. Specialists need a GP referral. Inclusive-practice notes only quote what a practice says publicly. Spot an error? <a href="/contact/">Tell us</a>.</p>'
az = '<nav class="sp-az" aria-label="Jump to letter">' + "".join(f'<a href="#l-{c}">{c}</a>' for c in letters) + "</nav>"
page = (head + '</head>\n<body>\n<main class="wrap doc sp-page">\n<h1>Specialists</h1>'
        f'<p class="lede">Private specialists and allied health in Newcastle and the Hunter, A–Z.</p>'
        f'<p class="evkey"><span class="ev m">Newcastle and the Hunter</span> {len(L)} listings. Last checked {CHECKED}.</p>'
        '<label class="sp-search"><span>Search</span><input type="search" placeholder="Name, specialty, suburb or interest" data-sp-filter></label>'
        '<p class="sp-count" aria-live="polite"></p>' + az + "".join(body) + DISC + f'<p class="meta"><em>Last checked {CHECKED}.</em></p>\n' + foot)
open("specialists/index.html", "w").write(page)
print(len(L), "listed;", len(removed), "public-only removed")
