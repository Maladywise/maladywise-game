# /shop/: Malady Wise stickers (sold through Redbubble). Thumbnails in assets/shop/, list in data/shop.json.
import json as _j, html as _h
_S = _j.load(open("data/shop.json", encoding="utf-8"))
SHOP = "https://www.redbubble.com/people/MaladyWise/shop"
def _grid(g):
    return '<ul class="shopg">' + "".join(
        '<li><a href="%s" rel="noopener" target="_blank"><img src="%s" alt="Sticker: %s (%s)" width="360" height="360" loading="lazy"></a></li>' % (
            SHOP, p, _h.escape(c), _h.escape(w)) for k, p, c, w in _S if k == g) + "</ul>\n"
body = ('<p class="lede">Stickers starring Basil, Clover and the game mascots. Printed and posted worldwide by Redbubble, so you can stick a sassy jellyfish on your laptop.</p>\n'
        '<p><a class="btn-shop" href="%s" rel="noopener" target="_blank">Open the shop on Redbubble →</a></p>\n' % SHOP +
        '<p class="sass">Clinically questionable, emotionally essential.</p>\n'
        '<h2>Basil and Clover</h2>\n<p>The real cats behind Malady Wise, drawn as cartoons. Basil is the fluffy white one with two brain cells. Clover runs the complaints department.</p>\n' + _grid("cats") +
        '<h2>The game mascots</h2>\n<p>One for every daily puzzle. Meet them properly on the <a href="/mascots/">mascots page</a>.</p>\n' + _grid("mascots") +
        '<p class="meta">Prices, shipping and returns are handled by Redbubble. Buying a sticker helps keep the puzzles free and ad-free.</p>\n'
        '<style>.shopg{list-style:none!important;margin:14px 0 26px!important;padding:0!important;display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px}'
        '.shopg li{margin:0!important}.shopg a{display:block;text-decoration:none;color:inherit;background:var(--card,#fff);border:1px solid var(--line,#E7E0F2);border-radius:14px;padding:8px;text-align:center}'
        '.shopg img{width:100%;height:auto;display:block}.shopg span{display:block;font-size:13px;line-height:1.3;margin-top:6px;color:var(--muted,#5C4E7E)}'
        '.btn-shop{display:inline-block;background:#4A3480;color:#fff!important;padding:12px 20px;border-radius:999px;font-weight:600;text-decoration:none}</style>\n')
page("/shop/", "Malady Wise Stickers: Basil, Clover and the Game Mascots",
     "Malady Wise stickers: Basil and Clover the cats, plus the mascots from every daily medical puzzle. Sold and shipped worldwide through Redbubble.",
     "Stickers", "Malady Wise stickers", "Shop", [("Malady Wise", "/"), ("Stickers", "/shop/")], body, [], [],
     [("All puzzles", "/medical-games/"), ("Basil + Clover game", "/basil-clover/"), ("About", "/about/")], audience="Patient", about_type="WebPage")
