/* Comorbix: sixteen terms, four hidden groups, four mistakes allowed.
   Puzzles in puzzles/YYYY-MM.json: {date, number, difficulty, groups:[{label, level 1-4, words[4]}]} */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "3", MAXM = 4;
  var root = document.getElementById("cmx");
  if (!document.querySelector("link[data-cmx]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "comorbix.css?v=" + BUILD; l.setAttribute("data-cmx", ""); document.head.appendChild(l);
  }
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="cmx-eyebrow">Comorbix</span><span class="badge" id="cmx-badge" hidden></span></div>' +
    ' <p class="intro">Make four groups of four.</p>' +
    ' <div class="msg" id="cmx-msg" aria-live="polite"></div>' +
    ' <div class="grid" id="cmx-grid"></div>' +
    ' <div class="mist" id="cmx-mist"></div>' +
    ' <div class="ctrls" id="cmx-ctrls"><button class="btn" type="button" id="cmx-shuffle">Shuffle</button><button class="btn" type="button" id="cmx-clear">Deselect all</button><button class="btn solid" type="button" id="cmx-submit">Submit</button></div>' +
    ' <div class="result" id="cmx-result" hidden></div>' +
    ' <p class="note" id="cmx-next"></p>' +
    ' <details class="archive" id="cmx-archive"><summary>Past puzzles</summary><div class="alist" id="cmx-alist"></div></details>' +
    "</div>";
  var $ = function (id) { return document.getElementById("cmx-" + id); };

  function sydToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function nice(d) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var REAL = sydToday(), q = new URLSearchParams(location.search).get("date");
  var today = (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) ? q : REAL;
  function isLive() { return today === REAL; }
  var SKEY = "cmx-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0, 0] });
  var KEY, st, P = null, order = [], sel = [];
  function loadDay() { KEY = "cmx-day-" + today; st = load(KEY, { solved: [], tries: [], mistakes: 0, done: false, win: false, order: null }); }
  loadDay();

  // ---------- sass ----------
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var SASS = {
    wrong: ["Nope. Those four have nothing in common. Like a bad MDT.", "Wrong group. Bold, though.", "Not a syndrome. Just a coincidence.", "That's a differential, not a diagnosis.", "Respectfully: no."],
    one: ["One away. So close it hurts.", "Three out of four. One impostor.", "One away. Someone's in the wrong ward.", "Nearly. One doesn't belong."],
    dupe: ["Tried that already. Same answer.", "You've submitted that exact four. Still wrong."],
    right: ["Nailed it.", "Clean diagnosis.", "Consultant-approved.", "Textbook.", "Smooth."],
    win: ["Perfect. Not a single mistake. Smug is allowed.", "Solved with one slip. Still very respectable.", "Two mistakes. Got there.", "Three mistakes. Living dangerously."],
    lose: ["Out of strikes. The groups win today.", "Code blue. Here's what you missed.", "Off to the textbook. Rematch tomorrow."]
  };
  function say(t) { $("msg").textContent = t; }

  // ---------- helpers ----------
  function seeded(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
  function shuffle(a, rnd) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function groupOf(w) { for (var i = 0; i < P.groups.length; i++) if (P.groups[i].words.indexOf(w) >= 0) return i; return -1; }
  function remaining() { return order.filter(function (w) { return st.solved.indexOf(groupOf(w)) < 0; }); }

  // ---------- render ----------
  var ICON = { Easy: "\ud83d\udfe2", Medium: "\ud83d\udfe1", Hard: "\ud83d\udd34", Genius: "\ud83e\udde0", Einstein: "\u269b\ufe0f" };
  var SQ = ["\ud83d\udfe8", "\ud83d\udfe9", "\ud83d\udfe6", "\ud83d\udfea"];
  function render(shake) {
    if (!P) return;
    var h = st.solved.map(function (gi) { var g = P.groups[gi]; return '<div class="solved lv' + g.level + '"><b>' + esc(g.label) + "</b><span>" + g.words.map(esc).join(", ") + "</span></div>"; }).join("");
    if (st.done && !st.win) {
      P.groups.forEach(function (g, gi) { if (st.solved.indexOf(gi) < 0) h += '<div class="solved lv' + g.level + '"><b>' + esc(g.label) + "</b><span>" + g.words.map(esc).join(", ") + "</span></div>"; });
    } else {
      h += remaining().map(function (w) { return '<button type="button" class="t' + (w.length > 10 ? " long" : "") + (sel.indexOf(w) >= 0 ? " on" : "") + '" data-w="' + esc(w) + '">' + esc(w) + "</button>"; }).join("");
    }
    var grid = $("grid"); grid.innerHTML = h;
    if (shake) { grid.classList.remove("shake"); void grid.offsetWidth; grid.classList.add("shake"); }
    var m = ""; for (var i = 0; i < MAXM; i++) m += '<i class="' + (i < st.mistakes ? "used" : "") + '"></i>';
    $("mist").innerHTML = st.done ? "" : "Mistakes left " + m;
    $("ctrls").hidden = st.done;
    $("submit").disabled = sel.length !== 4; $("clear").disabled = !sel.length;
    renderResult();
  }
  function renderResult() {
    var r = $("result");
    if (!st.done) { r.hidden = true; return; }
    var grid = st.tries.map(function (t) { return t.map(function (w) { return SQ[P.groups[groupOf(w)].level - 1]; }).join(""); }).join("\n");
    var share = "Comorbix #" + P.number + (isLive() ? "" : " (archive)") + " \u00b7 " + P.difficulty + " " + ICON[P.difficulty] + "\n" + grid + "\nmaladywise.com";
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0;
    r.hidden = false;
    r.innerHTML = '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Win %</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + stats.best + "</b><span>Best</span></div></div>" +
      '<pre id="cmx-share">' + share + '</pre><button class="btn solid" type="button" id="cmx-copy">Copy result</button>';
    $("copy").onclick = function () {
      var b = this;
      function selx() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, selx); } catch (e) { selx(); }
    };
  }
  function tick() {
    var t = "New groups at midnight, Sydney time.";
    try { var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
      var left = 1440 - (p[0] * 60 + p[1]); t = "Next puzzle in " + Math.floor(left / 60) + "h " + (left % 60) + "m. Go touch grass."; } catch (e) {}
    $("next").textContent = t;
  }

  // ---------- play ----------
  function finish(win) {
    st.done = true; st.win = win; put(KEY, st);
    if (isLive() && stats.last !== today) {
      var yest = stats.last && dayNum(today) - dayNum(stats.last) === 1;
      stats.played++; if (win) stats.wins++;
      stats.streak = win ? (yest ? stats.streak + 1 : 1) : 0; stats.best = Math.max(stats.best, stats.streak);
      stats.dist[win ? st.mistakes : 4]++; stats.last = today; put(SKEY, stats);
    }
    if (P.difficulty === "Einstein") {
      say(win ? "\u269b\ufe0f Einstein solved. Roughly a once-in-50-days puzzle, and you nailed it. Screenshot this." : "Even Einstein needed a few goes. Respect for taking on the rare one.");
      if (win && isLive()) { var tro = load("mw-einstein", []); if (!tro.some(function (t) { return t.g === "comorbix" && t.d === today; })) { tro.push({ g: "comorbix", d: today }); put("mw-einstein", tro); } }
    } else say(win ? SASS.win[st.mistakes] : pick(SASS.lose));
  }
  $("grid").addEventListener("click", function (e) {
    var b = e.target.closest(".t"); if (!b || st.done) return;
    var w = b.getAttribute("data-w"), i = sel.indexOf(w);
    if (i >= 0) sel.splice(i, 1); else if (sel.length < 4) sel.push(w);
    say(""); render();
  });
  $("clear").onclick = function () { sel = []; render(); };
  $("shuffle").onclick = function () {
    var rest = shuffle(remaining(), Math.random), done = order.filter(function (w) { return rest.indexOf(w) < 0; });
    order = done.concat(rest); st.order = order; put(KEY, st); render();
  };
  $("submit").onclick = function () {
    if (sel.length !== 4 || st.done) return;
    var key = sel.slice().sort().join("|");
    if (st.tries.some(function (t) { return t.slice().sort().join("|") === key; })) { say(pick(SASS.dupe)); return; }
    st.tries.push(sel.slice());
    var counts = {}; sel.forEach(function (w) { var g = groupOf(w); counts[g] = (counts[g] || 0) + 1; });
    var best = Object.keys(counts).reduce(function (a, k) { return counts[k] > a[1] ? [k, counts[k]] : a; }, [null, 0]);
    if (best[1] === 4) {
      st.solved.push(+best[0]); sel = []; say(pick(SASS.right));
      if (st.solved.length === 4) finish(true); else put(KEY, st);
      render(); return;
    }
    st.mistakes++;
    say(best[1] === 3 ? pick(SASS.one) : pick(SASS.wrong));
    if (st.mistakes >= MAXM) { sel = []; finish(false); render(); return; }
    put(KEY, st); render(true);
  };

  // ---------- load ----------
  var cache = {};
  function month(m) {
    if (!cache[m]) cache[m] = fetch(BASE + "puzzles/" + m + ".json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    return cache[m];
  }
  function prevMonth(m) { var p = m.split("-").map(Number); p[1]--; if (!p[1]) { p[1] = 12; p[0]--; } return p[0] + "-" + ("0" + p[1]).slice(-2); }
  function show(date) {
    today = date; loadDay(); sel = []; P = null; say("");
    return month(date.slice(0, 7)).then(function (list) {
      P = list.filter(function (x) { return x.date === date; })[0] || null;
      if (!P) { say("Today's groups are still in triage. Back tomorrow."); $("ctrls").hidden = true; $("grid").innerHTML = ""; return; }
      var all = []; P.groups.forEach(function (g) { all = all.concat(g.words); });
      order = st.order && st.order.length === 16 ? st.order : shuffle(all, seeded(dayNum(date) * 7919));
      $("eyebrow").textContent = (isLive() ? "Comorbix" : "Archive") + " \u00b7 #" + P.number + " \u00b7 " + nice(date);
      var b = $("badge"); b.hidden = false; b.className = "badge " + P.difficulty; b.innerHTML = (P.difficulty === "Einstein" ? "<svg viewBox=\"0 0 24 24\" width=\"13\" height=\"13\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" aria-hidden=\"true\"><ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"4\"/><ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"4\" transform=\"rotate(60 12 12)\"/><ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"4\" transform=\"rotate(120 12 12)\"/><circle cx=\"12\" cy=\"12\" r=\"1.8\" fill=\"currentColor\"/></svg>" : "") + P.difficulty; root.classList.toggle("einstein", P.difficulty === "Einstein");
      if (!isLive()) say(st.done ? "Archive puzzle. Already done." : "Archive puzzle. Doesn't count towards your streak.");
      else if (st.done) say(st.win ? "Solved. Come back tomorrow." : "You've had your go. Back tomorrow.");
      render(); renderArchive();
    });
  }
  function renderArchive() {
    var m = REAL.slice(0, 7);
    Promise.all([month(prevMonth(m)), month(m)]).then(function (ls) {
      var past = [].concat(ls[0], ls[1]).filter(function (x) { return x.date < REAL; }).reverse();
      var rows = past.map(function (x) {
        var s = load("cmx-day-" + x.date, null), mark = !s || !s.done ? "" : s.win ? " \u2713" : " \u2715";
        return '<button type="button" class="arow' + (x.date === today ? " on" : "") + '" data-d="' + x.date + '"><span>#' + x.number + " \u00b7 " + nice(x.date) + mark + '</span><span class="badge ' + x.difficulty + '">' + x.difficulty + "</span></button>";
      }).join("");
      var back = isLive() ? "" : '<button type="button" class="btn" id="cmx-back">Back to today</button>';
      $("alist").innerHTML = back + (rows || "<p class=\"note\">No past puzzles yet. Today is #1. You\u2019re early.</p>");
      Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); }; });
      if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
    });
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };
  tick(); setInterval(tick, 60000); show(today);
})();
