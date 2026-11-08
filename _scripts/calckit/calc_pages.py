"""Page text for the calculators. Built by build.py. Australian/British spelling; no dosing beyond general statements."""

FMT = 'function fmt(s){return new Date(s+"T00:00:00Z").toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short",year:"numeric",timeZone:"UTC"});}'

# ---------------- pregnancy dating (shared engine, two pages) ----------------
def preg_form(methods, default):
    labels = {"lmp": "First day of last period (LMP)", "conception": "Conception date", "ivf3": "IVF: day-3 embryo transfer",
              "ivf5": "IVF: day-5 embryo transfer (blastocyst)", "edd": "I know my due date"}
    opts = "".join(f'<option value="{m}"{" selected" if m == default else ""}>{labels[m]}</option>' for m in methods)
    return f'''<form class="form" id="cx-form" onsubmit="return false" autocomplete="off">
<label class="full">Calculate from<select id="cx-m">{opts}</select></label>
<label><span id="cx-dl">First day of your last period</span><input id="cx-d" type="date" min="2020-01-01" max="2035-12-31"></label>
<label id="cx-cw">Usual cycle length (days)<input id="cx-c" type="number" inputmode="numeric" min="20" max="45" step="1" value="28"><small>Day 1 of one period to day 1 of the next. 28 if unsure.</small></label>
</form>'''

def preg_js(headline):
    return FMT + '''
(function () {
  var C = MWCalc, $ = function (i) { return document.getElementById(i); };
  var m = $("cx-m"), d = $("cx-d"), c = $("cx-c"), cw = $("cx-cw"), out = $("cx-out"), lab = $("cx-dl");
  var L = { lmp: "First day of your last period", conception: "Conception date", ivf3: "Day-3 embryo transfer date", ivf5: "Day-5 embryo transfer date", edd: "Your due date" };
  var TRI = ["Not pregnant yet by these dates", "First trimester (up to 13 weeks 6 days)", "Second trimester (14 to 27 weeks)", "Third trimester (28 weeks on)"];
  var HEAD = "''' + headline + '''";
  function run() {
    lab.textContent = L[m.value]; cw.hidden = m.value !== "lmp";
    if (!d.value) { out.innerHTML = '<p class="meta">Choose a date to see your results.</p>'; return; }
    var r = C.dueDate({ method: m.value, date: d.value, cycle: c.value });
    if (r.error) { out.innerHTML = '<p class="warn">' + r.error + '</p>'; return; }
    var ga = r.gaDays >= 0 ? r.weeks + " weeks " + r.days + " day" + (r.days === 1 ? "" : "s") : "Not yet pregnant by these dates";
    var due = '<div class="res"><h2>Estimated due date</h2><p class="cxbig">' + fmt(r.edd) + '</p><p>' +
      (r.daysToGo > 0 ? r.daysToGo + " days to go." : r.daysToGo === 0 ? "That’s today." : "That date has passed.") +
      ' Only a small share of babies arrive on their due date; any time from 37 weeks is term.</p></div>';
    var now = '<div class="res"><h2>How far along today</h2><p class="cxbig">' + ga + '</p><p>' + TRI[r.trimester] +
      '. Pregnancy weeks are counted from the first day of the last period, about 2 weeks before conception.</p></div>';
    var h = (r.warn ? '<p class="warn">' + r.warn + '</p>' : '') + (HEAD === "weeks" ? now + due : due + now);
    var ms = r.milestones.map(function (x) {
      var when = x.from === x.to ? fmt(x.from) : fmt(x.from) + " to " + fmt(x.to);
      var tag = x.status === "now" ? " · now" : x.status === "past" ? " · passed" : "";
      return '<li class="' + x.status + '"><b>' + x.name + '</b><span>' + x.when + ': ' + when + tag + '</span></li>';
    }).join("");
    h += '<div class="res"><h2>Your key dates (Australian timing)</h2><ul class="ms">' + ms + '</ul><p class="meta">Your midwife, GP or obstetrician may suggest different timing. An early ultrasound can change your due date.</p></div>';
    out.innerHTML = h;
  }
  [m, d, c].forEach(function (el) { el.addEventListener("input", run); el.addEventListener("change", run); });
  run();
})();'''

PREG_SOURCES = [
    ("ACOG Committee Opinion 700: Methods for estimating the due date (2017, reaffirmed)", "https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date", "280 days from LMP; IVF: transfer + 263 days (day-3 embryo) or + 261 days (day-5 embryo); when an early scan should change the due date"),
    ("Australian Government Department of Health: Pregnancy timeline fact sheet (2025)", "https://www.health.gov.au/sites/default/files/2025-09/fact-sheet-pregnancy-timeline.pdf", "dating scan 8 to 14 weeks; morphology 18 to 20 weeks; glucose test 24 to 28 weeks"),
    ("ADIPS 2025 consensus recommendations on gestational diabetes (Med J Aust)", "https://www.mja.com.au/journal/2025/223/3/australasian-diabetes-pregnancy-society-adips-2025-consensus-recommendations", "75 g glucose tolerance test at 24 to 28 weeks; earlier testing for some"),
    ("RACGP, Australian Family Physician: Noninvasive prenatal testing", "https://www.racgp.org.au/afp/2014/july/noninvasive-prenatal-testing", "NIPT from 10 weeks; combined first trimester screening at 11 to 13 weeks"),
    ("Australian Immunisation Handbook: vaccines recommended in pregnancy", "https://immunisationhandbook.health.gov.au/resources/handbook-tables/table-vaccines-that-are-routinely-recommended-in-pregnancy-inactivated", "whooping cough ideally 20 to 32 weeks; RSV (Abrysvo) 28 to 36 weeks; flu vaccine at any stage"),
    ("Pregnancy, Birth and Baby: checkups, scans and tests", "https://www.pregnancybirthbaby.org.au/pregnancy/antenatal-care-and-tests/checkups-scans-and-tests-during-pregnancy", ""),
]

PREG_DOCTOR = '''<h2>When to get help</h2>
<p>Call your midwife, GP, maternity unit or <a href="tel:000">000</a> straight away for:</p>
<ul>
<li>Bleeding from the vagina, or fluid leaking</li>
<li>Strong or ongoing tummy pain</li>
<li>A bad headache, blurred vision, or sudden swelling of the face or hands</li>
<li>A fever, or feeling very unwell</li>
<li>Your baby moving less than usual, or a change in the pattern of movements, later in pregnancy</li>
</ul>
<p>In Australia, the free <a href="https://www.pregnancybirthbaby.org.au/" rel="noopener">Pregnancy, Birth and Baby</a> helpline is <a href="tel:1800882436">1800 882 436</a> (7am to midnight AET, every day).</p>'''

