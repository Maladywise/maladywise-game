#!/usr/bin/env python3
"""Build a short mascot explainer video (1080x1080, 30 fps, silent with on-screen text) from a scene spec.

    python3 _scripts/video/build_video.py _scripts/video/pain.py

The spec file defines OUT (e.g. "assets/video/what-is-pain.mp4"), POSTER (a PNG path) and SCENES: a list of
scenes, each a list of (html, seconds) states. States inside a scene crossfade; scenes fade through the
background colour. Needs Python Playwright (Chromium) and ffmpeg. Fonts and mascots come from /assets/,
so the repo is served on localhost while frames are drawn.
"""
import os, shutil, subprocess, sys, tempfile, threading, http.server, socketserver, functools

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
W = H = 1080
FPS = 30
XF = 0.6    # crossfade between states
FADE = 0.4  # fade in/out of each scene
WPS = 3.0   # reading speed for on-screen words (slow and comfortable; this is for humans)


def words(html):
    import re, html as h
    html = re.sub(r'<span class="chip [^"]*ghost">.*?</span>', " ", html)
    html = re.sub(r"<div class=brand>.*?</div>", " ", html)
    return h.unescape(re.sub(r"<[^>]+>", " ", html)).split()


def hold(inner, sec, prev):
    """Seconds to hold a state: long enough to read the words that are new on screen, never less than the spec."""
    new = max(0, len(words(inner)) - len(words(prev))) if prev is not None else len(words(inner))
    need = (1.5 if prev is None else 1.0) + new / WPS
    return max(sec, round(need, 1))

CSS = """
@font-face{font-family:Lora;font-weight:700;src:url(/assets/fonts/lora-latin-700-normal.woff2) format("woff2")}
@font-face{font-family:Poppins;font-weight:400;src:url(/assets/fonts/poppins-latin-400-normal.woff2) format("woff2")}
@font-face{font-family:Poppins;font-weight:600;src:url(/assets/fonts/poppins-latin-600-normal.woff2) format("woff2")}
html,body{margin:0;width:1080px;height:1080px;background:#FAF7F2;overflow:hidden}
body{font-family:Poppins,sans-serif;color:#2B2340;position:relative}
.brand{position:absolute;left:56px;top:44px;font:700 34px Lora,serif;color:#4A3480}
.brand small{font:600 18px Poppins;letter-spacing:.14em;text-transform:uppercase;color:#6B5A93;margin-left:12px}
.url{position:absolute;right:56px;top:52px;font:600 22px Poppins;color:#6B5A93}
.k{font:600 24px Poppins;letter-spacing:.14em;text-transform:uppercase;color:#6B5A93;margin:0 0 10px}
h1{font:700 76px/1.08 Lora,serif;margin:0;color:#2B2340}
h2{font:700 60px/1.1 Lora,serif;margin:0;color:#2B2340}
p{font:400 38px/1.35 Poppins;margin:18px 0 0}
b{font-weight:600;color:#4A3480}
.card{position:absolute;left:56px;right:56px;bottom:64px;background:#fff;border-radius:36px;padding:44px 50px;box-shadow:0 10px 40px rgba(74,52,128,.12)}
.chips{display:flex;flex-wrap:wrap;gap:16px;margin-top:22px}
.chip{font:600 32px Poppins;padding:14px 26px;border-radius:999px;background:#F1ECF8;color:#4A3480}
.chip.up{background:#FBE1DC;color:#9A3220}.chip.down{background:#DDF3E6;color:#1F6B3A}
.ghost{opacity:0}
"""


def frame(inner):
    return ("<!doctype html><html><head><meta charset=utf-8><style>%s</style></head><body>"
            "<div class=brand>Malady Wise<small>Explainer</small></div>%s</body></html>") % (CSS, inner)


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print(r.stderr[-2000:]); sys.exit(1)


