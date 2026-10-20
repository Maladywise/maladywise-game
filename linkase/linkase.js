/* Linkase: six-word chain, first and last shown. Each word pairs with the next.
   Guess the hidden words from either end. Wrong guess = one more letter shown, one strike.
   Puzzles in puzzles/YYYY-MM.json: {date, number, difficulty, chain[6], alt?{WORD:[...]}} */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "3", MAXM = 5;
  var root = document.getElementById("lnk");
  if (!document.querySelector("link[data-lnk]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "linkase.css?v=" + BUILD; l.setAttribute("data-lnk", ""); document.head.appendChild(l);
  }
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="lnk-eyebrow">Linkase</span><span class="badge" id="lnk-badge" hidden></span></div>' +
    ' <p class="intro">Each word pairs with the next. Work from the top or the bottom.</p>' +
    ' <div class="chain" id="lnk-chain"></div>' +
    ' <div class="msg" id="lnk-msg" aria-live="polite"></div>' +
    ' <div class="mist" id="lnk-mist"></div>' +
    ' <div class="kb" id="lnk-kb"></div>' +
    ' <div class="result" id="lnk-result" hidden></div>' +
    ' <p class="note" id="lnk-next"></p>' +
    ' <details class="archive" id="lnk-archive"><summary>Past puzzles</summary><div class="alist" id="lnk-alist"></div></details>' +
    "</div>";
  var $ = function (id) { return document.getElementById("lnk-" + id); };

  function sydToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function nice(d) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var REAL = sydToday(), q = new URLSearchParams(location.search).get("date");
  var today = (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) ? q : REAL;
  function isLive() { return today === REAL; }
  var SKEY = "lnk-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0, 0, 0] });
  var KEY, st, P = null, cur = "";
  // st.w[i] for i=1..4: {rev: letters shown, s: 0 open | 1 solved | 2 given}
  function loadDay() { KEY = "lnk-day-" + today; st = load(KEY, null); if (!st) st = { w: [null, { rev: 1, s: 0 }, { rev: 1, s: 0 }, { rev: 1, s: 0 }, { rev: 1, s: 0 }], mistakes: 0, act: 1, done: false, win: false }; }
  loadDay();

  // ---------- sass ----------
  function pick(a) { if (a.length < 2) return a[0]; var k = "mw-last-" + a[0].slice(0, 12), last; try { last = sessionStorage.getItem(k); } catch (e) {} var x, n = 0; do { x = a[Math.floor(Math.random() * a.length)]; } while (x === last && ++n < 8); try { sessionStorage.setItem(k, x); } catch (e) {} return x; }
  var SASS = {
    wrong: ["Nobody has ever said that phrase. Nobody.", "Bold link. Wrong, but bold.", "That chain just snapped.", "Creative. Also incorrect.", "Close your eyes and say it out loud. Yeah, no.", "Not a thing. Here's a letter for your trouble.", "That link doesn\u2019t hold weight.", "Not a phrase. Not even in a discharge summary.", "Wrong link. Here\u2019s a letter.", "Nope. Say both pairs out loud.", "Missing link. Try again.", "That\u2019s a loose connection.", "Plausible. Not it.", "Wrong word. The chain wobbles."],
    right: ["Linked.", "Clean join.", "Smooth.", "Textbook anastomosis.", "Click. Next.", "Connected.", "Secure.", "Nice link.", "That holds.", "Joined.", "Chain grows."],
    given: ["Fully spelled out for you. That one doesn't count.", "Gave it away. We all have off days.", "Revealed in full. No credit, no shame.", "Spelt out for you. Moving on."],
    len: function (n) { return "Needs " + n + " letters. Count them, Doctor."; },
    win: [["Flawless chain. Not one slip. Insufferable, frankly.", "Zero slips. Linked like a surgeon.", "Perfect chain. Unbreakable.", "No mistakes. Show-off."], ["One slip. Still a strong chain.", "One slip. Barely a wobble.", "One mistake, then smooth.", "Strong chain. One kink."], ["Two slips. Holding together.", "Two slips. Still solid.", "Two kinks. Chain intact.", "Two slips. Good recovery."], ["Three slips. Rusty links, but it held.", "Three slips. Creaky but intact.", "Three wobbles. It held.", "Three slips. Close call."], ["Four slips. Held together with tape.", "Four slips. Barely attached.", "Held together by hope.", "Four slips. Somehow it held."]],
    lose: ["Chain snapped. Here's how it went.", "Five strikes. The links win today.", "Dropped it. Rematch tomorrow.", "Chain broken. Here\u2019s the full set.", "Too many slips. The chain gave out.", "Snapped. Tomorrow\u2019s chain is stronger. Probably."]
  };
  function say(t) { $("msg").textContent = t; }

  // ---------- helpers ----------
  function word(i) { return P.chain[i]; }
  function frontier() { // open slots adjacent to a known word
    var f = [], i;
    for (i = 1; i <= 4; i++) if (!st.w[i].s) { f.push(i); break; }
    for (i = 4; i >= 1; i--) if (!st.w[i].s) { if (f.indexOf(i) < 0) f.push(i); break; }
    return f;
  }
  function fixAct() { var f = frontier(); if (f.indexOf(st.act) < 0) st.act = f[0] || 0; }
  function okGuess(i, g) {
    var w = word(i), alts = (P.alt && P.alt[w]) || [];
    return g === w || alts.indexOf(g) >= 0;
  }

  // ---------- render ----------
  var ICON = { Easy: "\ud83d\udfe2", Medium: "\ud83d\udfe1", Hard: "\ud83d\udd34", Genius: "\ud83e\udde0", Einstein: "\u269b\ufe0f" };
  function render(shake) {
    if (!P) return;
    fixAct();
    var f = st.done ? [] : frontier(), h = "";
    for (var i = 0; i < 6; i++) {
      var w = word(i), cls = "link", tiles = "";
      if (i === 0 || i === 5) { cls += " end"; tiles = '<span class="full">' + esc(w) + "</span>"; }
      else {
        var s = st.w[i], show = s.s || st.done;
        if (s.s === 1) cls += " ok"; else if (s.s === 2 || (st.done && !s.s)) cls += " gave";
        if (i === st.act && !st.done) cls += " act"; else if (f.indexOf(i) >= 0) cls += " can";
        for (var c = 0; c < w.length; c++) {
          var ch = "", tc = "tl";
          if (show || c < s.rev) { ch = w[c]; tc += " rv"; }
          else if (i === st.act && !st.done && c - s.rev < cur.length) { ch = cur[c - s.rev]; tc += " ty"; }
          tiles += '<span class="' + tc + '">' + esc(ch) + "</span>";
        }
      }
      h += '<div class="' + cls + '" data-i="' + i + '"' + (f.indexOf(i) >= 0 && i !== st.act ? ' role="button" tabindex="0" aria-label="Work on this word"' : "") + ">" + tiles + "</div>";
      if (i < 5) h += '<div class="joint" aria-hidden="true"></div>';
    }
    var ch2 = $("chain"); ch2.innerHTML = h;
    if (shake) { var a = ch2.querySelector(".act"); if (a) { a.classList.remove("shake"); void a.offsetWidth; a.classList.add("shake"); } }
    var m = ""; for (var k = 0; k < MAXM; k++) m += '<i class="' + (k < st.mistakes ? "used" : "") + '"></i>';
    $("mist").innerHTML = st.done ? "" : "Strikes left " + m + (f.length > 1 ? '<span class="tip">Tap the other open word to switch ends.</span>' : "");
    $("kb").hidden = st.done;
    renderResult();
  }
  function renderResult() {
    var r = $("result");
    if (!st.done) { r.hidden = true; return; }
    var sq = [1, 2, 3, 4].map(function (i) { var s = st.w[i]; return s.s !== 1 ? "\ud83d\udfe5" : s.rev > 1 ? "\ud83d\udfe8" : "\ud83d\udfe9"; }).join("");
    var share = "Linkase #" + P.number + (isLive() ? "" : " (archive)") + " \u00b7 " + P.difficulty + " " + ICON[P.difficulty] + "\n\ud83d\udd17" + sq + "\ud83d\udd17 " + (st.win ? st.mistakes + "/" + MAXM + " strikes" : "snapped") + "\nmaladywise.com";
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0;
    r.hidden = false;
    r.innerHTML = '<p class="links">' + P.chain.map(function (w, i) { return i < 5 ? "<b>" + esc(w) + " " + esc(P.chain[i + 1]) + "</b>" : ""; }).filter(Boolean).join(" \u00b7 ").toLowerCase() + "</p>" +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Win %</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + stats.best + "</b><span>Best</span></div></div>" +
      '<pre id="lnk-share">' + share + '</pre><button class="btn solid" type="button" id="lnk-copy">Copy result</button>';
    $("copy").onclick = function () {
      var b = this;
      function selx() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, selx); } catch (e) { selx(); }
    };
  }
  function tick() {
    var t = "New chain at midnight, Sydney time.";
    try { var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
      var left = 1440 - (p[0] * 60 + p[1]); t = "Next chain in " + Math.floor(left / 60) + "h " + (left % 60) + "m. Go touch grass."; } catch (e) {}
    $("next").textContent = t;
  }
  function buildKb() {
    var rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm-", "+"];
    $("kb").innerHTML = rows.map(function (r) {
      return '<div class="kr">' + r.split("").map(function (k) {
        if (k === "+") return '<button class="key wide" data-k="enter" type="button">Enter</button>';
        if (k === "-") return '<button class="key wide" data-k="back" type="button" aria-label="Delete">\u232b</button>';
        return '<button class="key" data-k="' + k + '" type="button">' + k + "</button>";
      }).join("") + "</div>";
    }).join("");
  }

  // ---------- play ----------
  function finish(win) {
    st.done = true; st.win = win; put(KEY, st);
    if (isLive() && stats.last !== today) {
      var yest = stats.last && dayNum(today) - dayNum(stats.last) === 1;
      stats.played++; if (win) stats.wins++;
      stats.streak = win ? (yest ? stats.streak + 1 : 1) : 0; stats.best = Math.max(stats.best, stats.streak);
      stats.dist[win ? Math.min(st.mistakes, 4) : 5]++; stats.last = today; put(SKEY, stats);
    }
    if (P.difficulty === "Einstein") {
      say(win ? "\u269b\ufe0f Einstein solved. Roughly a once-in-50-days chain, and you held it. Screenshot this." : "Even Einstein needed a few goes. Respect for taking on the rare one.");
      if (win && isLive()) { var tro = load("mw-einstein", []); if (!tro.some(function (t) { return t.g === "linkase" && t.d === today; })) { tro.push({ g: "linkase", d: today }); put("mw-einstein", tro); } }
    } else say(win ? pick(SASS.win[Math.min(st.mistakes, 4)]) : pick(SASS.lose));
  }
  function submit() {
    if (!P || st.done || !st.act) return;
    var i = st.act, w = word(i), s = st.w[i], need = w.length - s.rev;
    if (cur.length !== need) { say(SASS.len(w.length)); render(true); return; }
    var g = w.slice(0, s.rev) + cur.toUpperCase(); cur = "";
    if (okGuess(i, g)) {
      s.s = 1; say(pick(SASS.right));
      if ([1, 2, 3, 4].every(function (k) { return st.w[k].s; })) { finish(st.mistakes < MAXM); render(); return; }
      fixAct(); put(KEY, st); render(); return;
    }
    st.mistakes++; s.rev++;
    if (s.rev >= w.length) { s.s = 2; say(pick(SASS.given)); } else say(pick(SASS.wrong));
    if (st.mistakes >= MAXM) { finish(false); render(); return; }
    if ([1, 2, 3, 4].every(function (k) { return st.w[k].s; })) { finish(true); render(); return; }
    fixAct(); put(KEY, st); render(true);
  }
  function press(k) {
    if (!P || st.done || !st.act) return;
    var need = word(st.act).length - st.w[st.act].rev;
    if (k === "enter") return submit();
    if (k === "back") { cur = cur.slice(0, -1); render(); return; }
    if (/^[a-z]$/.test(k) && cur.length < need) { cur += k; render(); }
  }
  function pickSlot(el) {
    var i = +el.getAttribute("data-i");
    if (st.done || frontier().indexOf(i) < 0 || i === st.act) return;
    st.act = i; cur = ""; say(""); put(KEY, st); render();
  }
  $("chain").addEventListener("click", function (e) { var el = e.target.closest(".link.can"); if (el) pickSlot(el); });
  $("chain").addEventListener("keydown", function (e) { var el = e.target.closest(".link.can"); if (el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); e.stopPropagation(); pickSlot(el); } });
  $("kb").addEventListener("click", function (e) { var b = e.target.closest(".key"); if (b) { press(b.getAttribute("data-k")); b.blur(); } });
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target && e.target.tagName; if (t === "INPUT" || t === "TEXTAREA") return;
    if (e.target && e.target.closest && e.target.closest(".link.can")) return;
    if (document.querySelector(".scrim")) return;
    var g = document.getElementById("game"); if (g && g.hidden) return;
    if (e.key === "Enter") { press("enter"); e.preventDefault(); }
    else if (e.key === "Backspace") press("back");
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
    today = date; loadDay(); cur = ""; P = null; say("");
    return month(date.slice(0, 7)).then(function (list) {
      P = list.filter(function (x) { return x.date === date; })[0] || null;
      if (!P) { say("Today\u2019s chain is still in triage. Back tomorrow."); $("kb").hidden = true; $("chain").innerHTML = ""; $("mist").innerHTML = ""; return; }
      $("eyebrow").textContent = (isLive() ? "Linkase" : "Archive") + " \u00b7 #" + P.number + " \u00b7 " + nice(date);
      var b = $("badge"); b.hidden = false; b.className = "badge " + P.difficulty; b.innerHTML = (P.difficulty === "Einstein" ? ATOM : "") + P.difficulty; root.classList.toggle("einstein", P.difficulty === "Einstein");
      if (!isLive()) say(st.done ? "Archive chain. Already done." : "Archive chain. Doesn't count towards your streak.");
      else if (st.done) say(st.win ? "Linked. Come back tomorrow." : "You've had your go. Back tomorrow.");
      render(); renderArchive();
    });
  }
  function renderArchive() {
    var m = REAL.slice(0, 7);
    Promise.all([month(prevMonth(m)), month(m)]).then(function (ls) {
      var past = [].concat(ls[0], ls[1]).filter(function (x) { return x.date < REAL; }).reverse();
      var rows = past.map(function (x) {
        var s = load("lnk-day-" + x.date, null), mark = !s || !s.done ? "" : s.win ? " \u2713" : " \u2715";
        return '<button type="button" class="arow' + (x.date === today ? " on" : "") + '" data-d="' + x.date + '"><span>#' + x.number + " \u00b7 " + nice(x.date) + mark + '</span><span class="badge ' + x.difficulty + '">' + x.difficulty + "</span></button>";
      }).join("");
      var back = isLive() ? "" : '<button type="button" class="btn" id="lnk-back">Back to today</button>';
      $("alist").innerHTML = back + (rows || "<p class=\"note\">No past chains yet. Today is #1. You\u2019re early.</p>");
      Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); }; });
      if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
    });
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };
  buildKb(); tick(); setInterval(tick, 60000); show(today);
})();
