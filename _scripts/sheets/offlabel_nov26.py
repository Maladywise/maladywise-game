# Off-label and surprising uses of medicines (25 Nov 2026). Run: python3 _scripts/gen_sheets.py _scripts/sheets/offlabel_nov26.py
AJGP = ("Off-label medicine use. Aust J Gen Pract 2021", "https://www1.racgp.org.au/ajgp/2021/may/off-label-medicine-use")
MDA = ("MDA National: Off-label prescribing, what you need to know", "https://www.mdanational.com.au/advice-and-support/library/articles-and-case-studies/2019/11/off-label-prescribing-what-you-need-to-know")
DIAM = ("UK product information: diamorphine 10 mg injection (emc)", "https://www.medicines.org.uk/emc/product/1466")
SILD = ("Ghofrani HA et al. Sildenafil: from angina to erectile dysfunction to pulmonary hypertension and beyond. Nat Rev Drug Discov 2006", "https://www.nature.com/articles/nrd2030")
MINOX = ("Randolph M, Tosti A. Low-dose oral minoxidil for non-scarring alopecia: systematic review. Int J Dermatol 2021", "https://doi.org/10.1111/ijd.14933")
SAFA = ("Santer M et al. Spironolactone for adult female acne (SAFA): RCT. BMJ 2023", "https://doi.org/10.1136/bmj-2022-074349")
PRAZ = ("Raskind MA et al. Prazosin for PTSD in military veterans: RCT. N Engl J Med 2018", "https://doi.org/10.1056/NEJMoa1507598")
TXA = ("Optimal dose of oral tranexamic acid in melasma: network meta-analysis. Indian J Dermatol Venereol Leprol 2023", "https://doi.org/10.25259/IJDVL_530_2021")
MENO = ("Nelson HD. Menopause (non-hormonal treatments incl. gabapentin, clonidine). Lancet 2008", "https://doi.org/10.1016/S0140-6736(08)60346-3")
STAGE = ("Brantigan CO et al. Beta blockade and stage fright in musicians. Am J Med 1982", "https://pubmed.ncbi.nlm.nih.gov/6129674/")
LDN = ("Bruun KD et al. Low-dose naltrexone vs placebo in fibromyalgia: RCT. Lancet Rheumatol 2024", "https://pubmed.ncbi.nlm.nih.gov/38258677/")
ATL = ("Ford AC et al. Low-dose amitriptyline for IBS in primary care (ATLANTIS). Lancet 2023", "https://doi.org/10.1016/S0140-6736(23)01523-4")

