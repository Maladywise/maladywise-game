/* Dxtective \u2014 Malady Wise
   One case per day (Sydney time). Cases live in cases/YYYY-MM.json, each with a "date".
   To add cases: add entries to the right month file. Nothing else needs changing. */
(function () {
  "use strict";
  var script = document.currentScript;
  var BASE = new URL(".", script ? script.src : location.href).href;
  var MAX = 6;
  var BUILD = "2026-10-18b";                 // bump on every release so phones pick up new styles
  // Normie mode ("What am I?"): cases from cases/normie/, stats under "n-" keys, no medical wording.
  var NORMIE = !!(window.MW_mode && MW_mode() === "normie"), PFX = NORMIE ? "n-" : "", CDIR = NORMIE ? "cases/normie/" : "cases/", NAME = NORMIE ? "Dxtective (Normie)" : "Dxtective";

  // ---------- mount ----------
  var root = document.getElementById("dxw");
  if (!root) { root = document.createElement("div"); root.id = "dxw"; script.parentNode.insertBefore(root, script); }
  if (!document.querySelector('link[data-dxw]')) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "game.css?v=" + BUILD; l.setAttribute("data-dxw", "");
    document.head.appendChild(l);
  }
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="top"><div class="row"><span class="eyebrow" id="dxw-eyebrow">Dxtective \u00b7 Daily case</span><span class="badge" id="dxw-badge" hidden></span></div>' +
    (NORMIE ? '  <h1>Dxtective <span class="mw-npill" style="position:relative;top:-4px;margin-left:4px">\ud83d\ude42 Normie</span></h1>' : '  <h1>Dxtective</h1>') +
    (NORMIE ? '  <p class="sub">What am I? Six clues, one thing. Wrong guesses unlock clues.</p></div>' : '  <p class="sub">Six clues. One diagnosis. Wrong guesses unlock clues.</p></div>') +
        ' <section class="slip" aria-live="polite">' +
    '  <div class="slip-head"><span class="case-title" id="dxw-title">' + (NORMIE ? "Loading\u2026" : "Scrubbing in\u2026") + '</span><div class="dots" id="dxw-dots"></div></div>' +
    '  <ol class="clues" id="dxw-clues"></ol>' +
    '  <p class="sass" id="dxw-sass"></p>' +
    '  <div class="guesses" id="dxw-guesses"></div>' +
    '  <form id="dxw-form" autocomplete="off" hidden>' +
    (NORMIE ? '   <label for="dxw-guess" style="position:absolute;left:-9999px">Your answer</label>' : '   <label for="dxw-guess" style="position:absolute;left:-9999px">Your diagnosis</label>') +
    (NORMIE ? '   <input id="dxw-guess" placeholder="What am I?\u2026" autocapitalize="off" spellcheck="false">' : '   <input id="dxw-guess" placeholder="Your diagnosis\u2026" autocapitalize="off" spellcheck="false">') +
    '   <button class="btn" type="submit">Guess</button>' +
    '   <button class="btn ghost" type="button" id="dxw-skip">Next clue</button>' +
    '  </form>' +
    '  <div class="result" id="dxw-result" hidden></div>' +
    ' </section>' +
    ' <div class="stats" id="dxw-stats" hidden></div>' +
    ' <div class="week" id="dxw-week"></div>' +
    ' <p class="note" id="dxw-next"></p>' +
    ' <details class="archive" id="dxw-archive"><summary>' + (NORMIE ? "Past puzzles" : "Past cases") + '</summary><div id="dxw-alist"><p class="note">Loading\u2026</p></div></details>' +
    (NORMIE ? ' <p class="note">Just for fun. Facts checked, egos not.</p>' : ' <p class="note">All cases are fictional. General education, not personal medical advice.</p>') +
    '</div>';
  var $ = function (id) { return document.getElementById("dxw-" + id); };

  // ---------- dates (Sydney) ----------
  function sydToday() {
    try {
      return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    } catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  var REAL = sydToday();                                            // the real date in Sydney
  var q = new URLSearchParams(location.search).get("date");          // preview any day: ?date=2026-11-01
  var today = (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) ? q : REAL;      // the day being shown
  function isLive() { return today === REAL; }

  // ---------- storage (this browser only) ----------
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var SKEY = PFX + "dxw-stats-v2", KEY, st;
  function loadDay() { KEY = PFX + "dxw-day-" + today; st = load(KEY, { revealed: 1, wrong: [], done: false, win: false }); }
  loadDay();
  var stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0, 0, 0, 0] });
  var C = null;

  // ---------- sass ----------
  function pick(a) { if (a.length < 2) return a[0]; var k = "mw-last-" + a[0].slice(0, 12), last; try { last = sessionStorage.getItem(k); } catch (e) {} var x, n = 0; do { x = a[Math.floor(Math.random() * a.length)]; } while (x === last && ++n < 8); try { sessionStorage.setItem(k, x); } catch (e) {} return x; }
  var SASS = {
    wrong: ["Yeah, nah.", "Respectfully: no.", "Bold choice. Wrong, but bold.", "The patient would like a second opinion.", "That\u2019s a no from the consultant.", "Interesting. Incorrect, but interesting.", "Swing and a miss.", "Not even on the differential.", "Back to the textbook.", "Close the tabs, open your eyes.", "The nurse is quietly shaking her head.", "Even the med student looks worried.", "Confidently incorrect. A classic.", "That\u2019s a diagnosis. Just not this one.", "Plausible. Also wrong.", "Somewhere a pathologist sighed.", "No. But keep that energy for the next clue.", "The fictional patient has questions.", "Wrong ward, doctor.", "Lovely guess. Shame about the accuracy.", "Not quite the vibe of this case.", "The exam board would like a word.", "That\u2019s a horse. This might be a zebra.", "Strong opening. Wrong ending.", "Nope. Read the clues again. Slowly.", "Your differential needs a differential.", "Cross that one off the whiteboard.", "Incorrect, with conviction.", "Ambitious. Unfounded, but ambitious.", "Not this time. The clues are trying to help."],
    close: ["Warm. Annoyingly warm.", "Right neighbourhood, wrong house.", "So close the patient almost felt better.", "Nearly. Be more specific.", "Same chapter, wrong page.", "Getting warmer. Narrow it down.", "Close. The examiner wants the exact term.", "Right system, wrong diagnosis.", "Ooh. Almost. Sharpen it.", "You\u2019re circling it. Land the plane.", "Nearly there. One more step.", "Correct family. Wrong sibling."],
    nonsense: ["That\u2019s not a diagnosis, that\u2019s a sneeze.", "Keyboard mash isn\u2019t a differential.", "I\u2019m going to pretend you didn\u2019t type that.", "Autocorrect can\u2019t save you here.", "Was that a diagnosis or a cat on the keyboard?", "Not a word. Not in any textbook, anyway.", "That\u2019s a password, not a diagnosis.", "Bold use of the alphabet.", "The coding department can\u2019t bill that.", "We\u2019ve consulted the dictionary. It declined to comment."],
    repeat: ["You already tried that. Bold strategy.", "Same guess, same answer: no.", "D\u00e9j\u00e0 vu. Still wrong.", "Repeating it won\u2019t make it true.", "Groundhog Day. Try something new.", "Still no. It hasn\u2019t changed in the last minute."],
    skip: ["Tactical retreat. Respect.", "Fair. Here\u2019s another clue.", "Calling for backup. Wise.", "Asking for more history. Very thorough.", "Ordering more tests. Classic.", "Fair enough. More data incoming.", "Skipping. The patient waits patiently.", "Next clue, coming right up."],
    vague: [
      [/^(a )?(virus|viral|viral illness|infection|a bug|bug|gastro)$/, "\u201cA virus\u201d is what we say when we don\u2019t know. Try harder."],
      [/^(stress|anxiety|anxious|burnout|depression)$/, "Blaming stress? Very 5 pm on a Friday of you."],
      [/^(old age|ageing|aging|getting old|age)$/, "\u201cGetting old\u201d isn\u2019t a diagnosis. Ask any 90-year-old."],
      [/^(dehydration|dehydrated)$/, "Have a glass of water and try again."],
      [/^(idk|dunno|no idea|pass|not sure|unknown|no clue|\?+)$/, "Honesty. Refreshing. Still wrong."],
      [/^(covid|covid 19|covid-19|coronavirus|long covid)$/, "Not everything is COVID. Some things are just interesting."],
      [/^(cancer|tumour|tumor|malignancy|a tumour)$/, "Too broad. Which one? Where? Why?"],
      [/^(lupus|sle)$/, "Lupus. The classic hedge. Not today."],
      [/^(google|dr google|chatgpt|ai|claude)$/, "Dr Google has left the chat."],
      [/^(fatigue|tired|tiredness|unwell|sick|pain)$/, "That\u2019s a symptom, not a diagnosis."],
      [/^(hypochondria|hypochondriac|faking|malingering|psychosomatic|its in their head|in their head)$/, "Careful. The fictional patient is offended."],
      [/^(death|dead|dying)$/, "Dark. Also wrong."]
    ],
    win: {"1": ["First clue? Genius, or you\u2019ve seen this before. Insufferable either way.", "One clue. Are you the examiner?", "First clue. Put that on your CV.", "One and done. Suspiciously good."], "2": ["Two clues. Your registrar is shook.", "Two clues. Frankly showing off.", "Second clue. Sharp as a scalpel.", "Two clues. The students are taking notes."], "3": ["Three clues. The consultant nods slightly.", "Three clues. Textbook work.", "Third clue. Solid clinical reasoning.", "Three clues. Very respectable."], "4": ["Got there. That\u2019s what counts.", "Four clues. Steady and safe.", "Four clues. The patient is grateful.", "Fourth clue. Methodical. We like it."], "5": ["Scraped in like a 4:59 pm Friday referral.", "Five clues. A nervous win, but a win.", "Fifth clue. Sweaty palms, correct answer.", "Five clues. Close call. Still counts."], "6": ["Last clue. A diagnostic buzzer-beater.", "Final clue. Living dangerously.", "Six clues. Every test ordered, diagnosis made.", "Last clue. Phew. For everyone."]},
    lose: ["Stumped. The patient\u2019s fictional. Your pride isn\u2019t.", "The case wins today. Rematch tomorrow.", "Out of clues. Off to the library with you.", "Missed it. It happens to the best of us. Usually not this badly.", "The case has been referred on. To tomorrow.", "Diagnosis: humbled. Prognosis: good, with practice.", "Not today. Read the answer, nod wisely, move on.", "The zebra got away.", "Stumped. Even the consultant would have Googled it.", "No diagnosis. Document it and move on."]
  };
  if (NORMIE) SASS = {
    wrong: ["Yeah, nah.", "Respectfully: no.", "Bold choice. Wrong, but bold.", "Interesting. Incorrect, but interesting.", "Swing and a miss.", "Not even close to the shortlist.", "Confidently incorrect. A classic.", "Plausible. Also wrong.", "No. But keep that energy for the next clue.", "Lovely guess. Shame about the accuracy.", "Strong opening. Wrong ending.", "Nope. Read the clues again. Slowly.", "Cross that one off.", "Incorrect, with conviction.", "Ambitious. Unfounded, but ambitious.", "Not this time. The clues are trying to help.", "That’s a thing. Just not this thing.", "Somewhere a quizmaster sighed.", "Wrong answer, right attitude.", "The pub quiz team is quietly shaking their heads.", "Nice try. I’m still a mystery.", "Not me. I’m offended you’d think so."],
    close: ["Warm. Annoyingly warm.", "Right neighbourhood, wrong house.", "Nearly. Be more specific.", "Same chapter, wrong page.", "Getting warmer. Narrow it down.", "Ooh. Almost. Sharpen it.", "You’re circling it. Land the plane.", "Nearly there. One more step.", "Correct family. Wrong sibling."],
    nonsense: ["That’s not an answer, that’s a sneeze.", "I’m going to pretend you didn’t type that.", "Autocorrect can’t save you here.", "Was that a guess or a cat on the keyboard?", "That’s a password, not an answer.", "Bold use of the alphabet.", "We’ve consulted the dictionary. It declined to comment."],
    repeat: ["You already tried that. Bold strategy.", "Same guess, same answer: no.", "Déjà vu. Still wrong.", "Repeating it won’t make it true.", "Groundhog Day. Try something new.", "Still no. It hasn’t changed in the last minute."],
    skip: ["Tactical retreat. Respect.", "Fair. Here’s another clue.", "Phoning a friend. Wise.", "Fair enough. More clues incoming.", "Next clue, coming right up.", "Asking the audience. Classic."],
    vague: [
      [/^(idk|dunno|no idea|pass|not sure|unknown|no clue|\?+)$/, "Honesty. Refreshing. Still wrong."],
      [/^(google|chatgpt|ai|claude|wikipedia)$/, "Search engines have left the chat."],
      [/^(a thing|thing|something|stuff|an animal|animal|a place|place|a person|person|food|a food|a country|country|a film|film|a movie|movie)$/, "Technically true. Uselessly vague. Be specific."],
      [/^(you|me|yourself|myself)$/, "Deep. Also wrong."]
    ],
    win: {"1": ["First clue? Genius, or you’ve seen this before. Insufferable either way.", "One clue. Are you the quizmaster?", "First clue. Put that on your CV.", "One and done. Suspiciously good."], "2": ["Two clues. Frankly showing off.", "Second clue. Sharp.", "Two clues. The pub quiz team wants you.", "Two clues. Smug is allowed."], "3": ["Three clues. Very respectable.", "Third clue. Solid work.", "Three clues. A tidy solve.", "Three clues. Nicely reasoned."], "4": ["Got there. That’s what counts.", "Four clues. Steady and safe.", "Fourth clue. Methodical. We like it.", "Four clues. Slow and sure."], "5": ["Five clues. A nervous win, but a win.", "Fifth clue. Sweaty palms, correct answer.", "Five clues. Close call. Still counts.", "Scraped in. A win is a win."], "6": ["Last clue. A buzzer-beater.", "Final clue. Living dangerously.", "Six clues. Every clue used, mystery solved.", "Last clue. Phew. For everyone."]},
    lose: ["Stumped. Your pride took a hit.", "The puzzle wins today. Rematch tomorrow.", "Out of clues. Off to the encyclopaedia with you.", "Missed it. It happens to the best of us.", "Not today. Read the answer, nod wisely, move on.", "The mystery got away.", "Stumped. Even the quizmaster would have Googled it.", "No luck today. Tomorrow’s a fresh start."]
  };
  var STOP = { syndrome: 1, disease: 1, deficiency: 1, poisoning: 1, acute: 1, chronic: 1, primary: 1, secondary: 1, the: 1, and: 1, with: 1, infection: 1, disorder: 1, type: 1 };
  function norm(s) {
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[\u2019']/g, "'")
      .replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
  }
  function tokens(s) { return norm(s).replace(/'/g, "").split(" ").filter(function (w) { return w.length >= 4 && !STOP[w]; }); }
  function isNonsense(n) {
    var bare = n.replace(/[^a-z]/g, "");
    return bare.length < 2 || !/[aeiouy]/.test(bare) || /^(.)\1+$/.test(bare) || /(asdf|qwer|zxcv|hjkl|sdfg)/.test(bare);
  }
  function isClose(n) {
    var g = tokens(n); if (!g.length) return false;
    var pool = {}; (C.accept || []).concat([C.answer]).forEach(function (a) { tokens(a).forEach(function (t) { pool[t] = 1; }); });
    return g.some(function (t) { return pool[t] || Object.keys(pool).some(function (p) { return p.length > 5 && (p.indexOf(t) === 0 || t.indexOf(p) === 0); }); });
  }
  function say(t) { var el = $("sass"); el.textContent = t; el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }

  // ---------- render ----------
  var ICON = { Easy: "\ud83d\udfe2", Medium: "\ud83d\udfe1", Hard: "\ud83d\udd34", Genius: "\ud83e\udde0", Einstein: "\u269b\ufe0f" };
  function dots() {
    return Array.from({ length: MAX }, function (_, i) {
      if (st.done && st.win && i === st.revealed - 1) return "hit";
      if (i < st.revealed - 1 || (st.done && !st.win && i < st.revealed)) return "miss";
      return "";
    });
  }
  function renderStats() {
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0;
    $("stats").innerHTML = [["Played", stats.played], ["Win %", pct], ["Streak", stats.streak], ["Best", stats.best]]
      .map(function (x) { return '<div class="stat"><b>' + x[1] + '</b><span>' + x[0] + '</span></div>'; }).join("");
  }
  function renderWeek() {
    $("week").textContent = "Easy Mon\u2013Tue \u00b7 Medium Wed\u2013Thu \u00b7 Hard Fri\u2013Sat \u00b7 Genius Sun";
  }
  function tick() {
    var t = NORMIE ? "A new puzzle arrives at midnight, Sydney time." : "A new case arrives at midnight, Sydney time.";
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
      var left = 1440 - (p[0] * 60 + p[1]); t = NORMIE ? "Next puzzle in " + Math.floor(left / 60) + "h " + (left % 60) + "m. Go touch grass." : "Next case in " + Math.floor(left / 60) + "h " + (left % 60) + "m. Go see a real patient.";
    } catch (e) {}
    $("next").textContent = t;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function render(fresh) {
    renderStats(); renderWeek(); tick();
    if (!C) return;
    var date = new Date(dayNum(today) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
    $("eyebrow").textContent = (isLive() ? "Dxtective" : "Archive") + " \u00b7 #" + C.number + " \u00b7 " + date;
    var b = $("badge"); b.hidden = false; b.className = "badge " + C.difficulty; b.innerHTML = (C.difficulty === "Einstein" ? "<svg viewBox=\"0 0 24 24\" width=\"13\" height=\"13\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" aria-hidden=\"true\"><ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"4\"/><ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"4\" transform=\"rotate(60 12 12)\"/><ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"4\" transform=\"rotate(120 12 12)\"/><circle cx=\"12\" cy=\"12\" r=\"1.8\" fill=\"currentColor\"/></svg>" : "") + C.difficulty; root.classList.toggle("einstein", C.difficulty === "Einstein");
    $("title").textContent = C.title;
    $("dots").innerHTML = dots().map(function (k) { return '<span class="dot ' + k + '"></span>'; }).join("");
    var shown = st.done ? C.clues.length : st.revealed, left = C.clues.length - shown;
    $("clues").innerHTML = C.clues.slice(0, shown).map(function (cl, i) {
      return '<li class="' + (cl.d ? "data " : "") + (fresh && i === shown - 1 ? "new" : "") + '">' + esc(cl.t) + "</li>";
    }).join("") + (left ? '<li class="more">\ud83d\udd12 ' + left + " more clue" + (left > 1 ? "s" : "") + " locked</li>" : "");
    $("guesses").innerHTML = st.wrong.map(function (g) { return "<span>" + esc(g) + "</span>"; }).join("");
    $("form").hidden = st.done;
    $("stats").hidden = !st.done;
    var r = $("result");
    if (!st.done) { r.hidden = true; return; }
    var grid = dots().map(function (k) { return k === "hit" ? "\ud83d\udfe9" : k === "miss" ? "\ud83d\udfe5" : "\u2b1c"; }).join("");
    var share = NAME + " #" + C.number + (isLive() ? "" : " (archive)") + " \u00b7 " + C.difficulty + " " + ICON[C.difficulty] + "\n" + grid + "\n" +
      (st.win ? "Solved on clue " + st.revealed + "/6" : "Stumped") + "\nmaladywise.com";
    var max = Math.max.apply(null, stats.dist.concat([1]));
    var mine = st.win ? st.revealed - 1 : 6;
    var dist = stats.dist.map(function (n, i) {
      return '<div><span>' + (i < 6 ? i + 1 : "X") + '</span><i class="' + (i === mine ? "me" : "") + '" style="width:' + Math.max(8, Math.round(n / max * 100)) + '%">' + n + "</i></div>";
    }).join("");
    r.hidden = false;
    r.innerHTML = '<span class="verdict ' + (st.win ? "win" : "lose") + '">' + (st.win ? "Solved on clue " + st.revealed + " of 6" : "Out of clues") + "</span>" +
      "<h2>" + esc(C.answer) + "</h2>" +
      (!NORMIE || C.pearl ? '<p class="pearl"><b>' + (NORMIE ? "Fun fact:" : "Pearl:") + '</b> ' + esc(C.pearl) + "</p>" : "") +
      (!NORMIE && /^\/[a-z0-9\/-]+\/$/.test(C.fact || "") ? '<div class="share"><a class="btn ghost" style="text-decoration:none" href="' + esc(C.fact) + '">Read the fact sheet ›</a></div>' : "") +
      '<div class="dist" aria-label="Your solve history">' + dist + "</div>" +
      '<pre class="sharetext" id="dxw-sharetext">' + esc(share) + "</pre>" +
      '<div class="share"><button class="btn" type="button" id="dxw-copy">Copy result</button></div>';
    $("copy").onclick = function () {
      var btn = this;
      function sel() { var rg = document.createRange(); rg.selectNodeContents($("sharetext")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); btn.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { btn.textContent = "Copied"; }, sel); } catch (e) { sel(); }
    };
  }

  function finish(win) {
    st.done = true; st.win = win; put(KEY, st);
    if (isLive() && stats.last !== today) {
      var yest = stats.last && dayNum(today) - dayNum(stats.last) === 1;
      stats.played++; if (win) stats.wins++;
      stats.streak = win ? (yest ? stats.streak + 1 : 1) : 0;
      stats.best = Math.max(stats.best, stats.streak);
      stats.dist[win ? st.revealed - 1 : 6]++;
      stats.last = today; put(SKEY, stats);
    }
    if (C.difficulty === "Einstein") {
      say(win ? "\u269b\ufe0f Einstein solved. Roughly a once-in-50-days puzzle, and you nailed it. Screenshot this." : "Even Einstein needed a few goes. Respect for taking on the rare one.");
      if (win && isLive()) { var tro = load(PFX + "mw-einstein", []); if (!tro.some(function (t) { return t.g === "dx" && t.d === today; })) { tro.push({ g: "dx", d: today }); put(PFX + "mw-einstein", tro); } }
    } else say(win ? pick(SASS.win[st.revealed]) : pick(SASS.lose));
  }
  function burn(label, line) {
    if (label) st.wrong.push(label);
    if (st.revealed >= MAX) { finish(false); render(); return; }
    st.revealed++; put(KEY, st); say(line); render(true);
  }

  $("form").onsubmit = function (e) {
    e.preventDefault();
    var raw = $("guess").value.trim(); if (!raw) { say(NORMIE ? "Type something. Anything. Ideally a guess." : "Type something. Anything. Ideally a diagnosis."); return; }
var sw0 = window.MW_swear && MW_swear(raw); if (sw0) { $("guess").value = ""; say(sw0); return; }
        var n = norm(raw); $("guess").value = "";
    if ((C.accept || []).some(function (a) { return norm(a) === n; }) || norm(C.answer) === n) { finish(true); render(); return; }
    if (st.wrong.some(function (w) { return norm(w) === n; })) { say(pick(SASS.repeat)); return; }
    if (isNonsense(n)) { say(pick(SASS.nonsense)); return; }              // no clue burned
    for (var i = 0; i < SASS.vague.length; i++) if (SASS.vague[i][0].test(n)) { burn(raw, SASS.vague[i][1]); return; }
    burn(raw, isClose(n) ? pick(SASS.close) : pick(SASS.wrong));
  };
  $("skip").onclick = function () { burn(null, pick(SASS.skip)); };

  // ---------- load today's case ----------
  var cache = {};
  function month(m) {
    if (!cache[m]) cache[m] = fetch(BASE + CDIR + m + ".json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    return cache[m];
  }
  function prevMonth(m) { var p = m.split("-").map(Number); p[1]--; if (!p[1]) { p[1] = 12; p[0]--; } return p[0] + "-" + ("0" + p[1]).slice(-2); }

  function show(date) {
    today = date; loadDay(); C = null;
    $("result").hidden = true; $("sass").textContent = ""; $("title").textContent = "Loading\u2026";
    return month(date.slice(0, 7)).then(function (list) {
      C = list.filter(function (x) { return x.date === date; })[0] || null;
      if (!C && NORMIE) { $("title").textContent = "No puzzle yet"; $("form").hidden = true; $("clues").innerHTML = ""; $("guesses").innerHTML = ""; render(); var r0 = $("result"); r0.hidden = false; r0.innerHTML = window.MW_noNormie ? MW_noNormie("puzzle") : "<p>No Normie puzzle today.</p>"; renderArchive(); return; }
      if (!C) { $("title").textContent = "Today\u2019s case is still in triage."; $("form").hidden = true; say("Back tomorrow. Fresh cases are on the way."); render(); return; }
      if (!isLive()) say(st.done ? "Archive case. You\u2019ve already done this one." : "Archive case. Doesn\u2019t count towards your streak.");
      else if (st.done) say(st.win ? "Already solved. Show-off. Come back tomorrow." : (NORMIE ? "You\u2019ve had your go. Patience is a virtue." : "You\u2019ve had your go. Patience is a clinical skill."));
      render(); renderArchive();
    });
  }

  function renderArchive() {
    var m = REAL.slice(0, 7);
    Promise.all([month(prevMonth(m)), month(m)]).then(function (lists) {
      var past = [].concat(lists[0], lists[1]).filter(function (x) { return x.date < REAL; }).reverse();
      var rows = past.map(function (x) {
        var s = load(PFX + "dxw-day-" + x.date, null), mark = !s || !s.done ? "" : s.win ? " \u2713" : " \u2715";
        var d = new Date(dayNum(x.date) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
        return '<button type="button" class="arow' + (x.date === today ? " on" : "") + '" data-d="' + x.date + '"><span>#' + x.number + " \u00b7 " + d + mark + '</span><span class="badge ' + x.difficulty + '">' + x.difficulty + "</span></button>";
      }).join("");
      var back = isLive() ? "" : '<button type="button" class="btn ghost" id="dxw-back">Back to today\u2019s case</button>';
      $("alist").innerHTML = back + (rows || (NORMIE ? '<p class="note">No past puzzles yet. Today is #1. You\u2019re early.</p>' : '<p class="note">No past cases yet. Today is #1. You\u2019re early.</p>'));
      Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) {
        b.onclick = function () { show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); };
      });
      if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
    });
  }

  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };
  render();
  setInterval(tick, 60000);
  show(today);
})();
