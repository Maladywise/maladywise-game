/* Arrhythmix: read the ECG. TWICE WEEKLY (medical: Monday and Thursday; Normie charts: Thursday only): one fictional case + generated ECG per release day, 00:00 Sydney.
   Pick the diagnosis from six options in three tries.
   Puzzles in puzzles/puzzles.json: [{date (a Monday or Thursday; Normie: Thursday), number, difficulty, seed, vignette, ecg, highlight, options, answer, hints, explanation, features, pearl}].
   puzzles/reserve.json holds spare puzzles (no date/number) for future release days. "seed" keeps each trace's noise stable when it's re-dated.
   ECGs are drawn by ecg.js (window.ARX_ECG).
   Normie mode ("mystery chart"): puzzles/normie.json (+ normie-reserve.json spares), same keys but a "chart" object instead of
   seed/ecg/highlight: {title, xlabel, ylabel, x:[numbers|strings], y, xticks:[{i,label}], yticks, yrange:[min,max], highlights:[{from,to,label}], step?}.
   Numeric x plots at true positions, string x evenly by index; step draws a staircase. Drawn below as SVG on the same ECG paper.
   Highlight bands appear after a wrong pick; their labels (which can give the answer away) only once finished. "n-" storage keys. */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "5";
  var NORMIE = !!(window.MW_mode && MW_mode() === "normie"), NAME = NORMIE ? "Arrhythmix (Normie)" : "Arrhythmix", TRIES = 3, PFX = NORMIE ? "n-" : "", FILE = NORMIE ? "normie.json" : "puzzles.json";
  var U = NORMIE ? "chart" : "ECG"; // unit word in messages
  var root = document.getElementById("arx");
  if (!document.querySelector("link[data-arx]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "arrhythmix.css?v=" + BUILD; l.setAttribute("data-arx", ""); document.head.appendChild(l);
  }
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="arx-eyebrow">Arrhythmix</span><span class="badge" id="arx-badge" hidden></span></div>' +
    ' <div class="stage" id="arx-play">' +
    '  <p class="vig" id="arx-vig"></p>' +
    '  <figure class="ecgwrap"><div class="ecgbox" id="arx-ecg"></div>' +
    '   <figcaption class="ecgtools"><button type="button" class="chip" id="arx-zoom" aria-pressed="false">🔍 Zoom</button><button type="button" class="chip" id="arx-hl" aria-pressed="true" hidden>✨ Key features</button>' + (NORMIE ? "" : '<span class="scale">1 small square = 40 ms · 0.1 mV</span>') + '</figcaption></figure>' +
    '  <p class="msg" id="arx-msg" aria-live="polite"></p>' +
    '  <div class="tries" id="arx-tries" aria-hidden="true"></div>' +
    '  <div class="choices" id="arx-opts" role="group" aria-label="' + (NORMIE ? "Answer options" : "Diagnosis options") + '"></div>' +
    '  <ul class="hints" id="arx-hints" aria-live="polite"></ul>' +
    '  <div class="result" id="arx-result" hidden></div>' +
    ' </div>' +
    ' <p class="note" id="arx-next"></p>' +
    ' <details class="archive" id="arx-archive"><summary>Past puzzles</summary><div class="alist" id="arx-alist"></div></details>' +
    ' <p class="note">' + (NORMIE ? "Charts are drawn from real-world figures, approximate and rounded. Just for fun." : "All cases and ECGs are fictional and computer-generated. General education, not medical advice.") + '</p>' +
    "</div>";
  var $ = function (id) { return document.getElementById("arx-" + id); };

  // ---------- dates & storage ----------
  function sydToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function nice(d) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function iso(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
  // Release days: medical = Monday and Thursday (ECG Monday + ECG Thursday); Normie charts = Thursday only.
  var RD = NORMIE ? [4] : [1, 4], DAYW = NORMIE ? "Thursday" : "Monday and Thursday", NEXTW = NORMIE ? "Thursday" : "release day";
  function back(n) { var wd = new Date(n * 864e5).getUTCDay(); return Math.min.apply(null, RD.map(function (r) { return (wd - r + 7) % 7; })); }
  function thu(d) { var n = dayNum(d); return iso(n - back(n)); } // most recent release day <= d
  function prevRel(d) { var n = dayNum(d) - 1; return iso(n - back(n)); }
  var LAUNCH = NORMIE ? "2026-10-29" : "2026-10-19", PRE = sydToday() < LAUNCH;
  var REAL = thu(sydToday()), q = new URLSearchParams(location.search).get("date");
  var today = (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) ? thu(q) : REAL;
  function isLive() { return today === REAL; }
  var SKEY = PFX + "arx-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0] });
  var KEY, st, P = null, OPTS = [];
  function loadDay() { KEY = PFX + "arx-day-" + today; st = load(KEY, { picks: [], done: false, win: false }); }
  loadDay();

  // ---------- sass (at the guess, never the patient) ----------
  function pick(a) { if (a.length < 2) return a[0]; var k = "mw-last-" + a[0].slice(0, 12), last; try { last = sessionStorage.getItem(k); } catch (e) {} var x, n = 0; do { x = a[Math.floor(Math.random() * a.length)]; } while (x === last && ++n < 8); try { sessionStorage.setItem(k, x); } catch (e) {} return x; }
  var SASS = {
    wrong: ["That’s not what the squiggles say.", "Bold read. Wrong, but bold.", "The ECG respectfully disagrees.", "Swing and a miss. Have a hint.", "Not quite. Calipers out.", "Interesting. Incorrect, but interesting.", "The cardiology registrar raised one eyebrow.", "Close the textbook, open your eyes.", "Plausible. Also wrong.", "The machine’s auto-report is smirking.", "Confidently incorrect. A classic.", "Wrong lead, doctor. Have another look.", "That’s a diagnosis. Just not this one.", "Nope. Count the little squares.", "The squiggles have filed a complaint."],
    win: [["First read. Cardiology wants your number.", "One try. Were you holding calipers?", "First go. Textbook. Literally.", "Straight in. Sinus rhythm of genius."], ["Second try. Steady hands.", "Two tries. The hint did some lifting.", "Got there on two. Respectable.", "Second read, right read."], ["Third time. Pulse restored.", "Last try. Living dangerously.", "Three tries. Everyone breathe out.", "Final pick. Phew."]],
    lose: ["The rhythm wins this round. Rematch next ECG day.", "Three strikes. Off to the ECG library with you.", "Not today. Read the pearl and come back.", "The squiggles escaped. Another strip is coming.", "Flatlined on that one. Revive next ECG day."]
  };
  var CHEER = ["You’ve got the beat.", "Calipers? Never needed them.", "Every P wave accounted for.", "Read in perfect time.", "My heart skipped a beat. The good kind.", "QRS: Quite Remarkably Smart.", "Tuned in and nailed it.", "That read had rhythm."];
  if (NORMIE) {
    SASS = {
      wrong: ["That’s not what the line says.", "Bold read. Wrong, but bold.", "The chart respectfully disagrees.", "Swing and a miss. Have a hint.", "Interesting. Incorrect, but interesting.", "Plausible. Also wrong.", "Confidently incorrect. A classic.", "Check the axes. Then check them again.", "The trend line raised one eyebrow.", "That’s an answer. Just not this one.", "Nope. Follow the peaks.", "The data has filed a complaint."],
      win: [["First read. Data scientist energy.", "One try. Did you make this chart?", "First go. Textbook.", "Straight in. Trend spotted."], ["Second try. Steady hands.", "Two tries. The hint did some lifting.", "Got there on two. Respectable.", "Second read, right read."], ["Third time. Phew.", "Last try. Living dangerously.", "Three tries. Everyone breathe out.", "Final pick. Got there."]],
      lose: ["The chart wins this week. Rematch Thursday.", "Three strikes. Read the explanation and nod wisely.", "Not today. Next Thursday’s another chart.", "The trend escaped you. It happens to economists too.", "Off the chart, that one. See you Thursday."]
    };
    CHEER = window.MW_NORMIE_CHEER && MW_NORMIE_CHEER.length ? MW_NORMIE_CHEER : ["Nailed the trend.", "Read it like a pro."];
  }
  function say(t) { $("msg").textContent = t; }

  // ---------- ECG ----------
  var zoom = false, showHl = true;
  function drawEcg() {
    if (NORMIE) { drawChart(); return; }
    if (!P || !window.ARX_ECG) return;
    var c = {}; Object.keys(P.ecg).forEach(function (k) { c[k] = P.ecg[k]; });
    var h = P.highlight || {}; c.marks = h.marks || []; c.boxes = h.boxes || [];
    var r = ARX_ECG.render(c, P.seed || P.date);
    $("ecg").innerHTML = r.svg; $("ecg").setAttribute("data-w", r.W);
    $("ecg").classList.toggle("twelve", c.layout === "12");
    applyView();
  }
  function applyView() {
    if (NORMIE) { chartView(); return; }
    var svg = $("ecg").querySelector("svg"); if (!svg) return;
    var W = +$("ecg").getAttribute("data-w") || 135;
    svg.style.width = zoom ? Math.round(W * 4.4) + "px" : "100%";
    $("ecg").classList.toggle("zoomed", zoom);
    $("zoom").setAttribute("aria-pressed", zoom); $("zoom").textContent = zoom ? "🔍 Fit" : "🔍 Zoom";
    var hasHl = P && P.highlight && ((P.highlight.marks || []).length || (P.highlight.boxes || []).length);
    $("hl").hidden = !(st.done && hasHl);
    svg.classList.toggle("show", !!(st.done && showHl));
    $("hl").setAttribute("aria-pressed", showHl);
  }
  $("zoom").onclick = function () { zoom = !zoom; applyView(); };
  $("ecg").addEventListener("click", function () { if (!zoom && !NORMIE) { zoom = true; applyView(); } });
  if (NORMIE) { $("zoom").hidden = true; $("ecg").classList.add("chartbox"); }

  // ---------- Normie: mystery chart on ECG paper (drawn at the box's real pixel width, so text stays readable) ----------
  function fmt(v, dp) { return dp ? (+v).toFixed(dp) : String(Math.round(v * 1000) / 1000); }
  function decs(a) { return a.reduce(function (m, v) { var t = String(v).split(".")[1]; return Math.max(m, t ? t.length : 0); }, 0); }
  function drawChart() {
    if (!P || !P.chart) return;
    var c = P.chart, box = $("ecg"), W = Math.max(280, Math.min(640, Math.round(box.clientWidth || box.parentNode.clientWidth || 320)));
    var H = Math.round(Math.max(230, Math.min(340, W * 0.66)));
    var n = c.y.length, num = typeof c.x[0] === "number", yr = c.yrange || [Math.min.apply(null, c.y), Math.max.apply(null, c.y)];
    var yt = c.yticks || [], dp = Math.min(2, decs(yt.filter(function (v) { return v % 1; }).map(function (v) { return Math.round(v * 100) / 100; })));
    var fs = W < 400 ? 11 : 12, lw = Math.max.apply(null, yt.map(function (v) { return fmt(v, dp).length; }).concat([2])) * fs * 0.6;
    var L = Math.round(22 + lw + 8), R = 12, T = 26, B = 44, pw = W - L - R, ph = H - T - B;
    var x0 = num ? Math.min.apply(null, c.x) : 0, x1 = num ? Math.max.apply(null, c.x) : n - 1; if (x1 === x0) x1 = x0 + 1;
    function X(i) { var v = num ? c.x[i] : i; return L + (v - x0) / (x1 - x0) * pw; }
    function Y(v) { return T + ph - (v - yr[0]) / (yr[1] - yr[0]) * ph; }
    function f(v) { return Math.round(v * 10) / 10; }
    // paper: square ECG grid, minor = 1/5 major
    var M = W < 400 ? 30 : 36, m = M / 5, gi = "", ga = "", k, j;
    for (j = 0; j * m <= W; j++) { k = f(j * m); if (j % 5) gi += "M" + k + " 0V" + H; else ga += "M" + k + " 0V" + H; }
    for (j = 0; j * m <= H; j++) { k = f(j * m); if (j % 5) gi += "M0 " + k + "H" + W; else ga += "M0 " + k + "H" + W; }
    var o = '<rect class="ppr" width="' + W + '" height="' + H + '"/><path class="gmi" d="' + gi + '"/><path class="gma" d="' + ga + '"/>';
    // highlight bands (behind the line) and their labels (on top, staggered so they never overlap)
    var half = num ? 0 : pw / Math.max(1, n - 1) / 2, hb = "", ht = "", rows = [];
    (c.highlights || []).forEach(function (h, q) {
      var a = Math.max(L, X(h.from) - half), b = Math.min(L + pw, X(h.to) + half); if (b - a < 6) { var mid = (a + b) / 2; a = mid - 3; b = mid + 3; }
      var t = q % 2 ? " t2" : "";
      hb += '<rect class="cband' + t + '" x="' + f(a) + '" y="' + T + '" width="' + f(b - a) + '" height="' + ph + '"/>';
      if (h.label) {
        var cx = (a + b) / 2, tw = String(h.label).length * fs * 0.6 + 6, anc = "middle", tx = cx;
        if (cx - tw / 2 < L + 2) { anc = "start"; tx = L + 3; } else if (cx + tw / 2 > L + pw - 2) { anc = "end"; tx = L + pw - 3; }
        var s0 = anc === "start" ? tx : anc === "end" ? tx - tw : tx - tw / 2, row = 0;
        while (rows.some(function (r) { return r.row === row && s0 < r.e && s0 + tw > r.s; })) row++;
        rows.push({ s: s0, e: s0 + tw, row: row });
        ht += '<text class="clab' + t + '" x="' + f(tx) + '" y="' + (T + fs + 3 + row * (fs + 4)) + '" text-anchor="' + anc + '">' + esc(h.label) + "</text>";
      }
    });
    // axes and ticks
    var ax = "", tl = "";
    yt.forEach(function (v) { var y = f(Y(v)); if (y < T - 1 || y > T + ph + 1) return; ax += "M" + L + " " + y + "H" + (L + pw); tl += '<text class="cty" x="' + (L - 6) + '" y="' + f(y + fs * 0.35) + '">' + fmt(v, dp) + "</text>"; });
    // x tick labels: if they'd collide, label every 2nd (3rd...) tick evenly rather than skipping at random
    var minGap = W < 400 ? 5 : 7, xs = (c.xticks || []).map(function (t) { var x = f(X(t.i)), w = String(t.label).length * fs * 0.6; return { x: x, w: w, cx: Math.max(L - 4 + w / 2, Math.min(W - 2 - w / 2, x)), label: t.label }; }), stride = 1;
    function fits(sd) { var lastR = -1e9; return xs.every(function (t, q) { if (q % sd) return true; var okk = t.cx - t.w / 2 >= lastR + minGap; lastR = t.cx + t.w / 2; return okk; }); }
    while (stride < xs.length && !fits(stride)) stride++;
    xs.forEach(function (t, q) {
      tl += '<path class="ctk" d="M' + t.x + " " + (T + ph) + 'v' + (q % stride ? 3 : 5) + '"/>';
      if (!(q % stride)) tl += '<text class="ctx" x="' + f(t.cx) + '" y="' + (T + ph + fs + 6) + '">' + esc(t.label) + "</text>";
    });
    var axes = '<path class="cgl" d="' + ax + '"/><path class="cax" d="M' + L + " " + T + "V" + (T + ph) + "H" + (L + pw) + '"/>';
    var lab = '<text class="cxl" x="' + f(L + pw / 2) + '" y="' + (H - 8) + '">' + esc(c.xlabel || "") + "</text>" +
      '<text class="cyl" transform="translate(' + (fs + 2) + " " + f(T + ph / 2) + ') rotate(-90)">' + esc(c.ylabel || "") + "</text>" +
      '<text class="ctt" x="' + (L + 2) + '" y="' + (T - 9) + '">' + esc(c.title || "") + "</text>";
    var pts = [], i;
    for (i = 0; i < n; i++) { var px = f(X(i)), py = f(Y(c.y[i])); if (c.step && i) pts.push(px + " " + f(Y(c.y[i - 1]))); pts.push(px + " " + py); }
    var line = '<path class="cln" d="M' + pts.join("L") + '"/>';
    box.innerHTML = '<svg class="ecg chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc((c.title || "Chart") + ": " + (c.ylabel || "") + " by " + (c.xlabel || "")) + '">' + o + '<g class="bands">' + hb + "</g>" + axes + tl + lab + line + '<g class="blabs">' + ht + "</g></svg>";
    box.setAttribute("data-cw", W);
    chartView();
  }
  function chartView() {
    var svg = $("ecg").querySelector("svg"); if (!svg || !P) return;
    var has = ((P.chart && P.chart.highlights) || []).length > 0, w = wrongCount();
    svg.classList.toggle("bands-on", !!(has && (st.done ? showHl : w > 0)));
    svg.classList.toggle("labs-on", !!(has && st.done && showHl));
    $("hl").hidden = !(st.done && has); $("hl").setAttribute("aria-pressed", showHl);
  }
  // Redraw when the box changes width (game revealed after the splash, CSS arriving, rotation, resize).
  if (NORMIE) {
    var rz, redraw = function () { clearTimeout(rz); rz = setTimeout(function () { var bx = $("ecg"); if (P && bx && bx.clientWidth && Math.abs((+bx.getAttribute("data-cw") || 0) - bx.clientWidth) > 8) drawChart(); }, 60); };
    if (window.ResizeObserver) new ResizeObserver(redraw).observe($("ecg").parentNode); else window.addEventListener("resize", redraw);
  }
  $("hl").onclick = function () { showHl = !showHl; applyView(); };

  // ---------- options ----------
  function seeded(n) { var a = n >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(list, seed) { var o = list.slice(), r = seeded(seed); for (var k = o.length - 1; k > 0; k--) { var j = Math.floor(r() * (k + 1)); var t = o[k]; o[k] = o[j]; o[j] = t; } return o; }
  function wrongCount() { return st.picks.filter(function (x) { return x !== P.answer; }).length; }
  function render() {
    if (!P) return;
    $("opts").innerHTML = OPTS.map(function (o, i) {
      var picked = st.picks.indexOf(o) >= 0, cls = "choice";
      if (picked && o !== P.answer) cls += " wrong";
      if (o === P.answer && (st.win || st.done)) cls += " right";
      if (o === P.answer && st.done && !st.win) cls += " reveal";
      return '<button type="button" class="' + cls + '" data-i="' + i + '"' + (picked || st.done ? " disabled" : "") + ">" + esc(o) + "</button>";
    }).join("");
    var w = wrongCount();
    $("tries").innerHTML = [0, 1, 2].map(function (i) { var c = i < st.picks.length ? (st.picks[i] === P.answer ? "ok" : "no") : ""; return '<i class="' + c + '"></i>'; }).join("") + '<span>' + (st.done ? "" : (TRIES - st.picks.length) + (TRIES - st.picks.length === 1 ? " try left" : " tries left")) + "</span>";
    $("hints").innerHTML = P.hints.slice(0, Math.min(w, P.hints.length)).map(function (h, i) { return '<li><b>Hint ' + (i + 1) + ":</b> " + esc(h) + "</li>"; }).join("");
    renderResult(); applyView();
  }
  $("opts").addEventListener("click", function (e) {
    var b = e.target.closest(".choice"); if (!b || b.disabled || !P || st.done) return;
    var o = OPTS[+b.getAttribute("data-i")]; if (st.picks.indexOf(o) >= 0) return;
    st.picks.push(o);
    if (o === P.answer) finish(true);
    else if (st.picks.length >= TRIES) finish(false);
    else { put(KEY, st); say(pick(SASS.wrong)); }
    render();
    if (st.done) setTimeout(function () { var r = $("result"); if (r && r.scrollIntoView) r.scrollIntoView({ behavior: "smooth", block: "start" }); }, 250);
  });
  function finish(win) {
    st.done = true; st.win = win; put(KEY, st);
    if (isLive() && stats.last !== today) {
      var yest = stats.last && stats.last === prevRel(today); // streak across release days
      stats.played++; if (win) stats.wins++;
      stats.streak = win ? (yest ? stats.streak + 1 : 1) : 0; stats.best = Math.max(stats.best, stats.streak);
      stats.dist[win ? st.picks.length - 1 : 3]++; stats.last = today; put(SKEY, stats);
    }
    say(win ? pick(SASS.win[st.picks.length - 1]) : "It was " + P.answer + ". " + pick(SASS.lose));
  }
  function renderResult() {
    var r = $("result");
    if (!st.done) { r.hidden = true; return; }
    var row = st.picks.map(function (x) { return x === P.answer ? "🟩" : "🟥"; }).join("");
    var share = NAME + " #" + P.number + (isLive() ? "" : " (archive)") + " · " + P.difficulty + "  " + (st.win ? (NORMIE ? "📈 " : "💓 ") + st.picks.length : (NORMIE ? "📉 X" : "💔 X")) + "/3\n" + row + "\nmaladywise.com";
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0, max = Math.max.apply(null, stats.dist.concat([1])), mine = st.win ? st.picks.length - 1 : 3;
    var cheer = st.win ? '<div class="masc"><img src="' + BASE + '../assets/mascots/' + (NORMIE ? "normie/" : "") + 'arrhythmix.svg" alt="" width="56" height="56"><p><b>Riff:</b> ' + pick(CHEER) + "</p></div>" : "";
    r.hidden = false;
    r.innerHTML = '<p class="kicker">' + (st.win ? "Correct" : "The answer") + "</p><h2>" + esc(P.answer) + "</h2>" + cheer +
      '<p class="exp">' + esc(P.explanation) + "</p>" +
      '<h3>Key features</h3><ul class="feat">' + P.features.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" +
      '<div class="pearl"><b>' + (NORMIE ? "💡 Takeaway" : "🦪 Pearl") + '</b><p>' + esc(P.pearl) + "</p></div>" +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Win %</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + stats.best + "</b><span>Best</span></div></div>" +
      '<div class="dist">' + stats.dist.map(function (n, i) { return "<div><span>" + (i < 3 ? i + 1 : "X") + '</span><i class="' + (i === mine && isLive() ? "me" : "") + '" style="width:' + Math.max(8, Math.round(n / max * 100)) + '%">' + n + "</i></div>"; }).join("") + "</div>" +
      '<pre id="arx-share">' + share + '</pre><button class="btn" type="button" id="arx-copy">Copy result</button>';
    $("copy").onclick = function () {
      var b = this;
      function sel() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, sel); } catch (e) { sel(); }
    };
  }
  function tick() {
    var n = dayNum(sydToday()), wd = new Date(n * 864e5).getUTCDay(), days = Math.min.apply(null, RD.map(function (r) { return (r - wd + 7) % 7 || 7; })), t;
    if (days === 1) {
      t = "New " + U + " tonight at midnight, Sydney time.";
      try { var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
        var left = 1440 - ((p[0] % 24) * 60 + p[1]); t = "Next " + U + " in " + Math.floor(left / 60) + "h " + (left % 60) + "m. Midnight, Sydney time."; } catch (e) {}
    } else t = "Next " + U + " in " + days + " days. Every " + DAYW + ", midnight Sydney time. " + (NORMIE ? "Mind your own trend line." : "Mind your own rhythm.");
    $("next").textContent = t;
  }

  // ---------- load ----------
  var ALLP = null;
  function all() {
    if (!ALLP) ALLP = fetch(BASE + "puzzles/" + FILE + "?v=" + BUILD, { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }).then(function (l) { return Array.isArray(l) ? l : []; });
    return ALLP;
  }
  function show(date) {
    today = date; loadDay(); P = null; say(""); showHl = true;
    return all().then(function (list) {
      P = list.filter(function (x) { return x.date === date; })[0] || null;
      if (!P) {
        $("play").classList.add("empty"); $("ecg").innerHTML = ""; $("opts").innerHTML = ""; $("tries").innerHTML = ""; $("hints").innerHTML = ""; $("result").hidden = true; $("vig").textContent = "";
        if (NORMIE && window.MW_noNormie) { say(""); $("ecg").innerHTML = ""; if (!root.querySelector(".arx-nn")) $("play").insertAdjacentHTML("afterbegin", '<div class="arx-nn">' + MW_noNormie("chart") + "</div>"); }
        else say("This week’s ECG is still printing. Back soon.");
        renderArchive(); return;
      }
      $("play").classList.remove("empty"); var nn = root.querySelector(".arx-nn"); if (nn) nn.remove();
      OPTS = shuffle(P.options, dayNum(P.date) * 97 + 13);
      $("eyebrow").textContent = (isLive() ? "Arrhythmix" : "Archive") + " · #" + P.number + " · " + nice(date);
      var b = $("badge"); b.hidden = false; b.className = "badge " + P.difficulty; b.textContent = P.difficulty;
      $("vig").textContent = P.vignette;
      drawEcg();
      if (!isLive()) say(st.done ? "Archive " + U + ". Already read." : "Archive " + U + ". Doesn’t count towards your streak.");
      else if (st.done) say(st.win ? (NORMIE ? "Cracked it. New chart next Thursday." : "Read and reported. New ECG next " + (new Date(dayNum(REAL) * 864e5).getUTCDay() === 4 ? "Monday." : "Thursday.")) : "You’ve had your go. New " + U + " soon.");
      render(); renderArchive();
    });
  }
  function renderArchive() {
    all().then(function (list) {
      var past = list.filter(function (x) { return x.date <= REAL && x.date !== today; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      var rows = past.map(function (x) {
        var s = load(PFX + "arx-day-" + x.date, null), mark = !s || !s.done ? "" : s.win ? " ✓" : " ✕";
        return '<button type="button" class="arow' + (x.date === today ? " on" : "") + '" data-d="' + x.date + '"><span>#' + x.number + " · " + nice(x.date) + mark + '</span><span class="badge ' + x.difficulty + '">' + x.difficulty + "</span></button>";
      }).join("");
      var back = isLive() ? "" : '<button type="button" class="btn" id="arx-back">Back to this week</button>';
      $("alist").innerHTML = back + (rows || '<p class="note">No past ' + U + 's yet. You’re early.</p>');
      Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); }; });
      if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
    });
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };

  tick(); setInterval(tick, 60000);
  if (PRE) {
    // Before the first ECG Thursday: friendly holding note, no puzzle.
    $("play").innerHTML = NORMIE ? '<div class="mw-nonorm arx-pre"><img src="/assets/mascots/normie/arrhythmix.svg" alt="" width="72" height="72"><p><b>First mystery chart lands Thursday 29 October.</b></p><p>One mystery chart of real-world data every Thursday, released at midnight Sydney time. Riff is tuning up the axes.</p></div>'
      : '<div class="mw-nonorm arx-pre"><img src="/assets/mascots/arrhythmix.svg" alt="" width="72" height="72"><p><b>First ECG lands Thursday 29 October.</b></p><p>Arrhythmix: one fictional case and one ECG every Monday and Thursday, released at midnight Sydney time. Riff is warming up the leads.</p></div>';
    $("archive").hidden = true;
  } else show(today);
})();
