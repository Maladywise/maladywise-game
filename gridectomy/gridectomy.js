/* Gridectomy: daily 5x5 mini crossword.
   Puzzles in puzzles/YYYY-MM.json: {date, number, difficulty, rows[5] ('#' = block), across/down:[{n,r,c,len,clue}]} */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "6";
  var root = document.getElementById("grx");
  if (!document.querySelector("link[data-grx]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "gridectomy.css?v=" + BUILD; l.setAttribute("data-grx", ""); document.head.appendChild(l);
  }
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="grx-eyebrow">Gridectomy</span><span class="badge" id="grx-badge" hidden></span></div>' +
    ' <div class="bar"><span class="timer" id="grx-timer">0:00</span><span class="tools" id="grx-tools"><button class="btn sm" type="button" id="grx-check">Check</button><button class="btn sm" type="button" id="grx-reveal">Reveal square</button><button class="btn sm" type="button" id="grx-giveup">Give up</button></span></div>' +
    ' <div class="grid" id="grx-grid" role="grid" aria-label="Crossword grid"></div>' +
    ' <div class="dock" id="grx-dock"><div class="cluebar" id="grx-cluebar"><button type="button" class="arr" id="grx-prev" aria-label="Previous clue">\u2039</button><div class="ctext" id="grx-ctext"></div><button type="button" class="arr" id="grx-nxt" aria-label="Next clue">\u203a</button></div>' +
    ' <div class="msg" id="grx-msg" aria-live="polite"></div>' +
    ' <div class="kb" id="grx-kb"></div></div>' +
    ' <div class="result" id="grx-result" hidden></div>' +
    ' <div class="clues" id="grx-clues"></div>' +
    ' <p class="note" id="grx-next"></p>' +
    ' <details class="archive" id="grx-archive"><summary>Past puzzles</summary><div class="alist" id="grx-alist"></div></details>' +
    "</div>";
  var $ = function (id) { return document.getElementById("grx-" + id); };

  function sydToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function nice(d) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(s) { s = Math.floor(s); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
  var REAL = sydToday(), q = new URLSearchParams(location.search).get("date");
  var today = (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) ? q : REAL;
  function isLive() { return today === REAL; }
  // dist buckets: <1m, <2m, <3m, <5m, <10m, 10m+, gave up / revealed
  var SKEY = "grx-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0, 0, 0, 0] });
  var KEY, st, P = null, sel = { r: 0, c: 0, dir: "a" }, ticking = null;
  function loadDay() { KEY = "grx-day-" + today; st = load(KEY, { g: null, t: 0, checks: 0, reveals: 0, done: false, win: false, bad: [] }); }
  loadDay();

  // ---------- sass ----------
  function pick(a) { if (a.length < 2) return a[0]; var k = "mw-last-" + a[0].slice(0, 12), last; try { last = sessionStorage.getItem(k); } catch (e) {} var x, n = 0; do { x = a[Math.floor(Math.random() * a.length)]; } while (x === last && ++n < 8); try { sessionStorage.setItem(k, x); } catch (e) {} return x; }
  var SASS = {
    full: ["Grid's full, but something's off. Like a normal-looking CXR with a missed nodule.", "Full, not right. Check your working.", "Close, but one of these is a misdiagnosis.", "Full grid, wrong somewhere. Hunt it down.", "Something\u2019s not right. Try Check.", "Full but faulty. One rogue letter, maybe more."],
    check0: ["All correct so far. Carry on.", "Nothing wrong yet. Suspicious.", "Clean so far.", "All good. Keep going.", "No errors. Smug-adjacent."],
    check1: ["Wrong ones flagged in red. No judgement. Some judgement.", "Red squares are wrong. Rethink them.", "Flagged in red. Fix and carry on.", "A few reds. Easily treated."],
    reveal: ["Revealed. That one won't count as a clean solve.", "Peeked. We saw that.", "Square revealed. No shame. Some shame.", "One square, on the house."],
    giveup: ["Grid revealed. Rematch tomorrow.", "Fair enough. Here are the answers.", "Answers out. Study them, return stronger.", "Surrendered. The grid wins today."],
    win: function (s) {
      var W = {"60": ["Under a minute. Who hurt you?", "Sub-minute. Are you a robot?", "Under a minute. Outrageous."], "120": ["Under two minutes. Show-off.", "Under two. Sharp.", "Fast. Very fast."], "180": ["Solid time. Consultant pace.", "Brisk. Nicely done.", "Good time. Efficient."], "300": ["Done. Unhurried, like a good history.", "Steady solve.", "Done. Calm and methodical."], "600": ["Got there. Slow and thorough.", "Thorough. Like a full examination.", "Done. No rush, no fuss."], "0": ["Solved. Eventually. Was the kettle on?", "Got there. Eventually. Still counts.", "Solved. Slowly, but solved."]};
      return pick(W[s < 60 ? 60 : s < 120 ? 120 : s < 180 ? 180 : s < 300 ? 300 : s < 600 ? 600 : 0]);
    }
  };
  function say(t) { $("msg").textContent = t; }

  // ---------- model ----------
  function blk(r, c) { return r < 0 || c < 0 || r > 4 || c > 4 || P.rows[r][c] === "#"; }
  function ans(r, c) { return P.rows[r][c]; }
  function entryAt(r, c, dir) {
    var list = dir === "a" ? P.across : P.down;
    for (var i = 0; i < list.length; i++) { var e = list[i];
      if (dir === "a" ? (e.r === r && c >= e.c && c < e.c + e.len) : (e.c === c && r >= e.r && r < e.r + e.len)) return e; }
    return null;
  }
  function cellsOf(e, dir) { var o = []; for (var i = 0; i < e.len; i++) o.push(dir === "a" ? [e.r, e.c + i] : [e.r + i, e.c]); return o; }
  function allEntries() { return P.across.map(function (e) { return [e, "a"]; }).concat(P.down.map(function (e) { return [e, "d"]; })); }
  function filled() { for (var r = 0; r < 5; r++) for (var c = 0; c < 5; c++) if (!blk(r, c) && !st.g[r][c]) return false; return true; }
  function correct() { for (var r = 0; r < 5; r++) for (var c = 0; c < 5; c++) if (!blk(r, c) && st.g[r][c] !== ans(r, c)) return false; return true; }
  function fixSel() { if (!entryAt(sel.r, sel.c, sel.dir)) sel.dir = sel.dir === "a" ? "d" : "a"; }

  // ---------- render ----------
  var ICON = { Easy: "\ud83d\udfe2", Medium: "\ud83d\udfe1", Hard: "\ud83d\udd34", Genius: "\ud83e\udde0", Einstein: "\u269b\ufe0f" };
  function render() {
    if (!P) return;
    var e = entryAt(sel.r, sel.c, sel.dir), inE = {}, nums = {}, h = "";
    if (e && !st.done) cellsOf(e, sel.dir).forEach(function (x) { inE[x[0] + "," + x[1]] = 1; });
    allEntries().forEach(function (x) { nums[x[0].r + "," + x[0].c] = x[0].n; });
    for (var r = 0; r < 5; r++) for (var c = 0; c < 5; c++) {
      if (blk(r, c)) { h += '<div class="cell blk"></div>'; continue; }
      var k = r + "," + c, cls = "cell";
      if (inE[k]) cls += " hl"; if (!st.done && r === sel.r && c === sel.c) cls += " cur";
      if (st.bad.indexOf(k) >= 0) cls += " bad"; if (st.done) cls += st.win ? " won" : " shown";
      h += '<div class="' + cls + '" data-r="' + r + '" data-c="' + c + '" role="gridcell">' + (nums[k] ? "<i>" + nums[k] + "</i>" : "") + "<b>" + esc(st.g[r][c] || "") + "</b></div>";
    }
    $("grid").innerHTML = h;
    $("ctext").innerHTML = e && !st.done ? "<b>" + e.n + (sel.dir === "a" ? "A" : "D") + "</b> " + esc(e.clue) : (st.done ? "Done. Clues below for the post-mortem." : "");
    var cl = ["a", "d"].map(function (d) {
      var list = d === "a" ? P.across : P.down;
      return '<div><h4>' + (d === "a" ? "Across" : "Down") + "</h4>" + list.map(function (x) {
        var on = e && x === e && !st.done; return '<button type="button" class="cl' + (on ? " on" : "") + '" data-d="' + d + '" data-n="' + x.n + '"><b>' + x.n + "</b><span>" + esc(x.clue) + "</span></button>";
      }).join("") + "</div>";
    }).join("");
    $("clues").innerHTML = cl;
    $("kb").hidden = st.done; $("cluebar").hidden = st.done; $("tools").hidden = st.done;
    $("timer").textContent = fmt(st.t);
    renderResult();
  }
  function renderResult() {
    var r = $("result");
    if (!st.done) { r.hidden = true; return; }
    var extra = st.win ? (st.checks ? " \u00b7 " + st.checks + " check" + (st.checks > 1 ? "s" : "") : " \u00b7 clean") : "";
    var share = "Gridectomy #" + P.number + (isLive() ? "" : " (archive)") + " \u00b7 " + P.difficulty + " " + ICON[P.difficulty] + "\n" + (st.win ? "\u23f1 " + fmt(st.t) + extra : "\ud83c\udff3\ufe0f Grid won today") + "\nmaladywise.com";
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0;
    r.hidden = false;
    r.innerHTML = '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Win %</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + stats.best + "</b><span>Best</span></div></div>" +
      '<pre id="grx-share">' + share + '</pre><button class="btn solid" type="button" id="grx-copy">Copy result</button>';
    $("copy").onclick = function () {
      var b = this;
      function selx() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, selx); } catch (e) { selx(); }
    };
  }
  function tick() {
    var t = "New grid at midnight, Sydney time.";
    try { var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
      var left = 1440 - (p[0] * 60 + p[1]); t = "Next grid in " + Math.floor(left / 60) + "h " + (left % 60) + "m. Go touch grass."; } catch (e) {}
    $("next").textContent = t;
  }
  function buildKb() {
    var rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm-"];
    $("kb").innerHTML = rows.map(function (r) {
      return '<div class="kr">' + r.split("").map(function (k) {
        if (k === "-") return '<button class="key wide" data-k="back" type="button" aria-label="Delete">\u232b</button>';
        return '<button class="key" data-k="' + k + '" type="button">' + k + "</button>";
      }).join("") + "</div>";
    }).join("");
  }

  // ---------- timer ----------
  function visible() { var g = document.getElementById("game"); return !(g && g.hidden) && !document.hidden; }
  function startClock() {
    if (ticking) clearInterval(ticking);
    ticking = setInterval(function () {
      if (!P || st.done || !visible()) return;
      st.t += 1; $("timer").textContent = fmt(st.t); if (st.t % 5 === 0) put(KEY, st);
    }, 1000);
  }

  // ---------- play ----------
  function finish(win) {
    var correct0 = correct(); st.done = true; st.win = win; st.bad = [];
    if (!win) for (var r = 0; r < 5; r++) for (var c = 0; c < 5; c++) if (!blk(r, c)) st.g[r][c] = ans(r, c);
    put(KEY, st);
    if (isLive() && stats.last !== today) {
      var yest = stats.last && dayNum(today) - dayNum(stats.last) === 1;
      stats.played++; if (win) stats.wins++;
      stats.streak = win ? (yest ? stats.streak + 1 : 1) : 0; stats.best = Math.max(stats.best, stats.streak);
      var b = !win ? 6 : st.t < 60 ? 0 : st.t < 120 ? 1 : st.t < 180 ? 2 : st.t < 300 ? 3 : st.t < 600 ? 4 : 5;
      stats.dist[b]++; stats.last = today; put(SKEY, stats);
    }
    if (P.difficulty === "Einstein") {
      say(win ? "\u269b\ufe0f Einstein solved in " + fmt(st.t) + ". A once-in-50-days grid. Screenshot this." : "Even Einstein needed a few goes. Respect for taking on the rare one.");
      if (win && isLive()) { var tro = load("mw-einstein", []); if (!tro.some(function (t) { return t.g === "gridectomy" && t.d === today; })) { tro.push({ g: "gridectomy", d: today }); put("mw-einstein", tro); } }
    } else say(win ? SASS.win(st.t) : st.reveals && correct0 ? "Finished, with a peek or two. Doesn't count as a clean solve." : pick(SASS.giveup));
  }
  function nextCell(back) {
    var e = entryAt(sel.r, sel.c, sel.dir); if (!e) return;
    var cs = cellsOf(e, sel.dir), i = 0;
    for (var k = 0; k < cs.length; k++) if (cs[k][0] === sel.r && cs[k][1] === sel.c) i = k;
    if (back) { if (i > 0) { sel.r = cs[i - 1][0]; sel.c = cs[i - 1][1]; } return; }
    for (var j = i + 1; j < cs.length; j++) if (!st.g[cs[j][0]][cs[j][1]]) { sel.r = cs[j][0]; sel.c = cs[j][1]; return; }
    jumpEntry(1, true);
  }
  function jumpEntry(step, toEmpty) {
    var all = allEntries(), e = entryAt(sel.r, sel.c, sel.dir), i = 0;
    for (var k = 0; k < all.length; k++) if (all[k][0] === e && all[k][1] === sel.dir) i = k;
    for (var t = 1; t <= all.length; t++) {
      var x = all[(i + step * t + all.length * 2) % all.length], cs = cellsOf(x[0], x[1]);
      var tgt = cs.filter(function (q) { return !st.g[q[0]][q[1]]; })[0];
      if (toEmpty && !tgt) continue;
      tgt = tgt || cs[0]; sel.r = tgt[0]; sel.c = tgt[1]; sel.dir = x[1]; return;
    }
  }
  function typeLetter(ch) {
    var k = sel.r + "," + sel.c, bi = st.bad.indexOf(k); if (bi >= 0) st.bad.splice(bi, 1);
    st.g[sel.r][sel.c] = ch.toUpperCase(); say("");
    if (filled()) {
      if (correct()) { finish(!st.reveals); render(); return; }
      say(pick(SASS.full));
    }
    nextCell(false); put(KEY, st); render();
  }
  function press(k) {
    if (!P || st.done) return;
    if (k === "back") {
      if (st.g[sel.r][sel.c]) st.g[sel.r][sel.c] = ""; else { nextCell(true); st.g[sel.r][sel.c] = ""; }
      put(KEY, st); render(); return;
    }
    if (/^[a-z]$/.test(k)) typeLetter(k);
  }
  $("grid").addEventListener("click", function (e) {
    var el = e.target.closest(".cell"); if (!el || el.classList.contains("blk") || st.done) return;
    var r = +el.getAttribute("data-r"), c = +el.getAttribute("data-c");
    if (r === sel.r && c === sel.c) sel.dir = sel.dir === "a" ? "d" : "a"; else { sel.r = r; sel.c = c; }
    fixSel(); render();
  });
  $("clues").addEventListener("click", function (e) {
    var b = e.target.closest(".cl"); if (!b || st.done) return;
    var d = b.getAttribute("data-d"), n = +b.getAttribute("data-n"), list = d === "a" ? P.across : P.down;
    var x = list.filter(function (q) { return q.n === n; })[0]; var cs = cellsOf(x, d);
    var t = cs.filter(function (q) { return !st.g[q[0]][q[1]]; })[0] || cs[0];
    sel.r = t[0]; sel.c = t[1]; sel.dir = d; render(); $("grid").scrollIntoView({ behavior: "smooth", block: "center" });
  });
  $("prev").onclick = function () { jumpEntry(-1, false); render(); };
  $("nxt").onclick = function () { jumpEntry(1, false); render(); };
  $("ctext").onclick = function () { sel.dir = sel.dir === "a" ? "d" : "a"; fixSel(); render(); };
  $("check").onclick = function () {
    if (st.done) return; st.checks++; st.bad = [];
    for (var r = 0; r < 5; r++) for (var c = 0; c < 5; c++) if (!blk(r, c) && st.g[r][c] && st.g[r][c] !== ans(r, c)) st.bad.push(r + "," + c);
    say(st.bad.length ? pick(SASS.check1) : pick(SASS.check0)); put(KEY, st); render();
  };
  $("reveal").onclick = function () {
    if (st.done) return; st.reveals++; st.g[sel.r][sel.c] = ans(sel.r, sel.c);
    var k = sel.r + "," + sel.c, bi = st.bad.indexOf(k); if (bi >= 0) st.bad.splice(bi, 1);
    say(pick(SASS.reveal));
    if (filled() && correct()) { finish(false); render(); return; }
    nextCell(false); put(KEY, st); render();
  };
  $("giveup").onclick = function () {
    var b = this; if (st.done) return;
    if (b.getAttribute("data-sure")) { finish(false); render(); return; }
    b.setAttribute("data-sure", "1"); b.textContent = "Sure? Tap again";
    setTimeout(function () { b.removeAttribute("data-sure"); b.textContent = "Give up"; }, 3000);
  };
  $("kb").addEventListener("click", function (e) { var b = e.target.closest(".key"); if (b) { press(b.getAttribute("data-k")); b.blur(); } });
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target && e.target.tagName; if (t === "INPUT" || t === "TEXTAREA") return;
    if (document.querySelector(".scrim")) return;
    if (!visible() || !P || st.done) return;
    var mv = { ArrowLeft: [0, -1, "a"], ArrowRight: [0, 1, "a"], ArrowUp: [-1, 0, "d"], ArrowDown: [1, 0, "d"] }[e.key];
    if (mv) {
      e.preventDefault();
      if (sel.dir !== mv[2] && entryAt(sel.r, sel.c, mv[2])) { sel.dir = mv[2]; render(); return; }
      var r = sel.r + mv[0], c = sel.c + mv[1];
      while (r >= 0 && r < 5 && c >= 0 && c < 5 && blk(r, c)) { r += mv[0]; c += mv[1]; }
      if (r >= 0 && r < 5 && c >= 0 && c < 5) { sel.r = r; sel.c = c; fixSel(); render(); }
      return;
    }
    if (e.key === "Tab" || e.key === "Enter") { e.preventDefault(); jumpEntry(e.shiftKey ? -1 : 1, false); render(); return; }
    if (e.key === " ") { e.preventDefault(); sel.dir = sel.dir === "a" ? "d" : "a"; fixSel(); render(); return; }
    if (e.key === "Backspace") { e.preventDefault(); press("back"); }
    else if (/^[a-zA-Z]$/.test(e.key)) press(e.key.toLowerCase());
  });

  // ---------- load ----------
  var cache = {};
  function month(m) {
    if (!cache[m]) cache[m] = fetch(BASE + "puzzles/" + m + ".json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    return cache[m];
  }
  function prevMonth(m) { var p = m.split("-").map(Number); p[1]--; if (!p[1]) { p[1] = 12; p[0]--; } return p[0] + "-" + ("0" + p[1]).slice(-2); }
  var ATOM = "<svg viewBox=\"0 0 24 24\" width=\"13\" height=\"13\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" aria-hidden=\"true\"><ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"4\"/><ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"4\" transform=\"rotate(60 12 12)\"/><ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"4\" transform=\"rotate(120 12 12)\"/><circle cx=\"12\" cy=\"12\" r=\"1.8\" fill=\"currentColor\"/></svg>";
  function show(date) {
    today = date; loadDay(); P = null; say("");
    return month(date.slice(0, 7)).then(function (list) {
      P = list.filter(function (x) { return x.date === date; })[0] || null;
      if (!P) { say("Today\u2019s grid is still in theatre. Back tomorrow."); $("kb").hidden = true; $("grid").innerHTML = ""; $("cluebar").hidden = true; $("tools").hidden = true; return; }
      if (!st.g) st.g = [0, 1, 2, 3, 4].map(function () { return ["", "", "", "", ""]; });
      var first = P.across[0]; sel = { r: first.r, c: first.c, dir: "a" };
      $("eyebrow").textContent = (isLive() ? "Gridectomy" : "Archive") + " \u00b7 #" + P.number + " \u00b7 " + nice(date);
      var b = $("badge"); b.hidden = false; b.className = "badge " + P.difficulty; b.innerHTML = (P.difficulty === "Einstein" ? ATOM : "") + P.difficulty; root.classList.toggle("einstein", P.difficulty === "Einstein");
      if (!isLive()) say(st.done ? "Archive grid. Already done." : "Archive grid. Doesn't count towards your streak.");
      else if (st.done) say(st.win ? "Solved in " + fmt(st.t) + ". Come back tomorrow." : "You've had your go. Back tomorrow.");
      render(); renderArchive(); startClock();
    });
  }
  function renderArchive() {
    var m = REAL.slice(0, 7);
    Promise.all([month(prevMonth(m)), month(m)]).then(function (ls) {
      var past = [].concat(ls[0], ls[1]).filter(function (x) { return x.date < REAL; }).reverse();
      var rows = past.map(function (x) {
        var s = load("grx-day-" + x.date, null), mark = !s || !s.done ? "" : s.win ? " \u2713" : " \u2715";
        return '<button type="button" class="arow' + (x.date === today ? " on" : "") + '" data-d="' + x.date + '"><span>#' + x.number + " \u00b7 " + nice(x.date) + mark + '</span><span class="badge ' + x.difficulty + '">' + x.difficulty + "</span></button>";
      }).join("");
      var back = isLive() ? "" : '<button type="button" class="btn" id="grx-back">Back to today</button>';
      $("alist").innerHTML = back + (rows || "<p class=\"note\">No past grids yet. Today is #1. You\u2019re early.</p>");
      Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); }; });
      if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
    });
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };
  buildKb(); tick(); setInterval(tick, 60000); show(today);
})();
