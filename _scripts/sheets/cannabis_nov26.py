# Medicinal cannabis (22 Nov 2026). Run: python3 _scripts/gen_sheets.py _scripts/sheets/cannabis_nov26.py
V, C, U, R, VR = ("v", "Very common", "more than 1 in 10"), ("c", "Common", "1 in 10 to 1 in 100"), ("u", "Uncommon", "1 in 100 to 1 in 1,000"), ("r", "Rare", "1 in 1,000 to 1 in 10,000"), ("vr", "Very rare", "fewer than 1 in 10,000")
def g(t, items): return (t[0], t[1], t[2], items)
TGA_PATH = ("TGA: Access pathways for medicinal cannabis", "https://www.tga.gov.au/products/unapproved-therapeutic-goods/medicinal-cannabis/access-pathways")
TGA_HUB = ("TGA: Medicinal cannabis hub", "https://www.tga.gov.au/resources/explore-topic/medicinal-cannabis-hub")
AHPRA = ("Ahpra and the Medical Board: Medicinal cannabis prescribing", "https://www.ahpra.gov.au/Resources/Medicinal-cannabis-prescibing".replace("prescibing", "prescribing"))
NSW = ("NSW Cannabis Medicines Advisory Service: products", "https://www.medicinalcannabis.nsw.gov.au/patients/product")
PBS_CBD = ("PBS: Cannabidiol (Epidyolex) listing", "https://www.pbs.gov.au/medicinestatus/document/898.html")
VIC_DRIVE = ("Victorian Department of Transport: Medicinal cannabis and driving", "https://transport.vic.gov.au/road-rules-and-safety/alcohol-drugs-and-driving/medicinal-cannabis-and-driving")
NEWSGP = ("RACGP newsGP: New guidance on driving and medicinal cannabis (2025)", "https://www1.racgp.org.au/newsgp/clinical/new-guidance-on-driving-and-medicinal-cannabis")

