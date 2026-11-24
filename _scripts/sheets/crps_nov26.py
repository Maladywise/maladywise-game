# Complex regional pain syndrome (24 Nov 2026). Run: python3 _scripts/gen_sheets.py _scripts/sheets/crps_nov26.py
RCP = ("Royal College of Physicians (UK): Complex regional pain syndrome in adults, 2nd edition (2018)", "https://www.rcp.ac.uk/resources/complex-regional-pain-syndrome-in-adults-2nd-edition/")
BHC = ("Better Health Channel: Complex regional pain syndrome (CRPS)", "https://www.betterhealth.vic.gov.au/health/conditionsandtreatments/complex-regional-pain-syndrome-crps")
HWA = ("HealthyWA: Complex regional pain syndrome", "https://healthywa.wa.gov.au/Articles/A_E/Complex-regional-pain-syndrome")
NHS = ("NHS: Complex regional pain syndrome", "https://www.nhs.uk/conditions/complex-regional-pain-syndrome/")
IASP_VITC = ("IASP: Preventing CRPS after wrist fracture", "https://www.iasp-pain.org/publications/relief-news/article/preventing-crps-after-wrist-fracture/")

fact("crps", "Complex Regional Pain Syndrome (CRPS): Symptoms, Diagnosis and Treatment",
 "Complex regional pain syndrome (CRPS) explained: burning pain out of proportion after an injury, colour, temperature and swelling changes, the Budapest criteria, and the treatments with the best evidence.",
 "Complex regional pain syndrome (CRPS)", "Complex regional pain syndrome",
 "CRPS is severe, ongoing pain in an arm or leg, usually after an injury such as a fracture, sprain or surgery, that is far worse and lasts far longer than the injury itself. It’s a real disorder of the nerves, immune system and brain’s pain processing, not ‘in your head’.",
 "<h2>Symptoms</h2>\n<ul><li><b>Pain out of proportion:</b> burning, throbbing or stabbing, often spreading beyond the injured area</li>"
 "<li><b>Extreme sensitivity:</b> light touch, clothing, a breeze or cold water can hurt (allodynia)</li>"
 "<li><b>Colour and temperature changes:</b> red, purple, blotchy or pale; warmer or colder than the other side</li>"
 "<li><b>Swelling and sweating changes</b> in the affected limb</li>"
 "<li><b>Stiffness, weakness, tremor or jerks</b>; the limb can feel foreign or ‘not mine’</li>"
 "<li><b>Hair, nail and skin changes</b>: faster or slower hair and nail growth, shiny thin skin</li></ul>\n"
 "<h2>Types and who gets it</h2>\n<ul><li><b>Type 1</b> (about 9 in 10): no confirmed nerve injury. <b>Type 2:</b> after a known nerve injury.</li>"
 "<li>Most often follows a wrist fracture, ankle injury or limb surgery, but can follow a minor sprain or occasionally no clear injury.</li>"
 "<li>More common in women, around 3 times as often as men, and most often in middle age. Children can get it too, usually with a better outlook.</li></ul>\n"
 "<h2>How it’s diagnosed</h2>\n<p>There’s no single test. Doctors use the <b>Budapest criteria</b>:</p>\n<ul><li>Ongoing pain out of proportion to the injury</li>"
 "<li>Symptoms in at least 3 of 4 groups, and signs on examination in at least 2: sensory (sensitivity), vasomotor (colour or temperature), swelling or sweating, and movement or skin, hair and nail changes</li>"
 "<li>No other condition explains it better (e.g. infection, a clot, arthritis or a nerve compression)</li></ul>\n"
 "<p>Tests such as X-rays, bone scans or blood tests are mainly used to rule out other causes. The earlier it’s recognised, the better.</p>\n"
 "<h2>Treatment: what works best</h2>\n<ul><li><b>Keep the limb moving.</b> Physiotherapy and occupational therapy are the foundation: gentle, regular use, building up gradually. Prolonged rest and immobilisation make it worse.</li>"
 "<li><b>Retraining the brain:</b> graded motor imagery and mirror therapy (watching the healthy limb move in a mirror) and desensitisation (gradually touching the skin with different textures).</li>"
 "<li><b>Pain education:</b> understanding why it hurts reduces fear and helps people move.</li>"
 "<li><b>Medicines:</b> evidence is limited. Doctors may try anti-inflammatories, nerve pain medicines (e.g. amitriptyline or gabapentinoids), a short course of steroids early on, or bisphosphonates in early CRPS. Strong opioids are best avoided long term.</li>"
 "<li><b>Psychological support:</b> CBT or ACT help with living with pain, sleep and mood, which all affect pain.</li>"
 "<li><b>Specialist pain services</b> for CRPS that isn’t improving, where options include nerve blocks and, for some people, spinal cord stimulation.</li></ul>\n"
 "<h2>Outlook</h2>\n<p>Many people improve a lot, especially when it’s treated early, and many improve within the first year. Some have symptoms that last for years. Flare-ups can follow new injuries or surgery on the same limb, so tell your surgeon if you’ve had CRPS.</p>\n"
 "<h2>Prevention</h2>\n<ul><li>Early movement after fractures and surgery, within what’s safe.</li>"
 "<li>Report pain that’s getting worse instead of better, a tight cast, or colour and swelling changes promptly.</li>"
 "<li>Vitamin C after a wrist fracture: some trials suggested it lowers the risk and others found no benefit, so guidelines disagree. Ask your doctor.</li></ul>\n"
 "<h2>See a doctor if</h2>\n<ul><li>Pain after an injury or operation is getting worse rather than better, or is far more than expected</li>"
 "<li>The limb becomes very sensitive to touch, changes colour or temperature, or swells</li>"
 "<li>A plaster cast feels tight, or fingers or toes go numb, pale or blue: get this checked the same day</li></ul>\n",
 [("What is complex regional pain syndrome?", "CRPS is severe, ongoing pain in a limb, usually after an injury or surgery, that is far worse than expected, with changes in sensitivity, skin colour, temperature, swelling, sweating and movement."),
  ("What causes CRPS?", "The exact cause isn’t fully known. It involves inflammation, changes in the nerves and blood vessels, and changes in how the brain and spinal cord process pain, usually after a fracture, sprain or surgery."),
  ("How is CRPS diagnosed?", "Clinically, using the Budapest criteria: pain out of proportion plus symptoms and signs across several groups (sensory, colour/temperature, swelling/sweating, movement/skin changes), after other causes are ruled out."),
  ("Does CRPS go away?", "Often it improves a lot, especially with early treatment, and many people improve within a year. Some have long-lasting symptoms that need ongoing pain management."),
  ("What is the best treatment for CRPS?", "Keeping the limb moving with physiotherapy and occupational therapy, graded motor imagery or mirror therapy, desensitisation and pain education. Medicines play a smaller supporting role.")],
 [("Better Health Channel: CRPS", BHC[1], "Victorian Government patient information"),
  ("RCP UK CRPS guidelines", RCP[1], "Diagnosis, referral and management (includes a patient section)")],
 [RCP, BHC, HWA, NHS, IASP_VITC],
 [("Chronic pain", "/chronic-pain/"), ("Fibromyalgia", "/fibromyalgia/"), ("Exercise handouts", "/exercises/")],
 groups=["Brain and nerves"], blurb="Burning pain far worse than the injury, with colour, temperature and swelling changes: early movement is key.", search="CRPS complex regional pain syndrome RSD reflex sympathetic dystrophy causalgia Budapest criteria allodynia")