PREG_KEYDATES = '''<h2>Key dates in pregnancy (Australia)</h2>
<ul>
<li><b>Dating ultrasound:</b> 8 to 14 weeks, mainly to confirm the due date, especially if your period dates are unsure.</li>
<li><b>NIPT (non-invasive prenatal testing):</b> an optional blood test from 10 weeks that screens for some chromosome conditions. It isn’t covered by Medicare, so there’s usually a private cost.</li>
<li><b>Combined first trimester screening:</b> an optional blood test plus a scan of the back of the baby’s neck, at about 11 to 13 weeks.</li>
<li><b>Morphology (anatomy) scan:</b> 18 to 20 weeks, to check how the baby and placenta are developing.</li>
<li><b>Whooping cough vaccine:</b> ideally 20 to 32 weeks of every pregnancy. The flu vaccine can be given at any stage.</li>
<li><b>Glucose tolerance test:</b> 24 to 28 weeks, to check for gestational diabetes. Some people are tested earlier.</li>
<li><b>RSV vaccine:</b> from 28 weeks, preferably by the end of 36 weeks, to protect the baby in the first months of life.</li>
<li><b>Term:</b> babies born from 37 weeks are term. The due date is 40 weeks.</li>
</ul>'''

DUE = dict(
    path="/tools/due-date-calculator/", crumb="Due date calculator", kind="Calculator",
    title="Due Date Calculator: From Your Period or IVF",
    h1="Due date calculator",
    desc="Free pregnancy due date calculator: works from your last period (with cycle length), conception date or IVF transfer, plus Australian scan and test dates.",
    about={"@type": "MedicalCondition", "name": "Pregnancy"},
    lede="Work out your estimated due date from the first day of your last period, your conception date, or an IVF embryo transfer. You’ll also see how many weeks pregnant you are and when the usual Australian scans and tests fall.",
    callout="<b>An estimate, not a diagnosis.</b> An early ultrasound is the most accurate way to date a pregnancy, and your midwife or doctor may change your due date after one. Nothing you enter leaves this device.",
    form=preg_form(["lmp", "conception", "ivf5", "ivf3"], "lmp"),
    empty="Choose a date to see your due date.",
    js=preg_js("due"),
    body='''<h2>How this due date is worked out</h2>
<ul>
<li><b>From your last period (Naegele’s rule):</b> due date = first day of your last menstrual period (LMP) + 280 days (40 weeks). This assumes a 28-day cycle with ovulation around day 14.</li>
<li><b>Longer or shorter cycles:</b> ovulation shifts later or earlier, so the calculator adds or takes away the difference from 28 days. A 35-day cycle moves the due date 7 days later.</li>
<li><b>From conception:</b> due date = conception date + 266 days (38 weeks).</li>
<li><b>After IVF:</b> the embryo’s age is known, so the due date = transfer date + 261 days for a day-5 embryo (blastocyst), or + 263 days for a day-3 embryo.</li>
<li><b>Ultrasound wins:</b> if an early scan (before 14 weeks) differs from your period dates by more than about a week, the scan date is usually used instead.</li>
</ul>
<p>Pregnancy is counted from the first day of the last period, about 2 weeks before conception. So at “4 weeks pregnant”, the embryo is about 2 weeks old.</p>
''' + PREG_KEYDATES + PREG_DOCTOR,
    faqs=[
        ("How is my due date calculated?", "Most calculators, including this one, use Naegele’s rule: the first day of your last period plus 280 days (40 weeks), adjusted if your cycle is longer or shorter than 28 days. If you know your conception or IVF transfer date, the calculator uses that instead."),
        ("How accurate is a due date calculator?", "It gives a good estimate if your periods are regular and you’re sure of the date. Only a small share of babies arrive on the due date itself; birth any time from 37 weeks is term. An early ultrasound (before 14 weeks) is the most accurate way to date a pregnancy."),
        ("How do I work out my due date after IVF?", "Use the transfer date and the embryo’s age. For a day-5 embryo (blastocyst), add 261 days. For a day-3 embryo, add 263 days. Your fertility clinic will also give you a due date."),
        ("What if my cycle is longer than 28 days?", "Ovulation usually happens later in a longer cycle, so your due date moves later too. This calculator adds the extra days: a 35-day cycle makes the due date 7 days later than the standard rule. If your cycles are irregular, an early dating scan is more reliable."),
        ("When is the dating scan in Australia?", "Usually between 8 and 14 weeks of pregnancy. It confirms how far along you are, checks for twins, and can change your due date if it differs from your period dates."),
    ],
    sources=PREG_SOURCES,
    related=[("Calculator", "Pregnancy week calculator", "/tools/pregnancy-week-calculator/"), ("Calculator", "Ovulation calculator", "/tools/ovulation-calculator/"),
             ("Calculator", "BMI calculator", "/tools/bmi-calculator/"), ("Tools", "All tools", "/tools/")],
)

WEEK = dict(DUE)
WEEK.update(
    path="/tools/pregnancy-week-calculator/", crumb="Pregnancy week calculator",
    title="Pregnancy Week Calculator: How Many Weeks?",
    h1="How many weeks pregnant am I?",
    desc="Free pregnancy week calculator: see how many weeks and days pregnant you are today, your trimester, due date and upcoming Australian scans and tests.",
    lede="Find out how many weeks and days pregnant you are today, which trimester you’re in and what’s coming up next. Start from your last period, your due date, conception or an IVF transfer.",
    form=preg_form(["lmp", "edd", "conception", "ivf5", "ivf3"], "lmp"),
    empty="Choose a date to see how many weeks pregnant you are.",
    js=preg_js("weeks"),
    body='''<h2>How pregnancy weeks are counted</h2>
<ul>
<li><b>From the last period:</b> week 1 starts on the first day of your last menstrual period, about 2 weeks before conception. So the first two “weeks” happen before you’re actually pregnant.</li>
<li><b>Weeks and days:</b> “12 weeks 3 days” (often written 12+3) means 12 full weeks and 3 days have passed since that date.</li>
<li><b>From a due date:</b> the calculator counts back 280 days (40 weeks) to find day 0, then counts forward to today.</li>
<li><b>After IVF:</b> the embryo’s age sets the dates. Transfer of a day-5 embryo counts as 2 weeks 5 days pregnant; a day-3 embryo as 2 weeks 3 days.</li>
</ul>
<h2>Trimesters</h2>
<ul>
<li><b>First trimester:</b> up to 13 weeks 6 days. Tiredness and nausea are common; this is when dating and screening tests happen.</li>
<li><b>Second trimester:</b> 14 weeks to 27 weeks 6 days. Many people feel the first movements between about 16 and 24 weeks.</li>
<li><b>Third trimester:</b> 28 weeks to birth. Term starts at 37 weeks; the due date is 40 weeks.</li>
</ul>
''' + PREG_KEYDATES + PREG_DOCTOR,
    faqs=[
        ("How do I work out how many weeks pregnant I am?", "Count from the first day of your last period: the number of full weeks since then is how many weeks pregnant you are. If you know your due date, count back 40 weeks to find the start, then forward to today. This calculator does both."),
        ("Why does pregnancy count from my last period, not conception?", "Most people know when their period started but not exactly when they conceived. Counting from the last period is a simple standard, so “weeks pregnant” is about 2 weeks more than the baby’s actual age."),
        ("When does the second trimester start?", "At 14 weeks. The first trimester runs to 13 weeks 6 days, the second from 14 to 27 weeks 6 days, and the third from 28 weeks to birth."),
        ("How many weeks is full term?", "Babies born from 37 weeks are term. The due date is 40 weeks, and most babies are born between 37 and 42 weeks."),
        ("Is 40 weeks the same as 9 months?", "Roughly. 40 weeks from the last period is about 9 months and 1 week, but because counting starts 2 weeks before conception, the baby has been growing for about 38 weeks."),
    ],
    related=[("Calculator", "Due date calculator", "/tools/due-date-calculator/"), ("Calculator", "Ovulation calculator", "/tools/ovulation-calculator/"),
             ("Tools", "All tools", "/tools/")],
)
WEEK["body"] = WEEK["body"].replace("Many people feel the first movements between about 16 and 24 weeks.", "First movements are often felt around this time.")

