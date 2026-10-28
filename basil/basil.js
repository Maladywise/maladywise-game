/* Basil Kicks: bonus Malady Wise arcade game. Basil (smug, fluffy, white) kicks everything off the kitchen bench.
   Tap a bench spot (or keys 1/2/3) to kick what's there before he gets bored. Clover (tortoiseshell sister) wanders past:
   swiping her scores a bonus and makes her cross; swipe her while she's cross and she swipes back (lose a life); leave a cross
   Clover alone and she kicks one of Basil's things herself (no points). Spiky things (cactus, pincushion, rose): never kick, they cost
   a life; leave them and they vanish. The tap = sink time (clears the bench, double points). The fish = an extra life.
   Every 60 points (then every 75): Clover's turn, a 10-second bonus round where Clover kicks, double points, no lives lost.
   Best score is kept in this browser only. */
(function () {
  "use strict";
  var BEST = "mw-basil-best2", SBASE = new URL(".", document.currentScript.src).href;
  function lget(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function lset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function track(n) { try { if (window.MW_track) MW_track(n); else if (window.goatcounter && goatcounter.count) goatcounter.count({ path: n, title: n, event: true }); } catch (e) {} }
  function $(id) { return document.getElementById(id); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function quiet() { var r = document.documentElement.getAttribute("data-motion") === "reduce"; try { r = r || matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {} return r; }

  var W = 360, H = 430, BENCH = 318, LANES = [72, 180, 288];
  var cv = $("bk-canvas"), ctx = cv.getContext("2d"), dpr = 1;
  function size() {
    // fit the whole game (score bar + bench) in the window: width limited by the screen height
    var g = $("bk-game"); g.style.maxWidth = "";
    var full = g.clientWidth || 360, avail = window.innerHeight - 150, w = Math.max(260, Math.min(full, avail * W / H));
    g.style.maxWidth = w + "px"; w = cv.parentNode.clientWidth || w; dpr = Math.min(3, window.devicePixelRatio || 1);
    cv.style.height = (w * H / W) + "px"; cv.width = Math.round(w * dpr); cv.height = Math.round(w * H / W * dpr);
    ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
  }

  // ---------- copy ----------
  var KICKQ = ["Gravity check: passed.", "It was in his way. Everything is.", "Smug level: rising.", "He regrets nothing.", "Another one for the floor.", "Physics, but rude.", "He looked you in the eye first.", "That was a gift. To the floor.", "Bench, decluttered.", "Peak cat behaviour.", "He calls it tidying.", "No witnesses. Except you."];
  var BOREDQ = ["He got bored. Unwell?", "He left one. Concerning.", "Missed a kick. He blames you.", "Basil is disappointed in you.", "One survived. Basil will remember."];
  var CNICK = ["Cute Clover", "the Whingapotamus", "the Chief Complaints Officer", "Wiggle Butt", "the Spicy Little Muffin", "Miss Piggy", "Clover Piggington"];
  var FOOD = ["catfood", "banana", "steak", "drumstick", "sausage", "pizza"], BADFOOD = ["pineapple", "coffee", "grapes", "garlic"];
  var BADQ = { pineapple: "Pineapple. Too pointy, even for Miss Piggy.", coffee: "Coffee: caffeine is toxic to cats. Spat out.", grapes: "Grapes: not safe for cats. Spat out.", garlic: "Garlic: toxic to cats. Hard no." };
  var HUNGRYQ = ["Clover is hungry. Unacceptable.", "Food left uneaten. Miss Piggy is appalled.", "Clover Piggington demands a refund.", "Hungry. The Whingapotamus whinges.", "A snack escaped. Clover will never forgive you."];
  var NOMQ = ["Nom.", "Gone.", "Inhaled.", "Hoovered.", "Snarfed.", "Chomp."];
  function isBad(k) { return BADFOOD.indexOf(k) >= 0; }
  var CLOVQ = ["Clover: 'Rude.'", "The Chief Complaints Officer has lodged a complaint.", "The Whingapotamus whinges.", "Sibling rivalry: active.", "Wiggle Butt glares. Basil smirks.", "Cute Clover is no longer cute about it."];
  var CLOVBACK = ["Clover swiped back. Fair.", "The Spicy Little Muffin had enough. Justice served.", "Tortoiseshell revenge.", "Complaint upheld. Basil swiped."];
  var CSWIPE = ["Swiped.", "Swiped!", "Swish.", "Claws out.", "Swiped. Daintily."];
  var CLOVSTEAL = ["Clover swiped it herself. Revenge.", "Wiggle Butt stole the swipe. Petty. Effective.", "Clover: 'Mine now.'"];
  var OUCHQ = ["Ouch. That one was spiky.", "Basil has learned nothing.", "Cactus: 1, Basil: 0.", "Paw, meet prickles.", "Some things you don't kick."];
  var SPIKY = ["cactus", "pins", "rose", "pineapple"];
  var HEAVY = { vase: { hp: [3, 5], pts: 5, life: 5.5 }, tv: { hp: [8, 10], pts: 12, life: 8 }, tank: { hp: [25, 25], pts: 50, life: 16 } };
  var SMASHQ = { vase: ["Vase: shattered. Basil: unbothered.", "That was an heirloom. Was.", "Crash. He doesn’t even flinch."], tv: ["TV smashed. Screen time: over.", "No more nature documentaries.", "The TV has been cancelled."], tank: ["THE FISH TANK. Free sushi. +1 life.", "Aquarium destroyed. Goldfish rescued (eaten). +1 life."] };
  var MOTHQ = ["Moth eaten. FRENZY!", "Snack acquired. FRENZY!", "Crunchy. FRENZY!", "Protein. FRENZY!"];
  var ROUND = 30; // seconds per round, alternating Basil (odd rounds) and Clover (even rounds)
  function U() { return 10 * S.round; } // base points per item: 10 in round 1, 20 in round 2, and so on
  function addPts(n) { S.score = Math.max(0, S.score + n); if (S.bonus > 0) S.cPts = Math.max(0, S.cPts + n); else S.bPts = Math.max(0, S.bPts + n); }
  function fmt(n) { return Math.round(n).toLocaleString("en-AU"); }
  var CNAMES = [[0, "Cute Clover"], [1000, "Wiggle Butt"], [3000, "The Whingapotamus"], [7500, "Chief Complaints Officer"], [15000, "Spicy Little Muffin"], [30000, "Miss Piggy"], [60000, "Clover Piggington"], [100000, "Queen Piggington"]];
  var NAMES = [[0, "Fluffy white rat"], [1000, "Basil Brown Pants"], [5000, "Fat Basil"], [15000, "Fat white seal"], [40000, "Basil Bad Cat"], [100000, "Albino Satan"]];
  var ITEMS = ["mug", "pen", "phone", "sock", "pills", "steth", "plant", "remote", "glass", "tube", "keys", "thermo"];

  // ---------- state ----------
  var S, raf = 0, last = 0, paused = false, running = false;
  function reset() {
    S = { t: 0, bPts: 0, cPts: 0, round: 1, roundT: ROUND, ann: { t: 1.8, a: "ROUND 1", b: "KICK!" }, score: 0, hb: 100, hc: 100, sneak: null, sneakT: 4, lives: 3, combo: 0, lastKick: -9, spawnT: 0.8, lanes: [null, null, null], fly: [], fx: [], clover: null, cloverT: rnd(7, 11), swiped: 0, cross: false, bonus: 0, nextBonus: 60, ouchT: 0, scratchT: 0, ouches: 0, bonuses: 0, kicks: 0, dirt: 0, wet: 0, dripT: 0, slash: [], gulp: [], flops: [], eatenFood: 0, shards: [], moth: null, mothT: rnd(9, 14), frenzyT: 0, eaten: 0, smashed: 0,
      sinkT: 0, paw: null, lean: 0, blink: 0, over: false, drops: [], specialT: rnd(14, 20) };
  }
  // Continuous: keeps speeding up forever, easing towards a limit (about 0.9s at 1 min, 0.6s at 3 min, 0.4s at 10 min).
  function spawnEvery() { return (0.3 + 1.15 / (1 + S.t / 60)) * (S.bonus > 0 ? 0.8 : 1); }
  function isSpiky(k) { return SPIKY.indexOf(k) >= 0; }
  function patience() { return 1.0 + 2.4 / (1 + S.t / 70); }

  function spawn(kind) {
    var free = [0, 1, 2].filter(function (i) { return !S.lanes[i] && !(S.clover && S.clover.lane === i && S.clover.state === "sit"); });
    if (!free.length) return false;
    if (!kind && S.bonus > 0) kind = Math.random() < 0.22 ? pick(BADFOOD) : pick(FOOD);
    if (!kind && S.t > 6 && Math.random() < Math.min(0.24, 0.1 + S.t * 0.0015)) kind = pick(SPIKY);
    if (!kind && S.t > 40 && !S.lanes.some(function (l) { return l && l.kind === "tank"; }) && Math.random() < 0.015) kind = "tank";
    if (!kind && S.t > 25 && Math.random() < 0.05) kind = "tv";
    if (!kind && S.t > 10 && Math.random() < 0.09) kind = "vase";
    var i = pick(free), hv = HEAVY[kind], p = kind === "tap" || kind === "fish" ? 2.6 : isSpiky(kind) || isBad(kind) ? 2.3 : hv ? hv.life : S.bonus > 0 ? 2.6 : patience();
    S.lanes[i] = { kind: kind || pick(ITEMS), y: -40, vy: 0, landed: false, life: p, max: p, wob: rnd(0, 6) };
    if (hv) { S.lanes[i].hp = S.lanes[i].hpMax = Math.round(rnd(hv.hp[0], hv.hp[1])); S.lanes[i].hit = 0; }
    return true;
  }

  // ---------- input ----------
  function kick(i) {
    if (!running || paused || S.over) return;
    S.paw = { lane: i, t: 0 }; S.lean = (i - 1) * 0.12;
    var it = S.lanes[i];
    if (S.clover && S.clover.lane === i && S.clover.state === "sit" && !it) return swipeClover();
    if (!it || !it.landed) return;
    if (it.hp) {
      S.combo = S.t - S.lastKick < 1.05 ? S.combo + 1 : 0; S.lastKick = S.t;
      it.hp -= S.frenzyT > 0 ? 2 : 1; it.hit = 0.18; it.wob = rnd(0, 6); S.kicks++;
      if (it.hp > 0) return;
      S.lanes[i] = null; S.smashed++; shake(); S.dirt = Math.min(1, S.dirt + (it.kind === "tank" ? 0.15 : 0.05)); if (it.kind === "tank") S.wet = Math.min(1, S.wet + 0.7);
      var m0 = Math.min(4, 1 + Math.floor(S.combo / 3)) * (S.sinkT > 0 ? 2 : 1) * (S.frenzyT > 0 ? 2 : 1), pts = HEAVY[it.kind].pts * m0 * U();
      addPts(pts); float(LANES[i], BENCH - 80, "SMASH +" + fmt(pts), "#C2553A"); toast(pick(SMASHQ[it.kind]));
      if (it.kind === "tank") { heal("b", 40); for (var fq = 0; fq < 3; fq++) S.flops.push({ x: LANES[i] + rnd(-30, 30), y: BENCH - 30, vx: rnd(-90, 90), vy: -rnd(200, 320), r: 0, l: 2.2 }); float(LANES[i], BENCH - 110, "+40% health", "#E05A8A"); for (var w = 0; w < 50; w++) S.drops.push({ x: LANES[i] + rnd(-30, 30), y: BENCH - 40, vx: rnd(-220, 220), vy: -rnd(100, 380), l: rnd(.7, 1.4) }); }
      for (var q = 0; q < 26; q++) S.shards.push({ x: LANES[i] + rnd(-14, 14), y: BENCH - rnd(10, 50), vx: rnd(-260, 260), vy: -rnd(120, 420), r: rnd(0, 6), vr: rnd(-12, 12), s: rnd(3, 8), c: it.kind === "tv" ? pick(["#2B2340", "#6FA8C9", "#3B3B44", "#AEB8C0"]) : pick(["#2F5DA8", "#F1ECF8", "#6FA8C9", "#E0703A"]), l: 1.4 });
      return;
    }
    S.lanes[i] = null;
    if (S.bonus > 0 && (FOOD.indexOf(it.kind) >= 0 || isBad(it.kind))) return eatFood(it, i);
    var dir = i === 0 ? -1 : i === 2 ? 1 : (Math.random() < .5 ? -1 : 1);
    S.fly.push(S.bonus > 0 ? { kind: it.kind, x: LANES[i], y: BENCH - 2, vx: dir * rnd(300, 380), vy: -rnd(90, 140), r: 0, vr: dir * rnd(3, 6) } : { kind: it.kind, x: LANES[i], y: BENCH - 2, vx: dir * rnd(110, 210), vy: -rnd(240, 320), r: 0, vr: dir * rnd(6, 11) });
    if (isSpiky(it.kind)) {
      S.combo = 0; S.ouchT = 0.7; S.ouches++; float(LANES[i], BENCH - 60, "Ouch!", "#C2553A"); toast(pick(OUCHQ)); shake();
      hurt("b", 20);
      return;
    }
    if (it.kind === "tap") { sinkTime(); return; }
    if (it.kind === "fish") { heal(S.bonus > 0 ? "c" : "b", 25); float(LANES[i], BENCH - 60, "+25% health", "#E05A8A"); toast("Fish acquired. Briefly nice."); return; }
    if (S.bonus > 0) { S.slash.push({ x: LANES[i], y: BENCH - 22, l: 0.35 }); }
    S.combo = S.t - S.lastKick < 1.05 ? S.combo + 1 : 0; S.lastKick = S.t;
    var mult = Math.min(4, 1 + Math.floor(S.combo / 3)) * (S.sinkT > 0 ? 2 : 1) * (S.frenzyT > 0 ? 2 : 1) * U();
    if (S.bonus <= 0) { S.dirt = Math.min(1, S.dirt + 0.008); if (it.kind === "glass") S.wet = Math.min(1, S.wet + 0.15); }
    S.kicks++; addPts(mult); float(LANES[i], BENCH - 60, "+" + fmt(mult) + (S.bonus > 0 ? " " + pick(CSWIPE) : ""), S.bonus > 0 ? "#B07A0C" : mult > 1 ? "#B5308A" : "#2B5E80");
    if (S.score % 9 === 0 && S.bonus <= 0) toast(pick(KICKQ));
  }
  function eatFood(it, i) {
    if (isBad(it.kind)) {
      S.combo = 0; S.ouchT = 0.7; S.ouches++; S.fly.push({ kind: it.kind, x: LANES[i], y: BENCH - 2, vx: (i - 1 || 1) * rnd(160, 240), vy: -rnd(220, 300), r: 0, vr: rnd(-9, 9) });
      float(LANES[i], BENCH - 60, it.kind === "pineapple" ? "Ouch!" : "Bleurgh!", "#C2553A"); toast(BADQ[it.kind]); shake();
      hurt("c", 20); return;
    }
    S.gulp.push({ kind: it.kind, x: LANES[i], y: BENCH, t: 0 });
    S.combo = S.t - S.lastKick < 1.05 ? S.combo + 1 : 0; S.lastKick = S.t;
    var mult = Math.min(4, 1 + Math.floor(S.combo / 3)) * (S.frenzyT > 0 ? 2 : 1) * U();
    addPts(mult); S.eatenFood++; float(LANES[i], BENCH - 60, "+" + fmt(mult) + " " + pick(NOMQ), "#B07A0C");
  }
  // health: Basil and Clover each have a bar (0-100). Only the cat on the bench takes damage; the resting one recovers.
  function hurt(who, amt) {
    if (who === "b") S.hb = Math.max(0, S.hb - amt); else S.hc = Math.max(0, S.hc - amt);
    S.fx.push({ x: who === "b" ? 40 : W - 40, y: 70, txt: "-" + amt + "%", col: "#C2553A", l: 1 });
    if ((who === "b" ? S.hb : S.hc) <= 0) { end(); return true; }
    return false;
  }
  function heal(who, amt) { if (who === "b") S.hb = Math.min(100, S.hb + amt); else S.hc = Math.min(100, S.hc + amt); S.fx.push({ x: who === "b" ? 40 : W - 40, y: 70, txt: "+" + amt + "%", col: "#2E7D6B", l: 1 }); }
  function shoo() {
    var b = S.sneak; if (!b || b.phase !== "creep") return false;
    b.phase = "flee"; addPts(2 * U()); S.fx.push({ x: b.x, y: BENCH - 70, txt: "Shoo! +" + fmt(2 * U()), col: "#2B5E80", l: 1 }); toast("Basil shooed back to the sink. He’ll be back.");
    return true;
  }
  function startBonus() {
    S.round++; S.bonus = ROUND; S.bonuses++; S.ann = { t: 1.8, a: "ROUND " + S.round, b: "NOM!" }; S.spawnT = 1.6; S.clover = null; S.cloverT = rnd(12, 16);
    for (var j = 0; j < 3; j++) { var o = S.lanes[j]; if (o && o.kind !== "tank") { S.lanes[j] = null; S.fly.push({ kind: o.kind, x: LANES[j], y: BENCH - 2, vx: (j - 1 || 1) * rnd(200, 300), vy: -rnd(160, 240), r: 0, vr: rnd(-8, 8) }); } }
    if (!S.moth) S.mothT = Math.min(S.mothT, rnd(1.5, 3.5));
    toast("Clover’s turn! " + pick(CNICK).replace(/^the /, "The ").replace(/^./, function (c) { return c.toUpperCase(); }) + " eats everything."); track("basil/bonus");
  }
  function swipeClover() {
    var c = S.clover; c.state = "flee"; c.hit = 1; S.swiped++;
    if (c.cross) { S.cross = false; S.scratchT = 0.8; float(LANES[c.lane], BENCH - 90, "Clover swipes back!", "#C2553A"); toast(pick(CLOVBACK)); shake(); hurt("b", 20); }
    else { S.cross = true; addPts(3 * U()); float(LANES[c.lane], BENCH - 90, "+" + fmt(3 * U()) + " sister swipe", "#B07A0C"); toast(pick(CLOVQ) + " She’ll be cross next time."); }
  }
  function cloverSteals(c) {
    S.cross = false;
    var ls = [c.lane - 1, c.lane + 1, c.lane].filter(function (j) { var it = S.lanes[j]; return j >= 0 && j < 3 && it && it.landed && it.kind !== "tank" && !isSpiky(it.kind) && it.kind !== "tap" && it.kind !== "fish"; });
    if (!ls.length) { toast("Clover calmed down. For now."); return; }
    var j = ls[0], it = S.lanes[j]; S.lanes[j] = null; S.combo = 0;
    S.fly.push({ kind: it.kind, x: LANES[j], y: BENCH - 2, vx: (j - c.lane || 1) * rnd(140, 220), vy: -rnd(240, 300), r: 0, vr: rnd(-9, 9) });
    float(LANES[j], BENCH - 70, "Stolen!", "#B07A0C"); toast(pick(CLOVSTEAL));
  }
  function sinkTime() {
    S.sinkT = 5; var wasDirty = S.dirt > 0.3; S.dirt *= 0.5; S.wet = Math.min(1, S.wet + 0.6); toast(wasDirty ? "Sink time! Basil had a bath. Sort of. Now he’s dirty AND wet. Double points." : "Sink time! Splash everything. Double points.");
    for (var i = 0; i < 3; i++) { var it = S.lanes[i]; if (it && it.kind !== "tap" && it.kind !== "fish") { S.lanes[i] = null; addPts(2 * U()); S.fly.push({ kind: it.kind, x: LANES[i], y: BENCH - 2, vx: (i - 1 || 1) * rnd(120, 200), vy: -rnd(260, 340), r: 0, vr: rnd(-10, 10) }); } }
    for (var k = 0; k < 40; k++) S.drops.push({ x: 180 + rnd(-40, 40), y: 210, vx: rnd(-180, 180), vy: -rnd(120, 360), l: rnd(.6, 1.2) });
  }
  var shakeT = 0; function shake() { if (!quiet()) shakeT = 0.3; }
  function float(x, y, txt, col) { S.fx.push({ x: x, y: y, txt: txt, col: col, l: 1 }); }
  var toastT = 0; function toast(m) { var el = $("bk-toast"); el.textContent = m; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { el.hidden = true; }, 1700); }

  function laneAt(ev) { var r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * W; return x < 126 ? 0 : x < 234 ? 1 : 2; }
  function eatMoth() {
    var m = S.moth; if (!m || m.eaten) return false;
    if (m.kind === "wasp") { m.eaten = 0.4; S.ouchT = 0.7; S.ouches++; float(m.x, m.y - 10, "Stung!", "#C2553A"); toast(pick(["Wasp. Bad idea. Very bad idea.", "Stung on the nose. Dignity: gone.", "That was not a moth.", "Wasps bite back. Well, sting."])); shake(); hurt(S.bonus > 0 ? "c" : "b", 20); return true; }
    m.eaten = 0.4; S.eaten++; S.frenzyT = 6; addPts(2 * U()); float(m.x, m.y - 10, "Nom! +" + fmt(2 * U()), "#B5308A"); toast(pick(MOTHQ)); track("basil/moth");
    return true;
  }
  cv.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    if (running && !paused && !S.over && S.sneak && S.sneak.phase === "creep") {
      var r0 = cv.getBoundingClientRect(), x0 = (e.clientX - r0.left) / r0.width * W, y0 = (e.clientY - r0.top) / r0.height * H;
      if (Math.abs(x0 - S.sneak.x) < 40 && y0 > BENCH - 90 && y0 < BENCH + 20) { shoo(); return; }
    }
    if (running && !paused && !S.over && S.moth && !S.moth.eaten) {
      var r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
      if (Math.hypot(x - S.moth.x, y - S.moth.y) < 42) { eatMoth(); return; }
    }
    kick(laneAt(e));
  });
  document.addEventListener("keydown", function (e) {
    if (!running) return;
    var k = { "1": 0, "2": 1, "3": 2, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 1, ArrowRight: 2, a: 0, s: 1, d: 2 }[e.key];
    if (k != null) { e.preventDefault(); kick(k); }
    if (/^[4wW]$/.test(e.key) && running && !paused && !S.over) { e.preventDefault(); eatMoth(); }
    if ((/^[fFbB5]$/.test(e.key) || (e.key === " " && !S.over)) && running && !paused && !S.over) { e.preventDefault(); shoo(); }
    if (e.key === " " && S.over) { e.preventDefault(); start(); }
    if (e.key === "p" || e.key === "Escape") togglePause();
  });

  // ---------- loop ----------
  function step(dt) {
    S.t += dt; S.blink -= dt; if (S.blink < -3.2) S.blink = 0.15;
    if (S.sinkT > 0) S.sinkT -= dt;
    if (S.ouchT > 0) S.ouchT -= dt;
    if (S.wet > 0) S.wet = Math.max(0, S.wet - dt * 0.015);
    if (S.frenzyT > 0) { S.frenzyT -= dt; if (S.frenzyT <= 0) { S.frenzyT = 0; toast("Frenzy over. Back to regular evil."); } }
    S.mothT -= dt;
    if (!S.moth && S.mothT <= 0) { var fromL = Math.random() < .5; S.moth = { kind: Math.random() < 0.3 ? "wasp" : Math.random() < .5 ? "moth" : "butterfly", x: fromL ? -20 : W + 20, y: rnd(110, 200), vx: (fromL ? 1 : -1) * rnd(50, 80), ph: rnd(0, 6), life: 9 }; S.mothT = rnd(14, 22); }
    var mo = S.moth;
    if (mo) {
      if (mo.eaten) { mo.eaten -= dt; if (mo.eaten <= 0) S.moth = null; }
      else { mo.life -= dt; mo.x += mo.vx * dt; mo.y += Math.sin(S.t * 4 + mo.ph) * 60 * dt; if ((mo.x < 30 && mo.vx < 0) || (mo.x > W - 30 && mo.vx > 0)) { if (mo.life > 1.5) mo.vx *= -1; } if (mo.life <= 0 || mo.x < -40 || mo.x > W + 40) S.moth = null; }
    }
    S.shards = S.shards.filter(function (q) { q.vy += 900 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.r += q.vr * dt; q.l -= dt; return q.l > 0 && q.y < H + 20; });
    if (S.scratchT > 0) S.scratchT -= dt;
    if (S.bonus > 0) { S.bonus -= dt; if (S.bonus <= 0) { S.bonus = 0; S.sneak = null; S.sneakT = rnd(3, 5); for (var j2 = 0; j2 < 3; j2++) { var o2 = S.lanes[j2]; if (o2 && (FOOD.indexOf(o2.kind) >= 0 || isBad(o2.kind))) S.lanes[j2] = null; } S.round++; S.roundT = ROUND; S.ann = { t: 1.8, a: "ROUND " + S.round, b: "KICK!" }; S.spawnT = 1.6; toast("Basil’s back. He saw everything."); } }
    else { S.roundT -= dt; if (S.roundT <= 0) startBonus(); }
    if (S.ann && S.ann.t > 0) { S.ann.t -= dt; if (S.spawnT < 0.2) S.spawnT = 0.2; }
    if (shakeT > 0) shakeT -= dt;
    if (S.paw) { S.paw.t += dt; if (S.paw.t > 0.22) { S.paw = null; } }
    S.lean *= 0.85;
    S.spawnT -= dt;
    if (S.spawnT <= 0) { spawn(); S.spawnT = spawnEvery() * rnd(0.8, 1.2); }
    S.specialT -= dt;
    if (S.specialT <= 0) { if (spawn(Math.random() < 0.55 ? "tap" : "fish")) S.specialT = rnd(16, 24); else S.specialT = 1; }
    for (var i = 0; i < 3; i++) {
      var it = S.lanes[i]; if (!it) continue;
      if (!it.landed) { it.vy += 1600 * dt; it.y += it.vy * dt; if (it.y >= BENCH) { it.y = BENCH; it.landed = true; } continue; }
      if (it.hit > 0) it.hit -= dt;
      if (S.frenzyT <= 0) it.life -= dt;
      if (it.life <= 0) {
        S.lanes[i] = null;
        if (it.kind === "tap" || it.kind === "fish") continue;
        if (isSpiky(it.kind) || isBad(it.kind)) { S.fx.push({ x: LANES[i], y: BENCH - 40, txt: "poof", col: "#8A7BB0", l: 0.8 }); continue; }
        if (S.bonus > 0) {
          if (FOOD.indexOf(it.kind) < 0) continue;
          S.combo = 0; float(LANES[i], BENCH - 70, "Hungry!", "#B07A0C"); toast(pick(HUNGRYQ)); shake();
          if (hurt("c", 12)) return;
          continue;
        }
        S.combo = 0; float(LANES[i], BENCH - 70, "Bored.", "#6B5A93"); toast(pick(BOREDQ)); shake();
        if (hurt("b", 15)) return;
      }
    }
    // resting: the cat off the bench slowly recovers (Basil in the sink, Clover asleep on her cushion)
    if (S.bonus > 0) { if (!S.sneak) S.hb = Math.min(100, S.hb + 0.4 * dt); }
    else if (!S.clover) S.hc = Math.min(100, S.hc + 0.27 * dt);
    // Clover's round: Basil sneaks up from the sink. Tap him to shoo him; if he gets there he swipes her (-10 points).
    if (S.bonus > 0) {
      var sb = S.sneak;
      if (!sb) { S.sneakT -= dt; if (S.sneakT <= 0) { S.sneak = { x: 60, phase: "creep" }; toast("Basil is sneaking up on Clover. Tap him!"); } }
      else if (sb.phase === "creep") { sb.x += 26 * dt; var tgt = 180 - 46 * (1 + Math.min(1, S.eatenFood / 120)); if (sb.x >= tgt) { sb.phase = "flee"; addPts(-Math.min(S.cPts, 10 * U())); S.slash.push({ x: tgt + 20, y: BENCH - 40, l: 0.4 }); S.fx.push({ x: tgt + 10, y: BENCH - 90, txt: "Swiped! -" + fmt(10 * U()), col: "#C2553A", l: 1.2 }); toast("Basil swiped Clover. Sibling justice. -" + fmt(10 * U()) + " points."); shake(); } }
      else { sb.x -= 160 * dt; if (sb.x <= 52) { S.sneak = null; S.sneakT = rnd(3, 6); } }
    } else S.sneak = null;
    // Clover
    S.cloverT -= dt;
    if (!S.clover && S.cloverT <= 0 && S.bonus <= 0) {
      var free = [0, 1, 2].filter(function (j) { return !S.lanes[j]; });
      if (free.length) { var ln = pick(free); S.clover = { lane: ln, x: ln < 1 ? -60 : W + 60, dir: ln < 1 ? 1 : -1, state: "walk", sit: rnd(1.6, 2.4), cross: S.cross }; if (ln === 1) { S.clover.x = -60; S.clover.dir = 1; } }
      S.cloverT = rnd(9, 15);
    }
    var c = S.clover;
    if (c) {
      if (c.state === "walk") { c.x += c.dir * 260 * dt; if ((c.dir > 0 && c.x >= LANES[c.lane]) || (c.dir < 0 && c.x <= LANES[c.lane])) { c.x = LANES[c.lane]; c.state = "sit"; } }
      else if (c.state === "sit") { c.sit -= dt; if (c.sit <= 0) { c.state = "leave"; if (c.cross) cloverSteals(c); } }
      else { c.x += (c.hit ? (c.x < 180 ? -1 : 1) * 520 : c.dir * 260) * dt; if (c.x < -80 || c.x > W + 80) S.clover = null; }
    }
    S.fly = S.fly.filter(function (f) { f.vy += 900 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.r += f.vr * dt; return f.y < H + 60; });
    S.gulp = S.gulp.filter(function (g) { g.t += dt; return g.t < 0.32; });
    S.flops = S.flops.filter(function (f) { f.vy += 1100 * dt; f.x += f.vx * dt; f.y += f.vy * dt; if (f.y > BENCH - 6) { f.y = BENCH - 6; f.vy = -rnd(160, 260); f.vx = rnd(-90, 90); } f.r = Math.sin(S.t * 22 + f.x) * 0.6; f.l -= dt; return f.l > 0 && f.x > -30 && f.x < W + 30; });
    S.slash = S.slash.filter(function (k) { k.l -= dt; return k.l > 0; });
    S.fx = S.fx.filter(function (f) { f.l -= dt * 0.9; f.y -= 40 * dt; return f.l > 0; });
    S.drops = S.drops.filter(function (d) { d.vy += 700 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.l -= dt; return d.l > 0; });
    hud();
  }
  function frame(ts) {
    if (!running) return;
    var dt = Math.min(0.05, (ts - (last || ts)) / 1000); last = ts;
    if (!paused && !S.over) step(dt);
    draw(); raf = requestAnimationFrame(frame);
  }

  // ---------- drawing ----------
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function circ(x, y, r, f) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = f; ctx.fill(); }
  function ell(x, y, a, b, f, rot) { ctx.beginPath(); ctx.ellipse(x, y, a, b, rot || 0, 0, 7); ctx.fillStyle = f; ctx.fill(); }
  function scene() {
    ctx.fillStyle = "#F3E9DA"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#EBDDC8"; for (var y = 0; y < BENCH - 24; y += 26) for (var x = (y / 26) % 2 ? 0 : 13; x < W; x += 26) ctx.fillRect(x, y, 24, 24);
    ctx.fillStyle = "#F3E9DA"; for (y = 0; y < BENCH - 24; y += 26) for (x = (y / 26) % 2 ? 0 : 13; x < W; x += 26) ctx.fillRect(x + 1, y + 1, 22, 22);
    rr(222, 24, 118, 86, 8); ctx.fillStyle = "#BFE0F2"; ctx.fill(); ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 6; ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(281, 24); ctx.lineTo(281, 110); ctx.moveTo(222, 67); ctx.lineTo(340, 67); ctx.stroke();
    circ(310, 46, 10, "#FFE08A");
    // sink at back left
    rr(14, BENCH - 36, 78, 14, 6); ctx.fillStyle = S && S.sinkT > 0 ? "#9FD3EE" : "#D9E2E8"; ctx.fill();
    ctx.strokeStyle = "#AEB8C0"; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(30, BENCH - 36); ctx.lineTo(30, BENCH - 60); ctx.quadraticCurveTo(30, BENCH - 70, 44, BENCH - 70); ctx.lineTo(50, BENCH - 66); ctx.stroke();
    // bench
    ctx.fillStyle = "#C99A63"; ctx.fillRect(0, BENCH - 24, W, 26); ctx.fillStyle = "#B4834E"; ctx.fillRect(0, BENCH + 2, W, 6);
    ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, BENCH + 8, W, H - BENCH);
    ctx.strokeStyle = "#E2D6C3"; ctx.lineWidth = 2; for (var i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(i * 120, BENCH + 14); ctx.lineTo(i * 120, H); ctx.stroke(); }
    for (i = 0; i < 3; i++) { rr(i * 120 + 50, BENCH + 30, 20, 6, 3); ctx.fillStyle = "#CFC3B0"; ctx.fill(); }
    // lane hints
    ctx.fillStyle = "rgba(43,94,128,.10)"; LANES.forEach(function (x, k) { ctx.beginPath(); ctx.ellipse(x, BENCH - 6, 34, 7, 0, 0, 7); ctx.fill(); ctx.fillStyle = "rgba(43,94,128,.35)"; ctx.font = "600 11px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText(k + 1, x, H - 14); ctx.fillStyle = "rgba(43,94,128,.10)"; });
  }
  function fluff(cx, cy, a, b, n, col, edge) { for (var i = 0; i < n; i++) { var t = i / n * Math.PI * 2; circ(cx + Math.cos(t) * a, cy + Math.sin(t) * b, edge, col); } }
  // ---------- cats (sprites drawn from Adam's photos; eyes, paws, dirt and water drawn live) ----------
  var SPR = {};
  ["basil-body", "basil-head", "clover-body", "clover-head"].forEach(function (n) { var im = new Image(); im.src = SBASE + "sprites/" + n + ".svg?v=1"; SPR[n] = im; });
  function sprOK(n) { var im = SPR[n]; return im && im.complete && im.naturalWidth > 0; }
  function spr(n) { if (sprOK(n)) ctx.drawImage(SPR[n], 0, 0, 240, 260); }
  function catEyes(who, mode, cross) {
    // sprite coordinates (240 x 260 art)
    var E = who === "b" ? [[104, 88], [136, 88]] : [[103, 92], [137, 92]], iris = who === "b" ? "#A8B98E" : "#C9C653";
    E.forEach(function (e, k) {
      var x = e[0], y = e[1];
      if (mode === "ouch") { ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(x - 8, y - 6); ctx.lineTo(x + 8, y + 6); ctx.moveTo(x + 8, y - 6); ctx.lineTo(x - 8, y + 6); ctx.stroke(); return; }
      if (mode === "shut") { ctx.strokeStyle = "#7A6E62"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y - 2, 8, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); return; }
      if (mode === "wide") { ell(x, y, 12, 11, "#FFFFFF"); ell(x, y, 10, 10, iris); ell(x, y + 1, 6.5, 8, "#1B1430"); circ(x - 3, y - 3, 2.2, "#fff"); return; }
      ell(x, y, who === "b" ? 10 : 9.5, who === "b" ? 8 : 8.5, iris); ell(x + 0.5, y + 1, who === "b" ? 2.6 : 4.2, who === "b" ? 6.2 : 7, "#1B1430"); circ(x + 3, y - 2, 1.6, "#fff");
      if (who === "b") { ctx.fillStyle = "#FFFFFF"; ctx.fillRect(x - 12, y - 11, 24, 9); ctx.strokeStyle = "#BDB3A6"; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x - 10, y - 2); ctx.lineTo(x + 10, y - 2); ctx.stroke(); }
      else { ctx.strokeStyle = cross ? "#C2553A" : "#3B3942"; ctx.lineWidth = 2.8; ctx.lineCap = "round"; ctx.beginPath(); if (k === 0) { ctx.moveTo(x - 10, y - 8 - (cross ? 2 : 0)); ctx.quadraticCurveTo(x, y - 10, x + 8, y - 5 + (cross ? 2 : 0)); } else { ctx.moveTo(x + 10, y - 8 - (cross ? 2 : 0)); ctx.quadraticCurveTo(x, y - 10, x - 8, y - 5 + (cross ? 2 : 0)); } ctx.stroke(); }
    });
  }
  function basil() {
    var x = 180 + S.lean * 90, CL = S.bonus > 0, sink = S.sinkT > 0 && !CL, K = 0.66;
    var pw = S.paw, reach = pw ? Math.sin(Math.min(1, pw.t / 0.11) * Math.PI / 2) * (pw.t < 0.11 ? 1 : Math.max(0, 1 - (pw.t - 0.11) / 0.11)) : 0;
    ctx.save(); ctx.translate(x, BENCH + 4); ctx.rotate(S.lean); ctx.scale(K, K); ctx.translate(-120, -246);
    var fx = 1, fy = 1;
    if (CL) { var fat = 1 + Math.min(1, S.eatenFood / 120); fx = fat; fy = 1 + (fat - 1) * 0.25; }
    // body (Clover's stretches as she eats, up to twice as wide)
    ctx.save(); ctx.translate(120, 246); ctx.scale(fx, fy); ctx.translate(-120, -246); spr(CL ? "clover-body" : "basil-body");
    if (!CL) {
      if (S.dirt > 0.04) { ctx.globalAlpha = Math.min(0.85, S.dirt); [[96, 214, 22, 12, -0.3], [146, 216, 20, 11, 0.3], [120, 234, 36, 9, 0], [84, 176, 7, 5, 0], [158, 168, 6, 4, 0], [110, 196, 5, 4, 0], [102, 238, 13, 6, 0], [138, 238, 13, 6, 0]].forEach(function (d, k) { if (k < 3 || S.dirt > 0.25) ell(d[0], d[1], d[2], d[3], k < 3 || k > 5 ? "#9A7350" : "#A88462", d[4]); });
        if (S.dirt > 0.5) { ell(132, 150, 8, 5, "#A88462"); ell(90, 140, 6, 4, "#A88462"); ell(200, 190, 8, 6, "#9A7350"); } ctx.globalAlpha = 1; }
      if (S.wet > 0.04) { var wa = Math.min(0.75, S.wet); ctx.globalAlpha = wa; ctx.strokeStyle = "#9FB7C9"; ctx.lineWidth = 3; ctx.lineCap = "round";
        [[90, 150, 196], [104, 170, 230], [120, 160, 222], [136, 172, 232], [150, 150, 200], [112, 120, 150], [130, 118, 152]].forEach(function (l) { ctx.beginPath(); ctx.moveTo(l[0], l[1]); ctx.lineTo(l[0] + 2, l[2]); ctx.stroke(); });
        ctx.globalAlpha = wa * 0.35; ell(120, 190, 48, 50, "#A9C7DE"); ctx.globalAlpha = 1; }
    }
    ctx.restore();
    var hy = -(fy - 1) * 120;
    ctx.save(); ctx.translate(0, hy); spr(CL ? "clover-head" : "basil-head");
    if (!CL && S.wet > 0.3) { ctx.globalAlpha = Math.min(0.6, S.wet - 0.2); ctx.strokeStyle = "#9FB7C9"; ctx.lineWidth = 3; [[96, 60, 74], [144, 58, 72], [120, 54, 66]].forEach(function (l) { ctx.beginPath(); ctx.moveTo(l[0], l[1]); ctx.lineTo(l[0], l[2]); ctx.stroke(); }); ctx.globalAlpha = 1; }
    var mode = S.ouchT > 0 ? "ouch" : S.frenzyT > 0 ? "wide" : (S.blink > 0 || sink) ? "shut" : "open";
    catEyes(CL ? "c" : "b", mode, false);
    if (S.scratchT > 0) { ctx.strokeStyle = "rgba(194,85,58," + Math.min(1, S.scratchT * 2) + ")"; ctx.lineWidth = 5; ctx.lineCap = "round"; for (var k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(86 + k * 16, 56); ctx.lineTo(108 + k * 16, 104); ctx.stroke(); } }
    ctx.restore();
    // kicking (or grabbing) paw
    if (pw && reach > 0.02) {
      var tx = (LANES[pw.lane] - x) / K, px = 120 + tx * reach * 0.95, py = 200 + reach * 40;
      ctx.lineCap = "round"; ctx.strokeStyle = CL ? "#66646E" : "#E2DCD3"; ctx.lineWidth = 30; ctx.beginPath(); ctx.moveTo(120, 190); ctx.lineTo(px, py); ctx.stroke();
      ctx.strokeStyle = CL ? "#7E7C86" : "#FFFFFF"; ctx.lineWidth = 25; ctx.stroke();
      ell(px, py, 17, 12, CL ? "#FFFFFF" : "#FFFFFF"); ctx.strokeStyle = "#E2DCD3"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(px, py, 17, 12, 0, 0, 7); ctx.stroke();
      if (!CL && S.dirt > 0.1) { ctx.globalAlpha = Math.min(0.8, S.dirt); ell(px, py + 4, 15, 7, "#8A6442"); ctx.globalAlpha = 1; }
    }
    ctx.restore();
    // drips and puddle when wet
    if (!CL && S.wet > 0.04) {
      ctx.globalAlpha = Math.min(0.55, S.wet); ell(180, BENCH + 2, 46 * Math.min(1, S.wet + 0.3), 5, "#8FC3E6"); ctx.globalAlpha = 1;
      S.dripT = (S.dripT || 0) - 1 / 60; if (S.dripT <= 0 && !paused) { S.drops.push({ x: 180 + rnd(-30, 30), y: BENCH - rnd(30, 70), vx: rnd(-10, 10), vy: rnd(0, 30), l: 0.8 }); S.dripT = 0.5 / (0.2 + S.wet * 2); }
    }
    if (CL) { if (S.sneak) sneaker(); else sulk(); } else cushion();
    if (sink) { ctx.fillStyle = "rgba(120,190,230,.35)"; ctx.fillRect(0, BENCH - 30, W, 8); }
  }
  function sneaker() {
    var b = S.sneak, K = 0.3, bob = b.phase === "creep" ? Math.sin(S.t * 6) * 1.5 : 0;
    ctx.save(); ctx.translate(b.x, BENCH + 2 + bob); if (b.phase === "flee") ctx.scale(-1, 1); ctx.scale(K, K * 0.82); ctx.translate(-120, -246);
    spr("basil-body"); spr("basil-head"); catEyes("b", b.phase === "flee" ? "shut" : "open"); ctx.restore();
    if (b.phase === "creep") { ctx.strokeStyle = "rgba(43,94,128,.45)"; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(b.x, BENCH - 32, 34 + Math.sin(S.t * 6) * 3, 0, 7); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = "#2B5E80"; ctx.font = "700 10px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("tap to shoo", b.x, BENCH - 74); }
    rr(14, BENCH - 36, 78, 14, 6); ctx.fillStyle = "#D9E2E8"; ctx.fill();
  }
  function cushion() {
    if (S.clover) { ell(334, BENCH - 6, 26, 8, "#5B7F9E"); ell(334, BENCH - 9, 22, 5, "#7FA3C2"); return; }
    var x = 334, y = BENCH - 14;
    ell(x, BENCH - 6, 26, 8, "#5B7F9E"); ell(x, BENCH - 9, 22, 5, "#7FA3C2");
    ctx.strokeStyle = "#66646E"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x + 14, y + 4); ctx.quadraticCurveTo(x + 4, y + 12, x - 12, y + 6); ctx.stroke();
    ell(x, y, 20, 11, "#7E7C86"); ell(x + 4, y - 4, 9, 5, "#E6B08A"); ell(x - 6, y + 2, 6, 4, "#66646E");
    ell(x - 13, y - 4, 9, 8, "#7E7C86"); ctx.save(); ctx.beginPath(); ctx.ellipse(x - 13, y - 4, 9, 8, 0, 0, 7); ctx.clip(); ctx.fillStyle = "#E6B08A"; ctx.fillRect(x - 13, y - 14, 10, 20); ctx.restore();
    ctx.fillStyle = "#66646E"; ctx.beginPath(); ctx.moveTo(x - 20, y - 8); ctx.lineTo(x - 19, y - 17); ctx.lineTo(x - 14, y - 11); ctx.fill(); ctx.fillStyle = "#7E7C86"; ctx.beginPath(); ctx.moveTo(x - 11, y - 11); ctx.lineTo(x - 7, y - 18); ctx.lineTo(x - 5, y - 9); ctx.fill();
    ctx.strokeStyle = "#3B3942"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x - 16, y - 4, 2.5, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke(); ctx.beginPath(); ctx.arc(x - 9, y - 4, 2.5, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
    ctx.fillStyle = "rgba(107,90,147," + (0.5 + Math.sin(S.t * 2) * 0.3) + ")"; ctx.font = "700 11px Poppins, sans-serif"; ctx.textAlign = "left"; ctx.fillText("z", x - 4, y - 18 - (S.t * 8) % 8); ctx.font = "700 8px Poppins, sans-serif"; ctx.fillText("z", x + 4, y - 26 - (S.t * 8) % 8);
  }
  function bars() {
    [["b", 8, S.hb, "basil-head"], ["c", W - 18, S.hc, "clover-head"]].forEach(function (bd) {
      var who = bd[0], x = bd[1], v = bd[2], top = 70, h = 170, act = (S.bonus > 0) === (who === "c");
      rr(x, top, 10, h, 5); ctx.fillStyle = "rgba(43,35,64,.14)"; ctx.fill();
      var fh = h * v / 100; rr(x, top + h - fh, 10, Math.max(fh, 0.1), 5); ctx.fillStyle = v > 60 ? "#3E9B5A" : v > 30 ? "#E0A21E" : "#C2553A"; ctx.fill();
      if (act) { rr(x - 2, top - 2, 14, h + 4, 7); ctx.strokeStyle = "rgba(43,35,64,.55)"; ctx.lineWidth = 1.5; ctx.stroke(); }
      ctx.save(); ctx.translate(x + 5, top - 16); ctx.scale(0.17, 0.17); ctx.translate(-120, -92); spr(bd[3]); ctx.restore();
      ctx.fillStyle = "#2B2340"; ctx.font = "700 9px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText(Math.round(v) + "%", x + 5, top + h + 12);
      if (!act && v < 100) { ctx.fillStyle = "#2E7D6B"; ctx.font = "700 10px Poppins, sans-serif"; ctx.fillText("+", x + 5, top - 34); }
    });
  }
  function sulk() {
    var K = 0.3;
    ctx.save(); ctx.translate(52, BENCH - 52); ctx.scale(K, K); ctx.translate(-120, -90); spr("basil-head"); catEyes("b", "open"); ctx.restore();
    rr(14, BENCH - 36, 78, 14, 6); ctx.fillStyle = "#D9E2E8"; ctx.fill();
    ctx.fillStyle = "#6B5A93"; ctx.font = "600 10px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("sulking", 52, BENCH - 86);
  }
  function clover() {
    var c = S.clover; if (!c) return;
    var x = c.x, y = BENCH - 24, step = Math.sin(S.t * 18) * (c.state === "sit" ? 0 : 3), f = c.dir > 0 || c.state === "sit" ? 1 : -1;
    if (c.state === "sit") {
      var K = 0.3; ctx.save(); ctx.translate(x, BENCH + 2); ctx.scale(K, K); ctx.translate(-120, -246); spr("clover-body"); spr("clover-head"); catEyes("c", "open", c.cross); ctx.restore();
    } else {
      ctx.save(); ctx.translate(x, y); ctx.scale(f, 1);
      ctx.strokeStyle = "#66646E"; ctx.lineWidth = 8; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-22, -16); ctx.quadraticCurveTo(-34, -30, -28, -42); ctx.stroke();
      [-14, -6, 8, 16].forEach(function (lx, k) { ctx.fillStyle = "#7E7C86"; ctx.fillRect(lx + (k % 2 ? step : -step), -10, 5, 12); ctx.fillStyle = k > 1 ? "#FFFFFF" : "#7E7C86"; ctx.fillRect(lx + (k % 2 ? step : -step), -1, 5, 3); });
      ell(0, -16, 25, 11, "#7E7C86"); ell(-8, -20, 9, 5, "#E6B08A"); ell(8, -13, 7, 4, "#66646E"); ell(16, -12, 6, 5, "#FFFFFF");
      ell(26, -26, 12, 11, "#7E7C86"); ctx.save(); ctx.beginPath(); ctx.ellipse(26, -26, 12, 11, 0, 0, 7); ctx.clip(); ctx.fillStyle = "#E6B08A"; ctx.fillRect(27, -40, 14, 30); ctx.restore();
      ctx.fillStyle = "#66646E"; ctx.beginPath(); ctx.moveTo(19, -32); ctx.lineTo(21, -46); ctx.lineTo(28, -35); ctx.fill(); ctx.fillStyle = "#7E7C86"; ctx.beginPath(); ctx.moveTo(29, -35); ctx.lineTo(34, -47); ctx.lineTo(37, -32); ctx.fill();
      circ(32, -27, 2.2, "#C9C653"); circ(32.5, -27, 1.1, "#1B1430"); circ(37, -21, 1.6, "#3A3036");
      ctx.restore();
    }
    if (c.cross && !c.hit) {
      var bx = x + (c.state === "sit" ? 0 : f * 26), by = BENCH - (c.state === "sit" ? 92 : 78);
      rr(bx - 22, by - 14, 44, 20, 9); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.strokeStyle = "#C2553A"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#C2553A"; ctx.font = "700 12px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("HISS", bx, by + 1);
    }
  }
  function item(kind, x, y, s) {
    ctx.save(); ctx.translate(x, y); if (s) ctx.rotate(s);
    switch (kind) {
      case "mug": rr(-14, -30, 26, 30, 4); ctx.fillStyle = "#4A3480"; ctx.fill(); ctx.strokeStyle = "#4A3480"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(13, -16, 7, -1.4, 1.4); ctx.stroke(); ctx.fillStyle = "#FFFFFF"; ctx.font = "700 11px Lora, serif"; ctx.textAlign = "center"; ctx.fillText("M", -1, -11); break;
      case "pen": ctx.rotate(-0.25); rr(-20, -6, 36, 6, 3); ctx.fillStyle = "#2F5DA8"; ctx.fill(); ctx.fillStyle = "#C9D3E3"; ctx.beginPath(); ctx.moveTo(16, -6); ctx.lineTo(24, -3); ctx.lineTo(16, 0); ctx.fill(); break;
      case "phone": rr(-11, -34, 22, 34, 4); ctx.fillStyle = "#2B2340"; ctx.fill(); rr(-8, -30, 16, 25, 2); ctx.fillStyle = "#6FA8C9"; ctx.fill(); break;
      case "sock": ctx.fillStyle = "#E0703A"; rr(-6, -34, 12, 24, 4); ctx.fill(); ell(2, -10, 13, 7, "#E0703A"); ctx.fillStyle = "#FFFFFF"; ctx.fillRect(-6, -30, 12, 4); break;
      case "pills": rr(-11, -30, 22, 30, 4); ctx.fillStyle = "#F0A21E"; ctx.globalAlpha = .9; ctx.fill(); ctx.globalAlpha = 1; rr(-13, -36, 26, 8, 3); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.strokeStyle = "#D2C6B6"; ctx.lineWidth = 1.5; ctx.stroke(); rr(-8, -22, 16, 10, 2); ctx.fillStyle = "#FFFFFF"; ctx.fill(); break;
      case "steth": ctx.strokeStyle = "#2E7D6B"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-12, -34); ctx.quadraticCurveTo(-14, -12, 0, -12); ctx.quadraticCurveTo(14, -12, 12, -34); ctx.moveTo(0, -12); ctx.quadraticCurveTo(0, -2, 12, -4); ctx.stroke(); circ(14, -5, 6, "#AEB8C0"); break;
      case "plant": ctx.fillStyle = "#C2553A"; ctx.beginPath(); ctx.moveTo(-12, -18); ctx.lineTo(12, -18); ctx.lineTo(9, 0); ctx.lineTo(-9, 0); ctx.fill(); ell(-6, -28, 6, 11, "#5B7F1F", -0.5); ell(6, -28, 6, 11, "#5B7F1F", 0.5); ell(0, -32, 5, 12, "#6E9A2A"); break;
      case "remote": rr(-8, -36, 16, 36, 5); ctx.fillStyle = "#3B3B44"; ctx.fill(); circ(0, -28, 3, "#E05A5A"); [-20, -14, -8].forEach(function (yy) { circ(-3, yy, 1.8, "#AAA"); circ(3, yy, 1.8, "#AAA"); }); break;
      case "glass": ctx.fillStyle = "rgba(160,210,235,.55)"; ctx.beginPath(); ctx.moveTo(-11, -34); ctx.lineTo(11, -34); ctx.lineTo(8, 0); ctx.lineTo(-8, 0); ctx.fill(); ctx.fillStyle = "rgba(90,170,220,.6)"; ctx.fillRect(-9, -18, 18, 17); ctx.strokeStyle = "#8BB6CC"; ctx.lineWidth = 1.5; ctx.stroke(); break;
      case "tube": ctx.rotate(0.3); rr(-20, -10, 40, 10, 4); ctx.fillStyle = "#2F5DA8"; ctx.fill(); ctx.fillStyle = "#F08A24"; ctx.fillRect(-8, -9, 16, 8); break;
      case "keys": ctx.strokeStyle = "#B07A0C"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-4, -12, 7, 0, 7); ctx.stroke(); ctx.fillStyle = "#C9A227"; ctx.fillRect(2, -14, 18, 4); ctx.fillRect(14, -10, 3, 5); ctx.fillRect(18, -10, 2, 4); break;
      case "thermo": ctx.rotate(-0.5); rr(-3, -36, 7, 34, 3); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.strokeStyle = "#C9C2B8"; ctx.lineWidth = 1.5; ctx.stroke(); circ(0.5, -2, 5, "#E05A5A"); ctx.fillStyle = "#E05A5A"; ctx.fillRect(-0.5, -20, 2, 16); break;
      case "tap": rr(-16, -14, 32, 14, 4); ctx.fillStyle = "#AEB8C0"; ctx.fill(); ctx.strokeStyle = "#AEB8C0"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-6, -14); ctx.lineTo(-6, -34); ctx.quadraticCurveTo(-6, -42, 6, -42); ctx.lineTo(10, -38); ctx.stroke(); circ(10, -30 + (S ? (S.t * 30) % 14 : 0), 3, "#5AA9DC"); break;
      case "cactus": ctx.fillStyle = "#C2553A"; ctx.beginPath(); ctx.moveTo(-12, -14); ctx.lineTo(12, -14); ctx.lineTo(9, 0); ctx.lineTo(-9, 0); ctx.fill(); rr(-7, -46, 14, 34, 7); ctx.fillStyle = "#3E8E4A"; ctx.fill(); rr(-17, -36, 8, 16, 4); ctx.fill(); rr(9, -40, 8, 14, 4); ctx.fill(); ctx.strokeStyle = "#1F4F27"; ctx.lineWidth = 1.3; [[-7, -40], [7, -34], [-7, -26], [7, -20], [-17, -32], [17, -36], [0, -47]].forEach(function (q) { ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] + (q[0] < 0 ? -4 : q[0] > 0 ? 4 : 0), q[1] - 3); ctx.stroke(); }); break;
      case "pins": ell(0, -8, 16, 9, "#C93A5A"); ell(0, -2, 15, 4, "#8E2A40"); ctx.strokeStyle = "#7A7A86"; ctx.lineWidth = 1.5; [[-10, -10], [-4, -14], [3, -15], [9, -12], [0, -9]].forEach(function (q, k) { ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] + (k - 2) * 2.5, q[1] - 13); ctx.stroke(); circ(q[0] + (k - 2) * 2.5, q[1] - 13, 2.4, ["#F0A21E", "#2F5DA8", "#2E7D6B", "#E05A5A", "#4A3480"][k]); }); break;
      case "rose": ctx.strokeStyle = "#3E8E4A"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -30); ctx.stroke(); ctx.lineWidth = 1.6; [[-1, -8, -6], [1, -16, 6], [-1, -23, -6]].forEach(function (q) { ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[2], q[1] - 2); ctx.stroke(); }); ell(-5, -18, 6, 3, "#5B9A3A", -0.5); circ(0, -36, 8, "#D2334A"); circ(-3, -38, 4, "#A8213A"); circ(3, -34, 3.4, "#E85068"); break;
      case "vase": ctx.fillStyle = "#2F5DA8"; ctx.beginPath(); ctx.moveTo(-8, -52); ctx.lineTo(8, -52); ctx.quadraticCurveTo(6, -40, 16, -26); ctx.quadraticCurveTo(22, -8, 9, 0); ctx.lineTo(-9, 0); ctx.quadraticCurveTo(-22, -8, -16, -26); ctx.quadraticCurveTo(-6, -40, -8, -52); ctx.fill(); ctx.strokeStyle = "#F1ECF8"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-15, -22); ctx.quadraticCurveTo(0, -14, 15, -22); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -30, 4, 0, 7); ctx.stroke(); circ(-4, -46, 1.6, "#9FC0E8"); rr(-10, -56, 20, 5, 2); ctx.fillStyle = "#24498A"; ctx.fill(); break;
      case "tv": rr(-34, -54, 68, 46, 5); ctx.fillStyle = "#3B3B44"; ctx.fill(); rr(-29, -50, 58, 37, 3); ctx.fillStyle = "#6FA8C9"; ctx.fill(); ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.beginPath(); ctx.moveTo(-24, -46); ctx.lineTo(-8, -46); ctx.lineTo(-22, -22); ctx.fill(); ctx.fillStyle = "#2B2340"; ctx.fillRect(-4, -8, 8, 5); rr(-16, -4, 32, 4, 2); ctx.fill(); circ(26, -11, 1.6, "#5BD08A"); break;
      case "tank": rr(-48, -70, 96, 70, 6); ctx.fillStyle = "rgba(111,168,201,.55)"; ctx.fill(); ctx.strokeStyle = "#5E7F92"; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = "rgba(90,169,220,.55)"; ctx.fillRect(-46, -56, 92, 54); ctx.fillStyle = "#C9A227"; ctx.fillRect(-46, -10, 92, 8); ell(-26, -10, 4, 14, "#3E8E4A"); ell(30, -12, 4, 18, "#3E8E4A");
        [[-12, -36, 1], [16, -26, -1]].forEach(function (f) { var fx = f[0] + Math.sin((S ? S.t : 0) * 2 + f[1]) * 8; ell(fx, f[1], 8, 5, "#F0A21E"); ctx.fillStyle = "#F0A21E"; ctx.beginPath(); ctx.moveTo(fx - 7 * f[2], f[1]); ctx.lineTo(fx - 13 * f[2], f[1] - 5); ctx.lineTo(fx - 13 * f[2], f[1] + 5); ctx.fill(); });
        circ(4, -46, 2, "rgba(255,255,255,.7)"); circ(8, -52, 1.5, "rgba(255,255,255,.7)"); rr(-50, -74, 100, 6, 3); ctx.fillStyle = "#3B3B44"; ctx.fill(); break;
      case "catfood": rr(-15, -18, 30, 18, 3); ctx.fillStyle = "#AEB8C0"; ctx.fill(); rr(-15, -14, 30, 10, 2); ctx.fillStyle = "#E05A8A"; ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "700 7px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("MEOW", 0, -6.5); ell(0, -19, 15, 3.5, "#C99A63"); break;
      case "banana": ctx.strokeStyle = "#F2C230"; ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(0, -30, 20, 0.35 * Math.PI, 0.9 * Math.PI); ctx.stroke(); ctx.strokeStyle = "#5E4A20"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-19, -24); ctx.lineTo(-22, -28); ctx.stroke(); break;
      case "steak": ell(0, -10, 19, 11, "#B3402F"); ell(-2, -11, 15, 8, "#C9563F"); ctx.strokeStyle = "#F1D9C2"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, -10, 18, 10, 0, 0.1, 2.2); ctx.stroke(); circ(6, -10, 3, "#F1D9C2"); break;
      case "drumstick": ell(-4, -12, 13, 10, "#C27A43"); ell(-6, -14, 9, 6, "#D8925A"); ctx.fillStyle = "#F7F1E6"; ctx.fillRect(6, -14, 12, 5); circ(19, -15, 3.4, "#F7F1E6"); circ(19, -9, 3.4, "#F7F1E6"); break;
      case "sausage": rr(-20, -12, 40, 11, 5.5); ctx.fillStyle = "#A8502E"; ctx.fill(); ctx.strokeStyle = "#7A3418"; ctx.lineWidth = 1.5; [-8, 0, 8].forEach(function (q) { ctx.beginPath(); ctx.moveTo(q - 2, -10); ctx.lineTo(q + 2, -4); ctx.stroke(); }); break;
      case "pizza": ctx.fillStyle = "#F2C66D"; ctx.beginPath(); ctx.moveTo(-18, -26); ctx.lineTo(18, -26); ctx.lineTo(0, 0); ctx.fill(); ctx.fillStyle = "#D9A441"; ctx.fillRect(-19, -29, 38, 5); circ(-6, -18, 3.2, "#C2402F"); circ(5, -14, 3.2, "#C2402F"); circ(0, -7, 2.6, "#C2402F"); break;
      case "pineapple": ell(0, -14, 11, 14, "#E0A21E"); ctx.strokeStyle = "#A8700F"; ctx.lineWidth = 1.2; for (var pq = -2; pq <= 2; pq++) { ctx.beginPath(); ctx.moveTo(-10, -14 + pq * 5 - 5); ctx.lineTo(10, -14 + pq * 5 + 5); ctx.stroke(); ctx.beginPath(); ctx.moveTo(10, -14 + pq * 5 - 5); ctx.lineTo(-10, -14 + pq * 5 + 5); ctx.stroke(); } ctx.fillStyle = "#3E8E4A"; [[-7, -40], [0, -46], [7, -40], [-3, -36], [4, -36]].forEach(function (q) { ctx.beginPath(); ctx.moveTo(q[0] * 0.3, -27); ctx.lineTo(q[0], q[1]); ctx.lineTo(q[0] * 0.3 + 3, -27); ctx.fill(); }); break;
      case "coffee": rr(-12, -26, 24, 26, 4); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.strokeStyle = "#D2C6B6"; ctx.lineWidth = 1.5; ctx.stroke(); ell(0, -26, 12, 3, "#6B4226"); ctx.strokeStyle = "#D2C6B6"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(13, -14, 6, -1.4, 1.4); ctx.stroke(); ctx.strokeStyle = "rgba(150,140,130,.6)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-3, -32); ctx.quadraticCurveTo(-7, -38, -2, -44); ctx.moveTo(4, -32); ctx.quadraticCurveTo(0, -38, 5, -44); ctx.stroke(); break;
      case "grapes": [[0, -30], [-6, -24], [6, -24], [-9, -17], [0, -17], [9, -17], [-5, -10], [5, -10], [0, -4]].forEach(function (q) { circ(q[0], q[1], 5, "#6E3B8F"); circ(q[0] - 1.5, q[1] - 1.5, 1.4, "#A57CC2"); }); ctx.strokeStyle = "#5E4A20"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -35); ctx.lineTo(2, -41); ctx.stroke(); break;
      case "garlic": ctx.fillStyle = "#F4EFE6"; ctx.beginPath(); ctx.moveTo(0, -34); ctx.quadraticCurveTo(18, -20, 12, -4); ctx.quadraticCurveTo(0, 2, -12, -4); ctx.quadraticCurveTo(-18, -20, 0, -34); ctx.fill(); ctx.strokeStyle = "#D8CDBB"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(-6, -16, -4, -2); ctx.moveTo(0, -30); ctx.quadraticCurveTo(6, -16, 4, -2); ctx.stroke(); ctx.fillStyle = "#C9BBA2"; ctx.fillRect(-1.5, -40, 3, 7); break;
      case "fish": ell(0, -12, 16, 9, "#F0A21E"); ctx.fillStyle = "#F0A21E"; ctx.beginPath(); ctx.moveTo(14, -12); ctx.lineTo(26, -22); ctx.lineTo(26, -2); ctx.fill(); circ(-8, -14, 2, "#2B2340"); break;
    }
    ctx.restore();
  }
  function draw() {
    ctx.save();
    if (shakeT > 0) ctx.translate(rnd(-3, 3), rnd(-2, 2));
    scene(); basil(); bars();
    for (var i = 0; i < 3; i++) {
      var it = S.lanes[i]; if (!it) continue;
      var wob = it.landed && (it.life < 1 || it.hit > 0) ? Math.sin(S.t * 30 + it.wob) * (it.hit > 0 ? 0.16 : 0.08) : 0;
      item(it.kind, LANES[i], it.y, wob);
      if (it.hp && it.landed) {
        var dmg = 1 - it.hp / it.hpMax, cx = LANES[i], top = BENCH - (it.kind === "tv" ? 54 : 52);
        ctx.strokeStyle = it.kind === "tv" ? "#F1ECF8" : "#1B1430"; ctx.lineWidth = 1.6;
        for (var c2 = 0; c2 < Math.floor(dmg * 6); c2++) { var sx = cx + ((c2 * 37) % 30) - 15, sy = top + 10 + ((c2 * 23) % 30); ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 6, sy + 5); ctx.lineTo(sx + 3, sy + 11); ctx.stroke(); }
        if (it.hpMax > 12) { top = BENCH - 74; rr(cx - 40, top - 16, 80, 8, 4); ctx.fillStyle = "rgba(43,35,64,.18)"; ctx.fill(); rr(cx - 40, top - 16, 80 * it.hp / it.hpMax, 8, 4); ctx.fillStyle = "#C2553A"; ctx.fill(); ctx.fillStyle = "#2B2340"; ctx.font = "700 10px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText(it.hp, cx, top - 20); }
        else for (var h2 = 0; h2 < it.hpMax; h2++) circ(cx - (it.hpMax - 1) * 4 + h2 * 8, top - 10, 3, h2 < it.hp ? "#C2553A" : "rgba(43,35,64,.18)");
      }
      if (it.landed && (isSpiky(it.kind) || isBad(it.kind))) { ctx.strokeStyle = "#C2553A"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(LANES[i], BENCH - 64, 8, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(LANES[i] - 5.5, BENCH - 69.5); ctx.lineTo(LANES[i] + 5.5, BENCH - 58.5); ctx.stroke(); continue; }
      if (it.landed) { var p = Math.max(0, it.life / it.max); ctx.strokeStyle = it.kind === "tap" || it.kind === "fish" ? "#2E7D6B" : p < .35 ? "#C2553A" : "#2B5E80"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(LANES[i], BENCH - 56, 7, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke(); }
    }
    clover();
    S.fly.forEach(function (f) { item(f.kind, f.x, f.y, f.r); });
    S.shards.forEach(function (q) { ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, q.l)); ctx.translate(q.x, q.y); ctx.rotate(q.r); ctx.fillStyle = q.c; ctx.beginPath(); ctx.moveTo(-q.s, 0); ctx.lineTo(0, -q.s * 0.7); ctx.lineTo(q.s * 0.8, q.s * 0.5); ctx.fill(); ctx.restore(); });
    var mo = S.moth;
    if (mo) {
      ctx.save(); ctx.translate(mo.x, mo.y); var fl = Math.abs(Math.sin(S.t * 16)) * 0.8 + 0.2, sc = mo.eaten ? mo.eaten / 0.4 : 1; ctx.scale(sc, sc);
      var wc = mo.kind === "moth" ? ["#B8A88A", "#9C8B6E"] : mo.kind === "wasp" ? ["rgba(220,235,245,.75)", "rgba(200,220,235,.7)"] : ["#F0A21E", "#E0703A"];
      if (mo.kind === "wasp") { ctx.save(); ctx.scale(1, fl); ell(-7, -8, 8, 5, wc[0], -0.5); ell(7, -8, 8, 5, wc[0], 0.5); ctx.restore();
        ell(0, 2, 5, 11, "#F2C230"); ctx.fillStyle = "#2B2340"; [-3, 3, 9].forEach(function (yy) { ctx.fillRect(-5, yy, 10, 2.6); }); circ(0, -10, 4.2, "#2B2340"); ctx.fillStyle = "#2B2340"; ctx.beginPath(); ctx.moveTo(-2, 12); ctx.lineTo(0, 18); ctx.lineTo(2, 12); ctx.fill();
        ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-1, -13); ctx.lineTo(-4, -18); ctx.moveTo(1, -13); ctx.lineTo(4, -18); ctx.stroke(); }
      else { ctx.save(); ctx.scale(1, fl); ell(-9, -6, 10, 8, wc[0], -0.4); ell(9, -6, 10, 8, wc[0], 0.4); ell(-7, 6, 7, 6, wc[1], 0.3); ell(7, 6, 7, 6, wc[1], -0.3); ctx.restore();
      if (mo.kind === "butterfly") { circ(-9, -6, 3, "#2B2340"); circ(9, -6, 3, "#2B2340"); }
      ell(0, 0, 2.6, 10, "#2B2340"); ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-1, -9); ctx.lineTo(-5, -16); ctx.moveTo(1, -9); ctx.lineTo(5, -16); ctx.stroke(); }
      ctx.restore();
      if (!mo.eaten && mo.kind === "wasp") { ctx.strokeStyle = "#C2553A"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(mo.x + 18, mo.y - 18, 6, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(mo.x + 14, mo.y - 22); ctx.lineTo(mo.x + 22, mo.y - 14); ctx.stroke(); }
      else if (!mo.eaten) { ctx.strokeStyle = "rgba(181,48,138,.35)"; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(mo.x, mo.y, 24 + Math.sin(S.t * 6) * 3, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
    }
    S.gulp.forEach(function (g) { var k = g.t / 0.32, gx = g.x + (180 - g.x) * k, gy = g.y + (BENCH - 98 - g.y) * k; ctx.save(); ctx.translate(gx, gy); ctx.scale(1 - k * 0.85, 1 - k * 0.85); item(g.kind, 0, 0, 0); ctx.restore(); });
    S.flops.forEach(function (f) { item("fish", f.x, f.y, f.r); });
    S.slash.forEach(function (k) { ctx.globalAlpha = Math.min(1, k.l * 4); ctx.strokeStyle = "#B07A0C"; ctx.lineWidth = 3; ctx.lineCap = "round"; for (var j = -1; j <= 1; j++) { ctx.beginPath(); ctx.moveTo(k.x - 26, k.y - 22 + j * 9); ctx.quadraticCurveTo(k.x, k.y - 34 + j * 9, k.x + 26, k.y - 22 + j * 9 - 6); ctx.stroke(); } ctx.globalAlpha = 1; });
    S.drops.forEach(function (d) { ctx.globalAlpha = Math.max(0, d.l); circ(d.x, d.y, 3, "#5AA9DC"); ctx.globalAlpha = 1; });
    S.fx.forEach(function (f) { ctx.globalAlpha = Math.max(0, f.l); ctx.fillStyle = f.col; ctx.font = "700 15px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText(f.txt, f.x, f.y); ctx.globalAlpha = 1; });
    if (S.bonus > 0) { rr(84, 12, 192, 26, 13); ctx.fillStyle = "#B07A0C"; ctx.fill(); ctx.fillStyle = "#FFF"; ctx.font = "700 13px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("ROUND " + S.round + " · CLOVER · " + Math.ceil(S.bonus) + "s", 180, 30); }
    else if (S.frenzyT <= 0 && S.sinkT <= 0) { rr(84, 12, 192, 26, 13); ctx.fillStyle = "#2B5E80"; ctx.fill(); ctx.fillStyle = "#FFF"; ctx.font = "700 13px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("ROUND " + S.round + " · BASIL · " + Math.ceil(S.roundT) + "s", 180, 30); }
    else if (S.frenzyT > 0) { rr(104, 12, 152, 26, 13); ctx.fillStyle = "#B5308A"; ctx.fill(); ctx.fillStyle = "#FFF"; ctx.font = "700 13px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("FRENZY x2 · " + Math.ceil(S.frenzyT) + "s", 180, 30); }
    else if (S.sinkT > 0) { ctx.fillStyle = "#2B5E80"; ctx.font = "700 14px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("SINK TIME x2", 180, 28); }
    if (S.ann && S.ann.t > 0) {
      var at = S.ann.t, k = Math.min(1, (1.8 - at) / 0.25), cl2 = S.ann.b === "NOM!", fade = Math.min(1, at / 0.3);
      ctx.save(); ctx.globalAlpha = fade; ctx.fillStyle = "rgba(20,13,40,.35)"; ctx.fillRect(0, 120, W, 120);
      ctx.translate(180, 168); ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k); ctx.textAlign = "center"; ctx.lineJoin = "round";
      ctx.font = "800 24px Poppins, sans-serif"; ctx.lineWidth = 6; ctx.strokeStyle = "#2B2340"; ctx.strokeText(S.ann.a, 0, -14); ctx.fillStyle = "#FFFFFF"; ctx.fillText(S.ann.a, 0, -14);
      if (at < 1.45) { ctx.font = "900 52px Poppins, sans-serif"; ctx.lineWidth = 9; ctx.strokeText(S.ann.b, 0, 40); ctx.fillStyle = cl2 ? "#E6B08A" : "#FFE08A"; ctx.fillText(S.ann.b, 0, 40); }
      ctx.restore();
    }
    if (paused) { ctx.fillStyle = "rgba(43,35,64,.55)"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#fff"; ctx.font = "700 26px Lora, serif"; ctx.textAlign = "center"; ctx.fillText("Paused. Basil is napping.", 180, H / 2); }
    ctx.restore();
  }
  function hud() {
    $("bk-score").textContent = fmt(S.score);
    var mult = Math.min(4, 1 + Math.floor(S.combo / 3));
    $("bk-combo").textContent = S.t - S.lastKick < 1.05 && mult > 1 ? "Combo x" + mult : "";
    $("bk-lives").innerHTML = "";
  }

  // ---------- flow ----------
  function nameFor(n, L) { L = L || NAMES; var nm = L[0][1]; L.forEach(function (x) { if (n >= x[0]) nm = x[1]; }); return nm; }
  function end() {
    S.over = true; var best = lget(BEST) || 0, pb = S.score > best; if (pb) lset(BEST, S.score);
    var cl = S.bonus > 0, bn = nameFor(S.bPts), cn = nameFor(S.cPts, CNAMES);
    $("bk-omasc").src = "/assets/mascots/" + (cl ? "clover.svg?v=1" : "basil.svg?v=2"); $("bk-omasc").alt = cl ? "Clover" : "Basil";
    $("bk-otitle").textContent = cl ? cn : bn;
    $("bk-ofeat").textContent = cl ? "Clover ended it. Mid-snack." : "Basil’s verdict";
    $("bk-omsg").textContent = cl ? (S.cPts < 3000 ? "Barely a snack. She’ll be complaining about this for days." : S.cPts < 30000 ? "A solid feed. Room for dessert, obviously." : "Royalty. The fridge fears her.") + " Basil: " + bn + "."
      : (S.bPts < 1000 ? "Barely a kick. He's saving his energy for 3am." : S.bPts < 15000 ? "A respectable mess. The bench will never be the same." : S.bPts < 100000 ? "Chaos. Several mugs have filed for compensation." : "Pure evil. Fluffy, smug, white evil.") + (S.eatenFood ? " Clover: " + cn + "." : "");
    $("bk-opts").textContent = fmt(S.score); if ($("bk-orounds")) $("bk-orounds").textContent = S.round; $("bk-okick").textContent = fmt(S.bPts); $("bk-onom").textContent = fmt(S.cPts);
    var ob = $("bk-obest"); ob.textContent = pb ? "New personal best!" : "Best: " + fmt(best); ob.className = "bk-obest" + (pb ? " pb" : "");
    $("bk-over").hidden = false; track("basil/end"); setTimeout(function () { $("bk-again").focus(); }, 50);
  }
  function start() {
    reset(); $("bk-intro").hidden = true; $("bk-game").hidden = false; $("bk-over").hidden = true; paused = false;
    size(); running = true; last = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); hud(); track("basil/start");
    var gt = $("bk-game").getBoundingClientRect().top + window.scrollY - 68; window.scrollTo({ top: Math.max(0, gt), behavior: quiet() ? "auto" : "smooth" });
  }
  function togglePause() { if (!running || S.over) return; paused = !paused; $("bk-pause").innerHTML = paused ? "&#9654;" : "&#10074;&#10074;"; }
  $("bk-start").onclick = start; $("bk-again").onclick = start; $("bk-pause").onclick = togglePause;
  $("bk-sharebtn").onclick = function () {
    var t = "Basil + Clover 🐾 " + fmt(S.score) + " points, round " + S.round + " (" + S.kicks + " kicks, " + S.eatenFood + " noms). Basil: " + nameFor(S.bPts) + " (" + fmt(S.bPts) + ")" + (S.cPts ? ". Clover: " + nameFor(S.cPts, CNAMES) + " (" + fmt(S.cPts) + ")" : "") + ".\nmaladywise.com/basil", b = this;
    if (navigator.share) { navigator.share({ text: t }).catch(function () {}); return; }
    try { navigator.clipboard.writeText(t).then(function () { b.textContent = "Copied"; }); } catch (e) {}
  };
  document.addEventListener("visibilitychange", function () { if (document.hidden && running && !S.over && !paused) togglePause(); });
  window.addEventListener("resize", function () { if (running) size(); });
  var b0 = lget(BEST); if (b0) $("bk-best").innerHTML = "Your best: <b>" + fmt(b0) + "</b> points";
  reset(); size(); draw();
})();
