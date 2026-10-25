/* Panelysis: read the blood results, pick the diagnosis. Three tries; each wrong pick reveals a hint.
   Puzzles in puzzles/YYYY-MM.json: {date, number, difficulty, patient, story, theme?, panels:[{name, rows:[[test, value, unit, range, flag]]}],
   answer, wrong:[5], hints:[[text, [tests]] x2], key:[tests], why, pearl}. Flags: H, L, ! (abnormal text). Check with panelysis/check.py.
   Medical mode only: Normie mode shows a friendly note instead. */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "1", TRIES = 3;
  var NORMIE = !!(window.MW_mode && MW_mode() === "normie"), NAME = "Panelysis";
  var root = document.getElementById("pnl");
  if (!document.querySelector("link[data-pnl]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "panelysis.css?v=" + BUILD; l.setAttribute("data-pnl", ""); document.head.appendChild(l);
  }
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="pnl-eyebrow">Panelysis</span><span class="badge" id="pnl-badge" hidden></span></div>' +
    ' <section class="report" id="pnl-report" aria-label="Blood results"></section>' +
    ' <div class="pzl" id="pnl-play" hidden>' +
    '  <div class="tries"><span class="tl">What’s the diagnosis?</span><span class="vials" id="pnl-vials" aria-label="Tries left"></span></div>' +
    '  <div class="msg" id="pnl-msg" aria-live="polite"></div>' +
    '  <div class="hints" id="pnl-hints"></div>' +
    '  <div class="opts" id="pnl-opts"></div>' +
    ' </div>' +
    ' <div class="result" id="pnl-result" hidden></div>' +
    ' <p class="note" id="pnl-next"></p>' +
    ' <details class="archive" id="pnl-archive"><summary>Past panels</summary><div class="alist" id="pnl-alist"></div></details>' +
    ' <p class="note">All patients are fictional. Reference ranges vary between labs. General education, not personal medical advice.</p>' +
    "</div>";
  var $ = function (id) { return document.getElementById("pnl-" + id); };

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
  var SKEY = "pnl-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0] });
  var KEY, st, P = null;
  function loadDay() { KEY = "pnl-day-" + today; st = load(KEY, { picks: [], done: false, win: false }); }
  loadDay();

  // ---------- sass (mocks the guess, never the patient) ----------
  function pick(a) { if (a.length < 2) return a[0]; var k = "mw-last-" + a[0].slice(0, 12), last; try { last = sessionStorage.getItem(k); } catch (e) {} var x, n = 0; do { x = a[Math.floor(Math.random() * a.length)]; } while (x === last && ++n < 8); try { sessionStorage.setItem(k, x); } catch (e) {} return x; }
  var SASS = {
    wrong: ["Respectfully: no.", "The pathologist has questions.", "Bold. Wrong, but bold.", "That’s a diagnosis. Just not this one.", "The numbers disagree.", "Somewhere a lab scientist sighed.", "Plausible. Also wrong.", "Flagged L, for ‘Let’s try again’.", "Not what the bloods are saying.", "Confidently incorrect. A classic.", "Read the results again. Slowly.", "Outside the reference range of right answers.", "The analyser would like a word.", "Interesting. Incorrect, but interesting."],
    win: [["First pick. Did you write the report?", "One look and done. Pathologist energy.", "First try. Frame those results.", "Straight to the answer. Suspiciously good."], ["Second pick. Nicely reasoned.", "Two tries. The hint helped. We saw.", "Got there on two. Solid.", "Second guess. Registrar-level."], ["Last try. Phew. For everyone.", "Third time. A buzzer-beater.", "Scraped in. A diagnosis is a diagnosis.", "Final pick. Sweaty, but correct."]],
    lose: ["The bloods win today. Rematch tomorrow.", "Out of tries. Read the explanation and nod wisely.", "Missed it. The results were trying to tell you.", "Not today. Tomorrow’s panel is already in the analyser.", "Stumped. Even the pathologist checked twice.", "Haemolysed. Your confidence, not the sample."]
  };
  function say(t) { var m = $("msg"); m.textContent = t; m.classList.remove("pop"); void m.offsetWidth; if (t) m.classList.add("pop"); }

  // ---------- helpers ----------
  function seeded(a) { a = a >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function options() { var o = [P.answer].concat(P.wrong), r = seeded(dayNum(P.date) * 53 + 7); for (var k = o.length - 1; k > 0; k--) { var j = Math.floor(r() * (k + 1)), t = o[k]; o[k] = o[j]; o[j] = t; } return o; }
  function rowsByTest() { var m = {}; P.panels.forEach(function (pn) { pn.rows.forEach(function (r) { m[r[0]] = r; }); }); return m; }
  var ICON = { Easy: "🟢", Medium: "🟡", Hard: "🔴", Genius: "🧠", Einstein: "⚛️" };
  var EIN = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/></svg>';
  var FLAG = { H: "High", L: "Low", "!": "Abnormal" };

  // ---------- render ----------
  function hlSet() {
    var s = {}, wrongN = st.picks.filter(function (x) { return x !== P.answer; }).length;
    P.hints.slice(0, st.done ? 0 : wrongN).forEach(function (h) { (h[1] || []).forEach(function (t) { s[t] = "hl"; }); });
    if (st.done) P.key.forEach(function (t) { s[t] = "key"; });
    return s;
  }
  function renderReport() {
    var hs = hlSet();
    $("report").innerHTML =
      '<div class="rhead"><span>Pathology report</span><span>Malady Wise Labs · fictional</span></div>' +
      '<div class="pt"><b>' + esc(P.patient) + "</b>" + (P.theme ? '<span class="theme">' + esc(P.theme) + "</span>" : "") + "<p>" + esc(P.story) + "</p></div>" +
      P.panels.map(function (pn) {
        return '<div class="pn"><h3>' + esc(pn.name) + "</h3>" + pn.rows.map(function (r) {
          var t = r[0], v = r[1], u = r[2], rg = r[3], f = r[4], txt = !/^[<>]?[+−-]?[\d,.]+$/.test(v);
          var ref = rg ? "Ref " + rg + (u && !txt ? " " + u : "") : (u && !txt ? u : "");
          return '<div class="r' + (f ? " ab" : "") + (hs[t] ? " " + hs[t] : "") + '"><span class="tn">' + esc(t) + (ref ? "<small>" + esc(ref) + "</small>" : "") + '</span><span class="tv' + (txt ? " txt" : "") + '">' + esc(v) + (u && !txt ? "<i>" + esc(u) + "</i>" : "") + '</span><span class="fl' + (f ? " f" + (f === "!" ? "A" : f) : "") + '"' + (f ? ' title="' + FLAG[f] + '" aria-label="' + FLAG[f] + '"' : "") + ">" + (f === "!" ? "*" : esc(f || "")) + "</span></div>";
        }).join("") + "</div>";
      }).join("") +
      '<p class="legend"><span class="fl fH">H</span> high <span class="fl fL">L</span> low <span class="fl fA">*</span> abnormal</p>';
  }
  function renderPlay() {
    var wrong = st.picks.filter(function (x) { return x !== P.answer; });
    $("play").hidden = st.done;
    var left = TRIES - st.picks.length;
    $("vials").innerHTML = [0, 1, 2].map(function (i) { return '<i class="' + (i < left ? "full" : "used") + '"></i>'; }).join("") + "<b>" + left + " left</b>";
    $("hints").innerHTML = wrong.map(function (x, i) { return P.hints[i] ? '<p class="hint"><b>Hint ' + (i + 1) + ".</b> " + esc(P.hints[i][0]) + "</p>" : ""; }).join("");
    $("opts").innerHTML = options().map(function (o) {
      var picked = st.picks.indexOf(o) >= 0;
      return '<button type="button" class="opt' + (picked ? " wrong" : "") + '" data-o="' + esc(o) + '"' + (picked ? " disabled" : "") + ">" + esc(o) + "</button>";
    }).join("");
  }
  function renderResult() {
    var r = $("result");
    if (!st.done) { r.hidden = true; return; }
    var n = st.picks.length, rows = rowsByTest();
    var grid = st.picks.map(function (x) { return x === P.answer ? "🟩" : "🟥"; }).join("") + (st.win ? new Array(TRIES - n + 1).join("⬜") : "");
    var share = NAME + " #" + P.number + (isLive() ? "" : " (archive)") + " · " + P.difficulty + " 🩸  " + (st.win ? n : "X") + "/" + TRIES + "\n" + grid + "\nmaladywise.com";
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0, max = Math.max.apply(null, stats.dist.concat([1])), mine = st.win ? n - 1 : 3;
    r.hidden = false;
    r.innerHTML = '<p class="verdict ' + (st.win ? "ok" : "no") + '">' + (st.win ? "Solved on try " + n + " of " + TRIES : "Not this time") + "</p>" +
      "<h2>" + esc(P.answer) + "</h2>" +
      (st.picks.length && !st.win ? '<p class="yours">Your picks: ' + st.picks.map(esc).join(" · ") + "</p>" : "") +
      '<div class="why"><b>Why</b><p>' + esc(P.why) + "</p></div>" +
      '<div class="clinch"><b>The clinchers</b><div class="chips">' + P.key.map(function (t) { var x = rows[t]; if (!x) return ""; var txt = !/^[<>]?[+−-]?[\d,.]+$/.test(x[1]); return '<span class="chip">' + esc(t) + " <b>" + esc(x[1]) + (x[2] && !txt ? " " + esc(x[2]) : "") + "</b>" + (x[4] ? ' <em class="fl f' + (x[4] === "!" ? "A" : x[4]) + '">' + (x[4] === "!" ? "*" : x[4]) + "</em>" : "") + "</span>"; }).join("") + "</div></div>" +
      '<div class="pearl"><b>Teaching pearl</b><p>' + esc(P.pearl) + "</p></div>" +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Win %</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + stats.best + "</b><span>Best</span></div></div>" +
      '<div class="dist">' + stats.dist.map(function (c, i) { return "<div><span>" + (i < 3 ? i + 1 : "X") + '</span><i class="' + (i === mine && isLive() ? "me" : "") + '" style="width:' + Math.max(8, Math.round(c / max * 100)) + '%">' + c + "</i></div>"; }).join("") + "</div>" +
      '<pre id="pnl-share">' + esc(share) + '</pre><button class="btn" type="button" id="pnl-copy">Copy result</button>';
    $("copy").onclick = function () {
      var b = this;
      function sel() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, sel); } catch (e) { sel(); }
    };
  }
  function paint() { renderReport(); renderPlay(); renderResult(); }
  function tick() {
    var t = "A new panel arrives at midnight, Sydney time.";
    try { var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
      var left = 1440 - ((p[0] % 24) * 60 + p[1]); t = "Next panel in " + Math.floor(left / 60) + "h " + (left % 60) + "m. Stay hydrated, it helps the bloods."; } catch (e) {}
    $("next").textContent = t;
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
      say(win ? "⚛️ Einstein solved. Roughly a once-in-50-days panel, and you read it. Screenshot this." : "Even Einstein would have ordered more tests. Respect for taking on the rare one.");
      if (win && isLive()) { var tro = load("mw-einstein", []); if (!tro.some(function (t) { return t.g === "panelysis" && t.d === today; })) { tro.push({ g: "panelysis", d: today }); put("mw-einstein", tro); } }
    } else say(win ? pick(SASS.win[st.picks.length - 1]) : pick(SASS.lose));
  }
  $("opts").addEventListener("click", function (e) {
    var b = e.target.closest(".opt"); if (!b || !P || st.done || b.disabled) return;
    var o = b.getAttribute("data-o"); if (st.picks.indexOf(o) >= 0) return;
    st.picks.push(o);
    if (o === P.answer) { finish(true); paint(); $("result").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (st.picks.length >= TRIES) { finish(false); paint(); $("result").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    put(KEY, st); say(pick(SASS.wrong)); paint();
    var h = $("hints").lastChild; if (h && h.scrollIntoView) h.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  // ---------- load ----------
  var cache = {};
  function month(m) {
    if (!cache[m]) cache[m] = fetch(BASE + "puzzles/" + m + ".json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    return cache[m];
  }
  function prevMonth(m) { var p = m.split("-").map(Number); p[1]--; if (!p[1]) { p[1] = 12; p[0]--; } return p[0] + "-" + ("0" + p[1]).slice(-2); }
  function show(date) {
    today = date; loadDay(); P = null;
    return month(date.slice(0, 7)).then(function (list) {
      P = list.filter(function (x) { return x.date === date; })[0] || null;
      if (!P) {
        $("play").hidden = true; $("result").hidden = true; $("badge").hidden = true;
        $("report").innerHTML = '<p class="empty">' + (date < "2026-10-26" ? "Panelysis opens Monday 26 October. The analyser is warming up." : "Today’s panel is still in the analyser. Back tomorrow.") + "</p>";
        renderArchive(); return;
      }
      $("eyebrow").textContent = (isLive() ? "Panelysis" : "Archive") + " · #" + P.number + " · " + nice(date);
      var b = $("badge"); b.hidden = false; b.className = "badge " + P.difficulty; b.innerHTML = (P.difficulty === "Einstein" ? EIN : "") + P.difficulty; root.classList.toggle("einstein", P.difficulty === "Einstein");
      say("");
      if (!isLive()) say(st.done ? "Archive panel. Already reported." : "Archive panel. Doesn’t count towards your streak.");
      else if (st.done) say(st.win ? "Solved. Come back tomorrow." : "You’ve had your go. Back tomorrow.");
      paint(); renderArchive();
    });
  }
  function renderArchive() {
    var m = REAL.slice(0, 7);
    Promise.all([prevMonth(m) < "2026-10" ? Promise.resolve([]) : month(prevMonth(m)), month(m)]).then(function (ls) {
      var past = [].concat(ls[0], ls[1]).filter(function (x) { return x.date < REAL; }).reverse();
      var rows = past.map(function (x) {
        var s = load("pnl-day-" + x.date, null), mark = !s || !s.done ? "" : s.win ? " ✓" : " ✕";
        return '<button type="button" class="arow' + (x.date === today ? " on" : "") + '" data-d="' + x.date + '"><span>#' + x.number + " · " + nice(x.date) + mark + '</span><span class="badge ' + x.difficulty + '">' + x.difficulty + "</span></button>";
      }).join("");
      var back = isLive() ? "" : '<button type="button" class="btn" id="pnl-back">Back to today</button>';
      $("alist").innerHTML = back + (rows || '<p class="note">No past panels yet. You’re early.</p>');
      Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); }; });
      if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
    });
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };

  tick(); setInterval(tick, 60000);
  if (NORMIE) {
    // Medical-only game: no Normie version. Friendly note with a switch button, no puzzle.
    $("badge").hidden = true; $("next").hidden = true;
    $("report").className = "report off";
    $("report").innerHTML = '<div class="mw-nonorm"><img src="/assets/mascots/panelysis.svg" alt="" width="72" height="72"><p><b>Panelysis is Medical-mode only.</b> It’s blood tests all the way down, so there’s no Normie version. Switch to Medical to play.</p><button type="button" class="btn" id="pnl-tomed">🩺 Switch to Medical</button></div>';
    $("tomed").onclick = function () { if (window.MW_setMode) MW_setMode("medical"); };
    $("alist").innerHTML = '<p class="note">Past panels are in Medical mode.</p>';
  } else show(today);
})();
