/* Malady Wise secrets and easter eggs (moved out of shell.js on 24 Nov 2026 so pages load lighter).
   shell.js loads this file a moment after the page is ready and calls MW_secrets(...) with the helpers it needs.
   See the notes in shell.js ("secrets") for the list of secrets. Flags live in localStorage "mw-secret-<id>". */
window.MW_secrets = function (checkBadges, esc2, get, set, mwFullNear, root, sydToday) {
  (function () {
    function flag(id) { set("mw-secret-" + id, 1); try { checkBadges(); } catch (e) {} }
    function pill(txt, ms) {
      var t = document.createElement("div"); t.className = "mw-secret-pill"; t.setAttribute("role", "status"); t.innerHTML = txt;
      document.body.appendChild(t); setTimeout(function () { t.classList.add("out"); setTimeout(function () { t.remove(); }, 400); }, ms || 3200); return t;
    }
    var going = false;
    function nightShift() {
      if (going) return; going = true; flag("nightshift");
      pill("🦇 The pager goes off…", 1400);
      setTimeout(function () { location.href = "/nightshift/"; }, 900);
    }
    // --- mascot taps ---
    var taps = {}, PROF = null, CAST = null;
    function mascotKey(img) { var m = (img.getAttribute("src") || "").match(/\/assets\/mascots\/(.+?)\.svg/); return m ? m[1] : ""; }
    function whisper(img, key) {
      function go() {
        var name = "", line = "";
        var M = window.MW_MASCOTS || {}, mm = M[key];
        if (mm) name = mm.name; else if (CAST && CAST[key]) name = CAST[key].name;
        var pf = PROF && PROF[name];
        line = pf && pf.secret ? "Psst. " + pf.secret : pf ? "Psst. " + pf.health + "." : "Psst. You found a secret. Tell no one.";
        var r = img.getBoundingClientRect(), b = document.createElement("div");
        b.className = "mw-whisper"; b.innerHTML = "<b>" + esc2(name || "Psst") + "</b> " + esc2(line);
        b.style.left = Math.max(10, Math.min(innerWidth - 270, r.left + r.width / 2 - 130)) + "px"; b.style.top = Math.max(10, r.top - 12) + "px";
        document.body.appendChild(b); setTimeout(function () { b.classList.add("out"); setTimeout(function () { b.remove(); }, 400); }, 5200);
        var seen = get("mw-whispers", []); if (seen.indexOf(key) < 0) { seen.push(key); set("mw-whispers", seen); }
        if (seen.length >= 3) flag("whisper");
      }
      if (PROF) return go();
      Promise.all([fetch("/data/mascot-profiles.json").then(function (r) { return r.json(); }), fetch("/data/mascot-cast.json").then(function (r) { return r.json(); })])
        .then(function (a) { PROF = a[0].mascots || {}; CAST = a[1].mascots || {}; go(); }).catch(function () { PROF = {}; go(); });
    }
    document.addEventListener("click", function (e) {
      var img = e.target && e.target.closest && e.target.closest('img[src*="/assets/mascots/"]');
      if (!img || img.closest("a,button")) return;
      var key = mascotKey(img), now = Date.now(), t = (taps[key] || []).filter(function (x) { return now - x < 4000; });
      t.push(now); taps[key] = t;
      if (/^(grandrounds|nightshift)$/.test(key) && t.length >= 3) { taps[key] = []; nightShift(); return; }
      if (t.length >= 3) { taps[key] = []; whisper(img, key); }
    });
    // --- typed words: see CODES below ("march" -> parade, "codebrown" -> 💩 …) ---
    var typed = "", KON = "ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight b a", keys = [];
    document.addEventListener("keydown", function (e) {
      var tg = e.target && e.target.tagName;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tg) || (e.target && e.target.isContentEditable) || e.ctrlKey || e.metaKey || e.altKey) return;
      keys.push(e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key); keys = keys.slice(-10);
      if (keys.join(" ") === KON) { keys = []; parade(); }
      if (e.key === "Backspace") return onType("\b");
      if (!e.key || e.key.length !== 1) return;
      onType(e.key.toLowerCase());
    });
    // On-screen game keyboards (Wordemic and friends) count as typing too, so "basil" or "clove" can be spelt as a guess.
    document.addEventListener("click", function (e) {
      var k = e.target && e.target.closest && e.target.closest("[data-k]"); if (!k) return;
      var ch = (k.getAttribute("data-k") || "").toLowerCase(); if (/^[a-z]$/.test(ch)) onType(ch); else if (/^(back|backspace|del|⌫)$/.test(ch)) onType("\b");
    }, true);
    // --- secret codes (Nov 2026): type them anywhere, spell them on a game keyboard (Wordemic), or submit them as an answer.
    // Spaces don't matter: "code blue" = "codeblue". Found codes are kept in mw-codes for the Code Breaker badges.
    function M(id) { return "/assets/mascots/" + id + ".svg?v=2"; }
    function walker(src, o) { // a mascot (or emoji) crosses the screen
      o = o || {}; if (RM) return;
      var el = document.createElement(src.length < 5 ? "span" : "img"); if (el.tagName === "IMG") { el.src = src; el.alt = ""; } else el.textContent = src;
      el.className = "mw-walker"; el.setAttribute("aria-hidden", "true"); var sz = o.size || 84;
      el.style.cssText = "width:" + sz + "px;height:" + sz + "px;font-size:" + Math.round(sz * 0.8) + "px;top:" + (o.top != null ? o.top : innerHeight - sz - 14) + "px";
      document.body.appendChild(el);
      var dir = o.rtl ? -1 : 1, x0 = dir > 0 ? -sz - 20 : innerWidth + 20, x1 = dir > 0 ? innerWidth + 20 : -sz - 20, hop = o.hop == null ? 10 : o.hop, n = o.steps || 14, fr = [];
      for (var k = 0; k <= n; k++) { var x = x0 + (x1 - x0) * k / n, y = (k % 2 ? -hop : 0) + (o.wave ? Math.sin(k / n * Math.PI * 4) * o.wave : 0); fr.push({ transform: "translate(" + x + "px," + y + "px) scaleX(" + (dir > 0 ? (o.flip ? -1 : 1) : (o.flip ? 1 : -1)) + ")" + (o.spin ? " rotate(" + (k * 30) + "deg)" : "") }); }
      el.animate(fr, { duration: o.ms || 5200, delay: o.delay || 0, easing: "linear", fill: "both" }).onfinish = function () { el.remove(); };
    }
    function landSpots() {
      return [].slice.call(document.querySelectorAll("main h1, main h2, main h3, main p, main li, main img, main .card, main .t3, main button, header, footer")).map(function (el) { return el.getBoundingClientRect(); })
        .filter(function (r) { return r.width > 30 && r.top > 40 && r.top < innerHeight - 30; });
    }
    function rain(emoji, n, o) { // emojis fall (or rise) and land on bits of the page
      o = o || {}; if (RM) n = Math.min(n, 8);
      var spots = landSpots(), wrap = document.createElement("div"); wrap.className = "mw-rain"; wrap.setAttribute("aria-hidden", "true"); document.body.appendChild(wrap);
      for (var k = 0; k < n; k++) (function (k) {
        var e = document.createElement("span"), ch = Array.isArray(emoji) ? emoji[k % emoji.length] : emoji; e.textContent = ch; wrap.appendChild(e);
        var sz = o.size || (18 + Math.random() * 14), sp = spots.length && !o.up && o.land !== false ? spots[Math.floor(Math.random() * spots.length)] : null;
        var x = sp ? sp.left + Math.random() * Math.max(10, sp.width - sz) : Math.random() * (innerWidth - sz), yEnd = sp ? sp.top - sz * 0.9 : (o.up ? -60 : innerHeight - sz - 4);
        e.style.cssText = "left:" + x + "px;font-size:" + sz + "px";
        var y0 = o.up ? innerHeight + 20 : -50 - Math.random() * 60, rot = (Math.random() - 0.5) * 70, d = (o.ms || 1300) + Math.random() * 700, dl = Math.random() * (o.spread || 1600);
        var fr = o.up ? [{ transform: "translate(0," + y0 + "px)", opacity: 1 }, { transform: "translate(" + ((Math.random() - 0.5) * 80) + "px," + yEnd + "px) rotate(" + rot + "deg)", opacity: 0 }]
          : [{ transform: "translate(0," + y0 + "px) rotate(0deg)" }, { transform: "translate(0," + yEnd + "px) rotate(" + rot + "deg)", offset: 0.82 }, { transform: "translate(0," + (yEnd - 9) + "px) rotate(" + rot + "deg)", offset: 0.9 }, { transform: "translate(0," + yEnd + "px) rotate(" + rot + "deg)" }];
        e.animate(fr, { duration: d, delay: dl, easing: o.up ? "ease-out" : "cubic-bezier(.5,0,.9,.6)", fill: "both" });
      })(k);
      setTimeout(function () { wrap.classList.add("out"); setTimeout(function () { wrap.remove(); }, 700); }, o.stay || 6500);
    }
    function shake(n) { if (RM) return; var m = document.querySelector("main") || document.body, fr = []; for (var k = 0; k < (n || 6); k++) fr.push({ transform: "translate(" + (k % 2 ? -8 : 8) + "px," + (k % 3 - 1) * 3 + "px)" }); fr.push({ transform: "none" }); m.animate(fr, { duration: 90 * fr.length }); }
    function overlay(cls, ms) { var f = document.createElement("div"); f.className = "mw-ov " + cls; f.setAttribute("aria-hidden", "true"); document.body.appendChild(f); setTimeout(function () { f.remove(); }, ms || 3000); return f; }
    function pageFx(cls, ms) { root.classList.add(cls); setTimeout(function () { root.classList.remove(cls); }, ms || 3000); }
    function evacuate() { // code orange: page sections file out to the left, then wander back
      var els = [].slice.call(document.querySelectorAll("main > *, main section > *")).filter(function (el) { var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }).slice(0, 14);
      els.forEach(function (el, i) { if (!el.animate || RM) return; el.animate([{ transform: "none" }, { transform: "translateX(-115vw)", offset: 0.4 }, { transform: "translateX(-115vw)", offset: 0.62 }, { transform: "translateX(115vw)", offset: 0.621 }, { transform: "none" }], { duration: 4200, delay: i * 90, easing: "ease-in-out" }); });
    }
    function security() { // code black: security mascots march through in shades and vests
      ["dx", "stackulus", "comorbix", "sensitosis"].forEach(function (id, i) {
        if (RM) return; var w = document.createElement("div"); w.className = "mw-sec"; w.setAttribute("aria-hidden", "true");
        w.innerHTML = '<img src="' + M(id) + '" alt=""><span class="mw-sec-sh">🕶️</span><b>SECURITY</b>'; w.style.top = (innerHeight - 124) + "px"; document.body.appendChild(w);
        var fr = []; for (var k = 0; k <= 16; k++) fr.push({ transform: "translate(" + (-110 + (innerWidth + 220) * k / 16) + "px," + (k % 2 ? -6 : 0) + "px)" });
        w.animate(fr, { duration: 6000, delay: i * 650, fill: "both" }).onfinish = function () { w.remove(); };
      });
    }
    function breathe() { var f = overlay("mw-breathe", 8200); f.innerHTML = "<i></i><b>Breathe in…</b>"; var b = f.querySelector("b"); setTimeout(function () { b.textContent = "…and out."; }, 2000); setTimeout(function () { b.textContent = "Breathe in…"; }, 4000); setTimeout(function () { b.textContent = "…and out. Better."; }, 6000); }
    function ward3() { var f = overlay("mw-ecg", 5000); f.innerHTML = '<svg viewBox="0 0 600 100" preserveAspectRatio="none"><path d="M0 50 H120 L135 50 L145 20 L155 85 L165 10 L178 50 H300 L315 50 L325 20 L335 85 L345 10 L358 50 H480 L495 50 L505 20 L515 85 L525 10 L538 50 H600"/></svg>'; }
    var CODES = {
      // hospital codes (any spacing)
      codeblue: function () { codeBlue(); },
      codered: function () { overlay("mw-ov-red", 3200); rain("🔥", 40, { up: true, ms: 2600, spread: 1500, stay: 4200 }); pill("🔥 Code Red: fire! Remember RACE: Rescue, Alarm, Contain, Evacuate.", 4200); },
      codeblack: function () { security(); pill("🕶️ Code Black: security to the waiting room. Everyone stay calm.", 4600); },
      codebrown: function () { rain("💩", 100, { spread: 2600, stay: 7500 }); pill("💩 Code Brown. Environmental services to every page, please.", 4800); },
      codeorange: function () { evacuate(); pill("🟠 Code Orange: evacuate! Walk, don’t run. Take nothing but your puzzle streak.", 4400); },
      codeyellow: function () { pageFx("mw-flicker", 3200); pill("🟡 Code Yellow: internal emergency. The coffee machine is down.", 4200); },
      codegrey: function () { breathe(); pill("🩶 Code Grey: everybody take a breath. Nobody needs to shout.", 4800); },
      // the mascots (5 letters, all valid Wordemic guesses)
      zebra: function () { walker(M("zebritis"), { size: 96, hop: 12, ms: 5600 }); pill("🦓 Ziggy marches through. Hoofbeats? Think horses… unless it’s Ziggy.", 4200); },
      march: function () { parade(); },
      snake: function () { walker(M("linkase"), { size: 90, hop: 0, wave: 16, steps: 30, ms: 6200 }); pill("🐍 Cadi slithers past. Asclepius would be proud.", 3600); },
      polly: function () { walker(M("triviosis"), { size: 80, top: 90, hop: 18, wave: 26, steps: 24, ms: 4200 }); pill("🦜 Echo wants a cracker. And a quiz.", 3200); },
      batty: function () { walker(M("grandrounds"), { size: 80, top: 70, hop: 22, wave: 30, steps: 28, ms: 4200, rtl: true }); pill("🦇 Locum flaps through. Who paged the night reg?", 3400); },
      clues: function () { walker(M("dx"), { size: 90, hop: 8, ms: 6000 }); rain("🔍", 6, { land: true, stay: 4500 }); pill("🦊 Dex is on the case. Six clues, one diagnosis.", 3600); },
      brrrr: function () { walker(M("deepdives"), { size: 84, hop: 6, steps: 26, ms: 6500 }); rain("❄️", 40, { land: false, stay: 5000 }); pill("🐧 Pebble waddles in from the cold. Brrrr.", 3600); },
      shell: function () { walker(M("gridectomy"), { size: 84, hop: 3, steps: 30, ms: 11000 }); pill("🐢 Tess is crossing. Slowly. Very slowly.", 4200); },
      webby: function () { var w = document.createElement("div"); w.className = "mw-spider"; w.innerHTML = '<i></i><img src="' + M("suturix") + '" alt="">'; w.setAttribute("aria-hidden", "true"); w.style.left = (20 + Math.random() * (innerWidth - 120)) + "px"; document.body.appendChild(w); setTimeout(function () { w.remove(); }, 5200); pill("🕷️ Silk drops in to say hello. Perfectly sterile thread.", 3400); },
      hoots: function () { walker(M("sudokrine"), { size: 80, top: 80, hop: 14, wave: 20, steps: 22, ms: 4500, rtl: true }); pill("🦉 Iris hoots. Your cortisol should be higher in the morning.", 3600); },
      hides: function () { pageFx("mw-chameleon", 4000); walker(M("glimpsis"), { size: 86, hop: 4, ms: 7000 }); pill("🦎 Mira is somewhere on this page. Probably.", 3800); },
      jelly: function () { rain(["🪼"], 12, { up: true, ms: 4200, spread: 2000, stay: 6000 }); walker(M("opacitis"), { size: 84, top: innerHeight / 2 - 40, hop: 10, wave: 20, steps: 20, ms: 6000 }); pill("🪼 Lumo floats by. Completely see-through. Like your excuses.", 3800); },
      trash: function () { walker(M("dactylosis"), { size: 86, hop: 10, ms: 4800 }); rain(["🍌", "🥫", "📄"], 12, { stay: 5000 }); pill("🦝 Digby has been in the bins again.", 3400); },
      label: function () { rain("🏷️", 24, { stay: 6000 }); walker(M("labelosis"), { size: 84, hop: 8, ms: 5600 }); pill("🏷️ Lottie labelled everything. Including you.", 3600); },
      alert: function () { var p = document.createElement("img"); p.src = M("sensitosis"); p.alt = ""; p.className = "mw-popup"; p.setAttribute("aria-hidden", "true"); document.body.appendChild(p); setTimeout(function () { p.remove(); }, 3600); pill("🚨 Sunny is on lookout. Nothing gets past her.", 3200); },
      brick: function () { walker(M("stackulus"), { size: 88, hop: 6, ms: 6200 }); rain("🧱", 14, { stay: 5500 }); pill("🧱 Brix is renovating this page. Hard hats on.", 3600); },
      honey: function () { walker(M("morphemia"), { size: 74, top: 110, hop: 14, wave: 40, steps: 30, ms: 6000 }); rain("🍯", 6, { stay: 4500 }); pill("🐝 Bea the nurse bee. Buzz off, germs.", 3400); },
      germs: function () { rain("🦠", 60, { spread: 2400, stay: 6500 }); pill("🦠 Vira multiplied. Wash your hands.", 3600); },
      music: function () { walker(M("arrhythmix"), { size: 86, hop: 14, steps: 24, ms: 5200 }); rain(["🎵", "🎶"], 18, { up: true, ms: 3000, stay: 5000 }); pill("🎧 Riff drops a beat. 72 bpm, nice and regular.", 3600); },
      fangs: function () { walker(M("panelysis"), { size: 84, hop: 8, ms: 5200, rtl: true }); rain("🩸", 10, { stay: 4800 }); pill("🧛 Ruby needs just one more tube. Strictly for science.", 3800); },
      think: function () { var p = document.createElement("img"); p.src = M("mergeon"); p.alt = ""; p.className = "mw-popup"; p.setAttribute("aria-hidden", "true"); document.body.appendChild(p); setTimeout(function () { p.remove(); }, 3600); rain("💡", 10, { up: true, ms: 2600, stay: 4000 }); pill("🧠 Noggin is thinking. Please hold.", 3200); },
      ninja: function () { pageFx("mw-dim", 2600); walker(M("cryptogenic"), { size: 84, hop: 2, ms: 2600 }); pill("🥷 Cipher was here. You didn’t see anything.", 3200); },
      inked: function () { walker(M("comorbix"), { size: 88, hop: 10, wave: 10, steps: 22, ms: 6000 }); pill("🐙 Octavia sorted this page into four groups.", 3400); },
      // just for fun
      party: function () { rain(["🎉", "🎊", "🥳", "✨"], 70, { spread: 2000, stay: 6000 }); pill("🎉 Party! Somebody finished their discharge summaries.", 3600); },
      latte: function () { rain("☕", 30, { stay: 6000 }); pill("☕ Coffee for the whole ward. Nurses first.", 3200); },
      pager: function () { shake(10); pill("📟 BEEP BEEP. Bed 12 would like a sandwich.", 3600); },
      ouchy: function () { rain("🩹", 24, { spread: 1200, stay: 7000 }); pill("🩹 Band-aids for every boo-boo on this page.", 3400); },
      snore: function () { rain("💤", 20, { up: true, ms: 3600, stay: 5000 }); pageFx("mw-dim", 4000); pill("😴 Shhh. The night reg finally fell asleep.", 3600); },
      achoo: function () { shake(4); rain("🦠", 30, { spread: 600, stay: 5000 }); pill("🤧 Achoo! Into your elbow, please.", 3200); },
      lunch: function () { walker("🥪", { size: 60, hop: 4, ms: 5000 }); pill("🥪 Lunch? In this economy? On this roster?", 3600); },
      scrub: function () { rain("🫧", 40, { up: true, ms: 3200, stay: 5000 }); pageFx("mw-clean", 2500); pill("🫧 Scrubbed in. Two minutes, under the nails.", 3400); },
      bones: function () { pageFx("mw-xray", 3200); pill("🩻 X-ray vision on. No fractures seen on this page.", 3400); },
      heart: function () { ward3(); rain("❤️", 24, { up: true, ms: 3000, stay: 5000 }); pill("❤️ Sinus rhythm. Lovely.", 3000); },
      // everyday words that turn up naturally in Wordemic and the crosswords
      round: function () { ["dx", "comorbix", "triviosis", "labelosis", "sensitosis"].forEach(function (id, i) { walker(M(id), { size: 70, hop: 6, ms: 7000, delay: i * 500 }); }); pill("📋 Ward round! Everyone follow the consultant. Nobody knows where we’re going.", 4200); },
      audit: function () { cloverStamp(); rain("✅", 20, { stay: 5500 }); pill("✅ Audit complete. Clover found 3 missing signatures.", 3600); },
      burps: function () { if (!RM) (document.querySelector("main") || document.body).animate([{ transform: "none" }, { transform: "scaleY(1.06) scaleX(.97)" }, { transform: "scaleY(.96) scaleX(1.03)" }, { transform: "none" }], { duration: 700 }); pill("🫧 Pardon you.", 2600); },
      hiccup: function () { var m = document.querySelector("main") || document.body; [0, 1100, 2200, 3300].forEach(function (d) { setTimeout(function () { if (!RM) m.animate([{ transform: "none" }, { transform: "translateY(-14px)" }, { transform: "none" }], { duration: 260 }); }, d); }); pill("Hic! Try holding your breath. (It probably won’t work.)", 4000); },
      yawns: function () { pageFx("mw-dim", 3000); rain("🥱", 16, { up: true, ms: 3000, stay: 4500 }); pill("🥱 Yawns are contagious. Did you just yawn?", 3600); },
      sweat: function () { rain("💦", 40, { spread: 2200, stay: 5500 }); pill("💦 Hot in here. Humans have up to 4 million sweat glands.", 3800); },
      koala: function () { CODES.dropbear(); },
      dropbear: function () { var k = document.createElement("div"); k.className = "mw-spider mw-dropbear"; k.innerHTML = "<i></i><span>🐨</span>"; k.setAttribute("aria-hidden", "true"); k.style.left = (20 + Math.random() * (innerWidth - 120)) + "px"; document.body.appendChild(k); setTimeout(function () { k.remove(); }, 5200); pill("🐨 Drop bear! Put some Vegemite behind your ears.", 3600); },
      santa: function () { var mo = sydToday().slice(5, 7); if (mo !== "12") return pill("🎅 Santa’s on holiday. Come back in December.", 3200); walker("🛷", { size: 70, top: 70, hop: 10, wave: 20, steps: 24, ms: 5200 }); rain("🎁", 24, { stay: 6000 }); pill("🎅 Ho ho ho! Santa checks his list twice. Very good clinical practice.", 4000); },
      spook: function () { var md = sydToday().slice(5); if (md < "10-24" || md > "11-02") return pill("👻 Too early for spooks. Come back at Halloween.", 3200); rain("👻", 24, { up: true, ms: 3600, stay: 5500 }); pageFx("mw-dim", 3000); pill("👻 Boo! Spooky season is here.", 3400); },
      eggs: function () { var md = sydToday().slice(5); if (md < "03-20" || md > "04-30") return pill("🥚 The Easter Bunny hasn’t hidden them yet. Try again around Easter.", 3400); rain(["🥚", "🐣", "🍫"], 40, { stay: 6000 }); pill("🐣 You found the eggs! Mega Bunny will be furious.", 3600); },
      flips: function () { pageFx("mw-flip", 3200); pill("🙃 Australian mode. Everything’s upside down.", 3400); },
      tiny: function () { pageFx("mw-tiny", 3000); pill("🔬 Honey, I shrunk the website.", 3000); },
      giant: function () { pageFx("mw-giant", 3000); pill("🔭 Fee-fi-fo-fum. That’s a big website.", 3000); },
      disco: function () { pageFx("mw-disco", 4000); rain(["🪩", "🕺", "💃"], 14, { up: true, ms: 3200, stay: 4500 }); pill("🪩 Disco! 120 beats per minute, perfect for CPR.", 3800); },
      quiet: function () { if (going) return; going = true; flag("quiet"); set("mw-open-quiet", (function(){var d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();})()); pageFx("mw-flicker", 2000); shake(10); rain("\ud83d\udea8", 24, { spread: 900, stay: 2400 }); pill("\ud83d\udea8 You said the Q word. Every ambulance in the state is now on its way\u2026", 2400); setTimeout(function () { location.href = "/triagic/"; }, 2200); },
      lunar: function () { if (going) return; going = true; flag("lunar"); set("mw-open-lunar", (function(){var d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();})()); rain(["\ud83c\udf15", "\ud83e\udd84", "\u2728"], 24, { stay: 2400 }); pill("\ud83c\udf15 Lunar. Ziggy has turned into something\u2026", 2400); setTimeout(function () { location.href = "/lunicorn/"; }, 2200); },
      toxic: function () { if (going) return; going = true; flag("toxic"); pageFx("mw-flicker", 1600); rain(["\u2623\ufe0f", "\ud83e\uddea", "\ud83c\udf44"], 24, { stay: 2400 }); pill("\u2623\ufe0f Toxic word detected. Toxiquest is open to you.", 2400); setTimeout(function () { location.href = "/toxiquest/"; }, 2200); },
      // older secrets
      locum: function () { nightShift(); },
      scrawl: function () { scrawl(); },
      bothcats: function () { bothCats(); },
      basil: function () { flag("paws"); basilSwipe(); },
      clove: function () { flag("paws"); cloverStamp(); }
    };
    var CODE_KEYS = Object.keys(CODES).sort(function (a, b) { return b.length - a.length; });
    window.MW_CODE_COUNT = CODE_KEYS.length;
    function runCode(code) {
      var f = get("mw-codes", []) || []; if (f.indexOf(code) < 0) { f.push(code); set("mw-codes", f); }
      if (code === "codeblue") flag("code");
      try { CODES[code](); } catch (e) {}
      try { checkBadges(); } catch (e) {}
    }
    function onType(ch) {
      if (ch === "\b") { typed = typed.slice(0, -1); return; }
      if (!/^[a-z]$/.test(ch)) return; // spaces and punctuation are ignored, so "code blue" works
      typed = (typed + ch).slice(-16);
      for (var i = 0; i < CODE_KEYS.length; i++) { var c = CODE_KEYS[i]; if (typed.slice(-c.length) === c) { typed = ""; runCode(c); return; } }
    }
    // Answers count too: submit a code in any answer box (Dxtective, Triviosis…) and it fires.
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return; var t = e.target; if (!t || !/^(INPUT|TEXTAREA)$/.test(t.tagName) || /password|email/.test(t.type || "")) return;
      var v = String(t.value || "").toLowerCase().replace(/[^a-z]/g, ""); if (CODES[v]) setTimeout(function () { runCode(v); }, 250);
    }, true);
    function parade() {
      flag("konami");
      var list = ["dx", "wordemic", "triviosis", "comorbix", "zebritis", "linkase", "gridectomy", "suturix", "morphemia", "arrhythmix", "sudokrine", "cryptogenic", "grandrounds", "deepdives", "basil", "clover", "normie/norm"];
      var wrap = document.createElement("div"); wrap.className = "mw-parade"; wrap.setAttribute("aria-hidden", "true");
      list.forEach(function (k, i) { var im = document.createElement("img"); im.src = "/assets/mascots/" + k + ".svg"; im.alt = ""; im.style.animationDelay = (i * 0.28) + "s"; wrap.appendChild(im); });
      document.body.appendChild(wrap); pill("🎉 Cheat code accepted. The whole gang’s here.", 3500);
      setTimeout(function () { wrap.remove(); }, 10000);
    }
    // --- logo taps on the home page: Basil knocks something off the table ---
    if (/^\/(index\.html)?$/.test(location.pathname)) {
      var lt = [];
      document.addEventListener("click", function (e) {
        if (!e.target.closest || !e.target.closest(".bar .logo")) return;
        e.preventDefault();
        var now = Date.now(); lt = lt.filter(function (x) { return now - x < 3500; }); lt.push(now);
        if (lt.length >= 3) { lt = []; basilSwipe(); }
      });
    }
    // --- the cats (Nov 2026): Basil knocks a real page element off; Clover reviews the page and stamps it; both = chaos then paperwork ---
    var RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function catTarget(avoid) {
      var c = [].slice.call(document.querySelectorAll("main .card, main .t3, main .rd, main h1, main h2, main h3, main img, main .callout, main p, main li, main button")).filter(function (el) {
        if (el === avoid || el.closest(".mw-cab, .mw-secret-pill, .mw-stamp, .mt-cats") || /basil|clover/.test(el.src || "")) return false;
        var r = el.getBoundingClientRect(); return r.width > 40 && r.height > 14 && r.top > 70 && r.bottom < innerHeight - 20 && r.width < innerWidth * 0.95;
      });
      var big = c.filter(function (el) { return /^(H1|H2|IMG)$/.test(el.tagName) || el.matches(".card, .t3, .rd, .callout"); });
      var pool = big.length ? big : c;
      return pool[Math.floor(Math.random() * pool.length)] || document.querySelector("main h1, main h2, main");
    }
    function catImg(name, cls) { var im = document.createElement("img"); im.src = "/assets/mascots/" + name + ".svg?v=2"; im.alt = ""; im.className = "mw-basil-walk " + (cls || ""); im.setAttribute("aria-hidden", "true"); document.body.appendChild(im); return im; }
    function knockOff(tgt, back, cb) {
      if (!tgt || !tgt.animate || RM) { if (cb) cb(); return; }
      var r = tgt.getBoundingClientRect(), spin = (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 60);
      var a = tgt.animate([{ transform: "none" }, { transform: "translate(18px,-8px) rotate(" + (spin / 8) + "deg)", offset: 0.12 }, { transform: "translate(" + (90 + Math.random() * 120) + "px," + (innerHeight - r.top + 80) + "px) rotate(" + spin + "deg)", opacity: 0.15 }], { duration: 1100, easing: "cubic-bezier(.5,0,.9,.6)", fill: "forwards" });
      a.onfinish = function () { if (cb) cb(a); if (back !== false) setTimeout(function () { a.cancel(); tgt.animate([{ opacity: 0, transform: "translateY(-14px)" }, { opacity: 1, transform: "none" }], { duration: 450 }); }, back || 2200); };
      return a;
    }
    function basilSwipe(after) {
      flag("offtable");
      var tgt = catTarget(), r = tgt ? tgt.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
      var cat = catImg("basil", "mw-basil-ol"), dest = Math.max(0, Math.min(innerWidth - 90, r.left - 60));
      cat.style.top = Math.max(60, Math.min(innerHeight - 120, r.top + r.height - 95)) + "px";
      var lines = ["🐾 Basil has entered the chat. Something had to go.", "🐾 Basil made eye contact. Then he did it anyway.", "🐾 Basil tested gravity. Gravity still works.", "🐾 Basil decided that didn’t belong there."];
      cat.animate([{ transform: "translateX(-120px)" }, { transform: "translateX(" + dest + "px)" }], { duration: RM ? 10 : 1500, easing: "ease-out", fill: "forwards" }).onfinish = function () {
        // the paw tap, then the shove
        cat.animate([{ transform: "translateX(" + dest + "px)" }, { transform: "translateX(" + (dest + 14) + "px) rotate(-6deg)" }, { transform: "translateX(" + dest + "px)" }], { duration: 260, iterations: 2 }).onfinish = function () {
          knockOff(tgt, after ? false : 2200, after ? function (a) { after(tgt, a, r); } : null);
          if (!after) pill(lines[Math.floor(Math.random() * lines.length)], 3000);
          cat.animate([{ transform: "translateX(" + dest + "px)" }, { transform: "translateX(" + (innerWidth + 120) + "px)" }], { duration: 1300, delay: 500, easing: "ease-in", fill: "forwards" }).onfinish = function () { cat.remove(); };
        };
      };
    }
    function stamp(tgt, word, sub) {
      var r = tgt.getBoundingClientRect(), st = document.createElement("div");
      st.className = "mw-stamp" + (word.length > 9 ? " long" : ""); st.setAttribute("aria-hidden", "true");
      st.innerHTML = "<b>" + word + "</b><span>" + sub + "</span>";
      st.style.left = (scrollX + r.left + Math.min(r.width, 320) * (0.35 + Math.random() * 0.3)) + "px";
      st.style.top = (scrollY + r.top + Math.min(r.height, 160) * 0.5) + "px";
      st.style.setProperty("--rot", (-14 + Math.random() * 10).toFixed(1) + "deg");
      document.body.appendChild(st);
      var w = st.offsetWidth / 2 + 8, x = parseFloat(st.style.left) - scrollX;
      st.style.left = (scrollX + Math.max(w, Math.min(innerWidth - w, x))) + "px";
      return st;
    }
    function cloverWalk(r, done) {
      var cat = catImg("clover", "mw-clover-walk"), dest = Math.min(innerWidth - 80, Math.max(10, r.left + Math.min(r.width, 320) + 6));
      if (dest > innerWidth - 90) dest = Math.max(10, r.left - 80);
      cat.style.top = Math.max(60, Math.min(innerHeight - 120, r.top + r.height - 95)) + "px";
      cat.animate([{ transform: "translateX(" + (innerWidth + 40) + "px)" }, { transform: "translateX(" + dest + "px)" }], { duration: RM ? 10 : 1500, easing: "ease-out", fill: "forwards" }).onfinish = function () {
        // the inspection: a slow head tilt, twice
        cat.animate([{ transform: "translateX(" + dest + "px)" }, { transform: "translateX(" + dest + "px) rotate(-8deg)" }, { transform: "translateX(" + dest + "px)" }], { duration: RM ? 10 : 700, iterations: 2 }).onfinish = function () {
          done();
          cat.animate([{ transform: "translateX(" + dest + "px)" }, { transform: "translateX(" + (innerWidth + 40) + "px)" }], { duration: 1400, delay: 900, easing: "ease-in", fill: "forwards" }).onfinish = function () { cat.remove(); };
        };
      };
    }
    function cloverStamp() {
      flag("stamp");
      var tgt = catTarget(); if (!tgt) return;
      var V = [["APPROVED", "Clover, Head of Quality", "🐾 Clover has reviewed this page. Approved. You may continue."], ["APPROVED", "after careful sniffing", "🐾 Clover sniffed it twice. It passes."],
        ["APPROVED", "with conditions", "🐾 Clover approves, on the condition of dinner at 5."], ["SEEN", "by Clover", "🐾 Clover saw this. She has notes. She is keeping them."]];
      if (Math.random() < 0.12) V = [["NEEDS MORE TREATS", "Clover, Head of Quality", "🐾 Clover has reviewed this page. Not until there are treats."]];
      var v = V[Math.floor(Math.random() * V.length)];
      cloverWalk(tgt.getBoundingClientRect(), function () { stamp(tgt, v[0], v[1]); pill(v[2], 3400); });
    }
    // Basil on the keyboard (Nov 2026): on Wordemic he walks over the on-screen keyboard and types gibberish into your
    // current guess, then Clover deletes exactly what he typed. Never submits. Elsewhere it takes you to Wordemic first.
    function catKeys() {
      var kb = document.getElementById("wde-kb"), board = document.getElementById("wde-board");
      if (!kb || !board) { location.href = "/wordemic/#catkb"; return; }
      var gm = document.getElementById("game");
      if (gm && gm.hidden) { var pb = [].filter.call(document.querySelectorAll("button"), function (b) { return /^\s*Play\s*$/.test(b.textContent); })[0]; if (pb) { pb.click(); setTimeout(catKeys, 900); return; } }
      document.querySelectorAll(".scrim .x, .scrim [data-close], .scrim .close").forEach(function (b) { try { b.click(); } catch (e) {} });
      function filled() { var rows = board.children; for (var r = 0; r < rows.length; r++) { var t = rows[r].children; if (!t.length || /\b(hit|near|miss)\b/.test(t[0].className)) continue; return [].filter.call(t, function (x) { return /\bfilled\b/.test(x.className); }).length; } return -1; }
      var n0 = filled(); if (n0 < 0) { pill("🐾 Basil sat on the keyboard, but today’s game is already finished. He looks smug anyway.", 3200); return; }
      flag("keys"); flag("paws");
      var keys = [].slice.call(kb.querySelectorAll(".key")).filter(function (k) { return /^[a-z]$/.test(k.getAttribute("data-k") || ""); });
      board.scrollIntoView({ block: "start", behavior: "auto" }); window.scrollBy(0, -70);
      var r = kb.getBoundingClientRect();
      var cat = catImg("basil", "mw-basil-ol");
      cat.style.top = Math.max(60, Math.min(innerHeight - 120, r.top - 60)) + "px";
      var typed = "", steps = 4 + Math.floor(Math.random() * 3), i = 0;
      cat.animate([{ transform: "translateX(-120px)" }, { transform: "translateX(" + (innerWidth * 0.15) + "px)" }], { duration: RM ? 10 : 900, fill: "forwards" }).onfinish = function step() {
        if (i++ >= steps) return after();
        var k = keys[Math.floor(Math.random() * keys.length)], kr = k.getBoundingClientRect();
        var x = Math.max(0, Math.min(innerWidth - 90, kr.left - 20)); cat.style.top = Math.max(60, Math.min(innerHeight - 120, kr.top - 75)) + "px";
        cat.animate([{ transform: getComputedStyle(cat).transform }, { transform: "translateX(" + x + "px) translateY(10px)" }], { duration: RM ? 10 : 320, fill: "forwards" }).onfinish = function () {
          k.classList.add("mw-paw-press"); setTimeout(function () { k.classList.remove("mw-paw-press"); }, 220);
          var before = filled(); k.click(); if (filled() > before) typed += k.getAttribute("data-k");
          setTimeout(step, RM ? 30 : 180);
        };
      };
      function after() {
        var added = Math.max(0, filled() - n0);
        cat.animate([{ transform: getComputedStyle(cat).transform }, { transform: "translateX(" + (innerWidth + 120) + "px)" }], { duration: 900, delay: 300, easing: "ease-in", fill: "forwards" }).onfinish = function () { cat.remove(); };
        if (!added) { pill("🐾 Basil walked across the keyboard. Your row was already full, so he just left fur.", 3200); return; }
        pill("🐾 Basil typed “" + typed.toUpperCase() + "”. Clover is on her way…", 2200);
        setTimeout(function () {
          var back = kb.querySelector('[data-k="back"]'), c2 = catImg("clover", "mw-clover-walk");
          var br = back ? back.getBoundingClientRect() : r; c2.style.top = Math.max(60, Math.min(innerHeight - 120, br.top - 70)) + "px";
          var bx = Math.max(0, Math.min(innerWidth - 90, br.left - 20));
          c2.animate([{ transform: "translateX(" + (innerWidth + 40) + "px)" }, { transform: "translateX(" + bx + "px)" }], { duration: RM ? 10 : 1100, easing: "ease-out", fill: "forwards" }).onfinish = function () {
            var j = 0; (function del() {
              if (j++ >= added || !back) {
                pill("🐾 Clover deleted it. Your guess is back how you left it. Basil has been spoken to.", 3400);
                c2.animate([{ transform: "translateX(" + bx + "px)" }, { transform: "translateX(" + (innerWidth + 40) + "px)" }], { duration: 1000, delay: 500, easing: "ease-in", fill: "forwards" }).onfinish = function () { c2.remove(); };
                return;
              }
              back.classList.add("mw-paw-press"); setTimeout(function () { back.classList.remove("mw-paw-press"); }, 200); back.click(); setTimeout(del, RM ? 30 : 260);
            })();
          };
        }, 1600);
      }
    }
    function bothCats() {
      flag("cats"); flag("paws");
      basilSwipe(function (tgt, a, r) {
        pill("🐾 Basil knocked something off. Clover is on her way…", 2400);
        setTimeout(function () {
          cloverWalk(r, function () {
            if (a) { a.cancel(); tgt.animate([{ opacity: 0, transform: "translateY(-14px)" }, { opacity: 1, transform: "none" }], { duration: 450 }); }
            setTimeout(function () {
              stamp(tgt, "INCIDENT REPORT", "Basil, again. Filed by Clover");
              pill("🐾 Clover put it back and filed an incident report. Basil is not sorry.", 3800);
            }, 350);
          });
        }, 900);
      });
    }
    // --- cookie hunt ---
    (function () {
      var d = sydToday(), path = location.pathname, h = 0, key = d + "|" + path;
      for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
      if (h % 23 !== 0 || /^\/(nightshift|me|site-stats|mental-health-check)\//.test(path)) return;
      var found = get("mw-cookies", []);
      if (found.indexOf(d) >= 0) return;
      function place() {
        var ps = [].slice.call(document.querySelectorAll("main p, main li")).filter(function (p) { return p.offsetParent && p.textContent.length > 40 && !p.closest("nav,footer,.mw-crumbs"); });
        if (!ps.length) return;
        var p = ps[h % ps.length], b = document.createElement("button");
        b.type = "button"; b.className = "mw-cookie"; b.setAttribute("aria-label", "A hidden cookie"); b.textContent = "🍪";
        b.onclick = function (e) {
          e.preventDefault(); var f = get("mw-cookies", []); if (f.indexOf(d) < 0) { f.push(d); set("mw-cookies", f); }
          b.remove(); pill("🍪 You found today’s hidden cookie. " + f.length + (f.length === 1 ? " cookie" : " cookies") + " so far. No tracking, just crumbs.", 3800);
          try { checkBadges(); } catch (x) {}
        };
        p.appendChild(document.createTextNode(" ")); p.appendChild(b);
      }
      setTimeout(place, 1500);
    })();

    function daRoom() { flag("daroom"); pill("✏️ A nod to a cryptic master…", 1600); setTimeout(function () { location.href = "/da/"; }, 1100); }
    // --- the Cabinet of Curiosities: tap the footer tagline 5 times for a clickable list of the typed secrets (phones can't type) ---
    var ct = [];
    document.addEventListener("click", function (e) {
      if (!e.target.closest || !e.target.closest(".ft-tag")) return;
      var now = Date.now(); ct = ct.filter(function (x) { return now - x < 3000; }); ct.push(now);
      if (ct.length >= 5) { ct = []; cabinet(); }
    });
    function cabinet() {
      if (document.querySelector(".mw-cab")) return;
      flag("cabinet");
      var A = [["🦇", "Night Shift", "A hidden game for the 3am crowd.", nightShift], ["🎉", "March", "The whole gang marches through.", parade],
        ["🚨", "Code Blue", "Everything is urgent now.", codeBlue], ["✍️", "Doctor’s handwriting", "Good luck reading this page.", scrawl],
        ["🐈", "Call Basil", "Something on this page has to go.", function () { flag("paws"); basilSwipe(); }], ["🐈‍⬛", "Call Clover", "She’ll review this page.", function () { flag("paws"); cloverStamp(); }],
        ["🐾", "Both cats", "Chaos, then paperwork.", bothCats],
        ["⌨️", "Cat on the keyboard", "Basil helps with your Wordemic guess.", catKeys],
        ["📖", "Codebook", "Secret codes you’ve found so far.", codebook],
        ["✏️", "For DA", "Six cryptic clues, one nod.", daRoom]].concat([["🚨", "Triagic", "Never say the Q word in ED.", function () { CODES.quiet(); }]]);
      var H = ["🔐 There are " + CODE_KEYS.length + " secret codes. They’re ordinary words: some turn up as Wordemic and crossword answers. Hospitals have colour codes too…", "🍪 A tiny cookie hides on a few pages each day. Look closely.", "🐭 Tap any mascot that isn’t a link, 3 times, quickly.", "🐈 Tap the logo on the home page 3 times.",
        "😴 Sit very still for a while.", "📠 Visit at 5 o’clock on a Friday.", "🌙 Visit between midnight and 4am.", "🔧 Developers: open the browser console."];
      var d = document.createElement("div"); d.className = "mw-cab"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-label", "Cabinet of Curiosities");
      d.innerHTML = '<div class="mw-cab-in"><button type="button" class="mw-cab-x" aria-label="Close">×</button><p class="mw-cab-k">You found it</p><h2>The Cabinet of Curiosities</h2>' +
        '<p class="mw-cab-l">Curiosity is contagious. Pick one:</p><div class="mw-cab-g">' +
        A.map(function (a, i) { return '<button type="button" data-i="' + i + '"><span>' + a[0] + '</span><b>' + a[1] + '</b><i>' + a[2] + "</i></button>"; }).join("") +
        '</div><p class="mw-cab-l">Still hidden, with clues:</p><ul>' + H.map(function (h) { return "<li>" + h + "</li>"; }).join("") + "</ul></div>";
      document.body.appendChild(d);
      function close() { d.remove(); document.removeEventListener("keydown", esc); }
      function esc(e) { if (e.key === "Escape") close(); }
      document.addEventListener("keydown", esc);
      d.addEventListener("click", function (e) {
        if (e.target === d || e.target.closest(".mw-cab-x")) return close();
        var b = e.target.closest("button[data-i]"); if (!b) return;
        close(); A[+b.getAttribute("data-i")][3]();
      });
      setTimeout(function () { var f = d.querySelector("button[data-i]"); if (f) f.focus(); }, 50);
    }
    function codebook() {
      var f = get("mw-codes", []) || [];
      pill("📖 Codebook: " + f.length + " of " + CODE_KEYS.length + " found." + (f.length ? "<br>" + f.map(function (c) { return "<b>" + esc2(c) + "</b>"; }).join(" · ") : " Try a 5-letter word in Wordemic…"), 7000);
    }
    // --- code blue ---
    function codeBlue() {
      flag("code");
      var f = document.createElement("div"); f.className = "mw-codeblue"; f.setAttribute("aria-hidden", "true"); document.body.appendChild(f);
      setTimeout(function () { f.remove(); }, 2600);
      var where = (document.querySelector("main h1") || {}).textContent || "the waiting room";
      pill("🚨 Code Blue, " + esc2(where.trim().slice(0, 40)) + ". Clover is doing compressions; Basil is sitting on the defib.", 4200);
    }
    // --- doctor's handwriting ---
    function scrawl() {
      flag("scrawl");
      root.classList.add("mw-scrawl");
      pill("✍️ Doctor’s handwriting mode. Good luck, pharmacist.", 3600);
      setTimeout(function () { root.classList.remove("mw-scrawl"); }, 15000);
    }
    // --- paw prints across the screen ---
    function paws(who) {
      flag("paws");
      var y = 120 + Math.random() * Math.max(60, innerHeight - 300), n = 9, wrap = document.createElement("div");
      wrap.className = "mw-paws"; wrap.setAttribute("aria-hidden", "true");
      for (var i = 0; i < n; i++) { var p = document.createElement("span"); p.textContent = "🐾"; p.style.left = (i * (innerWidth / n) + 10) + "px"; p.style.top = (y + (i % 2 ? 18 : -6)) + "px"; p.style.animationDelay = (i * 0.22) + "s"; wrap.appendChild(p); }
      document.body.appendChild(wrap); setTimeout(function () { wrap.remove(); }, 5200);
      pill(who === "Basil" ? "🐾 Basil heard his name. He is ignoring you, but walked past to make a point." : "🐾 Clover heard her name and came to supervise.", 3600);
    }
    // --- idle: Kip falls asleep in the waiting room ---
    (function () {
      try { if (sessionStorage.getItem("mw-kip")) return; } catch (e) {}
      var t = 0, done = false;
      function reset() { if (done) return; clearTimeout(t); t = setTimeout(sleep, 180000); }
      function sleep() {
        if (done || document.hidden || document.querySelector(".qk.qk-on")) return reset();
        done = true; try { sessionStorage.setItem("mw-kip", "1"); } catch (e) {}
        flag("wait");
        var k = document.createElement("div"); k.className = "mw-kip"; k.setAttribute("aria-hidden", "true");
        k.innerHTML = '<img src="/assets/mascots/sleep.svg" alt="" width="84" height="84"><span>z</span><span>z</span><span>z</span>';
        document.body.appendChild(k);
        pill("😴 You’ve been in the waiting room a while. Kip fell asleep.", 4200);
        function wake() { k.classList.add("out"); setTimeout(function () { k.remove(); }, 500); ["mousemove", "keydown", "touchstart", "scroll"].forEach(function (ev) { removeEventListener(ev, wake); }); }
        setTimeout(function () { ["mousemove", "keydown", "touchstart", "scroll"].forEach(function (ev) { addEventListener(ev, wake, { passive: true }); }); }, 800);
      }
      ["mousemove", "keydown", "touchstart", "scroll", "click"].forEach(function (ev) { addEventListener(ev, reset, { passive: true }); });
      reset();
    })();
    // --- full-moon nights (player's local time, 6pm to 6am, within a day of the full moon): Ziggy pops up once a night with a link to Lunicorn ---
    (function () {
      if (/^\/lunicorn\//.test(location.pathname)) return;
      var n = new Date(), fm = mwFullNear(n.getTime());
      if (new Date(fm).toDateString() !== n.toDateString()) return; // full-moon day, local time
      var key = "mw-moon-" + new Date(fm).toDateString(); if (get(key, 0)) return; set(key, 1);
      setTimeout(function () { walker(M("zebritis"), { size: 90, top: 80, hop: 16, wave: 22, steps: 26, ms: 6200 }); pill('🌕 Full moon today. Ziggy has turned into something… <a href="/lunicorn/">Follow her</a>', 9000); }, 2500);
    })();
    // --- Friday 4:30 to 7pm local time: Fridaemia inbox is open ---
    (function () {
      var n = new Date(), m = n.getHours() * 60 + n.getMinutes();
      if (n.getDay() !== 5 || m < 16 * 60 + 30 || m >= 19 * 60 || /^\/fridaemia\//.test(location.pathname) || (m >= 16 * 60 + 55 && m <= 17 * 60 + 10)) return;
      var k = "mw-fridaemia-pill-" + n.toDateString(); if (get(k, 0)) return; set(k, 1);
      setTimeout(function () { pill('📥 Eight results just landed in your inbox. <a href="/fridaemia/">Fridaemia is open</a> all Friday.', 8000); }, 3000);
    })();
    // --- Friday 4:55 to 5:10pm local time ---
    (function () {
      var n = new Date(), m = n.getHours() * 60 + n.getMinutes();
      if (n.getDay() !== 5 || m < 16 * 60 + 55 || m > 17 * 60 + 10) return;
      var k = "mw-friday-" + n.toDateString(); if (get(k, 0)) return; set(k, 1);
      flag("friday");
      setTimeout(function () { pill("📠 It’s 5 o’clock on a Friday. Every referral is now marked urgent.", 4500); }, 2000);
    })();
    // --- console note ---
    try {
      console.log("%cMalady Wise%c\nHello, fellow nerd. No jobs here, just puzzles.\nType mw.ward() for a ward round.", "font:700 20px Georgia,serif;color:#4A3480", "font:13px monospace;color:inherit");
      window.mw = window.mw || {};
      window.mw.ward = function () {
        flag("console");
        console.log("%c  __/\\__/\\_____/\\__/\\_____/\\__/\\___\n  Sinus rhythm, baby. Badge unlocked: Under the Hood.", "font:13px monospace;color:#C2502E");
        return "Ward round done. Discharge summary: pending (as always).";
      };
    } catch (e) {}
    // --- night shift look: midnight to 4am local time ---

  })();
};
