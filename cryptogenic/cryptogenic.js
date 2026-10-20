/* Cryptogenic: weekly medical cryptic crossword, new every Saturday (Sydney time). 13x13, all answers medical.
   puzzles.json: [{date (a Saturday), number, rows[13] ('#' = block), across/down:[{n,r,c,len,clue,enum,expl}]}] */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "4";
  var root = document.getElementById("cry");
  if (!document.querySelector("link[data-cry]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "cryptogenic.css?v=" + BUILD; l.setAttribute("data-cry", ""); document.head.appendChild(l);
  }
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="cry-eyebrow">Cryptogenic</span><span class="badge">Saturdays</span></div>' +
    ' <div class="bar"><span class="timer" id="cry-timer">0:00</span><span class="tools"><button class="btn sm" type="button" data-a="checkw">Check word</button><button class="btn sm" type="button" data-a="revl">Reveal letter</button><button class="btn sm" type="button" data-a="more">More ⋯</button></span></div>' +
    ' <div class="main"><div class="gcol"><div class="grid" id="cry-grid" role="grid" aria-label="Cryptic crossword grid"></div>' +
    '  <div class="dock" id="cry-dock"><div class="cluebar"><button type="button" class="arr" data-a="prev" aria-label="Previous clue">‹</button><div class="ctext" id="cry-ctext"></div><button type="button" class="arr" data-a="next" aria-label="Next clue">›</button></div>' +
    '  <div class="msg" id="cry-msg" aria-live="polite"></div><div class="kb" id="cry-kb"></div></div></div>' +
    '  <div class="clues" id="cry-clues"></div></div>' +
    ' <div class="result" id="cry-result" hidden></div>' +
    ' <p class="note" id="cry-next"></p>' +
    ' <details class="archive" id="cry-archive"><summary>Past puzzles</summary><div class="alist" id="cry-alist"></div></details>' +
    ' <p class="note">New to cryptics? Every clue has a straight definition at one end, plus wordplay that builds the same answer. Solve a clue, then tap it to see how it works.</p>' +
    "</div>";
  var $ = function (id) { return document.getElementById("cry-" + id); };
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(t) { return Math.floor(t / 60) + ":" + ("0" + (t % 60)).slice(-2); }

  var P, N, KEY, ALL = [], REAL, week, st, stats, sel = { r: 0, c: 0, d: "a" }, E = [], timer;
  function blk(r, c) { return r < 0 || c < 0 || r >= N || c >= N || P.rows[r][c] === "#"; }
  function cellsOf(e) { var o = []; for (var i = 0; i < e.len; i++) o.push(e.d === "a" ? [e.r, e.c + i] : [e.r + i, e.c]); return o; }
  function entryAt(r, c, d) { return E.filter(function (e) { return e.d === d && cellsOf(e).some(function (x) { return x[0] === r && x[1] === c; }); })[0]; }
  function cur() { return entryAt(sel.r, sel.c, sel.d) || entryAt(sel.r, sel.c, sel.d === "a" ? "d" : "a"); }
  function wordOk(e) { return cellsOf(e).every(function (x) { return st.g[x[0]][x[1]] === P.rows[x[0]][x[1]]; }); }
  function wordFull(e) { return cellsOf(e).every(function (x) { return st.g[x[0]][x[1]]; }); }
  function allOk() { return E.every(wordOk); }

  function save() { put(KEY, st); }
  function say(m) { $("msg").textContent = m || ""; }

  function render() {
    var e = cur(), on = {}; if (e) cellsOf(e).forEach(function (x) { on[x[0] + "," + x[1]] = 1; });
    var nums = {}; E.forEach(function (x) { nums[x.r + "," + x.c] = x.n; });
    var h = "";
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
      if (blk(r, c)) { h += '<div class="cell b"></div>'; continue; }
      var k = r + "," + c, cls = "cell" + (on[k] ? " hl" : "") + (r === sel.r && c === sel.c ? " cur" : "") + (st.bad[k] ? " bad" : "") + (st.shown[k] ? " shown" : "") + (st.done ? " won" : "");
      h += '<div class="' + cls + '" data-r="' + r + '" data-c="' + c + '" role="gridcell">' + (nums[k] ? "<i>" + nums[k] + "</i>" : "") + "<b>" + (st.g[r][c] || "") + "</b></div>";
    }
    $("grid").innerHTML = h;
    $("ctext").innerHTML = e ? "<b>" + e.n + (e.d === "a" ? "A" : "D") + "</b> " + esc(e.clue) + ' <span class="en">' + e.enum + "</span>" : "";
    var cl = ["a", "d"].map(function (d) {
      return "<div><h4>" + (d === "a" ? "Across" : "Down") + "</h4><ol>" + E.filter(function (x) { return x.d === d; }).map(function (x) {
        var ok = wordOk(x), solved = ok && wordFull(x), active = e === x;
        return '<li class="' + (active ? "on " : "") + (solved ? "solved" : "") + '" data-e="' + E.indexOf(x) + '"><span class="no">' + x.n + "</span><span>" + esc(x.clue) + ' <span class="en">' + x.enum + "</span>" +
          (solved ? '<em class="ex">' + (st.open[E.indexOf(x)] || st.done ? esc(x.expl) : "Tap to see how it works") + "</em>" : "") + "</span></li>";
      }).join("") + "</ol></div>";
    }).join("");
    $("clues").innerHTML = cl;
    $("dock").hidden = !!st.done;
  }
  function keyboard() {
    var rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm-"];
    $("kb").innerHTML = rows.map(function (r) {
      return '<div class="kr">' + r.split("").map(function (k) { return k === "-" ? '<button type="button" class="key wide" data-k="Backspace" aria-label="Delete">⌫</button>' : '<button type="button" class="key" data-k="' + k + '">' + k + "</button>"; }).join("") + "</div>";
    }).join("");
  }
  function step(dir) {
    var e = cur(); if (!e) return; var cs = cellsOf(e), i = cs.findIndex(function (x) { return x[0] === sel.r && x[1] === sel.c; });
    var j = Math.max(0, Math.min(cs.length - 1, i + dir)); sel.r = cs[j][0]; sel.c = cs[j][1];
  }
  function jump(dir) {
    var e = cur(), i = E.indexOf(e), n = E[(i + dir + E.length) % E.length]; sel = { r: n.r, c: n.c, d: n.d };
    var cs = cellsOf(n), empty = cs.filter(function (x) { return !st.g[x[0]][x[1]]; })[0]; if (empty) { sel.r = empty[0]; sel.c = empty[1]; }
  }
  function type(k) {
    if (st.done) return;
    var key = sel.r + "," + sel.c;
    if (k === "Backspace") {
      if (!st.g[sel.r][sel.c]) step(-1);
      st.g[sel.r][sel.c] = ""; delete st.bad[sel.r + "," + sel.c];
    } else if (/^[a-z]$/i.test(k)) {
      st.g[sel.r][sel.c] = k.toUpperCase(); delete st.bad[key];
      var e = cur(), cs = cellsOf(e), i = cs.findIndex(function (x) { return x[0] === sel.r && x[1] === sel.c; });
      if (i === cs.length - 1) { if (wordFull(e)) { if (wordOk(e)) say("✓ " + e.n + (e.d === "a" ? "A" : "D")); jump(1); } } else step(1);
    } else return;
    save(); check(); render();
  }
  function check() {
    if (!st.done && allOk()) {
      st.done = true; st.win = st.hints < 4; clearInterval(timer); save();
      if (week === REAL && stats.last !== week) {
        var consecutive = stats.last && dayNum(week) - dayNum(stats.last) === 7;
        stats.played++; if (st.win) stats.wins++; stats.streak = consecutive ? stats.streak + 1 : 1; stats.best = Math.max(stats.best, stats.streak);
        stats.dist[!st.hints ? 0 : st.hints < 4 ? 1 : st.hints < 10 ? 2 : 3]++; stats.last = week; put("cry-stats", stats);
      }
      var hints = st.hints, verdict = !hints ? (st.t < 900 ? "Unaided, under 15 minutes. Frankly alarming." : "Unaided. Proper cryptic solver.") : hints < 4 ? "Done, with a nudge or two. Still counts." : "Finished. The hints did some heavy lifting.";
      var share = "Cryptogenic #" + P.number + (week === REAL ? "" : " (archive)") + " 🧩\n⏱ " + fmt(st.t) + (hints ? " · " + hints + " hint" + (hints > 1 ? "s" : "") : " · unaided") + "\nmaladywise.com";
      $("result").hidden = false;
      $("result").innerHTML = '<p class="cbig">' + fmt(st.t) + '</p><p class="verdict">' + esc(verdict) + '</p><pre id="cry-share">' + esc(share) + '</pre><div class="btns"><button class="btn solid" type="button" id="cry-copy">Copy result</button><button class="btn" type="button" data-a="print">Print</button></div><p class="note">Every clue now shows how it works. Scroll the clue list.</p>';
      $("copy").onclick = function () { var b = this; try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }); } catch (x) {} };
      say("Solved. Take a bow, doctor.");
    }
  }
  function revealCell(r, c) { if (st.g[r][c] !== P.rows[r][c]) { st.g[r][c] = P.rows[r][c]; st.shown[r + "," + c] = 1; } delete st.bad[r + "," + c]; }
  function act(a) {
    var e = cur();
    if (a === "prev" || a === "next") { jump(a === "next" ? 1 : -1); render(); return; }
    if (a === "print") { window.print(); return; }
    if (st.done && a !== "clear") return;
    if (a === "checkw" || a === "checka") {
      var list = a === "checkw" ? [e] : E, bad = 0;
      list.forEach(function (x) { cellsOf(x).forEach(function (q) { var v = st.g[q[0]][q[1]]; if (v && v !== P.rows[q[0]][q[1]]) { st.bad[q[0] + "," + q[1]] = 1; bad++; } }); });
      st.hints++; say(bad ? bad + " wrong letter" + (bad > 1 ? "s" : "") + ", flagged in red." : "Nothing wrong so far."); }
    if (a === "revl") { revealCell(sel.r, sel.c); st.hints++; say("Letter revealed."); }
    if (a === "revw") { cellsOf(e).forEach(function (q) { revealCell(q[0], q[1]); }); st.hints += 2; say("Word revealed. The working is in the clue list."); }
    if (a === "giveup") { E.forEach(function (x) { cellsOf(x).forEach(function (q) { revealCell(q[0], q[1]); }); }); st.hints += 20; say("All revealed. Read the working, then try the next one."); }
    if (a === "clear") { st = fresh(); say("Cleared. Fresh start."); $("result").hidden = true; startTimer(); }
    save(); check(); render();
  }
  function more() {
    var m = MW.modal("More options", '<div class="cry-more">' +
      [["checka", "Check whole grid"], ["revw", "Reveal current word"], ["giveup", "Reveal everything"], ["print", "Print the puzzle"], ["clear", "Clear and restart"]].map(function (x) { return '<button type="button" class="btn" data-a="' + x[0] + '">' + x[1] + "</button>"; }).join("") + "</div>");
    m.addEventListener("click", function (ev) { var b = ev.target.closest("[data-a]"); if (!b) return; var cl = m.querySelector(".x"); act(b.getAttribute("data-a")); if (cl) cl.click(); else m.remove(); });
  }
  function fresh() { var g = []; for (var r = 0; r < N; r++) { g.push([]); for (var c = 0; c < N; c++) g[r].push(""); } return { g: g, t: 0, hints: 0, bad: {}, shown: {}, open: {}, done: false }; }
  function startTimer() { clearInterval(timer); timer = setInterval(function () { if (document.hidden || st.done) return; st.t++; $("timer").textContent = fmt(st.t); if (st.t % 5 === 0) save(); }, 1000); $("timer").textContent = fmt(st.t); }

  root.addEventListener("click", function (ev) {
    var t = ev.target, c = t.closest(".cell:not(.b)"), k = t.closest("[data-k]"), a = t.closest("[data-a]"), li = t.closest("li[data-e]");
    if (c) { var r = +c.getAttribute("data-r"), cc = +c.getAttribute("data-c");
      if (r === sel.r && cc === sel.c) { var o = sel.d === "a" ? "d" : "a"; if (entryAt(r, cc, o)) sel.d = o; }
      else { sel.r = r; sel.c = cc; if (!entryAt(r, cc, sel.d)) sel.d = sel.d === "a" ? "d" : "a"; }
      render(); return; }
    if (k) { type(k.getAttribute("data-k")); return; }
    if (a) { var v = a.getAttribute("data-a"); if (v === "more") more(); else act(v); return; }
    if (li) { var x = E[+li.getAttribute("data-e")], i = E.indexOf(x);
      if (wordOk(x) && wordFull(x)) { st.open[i] = !st.open[i]; save(); }
      sel = { r: x.r, c: x.c, d: x.d }; render(); if (window.innerWidth < 900) $("grid").scrollIntoView({ behavior: "smooth", block: "start" }); }
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.metaKey || ev.ctrlKey || ev.altKey || !P || document.querySelector(".scrim")) return;
    var k = ev.key;
    if (/^[a-z]$/i.test(k) || k === "Backspace") { type(k); ev.preventDefault(); }
    else if (k === "Tab" || k === "Enter") { jump(ev.shiftKey ? -1 : 1); render(); ev.preventDefault(); }
    else if (k.indexOf("Arrow") === 0) {
      var d = { ArrowLeft: [0, -1, "a"], ArrowRight: [0, 1, "a"], ArrowUp: [-1, 0, "d"], ArrowDown: [1, 0, "d"] }[k];
      if (sel.d !== d[2] && entryAt(sel.r, sel.c, d[2])) sel.d = d[2];
      else { var r = sel.r + d[0], c = sel.c + d[1]; while (r >= 0 && r < N && c >= 0 && c < N && blk(r, c)) { r += d[0]; c += d[1]; } if (!blk(r, c)) { sel.r = r; sel.c = c; if (!entryAt(r, c, sel.d)) sel.d = sel.d === "a" ? "d" : "a"; } }
      render(); ev.preventDefault(); }
  });

  function sydToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function iso(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
  function sat(d) { var n = dayNum(d), wd = new Date(n * 864e5).getUTCDay(); return iso(n - (wd + 1) % 7); }
  function nice(d) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }); }
  function nextNote() {
    var n = dayNum(sydToday()), wd = new Date(n * 864e5).getUTCDay(), days = (6 - wd + 7) % 7 || 7;
    $("next").textContent = days === 1 ? "New cryptic tonight at midnight. Saturday, Sydney time." : "New cryptic in " + days + " days. Every Saturday, midnight Sydney time.";
  }
  function show(d) {
    week = d; KEY = "cry-day-" + week; E = [];
    P = ALL.filter(function (x) { return x.date === week; })[0];
    if (!P) { $("grid").innerHTML = ""; $("clues").innerHTML = '<p class="note">This week’s cryptic is still in theatre. Back soon.</p>'; $("dock").hidden = true; renderArchive(); return; }
    N = P.rows.length;
    P.across.forEach(function (x) { x.d = "a"; E.push(x); }); P.down.forEach(function (x) { x.d = "d"; E.push(x); });
    st = load(KEY, null); if (!st || !st.g || st.g.length !== N) st = fresh();
    sel = { r: E[0].r, c: E[0].c, d: "a" }; $("result").hidden = true; say("");
    $("eyebrow").textContent = (week === REAL ? "Cryptogenic" : "Archive") + " · #" + P.number + " · " + nice(week);
    render(); startTimer(); if (st.done) { st.done = false; check(); }
    renderArchive();
  }
  function renderArchive() {
    var past = ALL.filter(function (x) { return dayNum(x.date) <= dayNum(REAL) && x.date !== week; }).sort(function (a, b) { return dayNum(b.date) - dayNum(a.date); });
    var rows = past.map(function (x) { var s2 = load("cry-day-" + x.date, null); return '<button type="button" class="arow" data-w="' + x.date + '"><span>' + nice(x.date) + (s2 && s2.done ? " ✓" : "") + "</span><span>#" + x.number + "</span></button>"; }).join("");
    var back = week === REAL ? "" : '<button type="button" class="btn" id="cry-back">Back to this week</button>';
    $("alist").innerHTML = back + (rows || '<p class="note">No past cryptics yet. This is #1.</p>');
    Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-w")); root.scrollIntoView({ behavior: "smooth" }); }; });
    if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };
  REAL = sat(sydToday());
  var qd = new URLSearchParams(location.search).get("date");
  stats = load("cry-stats", { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0] });
  keyboard(); nextNote();
  fetch(BASE + "puzzles.json?v=" + BUILD, { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (list) {
    ALL = list;
    var live = ALL.filter(function (x) { return dayNum(x.date) <= dayNum(REAL); });
    if (!live.length && ALL.length) { REAL = ALL.slice().sort(function (a, b) { return dayNum(a.date) - dayNum(b.date); })[0].date; }
    show(qd && /^\d{4}-\d{2}-\d{2}$/.test(qd) ? sat(qd) : REAL);
  });
})();
