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
      N: { boss: "Lifeguard Lou", nurse: "Lifeguard Mo", towel: "beach towel", prop: "rescue tube", bird: "seagull", sound: "SQUARK", place: "beach", bench: "beach towel", champs: "Beach champions", legend: "Beach Legend", ang: "SUNBURNT" },
      items: { sunscreen: "🧴", thong: "🩴", ball: "🏐", kite: "🪁", sunnies: "🕶️", shell: "🐚", cap: "🧢", spade: "🪣", ring: "🛟", umbrella: "⛱️" },
      food: { fish: "🐟", prawn: "🦐", sandwich: "🥪", melon: "🍉" }, bad: { choc: "🍫", grapes: "🍇", lolly: "🍭", softdrink: "🥤" }, spiky: { crab: "🦀", puffer: "🐡", cactus: "🌵", coral: "🪸" },
      smash: { vase: "🏰", tv: "📻", tank: "🧺" },
      badq: { choc: "Chocolate. Toxic to cats. Spat out, sensibly.", grapes: "Grapes. Not for pets. She knew.", lolly: "A lolly. Sticky, sandy betrayal.", softdrink: "Soft drink. Fizz up the nose. Never again." },
      smashq: { vase: ["Sandcastle: demolished. Moat: drained.", "That was a prize-winner. Was.", "Crash. Sand everywhere."], tv: ["Beach radio: silenced. The seagulls cheer.", "No more beach bangers.", "Static. Then the sound of waves."], tank: ["THE PICNIC BASKET. Jackpot. +1 life.", "Picnic basket raided. +1 life."] },
      camp: ["LOW TIDE", "ESKY TIME", "SEAGULL SWARM", "HIGH NOON", "LIFEGUARD LOU", "SURF'S UP", "SANDY SNACKS", "RIP CURRENT", "GOLDEN HOUR", "THE LAST SWIM"],
      ev: { cucumber: ["SANDCASTLE CONTEST! STAY STILL", "Don’t tap anything for 2 s or the sandcastle collapses"], fridge: ["ESKY OPEN! EAT FAST", "Eat fast, then tap the lifeguard’s hand before the towel comes out"], cone: ["BUCKET ON HEAD!", "@ can only see the middle. Tap the bucket 3× to shake it off"], xray: ["SUN GLARE!", "The glare flashes. Look closely: soggy food shows up"], bath: ["THE WAVE!", "Tap @ (or ↑ / W) to spin round and dodge the wave"], box: ["BEACH TENT! BOTH CATS WANT IN", "Tap fast to claim the shade: #"], clipper: ["CRAB SCUTTLE!", "Tap @ (or ↑ / W) just as the crab arrives to jump it"], shaker: "Sunscreen in… 3…" },
      bath: "🌊", cone: "🪣", visitor: "🐦",
      wall: function (c, W, B) { var g = c.createLinearGradient(0, 0, 0, B); g.addColorStop(0, "#8FD3F4"); g.addColorStop(1, "#CDEFFB"); c.fillStyle = g; c.fillRect(0, 0, W, B); c.fillStyle = "#3E9FD3"; c.fillRect(0, B - 90, W, 40); c.fillStyle = "#7CC7EC"; for (var x = 0; x < W; x += 40) { c.beginPath(); c.ellipse(x + 20, B - 90, 20, 5, 0, 0, Math.PI); c.fill(); } c.fillStyle = "#F4E1B0"; c.fillRect(0, B - 50, W, 50); },
      view: function (c) { c.fillStyle = "#3E9FD3"; c.fillRect(222, 80, 118, 30); },
      deco: [["🌴", 50, 140, 64], ["⛵", 150, 110, 30], ["☀️", 120, 50, 30]],
      bench: ["#F06C9B", "#F7A8C4", "#C94E7A", "#F6E7C1"] },
    5: { key: "ward", name: "The Ward", day: "Thursday", theme: { hud: "#2B4A80", stage: "#EEF4F8" },
      skin: { coat: "#2B4A80", collar: "#FFFFFF", lapel: "#22406E", badge: "#C2553A", name: "MATRON MAUDE", hair: "#B8B8C0", hat: "nursecap", sleeve: "#2B4A80", glove: "#FFFFFF", prop: "#2E9C8F", propLabel: "37.0°", mug: "MATRON", towel: "#FFFFFF", towelStripe: "#8BC4E8", nurse: "#2E9C8F", nurseName: "REGISTRAR" },
      N: { boss: "Matron Maude", nurse: "the Registrar", towel: "blanket", prop: "thermometer", bird: "pigeon", sound: "COO", place: "ward", bench: "hospital bed", champs: "Discharged", legend: "Ward Legend", ang: "FUMING" },
      items: { steth2: "🩺", pills2: "💊", plaster: "🩹", tube: "🧪", chart: "📋", thermo2: "🌡️", roll: "🧻", crutch: "🩼", socks: "🧦", bell: "🛎️" },
      food: { jelly: "🍮", toast: "🍞", apple2: "🍎", juice: "🧃" }, bad: { choc: "🍫", onion: "🧅", stew: "🥫", tea: "🍵" }, spiky: { cactus: "🌵", clip: "📎", scissors: "✂️", pin: "📌" },
      smash: { vase: "💐", tv: "📺", tank: "🎁" },
      badq: { choc: "Chocolate. Toxic to cats. Spat out, sensibly.", onion: "Onion soup. Onions are toxic to cats. Nope.", stew: "Mystery stew. Even the ward won’t say what’s in it.", tea: "Lukewarm tea. A crime. Spat out." },
      smashq: { vase: ["Get-well flowers: unwell.", "Vase down. Visiting hours over.", "Crash. Someone call the cleaner."], tv: ["Ward TV smashed. The daytime soaps are safe.", "No more remote fights.", "Static. Then blessed silence."], tank: ["A GET-WELL HAMPER. Jackpot. +1 life.", "Hamper opened. Grapes for everyone else. +1 life."] },
      camp: ["ADMISSION", "TEA TROLLEY", "VISITING HOURS", "NIGHT SHIFT", "MATRON MAUDE", "CALL BELL", "HOSPITAL FOOD", "WARD ROUND", "HANDOVER", "DISCHARGE DAY"],
      ev: { cucumber: ["OBS TIME! STAY STILL", "Don’t tap anything for 2 s or the obs go haywire"], fridge: ["TEA TROLLEY! EAT FAST", "Eat fast, then tap the Registrar’s hand before the blanket comes out"], cone: ["BEDPAN ON HEAD!", "@ can only see the middle. Tap the bedpan 3× to shake it off"], xray: ["X-RAY!", "The ward flips. Look closely: bad food shows up"], bath: ["SPONGE BATH!", "Tap @ (or ↑ / W) to spin round and dodge the sponge"], box: ["LINEN CUPBOARD! BOTH CATS WANT IN", "Tap fast to claim the hiding spot: #"], clipper: ["FLOOR POLISHER!", "Tap @ (or ↑ / W) just as the polisher arrives to jump it"], shaker: "Just a little scratch… 3…" },
      bath: "🧽", cone: "🥣", visitor: "🕊️",
      wall: function (c, W, B) { c.fillStyle = "#DCEAF3"; c.fillRect(0, 0, W, B); c.fillStyle = "#C3D9E7"; c.fillRect(0, B - 80, W, 80); c.fillStyle = "#FFFFFF"; c.fillRect(0, B - 84, W, 4); c.fillStyle = "#2B2340"; c.fillRect(110, 40, 70, 46); c.strokeStyle = "#5BD08A"; c.lineWidth = 2; c.beginPath(); c.moveTo(114, 64); [[128, 64], [134, 50], [140, 76], [146, 64], [176, 64]].forEach(function (p) { c.lineTo(p[0], p[1]); }); c.stroke(); },
      view: function (c) { c.fillStyle = "#9AA6B2"; [[230, 60, 20, 50], [256, 46, 22, 64], [286, 70, 18, 40], [310, 54, 24, 56]].forEach(function (b) { c.fillRect(b[0], b[1], b[2], b[3]); }); },
      deco: [["💧", 40, 70, 26], ["🪴", 52, 170, 34]],
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
  window.MW_LEVEL_CFG = CFG;

  window.MW_LEVEL = function (A, n) {
    var C = CFG[n]; if (!C || !window.MW_VET) return null;
    var ctx, S, W = A.W, H = A.H, BENCH = A.BENCH, P = "Poppins, sans-serif", rr = A.rr, circ = A.circ, ell = A.ell;
    function sync() { ctx = A.ctx(); S = A.S(); }
    function w(f) { return function () { sync(); return f.apply(null, arguments); }; }
    function t() { return S ? S.t : 0; }
    function txt(s, x, y, font, col, align, stroke, sw) { ctx.font = font; ctx.textAlign = align || "center"; ctx.lineJoin = "round"; if (stroke) { ctx.lineWidth = sw || 4; ctx.strokeStyle = stroke; ctx.strokeText(s, x, y); } ctx.fillStyle = col; ctx.fillText(s, x, y); }
    function emo(ch, size, x, y) { var im = artImg(ch), yy = y == null ? -size * 0.12 : y; if (im) { var d = size * 1.22; ctx.drawImage(im, (x || 0) - d / 2, yy - size * 0.98, d, d); return; } ctx.save(); ctx.font = size + "px " + EF; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#000"; ctx.fillText(ch, x || 0, y == null ? -size * 0.12 : y); ctx.restore(); }
    var skin = Object.assign({}, C.skin); skin.hat = HAT[C.skin.hat];
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
      if (S && S.dog) { var dy = 86 + (1 - S.dog.k) * 80 - Math.abs(Math.sin(t() * 12)) * 4 + (S.dog.gone ? (0.45 - Math.min(0.45, S.dog.t)) * 160 : 0); emo(C.visitor, 46, 281, dy + 14); }
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
