// node render.js <story.js> <outdir> [stills]  (serve the repo root on :8765 first)
// stills: draws a few frames per scene as PNGs to check; otherwise renders each scene to its own mp4, then joins them.
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), { spawnSync, spawn } = require('child_process');
(async () => {
  const [story, out, mode] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/_scripts/video/anime/anime.html'); await p.addScriptTag({ path: story });
  await p.evaluate(() => setup(window.STORY)); await p.evaluate(() => document.fonts.ready);
  const durs = await p.evaluate(() => STORY.scenes.map(s => s.d)), name = await p.evaluate(() => STORY.out);
  const el = await p.$('#v'); const FPS = 30;
  // let images load
  await p.evaluate(() => draw(0.5)); await p.waitForTimeout(800);
  if (mode === 'stills') { let t0 = 0; for (let i = 0; i < durs.length; i++) { for (const f of [0.35, 0.75]) { await p.evaluate(T => draw(T), t0 + durs[i] * f); await p.waitForTimeout(60); await el.screenshot({ path: path.join(out, `s${i}_${f}.png`) }); } t0 += durs[i]; } await b.close(); return; }
  let t0 = 0; const parts = [];
  for (let i = 0; i < durs.length; i++) {
    const tmp = path.join(out, `part${i}.tmp.mp4`), fin = path.join(out, `part${i}.mp4`); parts.push(fin);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-vf', 'scale=1080:1920,format=yuv420p', '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', String(FPS), tmp]);
    const n = Math.round(durs[i] * FPS);
    for (let k = 0; k < n; k++) { await p.evaluate(T => draw(T), t0 + k / FPS); const buf = await el.screenshot({ type: 'jpeg', quality: 92 }); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); const code = await new Promise(r => ff.on('close', r)); if (code !== 0) throw new Error('ffmpeg failed ' + i);
    fs.renameSync(tmp, fin); t0 += durs[i]; console.log('scene', i, 'done');
  }
  await b.close();
  fs.writeFileSync(path.join(out, 'list.txt'), parts.map(f => `file '${path.resolve(f)}'`).join('\n'));
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(out, 'list.txt'), '-c', 'copy', path.join(out, name + '.mp4')]); if (r.status) throw new Error(r.stderr.toString());
  console.log('wrote', path.join(out, name + '.mp4'));
})();
