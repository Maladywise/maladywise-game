#!/usr/bin/env node
/* Checks the Malady Wise calculators (tools/calckit/calc.js) against hand-worked examples.
   Run from the repo root: node _scripts/calckit/test_calc.js   (exit 1 on any failure) */
var path = require("path");
var C = require(path.join(__dirname, "..", "..", "tools", "calckit", "calc.js"));
var fails = 0, n = 0;
function eq(name, got, want) {
  n++;
  var ok = typeof want === "number" ? Math.abs(got - want) < 1e-9 : got === want;
  if (!ok) { fails++; console.log("FAIL", name, "got", got, "want", want); }
}
function near(name, got, want, tol) { n++; if (Math.abs(got - want) > tol) { fails++; console.log("FAIL", name, "got", got, "want", want); } }

// ---- Due date: Naegele's rule (LMP + 7 days - 3 months + 1 year for a 28-day cycle)
eq("LMP 1 Jan 2026, 28d", C.dueDate({ method: "lmp", date: "2026-01-01", cycle: 28, today: "2026-03-01" }).edd, "2026-10-08");
eq("LMP 1 Jan 2026, 35d (+7)", C.dueDate({ method: "lmp", date: "2026-01-01", cycle: 35, today: "2026-03-01" }).edd, "2026-10-15");
eq("LMP 15 May 2026, 28d", C.dueDate({ method: "lmp", date: "2026-05-15", cycle: 28, today: "2026-06-01" }).edd, "2027-02-19");
eq("LMP 10 Mar 2026, 24d (-4)", C.dueDate({ method: "lmp", date: "2026-03-10", cycle: 24, today: "2026-06-01" }).edd, "2026-12-11");
eq("Leap year: LMP 1 Jun 2027 -> 7 Mar 2028", C.dueDate({ method: "lmp", date: "2027-06-01", cycle: 28, today: "2027-07-01" }).edd, "2028-03-07");
eq("Conception 15 Jan 2026 + 266", C.dueDate({ method: "conception", date: "2026-01-15", today: "2026-03-01" }).edd, "2026-10-08");
eq("IVF day-5 transfer 20 Jan 2026 + 261", C.dueDate({ method: "ivf5", date: "2026-01-20", today: "2026-03-01" }).edd, "2026-10-08");
eq("IVF day-3 transfer 18 Jan 2026 + 263", C.dueDate({ method: "ivf3", date: "2026-01-18", today: "2026-03-01" }).edd, "2026-10-08");
var g = C.dueDate({ method: "lmp", date: "2026-01-01", cycle: 28, today: "2026-03-01" });
eq("GA on 1 Mar 2026 = 8w3d (59 days)", g.weeks + "w" + g.days + "d", "8w3d");
eq("trimester 1", g.trimester, 1);
eq("days to go", g.daysToGo, 221);
var g2 = C.dueDate({ method: "edd", date: "2026-10-08", today: "2026-06-25" });
eq("from EDD: 25 Jun 2026 = 25w0d", g2.weeks + "w" + g2.days + "d", "25w0d");
eq("trimester 2", g2.trimester, 2);
eq("morphology from", g.milestones[3].from, "2026-05-07"); // start 2026-01-01 + 126 days
eq("GTT window to", g.milestones[5].to, "2026-07-22"); // + 202 days
eq("bad cycle rejected", !!C.dueDate({ method: "lmp", date: "2026-01-01", cycle: 60 }).error, true);
eq("bad date rejected", !!C.dueDate({ method: "lmp", date: "2026-02-30" }).error, true);

// ---- Ovulation: 28-day cycle -> ovulation day 14 (LMP + 13), fertile window day 9-14
var o = C.ovulation({ lmp: "2026-11-01", cycle: 28 });
eq("ov 28d", o.cycles[0].ovulation, "2026-11-14");
eq("fertile from", o.cycles[0].fertileFrom, "2026-11-09");
eq("next period", o.cycles[0].nextPeriod, "2026-11-29");
eq("ov 32d (LMP+17)", C.ovulation({ lmp: "2026-11-01", cycle: 32 }).cycles[0].ovulation, "2026-11-18");
eq("cycle 2 ovulation 28d", o.cycles[1].ovulation, "2026-12-12");

