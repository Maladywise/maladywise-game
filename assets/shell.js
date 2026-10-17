/* Shared shell: theme, top bar, modals, hub rendering, game splash. No dependencies. */
(function () {
  "use strict";
  var root = document.documentElement;
  function get(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

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

  // ---------- icons ----------
  var I = {
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
    var s = modal("Settings",
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
    var s = get(g.store.stats, null) || { played: 0, wins: 0, streak: 0, best: 0, dist: [0, 0, 0, 0, 0, 0, 0] };
    var today = get(g.store.day + sydToday(), null);
    return { s: s, done: !!(today && today.done), win: !!(today && today.win), labels: ["1", "2", "3", "4", "5", "6", "X"] };
  }
  function statsModal(g) {
    var r = readStats(g);
    if (!r) { modal("Stats", "<p>No stats yet.</p>"); return; }
    var s = r.s, pct = s.played ? Math.round(s.wins / s.played * 100) : 0, max = Math.max.apply(null, (s.dist || [0]).concat([1]));
    modal(g.name + " stats",
      '<div class="mstats"><div><b>' + s.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Win %</span></div><div><b>' + s.streak + '</b><span>Streak</span></div><div><b>' + s.best + '</b><span>Best</span></div></div>' +
      '<div class="mdist">' + (s.dist || []).map(function (n, i) { return '<div><span>' + r.labels[i] + '</span><i style="width:' + Math.max(8, Math.round(n / max * 100)) + '%">' + n + "</i></div>"; }).join("") + "</div>" +
      '<p style="margin:0;color:var(--muted);font-size:13px">Stats are saved in this browser on this device.</p>');
  }

  // ---------- top bar ----------
  function topBar(g) {
    var bar = el('<header class="bar"><div class="bar-in">' +
      (g ? '<a class="back" href="../">' + I.back + MW_SITE.name + "</a>" : '<a class="logo" href="./">' + MW_SITE.name + "<span>" + MW_SITE.sub + "</span></a>") +
      '<nav class="tools" aria-label="Tools">' +
      (g ? '<button class="icon-btn" data-a="help" aria-label="How to play">' + I.help + "</button>" +
           '<button class="icon-btn" data-a="stats" aria-label="Stats">' + I.stats + "</button>" +
           '<button class="icon-btn" data-a="archive" aria-label="Past puzzles">' + I.archive + "</button>" : "") +
      '<button class="icon-btn" data-a="settings" aria-label="Settings">' + I.gear + "</button></nav></div></header>");
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-a]"); if (!b) return;
      var a = b.getAttribute("data-a");
      if (a === "settings") settings();
      if (a === "stats") statsModal(g);
      if (a === "help") modal("How to play", "<ol>" + (g.help || []).map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol>");
      if (a === "archive") { if (window.MW_openArchive) window.MW_openArchive(); }
    });
    document.body.insertBefore(bar, document.body.firstChild);
  }

  // ---------- hub ----------
  function hub() {
    topBar(null);
    var today = sydToday(), dow = new Date(dayNum(today) * 864e5).getUTCDay();
    var main = document.getElementById("hub");
    function card(g) {
      var st = g.live ? readStats(g) : null;
      var status = !st ? "" : st.done ? (st.win ? "Solved " : "Done ") + (st.s.streak ? "&middot; Streak <b>&#128293; " + st.s.streak + "</b>" : "") : st.s.streak ? "Streak <b>&#128293; " + st.s.streak + "</b>" : "";
      var btn = !g.live ? "Coming soon" : st && st.done ? "See results" : "Play";
      var tag = g.live ? "a" : "div";
      return "<" + tag + ' class="card' + (g.live ? "" : " soon") + (g.featured ? " feature" : "") + '" style="--accent:' + accentOf(g) + '"' + (g.live ? ' href="' + g.path + '"' : "") + ">" +
        '<div class="band">' + g.icon + "</div>" +
        '<div class="cbody">' + (g.featured ? '<span class="pill">Today &middot; ' + DIFF[dow] + "</span>" : "") +
        '<h2 class="name">' + g.name + '</h2><p class="tag">' + g.tagline + "</p>" +
        '<div class="cfoot"><span class="play">' + btn + '</span><span class="status">' + status + "</span></div></div></" + tag + ">";
    }
    function draw() {
      main.innerHTML = '<section class="mast"><h1>' + nice(today, { weekday: "long" }) + "&rsquo;s puzzles</h1><p>" +
        nice(today, { day: "numeric", month: "long", year: "numeric" }) + " &middot; New puzzles at midnight, Sydney time</p></section>" +
        '<div class="grid">' + MW_GAMES.map(card).join("") + "</div>" +
        '<footer class="site">' + MW_SITE.footer + '<br><a href="' + MW_SITE.home + '">maladywise.com</a></footer>';
    }
    draw(); window.MW_onTheme = draw;
  }

  // ---------- game page ----------
  function game(id) {
    var g = MW_GAMES.filter(function (x) { return x.id === id; })[0];
    topBar(g);
    var today = sydToday(), dow = new Date(dayNum(today) * 864e5).getUTCDay();
    var st = readStats(g);
    var sp = document.getElementById("splash"), box = document.getElementById("game");
    var q = new URLSearchParams(location.search);
    function start() { sp.hidden = true; box.hidden = false; window.scrollTo(0, 0); }
    if (q.get("date") || q.get("play") !== null) { start(); return; }
    sp.style.setProperty("--accent", accentOf(g));
    sp.innerHTML = '<div class="splash-in"><div class="tile">' + g.icon + "</div><h1>" + g.name + "</h1><p>" + g.tagline + "</p>" +
      '<button class="big" type="button" id="mw-play">' + (st && st.done ? "See results" : "Play") + "</button>" +
      '<div class="meta"><b>' + nice(today, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + "</b><br>Today: " + DIFF[dow] +
      (st && st.s.streak ? " &middot; Streak &#128293; " + st.s.streak : "") + "</div></div>";
    document.getElementById("mw-play").onclick = start;
    window.MW_onTheme = function () { sp.style.setProperty("--accent", accentOf(g)); };
  }

  window.MW = { hub: hub, game: game, modal: modal };
})();
