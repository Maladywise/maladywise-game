/* My stats page: reads everything from localStorage via MW_myStats (assets/shell.js). No server. */
(function () {
  "use strict";
  var box = document.getElementById("me"); if (!box || !window.MW_myStats) return;
  var view = (window.MW_mode && MW_mode()) || "medical";
  function esc(x) { return String(x).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function today() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function dn(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function ds(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
  function nice(d, o) { return new Date(dn(d) * 864e5).toLocaleDateString("en-AU", Object.assign({ timeZone: "UTC" }, o)); }
  function dark() { return document.documentElement.getAttribute("data-theme") === "dark"; }

  function heat(days) {
    var t = today(), tn = dn(t), wd = (new Date(tn * 864e5).getUTCDay() + 6) % 7, start = tn - wd - 77, cells = "", months = "", on = 0, lastM = "";
    for (var c = 0; c < 12; c++) {
      var m = nice(ds(start + c * 7), { month: "short" });
      months += "<span>" + (m !== lastM ? m : "") + "</span>"; lastM = m;
      for (var r = 0; r < 7; r++) {
        var n = start + c * 7 + r, d = ds(n), k = days[d] || 0;
        if (n > tn) { cells += '<i class="hm-f" aria-hidden="true"></i>'; continue; }
        if (k) on++;
        var lv = !k ? 0 : k === 1 ? 1 : k <= 3 ? 2 : k <= 6 ? 3 : 4;
        var lab = nice(d, { weekday: "short", day: "numeric", month: "short" }) + ": " + (k ? k + " puzzle" + (k > 1 ? "s" : "") : "nothing");
        cells += '<i class="hm-' + lv + (d === t ? " hm-t" : "") + '" role="img" aria-label="' + lab + '" title="' + lab + '"></i>';
      }
    }
    return '<section class="me-card"><div class="me-h"><h2>Last 12 weeks</h2><span>' + on + " of " + (78 + wd) + " days played</span></div>" +
      '<div class="hm-wrap"><div class="hm-days" aria-hidden="true"><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span><span>Sun</span></div>' +
      '<div class="hm-main"><div class="hm-months" aria-hidden="true">' + months + '</div><div class="hm" role="group" aria-label="Days played, last 12 weeks">' + cells + "</div></div></div>" +
      '<div class="hm-key" aria-hidden="true">Less <i class="hm-0"></i><i class="hm-1"></i><i class="hm-2"></i><i class="hm-3"></i><i class="hm-4"></i> More</div></section>';
  }

  function render() {
    var st = MW_myStats(view), N = view === "normie";
    if (window.MW_markBadges) MW_markBadges(st);
    var got = st.badges.filter(function (b) { return b.got; }).length;
    var quip = st.solved === 0 ? "Clean chart. Suspiciously clean." : st.cur >= 7 ? "On a tear. Don’t stop now." : st.today ? "Clocked on today. Good." : st.cur ? "Play today to keep the streak alive." : "Streak flatlined. Resuscitate it today.";
    var h = '<div class="me-mode" role="group" aria-label="Which stats to show">' +
      [["medical", "🩺 Medical"], ["normie", "🙂 Normie"]].map(function (o) { return '<button type="button" data-v="' + o[0] + '" aria-pressed="' + (view === o[0]) + '">' + o[1] + "</button>"; }).join("") + "</div>";
    h += '<section class="me-top"><div><b>' + st.solved + "</b><span>Puzzles solved</span></div><div><b>🔥 " + st.cur + "</b><span>Current streak</span></div><div><b>" + st.best + "</b><span>Best streak</span></div><div><b>" + st.today + "</b><span>Played today</span></div></section>";
    h += '<p class="me-quip">' + quip + "</p>";
    h += heat(st.days);
    h += '<section class="me-card"><div class="me-h"><h2>By game</h2><span>' + (N ? "Normie mode" : "Medical mode") + '</span></div><div class="me-games">' +
      st.rows.map(function (r) {
        var g = r.g, acc = dark() ? g.accentDark : g.accent;
        return '<a class="me-g' + (r.played ? "" : " none") + '" href="/' + g.path + '" style="--ga:' + acc + '"><span class="me-ic">' + g.icon + '</span><span class="me-gm"><span class="me-gn">' + esc(g.name) + (r.today ? ' <em class="me-tick" title="Done today">✓ today</em>' : "") + (r.weekly ? ' <small>Weekly</small>' : "") + "</span>" +
          (r.played ? '<span class="me-gs"><span><b>' + r.played + "</b> played</span><span><b>" + r.pct + "%</b> wins</span><span><b>" + r.streak + "</b> streak</span><span><b>" + r.best + "</b> best</span></span>" : '<span class="me-gs none">Not played yet. Go on.</span>') + "</span></a>";
      }).join("") + "</div></section>";
    h += '<section class="me-card"><div class="me-h"><h2>Badges</h2><span>' + got + " of " + st.badges.length + ' earned</span></div><ul class="me-badges">' +
      st.badges.map(function (b) {
        return '<li class="me-b' + (b.got ? " got" : "") + '"><span class="me-bi" aria-hidden="true">' + b.icon + '</span><b>' + esc(b.name) + '</b><span class="me-bh">' + (b.got ? "✔ Earned. " : '<span class="sr">Locked. </span>🔒 ') + esc(b.how) + (b.global ? " <em>(both modes)</em>" : "") + "</span></li>";
      }).join("") + "</ul></section>";
    h += '<section class="me-card me-save"><p><b>Saved in this browser only.</b> Clear your browser, lose your glory. Moving phones? Export here, import there.</p>' +
      '<div class="me-btns"><button type="button" class="me-btn" id="me-exp">⬇ Export my stats</button><label class="me-btn ghost" for="me-imp">⬆ Import<input type="file" id="me-imp" accept="application/json,.json" class="sr"></label></div><p class="me-msg" id="me-msg" aria-live="polite"></p></section>';
    box.innerHTML = h;
    box.querySelector(".me-mode").onclick = function (e) { var b = e.target.closest("button"); if (!b || b.getAttribute("data-v") === view) return; view = b.getAttribute("data-v"); render(); };
    document.getElementById("me-exp").onclick = exportStats;
    document.getElementById("me-imp").onchange = importStats;
  }

  function exportStats() {
    var data = {};
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); data[k] = localStorage.getItem(k); } } catch (e) {}
    var blob = new Blob([JSON.stringify({ site: "maladywise.com", kind: "stats", v: 1, exported: new Date().toISOString(), data: data }, null, 1)], { type: "application/json" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "malady-wise-stats-" + today() + ".json";
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    msg("Exported. Guard it like a controlled drug.");
    if (window.MW_track) MW_track("me/export", "Stats exported");
  }
  function importStats(e) {
    var f = e.target.files && e.target.files[0]; if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      var j; try { j = JSON.parse(rd.result); } catch (x) { j = null; }
      if (!j || j.site !== "maladywise.com" || !j.data || typeof j.data !== "object") { msg("That file isn’t a Malady Wise export. Nice try."); return; }
      var ks = Object.keys(j.data).filter(function (k) { return typeof j.data[k] === "string"; });
      if (!confirm("Import " + ks.length + " saved items? Matching stats in this browser will be replaced.")) { msg("Import cancelled. Nothing changed."); return; }
      try { ks.forEach(function (k) { localStorage.setItem(k, j.data[k]); }); } catch (x) { msg("Couldn’t save. Browser storage may be full or blocked."); return; }
      if (window.MW_track) MW_track("me/import", "Stats imported");
      render(); msg("Imported. Welcome back, doctor.");
    };
    rd.readAsText(f); e.target.value = "";
  }
  function msg(t) { var m = document.getElementById("me-msg"); if (m) m.textContent = t; }
  render();
  window.MW_onTheme = render;
})();
