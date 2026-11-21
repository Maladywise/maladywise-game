/* Shared helpers for the small time-gated and secret games (Triagic, Lunicorn, Fridaemia). */
(function () {
  function $(id) { return document.getElementById(id); }
  function rng(seed) { var h = 2166136261; for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); } return function () { h += 0x6D2B79F5; var t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(a, r) { a = a.slice(); r = r || Math.random; for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function toast(t, ms) { var el = $("mg-toast"); if (!el) { el = document.createElement("div"); el.id = "mg-toast"; el.className = "mg-toast"; el.setAttribute("role", "status"); document.body.appendChild(el); } el.textContent = t; el.hidden = false; clearTimeout(el._t); el._t = setTimeout(function () { el.hidden = true; }, ms || 2200); }
  function share(text) {
    if (navigator.share) { navigator.share({ text: text }).catch(function () {}); return; }
    try { navigator.clipboard.writeText(text).then(function () { toast("Copied. Paste it anywhere."); }, function () { toast("Couldn’t copy, sorry."); }); } catch (e) { toast("Couldn’t copy, sorry."); }
  }
  function flag(id) { set("mw-secret-" + id, 1); }
  function localDay(d) { d = d || new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function week(d) { d = d || new Date(); var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), dn = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dn); var y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return t.getUTCFullYear() + "-W" + Math.ceil(((t - y) / 864e5 + 1) / 7); }
  // (launched 21 Nov 2026: visiting these games no longer marks a browser as a tester)
  window.MG = { $: $, rng: rng, shuffle: shuffle, get: get, set: set, esc: esc, toast: toast, share: share, flag: flag, localDay: localDay, week: week };
})();
