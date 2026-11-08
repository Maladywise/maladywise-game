/* Anatomegaly diagrams: original, schematic SVG drawings (no external images, no human faces).
   Normie mode uses the animal diagrams further down (octopus, owl, giraffe, cat, elephant, shark, frog, sea star, bee, hoof).
   Each part carries data-p="id [id2]". The game adds class "hl" to the parts named in a round's "hl" list.
   Parts with class "ov" are invisible overlays that only show when highlighted.
   Front-on body views follow anatomical convention: the patient's right is on the viewer's left. */
(function () {
  "use strict";
  function p(id, d, cls, extra) { return '<path data-p="' + id + '" class="' + (cls || "bn") + '" d="' + d + '"' + (extra || "") + "/>"; }
  function e(id, cx, cy, rx, ry, cls, rot) { return '<ellipse data-p="' + id + '" class="' + (cls || "bn") + '" cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"' + (rot ? ' transform="rotate(' + rot + " " + cx + " " + cy + ')"' : "") + "/>"; }
  function svg(vb, body, label) { return '<svg viewBox="' + vb + '" role="img" aria-label="' + label + '" xmlns="http://www.w3.org/2000/svg">' + body + "</svg>"; }

  // ---------- skeleton (front view, anatomical position) ----------
  function half(s) {
    var o = "";
    o += p("clavicle" + s, "M98 84 Q80 79 63 86", "ln bone-ln", ' stroke-width="5"');
    var ribs = "";
    for (var i = 0; i < 7; i++) { var y = 92 + i * 8.5, w = 30 - Math.abs(i - 2.5) * 2.2; ribs += "M95 " + y + " C" + (95 - w) + " " + (y - 5) + " " + (95 - w - 8) + " " + (y + 7) + " " + (95 - w - 3) + " " + (y + 16); }
    o += p("ribs" + s, ribs, "ln bone-ln", ' stroke-width="3"');
    o += '<g data-p="humerus' + s + '" class="grp"><path class="ln bone-ln" stroke-width="8" d="M62 94 L55 148"/><circle class="bn" cx="63" cy="91" r="6.5"/><ellipse class="bn" cx="55" cy="150" rx="7" ry="4"/></g>';
    o += p("radius" + s, "M51 156 L40 205", "ln bone-ln", ' stroke-width="5"');
    o += p("ulna" + s, "M59 155 L50 207", "ln bone-ln", ' stroke-width="4.5"');
    o += '<path class="ln bone-ln" stroke-width="2.6" d="M38 211 L33 230 M42 212 L39 234 M46 212 L45 235 M50 212 L51 233 M53 211 L56 228"/><ellipse class="bn" cx="45" cy="210" rx="8" ry="4"/>';
    o += '<g data-p="femur' + s + '" class="grp"><path class="ln bone-ln" stroke-width="9" d="M84 214 L80 268"/><circle class="bn" cx="89" cy="210" r="6"/><circle class="bn" cx="80" cy="214" r="4.5"/><ellipse class="bn" cx="80" cy="270" rx="9" ry="5"/></g>';
    o += e("patella" + s, 80, 276, 5, 6);
    o += p("tibia" + s, "M84 284 L83 340", "ln bone-ln", ' stroke-width="7.5"');
    o += p("fibula" + s, "M73 287 L74 338", "ln bone-ln", ' stroke-width="3.5"');
    o += '<path class="bn" d="M70 342 L88 342 L92 356 L66 358 Z"/>';
    return o;
  }
  function skeleton() {
    var vert = "";
    for (var y = 64; y < 186; y += 8.6) vert += '<rect x="95.5" y="' + y.toFixed(1) + '" width="9" height="6.4" rx="2"/>';
    var body = '<g class="bn-g">' +
      '<g data-p="spine" class="grp spine">' + vert + "</g>" +
      half("") + '<g transform="translate(200 0) scale(-1 1)">' + half("-l") + "</g>" +
      '<ellipse data-p="cranium" class="bn" cx="100" cy="28" rx="19" ry="22"/>' +
      p("mandible", "M85 38 Q86 58 100 60 Q114 58 115 38", "ln bone-ln", ' stroke-width="5"') +
      p("sternum", "M94.5 88 L105.5 88 L104.5 126 L100 134 L95.5 126 Z") +
      p("pelvis", "M72 180 Q66 202 84 216 L94 220 L100 214 L106 220 L116 216 Q134 202 128 180 Q114 192 100 189 Q86 192 72 180 Z M86 202 a5 6 0 1 0 0.1 0 Z M114 202 a5 6 0 1 0 0.1 0 Z", "bn", ' fill-rule="evenodd"') +
      p("sacrum", "M93 188 L107 188 L101 207 L99 207 Z") +
      "</g>";
    return svg("0 0 200 362", body, "Front view of a skeleton");
  }

  // ---------- right hand bones, palm side ----------
  function handBones() {
    var o = "";
    o += p("radius", "M58 300 L62 262 Q64 248 80 246 L116 249 Q121 258 118 300 Z");
    o += p("ulna", "M128 300 L130 268 Q134 258 147 258 Q160 260 159 270 L157 300 Z");
    // metacarpals and phalanges (lines)
    var bones = [["mc1", "M64 190 L41 152"], ["mc2", "M89 190 L86 112"], ["mc3", "M110 188 L111 106"], ["mc4", "M131 190 L135 112"], ["mc5", "M149 194 L158 124"],
      ["pp1", "M38 147 L27 118"], ["dp1", "M25 113 L19 95"],
      ["pp2", "M86 106 L84 72"], ["mp2", "M84 67 L83 50"], ["dp2", "M83 45 L82 33"],
      ["pp3", "M111 100 L111 62"], ["mp3", "M111 57 L111 37"], ["dp3", "M111 32 L111 20"],
      ["pp4", "M135 106 L137 72"], ["mp4", "M137 67 L138 50"], ["dp4", "M138 45 L139 33"],
      ["pp5", "M158 118 L163 92"], ["mp5", "M164 87 L166 74"], ["dp5", "M167 69 L168 60"]];
    bones.forEach(function (b) { var w = /^mc/.test(b[0]) ? 9 : /^pp/.test(b[0]) ? 8 : /^mp/.test(b[0]) ? 7 : 6; o += p(b[0], b[1], "ln bone-ln", ' stroke-width="' + w + '"'); });
    o += e("trapezium", 68, 205, 12, 11, "bn", -15);
    o += e("trapezoid", 89, 207, 9, 10);
    o += p("capitate", "M100 196 Q110 190 120 196 L122 222 Q112 232 100 222 Z");
    o += '<g data-p="hamate" class="grp"><path class="bn" d="M124 194 Q140 190 150 200 L148 222 Q136 226 124 222 Z"/><circle class="hook" cx="139" cy="211" r="3.6"/></g>';
    o += e("scaphoid", 79, 231, 17, 9, "bn", 30);
    o += e("lunate", 106, 237, 11, 10);
    o += e("triquetrum", 132, 233, 11, 9, "bn", -20);
    o += '<circle data-p="pisiform" class="bn pisi" cx="146" cy="240" r="7"/>';
    return svg("0 0 220 304", '<g class="bn-g">' + o + "</g>", "Bones of the right hand, palm side");
  }

  // ---------- right hand skin (palm side, or back of hand when mirrored) ----------
  function handSkin(back) {
    var o = "";
    o += '<path class="sk" d="M84 248 L162 248 L160 300 L86 300 Z"/>';
    o += p("thumb", "M70 214 C50 200 34 176 30 150 C28 136 46 130 52 144 C58 164 70 180 86 188 Z", "sk");
    o += p("palm-r", "M76 122 L142 122 L142 262 C112 262 74 250 68 224 L64 150 C64 130 70 124 76 122 Z", "sk");
    o += p("palm-u", "M142 122 L172 122 C178 124 182 132 182 150 L180 220 C176 250 156 262 142 262 Z", "sk");
    o += p("index", "M74 126 L74 52 Q74 40 86 40 Q98 40 98 52 L98 126 Z", "sk");
    o += p("middle", "M102 126 L102 38 Q102 26 114 26 Q126 26 126 38 L126 126 Z", "sk");
    o += p("ring-r", "M130 126 L130 48 Q130 36 142 36 L142 126 Z", "sk");
    o += p("ring-u", "M142 126 L142 36 Q154 36 154 48 L154 126 Z", "sk");
    o += p("little", "M158 130 L158 74 Q158 64 168 64 Q178 64 178 74 L178 130 Z", "sk");
    o += '<path class="crease" d="M76 98 h20 M104 92 h20 M132 98 h20 M160 104 h16"/>';
    if (back) o += '<g class="nail"><rect x="78" y="44" width="16" height="14" rx="6"/><rect x="106" y="30" width="16" height="14" rx="6"/><rect x="134" y="40" width="16" height="14" rx="6"/><rect x="161" y="67" width="14" height="12" rx="5"/><rect x="31" y="140" width="13" height="15" rx="5" transform="rotate(-28 37 147)"/></g><path class="crease" d="M84 132 q4 3 8 0 M110 132 q4 3 8 0 M136 132 q4 3 8 0 M162 136 q4 3 8 0"/>';
    else o += '<path class="crease" d="M78 168 C100 160 130 152 172 150 M88 200 C80 180 84 160 100 140"/>';
    o += e("web", 63, 146, 11, 17, "ov", -25);
    var g = '<g' + (back ? ' transform="translate(212 0) scale(-1 1)"' : "") + ">" + o + "</g>";
    return svg("0 0 212 304", g, back ? "Back of the right hand" : "Palm of the right hand");
  }

  // ---------- heart (front view, schematic section) ----------
  function heart() {
    var o = "";
    o += p("svc", "M76 6 L100 6 L100 86 L76 86 Z", "vs");
    o += p("ivc", "M80 150 L102 150 L102 236 L80 236 Z", "vs");
    o += p("aorta", "M160 150 L160 74 C160 20 236 14 242 62 L244 132 L222 132 L220 66 C216 40 182 42 182 76 L182 150 Z", "vs ar");
    o += p("ra", "M60 116 Q60 80 100 78 Q138 78 142 100 L142 150 L66 150 Q60 136 60 116 Z", "ch");
    o += p("la", "M158 102 Q162 74 200 72 Q240 74 242 106 L242 140 L158 140 Z", "ch");
    o += p("pulmonaryveins", "M240 96 L270 88 L272 100 L242 108 Z M240 122 L270 128 L268 140 L242 132 Z", "vs");
    o += p("rv", "M66 158 L146 158 L146 230 Q110 232 84 212 Q66 192 66 158 Z", "ch");
    o += p("lv", "M154 148 L242 148 Q246 200 214 238 Q190 252 154 236 Z", "ch lvw");
    o += p("ivs", "M146 152 L154 148 L154 236 L146 230 Z", "sep");
    o += p("ias", "M142 100 L158 100 L158 140 L142 150 Z", "sep");
    o += p("pulmonarytrunk", "M106 160 C104 110 130 96 176 92 L214 86 L216 102 L180 108 C146 112 128 124 130 160 Z", "vs ar");
    o += p("tricuspid", "M70 154 L96 154 L104 168 M140 154 L114 154 L108 168", "ln valve", ' stroke-width="4"');
    o += p("mitral", "M158 144 L186 144 L194 160 M240 144 L212 144 L204 160", "ln valve", ' stroke-width="5"');
    o += p("aorticvalve", "M162 140 Q171 132 180 140", "ln valve", ' stroke-width="4"');
    o += p("pulmonaryvalve", "M110 150 Q118 142 127 150", "ln valve", ' stroke-width="4"');
    return svg("0 0 280 256", o, "Schematic section of the heart, front view");
  }

  // ---------- brain (left side view, front to the left) ----------
  function brain() {
    var o = "";
    o += p("brainstem", "M176 156 L198 158 C202 178 200 198 194 216 L178 216 C180 196 180 176 176 156 Z", "br bs");
    o += '<g data-p="cerebellum" class="grp"><path class="br cb" d="M196 158 C206 148 236 144 256 146 C274 154 272 180 248 190 C226 196 204 188 196 176 Z"/><path class="fol" d="M204 166 C222 160 244 158 262 160 M202 176 C222 172 244 172 260 172 M210 184 C226 184 242 184 252 182"/></g>';
    o += p("frontal", "M58 140 C34 112 44 52 100 34 C130 24 160 22 178 26 C172 52 162 80 158 104 C130 108 100 116 84 126 C74 132 66 138 58 140 Z", "br");
    o += p("parietal", "M178 26 C210 30 236 42 248 60 C238 80 232 100 228 118 C210 112 190 104 158 104 C162 80 172 52 178 26 Z", "br");
    o += p("occipital", "M248 60 C266 80 274 110 262 136 C254 146 244 150 232 148 C230 138 228 128 228 118 C232 100 238 80 248 60 Z", "br");
    o += p("temporal", "M84 126 C100 116 130 108 158 104 C190 104 210 112 228 118 C228 128 230 138 232 148 C210 156 180 164 150 166 C120 168 96 164 80 154 C70 146 72 134 84 126 Z", "br");
    o += '<path class="gy" d="M70 70 C90 60 100 80 120 70 M60 100 C80 90 96 104 116 92 C130 84 140 90 150 80 M120 44 C130 60 146 50 160 60 M196 50 C206 66 222 60 232 76 M188 80 C200 90 214 84 222 98 M110 140 C130 132 160 136 190 128 M250 90 C258 104 254 116 262 124"/>';
    o += p("motor", "M166 27 C160 52 150 80 146 105 L158 104 C162 80 172 52 178 26 Z", "ov");
    o += e("broca", 108, 112, 17, 10, "ov", -12);
    o += e("wernicke", 196, 120, 18, 10, "ov", -8);
    return svg("0 0 300 222", o, "Left side view of the brain");
  }

  // ---------- eye (horizontal section, front to the left) ----------
  function eye() {
    var o = "";
    o += '<circle class="vit" cx="165" cy="110" r="72"/>';
    o += p("vitreous", "M120 60 A66 66 0 1 1 120 160 Q140 110 120 60 Z", "ov");
    o += p("sclera", "M95.7 70 A80 80 0 1 1 95.7 150", "ln scl", ' stroke-width="9"');
    o += p("choroid", "M103 66 A74 74 0 1 1 103 154", "ln chor", ' stroke-width="3.5"');
    o += p("retina", "M108 62 A70 70 0 1 1 108 158", "ln ret", ' stroke-width="4.5"');
    o += p("cornea", "M95.7 70 A48 48 0 0 0 95.7 150", "ln corn", ' stroke-width="5"');
    o += '<path class="aq" d="M96 74 A44 44 0 0 0 96 146 L106 146 L106 74 Z"/>';
    o += p("iris", "M104 72 L106 97 M104 148 L106 123", "ln iris", ' stroke-width="6"');
    o += p("ciliary", "M100 68 L122 80 L110 90 Z M100 152 L122 140 L110 130 Z", "cil");
    o += '<path class="zon" d="M118 82 L122 88 M115 86 L120 90 M118 138 L122 132 M115 134 L120 130"/>';
    o += e("lens", 124, 110, 13, 25, "lens");
    o += p("opticnerve", "M236 112 L292 106 L292 148 L234 140 Z", "nv");
    o += p("fovea", "M244 100 Q236 108 244 116", "ln ret", ' stroke-width="4.5"');
    o += '<circle data-p="fovea" class="ov" cx="242" cy="108" r="9"/>';
    return svg("0 0 300 220", o, "Cross-section of the eye");
  }

  // ---------- ear (front-on section of the right ear; outside to the left) ----------
  function ear() {
    var o = "";
    o += '<path class="tb" d="M150 20 L300 20 L300 200 L196 200 L150 150 Z"/>';
    o += '<path class="mec" d="M152 64 L204 60 L206 120 L156 122 Z"/>';
    o += p("auricle", "M44 34 C10 56 10 132 42 160 C56 172 66 152 60 132 C54 116 60 110 66 106 L66 88 C56 78 52 64 58 50 C62 38 54 30 44 34 Z", "sk");
    o += p("canal", "M60 86 L150 88 L150 108 L60 110 Z", "can");
    o += p("tm", "M147 80 L156 114", "ln tm", ' stroke-width="4"');
    o += '<g data-p="malleus" class="grp"><path class="ln oss" stroke-width="4.5" d="M154 96 L166 78"/><circle class="oss" cx="168" cy="74" r="6"/></g>';
    o += '<g data-p="incus" class="grp"><circle class="oss" cx="181" cy="75" r="6"/><path class="ln oss" stroke-width="4" d="M183 79 L187 97"/></g>';
    o += '<g data-p="stapes" class="grp"><path class="ln oss" stroke-width="3" d="M187 98 L199 93 M187 98 L199 103"/><path class="ln oss" stroke-width="3.5" d="M200 90 L200 106"/></g>';
    o += p("vestibule", "M202 84 Q206 76 220 78 Q230 82 228 98 Q226 110 212 110 Q202 108 202 98 Z", "inn");
    o += '<g data-p="scc" class="grp"><circle class="ln inn-ln" stroke-width="5" cx="224" cy="52" r="18"/><ellipse class="ln inn-ln" stroke-width="5" cx="250" cy="48" rx="18" ry="11" transform="rotate(30 250 48)"/><ellipse class="ln inn-ln" stroke-width="5" cx="246" cy="76" rx="16" ry="9"/></g>';
    o += p("cochlea", "M214 112 a24 24 0 1 0 48 0 a20 20 0 1 0 -40 0 a16 16 0 1 0 32 0 a11 11 0 1 0 -22 0 a6 6 0 1 0 12 0", "ln inn-ln", ' stroke-width="6"');
    o += '<circle data-p="roundwindow" class="rw" cx="205" cy="116" r="4"/>';
    o += p("cn8", "M262 98 L306 90", "ln nv-ln", ' stroke-width="7"');
    o += p("et", "M170 120 Q186 162 232 206", "ln can-ln", ' stroke-width="9"');
    return svg("0 0 312 214", o, "Cross-section of the right ear");
  }

  // ---------- abdomen (front view) ----------
  function gut() {
    var o = "";
    o += '<path class="trunk" d="M50 0 L210 0 C222 80 232 200 220 320 L40 320 C28 200 38 80 50 0 Z"/>';
    o += p("liver", "M40 80 C40 60 90 56 150 66 C170 70 168 84 150 92 C120 104 90 126 60 130 C44 128 38 104 40 80 Z", "og liv");
    o += e("gallbladder", 96, 124, 8, 13, "og gb", -25);
    o += p("pancreas", "M104 150 C120 142 170 150 210 128 C218 134 214 142 202 148 C170 162 130 166 110 168 C100 164 100 156 104 150 Z", "og pan");
    o += e("spleen", 214, 104, 12, 21, "og spl", 20);
    o += p("stomach", "M146 84 C160 70 200 70 206 96 C212 124 196 150 168 154 C150 156 140 148 132 140 C130 130 148 128 160 130 C176 130 178 108 160 100 C150 96 144 92 146 84 Z", "og sto");
    o += p("duodenum", "M134 144 C110 140 94 152 94 170 C94 188 120 192 142 186", "ln gutln", ' stroke-width="10"');
    o += p("ascending", "M70 262 L70 200", "ln col", ' stroke-width="18"');
    o += p("transverse", "M70 200 C100 186 170 186 204 200", "ln col", ' stroke-width="18"');
    o += p("descending", "M204 200 L204 262", "ln col", ' stroke-width="16"');
    o += p("sigmoid", "M204 262 C206 292 168 276 146 290", "ln col", ' stroke-width="14"');
    o += p("rectum", "M146 290 C134 296 130 304 130 318", "ln col", ' stroke-width="14"');
    o += e("caecum", 70, 268, 13, 12, "og cae");
    o += p("appendix", "M66 279 Q58 296 72 304", "ln col", ' stroke-width="5"');
    o += p("smallbowel", "M96 214 C120 206 150 206 176 214 C186 222 176 230 160 228 C140 226 120 228 102 234 C90 240 96 250 112 250 C136 250 160 246 180 250 C190 256 180 266 160 264 C136 262 116 266 100 262", "ln sb", ' stroke-width="9"');
    o += p("oesophagus", "M128 0 L131 70 C134 78 140 82 148 86", "ln gutln", ' stroke-width="9"');
    return svg("0 0 260 322", o, "Front view of the abdominal organs");
  }

  // ---------- lungs (front view) ----------
  function lungs() {
    var o = "";
    o += '<path class="hrt" d="M118 150 C120 130 168 126 180 150 C192 176 176 206 150 214 C126 210 112 180 118 150 Z"/>';
    o += p("rul", "M120 40 C90 40 66 82 60 120 L126 120 L126 60 C126 46 124 40 120 40 Z", "lu");
    o += p("rml", "M60 120 L126 120 L126 180 C126 196 120 206 100 214 L96 214 C80 190 64 176 50 168 C52 150 56 134 60 120 Z", "lu");
    o += p("rll", "M50 168 C64 176 80 190 96 214 C70 224 44 220 44 200 C44 190 46 178 50 168 Z", "lu");
    o += p("lul", "M160 40 C190 40 222 110 228 150 C212 168 196 190 182 212 C176 208 170 204 166 196 C180 180 182 160 166 150 L156 140 L156 60 C156 46 156 40 160 40 Z", "lu");
    o += p("lll", "M228 150 C232 170 236 186 236 200 C236 222 214 226 190 216 L182 212 C196 190 212 168 228 150 Z", "lu");
    o += p("lingula", "M166 152 C182 162 180 182 166 196 C170 204 176 208 182 212 C192 196 202 182 212 170 C198 162 182 156 166 152 Z", "ov");
    o += '<g data-p="trachea" class="grp"><path class="air" d="M131 8 L149 8 L149 80 L131 80 Z"/><path class="ring" d="M131 18 h18 M131 28 h18 M131 38 h18 M131 48 h18 M131 58 h18 M131 68 h18"/></g>';
    o += p("rmb", "M134 80 L110 112", "ln air-ln", ' stroke-width="12"');
    o += p("lmb", "M146 80 L184 108", "ln air-ln", ' stroke-width="9"');
    o += '<path class="ridge" d="M134 82 L140 90 L146 82"/>';
    o += '<circle data-p="carina" class="ov" cx="140" cy="86" r="8"/>';
    o += p("diaphragm", "M28 232 C56 196 110 202 140 222 C170 208 222 202 252 234", "ln dia", ' stroke-width="7"');
    return svg("0 0 280 244", o, "Front view of the lungs");
  }

  // ---------- right knee (front view, kneecap removed) ----------
  function knee() {
    var o = "";
    o += p("femur", "M104 0 L156 0 L158 80 C190 96 200 120 196 140 C192 156 172 160 160 150 C150 142 140 138 130 138 C120 138 110 142 100 150 C88 160 68 156 64 140 C60 120 70 96 102 80 Z");
    o += p("tibia", "M66 178 C66 170 110 168 130 170 C150 168 196 170 196 178 C196 198 176 212 168 222 L164 300 L118 300 L116 224 C100 214 66 200 66 178 Z");
    o += p("fibula", "M50 210 C48 200 66 198 70 208 L68 300 L56 300 L56 222 C52 218 50 214 50 210 Z");
    o += p("pcl", "M122 172 L132 172 L152 140 L143 136 Z", "lig");
    o += p("acl", "M131 172 L142 170 L118 140 L109 146 Z", "lig");
    o += p("lm", "M70 172 C72 160 116 158 122 166 L118 172 C104 166 84 166 76 176 Z", "men");
    o += p("mm", "M192 172 C190 160 144 158 138 166 L142 172 C156 166 178 166 186 176 Z", "men");
    o += p("mcl", "M192 110 L201 114 L193 238 L184 234 Z", "lig");
    o += p("lcl", "M60 112 L69 110 L62 208 L53 208 Z", "lig");
    return svg("0 0 260 300", o, "Front view of the right knee");
  }

  // ---------- spine (side view, front to the left) ----------
  function spine() {
    var o = "", y = 14, regs = [["cervical", 7, 8, 18, -10], ["thoracic", 12, 10, 22, 16], ["lumbar", 5, 14, 30, -14]];
    regs.forEach(function (r) {
      var g = "";
      for (var i = 0; i < r[1]; i++) {
        var t = (i + 0.5) / r[1], cx = 100 + r[4] * Math.sin(Math.PI * t), id = r[0] === "cervical" ? " c" + (i + 1) : r[0] === "lumbar" ? " l" + (i + 1) : " t" + (i + 1);
        g += '<g data-p="' + id.trim() + '" class="grp"><rect class="bn" x="' + (cx - r[3] / 2).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + r[3] + '" height="' + r[2] + '" rx="3"/><path class="ln bone-ln" stroke-width="3" d="M' + (cx + r[3] / 2).toFixed(1) + " " + (y + r[2] / 2).toFixed(1) + " l" + (r[3] * 0.7).toFixed(1) + " " + (r[2] * 0.4).toFixed(1) + '"/></g>';
        y += r[2] + 3.2;
      }
      o += '<g data-p="' + r[0] + '" class="grp">' + g + "</g>";
    });
    o += p("sacrum", "M86 " + (y + 1) + " L118 " + (y + 1) + " C124 " + (y + 24) + " 126 " + (y + 40) + " 120 " + (y + 52) + " L106 " + (y + 50) + " C104 " + (y + 34) + " 96 " + (y + 18) + " 86 " + (y + 1) + " Z");
    o += p("coccyx", "M108 " + (y + 54) + " L119 " + (y + 56) + " L112 " + (y + 68) + " Z");
    return svg("0 0 200 " + Math.ceil(y + 74), o, "Side view of the spine");
  }

  // ================= Sections, vessels and maps (added Nov 2026) =================
  // Cross-sections follow the radiology convention: seen from the feet, front at the top, so the patient's right is on the viewer's left.
  // Paired structures carry a shared id plus a side id ("-r" = patient's right, "-l" = patient's left).
  function c(id, cx, cy, r, cls, extra) { return '<circle data-p="' + id + '" class="' + (cls || "bn") + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '"' + (extra || "") + "/>"; }
  function sid(n, s) { return n + " " + n + s; }
  function mirror(w, body) { return '<g transform="translate(' + w + ' 0) scale(-1 1)">' + body + "</g>"; }

  // ---------- brain, axial slice at the basal ganglia ----------
  function baxHalf(s) {
    var o = "";
    o += '<path class="ln gm-ln" stroke-width="5" d="M30 64 L46 76 M22 190 L40 180 M58 30 L66 46 M56 250 L66 234 M18 104 L30 108"/>';
    o += p(sid("insula", s), "M44 94 C34 110 34 148 44 164", "ln gm-ln", ' stroke-width="9"');
    o += '<path class="ln gm-ln" stroke-width="11" d="M16 129 L32 129"/>';
    o += p(sid("sylvian", s), "M16 129 L31 129 M34 92 C27 108 27 152 34 166", "ln csf-ln", ' stroke-width="4.5"');
    o += p(sid("putamen", s) + " lentiform lentiform" + s, "M84 126 L70 84 C56 88 47 106 47 128 C47 152 56 172 71 178 Z", "gm");
    o += p(sid("pallidus", s) + " lentiform lentiform" + s, "M84 126 L72 100 C64 112 63 142 72 154 Z", "gm gp");
    o += e(sid("caudate", s), 95, 98, 10, 17, "gm", -12);
    o += p(sid("alic", s) + " ic ic" + s, "M70 84 L81 79 L93 115 L82 118 Z", "wm icap");
    o += p(sid("genu-ic", s) + " ic ic" + s, "M82 118 L93 115 L101 126 L93 137 L82 134 Z", "wm icap");
    o += p(sid("plic", s) + " ic ic" + s, "M82 134 L93 137 L84 184 L72 178 Z", "wm icap");
    o += e(sid("thalamus", s), 104, 158, 13, 26, "gm");
    o += p(sid("frontalhorn", s) + " lateralventricle lateralventricle" + s, "M117 74 L117 124 C111 122 106 116 104 110 C108 102 108 92 104 84 C106 78 111 74 117 74 Z", "csf");
    o += p(sid("occipitalhorn", s) + " lateralventricle lateralventricle" + s, "M94 186 C86 194 80 208 79 226 C88 218 95 204 100 192 Z", "csf");
    return o;
  }
  function brainAxial() {
    var o = '<ellipse class="gm" cx="120" cy="140" rx="104" ry="128"/><ellipse class="wm" cx="120" cy="140" rx="94" ry="117"/>';
    o += '<path class="ln csf-ln" stroke-width="3" d="M120 12 L120 56 M120 224 L120 268"/>';
    o += baxHalf("-r") + mirror(240, baxHalf("-l"));
    o += '<path class="ln cc-o" stroke-width="12" d="M98 79 C102 58 138 58 142 79 M96 197 C102 220 138 220 144 197"/>';
    o += p("ccgenu cc", "M98 79 C102 58 138 58 142 79", "ln cc", ' stroke-width="9"');
    o += p("splenium cc", "M96 197 C102 220 138 220 144 197", "ln cc", ' stroke-width="9"');
    o += p("thirdventricle", "M116 136 Q120 132 124 136 L124 180 Q120 184 116 180 Z", "csf");
    return svg("0 0 240 280", o, "Axial slice of the brain at the level of the basal ganglia");
  }

  // ---------- brain, coronal slice through the thalamus and hippocampus ----------
  function bcorHalf(s) {
    var o = "";
    o += '<path class="gm" d="M130 12 C76 10 22 40 12 96 C8 122 12 150 18 168 C26 190 44 204 68 202 C90 200 104 190 106 176 C107 164 110 154 118 150 L130 150 Z"/>';
    o += '<path class="wm" d="M130 22 C82 20 34 46 22 98 C18 120 22 146 28 162 C34 182 50 192 68 190 C84 188 94 180 96 170 C98 158 104 148 112 142 L130 140 Z"/>';
    o += '<path class="ln gm-ln" stroke-width="5" d="M40 40 L52 56 M18 80 L32 86 M80 16 L84 34 M20 160 L34 156 M56 198 L60 184"/>';
    o += p(sid("insula", s), "M53 94 C47 108 47 132 53 146", "ln gm-ln", ' stroke-width="9"');
    o += '<path class="ln gm-ln" stroke-width="11" d="M10 123 L40 121"/>';
    o += p(sid("sylvian", s), "M10 123 L40 121 M43 92 C38 106 38 134 43 148", "ln csf-ln", ' stroke-width="4.5"');
    o += p(sid("lentiform", s), "M84 92 C70 90 60 104 59 120 C59 134 66 142 78 142 L96 140 Z", "gm");
    o += '<path class="ln lam" d="M83 97 C76 110 76 128 88 139"/>';
    o += p(sid("ic", s), "M80 76 L90 74 L108 144 L98 148 Z", "wm icap");
    o += e(sid("caudate", s), 101, 85, 8, 6.5, "gm", -30);
    o += p(sid("lvbody", s) + " lateralventricle lateralventricle" + s, "M127 71 C118 69 110 71 105 76 C108 83 114 89 122 93 L127 95 Z", "csf");
    o += e(sid("thalamus", s), 112, 115, 13, 17, "gm");
    o += p(sid("temporalhorn", s) + " lateralventricle lateralventricle" + s, "M64 160 C74 150 92 150 99 158 L97 163 C89 158 77 158 67 165 Z", "csf");
    o += '<g data-p="' + sid("hippocampus", s) + '" class="grp"><path class="gm hip" d="M74 170 C76 160 96 160 104 168 C108 176 100 184 88 183 C78 182 72 178 74 170 Z"/><path class="ln lam" d="M84 174 C86 168 94 168 96 173 C97 177 92 178 90 175"/></g>';
    o += p(sid("temporal", s), "M10 124 L42 122 C50 138 58 148 72 152 C92 154 104 160 106 172 C106 192 90 203 66 203 C40 203 24 188 17 168 C11 152 9 138 10 124 Z", "ov");
    return o;
  }
  function brainCoronal() {
    var o = bcorHalf("-r") + mirror(260, bcorHalf("-l"));
    o += p("brainstem", "M116 146 C122 140 138 140 144 146 C146 170 144 196 140 236 L120 236 C116 196 114 170 116 146 Z", "br bs");
    o += '<path class="ln csf-ln" stroke-width="3" d="M130 12 L130 60"/>';
    o += '<path class="ln cc-o" stroke-width="11" d="M86 76 C104 58 156 58 174 76"/>';
    o += p("cc", "M86 76 C104 58 156 58 174 76", "ln cc", ' stroke-width="8"');
    o += p("thirdventricle", "M126 100 Q130 96 134 100 L134 134 Q130 138 126 134 Z", "csf");
    return svg("0 0 260 244", o, "Coronal slice of the brain through the thalamus and hippocampus");
  }

  // ---------- abdomen, axial slice at about L1/L2 ----------
  function abdoAxial() {
    var o = '<path class="fat" d="M160 16 C250 16 312 60 312 128 C312 182 280 224 226 230 C200 233 180 226 160 228 C140 226 120 233 94 230 C40 224 8 182 8 128 C8 60 70 16 160 16 Z"/>';
    o += '<path class="mu" d="M160 26 C244 26 300 66 300 128 C300 176 272 212 228 218 L92 218 C48 212 20 176 20 128 C20 66 76 26 160 26 Z"/>';
    o += '<path class="cav" d="M160 34 C238 34 290 70 290 128 C290 168 268 196 236 202 L84 202 C52 196 30 168 30 128 C30 70 82 34 160 34 Z"/>';
    o += '<path class="mu mu3" d="M120 196 C122 186 140 184 146 196 L146 222 L118 222 Z M200 196 C198 186 180 184 174 196 L174 222 L202 222 Z"/>';
    o += p("liver", "M34 118 C32 76 66 42 116 38 C134 38 140 48 134 62 C126 80 114 96 98 108 C84 120 70 138 54 148 C40 144 35 132 34 118 Z", "og liv");
    o += e("gallbladder", 128, 76, 10, 14, "og gb", 25);
    o += p("stomach", "M168 40 C206 34 248 44 262 70 C268 84 256 92 240 88 C222 82 204 80 188 82 C170 84 158 74 158 60 C158 50 162 42 168 40 Z", "og sto");
    o += '<g data-p="smallbowel" class="grp"><circle class="sbl" cx="178" cy="98" r="10"/><circle class="sbl" cx="202" cy="100" r="10"/><circle class="sbl" cx="226" cy="102" r="10"/><circle class="sbl" cx="250" cy="106" r="9"/><circle class="sbl" cx="160" cy="84" r="8"/></g>';
    o += p("colon colon-r", "M44 162 a16 15 0 1 0 0.1 0 Z", "og colf");
    o += p("colon colon-l", "M270 160 a14 13 0 1 0 0.1 0 Z", "og colf");
    o += c("duodenum", 112, 126, 9, "og duo");
    o += p("pancreas", "M124 116 C136 110 158 116 182 118 C204 120 230 116 250 120 C258 124 254 132 244 132 C222 134 198 132 178 132 C156 132 140 136 126 134 C118 130 118 120 124 116 Z", "og pan");
    o += p("spleen", "M268 96 C284 102 294 120 292 140 C284 134 274 126 264 122 C260 112 262 102 268 96 Z", "og spl");
    o += '<g data-p="kidney kidney-r" class="grp"><path class="kid" d="M78 146 C90 136 110 140 114 154 C116 162 106 166 106 172 C106 180 112 186 108 192 C100 202 80 196 72 182 C66 170 68 154 78 146 Z"/></g>';
    o += '<g data-p="kidney kidney-l" class="grp"><path class="kid" d="M242 146 C230 136 210 140 206 154 C204 162 214 166 214 172 C214 180 208 186 212 192 C220 202 240 196 248 182 C254 170 252 154 242 146 Z"/></g>';
    o += e("psoas psoas-r", 134, 170, 11, 14, "mu");
    o += e("psoas psoas-l", 186, 170, 11, 14, "mu");
    o += e("ivc", 138, 146, 12, 8.5, "ven");
    o += c("aorta", 172, 146, 10, "arty");
    o += '<circle class="arty" cx="174" cy="128" r="4"/><circle class="ven" cx="160" cy="126" r="4.5"/>';
    o += '<g data-p="vertebra" class="grp"><path class="bn" d="M140 168 a20 18 0 1 0 40 0 a20 18 0 1 0 -40 0 Z"/><path class="bn" d="M146 186 L174 186 L180 200 L166 212 L163 228 L157 228 L154 212 L140 200 Z"/></g>';
    o += c("canal", 160, 196, 7.5, "csf");
    return svg("0 0 320 240", o, "Cross-section of the abdomen at the first and second lumbar vertebrae, viewed from below");
  }

  // ---------- right arm, mid-humerus cross-section ----------
  function armAxial() {
    var o = '<ellipse class="fat" cx="150" cy="116" rx="112" ry="100"/>';
    o += p("triceps", "M52 116 A98 88 0 0 0 248 116 Z", "mu mu3");
    o += p("brachialis", "M52 116 A98 88 0 0 1 248 116 Z", "mu mu2");
    o += '<ellipse class="fas" cx="150" cy="116" rx="98" ry="88"/><path class="ln fas" d="M126 118 L52 116 M172 118 L248 116"/>';
    o += '<path class="ln mus-ln" d="M150 146 C146 170 150 190 156 204"/>';
    o += p("biceps", "M86 64 C86 42 116 30 148 30 C182 30 212 42 212 64 C212 84 182 92 148 92 C116 92 86 84 86 64 Z", "mu");
    o += '<path class="ln mus-ln" d="M148 32 L148 90"/>';
    o += '<g data-p="humerus" class="grp"><circle class="bn" cx="148" cy="122" r="24"/><circle class="mar" cx="148" cy="122" r="11"/></g>';
    o += c("musculocutaneous", 108, 94, 5.5, "nv");
    o += c("cephalic", 68, 58, 6.5, "ven");
    o += c("brachialartery", 214, 100, 8, "arty");
    o += c("median", 226, 86, 6.5, "nv");
    o += c("basilic", 240, 106, 7, "ven");
    o += c("ulnar", 218, 136, 6.5, "nv");
    o += '<circle class="arty" cx="140" cy="158" r="4"/>';
    o += c("radial", 126, 152, 7, "nv");
    return svg("0 0 300 232", o, "Cross-section of the right arm at mid-humerus, viewed from below");
  }

  // ---------- right thigh, mid-femur cross-section ----------
  function thighAxial() {
    var o = '<ellipse class="fat" cx="150" cy="120" rx="122" ry="108"/><ellipse class="cav" cx="150" cy="120" rx="108" ry="96"/>';
    o += e("bf hamstrings", 98, 180, 40, 28, "mu mu2", -22);
    o += e("addmagnus adductors", 184, 182, 38, 26, "mu mu2", 8);
    o += e("semimem hamstrings", 194, 206, 28, 12, "mu");
    o += e("semiten hamstrings", 144, 207, 26, 12, "mu mu3");
    o += e("vl quads", 80, 116, 40, 60, "mu", 10);
    o += e("vi quads", 140, 96, 40, 27, "mu mu2");
    o += e("rf quads", 138, 48, 31, 23, "mu mu3");
    o += e("vm quads", 190, 80, 32, 30, "mu");
    o += e("addlongus adductors", 220, 154, 24, 19, "mu mu3", -20);
    o += e("sartorius", 230, 106, 17, 23, "mu mu2", -30);
    o += e("gracilis", 250, 150, 11, 24, "mu", -10);
    o += '<ellipse class="fas" cx="150" cy="120" rx="108" ry="96"/>';
    o += '<g data-p="femur" class="grp"><path class="bn" d="M140 96 a22 22 0 1 1 -0.1 0 Z M135 138 L145 138 L141 150 Z"/><circle class="mar" cx="140" cy="118" r="10"/></g>';
    o += c("femoralartery", 206, 120, 7.5, "arty");
    o += c("femoralvein", 202, 136, 7.5, "ven");
    o += '<circle class="arty" cx="166" cy="140" r="4.5"/>';
    o += c("sciatic", 140, 174, 8.5, "nv");
    o += c("gsv", 262, 116, 6.5, "ven");
    return svg("0 0 300 240", o, "Cross-section of the right thigh at mid-femur, viewed from below");
  }

  // ---------- right leg (calf), mid-shaft cross-section ----------
  function legAxial() {
    var o = '<path class="fat" d="M150 16 C208 16 250 56 252 110 C254 174 214 230 150 232 C86 232 48 180 48 120 C48 62 96 16 150 16 Z"/>';
    o += '<path class="cav" d="M150 28 C200 28 238 62 240 110 C242 166 208 220 150 220 C94 220 60 176 60 120 C60 70 102 28 150 28 Z"/>';
    o += p("gastroc", "M74 170 C94 190 120 198 150 198 C186 198 214 188 234 162 C230 198 198 220 150 220 C106 220 80 200 74 170 Z", "mu");
    o += '<path class="ln mus-ln" d="M146 198 L144 220"/>';
    o += p("soleus", "M74 168 C92 158 108 150 124 154 C156 164 194 148 214 98 C232 110 240 140 234 160 C216 184 188 196 150 196 C112 196 88 188 74 168 Z", "mu mu2");
    o += p("fibularis", "M62 110 C64 90 72 74 80 64 L96 116 L98 136 L72 168 C62 150 60 130 62 110 Z", "mu mu3");
    o += p("ta antcomp", "M180 38 C168 30 150 28 136 32 C132 52 138 78 152 90 L166 92 C166 72 170 52 180 38 Z", "mu");
    o += p("ext antcomp", "M136 32 C110 36 90 50 80 64 L96 116 C112 106 130 98 152 90 C138 78 132 52 136 32 Z", "mu mu2");
    o += '<path class="ln mus-ln" d="M110 104 C116 92 126 84 136 80"/>';
    o += '<g data-p="deeppost" class="grp"><path class="mu mu3" d="M110 120 L164 94 L172 98 C170 112 160 124 146 130 C132 136 118 134 110 128 Z"/><path class="mu mu3" d="M172 98 L214 96 C208 116 196 128 180 132 C170 132 164 126 166 118 Z"/><path class="mu mu3" d="M100 138 C112 132 130 136 146 132 C140 144 126 152 112 150 C104 148 100 144 100 138 Z"/></g>';
    o += '<path class="ln fas" d="M102 140 C136 160 194 148 214 98 M80 64 L96 112 M98 138 L72 168"/>';
    o += '<g data-p="tibia" class="grp"><path class="bn" d="M182 38 C190 52 204 72 212 92 C198 98 180 98 166 92 C164 74 170 54 182 38 Z"/><ellipse class="mar" cx="186" cy="78" rx="7" ry="8"/></g>';
    o += '<g data-p="fibula" class="grp"><circle class="bn" cx="100" cy="126" r="11"/><circle class="mar" cx="100" cy="126" r="4.5"/></g>';
    o += p("iom", "M110 122 L164 94", "ln iomem", ' stroke-width="3.5"');
    o += '<g data-p="antnv antcomp" class="grp"><circle data-p="ata" class="arty" cx="134" cy="100" r="6"/><circle data-p="dfn" class="nv" cx="145" cy="92" r="5.5"/></g>';
    o += '<g data-p="postnv" class="grp"><circle data-p="pta" class="arty" cx="176" cy="136" r="6.5"/><circle data-p="tibn" class="nv" cx="162" cy="140" r="6"/></g>';
    o += '<circle class="arty" cx="114" cy="140" r="4"/>';
    o += c("gsv", 242, 100, 6, "ven");
    return svg("0 0 300 240", o, "Cross-section of the right leg at mid-calf, viewed from below");
  }

  // ---------- circle of Willis, base of the brain from below ----------
  function wHalf(s) {
    var o = "";
    o += p(sid("vertebral", s), "M116 254 C120 230 136 210 148 200", "ln arty-ln", ' stroke-width="8"');
    o += p(sid("pica", s), "M126 226 C110 230 96 230 84 222", "ln arty-ln", ' stroke-width="4.5"');
    o += p(sid("aica", s), "M150 170 C134 172 116 176 100 182", "ln arty-ln", ' stroke-width="4.5"');
    o += p(sid("sca", s), "M150 124 C134 126 112 126 92 134", "ln arty-ln", ' stroke-width="5.5"');
    o += p(sid("pca", s), "M150 110 C136 104 118 100 102 102 C84 106 70 118 58 136", "ln arty-ln", ' stroke-width="6.5"');
    o += p(sid("pcom", s), "M114 101 L110 70", "ln arty-ln", ' stroke-width="4.5"');
    o += p(sid("mca", s), "M104 60 C86 56 62 58 34 68", "ln arty-ln", ' stroke-width="8"');
    o += p(sid("aca", s), "M116 56 C126 48 136 44 140 36 C142 26 142 16 142 6", "ln arty-ln", ' stroke-width="6"');
    o += c(sid("ica", s), 110, 62, 9, "arty");
    return o;
  }
  function willis() {
    var o = '<path class="brz" d="M150 4 C110 4 70 14 50 40 C40 54 44 70 56 76 C40 92 26 120 30 150 C34 170 52 176 70 168 C90 160 104 150 112 146 L188 146 C196 150 210 160 230 168 C248 176 266 170 270 150 C274 120 260 92 244 76 C256 70 260 54 250 40 C230 14 190 4 150 4 Z"/>';
    o += '<path class="br bs" d="M120 118 C120 104 180 104 180 118 L176 198 C170 214 130 214 124 198 Z"/>';
    o += '<path class="ln nv-ln chi" stroke-width="6" d="M130 42 L170 86 M170 42 L130 86"/>';
    o += wHalf("-r") + mirror(300, wHalf("-l"));
    o += p("basilar", "M150 202 L150 110", "ln arty-ln", ' stroke-width="10"');
    o += p("acom", "M139 40 L161 40", "ln arty-ln", ' stroke-width="5"');
    return svg("0 0 300 260", o, "Circle of Willis seen from below the brain");
  }

  // ---------- coronary arteries, heart from the front ----------
  function coronary() {
    var o = "";
    o += '<path class="ven" d="M70 104 L70 22 L94 22 L94 100 Z"/>';
    o += p("aorta", "M100 108 L100 54 C100 18 150 8 170 30 L176 40 L156 52 C146 36 124 40 124 58 L124 108 Z", "vs ar");
    o += '<path class="myo" d="M58 102 C30 124 28 172 46 202 C70 240 140 260 214 264 C236 254 252 222 252 180 C252 138 236 108 208 96 C190 90 176 92 160 98 L100 98 C84 96 70 96 58 102 Z"/>';
    o += '<path class="myo laa" d="M58 102 C34 122 32 170 48 200 C62 212 80 216 96 216 C78 204 68 186 70 158 C72 130 88 112 104 104 C88 98 70 96 58 102 Z"/>';
    o += '<path class="myo laa" d="M196 96 C206 84 226 84 230 98 C230 108 218 112 206 110 Z"/>';
    o += p("pulmonarytrunk", "M138 104 L140 52 C142 34 170 30 184 40 L196 50 L190 60 L176 54 C168 50 164 58 164 66 L164 104 Z", "vs ptk");
    o += p("rca", "M112 106 C90 110 74 130 70 158 C68 186 78 204 96 216", "ln arty-ln", ' stroke-width="8"');
    o += p("rca rcapost", "M96 216 C108 228 124 236 140 242", "ln arty-ln dash", ' stroke-width="6"');
    o += p("pda", "M140 242 C164 252 186 256 206 258", "ln arty-ln dash", ' stroke-width="6"');
    o += p("am", "M84 204 C110 216 140 222 168 226", "ln arty-ln", ' stroke-width="5"');
    o += p("leftmain", "M126 108 C140 110 160 112 180 116", "ln arty-ln", ' stroke-width="9"');
    o += p("lad", "M180 116 C176 160 186 210 214 260", "ln arty-ln", ' stroke-width="7"');
    o += p("diag", "M180 148 C196 160 210 176 218 198", "ln arty-ln", ' stroke-width="5"');
    o += p("cx", "M180 116 C200 112 222 120 238 140", "ln arty-ln", ' stroke-width="7"');
    o += '<path class="ln arty-ln dash" stroke-width="5" d="M238 140 C246 158 248 176 244 196"/>';
    o += p("om", "M232 132 C242 162 238 200 228 230", "ln arty-ln", ' stroke-width="5"');
    return svg("0 0 280 270", o, "Coronary arteries on the front of the heart");
  }

  // ---------- right shoulder: from behind (left) and from the front (right) ----------
  function rotatorCuff() {
    var o = '<path class="ln panel" d="M160 14 L160 246"/>';
    // from behind: the patient's right is on the viewer's right
    var b = "";
    b += '<path class="bn" d="M38 36 L98 50 L108 62 L110 82 L58 204 L44 196 L36 120 Z"/>';
    b += '<path class="ln bone-ln" stroke-width="18" d="M128 92 L124 238"/>';
    b += p("teresmajor", "M54 194 L84 160 L126 128 L126 144 L90 184 L62 204 Z", "mu mu2");
    b += p("supraspinatus cuff", "M40 42 L98 52 C112 54 124 56 140 58 L142 70 C124 72 108 72 96 72 L44 84 Z", "mu");
    b += p("infraspinatus cuff", "M42 96 L110 68 L142 74 L142 90 L110 102 C90 114 70 132 52 152 Z", "mu mu3");
    b += p("teresminor cuff", "M60 160 L96 126 L142 94 L140 106 L104 140 L72 172 Z", "mu");
    b += '<g data-p="humeralhead humerus" class="grp"><circle class="bn" cx="130" cy="76" r="17"/></g>';
    b += p("scapulaspine", "M40 92 C70 80 96 66 116 52", "ln bone-ln", ' stroke-width="9"');
    b += e("acromion", 126, 46, 17, 8, "bn", -12);
    b += p("deltoid", "M128 34 C152 38 158 66 154 100 L140 172 L130 168 L140 100 C144 78 142 60 130 54 Z", "mu mu2");
    // from the front: the patient's right is on the viewer's left
    var f = "";
    f += '<path class="bn" d="M210 62 L282 44 L290 60 L274 200 L262 204 L214 90 Z"/>';
    f += '<path class="ln bone-ln" stroke-width="18" d="M198 92 L202 238"/>';
    f += p("subscapularis cuff", "M280 52 L272 194 L246 168 L214 94 L204 88 L206 72 L218 68 Z", "mu mu3");
    f += '<g data-p="humeralhead humerus" class="grp"><circle class="bn" cx="196" cy="76" r="17"/></g>';
    f += p("coracoid", "M232 52 C228 62 222 66 214 66", "ln bone-ln", ' stroke-width="7"');
    f += p("clavicle", "M196 40 C226 30 254 40 300 28", "ln bone-ln", ' stroke-width="9"');
    f += e("acromion", 196, 44, 15, 7, "bn", 8);
    f += p("bicepslh", "M212 64 C202 60 198 72 200 92 L204 150", "ln tdn", ' stroke-width="5"');
    f += e("biceps", 206, 190, 10, 34, "mu");
    f += p("deltoid", "M198 34 C174 38 168 66 172 100 L186 172 L196 170 L184 100 C180 78 182 60 196 54 Z", "mu mu2");
    return svg("0 0 320 250", o + b + f, "Right shoulder from behind and from the front, showing the rotator cuff");
  }

  // ---------- dermatomes, front view ----------
  function lerp(a, b2, t) { return [a[0] + (b2[0] - a[0]) * t, a[1] + (b2[1] - a[1]) * t]; }
  function strip(A0, A1, B0, B1, u0, u1, v0, v1) { // limb with outer edge A0->A1 and inner edge B0->B1; u across (0 = outer), v along
    var q = function (u, v) { return lerp(lerp(A0, A1, v), lerp(B0, B1, v), u); };
    return "M" + [q(u0, v0), q(u0, v1), q(u1, v1), q(u1, v0)].map(function (pt) { return pt[0].toFixed(1) + " " + pt[1].toFixed(1); }).join(" L") + " Z";
  }
  function dHalf(s) {
    var o = "";
    // limbs (patient's right side, drawn on the viewer's left); A = outer (lateral) edge, B = inner (medial) edge
    var UA = [[86, 66], [56, 140], [104, 76], [74, 148]], FA = [[56, 140], [36, 206], [74, 148], [54, 212]];
    var TH = [[98, 172], [96, 262], [130, 180], [120, 262]], LG = [[96, 262], [98, 322], [120, 262], [116, 322]];
    o += '<path class="sk" d="M' + [UA[0], UA[1], FA[1], FA[3], FA[2], UA[3], UA[2]].map(function (pt) { return pt.join(" "); }).join(" L") + ' Z"/>';
    o += '<path class="sk" d="M' + [TH[0], TH[1], LG[1], LG[3], LG[2], TH[3], TH[2]].map(function (pt) { return pt.join(" "); }).join(" L") + ' Z"/>';
    // hand (palm forward, thumb lateral) and fingers
    o += '<path class="sk" d="M36 206 L54 212 L52 236 L32 232 Z"/>';
    var fing = [["th", "M34 214 L26 232"], ["f2", "M35 232 L30 252"], ["f3", "M40 234 L37 256"], ["f4", "M45 235 L44 255"], ["f5", "M50 235 L50 250"]];
    // foot (seen from the front, toes towards the viewer)
    o += '<path class="sk" d="M98 322 L116 322 L122 340 L90 340 Z"/>';
    // dermatome bands
    o += p(sid("c5", s), strip(UA[0], UA[1], UA[2], UA[3], 0, 0.5, 0.08, 1), "dm");
    o += p(sid("c6", s), strip(FA[0], FA[1], FA[2], FA[3], 0, 0.45, 0, 1) + " M36 206 L42 208 L40 222 L33 222 Z", "dm dm2");
    o += p(sid("c8", s), strip(FA[0], FA[1], FA[2], FA[3], 0.6, 1, 0.45, 1) + " M48 210 L54 212 L52 236 L47 235 Z", "dm dm3");
    o += p(sid("t1", s), strip(UA[0], UA[1], UA[2], UA[3], 0.55, 1, 0.1, 1) + " " + strip(FA[0], FA[1], FA[2], FA[3], 0.6, 1, 0, 0.42), "dm dm2");
    o += p(sid("l4", s), strip(LG[0], LG[1], LG[2], LG[3], 0.55, 1, 0.05, 1) + " M108 322 L116 322 L122 340 L113 340 Z", "dm dm2");
    o += p(sid("l5", s), strip(LG[0], LG[1], LG[2], LG[3], 0.16, 0.55, 0.05, 1) + " M100 324 L108 322 L113 340 L96 340 Z", "dm");
    o += p(sid("s1", s), strip(LG[0], LG[1], LG[2], LG[3], 0, 0.16, 0.55, 1) + " M98 322 L100 324 L96 340 L90 340 Z", "dm dm3");
    o += p(sid("l1", s), "M98 168 L130 176 L130 186 L98 180 Z", "dm dm3");
    o += p(sid("l3", s), strip(TH[0], TH[1], TH[2], TH[3], 0.2, 1, 0.72, 1) + " " + strip(LG[0], LG[1], LG[2], LG[3], 0.45, 1, 0, 0.05), "dm dm3");
    fing.forEach(function (f) {
      var id = f[0] === "th" ? sid("c6", s) : f[0] === "f3" ? sid("c7", s) : f[0] === "f5" || f[0] === "f4" ? sid("c8", s) : null;
      var w = f[0] === "th" ? 8 : 6.5;
      o += id ? p(id, f[1], "ln dm-ln", ' stroke-width="' + w + '"') : '<path class="ln sk-ln" stroke-width="' + w + '" d="' + f[1] + '"/>';
    });
    o += p(sid("c7", s), "M40 222 L46 223 L46 235 L40 234 Z", "dm");
    return o;
  }
  function dermatomes() {
    var o = '<ellipse class="sk" cx="130" cy="30" rx="18" ry="22"/><path class="sk" d="M122 48 L138 48 L140 62 L120 62 Z"/>';
    o += '<path class="sk" d="M86 66 C100 60 112 58 130 60 C148 58 160 60 174 66 L162 120 L166 172 L130 184 L94 172 L98 120 Z"/>';
    o += dHalf("-r") + mirror(260, dHalf("-l"));
    o += p("t4", "M90 86 L170 86 L168 98 L92 98 Z", "dm");
    o += p("t10", "M98 128 L162 128 L162 140 L98 140 Z", "dm dm2");
    o += '<circle class="lm" cx="110" cy="92" r="2.4"/><circle class="lm" cx="150" cy="92" r="2.4"/><circle class="lm" cx="130" cy="134" r="2.4"/>';
    return svg("0 0 260 344", o, "Front view of a body outline showing dermatome bands");
  }

  // ================= Normie mode: animal diagrams (original schematic drawings) =================
  function bz(c, t) { var u = 1 - t; return [u * u * u * c[0] + 3 * u * u * t * c[2] + 3 * u * t * t * c[4] + t * t * t * c[6], u * u * u * c[1] + 3 * u * u * t * c[3] + 3 * u * t * t * c[5] + t * t * t * c[7]]; }
  // a tapered tube along a cubic Bezier; returns {d, pts}
  function tube(c, w0, w1) {
    var L = [], R = [], pts = [], n = 28;
    for (var i = 0; i <= n; i++) {
      var t = i / n, a = bz(c, Math.max(0, t - 0.01)), b = bz(c, Math.min(1, t + 0.01)), m = bz(c, t), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, w = (w0 + (w1 - w0) * t) / 2;
      L.push((m[0] - dy / l * w).toFixed(1) + " " + (m[1] + dx / l * w).toFixed(1)); R.unshift((m[0] + dy / l * w).toFixed(1) + " " + (m[1] - dx / l * w).toFixed(1)); pts.push([m[0], m[1], -dy / l, dx / l, w]);
    }
    return { d: "M" + L.join(" L") + " L" + R.join(" L") + " Z", pts: pts };
  }

  // ---------- octopus (front view; organs shown as overlays when highlighted) ----------
  function octopus() {
    var o = "", ends = [[22, 196, -30, 150], [44, 238, 10, 212], [88, 256, 70, 236], [130, 262, 118, 246], [170, 262, 182, 246], [212, 256, 230, 236], [256, 238, 290, 212], [278, 196, 330, 150]], arms = "", web = [], sk = "";
    ends.forEach(function (e2, k) {
      var sx = 116 + k * 9.7, c = [sx, 140, sx + (e2[0] - sx) * 0.15, 176, e2[2], e2[3], e2[0], e2[1]], tb = tube(c, 15, 3);
      web.push(bz(c, 0.3)); arms += '<path data-p="arms arm' + (k + 1) + '" class="oc" d="' + tb.d + '"/>';
      if (k === 5) tb.pts.forEach(function (q, i) { if (i > 2 && i < 25 && i % 2) sk += '<circle cx="' + (q[0] - q[2] * q[4] * 0.45).toFixed(1) + '" cy="' + (q[1] - q[3] * q[4] * 0.45).toFixed(1) + '" r="' + Math.max(1.1, q[4] * 0.5).toFixed(1) + '"/>'; });
    });
    o += '<path data-p="web" class="oc oc3" d="M116 142 L' + web.map(function (q) { return q[0].toFixed(1) + " " + q[1].toFixed(1); }).join(" L") + ' L184 142 Z"/>';
    o += arms + '<g data-p="suckers" class="grp ocs">' + sk + "</g>";
    o += p("mantle", "M150 8 C96 8 86 66 98 98 C106 116 122 122 150 122 C178 122 194 116 202 98 C214 66 204 8 150 8 Z", "oc");
    o += '<path class="ocspot" d="M128 40 a4 3 0 1 0 .1 0 M166 30 a3 2 0 1 0 .1 0 M176 70 a4 3 0 1 0 .1 0 M120 76 a3 2 0 1 0 .1 0 M150 56 a3 2 0 1 0 .1 0"/>';
    o += e("headband", 150, 130, 50, 20, "oc oc2");
    o += p("siphon", "M188 128 C202 124 214 128 220 138 L210 146 C204 138 198 136 190 140 Z", "oc oc2");
    o += '<g data-p="eye" class="grp"><ellipse class="oce" cx="122" cy="124" rx="12" ry="10"/><ellipse class="oce" cx="178" cy="124" rx="12" ry="10"/><rect class="ocp" x="114" y="122" width="16" height="4.5" rx="2"/><rect class="ocp" x="170" y="122" width="16" height="4.5" rx="2"/></g>';
    o += '<g data-p="hearts" class="grp"><path class="ov" d="M150 92 c-5-8-15-3-10 5 l10 9 l10-9 c5-8-5-13-10-5 z"/><path class="ov" d="M124 80 c-3.5-6-11-2-7 3.5 l7 6.5 l7-6.5 c4-5.5-3.5-9.5-7-3.5 z"/><path class="ov" d="M176 80 c-3.5-6-11-2-7 3.5 l7 6.5 l7-6.5 c4-5.5-3.5-9.5-7-3.5 z"/></g>';
    o += p("gills", "M112 58 C104 72 108 92 120 100 C122 84 120 68 112 58 Z M188 58 C196 72 192 92 180 100 C178 84 180 68 188 58 Z", "ov");
    o += e("inksac", 150, 66, 9, 12, "ov");
    o += p("brain", "M134 128 a16 9 0 1 0 32 0 a16 9 0 1 0 -32 0 Z M144 128 a6 3.5 0 1 1 12 0 a6 3.5 0 1 1 -12 0 Z", "ov", ' fill-rule="evenodd"');
    o += p("beak", "M142 150 L158 150 L150 166 Z", "ov");
    return svg("0 0 300 268", o, "Front view of an octopus");
  }

  // ---------- owl (front view) ----------
  function owl() {
    var o = "";
    o += '<path class="ow" d="M100 236 L140 236 L134 262 L106 262 Z"/>';
    o += p("wing", "M54 118 C28 164 34 226 80 252 C72 210 70 160 76 118 Z M186 118 C212 164 206 226 160 252 C168 210 170 160 164 118 Z", "ow ow-d");
    o += '<ellipse class="ow" cx="120" cy="172" rx="62" ry="80"/><ellipse class="ow2" cx="120" cy="190" rx="44" ry="60"/>';
    o += '<path class="owm" d="M100 160 l6 5 l6-5 M128 160 l6 5 l6-5 M92 184 l6 5 l6-5 M116 186 l6 5 l6-5 M138 184 l6 5 l6-5 M102 210 l6 5 l6-5 M128 210 l6 5 l6-5"/>';
    o += p("neck", "M66 140 Q120 164 174 140 L176 158 Q120 182 64 158 Z", "ov");
    o += p("tufts", "M64 56 L52 10 L96 40 Z M176 56 L188 10 L144 40 Z", "ow ow-d");
    o += '<ellipse class="ow" cx="120" cy="92" rx="72" ry="60"/>';
    o += '<g data-p="disc" class="grp"><circle class="ow3" cx="91" cy="96" r="35"/><circle class="ow3" cx="149" cy="96" r="35"/></g>';
    o += '<g data-p="eye" class="grp"><circle class="owi" cx="91" cy="94" r="20"/><circle class="owi" cx="149" cy="94" r="20"/><circle class="owp" cx="91" cy="94" r="11"/><circle class="owp" cx="149" cy="94" r="11"/><circle fill="#fff" cx="86" cy="89" r="3.5"/><circle fill="#fff" cx="144" cy="89" r="3.5"/></g>';
    o += p("beak", "M120 110 L110 122 L120 146 L130 122 Z", "owb");
    o += '<g data-p="ears" class="grp"><ellipse class="ov" cx="57" cy="86" rx="6" ry="11"/><ellipse class="ov" cx="183" cy="108" rx="6" ry="11"/></g>';
    var foot = function (x) { return '<path class="owf" d="M' + (x - 14) + ' 246 h28 v8 h-28 z"/><path class="ln owc" stroke-width="3.4" d="M' + (x - 12) + " 254 q-3 8 2 12 M" + (x - 4) + " 254 q-1 9 3 12 M" + (x + 4) + " 254 q1 9 5 11 M" + (x + 12) + ' 254 q4 7 8 8"/>'; };
    o += '<g data-p="talons" class="grp">' + foot(98) + foot(142) + "</g>";
    return svg("0 0 240 272", o, "Front view of an owl");
  }

  // ---------- giraffe (side view, facing left) ----------
  function giraffe() {
    var o = "", leg = function (x, y0, cls) { return '<path class="' + (cls || "gf") + '" d="M' + x + " " + y0 + " L" + (x + 14) + " " + y0 + " L" + (x + 12) + " 280 L" + (x + 3) + ' 280 Z"/>'; };
    o += leg(232, 186, "gf gf-d") + leg(150, 186, "gf gf-d");
    o += p("tail", "M262 148 C276 170 280 200 280 222", "ln gfl", ' stroke-width="3"') ;
    o += '<path data-p="tail" class="gfh" d="M276 218 q4 0 8 2 l-1 22 q-4 2-8 0 z"/>';
    o += leg(244, 182) + leg(162, 186);
    o += '<g data-p="hoof" class="grp"><rect class="gfh" x="163" y="278" width="14" height="10" rx="2"/></g><rect class="gfh" x="245" y="278" width="13" height="10" rx="2"/><rect class="gfh" x="151" y="278" width="13" height="10" rx="2" opacity=".85"/><rect class="gfh" x="233" y="278" width="13" height="10" rx="2" opacity=".85"/>';
    o += p("body", "M146 150 C150 128 200 122 262 140 C276 146 276 176 262 188 C230 196 190 196 156 192 C140 186 140 164 146 150 Z", "gf");
    o += p("neck", "M146 156 C130 120 106 76 84 44 L104 34 C120 66 150 104 176 140 Z", "gf");
    o += '<path class="gfs" d="M170 146 l12 -4 l6 10 l-8 10 l-12 -2 z M200 140 l14 2 l2 14 l-12 6 l-8 -10 z M230 146 l12 4 l-2 14 l-12 2 l-4 -12 z M186 168 l12 2 l2 12 l-12 4 l-6 -10 z M218 170 l14 0 l2 12 l-14 4 z M248 170 l10 2 l0 12 l-10 2 z M134 120 l10 -2 l6 10 l-8 8 z M118 92 l8 -2 l4 9 l-7 6 z M104 64 l7 0 l3 8 l-6 5 z"/>';
    o += p("mane", "M104 34 C120 66 150 104 176 140 L171 144 C146 108 116 70 98 37 Z", "gfm");
    o += '<path class="gf" d="M84 44 L108 34 C110 26 104 18 96 18 L60 24 C44 26 32 34 30 44 C30 52 40 56 52 54 Z"/>';
    o += '<g data-p="ossicones" class="grp"><path class="gf" d="M86 22 L84 4 L91 4 L93 20 Z M96 20 L97 2 L104 3 L102 20 Z"/><circle class="gfh" cx="87.5" cy="4" r="4.4"/><circle class="gfh" cx="100.5" cy="3" r="4.4"/></g>';
    o += p("ear", "M106 24 L128 16 L112 32 Z", "gf gf-d");
    o += '<circle class="gfe" cx="80" cy="32" r="4"/>';
    o += p("tongue", "M33 48 C20 56 14 70 22 80 C28 86 36 82 34 74 C32 66 38 60 42 54 Z", "gft");
    o += p("vertebrae", "M146 156 L176 140 L171 133 L141 148 Z M138 142 L168 126 L162 117 L131 131 Z M127 125 L156 109 L149 99 L119 113 Z M115 107 L143 91 L136 80 L107 96 Z M103 89 L130 72 L123 62 L95 77 Z M92 71 L117 55 L111 46 L85 59 Z M88 54 L108 40 L104 34 L84 44 Z", "ov");
    o += e("wrist", 170, 226, 9, 9, "ov");
    o += e("heart", 164, 168, 12, 11, "ov");
    return svg("0 0 300 292", o, "Side view of a giraffe");
  }

  // ---------- cat face (front view) ----------
  function catface() {
    var o = "";
    o += p("ear", "M46 104 L44 18 L116 64 Z M214 104 L216 18 L144 64 Z", "ct");
    o += '<path class="cti" d="M58 88 L56 40 L102 68 Z M202 88 L204 40 L158 68 Z"/>';
    o += '<path class="ct" d="M30 140 C26 90 70 56 130 56 C190 56 234 90 230 140 C228 196 182 226 130 226 C78 226 32 196 30 140 Z"/>';
    o += '<path class="ctst" d="M112 64 l4 22 M130 60 v26 M148 64 l-4 22"/>';
    o += '<g data-p="pocket" class="grp"><path class="ln ctpk" stroke-width="2.2" d="M46 98 q-8 4 -4 10 M214 98 q8 4 4 10"/><ellipse class="ov" cx="44" cy="102" rx="7" ry="9"/><ellipse class="ov" cx="216" cy="102" rx="7" ry="9"/></g>';
    o += '<g data-p="eye" class="grp"><path class="cte" d="M70 118 Q92 98 112 118 Q92 138 70 118 Z M148 118 Q168 98 190 118 Q168 138 148 118 Z"/><ellipse class="ctp" cx="91" cy="118" rx="3.5" ry="13"/><ellipse class="ctp" cx="169" cy="118" rx="3.5" ry="13"/></g>';
    o += p("brow", "M84 98 L66 72 M92 96 L84 66 M168 96 L176 66 M176 98 L194 72", "ln ctw", ' stroke-width="1.6"');
    o += '<g data-p="whiskerpad" class="grp"><ellipse class="ctpad" cx="114" cy="170" rx="20" ry="15"/><ellipse class="ctpad" cx="146" cy="170" rx="20" ry="15"/></g>';
    o += '<path class="ctdot" d="M104 164 h.1 M112 170 h.1 M104 176 h.1 M156 164 h.1 M148 170 h.1 M156 176 h.1"/>';
    o += p("nose", "M120 148 L140 148 Q141 156 130 162 Q119 156 120 148 Z", "ctn");
    o += '<path class="ln ctm" stroke-width="2" d="M130 162 v8 M130 170 q-8 10 -16 4 M130 170 q8 10 16 4"/>';
    o += p("whiskers", "M100 164 L28 150 M100 170 L24 172 M102 176 L32 196 M160 164 L232 150 M160 170 L236 172 M158 176 L228 196", "ln ctw", ' stroke-width="1.8"');
    o += e("chin", 130, 198, 14, 9, "ov");
    return svg("0 0 260 236", o, "Front view of a cat’s face");
  }

  // ---------- cat paw (underside of the right front paw) ----------
  function catpaw() {
    var o = "";
    o += '<path class="ct" d="M70 0 L170 0 L176 120 C200 150 206 196 184 226 C164 252 76 252 56 226 C34 196 40 150 64 120 Z"/>';
    o += '<path class="ctst" d="M90 20 v40 M120 14 v44 M150 20 v40"/>';
    o += e("carpal", 120, 92, 12, 9, "ctpaw");
    o += '<g data-p="dewclaw" class="grp"><ellipse class="ctpaw" cx="56" cy="134" rx="8" ry="10"/><path class="ctcl" d="M50 126 q-8 -6 -4 -14 q4 6 10 8 z"/></g>';
    o += p("mainpad", "M84 196 C80 172 98 158 120 162 C142 158 160 172 156 196 C152 214 134 212 120 206 C106 212 88 214 84 196 Z", "ctpaw");
    o += '<g data-p="toebeans" class="grp"><ellipse class="ctpaw" cx="66" cy="168" rx="13" ry="16" transform="rotate(-22 66 168)"/><ellipse class="ctpaw" cx="98" cy="138" rx="13" ry="16" transform="rotate(-8 98 138)"/><ellipse class="ctpaw" cx="142" cy="138" rx="13" ry="16" transform="rotate(8 142 138)"/><ellipse class="ctpaw" cx="174" cy="168" rx="13" ry="16" transform="rotate(22 174 168)"/></g>';
    o += '<g data-p="claws" class="grp"><path class="ctcl" d="M60 150 q-4 -10 2 -16 q1 8 6 12 z M94 120 q-2 -11 4 -16 q0 8 4 13 z M138 120 q2 -11 8 -14 q-2 8 0 13 z M178 150 q6 -9 0 -16 q-3 8 -6 12 z"/></g>';
    return svg("0 0 240 252", o, "Underside of a cat’s front paw");
  }

  // ---------- elephant (side view, facing left) ----------
  function elephant() {
    var o = "", leg = function (x, cls) { return '<path class="' + cls + '" d="M' + x + " 168 L" + (x + 34) + " 168 L" + (x + 36) + " 246 L" + (x - 2) + ' 246 Z"/>'; };
    o += leg(196, "el el-d") + leg(108, "el el-d");
    o += p("tail", "M290 110 C300 130 302 156 300 180", "ln ell", ' stroke-width="3.5"');
    o += '<path class="elh" d="M296 178 l8 0 l-2 14 l-6 0 z"/>';
    o += leg(228, "el") + leg(132, "el");
    o += '<g data-p="toenails" class="grp"><path class="eln" d="M132 246 q4 -7 8 0 z M142 246 q4 -7 8 0 z M152 246 q4 -7 8 0 z"/></g><path class="eln" d="M228 246 q4 -7 8 0 z M238 246 q4 -7 8 0 z M248 246 q4 -7 8 0 z"/>';
    o += p("sole", "M130 246 L170 246 L170 252 L130 252 Z", "ov");
    o += '<path class="el" d="M100 100 C110 56 180 46 250 56 C292 62 300 100 292 136 C284 168 250 182 200 180 L120 178 C100 170 94 130 100 100 Z"/>';
    o += p("trunk", "M58 92 C40 120 36 160 40 196 C42 214 34 226 22 224 C14 222 14 212 22 210 C28 208 28 200 26 190 C22 158 26 120 40 94 Z", "el");
    o += '<path class="elr" d="M42 120 h12 M38 140 h12 M36 160 h12 M36 180 h12 M36 198 h10"/>';
    o += '<path class="el" d="M40 94 C34 56 60 30 96 32 C122 34 136 54 132 84 C128 110 104 124 76 122 C62 120 52 110 40 94 Z"/>';
    o += p("molar", "M66 112 L92 112 L92 122 L66 122 Z", "ov");
    o += p("tusk", "M64 112 C54 132 44 144 28 150 C40 152 58 144 74 118 Z", "elt");
    o += p("ear", "M92 40 C128 24 168 36 172 80 C176 120 156 150 128 154 C112 156 104 140 108 120 C112 100 98 70 92 40 Z", "el el-ear");
    o += '<circle class="ele" cx="80" cy="74" r="4"/><path class="ln ell" stroke-width="1.5" d="M72 66 q8 -6 16 0"/>';
    return svg("0 0 316 258", o, "Side view of an elephant");
  }

  // ---------- shark (side view, facing left) ----------
  function shark() {
    var o = "";
    o += p("dorsal", "M150 52 C160 30 170 10 190 4 C186 24 188 44 196 58 Z", "sh");
    o += p("dorsal2", "M262 74 L270 58 L278 76 Z", "sh");
    o += p("tailfin", "M298 86 C312 60 324 30 336 10 C334 44 326 76 314 98 C322 112 328 128 330 146 C316 128 304 112 298 104 Z", "sh");
    o += p("pectoral", "M118 112 C120 136 112 160 98 178 C120 168 140 144 150 118 Z", "sh sh-d");
    o += p("pelvic", "M222 106 L232 128 L246 106 Z", "sh sh-d");
    o += p("analfin", "M266 100 L272 116 L282 98 Z", "sh sh-d");
    o += '<path class="sh" d="M12 82 C30 58 90 46 160 50 C220 54 270 68 300 86 L300 102 C270 112 220 120 160 122 C100 124 40 112 22 102 C12 96 8 90 12 82 Z"/>';
    o += '<path class="shb" d="M22 102 C40 112 100 124 160 122 C220 120 270 112 300 102 L300 96 C260 104 210 110 160 110 C100 110 50 104 26 96 Z"/>';
    o += p("lateral", "M60 76 C120 72 200 76 298 92", "ln shl", ' stroke-width="1.6"');
    o += '<g data-p="gills" class="grp"><path class="ln shg" stroke-width="2.2" d="M88 74 q-4 12 0 26 M96 74 q-4 12 0 26 M104 73 q-4 12 0 27 M112 72 q-4 13 0 28 M120 72 q-4 13 0 28"/></g>';
    o += '<circle data-p="eye" class="she" cx="48" cy="76" r="5"/>';
    o += p("nostril", "M20 90 q5 -3 10 0", "ln shg", ' stroke-width="2.2"');
    o += '<g data-p="mouth" class="grp"><path class="ln shg" stroke-width="2" d="M30 98 C44 104 60 104 72 98"/><path class="sht" d="M34 99 l3 4 l3 -3 l3 4 l3 -3 l3 4 l3 -3 l3 4 l3 -3 l3 4 l3 -3 l3 3 z"/></g>';
    o += '<g data-p="ampullae" class="grp"><circle class="ov" cx="18" cy="82" r="2.2"/><circle class="ov" cx="26" cy="78" r="2.2"/><circle class="ov" cx="34" cy="74" r="2.2"/><circle class="ov" cx="24" cy="86" r="2.2"/><circle class="ov" cx="32" cy="84" r="2.2"/><circle class="ov" cx="40" cy="86" r="2.2"/><circle class="ov" cx="20" cy="94" r="2.2"/></g>';
    o += '<path class="shdot" d="M18 82 h.1 M26 78 h.1 M34 74 h.1 M24 86 h.1 M32 84 h.1 M40 86 h.1"/>';
    o += p("liver", "M110 92 C130 78 200 78 236 90 C214 104 140 108 110 92 Z", "ov");
    return svg("0 0 340 184", o, "Side view of a shark");
  }

  // ---------- frog (side view, sitting, facing left) ----------
  function frog() {
    var o = "";
    o += p("hindfoot", "M150 196 L210 190 L222 182 L226 192 L236 186 L238 198 L246 196 L242 206 L156 212 Z", "fg fg-d");
    o += '<path class="fg" d="M150 150 C150 120 200 110 222 140 C236 160 224 196 190 200 C164 202 150 180 150 150 Z"/>';
    o += '<path class="fg" d="M40 118 C50 84 110 74 160 88 C206 100 226 140 210 170 C196 194 150 198 110 192 C80 188 56 172 46 154 C38 142 36 130 40 118 Z"/>';
    o += '<path class="fgb" d="M50 150 C64 176 110 190 160 188 C140 196 96 196 70 182 C58 174 50 164 50 150 Z"/>';
    o += p("drinkpatch", "M120 182 C140 190 168 190 186 182 L184 194 C164 200 140 200 122 194 Z", "ov");
    o += '<path class="fgs" d="M120 100 a6 4 0 1 0 .1 0 M150 104 a7 5 0 1 0 .1 0 M176 120 a6 4 0 1 0 .1 0 M138 128 a5 3.5 0 1 0 .1 0 M196 146 a5 4 0 1 0 .1 0"/>';
    o += p("frontleg", "M86 168 L80 204 L64 210 L70 214 L82 212 L78 220 L86 218 L92 210 L96 170 Z", "fg fg-d");
    o += '<g data-p="eye" class="grp"><circle class="fg" cx="74" cy="92" r="17"/><circle class="fge" cx="74" cy="90" r="12"/><ellipse class="fgp" cx="74" cy="90" rx="7" ry="4"/></g>';
    o += '<circle data-p="tympanum" class="fgt" cx="108" cy="110" r="11"/>';
    o += '<circle data-p="nostril" class="fgp" cx="44" cy="104" r="2.4"/>';
    o += p("mouth", "M38 122 C60 130 84 130 100 126", "ln fgm", ' stroke-width="2.2"');
    o += p("vocalsac", "M44 128 C40 150 58 164 80 160 C96 156 98 140 92 130 Z", "ov");
    return svg("0 0 260 224", o, "Side view of a frog");
  }

  // ---------- sea star (top view) ----------
  function seastar() {
    var o = "", cx = 130, cy = 126, pts = [], arm = "", spines = "", tf = "", eyes = "";
    for (var k = 0; k < 5; k++) {
      var a = -Math.PI / 2 + k * 2 * Math.PI / 5, a1 = a - Math.PI / 5, a2 = a + Math.PI / 5, tip = [cx + 112 * Math.cos(a), cy + 112 * Math.sin(a)];
      var l1 = [cx + 36 * Math.cos(a1), cy + 36 * Math.sin(a1)], l2 = [cx + 36 * Math.cos(a2), cy + 36 * Math.sin(a2)], pn = [-Math.sin(a), Math.cos(a)];
      var d = "M" + l1[0].toFixed(1) + " " + l1[1].toFixed(1) + " Q" + (cx + 80 * Math.cos(a) - 10 * pn[0]).toFixed(1) + " " + (cy + 80 * Math.sin(a) - 10 * pn[1]).toFixed(1) + " " + (tip[0] - 6 * pn[0]).toFixed(1) + " " + (tip[1] - 6 * pn[1]).toFixed(1) + " Q" + (tip[0] + 6 * Math.cos(a)).toFixed(1) + " " + (tip[1] + 6 * Math.sin(a)).toFixed(1) + " " + (tip[0] + 6 * pn[0]).toFixed(1) + " " + (tip[1] + 6 * pn[1]).toFixed(1) + " Q" + (cx + 80 * Math.cos(a) + 10 * pn[0]).toFixed(1) + " " + (cy + 80 * Math.sin(a) + 10 * pn[1]).toFixed(1) + " " + l2[0].toFixed(1) + " " + l2[1].toFixed(1) + " L" + cx + " " + cy + " Z";
      arm += '<path data-p="arms arm' + (k + 1) + '" class="ss" d="' + d + '"/>';
      for (var r = 44; r < 104; r += 11) { spines += "M" + (cx + r * Math.cos(a)).toFixed(1) + " " + (cy + r * Math.sin(a)).toFixed(1) + " h.1 "; }
      eyes += '<circle class="sse" cx="' + (tip[0] - 2 * Math.cos(a)).toFixed(1) + '" cy="' + (tip[1] - 2 * Math.sin(a)).toFixed(1) + '" r="3.4"/>';
      if (k === 1) for (var r2 = 42; r2 < 100; r2 += 7) [-1, 1].forEach(function (sgn) { tf += '<circle class="ov" cx="' + (cx + r2 * Math.cos(a) + sgn * 5 * pn[0]).toFixed(1) + '" cy="' + (cy + r2 * Math.sin(a) + sgn * 5 * pn[1]).toFixed(1) + '" r="2.6"/>'; });
    }
    o += arm + '<path class="ssp" d="' + spines + '"/>';
    o += '<circle data-p="disc" class="ss ss-d" cx="' + cx + '" cy="' + cy + '" r="34"/>';
    o += '<g data-p="madreporite" class="grp"><circle class="ssm" cx="146" cy="138" r="7"/><path class="ln ssml" stroke-width="1" d="M141 136 q5 -3 10 0 M141 139 q5 -3 10 0 M142 142 q4 -2 8 0"/></g>';
    o += '<g data-p="eyespot" class="grp">' + eyes + "</g>";
    o += '<g data-p="tubefeet" class="grp">' + tf + "</g>";
    o += e("mouth", cx, cy, 9, 9, "ov");
    return svg("0 0 260 250", o, "Top view of a sea star");
  }

  // ---------- honeybee (side view, facing left) ----------
  function bee() {
    var o = "";
    o += p("forewing", "M124 70 C140 22 210 4 240 22 C250 30 236 46 210 54 C180 64 150 70 124 74 Z", "bw");
    o += p("hindwing", "M132 78 C160 60 206 56 222 70 C226 80 200 88 176 88 C160 88 144 84 132 80 Z", "bw");
    o += p("hamuli", "M150 74 C166 70 186 64 206 58", "ov", ' stroke-width="4"');
    o += '<g class="bl"><path class="ln bll" stroke-width="3" d="M108 118 l-10 26 l-8 10 M128 122 l0 28 l-6 12"/></g>';
    o += '<g data-p="legs" class="grp"><path class="ln bll" stroke-width="3" d="M150 120 l14 22 l-2 22 l6 8"/></g>';
    o += '<path data-p="pollenbasket" class="bpb" d="M160 140 C170 140 172 156 164 162 C158 162 156 150 160 140 Z"/>';
    o += p("abdomen", "M150 92 C170 72 236 74 262 100 C276 116 268 140 246 146 C214 152 170 140 152 120 Z", "bb");
    o += '<path class="bst" d="M178 82 C172 100 172 124 180 140 L196 144 C188 126 188 100 194 80 Z M212 82 C206 100 206 126 214 146 L230 148 C222 128 222 104 228 86 Z M244 96 C240 110 240 128 246 146 L256 144 C252 128 252 112 256 102 Z"/>';
    o += p("stinger", "M266 122 L290 130 L266 132 Z", "bsg");
    o += p("wax", "M178 140 L240 148 L238 154 L176 146 Z", "ov");
    o += e("thorax", 124, 100, 30, 26, "bt");
    o += '<path class="bfz" d="M104 88 l-4 -4 M114 78 l-2 -5 M128 74 l0 -5 M142 78 l2 -5 M150 90 l5 -3 M100 104 l-5 0"/>';
    o += e("head", 78, 104, 20, 24, "bt");
    o += e("eye", 80, 100, 9, 16, "be");
    o += '<g data-p="ocelli" class="grp"><circle class="bo" cx="72" cy="83" r="2.6"/><circle class="bo" cx="79" cy="81" r="2.6"/><circle class="bo" cx="86" cy="83" r="2.6"/></g>';
    o += p("antenna", "M66 90 L52 70 L34 64", "ln bll", ' stroke-width="2.6"');
    o += p("tongue", "M70 126 L60 160 L58 174", "ln btg", ' stroke-width="3.2"');
    return svg("0 0 296 184", o, "Side view of a honeybee");
  }

  // ---------- horse hoof (underside of a front hoof; toe at the top) ----------
  function hoof() {
    var o = "";
    o += p("wall", "M120 14 C188 14 222 70 222 140 C222 196 206 230 186 246 L160 246 C176 222 192 186 192 140 C192 82 162 44 120 44 C78 44 48 82 48 140 C48 186 64 222 80 246 L54 246 C34 230 18 196 18 140 C18 70 52 14 120 14 Z", "hw");
    o += p("whiteline", "M120 44 C162 44 192 82 192 140 C192 186 176 222 160 246 L152 246 C168 222 184 186 184 140 C184 88 156 52 120 52 C84 52 56 88 56 140 C56 186 72 222 88 246 L80 246 C64 222 48 186 48 140 C48 82 78 44 120 44 Z", "hwl");
    o += p("sole", "M120 52 C156 52 184 88 184 140 C184 186 168 222 152 246 L150 246 C150 220 140 176 130 150 L120 98 L110 150 C100 176 90 220 90 246 L88 246 C72 222 56 186 56 140 C56 88 84 52 120 52 Z", "hs");
    o += p("bars", "M152 246 C150 222 146 196 140 176 L146 176 C152 196 158 222 160 246 Z M88 246 C90 222 94 196 100 176 L94 176 C88 196 82 222 80 246 Z", "hb");
    o += p("frog", "M120 98 L130 150 C140 176 150 220 150 246 C140 240 130 236 120 222 C110 236 100 240 90 246 C90 220 100 176 110 150 Z", "hf");
    o += '<path class="ln hfl" stroke-width="2" d="M120 150 L120 214"/>';
    o += p("heels", "M80 246 C82 232 106 230 118 244 C112 254 86 256 80 246 Z M160 246 C158 232 134 230 122 244 C128 254 154 256 160 246 Z", "hh");
    return svg("0 0 240 260", o, "Underside of a horse’s front hoof");
  }

  var ART = { skeleton: skeleton, hand: handBones, palm: function () { return handSkin(false); }, handback: function () { return handSkin(true); }, heart: heart, brain: brain, eye: eye, ear: ear, gut: gut, lungs: lungs, knee: knee, spine: spine,
    brainaxial: brainAxial, braincoronal: brainCoronal, abdoaxial: abdoAxial, armaxial: armAxial, thighaxial: thighAxial, legaxial: legAxial, willis: willis, coronary: coronary, rotatorcuff: rotatorCuff, dermatomes: dermatomes,
    octopus: octopus, owl: owl, giraffe: giraffe, catface: catface, catpaw: catpaw, elephant: elephant, shark: shark, frog: frog, seastar: seastar, bee: bee, hoof: hoof };
  var CAP = { skeleton: "Front view", hand: "Right hand, palm side", palm: "Right hand, palm side", handback: "Right hand, back", heart: "Heart, front view (schematic)", brain: "Brain, left side", eye: "Eye, sliced across", ear: "Right ear, sliced front-on", gut: "Abdomen, front view", lungs: "Lungs, front view", knee: "Right knee, front (kneecap off)", spine: "Spine, side view (front to the left)",
    brainaxial: "Brain, cross-section at the basal ganglia (viewed from below, like CT)", braincoronal: "Brain, front-on slice through the thalamus (patient’s right on your left, like MRI)",
    abdoaxial: "Abdomen, cross-section at L1–L2 (viewed from below, like CT)", armaxial: "Right arm, cross-section at mid-humerus (viewed from below, like CT)",
    thighaxial: "Right thigh, cross-section at mid-femur (viewed from below, like CT)", legaxial: "Right calf, cross-section at mid-shaft (viewed from below, like CT)",
    willis: "Arteries at the base of the brain, seen from below (front at the top)", coronary: "Heart, front view (dashed = on the back of the heart)",
    rotatorcuff: "Right shoulder: from behind (left) and from the front (right)", dermatomes: "Skin nerve-root map, front view (patient’s right on your left)",
    octopus: "Octopus, front view", owl: "Owl, front view", giraffe: "Giraffe, side view", catface: "Cat, face on", catpaw: "Cat’s front paw, underside", elephant: "African elephant, side view", shark: "Shark, side view", frog: "Frog, side view", seastar: "Sea star, from above", bee: "Honeybee, side view", hoof: "Horse’s front hoof, underside (toe at the top)" };
  window.LBL_ART = function (name, hl) {
    var f = ART[name]; if (!f) return "";
    var wrap = document.createElement("div"); wrap.innerHTML = f();
    var set = {}; (hl || []).forEach(function (h) { set[h] = 1; });
    Array.prototype.forEach.call(wrap.querySelectorAll("[data-p]"), function (n) {
      if (n.getAttribute("data-p").split(" ").some(function (x) { return set[x]; })) n.classList.add("hl");
    });
    return wrap.innerHTML;
  };
  window.LBL_CAP = CAP;
  window.LBL_PARTS = function (name) { var w = document.createElement("div"); w.innerHTML = ART[name](); var o = {}; Array.prototype.forEach.call(w.querySelectorAll("[data-p]"), function (n) { n.getAttribute("data-p").split(" ").forEach(function (x) { o[x] = 1; }); }); return Object.keys(o); };
})();
