/* Diagnosis Wordle — Malady Wise
   One case per day (Sydney time). Cases live in cases/YYYY-MM.json, each with a "date".
   To add cases: add entries to the right month file. Nothing else needs changing. */
(function () {
  "use strict";
  var script = document.currentScript;
  var BASE = new URL(".", script ? script.src : location.href).href;
  var MAX = 6;

  // ---------- mount ----------
  var root = document.getElementById("dxw");
  if (!root) { root = document.createElement("div"); root.id = "dxw"; script.parentNode.insertBefore(root, script); }
  if (!document.querySelector('link[data-dxw]')) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "game.css"; l.setAttribute("data-dxw", "");
    document.head.appendChild(l);
  }
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="top"><div class="row"><span class="eyebrow" id="dxw-eyebrow">Malady Wise · Daily case</span><span class="badge" id="dxw-badge" hidden></span></div>' +
    '  <h1>Diagnosis Wordle</h1>' +
    '  <p class="sub">Six clues, one diagnosis. Every wrong guess unlocks the next clue.</p></div>' +
    ' <div class="stats" id="dxw-stats"></div>' +
    ' <section class="slip" aria-live="polite">' +
    '  <div class="slip-head"><span class="case-title" id="dxw-title">Loading today’s case…</span><div class="dots" id="dxw-dots"></div></div>' +
    '  <ol class="clues" id="dxw-clues"></ol>' +
    '  <p class="sass" id="dxw-sass"></p>' +
    '  <div class="guesses" id="dxw-guesses"></div>' +
    '  <form id="dxw-form" autocomplete="off" hidden>' +
    '   <label for="dxw-guess" style="position:absolute;left:-9999px">Your diagnosis</label>' +
    '   <input id="dxw-guess" placeholder="Your diagnosis…" autocapitalize="off" spellcheck="false">' +
    '   <button class="btn" type="submit">Guess</button>' +
    '   <button class="btn ghost" type="button" id="dxw-skip">Next clue</button>' +
    '  </form>' +
    '  <div class="result" id="dxw-result" hidden></div>' +
    ' </section>' +
    ' <div class="week" id="dxw-week"></div>' +
    ' <p class="note" id="dxw-next"></p>' +
    ' <p class="note">All cases are fictional. General education, not personal medical advice.</p>' +
    '</div>';
  var $ = function (id) { return document.getElementById("dxw-" + id); };

  // ---------- dates (Sydney) ----------
  function sydToday() {
    try {
      return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    } catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  var q = new URLSearchParams(location.search).get("date");          // preview: ?date=2026-11-01
  var today = (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) ? q : sydToday();
  var dow = new Date(dayNum(today) * 864e5).getUTCDay();

  // ---------- storage (this browser only) ----------
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var KEY = "dxw-day-" + today, SKEY = "dxw-stats-v2";
  var st = load(KEY, { revealed: 1, wrong: [], done: false, win: false });
  var stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0, 0, 0, 0] });
  var C = null;

  // ---------- sass ----------
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var SASS = {
    wrong: ["Yeah, nah.", "Respectfully: no.", "Bold choice. Wrong, but bold.", "The patient would like a second opinion.",
      "That’s a no from the consultant.", "Interesting. Incorrect, but interesting.", "Swing and a miss.",
      "Not even on the differential, mate.", "Back to the textbook.", "Close the tabs, open your eyes."],
    close: ["Warm. Annoyingly warm.", "Right neighbourhood, wrong house.", "So close the patient almost felt better.",
      "Nearly. Be more specific."],
    nonsense: ["That’s not a diagnosis, that’s a sneeze.", "Keyboard mash isn’t a differential.",
      "I’m going to pretend you didn’t type that.", "Autocorrect can’t save you here."],
    repeat: ["You already tried that. Bold strategy.", "Same guess, same answer: no."],
    skip: ["Tactical retreat. Respect.", "Fair. Here’s another clue.", "Calling for backup. Wise."],
    vague: [
      [/^(a )?(virus|viral|viral illness|infection|a bug|bug|gastro)$/, "“A virus” is what we say when we don’t know. Try harder."],
      [/^(stress|anxiety|anxious|burnout|depression)$/, "Blaming stress? Very 5 pm on a Friday of you."],
      [/^(old age|ageing|aging|getting old|age)$/, "“Getting old” isn’t a diagnosis. Ask any 90-year-old."],
      [/^(dehydration|dehydrated)$/, "Have a glass of water and try again."],
      [/^(idk|dunno|no idea|pass|not sure|unknown|no clue|\?+)$/, "Honesty. Refreshing. Still wrong."],
      [/^(covid|covid 19|covid-19|coronavirus|long covid)$/, "Not everything is COVID. Some things are just interesting."],
      [/^(cancer|tumour|tumor|malignancy|a tumour)$/, "Too broad. Which one? Where? Why?"],
      [/^(lupus|sle)$/, "Lupus. The classic hedge. Not today."],
      [/^(google|dr google|chatgpt|ai|claude)$/, "Dr Google has left the chat."],
      [/^(fatigue|tired|tiredness|unwell|sick|pain)$/, "That’s a symptom, not a diagnosis."],
      [/^(hypochondria|hypochondriac|faking|malingering|psychosomatic|its in their head|in their head)$/, "Careful. The fictional patient is offended."],
      [/^(death|dead|dying)$/, "Dark. Also wrong."]
    ],
    win: { 1: "First clue? Genius, or you’ve seen this before. Insufferable either way.",
      2: "Two clues. Your registrar is shook.", 3: "Three clues. The consultant nods slightly.",
      4: "Got there. That’s what counts.", 5: "Scraped in like a 4:59 pm Friday referral.",
      6: "Last clue. A diagnostic buzzer-beater." },
    lose: ["Stumped. The patient’s fictional. Your pride isn’t.", "The case wins today. Rematch tomorrow.",
      "Out of clues. Off to the library with you."]
  };
  var STOP = { syndrome: 1, disease: 1, deficiency: 1, poisoning: 1, acute: 1, chronic: 1, primary: 1, secondary: 1, the: 1, and: 1, with: 1, infection: 1, disorder: 1, type: 1 };
  function norm(s) {
    return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[’']/g, "'")
      .replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
  }
  function tokens(s) { return norm(s).replace(/'/g, "").split(" ").filter(function (w) { return w.length >= 4 && !STOP[w]; }); }
  function isNonsense(n) {
    var bare = n.replace(/[^a-z]/g, "");
    return bare.length < 2 || !/[aeiouy]/.test(bare) || /^(.)\1+$/.test(bare) || /(asdf|qwer|zxcv|hjkl|sdfg)/.test(bare);
  }
  function isClose(n) {
    var g = tokens(n); if (!g.length) return false;
    var pool = {}; C.accept.concat([C.answer]).forEach(function (a) { tokens(a).forEach(function (t) { pool[t] = 1; }); });
    return g.some(function (t) { return pool[t] || Object.keys(pool).some(function (p) { return p.length > 5 && (p.indexOf(t) === 0 || t.indexOf(p) === 0); }); });
  }
  function say(t) { var el = $("sass"); el.textContent = t; el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }

  // ---------- render ----------
  var ICON = { Easy: "🟢", Medium: "🟡", Hard: "🔴", Genius: "🧠" };
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
    var lab = [["Mon", "Easy"], ["Tue", "Easy"], ["Wed", "Medium"], ["Thu", "Medium"], ["Fri", "Hard"], ["Sat", "Hard"], ["Sun", "Genius"]];
    var idx = (dow + 6) % 7;
    $("week").innerHTML = lab.map(function (x, i) { return '<span class="' + (i === idx ? "on" : "") + '">' + x[0] + " · " + x[1] + "</span>"; }).join("");
  }
  function tick() {
    var t = "A new case arrives at midnight, Sydney time.";
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
      var left = 1440 - (p[0] * 60 + p[1]); t = "Next case in " + Math.floor(left / 60) + "h " + (left % 60) + "m.";
    } catch (e) {}
    $("next").textContent = t;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function render(fresh) {
    renderStats(); renderWeek(); tick();
    if (!C) return;
    var date = new Date(dayNum(today) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
    $("eyebrow").textContent = "Malady Wise · #" + C.number + " · " + date;
    var b = $("badge"); b.hidden = false; b.className = "badge " + C.difficulty; b.textContent = C.difficulty;
    $("title").textContent = C.title;
    $("dots").innerHTML = dots().map(function (k) { return '<span class="dot ' + k + '"></span>'; }).join("");
    $("clues").innerHTML = C.clues.map(function (cl, i) {
      return (i < st.revealed || st.done)
        ? '<li class="' + (cl.d ? "data " : "") + (fresh && i === st.revealed - 1 ? "new" : "") + '">' + esc(cl.t) + "</li>"
        : '<li class="locked">Locked</li>';
    }).join("");
    $("guesses").innerHTML = st.wrong.map(function (g) { return "<span>" + esc(g) + "</span>"; }).join("");
    $("form").hidden = st.done;
    var r = $("result");
    if (!st.done) { r.hidden = true; return; }
    var grid = dots().map(function (k) { return k === "hit" ? "🟩" : k === "miss" ? "🟥" : "⬜"; }).join("");
    var share = "Diagnosis Wordle #" + C.number + " · " + C.difficulty + " " + ICON[C.difficulty] + "\n" + grid + "\n" +
      (st.win ? "Solved on clue " + st.revealed + "/6" : "Stumped") + "\nmaladywise.com";
    var max = Math.max.apply(null, stats.dist.concat([1]));
    var mine = st.win ? st.revealed - 1 : 6;
    var dist = stats.dist.map(function (n, i) {
      return '<div><span>' + (i < 6 ? i + 1 : "X") + '</span><i class="' + (i === mine ? "me" : "") + '" style="width:' + Math.max(8, Math.round(n / max * 100)) + '%">' + n + "</i></div>";
    }).join("");
    r.hidden = false;
    r.innerHTML = '<span class="verdict ' + (st.win ? "win" : "lose") + '">' + (st.win ? "Solved on clue " + st.revealed + " of 6" : "Out of clues") + "</span>" +
      "<h2>" + esc(C.answer) + "</h2>" +
      '<p class="pearl"><b>Pearl:</b> ' + esc(C.pearl) + "</p>" +
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
    if (stats.last !== today && !q) {
      var yest = stats.last && dayNum(today) - dayNum(stats.last) === 1;
      stats.played++; if (win) stats.wins++;
      stats.streak = win ? (yest ? stats.streak + 1 : 1) : 0;
      stats.best = Math.max(stats.best, stats.streak);
      stats.dist[win ? st.revealed - 1 : 6]++;
      stats.last = today; put(SKEY, stats);
    }
    say(win ? SASS.win[st.revealed] : pick(SASS.lose));
  }
  function burn(label, line) {
    if (label) st.wrong.push(label);
    if (st.revealed >= MAX) { finish(false); render(); return; }
    st.revealed++; put(KEY, st); say(line); render(true);
  }

  $("form").onsubmit = function (e) {
    e.preventDefault();
    var raw = $("guess").value.trim(); if (!raw) { say("Type something. Anything. Ideally a diagnosis."); return; }
    var n = norm(raw); $("guess").value = "";
    if (C.accept.some(function (a) { return norm(a) === n; }) || norm(C.answer) === n) { finish(true); render(); return; }
    if (st.wrong.some(function (w) { return norm(w) === n; })) { say(pick(SASS.repeat)); return; }
    if (isNonsense(n)) { say(pick(SASS.nonsense)); return; }              // no clue burned
    for (var i = 0; i < SASS.vague.length; i++) if (SASS.vague[i][0].test(n)) { burn(raw, SASS.vague[i][1]); return; }
    burn(raw, isClose(n) ? pick(SASS.close) : pick(SASS.wrong));
  };
  $("skip").onclick = function () { burn(null, pick(SASS.skip)); };

  // ---------- load today's case ----------
  render();
  setInterval(tick, 60000);
  fetch(BASE + "cases/" + today.slice(0, 7) + ".json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (list) {
      C = list.filter(function (c) { return c.date === today; })[0] || null;
      if (!C) { $("title").textContent = "Today’s case is still in triage."; say("Back tomorrow. Adam’s writing more."); return; }
      if (st.done) say(st.win ? "Already solved. Show-off. Come back tomorrow." : "You’ve had your go. Patience is a clinical skill.");
      render();
    })
    .catch(function () { $("title").textContent = "Couldn’t load today’s case."; say("Refresh the page in a minute."); });
})();
