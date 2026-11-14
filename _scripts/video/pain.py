# Scene spec for "What is pain?" — built by _scripts/video/build_video.py
OUT = "assets/video/what-is-pain.mp4"
POSTER = "assets/video/what-is-pain.png"
SLIDES = "assets/video/what-is-pain-slides"


def m(src, size=440, x=None, y=150, extra=""):
    left = "left:%dpx" % x if x is not None else "left:50%%;margin-left:-%dpx" % (size // 2)
    return '<img src="/assets/%s" style="position:absolute;%s;top:%dpx;width:%dpx;height:%dpx;object-fit:contain%s">' % (src, left, y, size, size, extra)


def card(k, h, p="", chips=""):
    return '<div class=card><div class=k>%s</div><h2>%s</h2>%s%s</div>' % (k, h, ("<p>%s</p>" % p) if p else "", chips)


def chips(items, cls, upto=None):
    return "<div class=chips>%s</div>" % "".join(
        '<span class="chip %s%s">%s</span>' % (cls, "" if upto is None or i < upto else " ghost", t) for i, t in enumerate(items))


BRAIN, HAMMER, TESS, SLOTH = "days/brain.svg", "mascots/neurology.svg", "mascots/gridectomy.svg", "days/sloth.svg"
UP = ["Poor sleep", "Stress &amp; worry", "Not moving", "Low mood", "Fear of moving"]
DOWN = ["Gentle movement", "Pacing", "Good sleep", "Understanding pain", "People", "Therapies"]

ALARM = ('<svg viewBox="0 0 100 100" style="position:absolute;left:640px;top:150px;width:220px">'
         '<circle cx="50" cy="55" r="32" fill="#FBE1DC" stroke="#9A3220" stroke-width="5"/>'
         '<path d="M50 35v22l12 8" stroke="#9A3220" stroke-width="6" fill="none" stroke-linecap="round"/>'
         '<path d="M14 26 26 14M86 26 74 14" stroke="#9A3220" stroke-width="7" stroke-linecap="round"/></svg>')


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


STAIRS = ''.join('<div style="position:absolute;left:%dpx;top:%dpx;width:150px;height:%dpx;background:#E7E0F2;border-radius:10px 10px 0 0"></div>'
                 % (150 + i * 160, 560 - i * 70, 70 + i * 70) for i in range(5))

SCENES = [
    # 1 title
    [('<div style="position:absolute;left:56px;right:56px;top:640px"><div class=k>A short guide</div>'
      '<h1>What is pain?</h1><p>And why it can hang around after the injury has healed.</p></div>' + m(BRAIN, 470, y=140), 3.2)],
    # 2 alarm system
    [(m(BRAIN, 420, x=120) + card("Pain is an alarm", "Your brain makes pain to <b>protect you</b>."), 2.6),
     (m(BRAIN, 420, x=120) + ALARM + card("Pain is an alarm", "Your brain makes pain to <b>protect you</b>.", "It is always real. It is not &lsquo;in your head&rsquo; in the made-up sense."), 3.6)],
    # 3 normally works brilliantly
    [(m(HAMMER, 440) + card("Most of the time", "The alarm works brilliantly.", "Step on a pin &rarr; ouch &rarr; you move your foot. Job done, alarm off."), 4.0)],
    # 4 alarm too sensitive
    [(m(HAMMER, 400, x=110) + dial(.3) + card("But sometimes", "The alarm gets <b>too sensitive</b>."), 2.4),
     (m(HAMMER, 400, x=110) + dial(.92) + card("But sometimes", "The alarm gets <b>too sensitive</b>.", "After months of pain the nervous system can turn the volume up. Doctors call this <b>sensitisation</b>."), 4.0)],
    # 5 hurt != harm
    [(m(SLOTH, 420, x=120) + ALARM + card("Hurt &ne; harm", "Like a smoke alarm going off for <b>burnt toast</b>.", "Loud alarm, little danger. In chronic pain, hurting often doesn&rsquo;t mean you&rsquo;re doing damage."), 4.4)],
    # 6 volume up
    [(m(SLOTH, 380, x=100, y=170) + dial(.85) + card("Things that turn it up", "Pain volume up &uarr;", "", chips(UP, "up", 1)), 1.4),
     (m(SLOTH, 380, x=100, y=170) + dial(.85) + card("Things that turn it up", "Pain volume up &uarr;", "", chips(UP, "up", 3)), 1.4),
     (m(SLOTH, 380, x=100, y=170) + dial(.85) + card("Things that turn it up", "Pain volume up &uarr;", "", chips(UP, "up")), 2.4)],
    # 7 volume down
    [(m(BRAIN, 380, x=100, y=170) + dial(.2) + card("Things that turn it down", "Pain volume down &darr;", "", chips(DOWN, "down", 2)), 1.4),
     (m(BRAIN, 380, x=100, y=170) + dial(.2) + card("Things that turn it down", "Pain volume down &darr;", "", chips(DOWN, "down", 4)), 1.4),
     (m(BRAIN, 380, x=100, y=170) + dial(.2) + card("Things that turn it down", "Pain volume down &darr;", "", chips(DOWN, "down")), 2.6)],
    # 8 retrain step by step
    [(STAIRS + m(TESS, 230, x=150, y=330) + card("You can retrain the alarm", "Small steps, most days.", "Do a bit more each week, even on good days."), 2.4),
     (STAIRS + m(TESS, 230, x=470, y=190) + card("You can retrain the alarm", "Small steps, most days.", "Do a bit more each week, even on good days."), 1.6),
     (STAIRS + m(TESS, 230, x=630, y=120) + card("You can retrain the alarm", "Small steps, most days.", "Flares happen. They&rsquo;re a bump, not a fall back to the start."), 3.2)],
    # 9 end card
    [('<div style="position:absolute;left:56px;right:56px;top:560px"><div class=k>Learn more</div>'
      '<h1>maladywise.com<br>/chronic-pain</h1><p style="font-size:30px;color:#6B5A93">General information only. See your GP for a plan that fits you.</p></div>'
      + m(BRAIN, 300, x=100, y=170) + m(TESS, 260, x=420, y=210) + m(HAMMER, 280, x=700, y=180), 4.0)],
]
