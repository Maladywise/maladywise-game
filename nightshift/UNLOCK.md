# Night Shift unlock

Paste into `assets/shell.js`, just before the last line (`window.MW = { ... };`), inside the IIFE.

Hooks:
- `.bar .logo` (top-bar "Malady Wise" link; also contains the seasonal icon `img.season`, so taps on that count too)
- `document` keydown for typing `locum`

Only runs on the home page (`/` or `/index.html`). On the home page the logo links to the same page, so the snippet cancels that reload; the link still works everywhere else.

```js
  // ---------- secret: Night Shift (5 taps on the logo in 3s, or type "locum" on the home page) ----------
  (function () {
    if (!/^\/(index\.html)?$/.test(location.pathname)) return;
    var taps = [], typed = "", going = false;
    function unlock() {
      if (going) return; going = true;
      var t = document.createElement("div");
      t.textContent = "🦇 Something stirs…";
      t.setAttribute("role", "status");
      t.style.cssText = "position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);z-index:90;background:#2E1F57;color:#fff;font:600 16px var(--body);padding:14px 22px;border-radius:999px;box-shadow:0 12px 34px rgba(0,0,0,.35)";
      document.body.appendChild(t);
      setTimeout(function () { location.href = "/nightshift/"; }, 900);
    }
    document.addEventListener("click", function (e) {
      if (!e.target.closest || !e.target.closest(".bar .logo")) return;
      e.preventDefault();
      var now = Date.now();
      taps = taps.filter(function (x) { return now - x < 3000; }); taps.push(now);
      if (taps.length >= 5) unlock();
    });
    document.addEventListener("keydown", function (e) {
      var tg = e.target && e.target.tagName;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tg) || (e.target && e.target.isContentEditable) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (!e.key || e.key.length !== 1) return;
      typed = (typed + e.key.toLowerCase()).slice(-5);
      if (typed === "locum") unlock();
    });
  })();
```

Notes:
- `nightshift/index.html` is `noindex` and must stay out of `sitemap.xml` and `MW_GAMES`.
- Plays are tracked as `nightshift/found`, `nightshift/play`, `nightshift/over`, `nightshift/win` via `window.MW_track` (falls back to `goatcounter.count`).
- High score: localStorage `mw-nightshift-best` (`{m: minutes after 11pm, c: coffees}`); sound pref `mw-nightshift-sound`.
