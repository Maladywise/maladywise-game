/* Basil Kicks: bonus Malady Wise arcade game. Basil (smug, fluffy, white) kicks everything off the kitchen bench.
   Tap a bench spot (or keys 1/2/3) to kick what's there before he gets bored. Clover (tortoiseshell sister) wanders past:
   swiping her scores a bonus and makes her cross; swipe her while she's cross and she swipes back (lose a life); leave a cross
   Clover alone and she kicks one of Basil's things herself (no points). Spiky things (cactus, pincushion, rose): never kick, they cost
   a life; leave them and they vanish. The tap = sink time (clears the bench, double points). The fish = an extra life.
   Every 60 points (then every 75): Clover's turn, a 10-second bonus round where Clover kicks, double points, no lives lost.
   Best score is kept in this browser only. */
(function () {
  "use strict";
  var BEST = "mw-basil-best";
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
    var w = cv.parentNode.clientWidth || 360; dpr = Math.min(3, window.devicePixelRatio || 1);
    cv.style.height = (w * H / W) + "px"; cv.width = Math.round(w * dpr); cv.height = Math.round(w * H / W * dpr);
    ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
  }

  // ---------- copy ----------
  var KICKQ = ["Gravity check: passed.", "It was in his way. Everything is.", "Smug level: rising.", "He regrets nothing.", "Another one for the floor.", "Physics, but rude.", "He looked you in the eye first.", "That was a gift. To the floor.", "Bench, decluttered.", "Peak cat behaviour.", "He calls it tidying.", "No witnesses. Except you."];
  var BOREDQ = ["He got bored. Unwell?", "He left one. Concerning.", "Missed a kick. He blames you.", "Basil is disappointed in you.", "One survived. Basil will remember."];
  var CLOVQ = ["Clover: 'Rude.'", "Clover files a complaint.", "Clover has been swiped. Again.", "Sibling rivalry: active.", "Clover glares. Basil smirks."];
  var CLOVBACK = ["Clover swiped back. Fair.", "Clover had enough. Justice served.", "Tortoiseshell revenge."];
  var CLOVSTEAL = ["Clover kicked it herself. Revenge.", "Clover stole the kick. Petty. Effective.", "Clover: 'Mine now.'"];
  var OUCHQ = ["Ouch. That one was spiky.", "Basil has learned nothing.", "Cactus: 1, Basil: 0.", "Paw, meet prickles.", "Some things you don't kick."];
  var SPIKY = ["cactus", "pins", "rose"];
  var NAMES = [[0, "Fluffy white rat"], [15, "Basil Brown Pants"], [35, "Fat Basil"], [60, "Fat white seal"], [100, "Basil Bad Cat"], [160, "Albino Satan"]];
  var ITEMS = ["mug", "pen", "phone", "sock", "pills", "steth", "plant", "remote", "glass", "tube", "keys", "thermo"];

  // ---------- state ----------
  var S, raf = 0, last = 0, paused = false, running = false;
  function reset() {
    S = { t: 0, score: 0, lives: 3, combo: 0, lastKick: -9, spawnT: 0.8, lanes: [null, null, null], fly: [], fx: [], clover: null, cloverT: rnd(7, 11), swiped: 0, cross: false, bonus: 0, nextBonus: 60, ouchT: 0, scratchT: 0, ouches: 0, bonuses: 0,
      sinkT: 0, paw: null, lean: 0, blink: 0, over: false, drops: [], specialT: rnd(14, 20) };
  }
  function spawnEvery() { return S.bonus > 0 ? 0.42 : Math.max(0.52, 1.45 - S.t * 0.011); }
  function isSpiky(k) { return SPIKY.indexOf(k) >= 0; }
  function patience() { return Math.max(1.45, 3.4 - S.t * 0.018); }

  function spawn(kind) {
    var free = [0, 1, 2].filter(function (i) { return !S.lanes[i] && !(S.clover && S.clover.lane === i && S.clover.state === "sit"); });
    if (!free.length) return false;
    if (!kind && S.bonus <= 0 && S.t > 6 && Math.random() < Math.min(0.24, 0.1 + S.t * 0.0015)) kind = pick(SPIKY);
    var i = pick(free), p = kind === "tap" || kind === "fish" ? 2.6 : isSpiky(kind) ? 2.3 : patience();
    S.lanes[i] = { kind: kind || pick(ITEMS), y: -40, vy: 0, landed: false, life: p, max: p, wob: rnd(0, 6) };
    return true;
  }

  // ---------- input ----------
  function kick(i) {
    if (!running || paused || S.over) return;
    S.paw = { lane: i, t: 0 }; S.lean = (i - 1) * 0.12;
    var it = S.lanes[i];
    if (S.clover && S.clover.lane === i && S.clover.state === "sit" && !it) return swipeClover();
    if (!it || !it.landed) return;
    S.lanes[i] = null;
    var dir = i === 0 ? -1 : i === 2 ? 1 : (Math.random() < .5 ? -1 : 1);
    S.fly.push({ kind: it.kind, x: LANES[i], y: BENCH - 2, vx: dir * rnd(110, 210), vy: -rnd(240, 320), r: 0, vr: dir * rnd(6, 11) });
    if (isSpiky(it.kind)) {
      S.combo = 0; S.ouchT = 0.7; S.ouches++; float(LANES[i], BENCH - 60, "Ouch!", "#C2553A"); toast(pick(OUCHQ)); shake();
      if (S.bonus <= 0) { S.lives--; if (S.lives <= 0) end(); }
      return;
    }
    if (it.kind === "tap") { sinkTime(); return; }
    if (it.kind === "fish") { if (S.lives < 3) S.lives++; float(LANES[i], BENCH - 60, "+1 life", "#E05A8A"); toast("Fish acquired. Basil is briefly nice."); return; }
    S.combo = S.t - S.lastKick < 1.05 ? S.combo + 1 : 0; S.lastKick = S.t;
    var mult = Math.min(4, 1 + Math.floor(S.combo / 3)) * (S.sinkT > 0 || S.bonus > 0 ? 2 : 1);
    S.score += mult; float(LANES[i], BENCH - 60, "+" + mult, mult > 1 ? "#B5308A" : "#2B5E80");
    if (S.score % 9 === 0 && S.bonus <= 0) toast(pick(KICKQ));
    if (S.bonus <= 0 && S.score >= S.nextBonus) startBonus();
  }
  function startBonus() {
    S.bonus = 10; S.bonuses++; S.nextBonus = S.score + 75; S.clover = null; S.cloverT = rnd(12, 16);
    toast("Clover's turn! Double points. No lives lost."); track("basil/bonus");
  }
  function swipeClover() {
    var c = S.clover; c.state = "flee"; c.hit = 1; S.swiped++;
    if (c.cross) { S.cross = false; S.lives--; S.scratchT = 0.8; float(LANES[c.lane], BENCH - 90, "Clover swipes back!", "#C2553A"); toast(pick(CLOVBACK)); shake(); if (S.lives <= 0) end(); }
    else { S.cross = true; S.score += 3; float(LANES[c.lane], BENCH - 90, "+3 sister swipe", "#B07A0C"); toast(pick(CLOVQ) + " She’ll be cross next time."); }
  }
  function cloverSteals(c) {
    S.cross = false;
    var ls = [c.lane - 1, c.lane + 1, c.lane].filter(function (j) { var it = S.lanes[j]; return j >= 0 && j < 3 && it && it.landed && !isSpiky(it.kind) && it.kind !== "tap" && it.kind !== "fish"; });
    if (!ls.length) { toast("Clover calmed down. For now."); return; }
    var j = ls[0], it = S.lanes[j]; S.lanes[j] = null; S.combo = 0;
    S.fly.push({ kind: it.kind, x: LANES[j], y: BENCH - 2, vx: (j - c.lane || 1) * rnd(140, 220), vy: -rnd(240, 300), r: 0, vr: rnd(-9, 9) });
    float(LANES[j], BENCH - 70, "Stolen!", "#B07A0C"); toast(pick(CLOVSTEAL));
  }
  function sinkTime() {
    S.sinkT = 5; toast("Sink time! Splash everything. Double points.");
    for (var i = 0; i < 3; i++) { var it = S.lanes[i]; if (it && it.kind !== "tap" && it.kind !== "fish") { S.lanes[i] = null; S.score += 2; S.fly.push({ kind: it.kind, x: LANES[i], y: BENCH - 2, vx: (i - 1 || 1) * rnd(120, 200), vy: -rnd(260, 340), r: 0, vr: rnd(-10, 10) }); } }
    for (var k = 0; k < 40; k++) S.drops.push({ x: 180 + rnd(-40, 40), y: 210, vx: rnd(-180, 180), vy: -rnd(120, 360), l: rnd(.6, 1.2) });
  }
  var shakeT = 0; function shake() { if (!quiet()) shakeT = 0.3; }
  function float(x, y, txt, col) { S.fx.push({ x: x, y: y, txt: txt, col: col, l: 1 }); }
  var toastT = 0; function toast(m) { var el = $("bk-toast"); el.textContent = m; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { el.hidden = true; }, 1700); }

  function laneAt(ev) { var r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * W; return x < 126 ? 0 : x < 234 ? 1 : 2; }
  cv.addEventListener("pointerdown", function (e) { e.preventDefault(); kick(laneAt(e)); });
  document.addEventListener("keydown", function (e) {
    if (!running) return;
    var k = { "1": 0, "2": 1, "3": 2, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 1, ArrowRight: 2, a: 0, s: 1, d: 2 }[e.key];
    if (k != null) { e.preventDefault(); kick(k); }
    if (e.key === " " && S.over) { e.preventDefault(); start(); }
    if (e.key === "p" || e.key === "Escape") togglePause();
  });

  // ---------- loop ----------
  function step(dt) {
    S.t += dt; S.blink -= dt; if (S.blink < -3.2) S.blink = 0.15;
    if (S.sinkT > 0) S.sinkT -= dt;
    if (S.ouchT > 0) S.ouchT -= dt;
    if (S.scratchT > 0) S.scratchT -= dt;
    if (S.bonus > 0) { S.bonus -= dt; if (S.bonus <= 0) { S.bonus = 0; toast("Basil’s back. He saw everything."); } }
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
      it.life -= dt;
      if (it.life <= 0) {
        S.lanes[i] = null;
        if (it.kind === "tap" || it.kind === "fish") continue;
        if (isSpiky(it.kind)) { S.fx.push({ x: LANES[i], y: BENCH - 40, txt: "poof", col: "#8A7BB0", l: 0.8 }); continue; }
        if (S.bonus > 0) continue;
        S.lives--; S.combo = 0; float(LANES[i], BENCH - 70, "Bored.", "#6B5A93"); toast(pick(BOREDQ)); shake();
        if (S.lives <= 0) { end(); return; }
      }
    }
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
  function basil() {
    var x = 180 + S.lean * 90, y = BENCH - 62, CL = S.bonus > 0, sink = S.sinkT > 0 && !CL;
    var BASE = CL ? "#6B666D" : "#FFFFFF", EDGE = CL ? "#55505A" : "#E9E4DC", EYE = CL ? "#E3A33A" : "#6CB84A";
    ctx.save(); ctx.translate(x, y); ctx.rotate(S.lean);
    // tail
    ctx.strokeStyle = EDGE; ctx.lineWidth = 22; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-34, 30); ctx.quadraticCurveTo(-80, 26, -70, -10); ctx.stroke();
    ctx.strokeStyle = BASE; ctx.lineWidth = 16; ctx.stroke();
    // body
    if (CL) { ell(0, 8, 44, 34, EDGE); ell(0, 8, 42, 32, BASE); ell(-18, -4, 16, 12, "#D8925A"); ell(20, 14, 13, 10, "#C27A43"); ell(4, -14, 10, 7, "#2E2A30"); ell(0, 22, 22, 15, "#FFFFFF"); }
    else { fluff(0, 8, 46, 36, 22, EDGE, 11); ell(0, 8, 47, 37, BASE); fluff(0, 8, 42, 32, 18, BASE, 9); ell(0, 22, 26, 18, BASE); }
    // paws
    var pw = S.paw, reach = pw ? Math.sin(Math.min(1, pw.t / 0.11) * Math.PI / 2) * (pw.t < 0.11 ? 1 : Math.max(0, 1 - (pw.t - 0.11) / 0.11)) : 0;
    var tx = pw ? (LANES[pw.lane] - x) : 0;
    ell(-14 + (pw && pw.lane <= 1 ? tx * reach * 0.9 : 0), 42 + (pw ? reach * 10 : 0), 11, 8, CL ? "#2E2A30" : "#FFFFFF");
    ell(14 + (pw && pw.lane === 2 ? tx * reach * 0.9 : 0), 42 + (pw ? reach * 10 : 0), 11, 8, CL ? "#D8925A" : "#FFFFFF");
    ctx.strokeStyle = "#E3DBD1"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(-14 + (pw && pw.lane <= 1 ? tx * reach * 0.9 : 0), 42 + (pw ? reach * 10 : 0), 11, 8, 0, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(14 + (pw && pw.lane === 2 ? tx * reach * 0.9 : 0), 42 + (pw ? reach * 10 : 0), 11, 8, 0, 0, 7); ctx.stroke();
    // head
    var hx = 4, hy = -40;
    ctx.fillStyle = BASE; ctx.beginPath(); ctx.moveTo(hx - 28, hy - 6); ctx.lineTo(hx - 24, hy - 42); ctx.lineTo(hx - 4, hy - 22); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx + 28, hy - 6); ctx.lineTo(hx + 24, hy - 42); ctx.lineTo(hx + 4, hy - 22); ctx.fill();
    ctx.fillStyle = "#F6B9C6"; ctx.beginPath(); ctx.moveTo(hx - 23, hy - 12); ctx.lineTo(hx - 21, hy - 34); ctx.lineTo(hx - 9, hy - 22); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx + 23, hy - 12); ctx.lineTo(hx + 21, hy - 34); ctx.lineTo(hx + 9, hy - 22); ctx.fill();
    if (CL) { ell(hx, hy, 29, 25, EDGE); ell(hx, hy, 27, 23, BASE); ell(hx - 10, hy - 10, 11, 9, "#D8925A"); ell(hx + 12, hy - 12, 8, 6, "#2E2A30"); ell(hx + 4, hy + 10, 14, 8, "#F1D9C2"); }
    else { fluff(hx, hy, 30, 26, 16, EDGE, 8); ell(hx, hy, 31, 27, BASE); fluff(hx, hy + 6, 30, 20, 14, BASE, 7); }
    // smug eyes (half-lidded) or closed blink
    [-12, 12].forEach(function (ex) {
      if (S.ouchT > 0) { ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(hx + ex - 6, hy - 6); ctx.lineTo(hx + ex + 6, hy + 2); ctx.moveTo(hx + ex + 6, hy - 6); ctx.lineTo(hx + ex - 6, hy + 2); ctx.stroke(); return; }
      if (S.blink > 0 || sink) { ctx.strokeStyle = "#7A6E62"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(hx + ex, hy - 2, 6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); return; }
      ell(hx + ex, hy - 1, 7.5, 6, EYE); ell(hx + ex + 1, hy, 2.4, 5, "#2B2340");
      if (!CL) { ctx.fillStyle = BASE; ctx.fillRect(hx + ex - 9, hy - 9, 18, 6.6); }
      ctx.strokeStyle = "#B9AFA3"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx + ex - 8, hy - 2.6); ctx.lineTo(hx + ex + 8, hy - 2.6); ctx.stroke();
    });
    ctx.fillStyle = "#F3A6B6"; ctx.beginPath(); ctx.moveTo(hx - 4, hy + 8); ctx.lineTo(hx + 4, hy + 8); ctx.lineTo(hx, hy + 12); ctx.fill();
    ctx.strokeStyle = "#B08B8B"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(hx, hy + 12); ctx.quadraticCurveTo(hx + 6, hy + 17, hx + 11, hy + 13); ctx.stroke();
    ctx.strokeStyle = "rgba(160,150,140,.6)"; ctx.lineWidth = 1; [-1, 1].forEach(function (s) { for (var k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(hx + s * 9, hy + 10 + k * 2); ctx.lineTo(hx + s * 30, hy + 6 + k * 5); ctx.stroke(); } });
    if (S.scratchT > 0) { ctx.strokeStyle = "rgba(194,85,58," + Math.min(1, S.scratchT * 2) + ")"; ctx.lineWidth = 3; ctx.lineCap = "round"; for (var k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(hx - 20 + k * 9, hy - 22); ctx.lineTo(hx - 6 + k * 9, hy + 4); ctx.stroke(); } }
    ctx.restore();
    if (CL) sulk();
    if (sink) { ctx.fillStyle = "rgba(120,190,230,.35)"; ctx.fillRect(0, BENCH - 30, W, 8); }
  }
  function sulk() {
    var x = 52, y = BENCH - 46;
    ctx.fillStyle = "#FFFFFF"; ctx.beginPath(); ctx.moveTo(x - 16, y - 2); ctx.lineTo(x - 13, y - 22); ctx.lineTo(x - 3, y - 10); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + 16, y - 2); ctx.lineTo(x + 13, y - 22); ctx.lineTo(x + 3, y - 10); ctx.fill();
    ell(x, y, 17, 14, "#FFFFFF"); ctx.strokeStyle = "#E3DBD1"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x, y, 17, 14, 0, 0, 7); ctx.stroke();
    [-6, 6].forEach(function (ex) { ell(x + ex, y, 3.6, 3, "#6CB84A"); ctx.fillStyle = "#FFFFFF"; ctx.fillRect(x + ex - 5, y - 4, 10, 3.4); ctx.strokeStyle = "#B9AFA3"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x + ex - 4, y - 0.6); ctx.lineTo(x + ex + 4, y - 0.6); ctx.stroke(); });
    rr(14, BENCH - 36, 78, 14, 6); ctx.fillStyle = "#D9E2E8"; ctx.fill();
    ctx.fillStyle = "#6B5A93"; ctx.font = "600 10px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("sulking", x, y - 26);
  }
  function clover() {
    var c = S.clover; if (!c) return;
    var x = c.x, y = BENCH - 24, step = Math.sin(S.t * 18) * (c.state === "sit" ? 0 : 3), f = c.dir > 0 || c.state === "sit" ? 1 : -1;
    ctx.save(); ctx.translate(x, y); ctx.scale(c.state === "sit" ? 1 : f, 1);
    if (c.state === "sit") {
      ctx.strokeStyle = "#5E5A60"; ctx.lineWidth = 8; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(14, -4); ctx.quadraticCurveTo(34, -6, 30, -24); ctx.stroke();
      ell(0, -16, 20, 18, "#6B666D"); ell(-6, -22, 9, 7, "#D8925A"); ell(7, -10, 7, 6, "#C27A43"); ell(0, -10, 9, 10, "#FFFFFF");
      var hy = -42; ctx.fillStyle = "#6B666D"; ctx.beginPath(); ctx.moveTo(-15, hy - 2); ctx.lineTo(-12, hy - 20); ctx.lineTo(-3, hy - 10); ctx.fill(); ctx.beginPath(); ctx.moveTo(15, hy - 2); ctx.lineTo(12, hy - 20); ctx.lineTo(3, hy - 10); ctx.fill();
      ell(0, hy, 15, 13, "#6B666D"); ell(-4, hy - 4, 6, 7, "#E3A36A"); ell(4, hy + 5, 6, 4, "#F1D9C2");
      ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 2; [-6, 6].forEach(function (ex) { ctx.beginPath(); ctx.moveTo(hx2(ex) - 3, hy - 1); ctx.lineTo(hx2(ex) + 3, hy + 1); ctx.stroke(); });
      if (c.cross) { ctx.strokeStyle = "#C2553A"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-10, hy - 8); ctx.lineTo(-2, hy - 4); ctx.moveTo(10, hy - 8); ctx.lineTo(2, hy - 4); ctx.stroke(); }
      ell(-6, -1, 5, 3, "#FFFFFF"); ell(6, -1, 5, 3, "#FFFFFF");
    } else {
      ctx.strokeStyle = "#5E5A60"; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-22, -16); ctx.quadraticCurveTo(-34, -30, -28, -42); ctx.stroke();
      ctx.fillStyle = "#5E5A60"; [-14, -6, 8, 16].forEach(function (lx, k) { ctx.fillRect(lx + (k % 2 ? step : -step), -10, 5, 12); });
      ell(0, -16, 25, 11, "#6B666D"); ell(-6, -20, 9, 5, "#D8925A"); ell(10, -14, 6, 4, "#C27A43");
      ell(26, -26, 12, 11, "#6B666D"); ell(29, -29, 5, 4, "#E3A36A"); ctx.fillStyle = "#6B666D"; ctx.beginPath(); ctx.moveTo(20, -32); ctx.lineTo(22, -44); ctx.lineTo(28, -35); ctx.fill(); ctx.beginPath(); ctx.moveTo(30, -34); ctx.lineTo(34, -45); ctx.lineTo(37, -32); ctx.fill();
      circ(32, -27, 1.8, "#2B2340");
    }
    ctx.restore();
    if (c.cross && !c.hit) {
      var bx = x + (c.state === "sit" ? 0 : f * 26), by = BENCH - (c.state === "sit" ? 92 : 78);
      rr(bx - 22, by - 14, 44, 20, 9); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.strokeStyle = "#C2553A"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#C2553A"; ctx.font = "700 12px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("HISS", bx, by + 1);
    }
    function hx2(v) { return v; }
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
      case "fish": ell(0, -12, 16, 9, "#F0A21E"); ctx.fillStyle = "#F0A21E"; ctx.beginPath(); ctx.moveTo(14, -12); ctx.lineTo(26, -22); ctx.lineTo(26, -2); ctx.fill(); circ(-8, -14, 2, "#2B2340"); break;
    }
    ctx.restore();
  }
  function draw() {
    ctx.save();
    if (shakeT > 0) ctx.translate(rnd(-3, 3), rnd(-2, 2));
    scene(); basil();
    for (var i = 0; i < 3; i++) {
      var it = S.lanes[i]; if (!it) continue;
      var wob = it.landed && it.life < 1 ? Math.sin(S.t * 30 + it.wob) * 0.08 : 0;
      item(it.kind, LANES[i], it.y, wob);
      if (it.landed && isSpiky(it.kind)) { ctx.strokeStyle = "#C2553A"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(LANES[i], BENCH - 64, 8, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(LANES[i] - 5.5, BENCH - 69.5); ctx.lineTo(LANES[i] + 5.5, BENCH - 58.5); ctx.stroke(); continue; }
      if (it.landed) { var p = Math.max(0, it.life / it.max); ctx.strokeStyle = it.kind === "tap" || it.kind === "fish" ? "#2E7D6B" : p < .35 ? "#C2553A" : "#2B5E80"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(LANES[i], BENCH - 56, 7, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke(); }
    }
    clover();
    S.fly.forEach(function (f) { item(f.kind, f.x, f.y, f.r); });
    S.drops.forEach(function (d) { ctx.globalAlpha = Math.max(0, d.l); circ(d.x, d.y, 3, "#5AA9DC"); ctx.globalAlpha = 1; });
    S.fx.forEach(function (f) { ctx.globalAlpha = Math.max(0, f.l); ctx.fillStyle = f.col; ctx.font = "700 15px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText(f.txt, f.x, f.y); ctx.globalAlpha = 1; });
    if (S.bonus > 0) { rr(96, 12, 168, 26, 13); ctx.fillStyle = "#B07A0C"; ctx.fill(); ctx.fillStyle = "#FFF"; ctx.font = "700 13px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("CLOVER'S TURN x2 · " + Math.ceil(S.bonus) + "s", 180, 30); }
    else if (S.sinkT > 0) { ctx.fillStyle = "#2B5E80"; ctx.font = "700 14px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillText("SINK TIME x2", 180, 28); }
    if (paused) { ctx.fillStyle = "rgba(43,35,64,.55)"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#fff"; ctx.font = "700 26px Lora, serif"; ctx.textAlign = "center"; ctx.fillText("Paused. Basil is napping.", 180, H / 2); }
    ctx.restore();
  }
  function hud() {
    $("bk-score").textContent = S.score;
    var mult = Math.min(4, 1 + Math.floor(S.combo / 3));
    $("bk-combo").textContent = S.t - S.lastKick < 1.05 && mult > 1 ? "Combo x" + mult : "";
    $("bk-lives").innerHTML = [0, 1, 2].map(function (i) { return '<span class="' + (i < S.lives ? "" : "off") + '">&#128062;</span>'; }).join("");
  }

  // ---------- flow ----------
  function nameFor(n) { var nm = NAMES[0][1]; NAMES.forEach(function (x) { if (n >= x[0]) nm = x[1]; }); return nm; }
  function end() {
    S.over = true; var best = lget(BEST) || 0, pb = S.score > best; if (pb) lset(BEST, S.score);
    $("bk-otitle").textContent = "Verdict: " + nameFor(S.score);
    $("bk-omsg").textContent = S.score < 15 ? "Barely a kick. He's saving his energy for 3am." : S.score < 60 ? "A respectable mess. The bench will never be the same." : S.score < 120 ? "Chaos. Several mugs have filed for compensation." : "Pure evil. Fluffy, smug, white evil.";
    $("bk-okick").textContent = S.score; $("bk-oswipe").textContent = S.swiped; if ($("bk-oouch")) $("bk-oouch").textContent = S.ouches;
    var ob = $("bk-obest"); ob.textContent = pb ? "New personal best!" : "Best: " + best; ob.className = "bk-obest" + (pb ? " pb" : "");
    $("bk-over").hidden = false; track("basil/end"); setTimeout(function () { $("bk-again").focus(); }, 50);
  }
  function start() {
    reset(); $("bk-intro").hidden = true; $("bk-game").hidden = false; $("bk-over").hidden = true; paused = false;
    size(); running = true; last = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); hud(); track("basil/start");
    $("bk-stage").scrollIntoView({ behavior: quiet() ? "auto" : "smooth", block: "center" });
  }
  function togglePause() { if (!running || S.over) return; paused = !paused; $("bk-pause").innerHTML = paused ? "&#9654;" : "&#10074;&#10074;"; }
  $("bk-start").onclick = start; $("bk-again").onclick = start; $("bk-pause").onclick = togglePause;
  $("bk-sharebtn").onclick = function () {
    var t = "Basil Kicks 🐾 " + S.score + " things kicked off the bench" + (S.swiped ? ", Clover swiped " + S.swiped + "x" : "") + ". Verdict: " + nameFor(S.score) + ".\nmaladywise.com/basil", b = this;
    if (navigator.share) { navigator.share({ text: t }).catch(function () {}); return; }
    try { navigator.clipboard.writeText(t).then(function () { b.textContent = "Copied"; }); } catch (e) {}
  };
  document.addEventListener("visibilitychange", function () { if (document.hidden && running && !S.over && !paused) togglePause(); });
  window.addEventListener("resize", function () { if (running) size(); });
  var b0 = lget(BEST); if (b0) $("bk-best").innerHTML = "Your best: <b>" + b0 + "</b> kicks";
  reset(); size(); draw();
})();
