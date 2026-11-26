/* My stats page: reads everything from localStorage via MW_myStats (assets/shell.js). No server. */
(function () {
  "use strict";
  var box = document.getElementById("me"); if (!box || !window.MW_myStats) return;
  var view = (window.MW_mode && MW_mode()) || "medical";
  function esc(x) { return String(x).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function today() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dn(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function ds(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
  function nice(d, o) { return new Date(dn(d) * 864e5).toLocaleDateString("en-AU", Object.assign({ timeZone: "UTC" }, o)); }
  function dark() { return document.documentElement.getAttribute("data-theme") === "dark"; }

  function heat(days) {
    var t = today(), tn = dn(t), wd = (new Date(tn * 864e5).getUTCDay() + 6) % 7, start = tn - wd - 77, cells = "", months = "", on = 0, lastM = "";
    for (var c = 0; c < 12; c++) {
      var m = nice(ds(start + c * 7), { month: "short" });
      months += "<span>" + (m !== lastM ? m : "") + "</span>"; lastM = m;
      for (var r = 0; r < 7; r++) {
        var n = start + c * 7 + r, d = ds(n), k = days[d] || 0;
        if (n > tn) { cells += '<i class="hm-f" aria-hidden="true"></i>'; continue; }
        if (k) on++;
        var lv = !k ? 0 : k === 1 ? 1 : k <= 3 ? 2 : k <= 6 ? 3 : 4;
        var lab = nice(d, { weekday: "short", day: "numeric", month: "short" }) + ": " + (k ? k + " puzzle" + (k > 1 ? "s" : "") : "nothing");
        cells += '<i class="hm-' + lv + (d === t ? " hm-t" : "") + '" role="img" aria-label="' + lab + '" title="' + lab + '"></i>';
      }
    }
    return '<section class="me-card"><div class="me-h"><h2>Last 12 weeks</h2><span>' + on + " of " + (78 + wd) + " days played</span></div>" +
      '<div class="hm-wrap"><div class="hm-days" aria-hidden="true"><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span><span>Sun</span></div>' +
      '<div class="hm-main"><div class="hm-months" aria-hidden="true">' + months + '</div><div class="hm" role="group" aria-label="Days played, last 12 weeks">' + cells + "</div></div></div>" +
      '<div class="hm-key" aria-hidden="true">Less <i class="hm-0"></i><i class="hm-1"></i><i class="hm-2"></i><i class="hm-3"></i><i class="hm-4"></i> More</div></section>';
  }


  // ---------- extra stats (26 Nov 2026): vs everyone, topics, learning time, bests, trend, fun ----------
  function J(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  var TOPIC = [
    ["Cardiology", /atrial-fib|heart-attack|^ecg$|anat-heart|coronary|phys-heart|^pots$|marfan|cardio/],
    ["Respiratory", /asthma|copd|sleep-apn|anat-lungs|phys-lung|sarcoid|respir/],
    ["Neurology", /migraine|stroke|multiple-scl|myasthenia|guillain|huntington|anat-brain|circle-of-willis|cranial|dermatome|phys-brain|neuro/],
    ["Endocrine", /addison|cushing|thyroid|diabetes|pancreas|osteopor|endocr/],
    ["Gut and liver", /coeliac|^ibs$|haemochrom|wilson|digestive|phys-bowel|phys-liver|gastro/],
    ["Bones, joints and muscles", /gout|lupus|ehlers|anat-bones|anat-muscles|anat-spine|upper-limb|lower-limb|phys-bone|musculo|rheumat/],
    ["Skin", /eczema|phys-skin|dermat/],
    ["Women's health", /endometriosis|women/],
    ["Imaging", /^ct$|^mri$|ultrasound|x-ray|nuclear|imaging/],
    ["Medicines", /pharmacol|dosage|off-label|medicine|prescrib/],
    ["Eyes, ears, nose and mouth", /anat-ear|anat-eye|phys-ear|phys-eye|phys-nose|phys-mouth|phys-teeth|head-and-neck|skull|ent\b|eye/],
    ["Kidneys and urology", /kidney|renal|urolog/],
    ["Emergency", /first-aid|atypical|emergenc|acute/],
    ["Medical language", /abbrev|terms-/],
    ["Mental health", /adhd|mental|psych|addiction/],
    ["Children", /kawasaki|child|paediat/]
  ];
  function topicOf(id) { id = String(id).toLowerCase(); for (var i = 0; i < TOPIC.length; i++) if (TOPIC[i][1].test(id)) return TOPIC[i][0]; return null; }
  function bar(p) { return '<span class="mx-bar"><i style="width:' + Math.max(3, p) + '%"></i></span>'; }
  function card(t, sub, body, id) { return '<section class="me-card"' + (id ? ' id="' + id + '"' : "") + '><div class="me-h"><h2>' + t + "</h2><span>" + sub + "</span></div>" + body + "</section>"; }

  function vsEveryone(st) {
    var rows = st.rows.filter(function (r) { return r.today && !r.weekly; });
    if (!rows.length) return card("You vs everyone today", "Live", '<p class="mx-note">Finish today’s puzzles to see how you compare.</p>', "mx-vs");
    setTimeout(function () {
      var box = document.getElementById("mx-vs-b"); if (!box) return;
      rows.forEach(function (r) {
        fetch("https://mw-presence.onrender.com/rate?g=" + encodeURIComponent(r.g.id), { mode: "cors" }).then(function (x) { return x.json(); }).then(function (d) {
          var el = box.querySelector('[data-g="' + r.g.id + '"] .mx-v'); if (!el) return;
          if (!d || d.n < 10) { el.textContent = "Not enough players yet"; return; }
          var pct = Math.round(d.w / d.n * 100), recd = J("mw-log", []).filter(function (x) { return x.g === r.g.id && x.at === today(); }).pop(), won = recd ? !!recd.w : null;
          el.innerHTML = (won ? "✅ Solved. " + (100 - pct) + "% of " + d.n.toLocaleString("en-AU") + " players didn’t." : won === false ? "Missed it, like " + (100 - pct) + "% of " + d.n.toLocaleString("en-AU") + " players." : pct + "% of " + d.n.toLocaleString("en-AU") + " players solved it.") + bar(pct);
        }).catch(function () { var el = box.querySelector('[data-g="' + r.g.id + '"] .mx-v'); if (el) el.textContent = "Couldn’t reach the server"; });
      });
    }, 50);
    return card("You vs everyone today", "Live, all players", '<ul class="mx-list" id="mx-vs-b">' + rows.map(function (r) { return '<li data-g="' + r.g.id + '"><b>' + esc(r.g.name) + '</b><span class="mx-v">Checking…</span></li>'; }).join("") + "</ul>", "mx-vs");
  }

  function topics() {
    var T = {};
    function add(t, ok, n) { if (!t) return; var o = T[t] = T[t] || { ok: 0, n: 0, link: null }; o.ok += ok; o.n += n; }
    J("mw-qlog", []).forEach(function (x) { add(topicOf(x.q), x.s, x.n); });
    var us = J("us-v1", {}) || {}, items = us.items || {}, ids = Object.keys(items);
    var done = function () {
      var L = Object.keys(T).filter(function (t) { return T[t].n >= 3; }).map(function (t) { return { t: t, p: Math.round(T[t].ok / T[t].n * 100), n: T[t].n }; }).sort(function (a, b) { return b.p - a.p; });
      var el = document.getElementById("mx-top"); if (!el) return;
      if (!L.length) { el.innerHTML = '<p class="mx-note">Do a few quizzes or GP School cases and your strongest and weakest topics show up here.</p>'; return; }
      var weak = L[L.length - 1];
      el.innerHTML = '<ul class="mx-list">' + L.map(function (x) { return "<li><b>" + esc(x.t) + '</b><span class="mx-v">' + x.p + "% right · " + x.n + " answers</span>" + bar(x.p) + "</li>"; }).join("") + "</ul>" +
        (L.length > 1 ? '<p class="mx-note">Weakest: <b>' + esc(weak.t) + '</b>. <a href="/quizzes/">Practise with a quiz</a> or <a href="/gp-school/#curriculum">a GP School room</a>.</p>' : "");
    };
    if (ids.length) {
      Promise.all(["cases", "huddle", "results"].map(function (f) { return fetch("/unspecialist/data/" + f + ".json").then(function (r) { return r.json(); }).catch(function () { return []; }); })).then(function (D) {
        var cu = {}; [["c:", D[0]], ["h:", D[1]], ["r:", D[2]]].forEach(function (p) { (p[1] || []).forEach(function (x) { cu[p[0] + x.id] = x.cu; }); });
        ids.forEach(function (k) { var c = cu[k]; if (c != null && (items[k] === 0 || items[k] === 1)) add(topicOf(c) || c, items[k], 1); });
        done();
      });
    } else setTimeout(done, 0);
    return card("Accuracy by topic", "Quizzes and GP School", '<div id="mx-top"><p class="mx-note">Loading…</p></div>');
  }

  function learning() {
    var o = J("mw-time", {}) || {}, y = today().slice(0, 4), tn = dn(today()), yr = 0, wk = 0;
    Object.keys(o).forEach(function (d) { if (d.slice(0, 4) === y) yr += o[d]; if (tn - dn(d) < 7) wk += o[d]; });
    var f = function (s) { var m = Math.round(s / 60); return m >= 120 ? (Math.round(m / 6) / 10) + " h" : m + " min"; };
    return card("Learning time", y, '<div class="mx-big"><div><b>' + f(yr) + "</b><span>this year</span></div><div><b>" + f(wk) + '</b><span>last 7 days</span></div></div><p class="mx-note">Active time on Malady Wise, counted from 26 Nov 2026. A personal log, not formal CPD.</p>');
  }

  function bests(st) {
    var perfect = 0;
    (window.MW_GAMES || []).forEach(function (g) { if (!g.store) return; var s = J(g.store.stats, null); if (s && s.dist && s.dist[0]) perfect += s.dist[0]; });
    var busiest = 0, bd = ""; Object.keys(st.days || {}).forEach(function (d) { if (st.days[d] > busiest) { busiest = st.days[d]; bd = d; } });
    var ql = J("mw-qlog", []), bq = null; ql.forEach(function (x) { if (x.n >= 10 && (!bq || x.s / x.n > bq.s / bq.n)) bq = x; });
    var hard = (J("mw-einstein", []) || []).length;
    var li = [["🎯", "First-try solves", perfect], ["🔥", "Longest streak", st.best + " days"], ["📆", "Busiest day", busiest ? busiest + " puzzles (" + nice(bd, { day: "numeric", month: "short" }) + ")" : "None yet"],
      ["🧠", "Genius-level solves", hard], ["📝", "Best quiz", bq ? bq.s + "/" + bq.n + " (" + esc(bq.q.replace(/-/g, " ")) + ")" : "None yet"]];
    return card("Personal bests", "All time", '<ul class="mx-list">' + li.map(function (x) { return "<li><b>" + x[0] + " " + x[1] + '</b><span class="mx-v">' + x[2] + "</span></li>"; }).join("") + "</ul>");
  }

  function trend() {
    var log = J("mw-log", []), ql = J("mw-qlog", []), tn = dn(today()), pts = [];
    for (var i = 29; i >= 0; i--) {
      var d = ds(tn - i), a = 0, b = 0;
      log.forEach(function (x) { if (x.at === d) { b++; a += x.w ? 1 : 0; } });
      ql.forEach(function (x) { if (x.at === d && x.n) { b += 1; a += x.s / x.n; } });
      pts.push(b ? a / b : null);
    }
    var have = pts.filter(function (p) { return p != null; });
    if (have.length < 3) return card("Your trend", "Last 30 days", '<p class="mx-note">Play on a few more days to see your trend line.</p>');
    var W = 300, H = 70, xs = function (i) { return 6 + i * (W - 12) / 29; }, ys = function (p) { return H - 8 - p * (H - 16); }, path = "", dots = "";
    pts.forEach(function (p, i) { if (p == null) return; path += (path ? "L" : "M") + xs(i).toFixed(1) + " " + ys(p).toFixed(1); dots += '<circle cx="' + xs(i).toFixed(1) + '" cy="' + ys(p).toFixed(1) + '" r="2.6"/>'; });
    var avg = Math.round(have.reduce(function (a, b) { return a + b; }, 0) / have.length * 100), rec = have.slice(-7), ra = Math.round(rec.reduce(function (a, b) { return a + b; }, 0) / rec.length * 100);
    return card("Your trend", "Last 30 days", '<svg class="mx-spark" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Daily score, last 30 days"><line x1="6" x2="' + (W - 6) + '" y1="' + ys(0.5) + '" y2="' + ys(0.5) + '" class="mx-mid"/><path d="' + path + '"/>' + dots + "</svg>" +
      '<p class="mx-note">Average ' + avg + "% · last 7 active days " + ra + "% " + (ra > avg + 4 ? "📈 improving" : ra < avg - 4 ? "📉 dipping" : "➡️ steady") + ". Puzzles count as solved or not; quizzes by score.</p>");
  }

  function fun(st) {
    var log = J("mw-log", []), H = [0, 0, 0, 0];
    log.forEach(function (x) { var h = x.h; if (h == null) return; H[h < 6 ? 3 : h < 12 ? 0 : h < 18 ? 1 : 2]++; });
    var tot = H[0] + H[1] + H[2] + H[3], names = ["Morning person ☀️", "Afternoon player 🌤️", "Evening player 🌆", "Night-shift player 🌙"], top = H.indexOf(Math.max.apply(null, H));
    var first = Object.keys(st.days || {}).sort()[0];
    var li = [];
    if (tot >= 5) li.push(["When you play", names[top] + " · " + Math.round(H[top] / tot * 100) + "% of games"]);
    if (first) li.push(["First game here", nice(first, { day: "numeric", month: "long", year: "numeric" })]);
    var fav = {}; log.forEach(function (x) { fav[x.g] = (fav[x.g] || 0) + 1; }); var fg = Object.keys(fav).sort(function (a, b) { return fav[b] - fav[a]; })[0];
    if (fg) { var gg = (window.MW_GAMES || []).filter(function (g) { return g.id === fg; })[0]; if (gg) li.push(["Favourite game", esc(gg.name) + " · " + fav[fg] + " plays"]); }
    if (!li.length) return "";
    return card("Fun facts", "About you", '<ul class="mx-list">' + li.map(function (x) { return "<li><b>" + x[0] + '</b><span class="mx-v">' + x[1] + "</span></li>"; }).join("") + "</ul>");
  }

  function render() {
    var st = MW_myStats(view), N = view === "normie";
    if (window.MW_markBadges) MW_markBadges(st);
    var got = st.badges.filter(function (b) { return b.got; }).length;
    var quip = st.solved === 0 ? "Clean chart. Suspiciously clean." : st.cur >= 7 ? "On a tear. Don’t stop now." : st.today ? "Clocked on today. Good." : st.cur ? "Play today to keep the streak alive." : "Streak flatlined. Resuscitate it today.";
    var h = ""; // Normie mode frozen (24 Nov 2026): no Medical/Normie stats switch
    h += '<section class="me-top"><div><b>' + st.solved + "</b><span>Puzzles solved</span></div><div><b>🔥 " + st.cur + "</b><span>Current streak</span></div><div><b>" + st.best + "</b><span>Best streak</span></div><div><b>" + st.today + "</b><span>Played today</span></div></section>";
    h += '<p class="me-quip">' + quip + "</p>";
    if (window.MW_ward) { var wd = MW_ward(st); h += '<section class="me-card"><div class="me-h"><h2>' + (N ? "Your crew" : "Your ward") + "</h2><span>" + wd.have + " of " + wd.total + ' on shift</span></div><p class="me-wnext">' + wd.next + " Finish a game for the first time to bring its host on board.</p>" + wd.html + "</section>"; }
    h += vsEveryone(st);
    h += heat(st.days);
    h += trend() + topics() + bests(st) + learning() + fun(st);
    h += '<section class="me-card"><div class="me-h"><h2>By game</h2><span>' + (N ? "Normie" : "All games") + '</span></div><div class="me-games">' +
      st.rows.map(function (r) {
        var g = r.g, acc = dark() ? g.accentDark : g.accent;
        return '<a class="me-g' + (r.played ? "" : " none") + '" href="/' + g.path + '" style="--ga:' + acc + '"><span class="me-ic">' + g.icon + '</span><span class="me-gm"><span class="me-gn">' + esc(g.name) + (r.today ? ' <em class="me-tick" title="Done today">✓ today</em>' : "") + (r.weekly ? ' <small>Weekly</small>' : "") + "</span>" +
          (r.played ? '<span class="me-gs"><span><b>' + r.played + "</b> played</span><span><b>" + r.pct + "%</b> wins</span><span><b>" + r.streak + "</b> streak</span><span><b>" + r.best + "</b> best</span></span>" : '<span class="me-gs none">Not played yet. Go on.</span>') + "</span></a>";
      }).join("") + "</div></section>";
    h += '<section class="me-card"><div class="me-h"><h2>Badges</h2><span>' + got + " of " + st.badges.length + ' earned · next tiers unlock as you go</span></div><ul class="me-badges">' +
      st.badges.filter(function (b) { return !b.later; }).map(function (b) {
        return '<li class="me-b' + (b.got ? " got" : "") + '"><span class="me-bi" aria-hidden="true">' + b.icon + '</span><b>' + esc(b.name) + '</b><span class="me-bh">' + (b.got ? "✔ Earned. " : '<span class="sr">Locked. </span>🔒 ') + esc(b.how) + (b.global ? " <em>(both modes)</em>" : "") + (b.prog ? ' <em class="me-prog">' + esc(b.prog) + "</em>" : "") + "</span></li>";
      }).join("") + "</ul></section>";
    h += '<section class="me-card me-save"><p><b>Saved in this browser only.</b> Clear your browser, lose your glory. Moving phones? Export here, import there.</p>' +
      '<div class="me-btns"><button type="button" class="me-btn" id="me-exp">⬇ Export my stats</button><label class="me-btn ghost" for="me-imp">⬆ Import<input type="file" id="me-imp" accept="application/json,.json" class="sr"></label></div><p class="me-msg" id="me-msg" aria-live="polite"></p></section>';
    box.innerHTML = h;
    var mm = box.querySelector(".me-mode"); if (mm) mm.onclick = function (e) { var b = e.target.closest("button"); if (!b || b.getAttribute("data-v") === view) return; view = b.getAttribute("data-v"); render(); };
    document.getElementById("me-exp").onclick = exportStats;
    document.getElementById("me-imp").onchange = importStats;
  }

  function exportStats() {
    var data = {};
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); data[k] = localStorage.getItem(k); } } catch (e) {}
    var blob = new Blob([JSON.stringify({ site: "maladywise.com", kind: "stats", v: 1, exported: new Date().toISOString(), data: data }, null, 1)], { type: "application/json" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "malady-wise-stats-" + today() + ".json";
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    msg("Exported. Guard it like a controlled drug.");
    if (window.MW_track) MW_track("me/export", "Stats exported");
  }
  function importStats(e) {
    var f = e.target.files && e.target.files[0]; if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      var j; try { j = JSON.parse(rd.result); } catch (x) { j = null; }
      if (!j || j.site !== "maladywise.com" || !j.data || typeof j.data !== "object") { msg("That file isn’t a Malady Wise export. Nice try."); return; }
      var ks = Object.keys(j.data).filter(function (k) { return typeof j.data[k] === "string"; });
      if (!confirm("Import " + ks.length + " saved items? Matching stats in this browser will be replaced.")) { msg("Import cancelled. Nothing changed."); return; }
      try { ks.forEach(function (k) { localStorage.setItem(k, j.data[k]); }); } catch (x) { msg("Couldn’t save. Browser storage may be full or blocked."); return; }
      if (window.MW_track) MW_track("me/import", "Stats imported");
      render(); msg("Imported. Welcome back, doctor.");
    };
    rd.readAsText(f); e.target.value = "";
  }
  function msg(t) { var m = document.getElementById("me-msg"); if (m) m.textContent = t; }
  render();
  window.MW_onTheme = render;
})();
