/* Fridaemia: the Friday 5pm results inbox. Open Fridays 4:30 to 7pm, the player's local time.
   Eight results land at knock-off time. For each: ED now, call today, or Monday is fine. Same eight for everyone that week. */
(function () {
  var G = window.MG, $ = G.$;
  var ED = "ed", CALL = "call", MON = "mon";
  var LABEL = { ed: "🚑 ED now", call: "📞 Call today", mon: "📅 Monday is fine" };
  // [result, patient context, right answer, why]. Teaching scenarios only: real decisions depend on the whole patient and local guidelines.
  var POOL = [
    ["High-sensitivity troponin 450 ng/L (normal under about 15).", "52-year-old man. Chest tightness this morning, now at home feeling ‘a bit off’.", ED, "A troponin that high after chest pain is a heart attack until proven otherwise. He needs an ECG and cardiology tonight, not a phone call."],
    ["Potassium 6.8 mmol/L. Sample not haemolysed.", "71-year-old with kidney disease, recently started spironolactone.", ED, "Potassium of 6.5 or more can stop the heart without warning. Send to ED for an ECG, monitoring and treatment. Stop the spironolactone."],
    ["INR 9.2.", "80-year-old on warfarin for AF. No bleeding, feels well.", CALL, "Very high INR without bleeding: withhold warfarin, give oral vitamin K per guidelines and recheck the next day. Call tonight. ED only if bleeding or a fall."],
    ["Sodium 118 mmol/L.", "68-year-old on a thiazide. Family say she’s been muddled since yesterday.", ED, "Severe low sodium with confusion risks seizures. She needs ED for careful, monitored correction (too fast can cause brain damage)."],
    ["Sodium 131 mmol/L (was 134 last year).", "60-year-old on a thiazide. Feels completely well.", MON, "Mild, stable and symptom-free. Review the diuretic and recheck next week. Not a weekend problem."],
    ["Blood culture: gram-positive cocci in clusters.", "45-year-old you saw yesterday with fever. Sent home on oral antibiotics.", ED, "Clusters usually means Staphylococcus aureus. Staph in the blood always needs admission, IV antibiotics and a search for the source. Recall to ED tonight."],
    ["Corrected calcium 3.6 mmol/L.", "74-year-old with weight loss, thirst and constipation.", ED, "Calcium this high is dangerous (heart rhythm, kidneys, confusion) and often means cancer. ED for IV fluids and workup."],
    ["Neutrophils 0.3 × 10⁹/L.", "55-year-old on chemotherapy. Phoned in with a temperature of 38.4.", ED, "Fever plus neutropenia is febrile neutropenia: antibiotics within the hour. Straight to ED, don’t wait for a GP appointment."],
    ["Neutrophils 0.4 × 10⁹/L.", "34-year-old on clozapine. No fever, feels well.", CALL, "Clozapine plus low neutrophils needs action today: follow the clozapine monitoring protocol (usually stop it) and contact the treating team. Tell her to go to ED if any fever."],
    ["Glucose 28 mmol/L, blood ketones 3.8 mmol/L.", "19-year-old with type 1 diabetes. Vomiting since lunch.", ED, "High ketones, high sugar and vomiting is diabetic ketoacidosis. Needs IV fluids and insulin in hospital now."],
    ["HbA1c 8.1% (was 7.6%).", "58-year-old with type 2 diabetes. No symptoms.", MON, "Worth a medication review, but nothing changes over a weekend. Book a routine appointment."],
    ["Vitamin D 38 nmol/L.", "40-year-old office worker. Mild tiredness.", MON, "Low-ish vitamin D is common and never an emergency. Discuss at the next routine visit."],
    ["Ferritin 4 µg/L, haemoglobin 118 g/L.", "28-year-old with heavy periods. Bit tired, otherwise well.", MON, "Iron deficiency: important, but not urgent. Start iron and investigate the cause next week."],
    ["Lithium level 2.1 mmol/L (target 0.6–1.0).", "50-year-old on lithium. New tremor, diarrhoea and unsteadiness.", ED, "Lithium toxicity with symptoms can cause seizures and kidney damage. ED tonight: stop lithium, fluids, sometimes dialysis."],
    ["Platelets 8 × 10⁹/L.", "22-year-old with new bruises and tiny red spots on her legs.", ED, "Platelets under 10 with bleeding signs risk serious bleeding, including into the brain. ED tonight."],
    ["ALT 1,450 U/L.", "17-year-old who took ‘a handful’ of paracetamol yesterday after an argument.", ED, "Liver injury after paracetamol overdose. Acetylcysteine (the antidote) and assessment, including mental health, in ED now."],
    ["Urine culture: E. coli, sensitive to the antibiotic already prescribed.", "35-year-old with cystitis. Feeling better on day 2.", MON, "Right bug, right drug, getting better. Nothing to do. The best kind of result."],
    ["CK 15,000 U/L.", "26-year-old after his first marathon. Dark brown urine, aching legs.", ED, "Rhabdomyolysis with dark urine risks kidney failure. ED for IV fluids and kidney monitoring."],
    ["Positive pregnancy test (serum hCG).", "24-year-old who started isotretinoin for acne 2 months ago.", CALL, "Isotretinoin causes severe birth defects. Call today: stop it now and arrange urgent review. Not an ED problem."],
    ["Chest X-ray: new 2.5 cm mass in the right upper lobe.", "66-year-old smoker. Cough for 6 weeks, otherwise well.", CALL, "Not an emergency tonight, but don’t let it sit over the weekend. Call to explain, arrange CT and an urgent lung cancer referral."],
    ["Magnesium 0.38 mmol/L.", "62-year-old on a proton pump inhibitor. Palpitations and muscle cramps.", ED, "Very low magnesium with palpitations can trigger dangerous heart rhythms. ED for an ECG and IV magnesium."],
    ["Haemoglobin 128 g/L (range 115–165).", "45-year-old having routine bloods.", MON, "Normal. File it and go home."],
    ["Syphilis serology positive (new).", "29-year-old, 16 weeks pregnant. Routine antenatal bloods.", CALL, "Syphilis in pregnancy can infect the baby. Call today and arrange treatment within days with the antenatal and sexual health teams."],
    ["TSH 0.01 mU/L, free T4 mildly raised.", "38-year-old with mild palpitations, otherwise well.", CALL, "Overactive thyroid. Call to explain and start symptom control (often a beta blocker) and referral. ED only if very unwell, fast AF or a fever."],
    ["Creatinine 290 µmol/L (was 95 three months ago).", "75-year-old on an ACE inhibitor, diuretic and ibuprofen. Vomiting for 2 days.", ED, "Acute kidney injury: the ‘triple whammy’ plus dehydration. ED for fluids and monitoring. Stop all three medicines."],
    ["PSA 5.2 ng/mL.", "61-year-old, no urinary symptoms.", MON, "Raised but not urgent. Repeat and consider referral or MRI through normal channels next week."]
  ];
  function now() {
    var q = new URLSearchParams(location.search).get("t"); // testing: ?t=open
    return q === "open" ? (function () { var d = new Date(); while (d.getDay() !== 5) d.setDate(d.getDate() - 1); d.setHours(17, 0, 0, 0); return d; })() : new Date();
  }
  function isOpen(d) { var m = d.getHours() * 60 + d.getMinutes(); return d.getDay() === 5 && m >= 16 * 60 + 30 && m < 19 * 60; }
  function nextOpen(d) { var n = new Date(d); n.setSeconds(0, 0); for (var i = 0; i < 8; i++) { var c = new Date(n); c.setDate(n.getDate() + i); c.setHours(16, 30, 0, 0); if (c.getDay() === 5 && c > d) return c; } return null; }
  var T = now(), WK = G.week(T), r = G.rng("fridaemia-" + WK);
  var SET = G.shuffle(POOL, r).slice(0, 8), idx = 0, score = 0, marks = [];
  var KEY = "mw-fridaemia-" + WK;

  function lockView() {
    var n = nextOpen(T), el = $("fr-lock");
    $("fr-play").disabled = true;
    function tick() {
      var ms = n - new Date();
      if (ms <= 0) { location.reload(); return; }
      var d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
      el.innerHTML = "🔒 The inbox is closed. Opens Friday at 4:30pm your time.<br><b>" + (d ? d + "d " : "") + h + "h " + m + "m</b> to go.";
    }
    tick(); setInterval(tick, 30000);
  }
  function card() {
    var c = SET[idx];
    $("fr-n").textContent = (idx + 1) + "/" + SET.length;
    $("fr-q").innerHTML = '<span class="mg-tag">Result ' + (idx + 1) + " of " + SET.length + '</span><p class="fr-res">' + G.esc(c[0]) + '</p><p class="mg-case">' + G.esc(c[1]) + '</p><p class="mg-q">It’s 5pm Friday. What now?</p><div class="mg-opts">' +
      [ED, CALL, MON].map(function (k) { return '<button type="button" data-k="' + k + '">' + LABEL[k] + "</button>"; }).join("") + '</div><div id="fr-why"></div>';
    var btns = $("fr-q").querySelectorAll("button[data-k]");
    Array.prototype.forEach.call(btns, function (b) {
      b.onclick = function () {
        var ok = b.getAttribute("data-k") === c[2];
        Array.prototype.forEach.call(btns, function (x) { x.disabled = true; if (x.getAttribute("data-k") === c[2]) x.classList.add("ok"); });
        if (!ok) b.classList.add("no");
        if (ok) score++; marks.push(ok ? "🟢" : "🔴");
        $("fr-s").textContent = score;
        $("fr-why").innerHTML = '<p class="mg-why"><b>' + (ok ? "Safe call." : "Not quite: " + LABEL[c[2]] + ".") + "</b> " + G.esc(c[3]) + '</p><p style="text-align:right;margin-top:10px"><button class="big mg-next" type="button" id="fr-next">' + (idx + 1 < SET.length ? "Next result" : "Clock off") + "</button></p>";
        $("fr-next").onclick = function () { idx++; if (idx < SET.length) card(); else end(); };
        $("fr-next").focus();
      };
    });
  }
  var VERDICT = ["You’ve clocked off. So has your registration.", "The coroner would like a word.", "Rough weekend ahead. Check your phone.", "Half the inbox is on fire.", "Safe-ish. Sleep with the phone on.", "Solid. A quiet weekend, probably.", "Very safe. Your practice manager approves.", "Nearly perfect. One small wobble.", "Flawless. Zero calls from ED all weekend."];
  function end() {
    G.set(KEY, { score: score, marks: marks.join("") });
    $("fr-game").hidden = true; $("fr-end").hidden = false;
    $("fr-final").textContent = score + "/" + SET.length;
    $("fr-verdict").textContent = VERDICT[Math.round(score / SET.length * 8)];
    $("fr-share").onclick = function () { G.share("Fridaemia " + WK.replace("-", " ") + " 📥 " + score + "/" + SET.length + "\n" + marks.join("") + "\nThe 5pm Friday inbox. maladywise.com/fridaemia/"); };
  }
  function start() { $("fr-intro").hidden = true; $("fr-game").hidden = false; card(); }

  var done = G.get(KEY, null);
  if (!isOpen(T)) lockView();
  else if (done) { $("fr-play").textContent = "Play again"; $("fr-best").innerHTML = "This week’s inbox: <b>" + done.score + "/8</b> " + (done.marks || ""); }
  $("fr-play").onclick = function () { if (!$("fr-play").disabled) start(); };
  $("fr-again").onclick = function () { location.reload(); };
})();
