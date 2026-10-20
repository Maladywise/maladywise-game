/* Mergeon: drop organs, match two of a kind, they merge into the next organ up.
   Daily run: everyone gets the same drop order each day (Sydney time). Practice runs after.
   Physics by Matter.js (MIT), vendored as matter.min.js. */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "1";
  var root = document.getElementById("mrg");
  if (!document.querySelector("link[data-mrg]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "mergeon.css?v=" + BUILD; l.setAttribute("data-mrg", ""); document.head.appendChild(l);
  }
  var W = 400, H = 580, LINE = 96, DROP_Y = 46, WALL = 40, FIRST = "2026-10-19", WIN_LV = 9;
  var O = [
    { e: "🦠", n: "Microbe", r: 16, c: "#E4DCF3" },
    { e: "🩸", n: "Blood drop", r: 22, c: "#F7CDD3" },
    { e: "🦷", n: "Tooth", r: 29, c: "#EFE8D6" },
    { e: "👁️", n: "Eye", r: 36, c: "#CFE5F1" },
    { e: "👂", n: "Ear", r: 44, c: "#F7DCC8" },
    { e: "👅", n: "Tongue", r: 53, c: "#F5BFC6" },
    { e: "👃", n: "Nose", r: 62, c: "#F2D6BD" },
    { e: "🦴", n: "Bone", r: 72, c: "#ECE5D3" },
    { e: "🫀", n: "Heart", r: 84, c: "#EBA0A8" },
    { e: "🫁", n: "Lungs", r: 97, c: "#F3BBC0" },
    { e: "🧠", n: "Brain", r: 112, c: "#CDBBEA" }
  ];
  var SASS = {"5": ["Tongue. Say aah.", "Tongue. Quite the mouthful.", "Tongue. Bit cheeky."], "6": ["Nose. Getting nosy now.", "Nose. You\u2019ve sniffed out a combo.", "Nose. Right under your nose."], "7": ["Bone. Structurally sound.", "Bone. Humerus, isn\u2019t it?", "Bone. Holding it all together."], "8": ["Heart! Pumped for you.", "Heart! You\u2019ve got the beat.", "Heart! Cardio-logical."], "9": ["Lungs! Genuinely breathtaking.", "Lungs! Take a deep breath.", "Lungs! Inspired."], "10": ["Brain! Finally, someone using one.", "Brain! Big thoughts.", "Brain! Think like a doctor, indeed."]};
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var POPS = ["Two brains, one big thought. Gone. +100", "Brain merger. Mind blown. +100", "Two brains cancelled out. Typical committee. +100"];
  var DIST = ["🧠", "🫁", "🫀", "🦴", "Less"];

  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="mrg-eyebrow">Mergeon</span><span class="badge" id="mrg-badge"></span></div>' +
    ' <div class="mbar"><div><span class="lab">Score</span><b id="mrg-score">0</b></div><div><span class="lab">Top organ</span><b id="mrg-top">–</b></div><div class="nx"><span class="lab">Next</span><b id="mrg-next">–</b></div></div>' +
    ' <div class="board" id="mrg-board"><canvas id="mrg-cv" aria-label="Mergeon board. Move to aim, tap or press space to drop."></canvas><div class="toast" id="mrg-toast" hidden></div><div class="over" id="mrg-over" hidden></div></div>' +
    ' <div class="chain" id="mrg-chain"></div>' +
    ' <p class="note" id="mrg-mode"></p>' +
    ' <div class="result" id="mrg-result" hidden></div>' +
    ' <p class="note" id="mrg-nextday"></p>' +
    ' <details class="archive" id="mrg-archive"><summary>Past puzzles</summary><div class="alist" id="mrg-alist"></div></details>' +
    "</div>";
  var $ = function (id) { return document.getElementById("mrg-" + id); };
  $("chain").innerHTML = O.map(function (o, i) { return '<span title="' + o.n + '" style="--c:' + o.c + '">' + o.e + "</span>" + (i < O.length - 1 ? "<i>›</i>" : ""); }).join("");

  function sydToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function nice(d) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(n) { return n.toLocaleString("en-AU"); }
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  var REAL = sydToday(), qd = new URLSearchParams(location.search).get("date");
  var day = (qd && /^\d{4}-\d{2}-\d{2}$/.test(qd) && dayNum(qd) <= dayNum(REAL)) ? qd : REAL;
  function isLive() { return day === REAL; }
  function num(d) { return dayNum(d) - dayNum(FIRST) + 1; }
  var SKEY = "mrg-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, hi: 0, dist: [0, 0, 0, 0, 0] });
  var KEY, st;

  // ---------- physics ----------
  var M = window.Matter, E = M.Engine, B = M.Bodies, C = M.Composite, Ev = M.Events, Bd = M.Body;
  var engine, rnd, queue, cur, nxt, aimX = W / 2, canDrop, score, top, practice, over, toastT, merges, lastT, acc, raf;
  var cv = $("cv"), ctx = cv.getContext("2d"), dpr = 1, scale = 1;

  function roll() { var x = rnd(); return x < 0.3 ? 0 : x < 0.57 ? 1 : x < 0.77 ? 2 : x < 0.92 ? 3 : 4; }
  function newRun(isPractice) {
    practice = !!isPractice; over = false; score = 0; top = -1; merges = []; canDrop = true;
    rnd = mulberry32(isPractice ? (Math.random() * 4294967296) >>> 0 : dayNum(day) * 2654435761 >>> 0);
    engine = E.create(); engine.gravity.y = 1.15; engine.positionIterations = 8; engine.velocityIterations = 6;
    var opt = { isStatic: true, friction: 0.2, restitution: 0.1, label: "wall" };
    C.add(engine.world, [B.rectangle(W / 2, H + WALL / 2, W + WALL * 2, WALL, opt), B.rectangle(-WALL / 2, H / 2, WALL, H * 2, opt), B.rectangle(W + WALL / 2, H / 2, WALL, H * 2, opt)]);
    Ev.on(engine, "collisionStart", onHit); Ev.on(engine, "collisionActive", onHit);
    cur = roll(); nxt = roll();
    $("over").hidden = true; $("result").hidden = !(!practice && st.done); hud();
    $("mode").textContent = practice ? "Practice run. Doesn’t count. Nobody’s watching." : (isLive() ? "Today’s run. Same drop order for everyone. One shot counts." : "Archive run for " + nice(day) + ". Same drops as that day.");
    $("badge").textContent = practice ? "Practice" : ""; lastT = 0; acc = 0;
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function onHit(ev) {
    ev.pairs.forEach(function (p) {
      var a = p.bodyA, b = p.bodyB;
      if (a.lv === undefined || a.lv !== b.lv || a.gone || b.gone) return;
      a.gone = b.gone = true; merges.push([a, b]);
    });
  }
  function doMerges() {
    merges.forEach(function (m) {
      var a = m[0], b = m[1], lv = a.lv;
      C.remove(engine.world, a); C.remove(engine.world, b);
      if (lv === O.length - 1) { score += 100; toast(pick(POPS)); return; }
      var n = lv + 1, x = (a.position.x + b.position.x) / 2, y = (a.position.y + b.position.y) / 2;
      var o = add(n, x, y); Bd.setVelocity(o, { x: (a.velocity.x + b.velocity.x) / 2, y: Math.min(a.velocity.y, b.velocity.y, 0) - 1 });
      o.born = performance.now();
      score += (n + 1) * (n + 2) / 2;
      if (n > top) { top = n; if (SASS[n]) toast(pick(SASS[n])); }
    });
    if (merges.length) hud();
    merges = [];
  }
  function add(lv, x, y) {
    var o = B.circle(x, y, O[lv].r, { restitution: 0.12, friction: 0.08, frictionAir: 0.004, density: 0.0012 + lv * 0.0002, slop: 0.02 });
    o.lv = lv; o.overT = 0; C.add(engine.world, o); return o;
  }
  function drop() {
    if (!canDrop || over) return;
    var r = O[cur].r, x = Math.max(r + 1, Math.min(W - r - 1, aimX));
    var o = add(cur, x, DROP_Y); o.fresh = performance.now();
    if (cur > top) top = cur;
    cur = nxt; nxt = roll(); canDrop = false; hud();
    setTimeout(function () { canDrop = true; }, 550);
  }
  function checkOver(now) {
    var bodies = C.allBodies(engine.world), danger = false;
    for (var i = 0; i < bodies.length; i++) {
      var o = bodies[i]; if (o.lv === undefined || o.gone) continue;
      if (o.fresh && now - o.fresh < 1500) continue;
      if (o.position.y - O[o.lv].r < LINE) { danger = true; o.overT = o.overT || now; if (now - o.overT > 1800) { end(); return true; } }
      else o.overT = 0;
    }
    return danger;
  }
  function loop(t) {
    raf = requestAnimationFrame(loop);
    if (!engine) return;
    if (!lastT) lastT = t;
    var dt = Math.min(100, t - lastT); lastT = t;
    var danger = false;
    if (!over) {
      acc += dt;
      while (acc >= 1000 / 60) { E.update(engine, 1000 / 60); doMerges(); acc -= 1000 / 60; }
      danger = checkOver(performance.now());
    }
    draw(danger);
  }

  // ---------- drawing ----------
  function size() {
    var w = $("board").clientWidth || 360; scale = w / W; dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    cv.style.width = w + "px"; cv.style.height = Math.round(H * scale) + "px";
    cv.width = Math.round(w * dpr); cv.height = Math.round(H * scale * dpr);
  }
  var EMF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  function organ(lv, x, y, ang, alpha) {
    var o = O[lv];
    ctx.save(); ctx.globalAlpha = alpha || 1; ctx.translate(x, y); ctx.rotate(ang || 0);
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fillStyle = o.c; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = "rgba(74,52,128,.35)"; ctx.stroke();
    ctx.font = Math.round(o.r * 1.15) + "px " + EMF; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(o.e, 0, o.r * 0.06);
    ctx.restore();
  }
  function draw(danger) {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.fillStyle = dark ? "#211B2E" : "#FFFFFF"; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.setLineDash([8, 8]); ctx.lineWidth = 2;
    ctx.strokeStyle = danger ? "#D0573E" : (dark ? "rgba(180,168,207,.5)" : "rgba(107,90,147,.35)");
    ctx.beginPath(); ctx.moveTo(0, LINE); ctx.lineTo(W, LINE); ctx.stroke(); ctx.restore();
    if (!over && engine) {
      var r = O[cur].r, x = Math.max(r + 1, Math.min(W - r - 1, aimX));
      ctx.save(); ctx.strokeStyle = dark ? "rgba(180,168,207,.35)" : "rgba(107,90,147,.25)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, DROP_Y + r); ctx.lineTo(x, H); ctx.stroke(); ctx.restore();
      organ(cur, x, DROP_Y, 0, canDrop ? 1 : 0.35);
    }
    if (engine) C.allBodies(engine.world).forEach(function (o) {
      if (o.lv === undefined || o.gone) return;
      var s = 1; if (o.born) { var k = (performance.now() - o.born) / 160; if (k < 1) s = 0.7 + 0.3 * k; else o.born = 0; }
      if (s !== 1) { ctx.save(); ctx.translate(o.position.x, o.position.y); ctx.scale(s, s); organ(o.lv, 0, 0, o.angle); ctx.restore(); }
      else organ(o.lv, o.position.x, o.position.y, o.angle);
    });
  }
  function hud() {
    $("score").textContent = fmt(score);
    $("top").textContent = top >= 0 ? O[top].e + " " + O[top].n : "–";
    $("next").textContent = O[nxt].e;
  }
  function toast(m) {
    var t = $("toast"); t.textContent = m; t.hidden = false; t.classList.remove("on"); void t.offsetWidth; t.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2200);
  }

  // ---------- end of run ----------
  function verdict(tp) {
    return tp >= 10 ? "A whole brain. Think like a doctor? You are one." : tp >= 9 ? "Lungs. Breathtaking work. One more step to a brain." :
      tp >= 8 ? "Heart. Solid, reliable, slightly overworked. Like most GPs." : tp >= 7 ? "Bone. Good structure, no heart yet." :
      tp >= 5 ? "Mostly face parts. A cosmetic result." : "Microbes everywhere. Wash your hands and try again.";
  }
  function band(tp) { return tp >= 10 ? 0 : tp >= 9 ? 1 : tp >= 8 ? 2 : tp >= 7 ? 3 : 4; }
  function end() {
    over = true;
    var ov = $("over");
    ov.innerHTML = "<b>Game over</b><span>" + fmt(score) + " points · " + (top >= 0 ? O[top].e + " " + O[top].n : "") + "</span>";
    ov.hidden = false;
    if (!practice && !st.done) {
      st = { done: true, win: top >= WIN_LV - 1, score: score, top: top }; put(KEY, st);
      if (isLive() && stats.last !== day) {
        var consecutive = stats.last && dayNum(day) - dayNum(stats.last) === 1;
        stats.played++; if (st.win) stats.wins++;
        stats.streak = consecutive ? stats.streak + 1 : 1; stats.best = Math.max(stats.best, stats.streak);
        stats.dist[band(top)]++; stats.last = day;
      }
      stats.hi = Math.max(stats.hi || 0, score); put(SKEY, stats);
      renderResult(); renderArchive();
    } else if (practice) {
      if (score > (stats.hi || 0)) { stats.hi = score; put(SKEY, stats); }
      var r = $("result"); r.hidden = false;
      if (!st.done) renderResult();
      else renderResult(score);
    }
    setTimeout(function () { $("result").scrollIntoView({ behavior: "smooth", block: "start" }); }, 900);
  }
  function renderResult(practiceScore) {
    var r = $("result"), s = st.score, tp = st.top;
    var share = "Mergeon #" + num(day) + (isLive() ? "" : " (archive)") + " " + (tp >= 0 ? O[tp].e : "") + "\nScore " + fmt(s) + " · Top organ: " + (tp >= 0 ? O[tp].n : "none") + "\nmaladywise.com";
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0;
    r.hidden = false;
    r.innerHTML = (practiceScore !== undefined ? '<p class="prac">Practice: <b>' + fmt(practiceScore) + "</b> · " + (practiceScore > s ? "Better than your real run. Typical." : "Your daily run still stands.") + "</p>" : "") +
      '<p class="em-row">' + (tp >= 0 ? O[tp].e : "🦠") + '</p><p class="score">' + fmt(s) + '<span> pts</span></p><p class="verdict">' + esc(verdict(tp)) + "</p>" +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Heart %</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + fmt(stats.hi || 0) + "</b><span>High score</span></div></div>" +
      '<pre id="mrg-share">' + esc(share) + '</pre><div class="btns"><button class="btn solid" type="button" id="mrg-copy">Copy result</button><button class="btn" type="button" id="mrg-again">Practice run</button></div>';
    $("copy").onclick = function () {
      var b = this;
      function selx() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, selx); } catch (e) { selx(); }
    };
    $("again").onclick = function () { newRun(true); root.scrollIntoView({ behavior: "smooth" }); };
  }
  function tick() {
    function f() {
      try {
        var v = {}; new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(new Date()).forEach(function (x) { v[x.type] = +x.value; });
        var left = 86400 - ((v.hour % 24) * 3600 + v.minute * 60 + v.second);
        $("nextday").textContent = "New drop order in " + Math.floor(left / 3600) + "h " + Math.floor(left % 3600 / 60) + "m. Midnight, Sydney time.";
      } catch (e) { $("nextday").textContent = "New drop order every day at midnight, Sydney time."; }
    }
    f(); setInterval(f, 30000);
  }

  // ---------- input ----------
  function aim(e) { var b = cv.getBoundingClientRect(); aimX = (e.clientX - b.left) / scale; }
  var down = false;
  cv.addEventListener("pointerdown", function (e) { down = true; aim(e); try { cv.setPointerCapture(e.pointerId); } catch (x) {} });
  cv.addEventListener("pointermove", function (e) { aim(e); });
  cv.addEventListener("pointerup", function (e) { aim(e); if (down) drop(); down = false; });
  cv.addEventListener("pointercancel", function () { down = false; });
  document.addEventListener("keydown", function (e) {
    if (root.offsetParent === null || /input|textarea/i.test((e.target || {}).tagName || "")) return;
    if (e.key === "ArrowLeft") { aimX = Math.max(0, aimX - 14); e.preventDefault(); }
    else if (e.key === "ArrowRight") { aimX = Math.min(W, aimX + 14); e.preventDefault(); }
    else if (e.key === " " || e.key === "ArrowDown" || e.key === "Enter") { if (e.target === document.body || e.target === cv) { drop(); e.preventDefault(); } }
  });
  window.addEventListener("resize", size);

  // ---------- days ----------
  function show(d) {
    day = d; KEY = "mrg-day-" + day; st = load(KEY, { done: false });
    $("eyebrow").textContent = (isLive() ? "Mergeon" : "Archive") + " · #" + num(day) + " · " + nice(day);
    if (st.done) renderResult(); else $("result").hidden = true;
    newRun(st.done);
    renderArchive();
  }
  function renderArchive() {
    var days = [], n = dayNum(REAL), first = dayNum(FIRST);
    for (var k = n - 1; k >= first; k--) days.push(new Date(k * 864e5).toISOString().slice(0, 10));
    var rows = days.map(function (d) {
      var s = load("mrg-day-" + d, null), mark = s && s.done ? " ✓" : "";
      return '<button type="button" class="arow' + (d === day ? " on" : "") + '" data-d="' + d + '"><span>' + nice(d) + mark + "</span><span>#" + num(d) + "</span></button>";
    }).join("");
    var back = isLive() ? "" : '<button type="button" class="btn" id="mrg-back">Back to today</button>';
    $("alist").innerHTML = back + (rows || '<p class="note">No past runs yet. This is #1.</p>');
    Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); }; });
    if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };
  window.MW_mrg = { drop: drop, aim: function (x) { aimX = x; }, state: function () { return { score: score, top: top, over: over, n: engine ? C.allBodies(engine.world).length : 0 }; } };

  // The board sits inside a hidden section until Play is tapped, so size on first view.
  var vis = new MutationObserver(function () { if (root.offsetParent !== null) size(); });
  var sec = document.getElementById("game"); if (sec) vis.observe(sec, { attributes: true, attributeFilter: ["hidden"] });
  size(); tick(); show(day);
})();
