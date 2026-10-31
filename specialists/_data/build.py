"""Build the Specialists page: ONE alphabetical list (no categories), private practice only.
Run from the repo root:  python3 specialists/_data/build.py specialists/_data
Reads every *.json in the data folder ({slug:{name, people:[...]}}). Public-only services are filtered out."""
import json, html, os, re, sys, glob, datetime, urllib.parse
DD = sys.argv[1] if len(sys.argv) > 1 else 'specialists/_data'
CHECKED = "31 October 2026"
PUB = re.compile(r"John Hunter|Calvary Mater|\bHNE\b|Hunter New England|Rankin Park|Mater Mental Health|CAMHS|Nexus|headspace|Pacific Clinic|Child Development Team|Integrated Pain Service|Newcastle Eye Hospital|Belmont Hospital|Maitland Hospital|Royal Newcastle|public", re.I)
PRIV = re.compile(r"Private|GenesisCare|Hunter Eye Surgeons|rooms", re.I)
NAMES = {"ent": "ENT (ear, nose and throat)", "obstetrics-gynaecology": "Obstetrics and gynaecology", "ortho-hand-upper-limb": "Orthopaedics: hand and wrist", "ortho-shoulder": "Orthopaedics: shoulder and elbow", "ortho-hip-knee": "Orthopaedics: hip and knee", "ortho-foot-ankle": "Orthopaedics: foot and ankle", "ortho-spine": "Orthopaedics: spine", "general-surgery": "General surgery", "psychiatry-adult": "Psychiatry", "psychiatry-child-adolescent": "Child and adolescent psychiatry", "psychiatry-perinatal": "Perinatal psychiatry", "paediatrics-general": "Paediatrics", "paediatrics-developmental": "Developmental paediatrics", "immunology-allergy": "Immunology and allergy", "respiratory-sleep": "Respiratory and sleep medicine", "exercise-physiology": "Exercise physiology", "occupational-therapy-adult": "Occupational therapy (adults)", "occupational-therapy-paediatric": "Occupational therapy (children)", "speech-pathology-paediatric": "Speech pathology (children)", "speech-pathology-adult": "Speech pathology (adults)", "dietetics": "Dietitians", "diabetes-education": "Diabetes educators", "continence": "Continence services", "lactation": "Lactation consultants", "social-work": "Mental health social workers"}
BADGES = [
 ("nd", "Neuro-affirming", r"neuro\s*-?\s*(diversity|divergen\w*)?\s*-?\s*affirm|neuroaffirm|neurodiversity|neurodivergen|autism[- ]affirm|adhd[- ]affirm",
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.5C3.5 8.5 2 10.3 2 12s1.5 3.5 4.5 3.5c3.5 0 7.5-7 11-7 3 0 4.5 1.8 4.5 3.5s-1.5 3.5-4.5 3.5c-3.5 0-7.5-7-11-7z" fill="none" stroke="#D4A017" stroke-width="2.4" stroke-linecap="round"/></svg>'),
 ("ga", "LGBTQIA+ affirming", r"gender[- ]affirm|gender[- ]diverse|transgender|\btrans\b|lgbt|rainbow|queer|non-binary|nonbinary",
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="2.3" fill="#E40303"/><rect x="2" y="7.3" width="20" height="2.3" fill="#FF8C00"/><rect x="2" y="9.6" width="20" height="2.3" fill="#FFED00"/><rect x="2" y="11.9" width="20" height="2.3" fill="#008026"/><rect x="2" y="14.2" width="20" height="2.3" fill="#004DFF"/><rect x="2" y="16.5" width="20" height="2.3" fill="#750787"/><path d="M2 5 L9 11.9 L2 18.8z" fill="#fff"/><path d="M2 6.6 L7.4 11.9 L2 17.2z" fill="#F5A9B8"/><path d="M2 8.2 L5.8 11.9 L2 15.6z" fill="#5BCEFA"/><path d="M2 9.8 L4.2 11.9 L2 14z" fill="#613915"/></svg>'),
 ("ti", "Trauma-informed", r"trauma[- ]informed|trauma[- ]aware|trauma[- ]sensitive",
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 8.2a4.3 4.3 0 0 1 7.5 2.6C19.5 16.4 12 21 12 21z" fill="none" stroke="#2E7D6B" stroke-width="2"/><path d="M8.5 13.5h7" stroke="#2E7D6B" stroke-width="2" stroke-linecap="round"/></svg>'),
 ("ab", "Aboriginal and Torres Strait Islander", r"aboriginal|torres strait|first nations|indigenous",
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="7" fill="#000"/><rect x="2" y="12" width="20" height="7" fill="#CC0000"/><circle cx="12" cy="12" r="3.4" fill="#FFD700"/></svg>'),
]
def badges(p):
    out = []
    for code, label, rx, svg in BADGES:
        hits = [x for x in (p.get("inclusive") or []) if re.search(rx, x, re.I) and not re.search(r"flag displayed|acknowledgement of country|article", x, re.I)]
        if hits: out.append((code, label, svg, hits))
    return out
def ortho_labels(p):
    t = (p.get("specialty", "") + " " + " ".join(p.get("interests") or [])).lower(); out = []
    if re.search(r"hand|wrist|microsurg", t): out.append("Orthopaedics: hand and wrist")
    if re.search(r"shoulder|elbow|upper limb", t): out.append("Orthopaedics: shoulder and elbow")
    if re.search(r"hip|knee|lower limb arthroplasty|joint replacement", t): out.append("Orthopaedics: hip and knee")
    if re.search(r"foot|ankle", t): out.append("Orthopaedics: foot and ankle")
    if re.search(r"spine|spinal", t): out.append("Orthopaedics: spine")
    if not out or re.search(r"trauma|general orthopaedic", t): out.append("Orthopaedics: general and trauma")
    return out
ALLIED = {"physiotherapy", "exercise-physiology", "podiatry", "occupational-therapy-adult", "occupational-therapy-paediatric", "speech-pathology-paediatric", "speech-pathology-adult", "psychology", "dietetics", "audiology", "diabetes-education", "continence", "lactation", "social-work"}
def is_public(p):
    txt = p.get("name", "") + " | " + p.get("practice", "")
    hosp = " ".join((p.get("practical") or {}).get("hospitals") or [])
    return bool(PUB.search(txt)) and not PRIV.search(txt + " " + hosp)
TITLE = re.compile(r"^(Dr|Prof|Professor|A/Prof|Assoc Prof|Associate Professor|Conjoint Associate Professor|Clinical Associate Professor)\.?\s+", re.I)
def sortkey(n):
    BIZ = re.compile(r"(Therapy|Health|Clinic|Physio|Speech|Pathology|Centre|Center|Group|Services|Medical|Hearing|Psychology|Podiatry|Rehab|Studio|Care|Diabetes|Alliance|Hub|Project|Club|Kids|Ethos|Audiology|Dietitian|Nutrition|Wellness|Practice|Specialists|Paediatrics|Dermatology|Orthopaedic|Surgery|Hospital|Unit|Service|Inq|Lactation|Haven|Minds|Wise|Oak|Rainbow|Avina|Beam|Aspire|Uplift|Tundra|Earport|Audika|Caremmunity|Sanctuary|Replenish|Peak|Prime|Sport)", re.I)
    if TITLE.match(n) or (re.match(r"^[A-Z][a-z]+(-[A-Z][a-z]+)? [A-Z][a-zA-Z'\-]+$", n) and not BIZ.search(n)):
        base = TITLE.sub("", n); base = re.sub(r"\s*\(.*?\)", "", base).strip()
        parts = base.split(); return (parts[-1] if parts else base).lower() + " " + base.lower()
    return re.sub(r"^the\s+", "", n.lower())
people = {}; removed = []; ALLIED_LABELS = set()
for f in sorted(glob.glob(os.path.join(DD, "*.json"))):
    for slug, sec in json.load(open(f)).items():
        label = NAMES.get(slug, sec.get("name", slug))
        if slug in ALLIED: ALLIED_LABELS.add(label)
        for p in sec["people"]:
            if is_public(p): removed.append(p["name"]); continue
            labs = ortho_labels(p) if slug == "orthopaedics" else [label]
            key = re.sub(r"\W+", "", TITLE.sub("", p["name"]).lower())
            if key in people:
                q = people[key]
                for label2 in labs:
                    if label2 not in q["_labels"]: q["_labels"].append(label2)
                if p.get("practice") and p["practice"] != q.get("practice") and all(p["practice"] != x[0] for x in q.setdefault("_also", [])):
                    q["_also"].append((p["practice"], p.get("suburb") or p.get("address", ""), p.get("phone", "")))
                for k in ("interests", "inclusive", "sources"):
                    for x in p.get(k) or []:
                        if x not in q.setdefault(k, []): q[k].append(x)
            else:
                p = dict(p); p["_labels"] = list(labs); people[key] = p
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
    mq = p.get("address") or ""
    if not re.search(r"\d", mq): mq = " ".join(x for x in [p.get("practice", ""), p.get("suburb", "")] if x)
    if mq: c.append('<a href="https://www.google.com/maps/search/?api=1&amp;query=' + e(urllib.parse.quote_plus(mq + " NSW")) + '" rel="noopener">Map and reviews</a>')
    if c: lines.append("<span>" + " · ".join(c) + "</span>")
    if p.get("ereferral"): lines.append(f'<span>E-referral: {e(p["ereferral"])}</span>')
    for pr2, sub2, ph2 in p.get("_also") or []:
        lines.append(f'<span>Also: {e(pr2)}' + (f', {e(sub2)}' if sub2 else '') + (f' · <a href="tel:{e(re.sub(r"[^0-9+]", "", ph2))}">{e(ph2)}</a>' if ph2 else '') + '</span>')
    extra = []
    if p.get("interests"): extra.append(f'<p class="sp-int"><b>Interests:</b> {e("; ".join(p["interests"]))}</p>')
    facts = []
    np_ = pr.get("new_patients")
    np_txt = {"yes": "Taking new patients", "limited": "Limited new patients", "no": "Not taking new patients"}.get(np_)
    if np_txt: extra.append(f'<p class="sp-np sp-np-{e(np_)}">{np_txt}' + (f' · {e(pr["np_note"])}' if pr.get("np_note") else "") + (f' <span>(as stated {e(pr.get("np_checked") or p.get("checked", ""))})</span>' if True else "") + '</p>')
    tags = []
    if pr.get("pets") == "therapy_dog": tags.append(("pet", "🐶 Therapy dog on staff"))
    elif pr.get("pets") == "pets_welcome": tags.append(("pet", "🐾 Pet friendly"))
    if pr.get("telehealth") is True: tags.append(("", "Telehealth (pants optional)"))
    bb = pr.get("bulk_billing")
    if bb == "yes": tags.append(("bb", "🦄 Bulk billing"))
    elif bb == "some": tags.append(("bb", "Some bulk billing"))
    if pr.get("weekend") is True: tags.append(("", "Weekend appointments"))
    if pr.get("after_hours") is True: tags.append(("", "After hours (night owls welcome)"))
    if pr.get("parking") == "free": tags.append(("", "Free parking (a Newcastle miracle)"))
    if pr.get("ndis") is True: tags.append(("", "NDIS"))
    if pr.get("medicare_cdm") is True: tags.append(("", "Medicare care plans"))
    if tags: extra.append('<p class="sp-tags">' + "".join(f'<span class="sp-t {("sp-t-" + c) if c else ""}">{e(t)}</span>' for c, t in tags) + "</p>")
    if pr.get("ages"): facts.append("Ages: " + pr["ages"])
    if pr.get("wait"): facts.append("Wait: " + pr["wait"])
    if pr.get("languages"): facts.append("Languages: " + ", ".join(pr["languages"]))
    if pr.get("hospitals"): facts.append("Hospitals: " + ", ".join(pr["hospitals"]))
    if facts: extra.append('<p class="sp-facts">' + e(" · ".join(facts)) + "</p>")
    bd = badges(p); used = {h for b in bd for h in b[3]}
    if bd: extra.append('<div class="sp-badges">' + "".join(f'<details class="sp-b sp-b-{c}"><summary>{svg}{e(lab)}</summary><p>' + "<br>".join(f"“{e(h)}”" for h in hits) + '</p></details>' for c, lab, svg, hits in bd) + "</div>")
    rest = [x for x in (p.get("inclusive") or []) if x not in used]
    if rest: extra.append('<p class="sp-inc">' + "".join(f"<span>{e(x)}</span>" for x in rest) + "</p>")
    srcs = " ".join(f'<a href="{e(u)}" rel="noopener">[{i+1}]</a>' for i, u in enumerate(p.get("sources") or []))
    q = " ".join([p["name"], p.get("practice", ""), p.get("suburb", ""), " ".join(p["_labels"]), " ".join(p.get("interests") or []), " ".join(p.get("inclusive") or [])]).lower()
    return (f'<li class="sp-card" data-q="{e(q)}" data-b="{" ".join(b[0] for b in badges(p))}"><h3>{e(p["name"])}</h3><p class="sp-sub">{e(p.get("specialty") if p.get("specialty") and len(p["_labels"]) == 1 else " · ".join(p["_labels"]))}</p>'
            f'<p class="sp-lines">{"".join(lines)}</p>{"".join(extra)}<p class="sp-src">Checked {e(p.get("checked", ""))} · Sources {srcs}</p></li>')
CHIPS = '<div class="sp-chips" role="group" aria-label="Show only">' + "".join(f'<button type="button" class="sp-chip sp-b-{c}" data-badge="{c}" aria-pressed="false">{svg}{e(lab)}</button>' for c, lab, rx, svg in BADGES) + '</div><p class="sp-bnote">Badges show only where a practice says so publicly. Tap a badge to see its wording. Many practices offer this care without advertising it.</p>'
def slugify(t): return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")
CATS = {}
for p in L:
    for lab in p["_labels"]: CATS.setdefault(lab, []).append(p)
src = open("deep-dives/index.html").read()
headtpl = src[:src.index("</head>")]
def sub(h, pat, val): return re.sub(pat, lambda m: m.group(1) + val, h)
def head(title, desc, url):
    h = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="https://maladywise.com{url}">', headtpl)
    h = re.sub(r"<title>[^<]*</title>", f"<title>{e(title)}</title>", h)
    for prop in ('name="description"', 'property="og:description"'): h = sub(h, r'(<meta ' + prop + r' content=")[^"]*', e(desc))
    h = sub(h, r'(<meta property="og:title" content=")[^"]*', e(title))
    return h + '</head>\n<body>\n<main class="wrap doc sp-page">\n'
foot = src[src.index("<footer"):].replace("<script>MW.page();</script>", '<script>MW.page();</script>\n<script src="/specialists/sp.js?v=4"></script>')
DISC = '<p class="callout"><b>A directory, not a recommendation.</b> Private practices only, built from public sources (practice websites, hospital profiles, Healthdirect, professional directories). Details change: confirm with the practice. Specialists need a GP referral. Inclusive-practice notes only quote what a practice says publicly. Spot an error? <a href="/contact/">Tell us</a>.</p>'
for d in glob.glob("specialists/*/"):
    if not d.rstrip("/").endswith("_data"):
        import shutil; shutil.rmtree(d)
urls = ["/specialists/"]
for lab, ppl in CATS.items():
    slug = slugify(lab); url = f"/specialists/{slug}/"; urls.append(url)
    os.makedirs("specialists/" + slug, exist_ok=True)
    title = f"{lab} in Newcastle and the Hunter | Malady Wise"
    desc = f"{lab} in Newcastle and the Hunter, NSW: private practice contacts, addresses, stated interests and inclusive-practice notes. A directory, not a recommendation."
    body = (f'<p class="meta"><a href="/specialists/">Specialists</a> · Newcastle and the Hunter</p><h1>{e(lab)}</h1>'
            f'<p class="lede">{len(ppl)} listed, A–Z. Last checked {CHECKED}.</p>'
            '<label class="sp-search"><span>Filter</span><input type="search" placeholder="Name, suburb or interest" data-sp-filter></label>' + CHIPS + '<p class="sp-count" aria-live="polite"></p>'
            f'<ul class="sp-list">{"".join(card(p) for p in ppl)}</ul>{DISC}<p class="meta"><em>Last checked {CHECKED}.</em></p>\n')
    open(f"specialists/{slug}/index.html", "w").write(head(title, desc, url) + body + foot)
labs = sorted(CATS, key=lambda x: x.lower())
def tiles(keys): return '<ul class="sp-specs">' + "".join(f'<li><a href="/specialists/{slugify(k)}/"><b>{e(k)}</b><span>{len(CATS[k])}</span></a></li>' for k in keys) + "</ul>"
allc = [{"n": p["name"], "s": " · ".join(p["_labels"]), "u": "/specialists/" + slugify(p["_labels"][0]) + "/", "q": " ".join([p["name"], p.get("practice", ""), p.get("suburb", ""), " ".join(p["_labels"]), " ".join(p.get("interests") or [])]).lower(), "sub": p.get("suburb", ""), "b": [b[0] for b in badges(p)]} for p in L]
title = "Specialists and allied health in Newcastle and the Hunter | Malady Wise"
desc = "Directory of private specialists and allied health in Newcastle and the Hunter, NSW, by specialty: practice contacts, stated interests and inclusive-practice notes from public sources."
page = (head(title, desc, "/specialists/") + '<h1>Specialists</h1><p class="lede">Private specialists and allied health in Newcastle and the Hunter.</p>'
        f'<p class="evkey"><span class="ev m">Newcastle and the Hunter</span> {len(L)} listings across {len(CATS)} specialties. Last checked {CHECKED}.</p>'
        '<label class="sp-search"><span>Search everyone</span><input type="search" placeholder="Name, specialty, suburb or interest" data-sp-search></label>' + CHIPS + '<ul class="sp-results" hidden></ul>'
        '<h2>Specialists</h2>' + tiles([k for k in labs if k not in ALLIED_LABELS]) + '<h2>Allied health</h2>' + tiles([k for k in labs if k in ALLIED_LABELS]) + DISC +
        '<script>window.SP_ALL=' + json.dumps(allc, ensure_ascii=False).replace("</", "<\\/") + ';</script>\n' + foot)
open("specialists/index.html", "w").write(page)
json.dump(urls, open(os.path.join(DD, "sp-urls.json"), "w"))
print(len(L), "listed;", len(CATS), "specialties;", len(removed), "public-only removed")
# Optional: private referral-fit scores for Adam's private doc (never written into the repo).
if os.environ.get("SP_SCORES"):
    out = []
    for p in L:
        pr = p.get("practical") or {}; sc = 0; why = []
        if pr.get("telehealth") is True: sc += 2; why.append("telehealth +2")
        bb = pr.get("bulk_billing")
        if bb == "yes": sc += 2; why.append("bulk bills +2")
        elif bb == "some": sc += 1; why.append("some bulk billing +1")
        if p.get("ereferral"): sc += 2; why.append("e-referral +2")
        if p.get("inclusive"): sc += 2; why.append("inclusive statement +2")
        if pr.get("wait"): sc += 1; why.append("wait time published +1")
        if p.get("phone") and p.get("website"): sc += 1; why.append("phone and website +1")
        out.append({"n": p["name"], "s": " · ".join(p["_labels"]), "sub": p.get("suburb", ""), "sc": sc, "why": why})
    json.dump(out, open(os.environ["SP_SCORES"], "w"), ensure_ascii=False)
