/* Malady Wise medicine and fact sheet one-page print (moved out of shell.js on 24 Nov 2026).
   shell.js loads this only on pages with <main class="doc">, then calls MW_medPrintFn(). */
window.MW_medPrintFn = function () {
    var main = document.querySelector("main.doc"); if (!main || main.querySelector(".medp-head")) return;
    var kind = /^\/medicines\/[^\/]+\/$/.test(location.pathname) ? "Medicine guide" : "";
    var ft = main.querySelector(".fs-top .meta"); if (!kind && ft && /^Fact sheet$/i.test(ft.textContent.trim())) kind = "Fact sheet";
    if (!kind) return; var fact = kind === "Fact sheet";
    document.body.classList.add("medp");
    var h1 = main.querySelector("h1"); if (!h1) return;
    h1.insertAdjacentHTML("beforebegin", '<div class="medp-head"><b>Malady Wise</b><span>' + kind + ' · maladywise.com' + location.pathname + "</span></div>");
    var start = main.querySelector(".glance") || main.querySelector(".lede") || h1, n = start.nextElementSibling, box = document.createElement("div");
    box.className = "medp-cols";
    var stop = function (el) { return !el || el.matches((fact ? "" : ".callout, ") + "section.faq, ul.src, ul.res, .mw-sharecard, section.related, .print-url, .print-qr, footer, .nl, .mwx, .mw-about") || (el.tagName === "H2" && /^(More information|Sources|Evidence|Helpful resources|Common questions)/i.test(el.textContent.trim())); };
    if (start.classList.contains("glance")) { var gh = start.previousElementSibling; if (gh && gh.tagName === "H2") gh.classList.add("medp-glance-h"); }
    var take = []; while (n && !stop(n)) { take.push(n); n = n.nextElementSibling; }
    if (!take.length) return;
    take[0].parentNode.insertBefore(box, take[0]); take.forEach(function (el) { box.appendChild(el); });
    [].forEach.call(main.querySelectorAll(":scope > p.meta"), function (m) { if (/Updated/.test(m.textContent)) m.classList.add("medp-upd"); });
    var opened = [];
    // Two real columns (not CSS multi-column, which browsers re-balance unpredictably across a page break):
    // lay the content out in one narrow column, find the halfway point, and split there. Long lists can split
    // between items; a heading never ends the left column on its own.
    var orig = [].slice.call(box.children), made = [];
    function restore() {
      made.forEach(function (m) { while (m.clone.firstChild) m.list.appendChild(m.clone.firstChild); }); made = [];
      box.innerHTML = ""; orig.forEach(function (el) { box.appendChild(el); }); box.classList.remove("medp-split");
    }
    function split(colW) {
      restore(); box.style.width = colW + "px";
      var top = box.getBoundingClientRect().top, total = box.getBoundingClientRect().height, units = [];
      orig.forEach(function (el) {
        var lis = /^(OL|UL)$/.test(el.tagName) ? [].slice.call(el.children).filter(function (x) { return x.tagName === "LI"; }) : [];
        if (lis.length >= 3) lis.forEach(function (li, k) { units.push({ el: li, list: el, k: k, top: li.getBoundingClientRect().top - top }); });
        else units.push({ el: el, top: el.getBoundingClientRect().top - top });
      });
      var cut = 0, best = 1e9; units.forEach(function (u, k) { var d = Math.abs(u.top - total / 2); if (k && d < best) { best = d; cut = k; } });
      if (!cut) { box.style.width = ""; return; }
      var u = units[cut], A = document.createElement("div"), B = document.createElement("div"); A.className = B.className = "medp-col";
      var startNode = u.el;
      if (u.list) { // split the list: the rest of its items move to a copy in the right column
        if (u.k === 0) startNode = u.list;
        else { var cl = u.list.cloneNode(false); if (u.list.tagName === "OL") cl.start = (u.list.start || 1) + u.k; cl.classList.add("medp-cont");
          [].slice.call(u.list.children).slice(u.k).forEach(function (li) { cl.appendChild(li); }); made.push({ list: u.list, clone: cl }); startNode = cl; }
      }
      var right = false, rightNodes = [], leftNodes = [];
      orig.forEach(function (el) { if (el === startNode) right = true; (right ? rightNodes : leftNodes).push(el); if (el === u.list && startNode !== u.list && u.list) { right = true; } });
      if (startNode.classList && startNode.classList.contains("medp-cont")) rightNodes.unshift(startNode);
      while (leftNodes.length > 1 && /^(H2|H3)$/.test(leftNodes[leftNodes.length - 1].tagName)) rightNodes.unshift(leftNodes.pop());
      box.innerHTML = ""; leftNodes.forEach(function (n) { A.appendChild(n); }); rightNodes.forEach(function (n) { B.appendChild(n); });
      box.appendChild(A); box.appendChild(B); box.classList.add("medp-split"); box.style.width = "";
    }
    function on() {
      document.documentElement.classList.add("medp-on"); main.style.zoom = "";
      [].forEach.call(main.querySelectorAll("details.se-more:not([open])"), function (d) { d.open = true; opened.push(d); });
      // Fill one page: shrink long guides, enlarge short ones. The sheet is laid out at (page width / zoom) so it
      // always spans the page; a few passes settle the height, which changes as the width does.
      var W = 710, fit = 960, z = 1; // px: 188 mm wide; A4 and US Letter height less the page margins
      // Find the biggest zoom (0.5-1.4) at which the sheet still fits: height depends on width, so bisect.
      function tall(zz) { main.style.zoom = ""; main.style.width = main.style.maxWidth = (W / zz) + "px"; split((W / zz - 16) / 2);
        var mt = main.getBoundingClientRect().top, hh = 0; [].forEach.call(main.children, function (c) { var r = c.getBoundingClientRect(); if (r.height) hh = Math.max(hh, r.bottom - mt); }); return hh * zz; }
      var lo = 0.5, hi = 1.4; if (tall(hi) <= fit) lo = hi; else for (var i = 0; i < 8; i++) { var mid = (lo + hi) / 2; if (tall(mid) <= fit) lo = mid; else hi = mid; }
      z = lo;
      z = Math.floor(z * 1000) / 1000; main.style.width = main.style.maxWidth = (W / z) + "px"; split((W / z - 16) / 2); main.style.zoom = String(z);
    }
    function off() { document.documentElement.classList.remove("medp-on"); main.style.zoom = main.style.width = main.style.maxWidth = ""; restore(); opened.forEach(function (d) { d.open = false; }); opened = []; }
    window.addEventListener("beforeprint", on); window.addEventListener("afterprint", off);
    window.MW_medPrint = { on: on, off: off };
};
