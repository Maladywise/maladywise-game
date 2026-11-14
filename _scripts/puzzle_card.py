#!/usr/bin/env python3
"""Picture card for the daily X puzzle post (1080x1350, portrait): kicker, title, question box, mascot,
"Answer tomorrow" pill. Used by typefully_push.py for queue entries with a "puzzle" object:

    "puzzle": {"kicker": "Name the sign", "title": "Painless jaundice", "body": "Question text, <b>bold</b> allowed",
               "mascot": "dx"}   # mascot = file name in assets/mascots/ (no .svg)

    python3 _scripts/puzzle_card.py out.png "Kicker" "Title" "Body <b>html</b>" [mascot]
"""
import base64, html, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import day_card  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 540, 675   # drawn at 2x -> 1080x1350
ALLOWED = re.compile(r"</?(b|i|br)\s*/?>")


def safe_body(s):
    """Escape everything, then let <b>, <i> and <br> back in."""
    out = html.escape(s)
    return re.sub(r"&lt;(/?(?:b|i|br)\s*/?)&gt;", r"<\1>", out)


def card_html(p):
    m = (p.get("mascot") or "dx").strip()
    f = os.path.join(ROOT, "assets", "mascots", m + ".svg")
    img = ""
    if os.path.isfile(f):
        img = '<img class="m" alt="" src="data:image/svg+xml;base64,%s">' % base64.b64encode(open(f, "rb").read()).decode()
    pill = p.get("pill") or "Your answer in the replies"
    return ("<!doctype html><html><head><meta charset='utf-8'><style>%s"
            "body{margin:0}#c{width:%dpx;height:%dpx;box-sizing:border-box;padding:34px 36px;background:linear-gradient(160deg,#4A3480,#7A4FC0);color:#fff;font-family:Poppins,sans-serif;position:relative;overflow:hidden}"
            ".k{font-weight:600;font-size:15px;letter-spacing:3px;color:#FFE066;text-transform:uppercase;padding-right:110px}"
            "h1{font-family:Lora,serif;font-weight:700;font-size:38px;line-height:1.15;margin:12px 110px 22px 0}"
            ".box{background:#fff;color:#2B2340;border-radius:20px;padding:26px 26px;font-size:25px;line-height:1.45}.sub{margin-top:18px;font-size:16px;color:#E9DFFF}.box b{color:#4A3480;font-weight:600}"
            ".ft{position:absolute;left:36px;right:36px;bottom:30px;display:flex;align-items:center;justify-content:space-between;font-weight:600;font-size:18px}"
            ".ft span{background:#FFE066;color:#2B2340;border-radius:999px;padding:8px 16px}img.m{position:absolute;right:24px;top:22px;width:100px;height:100px}"
            "</style></head><body><div id='c'>%s<div class='k'>%s</div><h1>%s</h1><div class='box'>%s</div><div class='sub'>Reply with your guess. Answer at 11:15am Sydney time.</div>"
            "<div class='ft'><span>%s</span><div>maladywise.com</div></div></div></body></html>") % (
        day_card.font_css(), W, H, img, html.escape(p.get("kicker", "Daily puzzle")), html.escape(p.get("title", "")),
        safe_body(p.get("body", "")), html.escape(pill))


def render(p, out_path, browser=None):
    doc = card_html(p)

    def go(b):
        page = b.new_page(viewport={"width": W, "height": H}, device_scale_factor=2)
        try:
            page.set_content(doc, wait_until="load")
            page.evaluate("() => document.fonts.ready.then(() => true)")
            # shrink the question text if it would run into the footer
            page.evaluate("""() => { const b = document.querySelector('.box'); let s = 25;
              while (b.getBoundingClientRect().bottom > 560 && s > 15) { s -= 1; b.style.fontSize = s + 'px'; } }""")
            page.screenshot(path=out_path, clip={"x": 0, "y": 0, "width": W, "height": H})
        finally:
            page.close()

    if browser is not None:
        go(browser)
    else:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as pw:
            b = pw.chromium.launch()
            try:
                go(b)
            finally:
                b.close()
    try:  # keep it small: palette PNG, plenty sharp for text cards
        from PIL import Image
        Image.open(out_path).convert("RGB").quantize(colors=160).save(out_path, optimize=True)
    except Exception:
        pass
    return out_path


if __name__ == "__main__":
    if len(sys.argv) < 5:
        print(__doc__)
        sys.exit(2)
    print(render({"kicker": sys.argv[2], "title": sys.argv[3], "body": sys.argv[4], "mascot": sys.argv[5] if len(sys.argv) > 5 else "dx"}, sys.argv[1]))
