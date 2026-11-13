# Men's, sexual and reproductive health, plus scombroid. Run with _scripts/gen_sheets.py
HD = "https://www.healthdirect.gov.au/"

# ---------------- Low libido in men ----------------
fact("low-libido-men",
 "Low Libido in Men: Causes, Testosterone and What Helps",
 "Low sex drive in men explained: common causes (stress, mood, medicines, sleep, relationships), when testosterone is the answer and when it isn’t, and what actually helps.",
 "Low Libido in Men", "Hypoactive sexual desire",
 "Sex drive naturally rises and falls with stress, sleep, health and relationships. Low testosterone is a cause much less often than the ads suggest. It’s worth a chat with your GP when it bothers you or your partner.",
 h2("Common causes", [
   "<b>Stress, tiredness and poor sleep</b>, including untreated sleep apnoea",
   "<b>Depression and anxiety</b>, and the medicines for them (especially SSRIs and SNRIs)",
   "<b>Other medicines:</b> opioids, finasteride and dutasteride, spironolactone, some blood pressure and prostate cancer treatments",
   "<b>Relationship issues</b>, conflict, or erection problems that make sex feel like an exam",
   "<b>Alcohol, cannabis</b> and anabolic steroids (especially coming off them)",
   "<b>Health conditions:</b> low testosterone, diabetes, obesity, thyroid disease, high prolactin, chronic illness"]) +
 h2("Tests your GP may do", [
   "<b>Morning testosterone</b> (before 10 am, ideally fasting), repeated if low. One low result isn’t a diagnosis.",
   "LH and FSH, prolactin, iron studies, thyroid, sugar and cholesterol",
   "Screening for low mood, alcohol use and sleep apnoea"]) +
 ladder("What helps", "Start with the cause. Testosterone only helps men who truly have low testosterone.", [
   ("s", "Step 1 · Self-care", "Sleep, exercise, alcohol and stress", "Fix the basics that quietly drain desire.", "Exercise and weight loss raise testosterone and energy; less alcohol helps erections and drive", "Free", "Ongoing", "Snoring with daytime tiredness: ask about sleep apnoea.", "Libido hates being tired, drunk and stressed. So do most people."),
   ("s", "Step 2 · Talk", "Talk with your partner, or see a counsellor or sex therapist", "Desire is often about context: conflict, routine, pressure or a mismatch in drive.", "Sex therapy and couples counselling help many couples; good for desire mismatch", "Counselling varies; Medicare rebates for some psychology with a GP plan", "Several sessions", "Feeling flat most days for 2 weeks or more: that may be depression.", None),
   ("m", "Step 3 · Review medicines", "Check whether a medicine is the culprit", "Your GP may lower a dose, switch, or add something.", "Switching or adding bupropion can help antidepressant-related low libido", "Usual script costs", "Weeks", "Don’t stop antidepressants suddenly; taper with your doctor.", None),
   ("m", "Step 4 · Treat the cause", "Treat erection problems, low mood or other conditions", "E.g. PDE5 inhibitors for erections, treatment for depression, diabetes or sleep apnoea.", "Treating erection problems often restores confidence and desire", "Varies", "Varies", "", None),
   ("l", "Step 5 · Specialist", "Testosterone, only for confirmed low testosterone", "Prescribed after repeated low morning levels plus symptoms, usually with a specialist or under PBS rules.", "Improves libido in men with genuinely low levels; little benefit if levels are normal", "$25 a script on the PBS when criteria are met; otherwise private", "Long term, with monitoring", "Testosterone <b>stops sperm production</b>: not for men wanting children. Needs blood count and prostate monitoring.", "Testosterone isn’t a libido supplement. In normal-level men it’s mostly side effects with extra steps.")]) +
 skip([("“Testosterone booster” supplements", "Tribulus, fenugreek, horny goat weed and friends: no good evidence they raise testosterone or desire."),
   ("Testosterone with normal levels", "Little benefit, real risks: shrunken testes, infertility, thick blood and acne."),
   ("Online men’s health subscriptions without a proper check", "Fine for some, but skipping the history and tests can miss depression, diabetes or heart disease.")]),
 [("What causes low libido in men?", "Most often stress, tiredness, poor sleep, depression, relationship issues, alcohol and medicines such as antidepressants. Low testosterone is a less common cause."),
  ("Should I get my testosterone checked?", "Yes, if low libido persists, especially with erection problems, fatigue or loss of morning erections. It needs a morning test, repeated if low."),
  ("Will testosterone fix my libido?", "Only if your testosterone is genuinely low. In men with normal levels it adds little and can cause infertility and other side effects.")],
 [("Healthy Male", "https://www.healthymale.org.au/", "Men’s health information from Andrology Australia. Free."),
  ("Society of Australian Sexologists", "https://societyaustraliansexologists.org.au/", "Find a qualified sex therapist.")],
 [("Healthy Male: Low sex drive", "https://www.healthymale.org.au/"), ("Endocrine Society of Australia: Testosterone therapy position statement", "https://www.endocrinesociety.org.au/")],
 [("Erectile Dysfunction", "/erectile-dysfunction/"), ("Low Libido in Women", "/low-libido-women/"), ("PDE5 inhibitors", "/medicines/pde5-inhibitors/"), ("Depression", "/depression/")],
 groups=["Men’s health"], blurb="Low sex drive: usually stress, mood, sleep, medicines or relationships. Testosterone only helps when it’s truly low.",
 search="low libido men low sex drive testosterone desire")

