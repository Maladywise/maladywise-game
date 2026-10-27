/* Arrhythmix ECG engine: draws ECG paper and traces as SVG, generated from parameters (no images).
   Paper: 1 mm minor / 5 mm major grid, 25 mm/s, 10 mm/mV. Units in the SVG are millimetres.
   Limb leads III, aVR, aVL, aVF are derived from I and II (Einthoven), so lead changes stay consistent.
   window.ARX_ECG.render(cfg, seedString) -> { svg, layout } */
(function () {
  "use strict";
  var MS = 1000, SPEED = 25, GAIN = 10;
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; }
  function rngFrom(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // deterministic noise in [-0.5, 0.5] for (seed, lead, sample)
  function hn(a, b, c) { var h = Math.imul(a ^ 0x9E3779B9, 0x85EBCA6B) ^ Math.imul(b + 0x632BE5AB, 0xC2B2AE35) ^ Math.imul(c + 0x27D4EB2F, 0x165667B1); h ^= h >>> 15; h = Math.imul(h, 0x2C1B3C6D); h ^= h >>> 12; h = Math.imul(h, 0x297A2D39); h ^= h >>> 15; return (h >>> 0) / 4294967296 - 0.5; }
  function gauss(x, m, s) { var z = (x - m) / s; return Math.exp(-0.5 * z * z); }
  function sig(x) { return 1 / (1 + Math.exp(-x)); }
  function sstep(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }

  // ---------- lead templates (I, II, V1-V6). QRS parts: [t ms from QRS onset, mV, sigma ms] or ramp [t0, t1, t2, mV] ----------
  var BASE = {
    I:  { p: [[50, 0.09, 18]], qrs: [[14, -0.05, 5], [42, 0.85, 9.5], [70, -0.1, 8]], qd: 92, t: 0.24 },
    II: { p: [[50, 0.15, 18]], qrs: [[14, -0.07, 5], [42, 1.05, 9.5], [70, -0.18, 8]], qd: 92, t: 0.3 },
    V1: { p: [[38, 0.07, 12], [72, -0.06, 13]], qrs: [[20, 0.2, 6.5], [50, -1.0, 12]], qd: 90, t: 0.08 },
    V2: { p: [[50, 0.07, 17]], qrs: [[22, 0.4, 7.5], [54, -1.45, 12.5]], qd: 92, st: 0.06, t: 0.5 },
    V3: { p: [[50, 0.07, 17]], qrs: [[28, 0.75, 9], [60, -0.95, 11]], qd: 92, st: 0.04, t: 0.5 },
    V4: { p: [[50, 0.08, 17]], qrs: [[12, -0.04, 5], [38, 1.35, 10], [68, -0.5, 9]], qd: 92, t: 0.45 },
    V5: { p: [[50, 0.08, 17]], qrs: [[12, -0.07, 5], [40, 1.45, 10], [70, -0.25, 8]], qd: 92, t: 0.38 },
    V6: { p: [[50, 0.08, 17]], qrs: [[12, -0.08, 5], [42, 1.15, 10], [72, -0.12, 8]], qd: 92, t: 0.3 }
  };
  var L8 = ["I", "II", "V1", "V2", "V3", "V4", "V5", "V6"];
  function set(T, map) { Object.keys(map).forEach(function (L) { Object.keys(map[L]).forEach(function (k) { T[L][k] = map[L][k]; }); }); }
  var PRESETS = {
    normal: function () {},
    inferiorSTEMI: function (T) {
      set(T, { II: { st: 0.32, t: 0.32, ts: [75, 48], qrs: [[14, -0.17, 6], [40, 0.95, 9], [64, -0.08, 7]] }, I: { st: -0.09, t: -0.05, qrs: [[42, 0.8, 9.5], [68, -0.08, 7]] }, V2: { st: -0.07, t: 0.36 }, V3: { st: -0.03 } });
    },
    anteriorSTEMI: function (T) {
      set(T, { V1: { st: 0.2, t: 0.25, ts: [80, 50] }, V2: { st: 0.48, t: 0.5, ts: [80, 50], qrs: [[22, 0.07, 6], [50, -1.15, 11]] }, V3: { st: 0.52, t: 0.55, ts: [80, 50], qrs: [[28, 0.22, 8], [56, -0.75, 10]] },
        V4: { st: 0.4, t: 0.5, ts: [80, 50], qrs: [[14, -0.12, 6], [38, 0.9, 10], [64, -0.3, 8]] }, V5: { st: 0.15, t: 0.42 }, I: { st: 0.1, t: 0.3 }, II: { st: -0.05, t: 0.2 } });
    },
    posteriorMI: function (T) {
      set(T, { V1: { st: -0.2, t: 0.26, qrs: [[24, 0.62, 9], [56, -0.4, 10]] }, V2: { st: -0.32, t: 0.34, qrs: [[30, 1.15, 10], [60, -0.4, 9]] },
        V3: { st: -0.27, t: 0.36, qrs: [[30, 1.2, 10], [62, -0.42, 9]] }, V4: { st: -0.12 }, II: { st: 0.03 } });
    },
    lbbb: function (T, o) {
      o.pr = o.pr || 170;
      set(T, { I: { qrs: [[48, 0.72, 17], [102, 0.82, 18]], qd: 150, st: -0.08, t: -0.25 }, II: { qrs: [[48, 0.45, 17], [102, 0.42, 18]], qd: 150, st: -0.03, t: -0.08 },
        V1: { qrs: [[16, 0.1, 6], [82, -1.55, 30]], qd: 150, st: 0.17, t: 0.42 }, V2: { qrs: [[16, 0.14, 6], [84, -2.2, 30]], qd: 150, st: 0.26, t: 0.55 },
        V3: { qrs: [[20, 0.2, 7], [86, -1.6, 30]], qd: 150, st: 0.18, t: 0.45 }, V4: { qrs: [[42, 0.55, 14], [92, -0.6, 22]], qd: 150, st: 0.04, t: 0.15 },
        V5: { qrs: [[48, 1.0, 17], [104, 1.05, 18]], qd: 150, st: -0.11, t: -0.32 }, V6: { qrs: [[48, 0.92, 17], [104, 0.95, 18]], qd: 150, st: -0.1, t: -0.3 } });
    },
    rbbb: function (T) {
      set(T, { I: { qrs: [[14, -0.04, 5], [40, 0.65, 9.5], [98, -0.32, 17]], qd: 140 }, II: { qrs: [[14, -0.06, 5], [40, 0.95, 9.5], [98, -0.25, 17]], qd: 140 },
        V1: { qrs: [[18, 0.3, 6.5], [44, -0.5, 8], [94, 0.95, 15]], qd: 140, st: -0.05, t: -0.3 }, V2: { qrs: [[20, 0.45, 7], [50, -0.85, 9], [98, 0.65, 15]], qd: 140, st: -0.03, t: -0.18 },
        V3: { qrs: [[26, 0.7, 8], [60, -0.55, 9], [102, 0.22, 13]], qd: 140, t: 0.18 }, V4: { qrs: [[12, -0.04, 5], [38, 1.3, 10], [96, -0.45, 17]], qd: 140 },
        V5: { qrs: [[12, -0.07, 5], [40, 1.4, 10], [96, -0.4, 17]], qd: 140 }, V6: { qrs: [[12, -0.08, 5], [42, 1.1, 10], [96, -0.35, 17]], qd: 140 } });
    },
    wpw: function (T, o) {
      o.pr = o.pr || 100;
      function d(a, r, s) { return [[0, 52, 92, a], [72, r, 9], [100, s, 9]]; }
      set(T, { I: { qrs: d(0.42, 0.72, -0.08), qd: 132, t: 0.12, st: -0.03 }, II: { qrs: d(0.28, 0.55, -0.1), qd: 132, t: 0.12 },
        V1: { qrs: d(0.32, 0.62, -0.35), qd: 132, st: -0.06, t: -0.18 }, V2: { qrs: d(0.48, 1.05, -0.4), qd: 132, st: -0.05, t: -0.08 },
        V3: { qrs: d(0.5, 1.25, -0.3), qd: 132, t: 0.2 }, V4: { qrs: d(0.5, 1.45, -0.2), qd: 132, t: 0.3 },
        V5: { qrs: d(0.45, 1.35, -0.08), qd: 132, t: 0.25 }, V6: { qrs: d(0.38, 1.1, -0.05), qd: 132, t: 0.2 } });
    },
    hyperk: function (T, o) {
      o.pr = o.pr || 230; o.qtc = o.qtc || 0.38;
      var TA = { I: 0.42, II: 0.72, V1: 0.32, V2: 1.25, V3: 1.4, V4: 1.2, V5: 0.85, V6: 0.6 };
      L8.forEach(function (L) {
        var t = T[L]; t.p = t.p.map(function (c) { return [c[0] * 1.25, c[1] * 0.35, c[2] * 1.4]; });
        t.qrs = t.qrs.map(function (c) { return [c[0] * 1.45, c[1] * (c[1] < 0 ? 1.15 : 0.85), c[2] * 1.6]; }); t.qd = 135;
        t.t = TA[L]; t.ts = [27, 23]; t.st = 0;
      });
    },
    brugada: function (T) {
      set(T, { V1: { qrs: [[20, 0.15, 6], [44, -0.6, 9], [80, 0.5, 10]], qd: 100, st: 0.52, cove: 1, t: -0.34, ts: [48, 42] },
        V2: { qrs: [[22, 0.3, 7], [52, -0.9, 10], [84, 0.42, 10]], qd: 100, st: 0.42, cove: 1, t: -0.26, ts: [48, 42] } });
    },
    longqt: function (T, o) {
      o.qtc = o.qtc || 0.59;
      set(T, { II: { t: 0.28, t2: [0.16, 80, 34] }, I: { t: 0.18 }, V2: { t: 0.38, t2: [0.2, 85, 34] }, V3: { t: 0.4, t2: [0.22, 85, 34] }, V4: { t: 0.36, t2: [0.18, 80, 34] }, V5: { t: 0.32 }, V6: { t: 0.26 } });
    },
    pericarditis: function (T) {
      set(T, { I: { st: 0.15, prs: -0.04, t: 0.3 }, II: { st: 0.2, prs: -0.09, t: 0.38 }, V1: { st: -0.05, prs: 0.03 }, V2: { st: 0.2, prs: -0.03 }, V3: { st: 0.23, prs: -0.05 },
        V4: { st: 0.22, prs: -0.07 }, V5: { st: 0.2, prs: -0.07 }, V6: { st: 0.16, prs: -0.06 } });
    },
    wellens: function (T) {
      set(T, { V1: { t: -0.25, ts: [55, 55] }, V2: { t: -0.72, ts: [58, 58], st: 0.05 }, V3: { t: -0.78, ts: [58, 58], st: 0.04 }, V4: { t: -0.52, ts: [56, 56] }, V5: { t: -0.12, ts: [50, 50] } });
    },
    lvh: function (T) {
      set(T, { I: { qrs: [[14, -0.05, 5], [44, 1.55, 10.5], [74, -0.1, 8]], qd: 100, st: -0.1, t: -0.24, ts: [72, 30] }, II: { qrs: [[14, -0.05, 5], [44, 0.85, 10.5], [74, -0.12, 8]], qd: 100, st: -0.05, t: -0.04 },
        V1: { qrs: [[20, 0.15, 6.5], [54, -2.0, 13]], qd: 100, st: 0.12, t: 0.22 }, V2: { qrs: [[22, 0.3, 7.5], [56, -2.7, 13]], qd: 100, st: 0.16, t: 0.38 },
        V3: { qrs: [[28, 0.7, 9], [62, -1.6, 12]], qd: 100, st: 0.08, t: 0.3 }, V4: { qrs: [[40, 2.0, 10.5], [72, -0.5, 9]], qd: 100, st: -0.05, t: 0.05 },
        V5: { qrs: [[12, -0.06, 5], [44, 2.7, 10.5], [74, -0.2, 8]], qd: 100, st: -0.15, t: -0.3, ts: [72, 30] }, V6: { qrs: [[12, -0.06, 5], [44, 2.1, 10.5], [74, -0.1, 8]], qd: 100, st: -0.13, t: -0.26, ts: [72, 30] } });
    },
    hypok: function (T, o) {
      o.pr = o.pr || 200;
      var U = { I: [0.07, 0.06, -0.03], II: [0.09, 0.13, -0.06], V1: [0.03, 0.08, 0], V2: [0.1, 0.34, -0.06], V3: [0.1, 0.36, -0.07], V4: [0.09, 0.26, -0.06], V5: [0.07, 0.13, -0.05], V6: [0.05, 0.08, -0.04] };
      L8.forEach(function (L) { var t = T[L]; t.t = U[L][0]; t.u = U[L][1]; t.st = U[L][2]; t.p = t.p.map(function (c) { return [c[0], c[1] * 1.4, c[2]]; }); });
    },
    hypothermia: function (T, o) {
      o.pr = o.pr || 220; o.qtc = o.qtc || 0.5;
      var J = { I: 0.18, II: 0.36, V1: 0.06, V2: 0.2, V3: 0.4, V4: 0.52, V5: 0.55, V6: 0.45 };
      L8.forEach(function (L) { T[L].j = J[L]; T[L].qd = 100; });
    },
    dewinter: function (T) {
      set(T, { V1: { st: 0.04 }, V2: { st: -0.36, ups: 1, t: 0.95, ts: [42, 36] }, V3: { st: -0.42, ups: 1, t: 1.1, ts: [42, 36] }, V4: { st: -0.38, ups: 1, t: 0.98, ts: [42, 36] },
        V5: { st: -0.2, ups: 1, t: 0.62, ts: [44, 38] }, V6: { st: -0.12, ups: 1, t: 0.45 }, I: { st: -0.08 }, II: { st: -0.13 } });
    }
  };
  // Wide-complex beats (ectopic, ventricular, paced): lead II shape, scaled per lead.
  var WIDE = {
    pvc: { qrs: [[48, 1.35, 22], [112, -0.25, 18]], qd: 150, t: -0.45, ts: [55, 45] },
    vt: { qrs: [[26, 0.25, 11], [82, -1.25, 28], [140, 0.18, 14]], qd: 165, t: 0.42, ts: [50, 45] },
    esc: { qrs: [[40, 0.25, 13], [95, -0.95, 28]], qd: 160, t: 0.42, ts: [70, 55] },
    paced: { qrs: [[58, -0.95, 27], [112, -0.15, 18]], qd: 155, t: 0.35, ts: [70, 55] },
    tdp: { qrs: [[62, 1.3, 36], [190, -0.75, 40]], qd: 250, t: 0 }
  };
  var WF = { I: 0.55, II: 1, V1: -0.85, V2: -1, V3: -0.55, V4: 0.45, V5: 0.9, V6: 1 };

  // ---------- rhythm: list of P waves and QRS complexes (times in s) ----------
  function rhythm(R, dur, rnd, opt) {
    var P = [], Q = [], base = null, spikes = [], start = -1.8, end = dur + 1, t, n = 0, type = R.type || "sinus";
    var prDef = R.pr || opt.pr || 160;
    function beat(tp, pr, m, extra) { var p = { t: tp, pf: 1, pw: 1, c: pr != null }; if (extra) Object.keys(extra).forEach(function (k) { p[k] = extra[k]; }); P.push(p); if (pr != null) Q.push({ t: tp + pr / MS, m: m || "n", pOn: -pr }); }
    var rr0 = 60 / (R.rate || 75);
    if (type === "sinus") {
      var ect = {}; (R.ectopics || []).forEach(function (e) { ect[e.n] = e.type; });
      var paused = false; t = start + rnd() * rr0;
      while (t < end) {
        var rr = rr0 * (1 + (R.sa || 0) * Math.sin(2 * Math.PI * t / (R.saP || 4.6))) * (1 + (rnd() - 0.5) * 0.025);
        if (R.pause && !paused && t + rr > R.pause.at) { paused = true; beat(t, prDef); t += R.pause.len; n++; continue; }
        var e = ect[n] || (R.bigeminy && n % 2 === 1 ? R.bigeminy : null);
        var lq = Q[Q.length - 1];
        if (e === "pvc" && lq) { Q.push({ t: lq.t + rr * (R.coupling || 0.56), m: "pvc", ect: 1 }); P.push({ t: t, pf: 1, pw: 1, c: false, hid: 1 }); t += rr; n++; continue; }
        if (e === "pac" && lq) { var tp = lq.t + rr * 0.7 - prDef / MS; P.push({ t: tp, pf: R.pacPf == null ? -0.75 : R.pacPf, pw: 0.85, c: true, ect: 1 }); Q.push({ t: tp + (prDef + 20) / MS, m: "n", pOn: -(prDef + 20), ect: 1 }); t = tp + rr; n++; continue; }
        beat(t, prDef); t += rr; n++;
      }
    } else if (type === "wenck") {
      var prs = R.prs || [180, 280, 330], cyc = prs.length + 1, pp = 60 / R.rate; n = R.phase || 0; t = start;
      while (t < end) { var k = n % cyc; if (k < prs.length) beat(t, prs[k]); else P.push({ t: t, pf: 1, pw: 1, c: false }); t += pp; n++; }
    } else if (type === "mobitz2") {
      var pat = R.conduct || [1, 1, 1, 0], pp2 = 60 / R.rate; n = R.phase || 0; t = start;
      while (t < end) { if (pat[n % pat.length]) beat(t, prDef); else P.push({ t: t, pf: 1, pw: 1, c: false }); t += pp2; n++; }
    } else if (type === "chb") {
      var pa = 60 / R.rate, pv = 60 / R.vrate;
      for (t = start + rnd() * pa; t < end; t += pa * (1 + (rnd() - 0.5) * 0.03)) P.push({ t: t, pf: 1, pw: 1, c: false });
      for (t = start + (R.voff || 0.9); t < end; t += pv) Q.push({ t: t, m: R.escape === "narrow" ? "n" : "esc" });
    } else if (type === "af") {
      var mean = 60 / R.rate, prev = 1; t = start;
      while (t < end) { Q.push({ t: t, m: "n" }); var x = 0.52 + rnd() * 0.96; x = 0.6 * x + 0.4 * prev; prev = 0.52 + rnd() * 0.96; t += Math.max(0.3, mean * x); }
      base = { type: "af", amp: R.f || 0.06, ph: [rnd() * 6, rnd() * 6, rnd() * 6, rnd() * 6] };
    } else if (type === "flutter") {
      var cy = 60 / (R.arate || 300), t0 = start + rnd() * cy, ratios = R.ratios || [2], fr = R.fr || 0.26, i = 0;
      base = { type: "flutter", cyc: cy, t0: t0, amp: R.famp || 0.24 };
      for (t = t0; t < end; i++) { Q.push({ t: t + fr, m: "n" }); t += cy * ratios[i % ratios.length]; }
    } else if (type === "svt") {
      for (t = start; t < end; t += 60 / R.rate) { Q.push({ t: t, m: "n" }); if (R.retro) P.push({ t: t + 0.035, pf: -0.45, pw: 0.7, c: false, retro: 1 }); }
    } else if (type === "vt") {
      for (t = start + 0.1; t < end; t += 60 / R.rate) Q.push({ t: t, m: "vt" });
      var pa2 = 60 / (R.arate || 78); for (t = start + 0.37; t < end; t += pa2) P.push({ t: t, pf: 0.9, pw: 1, c: false });
    } else if (type === "vf") {
      base = { type: "vf", amp: R.amp || 0.45, ph: [rnd() * 6, rnd() * 6, rnd() * 6, rnd() * 6, rnd() * 6] };
    } else if (type === "torsades") {
      var from = R.from || 3.2; t = start;
      while (t + rr0 < from) { beat(t, prDef); t += rr0; }
      var lq2 = Q[Q.length - 1], tq = lq2.t + 0.48, ti = 60 / (R.trate || 230), tw = R.tw || 2.2;
      for (; tq < end; tq += ti * (1 + (rnd() - 0.5) * 0.08)) { var ph = Math.cos(2 * Math.PI * (tq - (lq2.t + 0.48)) / tw - 0.3); Q.push({ t: tq, m: "tdp", amp: (ph < 0 ? -1 : 1) * Math.max(0.22, Math.abs(ph)), tdp: 1 }); }
      opt.tdpFrom = lq2.t + 0.48;
    } else if (type === "junctional") {
      for (t = start + rnd() * rr0; t < end; t += rr0 * (1 + (rnd() - 0.5) * 0.02)) { Q.push({ t: t, m: "n" }); if (R.retro !== false) P.push({ t: t + 0.075, pf: -0.85, pw: 0.85, c: false, retro: 1 }); }
    } else if (type === "mat") {
      var MP = [[1, 1], [-0.55, 0.85], [0.5, 1.45], [1.55, 0.7], [0.35, 1.1]], PR = [120, 150, 175, 200, 135]; t = start;
      while (t < end) { var j = Math.floor(rnd() * MP.length); beat(t, PR[j], "n", { pf: MP[j][0], pw: MP[j][1], mat: j }); t += rr0 * (0.72 + rnd() * 0.56); }
    } else if (type === "paced") {
      var av = (R.av || 160) / MS;
      for (t = start; t < end; t += rr0) {
        if (R.mode !== "vvi") { P.push({ t: t + 0.004, pf: 0.8, pw: 1.15, c: true }); spikes.push({ t: t, a: 0.9 }); }
        spikes.push({ t: t + av, a: 1.6 }); Q.push({ t: t + av + 0.004, m: "paced", pOn: R.mode !== "vvi" ? -(av * MS) : null });
      }
    }
    P.sort(function (a, b) { return a.t - b.t; }); Q.sort(function (a, b) { return a.t - b.t; });
    if (R.alternans) Q.forEach(function (q, i3) { if (i3 % 2) q.amp = R.alternans; }); // electrical alternans
    Q.forEach(function (q, i2) { q.rr = i2 ? q.t - Q[i2 - 1].t : (Q[1] ? Q[1].t - q.t : rr0); });
    return { P: P, Q: Q, base: base, spikes: spikes };
  }

  // ---------- signal ----------
  function mk(cfg, seedStr) {
    var seed = hashStr(seedStr || "x"), rnd = rngFrom(seed), opt = { pr: cfg.pr, qtc: cfg.qtc };
    var T = clone(BASE);
    (PRESETS[cfg.preset || "normal"] || PRESETS.normal)(T, opt);
    if (cfg.tweaks) Object.keys(cfg.tweaks).forEach(function (L) { Object.keys(cfg.tweaks[L]).forEach(function (k) { T[L][k] = cfg.tweaks[L][k]; }); });
    // optional low-voltage scaling of every QRS and T (e.g. pericardial effusion)
    if (cfg.volt) L8.forEach(function (L) { var t = T[L]; t.qrs = t.qrs.map(function (c) { return c.length === 3 ? [c[0], c[1] * cfg.volt, c[2]] : [c[0], c[1], c[2], c[3] * cfg.volt]; }); if (t.t) t.t *= cfg.volt; });
    var dur = cfg.dur || 10, R = cfg.rhythm || { type: "sinus", rate: 75 };
    var rh = rhythm(R, dur, rnd, opt), qtc = (opt.qtc || cfg.qtc || 0.41) * MS;
    var LI = {}; L8.forEach(function (L, i) { LI[L] = i + 1; });
    function tpl(L, m) {
      if (m === "n") return T[L];
      var w = WIDE[m], f = WF[L] || 1, o = { qrs: w.qrs.map(function (c) { return [c[0], c[1] * f, c[2]]; }), qd: w.qd, t: w.t * f, ts: w.ts };
      if (m === "tdp") o.t = 0;
      return o;
    }
    function qtOf(q, tl) {
      var rr = q.rr * MS, qt = qtc * Math.sqrt(q.rr);
      if (q.m === "pvc" || q.m === "esc" || q.m === "paced" || q.m === "vt") qt += 40;
      qt = Math.min(qt, rr * 0.82); return Math.max(qt, tl.qd + 150);
    }
    function beatV(L, tl, tau, q) {
      var v = 0, c = tl.qrs, i;
      for (i = 0; i < c.length; i++) {
        var k = c[i];
        if (k.length === 3) v += k[1] * gauss(tau, k[0], k[2]);
        else if (tau > k[0] && tau < k[2]) v += k[3] * (tau < k[1] ? sstep((tau - k[0]) / (k[1] - k[0])) * 0.85 + 0.15 * (tau - k[0]) / (k[1] - k[0]) : 1 - sstep((tau - k[1]) / (k[2] - k[1])));
      }
      if (tl.t || tl.st || tl.u || tl.t2) {
        var QT = q.qt, qd = tl.qd, s1 = tl.ts ? tl.ts[0] : 0.22 * (QT - qd), s2 = tl.ts ? tl.ts[1] : 0.15 * (QT - qd), tp = QT - 2.4 * s2;
        if (tl.t) v += tl.t * gauss(tau, tp, tau < tp ? s1 : s2);
        if (tl.t2) v += tl.t2[0] * gauss(tau, tp + tl.t2[1], tl.t2[2]);
        if (tl.u) v += tl.u * gauss(tau, QT + 85, 38);
        if (tl.st) {
          var on = sig((tau - (qd - 8)) / 3.5), off;
          if (tl.cove) off = sig(-(tau - (qd + 0.45 * (tp - qd))) / (0.28 * (tp - qd)));
          else if (tl.ups) off = sig(-(tau - (qd + 80)) / 24);
          else off = sig(-(tau - (tp + 0.35 * s2)) / (0.42 * s2));
          v += tl.st * on * off;
        }
      }
      if (tl.j) v += tl.j * gauss(tau, tl.qd + 12, 17);
      if (tl.prs && q.pOn != null) v += tl.prs * sig((tau - (q.pOn + 112)) / 5) * sig(-(tau + 4) / 3);
      return v;
    }
    rh.Q.forEach(function (q) { q.qt = qtOf(q, tpl("II", q.m)); });
    var b = rh.base, tremor = cfg.tremor || 0, noise = cfg.noise == null ? 0.012 : cfg.noise;
    var FF = { I: 0.45, II: 1, V1: 1.5, V2: 1.1, V3: 0.8, V4: 0.6, V5: 0.5, V6: 0.45 };
    var wph = {}; L8.forEach(function (L) { wph[L] = rnd() * 6.28; });
    function base8(L, t) {
      var v = 0, i, tl;
      for (i = 0; i < rh.P.length; i++) {
        var p = rh.P[i], d = (t - p.t) * MS; if (d < -5 || d > 170 * p.pw) continue;
        tl = T[L].p; for (var k = 0; k < tl.length; k++) v += tl[k][1] * p.pf * gauss(d, tl[k][0] * p.pw, tl[k][2] * p.pw);
      }
      for (i = 0; i < rh.Q.length; i++) {
        var q = rh.Q[i], tau = (t - q.t) * MS; if (tau < -420 || tau > 1000) continue;
        var tq = tpl(L, q.m); v += (q.amp == null ? 1 : q.amp) * beatV(L, tq, tau, q);
      }
      if (b) {
        var f = FF[L] || 0.6;
        if (b.type === "af") v += b.amp * f * (0.6 + 0.4 * Math.sin(0.9 * t + b.ph[3])) * (Math.sin(2 * Math.PI * 5.4 * t + b.ph[0]) * 0.6 + Math.sin(2 * Math.PI * 7.1 * t + b.ph[1] + 0.7 * Math.sin(1.3 * t)) * 0.5 + Math.sin(2 * Math.PI * 8.6 * t + b.ph[2]) * 0.35);
        if (b.type === "flutter") {
          var ph = (((t - b.t0) / b.cyc) % 1 + 1) % 1, s;
          if (ph < 0.55) s = 0.22 - 0.3 * (ph / 0.55); else if (ph < 0.72) s = -0.08 - 0.42 * sstep((ph - 0.55) / 0.17); else s = -0.5 + 0.72 * sstep((ph - 0.72) / 0.28);
          v += b.amp * 2 * s * (L === "V1" ? -0.6 : L === "I" ? 0.2 : f);
        }
        if (b.type === "vf") {
          var e1 = 0.55 + 0.45 * Math.sin(2 * Math.PI * 0.23 * t + b.ph[4]);
          v += b.amp * f * e1 * (Math.sin(2 * Math.PI * 4.6 * t + b.ph[0] + 1.1 * Math.sin(2 * Math.PI * 0.5 * t)) + 0.6 * Math.sin(2 * Math.PI * 6.3 * t + b.ph[1] + 0.9 * Math.sin(2 * Math.PI * 0.37 * t + b.ph[2])) + 0.3 * Math.sin(2 * Math.PI * 3.1 * t + b.ph[3]));
        }
      }
      for (i = 0; i < rh.spikes.length; i++) { var sd = Math.abs(t - rh.spikes[i].t) * MS; if (sd < 1.6) v += rh.spikes[i].a * (1 - sd / 1.6) * (L === "V1" ? -0.6 : 1); }
      var sn = Math.round(t * 500);
      v += 0.035 * Math.sin(2 * Math.PI * 0.21 * t + wph[L]) + 0.02 * Math.sin(2 * Math.PI * 0.07 * t + wph[L] * 2);
      v += noise * (hn(seed, LI[L], sn) + 0.6 * hn(seed + 7, LI[L], sn >> 1));
      if (tremor) v += tremor * (Math.sin(2 * Math.PI * 11 * t + 3 * hn(seed, LI[L], sn >> 4)) * 0.6 + hn(seed + 3, LI[L], sn));
      return v;
    }
    function lead(L, t) {
      if (T[L]) return base8(L, t);
      var a = base8("I", t), c = base8("II", t);
      if (L === "III") return c - a; if (L === "aVR") return -(a + c) / 2; if (L === "aVL") return a - c / 2; if (L === "aVF") return c - a / 2; return 0;
    }
    return { lead: lead, rh: rh, T: T, dur: dur, opt: opt };
  }

  // ---------- drawing ----------
  function f2(x) { return Math.round(x * 100) / 100; }
  function grid(W, H) {
    var mi = "", ma = "", x, y;
    for (x = 0; x <= W; x++) (x % 5 ? (mi += "M" + x + " 0V" + H) : (ma += "M" + x + " 0V" + H));
    for (y = 0; y <= H; y++) (y % 5 ? (mi += "M0 " + y + "H" + W) : (ma += "M0 " + y + "H" + W));
    return '<rect class="ppr" width="' + W + '" height="' + H + '"/><path class="gmi" d="' + mi + '"/><path class="gma" d="' + ma + '"/>';
  }
  function trace(E, L, t0, t1, x0, base) {
    var pts = [], dt = 0.002, t, sp = E.rh.spikes.filter(function (s) { return s.t >= t0 && s.t <= t1; }), times = [];
    for (t = t0; t <= t1 + 1e-9; t += dt) times.push(t);
    sp.forEach(function (s) { times.push(s.t - 0.0009, s.t, s.t + 0.0009); });
    if (sp.length) times.sort(function (a, b) { return a - b; });
    for (var i = 0; i < times.length; i++) { t = times[i]; pts.push(f2(x0 + (t - t0) * SPEED) + " " + f2(base - E.lead(L, t) * GAIN)); }
    return '<path class="tr" d="M' + pts.join("L") + '"/>';
  }
  function cal(x, base) { return '<path class="tr" d="M' + x + " " + base + "H" + (x + 2) + "V" + (base - GAIN) + "H" + (x + 7) + "V" + base + "H" + (x + 9) + '"/>'; }
  function label(x, y, s) { return '<text class="ld" x="' + x + '" y="' + y + '">' + s + "</text>"; }

  // Key-feature overlays for a strip-like row covering [t0, t1] at (x0, base).
  function marks(E, list, t0, t1, x0, base, first) {
    var o = "", rh = E.rh, X = function (t) { return f2(x0 + (t - t0) * SPEED); }, inR = function (t) { return t >= t0 && t <= t1; };
    function tri(t, y, up) { var x = X(t); return '<path class="hm" d="M' + f2(x - 1.1) + " " + f2(y) + "L" + f2(x + 1.1) + " " + f2(y) + "L" + x + " " + f2(up ? y - 1.8 : y + 1.8) + 'Z"/>'; }
    function brk(a, b, y, txt) { return '<path class="hb" d="M' + X(a) + " " + f2(y - 1) + "V" + f2(y) + "H" + X(b) + "V" + f2(y - 1) + '"/>' + (txt ? '<text class="ht" x="' + f2((+X(a) + +X(b)) / 2) + '" y="' + f2(y + 2.6) + '">' + txt + "</text>" : ""); }
    function box(a, b, y0, y1, txt) { return '<rect class="hr" x="' + X(a) + '" y="' + f2(y0) + '" width="' + f2((b - a) * SPEED) + '" height="' + f2(y1 - y0) + '" rx="0.8"/>' + (txt ? '<text class="ht" x="' + f2((+X(a) + +X(b)) / 2) + '" y="' + f2(y0 - 0.8) + '">' + txt + "</text>" : ""); }
    list.forEach(function (m) {
      if (m === "p" || m === "dissoc") rh.P.forEach(function (p) { var tp = p.t + 0.05 * p.pw; if (inR(tp)) o += tri(tp, base - 4.2, false); });
      if (m === "dropped") rh.P.forEach(function (p) { if (!p.c && !p.hid && inR(p.t + 0.05)) o += box(Math.max(t0, p.t - 0.03), Math.min(t1, p.t + 0.15), base - 4.5, base + 2.5, "no QRS"); });
      if (m === "pr") rh.Q.forEach(function (q) { if (q.pOn != null && inR(q.t + q.pOn / MS) && inR(q.t)) o += brk(q.t + q.pOn / MS, q.t, base + 4, Math.round(-q.pOn / 10) * 10 + ""); });
      if (m === "qrs" || m === "qt") { var n = 0; rh.Q.forEach(function (q) { var tl = q.m === "n" ? E.T.II : WIDE[q.m] || E.T.II, end = m === "qrs" ? q.t + tl.qd / MS : q.t + q.qt / MS; if (n < 1 && inR(q.t) && inR(end) && !q.tdp) { n++; o += brk(q.t, end, base + 5, (m === "qrs" ? "QRS " : "QT ") + Math.round((end - q.t) * 100) * 10); } }); }
      if (m === "rr") for (var i = 1; i < rh.Q.length; i++) { var a = rh.Q[i - 1].t, b = rh.Q[i].t; if (inR(a) && inR(b)) o += '<text class="ht" x="' + f2((+X(a) + +X(b)) / 2) + '" y="' + f2(base - 14) + '">' + Math.round((b - a) * 100) / 100 + "s</text>"; }
      if (m === "f" && first) o += box(t0 + 0.05, t1 - 0.05, base - 2.6, base + 2.6, "no P waves, chaotic baseline");
      if (m === "flutter" && rh.base) { var cy = rh.base.cyc; for (var tf = rh.base.t0 + 0.72 * cy; tf < t1; tf += cy) if (inR(tf)) o += tri(tf, base + 6.8, true); }
      if (m === "pause") { for (var j = 1; j < rh.Q.length; j++) { var g = rh.Q[j].t - rh.Q[j - 1].t; if (g > 1.8 && inR(rh.Q[j - 1].t) && inR(rh.Q[j].t)) o += box(rh.Q[j - 1].t + 0.12, rh.Q[j].t - 0.03, base - 6, base + 4, "pause " + (Math.round(g * 10) / 10) + " s"); } }
      if (m === "spike") rh.spikes.forEach(function (s) { if (inR(s.t)) o += tri(s.t, base - 17, false); });
      if (m === "ectopic") rh.Q.forEach(function (q) { if (q.ect && inR(q.t - 0.15) && inR(q.t + 0.3)) o += box(q.t - (q.m === "n" ? 0.14 : 0.02), q.t + 0.18, base - 15, base + 6, q.m === "pvc" ? "PVC" : "PAC"); });
      if (m === "twist" && E.opt.tdpFrom != null && first) { var a2 = Math.max(t0, E.opt.tdpFrom); if (a2 < t1) o += box(a2, t1 - 0.02, base - 16, base + 9, "twisting points"); }
    });
    return o;
  }

  function render(cfg, seedStr) {
    var E = mk(cfg, seedStr), hl = cfg.marks || [], out, W, H;
    if (cfg.layout === "12") {
      W = 260; H = 130;
      var rows = [["I", "aVR", "V1", "V4"], ["II", "aVL", "V2", "V5"], ["III", "aVF", "V3", "V6"]], s = "", ov = "";
      rows.forEach(function (row, r) {
        var base = 19 + r * 30; s += cal(1, base);
        row.forEach(function (L, c) {
          var t0 = c * 2.5, x0 = 10 + c * 62.5;
          s += trace(E, L, t0 + (c ? 0.002 : 0), t0 + 2.5, x0, base) + label(x0 + 1.4, base - 12.2, L);
          if (c) s += '<path class="tr" d="M' + x0 + " " + (base - 2.5) + "V" + (base + 2.5) + '"/>';
        });
      });
      var rb = 19 + 3 * 30; s += cal(1, rb) + trace(E, cfg.rhythmLead || "II", 0, 10, 10, rb) + label(11.4, rb - 12.2, cfg.rhythmLead || "II");
      (cfg.boxes || []).forEach(function (bx, k) {
        bx.leads.forEach(function (L) {
          rows.forEach(function (row, r) { var c = row.indexOf(L); if (c < 0) return; var x = 10 + c * 62.5, y = 19 + r * 30 - 15.5;
            ov += '<rect class="hl-box t' + (bx.tone || 1) + '" x="' + (x + 0.6) + '" y="' + y + '" width="61.3" height="27" rx="1.2"/>' + '<text class="hl-tag t' + (bx.tone || 1) + '" x="' + (x + 60.5) + '" y="' + (y + 3.6) + '">' + bx.label + "</text>"; });
        });
      });
      ov += marks(E, hl, 0, 10, 10, rb, true);
      out = s + '<g class="hl">' + ov + "</g>";
    } else {
      var rowsN = Math.ceil(E.dur / 5); W = 135; H = rowsN * 30 + 10;
      var s2 = "", ov2 = "";
      for (var r = 0; r < rowsN; r++) {
        var base2 = 19 + r * 30, t0b = r * 5, x0b = 8;
        if (r === 0) s2 += cal(-1, base2);
        s2 += trace(E, "II", t0b, Math.min(E.dur, t0b + 5), x0b, base2) + label(x0b + 0.8, base2 - 13.5, "II");
        ov2 += marks(E, hl, t0b, Math.min(E.dur, t0b + 5), x0b, base2, r === 0);
      }
      out = s2 + '<g class="hl">' + ov2 + "</g>";
    }
    var foot = '<text class="ft" x="' + (W - 2) + '" y="' + (H - 2.2) + '">25 mm/s · 10 mm/mV</text>';
    return { svg: '<svg class="ecg" viewBox="0 0 ' + W + " " + H + '" data-w="' + W + '" preserveAspectRatio="xMinYMin meet" role="img" aria-label="ECG ' + (cfg.layout === "12" ? "12-lead" : "lead II rhythm strip") + '">' + grid(W, H) + out + foot + "</svg>", W: W, H: H };
  }
  window.ARX_ECG = { render: render, presets: Object.keys(PRESETS) };
})();
