# Content for /glp-1/ (built by gen_glp1.py). Every number checked against the sources listed on each page, November 2026.
# Existing pages this hub links to rather than duplicates: /medicines/glp1-medicines/, /medicines/semaglutide/,
# /medicines/tirzepatide/, /medicines/weight-loss-medicines/ and /compare/ozempic-vs-mounjaro/.
UPDATED = "Updated 8 November 2026"
UPDATED_ISO = "2026-11-08"

HUB_R = ("/glp-1/", "Guide", "GLP-1 medicines guide")
CMP_R = ("/compare/ozempic-vs-mounjaro/", "Compare", "Semaglutide vs tirzepatide")
SEMA_R = ("/medicines/semaglutide/", "Medicine", "Semaglutide")
TIRZ_R = ("/medicines/tirzepatide/", "Medicine", "Tirzepatide")
WEIGHT_R = ("/weight/", "Fact sheet", "Weight and obesity")

# Shared sources (all opened and checked, November 2026)
S_STEP1 = ("https://doi.org/10.1056/NEJMoa2032183", "Wilding et al, NEJM 2021: STEP 1, semaglutide 2.4 mg for weight management (weight loss, side-effect and gallbladder rates)")
S_SURM1 = ("https://doi.org/10.1056/NEJMoa2206038", "Jastreboff et al, NEJM 2022: SURMOUNT-1, tirzepatide for obesity")
S_SURM5 = ("https://doi.org/10.1056/NEJMoa2416394", "Aronne et al, NEJM 2025: SURMOUNT-5, tirzepatide versus semaglutide")
S_SELECT = ("https://doi.org/10.1056/NEJMoa2307563", "Lincoff et al, NEJM 2023: SELECT, semaglutide and heart outcomes in people without diabetes")
S_WEG = ("https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/215256s033lbl.pdf", "US FDA prescribing information for Wegovy (semaglutide), February 2026: side-effect table, warnings")
S_ZEP = ("https://medlibrary.org/lib/rx/meds/zepbound/page/3/", "US prescribing information for Zepbound (tirzepatide): side-effect table, gallbladder and pancreatitis rates")
S_TGA_OC = ("https://www.tga.gov.au/news/safety-updates/updated-contraception-advice-mounjaro-tirzepatide", "TGA: Updated contraception advice for Mounjaro (tirzepatide)")
S_UK = ("https://www.gov.uk/government/publications/glp-1-medicines-for-weight-loss-and-diabetes-what-you-need-to-know/glp-1-medicines-for-weight-loss-and-diabetes-what-you-need-to-know", "UK MHRA: GLP-1 medicines for weight loss and diabetes, what you need to know (updated February 2026)")
S_ADV = ("https://pmc.ncbi.nlm.nih.gov/articles/PMC12264624/", "Mozaffarian et al, 2025: Nutritional priorities to support GLP-1 therapy for obesity (joint advisory of four US obesity and nutrition societies)")

GAME = ('<p class="callout bt-play"><b>Need a brain break?</b> <a href="/dx/">Play Dxtective, the daily diagnosis puzzle</a>, '
        'or browse all <a href="/medical-games/">medical games</a>. Free, no sign-up.</p>')

URGENT_GI = ("<b>Get urgent help</b> (000 in Australia, or your local emergency number) for severe tummy pain that won’t settle, "
             "with or without vomiting, or swelling of the face or throat. <b>See a doctor the same day</b> if you can’t keep fluids down, "
             "have pain under the right ribs with fever or yellow skin, or notice sudden changes in your vision.")

