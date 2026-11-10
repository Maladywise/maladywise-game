/* Basil + Clover, Stage 3: THE FARM. A barn, a hay-bale bench, farm junk to kick and farm food to eat.
   The Farm reuses the Vet's mechanics (events, boss attacks) from vet.js with a farm skin:
   Dr Pokesworth becomes Farmer Fern (overalls, straw hat), Nurse Burrito becomes Farmhand Pip,
   towels become hessian sacks, the thermometer lunge becomes a rake. Copy is swapped via TEXT.SAY / TEXT.SAYRE.
   basil.js calls MW_FARM(api) once; this file returns the same API shape as MW_VET. */
(function () {
  "use strict";
  window.MW_FARM = function (A) {
    if (!window.MW_VET) return null;
    var ctx, S, W = A.W, H = A.H, BENCH = A.BENCH, P = "Poppins, sans-serif";
    var rr = A.rr, circ = A.circ, ell = A.ell;
    function sync() { ctx = A.ctx(); S = A.S(); }
    function w(f) { return function () { sync(); return f.apply(null, arguments); }; }
    function t() { return S ? S.t : 0; }
    function line(pts, col, lw) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke(); }
    function txt(s, x, y, font, col, align, stroke, sw) { ctx.font = font; ctx.textAlign = align || "center"; ctx.lineJoin = "round"; if (stroke) { ctx.lineWidth = sw || 4; ctx.strokeStyle = stroke; ctx.strokeText(s, x, y); } ctx.fillStyle = col; ctx.fillText(s, x, y); }

    // Farmer Fern's straw hat (drawn in the Vet module's head space)
    function hat(c, hx, hy, fz) {
      c.save(); c.translate(hx, hy - 30); if (fz) c.rotate(0.22);
      c.fillStyle = "#E8C766"; c.beginPath(); c.ellipse(0, 0, 60, 12, 0, 0, 7); c.fill(); c.strokeStyle = "#C9A23E"; c.lineWidth = 2; c.stroke();
      c.beginPath(); c.moveTo(-30, 0); c.quadraticCurveTo(-32, -34, 0, -36); c.quadraticCurveTo(32, -34, 30, 0); c.closePath(); c.fillStyle = "#EFD27A"; c.fill(); c.stroke();
      c.fillStyle = "#C2553A"; c.fillRect(-30, -10, 60, 7);
      c.strokeStyle = "rgba(160,120,40,.5)"; c.lineWidth = 1.2; for (var k = -24; k <= 24; k += 8) { c.beginPath(); c.moveTo(k, -3); c.lineTo(k * 0.8, -30); c.stroke(); }
      c.restore();
    }
    var SKIN = { coat: "#4A78B8", collar: "#C2553A", lapel: "#3E66A0", badge: "#8A5A2B", name: "FARMER FERN", noSteth: true, noGlasses: true, hair: "#9A5B2E", hat: hat,
      sleeve: "#C2553A", glove: "#7BA05B", prop: "#8A5A2B", propLabel: "", mug: "FARMER", towel: "#D8BC88", towelStripe: "#9C7A44", nurse: "#5B8C3A", nurseName: "FARMHAND" };
    var V = window.MW_VET(Object.assign({}, A, { skin: SKIN }));
    if (!V) return null;

    // ---------------- copy ----------------
    var TEXT = {
      ITEMS: ["bucket", "egg", "horseshoe", "wateringcan", "boot", "lantern", "milkjug", "pumpkin", "trowel", "seeds"],
      FOOD: ["carrot", "corn", "apple", "cheese", "jerky", "sardine"],
      BADFOOD: ["onion", "rottenegg", "chilli", "mouldybread"],
      SPIKY: ["thistle", "barbwire", "pitchfork", "cactus"],
      TREATS: ["jerky", "sardine"],
      KICKQ: ["Off the hay bale. Gravity: still works.", "Farm-to-floor.", "He calls it crop rotation.", "Harvested. With his foot.", "Smug level: agricultural.", "The bale is clear. Mostly.", "Not a farm cat. A farm critic.", "That’s what the barn floor is for.", "Organic chaos.", "Free range. Free fall.", "Fresh from the farm. Fresh on the floor.", "Paddock to plummet.", "Yeehaw. Smugly."],
      BOREDQ: ["He got bored. Farms are slow.", "One left on the bale. Lazy.", "Missed a kick. He blames the rooster.", "Basil has lodged a complaint with the farmhouse.", "One survived. The scarecrow saw everything.", "Too busy glaring at the cows."],
      HUNGRYQ: ["Clover is hungry. The chooks are nervous.", "Food left uneaten. On a FARM. Appalling.", "Clover Piggington wants a second helping.", "Hungry. The Whingapotamus whinges at the farmhand.", "Food escaped. Clover will leave a one-star review of the farm stay."],
      MOTHQ: ["Fly eaten. FRENZY!", "Crunchy. Buzzy. FRENZY!", "Farm-fresh protein. FRENZY!", "Fly: caught. FRENZY!"],
      OUCHQ: ["Ouch. Thistle: 1, Basil: 0.", "Basil has learned nothing. Again.", "Barbed wire. Barbed regret.", "Paw, meet prickles.", "Some things you don’t kick. Especially on a farm."],
      HEDGEQ: ["That was a hedgehog. Asleep in the hay. Was.", "Never kick a sleeping hedgehog. Farm rule one.", "Prickly lesson. Very prickly.", "The hedgehog has filed a complaint.", "Bold move. Wrong, and also rude."],
      BADQ: { onion: "Onion. Toxic to cats. She spat it out, sensibly.", rottenegg: "Rotten egg. The smell left before she did.", chilli: "Chilli. Clover is now a dragon. A sweaty one.", mouldybread: "Mouldy bread. Even Clover has standards. Low ones." },
      SMASHQ: { vase: ["Milk churn: tipped. Don’t cry over it.", "That was tomorrow’s cream. Was.", "Clang. The cows heard that."], tv: ["The barn radio: silenced. The cows rejoice.", "No more country music. You’re welcome.", "Static. Then nothing."], tank: ["THE FEED BIN. Jackpot. +1 life.", "Feed bin busted. Snacks everywhere. +1 life."] },
      CAMP_NAME: [null, "SUNRISE", "FEED TIME", "HAY FEVER", "MUD SEASON", "FARMER FERN", "ROOSTER HOUR", "MARKET DAY", "SHEARING SHED", "HARVEST", "THE FINAL MILKING"],
      CAMP_TIP: [null, "A farm stay. Basil hates it already. Kick everything off the hay bale.", "Clover’s turn: eat the farm food. Not the onion (toxic to cats).", "Faster. More prickly things. The flies are out.", "Mud everywhere. Faster again. The fleas are hopping.", "BOSS: Farmer Fern. Hit the glowing spots. Jump the rake. Wriggle out of the sack.", "Faster. The rooster is restless.", "Faster. Rotten food everywhere. Spot it.", "Faster. Heavier things. The barn cat is cockier.", "Faster. Harvest: everyone’s yawning.", "Sunset. Top speed. One life. Then Farmer Fern and Farmhand Pip."],
      CTITLES: [[5, "Unruly"], [10, "Feral"], [15, "Needs Two Farmhands"], [25, "Banned from the Barn"], [40, "Farm Show Legend"]],
      SPOTS: ["CLIPBOARD", "HAT", "TEA"],
      SAY: {
        "FRAZZLED!": "FURIOUS!", " · FRAZZLED": " · FURIOUS", ": The Vet": ": The Farm",
        "Clean bill of health · all 10 vet rounds": "Farm show champions · all 10 farm rounds", "Check-up Legend": "Farm Legend",
        "The bribe was a trap. Towel out. Clover lost 3 seconds.": "The feed was a trap. Sack out. Clover lost 3 seconds.", "Towelled! -": "Sacked! -",
        "47 KG?! HAYWIRE": "PRIZE PUMPKIN?! HAYWIRE", "Perfect weigh-in +": "Prize-winning stillness +", "COCKATOO! SQUAWK: ": "ROOSTER! COCK-A-DOODLE: ",
        "Sat on that tail! +": "Dodged the hose! +", "Flinched early. Vaccinated. Annoyingly healthy.": "Flinched early. Dipped. Smells of sheep.",
        "TREAT POCKET! ×3": "OVERALLS POCKET! ×3", "Half health. Glasses askew, coffee spilt, and faster now. Rude.": "Half health. Hat askew, tea spilt, and faster now. Rude.",
        "Echidna!": "Hedgehog!", "THE VET WON": "THE FARMER WON", "Confiscated! ‘Not on her diet.’": "Confiscated! ‘That’s for the chooks.’", "PEN TORCH · ": "TORCH · ",
        "TANGLED IN TOWEL!": "TANGLED IN A SACK!", "BURRITO’D! -25%": "SACKED! -25%", "TEMPERATURE TAKEN. -10%": "HOSED DOWN. -10%",
        "The cockatoo! SQUAWK: everything falls twice as fast. Tap it to hiss it off.": "The rooster! COCK-A-DOODLE: everything falls twice as fast. Tap it to hiss it off.",
        "Too slow. The vet’s distracted now.": "Too slow. The farmer’s distracted now.", "DR POKESWORTH IS": "FARMER FERN IS", "DR POKESWORTH · ": "FARMER FERN · ",
        "VET GIVES UP": "FARMER GIVES UP", "SQUAWK!": "COCK-A-DOODLE!", "VET!": "FARMER!", "THE VET’S BACK. WITH A NURSE": "THE FARMER’S BACK. WITH A FARMHAND"
      },
      SAYRE: [
        [/All ten vet rounds\. Dr Pokesworth handed over the treat jar, Nurse Burrito waved a white towel and the echidna slept through it all\./, "All ten farm rounds. Farmer Fern handed over the prize ribbon, Farmhand Pip waved a white sack and the hedgehog slept through it all."],
        [/Vet Endless unlocked/g, "Farm Endless unlocked"], [/Temperature taken\. 38\.6°\. Dignity: 0%\./g, "Hosed down. Soggy. Dignity: 0%."],
        [/Dr Pokesworth/g, "Farmer Fern"], [/Nurse Burrito/g, "Farmhand Pip"], [/\bnurse\b/g, "farmhand"], [/\bthe vet\b/g, "the farmer"], [/\bvet\b/g, "farm"], [/\bVet\b/g, "Farm"], [/\bVET\b/g, "FARM"],
        [/cockatoo/g, "rooster"], [/Cockatoo/g, "Rooster"], [/thermometer/g, "rake"], [/Thermometer/g, "Rake"], [/THERMOMETER/g, "RAKE"],
        [/towel/g, "sack"], [/Towel/g, "Sack"], [/TOWEL/g, "SACK"], [/clinic/g, "farm"], [/exam table/g, "hay bale"], [/[Rr]eception/g, "the farmhouse"], [/waiting room/g, "barn"]
      ]
    };

    // ---------------- the barn ----------------
    function back() {
      var nk = S ? S.nightK || 0 : 0, night = nk > 0.5;
      ctx.fillStyle = "#B5563A"; ctx.fillRect(0, 0, W, H);
      for (var x = 0; x < W; x += 30) { ctx.fillStyle = (x / 30) % 2 ? "#A84E34" : "#B85A3D"; ctx.fillRect(x, 0, 30, BENCH); ctx.fillStyle = "rgba(60,20,10,.25)"; ctx.fillRect(x, 0, 2, BENCH); }
      ctx.fillStyle = "rgba(60,20,10,.18)"; [52, 140].forEach(function (y) { ctx.fillRect(0, y, W, 6); });
      // window onto the paddock
      rr(222, 24, 118, 86, 8); ctx.fillStyle = night ? "#26305E" : nk > 0.15 ? "#E9A77A" : "#BFE0F2"; ctx.fill();
      ctx.save(); rr(222, 24, 118, 86, 8); ctx.clip();
      if (night) { circ(312, 44, 10, "#F4F1DE"); circ(307, 41, 9, "#26305E"); } else circ(310, 46 + nk * 120, 10, nk > 0.15 ? "#F6A04D" : "#FFE08A");
      ctx.fillStyle = night ? "#2E4A36" : "#7DBE5A"; ctx.beginPath(); ctx.moveTo(222, 92); ctx.quadraticCurveTo(262, 70, 300, 88); ctx.quadraticCurveTo(322, 80, 340, 86); ctx.lineTo(340, 110); ctx.lineTo(222, 110); ctx.fill();
      ctx.fillStyle = night ? "#3B5E44" : "#9ED36F"; ctx.beginPath(); ctx.moveTo(222, 100); ctx.quadraticCurveTo(280, 88, 340, 102); ctx.lineTo(340, 110); ctx.lineTo(222, 110); ctx.fill();
      // a cow in the paddock
      if (!S || (!S.dog && !S.tom)) { ell(250, 92, 11, 7, "#FFFFFF"); ell(246, 90, 4, 3, "#2B2340"); ell(254, 94, 3, 2.5, "#2B2340"); ell(262, 90, 5, 4.5, "#FFFFFF"); ell(265, 92, 3, 2, "#F4A6C0"); ctx.fillStyle = "#2B2340"; [243, 248, 253, 257].forEach(function (lx) { ctx.fillRect(lx, 97, 2, 6); }); }
      if (S && S.dog) rooster(281, 86 + (1 - S.dog.k) * 80 - Math.abs(Math.sin(t() * 12)) * 4 + (S.dog.gone ? (0.45 - Math.min(0.45, S.dog.t)) * 160 : 0), Math.sin(t() * 12) > 0 && !S.dog.gone, 0.95);
      if (S && S.tom) V.ginger(281 + (S.tom.hitT > 0 ? Math.sin(t() * 80) * 4 : 0), 98 + (1 - S.tom.k) * 80, 0.4, true);
      ctx.restore();
      rr(222, 24, 118, 86, 8); ctx.strokeStyle = "#F4EBDD"; ctx.lineWidth = 6; ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(281, 24); ctx.lineTo(281, 110); ctx.moveTo(222, 67); ctx.lineTo(340, 67); ctx.stroke();
      // horseshoe, lantern, sign
      ctx.strokeStyle = "#8E8A9A"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(66, 70, 12, Math.PI * 0.15, Math.PI * 0.85, true); ctx.stroke();
      line([[196, 112], [196, 124]], "#3B2A20", 2); rr(186, 124, 20, 26, 4); ctx.fillStyle = "#2B2340"; ctx.fill(); circ(196, 138, 6, night ? "#FFE08A" : "#F7D07A"); if (night) circ(196, 138, 16, "rgba(255,224,138,.25)"); ctx.fillStyle = "#3B2A20"; ctx.fillRect(176, 110, 40, 3);
      rr(30, 96, 70, 26, 4); ctx.fillStyle = "#E9D7B5"; ctx.fill(); ctx.strokeStyle = "#8A5A2B"; ctx.lineWidth = 2; ctx.stroke(); txt("FRESH EGGS", 65, 113, "900 9px " + P, "#8A5A2B");
      // hay bales at the back (Basil's sulk spot sits in front)
      [[14, BENCH - 70, 70, 30], [26, BENCH - 100, 50, 30]].forEach(function (b) { rr(b[0], b[1], b[2], b[3], 4); ctx.fillStyle = "#E3C15B"; ctx.fill(); ctx.strokeStyle = "#B8952F"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.strokeStyle = "rgba(150,110,30,.5)"; for (var k = 6; k < b[3]; k += 6) { ctx.beginPath(); ctx.moveTo(b[0] + 3, b[1] + k); ctx.lineTo(b[0] + b[2] - 3, b[1] + k); ctx.stroke(); } ctx.fillStyle = "#A0522D"; ctx.fillRect(b[0] + b[2] * 0.3, b[1], 3, b[3]); ctx.fillRect(b[0] + b[2] * 0.7, b[1], 3, b[3]); });
      V.carrier(36, BENCH - 22, true, null, 0.8);
    }
    function rooster(x, y, crow, k) {
      ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
      ctx.fillStyle = "#2E7D6B"; [[-26, -0.9], [-22, -0.5], [-18, -0.2]].forEach(function (f) { ctx.save(); ctx.translate(-14, 10); ctx.rotate(f[1]); ell(-12, 0, 16, 5, "#2E7D6B"); ctx.restore(); });
      ell(0, 18, 22, 24, "#C2553A"); ell(-6, 22, 12, 16, "#A84434", 0.3); ell(4, -10, 15, 16, "#E8D9B0");
      ctx.fillStyle = "#E03A3A"; [-6, 0, 6].forEach(function (cx, i) { circ(cx + 4, -27 - (i === 1 ? 4 : 0), 5.5, "#E03A3A"); });
      ctx.fillStyle = "#F2B630"; ctx.beginPath(); ctx.moveTo(17, -12); ctx.lineTo(28 + (crow ? 2 : 0), -9); ctx.lineTo(17, -6); ctx.fill(); if (crow) { ctx.beginPath(); ctx.moveTo(17, -5); ctx.lineTo(26, 0); ctx.lineTo(16, -2); ctx.fill(); }
      ell(16, 0, 3.5, 6, "#E03A3A"); circ(9, -13, 3.2, "#1B1430"); circ(8, -14, 1, "#FFFFFF");
      ctx.restore();
    }
    function table() {
      // a long hay bale bench on a wooden trestle
      ctx.fillStyle = "#E3C15B"; ctx.fillRect(0, BENCH - 24, W, 26);
      ctx.fillStyle = "#F0D372"; ctx.fillRect(0, BENCH - 24, W, 5);
      ctx.strokeStyle = "rgba(150,110,30,.45)"; ctx.lineWidth = 1.2; for (var x = 4; x < W; x += 9) { ctx.beginPath(); ctx.moveTo(x, BENCH - 20); ctx.lineTo(x + 4, BENCH); ctx.stroke(); }
      ctx.fillStyle = "#A0522D"; [90, 270].forEach(function (bx) { ctx.fillRect(bx, BENCH - 24, 4, 26); });
      if (S && S.sinkT > 0) { ctx.fillStyle = "rgba(120,190,230,.35)"; ctx.fillRect(0, BENCH - 24, W, 8); }
      ctx.fillStyle = "#8A5A2B"; ctx.fillRect(0, BENCH + 2, W, 6);
      ctx.fillStyle = "#EADBB8"; ctx.fillRect(0, BENCH + 8, W, H - BENCH);
      ctx.strokeStyle = "rgba(200,160,80,.55)"; ctx.lineWidth = 1.5; for (var i = 0; i < 40; i++) { var sx = (i * 47) % W, sy = BENCH + 16 + (i * 29) % (H - BENCH - 20); ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 10 - (i % 3) * 6, sy - 3); ctx.stroke(); }
    }
    function heatPad(sleeping) {
      var x = 334;
      if (sleeping) { ctx.save(); ctx.beginPath(); ctx.rect(x - 40, 0, 80, BENCH - 11); ctx.clip(); V.heatPad(true); ctx.restore(); }
      ell(x, BENCH - 7, 30, 8, "#D9B24C"); ctx.strokeStyle = "#B8952F"; ctx.lineWidth = 1.5; for (var k = -24; k <= 24; k += 6) { ctx.beginPath(); ctx.moveTo(x + k, BENCH - 12); ctx.lineTo(x + k + 3, BENCH - 2); ctx.stroke(); }
    }

    // ---------------- things on the bale ----------------
    var ALIAS = { vase: "milkchurn", tv: "radio", tank: "feedbin" };
    var KINDS = {};
    TEXT.ITEMS.concat(TEXT.FOOD, TEXT.BADFOOD, TEXT.SPIKY, ["milkchurn", "radio", "feedbin"]).forEach(function (k) { KINDS[k] = 1; });
    function has(k) { if (k === "hedgehog") return false; return !!(KINDS[k] || ALIAS[k]) || V.has(k); }
    function item(kind) {
      kind = ALIAS[kind] || kind;
      switch (kind) {
        case "bucket":
          ctx.fillStyle = "#9AA6B2"; ctx.beginPath(); ctx.moveTo(-16, -30); ctx.lineTo(16, -30); ctx.lineTo(12, 0); ctx.lineTo(-12, 0); ctx.closePath(); ctx.fill(); ell(0, -30, 16, 4, "#C9D2D8"); ell(0, -30, 13, 2.6, "#6E7884");
          ctx.strokeStyle = "#6E7884"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -30, 16, Math.PI, 2 * Math.PI); ctx.stroke(); ctx.fillStyle = "#7F8A96"; ctx.fillRect(-14, -18, 28, 2); break;
        case "egg":
          ell(0, -14, 11, 14, "#F7EEDC"); ctx.strokeStyle = "#E2D3B6"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, -14, 11, 14, 0, 0, 7); ctx.stroke(); ell(-4, -19, 3, 4, "rgba(255,255,255,.8)", -0.4); break;
        case "horseshoe":
          ctx.strokeStyle = "#8E8A9A"; ctx.lineWidth = 7; ctx.lineCap = "butt"; ctx.beginPath(); ctx.arc(0, -16, 13, Math.PI * 0.85, Math.PI * 0.15); ctx.stroke(); ctx.fillStyle = "#5E5A6A"; [-0.6, -0.2, 0.2, 0.6].forEach(function (a) { circ(Math.sin(a) * 13, -16 - Math.cos(a) * 13, 1.4, "#5E5A6A"); }); break;
        case "wateringcan":
          rr(-14, -26, 26, 24, 4); ctx.fillStyle = "#3E9C6B"; ctx.fill(); ctx.strokeStyle = "#3E9C6B"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(12, -12); ctx.lineTo(26, -30); ctx.stroke(); ell(27, -31, 5, 3, "#2E7D52", -0.6);
          ctx.beginPath(); ctx.arc(-1, -26, 10, Math.PI, 2 * Math.PI); ctx.stroke(); break;
        case "boot":
          ctx.fillStyle = "#2E7D52"; rr(-10, -38, 16, 32, 3); ctx.fill(); rr(-12, -10, 28, 10, 5); ctx.fill(); ctx.fillStyle = "#1F5C3A"; ctx.fillRect(-12, -3, 28, 3); ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fillRect(-7, -34, 3, 20); break;
        case "lantern":
          ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -36, 7, Math.PI, 2 * Math.PI); ctx.stroke(); rr(-11, -34, 22, 6, 2); ctx.fillStyle = "#2B2340"; ctx.fill();
          rr(-9, -28, 18, 22, 3); ctx.fillStyle = "rgba(255,224,138,.85)"; ctx.fill(); ctx.strokeStyle = "#2B2340"; ctx.stroke(); ell(0, -16, 3, 5, "#F28C28"); rr(-12, -6, 24, 6, 2); ctx.fillStyle = "#2B2340"; ctx.fill(); break;
        case "milkjug":
          ctx.fillStyle = "#FFFFFF"; ctx.beginPath(); ctx.moveTo(-8, -36); ctx.lineTo(8, -36); ctx.lineTo(13, -20); ctx.lineTo(13, 0); ctx.lineTo(-13, 0); ctx.lineTo(-13, -20); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#C9D2D8"; ctx.lineWidth = 1.5; ctx.stroke();
          rr(-9, -40, 18, 5, 2); ctx.fillStyle = "#4A78B8"; ctx.fill(); txt("MILK", 0, -10, "900 7px " + P, "#4A78B8"); break;
        case "pumpkin":
          [-9, 0, 9].forEach(function (px) { ell(px, -13, 10, 13, "#F28C28"); }); ell(0, -13, 8, 13, "#F59A3A"); rr(-2, -31, 4, 7, 1.5); ctx.fillStyle = "#3E6B2E"; ctx.fill(); ell(6, -28, 6, 3, "#5B8C3A", -0.4); break;
        case "trowel":
          ctx.save(); ctx.rotate(-0.5); rr(-3, -36, 6, 16, 3); ctx.fillStyle = "#8A5A2B"; ctx.fill(); ctx.fillStyle = "#AEB8C0"; ctx.beginPath(); ctx.moveTo(-8, -20); ctx.lineTo(8, -20); ctx.lineTo(0, 2); ctx.closePath(); ctx.fill(); ctx.restore(); break;
        case "seeds":
          rr(-13, -34, 26, 34, 3); ctx.fillStyle = "#F5E6C4"; ctx.fill(); ctx.strokeStyle = "#C9B07A"; ctx.lineWidth = 1.5; ctx.stroke(); circ(0, -20, 8, "#F2C230"); circ(0, -20, 3.5, "#8A5A2B"); txt("SEEDS", 0, -4, "900 6px " + P, "#8A5A2B"); break;
        // food
        case "carrot":
          ctx.save(); ctx.rotate(-0.4); ctx.fillStyle = "#F28C28"; ctx.beginPath(); ctx.moveTo(-6, -26); ctx.quadraticCurveTo(0, -30, 6, -26); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#D9731A"; ctx.lineWidth = 1; [-20, -14, -8].forEach(function (yy) { ctx.beginPath(); ctx.moveTo(-3, yy); ctx.lineTo(1, yy); ctx.stroke(); });
          ell(-3, -32, 2.5, 6, "#5B8C3A", -0.4); ell(3, -32, 2.5, 6, "#5B8C3A", 0.4); ell(0, -34, 2.5, 7, "#3E6B2E"); ctx.restore(); break;
        case "corn":
          ell(0, -16, 8, 16, "#F2C230"); ctx.fillStyle = "#E0A21E"; for (var cy = -28; cy < -4; cy += 5) for (var cx = -5; cx <= 5; cx += 5) circ(cx, cy, 1.4, "#E0A21E");
          ctx.fillStyle = "#7BA05B"; ctx.beginPath(); ctx.moveTo(-2, 0); ctx.quadraticCurveTo(-14, -12, -8, -30); ctx.quadraticCurveTo(-6, -12, 0, -2); ctx.fill(); ctx.beginPath(); ctx.moveTo(2, 0); ctx.quadraticCurveTo(14, -12, 9, -28); ctx.quadraticCurveTo(6, -12, 0, -2); ctx.fill(); break;
        case "apple":
          ell(-4, -13, 9, 12, "#D93A3A"); ell(4, -13, 9, 12, "#D93A3A"); ell(-5, -17, 3, 4, "rgba(255,255,255,.5)"); line([[0, -24], [2, -30]], "#5A3A20", 2); ell(6, -28, 5, 2.6, "#5B8C3A", -0.5); break;
        case "cheese":
          ctx.fillStyle = "#F7CF4A"; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(16, 0); ctx.lineTo(16, -14); ctx.lineTo(-16, -24); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#F2BC2A"; ctx.beginPath(); ctx.moveTo(-16, -24); ctx.lineTo(16, -14); ctx.lineTo(16, -18); ctx.lineTo(-12, -28); ctx.closePath(); ctx.fill();
          circ(-6, -8, 3, "#E0A21E"); circ(6, -5, 2.2, "#E0A21E"); circ(2, -14, 1.8, "#E0A21E"); break;
        // bad food
        case "onion":
          ell(0, -14, 12, 13, "#C98AB8"); ctx.strokeStyle = "#A86A98"; ctx.lineWidth = 1.2; [-6, 0, 6].forEach(function (q) { ctx.beginPath(); ctx.ellipse(q * 0.5, -14, 4 + Math.abs(q), 12, 0, 0, 7); ctx.stroke(); });
          ctx.fillStyle = "#5B8C3A"; ctx.beginPath(); ctx.moveTo(-2, -26); ctx.lineTo(0, -38); ctx.lineTo(3, -26); ctx.fill(); break;
        case "rottenegg":
          ell(0, -14, 11, 14, "#C9C08A"); ctx.strokeStyle = "#8A8A4A"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-6, -20); ctx.lineTo(-2, -14); ctx.lineTo(-6, -8); ctx.stroke();
          ctx.strokeStyle = "rgba(120,160,60,.7)"; ctx.lineWidth = 2; [-6, 0, 6].forEach(function (q, i) { ctx.beginPath(); ctx.moveTo(q, -30); ctx.quadraticCurveTo(q + 4, -36, q, -42 - (t() * 10 + i * 3) % 4); ctx.stroke(); }); break;
        case "chilli":
          ctx.save(); ctx.rotate(0.4); ctx.fillStyle = "#E03A3A"; ctx.beginPath(); ctx.moveTo(-4, -28); ctx.quadraticCurveTo(8, -24, 6, -8); ctx.quadraticCurveTo(4, 2, -2, 0); ctx.quadraticCurveTo(2, -12, -6, -24); ctx.closePath(); ctx.fill(); ell(-4, -29, 4, 3, "#3E6B2E"); ctx.restore(); break;
        case "mouldybread":
          rr(-14, -28, 28, 28, 8); ctx.fillStyle = "#E0B678"; ctx.fill(); rr(-11, -24, 22, 22, 6); ctx.fillStyle = "#F4DFB4"; ctx.fill();
          [[-4, -16, 5], [5, -9, 4], [3, -20, 3], [-6, -6, 3]].forEach(function (m) { circ(m[0], m[1], m[2], "#7BA05B"); circ(m[0] + 1, m[1] - 1, m[2] * 0.5, "#A8C98A"); }); break;
        // spiky
        case "thistle":
          line([[0, 0], [0, -20]], "#5B8C3A", 3); ell(0, -24, 8, 7, "#7BA05B"); ctx.strokeStyle = "#5B8C3A"; ctx.lineWidth = 1.4; for (var a = 0; a < 7; a++) { var an = Math.PI + a / 6 * Math.PI; ctx.beginPath(); ctx.moveTo(Math.cos(an) * 8, -24 + Math.sin(an) * 7); ctx.lineTo(Math.cos(an) * 13, -24 + Math.sin(an) * 12); ctx.stroke(); }
          ctx.fillStyle = "#B05AC8"; ctx.beginPath(); ctx.moveTo(-7, -28); for (var p = 0; p <= 8; p++) ctx.lineTo(-7 + p * 1.75, -42 + (p % 2) * 6); ctx.lineTo(7, -28); ctx.closePath(); ctx.fill(); break;
        case "barbwire":
          ctx.strokeStyle = "#8E8A9A"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-22, -10); ctx.quadraticCurveTo(-8, -22, 6, -10); ctx.quadraticCurveTo(16, -2, 22, -14); ctx.stroke();
          [[-14, -15], [0, -13], [14, -8]].forEach(function (b) { line([[b[0] - 5, b[1] - 5], [b[0] + 5, b[1] + 5]], "#5E5A6A", 2); line([[b[0] + 5, b[1] - 5], [b[0] - 5, b[1] + 5]], "#5E5A6A", 2); }); break;
        case "pitchfork":
          ctx.save(); ctx.rotate(-0.25); rr(-2, -14, 4, 14, 2); ctx.fillStyle = "#8A5A2B"; ctx.fill(); ctx.fillStyle = "#AEB8C0"; ctx.fillRect(-11, -18, 22, 4); [-10, -3.5, 3.5, 10].forEach(function (px) { ctx.beginPath(); ctx.moveTo(px - 1.5, -18); ctx.lineTo(px, -38); ctx.lineTo(px + 1.5, -18); ctx.fill(); }); ctx.restore(); break;
        // smashables
        case "milkchurn":
          rr(-20, -46, 40, 46, 8); ctx.fillStyle = "#C9D2D8"; ctx.fill(); ctx.strokeStyle = "#9AA6B2"; ctx.lineWidth = 2; ctx.stroke(); rr(-12, -58, 24, 14, 4); ctx.fillStyle = "#AEB8C0"; ctx.fill(); rr(-14, -62, 28, 6, 3); ctx.fillStyle = "#9AA6B2"; ctx.fill();
          ctx.fillStyle = "#9AA6B2"; ctx.fillRect(-20, -30, 40, 4); ctx.fillRect(-20, -12, 40, 4); txt("MILK", 0, -18, "900 8px " + P, "#4A78B8"); break;
        case "radio":
          rr(-30, -40, 60, 40, 8); ctx.fillStyle = "#C2553A"; ctx.fill(); circ(-12, -20, 12, "#2B2340"); circ(-12, -20, 8, "#4A4256"); rr(4, -32, 20, 10, 2); ctx.fillStyle = "#F4EBDD"; ctx.fill(); circ(14, -12, 4, "#F4EBDD"); circ(24, -12, 4, "#F4EBDD");
          line([[20, -40], [30, -60]], "#8E8A9A", 2); txt("♪", 0, -46, "900 12px " + P, "#2B2340"); break;
        case "feedbin":
          rr(-30, -40, 60, 40, 5); ctx.fillStyle = "#5B8C3A"; ctx.fill(); rr(-33, -48, 66, 10, 4); ctx.fillStyle = "#3E6B2E"; ctx.fill(); rr(-20, -30, 40, 14, 2); ctx.fillStyle = "#F4EBDD"; ctx.fill(); txt("FEED", 0, -19.5, "900 10px " + P, "#3E6B2E");
          for (var fq = 0; fq < 6; fq++) circ(-20 + fq * 8, -50 - (fq % 2) * 3, 3, ["#B07A0C", "#C98A3E", "#E0A21E"][fq % 3]); break;
        default: return V.item(kind);
      }
      return true;
    }

    // ---------------- event text and visuals ----------------
    function bannerFor(e, catName, taps) {
      var b = V.bannerFor(e, catName, taps); if (!b) return b;
      var F = {
        cucumber: ["PRIZE WEIGH-IN! STAY STILL", "Don’t tap anything for 2 s or the farm show scales go haywire"],
        fridge: ["FEED TIME! EAT FAST", "Eat fast, then tap the farmhand’s hand before the sack comes out"],
        cone: ["BUCKET ON HEAD!", catName + " can only see the middle. Tap the bucket 3× to shake it off"],
        xray: ["LIGHTNING!", "The barn flashes. Look closely: rotten food glows"],
        bath: ["THE HOSE!", "Tap " + catName + " (or ↑ / W) to spin round and dodge the hose"],
        box: ["CARRIER OPEN! BOTH CATS WANT IN", "Tap fast to claim the hiding spot: " + taps],
        clipper: ["SHEARING TIME!", "Tap " + catName + " (or ↑ / W) just as the shears arrive to jump them"]
      }[e.m];
      if (e.m === "shaker") F = e.t < e.rattle ? ["“INTO THE SHEEP DIP…”", "Freeze. Wait for BOLT. Flinch early and you’re dipped"] : e.fake ? ["…", "Fake-out. Don’t move"] : ["BOLT! TAP!", "First tap escapes under the bale: double points"];
      if (F) { b[0] = F[0]; b[1] = F[1]; }
      return b;
    }
    function evDraw(e, cat, a) {
      var live = !e.done;
      if (e.m === "bath" && live) { // a hose nozzle creeps down from above, dripping
        var p = Math.min(1, e.t / e.dur), hx = 180 + Math.sin(t() * 3) * 6, hy = -60 + p * (BENCH - 170 + 60);
        ctx.strokeStyle = "#3E9C6B"; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(hx + 20, -10); ctx.quadraticCurveTo(hx + 30, hy * 0.5, hx + 10, hy); ctx.stroke();
        ctx.save(); ctx.translate(hx + 8, hy + 6); ctx.rotate(0.3); rr(-6, -4, 12, 20, 3); ctx.fillStyle = "#F2C230"; ctx.fill(); ctx.restore();
        [0, 1, 2].forEach(function (i) { circ(hx + 6 + i * 3, hy + 30 + ((t() * 60 + i * 9) % 26), 2.4, "#5AA9DC"); });
        ctx.strokeStyle = "rgba(194,85,58,.6)"; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(180, BENCH - 120, 62, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        return;
      }
      if (e.m === "shaker") {
        ctx.save(); ctx.globalAlpha = a; var go = e.t >= e.rattle && !e.fake && !e.done;
        var msg = e.done ? "" : go ? "…1!" : e.t >= e.rattle ? "2 and a half…" : e.t < e.rattle * 0.5 ? "Into the sheep dip… 3…" : "…2…";
        if (msg) { ctx.font = "italic 800 13px " + P; var tw = ctx.measureText(msg).width + 26; rr(W - tw - 62, 196, tw, 32, 12); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = "#FFFFFF"; ctx.beginPath(); ctx.moveTo(W - 84, 227); ctx.lineTo(W - 50, 246); ctx.lineTo(W - 100, 227); ctx.fill(); txt(msg, W - tw / 2 - 62, 217, "italic 800 13px " + P, go ? "#C2553A" : "#2B2340"); }
        ell(W + 4, 252, 22, 20, SKIN.glove);
        if (go) txt("BOLT!", 180, 182, "900 30px " + P, "#B5308A", "center", "#FFFFFF", 7);
        ctx.restore(); return;
      }
      if (e.m === "cone" && live) { // a bucket stuck on the cat's head; the view narrows
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.ellipse(180, 236, 92, 150, 0, 0, 7); ctx.fillStyle = "rgba(30,26,20,.62)"; ctx.fill("evenodd"); ctx.restore();
        ctx.strokeStyle = "#9AA6B2"; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(180 + (e.jig > 0 ? Math.sin(t() * 80) * 4 : 0), 236, 92, 150, 0, 0, 7); ctx.stroke();
        txt("TAP THE BUCKET " + e.taps + "/3", 180, 140, "900 12px " + P, "#2B5E80", "center", "#FFFFFF", 4);
        return;
      }
      V.evDraw(e, cat, a);
    }
    function celebText(tt, q) {
      var k = Math.min(1, tt / 0.45), sc = q ? 1 : 0.5 + 0.5 * k + Math.sin(Math.min(1, tt / 0.6) * Math.PI) * 0.12;
      ctx.save(); ctx.translate(180, BENCH + 50); ctx.scale(sc, sc);
      txt("FARM SHOW CHAMPIONS", 0, 0, "900 25px " + P, "#FFE08A", "center", "#2B2340", 7);
      if (tt > 0.5) txt("BLUE RIBBON", 0, 28, "900 18px " + P, "#8BC4E8", "center", "#2B2340", 6);
      if (tt > 1) txt("All 10 farm rounds · +15,000", 0, 50, "800 12px " + P, "#FFFFFF", "center", "#2B2340", 4);
      ctx.restore();
    }
    function thumb() {
      back(); var b = { x: 205, cats: { b: { pull: 0 }, c: { pull: 0 } } }; V.bossBack(b); table(); V.bossFront(b, { b: { x: 46 }, c: { x: 314 } });
    }
    var out = Object.assign({}, V);
    out.TEXT = TEXT; out.has = has; out.item = w(item); out.back = w(back); out.table = w(table); out.heatPad = w(heatPad);
    out.bannerFor = function (e, c, tp) { sync(); return bannerFor(e, c, tp); }; out.evDraw = w(evDraw); out.celebText = w(celebText); out.thumb = w(thumb);
    out.rooster = w(rooster); out.farm = true;
    return out;
  };
})();