# ---------------- Male infertility ----------------
fact("male-infertility",
 "Male Infertility: Sperm Tests, Causes and What Helps",
 "Male infertility explained: why the semen test comes first, common causes (including testosterone and steroids), the 3-month sperm cycle, lifestyle changes and treatment options.",
 "Male Infertility", "Male infertility",
 "About 1 in 6 couples have trouble conceiving, and a male factor is involved in about half. A semen test is cheap and quick, so it should happen early, not after months of tests on the woman.",
 h2("When to get checked", [
   "No pregnancy after 12 months of regular unprotected sex, or 6 months if your partner is 35 or older",
   "Sooner with a known issue: undescended testes, testicular surgery, cancer treatment, low libido or erection problems, or steroid use"]) +
 h2("Common causes", [
   "<b>Unknown</b> in many men",
   "<b>Varicocele:</b> enlarged veins around the testicle, found in about 1 in 7 men",
   "<b>Testosterone or anabolic steroids:</b> they switch off sperm production, sometimes for months to years",
   "<b>Past infections, injury, undescended testes, chemotherapy or radiotherapy</b>",
   "<b>Genetic causes:</b> Klinefelter syndrome, Y chromosome changes, cystic fibrosis gene changes (missing tubes)",
   "<b>Lifestyle:</b> smoking, heavy drinking, cannabis, obesity, and heat (saunas, laptops on laps)"]) +
 h2("Tests", [
   "<b>Semen analysis</b> after 2–7 days without ejaculating. If abnormal, it’s repeated, because results vary a lot.",
   "Hormone tests (testosterone, FSH, LH), and genetic tests if sperm counts are very low",
   "Scrotal ultrasound if a lump or varicocele is suspected"]) +
 ladder("What helps", "Sperm take about 3 months to make, so give changes 3 months before judging them.", [
   ("s", "Step 1 · Self-care", "Stop smoking, cut alcohol, reach a healthy weight, keep things cool", "Small changes that add up.", "Improves semen quality for many; quitting smoking also helps the pregnancy", "Free", "At least 3 months", "", "Your sperm are a 3-month-old snapshot. Behave now, reap in spring."),
   ("m", "Step 2 · Stop the culprit", "Stop testosterone or steroids, review other medicines", "Usually under a specialist, who may use medicines to restart production.", "Sperm return in most men, often over 6–12 months, sometimes longer", "Varies", "Months", "Low mood and low libido are common while hormones recover.", None),
   ("l", "Step 3 · Specialist", "Varicocele repair or treating a hormone cause", "For men with an abnormal semen test and a clear cause.", "Varicocele repair improves semen in many men with abnormal results; pregnancy benefit is less certain", "Medicare rebate; private gap", "Months", "", None),
   ("l", "Step 4 · Fertility clinic", "IUI, IVF or ICSI (one sperm injected into each egg), or surgical sperm retrieval", "Even very low counts can work with ICSI.", "Success depends mostly on the woman’s age", "Thousands after Medicare; public options are growing in some states", "Cycles", "", None)]) +
 skip([("Fertility supplements and antioxidants", "A large US trial (FAZST) found folic acid and zinc didn’t improve live births. Evidence for most antioxidants is weak."),
   ("Repeated home sperm tests without a lab test", "They miss shape and movement. Get a proper lab analysis.")]),
 [("How common is male infertility?", "About 1 in 6 couples have trouble conceiving, and a male factor is involved in about half."),
  ("Does testosterone make you infertile?", "Yes. Testosterone and anabolic steroids switch off sperm production. Recovery after stopping can take months to years."),
  ("How long does it take to improve sperm?", "Sperm take about 3 months to develop, so lifestyle changes take about 3 months to show.")],
 [("Healthy Male: Male infertility", "https://www.healthymale.org.au/mens-health/male-infertility", "Plain-language information. Free."),
  ("Your Fertility", "https://www.yourfertility.org.au/", "Australian Government-funded fertility information.")],
 [("WHO: Infertility prevalence estimates (2023)", "https://www.who.int/news/item/04-04-2023-1-in-6-people-globally-affected-by-infertility"), ("Schisterman EF et al. Folic acid and zinc for male infertility (FAZST, JAMA 2020)", "https://jamanetwork.com/journals/jama/fullarticle/2759383")],
 [("Female Infertility", "/female-infertility/"), ("Low Libido in Men", "/low-libido-men/"), ("Erectile Dysfunction", "/erectile-dysfunction/")],
 groups=["Men’s health"], blurb="Trouble conceiving: a male factor is involved in about half. The semen test should come early.",
 search="male infertility subfertility sperm count semen analysis varicocele")