fact("off-label-medicines", "Off-Label Medicines: Surprising Second Uses, and What the Evidence Says",
 "Off-label prescribing explained: why doctors use medicines outside their approved uses, surprising second lives (heroin for pain, blood pressure pills for hair), and which ones failed proper trials.",
 "Off-label medicines: surprising second lives", "Off-label medicine use",
 "‘Off-label’ means using a medicine for a condition, dose, age group or route that isn’t in its official approved information. It’s legal, common and often sensible, but the evidence ranges from rock-solid to wishful thinking.",
 "<h2>What off-label means</h2>\n<ul><li>In Australia, each medicine’s approved uses are set by the TGA. A doctor may prescribe outside them when there’s a good reason.</li>"
 "<li>It’s very common in children, pregnancy, palliative care and mental health, because many medicines were never formally tested in those groups. For antipsychotics, an estimated 40–75% of adult use is off-label.</li>"
 "<li>Your doctor should tell you it’s off-label, explain the likely benefits and risks, and write down the reason.</li>"
 "<li>Off-label medicines may not be PBS-subsidised for that use, so they can cost more.</li>"
 "<li>Drug companies aren’t allowed to advertise off-label uses.</li></ul>\n"
 "<h2>Surprising second lives</h2>\n<ul>"
 "<li><b>Heroin, as a hospital painkiller:</b> in the UK, diamorphine (medical heroin) is a licensed medicine for severe pain after surgery, heart attacks and at the end of life. In Australia, heroin is a prohibited substance.</li>"
 "<li><b>An angina pill that became sildenafil:</b> developed for chest pain in the 1990s, its unexpected side effect changed its career. It’s now also used for a lung blood-pressure condition (pulmonary arterial hypertension).</li>"
 "<li><b>A blood pressure tablet for hair:</b> minoxidil was a strong blood pressure medicine that grew hair as a side effect. Low doses by mouth are now used off-label for hair loss, with improvement in most people in published studies. Watch for unwanted hair growth elsewhere, dizziness and ankle swelling.</li>"
 "<li><b>A ‘water tablet’ for acne:</b> spironolactone, a diuretic, calms hormonal acne in women. A 2023 UK trial (SAFA) found better acne quality of life at 12 weeks than placebo.</li>"
 "<li><b>A heart tablet for stage fright:</b> propranolol blunts the shaking, racing heart and dry mouth of performance nerves. Musicians have used it for decades. Not for people with asthma.</li>"
 "<li><b>A bleeding drug for dark skin patches:</b> tranexamic acid tablets, used for heavy periods, lighten melasma over about 12 weeks. Not for people with a history of blood clots.</li>"
 "<li><b>An antidepressant for the gut:</b> low-dose amitriptyline improved IBS symptoms in a large UK primary care trial (ATLANTIS, 2023).</li>"
 "<li><b>Nerve and blood pressure medicines for hot flushes:</b> gabapentin and clonidine reduce menopausal hot flushes when hormone therapy isn’t suitable.</li>"
 "<li><b>Thalidomide’s comeback:</b> infamous for birth defects in the 1960s, it is now approved for myeloma (a blood cancer) and a leprosy complication, under strict pregnancy-prevention programs.</li></ul>\n"
 "<h2>Popular off-label uses that failed proper trials</h2>\n<ul>"
 "<li><b>Prazosin for PTSD nightmares:</b> widely used after small positive trials, but a large 2018 trial in 304 veterans found no benefit over placebo.</li>"
 "<li><b>Low-dose naltrexone for fibromyalgia:</b> small early trials looked promising; the largest placebo-controlled trial (2024) found no difference in pain.</li>"
 "<li>The lesson: small, open studies often look better than the truth. Bigger, placebo-controlled trials settle it.</li></ul>\n"
 "<h2>Questions to ask your doctor</h2>\n<ul><li>Is this use approved, or off-label?</li><li>What’s the evidence: big trials, small studies, or experience?</li>"
 "<li>What are the risks, and how will we know if it’s working?</li><li>How long should I try it before we stop?</li><li>Will it cost more without a PBS subsidy?</li></ul>\n"
 "<h2>Stay safe</h2>\n<ul><li>Don’t take someone else’s prescription, or buy prescription medicines online without a script.</li>"
 "<li>Tell every doctor and pharmacist about everything you take, including supplements.</li></ul>\n",
 [("What does off-label mean?", "Using a medicine for a condition, dose, age group or route that isn’t listed in its approved product information. It’s legal when there’s a good clinical reason."),
  ("Is off-label prescribing legal in Australia?", "Yes. Doctors can prescribe off-label with a sound reason, after explaining it and getting your consent. Companies can’t advertise off-label uses."),
  ("Is off-label use safe?", "It depends on the medicine and the evidence. Some off-label uses are standard care backed by big trials; others rest on small studies. Ask what the evidence is."),
  ("Why might an off-label medicine cost more?", "The PBS subsidises medicines for specific approved uses. Off-label use often isn’t covered, so you may pay the full private price.")],
 [("AJGP: Off-label medicine use", AJGP[1], "Australian review for GPs: how common it is and how to do it safely"),
  ("MDA National: off-label prescribing", MDA[1], "Consent and documentation, from a medical defence organisation")],
 [AJGP, MDA, DIAM, SILD, MINOX, SAFA, STAGE, TXA, ATL, MENO, PRAZ, LDN],
 [("Medicines", "/medicines/"), ("Off-label quiz", "/off-label-medicines-quiz/"), ("IBS", "/ibs/"), ("Fibromyalgia", "/fibromyalgia/")],
 groups=["Other"], blurb="Heroin for pain, a blood pressure pill for hair: what off-label means and what the evidence shows.",
 search="off-label medicines prescribing heroin diamorphine minoxidil hair loss spironolactone acne propranolol stage fright tranexamic acid melasma prazosin nightmares low-dose naltrexone thalidomide sildenafil")
