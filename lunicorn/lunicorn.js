/* Lunicorn: Ziggy’s full-moon game. Opens for the whole local calendar day of the full moon (24 hours), or any time
   after the player types "lunar". Rainbow set normally; a Blue moon set on the second full moon of a calendar month; a Blood moon set on a total lunar eclipse. */
(function () {
  var G = window.MG, $ = G.$, L = window.LUNICORN;
  var SYN = 29.530588853, EPOCH = Date.UTC(2000, 0, 6, 18, 14) / 864e5; // a known new moon, in days
  var ECLIPSES = ["2028-12-31T16:52Z", "2029-06-26T03:22Z", "2029-12-20T22:42Z", "2032-04-25T15:13Z", "2032-10-18T19:02Z", "2033-04-14T19:13Z", "2033-10-08T10:55Z"].map(function (s) { return Date.parse(s); }); // total lunar eclipses (NASA)
  // Early chances (22 Nov 2026): supermoons alternate blue / blood sets; partial and penumbral lunar eclipses get the blood set.
  var SUPER = ["2026-11-25", "2026-12-24", "2027-01-22", "2028-02-11", "2028-03-11", "2029-03-01", "2029-04-28", "2030-04-18", "2030-05-17", "2030-06-16"];
  var PARTIALS = ["2027-02-20T23:13Z", "2027-07-18T16:03Z", "2027-08-17T07:14Z", "2028-01-12T04:13Z", "2028-07-06T18:20Z"].map(function (s) { return Date.parse(s); });
  var FMLIST = "2601031002 2602012209 2603031137 2604020211 2605011723 2605310845 2606292356 2607291435 2608280418 2609261648 2610260411 2611241453 2612240128 2701221217 2702202323 2703221043 2704202227 2705201058 2706190044 2707181544 2708170728 2709152303 2710151346 2711140325 2712131608 2801120402 2802101503 2803110105 2804091026 2805081948 2806070608 2807061810 2808050809 2809032347 2810031624 2811020917 2812020140 2812311648 2901300603 2902281710 2903300226 2904281036 2905271837 2906260322 2907251335 2908240151 2909221629 2910220927 2911210402 2912202246 3001191554 3002180619 3003191756 3004180319 3005171119 3006151840 3007150211 3008131044 3009112117 3010111046 3011100330 3012092240 3101081825 3102071246 3103090429 3104071721 3105070339 3106051158 3107041901 3108030145 3109010920 3109301857 3110300732 3111282318 3112281732 3201271252 3202260743 3203270046 3204251509 3205250237 3206231132 3207221851 3208210146 3209190930 3210181857 3211170641 3212162048 3301151306 3302140704 3303160137 3304141917 3305141042 3306122319 3307120928 3308101807 3309090220 3310081057 3311062031 3312060721 3401041946 3402031004 3403050209 3404031918 3405031215 3406020353 3407011744 3407310554 3408291649 3409280256 3410271242 3411252231 3412250854 3501232016 3502220853 3503232241 3504221320 3505220425 3506201937 3507201036 3508190100 3509171423 3510170235 3511151348 3512150032 3601131115".split(" "); // true full moons, UTC yymmddhhmm (PyEphem), 2026–2035
  var fullNear = function(ms){var L=FMLIST,b=null;for(var i=0;i<L.length;i++){var s=L[i],t=Date.UTC(2000+ +s.slice(0,2),+s.slice(2,4)-1,+s.slice(4,6),+s.slice(6,8),+s.slice(8,10));if(b===null||Math.abs(t-ms)<Math.abs(b-ms))b=t;}if(b!==null&&Math.abs(b-ms)<16*864e5)return b;var SYN=29.530588853,EP=Date.UTC(2000,0,6,18,14)/864e5,k=Math.round((ms/864e5-EP)/SYN-0.5);return(EP+(k+0.5)*SYN)*864e5;}
  function nextFull(ms) { var f = fullNear(ms); return f < ms - 864e5 ? fullNear(f + SYN * 864e5) : f; }
  function sameMonth(a, b) { a = new Date(a); b = new Date(b); return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth(); }
  function mode(now) {
    var q = new URLSearchParams(location.search).get("t"); // testing: ?t=open | blue | blood
    if (q === "open") return { open: true, kind: "rainbow", fm: now };
    if (q === "blue") return { open: true, kind: "blue", fm: now };
    if (q === "blood") return { open: true, kind: "blood", fm: now };
    var fm = fullNear(now.getTime()), near = new Date(fm).toDateString() === now.toDateString(), code = G.get("mw-open-lunar", "") === (function () { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); })();
    var day = G.localDay(new Date(fm)), why = "";
    var kind = ECLIPSES.some(function (e) { return Math.abs(e - fm) < 864e5; }) ? "blood" : sameMonth(fm, fm - SYN * 864e5) ? "blue" : "rainbow";
    if (kind === "rainbow" && PARTIALS.some(function (e) { return Math.abs(e - fm) < 864e5; })) { kind = "blood"; why = "eclipse"; }
    if (kind === "rainbow" && SUPER.indexOf(day) >= 0) { kind = SUPER.indexOf(day) % 2 ? "blood" : "blue"; why = "super"; }
    return { open: near || code, kind: near ? kind : "rainbow", why: near ? why : "", fm: fm, near: near };
  }
  var NOW = new Date(), M = mode(NOW);
  var THEME = {
    rainbow: { h: "Lunicorn", kick: "🌕 Full moon today", lede: "Ziggy only comes out under a full moon. Ten colours of medicine: name what’s behind each one.", n: 10 },
    blue: { h: "Blue Moon Lunicorn", kick: "🔵 Blue moon today", lede: "A second full moon this month. Once in a blue moon, Ziggy turns blue. Ten blue things in medicine.", n: 10 },
    blood: { h: "Blood Moon Lunicorn", kick: "🔴 Blood moon today", lede: "A total lunar eclipse turns the moon red. So does Ziggy. Ten red things in medicine.", n: 10 }
  }[M.kind];
  if (M.why === "super") THEME = { h: M.kind === "blue" ? "Supermoon Lunicorn" : "Supermoon Lunicorn", kick: "🌕 Supermoon today", lede: M.kind === "blue" ? "The moon is at its closest and Ziggy has turned blue for the night. Ten blue things in medicine. A rare chance at the Blue Moon badge." : "The moon is at its closest and Ziggy has gone red for the night. Ten red things in medicine. A rare chance at the Blood Moon badge.", n: 10 };
  if (M.why === "eclipse") THEME = { h: "Eclipse Lunicorn", kick: "🌒 Lunar eclipse today", lede: "Earth’s shadow brushes the moon tonight, and Ziggy blushes red. Ten red things in medicine. A rare chance at the Blood Moon badge.", n: 10 };
  document.documentElement.setAttribute("data-moon", M.kind);
  var seed = "lunicorn-" + G.localDay(new Date(M.fm)) + "-" + M.kind, KEY = "mw-lunicorn-" + G.localDay(new Date(M.fm));
  // Rainbow: a fixed shuffled order, worked through 10 at a time, one block per full moon (120 colours = a year without repeats).
  var moonNo = Math.round((M.fm / 864e5 - EPOCH) / SYN - 0.5), ORDER = G.shuffle(L.rainbow, G.rng("lunicorn-order-v1")), blocks = Math.floor(ORDER.length / THEME.n);
  var SET = M.kind === "rainbow" ? ORDER.slice(((moonNo % blocks) + blocks) % blocks * THEME.n, ((moonNo % blocks) + blocks) % blocks * THEME.n + THEME.n) : G.shuffle(L[M.kind], G.rng(seed)).slice(0, THEME.n), idx = 0, score = 0, marks = [];
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
    G.set(KEY, score); G.flag("lunicorn"); if (window.MW_timedDone) window.MW_timedDone("lunicorn"); if (M.kind !== "rainbow") G.flag("lunicorn-" + M.kind);
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
  // Countdown to the next blue and blood moons, with an add-to-calendar file (no sign-up needed).
  (function () {
    var box = document.createElement("div"); box.className = "lu-next";
    var now = NOW.getTime(), blue = null, f = nextFull(now - 864e5);
    for (var i = 0; i < 80 && !blue; i++, f = fullNear(f + SYN * 864e5)) if (f > now - 864e5 && sameMonth(f, f - SYN * 864e5) && !ECLIPSES.some(function (e) { return Math.abs(e - f) < 864e5; })) blue = f;
    var blood = ECLIPSES.filter(function (e) { return e > now - 864e5; })[0];
    var early = [];
    SUPER.forEach(function (d, i) { var t = Date.parse(d + "T12:00:00"); if (G.localDay(new Date(t)) >= G.localDay(NOW)) early.push([t, i % 2 ? "Supermoon (red set)" : "Supermoon (blue set)"]); });
    PARTIALS.forEach(function (t) { if (G.localDay(new Date(t)) >= G.localDay(NOW)) early.push([t, "Lunar eclipse (red set)"]); });
    early.sort(function (a, b) { return a[0] - b[0]; });
    function nice(t) { return new Date(t).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "long", year: "numeric" }); }
    function away(t) { if (new Date(t).toDateString() === NOW.toDateString()) return "today"; var dd = Math.ceil((t - now) / 864e5), m = Math.round((t - now) / (30.44 * 864e5)); return dd < 32 ? "in " + dd + " day" + (dd > 1 ? "s" : "") : m < 24 ? "in " + m + " months" : "in " + Math.floor(m / 12) + " years" + (m % 12 ? ", " + (m % 12) + " month" + (m % 12 > 1 ? "s" : "") : ""); }
    // Compact (25 Nov 2026): one short list under the Play button, no calendar links, so the intro fits on a phone.
    function short(t) { return new Date(t).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }); }
    function row(t, ic, what) { return t ? "<li>" + ic + " <b>" + what + "</b> " + short(t) + " <small>(" + away(t) + ")</small></li>" : ""; }
    var e0 = early[0] && away(early[0][0]) !== "today" ? early[0] : null;
    box.innerHTML = '<p class="lu-next-h">Next special moons</p><ul>' + (e0 ? row(e0[0], "✨", e0[1].replace(/ \(.*\)/, "")) : "") + row(blood, "🔴", "Blood moon") + row(blue, "🔵", "Blue moon") + "</ul>";
    var play = $("lu-best"); play.parentNode.insertBefore(box, play.nextSibling);
    var st = document.createElement("style");
    st.textContent = ".lu-next{margin:12px auto 0;max-width:420px;font-size:13px;opacity:.9}.lu-next-h{margin:0 0 4px;font-weight:700;font-size:13px;letter-spacing:.06em;text-transform:uppercase;opacity:.8}.lu-next ul{list-style:none;margin:0;padding:0;display:grid;gap:2px}.lu-next li{margin:0}.lu-next small{opacity:.75}";
    document.head.appendChild(st);
  })();
  $("lu-play").onclick = function () { if (!$("lu-play").disabled) start(); };
  $("lu-again").onclick = function () { location.reload(); };
})();