med("medicinal-cannabis", "Medicinal Cannabis in Australia: CBD, THC, Evidence, Costs and Driving",
 "Medicinal cannabis in Australia explained: CBD and THC, what the evidence shows for pain, epilepsy, sleep and anxiety, side effects, costs, the law on driving, and how to talk to your GP.",
 "Medicinal cannabis", "Medicinal cannabis",
 [("m", "Prescription only"), ("l", "Mostly unapproved products")],
 "Prescription cannabis products containing CBD, THC or both. Strong evidence for a few rare epilepsies; modest or uncertain benefit for most other uses, and real side effects, especially from THC.",
 "In Australia, medicinal cannabis is legal on prescription. Only two products have been fully assessed and approved by the TGA; more than 99% of what’s prescribed is ‘unapproved’, meaning its quality, safety and benefit haven’t been checked by the regulator. The best evidence is for some severe childhood epilepsies. For chronic pain, chemotherapy nausea and MS muscle stiffness, benefit is small to moderate. For anxiety and sleep, good trials are lacking. You can’t legally drive with any THC in your system in most of Australia.",
 [("Contains", "CBD (cannabidiol), THC (the part that makes you ‘high’), or both"),
  ("Works", "Good for some rare epilepsies; small benefit for chronic pain; uncertain for anxiety and sleep"),
  ("Cost", "Usually not subsidised: often a few hundred dollars a month (varies by product and dose)"),
  ("Access", "Prescription from a doctor or nurse practitioner; usually not a first-choice treatment"),
  ("Driving", "Illegal with any THC in your system in most states, even with a prescription"),
  ("Watch for", "Drowsiness, dizziness, anxiety or paranoia (THC), interactions with other medicines")],
 "Not a miracle, not a menace. A medicine with a few clear uses and a lot of hype.",
 ["Approved (ARTG registered): Epidyolex (CBD oral solution) and Sativex (nabiximols mouth spray)",
  "Unapproved: hundreds of oils, capsules, flower (dried cannabis for vaporising) and others, prescribed through TGA access pathways"],
 "Cannabis contains many cannabinoids. THC acts on the body’s CB1 receptors in the brain and nerves, which affects pain, mood, appetite and nausea, and causes the ‘high’. CBD acts in several other ways; it isn’t intoxicating and reduces seizures in some epilepsies. Products differ hugely in how much THC and CBD they contain.",
 ["Severe childhood epilepsies (Dravet and Lennox–Gastaut syndromes): CBD reduces seizures. Epidyolex is PBS-listed for these, with conditions",
  "Muscle stiffness (spasticity) in multiple sclerosis: Sativex helps some people a little",
  "Nausea and vomiting from chemotherapy, when standard anti-sickness medicines haven’t worked",
  "Chronic pain: on average a small benefit, and only for some people; not a first choice",
  "Palliative care: appetite, nausea, pain and sleep",
  "Anxiety, insomnia, PTSD: popular, but good-quality trials are lacking"],
 "Side effects are common, especially with THC, and are more likely at higher doses and in older people.",
 [g(V, ["Drowsiness, tiredness", "Dizziness", "Dry mouth"]),
  g(C, ["Nausea, diarrhoea (CBD), changes in appetite", "Poor concentration and memory", "Anxiety, low mood, feeling ‘high’ (THC)", "Raised liver enzymes (CBD, especially with valproate)"]),
  g(U, ["<b>Paranoia, hallucinations or psychosis</b> (THC)", "Fast heart rate, low blood pressure on standing", "Falls in older people"]),
  g(R, ["<b>Cannabis hyperemesis syndrome</b>: severe repeated vomiting with long-term THC use", "<b>Dependence and withdrawal</b> with regular THC use"])],
 ["Chest pain, fainting or a racing heart", "Hearing or seeing things, or feeling unusually suspicious or unsafe", "Repeated severe vomiting, especially if hot showers ease it", "Thoughts of harming yourself", "Yellow skin or eyes (liver problems)"],
 ["Medicinal cannabis should never be a first-choice treatment. The Medical Board expects it only when there’s an evidence-supported reason and other treatments haven’t worked, with a plan to stop if it doesn’t help.",
  "Expect a proper assessment, not a brief online chat. Medical history, mental health and other medicines all matter.",
  "Avoid THC if you’re pregnant or breastfeeding, have had psychosis or bipolar disorder, have heart disease, or are under 25 (the developing brain is more sensitive).",
  "Interactions: CBD and THC can change levels of other medicines, including clobazam, valproate, warfarin, some antidepressants and opioids. Tell your pharmacist.",
  "Driving: it’s an offence in most states to drive with any THC detected, even with a prescription and even if you feel fine. CBD-only products are generally OK if you don’t feel impaired. See <a href=\"/medicinal-cannabis-and-driving/\">Medicinal cannabis and driving</a>.",
  "Travelling overseas with cannabis medicines can be illegal in your destination. Check before you go.",
  "The TGA reviewed the unapproved access pathways in 2025 because of very high prescribing volumes and safety concerns, so rules may change."],
 [("Is medicinal cannabis legal in Australia?", "Yes, on prescription from a doctor or nurse practitioner. Buying or growing cannabis without a prescription is still illegal in most of Australia (the ACT allows a small amount of personal cultivation)."),
  ("What’s the difference between CBD and THC?", "THC causes the ‘high’ and most side effects such as drowsiness and anxiety. CBD doesn’t make you high; it has good evidence only for some rare epilepsies. Many products contain both."),
  ("Does medicinal cannabis work for chronic pain?", "For most people, the benefit is small: a modest drop in pain for a minority, with common side effects. It isn’t recommended as a first-choice pain treatment."),
  ("Is medicinal cannabis on the PBS?", "Only Epidyolex (CBD) for some severe childhood epilepsies, with conditions. Almost all other products aren’t subsidised and can cost hundreds of dollars a month."),
  ("Can I drive on medicinal cannabis?", "Not with THC in most of Australia: any detectable THC is an offence, even with a prescription. In Victoria and Tasmania a court can take your prescription into account, but you can still be charged. CBD-only products are generally fine if you don’t feel impaired."),
  ("Can you get addicted to medicinal cannabis?", "Yes, to THC: about 1 in 10 regular users develop dependence, with withdrawal (irritability, poor sleep, cravings) on stopping. CBD alone isn’t addictive.")],
 [TGA_HUB, TGA_PATH, AHPRA, NSW, PBS_CBD, NEWSGP,
  ("TGA consultation: Reviewing the safety and regulatory oversight of unapproved medicinal cannabis (Aug 2025)", "https://consultations.tga.gov.au/medicines-regulation-division/test-soms/user_uploads/final---consultation-paper---medicinal-cannabis-review---august-2025.pdf"),
  ("Medical Republic: Cannabis pathways ‘no longer appropriate’ (Aug 2025)", "https://www.medicalrepublic.com.au/cannabis-pathways-no-longer-appropriate-tga/119109")],
 [("Cannabis (recreational)", "/cannabis/"), ("Medicinal cannabis and driving", "/medicinal-cannabis-and-driving/"), ("Chronic pain", "/chronic-pain/")],
 index_label="Cannabinoid")

