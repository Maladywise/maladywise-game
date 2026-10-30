/* Grand Rounds: 20 hard general-knowledge questions, new every Sunday (Sydney time).
   No options: read the question, have a go, tap Show answer, mark yourselves.
   quizzes.json: [{week: "YYYY-MM-DD" (a Sunday), number, questions:[{c, q, a, e}]}] */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "5", PASS = 10;
  var root = document.getElementById("gdr");
  // Normie mode: "week that was" quiz from normie.json, stats under "n-" keys.
  var NORMIE = !!(window.MW_mode && MW_mode() === "normie"), PFX = NORMIE ? "n-" : "", FILE = NORMIE ? "normie.json" : "quizzes.json";
  if (!document.querySelector("link[data-gdr]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "grandrounds.css?v=" + BUILD; l.setAttribute("data-gdr", ""); document.head.appendChild(l);
  }
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="gdr-eyebrow">Grand Rounds</span><span class="badge">Sundays</span></div>' +
    ' <div class="prog" id="gdr-prog"></div>' +
    ' <div class="qcard" id="gdr-card"></div>' +
    ' <div class="result" id="gdr-result" hidden></div>' +
    ' <p class="note" id="gdr-next"></p>' +
    ' <details class="archive" id="gdr-archive"><summary>Past quizzes</summary><div class="alist" id="gdr-alist"></div></details>' +
    "</div>";
  var $ = function (id) { return document.getElementById("gdr-" + id); };

  function sydToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function fromNum(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
  function sunday(d) { var n = dayNum(d); return fromNum(n - new Date(n * 864e5).getUTCDay()); }
  function nice(d) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "UTC" }); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pick(a) { if (a.length < 2) return a[0]; var k = "mw-last-" + a[0].slice(0, 12), last; try { last = sessionStorage.getItem(k); } catch (e) {} var x, n = 0; do { x = a[Math.floor(Math.random() * a.length)]; } while (x === last && ++n < 8); try { sessionStorage.setItem(k, x); } catch (e) {} return x; }
  var REAL = sunday(sydToday()), qd = new URLSearchParams(location.search).get("date");
  var week = (qd && /^\d{4}-\d{2}-\d{2}$/.test(qd)) ? sunday(qd) : REAL;
  function isLive() { return week === REAL; }
  // dist buckets: 18-20, 14-17, 10-13, 5-9, 0-4 (player one / solo)
  var SKEY = PFX + "gdr-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0, 0] });
  var NKEY = "gdr-names", KEY, st, Z = null, all = [];
  function loadWeek() { KEY = PFX + "gdr-week-" + week; st = load(KEY, null); }
  loadWeek();

  var SASS = {
    end: function (s) {
      var E = {"20": ["20 out of 20. Insufferable. We\u2019re checking your pockets for a textbook.", "Perfect 20. Are you the examiner?", "20/20. Hindsight and foresight."], "16": ["Formidable. Consultant material.", "Superb. The college would like your notes.", "Outstanding round."], "12": ["Strong. Registrar energy.", "Solid. A good Sunday\u2019s work.", "Strong showing."], "8": ["Respectable. You\u2019d survive the ward round.", "Decent. Not bad for a weekend.", "Respectable. Coffee earned."], "4": ["Patchy. Revision recommended.", "Patchy. A few gaps to fill.", "Some gaps. It\u2019s Sunday, we\u2019ll allow it."], "0": ["Rough. Back to the textbooks. New quiz next Sunday.", "Tough one. Next Sunday\u2019s yours.", "Brutal quiz. Brutal score. Rematch next week."]};
      return pick(E[s === 20 ? 20 : s >= 16 ? 16 : s >= 12 ? 12 : s >= 8 ? 8 : s >= 4 ? 4 : 0]);
    },
    duo: function (a, b, na, nb) {
      if (a === b) return pick(["A dead heat. Rematch next Sunday.", "Tied. Nobody buys the coffee.", "Level. Honours even, egos intact."]);
      var w = a > b ? na : nb, l = a > b ? nb : na, d = Math.abs(a - b);
      return d >= 5 ? pick([w + " wins by a distance. " + l + " buys the coffee.", w + " cruises home. " + l + " is on dishes.", "Comfortable win for " + w + ". " + l + ", revision awaits."])
        : pick([w + " edges it. Expect to hear about this all week.", w + " wins by a whisker. Rematch demanded.", "Close one. " + w + " takes it. " + l + " wants a recount."]);
    }
  };

  function names() { return (st && st.names) || load(NKEY, ["You", "Opponent"]); }
  function tally(p) { return st.marks.reduce(function (t, m) { return t + (m[p] ? 1 : 0); }, 0); }

  // ---------- render ----------
  function render() {
    if (!Z) return;
    var total = Z.questions.length;
    if (!st) { renderSetup(); return; }
    var n = st.marks.length, nm = names(), duo = st.mode === "duo";
    $("prog").innerHTML = Z.questions.map(function (x, i) {
      var c = i < n ? (st.marks[i][0] || (duo && st.marks[i][1]) ? "ok" : "no") : i === n && !st.done ? "cur" : "";
      return '<i class="' + c + '"></i>';
    }).join("") + "<span>" + (st.done ? (duo ? tally(0) + " \u00b7 " + tally(1) : tally(0) + "/" + total) : "Q" + Math.min(n + 1, total) + " of " + total) + "</span>";
    var card = $("card");
    if (st.done) { card.hidden = true; renderResult(); return; }
    card.hidden = false; $("result").hidden = true;
    var i = n, x = Z.questions[i];
    var h = '<div class="qtop"><span class="qn">Question ' + (i + 1) + '</span><span class="cat">' + esc(x.c) + '</span></div><h2 class="qt">' + esc(x.q) + "</h2>";
    if (!st.shown) {
      h += '<p class="hint">' + (duo ? "Read it aloud. No peeking at the screen." : "Say your answer out loud. Commit to it.") + '</p><button type="button" class="next" id="gdr-show">Show answer</button>';
    } else {
      h += '<div class="ans"><span>Answer</span><b>' + esc(x.a) + "</b>" + (x.e ? "<em>" + esc(x.e) + "</em>" : "") + "</div>";
      if (duo) {
        var cur = st.cur || [0, 0];
        h += '<p class="hint">Who got it? Tap everyone who did.</p><div class="who">' +
          [0, 1].map(function (p) { return '<button type="button" class="tog' + (cur[p] ? " on" : "") + '" data-p="' + p + '">' + (cur[p] ? "\u2713 " : "") + esc(nm[p]) + "</button>"; }).join("") +
          '</div><button type="button" class="next" id="gdr-go">' + (i + 1 < total ? "Next question" : "See the scores") + "</button>";
      } else {
        h += '<div class="who"><button type="button" class="mark yes" data-m="1">Got it</button><button type="button" class="mark no" data-m="0">Missed</button></div>';
      }
    }
    card.innerHTML = h;
  }

  function renderSetup() {
    var nm = load(NKEY, ["You", "Opponent"]);
    $("prog").innerHTML = "";
    $("result").hidden = true; $("card").hidden = false;
    $("card").innerHTML = '<div class="qtop"><span class="qn">Before you start</span></div><h2 class="qt">Twenty questions. No options. Just you and what you remember.</h2>' +
      '<p class="hint">Play solo, or head to head: one reads aloud, the other answers. Then swap.</p>' +
      '<div class="modes"><button type="button" class="mode" data-mode="solo"><b>Just me</b><span>Mark yourself honestly</span></button><button type="button" class="mode" data-mode="duo"><b>Head to head</b><span>Keep score for two</span></button></div>' +
      '<div class="names" id="gdr-names" hidden><label>You<input id="gdr-n0" maxlength="14" value="' + esc(nm[0]) + '"></label><label>Opponent<input id="gdr-n1" maxlength="14" value="' + esc(nm[1]) + '"></label><button type="button" class="next" id="gdr-begin">Start</button></div>';
  }

  function renderResult() {
    var r = $("result"), nm = names(), duo = st.mode === "duo", a = tally(0), b = tally(1), total = Z.questions.length;
    var row = function (p) { var s = st.marks.map(function (m) { return m[p] ? "\ud83d\udfe9" : "\u2b1c"; }); return s.slice(0, 10).join("") + "\n" + s.slice(10).join(""); };
    var head = "Grand Rounds" + (NORMIE ? " (Normie)" : "") + " #" + Z.number + (isLive() ? "" : " (archive)");
    var share = duo
      ? head + "\n" + nm[0] + " " + a + "/" + total + " \u00b7 " + nm[1] + " " + b + "/" + total + "\nmaladywise.com"
      : head + "\n" + row(0) + "\n" + a + "/" + total + "\nmaladywise.com";
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0;
    r.hidden = false;
    r.innerHTML = (duo
      ? '<div class="duo"><div><span>' + esc(nm[0]) + '</span><p class="score">' + a + "<span>/" + total + '</span></p></div><div><span>' + esc(nm[1]) + '</span><p class="score">' + b + "<span>/" + total + "</span></p></div></div>" +
        '<p class="verdict">' + esc(SASS.duo(a, b, nm[0], nm[1])) + "</p>"
      : '<p class="score">' + a + "<span>/" + total + '</span></p><p class="verdict">' + esc(SASS.end(a)) + "</p>") +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>10+ %</span></div><div><b>' + stats.streak + '</b><span>Week streak</span></div><div><b>' + stats.best + "</b><span>Best</span></div></div>" +
      (duo ? '<p class="note">Stats count ' + esc(nm[0]) + "\u2019s score.</p>" : "") +
      '<pre id="gdr-share">' + esc(share) + '</pre><button class="btn solid" type="button" id="gdr-copy">Copy result</button>' +
      '<details class="review"><summary>All the answers</summary><ol>' + Z.questions.map(function (x, i) {
        var m = st.marks[i] || [0, 0];
        var tag = duo ? (m[0] ? "\u2713" : "\u2715") + " " + esc(nm[0]) + " \u00b7 " + (m[1] ? "\u2713" : "\u2715") + " " + esc(nm[1]) : m[0] ? "\u2713 Got it" : "\u2715 Missed";
        return "<li><b>" + esc(x.q) + '</b><span class="ok">' + esc(x.a) + '</span><span class="' + (m[0] || (duo && m[1]) ? "ok" : "no") + ' sm">' + tag + "</span>" + (x.e ? "<em>" + esc(x.e) + "</em>" : "") + "</li>";
      }).join("") + "</ol></details>" +
      '<button type="button" class="btn" id="gdr-again">Rematch with someone new</button>';
    $("copy").onclick = function () {
      var bt = this;
      function selx() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); bt.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { bt.textContent = "Copied"; }, selx); } catch (e) { selx(); }
    };
    $("again").onclick = function () { st = null; try { localStorage.removeItem(KEY); } catch (e) {} replay = true; render(); top(); };
  }
  var replay = false;
  function tick() {
    var t = "New quiz every Sunday, midnight Sydney time.";
    try {
      var dow = new Date(dayNum(sydToday()) * 864e5).getUTCDay(), days = 7 - dow;
      t = days === 1 ? "New quiz tonight at midnight. Set an alarm. Or don\u2019t." : "New quiz in " + days + " days. Sunday, midnight Sydney time.";
    } catch (e) {}
    $("next").textContent = t;
  }
  function top() { window.scrollTo({ top: root.getBoundingClientRect().top + scrollY - 70, behavior: "smooth" }); }

  // ---------- play ----------
  function finish() {
    st.done = true; var s = tally(0); st.win = s >= PASS; st.sa = s; st.sb = tally(1); put(KEY, st);
    if (isLive() && stats.last !== week && !replay) {
      var consecutive = stats.last && dayNum(week) - dayNum(stats.last) === 7;
      stats.played++; if (st.win) stats.wins++;
      stats.streak = consecutive ? stats.streak + 1 : 1; stats.best = Math.max(stats.best, stats.streak);
      stats.dist[s >= 18 ? 0 : s >= 14 ? 1 : s >= 10 ? 2 : s >= 5 ? 3 : 4]++; stats.last = week; put(SKEY, stats);
    }
  }
  function advance(m) {
    st.marks.push(m); st.shown = false; st.cur = [0, 0];
    if (st.marks.length >= Z.questions.length) finish();
    put(KEY, st); render(); top();
  }
  $("card").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.classList.contains("mode")) {
      var mode = b.getAttribute("data-mode");
      if (mode === "solo") { st = { mode: "solo", marks: [], shown: false, done: false }; put(KEY, st); render(); return; }
      $("names").hidden = false; Array.prototype.forEach.call($("card").querySelectorAll(".mode"), function (x) { x.classList.toggle("on", x === b); }); $("n0").focus(); return;
    }
    if (b.id === "gdr-begin") {
      var nm = [($("n0").value || "").trim() || "You", ($("n1").value || "").trim() || "Opponent"];
      put(NKEY, nm); st = { mode: "duo", names: nm, marks: [], shown: false, cur: [0, 0], done: false }; put(KEY, st); render(); return;
    }
    if (!st || st.done) return;
    if (b.id === "gdr-show") { st.shown = true; st.cur = [0, 0]; put(KEY, st); render(); return; }
    if (b.classList.contains("tog")) { var p = +b.getAttribute("data-p"); st.cur = st.cur || [0, 0]; st.cur[p] = st.cur[p] ? 0 : 1; put(KEY, st); render(); return; }
    if (b.id === "gdr-go") { advance([st.cur[0] || 0, st.cur[1] || 0]); return; }
    if (b.classList.contains("mark")) { advance([+b.getAttribute("data-m"), 0]); }
  });

  // ---------- load ----------
  function show(w) {
    week = w; loadWeek(); replay = false; Z = all.filter(function (x) { return x.week === w; })[0] || null;
    if (!Z) { $("eyebrow").textContent = "Grand Rounds"; $("card").hidden = false; if ($("result")) $("result").hidden = true; $("card").innerHTML = NORMIE && window.MW_noNormie ? MW_noNormie("quiz this week") : '<p class="note">This week\u2019s quiz is still being written. Back soon.</p>'; $("prog").innerHTML = ""; renderArchive(); return; }
    $("eyebrow").textContent = (isLive() ? "Grand Rounds" : "Archive") + " \u00b7 #" + Z.number + " \u00b7 " + nice(Z.week);
    (function () { var bd = root.querySelector(".head .badge"), ein = Z.difficulty === "Einstein"; if (bd) { bd.className = "badge" + (ein ? " Einstein" : ""); bd.innerHTML = ein ? '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/></svg>' + "Einstein" : "Sundays"; } root.classList.toggle("einstein", ein); })();
    render(); renderArchive();
  }
  function renderArchive() {
    var past = all.filter(function (x) { return x.week < REAL; }).reverse();
    var rows = past.map(function (x) {
      var s = load(PFX + "gdr-week-" + x.week, null), mark = s && s.done ? " \u2713" : "";
      return '<button type="button" class="arow' + (x.week === week ? " on" : "") + '" data-w="' + x.week + '"><span>#' + x.number + mark + "</span><span>" + nice(x.week) + "</span></button>";
    }).join("");
    var back = isLive() ? "" : '<button type="button" class="btn" id="gdr-back">Back to this week</button>';
    $("alist").innerHTML = back + (rows || '<p class="note">No past quizzes yet. This is #1.</p>');
    Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-w")); root.scrollIntoView({ behavior: "smooth" }); }; });
    if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };
  tick();
  fetch(BASE + FILE + "?v=" + BUILD, { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }).then(function (list) { all = list; show(week); });
})();