def main(spec):
    env = {}
    exec(open(spec, encoding="utf-8").read(), env)
    scenes, out = env["SCENES"], os.path.join(ROOT, env["OUT"])
    tmp = tempfile.mkdtemp(prefix="mwvid-", dir=ROOT)  # inside the repo so /assets/ resolves; removed at the end
    rel = os.path.relpath(tmp, ROOT)
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    Handler = functools.partial(Quiet, directory=ROOT)
    srv = socketserver.TCPServer(("127.0.0.1", 0), Handler); port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    os.makedirs(os.path.dirname(out), exist_ok=True)
    from playwright.sync_api import sync_playwright
    files, alts = [], []
    try:
        with sync_playwright() as pw:
            b = pw.chromium.launch(); pg = b.new_page(viewport={"width": W, "height": H})
            for si, states in enumerate(scenes):
                pngs = []
                prev = None
                for ti, (inner, sec) in enumerate(states):
                    sec = hold(inner, sec, prev); prev = inner
                    hp = os.path.join(tmp, "s%02d_%02d.html" % (si, ti)); open(hp, "w", encoding="utf-8").write(frame(inner))
                    pg.goto("http://127.0.0.1:%d/%s/%s" % (port, rel, os.path.basename(hp))); pg.wait_for_timeout(250)
                    pg.evaluate("document.fonts.ready")
                    png = hp[:-5] + ".png"; pg.screenshot(path=png); pngs.append((png, sec))
                if env.get("SLIDES"):
                    sd = os.path.join(ROOT, env["SLIDES"]); os.makedirs(sd, exist_ok=True)
                    run(["ffmpeg", "-y", "-i", pngs[-1][0], "-vf", "scale=720:720", "-quality", "82", os.path.join(sd, "%02d.webp" % (si + 1))])
                    import re as _re
                    alts.append(_re.sub(r" ([.,;:!?])", r"\1", " ".join(words(_re.sub(r"<svg.*?</svg>", " ", states[-1][0], flags=_re.S)))))
                if PREVIEW:
                    shutil.copy(pngs[-1][0], os.path.join(PREVIEW, "scene%02d.png" % (si + 1))); continue
                if si == 0 and env.get("POSTER"):
                    shutil.copy(pngs[-1][0], os.path.join(ROOT, env["POSTER"]))
                # one encoded file per scene: states crossfade, the scene fades in and out
                inputs, flt, last, t = [], [], None, 0.0
                for k, (png, sec) in enumerate(pngs):
                    inputs += ["-framerate", str(FPS), "-i", png]
                    dur = sec + (XF if k < len(pngs) - 1 else 0)
                    flt.append("[%d:v]format=yuv420p,loop=-1:1,trim=duration=%.3f,setpts=PTS-STARTPTS[v%d]" % (k, dur, k))
                total = 0.0
                for k in range(len(pngs)):
                    if k == 0:
                        last = "v0"; total = pngs[0][1] + (XF if len(pngs) > 1 else 0)
                        continue
                    off = total - XF
                    flt.append("[%s][v%d]xfade=transition=fade:duration=%.2f:offset=%.3f[x%d]" % (last, k, XF, off, k))
                    last = "x%d" % k; total = off + pngs[k][1] + (XF if k < len(pngs) - 1 else 0)
                flt.append("[%s]fade=t=in:st=0:d=%.2f:color=0xFAF7F2,fade=t=out:st=%.3f:d=%.2f:color=0xFAF7F2,format=yuv420p[out]" % (last, FADE, total - FADE, FADE))
                part = os.path.join(tmp, "scene%02d.tmp.mp4" % si)
                run(["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(flt), "-map", "[out]", "-r", str(FPS),
                     "-c:v", "libx264", "-crf", "20", "-preset", "veryfast", "-pix_fmt", "yuv420p", part])
                final = part.replace(".tmp.mp4", ".mp4"); os.rename(part, final); files.append(final)
                print("scene", si + 1, "of", len(scenes), "%.1fs" % total)
            b.close()
        if PREVIEW:
            print("preview frames in", PREVIEW); return
        if env.get("SLIDES"):
            import json
            json.dump(alts, open(os.path.join(ROOT, env["SLIDES"], "alt.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
        lst = os.path.join(tmp, "list.txt"); open(lst, "w").write("".join("file '%s'\n" % f for f in files))
        os.makedirs(os.path.dirname(out), exist_ok=True)
        tmpout = out[:-4] + ".tmp.mp4"
        run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", tmpout])
        os.replace(tmpout, out)
        print("wrote", out, "%.1f MB" % (os.path.getsize(out) / 1e6))
    finally:
        srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)


PREVIEW = None
if __name__ == "__main__":
    if "--preview" in sys.argv:  # --preview DIR: save the last state of each scene as a PNG, no encoding
        PREVIEW = sys.argv[sys.argv.index("--preview") + 1]; os.makedirs(PREVIEW, exist_ok=True)
    main(sys.argv[1])
