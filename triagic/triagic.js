/* Triagic: the secret emergency game. Unlocked by typing "quiet" anywhere on the site (the word you never say in ED).
   A 3-minute shift: patients pile into the waiting room, tap one, make the call. Wrong calls, long waits and a full
   waiting room push the chaos meter up. Chaos 100 = shift over. Curveballs interrupt. */
(function () {
  var G = window.MG, $ = G.$, CASES = window.TRIAGIC_CASES || [];
  var SHIFT = 180, MAXWAIT = 6, LIMIT = { 1: 20, 2: 35, 3: 60, 4: 90, 5: 120 }, PTS = { 1: 300, 2: 200, 3: 100, 4: 80, 5: 60 };
  function TC(c) { return c[7] || c[2]; } // true category (sneaky cases are mistriaged at the desk)
  var CURVE = [["🖨️", "The printer has jammed. It’s always the printer."], ["👵", "A relative wants an update. On a patient you haven’t seen."],
    ["🔔", "Fire alarm test. Nobody told you."], ["🔑", "Your password has expired. Please choose one you’ve never used before."], ["🐟", "Someone microwaved fish in the staff room."],
    ["📟", "Pager: ‘Can you please chart Panadol in bed 4?’"], ["🧾", "Coding wants you to clarify a discharge summary from 2019."]];
  var S;
  function deal() { return G.shuffle(CASES.map(function (g) { return Array.isArray(g[0]) ? g[Math.floor(Math.random() * g.length)] : g; })); } // one variant per group per shift
  function reset() { S = { t: SHIFT, chaos: 0, score: 0, seen: 0, saved: 0, wrong: 0, wait: [], deck: deal(), di: 0, next: 1.5, curve: 22 + Math.random() * 12, block: null, open: null, over: false, last: performance.now(), id: 0, loo: 25 + Math.random() * 20, reading: false, caf: 8, nap: 50 + Math.random() * 40, napDone: false, surgeAt: 70 + Math.random() * 40, surge: null, phone: 30 + Math.random() * 15, tired: false }; hideBanner(); }
  function draw() {
    var f = S.t < 15 ? Math.min(1, (15 - S.t) / 2) : 0, gm = $("tr-game");
    gm.style.filter = f ? "blur(" + (f * 2.4).toFixed(2) + "px)" : "";
    $("tr-time").textContent = Math.floor(S.t / 60) + ":" + ("0" + Math.floor(S.t % 60)).slice(-2);
    $("tr-score").textContent = S.score.toLocaleString("en-AU");
    $("tr-saved").textContent = S.saved;
    var c = Math.min(100, Math.round(S.chaos)); $("tr-chaos").style.width = c + "%"; $("tr-chaosn").textContent = c + "%";
    $("tr-chaosbar").className = "tr-bar" + (c >= 70 ? " hot" : c >= 40 ? " warm" : "");
    $("tr-room").innerHTML = S.wait.length ? S.wait.map(function (p) {
      var f = Math.min(1, p.w / LIMIT[TC(p.c)]);
      return '<button type="button" class="tr-pt c' + p.c[2] + (p.bad ? " bad" : "") + '" data-id="' + p.id + '"><span class="tr-em">' + p.c[0] + '</span><span class="tr-tx"><b>Cat ' + p.c[2] + (p.bad ? " ⚠️ deteriorating" : "") + "</b>" + G.esc(p.c[1]) + '</span><i style="width:' + Math.round(f * 100) + '%"></i></button>';
    }).join("") : '<p class="tr-empty">Waiting room empty. Don’t say it.</p>';
  }
  function arrive(force) {
    if (S.di >= S.deck.length) { S.deck = deal(); S.di = 0; }
    var c = S.deck[S.di++];
    if (!force && S.wait.length >= MAXWAIT) { S.chaos += 12; G.toast("🚑 Ambulance ramped. Chaos rising."); return; }
    var p = { id: ++S.id, c: c, w: 0, bad: false }; S.wait.push(p); return p;
  }
  function openCase(id) {
    if (S.block || S.open || S.over) return;
    var p = S.wait.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    S.open = p; var c = p.c, opts = G.shuffle([c[4]].concat(c[5]));
    $("tr-case").innerHTML = '<span class="mg-tag">Cat ' + c[2] + '</span><p class="mg-case"><span class="tr-big">' + c[0] + "</span> " + G.esc(c[1]) + '</p><p class="mg-q">' + G.esc(c[3]) + '</p><div class="mg-opts">' + opts.map(function (o) { return '<button type="button">' + G.esc(o) + "</button>"; }).join("") + '</div><div id="tr-why"></div>';
    $("tr-case").hidden = false; $("tr-room").hidden = true;
    var bs = $("tr-case").querySelectorAll(".mg-opts button");
    Array.prototype.forEach.call(bs, function (b) {
      b.onclick = function () {
        var ok = b.textContent === c[4];
        Array.prototype.forEach.call(bs, function (x) { x.disabled = true; if (x.textContent === c[4]) x.classList.add("ok"); });
        S.seen++; S.wait = S.wait.filter(function (x) { return x !== p; });
        if (ok) { var bonus = Math.max(0, Math.round((1 - p.w / LIMIT[TC(c)]) * 100)); S.score += PTS[TC(c)] * (p.bad ? 0.5 : 1) + bonus; S.saved++; S.chaos = Math.max(0, S.chaos - 6); }
        else { b.classList.add("no"); S.wrong++; S.chaos += 10; if (TC(c) === 1) codeBlue(); else if (Math.random() < 0.4) codeBlack(); }
        (S.log = S.log || []).push({ c: c, pick: b.textContent, ok: ok });
        S.reading = true;
        $("tr-why").innerHTML = '<p class="mg-why"><b>' + (ok ? "Nailed it." : "Not quite: " + G.esc(c[4]) + ".") + "</b> " + G.esc(c[6]) + '</p><p style="text-align:right;margin-top:10px"><button class="big" type="button" id="tr-back">Next patient</button></p>';
        $("tr-back").onclick = closeCase; $("tr-back").focus();
        draw();
      };
    });
  }
  function banner(html, ms, onTimeout) {
    var el = $("tr-bonus"); el.innerHTML = html; el.hidden = false; clearTimeout(el._t);
    el._t = setTimeout(function () { el.hidden = true; if (onTimeout && !S.over) onTimeout(); }, ms); return el;
  }
  function hideBanner() { var el = $("tr-bonus"); if (el) { clearTimeout(el._t); el.hidden = true; } }
  function busy() { var el = $("tr-bonus"); return el && !el.hidden; }
  function caffeine() { // 1: clear the waiting room, grab a drink
    S.caf = 30; banner('<button type="button" class="tr-bb" id="tr-caf">&#9749; Diet cola, triple shot. <b>Tap!</b></button>', 5000);
    $("tr-caf").onclick = function () { hideBanner(); S.score += 50; S.chaos = Math.max(0, S.chaos - 10); G.toast("☕ Caffeinated. +50, chaos down 10%."); draw(); };
  }
  function napOffer() { // 2: a gamble
    S.napDone = true;
    banner('<span>&#128715; The couch in the tea room is free&hellip;</span><button type="button" class="tr-bb" id="tr-nap">Power nap (chaos &minus;20%, frozen 3s)</button><button type="button" class="tr-bb ghost" id="tr-nonap">Keep going</button>', 7000);
    $("tr-nonap").onclick = hideBanner;
    $("tr-nap").onclick = function () {
      hideBanner(); S.chaos = Math.max(0, S.chaos - 20); S.block = true; var n = 3, el = $("tr-curve"); el.hidden = false;
      function zz() { el.innerHTML = '<div class="tr-cb"><span>&#128564;</span><p>Power nap&hellip; ' + n + "</p><p class=\"mg-small\">The waiting room doesn’t sleep.</p></div>"; }
      zz(); var iv = setInterval(function () { n--; if (n <= 0 || S.over) { clearInterval(iv); el.hidden = true; S.block = null; draw(); } else zz(); }, 1000);
    };
  }
  function surge() { // 6: three at once, clear them in 20 seconds
    var ids = []; for (var k = 0; k < 3; k++) { var p = arrive(true); if (p) ids.push(p.id); }
    S.surge = { ids: ids, until: S.t - 20 }; G.toast("🚑🚑🚑 Three ambulances at once. Clear them in 20 seconds for a bonus.", 3200); draw();
  }
  function phone() { // 7: answer within 5 seconds
    S.phone = 35 + Math.random() * 15;
    banner('<span>&#128222; Bed manager on line 1</span><button type="button" class="tr-bb" id="tr-ph">Answer</button>', 5000, function () { S.chaos += 5; G.toast("📵 Missed call. Chaos +5%."); });
    $("tr-ph").onclick = function () { hideBanner(); S.score += 25; G.toast("📞 Two beds promised. Maybe. +25"); draw(); };
  }
  function rainPoo() {
    for (var k = 0; k < 28; k++) { var d = document.createElement("span"); d.className = "tr-poo"; d.textContent = "💩"; d.style.left = Math.random() * 100 + "vw"; d.style.animationDelay = (Math.random() * .8).toFixed(2) + "s"; d.style.fontSize = (22 + Math.random() * 20) + "px"; document.body.appendChild(d); setTimeout(function (x) { return function () { x.remove(); }; }(d), 3200); }
  }
  function bathroom() { // urgent bathroom: tap in time, or Code Brown
    S.loo = 45 + Math.random() * 20; var bed = 1 + Math.floor(Math.random() * 12);
    banner('<span>&#128701; Bed ' + bed + ' needs the bathroom. <b>Right now.</b></span><button type="button" class="tr-bb" id="tr-loo">Grab a bedpan</button>', 4000, function () {
      S.chaos += 8; rainPoo(); G.toast("💩 Code Brown in bed " + bed + ". Chaos +8%.", 2600); draw(); });
    $("tr-loo").onclick = function () { hideBanner(); S.score += 30; G.toast("🚽 Made it. Dignity preserved. +30"); draw(); };
  }
  function codeBlack() { // an unhappy patient after a bad call
    S.block = true; var el = $("tr-curve"); el.hidden = false; S.chaos += 8;
    el.innerHTML = '<div class="tr-cb tr-black"><span>&#128544;</span><p>Code Black. The patient is not happy with that call. Security is on the way.</p></div>';
    setTimeout(function () { el.hidden = true; S.block = null; draw(); }, 2500);
  }
  function codeBlue() { // a wrong call on a Cat 1: they arrest. Ten compressions to get them back.
    S.block = true; var el = $("tr-curve"), n = 0; el.hidden = false; S.chaos += 12;
    function paint() { el.innerHTML = '<div class="tr-cb tr-blue"><span>&#129728;</span><p>Code Blue! The patient has arrested.</p><button class="big" type="button" id="tr-cpr">Push hard and fast (' + n + '/10)</button></div>'; $("tr-cpr").onclick = function () { n++; if (n >= 10) { el.innerHTML = '<div class="tr-cb"><span>&#128147;</span><p>Pulse is back. Phew.</p></div>'; setTimeout(function () { el.hidden = true; S.block = null; draw(); }, 1200); } else paint(); }; }
    paint();
  }
  function closeCase() { S.reading = false; S.open = null; $("tr-case").hidden = true; $("tr-room").hidden = false; draw(); }
  function curveball() {
    var cb = CURVE[Math.floor(Math.random() * CURVE.length)], need = 3;
    S.block = true; var el = $("tr-curve"); el.hidden = false;
    el.innerHTML = '<div class="tr-cb"><span>' + cb[0] + "</span><p>" + G.esc(cb[1]) + '</p><button class="big" type="button" id="tr-cbb">Deal with it (3)</button></div>';
    $("tr-cbb").onclick = function () { need--; if (need <= 0) { el.hidden = true; S.block = null; } else this.textContent = "Deal with it (" + need + ")"; };
  }
  function tick(now) {
    if (S.over) return;
    var dt = Math.min(0.25, (now - S.last) / 1000); S.last = now;
    if (!document.hidden && !S.reading) {
      S.t -= dt;
      S.next -= dt; if (S.next <= 0) { arrive(); var prog = 1 - S.t / SHIFT; S.next = 8.5 - 4 * prog + Math.random() * 2; }
      S.curve -= dt; if (S.curve <= 0 && !S.block) { curveball(); S.curve = 25 + Math.random() * 15; }
      S.wait.forEach(function (p) { if (p === S.open) return; p.w += dt; if (!p.bad && p.w > LIMIT[TC(p.c)]) { p.bad = true; S.chaos += 12; G.toast("⚠️ A Cat " + p.c[2] + " patient is deteriorating in the waiting room."); } });
      S.chaos = Math.max(0, S.chaos - dt * 0.4);
      var played = SHIFT - S.t;
      S.caf -= dt; if (S.caf <= 0 && !S.wait.length && !S.open && !S.block && !busy() && S.t > 6) caffeine();
      if (!S.napDone && played > S.nap && !S.block && !busy() && !S.open) napOffer();
      if (S.surgeAt && played > S.surgeAt && !S.block) { S.surgeAt = 0; surge(); }
      if (S.surge) { var left = S.surge.ids.filter(function (id) { return S.wait.some(function (x) { return x.id === id; }) || (S.open && S.open.id === id); }).length;
        if (!left) { S.surge = null; S.score += 300; G.toast("🏅 Surge cleared! +300"); draw(); } else if (S.t < S.surge.until) { S.surge = null; G.toast("Surge bonus missed."); } }
      S.phone -= dt; if (S.phone <= 0 && !S.block && !busy()) phone();
      S.loo -= dt; if (S.loo <= 0 && !S.block && !busy()) bathroom();
      if (!S.tired && S.t < 15) { S.tired = true; G.toast("😵 Hour 12 of your shift. Your eyes are going…", 2600); }
      if (Math.floor(S.t * 4) !== Math.floor((S.t + dt) * 4)) draw();
      if (S.chaos >= 100) return end(false);
      if (S.t <= 0) return end(true);
    }
    requestAnimationFrame(tick);
  }
  var TITLES = [[0, "Did you even clock on?"], [600, "Intern energy"], [1500, "Steady hands"], [3000, "Resus regular"], [4500, "Trauma team leader"], [6500, "ED legend. Somebody get this one a coffee."]];
  function end(survived) {
    S.over = true; hideBanner(); $("tr-game").style.filter = ""; $("tr-game").hidden = true; $("tr-end").hidden = false; $("tr-curve").hidden = true;
    var best = G.get("mw-triagic-best", 0); if (S.score > best) G.set("mw-triagic-best", S.score);
    var title = TITLES.filter(function (x) { return S.score >= x[0]; }).pop()[1];
    $("tr-etitle").textContent = survived ? "Shift survived." : "The department fell apart.";
    $("tr-escore").textContent = S.score.toLocaleString("en-AU");
    $("tr-emsg").textContent = title + " " + S.saved + " of " + S.seen + " patients sorted" + (survived ? "." : ", then chaos won.");
    $("tr-ebest").textContent = S.score > best ? "New personal best!" : "Your best: " + Math.max(best, S.score).toLocaleString("en-AU");
    var L = S.log || [], rv = $("tr-review"); if (!rv) { rv = document.createElement("div"); rv.id = "tr-review"; rv.className = "tr-rev"; $("tr-end").appendChild(rv); }
    rv.innerHTML = L.length ? '<p class="mg-q" style="margin-top:14px">Your shift, patient by patient</p>' + L.map(function (x, i) {
      return '<details class="tr-rv' + (x.ok ? " ok" : " no") + '"><summary><span>' + (x.ok ? "&#9989;" : "&#10060;") + "</span> " + x.c[0] + " " + G.esc(x.c[3]) + "</summary>" +
        '<p class="mg-case">' + G.esc(x.c[1]) + "</p><p><b>Answer:</b> " + G.esc(x.c[4]) + (x.ok ? "" : "<br><b>You said:</b> " + G.esc(x.pick)) + '</p><p class="mg-why">' + G.esc(x.c[6]) + "</p></details>";
    }).join("") : "";
    $("tr-share").onclick = function () { G.share("Triagic 🚨 " + (survived ? "Survived the shift" : "Chaos won") + "\n" + S.score.toLocaleString("en-AU") + " points, " + S.saved + "/" + S.seen + " sorted\nYou said the Q word, didn’t you? maladywise.com"); };
  }
  function start() { reset(); S.log = []; var rv0 = $("tr-review"); if (rv0) rv0.innerHTML = ""; $("tr-intro").hidden = true; $("tr-end").hidden = true; $("tr-game").hidden = false; closeCase(); arrive(); arrive(); draw(); S.last = performance.now(); requestAnimationFrame(tick); }
  $("tr-room").addEventListener("click", function (e) { var b = e.target.closest(".tr-pt"); if (b) openCase(+b.getAttribute("data-id")); });
  $("tr-play").onclick = start; $("tr-again").onclick = start;
  var now = new Date(), OPEN = G.get("mw-open-quiet", "") === (function () { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); })() || now.getHours() >= 16 || /[?&]t=open/.test(location.search);
  if (!OPEN) {
    $("tr-play").disabled = true;
    var nx = new Date(now); nx.setHours(16, 0, 0, 0); if (nx <= now) nx.setDate(nx.getDate() + 1);
    var tick2 = function () { var ms = nx - new Date(); if (ms <= 0) return location.reload(); var h = Math.floor(ms / 36e5), m = Math.floor(ms / 6e4) % 60;
      $("tr-lock").innerHTML = "&#128274; The waiting room opens 4pm to midnight, your time. <b>" + h + "h " + m + "m</b> to go."; };
    $("tr-lock").hidden = false; tick2(); setInterval(tick2, 30000);
  }
  var best = G.get("mw-triagic-best", 0); if (best) $("tr-best").innerHTML = "Your best shift: <b>" + best.toLocaleString("en-AU") + "</b>";
})();