# ---------------- Female infertility ----------------
fact("female-infertility",
 "Female Infertility: When to Get Checked, Causes and Treatment",
 "Trouble getting pregnant explained: when to see your GP, the role of age, ovulation problems like PCOS, endometriosis, the tests, letrozole, IVF and what to skip.",
 "Female Infertility", "Female infertility",
 "Trying for a baby and nothing’s happening? Most couples conceive within a year, but about 1 in 6 need help. Age matters most, so if you’re 35 or older, see your GP after 6 months, not 12.",
 h2("When to see your GP", [
   "After 12 months of trying, or 6 months if you’re 35 or older",
   "Straight away with irregular or absent periods, known endometriosis or PCOS, past pelvic infection, or a partner with a known sperm problem",
   "Planning ahead? A pre-pregnancy check (folic acid, vaccines, health conditions) is worth it anyway"]) +
 h2("Common causes", [
   "<b>Age:</b> egg number and quality fall, especially after 35 and faster after 40",
   "<b>Ovulation problems:</b> PCOS is the most common; also thyroid, high prolactin, very low weight or intense exercise",
   "<b>Endometriosis</b>",
   "<b>Blocked tubes:</b> past chlamydia or pelvic infection, or surgery",
   "<b>Uterine problems:</b> some fibroids or polyps",
   "<b>Male factor</b> in about half of couples: the semen test is part of your workup",
   "<b>Unexplained</b> in about 1 in 4 couples"]) +
 h2("Tests", [
   "Progesterone 7 days before an expected period to check ovulation, plus thyroid, prolactin and other hormones",
   "Pelvic ultrasound, and a dye test of the tubes (HyCoSy or HSG)",
   "Chlamydia test, and a semen analysis for your partner",
   "AMH estimates egg <i>number</i>, not quality or your chance of natural pregnancy"]) +
 ladder("What helps", "Treatment depends on the cause and your age.", [
   ("s", "Step 1 · Self-care", "Folic acid, a healthy weight, no smoking, less alcohol, sex every 2–3 days", "Regular sex through the cycle works as well as timing it exactly.", "Weight loss restores ovulation in many with PCOS", "Low cost", "Ongoing", "", "Tracking every hormone and temperature can turn sex into a job. Every 2–3 days covers the window."),
   ("m", "Step 2 · GP and specialist", "Letrozole to trigger ovulation, e.g. in PCOS", "A tablet for 5 days early in the cycle.", "More live births than clomiphene in women with PCOS in a large trial", "Low cost script", "Up to about 6 cycles", "Twins are a little more likely.", None),
   ("l", "Step 3 · Specialist", "Surgery for endometriosis, polyps, some fibroids or blocked tubes", "Selected cases.", "Can improve natural pregnancy chances in the right situation", "Medicare rebate; private gap", "One-off", "", None),
   ("l", "Step 4 · Fertility clinic", "IUI or IVF", "IVF is the main treatment for blocked tubes, severe male factor, older age and unexplained infertility.", "Success depends mostly on age: much higher under 35 than over 40", "Thousands per cycle after Medicare; lower-cost and public options exist in some states", "Cycles", "", None)]) +
 skip([("AMH as a “fertility test”", "It estimates egg number, not your chance of natural pregnancy. A low AMH doesn’t mean you can’t conceive naturally."),
   ("Endometrial scratching", "A large randomised trial found no increase in live births."),
   ("Most IVF add-ons", "Embryo glue, assisted hatching and immune therapies mostly lack good evidence. Ask what each adds and the proof."),
   ("Fertility cleanses and detox teas", "No evidence, and some contain laxatives or herbs that are unsafe in early pregnancy.")]),
 [("How long should we try before seeing a doctor?", "12 months if you’re under 35, 6 months if you’re 35 or older, and straight away if you have irregular periods, endometriosis, PCOS or a known sperm problem."),
  ("What is the most common cause of female infertility?", "Age is the biggest factor overall. Of treatable causes, ovulation problems (most often PCOS) are the most common."),
  ("Does a low AMH mean I can’t get pregnant?", "No. AMH estimates the number of eggs left, not their quality or your chance of natural pregnancy.")],
 [("Your Fertility", "https://www.yourfertility.org.au/", "Australian Government-funded fertility information. Free."),
  ("Jean Hailes for Women’s Health", "https://www.jeanhailes.org.au/", "Women’s health information. Free.")],
 [("Legro RS et al. Letrozole versus clomiphene for infertility in PCOS (NEJM 2014)", "https://www.nejm.org/doi/full/10.1056/NEJMoa1313517"),
  ("Lensen S et al. A randomized trial of endometrial scratching before IVF (NEJM 2019)", "https://www.nejm.org/doi/full/10.1056/NEJMoa1808737")],
 [("Male Infertility", "/male-infertility/"), ("Endometriosis", "/endometriosis/"), ("Folate and Folic Acid", "/folate/")],
 groups=["Women’s health"], blurb="Trouble getting pregnant: when to get checked, the role of age, PCOS, endometriosis, letrozole and IVF.",
 search="female infertility subfertility trying to conceive pregnant pcos ivf amh")

