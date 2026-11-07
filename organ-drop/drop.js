/* Organ Drop (working title): a falling-block bonus game for Malady Wise.
   Seven pieces, seven organs. 10 x 20 board, SRS rotation with wall kicks, 7-bag randomiser, hold, next preview,
   ghost piece, lock delay, levels every 10 lines with faster gravity and an organ fact on each level-up.
   High scores: top 5 in this browser only. ?debug=1 exposes window.OD_DEBUG for testing (and ?day=YYYY-MM-DD to fake the date).
   Daily challenge: the piece order is seeded from the Sydney date, so everyone gets the same organs; one scored go a day, replays are practice.
   World boards (oall, odaily) on the Malady Wise counter server: used ONLY once the server echoes board === "oall".
   An older server maps unknown boards to Basil + Clover's "all", so until then nothing is shown or posted.
   Sound: tiny WebAudio blips synthesised on the fly (no files), started only after the first tap or key; mute saved per browser.
   Combos (back-to-back clearing drops) and perfect matches (a cleared row all one organ: triple) add bonus points.
   Nothing here touches the seeded daily RNG except the piece bag, so the daily stays the same for everyone. */
(function () {
  "use strict";
  var TITLE = "Organ Drop"; // the game's name: change it here only
  var HSKEY = "mw-organdrop-hs";
  var DEBUG = /[?&]debug=1\b/.test(location.search);
  var STATKEY = "mw-organdrop-stats", DKEY = "mw-organdrop-daily", NAMEKEY = "mw-organdrop-name", PIDKEY = "mw-organdrop-pid";
  var MODE = "endless"; // "endless" | "daily" (today's scored go) | "practice" (a daily replay)
  var MUTEKEY = "mw-organdrop-mute";

  function $(id) { return document.getElementById(id); }
  function lget(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function lset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function track(n) { try { if (window.MW_track) MW_track("organ-drop/" + n); } catch (e) {} }
  function quiet() { var r = document.documentElement.getAttribute("data-motion") === "reduce"; try { r = r || matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {} return r; }
  function normie() { return document.documentElement.getAttribute("data-mode") === "normie"; }
  function shuffle(a, rnd) { rnd = rnd || Math.random; a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function sydDay() {
    if (DEBUG) { var m = /[?&]day=(\d{4}-\d\d-\d\d)\b/.exec(location.search); if (m) return m[1]; }
    try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  // same seeded generator as Basil + Clover's daily: string hash into a mulberry32-style PRNG
  function seeded(str) { var a = 0; for (var i = 0; i < str.length; i++) a = Math.imul(a ^ str.charCodeAt(i), 2654435761); return function () { a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function fmt(n) { return Number(n || 0).toLocaleString("en-AU"); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function dailyRec() { var r = lget(DKEY); return r && r.d === sydDay() ? r : null; }
  function bumpStats(f) { var st = lget(STATKEY); if (!st || typeof st !== "object") st = {}; f(st); lset(STATKEY, st); try { if (window.MW_checkBadges) MW_checkBadges(); } catch (e) {} }

  var TOUCH = false; try { TOUCH = navigator.maxTouchPoints > 0 || "ontouchstart" in window || matchMedia("(pointer:coarse)").matches; } catch (e) {}
  if (TOUCH) document.documentElement.classList.add("od-touch");
  document.title = TITLE + ": a bonus organ-stacking game | Malady Wise";
  Array.prototype.forEach.call(document.querySelectorAll(".od-name"), function (e) { e.textContent = TITLE; });

  // ---------- pieces: shape, organ, colour. Matrix values are cell ids so rotation keeps track of the face cell ----------
  var P = {
    I: { emo: "🌭", organ: "Bowel", col: "#EE8F78", dark: "#B85A45", face: 2, m: [[0, 0, 0, 0], [1, 2, 3, 4], [0, 0, 0, 0], [0, 0, 0, 0]] },
    J: { emo: "🟧", organ: "Stomach", col: "#F2B35E", dark: "#B97A22", face: 3, m: [[1, 0, 0], [2, 3, 4], [0, 0, 0]] },
    L: { emo: "🟫", organ: "Liver", col: "#9A4433", ghost: "#D9826C", dark: "#5E2216", face: 3, m: [[0, 0, 1], [2, 3, 4], [0, 0, 0]] },
    O: { emo: "🫀", organ: "Heart", col: "#E03A4E", dark: "#8F1B2B", face: 3, m: [[1, 2], [3, 4]] },
    S: { emo: "🫘", organ: "Kidney", col: "#A0547A", ghost: "#D88CB4", dark: "#62284A", face: 3, m: [[0, 1, 2], [3, 4, 0], [0, 0, 0]] },
    T: { emo: "🫁", organ: "Lungs", col: "#9C84D8", dark: "#5B449A", face: 3, m: [[0, 1, 0], [2, 3, 4], [0, 0, 0]] },
    Z: { emo: "🧠", organ: "Brain", col: "#F4AFC6", dark: "#C46A8C", face: 3, m: [[1, 2, 0], [0, 3, 4], [0, 0, 0]] }
  };
  var TYPES = ["I", "J", "L", "O", "S", "T", "Z"];
  function rotCW(m) { var n = m.length, r = []; for (var y = 0; y < n; y++) { r.push([]); for (var x = 0; x < n; x++) r[y].push(m[n - 1 - x][y]); } return r; }
  TYPES.forEach(function (t) { var p = P[t], r = [p.m]; for (var i = 1; i < 4; i++) r.push(rotCW(r[i - 1])); p.rots = r; p.idx = TYPES.indexOf(t) + 1; });
  // SRS kicks as [dx, dy] with y pointing UP (converted when used). Key: from*10+to
  var KJ = { 1: [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]], 10: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]], 12: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]], 21: [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    23: [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]], 32: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]], 30: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]], 3: [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]] };
  var KI = { 1: [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]], 10: [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]], 12: [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]], 21: [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    23: [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]], 32: [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]], 30: [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]], 3: [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]] };

  // ---------- copy ----------
  var MED1 = ["Surgery successful", "Clean margins", "Discharged home", "Stable on the ward", "Sutures in", "Obs all normal", "Back to the ward", "Theatre list cleared"];
  var MEDN = { 2: "Double bypass!", 3: "Triple bypass!", 4: "Transplant!" };
  var NOR = { 1: "Line cleared!", 2: "Double!", 3: "Triple!", 4: "Four lines!" };
  function comboTxt(n) { return (normie() ? "Combo ×" : "Code blue! ×") + n; }
  var PERFECT = "Perfect match!";
  var OVERMSG = ["The ward is full. Time for a fresh shift.", "Too many patients, not enough beds.", "The team did brilliantly. Rest, then go again.", "Even the best theatre lists run over."];
  var OVERN = ["The board is full. One more go?", "Stacked to the top. Nice try.", "So close to a new best. Again?"];
  var FACTS = [
    "Your heart beats around 100,000 times a day.",
    "At rest, your heart pumps about 5 litres of blood every minute.",
    "Your heart has its own built-in pacemaker, the sinoatrial node.",
    "Your left lung is a little smaller than your right, to make room for your heart.",
    "Your right lung has three lobes. Your left lung has two.",
    "Your lungs hold roughly 480 million tiny air sacs called alveoli.",
    "Your kidneys filter about 180 litres of fluid a day, but you only wee out 1 to 2 litres.",
    "Most people with one healthy kidney live a completely normal life.",
    "Your kidneys make a hormone, erythropoietin, that tells your bone marrow to make red blood cells.",
    "Your liver can grow back to nearly its full size after part of it is removed.",
    "Your liver can store several years' worth of vitamin B12.",
    "The surface cells lining your stomach are replaced every few days.",
    "Stomach acid is hydrochloric acid, with a pH of about 1.5 to 3.5.",
    "Measured end to end, your small intestine is roughly 6 metres long.",
    "Your gut has its own nervous system, with hundreds of millions of nerve cells.",
    "Your brain is about 2% of your body weight but uses around 20% of its energy.",
    "The first successful kidney transplant, in 1954, was between identical twins in Boston.",
    "In the early 1950s, Dr Virginia Apgar created the newborn score that still checks heart rate and breathing at birth.",
    "Hiccups are sudden, involuntary spasms of your diaphragm.",
    "Your skin is your body's largest organ."
  ];
  // Normie mode: animal organ facts, no medicine
  var NFACTS = [
    "An octopus has three hearts: one for the body and two for the gills.",
    "A giraffe's heart weighs about 11 kg and has to push blood two metres up to its head.",
    "A hummingbird's heart can beat more than 1,200 times a minute.",
    "A cow has one stomach, split into four compartments.",
    "Many sea stars push their stomach out through their mouth to digest dinner outside their body.",
    "Bird lungs don't puff up like balloons. Air flows one way through them, helped by a set of air sacs.",
    "Most snakes have only one working lung, long and thin to fit their shape.",
    "A sperm whale has the biggest brain of any animal, around 8 kg.",
    "A platypus has no stomach. Its food pipe joins straight onto its intestine.",
    "Wood frogs freeze almost solid in winter. Their heart stops, then starts again when they thaw.",
    "An earthworm has five pairs of heart-like pumps.",
    "A shark's huge, oily liver helps stop it sinking.",
    "Elephants have the biggest brain of any land animal, about 5 kg.",
    "Some frogs can breathe through their skin, even underwater."
  ];

  // ---------- state ----------
  var COLS = 10, ROWS = 22, HID = 2; // rows 0-1 are hidden spawn rows
  var S = null, running = false, paused = false, raf = 0, last = 0, C = 24, dpr = 1;
  var cv = $("od-canvas"), ctx = cv.getContext("2d");
  var held = { left: 0, right: 0, down: 0 }, das = { dir: 0, t: 0, arr: 0 }, softT = 0;
  var DAS = 0.16, ARR = 0.045, SOFT = 0.035, LOCK = 0.5;

  function emptyBoard() { var b = []; for (var r = 0; r < ROWS; r++) b.push(new Array(COLS).fill(0)); return b; }
  function bagNext() { if (!S.bag.length) S.bag = shuffle(TYPES, S.rng); var t = S.bag.pop(); S.seq.push(t); return t; }
  function newState() {
    var day = sydDay();
    return { mode: MODE, day: day, rng: MODE === "endless" ? Math.random : seeded("organdrop-" + day), seq: [], quads: 0, board: emptyBoard(), bag: [], queue: [], cur: null, hold: null, canHold: true, score: 0, lines: 0, level: 1,
      gT: 0, lockT: 0, lockN: 0, lowY: 0, over: false, t: 0, clearing: null, toastT: 0, factT: 0, facts: shuffle(normie() ? NFACTS : FACTS), factI: 0, seen: [], l1: 0, overT: 0, combo: 0, perfects: 0, bestCombo: 0 };
  }
  function fillQueue() { while (S.queue.length < 3) S.queue.push(bagNext()); }
  function gravity() { var l = Math.min(S.level, 20); return Math.pow(0.8 - (l - 1) * 0.007, l - 1); }

  function cells(t, r) { return P[t].rots[r]; }
  function fits(t, r, x, y) {
    var m = cells(t, r);
    for (var j = 0; j < m.length; j++) for (var i = 0; i < m.length; i++) if (m[j][i]) {
      var bx = x + i, by = y + j;
      if (bx < 0 || bx >= COLS || by >= ROWS) return false;
      if (by >= 0 && S.board[by][bx]) return false;
    }
    return true;
  }
  function spawn(t) {
    var x = t === "O" ? 4 : 3, y = 1;
    if (!fits(t, 0, x, y)) y = 0;
    S.cur = { t: t, r: 0, x: x, y: y };
    S.gT = 0; S.lockT = 0; S.lockN = 0; S.lowY = y;
    if (!fits(t, 0, x, y)) { gameOver(); return false; }
    return true;
  }
  function nextPiece() { fillQueue(); var t = S.queue.shift(); fillQueue(); S.canHold = true; spawn(t); }
  function landed() { var c = S.cur; return !fits(c.t, c.r, c.x, c.y + 1); }
  function touched() { // a successful move/rotate while resting resets the lock timer (up to 15 times)
    var c = S.cur;
    if (c.y > S.lowY) { S.lowY = c.y; S.lockN = 0; }
    if (landed() && S.lockN < 15) { S.lockT = 0; S.lockN++; }
  }
  function move(dx) {
    if (!S.cur || S.over || S.clearing) return false;
    var c = S.cur; if (!fits(c.t, c.r, c.x + dx, c.y)) return false;
    c.x += dx; touched(); return true;
  }
  function rotate(dir) {
    if (!S.cur || S.over || S.clearing) return false;
    var c = S.cur; if (c.t === "O") return false;
    var to = (c.r + dir + 4) % 4, k = (c.t === "I" ? KI : KJ)[c.r * 10 + to];
    for (var i = 0; i < k.length; i++) {
      var nx = c.x + k[i][0], ny = c.y - k[i][1];
      if (fits(c.t, to, nx, ny)) { c.x = nx; c.y = ny; c.r = to; touched(); return true; }
    }
    return false;
  }
  function softStep() { if (!S.cur || S.clearing || S.over) return; var c = S.cur; if (fits(c.t, c.r, c.x, c.y + 1)) { c.y++; S.score++; S.gT = 0; if (c.y > S.lowY) { S.lowY = c.y; S.lockN = 0; } } }
  function ghostY() { var c = S.cur, y = c.y; while (fits(c.t, c.r, c.x, y + 1)) y++; return y; }
  function hardDrop() {
    if (!S.cur || S.over || S.clearing) return;
    var g = ghostY(); S.score += 2 * (g - S.cur.y); S.cur.y = g; lock();
  }
  function hold() {
    if (!S.cur || S.over || S.clearing || !S.canHold) return;
    var t = S.cur.t;
    if (S.hold) { var h = S.hold; S.hold = t; spawn(h); } else { S.hold = t; fillQueue(); spawn(S.queue.shift()); fillQueue(); }
    S.canHold = false;
  }
  function lock() {
    var c = S.cur, m = cells(c.t, c.r), above = true, p = P[c.t];
    for (var j = 0; j < m.length; j++) for (var i = 0; i < m.length; i++) if (m[j][i]) {
      var by = c.y + j; if (by >= HID) above = false;
      if (by >= 0) S.board[by][c.x + i] = p.idx + (m[j][i] === p.face ? 8 : 0);
    }
    S.cur = null;
    if (above) { gameOver(); return; }
    sfx("lock");
    var full = [], perfect = 0;
    for (var r = 0; r < ROWS; r++) if (S.board[r].every(function (v) { return v; })) {
      full.push(r);
      var t0 = S.board[r][0] & 7; if (S.board[r].every(function (v) { return (v & 7) === t0; })) perfect++; // a matched donor: every cell the same organ
    }
    if (full.length) { S.clearing = { rows: full, t: 0 }; scoreLines(full.length, perfect); }
    else { S.combo = 0; nextPiece(); }
    hud();
  }
  function finishClear() {
    var rows = S.clearing.rows; S.clearing = null;
    S.board = S.board.filter(function (row, i) { return rows.indexOf(i) < 0; });
    while (S.board.length < ROWS) S.board.unshift(new Array(COLS).fill(0));
    nextPiece();
  }
  // line points x level; each perfect-match row scores triple (its share of the line points, x3);
  // combo: the 2nd, 3rd... clearing drop in a row adds 50 x combo x level. All at the level before these lines count.
  function scoreLines(n, perfect) {
    var before = S.level, base = [0, 100, 300, 500, 800][n] * S.level;
    perfect = perfect || 0;
    S.combo++; S.bestCombo = Math.max(S.bestCombo, S.combo);
    var bonus = Math.round(base * 2 * perfect / n), cb = S.combo > 1 ? 50 * S.combo * S.level : 0;
    S.score += base + bonus + cb; S.perfects += perfect;
    S.last = { n: n, base: base, perfect: perfect, perfectBonus: bonus, combo: S.combo, comboBonus: cb };
    if (n === 4) { S.quads++; bumpStats(function (st) { st.quad = (st.quad || 0) + 1; }); }
    S.lines += n; S.level = 1 + Math.floor(S.lines / 10);
    var txt = normie() ? NOR[n] : n === 1 ? MED1[S.l1++ % MED1.length] : MEDN[n];
    if (perfect) txt += "\n" + PERFECT;
    if (cb) txt += "\n" + comboTxt(S.combo);
    toast(txt, n === 4 || perfect > 0 || S.combo > 2);
    sfx("clear", n, perfect > 0, S.combo);
    buzz(n === 4 ? [70, 40, 110] : perfect ? [40, 30, 40] : 30);
    if (S.level > before) levelUp();
  }
  function levelUp() {
    var f = S.facts[S.factI % S.facts.length]; S.factI++; if (S.seen.indexOf(f) < 0) S.seen.push(f);
    $("od-factlv").textContent = "Level " + S.level + " · organ fact";
    $("od-facttx").textContent = f;
    var el = $("od-fact"); el.classList.remove("new"); void el.offsetWidth; el.classList.add("new"); S.factT = 6.5;
    track("level-" + S.level);
  }
  function toast(t, big) {
    var el = $("od-toast"); el.textContent = t; el.classList.toggle("big", !!big);
    el.hidden = true; void el.offsetWidth; el.hidden = false; S.toastT = big ? 1.8 : 1.3;
  }

  // ---------- loop ----------
  function step(dt) {
    S.t += dt;
    if (S.toastT > 0) { S.toastT -= dt; if (S.toastT <= 0) $("od-toast").hidden = true; }
    if (S.factT > 0) { S.factT -= dt; if (S.factT <= 0) $("od-fact").classList.remove("new"); }
    if (S.clearing) { S.clearing.t += dt; if (S.clearing.t > (quiet() ? 0.08 : 0.22)) finishClear(); return; }
    if (!S.cur) return;
    // auto-repeat for held left/right (keys or buttons)
    var dir = held.right && !held.left ? 1 : held.left && !held.right ? -1 : held.right && held.left ? (held.right > held.left ? 1 : -1) : 0;
    if (dir !== das.dir) { das.dir = dir; das.t = 0; das.arr = 0; }
    else if (dir) { das.t += dt; if (das.t >= DAS) { das.arr += dt; while (das.arr >= ARR) { das.arr -= ARR; if (!move(dir)) { das.arr = 0; break; } } } }
    if (held.down) { softT += dt; while (softT >= SOFT) { softT -= SOFT; softStep(); } } else softT = 0;
    if (!S.cur) return;
    if (landed()) {
      S.lockT += dt; if (S.lockT >= LOCK) lock();
    } else {
      S.lockT = 0; S.gT += dt; var g = gravity();
      while (S.gT >= g && S.cur && !landed()) { S.gT -= g; S.cur.y++; if (S.cur.y > S.lowY) { S.lowY = S.cur.y; S.lockN = 0; } }
      if (S.cur && landed()) S.gT = 0;
    }
    hud();
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
    if (!paused && !S.over) step(dt);
    draw();
  }

  // ---------- drawing ----------
  var sprites = {};
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function motif(c, t, s, col) {
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = Math.max(1, s * 0.075); c.lineCap = "round"; c.lineJoin = "round"; c.globalAlpha = 0.55;
    var u = function (v) { return v * s; };
    c.beginPath();
    if (t === "I") { c.moveTo(u(.18), u(.5)); c.bezierCurveTo(u(.32), u(.28), u(.42), u(.28), u(.5), u(.5)); c.bezierCurveTo(u(.58), u(.72), u(.68), u(.72), u(.82), u(.5)); c.stroke(); }
    else if (t === "J") { c.arc(u(.5), u(.32), u(.26), Math.PI * .2, Math.PI * .8); c.stroke(); }
    else if (t === "L") { [[.3, .32], [.66, .4], [.42, .68]].forEach(function (d) { c.moveTo(u(d[0]) + u(.07), u(d[1])); c.arc(u(d[0]), u(d[1]), u(.07), 0, 7); }); c.fill(); }
    else if (t === "O") { var cx = u(.5), cy = u(.54), r = u(.12); c.moveTo(cx, cy + r * 1.6); c.bezierCurveTo(cx - r * 2.4, cy - r * .2, cx - r * .9, cy - r * 2.1, cx, cy - r * .6); c.bezierCurveTo(cx + r * .9, cy - r * 2.1, cx + r * 2.4, cy - r * .2, cx, cy + r * 1.6); c.fill(); }
    else if (t === "S") { c.ellipse(u(.5), u(.5), u(.17), u(.25), 0, Math.PI * .65, Math.PI * 2.35); c.stroke(); }
    else if (t === "T") { c.moveTo(u(.5), u(.2)); c.lineTo(u(.5), u(.48)); c.lineTo(u(.3), u(.72)); c.moveTo(u(.5), u(.48)); c.lineTo(u(.7), u(.72)); c.moveTo(u(.4), u(.6)); c.lineTo(u(.42), u(.78)); c.moveTo(u(.6), u(.6)); c.lineTo(u(.58), u(.78)); c.stroke(); }
    else if (t === "Z") { c.moveTo(u(.2), u(.4)); c.quadraticCurveTo(u(.32), u(.22), u(.42), u(.4)); c.quadraticCurveTo(u(.52), u(.58), u(.62), u(.4)); c.quadraticCurveTo(u(.72), u(.22), u(.8), u(.4)); c.moveTo(u(.28), u(.66)); c.quadraticCurveTo(u(.4), u(.52), u(.5), u(.68)); c.quadraticCurveTo(u(.6), u(.82), u(.72), u(.64)); c.stroke(); }
    c.restore();
  }
  function face(c, s) {
    c.save();
    c.fillStyle = "rgba(255,120,150,.4)"; c.beginPath(); c.arc(s * .24, s * .62, s * .09, 0, 7); c.arc(s * .76, s * .62, s * .09, 0, 7); c.fill();
    c.fillStyle = "#2B2340"; c.beginPath(); c.arc(s * .34, s * .45, s * .085, 0, 7); c.arc(s * .66, s * .45, s * .085, 0, 7); c.fill();
    c.fillStyle = "#fff"; c.beginPath(); c.arc(s * .36, s * .42, s * .03, 0, 7); c.arc(s * .68, s * .42, s * .03, 0, 7); c.fill();
    c.strokeStyle = "#2B2340"; c.lineWidth = Math.max(1.2, s * .06); c.lineCap = "round"; c.beginPath(); c.arc(s * .5, s * .56, s * .13, Math.PI * .18, Math.PI * .82); c.stroke();
    c.restore();
  }
  function sprite(t, f, s) {
    var k = t + f + s + "|" + dpr; if (sprites[k]) return sprites[k];
    var o = document.createElement("canvas"); o.width = o.height = Math.ceil(s * dpr); var c = o.getContext("2d"); c.scale(dpr, dpr);
    var p = P[t], pad = Math.max(0.6, s * 0.04), r = s * 0.24;
    c.fillStyle = p.dark; rr(c, pad, pad, s - 2 * pad, s - 2 * pad, r); c.fill();
    c.fillStyle = p.col; rr(c, pad, pad, s - 2 * pad, s - 2 * pad - s * 0.08, r); c.fill();
    var g = c.createLinearGradient(0, pad, 0, s * .6); g.addColorStop(0, "rgba(255,255,255,.38)"); g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g; rr(c, pad + s * .08, pad + s * .06, s - 2 * pad - s * .16, s * .38, r * .7); c.fill();
    if (f) face(c, s); else motif(c, t, s, p.dark);
    sprites[k] = o; return o;
  }
  function blit(c, t, f, x, y, s) { c.drawImage(sprite(t, f, s), x, y, s, s); }
  function drawPiece(c, t, r, x0, y0, s, alpha) {
    var m = cells(t, r), p = P[t]; c.save(); if (alpha != null) c.globalAlpha = alpha;
    for (var j = 0; j < m.length; j++) for (var i = 0; i < m.length; i++) if (m[j][i]) blit(c, t, m[j][i] === p.face, x0 + i * s, y0 + j * s, s);
    c.restore();
  }
  function bbox(t) { var m = cells(t, 0), x0 = 9, x1 = -1, y0 = 9, y1 = -1; for (var j = 0; j < m.length; j++) for (var i = 0; i < m.length; i++) if (m[j][i]) { x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, j); y1 = Math.max(y1, j); } return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }; }
  function drawMini(c, t, cx, cy, s, alpha) { var b = bbox(t); drawPiece(c, t, 0, cx - (b.x + b.w / 2) * s, cy - (b.y + b.h / 2) * s, s, alpha); }
  var masc = new Image(); masc.src = "/assets/mascots/labelosis.svg?v=1";

  function draw() {
    if (!S) return;
    var W = C * 14.4, H = C * 20;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#221A33"; ctx.fillRect(0, 0, W, H);
    // board well
    ctx.fillStyle = "#2B2140"; ctx.fillRect(0, 0, C * 10, H);
    ctx.strokeStyle = "rgba(255,255,255,.055)"; ctx.lineWidth = 1; ctx.beginPath();
    for (var i = 1; i < COLS; i++) { ctx.moveTo(i * C + .5, 0); ctx.lineTo(i * C + .5, H); }
    for (var j = 1; j < 20; j++) { ctx.moveTo(0, j * C + .5); ctx.lineTo(C * 10, j * C + .5); }
    ctx.stroke();
    // locked cells
    for (var r = HID; r < ROWS; r++) for (var cx = 0; cx < COLS; cx++) { var v = S.board[r][cx]; if (v) blit(ctx, TYPES[(v & 7) - 1], v > 8, cx * C, (r - HID) * C, C); }
    // line clear flash
    if (S.clearing) { var a = 1 - S.clearing.t / 0.22; ctx.fillStyle = "rgba(255,255,255," + Math.max(0, Math.min(.85, a)).toFixed(2) + ")"; S.clearing.rows.forEach(function (rw) { ctx.fillRect(0, (rw - HID) * C, C * 10, C); }); }
    // ghost + current piece (clipped to the visible board)
    if (S.cur && !S.over) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, C * 10, H); ctx.clip();
      var c = S.cur, gy = ghostY(), m = cells(c.t, c.r), p = P[c.t];
      if (gy !== c.y) {
        ctx.strokeStyle = p.ghost || p.col; ctx.globalAlpha = .6; ctx.lineWidth = Math.max(1.5, C * .07);
        for (var jj = 0; jj < m.length; jj++) for (var ii = 0; ii < m.length; ii++) if (m[jj][ii]) { rr(ctx, (c.x + ii) * C + C * .12, (gy + jj - HID) * C + C * .12, C * .76, C * .76, C * .2); ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
      drawPiece(ctx, c.t, c.r, c.x * C, (c.y - HID) * C, C);
      ctx.restore();
    }
    // side panel: hold, next, mascot
    var sx = C * 10.4, sw = C * 3.6, ms = C * .72;
    ctx.fillStyle = "#D9CCF0"; ctx.font = "600 " + Math.round(C * .42) + "px Poppins, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("HOLD", sx + sw / 2, C * .5);
    ctx.fillStyle = "rgba(255,255,255,.07)"; rr(ctx, sx, C * .9, sw, C * 2.8, C * .3); ctx.fill();
    if (S.hold) drawMini(ctx, S.hold, sx + sw / 2, C * 2.3, ms, S.canHold ? 1 : .35);
    ctx.fillStyle = "#D9CCF0"; ctx.fillText("NEXT", sx + sw / 2, C * 4.4);
    ctx.fillStyle = "rgba(255,255,255,.07)"; rr(ctx, sx, C * 4.8, sw, C * 7.6, C * .3); ctx.fill();
    for (var q = 0; q < 3 && q < S.queue.length; q++) drawMini(ctx, S.queue[q], sx + sw / 2, C * (6.2 + q * 2.45), q ? ms * .8 : ms, q ? .75 : 1);
    // organ name of the falling piece
    if (S.cur) { ctx.fillStyle = P[S.cur.t].col; ctx.font = "700 " + Math.round(C * .4) + "px Poppins, system-ui, sans-serif"; ctx.fillText(P[S.cur.t].organ, sx + sw / 2, C * 13.3); }
    if (masc.complete && masc.naturalWidth) {
      var bob = !paused && !S.over && !quiet() ? Math.sin(S.t * 2.4) * C * .12 : 0, mw = sw * 1.02;
      ctx.drawImage(masc, sx + (sw - mw) / 2, C * 14.2 + bob, mw, mw);
    }
    ctx.fillStyle = "rgba(217,204,240,.75)"; ctx.font = "500 " + Math.round(C * .32) + "px Poppins, system-ui, sans-serif";
    ctx.fillText(normie() ? "Keep stacking!" : "Ward round", sx + sw / 2, C * 19.3);
  }

  function hud() {
    if (!S) return;
    $("od-score").textContent = S.score.toLocaleString("en-AU"); $("od-level").textContent = S.level; $("od-lines").textContent = S.lines;
  }

  // ---------- sizing: whole game (HUD + board + buttons) fits the window ----------
  function size() {
    var g = $("od-game"); if (g.hidden) return;
    var bar = document.querySelector(".bar"), barH = bar ? bar.offsetHeight : 0;
    var ctrl = $("od-ctrl"), keys = $("od-keys"), below = (ctrl.offsetHeight || 0) + (keys.offsetHeight || 0) + $("od-fact").offsetHeight;
    var availH = window.innerHeight - barH - $("od-hud").offsetHeight - below - 8 * 3 - 18;
    var availW = g.clientWidth || 340;
    C = Math.max(12, Math.floor(Math.min(availW / 14.4, availH / 20)));
    dpr = Math.min(3, window.devicePixelRatio || 1); sprites = {};
    var W = C * 14.4, H = C * 20;
    cv.style.width = W + "px"; cv.style.height = H + "px"; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    $("od-hud").style.maxWidth = W + "px"; $("od-fact").style.maxWidth = W + "px"; ctrl.style.maxWidth = Math.max(W, 300) + "px";
    draw();
  }
  window.addEventListener("resize", size);

  // ---------- flow ----------
  function start(mode) {
    if (mode === "daily" || mode === "practice") MODE = dailyRec() ? "practice" : "daily";
    else if (mode === "endless") MODE = "endless";
    else if (MODE !== "endless") MODE = dailyRec() ? "practice" : "daily"; // Play again / Space: same mode
    S = newState();
    if (MODE === "daily") lset(DKEY, { d: S.day, s: 0, l: 0, v: 1, live: 1 }); // the scored go is used up as soon as it starts
    fillQueue(); nextPiece();
    $("od-scl").textContent = MODE === "daily" ? "Daily · " + fmtDate(S.day) : MODE === "practice" ? "Practice · " + fmtDate(S.day) : "Score";
    bumpStats(function (st) { st.games = (st.games || 0) + 1; });
    lbFetch(lbFor());
    paused = false; running = true; held.left = held.right = held.down = 0;
    $("od-intro").hidden = true; $("od-game").hidden = false; $("od-over").hidden = true; $("od-paused").hidden = true;
    $("od-toast").hidden = true; $("od-fact").classList.remove("new"); $("od-factlv").textContent = "Organ facts"; $("od-facttx").textContent = "Clear 10 rows to unlock your first one."; $("od-stage").classList.remove("paused");
    $("od-pause").innerHTML = "&#10074;&#10074;";
    window.scrollTo(0, 0); size(); hud();
    cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame);
    track(MODE === "endless" ? "start" : MODE === "daily" ? "daily-start" : "practice-start");
  }
  function exitToStart() {
    if (S && !S.over && S.mode === "daily") { lset(DKEY, { d: S.day, s: S.score, l: S.lines, v: S.level, quit: 1 }); } // leaving mid-go keeps the score so far
    running = false; paused = false; cancelAnimationFrame(raf);
    $("od-game").hidden = true; $("od-intro").hidden = false; $("od-paused").hidden = true; $("od-over").hidden = true;
    renderBest(); window.scrollTo(0, 0);
  }
  function togglePause(force) {
    if (!running || !S || S.over) return;
    paused = typeof force === "boolean" ? force : !paused;
    held.left = held.right = held.down = 0;
    $("od-pause").innerHTML = paused ? "&#9654;" : "&#10074;&#10074;";
    $("od-pause").setAttribute("aria-label", paused ? "Resume" : "Pause");
    $("od-stage").classList.toggle("paused", paused);
    $("od-paused").hidden = !paused || !$("od-help").hidden;
    if (paused && !$("od-paused").hidden) $("od-resume").focus();
  }
  function gameOver() {
    S.over = true; S.cur = null; S.overT = performance.now();
    sfx("over");
    $("od-toast").hidden = true;
    var list = lget(HSKEY); if (!Array.isArray(list)) list = [];
    var prevBest = list.length ? list[0].s : 0, me = { id: -1 };
    if (S.mode === "endless") { me = { s: S.score, l: S.lines, v: S.level, d: new Date().toISOString().slice(0, 10), id: Date.now() };
      list.push(me); list.sort(function (a, b) { return b.s - a.s; }); list = list.slice(0, 5); lset(HSKEY, list); }
    if (S.mode === "daily") lset(DKEY, { d: S.day, s: S.score, l: S.lines, v: S.level });
    bumpStats(function (st) { st.lines = Math.max(st.lines || 0, S.lines); st.best = Math.max(st.best || 0, S.score); if (S.mode === "daily") st.daily = (st.daily || 0) + 1; });
    var N = normie();
    $("od-otitle").textContent = N ? "Game over" : "Code blue";
    $("od-over").classList.toggle("blue", !N);
    var msgs = N ? OVERN : OVERMSG; $("od-omsg").textContent = msgs[Math.floor(Math.random() * msgs.length)];
    $("od-opts").textContent = S.score.toLocaleString("en-AU"); $("od-olines").textContent = S.lines; $("od-olv").textContent = S.level;
    var ob = $("od-obest"), dr = dailyRec();
    ob.classList.remove("pb");
    if (S.mode === "daily") ob.textContent = "Daily challenge · " + fmtDate(S.day) + " · scored";
    else if (S.mode === "practice") ob.textContent = "Practice run. Today’s scored go: " + (dr ? fmt(dr.s) : "0") + ".";
    else if (S.score > 0 && S.score > prevBest) { ob.textContent = "New personal best!"; ob.classList.add("pb"); }
    else ob.textContent = prevBest ? "Your best: " + fmt(prevBest) : "";
    $("od-hs1").hidden = S.mode !== "endless" || ODLB;
    if (S.mode === "endless") renderHS($("od-hs1"), list, me.id);
    // shareable result: the scored daily (also from a practice run), or this endless game
    var head = S.mode === "endless" ? TITLE + " · " + fmt(S.score) + " pts · " + S.lines + " lines · level " + S.level
      : TITLE + " daily " + fmtDate(S.day) + " · " + fmt(dr ? dr.s : S.score) + " pts · " + (dr ? dr.l : S.lines) + " lines";
    $("od-sharetx").textContent = shareText(head); $("od-share").textContent = "Share";
    $("od-again").textContent = S.mode === "endless" ? "Play again" : "Practise this daily";
    lbOver();
    $("od-over").hidden = false; $("od-again").focus({ preventScroll: true });
    track(S.mode === "endless" ? "over" : S.mode === "daily" ? "daily-over" : "practice-over");
  }
  // Wordle-style picture of the final stack: its top 6 non-empty rows, one emoji per cell, trimmed to fit a post
  var LINK = "maladywise.com/organ-drop/";
  function stackRows() {
    var out = [];
    for (var r = 0; r < ROWS && out.length < 6; r++) {
      if (!S.board[r].some(function (v) { return v; })) continue;
      out.push(S.board[r].map(function (v) { return v ? P[TYPES[(v & 7) - 1]].emo : "⬛"; }).join(""));
    }
    return out;
  }
  function postLen(t) { // X-style weight: emoji and other astral or symbol characters count 2, a link counts 23
    var n = 0; t = t.replace(LINK, ""); n += 23;
    Array.from(t).forEach(function (ch) { n += ch.codePointAt(0) > 0x2000 && ch !== "·" ? 2 : 1; });
    return n;
  }
  function shareText(head) {
    var rows = stackRows(), t;
    do { t = rows.length ? head + "\n" + rows.join("\n") + "\n" + LINK : head + " 🫀🫁 " + LINK; } while (postLen(t) > 280 && rows.pop());
    return t;
  }
  function fmtDate(d) { try { var p = d.split("-"); return +p[2] + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][+p[1] - 1]; } catch (e) { return ""; } }
  function renderHS(ol, list, meId) {
    if (!list || !list.length) { ol.innerHTML = '<li class="none">No scores yet. Be the first.</li>'; return; }
    ol.innerHTML = list.map(function (e, i) {
      return '<li' + (e.id === meId ? ' class="me"' : "") + '><span class="rk">' + (i + 1) + '</span><span class="sc">' + Number(e.s).toLocaleString("en-AU") +
        '</span><span class="dt">' + e.l + " lines · Lv " + e.v + " · " + fmtDate(e.d) + "</span></li>";
    }).join("");
  }
  function renderBest() {
    var list = lget(HSKEY); if (!Array.isArray(list)) list = [];
    $("od-best").innerHTML = list.length ? "Your best: <b>" + Number(list[0].s).toLocaleString("en-AU") + "</b>" : "";
    renderHS($("od-hs0"), list);
    var dr = dailyRec();
    $("od-daily").textContent = dr ? "Daily (practice)" : "Daily challenge";
    $("od-dnote").innerHTML = dr ? "Today’s daily: <b>" + fmt(dr.s) + "</b> pts, " + dr.l + " lines. Replays are practice. New organs at midnight (Sydney)."
      : "Today’s daily: the same organs, in the same order, for everyone. One scored go.";
  }

  // ---------- world and daily leaderboards (via the Malady Wise counter server) ----------
  var LB = "https://mw-presence.onrender.com", ODLB = false, boards = { oall: null, odaily: null }, posted = false;
  function pid() { var p = lget(PIDKEY); if (!p || p.length < 8) { p = (Math.random().toString(36) + Math.random().toString(36)).replace(/[^a-z0-9]/g, "").slice(0, 12); lset(PIDKEY, p); } return p; }
  function lbFor() { return S && S.mode !== "endless" ? "odaily" : "oall"; }
  function lbGot(k, j) {
    var ok = !!(j && Array.isArray(j.rows) && j.board === k);
    if (j && !ok) { ODLB = false; $("od-lb").hidden = true; } // the server doesn't know Organ Drop's boards (yet, or any more)
    boards[k] = ok ? j.rows : "err";
    if (S && S.over && lbFor() === k) lbRender();
  }
  function lbFetch(k) {
    if (!ODLB || !window.fetch) return;
    if (boards[k] !== "wait") boards[k] = "wait";
    fetch(LB + "/top?b=" + k + "&id=" + pid(), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) { lbGot(k, j); }).catch(function () { lbGot(k, null); });
  }
  function lbProbe() {
    if (!window.fetch) return;
    fetch(LB + "/top?b=oall&id=" + pid(), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.board === "oall" && Array.isArray(j.rows)) { ODLB = true; boards.oall = j.rows; }
    }).catch(function () {});
  }
  function lbPost(n) {
    var k = lbFor(); if (!ODLB || S.mode === "practice" || S.score <= 0 || posted) return;
    posted = true; lset(NAMEKEY, n); boards[k] = "wait"; lbRender();
    var u = LB + "/score?b=" + k + "&id=" + pid() + "&n=" + encodeURIComponent(n) + "&s=" + Math.round(S.score) + "&r=" + Math.max(1, S.level);
    fetch(u, { method: "POST", cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) { lbGot(k, j); track("world-score"); }).catch(function () { lbGot(k, null); });
  }
  function lbOver() {
    posted = false; var box = $("od-lb");
    if (!ODLB) { box.hidden = true; return; }
    box.hidden = false;
    var k = lbFor(), rows = boards[k];
    var q = S.mode !== "practice" && S.score > 0 && (!Array.isArray(rows) || rows.length < 10 || S.score > rows[rows.length - 1].s);
    $("od-lbform").hidden = !q;
    $("od-lblabel").textContent = S.mode === "daily" ? "Top 10 today! Your name" : "World top 10! Your name";
    $("od-lbname").value = lget(NAMEKEY) || lget("mw-basil-name") || "";
    if (rows == null || rows === "err") lbFetch(k);
    lbRender();
  }
  function lbRender() {
    var k = lbFor(), rows = boards[k], el = $("od-lbl"), note = $("od-lbnote");
    $("od-lbh").textContent = k === "odaily" ? "Today’s daily · top 10" : "World top 10";
    note.textContent = "";
    if (rows == null || rows === "wait") { el.innerHTML = '<li class="none">Loading…</li>'; return; }
    if (rows === "err") { el.innerHTML = '<li class="none">The leaderboard is on a break. Try again later.</li>'; return; }
    if (!rows.length) { el.innerHTML = '<li class="none">No scores yet. Be the first.</li>'; return; }
    var mine = -1;
    el.innerHTML = rows.map(function (r, i) { if (r.me && mine < 0) mine = i; return '<li' + (r.me ? ' class="me"' : "") + '><span class="rk">' + (i + 1) + '</span><span class="sc">' + esc(r.n) + '</span><span class="dt">' + fmt(r.s) + " · Lv " + (r.r || 1) + "</span></li>"; }).join("");
    note.textContent = mine >= 0 ? "You’re #" + (mine + 1) + (k === "odaily" ? " today." : " in the world.") : k === "odaily" ? "Sydney time. Names are public." : "Names are public.";
  }
  $("od-lbform").addEventListener("submit", function (e) {
    e.preventDefault(); var n = String($("od-lbname").value || "").replace(/[^A-Za-z0-9 '\-\.]/g, "").replace(/\s+/g, " ").trim().slice(0, 14) || (normie() ? "Anonymous stacker" : "Anonymous surgeon");
    $("od-lbform").hidden = true; lbPost(n); $("od-again").focus({ preventScroll: true });
  });
  $("od-share").onclick = function () {
    var t = $("od-sharetx").textContent, b = this;
    try { if (navigator.share) { navigator.share({ text: t }).catch(function () {}); track("share"); return; } } catch (e) {}
    try { navigator.clipboard.writeText(t).then(function () { b.textContent = "Copied"; }, function () { b.textContent = "Copy the text above"; }); } catch (e) { b.textContent = "Copy the text above"; }
    track("share");
  };

  // ---------- sound + vibration (never touches the game's RNG) ----------
  var muted = lget(MUTEKEY) === 1, AC = null, gestured = false, sfxLog = [];
  function audio() {
    if (muted || !gestured) return null;
    if (!AC) { try { var A = window.AudioContext || window.webkitAudioContext; if (!A) return null; AC = new A(); } catch (e) { return null; } }
    try { if (AC.state === "suspended") AC.resume(); } catch (e) {}
    return AC;
  }
  function unlock() { if (gestured) return; gestured = true; audio(); }
  document.addEventListener("pointerdown", unlock, true); document.addEventListener("keydown", unlock, true);
  function tone(a, f, t0, dur, o) {
    o = o || {};
    var osc = a.createOscillator(), g = a.createGain(), v = o.vol || 0.12, hold = o.hold || 0;
    osc.type = o.type || "sine"; osc.frequency.setValueAtTime(f, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + 0.008);
    if (hold) g.gain.setValueAtTime(v, t0 + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(a.destination); osc.start(t0); osc.stop(t0 + dur + 0.02);
  }
  function sfx(kind, n, perfect, combo) {
    if (muted) return;
    var a = audio(); if (!a) return;
    if (DEBUG) sfxLog.push(kind + (n ? n : ""));
    try {
      var t = a.currentTime + 0.01, N = normie();
      if (kind === "lock") {
        if (N) tone(a, 330, t, 0.07, { type: "triangle", vol: 0.05 });
        else { tone(a, 95, t, 0.11, { to: 50, vol: 0.32 }); tone(a, 80, t + 0.15, 0.1, { to: 45, vol: 0.22 }); } // lub-dub
      } else if (kind === "clear") {
        var f = [0, 880, 988, 1175, 1319][n] || 880;
        if (N) { tone(a, f * 0.6, t, 0.16, { type: "triangle", vol: 0.1 }); tone(a, f * 0.75, t + 0.09, 0.2, { type: "triangle", vol: 0.09 }); }
        else { tone(a, f, t, 0.13, { vol: 0.1 }); if (n === 4) tone(a, f, t + 0.17, 0.13, { vol: 0.1 }); } // monitor beep, higher for more lines
        if (perfect) tone(a, f * 1.5, t + 0.2, 0.22, { type: "triangle", vol: 0.08 });
        if (combo > 1) tone(a, Math.min(1760, 660 + combo * 90), t + 0.12, 0.1, { type: "triangle", vol: 0.06 });
      } else if (kind === "over") {
        if (N) [523, 440, 349].forEach(function (fr, i) { tone(a, fr, t + i * 0.16, 0.22, { type: "triangle", vol: 0.09 }); });
        else tone(a, 880, t, 1.4, { vol: 0.08, hold: 1.0 }); // flatline
      }
    } catch (e) {}
  }
  function buzz(p) { if (muted) return; try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }
  function muteUI() {
    var b = $("od-mute"); if (!b) return;
    b.textContent = muted ? "🔇" : "🔊";
    b.setAttribute("aria-label", muted ? "Sound off. Turn sound on" : "Sound on. Mute");
    b.setAttribute("aria-pressed", muted ? "true" : "false");
  }
  $("od-mute").onclick = function () { muted = !muted; lset(MUTEKEY, muted ? 1 : 0); gestured = true; muteUI(); if (!muted) audio(); this.blur(); };
  muteUI();

  // ---------- input: keyboard ----------
  function act(k) {
    if (!running || paused || !S || S.over) return;
    if (k === "left") move(-1); else if (k === "right") move(1); else if (k === "down") softStep();
    else if (k === "rot") rotate(1); else if (k === "ccw") rotate(-1); else if (k === "hard") hardDrop(); else if (k === "hold") hold();
    hud();
  }
  var KEYMAP = { ArrowLeft: "left", ArrowRight: "right", ArrowDown: "down", ArrowUp: "rot", x: "rot", X: "rot", z: "ccw", Z: "ccw", " ": "hard", c: "hold", C: "hold", Shift: "hold" };
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!$("od-help").hidden) { if (e.key === "Escape") { e.preventDefault(); helpClose(); } return; }
    if (!running) return;
    if (S && S.over) { if ((e.key === " " || e.key === "Enter") && performance.now() - S.overT > 700 && !/^(INPUT|A)$/.test((document.activeElement || {}).tagName || "") && !((document.activeElement || {}).tagName === "BUTTON" && document.activeElement.id !== "od-again")) { e.preventDefault(); start(); } return; }
    if (e.key === "p" || e.key === "P" || e.key === "Escape") { e.preventDefault(); togglePause(); return; }
    var k = KEYMAP[e.key]; if (!k) return;
    e.preventDefault();
    if (paused) return;
    if (k === "left" || k === "right" || k === "down") { if (e.repeat) return; held[k] = performance.now(); act(k); if (k === "down") softT = 0; return; }
    if (e.repeat) return;
    act(k);
  });
  document.addEventListener("keyup", function (e) { var k = KEYMAP[e.key]; if (k === "left" || k === "right" || k === "down") held[k] = 0; });
  window.addEventListener("blur", function () { held.left = held.right = held.down = 0; });

  // ---------- input: on-screen buttons ----------
  Array.prototype.forEach.call(document.querySelectorAll("#od-ctrl button"), function (b) {
    var k = b.getAttribute("data-k");
    function down(e) { e.preventDefault(); b.classList.add("on"); if (k === "left" || k === "right" || k === "down") { held[k] = performance.now(); softT = 0; } act(k); try { b.setPointerCapture(e.pointerId); } catch (x) {} }
    function up() { b.classList.remove("on"); if (held[k] !== undefined) held[k] = 0; }
    b.addEventListener("pointerdown", down);
    b.addEventListener("pointerup", up); b.addEventListener("pointercancel", up); b.addEventListener("lostpointercapture", up);
    b.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    b.addEventListener("click", function (e) { if (e.detail === 0) act(k); }); // keyboard activation of a focused button
  });

  // ---------- input: swipe on the board ----------
  var sw = null;
  cv.addEventListener("pointerdown", function (e) {
    if (!running || paused || !S || S.over) return;
    e.preventDefault(); sw = { x: e.clientX, y: e.clientY, t: performance.now(), mx: 0, my: 0, moved: false, id: e.pointerId };
    try { cv.setPointerCapture(e.pointerId); } catch (x) {}
  });
  cv.addEventListener("pointermove", function (e) {
    if (!sw || e.pointerId !== sw.id) return;
    var dx = e.clientX - sw.x, dy = e.clientY - sw.y, step = C * 0.9;
    var tx = Math.trunc(dx / step); while (sw.mx < tx) { act("right"); sw.mx++; sw.moved = true; } while (sw.mx > tx) { act("left"); sw.mx--; sw.moved = true; }
    var ty = Math.max(0, Math.trunc(dy / step)); while (sw.my < ty) { act("down"); sw.my++; sw.moved = true; }
  });
  cv.addEventListener("pointerup", function (e) {
    if (!sw || e.pointerId !== sw.id) return;
    var dx = e.clientX - sw.x, dy = e.clientY - sw.y, dt = performance.now() - sw.t;
    if (!sw.moved && Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 350) act("rot");
    else if (dy > C * 2 && dy > Math.abs(dx) * 1.5 && dy / Math.max(dt, 1) > 0.9) act("hard");
    sw = null;
  });
  cv.addEventListener("pointercancel", function () { sw = null; });

  // ---------- buttons, help, pause ----------
  $("od-start").onclick = function () { start("endless"); }; $("od-daily").onclick = function () { start("daily"); }; $("od-again").onclick = function () { start(); };
  $("od-exit").onclick = exitToStart; $("od-pexit").onclick = exitToStart;
  $("od-pause").onclick = function () { togglePause(); };
  $("od-resume").onclick = function () { togglePause(false); };
  var helpPaused = false;
  function helpOpen() { helpPaused = running && S && !S.over && !paused; if (helpPaused) togglePause(true); $("od-paused").hidden = true; $("od-help").hidden = false; $("od-hgo").focus(); track("help"); }
  function helpClose() { $("od-help").hidden = true; if (helpPaused) togglePause(false); else if (paused) $("od-paused").hidden = false; helpPaused = false; }
  $("od-helpbtn").onclick = helpOpen; $("od-hx").onclick = helpClose; $("od-hgo").onclick = helpClose;
  $("od-help").addEventListener("click", function (e) { if (e.target === $("od-help")) helpClose(); });
  document.addEventListener("visibilitychange", function () { if (document.hidden && running && S && !S.over && !paused) togglePause(true); });

  // ---------- How it works: piece pictures ----------
  function guide(id) {
    var box = $(id); if (!box) return;
    box.innerHTML = TYPES.map(function (t) { return '<div class="od-gt"><canvas data-t="' + t + '" width="120" height="92"></canvas><span>' + P[t].organ + "</span><em>" + t + " piece</em></div>"; }).join("");
    Array.prototype.forEach.call(box.querySelectorAll("canvas"), function (c) {
      var t = c.getAttribute("data-t"), x = c.getContext("2d"), b = bbox(t), s = Math.min(16, Math.floor(58 / b.w)), save = dpr;
      dpr = 2; x.setTransform(2, 0, 0, 2, 0, 0); drawMini(x, t, 30, 23, s); dpr = save;
    });
  }
  guide("od-guide"); guide("od-guide2");
  // Normie mode: swap the page's medical wording for everyday wording
  if (normie()) {
    var nq = function (sel, t) { var el = document.querySelector(sel); if (el) el.textContent = t; };
    nq(".od-lede", "Organs are falling. Stack them neatly and fill whole rows to clear them. It gets faster every level, and every level brings a new animal organ fact.");
    nq("#od-start", "Play");
    nq("#od-otitle", "Game over");
    nq(".od-hush", "No organs were harmed. They’re only shapes.");
    nq("#od-paused .od-omsg", "Paused. The organs will wait.");
    Array.prototype.forEach.call(document.querySelectorAll(".od-rules li, .od-hp li"), function (li) {
      li.innerHTML = li.innerHTML.replace("is a <b>transplant</b>, worth the most", "is the <b>big one</b>, worth the most").replace("= <b>transplant</b>", "= <b>the big one</b>");
    });
    Array.prototype.forEach.call(document.querySelectorAll(".od-rsound"), function (li) { li.innerHTML = "<b>Sound:</b> soft blips and chimes (and a buzz on phones). Tap 🔊 in the game bar to mute."; });
    Array.prototype.forEach.call(document.querySelectorAll(".od-rcombo"), function (li) {
      li.innerHTML = "<b>Combos:</b> clear rows on back-to-back drops for a <b>combo</b> bonus. A cleared row that’s all one organ is a <b>perfect match</b>: triple points.";
    });
  }
  renderBest(); lbProbe();

  if (DEBUG) {
    window.OD_DEBUG = {
      state: function () { return S; },
      start: start,
      seq: function () { return S ? S.seq.slice() : []; }, // every piece dealt so far, in order (queue included)
      peek: function (n) { while (S.seq.length < n) S.queue.push(bagNext()); return S.seq.slice(0, n); }, // deal ahead into the queue
      mode: function () { return MODE; },
      day: sydDay,
      lb: function () { return { on: ODLB, boards: boards }; },
      end: function () { if (S && !S.over) gameOver(); },
      // rows: array of strings for the bottom of the board, "#" = filled, "." = empty (e.g. "######....")
      // a piece letter (I J L O S T Z) fills that cell with that organ instead
      setBottom: function (rows) { rows.forEach(function (s, i) { var r = ROWS - rows.length + i; for (var x = 0; x < COLS; x++) S.board[r][x] = s[x] === "#" ? 5 : P[s[x]] ? P[s[x]].idx : 0; }); },
      sfx: function () { return sfxLog.slice(); },
      muted: function () { return muted; },
      share: function () { return $("od-sharetx").textContent; },
      setNext: function (types) { S.queue = types.concat(S.queue).slice(0, Math.max(3, types.length)); },
      respawn: function (t) { spawn(t); },
      setLines: function (n) { S.lines = n; S.level = 1 + Math.floor(n / 10); hud(); }
    };
  }
})();
