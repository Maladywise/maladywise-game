/* Triviosis: weekly themed medical trivia. 10 questions, new set every Monday (Sydney time).
   Quizzes in quizzes.json: [{week: "YYYY-MM-DD" (a Monday), number, theme, questions:[{q, a, w:[3 wrong], e}]}] */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "2", PASS = 6;
  var root = document.getElementById("trv");
  if (!document.querySelector("link[data-trv]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "triviosis.css?v=" + BUILD; l.setAttribute("data-trv", ""); document.head.appendChild(l);
  }
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="trv-eyebrow">Triviosis</span><span class="badge">Weekly</span></div>' +
    ' <div class="theme"><span>This week\u2019s theme</span><b id="trv-theme"></b></div>' +
    ' <div class="prog" id="trv-prog"></div>' +
    ' <div class="qcard" id="trv-card"></div>' +
    ' <div class="result" id="trv-result" hidden></div>' +
    ' <p class="note" id="trv-next"></p>' +
    ' <details class="archive" id="trv-archive"><summary>Past quizzes</summary><div class="alist" id="trv-alist"></div></details>' +
    "</div>";
  var $ = function (id) { return document.getElementById("trv-" + id); };

  function sydToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function fromNum(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
  function monday(d) { var n = dayNum(d), dow = (new Date(n * 864e5).getUTCDay() + 6) % 7; return fromNum(n - dow); }
  function nice(d) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "UTC" }); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var REAL = monday(sydToday()), q = new URLSearchParams(location.search).get("date");
  var week = (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) ? monday(q) : REAL;
  function isLive() { return week === REAL; }
  // dist buckets: 10, 8-9, 6-7, 4-5, 0-3
  var SKEY = "trv-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0, 0] });
  var KEY, st, Z = null, all = [];
  function loadWeek() { KEY = "trv-week-" + week; st = load(KEY, { ans: [], done: false, win: false }); }
  loadWeek();

  // ---------- sass ----------
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var SASS = {
    right: ["Correct. Smug is allowed.", "Nailed it.", "Textbook.", "Consultant-level recall.", "Right. Don\u2019t let it go to your head."],
    wrong: ["Nope. Read the explanation, then pretend you knew.", "Not quite. We\u2019ll call it a learning opportunity.", "Wrong, but confidently wrong.", "Missed. Even consultants Google things."],
    end: function (s) {
      if (s === 10) return "10 out of 10. Unbearable. Frame it.";
      if (s >= 8) return "Excellent. Registrar exam energy.";
      if (s >= 6) return "Solid pass. The college would approve.";
      if (s >= 4) return "Borderline. Revision recommended.";
      return "Rough week. There\u2019s always next Monday.";
    }
  };

  // ---------- helpers ----------
  function seeded(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
  function options(i) { var x = Z.questions[i], o = [x.a].concat(x.w), r = seeded(dayNum(Z.week) * 31 + i * 7 + 3); for (var k = o.length - 1; k > 0; k--) { var j = Math.floor(r() * (k + 1)); var t = o[k]; o[k] = o[j]; o[j] = t; } return o; }
  function score() { return st.ans.filter(function (a, i) { return a === Z.questions[i].a; }).length; }

  // ---------- render ----------
  function render(msg) {
    if (!Z) return;
    var n = st.ans.length, total = Z.questions.length;
    $("prog").innerHTML = Z.questions.map(function (x, i) {
      var c = i < n ? (st.ans[i] === x.a ? "ok" : "no") : i === n && !st.done && !st.pending ? "cur" : "";
      return '<i class="' + c + '"></i>';
    }).join("") + '<span>' + (st.done ? score() + "/" + total : "Q" + Math.min(st.pending ? n : n + 1, total) + " of " + total) + "</span>";
    var card = $("card");
    if (st.done) { card.hidden = true; renderResult(); return; }
    card.hidden = false; $("result").hidden = true;
    var i = st.pending ? n - 1 : n, x = Z.questions[i], opts = options(i), chosen = st.pending ? st.ans[i] : null;
    card.innerHTML = '<p class="qn">Question ' + (i + 1) + '</p><h2 class="qt">' + esc(x.q) + '</h2><div class="opts">' +
      opts.map(function (o) {
        var cls = "opt";
        if (chosen !== null) { if (o === x.a) cls += " right"; else if (o === chosen) cls += " wrong"; else cls += " dim"; }
        return '<button type="button" class="' + cls + '" data-o="' + esc(o) + '"' + (chosen !== null ? " disabled" : "") + ">" + esc(o) + "</button>";
      }).join("") + "</div>" +
      (chosen !== null ? '<div class="explain"><b>' + esc(msg || (chosen === x.a ? "Correct." : "Not quite.")) + "</b> " + esc(x.e) + '</div><button type="button" class="next" id="trv-go">' + (i + 1 < total ? "Next question" : "See your score") + "</button>" : "");
    if ($("go")) $("go").onclick = function () { st.pending = false; if (st.ans.length >= total) finish(); put(KEY, st); render(); window.scrollTo({ top: root.getBoundingClientRect().top + scrollY - 70, behavior: "smooth" }); };
  }
  var ICON = "\ud83e\udde0";
  function renderResult() {
    var r = $("result"), s = score();
    var sq = Z.questions.map(function (x, i) { return st.ans[i] === x.a ? "\ud83d\udfe9" : "\ud83d\udfe5"; }).join("");
    var share = "Triviosis #" + Z.number + (isLive() ? "" : " (archive)") + " \u00b7 " + Z.theme + "\n" + sq + " " + s + "/10\nmaladywise.com";
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0;
    r.hidden = false;
    r.innerHTML = '<p class="score">' + s + '<span>/10</span></p><p class="verdict">' + esc(SASS.end(s)) + "</p>" +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Pass %</span></div><div><b>' + stats.streak + '</b><span>Week streak</span></div><div><b>' + stats.best + "</b><span>Best</span></div></div>" +
      '<pre id="trv-share">' + share + '</pre><button class="btn solid" type="button" id="trv-copy">Copy result</button>' +
      '<details class="review"><summary>Review answers</summary><ol>' + Z.questions.map(function (x, i) {
        var ok = st.ans[i] === x.a;
        return "<li><b>" + esc(x.q) + '</b><span class="' + (ok ? "ok" : "no") + '">' + (ok ? "\u2713 " : "\u2715 ") + esc(st.ans[i] || "") + "</span>" + (ok ? "" : '<span class="ok">Answer: ' + esc(x.a) + "</span>") + "<em>" + esc(x.e) + "</em></li>";
      }).join("") + "</ol></details>";
    $("copy").onclick = function () {
      var b = this;
      function selx() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, selx); } catch (e) { selx(); }
    };
  }
  function tick() {
    var t = "New quiz every Monday, midnight Sydney time.";
    try {
      var today = sydToday(), days = 7 - ((new Date(dayNum(today) * 864e5).getUTCDay() + 6) % 7);
      t = days === 1 ? "New quiz tonight at midnight. Revise accordingly." : "New quiz in " + days + " days. Monday, midnight Sydney time.";
    } catch (e) {}
    $("next").textContent = t;
  }

  // ---------- play ----------
  function finish() {
    st.done = true; var s = score(); st.win = s >= PASS; put(KEY, st);
    if (isLive() && stats.last !== week) {
      var consecutive = stats.last && dayNum(week) - dayNum(stats.last) === 7;
      stats.played++; if (st.win) stats.wins++;
      stats.streak = consecutive ? stats.streak + 1 : 1; stats.best = Math.max(stats.best, stats.streak);
      stats.dist[s === 10 ? 0 : s >= 8 ? 1 : s >= 6 ? 2 : s >= 4 ? 3 : 4]++; stats.last = week; put(SKEY, stats);
    }
  }
  $("card").addEventListener("click", function (e) {
    var b = e.target.closest(".opt"); if (!b || b.disabled || st.done || st.pending) return;
    var i = st.ans.length, x = Z.questions[i], o = b.getAttribute("data-o");
    st.ans.push(o); st.pending = true; put(KEY, st);
    render(o === x.a ? pick(SASS.right) : pick(SASS.wrong));
  });

  // ---------- load ----------
  function show(w) {
    week = w; loadWeek(); Z = all.filter(function (x) { return x.week === w; })[0] || null;
    if (!Z) { $("theme").textContent = "Still in the lab"; $("card").innerHTML = '<p class="note">This week\u2019s quiz is still being written. Back soon.</p>'; $("prog").innerHTML = ""; return; }
    $("theme").textContent = Z.theme;
    $("eyebrow").textContent = (isLive() ? "Triviosis" : "Archive") + " \u00b7 #" + Z.number + " \u00b7 Week of " + nice(Z.week);
    render(); renderArchive();
  }
  function renderArchive() {
    var past = all.filter(function (x) { return x.week < REAL; }).reverse();
    var rows = past.map(function (x) {
      var s = load("trv-week-" + x.week, null), mark = s && s.done ? " \u2713" : "";
      return '<button type="button" class="arow' + (x.week === week ? " on" : "") + '" data-w="' + x.week + '"><span>#' + x.number + " \u00b7 " + esc(x.theme) + mark + "</span><span>" + nice(x.week) + "</span></button>";
    }).join("");
    var back = isLive() ? "" : '<button type="button" class="btn" id="trv-back">Back to this week</button>';
    $("alist").innerHTML = back + (rows || '<p class="note">No past quizzes yet. This is #1.</p>');
    Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-w")); root.scrollIntoView({ behavior: "smooth" }); }; });
    if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };
  tick();
  fetch(BASE + "quizzes.json?v=" + BUILD, { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }).then(function (list) { all = list; show(week); });
})();
