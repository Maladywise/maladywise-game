/* Dxtective Gauntlet: Uncle Sherlock's Sunday challenge. Ten past Dxtective cases in a row, the same for everyone that week.
   Pick the diagnosis from four. Fewer clues = more points (clue 1 = 6 points ... clue 6 = 1). One wrong answer ends the run.
   Beat Sherlock's score to win. Open Sundays only (local time); ?t=open opens it for testing. Cases come from /cases/YYYY-MM.json (past dates only). */
(function () {
  "use strict";
  var G = window.MG, $ = G.$;
  var T = new Date(), DAY = G.localDay(T), WEEK = G.week(T), KEY = "mw-gauntlet-" + WEEK;
  var TEST = /[?&]t=open/.test(location.search);
  var OPEN = TEST || T.getDay() === 0;
  var r = G.rng("gauntlet-" + WEEK), TARGET = 30 + Math.floor(r() * 13);
  var SAY = {
    start: ["Ten cases, my dear Dex. One slip and the deerstalker is mine.", "I have solved cases on four continents. Your move.", "I’ll go easy on you. That was a joke."],
    ok1: ["First clue? Hmm. Lucky.", "Elementary. Annoyingly.", "My antlers are twitching."],
    ok: ["Correct. Carry on.", "Adequate.", "I’d have got it a clue earlier.", "Fine. Next."],
    no: ["Ha! The game is up.", "Dear me. Back to the textbooks.", "My antlers win again."],
    win: ["Well played. You may keep the hat.", "I concede. This week."],
    lose: ["Sherlock wins this week. Same time next Sunday?"]
  };
  function line(k) { var a = SAY[k]; return a[Math.floor(Math.random() * a.length)]; }
  var AUTO = 0, CASES = [], SET = [], idx = 0, score = 0, shown = 1, marks = [];

  function months() {
    var out = [], d = new Date(2026, 8, 1);
    while (d <= T) { out.push(d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2)); d.setMonth(d.getMonth() + 1); }
    return out;
  }
  function load(cb) {
    Promise.all(months().map(function (m) { return fetch("/cases/" + m + ".json").then(function (x) { return x.ok ? x.json() : []; }).catch(function () { return []; }); }))
      .then(function (all) { CASES = [].concat.apply([], all).filter(function (c) { return c.date < DAY && c.answer && c.clues && c.clues.length; }); cb(); });
  }
  var STOP = { with: 1, from: 1, this: 1, that: 1, have: 1, after: 1, year: 1, old: 1, over: 1, more: 1, than: 1, been: 1, they: 1, their: 1, about: 1, into: 1, also: 1, both: 1, some: 1, only: 1, when: 1, week: 1, weeks: 1, days: 1, months: 1 };
  function words(c) { var o = {}; (c.clues.map(function (k) { return k.t; }).join(" ") + " " + (c.pearl || "")).toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).forEach(function (w) { if (w.length > 4 && !STOP[w]) o[w] = 1; }); return o; }
  function build() {
    var rr = G.rng("gauntlet-set-" + WEEK);
    SET = G.shuffle(CASES, rr).slice(0, 10).map(function (c) {
      // Distractors: the cases that sound most alike (shared words in clues and pearl), so the options are plausible.
      var mine = words(c), others = G.shuffle(CASES.filter(function (x) { return x.answer !== c.answer; }), rr)
        .map(function (x) { var w = words(x), n = 0; for (var k in w) if (mine[k]) n++; return [n + rr() * 2, x.answer]; })
        .sort(function (a, b) { return b[0] - a[0]; }).slice(0, 3).map(function (x) { return x[1]; });
      return { c: c, opts: G.shuffle([c.answer].concat(others), rr) };
    });
  }
  function hud() { $("gt-n").textContent = (idx + 1) + "/" + SET.length; $("gt-s").textContent = score; $("gt-t").textContent = TARGET; }
  function card(top) {
    var q = SET[idx], c = q.c; hud();
    if (top) { var g = $("gt-game"); window.scrollTo({ top: Math.max(0, g.getBoundingClientRect().top + window.pageYOffset - 90), behavior: "smooth" }); }
    $("gt-q").innerHTML = '<span class="mg-tag">Case ' + (idx + 1) + ' of 10</span>' +
      '<ol class="gt-clues">' + c.clues.slice(0, shown).map(function (k) { return "<li>" + G.esc(k.t) + "</li>"; }).join("") + "</ol>" +
      '<p class="mg-q">What’s the diagnosis? <small class="gt-pts">' + (7 - shown) + " points</small></p>" +
      '<div class="mg-opts">' + q.opts.map(function (o) { return '<button type="button">' + G.esc(o) + "</button>"; }).join("") + "</div>" +
      (shown < c.clues.length ? '<p style="text-align:right"><button class="mg-sbtn" type="button" id="gt-more">Buy another clue · lose a point</button></p>' : "") + '<div id="gt-why"></div>';
    var more = $("gt-more"); if (more) more.onclick = function () { shown++; card(); };
    var bs = $("gt-q").querySelectorAll(".mg-opts button");
    Array.prototype.forEach.call(bs, function (b) {
      b.onclick = function () {
        var ok = b.textContent === c.answer;
        Array.prototype.forEach.call(bs, function (x) { x.disabled = true; if (x.textContent === c.answer) x.classList.add("ok"); });
        if (more) more.disabled = true;
        if (ok) { score += 7 - shown; marks.push(shown === 1 ? "🦊" : "🟢"); } else { b.classList.add("no"); marks.push("🦌"); }
        hud(); $("gt-say").textContent = ok ? line(shown === 1 ? "ok1" : "ok") : line("no");
        var last = !ok || idx + 1 >= SET.length;
        $("gt-why").innerHTML = '<p class="mg-why"><b>' + (ok ? "Solved: " : "It was ") + G.esc(c.answer) + ".</b> " + G.esc(c.pearl || "") + "</p>" +
          '<p style="text-align:right;margin-top:10px"><button class="big mg-next" type="button" id="gt-next">' + (last ? "See the verdict" : "Next case") + "</button></p>";
        var nb = $("gt-next"), left = 5;
        function go() { clearInterval(AUTO); if (last) end(ok && idx + 1 >= SET.length); else { idx++; shown = 1; card(true); } }
        nb.onclick = go; nb.focus({ preventScroll: true });
        clearInterval(AUTO);
        if (!last) { nb.textContent = "Next case (" + left + ")"; AUTO = setInterval(function () { left--; if (left <= 0) go(); else nb.textContent = "Next case (" + left + ")"; }, 1000); }
      };
    });
  }
  function end(all) {
    clearInterval(AUTO);
    var win = score > TARGET, best = G.get(KEY, null);
    if (!best || score > best.score) G.set(KEY, { score: score, marks: marks.join(""), win: win });
    if (win) { var w = G.get("mw-gauntlet-wins", 0) || 0; if (!best || !best.win) G.set("mw-gauntlet-wins", w + 1); }
    $("gt-game").hidden = true; $("gt-end").hidden = false; window.scrollTo({ top: Math.max(0, $("gt-end").getBoundingClientRect().top + window.pageYOffset - 90), behavior: "smooth" });
    $("gt-final").textContent = score + " v " + TARGET;
    $("gt-verdict").textContent = (win ? "You beat Uncle Sherlock. " + line("win") : line("lose")) + (all ? " All ten solved." : " " + (marks.length - 1) + " of 10 solved before the slip.");
    $("gt-share").onclick = function () { G.share("Dxtective Gauntlet " + WEEK + " 🦊 v 🦌\n" + score + " v Sherlock’s " + TARGET + (win ? " 🏆" : "") + "\n" + marks.join("") + "\nmaladywise.com/dxtective-gauntlet/"); };
  }
  function start() {
    idx = 0; score = 0; shown = 1; marks = [];
    $("gt-intro").hidden = true; $("gt-end").hidden = true; $("gt-game").hidden = false;
    $("gt-say").textContent = line("start"); card(true);
  }
  function nextSunday() { var n = new Date(T); n.setDate(n.getDate() + ((7 - n.getDay()) % 7 || 7)); return n.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" }); }

  var done = G.get(KEY, null);
  if (done) $("gt-best").innerHTML = "This week: <b>" + done.score + " v " + TARGET + "</b> " + (done.marks || "") + (done.win ? " 🏆" : "");
  if (!OPEN) {
    $("gt-play").disabled = true;
    $("gt-lock").hidden = false; $("gt-lock").textContent = "Uncle Sherlock visits on Sundays. Next challenge: " + nextSunday() + ", all day, your time.";
    return;
  }
  $("gt-play").textContent = "Loading cases…"; $("gt-play").disabled = true;
  load(function () {
    if (CASES.length < 4) { $("gt-play").textContent = "Couldn’t load cases"; return; }
    build(); $("gt-play").disabled = false; $("gt-play").textContent = done ? "Try again" : "Accept the challenge";
    $("gt-play").onclick = start; $("gt-again").onclick = start;
  });
})();