PAGES = [
# ---------------------------------------------------------------- side effects
dict(
slug="side-effects", crumb="Side effects", group="Side effects", cls="m",
title="GLP-1 Side Effects: How Common Each One Is",
h1="GLP-1 side effects: how common is each one?",
desc="GLP-1 side effects with real trial numbers: how often nausea, diarrhoea, vomiting, constipation and hair loss happen on semaglutide and tirzepatide.",
card="Nausea, diarrhoea, constipation and hair loss, with the trial percentages next to placebo.",
lede="Every GLP-1 medicine lists the same gut side effects. What the leaflet doesn’t show is how often they happen compared with a dummy injection. Here are the numbers from the main weight-loss trials.",
qa="Gut side effects are the main ones. In the weight-loss trials, nausea affected 44% of people on semaglutide (16% on placebo) and 25–29% on tirzepatide (8% on placebo). Diarrhoea, vomiting and constipation were also common, mostly mild and early. Roughly 5–7% stopped treatment because of side effects.",
body="""
<h2>Semaglutide 2.4 mg (Wegovy) vs placebo</h2>
<p>From the pooled adult weight-loss trials in the US product information.</p>
<ul><li><b>Nausea:</b> 44% vs 16%</li><li><b>Diarrhoea:</b> 30% vs 16%</li><li><b>Vomiting:</b> 24% vs 6%</li><li><b>Constipation:</b> 24% vs 11%</li><li><b>Tummy pain:</b> 20% vs 10%</li><li><b>Headache:</b> 14% vs 10%</li><li><b>Tiredness:</b> 11% vs 5%</li><li><b>Indigestion:</b> 9% vs 3%</li><li><b>Dizziness:</b> 8% vs 4%</li><li><b>Hair loss:</b> 3% vs 1%</li></ul>
<h2>Tirzepatide 5–15 mg vs placebo</h2>
<p>From the pooled weight-loss trials in the US product information (Zepbound is the US weight-loss brand of tirzepatide; in Australia it’s Mounjaro). Ranges cover the three doses.</p>
<ul><li><b>Nausea:</b> 25–29% vs 8%</li><li><b>Diarrhoea:</b> 19–23% vs 8%</li><li><b>Vomiting:</b> 8–13% vs 2%</li><li><b>Constipation:</b> 11–17% vs 5%</li><li><b>Tummy pain:</b> 9–10% vs 5%</li><li><b>Indigestion:</b> 9–10% vs 4%</li><li><b>Injection-site reactions:</b> 6–8% vs 2%</li><li><b>Tiredness:</b> 5–7% vs 3%</li><li><b>Hair loss:</b> 4–5% vs 1%</li></ul>
<h2>Reading the numbers</h2>
<ul><li>People on placebo get these symptoms too. The gap between the two numbers is the medicine’s share.</li><li>Most gut side effects were mild to moderate and happened mainly while the dose was being stepped up. In STEP 1 they usually faded with time.</li><li>Stopping because of side effects: 6.8% vs 3.2% on semaglutide, and 4.8–6.7% vs 3.4% on tirzepatide.</li><li>Don’t compare the two lists too literally: they come from different trials, and some of the gap reflects different placebo rates.</li></ul>
<h2>What helps</h2>
<ul><li>Smaller, more frequent meals, especially in the first weeks.</li><li>Going easy on large or high-fat meals.</li><li>Fluids and fibre from food for constipation.</li><li>Alcohol can make nausea and reflux worse.</li><li>If side effects are hard going, talk to your doctor. Don’t change your dose on your own.</li></ul>
<h2>Less common but serious</h2>
<p>Gallbladder problems, pancreatitis and a rare eye condition are covered in <a href="/glp-1/serious-risks/">rare but serious risks</a>.</p>
""",
urgent=URGENT_GI,
faqs=[
("What is the most common side effect of GLP-1 medicines?", "Nausea. In the weight-loss trials it affected 44% of people on semaglutide 2.4 mg versus 16% on placebo, and 25–29% on tirzepatide versus 8% on placebo."),
("How long does the nausea last?", "It’s usually worst in the first weeks and after each dose increase. In the STEP 1 trial, gut side effects were typically mild to moderate and faded with time."),
("Does Mounjaro have fewer side effects than Ozempic?", "Not clearly. The numbers come from different trials, and the head-to-head SURMOUNT-5 trial found gut side effects were the most common in both groups, mostly mild to moderate and during dose increases."),
("Do GLP-1 medicines cause hair loss?", "Hair loss is a listed side effect, but uncommon: 3% on semaglutide 2.4 mg and 4–5% on tirzepatide, versus 1% on placebo in the trials."),
("Can GLP-1 medicines cause low blood sugar?", "Not often on their own. The risk is mainly in people with diabetes, especially those also taking insulin or a sulfonylurea. Your doctor may adjust those medicines."),
("What should I do if the side effects are bad?", "Talk to your doctor or pharmacist rather than changing your dose yourself. Severe tummy pain that won’t settle, or vomiting so bad you can’t keep fluids down, needs urgent help."),
],
sources=[S_WEG, S_ZEP, S_STEP1, S_SURM1, S_SURM5, S_ADV],
related=[HUB_R, ("/glp-1/serious-risks/", "Guide", "Rare but serious risks"), SEMA_R, TIRZ_R, CMP_R],
),
# ---------------------------------------------------------------- stopping
dict(
slug="stopping", crumb="Stopping", group="Stopping", cls="m",
title="Stopping Ozempic or Mounjaro: Weight Regain Explained",
h1="Stopping a GLP-1 medicine: what happens to your weight?",
desc="What happens when you stop semaglutide or tirzepatide: weight regain in the STEP 1, STEP 4 and SURMOUNT-4 trials, and how to plan with your doctor.",
card="Most weight comes back within a year. What the withdrawal trials found, and how to plan.",
lede="The awkward truth that social media skips: these medicines treat weight while you take them. Stop, and appetite usually comes back, and so does much of the weight.",
qa="Most people regain weight after stopping. A year after stopping semaglutide, people in the STEP 1 extension had regained about two-thirds of the weight they’d lost. In SURMOUNT-4, people switched from tirzepatide to placebo regained 14% of their weight in a year, while those who continued kept losing. Plan any stop with your doctor.",
body="""
<h2>What the trials found</h2>
<ul><li><b>STEP 1 extension (semaglutide):</b> people lost 17.3% of their weight over 68 weeks. One year after stopping, they’d regained 11.6 percentage points, leaving them 5.6% below their starting weight.</li><li><b>STEP 4 (semaglutide):</b> after 20 weeks on treatment (10.6% lost), people who continued lost a further 7.9% over 48 weeks. Those switched to placebo regained 6.9%.</li><li><b>SURMOUNT-4 (tirzepatide):</b> after 36 weeks (20.9% lost), people who continued lost a further 5.5% over a year. Those switched to placebo regained 14.0%.</li><li>In SURMOUNT-4, 89.5% of people who stayed on tirzepatide kept at least 80% of their weight loss, versus 16.6% on placebo.</li></ul>
<h2>Health benefits fade too</h2>
<ul><li>In the STEP 1 extension, improvements in blood pressure, blood fats and blood sugar mostly drifted back towards where they started once semaglutide stopped.</li><li>If you have diabetes, your blood sugar may rise again, so your doctor may need to adjust your other treatment.</li></ul>
<h2>Why it happens</h2>
<ul><li>Obesity is a long-term (chronic) condition. The trial authors concluded that ongoing treatment is needed to keep the weight and health gains.</li><li>Regain after stopping isn’t a willpower failure. It’s what the medicine stopping looks like.</li><li>One caveat: in the STEP 1 extension, the lifestyle support also stopped at the same time.</li></ul>
<h2>If you’re thinking of stopping</h2>
<ul><li>Talk to your doctor first, so you can plan follow-up checks of weight, blood pressure, blood sugar and cholesterol.</li><li>Keep up strength training and protein: muscle helps you stay strong whatever the scales say. See <a href="/glp-1/muscle-loss/">muscle loss and protein</a>.</li><li>Planning a pregnancy? There are minimum gaps before trying to conceive. See <a href="/glp-1/pregnancy-contraception/">pregnancy and contraception</a>.</li></ul>
""",
urgent="<b>See your GP</b> before stopping if you take a GLP-1 medicine for type 2 diabetes, so your blood sugar plan can be adjusted. <b>Get urgent help</b> (000 in Australia, or your local emergency number) for very high blood sugar with vomiting, drowsiness or confusion.",
faqs=[
("Will I regain all the weight if I stop?", "Not necessarily all of it, but most people regain a lot. One year after stopping semaglutide in the STEP 1 extension, people had regained about two-thirds of their lost weight and were 5.6% below their starting weight on average."),
("How fast does weight come back after stopping Mounjaro?", "In SURMOUNT-4, people switched from tirzepatide to placebo regained 14% of their body weight over the following year."),
("Do the health benefits go away when I stop?", "Mostly, yes. In the STEP 1 extension, improvements in blood pressure, blood fats and blood sugar largely went back towards where they started within a year of stopping."),
("Do I have to take a GLP-1 medicine forever?", "Not necessarily, but the trials show the benefits last only while you take it. How long to continue is a decision to make with your doctor, weighing benefits, side effects and cost."),
("Is regaining weight my fault?", "No. Regain after stopping is expected from how these medicines work: appetite returns when the medicine stops. It happened to most people in carefully run trials."),
],
sources=[
("https://pmc.ncbi.nlm.nih.gov/articles/PMC9542252/", "Wilding et al, Diabetes, Obesity and Metabolism 2022: STEP 1 trial extension, weight regain after stopping semaglutide"),
("https://pmc.ncbi.nlm.nih.gov/articles/PMC7988425/", "Rubino et al, JAMA 2021: STEP 4, continuing versus stopping semaglutide"),
("https://pmc.ncbi.nlm.nih.gov/articles/PMC10714284/", "Aronne et al, JAMA 2024: SURMOUNT-4, continuing versus stopping tirzepatide"),
S_STEP1,
],
related=[HUB_R, ("/glp-1/muscle-loss/", "Guide", "Muscle loss and protein"), ("/glp-1/faq/", "Guide", "GLP-1 questions answered"), WEIGHT_R, ("/medicines/weight-loss-medicines/", "Medicine", "Weight-loss medicines")],
),
# ---------------------------------------------------------------- muscle
dict(
slug="muscle-loss", crumb="Muscle loss and protein", group="Muscle", cls="m",
title="GLP-1 Medicines and Muscle Loss: Protein and Exercise",
h1="Do GLP-1 medicines cause muscle loss?",
desc="How much of the weight lost on semaglutide or tirzepatide is muscle, what the trials show, and how protein and strength training help protect it.",
card="About a quarter of the weight lost is lean tissue. What protein and strength training can do.",
lede="“Ozempic melts your muscles” makes a great headline. The evidence is more boring and more useful: some lean tissue goes with the fat, and you can do something about it.",
qa="Some of the weight lost on GLP-1 medicines is lean tissue, which includes muscle. Across trials it averages about a quarter of the weight lost, and up to about 40% in some studies. Fat makes up most of the loss. Enough protein and regular strength training are the best-supported ways to protect muscle.",
body="""
<h2>What the evidence shows</h2>
<ul><li>A 2024 analysis of 22 trials found lean mass made up about <b>25%</b> of the weight lost on GLP-1 medicines. Lean mass as a share of the body didn’t fall.</li><li>In semaglutide studies, lean tissue ranged from almost none to about <b>40%</b> of the weight lost. Because fat fell more, lean tissue as a proportion of the body went up.</li><li>The strongest medicines (semaglutide 2.4 mg, tirzepatide 15 mg) caused the most fat loss but were among the least muscle-sparing.</li><li>Reviews estimate lean mass falls by about 10% (around 6 kg) over a 68–72 week course.</li><li>“Lean mass” on a scan includes muscle, organs and water, so it isn’t all muscle. Whether the loss affects strength and day-to-day function long term is still being studied.</li></ul>
<h2>Protein</h2>
<ul><li>The usual adult recommendation is about <b>0.8 g of protein per kg of body weight a day</b>.</li><li>Experts have proposed higher targets during active weight loss, around 1.2–1.6 g/kg a day. The best target for people living with obesity isn’t settled, partly because using total body weight can overestimate needs.</li><li>Long-term intake above 2 g/kg a day isn’t advised.</li><li>Small appetite? A dietitian can help, and a supplement drink may be useful if you can’t eat enough.</li><li>If you have kidney disease, check with your doctor before increasing protein.</li></ul>
<h2>Strength training</h2>
<ul><li>Resistance (strength) training, or a mix of strength and aerobic exercise, is well established to help preserve lean mass during weight loss. Aerobic exercise alone does less.</li><li>Supervised strength programmes lasting more than 10 weeks have added about 3 kg of lean mass and about 25% more strength.</li><li>In one trial, a GLP-1 medicine plus exercise preserved bone density, while the medicine alone reduced it.</li><li>Older adults have the most to lose: keeping muscle helps protect against frailty. See our <a href="/exercises/">exercise handouts</a>.</li></ul>
""",
urgent="<b>See your GP</b> if you’re losing weight very fast, feel weak or dizzy, or are struggling to eat enough. <b>Get urgent help</b> (000 in Australia, or your local emergency number) if you faint or can’t keep fluids down.",
faqs=[
("Is the weight lost on Ozempic mostly fat?", "Yes. On average about three-quarters is fat and about a quarter is lean tissue, which includes muscle, organs and water."),
("How much protein should I eat on a GLP-1 medicine?", "The usual adult recommendation is about 0.8 g per kg of body weight a day, and experts suggest more during active weight loss, around 1.2–1.6 g/kg. Ask your doctor or a dietitian for a target that suits you, especially if you have kidney disease."),
("Do I need protein shakes?", "Not usually. Food comes first. A supplement drink can help if nausea or a small appetite means you can’t eat enough protein."),
("Is walking enough to protect muscle?", "Walking is good for your heart and mood, but aerobic exercise alone does less for muscle. Adding strength training is better supported."),
("Are older people more at risk of muscle loss?", "Yes. Muscle naturally declines with age, and keeping it matters for avoiding frailty, so strength training and enough protein are especially important."),
],
sources=[
("https://doi.org/10.1016/j.metabol.2024.156113", "Karakasis et al, Metabolism 2024: GLP-1 medicines and body composition, systematic review and network meta-analysis of 22 trials"),
("https://doi.org/10.1080/14656566.2024.2343092", "Bikou et al, Expert Opinion on Pharmacotherapy 2024: Systematic review of semaglutide and lean mass"),
("https://doi.org/10.2337/dci23-0100", "Locatelli et al, Diabetes Care 2024: Incretin weight-loss medicines and resistance exercise"),
("https://pmc.ncbi.nlm.nih.gov/articles/PMC11611443/", "Mechanick et al, Obesity Reviews 2024: Strategies for minimising muscle loss on incretin medicines"),
S_ADV,
],
related=[HUB_R, ("/glp-1/stopping/", "Guide", "Stopping and weight regain"), ("/exercises/", "Guide", "Exercise handouts"), WEIGHT_R, ("/osteoporosis/", "Fact sheet", "Osteoporosis")],
),
# ---------------------------------------------------------------- pregnancy
dict(
slug="pregnancy-contraception", crumb="Pregnancy and contraception", group="Pregnancy", cls="l",
title="GLP-1 Medicines, Pregnancy, Contraception and Fertility",
h1="GLP-1 medicines, pregnancy, contraception and fertility",
desc="GLP-1 medicines and pregnancy: how long to stop before trying, breastfeeding, why tirzepatide can make the pill less reliable, and fertility.",
card="How long to stop before trying, and why Mounjaro can make the pill less reliable.",
lede="The “Ozempic baby” headlines have a real message underneath: these medicines aren’t for pregnancy, and one of them can make the pill less reliable.",
qa="GLP-1 medicines aren’t used in pregnancy or breastfeeding. UK advice is to stop semaglutide at least 2 months, and tirzepatide at least 1 month, before trying to conceive. Tirzepatide (Mounjaro) may make the contraceptive pill less reliable, so add condoms or use a non-pill method for 4 weeks after starting and after each dose increase.",
body="""
<h2>Pregnancy</h2>
<ul><li>None of these medicines are recommended in pregnancy (TGA). There isn’t enough safety data to know whether they could harm a baby (MHRA).</li><li>Use effective contraception while taking one if you could get pregnant.</li><li><b>Stop before trying to conceive</b> (UK MHRA): semaglutide (Ozempic, Wegovy) at least 2 months; tirzepatide (Mounjaro) at least 1 month; liraglutide just before trying.</li><li>Pregnant while taking one? Talk to your doctor straight away.</li></ul>
<h2>Breastfeeding</h2>
<ul><li>UK advice is not to take GLP-1 medicines while breastfeeding.</li></ul>
<h2>Tirzepatide and the pill</h2>
<ul><li>The TGA updated Mounjaro’s product information in December 2025: reduced effectiveness of oral contraceptives “cannot be excluded”.</li><li>If you use the pill, switch to a non-oral method or add a barrier method (such as condoms) for <b>4 weeks after starting</b> and <b>4 weeks after each dose increase</b>.</li><li>Non-oral options include the implant, the IUD (coil) and condoms. See <a href="/contraception/">contraception</a>.</li><li>Semaglutide doesn’t carry this warning: in a US study it didn’t meaningfully change levels of the pill’s hormones.</li></ul>
<h2>Fertility</h2>
<ul><li>In women with PCOS, a review of 11 trials linked GLP-1 medicines with more regular periods and higher natural pregnancy rates. See <a href="/pcos/">PCOS</a>.</li><li>The UK regulator has received more than 40 reports of pregnancies in people taking these medicines.</li><li>So if you don’t want to get pregnant, reliable contraception matters. If you do, talk to your GP about timing and other ways to manage weight and blood sugar in the meantime.</li></ul>
""",
urgent="<b>See your GP</b> as soon as you can if you become pregnant while taking a GLP-1 medicine. <b>Get urgent help</b> (000 in Australia, or your local emergency number) for heavy bleeding or severe tummy pain in early pregnancy.",
faqs=[
("Does Mounjaro make the pill less effective?", "It may. The TGA advises switching to a non-oral method or adding condoms for 4 weeks after starting tirzepatide and for 4 weeks after each dose increase."),
("Does Ozempic affect the contraceptive pill?", "Semaglutide doesn’t carry the same warning. In a US study it didn’t meaningfully change levels of the pill’s hormones. Severe vomiting is worth discussing with your doctor or pharmacist whatever you take."),
("How long before trying to get pregnant should I stop Ozempic?", "UK advice is at least 2 months for semaglutide (Ozempic, Wegovy) and at least 1 month for tirzepatide (Mounjaro). Plan it with your doctor."),
("Can I take a GLP-1 medicine while breastfeeding?", "UK advice is not to. Talk to your doctor about other options while you’re breastfeeding."),
("What are “Ozempic babies”?", "A media term for unexpected pregnancies in people taking these medicines. The UK regulator has received more than 40 pregnancy reports, and tirzepatide may make the pill less reliable."),
],
sources=[
S_TGA_OC,
("https://australianprescriber.tg.org.au/articles/updated-contraception-advice-for-Mounjaro-tirzepatide.html", "Australian Prescriber 2026: Updated contraception advice for Mounjaro (TGA Medicines Safety Update, December 2025)"),
S_UK,
("https://pharmaceutical-journal.com/article/news/mhra-urges-women-taking-weight-loss-drugs-urged-to-use-effective-contraception", "Pharmaceutical Journal, June 2025: MHRA urges effective contraception with weight-loss medicines"),
("https://news.stv.tv/world/women-taking-weight-loss-jabs-warned-they-must-use-effective-contraception", "STV News (PA), June 2025: More than 40 UK pregnancy reports"),
("https://pmc.ncbi.nlm.nih.gov/articles/PMC10631119/", "Zhou et al, BMC Endocrine Disorders 2023: GLP-1 medicines, pregnancy rate and periods in PCOS, meta-analysis"),
S_WEG,
],
related=[HUB_R, ("/contraception/", "Fact sheet", "Contraception"), ("/pcos/", "Fact sheet", "PCOS"), TIRZ_R, SEMA_R],
),
# ---------------------------------------------------------------- surgery
dict(
slug="surgery-anaesthesia", crumb="Surgery and anaesthesia", group="Procedures", cls="l",
title="GLP-1 Medicines Before Surgery or Anaesthesia",
h1="GLP-1 medicines before surgery or an anaesthetic",
desc="Taking Ozempic or Mounjaro before surgery, a gastroscopy or sedation: why aspiration is a risk, and the 2025 Australian 24-hour clear fluid advice.",
card="Keep taking it, have a 24-hour clear fluid diet first, and tell your anaesthetist.",
lede="These medicines slow your stomach down, which is part of how they work. Under an anaesthetic, a stomach that hasn’t emptied is a real safety issue.",
qa="Australian guidance from 2025 says keep taking your GLP-1 medicine before a procedure, but have only clear fluids for 24 hours beforehand, then follow the usual fasting. These medicines slow stomach emptying, so food can stay in the stomach and be breathed into the lungs under anaesthetic. Always tell your anaesthetist.",
body="""
<h2>Why it matters</h2>
<ul><li>GLP-1 medicines slow stomach emptying. Under anaesthesia or sedation, stomach contents can be breathed into the airways and lungs (aspiration).</li><li>The US product information reports rare cases of aspiration in people who had followed the usual fasting advice.</li></ul>
<h2>Australian advice (2025)</h2>
<p>From the Australian Diabetes Society, ANZCA, the Gastroenterological Society of Australia and obesity services.</p>
<ul><li><b>Keep taking it.</b> Stopping before a procedure isn’t recommended.</li><li><b>Clear fluids for 24 hours</b>, from waking on the day before, then the usual fasting before the procedure. Your hospital will give exact times.</li><li><b>Diabetes and insulin?</b> Clear fluids are mostly sugary, so ask for a diabetes plan for that day.</li><li><b>Feeling fine doesn’t prove an empty stomach.</b> Having no gut symptoms isn’t a reliable sign.</li><li><b>Missed the clear fluid day?</b> Tell the team. They may check your stomach with ultrasound, take other precautions or reschedule.</li></ul>
<h2>Elsewhere</h2>
<ul><li><b>UK:</b> the MHRA says keep taking your medicine as usual and don’t stop without talking to your doctor.</li><li><b>US:</b> the product information tells people to let their healthcare providers know before any planned surgery or procedure.</li></ul>
""",
urgent="<b>Tell your anaesthetist, surgeon or proceduralist</b> that you take a GLP-1 medicine, ideally when the procedure is booked. <b>Get urgent help</b> (000 in Australia, or your local emergency number) for trouble breathing, or a cough with fever, after an anaesthetic.",
faqs=[
("Should I stop Ozempic before surgery?", "Not usually. 2025 Australian guidance says to keep taking GLP-1 medicines and to have a 24-hour clear fluid diet before the procedure instead. Follow your own team’s instructions."),
("Why do I need a clear fluid diet before my procedure?", "GLP-1 medicines slow stomach emptying, so solid food can still be in your stomach after the usual fast. Clear fluids for 24 hours lowers the chance of food being breathed into the lungs under anaesthetic."),
("Does this apply to a gastroscopy or colonoscopy with sedation?", "Yes. The Australian advice covers procedures under anaesthesia or sedation, and the Gastroenterological Society of Australia helped write it."),
("What if I didn’t do the 24-hour clear fluid diet?", "Tell the team before your procedure. They may check your stomach with ultrasound, use other precautions or move the procedure to another day."),
("I have diabetes and use insulin. What about the clear fluid day?", "Clear fluids are mostly sugary, so your insulin may need adjusting. Ask your doctor or diabetes team for a plan well before the day."),
],
sources=[
("https://pmc.ncbi.nlm.nih.gov/articles/PMC12420935/", "Hocking et al, Anaesthesia and Intensive Care 2025: ADS, ANZCA, GESA and NACOS clinical practice recommendations on peri-procedural GLP-1 and GLP-1/GIP medicines"),
("https://www.anzca.edu.au/safety-and-advocacy/standards-of-practice/clinical-practice-recommendations-regarding-patients-taking-glp-1", "ANZCA: GLP-1 receptor agonists, clinical practice recommendations and FAQs"),
S_UK,
S_WEG,
],
related=[HUB_R, ("/glp-1/side-effects/", "Guide", "GLP-1 side effects"), SEMA_R, TIRZ_R, ("/type-2-diabetes/", "Fact sheet", "Type 2 diabetes")],
),
# ---------------------------------------------------------------- compounded and fake
dict(
slug="compounded-counterfeit", crumb="Compounded and fake products", group="Safety", cls="n",
title="Compounded and Fake Ozempic or Mounjaro: The Risks",
h1="Compounded and fake GLP-1 products",
desc="Compounded and counterfeit semaglutide and tirzepatide: Australia’s 2024 ban, fake Ozempic pens, FDA warnings and how to stay safe.",
card="Australia banned compounded copies in 2024. Fake pens, FDA harm reports and staying safe.",
lede="Cheap “semaglutide” from a website, a salon or a DM is not a bargain. It’s a lucky dip, and some of the prizes are hospital admissions.",
qa="Australia banned compounded GLP-1 copies from 1 October 2024 because they aren’t checked by the TGA for safety, quality or strength. Fake Ozempic pens bought online have reached Australia, and the US FDA has hundreds of harm reports linked to compounded versions. Get these medicines only on prescription from a registered pharmacy.",
body="""
<h2>Australia</h2>
<ul><li><b>Compounding banned</b> from 1 October 2024. At the time, at least 20,000 Australians were injecting compounded replicas of Ozempic or Mounjaro, mostly for weight loss.</li><li>The reasons: compounded copies aren’t evaluated by the TGA for safety, quality or effectiveness, and there were reports of harm, including a hospitalisation in Australia.</li><li><b>Fake Ozempic pens:</b> in October 2024 the TGA warned about counterfeit pens bought from an overseas website. They appeared to be relabelled insulin pens, which can cause dangerously low blood sugar, and one person had life-threatening complications.</li><li><b>Warning signs of a fake:</b> spelling errors, a leaflet not in English, unsealed or poor-quality packaging, a different cap colour or shape, and labels that don’t stick properly.</li></ul>
<h2>United States</h2>
<ul><li>The FDA doesn’t review compounded medicines for safety, effectiveness or quality before they’re sold.</li><li>Dosing errors with compounded semaglutide have led to hospitalisations.</li><li>By 31 May 2026 the FDA had received 990 adverse event reports for compounded semaglutide and more than 730 for compounded tirzepatide, and thinks these are under-reported.</li><li>Products labelled “for research use” or “not for human consumption” are being sold to people. Don’t buy them.</li><li>Semaglutide sodium and semaglutide acetate are different ingredients from the one in approved products.</li></ul>
<h2>United Kingdom</h2>
<ul><li>The MHRA warns against buying from beauty salons or social media and has reports of severe side effects from fake GLP-1 medicines.</li></ul>
<h2>Staying safe</h2>
<ul><li>Get a prescription from a doctor and have it dispensed by a registered pharmacy.</li><li>Avoid “no prescription needed” websites and peptide sellers.</li><li>Think you have a fake? Stop using it, keep it (it may be tested), see your doctor and report it to the TGA.</li></ul>
""",
urgent="<b>Get urgent help</b> (000 in Australia, or your local emergency number) if you feel shaky, sweaty, confused or drowsy after injecting a product from an unofficial source: it could be low blood sugar. Severe vomiting or tummy pain also needs urgent care.",
faqs=[
("Is compounded semaglutide legal in Australia?", "No. Compounding GLP-1 medicines has been banned in Australia since 1 October 2024. Only TGA-approved products dispensed on prescription are legal."),
("Is compounded semaglutide the same as Ozempic?", "No. Compounded products aren’t checked by the TGA or FDA for strength, purity or safety, and some use different salt forms of semaglutide from the approved medicine."),
("How can I tell if my Ozempic pen is fake?", "Warning signs include spelling errors, a leaflet not in English, unsealed or poor packaging, a different cap colour and labels that don’t stick. Buy only from an Australian pharmacy and ask your pharmacist if unsure."),
("What should I do if I’ve used a fake or compounded product?", "Stop using it, keep the product, and see your doctor. Report it to the TGA. Get urgent help for shakiness, confusion or drowsiness, which could be low blood sugar."),
("Are “research peptides” safe to inject?", "No. Products labelled for research or not for human consumption aren’t made or checked for people, and the FDA warns against buying them."),
],
sources=[
("https://www.health.gov.au/ministers/the-hon-mark-butler-mp/media/protecting-australians-from-unsafe-compounding-of-replica-weight-loss-products", "Australian Government Department of Health: Ban on compounding replica weight-loss products from 1 October 2024"),
("https://www1.racgp.org.au/newsgp/clinical/tga-urges-extreme-caution-amid-fake-ozempic-pen-im", "newsGP, October 2024: TGA urges extreme caution over fake Ozempic pens"),
("https://www.fda.gov/drugs/postmarket-drug-safety-information-patients-and-providers/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss", "US FDA: Concerns with unapproved GLP-1 drugs used for weight loss (October 2026)"),
S_UK,
],
related=[HUB_R, ("/glp-1/pbs-cost-australia/", "Guide", "PBS and cost in Australia"), SEMA_R, TIRZ_R, ("/medicines/glp1-medicines/", "Medicine", "GLP-1 medicines compared")],
),
# ---------------------------------------------------------------- PBS and cost
dict(
slug="pbs-cost-australia", crumb="PBS and cost in Australia", group="Access", cls="l",
title="Ozempic, Wegovy and Mounjaro on the PBS: Cost in Australia",
h1="GLP-1 medicines on the PBS: access and cost in Australia",
desc="Which GLP-1 medicines are on the PBS in November 2026: Ozempic for type 2 diabetes, Wegovy’s pending listing, Mounjaro, private costs, plus US and UK.",
card="Ozempic for type 2 diabetes only. Wegovy recommended but not listed. Mounjaro: no PBS.",
lede="Who pays $25 and who pays thousands comes down to one thing: whether you have type 2 diabetes. Here’s where each medicine stands.",
qa="As of 1 November 2026, Ozempic and Trulicity are PBS-subsidised for type 2 diabetes only, when criteria are met. No GLP-1 medicine is on the PBS for weight loss. Wegovy was recommended for people with obesity and heart disease but isn’t listed yet. Mounjaro isn’t on the PBS for anything.",
body="""
<h2>PBS status (1 November 2026)</h2>
<ul><li><b>Ozempic (semaglutide) and Trulicity (dulaglutide):</b> PBS-subsidised for type 2 diabetes in certain circumstances. A PBS script costs up to $25, or $7.70 with a concession card.</li><li><b>Wegovy (semaglutide):</b> the PBAC recommended it in November 2025 for adults with established heart or blood vessel disease (a previous heart attack, stroke or symptomatic peripheral arterial disease) and a BMI of 35 or more. As of 1 November 2026, the PBS says listing “has not yet occurred”.</li><li><b>Mounjaro (tirzepatide):</b> the PBAC recommended it for type 2 diabetes in March 2026, but the company has advised it isn’t proceeding with PBS listing. It isn’t subsidised for any use.</li><li><b>Weight management alone:</b> no GLP-1 medicine is subsidised. It’s a private script.</li></ul>
<h2>Private cost</h2>
<ul><li>More than 400,000 Australians were paying full price for GLP-1 medicines in early 2026, and the ABC reported some pay $4,000 to $5,000 a year.</li><li>Prices vary with the dose and the pharmacy. Ask your pharmacist for a quote.</li><li>PBS-subsidised Ozempic is for type 2 diabetes only, so it can’t be used on the PBS for weight loss.</li><li>Compounded “cheaper copies” aren’t an option: they’ve been banned since October 2024. See <a href="/glp-1/compounded-counterfeit/">compounded and fake products</a>.</li></ul>
<h2>Global note</h2>
<ul><li><b>US:</b> cash prices typically run $149–$699 a month. A Medicare pilot (1 July 2026 to 31 December 2027) charges eligible Part D members $50 a month for some weight-loss GLP-1 medicines.</li><li><b>UK:</b> the NHS is offering tirzepatide in stages from June 2025, starting with people with a BMI of 40 or more and at least four weight-related conditions, then BMI 35–39.9 from June 2026.</li></ul>
""",
urgent="<b>Talk to your GP</b> about whether you meet PBS criteria and what else could help, including other weight and diabetes treatments. Never buy prescription medicines from unofficial websites to save money.",
faqs=[
("Is Ozempic on the PBS for weight loss?", "No. Ozempic is PBS-subsidised only for type 2 diabetes when criteria are met. Using it for weight loss alone requires a private script."),
("Is Wegovy on the PBS?", "Not yet. The PBAC recommended it in November 2025 for adults with established heart or blood vessel disease and a BMI of 35 or more, but as of 1 November 2026 it hadn’t been listed."),
("Is Mounjaro on the PBS?", "No, not for any use as of November 2026. The PBAC recommended it for type 2 diabetes in March 2026, but the company advised it isn’t proceeding with listing."),
("How much does a PBS script for Ozempic cost?", "Up to $25 a script, or $7.70 with a concession card, if you meet the PBS criteria for type 2 diabetes."),
("Why does weight-loss use cost so much?", "Because no GLP-1 medicine is subsidised for weight management alone, you pay the full private price, which varies with dose and pharmacy."),
],
sources=[
("https://www.pbs.gov.au/medicinestatus/document/1460", "PBS medicine status: Semaglutide (Wegovy) for established cardiovascular disease with obesity (current at 1 November 2026)"),
("https://www.pbs.gov.au/medicinestatus/document/1609.html", "PBS medicine status: Tirzepatide (Mounjaro) for type 2 diabetes (current at 1 November 2026)"),
("https://www.abc.net.au/news/2026-01-12/wegovy-to-be-added-to-pbs/106218104", "ABC News, January 2026: Wegovy to be subsidised for Australians with severe obesity and heart disease (criteria, costs)"),
("https://www.diabetesaustralia.com.au/news/wegovy-to-be-listed-on-pbs/", "Diabetes Australia, January 2026: Wegovy to be listed on PBS"),
S_TGA_OC,
("https://www.npr.org/2026/05/06/nx-s1-5812662/medicare-bridge-glp1-drugs-copay", "NPR, May 2026: Medicare GLP-1 Bridge, $50 a month"),
("https://www.cheshireandmerseyside.nhs.uk/your-health/prescribing/statements/mounjaro-tirzepatide/", "NHS Cheshire and Merseyside: Tirzepatide for obesity, phased NHS rollout"),
],
related=[HUB_R, ("/glp-1/compounded-counterfeit/", "Guide", "Compounded and fake products"), CMP_R, ("/type-2-diabetes/", "Fact sheet", "Type 2 diabetes"), WEIGHT_R],
),
# ---------------------------------------------------------------- serious risks
dict(
slug="serious-risks", crumb="Rare but serious risks", group="Safety", cls="n",
title="Rare GLP-1 Risks: Pancreatitis, Gallbladder, Eyes, Thyroid",
h1="Rare but serious GLP-1 risks",
desc="Rare GLP-1 risks in numbers: pancreatitis, gallstones, NAION (sudden vision loss), the thyroid C-cell warning and mood, with the symptoms that need urgent help.",
card="Gallbladder, pancreatitis, NAION and the thyroid warning, in real numbers.",
lede="Rare means rare, not never. Knowing the warning signs matters more than doom-scrolling the side-effect list.",
qa="Serious problems are uncommon. Gallbladder problems were about twice as common as on placebo (2.6% vs 1.2% with semaglutide). Pancreatitis occurred in about 0.2% of people. Sudden vision loss from NAION is a very rare side effect of semaglutide. Thyroid tumours seen in rodents haven’t been shown to occur in humans.",
body="""
<h2>Gallbladder</h2>
<ul><li><b>Semaglutide (STEP 1):</b> gallbladder problems 2.6% vs 1.2% on placebo; gallstones 1.8% vs 0.6%.</li><li><b>Tirzepatide:</b> gallstones 1.1% vs 1.0%; gallbladder inflammation 0.7% vs 0.2%.</li><li>Warning signs: pain under the right ribs, fever, yellow skin or eyes. See <a href="/gallstones/">gallstones</a>.</li></ul>
<h2>Pancreatitis</h2>
<ul><li><b>Semaglutide:</b> 0.2% vs 0% in STEP 1 (3 people). Across the US trials, 0.2 cases per 100 patient-years vs less than 0.1 on placebo.</li><li><b>Tirzepatide:</b> 0.2% vs 0.2% on placebo.</li><li>Rare serious or fatal cases have been reported. Severe tummy pain that won’t settle, sometimes going through to the back, needs urgent help.</li></ul>
<h2>Sudden vision loss (NAION)</h2>
<ul><li>In June 2025 the European Medicines Agency concluded that NAION (sudden damage to the optic nerve from poor blood flow) is a <b>very rare</b> side effect of semaglutide, affecting up to 1 in 10,000 people.</li><li>In people with type 2 diabetes, the risk was about twice that of non-users: roughly one extra case per 10,000 years of treatment.</li><li>Sudden loss of vision or rapidly worsening eyesight needs urgent assessment.</li></ul>
<h2>Thyroid C-cell warning</h2>
<ul><li>The US labels carry a boxed warning because semaglutide caused thyroid C-cell tumours in rodents. Whether it does in humans is unknown.</li><li>Not for people with a personal or family history of medullary thyroid cancer or MEN 2.</li><li>Tell your doctor about a new lump in your neck.</li></ul>
<h2>Mood</h2>
<ul><li>In December 2025 the TGA added a warning about suicidal thoughts and behaviour to the whole class, while finding insufficient evidence that the medicines cause them.</li><li>A UK MHRA review found the data don’t support a causal link. Tell your doctor about new or worsening low mood.</li></ul>
<h2>Other things to know</h2>
<ul><li>Severe vomiting or diarrhoea can cause dehydration and kidney problems.</li><li>Food can stay in the stomach under anaesthetic. See <a href="/glp-1/surgery-anaesthesia/">before surgery or anaesthesia</a>.</li></ul>
""",
urgent=URGENT_GI + '</p>\n<p class="callout"><b>If you’re having thoughts of suicide or self-harm</b>, call Lifeline on 13 11 14 (Australia, 24/7), your local crisis line, or 000 in an emergency.',
faqs=[
("Does Ozempic cause pancreatitis?", "It can, but it’s rare: about 0.2% of people in the STEP 1 trial versus none on placebo. Severe tummy pain that won’t settle needs urgent help."),
("Can GLP-1 medicines cause blindness?", "Very rarely. The European Medicines Agency concluded that NAION, which causes sudden vision loss in one eye, is a very rare side effect of semaglutide, affecting up to 1 in 10,000 people."),
("Do GLP-1 medicines cause thyroid cancer?", "This hasn’t been shown in humans. Semaglutide caused thyroid C-cell tumours in rodents, so US labels carry a warning, and these medicines aren’t used by people with a personal or family history of medullary thyroid cancer or MEN 2."),
("Do GLP-1 medicines cause depression or suicidal thoughts?", "A causal link hasn’t been shown, but the TGA added a precautionary warning in December 2025. Tell your doctor about any new or worsening low mood."),
("Are gallstones common on GLP-1 medicines?", "Uncommon, but more likely than on placebo: gallstones affected 1.8% of people on semaglutide versus 0.6% on placebo in STEP 1."),
],
sources=[
S_STEP1, S_WEG, S_ZEP,
("https://www.ema.europa.eu/en/news/prac-concludes-eye-condition-naion-very-rare-side-effect-semaglutide-medicines-ozempic-rybelsus-wegovy", "European Medicines Agency, June 2025: NAION is a very rare side effect of semaglutide"),
("https://www.healthed.com.au/clinical_articles/warnings-added-to-glp-1s-following-reports-of-suicidal-behaviour-ideation", "Healthed, December 2025: TGA adds suicidal ideation and behaviour warnings to GLP-1 medicines"),
S_UK,
],
related=[HUB_R, ("/glp-1/side-effects/", "Guide", "GLP-1 side effects"), ("/gallstones/", "Fact sheet", "Gallstones"), SEMA_R, TIRZ_R],
),
# ---------------------------------------------------------------- FAQ
dict(
slug="faq", crumb="Common questions", group="FAQ", cls="m",
title="GLP-1 Questions: Alcohol, Hair Loss, Ozempic Face, Duration",
h1="GLP-1 questions: alcohol, hair loss, “Ozempic face” and how long",
desc="Straight answers on GLP-1 medicines: drinking alcohol, hair loss, “Ozempic face”, how long to take them, and what if they don’t work.",
card="Alcohol, hair loss, “Ozempic face”, how long to take it, and when it doesn’t work.",
lede="The questions people actually type into search bars, answered with trial data instead of TikTok.",
qa="There’s no direct interaction with alcohol, but it can worsen nausea and reflux, and many people find they want less. Hair loss is a listed side effect (3–5% vs 1% on placebo). “Ozempic face” is facial fat loss from fast weight loss, not a drug effect. Most people need to keep taking it to keep the weight off.",
body="""
<h2>Alcohol</h2>
<ul><li>No direct drug interaction is described, but alcohol can make nausea and reflux worse.</li><li>With diabetes, alcohol plus insulin or a sulfonylurea raises the risk of low blood sugar.</li><li>Both alcohol and GLP-1 medicines are linked to pancreatitis. If you’ve had pancreatitis, ask your doctor about avoiding alcohol.</li><li>Many people report less interest in alcohol. In a small 9-week trial of 48 adults with alcohol use disorder, semaglutide reduced drinks per drinking day and craving. Larger trials are needed, and it isn’t approved for this.</li></ul>
<h2>Hair loss</h2>
<ul><li>Listed as a side effect: 3% on semaglutide 2.4 mg and 4–5% on tirzepatide, versus 1% on placebo.</li><li>If it worries you, see your GP. Iron, thyroid and other causes can be checked. See <a href="/hair-loss/">hair loss</a>.</li></ul>
<h2>“Ozempic face”</h2>
<ul><li>Not a medical term. It describes loss of facial fat and fullness after fast weight loss from any cause, including surgery.</li><li>It isn’t a direct drug effect and isn’t harmful. Slower weight loss, enough protein, sun protection and good skin care may help.</li></ul>
<h2>How long to take it</h2>
<ul><li>Weight loss builds over about 68–72 weeks in the main trials.</li><li>Weight usually returns after stopping. See <a href="/glp-1/stopping/">stopping and weight regain</a>.</li><li>How long to continue is a decision for you and your doctor, weighing benefits, side effects and cost.</li></ul>
<h2>When it doesn’t work as hoped</h2>
<ul><li>Results vary. In STEP 1, 86% of people on semaglutide lost at least 5% of their weight, so about 1 in 7 didn’t.</li><li>In SURMOUNT-1, 85–91% on tirzepatide lost at least 5%, depending on dose.</li><li>If you’re not responding, your doctor can review the dose, other medicines and other options.</li></ul>
""",
urgent=URGENT_GI,
faqs=[
("Can I drink alcohol on Ozempic or Mounjaro?", "There’s no direct interaction described, but alcohol can worsen nausea and reflux, and with insulin or a sulfonylurea it raises the risk of low blood sugar. Many people find they want less."),
("Does Ozempic cause hair loss?", "It’s a listed side effect but uncommon: 3% on semaglutide 2.4 mg versus 1% on placebo in the trials, and 4–5% on tirzepatide."),
("Is “Ozempic face” permanent?", "Facial fat loss tends to stay if the weight stays off. It isn’t harmful, and slower weight loss may make it less noticeable."),
("How long do I need to take a GLP-1 medicine?", "The benefits last only while you take it, and most people regain weight after stopping. How long to continue is a decision for you and your doctor."),
("What if a GLP-1 medicine doesn’t work for me?", "Some people lose much less than average. About 1 in 7 people on semaglutide in STEP 1 lost less than 5% of their weight. Your doctor can review your treatment and other options."),
],
sources=[
S_ADV,
("https://www.drugs.com/medical-answers/you-drink-alcohol-ozempic-what-risks-3580375", "Drugs.com: Drinking alcohol on Ozempic, what are the risks?"),
("https://epocrates.com/online/article/semaglutide-reduces-alcohol-consumption-cravings-in-randomized-trial", "Epocrates: Hendershot et al, JAMA Psychiatry 2025, semaglutide in alcohol use disorder"),
S_WEG, S_ZEP,
("https://health.clevelandclinic.org/ozempic-face", "Cleveland Clinic: What is “Ozempic face”?"),
S_STEP1,
],
related=[HUB_R, ("/glp-1/stopping/", "Guide", "Stopping and weight regain"), ("/glp-1/side-effects/", "Guide", "GLP-1 side effects"), ("/hair-loss/", "Fact sheet", "Hair loss"), CMP_R],
),
]

