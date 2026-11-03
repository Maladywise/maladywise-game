// Upcoming days: today plus the next 30 days of health-day themes from /data/health-days.json.
// Same rules as the home-page box (healthDay in assets/shell.js): Sydney date, no month-long events,
// region-only events only in that region, Normie mode shows only events with a "normie" field (and uses its overrides).
(function () {
  var AHEAD = 30;
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
  function nice(d, dow) { var x = new Date(dayNum(d) * 864e5); return (dow ? DOW[x.getUTCDay()] + " " : "") + x.getUTCDate() + " " + MON[x.getUTCMonth()]; }

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

  // Events for one date, lead first (same order as the home page).
  function eventsOn(all, day) {
    var yr = day.slice(0, 4);
    var on = all.filter(function (x) {
      var d = x.dates && x.dates[yr]; if (!d || x.kind === "month") return false;
      if (!inRegion(regionOf(x))) return false;
      if (NORMIE && !x.normie) return false;
      return d.end ? d.start <= day && day <= d.end : d.start === day;
    }).map(function (x) {
      var n = NORMIE && typeof x.normie === "object" ? x.normie : {}, y = {};
      for (var k in x) y[k] = x[k];
      ["name", "blurb", "link", "icon"].forEach(function (f) { if (n[f]) y[f] = n[f]; });
      return y;
    });
    if (!on.length) return null;
    var normal = on.filter(function (x) { return !sens(x); }).sort(function (a, b) {
      var fa = a.kind === "day" || a.dates[yr].start === day ? 0 : 1, fb = b.kind === "day" || b.dates[yr].start === day ? 0 : 1;
      return fa - fb || (a.priority || 9) - (b.priority || 9);
    });
    var lead = normal[0] || on.filter(sens)[0];
    return { lead: lead, also: normal.filter(function (x) { return x !== lead; }), yr: yr };
  }

  function card(day, r, idx) {
    var x = r.lead, quiet = sens(x), first = x.dates[r.yr].start === day;
    var themed = !NORMIE && !quiet && x.puzzle_theme && (x.kind === "day" || first) && regionOf(x) !== "au";
    var when = idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : nice(day, true);
    var s0 = x.dates[r.yr].start, s1 = x.dates[r.yr].end;
    var span = x.kind === "week" && s1 ? "Runs " + (s0.slice(5, 7) === s1.slice(5, 7) ? Number(s0.slice(8)) + "–" + nice(s1) : nice(s0) + " – " + nice(s1)) : "";
    var link = x.link ? '<a class="dd-go" href="' + esc(x.link) + '" target="_blank" rel="noopener">Learn more<span class="sr"> about ' + nm(x) + "</span></a>" : "";
    return '<li class="dd' + (idx === 0 ? " dd-today" : "") + (quiet ? " dd-quiet" : "") + '">' +
      '<div class="dd-top"><time class="dd-pill" datetime="' + day + '">' + esc(when) + "</time>" +
      (themed ? '<span class="dd-tag">🧩 Themed puzzles</span>' : "") + "</div>" +
      '<div class="dd-body">' +
      (x.icon && !quiet ? '<img class="dd-ic" src="/assets/days/' + esc(x.icon) + '.svg" alt="" width="56" height="56" loading="lazy" onerror="this.remove()">' : "") +
      '<div class="dd-tx"><h2>' + nm(x) + "</h2>" + (span ? '<p class="dd-span">' + esc(span) + "</p>" : "") +
      "<p>" + esc(x.blurb || "") + "</p>" +
      (r.also.length ? '<p class="dd-also">Also: ' + r.also.map(function (y) { return y.link ? '<a href="' + esc(y.link) + '" target="_blank" rel="noopener">' + nm(y) + "</a>" : nm(y); }).join(", ") + "</p>" : "") +
      link + "</div></div></li>";
  }

  function render(all) {
    var t = dayNum(sydToday()), html = "";
    for (var i = 0; i <= AHEAD; i++) {
      var day = dstr(t + i), r = eventsOn(all, day);
      if (r) html += card(day, r, i);
    }
    list.innerHTML = html || '<li class="dd dd-empty"><p>No themes found for the next few weeks. Check back soon.</p></li>';
    var note = document.getElementById("days-mode");
    if (note) note.textContent = NORMIE ? "Showing Normie mode themes: the light, everyday version of each day." : "Days marked “Themed puzzles” get puzzles built around the theme. Switch to Normie mode for everyday versions.";
  }

  fetch("/data/health-days.json", { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) { render((j && j.days) || []); })
    .catch(function () { list.innerHTML = '<li class="dd dd-empty"><p>Couldn’t load the calendar. Try refreshing.</p></li>'; });
})();
