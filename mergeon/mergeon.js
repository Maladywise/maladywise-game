/* Mergeon: drop organs (sea creatures in Normie mode), match two of a kind, they merge into the next organ up.
   Daily run: everyone gets the same drop order each day (Sydney time). Practice runs after.
   Physics by Matter.js (MIT), vendored as matter.min.js. */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "8";
  var root = document.getElementById("mrg");
  if (!document.querySelector("link[data-mrg]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "mergeon.css?v=" + BUILD; l.setAttribute("data-mrg", ""); document.head.appendChild(l);
  }
  var W = 400, H = 580, LINE = 96, DROP_Y = 46, WALL = 40, FIRST = "2026-10-19", WIN_LV = 9;
  // Normie mode swaps the organ chain for sea creatures. Same radii, hulls per drawing and drop order, so daily runs match.
  var NORMIE = !!(window.MW_mode && window.MW_mode() === "normie");
  // the cute face every piece wears (same as in the drawings above)
  function FACE(x, y, k) { return "<g transform=\"translate(" + x + " " + y + ") scale(" + k + ")\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g>"; }
  var MED = {
    O: [
      { e: "🦠", n: "Microbe", r: 16, c: "#CDEFEC" },
      { e: "🩸", n: "Blood drop", r: 22, c: "#F2C6CD" },
      { e: "👁️", n: "Eye", r: 29, c: "#CFE5F1" },
      { e: "🫒", n: "Gallbladder", r: 36, c: "#DCEFD0" },
      { e: "🫘", n: "Kidney", r: 44, c: "#E3D0EA" },
      { e: "🎈", n: "Bladder", r: 53, c: "#FBEFC0" },
      { e: "🥟", n: "Stomach", r: 62, c: "#FBDDC2" },
      { e: "🫀", n: "Heart", r: 72, c: "#FAD0D0" },
      { e: "🫁", n: "Lungs", r: 84, c: "#D6E8F7" },
      { e: "🟫", n: "Liver", r: 97, c: "#E6D5C8" },
      { e: "🧠", n: "Brain", r: 112, c: "#FADDEA" }
    ],
    ART: ["<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><g stroke-linejoin=\"round\" stroke-linecap=\"round\"><line x1=\"50\" y1=\"50\" x2=\"96\" y2=\"50\" stroke=\"#3A2A55\" stroke-width=\"5\"/><circle cx=\"96\" cy=\"50\" r=\"4\" fill=\"#2A8C85\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><line x1=\"50\" y1=\"50\" x2=\"82.5269119345812\" y2=\"82.5269119345812\" stroke=\"#3A2A55\" stroke-width=\"5\"/><circle cx=\"82.5269119345812\" cy=\"82.5269119345812\" r=\"4\" fill=\"#2A8C85\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><line x1=\"50\" y1=\"50\" x2=\"50\" y2=\"96\" stroke=\"#3A2A55\" stroke-width=\"5\"/><circle cx=\"50\" cy=\"96\" r=\"4\" fill=\"#2A8C85\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><line x1=\"50\" y1=\"50\" x2=\"17.473088065418814\" y2=\"82.5269119345812\" stroke=\"#3A2A55\" stroke-width=\"5\"/><circle cx=\"17.473088065418814\" cy=\"82.5269119345812\" r=\"4\" fill=\"#2A8C85\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><line x1=\"50\" y1=\"50\" x2=\"4\" y2=\"50.00000000000001\" stroke=\"#3A2A55\" stroke-width=\"5\"/><circle cx=\"4\" cy=\"50.00000000000001\" r=\"4\" fill=\"#2A8C85\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><line x1=\"50\" y1=\"50\" x2=\"17.473088065418807\" y2=\"17.473088065418814\" stroke=\"#3A2A55\" stroke-width=\"5\"/><circle cx=\"17.473088065418807\" cy=\"17.473088065418814\" r=\"4\" fill=\"#2A8C85\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><line x1=\"50\" y1=\"50\" x2=\"49.99999999999999\" y2=\"4\" stroke=\"#3A2A55\" stroke-width=\"5\"/><circle cx=\"49.99999999999999\" cy=\"4\" r=\"4\" fill=\"#2A8C85\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><line x1=\"50\" y1=\"50\" x2=\"82.52691193458118\" y2=\"17.473088065418807\" stroke=\"#3A2A55\" stroke-width=\"5\"/><circle cx=\"82.52691193458118\" cy=\"17.473088065418807\" r=\"4\" fill=\"#2A8C85\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><circle cx=\"50\" cy=\"50\" r=\"34\" fill=\"#3FB8AF\" stroke=\"#3A2A55\" stroke-width=\"3\"/><circle cx=\"36\" cy=\"34\" r=\"5\" fill=\"#8FDDD6\"/><circle cx=\"66\" cy=\"66\" r=\"4\" fill=\"#2A8C85\"/></g><g transform=\"translate(50 54) scale(1)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M50 4 C50 4 14 46 14 64 A36 34 0 0 0 86 64 C86 46 50 4 50 4Z\" fill=\"#B3182F\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M30 60 Q30 46 40 36\" stroke=\"#E0566B\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(50 68) scale(1)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><circle cx=\"50\" cy=\"50\" r=\"45\" fill=\"#FFFFFF\" stroke=\"#3A2A55\" stroke-width=\"3\"/><path d=\"M14 40 Q22 44 26 38 M80 62 Q86 66 90 60\" stroke=\"#F08A9A\" stroke-width=\"2\" fill=\"none\"/><circle cx=\"50\" cy=\"50\" r=\"22\" fill=\"#4A9FD8\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><circle cx=\"50\" cy=\"50\" r=\"10\" fill=\"#1E1630\"/><circle cx=\"56\" cy=\"43\" r=\"5\" fill=\"#fff\"/></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M60 6 Q72 8 70 20 L64 30 Q86 50 82 74 Q76 96 52 96 Q26 94 22 72 Q20 50 46 30 L50 18 Q52 6 60 6Z\" fill=\"#7CC36A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M34 62 Q34 50 42 44\" stroke=\"#C3E6A8\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(52 68) scale(0.9)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M44 8 Q76 2 88 30 Q98 56 84 80 Q70 100 44 94 Q14 86 12 58 Q12 44 26 40 Q40 40 42 50 Q46 58 54 52 Q58 44 46 36 Q32 26 30 18 Q34 10 44 8Z\" fill=\"#7E3F8F\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M40 54 Q28 74 32 100\" stroke=\"#E7B95A\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M68 20 Q80 28 84 42\" stroke=\"#B27BC0\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(64 66) scale(0.9)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M22 4 Q24 20 34 30 M78 4 Q76 20 66 30\" stroke=\"#D9A23A\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M50 26 Q86 22 90 54 Q92 80 64 88 L58 98 L42 98 L36 88 Q8 80 10 54 Q14 22 50 26Z\" fill=\"#F5C842\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M24 50 Q26 40 36 36\" stroke=\"#FCE7A0\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(50 58) scale(1)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M40 4 L40 18 Q42 26 34 32 Q14 46 12 70 Q12 94 40 96 Q66 98 82 80 Q98 60 88 40 Q80 22 62 24 Q52 26 50 18 L50 4Z\" fill=\"#F2913D\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M36 58 Q50 54 62 60 M30 72 Q46 68 64 74\" stroke=\"#C96A1E\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M82 80 Q92 88 96 98\" stroke=\"#F2913D\" stroke-width=\"9\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(60 46) scale(0.85)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M40 14 L40 4 M54 12 L56 2 M64 16 L72 8\" stroke=\"#6E8FD6\" stroke-width=\"7\" stroke-linecap=\"round\"/><path d=\"M50 30 C42 10 8 12 8 42 C8 66 34 82 50 96 C66 82 92 66 92 42 C92 12 58 10 50 30Z\" fill=\"#EF4B4B\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M22 36 Q24 26 32 24\" stroke=\"#FFA3A3\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(50 52) scale(1)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M50 4 L50 34 M50 34 Q42 40 38 46 M50 34 Q58 40 62 46\" stroke=\"#6AA6DD\" stroke-width=\"8\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M42 30 Q22 20 12 44 Q4 70 10 88 Q16 98 30 94 Q44 90 44 76 L44 40Z\" fill=\"#7FB8E8\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M58 30 Q78 20 88 44 Q96 70 90 88 Q84 98 70 94 Q56 90 56 76 L56 40Z\" fill=\"#7FB8E8\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><g transform=\"translate(27 64) scale(0.55)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g><g transform=\"translate(73 64) scale(0.55)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M8 34 Q10 16 40 14 Q70 12 92 22 Q100 28 94 40 Q80 70 54 88 Q44 94 40 84 Q36 72 24 66 Q6 56 8 34Z\" fill=\"#8A5A3B\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M58 18 Q56 40 48 58\" stroke=\"#5E3A24\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M20 30 Q28 22 40 22\" stroke=\"#B88560\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M46 84 Q42 92 52 96 Q62 94 58 84\" fill=\"#8CC66A\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><g transform=\"translate(36 46) scale(1)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M30 16 Q40 4 54 10 Q68 4 78 16 Q94 20 92 38 Q100 52 90 64 Q92 82 74 84 Q66 96 50 90 Q34 96 26 84 Q8 82 10 64 Q0 52 8 38 Q6 20 30 16Z\" fill=\"#F5A9C8\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M50 14 Q46 30 52 44 Q56 58 50 72 M26 34 Q34 30 36 40 M70 30 Q64 36 72 42 M22 58 Q30 54 30 64 M78 56 Q70 58 74 68\" stroke=\"#D9709C\" stroke-width=\"3.5\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(50 58) scale(1)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>"],
    // collision outlines (convex hull of each drawing, art units 0-100, centre 50,50) so pieces sit snugly
    HULL: [[[16.2,39.1],[20.6,30.1],[35,17.8],[44.6,14.9],[61.1,16.3],[70.1,20.7],[82.2,35],[83.8,61],[79.4,70],[65.2,82.1],[39.2,83.8],[30.2,79.4],[17.9,65.2],[15,55.6]],[[13,59.7],[16.5,49.9],[27.2,31.8],[50,2.5],[75.1,35.1],[85,53.5],[87.5,63.6],[85.6,75.2],[80.7,84.4],[64.2,96.9],[43.5,99],[24.7,90.2],[17.9,82.3],[13.1,70.2]],[[5.8,35.7],[11.6,23.8],[30.3,7.9],[51.6,3.5],[69.9,8],[88.5,24],[94.3,35.8],[95.9,57.3],[80.8,84.8],[51.5,96.5],[30.4,92.1],[19.4,85],[8,69.9],[4.1,57.3]],[[21,62.4],[26.6,48.2],[52.8,8.4],[65,5.9],[70.5,12.3],[82.8,56.1],[83.2,75.1],[79.1,84.4],[70.1,93.2],[60.6,96.7],[41.7,95.7],[32.4,91.5],[23.9,82.2],[20.6,72.6]],[[12.7,48.4],[29.9,15.4],[37.3,8.7],[57.1,5.5],[70.2,8.5],[82.2,17.5],[89.2,29],[93.6,53.7],[85.2,80.9],[70.1,93.9],[57,96.9],[31.1,90.7],[20.4,82.6],[12.8,69.7]],[[8.5,54.5],[14.4,36.6],[22.7,28.8],[42.3,24.1],[67.8,25.1],[77.3,28.8],[85.5,36.6],[91.5,54.5],[87.3,74.1],[80.5,81.6],[57.6,99.5],[42.4,99.5],[19.5,81.6],[12.7,74.1]],[[10.5,70.4],[15.6,50.8],[39.7,2.5],[49.7,2.5],[81.4,28],[92.2,46.7],[93,59.7],[89.6,70.8],[83.4,80.7],[68.5,92.4],[56,96.7],[32.8,96.5],[21.9,92.5],[12.6,81.7]],[[7.5,33.6],[16.2,20],[29.1,15.7],[70.8,15.6],[83.7,19.9],[87.7,23.7],[92.5,33.6],[93.4,44.6],[87.7,61.6],[73.3,78.4],[49.9,97.5],[26.6,78.3],[12.2,61.5],[6.6,44.6]],[[7.1,58.1],[10.5,43.8],[17.5,32],[30.2,25.8],[69.8,25.8],[82.5,32],[89.5,43.8],[93.2,59.9],[93.9,74.5],[91.3,88.8],[78.6,96.3],[21.4,96.3],[8.7,88.8],[6,72.6]],[[6.5,33.7],[10.4,23.9],[18.8,17.5],[39.5,12.6],[59.8,12.6],[80.8,16.6],[93.1,21.3],[97.6,34.1],[91.2,48.7],[76.8,69.6],[53.8,89.7],[42.7,90],[14,59.9],[6.8,44.4]],[[7.2,29.6],[11.8,22.1],[37.3,8.2],[63.2,6.6],[73,9.5],[91.3,23.6],[96.7,46.3],[90.6,74.3],[84.3,82.2],[59.6,93.4],[32.2,91.7],[16.1,82.5],[9.5,74.8],[3.1,52.6]]],
    SASS: {"5":["Bladder. Hold it together.","Bladder. Under pressure.","Bladder. Full of potential."],"6":["Stomach. Got the guts for this.","Stomach. Hungry for more.","Stomach. Churning along nicely."],"7":["Heart! Pumped for you.","Heart! You’ve got the beat.","Heart! Cardio-logical."],"8":["Lungs! Genuinely breathtaking.","Lungs! Take a deep breath.","Lungs! Inspired."],"9":["Liver! It’ll grow back. Partly.","Liver! The body’s hardest worker.","Liver! Filtering out the competition."],"10":["Brain! Finally, someone using one.","Brain! Big thoughts.","Brain! Think like a doctor, indeed."]},
    POPS: ["Two brains, one big thought. Gone. +100", "Brain merger. Mind blown. +100", "Two brains cancelled out. Typical committee. +100"],
    DIST: ["🧠", "🟫", "🫁", "🫀", "Less"],
    top: "Top organ", win: "Heart %",
    lede: "Drop organs. Two of a kind merge into the next one up, from microbe to brain. Don’t let the pile cross the line.",
    verdict: function (tp) {
      return tp >= 10 ? "A whole brain. Think like a doctor? You are one." : tp >= 9 ? "Liver. Hardest-working organ, one step from a brain." :
        tp >= 8 ? "Lungs. Breathtaking. Two steps from a brain." : tp >= 7 ? "Heart. Solid, reliable, slightly overworked. Like most GPs." :
        tp >= 5 ? "Some decent plumbing. Keep going." : "Microbes everywhere. Wash your hands and try again.";
    },
    // wild piece: merges with whatever it touches (that piece levels up)
    W: { e: "🧬", n: "Stem cell", r: 19, c: "#DDF3E6" },
    WART: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M50 8 Q66 4 76 16 Q94 18 92 38 Q100 54 90 68 Q92 88 70 90 Q58 100 44 92 Q24 96 18 80 Q2 72 8 54 Q2 36 16 26 Q24 8 50 8Z\" fill=\"#8FD9B0\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\"/><circle cx=\"66\" cy=\"34\" r=\"12\" fill=\"#C7A8F0\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><circle cx=\"62\" cy=\"30\" r=\"3.5\" fill=\"#EDE3FC\"/><path d=\"M22 44 Q26 30 40 24\" stroke=\"#D2F2E0\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M90 2 l2.5 6.5 6.5 2.5 -6.5 2.5 -2.5 6.5 -2.5 -6.5 -6.5 -2.5 6.5 -2.5z\" fill=\"#F5C842\" stroke=\"#3A2A55\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/>" + FACE(46, 62, 0.95) + "</svg>",
    FACTS: [
      "Your body carries roughly as many bacterial cells as human ones: about 38 trillion of them.",
      "A red blood cell lives about 120 days before it’s recycled.",
      "The cornea has no blood vessels. It takes its oxygen straight from the air.",
      "You can live without a gallbladder. The liver keeps making bile; it just trickles straight into the gut.",
      "Your kidneys filter about 180 litres of fluid a day, and hand almost all of it back.",
      "An adult bladder comfortably holds about 400–500 mL, and its lining folds flat when it’s empty.",
      "Stomach acid can reach pH 1–2, so the stomach’s surface lining renews itself every few days.",
      "Your heart beats about 100,000 times a day, roughly 2.5 billion times in a lifetime.",
      "The left lung is smaller than the right: two lobes, not three, to make room for the heart.",
      "The liver can regrow to full size even after about two-thirds of it is removed.",
      "The brain is about 2% of your body weight but uses about 20% of its energy."
    ],
    WFACT: "Wild piece! It merges with anything. Stem cells in your bone marrow make hundreds of billions of new blood cells a day.",
    BIG: "Mind blown!", TOOL: { e: "🔪", n: "Scalpel", hint: "Scalpel ready. Tap a piece to remove it." }, ANON: "Anonymous medic",
    REACT: [["Early days. Rest, fluids, try again.", "Even brains start as microbes. Go again."], ["Stable. Observations look good.", "Not bad. Solid vital signs."], ["Textbook. Literally.", "Admit it, you’re showing off."]]
  };
  var SEA = {
    O: [
      { e: "🫧", n: "Plankton", r: 16, c: "#D3F2EC" },
      { e: "🦐", n: "Shrimp", r: 22, c: "#FFE0D2" },
      { e: "🦀", n: "Crab", r: 29, c: "#FFD6CC" },
      { e: "🐠", n: "Clownfish", r: 36, c: "#FFE2C2" },
      { e: "🪼", n: "Jellyfish", r: 44, c: "#EBDDFB" },
      { e: "🐡", n: "Pufferfish", r: 53, c: "#FFF3BF" },
      { e: "🐙", n: "Octopus", r: 62, c: "#FFD5E2" },
      { e: "🐢", n: "Turtle", r: 72, c: "#DCF0D0" },
      { e: "🦈", n: "Shark", r: 84, c: "#D6E4F2" },
      { e: "🐬", n: "Orca", r: 97, c: "#D9D9E6" },
      { e: "🐋", n: "Blue whale", r: 112, c: "#CDE3FA" }
    ],
    ART: ["<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M38 22 Q30 8 18 6 M62 22 Q70 8 82 6\" stroke=\"#3A2A55\" stroke-width=\"3.5\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"18\" cy=\"6\" r=\"3\" fill=\"#7ED9C8\"/><circle cx=\"82\" cy=\"6\" r=\"3\" fill=\"#7ED9C8\"/><path d=\"M50 14 Q86 14 90 50 Q92 84 50 94 Q8 84 10 50 Q14 14 50 14Z\" fill=\"#7ED9C8\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><circle cx=\"30\" cy=\"36\" r=\"5\" fill=\"#B9EEE4\"/><circle cx=\"72\" cy=\"76\" r=\"3.5\" fill=\"#B9EEE4\"/><circle cx=\"26\" cy=\"70\" r=\"3\" fill=\"#B9EEE4\"/><g transform=\"translate(50 58) scale(1)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M24 34 Q10 22 4 6 M28 30 Q22 14 18 4\" stroke=\"#E86A4A\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M56 86 L36 78 Q30 92 42 98Z\" fill=\"#FF9C7A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M20 44 Q20 12 54 10 Q92 10 94 48 Q94 80 66 90 Q54 92 52 82 Q52 74 62 70 Q72 64 70 50 Q66 36 50 38 Q40 40 38 50 Q34 58 26 56 Q20 54 20 44Z\" fill=\"#FF9C7A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M76 22 Q70 32 70 40 M88 40 Q78 46 72 50 M86 66 Q76 64 70 62\" stroke=\"#E86A4A\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M44 40 L40 50 M56 40 L56 50\" stroke=\"#E86A4A\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><g transform=\"translate(46 24) scale(0.62)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M22 56 L6 50 M20 66 L4 68 M24 76 L8 86 M78 56 L94 50 M80 66 L96 68 M76 76 L92 86\" stroke=\"#3A2A55\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M22 56 L6 50 M20 66 L4 68 M24 76 L8 86 M78 56 L94 50 M80 66 L96 68 M76 76 L92 86\" stroke=\"#F2553C\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M32 50 Q22 40 22 32 M68 50 Q78 40 78 32\" stroke=\"#3A2A55\" stroke-width=\"7\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M32 50 Q22 40 22 32 M68 50 Q78 40 78 32\" stroke=\"#F2553C\" stroke-width=\"4\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M22 30 Q6 28 6 16 Q8 4 20 6 L18 16 L28 12 Q34 24 22 30Z\" fill=\"#F2553C\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M78 30 Q94 28 94 16 Q92 4 80 6 L82 16 L72 12 Q66 24 78 30Z\" fill=\"#F2553C\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M50 40 Q84 40 86 64 Q84 88 50 88 Q16 88 14 64 Q16 40 50 40Z\" fill=\"#F2553C\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M26 56 Q30 48 40 46\" stroke=\"#FF9C88\" stroke-width=\"4.5\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><g transform=\"translate(50 64) scale(1)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M24 50 L6 30 Q2 50 6 70Z\" fill=\"#FF8A1E\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M40 26 Q52 10 66 24Z\" fill=\"#FF8A1E\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M50 22 Q88 22 94 50 Q88 78 50 78 Q22 78 16 50 Q22 22 50 22Z\" fill=\"#FF8A1E\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M30 30 Q40 50 30 70 L40 75 Q50 50 40 25Z\" fill=\"#FFFFFF\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M76 28 Q70 50 76 72 L84 66 Q80 50 84 34Z\" fill=\"#FFFFFF\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><g transform=\"translate(60 48) scale(0.82)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M22 56 Q14 68 22 78 Q28 88 20 96 L27 97 Q36 86 30 76 Q23 66 30 56Z\" fill=\"#E7B6F2\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M40 56 Q34 70 42 80 Q46 88 40 98 L47 98 Q55 88 50 78 Q43 68 48 56Z\" fill=\"#E7B6F2\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M58 56 Q54 70 60 80 Q64 88 58 98 L65 97 Q72 86 68 78 Q62 68 66 56Z\" fill=\"#E7B6F2\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M74 56 Q70 68 78 78 Q84 88 78 96 L85 95 Q90 84 86 76 Q80 66 82 56Z\" fill=\"#E7B6F2\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M8 56 Q8 6 50 6 Q92 6 92 56 Q85 62 78 56 Q71 62 64 56 Q57 62 50 56 Q43 62 36 56 Q29 62 22 56 Q15 62 8 56Z\" fill=\"#B48CF0\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M22 34 Q26 20 40 16\" stroke=\"#D9C4FA\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><g transform=\"translate(52 36) scale(1)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M48.6 18.4 L54.0 6.0 L59.4 18.4Z\" fill=\"#F7D24A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M63.7 19.4 L74.0 10.6 L73.4 24.1Z\" fill=\"#F7D24A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M76.9 26.8 L90.0 23.3 L83.6 35.3Z\" fill=\"#F7D24A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M85.5 39.2 L98.8 41.8 L87.9 49.8Z\" fill=\"#F7D24A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M87.9 54.2 L98.8 62.2 L85.5 64.8Z\" fill=\"#F7D24A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M83.6 68.7 L90.0 80.7 L76.9 77.2Z\" fill=\"#F7D24A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M73.4 79.9 L74.0 93.4 L63.7 84.6Z\" fill=\"#F7D24A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M59.4 85.6 L54.0 98.0 L48.6 85.6Z\" fill=\"#F7D24A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M44.3 84.6 L34.0 93.4 L34.6 79.9Z\" fill=\"#F7D24A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M31.1 77.2 L18.0 80.7 L24.4 68.7Z\" fill=\"#F7D24A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M24.4 35.3 L18.0 23.3 L31.1 26.8Z\" fill=\"#F7D24A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M34.6 24.1 L34.0 10.6 L44.3 19.4Z\" fill=\"#F7D24A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M22 52 L4 36 Q1 52 4 68Z\" fill=\"#F7D24A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><circle cx=\"54\" cy=\"52\" r=\"36\" fill=\"#FBDF62\" stroke=\"#3A2A55\" stroke-width=\"3\"/><ellipse cx=\"56\" cy=\"72\" rx=\"20\" ry=\"9\" fill=\"#FFF0A8\"/><path d=\"M32 38 Q36 26 48 22\" stroke=\"#FFF0A8\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><g transform=\"translate(58 52) scale(1)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M22 52 Q14 6 50 6 Q86 6 78 52 Q86 66 94 80 Q98 92 86 90 Q80 82 72 72 Q74 86 74 96 Q64 98 60 86 L56 74 Q54 90 50 96 Q46 90 44 74 L40 86 Q36 98 26 96 Q26 86 28 72 Q20 82 14 90 Q2 92 6 80 Q14 66 22 52Z\" fill=\"#F07FA8\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><circle cx=\"18\" cy=\"84\" r=\"2.6\" fill=\"#FFC2D6\"/><circle cx=\"32\" cy=\"88\" r=\"2.6\" fill=\"#FFC2D6\"/><circle cx=\"68\" cy=\"88\" r=\"2.6\" fill=\"#FFC2D6\"/><circle cx=\"82\" cy=\"84\" r=\"2.6\" fill=\"#FFC2D6\"/><path d=\"M30 30 Q34 18 46 14\" stroke=\"#FFB8CF\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><g transform=\"translate(50 44) scale(1)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M20 70 Q8 80 12 92 Q24 92 32 76Z\" fill=\"#A9DB8E\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M56 72 Q60 90 72 92 Q76 82 66 70Z\" fill=\"#A9DB8E\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M8 70 L4 66 L12 66Z\" fill=\"#A9DB8E\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><circle cx=\"80\" cy=\"52\" r=\"17\" fill=\"#A9DB8E\" stroke=\"#3A2A55\" stroke-width=\"3\"/><path d=\"M6 66 Q8 16 40 16 Q72 16 72 66 Q40 74 6 66Z\" fill=\"#3E9E6A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M26 30 L40 24 L54 30 L54 46 L40 52 L26 46Z M40 52 L40 68 M26 46 L14 52 M54 46 L66 52\" stroke=\"#2A7A50\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M18 36 Q22 26 30 22\" stroke=\"#7FCB98\" stroke-width=\"4\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><g transform=\"translate(81 52) scale(0.66)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M24 52 L4 24 Q12 26 28 44Z\" fill=\"#7F9DC4\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M24 56 L6 82 Q16 78 30 62Z\" fill=\"#7F9DC4\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M44 34 L54 6 Q62 18 70 34Z\" fill=\"#7F9DC4\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M18 54 Q38 30 66 30 Q92 32 97 54 Q92 74 64 76 Q36 76 18 54Z\" fill=\"#8FAED4\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M34 64 Q60 80 92 62 Q86 74 64 76 Q44 76 34 64Z\" fill=\"#F3F7FC\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M52 70 L44 90 Q58 86 66 72Z\" fill=\"#7F9DC4\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M44 46 Q42 52 44 58 M50 46 Q48 52 50 58\" stroke=\"#5F7FA8\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><g transform=\"translate(74 52) scale(0.78)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M20 54 L4 32 Q12 32 26 46Z\" fill=\"#2F2B45\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M20 58 L6 80 Q16 76 28 64Z\" fill=\"#2F2B45\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M42 32 Q46 12 54 2 Q60 20 64 32Z\" fill=\"#2F2B45\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M16 56 Q32 28 64 28 Q94 30 97 56 Q92 80 62 80 Q32 80 16 56Z\" fill=\"#2F2B45\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M30 66 Q56 86 92 66 Q86 80 62 80 Q42 80 30 66Z\" fill=\"#FFFFFF\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><ellipse cx=\"72\" cy=\"52\" rx=\"19\" ry=\"13\" fill=\"#FFFFFF\"/><path d=\"M50 74 L44 92 Q56 88 62 76Z\" fill=\"#2F2B45\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M28 44 Q34 36 44 34\" stroke=\"#5A5577\" stroke-width=\"4\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><g transform=\"translate(72 50) scale(0.78)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M26 56 Q14 42 10 22 Q4 16 2 24 Q4 36 16 48 Q2 46 2 54 Q8 60 26 62Z\" fill=\"#3C78C8\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M20 58 Q24 22 60 22 Q96 22 97 58 Q96 82 62 84 Q30 86 20 58Z\" fill=\"#4A8AE0\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M30 68 Q60 92 94 68 Q90 82 62 84 Q42 86 30 68Z\" fill=\"#BFDCFA\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M44 74 L46 82 M54 77 L55 84 M64 77 L64 84 M74 76 L73 83\" stroke=\"#8DB9EE\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M54 70 L48 88 Q60 84 64 72Z\" fill=\"#3C78C8\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M32 40 Q38 30 50 28\" stroke=\"#8DBCF2\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><g transform=\"translate(70 50) scale(1)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>"],
    HULL: [[[8.5,50.3],[13.7,31.4],[19.8,23],[33.2,15],[43.5,12.8],[64.3,14.2],[78.3,21.3],[86.3,31.5],[91.5,50.2],[87.8,70.6],[69.6,88.5],[50,95.5],[30.5,88.5],[12.2,70.6]],[[20.1,31.4],[25.7,20.3],[41.5,10.5],[66.3,9.7],[78.1,14],[88.3,23.5],[93.5,34.9],[94.7,58.4],[86.9,77.1],[77.8,85.7],[66.6,91.3],[41.5,99.4],[33.9,91.7],[19.2,50]],[[9.2,6.6],[15.8,4.5],[84.2,4.5],[90.8,6.6],[95,17.7],[87,67.5],[84.4,75.1],[70.8,86.3],[55.1,89.4],[39,88.8],[23.9,83.7],[17.9,78.4],[13,67.5],[5,17.7]],[[2.6,46.1],[4.7,29.5],[50.1,16.4],[59.1,17.3],[76.7,25.5],[88.1,34.1],[95.5,49.8],[93.3,57.2],[87.6,66.5],[76,74.8],[67.6,77.6],[49.9,79.5],[40,78.4],[4.7,70.4]],[[6.5,56.3],[8.5,36.4],[16.7,18.3],[27.3,9.5],[36.7,6],[56.7,4.8],[75.6,11.2],[83.1,18],[91.5,36.2],[93.4,56.2],[88.5,87.8],[85.7,96.3],[58.2,99.5],[19.3,97.3]],[[2.6,35.6],[16.9,22.4],[33.4,9.3],[54,4.6],[74.7,9.4],[91.2,22.5],[100.2,41.5],[100.2,62.5],[91.1,81.6],[74.7,94.7],[54.1,99.4],[33.4,94.7],[2.6,68.5],[1,54.1]],[[4.2,83.1],[20.9,23.3],[27.6,11.9],[35.1,7.1],[43.8,4.9],[61.5,5.9],[69.6,9.6],[75.7,16],[79.3,24.2],[95.5,81.9],[92.6,91.1],[73.2,97.6],[25.8,97.4],[6.5,90.8]],[[2.7,66.7],[6.9,46.1],[12.6,30.4],[17.5,23.6],[24.1,18.4],[34,15],[42.5,14.6],[54.7,17.8],[89.2,36.6],[95.9,42.9],[98.3,54.9],[95.2,62.5],[72.7,93.3],[11.3,93.2]],[[2.7,23.3],[53.7,4.7],[89.8,37.6],[93.7,42.3],[95.8,45.9],[98.4,53.6],[97,58.4],[93.5,64.6],[90.8,67.7],[87.6,70.3],[84.1,72.4],[49.1,89],[43.3,91.1],[4.7,82.4]],[[2.6,31.5],[53.5,0.8],[53.7,0.7],[90.2,36.8],[94.7,42.9],[97.7,51.1],[98.4,56.4],[95.7,64.7],[90.7,71.8],[87.4,74.6],[81.3,78.2],[45.4,92.5],[43.2,93.3],[4.6,80.5]],[[0.5,54.1],[0.6,23.5],[4.3,18.7],[62.8,20.6],[72,21.7],[80.8,24.7],[88.4,30.1],[95.7,41.8],[98.4,58.8],[96.5,67.8],[88.6,78],[83.3,81],[74,83.9],[47.4,89.4]]],
    SASS: {"5":["Pufferfish! Don’t get too puffed up.","Pufferfish! Looking sharp.","Pufferfish! Blown away."],"6":["Octopus! Eight arms, all clapping.","Octopus! Well armed.","Octopus! Ink-credible."],"7":["Turtle! Shell-ebrate good times.","Turtle! Slow and steady.","Turtle! Shell of a job."],"8":["Shark! Fin-tastic work.","Shark! Jaw-dropping.","Shark! Friendly, we promise."],"9":["Orca! Making a big splash.","Orca! Smart, sleek and on a roll.","Orca! Top of the food chain."],"10":["Blue whale! Having a whale of a time.","Blue whale! Biggest animal ever. Seriously.","Blue whale! Krill-iant."]},
    POPS: ["Two blue whales, one big splash. Gone. +100", "Whale of a merge. Off they swim. +100", "Two whales swam off together. Sweet. +100"],
    DIST: ["🐋", "🐬", "🦈", "🐢", "Less"],
    top: "Top creature", win: "Shark %",
    lede: "Drop sea creatures. Two of a kind merge into the next one up, from plankton to blue whale. Don’t let the pile cross the line.",
    verdict: function (tp) {
      return tp >= 10 ? "A blue whale. Biggest animal ever. Legend of the deep." : tp >= 9 ? "Orca. Sleek, clever, one step from a whale." :
        tp >= 8 ? "Shark. Fin-tastic. Two steps from a whale." : tp >= 7 ? "Turtle. Slow and steady, still swimming." :
        tp >= 5 ? "A decent rock pool. Keep paddling." : "Mostly plankton. Dive back in and try again.";
    },
    W: { e: "🦪", n: "Pearl", r: 19, c: "#F4F0FA" },
    WART: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><circle cx=\"50\" cy=\"52\" r=\"42\" fill=\"#F3EEF8\" stroke=\"#3A2A55\" stroke-width=\"3\"/><path d=\"M18 66 Q28 86 54 90\" stroke=\"#F4C6DA\" stroke-width=\"6\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M68 18 Q84 26 88 44\" stroke=\"#C6DDF4\" stroke-width=\"6\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"33\" cy=\"31\" r=\"8\" fill=\"#FFFFFF\"/><path d=\"M90 2 l2.5 6.5 6.5 2.5 -6.5 2.5 -2.5 6.5 -2.5 -6.5 -6.5 -2.5 6.5 -2.5z\" fill=\"#F5C842\" stroke=\"#3A2A55\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/>" + FACE(50, 60, 1) + "</svg>",
    FACTS: [
      "Tiny ocean plankton make roughly half of the oxygen on Earth.",
      "A snapping shrimp’s claw shoots out a bubble whose pop is one of the loudest sounds in the sea.",
      "Lost a leg? Many crabs regrow it over their next few moults.",
      "All clownfish hatch male. The biggest in a group can switch to female.",
      "Jellyfish have no brain, heart or bones, and have drifted the seas for over 500 million years.",
      "Pufferfish puff up by gulping water into a super-stretchy stomach.",
      "Octopuses have three hearts and blue blood.",
      "Sand temperature decides a sea turtle’s sex: warmer nests hatch more females.",
      "Sharks are older than trees. They’ve been around for about 450 million years.",
      "Despite the ‘killer whale’ nickname, orcas are the biggest members of the dolphin family.",
      "The blue whale is the largest animal known to have ever lived, bigger than any dinosaur."
    ],
    WFACT: "Wild piece! It merges with anything. Oysters make pearls by coating a speck of grit in layer after layer of mother-of-pearl.",
    BIG: "Big splash!", TOOL: { e: "🥅", n: "Net", hint: "Net ready. Tap a creature to scoop it out." }, ANON: "Anonymous sailor",
    REACT: [["Small fry today. Dive back in.", "Shell of a try. Go again."], ["Swimmingly done.", "Not bad for a day at the beach."], ["Fin-tastic run!", "Making waves, you are."]]
  };
  // Outbreak Sunday extras (Normie: an oil slick, cleaned with a sponge). Non-medical wording in Normie.
  MED.OUT = { badge: "🦠 Outbreak Sunday", share: "🦠", hit: "Germ landed! It can’t merge.", spread: "The infection is spreading!", cure: "Immune response!", clear: "Infection cleared! +50", cleared: "Infections cleared", wasted: "Antibiotic wasted. No germs there.", tint: "rgba(96,190,60,.38)", P: { e: "💊", n: "Antibiotic", r: 17, c: "#FDE2E2" },
    ART: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><g transform=\"rotate(-35 50 50)\"><path d=\"M50 14 L30 14 Q8 14 8 50 Q8 86 30 86 L50 86Z\" fill=\"#EF4B4B\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M50 14 L70 14 Q92 14 92 50 Q92 86 70 86 L50 86Z\" fill=\"#FFFFFF\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M22 34 Q24 24 34 22\" stroke=\"#FFA3A3\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/></g>" + FACE(50, 54, 0.9) + "</svg>",
    fact: "Antibiotic! It cures every infected piece it bumps into. Penicillin was discovered by Alexander Fleming in 1928." };
  SEA.OUT = { badge: "🛢️ Slick Sunday", share: "🛢️", hit: "Oil slick! It can’t merge.", spread: "The slick is spreading!", cure: "Clean-up crew!", clear: "Spill cleaned up! +50", cleared: "Slicks cleaned", wasted: "Sponge wasted. Nothing to clean there.", tint: "rgba(40,30,60,.42)", P: { e: "🧽", n: "Sponge", r: 17, c: "#FFF3BF" },
    ART: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M14 22 Q14 12 26 12 L74 12 Q86 12 86 22 L88 80 Q88 90 76 90 L24 90 Q12 90 12 80Z\" fill=\"#F7D24A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M12 74 L88 74\" stroke=\"#3A2A55\" stroke-width=\"3\"/><path d=\"M12 74 L88 74 L88 80 Q88 90 76 90 L24 90 Q12 90 12 80Z\" fill=\"#7CC36A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\"/><circle cx=\"26\" cy=\"26\" r=\"4\" fill=\"#E0B22E\"/><circle cx=\"76\" cy=\"30\" r=\"5\" fill=\"#E0B22E\"/><circle cx=\"30\" cy=\"62\" r=\"3.5\" fill=\"#E0B22E\"/><circle cx=\"74\" cy=\"60\" r=\"3\" fill=\"#E0B22E\"/></svg>".replace("</svg>", FACE(50, 44, 1) + "</svg>"),
    fact: "Sponge! It cleans every slicked creature it bumps into. Real sea sponges are animals, and some have lived for thousands of years." };

  var K = NORMIE ? SEA : MED, O = K.O, ART = K.ART, HULL = K.HULL, SASS = K.SASS, POPS = K.POPS, DIST = K.DIST, OUTK = K.OUT;
  var WILD = O.length, CURE = O.length + 1, WO = K.W, PO = OUTK.P; // special pieces live after the chain: wild (stem cell / pearl) and cure (antibiotic / sponge)
  function info(lv) { return lv === WILD ? WO : lv === CURE ? PO : O[lv]; }
  var IMG = ART.concat([K.WART, OUTK.ART]).map(function (svg) { var im = new Image(); im.src = "data:image/svg+xml," + encodeURIComponent(svg); return im; });
  function pic(i, px) { return '<img class="mrg-pic" src="' + IMG[i].src + '" alt="' + info(i).n + '" width="' + px + '" height="' + px + '">'; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var DEBUG = /[?&]debug=1\b/.test(location.search);
  function quiet() { var r = document.documentElement.getAttribute("data-motion") === "reduce"; try { r = r || matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {} return r; }

  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="mrg-eyebrow">Mergeon</span><span class="hr"><span class="badge" id="mrg-badge"></span><button type="button" class="mute" id="mrg-help" aria-label="How to play">?</button><button type="button" class="mute" id="mrg-mute">🔊</button></span></div>' +
    ' <div class="mbar"><div><span class="lab">Score</span><b id="mrg-score">0</b></div><div><span class="lab">' + K.top + '</span><b id="mrg-top">–</b></div><div class="nx"><span class="lab">Next</span><b id="mrg-next">–</b></div></div>' +
    ' <div class="board" id="mrg-board"><canvas id="mrg-cv" aria-label="Mergeon board. Move to aim, tap or press space to drop."></canvas><div class="toast" id="mrg-toast" hidden></div><div class="combo" id="mrg-combo" hidden></div><div class="fact" id="mrg-fact" role="status" hidden></div><div class="over" id="mrg-over" hidden></div></div>' +
    ' <div class="tbar" id="mrg-tbar"><span class="tgt" id="mrg-tgt"></span><span class="tools" id="mrg-tools"><button type="button" class="tool" id="mrg-cut"></button><button type="button" class="tool" id="mrg-shake">Shake</button></span></div>' +
    ' <div class="chain" id="mrg-chain"></div>' +
    ' <p class="note" id="mrg-mode"></p>' +
    ' <div class="result" id="mrg-result" hidden></div>' +
    ' <p class="note" id="mrg-nextday"></p>' +
    ' <details class="archive" id="mrg-archive"><summary>Past puzzles</summary><div class="alist" id="mrg-alist"></div></details>' +
    "</div>";
  var $ = function (id) { return document.getElementById("mrg-" + id); };
  // ---------- how to play: shown on first visit, and any time from the ? button ----------
  function helpHTML() {
    var thing = NORMIE ? "sea creature" : "organ", things = NORMIE ? "sea creatures" : "organs";
    var chain = O.map(function (o, i) { return i < 11 ? pic(i, 24) : ""; }).join("");
    return '<div class="mrg-help-card" role="dialog" aria-modal="true" aria-labelledby="mrg-help-h"><h2 id="mrg-help-h">How to play Mergeon</h2>' +
      '<p class="mrg-help-chain">' + chain + '</p><ul>' +
      '<li><b>Aim and drop.</b> Move left or right (drag, mouse or arrow keys), then tap or press Space to drop the ' + thing + '.</li>' +
      '<li><b>Two the same merge</b> into the next one up the chain, from ' + O[0].n.toLowerCase() + ' to ' + O[O.length - 1].n.toLowerCase() + '. Bigger merges score more.</li>' +
      '<li><b>Don’t cross the dashed line.</b> If the pile stays above it for a couple of seconds, it’s game over.</li>' +
      '<li><b>Chain reactions:</b> quick merges in a row multiply your points.</li>' +
      '<li><b>' + (NORMIE ? "🥅 Net" : "🔪 Scalpel") + ' ×3:</b> tap it, then tap any ' + thing + ' to remove it. <b>Shake ×1</b> jiggles the board to free stuck ones.</li>' +
      '<li><b>' + (NORMIE ? "🦪 Pearl" : "🧬 Stem cell") + ':</b> a rare wild card that levels up whatever it touches.</li>' +
      '<li><b>Daily run:</b> everyone gets the same drops each day. Your first game counts; after that it’s practice. Hit today’s 🎯 target for a ⭐.</li>' +
      '<li><b>' + (NORMIE ? "Slick Sunday" : "Outbreak Sunday") + ':</b> ' + (NORMIE ? "oil spreads between sea creatures. Merge next to it, net it, or catch a 🧽 sponge." : "germs spread between organs. Merge next to them, use the scalpel, or catch a 💊 antibiotic.") + '</li>' +
      '</ul><button type="button" class="mrg-help-go" id="mrg-help-go">Got it</button></div>';
  }
  function showHelp() {
    var o = document.getElementById("mrg-help-ov"); if (o) o.remove();
    o = document.createElement("div"); o.id = "mrg-help-ov"; o.className = "mrg-help-ov"; o.innerHTML = helpHTML(); document.body.appendChild(o);
    var close = function () { o.remove(); try { localStorage.setItem("mrg-help-seen", "1"); } catch (e) {} };
    o.addEventListener("click", function (e) { if (e.target === o || e.target.id === "mrg-help-go") close(); });
    document.addEventListener("keydown", function k(e) { if (e.key === "Escape") { close(); document.removeEventListener("keydown", k); } });
    var b = document.getElementById("mrg-help-go"); if (b) b.focus();
  }
  document.getElementById("mrg-help").addEventListener("click", showHelp);
  try { if (!localStorage.getItem("mrg-help-seen")) setTimeout(showHelp, 400); } catch (e) {}
  if ($("lede")) $("lede").textContent = K.lede;
  function normFoot() { var ft = document.querySelector("footer.site"); if (ft) Array.prototype.forEach.call(ft.childNodes, function (t) { if (t.nodeType === 3 && /medical/i.test(t.nodeValue)) t.nodeValue = "A bonus game. Just for fun."; }); }
  if (NORMIE) { normFoot(); document.addEventListener("DOMContentLoaded", normFoot); }

  function sydToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function nice(d) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(n) { return n.toLocaleString("en-AU"); }
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  var REAL = sydToday(), qd = new URLSearchParams(location.search).get("date");
  if (DEBUG) { var dq = /[?&]day=(\d{4}-\d\d-\d\d)\b/.exec(location.search); if (dq) REAL = dq[1]; } // test hook: pretend today is another Sydney date
  var day = (qd && /^\d{4}-\d{2}-\d{2}$/.test(qd) && dayNum(qd) <= dayNum(REAL)) ? qd : REAL;
  function isLive() { return day === REAL; }
  function num(d) { return dayNum(d) - dayNum(FIRST) + 1; }
  var SKEY = "mrg-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, hi: 0, dist: [0, 0, 0, 0, 0] });
  var KEY, st;
  var NEWDAY = "2026-11-08"; // new features start with this daily; earlier dailies (incl. 7 Nov) stay exactly as dealt
  function weekday(d) { return (dayNum(d) + 4) % 7; } // 0 = Sunday
  // daily target: deterministic from the date (its own PRNG, never the drop order). Mon–Thu stomach/heart, Fri–Sun lungs/liver.
  function target(d) {
    if (String(d) < NEWDAY) return -1;
    var n = dayNum(d), wd = weekday(d), hard = wd === 0 || wd >= 5, h = mulberry32((n * 2654435761 ^ 0x9E3779B9) >>> 0)();
    return hard ? (h < 0.5 ? 8 : 9) : (h < 0.5 ? 6 : 7);
  }
  function aName(lv) { var n = O[lv].n; return n === "Lungs" ? "a pair of Lungs" : (/^[AEIOU]/.test(n) ? "an " : "a ") + n; }

  // ---------- physics ----------
  var M = window.Matter, E = M.Engine, B = M.Bodies, C = M.Composite, Ev = M.Events, Bd = M.Body;
  var engine, rnd, queue, cur, nxt, aimX = W / 2, canDrop, score, top, practice, over, toastT, merges, lastT, acc, raf;
  var NEW, OUT, srnd, irnd, chain, lastMT, bestChain, tgt, tgtHit, wildUsed, shakeLeft, cuts, arm, parts = [], nextBeat = 0, drops, steps, infN, infCleared, comboT;
  var cv = $("cv"), ctx = cv.getContext("2d"), dpr = 1, scale = 1;

  var NOREP = true; // never the same piece twice in a row (from 8 Nov 2026; today's daily kept as dealt)
  // from 8 Nov 2026: the five smallest drop evenly (18.6% each, like Suika), plus rare bladder 3%, stomach 2%, heart 1% and a wild piece 1%.
  // Outbreak Sundays also drop a cure 3%, taken evenly from the five smallest (18% each).
  var ODDS = [0.186, 0.186, 0.186, 0.186, 0.186, 0.03, 0.02, 0.01, 0.01], ODDS_OUT = [0.18, 0.18, 0.18, 0.18, 0.18, 0.03, 0.02, 0.01, 0.01, 0.03];
  function roll1() {
    var x = rnd();
    if (!NOREP) return x < 0.3 ? 0 : x < 0.57 ? 1 : x < 0.77 ? 2 : x < 0.92 ? 3 : 4; // older dailies keep their original odds
    var od = OUT ? ODDS_OUT : ODDS;
    for (var i = 0, c = 0; i < od.length; i++) { c += od[i]; if (x < c) return i === 8 ? WILD : i === 9 ? CURE : i; }
    return 0;
  }
  function roll(prev) { var v = roll1(), n = 0; if (NOREP && prev !== undefined) while (v === prev && n++ < 20) v = roll1(); return v; }
  function newRun(isPractice) {
    practice = !!isPractice; over = false; score = 0; top = -1; merges = []; canDrop = true;
    rnd = mulberry32(isPractice ? (Math.random() * 4294967296) >>> 0 : dayNum(day) * 2654435761 >>> 0);
    NOREP = practice || String(day) >= NEWDAY; NEW = NOREP; OUT = NEW && weekday(day) === 0;
    // separate PRNGs for the shake and infections, so the drop order never changes
    var seed2 = isPractice ? (Math.random() * 4294967296) >>> 0 : (dayNum(day) * 2246822519) >>> 0;
    srnd = mulberry32((seed2 ^ 0x5BD1E995) >>> 0); irnd = mulberry32((seed2 ^ 0x27D4EB2F) >>> 0);
    chain = 0; lastMT = -1e9; bestChain = 1; tgt = target(day); tgtHit = false; wildUsed = false;
    shakeLeft = NEW ? 1 : 0; cuts = NEW ? 3 : 0; arm = false; parts = []; nextBeat = 0; drops = 0; steps = 0; infN = 0; infCleared = 0;
    engine = E.create(); engine.gravity.y = 1.15; engine.positionIterations = 8; engine.velocityIterations = 6;
    var opt = { isStatic: true, friction: 0.2, restitution: 0.1, label: "wall" };
    C.add(engine.world, [B.rectangle(W / 2, H + WALL / 2, W + WALL * 2, WALL, opt), B.rectangle(-WALL / 2, H / 2, WALL, H * 2, opt), B.rectangle(W + WALL / 2, H / 2, WALL, H * 2, opt)]);
    Ev.on(engine, "collisionStart", onHit); Ev.on(engine, "collisionActive", onHit);
    cur = roll(); nxt = roll(cur);
    $("over").hidden = true; $("result").hidden = !(!practice && st.done); hud();
    $("mode").textContent = practice ? "Practice run. Doesn’t count. Nobody’s watching." : (isLive() ? "Today’s run. Same drop order for everyone. One shot counts." : "Archive run for " + nice(day) + ". Same drops as that day.");
    $("badge").textContent = practice ? "Practice" : ""; lastT = 0; acc = 0;
    tbarUI(); size();
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function pieces() { return C.allBodies(engine.world).filter(function (o) { return o.lv !== undefined && !o.gone; }); }
  function touching(a, b, pad) { var dx = a.position.x - b.position.x, dy = a.position.y - b.position.y, r = info(a.lv).r + info(b.lv).r + (pad || 3); return dx * dx + dy * dy < r * r; }
  function onHit(ev) {
    ev.pairs.forEach(function (p) {
      var a = p.bodyA, b = p.bodyB;
      if (a.lv === undefined || b.lv === undefined || a.gone || b.gone) return;
      if (a.lv === CURE || b.lv === CURE) { var c = a.lv === CURE ? a : b; c.gone = true; merges.push([c, c, "cure"]); return; }
      if (a.inf || b.inf) return; // infected pieces can't merge
      if (a.lv === WILD || b.lv === WILD) { if (a.lv === b.lv) return; a.gone = b.gone = true; merges.push(a.lv === WILD ? [b, a, "wild"] : [a, b, "wild"]); return; }
      if (a.lv !== b.lv) return;
      a.gone = b.gone = true; merges.push([a, b]);
    });
  }
  function doMerges() {
    var now = performance.now();
    merges.forEach(function (m) {
      var a = m[0], b = m[1], kind = m[2];
      if (kind === "cure") { useCure(a); return; }
      var lv = a.lv, wild = kind === "wild";
      // a merge next to an infected piece cures it
      if (infN) pieces().forEach(function (q) { if (q.inf && (touching(q, a, 6) || touching(q, b, 6))) cureOne(q, OUTK.cure); });
      C.remove(engine.world, a); C.remove(engine.world, b);
      if (wild) wildUsed = true;
      var x = wild ? a.position.x : (a.position.x + b.position.x) / 2, y = wild ? a.position.y : (a.position.y + b.position.y) / 2;
      chain = now - lastMT <= 1200 ? chain + 1 : 1; lastMT = now; if (chain > bestChain) bestChain = chain;
      var pts, n = lv + 1, big = lv === O.length - 1;
      if (big) { pts = 100; score += pts; toast(pick(POPS)); confetti(); sfx("big"); }
      else {
        var o = add(n, x, y), v = wild ? a.velocity : { x: (a.velocity.x + b.velocity.x) / 2, y: Math.min(a.velocity.y, b.velocity.y) };
        Bd.setVelocity(o, { x: v.x, y: Math.min(v.y, 0) - 1 });
        o.born = now; pts = (n + 1) * (n + 2) / 2; score += pts;
        if (n > top) { top = n; if (SASS[n]) toast(pick(SASS[n])); }
        collect(n);
        if (tgt >= 0 && n === tgt && !tgtHit) hitTarget();
      }
      var L = Math.min(n, O.length - 1);
      burst(x, y, L); floatTxt(x, y - 12, "+" + pts);
      if (!big) sfx("pop", L);
      if (L >= 7) { shakeBoard(L >= 9 ? 2 : 1); buzz(L >= 9 ? [30, 40, 30] : 25); }
      if (chain > 1) { var bonus = NEW ? pts * (chain - 1) : 0; score += bonus; combo(chain, bonus); }
    });
    if (merges.length) hud();
    merges = [];
  }
  function add(lv, x, y) {
    var r = info(lv).r, opt = { restitution: 0.1, friction: 0.12, frictionAir: 0.004, density: 0.0012 + (lv < O.length ? lv : 0) * 0.0002, slop: 0.01 }, o = null, off = { x: 0, y: 0 };
    if (HULL[lv]) try {
      var vs = HULL[lv].map(function (q) { return { x: (q[0] - 50) * r / 50, y: (q[1] - 50) * r / 50 }; });
      var c = M.Vertices.centre(vs); off = { x: -c.x, y: -c.y };
      o = B.fromVertices(x, y, [vs], opt);
    } catch (e) { o = null; }
    if (!o) { o = B.circle(x, y, r, opt); off = { x: 0, y: 0 }; }
    o.lv = lv; o.off = off; o.overT = 0; C.add(engine.world, o); return o;
  }
  function drop() {
    if (!canDrop || over || arm) return;
    var r = info(cur).r, x = Math.max(r + 1, Math.min(W - r - 1, aimX));
    var o = add(cur, x, DROP_Y); o.fresh = performance.now();
    collect(cur);
    if (cur < O.length && cur > top) top = cur;
    cur = nxt; nxt = roll(cur); canDrop = false; hud(); sfx("drop");
    setTimeout(function () { canDrop = true; }, 260);
    drops++;
    if (OUT && (drops === 15 || (drops > 15 && (drops - 15) % 20 === 0))) infect(o);
  }
  // ---------- Outbreak Sunday ----------
  function infect(skip) {
    if (infN >= 3) return;
    var c = pieces().filter(function (q) { return q !== skip && !q.inf && q.lv < O.length; });
    if (!c.length) return;
    c.sort(function (p, q) { return q.lv - p.lv || p.id - q.id; }); // highest level, ties by lowest index
    setInf(c[0], true); toast(OUTK.hit); sfx("germ");
  }
  function spread() {
    if (infN >= 3 || !infN) return;
    var all = pieces(), cand = [];
    all.forEach(function (q) { if (!q.inf || q.lv >= O.length) return; all.forEach(function (t) { if (!t.inf && t.lv < O.length && t !== q && touching(q, t, 4) && cand.indexOf(t) < 0) cand.push(t); }); });
    if (!cand.length) return;
    cand.sort(function (p, q) { return p.id - q.id; });
    setInf(cand[Math.floor(irnd() * cand.length)], true); toast(OUTK.spread); sfx("germ");
  }
  function setInf(q, on) { if (!!q.inf === on) return; q.inf = on; infN += on ? 1 : -1; }
  function cureOne(q, msg) {
    if (!q.inf) return;
    setInf(q, false); infCleared++; burst(q.position.x, q.position.y, 3); if (msg) toast(msg); sfx("chime");
    if (!infN) { score += 50; toast(OUTK.clear); floatTxt(q.position.x, q.position.y - 14, "+50"); hud(); }
  }
  function useCure(c) {
    var n = 0, wasInf = infN;
    pieces().forEach(function (q) { if (q !== c && q.inf && touching(q, c, 10)) { setInf(q, false); infCleared++; n++; burst(q.position.x, q.position.y, 3); } });
    C.remove(engine.world, c); poof(c.position.x, c.position.y, PO.r);
    if (n && !infN && wasInf) { score += 50; toast(OUTK.clear); hud(); } else toast(n ? OUTK.cure : OUTK.wasted);
    sfx(n ? "chime" : "snip");
  }
  function checkOver(now) {
    var bodies = C.allBodies(engine.world), danger = 0;
    for (var i = 0; i < bodies.length; i++) {
      var o = bodies[i]; if (o.lv === undefined || o.gone) continue;
      if (o.fresh && now - o.fresh < 1500) continue;
      if (o.position.y - info(o.lv).r < LINE) { o.overT = o.overT || now; danger = Math.max(danger, 0.001, (now - o.overT) / 1800); if (now - o.overT > 1800) { end(); return 1; } }
      else o.overT = 0;
    }
    return danger;
  }
  function loop(t) {
    raf = requestAnimationFrame(loop);
    if (!engine) return;
    if (!lastT) lastT = t;
    var dt = Math.min(100, t - lastT); lastT = t;
    var danger = 0, now = performance.now();
    if (!over) {
      acc += dt;
      while (acc >= 1000 / 60) { E.update(engine, 1000 / 60); doMerges(); acc -= 1000 / 60; steps++; if (OUT && infN && steps % 600 === 0) spread(); }
      danger = checkOver(now);
      // danger tension: a heartbeat (Normie: a sonar ping) that speeds up the longer a piece sits over the line
      if (danger && !over) { if (now >= nextBeat) { sfx(NORMIE ? "sonar" : "beat"); nextBeat = now + (NORMIE ? 1100 - 650 * Math.min(1, danger) : 900 - 560 * Math.min(1, danger)); } }
      else nextBeat = 0;
    }
    draw(danger, dt, now);
  }

  // ---------- drawing ----------
  function size() {
    var b = $("board"); b.style.maxWidth = "";
    var w = b.clientWidth || 360;
    // fit the whole game on screen: board height limited by the viewport (leave room for the rows under the board)
    var vh = window.innerHeight || 700, top0 = b.getBoundingClientRect().top + (window.pageYOffset || 0), below = 96;
    try { var cb = $("chain").getBoundingClientRect(), bb = b.getBoundingClientRect(); if (cb.height) below = cb.bottom - bb.bottom + 12; } catch (e) {}
    var room = vh - top0 - below;
    if (room > 200 && w * H / W > room) { w = Math.floor(room * W / H); b.style.maxWidth = (w + 4) + "px"; }
    scale = w / W; dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    cv.style.width = w + "px"; cv.style.height = Math.round(H * scale) + "px";
    cv.width = Math.round(w * dpr); cv.height = Math.round(H * scale * dpr);
  }
  var EMF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  function organ(lv, x, y, ang, alpha, off) {
    var o = info(lv);
    ctx.save(); ctx.globalAlpha = alpha || 1; ctx.translate(x, y); ctx.rotate(ang || 0); if (off) ctx.translate(off.x, off.y);
    var im = IMG[lv];
    if (im.complete && im.naturalWidth) { var d = o.r * 2 * 108 / 100; ctx.drawImage(im, -d / 2, -d / 2, d, d); }
    else { ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fillStyle = o.c; ctx.fill(); ctx.font = Math.round(o.r * 1.15) + "px " + EMF; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(o.e, 0, o.r * 0.06); }
    ctx.restore();
  }
  function aura(lv, x, y, now) { // a glowing ring marks the special pieces
    var r = info(lv).r + 4; ctx.save(); ctx.lineWidth = 3; ctx.setLineDash([6, 5]); ctx.lineDashOffset = quiet() ? 0 : -now / 40;
    ctx.strokeStyle = lv === WILD ? "hsl(" + (quiet() ? 280 : (now / 8) % 360) + ",80%,60%)" : (NORMIE ? "#E0B22E" : "#EF4B4B");
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  function germ(o) { // infected look: tint + a small badge (Medical: a spiky germ; Normie: an oil drop)
    var r = info(o.lv).r, x = o.position.x, y = o.position.y;
    ctx.save(); ctx.fillStyle = OUTK.tint; ctx.beginPath(); ctx.arc(x, y, r * 0.92, 0, Math.PI * 2); ctx.fill();
    var bx = x + r * 0.55, by = y - r * 0.55, s = Math.max(8, Math.min(14, r * 0.3));
    ctx.translate(bx, by); ctx.lineWidth = 2; ctx.strokeStyle = "#3A2A55";
    if (NORMIE) { ctx.fillStyle = "#1E1A2B"; ctx.beginPath(); ctx.moveTo(0, -s * 1.2); ctx.quadraticCurveTo(s, 0, s * 0.8, s * 0.4); ctx.arc(0, s * 0.4, s * 0.8, 0, Math.PI); ctx.quadraticCurveTo(-s, 0, 0, -s * 1.2); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#8C86A8"; ctx.beginPath(); ctx.arc(-s * 0.3, s * 0.2, s * 0.22, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.fillStyle = "#6CC04A"; ctx.beginPath(); for (var i = 0; i < 16; i++) { var a = i * Math.PI / 8, rr = i % 2 ? s * 0.75 : s * 1.15; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#2A1E3D"; ctx.beginPath(); ctx.arc(-s * 0.28, -s * 0.1, s * 0.14, 0, Math.PI * 2); ctx.arc(s * 0.28, -s * 0.1, s * 0.14, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  function draw(danger, dt, now) {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.fillStyle = dark ? "#211B2E" : "#FFFFFF"; ctx.fillRect(0, 0, W, H);
    var pulse = danger ? (quiet() ? 1 : 0.5 + 0.5 * Math.sin(now / (130 - 60 * Math.min(1, danger)))) : 0;
    if (danger) { ctx.fillStyle = "rgba(208,87,62," + (0.05 + 0.09 * pulse) + ")"; ctx.fillRect(0, 0, W, LINE); }
    ctx.save(); ctx.setLineDash([8, 8]); ctx.lineWidth = danger ? 2 + 2 * pulse : 2;
    ctx.strokeStyle = danger ? "rgba(208,87,62," + (0.55 + 0.45 * pulse) + ")" : (dark ? "rgba(180,168,207,.5)" : "rgba(107,90,147,.35)");
    ctx.beginPath(); ctx.moveTo(0, LINE); ctx.lineTo(W, LINE); ctx.stroke(); ctx.restore();
    if (!over && engine) {
      var r = info(cur).r, x = Math.max(r + 1, Math.min(W - r - 1, aimX));
      if (canDrop && !arm) { ctx.save(); ctx.strokeStyle = dark ? "rgba(180,168,207,.35)" : "rgba(107,90,147,.25)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, DROP_Y + r); ctx.lineTo(x, H); ctx.stroke(); ctx.restore(); }
      organ(cur, x, DROP_Y, 0, 1); // always full opacity: no blink after a drop
      if (cur >= O.length) aura(cur, x, DROP_Y, now);
    }
    if (engine) C.allBodies(engine.world).forEach(function (o) {
      if (o.lv === undefined || o.gone) return;
      if (o.born) {
        var k = (now - o.born) / 340;
        if (k >= 1) o.born = 0;
        else {
          var sx, sy;
          if (quiet()) { sx = sy = 0.75 + 0.25 * Math.min(1, k * 2); }
          else { var g = 0.6 + 0.4 * Math.min(1, k * 2.2), w = 0.2 * Math.sin(k * Math.PI * 3) * (1 - k); sx = g * (1 + w); sy = g * (1 - w); } // squash-and-bounce
          ctx.save(); ctx.translate(o.position.x, o.position.y); ctx.scale(sx, sy); organ(o.lv, 0, 0, o.angle, 1, o.off); ctx.restore();
          if (o.inf) germ(o);
          return;
        }
      }
      organ(o.lv, o.position.x, o.position.y, o.angle, 1, o.off);
      if (o.lv >= O.length) aura(o.lv, o.position.x, o.position.y, now);
      if (o.inf) germ(o);
      if (arm) { ctx.save(); ctx.strokeStyle = "rgba(208,87,62,.55)"; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(o.position.x, o.position.y, info(o.lv).r * 0.95, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    });
    drawParts(dt || 16);
  }
  // ---------- particles: sparkles, confetti, poofs, floating points ----------
  var SPK = ["#F5C842", "#FF7A9A", "#5EC8F2", "#B48CF0", "#7CC36A"];
  function burst(x, y, lv) {
    var n = (quiet() ? 4 : 8) + lv * (quiet() ? 1 : 3);
    for (var i = 0; i < n; i++) { var a = Math.random() * Math.PI * 2, sp = 1.2 + Math.random() * (1.8 + lv * 0.35); parts.push({ k: "s", x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.6, g: 0.05, t: 0, max: 420 + lv * 30 + Math.random() * 220, c: pick(SPK), sz: 3 + lv * 0.45 + Math.random() * 3 }); }
  }
  function confetti() {
    var n = quiet() ? 24 : 80, cols = NORMIE ? ["#5EC8F2", "#BFDCFA", "#FFFFFF", "#4A8AE0", "#7ED9C8"] : SPK.concat(["#F5A9C8"]);
    for (var i = 0; i < n; i++) parts.push({ k: "r", x: Math.random() * W, y: -10 - Math.random() * 60, vx: (Math.random() - 0.5) * 2, vy: 1 + Math.random() * 2.5, g: 0.03, t: 0, max: 1600 + Math.random() * 900, c: pick(cols), sz: 5 + Math.random() * 5, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3 });
    toastBig(K.BIG);
  }
  function poof(x, y, r) { for (var i = 0; i < 10; i++) { var a = i * Math.PI / 5; parts.push({ k: "c", x: x + Math.cos(a) * r * 0.4, y: y + Math.sin(a) * r * 0.4, vx: Math.cos(a) * 0.8, vy: Math.sin(a) * 0.8, g: 0, t: 0, max: 420, c: "rgba(150,140,170,1)", sz: r * 0.35 }); } }
  function floatTxt(x, y, s) { parts.push({ k: "t", x: x, y: y, vx: 0, vy: -0.7, g: 0, t: 0, max: 800, c: "#3A2A55", txt: s }); }
  function drawParts(dt) {
    var f = dt / 16.67, dark = document.documentElement.getAttribute("data-theme") === "dark";
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.t += dt; if (p.t >= p.max) { parts.splice(i, 1); continue; }
      p.vy += p.g * f; p.x += p.vx * f; p.y += p.vy * f; var al = 1 - p.t / p.max;
      ctx.save(); ctx.globalAlpha = Math.max(0, al); ctx.fillStyle = p.c;
      if (p.k === "s") { var s = p.sz; ctx.translate(p.x, p.y); ctx.beginPath(); ctx.moveTo(0, -s); ctx.quadraticCurveTo(0, 0, s, 0); ctx.quadraticCurveTo(0, 0, 0, s); ctx.quadraticCurveTo(0, 0, -s, 0); ctx.quadraticCurveTo(0, 0, 0, -s); ctx.fill(); }
      else if (p.k === "r") { p.a += p.va * f; ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillRect(-p.sz / 2, -p.sz / 4, p.sz, p.sz / 2); }
      else if (p.k === "c") { ctx.globalAlpha = al * 0.6; ctx.beginPath(); ctx.arc(p.x, p.y, p.sz * (1 + p.t / p.max), 0, Math.PI * 2); ctx.fill(); }
      else { ctx.font = "700 20px Poppins,system-ui,sans-serif"; ctx.textAlign = "center"; ctx.lineWidth = 4; ctx.strokeStyle = dark ? "#211B2E" : "#FFFFFF"; ctx.strokeText(p.txt, p.x, p.y); ctx.fillStyle = dark ? "#F1ECF8" : "#3A2A55"; ctx.fillText(p.txt, p.x, p.y); }
      ctx.restore();
    }
  }
  function shakeBoard(k) { if (quiet()) return; var b = $("board"); b.classList.remove("shk1", "shk2"); void b.offsetWidth; b.classList.add(k > 1 ? "shk2" : "shk1"); }
  function hud() {
    $("score").textContent = fmt(score);
    $("top").innerHTML = top >= 0 ? pic(top, 22) + " " + O[top].n : "–";
    $("next").innerHTML = pic(nxt, 26);
  }
  function toast(m) {
    var t = $("toast"); t.textContent = m; t.hidden = false; t.classList.remove("on"); void t.offsetWidth; t.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2200);
  }
  function combo(n, bonus) {
    var c = $("combo"); c.textContent = "Chain reaction! ×" + n + (bonus ? " +" + fmt(bonus) : "");
    c.hidden = false; c.classList.remove("on", "big"); void c.offsetWidth; c.classList.add("on");
    sfx("combo", n); clearTimeout(comboT); comboT = setTimeout(function () { c.hidden = true; }, 1000);
  }
  function toastBig(m) { var c = $("combo"); c.textContent = m; c.hidden = false; c.classList.remove("on"); void c.offsetWidth; c.classList.add("on", "big"); clearTimeout(comboT); comboT = setTimeout(function () { c.hidden = true; }, 1300); }
  function hitTarget() {
    tgtHit = true; tbarUI(); sfx("target"); buzz([20, 30, 20]);
    toast(practice ? "Target hit! (Practice, so no ⭐)" : "Target hit! ⭐ " + O[tgt].n);
  }
  function tbarUI() {
    var t = $("tgt"), on = tgt >= 0, html = "";
    if (OUT) html += '<span class="ob">' + OUTK.badge + "</span> ";
    if (on) html += tgtHit ? '<span class="hit">⭐ Target hit: ' + esc(O[tgt].n) + (practice ? " (practice)" : "") + "</span>"
      : "🎯 " + (practice ? "Practice target" : OUT ? "Target" : "Today’s target") + ": make " + esc(aName(tgt));
    t.innerHTML = html; t.title = on ? "Today’s target: make " + aName(tgt) : "";
    $("tools").hidden = !NEW;
    var c = $("cut"); c.textContent = K.TOOL.e + " " + cuts; c.disabled = !cuts || over; c.classList.toggle("on", arm);
    c.setAttribute("aria-label", arm ? K.TOOL.n + " ready. Tap a piece, or tap here to cancel" : K.TOOL.n + ": " + cuts + " left"); c.title = K.TOOL.n + " (" + cuts + " left)";
    var s = $("shake"); s.textContent = shakeLeft ? "Shake" : "Shaken"; s.disabled = !shakeLeft || over;
    $("tbar").hidden = !NEW && !on && !OUT;
    cv.classList.toggle("arm", !!arm);
  }
  // ---------- first-time unlocks: a fact card and the chain row lights up ----------
  var CKEY = "mrg-coll-" + (NORMIE ? "sea" : "med"), coll = load(CKEY, {}), factQ = [], factOn = false, factT;
  function ck(lv) { return lv === WILD ? "w" : lv === CURE ? "c" : String(lv); }
  function chainRow() { $("chain").innerHTML = O.map(function (o, i) { return '<span id="mrg-c' + i + '" class="' + (coll[i] ? "" : "dim") + '" title="' + o.n + (coll[i] ? "" : " (not made yet)") + '">' + pic(i, 27) + "</span>" + (i < O.length - 1 ? "<i>›</i>" : ""); }).join(""); }
  chainRow();
  function collect(lv) {
    var k = ck(lv); if (coll[k]) return;
    coll[k] = 1; put(CKEY, coll);
    var c = $("c" + lv); if (c) { c.classList.remove("dim"); c.title = info(lv).n; if (!quiet()) { c.classList.remove("lit"); void c.offsetWidth; c.classList.add("lit"); } }
    factQ.push(lv); if (!factOn) nextFact();
  }
  function nextFact() {
    var f = $("fact"); clearTimeout(factT);
    if (!factQ.length) { factOn = false; f.hidden = true; return; }
    var lv = factQ.shift(), tx = lv === WILD ? K.WFACT : lv === CURE ? OUTK.fact : K.FACTS[lv];
    factOn = true; f.innerHTML = pic(lv, 32) + "<div><b>New: " + esc(info(lv).n) + "</b><span>" + esc(tx) + "</span></div>";
    f.hidden = false; f.classList.remove("on"); void f.offsetWidth; f.classList.add("on"); sfx("chime");
    factT = setTimeout(nextFact, 3000);
  }
  $("fact").addEventListener("pointerdown", function (e) { e.stopPropagation(); e.preventDefault(); nextFact(); });
  // ---------- power-ups: scalpel (Normie: net) and shake ----------
  $("cut").onclick = function () { if (!cuts || over) return; arm = !arm; if (arm) { toast(K.TOOL.hint); factQ = []; nextFact(); } tbarUI(); this.blur(); };
  $("shake").onclick = function () { doShake(); this.blur(); };
  function cutAt(px, py) {
    var bs = pieces(), hit = null, best = 1e9;
    bs.forEach(function (o) { var dx = o.position.x - px, dy = o.position.y - py, d = Math.sqrt(dx * dx + dy * dy) - info(o.lv).r; if (d < 12 && d < best) { best = d; hit = o; } });
    if (!hit) return false;
    hit.gone = true; if (hit.inf) { setInf(hit, false); infCleared++; if (!infN) { score += 50; toast(OUTK.clear); } }
    C.remove(engine.world, hit); cuts--; arm = false; poof(hit.position.x, hit.position.y, info(hit.lv).r);
    sfx("snip"); buzz(12); tbarUI(); hud(); return true;
  }
  function doShake() {
    if (!shakeLeft || over || !engine) return;
    shakeLeft = 0; var now = performance.now();
    pieces().forEach(function (o) {
      var k = 1 / Math.sqrt(1 + (o.lv < O.length ? o.lv : 0) * 0.3);
      Bd.setVelocity(o, { x: o.velocity.x + (srnd() - 0.5) * 7 * k, y: o.velocity.y - (2.5 + srnd() * 3) * k });
      Bd.setAngularVelocity(o, o.angularVelocity + (srnd() - 0.5) * 0.1);
      o.fresh = now; o.overT = 0;
    });
    shakeBoard(2); sfx("rumble"); buzz([20, 30, 20]); tbarUI();
  }

  // ---------- end of run ----------
  var verdict = K.verdict;
  function band(tp) { return tp >= 10 ? 0 : tp >= 9 ? 1 : tp >= 8 ? 2 : tp >= 7 ? 3 : 4; }
  function gridOf(tp) { return O.map(function (o, i) { return i <= tp ? o.e : "⬜"; }).join(""); }
  function end() {
    over = true; arm = false; tbarUI();
    var prevHi = stats.hi || 0, best = score > prevHi && prevHi > 0;
    sfx("over"); factQ = []; nextFact();
    var ov = $("over"), rq = K.REACT[top >= 8 ? 2 : top >= 6 ? 1 : 0];
    ov.innerHTML = (best ? '<p class="best">🏆 Best ever!</p>' : "") +
      '<div class="react">' + pic(top >= 0 ? top : 0, 56) + '<span class="bub">' + esc(pick(rq)) + "</span></div>" +
      "<b>Game over</b><span>" + fmt(score) + " points · " + (top >= 0 ? pic(top, 22) + " " + O[top].n : "") + "</span>" +
      (OUT ? "<span>" + OUTK.cleared + ": " + infCleared + "</span>" : "");
    ov.hidden = false;
    if (best) { burst(W / 2, H / 3, 8); sfx("target"); }
    if (!practice && !st.done) {
      st = { done: true, win: top >= WIN_LV - 1, score: score, top: top, tgt: tgt, star: tgtHit, chain: bestChain, wild: wildUsed, out: OUT, cleared: infCleared }; put(KEY, st);
      if (isLive() && stats.last !== day) {
        var consecutive = stats.last && dayNum(day) - dayNum(stats.last) === 1;
        stats.played++; if (st.win) stats.wins++;
        stats.streak = consecutive ? stats.streak + 1 : 1; stats.best = Math.max(stats.best, stats.streak);
        stats.dist[band(top)]++; stats.last = day;
      }
      stats.hi = Math.max(stats.hi || 0, score); put(SKEY, stats);
      renderResult(); renderArchive();
    } else if (practice) {
      if (score > (stats.hi || 0)) { stats.hi = score; put(SKEY, stats); }
      var r = $("result"); r.hidden = false;
      if (!st.done) renderResult();
      else renderResult(score);
    }
    setTimeout(function () { $("result").scrollIntoView({ behavior: "smooth", block: "start" }); }, 900);
  }
  function shareText() {
    var s = st.score, tp = st.top;
    var grid = gridOf(tp) + (st.wild ? " " + WO.e : "") + (st.out ? " " + OUTK.share : "") + (st.star ? " ⭐" : "");
    return "Mergeon #" + num(day) + (isLive() ? "" : " (archive)") + " " + (tp >= 0 ? O[tp].e : "") + "\n" + grid + "\nScore " + fmt(s) + " · " + K.top + ": " + (tp >= 0 ? O[tp].n : "none") + (st.chain > 1 ? " · Chain ×" + st.chain : "") + "\nmaladywise.com";
  }
  function renderResult(practiceScore) {
    var r = $("result"), s = st.score, tp = st.top;
    var share = shareText();
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0;
    r.hidden = false;
    r.innerHTML = (practiceScore !== undefined ? '<p class="prac">Practice: <b>' + fmt(practiceScore) + "</b> · " + (practiceScore > s ? "Better than your real run. Typical." : "Your daily run still stands.") + "</p>" : "") +
      '<p class="em-row">' + pic(tp >= 0 ? tp : 0, 64) + '</p><p class="score">' + fmt(s) + '<span> pts</span></p><p class="verdict">' + esc(verdict(tp)) + "</p>" +
      (st.tgt >= 0 ? '<p class="note">' + (st.star ? "⭐ Today’s target hit: " : "🎯 Today’s target missed: ") + esc(O[st.tgt].n) + (st.out ? " · " + OUTK.cleared + ": " + (st.cleared || 0) : "") + "</p>" : "") +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>' + K.win + '</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + fmt(stats.hi || 0) + "</b><span>High score</span></div></div>" +
      '<pre id="mrg-share">' + esc(share) + '</pre><div class="btns"><button class="btn solid" type="button" id="mrg-copy">Copy result</button><button class="btn" type="button" id="mrg-again">Practice run</button></div>';
    r.appendChild(lbBox); lbRender();
    $("copy").onclick = function () {
      var b = this;
      function selx() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, selx); } catch (e) { selx(); }
    };
    $("again").onclick = function () { newRun(true); root.scrollIntoView({ behavior: "smooth" }); };
  }
  function tick() {
    function f() {
      try {
        var v = {}; new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(new Date()).forEach(function (x) { v[x.type] = +x.value; });
        var left = 86400 - ((v.hour % 24) * 3600 + v.minute * 60 + v.second);
        $("nextday").textContent = "New drop order in " + Math.floor(left / 3600) + "h " + Math.floor(left % 3600 / 60) + "m. Midnight, Sydney time.";
      } catch (e) { $("nextday").textContent = "New drop order every day at midnight, Sydney time."; }
    }
    f(); setInterval(f, 30000);
  }

  // ---------- world leaderboards (Malady Wise counter server): today's daily (mdaily) and all-time (mall) ----------
  // Used ONLY once the server echoes board === "mdaily": an older server maps unknown boards to Basil + Clover's "all", so until then nothing shows or posts.
  var LB = "https://mw-presence.onrender.com", MLB = false, lbs = { mdaily: null, mall: null }, lbTab = "mdaily";
  var lbBox = document.createElement("div"); lbBox.className = "lb"; lbBox.hidden = true;
  lbBox.innerHTML = '<div class="lbtabs" role="tablist"><button type="button" data-b="mdaily">Today’s top 10</button><button type="button" data-b="mall">All-time</button></div>' +
    '<form class="lbform" hidden><input maxlength="14" autocomplete="nickname" placeholder="Nickname (not your real name)" aria-label="Nickname for the world board (not your real name)"><button class="btn solid" type="submit">Post score</button></form><ol></ol><p class="note"></p>';
  var lbQ = function (s) { return lbBox.querySelector(s); };
  function pid() { var p = load("mrg-pid", null); if (!p || p.length < 8) { p = (Math.random().toString(36) + Math.random().toString(36)).replace(/[^a-z0-9]/g, "").slice(0, 12); put("mrg-pid", p); } return p; }
  function lbCan() { return MLB && st && st.done && isLive() && !st.posted && st.score > 0; }
  function lbGot(k, j) {
    var ok = !!(j && Array.isArray(j.rows) && j.board === k);
    if (j && !ok) MLB = false; // the server doesn't know Mergeon's boards (yet, or any more)
    lbs[k] = ok ? j.rows : "err"; lbRender();
  }
  function lbFetch(k) { if (!window.fetch) return; lbs[k] = "wait"; fetch(LB + "/top?b=" + k + "&id=" + pid(), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) { lbGot(k, j); }).catch(function () { lbGot(k, null); }); }
  function lbProbe() {
    if (!window.fetch) return;
    fetch(LB + "/top?b=mdaily&id=" + pid(), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.board === "mdaily" && Array.isArray(j.rows)) { MLB = true; lbs.mdaily = j.rows; lbFetch("mall"); lbRender(); }
    }).catch(function () {});
  }
  function lbPost(n) {
    if (!lbCan()) return;
    st.posted = true; put(KEY, st); put("mrg-name", n);
    ["mdaily", "mall"].forEach(function (k) {
      lbs[k] = "wait";
      var u = LB + "/score?b=" + k + "&id=" + pid() + "&n=" + encodeURIComponent(n) + "&s=" + Math.round(st.score) + "&r=" + Math.max(0, Math.min(10, st.top));
      fetch(u, { method: "POST", cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) { lbGot(k, j); }).catch(function () { lbGot(k, null); });
    });
    lbRender();
  }
  function lbRender() {
    if (!MLB || !isLive() || !st || !st.done) { lbBox.hidden = true; return; }
    lbBox.hidden = false;
    Array.prototype.forEach.call(lbBox.querySelectorAll(".lbtabs button"), function (b) { var on = b.getAttribute("data-b") === lbTab; b.classList.toggle("on", on); b.setAttribute("aria-selected", on ? "true" : "false"); });
    var f = lbQ(".lbform"), inp = lbQ("input"); f.hidden = !lbCan();
    if (!f.hidden && !inp.value) inp.value = load("mrg-name", null) || load("mw-organdrop-name", null) || load("mw-basil-name", null) || "";
    var rows = lbs[lbTab], el = lbQ("ol"), note = lbQ(".note");
    note.textContent = "";
    if (rows == null || rows === "wait") { el.innerHTML = '<li class="none">Loading…</li>'; if (rows == null) lbFetch(lbTab); return; }
    if (rows === "err") { el.innerHTML = '<li class="none">The leaderboard is on a break. Try again later.</li>'; return; }
    if (!rows.length) { el.innerHTML = '<li class="none">No scores yet. Be the first.</li>'; return; }
    var mine = -1;
    el.innerHTML = rows.map(function (r, i) { if (r.me && mine < 0) mine = i; var lv = Math.max(0, Math.min(10, r.r | 0)); return "<li" + (r.me ? ' class="me"' : "") + '><span class="rk">' + (i + 1) + '</span><span class="nm">' + esc(r.n) + "</span>" + pic(lv, 18) + '<span class="sc">' + fmt(r.s) + "</span></li>"; }).join("");
    note.textContent = mine >= 0 ? "You’re #" + (mine + 1) + (lbTab === "mdaily" ? " today." : " of all time.") : lbTab === "mdaily" ? "Daily runs only. Sydney time. Names are public." : "Best daily run per player. Names are public.";
  }
  lbBox.querySelector(".lbtabs").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; lbTab = b.getAttribute("data-b"); lbRender(); });
  lbQ(".lbform").addEventListener("submit", function (e) {
    e.preventDefault(); var n = String(lbQ("input").value || "").replace(/[^A-Za-z0-9 '\-\.]/g, "").replace(/\s+/g, " ").trim().slice(0, 14) || K.ANON;
    lbPost(n);
  });

  // ---------- sound + vibration (WebAudio blips made on the fly; never touches the game's PRNGs) ----------
  var MUTEKEY = "mrg-mute", muted = load(MUTEKEY, 0) === 1, AC = null, gestured = false, sfxLog = [];
  function audio() {
    if (muted || !gestured) return null;
    if (!AC) { try { var A = window.AudioContext || window.webkitAudioContext; if (!A) return null; AC = new A(); } catch (e) { return null; } }
    try { if (AC.state === "suspended") AC.resume(); } catch (e) {}
    return AC;
  }
  function unlockAudio() { if (gestured) return; gestured = true; audio(); }
  document.addEventListener("pointerdown", unlockAudio, true); document.addEventListener("keydown", unlockAudio, true);
  function tone(a, f, t0, dur, o) {
    o = o || {};
    var osc = a.createOscillator(), g = a.createGain(), v = o.vol || 0.12, hold = o.hold || 0;
    osc.type = o.type || "sine"; osc.frequency.setValueAtTime(f, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + 0.008);
    if (hold) g.gain.setValueAtTime(v, t0 + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(a.destination); osc.start(t0); osc.stop(t0 + dur + 0.02);
  }
  function sfx(kind, n) {
    if (DEBUG) sfxLog.push(kind + (n !== undefined ? n : ""));
    if (muted) return;
    var a = audio(); if (!a) return;
    try {
      var t = a.currentTime + 0.01, f;
      if (kind === "pop") { // pitch rises with level
        f = 260 * Math.pow(2, n / 4.5);
        if (NORMIE) { tone(a, f * 0.7, t, 0.09, { type: "triangle", to: f * 1.6, vol: 0.1 }); tone(a, f * 1.1, t + 0.05, 0.08, { type: "triangle", to: f * 1.8, vol: 0.06 }); }
        else tone(a, f * 0.8, t, 0.11, { to: f * 1.3, vol: 0.12 });
        if (n >= 7) tone(a, 120, t, 0.2, { to: 55, vol: 0.2 });
      } else if (kind === "combo") tone(a, Math.min(1760, 600 + n * 120), t + 0.06, 0.12, { type: "triangle", vol: 0.07 });
      else if (kind === "beat") { tone(a, 72, t, 0.12, { to: 46, vol: 0.3 }); tone(a, 64, t + 0.16, 0.1, { to: 42, vol: 0.22 }); }
      else if (kind === "sonar") { tone(a, 1250, t, 0.5, { vol: 0.05 }); tone(a, 1250, t + 0.3, 0.35, { vol: 0.018 }); }
      else if (kind === "chime") { tone(a, 1047, t, 0.15, { type: "triangle", vol: 0.06 }); tone(a, 1568, t + 0.08, 0.2, { type: "triangle", vol: 0.05 }); }
      else if (kind === "target" || kind === "big") [784, 988, 1175, 1568].forEach(function (fr, i) { tone(a, kind === "big" ? fr * 0.75 : fr, t + i * 0.09, 0.18, { type: "triangle", vol: 0.07 }); });
      else if (kind === "snip") { if (NORMIE) tone(a, 700, t, 0.16, { type: "triangle", to: 220, vol: 0.08 }); else { tone(a, 2400, t, 0.04, { type: "square", to: 1200, vol: 0.03 }); tone(a, 1900, t + 0.07, 0.04, { type: "square", to: 900, vol: 0.03 }); } }
      else if (kind === "rumble") tone(a, 70, t, 0.4, { type: "triangle", to: 40, vol: 0.22 });
      else if (kind === "germ") { tone(a, 300, t, 0.18, { type: "sawtooth", to: 180, vol: 0.04 }); }
      else if (kind === "drop") tone(a, 440, t, 0.05, { type: "triangle", vol: 0.03 });
      else if (kind === "over") [523, 440, 349].forEach(function (fr, i) { tone(a, fr, t + i * 0.16, 0.22, { type: "triangle", vol: 0.09 }); });
    } catch (e) {}
  }
  function buzz(p) { if (muted) return; try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }
  function muteUI() { var b = $("mute"); b.textContent = muted ? "🔇" : "🔊"; b.setAttribute("aria-label", muted ? "Sound off. Turn sound on" : "Sound on. Mute"); b.setAttribute("aria-pressed", muted ? "true" : "false"); }
  $("mute").onclick = function () { muted = !muted; put(MUTEKEY, muted ? 1 : 0); gestured = true; muteUI(); if (!muted) audio(); this.blur(); };
  muteUI();

  // ---------- input ----------
  function aim(e) { var b = cv.getBoundingClientRect(); aimX = (e.clientX - b.left) / scale; return (e.clientY - b.top) / scale; }
  var down = false;
  cv.addEventListener("pointerdown", function (e) { down = true; aim(e); try { cv.setPointerCapture(e.pointerId); } catch (x) {} });
  cv.addEventListener("pointermove", function (e) { if (!arm) aim(e); });
  cv.addEventListener("pointerup", function (e) {
    if (arm) { var b = cv.getBoundingClientRect(); if (down && !over) cutAt((e.clientX - b.left) / scale, (e.clientY - b.top) / scale); down = false; return; }
    aim(e); if (down) drop(); down = false;
  });
  cv.addEventListener("pointercancel", function () { down = false; });
  document.addEventListener("keydown", function (e) {
    if (root.offsetParent === null || /input|textarea/i.test((e.target || {}).tagName || "")) return;
    if (e.key === "Escape" && arm) { arm = false; tbarUI(); return; }
    if (e.key === "ArrowLeft") { aimX = Math.max(0, aimX - 14); e.preventDefault(); }
    else if (e.key === "ArrowRight") { aimX = Math.min(W, aimX + 14); e.preventDefault(); }
    else if (e.key === " " || e.key === "ArrowDown" || e.key === "Enter") { if (e.target === document.body || e.target === cv) { drop(); e.preventDefault(); } }
  });
  window.addEventListener("resize", size); window.addEventListener("load", size); setTimeout(size, 400); setTimeout(size, 1500);

  // ---------- days ----------
  function show(d) {
    day = d; KEY = "mrg-day-" + day; st = load(KEY, { done: false });
    $("eyebrow").textContent = (isLive() ? "Mergeon" : "Archive") + " · #" + num(day) + " · " + nice(day);
    if (st.done) renderResult(); else $("result").hidden = true;
    newRun(st.done);
    renderArchive();
  }
  function renderArchive() {
    var days = [], n = dayNum(REAL), first = dayNum(FIRST);
    for (var k = n - 1; k >= first; k--) days.push(new Date(k * 864e5).toISOString().slice(0, 10));
    var rows = days.map(function (d) {
      var s = load("mrg-day-" + d, null), mark = s && s.done ? " ✓" : "";
      return '<button type="button" class="arow' + (d === day ? " on" : "") + '" data-d="' + d + '"><span>' + nice(d) + mark + "</span><span>#" + num(d) + "</span></button>";
    }).join("");
    var back = isLive() ? "" : '<button type="button" class="btn" id="mrg-back">Back to today</button>';
    $("alist").innerHTML = back + (rows || '<p class="note">No past runs yet. This is #1.</p>');
    Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); }; });
    if ($("back")) $("back").onclick = function () { show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };
  window.MW_mrg = { drop: drop, aim: function (x) { aimX = x; }, state: function () {
    return { score: score, top: top, over: over, n: engine ? C.allBodies(engine.world).length : 0, cur: cur, nxt: nxt, chain: chain, bestChain: bestChain, tgt: tgt, tgtHit: tgtHit,
      cuts: cuts, arm: arm, shake: shakeLeft, wild: wildUsed, NEW: NEW, OUT: OUT, inf: infN, cleared: infCleared, drops: drops, practice: practice, lb: MLB, coll: coll, parts: parts.length }; } };
  if (DEBUG) { // test hooks (?debug=1)
    var X = window.MW_mrg;
    X.spawn = function (lv, x, y) { return add(lv, x, y).id; };
    X.setCur = function (lv) { cur = lv; hud(); };
    X.cut = function (x, y) { return cutAt(x, y); };
    X.shake = doShake; X.end = end; X.sfx = sfxLog; X.WILD = WILD; X.CURE = CURE; X.target = target;
    X.infect = function () { infect(null); }; X.spread = spread;
    X.bodies = function () { return pieces().map(function (o) { return { id: o.id, lv: o.lv, x: Math.round(o.position.x), y: Math.round(o.position.y), inf: !!o.inf }; }); };
    X.share = function () { return st.done ? shareText() : ""; };
  }

  // The board sits inside a hidden section until Play is tapped, so size on first view.
  var vis = new MutationObserver(function () { if (root.offsetParent !== null) size(); });
  var sec = document.getElementById("game"); if (sec) vis.observe(sec, { attributes: true, attributeFilter: ["hidden"] });
  size(); tick(); show(day); lbProbe();
})();