HUB = dict(
title="GLP-1 Medicines Guide: Ozempic, Wegovy and Mounjaro",
h1="GLP-1 medicines: the evidence, minus the hype",
desc="GLP-1 medicines explained: how semaglutide (Ozempic, Wegovy) and tirzepatide (Mounjaro) work, who they’re for, side effects, stopping, PBS cost and safety.",
lede="Semaglutide (Ozempic, Wegovy), tirzepatide (Mounjaro) and their relatives copy gut hormones that control blood sugar and appetite. They’re genuinely effective. They’re also not magic, not cheating, and not for everyone.",
qa="GLP-1 medicines are weekly injections (and some tablets) that copy gut hormones, lowering blood sugar and appetite. They’re used for type 2 diabetes and, for some brands, weight management. In the main trials, people lost about 15% (semaglutide) to 21% (tirzepatide) of their weight. Gut side effects are common, and weight usually returns after stopping.",
intro="""
<h2>What they are</h2>
<ul><li><b>Semaglutide:</b> Ozempic (type 2 diabetes) and Wegovy (weight management).</li><li><b>Tirzepatide:</b> Mounjaro. It copies two gut hormones, GIP and GLP-1.</li><li><b>Older relatives:</b> liraglutide and dulaglutide (Trulicity).</li><li>Brand names are listed so you can recognise them, not as a recommendation.</li></ul>
<h2>How they work</h2>
<ul><li>They boost insulin when blood sugar is high.</li><li>They slow stomach emptying, so you feel full sooner and for longer.</li><li>They act on the brain’s appetite centres, turning down hunger and “food noise”.</li></ul>
<h2>Who they’re for</h2>
<ul><li><b>Type 2 diabetes</b>, alongside diet and activity.</li><li><b>Weight management</b> in adults with obesity, or overweight with a weight-related condition (trials enrolled people with a BMI of 30 or more, or 27 or more with a related condition).</li><li><b>Heart protection:</b> in SELECT, semaglutide cut heart attacks, strokes and heart deaths by 20% (6.5% vs 8.0%) in people with heart disease and overweight but no diabetes.</li><li><b>Sleep apnoea</b> with obesity: tirzepatide is TGA-approved for this.</li><li><b>Not for:</b> pregnancy or breastfeeding, or people with a personal or family history of medullary thyroid cancer or MEN 2.</li></ul>
<h2>What results look like</h2>
<ul><li><b>Semaglutide 2.4 mg (STEP 1):</b> 14.9% average weight loss vs 2.4% on placebo over 68 weeks.</li><li><b>Tirzepatide (SURMOUNT-1):</b> 15.0–20.9% vs 3.1% over 72 weeks, depending on dose.</li><li><b>Head to head (SURMOUNT-5):</b> 20.2% on tirzepatide vs 13.7% on semaglutide. Full comparison: <a href="/compare/ozempic-vs-mounjaro/">semaglutide vs tirzepatide</a>.</li><li>These are averages. Some people lose much more, some much less.</li></ul>
""",
after="""
<p class="callout"><b>Not a miracle, not cheating.</b> It’s a hormone medicine for a long-term condition. It turns down hunger; protein, sleep, movement and follow-up still do a lot of the work. Whether one suits you is a conversation with your doctor.</p>
<h2>More on Malady Wise</h2>
<ul><li><a href="/medicines/glp1-medicines/">GLP-1 medicines compared</a>: every brand, its uses and the full side-effect list.</li><li><a href="/medicines/semaglutide/">Semaglutide</a> and <a href="/medicines/tirzepatide/">tirzepatide</a> medicine guides.</li><li><a href="/medicines/weight-loss-medicines/">Weight-loss medicines</a>, including non-GLP-1 options.</li><li>Fact sheets: <a href="/weight/">weight and obesity</a>, <a href="/type-2-diabetes/">type 2 diabetes</a>, <a href="/prediabetes/">prediabetes</a>, <a href="/fatty-liver/">fatty liver</a>.</li><li>Tool: <a href="/tools/bmi-calculator/">BMI calculator</a>.</li></ul>
""",
faqs=[
("What is a GLP-1 medicine?", "A medicine that copies GLP-1, a gut hormone released after eating. It boosts insulin when blood sugar is high, slows stomach emptying and reduces appetite. Semaglutide, tirzepatide, liraglutide and dulaglutide are examples."),
("Is Ozempic the same as Wegovy?", "Both contain semaglutide. Ozempic is used for type 2 diabetes and Wegovy for weight management."),
("Which GLP-1 medicine causes the most weight loss?", "On current evidence, tirzepatide. In the head-to-head SURMOUNT-5 trial, people lost 20.2% of their weight on tirzepatide versus 13.7% on semaglutide over 72 weeks."),
("Do I have to take a GLP-1 medicine forever?", "The benefits last only while you take it. In trials, most people regained much of the weight within a year of stopping. How long to continue is a decision for you and your doctor."),
("Are GLP-1 medicines on the PBS?", "Only for type 2 diabetes (Ozempic and Trulicity, when criteria are met) as of November 2026. None are subsidised for weight loss, and Mounjaro isn’t on the PBS for any use."),
],
sources=[S_STEP1, S_SURM1, S_SURM5, S_SELECT, S_TGA_OC, S_WEG],
)
