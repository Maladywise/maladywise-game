/* Triviosis: daily themed medical trivia. 10 questions, new set every day at midnight (Sydney time).
   Quizzes in quizzes.json: [{date: "YYYY-MM-DD", number, difficulty, theme, questions:[{q, a, w:[3 wrong], e}]}] */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "5", PASS = 6;
  var root = document.getElementById("trv");
  if (!document.querySelector("link[data-trv]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "triviosis.css?v=" + BUILD; l.setAttribute("data-trv", ""); document.head.appendChild(l);
  }
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="trv-eyebrow">Triviosis</span><span class="badge" id="trv-badge"></span></div>' +
    ' <div class="theme"><span>Today\u2019s theme</span><b id="trv-theme"></b></div>' +
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
  var REAL = sydToday(), q = new URLSearchParams(location.search).get("date");
  var week = (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) ? q : REAL;
  function isLive() { return week === REAL; }
  // dist buckets: 10, 8-9, 6-7, 4-5, 0-3
  var SKEY = "trv-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0, 0] });
  var KEY, st, Z = null, all = [];
  function loadWeek() { KEY = "trv-day-" + week; st = load(KEY, { ans: [], done: false, win: false }); }
  loadWeek();

  // ---------- sass ----------
  function pick(a) { if (a.length < 2) return a[0]; var k = "mw-last-" + a[0].slice(0, 12), last; try { last = sessionStorage.getItem(k); } catch (e) {} var x, n = 0; do { x = a[Math.floor(Math.random() * a.length)]; } while (x === last && ++n < 8); try { sessionStorage.setItem(k, x); } catch (e) {} return x; }
  var SASS = {
    right: ["Correct. Smug is allowed.", "Nailed it.", "Textbook.", "Consultant-level recall.", "Right. Don\u2019t let it go to your head.", "Correct. The examiner smiles.", "Spot on.", "Right. Annoyingly right.", "Yes. Gold star.", "Correct. Someone did the reading.", "Bang on.", "Right first time.", "Correct. Teaching registrar material.", "Yes. Clinical pearl secured.", "Correct. Quietly impressive.", "Right. Write that one down for the pub quiz.", "Exactly right.", "Correct. Your study notes thank you.", "Yes. Brain fully perfused.", "Correct. Carry on, doctor."],
    wrong: ["Nope. Read the explanation, then pretend you knew.", "Not quite. We\u2019ll call it a learning opportunity.", "Wrong, but confidently wrong.", "Missed. Even consultants Google things.", "No. But now you\u2019ll never forget it.", "Wrong. The explanation is right there.", "Not this time.", "Close. Ish. Not really.", "Incorrect. Plausible, though.", "No. File under \u2018things I knew yesterday\u2019.", "Wrong. Blame the night shift.", "Missed. Happens to everyone, apparently.", "Nope. Good guess, wrong answer.", "Not quite. Read on and redeem yourself.", "Wrong. The textbook would like a word.", "No. A reasonable mistake. Still a mistake.", "Incorrect. Next one\u2019s yours.", "Nope. Consider this free CPD.", "Wrong answer, right attitude."],
    end: function (s) {
      var E = {"10": ["10 out of 10. Unbearable. Frame it.", "Perfect score. Insufferable. Well done.", "10/10. Are you writing these?", "Flawless. Take the rest of the day off."], "8": ["Excellent. Registrar exam energy.", "Very strong. The college is impressed.", "Top marks, nearly. Smugness permitted.", "Great round. Knowledge: excellent."], "6": ["Solid pass. The college would approve.", "A comfortable pass. Respectable.", "Good effort. Above the line.", "Pass. Not flashy, but safe."], "4": ["Borderline. Revision recommended.", "Borderline. A few gaps on the ward round.", "Scraped through. Maybe.", "Middling. Coffee, then revision."], "0": ["Rough one. There\u2019s always tomorrow.", "Tough round. Tomorrow\u2019s a new quiz.", "Ouch. Read the explanations and try again tomorrow.", "Not your day. The explanations are worth a read."]};
      return pick(E[s === 10 ? 10 : s >= 8 ? 8 : s >= 6 ? 6 : s >= 4 ? 4 : 0]);
    }
  };

  // ---------- helpers ----------
  function seeded(a) { a = a >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // Answer spread evenly across A-D for each quiz, order shuffled per week
  var SLOTS = null;
  function slots() { var n = Z.questions.length, a = [], r = seeded(dayNum(Z.date) * 97 + 11); for (var k = 0; k < n; k++) a.push(k % 4); for (k = n - 1; k > 0; k--) { var j = Math.floor(r() * (k + 1)); var t = a[k]; a[k] = a[j]; a[j] = t; } return a; }
  function options(i) { var x = Z.questions[i], o = x.w.slice(), r = seeded(dayNum(Z.date) * 31 + i * 7 + 3); for (var k = o.length - 1; k > 0; k--) { var j = Math.floor(r() * (k + 1)); var t = o[k]; o[k] = o[j]; o[j] = t; } if (!SLOTS || SLOTS.w !== Z.date) { SLOTS = slots(); SLOTS.w = Z.date; } o.splice(Math.min(SLOTS[i], o.length), 0, x.a); return o; }
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
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Pass %</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + stats.best + "</b><span>Best</span></div></div>" +
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
    function f() {
      try {
        var now = new Date(), parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(now), v = {};
        parts.forEach(function (x) { v[x.type] = +x.value; });
        var left = 86400 - ((v.hour % 24) * 3600 + v.minute * 60 + v.second), h = Math.floor(left / 3600), m = Math.floor(left % 3600 / 60);
        $("next").textContent = "New quiz in " + h + "h " + m + "m. Midnight, Sydney time.";
      } catch (e) { $("next").textContent = "New quiz every day at midnight, Sydney time."; }
    }
    f(); setInterval(f, 30000);
  }

  // ---------- play ----------
  function finish() {
    st.done = true; var s = score(); st.win = s >= PASS; put(KEY, st);
    if (isLive() && stats.last !== week) {
      var consecutive = stats.last && dayNum(week) - dayNum(stats.last) === 1;
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
    week = w; loadWeek(); Z = all.filter(function (x) { return x.date === w; })[0] || null;
    if (!Z) { $("theme").textContent = "Still in the lab"; $("card").innerHTML = '<p class="note">Today\u2019s quiz is still being written. Back soon.</p>'; $("prog").innerHTML = ""; return; }
    $("theme").textContent = Z.theme;
    $("eyebrow").textContent = (isLive() ? "Triviosis" : "Archive") + " \u00b7 #" + Z.number + " \u00b7 " + nice(Z.date); $("badge").textContent = Z.difficulty || ""; $("badge").className = "badge" + (Z.difficulty === "Einstein" ? " ein" : "");
    render(); renderArchive();
  }
  function renderArchive() {
    var past = all.filter(function (x) { return x.date < REAL; }).reverse();
    var rows = past.map(function (x) {
      var s = load("trv-day-" + x.date, null), mark = s && s.done ? " \u2713" : "";
      return '<button type="button" class="arow' + (x.date === week ? " on" : "") + '" data-w="' + x.date + '"><span>#' + x.number + " \u00b7 " + esc(x.theme) + mark + "</span><span>" + nice(x.date) + "</span></button>";
    }).join("");
    var back = isLive() ? "" : '<button type="button" class="btn" id="trv-back">Back to today</button>';
    $("alist").innerHTML = back + (rows || '<p class="note">No past quizzes yet. This is #1.</p>');
    Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-w")); root.scrollIntoView({ behavior: "smooth" }); }; });
    if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };
  tick();
  fetch(BASE + "quizzes.json?v=" + BUILD, { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }).then(function (list) { all = list; show(week); });
})();
