/* Glimpsis: spot the sign. One real clinical image a day; pick the sign or diagnosis. Three tries; each wrong pick reveals a hint.
   Puzzles in puzzles/YYYY-MM.json: {date, number, difficulty, title, context, question, img:{file, author, licence, licence_url, page, alt},
   answer, wrong:[5], hints:[2 strings], why, assoc:[...], pearl}. Images are hotlinked from Wikimedia Commons (free licences only:
   PD, CC0, CC BY, CC BY-SA) with attribution. The file name is only linked after answering (it often names the sign).
   Medical only: no Normie version yet. Check with glimpsis/check.py. */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "2", TRIES = 3, NAME = "Glimpsis";
  var root = document.getElementById("glm");
  if (!document.querySelector("link[data-glm]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "glimpsis.css?v=" + BUILD; l.setAttribute("data-glm", ""); document.head.appendChild(l);
  }
  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="glm-eyebrow">Glimpsis</span><span class="badge" id="glm-badge" hidden></span></div>' +
    ' <section class="report" id="glm-report" aria-label="Today’s image"></section>' +
    ' <div class="pzl" id="glm-play" hidden>' +
    '  <div class="tries"><span class="tl" id="glm-q">What’s the sign?</span><span class="vials" id="glm-vials" aria-label="Tries left"></span></div>' +
    '  <div class="msg" id="glm-msg" aria-live="polite"></div>' +
    '  <div class="hints" id="glm-hints"></div>' +
    '  <div class="opts" id="glm-opts"></div>' +
    ' </div>' +
    ' <div class="result" id="glm-result" hidden></div>' +
    ' <p class="note" id="glm-next"></p>' +
    ' <details class="archive" id="glm-archive"><summary>Past images</summary><div class="alist" id="glm-alist"></div></details>' +
    ' <p class="note">Real clinical photos, mostly from the CDC Public Health Image Library (public domain), credited under each image. Scenarios are fictional. General education, not personal medical advice.</p>' +
    "</div>";
  var $ = function (id) { return document.getElementById("glm-" + id); };

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
  var SKEY = "glm-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0] });
  var KEY, st, P = null, START = "2026-10-28";
  function loadDay() { KEY = "glm-day-" + today; st = load(KEY, { picks: [], done: false, win: false }); }
  loadDay();

  // ---------- sass (mocks the guess, never the patient) ----------
  function pick(a) { if (a.length < 2) return a[0]; var k = "mw-last-" + a[0].slice(0, 12), last; try { last = sessionStorage.getItem(k); } catch (e) {} var x, n = 0; do { x = a[Math.floor(Math.random() * a.length)]; } while (x === last && ++n < 8); try { sessionStorage.setItem(k, x); } catch (e) {} return x; }
  var SASS = {
    wrong: ["Look again. Properly this time.", "The picture disagrees.", "Bold. Wrong, but bold.", "That’s a sign. Just not this one.", "Inspection is step one for a reason.", "Somewhere a dermatologist winced.", "Plausible. Also wrong.", "Your eyes were open, right?", "Confidently incorrect. A classic.", "A thousand words, and none of them were that.", "Zoom in. We’ll wait.", "Interesting. Incorrect, but interesting.", "The image would like a second opinion."],
    win: [["First glance. Spotter of the year.", "One look and done. Eagle eyes.", "First try. Frame it for the clinic wall.", "Straight to it. Suspiciously good."], ["Second pick. Nicely spotted.", "Two tries. The hint helped. We saw.", "Got there on two. Solid.", "Second look. Registrar-level."], ["Last try. Phew. For everyone.", "Third time. A buzzer-beater.", "Scraped in. A spot is a spot.", "Final pick. Squinting paid off."]],
    lose: ["The image wins today. Rematch tomorrow.", "Out of tries. Read the explanation and nod wisely.", "Missed it. It was right there.", "Not today. Tomorrow’s image is already developing.", "Stumped. Even the textbook took a while.", "Hidden in plain sight. Classic."]
  };
  function say(t) { var m = $("msg"); m.textContent = t; m.classList.remove("pop"); void m.offsetWidth; if (t) m.classList.add("pop"); }

  // ---------- helpers ----------
  function seeded(a) { a = a >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function options() { var o = [P.answer].concat(P.wrong), r = seeded(dayNum(P.date) * 61 + 11); for (var k = o.length - 1; k > 0; k--) { var j = Math.floor(r() * (k + 1)), t = o[k]; o[k] = o[j]; o[j] = t; } return o; }
  function src(w) { return P.img.url ? P.img.url : "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(P.img.file.replace(/ /g, "_")) + "?width=" + w; }
  function srcName() { return P.img.source || (P.img.url ? "CDC Public Health Image Library" : "Wikimedia Commons"); }
  var EIN = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/></svg>';

  // ---------- render ----------
  function credit() {
    var i = P.img, lic = i.licence_url ? '<a href="' + esc(i.licence_url) + '" target="_blank" rel="noopener">' + esc(i.licence) + "</a>" : esc(i.licence);
    if (!st.done) return "Image: " + esc(i.author) + " · " + lic + " · " + esc(srcName()) + ". Full source shown after you answer.";
    var nm = i.file ? i.file.replace(/\.[a-z]+$/i, "").replace(/_/g, " ") : "Source page";
    return 'Image: <a href="' + esc(i.page) + '" target="_blank" rel="noopener">' + esc(nm) + "</a> by " + esc(i.author) + " · " + lic + " · via " + esc(srcName()) + ".";
  }
  function renderReport() {
    $("report").innerHTML =
      '<p class="ctx"><b>' + esc(P.title || "Take a look") + "</b>" + esc(P.context || "") + "</p>" +
      '<div class="imgbox" id="glm-box" role="button" tabindex="0" aria-label="Enlarge image"><img id="glm-img" src="' + src(1000) + '" alt="' + esc(st.done ? P.img.alt || P.answer : "Clinical image for today’s puzzle") + '" referrerpolicy="no-referrer"><span class="zm">Tap to zoom</span></div>' +
      '<p class="credit">' + credit() + "</p>";
    var img = $("img");
    img.onerror = function () { $("box").innerHTML = '<p class="err">The image didn’t load. Wikimedia may be having a moment. Try refreshing.</p>'; };
    $("box").onclick = zoom; $("box").onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); zoom(); } };
  }
  function zoom() {
    var lb = document.createElement("div"); lb.className = "glm-lb";
    lb.innerHTML = '<img src="' + src(2000) + '" alt="" referrerpolicy="no-referrer"><button type="button">Close ✕</button>';
    function close() { lb.remove(); document.removeEventListener("keydown", k); }
    function k(e) { if (e.key === "Escape") close(); }
    lb.onclick = close;
    document.addEventListener("keydown", k); document.body.appendChild(lb); lb.querySelector("button").focus();
  }
  function renderPlay() {
    var wrong = st.picks.filter(function (x) { return x !== P.answer; });
    $("play").hidden = st.done; $("q").textContent = P.question || "What’s the sign?";
    var left = TRIES - st.picks.length;
    $("vials").innerHTML = [0, 1, 2].map(function (i) { return '<i class="' + (i < left ? "full" : "used") + '"></i>'; }).join("") + "<b>" + left + " left</b>";
    $("hints").innerHTML = wrong.map(function (x, i) { return P.hints[i] ? '<p class="hint"><b>Hint ' + (i + 1) + ".</b> " + esc(P.hints[i]) + "</p>" : ""; }).join("");
    $("opts").innerHTML = options().map(function (o) {
      var picked = st.picks.indexOf(o) >= 0;
      return '<button type="button" class="opt' + (picked ? " wrong" : "") + '" data-o="' + esc(o) + '"' + (picked ? " disabled" : "") + ">" + esc(o) + "</button>";
    }).join("");
  }
  function renderResult() {
    var r = $("result");
    if (!st.done) { r.hidden = true; return; }
    var n = st.picks.length;
    var grid = st.picks.map(function (x) { return x === P.answer ? "🟩" : "🟥"; }).join("") + (st.win ? new Array(TRIES - n + 1).join("⬜") : "");
    var share = NAME + " #" + P.number + (isLive() ? "" : " (archive)") + " · " + P.difficulty + " 👁️  " + (st.win ? n : "X") + "/" + TRIES + "\n" + grid + "\nmaladywise.com";
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0, max = Math.max.apply(null, stats.dist.concat([1])), mine = st.win ? n - 1 : 3;
    r.hidden = false;
    r.innerHTML = '<p class="verdict ' + (st.win ? "ok" : "no") + '">' + (st.win ? "Spotted on try " + n + " of " + TRIES : "Not this time") + "</p>" +
      "<h2>" + esc(P.answer) + "</h2>" +
      (st.picks.length && !st.win ? '<p class="yours">Your picks: ' + st.picks.map(esc).join(" · ") + "</p>" : "") +
      '<div class="why"><b>What you’re looking at</b><p>' + esc(P.why) + "</p></div>" +
      (P.assoc && P.assoc.length ? '<div class="clinch"><b>Think of</b><div class="assoc">' + P.assoc.map(function (a) { return "<span>" + esc(a) + "</span>"; }).join("") + "</div></div>" : "") +
      '<div class="pearl"><b>Teaching pearl</b><p>' + esc(P.pearl) + "</p></div>" +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Win %</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + stats.best + "</b><span>Best</span></div></div>" +
      '<div class="dist">' + stats.dist.map(function (c, i) { return "<div><span>" + (i < 3 ? i + 1 : "X") + '</span><i class="' + (i === mine && isLive() ? "me" : "") + '" style="width:' + Math.max(8, Math.round(c / max * 100)) + '%">' + c + "</i></div>"; }).join("") + "</div>" +
      '<pre id="glm-share">' + esc(share) + '</pre><button class="btn" type="button" id="glm-copy">Copy result</button>';
    $("copy").onclick = function () {
      var b = this;
      function sel() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, sel); } catch (e) { sel(); }
    };
  }
  function paint(full) { if (full !== false) renderReport(); else { var c = root.querySelector(".credit"); if (c) c.innerHTML = credit(); var im = $("img"); if (im && st.done) im.alt = P.img.alt || P.answer; } renderPlay(); renderResult(); }
  function tick() {
    var t = "A new image arrives at midnight, Sydney time.";
    try { var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
      var left = 1440 - ((p[0] % 24) * 60 + p[1]); t = "Next image in " + Math.floor(left / 60) + "h " + (left % 60) + "m. Rest your eyes."; } catch (e) {}
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
      say(win ? "⚛️ Einstein solved. Roughly a once-in-50-days image, and you spotted it. Screenshot this." : "Even Einstein would have asked for a better photo. Respect for taking on the rare one.");
      if (win && isLive()) { var tro = load("mw-einstein", []); if (!tro.some(function (t) { return t.g === "glimpsis" && t.d === today; })) { tro.push({ g: "glimpsis", d: today }); put("mw-einstein", tro); } }
    } else say(win ? pick(SASS.win[st.picks.length - 1]) : pick(SASS.lose));
  }
  $("opts").addEventListener("click", function (e) {
    var b = e.target.closest(".opt"); if (!b || !P || st.done || b.disabled) return;
    var o = b.getAttribute("data-o"); if (st.picks.indexOf(o) >= 0) return;
    st.picks.push(o);
    if (o === P.answer) { finish(true); paint(false); $("result").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (st.picks.length >= TRIES) { finish(false); paint(false); $("result").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    put(KEY, st); say(pick(SASS.wrong)); paint(false);
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
        $("report").innerHTML = '<p class="empty">' + (date < START ? "Glimpsis opens " + nice(START) + ". Polishing the lenses." : "Today’s image is still developing. Back tomorrow.") + "</p>";
        renderArchive(); return;
      }
      $("eyebrow").textContent = (isLive() ? "Glimpsis" : "Archive") + " · #" + P.number + " · " + nice(date);
      var b = $("badge"); b.hidden = false; b.className = "badge " + P.difficulty; b.innerHTML = (P.difficulty === "Einstein" ? EIN : "") + P.difficulty; root.classList.toggle("einstein", P.difficulty === "Einstein");
      say("");
      if (!isLive()) say(st.done ? "Archive image. Already spotted." : "Archive image. Doesn’t count towards your streak.");
      else if (st.done) say(st.win ? "Spotted. Come back tomorrow." : "You’ve had your look. Back tomorrow.");
      paint(); renderArchive();
    });
  }
  function renderArchive() {
    var m = REAL.slice(0, 7);
    Promise.all([prevMonth(m) < "2026-10" ? Promise.resolve([]) : month(prevMonth(m)), month(m)]).then(function (ls) {
      var past = [].concat(ls[0], ls[1]).filter(function (x) { return x.date < REAL; }).reverse();
      var rows = past.map(function (x) {
        var s = load("glm-day-" + x.date, null), mark = !s || !s.done ? "" : s.win ? " ✓" : " ✕";
        return '<button type="button" class="arow' + (x.date === today ? " on" : "") + '" data-d="' + x.date + '"><span>#' + x.number + " · " + nice(x.date) + mark + '</span><span class="badge ' + x.difficulty + '">' + x.difficulty + "</span></button>";
      }).join("");
      var back = isLive() ? "" : '<button type="button" class="btn" id="glm-back">Back to today</button>';
      $("alist").innerHTML = back + (rows || '<p class="note">No past images yet. You’re early.</p>');
      Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); }; });
      if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
    });
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };

  tick(); setInterval(tick, 60000);
  show(today);
})();
