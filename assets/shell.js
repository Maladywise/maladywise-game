/* Shared shell: theme, top bar, modals, hub rendering, game splash. No dependencies. */
(function () {
  "use strict";
  var root = document.documentElement;
  function get(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  // ---------- mode: "medical" (default) or "normie" (no-medicine versions of some games) ----------
  // localStorage "mw-mode"; ?mode=normie / ?mode=medical sets and remembers it (deep links, Zebra Mail).
  var MODE = (function () {
    var m = null; try { m = new URLSearchParams(location.search).get("mode"); } catch (e) {}
    if (m === "normie" || m === "medical") set("mw-mode", m);
    var v = get("mw-mode", "medical"); return v === "normie" ? "normie" : "medical";
  })();
  var NORMIE = MODE === "normie";
  root.setAttribute("data-mode", MODE);
  window.MW_mode = function () { return MODE; };
  function mk(k) { return NORMIE ? "n-" + k : k; } // mode-aware site-wide keys (streak, badges, trophies)
  window.MW_key = mk;
  // In Normie mode, games with a "normie" block swap their text and use "n-" prefixed store keys,
  // so every reader below (readStats, watchDone, extras, celebrate...) is mode-aware for free.
  if (NORMIE) (window.MW_GAMES || []).forEach(function (g) {
    if (!g.normie) return;
    var n = typeof g.normie === "object" ? g.normie : {};
    ["kind", "tagline", "quip", "helpQuip", "help", "weeklyLine"].forEach(function (f) { if (n[f] !== undefined) g[f] = n[f]; else if (f === "helpQuip") delete g.helpQuip; });
    if (g.store) { var st0 = {}; Object.keys(g.store).forEach(function (k) { st0[k] = g.store[k]; }); st0.stats = "n-" + g.store.stats; st0.day = "n-" + g.store.day; if (n.labels) st0.labels = n.labels; g.medStore = g.store; g.store = st0; }
    g.nmode = true;
  });
  if (NORMIE && window.MW_ABOUT_N && window.MW_ABOUT) Object.keys(MW_ABOUT_N).forEach(function (k) { MW_ABOUT[k] = MW_ABOUT_N[k]; });
  function setMode(m) {
    set("mw-mode", m);
    track("mode/" + m, "Switched to " + m + " mode");
    var u = new URL(location.href); u.searchParams.delete("mode"); u.searchParams.delete("date");
    setTimeout(function () { location.replace(u.pathname + (u.search || "") + u.hash); }, 60);
  }
  window.MW_setMode = setMode;
  // Mascot image: in Normie mode, games with normieMascot use the "day off" outfit (falls back to the normal one if missing).
  function mascImg(id, alt, w, cls) {
    var g = (window.MW_GAMES || []).filter(function (x) { return x.id === id; })[0], std = "/assets/mascots/" + id + ".svg";
    var src = NORMIE && g && g.normieMascot ? "/assets/mascots/normie/" + id + ".svg" : std;
    return '<img' + (cls ? ' class="' + cls + '"' : "") + ' src="' + src + '"' + (src !== std ? " onerror=\"this.onerror=null;this.src='" + std + "'\"" : "") + ' alt="' + (alt || "") + '" width="' + w + '" height="' + w + '">';
  }
  // Norm, the Normie host mascot. Hidden if the SVG is missing.
  function normImg(cls, w) { return '<img class="' + cls + '" src="/assets/mascots/normie/norm.svg" alt="" width="' + w + '" height="' + w + '" onerror="this.remove()">'; }
  function modeSwitch() {
    return '<div class="mw-mode" role="group" aria-label="Puzzle mode">' +
      [["medical", "\ud83e\ude7a", "Medical"], ["normie", "\ud83d\ude42", "Normie"]].map(function (o) {
        var norm = false;
        return '<button type="button" data-mode="' + o[0] + '" aria-pressed="' + (MODE === o[0]) + '" aria-label="' + o[2] + ' mode" title="' + o[2] + ' mode">' + (norm ? '<img class="mm-norm" src="/assets/mascots/normie/norm.svg" alt="" width="20" height="20" onerror="var s=this.nextSibling;if(s)s.hidden=false;this.remove()"><span aria-hidden="true" hidden>' : '<span aria-hidden="true">') + o[1] + '</span><span class="mm-t" aria-hidden="true">' + o[2] + "</span></button>";
      }).join("") + "</div>";
  }
  // Friendly fallback for a game script when the Normie file for today is missing.
  window.MW_noNormie = function (what) {
    return '<div class="mw-nonorm"><p><b>No Normie ' + (what || "puzzle") + ' today.</b> Try Medical instead.</p><button type="button" class="btn" onclick="MW_setMode(\'medical\')">\ud83e\ude7a Switch to Medical</button></div>';
  };

  // ---------- analytics: GoatCounter (cookie-free, no personal data) ----------
  (function () {
    var h = location.hostname;
    if (!/(^|\.)maladywise\.com$/.test(h) || document.querySelector("script[data-goatcounter]")) return;
    var sc = document.createElement("script"); sc.async = true; sc.src = "https://gc.zgo.at/count.js";
    sc.setAttribute("data-goatcounter", "https://maladywise.goatcounter.com/count");
    document.head.appendChild(sc);
  })();
  var sent = {};
  function track(name, title) {
    if (NORMIE && window.MW_curGame && MW_curGame.nmode && !/^mode\//.test(name)) { name = "normie/" + name; title = "(Normie) " + (title || name); }
    if (sent[name]) return; sent[name] = 1;
    (function go(n) {
      if (window.goatcounter && goatcounter.count) { try { goatcounter.count({ path: name, title: title || name, event: true }); } catch (e) {} }
      else if (n < 20) setTimeout(function () { go(n + 1); }, 500);
    })(0);
  }
  window.MW_track = track;
  // Fire a "finished" event the first time a game saves today's result as done.
  function watchDone(g) {
    if (!g || !g.store || !g.store.day) return;
    var pre = g.store.day, orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      try {
        if (this === window.localStorage && typeof k === "string" && k.indexOf(pre) === 0 && /"done":true/.test(v)) {
          var prev = this.getItem(k);
          if (!prev || !/"done":true/.test(prev)) {
            var win = /"win":true/.test(v);
            track("finished/" + g.id, g.name + " finished");
            if (win) track("won/" + g.id, g.name + " won");
            if (!g.store.weekly && k === pre + sydToday()) markDay();
            logFinish(g, k, v);
            setTimeout(checkBadges, 1500);
            setTimeout(nlPrompt, 2600);
            (function (val, live) { setTimeout(function () { try { celebrate(g.id, JSON.parse(val)); if (live) afterLive(g, JSON.parse(val)); } catch (x) {} }, 450); })(v, !g.store.weekly && k === pre + sydToday());
          }
        }
      } catch (e) {}
      return orig.apply(this, arguments);
    };
  }

  // ---------- overall daily streak (any daily game finished on the day it was live) ----------
  function markDay() { var d = get(mk("mw-days"), []), t = sydToday(); if (d.indexOf(t) < 0) { d.push(t); d = d.slice(-400); set(mk("mw-days"), d); } }
  // Games that count in the current mode (Normie mode: only Normie-capable games).
  function inMode(g) { return !NORMIE || !!g.nmode; }
  function playedDays() {
    var seen = {}; get(mk("mw-days"), []).forEach(function (d) { seen[d] = 1; });
    (window.MW_GAMES || []).forEach(function (g) {
      if (!g.live || !g.store || g.store.weekly || !inMode(g)) return;
      var s = get(g.store.stats, null), t = get(g.store.day + sydToday(), null);
      if (t && t.done) seen[sydToday()] = 1;
      if (s && s.last && s.streak) for (var i = 0; i < s.streak; i++) seen[new Date((dayNum(s.last) - i) * 864e5).toISOString().slice(0, 10)] = 1;
    });
    return seen;
  }
  function siteStreak() {
    var seen = playedDays(), n = dayNum(sydToday()), k = seen[sydToday()] ? n : n - 1, c = 0;
    while (seen[new Date(k * 864e5).toISOString().slice(0, 10)]) { c++; k--; }
    return { n: c, today: !!seen[sydToday()] };
  }
  window.MW_siteStreak = siteStreak;

  // ---------- celebrations on finishing a puzzle ----------
  function esc2(x) { return String(x).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function quiet() { return root.getAttribute("data-motion") === "reduce" || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }
  var SCENES = {
    dx: function (st) {
      if (!st.win) return null;
      var gold = st.revealed === 1;
      return { cls: "cb-dx" + (gold ? " gold" : ""), html: '<div class="cb-stamp">CASE<br>CLOSED</div><p class="cb-cap">' + (gold ? "First clue. Frankly suspicious." : (NORMIE ? "Solved on clue " : "Diagnosed on clue ") + st.revealed + ".") + "</p>" };
    },
    wordemic: function (st) {
      if (!st.win) return null;
      var n = (st.guesses || []).length, gold = n <= 2;
      return { cls: "cb-ecg" + (gold ? " gold" : ""), html: '<svg class="cb-line" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 60 H120 L135 60 L145 25 L158 100 L170 10 L184 92 L196 60 H260 L270 60 L278 40 L288 80 L298 60 H400"/></svg><p class="cb-cap">' + (NORMIE ? (gold ? "Got it in " + n + ". Show-off." : "Cracked it in " + n + ".") : (gold ? "Pulse restored in " + n + ". Show-off." : "Pulse restored. Solved in " + n + ".")) + "</p>" };
    },
    comorbix: function (st) {
      if (!st.win) return null; var m = st.mistakes || 0;
      return { cls: "cb-bars", html: confetti(["#E9C46A", "#2A9D8F", "#457B9D", "#9B5DE5"], 40) + '<div class="cb-stack"><i style="--c:#E9C46A"></i><i style="--c:#2A9D8F"></i><i style="--c:#457B9D"></i><i style="--c:#9B5DE5"></i></div><p class="cb-cap">' + (m ? (NORMIE ? "All sorted, with " : "Discharged, with ") + m + " slip" + (m > 1 ? "s" : "") + "." : NORMIE ? "All sorted. Not one mistake." : "Clean discharge. Not one mistake.") + "</p>" };
    },
    morphemia: function (st) {
      if (!st.win) return null;
      var hx = function (x, y, i) { return '<polygon class="hx" style="animation-delay:' + (i * .12) + 's" points="' + [0, 1, 2, 3, 4, 5].map(function (k) { var a = Math.PI / 3 * k + Math.PI / 6; return (x + 22 * Math.cos(a)).toFixed(1) + "," + (y + 22 * Math.sin(a)).toFixed(1); }).join(" ") + '"/>'; };
      var c = [[0, 0], [0, -38], [33, -19], [33, 19], [0, 38], [-33, 19], [-33, -19]];
      return { cls: "cb-hex", html: '<div class="cb-cap-top">\ud83c\udf93</div><svg class="cb-comb" viewBox="-70 -70 140 140" aria-hidden="true">' + c.map(function (p, i) { return hx(p[0], p[1], i); }).join("") + '</svg><p class="cb-cap">Genius. Go and tell someone.</p>' };
    },
    linkase: function (st) {
      if (!st.win) return null; var m = st.mistakes || 0;
      return { cls: "cb-chain", html: '<svg class="cb-links" viewBox="0 0 300 60" aria-hidden="true">' + [0, 1, 2, 3, 4].map(function (i) { return '<rect class="lk" style="--i:' + i + '" x="' + (8 + i * 56) + '" y="15" width="64" height="30" rx="15"/>'; }).join("") + '</svg><p class="cb-cap">' + (m ? "Chain held. " + m + " slip" + (m > 1 ? "s" : "") + "." : "Unbreakable. Not one slip.") + "</p>" };
    },
    gridectomy: function (st) {
      if (!st.win) return null; var gold = (st.t || 999) < 120 && !st.reveals, h = "";
      var order = []; for (var r = 4; r >= 0; r--) for (var c = 0; c < 5; c++) order.push([r, c]);
      order.forEach(function (rc, k) { h += '<i style="grid-row:' + (rc[0] + 1) + ";grid-column:" + (rc[1] + 1) + ";animation-delay:" + (k * 0.045).toFixed(3) + 's"></i>'; });
      return { cls: "cb-grid" + (gold ? " gold" : ""), html: '<div class="cb-blocks">' + h + '</div><p class="cb-cap">' + (gold ? "Under two minutes. Locked in." : "Grid locked. Lovely work.") + "</p>" };
    },
    suturix: function (st) {
      if (!st.win) return null;
      return { cls: "cb-sut", html: '<svg class="cb-wound" viewBox="0 0 300 80" aria-hidden="true"><path class="cut" d="M10 40 C 60 20, 100 60, 150 40 S 240 20, 290 40"/>' + [40, 85, 130, 175, 220, 260].map(function (x, i) { return '<path class="st" style="animation-delay:' + (.3 + i * .14) + 's" d="M' + (x - 8) + " 26 L" + (x + 8) + " 54 M" + (x + 8) + " 26 L" + (x - 8) + ' 54"/>'; }).join("") + '</svg><p class="cb-cap">' + (st.hints ? (NORMIE ? "Sewn up, with a little help." : "Closed, with a little help.") : NORMIE ? "Sewn up. Not a stitch out of place." : "Wound closed. Not a stitch out of place.") + "</p>" };
    },
    triviosis: function (st) {
      if (!st.win || st.score == null) return null; var s2 = st.score, gr = s2 === 10 ? "A+" : s2 >= 9 ? "A" : s2 >= 8 ? "B+" : s2 >= 7 ? "B" : "C";
      return { cls: "cb-exam" + (s2 === 10 ? " perfect" : ""), html: (s2 === 10 ? confetti(["#1F7A8C", "#5BC0D3", "#F2D36B", "#4A3480"], 40) : "") + '<div class="cb-card"><span>Exam result</span><b>' + s2 + '/10</b><em>' + gr + '</em></div><p class="cb-cap">' + (s2 === 10 ? "Perfect. Mortarboards in the air. \ud83c\udf93" : "Passed. The college approves.") + "</p>" };
    },
    grandrounds: function (st) {
      if (!st.done) return null;
      if (st.mode === "duo" && st.sb != null) {
        var nm = st.names || ["You", "Opponent"], a = st.sa || 0, b = st.sb || 0;
        if (a === b) return { cls: "cb-clap", html: '<div class="cb-claps">\ud83e\udd1d</div><p class="cb-cap">Dead heat, ' + a + " all. Rematch next Sunday.</p>" };
        var w = a > b ? nm[0] : nm[1];
        return { cls: "cb-pod", html: confetti(["#3B4C9B", "#93A5F2", "#F2D36B"], 40) + '<div class="cb-podium"><i class="p2"><span>2</span></i><i class="p1"><span>\ud83c\udfc6</span></i><i class="p3"><span>3</span></i></div><p class="cb-cap">' + esc2(w) + " wins, " + Math.max(a, b) + " to " + Math.min(a, b) + ".</p>" };
      }
      if (!st.win) return null;
      return { cls: "cb-clap", html: '<div class="cb-claps"><span>\ud83d\udc4f</span><span>\ud83d\udc4f</span><span>\ud83d\udc4f</span></div><p class="cb-cap">' + (st.sa || 0) + "/20. Applause from the back row.</p>" };
    },
    cryptogenic: function (st) {
      if ((st.hints || 0) >= 20) return null;
      var m = Math.floor((st.t || 0) / 60), sec = ("0" + ((st.t || 0) % 60)).slice(-2);
      return { cls: "cb-news", html: '<div class="cb-paper"><span class="mast">The Malady Wise Times</span><b>SOLVED</b><span class="sig">in ' + m + ":" + sec + (st.hints ? " \u00b7 " + st.hints + " hints" : " \u00b7 unaided") + "</span></div>" + '<p class="cb-cap">' + (st.hints ? "Signed, sealed, solved." : "Unaided. Hold the front page.") + "</p>" };
    },
    panelysis: function (st) {
      if (!st.win) return null; var n = (st.picks || []).length;
      return { cls: "cb-dx" + (n === 1 ? " gold" : ""), html: (NORMIE ? '<div class="cb-stamp">CASE<br>CRACKED</div><p class="cb-cap">' + (n === 1 ? "First pick. Quiz-show energy." : "Case cracked on try " + n + ".") : '<div class="cb-stamp">RESULTS<br>REVIEWED</div><p class="cb-cap">' + (n === 1 ? "First pick. Pathologist energy." : "Diagnosed on try " + n + ".")) + "</p>" };
    },
    arrhythmix: function (st) {
      if (!st.win) return null; var n = (st.picks || []).length, gold = n === 1;
      return { cls: "cb-ecg" + (gold ? " gold" : ""), html: '<svg class="cb-line" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true"><path d="' + (NORMIE ? "M0 104 L50 96 L90 100 L140 78 L190 84 L240 52 L290 60 L340 24 L400 12" : "M0 60 H120 L135 60 L145 25 L158 100 L170 10 L184 92 L196 60 H260 L270 60 L278 40 L288 80 L298 60 H400") + '"/></svg><p class="cb-cap">' + (NORMIE ? (gold ? "Nailed the trend. First try." : "Nailed the trend on try " + n + ".") : gold ? "Read on the first try. Show-off." : "Rhythm read on try " + n + ".") + "</p>" };
    },
    sudokrine: function (st) {
      if (!st.win) return null; var gold = !st.hints, m = Math.floor((st.t || 0) / 60), sec = ("0" + ((st.t || 0) % 60)).slice(-2), h = "";
      for (var k = 0; k < 9; k++) h += '<i style="animation-delay:' + (k * 0.07).toFixed(2) + 's"></i>';
      return { cls: "cb-skr" + (gold ? " gold" : ""), html: '<div class="cb-sgrid">' + h + '</div><p class="cb-cap">' + (NORMIE ? (gold ? "Grid complete in " + m + ":" + sec + ". No hints." : "Grid complete in " + m + ":" + sec + ".") : (gold ? "Perfect balance. " + m + ":" + sec + ", no hints." : "Homeostasis restored in " + m + ":" + sec + ".")) + "</p>" };
    },
    zebritis: function (st) {
      if (st.uni) return { cls: "cb-run uni", html: '<div class="cb-trail"></div><div class="cb-runner">\ud83e\udd84</div><p class="cb-cap">A unicorn sighting. Mythical.</p>' };
      if (st.zeb || st.win) return { cls: "cb-run", html: '<div class="cb-runner">\ud83e\udd93</div><p class="cb-cap">' + (st.zeb ? "Stripes earned." : "Solid round.") + "</p>" };
      return null;
    }
  };
  function confetti(cols, n) {
    var h = ""; for (var i = 0; i < (n || 36); i++) h += '<i class="cf" style="left:' + Math.round(Math.random() * 100) + "%;background:" + cols[i % cols.length] + ";animation-delay:" + (Math.random() * .5).toFixed(2) + "s;animation-duration:" + (1.4 + Math.random() * 1.1).toFixed(2) + "s;transform:rotate(" + Math.round(Math.random() * 360) + 'deg)"></i>';
    return '<div class="cf-wrap" aria-hidden="true">' + h + "</div>";
  }
  var Q = [], busy = false;
  function show(sc) {
    busy = true;
    var o = el('<div class="cb ' + sc.cls + (quiet() ? " still" : "") + '" role="status" aria-live="polite">' + sc.html + '<span class="cb-tap">Tap to continue</span></div>');
    var done = false;
    function bye() { if (done) return; done = true; o.classList.add("out"); setTimeout(function () { o.remove(); busy = false; if (Q.length) show(Q.shift()); }, 260); }
    o.addEventListener("click", bye); document.body.appendChild(o);
    setTimeout(bye, sc.ms || (quiet() ? 1800 : 2600));
  }
  function queue(sc) { if (!sc) return; if (busy) Q.push(sc); else show(sc); }
  function mascotHelp(g) {
    var m = window.MW_MASCOTS && MW_MASCOTS[g.id]; if (!m) return "";
    return '<div class="mw-masc-help">' + mascImg(g.id, "", 72) + '<p><b>Hi, I\u2019m ' + m.name + ',</b> ' + (NORMIE && g.nmode && g.normieMascot ? "on my day off" : m.what) + '. Here\u2019s how ' + g.name + ' works.</p></div>';
  }
  function mascotCheer(id) {
    var m = window.MW_MASCOTS && MW_MASCOTS[id]; if (!m) return "";
    var last = get("mw-cheer-" + id, -1), k = Math.floor(Math.random() * m.cheer.length); if (k === last) k = (k + 1) % m.cheer.length; set("mw-cheer-" + id, k); var line = m.cheer[k];
    var gg = (window.MW_GAMES || []).filter(function (x) { return x.id === id; })[0], NC = window.MW_NORMIE_CHEER;
    if (NORMIE && gg && gg.nmode && NC && NC.length) { var kn = get("mw-ncheer", -1), j = Math.floor(Math.random() * NC.length); if (j === kn) j = (j + 1) % NC.length; set("mw-ncheer", j); line = NC[j]; }
    return '<div class="cb-masc"><span class="cb-bub">' + line + '</span>' + mascImg(id, m.name, 96) + '<span class="cb-mname">' + m.name + "</span></div>";
  }
  function celebrate(id, st) {
    var f = SCENES[id]; if (!f || !st) return;
    var sc0 = f(st); if (sc0 && st.win !== false) { sc0.html += mascotCheer(id); sc0.ms = (sc0.ms || 2600) + 2000; }
    queue(sc0);
    var g = (window.MW_GAMES || []).filter(function (x) { return x.id === id; })[0];
    if (g && st.win && !g.weekly && !g.dailyLine) { var t = sydToday(); if (diffFor(g, t, new Date(dayNum(t) * 864e5).getUTCDay()) === "Einstein") queue({ cls: "cb-ein", ms: 3000, html: '<svg class="cb-atom" viewBox="-60 -60 120 120" aria-hidden="true"><ellipse rx="52" ry="18"/><ellipse rx="52" ry="18" transform="rotate(60)"/><ellipse rx="52" ry="18" transform="rotate(120)"/><circle r="8" class="nuc"/></svg><p class="cb-cap">Einstein day, solved. Genuinely rare. Frame it.</p>' }); }
  }
  var BADGES = { 3: ["Intern", "\ud83e\ude7a"], 7: ["Registrar", "\ud83e\udd47"], 14: ["Fellow", "\ud83c\udf93"], 30: ["Consultant", "\ud83c\udfc6"], 100: ["Professor", "\ud83d\udc51"] };
  if (NORMIE) BADGES = { 3: ["Regular", "\u2b50"], 7: ["Enthusiast", "\ud83e\udd47"], 14: ["Expert", "\ud83c\udf93"], 30: ["Legend", "\ud83c\udfc6"], 100: ["Grandmaster", "\ud83d\udc51"] };
  function afterLive(g) {
    var t = sydToday(), sk = siteStreak().n, b = BADGES[sk];
    if (b && get(mk("mw-badge-" + sk), "") !== t && !get(mk("mw-badge-" + sk + "-got"), 0)) {
      set(mk("mw-badge-" + sk + "-got"), 1);
      queue({ cls: "cb-badge", ms: 3200, html: '<div class="cb-medal">' + b[1] + '</div><p class="cb-cap">\ud83d\udd25 ' + sk + "-day streak. Promoted to " + b[0] + ".</p>" });
    }
    var daily = (window.MW_GAMES || []).filter(function (x) { return x.live && !x.weekly && x.store && inMode(x); });
    var all = daily.every(function (x) { var s2 = get(x.store.day + t, null); return s2 && s2.done; });
    if (all && get(mk("mw-wrc"), "") !== t) {
      set(mk("mw-wrc"), t);
      queue({ cls: "cb-wrc", ms: 3600, html: confetti(["#4A3480", "#2E7D6B", "#B23A6F", "#B07A0C", "#2F5DA8", "#C2553A", "#1F7A8C"], 60) + '<div class="cb-big">' + (NORMIE ? "Clean<br>sweep" : "Ward round<br>complete") + '</div><p class="cb-cap">All ' + daily.length + " done. Go home. Hydrate.</p>" });
    }
  }
  window.MW_celebrate = celebrate;

  // ---------- My stats + badges (all from localStorage; /me/ renders it) ----------
  // Finish log: when + which puzzle date, so archive dives and night owls can be counted. Mode-aware (mk).
  function logFinish(g, k, v) {
    var L = get(mk("mw-log"), []);
    L.push({ g: g.id, d: k.slice(g.store.day.length), at: sydToday(), h: new Date().getHours(), w: /"win":true/.test(v) ? 1 : 0 });
    set(mk("mw-log"), L.slice(-600));
  }
  var BADGE_DEFS = [
    ["first", "🩸", "First Blood", "Solve your first puzzle."],
    ["hattrick", "🎩", "Hat-trick", "Finish three different games in one day."],
    ["fullward", "🏥", "Full Ward Round", "Finish every daily game in one day."],
    ["week", "📅", "Week Warrior", "Play seven days in a row."],
    ["month", "🩺", "Month on the Wards", "Play thirty days in a row."],
    ["century", "💯", "Centurion", "Solve 100 puzzles."],
    ["einstein", "⚛️", "Einstein", "Solve an Einstein-day puzzle (about one day in 50)."],
    ["unicorn", "🦄", "Unicorn Hunter", "Find a Zebritis unicorn: the single rarest answer."],
    ["superzeb", "🦓", "Super Zebritis", "Finish a five-prompt Super Zebritis Wednesday."],
    ["sunday", "🦇", "Sunday Scholar", "Score 18 or more in Grand Rounds."],
    ["cryptic", "🕵️", "Cryptic Crusader", "Finish a Cryptogenic without giving up."],
    ["clean", "🧼", "Clean Sheet", "Solve Comorbix with zero mistakes."],
    ["hole", "⛳", "Hole in One", "Solve Wordemic in one or two guesses."],
    ["firstclue", "🔎", "First-clue Wonder", "Solve Dxtective on the first clue."],
    ["panel", "🧪", "Panel Beater", "Solve Panelysis on the first pick.", "medical"],
    ["rhythm", "🫀", "Rhythm Master", "Read the Arrhythmix ECG on the first pick.", "medical"],
    ["queen", "🐝", "Queen Bee", "Reach Genius in Morphemia."],
    ["knowall", "🎓", "Know-it-all", "Score a perfect 10 in Triviosis."],
    ["speed", "⏱️", "Speed Surgeon", "Solve Gridectomy in under a minute, no reveals."],
    ["chain", "🔗", "Unbreakable", "Solve Linkase without a single strike."],
    ["mend", "🪡", "Invisible Mend", "Solve Suturix without a hint."],
    ["balance", "⚖️", "Hormone Balance", "Solve a Genius or Einstein Sudokrine (9x9) without a hint."],
    ["archive", "🗄️", "Archive Diver", "Finish five past puzzles in one day."],
    ["owl", "🦉", "Night Owl", "Finish a puzzle between midnight and 4am."],
    ["tourist", "😎", "Normie Tourist", "Finish a puzzle in Normie mode.", "global"],
    ["both", "☯️", "Both Sides", "Finish puzzles in both modes on the same day.", "global"]
  ];
  function myStats(mode) {
    var N = mode === "normie", P = N ? "n-" : "", today = sydToday(), tn = dayNum(today);
    function dstr(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
    var games = (window.MW_GAMES || []).filter(function (g) { return g.store && (!N || g.normie); });
    var keys = []; try { for (var i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i)); } catch (e) {}
    function J(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
    var rec = {}, logged = {}, days = {}, dayG = {};
    function hit(d, id) { days[d] = (days[d] || 0) + 1; (dayG[d] = dayG[d] || {})[id] = 1; }
    var log = get(P + "mw-log", []);
    log.forEach(function (x) { logged[x.g + "|" + x.d] = 1; hit(x.at, x.g); });
    var rows = games.map(function (g) {
      var base = g.medStore || g.store, sk = (N ? "n-" : "") + base.stats, dk = (N ? "n-" : "") + base.day, R = rec[g.id] = {};
      keys.forEach(function (k) { if (k && k.indexOf(dk) === 0 && /^\d{4}-\d\d-\d\d$/.test(k.slice(dk.length))) { var v = J(k); if (v && v.done) R[k.slice(dk.length)] = v; } });
      Object.keys(R).forEach(function (d) { if (!base.weekly && !logged[g.id + "|" + d] && d <= today) hit(d, g.id); });
      var s = J(sk) || {}, ds = Object.keys(R), wins = ds.filter(function (d) { return R[d].win; }).length;
      var played = Math.max(s.played || 0, 0), sw = s.wins || 0, cur = s.streak || 0;
      if (!played && ds.length) { played = ds.length; sw = wins; }
      if (s.last && tn - dayNum(s.last) > (base.weekly ? 7 : 1)) cur = 0;
      var dk2 = today; if (base.weekly) { var wd = new Date(tn * 864e5).getUTCDay(); dk2 = dstr(tn - (wd - (base.weekStart == null ? 1 : base.weekStart) + 7) % 7); }
      return { g: g, played: played, wins: sw, pct: played ? Math.round(sw / played * 100) : 0, streak: cur, best: Math.max(s.best || 0, cur), solved: wins, today: !!R[dk2], weekly: !!base.weekly };
    });
    get(P + "mw-days", []).forEach(function (d) { if (!days[d]) days[d] = 1; dayG[d] = dayG[d] || {}; });
    var dl = Object.keys(days).filter(function (d) { return days[d] > 0 && d <= today; }).sort(), best = 0, run = 0, prev = null;
    dl.forEach(function (d) { run = prev !== null && dayNum(d) - prev === 1 ? run + 1 : 1; prev = dayNum(d); if (run > best) best = run; });
    var k = days[today] ? tn : tn - 1, cur = 0; while (days[dstr(k)]) { cur++; k--; }
    var solved = rows.reduce(function (a, r) { return a + r.solved; }, 0);
    var playedToday = rows.filter(function (r) { return r.today; }).length;
    log.forEach(function (x) { if (x.at === today && !rows.some(function (r) { return r.g.id === x.g && r.today; })) { rows.forEach(function (r) { if (r.g.id === x.g) r.today = true; }); playedToday++; } });
    function any(id, f) { var R = rec[id] || {}; return Object.keys(R).some(function (d) { return f(R[d], d); }); }
    var daily = rows.filter(function (r) { return !r.weekly && r.g.live; }).map(function (r) { return r.g.id; });
    var dfrom = {}; rows.forEach(function (r) { if (r.g.from) dfrom[r.g.id] = r.g.from; }); // newer games only count from their launch day
    var EINS = (N ? window.MW_EINSTEIN_N : window.MW_EINSTEIN) || {};
    var zg = (window.MW_GAMES || []).filter(function (g) { return g.id === "zebritis"; })[0], zfrom = (zg && zg.special && zg.special.from) || "2026-10-28";
    var arch = {}; log.forEach(function (x) { var gg = rows.filter(function (r) { return r.g.id === x.g; })[0]; if (gg && !gg.weekly && x.d !== x.at) arch[x.at] = (arch[x.at] || 0) + 1; });
    var mdays = {}, ndays = {};
    function addAll(o, p) { get(p + "mw-days", []).forEach(function (d) { o[d] = 1; }); get(p + "mw-log", []).forEach(function (x) { o[x.at] = 1; }); }
    addAll(mdays, ""); addAll(ndays, "n-");
    var nAny = keys.some(function (q) { return /^n-[a-z]+-(day|week)-\d/.test(q || "") && /"done":true/.test(localStorage.getItem(q) || ""); }) || Object.keys(ndays).length > 0;
    var T = {
      first: solved >= 1,
      hattrick: Object.keys(dayG).some(function (d) { return Object.keys(dayG[d]).length >= 3; }),
      fullward: !!get(P + "mw-wrc", "") || (daily.length > 0 && Object.keys(dayG).some(function (d) { return daily.every(function (id) { return (dfrom[id] && d < dfrom[id]) || (rec[id] && rec[id][d]); }); })),
      week: best >= 7, month: best >= 30, century: solved >= 100,
      einstein: get(P + "mw-einstein", []).length > 0 || Object.keys(EINS).some(function (id) { return (EINS[id] || []).some(function (d) { return rec[id] && rec[id][d] && rec[id][d].win; }); }),
      unicorn: any("zebritis", function (v) { return v.uni; }),
      superzeb: any("zebritis", function (v, d) { return (v.picks && v.picks.length >= 5) || (d >= zfrom && new Date(dayNum(d) * 864e5).getUTCDay() === 3); }),
      sunday: any("grandrounds", function (v) { return (v.sa || 0) >= 18; }),
      cryptic: any("cryptogenic", function (v) { return (v.hints || 0) < 20; }),
      clean: any("comorbix", function (v) { return v.win && !v.mistakes; }),
      hole: any("wordemic", function (v) { return v.win && (v.guesses || []).length <= 2; }),
      firstclue: any("dx", function (v) { return v.win && v.revealed === 1; }),
      panel: any("panelysis", function (v) { return v.win && (v.picks || []).length === 1; }),
      rhythm: any("arrhythmix", function (v) { return v.win && (v.picks || []).length === 1; }),
      queen: any("morphemia", function (v) { return v.win || (v.rank || 0) >= 6; }),
      knowall: any("triviosis", function (v) { return v.score === 10; }),
      speed: any("gridectomy", function (v) { return v.win && (v.t || 999) < 60 && !v.reveals; }),
      chain: any("linkase", function (v) { return v.win && !v.mistakes; }),
      mend: any("suturix", function (v) { return v.win && !v.hints; }),
      balance: any("sudokrine", function (v, d) { return v.win && !v.hints && (v.d === "Genius" || v.d === "Einstein" || new Date(dayNum(d) * 864e5).getUTCDay() === 0 || ((EINS.sudokrine || []).indexOf(d) >= 0)); }),
      archive: Object.keys(arch).some(function (d) { return arch[d] >= 5; }),
      owl: log.some(function (x) { return x.h >= 0 && x.h < 4; }),
      tourist: nAny,
      both: Object.keys(mdays).some(function (d) { return ndays[d]; })
    };
    var badges = BADGE_DEFS.filter(function (b) { return !(b[4] === "medical" && N); }).map(function (b) { return { id: b[0], icon: b[1], name: b[2], how: b[3], global: b[4] === "global", got: !!T[b[0]] }; });
    return { mode: N ? "normie" : "medical", rows: rows, days: days, solved: solved, cur: cur, best: Math.max(best, cur), today: playedToday, badges: badges };
  }
  window.MW_myStats = myStats;
  function seenKey(b, mode) { return (b.global || mode !== "normie" ? "" : "n-") + "mw-badges-seen"; }
  function markSeen(st) { st.badges.forEach(function (b) { if (!b.got) return; var k = seenKey(b, st.mode), s = get(k, []); if (s.indexOf(b.id) < 0) { s.push(b.id); set(k, s); } }); }
  window.MW_markBadges = markSeen;
  function badgeToast(list) {
    if (!list.length) return;
    if (busy || Q.length) { setTimeout(function () { badgeToast(list); }, 700); return; }
    var old = document.getElementById("mw-btoast"); if (old) old.remove();
    var txt = list.length === 1 ? "Badge unlocked: <b>" + esc2(list[0].name) + "</b>" : list.length + " badges unlocked: <b>" + list.slice(0, 2).map(function (b) { return esc2(b.name); }).join("</b>, <b>") + "</b>" + (list.length > 2 ? " and more" : "");
    var t = el('<div class="mw-btoast" id="mw-btoast" role="status" aria-live="polite"><a href="/me/"><span class="bt-ic" aria-hidden="true">' + (list.length === 1 ? list[0].icon : "🏅") + '</span><span>🏅 ' + txt + '<small>See your badges ›</small></span></a><button type="button" class="nl-x" aria-label="Dismiss">✕</button></div>');
    t.querySelector("button").onclick = function () { t.remove(); };
    document.body.appendChild(t);
    track("badge/" + list[0].id, "Badge " + list[0].name);
    setTimeout(function () { if (t.parentNode) { t.classList.add("out"); setTimeout(function () { t.remove(); }, 300); } }, 7000);
  }
  function checkBadges() {
    try {
      var st = myStats(MODE), fresh = st.badges.filter(function (b) { return b.got && get(seenKey(b, st.mode), []).indexOf(b.id) < 0; });
      markSeen(st); /* badge popup removed by request */
    } catch (e) {}
  }
  window.MW_checkBadges = checkBadges;

  // ---------- Zebra Mail nudge after finishing a game ----------
  function nlPrompt() {
    if (get("mw-nl-sub", 0) || document.getElementById("nl-after") || document.getElementById("newsletter")) return;
    var snooze = get("mw-nl-snooze", 0); if (snooze && Date.now() < snooze) return;
    var box = document.getElementById("game"); if (!box) return;
    var card = el(NL_HTML.replace('id="newsletter"', 'id="nl-after"').replace(/nl-email/g, "nl-email2").replace("<b>Get Zebra Mail \ud83e\udd93</b>", "<b>Enjoyed that? Get Zebra Mail \ud83e\udd93</b>").replace('<section class="nl"', '<section class="nl nl-after"'));
    var x = el('<button type="button" class="nl-x" aria-label="Not now">\u2715</button>');
    x.onclick = function () { set("mw-nl-snooze", Date.now() + 14 * 864e5); card.remove(); };
    card.insertBefore(x, card.firstChild);
    var strip = box.querySelector(".mwx"); if (strip) strip.parentNode.insertBefore(card, strip); else box.appendChild(card);
  }


  // ---------- sassy reply to swearing (no penalty) ----------
  window.MW_swear = function (raw) {
    var t = String(raw || "").toLowerCase().replace(/[^a-z ]+/g, " ").replace(/\s+/g, " ").trim(); if (!t) return "";
    var strong = /(^| )(fuck|motherf|shit|bullshit|cunt|wank|bollock|arsehole|asshole|dickhead|bellend|twat)/, weak = /^(piss|pissed|crap|arse|ass|damn|dammit|bloody|bugger|cock|dick|prick|tits|boobs|slut|whore|bitch|bastard|tosser|shite|feck|frig|frigging|wtf|omfg|stfu)$/;
    if (!strong.test(t) && !weak.test(t)) return "";
    var N = window.MW_mode && MW_mode() === "normie";
    var L = N ? ["Language! Someone’s nan plays this.", "Bold. Wrong, but bold.", "Swearing reduces pain. Not your score.", "It’s a word. Just not here.", "Rude. And not on the list.", "Save it for the traffic.", "We’ll pretend we didn’t see that.", "Feel better? Now try a real guess."]
      : ["Language! This is a medical facility.", "Wash your mouth out with chlorhexidine.", "Swearing raises pain tolerance. Not your score.", "Noted in your file under ‘behaviour’.", "The nurses heard that.", "Save it for the car park.", "Ah, the 3am night-shift vocabulary.", "Mouth like a surgeon. Score like a student.", "That’s not a diagnosis. That’s a mood."];
    try { if (window.goatcounter && goatcounter.count) {} } catch (e) {}
    return L[Math.floor(Math.random() * L.length)] + " (No guess used.)";
  };
  // ---------- native share button next to every "Copy result" ----------
  function addShare(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll('button[id$="-copy"]:not([data-mws])'), function (b) {
      b.setAttribute("data-mws", "1");
      if (!b.parentNode.classList.contains("mw-sharerow")) { var row = document.createElement("div"); row.className = "mw-sharerow"; b.parentNode.insertBefore(row, b); row.appendChild(b); }
      var pfx = b.id.slice(0, -5), pre = document.getElementById(pfx + "-share") || document.getElementById(pfx + "-sharetext");
      if (!pre || !navigator.share) { if (/^Copy/.test(b.textContent)) b.textContent = "Share result"; return; }
      var sb = document.createElement("button"); sb.type = "button"; sb.className = b.className + " mw-share"; sb.textContent = "Share"; b.hidden = true;
      sb.onclick = function () { navigator.share({ text: pre.textContent.replace(/\s*maladywise\.com\s*$/, ""), url: "https://maladywise.com/" + (location.pathname.split("/")[1] ? location.pathname.split("/")[1] + "/" : "") }).catch(function () {}); };
      b.parentNode.insertBefore(sb, b.nextSibling);
    });
  }
  // ---------- share "ticket" card built from each game's share text ----------
  function ticketify() {
    Array.prototype.forEach.call(document.querySelectorAll('pre[id$="-share"]:not([data-tk]),pre[id$="-sharetext"]:not([data-tk])'), function (pre) {
      pre.setAttribute("data-tk", "1");
      var lines = pre.textContent.replace(/\s+$/, "").split("\n"), url = "";
      if (/maladywise\.com\s*$/i.test(lines[lines.length - 1])) { url = lines.pop(); }
      var head = lines.shift() || "", parts = head.split(" \u00b7 "), title = parts.shift(), pill = parts.join(" \u00b7 ");
      var tm = title.match(/^(.*?#\d+(?: \(archive\))?)\s*(.*)$/); var big0 = ""; if (tm) { title = tm[1]; big0 = tm[2]; }
      var sc0 = ""; var pm = pill.match(/^(.*?)\s{2,}(\S.*)$/); if (pm) { pill = pm[1]; sc0 = pm[2]; }
      pill = pill.replace(/[^\x00-\x7F\u2019]+/g, "").trim();
      var g = window.MW_curGame, acc = g ? accentOf(g) : "#4A3480", body = "";
      if (big0) body += '<div class="em bigem">' + esc2(big0) + "</div>";
      var ems = [], texts = [];
      lines.forEach(function (ln) {
        ln = ln.trim(); if (!ln) return;
        if (/^[\u201c"]/.test(ln)) { texts.push('<div class="q">' + esc2(ln) + "</div>"); return; }
        var m = ln.match(/^([^A-Za-z0-9]+?)\s+([A-Za-z0-9].*)$/);
        if (m) { ems.push(m[1]); texts.push('<div class="sc">' + esc2(m[2]) + "</div>"); }
        else if (!/[A-Za-z0-9]/.test(ln)) ems.push(ln);
        else texts.push('<div class="sc">' + esc2(ln) + "</div>");
      });
      var q = texts.filter(function (t) { return t.indexOf('class="q"') >= 0; }).join("");
      var rest = texts.filter(function (t) { return t.indexOf('class="q"') < 0; }).join("");
      var emh = ems.length ? '<div class="em' + (ems.length === 1 && Array.from(ems[0].replace(/\s/g, "")).length <= 4 ? " bigem" : "") + '">' + ems.map(esc2).join("<br>") + "</div>" : "";
      if (sc0) rest += '<div class="sc">' + esc2(sc0) + "</div>";
      var tk = el('<div class="mw-ticket" style="--a:' + acc + '"><div class="t">' + esc2(title) + "</div>" + (pill ? '<div class="d">' + esc2(pill) + "</div>" : "") + q + body + emh + rest + (url ? '<div class="u">MALADYWISE.COM</div>' : "") + "</div>");
      pre.parentNode.insertBefore(tk, pre); pre.classList.add("mw-sr");
    });
  }
  if (window.MutationObserver) new MutationObserver(function () { ticketify(); addShare(); }).observe(document.documentElement, { childList: true, subtree: true });

  // ---------- add to home screen (PWA) ----------
  var installEvt = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); installEvt = e; var c = document.getElementById("mw-install"); if (c) c.hidden = false; });
  function standalone() { return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone; }
  function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
  function installChip() {
    if (standalone() || get("mw-install-x", 0)) return "";
    var phone = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
    return '<p class="mw-install" id="mw-install"' + (installEvt || phone ? "" : " hidden") + '><button type="button" id="mw-install-go">\ud83d\udcf2 Add Malady Wise to home screen</button><button type="button" class="nl-x" id="mw-install-x" aria-label="Hide">\u2715</button></p>';
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("#mw-install-go, #mw-install-x"); if (!t) return;
    if (t.id === "mw-install-x") { set("mw-install-x", 1); document.getElementById("mw-install").remove(); return; }
    if (installEvt) { installEvt.prompt(); installEvt.userChoice.then(function () { installEvt = null; var c = document.getElementById("mw-install"); if (c) c.remove(); }); }
    else if (isIOS()) modal("Add to home screen", "<ol><li>Tap the <b>Share</b> button in Safari (the square with an arrow).</li><li>Scroll down and tap <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>. Malady Wise now opens like an app.</li></ol>");
    else modal("Add to home screen", "<ol><li>Tap the <b>\u22ee</b> menu (top right in Chrome).</li><li>Tap <b>Add to home screen</b> or <b>Install app</b>.</li><li>Tap <b>Install</b>. Malady Wise now opens like an app.</li></ol>");
  });
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); });
  }

  // ---------- theme + motion ----------
  var mq = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;
  function applyTheme() {
    var t = get("mw-theme", "system");
    root.setAttribute("data-theme", t === "system" ? (mq && mq.matches ? "dark" : "light") : t);
    root.setAttribute("data-motion", get("mw-motion", "full"));
  }
  applyTheme();
  if (mq && mq.addEventListener) mq.addEventListener("change", applyTheme);

  // ---------- dates ----------
  function sydToday() {
    try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }
    catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function nice(d, opts) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", Object.assign({ timeZone: "UTC" }, opts)); }
  var DIFF = ["Genius", "Easy", "Easy", "Medium", "Medium", "Hard", "Hard"];
  function diffFor(g, d, dow) { if (g.nmode) return (window.MW_EINSTEIN_N && (MW_EINSTEIN_N[g.id] || []).indexOf(d) >= 0) ? "Einstein" : DIFF[dow]; return (window.MW_EINSTEIN && (MW_EINSTEIN[g.id] || []).indexOf(d) >= 0) ? "Einstein" : DIFF[dow]; }
  var EIN = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/></svg>';
  var DIFFQ = { Einstein: "Roughly one day in 50. Bring everything you have.", Easy: "Warm-up lap. No excuses.", Medium: "Pay attention. This one bites.", Hard: "Coffee first. Then think.", Genius: "Good luck, professor." };
  var DAYQ = [
    "Genius day. Bring your A-game and a strong coffee.",
    "Ease in. The waiting room is already full.",
    "Still easy. Enjoy it while it lasts.",
    "Hump day. The cases get cheekier.",
    "Nearly there. Concentrate.",
    "Hard mode. Don't phone it in before the weekend.",
    "Hard again. No locum to save you."
  ];
  var DAYQ_N = [
    "Genius day. Bring your A-game and a strong coffee.",
    "Ease in. Nobody's judging. Yet.",
    "Still easy. Enjoy it while it lasts.",
    "Hump day. The puzzles get cheekier.",
    "Nearly there. Concentrate.",
    "Hard mode. Don't phone it in before the weekend.",
    "Hard again. Your weekend brain is not an excuse."
  ];
  function pickDay(a, d) { return a[dayNum(d) % a.length]; }
  var SOON = ["In theatre", "Still in the lab", "Awaiting ethics approval", "On the waitlist", "Pending review"];

  // ---------- icons ----------
  var I = { menu: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.5"/></svg>',
    stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3.1 15H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 .3 1.8"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };
  function accentOf(g) { return root.getAttribute("data-theme") === "dark" ? g.accentDark : g.accent; }
  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }

  // ---------- modal ----------
  function modal(title, html) {
    var s = el('<div class="scrim" role="dialog" aria-modal="true" aria-label="' + title + '"><div class="modal"><button class="icon-btn x" aria-label="Close">' + I.x + '</button><h2>' + title + '</h2>' + html + '</div></div>');
    function close() { s.remove(); document.removeEventListener("keydown", esc); }
    function esc(e) { if (e.key === "Escape") close(); }
    s.addEventListener("click", function (e) { if (e.target === s) close(); });
    s.querySelector(".x").onclick = close;
    document.addEventListener("keydown", esc);
    document.body.appendChild(s); s.querySelector(".x").focus();
    return s;
  }
  function settings() {
    var t = get("mw-theme", "system"), m = get("mw-motion", "full");
    function seg(name, opts, cur) {
      return '<div class="seg" data-k="' + name + '">' + opts.map(function (o) {
        return '<button type="button" data-v="' + o[0] + '" aria-pressed="' + (o[0] === cur) + '">' + o[1] + "</button>";
      }).join("") + "</div>";
    }
    var s = modal("Settings. Fiddle away.",
      '<div class="opt"><span>Theme</span>' + seg("mw-theme", [["system", "Auto"], ["light", "Light"], ["dark", "Dark"]], t) + "</div>" +
      '<div class="opt"><span>Animations</span>' + seg("mw-motion", [["full", "On"], ["reduce", "Off"]], m) + "</div>" +
      '<a class="mw-melink" href="/me/">\ud83c\udfc5 My stats, streaks and badges \u203a</a>');
    Array.prototype.forEach.call(s.querySelectorAll(".seg"), function (g) {
      g.onclick = function (e) {
        var b = e.target.closest("button"); if (!b) return;
        set(g.getAttribute("data-k"), b.getAttribute("data-v")); applyTheme();
        Array.prototype.forEach.call(g.children, function (c) { c.setAttribute("aria-pressed", c === b); });
        if (window.MW_onTheme) window.MW_onTheme();
      };
    });
  }

  // ---------- per-game stats readers ----------
  function readStats(g) {
    if (!g || !g.store) return null;
    var L = g.store.labels || ["1", "2", "3", "4", "5", "6", "X"];
    var s = get(g.store.stats, null) || { played: 0, wins: 0, streak: 0, best: 0, dist: L.map(function () { return 0; }) };
    var key = sydToday(); if (g.store.weekly) { var n = dayNum(key), wd = new Date(n * 864e5).getUTCDay(); key = new Date((n - (wd - (g.store.weekStart == null ? 1 : g.store.weekStart) + 7) % 7) * 864e5).toISOString().slice(0, 10); }
    var today = get(g.store.day + key, null);
    return { s: s, done: !!(today && today.done), win: !!(today && today.win), labels: L };
  }
  function statsModal(g) {
    var r = readStats(g);
    if (!r) { modal("Stats", "<p>No stats yet. Play something, doctor.</p>"); return; }
    var s = r.s, pct = s.played ? Math.round(s.wins / s.played * 100) : 0, max = Math.max.apply(null, (s.dist || [0]).concat([1]));
    modal(g.name + " stats" + ((g.store && g.store.distTitle) || ""),
      '<div class="mstats"><div><b>' + s.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Win %</span></div><div><b>' + s.streak + '</b><span>Streak</span></div><div><b>' + s.best + '</b><span>Best</span></div></div>' +
      '<div class="mdist">' + (s.dist || []).map(function (n, i) { return '<div><span>' + r.labels[i] + '</span><i style="width:' + Math.max(8, Math.round(n / max * 100)) + '%">' + n + "</i></div>"; }).join("") + "</div>" +
      '<p style="margin:0;color:var(--muted);font-size:13px">Saved in this browser on this device. Clear your browser, lose your glory.</p>' +
      '<a class="mw-melink" href="/me/">\ud83c\udfc5 See all my stats and badges \u203a</a>');
  }


  // ---------- newsletter (Buttondown) ----------
  var NL_HTML = '<section class="nl" id="newsletter"><div class="nl-txt"><b>Get Zebra Mail \ud83e\udd93</b><span>The Weekly Dose: a quick, funny breakdown of the week in health and medicine, every Friday, with puzzles at the end. From an Australian GP. Unsubscribe any time.</span></div>' +
    '<form class="mw-nl" action="https://buttondown.com/api/emails/embed-subscribe/maladywise" method="post" target="_blank">' +
    '<label class="sr" for="nl-email">Email address</label><input id="nl-email" type="email" name="email" required placeholder="you@example.com" autocomplete="email">' +
    '<input type="hidden" name="embed" value="1"><button type="submit">Subscribe</button></form><p class="nl-msg" aria-live="polite"></p></section>';
  document.addEventListener("submit", function (e) {
    var f = e.target; if (!f.classList || !f.classList.contains("mw-nl") || !window.fetch) return;
    e.preventDefault();
    var msg = f.parentNode.querySelector(".nl-msg"), btn = f.querySelector("button");
    btn.disabled = true; btn.textContent = "Sending\u2026";
    fetch(f.action, { method: "POST", mode: "no-cors", body: new FormData(f) }).then(function () {
      f.hidden = true; set("mw-nl-sub", 1); msg.textContent = "Nearly there. Check your inbox and tap the confirm link.";
    }).catch(function () { btn.disabled = false; btn.textContent = "Subscribe"; msg.textContent = "Couldn't reach the mail server. Try again in a minute."; });
  });
  window.MW_NL = NL_HTML;

  // ---------- seasonal logo icon ----------
  var SEASONS = [
    ["10-24", "10-31", "halloween", "Happy Halloween"],
    ["2026-11-03", "", "melbcup", "Melbourne Cup. Think horses."], ["2027-11-02", "", "melbcup", "Melbourne Cup. Think horses."], ["2028-11-07", "", "melbcup", "Melbourne Cup. Think horses."],
    ["12-01", "12-26", "christmas", "Merry Christmas"],
    ["12-31", "12-31", "newyear", "Happy New Year"], ["01-01", "01-01", "newyear", "Happy New Year"],
    ["2027-02-06", "", "lunar", "Happy Lunar New Year"], ["2028-01-26", "", "lunar", "Happy Lunar New Year"],
    ["2027-02-09", "", "pancake", "Pancake Day"], ["2028-02-29", "", "pancake", "Pancake Day"],
    ["02-14", "02-14", "valentine", "Happy Valentine\u2019s Day"],
    ["03-17", "03-17", "stpatrick", "Happy St Patrick\u2019s Day"],
    ["04-01", "04-01", "aprilfools", "April Fools\u2019 Day"],
    ["2027-03-26", "2027-03-29", "easter", "Happy Easter"], ["2028-04-14", "2028-04-17", "easter", "Happy Easter"]
  ];
  function season() {
    var t = sydToday(), md = t.slice(5), hit = null;
    SEASONS.forEach(function (x) {
      var full = x[0].length > 5, a = x[0], b = x[1] || x[0], v = full ? t : md;
      if (v >= a && v <= b) hit = x;
    });
    return hit ? '<img class="season" src="/assets/season/' + hit[2] + '.svg" width="30" height="30" alt="' + hit[3] + '" title="' + hit[3] + '">' : "";
  }

  // ---------- top bar ----------
  function topBar(g, home) {
    var sub = window.MW_HOME ? "" : "<span>" + MW_SITE.sub + "</span>";
    var bar = el('<header class="bar"><div class="bar-in">' +
      (g ? '<a class="back" href="../" aria-label="Back to ' + MW_SITE.name + '">' + I.back + '<span class="back-t">' + MW_SITE.name + "</span>" + season() + "</a>" : '<a class="logo" href="' + (home || "./") + '">' + MW_SITE.name + season() + sub + "</a>") +
      '<nav class="tools" aria-label="Tools">' + modeSwitch() +
      (!g && window.MW_HOME ? '<div class="navwrap" id="mw-nav">' + MW_HOME.nav.filter(function (n) { return !NORMIE || !/^\/(conditions|medicines|tools)\//.test(n[1]); }).map(function (n) { return '<a class="navlink' + (location.pathname === n[1] ? " on" : "") + '" href="' + n[1] + '">' + n[0] + "</a>"; }).join("") +
        '<a class="subpill" href="#newsletter" data-a="sub">Subscribe</a></div><button class="icon-btn burger" data-a="menu" aria-label="Menu" aria-expanded="false" aria-controls="mw-nav">' + I.menu + "</button>" : "") +
      (g ? '<button class="icon-btn" data-a="help" aria-label="How to play">' + I.help + "</button>" +
           '<button class="icon-btn" data-a="stats" aria-label="Stats">' + I.stats + "</button>" +
           '<button class="icon-btn" data-a="archive" aria-label="Past puzzles">' + I.archive + "</button>" : "") +
      '<button class="icon-btn" data-a="settings" aria-label="Settings">' + I.gear + "</button></nav></div></header>");
    bar.addEventListener("click", function (e) {
      var mb = e.target.closest(".mw-mode [data-mode]");
      if (mb) { var nm = mb.getAttribute("data-mode"); if (nm !== MODE) { Array.prototype.forEach.call(mb.parentNode.children, function (c) { c.setAttribute("aria-pressed", c === mb); }); setMode(nm); } return; }
      var b = e.target.closest("[data-a]"); if (!b) return;
      var a = b.getAttribute("data-a");
      if (a === "menu") { var nv = document.getElementById("mw-nav"), op = nv.classList.toggle("open"); b.setAttribute("aria-expanded", op ? "true" : "false"); }
      if (a === "sub") { var t = document.getElementById("newsletter"); if (t) { e.preventDefault(); var nv2 = document.getElementById("mw-nav"); if (nv2) nv2.classList.remove("open"); t.scrollIntoView({ behavior: "smooth", block: "center" }); var inp = t.querySelector("input[type=email]"); if (inp) setTimeout(function () { inp.focus({ preventScroll: true }); }, 400); } else { e.preventDefault(); location.href = "/#newsletter"; } }
      if (a === "settings") settings();
      if (a === "stats") statsModal(g);
      if (a === "help") modal("How to play", mascotHelp(g) + "<ol>" + (g.help || []).map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol>" + (g.helpQuip ? '<p style="margin:0;color:var(--muted)">' + g.helpQuip + "</p>" : ""));
      if (a === "archive") { if (window.MW_openArchive) window.MW_openArchive(); }
    });
    document.body.insertBefore(bar, document.body.firstChild);
  }

  function countdown() {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
      var left = 86400 - ((p[0] % 24) * 3600 + p[1] * 60 + p[2]);
      var h = Math.floor(left / 3600), m = Math.floor(left % 3600 / 60), sec = left % 60;
      return h + "h " + ("0" + m).slice(-2) + "m";
    } catch (e) { return "at midnight"; }
  }

  // ---------- hub ----------
  function hub() { setTimeout(social, 0);
    topBar(null);
    var today = sydToday(), dow = new Date(dayNum(today) * 864e5).getUTCDay();
    var main = document.getElementById("hub");
    function card(g) {
      var st = g.live ? readStats(g) : null;
      var status = !st ? "" : st.done ? (st.win ? "Solved. Smug. " : "Done. Humbled. ") + (st.s.streak ? "&middot; Streak <b>&#128293; " + st.s.streak + "</b>" : "") : st.s.streak ? "Streak <b>&#128293; " + st.s.streak + "</b>" : "";
      var btn = !g.live ? (g.from ? "From " + nice(g.from, { weekday: "short", day: "numeric", month: "short" }) : SOON[(MW_GAMES.indexOf(g) + dayNum(today)) % SOON.length]) : st && st.done ? "Review" : "Play";
      var tag = g.live ? "a" : "div", med = false; // medical-only games are filtered out of Normie mode entirely
      return "<" + tag + ' class="card' + (g.live ? "" : " soon") + (med ? " medonly" : "") + (g.featured ? " feature" : "") + (st && st.done ? " done" : "") + '" style="--accent:' + accentOf(g) + '"' + (g.live ? ' href="' + g.path + '"' : "") + ">" +
        '<div class="band">' + g.icon + (st && st.done ? '<span class="tick" aria-label="Done today">\u2713</span>' : "") + "</div>" +
        '<div class="cbody">' +
        '<h2 class="name">' + g.name + "</h2>" + (med ? '<span class="mw-medtag">\ud83e\ude7a Medical only</span>' : g.nmode ? '<span class="mw-npill">\ud83d\ude42 Normie</span>' : "") + (!g.weekly && !g.dailyLine && diffFor(g, today, dow) === "Einstein" && g.live ? '<span class="pill ein einc">' + EIN + " Einstein day</span>" : "") + (g.kind ? '<p class="kind">' + g.kind + "</p>" : "") + (g.weekly ? '<span class="pillrow"><span class="pill wk">Weekly</span>' + (g.relday ? '<span class="pill wk day">' + g.relday + "</span>" : "") + "</span>" : "") + (g.special && g.live && g.special.dow === dow && !(g.special.from && today < g.special.from) ? '<span class="pill wk sup">' + g.special.short + "</span>" : "") + '<p class="tag">' + g.tagline + "</p>" +
        '<div class="cfoot"><span class="play">' + btn + '</span><span class="status">' + status + "</span></div>" + "</div></" + tag + ">";
    }
    function homeTop() {
      var H = window.MW_HOME; if (!H || !H.tagline) return "";
      return '<section class="hero"><h1>' + H.tagline + '</h1><p>' + H.intro + '</p><nav class="chips" aria-label="Sections">' +
        H.nav.map(function (n) { return '<a href="' + (n[1].charAt(0) === "#" ? location.pathname + n[1] : n[1]) + '">' + n[0] + "</a>"; }).join("") + "</nav></section>";
    }
    function homeBottom() {
      var H = window.MW_HOME; if (!H) return "";
      return H.sections.map(function (sec) {
        return '<section class="sec" id="' + sec.id + '"><div class="sec-head"><h2>' + sec.title + "</h2>" + (sec.note ? "<span>" + sec.note + "</span>" : "") + '</div><div class="sgrid">' +
          sec.items.map(function (it) { return '<a class="scard" href="' + it.href + '"><span class="stag">' + it.tag + "</span><b>" + it.title + "</b><p>" + it.text + "</p></a>"; }).join("") + "</div></section>";
      }).join("");
    }
    function house() {
      var h = MW_SITE.house; if (!h) return "";
      var nf = window.MW_FACTS ? Object.keys(MW_FACTS).filter(function (k) { return MW_FACTS[k].k === "fact"; }).length : 0;
      return (NORMIE ? "" : '<a class="card house" href="/conditions/" style="--accent:' + (root.getAttribute("data-theme") === "dark" ? "#6FB7A8" : "#2E7D6B") + '">' +
        '<div class="band"><svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 6h16l8 8v28H14z"/><path d="M30 6v8h8M20 24h12M20 31h12M26 18v12"/></svg></div>' +
        '<div class="cbody"><h2 class="name">Conditions &amp; Medicines</h2><p class="kind">Plain-English health info</p><p class="tag">' + (nf ? nf + " " : "") + 'plain-English fact sheets, evidence-rated and printable. Plus drug guides and doctor tools.</p><div class="cfoot"><span class="play">Read</span></div></div></a>') +
        '<a class="card house" href="' + h.href + '" target="_blank" rel="noopener" style="--accent:' + (root.getAttribute("data-theme") === "dark" ? h.accentDark : h.accent) + '">' +
        '<div class="band"><svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 20v8h6l14 9V11L14 20H8z"/><path d="M34 18a8 8 0 0 1 0 12M38 13a14 14 0 0 1 0 22"/></svg></div>' +
        '<div class="cbody"><h2 class="name">' + h.name + '</h2><p class="tag">' + h.text + '</p><div class="cfoot"><span class="play">' + h.cta + "</span></div></div></a>" +
        '<a class="card house" href="https://ko-fi.com/maladywise" target="_blank" rel="noopener" style="--accent:' + (root.getAttribute("data-theme") === "dark" ? "#D9A066" : "#A8642A") + '">' +
        '<div class="band"><svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 18h26v10a10 10 0 0 1-10 10h-6A10 10 0 0 1 8 28z"/><path d="M34 20h3a5 5 0 0 1 0 10h-3M16 6c0 3 2 3 2 6M24 6c0 3 2 3 2 6"/></svg></div>' +
        '<div class="cbody"><h2 class="name">Buy me a coffee</h2><p class="tag">Free, no ads, made after hours. A coffee keeps new puzzles coming.</p><div class="cfoot"><span class="play">Ko-fi \u2615</span></div></div></a>';
    }
    function order() {
      var ORD = window.MW_ORDER || [], DAYS = { Thursdays: 4, Saturdays: 6, Sundays: 0 }, dw = new Date(dayNum(sydToday()) * 864e5).getUTCDay();
      return MW_GAMES.filter(inMode).map(function (g, i) {
        var st = g.live ? readStats(g) : null, k = ORD.indexOf(g.id); k = k < 0 ? 100 + i : k;
        if (g.live && g.relday && DAYS[g.relday] === dw) k = 0.5; // release day: right after Dxtective
        return { g: g, i: k, d: st && st.done ? 1 : 0, m: inMode(g) ? 0 : 1 };
      })
        .sort(function (a, b) { return a.m - b.m || a.d - b.d || a.i - b.i; }).map(function (x) { return x.g; });
    }
    function streakPill() {
      var sk = siteStreak();
      return '<span class="mwstreak">\ud83d\udd25 <b>' + sk.n + "-day</b> streak" + (sk.n === 0 ? ". Start one today" : sk.today ? "" : ". Play today to keep it") + "</span>";
    }
    function progress() {
      var daily = MW_GAMES.filter(function (g) { return g.live && !g.weekly && inMode(g); }), n = daily.length;
      var d = daily.filter(function (g) { var st = readStats(g); return st && st.done; }).length;
      var q = d === 0 ? (NORMIE ? "None yet. Kettle on, let's go." : "None yet. The waiting room is full.") : d === n ? "All done. Go outside. Touch grass. Hydrate." : d >= n - 2 ? (NORMIE ? "Nearly there. Finish strong." : "Nearly there. Finish the round.") : d >= n / 2 ? "Over halfway. Don\u2019t clock off yet." : "Good start. Plenty left.";
      return '<div class="mwprog">' + installChip() + '<div class="mwbar"><i style="width:' + Math.round(d / n * 100) + '%"></i></div><div class="mwline"><p><b>' + d + " of " + n + "</b> done today. " + q + "</p>" + streakPill() + '<a class="mw-mestat" href="/me/">\ud83c\udfc5 My stats</a>' + "</div></div>";
    }
    // Health days banner (data/health-days.json). Days and weeks only; months are background themes.
    var HD = null;
    function inAU() { try { var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; if (/^Australia\//.test(tz)) return true; } catch (e) {} return /-AU$/i.test(navigator.language || ""); }
    function healthDay() {
      if (HD === null) {
        HD = false;
        fetch("/data/health-days.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; })
          .then(function (j) { HD = (j && j.days) || []; healthDay(); }).catch(function () {});
        return;
      }
      if (!HD || !HD.length) return;
      var yr = today.slice(0, 4);
      var on = HD.filter(function (x) {
        var d = x.dates && x.dates[yr]; if (!d || x.kind === "month") return false;
        if (x.tags && x.tags.indexOf("au") >= 0 && !inAU()) return false;
        return d.end ? d.start <= today && today <= d.end : d.start === today;
      });
      if (!on.length) return;
      var normal = on.filter(function (x) { return x.tags.indexOf("sensitive") < 0; })
        .sort(function (a, b) {
          var fa = a.kind === "day" || a.dates[yr].start === today ? 0 : 1, fb = b.kind === "day" || b.dates[yr].start === today ? 0 : 1;
          return fa - fb || a.priority - b.priority;
        });
      var sens = on.filter(function (x) { return x.tags.indexOf("sensitive") >= 0; });
      var html = "";
      if (normal.length) {
        var lead = normal[0], first = lead.dates[yr].start === today;
        var themed = !NORMIE && lead.puzzle_theme && (lead.kind === "day" || first) && !/puzzle/i.test(lead.blurb);
        html += '<section class="hday' + (lead.icon ? ' has-ic' : '') + '">' + (lead.icon ? '<img class="hday-ic" src="/assets/days/' + esc2(lead.icon) + '.svg" alt="" width="84" height="84">' : '') + '<span class="hday-k">'  + (lead.kind === "week" ? "This week" : "Today") + '</span>' +
          "<h2>" + esc2(lead.name) + "</h2><p>" + esc2(lead.blurb) + (themed ? " <b>Today’s puzzles are on the theme.</b>" : "") + "</p>" +
          (normal.length > 1 ? '<p class="hday-also">Also: ' + normal.slice(1).map(function (x) { return x.link ? '<a href="' + esc2(x.link) + '" target="_blank" rel="noopener">' + esc2(x.name) + "</a>" : esc2(x.name); }).join(", ") + "</p>" : "") +
          (lead.link ? '<a class="hday-go" href="' + esc2(lead.link) + '" target="_blank" rel="noopener">Learn more</a>' : "") + "</section>";
      }
      sens.forEach(function (x) {
        html += '<section class="hday quiet"><p><b>' + esc2(x.name) + ".</b> " + esc2(x.blurb) + (x.link ? ' <a href="' + esc2(x.link) + '" target="_blank" rel="noopener">More</a>' : "") + "</p></section>";
      });
      var old = main.querySelectorAll(".hday"); Array.prototype.forEach.call(old, function (n) { n.remove(); });
      var mast = document.getElementById("puzzles");
      if (mast) mast.insertAdjacentHTML("afterend", html);
    }
    function draw() {
      main.innerHTML = homeTop() + '<section class="mast" id="puzzles"><div class="mast-top"><div class="mast-l"><p class="tagl">' + (NORMIE ? "\ud83d\ude42 No medical degree required." : "Think like a doctor.") + '</p><h1>Today&rsquo;s ' + (NORMIE ? "" : "medical ") + 'puzzles</h1>' +
        '<p class="mdate">' + nice(today, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + "</p><p>" + (NORMIE ? DAYQ_N : DAYQ)[dow] + "</p>" + (NORMIE ? '<p class="mw-normline">' + normImg("mw-norm", 40) + "<span><b>Norm here.</b> No medicine today. Just puzzles.</span></p>" : "") + "</div>" +
        '<div class="mast-r"><span class="pill daypill d-' + DIFF[dow] + '">' + nice(today, { weekday: "long" }) + " &middot; " + DIFF[dow] + '</span><span class="nextin">New puzzles in <b id="mw-count">' + countdown() + "</b></span></div></div>" +
        (function () { var t = get(mk("mw-einstein"), []); return t.length ? '<p class="trophy">' + EIN + " Einstein badges: <b>" + t.length + "</b>. Genuinely rare. Frame them.</p>" : ""; })() + "</section>" +
        progress() + '<div class="grid">' + order().map(card).join("") + house() + "</div>" + homeBottom() + NL_HTML +
        '<footer class="site">' + (MW_SITE.quip ? MW_SITE.quip + "<br>" : "") + MW_SITE.footer + '<br><a href="about/">About</a> \u00b7 <a href="disclaimer/">Disclaimer</a> \u00b7 <a href="privacy/">Privacy</a> \u00b7 <a href="contact/">Contact</a></footer>';
    }
    draw(); window.MW_onTheme = function () { draw(); healthDay(); };
    healthDay();
    if (!window.MW_tick) window.MW_tick = setInterval(function () {
      var c = document.getElementById("mw-count"); if (!c) return;
      if (sydToday() !== today) { location.reload(); return; }
      c.textContent = countdown();
    }, 1000);
  }


  // ---------- in-game extras: "keep playing" strip + last 7 days open ----------
  function extras(g, box, today) {
    var arch = box.querySelector("details.archive");
    if (!arch) return;
    var others = MW_GAMES.filter(function (x) { return x.live && x.id !== g.id && inMode(x); }).map(function (x) { return { g: x, st: readStats(x), m: inMode(x) ? 0 : 1 }; });
    var OK = window.MW_ORDER || []; function oi(x) { var i = OK.indexOf(x.g.id); return i < 0 ? 99 : i; }
    others.sort(function (a, b) { return a.m - b.m || (a.st && a.st.done ? 1 : 0) - (b.st && b.st.done ? 1 : 0) || oi(a) - oi(b); });
    var left = others.filter(function (o) { return !o.m && !(o.st && o.st.done); }).length;
    var strip = el('<section class="mwx"><div class="mwx-head"><b>Keep playing</b><span>' + (left ? left + " left today" : "All done today. Show-off.") + '</span></div><div class="mwx-list">' +
      others.map(function (o) {
        var done = o.st && o.st.done;
        return '<a class="mwx-row' + (done ? " done" : "") + (o.m ? " medonly" : "") + '" href="../' + o.g.path + '?play" style="--ga:' + accentOf(o.g) + '"><span class="mwx-ic">' + o.g.icon + '</span><span class="mwx-nm">' + o.g.name + (o.m ? '<small class="mw-medtag">Medical only</small>' : "") + '</span><span class="mwx-st">' + (done ? (o.st.win ? "\u2713" : "Done") : "\u203a") + "</span></a>";
      }).join("") + '</div><a class="mwx-all" href="../">All puzzles</a></section>');
    arch.parentNode.insertBefore(strip, arch);
    if (!document.getElementById("newsletter")) { var nl = el(NL_HTML); nl.classList.add("nl-game"); arch.parentNode.insertBefore(nl, arch.nextSibling); }
    // show the last 7 days straight away, older ones behind a button
    arch.open = true;
    var sum = arch.querySelector("summary"); if (sum) sum.textContent = "Past puzzles";
    var expanded = false, obs;
    function limit() {
      if (obs) obs.disconnect();
      var rows = arch.querySelectorAll(".arow"), list = rows.length ? rows[0].parentNode : null;
      Array.prototype.forEach.call(rows, function (r, i) { r.hidden = !expanded && i >= 7; });
      var more = arch.querySelector(".mwx-more");
      if (list && rows.length > 7 && !expanded) {
        if (!more) { more = document.createElement("button"); more.type = "button"; more.className = "mwx-more"; more.onclick = function () { expanded = true; limit(); }; }
        more.textContent = "Show " + (rows.length - 7) + " older"; if (more.parentNode !== list || list.lastChild !== more) list.appendChild(more);
      } else if (more) more.remove();
      if (obs) obs.observe(arch, { childList: true, subtree: true });
    }
    obs = new MutationObserver(function () { expanded = false; limit(); nextUnsolved(); });
    limit();
    var nx = el('<div class="mwx-next" hidden></div>'); strip.insertBefore(nx, strip.querySelector(".mwx-list"));
    function rowDate(r) { return r.getAttribute("data-d") || r.getAttribute("data-w"); }
    function nextUnsolved() {
      if (!g.store || !g.store.day) return;
      var rows = Array.prototype.slice.call(arch.querySelectorAll(".arow")), t = sydToday(), cur = (rows.filter(function (r) { return r.classList.contains("on"); })[0]);
      var curD = cur ? rowDate(cur) : (new URLSearchParams(location.search).get("date") || t);
      if (!cur && g.store.weekly && /^\d{4}-\d\d-\d\d$/.test(curD)) { var cn = dayNum(curD), cw = new Date(cn * 864e5).getUTCDay(); curD = new Date((cn - (cw - (g.store.weekStart == null ? 1 : g.store.weekStart) + 7) % 7) * 864e5).toISOString().slice(0, 10); } // weekly: this week's release day
      var curSt = get(g.store.day + curD, null);
      var todo = rows.filter(function (r) { var d = rowDate(r); if (!d || d > t || d === curD) return false; var x = get(g.store.day + d, null); return !(x && x.done); });
      nx.hidden = true;
      var done = curSt && curSt.done, tb = document.getElementById("mw-next-top");
      // today's next unplayed game in this mode
      var ORDx = window.MW_ORDER || [], tday = sydToday(), skipK = "mw-skip-" + tday, skips = get(skipK, []) || [];
      var left = MW_GAMES.filter(function (x) { if (!x.live || x.id === g.id || !inMode(x) || (x.from && x.from > tday)) return false; var r = readStats(x); return !(r && r.done); })
        .sort(function (a, b) { var ia = ORDx.indexOf(a.id), ib = ORDx.indexOf(b.id); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
      var pool = left.filter(function (x) { return skips.indexOf(x.id) < 0; }); if (!pool.length) { pool = left; if (skips.length) set(skipK, []); }
      var ng = pool[0];
      var r0 = todo[0], d0 = r0 ? rowDate(r0) : null;
      if (!done || (!ng && !r0)) { if (tb) tb.remove(); return; }
      var th = '<div class="mwx-btns">' + (ng ? '<a class="mwx-today" href="../' + ng.path + '?play">Next: ' + ng.name + '<small>' + left.length + ' left today</small></a>' : "") + (r0 ? '<button type="button" class="mwx-more2">More ' + g.name + '<small>' + todo.length + ' unsolved</small></button>' : "") + '</div>';
      if (ng && left.length > 1) th += '<button type="button" class="mwx-skip">Skip ' + ng.name + ' \u203a</button>';
      if (!tb) { var res = box.querySelector(".mw-sharerow"); if (!res) return; res.insertAdjacentHTML("afterend", '<div id="mw-next-top" class="mwx-nexttop"></div>'); tb = document.getElementById("mw-next-top"); }
      if (tb.getAttribute("data-h") === th) return;
      tb.innerHTML = th; tb.setAttribute("data-h", th);
      var mb = tb.querySelector(".mwx-more2"); if (mb) mb.onclick = function () { track("next-unsolved/" + g.id, g.name + " next unsolved"); tb.remove(); r0.click(); window.scrollTo({ top: 0, behavior: "smooth" }); };
      var tl = tb.querySelector(".mwx-today"); if (tl) tl.onclick = function () { track("next-today/" + g.id, g.name + " next today"); };
      var sk = tb.querySelector(".mwx-skip"); if (sk) sk.onclick = function () { var l = get(skipK, []) || []; if (l.indexOf(ng.id) < 0) l.push(ng.id); set(skipK, l); track("next-skip/" + ng.id, "skip " + ng.name); nextUnsolved(); };
    }
    nextUnsolved();
    window.addEventListener("storage", nextUnsolved);
    setInterval(nextUnsolved, 1500);
  }

  // ---------- game page ----------
  function game(id) { setTimeout(social, 0);
    var g = MW_GAMES.filter(function (x) { return x.id === id; })[0]; window.MW_curGame = g;
    watchDone(g);
    topBar(g);
    var today = sydToday(), dow = new Date(dayNum(today) * 864e5).getUTCDay();
    var st = readStats(g);
    var sp = document.getElementById("splash"), box = document.getElementById("game");
    var q = new URLSearchParams(location.search);
    function start() {
      sp.hidden = true; box.hidden = false; window.scrollTo(0, 0);
      if (g.help && !medOnly && !get("mw-seen-" + g.id, 0)) { set("mw-seen-" + g.id, 1); setTimeout(function () { modal("How to play " + g.name, mascotHelp(g) + "<ol>" + g.help.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol>" + (g.helpQuip ? '<p style="margin:0;color:var(--muted)">' + g.helpQuip + "</p>" : "") + '<p style="margin:10px 0 0;font-size:13px;color:var(--muted)">Find this again under the ? icon.</p>'); }, 350); }
    }
    if (g.id !== "dx" && box && !box.querySelector(".gtitle")) {
      var gt = document.createElement("header"); gt.className = "gtitle";
      gt.style.setProperty("--ga", g.accent); gt.style.setProperty("--gad", g.accentDark);
      gt.innerHTML = "<h1>" + g.name + (g.nmode ? ' <span class="mw-npill">\ud83d\ude42 Normie</span>' : "") + "</h1><p>" + g.tagline + "</p>";
      var hd = box.querySelector(".head");
      if (hd) hd.parentNode.insertBefore(gt, hd.nextSibling); else box.insertBefore(gt, box.firstChild);
    }
    // Medical-only games (no "normie" block) show their own "switch to Medical" note in Normie mode: no splash, no help pop-up.
    var medOnly = NORMIE && !g.nmode, medNote = "";
    extras(g, box, today);
    var ab = window.MW_ABOUT && MW_ABOUT[g.id];
    if (ab) {
      (box.querySelector(".wrap") || box).appendChild(el('<section class="mw-about"><h2>About ' + g.name + '</h2><p>' + ab[0] + '</p>' + ab[1].map(function (q) { return "<details><summary>" + q[0] + "</summary><p>" + q[1] + "</p></details>"; }).join("") + "</section>"));
      var ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: ab[1].map(function (q) { return { "@type": "Question", name: q[0], acceptedAnswer: { "@type": "Answer", text: q[1] } }; }) };
      if (!g.nmode) { var sc = document.createElement("script"); sc.type = "application/ld+json"; sc.textContent = JSON.stringify(ld); document.head.appendChild(sc); }
    }
    if (medOnly || q.get("date") || q.get("play") !== null) { start(); return; }
    sp.style.setProperty("--accent", accentOf(g));
    var einToday = !g.weekly && !g.dailyLine && diffFor(g, today, dow) === "Einstein";
    sp.innerHTML = '<div class="splash-in">' + medNote + (g.nmode ? '<span class="mw-npill">\ud83d\ude42 Normie mode</span>' : "") + (g.special && g.special.dow === dow && !(g.special.from && today < g.special.from) ? '<span class="pill sup">' + g.special.label + "</span>" : "") + (einToday ? '<span class="pill ein">' + EIN + " Einstein day</span>" : "") + '<div class="tile' + (einToday ? " ein" : "") + '">' + g.icon + "</div><p class=\"sp-title\" role=\"heading\" aria-level=\"2\">" + g.name + "</p><p>" + g.tagline + "</p>" + (g.quip ? '<p class="meta">' + g.quip + "</p>" : "") +
      '<button class="big" type="button" id="mw-play">' + (st && st.done ? "Review" : "Play") + "</button>" +
      '<div class="meta"><b>' + nice(today, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + "</b><br>" + (g.dailyLine ? g.dailyLine : g.weekly ? (g.weeklyLine || "A new quiz every Monday. Ten questions, one theme.") : "Today: " + diffFor(g, today, dow) + ". " + DIFFQ[diffFor(g, today, dow)]) +
      (st && st.s.streak ? " &middot; Streak &#128293; " + st.s.streak : "") + "</div></div>";
    document.getElementById("mw-play").onclick = start;
    window.MW_onTheme = function () { sp.style.setProperty("--accent", accentOf(g)); };
  }

  // ---------- social links in every footer (edit MW_SITE.social to add more) ----------
  function social() {
    var f = document.querySelector("footer.site"), L = (window.MW_SITE && MW_SITE.social) || [];
    if (!f || !L.length || f.querySelector(".soc")) return;
    var d = document.createElement("div"); d.className = "soc";
    d.innerHTML = '<span>Follow</span>' + L.map(function (x) { return '<a href="' + x[1] + '" target="_blank" rel="noopener" aria-label="' + x[0] + ' ' + x[2] + '">' + x[3] + "<b>" + x[2] + "</b></a>"; }).join("");
    f.insertBefore(d, f.firstChild);
  }
  function infoExtras() {
    var F = window.MW_FACTS, p = location.pathname.replace(/index\.html$/, ""), me = F && F[p]; if (!me) return;
    var main = document.querySelector("main"), h1 = main && main.querySelector("h1"); if (!h1) return;
    var rev = (document.body.textContent.match(/Reviewed ([A-Z][a-z]+ \d{4})/) || [])[1] || "";
    h1.insertAdjacentHTML("afterend", '<p class="trust">\u2714 Written and reviewed by an Australian GP' + (rev ? " \u00b7 " + rev : "") + "</p>");
    var rel = (me.r || []).filter(function (q) { return F[q]; });
    var foot = main.querySelector("footer.site"), anchor = main.querySelector(".print-url") || foot;
    if (rel.length && anchor) anchor.insertAdjacentHTML("beforebegin", '<section class="related"><h2>Related</h2><ul>' + rel.map(function (q) { return '<li><a href="' + q + '"><span>' + { fact: "Fact sheet", drug: "Drug", tool: "Tool" }[F[q].k] + "</span>" + F[q].t + "</a></li>"; }).join("") + "</ul></section>");
    var pu = main.querySelector(".print-url"), qr = "/assets/qr/" + p.replace(/^\/|\/$/g, "").replace(/\//g, "-") + ".svg";
    if (pu) pu.insertAdjacentHTML("beforebegin", '<img class="print-qr" src="' + qr + '" alt="QR code for this page" width="72" height="72">');
    else if (foot) foot.insertAdjacentHTML("beforebegin", '<p class="print-url">maladywise.com' + p + '</p><img class="print-qr" src="' + qr + '" alt="QR code for this page" width="72" height="72">');
    var desc = (document.querySelector('meta[name="description"]') || {}).content || "";
    var ld = { "@context": "https://schema.org", "@type": "MedicalWebPage", name: (document.title || me.t).replace(/ \| Malady Wise$/, ""), url: "https://maladywise.com" + p, description: desc, inLanguage: "en-AU",
      audience: { "@type": "PeopleAudience", audienceType: me.k === "tool" ? "Clinicians" : "Patients" }, author: { "@type": "Organization", name: "Malady Wise", url: "https://maladywise.com/" },
      reviewedBy: { "@type": "Person", jobTitle: "General Practitioner", description: "Australian GP" } };
    if (rev) { var d = new Date(rev + " 1"); if (!isNaN(d)) ld.lastReviewed = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2); }
    var sc = document.createElement("script"); sc.type = "application/ld+json"; sc.textContent = JSON.stringify(ld); document.head.appendChild(sc);
    if (window.MW_GAMES && foot) {
      var gl = MW_GAMES.filter(function (x) { return x.live && inMode(x); }).map(function (x) { return { g: x, st: readStats(x), m: inMode(x) ? 0 : 1 }; });
      gl.sort(function (a, b) { return a.m - b.m || (a.st && a.st.done ? 1 : 0) - (b.st && b.st.done ? 1 : 0); });
      var left2 = gl.filter(function (o) { return !o.m && !(o.st && o.st.done); }).length;
      foot.insertAdjacentHTML("beforebegin", '<section class="mwx mwx-info"><div class="mwx-head"><b>Take a break: today\u2019s puzzles</b><span>' + (left2 ? left2 + " to play today" : "All done today. Impressive.") + '</span></div><div class="mwx-list">' +
        gl.map(function (o) { var dn = o.st && o.st.done; return '<a class="mwx-row' + (dn ? " done" : "") + (o.m ? " medonly" : "") + '" href="/' + o.g.path + '?play" style="--ga:' + accentOf(o.g) + '">' + mascImg(o.g.id, "", 34, "mwx-masc") + '<span class="mwx-nm">' + o.g.name + (o.m ? '<small class="mw-medtag">Medical only</small>' : "") + '</span><span class="mwx-st">' + (dn ? "\u2713" : "\u203A") + "</span></a>"; }).join("") +
        '</div><a class="mwx-all" href="/">All puzzles</a></section>');
    }
  }
  function page() { social(); topBar(null, "/"); var slot = document.getElementById("nl-slot"); if (slot) slot.outerHTML = NL_HTML; infoExtras(); }
  // ---------- secret: Night Shift (5 taps on the logo in 3s, or type "locum" on the home page) ----------
  (function () {
    if (!/^\/(index\.html)?$/.test(location.pathname)) return;
    var taps = [], typed = "", going = false;
    function unlock() {
      if (going) return; going = true;
      var t = document.createElement("div");
      t.textContent = "🦇 Something stirs…";
      t.setAttribute("role", "status");
      t.style.cssText = "position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);z-index:90;background:#2E1F57;color:#fff;font:600 16px var(--body);padding:14px 22px;border-radius:999px;box-shadow:0 12px 34px rgba(0,0,0,.35)";
      document.body.appendChild(t);
      setTimeout(function () { location.href = "/nightshift/"; }, 900);
    }
    document.addEventListener("click", function (e) {
      if (!e.target.closest || !e.target.closest(".bar .logo")) return;
      e.preventDefault();
      var now = Date.now();
      taps = taps.filter(function (x) { return now - x < 3000; }); taps.push(now);
      if (taps.length >= 5) unlock();
    });
    document.addEventListener("keydown", function (e) {
      var tg = e.target && e.target.tagName;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tg) || (e.target && e.target.isContentEditable) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (!e.key || e.key.length !== 1) return;
      typed = (typed + e.key.toLowerCase()).slice(-5);
      if (typed === "locum") unlock();
    });
  })();
  window.MW = { hub: hub, game: game, modal: modal, page: page };
})();