fact("medicinal-cannabis-and-driving", "Medicinal Cannabis and Driving in Australia: What the Law Says",
 "Can you drive on medicinal cannabis in Australia? THC and roadside drug tests, the Victoria and Tasmania rules, CBD-only products, work and safety-critical jobs.",
 "Medicinal cannabis and driving", "Medicinal cannabis and driving",
 "In most of Australia it’s an offence to drive with any detectable THC, even if it’s prescribed and you don’t feel affected. CBD-only products are generally fine to drive on if you don’t feel impaired.",
 "<h2>The short version</h2>\n<ul><li><b>THC-containing products:</b> don’t drive. Roadside tests detect THC, not impairment, and a prescription isn’t a defence in most states.</li>"
 "<li><b>CBD-only products:</b> generally fine to drive, as long as you don’t feel drowsy or impaired. Check the label: some ‘CBD’ products contain a little THC.</li>"
 "<li><b>Victoria (from 1 March 2025) and Tasmania:</b> a magistrate can consider your prescription and whether you were impaired when deciding whether to cancel your licence. You can still be charged.</li>"
 "<li><b>Police can order you off the road:</b> after a positive roadside test, drivers are usually told not to drive for a period (often 12 hours or more).</li></ul>\n"
 "<h2>How long does THC stay detectable?</h2>\n<p>It varies a lot. Saliva tests usually pick up THC for hours after use, sometimes longer in regular users. There’s no safe waiting time that guarantees a negative test, so many doctors advise not driving at all while using THC products.</p>\n"
 "<h2>Work and special licences</h2>\n<ul><li>THC products are generally not suitable for commercial, heavy vehicle, bus, taxi, dangerous goods or emergency vehicle drivers, or other safety-critical work.</li>"
 "<li>Workplace drug testing may detect THC. Talk to your employer and doctor before starting.</li>"
 "<li>Your doctor should discuss driving before prescribing, and may suggest a CBD-only product if you need to drive.</li></ul>\n"
 "<h2>If you feel affected</h2>\n<p>Even legal medicines can make driving dangerous. Don’t drive if you feel drowsy, dizzy, slow or ‘high’, especially when starting or changing a dose, or with alcohol or other sedating medicines.</p>\n",
 [("Can I drive if I have a prescription for medicinal cannabis?", "Not if it contains THC, in most of Australia. Driving with any detectable THC is an offence, and a prescription isn’t a defence. Victoria and Tasmania let a court consider your prescription, but you can still be charged."),
  ("Can I drive on CBD oil?", "Generally yes, if it’s a CBD-only product and you don’t feel impaired. Check it doesn’t contain THC."),
  ("Do roadside drug tests detect medicinal cannabis?", "They detect THC, whether it came from a prescription or not. They don’t measure impairment.")],
 [("Victorian Department of Transport: medicinal cannabis and driving", VIC_DRIVE[1], "Victorian rules from March 2025"),
  ("TGA: Medicinal cannabis hub", TGA_HUB[1], "Approved products and access pathways")],
 [NEWSGP, VIC_DRIVE, TGA_HUB],
 [("Medicinal cannabis", "/medicines/medicinal-cannabis/"), ("Cannabis (recreational)", "/cannabis/")],
 groups=["Other"], blurb="Driving with THC in your system is an offence in most of Australia, even with a prescription.", search="medicinal cannabis driving THC roadside drug test CBD")
