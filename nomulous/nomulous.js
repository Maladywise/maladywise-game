/* Nomulous: name the eponymous sign, test, triad or syndrome. 3 a day, the same for everyone that day.
   2 "name it" questions (description -> eponym) and 1 "what does it mean" question (eponym -> meaning).
   Days walk through one fixed shuffled order, so nothing repeats until the whole bank has been used (255 entries = 85 days). */
(function () {
  var G = window.MG, $ = G.$, D = window.NOMULOUS || [];
  var DAY = G.localDay(new Date()), r = G.rng("nomulous-" + DAY), KEY = "mw-nomulous-" + DAY;
  // Accuracy from the Sensitosis bank (sourced figures), matched on the first word of the name, e.g. "Murphy".
  var ACC = {};
  function key(n) { return String(n).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’']s?\b/g, "").replace(/[^a-z ]/g, " ").trim().split(/\s+/)[0]; }
  fetch("/sensitosis/tests.json").then(function (x) { return x.ok ? x.json() : {}; }).then(function (j) {
    var t = j.tests || {}; Object.keys(t).forEach(function (k) { var e = t[k]; if (e.kind === "sign" && e.sens) ACC[key(e.test)] = e; });
  }).catch(function () {});
  function acc(it) {
    var e = ACC[key(it[0])]; if (!e) return "";
    return '<p>&#128202; <b>How good is it?</b> Picks up ' + e.sens.v + "% of people with " + G.esc(e.condition) +
      (e.spec ? "; correctly clears " + e.spec.v + "% of people without it." : ".") + ' <a href="/sensitosis/">Play Sensitosis</a></p>';
  }
  var ORDER = G.shuffle(D, G.rng("nomulous-order-v1")), P = DAY.split("-").map(Number);
  var N = Math.floor(Date.UTC(P[0], P[1] - 1, P[2]) / 864e5), picks = [0, 1, 2].map(function (i) { return ORDER[(N * 3 + i) % ORDER.length]; }), idx = 0, score = 0, marks = [];
  var Q = picks.map(function (it, i) { return { it: it, type: i === 2 ? "mean" : "name" }; });
  var KIND = { sign: "Sign", test: "Test", triad: "Triad", syndrome: "Syndrome" };
  function same(it) { return it[1] === "triad" || it[1] === "syndrome" ? ["triad", "syndrome"] : ["sign", "test"]; }
  function card() {
    var q = Q[idx], it = q.it, pool, opts, right;
    if (q.type === "name") {
      pool = D.filter(function (x) { return x !== it && same(it).indexOf(x[1]) > -1; });
      right = it[0]; opts = G.shuffle([right].concat(G.shuffle(pool, r).filter(function (x) { return x[3] !== it[3]; }).slice(0, 3).map(function (x) { return x[0]; })));
    } else {
      var seen = {}; seen[it[3]] = 1; pool = G.shuffle(D, r).map(function (x) { return x[3]; }).filter(function (m) { if (seen[m]) return false; seen[m] = 1; return true; });
      right = it[3]; opts = G.shuffle([right].concat(pool.slice(0, 3)));
    }
    $("nm-n").textContent = (idx + 1) + "/" + Q.length;
    $("nm-q").innerHTML = '<span class="mg-tag">' + KIND[it[1]] + '</span>' +
      (q.type === "name" ? '<p class="mg-case">' + G.esc(it[2]) + '</p><p class="mg-q">Whose name is on it?</p>'
        : '<p class="nm-name">' + G.esc(it[0]) + '</p><p class="mg-q">What does it point to?</p>') +
      '<div class="mg-opts">' + opts.map(function (o) { return '<button type="button">' + G.esc(o) + "</button>"; }).join("") + '</div><div id="nm-why"></div>';
    var bs = $("nm-q").querySelectorAll(".mg-opts button");
    Array.prototype.forEach.call(bs, function (b) {
      b.onclick = function () {
        var ok = b.textContent === right;
        Array.prototype.forEach.call(bs, function (x) { x.disabled = true; if (x.textContent === right) x.classList.add("ok"); });
        if (!ok) b.classList.add("no"); else score++;
        marks.push(ok ? "🟢" : "🔴"); $("nm-s").textContent = score;
        var fact = (window.NOMULOUS_FACTS || {})[it[0]];
        $("nm-why").innerHTML = '<div class="mg-why nm-one"><p><b>' + (ok ? "Named it." : "Not quite.") + " " + G.esc(it[0]) + ":</b> " + G.esc(it[3]) + "." + (q.type === "mean" ? " " + G.esc(it[2]) : "") + '</p><p>&#128220; ' + G.esc(it[4]) + "</p>" + (fact ? '<p>&#128161; ' + G.esc(fact) + "</p>" : "") + acc(it) + "</div>" +
          '<p style="text-align:right;margin-top:10px"><button class="big mg-next" type="button" id="nm-next">' + (idx + 1 < Q.length ? "Next" : "Finish") + "</button></p>";
        $("nm-next").onclick = function () { idx++; if (idx < Q.length) card(); else end(); };
        $("nm-next").focus();
      };
    });
  }
  var VERDICT = ["Anonymous. Back to the textbook.", "A footnote. Getting there.", "Nearly famous.", "All three named. Your name goes on a sign."];
  function end() {
    G.set(KEY, { score: score, marks: marks.join("") });
    $("nm-game").hidden = true; $("nm-end").hidden = false;
    $("nm-final").textContent = score + "/" + Q.length;
    $("nm-verdict").textContent = VERDICT[score];
    $("nm-share").onclick = function () { G.share("Nomulous " + DAY + " 🏛️ " + score + "/" + Q.length + "\n" + marks.join("") + "\nName the sign. maladywise.com/nomulous/"); };
  }
  function start() { idx = 0; score = 0; marks = []; r = G.rng("nomulous-" + DAY); $("nm-s").textContent = 0; $("nm-intro").hidden = true; $("nm-end").hidden = true; $("nm-game").hidden = false; card(); }
  var done = G.get(KEY, null);
  if (done) { $("nm-play").textContent = "Play again"; $("nm-best").innerHTML = "Today: <b>" + done.score + "/3</b> " + (done.marks || ""); }
  $("nm-play").onclick = start; $("nm-again").onclick = start;
})();
