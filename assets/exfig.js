/* Malady Wise exercise figures + printable handout layout.
   Every <li data-ex="key"> inside ol.ex gets a small inline SVG (viewBox 160x110) from FIGS below.
   Figures are built from a tiny pose kit: joint angles (forward kinematics) or a hand/foot target (2-bone IK).
   Angle convention: 0 = straight down, 90 = forward (screen right), 180 = up, -90 = back (screen left).
   Side views face right. Near limbs are dark, far limbs lighter. Ghost (faded) pose = start position. */
(function () {
  "use strict";
  var OL = "#F1ECF8", B = "#4A3480", FAR = "#9C8BCB", PF = "#E4DFEA", PS = "#B3ABC2", AC = "#B5308A", BAND = "#E6A3CB", WT = "#7F778E";
  var T = 27, TH = 21, SH = 20, FT = 8, UA = 14, FA = 13, HR = 6.5, HN = 9, FY = 101;
  function rad(a) { return a * Math.PI / 180; }
  function dv(a) { return [Math.sin(rad(a)), Math.cos(rad(a))]; }
  function mv(p, a, l) { var d = dv(a); return [p[0] + d[0] * l, p[1] + d[1] * l]; }
  function ang(p, q) { return Math.atan2(q[0] - p[0], q[1] - p[1]) * 180 / Math.PI; }
  function n(v) { return Math.round(v * 10) / 10; }
  function pt(p) { return n(p[0]) + " " + n(p[1]); }
  function ik(p, q, a, b, bend) {
    var d = Math.hypot(q[0] - p[0], q[1] - p[1]); d = Math.max(Math.abs(a - b) + 0.01, Math.min(d, a + b - 0.01));
    var k = Math.acos((a * a + d * d - b * b) / (2 * a * d)) * 180 / Math.PI, m = mv(p, ang(p, q) + bend * k, a);
    return [p, m, mv(m, ang(m, q), b)];
  }
  function chain(root, s, a, b, def) {
    if (!s) s = def;
    if (Array.isArray(s)) { var m = mv(root, s[0], a); return [root, m, mv(m, s[1], b)]; }
    return ik(root, s.to, a, b, s.b == null ? 1 : s.b);
  }
  function L(pts, col, w, extra) {
    return '<path d="M' + pts.map(pt).join("L") + '" fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (extra || "") + "/>";
  }
  function C(p, r, fill, extra) { return '<circle cx="' + n(p[0]) + '" cy="' + n(p[1]) + '" r="' + r + '" fill="' + fill + '"' + (extra || "") + "/>"; }
  function bell(p, a) { // small dumbbell at a hand, bar along angle a
    var e1 = mv(p, a, 4), e2 = mv(p, a, -4);
    return L([e1, e2], WT, 2) + L([mv(e1, a, 0), mv(e1, a, 1.5)], WT, 4.5) + L([mv(e2, a, 0), mv(e2, a, -1.5)], WT, 4.5);
  }
  // ---- the figure ----
  function pose(o) {
    var h = o.hip, t = o.t == null ? 180 : o.t, fr = !!o.front, s = "", P = {};
    var sh = o.sh || mv(h, t, T);
    var h1 = fr ? mv(h, t - 90, -4.5) : h, h2 = fr ? mv(h, t - 90, 4.5) : h;
    var s1 = fr ? mv(sh, t - 90, -9.5) : sh, s2 = fr ? mv(sh, t - 90, 9.5) : sh;
    if (o.sy) { s1 = [s1[0], s1[1] - o.sy]; s2 = [s2[0], s2[1] - o.sy]; }
    var l1 = chain(h1, o.l1, TH, SH, [0, 0]), l2 = chain(h2, o.l2, TH, SH, [0, 0]);
    var a1 = chain(s1, o.a1, UA, FA, fr ? [-8, -4] : [3, 5]), a2 = chain(s2, o.a2, UA, FA, fr ? [8, 4] : [-3, 2]);
    var hd = o.hc || mv(sh, o.hd == null ? t : o.hd, HN);
    var f1 = o.f1 == null ? (fr ? -90 : 90) : o.f1, f2 = o.f2 == null ? 90 : o.f2, fl = fr ? 4 : FT;
    function foot(l, f, col) { var A = l[2]; return L([mv(A, f, -1.5), mv(A, f, fl)], col, 5.2); }
    var c2 = fr ? B : FAR;
    if (!o.noA2) s += L(a2, c2, 5.4);
    s += L(l2, c2, 6.6) + foot(l2, f2, c2);
    if (fr) s += '<path d="M' + [h1, h2, s2, s1].map(pt).join("L") + 'Z" fill="' + B + '" stroke="' + B + '" stroke-width="6" stroke-linejoin="round"/>';
    else if (o.tb) { var mid = [(h[0] + sh[0]) / 2, (h[1] + sh[1]) / 2], c = mv(mid, t - 90, o.tb); s += '<path d="M' + pt(h) + "Q" + pt(c) + " " + pt(sh) + '" fill="none" stroke="' + B + '" stroke-width="11" stroke-linecap="round"/>'; }
    else s += L([h, sh], B, 11);
    s += L(l1, B, 6.6) + foot(l1, f1, B);
    s += C(hd, HR, B);
    if (!o.noA1) s += (o.ol ? L(a1, OL, 9) : "") + L(a1, B, 5.4);
    if (o.ol2) s += L(a2, OL, 9) + L(a2, B, 5.4);
    if (o.w) { if (o.w.indexOf("1") >= 0) s += bell(a1[2], o.wa == null ? 90 : o.wa); if (o.w.indexOf("2") >= 0) s += bell(a2[2], o.wa == null ? 90 : o.wa); }
    if (o.hl) s += C(o.hlp || h, 8.5, AC, ' fill-opacity=".2" stroke="' + AC + '" stroke-width="1.3" stroke-dasharray="2.5 2"');
    P = { hip: h, sh: sh, hd: hd, K1: l1[1], A1: l1[2], K2: l2[1], A2: l2[2], E1: a1[1], W1: a1[2], E2: a2[1], W2: a2[2], S1: s1, S2: s2 };
    if (o.g) s = '<g opacity=".26">' + s + "</g>";
    if (o.out) o.out.P = P;
    return s;
  }
  function G(o) { return pose(Object.assign({ g: 1 }, o)); }
  // ---- arrows, labels, props ----
  function arrow(d, o) {
    o = o || {};
    var p0 = [d[0], d[1]], c = d.length > 4 ? [d[2], d[3]] : null, p1 = d.length > 4 ? [d[4], d[5]] : [d[2], d[3]];
    function head(tip, from) {
      var a = ang(from, tip), b = mv(tip, a, -6);
      return '<path d="M' + pt(tip) + "L" + pt(mv(b, a + 90, 3.4)) + "L" + pt(mv(b, a - 90, 3.4)) + 'Z" fill="' + AC + '"/>';
    }
    var q1 = mv(p1, ang(c || p0, p1), -4), q0 = o.both ? mv(p0, ang(c || p1, p0), -4) : p0;
    var s = '<path d="M' + pt(q0) + (c ? "Q" + pt(c) + " " : "L") + pt(q1) + '" fill="none" stroke="' + AC + '" stroke-width="2.3" stroke-linecap="round"' + (o.dash ? ' stroke-dasharray="3 2.5"' : "") + "/>";
    s += head(p1, c || p0);
    if (o.both) s += head(p0, c || p1);
    return s;
  }
  function tx(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" font-family="Poppins,system-ui,sans-serif" font-size="' + (o.fs || 8) + '" font-weight="600" fill="' + (o.c || AC) + '" text-anchor="' + (o.a || "middle") + '">' + s + "</text>"; }
  function R(x, y, w, h, r, fill) { return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" rx="' + (r || 1.5) + '" fill="' + (fill || PF) + '" stroke="' + PS + '" stroke-width="1.1"/>'; }
  function floor(x1, x2, y) { return L([[x1 == null ? 6 : x1, y || FY + 0.5], [x2 == null ? 154 : x2, y || FY + 0.5]], PS, 2); }
  function chair(x, back) { // seat from x to x+22 (top y 81); back post on the left (back = -1 puts it on the right)
    var bx = back === -1 ? x + 22 : x;
    return L([[x + 2, 84], [x + 2, FY]], PS, 2.2) + L([[x + 20, 84], [x + 20, FY]], PS, 2.2) + L([[bx, 82], [bx, 53]], PS, 3) + R(x - 1, 80.5, 24, 4, 1.5);
  }
  function bench(x1, x2, y) { y = y || 54; return R(x1, y, x2 - x1, 3.5, 1.2) + L([[x1 + 3, y + 3.5], [x1 + 3, FY]], PS, 2) + L([[x2 - 3, y + 3.5], [x2 - 3, FY]], PS, 2); }
  function benchBack(x1, x2, y) { y = y || 54; return R(x1, y, x2 - x1, 4, 1.5, "#EEEAF2"); } // a kitchen bench running behind the figure
  function wall(x) { return R(x, 8, 5, FY - 8, 1, PF); }
  function step(x, w, h) { return R(x, FY - h, w, h, 1.5); }
  function mat(x1, x2) { return R(x1, FY - 2, x2 - x1, 2.5, 1.2, "#EEEAF2"); }
  function chev(x, y) { return L([[x - 2.5, (y || 60) - 5], [x + 2.5, y || 60], [x - 2.5, (y || 60) + 5]], PS, 2.2); }
  function ball(p, r) { return C(p, r || 5, PF, ' stroke="' + PS + '" stroke-width="1.1"'); }
  function hold(x, y, s) { // small clock + label
    return C([x, y], 4.6, "none", ' stroke="' + AC + '" stroke-width="1.6"') + L([[x, y - 2.6], [x, y], [x + 2, y + 1]], AC, 1.4) + tx(x + 7, y + 3, s || "hold", { a: "start" });
  }
  function band(pts, w) { return L(pts, BAND, w || 2.6); }
  function towel(x, y, w) { return R(x, y, w, 3.5, 1.5, "#F4E8EF"); }
  function big(s, inner, cx) { cx = cx == null ? 80 : cx; return sc(n(cx - cx * s), n(FY - FY * s), s, inner); }
  function sc(x, y, s, inner) { return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')">' + inner + "</g>"; }

  // ---- reusable poses ----
  var ST = { a1: [3, 5], a2: [-3, 2] };
  function stand(x, o) { return Object.assign({ hip: [x, 57], l1: [0, 0], l2: [1.5, 1.5] }, ST, o || {}); }
  function toes(x, ft, o) { // standing on toes; x = toe tip position
    ft = ft || 40; var ax = x - FT * Math.sin(rad(ft)), hy = 98.5 - TH - SH - FT * Math.cos(rad(ft));
    return Object.assign({ hip: [ax, hy], l1: [0, 0], l2: [1.5, 1.5], f1: ft, f2: ft }, ST, o || {});
  }
  function seat(x, o) { return Object.assign({ hip: [x, 78], l1: [90, 0], l2: [88, 2], a1: [30, 75], a2: [25, 70] }, o || {}); }
  function frontStand(x, o) { return Object.assign({ hip: [x, 57], front: 1, l1: [0, 0], l2: [0, 0] }, o || {}); }
  function supineHook(hx, o) { return Object.assign({ hip: [hx, 95.5], t: 90, hc: [hx + 36, 94.5], l1: { to: [hx - 17, 98], b: -1 }, l2: { to: [hx - 15, 98], b: -1 }, f1: 90, f2: 90, a1: [-92, -90], a2: [-90, -88] }, o || {}); }
  function bridgeUp(hx, o) { return Object.assign({ hip: [hx, 86], sh: [hx + 25, 96], hc: [hx + 34, 94.5], l1: { to: [hx - 19, 98], b: -1 }, l2: { to: [hx - 17, 98], b: -1 }, a1: [-94, -90], a2: [-92, -88] }, o || {}); }
  function quad(hx, o) { return Object.assign({ hip: [hx, 76], t: 90, hd: 100, l1: [0, -90], l2: [2, -88], f1: -90, f2: -90, a1: { to: [hx + 28, 98.5], b: -1 }, a2: { to: [hx + 30, 98.5], b: -1 } }, o || {}); }

  // ---- the figures ----
  var F = {};
  function add(keys, alt, draw) { keys.split(" ").forEach(function (k) { F[k] = { alt: alt, draw: draw }; }); }

  add("bridge", "Lying on your back with knees bent and feet flat, lifting the hips off the floor, then lowering", function () {
    return floor() + big(1.3, mat(56, 140) + G(supineHook(92)) + pose(bridgeUp(92)) + arrow([98, 92, 98, 72]), 92);
  });
  add("bridge-line", "Lying on your back with knees bent, hips lifted so the body forms a straight line from shoulders to knees", function () {
    return floor() + big(1.3, mat(56, 140) + G(supineHook(92)) + pose(bridgeUp(92)) + L([[118, 96], [72, 74]], AC, 1, ' stroke-dasharray="2 2.5" opacity=".7"') + arrow([100, 93, 100, 74]), 92);
  });
  add("sit-stand", "Sitting on a chair, then standing up tall and sitting back down slowly", function () {
    return floor() + chair(52) + G(seat(62)) + pose(stand(83, { a1: [10, 20] })) + arrow([66, 70, 74, 52, 82, 47]) + arrow([102, 54, 104, 70], { dash: 1 }) + tx(118, 68, "slowly", { a: "start", fs: 7.5 });
  });
  add("heel-raise", "Standing on both feet, rising up onto the toes, then lowering slowly", function () {
    return floor() + pose(stand(40)) + chev(80) + pose(toes(124)) + arrow([106, 98, 106, 82], { both: 1 });
  });
  add("heel-raise-wall", "Standing on both feet with a hand on a wall for balance, rising onto the toes, then lowering", function () {
    return floor() + wall(64) + wall(148) + pose(stand(40, { a1: { to: [63, 46], b: -1 } })) + pose(toes(124, 40, { a1: { to: [147, 42], b: -1 } })) + arrow([106, 98, 106, 82], { both: 1 });
  });
  add("heel-raise-bench", "Standing at a kitchen bench holding on, rising up onto the toes, then lowering slowly", function () {
    return floor() + benchBack(10, 150) + pose(stand(38, { a1: { to: [50, 54], b: -1 } })) + chev(80, 80) + pose(toes(124, 40, { a1: { to: [132, 54], b: -1 } })) + arrow([104, 98, 104, 82], { both: 1 });
  });
  add("seated-heel", "Sitting with feet flat and a heavy bag resting on the knees, lifting both heels as high as possible, then lowering slowly", function () {
    var o = {}; var up = seat(62, { hip: [62, 73], l1: { to: [86, 92.5], b: 1 }, l2: { to: [88, 92.5], b: 1 }, f1: 40, f2: 40, a1: [40, 110], a2: [35, 105], out: o });
    var s = floor() + chair(52) + G(seat(62)) + pose(up);
    var k = o.P.K1;
    return s + R(k[0] - 12, k[1] - 13, 18, 10, 3, "#EEEAF2") + tx(k[0] - 3, k[1] - 6, "bag", { c: WT, fs: 6.5 }) + arrow([100, 97, 100, 84], { both: 1 });
  });
  add("sl-heel-raise", "Standing on one leg, holding on for balance, rising up onto the toes, then lowering", function () {
    var lift = { l2: [12, -62], f2: 20 };
    return floor() + wall(64) + wall(148) + pose(stand(40, Object.assign({ a1: { to: [63, 46], b: -1 } }, lift))) + pose(toes(124, 40, Object.assign({ a1: { to: [147, 42], b: -1 } }, lift))) + arrow([104, 98, 104, 82], { both: 1 });
  });
  add("eccentric-heel", "Rising onto the toes on both feet, then lifting one foot and lowering slowly on the other leg alone", function () {
    return floor() + pose(toes(40, 40, { a1: [10, 20] })) + chev(80) + G(toes(122, 40, { l2: [10, -60], f2: 20 })) + pose(stand(116, { l2: [10, -60], f2: 20 })) + arrow([100, 82, 100, 97]) + tx(100, 76, "slow", { fs: 7.5 });
  });
  add("bounce", "Standing on the toes of both feet and doing small, quick, springy bounces", function () {
    return floor() + pose(toes(82, 45, { a1: [20, 60], a2: [15, 55] })) + arrow([62, 94, 62, 84], { both: 1 }) + arrow([96, 94, 96, 84], { both: 1 }) + L([[70, 104.5], [76, 104.5]], AC, 1.4) + L([[80, 104.5], [86, 104.5]], AC, 1.4);
  });
  add("hops2", "Two-foot hops on the spot: knees bent, springing up off the floor and landing softly", function () {
    return floor() + pose({ hip: [42, 70], t: 165, l1: { to: [44, 98], b: 1 }, l2: { to: [46, 98], b: 1 }, a1: [-30, 10], a2: [-25, 15] }) + chev(80) + pose({ hip: [116, 48], l1: [5, -5], l2: [7, -3], f1: 45, f2: 45, a1: [125, 145], a2: [115, 140] }) + arrow([140, 96, 140, 66]) + L([[108, 96], [126, 96]], PS, 1.3, ' stroke-dasharray="2 2"');
  });
  add("hop1", "Hopping on one leg: small springy hops, landing softly with a bent knee", function () {
    return floor() + pose({ hip: [48, 68], t: 170, l1: { to: [52, 98], b: 1 }, l2: [30, -60], f2: 20, a1: [-30, 20], a2: [30, 60] }) + chev(84, 50) + pose({ hip: [120, 50], l1: [5, -5], f1: 45, l2: [25, -55], f2: 20, a1: [120, 140], a2: [-20, 10] }) + arrow([66, 86, 92, 56, 116, 88]);
  });
  add("ankle-alpha", "Sitting on a chair with one foot off the floor, drawing the letters of the alphabet in the air with the big toe", function () {
    var o = {};
    var s = floor() + chair(30) + pose(seat(40, { l1: [92, 50], f1: 120, a1: [20, 70], out: o }));
    var t = mv(o.P.A1, 120, FT);
    return s + '<path d="M' + n(t[0] + 6) + " " + n(t[1] + 8) + "l6 -16 l6 16 m-9.5 -6 h7" + '" fill="none" stroke="' + AC + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' + arrow([t[0] + 22, t[1] + 6, t[0] + 34, t[1] - 4, t[0] + 26, t[1] - 14]) + tx(t[0] + 14, t[1] + 22, "A, B, C…", { fs: 7.5 });
  });
  add("sl-stand-bench", "Standing on one leg beside a bench with light fingertip support, the other foot lifted, holding the balance", function () {
    return floor() + benchBack(20, 140) + pose(stand(78, { l1: [0, 0], l2: [12, -70], f2: 15, a1: { to: [90, 54], b: -1 }, a2: [-5, 4] })) + hold(110, 30);
  });
  add("balance-reach", "Standing on one leg and reaching the other foot out to tap the floor forwards, sideways and backwards", function () {
    var h = [72, 59], g = ik(h, [44, 97], TH, SH, 1);
    return floor() + '<g opacity=".26">' + L(g, FAR, 6.6) + L([mv(g[2], 60, -1.5), mv(g[2], 60, FT)], FAR, 5.2) + "</g>" + pose({ hip: h, t: 174, l1: { to: [72, 98], b: 1 }, l2: { to: [102, 97], b: 1 }, f2: 120, a1: [70, 85], a2: [-60, -40] }) + arrow([100, 106, 112, 108, 124, 103]) + arrow([46, 106, 36, 108, 26, 103]) + tx(132, 92, "tap", { fs: 7.5 }) + tx(20, 92, "tap", { fs: 7.5 });
  });
  add("band-evert", "Sitting with the legs out straight and a band looped around the forefoot, pushing the foot outwards against the band (seen from above)", function () {
    function ft(cx, cy, r, col, op) { return '<ellipse cx="' + cx + '" cy="' + (cy - 10) + '" rx="6.5" ry="11" fill="' + col + '"' + (op ? ' opacity="' + op + '"' : "") + ' transform="rotate(' + r + " " + cx + " " + cy + ')"/>'; }
    var s = R(18, 22, 8, 8, 1.5) + L([[22, 30], [22, 104]], PS, 2.5);
    s += L([[60, 110], [60, 42]], FAR, 14) + ft(60, 40, 0, FAR);
    s += L([[96, 110], [96, 42]], B, 14) + ft(96, 40, 0, B, ".26") + ft(96, 40, 28, B);
    s += band([[26, 26], [92, 22], [104, 24], [104, 30], [92, 30], [26, 28]], 2.4);
    return s + arrow([112, 40, 122, 32, 124, 18]) + tx(130, 50, "push out", { fs: 7.5 }) + tx(80, 10, "seen from above", { c: WT, fs: 6.5 });
  });
  add("walk", "Walking tall at a comfortable pace", function () {
    return floor() + pose({ hip: [76, 58.4], t: 176, l1: { to: [90, 98], b: 1 }, l2: { to: [62, 96], b: 1 }, f1: 100, f2: 40, a1: [-22, -8], a2: [22, 55] }) + arrow([104, 40, 132, 40]) + arrow([112, 52, 132, 52], { dash: 1 });
  });
  add("knee-rock", "Lying on your back with knees bent, gently letting both knees fall to one side and then the other (seen from the feet)", function () {
    function legs(op, r) {
      var g = L([[72, 98], [73, 62], [75, 90]], B, 7) + L([[88, 98], [87, 62], [85, 90]], B, 7);
      return '<g' + (op ? ' opacity="' + op + '"' : "") + ' transform="rotate(' + r + ' 80 98)">' + g + "</g>";
    }
    var s = floor() + mat(30, 130) + C([80, 79], 6.5, "#8E7DC2") + R(58, 87, 44, 12, 6, "#B9ACDD");
    s += legs(".25", 0) + legs(0, -34);
    return s + arrow([50, 58, 80, 38, 110, 58], { both: 1 }) + tx(80, 28, "side to side", { fs: 7.5 }) + tx(80, 109, "seen from your feet", { c: WT, fs: 6 });
  });
  add("cat-camel", "On hands and knees, slowly rounding the back up, then letting it sag gently", function () {
    return floor() + pose(quad(22, { tb: -9, hd: 30 })) + arrow([36, 58, 36, 44]) + chev(78, 80) + pose(quad(100, { tb: 5, hd: 130 })) + arrow([114, 60, 114, 74]);
  });
  add("bird-dog", "On hands and knees, reaching one arm forward and the opposite leg straight back", function () {
    return floor() + pose(quad(70, { hd: 110, a1: [93, 90], l2: [-88, -90], f2: 10 })) + arrow([120, 60, 142, 60]) + arrow([36, 66, 16, 66]);
  });
  add("knee-ext", "Sitting tall, slowly straightening one knee without locking it, then lowering", function () {
    return floor() + chair(40) + G(seat(50, { l2: [90, 0] })) + pose(seat(50, { l1: [90, 92], f1: 160 })) + arrow([84, 98, 100, 94, 96, 80]);
  });
  add("knee-ext-hold", "Sitting tall, straightening one knee fully and holding for 2 seconds, then lowering slowly", function () {
    return floor() + chair(40) + G(seat(50, { l2: [90, 0] })) + pose(seat(50, { l1: [90, 90], f1: 170 })) + arrow([84, 98, 100, 94, 96, 80]) + hold(104, 54);
  });
  add("knee-ext-band", "Sitting tall with a band looped around the foot and tied to the chair leg behind, straightening the knee against the band", function () {
    var o = {}; var s = floor() + chair(40) + G(seat(50, { l2: [90, 0] }));
    s += pose(seat(50, { l1: [90, 92], f1: 170, out: o }));
    return s + band([[42, 98], [74, 92], o.P.A1]) + arrow([84, 98, 100, 94, 96, 80]) + tx(26, 96, "band", { c: WT, fs: 6.5 });
  });
  add("side-hip-bench", "Standing upright holding a bench, lifting one leg out to the side with the toes pointing forward, then lowering slowly (seen from the front)", function () {
    return floor() + benchBack(30, 130) + G(frontStand(76, { a1: { to: [58, 54], b: 1 }, a2: { to: [94, 54], b: -1 } })) + pose(frontStand(76, { l2: [22, 22], f2: 90, a1: { to: [58, 54], b: 1 }, a2: { to: [94, 54], b: -1 } })) + arrow([104, 101, 114, 98, 118, 86]);
  });
  add("side-hip-band", "Standing on one leg holding a bench, band around both ankles, moving the other leg out to the side and back in (seen from the front)", function () {
    var o = {}; var s = floor() + benchBack(30, 130) + pose(frontStand(76, { l2: [22, 22], f2: 90, a1: { to: [58, 54], b: 1 }, a2: { to: [94, 54], b: -1 }, out: o }));
    return s + band([o.P.A1, o.P.A2]) + arrow([104, 101, 114, 98, 118, 86], { both: 1 });
  });
  add("tandem-stand", "Standing holding a bench with one foot directly in front of the other, heel touching toe", function () {
    return floor() + benchBack(20, 140) + pose({ hip: [80, 57], l1: { to: [84, 98], b: 1 }, l2: { to: [74, 98], b: 1 }, a1: { to: [92, 54], b: -1 } }) + hold(110, 30) + tx(80, 109, "heel touching toe", { fs: 7 });
  });
  add("tandem-walk", "Walking heel to toe in a straight line near a bench, one foot directly in front of the other", function () {
    var s = floor() + benchBack(10, 150);
    [30, 40, 50, 60, 70].forEach(function (x, i) { s += R(x, 102.5, 8.5, 2.5, 1.2, i % 2 ? "#E8DDF3" : "#F1ECF8"); });
    return s + pose({ hip: [92, 57.5], t: 178, l1: { to: [97, 98], b: 1 }, l2: { to: [86, 97], b: 1 }, f2: 70, a1: [40, 60], a2: [-30, -10] }) + arrow([110, 90, 140, 90]);
  });
  add("side-back-walk", "Walking sideways along the kitchen bench, then walking backwards, holding on as needed", function () {
    return floor() + sc(2, 0, 1, benchBack(6, 78) + pose(frontStand(40, { l1: [12, 12], f1: -90, a1: { to: [22, 54], b: 1 }, a2: { to: [58, 54], b: -1 } })) + arrow([52, 92, 72, 92])) + chev(82, 84) + sc(84, 0, 1, benchBack(0, 72) + pose(stand(44, { hip: [44, 57.5], l1: { to: [50, 98], b: 1 }, l2: { to: [36, 96], b: 1 }, f2: 50, a1: { to: [52, 54], b: -1 } })) + arrow([30, 76, 8, 76]));
  });
  add("clam-band", "Lying on your side with knees bent and a band just above the knees, keeping the feet together while lifting the top knee", function () {
    var s = floor() + mat(10, 150);
    var hb = [88, 93], ht = [88, 85];
    s += C([28, 88], 6.5, B) + L([[40, 92], [30, 97], [20, 97]], FAR, 5) + L([[38, 90], ht], B, 12);
    s += L([hb, [108, 96], [96, 97.5]], FAR, 6.6) + L([[96, 97.5], [100, 98]], FAR, 5.2);
    s += '<g opacity=".26">' + L([ht, [108, 90], [96, 95]], B, 6.6) + "</g>";
    s += L([ht, [106, 64], [96, 94]], B, 6.6) + L([[96, 94], [101, 96]], B, 5.2);
    s += band([[103, 70], [109, 93], [100, 94], [99, 72], [103, 70]], 2.4) + L([[56, 88], [80, 92]], B, 5.4);
    return s + arrow([118, 86, 124, 74, 116, 60]);
  });
  add("side-step-band", "Knees slightly bent with a band around the knees, stepping sideways with the hips level and toes forward (seen from the front)", function () {
    var o = {}; var s = floor() + pose(frontStand(66, { hip: [66, 60], l1: { to: [56, 98], b: -1 }, l2: { to: [80, 98], b: 1 }, a1: [-10, 30], a2: [10, -30], out: o }));
    return s + band([[57, 76], [76, 76]]) + G(frontStand(108, { hip: [108, 60], l1: { to: [100, 98], b: -1 }, l2: { to: [116, 98], b: 1 } })) + arrow([88, 84, 126, 84]);
  });
  add("side-step", "Small sideways steps with the pelvis level and toes pointing forward (seen from the front)", function () {
    return floor() + pose(frontStand(66, { hip: [66, 58], l1: { to: [58, 98], b: -1 }, l2: { to: [78, 98], b: 1 }, a1: [-10, 30], a2: [10, -30] })) + G(frontStand(106, { hip: [106, 58], l1: { to: [100, 98], b: -1 }, l2: { to: [112, 98], b: 1 } })) + arrow([88, 84, 124, 84]);
  });
  add("squat-chair", "Feet hip-width apart with a chair behind, bending as if sitting back with knees in line with the toes, then standing", function () {
    return floor() + chair(34) + G(stand(76)) + pose({ hip: [62, 76], t: 148, hd: 160, l1: { to: [76, 98], b: 1 }, l2: { to: [78, 98], b: 1 }, a1: [110, 95], a2: [105, 92] }) + arrow([50, 56, 46, 66, 52, 76]);
  });
  add("squat", "Feet hip-width, slowly sitting back as if into a chair with the knees over the toes, then standing back up", function () {
    return floor() + L([[38, 81], [60, 81]], PS, 1.6, ' stroke-dasharray="3 3"') + G(stand(76)) + pose({ hip: [62, 76], t: 148, hd: 160, l1: { to: [76, 98], b: 1 }, l2: { to: [78, 98], b: 1 }, a1: [110, 95], a2: [105, 92] }) + arrow([50, 56, 46, 66, 52, 76], { both: 1 });
  });
  add("step-down", "Standing on a low step on one leg, slowly bending that knee to touch the other heel to the floor in front, then straightening", function () {
    return floor() + step(40, 46, 13) + pose({ hip: [71, 62], t: 168, l1: { to: [78, 85], b: 1 }, l2: { to: [95, 97], b: 1 }, f2: 115, a1: [50, 80], a2: [40, 70] }) + arrow([112, 72, 116, 86, 106, 97]);
  });
  add("step-up", "Stepping up onto a low step with one leg, bringing the other foot up, then stepping down slowly", function () {
    return floor() + step(84, 46, 14) + G(stand(64, { hip: [64, 58], l1: { to: [94, 84], b: 1 }, l2: { to: [62, 98], b: 1 } })) + pose(stand(104, { hip: [104, 43], l1: { to: [104, 84], b: 1 }, l2: { to: [100, 84], b: 1 } })) + arrow([70, 40, 82, 26, 96, 30]);
  });
  add("slides", "Standing on one leg holding a bench, the other foot on a towel sliding forwards and back, then out to the side, bending the standing knee", function () {
    var a = benchBack(4, 74) + towel(42, 97.5, 22) + pose({ hip: [26, 62], t: 175, l1: { to: [28, 98], b: 1 }, l2: { to: [54, 96], b: 1 }, f2: 90, a1: { to: [34, 54], b: -1 } }) + arrow([44, 106, 64, 106], { both: 1 });
    var b = benchBack(2, 72) + towel(40, 97.5, 24) + pose(frontStand(26, { hip: [26, 62], l1: { to: [22, 98], b: -1 }, l2: { to: [50, 97], b: 1 }, f2: 90, a1: { to: [12, 54], b: 1 }, a2: { to: [40, 54], b: -1 } })) + arrow([42, 106, 64, 106], { both: 1 });
    return floor() + a + chev(82) + sc(86, 0, 1, b);
  });
  add("hip-ext-bench", "Holding a bench, squeezing the buttock and moving a straight leg backwards without arching the back, then returning slowly", function () {
    return floor() + benchBack(30, 140) + G(stand(84, { a1: { to: [96, 54], b: -1 } })) + pose(stand(84, { t: 182, l2: [-24, -24], f2: 60, a1: { to: [96, 54], b: -1 } })) + arrow([70, 96, 62, 94, 58, 86]);
  });
  add("knee-chest", "Lying on your back drawing one knee gently towards the chest with the hands, the other leg straight on the floor", function () {
    var o = {}, base = { hip: [92, 95.5], t: 90, hc: [128, 94.5], l2: [-90, -90], f2: 180, l1: [148, -75], f1: 175, out: o };
    pose(base);
    var k = o.P.K1;
    return floor() + big(1.25, mat(40, 140) + pose(Object.assign(base, { a1: { to: [k[0] - 2, k[1] + 3], b: 1 }, a2: { to: [k[0], k[1] + 4], b: 1 } })) + arrow([74, 72, 84, 60, 98, 66]), 92) + hold(14, 30, "hold");
  });
  add("hip-iso", "Lying on your back with legs straight and a belt around the thighs, pushing the legs gently outwards against it and holding still (seen from above)", function () {
    var fig = pose(frontStand(0, { hip: [0, 0], a1: [-12, -6], a2: [12, 6], l1: [-6, 0], l2: [6, 0], f1: 180, f2: 180 }));
    var s = R(10, 22, 140, 66, 6, "#EEEAF2") + '<g transform="translate(92 55) rotate(-90) scale(1.25)">' + fig + band([[-11, 15], [11, 15]], 3) + "</g>";
    return s + arrow([104, 40, 104, 20]) + arrow([104, 70, 104, 90]) + hold(20, 100, "hold still");
  });
  add("neck-move", "Sitting tall, slowly turning to look over each shoulder, tilting each ear towards the shoulder, and nodding the chin down and up", function () {
    function bust(cx) { return '<path d="M' + (cx - 19) + ' 101 Q' + (cx - 19) + " 76 " + cx + " 75 Q" + (cx + 19) + " 76 " + (cx + 19) + ' 101Z" fill="' + B + '"/>' + L([[cx, 76], [cx, 68]], B, 7); }
    var s = floor();
    s += bust(28) + G({ hip: [0, 0], hc: [28, 60], noA1: 1, noA2: 1, sh: [28, 60] }).replace(/<path[^>]*\/>/g, "") + C([28, 60], 8, B) + C([35.5, 61], 2.6, B) + arrow([14, 70, 28, 80, 42, 70], { both: 1 });
    s += bust(80) + '<g opacity=".26">' + C([80, 60], 8, B) + "</g>" + '<g transform="rotate(-24 80 72)">' + C([80, 60], 8, B) + "</g>" + arrow([64, 52, 80, 34, 96, 52], { both: 1 });
    s += '<path d="M118 101 Q118 76 128 75 Q140 76 140 101Z" fill="' + B + '"/>' + L([[130, 76], [131, 68]], B, 7) + C([131, 60], 8, B) + C([138.5, 61], 2.6, B) + arrow([144, 50, 152, 60, 145, 72], { both: 1 });
    return s + tx(28, 18, "turn", { fs: 7.5 }) + tx(80, 18, "tilt", { fs: 7.5 }) + tx(132, 18, "nod", { fs: 7.5 });
  });
  add("shrug", "Standing tall holding a weight in each hand, lifting the shoulders towards the ears, then lowering slowly (seen from the front)", function () {
    return floor() + G(frontStand(80, { a1: [-6, -2], a2: [6, 2], w: "12", wa: 90 })) + pose(frontStand(80, { sy: 4, a1: [-6, -2], a2: [6, 2], w: "12", wa: 90 })) + arrow([58, 34, 58, 20]) + arrow([102, 34, 102, 20]);
  });
  add("lat-raise", "Standing with weights by the sides, raising the arms out to the sides to shoulder height (no higher), then lowering slowly (seen from the front)", function () {
    return floor() + G(frontStand(80, { a1: [-8, -4], a2: [8, 4], w: "12", wa: 0 })) + pose(frontStand(80, { a1: [-92, -90], a2: [92, 90], w: "12", wa: 0 })) + L([[44, 30], [116, 30]], AC, 1, ' stroke-dasharray="2 2.5" opacity=".6"') + arrow([60, 56, 50, 46, 48, 36]) + arrow([100, 56, 110, 46, 112, 36]);
  });
  add("upright-row", "Holding weights in front of the thighs, pulling them up close to the body to chest height, elbows leading, then lowering slowly (seen from the front)", function () {
    return floor() + G(frontStand(80, { a1: [-4, 6], a2: [4, -6], w: "12", wa: 90 })) + pose(frontStand(80, { a1: [-125, 70], a2: [125, -70], w: "12", wa: 90 })) + arrow([64, 62, 64, 42]) + arrow([96, 62, 96, 42]);
  });
  add("press", "Standing tall, pushing the weights overhead from shoulder height (seen from the front)", function () {
    return floor() + G(frontStand(80, { a1: [-60, 165], a2: [60, -165], w: "12", wa: 90 })) + pose(frontStand(80, { a1: [-170, -178], a2: [170, 178], w: "12", wa: 90 })) + arrow([56, 30, 56, 12]) + arrow([104, 30, 104, 12]);
  });
  add("rev-fly", "Leaning forward from the hips with a flat back and arms hanging, then raising the arms out to the sides and squeezing the shoulder blades together (side view, then front view)", function () {
    var a = pose({ hip: [26, 60], t: 120, hd: 115, l1: { to: [34, 98], b: 1 }, l2: { to: [36, 98], b: 1 }, a1: [2, 0], a2: [-2, 0], w: "1", wa: 90 });
    var leg = { l1: { to: [115, 98], b: -1 }, l2: { to: [125, 98], b: 1 } };
    var base = Object.assign({ hip: [120, 59], front: 1, sh: [120, 47], hc: [120, 44] }, leg);
    var b = G(Object.assign({}, base, { a1: [-4, 0], a2: [4, 0], w: "12", wa: 90 })) + pose(Object.assign({}, base, { a1: [-90, -92], a2: [90, 92], w: "12", wa: 0 }));
    return floor() + a + tx(34, 14, "side", { c: WT, fs: 6.5 }) + tx(120, 14, "front", { c: WT, fs: 6.5 }) + b + arrow([104, 70, 92, 66, 90, 54]) + arrow([136, 70, 148, 66, 150, 54]);
  });
  add("row-1arm", "One hand and knee on a bench with a flat back, pulling the weight up towards the lower ribs, then lowering slowly", function () {
    var s = floor() + bench(46, 130, 80);
    var base = { hip: [70, 58], t: 92, hd: 100, l2: [0, -90], f2: -90, l1: { to: [66, 98], b: 1 }, a2: { to: [100, 79], b: -1 } };
    return s + G(Object.assign({}, base, { a1: [0, 0], w: "1", wa: 90 })) + pose(Object.assign({}, base, { a1: [-135, 0], w: "1", wa: 90 })) + arrow([112, 84, 112, 60]);
  });
  add("er-side", "Lying on the good side with the elbow bent to 90° and tucked against the ribs, the forearm rotated up towards the ceiling, then lowered slowly", function () {
    var s = mat(20, 140);
    s += C([30, 88], 6.5, B) + L([[40, 93], [30, 98], [20, 98]], FAR, 5) + L([[40, 90], [86, 90]], B, 12) + L([[86, 93], [136, 95]], FAR, 6.6) + L([[86, 88], [136, 92]], B, 6.6);
    s += L([[46, 85], [64, 85]], OL, 9) + L([[46, 85], [64, 85]], B, 5.4) + '<g opacity=".26">' + L([[64, 85], [68, 98]], B, 5.4) + "</g>" + L([[64, 85], [64, 72]], OL, 9) + L([[64, 85], [64, 72]], B, 5.4) + bell([64, 70], 90);
    return floor() + big(1.15, s, 80) + arrow([84, 64, 92, 80, 84, 94]) + tx(96, 66, "slowly", { fs: 7.5, a: "start" });
  });
  add("scaption", "Standing, thumb up, raising the arm halfway between straight ahead and out to the side up to shoulder height, then lowering slowly on its own (seen from the front)", function () {
    return floor() + G(frontStand(70, { a2: [10, 6] })) + pose(frontStand(70, { a2: [118, 116], w: "" })) + L([[103, 15], [106, 16]], B, 4) + arrow([110, 24, 116, 42, 92, 58]) + tx(130, 50, "slowly", { fs: 7.5 });
  });
  add("band-row", "Standing facing a door with a band looped around the handle, pulling the elbows back past the ribs and squeezing the shoulder blades together", function () {
    var s = floor(6, 140) + R(140, 10, 8, 91, 1) + C([142, 56], 2, PS), o = {};
    var base = stand(76, { t: 180 }), arm = { a1: [-28, 72], a2: [-25, 74] };
    s += G(Object.assign({}, base, { a1: [80, 88], a2: [76, 86] })) + band([[142, 56], [103, 50]]);
    pose(Object.assign({}, base, arm, { out: o }));
    return s + band([[142, 56], o.P.W1]) + pose(Object.assign({}, base, arm, { ol: 1 })) + arrow([112, 30, 90, 30]);
  });
  add("wall-push", "Hands on a wall at shoulder height doing a slow push-up, then pushing a little further at the top so the shoulder blades spread", function () {
    var base = { hip: [80, 58], t: 164, l1: { to: [70, 98], b: 1 }, l2: { to: [72, 98], b: 1 } };
    return floor(6, 128) + wall(128) + G(Object.assign({}, base, { hip: [90, 58], t: 158, a1: { to: [127, 30], b: -1 }, a2: { to: [127, 32], b: -1 }, l1: { to: [72, 98], b: 1 }, l2: { to: [74, 98], b: 1 } })) + pose(Object.assign({}, base, { a1: { to: [127, 30], b: -1 }, a2: { to: [127, 32], b: -1 } })) + arrow([96, 16, 74, 16]) + tx(54, 12, "push", { fs: 7.5 });
  });
  add("prone-y", "Lying face down on a bed with the sore arm hanging over the edge, lifting the arm forwards and up in a Y shape, thumb up", function () {
    var s = floor() + R(16, 74, 112, 12, 2) + L([[22, 86], [22, 101]], PS, 2.5) + L([[122, 86], [122, 101]], PS, 2.5);
    var base = { hip: [56, 68], t: 90, hc: [94, 67], l1: [-90, -90], l2: [-90, -92], f1: 0, f2: 0, noA2: 1 };
    return s + G(Object.assign({}, base, { a1: [2, 0] })) + pose(Object.assign({}, base, { a1: [104, 104] })) + arrow([96, 96, 118, 92, 116, 74]);
  });
  add("cross-stretch", "Bringing the sore arm across the chest and gently pulling at the elbow with the other hand to stretch the back of the shoulder (seen from the front)", function () {
    var o = {}; pose(frontStand(80, { a1: [88, 92], out: o }));
    var e = o.P.E1;
    return floor() + pose(frontStand(80, { a1: [88, 92], ol: 1, a2: { to: [e[0] + 1, e[1] + 3], b: -1 }, ol2: 1 })) + arrow([116, 50, 100, 42]) + hold(112, 74);
  });
  add("deadlift", "Bending from the hips with a straight back to pick up a weight from a box, then standing tall", function () {
    var a = step(30, 22, 14) + R(37, 79, 9, 8, 2, "#CFC8DA") + pose({ hip: [24, 64], t: 120, hd: 115, l1: { to: [30, 98], b: 1 }, l2: { to: [32, 98], b: 1 }, a1: { to: [41, 78], b: 1 }, a2: { to: [42, 78], b: 1 } });
    var b = step(36, 22, 14) + R(32, 60, 9, 8, 2, "#CFC8DA") + pose(stand(34, { a1: [5, 5], a2: [3, 3] }));
    return floor() + a + chev(78) + sc(76, 0, 1, b) + arrow([62, 52, 72, 36, 92, 32]) + tx(40, 108, "straight back", { c: WT, fs: 6 });
  });
  add("back-ext", "Lying on your stomach with a pillow under the hips and chin tucked, lifting the head and shoulders a little off the floor", function () {
    var base = { hip: [82, 89], t: 90, l1: [-90, -90], l2: [-91, -90], f1: 0, f2: 0, a1: [-80, -90], a2: [-82, -92] };
    var s = mat(40, 136) + R(70, 91, 24, 7, 3.5, "#F4E8EF") + G(Object.assign({}, base, { sh: [108, 95], hc: [117, 93] })) + pose(Object.assign({}, base, { sh: [107, 86], hc: [115.5, 81] }));
    return floor() + big(1.3, s + arrow([128, 94, 128, 80]), 86);
  });
  add("heel-drop", "Rising up onto the toes, then dropping firmly onto the heels", function () {
    var s = floor() + pose(toes(48, 40)) + chev(80) + pose(stand(116));
    return s + arrow([24, 82, 24, 96]) + L([[104, 95], [99, 92]], AC, 1.6) + L([[104, 100], [98, 100]], AC, 1.6) + L([[128, 95], [133, 92]], AC, 1.6) + L([[128, 100], [134, 100]], AC, 1.6);
  });
  add("calf-straight", "Hands on a wall, sore leg back with the knee straight and heel down, leaning forward to stretch the calf", function () {
    return floor(6, 132) + wall(132) + pose({ hip: [92, 60], t: 164, l1: { to: [106, 98], b: 1 }, l2: { to: [70, 98], b: 1 }, f2: 90, a1: { to: [131, 34], b: -1 }, a2: { to: [131, 36], b: -1 } }) + C([70, 99], 3.2, "none", ' stroke="' + AC + '" stroke-width="1.4"') + tx(58, 86, "heel down", { fs: 7, a: "end" }) + hold(18, 30);
  });
  add("calf-bent", "Same position at the wall, with the back knee bent to stretch the lower calf, heel down", function () {
    return floor(6, 132) + wall(132) + pose({ hip: [92, 64], t: 166, l1: { to: [106, 98], b: 1 }, l2: { to: [76, 98], b: 1 }, f2: 90, a1: { to: [131, 38], b: -1 }, a2: { to: [131, 40], b: -1 } }) + C([76, 99], 3.2, "none", ' stroke="' + AC + '" stroke-width="1.4"') + tx(62, 90, "heel down", { fs: 7, a: "end" }) + hold(18, 30);
  });
  add("rathleff", "Standing on the sore foot on a step with the heel hanging off and a rolled towel under the toes, rising up slowly, pausing, then lowering slowly", function () {
    var s = step(70, 60, 16) + C([75, 82], 3, "#F4E8EF", ' stroke="' + PS + '" stroke-width="1"');
    var lift = { l2: [10, -60], f2: 20 };
    s += G(Object.assign({ hip: [66, 49], l1: [0, 0], f1: 70 }, ST, lift));
    s += pose(Object.assign({ hip: [72, 37], l1: [0, 0], f1: 25 }, ST, lift));
    return floor() + big(0.86, s, 80) + arrow([46, 82, 46, 64], { both: 1 }) + tx(112, 44, "up 3 s", { fs: 7, a: "start" }) + tx(112, 53, "pause 2 s", { fs: 7, a: "start" }) + tx(112, 62, "down 3 s", { fs: 7, a: "start" }) + tx(100, 108.5, "heel off the step, towel under toes", { c: WT, fs: 6 });
  });
  add("arch-stretch", "Sitting with the sore foot crossed over the other knee, a hand pulling the toes back towards the shin to stretch the arch (close-up)", function () {
    var s = L([[40, 10], [52, 66]], B, 13);
    s += '<path d="M52 70 Q50 82 62 84 L100 82" fill="none" stroke="' + B + '" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<path d="M100 81 Q108 78 112 64" fill="none" stroke="' + B + '" stroke-width="8" stroke-linecap="round"/>';
    s += '<path d="M60 94 Q80 98 100 92" fill="none" stroke="' + AC + '" stroke-width="2" stroke-dasharray="2.5 2"/>';
    s += L([[150, 20], [122, 52]], FAR, 7) + C([116, 60], 7, FAR);
    return s + arrow([128, 80, 134, 66, 126, 54]) + tx(80, 106, "stretch in the arch", { fs: 7 }) + tx(140, 92, "toes back", { fs: 7 });
  });
  add("wrist-iso", "Forearm resting on a table palm down with the wrist just over the edge, the other hand pressing down on the back of the hand while the wrist holds still", function () {
    var s = R(10, 66, 92, 8, 2) + L([[16, 74], [16, 104]], PS, 2.5) + L([[96, 74], [96, 104]], PS, 2.5);
    s += L([[20, 60], [100, 60]], B, 11) + L([[100, 60], [118, 57]], B, 9);
    s += L([[150, 22], [130, 42], [116, 48]], FAR, 6) + L([[110, 51], [121, 49]], FAR, 7);
    return s + arrow([136, 30, 120, 42]) + arrow([108, 84, 108, 68]) + hold(108, 98, "hold still");
  });
  add("wrist-ecc", "Forearm resting on a table palm down holding a light weight, letting the wrist drop down, then lifting it up over 4 seconds and lowering over 4 seconds", function () {
    var s = R(10, 66, 92, 8, 2) + L([[16, 74], [16, 104]], PS, 2.5) + L([[96, 74], [96, 104]], PS, 2.5);
    s += L([[20, 60], [100, 60]], B, 11);
    s += '<g opacity=".26">' + L([[100, 60], [110, 74]], B, 9) + bell([112, 77], 0) + "</g>";
    s += L([[100, 60], [117, 52]], B, 9) + bell([119, 51], -25);
    return s + arrow([128, 76, 134, 64, 128, 50], { both: 1 }) + tx(140, 92, "up 4 s", { fs: 7 }) + tx(140, 101, "down 4 s", { fs: 7 });
  });
  add("grip", "Squeezing a soft ball or exercise putty in the hand, then letting go slowly", function () {
    var s = L([[14, 64], [70, 58]], B, 13) + ball([92, 55], 13);
    s += '<path d="M72 50 Q82 36 96 40 Q108 44 106 56 Q104 66 94 68 Q82 70 72 64" fill="none" stroke="' + B + '" stroke-width="9" stroke-linecap="round"/>';
    return s + arrow([92, 20, 92, 34]) + arrow([92, 90, 92, 76]) + arrow([128, 55, 114, 55]) + tx(92, 104, "squeeze, then let go slowly", { fs: 7 });
  });
  add("forearm-rot", "Elbow bent at the side holding a light weight, slowly turning the palm up, then palm down", function () {
    var fig = pose(stand(50, { a1: [0, 90], ol: 1 })) + bell([65, 44], 0) + '<ellipse cx="66" cy="44" rx="4.5" ry="11" fill="none" stroke="' + AC + '" stroke-width="1.6"/>' + arrow([60.5, 38, 61.5, 33.5, 66, 33]);
    return sc(n(56 - 56 * 1.4), n(46 - 46 * 1.4), 1.4, fig) + tx(100, 34, "palm up", { fs: 7.5, a: "start" }) + tx(100, 64, "palm down", { fs: 7.5, a: "start" }) + tx(118, 100, "elbow at your side", { c: WT, fs: 6.5 });
  });
  // pelvic floor (gender-neutral figures; pelvic area shown as a soft circle)
  add("pf-find", "Sitting relaxed on a chair, squeezing and lifting the pelvic floor muscles (the highlighted area) up and in", function () {
    return floor() + chair(56) + pose(seat(66, { hl: 1, hlp: [70, 80] })) + arrow([70, 86, 70, 74]) + tx(110, 40, "squeeze", { fs: 7.5, a: "start" }) + tx(110, 50, "and lift", { fs: 7.5, a: "start" });
  });
  add("pf-hold", "Lying on your back with knees bent, squeezing and lifting the pelvic floor (highlighted) and holding, then fully letting go", function () {
    return floor() + big(1.3, mat(56, 140) + pose(supineHook(92, { hl: 1, hlp: [90, 95] })) + arrow([90, 90, 90, 78]), 92) + hold(14, 30, "hold, then let go");
  });
  add("pf-positions", "Three positions for pelvic floor sets: lying, sitting and standing", function () {
    var ty = n(FY - FY * 0.55);
    var lie = sc(-14, ty, 0.55, mat(30, 150) + pose(supineHook(92, { hl: 1, hlp: [90, 95] })));
    var sit = sc(76, ty, 0.55, chair(0) + pose(seat(10, { hl: 1, hlp: [14, 80] })));
    var st = sc(120, ty, 0.55, pose(stand(30, { hl: 1, hlp: [32, 60] })));
    return floor() + lie + sit + st + tx(36, 40, "lying", { fs: 7, c: B }) + tx(88, 40, "sitting", { fs: 7, c: B }) + tx(137, 40, "standing", { fs: 7, c: B });
  });
  add("pf-knack", "Squeezing the pelvic floor (highlighted) just before a cough or sneeze", function () {
    var s = floor() + pose(stand(80, { hd: 175, a1: { to: [92, 26], b: -1 }, hl: 1, hlp: [82, 60] }));
    return s + L([[96, 14], [104, 10]], AC, 1.6) + L([[98, 20], [107, 20]], AC, 1.6) + L([[96, 26], [104, 30]], AC, 1.6) + tx(110, 14, "cough", { fs: 7.5, a: "start" }) + tx(122, 60, "squeeze first", { fs: 7 });
  });
  add("pf-harder", "Making pelvic floor sets harder over time: holding longer, adding squeezes and shortening rests", function () {
    var s = floor() + chair(16) + pose(seat(26, { hl: 1, hlp: [30, 80] }));
    [[78, 12], [92, 22], [106, 32], [120, 42]].forEach(function (b, i) { s += R(b[0], 88 - b[1], 10, b[1], 2, i === 3 ? "#E7C3DA" : "#EEE7F6"); });
    return s + arrow([80, 54, 128, 38]) + tx(102, 100, "longer · more · less rest", { fs: 6.5 });
  });
  // lower back stretches
  add("knee-chest-2", "Lying on your back hugging both knees gently towards the chest", function () {
    var o = {}, base = { hip: [92, 95.5], t: 90, hc: [128, 94.5], l1: [150, -78], l2: [146, -74], f1: 175, f2: 175, out: o };
    pose(base);
    var k = o.P.K1;
    return floor() + big(1.25, mat(40, 140) + pose(Object.assign(base, { a1: { to: [k[0] - 3, k[1] + 3], b: 1 }, a2: { to: [k[0] - 1, k[1] + 4], b: 1 } })) + arrow([72, 70, 82, 56, 98, 62]), 92) + hold(14, 30, "hold");
  });
  add("child-pose", "Kneeling, sitting back towards the heels and sliding the hands forward along the floor so the back gently rounds and stretches", function () {
    var s = mat(20, 130) + pose({ hip: [42, 83], t: 72, hd: 78, l1: [50, -94], l2: [48, -93], f1: -95, f2: -95, a1: [78, 89], a2: [76, 88] });
    return floor() + big(1.3, s, 60) + arrow([46, 66, 30, 70]) + tx(36, 58, "sit back", { fs: 7.5 }) + arrow([112, 78, 136, 78]) + tx(124, 70, "reach", { fs: 7.5 }) + hold(110, 26);
  });
  add("sphinx", "Lying on your stomach, propping up on the forearms with the hips staying on the floor, letting the lower back relax", function () {
    var base = { hip: [82, 94], t: 90, l1: [-90, -90], l2: [-91, -90], f1: -40, f2: -40 };
    var s = mat(40, 136) + G(Object.assign({}, base, { sh: [108, 96], hc: [117, 94], a1: [-80, -90], a2: [-82, -92] }));
    s += pose(Object.assign({}, base, { sh: [104, 83], hc: [112, 76], a1: [2, 90], a2: [0, 88] }));
    return floor() + big(1.3, s + arrow([96, 92, 96, 80]), 86) + tx(28, 70, "hips down", { c: WT, fs: 6.5 }) + hold(14, 30);
  });
  add("fig4", "Lying on your back with one ankle crossed over the other knee, gently drawing the lower leg towards the chest to stretch the buttock", function () {
    var o = {}, base = { hip: [92, 95.5], t: 90, hc: [128, 94.5], l2: [148, -78], f2: 175, l1: [200, 96], f1: 100, out: o };
    pose(base);
    var k2 = o.P.K2;
    base.a1 = { to: [k2[0] + 2, k2[1] + 7], b: 1 }; base.a2 = { to: [k2[0] + 4, k2[1] + 8], b: 1 };
    return floor() + big(1.25, mat(40, 140) + pose(base) + arrow([62, 70, 70, 56, 86, 58]), 92) + tx(140, 50, "ankle on", { fs: 6.5 }) + tx(140, 58, "other knee", { fs: 6.5 }) + hold(14, 30);
  });
  add("hip-flexor", "Half-kneeling with a cushion under the back knee, tucking the tailbone under and easing the hips forward to stretch the front of the back hip", function () {
    var s = floor() + R(52, 96, 18, 5, 2.5, "#F4E8EF");
    var b = { hip: [66, 78], t: 182, l2: [90, 0], l1: [-22, -90], f2: 90, f1: -95, a1: { to: [84, 76], b: -1 }, a2: { to: [83, 77], b: -1 } };
    s += pose(b);
    return s + C([66, 84], 6, AC, ' fill-opacity=".15" stroke="' + AC + '" stroke-width="1.2" stroke-dasharray="2.5 2"') + arrow([44, 62, 60, 62]) + tx(28, 56, "hips forward", { fs: 7 }) + tx(124, 70, "stretch at", { fs: 6.5 }) + tx(124, 78, "front of hip", { fs: 6.5 }) + hold(112, 30);
  });
  // frozen shoulder (the sore arm is the dark, near arm in side views)
  add("pendulum", "Leaning forward with the good hand on a table and the sore arm hanging loose, letting it swing in small circles and back and forth", function () {
    var s = floor() + bench(92, 150, 62);
    s += pose({ hip: [52, 60], t: 128, hd: 124, l1: { to: [62, 98], b: 1 }, l2: { to: [44, 98], b: 1 }, a1: [2, -2], a2: { to: [100, 61], b: -1 } });
    return s + '<ellipse cx="76" cy="73" rx="9" ry="4" fill="none" stroke="' + AC + '" stroke-width="1.8" stroke-dasharray="3 2"/>' + arrow([84, 76, 80, 79, 74, 78.5]) + tx(30, 20, "small circles", { fs: 7.5 }) + tx(30, 29, "arm hangs loose", { c: WT, fs: 6.5 });
  });
  add("table-slide", "Sitting at a table with the sore hand on a towel, sliding the hand forward as you lean the body forward, then back", function () {
    var s = floor() + chair(20) + bench(58, 150, 64) + towel(62, 60.5, 22);
    s += G(seat(30, { a1: { to: [62, 61], b: 1 } }));
    s += pose(seat(30, { t: 140, hd: 135, a1: { to: [78, 61], b: 1 }, a2: [10, 60] }));
    return s + R(70, 60.5, 22, 3.5, 1.5, "#F4E8EF") + arrow([84, 52, 112, 52]) + tx(118, 44, "slide forward", { fs: 7 }) + tx(118, 76, "hand on a towel", { c: WT, fs: 6 });
  });
  add("wall-walk", "Facing a wall, walking the fingers of the sore arm up the wall as far as is comfortable, then walking them back down", function () {
    var s = floor(6, 128) + wall(128);
    [52, 44, 36, 28, 20].forEach(function (y) { s += C([126, y], 1.3, AC); });
    s += G(stand(96, { a1: { to: [127, 48], b: -1 } }));
    s += pose(stand(96, { a1: { to: [127, 20], b: -1 }, a2: [-3, 2] }));
    return s + arrow([140, 56, 140, 18]) + tx(60, 18, "walk up", { fs: 7.5 }) + tx(60, 27, "slowly", { fs: 7.5 });
  });
  add("er-stick", "Standing with both elbows tucked in at the sides holding a stick, the good arm gently pushing the sore hand out to the side, elbows staying at the sides (seen from the front)", function () {
    var o = {}; pose(frontStand(84, { a1: [2, -90], out: o }));
    var h = o.P.W1;
    var s = floor() + G(frontStand(84, { a1: [2, 70] }));
    s += pose(frontStand(84, { a1: [2, -90], a2: [-2, -88], out: o }));
    s += L([[h[0] - 4, h[1]], [o.P.W2[0] + 6, o.P.W2[1]]], WT, 2.6);
    return s + arrow([112, 52, 94, 52]) + tx(132, 64, "good arm", { fs: 7 }) + tx(132, 72, "pushes", { fs: 7 }) + arrow([66, 36, 56, 32, 48, 38]) + tx(80, 109, "elbows stay at your sides", { c: WT, fs: 6.5 }) + hold(14, 18);
  });
  add("towel-behind", "A towel over the good shoulder held behind the back by the sore hand, the good hand pulling the towel up so the sore hand slides up the back", function () {
    var top = [91, 12], lo = [77, 52];
    var s = floor() + G(frontStand(80, { a1: { to: [76, 60], b: -1 }, noA2: 1 }));
    s += pose(frontStand(80, { a1: { to: lo, b: -1 }, ol: 1, a2: { to: top, b: -1 }, ol2: 1 }));
    s += L([top, [86, 30], lo], "#F4E8EF", 3.6) + L([top, [86, 30], lo], "#C77DAA", 1, ' stroke-dasharray="2 2"') + tx(56, 22, "towel", { c: WT, fs: 6.5 });
    return s + arrow([104, 24, 104, 8]) + tx(110, 30, "good hand", { fs: 6.5, a: "start" }) + tx(110, 38, "pulls up", { fs: 6.5, a: "start" }) + tx(110, 64, "sore hand", { fs: 6.5, a: "start" }) + tx(110, 72, "slides up", { fs: 6.5, a: "start" }) + arrow([56, 64, 56, 50]) + tx(80, 109, "seen from behind", { c: WT, fs: 6.5 });
  });
  // pelvic floor for men (same gender-neutral figure)
  add("pf-quick", "Sitting relaxed, doing quick, strong pelvic floor squeezes (highlighted), letting go fully between each", function () {
    var s = floor() + chair(16) + pose(seat(26, { hl: 1, hlp: [30, 80] }));
    [0, 1, 2, 3, 4].forEach(function (i) { var x = 78 + i * 14; s += R(x, 50, 6, 18, 1.5, "#E7C3DA"); });
    return s + L([[74, 68.5], [150, 68.5]], PS, 1.4) + tx(112, 42, "squeeze · let go", { fs: 7 }) + tx(112, 82, "quick, strong", { fs: 7 });
  });
  add("pf-dribble", "Standing after weeing, squeezing the pelvic floor (highlighted) hard to clear the last drops before zipping up", function () {
    var s = floor() + pose(stand(70, { hl: 1, hlp: [72, 60] }));
    function drop(x, y) { return '<path d="M' + x + " " + y + "q3 5 0 7q-3 -2 0 -7z" + '" fill="' + AC + '" fill-opacity=".55"/>'; }
    return s + drop(90, 76) + drop(94, 86) + arrow([84, 80, 86, 70, 80, 63]) + tx(126, 40, "after weeing:", { fs: 7 }) + tx(126, 49, "squeeze hard", { fs: 7 }) + tx(126, 58, "then zip up", { fs: 7 });
  });
  // rotator cuff (top-down views face the bottom of the picture; the sore arm is on screen left)
  function above(cx, cy, fa, o) { // fa = forearm angle: 0 = straight forward (down the picture), + = out to the side, - = across the tummy
    o = o || {};
    var el = [cx - 21, cy + 3], hand = mv(el, -fa, 24), s = "";
    s += '<ellipse cx="' + cx + '" cy="' + (cy + 1) + '" rx="24" ry="9" fill="' + B + '"/>' + C([cx + 21, cy + 3], 3.4, FAR);
    if (o.ghost != null) s += '<g opacity=".26">' + L([el, mv(el, -o.ghost, 24)], B, 5.4) + C(mv(el, -o.ghost, 25), 3.2, B) + "</g>";
    s += L([el, hand], OL, 9) + L([el, hand], B, 5.4) + C(mv(el, -fa, 25), 3.2, B);
    s += C([cx, cy], 8.5, B, ' stroke="' + OL + '" stroke-width="1.5"') + L([[cx, cy + 7], [cx, cy + 10.5]], OL, 2.4);
    if (o.towel) s += R(el[0] + 1.5, el[1] - 3, 4, 8, 1.5, "#F4E8EF");
    if (o.out) o.out.hand = hand;
    return s;
  }
  function topNote(s) { return s + tx(80, 108, "seen from above · forearm points forward", { c: WT, fs: 6.3 }); }
  add("iso-er", "Standing side-on to a wall with the elbow bent to 90° and tucked at the side, pressing the back of the hand outwards into the wall without moving (seen from above)", function () {
    var o = {}; above(0, 0, 0, { out: o }); var h = o.hand;
    var inner = R(h[0] - 10, -24, 5, 76, 1, PF) + above(0, 0, 0, { towel: 1 }) + arrow([h[0] + 4, h[1] + 12, h[0] - 14, h[1] + 12]) + tx(h[0] + 6, h[1] + 16, "push out", { fs: 6.5, a: "start" });
    return topNote(sc(78, 34, 1.35, inner) + hold(108, 86, "hold still"));
  });
  add("iso-ir", "Standing in a doorway with the elbow bent to 90° and tucked at the side, pressing the palm inwards against the door frame without moving (seen from above)", function () {
    var o = {}; above(0, 0, 0, { out: o }); var h = o.hand;
    var inner = R(h[0] + 4, h[1] - 16, 6, 30, 1.2, PF) + above(0, 0, 0, { towel: 1 }) + arrow([h[0] - 20, h[1] + 4, h[0] - 4, h[1] + 4]) + tx(h[0] - 14, h[1] + 16, "push in", { fs: 6.5 }) + tx(h[0] + 13, h[1] + 4, "door frame", { c: WT, fs: 6, a: "start" });
    return topNote(sc(78, 34, 1.35, inner) + hold(108, 86, "hold still"));
  });
  add("band-er", "Elbow bent to 90° and tucked at the side with a band held in the hand and tied to the side, turning the forearm outwards against the band, then back slowly (seen from above)", function () {
    var o = {}; above(0, 0, 50, { out: o });
    var inner = above(0, 0, 50, { towel: 1, ghost: -25 }) + arrow([-14, 30, -30, 30, -38, 20]);
    var hand = [78 + o.hand[0] * 1.3, 30 + o.hand[1] * 1.3];
    return topNote(R(146, 10, 8, 82, 1, PF) + C([148, 50], 2, PS) + band([[148, 50], hand]) + sc(78, 30, 1.3, inner) + tx(32, 84, "turn out,", { fs: 7 }) + tx(32, 93, "slowly back", { fs: 7 }));
  });
  add("scap-set", "Standing tall, gently drawing the shoulder blades back and down, as if tucking them into your back pockets, and holding (seen from behind)", function () {
    var s = floor() + pose(frontStand(80, { a1: [-6, -3], a2: [6, 3] }));
    function blade(x, m) { return '<path d="M' + x + " 33 L" + (x + 9 * m) + " 33 L" + (x + 2 * m) + ' 47Z" fill="' + OL + '" opacity=".9"/>'; }
    s += blade(75, -1) + blade(85, 1);
    return s + arrow([58, 30, 66, 42]) + arrow([102, 30, 94, 42]) + tx(32, 22, "back and", { fs: 7 }) + tx(32, 31, "down", { fs: 7 }) + hold(116, 72) + tx(80, 109, "seen from behind", { c: WT, fs: 6.5 });
  });
  add("wall-slide", "Facing a wall with the forearm resting on it, sliding the arm up the wall as far as is comfortable, then back down slowly", function () {
    var s = floor(6, 128) + wall(128);
    s += G(stand(112, { a1: [60, 180], a2: [-3, 2] }));
    s += pose(stand(112, { a1: [118, 180], a2: [-3, 2], ol: 1 }));
    return s + arrow([142, 50, 142, 14]) + tx(70, 18, "slide up", { fs: 7.5 }) + tx(70, 27, "forearm on wall", { c: WT, fs: 6.5 });
  });
  // ---- page wiring ----
  function svgFor(k) {
    var f = F[k]; if (!f) return "";
    return '<svg class="exfig-svg" viewBox="0 0 160 110" role="img" aria-label="' + f.alt.replace(/"/g, "&quot;") + '" xmlns="http://www.w3.org/2000/svg"><title>' + f.alt + "</title>" + f.draw() + "</svg>";
  }
  var DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  function init() {
    var main = document.querySelector("main.doc"), ol = main && main.querySelector("ol.ex"); if (!ol) return;
    document.body.classList.add("exh");
    [].forEach.call(ol.children, function (li) {
      if (li.tagName !== "LI" || li.querySelector(".exfig")) return;
      var body = document.createElement("div"); body.className = "ex-txt";
      while (li.firstChild) body.appendChild(li.firstChild);
      var svg = svgFor(li.getAttribute("data-ex"));
      if (svg) { var fig = document.createElement("div"); fig.className = "exfig"; fig.innerHTML = svg; li.appendChild(fig); }
      li.appendChild(body);
      var tr = document.createElement("div"); tr.className = "ex-track"; tr.setAttribute("aria-hidden", "true");
      tr.innerHTML = "<span>Done:</span>" + DAYS.map(function (d) { return "<i>" + d + "</i>"; }).join("");
      body.appendChild(tr);
    });
    // print header
    var h1 = main.querySelector("h1");
    if (h1 && !main.querySelector(".exh-head")) h1.insertAdjacentHTML("beforebegin", '<div class="exh-head" aria-hidden="true"><b>Malady Wise</b><span>Exercise handout</span></div>');
    // safety callout class on the "Stop and see" list
    [].forEach.call(main.querySelectorAll("h2"), function (h) {
      if (/^Stop and see/i.test(h.textContent) && h.nextElementSibling && h.nextElementSibling.tagName === "UL") { h.classList.add("exh-stop-h"); h.nextElementSibling.classList.add("exh-stop"); }
      if (/^Evidence/i.test(h.textContent)) h.classList.add("exh-ev");
      if (/^Want a supervised/i.test(h.textContent)) { h.classList.add("exh-sup"); if (h.nextElementSibling) h.nextElementSibling.classList.add("exh-sup-p"); }
    });
    // print footer: URL + QR
    var pu = main.querySelector(".print-url"), p = location.pathname.replace(/index\.html$/, "");
    if (pu && !main.querySelector(".exh-foot")) {
      var meta = pu.previousElementSibling && pu.previousElementSibling.classList.contains("meta") ? pu.previousElementSibling : null;
      var qr = main.querySelector(".print-qr"); if (qr) qr.parentNode.removeChild(qr);
      var foot = document.createElement("div"); foot.className = "exh-foot";
      foot.innerHTML = '<div class="exh-foot-t"></div><img class="exh-qr" src="/assets/qr/' + p.replace(/^\/|\/$/g, "").replace(/\//g, "-") + '.svg" alt="QR code for this page" width="64" height="64">';
      pu.parentNode.insertBefore(foot, pu);
      if (meta) foot.firstChild.appendChild(meta);
      foot.firstChild.appendChild(pu);
    }
  }
  window.MW_EXFIG = { figs: F, svg: svgFor, init: init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
