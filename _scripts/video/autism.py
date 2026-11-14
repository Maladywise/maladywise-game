# Scene spec for "What is autism?" — built by _scripts/video/build_video.py
import os as _o
exec(open(_o.path.join(_o.path.dirname(_o.path.abspath(__file__)) if "__file__" in dir() else "_scripts/video", "_kit.py")).read())
OUT = "assets/video/what-is-autism.mp4"
POSTER = "assets/video/what-is-autism.png"
SLIDES = "assets/video/what-is-autism-slides"

INF, BRAIN, PUP, OWL, CHAT = "days/infinity.svg", "days/brain.svg", "mascots/mentalhealth.svg", "days/owl.svg", "days/chat-calm.svg"
MIX = ["Social communication", "Senses", "Routines", "Deep interests", "Processing time", "Movement"]
HELP = ["Understanding", "Sensory tweaks", "Predictable plans", "Clear, direct talk", "Rest &amp; recovery", "OT, speech or psych", "Community"]
SENSE = ["Noise", "Bright light", "Clothing labels", "Crowds", "Smells"]

SCENES = [
    [('<div style="position:absolute;left:56px;right:56px;top:640px"><div class=k>A short guide</div>'
      '<h1>What is autism?</h1><p>A different way of <b>sensing, thinking and connecting</b>.</p></div>' + m(INF, 480, y=150), 3.2)],
    [(m(BRAIN, 400, x=120) + card("The basics", "A lifelong difference in how the brain <b>develops</b>."), 2.4),
     (m(BRAIN, 400, x=120) + card("The basics", "A lifelong difference in how the brain <b>develops</b>.", "It&rsquo;s not an illness. It isn&rsquo;t caused by vaccines or by parenting."), 3.6)],
    [(m(INF, 380, x=100, y=170) + card("A spectrum isn&rsquo;t a line", "It&rsquo;s a <b>mix</b>, different for everyone.", "", chips(MIX, "", 2)), 1.4),
     (m(INF, 380, x=100, y=170) + card("A spectrum isn&rsquo;t a line", "It&rsquo;s a <b>mix</b>, different for everyone.", "", chips(MIX, "", 4)), 1.4),
     (m(INF, 380, x=100, y=170) + card("A spectrum isn&rsquo;t a line", "It&rsquo;s a <b>mix</b>, different for everyone.", "", chips(MIX, "")), 2.6)],
    [(m(OWL, 380, x=100, y=170) + dial(.88) + card("Senses", "The volume can be turned <b>up</b>.", "", chips(SENSE, "up")), 2.6),
     (m(OWL, 380, x=100, y=170) + dial(.88) + card("Senses", "The volume can be turned <b>up</b>.", "Or down. Everyday noise can feel painful, or pain can barely register.", chips(SENSE, "up")), 3.4)],
    [(m(CHAT, 400, x=120) + card("Masking", "Hiding autistic traits to <b>fit in</b>.", "Many autistic people, especially women and girls, do it for years. It&rsquo;s exhausting and can lead to burnout."), 4.6)],
    [(m(BRAIN, 400, x=120) + card("Often comes with company", "ADHD, anxiety, sleep and gut troubles", "These are common alongside autism, and they can be treated."), 4.0)],
    [(m(PUP, 300, x=130, y=110) + card("What helps", "Support, not a cure.", "", chips(HELP, "down", 3)), 1.4),
     (m(PUP, 300, x=130, y=110) + card("What helps", "Support, not a cure.", "", chips(HELP, "down", 5)), 1.4),
     (m(PUP, 300, x=130, y=110) + card("What helps", "Support, not a cure.", "", chips(HELP, "down")), 2.8)],
    [(m(INF, 320, x=100, y=200) + m(OWL, 300, x=560, y=170) + card("The goal", "A world that fits <b>more</b> brains.", "Honesty, focus and deep knowledge are real strengths. Many adults are only now being diagnosed, and that&rsquo;s okay."), 4.6)],
    [('<div style="position:absolute;left:56px;right:56px;top:560px"><div class=k>Learn more</div>'
      '<h1>maladywise.com<br>/autism</h1><p style="font-size:30px;color:#6B5A93">General information only. See your GP to talk about assessment and support.</p></div>'
      + m(INF, 280, x=100, y=190) + m(OWL, 280, x=400, y=180) + m(PUP, 280, x=700, y=190), 4.0)],
]
