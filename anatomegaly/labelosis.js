/* Anatomegaly: a daily five-round anatomy puzzle. Name the highlighted structure, the bone or the nerve; four options per round.
   Puzzles in puzzles/YYYY-MM.json: {date, number, difficulty, rounds:[{kind, q, art?, hl?, answer, wrong:[3], why}] x5}.
   art = a diagram name from art.js; hl = the part ids to highlight. Score 3+ out of 5 counts as a win.
   Normie mode ("animal anatomy"): puzzles/normie/YYYY-MM.json, same format, animal diagrams from art.js, "n-" storage keys,
   own sass, mascot outfit and share line. Missing Normie file -> MW_noNormie. Einstein dates: MW_EINSTEIN / MW_EINSTEIN_N.
   The fallback block below only runs if assets/games.js has no "labelosis" entry. Keep the id and file names: saved stats use them. */
(function () {
  "use strict";
  // ---------- self-registration (move into assets/games.js on launch) ----------
  var ICON = '<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 30l10-10M11 33.5a3.2 3.2 0 1 1-1.5-6 3.2 3.2 0 1 1 6-1.5M27 16.5a3.2 3.2 0 1 1 1.5 6 3.2 3.2 0 1 1-6 1.5"/><path d="M29 30h13v10H29l-5-5z"/><circle cx="28.5" cy="35" r="1.2" fill="#fff"/></svg>';
  var ENTRY = { id: "labelosis", kind: "Anatomy puzzle", name: "Anatomegaly", path: "labelosis/", live: true, from: "2026-11-02",
    store: { stats: "lbl-stats", day: "lbl-day-", labels: ["0", "1", "2", "3", "4", "5"], distTitle: " (score out of 5)" },
    tagline: "Five body parts. Name every one.",
    quip: "Left is right, right is left. Welcome to anatomy.",
    helpQuip: "Wrong answers get explained. Gently. Mostly.",
    help: ["Each day brings five rounds: name the highlighted structure, name the bone, or pick the nerve.",
      "Four options per round. One tap, no take-backs.",
      "Every answer comes with a quick explanation and, where we have one, a weird fact.",
      "Score 3 or more out of 5 to keep your streak alive.",
      "Front-on diagrams face you, so the patient’s right is on your left.",
      "Difficulty rises through the week: Easy Mon-Tue, Medium Wed-Thu, Hard Fri-Sat, Genius Sun. A new set arrives at midnight, Sydney time."],
    accent: "#0F6E6A", accentDark: "#4FC4B8", icon: ICON };
  window.MW_GAMES = window.MW_GAMES || [];
  if (!MW_GAMES.some(function (g) { return g.id === "labelosis"; })) MW_GAMES.push(ENTRY);
  window.MW_MASCOTS = window.MW_MASCOTS || {};
  if (!MW_MASCOTS.labelosis) MW_MASCOTS.labelosis = { name: "Axel", what: "a label-happy axolotl (regrows limbs, never forgets one)", cheer: ["Labelled to perfection.", "Textbook. Literally.", "Every part, accounted for.", "I’d regrow a limb just to watch that again.", "Anatomy lab legend.", "Origin, insertion, genius.", "That was very well innervated.", "Proximal to brilliant.", "Superior. Anatomically and otherwise.", "Gills out. Impressed."] };
  window.MW_ABOUT = window.MW_ABOUT || {};
  if (!MW_ABOUT.labelosis) MW_ABOUT.labelosis = ["Anatomegaly is a daily anatomy puzzle. Each day brings five rounds: name a highlighted structure on a simple diagram, identify a bone, or work out which nerve supplies what. Four options per round, and every answer comes with a short explanation.", [["Who is it for?", "Students, nurses, physios, paramedics, doctors and anyone curious about the body. Easy days are school-level; Genius days will test a surgeon."], ["Are the diagrams accurate?", "They are simplified teaching sketches drawn for this game, not to scale. Real anatomy varies between people."]]];
  window.MW_EINSTEIN = window.MW_EINSTEIN || {};
  if (!MW_EINSTEIN.labelosis) MW_EINSTEIN.labelosis = ["2026-11-13"];

  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "2", N = 5, PASS = 3;
  var NORMIE = !!(window.MW_mode && MW_mode() === "normie"), PFX = NORMIE ? "n-" : "", PDIR = NORMIE ? "puzzles/normie/" : "puzzles/", NAME = NORMIE ? "Anatomegaly (Normie)" : "Anatomegaly";
  // Normie wording swaps
  var T = NORMIE ? { foot: "Diagrams are simplified, original sketches, not to scale. Animal facts checked, but nature loves an exception.", noart: "No diagram for this one. Just you and your nature documentaries.", next: "Go and look at a cat’s ears. Respectfully.", emoji: " 🐙 ", masc: "/assets/mascots/normie/labelosis.svg" }
    : { foot: "Diagrams are simplified sketches, not to scale. General education, not personal medical advice.", noart: "No diagram for this one. Just you and your anatomy lectures.", next: "Go and find your own scaphoid.", emoji: " 🦴 ", masc: "/assets/mascots/labelosis.svg" };
  var root = document.getElementById("lbl");
  if (!document.querySelector("link[data-lbl]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "labelosis.css?v=" + BUILD; l.setAttribute("data-lbl", ""); document.head.appendChild(l);
  }
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="lbl-eyebrow">Anatomegaly</span><span class="badge" id="lbl-badge" hidden></span></div>' +
    ' <div class="pips" id="lbl-pips" aria-hidden="true"></div>' +
    ' <section class="card" id="lbl-card" aria-live="polite"></section>' +
    ' <div class="msg" id="lbl-msg" aria-live="polite"></div>' +
    ' <div class="opts" id="lbl-opts"></div>' +
    ' <p class="why" id="lbl-why" hidden></p>' +
    ' <button type="button" class="btn next" id="lbl-next" hidden>Next</button>' +
    ' <div class="result" id="lbl-result" hidden></div>' +
    ' <p class="note" id="lbl-nextday"></p>' +
    ' <details class="archive" id="lbl-archive"><summary>Past sets</summary><div class="alist" id="lbl-alist"></div></details>' +
    ' <p class="note">' + T.foot + '</p>' +
    "</div>";
  var $ = function (id) { return document.getElementById("lbl-" + id); };

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
  var SKEY = PFX + "lbl-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0, 0, 0] });
  var KEY, st, P = null, view = 0;
  function loadDay() { KEY = PFX + "lbl-day-" + today; st = load(KEY, { picks: [], done: false, win: false }); }
  loadDay();

  // ---------- sass (mocks the guess, never the person) ----------
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var SASS = {
    right: ["Correct. Smug is allowed.", "Nailed it. Anatomy lab flashbacks?", "Yes. The cadaver nods approvingly.", "Spot on. Gray would be proud.", "Correct. Textbook, literally.", "That’s the one. Gold star.", "Right. You’ve clearly done the reading."],
    wrong: ["Close. Anatomically speaking, no.", "Wrong side of the body, metaphorically.", "Bold. Incorrect, but bold.", "That’s a real structure. Just not this one.", "The anatomy textbook would like a word.", "Not quite. Happens to surgeons too.", "Respectfully: no."],
    win: [["Survived. Barely, but it counts.", "Three out of five. A pass is a pass."], ["Four out of five. Registrar energy.", "Four. Nearly flawless. Nearly."], ["Perfect five. Do you teach this?", "Five from five. The anatomy lab salutes you."]],
    lose: ["The diagrams win today. Rematch tomorrow.", "Under the pass mark. The explanations are a free lesson.", "Not today. Tomorrow’s body parts are already labelled.", "Rough one. Even surgeons check the textbook."]
  };
  if (NORMIE) SASS = {
    right: ["Correct. Somewhere a nature narrator nods.", "Nailed it. Nature documentary energy.", "Yes. The octopus applauds. With all eight arms.", "Spot on. Zookeeper material.", "Correct. Weird, but correct.", "That’s the one. Have a gold star. Or a fish.", "Right. You’ve clearly been watching animal videos."],
    wrong: ["Close. The animal disagrees.", "Bold. Incorrect, but bold.", "That’s a real thing. Just not this one.", "Nature says no.", "The owl turned its head 270 degrees to look away.", "Respectfully: no.", "Plausible. Also wrong."],
    win: [["Survived. Barely, but it counts.", "Three out of five. A pass is a pass."], ["Four out of five. Wildlife ranger energy.", "Four. Nearly flawless. Nearly."], ["Perfect five. Do you live in a zoo?", "Five from five. The octopus is clapping. Eight times."]],
    lose: ["The animals win today. Rematch tomorrow.", "Under the pass mark. The explanations are a free nature doco.", "Not today. Tomorrow’s critters are already lining up.", "Rough one. Nature is weird. That’s the point."]
  };
  var NCHEER = ["Gills out. Very impressed.", "Eight arms couldn’t have done it better.", "Wildlife ranger energy.", "Nature documentary narrator voice: magnificent.", "I’d regrow a leg just to see that again.", "Zoo-level knowledge.", "Owl-ready a genius.", "Feet up, facts down.", "Day off, and you’re still this sharp?", "Weird animal facts: mastered."];
  function say(t) { var m = $("msg"); m.textContent = t; m.classList.remove("pop"); void m.offsetWidth; if (t) m.classList.add("pop"); }

  // ---------- helpers ----------
  function seeded(a) { a = a >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function options(i) { var R = P.rounds[i], o = [R.answer].concat(R.wrong), r = seeded(dayNum(P.date) * 31 + i * 7 + 3); for (var k = o.length - 1; k > 0; k--) { var j = Math.floor(r() * (k + 1)), t = o[k]; o[k] = o[j]; o[j] = t; } return o; }
  function score() { return st.picks.filter(function (x, i) { return P.rounds[i] && x === P.rounds[i].answer; }).length; }
  var EIN = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/></svg>';
  var NERVE = '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 20h10M16 20c6 0 8-10 14-10M16 20c6 0 8 10 14 10M22 20h12"/><circle cx="6" cy="20" r="3" fill="currentColor"/><circle cx="31" cy="10" r="2"/><circle cx="31" cy="30" r="2"/><circle cx="35" cy="20" r="2"/></svg>';
  var PAW = '<svg viewBox="0 0 40 40" fill="currentColor" aria-hidden="true"><ellipse cx="20" cy="27" rx="9" ry="7.5"/><ellipse cx="9" cy="17" rx="3.6" ry="4.6" transform="rotate(-20 9 17)"/><ellipse cx="16" cy="11" rx="3.6" ry="4.8"/><ellipse cx="24" cy="11" rx="3.6" ry="4.8"/><ellipse cx="31" cy="17" rx="3.6" ry="4.6" transform="rotate(20 31 17)"/></svg>';
  var BONE = '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 28l16-16"/><path d="M9 25a4 4 0 1 1 4-4 4 4 0 1 1 4 4zM23 15a4 4 0 1 1 4-4 4 4 0 1 1 4 4z"/></svg>';

  // ---------- render ----------
  function renderPips() {
    $("pips").innerHTML = P.rounds.map(function (R, i) {
      var c = i < st.picks.length ? (st.picks[i] === R.answer ? "ok" : "no") : i === view ? "now" : "";
      return '<i class="' + c + '"></i>';
    }).join("");
  }
  function renderRound() {
    var i = Math.min(view, N - 1), R = P.rounds[i], answered = i < st.picks.length, mine = st.picks[i];
    $("card").innerHTML = '<div class="chead"><span>Round ' + (i + 1) + " of " + N + "</span><span>" + esc(R.kind) + "</span></div>" +
      '<p class="q">' + esc(R.q) + "</p>" +
      (R.art && window.LBL_ART ? '<div class="art">' + LBL_ART(R.art, R.hl) + '</div><p class="cap">' + esc((window.LBL_CAP || {})[R.art] || "") + "</p>"
        : '<div class="noart">' + (NORMIE ? PAW : /nerve/i.test(R.kind) ? NERVE : BONE) + "<span>" + T.noart + "</span></div><div style=\"height:12px\"></div>");
    $("opts").innerHTML = options(i).map(function (o) {
      var cls = answered ? (o === R.answer ? " right" : o === mine ? " wrong" : " dim") : "";
      return '<button type="button" class="opt' + cls + '" data-o="' + esc(o) + '"' + (answered ? " disabled" : "") + ">" + esc(o) + "</button>";
    }).join("");
    var w = $("why"); w.hidden = !answered;
    if (answered) w.innerHTML = "<b>" + (mine === R.answer ? "Correct: " : "It’s the ") + esc(R.answer) + ".</b> " + esc(R.why);
    var nx = $("next"); nx.hidden = !answered || (st.done && i === N - 1);
    nx.textContent = i < N - 1 ? "Next round" : "See your score";
    renderPips();
  }
  function renderResult() {
    var r = $("result");
    if (!st.done) { r.hidden = true; return; }
    var s = score(), grid = P.rounds.map(function (R, i) { return st.picks[i] === R.answer ? "🟩" : "🟥"; }).join("");
    var share = NAME + " #" + P.number + (isLive() ? "" : " (archive)") + " · " + P.difficulty + T.emoji + s + "/" + N + "\n" + grid + "\nmaladywise.com";
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0, max = Math.max.apply(null, stats.dist.concat([1]));
    var M = (window.MW_MASCOTS || {}).labelosis;
    r.hidden = false;
    r.innerHTML = '<p class="verdict ' + (st.win ? "ok" : "no") + '">' + (st.win ? "Passed" : "Below the pass mark") + "</p>" +
      "<h2>" + s + " out of " + N + "</h2>" +
      '<ul class="recap">' + P.rounds.map(function (R, i) { var ok = st.picks[i] === R.answer; return '<li><span class="mk ' + (ok ? "ok" : "no") + '">' + (ok ? "✓" : "✕") + "</span><span>" + esc(R.answer) + (ok ? "" : "<small>You said: " + esc(st.picks[i] || "") + "</small>") + "</span></li>"; }).join("") + "</ul>" +
      (M && st.win ? '<div class="masc"><img src="' + T.masc + '" alt="' + esc(M.name) + '" width="56" height="56"' + (NORMIE ? " onerror=\"this.onerror=null;this.src='/assets/mascots/labelosis.svg'\"" : "") + '><span><b>' + esc(M.name) + ":</b> " + esc(pick(NORMIE ? NCHEER : M.cheer)) + "</span></div>" : "") +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Win %</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + stats.best + "</b><span>Best</span></div></div>" +
      '<div class="dist">' + stats.dist.map(function (c, i) { return "<div><span>" + i + '</span><i class="' + (i === s && isLive() ? "me" : "") + '" style="width:' + Math.max(8, Math.round(c / max * 100)) + '%">' + c + "</i></div>"; }).join("") + "</div>" +
      '<pre id="lbl-share">' + esc(share) + '</pre><button class="btn" type="button" id="lbl-copy">Copy result</button>';
    $("copy").onclick = function () {
      var b = this;
      function sel() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, sel); } catch (e) { sel(); }
    };
  }
  function paint() { renderRound(); renderResult(); }
  function tick() {
    var t = "A new set arrives at midnight, Sydney time.";
    try { var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
      var left = 1440 - ((p[0] % 24) * 60 + p[1]); t = "Next set in " + Math.floor(left / 60) + "h " + (left % 60) + "m. " + T.next; } catch (e) {}
    $("nextday").textContent = t;
  }

  // ---------- play ----------
  function finish() {
    var s = score(), win = s >= PASS;
    st.done = true; st.win = win; st.score = s; put(KEY, st);
    if (isLive() && stats.last !== today) {
      var yest = stats.last && dayNum(today) - dayNum(stats.last) === 1;
      stats.played++; if (win) stats.wins++;
      stats.streak = win ? (yest ? stats.streak + 1 : 1) : 0; stats.best = Math.max(stats.best, stats.streak);
      stats.dist[s]++; stats.last = today; put(SKEY, stats);
    }
    if (P.difficulty === "Einstein") {
      say(win ? "⚛️ Einstein passed. Roughly a once-in-50-days set, and you named the lot. Screenshot this." : (NORMIE ? "Even Einstein would have asked a zookeeper. Respect for taking on the rare one." : "Even Einstein would have reached for the atlas. Respect for taking on the rare one."));
      if (win && isLive()) { var tro = load(PFX + "mw-einstein", []); if (!tro.some(function (t) { return t.g === "labelosis" && t.d === today; })) { tro.push({ g: "labelosis", d: today }); put(PFX + "mw-einstein", tro); } }
    } else say(win ? pick(SASS.win[s - PASS]) : pick(SASS.lose));
  }
  $("opts").addEventListener("click", function (e) {
    var b = e.target.closest(".opt"); if (!b || !P || st.done || b.disabled || view !== st.picks.length) return;
    var o = b.getAttribute("data-o"), R = P.rounds[view];
    st.picks.push(o);
    if (st.picks.length >= N) { finish(); paint(); return; }
    put(KEY, st); say(o === R.answer ? pick(SASS.right) : pick(SASS.wrong)); paint();
    var w = $("why"); if (w.scrollIntoView) w.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  $("next").addEventListener("click", function () {
    if (view < N - 1) { view++; say(""); paint(); $("pips").scrollIntoView({ behavior: "smooth", block: "start" }); }
    else $("result").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ---------- load ----------
  var cache = {};
  function month(m) {
    if (!cache[m]) cache[m] = fetch(BASE + PDIR + m + ".json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    return cache[m];
  }
  function prevMonth(m) { var p = m.split("-").map(Number); p[1]--; if (!p[1]) { p[1] = 12; p[0]--; } return p[0] + "-" + ("0" + p[1]).slice(-2); }
  function hidePlay(html) { ["pips", "opts", "why", "next", "result"].forEach(function (k) { $(k).hidden = true; }); $("badge").hidden = true; $("card").innerHTML = html; }
  function show(date) {
    today = date; loadDay(); P = null;
    return month(date.slice(0, 7)).then(function (list) {
      P = list.filter(function (x) { return x.date === date; })[0] || null;
      if (!P) { hidePlay(date < "2026-11-02" ? '<p class="empty">Anatomegaly opens Monday 2 November. ' + (NORMIE ? "The octopus is still stretching." : "The skeleton is still warming up.") + "</p>" : NORMIE && window.MW_noNormie ? MW_noNormie("anatomy puzzle") : '<p class="empty">Today’s set is still being labelled. Back tomorrow.</p>'); renderArchive(); return; }
      ["pips", "opts"].forEach(function (k) { $(k).hidden = false; });
      $("eyebrow").textContent = (isLive() ? NAME : "Archive") + " · #" + P.number + " · " + nice(date);
      var b = $("badge"); b.hidden = false; b.className = "badge " + P.difficulty; b.innerHTML = (P.difficulty === "Einstein" ? EIN : "") + P.difficulty; root.classList.toggle("einstein", P.difficulty === "Einstein");
      view = st.done ? N - 1 : Math.min(st.picks.length, N - 1);
      say("");
      if (!isLive()) say(st.done ? "Archive set. Already done." : "Archive set. Doesn’t count towards your streak.");
      else if (st.done) say(st.win ? "Passed. Come back tomorrow." : "You’ve had your go. Back tomorrow.");
      paint(); renderArchive();
    });
  }
  function renderArchive() {
    var m = REAL.slice(0, 7);
    Promise.all([prevMonth(m) < "2026-11" ? Promise.resolve([]) : month(prevMonth(m)), month(m)]).then(function (ls) {
      var past = [].concat(ls[0], ls[1]).filter(function (x) { return x.date < REAL; }).reverse();
      var rows = past.map(function (x) {
        var s = load(PFX + "lbl-day-" + x.date, null), mark = !s || !s.done ? "" : " · " + (s.score != null ? s.score : "?") + "/5";
        return '<button type="button" class="arow' + (x.date === today ? " on" : "") + '" data-d="' + x.date + '"><span>#' + x.number + " · " + nice(x.date) + mark + '</span><span class="badge ' + x.difficulty + '">' + x.difficulty + "</span></button>";
      }).join("");
      var back = isLive() ? "" : '<button type="button" class="btn" id="lbl-back">Back to today</button>';
      $("alist").innerHTML = back + (rows || '<p class="note">No past sets yet. You’re early.</p>');
      Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); }; });
      if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
    });
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };

  tick(); setInterval(tick, 60000);
  show(today);
})();
