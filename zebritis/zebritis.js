/* Zebritis: name a correct answer; the rarer it is, the more it scores. Three prompts a day (Sydney time).
   Puzzles in puzzles/YYYY-MM.json: [{date, number, difficulty, prompts:[{q, a:[[name, tier, [synonyms]]...]}]}]
   Tiers: 1 horse, 3 pony, 6 donkey, 10 zebra, 20 unicorn (one per prompt). */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "6", TRIES = 3, WIN = 10;
  var root = document.getElementById("zbr");
  if (!document.querySelector("link[data-zbr]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "zebritis.css?v=" + BUILD; l.setAttribute("data-zbr", ""); document.head.appendChild(l);
  }
  var TIER = {
    1: { e: "\ud83d\udc34", n: "Horse", m: ["Horse. Textbook, if a little predictable.", "Horse. Correct, and so is everyone else.", "Horse. The waiting room thanks you.", "Horse. Safe. Sensible. One point.", "Horse. Common things are common.", "Horse. Your GP supervisor would approve."] },
    3: { e: "\ud83d\udc0e", n: "Pony", m: ["Pony. Respectable.", "Pony. Off the beaten track, slightly.", "Pony. Registrar-level.", "Pony. A little less obvious. Nice.", "Pony. Good thinking.", "Pony. Above average."] },
    6: { e: "\ud83e\udecf", n: "Donkey", m: ["Donkey. Now we\u2019re talking.", "Donkey. Stubbornly obscure. Love it.", "Donkey. Consultant-level recall.", "Donkey. That\u2019s deep in the textbook.", "Donkey. Rare-ish. Lovely.", "Donkey. Someone stayed for the lecture."] },
    10: { e: "\ud83e\udd93", n: "Zebra", m: ["Zebra! Hoofbeats, but stripes.", "Zebra! Someone read the footnotes.", "Zebra! Frame it. Then go outside.", "Zebra! That\u2019s a case report.", "Zebra! The registrar is googling it.", "Zebra! Absolute stripes."] },
    20: { e: "\ud83e\udd84", n: "Unicorn", m: ["UNICORN! The single rarest answer. Mythical.", "Unicorn! Nobody else will get that. Probably.", "Unicorn! That\u2019s not a diagnosis, that\u2019s a legend.", "Unicorn! Write it up. Submit it. Retire.", "Unicorn! The textbook authors are taking notes."] }
  };
  var MISS = ["Not on our list. Try another.", "Hmm, not one we\u2019ve got. Another?", "Not on the list. Could be right, could be a guess. Try again.", "Nope. Think wider.", "Not on our list. Might be true, but not today.", "No match. Try a different angle.", "Not one of ours. Next.", "Not on the list. Think about mechanisms.", "No luck. Try another system.", "Not on our list. Spelling check?"];
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="zbr-eyebrow">Zebritis</span><span class="badge" id="zbr-badge"></span></div>' +
    ' <p class="legend"><span>\ud83d\udc34 1</span><span>\ud83d\udc0e 3</span><span>\ud83e\udecf 6</span><span>\ud83e\udd93 10</span><span>\ud83e\udd84 20</span></p>' +
    ' <div class="prog" id="zbr-prog"></div>' +
    ' <div class="zcard" id="zbr-card"></div>' +
    ' <div class="result" id="zbr-result" hidden></div>' +
    ' <p class="note" id="zbr-next"></p>' +
    ' <details class="archive" id="zbr-archive"><summary>Past puzzles</summary><div class="alist" id="zbr-alist"></div></details>' +
    "</div>";
  var $ = function (id) { return document.getElementById("zbr-" + id); };

  function sydToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function nice(d) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pick(a) { if (a.length < 2) return a[0]; var k = "mw-last-" + a[0].slice(0, 12), last; try { last = sessionStorage.getItem(k); } catch (e) {} var x, n = 0; do { x = a[Math.floor(Math.random() * a.length)]; } while (x === last && ++n < 8); try { sessionStorage.setItem(k, x); } catch (e) {} return x; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  var REAL = sydToday(), qd = new URLSearchParams(location.search).get("date");
  var day = (qd && /^\d{4}-\d{2}-\d{2}$/.test(qd)) ? qd : REAL;
  function isLive() { return day === REAL; }
  var SKEY = "zbr-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0, 0] });
  var KEY, st, P = null, cache = {};
  function loadDay() { KEY = "zbr-day-" + day; st = load(KEY, { i: 0, picks: [], tries: [], done: false, win: false }); }

  // ---------- matching ----------
  var STOP = /\b(the|a|an|disease|syndrome|sign|of|deficiency)\b/g;
  function norm(s) {
    return String(s).toLowerCase().replace(/[\u2019']/g, "").replace(/[\u00e0-\u00e5]/g, "a").replace(/[\u00e8-\u00eb]/g, "e").replace(/[\u00ec-\u00ef]/g, "i").replace(/[\u00f2-\u00f6]/g, "o").replace(/[\u00f9-\u00fc]/g, "u")
      .replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  }
  function core(s) { var n = norm(s).replace(STOP, " ").replace(/\s+/g, " ").trim(); return n.length > 2 && /s$/.test(n) && !/ss$/.test(n) ? n.slice(0, -1) : n; }
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    var d = [], i, j; for (i = 0; i <= a.length; i++) d[i] = [i];
    for (j = 1; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function match(guess, prompt) {
    var g = core(guess), gs = g.replace(/ /g, ""); if (!g) return -1;
    var best = -1, bestD = 9;
    prompt.a.forEach(function (ans, idx) {
      [ans[0]].concat(ans[2] || []).forEach(function (s) {
        var c = core(s), cs = c.replace(/ /g, "");
        if (!c) return;
        if (c === g || cs === gs) { if (bestD > 0) { best = idx; bestD = 0; } return; }
        var tol = cs.length >= 10 ? 2 : cs.length >= 5 ? 1 : 0, dd = lev(gs, cs);
        if (dd <= tol && dd < bestD) { best = idx; bestD = dd; }
      });
    });
    return best;
  }
  function score() { return st.picks.reduce(function (t, p, i) { return t + (p >= 0 ? P.prompts[i].a[p][1] : 0); }, 0); }

  // ---------- render ----------
  function render(msg, bad) {
    if (!P) return;
    var n = P.prompts.length;
    $("prog").innerHTML = P.prompts.map(function (x, i) {
      var p = st.picks[i]; var t = i < st.picks.length ? (p >= 0 ? TIER[x.a[p][1]].e : "\u2b1c") : "";
      return '<span class="pip' + (i === st.i && !st.done ? " cur" : "") + (i < st.picks.length ? " done" : "") + '">' + (t || i + 1) + "</span>";
    }).join("") + '<span class="tot">' + score() + " pts</span>";
    if (st.done) { $("card").hidden = true; renderResult(); return; }
    $("card").hidden = false; $("result").hidden = true;
    var i = st.i, x = P.prompts[i], answered = st.picks.length > i, tries = st.tries[i] || [];
    var h = '<p class="qn">Prompt ' + (i + 1) + " of " + n + '</p><h2 class="qt">' + esc(x.q) + "</h2>";
    if (!answered) {
      var left = TRIES - tries.length;
      h += '<form class="ask" id="zbr-form" autocomplete="off"><input id="zbr-in" type="text" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type an answer" maxlength="60" aria-label="Your answer"><button type="submit" class="go">Submit</button></form>' +
        '<div class="zmeta"><span class="tries">' + Array(left + 1).join("\u25cf") + Array(tries.length + 1).join("\u25cb") + " " + left + (left === 1 ? " try" : " tries") + ' left</span><button type="button" class="link" id="zbr-skip">Give up</button></div>' +
        (tries.length ? '<p class="missed">Not on the list: ' + tries.map(esc).join(", ") + "</p>" : "") +
        (msg ? '<p class="say' + (bad ? " bad" : "") + '">' + esc(msg) + "</p>" : '<p class="hint">Any correct answer scores. Rarer answers score more.</p>');
    } else {
      var p = st.picks[i];
      h += p >= 0 ? '<div class="hit t' + x.a[p][1] + '"><span class="em">' + TIER[x.a[p][1]].e + '</span><div><b>' + esc(cap(x.a[p][0])) + '</b><span>' + esc(msg || TIER[x.a[p][1]].n + ". +" + x.a[p][1]) + "</span></div><i>+" + x.a[p][1] + "</i></div>"
        : '<div class="hit t0"><span class="em">\u2b1c</span><div><b>No score</b><span>' + esc(msg || "The list wins this round.") + "</span></div><i>+0</i></div>";
      h += reveal(x, p) + '<button type="button" class="next" id="zbr-go">' + (i + 1 < n ? "Next prompt" : "See your score") + "</button>";
    }
    $("card").innerHTML = h;
    var inp = $("in"); if (inp && (bad || (msg === undefined && window.innerWidth > 700))) inp.focus();
  }
  function reveal(x, p) {
    var tiers = [20, 10, 6, 3, 1];
    return '<details class="list"' + (p < 0 ? " open" : "") + '><summary>All answers</summary>' + tiers.map(function (t) {
      var items = x.a.filter(function (a) { return a[1] === t; });
      if (!items.length) return "";
      return '<div class="tier"><span class="th">' + TIER[t].e + " " + TIER[t].n + " \u00b7 " + t + '</span><span class="ti">' + items.map(function (a) { return (x.a.indexOf(a) === p ? "<mark>" + esc(cap(a[0])) + "</mark>" : esc(cap(a[0]))); }).join(", ") + "</span></div>";
    }).join("") + "</details>";
  }
  function renderResult() {
    var r = $("result"), s = score(), max = P.prompts.length * 20;
    var em = P.prompts.map(function (x, i) { var p = st.picks[i]; return p >= 0 ? TIER[x.a[p][1]].e : "\u2b1c"; }).join("");
    var share = "Zebritis #" + P.number + (isLive() ? "" : " (archive)") + "\n" + em + " " + s + "/" + max + "\nmaladywise.com";
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0;
    var verdict = P.prompts.some(function (x, i) { var p = st.picks[i]; return p >= 0 && x.a[p][1] === 20; }) ? "A unicorn sighting. Mythical. Unbearable." : s >= 25 ? "A dazzle of zebras. Unbearable." : s >= 18 ? "Strong stripes. Consultant material." : s >= 10 ? "Solid. A few stripes showing." : s >= 1 ? "Mostly horses. Safe, sensible, forgettable." : "Nothing on the list. Bold strategy.";
    r.hidden = false;
    r.innerHTML = '<p class="em-row">' + em + '</p><p class="score">' + s + "<span>/" + max + '</span></p><p class="verdict">' + esc(verdict) + "</p>" +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>10+ %</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + stats.best + "</b><span>Best</span></div></div>" +
      '<pre id="zbr-share">' + esc(share) + '</pre><button class="btn solid" type="button" id="zbr-copy">Copy result</button>' +
      '<div class="review">' + P.prompts.map(function (x, i) {
        var p = st.picks[i];
        return '<div class="rv"><b>' + esc(x.q) + "</b><span>" + (p >= 0 ? TIER[x.a[p][1]].e + " " + esc(cap(x.a[p][0])) + " (+" + x.a[p][1] + ")" : "\u2b1c No score") + "</span>" + reveal(x, p).replace(" open", "") + "</div>";
      }).join("") + "</div>";
    $("copy").onclick = function () {
      var b = this;
      function selx() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, selx); } catch (e) { selx(); }
    };
  }
  function tick() {
    function f() {
      try {
        var v = {}; new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(new Date()).forEach(function (x) { v[x.type] = +x.value; });
        var left = 86400 - ((v.hour % 24) * 3600 + v.minute * 60 + v.second);
        $("next").textContent = "New prompts in " + Math.floor(left / 3600) + "h " + Math.floor(left % 3600 / 60) + "m. Midnight, Sydney time.";
      } catch (e) { $("next").textContent = "New prompts every day at midnight, Sydney time."; }
    }
    f(); setInterval(f, 30000);
  }

  // ---------- play ----------
  function finish() {
    st.done = true; var s = score(); st.win = s >= WIN; st.uni = P.prompts.some(function (x, i) { var p = st.picks[i]; return p >= 0 && x.a[p][1] === 20; }); st.zeb = P.prompts.some(function (x, i) { var p = st.picks[i]; return p >= 0 && x.a[p][1] === 10; }); put(KEY, st);
    if (isLive() && stats.last !== day) {
      var consecutive = stats.last && dayNum(day) - dayNum(stats.last) === 1;
      stats.played++; if (st.win) stats.wins++;
      stats.streak = consecutive ? stats.streak + 1 : 1; stats.best = Math.max(stats.best, stats.streak);
      stats.dist[s >= 25 ? 0 : s >= 18 ? 1 : s >= 10 ? 2 : s >= 1 ? 3 : 4]++; stats.last = day; put(SKEY, stats);
    }
  }
  function lock(p, msg) { st.picks[st.i] = p; put(KEY, st); render(msg); }
  root.addEventListener("submit", function (e) {
    if (e.target.id !== "zbr-form") return; e.preventDefault();
    var inp = $("in"), g = (inp.value || "").trim(); if (!g || st.done) return;
    var x = P.prompts[st.i], tries = st.tries[st.i] = st.tries[st.i] || [];
    if (tries.some(function (t) { return core(t) === core(g); })) { render("You\u2019ve tried that one.", true); return; }
    var m = match(g, x);
    if (m >= 0) { lock(m, pick(TIER[x.a[m][1]].m)); return; }
    tries.push(g); put(KEY, st);
    if (tries.length >= TRIES) lock(-1, "Three strikes. Here\u2019s what we had.");
    else { render(pick(MISS), true); var c = $("card"); c.classList.remove("shake"); void c.offsetWidth; c.classList.add("shake"); }
  });
  root.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b || !P || st.done) return;
    if (b.id === "zbr-skip") { lock(-1, "Given up. No shame. Some shame."); return; }
    if (b.id === "zbr-go") {
      st.i++; if (st.i >= P.prompts.length) { st.i = P.prompts.length - 1; finish(); }
      put(KEY, st); render(); window.scrollTo({ top: root.getBoundingClientRect().top + scrollY - 70, behavior: "smooth" });
    }
  });

  // ---------- load ----------
  function month(d) { var m = d.slice(0, 7); if (!cache[m]) cache[m] = fetch(BASE + "puzzles/" + m + ".json?v=" + BUILD, { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }); return cache[m]; }
  function show(d) {
    day = d; loadDay();
    month(d).then(function (list) {
      P = list.filter(function (x) { return x.date === d; })[0] || null;
      if (!P) { $("card").innerHTML = '<p class="note">No prompts for this day. The zebras are resting.</p>'; $("prog").innerHTML = ""; $("result").hidden = true; return; }
      $("eyebrow").textContent = (isLive() ? "Zebritis" : "Archive") + " \u00b7 #" + P.number + " \u00b7 " + nice(P.date);
      $("badge").textContent = P.difficulty || ""; $("badge").className = "badge" + (P.difficulty === "Einstein" ? " ein" : "");
      render(); renderArchive();
    });
  }
  function renderArchive() {
    var days = [], n = dayNum(REAL), first = dayNum("2026-10-18");
    for (var k = n - 1; k >= first; k--) days.push(new Date(k * 864e5).toISOString().slice(0, 10));
    var rows = days.map(function (d) {
      var s = load("zbr-day-" + d, null), mark = s && s.done ? " \u2713" : "";
      return '<button type="button" class="arow' + (d === day ? " on" : "") + '" data-d="' + d + '"><span>' + nice(d) + mark + "</span><span>#" + (dayNum(d) - first + 1) + "</span></button>";
    }).join("");
    var back = isLive() ? "" : '<button type="button" class="btn" id="zbr-back">Back to today</button>';
    $("alist").innerHTML = back + (rows || '<p class="note">No past puzzles yet. This is #1.</p>');
    Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); }; });
    if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };
  window.MW_zbrMatch = match;
  tick(); show(day);
})();
