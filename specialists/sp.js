/* Specialists: "find by interest" search (text with synonyms, interest chips, practical toggles) plus inclusive-care badge chips. Data comes from build.py; no libraries. */
(function () {
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  var PHR = [[/post[- ]?traumatic( stress)?( disorder)?/g, "trauma"], [/post[- ]?natal|post[- ]?partum|ante[- ]?natal|pre[- ]?natal|pregnan\w*/g, "perinatal"], [/eating disorders?/g, "eating disorders"], [/lgbt\w*\+?|queer|gay|lesbian/g, "lgbtiqa"], [/transgender|gender[- ]diverse/g, "trans"], [/chronic fatigue( syndrome)?/g, "me/cfs"]];
  var SYN = { ptsd: "trauma", asd: "autism", autistic: "autism", add: "adhd", anorexia: "eating", bulimia: "eating", binge: "eating", arfid: "eating", kids: "child", children: "child", kid: "child", teen: "adolescent", teens: "adolescent", teenager: "adolescent", teenagers: "adolescent", youth: "adolescent", indigenous: "first nations", aboriginal: "first nations", dysautonomia: "pots", cfs: "me/cfs", mito: "mitochondrial", lymphedema: "lymphoedema", pediatric: "paediatric", hypermobile: "hypermobility", eds: "hypermobility", obsessive: "ocd", depressed: "depression", anxious: "anxiety", couple: "couples", marriage: "couples", relationship: "couples" };
  function terms(raw) {
    var q = norm(raw).trim(); if (!q) return [];
    PHR.forEach(function (r) { q = q.replace(r[0], function (m) { return " \u0001" + r[1].replace(/ /g, "\u0002") + " "; }); });
    return q.split(/[\s,;]+/).filter(Boolean).map(function (t) { var x = t.replace(/\u0001/g, "").replace(/\u0002/g, " "); return [x, SYN[x] || null]; });
  }
  function hit(hay, ts) { return ts.every(function (t) { return hay.indexOf(t[0]) >= 0 || (t[1] && hay.indexOf(t[1]) >= 0); }); }
  function pressed(sel, attr) { return [].slice.call(document.querySelectorAll(sel + '[aria-pressed="true"]')).map(function (c) { return c.getAttribute(attr); }); }
  function wire(sel, run) { [].slice.call(document.querySelectorAll(sel)).forEach(function (c) { c.addEventListener("click", function () { c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") === "true" ? "false" : "true"); run(); }); }); }
  function has(list, need) { return need.every(function (x) { return list.indexOf(x) >= 0; }); }
  var f = document.querySelector("[data-sp-filter]"), cnt = document.querySelector(".sp-count");
  function runPage() {
    var ts = terms(f.value), bs = pressed(".sp-chip[data-badge]", "data-badge"), tg = pressed(".sp-ichip", "data-tag"), fl = pressed(".sp-tog", "data-flag"), n = 0, ls = document.querySelector("[data-sp-lang]"), lg = ls ? ls.value : "";
    document.querySelectorAll(".sp-card").forEach(function (c) {
      var show = hit(norm(c.getAttribute("data-q")), ts) && has((c.getAttribute("data-b") || "").split(" "), bs) && has((c.getAttribute("data-t") || "").split("|"), tg) && has((c.getAttribute("data-f") || "").split(" "), fl) && (!lg || (c.getAttribute("data-l") || "").split("|").indexOf(lg) >= 0);
      c.hidden = !show; if (show) n++;
    });
    if (cnt) cnt.textContent = ts.length || bs.length || tg.length || fl.length || lg ? n + (n === 1 ? " match" : " matches") : "";
  }
  var s = document.querySelector("[data-sp-search]"), out = document.querySelector(".sp-results");
  function runIndex() {
    var ts = terms(s.value), bs = pressed(".sp-chip[data-badge]", "data-badge"), tg = pressed(".sp-ichip", "data-tag"), fl = pressed(".sp-tog", "data-flag");
    var on = norm(s.value).trim().length >= 2 || bs.length || tg.length || fl.length;
    if (!on) { out.hidden = true; out.innerHTML = ""; if (cnt) cnt.textContent = ""; return; }
    var all = SP_ALL.filter(function (x) { return hit(norm(x.q), ts) && has(x.b || [], bs) && has(x.t || [], tg) && has(x.f || [], fl); }), hits = all.slice(0, 80);
    if (cnt) cnt.textContent = all.length + (all.length === 1 ? " match" : " matches") + (all.length > 80 ? " (showing 80)" : "");
    out.hidden = false; out.innerHTML = "";
    if (!hits.length) { var li0 = document.createElement("li"); li0.className = "none"; li0.textContent = "No matches. Try fewer filters or another word."; out.appendChild(li0); return; }
    hits.forEach(function (x) { var li = document.createElement("li"), a = document.createElement("a"), b = document.createElement("b"), sp = document.createElement("span"); a.href = x.u; b.textContent = x.n; sp.textContent = x.s + (x.sub ? " · " + x.sub : ""); a.appendChild(b); a.appendChild(sp); li.appendChild(a); out.appendChild(li); });
  }
  var run = f ? runPage : (s && out && window.SP_ALL ? runIndex : null);
  if (!run) return;
  (f || s).addEventListener("input", run);
  var lsel = document.querySelector("[data-sp-lang]"); if (lsel && f) lsel.addEventListener("change", run);
  wire(".sp-chip[data-badge]", run); wire(".sp-ichip", run); wire(".sp-tog", run);
  try { var pq = new URLSearchParams(location.search).get("q"); if (pq) { (f || s).value = pq; run(); } } catch (e) {}
  if (f && location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t && t.classList.contains("sp-card")) { t.classList.add("sp-hit"); setTimeout(function () { t.scrollIntoView({ block: "start" }); }, 60); } }
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
