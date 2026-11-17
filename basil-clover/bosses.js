/* Basil + Clover: boss bodies for stages 3-10 (Nov 2026). Each boss keeps the Vet's attacks, only the look changes.
   body(c, o) draws in the Vet module's scaled body space: base at y 0, head centre about (0, -186).
   o: { fz: angry, hit: hit or knocked out, t: time }. arm(c, sx, sy, hx, hy, side, t) draws a limb in screen space. */
(function () {
  "use strict";
  function E(c, x, y, rx, ry, col, rot) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, 7); c.fill(); }
  function C(c, x, y, r, col) { E(c, x, y, r, r, col); }
  function L(c, pts, col, lw) { c.strokeStyle = col; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); pts.forEach(function (p, i) { if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }); c.stroke(); }
  function out(c, col, lw) { c.strokeStyle = col; c.lineWidth = lw || 2; c.stroke(); }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  // eyes: white, pupil, glint; angry brows when fz (or always when mean); X eyes when hit
  function eyes(c, o, xs, y, r, pr, op) {
    op = op || {};
    xs.forEach(function (x, i) {
      var s = i ? 1 : -1;
      if (o.hit) { var k = r * 0.65; L(c, [[x - k, y - k], [x + k, y + k]], op.x || "#2B2340", 3); L(c, [[x + k, y - k], [x - k, y + k]], op.x || "#2B2340", 3); return; }
      if (!op.noWhite) C(c, x, y, r, "#FFFFFF");
      C(c, x + (o.fz ? 0 : 1), y + 1, o.fz ? pr * 0.8 : pr, op.pupil || "#1B1430"); C(c, x + pr * 0.35, y - pr * 0.35, pr * 0.32, "#FFFFFF");
      if (o.fz || op.mean) L(c, [[x + s * r * 1.15, y - r * (o.fz ? 1.75 : 1.5)], [x - s * r * 0.9, y - r * 0.95]], op.brow || "#2B2340", 3.2);
    });
  }
  function limb(c, sx, sy, hx, hy, side, col, edge, w) {
    c.lineCap = "round"; c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(sx + side * 18, (sy + hy) / 2 + 18, hx, hy);
    c.strokeStyle = edge; c.lineWidth = w + 4; c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.stroke();
  }
  function cheeks(c, xs, y, col) { xs.forEach(function (x) { E(c, x, y, 7, 4.5, col || "rgba(240,120,140,.45)"); }); }

  var A = {};

  // 3 FARM: Gertrude the Goose. Always a bit cross. Honks when angry.
  A.goose = {
    body: function (c, o) {
      var W = "#FFFFFF", ed = "#D6DEE2";
      E(c, 0, -62, 64, 66, W); c.beginPath(); c.ellipse(0, -62, 64, 66, 0, 0, 7); out(c, ed);
      [-1, 1].forEach(function (s) { c.strokeStyle = "#C9D2D8"; c.lineWidth = 2; [0, 12, 24].forEach(function (k) { c.beginPath(); c.arc(s * 30, -70 + k, 26 - k / 3, s < 0 ? 0.3 : Math.PI - 1.3, s < 0 ? 1.3 : Math.PI - 0.3); c.stroke(); }); });
      rr(c, -19, -196, 38, 96, 19); c.fillStyle = W; c.fill(); out(c, ed);
      E(c, 0, -190, 36, 31, W); c.beginPath(); c.ellipse(0, -190, 36, 31, 0, 0, 7); out(c, ed);
      // red ribbon
      c.fillStyle = "#C2253A"; c.fillRect(-20, -134, 40, 8); c.beginPath(); c.moveTo(0, -130); c.lineTo(-16, -142); c.lineTo(-16, -118); c.closePath(); c.fill(); c.beginPath(); c.moveTo(0, -130); c.lineTo(16, -142); c.lineTo(16, -118); c.closePath(); c.fill(); C(c, 0, -130, 4, "#8A1A2A");
      eyes(c, o, [-14, 14], -200, 7.5, 4.2, { mean: true });
      // beak (opens when angry or hit)
      var open = o.fz || o.hit;
      if (open) { E(c, 0, -170, 16, 9, "#7A2030"); E(c, 0, -178, 24, 8, "#F28C28"); E(c, 0, -162, 19, 6, "#E07A1A"); }
      else { E(c, 0, -174, 24, 11, "#F28C28"); L(c, [[-18, -173], [18, -173]], "#C2621A", 1.6); }
      C(c, 0, -186, 4, "#2B2340");
      if (o.fz && Math.sin(o.t * 4) > 0.3) { c.font = "900 15px Poppins, sans-serif"; c.textAlign = "center"; c.lineWidth = 4; c.strokeStyle = "#FFFFFF"; c.strokeText("HONK!", 52, -226); c.fillStyle = "#C2553A"; c.fillText("HONK!", 52, -226); }
    },
    arm: function (c, sx, sy, hx, hy, side) {
      limb(c, sx, sy, hx, hy, side, "#FFFFFF", "#D6DEE2", 19);
      [-0.5, 0, 0.5].forEach(function (a) { c.save(); c.translate(hx, hy); c.rotate(a - side * 0.3); E(c, side * 8, -6, 6, 13, "#FFFFFF"); c.beginPath(); c.ellipse(side * 8, -6, 6, 13, 0, 0, 7); out(c, "#C9D2D8", 1.4); c.restore(); });
    }
  };

  // 4 BEACH: Captain Pinch, a giant crab with eyes on stalks.
  A.crab = {
    body: function (c, o) {
      var R = o.fz ? "#D62E22" : "#E0533A", D = "#B83A26";
      [-1, 1].forEach(function (s) { [0, 1, 2].forEach(function (k) { L(c, [[s * 56, -40 + k * 12], [s * 84, -24 + k * 12], [s * 92, k * 10]], D, 7); }); });
      E(c, 0, -80, 76, 62, R); c.beginPath(); c.ellipse(0, -80, 76, 62, 0, 0, 7); out(c, D, 2.5);
      E(c, -22, -110, 30, 13, "rgba(255,255,255,.22)", -0.2);
      [[-40, -70], [34, -96], [46, -60], [-30, -40], [10, -124]].forEach(function (p) { C(c, p[0], p[1], 4, D); });
      // stalks and eyes
      [-1, 1].forEach(function (s) { L(c, [[s * 16, -132], [s * 20, -160], [s * 22, -176]], D, 8); L(c, [[s * 16, -132], [s * 20, -160], [s * 22, -176]], R, 5); });
      eyes(c, o, [-22, 22], -190, 13, 6);
      // mouth
      if (o.fz || o.hit) E(c, 0, -76, 14, 9, "#5A1F2B"); else { c.strokeStyle = "#5A1F2B"; c.lineWidth = 3; c.beginPath(); c.arc(0, -86, 16, 0.3, Math.PI - 0.3); c.stroke(); }
      cheeks(c, [-34, 34], -84);
      // whistle on a cord
      L(c, [[-30, -128], [0, -100], [30, -128]], "#F2C230", 2); rr(c, -7, -104, 14, 9, 3); c.fillStyle = "#F2C230"; c.fill();
    },
    arm: function (c, sx, sy, hx, hy, side, tt) {
      limb(c, sx, sy, hx, hy, side, "#E0533A", "#B83A26", 15);
      var snap = 0.25 + 0.2 * Math.abs(Math.sin((tt || 0) * 5));
      c.save(); c.translate(hx, hy); c.scale(side, 1);
      E(c, 6, 2, 16, 12, "#E0533A"); c.beginPath(); c.ellipse(6, 2, 16, 12, 0, 0, 7); out(c, "#B83A26", 2);
      c.save(); c.rotate(-snap); c.beginPath(); c.moveTo(14, -4); c.quadraticCurveTo(34, -14, 36, 0); c.quadraticCurveTo(26, -4, 16, 2); c.closePath(); c.fillStyle = "#E0533A"; c.fill(); out(c, "#B83A26", 2); c.restore();
      c.beginPath(); c.moveTo(16, 6); c.quadraticCurveTo(34, 14, 34, 2); c.quadraticCurveTo(26, 6, 16, 2); c.closePath(); c.fillStyle = "#E0533A"; c.fill(); out(c, "#B83A26", 2);
      c.restore();
    }
  };

  // 5 WARD: IV-9000, a drip-stand robot with a heart-monitor face.
  A.robot = {
    body: function (c, o) {
      L(c, [[0, -150], [0, -250]], "#8E99A3", 6); L(c, [[-22, -250], [22, -250]], "#8E99A3", 4);
      rr(c, -13, -262, 26, 34, 8); c.fillStyle = "rgba(200,230,245,.9)"; c.fill(); out(c, "#8BB8D0", 1.6); c.fillStyle = "#8BC4E8"; c.fillRect(-11, -246, 22, 14);
      c.strokeStyle = "#8BB8D0"; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -228); c.bezierCurveTo(30, -220, 56, -200, 50, -170); c.stroke();
      rr(c, -56, -132, 112, 132, 14); c.fillStyle = "#E3E9EC"; c.fill(); out(c, "#AEB8C0", 2.5);
      rr(c, -40, -116, 80, 40, 6); c.fillStyle = "#CDD5DA"; c.fill();
      [-24, -8, 8, 24].forEach(function (x, i) { C(c, x, -96, 5, ["#E03A3A", "#F2C230", "#5BD08A", "#5AA9DC"][i]); });
      c.fillStyle = "#E03A3A"; c.fillRect(-5, -64, 10, 26); c.fillRect(-13, -56, 26, 10);
      rr(c, -10, -150, 20, 20, 3); c.fillStyle = "#AEB8C0"; c.fill();
      rr(c, -48, -228, 96, 78, 12); c.fillStyle = "#3A4256"; c.fill();
      rr(c, -40, -220, 80, 62, 7); c.fillStyle = "#0E2A22"; c.fill();
      var g = o.fz ? "#FF5A4A" : "#5BD08A";
      if (o.hit) { eyes(c, o, [-16, 16], -200, 9, 4, { x: g }); }
      else { C(c, -16, -200, 7, g); C(c, 16, -200, 7, g); if (o.fz) { L(c, [[-26, -214], [-8, -208]], g, 3); L(c, [[26, -214], [8, -208]], g, 3); } }
      var sp = o.fz ? 9 : 5, ph = (o.t || 0) * (o.fz ? 9 : 4);
      c.strokeStyle = g; c.lineWidth = 2.2; c.beginPath();
      for (var x = -34; x <= 34; x += 2) { var u = ((x + 34 + ph * 20) % 34) / 34, yy = u > 0.42 && u < 0.5 ? -sp * 1.8 : u > 0.5 && u < 0.56 ? sp : 0; if (x === -34) c.moveTo(x, -172 + yy); else c.lineTo(x, -172 + yy); }
      c.stroke();
      C(c, 0, -234, 5, Math.sin((o.t || 0) * 6) > 0 ? (o.fz ? "#FF5A4A" : "#5BD08A") : "#3A4256");
    },
    arm: function (c, sx, sy, hx, hy, side) {
      limb(c, sx, sy, hx, hy, side, "#C9D2D8", "#8E99A3", 12);
      C(c, (sx + hx) / 2 + side * 9, (sy + hy) / 2 + 9, 6, "#8E99A3");
      c.save(); c.translate(hx, hy); c.scale(side, 1); C(c, 0, 0, 8, "#8E99A3");
      L(c, [[4, -4], [16, -12], [22, -6]], "#8E99A3", 4); L(c, [[4, 4], [16, 12], [22, 6]], "#8E99A3", 4); c.restore();
    }
  };

  // 6 HELL: Blaze, a living fireball. Bigger and redder when angry.
  function flame(c, x, y, w, h, col, lean) { c.fillStyle = col; c.beginPath(); c.moveTo(x - w, y); c.quadraticCurveTo(x - w * 1.1, y - h * 0.55, x + (lean || 0), y - h); c.quadraticCurveTo(x + w * 1.1, y - h * 0.55, x + w, y); c.quadraticCurveTo(x, y + w * 0.6, x - w, y); c.fill(); }
  A.fire = {
    body: function (c, o) {
      var tt = o.t || 0, big = o.fz ? 1.25 : 1, cols = o.fz ? ["#C2201A", "#F25A1A", "#F2C230"] : ["#E0501A", "#F28C28", "#F7D23A"];
      [[-40, 0.9], [-20, 1.15], [0, 1.3], [20, 1.1], [40, 0.85]].forEach(function (f, i) { var fl = Math.sin(tt * 11 + i * 1.7) * 8; flame(c, f[0], -200, 18, (70 + fl) * f[1] * big, cols[0], Math.sin(tt * 7 + i) * 6); });
      flame(c, 0, 0, 54, 170, cols[0], Math.sin(tt * 5) * 6); flame(c, 0, 0, 40, 130, cols[1], Math.sin(tt * 6) * 5);
      C(c, 0, -186, 50 * (o.fz ? 1.06 : 1), cols[0]); C(c, 0, -184, 42, cols[1]); E(c, 0, -176, 30, 26, cols[2]);
      [-16, 0, 16].forEach(function (x, i) { var fl = Math.sin(tt * 13 + i * 2) * 6; flame(c, x, -214, 10, (36 + fl) * big, cols[1]); });
      eyes(c, o, [-15, 15], -192, 9, 4.5, { brow: "#7A1A10" });
      if (o.fz || o.hit) E(c, 0, -164, 11, 8, "#7A1A10"); else { c.strokeStyle = "#7A1A10"; c.lineWidth = 3; c.beginPath(); c.arc(0, -176, 13, 0.35, Math.PI - 0.35); c.stroke(); }
      for (var k = 0; k < 5; k++) { var ph = (tt * 0.8 + k * 0.21) % 1; C(c, Math.sin(k * 9 + tt) * 50, -150 - ph * 140, 3 * (1 - ph), cols[2]); }
    },
    arm: function (c, sx, sy, hx, hy, side, tt) {
      limb(c, sx, sy, hx, hy, side, "#F28C28", "#E0501A", 16);
      c.save(); c.translate(hx, hy); C(c, 0, 0, 11, "#F28C28"); C(c, 0, 1, 6, "#F7D23A");
      flame(c, side * 2, -6, 7, 22 + Math.sin((tt || 0) * 14) * 4, "#F28C28"); c.restore();
    }
  };

  // 7 BATH TIME: Admiral Quackers, a giant rubber duck in an admiral's hat.
  A.duck = {
    body: function (c, o) {
      var Y = "#F7D23A", D = "#E0B020";
      E(c, 0, -58, 74, 58, Y); c.beginPath(); c.ellipse(0, -58, 74, 58, 0, 0, 7); out(c, D, 2.5);
      E(c, -26, -80, 30, 14, "rgba(255,255,255,.35)", -0.3);
      C(c, 0, -182, 44, Y); c.beginPath(); c.arc(0, -182, 44, 0, 7); out(c, D, 2.5);
      E(c, -16, -206, 14, 7, "rgba(255,255,255,.4)", -0.4);
      eyes(c, o, [-16, 16], -192, 8.5, 5);
      cheeks(c, [-30, 30], -174);
      if (o.fz || o.hit) { E(c, 0, -160, 18, 8, "#7A2030"); E(c, 0, -168, 30, 9, "#F28C28"); E(c, 0, -152, 22, 6, "#E07A1A"); }
      else { E(c, 0, -164, 30, 12, "#F28C28"); L(c, [[-24, -163], [24, -163]], "#C2621A", 1.8); }
      // admiral's bicorne
      c.save(); c.translate(0, -222); if (o.fz) c.rotate(-0.18);
      c.fillStyle = "#22304F"; c.beginPath(); c.moveTo(-58, 6); c.quadraticCurveTo(0, -46, 58, 6); c.quadraticCurveTo(0, -6, -58, 6); c.fill();
      c.strokeStyle = "#E8B53A"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-54, 4); c.quadraticCurveTo(0, -8, 54, 4); c.stroke();
      C(c, 0, -12, 8, "#E8B53A"); L(c, [[0, -18], [0, -6]], "#22304F", 2); L(c, [[-4, -10], [4, -10]], "#22304F", 2);
      c.restore();
    },
    arm: function (c, sx, sy, hx, hy, side) {
      limb(c, sx, sy, hx, hy, side, "#F7D23A", "#E0B020", 20);
      E(c, hx + side * 4, hy, 12, 10, "#F7D23A"); c.beginPath(); c.ellipse(hx + side * 4, hy, 12, 10, 0, 0, 7); out(c, "#E0B020", 1.8);
    }
  };

  // 8 CHRISTMAS: The Snow Queen, a snowman with an icicle crown.
  A.snow = {
    body: function (c, o) {
      var Wh = "#FFFFFF", ed = "#C8D8E8";
      [[0, -50, 62], [0, -122, 44], [0, -186, 38]].forEach(function (b) { C(c, b[0], b[1], b[2], Wh); c.beginPath(); c.arc(b[0], b[1], b[2], 0, 7); out(c, ed, 2.5); E(c, b[0] - b[2] * 0.35, b[1] - b[2] * 0.4, b[2] * 0.35, b[2] * 0.18, "rgba(200,225,245,.5)", -0.4); });
      [-132, -112, -92].forEach(function (y) { C(c, 0, y, 4.5, "#2B2340"); });
      // scarf
      rr(c, -40, -160, 80, 15, 7); c.fillStyle = "#C2253A"; c.fill(); rr(c, 14, -154, 15, 44, 6); c.fill();
      c.fillStyle = "#2E7D52"; [-26, -6, 14].forEach(function (x) { c.fillRect(x, -160, 6, 15); }); c.fillRect(14, -128, 15, 5);
      eyes(c, o, [-13, 13], -194, 0, 5, { noWhite: true });
      cheeks(c, [-24, 24], -178);
      c.fillStyle = "#F28C28"; c.beginPath(); c.moveTo(-2, -188); c.lineTo(28 + (o.fz ? 4 : 0), -180); c.lineTo(-2, -178); c.closePath(); c.fill();
      if (o.fz || o.hit) C(c, 0, -166, 6, "#2B2340"); else [-14, -7, 0, 7, 14].forEach(function (x) { C(c, x, -168 + Math.abs(x) * -0.25 + 3, 2.6, "#2B2340"); });
      // icicle crown
      c.fillStyle = "#8BC4E8"; c.beginPath(); c.moveTo(-28, -216);
      [[-22, -246], [-14, -222], [-6, -256], [0, -224], [8, -256], [14, -222], [22, -246], [28, -216]].forEach(function (p) { c.lineTo(p[0], p[1] - (o.fz ? 4 : 0)); }); c.closePath(); c.fill(); out(c, "#5F95AE", 1.6);
      C(c, 1, -232, 3, "#FFFFFF");
    },
    arm: function (c, sx, sy, hx, hy, side) {
      c.lineCap = "round"; c.strokeStyle = "#6B4A2B"; c.lineWidth = 5; c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(sx + side * 18, (sy + hy) / 2 + 12, hx, hy); c.stroke();
      [[-0.9, 12], [-0.2, 14], [0.5, 11]].forEach(function (f) { var a = (side < 0 ? Math.PI : 0) + f[0] * side - side * 0.4; L(c, [[hx, hy], [hx + Math.cos(a) * f[1], hy + Math.sin(a) * f[1] - 4]], "#6B4A2B", 3.4); });
    }
  };

  // 9 EASTER: Mega Bunny, a giant fluffy rabbit with enormous teeth.
  A.bunny = {
    body: function (c, o) {
      var F = "#CBB8A6", B = "#F4EBDD", ed = "#A8927E", P = "#F2A6B8";
      E(c, 0, -64, 66, 68, F); c.beginPath(); c.ellipse(0, -64, 66, 68, 0, 0, 7); out(c, ed, 2);
      E(c, 0, -56, 44, 52, B);
      [-1, 1].forEach(function (s) { var flop = o.hit && s > 0, tilt = s * (o.fz ? 0.06 : 0.18); c.save(); c.translate(s * 18, -212); c.rotate(flop ? s * 1.4 : tilt); E(c, 0, -34, 13, 40, F); c.beginPath(); c.ellipse(0, -34, 13, 40, 0, 0, 7); out(c, ed, 2); E(c, 0, -32, 6.5, 30, P); c.restore(); });
      E(c, 0, -182, 44, 40, F); c.beginPath(); c.ellipse(0, -182, 44, 40, 0, 0, 7); out(c, ed, 2);
      E(c, -14, -166, 16, 12, B); E(c, 14, -166, 16, 12, B);
      eyes(c, o, [-17, 17], -192, 9, 6);
      c.fillStyle = "#E07A8A"; c.beginPath(); c.moveTo(-6, -178); c.lineTo(6, -178); c.lineTo(0, -171); c.closePath(); c.fill();
      c.strokeStyle = "#7A5A4A"; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -171); c.quadraticCurveTo(-5, -164, -10, -167); c.moveTo(0, -171); c.quadraticCurveTo(5, -164, 10, -167); c.stroke();
      rr(c, -8, -166, 16, o.fz ? 18 : 14, 3); c.fillStyle = "#FFFFFF"; c.fill(); out(c, "#C9BFB0", 1.4); L(c, [[0, -165], [0, -152 + (o.fz ? 4 : 0)]], "#C9BFB0", 1.2);
      c.strokeStyle = "rgba(90,70,60,.55)"; c.lineWidth = 1.3; [-1, 1].forEach(function (s) { [-4, 2].forEach(function (d) { c.beginPath(); c.moveTo(s * 22, -170 + d); c.lineTo(s * 46, -174 + d * 2); c.stroke(); }); });
      cheeks(c, [-30, 30], -176);
    },
    arm: function (c, sx, sy, hx, hy, side) {
      limb(c, sx, sy, hx, hy, side, "#CBB8A6", "#A8927E", 20);
      E(c, hx, hy, 11, 10, "#F4EBDD"); [-5, 0, 5].forEach(function (f) { C(c, hx + f + side * 3, hy - 8, 3.4, "#F4EBDD"); }); E(c, hx, hy + 1, 4, 3, "#F2A6B8");
    }
  };

  // 10 HALLOWEEN: Boo, a friendly sheet ghost with a pink bow. Bobs about.
  A.ghost = {
    body: function (c, o) {
      var Wh = "#F7F4FF", ed = "#C9BFE0", tt = o.t || 0, bob = Math.sin(tt * 2.4) * 4;
      c.save(); c.translate(0, bob);
      c.beginPath(); c.moveTo(-62, 0); c.lineTo(-56, -170); c.quadraticCurveTo(-54, -236, 0, -236); c.quadraticCurveTo(54, -236, 56, -170); c.lineTo(62, 0);
      for (var x = 62; x > -62; x -= 20.6) c.quadraticCurveTo(x - 10, 14 + Math.sin(tt * 4 + x) * 4, x - 20.6, 0);
      c.closePath(); c.fillStyle = Wh; c.fill(); out(c, ed, 2.5);
      E(c, -22, -212, 18, 9, "rgba(255,255,255,.9)", -0.4);
      if (o.hit) eyes(c, o, [-17, 17], -192, 9, 5);
      else [-17, 17].forEach(function (x, i) { E(c, x, -192, 8, o.fz ? 9 : 12, "#2B2340"); C(c, x + 2, -197, 2.6, "#FFFFFF"); if (o.fz) L(c, [[x + (i ? 1 : -1) * 11, -210], [x - (i ? 1 : -1) * 8, -202]], "#2B2340", 3); });
      cheeks(c, [-30, 30], -174);
      if (o.fz) E(c, 0, -164, 11, 12, "#2B2340"); else E(c, 0, -166, 6, 7, "#2B2340");
      c.fillStyle = "#F28CB8"; c.save(); c.translate(26, -228); c.rotate(0.3); c.beginPath(); c.moveTo(0, 0); c.lineTo(-12, -8); c.lineTo(-12, 8); c.closePath(); c.moveTo(0, 0); c.lineTo(12, -8); c.lineTo(12, 8); c.closePath(); c.fill(); C(c, 0, 0, 3.5, "#E05A8A"); c.restore();
      if (o.fz && Math.sin(tt * 4) > 0.3) { c.font = "900 15px Poppins, sans-serif"; c.textAlign = "center"; c.lineWidth = 4; c.strokeStyle = "#2B2340"; c.strokeText("BOO!", 56, -238); c.fillStyle = "#F7F4FF"; c.fillText("BOO!", 56, -238); }
      c.restore();
    },
    arm: function (c, sx, sy, hx, hy, side) {
      limb(c, sx, sy, hx, hy, side, "#F7F4FF", "#C9BFE0", 20);
      E(c, hx, hy, 11, 9, "#F7F4FF"); c.beginPath(); c.ellipse(hx, hy, 11, 9, 0, 0, 7); out(c, "#C9BFE0", 1.6);
    }
  };

  window.MW_BOSSART = A;
})();
