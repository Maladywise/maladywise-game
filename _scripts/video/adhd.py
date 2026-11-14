# Scene spec for "What is ADHD?" — built by _scripts/video/build_video.py
import os as _o
exec(open(_o.path.join(_o.path.dirname(_o.path.abspath(__file__)) if "__file__" in dir() else "_scripts/video", "_kit.py")).read())
OUT = "assets/video/what-is-adhd.mp4"
POSTER = "assets/video/what-is-adhd.png"
SLIDES = "assets/video/what-is-adhd-slides"

BRAIN, BIRD, OCTO, PUP = "days/brain.svg", "days/hummingbird.svg", "days/octavia-tools.svg", "mascots/mentalhealth.svg"
HARD = ["Starting tasks", "Planning", "Sense of time", "Working memory", "Big feelings", "Impulses"]
HELP = ["Understanding it", "Reminders &amp; routines", "Medication", "Coaching or therapy", "Sleep &amp; movement", "School or work adjustments"]
TYPES = ["Mostly inattentive", "Mostly hyperactive-impulsive", "Combined"]

SCENES = [
    [('<div style="position:absolute;left:56px;right:56px;top:640px"><div class=k>A short guide</div>'
      '<h1>What is ADHD?</h1><p>A brain that runs on <b>interest</b>, not importance.</p></div>' + m(BRAIN, 460, y=150), 3.2)],
    [(m(BRAIN, 400, x=120) + card("The basics", "A difference in how the brain <b>develops</b>."), 2.4),
     (m(BRAIN, 400, x=120) + card("The basics", "A difference in how the brain <b>develops</b>.", "It starts in childhood and often carries on into adulthood. It&rsquo;s not laziness, bad parenting or too much screen time."), 3.8)],
    [(m(BIRD, 420) + card("Not a lack of attention", "Trouble <b>steering</b> it.", "Boring tasks slip away. Interesting ones can swallow hours. That&rsquo;s called <b>hyperfocus</b>."), 4.2)],
    [(m(OCTO, 380, x=100, y=170) + card("The brain&rsquo;s manager", "Executive function gets <b>overloaded</b>.", "", chips(HARD, "up", 2)), 1.4),
     (m(OCTO, 380, x=100, y=170) + card("The brain&rsquo;s manager", "Executive function gets <b>overloaded</b>.", "", chips(HARD, "up", 4)), 1.4),
     (m(OCTO, 380, x=100, y=170) + card("The brain&rsquo;s manager", "Executive function gets <b>overloaded</b>.", "", chips(HARD, "up")), 2.6)],
    [(m(BIRD, 360, x=120, y=170) + card("It looks different in different people", "Three common patterns", "", chips(TYPES, "")), 2.6),
     (m(BIRD, 360, x=120, y=170) + card("It looks different in different people", "Three common patterns", "Quiet, daydreamy ADHD is often missed, especially in girls and women.", chips(TYPES, "")), 3.6)],
    [(m(BRAIN, 400, x=120) + card("How common?", "About <b>6&ndash;10%</b> of Australian children.", "And about 2&ndash;6% of adults. It runs in families: genes explain most of the risk."), 4.4)],
    [(m(PUP, 300, x=130, y=110) + card("What helps", "Plenty, and it works.", "", chips(HELP, "down", 2)), 1.4),
     (m(PUP, 300, x=130, y=110) + card("What helps", "Plenty, and it works.", "", chips(HELP, "down", 4)), 1.4),
     (m(PUP, 300, x=130, y=110) + card("What helps", "Plenty, and it works.", "", chips(HELP, "down")), 2.8)],
    [(m(BIRD, 300, x=120, y=200) + m(BRAIN, 300, x=560, y=170) + card("The goal", "A life that fits <b>your</b> brain.", "Energy, creativity and hyperfocus are real strengths. The aim is fewer things working against you."), 4.4)],
    [('<div style="position:absolute;left:56px;right:56px;top:560px"><div class=k>Learn more</div>'
      '<h1>maladywise.com<br>/adhd</h1><p style="font-size:30px;color:#6B5A93">General information only. See your GP to talk about assessment and support.</p></div>'
      + m(BIRD, 280, x=100, y=190) + m(BRAIN, 300, x=400, y=170) + m(OCTO, 280, x=700, y=190), 4.0)],
]