# ---------------- Prostate cancer ----------------
fact("prostate-cancer",
 "Prostate Cancer: PSA Testing, Symptoms, Treatment and Survival",
 "Prostate cancer explained: the PSA test (pros and cons), who should consider testing, MRI before biopsy, active surveillance, surgery, radiotherapy and survival in Australia.",
 "Prostate Cancer", "Prostate cancer",
 "Prostate cancer is the most commonly diagnosed cancer in Australian men. Many are slow-growing and never cause harm, while others need treatment. The PSA blood test helps find it early, with trade-offs worth talking through.",
 h2("Symptoms", [
   "Early prostate cancer usually causes <b>no symptoms</b>",
   "Urine symptoms (weak flow, getting up at night) are much more often from a benign enlarged prostate",
   "Blood in urine or semen, or new bone pain or weight loss, need prompt checking"]) +
 h2("The PSA test", [
   "A blood test that can find prostate cancer early. It’s raised by cancer, but also by an enlarged prostate, infection, recent ejaculation or cycling.",
   "<b>Pros:</b> finds aggressive cancers earlier, and lowers the chance of dying of prostate cancer.",
   "<b>Cons:</b> false alarms, and finding slow cancers that would never have caused harm (overdiagnosis).",
   "<b>Who:</b> talk it over with your GP from about age 50, or 40–45 with a father or brother with prostate cancer, or a BRCA2 gene change.",
   "An MRI before any biopsy now spares many men an unnecessary biopsy."]) +
 h2("Treatment", [
   "<b>Active surveillance:</b> for low-risk cancers, regular PSA, MRI and sometimes biopsy, with treatment only if it changes. Avoids side effects for many men.",
   "<b>Surgery</b> (radical prostatectomy) or <b>radiotherapy</b> for higher-risk cancer that hasn’t spread. Both can affect erections and bladder control.",
   "<b>Hormone therapy</b> (e.g. Zoladex) lowers testosterone, often with radiotherapy or for spread cancer.",
   "<b>Advanced cancer:</b> newer hormone tablets, chemotherapy and Lu-PSMA (a radioactive treatment that targets prostate cancer cells)."]) +
 h2("The numbers", [
   "Roughly 1 in 5 to 1 in 6 Australian men will be diagnosed by age 85.",
   "Five-year survival is about 96%, and most men diagnosed die of something else.",
   "In the UK ProtecT trial, after 15 years only about 3% of men with localised cancer died of it, whether they had monitoring, surgery or radiotherapy."]),
 [("Should I have a PSA test?", "It’s a personal choice worth discussing with your GP, usually from about age 50, or 40–45 with a strong family history or BRCA2 gene change. It can find aggressive cancers early but also leads to false alarms and overdiagnosis."),
  ("What are the symptoms of prostate cancer?", "Early prostate cancer usually has no symptoms. Urine symptoms are more often from a benign enlarged prostate. Blood in urine or semen, bone pain or weight loss need checking."),
  ("What is active surveillance?", "For low-risk cancer, regular PSA tests, MRI and sometimes biopsy instead of immediate treatment. Treatment starts only if the cancer changes, which spares many men side effects.")],
 [("Prostate Cancer Foundation of Australia", "https://www.pcfa.org.au/", "Information and specialist nurse support. Free."),
  ("Cancer Council 13 11 20", "https://www.cancer.org.au/", "Information and support line. Free.")],
 [("Cancer Australia: Prostate cancer statistics", "https://www.canceraustralia.gov.au/cancer-types/prostate-cancer/statistics"),
  ("Hamdy FC et al. Fifteen-year outcomes after monitoring, surgery or radiotherapy for prostate cancer (ProtecT, NEJM 2023)", "https://www.nejm.org/doi/full/10.1056/NEJMoa2214122")],
 [("Enlarged Prostate", "/enlarged-prostate/"), ("Zoladex (Goserelin)", "/medicines/goserelin/"), ("Cancer Screening", "/cancer-screening/"), ("Prostate cancer deep dive", "/deep-dives/prostate-cancer/")],
 groups=["Men’s health"], blurb="The most common cancer in Australian men. PSA testing pros and cons, MRI, active surveillance and treatment.",
 search="prostate cancer psa test gleason active surveillance prostatectomy")

