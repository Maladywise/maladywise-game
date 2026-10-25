/* Night Shift: hidden Malady Wise arcade game. Locum flies the hospital corridor, 11pm to 7am. */
(function () {
  "use strict";
  var N = !!(window.MW_mode && MW_mode() === "normie");
  var KEY = "mw-nightshift-best", SKEY = "mw-nightshift-sound";
  function lget(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function lset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function track(n) {
    try {
      if (window.MW_track) MW_track(n);
      else if (window.goatcounter && goatcounter.count) goatcounter.count({ path: n, title: n, event: true });
    } catch (e) {}
  }
  function quiet() {
    var r = document.documentElement.getAttribute("data-motion") === "reduce";
    try { r = r || matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
    return r;
  }
  function $(id) { return document.getElementById(id); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  // ---------- copy (medical vs normie) ----------
  var T = N ? {
    lede: "Fly Locum through the house from 11pm to 7am. Grab coffee, dodge alarm clocks, footballs and floor lamps. Three lives. Breakfast is at 7.",
    hazards: ["clock", "ball", "lamp"],
    bonus: "COFFEE RUSH!",
    signs: ["Kitchen →", "Lounge", "Bathroom", "← Garage", "Laundry", "Nap zone"],
    over: ["Alarm clock 1, Locum 0. Asleep at {t}.", "Dozed off on the couch at {t}. Classic.", "Out cold at {t}. The footy can wait.", "The night owls have suspended you. Last seen {t}.", "{c} and still yawning at {t}.", "Bed won. It always does. {t}."],
    winT: "Morning!", win: "7am and still upright. Go and eat some toast."
  } : {
    lede: "Fly Locum through the hospital from 11pm to 7am. Grab coffee, dodge pagers, IV poles and ringing phones. Three lives. Handover is at 7.",
    hazards: ["pager", "pole", "phone"],
    bonus: "CODE BLUE!",
    signs: ["ED →", "Ward 4B", "Radiology", "← ICU", "Pharmacy", "On-call room"],
    over: ["Handover at 7am. You lasted until {t}.", "Found asleep in the on-call room at {t}.", "The registrar would like a word. Lights out at {t}.", "Bleeped once too often. Off the ward at {t}.", "Signed off sick at {t}. {c} wasn’t enough.", "That’s an incident report. Shift ended {t}.", "Admin has your timesheet: 11pm to {t}. Unpaid break not taken."],
    winT: "Handover!", win: "7am. Everyone’s alive, including you. Go home and sleep."
  };
  $("ns-lede").textContent = T.lede;
  var mascSrc = N ? "/assets/mascots/normie/grandrounds.svg" : "/assets/mascots/grandrounds.svg";
  $("ns-masc").src = mascSrc; $("ns-omasc").src = mascSrc;
  $("ns-masc").onerror = $("ns-omasc").onerror = function () { this.onerror = null; this.src = "/assets/mascots/grandrounds.svg"; };

  // ---------- time ----------
  var START = 23 * 60, SHIFT_MIN = 480;
  function clockStr(m, compact) {
    m = Math.floor(m) % 1440; var h = Math.floor(m / 60), mm = m % 60, ap = h < 12 ? "am" : "pm";
    var hh = h % 12 || 12; return hh + ":" + (mm < 10 ? "0" : "") + mm + (compact ? "" : " ") + ap;
  }
  function better(a, b) { return !b || a.m > b.m || (a.m === b.m && a.c > b.c); }
  function showBest() {
    var b = lget(KEY);
    $("ns-best").innerHTML = b && b.m != null ? "Your best: until <b>" + clockStr(START + b.m) + "</b> with <b>" + b.c + "</b> coffee" + (b.c === 1 ? "" : "s") : "";
  }
  showBest();

  // ---------- sound (off by default) ----------
  var soundOn = lget(SKEY) === 1, actx = null;
  function setMuteBtn() { var b = $("ns-mute"); b.innerHTML = soundOn ? "&#128266;" : "&#128263;"; b.setAttribute("aria-label", soundOn ? "Sound on" : "Sound off"); b.setAttribute("aria-pressed", soundOn ? "true" : "false"); }
  setMuteBtn();
  function blip(f, d, type, vol, slide) {
    if (!soundOn) return;
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      var t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
      o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
      g.gain.setValueAtTime(vol || 0.06, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d + 0.02);
    } catch (e) {}
  }
  var SFX = {
    flap: function () { blip(420, 0.07, "triangle", 0.035, 620); },
    coffee: function () { blip(880, 0.08, "sine", 0.05); setTimeout(function () { blip(1320, 0.1, "sine", 0.04); }, 60); },
    hit: function () { blip(180, 0.25, "sawtooth", 0.05, 60); },
    bonus: function () { [660, 880, 1100, 1320].forEach(function (f, i) { setTimeout(function () { blip(f, 0.09, "square", 0.03); }, i * 70); }); },
    over: function () { [520, 400, 300].forEach(function (f, i) { setTimeout(function () { blip(f, 0.18, "triangle", 0.05); }, i * 150); }); }
  };

  // ---------- Locum sprite from the mascot SVG ----------
  var bat = new Image(), batOK = false;
  function loadBat(src, fallback) {
    // Give the SVG explicit width/height so every browser rasterises it crisply on canvas.
    fetch(src).then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (s) {
      s = s.replace("<svg ", '<svg width="240" height="240" ');
      bat.onload = function () { batOK = true; };
      bat.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
    }).catch(function () {
      if (fallback) return loadBat(fallback);
      bat.onload = function () { batOK = true; }; bat.src = src;
    });
  }
  loadBat(mascSrc, N ? "/assets/mascots/grandrounds.svg" : null);

  // ---------- canvas setup ----------
  var cv = $("ns-canvas"), ctx = cv.getContext("2d"), stage = $("ns-stage");
  var WH = 400, WW = 600, S = 1, DPR = 1, FLOOR = WH - 36, CEIL = 28;
  function size() {
    var w = stage.clientWidth || 360;
    var h = Math.round(Math.min(520, Math.max(340, Math.min(window.innerHeight * 0.64, w * 1.15))));
    DPR = Math.min(window.devicePixelRatio || 1, 2.5);
    cv.style.height = h + "px";
    cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR);
    S = h / WH; WW = w / S;
    if (G) G.px = Math.min(WW * 0.28, 150);
  }

  // ---------- game state ----------
  var G = null, raf = 0, last = 0, state = "idle"; // idle | ready | play | paused | over
  function newGame() {
    var calm = quiet();
    G = {
      calm: calm, t: 0, dist: 0, px: Math.min(WW * 0.28, 150), y: WH * 0.45, vy: 0, rot: 0, flapT: 0,
      lives: 3, inv: 0, coffee: 0, obs: [], cups: [], fx: [], nextObs: 320, nextCup: 160, nextBonus: calm ? 24 : 20,
      rush: 0, shake: 0, banner: 0, len: calm ? 95 : 80, g: calm ? 760 : 900, flap: calm ? -270 : -300,
      lastClock: -1, lastCof: -1, lastLives: -1, ended: false
    };
  }
  function prog() { return clamp(G.t / G.len, 0, 1); }
  function minutes() { return SHIFT_MIN * prog(); }
  function speed() { var p = prog(); return G.calm ? 120 + 70 * p : 150 + 120 * p; }

  // ---------- spawning ----------
  function spawnObs() {
    var p = prog(), kind = pick(T.hazards), o;
    if (kind === "pole" || kind === "lamp") {
      var h = rnd(110, WH * (0.42 + 0.14 * p));
      o = { k: kind, x: WW + 30, w: 26, h: h, y: FLOOR - h };
    } else {
      var y = rnd(CEIL + 40, FLOOR - 40);
      o = { k: kind, x: WW + 30, y: y, y0: y, r: 16, extra: kind === "pager" || kind === "ball" ? rnd(40, 90 + 60 * p) : 0, ph: rnd(0, 6), amp: kind === "phone" || kind === "clock" ? rnd(14, 34) : rnd(4, 12) };
    }
    G.obs.push(o);
  }
  function safeY(y, x) {
    for (var i = 0; i < G.obs.length; i++) {
      var o = G.obs[i]; if (Math.abs(o.x - x) > 70) continue;
      if (o.h && y > o.y - 30) y = o.y - 40;
      else if (!o.h && Math.abs(o.y - y) < 40) y = o.y + (y < o.y ? -50 : 50);
    }
    return clamp(y, CEIL + 24, FLOOR - 24);
  }
  function spawnCups() {
    var n = Math.random() < 0.3 ? 3 + Math.floor(Math.random() * 3) : 1, y0 = rnd(CEIL + 50, FLOOR - 60), arc = Math.random() < 0.5;
    for (var i = 0; i < n; i++) {
      var x = WW + 30 + i * 34, y = n > 1 && arc ? y0 - Math.sin(i / (n - 1) * Math.PI) * 50 : y0;
      G.cups.push({ x: x, y: safeY(y, x), ph: rnd(0, 6) });
    }
  }
  function spawnBonus() { G.cups.push({ x: WW + 30, y: rnd(CEIL + 70, FLOOR - 90), bonus: true, ph: 0 }); }
  function rushRow() {
    var y0 = clamp(G.y, CEIL + 50, FLOOR - 50);
    for (var i = 0; i < 12; i++) G.cups.push({ x: WW + 20 + i * 38, y: y0 + Math.sin(i * 0.6) * 46, ph: i });
  }

  // ---------- input ----------
  function flap() {
    if (state === "over") return;
    if (state === "paused") { resume(); return; }
    if (state === "ready") { state = "play"; track("nightshift/play"); }
    if (state !== "play") return;
    G.vy = G.flap; G.flapT = 0.18; SFX.flap();
  }
  cv.addEventListener("pointerdown", function (e) { e.preventDefault(); flap(); });
  document.addEventListener("keydown", function (e) {
    if ($("ns-game").hidden) return;
    var k = e.key;
    if (k === " " || k === "Spacebar" || k === "ArrowUp" || k === "w" || k === "W") {
      if (e.target && /^(BUTTON|A|INPUT|TEXTAREA)$/.test(e.target.tagName) && state !== "play" && state !== "ready") { if (state !== "over") return; }
      e.preventDefault();
      if (state === "over") { if (G && performance.now() - G.endAt > 600) startGame(); return; }
      flap();
    } else if (k === "p" || k === "P" || k === "Escape") {
      if (state === "play") pause(); else if (state === "paused") resume();
    }
  });
  document.addEventListener("visibilitychange", function () { if (document.hidden && state === "play") pause(); });
  window.addEventListener("blur", function () { if (state === "play") pause(); });
  $("ns-pause").onclick = function () { if (state === "play") pause(); else if (state === "paused") resume(); };
  $("ns-mute").onclick = function () { soundOn = !soundOn; lset(SKEY, soundOn ? 1 : 0); setMuteBtn(); if (soundOn) blip(880, 0.08, "sine", 0.04); };
  window.addEventListener("resize", function () { if (!$("ns-game").hidden) { size(); if (state !== "play") draw(); } });

  function pause() { state = "paused"; $("ns-pause").innerHTML = "&#9654;"; $("ns-pause").setAttribute("aria-label", "Resume"); draw(); }
  function resume() { state = "play"; $("ns-pause").innerHTML = "&#10074;&#10074;"; $("ns-pause").setAttribute("aria-label", "Pause"); last = 0; loop(); }

  // ---------- update ----------
  function hit() {
    if (G.inv > 0 || G.rush > 0) return;
    G.lives--; G.inv = 1.6; G.shake = G.calm ? 0 : 0.3; SFX.hit();
    for (var i = 0; i < (G.calm ? 0 : 8); i++) G.fx.push({ x: G.px, y: G.y, vx: rnd(-120, 120), vy: rnd(-160, 60), life: 0.6, star: 1 });
    if (G.lives <= 0) end(false);
  }
  function update(dt) {
    G.t += dt;
    var v = speed(), dx = v * dt;
    G.dist += dx;
    G.vy = Math.min(G.vy + G.g * dt, G.calm ? 360 : 430);
    G.y += G.vy * dt;
    G.rot += (clamp(G.vy / 700, -0.35, 0.55) - G.rot) * Math.min(1, dt * 10);
    G.flapT = Math.max(0, G.flapT - dt); G.inv = Math.max(0, G.inv - dt); G.shake = Math.max(0, G.shake - dt);
    G.banner = Math.max(0, G.banner - dt);
    if (G.rush > 0) G.rush = Math.max(0, G.rush - dt);
    if (G.y < CEIL + 18) { G.y = CEIL + 18; if (G.vy < 0) G.vy = 0; }
    if (G.y > FLOOR - 16) { hit(); G.y = FLOOR - 16; G.vy = G.flap * 1.05; if (state !== "play") return; }

    // spawn by distance travelled
    var p = prog();
    G.nextObs -= dx;
    if (G.nextObs <= 0 && G.t < G.len - 1.5) { if (!G.rush) spawnObs(); G.nextObs = (G.calm ? rnd(240, 320) - 60 * p : rnd(210, 290) - 90 * p); }
    G.nextCup -= dx;
    if (G.nextCup <= 0) { spawnCups(); G.nextCup = rnd(150, 260); }
    if (G.t > G.nextBonus) { spawnBonus(); G.nextBonus += G.calm ? 26 : 22; }

    var hx = G.px, hy = G.y + 3, hr = 15;
    for (var i = G.obs.length - 1; i >= 0; i--) {
      var o = G.obs[i];
      o.x -= dx + (o.extra || 0) * dt;
      if (o.r) { o.ph += dt * (o.k === "phone" || o.k === "clock" ? 3 : 6); o.y = o.y0 + Math.sin(o.ph) * o.amp; }
      if (o.x < -60) { G.obs.splice(i, 1); continue; }
      if (o.r) { var ddx = o.x - hx, ddy = o.y - hy; if (ddx * ddx + ddy * ddy < (o.r + hr - 3) * (o.r + hr - 3)) hit(); }
      else {
        var cx = clamp(hx, o.x - o.w / 2, o.x + o.w / 2), cy = clamp(hy, o.y, FLOOR);
        if ((cx - hx) * (cx - hx) + (cy - hy) * (cy - hy) < (hr - 2) * (hr - 2)) hit();
      }
      if (state !== "play") return;
    }
    for (var j = G.cups.length - 1; j >= 0; j--) {
      var c = G.cups[j]; c.x -= dx; c.ph += dt * 4;
      if (c.x < -40) { G.cups.splice(j, 1); continue; }
      var ex = c.x - hx, ey = c.y - hy;
      if (ex * ex + ey * ey < (hr + 14) * (hr + 14)) {
        G.cups.splice(j, 1);
        if (c.bonus) { G.rush = 6; G.banner = 1.8; G.obs.length = 0; rushRow(); SFX.bonus(); }
        else { var add = G.rush > 0 ? 2 : 1; G.coffee += add; G.fx.push({ x: c.x, y: c.y, vx: 0, vy: -50, life: 0.7, txt: "+" + add }); SFX.coffee(); }
      }
    }
    for (var k = G.fx.length - 1; k >= 0; k--) {
      var f = G.fx[k]; f.life -= dt; if (f.life <= 0) { G.fx.splice(k, 1); continue; }
      f.x += (f.vx - (f.txt ? 0 : v * 0.3)) * dt; f.y += f.vy * dt; if (!f.txt) f.vy += 400 * dt;
    }
    if (G.t >= G.len) end(true);
  }

  // ---------- drawing ----------
  var bgGrad = null, lightSpr = null;
  function lightSprite() {
    var c = document.createElement("canvas"); c.width = 160; c.height = 220; var x = c.getContext("2d");
    var g = x.createRadialGradient(80, 0, 4, 80, 0, 200); g.addColorStop(0, "rgba(255,236,170,.30)"); g.addColorStop(1, "rgba(255,236,170,0)");
    x.fillStyle = g; x.beginPath(); x.moveTo(60, 0); x.lineTo(100, 0); x.lineTo(160, 220); x.lineTo(0, 220); x.closePath(); x.fill();
    return c;
  }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function mix(a, b, t) { return "rgb(" + [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * t); }).join(",") + ")"; }

  function drawBg(p) {
    if (!bgGrad) { bgGrad = ctx.createLinearGradient(0, 0, 0, WH); bgGrad.addColorStop(0, "#3A2870"); bgGrad.addColorStop(0.55, "#2E1F57"); bgGrad.addColorStop(1, "#22174A"); }
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, WW, WH);
    var d = G ? G.dist : 0, dawn = clamp((p - 0.7) / 0.3, 0, 1);
    // windows (parallax)
    var sp = 260, off = (d * 0.45) % sp;
    var skyTop = mix([20, 14, 48], [120, 92, 170], dawn), skyBot = mix([46, 31, 87], [255, 170, 120], dawn);
    for (var x = -off; x < WW + sp; x += sp) {
      var wx = x + 40, wy = 70, ww = 120, wh = 110;
      var sg = ctx.createLinearGradient(0, wy, 0, wy + wh); sg.addColorStop(0, skyTop); sg.addColorStop(1, skyBot);
      ctx.fillStyle = "#1C1238"; rr(wx - 6, wy - 6, ww + 12, wh + 12, 10); ctx.fill();
      ctx.fillStyle = sg; rr(wx, wy, ww, wh, 6); ctx.fill();
      var idx = Math.round((x + off + d * 0.45) / sp);
      ctx.fillStyle = "rgba(255,255,255," + (0.7 * (1 - dawn)) + ")";
      for (var s = 0; s < 5; s++) { var sx = wx + ((idx * 37 + s * 53) % ww), sy = wy + ((idx * 23 + s * 31) % (wh - 30)) + 6; ctx.fillRect(sx, sy, 1.6, 1.6); }
      if (idx % 3 === 0) { ctx.fillStyle = dawn > 0.5 ? "rgba(255,240,200,.5)" : "#FFE08A"; ctx.beginPath(); ctx.arc(wx + 84, wy + 30, 13, 0, 6.283); ctx.fill(); ctx.fillStyle = skyTop; ctx.beginPath(); ctx.arc(wx + 90, wy + 26, 11, 0, 6.283); ctx.fill(); }
      // city silhouette
      ctx.fillStyle = "rgba(20,12,40,.75)";
      for (var b = 0; b < 5; b++) { var bh = 18 + ((idx * 13 + b * 29) % 34); ctx.fillRect(wx + b * 24, wy + wh - bh, 20, bh); }
      ctx.strokeStyle = "#1C1238"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.stroke();
      // wall sign between windows
      if (idx % 2 === 0) {
        var label = T.signs[((idx / 2) % T.signs.length + T.signs.length) % T.signs.length];
        ctx.font = "600 11px Poppins, system-ui, sans-serif"; var tw = ctx.measureText(label).width;
        ctx.fillStyle = "#5FBFB3"; rr(wx + ww + 70 - tw / 2 - 8, 200, tw + 16, 22, 6); ctx.fill();
        ctx.fillStyle = "#14303A"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, wx + ww + 70, 211.5);
      }
    }
    // dado rail
    ctx.fillStyle = "rgba(255,255,255,.06)"; ctx.fillRect(0, 258, WW, 5);
    // ceiling + lights
    ctx.fillStyle = "#1E1440"; ctx.fillRect(0, 0, WW, CEIL);
    var lsp = 200, loff = d % lsp;
    if (!lightSpr) lightSpr = lightSprite();
    for (var lx = -loff; lx < WW + lsp; lx += lsp) {
      ctx.drawImage(lightSpr, lx - 80 + 40, CEIL, 160, 220);
      ctx.fillStyle = "#FFF3C4"; rr(lx + 14, CEIL - 6, 52, 8, 4); ctx.fill();
    }
    // floor
    ctx.fillStyle = "#4A3480"; ctx.fillRect(0, FLOOR, WW, WH - FLOOR);
    ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.fillRect(0, FLOOR, WW, 3);
    ctx.strokeStyle = "rgba(255,255,255,.07)"; ctx.lineWidth = 2;
    var tsp = 48, toff = d % tsp; ctx.beginPath();
    for (var tx = -toff; tx < WW + tsp; tx += tsp) { ctx.moveTo(tx, FLOOR + 3); ctx.lineTo(tx - 22, WH); }
    ctx.stroke();
  }

  function drawCup(x, y, sc) {
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    ctx.fillStyle = "#FAF7F2"; ctx.beginPath(); ctx.moveTo(-9, -8); ctx.lineTo(9, -8); ctx.lineTo(7, 11); ctx.lineTo(-7, 11); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#B5793F"; ctx.fillRect(-8.4, -1, 16.8, 6);
    ctx.fillStyle = "#3B2A5C"; rr(-11, -12, 22, 5, 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1.6; ctx.lineCap = "round"; ctx.beginPath();
    ctx.moveTo(-3, -15); ctx.quadraticCurveTo(-6, -19, -3, -23); ctx.moveTo(3, -15); ctx.quadraticCurveTo(6, -19, 3, -23); ctx.stroke();
    ctx.restore();
  }
  function drawBonus(x, y, t) {
    var pul = 1 + Math.sin(t * 6) * 0.08;
    ctx.save(); ctx.translate(x, y); ctx.scale(pul, pul);
    ctx.fillStyle = "rgba(90,170,255,.25)"; ctx.beginPath(); ctx.arc(0, 0, 24, 0, 6.283); ctx.fill();
    ctx.fillStyle = N ? "#FFC93C" : "#2F7DE1"; ctx.beginPath(); ctx.arc(0, 0, 17, 0, 6.283); ctx.fill();
    ctx.fillStyle = "#fff";
    if (N) { ctx.beginPath(); ctx.moveTo(3, -12); ctx.lineTo(-7, 2); ctx.lineTo(-1, 2); ctx.lineTo(-3, 12); ctx.lineTo(7, -2); ctx.lineTo(1, -2); ctx.closePath(); ctx.fill(); }
    else { ctx.fillRect(-3.5, -10, 7, 20); ctx.fillRect(-10, -3.5, 20, 7); }
    ctx.restore();
  }
  function drawObs(o, t) {
    ctx.save();
    if (o.k === "pole") {
      var cx = o.x, top = o.y;
      ctx.fillStyle = "#C9C1DB"; ctx.fillRect(cx - 2.5, top, 5, FLOOR - top);
      ctx.fillRect(cx - 14, top, 28, 3);
      ctx.fillStyle = "rgba(220,240,255,.85)"; rr(cx - 11, top + 4, 22, 28, 6); ctx.fill();
      ctx.fillStyle = "#7FD1E8"; rr(cx - 9, top + 16, 18, 14, 4); ctx.fill();
      ctx.strokeStyle = "rgba(220,240,255,.7)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, top + 32); ctx.quadraticCurveTo(cx + 12, top + 60, cx + 4, top + 90); ctx.stroke();
      ctx.fillStyle = "#8D80B5"; ctx.fillRect(cx - 14, FLOOR - 4, 28, 4);
      ctx.fillStyle = "#2B2340"; ctx.beginPath(); ctx.arc(cx - 12, FLOOR - 1, 3, 0, 6.283); ctx.arc(cx + 12, FLOOR - 1, 3, 0, 6.283); ctx.fill();
    } else if (o.k === "lamp") {
      var lx2 = o.x, lt = o.y;
      ctx.fillStyle = "rgba(255,224,138,.18)"; ctx.beginPath(); ctx.moveTo(lx2 - 16, lt + 26); ctx.lineTo(lx2 + 16, lt + 26); ctx.lineTo(lx2 + 34, lt + 90); ctx.lineTo(lx2 - 34, lt + 90); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#C9C1DB"; ctx.fillRect(lx2 - 2.5, lt + 20, 5, FLOOR - lt - 20);
      ctx.fillStyle = "#FF8FAE"; ctx.beginPath(); ctx.moveTo(lx2 - 9, lt); ctx.lineTo(lx2 + 9, lt); ctx.lineTo(lx2 + 16, lt + 26); ctx.lineTo(lx2 - 16, lt + 26); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#8D80B5"; rr(lx2 - 13, FLOOR - 6, 26, 6, 3); ctx.fill();
    } else {
      ctx.translate(o.x, o.y);
      if (o.k === "pager") {
        ctx.rotate(Math.sin(o.ph * 1.5) * 0.25);
        ctx.fillStyle = "#1B1530"; rr(-17, -12, 34, 24, 6); ctx.fill();
        var on = Math.floor(t * 6) % 2;
        ctx.fillStyle = on ? "#9BF2A0" : "#5FBF7A"; rr(-12, -7, 18, 10, 2); ctx.fill();
        ctx.fillStyle = "#FF6B6B"; ctx.beginPath(); ctx.arc(11, -2, 3, 0, 6.283); ctx.fill();
        ctx.fillStyle = "#14301A"; ctx.font = "700 7px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("BLEEP", -3, -1.5);
        ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(22, -8); ctx.lineTo(27, -11); ctx.moveTo(23, 0); ctx.lineTo(29, 0); ctx.moveTo(22, 8); ctx.lineTo(27, 11); ctx.stroke();
      } else if (o.k === "phone") {
        ctx.rotate(Math.sin(t * 30) * 0.12);
        ctx.fillStyle = "#E2556B"; rr(-16, -4, 32, 16, 5); ctx.fill();
        ctx.fillStyle = "#B83A50"; rr(-19, -13, 38, 9, 4.5); ctx.fill();
        ctx.fillStyle = "#FAF7F2"; ctx.beginPath(); ctx.arc(0, 4, 4.5, 0, 6.283); ctx.fill();
        ctx.strokeStyle = "rgba(255,224,138,.8)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, 24, -2.6, -1.9); ctx.moveTo(0, 0); ctx.arc(0, 0, 24, -1.25, -0.55); ctx.stroke();
      } else if (o.k === "clock") {
        ctx.rotate(Math.sin(t * 28) * 0.12);
        ctx.fillStyle = "#FFC93C"; ctx.beginPath(); ctx.arc(-10, -13, 6, 0, 6.283); ctx.arc(10, -13, 6, 0, 6.283); ctx.fill();
        ctx.fillStyle = "#E2556B"; ctx.beginPath(); ctx.arc(0, 0, 15, 0, 6.283); ctx.fill();
        ctx.fillStyle = "#FAF7F2"; ctx.beginPath(); ctx.arc(0, 0, 11, 0, 6.283); ctx.fill();
        ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -7); ctx.moveTo(0, 0); ctx.lineTo(5, 2); ctx.stroke();
        ctx.strokeStyle = "#2B2340"; ctx.beginPath(); ctx.moveTo(-8, 13); ctx.lineTo(-11, 17); ctx.moveTo(8, 13); ctx.lineTo(11, 17); ctx.stroke();
      } else if (o.k === "ball") {
        ctx.rotate(o.ph * 0.8);
        ctx.fillStyle = "#A0522D"; ctx.beginPath(); ctx.ellipse(0, 0, 18, 12, 0, 0, 6.283); ctx.fill();
        ctx.strokeStyle = "#FAF7F2"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(7, 0);
        for (var q = -5; q <= 5; q += 3.3) { ctx.moveTo(q, -2.5); ctx.lineTo(q, 2.5); }
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  function drawBat() {
    var sz = 66, bob = state === "ready" ? Math.sin(performance.now() / 300) * 5 : 0;
    ctx.save(); ctx.translate(G.px, G.y + bob); ctx.rotate(G.rot);
    var fl = G.flapT > 0 ? Math.sin((0.18 - G.flapT) / 0.18 * Math.PI) : 0;
    ctx.scale(1 + fl * 0.12, 1 - fl * 0.1);
    if (G.inv > 0 && Math.floor(G.inv * 10) % 2 === 0) ctx.globalAlpha = 0.35;
    if (G.rush > 0) { ctx.fillStyle = N ? "rgba(255,201,60,.3)" : "rgba(90,170,255,.32)"; ctx.beginPath(); ctx.arc(0, 2, 30 + Math.sin(G.t * 12) * 3, 0, 6.283); ctx.fill(); }
    if (batOK) ctx.drawImage(bat, -sz / 2, -sz / 2 - 2, sz, sz);
    else { ctx.fillStyle = "#4B5DB5"; ctx.beginPath(); ctx.arc(0, 0, 16, 0, 6.283); ctx.fill(); }
    ctx.restore();
  }
  function centreText(txt, y, size, col) {
    ctx.font = "700 " + size + "px Lora, Georgia, serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineWidth = 5; ctx.strokeStyle = "rgba(20,13,40,.7)"; ctx.strokeText(txt, WW / 2, y);
    ctx.fillStyle = col || "#fff"; ctx.fillText(txt, WW / 2, y);
  }
  function draw() {
    if (!G) return;
    var p = prog(), t = G.t;
    ctx.setTransform(DPR * S, 0, 0, DPR * S, 0, 0);
    if (G.shake > 0) ctx.translate(rnd(-4, 4) * G.shake * 3, rnd(-4, 4) * G.shake * 3);
    drawBg(p);
    for (var j = 0; j < G.cups.length; j++) { var c = G.cups[j]; if (c.bonus) drawBonus(c.x, c.y, t); else drawCup(c.x, c.y + (G.calm ? 0 : Math.sin(c.ph) * 3), 1); }
    for (var i = 0; i < G.obs.length; i++) drawObs(G.obs[i], t);
    drawBat();
    for (var k = 0; k < G.fx.length; k++) {
      var f = G.fx[k]; ctx.globalAlpha = clamp(f.life / 0.5, 0, 1);
      if (f.txt) { ctx.font = "600 14px Poppins, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#FFE08A"; ctx.fillText(f.txt, f.x, f.y); }
      else { ctx.fillStyle = "#FFE08A"; ctx.fillRect(f.x - 2, f.y - 2, 4, 4); }
    }
    ctx.globalAlpha = 1;
    if (G.rush > 0) { ctx.fillStyle = N ? "rgba(255,201,60," + (0.08 + 0.05 * Math.sin(t * 8)) + ")" : "rgba(60,140,255," + (0.1 + 0.06 * Math.sin(t * 8)) + ")"; ctx.fillRect(0, 0, WW, WH); }
    if (G.banner > 0) { ctx.globalAlpha = clamp(G.banner, 0, 1); centreText(T.bonus, 70, 30, N ? "#FFE08A" : "#9CC8FF"); ctx.font = "500 12px Poppins, sans-serif"; ctx.fillStyle = "#fff"; ctx.fillText("Double coffee, no damage", WW / 2, 96); ctx.globalAlpha = 1; }
    if (state === "ready") { centreText("Tap to flap", WH * 0.3, 26); ctx.font = "500 12px Poppins, sans-serif"; ctx.fillStyle = "#E4DCF5"; ctx.fillText(matchMedia("(hover:hover)").matches ? "or press Space" : "keep Locum in the air", WW / 2, WH * 0.3 + 26); }
    if (state === "paused") { ctx.fillStyle = "rgba(20,13,40,.55)"; ctx.fillRect(0, 0, WW, WH); centreText("Paused", WH * 0.42, 30); ctx.font = "500 13px Poppins, sans-serif"; ctx.fillStyle = "#E4DCF5"; ctx.fillText("Tap to keep going", WW / 2, WH * 0.42 + 30); }
  }

  // ---------- HUD (DOM, only touched when values change) ----------
  function hud() {
    var m = Math.floor(minutes());
    if (m !== G.lastClock) { G.lastClock = m; $("ns-clock").textContent = clockStr(START + m); }
    if (G.coffee !== G.lastCof) { G.lastCof = G.coffee; $("ns-coffee").textContent = G.coffee; }
    if (G.lives !== G.lastLives) { G.lastLives = G.lives; var h = ""; for (var i = 0; i < 3; i++) h += '<span class="' + (i < G.lives ? "" : "off") + '">&#9829;</span>'; $("ns-lives").innerHTML = h; $("ns-lives").setAttribute("aria-label", G.lives + " lives left"); }
  }

  // ---------- loop ----------
  function loop() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function step(now) {
      if (state !== "play" && state !== "ready") { draw(); return; }
      var dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60; last = now;
      if (state === "play") update(dt);
      if (state === "over") return;
      draw(); hud();
      raf = requestAnimationFrame(step);
    });
  }

  // ---------- end / share ----------
  var shareText = "";
  function end(win) {
    if (G.ended) return; G.ended = true; state = "over"; G.endAt = performance.now();
    if (win) G.t = G.len;
    hud(); draw();
    var m = Math.floor(minutes()), tStr = clockStr(START + m), res = { m: m, c: G.coffee };
    var prev = lget(KEY), pb = better(res, prev);
    if (pb) lset(KEY, res);
    $("ns-otitle").textContent = win ? T.winT : pick(["Handover.", "Lights out.", "Shift over.", "Zzz."]);
    $("ns-omsg").textContent = win ? T.win : pick(T.over).replace("{t}", tStr).replace("{c}", G.coffee + " coffee" + (G.coffee === 1 ? "" : "s"));
    $("ns-otime").textContent = win ? "7:00 am" : tStr;
    $("ns-ocof").textContent = G.coffee;
    var ob = $("ns-obest");
    ob.className = "ns-obest" + (pb && prev ? " pb" : "");
    ob.textContent = pb && prev ? "New personal best!" : prev ? "Best: " + clockStr(START + prev.m) + " with " + prev.c + " coffee" + (prev.c === 1 ? "" : "s") : "First shift done. That’s your score to beat.";
    shareText = (win ? "I survived the whole Night Shift (11pm to 7am)" : "I survived Night Shift until " + clockStr(START + m, true)) + " with " + G.coffee + " coffee" + (G.coffee === 1 ? "" : "s") + " ☕🦇\nFind the secret game at maladywise.com";
    $("ns-over").hidden = false;
    SFX.over();
    track(win ? "nightshift/win" : "nightshift/over");
    setTimeout(function () { try { $("ns-again").focus({ preventScroll: true }); } catch (e) {} }, 50);
    showBest();
  }
  function toast(msg) {
    var t = $("ns-toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toast.k); toast.k = setTimeout(function () { t.hidden = true; }, 2200);
  }
  $("ns-sharebtn").onclick = function () {
    if (navigator.share) { navigator.share({ text: shareText }).catch(function () {}); return; }
    var done = function () { toast("Copied. Now go and brag."); };
    try {
      navigator.clipboard.writeText(shareText).then(done, function () { fallbackCopy(); done(); });
    } catch (e) { fallbackCopy(); done(); }
  };
  function fallbackCopy() {
    var ta = document.createElement("textarea"); ta.value = shareText; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove();
  }

  // ---------- start ----------
  function startGame() {
    $("ns-over").hidden = true;
    newGame(); state = "ready"; last = 0;
    $("ns-pause").innerHTML = "&#10074;&#10074;";
    hud(); loop();
  }
  $("ns-again").onclick = startGame;
  $("ns-play").onclick = function () {
    $("ns-intro").hidden = true; $("ns-game").hidden = false;
    size(); startGame();
    try { $("ns-stage").scrollIntoView({ block: "nearest" }); } catch (e) {}
    try { cv.focus({ preventScroll: true }); } catch (e) {}
  };
  track("nightshift/found");
  window.MW_nightshift = { state: function () { return state; }, game: function () { return G; } }; // for tests
})();
