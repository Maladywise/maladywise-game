/* Specialists: index search across everyone; specialty pages filter in place. */
(function () {
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  var f = document.querySelector("[data-sp-filter]"), cnt = document.querySelector(".sp-count");
  if (f) f.addEventListener("input", function () {
    var q = norm(f.value).trim(), n = 0;
    document.querySelectorAll(".sp-card").forEach(function (c) { var show = !q || norm(c.getAttribute("data-q")).indexOf(q) >= 0; c.hidden = !show; if (show) n++; });
    if (cnt) cnt.textContent = q ? n + (n === 1 ? " match" : " matches") : "";
  });
  var s = document.querySelector("[data-sp-search]"), out = document.querySelector(".sp-results");
  if (s && out && window.SP_ALL) s.addEventListener("input", function () {
    var q = norm(s.value).trim(); if (q.length < 2) { out.hidden = true; out.innerHTML = ""; return; }
    var hits = SP_ALL.filter(function (x) { return norm(x.q).indexOf(q) >= 0; }).slice(0, 40);
    out.hidden = false;
    out.innerHTML = hits.length ? hits.map(function (x) { var t = document.createElement("li"), a = document.createElement("a"); a.href = x.u; a.innerHTML = "<b></b><span></span>"; a.firstChild.textContent = x.n; a.lastChild.textContent = x.s + (x.sub ? " · " + x.sub : ""); t.appendChild(a); return t.outerHTML; }).join("") : '<li class="none">No matches. Try a suburb or a specialty.</li>';
  });
})();
