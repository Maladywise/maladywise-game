/* Mergeon: drop organs (sea creatures in Normie mode), match two of a kind, they merge into the next organ up.
   Daily run: everyone gets the same drop order each day (Sydney time). Practice runs after.
   Physics by Matter.js (MIT), vendored as matter.min.js.
   Outbreak Sunday (Normie: Slick Sunday) from 15 Nov 2026, "Treat it properly" (RX): no random cure drops; every 6 merges earns a
   dose (antibiotic / sponge, hold 2), armed from the pill button then tapped on an infected piece (cures it and infected neighbours).
   Untreated for 20 s, an infection turns resistant (needs 2 doses, spreads twice as fast, immune merge-cure no longer works).
   Infected pieces swell up to +15%. Wasted dose −10. +50 per cure (+20 if resistant). Earlier Sundays play exactly as before.
   From 16 Nov 2026 (Sydney date of the run): weekly specials (Mon Microgravity/Moon, Tue/Thu/Sat a mutation, Wed Blood Bank/Potluck,
   Fri Sick Day/Grumpy, Sun Outbreak), 3 ward round goals, a collection book with hidden finds, learn mode, seasonal skins, Fever combos,
   clutch saves and an end-of-game tally. From 15 Nov: infections drain points. ?debug=1 adds &sp=, &mut=, &skin=, &nofeat=1 and MW_mrg hooks.
   Determinism: only the drop PRNG (rnd) sets the drop order; infections use irnd, shake srnd, and each new feature its own
   (brnd groups, qrnd quirks, drnd drift, hrnd hidden finds, xrnd drain); nothing new draws from rnd. */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "20";
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
    WFACT2: "Stem cells can copy themselves and turn into specialised cells. The blood-forming ones live in your bone marrow and make every type of blood cell.",
    WTIP: "Stem cell: merges with any piece and turns it into the next organ up.", WLAB: "STEM CELL",
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
    WFACT2: "Natural pearls are rare: most pearls sold today are cultured, grown on pearl farms.",
    WTIP: "Pearl: pairs with any creature and turns it into the next one up.", WLAB: "PEARL · WILD",
    WFACT: "Wild piece! It merges with anything. Oysters make pearls by coating a speck of grit in layer after layer of mother-of-pearl.",
    BIG: "Big splash!", TOOL: { e: "🥅", n: "Net", hint: "Net ready. Tap a creature to scoop it out." }, ANON: "Anonymous sailor",
    REACT: [["Small fry today. Dive back in.", "Shell of a try. Go again."], ["Swimmingly done.", "Not bad for a day at the beach."], ["Fin-tastic run!", "Making waves, you are."]]
  };
  // Outbreak Sunday extras (Normie: an oil slick, cleaned with a sponge). Non-medical wording in Normie.
  MED.OUT = { RX: { dose: "Antibiotic", doses: "doses", hit: "Germ landed! Merge to earn 💊, then treat it early.", earned: "Dose earned! 💊", res: "Resistant! Needs a full course: 2 doses", resWord: "resistant", half: "Half a course. One more dose to finish it.", cure: "Treated! Keep an eye on the rest.", clear: "All clear! Infection gone.", wasted: "Antibiotics don’t work on nothing.", ready: "Antibiotic ready. Tap an infected piece.",
      drain: "Infections drain your score until you treat them.",
      tip: ["Earn a 💊 dose every 6 merges (hold 2).", "Treat early: after 20 s a germ turns resistant and needs 2 doses.", "Don’t waste them: no germ, −10 points."],
      first: "First cure", fact: "Antibiotics only work on bacteria, and every unnecessary course helps resistance grow. Finish the course your doctor prescribes." },
    badge: "🦠 Outbreak Sunday", share: "🦠", hit: "Germ landed! It can’t merge.", spread: "The infection is spreading!", cure: "Immune response!", clear: "Infection cleared! +50", cleared: "Infections cleared", wasted: "Antibiotic wasted. No germs there.", tint: "rgba(96,190,60,.38)", P: { e: "💊", n: "Antibiotic", r: 17, c: "#FDE2E2" },
    ART: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><g transform=\"rotate(-35 50 50)\"><path d=\"M50 14 L30 14 Q8 14 8 50 Q8 86 30 86 L50 86Z\" fill=\"#EF4B4B\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M50 14 L70 14 Q92 14 92 50 Q92 86 70 86 L50 86Z\" fill=\"#FFFFFF\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M22 34 Q24 24 34 22\" stroke=\"#FFA3A3\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/></g>" + FACE(50, 54, 0.9) + "</svg>",
    fact: "Antibiotic! It cures every infected piece it bumps into. Penicillin was discovered by Alexander Fleming in 1928." };
  SEA.OUT = { RX: { dose: "Sponge", doses: "sponges", hit: "Oil slick! Merge to earn 🧽, then clean it early.", earned: "Sponge earned! 🧽", res: "Stubborn slick! Needs 2 sponges.", resWord: "stubborn", half: "Half clean. One more sponge to finish it.", cure: "Cleaned! Keep an eye on the rest.", clear: "All clean! Spill gone.", wasted: "Sponge wasted. Nothing to clean.", ready: "Sponge ready. Tap a slicked creature.",
      drain: "Oil slicks drain your score until you clean them.",
      tip: ["Earn a 🧽 sponge every 6 merges (hold 2).", "Clean early: after 20 s a slick turns stubborn and needs 2 sponges.", "Don’t waste them: no oil, −10 points."],
      first: "First clean-up", fact: "Oil spill crews fence oil in with floating booms, then skim and soak it up. Some ocean microbes even eat oil, helping clean up spills naturally." },
    badge: "🛢️ Slick Sunday", share: "🛢️", hit: "Oil slick! It can’t merge.", spread: "The slick is spreading!", cure: "Clean-up crew!", clear: "Spill cleaned up! +50", cleared: "Slicks cleaned", wasted: "Sponge wasted. Nothing to clean there.", tint: "rgba(40,30,60,.42)", P: { e: "🧽", n: "Sponge", r: 17, c: "#FFF3BF" },
    ART: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><path d=\"M14 22 Q14 12 26 12 L74 12 Q86 12 86 22 L88 80 Q88 90 76 90 L24 90 Q12 90 12 80Z\" fill=\"#F7D24A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M12 74 L88 74\" stroke=\"#3A2A55\" stroke-width=\"3\"/><path d=\"M12 74 L88 74 L88 80 Q88 90 76 90 L24 90 Q12 90 12 80Z\" fill=\"#7CC36A\" stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\"/><circle cx=\"26\" cy=\"26\" r=\"4\" fill=\"#E0B22E\"/><circle cx=\"76\" cy=\"30\" r=\"5\" fill=\"#E0B22E\"/><circle cx=\"30\" cy=\"62\" r=\"3.5\" fill=\"#E0B22E\"/><circle cx=\"74\" cy=\"60\" r=\"3\" fill=\"#E0B22E\"/></svg>".replace("</svg>", FACE(50, 44, 1) + "</svg>"),
    fact: "Sponge! It cleans every slicked creature it bumps into. Real sea sponges are animals, and some have lived for thousands of years." };

  // ---------- Weekly specials, mutations, goals, collection, learn mode, skins, hidden finds (from 16 Nov 2026) ----------
  // Second fun fact per piece (collection book and learn mode). Plain words, checked.
  MED.FACTS2 = [
    "In ideal lab conditions, some bacteria (like E. coli) can double in number about every 20 minutes.",
    "Blood makes up roughly 7–8% of your body weight.",
    "Your blind spot is where the optic nerve leaves the eye. There are no light sensors there, and your brain fills in the gap.",
    "The liver makes bile. The gallbladder just stores and concentrates it, then squeezes it out after a fatty meal.",
    "Most people have two kidneys, but you can live a normal life with just one.",
    "You usually feel the first urge to go well before your bladder is actually full.",
    "An adult stomach can stretch to hold around a litre or more after a big meal.",
    "Your heart has its own built-in pacemaker, the sinoatrial node, so it keeps its own beat.",
    "At rest you breathe roughly 12 to 20 times a minute: about 20,000 breaths a day.",
    "The liver is your largest internal organ, about 1.5 kg in an adult.",
    "Your brain has about 86 billion nerve cells (neurons)."
  ];
  SEA.FACTS2 = [
    "‘Plankton’ comes from a Greek word meaning ‘wanderer’ or ‘drifter’.",
    "A shrimp’s heart sits up front, in the same body section as its head.",
    "Crabs usually walk sideways because of the way their leg joints bend.",
    "A slimy coat of mucus helps protect a clownfish from its anemone’s stings.",
    "A group of jellyfish is called a smack, or a bloom.",
    "Many pufferfish carry tetrodotoxin, a toxin far more deadly than cyanide.",
    "An octopus can squeeze through any gap bigger than its beak, the only hard part of its body.",
    "A turtle can’t climb out of its shell: the shell is part of its skeleton, joined to its spine and ribs.",
    "Sharks grow new teeth all their lives. Some get through thousands.",
    "Orca families have their own calls, a bit like family dialects.",
    "Blue whales live mostly on krill, eating several tonnes of it a day when feeding."
  ];
  // Blood Bank Wednesday. Groups as antigen bits (A = 1, B = 2, RhD = 4): a donor is compatible when it carries no antigen the recipient lacks.
  // Weights: Australian Red Cross Lifeblood, "Blood types" (lifeblood.com.au/blood/learn-about-blood/blood-types, checked Nov 2026):
  // O+ 38%, O− 7%, A+ 32%, A− 6%, B+ 12%, B− 2%, AB+ 4%, AB− 1% (sums to 102 from rounding; normalised below).
  MED.BG = { names: ["O−", "A−", "B−", "AB−", "O+", "A+", "B+", "AB+"], w: [7, 6, 2, 1, 38, 32, 12, 4],
    col: ["#1F7A6E", "#B4472F", "#3460A8", "#7A3F8F", "#1F7A6E", "#B4472F", "#3460A8", "#7A3F8F"], donor: 0, recip: 7,
    no: ["Incompatible! The recipient’s antibodies are not having it.", "Those two don’t match. Check the blood groups.", "Incompatible. That transfusion would end in tears."],
    donorT: "O negative: everyone’s favourite donor.", recipT: "AB positive: takes anything. Very relaxed.", mixed: "Compatible! Transfusion complete." };
  // Potluck Wednesday (Normie): Plain = 0 goes with anything, Sweet = 1, Savoury = 2, Spicy = 3 (= sweet|savoury bits) goes with anything; sweet + savoury clash.
  SEA.BG = { names: ["Plain", "Sweet", "Savoury", "Spicy"], w: [12, 34, 34, 20], col: ["#6B6680", "#C2477E", "#A86A12", "#C83A24"], donor: 0, recip: 3,
    no: ["Sweet and savoury? Not at this potluck.", "Those flavours clash. Find a better match.", "Nope. That dish is not happening."],
    donorT: "Plain: goes with everything.", recipT: "Spicy: gets along with everyone.", mixed: "Tasty pairing!" };
  function bgOK(d, r) { return (d & ~r) === 0; } // donor d can give to recipient r
  MED.SPEC = {
    micro: { e: "🚀", n: "Microgravity Monday", short: "Microgravity", line: "floaty pieces and a gentle drift.",
      fact: { t: "Microgravity", x: "In space, body fluids shift towards the head (hello, puffy face), weight-bearing bones lose about 1–1.5% of their density a month, and some astronauts get eye changes called SANS." } },
    blood: { e: "🩸", n: "Blood Bank Wednesday", short: "Blood Bank", line: "compatible groups only.",
      fact: { t: "Blood groups", x: "Your group comes from A and B markers on red cells plus the Rh factor (the + or −). O negative red cells can go to almost anyone in an emergency. In Australia, donations are collected by Lifeblood." } },
    sick: { e: "🤒", n: "Sick Day Friday", short: "Sick Day", line: "everyone’s a bit poorly.",
      fact: { t: "Why we feel sick", x: "Feeling rotten is partly your immune system’s plan. Fever makes life harder for many germs and speeds up immune cells, and ‘sickness behaviour’ (tired, off your food) saves energy for the fight." } }
  };
  SEA.SPEC = {
    micro: { e: "🌙", n: "Moon Monday", short: "Moon", line: "floaty pieces and a gentle drift.",
      fact: { t: "Moon gravity", x: "Gravity on the Moon is about one-sixth of Earth’s. Apollo astronauts found it easier to bunny-hop than walk." } },
    blood: { e: "🥘", n: "Potluck Wednesday", short: "Potluck", line: "matching flavours only.",
      fact: { t: "Potluck", x: "The word ‘potluck’ goes back to the 1500s: a guest got whatever luck had put in the pot." } },
    sick: { e: "😤", n: "Grumpy Friday", short: "Grumpy", line: "everyone’s in a mood.",
      fact: { t: "Grumpy", x: "The internet’s famous Grumpy Cat wasn’t actually grumpy. Her real name was Tardar Sauce." } }
  };
  // Sick Day quirks by chain level (the same mechanics in Normie, where the creatures sulk)
  var QUIRK = ["brows", "sway", "slip", "rattle", "shiver", "drip", "toot", "fib", "cough", "spew", "freeze"];
  MED.SICKT = ["The microbe is grumpy today. Fair enough.", "Blood drop’s feeling a bit woozy.", "Eye’s all bloodshot. Late night?", "Gallbladder’s rattling. Probably a stone.",
    "Kidneys have the shivers.", "Bladder sprang a tiny leak. Don’t look.", "Toot! Pardon the stomach.", "Heart’s all of a flutter. Deep breaths.", "Bless you, lungs.",
    "Liver had a little spew. Lovely.", "Brain freeze!"];
  SEA.SICKT = ["Plankton’s in a mood.", "Shrimp is sulking. Give it space.", "Crab’s being crabby. Obviously.", "Clownfish has the hiccups.", "Jellyfish has the wobbles.",
    "Pufferfish dripped on the floor. Rude.", "Octopus let off an ink puff. Charming.", "Turtle’s in a huff.", "Bless you, shark.", "Orca sprayed everyone from the blowhole.", "Whale’s gone all frosty."];
  // Daily mutations (Tue/Thu/Sat). Physics or scoring tweaks only; never the drop order.
  var MUTS = [
    { id: "bouncy", e: "🏀", n: ["Bouncy castle", "Bouncy castle"], d: ["Pieces have extra spring.", "Everything has extra spring."] },
    { id: "slippery", e: "⛸️", n: ["Ice rink", "Ice rink"], d: ["Almost no friction: pieces slide right across.", "Almost no friction: creatures slide right across."] },
    { id: "narrow", e: "📏", n: ["Tight squeeze", "Narrow tank"], d: ["The board is a bit narrower.", "The tank is a bit narrower."] },
    { id: "double", e: "✖️", n: ["Double chains", "Double chains"], d: ["Chain reaction bonuses score double.", "Chain reaction bonuses score double."] },
    { id: "preview", e: "👀", n: ["Sneak peek", "Sneak peek"], d: ["See the next two pieces.", "See the next two creatures."] },
    { id: "slowmo", e: "🐌", n: ["Slow-mo merges", "Slow-mo merges"], d: ["Time slows for a moment after each merge.", "Time slows for a moment after each merge."] },
    { id: "heavy", e: "🪨", n: ["Heavy day", "Heavy day"], d: ["Pieces fall fast and don’t bounce.", "Creatures sink fast and don’t bounce."] },
    // environments (from 17 Nov 2026)
    { id: "water", e: "🫧", n: ["Underwater ward", "Deep dive"], d: ["Everything sinks slowly, and bubbles lift the little pieces.", "Everything sinks slowly, and bubbles lift the little creatures."] },
    { id: "flow", e: "🌊", n: ["Bloodstream", "Rip current"], d: ["A current pushes pieces sideways. It flips every 30 seconds.", "A current pushes creatures sideways. It flips every 30 seconds."] },
    { id: "acid", e: "🧪", n: ["Stomach acid", "Toxic tide"], d: ["Pieces left on the floor too long dissolve down a level.", "Creatures left on the seabed too long shrink down a level."] },
    { id: "quake", e: "📳", n: ["Tremor ward", "Stormy deck"], d: ["Every 20 seconds the board shakes.", "Every 20 seconds a big wave rocks the tank."] },
    { id: "jelly", e: "🫠", n: ["Sticky ward", "Jellyfish soup"], d: ["Everything’s sticky: pieces stay roughly where they land.", "Everything’s sticky: creatures stay roughly where they land."] },
    { id: "tilt", e: "📐", n: ["Wonky bed", "Listing ship"], d: ["The board leans one way all game.", "The tank leans one way all game."] },
    { id: "lights", e: "🔦", n: ["Night shift", "Midnight dive"], d: ["Lights out: you only see near your aim and recent merges.", "Lights out: you only see near your aim and recent merges."] },
    { id: "gust", e: "🤧", n: ["Sneeze season", "Gale warning"], d: ["Big sneezes blow the top pieces sideways.", "Strong gusts blow the top creatures sideways."] }
  ];
  // Seasonal skins (purely cosmetic) and their collection cards
  MED.SKIN = { xmas: { e: "🎅", n: "Christmas organs", lv: 7, fact: "Haemophilia B is also called Christmas disease, after Stephen Christmas, the first patient described with it in 1952." },
    hall: { e: "🎃", n: "Zombie organs", lv: 10, fact: "Goosebumps come from tiny muscles at the base of each hair, called arrector pili, which pull the hair upright." },
    easter: { e: "🐰", n: "Easter organs", lv: 4, fact: "Chocolate is toxic to dogs because they break down theobromine, a chemical in cocoa, very slowly." } };
  SEA.SKIN = { xmas: { e: "🎅", n: "Christmas creatures", lv: 7, fact: "Reindeer eyes change colour with the seasons: golden in the bright Arctic summer, deep blue in the dark winter." },
    hall: { e: "🎃", n: "Zombie creatures", lv: 10, fact: "Botanically, a pumpkin is a kind of berry." },
    easter: { e: "🐰", n: "Easter creatures", lv: 4, fact: "Baby hares are born furry with their eyes open. Baby rabbits are born hairless with their eyes shut." } };
  // Ward round goals (Normie: "Today's jobs"). Each: [id, Medical text, Normie text]. Level goals fill in the piece name.
  MED.GOALW = "Ward round"; SEA.GOALW = "Today’s jobs";
  MED.STICK = "🩺"; SEA.STICK = "🐚";
  // Hidden finds (item 9): bonus collectables, never part of the chain and never scored. Art in 0–100 units with the usual face.
  function HSVG(body, fx, fy, fk) { return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4 -4 108 108\"><g stroke=\"#3A2A55\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\">" + body + "</g>" + (fx ? FACE(fx, fy, fk || 1) : "") + "</svg>"; }
  MED.HID = [
    { id: "thymus", n: "Thymus", clue: "Catch me young. I shrink as you grow.", fact: "The thymus, in your chest behind the breastbone, is where T cells (a kind of white blood cell) learn their job. It’s biggest for its size in childhood and slowly turns to fat after puberty.",
      art: HSVG("<path d=\"M48 18 Q30 14 24 34 Q14 62 26 84 Q36 96 48 86 Q52 60 48 18Z\" fill=\"#F2A7B8\"/><path d=\"M52 18 Q70 14 76 34 Q86 62 74 84 Q64 96 52 86 Q48 60 52 18Z\" fill=\"#F7BCCB\"/>", 50, 58, 0.8) },
    { id: "pineal", n: "Pineal gland", clue: "Look for me when the lights go out.", fact: "This tiny pine-cone-shaped gland deep in the brain releases melatonin when it’s dark, helping set your body clock.",
      art: HSVG("<path d=\"M50 6 Q80 30 78 60 Q74 92 50 96 Q26 92 22 60 Q20 30 50 6Z\" fill=\"#C9A06A\"/><path d=\"M30 44 L50 56 L70 44 M26 64 L50 76 L74 64 M38 28 L50 36 L62 28\" fill=\"none\" stroke=\"#8A6A3A\"/>", 50, 60, 0.85) },
    { id: "spleen", n: "Spleen", clue: "Introduce the universal donor to the universal recipient.", fact: "Your spleen filters old and worn-out red blood cells from your blood and helps fight some infections. It also holds about a third of your platelets.",
      art: HSVG("<path d=\"M30 14 Q70 4 88 30 Q98 54 82 76 Q64 96 38 90 Q50 72 44 56 Q36 40 20 38 Q14 22 30 14Z\" fill=\"#9C3D5A\"/><path d=\"M40 22 Q60 16 76 28\" stroke=\"#C9708A\" stroke-width=\"5\" fill=\"none\"/>", 64, 56, 0.9) },
    { id: "colon", n: "Colon", clue: "Follow the wind.", fact: "Your colon (large bowel) is about 1.5 metres long. It soaks water back out of what’s left of your food, and its bacteria make gas. Passing wind every day is completely normal.",
      art: HSVG("<path d=\"M18 92 L18 30 Q18 12 36 12 L64 12 Q82 12 82 30 L82 80 Q82 92 70 92\" fill=\"none\" stroke=\"#3A2A55\" stroke-width=\"22\"/><path d=\"M18 92 L18 30 Q18 12 36 12 L64 12 Q82 12 82 30 L82 80 Q82 92 70 92\" fill=\"none\" stroke=\"#E8A87C\" stroke-width=\"16\"/>", 50, 14, 0.6) },
    { id: "bone", n: "Bone", clue: "Survive the float, or count to 206.", fact: "Adults have 206 bones; babies start with around 300 that fuse as they grow. In space, weight-bearing bones lose about 1–1.5% of their density a month.",
      art: HSVG("<path d=\"M26 30 Q12 18 22 10 Q32 4 38 16 L62 16 Q68 4 78 10 Q88 18 74 30 L74 70 Q88 82 78 90 Q68 96 62 84 L38 84 Q32 96 22 90 Q12 82 26 70Z\" fill=\"#F4EEDC\"/>", 50, 52, 0.9) },
    { id: "ovary", n: "Ovary", clue: "Rare, precious, monthly-ish.", fact: "Each ovary is about the size of an almond. A baby girl is born with all the eggs she’ll ever have: around a million or more.",
      art: HSVG("<ellipse cx=\"50\" cy=\"56\" rx=\"34\" ry=\"26\" fill=\"#F5B8C4\"/><circle cx=\"34\" cy=\"50\" r=\"5\" fill=\"#FFE3EA\"/><circle cx=\"68\" cy=\"64\" r=\"4\" fill=\"#FFE3EA\"/><circle cx=\"60\" cy=\"42\" r=\"3\" fill=\"#FFE3EA\"/>", 50, 60, 0.8) },
    { id: "testicle", n: "Testicles", clue: "We always come as a pair.", fact: "Testicles hang outside the body because sperm develop best a few degrees cooler than your core temperature. One usually hangs a little lower than the other.",
      art: HSVG("<ellipse cx=\"32\" cy=\"56\" rx=\"22\" ry=\"28\" fill=\"#F2C9B0\"/><ellipse cx=\"68\" cy=\"60\" rx=\"22\" ry=\"28\" fill=\"#EDBEA2\"/>", 0) + "" },
    { id: "uterus", n: "Uterus", clue: "Grow something big.", fact: "The uterus is about the size of a pear, but in pregnancy it stretches to hold a full-term baby, the placenta and fluid, then shrinks back over about six weeks.",
      art: HSVG("<path d=\"M30 30 Q50 22 70 30 Q72 60 58 78 L58 94 L42 94 L42 78 Q28 60 30 30Z\" fill=\"#F09AAE\"/><path d=\"M30 32 Q18 26 10 34 M70 32 Q82 26 90 34\" fill=\"none\" stroke=\"#3A2A55\" stroke-width=\"4\"/><ellipse cx=\"8\" cy=\"40\" rx=\"6\" ry=\"8\" fill=\"#F5B8C4\"/><ellipse cx=\"92\" cy=\"40\" rx=\"6\" ry=\"8\" fill=\"#F5B8C4\"/>", 50, 50, 0.8) }
  ];
  // the testicles get two small faces
  MED.HID[6].art = MED.HID[6].art.replace("</svg>", FACE(32, 56, 0.6) + FACE(68, 60, 0.6) + "</svg>");
  SEA.HID = [
    { id: "thymus", n: "Baby seahorse", clue: "Catch me early. I only turn up at the start.", fact: "Seahorse dads carry the babies: the male has a pouch where the eggs develop until they hatch.",
      art: HSVG("<path d=\"M58 10 Q76 10 76 26 Q76 36 64 40 Q78 52 70 70 Q64 84 50 92 Q40 96 38 86 Q46 84 46 76 Q34 70 38 54 Q42 42 50 38 Q42 34 44 22 Q46 10 58 10Z\" fill=\"#F5C842\"/><path d=\"M76 22 L92 20\" stroke=\"#3A2A55\" stroke-width=\"6\"/>", 60, 26, 0.6) },
    { id: "pineal", n: "Firefly squid", clue: "Look for me when the lights go out.", fact: "Firefly squid glow blue. Each spring they gather in huge numbers in Toyama Bay, Japan, lighting up the water at night.",
      art: HSVG("<path d=\"M50 6 Q72 24 70 54 L66 70 L34 70 L30 54 Q28 24 50 6Z\" fill=\"#6EA8F0\"/><path d=\"M36 70 L30 94 M44 70 L42 96 M56 70 L58 96 M64 70 L70 94\" stroke=\"#6EA8F0\" stroke-width=\"5\"/><circle cx=\"40\" cy=\"30\" r=\"3\" fill=\"#CFF4FF\" stroke=\"none\"/><circle cx=\"60\" cy=\"34\" r=\"3\" fill=\"#CFF4FF\" stroke=\"none\"/>", 50, 50, 0.8) },
    { id: "spleen", n: "Golden truffle", clue: "Introduce the plainest dish to the spiciest.", fact: "Truffles grow underground, so they’re found by smell. Trained dogs (and traditionally pigs) sniff them out.",
      art: HSVG("<path d=\"M50 12 Q80 14 88 44 Q94 76 66 88 Q40 96 20 80 Q6 60 16 36 Q26 12 50 12Z\" fill=\"#C9962E\"/><circle cx=\"34\" cy=\"34\" r=\"3\" fill=\"#8A6418\" stroke=\"none\"/><circle cx=\"70\" cy=\"74\" r=\"3\" fill=\"#8A6418\" stroke=\"none\"/><circle cx=\"72\" cy=\"30\" r=\"2.5\" fill=\"#8A6418\" stroke=\"none\"/>", 50, 56, 0.9) },
    { id: "colon", n: "Rubber duck", clue: "Follow the puffs.", fact: "In 1992 a shipping container of about 28,800 bath toys fell into the Pacific. Their drift helped oceanographers study ocean currents.",
      art: HSVG("<path d=\"M30 30 Q30 10 50 10 Q70 10 68 32 Q92 34 92 60 Q90 90 54 90 Q14 90 14 64 Q14 46 34 44 Q28 38 30 30Z\" fill=\"#F7D24A\"/><path d=\"M66 26 Q84 24 88 30 Q82 36 66 34Z\" fill=\"#F2913D\"/>", 48, 28, 0.6) },
    { id: "bone", n: "Moon rock", clue: "Survive the float, or count to 206.", fact: "The six Apollo landings brought back about 382 kg of Moon rock and soil.",
      art: HSVG("<path d=\"M24 20 Q50 6 76 18 Q96 40 88 70 Q72 94 42 90 Q12 84 10 56 Q8 32 24 20Z\" fill=\"#B9B6C6\"/><circle cx=\"34\" cy=\"36\" r=\"7\" fill=\"#9692A8\"/><circle cx=\"70\" cy=\"70\" r=\"9\" fill=\"#9692A8\"/>", 54, 54, 0.9) },
    { id: "ovary", n: "Four-leaf clover", clue: "Rare, lucky, monthly-ish.", fact: "Only about 1 in every 5,000 to 10,000 clovers has four leaves.",
      art: HSVG("<circle cx=\"34\" cy=\"34\" r=\"18\" fill=\"#5FB55A\"/><circle cx=\"66\" cy=\"34\" r=\"18\" fill=\"#6CC266\"/><circle cx=\"34\" cy=\"66\" r=\"18\" fill=\"#6CC266\"/><circle cx=\"66\" cy=\"66\" r=\"18\" fill=\"#5FB55A\"/><path d=\"M60 70 Q70 86 84 94\" stroke=\"#3E8A3A\" stroke-width=\"6\" fill=\"none\"/>", 50, 50, 0.8) },
    { id: "testicle", n: "Pair of dice", clue: "We always come as a pair.", fact: "On a standard die, opposite faces always add up to 7.",
      art: HSVG("<rect x=\"8\" y=\"30\" width=\"40\" height=\"40\" rx=\"8\" fill=\"#FFFFFF\"/><rect x=\"52\" y=\"36\" width=\"40\" height=\"40\" rx=\"8\" fill=\"#FFF6E0\"/><circle cx=\"20\" cy=\"42\" r=\"4\" fill=\"#3A2A55\" stroke=\"none\"/><circle cx=\"36\" cy=\"58\" r=\"4\" fill=\"#3A2A55\" stroke=\"none\"/><circle cx=\"72\" cy=\"56\" r=\"4\" fill=\"#3A2A55\" stroke=\"none\"/>", 0) },
    { id: "uterus", n: "Pot of gold", clue: "Grow something big.", fact: "Rainbows are really full circles. From the ground we usually only see the top arc; from a plane you can sometimes see the whole ring.",
      art: HSVG("<path d=\"M14 44 L86 44 Q92 90 50 92 Q8 90 14 44Z\" fill=\"#3A3550\"/><circle cx=\"32\" cy=\"40\" r=\"10\" fill=\"#F5C842\"/><circle cx=\"52\" cy=\"34\" r=\"11\" fill=\"#F5C842\"/><circle cx=\"70\" cy=\"40\" r=\"10\" fill=\"#F5C842\"/><path d=\"M8 46 L92 46\" stroke-width=\"6\"/>", 50, 70, 0.8) }
  ];
  MED.FULL = { n: "Full Anatomy", d: "You found every hidden organ." }; SEA.FULL = { n: "Full Treasure Hunt", d: "You found every hidden treasure." };
  MED.HIDW = "Hidden organ"; SEA.HIDW = "Hidden treasure";

  var K = NORMIE ? SEA : MED, O = K.O, ART = K.ART, HULL = K.HULL, SASS = K.SASS, POPS = K.POPS, DIST = K.DIST, OUTK = K.OUT;
  var WILD = O.length, CURE = O.length + 1, WO = K.W, PO = OUTK.P; // special pieces live after the chain: wild (stem cell / pearl) and cure (antibiotic / sponge)
  function info(lv) { return lv === WILD ? WO : lv === CURE ? PO : O[lv]; }
  var IMG = ART.concat([K.WART, OUTK.ART]).map(function (svg) { var im = new Image(); im.src = "data:image/svg+xml," + encodeURIComponent(svg); return im; });
  // Sick Day faces: every piece's smiley face swapped for a poorly one (sad, cross, queasy, miserable or woozy), varied by piece
  var D = "#2A1E3D", ST = ' stroke="' + D + '" stroke-width="2.4" fill="none" stroke-linecap="round"', ST3 = ST.replace("2.4", "3"), ST18 = ST.replace("2.4", "1.8");
  var MOODS = [
    '<circle cx="-9" cy="1" r="3.4" fill="' + D + '"/><circle cx="9" cy="1" r="3.4" fill="' + D + '"/><path d="M-14 -6 L-5 -8 M14 -6 L5 -8"' + ST + '/><path d="M-5 10 Q0 5.5 5 10"' + ST + '/><path d="M-11 5 Q-13 10 -11 12 Q-9 10 -11 5Z" fill="#7CC4F0"/>',
    '<circle cx="-9" cy="1" r="3.4" fill="' + D + '"/><circle cx="9" cy="1" r="3.4" fill="' + D + '"/><path d="M-15 -8 L-4 -3 M15 -8 L4 -3"' + ST3 + '/><path d="M-6 9 L6 9"' + ST + '/><ellipse cx="-15" cy="6" rx="4" ry="2.4" fill="#E0412F" opacity=".5"/><ellipse cx="15" cy="6" rx="4" ry="2.4" fill="#E0412F" opacity=".5"/>',
    '<path d="M-12 0 Q-9 -3 -6 0 M6 0 Q9 -3 12 0"' + ST + '/><path d="M-7 9 Q-5 6 -3 9 T1 9 T5 9 T8 9"' + ST + '/><ellipse cx="0" cy="4" rx="17" ry="11" fill="#8FCB5E" opacity=".35"/>',
    '<path d="M-12 1 Q-9 -2 -6 1 M6 1 Q9 -2 12 1"' + ST + '/><path d="M-14 -7 L-5 -9 M14 -7 L5 -9"' + ST + '/><path d="M-6 12 Q0 4 6 12"' + ST + '/><path d="M-9 4 L-10 14 M9 4 L10 14" stroke="#7CC4F0" stroke-width="2.6" stroke-linecap="round"/>',
    '<path d="M-12 -3 L-6 3 M-6 -3 L-12 3 M6 -3 L12 3 M12 -3 L6 3"' + ST + '/><ellipse cx="0" cy="9" rx="3" ry="3.6"' + ST + '/><path d="M-6 -12 q3 -3 6 0 t6 0"' + ST18 + '/>'
  ];
  var FRE = /(<g transform="translate\([^)]*\) scale\([^)]*\)">)<circle cx="-9"[\s\S]*?<\/g>/g;
  var SICKIMG = ART.map(function (svg, lv) { if (!FRE.test(svg)) return null; FRE.lastIndex = 0; var im = new Image(); im.src = "data:image/svg+xml," + encodeURIComponent(svg.replace(FRE, function (m, g) { return g + MOODS[lv % MOODS.length] + "</g>"; })); return im; });
  function pic(i, px) { return '<img class="mrg-pic" src="' + IMG[i].src + '" alt="' + info(i).n + '" width="' + px + '" height="' + px + '">'; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var DEBUG = /[?&]debug=1\b/.test(location.search);
  function quiet() { var r = document.documentElement.getAttribute("data-motion") === "reduce"; try { r = r || matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {} return r; }

  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="mrg-eyebrow">Mergeon</span><span class="hr"><span class="badge" id="mrg-badge"></span><button type="button" class="mute" id="mrg-help" aria-label="How to play">?</button><button type="button" class="mute" id="mrg-more" aria-label="More: goals, collection and learn mode" hidden>⋯</button><button type="button" class="mute" id="mrg-mute">🔊</button></span></div>' +
    ' <p class="today" id="mrg-today" hidden></p>' +
    ' <div class="mbar"><div><span class="lab">Score</span><b id="mrg-score">0</b></div><div><span class="lab">' + K.top + '</span><b id="mrg-top">–</b></div><div class="nx"><span class="lab">Next</span><b id="mrg-next">–</b></div></div>' +
    ' <div class="board" id="mrg-board"><canvas id="mrg-cv" aria-label="Mergeon board. Move to aim, tap or press space to drop."></canvas><div class="toast" id="mrg-toast" hidden></div><div class="combo" id="mrg-combo" hidden></div><div class="fact" id="mrg-fact" role="status" hidden></div><div class="learn" id="mrg-learn" role="status" hidden></div><div class="over" id="mrg-over" hidden></div></div>' +
    ' <div class="tbar" id="mrg-tbar"><span class="tgt" id="mrg-tgt"></span><span class="tools" id="mrg-tools"><button type="button" class="tool" id="mrg-cut"></button><button type="button" class="tool rx" id="mrg-rx" hidden></button><button type="button" class="tool" id="mrg-shake">Shake</button></span></div>' +
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
      '<li><b>Don’t cross the dashed line.</b> If the pile stays above it for a couple of seconds, it’s game over.</li></ul>' +
      '<details class="mrg-help-more"><summary>More rules, tools and today’s twist</summary><ul>' +
      '<li><b>Chain reactions:</b> quick merges in a row multiply your points.</li>' +
      '<li><b>' + (NORMIE ? "🥅 Net" : "🔪 Scalpel") + ' ×3:</b> tap it, then tap any ' + thing + ' to remove it. <b>Shake ×1</b> jiggles the board to free stuck ones.</li>' +
      '<li>' + pic(WILD, 22) + ' <b>' + (NORMIE ? "Pearl" : "Stem cell") + ' (wild):</b> a rare drop that merges with any ' + thing + ' and turns it into the next one up.</li>' +
      '<li><b>Daily run:</b> everyone gets the same drops each day. Your first game counts; after that it’s practice. Hit today’s 🎯 target for a ⭐.</li>' +
      (String(day) >= RXDAY ? '<li><b>' + (NORMIE ? "Slick Sunday" : "Outbreak Sunday") + ':</b> ' + (NORMIE ? "oil slicks land and spread, and slicked creatures can’t merge." : "germs land and spread, and infected organs can’t merge.") + "<br>" + OUTK.RX.tip.join("<br>") + "<br>" + OUTK.RX.drain + "</li>" :
      '<li><b>' + (NORMIE ? "Slick Sunday" : "Outbreak Sunday") + ':</b> ' + (NORMIE ? "oil spreads between sea creatures. Merge next to it, net it, or catch a 🧽 sponge." : "germs spread between organs. Merge next to them, use the scalpel, or catch a 💊 antibiotic.") + '</li>') +
      (featUI() ? '<li><b>Every day has a twist:</b><br>' + (NORMIE ? "Mon: Moon Monday (floaty)<br>Tue, Thu, Sat: a random mutation<br>Wed: Potluck Wednesday<br>Fri: Grumpy Friday<br>Sun: Slick Sunday"
        : "Mon: Microgravity Monday<br>Tue, Thu, Sat: a random mutation<br>Wed: Blood Bank Wednesday<br>Fri: Sick Day Friday<br>Sun: Outbreak Sunday") + "</li>" +
        (NORMIE ? "<li><b>Potluck Wednesday:</b> creatures carry a flavour. Same flavours pair. Plain and spicy go with anything. Sweet and savoury clash. A pair keeps the bolder flavour.</li>"
          : "<li><b>Blood Bank Wednesday:</b> pieces carry a blood group and merge only if one could give blood to the other. O− gives to anyone; AB+ takes from anyone. A gives to A and AB, B to B and AB; a negative can give to a positive, not the other way. The merged piece keeps the recipient’s group.</li>") +
        "<li><b>Fever:</b> chains of 3+ merges fill the slim meter at the top. Fill it for 10 s of double points. Pull the pile back from the line for a <b>Saved!</b> bonus.</li>" +
        "<li><b>" + esc(K.GOALW) + ":</b> 3 small goals a day (tap 📋). Tick all 3 in your daily run for a sticker. Sparkles hide bonus finds for your 📖 collection.</li>" +
        '<li><label class="mrg-help-learn"><input type="checkbox" id="mrg-help-learn"' + (LEARN ? " checked" : "") + "> <b>Learn mode:</b> names on pieces and a fact with each merge.</label></li>" : "") +
      '</ul></details><button type="button" class="mrg-help-go" id="mrg-help-go">Let’s play</button></div>';
  }
  function showHelp() {
    var o = document.getElementById("mrg-help-ov"); if (o) o.remove();
    o = document.createElement("div"); o.id = "mrg-help-ov"; o.className = "mrg-help-ov"; o.innerHTML = helpHTML(); document.body.appendChild(o);
    var close = function () { o.remove(); try { localStorage.setItem("mrg-help-seen", "1"); } catch (e) {} };
    o.addEventListener("click", function (e) { if (e.target === o || e.target.id === "mrg-help-go") close(); });
    document.addEventListener("keydown", function k(e) { if (e.key === "Escape") { close(); document.removeEventListener("keydown", k); } });
    var b = document.getElementById("mrg-help-go"); if (b) b.focus();
    var lt = document.getElementById("mrg-help-learn"); if (lt) lt.onchange = function () { setLearn(this.checked); };
  }
  document.getElementById("mrg-help").addEventListener("click", showHelp);
  document.getElementById("mrg-more").addEventListener("click", function () { openMore(); });
  try { if (!localStorage.getItem("mrg-help-seen")) setTimeout(showHelp, 400); } catch (e) {}
  if ($("lede")) $("lede").textContent = K.lede;
  function normFoot() { var ft = document.querySelector("footer.site"); if (ft) Array.prototype.forEach.call(ft.childNodes, function (t) { if (t.nodeType === 3 && /medical/i.test(t.nodeValue)) t.nodeValue = "A bonus game. Just for fun."; }); }
  if (NORMIE) { normFoot(); document.addEventListener("DOMContentLoaded", normFoot); }

  function sydToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function nice(d) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }); }
  function load(k, d) { if (PREVIEW && /^mrg-day-/.test(k)) return d; try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  var PREVIEW = (/[?&]preview=(\d{4}-\d\d-\d\d)\b/.exec(location.search) || [])[1] || null; // ?preview=YYYY-MM-DD: play any day's run; nothing is saved or posted
  function put(k, v) { if (PREVIEW && !/^mrg-(help-seen|mute)/.test(k)) return; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(n) { return n.toLocaleString("en-AU"); }
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  var REAL = sydToday(), qd = new URLSearchParams(location.search).get("date");
  if (PREVIEW) REAL = PREVIEW;
  if (PREVIEW) root.insertAdjacentHTML("afterbegin", '<p class="note" style="margin:0 0 8px;padding:8px 12px;border-radius:12px;background:#FDF3DA;color:#6B4A00;font-weight:600">Preview of ' + PREVIEW + ': practice only, nothing is saved or posted.</p>');
  if (DEBUG) { var dq = /[?&]day=(\d{4}-\d\d-\d\d)\b/.exec(location.search); if (dq) REAL = dq[1]; else if (qd && /^\d{4}-\d{2}-\d{2}$/.test(qd) && qd > REAL) REAL = qd; } // test hook: pretend today is another Sydney date
  var day = (qd && /^\d{4}-\d{2}-\d{2}$/.test(qd) && dayNum(qd) <= dayNum(REAL)) ? qd : REAL;
  function isLive() { return day === REAL; }
  function num(d) { return dayNum(d) - dayNum(FIRST) + 1; }
  var MK = NORMIE ? "n-" : "", BD = NORMIE ? "ndaily" : "mdaily", BA = NORMIE ? "nall" : "mall"; // Normie keeps its own daily run, stats and leaderboards
  var SKEY = "mrg-stats" + (NORMIE ? "-n" : ""), stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, hi: 0, dist: [0, 0, 0, 0, 0] });
  var KEY, st;
  var NEWDAY = "2026-11-08"; // new features start with this daily; earlier dailies (incl. 7 Nov) stay exactly as dealt
  function weekday(d) { return (dayNum(d) + 4) % 7; } // 0 = Sunday
  // daily target: deterministic from the date (its own PRNG, never the drop order). Mon–Thu stomach/heart, Fri–Sun lungs/liver.
  function target(d) {
    if (String(d) < NEWDAY) return -1;
    var n = dayNum(d), wd = weekday(d), hard = wd === 0 || wd >= 5, h = mulberry32((n * 2654435761 ^ 0x9E3779B9) >>> 0)();
    return hard ? (h < 0.5 ? 8 : 9) : (h < 0.5 ? 6 : 7);
  }
  // ---------- weekly features (from 16 Nov 2026). All keyed to the run's date; earlier dailies play exactly as before. ----------
  var FEATDAY = "2026-11-16", NOFEAT = DEBUG && /[?&]nofeat=1\b/.test(location.search);
  function qp(k) { var m = new RegExp("[?&]" + k + "=([a-z0-9-]+)").exec(location.search); return DEBUG && m ? m[1] : null; }
  function special(d) { // "micro" | "blood" | "sick" | "mut" | ""
    if (NOFEAT) return "";
    var f = qp("sp"); if (f) return f === "none" ? "" : f; if (qp("mut")) return "mut";
    var wd = weekday(d); d = String(d);
    if (wd === 1 && d >= "2026-11-16") return "micro";
    if (wd === 3 && d >= "2026-11-18") return "blood";
    if (wd === 5 && d >= "2026-11-20") return "sick";
    if ((wd === 2 || wd === 4 || wd === 6) && d >= "2026-11-17") return "mut";
    return "";
  }
  function rawMut(d) { return Math.floor(mulberry32((dayNum(d) * 2654435761 ^ 0x3C6EF372) >>> 0)() * MUTS.length); }
  function mutation(d) { // its own date PRNG; never two mutation days in a row with the same rule
    if (special(d) !== "mut") return null;
    var f = qp("mut"); if (f) for (var i = 0; i < MUTS.length; i++) if (MUTS[i].id === f) return MUTS[i];
    // rotation: every mutation once per cycle in a shuffled order, so all of them come round regularly
    var N = MUTS.length, k = dayNum(d) - dayNum("2026-11-17"), c = 3 * Math.floor(k / 7) + [0, 1, 1, 2, 2, 3, 3][k % 7];
    function perm(cy) { var a = [], r = mulberry32((cy * 7919 + 11) >>> 0), i, j, t; for (i = 0; i < N; i++) a.push(i); for (i = N - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    var cy = Math.floor(c / N), pos = c % N, P = perm(cy);
    if (cy > 0) { var Q = perm(cy - 1); if (P[0] === Q[N - 1]) { var t0 = P[0]; P[0] = P[1]; P[1] = t0; } }
    return MUTS[P[pos]];
  }
  function easter(y) { // anonymous Gregorian computus: Easter Sunday as "YYYY-MM-DD"
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
      h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
      mo = Math.floor((h + l - 7 * m + 114) / 31), dy = (h + l - 7 * m + 114) % 31 + 1;
    return y + "-" + (mo < 10 ? "0" : "") + mo + "-" + (dy < 10 ? "0" : "") + dy;
  }
  function skinOf(d) { // purely cosmetic
    if (NOFEAT) return ""; var f = qp("skin"); if (f) return f === "none" ? "" : f;
    d = String(d); if (d < FEATDAY) return "";
    var md = d.slice(5), es = dayNum(easter(+d.slice(0, 4))), n = dayNum(d);
    if (md >= "12-01" && md <= "12-26") return "xmas";
    if (md >= "10-25" && md <= "10-31") return "hall";
    if (n >= es - 6 && n <= es + 1) return "easter"; // Easter week: Monday before to Easter Monday
    return "";
  }
  function goalsOn(d) { return !NOFEAT && String(d) >= FEATDAY; }
  function featUI() { return !NOFEAT && String(REAL) >= FEATDAY; } // More menu, learn mode, collection book, schedule in How to play
  // ward round goals: 3 a day, the same for everyone (own date PRNG)
  function goalsFor(d) {
    if (!goalsOn(d)) return null;
    var g0 = mulberry32((dayNum(d) * 2246822519 ^ 0x1B873593) >>> 0); g0(); g0(); var g = mulberry32((g0() * 4294967296) >>> 0), wd = weekday(d), sp = special(d), out = [];
    var LV = NORMIE ? SEA.O : MED.O;
    function plural(lv, n) { var nm = LV[lv].n.toLowerCase(); return n === 1 ? (nm === "lungs" ? "a pair of lungs" : (/^[aeiou]/.test(nm) ? "an " : "a ") + nm) : n + " " + (nm === "lungs" ? "pairs of lungs" : nm === "jellyfish" || nm === "shrimp" ? nm : nm === "octopus" ? "octopuses" : nm + "s"); }
    if (wd === 0 && String(d) >= RXDAY) out.push({ id: "inf3", t: NORMIE ? "Clean 3 slicks" : "Clear 3 infections" });
    if (sp === "blood") out.push({ id: "mix4", t: NORMIE ? "Pair 4 mixed flavours" : "Merge 4 compatible blood groups" });
    var pool = [
      function () { var lv = g() < 0.5 ? 6 : 7, n = lv === 6 ? 3 : 2; return { id: "make", lv: lv, n: n, t: "Make " + plural(lv, n) }; },
      function () { return { id: "make", lv: 8, n: 1, t: "Make " + plural(8, 1) }; },
      function () { var s = [1000, 1500, 2000, 2500][Math.floor(g() * 4)]; return { id: "score", n: s, t: "Score " + fmt(s) + "+" }; },
      function () { return { id: "nocut", t: "Finish without the " + (NORMIE ? "net" : "scalpel") }; },
      function () { return { id: "noshake", t: "Finish without shaking" }; },
      function () { return { id: "chain", n: 3, t: "Set off a ×3 chain reaction" }; },
      function () { var n = [30, 40][Math.floor(g() * 2)]; return { id: "merges", n: n, t: "Merge " + n + " times" }; }
    ];
    var used = {};
    while (out.length < 3) { var k = Math.floor(g() * pool.length); if (used[k] || (k === 1 && used[0]) || (k === 0 && used[1]) || (k === 3 && used[4]) || (k === 4 && used[3])) continue; used[k] = 1; out.push(pool[k]()); }
    return out;
  }
  function aName(lv) { var n = O[lv].n; return n === "Lungs" ? "a pair of Lungs" : (/^[AEIOU]/.test(n) ? "an " : "a ") + n; }

  // ---------- physics ----------
  var M = window.Matter, E = M.Engine, B = M.Bodies, C = M.Composite, Ev = M.Events, Bd = M.Body;
  var engine, rnd, queue, cur, nxt, aimX = W / 2, canDrop, score, top, practice, over, toastT, merges, lastT, acc, raf;
  var NEW, OUT, RX, doses, rxProg, resCleared, srnd, irnd, chain, lastMT, bestChain, tgt, tgtHit, wildUsed, shakeLeft, cuts, arm, parts = [], nextBeat = 0, drops, steps, infN, infCleared, comboT;
  var cv = $("cv"), ctx = cv.getContext("2d"), dpr = 1, scale = 1;

  var NOREP = true; // never the same piece twice in a row (from 8 Nov 2026; today's daily kept as dealt)
  // from 8 Nov 2026: the five smallest drop evenly (18.6% each, like Suika), plus rare bladder 3%, stomach 2%, heart 1% and a wild piece 1%.
  // Outbreak Sundays also drop a cure 3%, taken evenly from the five smallest (18% each).
  var ODDS = [0.186, 0.186, 0.186, 0.186, 0.186, 0.03, 0.02, 0.01, 0.01], ODDS_OUT = [0.18, 0.18, 0.18, 0.18, 0.18, 0.03, 0.02, 0.01, 0.01, 0.03];
  // from 9 Nov 2026: only the five smallest drop (19.8% each); bladder, stomach and heart are made by merging only. Wild 1%; Outbreak Sunday cure 3%.
  var FIVEDAY = "2026-11-09", FIVE = true;
  var ODDS5 = [0.198, 0.198, 0.198, 0.198, 0.198, 0, 0, 0, 0.01], ODDS5_OUT = [0.192, 0.192, 0.192, 0.192, 0.192, 0, 0, 0, 0.01, 0.03];
  // from 15 Nov 2026 ("Treat it properly"): Outbreak Sundays drop no cures (0%); its 3% goes back to the five smallest evenly,
  // which is exactly the plain odds (ODDS5, or ODDS before 9 Nov). Doses are earned by merging instead.
  var RXDAY = "2026-11-15", RX_EVERY = 6, RX_MAX = 2, RX_RES = 1200, RX_WASTE = 10; // RX_RES: 20 s in 60 Hz physics steps
  function roll1() {
    var x = rnd();
    if (!NOREP) return x < 0.3 ? 0 : x < 0.57 ? 1 : x < 0.77 ? 2 : x < 0.92 ? 3 : 4; // older dailies keep their original odds
    var od = FIVE ? (OUT && !RX ? ODDS5_OUT : ODDS5) : (OUT && !RX ? ODDS_OUT : ODDS);
    for (var i = 0, c = 0; i < od.length; i++) { c += od[i]; if (x < c) return i === 8 ? WILD : i === 9 ? CURE : i; }
    return 0;
  }
  function roll(prev) { var v = roll1(), n = 0; if (NOREP && prev !== undefined) while (v === prev && n++ < 20) v = roll1(); return v; }
  function newRun(isPractice) {
    practice = !!isPractice; over = false; score = 0; top = -1; merges = []; canDrop = true;
    rnd = mulberry32(isPractice ? (Math.random() * 4294967296) >>> 0 : dayNum(day) * 2654435761 >>> 0);
    NOREP = practice || String(day) >= NEWDAY; NEW = NOREP; OUT = NEW && weekday(day) === 0; FIVE = practice || String(day) >= FIVEDAY;
    RX = OUT && String(day) >= RXDAY; doses = 0; rxProg = 0; resCleared = 0; // practice runs on those Sundays too
    // separate PRNGs for the shake and infections, so the drop order never changes
    var seed2 = isPractice ? (Math.random() * 4294967296) >>> 0 : (dayNum(day) * 2246822519) >>> 0;
    srnd = mulberry32((seed2 ^ 0x5BD1E995) >>> 0); irnd = mulberry32((seed2 ^ 0x27D4EB2F) >>> 0); ernd = mulberry32((seed2 ^ 0x9E3779B9) >>> 0);
    TILT = Math.floor(dayNum(day) / 7) % 2 ? 1 : -1; FLOW = ernd() < 0.5 ? 1 : -1; envFx = []; lights = [];
    chain = 0; lastMT = -1e9; bestChain = 1; tgt = target(day); tgtHit = false; wildUsed = false;
    // weekly features (from 16 Nov 2026): each random feature has its own PRNG from seed2; none touch rnd
    SP = special(day); MUT = mutation(day); SKIN = skinOf(day); GOALS = goalsFor(day); gDone = [false, false, false]; madeN = []; nMerge = 0; mixN = 0; tootN = 0; slowN = 0;
    sparks = []; hidRun = { sp: {}, tc: 0 }; noPairs = {}; LEARN = featUI() && load("mrg-learn", 0) === 1; $("learn").hidden = true;
    brnd = mulberry32((seed2 ^ 0x85EBCA6B) >>> 0); qrnd = mulberry32((seed2 ^ 0xC2B2AE35) >>> 0); drnd = mulberry32((seed2 ^ 0x165667B1) >>> 0); hrnd = mulberry32((seed2 ^ 0x68E31DA4) >>> 0);
    DRAIN = !NOFEAT && String(day) >= DRAINDAY; drained = 0;
    JUICE = goalsOn(day); meter = 0; feverS = 0; dangerT = 0; lastSave = -1e9; saves = 0; TL = { merge: 0, combo: 0, fever: 0, cure: 0, waste: 0, save: 0 };
    var dh = 0; "drain".split("").forEach(function (c) { dh = (Math.imul(dh, 31) + c.charCodeAt(0)) | 0; }); xrnd = mulberry32((seed2 ^ dh ^ 0x7F4A7C15) >>> 0);
    driftA = 0.035 + drnd() * 0.02; driftP = 900 + drnd() * 600; driftPh = drnd() * Math.PI * 2;
    if (SP === "blood") { curG = drawG(); nxtG = drawG(); }
    shakeLeft = NEW ? 1 : 0; cuts = NEW ? 3 : 0; arm = false; parts = []; nextBeat = 0; drops = 0; steps = 0; infN = 0; infCleared = 0;
    engine = E.create(); engine.gravity.y = SP === "micro" ? 0.6 : mut("heavy") ? 1.6 : mut("water") ? 0.75 : 1.15; if (mut("tilt")) engine.gravity.x = 0.2 * TILT; engine.positionIterations = 8; engine.velocityIterations = 6;
    var opt = { isStatic: true, friction: mut("slippery") ? 0 : 0.2, restitution: mut("bouncy") ? 0.4 : 0.1, label: "wall" };
    C.add(engine.world, [B.rectangle(W / 2, H + WALL / 2, W + WALL * 2, WALL, opt), B.rectangle(-WALL / 2, H / 2, WALL, H * 2, opt), B.rectangle(W + WALL / 2, H / 2, WALL, H * 2, opt)]);
    if (mut("narrow")) C.add(engine.world, [B.rectangle(NARROW - WALL / 2, H / 2, WALL, H * 2, opt), B.rectangle(W - NARROW + WALL / 2, H / 2, WALL, H * 2, opt)]);
    Ev.on(engine, "collisionStart", onHit); Ev.on(engine, "collisionActive", onHit);
    cur = roll(); nxt = roll(cur); PREV = mut("preview"); nx2 = PREV ? roll(nxt) : -1; // same chain of roll() calls, just read one ahead
    $("over").hidden = true; $("result").hidden = !(!practice && st.done); hud();
    $("mode").textContent = practice ? "Practice mode: today’s run is done, so these games don’t count. Play as often as you like." : (isLive() ? "Today’s run. Same drop order for everyone. One shot counts." : "Archive run for " + nice(day) + ". Same drops as that day.");
    $("badge").textContent = practice ? "Practice" : ""; lastT = 0; acc = 0;
    todayUI(); tbarUI(); size();
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function aimClamp(r) { var L = mut("narrow") ? NARROW : 0; return Math.max(L + r + 1, Math.min(W - L - r - 1, aimX)); }
  var dropLog = [];
  function pieces() { return C.allBodies(engine.world).filter(function (o) { return o.lv !== undefined && !o.gone; }); }
  function rad(o) { return info(o.lv).r * (o.sw || 1); } // o.sw: swelling of an infected piece (RX Sundays only; 1 otherwise)
  function touching(a, b, pad) { var dx = a.position.x - b.position.x, dy = a.position.y - b.position.y, r = rad(a) + rad(b) + (pad || 3); return dx * dx + dy * dy < r * r; }
  function onHit(ev) {
    ev.pairs.forEach(function (p) {
      var a = p.bodyA, b = p.bodyB;
      if (a.lv === undefined || b.lv === undefined || a.gone || b.gone) return;
      if (a.lv === CURE || b.lv === CURE) { var c = a.lv === CURE ? a : b; c.gone = true; merges.push([c, c, "cure"]); return; }
      if (a.inf || b.inf) return; // infected pieces can't merge
      if (a.lv === WILD || b.lv === WILD) { if (a.lv === b.lv) return; a.gone = b.gone = true; merges.push(a.lv === WILD ? [b, a, "wild"] : [a, b, "wild"]); return; }
      if (a.lv !== b.lv) return;
      var g;
      if (SP === "blood" && a.bg !== undefined && b.bg !== undefined && a.lv < O.length) { g = bgPair(a.bg, b.bg); if (g < 0) { noMatch(a, b); return; } }
      a.gone = b.gone = true; merges.push([a, b, null, g]);
    });
  }
  function noMatch(a, b) { // Blood Bank: incompatible pair touching (toast throttled)
    var k = Math.min(a.id, b.id) + "-" + Math.max(a.id, b.id), now = performance.now();
    if (noPairs[k] && now - noPairs[k] < 5000) return; noPairs[k] = now;
    if (now - lastNoT > 3000) { lastNoT = now; toast(pick(BG.no)); }
  }
  function doMerges() {
    var now = performance.now();
    merges.forEach(function (m) {
      var a = m[0], b = m[1], kind = m[2];
      if (kind === "cure") { useCure(a); return; }
      var lv = a.lv, wild = kind === "wild";
      // a merge next to an infected piece cures it (from 15 Nov: not a resistant one)
      if (infN) pieces().forEach(function (q) { if (q.inf && !(RX && q.res) && (touching(q, a, 6) || touching(q, b, 6))) cureOne(q, OUTK.cure); });
      if (RX) earn();
      C.remove(engine.world, a); C.remove(engine.world, b);
      if (wild) wildUsed = true;
      var x = wild ? a.position.x : (a.position.x + b.position.x) / 2, y = wild ? a.position.y : (a.position.y + b.position.y) / 2;
      chain = now - lastMT <= 1200 ? chain + 1 : 1; lastMT = now; if (chain > bestChain) bestChain = chain;
      var pts, n = lv + 1, big = lv === O.length - 1;
      if (big) { pts = 100; score += pts; TL.merge += pts; toast(pick(POPS)); confetti(); sfx("big"); }
      else {
        var o = add(n, x, y), v = wild ? a.velocity : { x: (a.velocity.x + b.velocity.x) / 2, y: Math.min(a.velocity.y, b.velocity.y) };
        Bd.setVelocity(o, { x: v.x, y: Math.min(v.y, 0) - 1 });
        o.born = now; if (mut("lights")) lights.push({ x: x, y: y, t: now }); pts = (n + 1) * (n + 2) / 2; score += pts; TL.merge += pts;
        if (SP === "blood") bloodMerge(o, a, b, wild, m[3]);
        if (SP === "sick" && n === O.length - 1) { o.frz = steps + 50; toast(K.SICKT[n]); }
        if (n > top) { top = n; if (SASS[n]) toast(pick(SASS[n])); }
        collect(n);
        if (tgt >= 0 && n === tgt && !tgtHit) hitTarget();
      }
      var L = Math.min(n, O.length - 1);
      madeN[n] = (madeN[n] || 0) + 1; nMerge++; if (!big) learnFact(n); if (mut("slowmo")) slowN = 24;
      hidMerge(x, y, n);
      burst(x, y, L); floatTxt(x, y - 12, "+" + pts);
      if (!big) sfx("pop", L);
      if (L >= 7) { shakeBoard(L >= 9 ? 2 : 1); buzz(L >= 9 ? [30, 40, 30] : 25); }
      if (chain > 1) { var bonus = NEW ? pts * (chain - 1) * (mut("double") ? 2 : 1) : 0; score += bonus; TL.combo += bonus; combo(chain, bonus); if (JUICE) juiceChain(x, y, chain); }
      if (JUICE && feverS > 0) { var fx = pts + (chain > 1 && NEW ? pts * (chain - 1) * (mut("double") ? 2 : 1) : 0); score += fx; TL.fever += fx; } // Fever doubles this merge's points
      if (JUICE && chain >= 3 && feverS <= 0) { meter = Math.min(METER, meter + 1); if (meter >= METER) startFever(); }
    });
    if (merges.length) { hud(); goalTick(false); }
    merges = [];
  }
  function bloodMerge(o, a, b, wild, g) { // Blood Bank / Potluck: the merged piece takes the recipient's group
    if (wild) { o.bg = a.bg; return; }
    o.bg = g === undefined ? a.bg : g;
    if (a.bg === undefined || b.bg === undefined || a.bg === b.bg) return;
    mixN++;
    var pair = [a.bg, b.bg];
    if (pair.indexOf(BG.donor) >= 0 && pair.indexOf(BG.recip) >= 0) hidSpawn("spleen", o.position.x, o.position.y - 20);
    if (pair.indexOf(BG.donor) >= 0) { toast(BG.donorT); unlockCard("o-", NORMIE ? "Plain: the easy guest" : "O negative donor"); }
    else if (pair.indexOf(BG.recip) >= 0) toast(BG.recipT);
  }
  function add(lv, x, y) {
    var rs = 0.1, fr = 0.12, fa = 0.004, fs = 0.5;
    if (SP === "micro") { rs = 0.05; fa = 0.012; }
    if (mut("bouncy")) rs = 0.55; if (mut("slippery")) { fr = 0.004; fs = 0.05; } if (mut("heavy")) { rs = 0; fa = 0.002; }
    if (mut("water")) fa = 0.05; if (mut("jelly")) { rs = 0; fr = 1; fs = 2; fa = 0.03; }
    if (SP === "sick" && lv < O.length && QUIRK[lv] === "slip") fr = 0.03;
    var r = info(lv).r, opt = { restitution: rs, friction: fr, frictionStatic: fs, frictionAir: fa, density: 0.0012 + (lv < O.length ? lv : 0) * 0.0002, slop: 0.01 }, o = null, off = { x: 0, y: 0 };
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
    var r = info(cur).r, x = aimClamp(r);
    var o = add(cur, x, DROP_Y); o.fresh = performance.now();
    if (SP === "blood") { o.bg = curG; curG = nxtG; nxtG = drawG(); }
    collect(cur);
    if (cur < O.length && cur > top) top = cur;
    if (PREV) { cur = nxt; nxt = nx2; nx2 = roll(nxt); } else { cur = nxt; nxt = roll(cur); }
    canDrop = false; hud(); sfx("drop");
    setTimeout(function () { canDrop = true; }, 260);
    drops++; if (drops === 1) onFirstDrop(); hidTick(); if (DEBUG) dropLog.push(o.lv);
    if (OUT && (drops === 15 || (drops > 15 && (drops - 15) % 20 === 0))) infect(o);
  }
  // ---------- Outbreak Sunday ----------
  function infect(skip) {
    if (infN >= 3) return;
    var c = pieces().filter(function (q) { return q !== skip && !q.inf && q.lv < O.length; });
    if (!c.length) return;
    c.sort(function (p, q) { return q.lv - p.lv || p.id - q.id; }); // highest level, ties by lowest index
    setInf(c[0], true); toast(RX ? RXK.hit : OUTK.hit); sfx("germ");
  }
  function spread(resOnly) {
    if (infN >= 3 || !infN) return;
    var all = pieces(), cand = [];
    all.forEach(function (q) { if (!q.inf || q.lv >= O.length || (resOnly && !q.res)) return; all.forEach(function (t) { if (!t.inf && t.lv < O.length && t !== q && touching(q, t, 4) && cand.indexOf(t) < 0) cand.push(t); }); });
    if (!cand.length) return;
    cand.sort(function (p, q) { return p.id - q.id; });
    setInf(cand[Math.floor(irnd() * cand.length)], true); toast(OUTK.spread); sfx("germ");
  }
  function setInf(q, on) { if (!!q.inf === on) return; q.inf = on; infN += on ? 1 : -1; q.res = false; if (on) { q.infS = steps; q.wasRes = false; } }
  function cureOne(q, msg) {
    if (!q.inf) return;
    if (RX) { rxCure(q); if (msg && infN) toast(msg); return; }
    setInf(q, false); infCleared++; burst(q.position.x, q.position.y, 3); if (msg) toast(msg); sfx("chime");
    if (!infN) { score += 50; TL.cure += 50; toast(OUTK.clear); floatTxt(q.position.x, q.position.y - 14, "+50"); hud(); }
  }
  // ---------- "Treat it properly" (RX Sundays from 15 Nov 2026) ----------
  var RXK = OUTK.RX;
  function rxCure(q) { // cure one piece: +50 if caught before it turned resistant, +20 if it had been resistant
    var was = !!q.wasRes, pts = was ? 20 : 50;
    setInf(q, false); infCleared++; if (was) resCleared++; q.wasRes = false;
    score += pts; TL.cure += pts; burst(q.position.x, q.position.y, 3); floatTxt(q.position.x, q.position.y - 14, "+" + pts); sfx("chime");
    if (!infN) toast(RXK.clear);
    factOnce("rx"); hud();
  }
  function earn() { // every RX_EVERY merges earns a dose, holding at most RX_MAX
    if (doses >= RX_MAX) { rxProg = 0; return; }
    if (++rxProg >= RX_EVERY) { rxProg = 0; doses++; toast(RXK.earned + " ×" + doses); sfx("target"); buzz(15); }
    tbarUI();
  }
  function waste(x, y) {
    doses--; arm = false; TL.waste += Math.min(score, RX_WASTE); score = Math.max(0, score - RX_WASTE);
    toast(RXK.wasted); floatTxt(x, y, "−" + RX_WASTE); sfx("snip"); buzz(30); tbarUI(); hud();
  }
  function treat(q) { // a dose on infected piece q: also treats every infected piece touching it
    var hit = [q];
    pieces().forEach(function (t) { if (t !== q && t.inf && touching(q, t, 10)) hit.push(t); });
    doses--; arm = false; var half = 0;
    hit.forEach(function (t) {
      if (t.res) { t.res = false; t.infS = steps; half++; burst(t.position.x, t.position.y, 2); } // a full course needs 2: first dose downgrades it
      else rxCure(t);
    });
    if (half && infN) toast(RXK.half); else if (infN) toast(RXK.cure);
    buzz(12); tbarUI(); hud();
  }
  function doseAt(px, py) {
    if (!doses || over) return false;
    var hit = null, best = 1e9;
    pieces().forEach(function (o) { var dx = o.position.x - px, dy = o.position.y - py, d = Math.sqrt(dx * dx + dy * dy) - rad(o); if (d < 12 && d < best) { best = d; hit = o; } });
    if (!infN) { waste(px, py); return true; } // no infection anywhere: wasted, wherever you tap
    if (!hit) return false; // tapped empty space: stay armed
    if (!hit.inf) { waste(hit.position.x, hit.position.y); return true; }
    treat(hit); return true;
  }
  function doseNearest() { // keyboard: Enter while armed treats the infected piece nearest the aim line
    var best = null, bd = 1e9;
    pieces().forEach(function (o) { if (!o.inf) return; var d = Math.abs(o.position.x - aimX) + (o.res ? -40 : 0); if (d < bd) { bd = d; best = o; } });
    if (best) treat(best); else if (doses) waste(aimX, H / 2);
  }
  function swell(o, to) { // scale body and drawing together; Matter.Body.scale keeps density, so mass and inertia follow
    var f = to / (o.sw || 1); if (Math.abs(f - 1) < 1e-6) return;
    Bd.scale(o, f, f); o.sw = to; if (o.off) { o.off.x *= f; o.off.y *= f; }
  }
  function rxTick() { // once per physics step
    var all = pieces();
    for (var i = 0; i < all.length; i++) {
      var o = all[i];
      if (o.inf) {
        if (!o.res && steps - o.infS >= RX_RES) { o.res = true; o.wasRes = true; toast(RXK.res); sfx("germ"); buzz([20, 30, 20]); }
        if (steps % 120 === 0 && (o.sw || 1) < 1.15) swell(o, Math.min(1.15, (o.sw || 1) + 0.01)); // ~1% radius every 2 s, max +15%
      } else if (o.sw && o.sw > 1) swell(o, Math.max(1, o.sw - 0.0025)); // cured: shrinks back over about 1 s
    }
    if (infN && steps % 300 === 0) { if (steps % 600 === 0) spread(false); else if (all.some(function (o) { return o.res; })) spread(true); } // resistant pieces spread twice as fast
  }
  function useCure(c) {
    var n = 0, wasInf = infN;
    pieces().forEach(function (q) { if (q !== c && q.inf && touching(q, c, 10)) { setInf(q, false); infCleared++; n++; burst(q.position.x, q.position.y, 3); } });
    C.remove(engine.world, c); poof(c.position.x, c.position.y, PO.r);
    if (n && !infN && wasInf) { score += 50; TL.cure += 50; toast(OUTK.clear); hud(); } else toast(n ? OUTK.cure : OUTK.wasted);
    sfx(n ? "chime" : "snip");
  }
  function checkOver(now) {
    var bodies = C.allBodies(engine.world), danger = 0;
    for (var i = 0; i < bodies.length; i++) {
      var o = bodies[i]; if (o.lv === undefined || o.gone) continue;
      // from 9 Nov (and practice): more forgiving. A piece must poke well over the line (SLACK px) for longer (GRACE ms) before the game ends.
      var SLACK = FIVE ? 14 : 0, GRACE = FIVE ? 3200 : 1800, FRESH = FIVE ? 2000 : 1500;
      if (SP === "micro" || mut("bouncy")) { GRACE += 1000; FRESH += 600; } // floatier days settle more slowly
      if (o.fresh && now - o.fresh < FRESH) continue;
      if (o.position.y - rad(o) < LINE - SLACK) { o.overT = o.overT || now; danger = Math.max(danger, 0.001, (now - o.overT) / GRACE); if (now - o.overT > GRACE) { end(); return 1; } }
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
      while (acc >= 1000 / 60) {
        if (SP === "micro") engine.gravity.x = driftA * Math.sin(steps / driftP * Math.PI * 2 + driftPh); // a gentle seeded drift
        if (slowN) { slowN--; engine.timing.timeScale = slowN ? 0.45 : 1; }
        E.update(engine, 1000 / 60); doMerges(); acc -= 1000 / 60; steps++; if (RX) rxTick(); else if (OUT && infN && steps % 600 === 0) spread();
        if (feverS > 0 && --feverS === 0) endFever();
        if (MUT) envTick();
        if (SP === "sick") sickTick(); if (DRAIN && infN) drainTick(); if (SP === "micro" && steps === 10800) hidTick();
      }
      danger = checkOver(now);
      if (JUICE && !over) clutch(danger, now);
      // danger tension: a heartbeat (Normie: a sonar ping) that speeds up the longer a piece sits over the line
      if (danger && !over) { if (now >= nextBeat) { sfx(NORMIE ? "sonar" : "beat"); nextBeat = now + (NORMIE ? 1100 - 650 * Math.min(1, danger) : 900 - 560 * Math.min(1, danger)); } }
      else nextBeat = 0;
    }
    draw(danger, dt, now);
  }

  // ---------- drawing ----------
  // desktop (mouse/trackpad, wide window; touchscreen laptops with a mouse count): score, tools and chain move to a side column
  // so the board can use the full height. Phones and tablets keep the stacked layout.
  var FINE = null; try { FINE = matchMedia("(hover:hover) and (pointer:fine)"); FINE.addEventListener("change", function () { size(); }); } catch (e) {}
  function desk() { return !!(FINE && FINE.matches) && (window.innerWidth || 0) >= 900; }
  function size() {
    var b = $("board"), dk = desk(); b.style.maxWidth = ""; b.style.width = "";
    root.classList.toggle("desk", dk);
    if (dk) {
      var vh0 = window.innerHeight || 800, bt = b.getBoundingClientRect().top + (window.pageYOffset || 0);
      var avail = root.clientWidth - 300, wd = Math.floor((vh0 - bt - 14) * W / H);
      wd = Math.max(320, Math.min(avail, 760, wd)); b.style.width = b.style.maxWidth = (wd + 4) + "px";
      scale = wd / W; dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      cv.style.width = wd + "px"; cv.style.height = Math.round(H * scale) + "px";
      cv.width = Math.round(wd * dpr); cv.height = Math.round(H * scale * dpr);
      return;
    }
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
  function organ(lv, x, y, ang, alpha, off, sc, bd) {
    var o = info(lv); sc = sc || 1;
    ctx.save(); ctx.globalAlpha = alpha || 1; ctx.translate(x, y); ctx.rotate(ang || 0); if (off) ctx.translate(off.x, off.y);
    var im = (SP === "sick" && SICKIMG[lv] && SICKIMG[lv].complete && SICKIMG[lv].naturalWidth) ? SICKIMG[lv] : IMG[lv];
    if (im.complete && im.naturalWidth) { var d = o.r * sc * 2 * 108 / 100; ctx.drawImage(im, -d / 2, -d / 2, d, d); deco(lv, bd, o.r * sc, performance.now()); }
    else { ctx.beginPath(); ctx.arc(0, 0, o.r * sc, 0, Math.PI * 2); ctx.fillStyle = o.c; ctx.fill(); ctx.font = Math.round(o.r * 1.15) + "px " + EMF; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(o.e, 0, o.r * 0.06); }
    ctx.restore();
  }
  function aura(lv, x, y, now) { // a glowing ring marks the special pieces
    var r = info(lv).r + 4; ctx.save(); ctx.lineWidth = 3; ctx.setLineDash([6, 5]); ctx.lineDashOffset = quiet() ? 0 : -now / 40;
    ctx.strokeStyle = lv === WILD ? "hsl(" + (quiet() ? 280 : (now / 8) % 360) + ",80%,60%)" : (NORMIE ? "#E0B22E" : "#EF4B4B");
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  function germ(o) { // infected look: tint + a small badge (Medical: a spiky germ; Normie: an oil drop)
    var r = rad(o), x = o.position.x, y = o.position.y;
    if (RX) { // countdown arc to resistance; resistant = dark, thick ring and a shield ("R" in Medical)
      ctx.save();
      if (o.res) { ctx.lineWidth = 5; ctx.strokeStyle = NORMIE ? "#120E1C" : "#4A1030"; ctx.beginPath(); ctx.arc(x, y, r + 3, 0, Math.PI * 2); ctx.stroke(); }
      else { var k = Math.min(1, (steps - (o.infS || 0)) / RX_RES); ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.strokeStyle = k > 0.7 ? "#D0573E" : "#E0A030"; ctx.beginPath(); ctx.arc(x, y, r + 2.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - k)); ctx.stroke(); }
      ctx.restore();
    }
    ctx.save(); ctx.fillStyle = OUTK.tint; ctx.beginPath(); ctx.arc(x, y, r * 0.92, 0, Math.PI * 2); ctx.fill();
    var bx = x + r * 0.55, by = y - r * 0.55, s = Math.max(8, Math.min(14, r * 0.3));
    ctx.translate(bx, by); ctx.lineWidth = 2; ctx.strokeStyle = "#3A2A55";
    if (NORMIE) { ctx.fillStyle = "#1E1A2B"; ctx.beginPath(); ctx.moveTo(0, -s * 1.2); ctx.quadraticCurveTo(s, 0, s * 0.8, s * 0.4); ctx.arc(0, s * 0.4, s * 0.8, 0, Math.PI); ctx.quadraticCurveTo(-s, 0, 0, -s * 1.2); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#8C86A8"; ctx.beginPath(); ctx.arc(-s * 0.3, s * 0.2, s * 0.22, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.fillStyle = "#6CC04A"; ctx.beginPath(); for (var i = 0; i < 16; i++) { var a = i * Math.PI / 8, rr = i % 2 ? s * 0.75 : s * 1.15; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#2A1E3D"; ctx.beginPath(); ctx.arc(-s * 0.28, -s * 0.1, s * 0.14, 0, Math.PI * 2); ctx.arc(s * 0.28, -s * 0.1, s * 0.14, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    if (RX && o.res) { // shield on the other shoulder
      var sx = x - r * 0.55, sy = y - r * 0.55, h = Math.max(9, Math.min(14, r * 0.32));
      ctx.save(); ctx.translate(sx, sy); ctx.fillStyle = NORMIE ? "#120E1C" : "#4A1030"; ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(0, -h); ctx.lineTo(h * 0.85, -h * 0.6); ctx.quadraticCurveTo(h * 0.8, h * 0.5, 0, h); ctx.quadraticCurveTo(-h * 0.8, h * 0.5, -h * 0.85, -h * 0.6); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#FFFFFF"; ctx.font = "700 " + Math.round(h * 1.1) + "px Poppins,system-ui,sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(NORMIE ? "2" : "R", 0, h * 0.02);
      ctx.restore();
    }
  }
  function draw(danger, dt, now) {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.fillStyle = dark ? "#211B2E" : "#FFFFFF"; ctx.fillRect(0, 0, W, H);
    drawBG(dark, now);
    var pulse = danger ? (quiet() ? 1 : 0.5 + 0.5 * Math.sin(now / (130 - 60 * Math.min(1, danger)))) : 0;
    if (danger) { ctx.fillStyle = "rgba(208,87,62," + (0.05 + 0.09 * pulse) + ")"; ctx.fillRect(0, 0, W, LINE); }
    ctx.save(); ctx.setLineDash([8, 8]); ctx.lineWidth = danger ? 2 + 2 * pulse : 2;
    ctx.strokeStyle = danger ? "rgba(208,87,62," + (0.55 + 0.45 * pulse) + ")" : (dark ? "rgba(180,168,207,.5)" : "rgba(107,90,147,.35)");
    ctx.beginPath(); ctx.moveTo(0, LINE); ctx.lineTo(W, LINE); ctx.stroke(); ctx.restore();
    if (!over && engine) {
      var r = info(cur).r, x = aimClamp(r);
      if (canDrop && !arm) { ctx.save(); ctx.strokeStyle = dark ? "rgba(180,168,207,.35)" : "rgba(107,90,147,.25)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, DROP_Y + r); ctx.lineTo(x, H); ctx.stroke(); ctx.restore(); }
      organ(cur, x, DROP_Y, 0, 1, null, 1, null); // always full opacity: no blink after a drop
      if (cur >= O.length) aura(cur, x, DROP_Y, now);
      tags(cur, SP === "blood" ? curG : undefined, x, DROP_Y, r);
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
          ctx.save(); ctx.translate(o.position.x, o.position.y); ctx.scale(sx, sy); organ(o.lv, 0, 0, o.angle, 1, o.off, o.sw, o); ctx.restore();
          tags(o.lv, o.bg, o.position.x, o.position.y, rad(o));
          if (o.inf) germ(o);
          return;
        }
      }
      var jx = 0, ja = 0, js = 1;
      if (SP === "sick" && o.lv < O.length && !quiet()) { if (QUIRK[o.lv] === "fib") { ja = 0.05 * Math.sin(now / 32); js = 1 + 0.03 * Math.sin(now / 21); } if (o.shiv > steps) jx = 1.6 * Math.sin(now / 16); if (o.rat > steps) jx = 1.2 * Math.sin(now / 12); if (QUIRK[o.lv] === "sway") ja = 0.06 * Math.sin(now / 400); }
      organ(o.lv, o.position.x + jx, o.position.y, o.angle + ja, 1, o.off, (o.sw || 1) * js, o);
      tags(o.lv, o.bg, o.position.x, o.position.y, rad(o));
      if (o.lv >= O.length) aura(o.lv, o.position.x, o.position.y, now);
      if (o.inf) germ(o);
      if (arm === "cut" || (arm === "rx" && o.inf)) { ctx.save(); ctx.strokeStyle = arm === "rx" ? "rgba(47,125,74,.8)" : "rgba(208,87,62,.55)"; ctx.lineWidth = arm === "rx" ? 2.5 : 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(o.position.x, o.position.y, rad(o) * (arm === "rx" ? 1.12 : 0.95), 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    });
    drawParts(dt || 16);
    drawFG(dark, now); if (MUT) drawEnvFG(dark, now); drawJuice(now);
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
      else if (p.k === "d") { ctx.beginPath(); ctx.moveTo(p.x, p.y - p.sz * 1.6); ctx.quadraticCurveTo(p.x + p.sz, p.y, p.x, p.y + p.sz); ctx.quadraticCurveTo(p.x - p.sz, p.y, p.x, p.y - p.sz * 1.6); ctx.fill(); }
      else if (p.k === "c") { ctx.globalAlpha = al * 0.6; ctx.beginPath(); ctx.arc(p.x, p.y, p.sz * (1 + p.t / p.max), 0, Math.PI * 2); ctx.fill(); }
      else { ctx.font = "700 " + (p.big || 20) + "px Poppins,system-ui,sans-serif"; ctx.textAlign = "center"; ctx.lineWidth = 4; ctx.strokeStyle = dark ? "#211B2E" : "#FFFFFF"; ctx.strokeText(p.txt, p.x, p.y); ctx.fillStyle = p.red ? (dark ? "#FF7A6E" : "#D0342C") : p.gold ? "#D9415E" : dark ? "#F1ECF8" : "#3A2A55"; ctx.fillText(p.txt, p.x, p.y); }
      ctx.restore();
    }
  }
  function shakeBoard(k) { if (quiet()) return; var b = $("board"); b.classList.remove("shk1", "shk2"); void b.offsetWidth; b.classList.add(k > 1 ? "shk2" : "shk1"); }
  function hud() {
    $("score").textContent = fmt(score); wildTip();
    $("top").innerHTML = top >= 0 ? pic(top, 22) + " " + O[top].n : "–";
    $("next").innerHTML = pic(nxt, 26) + (PREV ? pic(nx2, 18) : "") + (SP === "blood" && nxt < O.length ? '<small class="bgt" style="background:' + BG.col[nxtG] + '">' + BG.names[nxtG] + "</small>" : "");
  }
  function toast(m) {
    var t = $("toast"); t.textContent = m; t.hidden = false; t.classList.remove("on"); void t.offsetWidth; t.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2200);
  }
  function combo(n, bonus) {
    var c = $("combo"); c.textContent = "Chain reaction! ×" + n + (bonus ? " +" + fmt(bonus) : "");
    c.hidden = false; c.classList.remove("on", "big"); void c.offsetWidth; c.classList.add("on");
    sfx(JUICE ? "note" : "combo", n); clearTimeout(comboT); comboT = setTimeout(function () { c.hidden = true; }, 1000);
  }
  function toastBig(m) { var c = $("combo"); c.textContent = m; c.hidden = false; c.classList.remove("on"); void c.offsetWidth; c.classList.add("on", "big"); clearTimeout(comboT); comboT = setTimeout(function () { c.hidden = true; }, 1300); }
  function hitTarget() {
    tgtHit = true; tbarUI(); sfx("target"); buzz([20, 30, 20]);
    toast(practice ? "Target hit! (Practice, so no ⭐)" : "Target hit! ⭐ " + O[tgt].n);
  }
  function tbarUI() {
    var t = $("tgt"), on = tgt >= 0, html = "";
    if (OUT) html += '<span class="ob"' + (RX ? ' title="' + esc(RXK.tip.join("\n")) + '"' : "") + ">" + OUTK.badge + "</span> ";
    if (on) html += tgtHit ? '<span class="hit">⭐ Target hit: ' + esc(O[tgt].n) + (practice ? " (practice)" : "") + "</span>"
      : "🎯 " + (practice ? "Practice: make " : "Make ") + esc(aName(tgt));
    if (GOALS) { var gn = practice ? 0 : gDone.filter(Boolean).length; html = '<button type="button" class="gl" id="mrg-gl" aria-label="' + esc(K.GOALW) + " goals: " + gn + ' of 3 done">📋 ' + gn + "/3</button> " + html; }
    t.innerHTML = html; if ($("gl")) $("gl").onclick = openMore; t.title = on ? "Today’s target: make " + aName(tgt) + (RX ? "\n" + RXK.tip.join("\n") : "") : "";
    $("tools").hidden = !NEW;
    var c = $("cut"); c.textContent = K.TOOL.e + " " + cuts; c.disabled = !cuts || over;
    c.classList.toggle("on", arm === "cut");
    c.setAttribute("aria-label", arm === "cut" ? K.TOOL.n + " ready. Tap a piece, or tap here to cancel" : K.TOOL.n + ": " + cuts + " left"); c.title = K.TOOL.n + " (" + cuts + " left)";
    var p = $("rx"); p.hidden = !RX;
    if (RX) {
      var fr = doses >= RX_MAX ? 1 : rxProg / RX_EVERY, C2 = 2 * Math.PI * 6;
      p.innerHTML = '<svg class="ring" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="2.4"/>' +
        '<circle cx="8" cy="8" r="6" fill="none" stroke="var(--ok)" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="' + (C2 * fr).toFixed(2) + " " + C2.toFixed(2) + '" transform="rotate(-90 8 8)"/></svg>' + PO.e + " " + doses;
      p.disabled = (!doses && arm !== "rx") || over; p.classList.toggle("on", arm === "rx");
      var more = RX_EVERY - rxProg, lab = RXK.dose + ": " + doses + " of " + RX_MAX + (doses >= RX_MAX ? ", full" : ". " + more + " more merge" + (more === 1 ? "" : "s") + " to the next");
      p.setAttribute("aria-label", arm === "rx" ? RXK.dose + " ready. Tap an infected piece or press Enter to treat the nearest. Tap here or press Escape to cancel" : lab);
      p.title = lab;
    }
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
    var lv = factQ.shift();
    if (typeof lv === "object") { factOn = true; f.innerHTML = lv.pic + "<div><b>" + esc(lv.t) + "</b><span>" + esc(lv.x) + "</span></div>"; }
    else if (lv === "rx") { factOn = true; f.innerHTML = pic(CURE, 32) + "<div><b>" + esc(RXK.first) + "</b><span>" + esc(RXK.fact) + "</span></div>"; }
    else { var tx = lv === WILD ? K.WFACT : lv === CURE ? OUTK.fact : K.FACTS[lv]; factOn = true; f.innerHTML = pic(lv, 32) + "<div><b>New: " + esc(info(lv).n) + (featUI() ? " 📖" : "") + "</b><span>" + esc(tx) + "</span></div>"; }
    f.hidden = false; f.classList.remove("on"); void f.offsetWidth; f.classList.add("on"); sfx("chime");
    factT = setTimeout(nextFact, 3000);
  }
  function factOnce(k, obj) { if (coll[k]) return; coll[k] = 1; put(CKEY, coll); factQ.push(obj || k); if (!factOn) nextFact(); } // once per device
  $("fact").addEventListener("pointerdown", function (e) { e.stopPropagation(); e.preventDefault(); nextFact(); });
  // ---------- power-ups: scalpel (Normie: net) and shake ----------
  $("cut").onclick = function () { if (!cuts || over) return; arm = arm === "cut" ? false : "cut"; if (arm) { toast(K.TOOL.hint); factQ = []; nextFact(); } tbarUI(); this.blur(); };
  $("rx").onclick = function () { if (!RX || over || (!doses && arm !== "rx")) return; arm = arm === "rx" ? false : "rx"; if (arm) { toast(RXK.ready); factQ = []; nextFact(); } tbarUI(); this.blur(); };
  $("shake").onclick = function () { doShake(); this.blur(); };
  function cutAt(px, py) {
    var bs = pieces(), hit = null, best = 1e9;
    bs.forEach(function (o) { var dx = o.position.x - px, dy = o.position.y - py, d = Math.sqrt(dx * dx + dy * dy) - rad(o); if (d < 12 && d < best) { best = d; hit = o; } });
    if (!hit) return false;
    hit.gone = true; if (hit.inf) { var wr = hit.wasRes; setInf(hit, false); infCleared++; if (RX) { if (wr) resCleared++; if (!infN) toast(RXK.clear); } else if (!infN) { score += 50; TL.cure += 50; toast(OUTK.clear); } }
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

  // ---------- weekly features: runtime ----------
  var BG = K.BG, SPEC = K.SPEC, HID = K.HID, NARROW = 24;
  var ernd = Math.random, TILT = 1, FLOW = 1, envFx = [], lights = [];
  var SP = "", MUT = null, SKIN = "", GOALS = null, gDone = [], madeN = [], nMerge = 0, mixN = 0, tootN = 0, slowN = 0, PREV = false, nx2 = -1;
  var brnd, qrnd, drnd, hrnd, curG = 0, nxtG = 0, driftA = 0, driftP = 1200, driftPh = 0, lastQT = 0, lastNoT = 0, noPairs = {}, sparks = [], hidRun = { sp: {}, tc: 0 };
  var LEARN = false, learnT, learnI = {};
  // items 12-15 (from 16 Nov 2026): combo meter + Fever, rising combo notes, clutch saves, end-of-game tally. Cosmetic randomness only (particles).
  var JUICE = false, METER = 8, FEVER_STEPS = 600, meter = 0, feverS = 0, dangerT = 0, lastSave = -1e9, saves = 0, TL = {};
  function juiceChain(x, y, n) { // "×n" at the merge point, growing with the chain; shake and sparkle escalate (none when reduced motion)
    parts.push({ k: "t", x: x, y: y - 26, vx: 0, vy: -0.9, g: 0, t: 0, max: 900, c: "#D9415E", txt: "×" + n, big: Math.min(34, 18 + n * 3), gold: true });
    burst(x, y, Math.min(10, 2 + n * 1.5)); if (n >= 3) shakeBoard(n >= 5 ? 2 : 1);
  }
  function startFever() { feverS = FEVER_STEPS; meter = METER; toastBig("FEVER! ×2"); sfx("big"); buzz([20, 30, 20, 30, 20]); }
  function endFever() { meter = 0; toast(NORMIE ? "Fever’s over. Back to normal tides." : "Fever’s broken. Back to normal."); }
  function clutch(danger, now) { // a real save: the warning state was on for at least 1 s, and the pile came back below the line
    if (danger) { if (!dangerT) dangerT = now; return; }
    if (dangerT && now - dangerT >= 1000 && now - lastSave >= 20000) { lastSave = now; saves++; score += 25; TL.save += 25; slowN = 24; toastBig("Saved! +25"); sfx("chime"); hud(); }
    dangerT = 0;
  }
  function drawJuice(now) {
    if (!JUICE) return;
    var fr = feverS > 0 ? feverS / FEVER_STEPS : meter / METER;
    ctx.save(); ctx.fillStyle = "rgba(107,90,147,.15)"; ctx.fillRect(0, 0, W, 5);
    ctx.fillStyle = feverS > 0 ? "hsl(" + (quiet() ? 45 : 40 + 15 * Math.sin(now / 90)) + ",95%,55%)" : "#D9415E"; ctx.fillRect(0, 0, W * fr, 5);
    if (feverS > 0) { // gold sparkle border
      ctx.lineWidth = 6; ctx.strokeStyle = "rgba(245,200,66,.85)"; ctx.setLineDash([14, 8]); ctx.lineDashOffset = quiet() ? 0 : -now / 25; ctx.strokeRect(3, 3, W - 6, H - 6); ctx.setLineDash([]);
      ctx.fillStyle = "#B8860B"; ctx.font = "800 15px Poppins,system-ui,sans-serif"; ctx.textAlign = "right"; ctx.fillText("FEVER ×2 · " + Math.ceil(feverS / 60) + "s", W - 12, 24);
      if (!quiet() && Math.random() < 0.35) { var e = Math.random() * 4 | 0, px = e < 2 ? Math.random() * W : (e === 2 ? 4 : W - 4), py = e < 2 ? (e ? H - 4 : 4) : Math.random() * H; parts.push({ k: "s", x: px, y: py, vx: (Math.random() - 0.5), vy: (Math.random() - 0.5), g: 0, t: 0, max: 500, c: "#F5C842", sz: 3 + Math.random() * 3 }); }
    }
    ctx.restore();
  }
  // item 10: infection point drain (from 15 Nov 2026), own PRNG seeded from the date plus "drain"
  var DRAINDAY = "2026-11-15", DRAIN = false, xrnd, drained = 0;
  function drainTick() {
    var all = pieces();
    for (var i = 0; i < all.length; i++) {
      var o = all[i]; if (!o.inf) { o.drT = 0; continue; }
      if (!o.drT) { o.drT = steps + 150 + Math.floor(xrnd() * 120); continue; } // 2.5–4.5 s
      if (steps < o.drT) continue;
      o.drT = steps + 150 + Math.floor(xrnd() * 120);
      var amt = 3 + Math.floor(xrnd() * 13); if (o.res) amt = Math.round(amt * 1.5);
      var lost = Math.min(score, amt); score -= lost; drained += lost;
      parts.push({ k: "t", red: true, x: o.position.x + (xrnd() - 0.5) * 10, y: o.position.y - rad(o) * 0.4, vx: 0, vy: -0.6, g: 0, t: 0, max: 900, c: "#D0342C", txt: "−" + amt });
      hud();
    }
  }
  function wildTip() { if (featUI() && (cur === WILD || nxt === WILD) && !coll["t-wild"]) { coll["t-wild"] = 1; put(CKEY, coll); toast(K.WTIP); } }
  function mut(id) { return !!(MUT && MUT.id === id); }
  function drawG() { var tot = 0, i, x; for (i = 0; i < BG.w.length; i++) tot += BG.w[i]; x = brnd() * tot; for (i = 0; i < BG.w.length; i++) { x -= BG.w[i]; if (x < 0) return i; } return 0; }
  function bgPair(a, b) { return bgOK(a, b) ? b : bgOK(b, a) ? a : -1; } // merged piece takes the recipient's group; -1 = incompatible
  var FACES = ART.map(function (s) { var f = [], re = /translate\(([\d.]+) ([\d.]+)\) scale\(([\d.]+)\)/g, m; while ((m = re.exec(s))) f.push([+m[1], +m[2], +m[3]]); return f; });
  var TOPS = HULL.map(function (h) { var t = h[0]; h.forEach(function (p) { if (p[1] < t[1]) t = p; }); return t; });
  function todayUI() {
    var t = $("today"), h = "", L = NORMIE ? 1 : 0;
    if (SP === "mut" && MUT) h = MUT.e + " " + (isLive() ? "Today’s mutation" : "Mutation") + ": <b>" + esc(MUT.n[L]) + "</b>. " + esc(MUT.d[L]);
    else if (SPEC[SP]) h = SPEC[SP].e + " <b>" + esc(SPEC[SP].n) + "</b>: " + esc(SPEC[SP].line);
    t.innerHTML = h; t.hidden = !h;
    $("more").hidden = !featUI();
  }
  // Sick Day Friday (Normie: Grumpy Friday): gentle, seeded quirks (qrnd only)
  function sickTick() {
    var all = pieces(), now = performance.now();
    for (var i = 0; i < all.length; i++) {
      var o = all[i]; if (o.lv >= O.length) continue;
      if (o.frz > steps) { Bd.setVelocity(o, { x: 0, y: 0 }); Bd.setAngularVelocity(o, 0); }
      if (!o.qT) { o.qT = steps + 120 + Math.floor(qrnd() * 300); continue; }
      if (steps < o.qT) continue;
      o.qT = steps + 240 + Math.floor(qrnd() * 360);
      quirk(o, now);
    }
  }
  function quirk(o, now) {
    var q = QUIRK[o.lv], x = o.position.x, y = o.position.y, r = rad(o), v = o.velocity, i;
    if (q === "brows") Bd.setVelocity(o, { x: v.x, y: v.y - 1.2 });
    else if (q === "sway") Bd.setAngularVelocity(o, o.angularVelocity + (qrnd() - 0.5) * 0.12);
    else if (q === "slip") o.blink = steps + 14;
    else if (q === "rattle") { o.rat = steps + 30; Bd.setVelocity(o, { x: v.x + (qrnd() - 0.5) * 1.6, y: v.y }); }
    else if (q === "shiver") { o.shiv = steps + 50; Bd.setVelocity(o, { x: v.x + (qrnd() - 0.5) * 1.0, y: v.y }); }
    else if (q === "drip") parts.push({ k: "d", x: x + (qrnd() - 0.5) * r * 0.4, y: y + r * 0.8, vx: 0, vy: 0.4, g: 0.12, t: 0, max: 900, c: NORMIE ? "#7EC4F0" : "#F2D85A", sz: 4 });
    else if (q === "toot" || q === "spew") {
      var dir = q === "toot" ? 0 : (qrnd() < 0.5 ? -1 : 1), px = x + dir * r * 0.75, py = q === "toot" ? y + r * 0.75 : y;
      var col = q === "toot" ? (NORMIE ? "rgba(70,50,110,1)" : "rgba(150,190,90,1)") : (NORMIE ? "rgba(120,190,240,1)" : "rgba(120,190,60,1)");
      for (i = 0; i < 6; i++) parts.push({ k: "c", x: px + (qrnd() - 0.5) * 10, y: py + (qrnd() - 0.5) * 8, vx: (dir || (qrnd() - 0.5)) * (0.4 + qrnd() * 0.6), vy: q === "toot" ? 0.3 : -0.3, g: 0, t: 0, max: 700, c: col, sz: 5 + qrnd() * 4 });
      pieces().forEach(function (t) { if (t === o || !touching(o, t, 6)) return; var dx = t.position.x - x, dy = t.position.y - y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dir && dx * dir <= 0) return; Bd.setVelocity(t, { x: t.velocity.x + dx / d * 1.2, y: t.velocity.y + Math.min(0, dy / d) * 1.2 }); });
      if (q === "toot") { tootN++; if (tootN === 5) hidSpawn("colon", x, y - r); }
    }
    else if (q === "fib") { Bd.setAngularVelocity(o, o.angularVelocity + (qrnd() - 0.5) * 0.08); Bd.setVelocity(o, { x: v.x + (qrnd() - 0.5) * 0.8, y: v.y }); }
    else if (q === "cough") { Bd.setVelocity(o, { x: v.x, y: Math.min(v.y, 0) - 2.2 }); for (i = 0; i < 4; i++) parts.push({ k: "c", x: x + (qrnd() - 0.5) * r * 0.6, y: y - r * 0.9, vx: (qrnd() - 0.5), vy: -0.6, g: 0, t: 0, max: 500, c: "rgba(200,210,230,1)", sz: 4 + qrnd() * 3 }); }
    else if (q === "freeze") { o.frz = steps + 45; burst(x, y, 2); }
    if (now - lastQT > 6000 && qrnd() < 0.5) { lastQT = now; toast(K.SICKT[o.lv]); }
  }
  // art-unit decorations drawn on top of a piece (inside its rotation): sick looks and seasonal skins. Cosmetic only.
  function deco(lv, bd, r, now) {
    if (lv >= O.length || (SP !== "sick" && !SKIN)) return;
    ctx.save(); ctx.scale(r / 50, r / 50); ctx.translate(-50, -50); ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (SP === "sick") {
      var q = QUIRK[lv];
      // everyone looks a bit poorly: a queasy tint and a sweat drop on every piece
      ctx.fillStyle = "rgba(140,200,110,.2)"; ctx.beginPath(); ctx.arc(50, 50, 44, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#9FD3F5"; ctx.strokeStyle = "#3A6E99"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(82, 10); ctx.quadraticCurveTo(90, 24, 82, 28); ctx.quadraticCurveTo(74, 24, 82, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
      if ((q === "brows" || NORMIE) && !SICKIMG[lv]) FACES[lv].forEach(function (f) { var k = f[2]; ctx.strokeStyle = "#2A1E3D"; ctx.lineWidth = (lv === 0 ? 5 : 3) * k; ctx.beginPath();
        ctx.moveTo(f[0] - 14 * k, f[1] - 9 * k); ctx.lineTo(f[0] - 4 * k, f[1] - 5 * k); ctx.moveTo(f[0] + 14 * k, f[1] - 9 * k); ctx.lineTo(f[0] + 4 * k, f[1] - 5 * k); ctx.stroke(); });
      if (!NORMIE && q === "slip") { ctx.strokeStyle = "#D9364E"; ctx.lineWidth = 1.6; ctx.beginPath();
        [0.3, 1.2, 2.2, 3.1, 4.0, 5.2].forEach(function (a) { var c = Math.cos(a), s = Math.sin(a); ctx.moveTo(50 + c * 44, 50 + s * 44); ctx.lineTo(50 + c * 36 + s * 3, 50 + s * 36 - c * 3); ctx.lineTo(50 + c * 28, 50 + s * 28); ctx.moveTo(50 + c * 36 + s * 3, 50 + s * 36 - c * 3); ctx.lineTo(50 + c * 33 - s * 5, 50 + s * 33 + c * 5); });
        ctx.stroke(); if (bd && bd.blink > steps) { ctx.fillStyle = "#F5D7D7"; ctx.beginPath(); ctx.arc(50, 50, 45, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#3A2A55"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(18, 52); ctx.quadraticCurveTo(50, 66, 82, 52); ctx.stroke(); } }
      if (!NORMIE && q === "sway") { ctx.fillStyle = "rgba(255,255,255,.3)"; ctx.beginPath(); ctx.arc(50, 64, 30, 0, Math.PI * 2); ctx.fill(); }
      if (q === "freeze") { ctx.fillStyle = "rgba(160,215,255,.42)"; ctx.beginPath(); ctx.arc(50, 50, 44, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(225,245,255,.95)"; ctx.strokeStyle = "#5A8FC0"; ctx.lineWidth = 1.5; [30, 44, 58, 70].forEach(function (x, i) { ctx.beginPath(); ctx.moveTo(x - 4, 84); ctx.lineTo(x + 4, 84); ctx.lineTo(x, 92 + (i % 2) * 5); ctx.closePath(); ctx.fill(); ctx.stroke(); }); }
    }
    if (SKIN) {
      var t = TOPS[lv], tx = t[0], ty = t[1];
      if (SKIN === "xmas") {
        ctx.fillStyle = "#D93A3A"; ctx.strokeStyle = "#3A2A55"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(tx - 19, ty + 6); ctx.quadraticCurveTo(tx - 6, ty - 30, tx + 22, ty - 22); ctx.quadraticCurveTo(tx + 6, ty - 10, tx + 19, ty + 6); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#FFFFFF"; ctx.beginPath(); ctx.ellipse(tx, ty + 6, 22, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(tx + 23, ty - 22, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      } else if (SKIN === "easter") {
        [-1, 1].forEach(function (s) { ctx.save(); ctx.translate(tx + s * 11, ty - 12); ctx.rotate(s * 0.25); ctx.fillStyle = "#FFFFFF"; ctx.strokeStyle = "#3A2A55"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(0, 0, 8, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#F7B6CC"; ctx.beginPath(); ctx.ellipse(0, 2, 4, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); });
      } else if (SKIN === "hall") {
        ctx.fillStyle = "rgba(110,170,90,.38)"; ctx.beginPath(); ctx.arc(50, 50, 42, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#3A2A55"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(26, 30); ctx.lineTo(48, 24); for (var s2 = 0; s2 < 4; s2++) { var sx = 29 + s2 * 6, sy = 29 - s2 * 1.6; ctx.moveTo(sx, sy - 4); ctx.lineTo(sx + 1, sy + 4); } ctx.stroke();
      }
    }
    ctx.restore();
  }
  // unrotated labels: blood group / flavour badge and learn-mode names
  function tags(lv, g, x, y, r) {
    if (SP === "blood" && g !== undefined && lv < O.length) {
      var s = BG.names[g], fs = NORMIE ? 10 : 12; ctx.save(); ctx.font = "700 " + fs + "px Poppins,system-ui,sans-serif"; var w = ctx.measureText(s).width + 8, bx = x + r * 0.42, by = y + r * 0.42;
      ctx.fillStyle = BG.col[g]; ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx - w / 2, by - fs * 0.75, w, fs * 1.5, fs * 0.75) : ctx.rect(bx - w / 2, by - fs * 0.75, w, fs * 1.5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#FFFFFF"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(s, bx, by + 0.5); ctx.restore();
    }
    if (lv === WILD && featUI()) { // item 11: make the wild piece read as special
      ctx.save(); ctx.font = "800 9px Poppins,system-ui,sans-serif"; var lw = ctx.measureText(K.WLAB).width + 10, ly2 = y + r + 9;
      ctx.fillStyle = "#7A3FB8"; ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - lw / 2, ly2 - 7, lw, 14, 7) : ctx.rect(x - lw / 2, ly2 - 7, lw, 14); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#FFFFFF"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(K.WLAB, x, ly2 + 0.5);
      var tw = performance.now() / 260; ctx.fillStyle = "#F5C842"; [0, 2.1, 4.2].forEach(function (a) { var sx = x + Math.cos(a + tw) * (r + 6), sy = y + Math.sin(a + tw) * (r + 6), z = quiet() ? 2.5 : 2 + Math.sin(tw * 2 + a); ctx.beginPath(); ctx.moveTo(sx, sy - z * 2); ctx.lineTo(sx + z * 0.6, sy); ctx.lineTo(sx, sy + z * 2); ctx.lineTo(sx - z * 0.6, sy); ctx.closePath(); ctx.fill(); });
      ctx.restore();
    }
    if (LEARN && lv === WILD) { ctx.save(); ctx.font = "700 11px Poppins,system-ui,sans-serif"; ctx.textAlign = "center"; ctx.lineWidth = 3.5; ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.fillStyle = "#2A1E3D"; ctx.strokeText(WO.n + " (wild)", x, y - r - 6); ctx.fillText(WO.n + " (wild)", x, y - r - 6); ctx.restore(); }
    if (LEARN && lv < O.length) {
      ctx.save(); ctx.font = "700 11px Poppins,system-ui,sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineWidth = 3.5; ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.fillStyle = "#2A1E3D";
      var ly = y - r * 0.62; ctx.strokeText(O[lv].n, x, ly); ctx.fillText(O[lv].n, x, ly); ctx.restore();
    }
  }
  var FLAKES = []; for (var fi = 0; fi < 46; fi++) FLAKES.push([Math.random() * W, Math.random() * H, 1 + Math.random() * 2.2, 0.2 + Math.random() * 0.5]);
  var STARS = []; for (var si = 0; si < 60; si++) STARS.push([(si * 97.31) % W, (si * 53.7 + (si % 7) * 31) % H, 0.6 + (si % 3) * 0.5]);

  // ---------- environment mutations (from 17 Nov 2026). Seeded with ernd so everyone gets the same events on the same day ----------
  function envTick() {
    var t = steps;
    if (mut("flow")) engine.gravity.x = 0.14 * FLOW * (Math.floor(t / 1800) % 2 ? -1 : 1);
    if (mut("water") && t % 90 === 45) pieces().forEach(function (o) { if (o.lv <= 1 && o.position.y > LINE + 60) { Bd.setVelocity(o, { x: o.velocity.x, y: o.velocity.y - 2.2 }); envFx.push({ k: "b", x: o.position.x, y: o.position.y, t: 0 }); } });
    if (mut("quake") && t > 600 && t % 1200 === 0) { shakeBoard(2); toast(NORMIE ? "🌊 Big wave!" : "📳 Tremor!"); sfx("snip");
      pieces().forEach(function (o) { var k = 1 / Math.sqrt(1 + (o.lv < O.length ? o.lv : 0) * 0.3); Bd.setVelocity(o, { x: o.velocity.x + (ernd() - 0.5) * 6 * k, y: o.velocity.y - (1.5 + ernd() * 2) * k }); }); }
    if (mut("gust") && t > 450 && t % 900 === 450) { var dir = ernd() < 0.5 ? -1 : 1; toast(NORMIE ? (dir > 0 ? "💨 Gust from the left!" : "💨 Gust from the right!") : (dir > 0 ? "🤧 Achoo! (from the left)" : "🤧 Achoo! (from the right)")); envFx.push({ k: "w", d: dir, t: 0 });
      pieces().forEach(function (o) { if (o.position.y < H * 0.55) { var k = 1 / Math.sqrt(1 + (o.lv < O.length ? o.lv : 0) * 0.35); Bd.setVelocity(o, { x: o.velocity.x + dir * 4 * k, y: o.velocity.y - 0.6 }); } }); }
    if (mut("acid") && t % 6 === 0) pieces().forEach(function (o) {
      if (o.lv >= O.length) return;
      if (o.position.y + rad(o) > H - 16 && Math.abs(o.velocity.y) < 0.5) o.acid = (o.acid || 0) + 6; else if (o.acid) o.acid = Math.max(0, o.acid - 3);
      if (o.acid >= 1500) { var x = o.position.x, y = o.position.y, lv = o.lv; C.remove(engine.world, o); o.gone = true; poof(x, y, info(lv).r);
        if (lv > 0) { var n = add(lv - 1, x, y); n.acid = 0; } toast(NORMIE ? "🧪 The toxic tide shrank one!" : "🧪 Acid ate a bit of " + info(lv).n + "."); }
    });
  }
  function drawEnvBG(dark, now) {
    if (mut("water")) { var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, dark ? "rgba(40,80,140,.25)" : "rgba(150,205,240,.25)"); g.addColorStop(1, dark ? "rgba(20,50,110,.45)" : "rgba(90,160,220,.35)"); ctx.fillStyle = g; ctx.fillRect(0, LINE, W, H - LINE); }
    if (mut("flow")) { var dir = FLOW * (Math.floor(steps / 1800) % 2 ? -1 : 1), off = quiet() ? 0 : (now / 25 * dir) % 40; ctx.strokeStyle = dark ? "rgba(240,120,130,.18)" : "rgba(200,60,80,.12)"; ctx.lineWidth = 3;
      for (var yy = LINE + 40; yy < H; yy += 70) for (var xx = -40; xx < W + 40; xx += 40) { var cx = xx + off; ctx.beginPath(); ctx.moveTo(cx - 6 * dir, yy - 8); ctx.lineTo(cx + 6 * dir, yy); ctx.lineTo(cx - 6 * dir, yy + 8); ctx.stroke(); }
      if (mut("flow") && NORMIE === false) { ctx.fillStyle = dark ? "rgba(140,30,50,.12)" : "rgba(220,90,100,.07)"; ctx.fillRect(0, LINE, W, H - LINE); } }
    if (mut("acid")) { var a = ctx.createLinearGradient(0, H - 40, 0, H); a.addColorStop(0, "rgba(150,210,60,0)"); a.addColorStop(1, dark ? "rgba(150,210,60,.6)" : "rgba(120,185,30,.55)"); ctx.fillStyle = a; ctx.fillRect(0, H - 40, W, 40); }
    if (mut("jelly")) { ctx.fillStyle = dark ? "rgba(120,220,160,.08)" : "rgba(120,200,150,.1)"; ctx.fillRect(0, LINE, W, H - LINE); }
    if (mut("tilt")) { ctx.save(); ctx.fillStyle = dark ? "rgba(180,168,207,.18)" : "rgba(107,90,147,.12)"; ctx.beginPath(); if (TILT > 0) { ctx.moveTo(0, H); ctx.lineTo(W, H); ctx.lineTo(W, H - 26); } else { ctx.moveTo(0, H - 26); ctx.lineTo(0, H); ctx.lineTo(W, H); } ctx.closePath(); ctx.fill();
      ctx.font = "600 13px Poppins,system-ui,sans-serif"; ctx.textAlign = TILT > 0 ? "right" : "left"; ctx.fillStyle = dark ? "rgba(220,210,240,.6)" : "rgba(80,64,120,.55)"; ctx.fillText(TILT > 0 ? "leaning this way →" : "← leaning this way", TILT > 0 ? W - 10 : 10, LINE + 22); ctx.restore(); }
  }
  function drawEnvFG(dark, now) {
    for (var i = envFx.length - 1; i >= 0; i--) { var f = envFx[i]; f.t++;
      if (f.k === "b") { ctx.strokeStyle = dark ? "rgba(200,230,255,.8)" : "rgba(80,150,210,.7)"; ctx.lineWidth = 1.5; for (var j = 0; j < 3; j++) { ctx.beginPath(); ctx.arc(f.x + (j - 1) * 8 + Math.sin(f.t / 6 + j) * 3, f.y - f.t * 1.4 - j * 9, 3 + j, 0, Math.PI * 2); ctx.stroke(); } if (f.t > 50) envFx.splice(i, 1); }
      else if (f.k === "w") { if (!quiet()) { ctx.strokeStyle = dark ? "rgba(230,230,255,.5)" : "rgba(120,110,160,.35)"; ctx.lineWidth = 2; for (var k = 0; k < 7; k++) { var y = LINE + 20 + k * 34, x0 = f.d > 0 ? -60 + f.t * 12 : W + 60 - f.t * 12; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 - f.d * 50, y); ctx.stroke(); } } if (f.t > 45) envFx.splice(i, 1); }
    }
    if (mut("acid")) pieces().forEach(function (o) { if (o.acid > 0) { ctx.strokeStyle = "rgba(130,190,40," + Math.min(0.9, o.acid / 1500) + ")"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(o.position.x, o.position.y, rad(o) + 2, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); } });
    if (mut("lights") && !over) {
      lights = lights.filter(function (l) { return now - l.t < 2600; });
      ctx.save(); ctx.beginPath(); ctx.rect(0, LINE, W, H - LINE);
      var ax = aimClamp(info(cur).r), bw = Math.max(26, info(cur).r + 10); ctx.rect(ax + bw, LINE, -2 * bw, H - LINE); // a torch beam straight down from your aim
      lights.forEach(function (l) { var r = 95 * Math.min(1, (2600 - (now - l.t)) / 900); if (r > 4) { ctx.moveTo(l.x + r, l.y); ctx.arc(l.x, l.y, r, 0, Math.PI * 2, true); } });
      ctx.fillStyle = dark ? "rgba(8,6,16,.88)" : "rgba(30,24,50,.82)"; ctx.fill("evenodd"); ctx.restore();
    }
  }
  function drawBG(dark, now) {
    if (SP === "micro") { ctx.fillStyle = dark ? "#151226" : "#F1F0FA"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = dark ? "rgba(230,230,255,.6)" : "rgba(90,80,140,.25)";
      STARS.forEach(function (s, i) { ctx.globalAlpha = quiet() ? 1 : 0.6 + 0.4 * Math.sin(now / 700 + i); ctx.beginPath(); ctx.arc(s[0], s[1], s[2], 0, Math.PI * 2); ctx.fill(); }); ctx.globalAlpha = 1; }
    if (SKIN === "xmas") { var gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, dark ? "#1B2340" : "#E4F1FB"); gr.addColorStop(1, dark ? "#2A2F4A" : "#FFFFFF"); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = dark ? "#DDE6F5" : "#F7FBFF"; ctx.beginPath(); ctx.moveTo(0, H); for (var x = 0; x <= W; x += 20) ctx.lineTo(x, H - 14 - 6 * Math.sin(x / 37)); ctx.lineTo(W, H); ctx.fill(); }
    else if (SKIN === "hall") { var g2 = ctx.createLinearGradient(0, 0, 0, H); g2.addColorStop(0, "#2B1D3F"); g2.addColorStop(1, dark ? "#1A1426" : "#4A3466"); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#F5C35A"; ctx.beginPath(); ctx.arc(W - 60, 150, 26, 0, Math.PI * 2); ctx.fill(); }
    else if (SKIN === "easter") { ctx.fillStyle = dark ? "#252033" : "#FBF6EC"; ctx.fillRect(0, 0, W, H); ["#F7C8D8", "#C8E6F7", "#D8F2C8", "#F7EBC0"].forEach(function (c, i) { ctx.fillStyle = c; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.ellipse(40 + i * 105, H - 16, 11, 14, 0, 0, Math.PI * 2); ctx.fill(); }); ctx.globalAlpha = 1; }
    if (MUT) drawEnvBG(dark, now);
    if (mut("narrow")) { ctx.fillStyle = dark ? "rgba(180,168,207,.14)" : "rgba(107,90,147,.10)"; ctx.fillRect(0, 0, NARROW, H); ctx.fillRect(W - NARROW, 0, NARROW, H); }
  }
  function drawFG(dark, now) {
    if (SKIN === "xmas") {
      if (!quiet()) FLAKES.forEach(function (f) { f[1] += f[3]; f[0] += Math.sin(now / 900 + f[1] / 50) * 0.2; if (f[1] > H) { f[1] = -4; f[0] = Math.random() * W; } });
      ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.strokeStyle = "rgba(120,150,190,.5)"; ctx.lineWidth = 0.6; FLAKES.forEach(function (f) { ctx.beginPath(); ctx.arc(f[0], f[1], f[2], 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
      ctx.lineWidth = 4; for (var x = 0, i = 0; x < W; x += 40, i++) { ctx.strokeStyle = i % 2 ? "#D93A3A" : "#2F9A55"; ctx.beginPath(); ctx.moveTo(x, 2); ctx.quadraticCurveTo(x + 20, 18, x + 40, 2); ctx.stroke(); ctx.fillStyle = ["#F5C842", "#5EC8F2", "#FF7A9A"][i % 3]; ctx.beginPath(); ctx.arc(x + 20, 11, 4, 0, Math.PI * 2); ctx.fill(); }
    }
    drawSparks(now);
  }
  // learn mode: names on pieces and a rotating fact on each merge
  function learnFact(lv) {
    if (!LEARN || lv >= O.length) return;
    var i = learnI[lv] = ((learnI[lv] === undefined ? -1 : learnI[lv]) + 1) % 2, tx = i ? K.FACTS2[lv] : K.FACTS[lv], el = $("learn");
    el.innerHTML = pic(lv, 20) + "<span>" + esc(tx) + "</span>"; el.hidden = false; clearTimeout(learnT); learnT = setTimeout(function () { el.hidden = true; }, 4200);
  }
  // ward round goals
  function goalVal(g, fin) {
    if (g.id === "make") return (madeN[g.lv] || 0) >= g.n;
    if (g.id === "score") return score >= g.n;
    if (g.id === "chain") return bestChain >= g.n;
    if (g.id === "merges") return nMerge >= g.n;
    if (g.id === "inf3") return infCleared >= 3;
    if (g.id === "mix4") return mixN >= 4;
    if (g.id === "nocut") return fin && cuts >= 3;
    if (g.id === "noshake") return fin && shakeLeft > 0;
    return false;
  }
  function goalTick(fin) {
    if (!GOALS || practice || over && !fin) return;
    GOALS.forEach(function (g, i) { if (!gDone[i] && goalVal(g, fin)) { gDone[i] = true; if (!fin) { toast(K.GOALW + ": ✅ " + g.t); sfx("target"); } } });
    tbarUI();
  }
  function ticks(a) { return a.map(function (x) { return x ? "✅" : "⬜"; }).join(""); }
  function stickers() { return load("mrg-stick-" + (NORMIE ? "sea" : "med"), {}); }
  // collection cards
  function unlockCard(key, name) { if (coll[key]) return; coll[key] = 1; put(CKEY, coll); if (featUI()) setTimeout(function () { toast("📖 New card: " + name); }, 1200); }
  function specFact(key, f, lv, badge) { factOnce(key, { pic: pic(lv, 32), t: f.t, x: f.x }); }
  function onFirstDrop() {
    if (SPEC[SP]) { specFact("f-" + SP, SPEC[SP].fact, SP === "blood" ? 1 : SP === "micro" ? O.length - 1 : 8); if (SP !== "blood") unlockCard(SP, SPEC[SP].n); }
    if (SKIN && K.SKIN[SKIN]) unlockCard("s-" + SKIN, K.SKIN[SKIN].n);
  }
  // ---------- hidden finds (from 16 Nov 2026): bonus sparkles, own PRNG (hrnd), never scored ----------
  function hidOn() { return goalsOn(day) && !over; }
  function hidFound(id) { return !!coll["h-" + id]; }
  function hidDef(id) { for (var i = 0; i < HID.length; i++) if (HID[i].id === id) return HID[i]; return null; }
  function hidSpawn(id, x, y, force) {
    if (!force && (!hidOn() || hidFound(id) || hidRun.sp[id] && id !== "testicle")) return false;
    if (sparks.some(function (s) { return s.id === id; })) return false;
    hidRun.sp[id] = 1; sparks.push({ id: id, x: Math.max(30, Math.min(W - 30, x)), y: Math.max(LINE + 20, Math.min(H - 30, y)), t0: performance.now() });
    sfx("chime"); return true;
  }
  function hidMerge(x, y, n) { // per-merge chances, all from hrnd so the same day plays the same for everyone
    if (!hidOn()) return;
    var h = hrnd(), h2 = hrnd(), h3 = hrnd(), hr = new Date().getHours(), dark = document.documentElement.getAttribute("data-theme") === "dark";
    if (steps < 3600 && h < 0.03) hidSpawn("thymus", x, y);
    if ((hr >= 21 || hr < 5 || dark) && h2 < 0.02) hidSpawn("pineal", x, y);
    if (h3 < 0.0006) hidSpawn("ovary", x, y); // about one in 1,700 merges: roughly once a month for a daily player
    if (!hidFound("testicle") && hrnd() < (hidRun.tc ? 0.03 : 0.004)) hidSpawn("testicle", x, y);
    if (n === O.length - 1 && hidFound("ovary")) hidSpawn("uterus", x, y);
  }
  function hidTick() { // time and drop based triggers
    if (!hidOn()) return;
    if (SP === "micro" && steps === 10800) hidSpawn("bone", W / 2, H / 2); // 3 minutes of game time
    if (practice && drops === 206 && !hidRun.sp.bone) hidSpawn("bone", aimX, H / 2);
  }
  function drawSparks(now) {
    for (var i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i], k = (now - s.t0) / 4000; if (k >= 1) { sparks.splice(i, 1); continue; }
      var x = s.x + Math.sin(k * 9) * 6, y = s.y - 60 * k, al = k > 0.8 ? (1 - k) / 0.2 : 1, rr = 14 + 2 * Math.sin(now / 120);
      ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y); ctx.rotate(quiet() ? 0 : now / 600);
      ctx.fillStyle = "hsla(" + (quiet() ? 45 : (now / 6) % 360) + ",90%,65%,.35)"; ctx.beginPath(); ctx.arc(0, 0, rr + 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#FFE680"; ctx.strokeStyle = "#B8860B"; ctx.lineWidth = 2; ctx.beginPath();
      for (var j = 0; j < 10; j++) { var a = j * Math.PI / 5 - Math.PI / 2, d = j % 2 ? rr * 0.45 : rr; ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d); } ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore(); s.cx = x; s.cy = y;
    }
  }
  function sparkAt(px, py) {
    for (var i = sparks.length - 1; i >= 0; i--) { var s = sparks[i], dx = (s.cx || s.x) - px, dy = (s.cy || s.y) - py; if (dx * dx + dy * dy < 34 * 34) { sparks.splice(i, 1); catchSpark(s); return true; } }
    return false;
  }
  function catchSpark(s) {
    var d = hidDef(s.id); if (!d) return;
    burst(s.cx || s.x, s.cy || s.y, 6); sfx("target"); buzz([15, 25, 15]);
    if (s.id === "testicle" && !hidFound("testicle")) { hidRun.tc++; if (hidRun.tc < 2) { toast(NORMIE ? "🎲 One die! It needs its partner…" : "✨ One down. They always come as a pair…"); return; } }
    if (hidFound(s.id)) return;
    coll["h-" + s.id] = 1; put(CKEY, coll);
    toast("🎉 " + K.HIDW + " found: " + d.n + "! It’s in your Collection.");
    if (HID.every(function (h) { return hidFound(h.id); }) && !coll.full) { coll.full = 1; put(CKEY, coll); setTimeout(function () { toastBig("🏅 " + K.FULL.n + "!"); toast("🏅 " + K.FULL.n + " unlocked! " + K.FULL.d); }, 2400); }
  }
  // ---------- More menu (goals, collection, learn mode) and the collection book ----------
  function overlay(id, html) {
    var o = document.getElementById(id); if (o) o.remove();
    o = document.createElement("div"); o.id = id; o.className = "mrg-help-ov"; o.innerHTML = html; document.body.appendChild(o);
    function close() { o.remove(); document.removeEventListener("keydown", k); }
    function k(e) { if (e.key === "Escape") close(); }
    o.addEventListener("click", function (e) { if (e.target === o || e.target.closest("[data-close]")) close(); });
    document.addEventListener("keydown", k);
    var b = o.querySelector("[data-close]"); if (b) try { b.focus({ preventScroll: true }); } catch (e) {}
    var cd = o.querySelector(".mrg-help-card"); if (cd) cd.scrollTop = 0;
    return o;
  }
  function goalsHTML() {
    if (!GOALS) return '<p class="mrg-mm-note">Ward round goals start on Monday 16 November.</p>';
    var fin = st && st.done && st.goals, done = practice ? (fin ? st.goals : []) : gDone;
    return '<ul class="mrg-goals">' + GOALS.map(function (g, i) { return "<li>" + (done[i] ? "✅" : "⬜") + " " + esc(g.t) + "</li>"; }).join("") + "</ul>" +
      '<p class="mrg-mm-note">' + (practice ? "Practice games don’t tick goals." + (fin ? " These are from your daily run." : "") : "Same goals for everyone today. Tick all 3 for a " + K.STICK + " sticker.") + "</p>";
  }
  function openMore() {
    var o = overlay("mrg-more-ov", '<div class="mrg-help-card mrg-mm" role="dialog" aria-modal="true" aria-labelledby="mrg-mm-h"><h2 id="mrg-mm-h">' + esc(K.GOALW) + "</h2>" + goalsHTML() +
      '<button type="button" class="mrg-mm-btn" id="mrg-mm-book">📖 Collection book</button>' +
      '<label class="mrg-mm-tog"><input type="checkbox" id="mrg-mm-learn"' + (LEARN ? " checked" : "") + "> <span><b>Learn mode</b><br>Names on pieces and a fact with each merge. Doesn’t change scoring.</span></label>" +
      '<button type="button" class="mrg-help-go" data-close>Done</button></div>');
    o.querySelector("#mrg-mm-book").onclick = function () { o.remove(); openBook(); };
    o.querySelector("#mrg-mm-learn").onchange = function () { setLearn(this.checked); };
  }
  function setLearn(on) { LEARN = !!on && featUI(); put("mrg-learn", LEARN ? 1 : 0); if (!LEARN) $("learn").hidden = true; }
  function card(art, name, facts, got, hint, extra) {
    return '<div class="mrg-card' + (got ? "" : " locked") + '"><div class="mrg-card-art">' + art + (extra && got ? '<span class="mrg-card-x">' + extra + "</span>" : "") + "</div><b>" + esc(got ? name : "???") + "</b>" +
      (got ? facts.map(function (f) { return "<p>" + esc(f) + "</p>"; }).join("") : '<p class="hint">' + esc(hint) + "</p>") + "</div>";
  }
  function bookHTML() {
    var L = NORMIE ? 1 : 0, cards = [], n = 0, tot = 0;
    function add2(html, got) { cards.push(html); tot++; if (got) n++; }
    O.forEach(function (o, i) { add2(card(pic(i, 56), o.n, [K.FACTS[i], K.FACTS2[i]], !!coll[i], "Make it to unlock."), !!coll[i]); });
    var sp = [
      ["w", pic(WILD, 56), WO.n + " (wild)", [K.WTIP, K.WFACT.replace(/^Wild piece! It merges with anything\. /, ""), K.WFACT2], "A rare wild drop.", "✨"],
      ["c", pic(CURE, 56), PO.n, [OUTK.fact.replace(/^[^!]+! [^.]+\. /, "")], NORMIE ? "Slick Sunday." : "Outbreak Sunday.", ""],
      ["o-", pic(NORMIE ? 0 : 1, 56), NORMIE ? "Plain: the easy guest" : "O negative donor", [NORMIE ? "Plain goes with every flavour, a bit like O negative blood goes with every group." : "O negative red cells can be given to almost anyone, so it’s called the universal donor. About 7% of Australians are O negative (Lifeblood)."], (NORMIE ? "Potluck" : "Blood Bank") + " Wednesday: pair a " + BG.names[BG.donor] + ".", NORMIE ? "Plain" : "O−"],
      ["micro", pic(O.length - 1, 56), SPEC.micro.n, [SPEC.micro.fact.x], "Play a " + SPEC.micro.n + ".", SPEC.micro.e],
      ["sick", pic(8, 56), SPEC.sick.n, [SPEC.sick.fact.x], "Play a " + SPEC.sick.n + ".", SPEC.sick.e]
    ];
    ["xmas", "hall", "easter"].forEach(function (s) { var d = K.SKIN[s]; sp.push(["s-" + s, pic(d.lv, 56), d.n, [d.fact], s === "xmas" ? "Play 1–26 December." : s === "hall" ? "Play 25–31 October." : "Play in Easter week.", d.e]); });
    var spc = sp.map(function (c) { var got = !!coll[c[0]]; tot++; if (got) n++; return card(c[1], c[2], c[3], got, c[4], c[5]); });
    var hid = HID.map(function (h) { var got = hidFound(h.id); tot++; if (got) n++; return card('<img src="data:image/svg+xml,' + encodeURIComponent(h.art) + '" width="56" height="56" alt="">', h.n, [h.fact], got, "Clue: " + h.clue, ""); });
    var hn = HID.filter(function (h) { return hidFound(h.id); }).length;
    var sk = stickers(), row = "", today = dayNum(REAL);
    for (var k = 13; k >= 0; k--) { var d = new Date((today - k) * 864e5).toISOString().slice(0, 10); row += '<span class="mrg-st' + (sk[d] ? " got" : "") + '" title="' + nice(d) + '"><i>' + (sk[d] ? K.STICK : "") + "</i>" + (+d.slice(8)) + "</span>"; }
    return '<div class="mrg-help-card mrg-book" role="dialog" aria-modal="true" aria-labelledby="mrg-bk-h"><h2 id="mrg-bk-h">📖 Collection <small>' + n + "/" + tot + "</small></h2>" +
      '<h3>' + (NORMIE ? "Sea creatures" : "Organs") + '</h3><div class="mrg-cards">' + cards.join("") + "</div>" +
      "<h3>Specials</h3><div class=\"mrg-cards\">" + spc.join("") + "</div>" +
      "<h3>" + (NORMIE ? "Hidden treasures" : "Hidden organs") + " <small>" + hn + "/" + HID.length + "</small></h3>" +
      '<p class="mrg-mm-note">Bonus sparkles turn up now and then. Tap one before it floats away.' + (coll.full ? " <b>🏅 " + esc(K.FULL.n) + "</b>" : "") + '</p><div class="mrg-cards">' + hid.join("") + "</div>" +
      "<h3>" + esc(K.GOALW) + " stickers</h3><div class=\"mrg-strow\">" + row + "</div>" +
      '<button type="button" class="mrg-help-go" data-close>Close</button></div>';
  }
  function openBook() { overlay("mrg-book-ov", bookHTML()); }

  // ---------- end of run ----------
  var verdict = K.verdict;
  function band(tp) { return tp >= 10 ? 0 : tp >= 9 ? 1 : tp >= 8 ? 2 : tp >= 7 ? 3 : 4; }
  function gridOf(tp) { return O.map(function (o, i) { return i <= tp ? o.e : "⬜"; }).join(""); }
  function end() {
    goalTick(true); sparks = [];
    over = true; arm = false; tbarUI();
    var prevHi = stats.hi || 0, best = score > prevHi && prevHi > 0;
    sfx("over"); factQ = []; nextFact();
    var ov = $("over"), rq = K.REACT[top >= 8 ? 2 : top >= 6 ? 1 : 0];
    ov.innerHTML = '<div class="ovcard">' + (best ? '<p class="best">🏆 Best ever!</p>' : "") +
      '<div class="react">' + pic(top >= 0 ? top : 0, 56) + '<span class="bub">' + esc(pick(rq)) + "</span></div>" +
      "<b>Game over</b><span>" + fmt(score) + " points · " + (top >= 0 ? pic(top, 22) + " " + O[top].n : "") + "</span>" +
      (OUT ? "<span>" + OUTK.cleared + ": " + infCleared + (RX ? " (" + RXK.resWord + ": " + resCleared + ")" : "") + "</span>" : "") +
      (DRAIN && (OUT || drained) ? "<span>" + (NORMIE ? "Points lost to oil" : "Points lost to infection") + ": " + fmt(drained) + "</span>" : "") +
      '<div class="ovbtns"><button class="btn solid" type="button" id="mrg-ovagain">Play again</button><button class="btn" type="button" id="mrg-ovres">' + (practice ? "Results" : "Share result") + "</button></div>" +
      (practice ? "" : '<span class="ovnote">Next games are practice</span>') + "</div>";
    ov.hidden = false;
    $("ovagain").onclick = function () { newRun(true); };
    $("ovres").onclick = function () { $("result").scrollIntoView({ behavior: "smooth", block: "start" }); };
    if (best) { burst(W / 2, H / 3, 8); sfx("target"); }
    if (!practice && !st.done) {
      st = { done: true, win: top >= WIN_LV - 1, score: score, top: top, tgt: tgt, star: tgtHit, chain: bestChain, wild: wildUsed, out: OUT, cleared: infCleared, rx: RX, res: resCleared }; if (DRAIN) st.drain = drained;
      if (JUICE) { st.tally = { merge: TL.merge, combo: TL.combo, fever: TL.fever, cure: TL.cure, waste: TL.waste, drain: drained, save: TL.save, saves: saves, pb: best }; tallyAnim = true; }
      if (GOALS) { st.goals = gDone.slice(); st.sp = SP; st.mut = MUT ? MUT.id : ""; } put(KEY, st);
      if (GOALS && gDone.every(Boolean)) { var sk = stickers(); sk[day] = 1; put("mrg-stick-" + (NORMIE ? "sea" : "med"), sk); setTimeout(function () { toast("All 3 done! " + K.STICK + " sticker earned."); }, 600); }
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
  }
  function shareText() {
    var s = st.score, tp = st.top;
    var grid = gridOf(tp) + (st.wild ? " " + WO.e : "") + (st.out ? " " + OUTK.share + (st.rx ? " cleared " + (st.cleared || 0) : "") : "") + (st.star ? " ⭐" : "");
    var wk = "";
    if (st.goals) { var mm = null; MUTS.forEach(function (m) { if (m.id === st.mut) mm = m; }); wk = "\n" + (SPEC[st.sp] ? SPEC[st.sp].e + " " + SPEC[st.sp].short + " · " : mm ? mm.e + " " + mm.n[NORMIE ? 1 : 0] + " · " : "") + K.GOALW + " " + ticks(st.goals); }
    return "Mergeon #" + num(day) + (isLive() ? "" : " (archive)") + " " + (tp >= 0 ? O[tp].e : "") + "\n" + grid + wk + "\nScore " + fmt(s) + " · " + K.top + ": " + (tp >= 0 ? O[tp].n : "none") + (st.chain > 1 ? " · Chain ×" + st.chain : "") + "\nmaladywise.com";
  }
  // item 15: honest end-of-game tally. Every line is a real part of the score; they add up to the total.
  var tallyAnim = false, tallyT = [];
  function tallyRows(t, s) {
    var rows = [["Merges", t.merge]];
    if (t.combo || t.fever) rows.push([t.fever ? "Combo + Fever bonus" : "Combo bonus", t.combo + t.fever]);
    if (st.goals) rows.push([K.GOALW + " goals " + ticks(st.goals), null, st.goals.every(Boolean) ? K.STICK + " sticker" : "no points"]);
    if (t.cure || t.drain || t.waste || st.out) { rows.push([NORMIE ? "Clean-ups" : "Infection cures", t.cure]); rows.push([NORMIE ? "Lost to oil" : "Lost to infection", -(t.drain + t.waste)]); }
    if (t.save) rows.push(["Clutch saves ×" + t.saves, t.save]);
    rows.push(["Total", s, null, true]);
    return rows;
  }
  function tallyHTML(t, s) {
    return '<div class="tally" id="mrg-tally" role="list">' + tallyRows(t, s).map(function (r, i) {
      return '<div class="trow on' + (r[3] ? " tot" : "") + '" role="listitem" data-i="' + i + '"><span>' + esc(r[0]) + '</span><b data-v="' + (r[1] === null ? "" : r[1]) + '">' + (r[1] === null ? esc(r[2]) : (r[1] < 0 ? "−" : r[3] ? "" : "+") + fmt(Math.abs(r[1]))) + "</b></div>";
    }).join("") + (t.pb ? '<p class="tpb">🏆 New personal best!</p>' : "") + "</div>";
  }
  function tallyRun(t) {
    var box = $("tally"); if (!box) return; var rows = box.querySelectorAll(".trow"), pb = box.querySelector(".tpb"), i = 0, done = false;
    tallyT.forEach(clearTimeout); tallyT = [];
    function finish() { if (done) return; done = true; tallyT.forEach(clearTimeout); Array.prototype.forEach.call(rows, function (r) { r.classList.add("on"); var b = r.querySelector("b"), v = b.getAttribute("data-v"); if (v !== "") b.textContent = (v < 0 ? "−" : r.classList.contains("tot") ? "" : "+") + fmt(Math.abs(+v)); }); if (pb) { pb.classList.add("on"); confetti(); } }
    if (quiet()) { finish(); return; }
    Array.prototype.forEach.call(rows, function (r) { r.classList.remove("on"); });
    box.addEventListener("click", finish); box.title = "Tap to skip";
    function next() {
      if (done) return; if (i >= rows.length) { if (pb) { pb.classList.add("on"); confetti(); sfx("target"); } done = true; return; }
      var r = rows[i++], b = r.querySelector("b"), v = b.getAttribute("data-v"); r.classList.add("on");
      if (v === "") { sfx("tick"); tallyT.push(setTimeout(next, 350)); return; }
      v = +v; var k = 0, N = 12, tot = r.classList.contains("tot");
      (function step() { if (done) return; k++; var c = Math.round(v * k / N); b.textContent = (c < 0 ? "−" : tot ? "" : "+") + fmt(Math.abs(c)); sfx("tick"); if (k < N) tallyT.push(setTimeout(step, 28)); else tallyT.push(setTimeout(next, 260)); })();
    }
    tallyT.push(setTimeout(next, 300));
  }
  function renderResult(practiceScore) {
    var r = $("result"), s = st.score, tp = st.top;
    var share = shareText();
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0;
    r.hidden = false;
    r.innerHTML = (practiceScore !== undefined ? '<p class="prac">Practice: <b>' + fmt(practiceScore) + "</b> · " + (practiceScore > s ? "Better than your real run. Typical." : "Your daily run still stands.") + "</p>" : "") +
      '<p class="em-row">' + pic(tp >= 0 ? tp : 0, 64) + '</p><p class="score">' + fmt(s) + '<span> pts</span></p><p class="verdict">' + esc(verdict(tp)) + "</p>" +
      (st.tgt >= 0 ? '<p class="note">' + (st.star ? "⭐ Today’s target hit: " : "🎯 Today’s target missed: ") + esc(O[st.tgt].n) + (st.out ? " · " + OUTK.cleared + ": " + (st.cleared || 0) + (st.rx ? " (" + RXK.resWord + ": " + (st.res || 0) + ")" : "") : "") + "</p>" : "") +
      (st.drain !== undefined && st.out ? '<p class="note">' + (NORMIE ? "Points lost to oil" : "Points lost to infection") + ": " + fmt(st.drain) + "</p>" : "") +
      (st.tally ? tallyHTML(st.tally, s) : "") +
      (st.goals && goalsFor(day) ? '<p class="note">' + esc(K.GOALW) + ": " + goalsFor(day).map(function (g, i) { return (st.goals[i] ? "✅ " : "⬜ ") + esc(g.t); }).join(" · ") + "</p>" : "") +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>' + K.win + '</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + fmt(stats.hi || 0) + "</b><span>High score</span></div></div>" +
      '<pre id="mrg-share">' + esc(share) + '</pre><div class="btns"><button class="btn solid" type="button" id="mrg-copy">Copy result</button><button class="btn solid" type="button" id="mrg-again">Play again</button><span class="again-note">Practice game, doesn’t count</span></div>';
    r.appendChild(lbBox); lbRender();
    if (st.tally && tallyAnim) { tallyAnim = false; tallyRun(st.tally); }
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
  var LB = "https://mw-presence.onrender.com", MLB = false, lbs = {}, lbTab = BD; lbs[BD] = null; lbs[BA] = null;
  var lbBox = document.createElement("div"); lbBox.className = "lb"; lbBox.hidden = true;
  lbBox.innerHTML = '<div class="lbtabs" role="tablist"><button type="button" data-b="' + BD + '">Today’s top 10</button><button type="button" data-b="' + BA + '">All-time</button></div>' +
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
    if (!window.fetch || PREVIEW) return;
    fetch(LB + "/top?b=" + BD + "&id=" + pid(), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.board === BD && Array.isArray(j.rows)) { MLB = true; lbs[BD] = j.rows; lbFetch(BA); lbRender(); }
    }).catch(function () {});
  }
  function lbPost(n) {
    if (!lbCan()) return;
    st.posted = true; put(KEY, st); put("mrg-name", n);
    [BD, BA].forEach(function (k) {
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
    note.textContent = mine >= 0 ? "You’re #" + (mine + 1) + (lbTab === BD ? " today." : " of all time.") : lbTab === BD ? "Daily runs only. Sydney time. Names are public." : "Best daily run per player. Names are public.";
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
      } else if (kind === "note") { var PENT = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760], fq = PENT[Math.min(PENT.length - 1, n - 2)]; tone(a, fq, t + 0.05, 0.16, { type: "triangle", vol: 0.045 }); tone(a, fq * 2, t + 0.05, 0.1, { vol: 0.012 }); } // rising C major pentatonic
      else if (kind === "tick") tone(a, 1500, t, 0.03, { type: "square", vol: 0.012 });
      else if (kind === "combo") tone(a, Math.min(1760, 600 + n * 120), t + 0.06, 0.12, { type: "triangle", vol: 0.07 });
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
    if (arm) { var b = cv.getBoundingClientRect(), ux = (e.clientX - b.left) / scale, uy = (e.clientY - b.top) / scale; if (down && !over) { if (arm === "rx") doseAt(ux, uy); else cutAt(ux, uy); } down = false; return; }
    var sb = cv.getBoundingClientRect(); if (down && sparks.length && sparkAt((e.clientX - sb.left) / scale, (e.clientY - sb.top) / scale)) { down = false; return; }
    aim(e); if (down) drop(); down = false;
  });
  cv.addEventListener("pointercancel", function () { down = false; });
  document.addEventListener("keydown", function (e) {
    if (root.offsetParent === null || /input|textarea/i.test((e.target || {}).tagName || "")) return;
    if (e.key === "Escape" && arm) { arm = false; tbarUI(); return; }
    if (e.key === "ArrowLeft") { aimX = Math.max(0, aimX - 14); e.preventDefault(); }
    else if (e.key === "ArrowRight") { aimX = Math.min(W, aimX + 14); e.preventDefault(); }
    else if (e.key === " " || e.key === "ArrowDown" || e.key === "Enter") { if (e.target === document.body || e.target === cv) { if (arm === "rx") doseNearest(); else drop(); e.preventDefault(); } }
  });
  window.addEventListener("resize", size); window.addEventListener("load", size); setTimeout(size, 400); setTimeout(size, 1500);

  // ---------- days ----------
  function show(d) {
    day = d; KEY = "mrg-day-" + MK + day; st = load(KEY, { done: false });
    $("eyebrow").textContent = (isLive() ? "Mergeon" : "Archive") + " · #" + num(day) + " · " + nice(day);
    if (st.done) renderResult(); else $("result").hidden = true;
    newRun(st.done);
    renderArchive();
  }
  function renderArchive() {
    var days = [], n = dayNum(REAL), first = dayNum(FIRST);
    for (var k = n - 1; k >= first; k--) days.push(new Date(k * 864e5).toISOString().slice(0, 10));
    var rows = days.map(function (d) {
      var s = load("mrg-day-" + MK + d, null), mark = s && s.done ? " ✓" : "";
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
      cuts: cuts, arm: arm, shake: shakeLeft, wild: wildUsed, NEW: NEW, OUT: OUT, inf: infN, cleared: infCleared, RX: RX, doses: doses, rxProg: rxProg, resCleared: resCleared, drops: drops, steps: steps, practice: practice, lb: MLB, coll: coll, parts: parts.length }; } };
  if (DEBUG) { // test hooks (?debug=1)
    var X = window.MW_mrg;
    X.spawn = function (lv, x, y) { return add(lv, x, y).id; };
    X.setCur = function (lv) { cur = lv; hud(); };
    X.cut = function (x, y) { return cutAt(x, y); };
    X.shake = doShake; X.end = end; X.sfx = sfxLog; X.WILD = WILD; X.CURE = CURE; X.target = target;
    X.infect = function () { infect(null); }; X.spread = spread;
    X.bodies = function () { return pieces().map(function (o) { return { id: o.id, lv: o.lv, x: Math.round(o.position.x), y: Math.round(o.position.y), inf: !!o.inf, res: !!o.res }; }); };
    // RX ("Treat it properly") hooks
    X.give = function (n) { doses = Math.max(0, Math.min(RX_MAX, doses + (n === undefined ? 1 : n))); tbarUI(); return doses; };
    X.resist = function (id) { pieces().forEach(function (o) { if (o.inf && (id === undefined || o.id === id)) o.infS = steps - RX_RES; }); }; // turns resistant on the next step
    X.infState = function () { return pieces().filter(function (o) { return o.inf || (o.sw && o.sw > 1); }).map(function (o) { return { id: o.id, lv: o.lv, x: Math.round(o.position.x), y: Math.round(o.position.y), inf: !!o.inf, res: !!o.res, wasRes: !!o.wasRes, sw: +(o.sw || 1).toFixed(4), age: o.inf ? +((steps - o.infS) / 60).toFixed(1) : 0, bodyR: +Math.sqrt(o.area / Math.PI).toFixed(2) }; }); };
    X.infectId = function (id) { pieces().forEach(function (o) { if (o.id === id) setInf(o, true); }); };
    X.armRx = function () { $("rx").onclick.call($("rx")); return arm; };
    X.dose = function (x, y) { return doseAt(x, y); };
    X.swellTo = function (id, v) { pieces().forEach(function (o) { if (o.id === id) swell(o, v); }); };
    X.share = function () { return st.done ? shareText() : ""; };
    // weekly features hooks
    X.drained = function () { return drained; };
    X.juice = function () { return { JUICE: JUICE, meter: meter, fever: feverS, saves: saves, TL: TL, score: score }; };
    X.fever = function () { meter = METER; startFever(); }; X.fillMeter = function (n) { meter = n; };
    X.clutch = function (ms) { var n = performance.now(); dangerT = n - ms; clutch(0, n); return saves; };
    X.tally = function () { return st.tally || null; }; X.tallyRows = function () { return Array.prototype.map.call(document.querySelectorAll("#mrg-tally .trow"), function (r) { return [r.children[0].textContent, r.children[1].textContent, r.classList.contains("on")]; }); };
    X.sfxLog = sfxLog;
    X.feat = function () { return { sp: SP, mut: MUT ? MUT.id : null, skin: SKIN, goals: GOALS, gDone: gDone.slice(), made: madeN.slice(), merges: nMerge, mix: mixN, toots: tootN, learn: LEARN, gravity: engine.gravity.y, today: $("today").hidden ? "" : $("today").textContent, prev: PREV, nx2: nx2 }; };
    X.dropLog = dropLog; X.special = special; X.mutation = function (d) { var m = mutation(d); return m && m.id; }; X.skinOf = skinOf; X.goalsFor = goalsFor; X.easter = easter;
    X.compat = bgPair; X.BG = BG; X.groups = function () { return pieces().map(function (o) { return { id: o.id, lv: o.lv, g: o.bg, name: o.bg === undefined ? null : BG.names[o.bg] }; }); };
    X.spawnG = function (lv, g, x, y) { var o = add(lv, x, y); o.bg = g; return o.id; };
    X.clear = function () { pieces().forEach(function (o) { C.remove(engine.world, o); }); };
    X.quirk = function (id) { pieces().forEach(function (o) { if (o.id === id) quirk(o, performance.now()); }); };
    X.goalTick = goalTick; X.openBook = openBook; X.openMore = openMore; X.setLearn = setLearn; X.coll = function () { return coll; };
    // hidden finds: force a sparkle (bypasses the trigger) and catch it; or fire the real triggers
    X.hid = { spawn: function (id) { return hidSpawn(id, W / 2, H / 2, true); }, catchAll: function () { var n = 0; while (sparks.length) { var s = sparks.shift(); catchSpark(s); n++; } return n; },
      sparks: function () { return sparks.map(function (s) { return s.id; }); }, found: function () { return HID.filter(function (h) { return hidFound(h.id); }).map(function (h) { return h.id; }); },
      merge: function (n) { hidMerge(W / 2, H / 2, n === undefined ? 3 : n); }, setSteps: function (n) { steps = n; }, setDrops: function (n) { drops = n; }, tick: hidTick, toots: function (n) { tootN = n; }, run: function () { return hidRun; },
      tap: function () { var s = sparks[0]; if (!s) return false; return sparkAt(s.cx || s.x, s.cy || s.y); } };
  }

  // The board sits inside a hidden section until Play is tapped, so size on first view.
  var vis = new MutationObserver(function () { if (root.offsetParent !== null) size(); });
  var sec = document.getElementById("game"); if (sec) vis.observe(sec, { attributes: true, attributeFilter: ["hidden"] });
  size(); tick(); show(day); lbProbe();
})();
