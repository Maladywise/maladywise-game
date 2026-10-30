// Malady Wise presence counter.
// - Players online: pages send an anonymous ping every ~30s with a random per-tab ID held in memory (no cookies, no storage).
//   We count IDs seen in the last 75s. Nothing is written to disk; IPs are only used briefly for rate limiting.
// - Basil + Clover leaderboards: all-time and today's daily challenge. Stores a chosen name, score, round and a random
//   per-browser game ID (so a player's best replaces their old score). Top 200 kept per board.
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

// ---------- Basil + Clover leaderboards ----------
const BAD = /(fuck|fuk|shit|cunt|nigg|fag|bitch|whore|slut|rape|nazi|hitler|dick|cock|puss|wank|twat|retard|kike|spic|chink|paki|porn|penis|vagina|anal|cum|tits|boob|sex)/i;
const memLB = {};
function lbName(s) { let n = String(s || "").replace(/[^A-Za-z0-9 '\-\.]/g, "").replace(/\s+/g, " ").trim().slice(0, 14); if (!n || BAD.test(n.replace(/[^a-z]/gi, ""))) n = "Anonymous cat"; return n; }
function lbKey(b) { return b === "daily" ? "lb:daily:" + sydDay() : "lb:all"; }
async function lbTop(b, me) {
  const key = lbKey(b);
  if (kv && kv.isReady) {
    try {
      const rows = await kv.zRangeWithScores(key, 0, 9, { REV: true });
      if (!rows.length) return [];
      const meta = await kv.hmGet(key + ":m", rows.map((r) => r.value));
      return rows.map((r, i) => { let m = {}; try { m = JSON.parse(meta[i] || "{}"); } catch (e) {} return { n: m.n || "Anonymous cat", s: r.score, r: m.r || 1, me: !!me && r.value === me }; });
    } catch (e) { console.error("lbTop", e.message); }
  }
  const m = memLB[key] || {};
  return Object.entries(m).sort((a, b2) => b2[1].s - a[1].s).slice(0, 10).map(([id, v]) => ({ n: v.n, s: v.s, r: v.r, me: id === me }));
}
async function lbAdd(b, id, n, s, r) {
  const key = lbKey(b), ttl = b === "daily" ? 60 * 60 * 24 * 3 : 0;
  if (kv && kv.isReady) {
    try {
      const cur = await kv.zScore(key, id);
      if (cur == null || s > cur) { await kv.zAdd(key, { score: s, value: id }); await kv.hSet(key + ":m", id, JSON.stringify({ n, r })); }
      else { const old = await kv.hGet(key + ":m", id); let m = {}; try { m = JSON.parse(old || "{}"); } catch (e) {} m.n = n; await kv.hSet(key + ":m", id, JSON.stringify(m)); }
      const extra = await kv.zRange(key, 0, -201);
      if (extra.length) { await kv.zRem(key, extra); await kv.hDel(key + ":m", extra); }
      if (ttl) { await kv.expire(key, ttl); await kv.expire(key + ":m", ttl); }
      return;
    } catch (e) { console.error("lbAdd", e.message); }
  }
  const m = memLB[key] = memLB[key] || {};
  if (!m[id] || s > m[id].s) m[id] = { n, s, r }; else m[id].n = n;
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
    if (url.pathname === "/top") {
      const b = url.searchParams.get("b") === "daily" ? "daily" : "all";
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ rows: await lbTop(b, clean(url.searchParams.get("id"), 16)), day: sydDay() }));
    }
    if (url.pathname === "/score" && req.method === "POST") {
      const q = url.searchParams, b = q.get("b") === "daily" ? "daily" : "all", id = clean(q.get("id"), 16);
      const s = Math.floor(Number(q.get("s"))), r = Math.floor(Number(q.get("r")));
      const ok = id.length >= 6 && s > 0 && r >= 1 && r <= 500 && s <= 6000 * r * r && s <= 50000000;
      if (ok && !limited("lb" + ip, 40)) await lbAdd(b, id, lbName(q.get("n")), s, r);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ ok, rows: await lbTop(b, id), day: sydDay() }));
    }
    if (url.pathname === "/" || url.pathname === "/health") { res.writeHead(200, { "Content-Type": "text/plain" }); return res.end("ok"); }
    res.writeHead(404); res.end();
  } catch (e) { res.writeHead(500); res.end(); }
});
server.listen(PORT, () => console.log("presence on " + PORT));