# ---------------- Bladder cancer ----------------
fact("bladder-cancer",
 "Bladder Cancer: Blood in Urine, Causes and Treatment",
 "Bladder cancer explained: painless blood in the urine as the key warning sign, smoking and other causes, why women are often diagnosed later, tests and treatment.",
 "Bladder Cancer", "Bladder cancer",
 "Painless blood in the urine is bladder cancer’s calling card. It’s often something harmless, but it always needs checking, even if it happens just once. Smoking causes about half of bladder cancers.",
 '<p class="callout"><b>See your GP soon</b> if you see blood in your urine, even once and even without pain. Don’t wait to see if it comes back.</p>' +
 h2("Signs", [
   "<b>Blood in the urine</b>, often painless and on and off: pink, red or cola-coloured",
   "Needing to pass urine often or urgently, or burning, with no infection found or that doesn’t settle",
   "Later: pelvic or back pain, weight loss"]) +
 h2("Risk factors", [
   "<b>Smoking</b>, the biggest one: about half of cases",
   "Older age; men are affected about 3 times as often as women",
   "Workplace chemicals: some dyes, rubber, leather, paint and aluminium industries",
   "Past pelvic radiotherapy, cyclophosphamide, long-term catheters, and schistosomiasis (a parasite in some countries)"]) +
 h2("Why women are often diagnosed later", [
   "Blood in the urine is often put down to a urine infection or periods. If an infection is treated and blood persists, or there’s no infection, it needs further tests."]) +
 h2("Tests and treatment", [
   "<b>Tests:</b> urine tests, a CT scan of the kidneys and bladder, and a cystoscopy (a camera into the bladder).",
   "<b>Early (non-muscle-invasive) cancer:</b> removal through a cystoscope, often followed by medicine put into the bladder (BCG or chemotherapy) to prevent return. Regular checks follow.",
   "<b>Muscle-invasive cancer:</b> bladder removal or chemoradiotherapy, often with chemotherapy first.",
   "<b>Advanced cancer:</b> chemotherapy, immunotherapy and newer targeted treatments.",
   "Quitting smoking lowers the chance of the cancer coming back."]),
 [("Is blood in the urine always serious?", "No, it often has a harmless cause such as an infection. But it should always be checked, even if it happens once, because it’s the main warning sign of bladder and kidney cancer."),
  ("What causes bladder cancer?", "Smoking causes about half. Other risks include older age, being male, some workplace chemicals and past pelvic radiotherapy."),
  ("How is bladder cancer treated?", "Early cancers are removed through a cystoscope, often followed by BCG or chemotherapy into the bladder. Cancers that have grown into the muscle may need bladder removal or chemoradiotherapy.")],
 [("Cancer Council 13 11 20", "https://www.cancer.org.au/", "Information and support line. Free."),
  ("Quitline 13 7848", "https://www.quit.org.au/", "Free help to quit smoking.")],
 [("Cancer Australia: Bladder cancer", "https://www.canceraustralia.gov.au/cancer-types/bladder-cancer"), ("Cancer Council: Bladder cancer", "https://www.cancer.org.au/cancer-information/types-of-cancer/bladder-cancer")],
 [("Prostate Cancer", "/prostate-cancer/"), ("Cancer Screening", "/cancer-screening/"), ("Enlarged Prostate", "/enlarged-prostate/")],
 groups=["Men’s health", "Other"], blurb="Painless blood in the urine is the key warning sign. Smoking causes about half.",
 search="bladder cancer blood in urine haematuria cystoscopy bcg")

