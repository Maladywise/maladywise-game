/* Arrhythmix: read the ECG. One fictional case + generated ECG per day; pick the diagnosis from six options in three tries.
   Puzzles in puzzles/YYYY-MM.json (date, number, difficulty, vignette, ecg, highlight, options, answer, hints, explanation, features, pearl).
   ECGs are drawn by ecg.js (window.ARX_ECG). Medical mode only. */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "1";
  var NORMIE = !!(window.MW_mode && MW_mode() === "normie"), NAME = "Arrhythmix", TRIES = 3;
  var root = document.getElementById("arx");
  if (!document.querySelector("link[data-arx]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "arrhythmix.css?v=" + BUILD; l.setAttribute("data-arx", ""); document.head.appendChild(l);
  }
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="arx-eyebrow">Arrhythmix</span><span class="badge" id="arx-badge" hidden></span></div>' +
    ' <div class="stage" id="arx-play">' +
    '  <p class="vig" id="arx-vig"></p>' +
    '  <figure class="ecgwrap"><div class="ecgbox" id="arx-ecg"></div>' +
    '   <figcaption class="ecgtools"><button type="button" class="chip" id="arx-zoom" aria-pressed="false">🔍 Zoom</button><button type="button" class="chip" id="arx-hl" aria-pressed="true" hidden>✨ Key features</button><span class="scale">1 small square = 40 ms · 0.1 mV</span></figcaption></figure>' +
    '  <p class="msg" id="arx-msg" aria-live="polite"></p>' +
    '  <div class="tries" id="arx-tries" aria-hidden="true"></div>' +
    '  <div class="choices" id="arx-opts" role="group" aria-label="Diagnosis options"></div>' +
    '  <ul class="hints" id="arx-hints" aria-live="polite"></ul>' +
    '  <div class="result" id="arx-result" hidden></div>' +
    ' </div>' +
    ' <p class="note" id="arx-next"></p>' +
    ' <details class="archive" id="arx-archive"><summary>Past puzzles</summary><div class="alist" id="arx-alist"></div></details>' +
    ' <p class="note">All cases and ECGs are fictional and computer-generated. General education, not medical advice.</p>' +
    "</div>";
  var $ = function (id) { return document.getElementById("arx-" + id); };

  // ---------- dates & storage ----------
  function sydToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function nice(d) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var REAL = sydToday(), q = new URLSearchParams(location.search).get("date");
  var today = (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) ? q : REAL;
  function isLive() { return today === REAL; }
  var SKEY = "arx-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0] });
  var KEY, st, P = null, OPTS = [];
  function loadDay() { KEY = "arx-day-" + today; st = load(KEY, { picks: [], done: false, win: false }); }
  loadDay();

  // ---------- sass (at the guess, never the patient) ----------
  function pick(a) { if (a.length < 2) return a[0]; var k = "mw-last-" + a[0].slice(0, 12), last; try { last = sessionStorage.getItem(k); } catch (e) {} var x, n = 0; do { x = a[Math.floor(Math.random() * a.length)]; } while (x === last && ++n < 8); try { sessionStorage.setItem(k, x); } catch (e) {} return x; }
  var SASS = {
    wrong: ["That’s not what the squiggles say.", "Bold read. Wrong, but bold.", "The ECG respectfully disagrees.", "Swing and a miss. Have a hint.", "Not quite. Calipers out.", "Interesting. Incorrect, but interesting.", "The cardiology registrar raised one eyebrow.", "Close the textbook, open your eyes.", "Plausible. Also wrong.", "The machine’s auto-report is smirking.", "Confidently incorrect. A classic.", "Wrong lead, doctor. Have another look.", "That’s a diagnosis. Just not this one.", "Nope. Count the little squares.", "The squiggles have filed a complaint."],
    win: [["First read. Cardiology wants your number.", "One try. Were you holding calipers?", "First go. Textbook. Literally.", "Straight in. Sinus rhythm of genius."], ["Second try. Steady hands.", "Two tries. The hint did some lifting.", "Got there on two. Respectable.", "Second read, right read."], ["Third time. Pulse restored.", "Last try. Living dangerously.", "Three tries. Everyone breathe out.", "Final pick. Phew."]],
    lose: ["The rhythm wins today. Rematch tomorrow.", "Three strikes. Off to the ECG library with you.", "Not today. Read the pearl and come back.", "The squiggles escaped. Tomorrow’s another strip.", "Flatlined on that one. Revive tomorrow."]
  };
  var CHEER = ["You’ve got the beat.", "Calipers? Never needed them.", "Every P wave accounted for.", "Read in perfect time.", "My heart skipped a beat. The good kind.", "QRS: Quite Remarkably Smart.", "Tuned in and nailed it.", "That read had rhythm."];
  function say(t) { $("msg").textContent = t; }

  // ---------- ECG ----------
  var zoom = false, showHl = true;
  function drawEcg() {
    if (!P || !window.ARX_ECG) return;
    var c = {}; Object.keys(P.ecg).forEach(function (k) { c[k] = P.ecg[k]; });
    var h = P.highlight || {}; c.marks = h.marks || []; c.boxes = h.boxes || [];
    var r = ARX_ECG.render(c, P.date);
    $("ecg").innerHTML = r.svg; $("ecg").setAttribute("data-w", r.W);
    $("ecg").classList.toggle("twelve", c.layout === "12");
    applyView();
  }
  function applyView() {
    var svg = $("ecg").querySelector("svg"); if (!svg) return;
    var W = +$("ecg").getAttribute("data-w") || 135;
    svg.style.width = zoom ? Math.round(W * 4.4) + "px" : "100%";
    $("ecg").classList.toggle("zoomed", zoom);
    $("zoom").setAttribute("aria-pressed", zoom); $("zoom").textContent = zoom ? "🔍 Fit" : "🔍 Zoom";
    var hasHl = P && P.highlight && ((P.highlight.marks || []).length || (P.highlight.boxes || []).length);
    $("hl").hidden = !(st.done && hasHl);
    svg.classList.toggle("show", !!(st.done && showHl));
    $("hl").setAttribute("aria-pressed", showHl);
  }
  $("zoom").onclick = function () { zoom = !zoom; applyView(); };
  $("ecg").addEventListener("click", function () { if (!zoom) { zoom = true; applyView(); } });
  $("hl").onclick = function () { showHl = !showHl; applyView(); };

  // ---------- options ----------
  function seeded(n) { var a = n >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(list, seed) { var o = list.slice(), r = seeded(seed); for (var k = o.length - 1; k > 0; k--) { var j = Math.floor(r() * (k + 1)); var t = o[k]; o[k] = o[j]; o[j] = t; } return o; }
  function wrongCount() { return st.picks.filter(function (x) { return x !== P.answer; }).length; }
  function render() {
    if (!P) return;
    $("opts").innerHTML = OPTS.map(function (o, i) {
      var picked = st.picks.indexOf(o) >= 0, cls = "choice";
      if (picked && o !== P.answer) cls += " wrong";
      if (o === P.answer && (st.win || st.done)) cls += " right";
      if (o === P.answer && st.done && !st.win) cls += " reveal";
      return '<button type="button" class="' + cls + '" data-i="' + i + '"' + (picked || st.done ? " disabled" : "") + ">" + esc(o) + "</button>";
    }).join("");
    var w = wrongCount();
    $("tries").innerHTML = [0, 1, 2].map(function (i) { var c = i < st.picks.length ? (st.picks[i] === P.answer ? "ok" : "no") : ""; return '<i class="' + c + '"></i>'; }).join("") + '<span>' + (st.done ? "" : (TRIES - st.picks.length) + (TRIES - st.picks.length === 1 ? " try left" : " tries left")) + "</span>";
    $("hints").innerHTML = P.hints.slice(0, Math.min(w, P.hints.length)).map(function (h, i) { return '<li><b>Hint ' + (i + 1) + ":</b> " + esc(h) + "</li>"; }).join("");
    renderResult(); applyView();
  }
  $("opts").addEventListener("click", function (e) {
    var b = e.target.closest(".choice"); if (!b || b.disabled || !P || st.done) return;
    var o = OPTS[+b.getAttribute("data-i")]; if (st.picks.indexOf(o) >= 0) return;
    st.picks.push(o);
    if (o === P.answer) finish(true);
    else if (st.picks.length >= TRIES) finish(false);
    else { put(KEY, st); say(pick(SASS.wrong)); }
    render();
    if (st.done) setTimeout(function () { var r = $("result"); if (r && r.scrollIntoView) r.scrollIntoView({ behavior: "smooth", block: "start" }); }, 250);
  });
  function finish(win) {
    st.done = true; st.win = win; put(KEY, st);
    if (isLive() && stats.last !== today) {
      var yest = stats.last && dayNum(today) - dayNum(stats.last) === 1;
      stats.played++; if (win) stats.wins++;
      stats.streak = win ? (yest ? stats.streak + 1 : 1) : 0; stats.best = Math.max(stats.best, stats.streak);
      stats.dist[win ? st.picks.length - 1 : 3]++; stats.last = today; put(SKEY, stats);
    }
    say(win ? pick(SASS.win[st.picks.length - 1]) : "It was " + P.answer + ". " + pick(SASS.lose));
  }
  function renderResult() {
    var r = $("result");
    if (!st.done) { r.hidden = true; return; }
    var row = st.picks.map(function (x) { return x === P.answer ? "🟩" : "🟥"; }).join("");
    var share = NAME + " #" + P.number + (isLive() ? "" : " (archive)") + " · " + P.difficulty + "  " + (st.win ? "💓 " + st.picks.length : "💔 X") + "/3\n" + row + "\nmaladywise.com";
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0, max = Math.max.apply(null, stats.dist.concat([1])), mine = st.win ? st.picks.length - 1 : 3;
    var cheer = st.win ? '<div class="masc"><img src="' + BASE + '../assets/mascots/arrhythmix.svg" alt="" width="56" height="56"><p><b>Riff:</b> ' + pick(CHEER) + "</p></div>" : "";
    r.hidden = false;
    r.innerHTML = '<p class="kicker">' + (st.win ? "Correct" : "The answer") + "</p><h2>" + esc(P.answer) + "</h2>" + cheer +
      '<p class="exp">' + esc(P.explanation) + "</p>" +
      '<h3>Key features</h3><ul class="feat">' + P.features.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" +
      '<div class="pearl"><b>🦪 Pearl</b><p>' + esc(P.pearl) + "</p></div>" +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Win %</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + stats.best + "</b><span>Best</span></div></div>" +
      '<div class="dist">' + stats.dist.map(function (n, i) { return "<div><span>" + (i < 3 ? i + 1 : "X") + '</span><i class="' + (i === mine && isLive() ? "me" : "") + '" style="width:' + Math.max(8, Math.round(n / max * 100)) + '%">' + n + "</i></div>"; }).join("") + "</div>" +
      '<pre id="arx-share">' + share + '</pre><button class="btn" type="button" id="arx-copy">Copy result</button>';
    $("copy").onclick = function () {
      var b = this;
      function sel() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, sel); } catch (e) { sel(); }
    };
  }
  function tick() {
    var t = "A new ECG arrives at midnight, Sydney time.";
    try { var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
      var left = 1440 - ((p[0] % 24) * 60 + p[1]); t = "Next ECG in " + Math.floor(left / 60) + "h " + (left % 60) + "m. Mind your own rhythm."; } catch (e) {}
    $("next").textContent = t;
  }

  // ---------- load ----------
  var cache = {}, FIRST = "2026-10"; // first month with puzzles (avoids 404s for earlier months)
  function month(m) {
    if (m < FIRST) return Promise.resolve([]);
    if (!cache[m]) cache[m] = fetch(BASE + "puzzles/" + m + ".json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    return cache[m];
  }
  function prevMonth(m) { var p = m.split("-").map(Number); p[1]--; if (!p[1]) { p[1] = 12; p[0]--; } return p[0] + "-" + ("0" + p[1]).slice(-2); }
  function show(date) {
    today = date; loadDay(); P = null; say(""); showHl = true;
    return month(date.slice(0, 7)).then(function (list) {
      P = list.filter(function (x) { return x.date === date; })[0] || null;
      if (!P) {
        $("play").classList.add("empty"); $("ecg").innerHTML = ""; $("opts").innerHTML = ""; $("tries").innerHTML = ""; $("hints").innerHTML = ""; $("result").hidden = true; $("vig").textContent = "";
        say("Today’s ECG is still printing. Back tomorrow."); renderArchive(); return;
      }
      $("play").classList.remove("empty");
      OPTS = shuffle(P.options, dayNum(P.date) * 97 + 13);
      $("eyebrow").textContent = (isLive() ? "Arrhythmix" : "Archive") + " · #" + P.number + " · " + nice(date);
      var b = $("badge"); b.hidden = false; b.className = "badge " + P.difficulty; b.textContent = P.difficulty;
      $("vig").textContent = P.vignette;
      drawEcg();
      if (!isLive()) say(st.done ? "Archive ECG. Already read." : "Archive ECG. Doesn’t count towards your streak.");
      else if (st.done) say(st.win ? "Read and reported. Come back tomorrow." : "You’ve had your go. Back tomorrow.");
      render(); renderArchive();
    });
  }
  function renderArchive() {
    var m = REAL.slice(0, 7);
    Promise.all([month(prevMonth(m)), month(m)]).then(function (ls) {
      var past = [].concat(ls[0], ls[1]).filter(function (x) { return x.date < REAL; }).reverse();
      var rows = past.map(function (x) {
        var s = load("arx-day-" + x.date, null), mark = !s || !s.done ? "" : s.win ? " ✓" : " ✕";
        return '<button type="button" class="arow' + (x.date === today ? " on" : "") + '" data-d="' + x.date + '"><span>#' + x.number + " · " + nice(x.date) + mark + '</span><span class="badge ' + x.difficulty + '">' + x.difficulty + "</span></button>";
      }).join("");
      var back = isLive() ? "" : '<button type="button" class="btn" id="arx-back">Back to today</button>';
      $("alist").innerHTML = back + (rows || '<p class="note">No past ECGs yet. You’re early.</p>');
      Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); }; });
      if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
    });
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };

  tick(); setInterval(tick, 60000);
  if (NORMIE) {
    $("play").innerHTML = '<div class="mw-nonorm"><p><b>Arrhythmix is Medical-mode only.</b></p><p>ECGs don’t really do everyday. Switch to Medical to read today’s rhythm.</p><button type="button" class="btn" onclick="MW_setMode(\'medical\')">🩺 Switch to Medical</button></div>';
    $("archive").hidden = true; $("next").hidden = true;
  } else show(today);
})();
