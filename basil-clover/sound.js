/* Basil + Clover sound: WebAudio blips and a gentle generated music loop. No audio files.
   window.BCSND = { sfx(kind, n), music({ on, stage, mode }), btn(el) }.
   mode: "calm" | "clover" | "boss" | "fever". Sound button cycles: all on -> music off -> muted (saved per browser).
   Never touches the game's seeded randomness. */
(function () {
  "use strict";
  var KEY = "mw-basil-sound"; // 2 = all on, 1 = sfx only, 0 = muted
  var lvl = 2; try { var v = JSON.parse(localStorage.getItem(KEY)); if (v === 0 || v === 1 || v === 2) lvl = v; } catch (e) {}
  var AC = null, master = null, sfxBus = null, musBus = null, gestured = false, noiseBuf = null;
  function ctx() {
    if (!gestured || lvl === 0) return null;
    if (!AC) {
      try {
        var A = window.AudioContext || window.webkitAudioContext; if (!A) return null; AC = new A();
        master = AC.createGain(); master.gain.value = 0.9; master.connect(AC.destination);
        sfxBus = AC.createGain(); sfxBus.gain.value = 1; sfxBus.connect(master);
        var lp = AC.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2200; lp.Q.value = 0.3; lp.connect(master);
        musBus = AC.createGain(); musBus.gain.value = 0; musBus.connect(lp);
        noiseBuf = AC.createBuffer(1, AC.sampleRate * 0.5, AC.sampleRate); var d = noiseBuf.getChannelData(0), s = 7;
        for (var i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = s / 1073741823 - 1; }
      } catch (e) { AC = null; return null; }
    }
    try { if (AC.state === "suspended") AC.resume(); } catch (e) {}
    return AC;
  }
  function unlock() { if (gestured) return; gestured = true; ctx(); syncMusic(); }
  document.addEventListener("pointerdown", unlock, true); document.addEventListener("keydown", unlock, true);

  function tone(f, t0, dur, o, bus) {
    o = o || {}; var a = AC, osc = a.createOscillator(), g = a.createGain(), v = o.vol || 0.1, att = o.att || 0.006;
    osc.type = o.type || "sine"; osc.frequency.setValueAtTime(f, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    if (o.det) osc.detune.setValueAtTime(o.det, t0);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + att);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(bus || sfxBus); osc.start(t0); osc.stop(t0 + dur + 0.05);
  }
  function noise(t0, dur, o, bus) {
    o = o || {}; var a = AC, src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    src.buffer = noiseBuf; f.type = o.hp ? "highpass" : "bandpass"; f.frequency.value = o.f || 1200; f.Q.value = o.q || 0.8;
    g.gain.setValueAtTime(o.vol || 0.08, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(bus || sfxBus); src.start(t0); src.stop(t0 + dur + 0.02);
  }
  // C major pentatonic ladder for combos (the Mergeon trick: every hit in a streak climbs a note)
  var PENT = [392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760];
  var lastSfx = {};
  function sfx(kind, n) {
    if (lvl === 0) return; var a = ctx(); if (!a) return;
    var now = a.currentTime; if (lastSfx[kind] && now - lastSfx[kind] < 0.035) return; lastSfx[kind] = now; // no machine-gun stacking
    var t = now + 0.01; n = n || 0;
    try {
      switch (kind) {
        case "kick": { var f = PENT[Math.min(PENT.length - 1, n)]; tone(150, t, 0.09, { type: "triangle", to: 70, vol: 0.16 }); tone(f, t + 0.02, 0.16, { type: "triangle", vol: 0.07 }); tone(f * 2, t + 0.02, 0.08, { vol: 0.015 }); break; }
        case "nom": { var g = PENT[Math.min(PENT.length - 1, n)]; tone(g * 0.75, t, 0.07, { type: "square", to: g, vol: 0.025 }); tone(g, t + 0.07, 0.12, { type: "triangle", vol: 0.07 }); break; }
        case "smash": noise(t, 0.35, { f: 3000, q: 0.5, vol: 0.18 }); tone(110, t, 0.3, { type: "triangle", to: 45, vol: 0.25 }); [1568, 2093, 2637].forEach(function (x, i) { tone(x, t + 0.05 + i * 0.04, 0.12, { vol: 0.02 }); }); break;
        case "ouch": tone(620, t, 0.28, { type: "sawtooth", to: 300, vol: 0.035 }); tone(660, t, 0.28, { type: "triangle", to: 330, vol: 0.05, det: 15 }); break;
        case "bleurgh": tone(220, t, 0.35, { type: "sawtooth", to: 90, vol: 0.04 }); noise(t + 0.05, 0.2, { f: 400, vol: 0.05 }); break;
        case "heal": [659.25, 880, 1318.51].forEach(function (x, i) { tone(x, t + i * 0.07, 0.25, { type: "triangle", vol: 0.05 }); }); break;
        case "step": [523.25, 659.25, 783.99].forEach(function (x, i) { tone(x * (1 + n * 0.12), t + i * 0.05, 0.12, { type: "square", vol: 0.018 }); }); break; // multiplier up
        case "title": [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach(function (x, i) { tone(x, t + i * 0.07, 0.3, { type: "triangle", vol: 0.07 }); tone(x / 2, t + i * 0.07, 0.2, { vol: 0.03 }); }); break;
        case "fever": tone(300, t, 0.6, { type: "sawtooth", to: 1200, vol: 0.03 }); [783.99, 987.77, 1174.66, 1567.98, 1975.53].forEach(function (x, i) { tone(x, t + 0.25 + i * 0.06, 0.35, { type: "triangle", vol: 0.06 }); }); noise(t + 0.25, 0.4, { hp: true, f: 6000, vol: 0.05 }); break;
        case "feverEnd": tone(900, t, 0.45, { type: "triangle", to: 260, vol: 0.05 }); break;
        case "meter": tone(1200 + n * 40, t, 0.05, { vol: 0.012 }); break;
        case "ann": tone(880, t, 0.18, { type: "triangle", vol: 0.06 }); tone(1318.51, t + 0.14, 0.3, { type: "triangle", vol: 0.06 }); break;
        case "life": [523.25, 415.3, 329.63].forEach(function (x, i) { tone(x, t + i * 0.16, 0.28, { type: "triangle", vol: 0.08 }); }); break;
        case "boss": tone(65, t, 0.9, { type: "sawtooth", to: 45, vol: 0.06 }); tone(98, t + 0.1, 0.8, { type: "triangle", to: 60, vol: 0.12 }); noise(t, 0.8, { f: 200, vol: 0.06 }); break;
        case "bosshit": tone(180, t, 0.12, { type: "square", to: 90, vol: 0.05 }); noise(t, 0.1, { f: 1500, vol: 0.08 }); break;
        case "treat": [1318.51, 1975.53].forEach(function (x, i) { tone(x, t + i * 0.06, 0.2, { type: "square", vol: 0.025 }); }); break;
        case "sparkle": for (var k = 0; k < 6; k++) tone(PENT[6 + (k * 5) % 6], t + k * 0.05, 0.18, { vol: 0.03 }); break;
        case "catnip": for (var j = 0; j < 8; j++) tone(500 + j * 90, t + j * 0.05, 0.2, { type: "triangle", vol: 0.04, det: (j % 2 ? 30 : -30) }); break;
        case "swap": tone(700, t, 0.18, { type: "triangle", to: 1100, vol: 0.05 }); tone(1100, t + 0.15, 0.25, { type: "triangle", to: 800, vol: 0.04 }); break; // a little "mrrp"
        case "over": [523.25, 440, 349.23, 261.63].forEach(function (x, i) { tone(x, t + i * 0.2, 0.35, { type: "triangle", vol: 0.08 }); }); break;
        case "win": [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.51].forEach(function (x, i) { tone(x, t + i * 0.11, 0.35, { type: "triangle", vol: 0.08 }); tone(x / 2, t + i * 0.11, 0.3, { vol: 0.03 }); }); break;
        case "pb": [1046.5, 1318.51, 1567.98, 2093].forEach(function (x, i) { tone(x, t + 0.6 + i * 0.09, 0.3, { type: "triangle", vol: 0.06 }); }); break;
      }
    } catch (e) {}
  }

  // ---------- music: gentle lo-fi loop, chords + bass + a soft pentatonic pluck. Key per stage, mood per mode ----------
  var M = { on: false, stage: 1, mode: "calm" }, timer = null, nextT = 0, stepN = 0;
  var PROG = { calm: [[0, 4, 7, 11], [9, 12, 16, 19], [5, 9, 12, 16], [7, 11, 14, 17]], boss: [[9, 12, 16], [5, 9, 12], [7, 11, 14], [4, 8, 11]] };
  var MEL = [0, 2, 4, 7, 9, 12, 14, 16]; // pentatonic degrees
  var PAT = [0, -1, 4, -1, 2, -1, 5, 3, -1, 4, -1, 2, 6, -1, 4, -1]; // 16 eighths per 2 bars; -1 = rest
  var KEYOF = { 1: 0, 2: -2, 3: 3, 4: 5, 5: -3, 6: -5, 7: 2, 8: 7, 9: 4, 10: -4 };
  function hz(semi) { return 261.63 * Math.pow(2, semi / 12); }
  function syncMusic() {
    var want = M.on && lvl === 2 && gestured && !document.hidden;
    var a = want ? ctx() : AC; if (!a || !musBus) return;
    var t = a.currentTime;
    musBus.gain.cancelScheduledValues(t); musBus.gain.setValueAtTime(musBus.gain.value, t);
    musBus.gain.linearRampToValueAtTime(want ? (M.mode === "fever" ? 0.75 : 0.6) : 0, t + (want ? 1.2 : 0.4));
    if (want && !timer) { nextT = t + 0.1; timer = setInterval(sched, 60); }
    if (!want && timer) { var tt = timer; timer = null; setTimeout(function () { if (!timer) clearInterval(tt); else clearInterval(tt); }, 500); }
  }
  function sched() {
    if (!AC) return;
    var bpm = M.mode === "fever" ? 104 : M.mode === "boss" ? 96 : M.mode === "clover" ? 86 : 80, e8 = 30 / bpm;
    while (nextT < AC.currentTime + 0.25) { play(stepN, nextT, e8); stepN++; nextT += e8; }
  }
  function play(s, t, e8) {
    var key = (KEYOF[M.stage] || 0) + (M.mode === "fever" ? 2 : 0) + (M.mode === "clover" ? 5 : 0) - 12;
    var prog = M.mode === "boss" ? PROG.boss : PROG.calm, bar = Math.floor(s / 8) % prog.length, ch = prog[bar], pos = s % 8;
    var B = musBus, pv = M.mode === "fever" ? 0.022 : 0.018;
    if (pos === 0) ch.forEach(function (n, i) { tone(hz(key + n), t, e8 * 8, { att: 0.35, vol: pv, det: i % 2 ? 6 : -6 }, B); }); // soft pad
    if (pos === 0 || pos === 4) tone(hz(key + ch[0] - 12), t, e8 * 3, { type: "triangle", att: 0.02, vol: 0.06 }, B); // bass
    if (pos === 6 && bar % 2) tone(hz(key + ch[1] - 12), t, e8 * 1.5, { type: "triangle", att: 0.02, vol: 0.04 }, B);
    var p = PAT[s % 16];
    if (p >= 0 && (M.mode !== "calm" || s % 32 < 24)) { var f = hz(key + 12 + MEL[(p + bar * 2) % MEL.length]); tone(f, t, e8 * 1.6, { type: "triangle", att: 0.004, vol: M.mode === "clover" ? 0.03 : 0.024 }, B); }
    if (M.mode === "fever" || M.mode === "boss") { noise(t, 0.04, { hp: true, f: 7000, vol: pos % 2 ? 0.012 : 0.02 }, B); if (pos === 0 || pos === 4) noise(t, 0.12, { f: 120, q: 1, vol: 0.06 }, B); }
    else if (pos % 2 === 0) noise(t, 0.03, { hp: true, f: 8000, vol: 0.006 }, B); // brushed hat
  }
  function music(o) {
    var ch = false; ["on", "stage", "mode"].forEach(function (k) { if (o[k] !== undefined && o[k] !== M[k]) { M[k] = o[k]; ch = true; } });
    if (ch) syncMusic();
  }
  document.addEventListener("visibilitychange", syncMusic);

  // ---------- one button: all on -> music off -> muted ----------
  var BTN = null, ICON = ["🔇", "🔉", "🔊"], LBL = ["Sound off. Turn sound on", "Effects only. Mute", "Sound and music on. Turn music off"];
  function paint() { if (!BTN) return; BTN.textContent = ICON[lvl]; BTN.setAttribute("aria-label", LBL[lvl]); BTN.title = ["Muted", "Music off", "Sound + music"][lvl]; }
  function btn(el) {
    BTN = el; paint();
    el.onclick = function () { lvl = lvl === 2 ? 1 : lvl === 1 ? 0 : 2; try { localStorage.setItem(KEY, JSON.stringify(lvl)); } catch (e) {} gestured = true; if (lvl) ctx(); syncMusic(); paint(); if (lvl) sfx("treat"); el.blur(); };
  }
  window.BCSND = { sfx: sfx, music: music, btn: btn, level: function () { return lvl; } };
})();
