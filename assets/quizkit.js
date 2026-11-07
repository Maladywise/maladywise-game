/* Quizkit: turns crawlable quiz markup into a playable multiple-choice quiz. Used by /anatomy-quiz/, /ecg-quiz/,
   /medical-terminology-quiz/. Markup (questions stay in the HTML so search engines and no-JS readers get a plain Q&A list):
   <section class="qk" data-id="brain" data-title="Brain anatomy quiz" data-emoji="🧠">
     <ol class="qk-list"><li class="qk-q" data-a="2"> <p class="qk-n">…</p> <h3 class="qk-p">Question</h3>
       [<figure class="qk-art">svg</figure>] [<div class="qk-ecg" data-ecg='{cfg}' data-seed="…">]
       <ol class="qk-opts"><li>A</li><li>B</li>…</ol>
       <details class="qk-ans"><summary>Show answer</summary><p><b>Answer: …</b> <span class="why">…</span></p></details></li></ol>
     [<div class="qk-more" hidden><a href="…">Another quiz</a>…</div>]  (end-screen links; falls back to the page's #more list)
   </section>
   data-a = index (0-based) of the correct option. ECG strips need /arrhythmix/ecg.js loaded first (window.ARX_ECG).
   Best scores: localStorage "qk-best-<id>"; hub cards with data-qk-best="<id>" show them. */
