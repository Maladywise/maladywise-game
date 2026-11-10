// Malady Wise presence counter.
// - Players online: pages send an anonymous ping every ~30s with a random per-tab ID held in memory (no cookies, no storage).
//   We count IDs seen in the last 75s. Nothing is written to disk; IPs are only used briefly for rate limiting.
// - Basil + Clover and Organ Drop leaderboards: all-time and today's daily challenge. Stores a chosen name, score, round and a random
//   per-browser game ID (so a player's best replaces their old score). Top 200 kept per board.
// - Sudokrine daily (sdaily): today's fastest solve times in whole seconds. Lower is better (an ascending board).
// - Feedback: visitors report puzzle errors, image licence problems and bugs (POST /fb); owner reads them with the admin key.
// - Specialists tags: visitors suggest tags from a fixed list; shown only after 3 visitors agree and the owner approves.
// - Games played today (Sydney time): pages send one "done" when a puzzle is finished. Daily totals live in Render Key Value.
const http = require("http");
const crypto = require("crypto");
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
async function solvedToday() {
  const d = sydDay();
  if (kv && kv.isReady) {
    try { const h = await kv.hGetAll("games:" + d); const o = {}; for (const k in h) o[k] = Number(h[k] || 0); return o; } catch (e) {}
  }
  return memDay === d ? Object.assign({}, memGames) : {};
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
function lbAnon(b) { return b && b.charAt(0) === "o" ? "Anonymous surgeon" : b && b.charAt(0) === "s" ? "Anonymous owl" : b && b.charAt(0) === "m" ? "Anonymous medic" : "Anonymous cat"; }
function lbName(s, b) { let n = String(s || "").replace(/[^A-Za-z0-9 '\-\.]/g, "").replace(/\s+/g, " ").trim().slice(0, 14); if (!n || BAD.test(n.replace(/[^a-z]/gi, ""))) n = lbAnon(b); return n; }
// boards: all, daily (Kitchen), vall, vdaily (Stage 2: the Vet), oall, odaily (Organ Drop: endless and the daily challenge),
// sdaily (Sudokrine: today's fastest times; s = seconds, r = 1 Medical or 2 Normie),
// mdaily, mall (Mergeon: today's daily run and best daily run of all time; r = top piece level 0-10)
const BOARDS = ["all", "daily", "vall", "vdaily", "fall", "fdaily", "oall", "odaily", "sdaily", "mdaily", "mall", "ndaily", "nall"];
const DAILY_BOARDS = ["daily", "vdaily", "fdaily", "odaily", "sdaily", "mdaily", "ndaily"];
const ASC_BOARDS = ["sdaily"]; // lower score is better
function lbAsc(b) { return ASC_BOARDS.indexOf(b) >= 0; }
function lbBoard(x) { return BOARDS.indexOf(x) >= 0 ? x : "all"; }
function lbKey(b) { return DAILY_BOARDS.indexOf(b) >= 0 ? "lb:" + b + ":" + sydDay() : b === "vall" ? "lb:vall" : b === "fall" ? "lb:fall" : b === "oall" ? "lb:oall" : b === "mall" ? "lb:mall" : b === "nall" ? "lb:nall" : "lb:all"; }
// score sanity caps. Basil + Clover: r = round. Organ Drop: r = level (a level is 10 lines; a four-line clear is 800 x level, plus drop points)
// Hard per-board ceilings on top of the shape checks below (score s, round/level r). The live boards couldn't be read
// when these were set, so they come from each game's scoring rules with generous headroom; rejected posts are logged
// ("score rejected") so they can be tuned from real play. Override without a code change: SCORE_MAX='{"oall":[3000000,200]}'.
const SCORE_MAX = Object.assign({
  all: [10000000, 500], daily: [5000000, 500], vall: [10000000, 500], vdaily: [5000000, 500], fall: [10000000, 500], fdaily: [5000000, 500], // Basil + Clover
  oall: [10000000, 300], odaily: [5000000, 300],                                              // Stackulus
  mdaily: [2000000, 10], mall: [2000000, 10], ndaily: [2000000, 10], nall: [2000000, 10],     // Mergeon (n = Normie)
  sdaily: [7200, 2],                                                                            // Sudokrine (seconds)
}, (() => { try { return JSON.parse(process.env.SCORE_MAX || "{}"); } catch (e) { console.error("SCORE_MAX is not valid JSON; ignoring it"); return {}; } })());
const scoreHits = new Map();     // per-IP-hash timestamps of recent /score posts (memory only)
const SCORE_PER_MIN = 10;
const RATE_SALT = crypto.randomBytes(16).toString("hex"); // per-process; rate limiting works even without TAG_SALT
function scoreRateOk(ip) {
  const h = crypto.createHash("sha256").update(RATE_SALT + ip).digest("hex").slice(0, 16), now = Date.now();
  const L = (scoreHits.get(h) || []).filter((t) => now - t < 60000);
  if (L.length >= SCORE_PER_MIN) { scoreHits.set(h, L); return false; }
  L.push(now); scoreHits.set(h, L); return true;
}
setInterval(() => { const now = Date.now(); for (const [k, L] of scoreHits) if (!L.some((t) => now - t < 60000)) scoreHits.delete(k); }, 60000).unref();
function lbPlausible(b, s, r) { const m = SCORE_MAX[b]; return !m || (s <= m[0] && r <= m[1]); }
function lbValid(b, s, r, raw) {
  if (!Number.isFinite(s) || !Number.isFinite(r) || !lbPlausible(b, s, r)) return false;
  if (b === "sdaily") return /^\d{1,5}$/.test(String(raw || "")) && s >= 20 && s <= 7200 && (r === 1 || r === 2); // 20 s to 2 h, whole seconds
  if (b === "mdaily" || b === "mall" || b === "ndaily" || b === "nall") return /^\d{1,7}$/.test(String(raw || "")) && s > 0 && s <= 2000000 && r >= 0 && r <= 10; // Mergeon: r = top piece level
  if (b.charAt(0) === "o") return s > 0 && r >= 1 && r <= 999 && s <= 4000 * r * r && s <= 50000000;
  return s > 0 && r >= 1 && r <= 500 && s <= 6000 * r * r && s <= 50000000;
}
async function lbTop(b, me) {
  const key = lbKey(b);
  if (kv && kv.isReady) {
    try {
      const rows = lbAsc(b) ? await kv.zRangeWithScores(key, 0, 9) : await kv.zRangeWithScores(key, 0, 9, { REV: true });
      if (!rows.length) return [];
      const meta = await kv.hmGet(key + ":m", rows.map((r) => r.value));
      return rows.map((r, i) => { let m = {}; try { m = JSON.parse(meta[i] || "{}"); } catch (e) {} return { n: m.n || lbAnon(b), s: r.score, r: m.r != null ? m.r : 1, me: !!me && r.value === me }; });
    } catch (e) { console.error("lbTop", e.message); }
  }
  const m = memLB[key] || {};
  return Object.entries(m).sort((a, b2) => lbAsc(b) ? a[1].s - b2[1].s : b2[1].s - a[1].s).slice(0, 10).map(([id, v]) => ({ n: v.n, s: v.s, r: v.r, me: id === me }));
}
async function lbAdd(b, id, n, s, r) {
  const key = lbKey(b), ttl = DAILY_BOARDS.indexOf(b) >= 0 ? 60 * 60 * 24 * 3 : 0, asc = lbAsc(b);
  const better = (cur) => cur == null || (asc ? s < cur : s > cur);
  if (kv && kv.isReady) {
    try {
      const cur = await kv.zScore(key, id);
      if (better(cur)) { await kv.zAdd(key, { score: s, value: id }); await kv.hSet(key + ":m", id, JSON.stringify({ n, r })); }
      else { const old = await kv.hGet(key + ":m", id); let m = {}; try { m = JSON.parse(old || "{}"); } catch (e) {} m.n = n; await kv.hSet(key + ":m", id, JSON.stringify(m)); }
      const extra = asc ? await kv.zRange(key, 200, -1) : await kv.zRange(key, 0, -201); // drop the worst beyond the top 200
      if (extra.length) { await kv.zRem(key, extra); await kv.hDel(key + ":m", extra); }
      if (ttl) { await kv.expire(key, ttl); await kv.expire(key + ":m", ttl); }
      return;
    } catch (e) { console.error("lbAdd", e.message); }
  }
  const m = memLB[key] = memLB[key] || {};
  if (better(m[id] ? m[id].s : null)) m[id] = { n, s, r }; else m[id].n = n;
  const ids = Object.keys(m);
  if (asc && ids.length > 200) ids.sort((a, b2) => asc ? m[a].s - m[b2].s : m[b2].s - m[a].s).slice(200).forEach((x) => { delete m[x]; });
}

// ---------- Specialists: visitor-suggested practical tags (fixed list, no free text, moderated) ----------
// A tag needs 3 different visitors (by hashed IP) and owner approval before it shows. IPs are never stored, only a salted hash.
const TAGS = ["wc", "park", "pram", "interp", "fees", "ah"];
const ADMIN = process.env.TAG_ADMIN_KEY || "";
const SALT = process.env.TAG_SALT || "";
if (SALT.length < 8) console.error("ERROR: TAG_SALT is not set (or under 8 characters). Specialists tag votes are switched off until it is set in Render.");
let tagCache = null, tagCacheT = 0;
const memTag = { v: {}, pend: new Set(), ok: {}, no: new Set(), names: {} };
function ipHash(ip) { // null when there's no salt: never hash IPs with a salt that lives in the code
  if (SALT.length < 8) { console.error("ERROR: refusing to hash a visitor IP: TAG_SALT is not set"); return null; }
  return crypto.createHash("sha256").update(SALT + ip).digest("hex").slice(0, 16);
}
function adminKey(req, q) { return req.headers["x-admin-key"] || q.get("k"); } // header preferred; ?k= still works for old tools
function pidOk(p) { return /^[a-z0-9]{3,60}$/.test(p); }
function isAdmin(k) { const a = Buffer.from(String(k || "")), b = Buffer.from(ADMIN); return ADMIN.length >= 16 && a.length === b.length && crypto.timingSafeEqual(a, b); }
function tagName(s) { return String(s || "").replace(/[^A-Za-z0-9 '&(),.\-–]/g, "").replace(/\s+/g, " ").trim().slice(0, 80); }
async function tagAdd(p, t, h, n) {
  const k = p + "|" + t;
  if (kv && kv.isReady) {
    if (await kv.sIsMember("tg:no", k)) return;
    const ok = (await kv.hGet("tg:ok", p) || "").split(",");
    if (ok.indexOf(t) >= 0) return;
    await kv.sAdd("tg:v:" + k, h); await kv.expire("tg:v:" + k, 180 * 86400);
    if (n) await kv.hSet("tg:names", p, n);
    if (await kv.sCard("tg:v:" + k) >= 3) await kv.sAdd("tg:pend", k);
    return;
  }
  if (memTag.no.has(k)) return;
  (memTag.v[k] = memTag.v[k] || new Set()).add(h); if (n) memTag.names[p] = n;
  if (memTag.v[k].size >= 3 && !(memTag.ok[p] || []).includes(t)) memTag.pend.add(k);
}
async function tagOk() {
  if (tagCache && Date.now() - tagCacheT < 60000) return tagCache;
  const out = {};
  if (kv && kv.isReady) { const h = await kv.hGetAll("tg:ok"); for (const p in h) { const l = h[p].split(",").filter(Boolean); if (l.length) out[p] = l; } }
  else for (const p in memTag.ok) if (memTag.ok[p].length) out[p] = memTag.ok[p];
  tagCache = out; tagCacheT = Date.now(); return out;
}
async function tagQueue() {
  const rows = [];
  if (kv && kv.isReady) {
    for (const k of await kv.sMembers("tg:pend")) { const [p, t] = k.split("|"); rows.push({ p, t, n: await kv.hGet("tg:names", p) || p, c: await kv.sCard("tg:v:" + k) }); }
  } else for (const k of memTag.pend) { const [p, t] = k.split("|"); rows.push({ p, t, n: memTag.names[p] || p, c: memTag.v[k].size }); }
  const approved = await tagOk(), names = {};
  for (const p in approved) names[p] = (kv && kv.isReady ? await kv.hGet("tg:names", p) : memTag.names[p]) || p;
  return { pending: rows, approved, names };
}
async function tagSet(p, t, v) {
  const k = p + "|" + t; tagCache = null;
  if (kv && kv.isReady) {
    await kv.sRem("tg:pend", k);
    const cur = (await kv.hGet("tg:ok", p) || "").split(",").filter(Boolean).filter((x) => x !== t);
    if (v === "1") cur.push(t);
    if (v === "0") await kv.sAdd("tg:no", k);
    if (v === "2") await kv.del("tg:v:" + k);
    if (cur.length) await kv.hSet("tg:ok", p, cur.join(",")); else await kv.hDel("tg:ok", p);
    return;
  }
  memTag.pend.delete(k); const cur = (memTag.ok[p] || []).filter((x) => x !== t);
  if (v === "1") cur.push(t); if (v === "0") memTag.no.add(k); if (v === "2") delete memTag.v[k];
  memTag.ok[p] = cur;
}

// ---------- Feedback / error reports (puzzle errors, image licence issues, bugs) ----------
// Stored in Redis list fb:list (newest first, max 500). No IPs stored. Owner reads them on /tag-review/.
const FB_CATS = ["puzzle", "fact", "image", "bug", "idea", "other"];
const memFb = [];
function fbClean(s, n) { return String(s || "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").slice(0, n); }
function readBody(req, max) { return new Promise((res) => { let b = "", over = false; req.on("data", (c) => { if (over) return; b += c; if (b.length > max) { over = true; b = ""; } }); req.on("end", () => res(over ? null : b)); req.on("error", () => res(null)); }); }
async function fbAdd(o) {
  const row = JSON.stringify(o);
  if (kv && kv.isReady) { await kv.lPush("fb:list", row); await kv.lTrim("fb:list", 0, 499); return; }
  memFb.unshift(row); memFb.length = Math.min(memFb.length, 500);
}
async function fbList() { const L = kv && kv.isReady ? await kv.lRange("fb:list", 0, 499) : memFb.slice(); return L.map((x) => { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean); }
async function fbDone(id) {
  if (kv && kv.isReady) { const L = await kv.lRange("fb:list", 0, 499); for (const x of L) { if (x.indexOf('"id":"' + id + '"') >= 0) { await kv.lRem("fb:list", 1, x); break; } } return; }
  const i = memFb.findIndex((x) => x.indexOf('"id":"' + id + '"') >= 0); if (i >= 0) memFb.splice(i, 1);
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || "";
  if (ALLOWED.test(origin)) { res.setHeader("Access-Control-Allow-Origin", origin); res.setHeader("Vary", "Origin"); }
  res.setHeader("Cache-Control", "no-store");
  const url = new URL(req.url, "http://x");
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  if (req.method === "OPTIONS") { res.setHeader("Access-Control-Allow-Methods", "GET, POST"); res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Admin-Key"); res.writeHead(204); return res.end(); }
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
      return res.end(JSON.stringify({ online: n, games: by, today: await today(), solved: await solvedToday(), day: sydDay() }));
    }
    if (url.pathname === "/top") {
      const b = lbBoard(url.searchParams.get("b"));
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ rows: await lbTop(b, clean(url.searchParams.get("id"), 16)), day: sydDay(), board: b }));
    }
    if (url.pathname === "/score" && req.method === "POST") {
      const q = url.searchParams, b = lbBoard(q.get("b")), id = clean(q.get("id"), 16);
      const s = Math.floor(Number(q.get("s"))), r = Math.floor(Number(q.get("r")));
      const ok = id.length >= 6 && lbValid(b, s, r, q.get("s"));
      if (!ok && id.length >= 6) console.warn("score rejected", JSON.stringify({ b, s: q.get("s"), r: q.get("r") }));
      if (ok && scoreRateOk(ip) && !limited("lb" + ip, 40)) await lbAdd(b, id, lbName(q.get("n"), b), s, r);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ ok, rows: await lbTop(b, id), day: sydDay(), board: b }));
    }
    if (url.pathname === "/tags") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(await tagOk()));
    }
    if (url.pathname === "/tag" && req.method === "POST") {
      const q = url.searchParams, p = clean(q.get("p"), 60).replace(/-/g, ""), t = q.get("t");
      const ok = pidOk(p) && TAGS.includes(t);
      const xf = (req.headers["x-forwarded-for"] || "").split(",").map((x) => x.trim()).filter(Boolean);
      const rip = req.headers["cf-connecting-ip"] || req.headers["true-client-ip"] || xf[xf.length - 1] || req.socket.remoteAddress || "";
      const h = ok ? ipHash(rip) : null;
      if (h && !limited("tg" + rip, 30)) await tagAdd(p, t, h, tagName(q.get("n")));
      res.writeHead(200, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ ok: ok && !!h }));
    }
    if (url.pathname === "/tagq" || url.pathname === "/tagset") {
      const q = url.searchParams;
      if (limited("ta" + ip, 300) || !isAdmin(adminKey(req, q))) { res.writeHead(403); return res.end(); }
      if (url.pathname === "/tagset" && req.method === "POST") {
        const p = clean(q.get("p"), 60).replace(/-/g, ""), t = q.get("t"), v = q.get("v");
        if (pidOk(p) && TAGS.includes(t) && ["0", "1", "2"].includes(v)) await tagSet(p, t, v);
      }
      res.writeHead(200, { "Content-Type": "application/json" }); return res.end(JSON.stringify(await tagQueue()));
    }
    if (url.pathname === "/fb" && req.method === "POST") {
      const xf = (req.headers["x-forwarded-for"] || "").split(",").map((x) => x.trim()).filter(Boolean);
      const rip = req.headers["cf-connecting-ip"] || req.headers["true-client-ip"] || xf[xf.length - 1] || req.socket.remoteAddress || "";
      if (limited("fb" + rip, 12)) { res.writeHead(429); return res.end(); }
      const body = await readBody(req, 6000); let o = null; try { o = JSON.parse(body || ""); } catch (e) {}
      if (!o || !fbClean(o.msg, 2000).trim()) { res.writeHead(400); return res.end(); }
      await fbAdd({ id: crypto.randomBytes(6).toString("hex"), at: new Date().toISOString(), cat: FB_CATS.includes(o.cat) ? o.cat : "other", page: fbClean(o.page, 300), msg: fbClean(o.msg, 2000), email: fbClean(o.email, 120), mode: fbClean(o.mode, 10) });
      res.writeHead(200, { "Content-Type": "application/json" }); return res.end('{"ok":true}');
    }
    if (url.pathname === "/fbq" || url.pathname === "/fbdone") {
      const q = url.searchParams;
      if (limited("ta" + ip, 300) || !isAdmin(adminKey(req, q))) { res.writeHead(403); return res.end(); }
      if (url.pathname === "/fbdone" && req.method === "POST") await fbDone(clean(q.get("id"), 20));
      res.writeHead(200, { "Content-Type": "application/json" }); return res.end(JSON.stringify(await fbList()));
    }
    if (url.pathname === "/" || url.pathname === "/health") { res.writeHead(200, { "Content-Type": "text/plain" }); return res.end("ok"); }
    res.writeHead(404); res.end();
  } catch (e) { res.writeHead(500); res.end(); }
});
server.listen(PORT, () => console.log("presence on " + PORT));
