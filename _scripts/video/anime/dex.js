// Dex the fox detective: anime-style back-story short (about 32 s). Each scene: d (seconds), cap (caption), f(t, d, T, K) -> HTML for the stage.
window.STORY = {
 mascot: "/assets/mascots/dx.svg",
 out: "dex",
 scenes: [
  { d: 3.6, lines: true, shake: 10, pal: ["#FFE29A", "#FF7A59", "#3A1E5E"], ep: "EPISODE 1", title: "DEX<br><span style='font-size:28px'>THE FOX WHO READ TOO MUCH</span>", ty: 610, ts: 96,
    f: function (t, d, T, K) { var s = 150 + 230 * K.pop(t / 0.6); return K.img(K.M, 270, 380, s, -6 + 3 * Math.sin(T * 6)) + K.sparks(T, 7, 270, 380, 200); } },
  { d: 4.4, pal: ["#F7E3C3", "#C98B5A", "#4B2E2A"], cap: "Dex grew up in the back room of a <b>village library</b>…",
    f: function (t, d, T, K) { var h = ""; // shelves of books, then Dex peeking up from a book
      for (var r = 0; r < 4; r++) for (var i = 0; i < 9; i++) { var c = ["#7A3FB5", "#2E7D6B", "#C2553A", "#E8B53A", "#1F6E99"][(r * 9 + i * 7) % 5];
        h += '<div style="position:absolute;left:' + (34 + i * 54) + 'px;top:' + (110 + r * 120 - (i % 3) * 8) + 'px;width:' + (36 + (i * 5) % 14) + 'px;height:' + (96 + (i % 3) * 8) + 'px;background:' + c + ';border:4px solid #1B1430;border-radius:4px"></div>'; }
      for (r = 0; r < 4; r++) h += '<div style="position:absolute;left:20px;right:20px;top:' + (206 + r * 120) + 'px;height:14px;background:#4B2E2A;border:4px solid #1B1430"></div>';
      var y = 720 - 130 * K.ease(t / 1.1);
      return h + K.img(K.M, 270, y, 260, 0) + '<div style="position:absolute;left:150px;top:' + (y + 70) + 'px;width:240px;height:90px;background:#FFF4D6;border:5px solid #1B1430;border-radius:10px;transform:rotate(-3deg)"><div style="position:absolute;left:116px;top:0;bottom:0;border-left:4px solid #1B1430"></div></div>'; } },
  { d: 4.6, pal: ["#E8F0FF", "#93B5E1", "#2B2340"], cap: "…reading every whodunit <b>twice</b>: once for fun, once to <b>catch the author cheating</b>.",
    f: function (t, d, T, K) { // two manga panels: happy read, then suspicious squint
      var a = K.clamp(t / 0.4), b = K.clamp((t - 1.6) / 0.4);
      return '<div style="position:absolute;left:30px;top:90px;width:480px;height:330px;background:#FFF;border:6px solid #1B1430;transform:translateX(' + (1 - K.ease(a)) * -560 + 'px) rotate(-1.5deg);overflow:hidden">' + K.img(K.M, 170, 180, 240, -4) +
        '<div class="fx" style="left:300px;top:60px;font-size:44px;color:#FF7A59">♥ ♪</div><div class="fx" style="left:290px;top:210px;font-size:30px">READ #1</div></div>' +
        '<div style="position:absolute;left:30px;top:450px;width:480px;height:330px;background:#2B2340;border:6px solid #1B1430;transform:translateX(' + (1 - K.ease(b)) * 560 + 'px) rotate(1.5deg);overflow:hidden">' + K.img(K.M, 320, 180, 250, 5, 1, "filter:saturate(.8) brightness(.9)") +
        '<div class="fx" style="left:40px;top:50px;font-size:58px;color:#FFE066">¬_¬</div><div class="fx" style="left:40px;top:220px;font-size:30px">READ #2</div></div>'; } },
  { d: 4.8, lines: true, shake: 14, flash: 1, pal: ["#FFFFFF", "#FFD1E3", "#B5308A"], cap: "Then she noticed <b>patients</b> were the best mysteries of all.",
    f: function (t, d, T, K) { var s = 300 + 120 * K.pop(t / 0.5); return K.img(K.M, 270, 400, s, 0) + '<div class="fx" style="left:390px;top:' + (150 - 30 * K.pop(t / 0.4)) + 'px;font-size:130px;color:#FF3D6E;transform:rotate(12deg)">!</div>' + K.sparks(T, 9, 270, 400, 240); } },
  { d: 4.4, pal: ["#E3F2EC", "#7DB9A5", "#1F3B35"], cap: "Each one a <b>locked room</b>, with the clues hidden in plain sight.",
    f: function (t, d, T, K) { var h = '<div style="position:absolute;left:110px;top:170px;width:320px;height:440px;background:#8C6A52;border:6px solid #1B1430;border-radius:10px"></div>' +
        '<div style="position:absolute;left:150px;top:210px;width:240px;height:360px;border:5px solid #5B4232;border-radius:6px"></div><div style="position:absolute;left:360px;top:380px;width:26px;height:26px;border-radius:50%;background:#F2C230;border:4px solid #1B1430"></div>';
      var k = K.ease(t / 1.6); h += '<svg style="position:absolute;left:' + (60 + 300 * k) + 'px;top:' + (360 - 40 * Math.sin(k * 3.14)) + 'px;width:90px;height:60px;transform:rotate(' + (-20 + 40 * k) + 'deg)" viewBox="0 0 90 60"><circle cx="20" cy="30" r="15" fill="#F2C230" stroke="#1B1430" stroke-width="5"/><circle cx="20" cy="30" r="5" fill="#1B1430"/><path d="M35 30h45v12M66 30v10" stroke="#1B1430" stroke-width="11" fill="none"/><path d="M35 30h45v12M66 30v10" stroke="#F2C230" stroke-width="5" fill="none"/></svg>';
      return h + K.img(K.M, 120, 720, 200, 8 * Math.sin(T * 4)) + (t > 1.7 ? '<div class="fx" style="left:200px;top:320px;font-size:54px;color:#FFE066;transform:scale(' + K.pop((t - 1.7) / 0.4) + ')">CLICK!</div>' : ""); } },
  { d: 5.2, pal: ["#F6E7C1", "#D9A066", "#5B2E1E"], cap: "At home she keeps a corkboard of <b>unsolved cases</b>, with red string. She is <b>no longer allowed</b> to bring it to work.",
    f: function (t, d, T, K) { var P = [[120, 210], [400, 180], [260, 330], [110, 470], [420, 450]], h = '<div style="position:absolute;left:40px;top:110px;width:460px;height:470px;background:#C99A5E;border:8px solid #6B4421;border-radius:8px;background-image:radial-gradient(#B7864A 2px,transparent 2.5px);background-size:12px 12px"></div>';
      var n = Math.floor(K.clamp(t / 2.4) * 6), svg = '<svg class="l" viewBox="0 0 540 960" style="position:absolute;inset:0">';
      for (var i = 1; i < Math.min(n + 1, P.length); i++) svg += '<line x1="' + P[i - 1][0] + '" y1="' + P[i - 1][1] + '" x2="' + P[i][0] + '" y2="' + P[i][1] + '" stroke="#D3243A" stroke-width="5"/>';
      h += svg + "</svg>";
      P.forEach(function (p, i) { h += '<div style="position:absolute;left:' + (p[0] - 46) + 'px;top:' + (p[1] - 34) + 'px;width:92px;height:68px;background:#FFF;border:4px solid #1B1430;transform:rotate(' + ((i % 2) ? 5 : -5) + 'deg)"><div style="margin:10px;height:6px;background:#CCC"></div><div style="margin:0 10px;height:6px;width:50px;background:#CCC"></div></div><div style="position:absolute;left:' + (p[0] - 7) + 'px;top:' + (p[1] - 40) + 'px;width:14px;height:14px;border-radius:50%;background:#E03A3A;border:3px solid #1B1430"></div>'; });
      return h + K.img(K.M, 420, 640, 170, -5) + (t > 3 ? '<div class="fx" style="left:70px;top:610px;font-size:40px;color:#FF7A59;transform:scale(' + K.pop((t - 3) / 0.4) + ')">BANNED.</div>' : ""); } },
  { d: 5.0, lines: true, shake: 8, pal: ["#FFFFFF", "#D6C8F2", "#4A3480"], cap: "The deerstalker? A thank-you gift from her <b>first zebra diagnosis</b>. She has not taken it off since.",
    f: function (t, d, T, K) { var z = K.ease(t / 0.8); return K.img("/assets/mascots/zebritis.svg", 600 - 220 * z, 420, 230, -8) + K.img(K.M, -60 + 220 * z, 420, 250, 8) +
        (t > 1.2 ? '<div style="position:absolute;left:215px;top:' + (170 - 20 * K.pop((t - 1.2) / 0.5)) + 'px;width:110px;height:90px;transform:scale(' + K.pop((t - 1.2) / 0.5) + ') rotate(-6deg)"><div style="position:absolute;left:0;right:0;bottom:0;height:62px;background:#E65C86;border:5px solid #1B1430;border-radius:6px"></div><div style="position:absolute;left:-8px;right:-8px;top:12px;height:24px;background:#FF8FAE;border:5px solid #1B1430;border-radius:6px"></div><div style="position:absolute;left:44px;top:12px;width:16px;bottom:0;background:#FFE066;border-left:4px solid #1B1430;border-right:4px solid #1B1430"></div><div class="fx" style="left:-30px;top:-52px;font-size:30px;color:#FFE066">THANK YOU!</div></div>' : "") + K.sparks(T, 8, 270, 420, 230); } },
  { d: 4.2, pal: ["#FFE29A", "#FF7A59", "#3A1E5E"], title: "PLAY DXTECTIVE", ty: 640, ts: 58, ep: "MALADYWISE.COM",
    cap: "", f: function (t, d, T, K) { return K.img(K.M, 270, 380, 300 + 12 * Math.sin(T * 5), -4) + K.sparks(T, 6, 270, 380, 220); } }
 ]
};
