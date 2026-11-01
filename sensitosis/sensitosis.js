/* Sensitosis: guess how good real medical tests are. Five tests a day; two sliders each (sensitivity, specificity).
   Test bank: tests.json {tests: {id: {test, condition, scenario, sens:{v,lo,hi}, spec:{v,lo,hi}|null, range?, kind?, label?, says, note, src:[[title,url]], checked}}}.
   kind: sign | rule | scan | (none = lab test). Sign and rule rounds are "Signs rounds": same mechanics, different chip and wording.
   Days: puzzles/YYYY-MM.json [{date, number, difficulty, rounds:[{test, twist?:{prev, where, sourced}}]}].
   Scoring: up to 50 a slider (100 for one-slider rounds); full marks anywhere in lo-hi (+/-2), zero at 35+ away. Medical only. */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "2", N = 5, OPEN = "2026-11-02";
  var root = document.getElementById("sns");
  if (!document.querySelector("link[data-sns]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "sensitosis.css?v=" + BUILD; l.setAttribute("data-sns", ""); document.head.appendChild(l);
  }
  root.innerHTML =
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="sns-p" viewBox="0 0 10 12"><circle cx="5" cy="2.6" r="2.3"/><path d="M1 12V8.4C1 6.2 2.8 5.4 5 5.4s4 .8 4 3V12z"/></symbol></svg>' +
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="sns-eyebrow">Sensitosis</span><span class="badge" id="sns-badge" hidden></span></div>' +
    ' <details class="explain" id="sns-explain"><summary>Sensitivity and specificity, in plain English</summary>' +
    '  <p><b>Sensitivity</b> is how good a test is at <b>catching</b> people who have the condition. Out of 100 people who have it, how many test positive? The rest are <b>misses</b>.</p>' +
    '  <p><b>Specificity</b> is how good it is at <b>clearing</b> people who don’t. Out of 100 people without it, how many test negative? The rest are <b>false alarms</b>.</p>' +
    '  <p>A test can be brilliant at one and rubbish at the other. Today you guess both.</p>' +
    '  <p><b>Signs rounds</b> are things a doctor checks with hands, eyes and a few questions, like a knee wobble or a checklist. Same rules: guess how often they catch it and clear it.</p></details>' +
    ' <div class="dots" id="sns-dots" aria-label="Progress"></div>' +
    ' <section class="card" id="sns-card" aria-live="polite"></section>' +
    ' <div class="result" id="sns-result" hidden></div>' +
    ' <p class="note" id="sns-next"></p>' +
    ' <details class="archive" id="sns-archive"><summary>Past days</summary><div class="alist" id="sns-alist"></div></details>' +
    ' <p class="note">Figures are rounded from published reviews, linked on every reveal. Studies vary, so treat them as ballpark. Scenarios are fictional. General education, not personal medical advice.</p>' +
    "</div>";
  var $ = function (id) { return document.getElementById("sns-" + id); };

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
  var SKEY = "sns-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0] });
  var KEY, st, P = null, TESTS = null;
  function loadDay() { KEY = "sns-day-" + today; st = load(KEY, { r: 0, g: [], tw: {}, done: false, win: false, score: 0 }); }
  loadDay();
  var seenExplain = load("sns-explained", 0);
  if (!seenExplain) { $("explain").open = true; put("sns-explained", 1); }

  // ---------- sass (mocks the guess, never the patient) ----------
  function pick(a) { if (a.length < 2) return a[0]; var k = "mw-last-" + a[0].slice(0, 12), last; try { last = sessionStorage.getItem(k); } catch (e) {} var x, n = 0; do { x = a[Math.floor(Math.random() * a.length)]; } while (x === last && ++n < 8); try { sessionStorage.setItem(k, x); } catch (e) {} return x; }
  var SASS = {
    top: ["Spooky accurate.", "Did you write the review?", "Cochrane would like your number.", "Bang on. Suspiciously bang on.", "That’s not a guess, that’s a citation."],
    good: ["Close. Very close.", "Solid clinical gut.", "Near enough to publish.", "Within the confidence interval of greatness."],
    mid: ["In the ballpark. A big ballpark.", "Half right is still half wrong.", "Plausible. The studies disagree.", "Warm. Not hot."],
    low: ["Bold. Wrong, but bold.", "The meta-analysis disagrees.", "Somewhere a statistician sighed.", "Confidently incorrect. A classic.", "Respectfully: no."],
    end: [["Diagnostic accuracy: excellent. Yours, not the tests’.", "Sensitive AND specific. Rare.", "You could peer-review this stuff."], ["Solid day. Most of the tests did worse.", "Good gut. Better than a Kernig’s.", "Respectable. Very respectable."], ["Middling. Like a CRP.", "Some hits, some false alarms.", "Not bad. Not a screening program either."], ["Rough day. The tests won.", "Lots of misses. Fitting, really.", "Tomorrow’s tests are already being validated."]]
  };
  function say(t) { var m = root.querySelector(".msg"); if (!m) return; m.textContent = t; m.classList.remove("pop"); void m.offsetWidth; if (t) m.classList.add("pop"); }

  // ---------- maths & words ----------
  function rng(f) { return [f.lo != null ? f.lo : f.v, f.hi != null ? f.hi : f.v]; }
  function pts(g, f) { var r = rng(f), d = Math.max(0, r[0] - g, g - r[1]); d = Math.max(0, d - 2); return Math.round(50 * Math.max(0, 1 - d / 35)); }
  function fmt(v) { return (Math.round(v * 10) / 10).toString(); }
  function figTxt(f) { var r = rng(f); return fmt(f.v) + (r[0] !== r[1] ? ' <small>(' + fmt(r[0]) + "–" + fmt(r[1]) + ")</small>" : ""); }
  // p = percent of a group; plain words like "about 1 in 4"
  function oneIn(p) {
    if (p <= 0) return "almost none";
    if (p >= 95) return "almost all";
    if (p >= 45 && p <= 55) return "about half";
    if (p >= 30) return "about " + Math.round(p / 10) + " in 10";
    if (p >= 1) return "about 1 in " + Math.round(100 / p);
    var k = Math.round(p * 10); return k < 1 ? "fewer than 1 in 1,000" : "about " + k + " in 1,000";
  }
  function ofPpl(p) { var w = oneIn(p); return /^(about half|almost all|almost none)$/.test(w) ? w + " of the people" : w + " people"; }
  function ppv(T, prev) {
    var s = T.sens.v / 100, c = T.spec.v / 100, base = prev < 1 ? 10000 : 1000, have = Math.round(base * prev / 100), caught = Math.round(have * s), fa = Math.round((base - have) * (1 - c));
    return { base: base, have: have, caught: caught, fa: fa, p: caught / Math.max(1, caught + fa) * 100 };
  }
  function grid(n, cls1, cls2, label) {
    var h = '<div class="grid" role="img" aria-label="' + esc(label) + '">';
    for (var i = 0; i < 100; i++) h += '<svg class="pp ' + (i < n ? cls1 : cls2) + '" viewBox="0 0 10 12" aria-hidden="true"><use href="#sns-p"/></svg>';
    return h + "</div>";
  }

  // ---------- render ----------
  function tOf(i) { return TESTS[P.rounds[i].test]; }
  function renderDots() {
    $("dots").innerHTML = P.rounds.map(function (r, i) {
      var g = st.g[i], cls = g ? (g[2] >= 90 ? "a" : g[2] >= 70 ? "b" : g[2] >= 40 ? "c" : "d") : (i === st.r && !st.done ? "on" : "");
      return '<span class="dot ' + cls + '" title="Test ' + (i + 1) + (g ? ": " + g[2] + " points" : "") + '">' + (g ? g[2] : i + 1) + "</span>";
    }).join("") + '<span class="tot">' + st.g.reduce(function (a, g) { return a + g[2]; }, 0) + "<small>/" + N * 100 + "</small></span>";
  }
  function slider(id, label, sub, val) {
    return '<div class="sl"><label for="sns-' + id + '"><span>' + label + '</span><small>' + sub + '</small></label>' +
      '<div class="slrow"><button type="button" class="step" data-for="' + id + '" data-d="-1" aria-label="One less">−</button>' +
      '<input type="range" id="sns-' + id + '" min="0" max="100" step="1" value="' + val + '" aria-valuetext="' + val + ' out of 100">' +
      '<button type="button" class="step" data-for="' + id + '" data-d="1" aria-label="One more">+</button></div>' +
      '<output id="sns-' + id + 'o" for="sns-' + id + '"><b>' + val + "</b> of 100</output></div>";
  }
  function paintRange(inp) {
    var v = +inp.value; inp.style.setProperty("--p", v + "%"); inp.setAttribute("aria-valuetext", v + " out of 100");
    var o = $(inp.id.slice(4) + "o"); if (o) o.innerHTML = "<b>" + v + "</b> of 100";
  }
  function bindSliders(box) {
    Array.prototype.forEach.call(box.querySelectorAll('input[type="range"]'), function (inp) { paintRange(inp); inp.addEventListener("input", function () { paintRange(inp); }); });
    Array.prototype.forEach.call(box.querySelectorAll(".step"), function (b) {
      b.onclick = function () { var inp = $(b.getAttribute("data-for")); inp.value = Math.max(0, Math.min(100, +inp.value + +b.getAttribute("data-d"))); paintRange(inp); };
    });
  }
  var KINDS = { sign: "Physical sign", rule: "Clinical rule", scan: "Scan", lab: "Lab test" };
  function kindOf(T) { return KINDS[T.kind] ? T.kind : "lab"; }
  function isSign(T) { var k = kindOf(T); return k === "sign" || k === "rule"; }
  function chip(T) { var k = kindOf(T); return '<span class="kind ' + k + '">' + esc(T.label || KINDS[k]) + "</span>"; }
  function head(i, T) {
    return '<p class="kick"><span>' + (isSign(T) ? "Signs round · " : "Test ") + (i + 1) + " of " + N + "</span>" + chip(T) + "</p><h2>" + esc(T.test) + '</h2><p class="for">Looking for <b>' + esc(T.condition) + "</b></p><p class=\"scn\">" + esc(T.scenario) + "</p>";
  }
  function words(T) {
    var k = kindOf(T);
    return k === "sign" ? ["show the sign", "don’t show it", "sign"] : k === "rule" ? ["does it flag", "does it clear", "rule"] : ["test positive", "test negative", "test"];
  }
  function renderGuess(i) {
    var T = tOf(i), W = words(T);
    var h = head(i, T) +
      slider("s", "Out of 100 people <b>with</b> " + esc(T.condition) + ", how many " + W[0] + "?", "This is the " + W[2] + "’s <b>sensitivity</b>.", 50) +
      (T.spec ? slider("c", "Out of 100 people <b>without</b> it, how many " + W[1] + "?", "This is its <b>specificity</b>.", 50) : '<p class="one">One slider today: there’s no good figure for false alarms.</p>') +
      '<button type="button" class="btn big" id="sns-lock">Lock it in</button><p class="msg" aria-live="polite"></p>';
    $("card").innerHTML = h; bindSliders($("card"));
    $("lock").onclick = function () { lock(i); };
  }
  function reveal(i) {
    var T = tOf(i), g = st.g[i], R = P.rounds[i], sv = Math.round(T.sens.v), cv = T.spec ? Math.round(T.spec.v) : null;
    var h = head(i, T) + '<p class="pts"><b>+' + g[2] + "</b> points<span class=\"msg\" aria-live=\"polite\"></span></p>";
    h += '<div class="cmp"><div><span>Catches (sensitivity)</span><b>' + figTxt(T.sens) + '</b><small>You said ' + g[0] + "</small></div>" +
      (T.spec ? '<div><span>Clears (specificity)</span><b>' + figTxt(T.spec) + '</b><small>You said ' + g[1] + "</small></div>" : "") + "</div>";
    h += '<div class="grids' + (T.spec ? "" : " solo") + '">' +
      '<figure><figcaption>100 people <b>with</b> it</figcaption>' + grid(sv, "hit", "miss", sv + " of 100 caught, " + (100 - sv) + " missed") +
      '<p class="leg"><i class="k hit"></i>caught ' + sv + ' <i class="k miss"></i>missed ' + (100 - sv) + "</p></figure>" +
      (T.spec ? '<figure><figcaption>100 people <b>without</b> it</figcaption>' + grid(cv, "ok", "fa", cv + " of 100 cleared, " + (100 - cv) + " false alarms") +
      '<p class="leg"><i class="k ok"></i>cleared ' + cv + ' <i class="k fa"></i>false alarm ' + (100 - cv) + "</p></figure>" : "") + "</div>";
    var words = T.range ? "Catches anywhere from " + T.sens.lo + " to " + T.sens.hi + " in 100, depending on the study. Helpful." :
      "Misses " + ofPpl(100 - T.sens.v) + " who have it." + (T.spec ? (T.spec.v >= 99.95 ? " Almost never a false alarm." : " False alarms in " + ofPpl(100 - T.spec.v) + " who don’t.") : "");
    h += '<p class="words">' + words + "</p>" + '<p class="says">' + esc(T.says) + "</p>";
    if (R.twist && T.spec) h += twistHtml(i, T, R.twist);
    h += '<div class="evid"><p><b>The evidence.</b> ' + esc(T.note) + "</p><p class=\"srcs\">" + T.src.map(function (s) { return '<a href="' + esc(s[1]) + '" target="_blank" rel="noopener">Source: ' + esc(s[0]) + " ↗</a>"; }).join("") + "</p><p class=\"chk\">Checked " + esc(T.checked) + "</p></div>";
    h += '<button type="button" class="btn big" id="sns-nextbtn">' + (i < N - 1 ? "Next test" : "See your score") + "</button>";
    $("card").innerHTML = h; bindSliders($("card"));
    $("nextbtn").onclick = function () { if (st.r < i + 1) { st.r = i + 1; if (st.r >= N) finish(); put(KEY, st); } paint(); root.scrollIntoView({ behavior: "smooth", block: "start" }); };
    var tb = $("twbtn"); if (tb) tb.onclick = function () { st.tw[i] = +$("t").value; put(KEY, st); reveal(i); var x = $("twbox"); if (x) x.scrollIntoView({ behavior: "smooth", block: "nearest" }); };
    if (st.done) $("nextbtn").hidden = true;
  }
  function twistHtml(i, T, tw) {
    var r = ppv(T, tw.prev), real = Math.round(r.p), mine = st.tw[i];
    var h = '<div class="twist" id="sns-twbox"><p class="tk">Bonus twist' + (tw.sourced ? "" : " · made-up numbers") + "</p><p>" + esc(tw.where) + " You test <b>positive</b>. What’s the chance you really have it?</p>";
    if (mine == null) return h + slider("t", "Chance you have it", "Out of 100 people who test positive, how many really have it?", 50) + '<button type="button" class="btn" id="sns-twbtn">Check</button></div>';
    var off = Math.abs(mine - real), line = off <= 10 ? "Bang on. Plenty of doctors get this wrong." : mine > real ? "Too hopeful. When a condition is rare, false alarms swamp the real positives." : "Too gloomy. When lots of people have it, a positive is more believable.";
    return h + '<p class="tans">You said ' + mine + '. Real answer: <b>about ' + (real < 1 ? "1" : real) + " in 100</b>.</p><p>" + line + "</p>" +
      '<p class="math">Picture ' + r.base.toLocaleString("en-AU") + " people: " + r.have.toLocaleString("en-AU") + " have it and the test catches " + r.caught.toLocaleString("en-AU") + ". Of the " + (r.base - r.have).toLocaleString("en-AU") + " who don’t, " + r.fa.toLocaleString("en-AU") + " get a false alarm. So only " + r.caught.toLocaleString("en-AU") + " of " + (r.caught + r.fa).toLocaleString("en-AU") + " positives are real.</p></div>";
  }
  function lock(i) {
    var T = tOf(i), s = +$("s").value, c = T.spec ? +$("c").value : null;
    var p = T.spec ? pts(s, T.sens) + pts(c, T.spec) : pts(s, T.sens) * 2;
    st.g[i] = [s, c, p]; put(KEY, st);
    renderDots(); reveal(i);
    say(pick(p >= 90 ? SASS.top : p >= 70 ? SASS.good : p >= 40 ? SASS.mid : SASS.low));
    if (i === N - 1) { /* last one: score page after Next */ }
    $("card").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function bucket(s) { return s >= 450 ? 0 : s >= 350 ? 1 : s >= 250 ? 2 : 3; }
  function finish() {
    st.score = st.g.reduce(function (a, g) { return a + g[2]; }, 0); st.win = st.score >= 250; st.done = true; put(KEY, st);
    if (isLive() && stats.last !== today) {
      var yest = stats.last && dayNum(today) - dayNum(stats.last) === 1;
      stats.played++; if (st.win) stats.wins++;
      stats.streak = st.win ? (yest ? stats.streak + 1 : 1) : 0; stats.best = Math.max(stats.best, stats.streak);
      stats.dist[bucket(st.score)]++; stats.last = today; put(SKEY, stats);
    }
  }
  function emo(p) { return p >= 90 ? "🎯" : p >= 70 ? "🟢" : p >= 40 ? "🟡" : "🔴"; }
  function renderResult() {
    var r = $("result");
    if (!st.done) { r.hidden = true; return; }
    $("card").hidden = true;
    var share = "Sensitosis #" + P.number + (isLive() ? "" : " (archive)") + " · " + P.difficulty + " 🔬 " + st.score + "/" + N * 100 + "\n" + st.g.map(function (g) { return emo(g[2]); }).join("") + "\nmaladywise.com";
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0, max = Math.max.apply(null, stats.dist.concat([1])), mine = bucket(st.score), L = ["450+", "350+", "250+", "<250"];
    r.hidden = false;
    r.innerHTML = '<p class="verdict">' + esc(pick(SASS.end[mine])) + "</p><h2>" + st.score + "<small> / " + N * 100 + "</small></h2>" +
      '<ul class="sum">' + P.rounds.map(function (R, i) {
        var T = TESTS[R.test], g = st.g[i];
        return '<li><span class="e">' + emo(g[2]) + '</span><span class="n"><b>' + esc(T.test) + "</b><small>" + esc(T.label || KINDS[kindOf(T)]) + " · catches " + fmt(T.sens.v) + (T.spec ? " · clears " + fmt(T.spec.v) : "") + " · you " + g[0] + (T.spec ? "/" + g[1] : "") + '</small><a href="' + esc(T.src[0][1]) + '" target="_blank" rel="noopener">Source ↗</a></span><span class="p">' + g[2] + "</span></li>";
      }).join("") + "</ul>" +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>250+ %</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + stats.best + "</b><span>Best</span></div></div>" +
      '<div class="dist">' + stats.dist.map(function (c, i) { return "<div><span>" + L[i] + '</span><i class="' + (i === mine && isLive() ? "me" : "") + '" style="width:' + Math.max(8, Math.round(c / max * 100)) + '%">' + c + "</i></div>"; }).join("") + "</div>" +
      '<pre id="sns-share">' + esc(share) + '</pre><button class="btn" type="button" id="sns-copy">Copy result</button>' +
      '<button class="btn ghost" type="button" id="sns-review">Review the reveals</button>';
    $("copy").onclick = function () {
      var b = this;
      function sel() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, sel); } catch (e) { sel(); }
    };
    $("review").onclick = function () { reviewAt(0); };
  }
  function reviewAt(i) {
    $("card").hidden = false; reveal(i);
    var nb = $("nextbtn"); nb.hidden = false; nb.textContent = i < N - 1 ? "Next reveal" : "Back to score";
    nb.onclick = function () { if (i < N - 1) reviewAt(i + 1); else { $("card").hidden = true; } $("card").scrollIntoView({ behavior: "smooth", block: "start" }); };
    $("card").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function paint() {
    renderDots();
    if (st.done) { renderResult(); return; }
    $("card").hidden = false; $("result").hidden = true;
    if (st.g[st.r]) reveal(st.r); else renderGuess(st.r);
  }
  function tick() {
    var t = "New tests arrive at midnight, Sydney time.";
    try { var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
      var left = 1440 - ((p[0] % 24) * 60 + p[1]); t = "Next tests in " + Math.floor(left / 60) + "h " + (left % 60) + "m. No false alarms, promise."; } catch (e) {}
    $("next").textContent = t;
  }

  // ---------- load ----------
  var cache = {};
  function month(m) {
    if (!cache[m]) cache[m] = fetch(BASE + "puzzles/" + m + ".json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    return cache[m];
  }
  function prevMonth(m) { var p = m.split("-").map(Number); p[1]--; if (!p[1]) { p[1] = 12; p[0]--; } return p[0] + "-" + ("0" + p[1]).slice(-2); }
  var testsP = fetch(BASE + "tests.json?v=" + BUILD, { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (j) { TESTS = j.tests; });
  function show(date) {
    today = date; loadDay(); P = null;
    return Promise.all([testsP, month(date.slice(0, 7))]).then(function (a) {
      P = a[1].filter(function (x) { return x.date === date; })[0] || null;
      if (!P) {
        $("dots").innerHTML = ""; $("result").hidden = true; $("badge").hidden = true; $("card").hidden = false;
        $("card").innerHTML = '<p class="empty">' + (date < OPEN ? "Sensitosis opens Monday 2 November. The tests are still being validated." : "Today’s tests are still in the lab. Back tomorrow.") + "</p>";
        renderArchive(); return;
      }
      $("eyebrow").textContent = (isLive() ? "Sensitosis" : "Archive") + " · #" + P.number + " · " + nice(date);
      var b = $("badge"); b.hidden = false; b.className = "badge " + P.difficulty; b.textContent = P.difficulty;
      paint(); renderArchive();
    });
  }
  function renderArchive() {
    var m = REAL.slice(0, 7);
    Promise.all([prevMonth(m) < "2026-11" ? Promise.resolve([]) : month(prevMonth(m)), month(m)]).then(function (ls) {
      var past = [].concat(ls[0], ls[1]).filter(function (x) { return x.date < REAL; }).reverse();
      var rows = past.map(function (x) {
        var s = load("sns-day-" + x.date, null), mark = !s || !s.done ? "" : " · " + s.score;
        return '<button type="button" class="arow' + (x.date === today ? " on" : "") + '" data-d="' + x.date + '"><span>#' + x.number + " · " + nice(x.date) + mark + '</span><span class="badge ' + x.difficulty + '">' + x.difficulty + "</span></button>";
      }).join("");
      var back = isLive() ? "" : '<button type="button" class="btn" id="sns-back">Back to today</button>';
      $("alist").innerHTML = back + (rows || '<p class="note">No past days yet. You’re early.</p>');
      Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); }; });
      if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
    });
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };

  tick(); setInterval(tick, 60000);
  show(today);
})();
