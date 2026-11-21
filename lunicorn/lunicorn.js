/* Lunicorn: Ziggy’s full-moon game. Opens for the whole local calendar day of the full moon (24 hours), or any time
   after the player types "lunar". Rainbow set normally; a Blue moon set on the second full moon of a calendar month; a Blood moon set on a total lunar eclipse. */
(function () {
  var G = window.MG, $ = G.$, L = window.LUNICORN;
  var SYN = 29.530588853, EPOCH = Date.UTC(2000, 0, 6, 18, 14) / 864e5; // a known new moon, in days
  var ECLIPSES = ["2028-12-31T16:52Z", "2029-06-26T03:22Z", "2029-12-20T22:42Z", "2032-04-25T15:13Z", "2032-10-18T19:02Z", "2033-04-14T19:13Z", "2033-10-08T10:55Z"].map(function (s) { return Date.parse(s); }); // total lunar eclipses (NASA)
  function fullNear(ms) { var d = ms / 864e5, k = Math.round((d - EPOCH) / SYN - 0.5); return (EPOCH + (k + 0.5) * SYN) * 864e5; }
  function nextFull(ms) { var f = fullNear(ms); return f < ms - 864e5 ? f + SYN * 864e5 : f; }
  function sameMonth(a, b) { a = new Date(a); b = new Date(b); return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth(); }
  function mode(now) {
    var q = new URLSearchParams(location.search).get("t"); // testing: ?t=open | blue | blood
    if (q === "open") return { open: true, kind: "rainbow", fm: now };
    if (q === "blue") return { open: true, kind: "blue", fm: now };
    if (q === "blood") return { open: true, kind: "blood", fm: now };
    var fm = fullNear(now.getTime()), near = new Date(fm).toDateString() === now.toDateString(), code = !!G.get("mw-secret-lunar", 0);
    var kind = ECLIPSES.some(function (e) { return Math.abs(e - fm) < 864e5; }) ? "blood" : sameMonth(fm, fm - SYN * 864e5) ? "blue" : "rainbow";
    return { open: near || code, kind: near ? kind : "rainbow", fm: fm, near: near };
  }
  var NOW = new Date(), M = mode(NOW);
  var THEME = {
    rainbow: { h: "Lunicorn", kick: "🌕 Full moon today", lede: "Ziggy only comes out under a full moon. Ten colours of medicine: name what’s behind each one.", n: 10 },
    blue: { h: "Blue Moon Lunicorn", kick: "🔵 Blue moon today", lede: "A second full moon this month. Once in a blue moon, Ziggy turns blue. Ten blue things in medicine.", n: 10 },
    blood: { h: "Blood Moon Lunicorn", kick: "🔴 Blood moon today", lede: "A total lunar eclipse turns the moon red. So does Ziggy. Ten red things in medicine.", n: 10 }
  }[M.kind];
  document.documentElement.setAttribute("data-moon", M.kind);
  var seed = "lunicorn-" + G.localDay(new Date(M.fm)) + "-" + M.kind, KEY = "mw-lunicorn-" + G.localDay(new Date(M.fm));
  var SET = G.shuffle(L[M.kind], G.rng(seed)).slice(0, THEME.n), idx = 0, score = 0, marks = [];
  $("lu-h1").textContent = THEME.h; $("lu-kick").textContent = THEME.kick; $("lu-lede").textContent = THEME.lede;
  if (M.open && M.near === false) $("lu-kick").textContent = "🌙 You said the magic word";

  function closed() {
    $("lu-play").disabled = true; $("lu-kick").textContent = "🌑 Ziggy is hiding";
    var n = nextFull(NOW.getTime()), d = new Date(n);
    $("lu-lede").textContent = "Ziggy only comes out on the day of a full moon, where you are. The rest of the time, this page is just a page.";
    $("lu-lock").innerHTML = "🔒 Next full moon: <b>" + d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" }) + "</b>, all day.";
  }
  function card() {
    var c = SET[idx], opts = G.shuffle([c[2]].concat(c[3]));
    $("lu-n").textContent = (idx + 1) + "/" + SET.length;
    $("lu-q").innerHTML = '<span class="lu-chip" style="background:' + c[0] + '"></span><p class="mg-case">' + G.esc(c[1]) + '</p><p class="mg-q">What’s behind it?</p><div class="mg-opts">' + opts.map(function (o) { return '<button type="button">' + G.esc(o) + "</button>"; }).join("") + '</div><div id="lu-why"></div>';
    var bs = $("lu-q").querySelectorAll(".mg-opts button");
    Array.prototype.forEach.call(bs, function (b) {
      b.onclick = function () {
        var ok = b.textContent === c[2];
        Array.prototype.forEach.call(bs, function (x) { x.disabled = true; if (x.textContent === c[2]) x.classList.add("ok"); });
        if (!ok) b.classList.add("no"); else score++;
        marks.push(ok ? "🦄" : "▫️");
        var stripe = $("lu-stripe").children[idx]; if (stripe) { stripe.style.background = ok ? c[0] : "transparent"; }
        $("lu-s").textContent = score;
        $("lu-why").innerHTML = '<p class="mg-why"><b>' + (ok ? "Magic." : "Not quite: " + G.esc(c[2]) + ".") + "</b> " + G.esc(c[4]) + '</p><p style="text-align:right;margin-top:10px"><button class="big" type="button" id="lu-next">' + (idx + 1 < SET.length ? "Next colour" : "See your rainbow") + "</button></p>";
        $("lu-next").onclick = function () { idx++; if (idx < SET.length) card(); else end(); }; $("lu-next").focus();
      };
    });
  }
  function end() {
    G.set(KEY, score); G.flag("lunicorn"); if (M.kind !== "rainbow") G.flag("lunicorn-" + M.kind);
    $("lu-game").hidden = true; $("lu-end").hidden = false;
    $("lu-final").textContent = score + "/" + SET.length;
    $("lu-verdict").textContent = score === SET.length ? "A full rainbow. Ziggy is sparkling." : score >= 7 ? "Ziggy is impressed. Mostly." : score >= 4 ? "Some colours, some grey. Classic full moon." : "Ziggy has gone back into the clouds.";
    $("lu-share").onclick = function () { G.share(THEME.h + " 🌕🦄 " + score + "/" + SET.length + "\n" + marks.join("") + "\nOnly on full-moon nights. maladywise.com/lunicorn/"); };
  }
  function start() {
    $("lu-intro").hidden = true; $("lu-game").hidden = false;
    $("lu-stripe").innerHTML = SET.map(function () { return "<i></i>"; }).join("");
    card();
  }
  if (!M.open) closed();
  else { var prev = G.get(KEY, null); if (prev != null) $("lu-best").innerHTML = "Tonight: <b>" + prev + "/" + SET.length + "</b>. Play again?"; }
  $("lu-play").onclick = function () { if (!$("lu-play").disabled) start(); };
  $("lu-again").onclick = function () { location.reload(); };
})();
