/* Sudokrine: daily medical sudoku with symbols. 6x6 mini (2x3 boxes) Mon-Thu, 9x9 Fri-Sun.
   Puzzles in puzzles/YYYY-MM.json, made and verified by gen.py (unique solution, logical grade):
   {date, number, difficulty, size, box:[r,c], puzzle, solution, clues, techniques, fact, nfact}. Digit k = symbol k.
   Normie mode: same puzzles, fruit symbols, fun facts, "n-" storage keys. */
(function () {
  "use strict";
  var script = document.currentScript, BASE = new URL(".", script.src).href, BUILD = "1", HINTS = 3, LAUNCH = "2026-10-26";
  var NORMIE = !!(window.MW_mode && MW_mode() === "normie"), PFX = NORMIE ? "n-" : "", NAME = NORMIE ? "Sudokrine (Normie)" : "Sudokrine";
  var root = document.getElementById("skr");
  if (!document.querySelector("link[data-skr]")) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "sudokrine.css?v=" + BUILD; l.setAttribute("data-skr", ""); document.head.appendChild(l);
  }

  // ---------- symbols (inline SVG, 24x24) ----------
  var MED = [
    ["Pill", '<g transform="rotate(-45 12 12)"><path d="M12 7.5H7.5a4.5 4.5 0 0 0 0 9H12z" fill="#F08A24"/><path d="M12 7.5h4.5a4.5 4.5 0 0 1 0 9H12z" fill="#FFF4E6"/><rect x="3" y="7.5" width="18" height="9" rx="4.5" fill="none" stroke="#A3520C" stroke-width="1.5"/></g>'],
    ["Stethoscope", '<g fill="none" stroke="#1F7A8C" stroke-width="2.2" stroke-linecap="round"><path d="M5.5 3.5v5.5a5 5 0 0 0 10 0V3.5"/><path d="M10.5 14v1.8a4.5 4.5 0 0 0 9 0V14.2"/></g><circle cx="5.5" cy="3.2" r="1.4" fill="#1F7A8C"/><circle cx="15.5" cy="3.2" r="1.4" fill="#1F7A8C"/><circle cx="19.5" cy="11.6" r="2.9" fill="#1F7A8C"/><circle cx="19.5" cy="11.6" r="1.1" fill="#fff"/>'],
    ["Germ", '<g stroke="#2E7D32" stroke-width="1.8"><path d="M12 12L21.4 12M12 12L18.6 18.6M12 12L12 21.4M12 12L5.4 18.6M12 12L2.6 12M12 12L5.4 5.4M12 12L12 2.6M12 12L18.6 5.4"/></g><g fill="#2E7D32"><circle cx="21.2" cy="12" r="1.8"/><circle cx="18.6" cy="18.6" r="1.8"/><circle cx="12" cy="21.2" r="1.8"/><circle cx="5.4" cy="18.6" r="1.8"/><circle cx="2.8" cy="12" r="1.8"/><circle cx="5.4" cy="5.4" r="1.8"/><circle cx="12" cy="2.8" r="1.8"/><circle cx="18.6" cy="5.4" r="1.8"/></g><circle cx="12" cy="12" r="6.4" fill="#7CC44E" stroke="#2E7D32" stroke-width="1.4"/><circle cx="10" cy="11" r="1.1" fill="#1B3A12"/><circle cx="14" cy="11" r="1.1" fill="#1B3A12"/><path d="M10.2 13.8q1.8 1.3 3.6 0" stroke="#1B3A12" stroke-width="1.1" fill="none" stroke-linecap="round"/>'],
    ["Blood drop", '<path d="M12 2.5C9.5 7 5.5 10.8 5.5 15a6.5 6.5 0 0 0 13 0c0-4.2-4-8-6.5-12.5z" fill="#D7263D"/><path d="M9 13.2q-1.1 1.7-.9 3.6" stroke="#fff" stroke-width="1.7" stroke-linecap="round" fill="none" opacity=".65"/>'],
    ["DNA", '<g fill="none" stroke-linecap="round"><g stroke="#9DB8E6" stroke-width="1.6"><path d="M8.2 5h7.6M10 8.8h4M10 15.2h4M8.2 19h7.6"/></g><path d="M7 2c0 5 10 5 10 10s-10 5-10 10" stroke="#2F5DA8" stroke-width="2.4"/><path d="M17 2c0 5-10 5-10 10s10 5 10 10" stroke="#5B8DEF" stroke-width="2.4"/></g>'],
    ["Bone", '<g transform="rotate(-45 12 12)"><g fill="#8C6A35"><rect x="5.5" y="9.4" width="13" height="5.2"/><circle cx="5.6" cy="9.4" r="3.3"/><circle cx="5.6" cy="14.6" r="3.3"/><circle cx="18.4" cy="9.4" r="3.3"/><circle cx="18.4" cy="14.6" r="3.3"/></g><g fill="#F3E4C0"><rect x="5.5" y="10.3" width="13" height="3.4"/><circle cx="5.6" cy="9.4" r="2.4"/><circle cx="5.6" cy="14.6" r="2.4"/><circle cx="18.4" cy="9.4" r="2.4"/><circle cx="18.4" cy="14.6" r="2.4"/></g></g>'],
    ["Heart", '<path d="M12 20.8s-8.6-5-8.6-11.2A4.6 4.6 0 0 1 12 7.2a4.6 4.6 0 0 1 8.6 2.4c0 6.2-8.6 11.2-8.6 11.2z" fill="#C2185B"/><path d="M6.6 9.2a2.2 2.2 0 0 1 2.2-2" stroke="#fff" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".6"/>'],
    ["Brain", '<path d="M12 5c-1.2-1.6-4.6-1.6-5.4.6C4.4 5.8 3 8 4 9.8c-1.6 1.2-1.4 3.8.4 4.6-.4 2 1.4 3.6 3.4 3.2.8 1.6 3 1.8 4.2.6 1.2 1.2 3.4 1 4.2-.6 2 .4 3.8-1.2 3.4-3.2 1.8-.8 2-3.4.4-4.6 1-1.8-.4-4-2.6-4.2C16.6 3.4 13.2 3.4 12 5z" fill="#F7A8C4" stroke="#B0306A" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 5v13.4M8 8.8q2 1 1 3M16 8.8q-2 1-1 3M7.4 14.4q2-.5 3 1M16.6 14.4q-2-.5-3 1" stroke="#B0306A" stroke-width="1.3" fill="none" stroke-linecap="round"/>'],
    ["Eye", '<path d="M1.8 12S5.5 5.5 12 5.5 22.2 12 22.2 12 18.5 18.5 12 18.5 1.8 12 1.8 12z" fill="#fff" stroke="#3A3150" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="12" r="4.3" fill="#7B4FC9"/><circle cx="12" cy="12" r="1.9" fill="#1B1430"/><circle cx="13.4" cy="10.6" r=".9" fill="#fff"/>']
  ];
  var FRUIT = [
    ["Apple", '<path d="M12 7.6c-2-1.6-7.2-1.2-7.2 4.6 0 4.6 3 8.6 5.1 8.6 1 0 1.4-.5 2.1-.5s1.1.5 2.1.5c2.1 0 5.1-4 5.1-8.6 0-5.8-5.2-6.2-7.2-4.6z" fill="#E53935"/><path d="M12 7.6c0-2 .5-3.5 1.8-4.5" stroke="#6D4C41" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M13.2 5.6c1-2 3.6-2.4 5-1.8-.8 1.8-3 2.6-5 1.8z" fill="#43A047"/><path d="M7.4 11a3 3 0 0 1 1.8-2" stroke="#fff" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".6"/>'],
    ["Banana", '<path d="M4.2 6c.9 8.2 7 13.4 15.2 12.8 1.2-.1 1.4-1.4.4-1.8C12.8 14.2 8.6 10.2 7.2 5.2 6.8 4 4.1 4.4 4.2 6z" fill="#FDD835" stroke="#B88A00" stroke-width="1.3" stroke-linejoin="round"/><path d="M4.6 5.2l-.9-1.8" stroke="#6D4C41" stroke-width="2" stroke-linecap="round"/><path d="M7 9.5q2.6 5 8 7.2" stroke="#E0B000" stroke-width="1.1" fill="none" stroke-linecap="round"/>'],
    ["Grapes", '<path d="M12 6.6V3" stroke="#6D4C41" stroke-width="1.6" stroke-linecap="round"/><path d="M12.4 4.6c1.6-1.6 4.4-1.4 5.4-.2-1.6 1.4-3.8 1.4-5.4.2z" fill="#43A047"/><g fill="#7E57C2" stroke="#4527A0" stroke-width=".9"><circle cx="7.6" cy="9" r="2.7"/><circle cx="12" cy="9" r="2.7"/><circle cx="16.4" cy="9" r="2.7"/><circle cx="9.8" cy="13.4" r="2.7"/><circle cx="14.2" cy="13.4" r="2.7"/><circle cx="12" cy="17.8" r="2.7"/></g>'],
    ["Orange", '<circle cx="12" cy="13.2" r="8" fill="#FB8C00"/><path d="M12 5.4c.6-1.8 2.8-2.8 4.8-2.2-.6 1.8-2.8 2.8-4.8 2.2z" fill="#43A047"/><g fill="#E07000"><circle cx="9" cy="12" r=".7"/><circle cx="14.6" cy="15.6" r=".7"/><circle cx="15" cy="10.6" r=".7"/><circle cx="9.6" cy="16.4" r=".7"/></g><path d="M7.2 11a5 5 0 0 1 2.6-3" stroke="#fff" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".55"/>'],
    ["Kiwi", '<circle cx="12" cy="12" r="9.4" fill="#8D6E63"/><circle cx="12" cy="12" r="8" fill="#9CCC65"/><circle cx="12" cy="12" r="3" fill="#F1F8E9"/><g fill="#212121"><ellipse cx="12" cy="7.2" rx=".6" ry="1"/><ellipse cx="12" cy="16.8" rx=".6" ry="1"/><ellipse cx="7.2" cy="12" rx="1" ry=".6"/><ellipse cx="16.8" cy="12" rx="1" ry=".6"/><circle cx="8.6" cy="8.6" r=".7"/><circle cx="15.4" cy="8.6" r=".7"/><circle cx="8.6" cy="15.4" r=".7"/><circle cx="15.4" cy="15.4" r=".7"/></g>'],
    ["Blueberries", '<g fill="#3949AB" stroke="#1A237E" stroke-width=".9"><circle cx="7.6" cy="15" r="4.6"/><circle cx="16.4" cy="15" r="4.6"/><circle cx="12" cy="8" r="4.6"/></g><g stroke="#1A237E" stroke-width="1.2" stroke-linecap="round"><path d="M11 7l2 2M13 7l-2 2M6.6 14l2 2M8.6 14l-2 2M15.4 14l2 2M17.4 14l-2 2"/></g><g fill="#fff" opacity=".45"><circle cx="10.2" cy="6.4" r=".9"/><circle cx="5.8" cy="13.4" r=".9"/><circle cx="14.6" cy="13.4" r=".9"/></g>'],
    ["Watermelon", '<path d="M2.4 7.5h19.2a9.6 9.6 0 0 1-19.2 0z" fill="#2E7D32"/><path d="M4.4 7.5h15.2a7.6 7.6 0 0 1-15.2 0z" fill="#FF5A79"/><g fill="#2B1B1B"><ellipse cx="8.2" cy="9.8" rx=".7" ry="1.1"/><ellipse cx="12" cy="11.6" rx=".7" ry="1.1"/><ellipse cx="15.8" cy="9.8" rx=".7" ry="1.1"/><ellipse cx="10" cy="14.2" rx=".7" ry="1.1"/><ellipse cx="14" cy="14.2" rx=".7" ry="1.1"/></g>'],
    ["Pineapple", '<path d="M12 9L8.6 2.6l2.2 2.8L12 1.8l1.2 3.6 2.2-2.8z" fill="#388E3C"/><path d="M12 9.4L6.8 6l2.4.4zM12 9.4l5.2-3.4-2.4.4z" fill="#2E7D32"/><ellipse cx="12" cy="15.4" rx="5.8" ry="6.6" fill="#F9A825" stroke="#B26A00" stroke-width="1.1"/><path d="M7.6 11.6l8.8 8.2M7 15.4l6.6 6M9.6 9.4l7.8 7.2M16.4 11.6l-8.8 8.2M17 15.4l-6.6 6M14.4 9.4l-7.8 7.2" stroke="#B26A00" stroke-width=".9"/>'],
    ["Cherries", '<path d="M7.4 15.6C8.6 10.6 11 6.4 15.6 3.6M16 15.2c-.6-4.4-.6-8.4-.4-11.6" stroke="#5D4037" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M15.6 3.6c2.2-1.2 4.6-.4 5.4 1-2 1.2-4.2 1-5.4-1z" fill="#43A047"/><circle cx="7.2" cy="17.4" r="3.9" fill="#C62828"/><circle cx="16.2" cy="17.6" r="3.9" fill="#C62828"/><g fill="#fff" opacity=".6"><circle cx="5.9" cy="16" r=".9"/><circle cx="14.9" cy="16.2" r=".9"/></g>']
  ];
  var SYM = NORMIE ? FRUIT : MED;
  function svg(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + SYM[k - 1][1] + "</svg>"; }

  root.innerHTML =
    '<div class="wrap">' +
    ' <div class="head"><span class="eyebrow" id="skr-eyebrow">Sudokrine</span><span class="badge" id="skr-badge" hidden></span></div>' +
    ' <div class="sbar" id="skr-bar"><span class="timer" id="skr-timer" aria-label="Time">0:00</span><span class="hintsleft" id="skr-hl"></span></div>' +
    ' <div class="board" id="skr-board" role="grid" aria-label="Sudokrine grid"></div>' +
    ' <div class="msg" id="skr-msg" aria-live="polite"></div>' +
    ' <div class="ctl" id="skr-play">' +
    '  <div class="pad" id="skr-pad"></div>' +
    '  <div class="tbox">' +
    '   <button type="button" class="tool" id="skr-notes" aria-pressed="false"><span class="ti" aria-hidden="true">✏️</span><span>Notes <b id="skr-noteson">off</b></span></button>' +
    '   <button type="button" class="tool" id="skr-erase"><span class="ti" aria-hidden="true">⌫</span><span>Erase</span></button>' +
    '   <button type="button" class="tool" id="skr-undo"><span class="ti" aria-hidden="true">↶</span><span>Undo</span></button>' +
    '   <button type="button" class="tool" id="skr-hint"><span class="ti" aria-hidden="true">💡</span><span>Hint <b id="skr-hintn">3</b></span></button>' +
    '  </div>' +
    '  <div class="opts"><label><input type="checkbox" id="skr-nums"> Show numbers instead</label><label><input type="checkbox" id="skr-mis"> Show mistakes</label><button type="button" class="giveup" id="skr-giveup">Give up</button></div>' +
    ' </div>' +
    ' <div class="result" id="skr-result" hidden></div>' +
    ' <p class="note" id="skr-next"></p>' +
    ' <details class="archive" id="skr-archive"><summary>Past puzzles</summary><div class="alist" id="skr-alist"></div></details>' +
    "</div>";
  var $ = function (id) { return document.getElementById("skr-" + id); };

  // ---------- dates & storage ----------
  function sydToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function nice(d) { return new Date(dayNum(d) * 864e5).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function pref(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v === "1"; } catch (e) { return d; } }
  function setPref(k, v) { try { localStorage.setItem(k, v ? "1" : "0"); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(s) { s = Math.floor(s || 0); var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = ("0" + (s % 60)).slice(-2); return h ? h + ":" + ("0" + m).slice(-2) + ":" + x : m + ":" + x; }
  var REAL = sydToday(), q = new URLSearchParams(location.search).get("date");
  var today = (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) ? q : REAL;
  function isLive() { return today === REAL; }
  var SKEY = PFX + "skr-stats", stats = load(SKEY, { played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0, 0] });
  var KEY, st, P = null, n = 9, BR = 3, BC = 3, sol = [], giv = [], sel = -1, notesOn = false, armGive = false;
  var nums = pref("skr-nums", false), showMis = pref("skr-mistakes", true);
  function loadDay() { KEY = PFX + "skr-day-" + today; st = load(KEY, null); }
  loadDay();

  // ---------- sass ----------
  function pick(a) { if (a.length < 2) return a[0]; var k = "mw-last-" + a[0].slice(0, 12), last; try { last = sessionStorage.getItem(k); } catch (e) {} var x, c = 0; do { x = a[Math.floor(Math.random() * a.length)]; } while (x === last && ++c < 8); try { sessionStorage.setItem(k, x); } catch (e) {} return x; }
  var SASS = NORMIE ? {
    clean: ["No hints. Not one. Smug is allowed.", "Clean solve. Your brain did push-ups.", "Unaided. Frame the grid.", "All you. Very tidy."],
    help: ["Solved, with a nudge. Still counts.", "Got there. The hint button says you’re welcome.", "Done. A little help never hurt anyone."],
    lose: ["The grid wins today. Rematch tomorrow.", "Solution revealed. Study it like a recipe.", "Not today. Tomorrow’s grid is already in the oven."],
    full: "Grid’s full, but something’s not right. Hunt the clash."
  } : {
    clean: ["No hints. Perfect homeostasis.", "Unaided. The endocrinologist is impressed.", "Clean solve. Not a hormone out of place.", "Zero hints. Textbook feedback loop."],
    help: ["Solved, with a top-up dose. Still counts.", "Got there with a hint. Titrated nicely.", "Done. A little supplementation never hurt."],
    lose: ["The grid wins today. Rematch tomorrow.", "Solution revealed. Read it like a lab report.", "Not today. Tomorrow’s dose is already drawn up."],
    full: "Grid’s full, but the levels are off. Find the clash."
  };
  function say(t) { var m = $("msg"); m.textContent = t || ""; }

  // ---------- geometry ----------
  function rc(i) { return [Math.floor(i / n), i % n]; }
  function boxOf(i) { var p = rc(i); return Math.floor(p[0] / BR) * (n / BC) + Math.floor(p[1] / BC); }
  function peers(i, j) { if (i === j) return false; var a = rc(i), b = rc(j); return a[0] === b[0] || a[1] === b[1] || boxOf(i) === boxOf(j); }
  var PEERS = [];
  function buildPeers() { PEERS = []; for (var i = 0; i < n * n; i++) { var p = []; for (var j = 0; j < n * n; j++) if (peers(i, j)) p.push(j); PEERS.push(p); } }
  function locked(i) { return giv[i] || (st.hl || []).indexOf(i) >= 0; }
  function clashes() {
    var bad = {};
    for (var i = 0; i < n * n; i++) if (st.g[i]) PEERS[i].forEach(function (j) { if (st.g[j] === st.g[i]) { bad[i] = 1; bad[j] = 1; } });
    return bad;
  }
  function solved() { for (var i = 0; i < n * n; i++) if (st.g[i] !== sol[i]) return false; return true; }
  function full() { for (var i = 0; i < n * n; i++) if (!st.g[i]) return false; return true; }

  // ---------- render ----------
  var ICON = { Easy: "🟢", Medium: "🟡", Hard: "🔴", Genius: "🧠", Einstein: "⚛️" };
  var EIN = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/></svg>';
  function glyph(k) { return nums ? '<span class="num">' + k + "</span>" : svg(k); }
  function label(k) { return nums ? String(k) : SYM[k - 1][0]; }
  function paintBoard() {
    var b = $("board"), bad = showMis && !st.done ? clashes() : {}, sv = sel >= 0 ? st.g[sel] : 0, h = "";
    b.className = "board n" + n + (nums ? " nums" : "") + (st.done ? " done" : "") + (st.done && st.win ? " won" : "");
    b.style.setProperty("--n", n);
    for (var i = 0; i < n * n; i++) {
      var p = rc(i), v = st.g[i], cls = "cell";
      if (giv[i]) cls += " giv"; else if ((st.hl || []).indexOf(i) >= 0) cls += " hinted";
      if ((p[1] + 1) % BC === 0 && p[1] < n - 1) cls += " br";
      if ((p[0] + 1) % BR === 0 && p[0] < n - 1) cls += " bb";
      if (!st.done && sel >= 0) { if (i === sel) cls += " sel"; else if (sv && v === sv) cls += " same"; else if (peers(i, sel)) cls += " zone"; }
      if (bad[i] && !giv[i]) cls += " bad"; else if (bad[i]) cls += " badg";
      var inner = "";
      if (v) inner = glyph(v);
      else if (st.n[i]) { inner = '<span class="nts">'; for (var k = 1; k <= n; k++) inner += "<i" + (sv === k && !st.done ? ' class="on"' : "") + ">" + (st.n[i] & (1 << (k - 1)) ? glyph(k) : "") + "</i>"; inner += "</span>"; }
      var al = "Row " + (p[0] + 1) + ", column " + (p[1] + 1) + ": " + (v ? label(v) + (giv[i] ? " (given)" : "") : "empty");
      h += '<button type="button" class="' + cls + '" data-i="' + i + '" role="gridcell" aria-label="' + al + '"' + (i === sel ? ' aria-selected="true"' : "") + ">" + inner + "</button>";
    }
    b.innerHTML = h;
  }
  function paintPad() {
    var cnt = {}; st.g.forEach(function (v) { if (v) cnt[v] = (cnt[v] || 0) + 1; });
    var h = "";
    for (var k = 1; k <= n; k++) h += '<button type="button" class="key' + ((cnt[k] || 0) >= n ? " used" : "") + '" data-k="' + k + '" aria-label="' + (notesOn ? "Note " : "Place ") + label(k) + '">' + glyph(k) + (nums ? "" : '<small aria-hidden="true">' + k + "</small>") + "</button>";
    $("pad").innerHTML = h;
    $("pad").className = "pad n" + n + (notesOn ? " notes" : "");
    $("notes").setAttribute("aria-pressed", notesOn ? "true" : "false"); $("notes").classList.toggle("on", notesOn); $("noteson").textContent = notesOn ? "on" : "off";
    var left = HINTS - (st.hints || 0); $("hintn").textContent = left; $("hint").disabled = left <= 0 || st.done;
    $("undo").disabled = !(st.undo && st.undo.length);
    $("hl").textContent = st.hints ? st.hints + " hint" + (st.hints > 1 ? "s" : "") + " used" : "";
    $("giveup").textContent = armGive ? "Sure? Tap again to reveal" : "Give up";
  }
  function paint() {
    if (!P) return;
    $("timer").textContent = fmt(st.t);
    $("play").hidden = st.done;
    paintBoard(); if (!st.done) paintPad(); renderResult();
  }
  function hintWord(h) { return !h ? "no hints" : h === 1 ? "1 hint" : h + " hints"; }
  function renderResult() {
    var r = $("result");
    if (!st.done) { r.hidden = true; return; }
    var share = NAME + " #" + P.number + (isLive() ? "" : " (archive)") + " · " + P.difficulty + (NORMIE ? " 🍎 " : " 💊 ") + (st.win ? fmt(st.t) + " · " + hintWord(st.hints) : "gave up") + "\nmaladywise.com";
    var pct = stats.played ? Math.round(stats.wins / stats.played * 100) : 0, max = Math.max.apply(null, stats.dist.concat([1])), mine = st.win ? Math.min(st.hints || 0, 3) : 4, L = ["0", "1", "2", "3", "X"];
    r.hidden = false;
    r.innerHTML = '<p class="verdict ' + (st.win ? "ok" : "no") + '">' + (st.win ? "Solved in " + fmt(st.t) + " · " + hintWord(st.hints) : "Solution revealed") + "</p>" +
      '<div class="fact"><b>' + (NORMIE ? "Fun fact" : "A dose of fact") + "</b><p>" + esc(NORMIE ? P.nfact : P.fact) + "</p></div>" +
      (P.techniques && P.techniques.length ? '<div class="tech"><b>Logic needed</b><div class="chips">' + P.techniques.map(function (t) { return '<span class="chip">' + esc(t) + "</span>"; }).join("") + "</div></div>" : "") +
      '<div class="stats"><div><b>' + stats.played + '</b><span>Played</span></div><div><b>' + pct + '</b><span>Win %</span></div><div><b>' + stats.streak + '</b><span>Streak</span></div><div><b>' + stats.best + "</b><span>Best</span></div></div>" +
      '<p class="dtitle">Hints per solve</p><div class="dist">' + stats.dist.map(function (c, i) { return "<div><span>" + L[i] + '</span><i class="' + (i === mine && isLive() ? "me" : "") + '" style="width:' + Math.max(8, Math.round(c / max * 100)) + '%">' + c + "</i></div>"; }).join("") + "</div>" +
      '<pre id="skr-share">' + esc(share) + '</pre><button class="btn" type="button" id="skr-copy">Copy result</button>';
    $("copy").onclick = function () {
      var b = this;
      function selTxt() { var rg = document.createRange(); rg.selectNodeContents($("share")); var w = getSelection(); w.removeAllRanges(); w.addRange(rg); b.textContent = "Selected. Copy it"; }
      try { navigator.clipboard.writeText(share).then(function () { b.textContent = "Copied"; }, selTxt); } catch (e) { selTxt(); }
    };
  }
  function tick() {
    var t = "A new grid arrives at midnight, Sydney time.";
    try { var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
      var left = 1440 - ((p[0] % 24) * 60 + p[1]); t = "Next grid in " + Math.floor(left / 60) + "h " + (left % 60) + "m. " + (NORMIE ? "Have a snack. A fruit one." : "Take your meds. As prescribed."); } catch (e) {}
    $("next").textContent = t;
  }

  // ---------- timer ----------
  var ticking = null;
  function visible() { var g = document.getElementById("game"); return !(g && g.hidden) && !document.hidden && !document.querySelector(".scrim"); }
  function startClock() {
    if (ticking) clearInterval(ticking);
    ticking = setInterval(function () {
      if (!P || !st || st.done || !visible()) return;
      st.t += 1; $("timer").textContent = fmt(st.t); if (st.t % 5 === 0) put(KEY, st);
    }, 1000);
  }

  // ---------- moves ----------
  function save() { if (st.undo.length > 150) st.undo = st.undo.slice(-150); put(KEY, st); }
  function apply(i, v, notes) {
    // returns a change list [[cell, oldValue, oldNotes], ...] for undo
    var ch = [[i, st.g[i], st.n[i]]];
    st.g[i] = v; st.n[i] = notes;
    if (v) PEERS[i].forEach(function (j) { if (st.n[j] & (1 << (v - 1))) { ch.push([j, st.g[j], st.n[j]]); st.n[j] &= ~(1 << (v - 1)); } });
    return ch;
  }
  function input(k) {
    if (!P || st.done || sel < 0 || locked(sel)) return;
    armGive = false; say("");
    if (notesOn && !st.g[sel]) {
      st.undo.push([[sel, st.g[sel], st.n[sel]]]); st.n[sel] ^= 1 << (k - 1);
    } else {
      if (st.g[sel] === k) { st.undo.push([[sel, k, st.n[sel]]]); st.g[sel] = 0; }
      else st.undo.push(apply(sel, k, 0));
    }
    after();
  }
  function erase() {
    if (!P || st.done || sel < 0 || locked(sel) || (!st.g[sel] && !st.n[sel])) return;
    armGive = false; st.undo.push([[sel, st.g[sel], st.n[sel]]]); st.g[sel] = 0; st.n[sel] = 0; say(""); after();
  }
  function undo() {
    if (!P || st.done || !st.undo.length) return;
    armGive = false; var ch = st.undo.pop();
    for (var x = ch.length - 1; x >= 0; x--) { var c = ch[x]; if (locked(c[0])) continue; st.g[c[0]] = c[1]; st.n[c[0]] = c[2]; }
    say(""); after();
  }
  function hint() {
    if (!P || st.done || (st.hints || 0) >= HINTS) return;
    armGive = false;
    var t = sel >= 0 && !locked(sel) && st.g[sel] !== sol[sel] ? sel : -1;
    if (t < 0) { var cands = []; for (var i = 0; i < n * n; i++) if (!locked(i) && st.g[i] !== sol[i]) cands.push(i); if (!cands.length) return; t = cands[(P.number * 7 + (st.hints || 0) * 13) % cands.length]; }
    apply(t, sol[t], 0); st.hl = (st.hl || []).concat([t]); st.hints = (st.hints || 0) + 1; sel = t;
    say((NORMIE ? "Hint used. " : "Hint dispensed. ") + (HINTS - st.hints) + " left.");
    after();
  }
  function giveUp() {
    if (!P || st.done) return;
    if (!armGive) { armGive = true; paintPad(); return; }
    armGive = false;
    for (var i = 0; i < n * n; i++) { st.g[i] = sol[i]; st.n[i] = 0; }
    finish(false); paint();
  }
  function after() {
    if (full() && solved()) { finish(true); paint(); $("result").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (full()) say(SASS.full);
    save(); paint();
  }
  function finish(win) {
    st.done = true; st.win = win; st.d = P.difficulty; st.undo = []; put(KEY, st);
    if (isLive() && stats.last !== today) {
      var yest = stats.last && dayNum(today) - dayNum(stats.last) === 1;
      stats.played++; if (win) stats.wins++;
      stats.streak = win ? (yest ? stats.streak + 1 : 1) : 0; stats.best = Math.max(stats.best, stats.streak);
      stats.dist[win ? Math.min(st.hints || 0, 3) : 4]++; stats.last = today; put(SKEY, stats);
    }
    if (P.difficulty === "Einstein") {
      say(win ? "⚛️ Einstein solved in " + fmt(st.t) + ". A once-in-50-days grid. Screenshot this." : "Even Einstein needed a few goes. Respect for taking on the rare one.");
      if (win && isLive()) { var tro = load(PFX + "mw-einstein", []); if (!tro.some(function (t) { return t.g === "sudokrine" && t.d === today; })) { tro.push({ g: "sudokrine", d: today }); put(PFX + "mw-einstein", tro); } }
    } else say(win ? pick(st.hints ? SASS.help : SASS.clean) : pick(SASS.lose));
  }

  // ---------- input wiring ----------
  $("board").addEventListener("click", function (e) {
    var c = e.target.closest(".cell"); if (!c || !P || st.done) return;
    sel = +c.getAttribute("data-i"); armGive = false; paint();
  });
  $("pad").addEventListener("click", function (e) { var b = e.target.closest(".key"); if (b) input(+b.getAttribute("data-k")); });
  $("notes").onclick = function () { notesOn = !notesOn; paintPad(); paintBoard(); };
  $("erase").onclick = erase; $("undo").onclick = undo; $("hint").onclick = hint; $("giveup").onclick = giveUp;
  $("nums").checked = nums; $("mis").checked = showMis;
  $("nums").onchange = function () { nums = this.checked; setPref("skr-nums", nums); paint(); };
  $("mis").onchange = function () { showMis = this.checked; setPref("skr-mistakes", showMis); paint(); };
  document.addEventListener("keydown", function (e) {
    var t = e.target && e.target.tagName; if (t === "INPUT" || t === "TEXTAREA") return;
    if (document.querySelector(".scrim")) return;
    var g = document.getElementById("game"); if (g && g.hidden) return;
    if (!P || st.done) return;
    if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) { undo(); e.preventDefault(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key, mv = { ArrowUp: -n, ArrowDown: n, ArrowLeft: -1, ArrowRight: 1 }[k];
    if (mv) {
      if (sel < 0) sel = 0; else { var p = rc(sel); if (k === "ArrowLeft" && p[1] === 0) sel += n - 1; else if (k === "ArrowRight" && p[1] === n - 1) sel -= n - 1; else sel = (sel + mv + n * n) % (n * n); }
      paint(); e.preventDefault(); return;
    }
    if (/^[1-9]$/.test(k) && +k <= n) { input(+k); e.preventDefault(); return; }
    if (k === "Backspace" || k === "Delete" || k === "0") { erase(); e.preventDefault(); return; }
    if (k === "n" || k === "N") { notesOn = !notesOn; paintPad(); paintBoard(); return; }
    if (k === "u" || k === "U") { undo(); return; }
  });
  document.addEventListener("visibilitychange", function () { if (document.hidden && P && st && !st.done) put(KEY, st); });

  // ---------- load ----------
  var cache = {};
  function month(m) {
    if (!cache[m]) cache[m] = fetch(BASE + "puzzles/" + m + ".json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    return cache[m];
  }
  function prevMonth(m) { var p = m.split("-").map(Number); p[1]--; if (!p[1]) { p[1] = 12; p[0]--; } return p[0] + "-" + ("0" + p[1]).slice(-2); }
  function show(date) {
    today = date; loadDay(); P = null; sel = -1; notesOn = false; armGive = false; say("");
    return month(date.slice(0, 7)).then(function (list) {
      P = list.filter(function (x) { return x.date === date; })[0] || null;
      if (!P) {
        $("play").hidden = true; $("result").hidden = true; $("badge").hidden = true; $("bar").hidden = true;
        $("board").className = "board empty";
        $("board").innerHTML = '<p class="empty">' + (date < LAUNCH ? "Sudokrine opens Monday 26 October. " + (NORMIE ? "The fruit bowl is filling up." : "The glands are warming up.") : "Today’s grid is still being titrated. Back tomorrow.") + "</p>";
        renderArchive(); return;
      }
      $("bar").hidden = false;
      n = P.size; BR = P.box[0]; BC = P.box[1]; buildPeers();
      sol = P.solution.split("").map(Number); giv = P.puzzle.split("").map(function (c) { return c !== "0"; });
      if (!st || !st.g || st.g.length !== n * n) st = { g: P.puzzle.split("").map(Number), n: P.puzzle.split("").map(function () { return 0; }), t: 0, hints: 0, hl: [], undo: [], done: false, win: false };
      if (!st.undo) st.undo = [];
      $("eyebrow").textContent = (isLive() ? "Sudokrine" : "Archive") + " · #" + P.number + " · " + nice(date);
      var b = $("badge"); b.hidden = false; b.className = "badge " + P.difficulty; b.innerHTML = (P.difficulty === "Einstein" ? EIN : "") + P.difficulty + " · " + n + "×" + n; root.classList.toggle("einstein", P.difficulty === "Einstein");
      if (!st.done) { for (var i = 0; i < n * n; i++) if (!st.g[i]) { sel = i; break; } }
      if (!isLive()) say(st.done ? "Archive grid. Already done." : "Archive grid. Doesn’t count towards your streak.");
      else if (st.done) say(st.win ? "Solved. Come back tomorrow." : "You’ve had your go. Back tomorrow.");
      paint(); renderArchive();
    });
  }
  function renderArchive() {
    var m = REAL.slice(0, 7);
    Promise.all([prevMonth(m) < LAUNCH.slice(0, 7) ? Promise.resolve([]) : month(prevMonth(m)), month(m)]).then(function (ls) {
      var past = [].concat(ls[0], ls[1]).filter(function (x) { return x.date < REAL; }).reverse();
      var rows = past.map(function (x) {
        var s = load(PFX + "skr-day-" + x.date, null), mark = !s || !s.done ? (s && s.t ? " …" : "") : s.win ? " ✓" : " ✕";
        return '<button type="button" class="arow' + (x.date === today ? " on" : "") + '" data-d="' + x.date + '"><span>#' + x.number + " · " + nice(x.date) + mark + '</span><span class="badge ' + x.difficulty + '">' + x.difficulty + "</span></button>";
      }).join("");
      var back = isLive() ? "" : '<button type="button" class="btn" id="skr-back">Back to today</button>';
      $("alist").innerHTML = back + (rows || '<p class="note">No past grids yet. You’re early.</p>');
      Array.prototype.forEach.call($("alist").querySelectorAll(".arow"), function (b) { b.onclick = function () { if (P && st && !st.done) put(KEY, st); show(b.getAttribute("data-d")); root.scrollIntoView({ behavior: "smooth" }); }; });
      if ($("back")) $("back").onclick = function () { if (P && st && !st.done) put(KEY, st); show(REAL); root.scrollIntoView({ behavior: "smooth" }); };
    });
  }
  window.MW_openArchive = function () { var d = $("archive"); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); };

  tick(); setInterval(tick, 60000); startClock();
  show(today);
})();
