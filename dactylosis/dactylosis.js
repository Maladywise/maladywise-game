/* Dactylosis: daily fingerspelling puzzle. A word is fingerspelled one letter at a time in the two-handed manual alphabet
   shared by Auslan, BSL and NZSL. Watch it (replays allowed), type the word. Three tries; each wrong guess gets Wordle-style
   letter colours, then hint 1 = the clue, hint 2 = step mode (go letter by letter at your own pace).
   Puzzles in puzzles/YYYY-MM.json: {date, number, difficulty, word (A-Z only), ms (per letter), clue, why, pearl}.
   Normie mode: puzzles/normie/YYYY-MM.json, everyday words, "n-" storage keys. Missing Normie file -> MW_noNormie.
   Hand images (hands/a.webp...): cropped from "British Sign Language Fingerspelling Poster (Block Shapes)" by Lucy Southwell,
   CC BY-SA 4.0, via Wikimedia Commons. Derived images are shared under CC BY-SA 4.0. Check with dactylosis/check.py. */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "1", TRIES = 3;
  var NORMIE = !!(window.MW_mode && MW_mode() === "normie"), NAME = NORMIE ? "Dactylosis (Normie)" : "Dactylosis", PFX = NORMIE ? "n-" : "", PDIR = NORMIE ? "puzzles/normie/" : "puzzles/";
  var root = document.getElementById("dac");
  if (!document.querySelector("link[data-dac]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "dactylosis.css?v=" + BUILD; l.setAttribute("data-dac", ""); document.head.appendChild(l);
  }
  var CREDIT = 'Hand illustrations adapted from <a href="https://commons.wikimedia.org/wiki/File:British_Sign_Language_Fingerspelling_Poster_(Block_Shapes).png" target="_blank" rel="noopener">a fingerspelling poster</a> by Lucy Southwell, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a> (cropped). Coral is the dominant hand; left-handers mirror it.';
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="dac-eyebrow">Dactylosis</span><span class="badge" id="dac-badge" hidden></span></div>' +
    ' <section class="stage" id="dac-stage" aria-label="Fingerspelled word">' +
    '  <div class="card" id="dac-card"><img id="dac-img" alt="" class="off"><div class="cue" id="dac-cue"></div></div>' +
    '  <div class="dots" id="dac-dots" aria-hidden="true"></div>' +
    '  <div class="ctrls"><button type="button" class="cbtn ghost" id="dac-prev" hidden aria-label="Previous letter">&#9664;</button><button type="button" class="cbtn" id="dac-go">&#9654; Watch</button><button type="button" class="cbtn ghost" id="dac-next" hidden aria-label="Next letter">&#9654;&#9654;</button></div>' +
    '  <p class="spd" id="dac-spd"></p>' +
    ' </section>' +
    ' <div class="pzl" id="dac-play" hidden>' +
    '  <div class="tries"><span class="tl" id="dac-q">What’s the word?</span><span class="vials" id="dac-vials" aria-label="Tries left"></span></div>' +
    '  <div class="msg" id="dac-msg" aria-live="polite"></div>' +
    '  <div class="rows" id="dac-rows"></div>' +
    '  <div class="hints" id="dac-hints"></div>' +
    '  <form class="gform" id="dac-form" autocomplete="off"><input class="gin" id="dac-in" inputmode="text" autocapitalize="characters" autocorrect="off" spellcheck="false" aria-label="Your guess"><button class="btn" type="submit">Guess</button></form>' +
    ' </div>' +
    ' <div class="result" id="dac-result" hidden></div>' +
    ' <p class="note" id="dac-next-note"></p>' +
    ' <details class="learn"><summary>Learn the alphabet</summary><p>The two-handed manual alphabet used in Auslan, British Sign Language and New Zealand Sign Language. Vowels are the fingertips: thumb A, index E, middle I, ring O, little U.</p><div class="chart" id="dac-chart"></div></details>' +
    ' <details class="archive" id="dac-archive"><summary>Past words</summary><div class="alist" id="dac-alist"></div></details>' +
    ' <p class="credit">' + CREDIT + "</p>" +
    ' <p class="note">Fingerspelling is only one small part of sign language. Most words have their own signs. Just for fun and learning; not a substitute for lessons from Deaf teachers.</p>' +
    "</div>";
  var $ = function (id) { return document.getElementById("dac-" + id); };

  // ---------- dates & storage ----------
  function sydToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function nice(d) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var REAL = sydToday(), q = new URLSearchParams(location.search).get("date");
  var today = (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) ? q : REAL;
  function isLive() { return today === REAL; }
  var SKEY = PFX + "dac-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0] });
  var KEY, st, P = null, START = "2026-10-28";
  function loadDay() { KEY = PFX + "dac-day-" + today; st = load(KEY, { picks: [], done: false, win: false, watched: 0 }); }
  loadDay();
  function hand(c) { return BASE + "hands/" + c.toLowerCase() + ".webp"; }

  // ---------- sass (mocks the guess, never anyone) ----------
  function pick(a) { if (a.length < 2) return a[0]; var k = "mw-last-" + a[0].slice(0, 12), last; try { last = sessionStorage.getItem(k); } catch (e) {} var x, n = 0; do { x = a[Math.floor(Math.random() * a.length)]; } while (x === last && ++n < 8); try { sessionStorage.setItem(k, x); } catch (e) {} return x; }
  var SASS = {
    wrong: ["The hands said something else.", "Close your mouth, open your eyes.", "Bold reading. Wrong, but bold.", "That’s a word. Not this word.", "Your fingers were watching, right?", "Plausible. Also wrong.", "Confidently incorrect. A classic.", "The coral hand is disappointed.", "Watch it again. We’ll wait.", "Interesting spelling. Incorrect, though."],
    win: [["First try. Fluent fingers.", "One look and done. Show-off.", "First guess. Suspiciously good.", "Read it like a native. Frame it."], ["Second try. Nicely read.", "Two tries. The colours helped. We saw.", "Got there on two. Solid."], ["Last try. Phew. For everyone.", "Third time. A buzzer-beater.", "Scraped in. A word is a word."]],
    lose: ["The hands win today. Rematch tomorrow.", "Out of tries. Watch it once more, slowly.", "Missed it. It was spelled out for you. Literally.", "Not today. Tomorrow’s word is warming up its fingers."],
    len: function (n) { return "Needs " + n + " letters. Count the dots."; }
  };
  function say(t) { var m = $("msg"); m.textContent = t; m.classList.remove("pop"); void m.offsetWidth; if (t) m.classList.add("pop"); }

  // ---------- Wordle-style colours ----------
  function colours(g, w) {
    var res = [], left = {}, i;
    for (i = 0; i < w.length; i++) { if (g[i] === w[i]) res[i] = "g"; else left[w[i]] = (left[w[i]] || 0) + 1; }
    for (i = 0; i < w.length; i++) { if (res[i]) continue; if (left[g[i]]) { res[i] = "y"; left[g[i]]--; } else res[i] = "x"; }
    return res;
  }
  var EIN = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/></svg>';

  // ---------- the stage ----------
  var timer = null, playing = false, idx = -1;
  function stepMode() { return st.done || st.picks.length >= 2; }
  function cue(html) { var c = $("cue"); if (html == null) { c.hidden = true; return; } c.hidden = false; c.innerHTML = html; }
  function dots(on) {
    var n = P.word.length, h = "";
    for (var i = 0; i < n; i++) h += '<i class="' + (i === on ? "on" : i < on ? "seen" : "") + '"></i>';
    $("dots").innerHTML = h;
  }
  function showLetter(i) {
    var img = $("img"); idx = i; cue(null);
    img.src = hand(P.word[i]); img.classList.remove("off"); dots(i);
    $("prev").disabled = i <= 0; $("next").disabled = i >= P.word.length - 1;
  }
  function stop() { if (timer) clearTimeout(timer); timer = null; playing = false; $("go").disabled = false; }
  function play() {
    if (playing) return;
    stop(); playing = true; $("go").disabled = true;
    if (st.watched && !st.done) { st.watched++; put(KEY, st); } else if (!st.watched) { st.watched = 1; put(KEY, st); }
    var img = $("img"), ms = P.ms || 1100, i = -1;
    img.classList.add("off"); dots(-1);
    cue("<span><b>Ready</b>" + P.word.length + " letters</span>");
    function next() {
      i++;
      if (i >= P.word.length) {
        img.classList.add("off"); dots(P.word.length);
        cue('<span><b>&#10003;</b>' + (st.done ? "That’s the word." : "Type your guess below, or watch again.") + "</span>");
        playing = false; $("go").disabled = false; $("go").innerHTML = "&#8635; Replay"; idx = -1; $("prev").disabled = false; $("next").disabled = false; return;
      }
      showLetter(i);
      timer = setTimeout(function () { img.classList.add("off"); timer = setTimeout(next, Math.round(ms * 0.18)); }, Math.round(ms * 0.82));
    }
    timer = setTimeout(next, 800);
  }
  function step(d) {
    stop();
    var n = P.word.length, i = idx < 0 ? (d > 0 ? 0 : n - 1) : Math.max(0, Math.min(n - 1, idx + d));
    showLetter(i);
  }
  function renderStage() {
    var sm = stepMode();
    $("prev").hidden = !sm; $("next").hidden = !sm;
    $("go").innerHTML = st.watched ? "&#8635; Replay" : "&#9654; Watch";
    $("spd").textContent = (P.ms / 1000).toFixed(1).replace(/\.0$/, "") + " seconds per letter" + (sm ? " · or step through with the arrows" : "") + (st.watched > 1 ? " · watched " + st.watched + " times" : "");
    if (idx < 0) { $("prev").disabled = false; $("next").disabled = false; }
    if (!playing && idx < 0) { $("img").classList.add("off"); dots(-1); cue(st.done ? "<span><b>" + P.word.length + "</b>letters. Replay it, or step through with the arrows.</span>" : "<span><b>" + P.word.length + "</b>letters. Tap Watch when you’re ready.</span>"); }
  }

  // ---------- render ----------
  function rowHTML(g) {
    var c = colours(g, P.word);
    return '<div class="row">' + g.split("").map(function (ch, i) { return '<span class="t ' + c[i] + '">' + ch + "</span>"; }).join("") + "</div>";
  }
  function renderPlay() {
    $("play").hidden = st.done;
    var n = P.word.length, left = TRIES - st.picks.length;
    $("vials").innerHTML = [0, 1, 2].map(function (i) { return '<i class="' + (i < left ? "full" : "used") + '"></i>'; }).join("") + "<b>" + left + " left</b>";
    $("rows").innerHTML = st.picks.map(rowHTML).join("");
    var h = "";
    if (st.picks.length >= 1) h += '<p class="hint"><b>Hint 1.</b> ' + esc(P.clue) + "</p>";
    if (st.picks.length >= 2) h += '<p class="hint"><b>Hint 2.</b> Step mode unlocked. Use the arrows to go letter by letter, at your own pace.</p>';
    $("hints").innerHTML = h;
    var inp = $("in"); inp.maxLength = n; inp.placeholder = new Array(n + 1).join("_ ").trim();
  }
  function sbLink() { return "https://auslan.org.au/dictionary/search/?query=" + encodeURIComponent(P.word.toLowerCase()); }
  function renderResult() {
    var r = $("result");
    if (!st.done) { r.hidden = true; return; }
    var n = st.picks.length;
    var grid = st.picks.map(function (g) { return colours(g, P.word).map(function (c) { return c === "g" ? "🟩" : c === "y" ? "🟨" : "⬜"; }).join(""); }).join("\n");
    var share = NAME + " #" + P.number + (isLive() ? "" : " (archive)") + " · " + P.difficulty + " ✋ " + (st.win ? n : "X") + "/" + TRIES + "\n" + grid + "\nmaladywise.com";
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0, max = Math.max.apply(null, stats.dist.concat([1])), mine = st.win ? n - 1 : 3;
    var word = P.word.charAt(0) + P.word.slice(1).toLowerCase();
    r.hidden = false;
    r.innerHTML = '<p class="verdict ' + (st.win ? "ok" : "no") + '">' + (st.win ? "Read on try " + n + " of " + TRIES : "Not this time") + "</p>" +
      "<h2>" + esc(word) + "</h2>" +
      '<div class="strip">' + P.word.split("").map(function (c) { return '<figure><img src="' + hand(c) + '" alt="Fingerspelled ' + c + '" width="64" height="64" loading="lazy"><figcaption>' + c + "</figcaption></figure>"; }).join("") + "</div>" +
      '<div class="why"><b>' + (NORMIE ? "The word" : "What it means") + "</b><p>" + esc(P.why) + "</p></div>" +
      '<div class="pearl"><b>' + (NORMIE ? "Fun fact" : "Pearl") + "</b><p>" + esc(P.pearl) + "</p></div>" +
      '<p style="margin:0;font-size:14px">Many words have their own sign. <a class="sb" href="' + sbLink() + '" target="_blank" rel="noopener">See how to sign “' + esc(word.toLowerCase()) + "” on Auslan Signbank &#8599;</a></p>" +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Win %</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + stats.best + "</b><span>Best</span></div></div>" +
      '<div class="dist">' + stats.dist.map(function (c, i) { return "<div><span>" + (i < 3 ? i + 1 : "X") + '</span><i class="' + (i === mine && isLive() ? "me" : "") + '" style="width:' + Math.max(8, Math.round(c / max * 100)) + '%">' + c + "</i></div>"; }).join("") + "</div>" +
      '<pre id="dac-share">' + esc(share) + '</pre><button class="btn" type="button" id="dac-copy">Copy result</button>';
    $("copy").onclick = function () {
      var b = this;
      function sel() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, sel); } catch (e) { sel(); }
    };
  }
  function paint() { renderStage(); renderPlay(); renderResult(); }
  function chart() {
    $("chart").innerHTML = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(function (c) { return '<figure><img src="' + hand(c) + '" alt="Fingerspelled ' + c + '" loading="lazy" width="84" height="84"><figcaption>' + c + "</figcaption></figure>"; }).join("");
  }
  function tick() {
    var t = "A new word arrives at midnight, Sydney time.";
    try { var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
      var left = 1440 - ((p[0] % 24) * 60 + p[1]); t = "Next word in " + Math.floor(left / 60) + "h " + (left % 60) + "m. Rest your hands."; } catch (e) {}
    $("next-note").textContent = t;
  }

  // ---------- play ----------
  function finish(win) {
    st.done = true; st.win = win; put(KEY, st);
    if (isLive() && stats.last !== today) {
      var yest = stats.last && dayNum(today) - dayNum(stats.last) === 1;
      stats.played++; if (win) stats.wins++;
      stats.streak = win ? (yest ? stats.streak + 1 : 1) : 0; stats.best = Math.max(stats.best, stats.streak);
      stats.dist[win ? st.picks.length - 1 : 3]++; stats.last = today; put(SKEY, stats);
    }
    if (P.difficulty === "Einstein") {
      say(win ? "⚛️ Einstein solved. Roughly a once-in-50-days word, and you read it. Screenshot this." : "Even Einstein would have asked for a slower replay. Respect for taking on the rare one.");
      if (win && isLive()) { var tro = load("mw-einstein", []); if (!tro.some(function (t) { return t.g === "dactylosis" && t.d === today; })) { tro.push({ g: "dactylosis", d: today }); put("mw-einstein", tro); } }
    } else say(win ? pick(SASS.win[st.picks.length - 1]) : pick(SASS.lose));
  }
  $("form").addEventListener("submit", function (e) {
    e.preventDefault(); if (!P || st.done) return;
    var inp = $("in"), g = inp.value.toUpperCase().replace(/[^A-Z]/g, "");
    if (g.length !== P.word.length) { say(SASS.len(P.word.length)); return; }
    if (st.picks.indexOf(g) >= 0) { say("You already tried that one."); return; }
    st.picks.push(g); inp.value = "";
    if (g === P.word) { finish(true); stop(); idx = -1; paint(); $("result").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (st.picks.length >= TRIES) { finish(false); stop(); idx = -1; paint(); $("result").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    put(KEY, st); say(pick(SASS.wrong)); paint();
  });
  $("in").addEventListener("input", function () { var v = this.value.toUpperCase().replace(/[^A-Z]/g, ""); if (v !== this.value) this.value = v; });
  $("go").onclick = play;
  $("prev").onclick = function () { step(-1); };
  $("next").onclick = function () { step(1); };

  // ---------- load ----------
  var cache = {};
  function month(m) {
    if (!cache[m]) cache[m] = fetch(BASE + PDIR + m + ".json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    return cache[m];
  }
  function prevMonth(m) { var p = m.split("-").map(Number); p[1]--; if (!p[1]) { p[1] = 12; p[0]--; } return p[0] + "-" + ("0" + p[1]).slice(-2); }
  function show(date) {
    stop(); idx = -1;
    today = date; loadDay(); P = null;
    return month(date.slice(0, 7)).then(function (list) {
      P = list.filter(function (x) { return x.date === date; })[0] || null;
      if (!P) {
        $("play").hidden = true; $("result").hidden = true; $("badge").hidden = true; $("stage").hidden = true;
        var msg = date < START ? "Dactylosis opens " + nice(START) + ". Warming up the fingers." : NORMIE && window.MW_noNormie ? null : "Today’s word is still warming up. Back tomorrow.";
        if (msg) say(msg); else { var d = document.createElement("div"); d.innerHTML = MW_noNormie("word"); root.querySelector(".wrap").insertBefore(d.firstChild, $("play")); }
        renderArchive(); return;
      }
      $("stage").hidden = false;
      P.word.split("").forEach(function (c) { var im = new Image(); im.src = hand(c); });
      $("eyebrow").textContent = (isLive() ? "Dactylosis" : "Archive") + " · #" + P.number + " · " + nice(date);
      var b = $("badge"); b.hidden = false; b.className = "badge " + P.difficulty; b.innerHTML = (P.difficulty === "Einstein" ? EIN : "") + P.difficulty; root.classList.toggle("einstein", P.difficulty === "Einstein");
      say("");
      if (!isLive()) say(st.done ? "Archive word. Already read." : "Archive word. Doesn’t count towards your streak.");
      else if (st.done) say(st.win ? "Read it. Come back tomorrow." : "You’ve had your go. Back tomorrow.");
      paint(); renderArchive();
    });
  }
  function renderArchive() {
    var m = REAL.slice(0, 7);
    Promise.all([prevMonth(m) < "2026-10" ? Promise.resolve([]) : month(prevMonth(m)), month(m)]).then(function (ls) {
      var past = [].concat(ls[0], ls[1]).filter(function (x) { return x.date < REAL && x.date >= START; }).reverse();
      var rows = past.map(function (x) {
        var s = load(PFX + "dac-day-" + x.date, null), mark = !s || !s.done ? "" : s.win ? " ✓" : " ✕";
        return '<button type="button" class="arow' + (x.date === today ? " on" : "") + '" data-d="' + x.date + '"><span>#' + x.number + " · " + nice(x.date) + mark + '</span><span class="badge ' + x.difficulty + '">' + x.difficulty + "</span></button>";
      }).join("");
      var back = isLive() ? "" : '<button type="button" class="btn" id="dac-back">Back to today</button>';
      $("alist").innerHTML = back + (rows || '<p class="note">No past words yet. You’re early.</p>');
      Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); }; });
      if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
    });
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };

  chart(); tick(); setInterval(tick, 60000);
  show(today);
})();
