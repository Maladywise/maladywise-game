/* Suturix: 6x8 letter grid. Find the theme words (they fill every square) and the spangram, which runs edge to edge.
   Puzzles in puzzles/YYYY-MM.json: {date, number, difficulty, clue, rows[8], spangram, words:[{w, p:[[r,c]...]}]} (words[0] is the spangram) */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "2", R = 8, C = 6, PER_HINT = 3;
  var root = document.getElementById("stx");
  if (!document.querySelector("link[data-stx]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "suturix.css?v=" + BUILD; l.setAttribute("data-stx", ""); document.head.appendChild(l);
  }
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="stx-eyebrow">Suturix</span><span class="badge" id="stx-badge" hidden></span></div>' +
    ' <div class="theme"><span>Today\u2019s theme</span><b id="stx-clue"></b></div>' +
    ' <div class="count" id="stx-count"></div>' +
    ' <div class="cur" id="stx-cur" aria-live="polite"></div>' +
    ' <div class="board" id="stx-board"><svg id="stx-svg" viewBox="0 0 600 800" preserveAspectRatio="none" aria-hidden="true"></svg><div class="cells" id="stx-cells"></div></div>' +
    ' <div class="ctrls" id="stx-ctrls"><button class="enter" type="button" id="stx-enter" disabled>Enter</button><button class="btn hint" type="button" id="stx-hint"><i id="stx-hfill"></i><span>Hint</span></button><button class="btn" type="button" id="stx-clear">Clear</button></div>' +
    ' <div class="result" id="stx-result" hidden></div>' +
    ' <p class="note" id="stx-next"></p>' +
    ' <details class="archive" id="stx-archive"><summary>Past puzzles</summary><div class="alist" id="stx-alist"></div></details>' +
    "</div>";
  var $ = function (id) { return document.getElementById("stx-" + id); };

  function sydToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function nice(d) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var REAL = sydToday(), q = new URLSearchParams(location.search).get("date");
  var today = (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) ? q : REAL;
  function isLive() { return today === REAL; }
  // dist: hints used 0,1,2,3,4+
  var SKEY = "stx-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0, 0] });
  var KEY, st, P = null, path = [], dict = null;
  // st.found: indexes into P.words in order found; st.log: share sequence ("t","s","h"); st.extra: non-theme words; st.pts: hint points; st.hint: word index or -1
  function loadDay() { KEY = "stx-day-" + today; st = load(KEY, { found: [], log: [], extra: [], pts: 0, hints: 0, hint: -1, done: false, win: false }); }
  loadDay();
  fetch(BASE + "words.txt?v=" + BUILD).then(function (r) { return r.ok ? r.text() : ""; }).then(function (t) { dict = new Set(t.split("\n")); }).catch(function () { dict = new Set(); });

  // ---------- sass ----------
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var SASS = {
    theme: ["Neat stitch.", "Nice. That one holds.", "Sutured.", "Clean closure.", "Textbook."],
    span: ["Spangram! Edge to edge, like a good incision.", "Spangram. The whole theme, in one stroke."],
    extra: ["Real word, not on theme. Banked towards a hint.", "Valid, but off topic. Like a ward round tangent.", "A word, sure. Not today's word. Hint credit earned."],
    dupe: ["Already found that one.", "D\u00e9j\u00e0 vu. Already got it."],
    nope: ["Not a word. Not even in Latin.", "That's not in the dictionary. Or any dictionary.", "Keyboard smash detected.", "Nope. Try actual English."],
    short: ["Four letters minimum. Even 'ouch' qualifies.", "Too short. Commit to the bit."],
    wrongspot: ["Right word, wrong stitch. Try another route."],
    hintNo: ["Find " + PER_HINT + " non-theme words to earn a hint.", "No freebies. Earn it: " + PER_HINT + " bonus words."],
    win: ["All closed. Not a stitch out of place.", "Done. Tidy work, Doctor.", "Wound closed. Patient thrilled. Probably."]
  };
  function say(t, cls) { var e = $("cur"); e.textContent = t; e.className = "cur " + (cls || "msg"); }

  // ---------- helpers ----------
  function key(p) { return p[0] + "," + p[1]; }
  function owner() { var o = {}; st.found.forEach(function (i) { P.words[i].p.forEach(function (p) { o[key(p)] = i; }); }); return o; }
  function adj(a, b) { return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])) === 1; }
  function word() { return path.map(function (p) { return P.rows[p[0]][p[1]]; }).join(""); }
  function samePath(a, b) { if (a.length !== b.length) return false; for (var i = 0; i < a.length; i++) if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1]) return false; return true; }

  // ---------- render ----------
  var ICON = { Easy: "\ud83d\udfe2", Medium: "\ud83d\udfe1", Hard: "\ud83d\udd34", Genius: "\ud83e\udde0", Einstein: "\u269b\ufe0f" };
  function ctr(p) { return (p[1] * 100 + 50) + "," + (p[0] * 100 + 50); }
  function render() {
    if (!P) return;
    var own = owner(), inPath = {}, hintCells = {};
    path.forEach(function (p, i) { inPath[key(p)] = i + 1; });
    if (st.hint >= 0 && st.found.indexOf(st.hint) < 0) P.words[st.hint].p.forEach(function (p) { hintCells[key(p)] = 1; });
    var h = "";
    for (var r = 0; r < R; r++) for (var c = 0; c < C; c++) {
      var k = r + "," + c, cls = "lt";
      if (k in own) cls += own[k] === 0 ? " span" : " theme";
      else if (inPath[k]) cls += " sel";
      if (hintCells[k] && !(k in own)) cls += " hinted";
      h += '<button type="button" class="' + cls + '" data-r="' + r + '" data-c="' + c + '"' + (k in own || st.done ? " disabled" : "") + ">" + P.rows[r][c] + "</button>";
    }
    $("cells").innerHTML = h;
    var s = "";
    st.found.forEach(function (i) { var w = P.words[i]; s += '<polyline class="' + (i === 0 ? "ps" : "pt") + '" points="' + w.p.map(ctr).join(" ") + '"/>'; });
    if (path.length > 1) s += '<polyline class="pc" points="' + path.map(ctr).join(" ") + '"/>';
    $("svg").innerHTML = s;
    var n = P.words.length, f = st.found.length;
    $("count").innerHTML = "<b>" + f + "</b> of <b>" + n + "</b> theme words found.";
    $("hfill").style.width = Math.min(100, st.pts / PER_HINT * 100) + "%";
    $("hint").classList.toggle("ready", st.pts >= PER_HINT && st.hint < 0);
    $("ctrls").hidden = st.done;
    $("enter").disabled = path.length < 2;
    renderResult();
  }
  function showCur() { if (path.length) say(word(), "word"); }
  function renderResult() {
    var r = $("result");
    if (!st.done) { r.hidden = true; return; }
    var em = { t: "\ud83d\udd35", s: "\ud83d\udfe1", h: "\ud83d\udca1" }, seq = st.log.map(function (x) { return em[x]; }), lines = [];
    for (var i = 0; i < seq.length; i += 4) lines.push(seq.slice(i, i + 4).join(""));
    var share = "Suturix #" + P.number + (isLive() ? "" : " (archive)") + " \u00b7 " + P.difficulty + " " + ICON[P.difficulty] + "\n\u201c" + P.clue + "\u201d\n" + lines.join("\n") + "\nmaladywise.com";
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0;
    r.hidden = false;
    r.innerHTML = '<p class="found">' + P.words.map(function (w, i) { return '<span class="' + (i === 0 ? "s" : "") + '">' + esc(w.w) + "</span>"; }).join("") + "</p>" +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Win %</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + stats.best + "</b><span>Best</span></div></div>" +
      '<pre id="stx-share">' + share + '</pre><button class="btn solid" type="button" id="stx-copy">Copy result</button>';
    $("copy").onclick = function () {
      var b = this;
      function selx() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, selx); } catch (e) { selx(); }
    };
  }
  function tick() {
    var t = "New theme at midnight, Sydney time.";
    try { var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
      var left = 1440 - (p[0] * 60 + p[1]); t = "Next theme in " + Math.floor(left / 60) + "h " + (left % 60) + "m. Go touch grass."; } catch (e) {}
    $("next").textContent = t;
  }

  // ---------- play ----------
  function finish() {
    st.done = true; st.win = true; put(KEY, st);
    if (isLive() && stats.last !== today) {
      var yest = stats.last && dayNum(today) - dayNum(stats.last) === 1;
      stats.played++; stats.wins++;
      stats.streak = yest ? stats.streak + 1 : 1; stats.best = Math.max(stats.best, stats.streak);
      stats.dist[Math.min(st.hints, 4)]++; stats.last = today; put(SKEY, stats);
    }
    if (P.difficulty === "Einstein") {
      say("\u269b\ufe0f Einstein solved. A once-in-100-days theme, closed up neatly. Screenshot this.");
      if (isLive()) { var tro = load("mw-einstein", []); if (!tro.some(function (t) { return t.g === "suturix" && t.d === today; })) { tro.push({ g: "suturix", d: today }); put("mw-einstein", tro); } }
    } else say(st.hints ? "Closed, with " + st.hints + " hint" + (st.hints > 1 ? "s" : "") + ". Still counts. Mostly." : pick(SASS.win));
  }
  function submit() {
    var w = word(), p = path.slice(); path = [];
    if (w.length < 4) { say(pick(SASS.short)); render(); return; }
    for (var i = 0; i < P.words.length; i++) {
      if (P.words[i].w !== w) continue;
      if (st.found.indexOf(i) >= 0) { say(pick(SASS.dupe)); render(); return; }
      if (!samePath(P.words[i].p, p) && !samePath(P.words[i].p, p.slice().reverse())) { say(pick(SASS.wrongspot)); render(); return; }
      st.found.push(i); st.log.push(i === 0 ? "s" : "t"); if (st.hint === i) st.hint = -1;
      say(i === 0 ? pick(SASS.span) : pick(SASS.theme), i === 0 ? "good span" : "good");
      if (st.found.length === P.words.length) { finish(); render(); return; }
      put(KEY, st); render(); return;
    }
    var lw = w.toLowerCase();
    if (st.extra.indexOf(lw) >= 0) { say(pick(SASS.dupe)); render(); return; }
    if (dict && dict.has(lw)) { st.extra.push(lw); st.pts++; say(pick(SASS.extra)); put(KEY, st); render(); return; }
    say(pick(SASS.nope)); render();
  }
  // pointer handling: drag to trace (submits on release), or tap letters one by one (tap the last letter again to submit)
  var drag = null;
  function cellAt(x, y) { var el = document.elementFromPoint(x, y); el = el && el.closest ? el.closest(".lt") : null; return el && !el.disabled && root.contains(el) ? [+el.getAttribute("data-r"), +el.getAttribute("data-c")] : null; }
  function inPath(p) { for (var i = 0; i < path.length; i++) if (path[i][0] === p[0] && path[i][1] === p[1]) return i; return -1; }
  $("cells").addEventListener("pointerdown", function (e) {
    if (!P || st.done) return; var p = cellAt(e.clientX, e.clientY); if (!p) return;
    e.preventDefault();
    var last = path[path.length - 1], i = inPath(p);
    if (last && i === path.length - 1) { drag = { moved: false, tapSubmit: true }; return; }
    if (i >= 0) path = path.slice(0, i + 1);
    else if (last && adj(last, p)) path.push(p);
    else path = [p];
    drag = { moved: false, start: path.length };
    showCur(); render();
  });
  document.addEventListener("pointermove", function (e) {
    if (!drag || !P) return; var p = cellAt(e.clientX, e.clientY); if (!p) return;
    var i = inPath(p), last = path[path.length - 1];
    if (i === path.length - 2 && i >= 0) { path.pop(); drag.moved = true; showCur(); render(); return; }
    if (i < 0 && last && adj(last, p)) {
      // only accept when pointer is near the centre of the cell (makes diagonals easier)
      var el = document.elementFromPoint(e.clientX, e.clientY).closest(".lt"), b = el.getBoundingClientRect();
      var dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
      if (Math.sqrt(dx * dx + dy * dy) > b.width * 0.42) return;
      path.push(p); drag.moved = true; showCur(); render();
    }
  });
  document.addEventListener("pointerup", function () {
    if (!drag) return; var d = drag; drag = null;
    if (d.tapSubmit || (d.moved && path.length > 1)) submit();
  });
  $("cells").addEventListener("click", function (e) {
    if (e.detail !== 0 || !P || st.done) return; // keyboard activation only
    var el = e.target.closest(".lt"); if (!el) return;
    var p = [+el.getAttribute("data-r"), +el.getAttribute("data-c")], last = path[path.length - 1], i = inPath(p);
    if (last && i === path.length - 1) { submit(); return; }
    if (i >= 0) path = path.slice(0, i + 1); else if (last && adj(last, p)) path.push(p); else path = [p];
    showCur(); render(); var nb = $("cells").querySelector('[data-r="' + p[0] + '"][data-c="' + p[1] + '"]'); if (nb) nb.focus();
  });
  $("clear").onclick = function () { path = []; say(""); render(); };
  $("enter").onclick = function () { if (path.length && !st.done) submit(); };
  $("hint").onclick = function () {
    if (st.done) return;
    if (st.hint >= 0) { say("Hint's already showing. The dashed letters spell a theme word."); return; }
    if (st.pts < PER_HINT) { say(pick(SASS.hintNo) + " (" + st.pts + "/" + PER_HINT + ")"); return; }
    var idx = -1; for (var i = 1; i < P.words.length; i++) if (st.found.indexOf(i) < 0) { idx = i; break; }
    if (idx < 0) idx = 0;
    st.pts -= PER_HINT; st.hints++; st.hint = idx; st.log.push("h");
    say("Dashed letters spell a theme word. You're welcome."); put(KEY, st); render();
  };

  // ---------- load ----------
  var cache = {};
  function month(m) {
    if (!cache[m]) cache[m] = fetch(BASE + "puzzles/" + m + ".json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    return cache[m];
  }
  function prevMonth(m) { var p = m.split("-").map(Number); p[1]--; if (!p[1]) { p[1] = 12; p[0]--; } return p[0] + "-" + ("0" + p[1]).slice(-2); }
  var ATOM = "<svg viewBox=\"0 0 24 24\" width=\"13\" height=\"13\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" aria-hidden=\"true\"><ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"4\"/><ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"4\" transform=\"rotate(60 12 12)\"/><ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"4\" transform=\"rotate(120 12 12)\"/><circle cx=\"12\" cy=\"12\" r=\"1.8\" fill=\"currentColor\"/></svg>";
  function show(date) {
    today = date; loadDay(); path = []; P = null; say("");
    return month(date.slice(0, 7)).then(function (list) {
      P = list.filter(function (x) { return x.date === date; })[0] || null;
      if (!P) { say("Today\u2019s theme is still in theatre. Back tomorrow."); $("ctrls").hidden = true; $("cells").innerHTML = ""; $("svg").innerHTML = ""; return; }
      $("clue").textContent = P.clue;
      $("eyebrow").textContent = (isLive() ? "Suturix" : "Archive") + " \u00b7 #" + P.number + " \u00b7 " + nice(date);
      var b = $("badge"); b.hidden = false; b.className = "badge " + P.difficulty; b.innerHTML = (P.difficulty === "Einstein" ? ATOM : "") + P.difficulty; root.classList.toggle("einstein", P.difficulty === "Einstein");
      if (!isLive()) say(st.done ? "Archive theme. Already done." : "Archive theme. Doesn't count towards your streak.");
      else if (st.done) say("Closed up. Come back tomorrow.");
      render(); renderArchive();
    });
  }
  function renderArchive() {
    var m = REAL.slice(0, 7);
    Promise.all([month(prevMonth(m)), month(m)]).then(function (ls) {
      var past = [].concat(ls[0], ls[1]).filter(function (x) { return x.date < REAL; }).reverse();
      var rows = past.map(function (x) {
        var s = load("stx-day-" + x.date, null), mark = !s || !s.done ? "" : " \u2713";
        return '<button type="button" class="arow' + (x.date === today ? " on" : "") + '" data-d="' + x.date + '"><span>#' + x.number + " \u00b7 " + nice(x.date) + mark + '</span><span class="badge ' + x.difficulty + '">' + x.difficulty + "</span></button>";
      }).join("");
      var back = isLive() ? "" : '<button type="button" class="btn" id="stx-back">Back to today</button>';
      $("alist").innerHTML = back + (rows || "<p class=\"note\">No past themes yet. Today is #1. You\u2019re early.</p>");
      Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); }; });
      if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
    });
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };
  tick(); setInterval(tick, 60000); show(today);
})();