# ---------------- ovulation ----------------
OVU = dict(
    path="/tools/ovulation-calculator/", crumb="Ovulation calculator", kind="Calculator",
    title="Ovulation Calculator: Your Fertile Window",
    h1="Ovulation calculator",
    desc="Free ovulation calculator: estimate your fertile window and ovulation date for the next 3 cycles from your period and cycle length, with honest caveats.",
    about={"@type": "MedicalCondition", "name": "Infertility"},
    lede="Estimate your most fertile days for the next three cycles from the first day of your last period and your usual cycle length.",
    callout="<b>A rough guide only.</b> Ovulation often moves from cycle to cycle, even when periods are regular. Don’t use this calculator as contraception. Nothing you enter leaves this device.",
    form='''<form class="form" id="cx-form" onsubmit="return false" autocomplete="off">
<label>First day of last period<input id="cx-d" type="date" min="2020-01-01" max="2035-12-31"></label>
<label>Usual cycle length (days)<input id="cx-c" type="number" inputmode="numeric" min="21" max="45" step="1" value="28"><small>Day 1 of one period to day 1 of the next</small></label>
<label class="full">Luteal phase (days, optional)<input id="cx-l" type="number" inputmode="numeric" min="10" max="16" step="1" value="14"><small>Time from ovulation to your next period. Leave at 14 if you don’t know it.</small></label>
</form>''',
    empty="Choose the first day of your last period.",
    js=FMT + '''
(function () {
  var C = MWCalc, $ = function (i) { return document.getElementById(i); };
  var d = $("cx-d"), c = $("cx-c"), l = $("cx-l"), out = $("cx-out");
  function run() {
    if (!d.value) { out.innerHTML = '<p class="meta">Choose the first day of your last period.</p>'; return; }
    var r = C.ovulation({ lmp: d.value, cycle: c.value, luteal: l.value });
    if (r.error) { out.innerHTML = '<p class="warn">' + r.error + '</p>'; return; }
    var f = r.cycles[0];
    var h = '<div class="res"><h2>Most fertile days this cycle</h2><p class="cxbig">' + fmt(f.fertileFrom) + ' to ' + fmt(f.fertileTo) + '</p>' +
      '<p>Estimated ovulation: <b>' + fmt(f.ovulation) + '</b> (cycle day ' + r.ovDay + '). The two days before ovulation and the day itself are the most fertile. Next period due about ' + fmt(f.nextPeriod) + '.</p></div>';
    h += '<div class="res"><h2>Next cycles</h2><ul class="ms">' + r.cycles.slice(1).map(function (x) {
      return '<li><b>Fertile ' + fmt(x.fertileFrom) + ' to ' + fmt(x.fertileTo) + '</b><span>Ovulation about ' + fmt(x.ovulation) + ' · period due about ' + fmt(x.nextPeriod) + '</span></li>';
    }).join("") + '</ul><p class="meta">Later cycles are less certain: small changes add up.</p></div>';
    out.innerHTML = h;
  }
  [d, c, l].forEach(function (el) { el.addEventListener("input", run); el.addEventListener("change", run); });
  run();
})();''',
    body='''<h2>How it works</h2>
<ul>
<li><b>Ovulation</b> usually happens about 14 days before the next period (this second half of the cycle, the luteal phase, is fairly steady at 10 to 16 days). So in a 28-day cycle it’s around day 14, and in a 32-day cycle around day 18.</li>
<li><b>The fertile window</b> is 6 days: the 5 days before ovulation plus ovulation day. Sperm can survive several days, but an egg lasts only about a day.</li>
<li>In a landmark study of 221 women trying to conceive, almost every pregnancy came from sex in that 6-day window. The chance of pregnancy was highest from sex in the 2 days before and on the day of ovulation (about 1 in 3 on the day itself).</li>
</ul>
<h2>Why calculators get it wrong (and what helps)</h2>
<ul>
<li>The same study team found the fertile window was entirely within days 10 to 17 for only about 30% of women. Many ovulate earlier or later, and it varies even when periods are regular.</li>
<li><b>Ovulation (LH) urine tests</b> detect the hormone surge that comes 1 to 2 days before ovulation.</li>
<li><b>Cervical mucus</b> that becomes clear, stretchy and slippery (like raw egg white) is a sign that ovulation is near.</li>
<li><b>Basal body temperature</b> rises slightly after ovulation, so it confirms ovulation has happened rather than predicting it.</li>
<li>If you’re trying for a baby, having sex every 2 to 3 days through the cycle avoids the guesswork.</li>
</ul>
<h2>When to see a doctor</h2>
<ul>
<li>You’re under 35 and have been trying for 12 months, or 35 or over and trying for 6 months.</li>
<li>Your periods are irregular, very far apart (more than about 35 days), very painful, or have stopped.</li>
<li>You or your partner know of a possible fertility problem (for example endometriosis, PCOS, past pelvic infection, or cancer treatment). See your GP straight away rather than waiting.</li>
<li>Before trying: your GP can talk about folic acid, iodine, vaccinations, medicines and a health check.</li>
</ul>''',
    faqs=[
        ("How many days after my period do I ovulate?", "In a 28-day cycle, ovulation is usually around day 14, counting the first day of your period as day 1. In longer cycles it’s later and in shorter cycles earlier, because the time from ovulation to the next period stays fairly constant at about 14 days."),
        ("How long is the fertile window?", "About 6 days: the 5 days before ovulation and ovulation day itself. The 2 days before ovulation and the day of ovulation give the best chance of pregnancy."),
        ("Can I get pregnant outside my fertile window?", "It’s unlikely on any given day, but ovulation often comes earlier or later than calculators predict, even with regular periods. So a calculator can’t tell you which days are safe."),
        ("Can I use an ovulation calculator as contraception?", "No. Calendar estimates alone aren’t reliable enough to prevent pregnancy. Talk to your GP or a sexual health clinic about effective contraception."),
        ("How long should we try before seeing a doctor?", "See your GP if you’re under 35 and have been trying for 12 months, or 35 or over and trying for 6 months. Go sooner if you have irregular periods or know of a possible fertility problem."),
    ],
    sources=[
        ("Wilcox AJ et al. Timing of sexual intercourse in relation to ovulation. N Engl J Med 1995", "https://doi.org/10.1056/NEJM199512073332301", "6-day fertile window ending on ovulation day; conception chance about 0.10 five days before to 0.33 on the day"),
        ("Wilcox AJ et al. The timing of the “fertile window” in the menstrual cycle. BMJ 2000", "https://doi.org/10.1136/bmj.321.7271.1259", "only about 30% of women have the fertile window entirely within days 10 to 17"),
        ("healthdirect: About infertility", "https://www.healthdirect.gov.au/about-infertility", "when to see a doctor (12 months under 35, 6 months over 35)"),
    ],
    related=[("Calculator", "Due date calculator", "/tools/due-date-calculator/"), ("Fact sheet", "PCOS", "/pcos/"), ("Fact sheet", "Endometriosis", "/endometriosis/"),
             ("Fact sheet", "Heavy periods", "/heavy-periods/")],
)

