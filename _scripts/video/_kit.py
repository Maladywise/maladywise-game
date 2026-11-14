# Shared drawing helpers for explainer scene specs (exec'd by the specs).
def m(src, size=440, x=None, y=150, extra=""):
    left = "left:%dpx" % x if x is not None else "left:50%%;margin-left:-%dpx" % (size // 2)
    return '<img src="/assets/%s" style="position:absolute;%s;top:%dpx;width:%dpx;height:%dpx;object-fit:contain%s">' % (src, left, y, size, size, extra)


def card(k, h, p="", chips=""):
    return '<div class=card><div class=k>%s</div><h2>%s</h2>%s%s</div>' % (k, h, ("<p>%s</p>" % p) if p else "", chips)


def chips(items, cls, upto=None):
    return "<div class=chips>%s</div>" % "".join(
        '<span class="chip %s%s">%s</span>' % (cls, "" if upto is None or i < upto else " ghost", t) for i, t in enumerate(items))


def dial(pct):
    # a volume dial: arc from -135 to +135 degrees, needle at pct
    import math
    a = math.radians(-135 + 270 * pct)
    x, y = 50 + 34 * math.sin(a), 52 - 34 * math.cos(a)
    col = "#1F6B3A" if pct < .5 else "#9A3220"
    return ('<svg viewBox="0 0 100 100" style="position:absolute;left:600px;top:140px;width:300px">'
            '<path d="M22 80A40 40 0 1 1 78 80" fill="none" stroke="#E7E0F2" stroke-width="10" stroke-linecap="round"/>'
            '<circle cx="50" cy="52" r="10" fill="%s"/><line x1="50" y1="52" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="6" stroke-linecap="round"/>'
            '<text x="20" y="98" font-size="9" font-family="Poppins" fill="#6B5A93">quiet</text>'
            '<text x="68" y="98" font-size="9" font-family="Poppins" fill="#6B5A93">LOUD</text></svg>') % (col, x, y, col)


