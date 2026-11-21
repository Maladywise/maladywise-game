/* Nomulous: name the eponymous sign, test, triad or syndrome. 8 a day, the same for everyone that day.
   5 "name it" questions (description -> eponym) and 3 "what does it mean" questions (eponym -> meaning). */
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
    return '<p class="mg-why nm-hist">&#128202; <b>How good is it?</b> Picks up ' + e.sens.v + "% of people with " + G.esc(e.condition) +
      (e.spec ? "; correctly clears " + e.spec.v + "% of people without it." : ".") + ' <a href="/sensitosis/">Play Sensitosis</a></p>';
  }
  var picks = G.shuffle(D, r).slice(0, 8), idx = 0, score = 0, marks = [];
  var Q = picks.map(function (it, i) { return { it: it, type: i % 3 === 2 ? "mean" : "name" }; });
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
        $("nm-why").innerHTML = '<p class="mg-why"><b>' + (ok ? "Named it." : "Not quite.") + " " + G.esc(it[0]) + ":</b> " + G.esc(it[3]) + '.' + (q.type === "mean" ? " " + G.esc(it[2]) : "") + '</p><p class="mg-why nm-hist">&#128220; ' + G.esc(it[4]) + '</p>' + acc(it) +
          '<p style="text-align:right;margin-top:10px"><button class="big mg-next" type="button" id="nm-next">' + (idx + 1 < Q.length ? "Next" : "Finish") + "</button></p>";
        $("nm-next").onclick = function () { idx++; if (idx < Q.length) card(); else end(); };
        $("nm-next").focus();
      };
    });
  }
  var VERDICT = ["Anonymous.", "Barely a footnote.", "A minor eponym.", "Getting a reputation.", "Half the textbook.", "Rounds-ready.", "Professor material.", "Nearly immortal.", "Your name goes on a sign."];
  function end() {
    G.set(KEY, { score: score, marks: marks.join("") });
    $("nm-game").hidden = true; $("nm-end").hidden = false;
    $("nm-final").textContent = score + "/" + Q.length;
    $("nm-verdict").textContent = VERDICT[score];
    $("nm-share").onclick = function () { G.share("Nomulous " + DAY + " 🏛️ " + score + "/" + Q.length + "\n" + marks.join("") + "\nName the sign. maladywise.com/nomulous/"); };
  }
  function start() { idx = 0; score = 0; marks = []; r = G.rng("nomulous-" + DAY); $("nm-s").textContent = 0; $("nm-intro").hidden = true; $("nm-end").hidden = true; $("nm-game").hidden = false; card(); }
  var done = G.get(KEY, null);
  if (done) { $("nm-play").textContent = "Play again"; $("nm-best").innerHTML = "Today: <b>" + done.score + "/8</b> " + (done.marks || ""); }
  $("nm-play").onclick = start; $("nm-again").onclick = start;
})();