# ---------------- BMI ----------------
BMI = dict(
    path="/tools/bmi-calculator/", crumb="BMI calculator", kind="Calculator",
    title="BMI Calculator for Adults (kg, cm, stones, feet)",
    h1="BMI calculator for adults",
    desc="Free adult BMI calculator in metric or imperial units, with WHO categories, lower cut-offs for Asian and other backgrounds, waist size and your healthy weight range.",
    about={"@type": "MedicalCondition", "name": "Obesity"},
    lede="Work out your body mass index (BMI) in kilograms and centimetres, or stones, pounds, feet and inches. Add your waist size for a better picture of health risk.",
    callout="<b>For adults 18 and over.</b> BMI is a quick screening number, not a diagnosis, and it can’t tell muscle from fat. It isn’t used for children or during pregnancy. Nothing you enter leaves this device.",
    form='''<form class="form" id="cx-form" onsubmit="return false" autocomplete="off">
<div class="chips" role="group" aria-label="Units">Units: <button type="button" class="chip" data-u="m" aria-pressed="true">kg and cm</button><button type="button" class="chip" data-u="i" aria-pressed="false">stones/lb and feet</button></div>
<label class="um">Weight (kg)<input id="cx-kg" type="number" inputmode="decimal" min="20" max="350" step="0.1" placeholder="e.g. 72"></label>
<label class="um">Height (cm)<input id="cx-cm" type="number" inputmode="decimal" min="100" max="250" step="0.1" placeholder="e.g. 170"></label>
<label class="ui" hidden>Weight<span class="row"><input id="cx-st" type="number" inputmode="decimal" min="0" max="55" step="1" placeholder="st" aria-label="Stones"><input id="cx-lb" type="number" inputmode="decimal" min="0" max="700" step="0.1" placeholder="lb" aria-label="Pounds"></span><small>Stones and pounds, or pounds only</small></label>
<label class="ui" hidden>Height<span class="row"><input id="cx-ft" type="number" inputmode="numeric" min="3" max="8" step="1" placeholder="ft" aria-label="Feet"><input id="cx-in" type="number" inputmode="decimal" min="0" max="11.9" step="0.1" placeholder="in" aria-label="Inches"></span></label>
<label>Age (years)<input id="cx-age" type="number" inputmode="numeric" min="2" max="120" step="1" placeholder="18 or over"></label>
<label>Sex (for waist cut-offs)<select id="cx-sex"><option value="">Choose</option><option value="f">Female</option><option value="m">Male</option></select></label>
<label class="full">Waist (optional, <span id="cx-wu">cm</span>)<input id="cx-w" type="number" inputmode="decimal" min="15" max="250" step="0.1" placeholder="Measure halfway between lowest rib and hip bone"></label>
<div class="checks"><label><input type="checkbox" id="cx-as"> I’m of South Asian, Chinese, other Asian, Middle Eastern, Black African or African-Caribbean background (lower cut-offs apply)</label></div>
</form>''',
    empty="Enter your weight and height.",
    js='''(function () {
  var C = MWCalc, $ = function (i) { return document.getElementById(i); }, unit = "m";
  var out = $("cx-out"), ids = ["cx-kg", "cx-cm", "cx-st", "cx-lb", "cx-ft", "cx-in", "cx-age", "cx-sex", "cx-w", "cx-as"];
  var BANDS = [["Under 18.5", "Underweight"], ["18.5 to 24.9", "Healthy weight"], ["25 to 29.9", "Overweight"], ["30 to 34.9", "Obesity class I"], ["35 to 39.9", "Obesity class II"], ["40 or more", "Obesity class III"]];
  var ABANDS = [["Under 18.5", "Underweight"], ["18.5 to 22.9", "Healthy weight"], ["23 to 27.4", "Increased risk"], ["27.5 or more", "High risk"]];
  function n1(x) { return (Math.round(x * 10) / 10).toLocaleString("en-AU"); }
  document.querySelectorAll("#cx-form .chip").forEach(function (b) {
    b.addEventListener("click", function () {
      unit = b.dataset.u;
      document.querySelectorAll("#cx-form .chip").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      document.querySelectorAll("#cx-form .um").forEach(function (x) { x.hidden = unit !== "m"; });
      document.querySelectorAll("#cx-form .ui").forEach(function (x) { x.hidden = unit !== "i"; });
      $("cx-wu").textContent = unit === "m" ? "cm" : "inches";
      run();
    });
  });
  function run() {
    var kg, cm, w = parseFloat($("cx-w").value);
    if (unit === "m") { kg = parseFloat($("cx-kg").value); cm = parseFloat($("cx-cm").value); }
    else {
      kg = C.stLbToKg($("cx-st").value, $("cx-lb").value); cm = C.ftInToCm($("cx-ft").value, $("cx-in").value);
      if (w) w = w * 2.54;
    }
    var age = parseFloat($("cx-age").value), asian = $("cx-as").checked, sex = $("cx-sex").value;
    if (!(kg > 0) || !(cm > 0)) { out.innerHTML = '<p class="meta">Enter your weight and height.</p>'; return; }
    if (age > 0 && age < 18) {
      out.innerHTML = '<div class="res"><h2>BMI works differently for children and teens</h2><p>Under 18, BMI is compared with growth charts for age and sex, so adult categories don’t apply. Ask your GP or child health nurse, or see the <a href="https://www.who.int/tools/growth-reference-data-for-5to19-years">WHO growth reference for 5 to 19 years</a>.</p></div>';
      return;
    }
    var r = C.bmi({ kg: kg, cm: cm, waist: w || null, sex: sex });
    if (r.error) { out.innerHTML = '<p class="warn">' + r.error + '</p>'; return; }
    var cat = asian ? r.asianCategory : r.category;
    var range = unit === "m" ? n1(r.healthyFrom) + " to " + n1(r.healthyTo) + " kg" : n1(r.healthyFrom / 6.35029318) + " to " + n1(r.healthyTo / 6.35029318) + " stone";
    var h = '<div class="res"><h2>Your BMI</h2><p class="cxbig">' + n1(r.bmi) + '</p><p><b>' + cat + '</b>' + (asian ? ' (lower cut-offs for your background)' : ' (WHO adult categories)') + '.</p>' +
      '<p>A BMI of 18.5 to 24.9 at your height is ' + range + '.' + (asian ? ' For your background, risk starts to rise from a BMI of 23.' : '') + '</p></div>';
    if (r.waist) {
      h += '<div class="res"><h2>Waist</h2><p class="cxbig">' + r.waist + '</p><p>' + (sex ? '' : '<span class="warn">Choose your sex for the right cut-off.</span> ') +
        'Waist-to-height ratio ' + r.whtr.toFixed(2) + (r.whtr >= 0.5 ? ': 0.5 or more suggests extra fat around the middle.' : ': under 0.5 is the usual target.') + '</p></div>';
    }
    var list = asian ? ABANDS : BANDS;
    h += '<ul class="bands">' + list.map(function (b) { return '<li class="' + (b[1] === cat ? "on" : "") + '"><b>' + b[0] + '</b>' + b[1] + '</li>'; }).join("") + '</ul>';
    if (r.bmi >= 25 || (asian && r.bmi >= 23) || r.bmi < 18.5) h += '<p class="meta">Worth a chat with your GP, who can check blood pressure, blood sugar and cholesterol and talk about options that suit you.</p>';
    out.innerHTML = h;
  }
  ids.forEach(function (i) { var el = $(i); el.addEventListener("input", run); el.addEventListener("change", run); });
  run();
})();''',
    body='''<h2>What your BMI means</h2>
<p>BMI = weight in kilograms ÷ (height in metres)². For example, 70 kg and 1.75 m gives 70 ÷ (1.75 × 1.75) = 22.9.</p>
<ul>
<li><b>Under 18.5:</b> underweight</li>
<li><b>18.5 to 24.9:</b> healthy weight</li>
<li><b>25 to 29.9:</b> overweight</li>
<li><b>30 to 34.9:</b> obesity class I</li>
<li><b>35 to 39.9:</b> obesity class II</li>
<li><b>40 or more:</b> obesity class III</li>
</ul>
<h2>Lower cut-offs for some backgrounds</h2>
<ul>
<li>People of Asian background tend to carry more fat around the organs, and the risk of type 2 diabetes and heart disease rises at a lower BMI. The WHO suggests action points of 23 (increased risk) and 27.5 (high risk) for many Asian populations.</li>
<li>The UK’s NICE uses 27.5 as the obesity threshold for people of South Asian, Chinese, other Asian, Middle Eastern, Black African or African-Caribbean family background.</li>
<li>The Australian Government notes that a healthy BMI may be higher for people of Polynesian background, and for older people and athletes with a lot of muscle.</li>
</ul>
<h2>Waist size matters too</h2>
<ul>
<li>Fat around the middle carries more health risk than fat elsewhere. Measure halfway between your lowest rib and the top of your hip bone, breathing out normally.</li>
<li><b>Women:</b> 80 cm or more = increased risk; 88 cm or more = greatly increased risk.</li>
<li><b>Men:</b> 94 cm or more = increased risk; 102 cm or more = greatly increased risk.</li>
<li>A simple rule: keep your waist to less than half your height.</li>
<li>Waist cut-offs don’t apply in pregnancy or to children.</li>
</ul>
<h2>Limits of BMI</h2>
<ul>
<li>It doesn’t separate muscle from fat, so very muscular people can score “overweight” while being healthy.</li>
<li>It doesn’t show where fat sits, which is why waist size helps.</li>
<li>It isn’t used for children and teenagers (growth charts are used instead) or in pregnancy.</li>
<li>Your health is more than a number: blood pressure, blood sugar, cholesterol, fitness, sleep and how you feel all count.</li>
</ul>
<h2>When to see a doctor</h2>
<ul>
<li>Your BMI is under 18.5, or 25 or more (23 or more for Asian background), or your waist is above the cut-offs.</li>
<li>You’ve lost weight without trying, or gained weight quickly without a clear reason.</li>
<li>Weight is affecting your joints, sleep (snoring, daytime sleepiness), mood or fertility.</li>
<li>You’re thinking about weight-loss medicines or surgery.</li>
</ul>''',
    faqs=[
        ("What is a healthy BMI for adults?", "For most adults, 18.5 to 24.9. For people of Asian background, health risks start to rise from a BMI of 23. A healthy BMI may be a little higher for older adults and people with a lot of muscle."),
        ("How do I calculate BMI?", "Divide your weight in kilograms by your height in metres squared. For example, 70 kg and 1.75 m: 70 ÷ (1.75 × 1.75) = 22.9. This calculator also converts stones, pounds, feet and inches."),
        ("Is BMI accurate?", "It’s a useful quick screen for groups of adults but an imperfect measure for individuals, because it can’t tell muscle from fat or show where fat is stored. Waist size adds useful information."),
        ("What waist size is healthy?", "In Australia, risk increases from 80 cm for women and 94 cm for men, and is greatly increased from 88 cm for women and 102 cm for men. Keeping your waist under half your height is another good guide."),
        ("Can I use this BMI calculator for my child?", "No. For children and teenagers, BMI is compared with growth charts for their age and sex. Your GP or child health nurse can plot it for you."),
    ],
    sources=[
        ("Australian Government Department of Health: BMI and waist measurement", "https://www.health.gov.au/topics/overweight-and-obesity/bmi-and-waist", "adult BMI categories; waist cut-offs; different ranges for some groups; not for children"),
        ("WHO Expert Consultation. Appropriate body-mass index for Asian populations. Lancet 2004", "https://doi.org/10.1016/S0140-6736(03)15268-3", "action points of 23 and 27.5"),
        ("NICE: lower BMI thresholds for some ethnic groups", "https://www.nice.org.uk/guidance/ipg783/chapter/2-The-condition-current-treatments-and-procedure", "27.5 for South Asian, Chinese, other Asian, Middle Eastern, Black African or African-Caribbean backgrounds"),
        ("WHO growth reference for 5 to 19 years", "https://www.who.int/tools/growth-reference-data-for-5to19-years", "BMI for age in children and teens"),
    ],
    related=[("Fact sheet", "Weight and obesity", "/weight/"), ("Fact sheet", "Prediabetes", "/prediabetes/"),
             ("Drug", "Weight-loss medicines", "/medicines/weight-loss-medicines/"), ("Compare", "Semaglutide vs tirzepatide", "/compare/ozempic-vs-mounjaro/")],
)

