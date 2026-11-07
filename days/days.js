// World Health Days page (/days/): today + next 30 days, a month-grid calendar and a searchable full-year list,
// all from /data/health-days.json (dates are pre-computed per year in each entry's "dates"; no rule resolver needed).
// Same rules as the home-page box (healthDay in assets/shell.js): Sydney date, region-only events only in that region
// ("au" = Australian visitors only), Normie mode shows only events with a "normie" field (and uses its overrides).
// The static full-year list in index.html is written by _scripts/build_days.py (Medical, no regional days); this file re-renders it.
(function () {
  var AHEAD = 30, SHOW = 6, PUZZLES_FROM = "2026-10-17";
  var NORMIE = window.MW_mode && MW_mode() === "normie";
  var list = document.getElementById("days-list");
  if (!list) return;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function sydToday() {
    try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }
    catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  function dayNum(d) { var p = d.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function dstr(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function nice(d, dow) { var x = new Date(dayNum(d) * 864e5); return (dow ? DOW[x.getUTCDay()] + " " : "") + x.getUTCDate() + " " + MON[x.getUTCMonth()]; }
  var TODAY = sydToday();

  function inAU() { try { if (/^Australia\//.test(Intl.DateTimeFormat().resolvedOptions().timeZone || "")) return true; } catch (e) {} return /-AU$/i.test(navigator.language || ""); }
  function regionOf(x) {
    var t = x.tags || [], R = ["au", "uk", "us", "nz", "ca", "ie"];
    for (var i = 0; i < R.length; i++) if (t.indexOf(R[i]) >= 0) return R[i];
    var m = (x.name || "").match(/\(([^()]+)\)\s*$/); if (!m) return "";
    var k = m[1].trim();
    if (/^(Australia|NSW|VIC|Victoria|QLD|Queensland|SA|WA|TAS|Tasmania|NT|ACT)$/i.test(k)) return "au";
    if (/^(UK|United Kingdom|England|Scotland|Wales|Northern Ireland)$/i.test(k)) return "uk";
    if (/^(US|USA|United States)$/i.test(k)) return "us";
    if (/^(NZ|New Zealand|Aotearoa)$/i.test(k)) return "nz";
    if (/^Canada$/i.test(k)) return "ca";
    if (/^Ireland$/i.test(k)) return "ie";
    return "";
  }
  function inRegion(r) {
    if (!r) return true;
    if (r === "au") return inAU();
    var tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
    var TZ = { uk: /^Europe\/(London|Belfast|Guernsey|Isle_of_Man|Jersey)$/, ie: /^Europe\/Dublin$/, nz: /^Pacific\/(Auckland|Chatham)$/,
      us: /^(America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Juneau|Sitka|Nome|Yakutat|Metlakatla|Adak|Boise|Detroit|Menominee|Indiana\/.+|Kentucky\/.+|North_Dakota\/.+)|Pacific\/Honolulu)$/,
      ca: /^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Moncton|Glace_Bay|Goose_Bay|Whitehorse|Dawson|Dawson_Creek|Fort_Nelson|Iqaluit|Rankin_Inlet|Resolute|Cambridge_Bay|Inuvik|Swift_Current|Atikokan|Creston|Blanc-Sablon|Nipigon|Thunder_Bay|Rainy_River|Yellowknife|Pangnirtung)$/ };
    if (tz) return !!(TZ[r] && TZ[r].test(tz));
    return new RegExp("-" + { uk: "GB", ie: "IE", nz: "NZ", us: "US", ca: "CA" }[r] + "$", "i").test(navigator.language || "");
  }
  function sens(x) { return (x.tags || []).indexOf("sensitive") >= 0; }
  function nm(x) { return esc(regionOf(x) ? x.name.replace(/\s*\([^()]+\)\s*$/, "") : x.name); }
  function typeOf(x) { var t = x.tags || [], K = ["who", "zebra", "specialty", "country", "fun", "history"]; for (var i = 0; i < K.length; i++) if (t.indexOf(K[i]) >= 0) return K[i]; return "aware"; }
  var TYPE_LABEL = { who: "WHO", zebra: "Rare disease", specialty: "Specialty", country: "Country", fun: "Fun", history: "History", aware: "Awareness" };

  // Mode + region filter with Normie overrides; every event visible to this visitor.
  function visible(all) {
    return all.filter(function (x) { return inRegion(regionOf(x)) && (!NORMIE || x.normie); }).map(function (x) {
      var n = NORMIE && typeof x.normie === "object" ? x.normie : {}, y = {};
      for (var k in x) y[k] = x[k];
      ["name", "blurb", "link", "icon"].forEach(function (f) { if (n[f]) y[f] = n[f]; });
      return y;
    });
  }
  function themed(x, yr) {
    return !NORMIE && !sens(x) && x.puzzle_theme && (x.kind === "day" || x.kind === "week") && regionOf(x) !== "au" &&
      !/puzzle/i.test(x.blurb || "") && x.dates[yr].start >= PUZZLES_FROM;
  }
  function spanText(x, yr) {
    var s0 = x.dates[yr].start, s1 = x.dates[yr].end;
    if (x.kind === "month") { var a = Number(s0.slice(5, 7)), b = s1 ? Number(s1.slice(5, 7)) : a; return a !== b ? MONTHS[a - 1] + " – " + MONTHS[b - 1] : "All of " + MONTHS[a - 1]; }
    if (s1 && s1 !== s0) return s0.slice(5, 7) === s1.slice(5, 7) ? nice(s0, true) + "–" + nice(s1) : nice(s0, true) + " – " + nice(s1);
    return nice(s0, true);
  }

  // ---------- 1. Today and the next 30 days (cards) ----------
  function eventsOn(vis, day) {
    var yr = day.slice(0, 4);
    var on = vis.filter(function (x) {
      var d = x.dates && x.dates[yr]; if (!d || x.kind === "month") return false;
      return d.end ? d.start <= day && day <= d.end : d.start === day;
    });
    if (!on.length) return null;
    var normal = on.filter(function (x) { return !sens(x); }).sort(function (a, b) {
      var fa = a.kind === "day" || a.dates[yr].start === day ? 0 : 1, fb = b.kind === "day" || b.dates[yr].start === day ? 0 : 1;
      return fa - fb || (a.priority || 9) - (b.priority || 9);
    });
    var lead = normal[0] || on.filter(sens)[0];
    return { lead: lead, also: normal.filter(function (x) { return x !== lead; }), yr: yr };
  }
  function card(day, r, idx, hide) {
    var x = r.lead, quiet = sens(x), first = x.dates[r.yr].start === day;
    var th = !NORMIE && !quiet && x.puzzle_theme && (x.kind === "day" || first) && regionOf(x) !== "au";
    var when = idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : nice(day, true);
    var s0 = x.dates[r.yr].start, s1 = x.dates[r.yr].end;
    var span = x.kind === "week" && s1 ? "Runs " + (s0.slice(5, 7) === s1.slice(5, 7) ? Number(s0.slice(8)) + "–" + nice(s1) : nice(s0) + " – " + nice(s1)) : "";
    var link = x.link ? '<a class="dd-go" href="' + esc(x.link) + '" target="_blank" rel="noopener">Learn more<span class="sr"> about ' + nm(x) + "</span></a>" : "";
    return '<li class="dd' + (idx === 0 ? " dd-today" : "") + (quiet ? " dd-quiet" : "") + '"' + (hide ? " hidden" : "") + ">" +
      '<div class="dd-top"><time class="dd-pill" datetime="' + day + '">' + esc(when) + "</time>" +
      (th ? '<span class="dd-tag">🧩 Themed puzzles</span>' : "") + "</div>" +
      '<div class="dd-body">' +
      (x.icon && !quiet ? '<img class="dd-ic" src="/assets/days/' + esc(x.icon) + '.svg" alt="" width="56" height="56" loading="lazy" onerror="this.remove()">' : "") +
      '<div class="dd-tx"><h3>' + nm(x) + "</h3>" + (span ? '<p class="dd-span">' + esc(span) + "</p>" : "") +
      "<p>" + esc(x.blurb || "") + "</p>" +
      (r.also.length ? '<p class="dd-also">Also: ' + r.also.map(function (y) { return y.link ? '<a href="' + esc(y.link) + '" target="_blank" rel="noopener">' + nm(y) + "</a>" : nm(y); }).join(", ") + "</p>" : "") +
      link + "</div></div></li>";
  }
  function renderUpcoming(vis) {
    var t = dayNum(TODAY), html = "", n = 0;
    for (var i = 0; i <= AHEAD; i++) {
      var day = dstr(t + i), r = eventsOn(vis, day);
      if (r) { html += card(day, r, i, n >= SHOW); n++; }
    }
    list.innerHTML = html || '<li class="dd dd-empty"><p>No themes found for the next few weeks. Check back soon.</p></li>';
    var more = document.getElementById("days-more");
    if (more && n > SHOW) {
      more.hidden = false;
      more.onclick = function () { [].forEach.call(list.querySelectorAll("li[hidden]"), function (li) { li.hidden = false; }); more.hidden = true; };
    }
    var note = document.getElementById("days-mode");
    if (note) note.textContent = NORMIE ? "Showing Normie mode themes: the light, everyday version of each day." : "Days marked “Themed puzzles” get puzzles built around the theme. Switch to Normie mode for everyday versions.";
  }

  // ---------- shared list item (same markup as _scripts/build_days.py) ----------
  function item(x, yr, id) {
    var d = x.dates[yr], ty = typeOf(x), quiet = sens(x);
    var badge = x.kind === "day" ? TYPE_LABEL[ty] : x.kind === "week" ? "Week" : "Month";
    var keys = (x.tags || []).concat([x.kind, ty], x.kind !== "day" ? ["span"] : []).join(" ");
    return '<li class="dl-i t-' + ty + (quiet ? " quiet" : "") + '"' + (id ? ' id="day-' + esc(x.id) + '"' : "") + ' data-s="' + d.start + '" data-e="' + (d.end || d.start) + '" data-k="' + esc(keys) + '">' +
      '<time datetime="' + d.start + '">' + esc(spanText(x, yr)) + '</time><div class="dl-tx"><h4>' + nm(x) +
      (themed(x, yr) ? ' <span class="dl-pz" title="Themed puzzles">🧩</span>' : "") + "</h4>" +
      '<p class="dl-m"><span class="dl-b">' + esc(badge) + "</span></p><p>" + esc(x.blurb || "") + "</p>" +
      (x.link ? '<a href="' + esc(x.link) + '" target="_blank" rel="noopener">Learn more<span class="sr"> about ' + nm(x) + "</span></a>" : "") + "</div></li>";
  }
  var KORD = { month: 0, week: 1, day: 2 };
  function byDate(yr) { return function (a, b) { var p = a.dates[yr].start, q = b.dates[yr].start; return p < q ? -1 : p > q ? 1 : (KORD[a.kind] - KORD[b.kind]) || ((a.priority || 9) - (b.priority || 9)) || (a.name < b.name ? -1 : 1); }; }

  var VIS = [], YEARS = [], CACHE = {};
  function ofYear(yr) { if (!CACHE[yr]) CACHE[yr] = VIS.filter(function (x) { return x.dates && x.dates[yr]; }).sort(byDate(yr)); return CACHE[yr]; }

  // ---------- 2. Calendar ----------
  var grids = document.getElementById("cal-grids"), panel = document.getElementById("cal-day"), sel = TODAY, g0 = 0;
  var monthSel = document.getElementById("cal-month");
  function cols() { return window.matchMedia("(min-width:980px)").matches ? 3 : window.matchMedia("(min-width:640px)").matches ? 2 : 1; }
  function gIndex(y, m) { return (Number(y) - Number(YEARS[0])) * 12 + m; }
  function clampG(g) { return Math.max(0, Math.min(g, YEARS.length * 12 - cols())); }
  function onDay(yr, day) {
    return ofYear(yr).filter(function (x) { var d = x.dates[yr]; return d.start <= day && day <= (d.end || d.start); })
      .sort(function (a, b) { return (KORD[b.kind] - KORD[a.kind]) || ((a.priority || 9) - (b.priority || 9)); });
  }
  function monthHTML(g) {
    var yr = String(Number(YEARS[0]) + Math.floor(g / 12)), m = g % 12, mm = ("0" + (m + 1)).slice(-2);
    var first = yr + "-" + mm + "-01", n0 = dayNum(first), len = new Date(Date.UTC(Number(yr), m + 1, 0)).getUTCDate(), last = yr + "-" + mm + "-" + len;
    var evs = ofYear(yr), months = evs.filter(function (x) { var d = x.dates[yr]; return x.kind === "month" && d.start <= last && (d.end || d.start) >= first; });
    var LIM = 4;
    var strip = months.map(function (x, i) { return '<button type="button" class="t-' + typeOf(x) + '" data-ev="' + esc(x.id) + '" data-y="' + yr + '"' + (i >= LIM ? " hidden" : "") + ">" + nm(x) + "</button>"; }).join("") +
      (months.length > LIM ? '<button type="button" class="more" data-more="1">+' + (months.length - LIM) + " more</button>" : "");
    var lead = (new Date(n0 * 864e5).getUTCDay() + 6) % 7, h = "";
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach(function (w) { h += '<span class="cal-dow" aria-hidden="true">' + w.slice(0, 2) + "</span>"; });
    for (var p = 0; p < lead; p++) h += '<span class="cal-c pad" aria-hidden="true"></span>';
    for (var i = 0; i < len; i++) {
      var day = dstr(n0 + i), on = onDay(yr, day), dots = "", wk = null, nd = 0, dow = (lead + i) % 7;
      on.forEach(function (x) {
        if (x.kind === "day") { if (nd < 4) dots += '<i class="t-' + (sens(x) ? "aware" : typeOf(x)) + '"></i>'; nd++; }
        else if (x.kind === "week") wk = wk || x;
      });
      var cls = "cal-c" + (day === TODAY ? " is-today" : "");
      if (wk) { var wd = wk.dates[yr]; cls += " wk" + (day === wd.start || dow === 0 ? " ws" : "") + (day === (wd.end || wd.start) || dow === 6 ? " we" : ""); }
      var cnt = on.filter(function (x) { return x.kind !== "month"; }).length;
      h += '<button type="button" class="' + cls + '" data-d="' + day + '" aria-pressed="' + (day === sel) + '" aria-label="' + DAYS[new Date((n0 + i) * 864e5).getUTCDay()] + " " + (i + 1) + " " + MONTHS[m] + (cnt ? ": " + cnt + " health " + (cnt === 1 ? "day" : "days") : "") + (day === TODAY ? " (today)" : "") + '">' +
        '<span aria-hidden="true">' + (i + 1) + '</span><span class="cal-dots" aria-hidden="true">' + dots + "</span></button>";
    }
    return '<div class="cal-mo"><h3>' + MONTHS[m] + " " + yr + "</h3>" + (strip ? '<div class="cal-strip">' + strip + "</div>" : "") + '<div class="cal-g">' + h + "</div></div>";
  }
  function setYearUI(yr) { [].forEach.call(document.querySelectorAll(".cal-yr button"), function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-y") === yr); }); }
  function renderCal() {
    var n = cols(); g0 = clampG(g0);
    var h = ""; for (var i = 0; i < n; i++) h += monthHTML(g0 + i);
    grids.style.setProperty("--n", n); grids.innerHTML = h;
    var yr = String(Number(YEARS[0]) + Math.floor(g0 / 12));
    monthSel.value = String(g0 % 12); setYearUI(yr);
    document.getElementById("cal-prev").disabled = g0 <= 0;
    document.getElementById("cal-next").disabled = g0 >= YEARS.length * 12 - n;
    if (yr !== listYr) renderList(yr);
  }
  function showDay(day) {
    sel = day; var yr = day.slice(0, 4), on = onDay(yr, day);
    [].forEach.call(grids.querySelectorAll(".cal-c[data-d]"), function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-d") === day); });
    var x = new Date(dayNum(day) * 864e5);
    panel.innerHTML = "<h3>" + (day === TODAY ? "Today, " : "") + DAYS[x.getUTCDay()] + " " + x.getUTCDate() + " " + MONTHS[x.getUTCMonth()] + " " + yr + "</h3>" +
      (on.length ? '<ul class="cal-ev">' + on.map(function (e) { return item(e, yr, false); }).join("") + "</ul>" : '<p class="meta">No health days on this date' + (NORMIE ? " in Normie mode" : "") + ".</p>");
  }
  function showEvent(id, yr) {
    var x = ofYear(yr).filter(function (e) { return e.id === id; })[0]; if (!x) return;
    panel.innerHTML = "<h3>" + esc(spanText(x, yr)) + " " + yr + '</h3><ul class="cal-ev">' + item(x, yr, false) + "</ul>";
  }
  function initCal() {
    var nav = document.querySelector(".cal-nav"); nav.hidden = false;
    var cy = TODAY.slice(0, 4); g0 = gIndex(cy, Number(TODAY.slice(5, 7)) - 1);
    document.getElementById("cal-prev").onclick = function () { g0 = clampG(g0 - 1); renderCal(); };
    document.getElementById("cal-next").onclick = function () { g0 = clampG(g0 + 1); renderCal(); };
    monthSel.onchange = function () { var yr = String(Number(YEARS[0]) + Math.floor(g0 / 12)); g0 = clampG(gIndex(yr, Number(monthSel.value))); renderCal(); };
    document.getElementById("cal-today").onclick = function () { g0 = clampG(gIndex(cy, Number(TODAY.slice(5, 7)) - 1)); renderCal(); showDay(TODAY); };
    [].forEach.call(document.querySelectorAll(".cal-yr button"), function (b) {
      var y = b.getAttribute("data-y"); if (YEARS.indexOf(y) < 0) { b.hidden = true; return; }
      b.onclick = function () { g0 = clampG(gIndex(y, y === cy ? Number(TODAY.slice(5, 7)) - 1 : 0)); renderList(y); renderCal(); };
    });
    grids.addEventListener("click", function (e) {
      var c = e.target.closest(".cal-c[data-d]"); if (c) { showDay(c.getAttribute("data-d")); return; }
      var s = e.target.closest(".cal-strip button"); if (!s) return;
      if (s.getAttribute("data-more")) { [].forEach.call(s.parentNode.querySelectorAll("[hidden]"), function (b) { b.hidden = false; }); s.remove(); return; }
      showEvent(s.getAttribute("data-ev"), s.getAttribute("data-y"));
    });
    var last = cols(); window.addEventListener("resize", function () { var n = cols(); if (n !== last) { last = n; renderCal(); } });
    renderCal(); showDay(TODAY);
  }

  // ---------- 3. Full-year list: search + filters ----------
  var listEl = document.getElementById("dl-list"), q = document.getElementById("dl-q"), listYr = null, F = "", IDX = [];
  function norm(t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[‘’']/g, ""); }
  function renderList(yr) {
    listYr = yr; document.getElementById("all-yr").textContent = yr;
    var evs = ofYear(yr), h = "";
    for (var m = 0; m < 12; m++) {
      var mm = ("0" + (m + 1)).slice(-2), its = evs.filter(function (x) { return x.dates[yr].start.slice(5, 7) === mm; });
      if (its.length) h += '<section class="dl-mo" id="m-' + yr + "-" + mm + '"><h3>' + MONTHS[m] + " " + yr + '</h3><ol class="dl">' + its.map(function (x) { return item(x, yr, true); }).join("") + "</ol></section>";
    }
    listEl.innerHTML = h;
    IDX = [].map.call(listEl.querySelectorAll(".dl-i"), function (li) {
      var x = evs.filter(function (e) { return "day-" + e.id === li.id; })[0] || {};
      return { li: li, t: norm(li.textContent + " " + (x.tags || []).join(" ") + " " + (TYPE_LABEL[typeOf(x)] || "") + (typeOf(x) === "zebra" ? " rare" : "") + " " + (x.puzzle_theme || "")), k: " " + li.getAttribute("data-k") + " " };
    });
    document.getElementById("dl-jump").hidden = yr !== TODAY.slice(0, 4);
    filter();
  }
  function filter() {
    var w = norm(q.value).split(/\s+/).filter(Boolean), n = 0;
    IDX.forEach(function (o) {
      var ok = (!F || o.k.indexOf(" " + F + " ") >= 0) && w.every(function (t) { return o.t.indexOf(t) >= 0; });
      o.li.hidden = !ok; if (ok) n++;
    });
    [].forEach.call(listEl.querySelectorAll(".dl-mo"), function (s) { s.hidden = !s.querySelector(".dl-i:not([hidden])"); });
    document.getElementById("dl-none").hidden = n > 0;
    document.getElementById("dl-count").textContent = n === IDX.length ? n + " days, weeks and months" : "Showing " + n + " of " + IDX.length;
  }
  function initList() {
    document.querySelector(".dl-tools").hidden = false;
    q.addEventListener("input", filter);
    var chips = document.querySelector(".dl-chips");
    chips.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      F = b.getAttribute("data-f");
      [].forEach.call(chips.children, function (c) { c.setAttribute("aria-pressed", c === b); });
      filter();
    });
    document.getElementById("dl-jump").onclick = function () {
      if (q.value || F) { q.value = ""; F = ""; [].forEach.call(chips.children, function (c, i) { c.setAttribute("aria-pressed", i === 0); }); filter(); }
      var li = IDX.map(function (o) { return o.li; }).filter(function (li) { return li.getAttribute("data-e") >= TODAY && li.getAttribute("data-k").indexOf("month") < 0; })[0];
      if (!li) return;
      [].forEach.call(listEl.querySelectorAll(".is-now"), function (x) { x.classList.remove("is-now"); });
      li.classList.add("is-now"); li.scrollIntoView({ block: "start", behavior: "smooth" });
    };
    renderList(TODAY.slice(0, 4));
  }

  fetch("/data/health-days.json", { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      var all = (j && j.days) || [];
      VIS = visible(all);
      var cy = Number(TODAY.slice(0, 4));
      YEARS = [String(cy), String(cy + 1)].filter(function (y) { return all.some(function (x) { return x.dates && x.dates[y]; }); });
      renderUpcoming(VIS);
      if (!YEARS.length) return;
      initList(); initCal();
    })
    .catch(function (e) { list.innerHTML = '<li class="dd dd-empty"><p>Couldn’t load the calendar. Try refreshing.</p></li>'; if (window.console) console.error(e); });
})();