// ---- BMI: 70 kg, 175 cm -> 22.857 -> 22.9
var b = C.bmi({ kg: 70, cm: 175 });
eq("BMI 70/1.75^2", b.bmi, 22.9); eq("cat", b.category, "Healthy weight");
eq("BMI 95/1.70^2=32.9", C.bmi({ kg: 95, cm: 170 }).bmi, 32.9);
eq("cat obesity I", C.bmi({ kg: 95, cm: 170 }).category, "Obesity class I");
eq("BMI 50/1.65^2=18.4 underweight", C.bmi({ kg: 50, cm: 165 }).category, "Underweight");
eq("Asian cut-off 24.0 -> increased risk", C.bmi({ kg: 69.4, cm: 170 }).asianCategory, "Increased risk");
eq("boundary 25.0 overweight", C.bmi({ kg: 64, cm: 160 }).category, "Overweight");
eq("waist F 85 increased", C.bmi({ kg: 70, cm: 165, waist: 85, sex: "f" }).waist, "Increased risk");
eq("waist M 103 greatly", C.bmi({ kg: 90, cm: 180, waist: 103, sex: "m" }).waist, "Greatly increased risk");
near("5ft 10in = 177.8 cm", C.ftInToCm(5, 10), 177.8, 1e-9);
near("154 lb = 69.85 kg", C.lbToKg(154), 69.853225, 1e-6);
near("11 st = 69.85 kg", C.stLbToKg(11, 0), 69.853225, 1e-6);

// ---- eGFR CKD-EPI 2021, hand-worked:
// F 50, Scr 1.0 mg/dL: 142 x (1/0.7)^-1.2 x 0.9938^50 x 1.012
var hand = 142 * Math.pow(1 / 0.7, -1.2) * Math.pow(0.9938, 50) * 1.012; // 68.6
near("2021 F50 1.0 (hand)", C.egfr2021(1.0, 50, true), hand, 1e-9);
eq("2021 F50 1.0 -> 69", Math.round(C.egfr2021(1.0, 50, true)), 69);
eq("2021 M60 1.0 -> 86", Math.round(C.egfr2021(1.0, 60, false)), 86);
eq("2021 M40 0.8 (below kappa) -> 115", Math.round(C.egfr2021(0.8, 40, false)), 115);
eq("2021 M70 2.0 -> 35 (G3b)", Math.round(C.egfr2021(2.0, 70, false)), 35);
var e = C.egfr({ scr: 80, unit: "umol", age: 45, sex: "f" }); // 0.905 mg/dL
eq("µmol/L conversion -> 2021 F45 80 µmol/L = 80", e.egfr2021, 80);
eq("stage G2", e.stage2021, "G2");
eq("2009 F45 80 µmol/L = 77", e.egfr2009, 77);
eq("2009 M60 1.0 -> 81", Math.round(C.egfr2009(1.0, 60, false)), 81);
eq("stage cut 59 -> G3a", C.gStage(59), "G3a"); eq("14 -> G5", C.gStage(14), "G5"); eq("90 -> G1", C.gStage(90), "G1");
eq("under 18 rejected", !!C.egfr({ scr: 60, age: 16, sex: "f" }).error, true);

// ---- CHA2DS2-VASc / VA
var c1 = C.chads({ age: 70, sex: "f", htn: true });
eq("70F HTN VASc 3", c1.vasc, 3); eq("70F HTN VA 2", c1.va, 2); eq("advice", c1.advice, "recommended");
var c2 = C.chads({ age: 80, sex: "m", stroke: true, dm: true });
eq("80M stroke DM 5", c2.vasc, 5); eq("VA 5", c2.va, 5); eq("rate 6.7", c2.rate, 6.7);
var c3 = C.chads({ age: 60, sex: "f" });
eq("60F VASc 1", c3.vasc, 1); eq("60F VA 0", c3.va, 0); eq("advice not", c3.advice, "not");
eq("all VASc 9", C.chads({ age: 80, sex: "f", chf: 1, htn: 1, dm: 1, stroke: 1, vasc: 1 }).vasc, 9);
eq("67M HTN VA 2", C.chads({ age: 67, sex: "m", htn: true }).va, 2);
eq("55M CHF VA 1 consider", C.chads({ age: 55, sex: "m", chf: true }).advice, "consider");

console.log((n - fails) + "/" + n + " checks passed");
process.exit(fails ? 1 : 0);
