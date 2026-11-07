/* Mergeon: drop organs, match two of a kind, they merge into the next organ up.
   Daily run: everyone gets the same drop order each day (Sydney time). Practice runs after.
   Physics by Matter.js (MIT), vendored as matter.min.js. */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "3";
  var root = document.getElementById("mrg");
  if (!document.querySelector("link[data-mrg]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "mergeon.css?v=" + BUILD; l.setAttribute("data-mrg", ""); document.head.appendChild(l);
  }
  var W = 400, H = 580, LINE = 96, DROP_Y = 46, WALL = 40, FIRST = "2026-10-19", WIN_LV = 9;
  var O = [
    { e: "🦠", n: "Microbe", r: 16, c: "#E4DCF3" },
    { e: "🩸", n: "Blood drop", r: 22, c: "#F7CDD3" },
    { e: "👁️", n: "Eye", r: 29, c: "#CFE5F1" },
    { e: "🫒", n: "Gallbladder", r: 36, c: "#DCEFD0" },
    { e: "🫘", n: "Kidney", r: 44, c: "#EBC6D0" },
    { e: "🎈", n: "Bladder", r: 53, c: "#F7DCE3" },
    { e: "🥟", n: "Stomach", r: 62, c: "#F5CBD2" },
    { e: "🫀", n: "Heart", r: 72, c: "#EBA0A8" },
    { e: "🫁", n: "Lungs", r: 84, c: "#F3BBC0" },
    { e: "🟫", n: "Liver", r: 97, c: "#E2B3AC" },
    { e: "🧠", n: "Brain", r: 112, c: "#CDBBEA" }
  ];
  var ART = ["<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><g stroke-linejoin=\"round\" stroke-linecap=\"round\"><line x1=\"50\" y1=\"50\" x2=\"96\" y2=\"50\" stroke=\"#3A2A55\" stroke-width=\"5\"/><circle cx=\"96\" cy=\"50\" r=\"4\" fill=\"#7DCB6E\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><line x1=\"50\" y1=\"50\" x2=\"82.5269119345812\" y2=\"82.5269119345812\" stroke=\"#3A2A55\" stroke-width=\"5\"/><circle cx=\"82.5269119345812\" cy=\"82.5269119345812\" r=\"4\" fill=\"#7DCB6E\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><line x1=\"50\" y1=\"50\" x2=\"50\" y2=\"96\" stroke=\"#3A2A55\" stroke-width=\"5\"/><circle cx=\"50\" cy=\"96\" r=\"4\" fill=\"#7DCB6E\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><line x1=\"50\" y1=\"50\" x2=\"17.473088065418814\" y2=\"82.5269119345812\" stroke=\"#3A2A55\" stroke-width=\"5\"/><circle cx=\"17.473088065418814\" cy=\"82.5269119345812\" r=\"4\" fill=\"#7DCB6E\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><line x1=\"50\" y1=\"50\" x2=\"4\" y2=\"50.00000000000001\" stroke=\"#3A2A55\" stroke-width=\"5\"/><circle cx=\"4\" cy=\"50.00000000000001\" r=\"4\" fill=\"#7DCB6E\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><line x1=\"50\" y1=\"50\" x2=\"17.473088065418807\" y2=\"17.473088065418814\" stroke=\"#3A2A55\" stroke-width=\"5\"/><circle cx=\"17.473088065418807\" cy=\"17.473088065418814\" r=\"4\" fill=\"#7DCB6E\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><line x1=\"50\" y1=\"50\" x2=\"49.99999999999999\" y2=\"4\" stroke=\"#3A2A55\" stroke-width=\"5\"/><circle cx=\"49.99999999999999\" cy=\"4\" r=\"4\" fill=\"#7DCB6E\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><line x1=\"50\" y1=\"50\" x2=\"82.52691193458118\" y2=\"17.473088065418807\" stroke=\"#3A2A55\" stroke-width=\"5\"/><circle cx=\"82.52691193458118\" cy=\"17.473088065418807\" r=\"4\" fill=\"#7DCB6E\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><circle cx=\"50\" cy=\"50\" r=\"34\" fill=\"#9BDB86\" stroke=\"#3A2A55\" stroke-width=\"3\"/><circle cx=\"36\" cy=\"34\" r=\"5\" fill=\"#C6EDB8\"/><circle cx=\"66\" cy=\"66\" r=\"4\" fill=\"#7DCB6E\"/></g><g transform=\"translate(50 54) scale(1)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M50 4 C50 4 14 46 14 64 A36 34 0 0 0 86 64 C86 46 50 4 50 4Z\" fill=\"#E5384F\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M30 60 Q30 46 40 36\" stroke=\"#FF9AA8\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(50 68) scale(1)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><circle cx=\"50\" cy=\"50\" r=\"45\" fill=\"#FFFFFF\" stroke=\"#3A2A55\" stroke-width=\"3\"/><path d=\"M14 40 Q22 44 26 38 M80 62 Q86 66 90 60\" stroke=\"#F08A9A\" stroke-width=\"2\" fill=\"none\"/><circle cx=\"50\" cy=\"50\" r=\"22\" fill=\"#4A9FD8\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><circle cx=\"50\" cy=\"50\" r=\"10\" fill=\"#1E1630\"/><circle cx=\"56\" cy=\"43\" r=\"5\" fill=\"#fff\"/></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M60 6 Q72 8 70 20 L64 30 Q86 50 82 74 Q76 96 52 96 Q26 94 22 72 Q20 50 46 30 L50 18 Q52 6 60 6Z\" fill=\"#8CC66A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M34 62 Q34 50 42 44\" stroke=\"#C3E6A8\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(52 68) scale(0.9)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M44 8 Q76 2 88 30 Q98 56 84 80 Q70 100 44 94 Q14 86 12 58 Q12 44 26 40 Q40 40 42 50 Q46 58 54 52 Q58 44 46 36 Q32 26 30 18 Q34 10 44 8Z\" fill=\"#B5506A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M40 54 Q28 74 32 100\" stroke=\"#E7B95A\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M68 20 Q80 28 84 42\" stroke=\"#E3899E\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(64 66) scale(0.9)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M22 4 Q24 20 34 30 M78 4 Q76 20 66 30\" stroke=\"#E7B95A\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M50 26 Q86 22 90 54 Q92 80 64 88 L58 98 L42 98 L36 88 Q8 80 10 54 Q14 22 50 26Z\" fill=\"#F5C2CF\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M24 50 Q26 40 36 36\" stroke=\"#FFE3EA\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(50 58) scale(1)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M40 4 L40 18 Q42 26 34 32 Q14 46 12 70 Q12 94 40 96 Q66 98 82 80 Q98 60 88 40 Q80 22 62 24 Q52 26 50 18 L50 4Z\" fill=\"#F29BA8\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M36 58 Q50 54 62 60 M30 72 Q46 68 64 74\" stroke=\"#D96A7E\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M82 80 Q92 88 96 98\" stroke=\"#F29BA8\" stroke-width=\"9\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(60 46) scale(0.85)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M40 14 L40 4 M54 12 L56 2 M64 16 L72 8\" stroke=\"#6E8FD6\" stroke-width=\"7\" stroke-linecap=\"round\"/><path d=\"M50 30 C42 10 8 12 8 42 C8 66 34 82 50 96 C66 82 92 66 92 42 C92 12 58 10 50 30Z\" fill=\"#E4475B\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M22 36 Q24 26 32 24\" stroke=\"#FF9AA8\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(50 52) scale(1)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M50 4 L50 34 M50 34 Q42 40 38 46 M50 34 Q58 40 62 46\" stroke=\"#E8A0AE\" stroke-width=\"8\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M42 30 Q22 20 12 44 Q4 70 10 88 Q16 98 30 94 Q44 90 44 76 L44 40Z\" fill=\"#F4A3B2\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M58 30 Q78 20 88 44 Q96 70 90 88 Q84 98 70 94 Q56 90 56 76 L56 40Z\" fill=\"#F4A3B2\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><g transform=\"translate(27 64) scale(0.55)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g><g transform=\"translate(73 64) scale(0.55)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M8 34 Q10 16 40 14 Q70 12 92 22 Q100 28 94 40 Q80 70 54 88 Q44 94 40 84 Q36 72 24 66 Q6 56 8 34Z\" fill=\"#A8433A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M58 18 Q56 40 48 58\" stroke=\"#7E2A24\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M20 30 Q28 22 40 22\" stroke=\"#D27466\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M46 84 Q42 92 52 96 Q62 94 58 84\" fill=\"#8CC66A\" stroke=\"#3A2A55\" stroke-width=\"2.5\"/><g transform=\"translate(36 46) scale(1)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M30 16 Q40 4 54 10 Q68 4 78 16 Q94 20 92 38 Q100 52 90 64 Q92 82 74 84 Q66 96 50 90 Q34 96 26 84 Q8 82 10 64 Q0 52 8 38 Q6 20 30 16Z\" fill=\"#F5B8CC\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M50 14 Q46 30 52 44 Q56 58 50 72 M26 34 Q34 30 36 40 M70 30 Q64 36 72 42 M22 58 Q30 54 30 64 M78 56 Q70 58 74 68\" stroke=\"#D97C9C\" stroke-width=\"3.5\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(50 58) scale(1)\"><circle cx=\"-9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"9\" cy=\"0\" r=\"3.6\" fill=\"#2A1E3D\"/><circle cx=\"-7.8\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><circle cx=\"10.2\" cy=\"-1.2\" r=\"1.2\" fill=\"#fff\"/><path d=\"M-5 6 Q0 10.5 5 6\" stroke=\"#2A1E3D\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"-15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/><ellipse cx=\"15\" cy=\"6\" rx=\"4\" ry=\"2.4\" fill=\"#FF7A9A\" opacity=\".45\"/></g></svg>"];
  // collision outlines (convex hull of each drawing, art units 0-100, centre 50,50) so pieces sit snugly
  var HULL = [[[16.2,39.1],[20.6,30.1],[35,17.8],[44.6,14.9],[61.1,16.3],[70.1,20.7],[82.2,35],[83.8,61],[79.4,70],[65.2,82.1],[39.2,83.8],[30.2,79.4],[17.9,65.2],[15,55.6]],[[13,59.7],[16.5,49.9],[27.2,31.8],[50,2.5],[75.1,35.1],[85,53.5],[87.5,63.6],[85.6,75.2],[80.7,84.4],[64.2,96.9],[43.5,99],[24.7,90.2],[17.9,82.3],[13.1,70.2]],[[5.8,35.7],[11.6,23.8],[30.3,7.9],[51.6,3.5],[69.9,8],[88.5,24],[94.3,35.8],[95.9,57.3],[80.8,84.8],[51.5,96.5],[30.4,92.1],[19.4,85],[8,69.9],[4.1,57.3]],[[21,62.4],[26.6,48.2],[52.8,8.4],[65,5.9],[70.5,12.3],[82.8,56.1],[83.2,75.1],[79.1,84.4],[70.1,93.2],[60.6,96.7],[41.7,95.7],[32.4,91.5],[23.9,82.2],[20.6,72.6]],[[12.7,48.4],[29.9,15.4],[37.3,8.7],[57.1,5.5],[70.2,8.5],[82.2,17.5],[89.2,29],[93.6,53.7],[85.2,80.9],[70.1,93.9],[57,96.9],[31.1,90.7],[20.4,82.6],[12.8,69.7]],[[8.5,54.5],[14.4,36.6],[22.7,28.8],[42.3,24.1],[67.8,25.1],[77.3,28.8],[85.5,36.6],[91.5,54.5],[87.3,74.1],[80.5,81.6],[57.6,99.5],[42.4,99.5],[19.5,81.6],[12.7,74.1]],[[10.5,70.4],[15.6,50.8],[39.7,2.5],[49.7,2.5],[81.4,28],[92.2,46.7],[93,59.7],[89.6,70.8],[83.4,80.7],[68.5,92.4],[56,96.7],[32.8,96.5],[21.9,92.5],[12.6,81.7]],[[7.5,33.6],[16.2,20],[29.1,15.7],[70.8,15.6],[83.7,19.9],[87.7,23.7],[92.5,33.6],[93.4,44.6],[87.7,61.6],[73.3,78.4],[49.9,97.5],[26.6,78.3],[12.2,61.5],[6.6,44.6]],[[7.1,58.1],[10.5,43.8],[17.5,32],[30.2,25.8],[69.8,25.8],[82.5,32],[89.5,43.8],[93.2,59.9],[93.9,74.5],[91.3,88.8],[78.6,96.3],[21.4,96.3],[8.7,88.8],[6,72.6]],[[6.5,33.7],[10.4,23.9],[18.8,17.5],[39.5,12.6],[59.8,12.6],[80.8,16.6],[93.1,21.3],[97.6,34.1],[91.2,48.7],[76.8,69.6],[53.8,89.7],[42.7,90],[14,59.9],[6.8,44.4]],[[7.2,29.6],[11.8,22.1],[37.3,8.2],[63.2,6.6],[73,9.5],[91.3,23.6],[96.7,46.3],[90.6,74.3],[84.3,82.2],[59.6,93.4],[32.2,91.7],[16.1,82.5],[9.5,74.8],[3.1,52.6]]];
  var IMG = ART.map(function (svg) { var im = new Image(); im.src = "data:image/svg+xml," + encodeURIComponent(svg); return im; });
  function pic(i, px) { return '<img class="mrg-pic" src="' + IMG[i].src + '" alt="' + O[i].n + '" width="' + px + '" height="' + px + '">'; }
  var SASS = {"5": ["Bladder. Hold it together.", "Bladder. Under pressure.", "Bladder. Full of potential."], "6": ["Stomach. Got the guts for this.", "Stomach. Hungry for more.", "Stomach. Churning along nicely."], "7": ["Heart! Pumped for you.", "Heart! You’ve got the beat.", "Heart! Cardio-logical."], "8": ["Lungs! Genuinely breathtaking.", "Lungs! Take a deep breath.", "Lungs! Inspired."], "9": ["Liver! It’ll grow back. Partly.", "Liver! The body’s hardest worker.", "Liver! Filtering out the competition."], "10": ["Brain! Finally, someone using one.", "Brain! Big thoughts.", "Brain! Think like a doctor, indeed."]};
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var POPS = ["Two brains, one big thought. Gone. +100", "Brain merger. Mind blown. +100", "Two brains cancelled out. Typical committee. +100"];
  var DIST = ["🧠", "🟫", "🫁", "🫀", "Less"];

  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="mrg-eyebrow">Mergeon</span><span class="badge" id="mrg-badge"></span></div>' +
    ' <div class="mbar"><div><span class="lab">Score</span><b id="mrg-score">0</b></div><div><span class="lab">Top organ</span><b id="mrg-top">–</b></div><div class="nx"><span class="lab">Next</span><b id="mrg-next">–</b></div></div>' +
    ' <div class="board" id="mrg-board"><canvas id="mrg-cv" aria-label="Mergeon board. Move to aim, tap or press space to drop."></canvas><div class="toast" id="mrg-toast" hidden></div><div class="over" id="mrg-over" hidden></div></div>' +
    ' <div class="chain" id="mrg-chain"></div>' +
    ' <p class="note" id="mrg-mode"></p>' +
    ' <div class="result" id="mrg-result" hidden></div>' +
    ' <p class="note" id="mrg-nextday"></p>' +
    ' <details class="archive" id="mrg-archive"><summary>Past puzzles</summary><div class="alist" id="mrg-alist"></div></details>' +
    "</div>";
  var $ = function (id) { return document.getElementById("mrg-" + id); };
  $("chain").innerHTML = O.map(function (o, i) { return '<span title="' + o.n + '">' + pic(i, 27) + "</span>" + (i < O.length - 1 ? "<i>›</i>" : ""); }).join("");

  function sydToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function nice(d) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(n) { return n.toLocaleString("en-AU"); }
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  var REAL = sydToday(), qd = new URLSearchParams(location.search).get("date");
  var day = (qd && /^\d{4}-\d{2}-\d{2}$/.test(qd) && dayNum(qd) <= dayNum(REAL)) ? qd : REAL;
  function isLive() { return day === REAL; }
  function num(d) { return dayNum(d) - dayNum(FIRST) + 1; }
  var SKEY = "mrg-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, hi: 0, dist: [0, 0, 0, 0, 0] });
  var KEY, st;

  // ---------- physics ----------
  var M = window.Matter, E = M.Engine, B = M.Bodies, C = M.Composite, Ev = M.Events, Bd = M.Body;
  var engine, rnd, queue, cur, nxt, aimX = W / 2, canDrop, score, top, practice, over, toastT, merges, lastT, acc, raf;
  var cv = $("cv"), ctx = cv.getContext("2d"), dpr = 1, scale = 1;

  function roll() { var x = rnd(); return x < 0.3 ? 0 : x < 0.57 ? 1 : x < 0.77 ? 2 : x < 0.92 ? 3 : 4; }
  function newRun(isPractice) {
    practice = !!isPractice; over = false; score = 0; top = -1; merges = []; canDrop = true;
    rnd = mulberry32(isPractice ? (Math.random() * 4294967296) >>> 0 : dayNum(day) * 2654435761 >>> 0);
    engine = E.create(); engine.gravity.y = 1.15; engine.positionIterations = 8; engine.velocityIterations = 6;
    var opt = { isStatic: true, friction: 0.2, restitution: 0.1, label: "wall" };
    C.add(engine.world, [B.rectangle(W / 2, H + WALL / 2, W + WALL * 2, WALL, opt), B.rectangle(-WALL / 2, H / 2, WALL, H * 2, opt), B.rectangle(W + WALL / 2, H / 2, WALL, H * 2, opt)]);
    Ev.on(engine, "collisionStart", onHit); Ev.on(engine, "collisionActive", onHit);
    cur = roll(); nxt = roll();
    $("over").hidden = true; $("result").hidden = !(!practice && st.done); hud();
    $("mode").textContent = practice ? "Practice run. Doesn’t count. Nobody’s watching." : (isLive() ? "Today’s run. Same drop order for everyone. One shot counts." : "Archive run for " + nice(day) + ". Same drops as that day.");
    $("badge").textContent = practice ? "Practice" : ""; lastT = 0; acc = 0;
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function onHit(ev) {
    ev.pairs.forEach(function (p) {
      var a = p.bodyA, b = p.bodyB;
      if (a.lv === undefined || a.lv !== b.lv || a.gone || b.gone) return;
      a.gone = b.gone = true; merges.push([a, b]);
    });
  }
  function doMerges() {
    merges.forEach(function (m) {
      var a = m[0], b = m[1], lv = a.lv;
      C.remove(engine.world, a); C.remove(engine.world, b);
      if (lv === O.length - 1) { score += 100; toast(pick(POPS)); return; }
      var n = lv + 1, x = (a.position.x + b.position.x) / 2, y = (a.position.y + b.position.y) / 2;
      var o = add(n, x, y); Bd.setVelocity(o, { x: (a.velocity.x + b.velocity.x) / 2, y: Math.min(a.velocity.y, b.velocity.y, 0) - 1 });
      o.born = performance.now();
      score += (n + 1) * (n + 2) / 2;
      if (n > top) { top = n; if (SASS[n]) toast(pick(SASS[n])); }
    });
    if (merges.length) hud();
    merges = [];
  }
  function add(lv, x, y) {
    var r = O[lv].r, opt = { restitution: 0.1, friction: 0.12, frictionAir: 0.004, density: 0.0012 + lv * 0.0002, slop: 0.01 }, o, off = { x: 0, y: 0 };
    try {
      var vs = HULL[lv].map(function (q) { return { x: (q[0] - 50) * r / 50, y: (q[1] - 50) * r / 50 }; });
      var c = M.Vertices.centre(vs); off = { x: -c.x, y: -c.y };
      o = B.fromVertices(x, y, [vs], opt);
    } catch (e) { o = null; }
    if (!o) { o = B.circle(x, y, r, opt); off = { x: 0, y: 0 }; }
    o.lv = lv; o.off = off; o.overT = 0; C.add(engine.world, o); return o;
  }
  function drop() {
    if (!canDrop || over) return;
    var r = O[cur].r, x = Math.max(r + 1, Math.min(W - r - 1, aimX));
    var o = add(cur, x, DROP_Y); o.fresh = performance.now();
    if (cur > top) top = cur;
    cur = nxt; nxt = roll(); canDrop = false; hud();
    setTimeout(function () { canDrop = true; }, 550);
  }
  function checkOver(now) {
    var bodies = C.allBodies(engine.world), danger = false;
    for (var i = 0; i < bodies.length; i++) {
      var o = bodies[i]; if (o.lv === undefined || o.gone) continue;
      if (o.fresh && now - o.fresh < 1500) continue;
      if (o.position.y - O[o.lv].r < LINE) { danger = true; o.overT = o.overT || now; if (now - o.overT > 1800) { end(); return true; } }
      else o.overT = 0;
    }
    return danger;
  }
  function loop(t) {
    raf = requestAnimationFrame(loop);
    if (!engine) return;
    if (!lastT) lastT = t;
    var dt = Math.min(100, t - lastT); lastT = t;
    var danger = false;
    if (!over) {
      acc += dt;
      while (acc >= 1000 / 60) { E.update(engine, 1000 / 60); doMerges(); acc -= 1000 / 60; }
      danger = checkOver(performance.now());
    }
    draw(danger);
  }

  // ---------- drawing ----------
  function size() {
    var b = $("board"); b.style.maxWidth = "";
    var w = b.clientWidth || 360;
    // fit the whole game on screen: board height limited by the viewport (leave room for the organ chain)
    var vh = window.innerHeight || 700, top0 = b.getBoundingClientRect().top + (window.pageYOffset || 0);
    var room = vh - top0 - 58;
    if (room > 200 && w * H / W > room) { w = Math.floor(room * W / H); b.style.maxWidth = (w + 4) + "px"; }
    scale = w / W; dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    cv.style.width = w + "px"; cv.style.height = Math.round(H * scale) + "px";
    cv.width = Math.round(w * dpr); cv.height = Math.round(H * scale * dpr);
  }
  var EMF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  function organ(lv, x, y, ang, alpha, off) {
    var o = O[lv];
    ctx.save(); ctx.globalAlpha = alpha || 1; ctx.translate(x, y); ctx.rotate(ang || 0); if (off) ctx.translate(off.x, off.y);
    var im = IMG[lv];
    if (im.complete && im.naturalWidth) { var d = o.r * 2 * 108 / 100; ctx.drawImage(im, -d / 2, -d / 2, d, d); }
    else { ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fillStyle = o.c; ctx.fill(); ctx.font = Math.round(o.r * 1.15) + "px " + EMF; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(o.e, 0, o.r * 0.06); }
    ctx.restore();
  }
  function draw(danger) {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.fillStyle = dark ? "#211B2E" : "#FFFFFF"; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.setLineDash([8, 8]); ctx.lineWidth = 2;
    ctx.strokeStyle = danger ? "#D0573E" : (dark ? "rgba(180,168,207,.5)" : "rgba(107,90,147,.35)");
    ctx.beginPath(); ctx.moveTo(0, LINE); ctx.lineTo(W, LINE); ctx.stroke(); ctx.restore();
    if (!over && engine) {
      var r = O[cur].r, x = Math.max(r + 1, Math.min(W - r - 1, aimX));
      ctx.save(); ctx.strokeStyle = dark ? "rgba(180,168,207,.35)" : "rgba(107,90,147,.25)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, DROP_Y + r); ctx.lineTo(x, H); ctx.stroke(); ctx.restore();
      organ(cur, x, DROP_Y, 0, canDrop ? 1 : 0.35);
    }
    if (engine) C.allBodies(engine.world).forEach(function (o) {
      if (o.lv === undefined || o.gone) return;
      var s = 1; if (o.born) { var k = (performance.now() - o.born) / 160; if (k < 1) s = 0.7 + 0.3 * k; else o.born = 0; }
      if (s !== 1) { ctx.save(); ctx.translate(o.position.x, o.position.y); ctx.scale(s, s); organ(o.lv, 0, 0, o.angle, 1, o.off); ctx.restore(); }
      else organ(o.lv, o.position.x, o.position.y, o.angle, 1, o.off);
    });
  }
  function hud() {
    $("score").textContent = fmt(score);
    $("top").innerHTML = top >= 0 ? pic(top, 22) + " " + O[top].n : "–";
    $("next").innerHTML = pic(nxt, 26);
  }
  function toast(m) {
    var t = $("toast"); t.textContent = m; t.hidden = false; t.classList.remove("on"); void t.offsetWidth; t.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2200);
  }

  // ---------- end of run ----------
  function verdict(tp) {
    return tp >= 10 ? "A whole brain. Think like a doctor? You are one." : tp >= 9 ? "Liver. Hardest-working organ, one step from a brain." :
      tp >= 8 ? "Lungs. Breathtaking. Two steps from a brain." : tp >= 7 ? "Heart. Solid, reliable, slightly overworked. Like most GPs." :
      tp >= 5 ? "Some decent plumbing. Keep going." : "Microbes everywhere. Wash your hands and try again.";
  }
  function band(tp) { return tp >= 10 ? 0 : tp >= 9 ? 1 : tp >= 8 ? 2 : tp >= 7 ? 3 : 4; }
  function end() {
    over = true;
    var ov = $("over");
    ov.innerHTML = "<b>Game over</b><span>" + fmt(score) + " points · " + (top >= 0 ? pic(top, 22) + " " + O[top].n : "") + "</span>";
    ov.hidden = false;
    if (!practice && !st.done) {
      st = { done: true, win: top >= WIN_LV - 1, score: score, top: top }; put(KEY, st);
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
  function renderResult(practiceScore) {
    var r = $("result"), s = st.score, tp = st.top;
    var share = "Mergeon #" + num(day) + (isLive() ? "" : " (archive)") + " " + (tp >= 0 ? O[tp].e : "") + "\nScore " + fmt(s) + " · Top organ: " + (tp >= 0 ? O[tp].n : "none") + "\nmaladywise.com";
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0;
    r.hidden = false;
    r.innerHTML = (practiceScore !== undefined ? '<p class="prac">Practice: <b>' + fmt(practiceScore) + "</b> · " + (practiceScore > s ? "Better than your real run. Typical." : "Your daily run still stands.") + "</p>" : "") +
      '<p class="em-row">' + pic(tp >= 0 ? tp : 0, 64) + '</p><p class="score">' + fmt(s) + '<span> pts</span></p><p class="verdict">' + esc(verdict(tp)) + "</p>" +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Heart %</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + fmt(stats.hi || 0) + "</b><span>High score</span></div></div>" +
      '<pre id="mrg-share">' + esc(share) + '</pre><div class="btns"><button class="btn solid" type="button" id="mrg-copy">Copy result</button><button class="btn" type="button" id="mrg-again">Practice run</button></div>';
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

  // ---------- input ----------
  function aim(e) { var b = cv.getBoundingClientRect(); aimX = (e.clientX - b.left) / scale; }
  var down = false;
  cv.addEventListener("pointerdown", function (e) { down = true; aim(e); try { cv.setPointerCapture(e.pointerId); } catch (x) {} });
  cv.addEventListener("pointermove", function (e) { aim(e); });
  cv.addEventListener("pointerup", function (e) { aim(e); if (down) drop(); down = false; });
  cv.addEventListener("pointercancel", function () { down = false; });
  document.addEventListener("keydown", function (e) {
    if (root.offsetParent === null || /input|textarea/i.test((e.target || {}).tagName || "")) return;
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
  window.MW_mrg = { drop: drop, aim: function (x) { aimX = x; }, state: function () { return { score: score, top: top, over: over, n: engine ? C.allBodies(engine.world).length : 0 }; } };

  // The board sits inside a hidden section until Play is tapped, so size on first view.
  var vis = new MutationObserver(function () { if (root.offsetParent !== null) size(); });
  var sec = document.getElementById("game"); if (sec) vis.observe(sec, { attributes: true, attributeFilter: ["hidden"] });
  size(); tick(); show(day);
})();
