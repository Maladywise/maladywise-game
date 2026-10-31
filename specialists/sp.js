/* Specialists A–Z: live filter by name, specialty, suburb or interest. */
(function () {
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  var f = document.querySelector("[data-sp-filter]"), cnt = document.querySelector(".sp-count"), az = document.querySelector(".sp-az");
  if (!f) return;
  f.addEventListener("input", function () {
    var q = norm(f.value).trim(), n = 0;
    document.querySelectorAll(".sp-card").forEach(function (c) { var show = !q || norm(c.getAttribute("data-q")).indexOf(q) >= 0; c.hidden = !show; if (show) n++; });
    document.querySelectorAll(".sp-letter").forEach(function (h) { var ul = h.nextElementSibling, any = ul && ul.querySelector(".sp-card:not([hidden])"); h.hidden = !any; if (ul) ul.hidden = !any; });
    if (az) az.hidden = !!q; if (cnt) cnt.textContent = q ? n + (n === 1 ? " match" : " matches") : "";
  });
})();