(function () {
  "use strict";
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  var YES = ["Correct.", "Spot on.", "Nailed it.", "Textbook.", "Yes. Smug is allowed.", "Right first time.", "Correct. The examiners nod."];
  var NO = ["Not quite.", "Close, but no.", "Nope. Happens to the best of us.", "Not this time.", "Wrong, but now you know.", "Not quite. Rematch later."];
  function line(p) {
    return p === 1 ? "Perfect score. Frankly suspicious." : p >= 0.8 ? "Excellent. You could teach this." : p >= 0.6 ? "Solid pass. A little revision and you’re flying." :
      p >= 0.4 ? "Getting there. The explanations are a free lesson." : "Tough round. Read the answers, then have another go.";
  }

  function drawEcg(box) {
    if (!window.ARX_ECG || box.getAttribute("data-done")) return;
    try {
      var cfg = JSON.parse(box.getAttribute("data-ecg")), r = ARX_ECG.render(cfg, box.getAttribute("data-seed") || "qk");
      box.innerHTML = r.svg; box.setAttribute("data-done", "1");
      if (cfg.layout === "12") box.classList.add("twelve");
    } catch (e) { /* keep the text fallback */ }
  }

  function init(sec) {
    var qs = [].slice.call(sec.querySelectorAll(".qk-q"));
    if (!qs.length) return;
    var id = sec.getAttribute("data-id") || "quiz", title = sec.getAttribute("data-title") || document.title.split(" | ")[0];
    var emoji = sec.getAttribute("data-emoji") || "✅", more = sec.querySelector(".qk-more") || document.getElementById("more");
    var cur = 0, score = 0, marks = [];
    sec.classList.add("qk-on");
    [].forEach.call(sec.querySelectorAll(".qk-ecg[data-ecg]"), drawEcg);

    var bar = h("div", "qk-bar", '<span class="pos"></span><span class="trk"><i></i></span><span class="sc"></span>');
    bar.setAttribute("aria-live", "polite");
    sec.insertBefore(bar, sec.querySelector(".qk-list"));

    qs.forEach(function (q, qi) {
      var ans = +q.getAttribute("data-a"), lis = [].slice.call(q.querySelectorAll(".qk-opts > li"));
      var why = q.querySelector(".qk-ans .why"), fb = h("div", "qk-fb"); fb.hidden = true; fb.setAttribute("aria-live", "polite");
      var next = h("button", "qk-next", qi === qs.length - 1 ? "See your score" : "Next question"); next.type = "button"; next.hidden = true;
      q.querySelector(".qk-opts").insertAdjacentElement("afterend", fb); fb.insertAdjacentElement("afterend", next);
      var btns = lis.map(function (li, i) {
        var b = h("button", "", '<span class="k">' + "ABCDEF".charAt(i) + "</span><span>" + li.innerHTML + "</span>"); b.type = "button";
        li.innerHTML = ""; li.appendChild(b);
        b.onclick = function () {
          if (q.getAttribute("data-done")) return; q.setAttribute("data-done", "1");
          var right = i === ans; if (right) score++; marks[qi] = right;
          btns.forEach(function (x, j) { x.disabled = true; if (j === ans) x.classList.add("ok"); else if (j === i) x.classList.add("no"); else x.classList.add("dim"); });
          fb.className = "qk-fb " + (right ? "ok" : "no");
          fb.innerHTML = "<b>" + (right ? pick(YES) : pick(NO) + " It’s " + btns[ans].lastChild.innerHTML + ".") + "</b>" + (why ? why.innerHTML : "");
          fb.hidden = false; next.hidden = false;
          var svg = q.querySelector("svg.ecg"); if (svg) svg.classList.add("show");
          upd(); try { next.focus({ preventScroll: true }); } catch (e) {}
        };
        return b;
      });
      next.onclick = function () { if (qi < qs.length - 1) show(qi + 1, true); else end(); };
    });

    function upd() {
      var done = marks.filter(function (m) { return m != null; }).length;
      bar.querySelector(".pos").textContent = "Question " + Math.min(cur + 1, qs.length) + " of " + qs.length;
      bar.querySelector(".sc").textContent = "Score " + score;
      bar.querySelector("i").style.width = (100 * done / qs.length) + "%";
    }
    function show(i, scroll) {
      qs.forEach(function (q, j) { q.classList.toggle("cur", j === i); });
      cur = i; upd();
      if (scroll) { var top = bar.getBoundingClientRect().top; if (top < 60 || top > window.innerHeight * 0.5) bar.scrollIntoView({ behavior: "smooth", block: "start" }); }
    }
    function end() {
      var n = qs.length, p = score / n, k = "qk-best-" + id, best = +get(k) || 0;
      if (score > best) put(k, score);
      var grid = marks.map(function (m) { return m ? "🟩" : "🟥"; }).join("");
      var url = location.origin + location.pathname + (sec.id && document.querySelectorAll(".qk").length > 1 ? "#" + sec.id : "");
      var share = "Malady Wise " + title + ": " + score + "/" + n + " " + emoji + "\n" + grid + "\n" + url;
      var box = h("div", "qk-end");
      box.innerHTML = '<p class="qk-big">' + score + "/" + n + '</p><p class="qk-line">' + line(p) + '</p><p class="qk-grid" aria-label="' + score + " right, " + (n - score) + ' wrong">' + grid + "</p>" +
        '<p class="qk-bst">' + (score > best && best ? "New best! Previous best " + best + "/" + n + "." : best ? "Your best: " + Math.max(best, score) + "/" + n + "." : "") + "</p>" +
        '<button type="button" class="qk-btn sh">Share score</button><button type="button" class="qk-btn ghost again">Try again</button><button type="button" class="qk-btn ghost rv">Review answers</button><p class="qk-copied" aria-live="polite"></p>';
      if (more) { var m = h("div", "qk-mr", "<b>" + (more.getAttribute("data-label") || "Try another quiz") + "</b>"); [].forEach.call(more.querySelectorAll("a"), function (a) { m.appendChild(a.cloneNode(true)); }); box.appendChild(m); }
      qs.forEach(function (q) { q.classList.remove("cur"); });
      bar.hidden = true;
      sec.querySelector(".qk-list").insertAdjacentElement("beforebegin", box);
      box.querySelector(".sh").onclick = function () {
        var msg = box.querySelector(".qk-copied");
        if (navigator.share) { navigator.share({ text: share }).catch(function () {}); return; }
        try { navigator.clipboard.writeText(share).then(function () { msg.textContent = "Copied. Paste it anywhere."; }, function () { msg.textContent = share; }); } catch (e) { msg.textContent = share; }
      };
      box.querySelector(".again").onclick = function () { location.hash = sec.id || ""; location.reload(); };
      box.querySelector(".rv").onclick = function () { sec.classList.add("rev"); this.hidden = true; };
      box.scrollIntoView({ behavior: "smooth", block: "start" });
      try { if (window.gtag) gtag("event", "quiz_complete", { quiz: id, score: score, of: n }); } catch (e) {}
    }
    show(0, false);
  }

  function hub() {
    [].forEach.call(document.querySelectorAll("[data-qk-best]"), function (el) {
      var b = get("qk-best-" + el.getAttribute("data-qk-best")), n = el.getAttribute("data-qk-n");
      if (b != null) el.textContent = "Your best: " + b + (n ? "/" + n : "");
    });
  }
  function normieNote() {
    try {
      if (!(window.MW_mode && MW_mode() === "normie")) return;
      var h1 = document.querySelector("main h1"); if (!h1) return;
      var n = h("p", "qk-note", "Heads up: this one’s a medical quiz, Normie mode or not. Fancy something lighter? <a href=\"/\">Today’s Normie games</a>.");
      h1.insertAdjacentElement("afterend", n);
    } catch (e) {}
  }
  function run() { [].forEach.call(document.querySelectorAll("section.qk"), init); hub(); normieNote(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
