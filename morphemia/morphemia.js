/* Morphemia: seven letters, build words, centre letter required. Medical words score double.
   Puzzles in puzzles/YYYY-MM.json: {date, number, difficulty, centre, outer, words[], medical[], pangrams[], max} */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "6";
  var root = document.getElementById("mph");
  if (!document.querySelector("link[data-mph]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "morphemia.css?v=" + BUILD; l.setAttribute("data-mph", ""); document.head.appendChild(l);
  }
  var RANKS = [["Student", 0], ["Intern", 2], ["Resident", 8], ["Registrar", 20], ["Consultant", 35], ["Professor", 50], ["Genius", 70]];
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="mph-eyebrow">Morphemia</span><span class="badge" id="mph-badge" hidden></span></div>' +
    ' <div class="rank"><div class="rank-top"><span class="rank-name" id="mph-rank">Student</span><span class="rank-score" id="mph-score">0 pts</span></div>' +
    '  <div class="bar"><i id="mph-bar" style="width:0"></i></div><div class="ticks" id="mph-ticks"></div></div>' +
    ' <details class="found" id="mph-found" open><summary><span id="mph-fcount">You have found 0 words</span><span>&#9662;</span></summary><div class="words" id="mph-words"></div></details>' +
    ' <div class="msg" id="mph-msg" aria-live="polite"></div>' +
    ' <div class="entry" id="mph-entry"></div>' +
    ' <div class="hive" id="mph-hive"></div>' +
    ' <div class="ctrls"><button class="btn" type="button" id="mph-del">Delete</button><button class="btn" type="button" id="mph-shuf" aria-label="Shuffle letters">&#8635;</button><button class="btn solid" type="button" id="mph-enter">Enter</button></div>' +
    ' <details class="legend"><summary><b>Medical words</b> score double. Long words earn bonuses. <u>Scoring</u></summary><ul><li>4 letters: 1 point</li><li>5+ letters: 1 point per letter</li><li>8 letters: +8 bonus</li><li>9 letters: +10 bonus</li><li>10 letters: +12 bonus</li><li>11+ letters: +15 bonus</li><li>Pangram (all seven letters): +7 bonus</li><li>Medical word: whole score doubled</li></ul></details>' +
    ' <div class="result" id="mph-result" hidden></div>' +
    ' <p class="note" id="mph-next"></p>' +
    ' <details class="archive" id="mph-archive"><summary>Past puzzles</summary><div class="alist" id="mph-alist"></div></details>' +
    "</div>";
  var $ = function (id) { return document.getElementById("mph-" + id); };

  function sydToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function nice(d) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var REAL = sydToday(), q = new URLSearchParams(location.search).get("date");
  var today = (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) ? q : REAL;
  function isLive() { return today === REAL; }
  var SKEY = "mph-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0, 0, 0, 0] });
  var KEY, st, P = null, cur = "", outer = [];
  function loadDay() { KEY = "mph-day-" + today; st = load(KEY, { found: [], score: 0, done: false, win: false, rank: 0 }); }
  loadDay();

  function pick(a) { if (a.length < 2) return a[0]; var k = "mw-last-" + a[0].slice(0, 12), last; try { last = sessionStorage.getItem(k); } catch (e) {} var x, n = 0; do { x = a[Math.floor(Math.random() * a.length)]; } while (x === last && ++n < 8); try { sessionStorage.setItem(k, x); } catch (e) {} return x; }
  var SASS = {
    short: ["Four letters minimum. This isn't a text message.", "Too short. Four letters, please.", "Short. Even \u2018ache\u2019 has four letters.", "Needs at least four letters, doctor."],
    centre: ["Forgot the centre letter. It's the important one.", "Centre letter missing. It\u2019s compulsory.", "No centre letter. Like a consult with no history.", "Every word needs the middle letter."],
    bad: ["Those letters aren't on the tray.", "Off-menu letters detected.", "Not on the tray. Use what you\u2019ve got.", "Imported letters. Not allowed."],
    not: ["Not in our dictionary. Not even in Latin.", "Nice try. Not a word.", "Did you just invent a disease?", "That's not a word. Your spellcheck is crying.", "Not a word. Lovely sound, though.", "The dictionary declined that one.", "Made up. We can tell.", "That\u2019s not a word. That\u2019s a sneeze.", "Close to a word. Not a word.", "Not in the list. Some real words aren\u2019t either. Sorry."],
    dupe: ["Already found. Short-term memory check?", "Got that one already.", "Already banked.", "You found that earlier. Still counts once."],
    good: ["Good.", "Nice.", "Solid.", "Tidy.", "Yep.", "Lovely.", "Banked.", "Nice find.", "Sure.", "Good word.", "Keep going.", "Noted."],
    med: ["\u2695 Medical word. Double points.", "\u2695 Clinical. Double points.", "\u2695 Now we're talking. Double.", "\u2695 Proper medicine. Double.", "\u2695 That\u2019s on the syllabus. Double.", "\u2695 Medical. Your registrar approves. Double.", "\u2695 Clinical vocab. Double points."],
    pan: "PANGRAM! Every letter. Absolute show-off.",
    long: { 8: ["Eight letters. Someone\u2019s been reading.", "Eight letters. Bonus earned."], 9: ["Nine letters. Registrar vocabulary.", "Nine letters. Big word energy."], 10: ["Ten letters! The consultant is impressed.", "Ten letters. That\u2019s a whole diagnosis."], 11: ["Eleven-plus letters. Absolutely unhinged. Love it.", "That word has its own postcode."] },
    rank: function (r) { return "Promoted to " + r + "."; },
    genius: "Genius. Go and tell someone who will pretend to care.",
    ein: "\u269b\ufe0f Einstein day, Genius reached. Roughly a once-in-50-days achievement. Screenshot this."
  };
  function say(t) { $("msg").textContent = t; }

  function letters() { return P.centre + P.outer; }
  var LONG = { 8: 8, 9: 10, 10: 12 };
  function longBonus(n) { return n >= 11 ? 15 : LONG[n] || 0; }
  function points(w) { var p = w.length === 4 ? 1 : w.length; p += longBonus(w.length); if (P.pangrams.indexOf(w) >= 0) p += 7; if (P.medical.indexOf(w) >= 0) p *= 2; return p; }
  function rankIdx(score) { var pct = P.max ? score / P.max * 100 : 0, r = 0; RANKS.forEach(function (x, i) { if (pct >= x[1]) r = i; }); return r; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // ---------- render ----------
  var ICON = { Easy: "\ud83d\udfe2", Medium: "\ud83d\udfe1", Hard: "\ud83d\udd34", Genius: "\ud83e\udde0", Einstein: "\u269b\ufe0f" };
  var POS = [[33.5, 35.5], [33.5, 4.5], [62, 20], [62, 51], [33.5, 66.5], [5, 51], [5, 20]];
  function drawHive() {
    var ls = [P.centre].concat(outer);
    $("hive").innerHTML = ls.map(function (c, i) {
      return '<button type="button" class="hx' + (i === 0 ? " ctr" : "") + '" data-l="' + c + '" style="left:' + POS[i][0] + "%;top:" + POS[i][1] + '%">' + c + "</button>";
    }).join("");
  }
  function drawEntry(shake) {
    var e = $("entry"), L = letters();
    e.innerHTML = cur.split("").map(function (c) { return '<span class="' + (c === P.centre ? "c" : L.indexOf(c) < 0 ? "x" : "") + '">' + c + "</span>"; }).join("") + '<span class="cursor"></span>';
    if (shake) { e.classList.remove("shake"); void e.offsetWidth; e.classList.add("shake"); }
  }
  function render() {
    if (!P) return;
    var r = rankIdx(st.score), pct = Math.min(100, P.max ? st.score / P.max * 100 / 0.7 * 1 : 0);
    $("rank").textContent = st.found.length === P.words.length ? "Head of Department" : RANKS[r][0];
    $("score").textContent = st.score + " pts \u00b7 Genius at " + Math.ceil(P.max * 0.7);
    $("bar").style.width = Math.min(100, st.score / (P.max * 0.7) * 100) + "%";
    $("ticks").innerHTML = RANKS.map(function (x, i) { return '<span class="' + (i <= r ? "on" : "") + '" title="' + x[0] + '"></span>'; }).join("");
    var nMed = st.found.filter(function (w) { return P.medical.indexOf(w) >= 0; }).length;
    $("fcount").textContent = "You have found " + st.found.length + " word" + (st.found.length === 1 ? "" : "s") + (nMed ? " \u00b7 " + nMed + " medical" : "");
    var showAll = !isLive() && st.reveal;
    var list = (showAll ? P.words : st.found.slice().sort());
    $("words").innerHTML = list.map(function (w) {
      var cls = (P.medical.indexOf(w) >= 0 ? "med " : "") + (P.pangrams.indexOf(w) >= 0 ? "pan " : "") + (st.found.indexOf(w) < 0 ? "miss" : "");
      return '<span class="' + cls + '">' + w.toLowerCase() + (P.medical.indexOf(w) >= 0 ? " \u2695" : "") + "</span>";
    }).join("") || '<span class="miss">Nothing yet. The clock is ticking, doctor.</span>';
    renderResult(nMed);
  }
  function renderResult(nMed) {
    var r = $("result");
    if (!st.found.length) { r.hidden = true; return; }
    var rk = st.found.length === P.words.length ? "Head of Department" : RANKS[rankIdx(st.score)][0];
    var share = "Morphemia #" + P.number + (isLive() ? "" : " (archive)") + " \u00b7 " + P.difficulty + " " + ICON[P.difficulty] + "\nRank: " + rk + " \u00b7 " + st.found.length + " words \u00b7 " + nMed + " medical\nmaladywise.com";
    r.hidden = false;
    r.innerHTML = '<pre id="mph-share">' + esc(share) + '</pre><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn solid" type="button" id="mph-copy">Copy result</button>' +
      (!isLive() ? '<button class="btn" type="button" id="mph-reveal">' + (st.reveal ? "Hide answers" : "Reveal all answers") + "</button>" : "") + "</div>";
    $("copy").onclick = function () {
      var b = this;
      function selx() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, selx); } catch (e) { selx(); }
    };
    if ($("reveal")) $("reveal").onclick = function () { st.reveal = !st.reveal; put(KEY, st); $("found").open = true; render(); };
  }
  function tick() {
    var t = "New letters at midnight, Sydney time.";
    try { var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
      var left = 1440 - (p[0] * 60 + p[1]); t = "New letters in " + Math.floor(left / 60) + "h " + (left % 60) + "m. Go stretch your hamstrings."; } catch (e) {}
    $("next").textContent = t;
  }

  // ---------- play ----------
  function recordPlay() {
    if (!isLive() || stats.last === today) return;
    var yest = stats.last && dayNum(today) - dayNum(stats.last) === 1;
    stats.played++; stats.streak = yest ? stats.streak + 1 : 1; stats.best = Math.max(stats.best, stats.streak); stats.last = today; put(SKEY, stats);
  }
  var clearT;
  function fail(m) { say(m); drawEntry(true); var was = cur; clearTimeout(clearT); clearT = setTimeout(function () { if (cur === was) { cur = ""; drawEntry(); } }, 450); }
  function submit() {
    var w = cur; if (!P) return;
    if (w.length < 4) { fail(pick(SASS.short)); return; }
    var L = letters();
    if (w.split("").some(function (c) { return L.indexOf(c) < 0; })) { fail(pick(SASS.bad)); return; }
    if (w.indexOf(P.centre) < 0) { fail(pick(SASS.centre)); return; }
    if (st.found.indexOf(w) >= 0) { fail(pick(SASS.dupe)); return; }
    if (P.words.indexOf(w) < 0) { fail(pick(SASS.not)); return; }
    var before = rankIdx(st.score), pts = points(w);
    st.found.push(w); st.score += pts; cur = "";
    if (st.found.length === 1) recordPlay();
    var after = rankIdx(st.score), m;
    if (P.pangrams.indexOf(w) >= 0) m = SASS.pan;
    else if (w.length >= 8) m = pick(SASS.long[Math.min(w.length, 11)]) + (P.medical.indexOf(w) >= 0 ? " \u2695 Double." : "");
    else if (P.medical.indexOf(w) >= 0) m = pick(SASS.med);
    else m = pick(SASS.good);
    m += " +" + pts;
    if (after > before) {
      m = after === RANKS.length - 1 ? (P.difficulty === "Einstein" ? SASS.ein : SASS.genius) : m + " " + SASS.rank(RANKS[after][0]);
      if (isLive()) {
        if (after > (st.rank || 0)) { stats.dist[after]++; if (st.rank) stats.dist[st.rank]--; put(SKEY, stats); }
        if (after === RANKS.length - 1 && !st.win) {
          st.done = true; st.win = true; stats.wins++; put(SKEY, stats);
          if (P.difficulty === "Einstein") { var tro = load("mw-einstein", []); if (!tro.some(function (t) { return t.g === "morphemia" && t.d === today; })) { tro.push({ g: "morphemia", d: today }); put("mw-einstein", tro); } }
        }
      }
      st.rank = after;
    }
    if (st.found.length === P.words.length) m = "Every word. Head of Department. Absolutely unhinged.";
    put(KEY, st); say(m); drawEntry(); render();
  }
  function press(k) {
    if (!P) return;
    if (k === "enter") { submit(); return; }
    if (k === "back") { cur = cur.slice(0, -1); drawEntry(); return; }
    if (/^[A-Z]$/.test(k) && cur.length < 19) { if (clearT && $("entry").classList.contains("shake")) { clearTimeout(clearT); clearT = null; cur = ""; $("entry").classList.remove("shake"); } cur += k; say(""); drawEntry(); }
  }
  $("hive").addEventListener("click", function (e) { var b = e.target.closest(".hx"); if (b) { press(b.getAttribute("data-l")); b.blur(); } });
  $("del").onclick = function () { press("back"); };
  $("enter").onclick = function () { press("enter"); };
  $("shuf").onclick = function () { for (var i = outer.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = outer[i]; outer[i] = outer[j]; outer[j] = t; } drawHive(); };
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target && e.target.tagName; if (t === "INPUT" || t === "TEXTAREA") return;
    if (document.querySelector(".scrim")) return;
    var g = document.getElementById("game"); if (g && g.hidden) return;
    if (e.key === "Enter") { press("enter"); e.preventDefault(); }
    else if (e.key === "Backspace") press("back");
    else if (e.key === " ") { $("shuf").click(); e.preventDefault(); }
    else if (/^[a-zA-Z]$/.test(e.key)) press(e.key.toUpperCase());
  });

  // ---------- load ----------
  var cache = {};
  function month(m) {
    if (!cache[m]) cache[m] = fetch(BASE + "puzzles/" + m + ".json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    return cache[m];
  }
  function prevMonth(m) { var p = m.split("-").map(Number); p[1]--; if (!p[1]) { p[1] = 12; p[0]--; } return p[0] + "-" + ("0" + p[1]).slice(-2); }
  var EIN = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/></svg>';
  function show(date) {
    today = date; loadDay(); cur = ""; P = null; say("");
    return month(date.slice(0, 7)).then(function (list) {
      P = list.filter(function (x) { return x.date === date; })[0] || null;
      if (!P) { say("Today's letters are still in triage. Back tomorrow."); return; }
      outer = P.outer.split("");
      $("eyebrow").textContent = (isLive() ? "Morphemia" : "Archive") + " \u00b7 #" + P.number + " \u00b7 " + nice(date);
      var b = $("badge"); b.hidden = false; b.className = "badge " + P.difficulty; b.innerHTML = (P.difficulty === "Einstein" ? EIN : "") + P.difficulty;
      root.classList.toggle("einstein", P.difficulty === "Einstein");
      if (!isLive()) say("Archive puzzle. Doesn't count towards your streak.");
      drawHive(); drawEntry(); render(); renderArchive();
    });
  }
  function renderArchive() {
    var m = REAL.slice(0, 7);
    Promise.all([month(prevMonth(m)), month(m)]).then(function (ls) {
      var past = [].concat(ls[0], ls[1]).filter(function (x) { return x.date < REAL; }).reverse();
      var rows = past.map(function (x) {
        var s = load("mph-day-" + x.date, null), mark = s && s.found && s.found.length ? " \u00b7 " + s.found.length + " words" : "";
        return '<button type="button" class="arow' + (x.date === today ? " on" : "") + '" data-d="' + x.date + '"><span>#' + x.number + " \u00b7 " + nice(x.date) + mark + '</span><span class="badge ' + x.difficulty + '">' + x.difficulty + "</span></button>";
      }).join("");
      var back = isLive() ? "" : '<button type="button" class="btn" id="mph-back">Back to today</button>';
      $("alist").innerHTML = back + (rows || "<p class=\"note\">No past puzzles yet. Today is #1. You\u2019re early.</p>");
      Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); }; });
      if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
    });
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };
  tick(); setInterval(tick, 60000); show(today);
})();