# ---------------- eGFR ----------------
EGFR = dict(
    path="/tools/egfr-calculator/", crumb="eGFR calculator", kind="Clinician calculator", pro=True,
    title="eGFR Calculator: CKD-EPI 2021 (µmol/L or mg/dL)",
    h1="eGFR calculator (CKD-EPI 2021)",
    desc="eGFR calculator for health professionals: race-free CKD-EPI 2021 creatinine equation in µmol/L or mg/dL, with the 2009 equation used by Australian labs and KDIGO G stage.",
    about={"@type": "MedicalCondition", "name": "Chronic kidney disease"},
    lede="Estimated glomerular filtration rate from serum creatinine, age and sex, using the race-free CKD-EPI 2021 equation. It also shows the CKD-EPI 2009 result, which is what Australian laboratories report.",
    callout="<b>For health professionals.</b> An estimate for adults with stable kidney function. Not valid in acute kidney injury, pregnancy, or at extremes of muscle mass, diet or body size. CKD needs abnormal results for more than 3 months, plus urine albumin-to-creatinine ratio for staging. Nothing you enter leaves this device.",
    form='''<form class="form" id="cx-form" onsubmit="return false" autocomplete="off">
<label>Serum creatinine<input id="cx-s" type="number" inputmode="decimal" min="0.1" max="2200" step="any" placeholder="e.g. 85"></label>
<label>Unit<select id="cx-u"><option value="umol" selected>µmol/L (Australia, UK)</option><option value="mg">mg/dL (US)</option></select></label>
<label>Age (years)<input id="cx-a" type="number" inputmode="numeric" min="18" max="110" step="1" placeholder="18 or over"></label>
<label>Sex<select id="cx-x"><option value="">Choose</option><option value="f">Female</option><option value="m">Male</option></select><small>As used by the equation</small></label>
</form>''',
    empty="Enter creatinine, age and sex.",
    js='''(function () {
  var C = MWCalc, $ = function (i) { return document.getElementById(i); };
  var s = $("cx-s"), u = $("cx-u"), a = $("cx-a"), x = $("cx-x"), out = $("cx-out");
  var NAME = { G1: "G1: normal or high", G2: "G2: mildly decreased", G3a: "G3a: mildly to moderately decreased", G3b: "G3b: moderately to severely decreased", G4: "G4: severely decreased", G5: "G5: kidney failure" };
  function run() {
    document.querySelectorAll("#cx-bands li").forEach(function (li) { li.classList.remove("on"); });
    if (!s.value || !a.value || !x.value) { out.innerHTML = '<p class="meta">Enter creatinine, age and sex.</p>'; return; }
    var r = C.egfr({ scr: s.value, unit: u.value, age: a.value, sex: x.value });
    if (r.error) { out.innerHTML = '<p class="warn">' + r.error + '</p>'; return; }
    var h = '';
    if (u.value === "umol" && +s.value < 15) h += '<p class="warn">Check the unit: that looks like mg/dL.</p>';
    if (u.value === "mg" && +s.value > 20) h += '<p class="warn">Check the unit: that looks like µmol/L.</p>';
    h += '<div class="res"><h2>CKD-EPI 2021 (race-free)</h2><p class="cxbig">' + r.egfr2021 + ' mL/min/1.73 m²</p><p>' + NAME[r.stage2021] + '.</p></div>';
    h += '<div class="res"><h2>CKD-EPI 2009 (Australian lab equation)</h2><p class="cxbig">' + r.egfr2009 + ' mL/min/1.73 m²</p><p>' + NAME[r.stage2009] + '. Australian labs use this equation without a race term.</p></div>';
    h += '<p class="meta">Creatinine ' + (u.value === "umol" ? (Math.round(r.scrMg * 100) / 100) + ' mg/dL' : Math.round(r.scrUmol) + ' µmol/L') + ' (1 mg/dL = 88.4 µmol/L).</p>';
    out.innerHTML = h;
    var li = document.querySelector('#cx-bands li[data-g="' + r.stage2021 + '"]'); if (li) li.classList.add("on");
  }
  [s, u, a, x].forEach(function (el) { el.addEventListener("input", run); el.addEventListener("change", run); });
  run();
})();''',
    body='''<h2>GFR categories (KDIGO)</h2>
<p class="meta">The 2021 result’s category is highlighted.</p>
<ul class="bands" id="cx-bands">
<li data-g="G1"><b>G1 · 90 or more</b>Normal or high. CKD only if there’s other evidence of kidney damage, such as albuminuria.</li>
<li data-g="G2"><b>G2 · 60 to 89</b>Mildly decreased. CKD only with other markers of kidney damage.</li>
<li data-g="G3a"><b>G3a · 45 to 59</b>Mildly to moderately decreased</li>
<li data-g="G3b"><b>G3b · 30 to 44</b>Moderately to severely decreased</li>
<li data-g="G4"><b>G4 · 15 to 29</b>Severely decreased</li>
<li data-g="G5"><b>G5 · under 15</b>Kidney failure</li>
</ul>
<h2>The equations</h2>
<ul>
<li><b>CKD-EPI 2021:</b> eGFR = 142 × min(Scr/κ, 1)<sup>α</sup> × max(Scr/κ, 1)<sup>−1.200</sup> × 0.9938<sup>age</sup> × 1.012 (if female). Scr in mg/dL; κ = 0.7 (female) or 0.9 (male); α = −0.241 (female) or −0.302 (male).</li>
<li><b>CKD-EPI 2009:</b> 141 × min(Scr/κ, 1)<sup>α</sup> × max(Scr/κ, 1)<sup>−1.209</sup> × 0.993<sup>age</sup> × 1.018 (if female); α = −0.329 (female) or −0.411 (male). Shown here without the race coefficient, as reported in Australia.</li>
<li>Creatinine in µmol/L is divided by 88.4 to give mg/dL.</li>
<li>The 2021 equation was developed to remove race from eGFR. In Australian data, it gives higher values than 2009 for many older adults, so fewer would be labelled CKD stage 3. Australian laboratories still report CKD-EPI 2009.</li>
</ul>
<h2>Good to know</h2>
<ul>
<li>eGFR is indexed to 1.73 m² body surface area. Some medicine doses use creatinine clearance (Cockcroft–Gault) or absolute GFR instead: check the product information.</li>
<li>Creatinine-based eGFR can mislead with very high or low muscle mass, amputation, high meat intake or creatine supplements, and in acute illness. Cystatin C can help when in doubt.</li>
<li>Diagnosing and staging CKD needs repeat results over at least 3 months, plus urine albumin-to-creatinine ratio (uACR).</li>
<li>Consider nephrology referral for eGFR under 30, a sustained fall in eGFR, heavy albuminuria, or other concerns, as local guidance advises.</li>
</ul>''',
    faqs=[
        ("Which eGFR equation do Australian labs use?", "Australian pathology laboratories report the CKD-EPI 2009 creatinine equation, without a race coefficient. The 2021 race-free equation is used in the US and gives somewhat higher results in many older adults. This calculator shows both."),
        ("What is a normal eGFR?", "An eGFR of 90 or more is normal or high (G1), and 60 to 89 is mildly decreased (G2). On their own, these aren’t CKD unless there are other signs of kidney damage, such as albumin in the urine."),
        ("What eGFR is stage 3 kidney disease?", "Stage G3a is an eGFR of 45 to 59 and G3b is 30 to 44 mL/min/1.73 m², if it stays at that level for more than 3 months."),
        ("How do I convert creatinine from mg/dL to µmol/L?", "Multiply mg/dL by 88.4 to get µmol/L, or divide µmol/L by 88.4 to get mg/dL. For example, 1.0 mg/dL is 88.4 µmol/L."),
        ("Why was race removed from eGFR?", "Race is a social, not biological, category, and the old race multiplier could delay diagnosis and care for Black patients. The 2021 CKD-EPI equation estimates GFR from creatinine, age and sex only."),
    ],
    sources=[
        ("Inker LA et al. New creatinine- and cystatin C-based equations to estimate GFR without race. N Engl J Med 2021", "https://doi.org/10.1056/NEJMoa2102953", "CKD-EPI 2021 development and validation"),
        ("National Kidney Foundation: CKD-EPI creatinine equation (2021)", "https://www.kidney.org/professionals/KDOQI/gfr_calculator/formula", "equation coefficients"),
        ("NIDDK: previous eGFR equations (CKD-EPI 2009)", "https://www.niddk.nih.gov/research-funding/research-programs/kidney-clinical-research-epidemiology/laboratory/glomerular-filtration-rate-equations/adults/previous", "2009 coefficients"),
        ("Classification of CKD in older Australian adults: CKD-EPI 2009 and 2021 compared. Med J Aust 2025", "https://www.mja.com.au/journal/2025/222/2/classification-chronic-kidney-disease-older-australian-adults-ckd-epi-2009-and", "Australian labs use CKD-EPI 2009"),
        ("KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of CKD. Kidney Int 2024 (PubMed)", "https://pubmed.ncbi.nlm.nih.gov/38490803/", "GFR categories; CKD needs more than 3 months"),
    ],
    revnote="Education for health professionals. Check results against your laboratory report and local guidance.",
    related=[("Tools", "Iron infusion dose calculator", "/tools/iron-infusion/"), ("Calculator", "CHA₂DS₂-VASc calculator", "/tools/cha2ds2-vasc/"),
             ("Fact sheet", "Type 2 diabetes", "/type-2-diabetes/"), ("Fact sheet", "Blood pressure", "/blood-pressure/")],
)

