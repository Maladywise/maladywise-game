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
/* Visitor-suggested tags: fixed list, no free text. Shown only after several visitors agree and Malady Wise approves. */
(function () {
  var cards = document.querySelectorAll(".sp-card[data-id]"); if (!cards.length) return;
  var API = "https://mw-presence.onrender.com";
  var T = { wc: "♿ Wheelchair access", park: "🅿️ Free parking", pram: "🍼 Pram friendly", interp: "🗣️ Interpreters", fees: "💲 Fees online", ah: "🌙 After hours" };
  var mine = {}; try { mine = JSON.parse(localStorage.getItem("mw-sp-sug") || "{}") || {}; } catch (e) {}
  function save() { try { localStorage.setItem("mw-sp-sug", JSON.stringify(mine)); } catch (e) {} }
  fetch(API + "/tags").then(function (r) { return r.json(); }).then(function (ok) {
    cards.forEach(function (c) {
      var l = ok[c.getAttribute("data-id")]; if (!l || !l.length) return;
      var row = c.querySelector(".sp-tags");
      if (!row) { row = document.createElement("p"); row.className = "sp-tags"; c.insertBefore(row, c.querySelector(".sp-src")); }
      l.forEach(function (t) { if (!T[t]) return; var s = document.createElement("span"); s.className = "sp-t sp-t-v"; s.title = "Reported by visitors, checked by Malady Wise"; s.innerHTML = "<span></span><small> · visitors</small>"; s.firstChild.textContent = T[t]; row.appendChild(s); });
    });
  }).catch(function () {});
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest(".sp-sug"); if (!b) return;
    var c = b.closest(".sp-card"), id = c.getAttribute("data-id"), old = c.querySelector(".sp-sugbox");
    if (old) { old.remove(); return; }
    var done = mine[id] || [], box = document.createElement("div"); box.className = "sp-sugbox";
    box.innerHTML = '<p>Which of these is true here? Pick any. Tags show once a few visitors agree and we\'ve checked them.</p><div class="sp-sugt"></div><p class="sp-sugbtns"><button type="button" class="sp-sugsend">Send</button><button type="button" class="sp-sugx">Cancel</button></p>';
    var wrap = box.querySelector(".sp-sugt");
    Object.keys(T).forEach(function (t) { var o = document.createElement("button"); o.type = "button"; o.className = "sp-chip"; o.setAttribute("data-t", t); o.textContent = T[t]; if (done.indexOf(t) >= 0) { o.disabled = true; o.textContent += " ✓"; } o.setAttribute("aria-pressed", "false"); o.onclick = function () { o.setAttribute("aria-pressed", o.getAttribute("aria-pressed") === "true" ? "false" : "true"); }; wrap.appendChild(o); });
    box.querySelector(".sp-sugx").onclick = function () { box.remove(); };
    box.querySelector(".sp-sugsend").onclick = function () {
      var pick = [].slice.call(wrap.querySelectorAll('[aria-pressed="true"]')).map(function (o) { return o.getAttribute("data-t"); });
      if (!pick.length) { box.remove(); return; }
      var n = (c.querySelector("h3") || {}).textContent || "";
      pick.forEach(function (t) { fetch(API + "/tag?p=" + encodeURIComponent(id) + "&t=" + t + "&n=" + encodeURIComponent(n), { method: "POST" }).catch(function () {}); });
      mine[id] = done.concat(pick); save();
      box.innerHTML = "<p>Thanks! We'll check it before it shows.</p>"; setTimeout(function () { box.remove(); }, 3500);
    };
    c.querySelector(".sp-act").after(box);
  });
})();
/* Print: whole (filtered) list, or one card. */
(function () {
  function head(what) {
    var h = document.querySelector(".sp-phead"); if (!h) { h = document.createElement("p"); h.className = "sp-phead"; var m = document.querySelector("main") || document.body; m.insertBefore(h, m.firstChild); }
    var f = document.querySelector("[data-sp-filter]"), q = f && f.value.trim(), chips = [].slice.call(document.querySelectorAll('.sp-chips .sp-chip[aria-pressed="true"]')).map(function (c) { return c.textContent.trim(); });
    h.textContent = "Malady Wise · " + what + (q ? " · filter: “" + q + "”" : "") + (chips.length ? " · " + chips.join(", ") : "") + " · printed " + new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) + " · maladywise.com" + location.pathname;
  }
  function go(cls) { document.body.classList.add(cls); var done = function () { document.body.classList.remove(cls); var o = document.querySelector(".sp-one"); if (o) o.classList.remove("sp-one"); window.removeEventListener("afterprint", done); }; window.addEventListener("afterprint", done); window.print(); setTimeout(done, 1500); }
  document.addEventListener("click", function (ev) {
    var t = ev.target; if (!t.closest) return;
    var h1 = (document.querySelector("h1") || {}).textContent || "Specialists";
    if (t.closest(".sp-prall")) { head(h1 + " in Newcastle and the Hunter"); go("sp-printing"); }
    var one = t.closest(".sp-pr1");
    if (one) { var c = one.closest(".sp-card"); c.classList.add("sp-one"); head(h1); go("sp-print1"); }
  });
})();
