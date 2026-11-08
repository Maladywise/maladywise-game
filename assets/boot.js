/* Start-up call for pages whose scripts load with `defer` (added by _scripts/headkit.py).
   <script defer src="/assets/boot.js" data-mw="page|hub|game" data-g="wordemic"></script>
   Deferred scripts run in page order, so this runs exactly where the old inline MW.page() / MW.game("x") was. */
(function (s) {
  var k = s && s.getAttribute("data-mw"), g = s && s.getAttribute("data-g");
  if (!window.MW || !MW[k]) return;
  if (k === "game") MW.game(g); else MW[k]();
})(document.currentScript);
