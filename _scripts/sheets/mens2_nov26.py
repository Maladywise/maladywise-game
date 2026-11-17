# Low sperm count and low testosterone (Nov 2026, owner's request). Run with _scripts/gen_sheets.py
G = ["Men’s health"]
WHO = ("WHO laboratory manual for the examination and processing of human semen, 6th edition (2021)", "https://www.who.int/publications/i/item/9789240030787")
ESA = ("Yeap BB et al. Endocrine Society of Australia position statement on male hypogonadism (part 1). Med J Aust 2016", "https://www.mja.com.au/journal/2016/205/4/endocrine-society-australia-position-statement-male-hypogonadism-part-1")

fact("low-sperm-count",
 "Low Sperm Count: What Your Semen Test Means and What Helps",
 "Low sperm count (oligospermia): what a semen analysis measures, normal reference values, common causes including testosterone and steroids, what helps, and when IVF or ICSI is needed.",
 "Low Sperm Count", "low sperm count",
 "A semen test with fewer sperm than expected. It’s common, often improves, and a low count doesn’t mean you can’t have children. The single biggest fixable cause many men don’t know about: testosterone or steroids switch sperm production off.",
 h2("What a semen test measures", [
   "<b>Count:</b> the World Health Organization’s 2021 lower reference limit is <b>16 million sperm per mL</b>, or 39 million in the whole sample.",
   "<b>Movement (motility):</b> at least 30% swimming forwards.",
   "<b>Shape (morphology):</b> at least 4% normal-looking sperm. Most sperm look ‘abnormal’, even in fertile men.",
   "<b>Volume:</b> at least 1.4 mL.",
   "These are lower limits of normal, not pass/fail lines. Men below them can still father children, and men above them can still have trouble.",
   "<b>Oligospermia</b> means a low count. <b>Azoospermia</b> means no sperm in the sample, which always needs specialist assessment."]) +
 h2("One test isn’t the answer", [
   "Results vary a lot from week to week. A fever, illness or heavy drinking in the past 3 months can drop the numbers.",
   "An abnormal result is <b>repeated</b>, usually after a few weeks, with 2 to 7 days without ejaculating beforehand."]) +
 h2("Common causes", [
   "<b>Testosterone or anabolic steroids</b>, including gym supplements that contain them. They tell the brain to stop making the hormones that drive sperm production.",
   "<b>Varicocele:</b> enlarged veins around a testicle.",
   "Smoking, heavy alcohol, cannabis, obesity, and heat (saunas, hot tubs, laptops on laps).",
   "Some medicines, past infections like mumps, undescended testes, injury, chemotherapy or radiotherapy.",
   "Genetic causes, such as Klinefelter syndrome or Y chromosome changes, mainly with very low or zero counts.",
   "Often no cause is found."]) +
 h2("What helps", [
   "Sperm take about <b>3 months</b> to make, so give changes 3 months before re-testing.",
   "Stop smoking, cut alcohol, avoid cannabis, aim for a healthy weight, and keep the testicles cool.",
   "<b>Stop testosterone or steroids</b> under medical care. Most men’s sperm return, often within 6 to 12 months, though it can take longer.",
   "Treat a cause if one is found, such as a hormone problem or, in some men, a varicocele.",
   "Many antioxidant supplements are marketed for sperm, but good evidence that they lead to more babies is lacking.",
   "Even very low counts can lead to pregnancy with <b>IVF and ICSI</b>, where a single sperm is injected into each egg. Sometimes sperm can be retrieved surgically when none are in the semen."]) +
 h2("See a doctor if", [
   "You and your partner haven’t conceived after 12 months of trying, or 6 months if she is 35 or older. Test the man early: it’s a cheap, simple test.",
   "Your semen test showed no sperm, or a very low count.",
   "You notice a lump or swelling in a testicle, small or soft testicles, low sex drive or erection problems."]),
 [("What is a normal sperm count?", "The World Health Organization’s lower reference limit is 16 million sperm per mL, or 39 million per sample. Below this doesn’t mean you can’t have children, and results vary a lot between tests."),
  ("Can a low sperm count be improved?", "Often, yes. Stopping smoking, cutting alcohol, losing weight, keeping cool and stopping testosterone or steroids can all help. Sperm take about 3 months to make, so re-test after 3 months."),
  ("Does testosterone increase sperm count?", "No. Testosterone or anabolic steroids usually lower sperm count, sometimes to zero, because they switch off the brain’s signals to the testicles. Most men recover after stopping, but it can take months."),
  ("Can I still have a baby with a low sperm count?", "Many men do, naturally or with help. With IVF and ICSI, even very low counts can lead to pregnancy.")],
 [("Healthy Male: Male infertility", "https://healthymale.org.au/mens-health/male-infertility", "Australian men’s health information. Free."),
  ("Your Fertility (Australian Government)", "https://www.yourfertility.org.au/", "Evidence-based fertility information. Free.")],
 [WHO,
  ("Manchester University NHS Foundation Trust: WHO 2021 lower reference limits for semen", "https://mft.nhs.uk/app/uploads/sites/4/2023/01/Lower-reference-limits-2021.pdf"),
  ESA,
  ("Better Health Channel: Androgen deficiency in men", "https://betterhealth.vic.gov.au/health/conditionsandtreatments/androgen-deficiency-in-men")],
 [("Male infertility", "/male-infertility/"), ("Low testosterone", "/low-testosterone/"), ("Female infertility", "/female-infertility/")],
 groups=G, blurb="What a semen test means, the reference values, causes and what helps.",
 search="low sperm count oligospermia azoospermia semen analysis sperm test results normal sperm count motility morphology WHO 2021 male fertility improve sperm steroids testosterone ICSI")

