/* Wordemic: guess the five-letter medical word in six tries.
   Puzzles in puzzles/YYYY-MM.json (date, number, difficulty, word, definition). Guess list in words.txt. */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "12";
  var ROWS = 6, LEN = 5;
  // Normie mode: everyday words from puzzles/normie/, stats under "n-" keys.
  var NORMIE = !!(window.MW_mode && MW_mode() === "normie"), PFX = NORMIE ? "n-" : "", PDIR = NORMIE ? "puzzles/normie/" : "puzzles/", NAME = NORMIE ? "Wordemic (Normie)" : "Wordemic";
  var root = document.getElementById("wde");
  if (!document.querySelector("link[data-wde]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "wordemic.css?v=" + BUILD; l.setAttribute("data-wde", ""); document.head.appendChild(l);
  }
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="wde-eyebrow">Wordemic</span><span class="badge" id="wde-badge" hidden></span></div>' +
    ' <div class="msg" id="wde-msg" aria-live="polite"></div>' +
    ' <div class="board" id="wde-board"></div>' +
    ' <div class="pk" id="wde-pk" hidden><button class="pk-tog" type="button" id="wde-pktog" aria-pressed="false" aria-label="Use phone keyboard">\u2328\ufe0f Phone keyboard</button>' +
    '  <form class="pk-form" id="wde-pkform" hidden><input id="wde-pkin" type="text" inputmode="text" autocapitalize="characters" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="go" maxlength="5" aria-label="Type your five-letter guess with your phone keyboard, Enter to submit"></form></div>' +
    ' <div class="kb" id="wde-kb"></div>' +
    ' <div class="result" id="wde-result" hidden></div>' +
    ' <p class="note" id="wde-next"></p>' +
    ' <details class="archive" id="wde-archive"><summary>Past puzzles</summary><div class="alist" id="wde-alist"></div></details>' +
    '</div>';
  var $ = function (id) { return document.getElementById("wde-" + id); };

  // ---------- dates & storage ----------
  function sydToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function nice(d) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var REAL = sydToday(), q = new URLSearchParams(location.search).get("date");
  var today = (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) ? q : REAL;
  function isLive() { return today === REAL; }
  var SKEY = PFX + "wde-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0, 0, 0, 0] });
  var KEY, st, P = null, WORDS = null;
  function loadDay() { KEY = PFX + "wde-day-" + today; st = load(KEY, { guesses: [], done: false, win: false }); }
  loadDay();

  // ---------- sass ----------
  function pick(a) { if (a.length < 2) return a[0]; var k = "mw-last-" + a[0].slice(0, 12), last; try { last = sessionStorage.getItem(k); } catch (e) {} var x, n = 0; do { x = a[Math.floor(Math.random() * a.length)]; } while (x === last && ++n < 8); try { sessionStorage.setItem(k, x); } catch (e) {} return x; }
  var SASS = {
    short: ["Five letters. Count them.", "Not enough letters, doctor.", "Short and wrong. Try again.", "Five. The number is five.", "Missing a letter or two.", "Short-staffed on letters there."],
    invalid: ["Not in the word list. Not even in Latin.", "That's not a word. Dr Google is also confused.", "Made that one up, did we?", "Respectfully: not a word.", "Not a word. Not even an eponym.", "The dictionary has never heard of it.", "That looks like a typo with ambition.", "Nice try. Not a word.", "Even the pharmacist can\u2019t read that.", "That\u2019s doctor handwriting, not a word."],
    win: [["First go? Suspicious. Very suspicious.", "One guess. Witchcraft.", "First try. Buy a lottery ticket.", "One guess. Are you inside our database?"], ["Two guesses. Show-off.", "Two. Outrageously good.", "Second guess. Sharp.", "Two guesses. Smug is allowed."], ["Three. Registrar energy.", "Three guesses. Very tidy.", "Three. Textbook.", "Third guess. Nicely reasoned."], ["Four. Steady hands.", "Four guesses. Safe and solid.", "Four. A good honest day\u2019s work.", "Fourth guess. Calm under pressure."], ["Five. Bit of a sweat, that.", "Five guesses. Cutting it fine.", "Five. Heart rate slightly raised.", "Fifth guess. Got there in the end."], ["Six. Code blue averted.", "Last guess. Living dangerously.", "Six. Pulse restored.", "Final guess. Everyone breathe out."]],
    lose: ["Back to anatomy class.", "The word wins today. Rematch tomorrow.", "Off to the textbook with you.", "Six guesses, no diagnosis. Happens.", "The word escaped. Tomorrow\u2019s another shift.", "Not today. Revise and return.", "Out of guesses. Out of luck.", "The word has been discharged. Without you.", "Stumped. Even the spellchecker is embarrassed."]
  };
  function say(t) { $("msg").textContent = t; }

  // ---------- scoring ----------
  function score(guess, word) {
    var res = ["miss", "miss", "miss", "miss", "miss"], left = {}, i;
    for (i = 0; i < LEN; i++) { if (guess[i] === word[i]) res[i] = "hit"; else left[word[i]] = (left[word[i]] || 0) + 1; }
    for (i = 0; i < LEN; i++) { if (res[i] !== "hit" && left[guess[i]]) { res[i] = "near"; left[guess[i]]--; } }
    return res;
  }

  // ---------- render ----------
  var cur = "", ICON = { Easy: "\ud83d\udfe2", Medium: "\ud83d\udfe1", Hard: "\ud83d\udd34", Genius: "\ud83e\udde0", Einstein: "\u269b\ufe0f" };
  function buildBoard() {
    var h = ""; for (var r = 0; r < ROWS; r++) { h += '<div class="row" data-r="' + r + '">'; for (var c = 0; c < LEN; c++) h += '<div class="tile"></div>'; h += "</div>"; }
    $("board").innerHTML = h;
  }
  function buildKb() {
    var rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm-", "+"];
    $("kb").innerHTML = rows.map(function (r) {
      return '<div class="kr">' + r.split("").map(function (k) {
        if (k === "+") return '<button class="key wide" data-k="enter" type="button" aria-label="Submit guess">Enter</button>';
        if (k === "-") return '<button class="key wide" data-k="back" type="button" aria-label="Delete">\u232b</button>';
        return '<button class="key" data-k="' + k + '" type="button">' + k + "</button>";
      }).join("") + "</div>";
    }).join("");
  }
  function paint(flipRow) {
    if (!P) return;
    var word = P.word.toLowerCase(), keys = {}, rank = { miss: 1, near: 2, hit: 3 };
    var rows = $("board").children;
    for (var r = 0; r < ROWS; r++) {
      var g = st.guesses[r], tiles = rows[r].children, sc = g ? score(g, word) : null;
      for (var c = 0; c < LEN; c++) {
        var ch = g ? g[c] : (r === st.guesses.length && !st.done ? cur[c] || "" : "");
        tiles[c].textContent = ch || "";
        tiles[c].className = "tile" + (ch ? " filled" : "") + (sc ? " " + sc[c] : "") + (sc && r === flipRow ? " flip" : "");
        if (sc && r === flipRow) tiles[c].style.animationDelay = (c * 0.12) + "s";
        if (sc && (!keys[g[c]] || rank[sc[c]] > rank[keys[g[c]]])) keys[g[c]] = sc[c];
      }
    }
    Array.prototype.forEach.call($("kb").querySelectorAll(".key"), function (k) {
      var v = k.getAttribute("data-k"); k.className = "key" + (v.length > 1 ? " wide" : "") + (keys[v] ? " " + keys[v] : "");
    });
    $("kb").hidden = st.done || pkOn;
    $("pk").hidden = st.done;
    pkSync();
    renderResult();
  }
  function renderResult() {
    var r = $("result");
    if (!st.done) { r.hidden = true; return; }
    var word = P.word.toLowerCase();
    var grid = st.guesses.map(function (g) { return score(g, word).map(function (s) { return s === "hit" ? "\ud83d\udfe9" : s === "near" ? "\ud83d\udfe8" : "\u2b1c"; }).join(""); }).join("\n");
    var share = NAME + " #" + P.number + (isLive() ? "" : " (archive)") + " \u00b7 " + P.difficulty + " " + ICON[P.difficulty] + "  " + (st.win ? st.guesses.length : "X") + "/6\n" + grid + "\nmaladywise.com";
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0, max = Math.max.apply(null, stats.dist.concat([1])), mine = st.win ? st.guesses.length - 1 : 6;
    r.hidden = false;
    r.innerHTML = "<h2>" + P.word + '</h2><p class="def">' + P.definition + "</p>" +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Win %</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + stats.best + "</b><span>Best</span></div></div>" +
      '<div class="dist">' + stats.dist.map(function (n, i) { return "<div><span>" + (i < 6 ? i + 1 : "X") + '</span><i class="' + (i === mine && isLive() ? "me" : "") + '" style="width:' + Math.max(8, Math.round(n / max * 100)) + '%">' + n + "</i></div>"; }).join("") + "</div>" +
      '<pre id="wde-share">' + share + '</pre><button class="btn" type="button" id="wde-copy">Copy result</button>';
    $("copy").onclick = function () {
      var b = this;
      function sel() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, sel); } catch (e) { sel(); }
    };
  }
  function tick() {
    var t = "A new word arrives at midnight, Sydney time.";
    try { var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
      var left = 1440 - (p[0] * 60 + p[1]); t = "Next word in " + Math.floor(left / 60) + "h " + (left % 60) + "m. Go hydrate."; } catch (e) {}
    $("next").textContent = t;
  }

  // ---------- input ----------
  function shake() { var row = $("board").children[st.guesses.length]; row.classList.remove("shake"); void row.offsetWidth; row.classList.add("shake"); }
  function finish(win) {
    st.done = true; st.win = win; put(KEY, st);
    if (isLive() && stats.last !== today) {
      var yest = stats.last && dayNum(today) - dayNum(stats.last) === 1;
      stats.played++; if (win) stats.wins++;
      stats.streak = win ? (yest ? stats.streak + 1 : 1) : 0; stats.best = Math.max(stats.best, stats.streak);
      stats.dist[win ? st.guesses.length - 1 : 6]++; stats.last = today; put(SKEY, stats);
    }
    if (P.difficulty === "Einstein") {
      say(win ? "\u269b\ufe0f Einstein solved. Roughly a once-in-50-days puzzle, and you nailed it. Screenshot this." : "It was " + P.word + ". Even Einstein needed a few goes. Respect for taking on the rare one.");
      if (win && isLive()) { var tro = load(PFX + "mw-einstein", []); if (!tro.some(function (t) { return t.g === "wordemic" && t.d === today; })) { tro.push({ g: "wordemic", d: today }); put(PFX + "mw-einstein", tro); } }
    } else say(win ? pick(SASS.win[st.guesses.length - 1]) : "It was " + P.word + ". " + pick(SASS.lose));
  }
  function press(k) {
    if (!P || st.done || !WORDS) return;
    if (k === "back") { cur = cur.slice(0, -1); say(""); paint(); return; }
    if (k === "enter") {
      if (cur.length < LEN) { say(pick(SASS.short)); shake(); return; }
      var sw = window.MW_swear && MW_swear(cur); if (sw) { say(sw); shake(); return; }
      if (!WORDS.__any && !WORDS[cur] && cur !== P.word.toLowerCase()) { say(pick(SASS.invalid)); shake(); return; }
      st.guesses.push(cur); cur = ""; say("");
      var win = st.guesses[st.guesses.length - 1] === P.word.toLowerCase();
      if (win || st.guesses.length >= ROWS) finish(win); else put(KEY, st);
      paint(st.guesses.length - 1); return;
    }
    if (/^[a-z]$/.test(k) && cur.length < LEN) { cur += k; paint(); }
  }
  $("kb").addEventListener("click", function (e) { var b = e.target.closest(".key"); if (b) { press(b.getAttribute("data-k")); b.blur(); } });
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target && e.target.tagName; if (t === "INPUT" || t === "TEXTAREA") return;
    if (document.querySelector(".scrim")) return;
    var root2 = document.getElementById("game"); if (root2 && root2.hidden) return;
    if (e.key === "Enter") { press("enter"); e.preventDefault(); }
    else if (e.key === "Backspace") press("back");
    else if (/^[a-zA-Z]$/.test(e.key)) press(e.key.toLowerCase());
  });

  // ---------- phone keyboard ----------
  // Real <input> so the phone's own keyboard (incl. glide typing) can be used. Mirrors `cur`; shared pref "mw-phonekb".
  var pkOn = false, pkComp = false, pkIn = $("pkin");
  try { pkOn = localStorage.getItem("mw-phonekb") === "1"; } catch (e) {}
  function pkSync() { var w = cur.toUpperCase(); if (pkOn && !pkComp && pkIn.value.toUpperCase() !== w) pkIn.value = w; }
  function pkApply(focus) {
    $("pkform").hidden = !pkOn; $("pktog").setAttribute("aria-pressed", pkOn ? "true" : "false"); $("pktog").classList.toggle("on", pkOn);
    if (P && !st.done) $("kb").hidden = pkOn;
    if (pkOn) { pkIn.value = cur.toUpperCase(); if (focus) pkIn.focus(); } else pkIn.blur();
  }
  function pkInput() {
    if (!P || st.done) { pkIn.value = ""; return; }
    var v = pkIn.value.toLowerCase().replace(/[^a-z]/g, "").slice(0, LEN);
    if (v !== cur) { cur = v; say(""); }
    paint();
  }
  pkIn.addEventListener("input", pkInput);
  pkIn.addEventListener("compositionstart", function () { pkComp = true; });
  pkIn.addEventListener("compositionend", function () { pkComp = false; pkInput(); });
  $("pkform").addEventListener("submit", function (e) { e.preventDefault(); pkComp = false; pkInput(); press("enter"); pkSync(); });
  $("pktog").onclick = function () { pkOn = !pkOn; try { localStorage.setItem("mw-phonekb", pkOn ? "1" : "0"); } catch (e) {} pkApply(true); };
  $("board").addEventListener("click", function () { if (pkOn && P && !st.done) pkIn.focus(); });
  pkApply(false);

  // ---------- load ----------
  var cache = {};
  function month(m) {
    if (!cache[m]) cache[m] = fetch(BASE + PDIR + m + ".json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    return cache[m];
  }
  function prevMonth(m) { var p = m.split("-").map(Number); p[1]--; if (!p[1]) { p[1] = 12; p[0]--; } return p[0] + "-" + ("0" + p[1]).slice(-2); }
  function show(date) {
    today = date; loadDay(); cur = ""; P = null; say("");
    return month(date.slice(0, 7)).then(function (list) {
      P = list.filter(function (x) { return x.date === date; })[0] || null;
      if (!P) {
        $("kb").hidden = true; $("pk").hidden = true; $("result").hidden = true;
        if (NORMIE && window.MW_noNormie) { say(""); $("board").innerHTML = MW_noNormie("word"); }
        else say("Today\u2019s word is still in triage. Back tomorrow.");
        renderArchive(); return;
      }
      if (!$("board").querySelector(".row")) buildBoard();
      $("eyebrow").textContent = (isLive() ? "Wordemic" : "Archive") + " \u00b7 #" + P.number + " \u00b7 " + nice(date);
      var b = $("badge"); b.hidden = false; b.className = "badge " + P.difficulty; b.innerHTML = (P.difficulty === "Einstein" ? "<svg viewBox=\"0 0 24 24\" width=\"13\" height=\"13\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" aria-hidden=\"true\"><ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"4\"/><ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"4\" transform=\"rotate(60 12 12)\"/><ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"4\" transform=\"rotate(120 12 12)\"/><circle cx=\"12\" cy=\"12\" r=\"1.8\" fill=\"currentColor\"/></svg>" : "") + P.difficulty; root.classList.toggle("einstein", P.difficulty === "Einstein");
      if (!isLive()) say(st.done ? "Archive puzzle. Already done." : "Archive puzzle. Doesn't count towards your streak.");
      else if (st.done) say(st.win ? "Solved. Come back tomorrow." : "You've had your go. Back tomorrow.");
      paint(); renderArchive();
    });
  }
  function renderArchive() {
    var m = REAL.slice(0, 7);
    Promise.all([month(prevMonth(m)), month(m)]).then(function (ls) {
      var past = [].concat(ls[0], ls[1]).filter(function (x) { return x.date < REAL; }).reverse();
      var rows = past.map(function (x) {
        var s = load(PFX + "wde-day-" + x.date, null), mark = !s || !s.done ? "" : s.win ? " \u2713" : " \u2715";
        return '<button type="button" class="arow' + (x.date === today ? " on" : "") + '" data-d="' + x.date + '"><span>#' + x.number + " \u00b7 " + nice(x.date) + mark + '</span><span class="badge ' + x.difficulty + '">' + x.difficulty + "</span></button>";
      }).join("");
      var back = isLive() ? "" : '<button type="button" class="btn" id="wde-back">Back to today</button>';
      $("alist").innerHTML = back + (rows || '<p class="note">No past puzzles yet. Today is #1. You\u2019re early.</p>');
      Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); }; });
      if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
    });
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };

  buildBoard(); buildKb(); tick(); setInterval(tick, 60000);
  fetch(BASE + "words.txt?v=" + BUILD).then(function (r) { return r.text(); }).then(function (t) {
    WORDS = {}; t.split(/\s+/).forEach(function (w) { if (w) WORDS[w] = 1; });
  }).catch(function () { WORDS = { __any: 1 }; });
  show(today);
})();
