/* Specialists: text search/filter plus inclusive-care badge chips. */
(function () {
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  var chips = [].slice.call(document.querySelectorAll(".sp-chip"));
  function sel() { return chips.filter(function (c) { return c.getAttribute("aria-pressed") === "true"; }).map(function (c) { return c.getAttribute("data-badge"); }); }
  var f = document.querySelector("[data-sp-filter]"), cnt = document.querySelector(".sp-count");
  function runPage() {
    var q = norm(f.value).trim(), bs = sel(), n = 0;
    document.querySelectorAll(".sp-card").forEach(function (c) {
      var have = (c.getAttribute("data-b") || "").split(" ");
      var show = (!q || norm(c.getAttribute("data-q")).indexOf(q) >= 0) && bs.every(function (b) { return have.indexOf(b) >= 0; });
      c.hidden = !show; if (show) n++;
    });
    if (cnt) cnt.textContent = q || bs.length ? n + (n === 1 ? " match" : " matches") : "";
  }
  var s = document.querySelector("[data-sp-search]"), out = document.querySelector(".sp-results");
  function runIndex() {
    var q = norm(s.value).trim(), bs = sel();
    if (q.length < 2 && !bs.length) { out.hidden = true; out.innerHTML = ""; return; }
    var hits = SP_ALL.filter(function (x) { return (q.length < 2 || norm(x.q).indexOf(q) >= 0) && bs.every(function (b) { return (x.b || []).indexOf(b) >= 0; }); }).slice(0, 80);
    out.hidden = false;
    out.innerHTML = hits.length ? hits.map(function (x) { var t = document.createElement("li"), a = document.createElement("a"); a.href = x.u; a.innerHTML = "<b></b><span></span>"; a.firstChild.textContent = x.n; a.lastChild.textContent = x.s + (x.sub ? " · " + x.sub : ""); t.appendChild(a); return t.outerHTML; }).join("") : '<li class="none">No matches. Try fewer filters.</li>';
  }
  var run = f ? runPage : (s && out && window.SP_ALL ? runIndex : null);
  if (!run) return;
  (f || s).addEventListener("input", run);
  chips.forEach(function (c) { c.addEventListener("click", function () { c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") === "true" ? "false" : "true"); run(); }); });
})();
