/* Basil + Clover: bonus Malady Wise arcade game. Basil (smug, fluffy, white) kicks everything off the kitchen bench;
   his sister Clover (tortoiseshell) eats everything in hers.
   Default mode is a 10-round CAMPAIGN: everything is possible from round 1 but rare and slow; each round ramps up speed,
   spawn rate and how often each event turns up (see RAMP and lvl()). 3 lives (round 10: one life). Round 5 is the VAC-3000
   boss; round 10 (the 3AM finale) ends with it again. Surviving that wins and unlocks ENDLESS (everything on, ramping forever).
   The daily challenge is the campaign, seeded from the Sydney date. Best score is kept in this browser only. */
(function () {
  "use strict";
  var BEST = "mw-basil-best2", SBASE = new URL(".", document.currentScript.src).href;
  function lget(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function lset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  // ---------- stages: 1 = the Kitchen (original), 2 = the Vet (vet.js) ----------
  var STAGE = 1, V = null, ST1 = null;
  var KEYS = { 1: { best: "mw-basil-best2", won: "mw-basil-won", hs: "mw-basil-hs" }, 2: { best: "mw-basil-vet-best", won: "mw-basil-vet-won", hs: "mw-basil-vet-hs" } };
  function s2(a, b) { return STAGE === 2 ? b : a; }
  // hidden playtest pass: /basil-clover/?vetpass opens the Vet on this device without beating the Kitchen (?vetpass=0 removes it)
  try { var vq = new URLSearchParams(location.search).get("vetpass"); if (vq !== null) localStorage.setItem("mw-basil-vetpass", vq === "0" ? "0" : "1"); } catch (e) {}
  function kitchenWon() { return true; } // the Vet is open to everyone (Nov 2026); beating the Kitchen now earns a crown, not a key
  // daily challenge rotates the stage by Sydney weekday (Sun..Sat). Add new stages here as they are built.
  var DAILYMAP = [1, 1, 2, 1, 2, 1, 2], STNAME = { 1: "Kitchen", 2: "Vet" }, DAYN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function sydWd() { try { return new Date(sydDay() + "T12:00:00Z").getUTCDay(); } catch (e) { return new Date().getDay(); } }
  function dailyStage() { var n = DAILYMAP[sydWd()] || 1; return n === 2 && !V ? 1 : n; }
  function track(n) { if (STAGE === 2) n = String(n).replace(/^basil\//, "basil/vet-"); try { if (window.MW_track) MW_track(n); else if (window.goatcounter && goatcounter.count) goatcounter.count({ path: n, title: n, event: true }); } catch (e) {} }
  function $(id) { return document.getElementById(id); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  // game RNG: seeded from the date in the daily challenge, so everyone gets the same items and surprises in the same order
  var DAILY = false, G = Math.random;
  function sydDay() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function seeded(str) { var a = 0; for (var i = 0; i < str.length; i++) a = Math.imul(a ^ str.charCodeAt(i), 2654435761); return function () { a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function grnd(a, b) { return a + G() * (b - a); }
  function gpick(a) { return a[Math.floor(G() * a.length)]; }
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
  var NOMQ = ["Nom.", "Gone.", "Inhaled.", "Sucked up.", "Snarfed.", "Chomp."];
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
  // ---------- campaign: 10 rounds. Everything is on from round 1; each round is faster, busier and ruder ----------
  var CAMP = true, ENDLESS = false, WON = "mw-basil-won";
  var CAMP_KIND = [null, "B", "C", "B", "C", "boss", "B", "C", "B", "C", "B"];
  var CAMP_NAME = [null, "WARM-UP", "SNACK O’CLOCK", "PICKING UP", "NIGHT SHIFT", "VAC-3000", "THE DOG IS RESTLESS", "WET BENCH", "TURF WAR", "YAWN O’CLOCK", "3AM FINALE"];
  var CAMP_TIP = [null, "Everything’s in the kitchen. It’s all just slow. For now.", "Clover’s turn: eat the good food. Faster. Basil’s sneakier.", "Faster. More spiky things. The wasps are awake.", "Night falls. Faster again. More zoomies, more moths.", "BOSS: VAC-3000. Hit the glowing spots. Jump its charges. Tap like mad when it sucks.", "Faster. More moths. The dog is restless.", "Faster. The bench is wetter: things slide. More hairballs.", "Faster. Heavier things. The stray’s cockier.", "Faster. Everyone’s yawning: some taps won’t land.", "3AM. Top speed. One life. Then the vacuum wants revenge."];
  // how much of everything: [round 1 value, round 10 value]. lvl() runs 0 → 1 across the campaign; endless keeps climbing to 1.5.
  var RAMP = {
    spawn: [0.95, 0.38], pat: [2.6, 1.05], fall: [1, 1.9], land: [40, 12], tap: [99, 40],
    spiky: [0.06, 0.26], bad: [0.08, 0.3], hedgehog: [0.015, 0.1], hairball: [0.02, 0.1], vase: [0.03, 0.11], tv: [0.008, 0.05], tank: [0.003, 0.015],
    wasp: [0.15, 0.42], slide: [0.08, 0.85], yawn: [0.02, 0.14], sneakV: [26, 46], tomT: [4.5, 3.2], dogT: [4.5, 6],
    // seconds between appearances: [[min, max] in round 1, [min, max] in round 10]
    moth: [[11, 17], [4.5, 7.5]], zoom: [[15, 22], [6, 10]], dog: [[32, 44], [12, 18]], tom: [[38, 52], [14, 20]], laser: [[28, 40], [10, 16]], rainbow: [[45, 60], [30, 40]],
    flea: [[24, 34], [10, 15]], ev: [[14, 20], [6, 9]], clover: [[10, 15], [5, 8]], sneak: [[9, 13], [4, 6.5]], treat: [[12, 18], [6, 10]], special: [[16, 24], [15, 21]]
  };
  function cr() { return Math.max(1, Math.min(10, S.round)); }
  function lvl() { if (STAGE === 2) return CAMP ? 1 / 3 + (cr() - 1) / 9 * 0.967 : Math.min(1.8, 1 / 3 + S.t / 240); return CAMP ? (cr() - 1) / 9 : Math.min(1.5, S.t / 240); } // the Vet: round 1 = kitchen round 4, round 10 = 1.3x kitchen round 10 // endless: round 10 pace at 4 minutes, still ramping to 6
  function rp(k) { var r = RAMP[k], l = lvl(); return r[0] + (r[1] - r[0]) * l; }
  function rpg(k, lo) { var r = RAMP[k]; return Math.max(lo || 0, r[0] * Math.pow(r[1] / r[0], lvl())); } // geometric ramp, for timings
  function every(k) { var r = RAMP[k], l = lvl(); return grnd(Math.max(r[1][0] * 0.75, r[0][0] + (r[1][0] - r[0][0]) * l), Math.max(r[1][1] * 0.75, r[0][1] + (r[1][1] - r[0][1]) * l)); }
  function dogX() { return CAMP && S.round < 6 ? 2 : 3; } // the dog: 2x speed in rounds 1-5, 3x from round 6 (and in endless)
  function fallK() { return (1 + (RAMP.fall[1] - 1) * lvl()) * (S.dog ? dogX() : 1); }
  function landTol() { return Math.max(10, rp("land")); } // how far above the bench a falling thing can be kicked
  function tapHalf() { var l = lvl(); return l < 0.3 ? 99 : Math.max(38, 54 - 14 * (l - 0.3) / 0.7); } // half-width of each lane's tap zone, in game units: shrinks from round 4
  function rAge() { return S.t - (S.rT0 || 0); }
  var HEDGEQ = ["That was a hedgehog. Asleep. Was.", "Never kick a sleeping hedgehog. Ancient kitchen law.", "Prickly lesson. Not everything round is a toy.", "The hedgehog has lodged a formal complaint.", "Bold move. Wrong, but bold."];
  function U() { return 10 * S.round; } // base points per item: 10 in round 1, 20 in round 2, and so on
  function addPts(n) { S.score = Math.max(0, S.score + n); if (S.bonus > 0) S.cPts = Math.max(0, S.cPts + n); else S.bPts = Math.max(0, S.bPts + n); }
  function fmt(n) { return Math.round(n).toLocaleString("en-AU"); }
  var CNAMES = [[0, "Cute Clover"], [1000, "Wiggle Butt"], [3000, "The Whingapotamus"], [7500, "Chief Complaints Officer"], [15000, "Spicy Little Muffin"], [30000, "Miss Piggy"], [60000, "Clover Piggington"], [100000, "Queen Piggington"]];
  var NAMES = [[0, "Fluffy white rat"], [1000, "Basil Brown Pants"], [2500, "Furby with Fangs"], [5000, "Fat Basil"], [10000, "Basil Blanket Biter"], [15000, "Fat white seal"], [40000, "Basil Bad Cat"], [100000, "Albino Satan"]];
  var ITEMS = ["mug", "pen", "phone", "sock", "pills", "plant", "remote", "glass", "tube", "keys", "thermo"];

  // ---------- state ----------
  var S, raf = 0, last = 0, paused = false, running = false;
  function reset() {
    G = DAILY ? seeded((STAGE === 2 ? "basil-vet-" : "basil-") + sydDay()) : Math.random;
    S = { t: 0, bPts: 0, cPts: 0, round: 1, roundT: ROUND, ann: { t: 1.8, a: "ROUND 1", b: "KICK!" }, score: 0, hb: 100, hc: 100, sneak: null, sneakT: 4, treat: null, treatT: grnd(10, 16), boss: null, bosses: 0, nightK: 0, zoom: null, zoomT: grnd(9, 13), rb: null, rbT: grnd(40, 55), dust: [], parts: [], rT0: 0, finale: false, ev: null, evT: grnd(8, 11), butterT: 0, towelT: 0, leapT: 0, flashT: 0, rFail: false, dogSeen: 0, rain: [], nipT: 0, nips: 0, lives: 3, combo: 0, lastKick: -9, spawnT: 0.8, lanes: [null, null, null], fly: [], fx: [], clover: null, cloverT: grnd(5, 8), swiped: 0, cross: false, bonus: 0, nextBonus: 60, ouchT: 0, scratchT: 0, ouches: 0, bonuses: 0, kicks: 0, dirt: 0, wet: 0, dripT: 0, slash: [], gulp: [], flops: [], eatenFood: 0, shards: [], moth: null, mothT: grnd(2.5, 4.5), frenzyT: 0, eaten: 0, smashed: 0,
      sinkT: 0, paw: null, lean: 0, blink: 0, over: false, drops: [], specialT: grnd(10, 14), tom: null, tomT: grnd(30, 40), dog: null, dogT: grnd(16, 22), laser: null, laserT: grnd(11, 15), bestCombo: 0, ctitle: null, hairballs: 0, raids: 0,
      rStart: 0, rPen: false, perfects: 0, celeb: null, won: false, newWin: false, yawnT: 0, nipAt: 0, flea: null, fleaT: STAGE === 2 ? grnd(12, 18) : 0, itchT: 0, stripe: null };
  }
  // seconds between new things: 0.95 in round 1 down to 0.38 in round 10 (endless keeps going to about 0.24). The dog halves it.
  function spawnEvery() { return rpg("spawn", 0.24) / (S.dog ? dogX() : 1) * (S.ev && S.ev.m === "fridge" && !S.ev.done ? 0.3 : 1); }
  function isSpiky(k) { return SPIKY.indexOf(k) >= 0; }
  function patience() { return rpg("pat", 0.85); } // how long a thing sits on the bench before Basil gets bored

  function spawn(kind) {
    var free = [0, 1, 2].filter(function (i) { return !S.lanes[i] && !(S.clover && S.clover.lane === i && S.clover.state === "sit"); });
    if (!free.length) return false;
    if (!kind && S.nipAt && S.t >= S.nipAt && S.nipT <= 0) { kind = "catnip"; S.nipAt = 0; }
    // every kind of thing can turn up from round 1; the odds climb each round (RAMP)
    if (!kind && rAge() > 4 && S.nipT <= 0 && G() < 0.025) kind = "catnip";
    if (!kind && !S.lanes.some(function (l) { return l && l.kind === "hedgehog"; }) && G() < rp("hedgehog")) kind = "hedgehog";
    if (!kind && S.bonus > 0 && G() < rp("hairball")) kind = "hairball";
    if (!kind && S.bonus > 0) kind = G() < rp("bad") && !(S.ev && S.ev.m === "fridge" && !S.ev.done) ? gpick(BADFOOD) : gpick(FOOD);
    if (!kind && G() < rp("spiky")) kind = gpick(SPIKY);
    if (!kind && !S.lanes.some(function (l) { return l && l.kind === "tank"; }) && G() < rp("tank")) kind = "tank";
    if (!kind && G() < rp("tv")) kind = "tv";
    if (!kind && G() < rp("vase")) kind = "vase";
    var i = gpick(free), hv = HEAVY[kind], p = kind === "tap" || kind === "fish" ? 2.6 : isSpiky(kind) || isBad(kind) || kind === "hedgehog" ? 2.3 : hv ? hv.life : kind === "toast" ? 3 : patience();
    S.lanes[i] = { kind: kind || gpick(ITEMS), y: -40, vy: 0, landed: false, life: p, max: p, wob: rnd(0, 6) };
    if (kind === "hairball") { S.lanes[i].y = BENCH - 110; S.lanes[i].life = S.lanes[i].max = 2.4; float(180, BENCH - 150, "*hack*", "#6B5A93"); }
    if (hv) { S.lanes[i].hp = S.lanes[i].hpMax = Math.round(rnd(hv.hp[0], hv.hp[1])); S.lanes[i].hit = 0; }
    return true;
  }

  // combo streak titles
  var CTITLES = [[5, "Menace"], [10, "Agent of Chaos"], [15, "Kitchen Overlord"], [25, "Gravity’s Favourite"], [40, "Unstoppable Fluff"]];
  function comboTitle(n) { var t = ""; CTITLES.forEach(function (c) { if (n >= c[0]) t = c[1]; }); return t; }
  function comboUp() {
    S.combo = S.t - S.lastKick < 1.05 ? S.combo + 1 : 0; S.lastKick = S.t; if (S.combo > S.bestCombo) S.bestCombo = S.combo;
    CTITLES.forEach(function (c) { if (S.combo === c[0]) { S.ctitle = { t: 1.4, txt: c[1], n: c[0] + 1 }; if (c[0] >= 15) track("basil/streak-" + c[0]); } });
  }
  // ---------- input ----------
  function kick(i) {
    if (!running || paused || S.over) return;
    if (S.boss) return bossKey(i);
    if (S.towelT > 0) { float(180, BENCH - 150, "*being dried*", "#6B5A93"); return; }
    S.paw = { lane: i, t: 0 }; S.lean = (i - 1) * 0.12;
    var it = S.lanes[i];
    if (S.clover && S.clover.lane === i && S.clover.state === "sit" && !it) return swipeClover();
    if (!it) return;
    if (!it.landed) { if (it.y >= BENCH - landTol()) { it.y = BENCH; it.landed = true; } else return; }
    if (S.nipT <= 0 && Math.random() < rp("yawn")) { S.yawnT = 0.6; float(LANES[i], BENCH - 60, "*yawn*", "#6B5A93"); return; }
    if (S.itchT > 0 && Math.random() < 0.33) { float(LANES[i], BENCH - 60, "*scratch scratch*", "#6B5A93"); return; }
    if (it.kind === "hedgehog") {
      S.lanes[i] = null; S.combo = 0; S.ouchT = 0.7; S.ouches++; S.fly.push({ kind: "hedgehog", x: LANES[i], y: BENCH - 2, vx: (i - 1 || 1) * rnd(120, 180), vy: -rnd(240, 300), r: 0, vr: rnd(-8, 8) });
      float(LANES[i], BENCH - 60, s2("Hedgehog!", "Echidna!"), "#C2553A"); toast(pick(HEDGEQ)); shake(); loseLife(); return;
    }
    if (it.hp) {
      comboUp();
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
    if (it.kind === "catnip") { float(LANES[i], BENCH - 70, "CATNIP!", "#2E7D6B"); return nip(); }
    if (it.kind === "hairball") { S.hairballs++; addPts(U()); float(LANES[i], BENCH - 60, "Binned +" + fmt(U()), "#2E7D6B"); S.fly.push({ kind: "hairball", x: LANES[i], y: BENCH - 2, vx: (i - 1 || 1) * rnd(160, 240), vy: -rnd(220, 300), r: 0, vr: rnd(-9, 9) }); if (Math.random() < 0.4) toast(pick(["Hairball removed. You’re a hero. A gross hero.", "Disposed of. Wash your hands.", "Clover: ‘You’re welcome.’"])); return; }
    if (S.bonus > 0 && (FOOD.indexOf(it.kind) >= 0 || isBad(it.kind) || it.kind === "toast")) return eatFood(it, i);
    if (it.kind === "toast") { // butter side down, always
      S.butterT = 7; S.combo = 0; S.rPen = true; shake(); S.fly.push({ kind: "toast", x: LANES[i], y: BENCH - 2, vx: (i - 1 || 1) * rnd(120, 180), vy: -rnd(200, 260), r: 0, vr: 7.5 });
      float(LANES[i], BENCH - 60, "Butter side down!", "#C2553A"); toast("Toast kicked. Butter side down. The bench is a slip ’n’ slide for 7 s.", 2200); return;
    }
    var dir = i === 0 ? -1 : i === 2 ? 1 : (Math.random() < .5 ? -1 : 1);
    S.fly.push(S.bonus > 0 ? { kind: it.kind, x: LANES[i], y: BENCH - 2, vx: dir * rnd(300, 380), vy: -rnd(90, 140), r: 0, vr: dir * rnd(3, 6) } : { kind: it.kind, x: LANES[i], y: BENCH - 2, vx: dir * rnd(110, 210), vy: -rnd(240, 320), r: 0, vr: dir * rnd(6, 11) });
    if (isSpiky(it.kind)) {
      S.combo = 0; S.ouchT = 0.7; S.ouches++; float(LANES[i], BENCH - 60, "Ouch!", "#C2553A"); toast(pick(OUCHQ)); shake();
      hurt("b", 20);
      return;
    }
    if (it.kind === "tap") { sinkTime(); return; }
    if (it.kind === "fish") { heal(S.bonus > 0 ? "c" : "b", 25); float(LANES[i], BENCH - 60, "+25% health", "#E05A8A"); toast(s2("Fish acquired. Briefly nice.", "Heat pack. Toasty. Briefly nice.")); return; }
    if (S.bonus > 0) { S.slash.push({ x: LANES[i], y: BENCH - 22, l: 0.35 }); }
    comboUp();
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
    comboUp();
    var mult = Math.min(4, 1 + Math.floor(S.combo / 3)) * (S.frenzyT > 0 ? 2 : 1) * U();
    addPts(mult); S.eatenFood++; float(LANES[i], BENCH - 60, "+" + fmt(mult) + " " + pick(NOMQ), "#B07A0C");
    if (Math.random() < (it.kind === "steak" || it.kind === "drumstick" || it.kind === "catfood" ? 0.6 : 0.3)) { S.happyT = 1; float(180 + rnd(-30, 30), BENCH - 170, pick(["\u2665", "\u2665 purr", "\u2665 yum"]), "#E05A8A"); }
  }
  // health: Basil and Clover each have a bar (0-100). Only the cat on the bench takes damage; the resting one recovers.
  // campaign: each life is a full health bar; at 0% you lose a life and both bars refill. Last life gone = game over.
  function hurt(who, amt) {
    S.rPen = true;
    if (who === "b") S.hb = Math.max(0, S.hb - amt); else S.hc = Math.max(0, S.hc - amt);
    S.fx.push({ x: who === "b" ? 40 : W - 40, y: 70, txt: "-" + amt + "%", col: "#C2553A", l: 1 });
    if ((who === "b" ? S.hb : S.hc) <= 0) { if (CAMP && S.lives > 1) { S.hb = S.hc = 100; return loseLife(true); } end(); return true; }
    return false;
  }
  function loseLife(refilled) {
    S.rPen = true;
    if (!CAMP) return hurt(S.bonus > 0 ? "c" : "b", 34);
    S.lives--; if (S.lives <= 0) { S.lives = 0; end(); return true; }
    S.ann = { t: 1.4, a: refilled ? "OUT OF PUFF" : "LIFE LOST", b: S.lives === 1 ? "1 LEFT" : S.lives + " LEFT" }; shake();
    if (refilled) toast(pick(["Health gone. A life spent, a bar refilled.", "That one cost a life. Fresh bar, same cat."]));
    return false;
  }
  function heal(who, amt) { if (who === "b") S.hb = Math.min(100, S.hb + amt); else S.hc = Math.min(100, S.hc + amt); S.fx.push({ x: who === "b" ? 40 : W - 40, y: 70, txt: "+" + amt + "%", col: "#2E7D6B", l: 1 }); }
  function shoo() {
    var b = S.sneak; if (!b || b.phase !== "creep") return false;
    b.phase = "flee"; addPts(2 * U()); S.fx.push({ x: b.x, y: BENCH - 70, txt: "Shoo! +" + fmt(2 * U()), col: "#2B5E80", l: 1 }); toast("Basil shooed back to the sink. He’ll be back.");
    return true;
  }
  // Bonus treat: dropped next to the resting cat. Grab it fast (tap, or the key on that side) before they do.
  function grabTreat() {
    var t = S.treat; if (!t || !t.landed || t.done) return false;
    t.done = "you"; t.fade = 0.35; addPts(5 * U()); float(t.x, BENCH - 60, "Snatched! +" + fmt(5 * U()), "#B07A0C");
    toast(t.side > 0 ? pick(["Stolen from under Clover’s nose.", "Clover’s steak? Not any more.", "Daylight robbery. Delicious."]) : pick(["Nicked before Basil could kick it.", "Basil’s loss. Clover’s gain.", "Fastest paw in the kitchen."]));
    return true;
  }
  // ---------- night, zoomies, catnip and the rainbow butterfly ----------
  function isNight() { if (CAMP) return [4, 5, 9, 10].indexOf(S.round) >= 0; return S.round >= 4 && ((S.round - 4) % 5 === 0 || (S.round - 4) % 5 === 1); } // rounds 4-5, 9-10, 14-15…: one Clover and one Basil round each night
  function topAction() { if (S.boss) { var ba = S.boss.atk; if (ba && ba.kind === "suck" && ba.ph === "go") return bossResist(); if (ba && ba.kind === "scratch" && ba.ph !== "stun") return bossScratchTap(); if (ba && ba.kind === "cone" && ba.ph === "go") return bossConeSwat(); return grabFood(); } if (S.tom && !S.tom.done) return hissTom(); if (S.dog && !S.dog.gone) return hissDog(); if (S.zoom && !S.zoom.hit) return swipeZoom(); if (S.rb && !S.rb.caught) return catchRainbow(); if (S.laser && !S.laser.done) return zapLaser(); if (S.flea && !S.flea.done) return fleaTap(); return eatMoth(); }
  // the Vet: a flea swarm hops across. Tap it 3 times; let it go and you're itchy (some taps miss) for 5 s.
  function fleaTap() {
    var f = S.flea; if (!f || f.done) return false; f.hits++; float(f.x, f.y - 30, f.hits + "/3", "#C2553A");
    if (f.hits >= 3) { f.done = 0.4; var pts = 4 * U(); addPts(pts); float(f.x, f.y - 48, "Fleas flicked! +" + fmt(pts), "#2E7D6B"); toast(pick(["Fleas flicked. Itch-free. For now.", "Flea swarm dispersed. Very hygienic.", "Three flicks. Zero fleas. Clinic standard."])); track("basil/fleas"); }
    return true;
  }
  // ---------- visitors: the stray tom (turf war), the dog at the window, the laser dot ----------
  function hissTom() {
    var tm = S.tom; if (!tm || tm.done) return false; tm.hits++; tm.hitT = 0.25; shake();
    float(281, 130, "HISS! " + tm.hits + "/3", "#C2553A");
    if (tm.hits >= 3) { tm.done = "flee"; tm.doneT = 0.4; var pts = 6 * U(); addPts(pts); float(281, 150, s2("Turf defended +", "Stare-off won +") + fmt(pts), "#2E7D6B"); toast(pick(s2(["The stray has left. Turf secured.", "Neighbour cat: evicted.", "Get off our bench. And our lawn."], ["Stare-off won. The ginger patient looked away first.", "He’s been called in. Good luck to the vet.", "Out-glared. Cone and all."]))); track("basil/tom-win"); }
    return true;
  }
  // the dog: barks at the window and the whole kitchen shakes: everything falls 2x as fast and arrives 2x as often until the bar runs out.
  // Tap the dog (or up / W) and Basil hisses it away early, for points.
  function startDog() {
    var d = Math.round(rp("dogT")); S.dog = { t: d, dur: d, k: 0, gone: 0 }; shake(); track("basil/dog");
    if (!S.dogSeen) { S.dogSeen = 1; toast(s2("The dog! Everything shakes and falls twice as fast. Tap the dog to hiss it off.", "The cockatoo! SQUAWK: everything falls twice as fast. Tap it to hiss it off."), 3000); }
    else toast(pick(s2(["WOOF. Everything’s wobbling. Including Basil.", "The dog. Panic stations. Tap him to hiss him off.", "Bark attack. 2× speed. Or tap the dog."], ["SQUAWK. Everything’s wobbling. Including the vet.", "The cockatoo. Panic stations. Tap it to hiss it off.", "Screech attack. 2× speed. Or tap the bird."])));
  }
  function hissDog() {
    var dg = S.dog; if (!dg || dg.gone) return false; dg.gone = 0.45; dg.t = Math.min(dg.t, 0.45); var pts = 3 * U(); addPts(pts); shake();
    float(281, 150, "HISS! +" + fmt(pts), "#2E7D6B"); toast(pick(s2(["Basil hissed. The dog has left the chat.", "One hiss. Dog gone. Respect.", "Dog dismissed. Basil remains smug."], ["Basil hissed. The cockatoo has flounced off.", "One hiss. Bird gone. Feathers everywhere.", "Cockatoo dismissed. Basil remains smug."]))); track("basil/dog-hiss");
    return true;
  }
  function tomRaid() {
    var tm = S.tom; tm.done = "raid"; tm.doneT = 0.6; shake(); S.combo = 0; S.raids++;
    for (var j = 0; j < 3; j++) { var o = S.lanes[j]; if (o && !o.hp && o.kind !== "tap" && o.kind !== "fish") { S.lanes[j] = null; S.fly.push({ kind: o.kind, x: LANES[j], y: BENCH - 2, vx: (j - 1 || 1) * rnd(200, 300), vy: -rnd(200, 280), r: 0, vr: rnd(-9, 9) }); } }
    S.slash.push({ x: 180, y: BENCH - 60, l: 0.5 }); float(180, BENCH - 130, "Raided!", "#C2553A");
    toast(pick(s2(["The stray raided the bench. No points for you.", "Turf lost. He took the good stuff.", "The neighbour cat wins this one. Smug git."], ["The ginger patient raided the table. Cone and all.", "Stare-off lost. He took the good stuff.", "The cat in the cone wins this one. Smug git."])));
    hurt(S.bonus > 0 ? "c" : "b", 15);
  }
  function zapLaser() {
    var lz = S.laser; if (!lz || lz.done) return false; lz.hits++; lz.jt = 0; float(lz.x, lz.y - 16, lz.hits + "/3", "#C2553A");
    if (lz.hits >= 3) { lz.done = 0.4; var pts = 5 * U(); addPts(pts); float(lz.x, lz.y - 34, "Got the dot! +" + fmt(pts), "#B5308A"); toast(pick(s2(["Caught the red dot. First cat in history.", "The dot has been dealt with.", "Laser: pounced. Owner: impressed."], ["Caught the pen-torch dot. Pupils: fine.", "The dot has been dealt with.", "Pen torch: pounced. Vet: impressed."]))); track("basil/laser"); }
    return true;
  }
  function swipeZoom() {
    var z = S.zoom; if (!z || z.hit) return false; z.hit = 0.5; var pts = 4 * U(); addPts(pts);
    float(z.x, z.y - 30, "Zoomie swiped! +" + fmt(pts), "#B5308A"); toast(pick(["Caught mid-zoomie. Rude, but effective.", "Zoomies interrupted. Points awarded.", "3am energy, at any hour."])); track("basil/zoomie");
    return true;
  }
  function catchRainbow() {
    var r = S.rb; if (!r || r.caught) return false; r.caught = 0.5; shake();
    var good = S.bonus > 0 ? FOOD : ITEMS.filter(function (k) { return !isSpiky(k); });
    for (var q = 0; q < 20; q++) S.rain.push({ kind: pick(good), x: rnd(18, W - 18), y: -rnd(20, 360), vy: rnd(0, 80), landed: false, t: 0, r: rnd(-0.4, 0.4) });
    S.ann = { t: 1.6, a: s2("RAINBOW!", "BUBBLE POP!"), b: "x20" }; toast(pick(s2(["The rare one! It’s raining treats.", "Rainbow butterfly. Jackpot.", "Twenty things just fell from the sky. Don’t ask."], ["The rare one! Rainbow bubble popped.", "Bubble popped. It’s raining treats.", "Twenty things just fell from the sky. Don’t ask."]))); track("basil/rainbow");
    return true;
  }
  function nip() {
    S.nipT = 8; S.nips++; shake(); S.ann = { t: 1.4, a: "CATNIP!", b: "WHEEE" };
    toast(S.bonus > 0 ? pick(["Clover found the catnip. Chaos is the plan now.", "Catnip. She’s seeing colours."]) : pick(["Basil found the catnip. Everything is hilarious.", "Catnip. Auto-kick engaged. Good luck, mugs."])); track("basil/catnip");
  }
  // ---------- boss: the VAC-3000 robot vacuum (round 5, the end of the round 10 finale, and every 5th round in endless) ----------
  // It roams the bench with glowing weak spots to hit. Every few seconds it attacks, telegraphed:
  //  CHARGE: glows red and revs, then dashes at one cat. Tap that cat (or its side key) to jump. Hit = -22% health.
  //  SUCTION: intake glows, then it sucks one cat (tail first) towards it. Tap fast to hold on. Sucked in = -25% health.
  // Both end with it stunned and its CORE exposed (big damage). It also eats the food Clover needs. At half health it gets ANGRY.
  var BOSS_ON = true;
  var SPOTS = ["BRUSH", "SENSOR", "DUST BIN"], BHOME = { b: 46, c: W - 46 };
  function startBoss(final) {
    if (!final) S.round++;
    S.bosses = (S.bosses || 0) + 1; S.bonus = 0; S.flea = null; S.itchT = 0; S.sneak = null; S.treat = null; S.clover = null; S.dog = null; S.tom = null; S.laser = null; S.zoom = null; S.nipT = 0; S.ev = null; S.butterT = S.towelT = 0;
    var hpMax = STAGE === 2 ? (final ? 60 : CAMP ? 40 : 30 + 8 * S.bosses) : final ? 50 : CAMP ? 36 : 28 + 8 * S.bosses;
    S.boss = { final: !!final, hp: hpMax, hpMax: hpMax, t: final ? 0 : 45, x: 180, vx: 38, face: 1, spot: null, spotT: 1.0, hits: 0, hitT: 0, dent: 0, done: null, doneT: 0, angry: false,
      atk: null, atkT: final ? 2.4 : 3.4, n: 0, flash: 0, food: null, foodT: grnd(3, 5), tips: {}, cats: { b: { jt: 0, pull: 0, hurtT: 0, gone: 0, coneT: 0 }, c: { jt: 0, pull: 0, hurtT: 0, gone: 0, coneT: 0 } }, coneT: 0, nurse: STAGE === 2 && final ? { towels: 3, gone: 0, leave: 0 } : null };
    for (var j = 0; j < 3; j++) { var o = S.lanes[j]; if (o && o.kind !== "tank") { S.fly.push({ kind: o.kind, x: LANES[j], y: BENCH - 2, vx: (j - 1 || 1) * rnd(200, 300), vy: -rnd(160, 240), r: 0, vr: rnd(-8, 8) }); } S.lanes[j] = null; }
    if (STAGE === 2) { S.ann = final ? { t: 1.8, a: "THE VET’S BACK. WITH A NURSE", b: "FINAL!" } : { t: 1.8, a: "ROUND " + S.round, b: "VET!" }; shake();
      toast(final ? "Dr Pokesworth is back, and Nurse Burrito brought towels. Beat them to win." : pick(["Dr Pokesworth will see you now. Hit the glowing spots.", "The vet is in. Both cats, positions.", "Annual check-up. Fight it. Hit the glowing spots."]), 2600); track("basil/boss"); return; }
    S.ann = final ? { t: 1.8, a: "IT’S BACK. FINAL BOSS", b: "VAC-3000" } : { t: 1.8, a: "ROUND " + S.round, b: "BOSS!" }; shake();
    toast(final ? "The VAC-3000 is back for revenge. Beat it to win." : pick(["VAC-3000 has entered the kitchen. Hit the glowing spots.", "The vacuum is here. Both cats, positions.", "It sucks. Literally. Hit the glowing spots."]), 2600); track("basil/boss");
  }
  function bossSpot() { var b = S.boss; b.spot = { lane: Math.floor(Math.random() * 3), t: b.angry ? rnd(0.85, 1.1) : rnd(1.2, 1.5), name: "" }; b.spot.name = SPOTS[b.spot.lane]; }
  function spotXY(b) { if (STAGE === 2 && V) return V.spotXY(b); var s = b.spot; if (s.core) return { x: b.x, y: BENCH - 30 }; return { x: b.x + (s.lane - 1) * 42, y: s.lane === 1 ? BENCH - 50 : BENCH - 24 }; }
  function bossBurst(x, y, n, sp) { for (var q = 0; q < n; q++) S.shards.push({ x: x + rnd(-14, 14), y: y + rnd(-8, 8), vx: rnd(-sp, sp), vy: -rnd(120, 280), r: 0, vr: rnd(-8, 8), l: 0.8, s: rnd(3, 6), c: pick(["#3C4250", "#59606F", "#E0A21E", "#AEB8C0"]) }); }
  function bossHit(i) {
    var b = S.boss; if (!b || b.done) return;
    S.paw = { lane: i, t: 0 };
    if (b.spot && b.spot.lane === i) {
      var core = b.spot.core, dmg = (core ? 6 : i === 2 ? 1 : 2) * (S.frenzyT > 0 ? 2 : 1); // Basil (left, middle) hits hard; Clover (right) is quick: her spots come back faster
      var p0 = spotXY(b); b.hp = Math.max(0, b.hp - dmg); b.hits++; b.hitT = 0.25; b.dent = Math.min(1, b.dent + (core ? 0.15 : 0.05));
      var pts = (core ? 3 : 2) * U() * dmg; addPts(pts); float(p0.x, p0.y - 30, (core ? "CRACK! +" : dmg > 1 ? "WHACK! +" : "Swipe! +") + fmt(pts), core ? "#B5308A" : i === 2 ? "#B5308A" : "#2B5E80");
      bossBurst(p0.x, p0.y, core ? 14 : 6, core ? 240 : 160); if (core) shake();
      b.spot = null; b.spotT = i === 2 ? rnd(0.15, 0.35) : rnd(0.3, 0.6);
      if (b.hp <= 0) return bossWin();
      if (!b.angry && b.hp <= b.hpMax / 2) bossAngry();
    } else if (b.spot && !b.spot.core) {
      float(LANES[i], BENCH - 110, "Wrong spot", "#6B5A93"); hurt(i === 2 ? "c" : "b", 3);
    }
  }
  function bossAngry() {
    var b = S.boss; b.angry = true; b.flash = 0.3; b.atkT = Math.min(b.atkT, 1.6); shake();
    S.ann = { t: 1.4, a: s2("VAC-3000 IS", "DR POKESWORTH IS"), b: s2("ANGRY!", "FRAZZLED!") }; toast(s2("Half health. It’s gone red and it’s faster. Rude.", "Half health. Glasses askew, coffee spilt, and faster now. Rude."), 2200);
  }
  function bossJump(w) { var b = S.boss, c = b.cats[w]; if (c.jt > 0 || c.gone > 0) return false; c.jt = 1.25; float(BHOME[w], BENCH - 120, "JUMP!", "#2E7D6B"); return true; }
  function bossResist() { var b = S.boss, a = b.atk, c = b.cats[a.side < 0 ? "b" : "c"]; c.pull = Math.max(0, c.pull - 0.085); a.taps = (a.taps || 0) + 1; S.paw = { lane: a.side < 0 ? 0 : 2, t: 0 }; return true; }
  function grabFood() {
    var b = S.boss, f = b && b.food; if (!f || !f.landed) return false;
    b.food = null; b.foodT = grnd(3.5, 6); var pts = 3 * U(); addPts(pts); heal("c", 10); S.eatenFood++;
    S.gulp.push({ kind: f.kind, x: f.x, y: BENCH, t: 0, tx: W - 46, ty: BENCH - 70 }); float(f.x, BENCH - 60, "Clover’s! +" + fmt(pts), "#B07A0C");
    return true;
  }
  function bossTap(x, y) {
    var b = S.boss, a = b.atk; if (b.done || S.ann && S.ann.t > 0) return;
    if (a && a.kind === "suck" && a.ph === "go") return bossResist();
    if (a && a.kind === "charge" && a.ph !== "stun") return bossJump(x < 180 ? "b" : "c");
    if (a && a.kind === "scratch" && a.ph !== "stun") return bossScratchTap();
    if (a && a.kind === "cone" && a.ph === "go") { var cp = conePos(b, a); if (Math.hypot(x - cp.x, y - cp.y) < 46) bossConeSwat(); return; }
    if (b.food && b.food.landed && Math.abs(x - b.food.x) < 38 && y > BENCH - 75 && y < BENCH + 24) return grabFood();
    if (b.spot) { var p = spotXY(b); if (Math.hypot(x - p.x, y - p.y) < (b.spot.core ? 48 : 36)) return bossHit(b.spot.lane); }
  }
  function bossKey(i) {
    var b = S.boss, a = b.atk; if (b.done || S.ann && S.ann.t > 0) return;
    if (a && a.kind === "suck" && a.ph === "go") return bossResist();
    if (a && a.kind === "charge" && a.ph !== "stun") { if (i !== 1) bossJump(i === 0 ? "b" : "c"); return; }
    if (a && a.kind === "scratch" && a.ph !== "stun") return bossScratchTap();
    if (a && a.kind === "cone" && a.ph === "go") return bossConeSwat();
    bossHit(b.spot && b.spot.core ? 1 : i);
  }
  function bossAttack() {
    var b = S.boss, side = Math.random() < 0.5 ? -1 : 1, kind = b.n === 0 ? "charge" : b.n === 1 ? "suck" : Math.random() < (b.last === "charge" ? 0.35 : 0.65) ? "charge" : "suck";
    if (STAGE === 2) { var ks = ["charge", "suck", "scratch", "cone"]; kind = b.n < 4 ? ks[b.n] : pick(ks.filter(function (k) { return k !== b.last; })); }
    b.n++; b.last = kind; b.spot = null; b.face = side;
    var warn = kind === "charge" ? (b.angry ? 0.7 : 1.0) : kind === "scratch" ? (b.angry ? rnd(1.0, 1.5) : rnd(1.3, 1.9)) : kind === "cone" ? (b.angry ? 0.6 : 0.8) : (b.angry ? 0.6 : 0.9);
    b.atk = { kind: kind, side: side, ph: "warn", t: warn, max: warn, hit: false, taps: 0, fake: kind === "scratch" && Math.random() < 0.3, p: 0 };
    if (!b.tips[kind]) { b.tips[kind] = 1; var who0 = side < 0 ? "Basil" : "Clover";
      toast(STAGE === 2 ? { charge: "Thermometer lunge! Tap " + who0 + " to jump over it.", suck: "Towel burrito! Tap like mad to wriggle out.", scratch: "“Just a little scratch…” Freeze. Tap only when it says BOLT.", cone: "Cone toss! Tap the cone in the air to send it back." }[kind]
        : kind === "charge" ? "It’s revving up! Tap " + who0 + " to jump over it." : "Suction! Tap like mad to hold on.", 2200); }
  }
  // the Vet only: "just a little scratch" (nothing is ever shown landing) and the cone toss
  function bossAtkDone() { var b = S.boss; b.atk = null; b.spot = null; b.spotT = 0.3; b.atkT = (b.angry ? rnd(2.4, 3.2) : rnd(3.6, 4.6)) * (b.nurse && !b.nurse.gone ? 0.8 : 1); }
  function bossScratchTap() {
    var b = S.boss, a = b && b.atk; if (!a || a.kind !== "scratch" || a.ph === "stun") return false;
    if (a.ph === "go") { var pts = 3 * U(); addPts(pts); float(BHOME[a.side < 0 ? "b" : "c"], BENCH - 140, "BOLTED! +" + fmt(pts), "#2E7D6B"); bossStun(b.angry ? 1.3 : 1.6, "DROPPED IT!"); toast(pick(["Under the table before he got to 1. He dropped whatever it was.", "Bolted. He’s rattled. Smash the treat pocket."])); }
    else bossScratchFail("FLINCHED!");
    return true;
  }
  function bossScratchFail(why) { var b = S.boss, w0 = b.atk.side < 0 ? "b" : "c"; bossAtkDone(); toast(pick(["Vaccinated. Annoyingly healthy.", "Caught. Vaccinated. The vet looks very pleased with himself.", "Up to date on everything now. Furious about it."]), 2000); bossCatHit(w0, 12, why + " -12%"); }
  function conePos(b, a) {
    var vx = V ? V.vetX(b) : 180, sx = vx + a.side * 40, sy = BENCH - 202, ex = BHOME[a.side < 0 ? "b" : "c"], ey = BENCH - 66;
    if (a.ph === "back") { var q = Math.min(1, a.p); return { x: ex + (vx - ex) * q, y: ey + (BENCH - 186 - ey) * q - Math.sin(q * Math.PI) * 50 }; }
    var p = Math.min(1, a.p); return { x: sx + (ex - sx) * p, y: sy + (ey - sy) * p - Math.sin(p * Math.PI) * 60 };
  }
  function bossConeSwat() { var b = S.boss, a = b && b.atk; if (!a || a.kind !== "cone" || a.ph !== "go") return false; var cp = conePos(b, a); a.ph = "back"; a.p = 0; S.paw = { lane: a.side < 0 ? 0 : 2, t: 0 }; float(cp.x, cp.y - 24, "SWAT!", "#2E7D6B"); return true; }
  function bossStun(t, why) { var b = S.boss; b.atk.ph = "stun"; b.atk.t = t; b.spot = { lane: 1, t: t, core: true, name: "CORE" }; float(STAGE === 2 && V ? V.vetX(b) : b.x, STAGE === 2 ? BENCH - 214 : BENCH - 96, why, "#B5308A"); }
  function bossCatHit(w, amt, txt) {
    var b = S.boss, c = b.cats[w]; c.hurtT = 0.7; S.ouchT = 0.5; float(BHOME[w], BENCH - 110, txt, "#C2553A"); shake(); S.combo = 0;
    return hurt(w, amt);
  }
  function bossStep(dt) {
    var b = S.boss, a = b.atk, sp = b.angry ? 1.75 : 1;
    if (b.flash > 0) b.flash -= dt;
    if (b.done) { b.doneT -= dt; if (b.doneT <= 0) bossEnd(); return; }
    if (S.ann && S.ann.t > 0) return;
    if (!b.final) b.t -= dt;
    if (b.hitT > 0) b.hitT -= dt;
    if (b.coneT > 0) b.coneT -= dt; if (b.nurse && b.nurse.gone) b.nurse.leave = Math.min(1.2, b.nurse.leave + dt * 1.2);
    ["b", "c"].forEach(function (w) { var c = b.cats[w]; if (c.coneT > 0) c.coneT -= dt; if (c.jt > 0) c.jt -= dt; if (c.hurtT > 0) c.hurtT -= dt; if (c.gone > 0) c.gone -= dt; if (!a || a.kind !== "suck" || a.ph !== "go") c.pull = Math.max(0, c.pull - dt * 2.5); });
    if (!a) {
      b.x += b.vx * sp * dt; if (b.x > 222 && b.vx > 0 || b.x < 138 && b.vx < 0) b.vx *= -1; if (b.x > 232 || b.x < 128) b.x = Math.max(128, Math.min(232, b.x)); b.face = b.vx > 0 ? 1 : -1;
      if (!b.spot) { b.spotT -= dt; if (b.spotT <= 0) bossSpot(); }
      else { b.spot.t -= dt; if (b.spot.t <= 0) { b.spot = null; b.spotT = rnd(0.2, 0.45); } }
      b.atkT -= dt; if (b.atkT <= 0) bossAttack();
    } else if (a.kind === "charge") {
      var cw = a.side < 0 ? "b" : "c", cx = BHOME[cw];
      if (a.ph === "warn") { a.t -= dt; if (a.t <= 0) { a.ph = "go"; shake(); } }
      else if (a.ph === "go") {
        b.x += a.side * (b.angry ? 660 : 540) * dt;
        if (!a.hit && Math.abs(b.x - cx) < 74) { a.hit = true;
          if (b.cats[cw].jt > 0) { var dp = 3 * U(); addPts(dp); float(cx, BENCH - 150, "Dodged! +" + fmt(dp), "#2E7D6B"); }
          else if (bossCatHit(cw, 22, "SMACK! -22%")) return; }
        var stop = a.side < 0 ? 88 : W - 88; if (a.side < 0 ? b.x <= stop : b.x >= stop) { b.x = stop; shake(); bossStun(b.angry ? 1.3 : 1.6, "BONK! Stunned"); }
      } else { a.t -= dt; if (a.t <= 0) { b.atk = null; b.spot = null; b.spotT = 0.3; b.atkT = b.angry ? rnd(2.4, 3.2) : rnd(3.6, 4.6); if (b.nurse && !b.nurse.gone) b.atkT *= 0.8; b.vx = (b.x < 180 ? 1 : -1) * 38; } }
    } else if (a.kind === "scratch") {
      if (a.ph === "warn") { a.t -= dt; if (a.t <= 0) { if (a.fake) { a.ph = "fake"; a.t = 0.7; a.fake = false; } else { a.ph = "go"; a.t = b.angry ? 0.6 : 0.85; } } }
      else if (a.ph === "fake") { a.t -= dt; if (a.t <= 0) { a.ph = "go"; a.t = b.angry ? 0.6 : 0.85; } }
      else if (a.ph === "go") { a.t -= dt; if (a.t <= 0) { bossScratchFail("TOO SLOW!"); if (S.over) return; } }
      else { a.t -= dt; if (a.t <= 0) bossAtkDone(); }
    } else if (a.kind === "cone") {
      if (a.ph === "warn") { a.t -= dt; if (a.t <= 0) { a.ph = "go"; a.p = 0; a.dur = b.angry ? 0.85 : 1.1; } }
      else if (a.ph === "go") { a.p += dt / a.dur; if (a.p >= 1) { var cw2 = a.side < 0 ? "b" : "c"; b.cats[cw2].coneT = 3; bossAtkDone(); toast(pick(["Coned. The cone of shame has claimed another.", "Cone on. Dignity off."])); if (bossCatHit(cw2, 12, "CONED! -12%")) return; } }
      else if (a.ph === "back") { a.p += dt / 0.4; if (a.p >= 1) { b.coneT = b.angry ? 1.3 : 1.6; var cpt = 2 * U(); addPts(cpt); bossStun(b.coneT, "CONED HIMSELF! +" + fmt(cpt)); } }
      else { a.t -= dt; if (a.t <= 0) bossAtkDone(); }
    } else { // suction
      var sw = a.side < 0 ? "b" : "c", sc = b.cats[sw];
      if (a.ph === "warn") { a.t -= dt; if (a.t <= 0) { a.ph = "go"; a.t = b.angry ? 3.6 : 3.2; } }
      else if (a.ph === "go") {
        a.t -= dt; sc.pull += (b.angry ? 0.72 : 0.6) * dt;
        if (sc.pull >= 1) { sc.pull = 0; sc.gone = 0.9; b.hp = Math.min(b.hpMax, b.hp + 2); b.atk = null; b.atkT = b.angry ? 2.4 : 3.4; b.spotT = 0.6; if (bossCatHit(sw, 25, s2("SUCKED IN! -25%", "BURRITO’D! -25%"))) return; toast(STAGE === 2 ? (sw === "b" ? "Basil got towel-burrito’d. Furious. Fluffy. Furious." : "Clover got towel-burrito’d. She’ll be complaining for weeks.") : sw === "b" ? "Basil got sucked up. He’s fine. Mostly fur." : "Clover got sucked up. She’ll be complaining for weeks.", 2000); }
        else if (a.t <= 0) { sc.pull = 0; var rp0 = 2 * U(); addPts(rp0); float(BHOME[sw], BENCH - 130, s2("Held on! +", "Wriggled free! +") + fmt(rp0), "#2E7D6B"); bossStun(b.angry ? 1.3 : 1.6, s2("OVERHEATED!", "TANGLED IN TOWEL!"));
          var nr = b.nurse; if (nr && !nr.gone && a.side > 0) { nr.towels--; float(300, BENCH - 180, "Towel wasted!", "#7A3FB5"); if (nr.towels <= 0) { nr.gone = 1; var np = 10 * U(); addPts(np); float(240, BENCH - 150, "Nurse clocked off +" + fmt(np), "#2E7D6B"); toast("Nurse Burrito is out of clean towels. She’s clocked off.", 2400); } } }
      } else { a.t -= dt; if (a.t <= 0) { b.atk = null; b.spot = null; b.spotT = 0.3; b.atkT = b.angry ? rnd(2.4, 3.2) : rnd(3.6, 4.6); } }
    }
    // food drops on the bench: Clover wants it, and so does the vacuum
    var f = b.food;
    if (!f) { b.foodT -= dt; if (b.foodT <= 0) b.food = { kind: gpick(FOOD), x: b.x < 180 ? rnd(212, 268) : rnd(92, 148), y: -30, vy: 0, landed: false, life: 5 }; }
    else if (!f.landed) { f.vy += 1400 * dt; f.y += f.vy * dt; if (f.y >= BENCH) { f.y = BENCH; f.landed = true; } }
    else {
      f.life -= dt; var ab = b.atk;
      if (ab && ab.kind === "suck" && ab.ph === "go") f.x += (b.x + ab.side * 40 - f.x) * Math.min(1, dt * 2.2);
      if (Math.abs(f.x - b.x) < 48 && !(ab && ab.ph === "stun")) { b.food = null; b.foodT = grnd(3.5, 6); b.hp = Math.min(b.hpMax, b.hp + 2); float(f.x, BENCH - 70, s2("It ate Clover’s snack!", "Confiscated! ‘Not on her diet.’"), "#C2553A"); if (hurt("c", 8)) return; }
      else if (f.life <= 0) { b.food = null; b.foodT = grnd(3, 5); }
    }
    if (!b.final && b.t <= 0) { S.rPen = true; b.done = "lose"; b.doneT = 1.6; b.atk = null; b.spot = null; S.ann = { t: 1.6, a: "TIME!", b: s2("IT WON", "THE VET WON") }; toast(pick(s2(["The vacuum wins this round. It ate the bonus.", "VAC-3000 survives. For now.", "Retreat! Regroup! Snacks!"], ["The vet wins this round. Next appointment in 12 months.", "Dr Pokesworth survives. For now.", "Retreat! Regroup! Snacks!"]))); }
  }
  function bossWin() {
    var b = S.boss; b.done = "win"; b.doneT = 2.8; b.atk = null; b.spot = null; b.flash = 0.35; var prize = (b.final ? 40 : 25) * U(); addPts(prize);
    // the big one: dust cloud, flying parts, a ring
    var q0 = quiet() ? 0.4 : 1;
    for (var q = 0; q < 46 * q0; q++) S.dust.push({ x: b.x + rnd(-50, 50), y: BENCH - 24 + rnd(-16, 12), vx: rnd(-190, 190), vy: rnd(-170, -10), r: rnd(9, 18), gr: rnd(22, 50), l: rnd(1.1, 2.0), m: 2, c: pick(["#B8B0A4", "#A39A8E", "#CFC7BB", "#8E867B"]) });
    (STAGE === 2 ? ["wheel", "wheel", "wheel", "brush", "brush", "brush", "cap", "lid", "bump", "led", "led", "wheel", "brush", "brush"] : ["wheel", "wheel", "brush", "brush", "cap", "lid", "led", "bump", "screw", "screw", "screw", "screw", "screw", "screw"]).forEach(function (k) { S.parts.push({ kind: k, x: b.x + rnd(-40, 40), y: BENCH - 30, vx: rnd(-280, 280), vy: -rnd(260, 520), r: 0, vr: rnd(-14, 14), l: 2.6 }); });
    bossBurst(b.x, BENCH - 30, 30, 300); S.ring = { x: b.x, y: BENCH - 26, t: 0 };
    var c2 = null; if (CAMP && !b.final && S.lives < 3) { S.lives++; c2 = "+1 LIFE · +30% HEALTH"; }
    S.ann = { t: 1.8, a: s2("VACUUM DOWN", "VET GIVES UP"), b: "+" + fmt(prize), c: c2 || "+30% HEALTH BOTH CATS" }; shake(); heal("b", 30); heal("c", 30);
    toast(pick(s2(["Vacuum destroyed. The cats will be insufferable now.", "VAC-3000: deceased. Dust everywhere. Worth it.", "Boss down. Somebody call the warranty line."], ["Dr Pokesworth gives up. ‘Same time next year?’ No.", "The vet has left the consult. Paperwork everywhere.", "Boss down. Off for a long lie-down."])), 2400); track("basil/boss-win");
  }
  function bossEnd() {
    var fin = S.boss.final; S.boss = null; S.treatT = grnd(8, 14); S.spawnT = 1.6;
    if (CAMP) return campNext();
    if (S.round % 2 === 1) { S.round++; S.bonus = ROUND; S.bonuses++; S.ann = { t: 1.8, a: "ROUND " + S.round, b: "NOM!" }; S.cloverT = grnd(12, 16); S.sneakT = grnd(6, 9); toast("Clover’s turn. She’s been waiting."); }
    else { S.round++; S.roundT = ROUND; S.ann = { t: 1.8, a: "ROUND " + S.round, b: "KICK!" }; toast("Back to the bench. Basil missed you."); }
    return fin;
  }
  // a round robot vacuum: squat disc, rubber bumper, spinning side brushes, scanning LED eye, lidar turret, suction intake
  function vacuum(b) {
    var a = b.atk, t = S.t, ang = b.angry, warn = a && a.ph === "warn", stun = a && a.ph === "stun", suck = a && a.kind === "suck" && !stun, charge = a && a.kind === "charge" && !stun, face = b.face;
    var vib = warn ? Math.sin(t * 90) * 2.2 : b.hitT > 0 ? Math.sin(t * 70) * 2.5 : b.done === "win" ? Math.sin(t * 80) * 4 : 0, bob = stun ? 0 : Math.sin(t * 9) * 0.8;
    var R = 62, side = ang ? "#7E2A2E" : "#3C4250", top = ang ? "#A5363A" : "#5A6272", rim = ang ? "#D0564F" : "#7D8597";
    if (b.hitT > 0) { side = "#9A9DA8"; top = "#D3D6DD"; }
    ctx.save(); ctx.translate(b.x + vib, BENCH - 1 + bob); if (stun) ctx.rotate(Math.sin(t * 18) * 0.05);
    ell(0, 2, R + 8, 8, "rgba(0,0,0,.2)");
    if (charge) { var g = a.ph === "go" ? 1 : 1 - a.t / a.max; ctx.save(); ctx.globalAlpha = 0.25 + 0.5 * g * (0.75 + 0.25 * Math.sin(t * 40)); ell(0, -20, R + 10 + g * 8, 32 + g * 6, "#FF3B30"); ctx.restore(); }
    if (suck) { ctx.save(); ctx.globalAlpha = 0.35 + 0.2 * Math.sin(t * 30); ell(face * 34, -8, 40, 14, "#B06BFF"); ctx.restore(); }
    // side brushes, spinning (seen in perspective)
    [-1, 1].forEach(function (s) {
      ctx.save(); ctx.translate(s * (R - 8), -3); ctx.scale(1, 0.34); var rot = t * (ang ? 26 : 16) * s * (stun ? 0.15 : 1) * (b.done ? 0 : 1);
      for (var k = 0; k < 3; k++) { var an = rot + k * 2.094; ctx.strokeStyle = "#2B2340"; ctx.lineCap = "round"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an) * 20, Math.sin(an) * 20); ctx.stroke();
        ctx.strokeStyle = "#E0A21E"; ctx.lineWidth = 1.6; for (var q = -1; q <= 1; q++) { ctx.beginPath(); ctx.moveTo(Math.cos(an) * 17, Math.sin(an) * 17); ctx.lineTo(Math.cos(an + q * 0.2) * 28, Math.sin(an + q * 0.2) * 28); ctx.stroke(); } }
      circ(0, 0, 6, "#6B7180"); ctx.restore();
    });
    // body: a squat cylinder
    ell(0, -10, R, 13, side); ctx.fillStyle = side; ctx.fillRect(-R, -34, R * 2, 24);
    // suction intake under the bumper: a dark slot with a spinning roller
    var ih = suck ? (a.ph === "go" ? 10 : 7) : 5; rr(-32 + face * 8, -11, 64, ih, 3); ctx.fillStyle = "#07080C"; ctx.fill();
    ctx.save(); rr(-32 + face * 8, -11, 64, ih, 3); ctx.clip(); ctx.strokeStyle = suck ? "#B06BFF" : "#3B4150"; ctx.lineWidth = 2; for (var rq = 0; rq < 9; rq++) { var rx = -36 + face * 8 + ((rq * 9 + t * (suck ? 160 : 40)) % 72); ctx.beginPath(); ctx.moveTo(rx, -11); ctx.lineTo(rx - 5, -11 + ih); ctx.stroke(); } ctx.restore();
    // rubber bumper round the front
    ctx.strokeStyle = "#1B1E26"; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(0, -18, R - 1, 13, 0, 0.04, Math.PI - 0.04); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.16)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, -22, R - 1, 13, 0, 0.35, Math.PI - 0.35); ctx.stroke();
    // top deck
    ell(0, -34, R, 13, top); ctx.strokeStyle = rim; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, -34, R - 13, 8.5, 0, 0, 7); ctx.stroke();
    ctx.globalAlpha = 0.28; ell(-22, -38, 22, 3.5, "#FFFFFF", -0.06); ctx.globalAlpha = 1;
    ctx.fillStyle = ang ? "#FFD6D6" : "#C9CED8"; ctx.font = "800 7px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("VAC-3000", 30, -31);
    // lidar turret with a spinning beam
    var led = ang || charge ? "#FF3B30" : suck ? "#B06BFF" : "#39E0FF";
    rr(-12, -48, 24, 13, 3); ctx.fillStyle = "#262A34"; ctx.fill(); ell(0, -48, 12, 4, "#3B4150");
    var la = t * (stun ? 2 : 9); circ(Math.cos(la) * 9, -48 + Math.sin(la) * 2.5, 2, led);
    // the eye: a dark visor with a glowing, scanning LED
    var vx = face * 12, ex = vx + (a ? face * 12 : Math.sin(t * 3) * 14);
    rr(vx - 27, -31, 54, 9, 4.5); ctx.fillStyle = "#0E1118"; ctx.fill();
    if (!b.done) { ctx.save(); ctx.shadowColor = led; ctx.shadowBlur = 14; ell(ex, -26.5, warn || ang ? 9 : 7, 3, led); ctx.restore(); circ(ex - 2, -27.5, 1.3, "#FFFFFF"); }
    if (ang && !b.done) { ctx.strokeStyle = "#1B1E26"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(vx - 22, -37); ctx.lineTo(vx - 4, -32); ctx.moveTo(vx + 22, -37); ctx.lineTo(vx + 4, -32); ctx.stroke(); }
    // damage: cracks, smoke, sparks
    if (b.dent > 0.2) { ctx.strokeStyle = "#1B1430"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-44, -38); ctx.lineTo(-36, -34); ctx.lineTo(-40, -30); ctx.lineTo(-32, -27); ctx.stroke(); }
    if (b.dent > 0.45) { ctx.beginPath(); ctx.moveTo(40, -40); ctx.lineTo(46, -35); ctx.lineTo(40, -31); ctx.stroke(); }
    if (b.dent > 0.4 || ang) for (var sm = 0; sm < 3; sm++) { var ph = (t * 0.9 + sm / 3) % 1; ctx.globalAlpha = 0.45 * (1 - ph); circ(-6 + sm * 6 + Math.sin(t * 2 + sm) * 6, -54 - ph * 40, 6 + ph * 10, ang ? "#6B5560" : "#A89C8E"); } ctx.globalAlpha = 1;
    if (ang && !quiet() && Math.sin(t * 13) > 0.6) { ctx.strokeStyle = "#FFE08A"; ctx.lineWidth = 2; var sx = rnd(-50, 50); ctx.beginPath(); ctx.moveTo(sx, -40); ctx.lineTo(sx + rnd(-8, 8), -52); ctx.lineTo(sx + rnd(-8, 8), -58); ctx.stroke(); }
    if (stun) for (var st = 0; st < 3; st++) { var sa = t * 5 + st * 2.094; ctx.fillStyle = "#FFE08A"; ctx.font = "900 14px Poppins, sans-serif"; ctx.fillText("✦", Math.cos(sa) * 34, -64 + Math.sin(sa) * 6); }
    ctx.restore();
  }
  function bossCatX(b, w) { var c = b.cats[w], sd = w === "b" ? -1 : 1, home = BHOME[w], intake = STAGE === 2 && V ? (b.nurse && !b.nurse.gone && sd > 0 ? 338 : V.vetX(b) + sd * 64) : b.x + sd * 48; return home + (intake - home) * Math.min(1, c.pull) * 0.72; }
  function bossCat(w) {
    var b = S.boss, c = b.cats[w], a = b.atk, home = BHOME[w], sd = w === "b" ? -1 : 1; if (c.gone > 0) return;
    var intake = STAGE === 2 && V ? (b.nurse && !b.nurse.gone && sd > 0 ? 338 : V.vetX(b) + sd * 64) : b.x + sd * 48, x = home + (intake - home) * Math.min(1, c.pull) * 0.72, jp = c.jt > 0 ? 1 - c.jt / 1.25 : 0, jy = c.jt > 0 ? 112 * Math.min(1, jp / 0.25) * (jp > 0.8 ? (1 - jp) / 0.2 : 1) : 0;
    var K = 0.33, pw = S.paw, lean = c.pull > 0.05 ? -sd * c.pull * 0.35 : 0, hit = c.hurtT > 0;
    if (c.pull > 0.04 && STAGE !== 2) { // tail stretched towards the intake
      ctx.strokeStyle = w === "b" ? "#EDE7DE" : "#66646E"; ctx.lineWidth = 8; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x - sd * 18, BENCH - 16); ctx.quadraticCurveTo(x - sd * (30 + 30 * c.pull), BENCH - 30, intake - sd * 4 + (x - intake) * (1 - c.pull) * 0.4, BENCH - 8); ctx.stroke();
    }
    ctx.save(); ctx.translate(x + (pw && (w === "b" ? pw.lane < 2 : pw.lane === 2) ? -sd * 10 : 0) + (hit ? Math.sin(S.t * 70) * 3 : 0), BENCH + 2 - jy); ctx.rotate(lean); ctx.scale(w === "c" ? -K : K, K * 0.9); ctx.translate(-120, -246);
    spr(w === "b" ? "basil-body" : "clover-body"); spr(w === "b" ? "basil-head" : "clover-head"); catEyes(w, hit ? "ouch" : jy > 10 || c.pull > 0.3 ? "wide" : "open", w === "c"); ctx.restore();
    if (STAGE === 2 && V) V.bossCatExtras(w, x, BENCH + 2 - jy, c);
    if (c.jt <= 0 && a && a.kind === "charge" && a.ph !== "stun" && (a.side < 0) === (w === "b")) { // jump prompt over the target cat
      var pul = 1 + Math.sin(S.t * 16) * 0.08; ctx.save(); ctx.translate(home, BENCH - 112); ctx.scale(pul, pul); rr(-38, -14, 76, 22, 11); ctx.fillStyle = "#C2553A"; ctx.fill();
      ctx.fillStyle = "#FFF"; ctx.font = "900 11px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText(FINE ? (w === "b" ? "← / A JUMP" : "→ / D JUMP") : "TAP: JUMP!", 0, 1); ctx.restore();
    }
  }
  function bossDraw() {
    var b = S.boss; if (!b) return; var a = b.atk;
    // suction wind: streaks pulled into the intake
    if (a && a.kind === "suck" && a.ph === "go" && STAGE !== 2) { var ix = b.x + a.side * 40, ox = a.side < 0 ? 0 : W; ctx.strokeStyle = "rgba(176,107,255,.55)"; ctx.lineWidth = 2; ctx.lineCap = "round";
      for (var k = 0; k < 12; k++) { var ph = (S.t * 1.8 + k / 12) % 1, y0 = BENCH - 110 + k * 8, px = ox + (ix - ox) * ph, py = y0 + (BENCH - 12 - y0) * ph; ctx.globalAlpha = Math.sin(ph * Math.PI); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - (ix - ox) * 0.08, py - (BENCH - 12 - y0) * 0.08); ctx.stroke(); } ctx.globalAlpha = 1; }
    if (STAGE === 2 && V) V.bossFront(b, { b: { x: bossCatX(b, "b") }, c: { x: bossCatX(b, "c") } });
    else if (!(b.done === "win" && b.doneT < 2.6)) vacuum(b);
    if (a && a.kind === "charge" && a.ph === "warn") { // telegraph: dashed arrow to the target
      var tx = BHOME[a.side < 0 ? "b" : "c"], ay = STAGE === 2 ? BENCH - 62 : BENCH - 20, ax0 = STAGE === 2 && V ? V.vetX(b) + a.side * 74 : b.x + a.side * 70; ctx.strokeStyle = "rgba(194,85,58," + (0.5 + 0.5 * Math.sin(S.t * 30)) + ")"; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(ax0, ay); ctx.lineTo(tx - a.side * 6, ay); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#C2553A"; ctx.beginPath(); ctx.moveTo(tx - a.side * 2, ay); ctx.lineTo(tx - a.side * 16, ay - 10); ctx.lineTo(tx - a.side * 16, ay + 10); ctx.fill();
    }
    var f = b.food;
    if (f) { item(f.kind, f.x, f.y, 0); if (f.landed) { var lf = Math.max(0, f.life / 5); ctx.strokeStyle = "#B07A0C"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(f.x, BENCH - 50, 7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lf); ctx.stroke(); ctx.fillStyle = "#B07A0C"; ctx.font = "800 10px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText(FINE ? "↑ / W: grab" : "tap: grab", f.x, BENCH - 62); } }
    bossCat("b"); bossCat("c");
    if (STAGE === 2 && V && a && a.kind === "cone" && (a.ph === "go" || a.ph === "back")) { var cpos = conePos(b, a); V.coneFly(cpos.x, cpos.y, S.t * 7); if (a.ph === "go") { ctx.strokeStyle = "rgba(46,125,107," + (0.5 + 0.4 * Math.sin(S.t * 16)) + ")"; ctx.lineWidth = 3; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.arc(cpos.x, cpos.y - 18, 34, 0, 7); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = "#2E7D6B"; ctx.font = "900 11px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText(FINE ? "TAP or ↑ / W" : "TAP IT!", cpos.x, cpos.y - 58); } }
    // weak spot
    if (b.spot && !b.done) {
      var p = spotXY(b), core = b.spot.core, pul = 1 + Math.sin(S.t * 10) * 0.1, rad = core ? 26 : 18;
      ctx.save(); ctx.translate(p.x, p.y); ctx.scale(pul, pul); ctx.globalAlpha = 0.35; circ(0, 0, rad + 6, core ? "#FF8AD0" : "#FFE08A"); ctx.globalAlpha = 1;
      ctx.setLineDash([5, 4]); ctx.strokeStyle = core ? "#B5308A" : "#F2C230"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, rad, 0, 7); ctx.stroke(); ctx.setLineDash([]); circ(0, 0, core ? 9 : 6, core ? "#FF8AD0" : "#F2C230"); ctx.restore();
      ctx.font = "900 11px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.lineJoin = "round"; ctx.lineWidth = 3; ctx.strokeStyle = "#FFFFFF"; var lbl = core ? s2("HIT THE CORE! ×3", "TREAT POCKET! ×3") : b.spot.name; ctx.strokeText(lbl, p.x, p.y - rad - 10); ctx.fillStyle = core ? "#B5308A" : "#B07A0C"; ctx.fillText(lbl, p.x, p.y - rad - 10);
    }
    // attack banners
    if (a && !b.done) {
      var msg = "", sub = "", col = "#C2553A";
      var tw0 = a.side < 0 ? "Basil" : "Clover";
      if (STAGE === 2) { // the vet's attack calls sit on the cupboard doors so they never cover him
        if (a.kind === "charge" && a.ph !== "stun") { msg = "THERMOMETER LUNGE!"; sub = "Tap " + tw0 + " to jump"; }
        else if (a.kind === "suck" && a.ph === "warn") { msg = b.nurse && !b.nurse.gone && a.side > 0 ? "NURSE INCOMING" : "TOWEL INCOMING"; sub = "Get ready to tap"; col = "#7A3FB5"; }
        else if (a.kind === "suck" && a.ph === "go") { msg = "TOWEL BURRITO!"; sub = "Tap tap tap: " + tw0 + " wriggles free"; col = "#7A3FB5"; }
        else if (a.kind === "scratch" && a.ph !== "go" && a.ph !== "stun") { msg = "“JUST A LITTLE SCRATCH…”"; sub = "Freeze. Tap only on BOLT"; col = "#7A3FB5"; }
        else if (a.kind === "scratch" && a.ph === "go") { msg = "BOLT! TAP!"; sub = "Escape before he gets to 1"; col = "#B5308A"; }
        else if (a.kind === "cone" && a.ph === "warn") { msg = "CONE TOSS!"; sub = "Get ready to swat it back"; col = "#2B5E80"; }
        else if (a.kind === "cone" && a.ph === "go") { msg = "SWAT THE CONE!"; sub = "Tap it in the air"; col = "#2E7D6B"; }
        else if (a.kind === "cone" && a.ph === "back") { msg = "RETURN TO SENDER"; sub = ""; col = "#2E7D6B"; }
        else if (a.ph === "stun") { msg = "STUNNED!"; sub = "Smash the treat pocket"; col = "#B5308A"; }
      }
      else if (a.kind === "charge" && a.ph !== "stun") { msg = "CHARGING!"; sub = "Tap " + tw0 + " to jump"; }
      else if (a.kind === "suck" && a.ph === "warn") { msg = "SUCTION INCOMING"; sub = "Get ready to tap"; col = "#7A3FB5"; }
      else if (a.kind === "suck" && a.ph === "go") { msg = "TAP TAP TAP!"; sub = "Hold on or get sucked up"; col = "#7A3FB5"; }
      else if (a.ph === "stun") { msg = "STUNNED!"; sub = "Smash the core"; col = "#B5308A"; }
      var my = STAGE === 2 ? BENCH + 50 : 104, mf = 22; ctx.save(); ctx.textAlign = "center"; ctx.lineJoin = "round"; ctx.font = "900 22px Poppins, sans-serif"; if (ctx.measureText(msg).width > W - 24) mf = Math.floor(22 * (W - 24) / ctx.measureText(msg).width);
      ctx.font = "900 " + (a.ph === "go" && a.kind === "suck" ? mf + 2 + Math.sin(S.t * 20) * 2 : mf) + "px Poppins, sans-serif"; ctx.lineWidth = 6; ctx.strokeStyle = "#FFFFFF"; ctx.strokeText(msg, 180, my); ctx.fillStyle = col; ctx.fillText(msg, 180, my);
      ctx.font = "800 11px Poppins, sans-serif"; ctx.lineWidth = 4; ctx.strokeText(sub, 180, my + 16); ctx.fillStyle = "#2B2340"; ctx.fillText(sub, 180, my + 16); ctx.restore();
      if (a.kind === "suck" && a.ph === "go") { var pc = b.cats[a.side < 0 ? "b" : "c"].pull, py0 = STAGE === 2 ? my + 26 : 128; rr(100, py0, 160, 10, 5); ctx.fillStyle = "rgba(43,35,64,.18)"; ctx.fill(); rr(100, py0, Math.max(0.1, 160 * Math.min(1, pc)), 10, 5); ctx.fillStyle = pc > 0.7 ? "#C2553A" : "#7A3FB5"; ctx.fill(); }
    }
    // health bar
    rr(70, 46, 220, 10, 5); ctx.fillStyle = "rgba(43,35,64,.15)"; ctx.fill(); rr(70, 46, Math.max(0.1, 220 * b.hp / b.hpMax), 10, 5); ctx.fillStyle = b.angry ? "#E0302A" : "#C2553A"; ctx.fill();
    ctx.strokeStyle = "rgba(43,35,64,.35)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(180, 44); ctx.lineTo(180, 58); ctx.stroke();
    ctx.fillStyle = "#2B2340"; ctx.font = "700 10px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText(s2("VAC-3000 · ", "DR POKESWORTH · ") + b.hp + "/" + b.hpMax + (b.angry ? s2(" · ANGRY", " · FRAZZLED") : ""), 180, 70);
    if (b.nurse && !b.nurse.gone) { rr(96, 78, 168, 18, 9); ctx.fillStyle = "rgba(122,63,181,.92)"; ctx.fill(); ctx.fillStyle = "#FFF"; ctx.font = "800 9px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("NURSE BURRITO · TOWELS", 162, 91); for (var nt0 = 0; nt0 < 3; nt0++) { rr(228 + nt0 * 11, 82, 9, 10, 2); ctx.fillStyle = nt0 < b.nurse.towels ? "#FFFFFF" : "rgba(255,255,255,.3)"; ctx.fill(); } }
  }
  // explosion debris (dust cloud and parts) lives on after the boss is gone
  function debrisStep(dt) {
    S.dust = S.dust.filter(function (d) { d.x += d.vx * dt; d.y += d.vy * dt; d.vx *= Math.pow(0.15, dt); d.vy = d.vy * Math.pow(0.2, dt) + 10 * dt; d.r += d.gr * dt; d.l -= dt; return d.l > 0; });
    S.parts = S.parts.filter(function (p) { p.vy += 1000 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; if (p.y > BENCH - 4 && p.vy > 0 && p.x > 0 && p.x < W) { p.y = BENCH - 4; p.vy *= -0.42; p.vx *= 0.7; p.vr *= 0.7; } p.l -= dt; return p.l > 0 && p.y < H + 30; });
    if (S.ring) { S.ring.t += dt; if (S.ring.t > 0.5) S.ring = null; }
  }
  function debrisDraw() {
    if (S.ring) { ctx.globalAlpha = 1 - S.ring.t / 0.5; ctx.strokeStyle = "#FFE08A"; ctx.lineWidth = 8 * (1 - S.ring.t / 0.5) + 1; ctx.beginPath(); ctx.ellipse(S.ring.x, S.ring.y, 30 + S.ring.t * 360, 12 + S.ring.t * 120, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
    S.parts.forEach(function (p) {
      ctx.save(); ctx.globalAlpha = Math.min(1, p.l * 2); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      if (STAGE === 2 && V && V.parts(p.kind)) { /* vet debris: notes, treats, glasses */ }
      else if (p.kind === "wheel") { circ(0, 0, 8, "#1B1E26"); circ(0, 0, 3, "#6B7180"); }
      else if (p.kind === "brush") { ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 2.5; for (var k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(k * 2.094) * 14, Math.sin(k * 2.094) * 14); ctx.stroke(); } circ(0, 0, 4, "#E0A21E"); }
      else if (p.kind === "cap") { rr(-11, -6, 22, 12, 3); ctx.fillStyle = "#262A34"; ctx.fill(); circ(4, -2, 2, "#39E0FF"); }
      else if (p.kind === "lid") { rr(-20, -5, 40, 10, 5); ctx.fillStyle = "#5A6272"; ctx.fill(); }
      else if (p.kind === "bump") { ctx.strokeStyle = "#1B1E26"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 18, 0.2, 1.6); ctx.stroke(); }
      else if (p.kind === "led") { circ(0, 0, 5, "rgba(255,59,48,.4)"); circ(0, 0, 2.5, "#FF3B30"); }
      else { ctx.fillStyle = "#AEB8C0"; ctx.fillRect(-2.5, -2.5, 5, 5); }
      ctx.restore();
    });
    S.dust.forEach(function (d) { ctx.globalAlpha = Math.max(0, Math.min(0.75, d.l / d.m)); circ(d.x, d.y, d.r, d.c); }); ctx.globalAlpha = 1;
  }
  // ---------- surprise events: one at a time, all possible from round 1, more often and faster each round (RAMP.ev) ----------
  // cucumber, fridge (Clover's rounds), thunderstorm, Christmas tree (more likely in December), bath time, box drop, toast trap, treat shaker
  function isDec() { return sydDay().slice(5, 7) === "12"; }
  function who() { return S.bonus > 0 ? "c" : "b"; }
  function catName() { return S.bonus > 0 ? "Clover" : "Basil"; }
  function evFrozen() { return S.ev && S.ev.freeze && !S.ev.done; } // cucumber, box and shaker: the world holds still
  // the Vet's surprises reuse the kitchen's rules where they match: weigh-in = cucumber, treat bribe = fridge, thermometer = bath, carrier = box, "just a little scratch" = treat shaker
  var EVM = { weigh: "cucumber", bribe: "fridge", thermo: "bath", carrier: "box", scratch: "shaker" };
  function startEvent(kind) {
    if (!kind) {
      var w = STAGE === 2 ? [["weigh", 1], ["xray", 1], ["cone", 1], ["thermo", 1], ["carrier", 1], ["clipper", 1.1], ["scratch", 1]] : [["cucumber", 1], ["storm", 1], ["tree", isDec() ? 5 : 0.6], ["bath", 1], ["box", 1], ["toast", 1.1], ["shaker", 1]];
      if (S.bonus > 0) w.push([STAGE === 2 ? "bribe" : "fridge", 1.6]);
      var tot = 0; w.forEach(function (x) { tot += x[1]; }); var r = G() * tot; kind = w[0][0];
      for (var i = 0; i < w.length; i++) { r -= w[i][1]; if (r <= 0) { kind = w[i][0]; break; } }
    }
    var l = lvl(), m = EVM[kind] || kind, e = { kind: kind, m: m, t: 0, done: 0 };
    if (m === "cucumber") { e.dur = 2; e.freeze = true; e.cat = who(); }
    if (m === "fridge") { e.dur = 5; e.climb = 0; e.climbDur = 4.4 - 1.8 * Math.min(1, l); }
    if (m === "storm") { e.dur = 4.5 + 1.5 * Math.min(1, l); e.next = 0; }
    if (m === "tree") { e.dur = 9; e.baubles = [[-20, -44, "#C2553A"], [18, -50, "#2F5DA8"], [-12, -78, "#F2C230"], [14, -92, "#B5308A"], [-6, -112, "#2E7D6B"], [8, -128, "#E0703A"]].map(function (b) { return { dx: b[0], dy: b[1], c: b[2], off: 0 }; }); e.got = 0; }
    if (m === "bath") { e.dur = 2.0 - 0.8 * Math.min(1, l); e.cat = who(); }
    if (m === "box") { e.dur = 3.5; e.freeze = true; e.need = Math.round(8 + 6 * Math.min(1, l)); e.taps = 0; }
    if (m === "toast") { e.dur = 2.6; if (!spawn("toast")) { var ln = [0, 1, 2].filter(function (j) { var o = S.lanes[j]; return o && !o.hp && o.kind !== "hedgehog"; })[0]; if (ln == null) { S.evT = 1; return; } S.lanes[ln] = null; spawn("toast"); } }
    if (m === "shaker") { e.freeze = true; e.rattle = grnd(1.0, 2.2); e.fake = G() < 0.3; e.win = 1.0 - 0.45 * Math.min(1, l); e.dur = e.rattle + (e.fake ? 0.8 : e.win); }
    if (m === "xray") { e.dur = 4.5 + 1.5 * Math.min(1, l); e.next = 0.3; e.ft = -1; e.flip = 0; }
    if (m === "cone") { e.dur = 4; e.taps = 0; e.jig = 0; e.cat = who(); }
    if (m === "clipper") { e.dur = 2.6 - 0.6 * Math.min(1, l); e.freeze = true; e.dir = G() < 0.5 ? 1 : -1; e.x = e.dir > 0 ? -60 : W + 60; e.jt = -9; e.crossed = 0; e.cat = who(); }
    S.ev = e; track("basil/ev-" + kind);
  }
  function evEnd(t) { S.ev.done = t || 0.6; }
  function evTap(x, y) {
    var e = S.ev; if (!e || e.done) return false;
    if (e.m === "cucumber") { cucumberFail(); return true; }
    if (e.m === "box") { boxTap(); return true; }
    if (e.m === "shaker") { shakerTap(); return true; }
    if (e.m === "clipper") { clipJump(); return true; }
    if (e.m === "cone" && Math.abs(x - 180) < 92 && y > BENCH - 210 && y < BENCH - 66) { coneTap(); return true; }
    if (e.m === "fridge" && x > 286 && y < BENCH - 40) { fridgeShut(); return true; }
    if (e.m === "bath" && Math.abs(x - 180) < 72 && y > BENCH - 210 && y < BENCH - 66) { bathFlee(); return true; }
    if (e.m === "tree") {
      var tx = 326, ty = BENCH - 24;
      if (Math.hypot(x - tx, y - (ty - 140)) < 17) { treeStar(); return true; }
      for (var i = 0; i < e.baubles.length; i++) { var b = e.baubles[i]; if (!b.off && Math.hypot(x - tx - b.dx, y - ty - b.dy) < 17) { treeBauble(b); return true; } }
    }
    return false;
  }
  function evKey(k, up) {
    var e = S.ev; if (!e || e.done) return false;
    if (e.m === "cucumber") { cucumberFail(); return true; }
    if (e.m === "box") { boxTap(); return true; }
    if (e.m === "shaker") { shakerTap(); return true; }
    if (e.m === "clipper") { clipJump(); return true; }
    if (!up) return false;
    if (e.m === "cone") { coneTap(); return true; }
    if (e.m === "fridge") { fridgeShut(); return true; }
    if (e.m === "bath") { bathFlee(); return true; }
    if (e.m === "tree") { var b = e.baubles.filter(function (q) { return !q.off; })[0]; if (b) { treeBauble(b); return true; } }
    return false;
  }
  function coneTap() { var e = S.ev; e.taps++; e.jig = 0.15; S.paw = { lane: 1, t: 0 }; if (e.taps >= 3) { evEnd(0.4); var pts = 3 * U(); addPts(pts); float(180, BENCH - 170, "Shaken off! +" + fmt(pts), "#2E7D6B"); toast(pick(["Cone off. Dignity: restored. Mostly.", "Shaken off. The cone has been defeated."])); } }
  function clipJump() { var e = S.ev; if (S.leapT > 0) return; S.leapT = 0.7; e.jt = S.t; }
  function cucumberFail() {
    var e = S.ev; evEnd(); S.leapT = 0.7; S.combo = 0; S.ouchT = 0.7; S.ouches++; shake();
    for (var j = 0; j < 3; j++) { var o = S.lanes[j]; if (o && !o.hp) { S.lanes[j] = null; S.fly.push({ kind: o.kind, x: LANES[j], y: BENCH - 2, vx: (j - 1 || 1) * rnd(200, 300), vy: -rnd(200, 300), r: 0, vr: rnd(-9, 9) }); } }
    float(180, BENCH - 170, s2("CUCUMBER! AAARGH", "47 KG?! HAYWIRE"), "#C2553A"); toast(STAGE === 2 ? catName() + " jumped off the scales. They now read 47 kg. Table wiped, no points." : catName() + " saw the cucumber and left the planet. Bench wiped, no points.", 2200); hurt(e.cat, 15);
  }
  function boxTap() {
    var e = S.ev; e.taps++; e.jig = 0.12; S.paw = { lane: e.taps % 2 ? 0 : 2, t: 0 };
    if (e.taps >= e.need) { evEnd(0.9); e.won = 1; var pts = 6 * U(); addPts(pts); float(180, BENCH - 120, s2("Settled! +", "Hidden! +") + fmt(pts), "#2E7D6B"); toast(pick(s2(["If it fits, he sits. Box claimed.", "Box settled. Clover gets it next time (she won’t).", "Peace in the kitchen. For now."], ["Carrier claimed. Nobody can see him. He thinks.", "Hiding spot secured. The vet will never look in there.", "In the carrier. Door shut. Problem solved."]))); }
  }
  function shakerTap() {
    var e = S.ev;
    if (e.t < e.rattle || e.fake) { evEnd(); var pen = Math.min(S.score, 4 * U()); addPts(-pen); S.rPen = true; S.combo = 0; float(180, 190, STAGE === 2 ? "Flinched!" + (pen ? " -" + fmt(pen) : "") : "Too eager! -" + fmt(pen), "#C2553A"); toast(s2("Fake-out. Nobody said NOW.", "Flinched early. Vaccinated. Annoyingly healthy."), 1800); return; }
    evEnd(0.9); var pts = 2 * 5 * U(); addPts(pts); S.happyT = 1; float(180, 190, s2("First! ×2 +", "Bolted! ×2 +") + fmt(pts), "#B5308A"); toast(pick(s2(["Fastest paw in the kitchen. Double treats.", "Treats: secured. Twice."], ["Under the table before the count of 1. Double points.", "Bolted. Whatever it was, it stayed hidden."])));
  }
  function fridgeShut() { var e = S.ev; evEnd(); var pts = 2 * U() + Math.round(4 * U() * e.t / e.dur); addPts(pts); float(318, 150, s2("Door shut +", "Hand shooed +") + fmt(pts), "#2E7D6B"); toast(STAGE === 2 ? (e.t > 2.5 ? "Hand shooed just in time. Treats eaten, towel avoided." : "Hand shooed. A bit early. Clover is unimpressed.") : e.t > 2.5 ? "Shut just in time. Clover feasted, Basil sulks." : "Door shut. A bit early. Clover is unimpressed."); }
  function bathFlee() { var e = S.ev; evEnd(); S.lean = 0.5; var pts = 2 * U(); addPts(pts); float(180, BENCH - 180, s2("Escaped the bath! +", "Sat on that tail! +") + fmt(pts), "#2E7D6B"); }
  function treeBauble(b) {
    var e = S.ev; b.off = 1; e.got++; var pts = 2 * U(); addPts(pts); S.paw = { lane: 2, t: 0 }; float(326 + b.dx, BENCH - 30 + b.dy, "+" + fmt(pts), "#B5308A");
    S.fly.push({ kind: "bauble", c: b.c, x: 326 + b.dx, y: BENCH - 24 + b.dy, vx: rnd(-160, 40), vy: -rnd(160, 240), r: 0, vr: rnd(-6, 6) });
    if (e.got === e.baubles.length) { var bn = 6 * U(); addPts(bn); evEnd(1); float(326, BENCH - 170, "Tree stripped! +" + fmt(bn), "#2E7D6B"); toast("Every bauble on the floor. Festive."); }
  }
  function treeStar() {
    var e = S.ev; evEnd(1.2); e.star = 1; shake(); S.fly.push({ kind: "star", x: 326, y: BENCH - 164, vx: -rnd(120, 200), vy: -rnd(200, 260), r: 0, vr: 8 });
    S.ann = { t: 1.6, a: "THE STAR!", b: "ROUND FAIL" }; toast("You knocked the star off. Christmas is cancelled. Round over.", 2600); track("basil/star");
    if (!CAMP) { hurt(who(), 34); return; }
    S.rPen = true; S.rFail = true; if (loseLife()) return;
    if (S.bonus > 0) S.bonus = 0.01; else S.roundT = 0.01;
  }
  function evStep(dt) {
    var e = S.ev;
    if (!e) { if (!S.dog && !S.tom && !(S.ann && S.ann.t > 0)) { S.evT -= dt; if (S.evT <= 0 && rAge() > 3) { startEvent(); S.evT = every("ev"); } } return; }
    if (e.done) { e.done -= dt; if (e.done <= 0) S.ev = null; return; }
    e.t += dt; if (e.jig > 0) e.jig -= dt;
    if (e.m === "cucumber" && e.t >= e.dur) { evEnd(); var pts = 4 * U(); addPts(pts); float(180, BENCH - 170, s2("Cool as a cucumber +", "Perfect weigh-in +") + fmt(pts), "#2E7D6B"); }
    else if (e.m === "fridge") { e.climb = Math.min(1, e.t / e.climbDur); if (e.climb >= 1) { evEnd(); var pen = Math.min(S.cPts, 8 * U()); addPts(-pen); S.rPen = true; S.bonus = Math.max(0.5, S.bonus - 3); shake(); float(318, 150, s2("Basil’s in the fridge! -", "Towelled! -") + fmt(pen), "#C2553A"); toast(s2("Basil climbed into the fridge. He ate the ham. And 3 seconds.", "The bribe was a trap. Towel out. Clover lost 3 seconds."), 2200); } }
    else if (e.m === "storm") {
      e.next -= dt; if (e.next <= 0) { e.next = grnd(1.0, 1.6); S.flashT = 0.2; if (!quiet()) shake(); for (var j = 0; j < 3; j++) { var it = S.lanes[j]; if (it && !it.landed) it.hold = 1; } }
      if (e.t >= e.dur) evEnd(0.5);
    }
    else if (e.m === "bath" && e.t >= e.dur) { evEnd(); S.towelT = 2; shake(); float(180, BENCH - 170, s2("TOWELLED. -10%", "TEMPERATURE TAKEN. -10%"), "#C2553A"); toast(STAGE === 2 ? "Temperature taken. 38.6°. Dignity: 0%. " + catName() + " needs a moment." : catName() + " got towelled. Two seconds of being dried. Humiliating.", 2200); hurt(e.cat, 10); }
    else if (e.m === "box" && e.t >= e.dur) { evEnd(); S.combo = 0; float(180, BENCH - 120, "Stalemate. Both sulk.", "#6B5A93"); }
    else if (e.m === "shaker" && e.t >= e.dur) { evEnd(); float(180, 190, e.fake ? s2("…nope. Fake-out.", "…‘1 and three quarters’. Fake-out.") : s2("Too slow.", "Too slow. The vet’s distracted now."), "#6B5A93"); }
    else if (e.m === "xray") {
      if (e.ft < 0) { e.next -= dt; if (e.next <= 0 && e.t < e.dur) { e.ft = 0; for (var xj = 0; xj < 3; xj++) { var xi = S.lanes[xj]; if (xi && !xi.landed) xi.hold = 1.2; } } }
      else { e.ft += dt; if (e.ft >= 1.2) { e.ft = -1; e.next = grnd(0.9, 1.4); } }
      var xf = e.ft; e.flip = xf < 0 ? 0 : xf < 0.35 ? xf / 0.35 : xf < 0.85 ? 1 : Math.max(0, (1.2 - xf) / 0.35); // fades in and out: never a strobe
      if (e.t >= e.dur && e.ft < 0) evEnd(0.3);
    }
    else if (e.m === "cone") { if (e.jig > 0) e.jig -= dt; if (e.t >= e.dur) { evEnd(0.3); float(180, BENCH - 170, "Cone off. Dignity: partial.", "#6B5A93"); } }
    else if (e.m === "clipper") {
      e.x += e.dir * (W + 120) / e.dur * dt;
      if (!e.crossed && (e.dir > 0 ? e.x >= 180 : e.x <= 180)) { e.crossed = 1;
        if (S.t - e.jt < 0.65) { var cpt = 3 * U(); addPts(cpt); float(180, BENCH - 180, "Cleared! +" + fmt(cpt), "#2E7D6B"); }
        else { S.stripe = e.cat; S.combo = 0; shake(); float(180, BENCH - 170, "SHAVED! -10%", "#C2553A"); toast(pick(["A racing stripe. Very aerodynamic. -10%.", "Shaved. " + catName() + " will never forgive the clippers.", "Bald patch acquired. It’ll grow back. Eventually."]), 2200); if (hurt(e.cat, 10)) return; } }
      if (e.t >= e.dur) evEnd(0.3);
    }
    else if ((e.m === "tree" || e.m === "toast") && e.t >= e.dur) evEnd(e.m === "tree" ? 0.5 : 0.01);
  }
  // banner: title, explanation, countdown bar (frac 0..1)
  function banner(title, sub, frac, col, k, y0) {
    k = k == null ? 1 : k; ctx.save(); ctx.globalAlpha = k; if (y0) ctx.translate(0, y0 - 116); rr(16, 116, W - 32, 50, 12); ctx.fillStyle = col || "#7A1F2B"; ctx.fill(); ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 2; ctx.stroke();
    ctx.textAlign = "center"; ctx.fillStyle = "#FFFFFF"; ctx.font = "900 16px Poppins, sans-serif"; var tw = ctx.measureText(title).width; if (tw > W - 52) ctx.font = "900 " + Math.floor(16 * (W - 52) / tw) + "px Poppins, sans-serif"; ctx.fillText(title, 180, 136);
    ctx.fillStyle = "#FFE08A"; ctx.font = "700 11px Poppins, sans-serif"; var sw = ctx.measureText(sub).width; if (sw > W - 52) ctx.font = "700 " + Math.floor(11 * (W - 52) / sw) + "px Poppins, sans-serif"; ctx.fillText(sub, 180, 151);
    if (frac != null) { rr(30, 156, W - 60, 5, 2.5); ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fill(); rr(30, 156, Math.max(0.1, (W - 60) * Math.max(0, Math.min(1, frac))), 5, 2.5); ctx.fillStyle = "#FFE08A"; ctx.fill(); }
    ctx.restore();
  }
  function evDrawBack() { // drawn behind the items
    var e = S.ev; if (!e) return; var a = e.done ? Math.min(1, e.done / 0.5) : 1;
    if (STAGE === 2 && V) { ctx.save(); ctx.globalAlpha = a; V.evBack(e); ctx.restore(); return; }
    if (e.kind === "tree") { ctx.save(); ctx.globalAlpha = a; treeDraw(e); ctx.restore(); }
    if (e.kind === "fridge") { ctx.save(); ctx.globalAlpha = a; fridgeDraw(e); ctx.restore(); }
    if (S.butterT > 0) { ctx.globalAlpha = Math.min(0.7, S.butterT / 2); ell(180, BENCH - 3, 150, 5, "#F2D96B"); ell(110, BENCH - 4, 30, 3, "#FFF3B0"); ctx.globalAlpha = 1; }
  }
  function evDraw() { // drawn over the items
    var e = S.ev; if (!e) return; var live = !e.done, a = e.done ? Math.min(1, e.done / 0.4) : Math.min(1, e.t / 0.2);
    if (STAGE === 2 && V) {
      if (e.m === "xray" && e.flip > 0) { V.xray(e.flip, quiet()); if (e.flip > 0.3) for (var xj = 0; xj < 3; xj++) { var xi = S.lanes[xj]; if (xi && isBad(xi.kind)) V.xrayReveal(LANES[xj] + (xi.ox || 0), xi.kind, e.flip); } }
      V.evDraw(e, e.cat || who(), a);
      if (!live) return;
      var vm = V.bannerFor(e, catName(), e.taps + "/" + e.need);
      if (vm) banner(vm[0], vm[1], vm[2], vm[3], 1, e.m === "cone" ? 40 : 0);
      return;
    }
    if (e.kind === "cucumber" && live) { ctx.save(); ctx.translate(244, BENCH - 6); ctx.rotate(-0.15); rr(-9, -46, 18, 48, 9); ctx.fillStyle = "#3E8E4A"; ctx.fill(); ctx.fillStyle = "#5BAF62"; [-34, -22, -10].forEach(function (yy) { circ(-3, yy, 2, "#5BAF62"); circ(4, yy + 6, 1.8, "#5BAF62"); }); ell(-3, -38, 3, 7, "rgba(255,255,255,.25)"); ctx.restore(); }
    if (e.kind === "storm" && live) {
      ctx.fillStyle = "rgba(10,10,30," + (0.72 * Math.min(1, e.t / 0.3) * Math.min(1, (e.dur - e.t) / 0.3 + 0.2)) + ")"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(160,190,255,.35)"; ctx.lineWidth = 1.5; for (var q = 0; q < 26; q++) { var rx = (q * 53 + S.t * 420) % (W + 40) - 20, ry = (q * 97 + S.t * 900) % H; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 4, ry + 14); ctx.stroke(); }
    }
    if (e.kind === "bath" && live) bathDraw(e);
    if (e.kind === "box") boxDraw(e, a);
    if (e.kind === "shaker") shakerDraw(e, a);
    if (S.flashT > 0) { ctx.fillStyle = "rgba(255,255,255," + (S.flashT / 0.2 * 0.85) + ")"; ctx.fillRect(0, 0, W, H); }
    if (!live) return;
    var m = {
      cucumber: ["CUCUMBER!", "Don’t tap anything for 2 s or " + catName() + " leaps off the bench", 1 - e.t / e.dur, "#2E6B3A"],
      fridge: ["FRIDGE OPEN! FEAST TIME", "Eat fast, then tap the door to shut it before Basil climbs in", 1 - e.climb, "#2B5E80"],
      storm: ["THUNDERSTORM!", "Each flash freezes the falling things. Remember where they are", 1 - e.t / e.dur, "#26305E"],
      tree: ["CHRISTMAS TREE!", "Tap the baubles for points. Touch the star and the round’s over", 1 - e.t / e.dur, "#1F5E3A"],
      bath: ["BATH TIME!", "Tap " + catName() + " (or ↑ / W) to flee the towel", 1 - e.t / e.dur, "#2F5DA8"],
      box: ["BOX! BOTH CATS WANT IT", "Tap fast to settle it: " + e.taps + "/" + e.need, 1 - e.t / e.dur, "#8A5A00"],
      toast: [S.bonus > 0 ? "TOAST!" : "TOAST TRAP!", S.bonus > 0 ? "Clover can eat it for points" : "Don’t kick it: butter side down makes the bench slippery", null, "#8A5A00"],
      shaker: e.t < e.rattle ? ["SHAKE SHAKE…", "Treats! Freeze. Wait for NOW. Tapping early costs you", null, "#7A3FB5"] : e.fake ? ["…", "Fake-out. Don’t tap", null, "#7A3FB5"] : ["NOW! TAP!", "First tap wins double points", 1 - (e.t - e.rattle) / e.win, "#B5308A"]
    }[e.kind];
    if (m) banner(m[0], m[1], m[2], m[3], 1, e.kind === "tree" ? 52 : 0);
  }
  function treeDraw(e) {
    var x = 326, y = BENCH - 24;
    ctx.fillStyle = "#7A4E2D"; ctx.fillRect(x - 5, y - 14, 10, 14); rr(x - 14, y - 10, 28, 10, 2); ctx.fillStyle = "#C2553A"; ctx.fill();
    [[0, -14, 40, -64], [0, -50, 32, -98], [0, -86, 24, -134]].forEach(function (t) { ctx.fillStyle = "#2E7D4A"; ctx.beginPath(); ctx.moveTo(x - t[2], y + t[1]); ctx.lineTo(x + t[2], y + t[1]); ctx.lineTo(x, y + t[3]); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#3E9E5E"; ctx.beginPath(); ctx.moveTo(x - t[2] * 0.5, y + t[1] - 8); ctx.lineTo(x, y + t[3] + 6); ctx.lineTo(x - 2, y + t[1] - 8); ctx.fill(); });
    ctx.strokeStyle = "#F2C230"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 30, y - 30); ctx.quadraticCurveTo(x, y - 20, x + 26, y - 40); ctx.moveTo(x - 20, y - 70); ctx.quadraticCurveTo(x, y - 60, x + 18, y - 80); ctx.stroke();
    e.baubles.forEach(function (b) { if (b.off) return; ctx.strokeStyle = "#AEB8C0"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + b.dx, y + b.dy - 9); ctx.lineTo(x + b.dx, y + b.dy - 13); ctx.stroke(); circ(x + b.dx, y + b.dy, 7.5, b.c); circ(x + b.dx - 2.5, y + b.dy - 2.5, 2, "rgba(255,255,255,.6)"); });
    if (!e.star) starShape(x, y - 140, 12, "#FFD24A");
    if (!e.done) { ctx.strokeStyle = "rgba(194,85,58," + (0.5 + 0.4 * Math.sin(S.t * 8)) + ")"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y - 140, 17, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 12, y - 152); ctx.lineTo(x + 12, y - 128); ctx.stroke(); }
  }
  function starShape(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); for (var i = 0; i < 10; i++) { var an = -Math.PI / 2 + i * Math.PI / 5, rr0 = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(an) * rr0, y + Math.sin(an) * rr0); } ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#B07A0C"; ctx.lineWidth = 1.2; ctx.stroke(); }
  function fridgeDraw(e) {
    var open = e.done ? 0 : Math.min(1, e.t / 0.3);
    rr(300, 70, 62, BENCH - 94, 6); ctx.fillStyle = "#EEF3F6"; ctx.fill(); ctx.strokeStyle = "#AEB8C0"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "#FFF8D6"; ctx.fillRect(304, 74, 56, BENCH - 102); ctx.strokeStyle = "#CFD8DE"; [130, 180, 230].forEach(function (yy) { ctx.beginPath(); ctx.moveTo(304, yy); ctx.lineTo(360, yy); ctx.stroke(); });
    item("drumstick", 324, 128, 0); item("steak", 330, 178, 0); item("catfood", 326, 228, 0);
    // the door, swung open towards the viewer (or shut)
    var dw = 62 * (1 - open * 0.75); ctx.fillStyle = "#DCE5EA"; ctx.beginPath(); ctx.moveTo(300, 70); ctx.lineTo(300 - (62 - dw) * 0.9, 60); ctx.lineTo(300 - (62 - dw) * 0.9, BENCH - 14); ctx.lineTo(300, BENCH - 24); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#AEB8C0"; ctx.stroke();
    if (open < 1) { rr(300, 70, dw, BENCH - 94, 6); ctx.fillStyle = "#DCE5EA"; ctx.fill(); ctx.stroke(); }
    if (!e.done) { // Basil climbing in
      var by = BENCH - 30 - e.climb * 150; ctx.save(); ctx.translate(334, by); ctx.rotate(-0.25); ctx.scale(0.24, 0.24); ctx.translate(-120, -246); spr("basil-body"); spr("basil-head"); catEyes("b", "wide"); ctx.restore();
      ctx.fillStyle = "#C2553A"; ctx.font = "800 10px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("tap to shut!", 290, 66);
    }
  }
  function bathDraw(e) {
    var p = Math.min(1, e.t / e.dur), hx = 180 + Math.sin(S.t * 3) * 6, hy = -60 + p * (BENCH - 160 + 60);
    ctx.fillStyle = "#6FA8C9"; ctx.fillRect(hx + 4, -10, 34, hy + 10); ctx.fillStyle = "#5B93B3"; ctx.fillRect(hx + 4, hy - 16, 34, 8);
    ell(hx + 20, hy + 6, 22, 16, "#F1C9A5"); [-14, -5, 4, 13].forEach(function (fx) { rr(hx + 20 + fx - 4, hy + 10, 8, 18, 4); ctx.fillStyle = "#F1C9A5"; ctx.fill(); });
    ctx.save(); ctx.translate(hx - 4, hy + 14); ctx.rotate(0.1); rr(-30, 0, 60, 44, 6); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.fillStyle = "#6FA8C9"; ctx.fillRect(-30, 30, 60, 5); ctx.fillRect(-30, 37, 60, 3); ctx.restore();
    ctx.strokeStyle = "rgba(194,85,58,.6)"; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(180, BENCH - 120, 62, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  }
  function boxDraw(e, a) {
    ctx.save(); ctx.globalAlpha = a; var j = e.jig > 0 ? Math.sin(S.t * 90) * 3 : 0, x = 180 + j, y = BENCH + 2;
    ctx.fillStyle = "#C99A63"; ctx.fillRect(x - 48, y - 46, 96, 46); ctx.fillStyle = "#B4834E"; ctx.beginPath(); ctx.moveTo(x - 48, y - 46); ctx.lineTo(x - 66, y - 62); ctx.lineTo(x - 30, y - 62); ctx.lineTo(x - 12, y - 46); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + 48, y - 46); ctx.lineTo(x + 66, y - 62); ctx.lineTo(x + 30, y - 62); ctx.lineTo(x + 12, y - 46); ctx.fill();
    ctx.strokeStyle = "#8A5A2B"; ctx.lineWidth = 2; ctx.strokeRect(x - 48, y - 46, 96, 46); ctx.fillStyle = "#8A5A2B"; ctx.font = "800 9px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("THIS WAY UP", x, y - 20);
    if (!e.done || !e.won) { ctx.save(); ctx.translate(x + 76, BENCH + 2); ctx.scale(-0.26, 0.24); ctx.translate(-120, -246); spr("clover-body"); spr("clover-head"); catEyes("c", "wide", true); ctx.restore(); }
    if (!e.done) { rr(110, 186, 140, 10, 5); ctx.fillStyle = "rgba(43,35,64,.2)"; ctx.fill(); rr(110, 186, Math.max(0.1, 140 * e.taps / e.need), 10, 5); ctx.fillStyle = "#E0A21E"; ctx.fill(); }
    ctx.restore();
  }
  function shakerDraw(e, a) {
    ctx.save(); ctx.globalAlpha = a; var go = e.t >= e.rattle && !e.fake && !e.done, sh = e.t < e.rattle ? Math.sin(S.t * 50) * 6 : 0;
    ctx.translate(180 + sh, 214); ctx.rotate(go ? -1.1 : Math.sin(S.t * 50) * 0.15);
    rr(-18, -30, 36, 46, 6); ctx.fillStyle = "#E05A8A"; ctx.fill(); rr(-20, -34, 40, 8, 3); ctx.fillStyle = "#B5308A"; ctx.fill();
    ctx.fillStyle = "#FFF"; ctx.font = "800 8px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("TREATS", 0, -6); circ(0, 6, 4, "#FFF"); ctx.restore();
    if (go) for (var q = 0; q < 6; q++) circ(150 - q * 4 + Math.sin(q * 7) * 6, 214 + ((S.t * 200 + q * 20) % 90), 3, "#B07A0C");
    if (e.t < e.rattle && !e.done) { ctx.fillStyle = "#7A3FB5"; ctx.font = "italic 800 13px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("shake shake", 180 + Math.sin(S.t * 20) * 4, 182); }
    ctx.restore();
  }
  // ---------- campaign flow ----------
  function clearBench() { for (var j = 0; j < 3; j++) { var o = S.lanes[j]; if (o) S.fly.push({ kind: o.kind, x: LANES[j], y: BENCH - 2, vx: (j - 1 || 1) * rnd(200, 300), vy: -rnd(160, 240), r: 0, vr: rnd(-8, 8) }); S.lanes[j] = null; } }
  // end of a campaign round: clear bonus (round x 100), and PERFECT x2 (the round's points again) if nothing went wrong
  function roundClear() {
    var r = S.round, earned = Math.max(0, S.score - S.rStart), cb = r * 100, line = "CLEARED +" + fmt(cb);
    if (S.rFail) { S.rFail = false; toast("Round " + r + " failed. No clear bonus. Onwards."); return "ROUND FAILED · NO BONUS"; }
    addPts(cb);
    if (!S.rPen && earned > 0) { addPts(earned); S.perfects++; line += " · PERFECT ×2 +" + fmt(earned); toast(pick(["PERFECT ×2. Flawless. Suspiciously so.", "Perfect round. Not a scratch. Points doubled.", "PERFECT ×2. Basil is almost impressed."]), 2200); track("basil/perfect-" + r); }
    else toast("Round " + r + " cleared. +" + fmt(cb) + ".");
    return line;
  }
  function rearm() {
    S.mothT = Math.min(S.mothT, every("moth")); S.zoomT = Math.min(S.zoomT, every("zoom")); S.dogT = Math.min(S.dogT, every("dog")); S.tomT = Math.min(S.tomT, every("tom"));
    S.laserT = Math.min(S.laserT, every("laser")); S.rbT = Math.min(S.rbT, every("rainbow")); S.cloverT = Math.min(S.cloverT, every("clover")); S.sneakT = Math.min(S.sneakT, every("sneak"));
    S.treatT = Math.min(S.treatT, every("treat")); S.specialT = Math.min(S.specialT, every("special")); S.evT = Math.min(S.evT, every("ev"));
  }
  function campNext() {
    var line = roundClear();
    if (S.round >= 10) return win();
    enterRound(S.round + 1); S.ann.c = line;
  }
  function enterRound(n) {
    var k = CAMP_KIND[n];
    clearBench(); S.stripe = null; S.flea = null; S.sneak = null; S.clover = null; S.treat = null; S.cross = false; S.ev = null; S.butterT = S.towelT = 0; S.rFail = false;
    if (k === "boss") { S.round = n - 1; startBoss(); }
    else if (k === "C") { S.round = n - 1; startBonus(); }
    else { S.round = n; S.bonus = 0; S.roundT = n === 10 ? 40 : ROUND; S.spawnT = 1.6; S.cloverT = grnd(5, 8); S.ann = { t: 1.8 }; }
    S.ann.a = "ROUND " + n + " · " + CAMP_NAME[n]; S.ann.b = k === "boss" ? "BOSS!" : k === "C" ? "NOM!" : n === 10 ? "ONE LIFE" : "KICK!"; S.ann.t = 1.8;
    S.rStart = S.score; S.rPen = false; S.rT0 = S.t;
    // everything ramps: each event timer is pulled in to at most this round's gap, and every round starts lively (a moth or wasp within seconds)
    rearm(); S.mothT = Math.min(S.mothT, grnd(2.2, 4));
    if (n === 1) { S.evT = grnd(8, 11); S.zoomT = grnd(9, 13); S.laserT = grnd(11, 15); S.dogT = grnd(16, 22); }
    if (n === 10) { S.lives = 1; S.hb = S.hc = 100; S.finale = false; S.dogT = grnd(5, 9); S.tomT = grnd(10, 16); S.laserT = grnd(3, 6); }
    toast(CAMP_TIP[n], 3200); track("basil/round-" + n);
  }
  // ---------- the win: 3AM conquered ----------
  function win() {
    var wb = STAGE === 2 ? 15000 : 10000; addPts(wb); S.round = 11; S.won = true; S.newWin = !S.hadWon; lset(WON, 1); track("basil/win");
    S.lanes = [null, null, null]; S.fly = []; S.zoom = S.moth = S.laser = S.tom = S.dog = S.rb = S.clover = S.sneak = S.treat = S.boss = S.ev = S.flea = null; S.itchT = 0; S.nipT = S.frenzyT = S.sinkT = 0; S.ann = null; S.rain = []; shakeT = 0;
    var cols = ["#FFE08A", "#FF8AD0", "#6FA8C9", "#5BD08A", "#E0703A", "#B5308A", "#FFFFFF"], q = quiet(), c = { t: 0, dur: 6, conf: [], str: [], fw: [], fwT: 0.2 };
    for (var i = 0; i < (q ? 40 : 130); i++) c.conf.push({ x: rnd(0, W), y: rnd(-H, 0), vy: rnd(50, 120), ph: rnd(0, 6), r: rnd(0, 6), vr: rnd(-6, 6), w: rnd(4, 8), h: rnd(3, 6), col: pick(cols) });
    for (i = 0; i < (q ? 4 : 12); i++) c.str.push({ x: rnd(10, W - 10), y: rnd(-H, -20), vy: rnd(70, 120), ph: rnd(0, 6), col: pick(cols) });
    S.celeb = c; if (STAGE !== 2) toast("3AM CONQUERED. +" + fmt(wb) + ".", 3000); // the Vet's title sits where the toast would
  }
  function celebStep(dt) {
    var c = S.celeb; c.t += dt; S.blink -= dt;
    c.conf.forEach(function (p) { p.y += p.vy * dt; p.x += Math.sin(S.t * 2 + p.ph) * 30 * dt; p.r += p.vr * dt; if (p.y > H + 10) { p.y = -10; p.x = rnd(0, W); } });
    c.str.forEach(function (p) { p.y += p.vy * dt; if (p.y > H + 60) { p.y = -70; p.x = rnd(10, W - 10); } });
    c.fwT -= dt; if (c.fwT <= 0 && !quiet()) { c.fwT = rnd(0.35, 0.6); var fx = rnd(60, W - 60), fy = rnd(50, 170), hue = rnd(0, 360); for (var i = 0; i < 34; i++) { var a = i / 34 * Math.PI * 2, sp = rnd(80, 150); c.fw.push({ x: fx, y: fy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, l: rnd(0.8, 1.2), col: "hsl(" + ((hue + rnd(-25, 25)) % 360) + ",90%,65%)" }); } }
    c.fw = c.fw.filter(function (p) { p.vy += 70 * dt; p.vx *= Math.pow(0.4, dt); p.vy *= Math.pow(0.6, dt); p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt; return p.l > 0; });
    S.t += dt; if (c.t >= c.dur && !S.over) end();
  }
  function celebDraw() {
    var c = S.celeb, t = c.t;
    ctx.save(); scene(STAGE === 2 && V ? V.celebBack : null); if (STAGE === 2 && V) V.celebFront(t); ctx.fillStyle = STAGE === 2 ? "rgba(18,14,48,.3)" : "rgba(18,14,48,.5)"; ctx.fillRect(0, 0, W, H);
    c.fw.forEach(function (p) { ctx.globalAlpha = Math.max(0, Math.min(1, p.l)); circ(p.x, p.y, 2.4, p.col); }); ctx.globalAlpha = 1;
    c.str.forEach(function (p) { ctx.strokeStyle = p.col; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.beginPath(); for (var k = 0; k <= 10; k++) { var yy = p.y + k * 6, xx = p.x + Math.sin(S.t * 5 + p.ph + k * 0.6) * 7; if (k) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); } ctx.stroke(); });
    // both cats dancing on the bench, happy eyes
    var K = 0.42, q = quiet();
    [["b", s2(112, 72), 0], ["c", s2(248, 292), Math.PI / 2]].forEach(function (d) {
      var b = q ? 0 : Math.abs(Math.sin(t * 7 + d[2])) * 22, rot = q ? 0 : Math.sin(t * 7 + d[2]) * 0.12;
      ctx.save(); ctx.translate(d[1], BENCH + 4 - b); ctx.rotate(rot); ctx.scale(d[0] === "c" ? -K : K, K * (1 - (b ? 0 : 0.04))); ctx.translate(-120, -246);
      spr(d[0] === "b" ? "basil-body" : "clover-body"); spr(d[0] === "b" ? "basil-head" : "clover-head"); catEyes(d[0], "happy"); ctx.restore();
      if (Math.sin(t * 3 + d[2]) > 0.3) { ctx.fillStyle = "#FF8AD0"; ctx.font = "700 16px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("♥", d[1] + (d[0] === "b" ? -34 : 34), BENCH - 120 - b); }
    });
    c.conf.forEach(function (p) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.col; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r))); ctx.restore(); });
    // banner
    if (STAGE === 2 && V) V.celebText(t, q); else {
    var k = Math.min(1, t / 0.45), sc = q ? 1 : 0.5 + 0.5 * k + Math.sin(Math.min(1, t / 0.6) * Math.PI) * 0.12;
    ctx.save(); ctx.translate(180, 96); ctx.scale(sc, sc); ctx.textAlign = "center"; ctx.lineJoin = "round";
    ctx.font = "900 36px Poppins, sans-serif"; ctx.lineWidth = 8; ctx.strokeStyle = "#2B2340"; ctx.strokeText("3AM CONQUERED", 0, 0); ctx.fillStyle = "#FFE08A"; ctx.fillText("3AM CONQUERED", 0, 0);
    if (t > 0.5) { ctx.font = "900 24px Poppins, sans-serif"; ctx.lineWidth = 6; ctx.strokeText("BENCH LEGEND", 0, 34); ctx.fillStyle = "#FF8AD0"; ctx.fillText("BENCH LEGEND", 0, 34); }
    if (t > 1) { ctx.font = "800 14px Poppins, sans-serif"; ctx.lineWidth = 4; ctx.strokeText("All 10 rounds · +10,000", 0, 60); ctx.fillStyle = "#FFFFFF"; ctx.fillText("All 10 rounds · +10,000", 0, 60); }
    ctx.restore(); }
    if (t > 2 && !S.over) { ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.font = "600 11px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("tap to continue", 180, H - 14); }
    ctx.restore();
  }
  function startBonus() {
    S.round++; S.bonus = ROUND; S.bonuses++; S.ann = { t: 1.8, a: "ROUND " + S.round, b: "NOM!" }; S.spawnT = 1.6; S.clover = null; S.cloverT = grnd(12, 16); S.sneak = null; S.sneakT = grnd(3, 5) + 3 * (1 - lvl()); S.treat = null; S.treatT = grnd(8, 14); S.rT0 = S.t;
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
    var ls = [c.lane - 1, c.lane + 1, c.lane].filter(function (j) { var it = S.lanes[j]; return j >= 0 && j < 3 && it && it.landed && it.kind !== "tank" && !isSpiky(it.kind) && it.kind !== "hedgehog" && it.kind !== "tap" && it.kind !== "fish" && it.kind !== "toast"; });
    if (!ls.length) { toast("Clover calmed down. For now."); return; }
    var j = ls[0], it = S.lanes[j]; S.lanes[j] = null; S.combo = 0;
    S.fly.push({ kind: it.kind, x: LANES[j], y: BENCH - 2, vx: (j - c.lane || 1) * rnd(140, 220), vy: -rnd(240, 300), r: 0, vr: rnd(-9, 9) });
    float(LANES[j], BENCH - 70, "Stolen!", "#B07A0C"); toast(pick(CLOVSTEAL));
  }
  function sinkTime() {
    S.sinkT = 5; var wasDirty = S.dirt > 0.3; S.dirt *= 0.5; S.wet = Math.min(1, S.wet + 0.6); toast(wasDirty ? "Sink time! Basil had a bath. Sort of. Now he’s dirty AND wet. Double points." : "Sink time! Splash everything. Double points.");
    for (var i = 0; i < 3; i++) { var it = S.lanes[i]; if (it && it.kind !== "tap" && it.kind !== "fish" && it.kind !== "hedgehog") { S.lanes[i] = null; addPts(2 * U()); S.fly.push({ kind: it.kind, x: LANES[i], y: BENCH - 2, vx: (i - 1 || 1) * rnd(120, 200), vy: -rnd(260, 340), r: 0, vr: rnd(-10, 10) }); } }
    for (var k = 0; k < 40; k++) S.drops.push({ x: 180 + rnd(-40, 40), y: 210, vx: rnd(-180, 180), vy: -rnd(120, 360), l: rnd(.6, 1.2) });
  }
  var shakeT = 0; function shake() { if (!quiet()) shakeT = 0.3; }
  function float(x, y, txt, col) { S.fx.push({ x: x, y: y, txt: txt, col: col, l: 1 }); }
  var toastT = 0; function toast(m, ms) { if (STAGE === 2 && S && S.boss && !S.boss.done && S.boss.atk) return; /* the Vet: attack calls sit where the toast would */ var el = $("bk-toast"); el.textContent = m; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { el.hidden = true; }, ms || 1700); }

  function laneAt(ev) { var r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * W; return x < 126 ? 0 : x < 234 ? 1 : 2; }
  function eatMoth() {
    var m = S.moth; if (!m || m.eaten) return false;
    if (m.kind === "wasp") { m.eaten = 0.4; S.ouchT = 0.7; S.ouches++; float(m.x, m.y - 10, "Stung!", "#C2553A"); toast(pick(["Wasp. Bad idea. Very bad idea.", "Stung on the nose. Dignity: gone.", "That was not a moth.", "Wasps bite back. Well, sting."])); shake(); hurt(S.bonus > 0 ? "c" : "b", 20); return true; }
    m.eaten = 0.4; S.eaten++; S.frenzyT = 6; addPts(2 * U()); float(m.x, m.y - 10, "Nom! +" + fmt(2 * U()), "#B5308A"); toast(pick(MOTHQ)); track("basil/moth");
    return true;
  }
  cv.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    if (S.celeb) { if (S.celeb.t > 1.5 && !S.over) S.celeb.t = S.celeb.dur; return; }
    var rP = cv.getBoundingClientRect(), pX = (e.clientX - rP.left) / rP.width * W, pY = (e.clientY - rP.top) / rP.height * H;
    if (running && !paused && !S.over && S.boss) { if (!S.boss.done) bossTap(pX, pY); return; } // every tap in the boss fight goes to the boss
    if (running && !paused && !S.over && S.ev && evTap(pX, pY)) return;
    if (running && !paused && !S.over && S.dog && !S.dog.gone && pX > 214 && pX < 348 && pY > 16 && pY < 165) { hissDog(); return; }
    if (running && !paused && !S.over && S.sneak && S.sneak.phase === "creep") {
      var r0 = cv.getBoundingClientRect(), x0 = (e.clientX - r0.left) / r0.width * W, y0 = (e.clientY - r0.top) / r0.height * H;
      if (Math.abs(x0 - S.sneak.x) < 40 && y0 > BENCH - 90 && y0 < BENCH + 20) { shoo(); return; }
    }
    if (running && !paused && !S.over && S.treat && S.treat.landed && !S.treat.done) {
      var r1 = cv.getBoundingClientRect(), x1 = (e.clientX - r1.left) / r1.width * W, y1 = (e.clientY - r1.top) / r1.height * H;
      if (Math.abs(x1 - S.treat.x) < 40 && y1 > BENCH - 80 && y1 < BENCH + 20) { grabTreat(); return; }
    }
    if (running && !paused && !S.over && (S.zoom && !S.zoom.hit || S.rb && !S.rb.caught)) {
      var r3 = cv.getBoundingClientRect(), x3 = (e.clientX - r3.left) / r3.width * W, y3 = (e.clientY - r3.top) / r3.height * H;
      if (S.zoom && !S.zoom.hit && Math.abs(x3 - S.zoom.x) < 50 && Math.abs(y3 - S.zoom.y) < 40) { swipeZoom(); return; }
      if (S.rb && !S.rb.caught && Math.hypot(x3 - S.rb.x, y3 - S.rb.y) < 46) { catchRainbow(); return; }
    }
    if (running && !paused && !S.over && (S.tom && !S.tom.done || S.laser && !S.laser.done)) {
      var r4 = cv.getBoundingClientRect(), x4 = (e.clientX - r4.left) / r4.width * W, y4 = (e.clientY - r4.top) / r4.height * H;
      if (S.tom && !S.tom.done && x4 > 206 && x4 < 356 && y4 > 10 && y4 < 140) { hissTom(); return; }
      if (S.laser && !S.laser.done && Math.hypot(x4 - S.laser.x, y4 - S.laser.y) < 32) { zapLaser(); return; }
    }
    if (running && !paused && !S.over && S.flea && !S.flea.done) {
      var rF = cv.getBoundingClientRect(), xF = (e.clientX - rF.left) / rF.width * W, yF = (e.clientY - rF.top) / rF.height * H;
      if (Math.hypot(xF - S.flea.x, yF - S.flea.y) < 38) { fleaTap(); return; }
    }
    if (running && !paused && !S.over && S.moth && !S.moth.eaten) {
      var r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
      if (Math.hypot(x - S.moth.x, y - S.moth.y) < 42) { eatMoth(); return; }
    }
    var ln = laneAt(e);
    if (running && !paused && !S.over && !S.boss && tapHalf() < 99) { // from round 4 the tap zones shrink: tap near the thing, not just its third
      var r5 = cv.getBoundingClientRect(), x5 = (e.clientX - r5.left) / r5.width * W, it5 = S.lanes[ln];
      if (Math.abs(x5 - LANES[ln] - (it5 && it5.ox || 0)) > tapHalf()) return;
    }
    kick(ln);
  });
  document.addEventListener("keydown", function (e) {
    if (!running || !$("bk-help").hidden) return;
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    var k = { "1": 0, "2": 1, "3": 2, ArrowLeft: 0, ArrowDown: 1, ArrowRight: 2, a: 0, s: 1, d: 2, A: 0, S: 1, D: 2 }[e.key], up = /^[4wW]$/.test(e.key) || e.key === "ArrowUp";
    if ((k != null || up) && !paused && !S.over && !S.boss && S.ev && evKey(k, up)) { e.preventDefault(); return; }
    if (k != null && k !== 1 && running && !paused && !S.over && S.treat && S.treat.landed && !S.treat.done && (k === 2) === (S.treat.side > 0)) { e.preventDefault(); grabTreat(); return; }
    // Basil sneaking up? The key on his side (left: A / 1 / Left, right: D / 3 / Right) shoos him first.
    if (k != null && k !== 1 && running && !paused && !S.over && S.sneak && S.sneak.phase === "creep" && (k === 0) === ((S.sneak.dir || 1) > 0)) { e.preventDefault(); shoo(); return; }
    if (k != null) { e.preventDefault(); kick(k); }
    if ((/^[4wW]$/.test(e.key) || e.key === "ArrowUp") && running && !paused && !S.over) { e.preventDefault(); topAction(); }
    if (e.key === " " && S.celeb && !S.over && S.celeb.t > 1.5) { e.preventDefault(); S.celeb.t = S.celeb.dur; return; }
    if (e.key === " " && S.over) { e.preventDefault(); start(); }
    if (e.key === "p" || e.key === "Escape") togglePause();
  });

  // ---------- loop ----------
  function step(dt) {
    S.t += dt; S.blink -= dt; if (S.blink < -3.2) S.blink = 0.15;
    if (S.sinkT > 0) S.sinkT -= dt;
    if (S.ouchT > 0) S.ouchT -= dt;
    if (S.happyT > 0) S.happyT -= dt;
    if (S.yawnT > 0) S.yawnT -= dt;
    if (S.flashT > 0) S.flashT -= dt; if (S.butterT > 0) S.butterT -= dt; if (S.towelT > 0) S.towelT -= dt; if (S.leapT > 0) S.leapT -= dt;
    if (S.wet > 0) S.wet = Math.max(0, S.wet - dt * 0.015);
    if (S.frenzyT > 0) { S.frenzyT -= dt; if (S.frenzyT <= 0) { S.frenzyT = 0; toast("Frenzy over. Back to regular evil."); } }
    if (!S.boss) S.mothT -= dt;
    if (!S.moth && S.mothT <= 0) { var fromL = Math.random() < .5, mv = 1 + 0.6 * lvl(); S.moth = { kind: G() < rp("wasp") ? "wasp" : G() < .5 ? "moth" : "butterfly", x: fromL ? -20 : W + 20, y: rnd(110, 200), vx: (fromL ? 1 : -1) * rnd(50, 80) * mv, ph: rnd(0, 6), life: 9 / mv }; S.mothT = every("moth"); }
    var mo = S.moth;
    if (mo) {
      if (mo.eaten) { mo.eaten -= dt; if (mo.eaten <= 0) S.moth = null; }
      else { mo.life -= dt; mo.x += mo.vx * dt; mo.y += Math.sin(S.t * 4 + mo.ph) * 60 * dt; if ((mo.x < 30 && mo.vx < 0) || (mo.x > W - 30 && mo.vx > 0)) { if (mo.life > 1.5) mo.vx *= -1; } if (mo.life <= 0 || mo.x < -40 || mo.x > W + 40) S.moth = null; }
    }
    S.rain = S.rain.filter(function (q) {
      if (!q.landed) { q.vy += 900 * dt; q.y += q.vy * dt; if (q.y >= BENCH - 4) { q.y = BENCH - 4; q.landed = true; addPts(U()); float(q.x, BENCH - 40, "+" + fmt(U()), "#B5308A"); } return true; }
      q.t += dt; return q.t < 0.7;
    });
    S.shards = S.shards.filter(function (q) { q.vy += 900 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.r += q.vr * dt; q.l -= dt; return q.l > 0 && q.y < H + 20; });
    debrisStep(dt);
    if (S.scratchT > 0) S.scratchT -= dt;
    if (S.boss) { bossStep(dt); if (S.ann && S.ann.t > 0) S.ann.t -= dt; if (shakeT > 0) shakeT -= dt; if (S.paw) { S.paw.t += dt; if (S.paw.t > 0.22) S.paw = null; } }
    else {
    if (S.bonus > 0) { S.bonus -= dt; if (S.bonus <= 0 && CAMP) { S.bonus = 0; campNext(); hud(); return; } if (S.bonus <= 0) { S.bonus = 0; S.sneak = null; S.sneakT = grnd(6, 9); S.treat = null; S.treatT = grnd(8, 14); for (var j2 = 0; j2 < 3; j2++) { var o2 = S.lanes[j2]; if (o2 && (FOOD.indexOf(o2.kind) >= 0 || isBad(o2.kind) || o2.kind === "hairball")) S.lanes[j2] = null; } S.round++; S.roundT = ROUND; S.ann = { t: 1.8, a: "ROUND " + S.round, b: "KICK!" }; S.spawnT = 1.6; toast("Basil’s back. He saw everything."); if (BOSS_ON && S.round % 5 === 0) { S.round--; startBoss(); } } }
    else { S.roundT -= dt; if (S.roundT <= 0 && CAMP) { if (S.round === 10 && !S.finale) { S.finale = true; startBoss(true); hud(); return; } campNext(); hud(); return; } if (S.roundT <= 0) { if (BOSS_ON && (S.round + 1) % 5 === 0) startBoss(); else startBonus(); } }
    if (S.ann && S.ann.t > 0) { S.ann.t -= dt; if (S.spawnT < 0.2) S.spawnT = 0.2; }
    if (shakeT > 0) shakeT -= dt;
    if (S.paw) { S.paw.t += dt; if (S.paw.t > 0.22) { S.paw = null; } }
    S.lean *= 0.85;
    evStep(dt); if (S.over) return; var frz = evFrozen();
    if (!frz) S.spawnT -= dt;
    if (S.spawnT <= 0) { spawn(); S.spawnT = spawnEvery() * rnd(0.8, 1.2); }
    S.specialT -= dt;
    if (S.specialT <= 0) { if (spawn(G() < 0.55 ? "tap" : "fish")) S.specialT = every("special"); else S.specialT = 1; }
    for (var i = 0; i < 3; i++) {
      var it = S.lanes[i]; if (!it) continue;
      if (frz) continue;
      if (it.hold > 0) { it.hold -= dt; continue; }
      if (!it.landed) { it.vy += 1600 * fallK() * dt; it.y += it.vy * dt; if (it.y >= BENCH) { it.y = BENCH; it.landed = true; if (it.kind !== "hairball" && !it.hp && (S.butterT > 0 || Math.random() < rp("slide"))) it.vx = rnd(50, 95) * (S.butterT > 0 ? 1.8 : 1) * (Math.random() < 0.5 ? -1 : 1); } continue; }
      if (it.vx) { it.ox = (it.ox || 0) + it.vx * dt; it.vx *= Math.pow(0.015, dt); if (Math.abs(it.vx) < 4 || Math.abs(it.ox) > 26) { it.vx = 0; it.ox = Math.max(-26, Math.min(26, it.ox)); } }
      if (it.hit > 0) it.hit -= dt;
      if (S.frenzyT <= 0) it.life -= dt * (S.laser && !S.laser.done ? 1.3 : 1);
      if (it.life <= 0) {
        S.lanes[i] = null;
        if (it.kind === "tap" || it.kind === "fish") continue;
        if (it.kind === "toast") { S.fx.push({ x: LANES[i], y: BENCH - 40, txt: S.bonus > 0 ? "toast: ignored" : "Toast left. Wise.", col: "#8A7BB0", l: 0.8 }); continue; }
        if (it.kind === "hedgehog") { float(LANES[i], BENCH - 50, "Still asleep. Good call.", "#2E7D6B"); continue; }
        if (isSpiky(it.kind) || isBad(it.kind)) { S.fx.push({ x: LANES[i], y: BENCH - 40, txt: "poof", col: "#8A7BB0", l: 0.8 }); continue; }
        if (S.bonus > 0) {
          if (it.kind === "hairball") { S.rPen = true; var hp0 = Math.min(S.cPts, 3 * U()); addPts(-hp0); float(LANES[i], BENCH - 70, "Gross. -" + fmt(hp0), "#C2553A"); toast(pick(["The hairball stayed. Someone will step in it.", "Hairball left on the bench. Unforgivable.", "Clover’s gift went unclaimed. Gross."])); continue; }
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
    // night falls every 4th round; zoomies only happen at night
    var nt = isNight() ? 1 : 0; S.nightK += (nt - S.nightK) * Math.min(1, dt * 0.8);
    if (nt && !S.wasNight && !CAMP) toast(pick(["The sun’s down. Zoomies o’clock.", "Night shift. Watch for zoomies.", "Moon’s up. The cats are feral now."])); S.wasNight = nt;
    var zm = S.zoom;
    if (!zm) { { S.zoomT -= dt; if (S.zoomT <= 0 && !(S.ann && S.ann.t > 0)) { var zl = Math.random() < 0.5; S.zoom = { who: S.bonus > 0 ? "b" : "c", x: zl ? -60 : W + 60, dir: zl ? 1 : -1, y: rnd(150, 225), sp: rnd(440, 560), hit: 0 }; S.zoomT = G() < 0.1 + 0.15 * lvl() ? grnd(1.2, 2.5) : every("zoom"); } } }
    else if (zm.hit) { zm.hit -= dt; zm.y += 260 * dt; if (zm.hit <= 0) S.zoom = null; }
    else { zm.x += zm.dir * zm.sp * dt; if (zm.x < -80 || zm.x > W + 80) S.zoom = null; }
    var rbf = S.rb;
    if (!rbf) { S.rbT -= dt; if (S.rbT <= 0 && rAge() > 5) { var rl = Math.random() < 0.5; S.rb = { x: rl ? -24 : W + 24, y: rnd(84, 118), vx: (rl ? 1 : -1) * rnd(70, 90), ph: rnd(0, 6), caught: 0 }; S.rbT = every("rainbow"); } }
    else if (rbf.caught) { rbf.caught -= dt; if (rbf.caught <= 0) S.rb = null; }
    else { rbf.x += rbf.vx * dt; rbf.y += Math.sin(S.t * 3 + rbf.ph) * 30 * dt; if (rbf.x < -40 || rbf.x > W + 40) S.rb = null; }
    // visitors at the window: the stray tom (turf war) or the barking dog (panic: everything falls twice as fast)
    if (!S.dog && !S.tom && !S.ev) {
      S.dogT -= dt; S.tomT -= dt;
      if (S.tomT <= 0 && rAge() > 3 && !(S.ann && S.ann.t > 0)) { var tt = rp("tomT"); S.tom = { t: tt, max: tt, hits: 0, k: 0, hitT: 0, done: null, doneT: 0 }; S.tomT = every("tom"); S.ann = { t: 1.4, a: s2("TURF WAR!", "STARE-OFF!"), b: "HISS!" }; track("basil/tom"); }
      else if (S.dogT <= 0 && rAge() > 3 && !(S.ann && S.ann.t > 0)) { startDog(); S.dogT = every("dog"); }
    }
    var tm = S.tom;
    if (tm) { if (tm.hitT > 0) tm.hitT -= dt;
      if (tm.done) { tm.doneT -= dt; tm.k = Math.max(0, Math.min(1, tm.doneT * 3)); if (tm.doneT <= 0) S.tom = null; }
      else { tm.k = Math.min(1, tm.k + dt * 4); tm.t -= dt; if (tm.t <= 0) { tomRaid(); if (S.over) return; } } }
    var dg = S.dog;
    if (dg) { dg.t -= dt; dg.k = dg.t < 0.3 ? Math.max(0, dg.t / 0.3) : Math.min(1, dg.k + dt * 4); if (dg.t <= 0) { S.dog = null; if (!dg.gone) toast("Dog gone. Dignity: partly restored."); } }
    if (STAGE === 2) {
      var fl = S.flea;
      if (!fl) { S.fleaT -= dt; if (S.fleaT <= 0 && rAge() > 3 && !(S.ann && S.ann.t > 0)) { var fd = Math.random() < 0.5 ? 1 : -1; S.flea = { x: fd > 0 ? -30 : W + 30, y: BENCH - 104, dir: fd, sp: 58 + 26 * Math.min(1.3, lvl()), hits: 0, done: 0 }; S.fleaT = every("flea"); } }
      else if (fl.done) { fl.done -= dt; if (fl.done <= 0) S.flea = null; }
      else { fl.x += fl.dir * fl.sp * dt; if (fl.dir > 0 ? fl.x > W + 30 : fl.x < -30) { S.flea = null; S.itchT = 5; S.combo = 0; S.rPen = true; float(180, BENCH - 170, "ITCHY!", "#C2553A"); toast("The fleas got away. Itchy for 5 s: some taps won’t land.", 2200); } }
      if (S.itchT > 0) S.itchT -= dt;
    }
    var lz = S.laser;
    if (!lz) { S.laserT -= dt; if (S.laserT <= 0 && rAge() > 3) { S.laser = { x: rnd(60, W - 60), y: rnd(90, BENCH - 40), tx: 180, ty: 160, t: 6, hits: 0, jt: 0, done: 0 }; S.laserT = every("laser"); } }
    else if (lz.done) { lz.done -= dt; if (lz.done <= 0) S.laser = null; }
    else { lz.t -= dt; lz.jt -= dt; if (lz.jt <= 0) { lz.tx = rnd(30, W - 30); lz.ty = rnd(80, BENCH - 30); lz.jt = rnd(0.45, 0.8); } lz.x += (lz.tx - lz.x) * Math.min(1, dt * 8); lz.y += (lz.ty - lz.y) * Math.min(1, dt * 8); if (lz.t <= 0) { S.laser = null; toast("The dot vanished. The cats are still looking for it."); } }
    if (S.ctitle) { S.ctitle.t -= dt; if (S.ctitle.t <= 0) S.ctitle = null; }
    // catnip: anything safe that lands gets dealt with automatically
    if (S.nipT > 0) { S.nipT -= dt; for (var ni = 0; ni < 3; ni++) { var nit = S.lanes[ni]; if (nit && nit.landed && !nit.hp && !isSpiky(nit.kind) && !isBad(nit.kind) && nit.kind !== "catnip" && nit.kind !== "hedgehog" && nit.kind !== "tap" && (nit.kind !== "toast" || S.bonus > 0) && (S.bonus <= 0 || FOOD.indexOf(nit.kind) >= 0)) kick(ni); } if (S.nipT <= 0) toast("Catnip wore off. Mild regret."); }
    // Bonus treat next to the resting cat (Clover on her cushion in Basil's rounds; sulking Basil in Clover's).
    var tr = S.treat;
    if (!tr) {
      S.treatT -= dt;
      var resting = S.bonus > 0 ? !S.sneak : !S.clover;
      if (S.treatT <= 0 && resting && !(S.ann && S.ann.t > 0)) { var sd = S.bonus > 0 ? -1 : 1; S.treat = { side: sd, x: sd > 0 ? 330 : 54, y: -20, vy: 120, kind: G() < 0.5 ? (STAGE === 2 ? "jerky" : "steak") : (STAGE === 2 ? "sardine" : "drumstick"), landed: false, life: Math.max(0.75, 1.2 - S.round * 0.03), done: null, fade: 0 }; }
    } else if (tr.done) { tr.fade -= dt; if (tr.done === "cat") { tr.x += (tr.side > 0 ? 0 : -420) * dt; tr.y -= (tr.side > 0 ? 0 : 160) * dt; } if (tr.fade <= 0) { S.treat = null; S.treatT = every("treat"); } }
    else if (!tr.landed) { tr.vy += 1400 * dt; tr.y += tr.vy * dt; if (tr.y >= BENCH - 2) { tr.y = BENCH - 2; tr.landed = true; } }
    else { tr.life -= dt; if (tr.life <= 0) { tr.done = "cat"; tr.fade = tr.side > 0 ? 0.3 : 0.6; float(tr.x, BENCH - 60, tr.side > 0 ? "Clover: mine." : "Basil: no.", "#6B5A93"); } }
    // Clover's round: Basil sneaks up from the sink. Tap him to shoo him; if he gets there he swipes her (-10 points).
    if (S.bonus > 0) {
      var sb = S.sneak;
      if (!sb) { S.sneakT -= dt; if (S.sneakT <= 0) { var dr = CAMP && S.round === 2 || Math.random() < 0.5 ? 1 : -1; S.sneak = { x: dr > 0 ? 60 : W - 60, dir: dr, phase: "creep" }; toast("Basil is sneaking up on Clover from the " + (dr > 0 ? "left" : "right") + ". Tap him!"); } }
      else if (sb.phase === "creep") { sb.x += rp("sneakV") * dt * sb.dir; var tgt = 180 - sb.dir * 46 * cloverFat(); if (sb.dir > 0 ? sb.x >= tgt : sb.x <= tgt) { sb.phase = "flee"; S.rPen = true; addPts(-Math.min(S.cPts, 10 * U())); S.slash.push({ x: tgt + 20 * sb.dir, y: BENCH - 40, l: 0.4 }); S.fx.push({ x: tgt + 10 * sb.dir, y: BENCH - 90, txt: "Swiped! -" + fmt(10 * U()), col: "#C2553A", l: 1.2 }); toast("Basil swiped Clover. Sibling justice. -" + fmt(10 * U()) + " points."); shake(); } }
      else { sb.x -= 160 * dt * sb.dir; if (sb.dir > 0 ? sb.x <= 52 : sb.x >= W - 52) { S.sneak = null; S.sneakT = every("sneak"); } }
    } else S.sneak = null;
    // Clover
    S.cloverT -= dt; if (S.bonus > 0) S.clover = null;
    if (!S.clover && S.cloverT <= 0 && S.bonus <= 0) {
      var free = [0, 1, 2].filter(function (j) { return !S.lanes[j]; });
      if (free.length) { var ln = gpick(free); S.clover = { lane: ln, x: ln < 1 ? -60 : W + 60, dir: ln < 1 ? 1 : -1, state: "walk", sit: rnd(1.6, 2.4), cross: S.cross }; if (ln === 1) { S.clover.x = -60; S.clover.dir = 1; } }
      S.cloverT = every("clover");
    }
    var c = S.clover;
    if (c) {
      if (c.state === "walk") { c.x += c.dir * 260 * dt; if ((c.dir > 0 && c.x >= LANES[c.lane]) || (c.dir < 0 && c.x <= LANES[c.lane])) { c.x = LANES[c.lane]; c.state = "sit"; } }
      else if (c.state === "sit") { c.sit -= dt; if (c.sit <= 0) { c.state = "leave"; if (c.cross) cloverSteals(c); } }
      else { c.x += (c.hit ? (c.x < 180 ? -1 : 1) * 520 : c.dir * 260) * dt; if (c.x < -80 || c.x > W + 80) S.clover = null; }
    }
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
    if (!paused && S.celeb) celebStep(dt); else if (!paused && !S.over) step(dt);
    if (S.celeb) celebDraw(); else draw(); raf = requestAnimationFrame(frame);
  }

  // ---------- drawing ----------
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function circ(x, y, r, f) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = f; ctx.fill(); }
  function ell(x, y, a, b, f, rot) { ctx.beginPath(); ctx.ellipse(x, y, a, b, rot || 0, 0, 7); ctx.fillStyle = f; ctx.fill(); }
  function scene(mid) {
    if (STAGE === 2 && V) { V.back(); if (mid) mid(); V.table(); } else {
    ctx.fillStyle = "#F3E9DA"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#EBDDC8"; for (var y = 0; y < BENCH - 24; y += 26) for (var x = (y / 26) % 2 ? 0 : 13; x < W; x += 26) ctx.fillRect(x, y, 24, 24);
    ctx.fillStyle = "#F3E9DA"; for (y = 0; y < BENCH - 24; y += 26) for (x = (y / 26) % 2 ? 0 : 13; x < W; x += 26) ctx.fillRect(x + 1, y + 1, 22, 22);
    rr(222, 24, 118, 86, 8); var nk = S ? S.nightK || 0 : 0; ctx.fillStyle = nk > 0.5 ? "#26305E" : nk > 0.15 ? "#E9A77A" : "#BFE0F2"; ctx.fill(); ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 6; ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(281, 24); ctx.lineTo(281, 110); ctx.moveTo(222, 67); ctx.lineTo(340, 67); ctx.stroke();
    ctx.save(); rr(222, 24, 118, 86, 8); ctx.clip();
    if (nk > 0.5) { circ(312, 44, 10, "#F4F1DE"); circ(307, 41, 9, "#26305E"); ctx.fillStyle = "#F4F1DE"; [[236, 36], [258, 52], [246, 84], [300, 92], [326, 80], [270, 34]].forEach(function (p) { ctx.fillRect(p[0], p[1], 2, 2); }); }
    else circ(310, 46 + nk * 120, 10, nk > 0.15 ? "#F6A04D" : "#FFE08A");
    if (S && S.dog) dogDraw(S.dog.k); if (S && S.tom) tomDraw(S.tom);
    ctx.restore();
    // sink at back left
    rr(14, BENCH - 36, 78, 14, 6); ctx.fillStyle = S && S.sinkT > 0 ? "#9FD3EE" : "#D9E2E8"; ctx.fill();
    ctx.strokeStyle = "#AEB8C0"; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(30, BENCH - 36); ctx.lineTo(30, BENCH - 60); ctx.quadraticCurveTo(30, BENCH - 70, 44, BENCH - 70); ctx.lineTo(50, BENCH - 66); ctx.stroke();
    // bench
    ctx.fillStyle = "#C99A63"; ctx.fillRect(0, BENCH - 24, W, 26); ctx.fillStyle = "#B4834E"; ctx.fillRect(0, BENCH + 2, W, 6);
    ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, BENCH + 8, W, H - BENCH);
    ctx.strokeStyle = "#E2D6C3"; ctx.lineWidth = 2; for (var i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(i * 120, BENCH + 14); ctx.lineTo(i * 120, H); ctx.stroke(); }
    for (i = 0; i < 3; i++) { rr(i * 120 + 50, BENCH + 30, 20, 6, 3); ctx.fillStyle = "#CFC3B0"; ctx.fill(); }
    }
    // lane hints
    ctx.fillStyle = "rgba(43,94,128,.10)"; LANES.forEach(function (x, k) { ctx.beginPath(); ctx.ellipse(x, BENCH - 6, 34, 7, 0, 0, 7); ctx.fill(); ctx.fillStyle = "rgba(43,94,128,.35)"; ctx.font = "600 11px Poppins, sans-serif"; ctx.textAlign = "center"; doorKey(x, k); ctx.fillStyle = "rgba(43,94,128,.10)"; });
  }
  function fluff(cx, cy, a, b, n, col, edge) { for (var i = 0; i < n; i++) { var t = i / n * Math.PI * 2; circ(cx + Math.cos(t) * a, cy + Math.sin(t) * b, edge, col); } }
  // ---------- cats (sprites drawn from reference photos; eyes, paws, dirt and water drawn live) ----------
  var SPR = {};
  // Stage 2 (the Vet) lives in vet.js; without it the game is simply the Kitchen
  try { V = window.MW_VET ? window.MW_VET({ ctx: function () { return ctx; }, S: function () { return S; }, rr: rr, circ: circ, ell: ell, spr: spr, catEyes: catEyes, sprImg: function (n) { return sprOK(n) ? SPR[n] : null; }, W: W, H: H, BENCH: BENCH }) : null; } catch (e) { V = null; }
  var sprLeft = 6;
  ["basil-body", "basil-head", "clover-body", "clover-head", "basil-body-lion", "basil-head-lion"].forEach(function (n) { var im = new Image(); im.onload = im.onerror = function () { if (--sprLeft === 0 && typeof drawThumbs === "function") drawThumbs(); }; im.src = SBASE + "sprites/" + n + ".svg?v=2"; SPR[n] = im; });
  function sprOK(n) { var im = SPR[n]; return im && im.complete && im.naturalWidth > 0; }
  function spr(n) { if (STAGE === 2 && (n === "basil-body" || n === "basil-head") && sprOK(n + "-lion")) n += "-lion"; /* the Vet: Basil has had a lion cut */ if (sprOK(n)) ctx.drawImage(SPR[n], 0, 0, 240, 260); }
  function cloverFat() { return 1 + Math.min(1, Math.max(0, (S.bonuses || 1) - 1) * 0.1 + S.eatenFood / 240); }
  function catEyes(who, mode, cross) {
    // sprite coordinates (240 x 260 art)
    var E = who === "b" ? [[104, 88], [136, 88]] : [[103, 92], [137, 92]], iris = who === "b" ? "#A8B98E" : "#C9C653";
    E.forEach(function (e, k) {
      var x = e[0], y = e[1];
      if (S && S.nipT > 0 && mode !== "shut" && mode !== "ouch") {
        ell(x, y, 12, 12, "#FFFFFF"); ctx.lineWidth = 2.4; ctx.lineCap = "round";
        for (var sw = 0; sw < 3; sw++) { ctx.strokeStyle = "hsl(" + ((S.t * 220 + sw * 120 + k * 60) % 360) + ",85%,55%)"; ctx.beginPath(); ctx.arc(x, y, 3 + sw * 3, S.t * 8 + sw, S.t * 8 + sw + 4.2); ctx.stroke(); }
        circ(x, y, 2.4, "#1B1430"); return;
      }
      if (mode === "happy") {
        ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 3.4; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(x, y + 4, 8, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke();
        ctx.globalAlpha = 0.55; ell(x + (k ? 8 : -8), y + 15, 7, 4, "#F08AA8"); ctx.globalAlpha = 1;
        if (k === 1) { ctx.beginPath(); ctx.moveTo(110, 115); ctx.quadraticCurveTo(120, 124, 130, 115); ctx.lineTo(130, 120); ctx.quadraticCurveTo(120, 128, 110, 120); ctx.closePath(); ctx.fillStyle = "#F1CDAE"; ctx.fill();
          ctx.strokeStyle = "#3A3036"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(113, 114); ctx.quadraticCurveTo(116.5, 119, 120, 114); ctx.quadraticCurveTo(123.5, 119, 127, 114); ctx.stroke(); }
        return;
      }
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
    var leap = S.leapT > 0 ? Math.sin(S.leapT / 0.7 * Math.PI) * 110 : 0;
    ctx.save(); ctx.translate(x, BENCH + 4 - leap); ctx.rotate(S.lean + (leap ? Math.sin(S.t * 30) * 0.15 : 0)); ctx.scale(K, K); ctx.translate(-120, -246);
    var fx = 1, fy = 1;
    if (CL) { var fat = cloverFat(); fx = fat; fy = 1 + (fat - 1) * 0.25; }
    // body (Clover's stretches as she eats, up to twice as wide)
    ctx.save(); ctx.translate(120, 246); ctx.scale(fx, fy); ctx.translate(-120, -246); spr(CL ? "clover-body" : "basil-body"); if (V && S.stripe && S.stripe === (CL ? "c" : "b")) V.stripe();
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
    var mode = S.leapT > 0 || S.ev && !S.ev.done && (S.ev.m === "cucumber" || S.ev.m === "bath" || S.ev.m === "clipper") ? "wide" : S.towelT > 0 ? "shut" : S.ouchT > 0 ? "ouch" : CL && S.happyT > 0 ? "happy" : S.frenzyT > 0 || S.dog ? "wide" : (S.blink > 0 || sink || S.yawnT > 0) ? "shut" : "open";
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
    if (S.towelT > 0 && STAGE === 2) { ctx.fillStyle = "#6B5A93"; ctx.font = "800 11px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("needs a moment " + Math.ceil(S.towelT) + "s", 180, BENCH - 170); rr(150, BENCH - 162, 60, 20, 6); ctx.fillStyle = "#2B2340"; ctx.fill(); ctx.fillStyle = "#5BD08A"; ctx.font = "800 12px Poppins, sans-serif"; ctx.fillText("38.6°", 180, BENCH - 147); }
    else if (S.towelT > 0) { ctx.save(); ctx.translate(180 + Math.sin(S.t * 14) * 8, BENCH - 120); ctx.rotate(Math.sin(S.t * 14) * 0.2); rr(-46, -26, 92, 56, 10); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.fillStyle = "#6FA8C9"; ctx.fillRect(-46, 14, 92, 6); ctx.fillRect(-46, 23, 92, 3); ctx.restore(); ctx.fillStyle = "#6B5A93"; ctx.font = "800 11px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("being dried " + Math.ceil(S.towelT) + "s", 180, BENCH - 170); }
    if (S.boss) {} else if (CL) { if (S.sneak) sneaker(); else sulk(); } else cushion();
    if (sink && STAGE !== 2) { ctx.fillStyle = "rgba(120,190,230,.35)"; ctx.fillRect(0, BENCH - 30, W, 8); }
  }
  function sneaker() {
    var b = S.sneak, K = 0.3, bob = b.phase === "creep" ? Math.sin(S.t * 6) * 1.5 : 0;
    ctx.save(); ctx.translate(b.x, BENCH + 2 + bob); if ((b.phase === "flee") === ((b.dir || 1) > 0)) ctx.scale(-1, 1); ctx.scale(K, K * 0.82); ctx.translate(-120, -246);
    spr("basil-body"); spr("basil-head"); catEyes("b", b.phase === "flee" ? "shut" : "open"); ctx.restore();
    if (b.phase === "creep") { ctx.strokeStyle = "rgba(43,94,128,.45)"; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(b.x, BENCH - 32, 34 + Math.sin(S.t * 6) * 3, 0, 7); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = "#2B5E80"; ctx.font = "700 10px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText(FINE ? ((b.dir || 1) > 0 ? "\u2190 or A to shoo" : "\u2192 or D to shoo") : "tap to shoo", b.x, BENCH - 74); }
    if ((b.dir || 1) > 0 && STAGE !== 2) { rr(14, BENCH - 36, 78, 14, 6); ctx.fillStyle = "#D9E2E8"; ctx.fill(); }
  }
  function cushion() {
    if (STAGE === 2 && V) { V.heatPad(!(S.clover || (S.zoom && S.zoom.who === "c"))); return; }
    if (S.clover || (S.zoom && S.zoom.who === "c")) { ell(334, BENCH - 6, 26, 8, "#5B7F9E"); ell(334, BENCH - 9, 22, 5, "#7FA3C2"); return; }
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
    if (S.zoom && S.zoom.who === "b") return;
    if (STAGE === 2 && V) { V.sulk(); return; }
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
    if (STAGE === 2 && V && V.has(kind)) { ctx.save(); ctx.translate(x, y); if (s) ctx.rotate(s); V.item(kind); ctx.restore(); return; }
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
      case "catnip": rr(-13, -24, 26, 24, 7); ctx.fillStyle = "#E7D8B8"; ctx.fill(); ctx.fillStyle = "#2E7D6B"; ctx.font = "800 7px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("NIP", 0, -8); ell(-6, -30, 5, 9, "#3E9E5E", -0.5); ell(4, -32, 5, 10, "#4FB070", 0.4); ell(0, -36, 4, 8, "#2E7D6B", 0); break;
      case "drumstick": ell(-4, -12, 13, 10, "#C27A43"); ell(-6, -14, 9, 6, "#D8925A"); ctx.fillStyle = "#F7F1E6"; ctx.fillRect(6, -14, 12, 5); circ(19, -15, 3.4, "#F7F1E6"); circ(19, -9, 3.4, "#F7F1E6"); break;
      case "sausage": rr(-20, -12, 40, 11, 5.5); ctx.fillStyle = "#A8502E"; ctx.fill(); ctx.strokeStyle = "#7A3418"; ctx.lineWidth = 1.5; [-8, 0, 8].forEach(function (q) { ctx.beginPath(); ctx.moveTo(q - 2, -10); ctx.lineTo(q + 2, -4); ctx.stroke(); }); break;
      case "pizza": ctx.fillStyle = "#F2C66D"; ctx.beginPath(); ctx.moveTo(-18, -26); ctx.lineTo(18, -26); ctx.lineTo(0, 0); ctx.fill(); ctx.fillStyle = "#D9A441"; ctx.fillRect(-19, -29, 38, 5); circ(-6, -18, 3.2, "#C2402F"); circ(5, -14, 3.2, "#C2402F"); circ(0, -7, 2.6, "#C2402F"); break;
      case "pineapple": ell(0, -14, 11, 14, "#E0A21E"); ctx.strokeStyle = "#A8700F"; ctx.lineWidth = 1.2; for (var pq = -2; pq <= 2; pq++) { ctx.beginPath(); ctx.moveTo(-10, -14 + pq * 5 - 5); ctx.lineTo(10, -14 + pq * 5 + 5); ctx.stroke(); ctx.beginPath(); ctx.moveTo(10, -14 + pq * 5 - 5); ctx.lineTo(-10, -14 + pq * 5 + 5); ctx.stroke(); } ctx.fillStyle = "#3E8E4A"; [[-7, -40], [0, -46], [7, -40], [-3, -36], [4, -36]].forEach(function (q) { ctx.beginPath(); ctx.moveTo(q[0] * 0.3, -27); ctx.lineTo(q[0], q[1]); ctx.lineTo(q[0] * 0.3 + 3, -27); ctx.fill(); }); break;
      case "coffee": rr(-12, -26, 24, 26, 4); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.strokeStyle = "#D2C6B6"; ctx.lineWidth = 1.5; ctx.stroke(); ell(0, -26, 12, 3, "#6B4226"); ctx.strokeStyle = "#D2C6B6"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(13, -14, 6, -1.4, 1.4); ctx.stroke(); ctx.strokeStyle = "rgba(150,140,130,.6)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-3, -32); ctx.quadraticCurveTo(-7, -38, -2, -44); ctx.moveTo(4, -32); ctx.quadraticCurveTo(0, -38, 5, -44); ctx.stroke(); break;
      case "grapes": [[0, -30], [-6, -24], [6, -24], [-9, -17], [0, -17], [9, -17], [-5, -10], [5, -10], [0, -4]].forEach(function (q) { circ(q[0], q[1], 5, "#6E3B8F"); circ(q[0] - 1.5, q[1] - 1.5, 1.4, "#A57CC2"); }); ctx.strokeStyle = "#5E4A20"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -35); ctx.lineTo(2, -41); ctx.stroke(); break;
      case "garlic": ctx.fillStyle = "#F4EFE6"; ctx.beginPath(); ctx.moveTo(0, -34); ctx.quadraticCurveTo(18, -20, 12, -4); ctx.quadraticCurveTo(0, 2, -12, -4); ctx.quadraticCurveTo(-18, -20, 0, -34); ctx.fill(); ctx.strokeStyle = "#D8CDBB"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(-6, -16, -4, -2); ctx.moveTo(0, -30); ctx.quadraticCurveTo(6, -16, 4, -2); ctx.stroke(); ctx.fillStyle = "#C9BBA2"; ctx.fillRect(-1.5, -40, 3, 7); break;
      case "hairball": [[-8, -9, 7], [6, -10, 8], [0, -15, 7], [-2, -6, 7], [9, -5, 5], [-10, -4, 5]].forEach(function (q, k) { circ(q[0], q[1], q[2], k % 2 ? "#8E7B69" : "#A08B77"); }); ctx.strokeStyle = "#6E5D4E"; ctx.lineWidth = 1.2; [[-12, -12, -16, -16], [10, -14, 15, -19], [2, -20, 3, -25], [-4, -16, -7, -22]].forEach(function (l) { ctx.beginPath(); ctx.moveTo(l[0], l[1]); ctx.lineTo(l[2], l[3]); ctx.stroke(); }); ell(3, -14, 4, 2, "rgba(255,255,255,.45)", -0.4); break;
      case "hedgehog": // a sleeping hedgehog, curled up: harmless-looking decoy (never kick it)
        ell(0, -9, 20, 10, "#8A6446"); ctx.fillStyle = "#5A3D28"; ctx.beginPath();
        for (var hq = 0; hq <= 18; hq++) { var ha = Math.PI * 0.9 + hq / 18 * Math.PI * 1.05, hr = hq % 2 ? 15 : 22; ctx.lineTo(-3 + Math.cos(ha) * hr, -9 + Math.sin(ha) * hr * 0.9); }
        ctx.lineTo(10, -4); ctx.lineTo(-20, -3); ctx.closePath(); ctx.fill(); ell(-3, -10, 14, 9, "#7A5538");
        ell(13, -6, 9, 7, "#F1D9B5"); ell(-9, -1, 4, 2, "#F1D9B5"); ell(5, -1, 4, 2, "#F1D9B5");
        ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 1.6; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(13, -8, 2.6, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
        circ(21.5, -5, 2.3, "#2B2340"); ctx.globalAlpha = 0.6; ell(11, -3, 2.6, 1.5, "#F08AA8"); ctx.globalAlpha = 1; break;
      case "toast": rr(-17, -26, 34, 26, 4); ctx.fillStyle = "#C98A3E"; ctx.fill(); ell(-8, -24, 10, 7, "#C98A3E"); ell(8, -24, 10, 7, "#C98A3E"); rr(-13, -22, 26, 19, 3); ctx.fillStyle = "#F4D8A0"; ctx.fill(); rr(-7, -17, 14, 8, 2); ctx.fillStyle = "#FFE680"; ctx.fill(); break;
      case "bauble": circ(0, 0, 7.5, "#C2553A"); circ(-2.5, -2.5, 2, "rgba(255,255,255,.6)"); break;
      case "star": starShape(0, 0, 12, "#FFD24A"); break;
      case "fish": ell(0, -12, 16, 9, "#F0A21E"); ctx.fillStyle = "#F0A21E"; ctx.beginPath(); ctx.moveTo(14, -12); ctx.lineTo(26, -22); ctx.lineTo(26, -2); ctx.fill(); circ(-8, -14, 2, "#2B2340"); break;
    }
    ctx.restore();
  }
  var FINE = !!(window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches);
  function keycap(x, y, t, w) { w = w || 18; rr(x - w / 2, y - 9, w, 18, 4); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.strokeStyle = "rgba(43,94,128,.35)"; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = "#2B5E80"; ctx.font = "700 10px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText(t, x, y + 3.5); }
  function doorKey(x, k) {
    if (!FINE) return; // phones and tablets: just tap
    if (k === 1) { keycap(x - 13, H - 64, "\u2191"); keycap(x + 13, H - 64, "W"); keycap(x - 13, H - 30, "\u2193"); keycap(x + 13, H - 30, "S"); }
    else { keycap(x - 13, H - 46, ["\u2190", "", "\u2192"][k]); keycap(x + 13, H - 46, ["A", "", "D"][k]); }
  }
  if (location.hash === "#dev") { window.__bk = function () { return S; }; window.__bkx = { ev: function (k) { S.ev = null; startEvent(k); }, dog: function () { startDog(); }, boss: function (f) { startBoss(f); }, stage: function () { return STAGE; }, set: function (n) { setStage(n); }, tom: function () { S.tomT = 0; S.dog = null; S.ev = null; }, flea: function () { S.fleaT = 0; }, atk: function (k, side) { var b = S.boss; b.n = 9; b.last = ""; bossAttack(); b.atk.kind = k; if (side) b.atk.side = side; }, hp: function (n) { S.boss.hp = n; }, laser: function () { S.laserT = 0; }, rb: function () { S.rbT = 0; }, moth: function () { S.mothT = 0; }, win: function () { S.boss = null; S.ev = null; win(); }, lose: function () { S.lives = 1; S.hb = 0; hurt("b", 1); } }; }
  var TOM = null;
  function tomSprite() {
    if (TOM) return TOM; if (!sprOK("clover-head")) return null;
    var c = document.createElement("canvas"); c.width = 240; c.height = 260; var x = c.getContext("2d");
    x.drawImage(SPR["clover-head"], 0, 0, 240, 260); x.globalCompositeOperation = "source-atop";
    x.fillStyle = "rgba(122,92,58,.82)"; x.fillRect(0, 0, 240, 260);
    x.strokeStyle = "rgba(52,36,22,.7)"; x.lineWidth = 7; x.lineCap = "round";
    [[108, 36, 104, 68], [120, 32, 120, 66], [132, 36, 136, 68], [50, 100, 84, 104], [52, 118, 86, 116], [190, 100, 156, 104], [188, 118, 154, 116]].forEach(function (l) { x.beginPath(); x.moveTo(l[0], l[1]); x.lineTo(l[2], l[3]); x.stroke(); });
    TOM = c; return c;
  }
  function tomDraw(tm) {
    var img = tomSprite(), x = 281 + (tm.hitT > 0 ? Math.sin(S.t * 80) * 4 : 0), y = 92 + (1 - tm.k) * 80;
    ctx.save(); ctx.translate(x, y); ctx.scale(0.44, 0.44); ctx.translate(-120, -92);
    if (img) ctx.drawImage(img, 0, 0, 240, 260);
    [[103, 92], [137, 92]].forEach(function (e, i) {
      ell(e[0], e[1], 10, 7, "#D9C232"); ell(e[0], e[1] + 1, 1.8, 6.2, "#1B1430");
      ctx.strokeStyle = "#1B1430"; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.beginPath();
      if (i === 0) { ctx.moveTo(e[0] - 13, e[1] - 15); ctx.lineTo(e[0] + 9, e[1] - 6); } else { ctx.moveTo(e[0] + 13, e[1] - 15); ctx.lineTo(e[0] - 9, e[1] - 6); } ctx.stroke();
    });
    ctx.strokeStyle = "#E7A0A0"; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(128, 70); ctx.lineTo(148, 114); ctx.stroke();
    ctx.restore();
  }
  function dogDraw(k) {
    var x = 281, y = 74 + (1 - k) * 80 - Math.abs(Math.sin(S.t * 12)) * 5, open = Math.sin(S.t * 12) > 0 && !(S.dog && S.dog.gone);
    if (S.dog && S.dog.gone) y += (0.45 - Math.min(0.45, S.dog.t)) * 160;
    ell(x - 24, y + 36, 11, 8, "#B07A4A"); ell(x + 24, y + 36, 11, 8, "#B07A4A"); ctx.strokeStyle = "#7A4E2D"; ctx.lineWidth = 1.5; [-28, -24, -20, 20, 24, 28].forEach(function (px) { ctx.beginPath(); ctx.moveTo(x + px, y + 34); ctx.lineTo(x + px, y + 40); ctx.stroke(); });
    if (open) { ctx.strokeStyle = "#C2553A"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; [[-40, -10], [-44, 4], [40, -10], [44, 4]].forEach(function (b) { ctx.beginPath(); ctx.moveTo(x + b[0] * 0.9, y + b[1]); ctx.lineTo(x + b[0] * 1.2, y + b[1] - 4); ctx.stroke(); }); }
    ell(x - 27, y + 4, 10, 21, "#7A4E2D", 0.35); ell(x + 27, y + 4, 10, 21, "#7A4E2D", -0.35);
    ell(x, y, 26, 24, "#B07A4A"); ell(x, y + 14, 16, 11, "#E3C6A0"); ell(x, y + 7, 6, 4.5, "#1B1430");
    circ(x - 10, y - 6, 3.8, "#1B1430"); circ(x + 10, y - 6, 3.8, "#1B1430"); circ(x - 9, y - 7.5, 1.3, "#FFF"); circ(x + 11, y - 7.5, 1.3, "#FFF");
    if (open) { ell(x, y + 21, 7, 5, "#5A1F2B"); ell(x, y + 25, 4, 4, "#E05A8A"); } else { ctx.strokeStyle = "#5A3A20"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 6, y + 19); ctx.quadraticCurveTo(x, y + 23, x + 6, y + 19); ctx.stroke(); }
  }
  function draw() {
    ctx.save();
    if (shakeT > 0 && !S.over && !paused) ctx.translate(rnd(-3, 3), rnd(-2, 2));
    if (!paused && S.dog && !S.dog.gone && !quiet() && Math.sin(S.t * 12) > 0.7) ctx.translate(rnd(-1.5, 1.5), rnd(-1, 1)); // the bark shakes the kitchen
    scene(STAGE === 2 && V && S.boss ? function () { V.bossBack(S.boss); } : null); if (S.boss) bossDraw(); else basil(); bars(); if (!S.boss) evDrawBack();
    if (S.tom && !S.tom.done) { ctx.save(); ctx.globalAlpha = S.tom.k; ctx.textAlign = "center"; ctx.fillStyle = "#C2553A"; ctx.font = "900 13px Poppins, sans-serif"; ctx.fillText(FINE ? "TAP or \u2191 / W" : "TAP HIM!", 281, 128); for (var tp = 0; tp < 3; tp++) circ(269 + tp * 12, 140, 4, tp < S.tom.hits ? "#2E7D6B" : "rgba(43,35,64,.2)"); var tw = Math.max(0, S.tom.t / 4.5); rr(246, 150, 70 * tw, 4, 2); ctx.fillStyle = "#C2553A"; ctx.fill(); ctx.restore(); }
    for (var i = 0; i < 3; i++) {
      var it = S.lanes[i]; if (!it) continue;
      var lx = LANES[i] + (it.ox || 0), bark = S.dog && Math.sin(S.t * 12) > 0;
      var wob = it.landed && (it.life < 1 || it.hit > 0 || S.dog) ? Math.sin(S.t * 30 + it.wob) * (it.hit > 0 ? 0.16 : bark ? 0.14 : 0.08) : 0;
      item(it.kind, lx, it.y, wob);
      if (it.kind === "hedgehog" && it.landed) { ctx.fillStyle = "rgba(107,90,147," + (0.5 + Math.sin(S.t * 2) * 0.3) + ")"; ctx.font = "700 11px Poppins, sans-serif"; ctx.textAlign = "left"; ctx.fillText("z", lx + 14, BENCH - 30 - (S.t * 8) % 8); ctx.font = "700 8px Poppins, sans-serif"; ctx.fillText("z", lx + 21, BENCH - 38 - (S.t * 8) % 8); }
      if (it.hp && it.landed) {
        var dmg = 1 - it.hp / it.hpMax, cx = lx, top = BENCH - (it.kind === "tv" ? 54 : 52);
        ctx.strokeStyle = it.kind === "tv" ? "#F1ECF8" : "#1B1430"; ctx.lineWidth = 1.6;
        for (var c2 = 0; c2 < Math.floor(dmg * 6); c2++) { var sx = cx + ((c2 * 37) % 30) - 15, sy = top + 10 + ((c2 * 23) % 30); ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 6, sy + 5); ctx.lineTo(sx + 3, sy + 11); ctx.stroke(); }
        if (it.hpMax > 12) { top = BENCH - 74; rr(cx - 40, top - 16, 80, 8, 4); ctx.fillStyle = "rgba(43,35,64,.18)"; ctx.fill(); rr(cx - 40, top - 16, 80 * it.hp / it.hpMax, 8, 4); ctx.fillStyle = "#C2553A"; ctx.fill(); ctx.fillStyle = "#2B2340"; ctx.font = "700 10px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText(it.hp, cx, top - 20); }
        else for (var h2 = 0; h2 < it.hpMax; h2++) circ(cx - (it.hpMax - 1) * 4 + h2 * 8, top - 10, 3, h2 < it.hp ? "#C2553A" : "rgba(43,35,64,.18)");
      }
      if (it.landed && (isSpiky(it.kind) || isBad(it.kind))) { ctx.strokeStyle = "#C2553A"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(lx, BENCH - 64, 8, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(lx - 5.5, BENCH - 69.5); ctx.lineTo(lx + 5.5, BENCH - 58.5); ctx.stroke(); continue; }
      if (it.landed) { var p = Math.max(0, it.life / it.max); ctx.strokeStyle = it.kind === "tap" || it.kind === "fish" ? "#2E7D6B" : p < .35 ? "#C2553A" : "#2B5E80"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(lx, BENCH - 56, 7, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke(); }
    }
    clover();
    var tq = S.treat;
    if (tq) {
      ctx.save(); if (tq.done) ctx.globalAlpha = Math.max(0, tq.fade / 0.35); var sc2 = tq.done === "you" ? 1 + (0.35 - tq.fade) * 1.5 : 1; ctx.translate(tq.x, tq.y); ctx.scale(sc2, sc2); ctx.translate(-tq.x, -tq.y); item(tq.kind, tq.x, tq.y, 0); ctx.restore();
      if (tq.landed && !tq.done) {
        var lf = Math.max(0, tq.life / 1.2); ctx.strokeStyle = "#B07A0C"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(tq.x, BENCH - 50, 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lf); ctx.stroke();
        ctx.fillStyle = "#B07A0C"; ctx.font = "800 11px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText(FINE ? (tq.side > 0 ? "\u2192 grab!" : "\u2190 grab!") : "tap!", tq.x, BENCH - 64);
      }
    }
    S.fly.forEach(function (f) { if (f.kind === "bauble") { circ(f.x, f.y, 7.5, f.c); circ(f.x - 2.5, f.y - 2.5, 2, "rgba(255,255,255,.6)"); } else item(f.kind, f.x, f.y, f.r); });
    S.shards.forEach(function (q) { ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, q.l)); ctx.translate(q.x, q.y); ctx.rotate(q.r); ctx.fillStyle = q.c; ctx.beginPath(); ctx.moveTo(-q.s, 0); ctx.lineTo(0, -q.s * 0.7); ctx.lineTo(q.s * 0.8, q.s * 0.5); ctx.fill(); ctx.restore(); });
    var mo = S.moth;
    if (mo) {
      ctx.save(); ctx.translate(mo.x, mo.y); var fl = Math.abs(Math.sin(S.t * 16)) * 0.8 + 0.2, sc = mo.eaten ? mo.eaten / 0.4 : 1; ctx.scale(sc, sc);
      if (STAGE === 2 && V) V.flyer(mo.kind, fl); else {
      flyer1(mo.kind, fl);
      }
      ctx.restore();
      if (FINE && !mo.eaten && mo.kind !== "wasp") { ctx.fillStyle = "#B5308A"; ctx.font = "700 10px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("\u2191 or W", mo.x, mo.y + 26); }
      if (!mo.eaten && mo.kind === "wasp") { ctx.strokeStyle = "#C2553A"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(mo.x + 18, mo.y - 18, 6, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(mo.x + 14, mo.y - 22); ctx.lineTo(mo.x + 22, mo.y - 14); ctx.stroke(); }
      else if (!mo.eaten) { ctx.strokeStyle = "rgba(181,48,138,.35)"; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(mo.x, mo.y, 24 + Math.sin(S.t * 6) * 3, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
    }
    debrisDraw();
    S.gulp.forEach(function (g) { var k = g.t / 0.32, gx = g.x + ((g.tx || 180) - g.x) * k, gy = g.y + ((g.ty || BENCH - 98) - g.y) * k; ctx.save(); ctx.translate(gx, gy); ctx.scale(1 - k * 0.85, 1 - k * 0.85); item(g.kind, 0, 0, 0); ctx.restore(); });
    S.flops.forEach(function (f) { item(STAGE === 2 ? "treat" : "fish", f.x, f.y, f.r); });
    S.slash.forEach(function (k) { ctx.globalAlpha = Math.min(1, k.l * 4); ctx.strokeStyle = "#B07A0C"; ctx.lineWidth = 3; ctx.lineCap = "round"; for (var j = -1; j <= 1; j++) { ctx.beginPath(); ctx.moveTo(k.x - 26, k.y - 22 + j * 9); ctx.quadraticCurveTo(k.x, k.y - 34 + j * 9, k.x + 26, k.y - 22 + j * 9 - 6); ctx.stroke(); } ctx.globalAlpha = 1; });
    S.drops.forEach(function (d) { ctx.globalAlpha = Math.max(0, d.l); circ(d.x, d.y, 3, "#5AA9DC"); ctx.globalAlpha = 1; });
    S.fx.forEach(function (f) { ctx.globalAlpha = Math.max(0, f.l); ctx.fillStyle = f.col; ctx.font = "700 15px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText(f.txt, f.x, f.y); ctx.globalAlpha = 1; });
    // rainbow butterfly
    var rbd = S.rb;
    if (rbd) {
      ctx.save(); ctx.translate(rbd.x, rbd.y); var sc3 = rbd.caught ? rbd.caught / 0.5 * 1.6 : 1, fl3 = Math.abs(Math.sin(S.t * 14)) * 0.8 + 0.2; ctx.scale(sc3 * (rbd.vx < 0 ? -1 : 1), sc3);
      var hue = (S.t * 160) % 360;
      if (STAGE === 2 && V) { V.bubble(hue); ctx.restore(); } else {
      ctx.save(); ctx.scale(1, fl3);
      ell(-11, -7, 12, 9, "hsl(" + hue + ",85%,62%)", -0.4); ell(11, -7, 12, 9, "hsl(" + ((hue + 90) % 360) + ",85%,62%)", 0.4); ell(-8, 7, 8, 7, "hsl(" + ((hue + 180) % 360) + ",85%,60%)", 0.3); ell(8, 7, 8, 7, "hsl(" + ((hue + 270) % 360) + ",85%,60%)", -0.3); ctx.restore();
      ell(0, 0, 2.6, 11, "#2B2340"); ctx.restore(); }
      if (!rbd.caught) { ctx.globalAlpha = 0.5; for (var sp = 0; sp < 4; sp++) circ(rbd.x - rbd.vx * 0.06 * (sp + 1) + Math.sin(S.t * 9 + sp) * 4, rbd.y + Math.cos(S.t * 7 + sp) * 5, 2, "hsl(" + ((hue + sp * 70) % 360) + ",90%,70%)"); ctx.globalAlpha = 1; }
    }
    // treat rain
    S.rain.forEach(function (q) { ctx.save(); ctx.globalAlpha = q.landed ? Math.max(0, 1 - q.t / 0.7) : 1; ctx.translate(q.x, q.y); ctx.scale(0.62, 0.62); ctx.translate(-q.x, -q.y); item(q.kind, q.x, q.y, q.r); ctx.restore(); });
    // zoomies
    var zz = S.zoom;
    if (zz) {
      var K2 = 0.26; ctx.save(); ctx.translate(zz.x, zz.y); ctx.scale(zz.dir * K2 * 1.35, K2 * 0.8); if (zz.hit) ctx.rotate(zz.hit * 6); ctx.translate(-120, -180);
      spr(zz.who === "c" ? "clover-body" : "basil-body"); spr(zz.who === "c" ? "clover-head" : "basil-head"); ctx.restore();
      if (!zz.hit) { ctx.strokeStyle = "rgba(107,90,147,.5)"; ctx.lineWidth = 2; for (var zl2 = 0; zl2 < 4; zl2++) { var yy = zz.y - 26 + zl2 * 10; ctx.beginPath(); ctx.moveTo(zz.x - zz.dir * 40, yy); ctx.lineTo(zz.x - zz.dir * (70 + zl2 * 8), yy); ctx.stroke(); }
        ctx.fillStyle = "#B5308A"; ctx.font = "900 15px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("ZOOMIES!", zz.x, zz.y - 46); }
    }
    // laser dot
    var lzd = S.laser;
    if (lzd) { ctx.save(); ctx.globalAlpha = lzd.done ? lzd.done / 0.4 : 1; if (STAGE === 2) { circ(lzd.x, lzd.y, 15 + Math.sin(S.t * 20) * 2, "rgba(255,214,90,.35)"); circ(lzd.x, lzd.y, 6.5, "#FFE69A"); circ(lzd.x, lzd.y, 6.5 * 0.5, "#FFFFFF"); ctx.strokeStyle = "#E0A21E"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(lzd.x, lzd.y, 7, 0, 7); ctx.stroke(); } else { circ(lzd.x, lzd.y, 13 + Math.sin(S.t * 20) * 2, "rgba(255,40,40,.22)"); circ(lzd.x, lzd.y, 5.5, "#FF2A2A"); circ(lzd.x - 1.5, lzd.y - 1.5, 1.8, "#FFD6D6"); } ctx.restore(); }
    // the Vet: fleas hopping across, and the itch they leave
    var fla = S.flea;
    if (fla && V) { ctx.save(); ctx.globalAlpha = fla.done ? fla.done / 0.4 : 1; ctx.translate(fla.x, fla.y + Math.abs(Math.sin(S.t * 6)) * -8); V.fleas(9 - fla.hits * 3); ctx.restore();
      if (!fla.done) { ctx.strokeStyle = "rgba(194,85,58,.4)"; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(fla.x, fla.y, 30, 0, 7); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = "#C2553A"; ctx.font = "800 10px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("FLEAS · tap " + fla.hits + "/3", fla.x, fla.y + 44); } }
    // night: darker room, stars and moon in the window
    if (S.nightK > 0.01) { ctx.fillStyle = STAGE === 2 ? "rgba(14,28,50," + (0.24 * S.nightK) + ")" : "rgba(18,14,48," + (0.24 * S.nightK) + ")"; ctx.fillRect(0, 0, W, H); } // the Vet: after-hours lighting
    // catnip: a wobbly colour wash
    if (S.itchT > 0) { ctx.fillStyle = "#C2553A"; ctx.font = "800 11px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("ITCHY " + Math.ceil(S.itchT) + "s · some taps miss", 180, S.nipT > 0 ? 84 : 56); }
    if (S.nipT > 0) { ctx.fillStyle = "hsla(" + ((S.t * 120) % 360) + ",80%,60%," + (0.12 * Math.min(1, S.nipT)) + ")"; ctx.fillRect(0, 0, W, BENCH + 8); ctx.fillStyle = "#2E7D6B"; ctx.font = "800 11px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("CATNIP " + Math.ceil(S.nipT) + "s", 180, 56); }
    if (S.boss) { rr(74, 12, 212, 26, 13); ctx.fillStyle = "#7A1F2B"; ctx.fill(); ctx.fillStyle = "#FFF"; ctx.font = "700 13px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("ROUND " + S.round + " \u00b7 " + (S.boss.final ? "FINAL BOSS" : "BOSS \u00b7 " + Math.max(0, Math.ceil(S.boss.t)) + "s"), 180, 30); }
    else if (S.bonus > 0) { rr(84, 12, 192, 26, 13); ctx.fillStyle = "#B07A0C"; ctx.fill(); ctx.fillStyle = "#FFF"; ctx.font = "700 13px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("ROUND " + S.round + " · CLOVER · " + Math.ceil(S.bonus) + "s", 180, 30); }
    else if (S.frenzyT <= 0 && S.sinkT <= 0) { rr(84, 12, 192, 26, 13); ctx.fillStyle = "#2B5E80"; ctx.fill(); ctx.fillStyle = "#FFF"; ctx.font = "700 13px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("ROUND " + S.round + " · BASIL · " + Math.ceil(S.roundT) + "s", 180, 30); }
    else if (S.frenzyT > 0) { rr(104, 12, 152, 26, 13); ctx.fillStyle = "#B5308A"; ctx.fill(); ctx.fillStyle = "#FFF"; ctx.font = "700 13px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("FRENZY x2 · " + Math.ceil(S.frenzyT) + "s", 180, 30); }
    else if (S.sinkT > 0) { ctx.fillStyle = "#2B5E80"; ctx.font = "700 14px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText(s2("SINK TIME x2", "HOSE TIME x2"), 180, 28); }
    if (lzd && !lzd.done) { ctx.fillStyle = "#C2553A"; ctx.font = "800 11px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText(s2("LASER DOT \u00b7 ", "PEN TORCH \u00b7 ") + lzd.hits + "/3", 180, S.nipT > 0 ? 70 : 56); }
    else if (DAILY && S.nipT <= 0) { ctx.fillStyle = "rgba(43,35,64,.55)"; ctx.font = "700 10px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("DAILY CHALLENGE", 180, 54); }
    if (!S.boss) evDraw();
    if (S.boss && S.boss.flash > 0) { ctx.fillStyle = "rgba(255," + (S.boss.angry ? 120 : 255) + "," + (S.boss.angry ? 120 : 255) + "," + (S.boss.flash / 0.35 * 0.7) + ")"; ctx.fillRect(0, 0, W, H); }
    if (S.dog) { var dg = S.dog, wf = dg.gone ? "HISS!" : s2("WOOF!", "SQUAWK!"); ctx.save(); ctx.globalAlpha = dg.k; ctx.textAlign = "center"; ctx.lineJoin = "round"; ctx.font = "900 " + (dg.gone ? 26 : Math.sin(S.t * 12) > 0 ? 30 : 24) + "px Poppins, sans-serif"; ctx.lineWidth = 6; ctx.strokeStyle = "#FFFFFF"; ctx.strokeText(wf, 236, 104); ctx.fillStyle = dg.gone ? "#2E7D6B" : "#C2553A"; ctx.fillText(wf, 236, 104); ctx.restore();
      if (!dg.gone) banner(s2("DOG! Everything’s shaking: ", "COCKATOO! SQUAWK: ") + dogX() + "× speed for " + dg.dur + " s", (FINE ? s2("Tap the dog or press ↑ / W", "Tap the bird or press ↑ / W") : s2("Tap the dog", "Tap the bird")) + " and Basil hisses it away", dg.t / dg.dur, "#7A1F2B", dg.k); }
    if (S.ctitle) {
      var ct = S.ctitle, ck = Math.min(1, (1.4 - ct.t) / 0.2); ctx.save(); ctx.globalAlpha = Math.min(1, ct.t / 0.3); ctx.translate(180, 156); ctx.scale(0.7 + 0.3 * ck, 0.7 + 0.3 * ck); ctx.textAlign = "center"; ctx.lineJoin = "round";
      ctx.font = "900 28px Poppins, sans-serif"; ctx.lineWidth = 7; ctx.strokeStyle = "#2B2340"; ctx.strokeText(ct.txt, 0, 0); ctx.fillStyle = "#FF8AD0"; ctx.fillText(ct.txt, 0, 0);
      ctx.font = "800 12px Poppins, sans-serif"; ctx.lineWidth = 4; ctx.strokeText(ct.n + " in a row", 0, 20); ctx.fillStyle = "#FFFFFF"; ctx.fillText(ct.n + " in a row", 0, 20); ctx.restore();
    }
    if (S.ann && S.ann.t > 0) {
      var at = S.ann.t, k = Math.min(1, (1.8 - at) / 0.25), cl2 = S.ann.b === "NOM!", fade = Math.min(1, at / 0.3);
      ctx.save(); ctx.globalAlpha = fade; ctx.fillStyle = "rgba(20,13,40,.35)"; ctx.fillRect(0, 120, W, 120);
      ctx.translate(180, 168); ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k); ctx.textAlign = "center"; ctx.lineJoin = "round";
      ctx.font = "800 24px Poppins, sans-serif"; var aw = ctx.measureText(S.ann.a).width; if (aw > 330) ctx.font = "800 " + Math.floor(24 * 330 / aw) + "px Poppins, sans-serif";
      ctx.lineWidth = 6; ctx.strokeStyle = "#2B2340"; ctx.strokeText(S.ann.a, 0, -14); ctx.fillStyle = "#FFFFFF"; ctx.fillText(S.ann.a, 0, -14);
      if (at < 1.45) { ctx.font = "900 " + (S.ann.b.length > 6 ? 44 : 52) + "px Poppins, sans-serif"; ctx.lineWidth = 9; ctx.strokeText(S.ann.b, 0, 40); ctx.fillStyle = S.ann.b === "ONE LIFE" ? "#FF8AD0" : cl2 ? "#E6B08A" : "#FFE08A"; ctx.fillText(S.ann.b, 0, 40); }
      if (S.ann.c) { ctx.font = "800 12px Poppins, sans-serif"; var cw = ctx.measureText(S.ann.c).width; if (cw > 330) ctx.font = "800 " + Math.floor(12 * 330 / cw) + "px Poppins, sans-serif"; ctx.lineWidth = 4; ctx.strokeText(S.ann.c, 0, 64); ctx.fillStyle = "#5BD08A"; ctx.fillText(S.ann.c, 0, 64); }
      ctx.restore();
    }
    if (paused) { ctx.fillStyle = "rgba(43,35,64,.55)"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#fff"; ctx.font = "700 26px Lora, serif"; ctx.textAlign = "center"; ctx.fillText("Paused. Basil is napping.", 180, H / 2); }
    ctx.restore();
  }
  function hud() {
    $("bk-score").textContent = fmt(S.score);
    var mult = Math.min(4, 1 + Math.floor(S.combo / 3));
    $("bk-combo").textContent = S.t - S.lastKick < 1.05 && mult > 1 ? "Combo x" + mult : "";
    var lv = CAMP ? S.lives : -1;
    if (lv !== hud.lv) { hud.lv = lv; var lh = ""; if (CAMP) for (var q = 0; q < 3; q++) lh += q < S.lives ? "\u2665" : '<span class="off">\u2665</span>'; $("bk-lives").innerHTML = lh; $("bk-lives").setAttribute("aria-label", CAMP ? S.lives + (S.lives === 1 ? " life" : " lives") : "Lives"); }
  }

  // ---------- flow ----------
  function nameFor(n, L) { L = L || NAMES; var nm = L[0][1]; L.forEach(function (x) { if (n >= x[0]) nm = x[1]; }); return nm; }
  function end() {
    shakeT = 0; clearTimeout(toastT); $("bk-toast").hidden = true;
    S.over = true; var best = lget(BEST) || 0, pb = S.score > best; if (pb) lset(BEST, S.score);
    var cl = S.bonus > 0, bn = nameFor(S.bPts), cn = nameFor(S.cPts, CNAMES);
    $("bk-otrophy").hidden = !S.won; $("bk-omasc").hidden = S.won; $("bk-over").classList.toggle("win", S.won); endlessUI();
    $("bk-omasc").src = cl ? "/assets/mascots/clover.svg?v=1" : STAGE === 2 ? SBASE + "sprites/basil-lion.svg?v=2" : "/assets/mascots/basil.svg?v=2"; $("bk-omasc").alt = cl ? "Clover" : "Basil";
    $("bk-otitle").textContent = cl ? cn : bn;
    $("bk-ofeat").textContent = DAILY ? "Daily challenge \u00b7 " + dayLabel() : cl ? "Clover ended it. Mid-snack." : "Basil’s verdict";
    $("bk-omsg").textContent = cl ? (S.cPts < 3000 ? "Barely a snack. She’ll be complaining about this for days." : S.cPts < 30000 ? "A solid feed. Room for dessert, obviously." : "Royalty. The fridge fears her.") + " Basil: " + bn + "."
      : (S.bPts < 1000 ? "Barely a kick. He's saving his energy for 3am." : S.bPts < 15000 ? "A respectable mess. The bench will never be the same." : S.bPts < 100000 ? "Chaos. Several mugs have filed for compensation." : "Pure evil. Fluffy, smug, white evil.") + (S.eatenFood ? " Clover: " + cn + "." : "");
    if (STAGE === 2 && !S.won) $("bk-omsg").textContent = cl ? (S.cPts < 3000 ? "Barely a nibble. She’s blaming the diet food." : S.cPts < 30000 ? "A solid feed. The treat jar is looking nervous." : "Royalty. Reception fears her.") + " Basil: " + bn + "."
      : (S.bPts < 1000 ? "Barely a kick. He’s saving it for the vet." : S.bPts < 15000 ? "A respectable mess. The exam table will never be the same." : S.bPts < 100000 ? "Chaos. The clinic has flagged his file." : "Pure evil. Banned from three clinics. Fluffy, smug, white evil.") + (S.eatenFood ? " Clover: " + cn + "." : "");
    if (CAMP && !S.won) $("bk-ofeat").textContent = (DAILY ? "Daily challenge \u00b7 " + dayLabel() + " \u00b7 " : "") + "Out in round " + S.round + " of 10";
    if (S.won) { $("bk-ofeat").textContent = DAILY ? "Daily challenge \u00b7 " + dayLabel() + " \u00b7 all 10 rounds" : s2("3AM conquered \u00b7 all 10 rounds", "Clean bill of health \u00b7 all 10 vet rounds"); $("bk-otitle").textContent = s2("Bench Legend", "Check-up Legend");
      if (STAGE === 2) $("bk-omsg").textContent = "All ten vet rounds. Dr Pokesworth handed over the treat jar, Nurse Burrito waved a white towel and the echidna slept through it all. Basil: " + bn + ". Clover: " + cn + "." + (S.perfects ? " Perfect rounds: " + S.perfects + "." : "") + (S.newWin ? " Vet Endless unlocked." : "");
      else $("bk-omsg").textContent = "All ten rounds. The bench is empty, the vacuum is retired and the hedgehog is still asleep. Basil: " + bn + ". Clover: " + cn + "." + (S.perfects ? " Perfect rounds: " + S.perfects + "." : "") + (S.newWin ? " Endless mode unlocked." : ""); }
    if (S.bestCombo >= 5) $("bk-omsg").textContent += " Best streak: " + comboTitle(S.bestCombo) + ".";
    $("bk-opts").textContent = fmt(S.score); if ($("bk-orounds")) $("bk-orounds").textContent = S.round; $("bk-okick").textContent = fmt(S.bPts); $("bk-onom").textContent = fmt(S.cPts);
    var ob = $("bk-obest"); ob.textContent = pb ? "New personal best!" : "Best: " + fmt(best); ob.className = "bk-obest" + (pb ? " pb" : "");
    $("bk-over").hidden = false; track("basil/end");
    var hs = hsLoad(), wb = bkey(DAILY ? "daily" : "world", STAGE), rows = boards[wb];
    S.qLocal = (!DAILY || STAGE === 2) && S.score > 0 && (hs.length < HSN || S.score > hs[hs.length - 1].s);
    S.qWorld = (STAGE !== 2 || VETLB) && S.score > 0 && (!Array.isArray(rows) || rows.length < 10 || S.score > rows[rows.length - 1].s); // the Vet goes world-wide only once the server knows its boards
    hsUI();
    var q = S.qLocal || S.qWorld; lastHi = -1;
    $("bk-hsform").hidden = !q; $("bk-hslabel").textContent = S.qWorld ? (DAILY ? "Top 10 today! Your nickname" : "World top 10! Your nickname") : "High score! Your nickname";
    renderBoard("bk-hstab", STAGE === 2 && !VETLB ? "me" : DAILY ? "daily" : S.qWorld || !S.qLocal ? "world" : "me");
    if (q) { var inp = $("bk-hsname"); inp.value = lget(HSNAME) || ""; setTimeout(function () { inp.focus(); inp.select(); }, 60); }
    else setTimeout(function () { $("bk-again").focus(); }, 50);
  }
  // ---------- high score table (top 10, kept in this browser) ----------
  var HS = "mw-basil-hs", HSNAME = "mw-basil-name", HSN = 10;
  function hsLoad(st) { var a = lget(st ? KEYS[st].hs : HS); return Array.isArray(a) ? a : []; }
  function cleanName(n) { n = String(n || "").replace(/[^A-Za-z0-9 '\-\.]/g, "").replace(/\s+/g, " ").trim().slice(0, 14); return n || "Anonymous cat"; }
  function renderHS(el, hi, st) {
    st = st || STAGE; var hs = hsLoad(st); if (!el) return;
    if (!hs.length) { el.innerHTML = '<li class="bk-hsnone">No scores yet. Be the first.</li>'; return; }
    el.innerHTML = hs.map(function (r, i) { return '<li class="' + (i === hi ? "me" : "") + '"><span class="rk">' + (i + 1) + '</span><span class="nm">' + esc(r.n) + (st === 2 ? vetCrown(r) : crown(r)) + '</span><span class="sc">' + fmt(r.s) + '</span><span class="rd">R' + (r.r || 1) + "</span></li>"; }).join("");
  }
  // ---------- world and daily leaderboards (via the Malady Wise counter server) ----------
  // Kitchen: boards "all" and "daily". The Vet: "vall" and "vdaily", used ONLY once the server has echoed board === "vall".
  // An older server maps unknown boards to "all", so until then the Vet stays this-device only and never posts.
  var LB = "https://mw-presence.onrender.com", boards = { world: null, daily: null, vworld: null, vdaily: null }, tabSel = { "bk-hslist0": "world", "bk-hstab": "world" }, hsSt = { "bk-hslist0": 1 }, lastHi = -1, VETLB = false;
  var SRV = { world: "all", daily: "daily", vworld: "vall", vdaily: "vdaily" };
  function boardSt(id) { return id === "bk-hstab" ? STAGE : hsSt[id] || 1; }
  function bkey(which, st) { return st === 2 ? (which === "daily" ? "vdaily" : "vworld") : which; }
  function isVet(k) { return k.charAt(0) === "v"; }
  function pid() { var p = lget("mw-basil-pid"); if (!p || p.length < 8) { p = (Math.random().toString(36) + Math.random().toString(36)).replace(/[^a-z0-9]/g, "").slice(0, 12); lset("mw-basil-pid", p); } return p; }
  function dayLabel() { var d = sydDay().split("-"); return +d[2] + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][+d[1] - 1]; }
  function lbGot(k, j) {
    var ok = j && Array.isArray(j.rows) && (!isVet(k) || j.board === SRV[k]);
    if (isVet(k) && j && !ok) { VETLB = false; hsUI(); } // the server stopped knowing the Vet's boards
    boards[k] = ok ? j.rows : "err";
    ["bk-hslist0", "bk-hstab"].forEach(function (id) { if (tabSel[id] !== "me" && bkey(tabSel[id], boardSt(id)) === k) renderBoard(id, tabSel[id]); });
  }
  function lbFetch(k) {
    if (!window.fetch || (isVet(k) && !VETLB)) return lbGot(k, null);
    fetch(LB + "/top?b=" + SRV[k] + "&id=" + pid(), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) { lbGot(k, j); }).catch(function () { lbGot(k, null); });
  }
  function vetProbe() {
    if (!window.fetch) return;
    fetch(LB + "/top?b=vall&id=" + pid(), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.board === "vall" && Array.isArray(j.rows)) { VETLB = true; boards.vworld = j.rows; }
      hsUI(); ["bk-hslist0", "bk-hstab"].forEach(function (id) { if (boardSt(id) === 2) renderBoard(id, tabSel[id]); });
    }).catch(function () {});
  }
  function postScore(k, n, sc, rd) {
    if (isVet(k) && !VETLB) return renderBoard("bk-hstab", "me"); // never post a Vet score where it would land on the Kitchen's board
    var which = isVet(k) ? k.slice(1) : k;
    boards[k] = null; renderBoard("bk-hstab", which);
    var u = LB + "/score?b=" + SRV[k] + "&id=" + pid() + "&n=" + encodeURIComponent(n) + "&s=" + Math.round(sc) + "&r=" + rd;
    fetch(u, { method: "POST", cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) { lbGot(k, j); track("basil/world-score"); }).catch(function () { lbGot(k, null); });
  }
  // which tabs show: the Vet's World / Today only once its boards are live; the Kitchen/Vet switch on the intro once there's anything Vet to show
  function hsUI() {
    var sw = $("bk-hsst"), vOn = VETLB || kitchenWon(); if (sw) sw.hidden = !vOn;
    if (!vOn && hsSt["bk-hslist0"] === 2) { hsSt["bk-hslist0"] = 1; renderBoard("bk-hslist0", tabSel["bk-hslist0"]); }
    if (sw) sw.querySelectorAll("button").forEach(function (b) { var on = +b.getAttribute("data-hst") === hsSt["bk-hslist0"]; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
    document.querySelectorAll('.bk-tabs[data-for="bk-hslist0"] button[data-b="world"], .bk-tabs[data-for="bk-hslist0"] button[data-b="daily"]').forEach(function (b) { b.hidden = hsSt["bk-hslist0"] === 2 && !VETLB; });
    document.querySelectorAll(".bk-tabs-o").forEach(function (t) { t.hidden = STAGE === 2 && !VETLB; });
  }
  function renderBoard(id, which) {
    var el = $(id); if (!el) return; var st = boardSt(id);
    if (st === 2 && !VETLB) which = "me";
    tabSel[id] = which;
    document.querySelectorAll('.bk-tabs[data-for="' + id + '"] button').forEach(function (b) { var on = b.getAttribute("data-b") === which; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
    var note = $(id + "-note");
    if (which === "me") { renderHS(el, id === "bk-hstab" ? lastHi : -1, st); if (note) note.textContent = (st === 2 ? "The Vet: kept" : "Kept") + " on this device only."; return; }
    if (note) note.textContent = (st === 2 ? "The Vet: " : "") + (which === "daily" ? "Today’s daily challenge (Sydney time). Names are public." : "Top 10 worldwide. Names are public.");
    var k = bkey(which, st), rows = boards[k];
    if (rows == null) { el.innerHTML = '<li class="bk-hsnone">Loading…</li>'; boards[k] = "wait"; lbFetch(k); return; }
    if (rows === "wait") { el.innerHTML = '<li class="bk-hsnone">Loading…</li>'; return; }
    if (rows === "err") { el.innerHTML = '<li class="bk-hsnone">The leaderboard is napping. Tap the tab to try again.</li>'; return; }
    if (!rows.length) { el.innerHTML = '<li class="bk-hsnone">No scores yet. Be the first.</li>'; return; }
    el.innerHTML = rows.map(function (r, i) { return '<li class="' + (r.me ? "me" : "") + '"><span class="rk">' + (i + 1) + '</span><span class="nm">' + esc(r.n) + (st === 2 ? vetCrown(r) : crown(r)) + '</span><span class="sc">' + fmt(r.s) + '</span><span class="rd">R' + (r.r || 1) + "</span></li>"; }).join("");
  }
  document.querySelectorAll(".bk-tabs[data-for]").forEach(function (t) {
    t.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; var id = t.getAttribute("data-for"), w = b.getAttribute("data-b"), k = w === "me" ? "" : bkey(w, boardSt(id)); if (k && boards[k] === "err") boards[k] = null; renderBoard(id, w); });
  });
  if ($("bk-hsst")) $("bk-hsst").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; hsSt["bk-hslist0"] = +b.getAttribute("data-hst"); hsUI(); renderBoard("bk-hslist0", tabSel["bk-hslist0"] === "me" && hsSt["bk-hslist0"] === 1 ? "world" : tabSel["bk-hslist0"]); });
  function vetCrown(r) { return (r.r || 1) >= 11 ? ' <span class="bk-crown" title="Beat all 10 vet rounds">🩺</span>' : ""; }
  function crown(r) { return (r.r || 1) >= 11 ? ' <span class="bk-crown" title="Beat all 10 rounds">👑</span>' : ""; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function saveHS() {
    var n = cleanName($("bk-hsname").value); lset(HSNAME, n);
    if (S.qLocal) { var hs = hsLoad(), row = { n: n, s: S.score, r: S.round, d: new Date().toISOString().slice(0, 10) };
      hs.push(row); hs.sort(function (a, b) { return b.s - a.s; }); hs = hs.slice(0, HSN); lset(HS, hs); lastHi = hs.indexOf(row); track("basil/highscore"); }
    $("bk-hsform").hidden = true;
    if (S.qWorld) postScore(bkey(DAILY ? "daily" : "world", STAGE), n, S.score, S.round); else renderBoard("bk-hstab", "me");
    renderBoard("bk-hslist0", tabSel["bk-hslist0"]);
    setTimeout(function () { $("bk-again").focus(); }, 50);
  }
  $("bk-hsform").addEventListener("submit", function (e) { e.preventDefault(); saveHS(); });
  // dev only: on localhost, ?round=N (or ?r=N) starts the campaign at round N
  var DEVR = 0, DEVSTAGE = 0; try { if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) { var qs = new URLSearchParams(location.search); DEVR = Math.max(0, Math.min(10, parseInt(qs.get("round") || qs.get("r"), 10) || 0)); DEVSTAGE = parseInt(qs.get("stage"), 10) || 0; } } catch (e) {}
  function endlessUI() {
    var won = !!lget(WON), b2 = $("bk-endless2");
    if (b2) b2.hidden = !won;
    stageUI();
  }
  // the stage select: Kitchen (always open) and the Vet (opens when the Kitchen's round 10 is beaten)
  function stageUI() {
    var k1 = !!lget(KEYS[1].won), kv = kitchenWon(), k2 = !!lget(KEYS[2].won), b1 = lget(KEYS[1].best) || 0, bv = lget(KEYS[2].best) || 0, seen = lget("mw-basil-vet-seen");
    var e1 = $("bk-endless"), ev = $("bk-endlessv"), s1 = $("bk-start"), sv = $("bk-start2"), c2 = $("bk-sc2");
    if (e1) { e1.disabled = !k1; e1.classList.toggle("locked", !k1); e1.innerHTML = k1 ? "Endless" : "\ud83d\udd12 Endless"; e1.title = k1 ? "The original never-ending bench" : "Beat round 10 to unlock"; }
    if (ev) { ev.disabled = !k2; ev.classList.toggle("locked", !k2); ev.innerHTML = k2 ? "Endless" : "\ud83d\udd12 Endless"; ev.title = k2 ? "The never-ending waiting room" : "Beat the Vet’s round 10 to unlock"; }
    if (s1) { s1.textContent = k1 ? "Play" : "Let’s go, go, go!"; s1.classList.toggle("gh", k1); }
    if (sv) { sv.disabled = !kv; sv.textContent = kv ? "Let’s go, go, go!" : "\ud83d\udd12 Beat 3AM in the Kitchen"; }
    if (c2) c2.classList.toggle("locked", !kv);
    if ($("bk-new2")) $("bk-new2").hidden = !kv || !!seen;
    if ($("bk-st1")) $("bk-st1").innerHTML = k1 ? "\ud83d\udc51 Conquered" + (b1 ? " \u00b7 best <b>" + fmt(b1) + "</b>" : "") : b1 ? "Best <b>" + fmt(b1) + "</b>" : "10 rounds \u00b7 the VAC-3000 is waiting";
    if ($("bk-st2")) $("bk-st2").innerHTML = !kv ? "Locked" : k2 ? "\ud83e\ude7a Clean bill of health" + (bv ? " \u00b7 best <b>" + fmt(bv) + "</b>" : "") : bv ? "Annual Check-up \u00b7 best <b>" + fmt(bv) + "</b>" : "Annual Check-up";
    if ($("bk-sd2")) $("bk-sd2").textContent = kv ? "10 rounds at the vet. Two Vet vs Cat boss fights. Starts spicier." : "Beat round 10 in the Kitchen to open the clinic.";
    if ($("bk-crowns")) $("bk-crowns").innerHTML = "<b>" + ((k1 ? 1 : 0) + (k2 ? 1 : 0)) + " of 2</b>stage crowns";
    if ($("bk-daily2")) $("bk-daily2").hidden = true;
    if ($("bk-daily")) { var ds = dailyStage(); $("bk-daily").innerHTML = "Today’s daily<small>" + DAYN[sydWd()] + " · " + STNAME[ds] + "</small>"; }
    document.querySelectorAll(".bk-htabs button[data-p='2'], .bk-htabs button[data-p='3']").forEach(function (b) { b.hidden = !k1; });
  }
  function setStage(n) {
    if (n === 2 && !V) n = 1;
    if (!ST1) ST1 = { ITEMS: ITEMS, FOOD: FOOD, BADFOOD: BADFOOD, SPIKY: SPIKY, KICKQ: KICKQ, BOREDQ: BOREDQ, HUNGRYQ: HUNGRYQ, MOTHQ: MOTHQ, OUCHQ: OUCHQ, HEDGEQ: HEDGEQ, BADQ: BADQ, SMASHQ: SMASHQ, CAMP_NAME: CAMP_NAME, CAMP_TIP: CAMP_TIP, CTITLES: CTITLES, SPOTS: SPOTS };
    STAGE = n; var T = n === 2 ? V.TEXT : ST1;
    ITEMS = T.ITEMS; FOOD = T.FOOD; BADFOOD = T.BADFOOD; SPIKY = T.SPIKY; KICKQ = T.KICKQ; BOREDQ = T.BOREDQ; HUNGRYQ = T.HUNGRYQ; MOTHQ = T.MOTHQ; OUCHQ = T.OUCHQ; HEDGEQ = T.HEDGEQ; BADQ = T.BADQ; SMASHQ = T.SMASHQ; CAMP_NAME = T.CAMP_NAME; CAMP_TIP = T.CAMP_TIP; CTITLES = T.CTITLES; SPOTS = T.SPOTS;
    BEST = KEYS[n].best; WON = KEYS[n].won; HS = KEYS[n].hs;
    if (n === 2) lset("mw-basil-vet-seen", 1);
    $("bk-game").classList.toggle("bk-vet", n === 2);
    $("bk-canvas").setAttribute("aria-label", n === 2 ? "Basil the cat on a vet’s exam table, kicking things off" : "Basil the cat on a kitchen bench, kicking things off");
  }
  // stage card pictures, drawn with the game's own art
  // the kitchen flyers: moth, butterfly, wasp (drawn at the origin; fl = wing flap)
  function flyer1(kind, fl) {
      var wc = kind === "moth" ? ["#B8A88A", "#9C8B6E"] : kind === "wasp" ? ["rgba(220,235,245,.75)", "rgba(200,220,235,.7)"] : ["#F0A21E", "#E0703A"];
      if (kind === "wasp") { ctx.save(); ctx.scale(1, fl); ell(-7, -8, 8, 5, wc[0], -0.5); ell(7, -8, 8, 5, wc[0], 0.5); ctx.restore();
        ell(0, 2, 5, 11, "#F2C230"); ctx.fillStyle = "#2B2340"; [-3, 3, 9].forEach(function (yy) { ctx.fillRect(-5, yy, 10, 2.6); }); circ(0, -10, 4.2, "#2B2340"); ctx.fillStyle = "#2B2340"; ctx.beginPath(); ctx.moveTo(-2, 12); ctx.lineTo(0, 18); ctx.lineTo(2, 12); ctx.fill();
        ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-1, -13); ctx.lineTo(-4, -18); ctx.moveTo(1, -13); ctx.lineTo(4, -18); ctx.stroke(); }
      else { ctx.save(); ctx.scale(1, fl); ell(-9, -6, 10, 8, wc[0], -0.4); ell(9, -6, 10, 8, wc[0], 0.4); ell(-7, 6, 7, 6, wc[1], 0.3); ell(7, 6, 7, 6, wc[1], -0.3); ctx.restore();
      if (kind === "butterfly") { circ(-9, -6, 3, "#2B2340"); circ(9, -6, 3, "#2B2340"); }
      ell(0, 0, 2.6, 10, "#2B2340"); ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-1, -9); ctx.lineTo(-5, -16); ctx.moveTo(1, -9); ctx.lineTo(5, -16); ctx.stroke(); }
  }
  // ---------- "How it works": a picture guide drawn with the game's own art ----------
  var GUIDE = {
    1: [["Kick these", "", [["mug", "Mug"], ["pen", "Pen"], ["phone", "Phone"], ["sock", "Sock"], ["pills", "Pills"], ["plant", "Plant"], ["remote", "Remote"], ["glass", "Glass"], ["tube", "Tube"], ["keys", "Keys"], ["thermo", "Thermo"]]],
      ["Smash or grab", "", [["vase", "Vase", "3–5 kicks"], ["tv", "TV", "8–10 kicks"], ["tank", "Fish tank", "+1 life"], ["tap", "Tap", "points ×2"], ["fish", "Fish", "+25%"], ["catnip", "Catnip", "auto-kick"]]],
      ["Clover eats", "gd", [["catfood", "Cat food"], ["banana", "Banana"], ["steak", "Steak"], ["drumstick", "Drumstick"], ["sausage", "Sausage"], ["pizza", "Pizza"]]],
      ["Never touch", "no", [["cactus", "Cactus"], ["pins", "Pins"], ["rose", "Rose"], ["pineapple", "Pineapple"], ["coffee", "Coffee"], ["grapes", "Grapes"], ["garlic", "Garlic"], ["hedgehog", "Hedgehog", "−1 life"], ["@wasp", "Wasp"]]],
      ["Visitors", "", [["@dog", "Dog", "2× speed: tap"], ["@tom", "Stray tom", "tap 3×"], ["@moth", "Moth", "eat: frenzy"], ["@laser", "Laser dot", "tap 3×"]]],
      ["Boss", "bs", [["@vac", "VAC-3000", "rounds 5 + 10"]]]],
    2: [["Kick these", "", [["steth", "Steth"], ["pills", "Pill bottle"], ["clipboard", "Clipboard"], ["cone", "Cone"], ["thermo", "Thermo"], ["cotton", "Cotton jar"], ["treatjar", "Treat jar"], ["syringe", "Oral syringe"], ["bandage", "Vet wrap"], ["glove", "Glove"]]],
      ["Smash or grab", "", [["vase", "Lab flask", "3–5 kicks"], ["tv", "Records", "8–10 kicks"], ["tank", "Dispenser", "+1 life"], ["tap", "Hose", "points ×2"], ["fish", "Heat pack", "+25%"], ["catnip", "Catnip fish", "auto-kick"]]],
      ["Clover eats", "gd", [["dentalchew", "Dental chew"], ["kibble", "Kibble"], ["tunatube", "Tuna paste"], ["biscuitjar", "Dog biscuits"], ["jerky", "Jerky"], ["sardine", "Sardines"]]],
      ["Never touch", "no", [["clippers", "Clippers"], ["slicker", "Brush"], ["spikyball", "Spiky ball"], ["cactus", "Cactus"], ["pillcheese", "Pill in cheese"], ["wormer", "Wormer"], ["pipette", "Flea pipette"], ["dietfood", "Diet food"], ["hedgehog", "Echidna", "−1 life"], ["@mozzie", "Mozzie"]]],
      ["Visitors", "", [["@cockatoo", "Cockatoo", "2× speed: tap"], ["@ginger", "Cat patient", "tap 3×"], ["@fleas", "Fleas", "tap 3×"], ["@blowfly", "Blowfly", "eat: frenzy"], ["@pentorch", "Pen torch", "tap 3×"]]],
      ["Bosses", "bs", [["@vet", "Dr Pokesworth", "rounds 5 + 10"], ["@nurse", "Nurse Burrito", "round 10"]]]]
  };
  var GSCALE = { vase: 0.8, tv: 0.7, tank: 0.55, hedgehog: 0.95 };
  function buildGuide() {
    [1, 2].forEach(function (st) {
      var pane = $("bk-g" + st); if (!pane) return; var h = "";
      GUIDE[st].forEach(function (g) {
        h += '<h3>' + g[0] + '</h3><div class="bk-gg">';
        g[2].forEach(function (it) { h += '<div class="bk-gt ' + g[1] + '"><canvas width="96" height="96" data-k="' + it[0] + '" data-st="' + st + '" aria-hidden="true"></canvas><span>' + it[1] + (it[2] ? '<em>' + it[2] + '</em>' : '') + '</span></div>'; });
        h += '</div>';
      });
      pane.innerHTML = h;
    });
    document.querySelectorAll(".bk-gtabs button").forEach(function (b) { b.onclick = function () { var st = b.getAttribute("data-st"); document.querySelectorAll(".bk-gtabs button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); [1, 2].forEach(function (n) { var p = $("bk-g" + n); if (p) p.hidden = String(n) !== st; }); }; });
  }
  function drawGuide() {
    var keep = ctx, st0 = STAGE;
    document.querySelectorAll(".bk-gt canvas").forEach(function (c) {
      var k = c.getAttribute("data-k"), st = +c.getAttribute("data-st"); if (st === 2 && !V) return;
      ctx = c.getContext("2d"); ctx.setTransform(c.width / 64, 0, 0, c.height / 64, 0, 0); ctx.clearRect(0, 0, 64, 64); STAGE = st;
      try {
        ctx.save();
        if (k.charAt(0) !== "@") { var sc = (st === 2 ? { vase: 0.8, tv: 0.7, tank: 0.52, hedgehog: 0.9 } : GSCALE)[k] || 1; ctx.translate(k === "syringe" ? 39 : 32, 52 + (sc < 1 ? 4 : 0)); ctx.scale(sc, sc); item(k, 0, 0, 0); }
        else if (st === 2) V.icon(k.slice(1));
        else if (k === "@dog") { ctx.translate(32, 30); ctx.scale(0.55, 0.55); ctx.translate(-281, -80); dogDraw(1); }
        else if (k === "@tom") { ctx.translate(32, 30); ctx.scale(0.55, 0.55); ctx.translate(-281, -92); tomDraw({ hitT: 0, k: 1 }); }
        else if (k === "@wasp" || k === "@moth") { ctx.translate(32, 32); ctx.scale(1.5, 1.5); flyer1(k.slice(1), 1); }
        else if (k === "@laser") { circ(32, 32, 15, "rgba(255,40,40,.22)"); circ(32, 32, 6.5, "#FF2A2A"); circ(30, 30, 2, "#FFD6D6"); }
        else if (k === "@vac") { ctx.translate(32, 48); ctx.scale(0.4, 0.4); ctx.translate(0, -(BENCH - 1)); vacuum({ x: 0, atk: null, angry: false, hitT: 0, done: null, dent: 0, face: 1 }); }
        ctx.restore();
      } catch (e) { ctx.restore(); }
    });
    ctx = keep; STAGE = st0;
  }
  function drawThumbs() {
    var keep = ctx, st = STAGE;
    [["bk-th1", 1], ["bk-th2", 2]].forEach(function (q) {
      var c = $(q[0]); if (!c || (q[1] === 2 && !V)) return; var x = c.getContext("2d"); x.setTransform(c.width / W, 0, 0, c.height / H, 0, 0); ctx = x; STAGE = q[1];
      if (q[1] === 1) { scene(); ctx.save(); ctx.translate(180, BENCH + 4); ctx.scale(0.66, 0.66); ctx.translate(-120, -246); spr("basil-body"); spr("basil-head"); catEyes("b", "open"); ctx.restore(); }
      else { V.thumb(); [["b", 64, 0.5], ["c", 312, 0.42]].forEach(function (d) { ctx.save(); ctx.translate(d[1], BENCH + 4); ctx.scale(d[0] === "c" ? -d[2] : d[2], d[2]); ctx.translate(-120, -246); spr(d[0] === "b" ? "basil-body" : "clover-body"); spr(d[0] === "b" ? "basil-head" : "clover-head"); catEyes(d[0], d[0] === "b" ? "wide" : "open"); ctx.restore(); }); }
    });
    ctx = keep; STAGE = st;
    drawGuide();
  }
  // end-of-game: back to the intro and stage select (the "Back to puzzles" link is plain HTML)
  function exitToStart() { running = false; paused = false; try { cancelAnimationFrame(raf); } catch (e) {} $("bk-over").hidden = true; $("bk-game").hidden = true; $("bk-intro").hidden = false; if (typeof stageUI === "function") stageUI(); window.scrollTo({ top: 0, behavior: "auto" }); }
  document.addEventListener("click", function (e) { if (e.target && e.target.id === "bk-exit") exitToStart(); });
  function start() {
    if (STAGE === 2 && !kitchenWon()) setStage(1);
    CAMP = DAILY || !ENDLESS;
    var hadWon = !!lget(WON);
    reset(); S.hadWon = hadWon;
    if (CAMP) { var r0 = DEVR || 1; S.t = (r0 - 1) * 30; enterRound(r0); } if (STAGE !== 2 || VETLB) { var kw = bkey("world", STAGE), kd = bkey("daily", STAGE); if (boards[kw] !== "wait") boards[kw] = null; if (boards[kd] !== "wait") boards[kd] = null; lbFetch(bkey(DAILY ? "daily" : "world", STAGE)); } $("bk-intro").hidden = true; $("bk-game").hidden = false; $("bk-over").hidden = true; paused = false;
    size(); running = true; last = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); hud(); track("basil/start");
    var gt = $("bk-game").getBoundingClientRect().top + window.scrollY - 68; window.scrollTo({ top: Math.max(0, gt), behavior: quiet() ? "auto" : "smooth" });
  }
  function togglePause() { if (!running || S.over) return; paused = !paused; $("bk-pause").innerHTML = paused ? "&#9654;" : "&#10074;&#10074;"; }
  $("bk-start").onclick = function () { setStage(1); DAILY = false; ENDLESS = false; start(); }; $("bk-daily").onclick = function () { setStage(dailyStage()); DAILY = true; ENDLESS = false; track("basil/daily"); start(); };
  $("bk-start2").onclick = function () { if (!kitchenWon()) return; setStage(2); DAILY = false; ENDLESS = false; start(); }; $("bk-daily2").onclick = function () { if (!kitchenWon()) return; setStage(2); DAILY = true; ENDLESS = false; track("basil/daily"); start(); }; $("bk-again").onclick = start; $("bk-pause").onclick = togglePause;
  function goEndless() { if (!lget(WON)) return; DAILY = false; ENDLESS = true; track("basil/endless"); start(); }
  $("bk-endless").onclick = function () { setStage(1); goEndless(); }; $("bk-endlessv").onclick = function () { if (!kitchenWon()) return; setStage(2); goEndless(); }; $("bk-endless2").onclick = goEndless; endlessUI();
  $("bk-sharebtn").onclick = function () {
    var t = S.won ? "I beat all 10 rounds of Basil + Clover" + s2("", ": The Vet") + " 🏆 " + (DAILY ? "Daily challenge " + dayLabel() + ": " : "") + fmt(S.score) + " points. Basil: " + nameFor(S.bPts) + ". Clover: " + nameFor(S.cPts, CNAMES) + "." + (S.perfects ? " Perfect rounds: " + S.perfects + "." : "") + "\nmaladywise.com/basil" : "Basil + Clover" + s2("", ": The Vet") + " 🐾 " + (DAILY ? "Daily challenge " + dayLabel() + ": " : "") + fmt(S.score) + " points, round " + S.round + " (" + S.kicks + " kicks, " + S.eatenFood + " noms). Basil: " + nameFor(S.bPts) + " (" + fmt(S.bPts) + ")" + (S.cPts ? ". Clover: " + nameFor(S.cPts, CNAMES) + " (" + fmt(S.cPts) + ")" : "") + "." + (S.bestCombo >= 5 ? " Best streak: " + comboTitle(S.bestCombo) + "." : "") + "\nmaladywise.com/basil", b = this;
    if (navigator.share) { navigator.share({ text: t }).catch(function () {}); return; }
    try { navigator.clipboard.writeText(t).then(function () { b.textContent = "Copied"; }); } catch (e) {}
  };
  // How to play popup (two pages). Opening it mid-game pauses.
  var helpPaused = false;
  function helpPage(n) { document.querySelectorAll(".bk-hp").forEach(function (u) { u.hidden = u.getAttribute("data-p") !== String(n); }); document.querySelectorAll(".bk-htabs button").forEach(function (b) { b.setAttribute("aria-selected", b.getAttribute("data-p") === String(n) ? "true" : "false"); }); }
  function helpOpen() { helpPaused = running && S && !S.over && !paused; if (helpPaused) togglePause(); helpPage(STAGE === 2 && running ? 2 : 0); $("bk-help").hidden = false; $("bk-hgo").focus(); track("basil/help"); }
  function helpClose() { $("bk-help").hidden = true; if (helpPaused && paused) togglePause(); helpPaused = false; }
  $("bk-howbtn").onclick = helpOpen; $("bk-helpbtn").onclick = helpOpen; $("bk-hx").onclick = helpClose; $("bk-hgo").onclick = helpClose;
  $("bk-help").addEventListener("click", function (e) { if (e.target === this) helpClose(); var b = e.target.closest(".bk-htabs button"); if (b) helpPage(b.getAttribute("data-p")); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("bk-help").hidden) { e.stopImmediatePropagation(); helpClose(); } }, true);
  document.addEventListener("visibilitychange", function () { if (document.hidden && running && !S.over && !paused) togglePause(); });
  window.addEventListener("resize", function () { if (running) size(); });
  renderBoard("bk-hslist0", "world"); hsUI(); vetProbe();
  buildGuide(); reset(); size(); draw(); if (!sprLeft) drawThumbs();
  if (DEVSTAGE === 2 && kitchenWon()) setStage(2);
})();
