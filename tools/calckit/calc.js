/* Malady Wise calculators: pure functions, no DOM. Tested in Node by _scripts/calckit/test_calc.js.
   Sources are cited on each calculator page. */
(function (root) {
  "use strict";
  var DAY = 86400000;

  // ---------- dates (UTC, so daylight saving never shifts a day) ----------
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
    if (!m) return null;
    var t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
    var d = new Date(t);
    if (d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
    return t;
  }
  function addDays(t, n) { return t + n * DAY; }
  function iso(t) { return new Date(t).toISOString().slice(0, 10); }
  function diffDays(a, b) { return Math.round((a - b) / DAY); }
  function todayUTC() { var n = new Date(); return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()); }

  // ---------- pregnancy dating ----------
  // LMP: Naegele's rule, EDD = LMP + 280 days, adjusted by (cycle length - 28) days.
  // Conception: EDD = conception + 266 days. IVF: EDD = transfer + 263 (day-3 embryo) or + 261 (day-5 embryo).
  // Due date known: start of pregnancy (gestational day 0) = EDD - 280.
  function dueDate(o) {
    var d = parseDate(o.date);
    if (d === null) return { error: "Enter a valid date." };
    var method = o.method || "lmp", edd, cyc = null;
    if (method === "lmp") {
      cyc = o.cycle == null || o.cycle === "" ? 28 : +o.cycle;
      if (!(cyc >= 20 && cyc <= 45) || Math.round(cyc) !== cyc) return { error: "Cycle length must be a whole number from 20 to 45 days." };
      edd = addDays(d, 280 + (cyc - 28));
    } else if (method === "conception") edd = addDays(d, 266);
    else if (method === "ivf3") edd = addDays(d, 263);
    else if (method === "ivf5") edd = addDays(d, 261);
    else if (method === "edd") edd = d;
    else return { error: "Unknown method." };
    var start = addDays(edd, -280);
    var today = o.today != null ? parseDate(o.today) : todayUTC();
    var ga = diffDays(today, start);
    var r = { edd: iso(edd), start: iso(start), cycle: cyc, gaDays: ga,
      weeks: Math.floor(ga / 7), days: ((ga % 7) + 7) % 7, daysToGo: diffDays(edd, today),
      trimester: ga < 0 ? 0 : ga < 98 ? 1 : ga < 196 ? 2 : 3,
      milestones: milestones(start, today) };
    if (method !== "edd" && d > today) r.warn = "That date is in the future. Check the date.";
    if (ga > 44 * 7) r.warn = "That date gives more than 44 weeks. Check the date.";
    return r;
  }
  // Australian timing (sources on the page): weeks [from, to) as gestational days
  var MILESTONES = [
    ["Dating ultrasound", 8 * 7, 14 * 7 + 6, "8 to 14 weeks"],
    ["NIPT blood test (optional, private cost)", 10 * 7, 14 * 7 - 1, "from 10 weeks"],
    ["Combined first trimester screening (optional)", 11 * 7, 13 * 7 + 6, "11 to 13 weeks"],
    ["Morphology (anatomy) ultrasound", 18 * 7, 20 * 7 + 6, "18 to 20 weeks"],
    ["Whooping cough vaccine", 20 * 7, 32 * 7 + 6, "ideally 20 to 32 weeks"],
    ["Glucose tolerance test for gestational diabetes", 24 * 7, 28 * 7 + 6, "24 to 28 weeks"],
    ["RSV vaccine (Abrysvo)", 28 * 7, 36 * 7 + 6, "28 to 36 weeks"],
    ["Full term begins", 37 * 7, 37 * 7, "37 weeks"],
    ["Due date", 280, 280, "40 weeks"]
  ];
  function milestones(start, today) {
    return MILESTONES.map(function (m) {
      var a = addDays(start, m[1]), b = addDays(start, m[2]);
      return { name: m[0], when: m[3], from: iso(a), to: iso(b),
        status: today > b ? "past" : today >= a ? "now" : "next" };
    });
  }

  // ---------- ovulation ----------
  // Ovulation is estimated on cycle day (cycle length - luteal length), e.g. day 14 of a 28-day cycle;
  // the fertile window is the 5 days before ovulation plus ovulation day (Wilcox 1995).
  function ovulation(o) {
    var d = parseDate(o.lmp);
    if (d === null) return { error: "Enter the first day of your last period." };
    var cyc = +o.cycle, lut = o.luteal == null || o.luteal === "" ? 14 : +o.luteal;
    if (!(cyc >= 21 && cyc <= 45) || Math.round(cyc) !== cyc) return { error: "Cycle length must be a whole number from 21 to 45 days." };
    if (!(lut >= 10 && lut <= 16) || Math.round(lut) !== lut) return { error: "Luteal phase must be 10 to 16 days." };
    var n = o.cycles || 3, out = [];
    for (var i = 0; i < n; i++) {
      var p = addDays(d, i * cyc), ov = addDays(p, cyc - lut - 1);
      out.push({ period: iso(p), ovulation: iso(ov), fertileFrom: iso(addDays(ov, -5)), fertileTo: iso(ov), nextPeriod: iso(addDays(p, cyc)) });
    }
    return { cycle: cyc, luteal: lut, ovDay: cyc - lut, cycles: out };
  }

  // ---------- BMI ----------
  function bmi(o) {
    var w = +o.kg, h = +o.cm;
    if (!(w >= 20 && w <= 350)) return { error: "Enter a weight from 20 to 350 kg." };
    if (!(h >= 100 && h <= 250)) return { error: "Enter a height from 100 to 250 cm." };
    var m = h / 100, b = Math.round(w / (m * m) * 10) / 10; // categorise on the shown 1-decimal value
    var cat = b < 18.5 ? "Underweight" : b < 25 ? "Healthy weight" : b < 30 ? "Overweight" : b < 35 ? "Obesity class I" : b < 40 ? "Obesity class II" : "Obesity class III";
    var asian = b < 18.5 ? "Underweight" : b < 23 ? "Healthy weight" : b < 27.5 ? "Increased risk" : "High risk";
    var r = { bmi: b, raw: w / (m * m), category: cat, asianCategory: asian,
      healthyFrom: Math.round(18.5 * m * m * 10) / 10, healthyTo: Math.round(24.9 * m * m * 10) / 10 };
    if (o.waist) {
      var wc = +o.waist, f = o.sex === "f";
      if (wc >= 40 && wc <= 250) r.waist = wc >= (f ? 88 : 102) ? "Greatly increased risk" : wc >= (f ? 80 : 94) ? "Increased risk" : "Not increased";
      r.whtr = wc >= 40 && wc <= 250 ? Math.round(wc / h * 100) / 100 : null;
    }
    return r;
  }
  function ftInToCm(ft, inch) { return ((+ft || 0) * 12 + (+inch || 0)) * 2.54; }
  function lbToKg(lb) { return (+lb || 0) * 0.45359237; }
  function stLbToKg(st, lb) { return lbToKg((+st || 0) * 14 + (+lb || 0)); }

  // ---------- eGFR ----------
  var UMOL_PER_MGDL = 88.4;
  // CKD-EPI 2021 (race-free): 142 x min(Scr/k,1)^a x max(Scr/k,1)^-1.200 x 0.9938^age x 1.012 [female]
  // k = 0.7 F / 0.9 M; a = -0.241 F / -0.302 M; Scr in mg/dL (Inker 2021, NEJM).
  function egfr2021(scrMg, age, female) {
    var k = female ? 0.7 : 0.9, a = female ? -0.241 : -0.302, x = scrMg / k;
    return 142 * Math.pow(Math.min(x, 1), a) * Math.pow(Math.max(x, 1), -1.2) * Math.pow(0.9938, age) * (female ? 1.012 : 1);
  }
  // CKD-EPI 2009 without the race term (what Australian laboratories report):
  // 141 x min(Scr/k,1)^a x max(Scr/k,1)^-1.209 x 0.993^age x 1.018 [female]; a = -0.329 F / -0.411 M (Levey 2009).
  function egfr2009(scrMg, age, female) {
    var k = female ? 0.7 : 0.9, a = female ? -0.329 : -0.411, x = scrMg / k;
    return 141 * Math.pow(Math.min(x, 1), a) * Math.pow(Math.max(x, 1), -1.209) * Math.pow(0.993, age) * (female ? 1.018 : 1);
  }
  function gStage(g) { return g >= 90 ? "G1" : g >= 60 ? "G2" : g >= 45 ? "G3a" : g >= 30 ? "G3b" : g >= 15 ? "G4" : "G5"; }
  function egfr(o) {
    var s = +o.scr, age = +o.age, unit = o.unit || "umol";
    if (!(age >= 18 && age <= 110)) return { error: "For adults 18 and over (age 18 to 110)." };
    if (o.sex !== "f" && o.sex !== "m") return { error: "Choose the sex used for the equation." };
    var mg = unit === "mg" ? s : s / UMOL_PER_MGDL;
    if (!(mg >= 0.1 && mg <= 25)) return { error: unit === "mg" ? "Enter creatinine from 0.1 to 25 mg/dL." : "Enter creatinine from 10 to 2200 µmol/L." };
    var f = o.sex === "f", e21 = egfr2021(mg, age, f), e09 = egfr2009(mg, age, f);
    return { scrMg: mg, scrUmol: mg * UMOL_PER_MGDL, egfr2021: Math.round(e21), egfr2009: Math.round(e09),
      raw2021: e21, raw2009: e09, stage2021: gStage(Math.round(e21)), stage2009: gStage(Math.round(e09)) };
  }

  // ---------- CHA2DS2-VASc and CHA2DS2-VA ----------
  // C heart failure 1, H hypertension 1, A2 age >=75 2, D diabetes 1, S2 stroke/TIA/thromboembolism 2,
  // V vascular disease 1, A age 65-74 1, Sc female sex 1 (VASc only).
  var AHA_RATE = [0, 1.3, 2.2, 3.2, 4.0, 6.7, 9.8, 9.6, 6.7, 15.2]; // adjusted stroke rate %/year, 2014 AHA/ACC/HRS
  function chads(o) {
    var age = +o.age;
    if (!(age >= 18 && age <= 120)) return { error: "Enter an age from 18 to 120." };
    var va = (o.chf ? 1 : 0) + (o.htn ? 1 : 0) + (age >= 75 ? 2 : age >= 65 ? 1 : 0) + (o.dm ? 1 : 0) + (o.stroke ? 2 : 0) + (o.vasc ? 1 : 0);
    var vasc = va + (o.sex === "f" ? 1 : 0);
    var adv = va === 0 ? "not" : va === 1 ? "consider" : "recommended";
    return { va: va, vasc: vasc, rate: AHA_RATE[vasc], advice: adv };
  }

  var api = { parseDate: parseDate, addDays: addDays, iso: iso, diffDays: diffDays, todayUTC: todayUTC,
    dueDate: dueDate, MILESTONES: MILESTONES, ovulation: ovulation, bmi: bmi, ftInToCm: ftInToCm, lbToKg: lbToKg, stLbToKg: stLbToKg,
    egfr: egfr, egfr2021: egfr2021, egfr2009: egfr2009, gStage: gStage, UMOL_PER_MGDL: UMOL_PER_MGDL, chads: chads, AHA_RATE: AHA_RATE };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.MWCalc = api;
})(this);
