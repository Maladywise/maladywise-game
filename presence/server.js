// Malady Wise presence counter.
// - Players online: pages send an anonymous ping every ~30s with a random per-tab ID held in memory (no cookies, no storage).
//   We count IDs seen in the last 75s. Nothing is written to disk; IPs are only used briefly for rate limiting.
// - Games played today (Sydney time): pages send one "done" when a puzzle is finished. Daily totals live in Render Key Value.
const http = require("http");
const { createClient } = require("redis");

const PORT = process.env.PORT || 10000;
const ALLOWED = /^https?:\/\/(localhost(:\d+)?|127\.0\.0\.1(:\d+)?|([a-z0-9-]+\.)?maladywise\.com)$/i;
const WINDOW = 75 * 1000;

const seen = new Map();          // id -> { t, g }
const ipHits = new Map();        // ip -> { n, t }  (rate limit, in memory only)
let kv = null, memDay = "", memCount = 0, memGames = {};

if (process.env.REDIS_URL) {
  kv = createClient({ url: process.env.REDIS_URL });
  kv.on("error", (e) => console.error("kv", e.message));
  kv.connect().catch((e) => { console.error("kv connect", e.message); kv = null; });
}

function sydDay() { return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney" }).format(new Date()); }
function clean(s, n) { return String(s || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, n); }
function limited(ip, max) {
  const now = Date.now(), r = ipHits.get(ip) || { n: 0, t: now };
  if (now - r.t > 60 * 60 * 1000) { r.n = 0; r.t = now; }
  r.n++; ipHits.set(ip, r); return r.n > max;
}
setInterval(() => {
  const cut = Date.now() - WINDOW;
  for (const [k, v] of seen) if (v.t < cut) seen.delete(k);
  const hcut = Date.now() - 60 * 60 * 1000;
  for (const [k, v] of ipHits) if (v.t < hcut) ipHits.delete(k);
}, 15000).unref();

async function today() {
  const d = sydDay();
  if (kv && kv.isReady) {
    try { const v = await kv.get("played:" + d); return Number(v || 0); } catch (e) {}
  }
  return memDay === d ? memCount : 0;
}
async function addDone(g) {
  const d = sydDay();
  if (memDay !== d) { memDay = d; memCount = 0; memGames = {}; }
  memCount++; memGames[g] = (memGames[g] || 0) + 1;
  if (kv && kv.isReady) {
    try {
      await kv.incr("played:" + d); await kv.expire("played:" + d, 60 * 60 * 24 * 8);
      if (g) { await kv.hIncrBy("games:" + d, g, 1); await kv.expire("games:" + d, 60 * 60 * 24 * 8); }
    } catch (e) {}
  }
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || "";
  if (ALLOWED.test(origin)) { res.setHeader("Access-Control-Allow-Origin", origin); res.setHeader("Vary", "Origin"); }
  res.setHeader("Cache-Control", "no-store");
  const url = new URL(req.url, "http://x");
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  if (req.method === "OPTIONS") { res.setHeader("Access-Control-Allow-Methods", "GET, POST"); res.writeHead(204); return res.end(); }
  try {
    if (url.pathname === "/ping") {
      const id = clean(url.searchParams.get("id"), 24);
      if (id && !limited(ip, 400)) seen.set(id, { t: Date.now(), g: clean(url.searchParams.get("g"), 24) });
      res.writeHead(204); return res.end();
    }
    if (url.pathname === "/done" && req.method === "POST") {
      if (!limited(ip, 60)) await addDone(clean(url.searchParams.get("g"), 24));
      res.writeHead(204); return res.end();
    }
    if (url.pathname === "/stats") {
      const cut = Date.now() - WINDOW, by = {}; let n = 0;
      for (const v of seen.values()) if (v.t >= cut) { n++; if (v.g) by[v.g] = (by[v.g] || 0) + 1; }
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ online: n, games: by, today: await today(), day: sydDay() }));
    }
    if (url.pathname === "/" || url.pathname === "/health") { res.writeHead(200, { "Content-Type": "text/plain" }); return res.end("ok"); }
    res.writeHead(404); res.end();
  } catch (e) { res.writeHead(500); res.end(); }
});
server.listen(PORT, () => console.log("presence on " + PORT));
