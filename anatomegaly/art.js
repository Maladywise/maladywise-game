/* Anatomegaly diagrams: original, schematic SVG drawings (no external images, no faces).
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

  var ART = { skeleton: skeleton, hand: handBones, palm: function () { return handSkin(false); }, handback: function () { return handSkin(true); }, heart: heart, brain: brain, eye: eye, ear: ear, gut: gut, lungs: lungs, knee: knee, spine: spine };
  var CAP = { skeleton: "Front view", hand: "Right hand, palm side", palm: "Right hand, palm side", handback: "Right hand, back", heart: "Heart, front view (schematic)", brain: "Brain, left side", eye: "Eye, sliced across", ear: "Right ear, sliced front-on", gut: "Abdomen, front view", lungs: "Lungs, front view", knee: "Right knee, front (kneecap off)", spine: "Spine, side view (front to the left)" };
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