fact("low-testosterone",
 "Low Testosterone in Men: Real Deficiency vs Normal Ageing",
 "Low testosterone (androgen deficiency, hypogonadism) in men: symptoms, how it’s properly tested, causes like Klinefelter syndrome, when testosterone treatment helps, and why it harms fertility.",
 "Low Testosterone", "low testosterone",
 "Tired, low libido, losing muscle? It might be testosterone, but often it isn’t. True testosterone deficiency is a medical condition that treatment helps a lot. A low number on one test, especially with ageing, weight gain or illness, is a different thing, and testosterone can do more harm than good.",
 h2("Real deficiency (hypogonadism)", [
   "The testicles, or the brain glands that control them (hypothalamus and pituitary), aren’t working properly. It affects somewhere between 1 in 200 and 1 in 20 men.",
   "The most common cause is <b>Klinefelter syndrome</b> (an extra X chromosome), in about 1 in 580 males. Most are never diagnosed. Small, firm testicles are a clue.",
   "Other causes: undescended testes, injury, mumps, chemotherapy, haemochromatosis (iron overload), pituitary tumours, Kallmann syndrome, and after stopping anabolic steroids."]) +
 h2("Symptoms", [
   "Low sex drive, fewer morning erections, erection problems.",
   "Tiredness, low mood, poor concentration, hot flushes and sweats.",
   "Less muscle, more belly fat, less body hair, breast tissue growth, thinning bones.",
   "Many of these are common for other reasons (sleep, stress, depression, weight, alcohol), which is why testing properly matters."]) +
 h2("Testing properly", [
   "A blood test <b>in the morning (8 to 10am), ideally fasting</b>, when testosterone is highest.",
   "<b>Repeat it</b> if low: up to 30% of single low results are normal on a second test.",
   "LH and FSH (the brain’s signals) are checked with it, to work out where the problem is.",
   "Avoid testing while acutely unwell. Illness, poor sleep, heavy exercise and some medicines (opioids, steroids) can lower it temporarily."]) +
 h2("Low, but not a disease", [
   "Testosterone drifts down slowly with age, and is lower with obesity, type 2 diabetes, sleep apnoea and chronic illness.",
   "In these men, Australian experts advise treating the cause first. Weight loss often raises testosterone by itself.",
   "Testosterone treatment isn’t recommended for age-related or weight-related low levels without a real testicular or pituitary problem, because the benefits are small and uncertain."]) +
 h2("Treatment for real deficiency", [
   "Testosterone as an injection, gel or cream, usually lifelong. It improves libido, energy, mood, muscle and bone in men who are truly deficient.",
   "Monitoring includes blood count (testosterone can thicken the blood), and in older men, prostate checks.",
   "A large 2023 trial (TRAVERSE) in men with low testosterone found no increase in heart attacks or strokes with treatment.",
   "<b>Fertility warning:</b> testosterone switches off sperm production. If you want children now or soon, tell your doctor: other hormone treatments can raise testosterone or restart sperm instead."]) +
 h2("Avoid", [
   "Testosterone, ‘T boosters’ or steroids from gyms or online. They can be fake, contaminated or the wrong dose, and can shut down your own hormones and sperm for months to years."]),
 [("What are the signs of low testosterone in men?", "Low sex drive, erection problems, tiredness, low mood, less muscle, more belly fat and less body hair. These have many other causes too, so a proper morning blood test, repeated, is needed."),
  ("When should testosterone be tested?", "In the morning, ideally between 8 and 10am, fasting, and not when you’re unwell. A low result should be repeated."),
  ("Does testosterone treatment affect fertility?", "Yes. It switches off sperm production, often to zero. Men wanting children should discuss other options with their doctor first."),
  ("Is low testosterone just part of ageing?", "Levels drift down a little with age, and more with weight gain and illness. That’s different from true testosterone deficiency, and testosterone treatment isn’t recommended for age alone.")],
 [("Healthy Male", "https://healthymale.org.au/", "Australian men’s health information, including testosterone. Free."),
  ("Better Health Channel: Androgen deficiency in men", "https://betterhealth.vic.gov.au/health/conditionsandtreatments/androgen-deficiency-in-men", "Free.")],
 [ESA,
  ("Yeap BB et al. Endocrine Society of Australia position statement on male hypogonadism (part 2). Med J Aust 2016", "https://www.mja.com.au/journal/2016/205/5/endocrine-society-australia-position-statement-male-hypogonadism-part-2"),
  ("Better Health Channel: Androgen deficiency in men", "https://betterhealth.vic.gov.au/health/conditionsandtreatments/androgen-deficiency-in-men"),
  ("Lincoff AM et al. Cardiovascular safety of testosterone-replacement therapy (TRAVERSE). N Engl J Med 2023", "https://pubmed.ncbi.nlm.nih.gov/37326322/")],
 [("Low sperm count", "/low-sperm-count/"), ("Low libido in men", "/low-libido-men/"), ("Erectile dysfunction", "/erectile-dysfunction/")],
 groups=G + ["Hormones"], blurb="Real deficiency vs normal ageing: proper testing, who benefits from treatment, and fertility.",
 search="low testosterone low T androgen deficiency hypogonadism testosterone test morning TRT testosterone replacement klinefelter symptoms tired low libido men andropause steroids fertility")
