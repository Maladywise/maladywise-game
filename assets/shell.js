/* Shared shell: theme, top bar, modals, hub rendering, game splash. No dependencies. */
(function () {
  "use strict";
  var root = document.documentElement;
  function get(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  // ---------- future puzzles stay locked: ?date= after today (Sydney) falls back to today ----------
  // Reviewers can open ?preview=1 once per device (remembered) to see future dates.
  (function () {
    try {
      var q = new URLSearchParams(location.search), d = q.get("date");
      if (q.get("preview") === "1") set("mw-preview", 1);
      if (q.get("preview") === "0") set("mw-preview", 0);
      if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d) || get("mw-preview", 0) === 1) return;
      var today = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      if (d <= today) return;
      q.delete("date");
      history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q.toString() : "") + location.hash);
      var nice = new Date(d + "T12:00:00").toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
      document.addEventListener("DOMContentLoaded", function () {
        var m = document.querySelector("main") || document.body, n = document.createElement("p");
        n.className = "mw-locked"; n.setAttribute("role", "status");
        n.textContent = "🔒 That puzzle unlocks on " + nice + ". Here's today's instead.";
        m.insertBefore(n, m.firstChild);
        setTimeout(function () { n.classList.add("mw-locked-go"); }, 6000);
      });
    } catch (e) {}
  })();

  // ---------- mode: "medical" (default) or "normie" (no-medicine versions of some games) ----------
  // localStorage "mw-mode"; ?mode=normie / ?mode=medical sets and remembers it (deep links, Zebra Mail).
  // A remembered Normie choice only applies on the home page and game pages (NORMIE_PAGE). Fact sheets,
  // medicines, handouts and other health pages stay Medical unless the link itself says ?mode=normie.
  var NORMIE_PAGE = (function () {
    var p = location.pathname.replace(/index\.html$/, ""), seg = p.split("/")[1] || "";
    if (p === "/") return true;
    if (p !== "/" + seg + "/") return false; // only a section's own page, e.g. /wordemic/ (not /wordemic/archive/)
    if (/^(normie|arcade|weird|me|nightshift|days|basil-clover|stackulus|mergeon)$/.test(seg)) return true;
    return (window.MW_GAMES || []).some(function (g) { return String(g.path || "").replace(/\/$/, "") === seg; });
  })();
  var MODE_URL = null;
  var MODE = (function () {
    var m = null; try { m = new URLSearchParams(location.search).get("mode"); } catch (e) {}
    if (m === "normie" || m === "medical") { set("mw-mode", m); MODE_URL = m; }
    if (MODE_URL) return MODE_URL;
    var v = get("mw-mode", "medical"); return v === "normie" && NORMIE_PAGE ? "normie" : "medical";
  })();
  var NORMIE = MODE === "normie";
  root.setAttribute("data-mode", MODE);
  window.MW_mode = function () { return MODE; };
  function mk(k) { return NORMIE ? "n-" + k : k; } // mode-aware site-wide keys (streak, badges, trophies)
  window.MW_key = mk;
  // Days back from day-number n to the most recent release day (weekStart may be one weekday or an array, e.g. [1, 4]).
  function relBack(n, ws) { var wd = new Date(n * 864e5).getUTCDay(), a = Array.isArray(ws) ? ws : [ws == null ? 1 : ws]; return Math.min.apply(null, a.map(function (r) { return (wd - r + 7) % 7; })); }
  // In Normie mode, games with a "normie" block swap their text and use "n-" prefixed store keys,
  // so every reader below (readStats, watchDone, extras, celebrate...) is mode-aware for free.
  if (NORMIE) (window.MW_GAMES || []).forEach(function (g) {
    if (!g.normie) return;
    var n = typeof g.normie === "object" ? g.normie : {};
    ["kind", "tagline", "quip", "helpQuip", "help", "weeklyLine", "relday"].forEach(function (f) { if (n[f] !== undefined) g[f] = n[f]; else if (f === "helpQuip") delete g.helpQuip; });
    if (g.store) { var st0 = {}; Object.keys(g.store).forEach(function (k) { st0[k] = g.store[k]; }); st0.stats = "n-" + g.store.stats; st0.day = "n-" + g.store.day; if (n.labels) st0.labels = n.labels; if (n.weekStart != null) st0.weekStart = n.weekStart; g.medStore = g.store; g.store = st0; }
    g.nmode = true;
  });
  if (NORMIE && window.MW_ABOUT_N && window.MW_ABOUT) Object.keys(MW_ABOUT_N).forEach(function (k) { MW_ABOUT[k] = MW_ABOUT_N[k]; });
  function setMode(m) {
    set("mw-mode", m);
    track("mode/" + m, "Switched to " + m + " mode");
    var u = new URL(location.href); u.searchParams.delete("mode"); u.searchParams.delete("date");
    if (!NORMIE_PAGE && m === "normie") u.searchParams.set("mode", "normie"); // health pages are Medical unless the link asks for Normie
    setTimeout(function () { location.replace(u.pathname + (u.search || "") + u.hash); }, 60);
  }
  window.MW_setMode = setMode;
  // arcade games (no daily puzzles): [path, name, mascot, tag line, accent, dark accent]. Home cards + "More games" box.
  var ARCADE = [["basil-clover", "Basil + Clover", "basil", "Basil kicks. Clover eats. Nothing is safe.", "#2B5E80", "#8EB8E8"], ["stackulus", "Stackulus", "stackulus", "Falling organs. Clear the rows.", "#7A4A92", "#C9A3DD"], ["mergeon", "Mergeon", "mergeon", "Merge microbes all the way up to a brain.", "#5E7A2E", "#A8C77A"]];
  // Mascot image: in Normie mode, games with normieMascot use the "day off" outfit (falls back to the normal one if missing).
  function mascImg(id, alt, w, cls) {
    var g = (window.MW_GAMES || []).filter(function (x) { return x.id === id; })[0], std = "/assets/mascots/" + id + ".svg";
    var src = NORMIE && g && g.normieMascot ? "/assets/mascots/normie/" + id + ".svg" : std;
    return '<img' + (cls ? ' class="' + cls + '"' : "") + ' src="' + src + '"' + (src !== std ? " onerror=\"this.onerror=null;this.src='" + std + "'\"" : "") + ' alt="' + (alt || "") + '" width="' + w + '" height="' + w + '" decoding="async"' + (cls === "mwx-masc" ? ' loading="lazy"' : "") + '>';
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
  function pageSlug() { var p = location.pathname.replace(/index\.html$/, "").replace(/^\/|\/$/g, ""); return p ? p.replace(/\//g, "-") : "home"; }
  // ---------- sharing: results end with the game's own link (?s=share), and every share is counted ----------
  function shareGame() { var g = window.MW_curGame; return (g && g.id) || location.pathname.split("/")[1] || "home"; }
  function shareURL(path) {
    var seg = location.pathname.split("/")[1] || "", g = window.MW_curGame;
    var p = path && path !== "/" ? path : (g && g.path ? "/" + String(g.path).replace(/^\/|\/$/g, "") + "/" : seg ? "/" + seg + "/" : "/");
    return "https://maladywise.com" + p + "?s=share";
  }
  // Swap a bare "maladywise.com" (or maladywise.com/<path>/) last line for the full share link.
  function fixShare(t) {
    if (typeof t !== "string") return t;
    return t.replace(/(^|\n)[ \t]*(?:https?:\/\/)?(?:www\.)?maladywise\.com(\/[A-Za-z0-9\/_-]*)?(?:\?s=share)?\s*$/, function (m, nl, path) { return nl + shareURL(path); });
  }
  window.MW_shareText = fixShare;
  function shareCount() { track("share/" + shareGame(), "Share " + shareGame()); }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      var cbw = navigator.clipboard.writeText.bind(navigator.clipboard);
      navigator.clipboard.writeText = function (t) { var f = fixShare(t); if (f !== t || /maladywise\.com/.test(String(t))) shareCount(); return cbw(f); };
    }
    if (navigator.share) {
      var nsh = navigator.share.bind(navigator);
      navigator.share = function (o) {
        o = o || {}; var c = {}; for (var k in o) c[k] = o[k];
        if (c.text) c.text = fixShare(c.text);
        if (c.url && /^https:\/\/maladywise\.com\//.test(c.url) && c.url.indexOf("?") < 0) c.url += "?s=share";
        if (c.text && c.url && c.text.indexOf(c.url) >= 0) delete c.url; // link already in the text: don't paste it twice
        shareCount(); return nsh(c);
      };
    }
  } catch (e) {}
  // ---------- "Share this page" card (written by _scripts/share_block.py): native share, else copy the link ----------
  document.addEventListener("click", function (ev) {
    var b = ev.target && ev.target.closest && ev.target.closest("[data-mw-share]");
    if (!b) return;
    var c = document.querySelector('link[rel="canonical"]'), url = (c && c.href) || location.href.split("#")[0];
    if (navigator.share) { navigator.share({ title: document.title, url: url }).catch(function () {}); return; }
    var done = function () { b.textContent = "Link copied"; setTimeout(function () { b.textContent = "Share link"; }, 2000); };
    try { navigator.clipboard.writeText(url + (url.indexOf("?") < 0 ? "?s=share" : "")).then(done, function () { prompt("Copy this link", url); }); }
    catch (e) { prompt("Copy this link", url); }
  });
  // ---------- live counts (players online + games played today) ----------
  // Anonymous: a random ID that lives only in this tab's memory. No cookies, no storage, no personal data.
  var LIVE = { url: "https://mw-presence.onrender.com", id: Math.random().toString(36).slice(2, 12), last: null, MIN_ON: 5, MIN_TODAY: 10, MIN_SOLVED: 10 };
  function liveGame() { return (window.MW_curGame && MW_curGame.id) || (location.pathname === "/" ? "home" : location.pathname.split("/")[1] || "home"); }
  var PRIVATE_PAGE = /^\/mental-health-check\//.test(location.pathname); // no live-player ping or event tracking on mental health self-checks
  function livePing() { if (document.hidden || PRIVATE_PAGE) return; try { fetch(LIVE.url + "/ping?id=" + LIVE.id + "&g=" + encodeURIComponent(liveGame()), { method: "POST", mode: "cors", keepalive: true }).catch(function () {}); } catch (e) {} }
  function liveShow() {
    var d = LIVE.last; if (!d) return;
    var bits = [];
    if (d.online >= LIVE.MIN_ON) bits.push('<span class="mw-dot"></span>' + d.online.toLocaleString("en-AU") + " playing now");
    if (d.today >= LIVE.MIN_TODAY) bits.push("\ud83e\udde9 " + d.today.toLocaleString("en-AU") + " games played today");
    var sv = d.solved || {};
    Array.prototype.forEach.call(document.querySelectorAll(".card[data-g],.t3[data-g]"), function (c) { var n = sv[c.getAttribute("data-g")] || 0, el = c.querySelector(".solvedn"); if (n < LIVE.MIN_SOLVED) { if (el) el.remove(); return; } if (!el) { el = document.createElement("span"); el.className = "solvedn"; var b = c.querySelector(".cfoot .play,.t3-tx small"); if (b) b.insertAdjacentElement("afterend", el); else return; } el.textContent = (n >= 1000 ? (Math.round(n / 100) / 10) + "k" : n) + " solved today"; });
    Array.prototype.forEach.call(document.querySelectorAll(".mw-live"), function (el) { el.innerHTML = bits.join(" &middot; "); el.hidden = !bits.length; });
  }
  function liveStats() { if (document.hidden) return; try { fetch(LIVE.url + "/stats", { mode: "cors" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) { if (d) { LIVE.last = d; liveShow(); } }).catch(function () {}); } catch (e) {} }
  function liveDone(id) { try { fetch(LIVE.url + "/done?g=" + encodeURIComponent(id), { method: "POST", mode: "cors", keepalive: true }).catch(function () {}); } catch (e) {} }
  window.MW_liveShow = liveShow;
  setTimeout(function () { livePing(); liveStats(); }, 1200);
  setInterval(livePing, 30000); setInterval(liveStats, 60000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { livePing(); liveStats(); } });
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
            if (!g.store.weekly ? k === pre + sydToday() : true) liveDone(g.id);
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
  // Today's 3 (MW_START in games.js): live daily games in this mode, topped up from MW_ORDER. Shared by the home list and in-game "Next".
  function startIds() {
    var S = window.MW_START || {}, want = ((NORMIE ? S.normie : S.medical) || [["dx", 3], ["wordemic", 3], ["triviosis", 4]]).slice(), out = [], G = window.MW_GAMES || [];
    // One fixed game (the first), plus two that rotate daily from the pool (MW_START.pool / poolN), so visitors meet new games.
    var pool = (NORMIE ? S.poolN : S.pool) || [];
    if (pool.length >= 2) { var dn = Math.floor(Date.parse(sydToday() + "T00:00:00Z") / 864e5), n = pool.length, a = (dn * 2) % n, b = (a + 1 + (dn % (n - 1))) % n; if (b === a) b = (a + 1) % n; want = [want[0], pool[a], pool[b]]; }
    function byId(id) { return G.filter(function (x) { return x.id === id; })[0]; }
    function ok(g) { return g && g.live && !g.weekly && inMode(g) && !out.some(function (o) { return o.g === g; }); }
    want.forEach(function (w) { var g = byId(w[0]); if (ok(g)) out.push({ g: g, min: w[1] }); });
    (window.MW_ORDER || []).forEach(function (id) { if (out.length < 3) { var g = byId(id); if (ok(g)) out.push({ g: g, min: 4 }); } });
    return out.slice(0, 3);
  }
  // Play order for Next / Stuck / Keep playing: today's 3 first (in order), then MW_ORDER.
  function playRank(id) { var i = startIds().map(function (o) { return o.g.id; }).indexOf(id); if (i >= 0) return i; i = (window.MW_ORDER || []).indexOf(id); return 10 + (i < 0 ? 99 : i); }
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
      return { cls: "cb-ecg" + (gold ? " gold" : ""), html: '<svg class="cb-line" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 70 L30 70 Q36.5 56 43 70 L56 70 L58 76 L62 15 L66 84 L69 70 L80 70 C90 54 98 52 108 70 L160 70 Q166.5 56 173 70 L186 70 L188 76 L192 15 L196 84 L199 70 L210 70 C220 54 228 52 238 70 L290 70 Q296.5 56 303 70 L316 70 L318 76 L322 15 L326 84 L329 70 L340 70 C350 54 358 52 368 70 L400 70"/></svg><p class="cb-cap">' + (NORMIE ? (gold ? "Got it in " + n + ". Show-off." : "Cracked it in " + n + ".") : (gold ? "Pulse restored in " + n + ". Show-off." : "Pulse restored. Solved in " + n + ".")) + "</p>" };
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
    opacitis: function (st) {
      if (!st.win) return null; var n = (st.picks || []).length, gold = n === 1;
      return { cls: "cb-dx" + (gold ? " gold" : ""), html: '<div class="cb-stamp">REPORT<br>SIGNED</div><p class="cb-cap">' + (gold ? "First look. Lightbox legend." : "Read on try " + n + ".") + "</p>" };
    },
    dactylosis: function (st) {
      if (!st.win) return null; var n = (st.picks || []).length, gold = n === 1;
      return { cls: "cb-dx" + (gold ? " gold" : ""), html: '<div class="cb-stamp">WORD<br>READ</div><p class="cb-cap">' + (gold ? "First try. Fluent fingers." : "Read on try " + n + ".") + "</p>" };
    },
    glimpsis: function (st) {
      if (!st.win) return null; var n = (st.picks || []).length, gold = n === 1;
      return { cls: "cb-dx" + (gold ? " gold" : ""), html: '<div class="cb-stamp">SIGN<br>SPOTTED</div><p class="cb-cap">' + (gold ? "First glance. Eagle eyes." : "Spotted on try " + n + ".") + "</p>" };
    },
    arrhythmix: function (st) {
      if (!st.win) return null; var n = (st.picks || []).length, gold = n === 1;
      return { cls: "cb-ecg" + (gold ? " gold" : ""), html: '<svg class="cb-line" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true"><path d="' + (NORMIE ? "M0 104 L50 96 L90 100 L140 78 L190 84 L240 52 L290 60 L340 24 L400 12" : "M0 70 L30 70 Q36.5 56 43 70 L56 70 L58 76 L62 15 L66 84 L69 70 L80 70 C90 54 98 52 108 70 L160 70 Q166.5 56 173 70 L186 70 L188 76 L192 15 L196 84 L199 70 L210 70 C220 54 228 52 238 70 L290 70 Q296.5 56 303 70 L316 70 L318 76 L322 15 L326 84 L329 70 L340 70 C350 54 358 52 368 70 L400 70") + '"/></svg><p class="cb-cap">' + (NORMIE ? (gold ? "Nailed the trend. First try." : "Nailed the trend on try " + n + ".") : gold ? "Read on the first try. Show-off." : "Rhythm read on try " + n + ".") + "</p>" };
    },
    sudokrine: function (st) {
      if (!st.win) return null; var gold = !st.hints, m = Math.floor((st.t || 0) / 60), sec = ("0" + ((st.t || 0) % 60)).slice(-2), h = "";
      for (var k = 0; k < 9; k++) h += '<i style="animation-delay:' + (k * 0.07).toFixed(2) + 's"></i>';
      var wb = st.wb ? " Word bonus" + (st.w ? ": " + String(st.w).replace(/[^A-Z]/g, "") : "") + "." : "";
      return { cls: "cb-skr" + (gold ? " gold" : ""), html: '<div class="cb-sgrid">' + h + '</div><p class="cb-cap">' + (NORMIE ? (gold ? "Grid complete in " + m + ":" + sec + ". No hints." : "Grid complete in " + m + ":" + sec + ".") : (gold ? "Perfect balance. " + m + ":" + sec + ", no hints." : "Homeostasis restored in " + m + ":" + sec + ".")) + wb + "</p>" };
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
    var o = el('<div class="cb ' + sc.cls + (quiet() ? " still" : "") + '" role="status" aria-live="polite">' + sc.html + '<span class="cb-tap">Tap to skip</span></div>');
    var done = false;
    function bye() { if (done) return; done = true; o.classList.add("out"); setTimeout(function () { o.remove(); busy = false; if (Q.length) show(Q.shift()); }, 260); }
    try { var cap0 = o.querySelector(".cb-cap"), bub0 = o.querySelector(".cb-bub"); if (cap0 && bub0 && cap0.textContent.toLowerCase().indexOf(bub0.textContent.toLowerCase().replace(/[.!]+$/, "")) >= 0) { var M0 = window.MW_MASCOTS || {}, alt = null; Object.keys(M0).forEach(function (k) { var c = M0[k].cheer || []; if (!alt && c.indexOf(bub0.textContent) >= 0) { var opts = c.filter(function (x) { return cap0.textContent.toLowerCase().indexOf(x.toLowerCase().replace(/[.!]+$/, "")) < 0; }); if (opts.length) alt = opts[Math.floor(Math.random() * opts.length)]; } }); if (alt) bub0.textContent = alt; } } catch (e) {}
    o.addEventListener("click", bye); document.body.appendChild(o);
    setTimeout(bye, sc.ms || (quiet() ? 1200 : 1700));
  }
  function queue(sc) { if (!sc) return; if (busy) Q.push(sc); else show(sc); }
  function mascotHelp(g) {
    var m = window.MW_MASCOTS && MW_MASCOTS[g.id]; if (!m) return "";
    return '<div class="mw-masc-help">' + mascImg(g.id, "", 72) + '<div><p><b>Hi, I\u2019m ' + m.name + ',</b> ' + (NORMIE && g.nmode && g.normieMascot ? "on my day off" : m.what) + '. Here\u2019s how ' + g.name + ' works.</p>' + (m.vibe && !(NORMIE && g.nmode && g.normieMascot) ? '<p class="mw-masc-vibe">' + m.vibe + '</p>' : '') + '</div></div>';
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
    if (g && st.win) { var t = sydToday(); if ((!g.weekly && !g.dailyLine || ((g.nmode ? window.MW_EINSTEIN_N : window.MW_EINSTEIN) || {})[g.id] && (((g.nmode ? MW_EINSTEIN_N : MW_EINSTEIN)[g.id]) || []).indexOf(t) >= 0) && diffFor(g, t, new Date(dayNum(t) * 864e5).getUTCDay()) === "Einstein") queue({ cls: "cb-ein", ms: 2200, html: '<svg class="cb-atom" viewBox="-60 -60 120 120" aria-hidden="true"><ellipse rx="52" ry="18"/><ellipse rx="52" ry="18" transform="rotate(60)"/><ellipse rx="52" ry="18" transform="rotate(120)"/><circle r="8" class="nuc"/></svg><p class="cb-cap">Einstein day, solved. Genuinely rare. Frame it.</p>' }); }
  }
  var BADGES = { 3: ["Intern", "\ud83e\ude7a"], 7: ["Registrar", "\ud83e\udd47"], 14: ["Fellow", "\ud83c\udf93"], 30: ["Consultant", "\ud83c\udfc6"], 100: ["Professor", "\ud83d\udc51"] };
  if (NORMIE) BADGES = { 3: ["Regular", "\u2b50"], 7: ["Enthusiast", "\ud83e\udd47"], 14: ["Expert", "\ud83c\udf93"], 30: ["Legend", "\ud83c\udfc6"], 100: ["Grandmaster", "\ud83d\udc51"] };
  function afterLive(g) {
    var t = sydToday(), sk = siteStreak().n, b = BADGES[sk];
    if (b && get(mk("mw-badge-" + sk), "") !== t && !get(mk("mw-badge-" + sk + "-got"), 0)) {
      set(mk("mw-badge-" + sk + "-got"), 1);
      queue({ cls: "cb-badge", ms: 2400, html: '<div class="cb-medal">' + b[1] + '</div><p class="cb-cap">\ud83d\udd25 ' + sk + "-day streak. Promoted to " + b[0] + ".</p>" });
    }
    var daily = (window.MW_GAMES || []).filter(function (x) { return x.live && !x.weekly && x.store && inMode(x); });
    var all = daily.every(function (x) { var s2 = get(x.store.day + t, null); return s2 && s2.done; });
    if (all && get(mk("mw-wrc"), "") !== t) {
      set(mk("mw-wrc"), t);
      queue({ cls: "cb-wrc", ms: 2600, html: confetti(["#4A3480", "#2E7D6B", "#B23A6F", "#B07A0C", "#2F5DA8", "#C2553A", "#1F7A8C"], 60) + '<div class="cb-big">' + (NORMIE ? "Clean<br>sweep" : "Ward round<br>complete") + '</div><p class="cb-cap">All ' + daily.length + " done. Go home. Hydrate.</p>" });
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
    ["cryptic", "🕵️", "Cryptic Crusader", "Finish a Cryptoplexy without giving up."],
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
    ["both", "☯️", "Both Sides", "Finish puzzles in both modes on the same day.", "global"],
    // progressive tiers: [id, icon, name, how, scope, metric, target]
    ["s3", "🔥", "Three in a Row", "Play three days in a row.", "", "streak", 3],
    ["s14", "🗓️", "Fortnight Fanatic", "Play 14 days in a row.", "", "streak", 14],
    ["s60", "🧳", "Two-Month Locum", "Play 60 days in a row.", "", "streak", 60],
    ["s100", "🏅", "Hundred-Day Habit", "Play 100 days in a row.", "", "streak", 100],
    ["s200", "🪪", "Lifer", "Play 200 days in a row.", "", "streak", 200],
    ["s365", "🎖️", "Year on the Wards", "Play every day for a year.", "", "streak", 365],
    ["n10", "✅", "Ten Down", "Solve 10 puzzles.", "", "solved", 10],
    ["n25", "🧩", "Quarter Century", "Solve 25 puzzles.", "", "solved", 25],
    ["n50", "🎯", "Half-Century", "Solve 50 puzzles.", "", "solved", 50],
    ["n250", "🏆", "Two-Fifty Club", "Solve 250 puzzles.", "", "solved", 250],
    ["n500", "🌟", "Five Hundred Club", "Solve 500 puzzles.", "", "solved", 500],
    ["n1000", "👑", "Thousand Cases", "Solve 1,000 puzzles. Seek sunlight.", "", "solved", 1000],
    ["d10", "🪑", "Regular", "Play on 10 different days.", "", "days", 10],
    ["d50", "✈️", "Frequent Flyer", "Play on 50 different days.", "", "days", 50],
    ["d100", "🛋️", "Part of the Furniture", "Play on 100 different days.", "", "days", 100],
    ["d365", "🏛️", "Senior Partner", "Play on 365 different days.", "", "days", 365],
    ["e3", "🧠", "Triple Einstein", "Solve three Einstein-day puzzles.", "", "einstein", 3],
    ["e10", "🥇", "Nobel Shortlist", "Solve ten Einstein-day puzzles.", "", "einstein", 10],
    ["w5", "🏥", "Ward Regular", "Finish every daily game in a day, five times.", "", "fullward", 5],
    ["w25", "🦸", "Ward Boss", "Finish every daily game in a day, 25 times.", "", "fullward", 25],
    ["t5", "👖", "Smarty Pants", "Score a perfect 10 in Triviosis five times.", "", "perfect", 5],
    ["t20", "📚", "Walking Textbook", "Score a perfect 10 in Triviosis 20 times.", "", "perfect", 20],
    ["gr20", "🎓", "Grand Master", "Score 20 out of 20 in Grand Rounds.", "", "gr20", 1],
    ["allg", "🧭", "True Generalist", "Play every daily game at least once.", "", "allgames", 1],
    ["bull", "🎯", "Bullseye", "Solve Wordemic in one guess. Suspicious, but impressive.", "", "bull", 1],
    ["long", "📏", "Long Haul", "Solve a Long Friday (8-letter) Wordemic.", "", "long", 1],
    ["long10", "🦒", "Long Legs", "Solve ten Long Friday Wordemics.", "", "long", 10],
    ["cat1", "🐈", "Blanket Biter", "Score 10,000 in Basil + Clover.", "global", "basil", 10000],
    ["cat2", "🛋️", "Bench Legend", "Beat all ten rounds of Basil + Clover.", "global", "basilwon", 1],
    ["od1", "🧤", "Scrubbed In", "Play a game of Stackulus.", "global", "odgames", 1],
    ["od2", "🥼", "Chief Surgeon", "Clear 50 lines in one game of Stackulus.", "global", "odlines", 50],
    ["od3", "🫀", "Transplant Team", "Clear four lines at once in Stackulus.", "global", "odquad", 1],
    ["od4", "🎭", "Theatre Legend", "Score 20,000 in Stackulus.", "global", "odbest", 20000],
    ["od5", "📋", "Daily Rounds", "Finish a Stackulus daily challenge.", "global", "oddaily", 1]
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
      var dk2 = today; if (base.weekly) { var ws0 = N && g.normie && g.normie.weekStart != null ? g.normie.weekStart : base.weekStart; dk2 = dstr(tn - relBack(tn, ws0)); }
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
    function cnt(id, f) { var R = rec[id] || {}; return Object.keys(R).filter(function (d) { return f(R[d], d); }).length; }
    var einN = get(P + "mw-einstein", []).length; Object.keys(EINS).forEach(function (id) { (EINS[id] || []).forEach(function (d) { if (rec[id] && rec[id][d] && rec[id][d].win) einN++; }); });
    var wardN = daily.length ? Object.keys(dayG).filter(function (d) { return daily.every(function (id) { return (dfrom[id] && d < dfrom[id]) || (rec[id] && rec[id][d]); }); }).length : 0;
    var od = get("mw-organdrop-stats", {}) || {}; // Organ Drop: { games, lines (most in one game), quad (four-line clears), best, daily (scored dailies finished) }
    var M = {
      streak: Math.max(best, cur), solved: solved, days: dl.length, einstein: einN, fullward: Math.max(wardN, get(P + "mw-wrc", "") ? 1 : 0),
      perfect: cnt("triviosis", function (v) { return v.score === 10; }),
      gr20: cnt("grandrounds", function (v) { return (v.sa || 0) >= 20; }),
      allgames: daily.length && daily.every(function (id) { return rows.some(function (r) { return r.g.id === id && r.played; }); }) ? 1 : 0,
      bull: cnt("wordemic", function (v) { return v.win && (v.guesses || []).length === 1; }),
      long: cnt("wordemic", function (v) { return v.win && ((v.guesses || [])[0] || "").length === 8; }),
      basil: get("mw-basil-best2", 0) || 0, basilwon: get("mw-basil-won", 0) ? 1 : 0,
      odgames: od.games || 0, odlines: od.lines || 0, odquad: od.quad || 0, odbest: od.best || 0, oddaily: od.daily || 0
    };
    var NORMIE_BADGE = { od1: ["\ud83d\udc1a", "Dipped a Toe"], od2: ["\u2693", "Deckhand"], od3: ["\ud83c\udf0a", "Tidal Wave"], od4: ["\ud83d\udc0b", "Deep-Sea Legend"], od5: ["\ud83e\udded", "Daily Voyage"] };
    var badges = BADGE_DEFS.filter(function (b) { return !(b[4] === "medical" && N); }).map(function (b) {
      var got = b[5] ? (M[b[5]] || 0) >= b[6] : !!T[b[0]], prog = b[5] && !got && b[6] > 1 ? Math.min(M[b[5]] || 0, b[6]).toLocaleString("en-AU") + " of " + b[6].toLocaleString("en-AU") : "";
      var nb = N && NORMIE_BADGE[b[0]];
      return { id: b[0], icon: nb ? nb[0] : b[1], name: nb ? nb[1] : b[2], how: b[3], global: b[4] === "global", got: got, prog: prog, metric: b[5] || "" };
    });
    var nextShown = {}; badges.forEach(function (b) { if (!b.metric || b.got) return; if (nextShown[b.metric]) b.later = true; else nextShown[b.metric] = 1; }); // only the next tier of each ladder shows
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
      if (pre && window.HTMLCanvasElement && window.Blob) {
        var pb = document.createElement("button"); pb.type = "button"; pb.className = b.className.replace(/\bsolid\b/, "") + " mw-pic"; var canPic = false; try { canPic = !!(navigator.canShare && navigator.canShare({ files: [new File([""], "a.png", { type: "image/png" })] })); } catch (e) {} pb.textContent = canPic ? "Share picture" : "Save picture";
        pb.onclick = function () { picShare(pre, pb); try { localStorage.setItem("mw-picnudge", "done"); } catch (e) {} var nn = document.querySelector(".mw-picnudge"); if (nn) nn.remove(); };
        b.parentNode.appendChild(pb);
        // one gentle nudge, on the player's 3rd finished game (and again on the 10th if they still haven't tried it)
        var nudge = function () { try {
          var seen = +(localStorage.getItem("mw-results-n") || 0) + 1, nd = localStorage.getItem("mw-picnudge");
          localStorage.setItem("mw-results-n", String(seen));
          if (nd !== "done" && (seen === 3 || seen === 10)) {
            var nu = document.createElement("p"); nu.className = "mw-picnudge"; nu.innerHTML = "📸 <b>Nice run.</b> Share it as a picture: it looks great on X, Instagram and the group chat.";
            b.parentNode.parentNode.insertBefore(nu, b.parentNode); pb.classList.add("mw-pic-hi");
          }
        } catch (e) {} };
        // count a finished game only when its share buttons are actually on screen (some games build the result panel early, hidden)
        if (window.IntersectionObserver) { var io = new IntersectionObserver(function (en) { if (en.some(function (x) { return x.isIntersecting; })) { io.disconnect(); nudge(); } }); io.observe(pb); }
      }
      if (!pre || !navigator.share) { if (/^Copy/.test(b.textContent)) b.textContent = "Share result"; return; }
      var sb = document.createElement("button"); sb.type = "button"; sb.className = b.className + " mw-share"; sb.textContent = "Share"; b.hidden = true;
      sb.onclick = function () { navigator.share({ text: pre.textContent.replace(/\s*(?:https?:\/\/)?(?:www\.)?maladywise\.com(\/\S*)?\s*$/, ""), url: shareURL() }).catch(function () {}); };
      b.parentNode.insertBefore(sb, b.nextSibling);
    });
  }

  // ---------- picture share: draw the result ticket as a 1080x1350 PNG (fits X and Instagram), then share or save it ----------
  function picShare(pre, btn) {
    var tk = pre.previousElementSibling && pre.previousElementSibling._d ? pre.previousElementSibling : null;
    var d = tk ? tk._d : { title: document.title.split("|")[0].trim(), pill: "", big: "", ems: [], lines: pre.textContent.split("\n").slice(0, 6), acc: "#4A3480", url: "" };
    var old = btn.textContent; btn.textContent = "Making picture…"; btn.disabled = true;
    var fontsOk = document.fonts && document.fonts.load ? Promise.all([document.fonts.load("700 80px Lora"), document.fonts.load("600 40px Poppins")]).catch(function () {}) : Promise.resolve();
    fontsOk.then(function () {
      var W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H; var x = c.getContext("2d");
      var acc = d.acc || "#4A3480", ink = "#2B2340", mut = "#6B6280", EM = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
      x.fillStyle = "#F4EFE6"; x.fillRect(0, 0, W, H);
      x.fillStyle = acc; x.globalAlpha = .12; x.beginPath(); x.arc(W - 60, 110, 260, 0, Math.PI * 2); x.fill(); x.beginPath(); x.arc(80, H - 80, 200, 0, Math.PI * 2); x.fill(); x.globalAlpha = 1;
      function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
      x.shadowColor = "rgba(43,35,64,.18)"; x.shadowBlur = 40; x.shadowOffsetY = 12; x.fillStyle = "#FFFFFF"; rr(70, 150, W - 140, H - 300, 44); x.fill(); x.shadowColor = "transparent";
      x.save(); rr(70, 150, W - 140, H - 300, 44); x.clip(); x.fillStyle = acc; x.fillRect(70, 150, W - 140, 22); x.restore();
      x.textAlign = "center"; x.fillStyle = mut; x.font = "600 30px Poppins,system-ui,sans-serif"; x.fillText("M A L A D Y   W I S E", W / 2, 105);
      function fit(t, f, max) { var s = f; x.font = s; while (x.measureText(t).width > max && /\d+px/.test(s)) { s = s.replace(/(\d+)px/, function (m, n) { return (n - 2) + "px"; }); x.font = s; } }
      // lay out title, theme pill, emoji rows and text lines as one block, centred in the card
      var items = [{ k: "t", t: d.title, f: "700 88px Lora,Georgia,serif", h: 100 }];
      if (d.pill) items.push({ k: "p", t: d.pill, f: "600 34px Poppins,system-ui,sans-serif", h: 90 });
      var ems = (d.big ? [d.big] : []).concat(d.ems || []), body = (d.lines || []).slice(0, 4);
      var es = ems.length <= 2 ? 120 : ems.length <= 4 ? 96 : Math.max(48, Math.floor(560 / ems.length) - 8);
      if (ems.length) items.push({ k: "gap", h: 30 });
      ems.forEach(function (ln) { items.push({ k: "e", t: ln, f: es + "px " + EM, h: es + 18 }); });
      if (body.length) items.push({ k: "gap", h: 26 });
      body.forEach(function (ln, i) { items.push({ k: "b", t: ln, f: i ? "500 36px Poppins,system-ui,sans-serif" : "700 50px Poppins,system-ui,sans-serif", h: i ? 56 : 70 }); });
      var tot = items.reduce(function (a, it) { return a + it.h; }, 0), top = 172, bot = H - 280;
      var y = top + Math.max(30, (bot - top - tot) / 2);
      items.forEach(function (it) {
        if (it.k === "gap") { y += it.h; return; }
        y += it.h; var base = y - (it.k === "p" ? 26 : it.k === "e" ? 14 : 18);
        fit(it.t, it.f, W - 240);
        if (it.k === "p") { var pw = x.measureText(it.t).width + 60; x.fillStyle = acc; x.globalAlpha = .14; rr(W / 2 - pw / 2, base - 44, pw, 62, 31); x.fill(); x.globalAlpha = 1; x.fillStyle = acc; }
        else x.fillStyle = ink;
        x.fillText(it.t, W / 2, base);
      });
      var path = (d.url || shareURL()).replace(/^https?:\/\//, "").replace(/\?.*$/, "").replace(/\/$/, ""), cta = "Play free: " + path;
      fit(cta, "600 36px Poppins,system-ui,sans-serif", 640); var cw = Math.min(W - 200, x.measureText(cta).width + 90);
      x.fillStyle = acc; rr(W / 2 - cw / 2, H - 252, cw, 80, 40); x.fill(); x.fillStyle = "#FFFFFF"; x.fillText(cta, W / 2, H - 199);
      x.fillStyle = mut; x.font = "500 26px Poppins,system-ui,sans-serif"; x.fillText("Free daily medical puzzles", W / 2, H - 60);
      var gm = window.MW_curGame, mid = gm && gm.id, mi = new Image(), done1 = false;
      function finish() { if (done1) return; done1 = true; c.toBlob(after, "image/png"); }
      if (mid) { mi.onload = function () { try { x.drawImage(mi, W - 300, H - 470, 210, 210); } catch (e) {} finish(); }; mi.onerror = finish; mi.src = (NORMIE && gm.normieMascot ? "/assets/mascots/normie/" : "/assets/mascots/") + mid + ".svg"; setTimeout(finish, 2500); } else finish();
      function after(blob) {
        btn.textContent = old; btn.disabled = false; if (!blob) return;
        var g = window.MW_curGame, name = ((g && g.id) || "malady-wise") + "-result.png", file = null;
        try { file = new File([blob], name, { type: "image/png" }); } catch (e) {}
        var text = pre.textContent.replace(/\s*(?:https?:\/\/)?(?:www\.)?maladywise\.com(\/\S*)?\s*$/, "");
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], text: text + "\n" + shareURL() }).catch(function () {}); track("sharepic/" + shareGame(), "Share picture " + shareGame()); return; }
        var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        btn.textContent = "Saved ✓"; setTimeout(function () { btn.textContent = old; }, 2000); track("sharepic/" + shareGame(), "Save picture " + shareGame());
      }
    });
  }
  // ---------- share "ticket" card built from each game's share text ----------
  function ticketify() {
    Array.prototype.forEach.call(document.querySelectorAll('pre[id$="-share"]:not([data-tk]),pre[id$="-sharetext"]:not([data-tk])'), function (pre) {
      pre.setAttribute("data-tk", "1");
      var fx = fixShare(pre.textContent); if (fx !== pre.textContent) pre.textContent = fx;
      var lines = pre.textContent.replace(/\s+$/, "").split("\n"), url = "";
      if (/maladywise\.com(\/\S*)?\s*$/i.test(lines[lines.length - 1])) { url = lines.pop(); }
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
      tk._d = { title: title, pill: pill, big: big0, ems: ems.slice(), lines: lines.map(function (l) { return l.trim(); }).filter(function (l) { return l && /[A-Za-z0-9]/.test(l); }).map(function (l) { var m = l.match(/^([^A-Za-z0-9\u201c"]+?)\s+([A-Za-z0-9].*)$/); return m ? m[2] : l; }).concat(sc0 ? [sc0] : []), acc: acc, url: url };
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
  // Home subtitle under the site line: keep each under ~38 characters so it fits one line on a 390px phone.
  var DAYQ = [
    "Genius day. Strong coffee advised.",
    "Easy start. The waiting room is full.",
    "Still easy. Enjoy it while it lasts.",
    "Hump day. The cases get cheekier.",
    "Medium. Pay attention, doctor.",
    "Hard mode. No phoning it in.",
    "Hard again. No locum to save you."
  ];
  var DAYQ_N = [
    "Genius day. Strong coffee advised.",
    "Easy start. Nobody\u2019s judging. Yet.",
    "Still easy. Enjoy it while it lasts.",
    "Hump day. The puzzles get cheekier.",
    "Medium. Pay attention.",
    "Hard mode. No phoning it in.",
    "Hard again. No excuses."
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
      '<a class="mw-melink" href="/me/">\ud83c\udfc5 My stats, streaks and badges \u203a</a>' +
      '<button type="button" class="mw-melink mw-fbbtn">\u26a0\ufe0f Report a problem with this page \u203a</button>');
    s.querySelector(".mw-fbbtn").onclick = function () { s.remove(); feedback("puzzle"); };
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
    var key = sydToday(); if (g.store.weekly) { var n = dayNum(key); key = new Date((n - relBack(n, g.store.weekStart)) * 864e5).toISOString().slice(0, 10); }
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
    '<input type="hidden" name="embed" value="1"><button type="submit">Subscribe</button>' +
    '</form><p class="nl-msg" aria-live="polite"></p></section>';
  document.addEventListener("submit", function (e) {
    var f = e.target; if (!f.classList || !f.classList.contains("mw-nl") || !window.fetch) return;
    e.preventDefault();
    track("subscribe/" + pageSlug(), "Zebra Mail subscribe: " + pageSlug());
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

  // ---------- top menu (MW_HOME.nav in site.js): links and dropdown groups ----------
  // Specialists directory is Newcastle/Hunter only: show the link to NSW/ACT time zone (closest a browser can tell without asking for location)
  function inLocal() { try { return (Intl.DateTimeFormat().resolvedOptions().timeZone || "") === "Australia/Sydney"; } catch (e) { return false; } }
  function inAU() { try { if (/^Australia\//.test(Intl.DateTimeFormat().resolvedOptions().timeZone || "")) return true; } catch (e) {} return /-AU$/i.test(navigator.language || ""); }
  function navHere(href) {
    var p = location.pathname.replace(/index\.html$/, "");
    if (href === "/") return p === "/" || /^\/(arcade|weird|basil|basil-clover|organ-drop|dropsy|stackulus|mergeon|me)\//.test(p);
    if (p.indexOf(href) === 0) return true;
    var F = window.MW_FACTS && MW_FACTS[p]; // condition fact sheets live at the root, e.g. /acne/
    return !!(F && F.k === "fact" && href === "/conditions/");
  }
  function navHTML() {
    var n = 0;
    return MW_HOME.nav.map(function (it) { // same menu in Medical and Normie
      if (!it.items) return '<a class="navlink' + (navHere(it.href) ? " on" : "") + '" href="' + it.href + '"' + (navHere(it.href) ? ' aria-current="page"' : "") + ">" + it.t + "</a>";
      var sub = it.items.filter(function (x) { return !(x.au && !inLocal()); }), on = sub.some(function (x) { return navHere(x.href); }), id = "mw-dd" + (n++);
      return '<div class="nav-dd' + (on ? " on" : "") + '"><button type="button" class="navlink nav-btn' + (on ? " on" : "") + '" aria-expanded="false" aria-controls="' + id + '">' + it.t +
        '<svg class="nav-car" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        '<div class="nav-sub" id="' + id + '" role="group" aria-label="' + it.t + '">' + sub.map(function (x) { var h = navHere(x.href); return '<a href="' + x.href + '"' + (h ? ' class="on" aria-current="page"' : "") + "><b>" + x.t + "</b>" + (x.d ? "<span>" + x.d + "</span>" : "") + "</a>"; }).join("") + "</div></div>";
    }).join("");
  }
  // Dropdowns: hover (desktop pointer), click/tap, keyboard (Enter/Space/ArrowDown open, Escape closes). In the phone menu they show as grouped lists.
  function navWire(bar) {
    var nav = bar.querySelector("#mw-nav"); if (!nav) return;
    var burger = bar.querySelector(".burger");
    function phone() { return burger && getComputedStyle(burger).display !== "none"; }
    function setOpen(dd, op) { if (!dd) return; dd.classList.toggle("open", op); dd.querySelector(".nav-btn").setAttribute("aria-expanded", op ? "true" : "false"); }
    function closeAll(except) { Array.prototype.forEach.call(nav.querySelectorAll(".nav-dd"), function (d) { if (d !== except) setOpen(d, false); }); }
    Array.prototype.forEach.call(nav.querySelectorAll(".nav-dd"), function (dd) {
      var btn = dd.querySelector(".nav-btn"), t = null;
      dd.addEventListener("mouseenter", function () { if (phone() || !(window.matchMedia && matchMedia("(hover: hover)").matches)) return; clearTimeout(t); if (!dd.classList.contains("open")) dd._ht = Date.now(); closeAll(dd); setOpen(dd, true); });
      dd.addEventListener("mouseleave", function () { if (phone()) return; clearTimeout(t); t = setTimeout(function () { setOpen(dd, false); }, 180); });
      btn.addEventListener("click", function (e) { e.preventDefault(); if (phone()) return; var op = !dd.classList.contains("open") || Date.now() - (dd._ht || 0) < 400; closeAll(dd); setOpen(dd, op); });
      dd.addEventListener("keydown", function (e) {
        var links = Array.prototype.slice.call(dd.querySelectorAll(".nav-sub a")), i = links.indexOf(document.activeElement);
        if (e.key === "Escape" && dd.classList.contains("open")) { setOpen(dd, false); btn.focus(); e.preventDefault(); }
        else if (e.key === "ArrowDown" && !phone()) { e.preventDefault(); if (!dd.classList.contains("open")) { closeAll(dd); setOpen(dd, true); } (links[i + 1] || links[0]).focus(); }
        else if (e.key === "ArrowUp" && i >= 0 && !phone()) { e.preventDefault(); if (i === 0) btn.focus(); else links[i - 1].focus(); }
      });
      dd.addEventListener("focusout", function (e) { if (!dd.contains(e.relatedTarget)) setOpen(dd, false); });
    });
    document.addEventListener("click", function (e) { if (!e.target.closest || !e.target.closest(".nav-dd")) closeAll(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); burger.focus(); } });
  }

  // ---------- top bar ----------
  function topBar(g, home) {
    var ARC = !g && /^\/(stackulus|mergeon|basil-clover)\//.test(location.pathname); // arcade games get the same back-arrow bar as the daily games
    var sub = window.MW_HOME ? "" : "<span>" + MW_SITE.sub + "</span>";
    var bar = el('<header class="bar"><div class="bar-in">' +
      (g || ARC ? '<a class="back" href="' + (g ? "../" : "/") + '" aria-label="Back to ' + MW_SITE.name + '">' + I.back + '<span class="back-t">' + MW_SITE.name + "</span>" + season() + "</a>" : '<a class="logo" href="' + (home || "./") + '">' + MW_SITE.name + season() + sub + "</a>") +
      '<nav class="tools" aria-label="Tools">' + modeSwitch() +
      (!g && window.MW_HOME ? '<div class="navwrap" id="mw-nav">' + navHTML() +
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
      if (a === "menu") { var nv = document.getElementById("mw-nav"), op = nv.classList.toggle("open"); b.setAttribute("aria-expanded", op ? "true" : "false"); Array.prototype.forEach.call(nv.querySelectorAll(".nav-btn"), function (x) { x.setAttribute("aria-expanded", op ? "true" : "false"); }); }
      if (a === "sub") { var t = document.getElementById("newsletter"); if (t) { e.preventDefault(); var nv2 = document.getElementById("mw-nav"); if (nv2) nv2.classList.remove("open"); t.scrollIntoView({ behavior: "smooth", block: "center" }); var inp = t.querySelector("input[type=email]"); if (inp) setTimeout(function () { inp.focus({ preventScroll: true }); }, 400); } else { e.preventDefault(); location.href = "/#newsletter"; } }
      if (a === "settings") settings();
      if (a === "stats") statsModal(g);
      if (a === "help") modal("How to play", mascotHelp(g) + "<ol>" + (g.help || []).map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol>" + (g.helpQuip ? '<p style="margin:0;color:var(--muted)">' + g.helpQuip + "</p>" : ""));
      if (a === "archive") { if (window.MW_openArchive) window.MW_openArchive(); }
    });
    document.body.insertBefore(bar, document.body.firstChild);
    root.removeAttribute("data-pre"); // headkit's inline theme script reserves the bar's space until now
    navWire(bar);
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
  function wotw() { var a = document.getElementById("mw-wotw"); if (!a || !window.fetch) return;
    fetch("/words/current.json").then(function (r) { return r.json(); }).then(function (w) { a.href = "/words/#" + w.slug; a.innerHTML = '<span>\ud83d\udcd6 Word of the week</span><b></b><i></i>'; a.querySelector("b").textContent = w.word; a.querySelector("i").textContent = "literally \u2018" + w.literal + "\u2019 \u2192"; a.hidden = false; }).catch(function () {}); }
  var BAND2 = !/[?&]bandmasc=0/.test(location.search); // game symbol + mascot side by side on cards (?bandmasc=0 to compare without)
  function hub() { setTimeout(social, 0); setTimeout(function () { try { liveShow(); } catch (e) {} }, 50); 
    topBar(null);
    var today = sydToday(), dow = new Date(dayNum(today) * 864e5).getUTCDay();
    var main = document.getElementById("hub");
    function card(g) {
      var st = g.live ? readStats(g) : null;
      var status = !st ? "" : st.done ? (st.win ? "Solved. Smug. " : "Done. Humbled. ") + (st.s.streak ? "&middot; Streak <b>&#128293; " + st.s.streak + "</b>" : "") : st.s.streak ? "Streak <b>&#128293; " + st.s.streak + "</b>" : "";
      var btn = !g.live ? (g.from ? "From " + nice(g.from, { weekday: "short", day: "numeric", month: "short" }) : SOON[(MW_GAMES.indexOf(g) + dayNum(today)) % SOON.length]) : st && st.done ? "Review" : "Play";
      var tag = g.live ? "a" : "div", med = false; // medical-only games are filtered out of Normie mode entirely
      return "<" + tag + ' class="card' + (g.live ? "" : " soon") + (med ? " medonly" : "") + (g.featured ? " feature" : "") + (st && st.done ? " done" : "") + '" data-g="' + g.id + '" style="--accent:' + accentOf(g) + '"' + (g.live ? ' href="' + g.path + '"' : "") + ">" +
        '<div class="band' + (BAND2 && window.MW_MASCOTS && MW_MASCOTS[g.id] ? " band2" : "") + '">' + (BAND2 && window.MW_MASCOTS && MW_MASCOTS[g.id] ? '<span class="b2i">' + g.icon + "</span>" + mascImg(g.id, "", 64, "band-masc") : st && st.done && window.MW_MASCOTS && MW_MASCOTS[g.id] ? mascImg(g.id, "", 64, "band-masc") : g.icon) + (st && st.done ? '<span class="tick" aria-label="Done today">\u2713</span>' : "") + "</div>" +
        '<div class="cbody">' +
        '<h2 class="name">' + g.name + "</h2>" + (med ? '<span class="mw-medtag">\ud83e\ude7a Medical only</span>' : g.nmode ? '<span class="mw-npill">\ud83d\ude42 Normie</span>' : "") + (!g.weekly && !g.dailyLine && diffFor(g, today, dow) === "Einstein" && g.live ? '<span class="pill ein einc">' + EIN + " Einstein day</span>" : "") + (g.kind ? '<p class="kind">' + g.kind + "</p>" : "") + (g.weekly ? '<span class="pillrow">' + (g.relday && g.relday.indexOf("&") > 0 ? "" : '<span class="pill wk">Weekly</span>') + (g.relday ? '<span class="pill wk day">' + g.relday + "</span>" : "") + "</span>" : "") + (g.special && g.live && g.special.dow === dow && !(g.special.from && today < g.special.from) ? '<span class="pill wk sup">' + g.special.short + "</span>" : "") + '<p class="tag">' + g.tagline + "</p>" +
        '<div class="cfoot"><span class="play">' + btn + '</span><span class="status">' + status + "</span></div>" + "</div></" + tag + ">";
    }
    // Start here: today's 3 (MW_START in games.js), topped up from MW_ORDER if one is missing in this mode.
    function startList() { return startIds(); }
    function homeTop() {
      var H = window.MW_HOME || {}, line = (NORMIE ? H.taglineN : H.tagline) || (NORMIE ? "Free daily puzzles. No medicine required." : "Free daily medical puzzles, made by a GP.");
      return '<section class="mw-top" id="puzzles"><div class="mt-meta"><span class="mt-day">' + nice(today, { weekday: "long", day: "numeric", month: "short" }) + '</span><span class="pill daypill d-' + DIFF[dow] + '">' + DIFF[dow] + '</span><span class="nextin">New in <b id="mw-count">' + countdown() + '</b></span><span class="mw-live" hidden></span></div>' +
        '<div class="mt-head"><h1>' + line + "</h1>" + (NORMIE ? normImg("mt-norm", 52) : '<a class="mt-cats" href="/basil-clover/" aria-label="Basil + Clover arcade game"><img src="/assets/mascots/basil.svg?v=2" alt="" width="54" height="70"><img src="/assets/mascots/clover.svg?v=1" alt="" width="52" height="68"></a>') + "</div>" +
        '<p class="mt-sub">' + (NORMIE ? DAYQ_N : DAYQ)[dow] + "</p>" +
        (function () { var t = get(mk("mw-einstein"), []); return t.length ? '<p class="trophy">' + EIN + " Einstein badges: <b>" + t.length + "</b>. Genuinely rare. Frame them.</p>" : ""; })() + "</section>";
    }
    function todays3(list) {
      if (!list.length) return "";
      var done = list.filter(function (o) { var st = readStats(o.g); return st && st.done; }).length, mins = list.reduce(function (a, o) { return a + o.min; }, 0);
      return '<section class="t3s" aria-labelledby="t3h"><div class="t3-head"><h2 id="t3h">Start here: today’s ' + list.length + "</h2><span>" + (done === list.length ? "All " + list.length + " done. Smug." : done ? done + " of " + list.length + " done" : "About " + mins + " minutes") + '</span></div><div class="t3-row">' +
        list.map(function (o, i) {
          var g = o.g, st = readStats(g), dn = st && st.done, ein = !g.dailyLine && diffFor(g, today, dow) === "Einstein", sp = g.special && g.special.dow === dow && !(g.special.from && today < g.special.from);
          return '<a class="t3' + (dn ? " done" : "") + '" data-g="' + g.id + '" href="' + g.path + '" style="--accent:' + accentOf(g) + '">' +
            '<span class="t3-ic">' + (dn && window.MW_MASCOTS && MW_MASCOTS[g.id] ? mascImg(g.id, "", 40, "band-masc") : g.icon) + (dn ? '<span class="tick" aria-label="Done today">✓</span>' : '<span class="t3-n" aria-hidden="true">' + (i + 1) + "</span>") + "</span>" +
            '<span class="t3-tx"><b>' + g.name + (ein ? ' <i class="t3-ein" title="Einstein day">' + EIN + "</i>" : "") + "</b><small>" + (sp ? g.special.short : g.kind) + "</small></span>" +
            '<span class="t3-go">' + (dn ? (st.win ? "Solved" : "Done") : "~" + o.min + " min") + "</span></a>";
        }).join("") + "</div></section>";
    }

    function homeBottom() {
      var H = window.MW_HOME; if (!H) return "";
      return H.sections.map(function (sec) {
        return '<section class="sec" id="' + sec.id + '"><div class="sec-head"><h2>' + sec.title + "</h2>" + (sec.note ? "<span>" + sec.note + "</span>" : "") + '</div><div class="sgrid">' +
          sec.items.map(function (it) { return '<a class="scard" href="' + it.href + '"><span class="stag">' + it.tag + "</span><b>" + it.title + "</b><p>" + it.text + "</p></a>"; }).join("") + "</div></section>";
      }).join("");
    }
function arcadeCards() { // the three arcade games, one card each (own "Arcade" row on the home grid)
      var dk = root.getAttribute("data-theme") === "dark";
      return ARCADE.map(function (a) {
        var m = a[0] === "basil-clover" ? '<span class="arc-m2"><img src="/assets/mascots/basil.svg?v=2" alt="" width="46" height="60"><img src="/assets/mascots/clover.svg?v=1" alt="" width="44" height="58"></span>' : '<img class="band-masc" src="/assets/mascots/' + a[0] + '.svg?v=1" alt="" width="64" height="64" decoding="async">';
        return '<a class="card house bonus arc" data-g="' + a[0] + '" href="/' + a[0] + '/" style="--accent:' + (dk ? a[5] : a[4]) + '"><div class="band">' + m + '</div><div class="cbody"><h2 class="name">' + a[1] + '</h2><p class="kind">Bonus arcade game</p><p class="tag">' + a[3] + '</p><div class="cfoot"><span class="play">Play</span></div></div></a>';
      }).join("");
    }
    function bonusCard() {
      return '<a class="card house bonus" href="/basil-clover/" style="--accent:' + (root.getAttribute("data-theme") === "dark" ? "#8EB8E8" : "#2B5E80") + '"><div class="band"><span style="display:inline-flex;align-items:flex-end;gap:0"><img src="/assets/mascots/basil.svg?v=2" alt="" width="38" height="50" style="width:38px;height:50px;object-fit:contain"><img src="/assets/mascots/clover.svg?v=1" alt="" width="36" height="47" style="width:36px;height:47px;object-fit:contain;margin-left:-5px"></span></div><div class="cbody"><h2 class="name">Basil + Clover</h2><p class="kind">Bonus arcade game</p><p class="tag">Basil kicks. Clover eats. Nothing is safe.</p><div class="cfoot"><span class="play">Play</span></div></div></a>';
    }
    // Health self-checks, near the top of the home page (Medical mode only).
    function healthLinks() {
      return ""; // paused: health check stays in Tools only (beta)
      if (NORMIE) return "";
      return '<nav class="mw-hc" aria-label="Health checks"><a class="mw-hc-main" href="/tools/health-check/"><span><small>What health checks do I need?</small><b>Health check by age</b></span><i aria-hidden="true">\u2192</i></a>' +
        '<a href="/mental-health-check/"><span><small>How are you going?</small><b>Mental health check</b></span><i aria-hidden="true">\u2192</i></a></nav>';
    }
    // Non-game links: a slim strip under the game sections.
    function house() {
      var h = MW_SITE.house, dk = root.getAttribute("data-theme") === "dark";
      var nf = window.MW_FACTS ? Object.keys(MW_FACTS).filter(function (k) { return MW_FACTS[k].k === "fact"; }).length : 0;
      function it(href, ext, acc, svg, b, sm) { return '<a href="' + href + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ' style="--accent:' + acc + '"><span class="ms-ic"><svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + svg + "</svg></span><span><b>" + b + "</b><small>" + sm + '</small></span><span class="ms-go" aria-hidden="true">›</span></a>'; }
      return '<nav class="mw-strip" aria-label="More from Malady Wise">' +
        (NORMIE ? "" : it("/conditions/", 0, dk ? "#6FB7A8" : "#2E7D6B", '<path d="M14 6h16l8 8v28H14z"/><path d="M30 6v8h8M20 24h12M20 31h12"/>', "Health guides", (nf ? nf + " " : "") + "fact sheets, plus medicines")) +
        (h ? it(h.href, 1, dk ? h.accentDark : h.accent, '<path d="M8 20v8h6l14 9V11L14 20H8z"/><path d="M34 18a8 8 0 0 1 0 12M38 13a14 14 0 0 1 0 22"/>', h.name, "@MaladyWise on X") : "") +
        it("https://ko-fi.com/maladywise", 1, dk ? "#D9A066" : "#A8642A", '<path d="M8 18h26v10a10 10 0 0 1-10 10h-6A10 10 0 0 1 8 28z"/><path d="M34 20h3a5 5 0 0 1 0 10h-3M16 6c0 3 2 3 2 6M24 6c0 3 2 3 2 6"/>', "Buy me a coffee", "Free, no ads. Coffee helps.") + "</nav>";
    }
    // Game sections (MW_HOME.groups). Games not in any group land in "More puzzles" so nothing goes missing.
    var GROUPS = (window.MW_HOME && MW_HOME.groups) || [];
    function sections(skip) {
      var all = order().filter(function (g) { return skip.indexOf(g.id) < 0; }), used = {};
      var html = GROUPS.map(function (G) {
        var cards = all.filter(function (g) { return G.games && G.games.indexOf(g.id) >= 0; });
        cards.forEach(function (g) { used[g.id] = 1; });
        var extra = G.arcade ? arcadeCards() : "";
        if (!cards.length && !extra) return "";
        var cnt = cards.length + (extra ? ARCADE.length : 0);
        return '<section class="gsec' + (cnt <= 2 ? " sm" : "") + '" data-c="' + cnt + '" style="--n:' + (cnt <= 6 ? Math.max(3, cnt) : Math.ceil(cnt / 2)) + '" id="g-' + G.id + '"><div class="gsec-h"><h2>' + (NORMIE && G.tn ? G.tn : G.t) + "</h2><span>" + (NORMIE && G.dn ? G.dn : G.d || "") + '</span></div><div class="grid">' + cards.map(card).join("") + extra + "</div></section>";
      }).join("");
      var left = all.filter(function (g) { return !used[g.id]; });
      if (left.length) html += '<section class="gsec" id="g-more"><div class="gsec-h"><h2>More puzzles</h2><span>Fresh off the ward.</span></div><div class="grid">' + left.map(card).join("") + "</div></section>";
      // desktop layout: small sections (1-2 games) share a row; spans set so a row is always filled
      var sm = (html.match(/class="gsec sm"/g) || []).length, k = 0;
      html = html.replace(/class="gsec sm"/g, function () { var i = k++, full = sm - sm % 3, rest = sm % 3, span = i < full ? 2 : rest === 1 ? (sm === 1 ? 6 : 3) : 3; if (rest === 1 && sm > 1 && i >= full - 3) span = 3; return 'class="gsec sm" data-span="' + span + '"'; });
      return '<div class="gsecs">' + html + "</div>";
    }

    // Compact game tiles (new home layout): mascot, name, short kind, small tag. Today's 3 are skipped.
    function shortDay(r) { return r.split(/\s*&\s*/).map(function (x) { return x.slice(0, 3); }).join(" + "); }
    function tile(g) {
      var st = g.live ? readStats(g) : null, dn = st && st.done, sp = g.special && g.live && g.special.dow === dow && !(g.special.from && today < g.special.from);
      var tag = sp ? g.special.short : g.weekly ? (g.relday ? shortDay(g.relday) : "Weekly") : g.live && !g.dailyLine && diffFor(g, today, dow) === "Einstein" ? EIN : !g.live ? "Soon" : "";
      var t = g.live ? "a" : "div";
      return "<" + t + ' class="tl' + (dn ? " done" : "") + (g.live ? "" : " soon") + '" data-g="' + g.id + '" style="--accent:' + accentOf(g) + '"' + (g.live ? ' href="' + g.path + '"' : "") + ">" +
        (tag ? '<span class="tl-tag">' + tag + "</span>" : "") + '<span class="tl-ic">' + (window.MW_MASCOTS && MW_MASCOTS[g.id] ? mascImg(g.id, "", 46) : g.icon) + (dn ? '<span class="tick" aria-label="Done today">✓</span>' : "") + "</span>" +
        "<b>" + g.name + "</b><small>" + (g.kind || "") + "</small></" + t + ">";
    }
    function tiles(skip) {
      var list = order().filter(function (g) { return skip.indexOf(g.id) < 0; });
      if (!list.length) return "";
      return '<section class="tls" id="g-more"><div class="t3-head"><h2>More daily puzzles</h2><span>' + (NORMIE ? "All free. No medicine required." : "All free") + '</span></div><div class="tl-grid">' + list.map(tile).join("") + "</div></section>";
    }
    function arcadeRow() {
      return '<section class="tls" id="g-arcade"><div class="t3-head"><h2>Arcade</h2><span>Bonus games. Play all day.</span></div><div class="tl-grid tl-arc">' + ARCADE.map(function (a) {
        var dk = root.getAttribute("data-theme") === "dark", ic = a[0] === "basil-clover" ? '<span class="tl-cats"><img src="/assets/mascots/basil.svg?v=2" alt="" width="30" height="40"><img src="/assets/mascots/clover.svg?v=1" alt="" width="29" height="38"></span>' : '<img src="/assets/mascots/' + a[0] + '.svg?v=1" alt="" width="46" height="46">';
        var sub = { "basil-clover": "Cat chaos", stackulus: "Organ drop", mergeon: "Organ merge" }[a[0]] || "Arcade";
        return '<a class="tl" data-g="' + a[0] + '" href="/' + a[0] + '/" style="--accent:' + (dk ? a[5] : a[4]) + '"><span class="tl-ic">' + ic + "</span><b>" + a[1] + "</b><small>" + sub + "</small></a>";
      }).join("") + "</div></section>";
    }
    // Read this week (Medical only): newest deep dive, research week, Weekly Dose (data/home-reads.json) + next health day.
    function readsSlot() { return NORMIE ? "" : '<section class="rds" id="mw-reads" hidden><div class="t3-head"><h2>Read this week</h2><span>Short and evidence based</span></div><div class="rd-grid"></div></section>'; }
    function fillReads() {
      var box = document.getElementById("mw-reads"); if (!box) return;
      function card(href, img, k, t, x) { return '<a class="rd" href="' + esc2(href) + '"><img src="/assets/mascots/' + img + '.svg" alt="" width="44" height="44"><span class="rd-k">' + k + "</span><b>" + esc2(t) + "</b><small>" + esc2(x) + "</small></a>"; }
      var R = null, D = null, n = 0;
      function done() {
        if (++n < 2) return;
        var h = "";
        if (R && R.deep) h += card(R.deep.href, "deepdives", "Deep dive", R.deep.title, R.deep.text);
        if (R && R.guide) h += card(R.guide.href, "dx", "Health guide", R.guide.title, R.guide.text);
        if (R && R.dose) h += card(R.dose.href, "triviosis", "The Weekly Dose", R.dose.title, R.dose.text);
        if (D) h += card("/days/", "gridectomy", "Health Calendar", "Coming up: " + D.name.replace(/\s*\([^()]+\)\s*$/, ""), nice(D.dates[today.slice(0, 4)].start, { weekday: "long", day: "numeric", month: "short" }) + ". Every health day in one place.");
        if (!h) return;
        box.querySelector(".rd-grid").innerHTML = h; box.hidden = false;
      }
      fetch("/data/home-reads.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { R = j; done(); }).catch(done);
      fetch("/data/days-soon.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
        var yr = today.slice(0, 4);
        D = ((j && j.days) || []).filter(function (x) { var d = x.dates && x.dates[yr]; return d && d.start > today && x.kind !== "month" && (x.priority || 9) <= 2 && (x.tags || []).indexOf("sensitive") < 0 && inRegion(regionOf(x)); })
          .sort(function (a, b) { return a.dates[yr].start < b.dates[yr].start ? -1 : a.dates[yr].start > b.dates[yr].start ? 1 : (a.priority || 9) - (b.priority || 9); })[0] || null;
        done();
      }).catch(done);
    }
    function gpsBanner() {
      return NORMIE ? "" : '<a class="gps-b" href="/unspecialist/"><img src="/assets/mascots/morphemia.svg" alt="" width="64" height="64"><span><span class="rd-k">For doctors and students</span><b>GP School</b><small>Free, game-style GP training. Real-world patients, results and billing, with new cases every month.</small><span class="gps-go">Start your shift ›</span></span></a>';
    }

    function order() {
      var ORD = window.MW_ORDER || [], DAYS = { Thursdays: 4, Saturdays: 6, Sundays: 0 }, dw = new Date(dayNum(sydToday()) * 864e5).getUTCDay();
      return MW_GAMES.filter(inMode).map(function (g, i) {
        var st = g.live ? readStats(g) : null, k = ORD.indexOf(g.id); k = k < 0 ? 100 + i : k;
        if (g.live && g.relday && (DAYS[g.relday] === dw || g.relday.indexOf(["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"][dw]) >= 0)) k = 0.5; // release day: right after Dxtective
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
    // Health days chip (data/health-days.json). Days and weeks only; months are background themes.
    // Region-specific events show only in that region: tag "au" or a name ending "(Australia)"/"(NSW)" = Australia (time zone or en-AU);
    // "(UK)", "(US)", "(NZ)", "(Canada)", "(Ireland)" (or tags uk/us/nz/ca/ie) = that country's time zones.
    // Normie mode: hidden unless the event has a "normie" field (true, or {name, blurb, link} overrides).
    var HD = null;
    function regionOf(x) {
      var t = x.tags || [], R = ["au", "uk", "us", "nz", "ca", "ie"]; if (t.indexOf("country") >= 0 && t.indexOf("au") < 0 && !/\((Australia|NSW|VIC|Victoria|QLD|Queensland|SA|WA|TAS|Tasmania|NT|ACT)\)\s*$/i.test(x.name || "")) return ""; // national days (St Patrick's, Waitangi, US Independence…) are for everyone
      for (var i = 0; i < R.length; i++) if (t.indexOf(R[i]) >= 0) return R[i];
      var m = (x.name || "").match(/\(([^()]+)\)\s*$/); if (!m) return "";
      var k = m[1].trim();
      if (/^(Australia|NSW|VIC|Victoria|QLD|Queensland|SA|WA|TAS|Tasmania|NT|ACT)$/i.test(k)) return "au";
      if (/^(UK|United Kingdom|England|Scotland|Wales|Northern Ireland)$/i.test(k)) return "uk";
      if (/^(US|USA|United States)$/i.test(k)) return "us";
      if (/^(NZ|New Zealand|Aotearoa)$/i.test(k)) return "nz";
      if (/^Canada$/i.test(k)) return "ca";
      if (/^Ireland$/i.test(k)) return "ie";
      return "";
    }
    function inRegion(r) {
      if (!r) return true;
      if (r === "au") return inAU();
      var tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
      var TZ = { uk: /^Europe\/(London|Belfast|Guernsey|Isle_of_Man|Jersey)$/, ie: /^Europe\/Dublin$/, nz: /^Pacific\/(Auckland|Chatham)$/,
        us: /^(America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Juneau|Sitka|Nome|Yakutat|Metlakatla|Adak|Boise|Detroit|Menominee|Indiana\/.+|Kentucky\/.+|North_Dakota\/.+)|Pacific\/Honolulu)$/,
        ca: /^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Moncton|Glace_Bay|Goose_Bay|Whitehorse|Dawson|Dawson_Creek|Fort_Nelson|Iqaluit|Rankin_Inlet|Resolute|Cambridge_Bay|Inuvik|Swift_Current|Atikokan|Creston|Blanc-Sablon|Nipigon|Thunder_Bay|Rainy_River|Yellowknife|Pangnirtung)$/ };
      if (tz) return !!(TZ[r] && TZ[r].test(tz));
      return new RegExp("-" + { uk: "GB", ie: "IE", nz: "NZ", us: "US", ca: "CA" }[r] + "$", "i").test(navigator.language || "");
    }
    function healthDay() {
      if (HD === null) {
        HD = false;
        // Small file (today-1 to today+35, written by _scripts/build_days.py); the full 466 KB list only if it's stale or missing.
        var full = function () { fetch("/data/health-days.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { HD = (j && j.days) || []; healthDay(); }).catch(function () {}); };
        fetch("/data/days-soon.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; })
          .then(function (j) { if (j && j.days && j.from <= today && today <= j.to) { HD = j.days; healthDay(); } else full(); }).catch(full);
        return;
      }
      var slot = document.getElementById("mw-hday"); if (!slot) return;
      slot.innerHTML = "";
      if (!HD || !HD.length) return;
      var yr = today.slice(0, 4);
      var on = HD.filter(function (x) {
        var d = x.dates && x.dates[yr]; if (!d || x.kind === "month") return false;
        if (!inRegion(regionOf(x))) return false;
        if (NORMIE && !x.normie) return false;
        return d.end ? d.start <= today && today <= d.end : d.start === today;
      }).map(function (x) { var n = NORMIE && typeof x.normie === "object" ? x.normie : {}, y = {}; for (var k in x) y[k] = x[k]; ["name", "blurb", "link", "icon"].forEach(function (f) { if (n[f]) y[f] = n[f]; }); return y; });
      if (!on.length) return;
      function sens(x) { return (x.tags || []).indexOf("sensitive") >= 0; }
      var normal = on.filter(function (x) { return !sens(x); }).sort(function (a, b) {
        var fa = a.kind === "day" || a.dates[yr].start === today ? 0 : 1, fb = b.kind === "day" || b.dates[yr].start === today ? 0 : 1;
        return fa - fb || (a.priority || 9) - (b.priority || 9);
      });
      var lead = normal[0] || on.filter(sens)[0], first = lead.dates[yr].start === today, quiet = sens(lead) || (lead.priority || 9) >= 4; // priority 4+ = a small nod, never the main day
      var themed = !NORMIE && !quiet && lead.puzzle_theme && (lead.kind === "day" || first) && !/puzzle/i.test(lead.blurb || "");
      var nm = function (x) { return esc2(regionOf(x) ? x.name.replace(/\s*\([^()]+\)\s*$/, "") : x.name); };
      var also = normal.filter(function (x) { return x !== lead && (x.priority || 9) <= 3; }).slice(0, 2);
      var html = quiet ? '<section class="hday quiet"><p><b>' + nm(lead) + ".</b> " + esc2(lead.blurb || "") + (lead.page && !NORMIE ? ' <a href="' + esc2(lead.page) + '">Fact sheet</a>' : lead.link ? ' <a href="' + esc2(lead.link) + '" target="_blank" rel="noopener">More</a>' : "") + "</p></section>" :
        '<section class="hday' + (lead.icon ? " has-ic" : "") + '">' + (lead.icon ? '<img class="hday-ic" src="/assets/days/' + esc2(lead.icon) + '.svg" alt="" width="84" height="84">' : "") + '<span class="hday-k">' + (lead.kind === "week" ? "This week" : "Today") + "</span>" +
        "<h2>" + nm(lead) + "</h2><p>" + esc2(lead.blurb || "") + (themed ? " <b>Look out for themed puzzles today.</b>" : "") + "</p>" +
        (also.length ? '<p class="hday-also">Also: ' + also.map(function (x) { return x.page && !NORMIE ? '<a href="' + esc2(x.page) + '">' + nm(x) + "</a>" : x.link ? '<a href="' + esc2(x.link) + '" target="_blank" rel="noopener">' + nm(x) + "</a>" : nm(x); }).join(", ") + "</p>" : "") +
        '<div class="hday-row">' + (lead.page && !NORMIE ? '<a class="hday-go" href="' + esc2(lead.page) + '">Read our fact sheet</a>' : lead.link ? '<a class="hday-go" href="' + esc2(lead.link) + '" target="_blank" rel="noopener">Learn more</a>' : "<span></span>") + '<a class="hday-up" href="/days/">Coming up \u203a</a></div>' + "</section>";
      slot.innerHTML = html;
    }

    var allg = document.getElementById("mw-allgames"); // static, crawlable list of every game (Medical only)
    if (allg) allg.parentNode.removeChild(allg);
    var shc = main.querySelector(".mw-sharecard"); // static "Share this page" card (share_block.py): keep it above the footer
    if (shc) shc.parentNode.removeChild(shc);
    var snav = document.querySelector(".static-nav"); // static hub links (static_nav.py): kept in the footer across redraws
    function draw() {
      var t3 = startList();
      main.innerHTML = homeTop() + '<div id="mw-hday" class="hday-slot"></div>' + healthLinks() + todays3(t3) + progress() +
        tiles(t3.map(function (o) { return o.g.id; })) + readsSlot() + gpsBanner() + arcadeRow() + house() + homeBottom() + NL_HTML +
        '<footer class="site"><p class="ft-base"><span class="ft-note">' + MW_SITE.footer + '</span> <span class="ft-links"><a href="/about/">About</a> <a href="/disclaimer/">Disclaimer</a> <a href="/privacy/">Privacy</a> <a href="/contact/">Contact</a></span></p></footer>';
      if (allg && !NORMIE) {
        main.insertBefore(allg, main.querySelector("footer.site"));
        // phones: the full list repeats the game sections above, so fold it behind one button (still in the page for search engines)
        if (!allg.querySelector(".mw-allg-tog") && window.matchMedia && matchMedia("(max-width: 760px)").matches) {
          allg.classList.add("mw-allg-shut");
          var tg = document.createElement("button"); tg.type = "button"; tg.className = "mw-allg-tog"; tg.setAttribute("aria-expanded", "false"); tg.textContent = "Show every game and quiz";
          tg.onclick = function () { var sh = allg.classList.toggle("mw-allg-shut"); tg.setAttribute("aria-expanded", sh ? "false" : "true"); tg.textContent = sh ? "Show every game and quiz" : "Hide the full list"; };
          var h2 = allg.querySelector("h2"); if (h2) h2.insertAdjacentElement("afterend", tg); else allg.insertBefore(tg, allg.firstChild);
        }
      }
      if (shc) main.insertBefore(shc, main.querySelector("footer.site"));
      if (snav) main.querySelector("footer.site").insertBefore(snav, main.querySelector("footer.site").firstChild);
      social(); try { fillReads(); } catch (e) {}
    }
    draw(); liveShow(); window.MW_onTheme = function () { draw(); healthDay(); liveShow(); };
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
    var sk0 = get("mw-skip-" + sydToday(), []) || []; // games skipped today drop below the other unfinished ones, like Next
    function oi(x) { return (sk0.indexOf(x.g.id) >= 0 ? 1000 : 0) + playRank(x.g.id); }
    others.sort(function (a, b) { return a.m - b.m || (a.st && a.st.done ? 1 : 0) - (b.st && b.st.done ? 1 : 0) || oi(a) - oi(b); });
    var left = others.filter(function (o) { return !o.m && !o.g.weekly && !(o.st && o.st.done); }).length, gs0 = readStats(g);
    if (!g.weekly && !(gs0 && gs0.done)) left++; // count this game too until it's done, like the home page
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
    var pageDay = sydToday(); // the day this page opened on, so passing midnight doesn't hide the buttons
    function nextUnsolved() {
      if (!g.store || !g.store.day) return;
      var rows = Array.prototype.slice.call(arch.querySelectorAll(".arow")), t = sydToday(), cur = (rows.filter(function (r) { return r.classList.contains("on"); })[0]);
      var curD = cur ? rowDate(cur) : (new URLSearchParams(location.search).get("date") || pageDay);
      if (!cur && g.store.weekly && /^\d{4}-\d\d-\d\d$/.test(curD)) { var cn = dayNum(curD); curD = new Date((cn - relBack(cn, g.store.weekStart)) * 864e5).toISOString().slice(0, 10); } // weekly: this week's release day
      var curSt = get(g.store.day + curD, null);
      var todo = rows.filter(function (r) { var d = rowDate(r); if (!d || d > t || d === curD) return false; var x = get(g.store.day + d, null); return !(x && x.done); });
      nx.hidden = true;
      var done = curSt && curSt.done, tb = document.getElementById("mw-next-top");
      // today's next unplayed game in this mode: today's 3 first, then MW_ORDER (skipped games last resort)
      var tday = sydToday(), skipK = "mw-skip-" + tday, skips = get(skipK, []) || [];
      var left = MW_GAMES.filter(function (x) { if (!x.live || x.id === g.id || !inMode(x) || (x.from && x.from > tday)) return false; var r = readStats(x); return !(r && r.done); })
        .sort(function (a, b) { return playRank(a.id) - playRank(b.id); });
      var pool = left.filter(function (x) { return skips.indexOf(x.id) < 0; }); if (!pool.length) { pool = left; if (skips.length) set(skipK, []); }
      // daily games still to finish today, counted like the home page (this game included until today's is done)
      var gst = readStats(g), nLeft = left.filter(function (x) { return !x.weekly; }).length + (!g.weekly && !(gst && gst.done) ? 1 : 0);
      var sh0 = strip.querySelector(".mwx-head span"), ht = nLeft ? nLeft + " left today" : "All done today. Show-off."; if (sh0 && sh0.textContent !== ht) sh0.textContent = ht;
      var ng = pool[0];
      var r0 = todo[0], d0 = r0 ? rowDate(r0) : null;
      var stk = document.getElementById("mw-stuck");
      if (!done && ng) {
        var sh = '<button type="button" class="mwx-stuck">Stuck? Skip to ' + ng.name + ' \u203a</button>';
        if (!stk) { strip.insertAdjacentHTML("beforebegin", '<p id="mw-stuck" class="mwx-stuckp"></p>'); stk = document.getElementById("mw-stuck"); }
        if (stk.getAttribute("data-h") !== sh) { stk.innerHTML = sh; stk.setAttribute("data-h", sh); stk.querySelector("button").onclick = function () { var l = get(skipK, []) || []; if (l.indexOf(g.id) < 0) l.push(g.id); set(skipK, l); track("stuck-skip/" + g.id, "stuck " + g.name); location.href = "../" + ng.path + "?play"; }; }
      } else if (stk) stk.remove();
      if (!done || (!ng && !r0)) { if (tb) tb.remove(); return; }
      var th = '<div class="mwx-btns">' + (ng ? '<a class="mwx-today" href="../' + ng.path + '?play">Next: ' + ng.name + '<small>' + nLeft + ' left today</small></a>' : "") + (r0 ? '<button type="button" class="mwx-more2">More ' + g.name + '<small>' + todo.length + ' unsolved</small></button>' : "") +
        (ng && left.length > 1 ? '<button type="button" class="mwx-skip mwx-pill2">Skip next<small>' + ng.name + '</small></button>' : "") +
        (g.normie || g.nmode ? '<button type="button" class="mwx-mode mwx-pill2">' + (NORMIE ? "\ud83e\ude7a Medical version" : "\ud83d\ude42 Normie version") + '<small>of ' + g.name + '</small></button>' : "") + '</div>';
      if (!tb) { var res = box.querySelector(".mw-sharerow"); if (!res) return; var anc = box.querySelector(".mw-ticket") || box.querySelector('pre[id$="-share"],pre[id$="-sharetext"]') || res; if (anc.compareDocumentPosition(res) & 2) anc = res; anc.insertAdjacentHTML("beforebegin", '<div id="mw-next-top" class="mwx-nexttop"></div>'); tb = document.getElementById("mw-next-top"); }
      if (tb.getAttribute("data-h") === th) return;
      tb.innerHTML = th; tb.setAttribute("data-h", th);
      var mb = tb.querySelector(".mwx-more2"); if (mb) mb.onclick = function () { track("next-unsolved/" + g.id, g.name + " next unsolved"); tb.remove(); r0.click(); window.scrollTo({ top: 0, behavior: "smooth" }); };
      var tl = tb.querySelector(".mwx-today"); if (tl) tl.onclick = function () { track("next-today/" + g.id, g.name + " next today"); };
      var mo = tb.querySelector(".mwx-mode"); if (mo) mo.onclick = function () { setMode(NORMIE ? "medical" : "normie"); };
      var sk = tb.querySelector(".mwx-skip"); if (sk) sk.onclick = function () { var l = get(skipK, []) || []; if (l.indexOf(ng.id) < 0) l.push(ng.id); set(skipK, l); track("next-skip/" + ng.id, "skip " + ng.name); nextUnsolved(); };
    }
    nextUnsolved();
    window.addEventListener("storage", nextUnsolved);
    setInterval(nextUnsolved, 1500);
  }

  // ---------- game page ----------
  var ARCHIVES = { dx: 1, wordemic: 1, panelysis: 1, glimpsis: 1, opacitis: 1, sensitosis: 1, triviosis: 1, zebritis: 1, arrhythmix: 1, comorbix: 1, linkase: 1, labelosis: 1, grandrounds: 1, cryptogenic: 1 };
  function archiveLink(id) {
    if (!ARCHIVES[id] || NORMIE) return;
    var go = function () {
      var m = document.querySelector("main"); if (!m || m.querySelector(".mw-arch")) return;
      var pth = location.pathname.replace(/index\.html$/, "");
      m.insertAdjacentHTML("beforeend", '<p class="mw-arch"><a href="' + pth + 'archive/">Past puzzles and answers ›</a></p>');
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
  }
  function game(id) { setTimeout(social, 0); archiveLink(id);
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
    var ab = window.MW_ABOUT && MW_ABOUT[g.id], sab = document.getElementById("mw-about-static");
    // Static, crawlable About block in the page HTML (Medical text). Normie mode swaps in the Normie About, or hides it.
    if (sab) {
      if (NORMIE && sab.getAttribute("data-normie") !== "neutral") {
        var nab = g.nmode && window.MW_ABOUT_N && MW_ABOUT_N[g.id];
        if (nab) sab.innerHTML = "<h2>About " + g.name + "</h2><p>" + nab[0] + "</p>" + nab[1].map(function (q) { return "<details><summary>" + q[0] + "</summary><p>" + q[1] + "</p></details>"; }).join("");
        else sab.hidden = true;
      }
      ab = null;
    }
    if (ab) {
      (box.querySelector(".wrap") || box).appendChild(el('<section class="mw-about"><h2>About ' + g.name + '</h2><p>' + ab[0] + '</p>' + ab[1].map(function (q) { return "<details><summary>" + q[0] + "</summary><p>" + q[1] + "</p></details>"; }).join("") + "</section>"));
      var ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: ab[1].map(function (q) { return { "@type": "Question", name: q[0], acceptedAnswer: { "@type": "Answer", text: q[1] } }; }) };
      if (!g.nmode) { var sc = document.createElement("script"); sc.type = "application/ld+json"; sc.textContent = JSON.stringify(ld); document.head.appendChild(sc); }
    }
    if (medOnly || q.get("date") || q.get("play") !== null) { start(); return; }
    sp.style.setProperty("--accent", accentOf(g));
    var einToday = (!g.weekly && !g.dailyLine || (((g.nmode ? window.MW_EINSTEIN_N : window.MW_EINSTEIN) || {})[g.id] || []).indexOf(today) >= 0) && diffFor(g, today, dow) === "Einstein";
    sp.innerHTML = '<div class="splash-in">' + medNote + (g.nmode ? '<span class="mw-npill">\ud83d\ude42 Normie mode</span>' : "") + (g.special && g.special.dow === dow && !(g.special.from && today < g.special.from) ? '<span class="pill sup">' + g.special.label + "</span>" : "") + (einToday ? '<span class="pill ein">' + EIN + " Einstein day</span>" : "") + '<div class="tile' + (einToday ? " ein" : "") + '">' + g.icon + "</div><p class=\"sp-title\" role=\"heading\" aria-level=\"2\">" + g.name + "</p><p>" + g.tagline + "</p>" + spPrev(g.id) + (g.quip ? '<p class="meta">' + g.quip + "</p>" : "") +
      '<button class="big" type="button" id="mw-play">' + (st && st.done ? "Review" : "Play") + "</button>" +
      '<div class="meta"><b>' + nice(today, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + "</b><br>" + (g.dailyLine ? g.dailyLine : g.weekly ? (g.weeklyLine || "A new quiz every Monday. Ten questions, one theme.") : "Today: " + diffFor(g, today, dow) + ". " + DIFFQ[diffFor(g, today, dow)]) +
      (st && st.s.streak ? " &middot; Streak &#128293; " + st.s.streak : "") + "</div><p class=\"mw-live\" hidden></p></div>";
    document.getElementById("mw-play").onclick = start; liveShow();
    window.MW_onTheme = function () { sp.style.setProperty("--accent", accentOf(g)); };
  }



  // ---------- splash previews: a tiny, spoiler-free picture of each game under the tagline ----------
  function spPrev(id) {
    function cells(n, f) { var h = ""; for (var i = 0; i < n; i++) h += f(i); return h; }
    function t(c, x) { return '<i class="' + (c || "") + '">' + (x || "") + "</i>"; }
    var W = "w", Y = "y", G = "g", A = "a", K = "k", h = "";
    switch (id) {
      case "wordemic": h = '<div class="pv-grid c5">' + [K, Y, K, G, K].map(function (c) { return t(c); }).join("") + [G, K, G, G, Y].map(function (c) { return t(c); }).join("") + cells(5, function () { return t(); }) + "</div>"; break;
      case "comorbix": h = '<div class="pv-grid c4 wide">' + cells(4, function () { return t(A); }) + cells(8, function () { return t(); }) + "</div>"; break;
      case "morphemia": h = '<div class="pv-hex">' + cells(7, function (i) { return t(i === 3 ? A : ""); }) + "</div>"; break;
      case "linkase": h = '<div class="pv-chain">' + t(A) + "<b></b>" + t(A) + "<b></b>" + t() + "<b></b>" + t() + "</div>"; break;
      case "gridectomy": case "cryptogenic": var bl = id === "gridectomy" ? [4, 6, 18, 20] : [1, 3, 11, 13, 21, 23]; h = '<div class="pv-grid c5 sq">' + cells(25, function (i) { return t(bl.indexOf(i) >= 0 ? K + " blk" : (i < 5 ? A + " soft" : "")); }) + "</div>"; break;
      case "suturix": h = '<div class="pv-grid c6 sq ws">' + cells(18, function (i) { return t([1, 8, 15].indexOf(i) >= 0 ? A : ""); }) + "</div>"; break;
      case "triviosis": case "grandrounds": h = '<div class="pv-quiz"><b></b>' + cells(id === "triviosis" ? 4 : 0, function (i) { return t(i === 2 ? A : ""); }) + (id === "grandrounds" ? '<div class="pv-dots">' + cells(20, function (i) { return t(i < 6 ? A : ""); }) + "</div>" : "") + "</div>"; break;
      case "dx": h = '<div class="pv-clues">' + cells(3, function (i) { return '<b class="' + (i ? "" : "on") + '"><em>' + (i + 1) + "</em></b>"; }) + "</div>"; break;
      case "zebritis": h = '<div class="pv-meter"><b></b><span><i style="width:72%"></i></span><small>Rarer = more points</small></div>'; break;
      case "panelysis": h = '<div class="pv-lab">' + ["Na|138|", "K|5.9|▲", "Cr|210|▲", "Hb|128|"].map(function (r) { var c = r.split("|"); return "<p><span>" + c[0] + "</span><b>" + c[1] + "</b><em>" + c[2] + "</em></p>"; }).join("") + "</div>"; break;
      case "arrhythmix": h = '<svg class="pv-ecg" viewBox="0 0 220 50" aria-hidden="true"><path d="M0 30h20l5-6 5 6h8l4 4 6-30 6 40 4-14h22l5-6 5 6h8l4 4 6-30 6 40 4-14h22l5-6 5 6h8l4 4 6-30 6 40 4-14h12"/></svg>'; break;
      case "sudokrine": h = '<div class="pv-grid c4 sq">' + cells(16, function (i) { return t(i % 5 === 0 ? A : (i === 2 || i === 7 || i === 9 ? "soft n" : ""), i === 2 ? "3" : i === 7 ? "1" : i === 9 ? "4" : ""); }) + "</div>"; break;
      case "glimpsis": h = '<div class="pv-photo"><span></span><b></b></div>'; break;
      case "opacitis": h = '<div class="pv-photo scan"><span></span><b></b></div>'; break;
      case "labelosis": h = '<div class="pv-body"><svg viewBox="0 0 60 70" aria-hidden="true"><circle cx="30" cy="11" r="8"/><path d="M18 22h24l6 22h-6l-4-14v38h-6V48h-4v20h-6V30l-4 14h-6z"/></svg>' + cells(5, function (i) { return "<em>" + (i + 1) + "</em>"; }) + "</div>"; break;
      case "sensitosis": h = '<div class="pv-meter"><b></b><span><i style="width:85%"></i><u style="left:62%"></u></span><small>Your guess vs the real number</small></div>'; break;
      default: return "";
    }
    return '<div class="sp-prev" aria-hidden="true">' + h + "</div>";
  }

  // ---------- feedback: report puzzle errors, image licence problems, bugs ----------
  function feedback(pre, where) {
    var cats = [["puzzle", "Puzzle is wrong"], ["fact", "Fact or health info is wrong"], ["image", "Image licence or credit problem"], ["bug", "Something's broken"], ["idea", "Idea"], ["other", "Other"]];
    var page = location.pathname + location.search, d = "";
    try { d = new URLSearchParams(location.search).get("date") || ""; } catch (e) {}
    if (!d) page += " (" + sydToday() + ")";
    if (where) page = where;
    var s = modal("Report a problem", '<form class="mw-fb" novalidate><p class="mw-fbp">Spotted a wrong answer, a dodgy fact or an image that shouldn\u2019t be here? Tell us. We read every one.</p>' +
      '<label><span>What kind?</span><select name="cat">' + cats.map(function (c) { return '<option value="' + c[0] + '"' + (pre === c[0] ? " selected" : "") + ">" + c[1] + "</option>"; }).join("") + "</select></label>" +
      '<label><span>Where</span><input name="page" value="' + esc2(page) + (d ? "" : "") + '"></label>' +
      '<label><span>What\u2019s wrong?</span><textarea name="msg" rows="4" maxlength="2000" required placeholder="e.g. Today\u2019s answer should be X because\u2026"></textarea></label>' +
      '<label><span>Your email (optional, only if you want a reply)</span><input name="email" type="email" maxlength="120" autocomplete="email"></label>' +
      '<p class="mw-fbnote">For site problems only, not medical questions. Please don\u2019t include personal health details.</p>' +
      '<button type="submit" class="mw-fbsend">Send</button><p class="mw-fbmsg" aria-live="polite"></p></form>');
    var f = s.querySelector("form"), m = s.querySelector(".mw-fbmsg");
    f.onsubmit = function (e) {
      e.preventDefault();
      var o = { cat: f.cat.value, page: f.page.value, msg: f.msg.value.trim(), email: f.email.value.trim(), mode: MODE };
      if (!o.msg) { m.textContent = "Tell us what\u2019s wrong first."; f.msg.focus(); return; }
      var btn = f.querySelector(".mw-fbsend"); btn.disabled = true; m.textContent = "Sending\u2026";
      var mail = "mailto:maladywise@gmail.com?subject=" + encodeURIComponent("Malady Wise report: " + o.cat) + "&body=" + encodeURIComponent(o.page + "\n\n" + o.msg);
      fetch("https://mw-presence.onrender.com/fb", { method: "POST", body: JSON.stringify(o) }).then(function (r) {
        if (!r.ok) throw 0;
        f.innerHTML = '<p class="mw-fbp"><b>Thanks. Report received.</b> We fix errors fast, usually before tomorrow\u2019s puzzles.</p>'; track("feedback/" + o.cat, "Feedback " + o.cat);
      }).catch(function () { btn.disabled = false; m.innerHTML = 'Couldn\u2019t send just now. <a href="' + mail + '">Email it instead</a>.'; });
    };
  }

  window.MW_report = function (cat, where) { feedback(cat, where); };

  // ---------- footer: hub row (static_nav.py), follow links, one compact legal line ----------
  // Static pages ship <footer class="site"><nav class="static-nav">…</nav><p class="ft-base">note + links</p></footer>.
  // Here: pull a static-nav that sits outside the footer (the home page) into it, add the follow links
  // (edit MW_SITE.social to add more) and "Report a problem" at the end of the legal links.
  function social() {
    var f = document.querySelector("footer.site"), L = (window.MW_SITE && MW_SITE.social) || [];
    if (!f) return;
    var sn = document.querySelector(".static-nav");
    if (sn && !f.contains(sn)) f.insertBefore(sn, f.firstChild);
    var base = f.querySelector(".ft-base"), links = base && base.querySelector(".ft-links");
    if (L.length && !f.querySelector(".soc")) {
      var d = document.createElement("div"); d.className = "soc";
      d.innerHTML = '<span>Follow</span>' + L.map(function (x) { return '<a href="' + x[1] + '" target="_blank" rel="noopener" aria-label="' + x[0] + ' ' + x[2] + '">' + x[3] + "<b>" + x[2] + "</b></a>"; }).join("");
      f.insertBefore(d, base || null);
    }
    if (!f.querySelector(".mw-fbl")) {
      var btn = '<button type="button" class="mw-fbl">Report a problem</button>';
      if (links) links.insertAdjacentHTML("beforeend", " " + btn);
      else f.insertAdjacentHTML("beforeend", '<p class="ft-base"><span class="ft-links">' + btn + "</span></p>");
      f.querySelector(".mw-fbl").onclick = function () { feedback(); };
    }
    // Acknowledgement of Country (Newcastle: Awabakal and Worimi peoples).
    if (!f.querySelector(".ft-ack")) f.insertAdjacentHTML("beforeend", '<p class="ft-ack">Malady Wise is made in Newcastle, on the land of the Awabakal and Worimi peoples. We acknowledge them as the Traditional Custodians and pay our respects to Elders past and present.</p>');
  }
  // Auto search box for list pages (medicines, deep dives, …) that don't have one yet.
  function listSearch() {
    var main = document.querySelector("main.doc"); if (!main || document.getElementById("fs-q") || main.querySelector(".lsrch")) return;
    var ul = main.querySelector("ul.tx, ul.fslist"); if (!ul) return;
    var li = [].slice.call(ul.children).filter(function (x) { return x.tagName === "LI"; }); if (li.length < 6) return;
    var nm = { "/medicines/": "Search medicines", "/deep-dives/": "Search deep dives" }[location.pathname] || "Search this list";
    var norm = function (t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[‘’']/g, ""); };
    var box = document.createElement("input"); box.type = "search"; box.className = "lsrch"; box.placeholder = nm; box.setAttribute("aria-label", nm); box.autocomplete = "off";
    var no = document.createElement("p"); no.className = "meta"; no.hidden = true; no.textContent = "No match. Try another word.";
    ul.parentNode.insertBefore(box, ul); ul.parentNode.insertBefore(no, ul.nextSibling);
    var idx = li.map(function (x) { return norm(x.textContent + " " + (x.getAttribute("data-q") || "")); });
    box.addEventListener("input", function () { var w = norm(box.value).split(/\s+/).filter(Boolean), n = 0; li.forEach(function (x, i) { var ok = w.every(function (t) { return idx[i].indexOf(t) >= 0; }); x.hidden = !ok; if (ok) n++; }); no.hidden = n > 0; });
  }
  // A–Z jump bar under the search box on the big alphabetical lists (Conditions, Medicines).
  function azBar() {
    if (!/^\/(conditions|medicines)\/$/.test(location.pathname)) return;
    var main = document.querySelector("main.doc"); if (!main || main.querySelector(".azbar")) return;
    var ul = main.querySelector("#fs-list, ul.tx"); if (!ul) return;
    var q = document.getElementById("fs-q") || main.querySelector(".lsrch");
    var first = {};
    [].slice.call(ul.children).forEach(function (li) {
      if (li.tagName !== "LI") return; var b = li.querySelector("b, strong"); var t = (b || li).textContent.trim();
      var L = t.normalize("NFD").charAt(0).toUpperCase(); if (!/[A-Z]/.test(L)) L = "#";
      if (!first[L]) { first[L] = li; li.id = li.id || "az-" + (L === "#" ? "0" : L.toLowerCase()); }
    });
    var h = '<nav class="azbar" aria-label="Jump to letter">' + (first["#"] ? '<a href="#az-0">#</a>' : "");
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(function (L) { h += first[L] ? '<a href="#' + first[L].id + '">' + L + "</a>" : '<span aria-hidden="true">' + L + "</span>"; });
    h += "</nav>";
    (q || ul).insertAdjacentHTML(q ? "afterend" : "beforebegin", h);
    var bar = main.querySelector(".azbar");
    if (q) q.addEventListener("input", function () { bar.hidden = !!q.value.trim(); });
  }
  // ---------- medicine pages: a one-page, branded print (Nov 2026) ----------
  // The print button (and Ctrl+P) lay the page out as a two-column A4 sheet, open the side-effect list,
  // drop the FAQ, sources and site chrome, then shrink the whole sheet just enough to fit one page.
  function medPrint() {
    var main = document.querySelector("main.doc"); if (!main || main.querySelector(".medp-head")) return;
    var kind = /^\/medicines\/[^\/]+\/$/.test(location.pathname) ? "Medicine guide" : "";
    var ft = main.querySelector(".fs-top .meta"); if (!kind && ft && /^Fact sheet$/i.test(ft.textContent.trim())) kind = "Fact sheet";
    if (!kind) return; var fact = kind === "Fact sheet";
    document.body.classList.add("medp");
    var h1 = main.querySelector("h1"); if (!h1) return;
    h1.insertAdjacentHTML("beforebegin", '<div class="medp-head"><b>Malady Wise</b><span>' + kind + ' · maladywise.com' + location.pathname + "</span></div>");
    var start = main.querySelector(".glance") || main.querySelector(".lede") || h1, n = start.nextElementSibling, box = document.createElement("div");
    box.className = "medp-cols";
    var stop = function (el) { return !el || el.matches((fact ? "" : ".callout, ") + "section.faq, ul.src, ul.res, .mw-sharecard, section.related, .print-url, .print-qr, footer, .nl, .mwx, .mw-about") || (el.tagName === "H2" && /^(More information|Sources|Evidence|Helpful resources|Common questions)/i.test(el.textContent.trim())); };
    if (start.classList.contains("glance")) { var gh = start.previousElementSibling; if (gh && gh.tagName === "H2") gh.classList.add("medp-glance-h"); }
    var take = []; while (n && !stop(n)) { take.push(n); n = n.nextElementSibling; }
    if (!take.length) return;
    take[0].parentNode.insertBefore(box, take[0]); take.forEach(function (el) { box.appendChild(el); });
    [].forEach.call(main.querySelectorAll(":scope > p.meta"), function (m) { if (/Updated/.test(m.textContent)) m.classList.add("medp-upd"); });
    var opened = [];
    // Two real columns (not CSS multi-column, which browsers re-balance unpredictably across a page break):
    // lay the content out in one narrow column, find the halfway point, and split there. Long lists can split
    // between items; a heading never ends the left column on its own.
    var orig = [].slice.call(box.children), made = [];
    function restore() {
      made.forEach(function (m) { while (m.clone.firstChild) m.list.appendChild(m.clone.firstChild); }); made = [];
      box.innerHTML = ""; orig.forEach(function (el) { box.appendChild(el); }); box.classList.remove("medp-split");
    }
    function split(colW) {
      restore(); box.style.width = colW + "px";
      var top = box.getBoundingClientRect().top, total = box.getBoundingClientRect().height, units = [];
      orig.forEach(function (el) {
        var lis = /^(OL|UL)$/.test(el.tagName) ? [].slice.call(el.children).filter(function (x) { return x.tagName === "LI"; }) : [];
        if (lis.length >= 3) lis.forEach(function (li, k) { units.push({ el: li, list: el, k: k, top: li.getBoundingClientRect().top - top }); });
        else units.push({ el: el, top: el.getBoundingClientRect().top - top });
      });
      var cut = 0, best = 1e9; units.forEach(function (u, k) { var d = Math.abs(u.top - total / 2); if (k && d < best) { best = d; cut = k; } });
      if (!cut) { box.style.width = ""; return; }
      var u = units[cut], A = document.createElement("div"), B = document.createElement("div"); A.className = B.className = "medp-col";
      var startNode = u.el;
      if (u.list) { // split the list: the rest of its items move to a copy in the right column
        if (u.k === 0) startNode = u.list;
        else { var cl = u.list.cloneNode(false); if (u.list.tagName === "OL") cl.start = (u.list.start || 1) + u.k; cl.classList.add("medp-cont");
          [].slice.call(u.list.children).slice(u.k).forEach(function (li) { cl.appendChild(li); }); made.push({ list: u.list, clone: cl }); startNode = cl; }
      }
      var right = false, rightNodes = [], leftNodes = [];
      orig.forEach(function (el) { if (el === startNode) right = true; (right ? rightNodes : leftNodes).push(el); if (el === u.list && startNode !== u.list && u.list) { right = true; } });
      if (startNode.classList && startNode.classList.contains("medp-cont")) rightNodes.unshift(startNode);
      while (leftNodes.length > 1 && /^(H2|H3)$/.test(leftNodes[leftNodes.length - 1].tagName)) rightNodes.unshift(leftNodes.pop());
      box.innerHTML = ""; leftNodes.forEach(function (n) { A.appendChild(n); }); rightNodes.forEach(function (n) { B.appendChild(n); });
      box.appendChild(A); box.appendChild(B); box.classList.add("medp-split"); box.style.width = "";
    }
    function on() {
      document.documentElement.classList.add("medp-on"); main.style.zoom = "";
      [].forEach.call(main.querySelectorAll("details.se-more:not([open])"), function (d) { d.open = true; opened.push(d); });
      // Fill one page: shrink long guides, enlarge short ones. The sheet is laid out at (page width / zoom) so it
      // always spans the page; a few passes settle the height, which changes as the width does.
      var W = 710, fit = 960, z = 1; // px: 188 mm wide; A4 and US Letter height less the page margins
      // Find the biggest zoom (0.5-1.4) at which the sheet still fits: height depends on width, so bisect.
      function tall(zz) { main.style.zoom = ""; main.style.width = main.style.maxWidth = (W / zz) + "px"; split((W / zz - 16) / 2);
        var mt = main.getBoundingClientRect().top, hh = 0; [].forEach.call(main.children, function (c) { var r = c.getBoundingClientRect(); if (r.height) hh = Math.max(hh, r.bottom - mt); }); return hh * zz; }
      var lo = 0.5, hi = 1.4; if (tall(hi) <= fit) lo = hi; else for (var i = 0; i < 8; i++) { var mid = (lo + hi) / 2; if (tall(mid) <= fit) lo = mid; else hi = mid; }
      z = lo;
      z = Math.floor(z * 1000) / 1000; main.style.width = main.style.maxWidth = (W / z) + "px"; split((W / z - 16) / 2); main.style.zoom = String(z);
    }
    function off() { document.documentElement.classList.remove("medp-on"); main.style.zoom = main.style.width = main.style.maxWidth = ""; restore(); opened.forEach(function (d) { d.open = false; }); opened = []; }
    window.addEventListener("beforeprint", on); window.addEventListener("afterprint", off);
    window.MW_medPrint = { on: on, off: off };
  }
  // ---------- health pages: honest authorship badge, newsletter box, today's puzzle card ----------
  // Fact sheets, medicines, handouts, deep dives, tools and compare pages. Pages are drafted with AI tools and
  // overseen by a GP; a page the GP has personally reviewed carries data-gp-reviewed="YYYY-MM-DD" on <body> (or <main>).
  var INFO_RX = /^\/(medicines|exercises|deep-dives|tools|compare)\/[^\/]+\/$/;
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function longDate(iso) { // "2026-11-08" -> "8 November 2026", "2026-11" -> "November 2026"
    var m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(iso || ""); if (!m || +m[2] < 1 || +m[2] > 12) return "";
    return (m[3] ? +m[3] + " " : "") + MONTHS[+m[2] - 1] + " " + m[1];
  }
  function gpReviewed() {
    var n = document.querySelector("main[data-gp-reviewed]") || (document.body && document.body.hasAttribute("data-gp-reviewed") ? document.body : null);
    var v = n ? n.getAttribute("data-gp-reviewed") : ""; return /^\d{4}-\d{2}-\d{2}$/.test(v || "") ? v : "";
  }
  window.MW_gpReviewed = gpReviewed;
  function todayCard() { // the day's featured game (first of today's 3 still to play), plus the games hub
    var L = startIds(); if (!L.length) return "";
    var pick = L.filter(function (o) { var r = readStats(o.g); return !(r && r.done); })[0] || L[0], g = pick.g;
    return '<section class="mw-today" style="--ga:' + accentOf(g) + '"><a class="mwt-go" href="/' + g.path + '?play">' + mascImg(g.id, "", 48, "mwt-masc") +
      '<span class="mwt-tx"><small>Today’s puzzle</small><b>' + g.name + "</b><span>" + (g.kind || g.tagline || "") + " · about " + pick.min + ' min</span></span><span class="mwt-play">Play ›</span></a>' +
      '<a class="mwt-all" href="/medical-games/">All medical games ›</a></section>';
  }
  // tap a section mascot to make it wiggle
  document.addEventListener("click", function (e) {
    var im = e.target && e.target.closest && e.target.closest(".mw-sec-hero>img,.host>img");
    if (!im) return; im.classList.remove("mw-wig"); void im.offsetWidth; im.classList.add("mw-wig");
    setTimeout(function () { im.classList.remove("mw-wig"); }, 650);
  });
  function infoExtras() {
    var F = window.MW_FACTS || {}, p = location.pathname.replace(/index\.html$/, ""), me = F[p] || null;
    if (!me && !INFO_RX.test(p)) return;
    var main = document.querySelector("main"), h1 = main && main.querySelector("h1"); if (!h1) return;
    var ldEl = document.getElementById("mw-page-ld"), ld0 = null; try { ld0 = ldEl ? JSON.parse(ldEl.textContent) : null; } catch (e) {}
    var gp = gpReviewed(), upd = "";
    if (ld0) upd = ld0.dateModified || ld0.lastReviewed || "";
    if (!upd) { var mt = document.body.textContent.match(/(?:Reviewed|Updated)\s+(\d{1,2} )?([A-Z][a-z]+) (\d{4})/); if (mt && MONTHS.indexOf(mt[2]) >= 0) upd = mt[3] + "-" + ("0" + (MONTHS.indexOf(mt[2]) + 1)).slice(-2) + (mt[1] ? "-" + ("0" + mt[1].trim()).slice(-2) : ""); }
    if (!main.querySelector(".trust")) (h1.closest(".mw-sec-hero") || h1).insertAdjacentHTML("afterend", gp ? '<p class="trust gp">✔ Reviewed by an Australian GP on ' + longDate(gp) + "</p>"
      : '<p class="trust"><a href="/about/#how-we-make-pages">Made with AI tools and overseen by an Australian GP</a>' + (longDate(upd) ? " · Updated " + longDate(upd) : "") + "</p>");
    var foot = main.querySelector("footer.site"), anchor = main.querySelector(".print-url") || foot;
    if (me) {
      var rel = (me.r || []).filter(function (q) { return F[q]; });
      if (rel.length && anchor && !main.querySelector(".related")) anchor.insertAdjacentHTML("beforebegin", '<section class="related"><h2>Related</h2><ul>' + rel.map(function (q) { return '<li><a href="' + q + '"><span>' + { fact: "Fact sheet", drug: "Drug", tool: "Tool" }[F[q].k] + "</span>" + F[q].t + "</a></li>"; }).join("") + "</ul></section>");
      var pu = main.querySelector(".print-url"), qr = "/assets/qr/" + p.replace(/^\/|\/$/g, "").replace(/\//g, "-") + ".svg";
      if (pu) pu.insertAdjacentHTML("beforebegin", '<img class="print-qr" src="' + qr + '" alt="QR code for this page" width="72" height="72">');
      else if (foot) foot.insertAdjacentHTML("beforebegin", '<p class="print-url">maladywise.com' + p + '</p><img class="print-qr" src="' + qr + '" alt="QR code for this page" width="72" height="72">');
    }
    // JSON-LD: claim GP review only when the page carries data-gp-reviewed.
    var GP = { "@type": "Person", jobTitle: "General Practitioner", description: "Australian GP" };
    if (ldEl && ld0) {
      var ch = false;
      if (!gp && ld0.reviewedBy) { delete ld0.reviewedBy; ch = true; }
      if (!gp && ld0.lastReviewed) { if (!ld0.dateModified) ld0.dateModified = ld0.lastReviewed; delete ld0.lastReviewed; ch = true; }
      if (gp) { ld0.reviewedBy = GP; ld0.lastReviewed = gp; ch = true; }
      if (ch) ldEl.textContent = JSON.stringify(ld0);
    } else if (me && !ldEl) {
      var desc = (document.querySelector('meta[name="description"]') || {}).content || "";
      var ld = { "@context": "https://schema.org", "@type": "MedicalWebPage", name: (document.title || me.t).replace(/ \| Malady Wise$/, ""), url: "https://maladywise.com" + p, description: desc, inLanguage: "en-AU",
        audience: { "@type": "PeopleAudience", audienceType: me.k === "tool" ? "Clinicians" : "Patients" }, author: { "@type": "Organization", name: "Malady Wise", url: "https://maladywise.com/" } };
      if (gp) { ld.reviewedBy = GP; ld.lastReviewed = gp; } else if (upd) ld.dateModified = upd;
      var sc = document.createElement("script"); sc.type = "application/ld+json"; sc.id = "mw-page-ld"; sc.textContent = JSON.stringify(ld); document.head.appendChild(sc);
    }
    if (foot) {
      if (!document.querySelector(".mw-today")) { try { var tc = todayCard(); if (tc) foot.insertAdjacentHTML("beforebegin", tc); } catch (e) {} }
      if (!document.getElementById("newsletter")) { var nl = el(NL_HTML); nl.classList.add("nl-info"); foot.parentNode.insertBefore(nl, foot); }
    }
    if (window.MW_GAMES && foot) {
      var gl = MW_GAMES.filter(function (x) { return x.live && inMode(x); }).map(function (x) { return { g: x, st: readStats(x), m: inMode(x) ? 0 : 1 }; });
      gl.sort(function (a, b) { return a.m - b.m || (a.st && a.st.done ? 1 : 0) - (b.st && b.st.done ? 1 : 0); });
      var left2 = gl.filter(function (o) { return !o.m && !(o.st && o.st.done); }).length;
      foot.insertAdjacentHTML("beforebegin", '<section class="mwx mwx-info"><div class="mwx-head"><b>Take a break: today’s puzzles</b><span>' + (left2 ? left2 + " to play today" : "All done today. Impressive.") + '</span></div><div class="mwx-list">' +
        gl.map(function (o) { var dn = o.st && o.st.done; return '<a class="mwx-row' + (dn ? " done" : "") + (o.m ? " medonly" : "") + '" href="/' + o.g.path + '?play" style="--ga:' + accentOf(o.g) + '">' + mascImg(o.g.id, "", 34, "mwx-masc") + '<span class="mwx-nm">' + o.g.name + (o.m ? '<small class="mw-medtag">Medical only</small>' : "") + '</span><span class="mwx-st">' + (dn ? "✓" : "›") + "</span></a>"; }).join("") +
        '</div><a class="mwx-all" href="/">All puzzles</a></section>');
    }
  }
  // arcade pages (Stackulus, Mergeon, Basil + Clover): a "more games" box above the footer
  function arcadeBox() {
    var p = location.pathname.split("/")[1] || "", foot = document.querySelector("footer.site");
    if (!foot || document.querySelector(".mwx-arcade") || !ARCADE.some(function (a) { return a[0] === p; })) return;
    var others = ARCADE.filter(function (a) { return a[0] !== p; });
    var gl = (window.MW_GAMES || []).filter(function (x) { return x.live && inMode(x) && !x.weekly; }).map(function (x) { return { g: x, st: readStats(x) }; });
    var left = gl.filter(function (o) { return !(o.st && o.st.done); });
    var pick = (left.length ? left : gl).slice(0, 4);
    foot.insertAdjacentHTML("beforebegin", '<section class="mwx mwx-info mwx-arcade"><div class="mwx-head"><b>More games</b><span>' + (left.length ? left.length + " puzzles left today" : "All today\u2019s puzzles done") + '</span></div><div class="mwx-list">' +
      others.map(function (a) { return '<a class="mwx-row" href="/' + a[0] + '/" title="' + a[3] + '">' + (a[2] === "basil" ? '<span class="arc-ic arc-ic2" aria-hidden="true"><img src="/assets/mascots/basil.svg?v=2" alt="" width="17" height="24" loading="lazy"><img src="/assets/mascots/clover.svg?v=1" alt="" width="16" height="23" loading="lazy"></span>' : '<img class="arc-ic" src="/assets/mascots/' + a[2] + '.svg?v=1" alt="" width="34" height="34" loading="lazy">') + '<span class="mwx-nm" style="white-space:normal;line-height:1.15">' + a[1] + '</span><span class="mwx-st">\u203a</span></a>'; }).join("") +
      pick.map(function (o) { var dn = o.st && o.st.done; return '<a class="mwx-row' + (dn ? " done" : "") + '" href="/' + o.g.path + '?play" style="--ga:' + accentOf(o.g) + '">' + mascImg(o.g.id, "", 34, "mwx-masc") + '<span class="mwx-nm">' + o.g.name + '</span><span class="mwx-st">' + (dn ? "\u2713" : "\u203a") + "</span></a>"; }).join("") +
      '</div><a class="mwx-all" href="/">All puzzles</a></section>');
  }
  // 404 page: search the fact sheets, medicines, tools, games and main sections (all from data already loaded).
  function notFound() {
    var q = document.getElementById("nf-q"), out = document.getElementById("nf-res"), none = document.getElementById("nf-none"); if (!q || !out) return;
    var norm = function (t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[‘’']/g, ""); };
    var L = [], F = window.MW_FACTS || {}, K = { fact: "Fact sheet", drug: "Medicine", tool: "Tool" };
    Object.keys(F).forEach(function (u) { L.push([u, F[u].t, K[F[u].k] || "Page", (F[u].g || []).join(" ")]); });
    (window.MW_GAMES || []).forEach(function (g) { if (g.live && g.path) L.push(["/" + g.path, g.name, "Puzzle", (g.kind || "") + " " + (g.tagline || "")]); });
    [["/conditions/", "Conditions A–Z", "Section"], ["/medicines/", "Medicines", "Section"], ["/exercises/", "Exercise handouts", "Section"], ["/deep-dives/", "Deep dives", "Section"], ["/tools/", "Tools and calculators", "Section"], ["/compare/", "Compare", "Section"], ["/specialists/", "Specialists and allied health", "Section", "Newcastle Hunter"], ["/days/", "World health days", "Section"], ["/zebra-mail/", "Zebra Mail newsletter", "Section", "weekly dose"], ["/medical-games/", "Medical games", "Section", "quiz"], ["/arcade/", "Arcade games", "Section"], ["/about/", "About Malady Wise", "Section"], ["/contact/", "Contact", "Section"]].forEach(function (x) { L.push([x[0], x[1], x[2], x[3] || ""]); });
    var idx = L.map(function (x) { return norm(x[1] + " " + x[3] + " " + x[0].replace(/[\/-]+/g, " ")); });
    function run() {
      var w = norm(q.value).split(/\s+/).filter(Boolean), hits = [];
      if (w.length) L.forEach(function (x, i) { if (w.every(function (t) { return idx[i].indexOf(t) >= 0; })) hits.push(x); });
      out.innerHTML = hits.slice(0, 12).map(function (x) { return '<li><a href="' + esc2(x[0]) + '"><span>' + esc2(x[2]) + "</span>" + esc2(x[1]) + "</a></li>"; }).join("");
      none.hidden = !(w.length && !hits.length);
    }
    q.addEventListener("input", run);
    // Start with the words from the missing address, if they find anything (e.g. /gout-diet/ -> "gout").
    var guess = norm(decodeURIComponent(location.pathname)).replace(/index\.html$/, "").split(/[\/_.-]+/).filter(function (t) { return t.length > 2 && !/^(html|www|page)$/.test(t); });
    for (var i = 0; i < guess.length; i++) { q.value = guess[i]; run(); if (out.children.length) return; }
    q.value = ""; run();
  }
  function page() { try { notFound(); } catch (e) {} var sab = document.getElementById("mw-about-static"); if (sab && NORMIE && sab.getAttribute("data-normie") !== "neutral") sab.hidden = true;
    social(); topBar(null, "/"); var slot = document.getElementById("nl-slot"); if (slot) slot.outerHTML = NL_HTML; infoExtras(); listSearch(); try { azBar(); } catch (e) {} try { medPrint(); } catch (e) {} weeklyDose(); try { arcadeBox(); } catch (e) {} }
  // Zebra Mail issues: card layout, a topic mascot beside every story, short headline + quieter detail (CSS in shell.css .wd)
  var WD_TOPICS = [
    [/heart|cardi|blood pressure|hypertens|ecg|stroke|cholesterol|statin/i, "arrhythmix"],
    [/x-?ray|scan|\bct\b|mri|ultrasound|radiolog|imaging|medical physics/i, "opacitis"],
    [/insulin|diabet|thyroid|hormone|menopaus|testoster|oestrogen|estrogen|endocrin|obesity|glp-1|semaglutide|tirzepatide/i, "sudokrine"],
    [/vaccin|virus|viral|bacteri|infect|pneumon|sepsis|\btb\b|tubercul|strep|dengue|flu\b|influenza|covid|measles|malaria|hiv|antibiotic|jab/i, "wordemic"],
    [/cancer|tumou?r|oncol|chemo|lymphoma|leuk|melanoma|carcinoma/i, "panelysis"],
    [/skin|psoria|eczema|derm|rash|acne/i, "glimpsis"],
    [/brain|neuron|neuro|dementia|alzheimer|parkinson|autis|adhd|migraine|epilep/i, "comorbix"],
    [/gene|dna|genom|crispr|cell\b|stem cell/i, "linkase"],
    [/anatom|bone|muscle|joint|tendon|knee|hip|spine/i, "labelosis"],
    [/test|screen|sensitiv|accura|diagnos/i, "sensitosis"],
    [/mushroom|weird|odd|rare|zebra|unicorn/i, "zebritis"]
  ];
  var WD_FALL = ["dx", "triviosis", "gridectomy", "suturix", "morphemia", "cryptogenic", "grandrounds"];
  var WD_SEC = [[/weekly dose/i, "dx"], [/research/i, "linkase"], [/coming up/i, "triviosis"], [/weird/i, "morphemia"], [/zebra/i, "zebritis"], [/spotlight/i, "opacitis"], [/satire/i, "morphemia"], [/puzzles/i, "gridectomy"]];
  function wdPick(txt, used) {
    for (var i = 0; i < WD_TOPICS.length; i++) if (WD_TOPICS[i][0].test(txt) && !used[WD_TOPICS[i][1]]) return WD_TOPICS[i][1];
    for (var j = 0; j < WD_TOPICS.length; j++) if (WD_TOPICS[j][0].test(txt)) return WD_TOPICS[j][1];
    for (var k = 0; k < WD_FALL.length; k++) if (!used[WD_FALL[k]]) return WD_FALL[k];
    return "dx";
  }
  function wdDecorate(m) {
    m.classList.add("wd");
    Array.prototype.forEach.call(m.querySelectorAll("h2:not(.wd-title)"), function (h) {
      for (var i = 0; i < WD_SEC.length; i++) if (WD_SEC[i][0].test(h.textContent)) { h.insertAdjacentHTML("afterbegin", mascImg(WD_SEC[i][1], "", 26, "wd-hm"));h.innerHTML = (h.innerHTML.replace(/(<img[^>]*>)\s*[\u{1F300}-\u{1FAFF}☀-➿]️?\s*/u, "$1")); break; }
    });
    var used = {};
    Array.prototype.forEach.call(m.querySelectorAll("li, h2:not(.wd-title) + p"), function (el) {
      if (el.closest(".mw-crumbs, nav")) return; // breadcrumb and menu items aren't stories
      el.innerHTML = el.innerHTML.replace(/Why it(?:'|’)s interesting:/, '<span class="why">Why it’s interesting</span>');
      Array.prototype.forEach.call(el.querySelectorAll("a"), function (a) { if (/^write-up$/i.test(a.textContent.trim())) a.className = "wu"; });
      var st = el.firstElementChild, story = false;
      if (st && st.tagName === "STRONG" && st.querySelector("a")) { st.classList.add("hl"); story = true; }
      else if (st && st.tagName === "STRONG") { st.classList.add("when"); st.textContent = st.textContent.replace(/:\s*$/, ""); }
      else if (el.tagName === "P" && st && st.tagName === "A") story = true;
      if (!story) { // dates and puzzle lines: the linked game's mascot, else a topic mascot
        var fa = el.querySelector("a"), gl = fa && /^\//.test(fa.getAttribute("href") || "") && Array.prototype.filter.call([fa], function (a) { return /^\/[a-z]+\//.test(a.getAttribute("href")) && !/^\/zebra-mail\//.test(a.getAttribute("href")); })[0];
        var gid = gl ? gl.getAttribute("href").split("/")[1] : "", gm = (window.MW_GAMES || []).filter(function (g) { return g.id === gid || String(g.path || "").split("/")[0] === gid; })[0];
        var mid = gm ? gm.id : wdPick(el.textContent.slice(0, 300), used); if (!gm) used[mid] = 1;
        el.classList.add("wd-story", "wd-small");
        el.innerHTML = mascImg(mid, "", 34, "wd-m") + '<div class="wd-tx">' + el.innerHTML + "</div>";
        return;
      }
      var hl = (st.textContent || ""), id = wdPick(hl + " " + el.textContent.slice(0, 300), used); used[id] = 1;
      var body = el.innerHTML.replace(st.outerHTML, "");
      el.classList.add("wd-story");
      el.innerHTML = mascImg(id, "", 44, "wd-m") + '<div class="wd-tx">' + st.outerHTML + '<div class="wd-d">' + body + "</div></div>";
    });
  }
  function weeklyDose() {
    var path = location.pathname;
    if (/^\/zebra-mail\/\d{4}-\d{2}-\d{2}\//.test(path)) { var m = document.querySelector("main"); if (m) wdDecorate(m); return; }
    if (!/^\/zebra-mail\/(index\.html)?$/.test(path)) return;
    var slot = document.getElementById("latest");
    if (!slot) return;
    if (slot.querySelector("ul, h2 ~ p")) { wdDecorate(slot); return; } // issue already inlined by the weekly build
    var first = slot.querySelector('a[href^="/zebra-mail/20"]') || document.querySelector("#issues a");
    if (!first || !window.fetch || !window.DOMParser) return;
    fetch(first.getAttribute("href")).then(function (r) { return r.ok ? r.text() : ""; }).then(function (html) {
      if (!html) return;
      var d = new DOMParser().parseFromString(html, "text/html"), src = d.querySelector("main"); if (!src) return;
      var h1 = src.querySelector("h1"), lede = src.querySelector(".lede"), box = document.createElement("div");
      box.className = "wd-latest";
      box.innerHTML = '<p class="wd-kick">Latest issue</p><h2 class="wd-title"><a href="' + first.getAttribute("href") + '">' + (h1 ? h1.textContent : "Latest issue") + "</a></h2>" + (lede ? '<p class="lede">' + lede.innerHTML + "</p>" : "");
      var node = src.querySelector("h2");
      while (node) {
        if (node.tagName === "H3" || (node.id === "nl-slot") || (node.querySelector && node.querySelector(".play-cta"))) break;
        var next = node.nextElementSibling; box.appendChild(document.importNode(node, true)); node = next;
      }
      box.insertAdjacentHTML("beforeend", '<p><a class="play-cta" href="' + first.getAttribute("href") + '">Open this issue, with sources ›</a></p>');
      slot.innerHTML = ""; slot.appendChild(box); wdDecorate(box);
    }).catch(function () {});
  }
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
  // ---------- visible breadcrumb line on content pages (Home › Conditions › Gout) ----------
  // Drawn from the page's BreadcrumbList JSON-LD (added by _scripts/add_breadcrumbs.py), so the
  // two always agree. Content pages only (main.doc); game play screens keep JSON-LD only.
  (function () {
    function findList(o) {
      if (!o || typeof o !== "object") return null;
      if (o["@type"] === "BreadcrumbList") return o;
      var ks = Object.keys(o);
      for (var i = 0; i < ks.length; i++) { var r = findList(o[ks[i]]); if (r) return r; }
      return null;
    }
    function draw() {
      var main = document.querySelector("main.doc");
      if (!main || main.querySelector(".mw-crumbs")) return;
      var list = null, isGame = false;
      [].forEach.call(document.querySelectorAll('script[type="application/ld+json"]'), function (s) {
        try {
          var j = JSON.parse(s.textContent);
          if (j && j["@type"] === "WebApplication") isGame = true;
          if (!list) list = findList(j);
        } catch (e) {}
      });
      if (isGame || !list || !list.itemListElement || list.itemListElement.length < 2) return;
      var el = list.itemListElement, nav = document.createElement("nav"), ol = document.createElement("ol");
      nav.className = "mw-crumbs"; nav.setAttribute("aria-label", "Breadcrumb");
      el.forEach(function (it, i) {
        var li = document.createElement("li"), last = i === el.length - 1, name = i === 0 ? "Home" : it.name;
        var path = String(it.item || "").replace(/^https?:\/\/[^/]+/, "") || "/";
        if (last) { var sp = document.createElement("span"); sp.setAttribute("aria-current", "page"); sp.textContent = name; li.appendChild(sp); }
        else { var a = document.createElement("a"); a.href = path; a.textContent = name; li.appendChild(a); }
        ol.appendChild(li);
      });
      nav.appendChild(ol);
      // a hand-written "Parent › Page" line duplicates the crumbs: hide it
      var meta = main.querySelector(":scope > .meta");
      if (meta && meta.textContent.indexOf("›") >= 0) meta.hidden = true;
      main.insertBefore(nav, main.firstChild);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", draw); else draw();
  })();
  window.MW = { hub: hub, game: game, modal: modal, page: page, feedback: feedback };
})();
