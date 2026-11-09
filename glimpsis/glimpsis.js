/* Glimpsis: spot the sign. One real clinical image a day; pick the sign or diagnosis. Three tries; each wrong pick reveals a hint.
   Puzzles in puzzles/YYYY-MM.json: {date, number, difficulty, title, context, question, img:{file, author, licence, licence_url, page, alt},
   answer, wrong:[5], hints:[2 strings], why, assoc:[...], pearl}. Images are hotlinked from Wikimedia Commons (free licences only:
   PD, CC0, CC BY, CC BY-SA) with attribution. The file name is only linked after answering (it often names the sign).
   Normie mode ("What is it?"): puzzles/normie/YYYY-MM.json, same entry format (why = what it is, pearl = fun fact, assoc optional),
   images self-hosted in img/normie/, "n-" storage keys, no medicine. Missing Normie file -> MW_noNormie. Check with glimpsis/check.py.
   Practice ("Sign spotting practice"): 5 random PAST daily images a round, one pick each, never counts (no stats, streaks or shares).
   Glimpsathon ("Ten on Tuesday", from 2026-11-17): puzzles/athon/YYYY-MM-DD.json (Normie: puzzles/athon/normie/) =
   {date, number, items:[10 x {difficulty, context?, img:{url, source, page, author, licence, licence_url, alt}, answer, wrong:[5], why, pearl}]},
   items ramp 3 Easy, 3 Medium, 3 Hard, 1 Genius; images in img/athon/(normie/)YYYY-MM-DD-NN.jpg. One pick each, one scored go,
   stored in "glm-athon-<date>" (separate from daily stats). */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "5", TRIES = 3;
  var NORMIE = !!(window.MW_mode && MW_mode() === "normie"), NAME = NORMIE ? "Glimpsis (Normie)" : "Glimpsis", PFX = NORMIE ? "n-" : "", PDIR = NORMIE ? "puzzles/normie/" : "puzzles/";
  var NT = { q: "What is it?", foot: "Real close-ups and microscope images of everyday things, animals and plants, from Wikimedia Commons under free licences (public domain, CC0, CC BY, CC BY-SA), credited under each image. Just for fun.", alt: "Mystery close-up for today’s puzzle", unit: "close-up" };
  var root = document.getElementById("glm");
  if (!document.querySelector("link[data-glm]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "glimpsis.css?v=" + BUILD; l.setAttribute("data-glm", ""); document.head.appendChild(l);
  }
  root.innerHTML =
    '<div class="wrap" id="glm-main">' +
    ' <div class="head"><span class="eyebrow" id="glm-eyebrow">Glimpsis</span><span class="badge" id="glm-badge" hidden></span></div>' +
    ' <div class="xbox" id="glm-xbox" hidden></div>' +
    ' <section class="report" id="glm-report" aria-label="Today’s image"></section>' +
    ' <div class="pzl" id="glm-play" hidden>' +
    '  <div class="tries"><span class="tl" id="glm-q">' + (NORMIE ? NT.q : "What’s the sign?") + '</span><span class="vials" id="glm-vials" aria-label="Tries left"></span></div>' +
    '  <div class="msg" id="glm-msg" aria-live="polite"></div>' +
    '  <div class="hints" id="glm-hints"></div>' +
    '  <div class="opts" id="glm-opts"></div>' +
    ' </div>' +
    ' <div class="result" id="glm-result" hidden></div>' +
    ' <p class="note" id="glm-next"></p>' +
    ' <div class="pbar"><button type="button" class="btn ghost" id="glm-prac">' + (NORMIE ? "Close-up spotting practice" : "Sign spotting practice") + '</button><small>Past images, 5 a round. Practice: doesn’t count.</small></div>' +
    ' <details class="archive" id="glm-archive"><summary>Past images</summary><div class="alist" id="glm-alist"></div></details>' +
    ' <p class="note">' + (NORMIE ? NT.foot : "Real clinical photos, mostly from the CDC Public Health Image Library (public domain), credited under each image. Scenarios are fictional. General education, not personal medical advice.") + '</p>' +
    "</div>" +
    '<div class="wrap sprint" id="glm-sprint" hidden></div>';
  var $ = function (id) { return document.getElementById("glm-" + id); };
  if (NORMIE) { var fixFoot = function () { var ft = document.querySelector("footer.site"); if (ft) [].slice.call(ft.childNodes).forEach(function (n) { if (n.nodeType === 3 && /^\s*Images:/.test(n.textContent)) n.textContent = "Images: Wikimedia Commons under free licences, credited on each puzzle. Just for fun."; }); }; if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fixFoot); else fixFoot(); }

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
  var SKEY = PFX + "glm-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0] });
  var KEY, st, P = null, START = NORMIE ? "2026-11-08" : "2026-10-25";
  function loadDay() { KEY = PFX + "glm-day-" + today; st = load(KEY, { picks: [], done: false, win: false }); }
  loadDay();

  // ---------- sass (mocks the guess, never the patient) ----------
  function pick(a) { if (a.length < 2) return a[0]; var k = "mw-last-" + a[0].slice(0, 12), last; try { last = sessionStorage.getItem(k); } catch (e) {} var x, n = 0; do { x = a[Math.floor(Math.random() * a.length)]; } while (x === last && ++n < 8); try { sessionStorage.setItem(k, x); } catch (e) {} return x; }
  var SASS = {
    wrong: ["Look again. Properly this time.", "The picture disagrees.", "Bold. Wrong, but bold.", "That’s a sign. Just not this one.", "Inspection is step one for a reason.", "Somewhere a dermatologist winced.", "Plausible. Also wrong.", "Your eyes were open, right?", "Confidently incorrect. A classic.", "A thousand words, and none of them were that.", "Zoom in. We’ll wait.", "Interesting. Incorrect, but interesting.", "The image would like a second opinion."],
    win: [["First glance. Spotter of the year.", "One look and done. Eagle eyes.", "First try. Frame it for the clinic wall.", "Straight to it. Suspiciously good."], ["Second pick. Nicely spotted.", "Two tries. The hint helped. We saw.", "Got there on two. Solid.", "Second look. Registrar-level."], ["Last try. Phew. For everyone.", "Third time. A buzzer-beater.", "Scraped in. A spot is a spot.", "Final pick. Squinting paid off."]],
    lose: ["The image wins today. Rematch tomorrow.", "Out of tries. Read the explanation and nod wisely.", "Missed it. It was right there.", "Not today. Tomorrow’s image is already developing.", "Stumped. Even the textbook took a while.", "Hidden in plain sight. Classic."]
  };
  if (NORMIE) SASS = { wrong: ["Look again. Properly this time.", "The picture disagrees.", "Bold. Wrong, but bold.", "That’s a thing. Just not this thing.", "Zoom in. We’ll wait.", "Plausible. Also wrong.", "Your eyes were open, right?", "Confidently incorrect. A classic.", "A thousand words, and none of them were that.", "Interesting. Incorrect, but interesting.", "The image would like a second opinion.", "Close up, far off."], win: [["First glance. Eagle eyes.", "One look and done. Microscope energy.", "First try. Frame it for the fridge.", "Straight to it. Suspiciously good."], ["Second pick. Nicely spotted.", "Two tries. The hint helped. We saw.", "Got there on two. Solid.", "Second look. Sharp."], ["Last try. Phew. For everyone.", "Third time. A buzzer-beater.", "Scraped in. A spot is a spot.", "Final pick. Squinting paid off."]], lose: ["The close-up wins today. Rematch tomorrow.", "Out of tries. Read the fun fact and nod wisely.", "Missed it. It was right there. Very, very close.", "Not today. Tomorrow’s close-up is already in focus.", "Stumped. Zoomed-in things are sneaky."] };
  function say(t) { var m = $("msg"); m.textContent = t; m.classList.remove("pop"); void m.offsetWidth; if (t) m.classList.add("pop"); }

  // ---------- helpers ----------
  function seeded(a) { a = a >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function options() { var o = [P.answer].concat(P.wrong), r = seeded(dayNum(P.date) * 61 + 11); for (var k = o.length - 1; k > 0; k--) { var j = Math.floor(r() * (k + 1)), t = o[k]; o[k] = o[j]; o[j] = t; } return o; }
  function srcOf(im, w) { return im.url ? (/^https?:/.test(im.url) ? im.url : BASE + im.url) : "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(im.file.replace(/ /g, "_")) + "?width=" + w; }
  function src(w) { return srcOf(P.img, w); }
  function srcNameOf(im) { return im.source || (im.url ? "CDC Public Health Image Library" : "Wikimedia Commons"); }
  function srcName() { return srcNameOf(P.img); }
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
      '<div class="imgbox" id="glm-box" role="button" tabindex="0" aria-label="Enlarge image"><img id="glm-img" src="' + src(1000) + '" alt="' + esc(st.done ? P.img.alt || P.answer : (NORMIE ? NT.alt : "Clinical image for today’s puzzle")) + '" referrerpolicy="no-referrer"><span class="zm">Tap to zoom</span></div>' +
      '<p class="credit">' + credit() + "</p>";
    var img = $("img");
    img.onerror = function () { $("box").innerHTML = '<p class="err">The image didn’t load. Wikimedia may be having a moment. Try refreshing.</p>'; };
    $("box").onclick = function () { zoom(src(2000)); }; $("box").onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); zoom(src(2000)); } };
  }
  function zoom(u) {
    var lb = document.createElement("div"); lb.className = "glm-lb";
    lb.innerHTML = '<img src="' + esc(u) + '" alt="" referrerpolicy="no-referrer"><button type="button">Close ✕</button>';
    function close() { lb.remove(); document.removeEventListener("keydown", k); }
    function k(e) { if (e.key === "Escape") close(); }
    lb.onclick = close;
    document.addEventListener("keydown", k); document.body.appendChild(lb); lb.querySelector("button").focus();
  }
  function renderPlay() {
    var wrong = st.picks.filter(function (x) { return x !== P.answer; });
    $("play").hidden = st.done; $("q").textContent = P.question || (NORMIE ? NT.q : "What’s the sign?");
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
      '<div class="why"><b>' + (NORMIE ? "What it is" : "What you’re looking at") + '</b><p>' + esc(P.why) + "</p></div>" +
      (P.assoc && P.assoc.length ? '<div class="clinch"><b>' + (NORMIE ? "Also" : "Think of") + '</b><div class="assoc">' + P.assoc.map(function (a) { return "<span>" + esc(a) + "</span>"; }).join("") + "</div></div>" : "") +
      '<div class="pearl"><b>' + (NORMIE ? "Fun fact" : "Teaching pearl") + '</b><p>' + esc(P.pearl) + "</p></div>" +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Win %</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + stats.best + "</b><span>Best</span></div></div>" +
      '<div class="dist">' + stats.dist.map(function (c, i) { return "<div><span>" + (i < 3 ? i + 1 : "X") + '</span><i class="' + (i === mine && isLive() ? "me" : "") + '" style="width:' + Math.max(8, Math.round(c / max * 100)) + '%">' + c + "</i></div>"; }).join("") + "</div>" +
      '<pre id="glm-share">' + esc(share) + '</pre><div class="btns"><button class="btn" type="button" id="glm-copy">Copy result</button><button class="btn ghost" type="button" id="glm-prac2">Practise on past images</button></div>';
    $("prac2").onclick = startPractice;
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
      say(win ? "⚛️ Einstein solved. Roughly a once-in-50-days image, and you spotted it. Screenshot this." : (NORMIE ? "Even Einstein would have asked to zoom out. Respect for taking on the rare one." : "Even Einstein would have asked for a better photo. Respect for taking on the rare one."));
      if (win && isLive()) { var tro = load(PFX + "mw-einstein", []); if (!tro.some(function (t) { return t.g === "glimpsis" && t.d === today; })) { tro.push({ g: "glimpsis", d: today }); put(PFX + "mw-einstein", tro); } }
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
    if (!cache[m]) cache[m] = fetch(BASE + PDIR + m + ".json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    return cache[m];
  }
  function prevMonth(m) { var p = m.split("-").map(Number); p[1]--; if (!p[1]) { p[1] = 12; p[0]--; } return p[0] + "-" + ("0" + p[1]).slice(-2); }
  function show(date) {
    today = date; loadDay(); P = null;
    return month(date.slice(0, 7)).then(function (list) {
      P = list.filter(function (x) { return x.date === date; })[0] || null;
      if (!P) {
        $("play").hidden = true; $("result").hidden = true; $("badge").hidden = true;
        $("report").innerHTML = date < START ? '<p class="empty">' + (NORMIE ? "Normie Glimpsis opens " + nice(START) + ". Polishing the magnifying glass." : "Glimpsis opens " + nice(START) + ". Polishing the lenses.") + "</p>"
          : NORMIE && window.MW_noNormie ? MW_noNormie(NT.unit) : '<p class="empty">Today’s image is still developing. Back tomorrow.</p>';
        renderArchive(); renderXbox(); return;
      }
      $("eyebrow").textContent = (isLive() ? "Glimpsis" : "Archive") + " · #" + P.number + " · " + nice(date);
      var b = $("badge"); b.hidden = false; b.className = "badge " + P.difficulty; b.innerHTML = (P.difficulty === "Einstein" ? EIN : "") + P.difficulty; root.classList.toggle("einstein", P.difficulty === "Einstein");
      say("");
      if (!isLive()) say(st.done ? "Archive image. Already spotted." : "Archive image. Doesn’t count towards your streak.");
      else if (st.done) say(st.win ? "Spotted. Come back tomorrow." : "You’ve had your look. Back tomorrow.");
      paint(); renderArchive(); renderXbox();
    });
  }
  function renderArchive() {
    var m = REAL.slice(0, 7);
    Promise.all([prevMonth(m) < (NORMIE ? "2026-11" : "2026-10") ? Promise.resolve([]) : month(prevMonth(m)), month(m)]).then(function (ls) {
      var past = [].concat(ls[0], ls[1]).filter(function (x) { return x.date < REAL; }).reverse();
      var rows = past.map(function (x) {
        var s = load(PFX + "glm-day-" + x.date, null), mark = !s || !s.done ? "" : s.win ? " ✓" : " ✕";
        return '<button type="button" class="arow' + (x.date === today ? " on" : "") + '" data-d="' + x.date + '"><span>#' + x.number + " · " + nice(x.date) + mark + '</span><span class="badge ' + x.difficulty + '">' + x.difficulty + "</span></button>";
      }).join("");
      var back = isLive() ? "" : '<button type="button" class="btn" id="glm-back">Back to today</button>';
      $("alist").innerHTML = back + (rows || '<p class="note">No past images yet. You’re early.</p>');
      Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); }; });
      if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
    });
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };

  // ---------- sprints: practice (past images, never counts) and Glimpsathon (Tuesdays, 10 images, one go) ----------
  var ATHON_FROM = "2026-11-17", ADIR = NORMIE ? "puzzles/athon/normie/" : "puzzles/athon/", ANAME = NORMIE ? "Glimpsathon (Normie)" : "Glimpsathon";
  var AUNIT = NORMIE ? "close-ups" : "signs", RAMP = ["Easy", "Easy", "Easy", "Medium", "Medium", "Medium", "Hard", "Hard", "Hard", "Genius"];
  var SP = null, spTimer = null, acache = {};
  function wday(d) { return new Date(dayNum(d) * 864e5).getUTCDay(); }
  function isAthonDay(d) { return wday(d) === 2 && d >= ATHON_FROM; }
  function athonFile(d) {
    if (!acache[d]) acache[d] = fetch(BASE + ADIR + d + ".json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    return acache[d];
  }
  function mmss(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
  function aKey(d) { return PFX + "glm-athon-" + d; }
  function renderXbox() {
    var x = $("xbox"), d = today; x.hidden = true;
    if (!isAthonDay(d)) return;
    athonFile(d).then(function (A) {
      if (d !== today || !A || !A.items || !A.items.length) return;
      var s = load(aKey(d), null), n = A.items.length, sc = s ? s.picks.filter(function (p, i) { return A.items[i] && p === A.items[i].answer; }).length : 0;
      var btn = !s || !s.picks.length ? "Start Glimpsathon" : s.done ? "See your " + sc + "/" + n : "Carry on (" + s.picks.length + "/" + n + ")";
      x.innerHTML = '<p class="xt">🔎 Today is Glimpsathon: ' + n + " " + AUNIT + ", one go</p>" +
        '<p class="xs">Ten on Tuesday, #' + esc(A.number) + ". Easy to Genius, one pick each. The clock is just for fun. Today’s daily image is still below.</p>" +
        '<button type="button" class="btn" id="glm-xgo">' + btn + "</button>";
      x.hidden = false;
      $("xgo").onclick = function () { startAthon(A); };
    });
  }
  function spShow(on) {
    $("main").hidden = on; $("sprint").hidden = !on;
    if (!on) { clearInterval(spTimer); SP = null; }
    (on ? $("sprint") : root).scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function startAthon(A) {
    var s = load(aKey(A.date), null) || { picks: [], t0: 0, t1: 0, done: false };
    if (!s.t0 && !s.done) { s.t0 = Date.now(); put(aKey(A.date), s); }
    SP = { kind: "athon", A: A, items: A.items, picks: s.picks.slice(), s: s, i: Math.min(s.picks.length, A.items.length), shown: false };
    spShow(true); spRender();
    clearInterval(spTimer); spTimer = setInterval(function () { var c = $("clock"); if (c && SP && SP.kind === "athon" && !SP.s.done) c.textContent = "⏱ " + mmss((Date.now() - SP.s.t0) / 1000); }, 1000);
  }
  var PRAC_KEY = PFX + "glm-prac-seen";
  function startPractice() {
    var ms = [], m = START.slice(0, 7), last = REAL.slice(0, 7);
    while (m <= last && ms.length < 60) { ms.push(m); var p = m.split("-").map(Number); p[1]++; if (p[1] > 12) { p[1] = 1; p[0]++; } m = p[0] + "-" + ("0" + p[1]).slice(-2); }
    Promise.all(ms.map(month)).then(function (ls) {
      var pool = [].concat.apply([], ls).filter(function (x) { return x && x.date < REAL && x.date >= START; });
      var seen = []; try { seen = JSON.parse(sessionStorage.getItem(PRAC_KEY)) || []; } catch (e) {}
      var fresh = pool.filter(function (x) { return seen.indexOf(x.date) < 0; }), note = "";
      if (!pool.length) { $("prac").textContent = "No past images yet"; return; }
      if (fresh.length < Math.min(5, pool.length)) { seen = []; fresh = pool.slice(); note = "You’ve seen every past image this session, so the pile is shuffled again."; }
      for (var k = fresh.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)), t = fresh[k]; fresh[k] = fresh[j]; fresh[j] = t; }
      var items = fresh.slice(0, 5);
      seen = seen.concat(items.map(function (x) { return x.date; })); try { sessionStorage.setItem(PRAC_KEY, JSON.stringify(seen)); } catch (e) {}
      SP = { kind: "practice", items: items, picks: [], i: 0, shown: false, note: note, left: pool.length - seen.length };
      spShow(true); spRender();
    });
  }
  function spOptions(it, i) {
    var o = [it.answer].concat(it.wrong), r = seeded(SP.kind === "athon" ? dayNum(SP.A.date) * 131 + i * 17 + 5 : dayNum(it.date) * 61 + 11);
    for (var k = o.length - 1; k > 0; k--) { var j = Math.floor(r() * (k + 1)), t = o[k]; o[k] = o[j]; o[j] = t; }
    return o;
  }
  function spCredit(im, open) {
    var lic = im.licence_url ? '<a href="' + esc(im.licence_url) + '" target="_blank" rel="noopener">' + esc(im.licence) + "</a>" : esc(im.licence);
    return "Image: " + (open && im.page ? '<a href="' + esc(im.page) + '" target="_blank" rel="noopener">source</a> · ' : "") + esc(im.author) + " · " + lic + " · " + esc(srcNameOf(im)) + (open ? "" : ". Source link after you pick.");
  }
  function spHead() {
    var n = SP.items.length, a = SP.kind === "athon";
    var dots = SP.items.map(function (it, i) { var p = SP.picks[i]; return '<i class="' + (p == null ? (i === SP.i ? "cur" : "") : p === it.answer ? "ok" : "no") + '"></i>'; }).join("");
    return '<div class="head"><span class="eyebrow">' + (a ? "Glimpsathon · #" + esc(SP.A.number) + " · " + nice(SP.A.date) : (NORMIE ? "Close-up" : "Sign spotting") + " practice") + "</span>" +
      '<span class="ptag">' + (a ? "Ten on Tuesday" : "Practice: doesn’t count") + "</span></div>" +
      '<div class="spbar"><span class="dots" aria-hidden="true">' + dots + "</span>" + (a ? '<span class="clock" id="glm-clock">⏱ ' + mmss(((SP.s.done ? SP.s.t1 : Date.now()) - SP.s.t0) / 1000) + "</span>" : "") + "</div>";
  }
  function spRender() {
    var el = $("sprint"), n = SP.items.length;
    if (SP.i >= n) { spEnd(); return; }
    var i = SP.i, it = SP.items[i], p = SP.picks[i], done = p != null, a = SP.kind === "athon";
    var diff = it.difficulty || (a ? RAMP[i] : "");
    var ctx = a ? (it.context || "") : ((it.title ? "<b>" + esc(it.title) + "</b>" : "") + esc(it.context || ""));
    el.innerHTML = spHead() +
      '<section class="report"><p class="ctx spq"><span>' + (a ? "Image " : "Practice image ") + (i + 1) + " of " + n + "</span>" + (diff ? '<span class="badge ' + esc(diff) + '">' + esc(diff) + "</span>" : "") + "</p>" +
      (ctx ? '<p class="ctx">' + (a ? esc(ctx) : ctx) + "</p>" : "") +
      '<div class="imgbox" id="glm-sbox" role="button" tabindex="0" aria-label="Enlarge image"><img src="' + esc(srcOf(it.img, 1000)) + '" alt="' + esc(done ? it.img.alt || it.answer : (NORMIE ? NT.alt : "Clinical image for this puzzle")) + '" referrerpolicy="no-referrer"><span class="zm">Tap to zoom</span></div>' +
      '<p class="credit">' + spCredit(it.img, done) + "</p></section>" +
      '<div class="tries"><span class="tl">' + esc(it.question || (NORMIE ? NT.q : "What’s the sign?")) + '</span><span class="vials"><b>One pick</b></span></div>' +
      '<div class="opts" id="glm-sopts">' + spOptions(it, i).map(function (o) {
        var cls = !done ? "" : o === it.answer ? " right" : o === p ? " wrong" : " dim";
        return '<button type="button" class="opt' + cls + '" data-o="' + esc(o) + '"' + (done ? " disabled" : "") + ">" + esc(o) + "</button>";
      }).join("") + "</div>" +
      (done ? '<div class="spfb ' + (p === it.answer ? "ok" : "no") + '" id="glm-spfb"><p class="verdict ' + (p === it.answer ? "ok" : "no") + '">' + (p === it.answer ? "Spotted" : "Not quite. It’s " + esc(it.answer)) + "</p>" + (SP.sass ? '<p class="sass">' + esc(SP.sass) + "</p>" : "") +
        "<p>" + esc(it.why) + "</p>" + (!a && it.pearl ? '<div class="pearl"><b>' + (NORMIE ? "Fun fact" : "Teaching pearl") + "</b><p>" + esc(it.pearl) + "</p></div>" : "") +
        '<button type="button" class="btn" id="glm-snext">' + (i + 1 < n ? "Next image →" : a ? "See your score" : "Finish round") + "</button></div>" : "") +
      '<p class="note"><button type="button" class="lnk" id="glm-sback">← Back to today’s Glimpsis</button>' + (a && !SP.s.done ? " Your progress is saved." : "") + "</p>";
    var box = $("sbox"); box.onclick = function () { zoom(srcOf(it.img, 2000)); }; box.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); zoom(srcOf(it.img, 2000)); } };
    box.querySelector("img").onerror = function () { box.innerHTML = '<p class="err">The image didn’t load. Try refreshing.</p>'; };
    $("sback").onclick = function () { spShow(false); renderXbox(); };
    if (done) { $("snext").onclick = function () { SP.i++; SP.sass = ""; spRender(); $("sprint").scrollIntoView({ behavior: "smooth", block: "start" }); }; var fb = $("spfb"); if (fb.scrollIntoView) fb.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
    else $("sopts").onclick = function (e) {
      var b = e.target.closest(".opt"); if (!b || SP.picks[i] != null) return;
      var o = b.getAttribute("data-o"); SP.picks[i] = o;
      if (a) { SP.s.picks = SP.picks.slice(); if (SP.picks.length >= n && SP.picks.every(function (x) { return x != null; })) { SP.s.done = true; SP.s.t1 = Date.now(); } put(aKey(SP.A.date), SP.s); }
      SP.sass = o === it.answer ? pick(["Sharp eyes.", "Nailed it.", "One look. Done.", "Textbook spot."]) : pick(SASS.wrong);
      spRender();
    };
  }
  function spEnd() {
    var el = $("sprint"), a = SP.kind === "athon", n = SP.items.length, sc = 0;
    var rows = SP.items.map(function (it, i) {
      var p = SP.picks[i], ok = p === it.answer; if (ok) sc++;
      return '<li class="' + (ok ? "ok" : "no") + '"><img src="' + esc(srcOf(it.img, 240)) + '" alt="' + esc(it.img.alt || it.answer) + '" loading="lazy" referrerpolicy="no-referrer"><div><b>' + (i + 1) + ". " + esc(it.answer) + (ok ? " ✓" : " ✕") + "</b>" +
        (!ok && p ? '<small class="yours">You picked: ' + esc(p) + "</small>" : "") + "<p>" + esc(a ? it.pearl : it.why) + '</p><small class="credit">' + spCredit(it.img, true) + "</small></div></li>";
    }).join("");
    var grid = SP.items.map(function (it, i) { return SP.picks[i] === it.answer ? "🟩" : "🟥"; }).join("");
    var secs = a ? (SP.s.t1 - SP.s.t0) / 1000 : 0;
    var share = a ? ANAME + " #" + SP.A.number + (SP.A.date < REAL ? " (archive)" : "") + " 🔎 " + sc + "/" + n + "\n" + grid.slice(0, 10) + grid.slice(10) + "\n⏱ " + mmss(secs) + "\nmaladywise.com/glimpsis/" : "";
    var verdict = sc === n ? "Perfect run" : sc >= n * 0.8 ? "Sharp eyes" : sc >= n / 2 ? "Solid spotting" : "Tough set";
    el.innerHTML = spHead() +
      '<div class="result"><p class="verdict ' + (sc >= n / 2 ? "ok" : "no") + '">' + verdict + (a ? "" : " · Practice: doesn’t count") + "</p>" +
      "<h2>" + sc + "/" + n + (a ? ' <small class="tm">in ' + mmss(secs) + "</small>" : "") + "</h2>" +
      (SP.note ? '<p class="yours">' + esc(SP.note) + "</p>" : "") +
      '<ol class="splist">' + rows + "</ol>" +
      (a ? '<pre id="glm-sshare">' + esc(share) + '</pre>' : "") +
      '<div class="btns">' + (a ? '<button class="btn" type="button" id="glm-scopy">Copy result</button>' : '<button class="btn" type="button" id="glm-again">Another round</button>') +
      '<button class="btn ghost" type="button" id="glm-sback">Back to today’s Glimpsis</button></div>' +
      (a ? '<p class="note">One scored go per Tuesday. Want more? <button type="button" class="lnk" id="glm-sprac">Practise on past images</button>.</p>' : '<p class="note">Practice rounds don’t change your stats, streak or shares.</p>') + "</div>";
    clearInterval(spTimer);
    $("sback").onclick = function () { spShow(false); renderXbox(); };
    if ($("again")) $("again").onclick = function () { startPractice(); };
    if ($("sprac")) $("sprac").onclick = function () { startPractice(); };
    if ($("scopy")) $("scopy").onclick = function () {
      var b = this;
      function sel() { var rg = document.createRange(); rg.selectNodeContents($("sshare")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, sel); } catch (e) { sel(); }
    };
  }
  $("prac").onclick = startPractice;

  tick(); setInterval(tick, 60000);
  show(today);
})();
