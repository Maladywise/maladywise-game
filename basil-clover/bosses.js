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
      var W = o.baby ? "#F7E08A" : "#FFFFFF", ed = o.baby ? "#D9B84A" : "#C9D2D8", gr = o.baby ? "#EFD27A" : "#E6EAEE";
      // body, side on, tail up at the back
      c.beginPath(); c.moveTo(-80, -100); c.quadraticCurveTo(-90, -40, -46, -10); c.quadraticCurveTo(4, 8, 48, -20); c.quadraticCurveTo(76, -50, 62, -86); c.quadraticCurveTo(40, -128, -10, -124); c.quadraticCurveTo(-50, -122, -80, -100); c.closePath(); c.fillStyle = W; c.fill(); out(c, ed, 2.5);
      // folded wing with layered feathers
      c.beginPath(); c.moveTo(-74, -96); c.quadraticCurveTo(-40, -112, 20, -96); c.quadraticCurveTo(34, -66, 8, -44); c.quadraticCurveTo(-40, -38, -74, -96); c.fillStyle = gr; c.fill(); out(c, ed, 1.6);
      c.strokeStyle = "#C9D2D8"; c.lineWidth = 1.5; [[-56, -84], [-36, -86], [-16, -84], [2, -78], [-44, -64], [-22, -62], [-2, -58]].forEach(function (q) { c.beginPath(); c.arc(q[0], q[1], 12, 0.2, Math.PI - 0.2); c.stroke(); });
      c.fillStyle = "#D6DCE2"; [[-82, -102], [-76, -94], [-70, -88]].forEach(function (q, i) { c.beginPath(); c.ellipse(q[0], q[1], 14, 5, -0.5 + i * 0.12, 0, 7); c.fill(); });
      // neck: a long S rising from the breast
      var dip = o.fz ? 10 : 0;
      c.beginPath(); c.moveTo(8, -118); c.bezierCurveTo(-4, -142, -22, -160, -16, -186 + dip); c.lineTo(20, -180 + dip); c.bezierCurveTo(22, -150, 46, -130, 60, -90); c.closePath(); c.fillStyle = W; c.fill();
      c.strokeStyle = ed; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-16, -186 + dip); c.bezierCurveTo(-22, -160, -4, -142, 6, -120); c.moveTo(20, -180 + dip); c.bezierCurveTo(22, -150, 46, -130, 60, -90); c.stroke();
      c.strokeStyle = "rgba(170,184,196,.6)"; c.lineWidth = 1.2; [[2, -150], [10, -136], [18, -122]].forEach(function (q) { c.beginPath(); c.moveTo(q[0], q[1]); c.lineTo(q[0] + 8, q[1] + 2); c.stroke(); });
      // head, side on
      c.save(); c.translate(2, -192 + dip); if (o.fz) c.rotate(0.12);
      E(c, 0, 0, 27, 21, W); c.beginPath(); c.ellipse(0, 0, 27, 21, 0, Math.PI * 0.95, Math.PI * 2.2); out(c, ed, 2.2);
      var open = o.fz || o.hit;
      if (open) { c.fillStyle = "#E58A9A"; c.beginPath(); c.moveTo(20, 2); c.lineTo(50, -2); c.lineTo(46, 12); c.closePath(); c.fill(); }
      c.fillStyle = "#F28C28"; c.beginPath(); c.moveTo(19, -10); c.quadraticCurveTo(48, -12, 58, open ? -2 : 4); c.quadraticCurveTo(42, 6, 19, 4); c.closePath(); c.fill(); out(c, "#D06A18", 1.4);
      c.save(); if (open) { c.translate(19, 6); c.rotate(0.35); c.translate(-19, -6); } c.beginPath(); c.moveTo(19, 4); c.quadraticCurveTo(40, 8, 52, 6); c.quadraticCurveTo(38, 14, 19, 11); c.closePath(); c.fillStyle = "#E07A1A"; c.fill(); c.restore();
      C(c, 55, open ? -3 : 2, 2.6, "#F6D2B0"); E(c, 34, -6, 2.4, 1.2, "#B25A14");
      if (o.hit) { L(c, [[3, -11], [11, -3]], "#2B2340", 2.6); L(c, [[11, -11], [3, -3]], "#2B2340", 2.6); }
      else { C(c, 8, -6, 4.6, "#2B5E80"); C(c, 8, -6, 2.6, "#1B1430"); C(c, 9.5, -7.5, 1.2, "#FFFFFF"); L(c, [[-2, o.fz ? -16 : -13], [15, -11]], "#9AA6B0", 2.6); }
      c.restore();
      if (o.fz && !o.baby && Math.sin(o.t * 4) > 0.3) { c.font = "900 15px Poppins, sans-serif"; c.textAlign = "center"; c.lineWidth = 4; c.strokeStyle = "#FFFFFF"; c.strokeText("HONK!", 70, -226); c.fillStyle = "#C2553A"; c.fillText("HONK!", 70, -226); }
    },
    arm: function (c, sx, sy, hx, hy, side) {
      limb(c, sx, sy, hx, hy, side, "#F2F4F6", "#C9D2D8", 19);
      [-0.5, 0, 0.5].forEach(function (a) { c.save(); c.translate(hx, hy); c.rotate(a - side * 0.3); E(c, side * 8, -6, 6, 14, "#F2F4F6"); c.beginPath(); c.ellipse(side * 8, -6, 6, 14, 0, 0, 7); out(c, "#C9D2D8", 1.4); c.restore(); });
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
      var Y = "#F7D23A", D = "#E0B020", Y2 = "#EFC22A";
      // classic rubber duck, side on: tail flicks up at the back, head sits on the front of the body
      c.beginPath(); c.moveTo(-84, -104); c.quadraticCurveTo(-92, -40, -50, -10); c.quadraticCurveTo(0, 6, 54, -12); c.quadraticCurveTo(84, -36, 74, -86); c.quadraticCurveTo(62, -134, 10, -136); c.quadraticCurveTo(-30, -134, -52, -112); c.quadraticCurveTo(-66, -100, -84, -104); c.closePath(); c.fillStyle = Y; c.fill(); out(c, D, 2.5);
      E(c, -6, -100, 40, 12, "rgba(255,255,255,.3)", -0.15);
      c.beginPath(); c.moveTo(-60, -84); c.quadraticCurveTo(-30, -102, 14, -86); c.quadraticCurveTo(22, -60, -6, -44); c.quadraticCurveTo(-44, -44, -60, -84); c.fillStyle = Y2; c.fill(); out(c, D, 1.6);
      c.strokeStyle = D; c.lineWidth = 1.5; [-40, -22, -4].forEach(function (x) { c.beginPath(); c.moveTo(x, -82); c.quadraticCurveTo(x + 6, -66, x + 2, -54); c.stroke(); });
      // head
      var hx = 14, hy = -180;
      C(c, hx, hy, 48, Y); c.beginPath(); c.arc(hx, hy, 48, Math.PI * 0.62, Math.PI * 2.38); out(c, D, 2.5);
      E(c, hx - 18, hy - 22, 16, 8, "rgba(255,255,255,.45)", -0.5);
      E(c, hx + 22, hy + 14, 9, 5.5, "rgba(240,120,100,.4)");
      // bill pointing right
      var open = o.fz || o.hit;
      if (open) { c.fillStyle = "#B8442A"; c.beginPath(); c.moveTo(hx + 38, hy + 4); c.lineTo(hx + 82, hy + 4); c.lineTo(hx + 70, hy + 22); c.closePath(); c.fill(); }
      c.fillStyle = "#F28C28"; c.beginPath(); c.moveTo(hx + 36, hy - 8); c.quadraticCurveTo(hx + 76, hy - 16, hx + 86, hy + (open ? -2 : 4)); c.quadraticCurveTo(hx + 70, hy + 10, hx + 38, hy + 8); c.closePath(); c.fill(); out(c, "#D06A18", 1.5);
      c.save(); if (open) { c.translate(hx + 38, hy + 8); c.rotate(0.32); c.translate(-hx - 38, -hy - 8); } c.beginPath(); c.moveTo(hx + 38, hy + 8); c.quadraticCurveTo(hx + 66, hy + 12, hx + 78, hy + 8); c.quadraticCurveTo(hx + 62, hy + 22, hx + 38, hy + 18); c.closePath(); c.fillStyle = "#E07A1A"; c.fill(); c.restore();
      // eye
      if (o.hit) { L(c, [[hx + 12, hy - 22], [hx + 24, hy - 10]], "#2B2340", 3); L(c, [[hx + 24, hy - 22], [hx + 12, hy - 10]], "#2B2340", 3); }
      else { E(c, hx + 18, hy - 15, 9, 11, "#FFFFFF"); C(c, hx + 21, hy - 13, 5.5, "#1B1430"); C(c, hx + 23, hy - 15, 2, "#FFFFFF"); if (o.fz) L(c, [[hx + 6, hy - 34], [hx + 28, hy - 26]], "#2B2340", 3.2); }
      // admiral's bicorne
      if (!o.baby) { c.save(); c.translate(hx - 4, hy - 42); c.rotate(o.fz ? -0.22 : -0.08);
      c.fillStyle = "#22304F"; c.beginPath(); c.moveTo(-58, 6); c.quadraticCurveTo(0, -46, 58, 6); c.quadraticCurveTo(0, -6, -58, 6); c.fill();
      c.strokeStyle = "#E8B53A"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-54, 4); c.quadraticCurveTo(0, -8, 54, 4); c.stroke();
      C(c, 0, -12, 8, "#E8B53A"); L(c, [[0, -18], [0, -6]], "#22304F", 2); L(c, [[-4, -10], [4, -10]], "#22304F", 2);
      c.restore(); }
    },
    arm: function (c, sx, sy, hx, hy, side) {
      limb(c, sx, sy, hx, hy, side, "#EFC22A", "#E0B020", 20);
      E(c, hx + side * 4, hy, 12, 10, "#EFC22A"); c.beginPath(); c.ellipse(hx + side * 4, hy, 12, 10, 0, 0, 7); out(c, "#E0B020", 1.8);
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
      var F = "#A88B6E", F2 = "#937659", B = "#EDE3D3", ed = "#7E6650", P = "#E8B7B0";
      // sitting up on her haunches: haunches, chest and head overlap so it reads as one animal
      E(c, -42, -8, 26, 11, F2); E(c, 42, -8, 26, 11, F2);
      E(c, 0, -58, 66, 60, F); c.beginPath(); c.ellipse(0, -58, 66, 60, 0, 0, 7); out(c, ed, 1.8);
      c.strokeStyle = F2; c.lineWidth = 3; [-1, 1].forEach(function (s) { c.beginPath(); c.arc(s * 34, -46, 30, s < 0 ? Math.PI * 0.55 : -0.2, s < 0 ? Math.PI * 1.2 : Math.PI * 0.45); c.stroke(); });
      E(c, 0, -116, 46, 52, F);
      E(c, 0, -98, 28, 48, B);
      // ears (flatten back when angry, one flops when hit)
      [-1, 1].forEach(function (s) {
        var a = o.hit && s > 0 ? s * 1.5 : s * (o.fz ? 0.55 : 0.14);
        c.save(); c.translate(s * 13, -206); c.rotate(a);
        E(c, 0, -36, 12, 40, F); c.beginPath(); c.ellipse(0, -36, 12, 40, 0, 0, 7); out(c, ed, 1.6);
        E(c, 1, -34, 6.5, 31, P); c.beginPath(); c.ellipse(0, -36, 12, 40, 0, Math.PI * 1.35, Math.PI * 1.65); c.strokeStyle = "#5A4636"; c.lineWidth = 3; c.stroke();
        c.restore();
      });
      // head
      E(c, 0, -180, 40, 36, F); c.beginPath(); c.ellipse(0, -180, 40, 36, 0, Math.PI * 0.85, Math.PI * 2.15); out(c, ed, 1.6);
      E(c, -24, -164, 18, 14, F); E(c, 24, -164, 18, 14, F);
      // eyes sit on the sides, dark brown with a pale ring
      [-1, 1].forEach(function (s) {
        var ex = s * 21, ey = -186;
        if (o.hit) { L(c, [[ex - 5, ey - 5], [ex + 5, ey + 5]], "#2B2340", 2.8); L(c, [[ex + 5, ey - 5], [ex - 5, ey + 5]], "#2B2340", 2.8); return; }
        E(c, ex, ey, 9, 10, B); E(c, ex, ey, 7, 8.5, "#3A2418"); C(c, ex + 2, ey - 3, 2.2, "#FFFFFF");
        if (o.fz) L(c, [[ex + s * 12, ey - 15], [ex - s * 8, ey - 9]], "#5A4636", 3);
      });
      // muzzle, nose, whiskers
      E(c, -7, -164, 10, 8, B); E(c, 7, -164, 10, 8, B);
      c.fillStyle = "#D98C8C"; c.beginPath(); c.moveTo(-5, -174); c.lineTo(5, -174); c.lineTo(0, -169); c.closePath(); c.fill();
      L(c, [[0, -169], [0, -164]], "#7E6650", 1.6); c.strokeStyle = "#7E6650"; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, -164); c.quadraticCurveTo(-4, -160, -8, -162); c.moveTo(0, -164); c.quadraticCurveTo(4, -160, 8, -162); c.stroke();
      if (o.fz) { rr(c, -5, -162, 10, 9, 2); c.fillStyle = "#FFFFFF"; c.fill(); L(c, [[0, -162], [0, -153]], "#C9BFB0", 1); }
      c.strokeStyle = "rgba(60,45,35,.55)"; c.lineWidth = 1.1; [-1, 1].forEach(function (s) { [-3, 2, 6].forEach(function (d) { c.beginPath(); c.moveTo(s * 14, -166 + d); c.lineTo(s * 48, -172 + d * 2.2); c.stroke(); }); });
    },
    arm: function (c, sx, sy, hx, hy, side) {
      limb(c, sx, sy, hx, hy, side, "#A88B6E", "#7E6650", 18);
      E(c, hx, hy, 10, 9, "#937659"); [-4, 0, 4].forEach(function (f) { C(c, hx + f + side * 3, hy - 7, 3.2, "#937659"); });
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
      if (o.fz && !o.baby && Math.sin(tt * 4) > 0.3) { c.font = "900 15px Poppins, sans-serif"; c.textAlign = "center"; c.lineWidth = 4; c.strokeStyle = "#2B2340"; c.strokeText("BOO!", 56, -238); c.fillStyle = "#F7F4FF"; c.fillText("BOO!", 56, -238); }
      c.restore();
    },
    arm: function (c, sx, sy, hx, hy, side) {
      limb(c, sx, sy, hx, hy, side, "#F7F4FF", "#C9BFE0", 20);
      E(c, hx, hy, 11, 9, "#F7F4FF"); c.beginPath(); c.ellipse(hx, hy, 11, 9, 0, 0, 7); out(c, "#C9BFE0", 1.6);
    }
  };

  window.MW_BOSSART = A;
})();