# ---------------- CHA2DS2-VASc ----------------
ITEMS = [("chf", "Heart failure, or reduced left ventricular function", 1), ("htn", "High blood pressure (treated or untreated)", 1),
         ("dm", "Diabetes", 1), ("stroke", "Previous stroke, TIA or blood clot (thromboembolism)", 2),
         ("vasc", "Vascular disease: past heart attack, peripheral arterial disease or aortic plaque", 1)]
CHA = dict(
    path="/tools/cha2ds2-vasc/", crumb="CHA₂DS₂-VASc calculator", kind="Clinician calculator", pro=True,
    title="CHA2DS2-VASc and CHA2DS2-VA Calculator (AF)",
    h1="CHA₂DS₂-VASc and CHA₂DS₂-VA calculator",
    desc="CHA2DS2-VASc and sex-free CHA2DS2-VA stroke risk scores for atrial fibrillation, with the Australian 2018 AF guideline thresholds for anticoagulation.",
    about={"@type": "MedicalCondition", "name": "Atrial fibrillation"},
    lede="Stroke risk in non-valvular atrial fibrillation (AF). Australia’s 2018 AF guideline uses CHA₂DS₂-VA, which leaves out sex; the classic CHA₂DS₂-VASc is shown alongside.",
    callout="<b>For health professionals.</b> A decision aid, not a decision. Not for AF with moderate to severe mitral stenosis or a mechanical heart valve, where anticoagulation is indicated regardless of score. Weigh bleeding risk and patient preference. Nothing you enter leaves this device.",
    form='''<form class="form" id="cx-form" onsubmit="return false" autocomplete="off">
<label>Age (years)<input id="cx-a" type="number" inputmode="numeric" min="18" max="120" step="1" placeholder="e.g. 72"><small>65 to 74 = 1 point; 75 or over = 2</small></label>
<label>Sex<select id="cx-x"><option value="">Choose</option><option value="f">Female</option><option value="m">Male</option></select><small>Counts in VASc only (female +1)</small></label>
<div class="checks">''' + "".join(f'<label><input type="checkbox" id="cx-{k}"> {t} <b>+{p}</b></label>' for k, t, p in ITEMS) + '''</div>
</form>''',
    empty="Enter age, then tick any that apply.",
    js='''(function () {
  var C = MWCalc, $ = function (i) { return document.getElementById(i); }, out = $("cx-out");
  var keys = ["chf", "htn", "dm", "stroke", "vasc"];
  var ADV = { not: "Anticoagulation not recommended (score 0).", consider: "Score 1: anticoagulation may be considered, weighing benefits, bleeding risk and patient preference.", recommended: "Score 2 or more: oral anticoagulation is recommended unless contraindicated, with a NOAC preferred over warfarin for most people." };
  function run() {
    document.querySelectorAll("#cx-bands li").forEach(function (li) { li.classList.remove("on"); });
    if (!$("cx-a").value) { out.innerHTML = '<p class="meta">Enter age, then tick any that apply.</p>'; return; }
    var o = { age: $("cx-a").value, sex: $("cx-x").value }; keys.forEach(function (k) { o[k] = $("cx-" + k).checked; });
    var r = C.chads(o);
    if (r.error) { out.innerHTML = '<p class="warn">' + r.error + '</p>'; return; }
    var h = '<div class="res"><h2>CHA₂DS₂-VA (Australian 2018 guideline)</h2><p class="cxbig">' + r.va + '</p><p>' + ADV[r.advice] + '</p></div>';
    if (o.sex) {
      h += '<div class="res"><h2>CHA₂DS₂-VASc</h2><p class="cxbig">' + r.vasc + '</p><p>Adjusted stroke rate about <b>' + r.rate.toLocaleString("en-AU") + '% a year</b> without anticoagulation (older cohort data; see the list below).' +
        (o.sex === "f" && r.vasc === 1 ? ' Female sex alone (score 1) is not a reason to anticoagulate.' : '') + '</p></div>';
      var li = document.querySelector('#cx-bands li[data-s="' + r.vasc + '"]'); if (li) li.classList.add("on");
    } else h += '<p class="meta">Choose sex to see the CHA₂DS₂-VASc score.</p>';
    out.innerHTML = h;
  }
  ["cx-a", "cx-x"].concat(keys.map(function (k) { return "cx-" + k; })).forEach(function (i) { var el = $(i); el.addEventListener("input", run); el.addEventListener("change", run); });
  run();
})();''',
    body='''<h2>How the score works</h2>
<ul>
<li><b>C</b>ongestive heart failure or LV dysfunction: 1</li>
<li><b>H</b>ypertension: 1</li>
<li><b>A₂</b>ge 75 or over: 2</li>
<li><b>D</b>iabetes: 1</li>
<li><b>S₂</b>troke, TIA or thromboembolism: 2</li>
<li><b>V</b>ascular disease (prior MI, peripheral arterial disease, aortic plaque): 1</li>
<li><b>A</b>ge 65 to 74: 1</li>
<li><b>Sc</b>, sex category (female): 1, in CHA₂DS₂-VASc only. Maximum 9 for VASc, 8 for VA.</li>
</ul>
<h2>Why Australia uses CHA₂DS₂-VA</h2>
<ul>
<li>The 2018 National Heart Foundation of Australia and CSANZ AF guideline dropped female sex from the score. Female sex mainly adds risk when other risk factors are present, and including it complicated decisions without changing who benefits.</li>
<li>Using CHA₂DS₂-VA gives one threshold for everyone: 0 = anticoagulation not recommended; 1 = may be considered; 2 or more = recommended.</li>
<li>The 2024 European Society of Cardiology AF guideline also moved to CHA₂DS₂-VA, partly because sex-based scoring doesn’t fit people who are transgender, non-binary or on gender-affirming hormones.</li>
<li>For most people, the CHA₂DS₂-VA score is the CHA₂DS₂-VASc score minus 1 for women.</li>
</ul>
<h2>Annual stroke rate by CHA₂DS₂-VASc score</h2>
<p class="meta">Adjusted stroke rate per year without anticoagulation, as tabled in the 2014 AHA/ACC/HRS AF guideline. High scores rest on small numbers, which is why 7 and 8 look lower than 6. Modern cohorts often show lower absolute rates.</p>
<ul class="bands" id="cx-bands">
<li data-s="0"><b>Score 0</b>0%</li><li data-s="1"><b>Score 1</b>1.3%</li><li data-s="2"><b>Score 2</b>2.2%</li>
<li data-s="3"><b>Score 3</b>3.2%</li><li data-s="4"><b>Score 4</b>4.0%</li><li data-s="5"><b>Score 5</b>6.7%</li>
<li data-s="6"><b>Score 6</b>9.8%</li><li data-s="7"><b>Score 7</b>9.6%</li><li data-s="8"><b>Score 8</b>6.7%</li><li data-s="9"><b>Score 9</b>15.2%</li>
</ul>
<h2>Good to know</h2>
<ul>
<li>Stroke risk changes with age and new conditions, so re-score at least yearly and after new diagnoses.</li>
<li>Bleeding risk scores help identify modifiable risks (blood pressure, alcohol, interacting medicines) but shouldn’t on their own stop anticoagulation.</li>
<li>Aspirin isn’t recommended for stroke prevention in AF.</li>
<li>Check kidney function before choosing and dosing a NOAC. Our <a href="/tools/egfr-calculator/">eGFR calculator</a> can help, but many NOAC doses use creatinine clearance.</li>
</ul>''',
    faqs=[
        ("What is the CHA2DS2-VASc score?", "A stroke risk score for people with atrial fibrillation. It adds points for heart failure, high blood pressure, age, diabetes, previous stroke or TIA, vascular disease and female sex, from 0 to 9. Higher scores mean higher stroke risk."),
        ("What is the difference between CHA2DS2-VASc and CHA2DS2-VA?", "CHA2DS2-VA is the same score without the point for female sex. Australia’s 2018 AF guideline and the 2024 European guideline use CHA2DS2-VA, so the same thresholds apply to everyone."),
        ("What CHA2DS2-VA score needs anticoagulation?", "Under the Australian 2018 guideline, anticoagulation is recommended at a score of 2 or more, may be considered at 1, and isn’t recommended at 0. A non-vitamin K oral anticoagulant (NOAC) is preferred over warfarin for most people."),
        ("Is a CHA2DS2-VASc score of 1 in a woman high risk?", "No. A woman whose only point is female sex has a CHA2DS2-VA score of 0, which is low risk, and anticoagulation isn’t recommended for that reason alone."),
        ("Does the score apply to all atrial fibrillation?", "No. It isn’t used for AF with moderate to severe mitral stenosis or a mechanical heart valve, where anticoagulation (usually warfarin) is needed regardless of the score."),
    ],
    sources=[
        ("Brieger D et al. National Heart Foundation of Australia and CSANZ: Australian clinical guidelines for the diagnosis and management of atrial fibrillation 2018. Heart Lung Circ 2018", "https://doi.org/10.1016/j.hlc.2018.06.1043", "CHA2DS2-VA; anticoagulation thresholds; NOACs preferred"),
        ("Heart Foundation: Atrial fibrillation guideline for health professionals", "https://www.heartfoundation.org.au/for-professionals/atrial-fibrillation-for-professionals", "current Australian guideline"),
        ("MJA: New guidelines on atrial fibrillation and heart failure (2018)", "https://www.mja.com.au/journal/2018/new-guidelines-atrial-fibrillation-heart-failure", "sexless CHA2DS2-VA; NOACs preferred"),
        ("January CT et al. 2014 AHA/ACC/HRS guideline for the management of patients with atrial fibrillation", "https://doi.org/10.1016/j.jacc.2014.03.022", "adjusted stroke rate table"),
        ("Lip GY et al. Refining clinical risk stratification for predicting stroke in atrial fibrillation. Chest 2010", "https://doi.org/10.1378/chest.09-1584", "original CHA2DS2-VASc"),
        ("2024 ESC guidelines for atrial fibrillation: moving the goalposts (Eur Cardiol Rev)", "https://www.ecrjournal.com/articles/2024-european-society-cardiology-atrial-fibrillation-guidelines-moving-goalpost", "ESC move to CHA2DS2-VA"),
    ],
    revnote="Education for health professionals. Check current guidelines and the product information before prescribing.",
    related=[("Fact sheet", "Atrial fibrillation", "/atrial-fibrillation/"), ("Fact sheet", "Palpitations", "/palpitations/"),
             ("Calculator", "eGFR calculator", "/tools/egfr-calculator/"), ("Game", "Arrhythmix ECG game", "/arrhythmix/")],
)

CALCS = [DUE, WEEK, OVU, BMI, EGFR, CHA]
