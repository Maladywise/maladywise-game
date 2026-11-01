/* Unspecialist: a free, game-style GP school. Plain JS, no build step.
   Screens: home, huddle, clinic (waiting room), consult, result, inbox, desk (Front desk billing), cheat (MBS cheat sheet). State lives in localStorage ("us-v1"). */
(function () {
  "use strict";

  var KEY = "us-v1";
  var app = document.getElementById("us-app");
  var D = { huddle: [], cases: [], results: [], billing: { scenarios: [], rules: [], note: "", checked: "" } };

  var ROOMS = [
    { id: "consult", name: "Consult room", sub: "Communication" },
    { id: "desk", name: "Front desk", sub: "MBS, admin, letters" },
    { id: "resus", name: "Resus trolley", sub: "Emergencies" },
    { id: "drugs", name: "Drug cupboard", sub: "Prescribing" },
    { id: "kids", name: "Kids' corner", sub: "Children and youth" },
    { id: "treatment", name: "Treatment room", sub: "Procedures" },
    { id: "womens", name: "Women's health room", sub: "Women's health" },
    { id: "mind", name: "Mind room", sub: "Mental health" },
    { id: "chronic", name: "Chronic care room", sub: "Chronic disease, prevention" },
    { id: "outreach", name: "Outreach", sub: "Rural, First Nations, refugee health" }
  ];
  var RANKS = [[0, "Med student"], [150, "Intern"], [400, "Resident"], [800, "Registrar · GPT1"], [1400, "Registrar · GPT2"], [2200, "Registrar · GPT3"], [3200, "Fellow"], [4500, "Senior partner"], [6000, "Unspecialist"]];
  var INTERVALS = [1, 3, 7, 14, 30, 60]; // Leitner box -> days until next review
  var LEVELS = [
    { n: "Level A", item: "item 3", d: "Short, straightforward problem" },
    { n: "Level B", item: "item 23", d: "At least 6 and under 20 minutes" },
    { n: "Level C", item: "item 36", d: "At least 20 and under 40 minutes" },
    { n: "Level D", item: "item 44", d: "At least 40 and under 60 minutes" }
  ];
  var BASE_MIN = 2; // greeting and opening statement
  var CLOCK = 15;
  var INBOX_SECS = 60;

  var SASS = {
    right: ["Correct. Your future self thanks you.", "Nailed it. Smugness permitted, briefly.", "Yes. Your supervisor nods approvingly.", "Correct. Somewhere, a guideline author smiles.", "Right answer. Don't let it go to your head."],
    wrong: ["Not quite. This is why we huddle.", "Oof. Better here than in clinic.", "Nope. Your supervisor sighs, gently.", "Not this time. The guideline would like a word.", "Close-ish. Not close enough."],
    consult: [
      [90, "Textbook. The patient's telling the whole waiting room about you."],
      [75, "Solid consult. A few loose ends; nothing your supervisor would lose sleep over."],
      [55, "Passable. Your supervisor would like a word. A gentle one."],
      [35, "Hmm. The patient will be fine. Mostly. No thanks to some of those choices."],
      [0, "That was technically a consult. Let's call it a learning opportunity."]
    ],
    desk: {
      right: ["Billed right. Your accountant and Medicare both nod.", "Clean claim. Nothing for an auditor to circle.", "Correct. Legitimate money, legitimately claimed.", "Yes. The practice manager wants to clone you."],
      wrong: ["Not quite. That's money on the table or a letter from Medicare.", "Nope. Reception is quietly fixing your claim.", "Not this one. The MBS is a fussy document.", "Close, but billing doesn't do partial credit."],
      end: [[5, "Flawless billing. Suspiciously flawless. Keep the notes that prove it."], [3, "Decent. A few claims would make the practice manager twitch."], [0, "The MBS won this round. It comes back around."]]
    },
    inbox: [[8, "Clean inbox, clean conscience. Flawless."], [6, "Mostly sorted. A couple of results are side-eyeing you."], [4, "Half right. The inbox always wins eventually."], [0, "The inbox ate you alive. It happens to all of us."]]
  };

  // ---------- storage (always wrapped) ----------
  function loadState() { try { var v = JSON.parse(localStorage.getItem(KEY)); if (v && typeof v === "object") return v; } catch (e) {} return {}; }
  var S = loadState();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  ["cards", "items", "days", "outcomes"].forEach(function (k) { if (!S[k] || typeof S[k] !== "object") S[k] = {}; });
  if (!Array.isArray(S.active)) S.active = [];
  if (!Array.isArray(S.pending)) S.pending = [];
  if (typeof S.points !== "number") S.points = 0;

  // ---------- dates (Sydney) ----------
  function sydToday() {
    try {
      var q = /[?&]d=(\d{4}-\d{2}-\d{2})/.exec(location.search); if (q) return q[1];
      return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    } catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  function dayNum(s) { var p = s.split("-"); return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5); }
  function fromNum(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
  function prettyDate(s) { try { return new Date(dayNum(s) * 864e5).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }); } catch (e) { return s; } }
  function weekday(s) { try { return new Date(dayNum(s) * 864e5).toLocaleDateString("en-AU", { weekday: "long", timeZone: "UTC" }); } catch (e) { return ""; } }
  var TODAY = sydToday(), TNUM = dayNum(TODAY);

  // ---------- seeded random ----------
  function hash(str) { var h = 1779033703 ^ str.length; for (var i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return h >>> 0; }
  function rng(seed) { var a = hash(seed); return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(arr, r) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // ---------- helpers ----------
  function esc(x) { return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pick(list, r) { return list[Math.floor((r || Math.random)() * list.length)]; }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function room(id) { return byId(ROOMS, id) || { name: id, sub: "" }; }
  function clamp(n) { return Math.max(0, Math.min(100, Math.round(n))); }
  function host(u) { try { return new URL(u).hostname.replace(/^www\d?\./, ""); } catch (e) { return "source"; } }
  function srcLink(u, label) { return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(label || host(u)) + "</a>"; }
  function go(h) { if (location.hash === h || (h === "" && !location.hash)) render(); else location.hash = h; }
  function addPoints(n) { S.points = Math.max(0, (S.points || 0) + n); }
  function markActive() { if (S.active.indexOf(TODAY) < 0) { S.active.push(TODAY); S.active = S.active.slice(-400); } }
  function streak() {
    var set = {}; S.active.forEach(function (d) { set[d] = 1; });
    var n = set[TODAY] ? TNUM : TNUM - 1, c = 0;
    while (set[fromNum(n)]) { c++; n--; }
    return c;
  }
  function rankInfo() {
    var p = S.points || 0, i = 0;
    for (var k = 0; k < RANKS.length; k++) if (p >= RANKS[k][0]) i = k;
    var next = RANKS[i + 1];
    return { name: RANKS[i][1], next: next, pct: next ? (p - RANKS[i][0]) / (next[0] - RANKS[i][0]) : 1, after: RANKS.slice(i + 2).map(function (r) { return r[1].replace("Registrar · ", ""); }) };
  }
  function itemsForRoom(rid) {
    var ids = [];
    D.huddle.forEach(function (q) { if (q.room === rid) ids.push("h:" + q.id); });
    D.cases.forEach(function (c) { if (c.room === rid) ids.push("c:" + c.id); });
    D.results.forEach(function (x) { if (x.room === rid) ids.push("r:" + x.id); });
    D.billing.scenarios.forEach(function (s) { if (s.room === rid) ids.push("b:" + s.id); });
    return ids;
  }
  function roomProgress(rid) {
    var ids = itemsForRoom(rid), ok = 0;
    ids.forEach(function (id) { if (S.items[id] === 1) ok++; });
    return { ok: ok, n: ids.length, pct: ids.length ? Math.round(100 * ok / ids.length) : 0 };
  }

  // ---------- day state ----------
  function day() {
    if (!S.days[TODAY]) {
      S.days[TODAY] = {};
      var keys = Object.keys(S.days).sort(); while (keys.length > 14) delete S.days[keys.shift()];
    }
    return S.days[TODAY];
  }
  function huddleDay() {
    var d = day();
    if (!d.huddle) {
      var due = D.huddle.filter(function (q) { return S.cards[q.id] && S.cards[q.id].due <= TNUM; })
        .sort(function (a, b) { return S.cards[a.id].due - S.cards[b.id].due; });
      var fresh = shuffle(D.huddle, rng("us-new-order")).filter(function (q) { return !S.cards[q.id]; });
      var list = due.slice(0, 5);
      while (list.length < 5 && fresh.length) list.push(fresh.shift());
      if (list.length < 5) {
        var rest = D.huddle.filter(function (q) { return list.indexOf(q) < 0; }).sort(function (a, b) { return (S.cards[a.id] ? S.cards[a.id].due : 0) - (S.cards[b.id] ? S.cards[b.id].due : 0); });
        while (list.length < 5 && rest.length) list.push(rest.shift());
      }
      d.huddle = { ids: list.map(function (q) { return q.id; }), due: list.map(function (q) { return !!S.cards[q.id]; }), ans: [], done: false };
      save();
    }
    return d.huddle;
  }
  function clinicDay() {
    var d = day();
    if (!d.clinic) {
      var r = rng(TODAY + "|clinic");
      var prim = D.cases.filter(function (c) { return !c.followupOf; });
      var list = [], critFu = false, used = [];
      S.pending.slice().forEach(function (p) {
        var c = byId(D.cases, p.case);
        if (!c || p.from > TNUM || list.length >= 2) return;
        if (c.critical && critFu) return;
        if (c.critical) critFu = true;
        list.push(c); used.push(p);
      });
      S.pending = S.pending.filter(function (p) { return used.indexOf(p) < 0; });
      var excl = list.map(function (c) { return c.followupOf; });
      var avail = prim.filter(function (c) { return excl.indexOf(c.id) < 0; });
      if (!critFu) { var crits = avail.filter(function (c) { return c.critical; }); if (crits.length) list.push(pick(crits, r)); }
      var non = shuffle(avail.filter(function (c) { return !c.critical; }), r);
      while (list.length < 5 && non.length) list.push(non.shift());
      var order = shuffle(list, r), ci = -1;
      order.forEach(function (c, i) { if (c.critical && ci < 0) ci = i; });
      if (ci >= 0) { var cc = order.splice(ci, 1)[0]; order.splice(2 + Math.floor(r() * 3), 0, cc); }
      d.clinic = { ids: order.map(function (c) { return c.id; }), seen: [], res: {}, late: 0, cur: null, last: null,
        back: used.reduce(function (o, p) { o[p.case] = p.date; return o; }, {}) };
      save();
    }
    return d.clinic;
  }
  function deskDay() {
    var d = day(), B = D.billing.scenarios;
    if (!d.desk && B.length) {
      var ck = function (s) { return S.cards["b:" + s.id]; };
      var due = B.filter(function (s) { return ck(s) && ck(s).due <= TNUM; }).sort(function (a, b) { return ck(a).due - ck(b).due; });
      var fresh = shuffle(B, rng("us-desk-order")).filter(function (s) { return !ck(s); });
      var list = due.slice(0, 5);
      while (list.length < 5 && fresh.length) list.push(fresh.shift());
      if (list.length < 5) {
        var rest = B.filter(function (s) { return list.indexOf(s) < 0; }).sort(function (a, b) { return (ck(a) ? ck(a).due : 0) - (ck(b) ? ck(b).due : 0); });
        while (list.length < 5 && rest.length) list.push(rest.shift());
      }
      d.desk = { ids: list.map(function (s) { return s.id; }), due: list.map(function (s) { return !!ck(s); }), ans: [], cur: null, sel: [], done: false };
      save();
    }
    return d.desk || { ids: [], due: [], ans: [], cur: null, sel: [], done: false };
  }
  function inboxDay() {
    var d = day();
    if (!d.inbox) {
      d.inbox = { ids: shuffle(D.results, rng(TODAY + "|inbox")).slice(0, 8).map(function (x) { return x.id; }), ans: {}, start: null, done: false, score: 0 };
      save();
    }
    return d.inbox;
  }

  // ---------- screens ----------
  var timer = null;
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function render(keep) {
    stopTimer();
    var h = (location.hash || "").replace("#", "");
    var fn = { huddle: huddle, clinic: clinic, consult: consult, result: result, inbox: inbox, desk: desk, cheat: cheat }[h] || home;
    app.innerHTML = fn();
    app.setAttribute("data-screen", h || "home");
    if (h === "inbox") startInboxTimer();
    if (keep !== true) window.scrollTo(0, 0);
  }
  function topRow(backHref, backLabel, right) {
    return '<div class="us-top"><a class="us-back" href="' + backHref + '">&larr; ' + esc(backLabel) + "</a>" + (right || "") + "</div>";
  }
  function head(kicker, title, sub) {
    return '<div class="us-head"><span class="us-kick">' + kicker + "</span><h1>" + esc(title) + "</h1>" + (sub ? '<p class="us-sub">' + sub + "</p>" : "") + "</div>";
  }

  function home() {
    var rk = rankInfo(), st = streak();
    var hd = huddleDay(), cl = clinicDay(), ib = inboxDay(), dk = deskDay();
    var dOk = dk.ans.filter(function (a) { return a.ok; }).length;
    var hOk = hd.ans.filter(function (a) { return a.ok; }).length;
    var clSeen = cl.seen.length, clAvg = clSeen ? Math.round(cl.seen.reduce(function (s, id) { return s + (cl.res[id] ? cl.res[id].total : 0); }, 0) / clSeen) : 0;
    function todo(href, name, sub, done) {
      return '<a class="us-todo' + (done ? " done" : "") + '" href="' + href + '"><span><b>' + name + "</b><span>" + sub + '</span></span><span class="us-go">' + (done ? "&#10003; Done" : "Go") + "</span></a>";
    }
    var rooms = ROOMS.map(function (r) {
      var p = roomProgress(r.id);
      return '<div class="us-room"><b>' + esc(r.name) + "</b><span>" + esc(r.sub) + '</span><div class="us-bar"><i style="width:' + p.pct + '%"></i></div><small>' + p.pct + "% · " + p.ok + "/" + p.n + " right</small></div>";
    }).join("");
    return '<div class="us-home">' +
      '<div class="us-brand"><div><span class="us-kick">The free GP school</span><span class="us-title">Unspecialist</span></div>' +
      '<span class="us-pill">' + (st ? st + "-day streak" : "Day 1 starts now") + "</span></div>" +
      '<div class="us-rank"><span class="us-kick">Your rank · ' + (S.points || 0).toLocaleString("en-AU") + " points</span><span class=\"us-rname\">" + esc(rk.name) + "</span>" +
      '<div class="us-rbar"><i style="width:' + Math.round(rk.pct * 100) + '%"></i></div>' +
      "<span>" + (rk.next ? (rk.next[0] - S.points).toLocaleString("en-AU") + " points to " + esc(rk.next[1].replace("Registrar · ", "")) + "." + (rk.after.length ? " Then " + esc(rk.after.join(", ")) + "." : "") : "Top of the tree. The practice is yours.") + "</span></div>" +
      '<div class="us-sec"><span class="us-kick">Today · about 15 minutes</span>' +
      todo("#huddle", "Morning huddle", hd.done ? hOk + "/5 right. Back tomorrow for more." : (hd.ans.length ? "Question " + (hd.ans.length + 1) + " of 5" : "5 questions your brain is due to forget"), hd.done) +
      todo("#clinic", "Clinic Day", clSeen >= cl.ids.length ? "All " + cl.ids.length + " seen · average " + clAvg + "/100" : (clSeen ? clSeen + " of " + cl.ids.length + " seen" : cl.ids.length + " patients waiting. One is a curveball."), clSeen >= cl.ids.length) +
      todo("#inbox", "Results inbox", ib.done ? ib.score + "/8 sorted correctly" : "8 results from yesterday's patients. 60 seconds.", ib.done) +
      (dk.ids.length ? todo("#desk", "Front desk: Bill it right", dk.done ? dOk + "/" + dk.ids.length + " billed right. The accountant is pleased." : (dk.ans.length ? "Claim " + (dk.ans.length + 1) + " of " + dk.ids.length : dk.ids.length + " claims to check. Money on the table, or a letter from Medicare?"), dk.done) : "") +
      '<a class="us-link" href="#cheat">MBS cheat sheet</a>' +
      "</div>" +
      '<div class="us-sec"><span class="us-kick">Your practice · 10 rooms</span><div class="us-rooms">' + rooms + "</div>" +
      '<p class="us-note">Every huddle question, patient and result belongs to a room. Get them right to fill the room.</p></div>' +
      '<button type="button" class="us-link" data-act="help">How it works</button>' +
      "</div>";
  }

  // --- huddle ---
  function huddle() {
    var hd = huddleDay(), i = hd.ans.length;
    var bars = hd.ids.map(function (id, k) { var a = hd.ans[k]; return '<i class="' + (a ? (a.ok ? "ok" : "no") : (k === i ? "now" : "")) + '"></i>'; }).join("");
    if (hd.done || i >= hd.ids.length) {
      var ok = hd.ans.filter(function (a) { return a.ok; }).length;
      return topRow("#", "Home", "") + '<div class="us-steps">' + bars + "</div>" +
        head("Morning huddle · done", ok + " out of 5", ok === 5 ? "Perfect huddle. Insufferable, frankly." : ok >= 3 ? "Good enough to start clinic. The rest will come back around." : "Rough morning. The ones you missed are due again tomorrow.") +
        '<div class="us-card"><b>+' + ok * 10 + " points</b><span>Questions you miss come back sooner. Ones you nail drift further away.</span></div>" +
        '<a class="us-btn" href="#clinic">On to Clinic Day</a><a class="us-btn ghost" href="#">Home</a>';
    }
    var q = byId(D.huddle, hd.ids[i]), r = room(q.room);
    var cur = hd.cur && hd.cur.id === q.id ? hd.cur : null;
    var opts = q.options.map(function (o, k) {
      var cls = "";
      if (cur) { if (k === q.answer) cls = "ok"; else if (k === cur.pick) cls = "no"; else cls = "dim"; }
      return '<button type="button" class="us-opt ' + cls + '" data-act="hpick" data-k="' + k + '"' + (cur ? " disabled" : "") + ">" + esc(o) + "</button>";
    }).join("");
    var fb = "";
    if (cur) {
      var box = S.cards[q.id] ? S.cards[q.id].box : 0, nd = INTERVALS[box];
      fb = '<div class="us-fb ' + (cur.ok ? "ok" : "no") + '"><b>' + esc(cur.v) + "</b><span>" + esc(q.why) + '</span><small>Next review: in ' + nd + " day" + (nd === 1 ? "" : "s") + " · Source: " + srcLink(q.source) + "</small></div>" +
        '<button type="button" class="us-btn" data-act="hnext">' + (i === hd.ids.length - 1 ? "Finish huddle" : "Next question") + "</button>";
    }
    return topRow("#", "Back", '<span class="us-count">Question ' + (i + 1) + " of " + hd.ids.length + "</span>") +
      '<div class="us-steps">' + bars + "</div>" +
      '<span class="us-kick">Morning huddle · ' + esc(r.name) + " · " + (hd.due[i] ? "due again" : "new") + "</span>" +
      '<h1 class="us-q">' + esc(q.q) + "</h1>" + '<div class="us-opts">' + opts + "</div>" + fb;
  }
  function huddlePick(k) {
    var hd = huddleDay(), i = hd.ans.length, q = byId(D.huddle, hd.ids[i]);
    if (!q || (hd.cur && hd.cur.id === q.id)) return;
    var ok = k === q.answer, c = S.cards[q.id] || { box: -1, due: 0 };
    c.box = ok ? Math.min(c.box + 1, INTERVALS.length - 1) : 0;
    if (c.box < 0) c.box = 0;
    c.due = TNUM + INTERVALS[c.box];
    S.cards[q.id] = c;
    S.items["h:" + q.id] = ok ? 1 : 0;
    if (ok) addPoints(10);
    hd.cur = { id: q.id, pick: k, ok: ok, v: pick(ok ? SASS.right : SASS.wrong) };
    save(); render(true);
    var fb = app.querySelector(".us-fb"); if (fb && fb.scrollIntoView) fb.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  function huddleNext() {
    var hd = huddleDay();
    if (!hd.cur) return;
    hd.ans.push({ id: hd.cur.id, pick: hd.cur.pick, ok: hd.cur.ok });
    hd.cur = null;
    if (hd.ans.length >= hd.ids.length) { hd.done = true; markActive(); }
    save(); render();
  }

  // --- clinic ---
  function lateBadge(cl) { return cl.late > 0 ? '<span class="us-late">Running ' + cl.late + " min late</span>" : '<span class="us-late ok">On time</span>'; }
  function clinic() {
    var cl = clinicDay();
    var nextIdx = -1;
    cl.ids.forEach(function (id, i) { if (nextIdx < 0 && cl.seen.indexOf(id) < 0) nextIdx = i; });
    var cards = cl.ids.map(function (id, i) {
      var c = byId(D.cases, id), seen = cl.seen.indexOf(id) >= 0, res = cl.res[id];
      var wait = 4 + i * 5 + cl.late + cl.seen.length * 12;
      var right = seen ? '<span class="us-seen">&#10003; Seen · ' + res.total + "/100</span>" : (i === nextIdx ? '<span class="us-nextl">Next · Start</span>' : '<span class="us-wait">Waiting ' + wait + " min</span>");
      var back = c.followupOf ? '<span class="us-tag">Back again: you saw ' + esc(c.name) + (cl.back && cl.back[id] ? " on " + esc(prettyDate(cl.back[id])) : " before") + "</span>" : "";
      var inner = '<span class="us-prow"><b>' + esc(c.name) + ", " + c.age + "</b>" + right + "</span><span>" + esc(c.blurb) + "</span>" + back;
      return seen ? '<div class="us-pt seen">' + inner + "</div>" : '<button type="button" class="us-pt' + (i === nextIdx ? " next" : "") + '" data-act="see" data-id="' + id + '">' + inner + "</button>";
    }).join("");
    var allDone = cl.seen.length >= cl.ids.length, sum = "";
    if (allDone) {
      var avg = Math.round(cl.seen.reduce(function (s, id) { return s + cl.res[id].total; }, 0) / cl.seen.length);
      sum = '<div class="us-card"><b>Clinic closed. Average ' + avg + "/100.</b><span>" + (cl.late ? "You finished " + cl.late + " minutes late. Reception has thoughts." : "You finished on time. Reception is suspicious.") + '</span></div><a class="us-btn" href="#inbox">On to the results inbox</a>';
    }
    return topRow("#", "Back", lateBadge(cl)) +
      head("Clinic Day · " + esc(weekday(TODAY)), "Waiting room", "Reception's notes. Reception is not always right.") +
      '<div class="us-pts">' + cards + "</div>" + sum +
      '<div class="us-card soft"><span><b>Triage choice.</b> See patients in any order. Someone time-critical left at the back of the queue costs safety points.</span></div>';
  }
  function startConsult(id) {
    var cl = clinicDay();
    if (cl.seen.indexOf(id) >= 0) return;
    if (!cl.cur || cl.cur.id !== id) cl.cur = { id: id, used: [], dx: null, plan: [], safety: null, bill: null, extra: [], tab: "dx" };
    save(); go("#consult");
  }
  function timeUsed(c, used) { var m = BASE_MIN; used.forEach(function (aid) { var a = byId(c.actions, aid); if (a) m += a.min; }); return m; }
  // Procedure minutes run the clock but don't count toward the time tier (no time-banking across services).
  function procMins(c, used) { var m = 0; used.forEach(function (aid) { var a = byId(c.actions, aid); if (a && a.proc) m += a.min; }); return m; }
  function extrasOf(c) { return (c.billing && c.billing.extras) || []; }
  function chipGroup(c, cur, g, label) {
    var has = function (id) { return cur.used.indexOf(id) >= 0; };
    var chips = c.actions.filter(function (a) { return a.g === g && (!a.needs || has(a.needs)); }).map(function (a) {
      var done = has(a.id);
      return '<button type="button" class="us-chip' + (a.flag === "else" ? " else" : "") + (done ? " done" : "") + '" data-act="ask" data-id="' + a.id + '"' + (done ? " disabled" : "") + ">" + esc(a.label) + " · " + (done ? "done" : a.min + " min") + "</button>";
    }).join("");
    return chips ? '<div class="us-grp"><span class="us-glabel">' + label + '</span><div class="us-chips">' + chips + "</div></div>" : "";
  }
  function consult() {
    var cl = clinicDay(), cur = cl.cur;
    if (!cur) return clinic();
    var c = byId(D.cases, cur.id), mins = timeUsed(c, cur.used), left = CLOCK - mins;
    var clock = '<span class="us-clock' + (left < 0 ? " over" : left <= 3 ? " low" : "") + '">' + (left >= 0 ? left + ":00 left" : -left + " min over") + "</span>";
    var notes = cur.used.map(function (aid) {
      var a = byId(c.actions, aid);
      if (a.doorknob) return '<div class="us-door"><span>Doorknob moment</span>' + esc(a.doorknob) + "</div>";
      return '<div class="us-note-i"><b>' + esc(a.label) + "</b>" + esc(a.text || "") + "</div>";
    }).join("");
    var tabs = [["dx", "Diagnosis", cur.dx !== null], ["plan", "Plan", cur.plan.length > 0], ["safety", "Safety-net", cur.safety !== null], ["bill", "Billing", cur.bill !== null]];
    var tabH = '<div class="us-tabs" role="tablist">' + tabs.map(function (t) { return '<button type="button" role="tab" aria-selected="' + (cur.tab === t[0]) + '" class="' + (cur.tab === t[0] ? "on" : "") + (t[2] ? " ok" : "") + '" data-act="tab" data-t="' + t[0] + '">' + (t[2] ? "&#10003; " : "") + t[1] + "</button>"; }).join("") + "</div>";
    var panel = "";
    if (cur.tab === "dx") panel = '<p class="us-plabel">Most likely diagnosis (pick one)</p>' + c.dx.options.map(function (o, k) { return opt("dx", k, o, cur.dx === k); }).join("");
    if (cur.tab === "plan") panel = '<p class="us-plabel">Plan (pick all that apply)</p>' + c.plan.options.map(function (o, k) { return opt("plan", k, o, cur.plan.indexOf(k) >= 0, true); }).join("");
    if (cur.tab === "safety") panel = '<p class="us-plabel">Safety-net advice (pick one)</p>' + c.safety.options.map(function (o, k) { return opt("safety", k, o, cur.safety === k); }).join("");
    if (cur.tab === "bill") {
      var pm = procMins(c, cur.used), ex = extrasOf(c), sel = cur.extra || [];
      panel = '<p class="us-plabel">Time with the patient so far: <b>' + (mins - pm) + " min</b>" + (pm ? " (plus " + pm + " min of procedure, which doesn't count toward the tier)" : "") + ". Bill the time tier that fits.</p>" +
        LEVELS.map(function (l, k) { return opt("bill", k, l.n + " (" + l.item + ") · " + l.d, cur.bill === k); }).join("");
      var exC = ex.map(function (x, k) { return [x, k]; }).filter(function (p) { return p[0].kind !== "order"; }), exO = ex.map(function (x, k) { return [x, k]; }).filter(function (p) { return p[0].kind === "order"; });
      if (exC.length) panel += '<p class="us-plabel us-also">Also claim? Tick any that are legitimate today; leave the rest.</p>' + exC.map(function (p) { return opt("extra", p[1], p[0].label, sel.indexOf(p[1]) >= 0, true); }).join("");
      if (exO.length) panel += '<p class="us-plabel us-also">Pathology request: the lab bills these, not you, but what you write decides whether Medicare pays. Tick what\'s right.</p>' + exO.map(function (p) { return opt("extra", p[1], p[0].label, sel.indexOf(p[1]) >= 0, true); }).join("");
      panel += '<p class="us-billnote">' + billNote() + ' <a href="#cheat">MBS cheat sheet</a></p>';
    }
    var ready = cur.dx !== null && cur.plan.length && cur.safety !== null && cur.bill !== null;
    var fu = c.followup ? esc(c.name) + " may come back. Whatever you decide today follows them." : "Every choice counts, including the ones you skip.";
    return topRow("#clinic", "Waiting room", clock) +
      head("Consult · 15-minute clock" + (cl.late ? ' · <span class="us-latei">running ' + cl.late + " min late</span>" : ""), c.name + ", " + c.age, esc(c.opening)) +
      '<p class="us-who">' + esc(c.who) + "</p>" +
      chipGroup(c, cur, "h", "Ask (each costs time)") + (notes ? '<div class="us-notes">' + notes + "</div>" : "") +
      chipGroup(c, cur, "e", "Examine") + chipGroup(c, cur, "t", "Tests") +
      '<div class="us-decide">' + tabH + '<div class="us-panel" role="tabpanel">' + panel + "</div></div>" +
      '<button type="button" class="us-btn" data-act="finish"' + (ready ? "" : " disabled") + ">" + (ready ? "Finish consult" : "Choose a diagnosis, plan, safety-net and billing") + "</button>" +
      '<div class="us-scored"><span class="us-kick">Scored on</span><div class="us-five"><span>Safety</span><span>Accuracy</span><span>Time</span><span>Patient</span><span>Billing</span></div><span class="us-fu">' + fu + "</span></div>";
  }
  function opt(kind, k, text, on, multi) {
    return '<button type="button" class="us-opt sm' + (on ? " sel" : "") + (multi ? " multi" : "") + '" aria-pressed="' + !!on + '" data-act="choose" data-kind="' + kind + '" data-k="' + k + '">' + esc(text) + "</button>";
  }
  function levelFor(m) { return m < 6 ? 0 : m < 20 ? 1 : m < 40 ? 2 : 3; }
  function scoreCase(c, cur, slot, slots) {
    var has = function (id) { return cur.used.indexOf(id) >= 0; };
    var mins = timeUsed(c, cur.used), missed = [], danger = false;
    var safety = 100, keys = c.actions.filter(function (a) { return a.key; });
    var missKeys = keys.filter(function (a) { return !has(a.id); });
    if (keys.length) safety -= 50 * missKeys.length / keys.length;
    missKeys.forEach(function (a) { missed.push({ t: a.needs && !has(a.needs) ? "\"Anything else?\" then: " + a.label : a.label, w: a.why || "", red: true }); });
    var dxOk = cur.dx === c.dx.answer;
    if (!dxOk) { var dd = c.dx.danger.indexOf(cur.dx) >= 0; if (dd) { safety -= 25; danger = true; } missed.push({ t: "Diagnosis: " + c.dx.options[c.dx.answer], w: "You went with \"" + c.dx.options[cur.dx] + "\"." + (dd ? " That one sends the patient home with the wrong story." : ""), red: dd }); }
    var corr = c.plan.correct, hits = 0, wrong = 0;
    cur.plan.forEach(function (i) {
      if (corr.indexOf(i) >= 0) hits++;
      else { wrong++; var pd = c.plan.danger.indexOf(i) >= 0; if (pd) { safety -= 20; danger = true; } missed.push({ t: (pd ? "Unsafe: " : "Not needed: ") + c.plan.options[i], w: pd ? "This choice could cause harm." : "", red: pd }); }
    });
    corr.forEach(function (i) { if (cur.plan.indexOf(i) < 0) { var crit = (c.plan.critical || []).indexOf(i) >= 0; if (crit) safety -= 15; if (i !== c.plan.explain) missed.push({ t: "Plan: " + c.plan.options[i], w: crit ? "This was a must-do." : "", red: crit }); } });
    if (cur.safety !== c.safety.answer) { var sd = c.safety.danger.indexOf(cur.safety) >= 0; safety -= sd ? 25 : 15; if (sd) danger = true; missed.push({ t: "Safety-net: " + c.safety.options[c.safety.answer], w: "", red: sd }); }
    var lastCrit = !!c.critical && slot === slots - 1;
    if (lastCrit) { safety -= 30; missed.push({ t: "Triage: seen last", w: c.criticalWhy || "", red: true }); }
    var acc = (dxOk ? 50 : 0) + 50 * Math.max(0, hits - wrong) / corr.length;
    c.actions.forEach(function (a) { if (a.flag === "low" && has(a.id)) { acc -= 10; missed.push({ t: "Low-value: " + a.label, w: a.why || "" }); } });
    var over = Math.max(0, mins - CLOCK), time = 100 - 10 * over;
    var parts = [["ice", 35, has("ice")], ["explain", 35, cur.plan.indexOf(c.plan.explain) >= 0], ["else", 15, has("else")]];
    c.actions.forEach(function (a) { if (a.flag === "pc") parts.push(["pc", 15, has(a.id)]); });
    var pw = 0, pg = 0; parts.forEach(function (p) { pw += p[1]; if (p[2]) pg += p[1]; });
    if (!has("ice")) missed.push({ t: "Ideas, concerns, expectations", w: "What they think, fear and want is half of the consult." });
    if (cur.plan.indexOf(c.plan.explain) < 0) missed.push({ t: "Explain the plan and check understanding", w: "Teach-back: ask them to say it back in their own words." });
    c.actions.forEach(function (a) { if (a.flag === "pc" && !has(a.id)) missed.push({ t: a.label, w: "Patient-centred care starts with making communication possible." }); });
    if (!has("else") && !(byId(c.actions, "else") || {}).key) missed.push({ t: "\"Anything else?\"", w: "Two minutes well spent, usually." });
    var att = mins - procMins(c, cur.used), lvl = levelFor(att), bill = cur.bill === lvl ? 100 : (cur.bill === lvl - 1 ? 50 : 0);
    if (cur.bill !== lvl) missed.push({ t: "Billing: " + LEVELS[lvl].n + " (" + LEVELS[lvl].item + ")", w: "You spent " + att + " minutes with the patient" + (att !== mins ? " (procedure time excluded)" : "") + " and chose " + LEVELS[cur.bill].n + (cur.bill > lvl ? ". That's over-claiming, which is the kind of thing that gets audited." : ". Under-claiming is safe but leaves money on the table.") });
    var ex = extrasOf(c), claim = [LEVELS[lvl].n + " (" + LEVELS[lvl].item + ")"];
    if (ex.length) {
      var good = 0, nb = 0, og = 0, no = 0, sel = cur.extra || [], orders = [];
      ex.forEach(function (x, k) {
        var on = sel.indexOf(k) >= 0, ord = x.kind === "order";
        if (x.ok) (ord ? orders : claim).push(x.label);
        if (ord) { no++; if (on === !!x.ok) og++; else missed.push({ t: (x.ok ? "Pathology request, missed: " : "Pathology request, not rebated: ") + x.label, w: x.why || "", red: false }); return; }
        nb++;
        if (on === !!x.ok) good++;
        else missed.push({ t: (x.ok ? "Billing, missed co-claim: " : "Billing, invalid co-claim: ") + x.label, w: x.why || "", red: false });
      });
      if (nb) bill = 0.6 * bill + 40 * good / nb;
      if (no) acc = 0.8 * acc + 20 * og / no;
    }
    var sc = { safety: clamp(safety), acc: clamp(acc), time: clamp(time), pc: clamp(100 * pg / pw), bill: clamp(bill) };
    sc.total = clamp((sc.safety + sc.acc + sc.time + sc.pc + sc.bill) / 5);
    sc.claim = claim; sc.orders = (typeof orders !== 'undefined') ? orders : []; sc.billSrc = ex.map(function (x) { return x.src; }).filter(Boolean);
    sc.mins = mins; sc.over = over; sc.missed = missed; sc.danger = danger; sc.lastCrit = lastCrit;
    sc.critEarly = !!c.critical && slot <= 1;
    return sc;
  }
  function finishConsult() {
    var cl = clinicDay(), cur = cl.cur; if (!cur) return;
    var c = byId(D.cases, cur.id);
    if (cur.dx === null || !cur.plan.length || cur.safety === null || cur.bill === null) return;
    var sc = scoreCase(c, cur, cl.seen.length, cl.ids.length);
    if (c.followup) {
      var missedTrig = c.followup.trigger.some(function (id) { return cur.used.indexOf(id) < 0; });
      sc.fu = missedTrig;
      if (missedTrig && !S.pending.some(function (p) { return p.case === c.followup.case; })) S.pending.push({ case: c.followup.case, from: TNUM + 1, date: TODAY, src: c.id });
    }
    cl.res[c.id] = sc; cl.seen.push(c.id); cl.late += sc.over; cl.cur = null; cl.last = c.id;
    S.items["c:" + c.id] = sc.total >= 70 ? 1 : 0;
    S.outcomes[c.id] = { date: TODAY, total: sc.total, fu: !!sc.fu };
    addPoints(sc.total);
    if (cl.seen.length >= cl.ids.length) markActive();
    save(); go("#result");
  }
  function verdict(total, sc) {
    if (sc.danger && total < 75) return "Some of those choices would make a patient safety meeting very lively. Let's not.";
    for (var i = 0; i < SASS.consult.length; i++) if (total >= SASS.consult[i][0]) return SASS.consult[i][1];
    return "";
  }
  function result() {
    var cl = clinicDay(), id = cl.last;
    var c = id && byId(D.cases, id), sc = id && cl.res[id];
    if (!c || !sc) return clinic();
    var bars = [["Safety", sc.safety], ["Accuracy", sc.acc], ["Time", sc.time], ["Patient", sc.pc], ["Billing", sc.bill]].map(function (b) {
      return '<div class="us-sbar"><span>' + b[0] + '</span><div class="us-bar"><i class="' + (b[1] >= 75 ? "hi" : b[1] >= 50 ? "mid" : "lo") + '" style="width:' + b[1] + '%"></i></div><b>' + b[1] + "</b></div>";
    }).join("");
    var miss = sc.missed.length ? "<ul class=\"us-miss\">" + sc.missed.map(function (m) { return '<li class="' + (m.red ? "red" : "") + '"><b>' + esc(m.t) + "</b>" + (m.w ? "<span>" + esc(m.w) + "</span>" : "") + "</li>"; }).join("") + "</ul>" : '<p class="us-sub">Nothing missed. Show-off.</p>';
    var extra = "";
    if (sc.critEarly) extra += '<div class="us-card good"><b>Good triage.</b><span>You saw the time-critical patient early. That\'s the job.</span></div>';
    if (sc.fu) extra += '<div class="us-card warn"><b>Heads up: ' + esc(c.name) + " will be back.</b><span>You missed a key safety step. Expect them in a future waiting room.</span></div>";
    var allDone = cl.seen.length >= cl.ids.length;
    return topRow("#clinic", "Waiting room", lateBadge(cl)) +
      head("Consult result · " + sc.mins + " min used", c.name + ", " + c.age, "") +
      '<div class="us-score"><div class="us-ring" style="--p:' + sc.total + '"><b>' + sc.total + "</b><small>/100</small></div><p>" + esc(verdict(sc.total, sc)) + '</p><span class="us-plus">+' + sc.total + " points</span></div>" +
      '<div class="us-sbars">' + bars + "</div>" + extra +
      '<div class="us-sec"><span class="us-kick">What you missed</span>' + miss + "</div>" +
      '<div class="us-pearl"><span class="us-kick">Teaching pearl</span><p>' + esc(c.pearl) + "</p></div>" +
      (sc.claim ? '<div class="us-card"><span class="us-kick">The right claim</span><b>' + sc.claim.map(esc).join(" + ") + "</b><span>" + billNote() + "</span></div>" : "") +
      (sc.orders && sc.orders.length ? '<div class="us-card"><span class="us-kick">The right pathology request</span><b>' + sc.orders.map(esc).join("; ") + "</b><span>Billed by the lab, not you. Your request wording decides whether Medicare pays.</span></div>" : "") +
      '<div class="us-sec"><span class="us-kick">Sources</span><ul class="us-src">' + c.sources.concat(sc.billSrc || []).map(function (s) { return "<li>" + srcLink(s.url, s.t) + "</li>"; }).join("") + "</ul></div>" +
      '<a class="us-btn" href="#clinic">' + (allDone ? "Close the clinic" : "Next patient") + "</a>";
  }

  // --- front desk (billing) ---
  function fmtDate(s) { try { return new Date(dayNum(s) * 864e5).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }); } catch (e) { return s; } }
  function billNote() { return esc(D.billing.note || "Billing rules change. Check MBS Online before you bill.") + (D.billing.checked ? " Last checked " + esc(fmtDate(D.billing.checked)) + "." : ""); }
  function scen(id) { return byId(D.billing.scenarios, id); }
  function sameSet(a, b) { if (a.length !== b.length) return false; var x = a.slice().sort(), y = b.slice().sort(); for (var i = 0; i < x.length; i++) if (x[i] !== y[i]) return false; return true; }
  function srcList(list) { return '<ul class="us-src sm">' + (list || []).map(function (s) { return "<li>" + srcLink(s.url, s.t) + "</li>"; }).join("") + "</ul>"; }
  function desk() {
    var dk = deskDay(), n = dk.ids.length, i = dk.ans.length;
    if (!n) return topRow("#", "Home", "") + head("Front desk", "Closed for now", "We couldn't load today's billing scenarios. Refresh to try again.");
    var bars = dk.ids.map(function (id, k) { var a = dk.ans[k]; return '<i class="' + (a ? (a.ok ? "ok" : "no") : (k === i ? "now" : "")) + '"></i>'; }).join("");
    if (dk.done || i >= n) {
      var ok = dk.ans.filter(function (a) { return a.ok; }).length, v = "";
      for (var e = 0; e < SASS.desk.end.length; e++) if (ok >= SASS.desk.end[e][0]) { v = SASS.desk.end[e][1]; break; }
      var list = dk.ans.map(function (a) { var s = scen(a.id); return s ? '<li class="' + (a.ok ? "ok" : "no") + '"><span class="us-rhead"><b>' + esc(s.topic) + '</b><span class="us-verd">' + (a.ok ? "&#10003; Right" : "&#10007; Missed") + "</span></span><span>" + esc(s.q) + "</span><small>" + esc(answerText(s)) + "</small></li>" : ""; }).join("");
      return topRow("#", "Home", '<span class="us-count">Claims lodged</span>') + '<div class="us-steps">' + bars + "</div>" +
        head("Front desk · done", ok + " out of " + n, esc(v)) +
        '<div class="us-card"><b>+' + ok * 10 + " points</b><span>Claims you miss come back sooner. Ones you nail drift further away.</span></div>" +
        '<ul class="us-fbl">' + list + "</ul>" +
        '<div class="us-card soft"><span>' + billNote() + "</span></div>" +
        '<a class="us-btn" href="#cheat">Open the MBS cheat sheet</a><a class="us-btn ghost" href="#">Home</a>';
    }
    var s = scen(dk.ids[i]); if (!s) { dk.ids.splice(i, 1); save(); return desk(); }
    var cur = dk.cur && dk.cur.id === s.id ? dk.cur : null, multi = s.type === "multi";
    var ans = multi ? s.answer : [s.answer], picked = cur ? cur.pick : (multi ? dk.sel : []);
    var opts = s.options.map(function (o, k) {
      var cls = "", on = picked.indexOf(k) >= 0, right = ans.indexOf(k) >= 0;
      if (cur) cls = (right ? (on || !multi ? "ok" : "ok miss") : (on ? "no" : "dim")) + (multi && on ? " on" : "");
      else if (multi && on) cls = "sel";
      return '<button type="button" class="us-opt ' + (multi ? "multi " : "") + cls + '" aria-pressed="' + on + '" data-act="' + (multi ? "btog" : "bpick") + '" data-k="' + k + '"' + (cur ? " disabled" : "") + ">" + esc(o) + (cur && multi && right && !on ? ' <em class="us-missl">(missed)</em>' : "") + "</button>";
    }).join("");
    var fb = "";
    if (cur) {
      fb = '<div class="us-fb ' + (cur.ok ? "ok" : "no") + '"><b>' + esc(cur.v) + "</b><span>" + esc(s.why) + "</span>" +
        '<span class="us-stake"><b>What\'s at stake:</b> ' + esc(s.risk) + "</span>" +
        "<small>Sources (checked " + esc(fmtDate(s.checked)) + "):</small>" + srcList(s.sources) + "</div>" +
        '<button type="button" class="us-btn" data-act="bnext">' + (i === n - 1 ? "Finish" : "Next claim") + "</button>";
    } else if (multi) {
      fb = '<button type="button" class="us-btn" data-act="bsubmit"' + (dk.sel.length ? "" : " disabled") + ">" + (dk.sel.length ? "Lodge the claim" : "Pick at least one") + "</button>";
    }
    return topRow("#", "Back", '<span class="us-count">Claim ' + (i + 1) + " of " + n + "</span>") +
      '<div class="us-steps">' + bars + "</div>" +
      '<span class="us-kick">Front desk · ' + esc(s.topic) + " · " + (dk.due[i] ? "due again" : "new") + "</span>" +
      '<div class="us-cnote"><span>Consult notes</span>' + esc(s.consult) + "</div>" +
      '<h1 class="us-q">' + esc(s.q) + "</h1>" + 
      '<div class="us-opts">' + opts + "</div>" + fb +
      '<p class="us-billnote">' + billNote() + ' <a href="#cheat">MBS cheat sheet</a></p>';
  }
  function answerText(s) { var a = s.type === "multi" ? s.answer : [s.answer]; return "Answer: " + a.map(function (k) { return s.options[k]; }).join("; "); }
  function deskToggle(k) {
    var dk = deskDay(); if (dk.cur || dk.done) return;
    var s = scen(dk.ids[dk.ans.length]); if (!s || s.type !== "multi") return;
    var j = dk.sel.indexOf(k); if (j >= 0) dk.sel.splice(j, 1); else dk.sel.push(k);
    save(); render(true);
  }
  function deskAnswer(choice) {
    var dk = deskDay(), i = dk.ans.length, s = scen(dk.ids[i]);
    if (!s || dk.done || (dk.cur && dk.cur.id === s.id) || !choice.length) return;
    var ok = sameSet(choice, s.type === "multi" ? s.answer : [s.answer]), key = "b:" + s.id, c = S.cards[key] || { box: -1, due: 0 };
    c.box = ok ? Math.min(c.box + 1, INTERVALS.length - 1) : 0; if (c.box < 0) c.box = 0;
    c.due = TNUM + INTERVALS[c.box]; S.cards[key] = c;
    S.items[key] = ok ? 1 : 0;
    if (ok) addPoints(10);
    dk.cur = { id: s.id, pick: choice, ok: ok, v: pick(ok ? SASS.desk.right : SASS.desk.wrong) };
    save(); render(true);
    var fb = app.querySelector(".us-fb"); if (fb && fb.scrollIntoView) fb.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  function deskNext() {
    var dk = deskDay(); if (!dk.cur) return;
    dk.ans.push({ id: dk.cur.id, pick: dk.cur.pick, ok: dk.cur.ok });
    dk.cur = null; dk.sel = [];
    if (dk.ans.length >= dk.ids.length) { dk.done = true; markActive(); }
    save(); render();
  }
  function cheat() {
    var R = D.billing.rules || [], topics = [];
    R.forEach(function (r) { if (topics.indexOf(r.topic) < 0) topics.push(r.topic); });
    var secs = topics.map(function (tp) {
      return '<div class="us-sec"><span class="us-kick">' + esc(tp) + '</span><ul class="us-cheat">' + R.filter(function (r) { return r.topic === tp; }).map(function (r) {
        return "<li><span>" + esc(r.text) + '</span><small>' + r.sources.map(function (s) { return srcLink(s.url, s.t); }).join(" · ") + "</small></li>";
      }).join("") + "</ul></div>";
    }).join("");
    return topRow("#", "Home", "") + head("Front desk · reference", "MBS cheat sheet", "Only rules we've checked against a source. Bill it right: claim what you did, all of what you did, and nothing you didn't.") +
      '<div class="us-card warn"><b>' + billNote() + '</b><span>' + esc(D.billing.premise || "") + ' ' + srcLink("https://www.mbsonline.gov.au/", "MBS Online") + "</span></div>" +
      (R.length ? secs : '<p class="us-sub">The cheat sheet didn\'t load. Refresh to try again.</p>') +
      '<a class="us-btn" href="#desk">Front desk: Bill it right</a><a class="us-btn ghost" href="#">Home</a>';
  }

  // --- inbox ---
  function inboxLeft(ib) { return ib.start ? Math.max(0, INBOX_SECS - Math.floor((Date.now() - ib.start) / 1000)) : INBOX_SECS; }
  function fmt(s) { return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
  function inbox() {
    var ib = inboxDay();
    if (!ib.done && ib.start && inboxLeft(ib) <= 0) finishInbox(true);
    var items = ib.ids.map(function (id) { return byId(D.results, id); });
    if (ib.done) {
      var list = items.map(function (x) {
        var a = ib.ans[x.id], ok = a === x.action;
        return '<li class="' + (ok ? "ok" : "no") + '"><span class="us-rhead"><b>' + esc(x.patient) + " · " + esc(x.test) + '</b><span class="us-verd">' + (ok ? "&#10003; " + x.action : "&#10007; " + (a || "No action") + " → " + x.action) + "</span></span><span class=\"us-rval\">" + esc(x.value) + (x.units ? " " + esc(x.units) : "") + "</span><span>" + esc(x.why) + "</span><small>Source: " + srcLink(x.source) + "</small></li>";
      }).join("");
      var v = ""; for (var i = 0; i < SASS.inbox.length; i++) if (ib.score >= SASS.inbox[i][0]) { v = SASS.inbox[i][1]; break; }
      return topRow("#", "Home", '<span class="us-count">Signed off</span>') +
        head("Results inbox · done", ib.score + " out of 8", esc(v)) +
        '<div class="us-card"><b>+' + ib.score * 5 + ' points</b><span>Unanswered results count as missed. In real life, they still need doing.</span></div>' +
        '<ul class="us-fbl">' + list + "</ul>" + '<a class="us-btn" href="#">Home</a>';
    }
    if (!ib.start) {
      return topRow("#", "Back", '<span class="us-clock">1:00</span>') +
        head("Results inbox · 60 seconds", "Yesterday's results", "File it, recall them, or call them now.") +
        '<div class="us-card soft"><span><b>File</b>: nothing to do. <b>Recall</b>: book them in to discuss or act. <b>Urgent</b>: contact them today.</span></div>' +
        '<button type="button" class="us-btn" data-act="istart">Start the clock</button>';
    }
    var rows = items.map(function (x) {
      var a = ib.ans[x.id];
      return '<div class="us-res"><span class="us-rhead"><b>' + esc(x.patient) + " · " + esc(x.test) + '</b><span class="us-rval">' + esc(x.value) + (x.units ? " " + esc(x.units) : "") + (x.flag ? " (" + x.flag + ")" : "") + "</span></span>" +
        '<div class="us-acts">' + ["File", "Recall", "Urgent"].map(function (n) { return '<button type="button" class="' + n.toLowerCase() + (a === n ? " sel" : "") + '" aria-pressed="' + (a === n) + '" data-act="iact" data-id="' + x.id + '" data-v="' + n + '">' + n + "</button>"; }).join("") + "</div></div>";
    }).join("");
    var n = Object.keys(ib.ans).length;
    return topRow("#", "Back", '<span class="us-clock" id="us-itimer">' + fmt(inboxLeft(ib)) + "</span>") +
      head("Results inbox · 60 seconds", "Yesterday's results", "File it, recall them, or call them now.") +
      '<div class="us-reslist">' + rows + "</div>" +
      '<button type="button" class="us-btn" data-act="idone">Sign off (' + n + "/8)</button>" +
      '<div class="us-card soft"><span><b>Filed something you shouldn\'t have?</b> That\'s how patients slip through. The clock is the point.</span></div>';
  }
  function startInboxTimer() {
    var ib = inboxDay(); if (!ib.start || ib.done) return;
    timer = setInterval(function () {
      var el = document.getElementById("us-itimer"), l = inboxLeft(ib);
      if (el) { el.textContent = fmt(l); el.className = "us-clock" + (l <= 10 ? " over" : l <= 20 ? " low" : ""); }
      if (l <= 0) { finishInbox(true); render(); }
    }, 250);
  }
  function finishInbox() {
    var ib = inboxDay(); if (ib.done) return;
    var s = 0;
    ib.ids.forEach(function (id) { var x = byId(D.results, id), ok = ib.ans[id] === x.action; if (ok) s++; S.items["r:" + id] = ok ? 1 : 0; });
    ib.score = s; ib.done = true; addPoints(s * 5); markActive(); save();
  }

  // ---------- help ----------
  function help() {
    var html = "<p><b>Four short sessions a day</b>, about 15 minutes in all. New set at midnight, Sydney time.</p><ul>" +
      "<li><b>Morning huddle:</b> 5 quick questions. Ones you miss come back sooner; ones you nail drift away (spaced repetition).</li>" +
      "<li><b>Clinic Day:</b> 5 patients, seen in any order. One is time-critical, so triage matters. Each consult has a 15-minute clock: asking, examining and testing all cost minutes. Then pick a diagnosis, plan, safety-net and billing level.</li>" +
      "<li><b>Scoring:</b> Safety, Accuracy, Time, Patient-centred and Billing, each out of 100. Miss a key safety step and that patient may come back on a later day. Unhappier.</li>" +
      "<li><b>Results inbox:</b> 8 results, 60 seconds. File, Recall or Urgent.</li>" +
      "<li><b>Front desk:</b> 5 billing scenarios. Bill it right: the right item, legitimate co-claims, no audit bait. Fills the Front desk room.</li>" +
      "<li><b>Points</b> build your rank, from Med student to Unspecialist. <b>Rooms</b> fill as you get their topics right.</li></ul>" +
      '<p class="us-small">Beta: content is under GP review. Every item links to its source. Education for health professionals, not patient advice. All patients are fictional. Progress is saved on this device only.</p>';
    if (window.MW && MW.modal) MW.modal("How it works", html);
  }

  // ---------- events ----------
  app.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b || b.disabled) return;
    var act = b.getAttribute("data-act");
    if (act === "help") return help();
    if (act === "hpick") return huddlePick(+b.getAttribute("data-k"));
    if (act === "hnext") return huddleNext();
    if (act === "bpick") return deskAnswer([+b.getAttribute("data-k")]);
    if (act === "btog") return deskToggle(+b.getAttribute("data-k"));
    if (act === "bsubmit") return deskAnswer(deskDay().sel.slice());
    if (act === "bnext") return deskNext();
    if (act === "see") return startConsult(b.getAttribute("data-id"));
    var cl = S.days[TODAY] && S.days[TODAY].clinic, cur = cl && cl.cur;
    if (act === "ask" && cur) {
      var id = b.getAttribute("data-id"); if (cur.used.indexOf(id) < 0) cur.used.push(id);
      save(); render(true);
      var last = app.querySelector(".us-notes > :last-child"); if (last && last.scrollIntoView) last.scrollIntoView({ block: "nearest", behavior: "smooth" });
      return;
    }
    if (act === "tab" && cur) { cur.tab = b.getAttribute("data-t"); save(); return render(true); }
    if (act === "choose" && cur) {
      var kind = b.getAttribute("data-kind"), k = +b.getAttribute("data-k");
      if (kind === "plan") { var i = cur.plan.indexOf(k); if (i >= 0) cur.plan.splice(i, 1); else cur.plan.push(k); }
      else if (kind === "extra") { if (!cur.extra) cur.extra = []; var j = cur.extra.indexOf(k); if (j >= 0) cur.extra.splice(j, 1); else cur.extra.push(k); }
      else { cur[kind] = k; var order = ["dx", "plan", "safety", "bill"], nx = order[order.indexOf(kind) + 1]; if (nx && (nx === "plan" ? !cur.plan.length : cur[nx] === null)) cur.tab = nx; }
      save(); render(true); return;
    }
    if (act === "finish") return finishConsult();
    if (act === "istart") { var ib = inboxDay(); if (!ib.start) { ib.start = Date.now(); save(); } return render(); }
    if (act === "iact") { var ib2 = inboxDay(); if (ib2.done) return; ib2.ans[b.getAttribute("data-id")] = b.getAttribute("data-v"); save(); render(true); return; }
    if (act === "idone") { finishInbox(); return render(); }
  });
  window.addEventListener("hashchange", function () { render(); });

  // ---------- boot ----------
  function getJSON(u) { return fetch(u, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); }); }
  Promise.all([getJSON("data/huddle.json?v=2"), getJSON("data/cases.json?v=4"), getJSON("data/results.json?v=2"), getJSON("data/billing.json?v=2").catch(function () { return null; })]).then(function (r) {
    D.huddle = r[0]; D.cases = r[1]; D.results = r[2];
    if (r[3] && Array.isArray(r[3].scenarios)) D.billing = r[3];
    render();
    if (!S.seenHelp) { S.seenHelp = 1; save(); setTimeout(help, 300); }
  }).catch(function () {
    app.innerHTML = '<p class="us-sub">The practice is closed: we couldn\'t load today\'s cases. Check your connection and refresh.</p>';
  });
})();