# ---------------- Scombroid ----------------
fact("scombroid",
 "Scombroid Fish Poisoning: The Fish “Allergy” That Isn’t",
 "Scombroid (histamine fish poisoning) explained: flushing, a peppery taste and hives within an hour of eating tuna or mackerel, why it isn’t an allergy, treatment and prevention.",
 "Scombroid Fish Poisoning", "Scombroid poisoning",
 "Flushed, itchy and pounding headache within an hour of eating tuna, mackerel or mahi-mahi? It may be scombroid: histamine from badly stored fish, not a fish allergy. It looks just like an allergic reaction, and antihistamines usually fix it.",
 h2("Symptoms", [
   "Start within minutes to an hour of eating",
   "Flushing of the face and neck, hives, itch and sweating",
   "A peppery, metallic or tingling taste in the mouth while eating",
   "Headache, palpitations, dizziness, nausea, cramps and diarrhoea",
   "Usually settles within a few hours, and almost always within a day",
   "<b>A big clue:</b> several people who ate the same fish get sick together"]) +
 h2("How it happens", [
   "Fish such as tuna, mackerel, mahi-mahi, sardines, anchovies and bonito naturally contain lots of histidine.",
   "If the fish isn’t kept cold enough after it’s caught, bacteria turn histidine into <b>histamine</b>.",
   "The fish can look and smell normal. <b>Cooking, canning or freezing doesn’t destroy histamine.</b>",
   "The name comes from the Scombridae family (tuna and mackerel)."]) +
 h2("What helps", [
   "Antihistamine tablets usually ease symptoms quickly.",
   "Severe cases with low blood pressure or wheeze need emergency care. Call 000.",
   "Report it to the restaurant and your state food authority so others aren’t affected.",
   "You don’t need to avoid fish afterwards: it isn’t an allergy, and it won’t make you allergic."]) +
 h2("Weird but true", [
   "Doctors often misdiagnose it as a seafood allergy, leading to years of avoiding fish unnecessarily.",
   "People taking isoniazid (a tuberculosis medicine) can react more strongly, because it slows histamine breakdown.",
   "Its cousin <b>ciguatera</b>, from reef fish, causes the strange sensation of cold feeling hot."]),
 [("Is scombroid an allergy?", "No. It’s histamine poisoning from fish that wasn’t kept cold enough. Anyone who eats enough histamine can react, and it doesn’t mean you’re allergic to fish."),
  ("Which fish cause scombroid?", "Mostly tuna, mackerel, mahi-mahi, sardines, anchovies and bonito, which are rich in histidine that bacteria turn into histamine."),
  ("Does cooking prevent scombroid?", "No. Histamine isn’t destroyed by cooking, canning or freezing. Prevention depends on keeping fish cold from catch to plate.")],
 [("NSW Food Authority", "https://www.foodauthority.nsw.gov.au/", "Report suspected food poisoning in NSW.")],
 [("Feng C et al. Histamine (scombroid) fish poisoning: a comprehensive review (Clin Rev Allergy Immunol 2016)", "https://pubmed.ncbi.nlm.nih.gov/25876709/")],
 [("Hives", "/hives/"), ("Gastro", "/gastro/"), ("Travel Vaccines", "/travel-vaccines/")],
 groups=["Gut", "Other"], blurb="Histamine poisoning from badly stored tuna or mackerel. Looks like a fish allergy, but isn’t.",
 search="scombroid fish poisoning histamine tuna mackerel flushing allergy")
