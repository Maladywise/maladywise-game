/* Basil + Clover, stages 4-10: Beach, Ward, Hell, Bath Time, Christmas, Easter, Halloween.
   Each reuses the Vet's mechanics (vet.js) with its own skin, background, emoji props and copy.
   basil.js calls MW_LEVEL(api, n) for each n in MW_LEVEL_CFG. Copy for shared Vet lines is swapped via TEXT.SAY / TEXT.SAYRE. */
(function () {
  "use strict";
  var EF = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
  // Drawn props (Nov 2026): every emoji prop is drawn from a local illustration (OpenMoji, CC BY-SA 4.0, in art/)
  // so props look the same on every phone. Falls back to the device emoji until the picture has loaded.
  var ARTMAP = {"⏳": "23F3", "☀️": "2600", "⚱️": "26B1", "⛓️": "26D3", "⛱️": "26F1", "⛵": "26F5", "✂️": "2702", "✨": "2728", "⭐": "2B50", "🌊": "1F30A", "🌡️": "1F321", "🌭": "1F32D", "🌴": "1F334", "🌵": "1F335", "🌶️": "1F336", "🌷": "1F337", "🌸": "1F338", "🌹": "1F339", "🌼": "1F33C", "🌿": "1F33F", "🍇": "1F347", "🍉": "1F349", "🍎": "1F34E", "🍕": "1F355", "🍖": "1F356", "🍗": "1F357", "🍞": "1F35E", "🍫": "1F36B", "🍬": "1F36C", "🍭": "1F36D", "🍮": "1F36E", "🍰": "1F370", "🍳": "1F373", "🍵": "1F375", "🎀": "1F380", "🎁": "1F381", "🎃": "1F383", "🎄": "1F384", "🎈": "1F388", "🎊": "1F38A", "🎨": "1F3A8", "🎻": "1F3BB", "🏐": "1F3D0", "🏰": "1F3F0", "🏺": "1F3FA", "🐇": "1F407", "🐚": "1F41A", "🐟": "1F41F", "🐡": "1F421", "🐦": "1F426", "💀": "1F480", "💊": "1F48A", "💐": "1F490", "💦": "1F4A6", "💧": "1F4A7", "💰": "1F4B0", "📋": "1F4CB", "📌": "1F4CC", "📎": "1F4CE", "📜": "1F4DC", "📠": "1F4E0", "📺": "1F4FA", "📻": "1F4FB", "🔔": "1F514", "🔥": "1F525", "🔮": "1F52E", "🔱": "1F531", "🕊️": "1F54A", "🕯️": "1F56F", "🕶️": "1F576", "🕸️": "1F578", "🗝️": "1F5DD", "🚿": "1F6BF", "🛁": "1F6C1", "🛎️": "1F6CE", "🛟": "1F6DF", "🛷": "1F6F7", "🥕": "1F955", "🥚": "1F95A", "🥛": "1F95B", "🥣": "1F963", "🥤": "1F964", "🥧": "1F967", "🥪": "1F96A", "🥫": "1F96B", "🦀": "1F980", "🦂": "1F982", "🦆": "1F986", "🦇": "1F987", "🦌": "1F98C", "🦐": "1F990", "🦴": "1F9B4", "🧀": "1F9C0", "🧁": "1F9C1", "🧃": "1F9C3", "🧄": "1F9C4", "🧅": "1F9C5", "🧢": "1F9E2", "🧦": "1F9E6", "🧪": "1F9EA", "🧯": "1F9EF", "🧴": "1F9F4", "🧸": "1F9F8", "🧹": "1F9F9", "🧺": "1F9FA", "🧻": "1F9FB", "🧼": "1F9FC", "🧽": "1F9FD", "🩴": "1FA74", "🩹": "1FA79", "🩺": "1FA7A", "🩼": "1FA7C", "🪀": "1FA80", "🪁": "1FA81", "🪒": "1FA92", "🪞": "1FA9E", "🪣": "1FAA3", "🪤": "1FAA4", "🪥": "1FAA5", "🪦": "1FAA6", "🪮": "1FAAE", "🪴": "1FAB4", "🪸": "1FAB8", "🪺": "1FABA", "🫕": "1FAD5", "🫖": "1FAD6", "🫧": "1FAE7"};
  var ARTBASE = (function () { try { return new URL("art/", document.currentScript.src).href; } catch (e) { return "/basil-clover/art/"; } })(), ART = {}, artT = 0;
  function artImg(ch) {
    var k = ARTMAP[ch]; if (!k) return null; var im = ART[k];
    if (!im) { im = ART[k] = new Image(); im.decoding = "async"; im.onload = function () { clearTimeout(artT); artT = setTimeout(function () { try { if (window.MW_ART_cb) window.MW_ART_cb(); } catch (e) {} }, 120); }; im.src = ARTBASE + k + ".svg"; }
    return im.complete && im.naturalWidth ? im : null;
  }

  // ---------- hats (drawn in the Vet module's head space: c, hx, hy, frazzled) ----------
  var HAT = {
    visor: function (c, hx, hy, fz) { c.save(); c.translate(hx, hy - 26); if (fz) c.rotate(0.2); c.fillStyle = "#F2C230"; c.beginPath(); c.ellipse(16, 4, 40, 8, 0.1, 0, 7); c.fill(); c.fillStyle = "#E03A3A"; c.fillRect(-36, -8, 72, 10); c.restore(); c.fillStyle = "#FFFFFF"; c.beginPath(); c.ellipse(hx + 2, hy + 12, 7, 5, 0, 0, 7); c.fill(); },
    nursecap: function (c, hx, hy, fz) { c.save(); c.translate(hx, hy - 44); if (fz) c.rotate(0.25); c.fillStyle = "#FFFFFF"; c.beginPath(); c.moveTo(-26, 6); c.lineTo(-20, -14); c.lineTo(20, -14); c.lineTo(26, 6); c.closePath(); c.fill(); c.strokeStyle = "#D6DEE2"; c.lineWidth = 1.5; c.stroke(); c.fillStyle = "#E03A3A"; c.fillRect(-3, -11, 6, 14); c.fillRect(-7, -7, 14, 6); c.restore(); },
    horns: function (c, hx, hy, fz) { c.fillStyle = "#B3122E"; [-1, 1].forEach(function (s) { c.beginPath(); c.moveTo(hx + s * 16, hy - 36); c.quadraticCurveTo(hx + s * 34, hy - 52, hx + s * 30, hy - (fz ? 76 : 70)); c.quadraticCurveTo(hx + s * 24, hy - 50, hx + s * 8, hy - 40); c.closePath(); c.fill(); }); },
    showercap: function (c, hx, hy, fz) { c.save(); c.translate(hx, hy - 30); if (fz) c.rotate(-0.15); c.fillStyle = "#F4A6C0"; c.beginPath(); c.ellipse(0, -6, 42, 26, 0, Math.PI, 2 * Math.PI); c.fill(); c.strokeStyle = "#E05A8A"; c.lineWidth = 4; c.beginPath(); c.moveTo(-42, -6); for (var k = -42; k <= 42; k += 7) c.lineTo(k, -6 + (k / 7 % 2 ? 3 : -1)); c.stroke(); c.fillStyle = "rgba(255,255,255,.7)"; [[-18, -20], [8, -24], [24, -14]].forEach(function (p) { c.beginPath(); c.arc(p[0], p[1], 3, 0, 7); c.fill(); }); c.restore(); },
    santa: function (c, hx, hy, fz) { c.save(); c.translate(hx, hy - 34); if (fz) c.rotate(0.2); c.fillStyle = "#C2253A"; c.beginPath(); c.moveTo(-36, 4); c.quadraticCurveTo(-10, -60, 40, -40); c.lineTo(30, -30); c.quadraticCurveTo(10, -30, 36, 4); c.closePath(); c.fill(); c.fillStyle = "#FFFFFF"; c.beginPath(); c.ellipse(0, 4, 40, 9, 0, 0, 7); c.fill(); c.beginPath(); c.arc(42, -38, 8, 0, 7); c.fill(); c.restore(); },
    bunny: function (c, hx, hy, fz) { [-1, 1].forEach(function (s) { c.save(); c.translate(hx + s * 16, hy - 40); c.rotate(s * (fz ? 0.5 : 0.2)); c.fillStyle = "#FFFFFF"; c.beginPath(); c.ellipse(0, -26, 10, 28, 0, 0, 7); c.fill(); c.fillStyle = "#F4A6C0"; c.beginPath(); c.ellipse(0, -24, 5, 20, 0, 0, 7); c.fill(); c.restore(); }); c.fillStyle = "#F4A6C0"; c.fillRect(hx - 34, hy - 42, 68, 6); },
    witch: function (c, hx, hy, fz) { c.save(); c.translate(hx, hy - 32); if (fz) c.rotate(-0.2); c.fillStyle = "#14101E"; c.strokeStyle = "#9F8AD8"; c.lineWidth = 2.5; c.beginPath(); c.ellipse(0, 0, 58, 11, 0, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-30, -2); c.lineTo(10, -76); c.lineTo(24, -60); c.lineTo(30, -2); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#7BA05B"; c.fillRect(-30, -12, 60, 8); c.fillStyle = "#F2C230"; c.fillRect(-6, -13, 12, 10); c.restore(); }
  };

  // ---------- per-stage config ----------
  var CFG = {
    4: { key: "beach", name: "The Beach", day: "Wednesday", theme: { hud: "#1F6E99", stage: "#F6E7C1" },
      skin: { coat: "#E03A3A", collar: "#F2C230", lapel: "#C22F2F", badge: "#C22F2F", name: "LIFEGUARD LOU", noSteth: true, hair: "#E8B53A", hat: "visor", sleeve: "#E03A3A", glove: "#F1C9A5", prop: "#F28C28", propLabel: "", mug: "LIFEGUARD", towel: "#5AA9DC", towelStripe: "#F2C230", nurse: "#F2B630", nurseName: "LIFEGUARD" },
      N: { boss: "Lifeguard Lou", nurse: "Lifeguard Mo", towel: "beach towel", prop: "rescue tube", bird: "seagull", sound: "SQUARK", place: "beach", bench: "picnic rug", champs: "Beach champions", legend: "Beach Legend", ang: "SUNBURNT" },
      items: { sunscreen: "🧴", thong: "🩴", ball: "🏐", kite: "🪁", sunnies: "🕶️", shell: "🐚", cap: "🧢", spade: "🪣", ring: "🛟", umbrella: "⛱️" },
      food: { fish: "🐟", prawn: "🦐", sandwich: "🥪", melon: "🍉" }, bad: { choc: "🍫", grapes: "🍇", lolly: "🍭", softdrink: "🥤" }, spiky: { crab: "🦀", puffer: "🐡", cactus: "🌵", coral: "🪸" },
      smash: { vase: "🏰", tv: "📻", tank: "🧺" },
      badq: { choc: "Chocolate. Toxic to cats. Spat out, sensibly.", grapes: "Grapes. Not for pets. She knew.", lolly: "A lolly. Sticky, sandy betrayal.", softdrink: "Soft drink. Fizz up the nose. Never again." },
      smashq: { vase: ["Sandcastle: demolished. Moat: drained.", "That was a prize-winner. Was.", "Crash. Sand everywhere."], tv: ["Beach radio: silenced. The seagulls cheer.", "No more beach bangers.", "Static. Then the sound of waves."], tank: ["THE PICNIC BASKET. Jackpot. +1 life.", "Picnic basket raided. +1 life."] },
      camp: ["LOW TIDE", "ESKY TIME", "SEAGULL SWARM", "HIGH NOON", "LIFEGUARD LOU", "SURF'S UP", "SANDY SNACKS", "RIP CURRENT", "GOLDEN HOUR", "THE LAST SWIM"],
      ev: { cucumber: ["SANDCASTLE CONTEST! STAY STILL", "Don’t tap anything for 2 s or the sandcastle collapses"], fridge: ["ESKY OPEN! EAT FAST", "Eat fast, then tap the lifeguard’s hand before the towel comes out"], cone: ["BUCKET ON HEAD!", "@ can only see the middle. Tap the bucket 3× to shake it off"], xray: ["SUN GLARE!", "The glare flashes. Look closely: soggy food shows up"], bath: ["THE WAVE!", "Tap @ (or ↑ / W) to spin round and dodge the wave"], box: ["BEACH TENT! BOTH CATS WANT IN", "Tap fast to claim the shade: #"], clipper: ["CRAB SCUTTLE!", "Tap @ (or ↑ / W) just as the crab arrives to jump it"], shaker: "Sunscreen in… 3…" },
      bath: "🌊", cone: "🪣", visitor: "🐦",
      wall: function (c, W, B) { var g = c.createLinearGradient(0, 0, 0, B); g.addColorStop(0, "#8FD3F4"); g.addColorStop(1, "#CDEFFB"); c.fillStyle = g; c.fillRect(0, 0, W, B); c.fillStyle = "#3E9FD3"; c.fillRect(0, B - 90, W, 40); c.fillStyle = "#7CC7EC"; for (var x = 0; x < W; x += 40) { c.beginPath(); c.ellipse(x + 20, B - 90, 20, 5, 0, 0, Math.PI); c.fill(); } c.fillStyle = "#F4E1B0"; c.fillRect(0, B - 50, W, 50); c.fillStyle = "#8A5A3B"; [234, 326].forEach(function (x) { c.fillRect(x - 4, 112, 8, B - 160); }); c.strokeStyle = "#8A5A3B"; c.lineWidth = 4; c.beginPath(); c.moveTo(234, 130); c.lineTo(326, 200); c.moveTo(326, 130); c.lineTo(234, 200); c.stroke(); c.fillStyle = "#6E4630"; c.fillRect(214, 110, 134, 8); c.fillStyle = "#F3E3C3"; c.fillRect(212, 16, 138, 100); c.fillStyle = "#D9C49C"; for (var y = 22; y < 116; y += 12) c.fillRect(212, y, 138, 2); c.fillStyle = "#D8352A"; c.beginPath(); c.moveTo(204, 18); c.lineTo(281, 0); c.lineTo(358, 18); c.closePath(); c.fill(); c.fillStyle = "#5A5A5A"; c.fillRect(352, 0, 3, 60); c.fillStyle = "#E23B2E"; c.fillRect(336, 2, 16, 7); c.fillStyle = "#F4C430"; c.fillRect(336, 9, 16, 7); },
      view: function (c) { c.fillStyle = "#6B4429"; c.fillRect(222, 24, 118, 86); c.fillStyle = "#7E5434"; c.fillRect(222, 24, 118, 30); c.strokeStyle = "#E23B2E"; c.lineWidth = 7; c.beginPath(); c.arc(252, 62, 15, 0, 7); c.stroke(); c.strokeStyle = "#FFFFFF"; c.lineWidth = 7; [0.3, 1.9, 3.5, 5.1].forEach(function (a) { c.beginPath(); c.arc(252, 62, 15, a, a + 0.5); c.stroke(); }); c.fillStyle = "#F4C430"; c.fillRect(300, 80, 30, 6); },
      deco: [["🌴", 40, 286, 112], ["⛵", 120, 240, 26], ["☀️", 120, 50, 30]],
      bench: ["#F06C9B", "#F7A8C4", "#C94E7A", "#F6E7C1"] },
    5: { key: "ward", name: "The Ward", day: "Thursday", theme: { hud: "#2B4A80", stage: "#EEF4F8" },
      skin: { coat: "#2B4A80", collar: "#FFFFFF", lapel: "#22406E", badge: "#C2553A", name: "MATRON MAUDE", hair: "#B8B8C0", hat: "nursecap", sleeve: "#2B4A80", glove: "#FFFFFF", prop: "#3A4256", propLabel: "", mug: "MATRON", towel: "#FFFFFF", towelStripe: "#8BC4E8", nurse: "#2E9C8F", nurseName: "REGISTRAR" },
      N: { boss: "Matron Maude", nurse: "the Registrar", towel: "blanket", prop: "defib paddle", bird: "pigeon", sound: "COO", place: "ward", bench: "hospital bed", champs: "Discharged", legend: "Ward Legend", ang: "FUMING" },
      items: { steth2: "🩺", pills2: "💊", plaster: "🩹", tube: "🧪", chart: "📋", thermo2: "🌡️", roll: "🧻", crutch: "🩼", socks: "🧦", bell: "🛎️" },
      food: { jelly: "🍮", toast: "🍞", apple2: "🍎", juice: "🧃" }, bad: { choc: "🍫", onion: "🧅", stew: "🥫", tea: "🍵" }, spiky: { cactus: "🌵", clip: "📎", scissors: "✂️", pin: "📌" },
      smash: { vase: "💐", tv: "📺", tank: "🎁" },
      badq: { choc: "Chocolate. Toxic to cats. Spat out, sensibly.", onion: "Onion soup. Onions are toxic to cats. Nope.", stew: "Mystery stew. Even the ward won’t say what’s in it.", tea: "Lukewarm tea. A crime. Spat out." },
      smashq: { vase: ["Get-well flowers: unwell.", "Vase down. Visiting hours over.", "Crash. Someone call the cleaner."], tv: ["Ward TV smashed. The daytime soaps are safe.", "No more remote fights.", "Static. Then blessed silence."], tank: ["A GET-WELL HAMPER. Jackpot. +1 life.", "Hamper opened. Grapes for everyone else. +1 life."] },
      camp: ["ADMISSION", "TEA TROLLEY", "VISITING HOURS", "NIGHT SHIFT", "MATRON MAUDE", "CALL BELL", "HOSPITAL FOOD", "WARD ROUND", "HANDOVER", "DISCHARGE DAY"],
      ev: { cucumber: ["OBS TIME! STAY STILL", "Don’t tap anything for 2 s or the obs go haywire"], fridge: ["TEA TROLLEY! EAT FAST", "Eat fast, then tap the Registrar’s hand before the blanket comes out"], cone: ["BEDPAN ON HEAD!", "@ can only see the middle. Tap the bedpan 3× to shake it off"], xray: ["X-RAY!", "The ward flips. Look closely: bad food shows up"], bath: ["SPONGE BATH!", "Tap @ (or ↑ / W) to spin round and dodge the sponge"], box: ["LINEN CUPBOARD! BOTH CATS WANT IN", "Tap fast to claim the hiding spot: #"], clipper: ["FLOOR POLISHER!", "Tap @ (or ↑ / W) just as the polisher arrives to jump it"], shaker: "Just a little scratch… 3…" },
      bath: "🧽", cone: "🥣", visitor: "🕊️",
      wall: function (c, W, B) {
        // A hospital bay (redrawn Nov 2026): curtain track, bedhead panel, monitor on a swing arm, IV stand, clock, hand gel.
        function R(x, y, w, h, r, f) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); c.fillStyle = f; c.fill(); }
        c.fillStyle = "#E4EEF1"; c.fillRect(0, 0, W, B);
        c.fillStyle = "#C9DCE2"; c.fillRect(0, B - 80, W, 80);                       // wipe-clean lower wall
        c.fillStyle = "#A9BFC8"; c.fillRect(0, B - 86, W, 6); c.fillStyle = "#D7E3E8"; c.fillRect(0, B - 86, W, 2); // bed-bumper rail
        // ceiling curtain track + bunched privacy curtain (left)
        c.fillStyle = "#B8C4CC"; c.fillRect(0, 4, W, 3);
        for (var i = 0; i < 6; i++) { c.fillStyle = i % 2 ? "#8FC1D6" : "#A9D2E3"; c.beginPath(); c.moveTo(i * 8, 8); c.lineTo(i * 8 + 8, 8); c.lineTo(i * 8 + 10, B - 26); c.lineTo(i * 8 + 1, B - 26); c.closePath(); c.fill(); }
        c.fillStyle = "#7FB3C9"; for (var j = 0; j < 6; j++) c.fillRect(j * 8 + 3, 6, 2, 4);
        c.fillStyle = "rgba(255,255,255,.35)"; for (var k = 0; k < 5; k++) c.fillRect(k * 10 + 4, 60 + k * 34, 30, 2);
        // bedhead service panel
        R(122, 192, 186, 24, 5, "#F5F8FA"); c.fillStyle = "#D2DEE4"; c.fillRect(122, 212, 186, 4);
        R(132, 172, 14, 34, 4, "#DDE5EA"); R(135, 176, 8, 22, 3, "#EAF6FB"); c.fillStyle = "#2EA44F"; c.beginPath(); c.arc(139, 190, 3, 0, 7); c.fill(); c.beginPath(); c.arc(139, 172, 4, 0, 7); c.fill(); // O2 flowmeter
        c.fillStyle = "#FFFFFF"; c.beginPath(); c.arc(160, 204, 6, 0, 7); c.fill(); c.strokeStyle = "#3A7BD5"; c.lineWidth = 2; c.stroke(); c.fillStyle = "#3A7BD5"; c.fillRect(158, 202, 4, 4); // suction
        [244, 260].forEach(function (x) { R(x, 198, 12, 12, 2, "#FFFFFF"); c.fillStyle = "#9AA6B2"; c.fillRect(x + 3, 202, 2, 4); c.fillRect(x + 7, 202, 2, 4); });   // power points
        R(278, 196, 18, 16, 3, "#FFFFFF"); c.fillStyle = "#E03A3A"; c.beginPath(); c.arc(287, 204, 5, 0, 7); c.fill();  // nurse call
        // crash cart with a defibrillator on top (left of the bed)
        R(50, 162, 66, 8, 3, "#B9C3CB"); R(54, 168, 58, B - 192, 4, "#D93636");
        [188, 214, 240, 266].forEach(function (y) { c.fillStyle = "#B02A2A"; c.fillRect(56, y, 54, 2); c.fillStyle = "#E8ECEF"; c.fillRect(76, y + 8, 14, 3); });
        R(58, 126, 50, 36, 5, "#3A4256"); R(62, 130, 30, 22, 2, "#1C2233"); R(56, 134, 6, 22, 2, "#F2C230"); R(104, 134, 6, 22, 2, "#F2C230");
        c.strokeStyle = "#5BD08A"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(63, 143); [[70, 143], [72, 137], [75, 149], [77, 143], [91, 143]].forEach(function (p) { c.lineTo(p[0], p[1]); }); c.stroke();
        c.fillStyle = "#F28C28"; c.beginPath(); c.arc(100, 138, 3.5, 0, 7); c.fill(); c.fillStyle = "#E03A3A"; c.beginPath(); c.arc(100, 148, 3, 0, 7); c.fill();
        c.font = "700 6px Poppins, sans-serif"; c.textAlign = "left"; c.fillStyle = "#F2C230"; c.fillText("DEFIB", 64, 159);
        // wall clock
        c.fillStyle = "#FFFFFF"; c.beginPath(); c.arc(198, 92, 13, 0, 7); c.fill(); c.strokeStyle = "#55607A"; c.lineWidth = 2.5; c.stroke();
        c.strokeStyle = "#2B2340"; c.lineWidth = 1.8; c.beginPath(); c.moveTo(198, 92); c.lineTo(198, 84); c.moveTo(198, 92); c.lineTo(204, 95); c.stroke();
        // hand gel dispenser
        R(140, 104, 16, 24, 3, "#FFFFFF"); c.fillStyle = "#3A7BD5"; c.fillRect(142, 110, 12, 7); c.fillStyle = "#9AA6B2"; c.fillRect(145, 128, 6, 3);
        // IV stand, bag and line
        c.fillStyle = "#AEB8C2"; c.fillRect(313, 116, 3, B - 140); c.fillRect(304, 116, 21, 3);
        R(305, 121, 18, 28, 5, "rgba(214,236,248,.95)"); c.fillStyle = "rgba(150,205,235,.8)"; c.fillRect(307, 131, 14, 15); c.fillStyle = "#FFFFFF"; c.fillRect(308, 125, 12, 5);
        c.fillStyle = "#DDEAF2"; c.fillRect(311, 150, 6, 10);
        c.strokeStyle = "rgba(120,150,170,.8)"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(314, 160); c.quadraticCurveTo(306, 200, 309, B - 26); c.stroke();
      },
      view: function (c) {
        c.fillStyle = "#9AA6B2"; [[230, 60, 20, 50], [256, 46, 22, 64], [286, 70, 18, 40], [310, 54, 24, 56]].forEach(function (b) { c.fillRect(b[0], b[1], b[2], b[3]); });
        c.fillStyle = "rgba(255,255,255,.55)"; [[234, 66], [240, 76], [260, 54], [268, 66], [314, 62], [322, 74]].forEach(function (w) { c.fillRect(w[0], w[1], 4, 5); });
        c.fillStyle = "#F1E9D6"; c.fillRect(222, 24, 118, 14); c.fillStyle = "#DCCFB2"; c.fillRect(222, 36, 118, 3); c.strokeStyle = "#B9A988"; c.lineWidth = 1; c.beginPath(); c.moveTo(330, 39); c.lineTo(330, 58); c.stroke();
      },
      drawVisitor: function (c, x, y, s) { // a proper street pigeon, facing left
        var k = s / 46; c.save(); c.translate(x, y); c.scale(k, k);
        c.fillStyle = "#5E6670"; c.beginPath(); c.moveTo(8, -14); c.lineTo(26, -10); c.lineTo(24, -4); c.lineTo(6, -8); c.closePath(); c.fill();
        c.fillStyle = "#9AA3AE"; c.beginPath(); c.ellipse(0, -14, 16, 11, -0.12, 0, 7); c.fill();
        c.fillStyle = "#B9C0C8"; c.beginPath(); c.ellipse(5, -15, 10, 7, -0.2, 0, 7); c.fill();
        c.strokeStyle = "#3E434B"; c.lineWidth = 1.8; c.beginPath(); c.moveTo(2, -13); c.lineTo(11, -15); c.moveTo(3, -10); c.lineTo(12, -12); c.stroke();
        var g = c.createLinearGradient(-14, -32, -4, -18); g.addColorStop(0, "#3E8E6E"); g.addColorStop(1, "#7A4E8E");
        c.fillStyle = g; c.beginPath(); c.ellipse(-9, -23, 7, 8, 0.2, 0, 7); c.fill();
        c.fillStyle = "#8C95A0"; c.beginPath(); c.arc(-12, -31, 6.5, 0, 7); c.fill();
        c.fillStyle = "#E8762B"; c.beginPath(); c.arc(-14, -32, 1.9, 0, 7); c.fill(); c.fillStyle = "#111"; c.beginPath(); c.arc(-14.3, -32, 0.9, 0, 7); c.fill();
        c.fillStyle = "#F2F2F2"; c.beginPath(); c.ellipse(-18.2, -31.6, 1.6, 1.1, 0, 0, 7); c.fill();
        c.fillStyle = "#3A3A3A"; c.beginPath(); c.moveTo(-18, -31); c.lineTo(-23.5, -29.6); c.lineTo(-18, -28.6); c.closePath(); c.fill();
        c.strokeStyle = "#D9737A"; c.lineWidth = 2; c.beginPath(); c.moveTo(-3, -4); c.lineTo(-4, 0); c.moveTo(3, -4); c.lineTo(4, 0); c.stroke();
        c.restore();
      },
      deco: [],
      benchFn: function (c, W, B) { // hospital bed: sheet edge + chrome side rail
        c.fillStyle = "#CFE6F3"; c.fillRect(0, B - 24, W, 6); c.fillStyle = "#B7D6E8"; c.fillRect(0, B - 18, W, 1.5);
        c.fillStyle = "#C3CCD3"; c.fillRect(64, B - 14, 232, 3); c.fillRect(64, B - 7, 232, 3); [64, 140, 220, 293].forEach(function (x) { c.fillRect(x, B - 16, 3, 14); });
        c.fillStyle = "#E8EEF2"; c.fillRect(64, B - 14, 232, 1); c.fillRect(64, B - 7, 232, 1);
      },
      propFn: function (c, side, len, glow) { // defibrillator paddle instead of a thermometer
        c.strokeStyle = "#2B2340"; c.lineWidth = 2.2; c.beginPath(); c.moveTo(side * 8, 4); c.quadraticCurveTo(-side * 10, 30, -side * 26, 22); c.stroke();
        c.beginPath(); c.moveTo(side * 4, -5); c.lineTo(side * (len - 16), -5); c.lineTo(side * (len - 16), 5); c.lineTo(side * 4, 5); c.closePath(); c.fillStyle = "#3A4256"; c.fill();
        c.fillStyle = "#F28C28"; c.beginPath(); c.arc(side * 18, -5, 3.2, 0, 7); c.fill();
        var px = side * (len - 8); c.fillStyle = "#F2C230"; c.beginPath(); c.ellipse(px, 0, 10, 16, 0, 0, 7); c.fill();
        c.fillStyle = "#D9DEE3"; c.beginPath(); c.ellipse(px + side * 2, 0, 7, 13, 0, 0, 7); c.fill();
        if (glow > 0.3) { c.strokeStyle = "#FFE14D"; c.lineWidth = 2; c.beginPath(); c.moveTo(px + side * 10, -10); c.lineTo(px + side * 16, -4); c.lineTo(px + side * 12, -2); c.lineTo(px + side * 19, 6); c.stroke(); }
      },
      bench: ["#FFFFFF", "#EEF3F6", "#9AA6B2", "#E3ECF2"] },
    6: { key: "hell", name: "Hell", day: "Friday", theme: { hud: "#5A0E1E", stage: "#3A1418" },
      skin: { coat: "#B3122E", collar: "#2B2340", lapel: "#8A0E22", badge: "#2B2340", name: "MS BRIMSTONE", noSteth: true, hair: "#2B2340", hat: "horns", sleeve: "#B3122E", glove: "#2B2340", prop: "#2B2340", propLabel: "", mug: "DEVIL", towel: "#E03A3A", towelStripe: "#8A0E22", nurse: "#5A1F2B", nurseName: "IMP" },
      N: { boss: "Ms Brimstone", nurse: "the Imp", towel: "chain", prop: "trident", bird: "bat", sound: "SCREECH", place: "Hell", bench: "lava slab", champs: "Escaped Hell", legend: "Hell Legend", ang: "INFERNAL" },
      items: { fax: "📠", scroll: "📜", skull: "💀", chain: "⛓️", candle: "🕯️", fiddle: "🎻", grave: "🪦", key: "🗝️", hourglass: "⏳", extinguisher: "🧯" },
      food: { chicken: "🍗", hotdog: "🌭", pizza: "🍕", cake: "🍰" }, bad: { chilli: "🌶️", garlic: "🧄", onion: "🧅", choc: "🍫" }, spiky: { trident: "🔱", scorpion: "🦂", cactus: "🌵", fire: "🔥" },
      smash: { vase: "⚱️", tv: "📺", tank: "💰" },
      badq: { chilli: "Ghost chilli. Clover is now a dragon.", garlic: "Garlic. Toxic to cats. Spat out, sensibly.", onion: "Onion. Toxic to cats. Even in Hell.", choc: "Devil’s chocolate. Still toxic to cats. Nope." },
      smashq: { vase: ["Urn: smashed. Somebody’s nan is everywhere.", "That was antique. Very antique.", "Crash. The souls applaud."], tv: ["Hell TV smashed. No more infomercials.", "The eternal ad break: over.", "Static. Then screaming. Normal."], tank: ["THE TREASURE CHEST. Jackpot. +1 life.", "Loot acquired. +1 life."] },
      camp: ["CHECK-IN", "THE BUFFET", "PAPERWORK", "HEATWAVE", "MS BRIMSTONE", "SCREECH HOUR", "BAD FOOD", "LAVA FLOW", "OVERTIME", "THE FINAL FORM"],
      ev: { cucumber: ["STARE INTO THE ABYSS! STAY STILL", "Don’t tap anything for 2 s or the abyss stares back"], fridge: ["THE DEVIL’S BUFFET! EAT FAST", "Eat fast, then tap the Imp’s hand before the red tape comes out"], cone: ["CAULDRON ON HEAD!", "@ can only see the middle. Tap the cauldron 3× to shake it off"], xray: ["BRIMSTONE FLASH!", "Hell flashes. Look closely: cursed food glows"], bath: ["LAVA SPLASH!", "Tap @ (or ↑ / W) to spin round and dodge the lava"], box: ["THE COFFIN! BOTH CATS WANT IN", "Tap fast to claim the coffin: #"], clipper: ["FIREBALL!", "Tap @ (or ↑ / W) just as the fireball arrives to jump it"], shaker: "Sign here… 3…" },
      bath: "🔥", cone: "🫕", visitor: "🦇",
      wall: function (c, W, B) { var g = c.createLinearGradient(0, 0, 0, B); g.addColorStop(0, "#3A0A12"); g.addColorStop(1, "#8A1E1E"); c.fillStyle = g; c.fillRect(0, 0, W, B); c.fillStyle = "#E86A1E"; for (var x = 0; x < W; x += 30) { c.beginPath(); c.moveTo(x, B); c.quadraticCurveTo(x + 8, B - 40 - (x % 60), x + 15, B - 70 - (x % 45)); c.quadraticCurveTo(x + 22, B - 40, x + 30, B); c.fill(); } c.fillStyle = "#F2C230"; for (x = 10; x < W; x += 30) { c.beginPath(); c.moveTo(x, B); c.quadraticCurveTo(x + 5, B - 20, x + 8, B - 34); c.quadraticCurveTo(x + 12, B - 18, x + 16, B); c.fill(); } },
      view: function (c) { c.fillStyle = "#C2251E"; c.fillRect(222, 86, 118, 24); c.fillStyle = "#2B0A0A"; c.beginPath(); c.moveTo(232, 86); c.lineTo(250, 56); c.lineTo(268, 86); c.fill(); },
      deco: [["🔥", 60, 80, 26], ["🕯️", 150, 90, 26], ["🔥", 196, 80, 26]],
      bench: ["#4A3A3A", "#6A5050", "#2B1E1E", "#2B1414"] },
    7: { key: "bath", name: "Bath Time", day: "Saturday", theme: { hud: "#2F7FB0", stage: "#EAF6FB" },
      skin: { coat: "#F4A6C0", collar: "#FFFFFF", lapel: "#E88AA8", badge: "#B5308A", name: "BATH BOSS BEV", noSteth: true, hair: "#C2553A", hat: "showercap", sleeve: "#F4A6C0", glove: "#FFD84D", prop: "#5AA9DC", propLabel: "", mug: "BATH BOSS", towel: "#FFFFFF", towelStripe: "#E05A8A", nurse: "#8BC4E8", nurseName: "AUNTY VAL" },
      N: { boss: "Bath Boss Bev", nurse: "Aunty Val", towel: "towel", prop: "shower hose", bird: "budgie", sound: "TWEET", place: "bathroom", bench: "bath edge", champs: "Squeaky clean", legend: "Bath Legend", ang: "STEAMING" },
      items: { shampoo: "🧴", sponge: "🧽", toothbrush: "🪥", soap: "🧼", duck: "🦆", loo: "🧻", comb: "🪮", mirror: "🪞", sock: "🧦", basket: "🧺" },
      food: { fish: "🐟", chicken: "🍗", cheese2: "🧀", milk: "🥛" }, bad: { choc: "🍫", onion: "🧅", grapes: "🍇", cupcake: "🧁" }, spiky: { razor: "🪒", scissors: "✂️", cactus: "🌵", trap: "🪤" },
      smash: { vase: "🏺", tv: "📻", tank: "🛁" },
      badq: { choc: "Chocolate. Toxic to cats. Spat out, sensibly.", onion: "Onion. Toxic to cats. Who left that in the bathroom?", grapes: "Grapes. Not for pets. She knew.", cupcake: "A bath bomb that looks like a cupcake. Fizzing betrayal." },
      smashq: { vase: ["Vase down. The bath salts are free.", "That was decorative. Was.", "Crash. Mind the tiles."], tv: ["Shower radio: drowned.", "No more singing in the shower.", "Static. Then drips."], tank: ["THE BUBBLE BATH. Jackpot. +1 life.", "Bubbles everywhere. +1 life."] },
      camp: ["RUN THE BATH", "SNACK BRIBE", "SUDS", "STEAM", "BATH BOSS BEV", "TWEET HOUR", "BAD SNACKS", "THE HAIRDRYER", "PRUNE FINGERS", "THE FINAL RINSE"],
      ev: { cucumber: ["THE SCALES! STAY STILL", "Don’t tap anything for 2 s or the bathroom scales go haywire"], fridge: ["SNACK BRIBE! EAT FAST", "Eat fast, then tap Aunty Val’s hand before the towel comes out"], cone: ["SHOWER CAP ON HEAD!", "@ can only see the middle. Tap the cap 3× to shake it off"], xray: ["LIGHTS FLICKER!", "The bathroom flickers. Look closely: bad food shows up"], bath: ["THE SHOWER!", "Tap @ (or ↑ / W) to spin round and dodge the water"], box: ["LAUNDRY BASKET! BOTH CATS WANT IN", "Tap fast to claim the basket: #"], clipper: ["THE HAIRDRYER!", "Tap @ (or ↑ / W) just as the hairdryer arrives to jump it"], shaker: "Into the bath… 3…" },
      bath: "🚿", cone: "🛁", visitor: "🐦",
      wall: function (c, W, B) { c.fillStyle = "#CFEAF5"; c.fillRect(0, 0, W, B); c.strokeStyle = "#B4DCEC"; c.lineWidth = 2; for (var x = 0; x <= W; x += 30) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, B); c.stroke(); } for (var y = 0; y < B; y += 30) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } c.fillStyle = "#AEB8C0"; c.fillRect(110, 120, 80, 5); c.fillStyle = "#F4A6C0"; c.fillRect(120, 125, 28, 44); c.fillStyle = "#8BC4E8"; c.fillRect(152, 125, 28, 36); },
      view: function (c) { c.fillStyle = "rgba(255,255,255,.55)"; c.fillRect(222, 24, 118, 86); },
      deco: [["🪴", 52, 120, 34], ["🫧", 200, 70, 24]],
      bench: ["#FFFFFF", "#F4F8FA", "#B4DCEC", "#DCEFF6"] },
    8: { key: "xmas", name: "Christmas", day: "December", season: true, theme: { hud: "#1F5C3A", stage: "#F4EFE6" },
      skin: { coat: "#C2253A", collar: "#FFFFFF", lapel: "#A81E30", badge: "#2E7D52", name: "MRS CLAUS", noSteth: true, hair: "#E8E8EC", hat: "santa", sleeve: "#C2253A", glove: "#FFFFFF", prop: "#E03A3A", propLabel: "", mug: "SANTA'S #1", towel: "#2E7D52", towelStripe: "#F2C230", nurse: "#2E7D52", nurseName: "ELF" },
      N: { boss: "Mrs Claus", nurse: "the Elf", towel: "wrapping paper", prop: "candy cane", bird: "robin", sound: "JINGLE", place: "lounge room", bench: "mantelpiece", champs: "Nice list", legend: "Christmas Legend", ang: "NAUGHTY" },
      items: { present: "🎁", bell: "🔔", stocking: "🧦", star: "⭐", bow: "🎀", candle: "🕯️", teddy: "🧸", yoyo: "🪀", popper: "🎊", ornament: "🎄" },
      food: { chicken: "🍗", prawn: "🦐", ham: "🍖", cheese2: "🧀" }, bad: { choc: "🍫", pudding: "🍮", onion: "🧅", pie: "🥧" }, spiky: { cactus: "🌵", scissors: "✂️", pin: "📌", holly: "🌿" },
      smash: { vase: "🔮", tv: "📺", tank: "🛷" },
      badq: { choc: "Chocolate. Toxic to cats. Spat out, sensibly.", pudding: "Christmas pudding. Raisins and pets don’t mix.", onion: "Onion stuffing. Onions are toxic to cats.", pie: "Fruit mince pie. Raisins again. Hard pass." },
      smashq: { vase: ["Snow globe: shattered. Blizzard on the carpet.", "That was a family heirloom. Was.", "Crash. Silent night ruined."], tv: ["Christmas movie: cancelled.", "No more carols on repeat.", "Static. Then peace on earth."], tank: ["THE SLEIGH OF PRESENTS. Jackpot. +1 life.", "Presents everywhere. +1 life."] },
      camp: ["CHRISTMAS EVE", "LUNCH", "WRAPPING", "THE TREE", "MRS CLAUS", "JINGLE HOUR", "LEFTOVERS", "BOXING DAY", "THE NAP", "SANTA'S LAST RUN"],
      ev: { cucumber: ["FAMILY PHOTO! STAY STILL", "Don’t tap anything for 2 s or the photo’s ruined"], fridge: ["CHRISTMAS LUNCH! EAT FAST", "Eat fast, then tap the Elf’s hand before the wrapping paper comes out"], cone: ["STOCKING ON HEAD!", "@ can only see the middle. Tap the stocking 3× to shake it off"], xray: ["FAIRY LIGHTS!", "The lights flash. Look closely: bad food shows up"], bath: ["THE TINSEL!", "Tap @ (or ↑ / W) to spin round and dodge the tinsel"], box: ["THE PRESENT BOX! BOTH CATS WANT IN", "Tap fast to claim the box: #"], clipper: ["TOY TRAIN!", "Tap @ (or ↑ / W) just as the train arrives to jump it"], shaker: "Presents in… 3…" },
      bath: "✨", cone: "🧦", visitor: "🦌",
      wall: function (c, W, B) { c.fillStyle = "#1F5C3A"; c.fillRect(0, 0, W, B); var cols = ["#F2C230", "#E03A3A", "#5AA9DC", "#FFFFFF"]; c.strokeStyle = "#2B2340"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 20); for (var x = 0; x <= W; x += 20) c.quadraticCurveTo(x - 10, 34, x, 20); c.stroke(); for (x = 10; x < W; x += 20) { c.fillStyle = cols[(x / 20 | 0) % 4]; c.beginPath(); c.arc(x, 28, 4, 0, 7); c.fill(); } },
      view: function (c) { c.fillStyle = "#26305E"; c.fillRect(222, 24, 118, 86); c.fillStyle = "#FFFFFF"; c.fillRect(222, 96, 118, 14); [[236, 40], [262, 60], [300, 34], [324, 70], [280, 82]].forEach(function (p) { c.beginPath(); c.arc(p[0], p[1], 2, 0, 7); c.fill(); }); },
      deco: [["🎄", 60, 150, 78], ["🧦", 150, 90, 28], ["🧦", 186, 96, 28]],
      bench: ["#8A5A2B", "#A0522D", "#5E3A1A", "#C9A66B"] },
    9: { key: "easter", name: "Easter", day: "Easter", season: true, theme: { hud: "#7A5AB0", stage: "#F4FBEF" },
      skin: { coat: "#B79AE0", collar: "#FFFFFF", lapel: "#9F82CC", badge: "#F28C28", name: "BUNNY BONNIE", noSteth: true, noGlasses: true, hair: "#7A4A2E", hat: "bunny", sleeve: "#B79AE0", glove: "#FFFFFF", prop: "#F28C28", propLabel: "", mug: "EGG HUNT", towel: "#9ED36F", towelStripe: "#E05A8A", nurse: "#F2C230", nurseName: "CHICK" },
      N: { boss: "Bunny Bonnie", nurse: "the Chick", towel: "picnic blanket", prop: "giant carrot", bird: "duck", sound: "QUACK", place: "garden", bench: "picnic table", champs: "Egg-cellent", legend: "Easter Legend", ang: "HOPPING MAD" },
      items: { egg2: "🥚", basket: "🧺", bow: "🎀", nest: "🪺", daisy: "🌼", paint: "🎨", teapot: "🫖", teddy: "🧸", balloon: "🎈", yoyo: "🪀" },
      food: { carrot2: "🥕", eggs: "🍳", fish: "🐟", cheese2: "🧀" }, bad: { choc: "🍫", bun: "🍞", tulip: "🌷", grapes: "🍇" }, spiky: { cactus: "🌵", rose: "🌹", scissors: "✂️", pin: "📌" },
      smash: { vase: "🏺", tv: "📻", tank: "🎁" },
      badq: { choc: "A chocolate egg. Toxic to cats. Spat out, sensibly.", bun: "Hot cross bun. Raisins and pets don’t mix.", tulip: "Tulips are toxic to cats. Not a salad.", grapes: "Grapes. Not for pets. She knew." },
      smashq: { vase: ["Vase down. The daffodils are free.", "That was Nan’s. Was.", "Crash. Egg hunt paused."], tv: ["Garden radio: silenced.", "No more easy listening.", "Static. Then birdsong."], tank: ["THE GIANT EGG. Jackpot. +1 life.", "Golden egg cracked. +1 life."] },
      camp: ["GOOD FRIDAY", "THE HUNT", "SPRING", "BUNS", "BUNNY BONNIE", "QUACK HOUR", "CHOCOLATE", "THE PARADE", "LONG WEEKEND", "THE GOLDEN EGG"],
      ev: { cucumber: ["EGG AND SPOON! STAY STILL", "Don’t tap anything for 2 s or the egg drops"], fridge: ["EGG HUNT! EAT FAST", "Eat fast, then tap the Chick’s wing before the blanket comes out"], cone: ["BASKET ON HEAD!", "@ can only see the middle. Tap the basket 3× to shake it off"], xray: ["SUN SHOWER!", "The light flashes. Look closely: bad food shows up"], bath: ["THE SPRINKLER!", "Tap @ (or ↑ / W) to spin round and dodge the sprinkler"], box: ["THE BURROW! BOTH CATS WANT IN", "Tap fast to claim the burrow: #"], clipper: ["LAWNMOWER!", "Tap @ (or ↑ / W) just as the mower arrives to jump it"], shaker: "Egg hunt starts in… 3…" },
      bath: "💦", cone: "🧺", visitor: "🦆",
      wall: function (c, W, B) { c.fillStyle = "#FFF6D8"; c.fillRect(0, 0, W, B); c.fillStyle = "#FFFFFF"; for (var x = 4; x < W; x += 24) { c.beginPath(); c.moveTo(x, B - 30); c.lineTo(x, B - 100); c.lineTo(x + 8, B - 110); c.lineTo(x + 16, B - 100); c.lineTo(x + 16, B - 30); c.fill(); } c.fillRect(0, B - 90, W, 6); c.fillStyle = "#9ED36F"; c.fillRect(0, B - 30, W, 30); },
      view: function (c) { c.fillStyle = "#9ED36F"; c.fillRect(222, 92, 118, 18); },
      deco: [["🌸", 40, 60, 28], ["🌷", 70, 180, 28], ["🐇", 170, 80, 30]],
      bench: ["#E05A8A", "#F4A6C0", "#B5308A", "#F4FBEF"] },
    10: { key: "halloween", name: "Halloween", day: "October", season: true, theme: { hud: "#3B2A5A", stage: "#2B2340" },
      skin: { coat: "#3B2A5A", collar: "#7BA05B", lapel: "#2E2048", badge: "#F28C28", name: "WILHELMINA", noSteth: true, hair: "#2B2340", hat: "witch", sleeve: "#3B2A5A", glove: "#9ED36F", prop: "#8A5A2B", propLabel: "", mug: "WITCH", towel: "#EDE6D6", towelStripe: "#C9BFA8", nurse: "#5B8C3A", nurseName: "GHOUL" },
      N: { boss: "Witch Wilhelmina", nurse: "the Ghoul", towel: "mummy bandage", prop: "broomstick", bird: "bat", sound: "SCREECH", place: "haunted house", bench: "crypt", champs: "Spook-tacular", legend: "Halloween Legend", ang: "CACKLING" },
      items: { pumpkin2: "🎃", candle: "🕯️", skull: "💀", broom: "🧹", grave: "🪦", web: "🕸️", ball: "🔮", potion: "🧪", bone: "🦴", key: "🗝️" },
      food: { chicken: "🍗", fish: "🐟", cheese2: "🧀", eggs: "🍳" }, bad: { choc: "🍫", lolly: "🍬", pop: "🍭", garlic: "🧄" }, spiky: { scorpion: "🦂", cactus: "🌵", pin: "📌", trident: "🔱" },
      smash: { vase: "⚱️", tv: "📺", tank: "🧁" },
      badq: { choc: "Chocolate. Toxic to cats. Spat out, sensibly.", lolly: "A lolly. Trick, not treat.", pop: "A lollipop. Sticky whiskers forever.", garlic: "Garlic. Toxic to cats. Also vampires." },
      smashq: { vase: ["Urn: smashed. Someone’s ghost is free.", "That was haunted. Was.", "Crash. Spooky."], tv: ["Horror movie: cancelled.", "No more jump scares. Except you.", "Static. Then a whisper."], tank: ["THE CUPCAKE STASH. Jackpot. +1 life.", "Treats everywhere. +1 life."] },
      camp: ["DUSK", "TRICK OR TREAT", "COBWEBS", "THE WITCHING HOUR", "WITCH WILHELMINA", "SCREECH HOUR", "BAD TREATS", "THE CRYPT", "FULL MOON", "MIDNIGHT"],
      ev: { cucumber: ["SCARE CHECK! STAY STILL", "Don’t tap anything for 2 s or the ghosts notice"], fridge: ["TRICK OR TREAT! EAT FAST", "Eat fast, then tap the Ghoul’s hand before the bandages come out"], cone: ["PUMPKIN ON HEAD!", "@ can only see the middle. Tap the pumpkin 3× to shake it off"], xray: ["LIGHTNING!", "The house flashes. Look closely: cursed food glows"], bath: ["POTION SPLASH!", "Tap @ (or ↑ / W) to spin round and dodge the potion"], box: ["THE COFFIN! BOTH CATS WANT IN", "Tap fast to claim the coffin: #"], clipper: ["BROOMSTICK!", "Tap @ (or ↑ / W) just as the broom swoops to jump it"], shaker: "Boo in… 3…" },
      bath: "🧪", cone: "🎃", visitor: "🦇",
      wall: function (c, W, B) { c.fillStyle = "#3B2A5A"; c.fillRect(0, 0, W, B); c.fillStyle = "#2E2048"; for (var x = 0; x < W; x += 40) c.fillRect(x, 0, 20, B); c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 1; for (var k = 1; k < 5; k++) { c.beginPath(); c.arc(0, 0, k * 14, 0, Math.PI / 2); c.stroke(); } [0.2, 0.6, 1.0, 1.4].forEach(function (a) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 70, Math.sin(a) * 70); c.stroke(); }); },
      view: function (c) { c.fillStyle = "#1B1430"; c.fillRect(222, 24, 118, 86); c.fillStyle = "#F4F1DE"; c.beginPath(); c.arc(306, 50, 14, 0, 7); c.fill(); },
      deco: [["🕸️", 340, 140, 30], ["🦇", 150, 60, 24], ["🎃", 60, 170, 34]],
      bench: ["#6E6A7A", "#8E8A9A", "#4A4656", "#1B1430"] }
  };
  // ---------- realistic scenery for Beach, Hell, Bath Time, Christmas, Easter, Halloween (Nov 2026) ----------
  // Same layout rules as the Ward: wall art behind everything, the window (222-340 × 24-110) drawn by back(),
  // the carrier bottom-left, and nothing bright behind the three item lanes (x 72, 180, 288) near the bench.
  (function () {
    function R(c, x, y, w, h, r, f) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } }
    function O(c, x, y, r, f) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = f; c.fill(); }
    function E(c, x, y, rx, ry, a, f) { c.beginPath(); c.ellipse(x, y, rx, ry, a || 0, 0, 7); c.fillStyle = f; c.fill(); }
    function L(c, pts, col, w) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.strokeStyle = col; c.lineWidth = w; c.stroke(); }
    function now() { return (window.performance ? performance.now() : Date.now()) / 1000; }
    function flame(c, x, y, s, k) { var f = 1 + Math.sin(now() * 9 + k) * 0.12; c.beginPath(); c.moveTo(x - 3 * s, y); c.quadraticCurveTo(x - 4 * s, y - 6 * s * f, x, y - 11 * s * f); c.quadraticCurveTo(x + 4 * s, y - 6 * s * f, x + 3 * s, y); c.closePath(); c.fillStyle = "#F6A04D"; c.fill(); E(c, x, y - 3 * s, 1.6 * s, 3 * s * f, 0, "#FFE08A"); }
    function palm(c, x, y, h, lean) { // trunk from (x, y) up h px, fronds at the top
      c.strokeStyle = "#8A6A45"; c.lineWidth = 7; c.lineCap = "round"; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + lean * 0.3, y - h * 0.6, x + lean, y - h); c.stroke();
      c.strokeStyle = "#6E5234"; c.lineWidth = 1.2; for (var i = 1; i < 9; i++) { var k = i / 9, px = x + lean * k * k, py = y - h * k; c.beginPath(); c.moveTo(px - 4, py); c.lineTo(px + 4, py - 2); c.stroke(); }
      var tx = x + lean, ty = y - h; [[-1.0, 34], [-0.35, 30], [0.25, 32], [0.9, 30], [2.6, 30], [3.4, 26]].forEach(function (a, j) {
        c.save(); c.translate(tx, ty); c.rotate(a[0]); c.fillStyle = j % 2 ? "#3E8E4E" : "#2E7D3E"; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(a[1] * 0.5, -12, a[1], 6); c.quadraticCurveTo(a[1] * 0.5, -2, 0, 0); c.fill(); c.restore(); });
      O(c, tx - 3, ty + 3, 3.5, "#7A5230"); O(c, tx + 3, ty + 4, 3.5, "#6E4630"); c.lineCap = "butt";
    }

    // ---- Beach: drawn palm, sun, boat and flags instead of emoji ----
    var beachWall = CFG[4].wall;
    CFG[4].wall = function (c, W, B) {
      beachWall(c, W, B);
      O(c, 70, 44, 22, "rgba(255,224,138,.35)"); O(c, 70, 44, 15, "#FFD23F");                                // sun
      c.fillStyle = "#6FAFC9"; c.beginPath(); c.moveTo(0, B - 90); c.quadraticCurveTo(40, B - 112, 96, B - 98); c.quadraticCurveTo(140, B - 90, 150, B - 90); c.closePath(); c.fill(); // headland
      c.fillStyle = "#FFFFFF"; c.beginPath(); c.moveTo(150, B - 104); c.lineTo(150, B - 128); c.lineTo(164, B - 106); c.closePath(); c.fill(); // sailboat
      c.fillStyle = "#E03A3A"; c.beginPath(); c.moveTo(148, B - 106); c.lineTo(148, B - 122); c.lineTo(138, B - 106); c.closePath(); c.fill();
      c.fillStyle = "#2B4A80"; c.beginPath(); c.moveTo(136, B - 103); c.lineTo(166, B - 103); c.lineTo(160, B - 97); c.lineTo(141, B - 97); c.closePath(); c.fill();
      c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 1.5; [[20, B - 74], [90, B - 66], [170, B - 78], [250, B - 70]].forEach(function (p) { c.beginPath(); c.moveTo(p[0], p[1]); c.quadraticCurveTo(p[0] + 10, p[1] - 4, p[0] + 22, p[1]); c.stroke(); });
      palm(c, 34, B - 40, 150, 22);
      [[118, B - 46], [196, B - 44]].forEach(function (p) { c.fillStyle = "#5A5A5A"; c.fillRect(p[0], p[1] - 30, 2, 30); c.fillStyle = "#E23B2E"; c.fillRect(p[0] + 2, p[1] - 30, 12, 6); c.fillStyle = "#F4C430"; c.fillRect(p[0] + 2, p[1] - 24, 12, 6); }); // red-and-yellow flags: swim between them
    };
    CFG[4].deco = [];

    // ---- Hell: a cavern office. Rock, glowing cracks, filing cabinets and a take-a-number machine ----
    CFG[6].wall = function (c, W, B) {
      var g = c.createLinearGradient(0, 0, 0, B); g.addColorStop(0, "#1E0508"); g.addColorStop(0.7, "#4A0E12"); g.addColorStop(1, "#7A1A14"); c.fillStyle = g; c.fillRect(0, 0, W, B);
      c.fillStyle = "rgba(0,0,0,.22)"; [[40, 60, 34, 18], [150, 30, 40, 14], [110, 140, 30, 20], [300, 160, 36, 16], [190, 200, 44, 18], [60, 230, 30, 14]].forEach(function (b) { E(c, b[0], b[1], b[2], b[3], 0.3, c.fillStyle); });
      c.fillStyle = "#14030A"; for (var x = 0; x < 220; x += 22) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 22, 0); c.lineTo(x + 11, 14 + (x * 7 % 22)); c.closePath(); c.fill(); }  // stalactites
      var p = 0.6 + Math.sin(now() * 2) * 0.25;
      [[[8, 120], [26, 140], [20, 168], [38, 190]], [[168, 96], [186, 112], [178, 136]], [[330, 140], [312, 168], [326, 196], [312, 220]]].forEach(function (k) { L(c, k, "#7A1A08", 5); L(c, k, "rgba(255,140,40," + p + ")", 2); });
      var lg = c.createLinearGradient(0, B - 70, 0, B); lg.addColorStop(0, "rgba(255,110,30,0)"); lg.addColorStop(1, "rgba(255,110,30,.55)"); c.fillStyle = lg; c.fillRect(0, B - 70, W, 70);
      // filing cabinets (forms in triplicate, for eternity)
      [[54, 170], [92, 196]].forEach(function (f) { var h = B - 26 - f[1]; R(c, f[0], f[1], 36, h, 3, "#5E5A62"); for (var y = f[1] + 4; y < B - 34; y += 30) { R(c, f[0] + 3, y, 30, 26, 2, "#6E6A74"); c.fillStyle = "#2B2340"; c.fillRect(f[0] + 13, y + 6, 10, 3); R(c, f[0] + 11, y + 13, 14, 8, 1, "#EDE6D6"); } });
      c.fillStyle = "#EDE6D6"; c.save(); c.translate(70, 168); c.rotate(-0.15); c.fillRect(-12, -6, 24, 6); c.restore(); c.fillStyle = "#C2251E"; c.fillRect(56, 160, 30, 3);  // paperwork + red tape
      // take-a-number machine on a pole (right)
      c.fillStyle = "#3A2B2B"; c.fillRect(312, 186, 4, B - 212); R(c, 298, 146, 32, 42, 4, "#B3122E"); R(c, 302, 152, 24, 12, 2, "#1A0A0A");
      c.font = "700 8px Poppins, sans-serif"; c.textAlign = "center"; c.fillStyle = "#FF5A3A"; c.fillText((((now() / 4) | 0) % 900 + 100).toString(), 314, 162);
      c.fillStyle = "#FFFFFF"; c.font = "800 5px Poppins, sans-serif"; c.fillText("TAKE A", 314, 174); c.fillText("NUMBER", 314, 181);
      c.fillStyle = "#F4ECD8"; c.fillRect(310, 188, 8, 6);
    };
    CFG[6].view = function (c) {
      var g = c.createLinearGradient(0, 24, 0, 110); g.addColorStop(0, "#3A0A0A"); g.addColorStop(1, "#C2401E"); c.fillStyle = g; c.fillRect(222, 24, 118, 86);
      c.fillStyle = "#1A0606"; c.beginPath(); c.moveTo(222, 92); [[236, 58], [250, 78], [266, 46], [284, 80], [302, 62], [320, 84], [340, 66], [340, 110], [222, 110]].forEach(function (q) { c.lineTo(q[0], q[1]); }); c.fill();
      c.fillStyle = "#F26A1E"; c.beginPath(); c.moveTo(222, 104); c.quadraticCurveTo(280, 92, 340, 100); c.lineTo(340, 110); c.lineTo(222, 110); c.fill();
      c.strokeStyle = "#FFD23F"; c.lineWidth = 1.5; var s = (now() * 12) % 40; [0, 40, 80].forEach(function (o) { c.beginPath(); c.moveTo(226 + o + s, 104); c.lineTo(238 + o + s, 103); c.stroke(); });
      c.fillStyle = "rgba(60,40,40,.55)"; [[250, 44, 8], [262, 38, 10], [276, 32, 8]].forEach(function (q) { O(c, q[0], q[1], q[2], c.fillStyle); });
    };
    CFG[6].deco = [];
    CFG[6].benchFn = function (c, W, B) { c.fillStyle = "#2B1E1E"; c.fillRect(0, B - 24, W, 8); var p = 0.55 + Math.sin(now() * 3) * 0.25; L(c, [[30, B - 20], [60, B - 14], [96, B - 18]], "rgba(255,120,40," + p + ")", 1.5); L(c, [[200, B - 22], [230, B - 15], [262, B - 19], [300, B - 13]], "rgba(255,120,40," + p + ")", 1.5); };

    // ---- Bath Time: subway tiles, mirror cabinet, shower curtain, towel rail, bath rim ----
    CFG[7].wall = function (c, W, B) {
      c.fillStyle = "#F7FAFB"; c.fillRect(0, 0, W, B);
      c.strokeStyle = "#DCE6EB"; c.lineWidth = 1; for (var y = 0, r = 0; y < B - 92; y += 14, r++) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); for (var x = r % 2 ? 14 : 0; x < W; x += 28) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 14); c.stroke(); } }
      c.fillStyle = "#BFE3EC"; c.fillRect(0, B - 92, W, 92); c.strokeStyle = "#A6D2DE"; for (x = 0; x < W; x += 24) { c.beginPath(); c.moveTo(x, B - 92); c.lineTo(x, B); c.stroke(); } for (y = B - 92; y < B; y += 24) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      c.fillStyle = "#7FB8C9"; c.fillRect(0, B - 96, W, 5);
      // extractor fan
      R(c, 150, 12, 28, 28, 4, "#FFFFFF"); c.strokeStyle = "#C9D2D8"; c.lineWidth = 1.5; for (var k = 18; k < 36; k += 4) { c.beginPath(); c.moveTo(155, k); c.lineTo(173, k); c.stroke(); }
      // mirror cabinet + shelf
      R(c, 70, 44, 72, 66, 5, "#D6DEE2"); var mg = c.createLinearGradient(74, 48, 138, 106); mg.addColorStop(0, "#EAF4F8"); mg.addColorStop(1, "#C7DDE6"); R(c, 74, 48, 64, 58, 3, mg);
      c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = 3; c.beginPath(); c.moveTo(86, 98); c.lineTo(110, 56); c.moveTo(98, 100); c.lineTo(116, 70); c.stroke();
      R(c, 64, 116, 84, 6, 2, "#FFFFFF"); c.fillStyle = "#D6DEE2"; c.fillRect(64, 121, 84, 2);
      R(c, 74, 98 + 6, 12, 12, 3, "#8BC4E8"); c.fillStyle = "#E05A8A"; c.fillRect(77, 92, 2, 14); c.fillStyle = "#5AA9DC"; c.fillRect(81, 94, 2, 12);       // toothbrush cup
      R(c, 120, 100, 12, 16, 3, "#F4A6C0"); c.fillStyle = "#9AA6B2"; c.fillRect(124, 94, 4, 6); c.fillRect(124, 94, 8, 2);                                   // soap pump
      // shower curtain on a rail (left)
      c.fillStyle = "#B8C4CC"; c.fillRect(0, 6, 64, 3);
      for (var i = 0; i < 6; i++) { c.fillStyle = i % 2 ? "#F4A6C0" : "#F8C3D5"; c.beginPath(); c.moveTo(i * 9, 9); c.lineTo(i * 9 + 9, 9); c.lineTo(i * 9 + 11, B - 30); c.lineTo(i * 9 + 1, B - 30); c.closePath(); c.fill(); }
      c.fillStyle = "rgba(255,255,255,.75)"; [[8, 40], [24, 72], [14, 110], [34, 140], [10, 180], [28, 214]].forEach(function (q) { O(c, q[0], q[1], 3, c.fillStyle); });
      // towel rail + towel (right)
      c.fillStyle = "#B8C4CC"; c.fillRect(288, 146, 50, 4); O(c, 288, 148, 3, "#9AA6B2"); O(c, 338, 148, 3, "#9AA6B2");
      R(c, 294, 148, 38, 70, 3, "#FFFFFF"); c.fillStyle = "#E05A8A"; c.fillRect(294, 196, 38, 5); c.fillRect(294, 205, 38, 2); c.fillStyle = "rgba(0,0,0,.05)"; c.fillRect(294, 148, 38, 6);
      // toilet roll holder
      c.fillStyle = "#B8C4CC"; c.fillRect(302, 240, 26, 3); E(c, 315, 250, 11, 9, 0, "#FFFFFF"); E(c, 315, 250, 3, 3, 0, "#D6DEE2");
    };
    CFG[7].view = function (c) {
      c.fillStyle = "rgba(240,248,252,.82)"; c.fillRect(222, 24, 118, 86);
      c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = 1; for (var x = 222; x < 360; x += 8) { c.beginPath(); c.moveTo(x, 24); c.lineTo(x - 30, 110); c.stroke(); }
      R(c, 236, 92, 18, 14, 2, "#D9734A"); E(c, 239, 86, 6, 9, -0.5, "#3E8E4E"); E(c, 251, 85, 6, 10, 0.5, "#2E7D3E"); E(c, 245, 82, 4, 10, 0, "#4FA35E");   // pot plant on the sill
      E(c, 318, 102, 9, 7, 0, "#FFD84D"); O(c, 323, 94, 5, "#FFD84D"); c.fillStyle = "#F28C28"; c.beginPath(); c.moveTo(327, 94); c.lineTo(333, 95); c.lineTo(327, 97); c.fill(); O(c, 324, 92, 1, "#2B2340"); // rubber duck
    };
    CFG[7].deco = [];
    CFG[7].benchFn = function (c, W, B) { R(c, -6, B - 26, W + 12, 12, 6, "#FFFFFF"); c.fillStyle = "#E6EEF2"; c.fillRect(0, B - 17, W, 3); c.fillStyle = "#C9D2D8"; c.fillRect(326, B - 40, 6, 16); R(c, 316, B - 44, 26, 6, 3, "#C9D2D8"); O(c, 329, B - 46, 4, "#5AA9DC"); };

    // ---- Christmas: lounge room with a real tree, garland, a framed picture and a wreath ----
    CFG[8].wall = function (c, W, B) {
      c.fillStyle = "#1F5C3A"; c.fillRect(0, 0, W, B); c.fillStyle = "#1A5233"; for (var x = 0; x < W; x += 36) c.fillRect(x, 0, 14, B);
      c.fillStyle = "#E9DFC8"; c.fillRect(0, B - 98, W, 6); c.fillStyle = "#2A6B47"; c.fillRect(0, B - 92, W, 92);
      c.strokeStyle = "#245E3E"; c.lineWidth = 2; for (x = 10; x < W; x += 70) c.strokeRect(x, B - 84, 54, 54);
      // garland with lights across the top
      var cols = ["#F2C230", "#E03A3A", "#5AA9DC", "#FFFFFF"], tw = now();
      c.strokeStyle = "#2E7D4E"; c.lineWidth = 7; c.beginPath(); c.moveTo(0, 12); for (x = 0; x < 220; x += 44) c.quadraticCurveTo(x + 22, 34, x + 44, 12); c.stroke();
      c.strokeStyle = "#3E9A5E"; c.lineWidth = 2; c.stroke();
      for (x = 11; x < 220; x += 22) { var on = ((x / 22 | 0) + (tw * 2 | 0)) % 3 !== 0, yy = 12 + Math.sin(((x % 44) / 44) * Math.PI) * 15; O(c, x, yy + 4, 3.5, on ? cols[(x / 22 | 0) % 4] : "#5A6A5A"); }
      // framed picture: a snowy cabin
      R(c, 118, 54, 74, 56, 3, "#C9A24A"); R(c, 124, 60, 62, 44, 1, "#BFD8E8"); c.fillStyle = "#FFFFFF"; c.fillRect(124, 92, 62, 12);
      c.fillStyle = "#8A5A3B"; c.fillRect(146, 80, 18, 14); c.fillStyle = "#C2253A"; c.beginPath(); c.moveTo(142, 81); c.lineTo(155, 70); c.lineTo(168, 81); c.closePath(); c.fill(); c.fillStyle = "#FFE08A"; c.fillRect(152, 84, 5, 5);
      // the tree (left), presents underneath
      c.fillStyle = "#6E4630"; c.fillRect(48, B - 70, 10, 26); R(c, 38, B - 50, 30, 22, 3, "#C2253A");
      [[B - 78, 46], [B - 116, 38], [B - 150, 28], [B - 178, 18]].forEach(function (tr, j) { c.fillStyle = j % 2 ? "#2E8A4E" : "#2A7D46"; c.beginPath(); c.moveTo(53 - tr[1], tr[0]); c.lineTo(53, tr[0] - 48); c.lineTo(53 + tr[1], tr[0]); c.closePath(); c.fill(); });
      c.strokeStyle = "#F2C230"; c.lineWidth = 1.5; [[B - 140, 22], [B - 108, 32], [B - 86, 40]].forEach(function (s) { c.beginPath(); c.moveTo(53 - s[1], s[0] - 6); c.quadraticCurveTo(53, s[0] + 6, 53 + s[1], s[0] - 10); c.stroke(); });
      [[40, B - 96, "#E03A3A"], [68, B - 100, "#5AA9DC"], [50, B - 130, "#F2C230"], [62, B - 152, "#E03A3A"], [30, B - 84, "#F2C230"], [78, B - 82, "#FFFFFF"]].forEach(function (b) { O(c, b[0], b[1], 4, b[2]); O(c, b[0] - 1.3, b[1] - 1.3, 1.2, "rgba(255,255,255,.8)"); });
      c.save(); c.translate(53, B - 230); c.fillStyle = "#FFD23F"; c.beginPath(); for (var k = 0; k < 10; k++) { var rr2 = k % 2 ? 4 : 10, a = -Math.PI / 2 + k * Math.PI / 5; c.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } c.closePath(); c.fill(); c.restore();
      R(c, 82, B - 46, 22, 18, 2, "#5AA9DC"); c.fillStyle = "#FFFFFF"; c.fillRect(91, B - 46, 4, 18); c.fillRect(82, B - 39, 22, 4);
      // wreath (right)
      c.strokeStyle = "#2E7D4E"; c.lineWidth = 9; c.beginPath(); c.arc(314, 176, 17, 0, 7); c.stroke(); c.strokeStyle = "#3E9A5E"; c.lineWidth = 3; c.stroke();
      [[300, 168], [326, 166], [318, 192], [302, 188]].forEach(function (b) { O(c, b[0], b[1], 2.8, "#E03A3A"); });
      c.fillStyle = "#C2253A"; c.beginPath(); c.moveTo(314, 160); c.lineTo(304, 154); c.lineTo(304, 166); c.closePath(); c.fill(); c.beginPath(); c.moveTo(314, 160); c.lineTo(324, 154); c.lineTo(324, 166); c.closePath(); c.fill(); O(c, 314, 160, 3, "#A81E30");
    };
    CFG[8].view = function (c) {
      c.fillStyle = "#1E2850"; c.fillRect(222, 24, 118, 86);
      c.fillStyle = "#141B3A"; [[226, 70, 30, 40], [262, 60, 34, 50], [302, 74, 36, 36]].forEach(function (h) { c.fillRect(h[0], h[1], h[2], h[3]); c.beginPath(); c.moveTo(h[0] - 3, h[1]); c.lineTo(h[0] + h[2] / 2, h[1] - 14); c.lineTo(h[0] + h[2] + 3, h[1]); c.fill(); });
      c.fillStyle = "#FFE08A"; [[232, 80], [244, 92], [270, 72], [284, 86], [310, 84], [326, 92]].forEach(function (w) { c.fillRect(w[0], w[1], 6, 6); });
      c.fillStyle = "#FFFFFF"; c.fillRect(222, 102, 118, 8); var s = now() * 14;
      for (var i = 0; i < 18; i++) { O(c, 222 + (i * 37 + Math.sin(i + s / 20) * 6) % 118, 24 + (i * 23 + s) % 86, 1.4, "rgba(255,255,255,.9)"); }
    };
    CFG[8].deco = [];
    CFG[8].benchFn = function (c, W, B) { c.fillStyle = "#6E4630"; c.fillRect(0, B - 24, W, 4); c.strokeStyle = "#2E7D4E"; c.lineWidth = 5; c.beginPath(); c.moveTo(0, B - 18); for (var x = 0; x < W; x += 60) c.quadraticCurveTo(x + 30, B - 8, x + 60, B - 18); c.stroke(); [30, 90, 150, 210, 270, 330].forEach(function (x, i) { O(c, x, B - 12, 2.6, ["#E03A3A", "#F2C230"][i % 2]); }); };

    // ---- Easter: a spring garden. Blossom tree, bunting, hedge, picket fence, tulips, a garden shed ----
    CFG[9].wall = function (c, W, B) {
      var g = c.createLinearGradient(0, 0, 0, B); g.addColorStop(0, "#BFE6FA"); g.addColorStop(1, "#EAF7FD"); c.fillStyle = g; c.fillRect(0, 0, W, B);
      E(c, 60, 40, 26, 9, 0, "#FFFFFF"); E(c, 80, 34, 18, 10, 0, "#FFFFFF"); E(c, 160, 58, 22, 7, 0, "#FFFFFF");
      c.fillStyle = "#A8D88A"; c.beginPath(); c.moveTo(0, 190); c.quadraticCurveTo(90, 160, 180, 186); c.quadraticCurveTo(260, 204, 360, 176); c.lineTo(360, B); c.lineTo(0, B); c.fill();
      // garden shed (its window is the level's window)
      R(c, 212, 14, 140, 150, 2, "#B98B5E"); c.strokeStyle = "#A07448"; c.lineWidth = 1.5; for (var x = 222; x < 352; x += 12) { c.beginPath(); c.moveTo(x, 14); c.lineTo(x, 164); c.stroke(); }
      c.fillStyle = "#7A5236"; c.beginPath(); c.moveTo(204, 18); c.lineTo(282, 0); c.lineTo(360, 18); c.lineTo(360, 22); c.lineTo(204, 22); c.closePath(); c.fill();
      // hedge and fence
      c.fillStyle = "#4F8F3E"; for (x = 0; x < W; x += 22) O(c, x + 11, 214, 16, "#4F8F3E"); c.fillRect(0, 214, W, 26);
      c.fillStyle = "#FFFFFF"; c.fillRect(0, 248, W, 5); c.fillRect(0, 270, W, 5);
      for (x = 4; x < W; x += 18) { c.beginPath(); c.moveTo(x, B - 24); c.lineTo(x, 238); c.lineTo(x + 5, 230); c.lineTo(x + 10, 238); c.lineTo(x + 10, B - 24); c.closePath(); c.fillStyle = "#FFFFFF"; c.fill(); c.fillStyle = "rgba(0,0,0,.06)"; c.fillRect(x + 8, 238, 2, B - 262); }
      // blossom tree (left)
      c.fillStyle = "#7A5236"; c.beginPath(); c.moveTo(70, B - 26); c.lineTo(80, 120); c.lineTo(90, 120); c.lineTo(96, B - 26); c.closePath(); c.fill();
      L(c, [[84, 140], [60, 110]], "#7A5236", 5); L(c, [[86, 130], [112, 100]], "#7A5236", 4);
      [[58, 96, 26], [90, 78, 30], [120, 98, 22], [76, 114, 20], [106, 120, 18]].forEach(function (b) { O(c, b[0], b[1], b[2], "#F8C3D5"); });
      c.fillStyle = "#FFFFFF"; [[50, 90], [70, 74], [96, 66], [118, 90], [84, 104], [64, 112], [104, 112], [126, 104]].forEach(function (b) { O(c, b[0], b[1], 2.4, "#FFFFFF"); O(c, b[0], b[1], 1, "#E05A8A"); });
      // bunting from the tree to the shed
      var bc = ["#E05A8A", "#F2C230", "#7FC4B0", "#B79AE0"]; c.strokeStyle = "#8A6A45"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(120, 70); c.quadraticCurveTo(168, 96, 212, 60); c.stroke();
      for (var i = 0; i < 7; i++) { var k = (i + 0.5) / 7, bx = 120 + 92 * k, by = (1 - k) * (1 - k) * 70 + 2 * (1 - k) * k * 96 + k * k * 60; c.fillStyle = bc[i % 4]; c.beginPath(); c.moveTo(bx - 5, by); c.lineTo(bx + 5, by); c.lineTo(bx, by + 11); c.closePath(); c.fill(); }
      // tulips along the fence (away from the item lanes) and a hidden egg
      [[118, "#E03A3A"], [134, "#F2C230"], [226, "#E05A8A"], [242, "#E03A3A"], [330, "#F2C230"], [346, "#B79AE0"]].forEach(function (f) { L(c, [[f[0], B - 24], [f[0], B - 48]], "#3E8E4E", 2); E(c, f[0] + 5, B - 40, 5, 2.5, -0.5, "#4F8F3E"); c.fillStyle = f[1]; c.beginPath(); c.moveTo(f[0] - 5, B - 56); c.lineTo(f[0] - 2, B - 51); c.lineTo(f[0], B - 57); c.lineTo(f[0] + 2, B - 51); c.lineTo(f[0] + 5, B - 56); c.quadraticCurveTo(f[0] + 6, B - 44, f[0], B - 46); c.quadraticCurveTo(f[0] - 6, B - 44, f[0] - 5, B - 56); c.fill(); });
      E(c, 248, B - 30, 6, 8, 0.2, "#B79AE0"); c.strokeStyle = "#FFFFFF"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(243, B - 31); c.lineTo(253, B - 29); c.stroke();
    };
    CFG[9].view = function (c) {
      c.fillStyle = "#5A4030"; c.fillRect(222, 24, 118, 86);
      c.fillStyle = "#3E2C20"; c.fillRect(222, 88, 118, 22);
      L(c, [[240, 30], [244, 88]], "#C9A66B", 2.5); c.strokeStyle = "#8E8A9A"; c.lineWidth = 2; for (var k = 0; k < 5; k++) { c.beginPath(); c.moveTo(234 + k * 3, 30); c.lineTo(234 + k * 3, 38); c.stroke(); } // rake
      R(c, 268, 70, 26, 20, 4, "#5AA9DC"); L(c, [[294, 76], [308, 66]], "#5AA9DC", 4); c.strokeStyle = "#3E7BB0"; c.lineWidth = 3; c.beginPath(); c.arc(281, 70, 9, Math.PI, 2 * Math.PI); c.stroke(); // watering can
      [[318, 80], [332, 84]].forEach(function (p) { R(c, p[0] - 6, p[1], 12, 10, 2, "#D9734A"); O(c, p[0], p[1] - 4, 6, "#4F8F3E"); });
    };
    CFG[9].deco = [];
    CFG[9].benchFn = function (c, W, B) { for (var x = 0; x < W; x += 12) { c.fillStyle = (x / 12) % 2 ? "#FFFFFF" : "#F4A6C0"; c.fillRect(x, B - 24, 12, 6); c.fillStyle = (x / 12) % 2 ? "#F4A6C0" : "#FFFFFF"; c.fillRect(x, B - 18, 12, 6); } };

    // ---- Halloween: haunted parlour. Wainscoting, cobwebs, a portrait with blinking eyes, candelabra, moonlit tree ----
    CFG[10].wall = function (c, W, B) {
      c.fillStyle = "#3B2A5A"; c.fillRect(0, 0, W, B); c.fillStyle = "#33244E"; for (var x = 0; x < W; x += 30) c.fillRect(x, 0, 12, B);
      c.fillStyle = "#4A3A2A"; c.fillRect(0, B - 100, W, 6); c.fillStyle = "#2A1E2E"; c.fillRect(0, B - 94, W, 94);
      c.strokeStyle = "#3A2A3E"; c.lineWidth = 2; for (x = 8; x < W; x += 60) c.strokeRect(x, B - 86, 46, 56);
      // cobweb, top-left
      c.strokeStyle = "rgba(230,225,240,.55)"; c.lineWidth = 1; for (var a = 0; a <= 6; a++) { var an = a / 6 * Math.PI / 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(an) * 70, Math.sin(an) * 70); c.stroke(); }
      [18, 34, 52].forEach(function (r) { c.beginPath(); for (var a = 0; a <= 6; a++) { var an = a / 6 * Math.PI / 2, rr2 = r - (a % 2 ? 4 : 0); c.lineTo(Math.cos(an) * rr2, Math.sin(an) * rr2); } c.stroke(); });
      L(c, [[40, 50], [40, 76]], "rgba(230,225,240,.55)", 1); O(c, 40, 80, 4, "#14101E"); [-1, 1].forEach(function (s) { L(c, [[40, 80], [40 + s * 7, 76]], "#14101E", 1); L(c, [[40, 81], [40 + s * 7, 85]], "#14101E", 1); });
      // portrait with eyes that follow you (blink every few seconds)
      R(c, 110, 40, 66, 82, 6, "#8A6A2A"); R(c, 116, 46, 54, 70, 4, "#1B1430"); E(c, 143, 80, 18, 22, 0, "#2E2440");
      c.fillStyle = "#2E2440"; c.beginPath(); c.moveTo(127, 66); c.lineTo(130, 52); c.lineTo(137, 62); c.fill(); c.beginPath(); c.moveTo(159, 66); c.lineTo(156, 52); c.lineTo(149, 62); c.fill();
      var bl = (now() % 4) > 3.85; [136, 150].forEach(function (ex) { if (bl) { c.fillStyle = "#FFE14D"; c.fillRect(ex - 3, 77, 6, 1.5); } else { E(c, ex, 78, 3, 4, 0, "#FFE14D"); O(c, ex + 1, 78, 1.3, "#14101E"); } });
      R(c, 132, 124, 22, 8, 2, "#8A6A2A");
      // side table with a candelabra (right)
      c.fillStyle = "#4A3426"; c.fillRect(290, 212, 52, 6); c.fillRect(296, 218, 4, B - 244); c.fillRect(332, 218, 4, B - 244);
      c.fillStyle = "#B8A16A"; c.fillRect(314, 176, 4, 36); c.fillRect(300, 186, 32, 3); c.fillRect(300, 176, 3, 12); c.fillRect(329, 176, 3, 12); E(c, 316, 212, 10, 3, 0, "#B8A16A");
      [[301, 166], [316, 162], [330, 166]].forEach(function (cd, i) { c.fillStyle = "#EDE6D6"; c.fillRect(cd[0] - 2.5, cd[1], 5, 12); flame(c, cd[0], cd[1], 0.7, i); });
      // jack-o'-lantern by the wall
      E(c, 104, B - 40, 15, 12, 0, "#F28C28"); E(c, 104, B - 40, 6, 12, 0, "#E07A1E"); c.fillStyle = "#3E7A2E"; c.fillRect(102, B - 56, 4, 6);
      c.fillStyle = "#FFE08A"; [[98, B - 44], [110, B - 44]].forEach(function (e) { c.beginPath(); c.moveTo(e[0] - 3, e[1] + 2); c.lineTo(e[0], e[1] - 3); c.lineTo(e[0] + 3, e[1] + 2); c.fill(); });
      c.beginPath(); c.moveTo(96, B - 36); c.lineTo(112, B - 36); c.lineTo(109, B - 32); c.lineTo(104, B - 34); c.lineTo(99, B - 32); c.closePath(); c.fill();
    };
    CFG[10].view = function (c) {
      var g = c.createLinearGradient(0, 24, 0, 110); g.addColorStop(0, "#14101E"); g.addColorStop(1, "#3B2A5A"); c.fillStyle = g; c.fillRect(222, 24, 118, 86);
      O(c, 306, 48, 14, "#F4F1DE"); O(c, 300, 44, 3, "#E2DEC8"); O(c, 311, 54, 2.5, "#E2DEC8");
      c.fillStyle = "#0E0A16"; c.beginPath(); c.moveTo(222, 100); c.quadraticCurveTo(280, 88, 340, 98); c.lineTo(340, 110); c.lineTo(222, 110); c.fill();
      L(c, [[250, 100], [252, 70], [240, 52]], "#0E0A16", 4); L(c, [[252, 72], [266, 58], [276, 54]], "#0E0A16", 2.5); L(c, [[251, 82], [236, 74]], "#0E0A16", 2); L(c, [[244, 58], [232, 50]], "#0E0A16", 1.5);
      var f = Math.sin(now() * 10) * 3, bx = 280 + Math.sin(now() * 0.7) * 20, by = 66 + Math.cos(now() * 0.9) * 6;
      c.fillStyle = "#0E0A16"; c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(bx - 6, by - 6 - f, bx - 12, by - 2); c.quadraticCurveTo(bx - 7, by, bx, by + 2); c.quadraticCurveTo(bx + 7, by, bx + 12, by - 2); c.quadraticCurveTo(bx + 6, by - 6 - f, bx, by); c.fill();
    };
    CFG[10].deco = [];
    CFG[10].benchFn = function (c, W, B) { c.fillStyle = "#5E5A6A"; c.fillRect(0, B - 24, W, 6); L(c, [[40, B - 24], [52, B - 18], [48, B - 12]], "#3A3646", 1.2); L(c, [[230, B - 24], [238, B - 16]], "#3A3646", 1.2); c.fillStyle = "#EDE6D6"; [[150, 5], [210, 4]].forEach(function (d) { c.fillRect(d[0], B - 24, 3, d[1]); }); };
  })();

  window.MW_LEVEL_CFG = CFG;

  window.MW_LEVEL = function (A, n) {
    var C = CFG[n]; if (!C || !window.MW_VET) return null;
    var ctx, S, W = A.W, H = A.H, BENCH = A.BENCH, P = "Poppins, sans-serif", rr = A.rr, circ = A.circ, ell = A.ell;
    function sync() { ctx = A.ctx(); S = A.S(); }
    function w(f) { return function () { sync(); return f.apply(null, arguments); }; }
    function t() { return S ? S.t : 0; }
    function txt(s, x, y, font, col, align, stroke, sw) { ctx.font = font; ctx.textAlign = align || "center"; ctx.lineJoin = "round"; if (stroke) { ctx.lineWidth = sw || 4; ctx.strokeStyle = stroke; ctx.strokeText(s, x, y); } ctx.fillStyle = col; ctx.fillText(s, x, y); }
    function emo(ch, size, x, y) { var im = artImg(ch), yy = y == null ? -size * 0.12 : y; if (im) { var d = size * 1.22; ctx.drawImage(im, (x || 0) - d / 2, yy - size * 0.98, d, d); return; } ctx.save(); ctx.font = size + "px " + EF; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#000"; ctx.fillText(ch, x || 0, y == null ? -size * 0.12 : y); ctx.restore(); }
    var skin = Object.assign({}, C.skin); skin.hat = HAT[C.skin.hat]; if (C.propFn) skin.propFn = C.propFn;
    var V = window.MW_VET(Object.assign({}, A, { skin: skin })); if (!V) return null;
    var N = C.N;

    // ---------- copy ----------
    function keys(o) { return Object.keys(o); }
    var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); }, UP = function (s) { return s.toUpperCase(); };
    var TEXT = {
      ITEMS: keys(C.items), FOOD: keys(C.food).concat(["jerky", "sardine"]), BADFOOD: keys(C.bad), SPIKY: keys(C.spiky), TREATS: ["jerky", "sardine"],
      KICKQ: ["Off the " + N.bench + ". Gravity: still works.", "Kicked into next week.", "He calls it tidying.", "Smug level: maximum.", "The " + N.bench + " is clear. Mostly.", "Not a cat. A critic.", "That’s what the floor is for.", "Peak Basil behaviour.", "Yeet. Smugly.", "Nothing is safe. Nothing."],
      BOREDQ: ["He got bored. Typical.", "One left on the " + N.bench + ". Lazy.", "Missed a kick. He blames " + N.boss + ".", "One survived. It’s gloating.", "Too busy sulking."],
      HUNGRYQ: ["Clover is hungry. Everyone is nervous.", "Food left uneaten. Appalling.", "Clover Piggington wants seconds.", "Hungry. The Whingapotamus whinges.", "Food escaped. Clover will leave a one-star review."],
      MOTHQ: ["Fly eaten. FRENZY!", "Crunchy. Buzzy. FRENZY!", "Bonus protein. FRENZY!", "Fly: caught. FRENZY!"],
      OUCHQ: ["Ouch. That one bites back.", "Basil has learned nothing. Again.", "Prickly: 1, Basil: 0.", "Paw, meet pain.", "Some things you don’t kick."],
      HEDGEQ: ["That was a hedgehog. Asleep. Was.", "Never kick a sleeping hedgehog. Rule one.", "Prickly lesson. Very prickly.", "The hedgehog has filed a complaint.", "Bold move. Wrong, and also rude."],
      BADQ: C.badq, SMASHQ: C.smashq,
      CAMP_NAME: [null].concat(C.camp),
      CAMP_TIP: [null, "A new place. Basil hates it already. Kick everything off the " + N.bench + ".", "Clover’s turn: eat the food. Not the stuff that’s bad for cats.", "Faster. More prickly things. The flies are out.", "Faster again. The fleas are hopping.", "BOSS: " + N.boss + ". Hit the glowing spots. Jump the " + N.prop + ". Wriggle out of the " + N.towel + ".", "Faster. The " + N.bird + " is restless.", "Faster. Bad food everywhere. Spot it.", "Faster. Heavier things. The ginger cat is cockier.", "Faster. Everyone’s yawning.", "Top speed. One life. Then " + N.boss + " and " + N.nurse + "."],
      CTITLES: [[5, "Unruly"], [10, "Feral"], [15, "Needs Backup"], [25, "Banned for Life"], [40, N.legend]],
      SPOTS: ["CLIPBOARD", "HAT", "MUG"],
      NURSELABEL: UP(N.nurse.replace(/^the /, "")) + " · " + UP(N.towel) + "S",
      KEY: C.key, THEME: C.theme
    };
    TEXT.SAY = {
      "FRAZZLED!": N.ang + "!", " · FRAZZLED": " · " + N.ang, ": The Vet": ": " + C.name,
      "Clean bill of health · all 10 vet rounds": N.champs + " · all 10 rounds", "Check-up Legend": N.legend,
      "The bribe was a trap. Towel out. Clover lost 3 seconds.": "The bribe was a trap. " + cap(N.towel) + " out. Clover lost 3 seconds.", "Towelled! -": "Wrapped! -",
      "47 KG?! HAYWIRE": "HAYWIRE!", "Perfect weigh-in +": "Perfectly still +", "COCKATOO! SQUAWK: ": UP(N.bird) + "! " + N.sound + ": ",
      "Sat on that tail! +": "Dodged it! +", "Flinched early. Vaccinated. Annoyingly healthy.": "Flinched early. Got you.",
      "TREAT POCKET! ×3": "POCKET! ×3", "Half health. Glasses askew, coffee spilt, and faster now. Rude.": "Half health. Hat askew, drink spilt, and faster now. Rude.",
      "Echidna!": "Hedgehog!", "THE VET WON": UP(N.boss) + " WON", "Confiscated! ‘Not on her diet.’": "Confiscated! ‘Not for cats.’", "PEN TORCH · ": "TORCH · ",
      "TANGLED IN TOWEL!": "TANGLED UP!", "BURRITO’D! -25%": "WRAPPED! -25%", "TEMPERATURE TAKEN. -10%": "GOT YOU. -10%",
      "The cockatoo! SQUAWK: everything falls twice as fast. Tap it to hiss it off.": "The " + N.bird + "! " + N.sound + ": everything falls twice as fast. Tap it to hiss it off.",
      "Too slow. The vet’s distracted now.": "Too slow. " + N.boss + "’s distracted now.", "DR POKESWORTH IS": UP(N.boss) + " IS", "DR POKESWORTH · ": UP(N.boss) + " · ",
      "VET GIVES UP": UP(N.boss) + " GIVES UP", "SQUAWK!": N.sound + "!", "VET!": "BOSS!", "THE VET’S BACK. WITH A NURSE": UP(N.boss) + "’S BACK. WITH BACKUP"
    };
    TEXT.SAYRE = [
      [/All ten vet rounds\. Dr Pokesworth handed over the treat jar, Nurse Burrito waved a white towel and the echidna slept through it all\./, "All ten rounds. " + N.boss + " gave up, " + N.nurse + " waved a white flag and the hedgehog slept through it all."],
      [/Vet Endless unlocked/g, C.name + " Endless unlocked"], [/Temperature taken\. 38\.6°\. Dignity: 0%\./g, "Got you. Dignity: 0%."],
      [/Dr Pokesworth/g, N.boss], [/Nurse Burrito/g, N.nurse], [/\bnurse\b/g, N.nurse.replace(/^the /, "")], [/\bthe vet\b/g, N.boss], [/\bvet\b/g, N.place], [/\bVet\b/g, C.name], [/\bVET\b/g, UP(N.place)],
      [/\bhimself\b/g, "herself"], [/before he gets/g, "before she gets"], [/Caught\. Vaccinated\./g, "Caught."], [/^Vaccinated\. /, "Got you. "], [/^CONE TOSS!$/, "INCOMING!"], [/^SWAT THE CONE!$/, "SWAT IT!"],
      [/cockatoo/g, N.bird], [/Cockatoo/g, cap(N.bird)], [/thermometer/g, N.prop], [/Thermometer/g, cap(N.prop)], [/THERMOMETER/g, UP(N.prop)],
      [/towel/g, N.towel], [/Towel/g, cap(N.towel)], [/TOWEL/g, UP(N.towel)], [/clinic/g, N.place], [/exam table/g, N.bench], [/[Rr]eception/g, "the boss"], [/waiting room/g, N.place]
    ];

    // ---------- scenery ----------
    function back() {
      var nk = S ? S.nightK || 0 : 0;
      C.wall(ctx, W, BENCH);
      rr(222, 24, 118, 86, 8); ctx.fillStyle = nk > 0.5 ? "#26305E" : nk > 0.15 ? "#E9A77A" : "#BFE0F2"; ctx.fill();
      ctx.save(); rr(222, 24, 118, 86, 8); ctx.clip();
      if (nk > 0.5) circ(312, 44, 9, "#F4F1DE"); else circ(310, 46 + nk * 120, 10, nk > 0.15 ? "#F6A04D" : "#FFE08A");
      C.view(ctx);
      if (S && S.dog) { var dy = 86 + (1 - S.dog.k) * 80 - Math.abs(Math.sin(t() * 12)) * 4 + (S.dog.gone ? (0.45 - Math.min(0.45, S.dog.t)) * 160 : 0); if (C.drawVisitor) C.drawVisitor(ctx, 281, dy + 14, 46); else emo(C.visitor, 46, 281, dy + 14); }
      if (S && S.tom) V.ginger(281 + (S.tom.hitT > 0 ? Math.sin(t() * 80) * 4 : 0), 98 + (1 - S.tom.k) * 80, 0.4, true);
      ctx.restore();
      rr(222, 24, 118, 86, 8); ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 6; ctx.stroke();
      C.deco.forEach(function (d) { emo(d[0], d[3], d[1], d[2]); });
      V.carrier(36, BENCH - 22, true, null, 0.8);
    }
    function table() {
      var b = C.bench;
      ctx.fillStyle = b[0]; ctx.fillRect(0, BENCH - 24, W, 26); ctx.fillStyle = b[1]; ctx.fillRect(0, BENCH - 24, W, 5);
      if (S && S.sinkT > 0) { ctx.fillStyle = "rgba(120,190,230,.35)"; ctx.fillRect(0, BENCH - 24, W, 8); }
      ctx.fillStyle = b[2]; ctx.fillRect(0, BENCH + 2, W, 6); ctx.fillStyle = b[3]; ctx.fillRect(0, BENCH + 8, W, H - BENCH);
      ctx.strokeStyle = "rgba(0,0,0,.06)"; ctx.lineWidth = 2; for (var i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(i * 120, BENCH + 14); ctx.lineTo(i * 120, H); ctx.stroke(); }
      if (C.benchFn) C.benchFn(ctx, W, BENCH);
    }
    function heatPad(sleeping) { if (sleeping) V.heatPad(true); }

    // ---------- props ----------
    var EM = {}; [C.items, C.food, C.bad, C.spiky].forEach(function (o) { Object.keys(o).forEach(function (k) { EM[k] = o[k]; }); });
    C.deco.forEach(function (d) { artImg(d[0]); }); [C.bath, C.cone, C.visitor].forEach(function (ch) { if (ch) artImg(ch); }); Object.keys(EM).forEach(function (k) { artImg(EM[k]); });
    var ALIAS = { vase: "_vase", tv: "_tv", tank: "_tank" }; EM._vase = C.smash.vase; EM._tv = C.smash.tv; EM._tank = C.smash.tank;
    function has(k) { if (k === "hedgehog") return false; return !!(EM[ALIAS[k] || k]) || V.has(k); }
    function item(kind) { var k = ALIAS[kind] || kind; if (EM[k]) { emo(EM[k], k.charAt(0) === "_" ? 50 : 34, 0); return true; } return V.item(kind); }

    // ---------- events ----------
    function bannerFor(e, catName, taps) {
      var b = V.bannerFor(e, catName, taps); if (!b) return b; var F = C.ev[e.m];
      if (e.m === "shaker") F = e.t < e.rattle ? ["“" + UP(C.ev.shaker) + "”", "Freeze. Wait for BOLT. Flinch early and you’re caught"] : e.fake ? ["…", "Fake-out. Don’t move"] : ["BOLT! TAP!", "First tap escapes: double points"];
      if (F && typeof F !== "string") { b[0] = F[0]; b[1] = F[1].replace("@", catName).replace("#", taps); }
      return b;
    }
    function evDraw(e, cat, a) {
      var live = !e.done;
      if (e.m === "bath" && live) { var p = Math.min(1, e.t / e.dur), hy = -40 + p * (BENCH - 170 + 40); emo(C.bath, 46, 186 + Math.sin(t() * 3) * 6, hy + 40); ctx.strokeStyle = "rgba(194,85,58,.6)"; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(180, BENCH - 120, 62, 0, 7); ctx.stroke(); ctx.setLineDash([]); return; }
      if (e.m === "cone" && live) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.ellipse(180, 236, 92, 150, 0, 0, 7); ctx.fillStyle = "rgba(20,18,30,.62)"; ctx.fill("evenodd"); ctx.restore(); emo(C.cone, 60, 180 + (e.jig > 0 ? Math.sin(t() * 80) * 4 : 0), 112); txt("TAP IT " + e.taps + "/3", 180, 140, "900 12px " + P, "#2B5E80", "center", "#FFFFFF", 4); return; }
      if (e.m === "shaker") {
        ctx.save(); ctx.globalAlpha = a; var go = e.t >= e.rattle && !e.fake && !e.done, base = C.ev.shaker.replace(/ 3…$/, "");
        var msg = e.done ? "" : go ? "…1!" : e.t >= e.rattle ? "2 and a half…" : e.t < e.rattle * 0.5 ? C.ev.shaker : "…2…";
        if (msg) { ctx.font = "italic 800 13px " + P; var tw = ctx.measureText(msg).width + 26; rr(W - tw - 62, 196, tw, 32, 12); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 2; ctx.stroke(); txt(msg, W - tw / 2 - 62, 217, "italic 800 13px " + P, go ? "#C2553A" : "#2B2340"); }
        if (go) txt("BOLT!", 180, 182, "900 30px " + P, "#B5308A", "center", "#FFFFFF", 7);
        ctx.restore(); return base;
      }
      V.evDraw(e, cat, a);
    }
    function celebText(tt, q) {
      var k = Math.min(1, tt / 0.45), sc = q ? 1 : 0.5 + 0.5 * k + Math.sin(Math.min(1, tt / 0.6) * Math.PI) * 0.12;
      ctx.save(); ctx.translate(180, BENCH + 50); ctx.scale(sc, sc);
      txt(UP(N.champs), 0, 0, "900 25px " + P, "#FFE08A", "center", "#2B2340", 7);
      if (tt > 0.5) txt(UP(N.legend), 0, 28, "900 18px " + P, "#FF8AD0", "center", "#2B2340", 6);
      if (tt > 1) txt("All 10 rounds · +15,000", 0, 50, "800 12px " + P, "#FFFFFF", "center", "#2B2340", 4);
      ctx.restore();
    }
    function thumb() { back(); var b = { x: 205, cats: { b: { pull: 0 }, c: { pull: 0 } } }; V.bossBack(b); table(); V.bossFront(b, { b: { x: 46 }, c: { x: 314 } }); }

    var out = Object.assign({}, V);
    out.TEXT = TEXT; out.has = has; out.item = w(item); out.back = w(back); out.table = w(table); out.heatPad = w(heatPad);
    out.bannerFor = function (e, c, tp) { sync(); return bannerFor(e, c, tp); }; out.evDraw = w(evDraw); out.celebText = w(celebText); out.thumb = w(thumb);
    out.cfg = C;
    return out;
  };
})();
