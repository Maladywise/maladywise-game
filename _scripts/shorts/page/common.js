// Shared timeline helpers for Malady Wise Shorts.
// Each page defines window.setup(D) (fills the page from puzzle data, sets window.DUR and window.CHECK_TIMES)
// and window.render(t), a pure function of the time t in seconds.
var C = function (x, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return Math.min(b, Math.max(a, x)); };
var R = function (t, a, b) { return C((t - a) / (b - a)); };
var eo = function (x) { return 1 - Math.pow(1 - x, 3); };
var eio = function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
var eb = function (x) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
var $ = function (id) { return document.getElementById(id); };
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function css(el, o) { for (var k in o) el.style[k] = o[k]; }
// fade + rise in between a..a+d, optional fade out between b..b+d2
function appear(el, t, a, d, b, d2, dy) {
  dy = dy == null ? 40 : dy; d = d || .35;
  var i = eo(R(t, a, a + d)), o = b != null ? 1 - R(t, b, b + (d2 || .3)) : 1;
  css(el, { opacity: Math.min(i, o), transform: "translateY(" + ((1 - i) * dy) + "px)" });
}
function pop(el, t, a, d) { var x = R(t, a, a + (d || .35)); css(el, { opacity: C(x * 3), transform: "scale(" + (x ? eb(x) : 0.01) + ")" }); }
function introAt(t) { // brand intro 0..0.8 s
  var el = $("intro");
  pop(el.querySelector("img"), t, 0, .35); appear(el.querySelector(".wm"), t, .1, .3, null, null, 30); appear(el.querySelector(".gm"), t, .2, .3, null, null, 30);
  var out = eio(R(t, .62, .82));
  css(el, { transform: "translateY(" + (-out * 1920) + "px)", display: t > .83 ? "none" : "flex" });
}
function endAt(t, a) { // end card from a
  var el = $("end"), x = eio(R(t, a, a + .3));
  css(el, { display: t >= a ? "flex" : "none", transform: "translateY(" + ((1 - x) * 1920) + "px)" });
  pop(el.querySelector("img"), t, a + .2, .4);
  appear(el.querySelector(".wm"), t, a + .3, .3); appear(el.querySelector(".ln"), t, a + .45, .3); appear(el.querySelector(".url"), t, a + .6, .3);
}
function ring(el, frac, num) { // frac 0..1 remaining
  var c = 2 * Math.PI * 64;
  el.querySelector(".arc").setAttribute("stroke-dasharray", (c * frac).toFixed(1) + " " + c.toFixed(1));
  el.querySelector("span").textContent = num;
}
var RING = '<svg viewBox="0 0 150 150"><circle cx="75" cy="75" r="64" fill="#fff" stroke="#E3DAF7" stroke-width="14"/><circle class="arc" cx="75" cy="75" r="64" fill="none" stroke="#4A3480" stroke-width="14" stroke-linecap="round" transform="rotate(-90 75 75)"/></svg><span>10</span>';
function optsHtml(opts) {
  return opts.map(function (o, i) { return '<div class="opt chk" id="o' + i + '" style="top:' + (i * 106) + 'px"><b>' + "ABCD"[i] + '</b><div class="fit" data-fit="38,24"><span class="in">' + esc(o) + "</span></div></div>"; }).join("");
}
function brand(game, mascot, gm, line, url) {
  document.querySelectorAll(".mascot").forEach(function (m) { m.src = "../../../assets/mascots/" + mascot + ".svg"; });
  $("intro").querySelector(".gm").textContent = gm;
  $("end").querySelector(".wm").textContent = game;
  $("end").querySelector(".ln").textContent = line;
  $("end").querySelector(".url").textContent = url;
}

// ---- auto-fit and overflow checks ----
function overflows(box) {
  var inn = box.firstElementChild || box;
  return inn.offsetHeight > box.clientHeight + 1 || Math.max(inn.scrollWidth, inn.offsetWidth) > box.clientWidth + 1 || box.scrollWidth > box.clientWidth + 1;
}
function fitAll() { // data-fit="max,min" font sizes in px
  document.querySelectorAll("[data-fit]").forEach(function (box) {
    var mm = box.getAttribute("data-fit").split(","), s = +mm[0], lo = +mm[1], inn = box.firstElementChild || box;
    inn.style.fontSize = s + "px";
    while (overflows(box) && s > lo) { s -= 1; inn.style.fontSize = s + "px"; }
  });
}
// Problems visible at the current frame: auto-fit boxes whose text still overflows, and visible
// elements marked .chk that leave the frame or drop below the platform-UI safe zone (y 1640).
window.checkFit = function () {
  var bad = [];
  function shown(el) { for (var e = el; e && e !== document.body; e = e.parentElement) { var cs = getComputedStyle(e); if (cs.display === "none" || +cs.opacity < .05) return false; } return true; }
  function name(el) { return (el.id || el.parentElement.id || el.className) + ": " + (el.textContent || "").trim().slice(0, 50); }
  document.querySelectorAll("[data-fit]").forEach(function (box) { if (shown(box) && overflows(box)) bad.push("text overflows " + name(box)); });
  document.querySelectorAll(".chk").forEach(function (el) {
    if (!shown(el)) return;
    var r = el.getBoundingClientRect();
    if (r.left < -1 || r.right > 1081 || r.top < -1 || r.bottom > 1641) bad.push("outside safe area " + name(el) + " [" + Math.round(r.left) + "," + Math.round(r.top) + "," + Math.round(r.right) + "," + Math.round(r.bottom) + "]");
  });
  var labels = [];
  document.querySelectorAll("svg .hl text").forEach(function (el) { if (shown(el)) labels.push([el, el.getBoundingClientRect()]); });
  labels.forEach(function (a, i) { labels.slice(i + 1).forEach(function (b) {
    var r = a[1], q = b[1];
    if (r.left < q.right && r.right > q.left && r.top < q.bottom && r.bottom > q.top) bad.push("ECG labels overlap: " + a[0].textContent + " / " + b[0].textContent);
  }); });
  return bad;
};
