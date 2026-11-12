/* Basil + Clover, Stage 2: THE VET. Art, copy and event visuals for the vet surgery.
   basil.js owns the game loop and the rules; it calls MW_VET(api) once and asks this file to draw the
   consult room, the clinic items, the waiting-room visitors, the vet events and Dr Pokesworth (+ Nurse Burrito).
   Cartoon only: needles are never shown landing, no blood. */
(function () {
  "use strict";
  window.MW_VET = function (A) {
    var ctx, S, W = A.W, H = A.H, BENCH = A.BENCH, P = "Poppins, sans-serif";
    // A.skin restyles the boss pair for other stages that reuse the Vet's mechanics (e.g. farm.js)
    var SK = A.skin || {};
    var rr = A.rr, circ = A.circ, ell = A.ell, spr = A.spr, catEyes = A.catEyes;
    function sync() { ctx = A.ctx(); S = A.S(); }
    function w(f) { return function () { sync(); return f.apply(null, arguments); }; }
    function line(pts, col, lw) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke(); }
    function txt(s, x, y, font, col, align, stroke, sw) { ctx.font = font; ctx.textAlign = align || "center"; ctx.lineJoin = "round"; if (stroke) { ctx.lineWidth = sw || 4; ctx.strokeStyle = stroke; ctx.strokeText(s, x, y); } ctx.fillStyle = col; ctx.fillText(s, x, y); }
    function pawPrint(x, y, k, col) { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ell(0, 3, 7, 6, col); circ(-7, -5, 3, col); circ(-2.5, -9, 3, col); circ(2.5, -9, 3, col); circ(7, -5, 3, col); ctx.restore(); }
    function noSign(x, y) { ctx.strokeStyle = "#C2553A"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 5.5, y - 5.5); ctx.lineTo(x + 5.5, y + 5.5); ctx.stroke(); }
    function t() { return S ? S.t : 0; }

    // ---------------- copy ----------------
    var TEXT = {
      ITEMS: ["steth", "pills", "clipboard", "cone", "thermo", "cotton", "treatjar", "syringe", "bandage", "glove"],
      FOOD: ["dentalchew", "kibble", "tunatube", "biscuitjar", "jerky", "sardine"],
      BADFOOD: ["pillcheese", "wormer", "pipette", "dietfood"],
      SPIKY: ["clippers", "slicker", "spikyball", "cactus"],
      TREATS: ["jerky", "sardine"],
      KICKQ: ["Stethoscope: listened to. Then kicked.", "Clinical. Literally.", "He calls it triage.", "Off the table. Diagnosis: gravity.", "Smug level: veterinary.", "The exam table is clear. Mostly.", "He looked the vet in the eye first.", "Consult over.", "No referral needed.", "Notes updated: bitey.", "That was sterile. Was.", "Peak patient behaviour.", "Freshly shaved. Freshly furious."],
      BOREDQ: ["He got bored. Waiting rooms do that.", "One left on the table. Unprofessional.", "Missed a kick. He blames the vet.", "Basil has complained to reception.", "One survived. It’s on his file now.", "Too busy sulking about the haircut."],
      HUNGRYQ: ["Clover is hungry. Reception has been notified.", "Food left uneaten. In a VET. Appalling.", "Clover Piggington wants a second opinion.", "Hungry. The Whingapotamus whinges at the nurse.", "A treat escaped. Clover will leave a bad review."],
      MOTHQ: ["Blowfly eaten. FRENZY!", "Crunchy. Buzzy. FRENZY!", "Clinic-grade protein. FRENZY!", "Fly: caught. FRENZY!"],
      OUCHQ: ["Ouch. The clippers bite back.", "Basil has learned nothing. Again.", "Cactus: 1, Basil: 0. Reception wins.", "Paw, meet bristles.", "Some things you don’t kick. Especially here."],
      HEDGEQ: ["That was an echidna. A patient. Asleep. Was.", "Never kick a sleeping echidna. Clinic rule one.", "Prickly lesson. Very prickly.", "The echidna’s owner would like a word.", "Bold move. Wrong, and also rude."],
      BADQ: { pillcheese: "Pill in cheese. She ate the cheese. The pill is on your shoe.", wormer: "Worming tablet. Chalky betrayal. Spat out.", pipette: "Flea treatment goes on the neck, not in the mouth. Bleurgh.", dietfood: "Diet food. Clover has lodged a formal complaint." },
      SMASHQ: { vase: ["Lab flask: shattered. Science: over.", "That was a sample. Was.", "Crash. Nobody label that."], tv: ["Records screen smashed. His file: gone.", "No more notes saying ‘bitey’.", "The computer says no. Then nothing."], tank: ["THE TREAT DISPENSER. Jackpot. +1 life.", "Dispenser destroyed. Treats everywhere. +1 life."] },
      CAMP_NAME: [null, "CHECK-IN", "TREAT BRIBE", "WAITING ROOM", "AFTER HOURS", "DR POKESWORTH", "SQUAWK HOUR", "DIET FOOD DAY", "CONE ZONE", "VACCINE DAY", "THE FINAL CONSULT"],
      CAMP_TIP: [null, "Basil’s had a lion cut. He is furious about it. Kick everything off the table.", "Clover’s turn: eat the treats. Not the pill in the cheese.", "Faster. More spiky things. The mozzies are out.", "After hours. Faster again. The fleas are hopping.", "BOSS: Dr Pokesworth. Hit the glowing spots. Jump the thermometer. Wriggle out of towels.", "Faster. The cockatoo is restless.", "Faster. Diet food everywhere. Spot it.", "Faster. Heavier things. The ginger patient is cockier.", "Faster. Vaccine day: everyone’s yawning.", "After hours. Top speed. One life. Then the vet and the nurse."],
      CTITLES: [[5, "Uncooperative"], [10, "Fractious"], [15, "Needs Two Nurses"], [25, "Banned from Reception"], [40, "Waiting Room Legend"]],
      SPOTS: ["CLIPBOARD", "GLASSES", "COFFEE"]
    };

    // ---------------- the consult room ----------------
    function back() {
      var nk = S ? S.nightK || 0 : 0, night = nk > 0.5;
      ctx.fillStyle = "#E6F1EC"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#D2E4DC"; ctx.lineWidth = 2; for (var x = 0; x <= W; x += 36) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, BENCH - 24); ctx.stroke(); } for (var y = 0; y < BENCH - 24; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.fillStyle = "#BFDCCF"; ctx.fillRect(0, BENCH - 80, W, 6); ctx.fillStyle = "#D7EAE1"; ctx.fillRect(0, BENCH - 74, W, 50);
      // waiting-room window
      rr(222, 24, 118, 86, 8); ctx.fillStyle = night ? "#3E3858" : nk > 0.15 ? "#B9AED0" : "#EFE7F7"; ctx.fill();
      ctx.save(); rr(222, 24, 118, 86, 8); ctx.clip();
      ctx.fillStyle = night ? "#332E4A" : "#E2D8F0"; ctx.fillRect(222, 88, 118, 22);
      [234, 262, 290, 318].forEach(function (cx) { rr(cx - 10, 86, 20, 10, 3); ctx.fillStyle = night ? "#6A4438" : "#E0703A"; ctx.fill(); ctx.fillStyle = night ? "#55362C" : "#C25A2A"; ctx.fillRect(cx - 10, 76, 20, 10); ctx.fillStyle = "#8E8A9A"; ctx.fillRect(cx - 8, 96, 2, 14); ctx.fillRect(cx + 6, 96, 2, 14); });
      rr(300, 40, 26, 30, 2); ctx.fillStyle = night ? "#8A86A0" : "#FFFFFF"; ctx.fill(); circ(313, 52, 6, "#7FC4B0"); ctx.fillStyle = "#2E7D6B"; ctx.fillRect(305, 61, 16, 2); ctx.fillRect(307, 65, 12, 2);
      if (S && S.dog) cockatoo(281, 86 + (1 - S.dog.k) * 80 - Math.abs(Math.sin(t() * 12)) * 4 + (S.dog.gone ? (0.45 - Math.min(0.45, S.dog.t)) * 160 : 0), Math.sin(t() * 12) > 0 && !S.dog.gone, 0.95);
      if (S && S.tom) ginger(281 + (S.tom.hitT > 0 ? Math.sin(t() * 80) * 4 : 0), 98 + (1 - S.tom.k) * 80, 0.4);
      ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.fillRect(222, 24, 118, 16); ctx.strokeStyle = "#CFD8DE"; ctx.lineWidth = 1; for (var b = 27; b < 40; b += 4) { ctx.beginPath(); ctx.moveTo(222, b); ctx.lineTo(340, b); ctx.stroke(); }
      ctx.fillStyle = "#AEB8C0"; ctx.fillRect(222, 39, 118, 2.5);
      ctx.restore();
      rr(222, 24, 118, 86, 8); ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 6; ctx.stroke();
      // poster, clock, glove box
      rr(36, 112, 52, 64, 3); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.strokeStyle = "#BFDCCF"; ctx.lineWidth = 2; ctx.stroke();
      pawPrint(62, 136, 1.05, "#2E7D6B"); txt("WASH", 62, 160, "800 8px " + P, "#2B5E80"); txt("YOUR PAWS", 62, 169, "800 7px " + P, "#2B5E80");
      circ(112, 66, 17, "#FFFFFF"); ctx.strokeStyle = "#2B5E80"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(112, 66, 17, 0, 7); ctx.stroke();
      line([[112, 66], [112, 55]], "#2B2340", 2.4); line([[112, 66], [121, 70]], "#2B2340", 2); circ(112, 66, 2, "#C2553A");
      rr(170, 128, 34, 20, 3); ctx.fillStyle = "#6FA8C9"; ctx.fill(); ell(187, 129, 8, 3, "#FFFFFF"); txt("GLOVES", 187, 143, "800 6px " + P, "#FFFFFF");
      // the cat carrier (Basil's sulk spot), back left
      carrier(36, BENCH - 22, true, null, 0.8);
    }
    function carrier(x, y, open, who, k) {
      ctx.save(); ctx.translate(x, y); ctx.scale(k || 1, k || 1);
      rr(-38, -46, 76, 46, 10); ctx.fillStyle = "#8E7BC4"; ctx.fill(); rr(-38, -46, 76, 14, 10); ctx.fillStyle = "#A796D4"; ctx.fill();
      rr(-12, -54, 24, 10, 5); ctx.strokeStyle = "#6B5A93"; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = "#6B5A93"; [-28, -20, 20, 28].forEach(function (vx) { ctx.fillRect(vx - 1, -30, 2, 16); });
      rr(-14, -40, 28, 36, 6); ctx.fillStyle = "#2B2340"; ctx.fill();
      if (who) { ctx.save(); rr(-14, -40, 28, 36, 6); ctx.clip(); ctx.translate(0, -4); ctx.scale(0.2, 0.2); ctx.translate(-120, -150); spr(who === "b" ? "basil-head" : "clover-head"); catEyes(who, "open"); ctx.restore(); }
      ctx.strokeStyle = "#C9D2D8"; ctx.lineWidth = 2;
      if (open) { for (var gx = 0; gx <= 18; gx += 6) { ctx.beginPath(); ctx.moveTo(gx + 18, -40); ctx.lineTo(gx + 18, -4); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(18, -40); ctx.lineTo(36, -40); ctx.moveTo(18, -4); ctx.lineTo(36, -4); ctx.stroke(); }
      else { for (var g2 = -10; g2 <= 10; g2 += 5) { ctx.beginPath(); ctx.moveTo(g2, -38); ctx.lineTo(g2, -6); ctx.stroke(); } }
      ctx.restore();
    }
    function table() {
      ctx.fillStyle = "#C9D3D9"; ctx.fillRect(0, BENCH - 24, W, 26);
      ctx.fillStyle = "#E3E9EC"; ctx.fillRect(0, BENCH - 24, W, 5);
      ctx.strokeStyle = "rgba(255,255,255,.45)"; ctx.lineWidth = 1; [8, 13, 18].forEach(function (yy) { ctx.beginPath(); ctx.moveTo(0, BENCH - 24 + yy); ctx.lineTo(W, BENCH - 24 + yy); ctx.stroke(); });
      ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fillRect(116, BENCH - 24, 128, 26); ctx.strokeStyle = "#D6DEE2"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(116, BENCH - 12); ctx.lineTo(244, BENCH - 12); ctx.stroke(); ctx.setLineDash([]);
      if (S && S.sinkT > 0) { ctx.fillStyle = "rgba(120,190,230,.35)"; ctx.fillRect(0, BENCH - 24, W, 8); }
      ctx.fillStyle = "#9DA9B1"; ctx.fillRect(0, BENCH + 2, W, 6);
      ctx.fillStyle = "#F7FAFB"; ctx.fillRect(0, BENCH + 8, W, H - BENCH);
      ctx.strokeStyle = "#DCE4E8"; ctx.lineWidth = 2; for (var i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(i * 120, BENCH + 14); ctx.lineTo(i * 120, H); ctx.stroke(); }
      for (i = 0; i < 3; i++) { rr(i * 120 + 40, BENCH + 28, 40, 6, 3); ctx.fillStyle = "#B7C2C9"; ctx.fill(); }
      ctx.globalAlpha = 0.18; pawPrint(180, BENCH + 72, 2.2, "#2E7D6B"); ctx.globalAlpha = 1;
    }
    function heatPad(sleeping) {
      var x = 334, y = BENCH - 14;
      rr(x - 28, BENCH - 12, 56, 10, 5); ctx.fillStyle = "#E05A8A"; ctx.fill(); rr(x - 25, BENCH - 15, 50, 7, 4); ctx.fillStyle = "#F4A6C0"; ctx.fill();
      ctx.globalAlpha = 0.5; pawPrint(x - 12, BENCH - 8, 0.35, "#FFFFFF"); pawPrint(x + 12, BENCH - 8, 0.35, "#FFFFFF"); ctx.globalAlpha = 1;
      if (!sleeping) return;
      ctx.strokeStyle = "#66646E"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x + 14, y + 4); ctx.quadraticCurveTo(x + 4, y + 12, x - 12, y + 6); ctx.stroke();
      ell(x, y, 20, 11, "#7E7C86"); ell(x + 4, y - 4, 9, 5, "#E6B08A"); ell(x - 6, y + 2, 6, 4, "#66646E");
      ell(x - 13, y - 4, 9, 8, "#7E7C86"); ctx.save(); ctx.beginPath(); ctx.ellipse(x - 13, y - 4, 9, 8, 0, 0, 7); ctx.clip(); ctx.fillStyle = "#E6B08A"; ctx.fillRect(x - 13, y - 14, 10, 20); ctx.restore();
      ctx.fillStyle = "#66646E"; ctx.beginPath(); ctx.moveTo(x - 20, y - 8); ctx.lineTo(x - 19, y - 17); ctx.lineTo(x - 14, y - 11); ctx.fill(); ctx.fillStyle = "#7E7C86"; ctx.beginPath(); ctx.moveTo(x - 11, y - 11); ctx.lineTo(x - 7, y - 18); ctx.lineTo(x - 5, y - 9); ctx.fill();
      ctx.strokeStyle = "#3B3942"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x - 16, y - 4, 2.5, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke(); ctx.beginPath(); ctx.arc(x - 9, y - 4, 2.5, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
      ctx.strokeStyle = "rgba(224,90,138,.55)"; ctx.lineWidth = 1.6; [x + 18, x + 24].forEach(function (hx) { ctx.beginPath(); ctx.moveTo(hx, y - 6); ctx.quadraticCurveTo(hx - 3, y - 11, hx, y - 16); ctx.quadraticCurveTo(hx + 3, y - 21, hx, y - 26); ctx.stroke(); });
      ctx.fillStyle = "rgba(107,90,147," + (0.5 + Math.sin(t() * 2) * 0.3) + ")"; ctx.font = "700 11px " + P; ctx.textAlign = "left"; ctx.fillText("z", x - 4, y - 18 - (t() * 8) % 8); ctx.font = "700 8px " + P; ctx.fillText("z", x + 4, y - 26 - (t() * 8) % 8);
    }
    function sulk() { carrier(36, BENCH - 22, false, "b", 0.8); txt("sulking", 36, BENCH - 72, "600 10px " + P, "#6B5A93"); }

    // ---------------- things on the table ----------------
    var ALIAS = { vase: "flask", tv: "monitor", tank: "dispenser", hedgehog: "echidna", hairball: "furball", tap: "hose", fish: "heatpack", catnip: "nipfish" };
    var KINDS = {};
    TEXT.ITEMS.concat(TEXT.FOOD, TEXT.BADFOOD, TEXT.SPIKY, ["flask", "monitor", "dispenser", "echidna", "furball", "hose", "heatpack", "nipfish", "treat", "prizejar"]).forEach(function (k) { KINDS[k] = 1; });
    function has(k) { return !!(KINDS[k] || ALIAS[k]); }
    function item(kind) {
      kind = ALIAS[kind] || kind;
      switch (kind) {
        case "steth":
          ctx.strokeStyle = "#2E7D6B"; ctx.lineWidth = 4.5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-13, -38); ctx.quadraticCurveTo(-16, -14, 0, -13); ctx.quadraticCurveTo(16, -14, 13, -38); ctx.moveTo(0, -13); ctx.quadraticCurveTo(0, -2, 13, -5); ctx.stroke();
          circ(-13, -39, 2.6, "#AEB8C0"); circ(13, -39, 2.6, "#AEB8C0"); circ(15, -6, 7.5, "#AEB8C0"); circ(15, -6, 4.5, "#E3E9EC"); break;
        case "pills":
          rr(-11, -32, 22, 32, 4); ctx.fillStyle = "#D98A2B"; ctx.globalAlpha = .92; ctx.fill(); ctx.globalAlpha = 1; rr(-13, -38, 26, 8, 3); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.strokeStyle = "#D2C6B6"; ctx.lineWidth = 1.5; ctx.stroke();
          rr(-8, -24, 16, 12, 2); ctx.fillStyle = "#FFFFFF"; ctx.fill(); txt("Rx", 0, -15, "800 7px " + P, "#2B5E80"); break;
        case "clipboard":
          ctx.rotate(-0.08); rr(-15, -40, 30, 40, 3); ctx.fillStyle = "#B4834E"; ctx.fill(); rr(-12, -34, 24, 31, 2); ctx.fillStyle = "#FFFFFF"; ctx.fill();
          rr(-7, -43, 14, 8, 2); ctx.fillStyle = "#AEB8C0"; ctx.fill(); ctx.fillStyle = "#C9D2D8"; ctx.fillRect(-4, -45, 8, 3);
          ctx.fillStyle = "#C9D3D9"; [-27, -22, -17, -12].forEach(function (yy, i) { ctx.fillRect(-9, yy, i === 3 ? 10 : 18, 2); }); txt("✓", 6, -8, "800 9px " + P, "#2E7D6B"); break;
        case "cone":
          ctx.fillStyle = "rgba(200,228,242,.85)"; ctx.beginPath(); ctx.moveTo(-21, -2); ctx.lineTo(-9, -30); ctx.lineTo(9, -30); ctx.lineTo(21, -2); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#7FAFC6"; ctx.lineWidth = 1.6; ctx.stroke();
          ell(0, -30, 9, 3, "#E9F4FA"); ctx.strokeStyle = "#7FAFC6"; ctx.beginPath(); ctx.ellipse(0, -30, 9, 3, 0, 0, 7); ctx.stroke();
          ctx.strokeStyle = "#5F95AE"; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(0, -2, 21, 4, 0, 0, Math.PI); ctx.stroke(); [-11, 0, 11].forEach(function (q) { circ(q, -24, 1.6, "#5F95AE"); }); break;
        case "thermo":
          ctx.rotate(-0.5); rr(-5, -38, 10, 30, 5); ctx.fillStyle = "#2E9C8F"; ctx.fill(); rr(-3, -32, 6, 10, 1.5); ctx.fillStyle = "#D7F5E9"; ctx.fill();
          circ(0, -15, 2, "#FFFFFF"); ctx.fillStyle = "#C9D2D8"; ctx.fillRect(-1.5, -9, 3, 7); circ(0, -2, 2.2, "#AEB8C0"); break;
        case "cotton":
          rr(-13, -34, 26, 34, 5); ctx.fillStyle = "rgba(190,222,240,.55)"; ctx.fill(); ctx.strokeStyle = "#9CC3D6"; ctx.lineWidth = 1.5; ctx.stroke();
          [[-6, -8], [5, -9], [0, -15], [-5, -22], [6, -21], [0, -27]].forEach(function (q) { circ(q[0], q[1], 5.5, "#FFFFFF"); circ(q[0] - 1.5, q[1] - 1.5, 2, "#F4F4F4"); });
          rr(-15, -40, 30, 8, 3); ctx.fillStyle = "#2B5E80"; ctx.fill(); break;
        case "treatjar":
          rr(-14, -36, 28, 36, 6); ctx.fillStyle = "rgba(190,222,240,.5)"; ctx.fill(); ctx.strokeStyle = "#9CC3D6"; ctx.lineWidth = 1.5; ctx.stroke();
          rr(-16, -42, 32, 8, 3); ctx.fillStyle = "#E05A8A"; ctx.fill(); circ(0, -44, 3.5, "#E05A8A");
          rr(-11, -26, 22, 11, 2); ctx.fillStyle = "#FFFFFF"; ctx.fill(); txt("TREATS", 0, -18.5, "800 5.5px " + P, "#B5308A");
          [[-5, -4], [4, -3], [0, -6]].forEach(function (q) { circ(q[0], q[1], 1.8, "#B07A0C"); }); break;
        case "syringe": // an ORAL syringe: no needle, rounded tip
          ctx.rotate(-0.12); rr(-18, -16, 30, 12, 4); ctx.fillStyle = "rgba(255,255,255,.95)"; ctx.fill(); ctx.strokeStyle = "#B7C2C9"; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.fillStyle = "#B7C2C9"; [-12, -7, -2, 3, 8].forEach(function (q) { ctx.fillRect(q, -16, 1.2, 4); });
          rr(-14, -13, 12, 6, 2); ctx.fillStyle = "#F4A6C0"; ctx.fill();
          ctx.fillStyle = "#7A3FB5"; ctx.fillRect(-30, -12, 13, 4); rr(-33, -18, 5, 16, 2); ctx.fill(); rr(-20, -19, 3, 18, 1.5); ctx.fill();
          rr(12, -13, 7, 6, 3); ctx.fillStyle = "#E3E9EC"; ctx.fill(); ctx.strokeStyle = "#B7C2C9"; ctx.stroke(); txt("ORAL", -3, -22, "800 6px " + P, "#7A3FB5"); break;
        case "bandage":
          ctx.fillStyle = "#7A3FB5"; ctx.beginPath(); ctx.moveTo(8, -6); ctx.quadraticCurveTo(24, -4, 26, 0); ctx.lineTo(4, 0); ctx.fill();
          ell(-2, -14, 14, 14, "#9B6BD0"); ell(-2, -14, 6, 6, "#5E2E91"); ell(-2, -14, 3, 3, "#E9DDF7");
          ctx.globalAlpha = 0.6; pawPrint(-9, -22, 0.25, "#FFFFFF"); pawPrint(5, -8, 0.25, "#FFFFFF"); ctx.globalAlpha = 1; break;
        case "glove":
          ell(0, -16, 12, 13, "#8BC4E8"); [[-12, -30, -0.5], [-6, -36, -0.2], [0, -38, 0], [6, -36, 0.2]].forEach(function (f) { ell(f[0], f[1], 4, 8, "#8BC4E8", f[2]); }); ell(13, -20, 4, 7, "#8BC4E8", 0.9);
          ell(-4, -20, 3, 5, "rgba(255,255,255,.5)", -0.3); ctx.fillStyle = "#6FA8C9"; ctx.beginPath(); ctx.moveTo(-4, -3); ctx.lineTo(4, -3); ctx.lineTo(0, 2); ctx.fill();
          ctx.strokeStyle = "#2B5E80"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(-3, -18, 1.4, 0, 7); ctx.moveTo(4.4, -18); ctx.arc(3, -18, 1.4, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -13, 4, 0.2, Math.PI - 0.2); ctx.stroke(); break;
        case "flask":
          ctx.fillStyle = "rgba(200,230,240,.7)"; ctx.beginPath(); ctx.moveTo(-6, -50); ctx.lineTo(6, -50); ctx.lineTo(6, -32); ctx.lineTo(22, -4); ctx.quadraticCurveTo(22, 0, 18, 0); ctx.lineTo(-18, 0); ctx.quadraticCurveTo(-22, 0, -22, -4); ctx.lineTo(-6, -32); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#8FB8CC"; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = "#5BD08A"; ctx.beginPath(); ctx.moveTo(-14, -16); ctx.lineTo(14, -16); ctx.lineTo(21, -4); ctx.quadraticCurveTo(21, -1, 17, -1); ctx.lineTo(-17, -1); ctx.quadraticCurveTo(-21, -1, -21, -4); ctx.closePath(); ctx.fill();
          circ(-5, -8, 2.5, "rgba(255,255,255,.7)"); circ(6, -11, 1.6, "rgba(255,255,255,.7)"); circ(2, -24, 1.6, "rgba(91,208,138,.7)"); rr(-7, -56, 14, 7, 2); ctx.fillStyle = "#B4834E"; ctx.fill(); break;
        case "monitor":
          rr(-36, -56, 72, 46, 5); ctx.fillStyle = "#3B3B44"; ctx.fill(); rr(-31, -52, 62, 37, 3); ctx.fillStyle = "#E9F4FA"; ctx.fill();
          txt("PATIENT: BASIL", 0, -42, "800 6px " + P, "#2B5E80"); ctx.fillStyle = "#C2553A"; rr(-25, -37, 50, 10, 2); ctx.fill(); txt("CAUTION: BITEY", 0, -30, "800 6px " + P, "#FFFFFF"); ctx.fillStyle = "#C9D3D9"; ctx.fillRect(-25, -23, 36, 2); ctx.fillRect(-25, -19, 28, 2);
          ctx.fillStyle = "#2B2340"; ctx.fillRect(-4, -10, 8, 6); rr(-16, -4, 32, 4, 2); ctx.fill(); circ(28, -13, 1.6, "#5BD08A"); break;
        case "dispenser":
          rr(-30, -26, 60, 26, 5); ctx.fillStyle = "#C2553A"; ctx.fill(); rr(-8, -18, 16, 10, 2); ctx.fillStyle = "#2B2340"; ctx.fill(); circ(18, -14, 5, "#E3E9EC"); circ(18, -14, 2, "#AEB8C0");
          ell(0, -54, 34, 30, "rgba(190,222,240,.6)"); ctx.strokeStyle = "#8FB8CC"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(0, -54, 34, 30, 0, 0, 7); ctx.stroke();
          ctx.save(); ctx.beginPath(); ctx.ellipse(0, -54, 32, 28, 0, 0, 7); ctx.clip(); for (var tq = 0; tq < 34; tq++) { circ(((tq * 37) % 60) - 30, -30 - ((tq * 23) % 30), 4, ["#B07A0C", "#C98A3E", "#8A5A2B", "#E0A21E"][tq % 4]); } ctx.restore();
          ell(-12, -66, 8, 5, "rgba(255,255,255,.55)", -0.5); rr(-10, -88, 20, 6, 3); ctx.fillStyle = "#C2553A"; ctx.fill(); txt("TREATS", 0, 6 - 26 + 14, "800 7px " + P, "#FFFFFF"); break;
        case "hose":
          ctx.strokeStyle = "#7FA3C2"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.ellipse(-4, -10, 14, 8, 0, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(8, -14); ctx.quadraticCurveTo(14, -32, 4, -38); ctx.stroke();
          ctx.save(); ctx.translate(4, -38); ctx.rotate(-0.6); rr(-8, -5, 16, 10, 3); ctx.fillStyle = "#AEB8C0"; ctx.fill(); ell(-9, 0, 4, 7, "#C9D2D8"); ctx.restore();
          [[-12, -44], [-16, -36], [-8, -50]].forEach(function (q, i) { circ(q[0], q[1] + (S ? (S.t * 30 + i * 5) % 8 : 0), 2.5, "#5AA9DC"); }); break;
        case "heatpack":
          rr(-20, -18, 40, 18, 8); ctx.fillStyle = "#F4A6C0"; ctx.fill(); ctx.strokeStyle = "#E05A8A"; ctx.lineWidth = 1.5; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.moveTo(-6, -17); ctx.lineTo(-6, -1); ctx.moveTo(7, -17); ctx.lineTo(7, -1); ctx.stroke(); ctx.setLineDash([]);
          ctx.strokeStyle = "rgba(224,90,138,.7)"; ctx.lineWidth = 2; [-8, 0, 8].forEach(function (hx) { ctx.beginPath(); ctx.moveTo(hx, -22); ctx.quadraticCurveTo(hx - 3, -27, hx, -32); ctx.quadraticCurveTo(hx + 3, -37, hx, -42); ctx.stroke(); }); break;
        case "nipfish":
          ell(-2, -12, 18, 10, "#7A3FB5"); ctx.fillStyle = "#7A3FB5"; ctx.beginPath(); ctx.moveTo(14, -12); ctx.lineTo(26, -22); ctx.lineTo(26, -2); ctx.fill();
          ctx.fillStyle = "#5BD08A"; [-10, -2, 6].forEach(function (q) { ctx.fillRect(q, -21, 3, 18); }); circ(-12, -14, 2.4, "#FFFFFF"); circ(-12, -14, 1.2, "#2B2340");
          txt("NIP", 0, -26, "800 7px " + P, "#2E7D6B"); ell(-6, -32, 4, 7, "#3E9E5E", -0.5); ell(4, -33, 4, 8, "#4FB070", 0.4); break;
        case "furball":
          [[-9, -9, 8], [7, -10, 9], [0, -16, 8], [-2, -6, 7], [10, -5, 5], [-11, -4, 5]].forEach(function (q, k) { circ(q[0], q[1], q[2], k % 2 ? "#D9D3CB" : "#F3EEE7"); }); [[-4, -12, 4], [5, -8, 4]].forEach(function (q) { circ(q[0], q[1], q[2], "#9A97A3"); circ(q[0] + 3, q[1] - 2, 2.5, "#E6B08A"); });
          ctx.strokeStyle = "#BDB3A6"; ctx.lineWidth = 1.2; [[-14, -12, -19, -16], [12, -14, 17, -19], [2, -22, 3, -27]].forEach(function (l) { ctx.beginPath(); ctx.moveTo(l[0], l[1]); ctx.lineTo(l[2], l[3]); ctx.stroke(); }); break;
        case "echidna":
          ctx.fillStyle = "#5A3D28"; ctx.beginPath(); for (var hq = 0; hq <= 20; hq++) { var ha = Math.PI * 0.95 + hq / 20 * Math.PI, hr = hq % 2 ? 15 : 23; ctx.lineTo(-3 + Math.cos(ha) * hr, -12 + Math.sin(ha) * hr * 0.9); } ctx.closePath(); ctx.fill();
          ctx.strokeStyle = "#F1E2B8"; ctx.lineWidth = 2.2; ctx.lineCap = "round"; for (var sp = 0; sp < 9; sp++) { var sa = Math.PI * 1.05 + sp / 8 * Math.PI * 0.9; ctx.beginPath(); ctx.moveTo(-3 + Math.cos(sa) * 10, -12 + Math.sin(sa) * 9); ctx.lineTo(-3 + Math.cos(sa) * 20, -12 + Math.sin(sa) * 18); ctx.stroke(); }
          ell(-3, -12, 15, 8, "#4A3020"); ell(14, -10, 8, 6, "#4A3020"); ctx.strokeStyle = "#4A3020"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(20, -9); ctx.quadraticCurveTo(28, -8, 31, -4); ctx.stroke();
          ctx.strokeStyle = "#E6D6B8"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(15, -12, 2.4, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
          ctx.fillStyle = "#C99A63"; ctx.beginPath(); ctx.moveTo(-26, -10); ctx.lineTo(24, -10); ctx.lineTo(20, 0); ctx.lineTo(-22, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#8A5A2B"; ctx.lineWidth = 1.2; for (var bw = -22; bw < 22; bw += 6) { ctx.beginPath(); ctx.moveTo(bw, -10); ctx.lineTo(bw + 3, 0); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-25, -6); ctx.lineTo(23, -6); ctx.stroke();
          rr(-26, -12, 50, 4, 2); ctx.fillStyle = "#B4834E"; ctx.fill(); break;
        case "dentalchew":
          ctx.rotate(-0.12); rr(-18, -12, 36, 9, 4.5); ctx.fillStyle = "#5BAF62"; ctx.fill(); [[-18, -12], [-18, -4], [18, -12], [18, -4]].forEach(function (q) { circ(q[0], q[1], 5, "#5BAF62"); });
          ctx.strokeStyle = "#3E8E4A"; ctx.lineWidth = 1.5; [-9, -3, 3, 9].forEach(function (q) { ctx.beginPath(); ctx.moveTo(q, -12); ctx.lineTo(q, -4); ctx.stroke(); }); ell(-4, -11, 8, 1.5, "rgba(255,255,255,.4)"); break;
        case "kibble":
          ctx.fillStyle = "#2B5E80"; ctx.beginPath(); ctx.moveTo(-18, -14); ctx.lineTo(18, -14); ctx.lineTo(13, 0); ctx.lineTo(-13, 0); ctx.closePath(); ctx.fill();
          [[-10, -16], [-3, -19], [4, -18], [11, -16], [-6, -21], [1, -23], [7, -21]].forEach(function (q, i) { ell(q[0], q[1], 3.6, 2.8, i % 2 ? "#8A5A2B" : "#A8703A"); });
          rr(-8, -11, 16, 8, 2); ctx.fillStyle = "#FFFFFF"; ctx.fill(); txt("Rx", 0, -4.8, "800 6px " + P, "#2B5E80"); break;
        case "tunatube":
          ctx.rotate(0.15); ctx.fillStyle = "#E05A8A"; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.lineTo(8, -26); ctx.lineTo(-8, -26); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#B5308A"; ctx.fillRect(-7, -4, 14, 4);
          ctx.fillStyle = "#FFFFFF"; ctx.fillRect(-6, -19, 12, 7); txt("TUNA", 0, -13.6, "800 4.8px " + P, "#B5308A");
          rr(-4, -32, 8, 6, 2); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ell(0, -35, 7, 4, "#E8B48A"); ell(2, -39, 4, 3, "#E8B48A"); break;
        case "biscuitjar":
          rr(-15, -38, 30, 38, 6); ctx.fillStyle = "rgba(190,222,240,.55)"; ctx.fill(); ctx.strokeStyle = "#9CC3D6"; ctx.lineWidth = 1.5; ctx.stroke();
          [[-6, -8, 0.4], [6, -10, -0.3], [0, -18, 0.2]].forEach(function (b) { ctx.save(); ctx.translate(b[0], b[1]); ctx.rotate(b[2]); rr(-7, -2.5, 14, 5, 2.5); ctx.fillStyle = "#C98A3E"; ctx.fill(); [-7, 7].forEach(function (q) { circ(q, -2.5, 3, "#C98A3E"); circ(q, 2.5, 3, "#C98A3E"); }); ctx.restore(); });
          rr(-17, -44, 34, 8, 3); ctx.fillStyle = "#2B5E80"; ctx.fill(); rr(-13, -33, 26, 9, 2); ctx.fillStyle = "#FFFFFF"; ctx.fill(); txt("GOOD BOY", 0, -26.6, "800 5px " + P, "#2B5E80"); break;
        case "jerky":
          ctx.fillStyle = "#9A4E2A"; ctx.beginPath(); ctx.moveTo(-20, -6); ctx.quadraticCurveTo(-10, -16, 0, -8); ctx.quadraticCurveTo(10, 0, 20, -10); ctx.lineTo(22, -3); ctx.quadraticCurveTo(10, 8, 0, -1); ctx.quadraticCurveTo(-10, -9, -18, 1); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = "#C27A43"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-14, -6); ctx.quadraticCurveTo(-6, -11, 2, -5); ctx.moveTo(6, -3); ctx.quadraticCurveTo(12, -1, 17, -6); ctx.stroke(); break;
        case "sardine":
          rr(-20, -12, 40, 12, 4); ctx.fillStyle = "#AEB8C0"; ctx.fill(); rr(-17, -11, 34, 8, 3); ctx.fillStyle = "#E8B48A"; ctx.fill();
          [[-6, -10], [6, -12]].forEach(function (f) { ell(f[0], f[1], 10, 3.5, "#C9D2D8"); ell(f[0], f[1] - 1, 8, 1.4, "#8FA4B4"); ctx.fillStyle = "#C9D2D8"; ctx.beginPath(); ctx.moveTo(f[0] + 9, f[1]); ctx.lineTo(f[0] + 14, f[1] - 4); ctx.lineTo(f[0] + 14, f[1] + 4); ctx.fill(); circ(f[0] - 7, f[1] - 0.5, 1, "#2B2340"); });
          ctx.save(); ctx.translate(-20, -12); ctx.rotate(-1.1); rr(0, -2, 22, 4, 2); ctx.fillStyle = "#C9D2D8"; ctx.fill(); ctx.restore(); break;
        case "treat": [[-5, -4], [4, -4], [0, -9]].forEach(function (q, i) { circ(q[0], q[1], 4.5, ["#B07A0C", "#C98A3E", "#8A5A2B"][i]); }); break;
        case "pillcheese":
          ctx.fillStyle = "#F2C230"; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ctx.lineTo(18, -16); ctx.lineTo(-18, -4); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#F7D86A"; ctx.beginPath(); ctx.moveTo(-18, -4); ctx.lineTo(18, -16); ctx.lineTo(12, -19); ctx.closePath(); ctx.fill();
          circ(-6, -4, 2.6, "#D9A441"); circ(8, -7, 2.2, "#D9A441"); circ(12, -3, 1.6, "#D9A441");
          ctx.save(); ctx.translate(2, -15); ctx.rotate(-0.4); rr(-6, -3.5, 12, 7, 3.5); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.strokeStyle = "#BDB3A6"; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = "#6FA8C9"; ctx.fillRect(0, -3.5, 6, 7); ctx.restore(); break;
        case "wormer":
          rr(-15, -16, 30, 16, 8); ctx.fillStyle = "#F4EFE6"; ctx.fill(); ctx.strokeStyle = "#D8CDBB"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(0, -1); ctx.stroke();
          txt("W", -7, -5, "900 8px " + P, "#B4834E"); txt("W", 7, -5, "900 8px " + P, "#B4834E"); break;
        case "pipette":
          ctx.rotate(-0.3); ctx.fillStyle = "rgba(200,230,240,.85)"; ctx.beginPath(); ctx.moveTo(-3, -6); ctx.lineTo(3, -6); ctx.lineTo(5, -26); ctx.lineTo(-5, -26); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#8CC63F"; ctx.fillRect(-4, -20, 8, 13);
          ctx.fillStyle = "rgba(200,230,240,.85)"; ctx.beginPath(); ctx.moveTo(-2, -6); ctx.lineTo(2, -6); ctx.lineTo(0.6, 0); ctx.lineTo(-0.6, 0); ctx.fill(); rr(-8, -33, 16, 8, 3); ctx.fillStyle = "#2E7D6B"; ctx.fill();
          ctx.fillStyle = "#FFFFFF"; ctx.fillRect(-4, -18, 8, 6); txt("FLEA", 0, -13.6, "800 3.8px " + P, "#2E7D6B"); break;
        case "dietfood":
          rr(-15, -22, 30, 22, 3); ctx.fillStyle = "#C9D2D8"; ctx.fill(); rr(-15, -18, 30, 13, 2); ctx.fillStyle = "#9ACD7F"; ctx.fill(); txt("LITE", 0, -10, "900 7px " + P, "#FFFFFF"); txt("0% JOY", 0, -4.4, "800 4.5px " + P, "#2E6B3A");
          ell(0, -22, 15, 3.5, "#AEB8C0"); ell(0, -22, 11, 2.2, "#C9D2D8"); break;
        case "clippers":
          ctx.rotate(-0.25); ctx.strokeStyle = "#E05A8A"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-20, -6); ctx.quadraticCurveTo(-6, -8, 4, -14); ctx.moveTo(-20, -18); ctx.quadraticCurveTo(-6, -16, 4, -12); ctx.stroke();
          ctx.fillStyle = "#AEB8C0"; ctx.beginPath(); ctx.moveTo(2, -16); ctx.lineTo(20, -20); ctx.lineTo(22, -16); ctx.lineTo(6, -12); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(2, -10); ctx.lineTo(20, -10); ctx.lineTo(20, -14); ctx.lineTo(6, -13); ctx.closePath(); ctx.fill(); circ(4, -13, 2.6, "#6B7180"); break;
        case "slicker":
          ctx.rotate(-0.2); rr(-24, -8, 22, 6, 3); ctx.fillStyle = "#2B5E80"; ctx.fill(); rr(-4, -20, 26, 18, 3); ctx.fill();
          ctx.strokeStyle = "#AEB8C0"; ctx.lineWidth = 1.4; for (var px = 0; px < 5; px++) { ctx.beginPath(); ctx.moveTo(px * 5, -20); ctx.lineTo(-1 + px * 5, -27); ctx.stroke(); } break;
        case "spikyball":
          ctx.fillStyle = "#C9C653"; for (var sb = 0; sb < 14; sb++) { var a = sb / 14 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a - 0.2) * 11, -13 + Math.sin(a - 0.2) * 11); ctx.lineTo(Math.cos(a) * 18, -13 + Math.sin(a) * 18); ctx.lineTo(Math.cos(a + 0.2) * 11, -13 + Math.sin(a + 0.2) * 11); ctx.fill(); }
          circ(0, -13, 12, "#B4B23E"); circ(-4, -17, 3.5, "rgba(255,255,255,.4)"); break;
        case "cactus":
          rr(-12, -16, 24, 16, 3); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.strokeStyle = "#D2C6B6"; ctx.lineWidth = 1.2; ctx.stroke(); ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(13, -8, 5, -1.3, 1.3); ctx.stroke(); ctx.strokeStyle = "#D2C6B6"; ctx.lineWidth = 1; ctx.stroke();
          txt("♥", 0, -5, "900 8px " + P, "#E05A8A");
          ell(0, -28, 9, 14, "#3E8E4A"); ell(-10, -30, 5, 8, "#3E8E4A", -0.4); ell(10, -34, 5, 7, "#3E8E4A", 0.4); ctx.strokeStyle = "#1F4F27"; ctx.lineWidth = 1.3; [[-8, -34], [8, -28], [-6, -22], [6, -38], [0, -42], [-14, -34], [14, -38]].forEach(function (q) { ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] + (q[0] < 0 ? -4 : q[0] > 0 ? 4 : 0), q[1] - 3); ctx.stroke(); });
          circ(0, -43, 3, "#E05A8A"); break;
        case "prizejar":
          rr(-26, -60, 52, 60, 10); ctx.fillStyle = "rgba(190,222,240,.6)"; ctx.fill(); ctx.strokeStyle = "#9CC3D6"; ctx.lineWidth = 2; ctx.stroke();
          ctx.save(); rr(-24, -58, 48, 56, 9); ctx.clip(); for (var pq = 0; pq < 40; pq++) circ(((pq * 37) % 46) - 23, -4 - ((pq * 13) % 40), 4.5, ["#B07A0C", "#C98A3E", "#8A5A2B", "#E0A21E"][pq % 4]); ctx.restore();
          rr(-29, -70, 58, 13, 4); ctx.fillStyle = "#E05A8A"; ctx.fill(); circ(0, -73, 6, "#E05A8A"); rr(-18, -44, 36, 14, 3); ctx.fillStyle = "#FFFFFF"; ctx.fill(); txt("TREATS", 0, -33.5, "900 9px " + P, "#B5308A"); break;
        default: return false;
      }
      return true;
    }

    // ---------------- flyers ----------------
    // moth -> blowfly, butterfly -> bluebottle, wasp -> mozzie. Drawn at the origin; fl = wing flap 0.2..1
    function flyer(kind, fl) {
      if (kind === "wasp") {
        ctx.save(); ctx.scale(1, fl); ell(-8, -6, 9, 3.5, "rgba(220,235,245,.85)", -0.35); ell(8, -6, 9, 3.5, "rgba(220,235,245,.85)", 0.35); ctx.restore();
        ell(0, 4, 2.6, 10, "#5A3D28"); ctx.fillStyle = "#F1E2B8"; [0, 5, 10].forEach(function (yy) { ctx.fillRect(-2.6, yy - 1, 5.2, 1.6); }); circ(0, -7, 3.4, "#2B2340");
        ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 1; [[-2, 0, -14, 10], [2, 0, 14, 10], [-2, 2, -12, 16], [2, 2, 12, 16], [-2, -2, -12, -2], [2, -2, 12, -2]].forEach(function (l) { ctx.beginPath(); ctx.moveTo(l[0], l[1]); ctx.lineTo(l[2], l[3]); ctx.stroke(); });
        ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(0, -19); ctx.stroke(); return;
      }
      ctx.save(); ctx.scale(1, fl); ell(-8, -8, 10, 5, "rgba(220,235,245,.85)", -0.5); ell(8, -8, 10, 5, "rgba(220,235,245,.85)", 0.5); ctx.restore();
      var body = kind === "butterfly" ? "#2F5DA8" : "#2E7D6B";
      ell(0, 2, 7, 10, body); ell(-2, -1, 2.5, 5, "rgba(170,230,255,.55)"); circ(0, -9, 5.5, "#2B2340"); circ(-3.5, -10, 3, "#C2553A"); circ(3.5, -10, 3, "#C2553A");
      ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 1.2; [[-6, 2, -11, 6], [6, 2, 11, 6], [-6, 6, -10, 11], [6, 6, 10, 11]].forEach(function (l) { ctx.beginPath(); ctx.moveTo(l[0], l[1]); ctx.lineTo(l[2], l[3]); ctx.stroke(); });
    }
    function fleas(n) {
      [[-14, 4], [-4, -6], [8, 2], [16, -8], [2, 10], [-10, -14], [12, 14], [-18, -4], [20, 6]].slice(0, n).forEach(function (q, i) {
        var hop = Math.abs(Math.sin(t() * 9 + i)) * 5, x = q[0], y = q[1] - hop;
        ell(x, y, 3.4, 2.4, "#5A3D28", 0.3); circ(x + 2.6, y - 1, 1.3, "#3A2818"); ctx.strokeStyle = "#3A2818"; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x - 2, y + 1.5); ctx.lineTo(x - 4, y + 4); ctx.moveTo(x, y + 2); ctx.lineTo(x + 1, y + 4.5); ctx.stroke();
      });
    }
    function bubble(hue) {
      var g = ctx.createRadialGradient(-6, -6, 2, 0, 0, 20); g.addColorStop(0, "rgba(255,255,255,.9)"); g.addColorStop(0.5, "rgba(200,235,255,.25)"); g.addColorStop(1, "rgba(181,48,138,.35)");
      circ(0, 0, 18, g); ctx.lineWidth = 2.5; for (var i = 0; i < 4; i++) { ctx.strokeStyle = "hsl(" + ((hue + i * 90) % 360) + ",85%,65%)"; ctx.beginPath(); ctx.arc(0, 0, 17 - i * 0.6, i * 1.4 + hue / 60, i * 1.4 + 1.3 + hue / 60); ctx.stroke(); } ell(-7, -8, 5, 3, "rgba(255,255,255,.85)", -0.6);
    }

    // ---------------- waiting-room visitors ----------------
    function cockatoo(x, y, squawk, k) {
      ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
      ctx.fillStyle = "#F2C230"; [[-14, -0.6], [-6, -0.3], [3, 0], [11, 0.3]].forEach(function (c) { ctx.save(); ctx.translate(c[0] * 0.5, -26); ctx.rotate(c[1] - 0.2); ctx.beginPath(); ctx.moveTo(-3, 0); ctx.quadraticCurveTo(-4, -18, 2 + c[1] * 6, -30 - (squawk ? 6 : 0)); ctx.quadraticCurveTo(3, -14, 4, 0); ctx.fill(); ctx.restore(); });
      ell(0, 20, 22, 26, "#FFFFFF"); ell(-12, 22, 9, 20, "#F1ECE4", 0.2); ell(0, -8, 18, 18, "#FFFFFF");
      ctx.strokeStyle = "#E2DCD3"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, -8, 18, 18, 0, 0, 7); ctx.stroke();
      ell(4, -4, 6, 5, "#FBE9EC"); circ(-4, -12, 3.6, "#1B1430"); circ(-5, -13.5, 1.2, "#FFFFFF");
      ctx.fillStyle = "#4A4A55"; ctx.beginPath(); ctx.moveTo(8, -12); ctx.quadraticCurveTo(22, -12, 20, 2); ctx.quadraticCurveTo(14, -2, 8, -2); ctx.closePath(); ctx.fill();
      if (squawk) { ctx.fillStyle = "#3A3A44"; ctx.beginPath(); ctx.moveTo(8, 1); ctx.quadraticCurveTo(16, 6, 18, 10); ctx.quadraticCurveTo(12, 9, 8, 6); ctx.fill(); ell(12, 3, 3, 2.5, "#E05A8A"); }
      ctx.restore();
    }
    var GING = null;
    function gingerSprite() {
      if (GING) return GING; var im = A.sprImg("basil-head"); if (!im) return null;
      var c = document.createElement("canvas"); c.width = 240; c.height = 260; var x = c.getContext("2d");
      x.drawImage(im, 0, 0, 240, 260); x.globalCompositeOperation = "source-atop"; x.fillStyle = "rgba(226,128,58,.85)"; x.fillRect(0, 0, 240, 260);
      x.strokeStyle = "rgba(170,80,25,.75)"; x.lineWidth = 7; x.lineCap = "round"; [[108, 40, 104, 70], [120, 36, 120, 68], [132, 40, 136, 70], [50, 100, 84, 104], [190, 100, 156, 104]].forEach(function (l) { x.beginPath(); x.moveTo(l[0], l[1]); x.lineTo(l[2], l[3]); x.stroke(); });
      GING = c; return c;
    }
    function coneRing(x, y, rx, ry, a) {
      ctx.save(); ctx.globalAlpha = a == null ? 1 : a; ell(x, y, rx, ry, "rgba(205,232,245,.7)"); ctx.strokeStyle = "rgba(127,175,198,.6)"; ctx.lineWidth = 1.5;
      for (var q = 0; q < 12; q++) { var an = q / 12 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * rx * 0.5, y + Math.sin(an) * ry * 0.5); ctx.lineTo(x + Math.cos(an) * rx, y + Math.sin(an) * ry); ctx.stroke(); }
      ctx.restore();
    }
    function coneRim(x, y, rx, ry) { ctx.strokeStyle = "#5F95AE"; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.stroke(); }
    function ginger(x, y, k, noCone) {
      ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
      if (!noCone) coneRing(0, 0, 112, 100);
      var img = gingerSprite(); ctx.save(); ctx.translate(-120, -92); if (img) ctx.drawImage(img, 0, 0, 240, 260);
      [[104, 88], [136, 88]].forEach(function (e, i) { ell(e[0], e[1], 10, 7, "#D9C232"); ell(e[0], e[1] + 1, 1.8, 6.2, "#1B1430"); ctx.strokeStyle = "#1B1430"; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.beginPath(); if (i === 0) { ctx.moveTo(e[0] - 13, e[1] - 15); ctx.lineTo(e[0] + 9, e[1] - 6); } else { ctx.moveTo(e[0] + 13, e[1] - 15); ctx.lineTo(e[0] - 9, e[1] - 6); } ctx.stroke(); });
      ctx.save(); ctx.translate(150, 40); ctx.rotate(0.5); rr(-12, -5, 24, 10, 3); ctx.fillStyle = "#F4D8A0"; ctx.fill(); ctx.fillStyle = "#E6C487"; ctx.fillRect(-4, -5, 8, 10); ctx.restore();
      ctx.restore(); if (!noCone) { ctx.lineWidth = 7; ctx.strokeStyle = "#5F95AE"; ctx.beginPath(); ctx.ellipse(0, 0, 112, 100, 0, 0, 7); ctx.stroke(); }
      ctx.restore();
    }

    // ---------------- Dr Pokesworth and Nurse Burrito ----------------
    var VK = 0.86, VB = BENCH - 24;
    function vetX(b) { return Math.max(126, Math.min(b.nurse && !b.nurse.gone ? 190 : 234, b.x)); } // shuffles about; keeps clear of the nurse
    function spotXY(b) {
      var vx = vetX(b), s = b.spot;
      if (s.core) return { x: vx - 28, y: BENCH - 64 };
      return [{ x: vx - 78, y: BENCH - 100 }, { x: vx, y: BENCH - 186 }, { x: vx + 80, y: BENCH - 120 }][s.lane];
    }
    // the vet's body (behind the table). o: {fraz, ko (0..1 slumping), coned, hit}
    function vetBody(x, o) {
      o = o || {}; var fz = !!o.fraz, base = VB + (o.ko || 0) * 70;
      ctx.save(); ctx.translate(x, base); ctx.scale(VK, VK); if (o.shake) ctx.translate(Math.sin(t() * 70) * 3, 0);
      ctx.fillStyle = SK.coat || "#FFFFFF"; ctx.beginPath(); ctx.moveTo(-66, 0); ctx.lineTo(-62, -108); ctx.quadraticCurveTo(-58, -132, -30, -138); ctx.lineTo(30, -138); ctx.quadraticCurveTo(58, -132, 62, -108); ctx.lineTo(66, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#D6DEE2"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = SK.collar || "#2E9C8F"; ctx.beginPath(); ctx.moveTo(-26, -138); ctx.lineTo(26, -138); ctx.lineTo(0, -92); ctx.closePath(); ctx.fill();
      ctx.fillStyle = SK.lapel || "#EEF3F6"; ctx.beginPath(); ctx.moveTo(-30, -138); ctx.lineTo(-6, -84); ctx.lineTo(-22, -84); ctx.lineTo(-40, -128); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(30, -138); ctx.lineTo(6, -84); ctx.lineTo(22, -84); ctx.lineTo(40, -128); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#D6DEE2"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -84); ctx.lineTo(0, 0); ctx.stroke(); [-60, -36].forEach(function (yy) { circ(4, yy, 2.4, "#C9D2D8"); });
      rr(14, -112, 34, 12, 2); ctx.fillStyle = SK.badge || "#2B5E80"; ctx.fill(); txt(SK.name || "DR POKESWORTH", 31, -103.5, "800 4.2px " + P, "#FFFFFF"); if (SK.check) { ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = SK.check; for (var cy = -132; cy < 0; cy += 16) ctx.fillRect(-64, cy, 128, 6); for (var cx = -60; cx < 64; cx += 16) ctx.fillRect(cx, -134, 6, 134); ctx.restore(); }
      rr(-48, -58, 30, 24, 3); ctx.fillStyle = "#EEF3F6"; ctx.fill(); ctx.strokeStyle = "#D6DEE2"; ctx.stroke(); [[-42, -60], [-34, -62], [-27, -59]].forEach(function (q) { rr(q[0] - 3, q[1] - 4, 6, 8, 2); ctx.fillStyle = "#B07A0C"; ctx.fill(); });
      if (fz) { ell(26, -40, 14, 10, "rgba(122,78,45,.55)", 0.3); ell(34, -26, 5, 7, "rgba(122,78,45,.5)"); circ(18, -24, 3, "rgba(122,78,45,.5)"); }
      if (!SK.noSteth) { ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 3.5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-24, -136); ctx.quadraticCurveTo(-34, -100, -16, -88); ctx.moveTo(24, -136); ctx.quadraticCurveTo(30, -110, 20, -96); ctx.stroke(); circ(-16, -86, 6, "#AEB8C0"); circ(-16, -86, 3.5, "#E3E9EC"); }
      rr(-12, -150, 24, 16, 6); ctx.fillStyle = "#E8B993"; ctx.fill();
      var hx = fz ? 3 : 0, hy = -186;
      if (o.coned) coneRing(hx, hy, 70, 64);
      ell(hx - 36, hy + 4, 7, 10, "#F1C9A5"); ell(hx + 36, hy + 4, 7, 10, "#F1C9A5"); ell(hx, hy, 36, 40, "#F1C9A5");
      // Dr Pokesworth: auburn hair in a bun (falls loose when frazzled), small gold earrings
      ctx.fillStyle = (SK.hair || "#7A4A2E"); [-1, 1].forEach(function (s) { ctx.beginPath(); ctx.moveTo(hx + s * 26, hy - 30); ctx.quadraticCurveTo(hx + s * (fz ? 54 : 46), hy - 14, hx + s * 42, hy + 18); ctx.quadraticCurveTo(hx + s * 36, hy + 6, hx + s * 33, hy - 14); ctx.closePath(); ctx.fill(); if (fz) { line([[hx + s * 44, hy - 6], [hx + s * 56, hy - 14]], (SK.hair || "#7A4A2E"), 3); line([[hx + s * 45, hy + 6], [hx + s * 57, hy + 8]], (SK.hair || "#7A4A2E"), 3); } });
      circ(hx - 37, hy + 15, 2.6, "#E8B53A"); circ(hx + 37, hy + 15, 2.6, "#E8B53A");
      ctx.fillStyle = (SK.hair || "#7A4A2E"); ctx.beginPath(); ctx.moveTo(hx - 37, hy - 4); ctx.quadraticCurveTo(hx - 40, hy - 44, hx, hy - 44); ctx.quadraticCurveTo(hx + 40, hy - 44, hx + 37, hy - 4); ctx.quadraticCurveTo(hx + 30, hy - 22, hx + 12, hy - 26); ctx.quadraticCurveTo(hx - 2, hy - 18, hx - 8, hy - 28); ctx.quadraticCurveTo(hx - 24, hy - 22, hx - 37, hy - 4); ctx.fill();
      if (fz) { circ(hx + 16, hy - 50, 12, (SK.hair || "#7A4A2E")); line([[hx + 22, hy - 60], [hx + 34, hy - 70]], (SK.hair || "#7A4A2E"), 3); line([[hx + 8, hy - 58], [hx + 2, hy - 72]], (SK.hair || "#7A4A2E"), 3); } else { circ(hx, hy - 52, 13, (SK.hair || "#7A4A2E")); line([[hx - 10, hy - 54], [hx + 10, hy - 50]], "#E8B53A", 2.4); }
      ell(hx - 12, hy - 26, 10, 5, "rgba(255,255,255,.35)", -0.4);
      ctx.save(); ctx.translate(hx, hy - 4 + (fz ? 3 : 0)); ctx.rotate(fz ? 0.16 : 0);
      if (!SK.noGlasses) { [-14, 14].forEach(function (gx) { circ(gx, 0, 12, "rgba(220,240,250,.55)"); ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(gx, 0, 12, 0, 7); ctx.stroke(); });
      line([[-2, -1], [2, -1]], "#2B2340", 3); }
      if (o.hit || o.ko) { [-14, 14].forEach(function (gx) { line([[gx - 5, -5], [gx + 5, 5]], "#2B2340", 2.6); line([[gx + 5, -5], [gx - 5, 5]], "#2B2340", 2.6); }); }
      else if (fz) { circ(-14, 0, 5, "#FFFFFF"); circ(-14, 0, 2.6, "#1B1430"); circ(14, 1, 6.5, "#FFFFFF"); circ(15, 1, 2.6, "#1B1430"); }
      else { [-14, 14].forEach(function (gx) { circ(gx + 2, 1, 3.2, "#1B1430"); circ(gx + 3, 0, 1, "#FFFFFF"); }); line([[-22, -16], [-6, -12]], "#6B5A4A", 3); line([[22, -16], [6, -12]], "#6B5A4A", 3); }
      ctx.restore();
      ell(hx + 2, hy + 12, 6, 5, "#E39E86");
      // (no moustache)
      if (fz || o.hit) ell(hx + 2, hy + 31, 7, 4.5, "#5A1F2B"); else { ctx.strokeStyle = "#5A3A30"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(hx - 8, hy + 30); ctx.quadraticCurveTo(hx + 2, hy + 35, hx + 12, hy + 28); ctx.stroke(); }
      if (fz) [[hx - 40, hy - 26], [hx + 42, hy - 18]].forEach(function (d) { ctx.fillStyle = "#8FC3E6"; ctx.beginPath(); ctx.moveTo(d[0], d[1] - 6); ctx.quadraticCurveTo(d[0] + 5, d[1] + 2, d[0], d[1] + 4); ctx.quadraticCurveTo(d[0] - 5, d[1] + 2, d[0], d[1] - 6); ctx.fill(); });
      if (SK.hat) SK.hat(ctx, hx, hy, fz); else if (!fz) { ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(hx, hy - 20, 37, 10, 0, Math.PI, 2 * Math.PI); ctx.stroke(); circ(hx + 26, hy - 34, 8, "#C9D2D8"); circ(hx + 26, hy - 34, 5, "#EEF3F6"); }
      if (o.coned) coneRim(hx, hy, 70, 64);
      ctx.restore();
    }
    // an arm from the shoulder to a hand, with a purple-blue glove
    function arm(sx, sy, hx, hy, side) {
      ctx.strokeStyle = "#D6DEE2"; ctx.lineWidth = 23; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx + side * 18, (sy + hy) / 2 + 18, hx, hy); ctx.stroke();
      ctx.strokeStyle = SK.sleeve || "#FFFFFF"; ctx.lineWidth = 19; ctx.stroke();
      ell(hx, hy, 10.5, 9.5, SK.glove || "#8BC4E8"); [-5, -2, 2, 5].forEach(function (f) { ell(hx + f + side * 5, hy - 8, 2.4, 4.4, SK.glove || "#8BC4E8"); });
    }
    function thermoProp(hx, hy, side, glow, len) {
      len = len || 72; ctx.save(); ctx.translate(hx, hy - 3);
      if (glow) { ctx.save(); ctx.globalAlpha = glow; rr(side < 0 ? -len - 10 : -6, -14, len + 16, 28, 14); ctx.fillStyle = "#FF3B30"; ctx.fill(); ctx.restore(); }
      if (SK.propFn) { SK.propFn(ctx, side, len, glow || 0); ctx.restore(); return; }
      rr(side < 0 ? -len : 4, -6, len - 4, 12, 6); ctx.fillStyle = SK.prop || "#2E9C8F"; ctx.fill(); if (SK.propLabel !== "") { rr(side < 0 ? -36 : 10, -4, 24, 8, 2); ctx.fillStyle = "#D7F5E9"; ctx.fill(); txt(SK.propLabel || "38.6°", side < 0 ? -24 : 22, 2.6, "800 6.5px " + P, "#2B5E80"); }
      circ(side * len, 0, 5, "#E3E9EC"); circ(side * len, 0, 2.6, "#AEB8C0"); ctx.restore();
    }
    function mugProp(hx, hy, spill) {
      ctx.save(); ctx.translate(hx + 6, hy - 14); if (spill) ctx.rotate(0.7);
      rr(-12, -16, 24, 26, 4); ctx.fillStyle = "#E05A8A"; ctx.fill(); ctx.strokeStyle = "#E05A8A"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(13, -3, 6, -1.4, 1.4); ctx.stroke();
      txt("WORLD’S", 0, -7, "800 4.4px " + P, "#FFFFFF"); txt("OKAYEST", 0, -1.5, "800 4.4px " + P, "#FFFFFF"); txt(SK.mug || "VET", 0, 4.5, "900 5px " + P, "#FFFFFF");
      if (spill) { ctx.fillStyle = "#7A4E2D"; ctx.beginPath(); ctx.moveTo(10, -16); ctx.quadraticCurveTo(24, -10, 22, 8); ctx.quadraticCurveTo(16, 0, 10, -10); ctx.fill(); circ(24, 16, 3, "#7A4E2D"); circ(20, 26, 2.2, "#7A4E2D"); }
      else { ctx.strokeStyle = "rgba(150,140,130,.6)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-3, -20); ctx.quadraticCurveTo(-7, -26, -2, -32); ctx.moveTo(4, -20); ctx.quadraticCurveTo(0, -26, 5, -32); ctx.stroke(); }
      ctx.restore();
    }
    function towel(x, y, w, h, rot) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
      rr(-w / 2, -h / 2, w, h, 9); ctx.fillStyle = SK.towel || "#FFFFFF"; ctx.fill(); ctx.strokeStyle = "#D6DEE2"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = SK.towelStripe || "#6FA8C9"; ctx.fillRect(-w / 2, h / 2 - 13, w, 5); ctx.fillRect(-w / 2, h / 2 - 6, w, 3);
      ctx.strokeStyle = "#E3E9EC"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-w / 2 + 6, -h / 2 + 8); ctx.quadraticCurveTo(0, -h / 2 + 16, w / 2 - 6, -h / 2 + 4); ctx.stroke();
      ctx.restore();
    }
    function nurse(x, base, k, leave) {
      ctx.save(); ctx.translate(x + (leave || 0) * 150, base); ctx.scale(k, k);
      ctx.fillStyle = SK.nurse || "#7A3FB5"; ctx.beginPath(); ctx.moveTo(-46, 0); ctx.lineTo(-42, -86); ctx.quadraticCurveTo(-38, -104, -20, -108); ctx.lineTo(20, -108); ctx.quadraticCurveTo(38, -104, 42, -86); ctx.lineTo(46, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#9B6BD0"; ctx.beginPath(); ctx.moveTo(-16, -108); ctx.lineTo(16, -108); ctx.lineTo(0, -82); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 0.35; [[-28, -60], [24, -40], [-14, -26], [30, -78]].forEach(function (q) { pawPrint(q[0], q[1], 0.35, "#FFFFFF"); }); ctx.globalAlpha = 1;
      rr(8, -92, 26, 10, 2); ctx.fillStyle = "#FFFFFF"; ctx.fill(); txt(SK.nurseName || "NURSE", 21, -84.6, "800 " + (SK.nurseName ? 3.8 : 5) + "px " + P, SK.nurse || "#7A3FB5");
      rr(-9, -120, 18, 14, 6); ctx.fillStyle = "#C98A63"; ctx.fill();
      var hy = -146; ell(0, hy, 26, 28, "#D9A27A");
      circ(0, hy - 32, 14, "#3B2A3A"); ctx.fillStyle = "#3B2A3A"; ctx.beginPath(); ctx.ellipse(0, hy - 8, 28, 24, 0, Math.PI, 2 * Math.PI); ctx.fill(); ell(-20, hy - 2, 7, 14, "#3B2A3A"); ell(20, hy - 2, 7, 14, "#3B2A3A");
      rr(-12, hy - 40, 24, 5, 2.5); ctx.fillStyle = "#F2C230"; ctx.fill();
      [-9, 9].forEach(function (ex, i) { circ(ex, hy + 2, 3.2, "#1B1430"); circ(ex + 1, hy + 1, 1, "#FFFFFF"); line([[ex - 6, hy - 6 + (i ? 2 : 0)], [ex + 6, hy - 6 + (i ? 0 : 2)]], "#3B2A3A", 2.6); });
      ell(0, hy + 9, 3, 2.4, "#C9805A"); ctx.strokeStyle = "#7A3A2E"; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-7, hy + 16); ctx.quadraticCurveTo(0, hy + 20, 8, hy + 14); ctx.stroke();
      ctx.globalAlpha = 0.45; ell(-15, hy + 10, 5, 3, "#F08AA8"); ell(15, hy + 10, 5, 3, "#F08AA8"); ctx.globalAlpha = 1;
      ctx.restore();
    }
    // boss: drawn behind the table
    function bossBack(b) {
      var vx = vetX(b), ko = b.done === "win" ? Math.min(1, (2.8 - b.doneT) / 1.2) : 0;
      if (b.nurse) nurse(318, VB, 0.86, b.nurse.leave || 0);
      vetBody(vx, { fraz: b.angry, ko: ko, coned: b.coneT > 0, shake: b.hitT > 0 || (b.atk && b.atk.ph === "warn" && b.atk.kind === "charge"), hit: b.hitT > 0 });
    }
    // boss: arms and props, drawn in front of the table
    function bossFront(b, cats) {
      if (b.done === "win") return;
      var vx = vetX(b), a = b.atk, st = a && a.ph === "stun", sh = { l: [vx - 48, BENCH - 131], r: [vx + 48, BENCH - 131] };
      var left = "clip", right = "mug";
      if (a && !st) {
        var sd = a.side < 0 ? "l" : "r";
        if (a.kind === "charge") { if (sd === "l") left = "thermo"; else right = "thermo"; }
        else if (a.kind === "suck") { if (!(b.nurse && !b.nurse.gone && a.side > 0)) { if (sd === "l") left = "towel"; else right = "towel"; } }
        else if (a.kind === "scratch") { if (sd === "l") left = "hidden"; else right = "hidden"; }
        else if (a.kind === "cone" && a.ph === "warn") { if (sd === "l") left = "cone"; else right = "cone"; }
      }
      [["l", left, -1], ["r", right, 1]].forEach(function (q) {
        var s = q[2], what = q[1], sx = sh[q[0]][0], sy = sh[q[0]][1], hx, hy;
        if (what === "hidden") return; // that hand is hidden. Whatever is in it stays there.
        if (what === "thermo") {
          var tip = a.ph === "go" ? b.x + s * 6 : vx + s * 70, gl = a.ph === "warn" ? 0.25 + 0.4 * (1 - a.t / a.max) * (0.7 + 0.3 * Math.sin(t() * 40)) : 0.15;
          hx = tip - s * 72; hy = BENCH - 80; hx = s < 0 ? Math.max(hx, vx - 150) : Math.min(hx, vx + 150);
          arm(sx, sy, hx, hy, s); thermoProp(hx, hy, s, gl, 72); return;
        }
        if (what === "towel") { var c = cats[s < 0 ? "b" : "c"]; hx = c.x - s * 10; hy = BENCH - 50; arm(sx, sy, hx, hy, s); return; }
        if (what === "cone") { hx = vx + s * 40; hy = BENCH - 196; arm(sx, sy, hx, hy, s); ctx.save(); ctx.translate(hx, hy - 6); item("cone"); ctx.restore(); return; }
        if (what === "clip") { hx = vx - 78; hy = BENCH - 80; arm(sx, sy, hx, hy, s); ctx.save(); ctx.translate(hx, hy + 2); ctx.rotate(0.15); ctx.scale(1.15, 1.15); item("clipboard"); ctx.restore(); return; }
        hx = vx + 74; hy = BENCH - 104; arm(sx, sy, hx, hy, s); mugProp(hx, hy, b.angry);
      });
      // the nurse's hands on the towel when she's the one grabbing
      if (b.nurse && !b.nurse.gone && a && a.kind === "suck" && a.side > 0 && !st) { var cc = cats.c; ell(cc.x + 22, BENCH - 46, 9, 8, "#8BC4E8"); ell(cc.x - 18, BENCH - 52, 9, 8, "#8BC4E8"); }
      // "just a little scratch": a speech bubble, never the thing itself
      if (a && a.kind === "scratch" && !st) {
        var bx = vx + (a.side < 0 ? -64 : 64), by = BENCH - 236, msg = a.ph === "go" ? "…1!" : a.ph === "fake" ? "2 and a half…" : a.t > a.max * 0.5 ? "Just a little scratch… 3…" : "…2…";
        ctx.font = "italic 800 10px " + P; var tw = Math.max(70, ctx.measureText(msg).width + 18); bx = Math.max(tw / 2 + 6, Math.min(W - tw / 2 - 6, bx));
        rr(bx - tw / 2, by - 13, tw, 24, 10); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 1.6; ctx.stroke();
        txt(msg, bx, by + 3, "italic 800 10px " + P, a.ph === "go" ? "#C2553A" : "#2B2340");
      }
    }
    function bossCatExtras(w, x, y, c) {
      // a cat wrapped in a towel burrito, or wearing a cone
      if (c.pull > 0.04) { towel(x, y - 26, 30 + 30 * Math.min(1, c.pull), 22 + 18 * Math.min(1, c.pull), (w === "b" ? -1 : 1) * 0.12); ctx.strokeStyle = "rgba(122,63,181,.75)"; ctx.lineWidth = 2; for (var k = 0; k < 3; k++) { var yy = y - 60 + k * 14 + Math.sin(t() * 20 + k) * 3; ctx.beginPath(); ctx.moveTo(x + 30, yy); ctx.quadraticCurveTo(x + 36, yy - 4, x + 42, yy); ctx.moveTo(x - 30, yy); ctx.quadraticCurveTo(x - 36, yy - 4, x - 42, yy); ctx.stroke(); } }
      if (c.coneT > 0) { coneRing(x, y - 52, 30, 26, 0.95); coneRim(x, y - 52, 30, 26); }
    }
    function coneFly(x, y, r) { ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(1.3, 1.3); item("cone"); ctx.restore(); }
    function parts(kind) {
      if (kind === "wheel") { rr(-9, -11, 18, 22, 2); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.fillStyle = "#C9D3D9"; ctx.fillRect(-6, -6, 12, 2); ctx.fillRect(-6, -1, 12, 2); ctx.fillRect(-6, 4, 8, 2); return true; }
      if (kind === "brush") { circ(-3, 0, 4, "#B07A0C"); circ(3, 1, 4, "#C98A3E"); circ(0, -4, 4, "#8A5A2B"); return true; }
      if (kind === "cap") { rr(-11, -6, 22, 12, 4); ctx.fillStyle = "#E05A8A"; ctx.fill(); return true; }
      if (kind === "lid") { ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(-6, 0, 6, 0, 7); ctx.moveTo(12, 0); ctx.arc(6, 0, 6, 0, 7); ctx.stroke(); return true; }
      if (kind === "bump") { ctx.strokeStyle = "#2E7D6B"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 14, 0.2, 2.4); ctx.stroke(); return true; }
      if (kind === "led") { circ(0, 0, 5, "rgba(255,138,208,.5)"); circ(0, 0, 2.5, "#FF8AD0"); return true; }
      return false;
    }
    // win screen: the vet slumps and hands over the treat jar, the nurse waves a white towel
    function celebBack() { nurse(318, VB, 0.86, 0); vetBody(180, { fraz: true, hit: true }); }
    function celebFront(tt) {
      arm(180 + 48, BENCH - 131, 246, BENCH - 96, 1); ctx.save(); ctx.translate(246, BENCH - 66); ctx.scale(0.9, 0.9); item("prizejar"); ctx.restore();
      ctx.save(); ctx.translate(332, 140); ctx.rotate(Math.sin(tt * 6) * 0.25); line([[0, 0], [-6, 46]], "#C9D2D8", 3); rr(-2, -14, 34, 24, 4); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.strokeStyle = "#D6DEE2"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
    }
    function thumb() { // the stage card picture
      back(); vetBody(205, {}); table(); arm(205 + 48, BENCH - 131, 286, BENCH - 120, 1); thermoProp(286, BENCH - 120, 1, 0, 50);
    }

    // ---------------- vet events: drawing ----------------
    function evBack(e) {
      if (e.m === "fridge") { // treat bribe: the nurse's hand with a tray of treats, a towel hidden behind
        var open = e.done ? 0 : Math.min(1, e.t / 0.3), x = 372 - open * 64, y = 214;
        ctx.save(); towel(x + 32, y + 10 - e.climb * 60, 46, 34, -0.2 - e.climb * 0.5); ctx.restore();
        ctx.fillStyle = "#7A3FB5"; ctx.fillRect(x + 18, y - 8, 80, 22);
        ell(x + 10, y, 14, 12, "#8BC4E8"); rr(x - 34, y - 16, 48, 8, 3); ctx.fillStyle = "#AEB8C0"; ctx.fill();
        [[-24, -20], [-14, -21], [-4, -20], [-19, -26], [-9, -27]].forEach(function (q, i) { circ(x + q[0], y + q[1], 4.2, ["#B07A0C", "#C98A3E", "#8A5A2B", "#E0A21E", "#B07A0C"][i]); });
        if (!e.done) txt("tap the hand!", x - 6, y - 36, "800 10px " + P, "#C2553A", "center", "#FFFFFF", 3);
      }
    }
    function evDraw(e, cat, a) {
      var live = !e.done;
      if (e.m === "cucumber" && live) { // weigh-in: the scales under the cat, a wobbly readout
        rr(118, BENCH - 8, 124, 8, 4); ctx.fillStyle = "#AEB8C0"; ctx.fill(); rr(150, BENCH + 30, 60, 26, 6); ctx.fillStyle = "#2B2340"; ctx.fill();
        var kg = (cat === "b" ? 6.8 : 4.9) + Math.sin(t() * 3) * 0.05; txt(kg.toFixed(1) + " kg", 180, BENCH + 48, "800 13px " + P, "#5BD08A");
        txt("HOLD STILL", 180, BENCH + 72, "900 11px " + P, "#2E6B3A");
      }
      if (e.m === "bath" && live) { // thermometer from behind: a gloved hand creeps down
        var p = Math.min(1, e.t / e.dur), hx = 180 + Math.sin(t() * 3) * 6, hy = -60 + p * (BENCH - 170 + 60);
        ctx.fillStyle = "#FFFFFF"; ctx.fillRect(hx + 8, -10, 26, hy + 8); ctx.fillStyle = "#D6DEE2"; ctx.fillRect(hx + 8, hy - 12, 26, 6);
        ell(hx + 20, hy + 6, 14, 12, "#8BC4E8"); thermoProp(hx + 10, hy + 18, -1, 0, 46);
        ctx.strokeStyle = "rgba(194,85,58,.6)"; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(180, BENCH - 120, 62, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      }
      if (e.m === "box") { // the cat carrier, door open: both cats want to hide in it
        ctx.save(); ctx.globalAlpha = a; var j = e.jig > 0 ? Math.sin(t() * 90) * 3 : 0;
        carrier(180 + j, BENCH + 2, true, null, 1.2);
        if (!e.done || !e.won) { ctx.save(); ctx.translate(258, BENCH + 2); ctx.scale(-0.26, 0.24); ctx.translate(-120, -246); spr("clover-body"); spr("clover-head"); catEyes("c", "wide", true); ctx.restore(); }
        if (!e.done) { rr(110, 186, 140, 10, 5); ctx.fillStyle = "rgba(43,35,64,.2)"; ctx.fill(); rr(110, 186, Math.max(0.1, 140 * e.taps / e.need), 10, 5); ctx.fillStyle = "#E0A21E"; ctx.fill(); }
        ctx.restore();
      }
      if (e.m === "shaker") { // "just a little scratch": a speech bubble from off screen. Nothing is ever shown landing.
        ctx.save(); ctx.globalAlpha = a; var go = e.t >= e.rattle && !e.fake && !e.done;
        var msg = e.done ? "" : go ? "…1!" : e.t >= e.rattle ? "2 and a half…" : e.t < e.rattle * 0.5 ? "Just a little scratch… 3…" : "…2…";
        if (msg) { ctx.font = "italic 800 13px " + P; var tw = ctx.measureText(msg).width + 26; rr(W - tw - 62, 196, tw, 32, 12); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = "#FFFFFF"; ctx.beginPath(); ctx.moveTo(W - 84, 227); ctx.lineTo(W - 50, 246); ctx.lineTo(W - 100, 227); ctx.fill(); txt(msg, W - tw / 2 - 62, 217, "italic 800 13px " + P, go ? "#C2553A" : "#2B2340"); }
        ell(W + 4, 252, 22, 20, "#8BC4E8"); ctx.save(); ctx.translate(W - 14, 258); ctx.rotate(-0.3); ctx.scale(1.3, 1.3); item("clipboard"); ctx.restore();
        if (go) txt("BOLT!", 180, 182, "900 30px " + P, "#B5308A", "center", "#FFFFFF", 7);
        ctx.restore();
      }
      if (e.m === "clipper" && live) { // electric clippers buzzing along the table
        var cx = e.x, by = BENCH - 4;
        ctx.save(); ctx.translate(cx, by); ctx.scale(e.dir, 1); ctx.translate(Math.sin(t() * 90) * 1.2, 0);
        rr(-30, -20, 46, 20, 9); ctx.fillStyle = "#7A3FB5"; ctx.fill(); rr(-26, -16, 20, 5, 2.5); ctx.fillStyle = "#9B6BD0"; ctx.fill();
        rr(14, -22, 10, 22, 3); ctx.fillStyle = "#AEB8C0"; ctx.fill(); ctx.fillStyle = "#6B7180"; for (var q = 0; q < 5; q++) ctx.fillRect(22, -21 + q * 4.2, 5, 2.4);
        ctx.strokeStyle = "#2B2340"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-30, -10); ctx.quadraticCurveTo(-48, -6, -60, -14); ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = "rgba(122,63,181,.6)"; ctx.lineWidth = 2; for (var z = 0; z < 3; z++) { ctx.beginPath(); ctx.moveTo(cx + e.dir * 30, by - 30 - z * 7); ctx.lineTo(cx + e.dir * 40, by - 34 - z * 7); ctx.stroke(); }
        txt("BZZZZ", cx, by - 42, "italic 900 12px " + P, "#7A3FB5", "center", "#FFFFFF", 3);
      }
      if (e.m === "cone" && live) { // the cone on the cat's head, and the view narrows to the middle
        var hx2 = 180, hy2 = 222;
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.ellipse(180, 236, 92, 150, 0, 0, 7); ctx.fillStyle = "rgba(20,24,40,.6)"; ctx.fill("evenodd"); ctx.restore();
        ctx.strokeStyle = "rgba(205,232,245,.6)"; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.ellipse(180, 236, 92, 150, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        ctx.save(); ctx.translate(hx2 + (e.jig > 0 ? Math.sin(t() * 80) * 4 : 0), hy2); coneRing(0, 0, 82, 74, 0.32); coneRim(0, 0, 82, 74); ctx.restore();
        txt("TAP THE CONE " + e.taps + "/3", 180, 140, "900 12px " + P, "#2B5E80", "center", "#FFFFFF", 4);
      }
    }
    // the x-ray: a slow fade into a negative (never a strobe). Reduced motion: a soft blue tint instead.
    function xray(k, quiet) {
      if (k <= 0) return;
      if (quiet) { ctx.fillStyle = "rgba(60,130,210," + (0.3 * k) + ")"; ctx.fillRect(0, 0, W, H); return; }
      ctx.save(); ctx.globalCompositeOperation = "difference"; ctx.fillStyle = "rgba(255,255,255," + k + ")"; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = "rgba(159,216,240," + k + ")"; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    function xrayReveal(x, kind, k) {
      ctx.save(); ctx.globalAlpha = Math.min(1, k * 1.5);
      if (kind === "pillcheese") { ctx.save(); ctx.shadowColor = "#FF8AD0"; ctx.shadowBlur = 14; ctx.translate(x + 2, BENCH - 15); ctx.rotate(-0.4); rr(-7, -4, 14, 8, 4); ctx.fillStyle = "#FF8AD0"; ctx.fill(); ctx.restore(); }
      ctx.strokeStyle = "#FF8AD0"; ctx.lineWidth = 2.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(x, BENCH - 14, 22, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      txt(kind === "pillcheese" ? "PILL!" : "NOPE", x, BENCH - 44, "900 13px " + P, "#FF8AD0", "center", "#1B1430", 4);
      ctx.restore();
    }
    function bannerFor(e, catName, taps) {
      return {
        cucumber: ["WEIGH-IN! STAY STILL", "Don’t tap anything for 2 s or the scales go haywire", 1 - e.t / e.dur, "#2E6B3A"],
        fridge: ["TREAT BRIBE! FEAST TIME", "Eat fast, then tap the nurse’s hand before the towel comes out", 1 - e.climb, "#2B5E80"],
        cone: ["CONE OF SHAME!", catName + " can only see the middle. Tap the cone 3× to shake it off", 1 - e.t / e.dur, "#2B5E80"],
        xray: ["X-RAY FLASH!", "The room flips. Look closely: bad food shows its secret pill", 1 - e.t / e.dur, "#26305E"],
        bath: ["THERMOMETER!", "Tap " + catName + " (or ↑ / W) to spin round and sit on that tail", 1 - e.t / e.dur, "#2F5DA8"],
        box: ["CARRIER OPEN! BOTH CATS WANT IN", "Tap fast to claim the hiding spot: " + taps, 1 - e.t / e.dur, "#8A5A00"],
        clipper: ["CLIPPER BUZZ!", "Tap " + catName + " (or ↑ / W) just as the clippers arrive to jump them", 1 - e.t / e.dur, "#7A3FB5"],
        shaker: e.t < e.rattle ? ["“JUST A LITTLE SCRATCH…”", "Freeze. Wait for BOLT. Flinch early and you’re vaccinated", null, "#7A3FB5"] : e.fake ? ["…", "Fake-out. Don’t move", null, "#7A3FB5"] : ["BOLT! TAP!", "First tap escapes under the table: double points", 1 - (e.t - e.rattle) / e.win, "#B5308A"]
      }[e.m];
    }
    function stripe() { // a shaved racing stripe (sprite coordinates)
      ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = "#F4D6D0"; rr(108, 132, 24, 104, 12); ctx.fill(); ctx.strokeStyle = "rgba(190,150,140,.6)"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
    }
    function celebText(tt, q) {
      var k = Math.min(1, tt / 0.45), sc = q ? 1 : 0.5 + 0.5 * k + Math.sin(Math.min(1, tt / 0.6) * Math.PI) * 0.12;
      ctx.save(); ctx.translate(180, BENCH + 50); ctx.scale(sc, sc);
      txt("CLEAN BILL OF HEALTH", 0, 0, "900 27px " + P, "#FFE08A", "center", "#2B2340", 7);
      if (tt > 0.5) txt("CHECK-UP LEGEND", 0, 28, "900 18px " + P, "#FF8AD0", "center", "#2B2340", 6);
      if (tt > 1) txt("All 10 vet rounds · +15,000", 0, 50, "800 12px " + P, "#FFFFFF", "center", "#2B2340", 4);
      ctx.restore();
      if (tt > 0.8) { rr(34, 114, 128, 30, 12); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.beginPath(); ctx.moveTo(140, 142); ctx.lineTo(156, 154); ctx.lineTo(128, 143); ctx.fill(); txt("“Fine. Take the jar.", 98, 127, "italic 800 9px " + P, "#2B2340"); txt("Both perfectly healthy.”", 98, 138, "italic 800 9px " + P, "#2B2340"); }
    }

    // small pictures for the "How it works" guide, drawn in a 64 x 64 box
    function icon(kind) {
      ctx.save();
      if (kind === "cockatoo") cockatoo(30, 36, true, 0.55);
      else if (kind === "ginger") ginger(32, 32, 0.27);
      else if (kind === "fleas") { ctx.translate(32, 34); ctx.scale(1.3, 1.3); fleas(9); }
      else if (kind === "blowfly") { ctx.translate(32, 34); ctx.scale(1.6, 1.6); flyer("moth", 1); }
      else if (kind === "mozzie") { ctx.translate(32, 32); ctx.scale(1.5, 1.5); flyer("wasp", 1); }
      else if (kind === "pentorch") { circ(32, 32, 16, "rgba(255,214,90,.35)"); circ(32, 32, 7.5, "#FFE69A"); circ(32, 32, 3.8, "#FFFFFF"); ctx.strokeStyle = "#E0A21E"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(32, 32, 8, 0, 7); ctx.stroke(); }
      else if (kind === "bubble") { ctx.translate(32, 32); ctx.scale(1.3, 1.3); bubble(30); }
      else if (kind === "vet") { ctx.translate(32, 64); ctx.scale(0.3, 0.3); ctx.translate(-180, -VB); vetBody(180, {}); }
      else if (kind === "nurse") nurse(32, 64, 0.32, 0);
      ctx.restore();
    }
    return {
      icon: w(icon), ginger: w(ginger), vetBody: w(vetBody), carrier: w(carrier), towel: w(towel),
      TEXT: TEXT, has: has, spotXY: spotXY, vetX: vetX,
      back: w(back), table: w(table), heatPad: w(heatPad), sulk: w(sulk), item: w(item), flyer: w(flyer), fleas: w(fleas), bubble: w(bubble),
      bossBack: w(bossBack), bossFront: w(bossFront), bossCatExtras: w(bossCatExtras), coneFly: w(coneFly), parts: w(parts),
      celebBack: w(celebBack), celebFront: w(celebFront), celebText: w(celebText), thumb: w(thumb),
      evBack: w(evBack), evDraw: w(evDraw), xray: w(xray), xrayReveal: w(xrayReveal), bannerFor: bannerFor, stripe: w(stripe), coneOn: w(function (x, y) { coneRing(x, y, 82, 74, 0.5); coneRim(x, y, 82, 74); })
    };
  };
})();
