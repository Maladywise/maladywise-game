/* Shared shell: theme, top bar, modals, hub rendering, game splash. No dependencies. */
(function () {
  "use strict";
  var root = document.documentElement;
  function get(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

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
            setTimeout(nlPrompt, 2600);
            (function (val, live) { setTimeout(function () { try { celebrate(g.id, JSON.parse(val)); if (live) afterLive(g, JSON.parse(val)); } catch (x) {} }, 450); })(v, !g.store.weekly && k === pre + sydToday());
          }
        }
      } catch (e) {}
      return orig.apply(this, arguments);
    };
  }

  // ---------- overall daily streak (any daily game finished on the day it was live) ----------
  function markDay() { var d = get("mw-days", []), t = sydToday(); if (d.indexOf(t) < 0) { d.push(t); d = d.slice(-400); set("mw-days", d); } }
  function playedDays() {
    var seen = {}; get("mw-days", []).forEach(function (d) { seen[d] = 1; });
    (window.MW_GAMES || []).forEach(function (g) {
      if (!g.live || !g.store || g.store.weekly) return;
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
      return { cls: "cb-dx" + (gold ? " gold" : ""), html: '<div class="cb-stamp">CASE<br>CLOSED</div><p class="cb-cap">' + (gold ? "First clue. Frankly suspicious." : "Diagnosed on clue " + st.revealed + ".") + "</p>" };
    },
    wordemic: function (st) {
      if (!st.win) return null;
      var n = (st.guesses || []).length, gold = n <= 2;
      return { cls: "cb-ecg" + (gold ? " gold" : ""), html: '<svg class="cb-line" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 60 H120 L135 60 L145 25 L158 100 L170 10 L184 92 L196 60 H260 L270 60 L278 40 L288 80 L298 60 H400"/></svg><p class="cb-cap">' + (gold ? "Pulse restored in " + n + ". Show-off." : "Pulse restored. Solved in " + n + ".") + "</p>" };
    },
    comorbix: function (st) {
      if (!st.win) return null; var m = st.mistakes || 0;
      return { cls: "cb-bars", html: confetti(["#E9C46A", "#2A9D8F", "#457B9D", "#9B5DE5"], 40) + '<div class="cb-stack"><i style="--c:#E9C46A"></i><i style="--c:#2A9D8F"></i><i style="--c:#457B9D"></i><i style="--c:#9B5DE5"></i></div><p class="cb-cap">' + (m ? "Discharged, with " + m + " slip" + (m > 1 ? "s" : "") + "." : "Clean discharge. Not one mistake.") + "</p>" };
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
      return { cls: "cb-sut", html: '<svg class="cb-wound" viewBox="0 0 300 80" aria-hidden="true"><path class="cut" d="M10 40 C 60 20, 100 60, 150 40 S 240 20, 290 40"/>' + [40, 85, 130, 175, 220, 260].map(function (x, i) { return '<path class="st" style="animation-delay:' + (.3 + i * .14) + 's" d="M' + (x - 8) + " 26 L" + (x + 8) + " 54 M" + (x + 8) + " 26 L" + (x - 8) + ' 54"/>'; }).join("") + '</svg><p class="cb-cap">' + (st.hints ? "Closed, with a little help." : "Wound closed. Not a stitch out of place.") + "</p>" };
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
  function celebrate(id, st) {
    var f = SCENES[id]; if (!f || !st) return;
    queue(f(st));
    var g = (window.MW_GAMES || []).filter(function (x) { return x.id === id; })[0];
    if (g && st.win && !g.weekly && !g.dailyLine) { var t = sydToday(); if (diffFor(g, t, new Date(dayNum(t) * 864e5).getUTCDay()) === "Einstein") queue({ cls: "cb-ein", ms: 3000, html: '<svg class="cb-atom" viewBox="-60 -60 120 120" aria-hidden="true"><ellipse rx="52" ry="18"/><ellipse rx="52" ry="18" transform="rotate(60)"/><ellipse rx="52" ry="18" transform="rotate(120)"/><circle r="8" class="nuc"/></svg><p class="cb-cap">Einstein day, solved. Genuinely rare. Frame it.</p>' }); }
  }
  var BADGES = { 3: ["Intern", "\ud83e\ude7a"], 7: ["Registrar", "\ud83e\udd47"], 14: ["Fellow", "\ud83c\udf93"], 30: ["Consultant", "\ud83c\udfc6"], 100: ["Professor", "\ud83d\udc51"] };
  function afterLive(g) {
    var t = sydToday(), sk = siteStreak().n, b = BADGES[sk];
    if (b && get("mw-badge-" + sk, "") !== t && !get("mw-badge-" + sk + "-got", 0)) {
      set("mw-badge-" + sk + "-got", 1);
      queue({ cls: "cb-badge", ms: 3200, html: '<div class="cb-medal">' + b[1] + '</div><p class="cb-cap">\ud83d\udd25 ' + sk + "-day streak. Promoted to " + b[0] + ".</p>" });
    }
    var daily = (window.MW_GAMES || []).filter(function (x) { return x.live && !x.weekly && x.store; });
    var all = daily.every(function (x) { var s2 = get(x.store.day + t, null); return s2 && s2.done; });
    if (all && get("mw-wrc", "") !== t) {
      set("mw-wrc", t);
      queue({ cls: "cb-wrc", ms: 3600, html: confetti(["#4A3480", "#2E7D6B", "#B23A6F", "#B07A0C", "#2F5DA8", "#C2553A", "#1F7A8C"], 60) + '<div class="cb-big">Ward round<br>complete</div><p class="cb-cap">All ' + daily.length + " done. Go home. Hydrate.</p>" });
    }
  }
  window.MW_celebrate = celebrate;

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

  // ---------- native share button next to every "Copy result" ----------
  function addShare(root) {
    if (!navigator.share) return;
    Array.prototype.forEach.call((root || document).querySelectorAll('button[id$="-copy"]:not([data-mws])'), function (b) {
      b.setAttribute("data-mws", "1");
      var pfx = b.id.slice(0, -5), pre = document.getElementById(pfx + "-share") || document.getElementById(pfx + "-sharetext");
      if (!pre) return;
      var sb = document.createElement("button"); sb.type = "button"; sb.className = b.className.replace(/\bsolid\b/, "").trim() + " mw-share"; sb.textContent = "Share";
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
  function diffFor(g, d, dow) { return (window.MW_EINSTEIN && (MW_EINSTEIN[g.id] || []).indexOf(d) >= 0) ? "Einstein" : DIFF[dow]; }
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
      '<div class="opt"><span>Animations</span>' + seg("mw-motion", [["full", "On"], ["reduce", "Off"]], m) + "</div>");
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
      '<p style="margin:0;color:var(--muted);font-size:13px">Saved in this browser on this device. Clear your browser, lose your glory.</p>');
  }


  // ---------- newsletter (Buttondown) ----------
  var NL_HTML = '<section class="nl" id="newsletter"><div class="nl-txt"><b>Get Zebra Mail \ud83e\udd93</b><span>A monthly email of medical puzzles, a fictional zebra case and three things I learned. From an Australian GP. Unsubscribe any time.</span></div>' +
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

  // ---------- top bar ----------
  function topBar(g, home) {
    var sub = window.MW_HOME ? "" : "<span>" + MW_SITE.sub + "</span>";
    var bar = el('<header class="bar"><div class="bar-in">' +
      (g ? '<a class="back" href="../">' + I.back + MW_SITE.name + "</a>" : '<a class="logo" href="' + (home || "./") + '">' + MW_SITE.name + sub + "</a>") +
      '<nav class="tools" aria-label="Tools">' +
      (!g && window.MW_HOME ? '<div class="navwrap" id="mw-nav">' + MW_HOME.nav.map(function (n) { return '<a class="navlink' + (location.pathname === n[1] ? " on" : "") + '" href="' + n[1] + '">' + n[0] + "</a>"; }).join("") +
        '<a class="subpill" href="#newsletter" data-a="sub">Subscribe</a></div><button class="icon-btn burger" data-a="menu" aria-label="Menu" aria-expanded="false" aria-controls="mw-nav">' + I.menu + "</button>" : "") +
      (g ? '<button class="icon-btn" data-a="help" aria-label="How to play">' + I.help + "</button>" +
           '<button class="icon-btn" data-a="stats" aria-label="Stats">' + I.stats + "</button>" +
           '<button class="icon-btn" data-a="archive" aria-label="Past puzzles">' + I.archive + "</button>" : "") +
      '<button class="icon-btn" data-a="settings" aria-label="Settings">' + I.gear + "</button></nav></div></header>");
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-a]"); if (!b) return;
      var a = b.getAttribute("data-a");
      if (a === "menu") { var nv = document.getElementById("mw-nav"), op = nv.classList.toggle("open"); b.setAttribute("aria-expanded", op ? "true" : "false"); }
      if (a === "sub") { var t = document.getElementById("newsletter"); if (t) { e.preventDefault(); var nv2 = document.getElementById("mw-nav"); if (nv2) nv2.classList.remove("open"); t.scrollIntoView({ behavior: "smooth", block: "center" }); var inp = t.querySelector("input[type=email]"); if (inp) setTimeout(function () { inp.focus({ preventScroll: true }); }, 400); } else { e.preventDefault(); location.href = "/#newsletter"; } }
      if (a === "settings") settings();
      if (a === "stats") statsModal(g);
      if (a === "help") modal("How to play", "<ol>" + (g.help || []).map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol>" + (g.helpQuip ? '<p style="margin:0;color:var(--muted)">' + g.helpQuip + "</p>" : ""));
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
      var tag = g.live ? "a" : "div";
      return "<" + tag + ' class="card' + (g.live ? "" : " soon") + (g.featured ? " feature" : "") + (st && st.done ? " done" : "") + '" style="--accent:' + accentOf(g) + '"' + (g.live ? ' href="' + g.path + '"' : "") + ">" +
        '<div class="band">' + g.icon + (st && st.done ? '<span class="tick" aria-label="Done today">\u2713</span>' : "") + "</div>" +
        '<div class="cbody">' + (!g.weekly && !g.dailyLine && diffFor(g, today, dow) === "Einstein" && g.live ? '<span class="pill ein">' + EIN + " Einstein day</span>" : "") +
        '<h2 class="name">' + g.name + "</h2>" + (g.kind ? '<p class="kind">' + g.kind + "</p>" : "") + '<p class="tag">' + g.tagline + "</p>" +
        '<div class="cfoot"><span class="play">' + btn + '</span><span class="status">' + status + "</span></div>" + (g.weekly ? '<span class="pill wk">Weekly</span>' : "") + (g.special && g.live && g.special.dow === dow && !(g.special.from && today < g.special.from) ? '<span class="pill wk sup">' + g.special.short + "</span>" : "") + "</div></" + tag + ">";
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
      return '<a class="card house" href="' + h.href + '" target="_blank" rel="noopener" style="--accent:' + (root.getAttribute("data-theme") === "dark" ? h.accentDark : h.accent) + '">' +
        '<div class="band"><svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 20v8h6l14 9V11L14 20H8z"/><path d="M34 18a8 8 0 0 1 0 12M38 13a14 14 0 0 1 0 22"/></svg></div>' +
        '<div class="cbody"><h2 class="name">' + h.name + '</h2><p class="tag">' + h.text + '</p><div class="cfoot"><span class="play">' + h.cta + "</span></div></div></a>" +
        '<a class="card house" href="https://ko-fi.com/maladywise" target="_blank" rel="noopener" style="--accent:' + (root.getAttribute("data-theme") === "dark" ? "#D9A066" : "#A8642A") + '">' +
        '<div class="band"><svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 18h26v10a10 10 0 0 1-10 10h-6A10 10 0 0 1 8 28z"/><path d="M34 20h3a5 5 0 0 1 0 10h-3M16 6c0 3 2 3 2 6M24 6c0 3 2 3 2 6"/></svg></div>' +
        '<div class="cbody"><h2 class="name">Buy me a coffee</h2><p class="tag">Free, no ads, made after hours. A coffee keeps new puzzles coming.</p><div class="cfoot"><span class="play">Ko-fi \u2615</span></div></div></a>';
    }
    function order() {
      return MW_GAMES.map(function (g, i) { var st = g.live ? readStats(g) : null; return { g: g, i: i, d: st && st.done ? 1 : 0 }; })
        .sort(function (a, b) { return a.d - b.d || a.i - b.i; }).map(function (x) { return x.g; });
    }
    function streakPill() {
      var sk = siteStreak();
      return '<span class="mwstreak">\ud83d\udd25 <b>' + sk.n + "-day</b> streak" + (sk.n === 0 ? ". Start one today" : sk.today ? "" : ". Play today to keep it") + "</span>";
    }
    function progress() {
      var daily = MW_GAMES.filter(function (g) { return g.live && !g.weekly; }), n = daily.length;
      var d = daily.filter(function (g) { var st = readStats(g); return st && st.done; }).length;
      var q = d === 0 ? "None yet. The waiting room is full." : d === n ? "All done. Go outside. Touch grass. Hydrate." : d >= n - 2 ? "Nearly there. Finish the round." : d >= n / 2 ? "Over halfway. Don\u2019t clock off yet." : "Good start. Plenty left.";
      return '<div class="mwprog">' + installChip() + '<div class="mwbar"><i style="width:' + Math.round(d / n * 100) + '%"></i></div><div class="mwline"><p><b>' + d + " of " + n + "</b> done today. " + q + "</p>" + streakPill() + "</div></div>";
    }
    // Health days banner (data/health-days.json). Days and weeks only; months are background themes.
    var HD = null;
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
        return d.end ? d.start <= today && today <= d.end : d.start === today;
      });
      if (!on.length) return;
      var normal = on.filter(function (x) { return x.tags.indexOf("sensitive") < 0; })
        .sort(function (a, b) { return a.priority - b.priority; });
      var sens = on.filter(function (x) { return x.tags.indexOf("sensitive") >= 0; });
      var html = "";
      if (normal.length) {
        var lead = normal[0], first = lead.dates[yr].start === today;
        var themed = lead.puzzle_theme && (lead.kind === "day" || first) && !/puzzle/i.test(lead.blurb);
        html += '<section class="hday"><span class="hday-k">' + (lead.kind === "week" ? "This week" : "Today") + '</span>' +
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
      main.innerHTML = homeTop() + '<section class="mast" id="puzzles"><div class="mast-top"><div class="mast-l"><p class="tagl">Think like a doctor.</p><h1>Today&rsquo;s medical puzzles</h1>' +
        '<p class="mdate">' + nice(today, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + "</p><p>" + DAYQ[dow] + "</p></div>" +
        '<div class="mast-r"><span class="pill daypill d-' + DIFF[dow] + '">' + nice(today, { weekday: "long" }) + " &middot; " + DIFF[dow] + '</span><span class="nextin">New puzzles in <b id="mw-count">' + countdown() + "</b></span></div></div>" +
        (function () { var t = get("mw-einstein", []); return t.length ? '<p class="trophy">' + EIN + " Einstein badges: <b>" + t.length + "</b>. Genuinely rare. Frame them.</p>" : ""; })() + "</section>" +
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
    var others = MW_GAMES.filter(function (x) { return x.live && x.id !== g.id; }).map(function (x) { return { g: x, st: readStats(x) }; });
    others.sort(function (a, b) { return (a.st && a.st.done ? 1 : 0) - (b.st && b.st.done ? 1 : 0); });
    var left = others.filter(function (o) { return !(o.st && o.st.done); }).length;
    var strip = el('<section class="mwx"><div class="mwx-head"><b>Keep playing</b><span>' + (left ? left + " left today" : "All done today. Show-off.") + '</span></div><div class="mwx-list">' +
      others.map(function (o) {
        var done = o.st && o.st.done;
        return '<a class="mwx-row' + (done ? " done" : "") + '" href="../' + o.g.path + '?play" style="--ga:' + accentOf(o.g) + '"><span class="mwx-ic">' + o.g.icon + '</span><span class="mwx-nm">' + o.g.name + '</span><span class="mwx-st">' + (done ? (o.st.win ? "\u2713" : "Done") : "\u203a") + "</span></a>";
      }).join("") + '</div><a class="mwx-all" href="../">All puzzles</a></section>');
    arch.parentNode.insertBefore(strip, arch.nextSibling);
    if (!document.getElementById("newsletter")) { var nl = el(NL_HTML); nl.classList.add("nl-game"); strip.parentNode.insertBefore(nl, strip.nextSibling); }
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
    obs = new MutationObserver(function () { expanded = false; limit(); });
    limit();
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
      if (g.help && !get("mw-seen-" + g.id, 0)) { set("mw-seen-" + g.id, 1); setTimeout(function () { modal("How to play " + g.name, "<ol>" + g.help.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol>" + (g.helpQuip ? '<p style="margin:0;color:var(--muted)">' + g.helpQuip + "</p>" : "") + '<p style="margin:10px 0 0;font-size:13px;color:var(--muted)">Find this again under the ? icon.</p>'); }, 350); }
    }
    if (g.id !== "dx" && box && !box.querySelector(".gtitle")) {
      var gt = document.createElement("header"); gt.className = "gtitle";
      gt.style.setProperty("--ga", g.accent); gt.style.setProperty("--gad", g.accentDark);
      gt.innerHTML = "<h1>" + g.name + "</h1><p>" + g.tagline + "</p>";
      var hd = box.querySelector(".head");
      if (hd) hd.parentNode.insertBefore(gt, hd.nextSibling); else box.insertBefore(gt, box.firstChild);
    }
    extras(g, box, today);
    if (q.get("date") || q.get("play") !== null) { start(); return; }
    sp.style.setProperty("--accent", accentOf(g));
    var einToday = !g.weekly && !g.dailyLine && diffFor(g, today, dow) === "Einstein";
    sp.innerHTML = '<div class="splash-in">' + (g.special && g.special.dow === dow && !(g.special.from && today < g.special.from) ? '<span class="pill sup">' + g.special.label + "</span>" : "") + (einToday ? '<span class="pill ein">' + EIN + " Einstein day</span>" : "") + '<div class="tile' + (einToday ? " ein" : "") + '">' + g.icon + "</div><h1>" + g.name + "</h1><p>" + g.tagline + "</p>" + (g.quip ? '<p class="meta">' + g.quip + "</p>" : "") +
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
  function page() { social(); topBar(null, "/"); var slot = document.getElementById("nl-slot"); if (slot) slot.outerHTML = NL_HTML; }
  window.MW = { hub: hub, game: game, modal: modal, page: page };
})();
