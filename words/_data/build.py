"""Word of the week. Run from repo root: python3 words/_data/build.py [YYYY-MM-DD]
Publishes every entry in words/_data/words.json whose date <= today (Sydney), newest first."""
import json, html, sys, datetime, random, re
today = sys.argv[1] if len(sys.argv) > 1 else (datetime.datetime.utcnow() + datetime.timedelta(hours=11)).strftime("%Y-%m-%d")
L = [w for w in json.load(open("words/_data/words.json")) if w["date"] <= today]
L.sort(key=lambda w: w["date"], reverse=True)
e = lambda s: html.escape(str(s or ""), quote=True)
src = open("deep-dives/index.html").read()
head = src[:src.index("<body>")]
foot = src[src.index("<footer"):]
title, desc, url = "Medical Word of the Week | Malady Wise", "A weird, wonderful medical word every week, from German grief bacon to Latin little mice, plus a question from medicine's strangest history.", "https://maladywise.com/words/"
head = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", head)
head = re.sub(r'(rel="canonical" href=")[^"]*', r"\g<1>" + url, head)
head = re.sub(r'(name="description" content=")[^"]*', r"\g<1>" + e(desc), head)
head = re.sub(r'(property="og:title" content=")[^"]*', r"\g<1>" + title, head)
head = re.sub(r'(property="og:description" content=")[^"]*', r"\g<1>" + e(desc), head)
def nice(d): return datetime.date.fromisoformat(d).strftime("%-d %b %Y")
def quiz(w):
    q = w.get("q")
    if not q: return ""
    idx = list(range(len(q["opts"]))); random.Random(w["slug"]).shuffle(idx)
    btns = "".join(f'<button type="button" data-ok="{1 if i == q["a"] else 0}">{e(q["opts"][i])}</button>' for i in idx)
    return f'<div class="wq"><p class="wq-k">History question</p><p class="wq-q">{e(q["text"])}</p><div class="wq-o">{btns}</div><p class="wq-a" hidden>{e(q["why"])}</p></div>'
def card(w, big):
    x = f"Malady Word of the Week: {w['word']} ({w['lang']}), literally ‘{w['literal']}’. {w['meaning']}"
    share = "https://x.com/intent/post?text=" + __import__("urllib.parse").parse.quote(x[:230] + " ") + "&url=" + __import__("urllib.parse").parse.quote(url + "#" + w["slug"])
    return (f'<article class="ww{" ww-big" if big else ""}" id="{e(w["slug"])}"><p class="ww-d">Week of {nice(w["date"])} · {e(w["lang"])}</p>'
            f'<h2>{e(w["word"])}</h2><p class="ww-say">{e(w["say"])} · literally <b>“{e(w["literal"])}”</b></p>'
            f'<p>{e(w["meaning"])}</p><p><b>Origin.</b> {e(w["origin"])}</p><p class="ww-s"><b>Use it:</b> {e(w["sentence"])}</p>'
            + quiz(w) + f'<p class="ww-sh"><a href="{e(share)}" rel="noopener" target="_blank">Share on X</a></p></article>')
cur, past = (L[0], L[1:]) if L else (None, [])
body = ('<main class="wrap doc"><h1>Word of the week</h1><p class="lede">One weird and wonderful medical word every Monday, plus a question from medicine’s strangest history.</p>'
        + (card(cur, True) if cur else "<p>First word lands Monday.</p>")
        + ('<h2 class="ww-arch">Past words</h2>' + "".join(card(w, False) for w in past) if past else "")
        + '<p class="callout"><b>Just for fun.</b> Word histories are well-documented where possible; where a story is legend rather than fact, we say so.</p>\n'
        + "<script>document.querySelectorAll('.wq').forEach(function(q){q.querySelectorAll('.wq-o button').forEach(function(b){b.onclick=function(){if(q.classList.contains('done'))return;q.classList.add('done');q.querySelectorAll('.wq-o button').forEach(function(x){if(x.dataset.ok==='1')x.classList.add('ok')});if(b.dataset.ok!=='1')b.classList.add('no');q.querySelector('.wq-a').hidden=false;}})})</script>\n")
open("words/index.html", "w").write(head + "<body>\n" + body + foot)
if cur: json.dump({"word": cur["word"], "literal": cur["literal"], "slug": cur["slug"], "lang": cur["lang"]}, open("words/current.json", "w"), ensure_ascii=False)
print("published", len(L), "current:", cur and cur["word"])
