# Chronic pain hub (patient-facing). Pain-science ideas are explained in our own words; HIPS is linked, not copied.
import json as _j, os as _o
_ALT = _j.load(open('assets/video/what-is-pain-slides/alt.json', encoding='utf-8'))  # run from the repo root; written by build_video.py
SLIDES = ('<div class="mw-slides" tabindex="0" aria-roledescription="slideshow" aria-label="What is pain? Slides"><div class="mws-track">' + ''.join(
    '<img src="/assets/video/what-is-pain-slides/%02d.webp" width="720" height="720" loading="lazy" alt="%s">' % (k + 1, a.replace('"', '&quot;')) for k, a in enumerate(_ALT)) +
    '</div><div class="mws-bar"><button type="button" class="mws-prev">&larr; Back</button><button type="button" class="mws-next">Next &rarr;</button><span class="mws-count" aria-live="polite"></span></div></div>')
VIDEO = '''<figure class="mw-video" style="margin:1.4em 0">
<video controls playsinline preload="none" poster="/assets/video/what-is-pain.png" width="1080" height="1080" style="width:100%;max-width:560px;height:auto;border-radius:18px;display:block;background:#FAF7F2">
<source src="/assets/video/what-is-pain.mp4" type="video/mp4">
</video>
<figcaption style="font-size:.9em;color:#6B5A93;margin-top:.4em">Prefer it as a video? About 90 seconds, no sound needed.</figcaption>
</figure>'''

hub = '''<p class="lede">Pain that sticks around for more than three months is common, real and exhausting. It&rsquo;s also more changeable than it feels. This hub explains how long-term pain works, what actually helps, and where to start.</p>
<div class="glance"><ul>
<li><b>About 1 in 5 Australians aged 45 and over</b> live with chronic pain. You&rsquo;re far from alone.</li>
<li><b>Chronic pain is real pain.</b> It comes from a nervous system that has become extra protective, not from &lsquo;making it up&rsquo;.</li>
<li><b>Hurt doesn&rsquo;t always mean harm.</b> Gentle, gradual movement is safe for most people and is one of the best treatments.</li>
<li><b>Medicines play a small part.</b> The big wins come from movement, pacing, sleep, understanding pain and support.</li>
<li><b>Flares happen.</b> A plan for them helps more than avoiding life.</li>
</ul><p class="sass">Your pain system is a very loyal bodyguard who has started tackling the postie. We&rsquo;re here to retrain the bodyguard, not fire it.</p></div>

<h2>What is pain? (9 quick slides)</h2>
<p>Tap <b>Next</b> when you&rsquo;re ready.</p>
''' + SLIDES + VIDEO + '''
<p>Pain is your brain&rsquo;s alarm system. It&rsquo;s made by the brain, using information from the body, to protect you. With a fresh injury it does a great job. But when pain goes on for months, the alarm can become <b>too sensitive</b>: it goes off sooner, louder and for longer than it needs to. Doctors call this <b>sensitisation</b>. It&rsquo;s a change in how the nervous system works, and it can change back.</p>
<p>Prefer a different take? The Victorian Government&rsquo;s Health Translations library hosts <a href="https://healthtranslations.vic.gov.au/resources/understanding-pain-in-less-than-5-minutes-video" rel="noopener">&ldquo;Understanding pain in less than 5 minutes&rdquo;</a>, a well-loved short video with versions in many languages.</p>

<h2>Acute pain vs chronic pain</h2>
<ul>
<li><b>Acute pain</b> follows an injury or illness and settles as tissues heal, usually within weeks.</li>
<li><b>Chronic (persistent) pain</b> lasts beyond 3 months. Often the tissues have healed as much as they will, but the alarm keeps ringing.</li>
<li>Some chronic pain sits alongside an ongoing condition (like arthritis or endometriosis). Some has no clear tissue cause at all (like fibromyalgia or much long-term back pain). Both are real, and both respond to the same core approach.</li>
</ul>

<h2>What turns the volume up</h2>
<ul>
<li>Poor or short sleep</li>
<li>Stress, worry and feeling unsafe</li>
<li>Moving less and less (deconditioning)</li>
<li>Low mood, isolation and loneliness</li>
<li>Fear that movement will cause damage, and scary explanations (&ldquo;your spine is crumbling&rdquo;)</li>
<li>Boom-and-bust days: doing heaps on good days, then crashing</li>
</ul>

<h2>What turns it down</h2>
<ul>
<li><b>Understanding pain.</b> Learning how pain works lowers fear and is a treatment in itself.</li>
<li><b>Gentle, regular movement.</b> Walking, swimming, tai chi, strength work. Start small and build up.</li>
<li><b>Pacing.</b> Plan a steady amount most days, good or bad, then add a little each week.</li>
<li><b>Sleep.</b> Regular times, wind-down routine, and see your GP about snoring or insomnia.</li>
<li><b>People and purpose.</b> Work, hobbies and time with others all calm the nervous system.</li>
<li><b>Psychological therapies.</b> Not because pain is &lsquo;in your head&rsquo;, but because the brain is where pain is made.</li>
</ul>

<h2>Treatments with good evidence</h2>
<ul>
<li><b>Exercise therapy</b> with a physio or exercise physiologist: the most consistent benefit across many chronic pain conditions.</li>
<li><b>Pain education</b> plus movement (sometimes called pain neuroscience education).</li>
<li><b>Cognitive functional therapy:</b> an Australian-developed physio approach. In the RESTORE trial (492 people with long-term back pain), it reduced disability more than usual care, and the benefit lasted a year.</li>
<li><b>CBT and acceptance and commitment therapy (ACT):</b> modest but real gains in pain, mood and function.</li>
<li><b>Pain reprocessing therapy:</b> in a US trial of chronic back pain, about two-thirds of people were pain-free or nearly pain-free after 4 weeks of treatment, compared with about one in five on placebo. Promising, but one trial so far.</li>
<li><b>Pain management programs:</b> group programs combining all of the above, run by public and private pain services.</li>
</ul>

<h2>Where medicines fit</h2>
<p>Medicines can take the edge off, but on their own they rarely fix chronic pain. Your GP may suggest a trial of one, with a clear goal and a review date.</p>
<ul>
<li><b>Nerve-calming medicines</b> such as <a href="/medicines/amitriptyline/">amitriptyline</a>, <a href="/medicines/duloxetine/">duloxetine</a> or <a href="/medicines/pregabalin/">pregabalin</a> help some people with nerve pain or fibromyalgia. They don&rsquo;t help everyone, and they don&rsquo;t help most back pain.</li>
<li><b>Anti-inflammatories</b> can help short flares of arthritis or back pain, used for short periods with your GP&rsquo;s advice.</li>
<li><b>Paracetamol</b> helps less than most people think for back pain and osteoarthritis.</li>
<li><b>Opioids</b> give small benefits for long-term pain at best, and the risks (dependence, falls, constipation, sleep apnoea, and pain getting worse over time) build up. If you take them already, don&rsquo;t stop suddenly: ask your GP about a slow, supported plan.</li>
</ul>

<h2>A flare plan</h2>
<ul>
<li><b>Remember:</b> a flare is a sensitive alarm, not usually new damage.</li>
<li><b>Ease back, don&rsquo;t stop.</b> Cut activity to about half for a few days, then build back up.</li>
<li><b>Use your calming tools:</b> heat, a warm shower, slow breathing, gentle stretches, distraction.</li>
<li><b>Keep sleep and routine</b> as normal as you can.</li>
<li><b>Write down what helped</b> for next time.</li>
<li><b>See your GP urgently</b> for new weakness or numbness, trouble passing urine or controlling your bowels, numbness in the groin, fever, unexplained weight loss, or pain after a significant injury.</li>
</ul>

<h2>Common pain conditions</h2>
<ul>
<li><a href="/back-pain/">Back pain</a> and <a href="/sciatica/">sciatica</a></li>
<li><a href="/neck-pain/">Neck pain</a>, <a href="/shoulder-pain/">shoulder pain</a> and <a href="/hip-pain/">hip pain</a></li>
<li><a href="/fibromyalgia/">Fibromyalgia</a></li>
<li><a href="/osteoarthritis/">Osteoarthritis</a></li>
<li><a href="/migraine/">Migraine</a> and <a href="/tension-headache/">tension headache</a></li>
<li><a href="/period-pain/">Period pain</a> and <a href="/endometriosis/">endometriosis</a></li>
<li><a href="/ibs/">Irritable bowel syndrome</a></li>
</ul>

<h2>Skip these</h2>
<ul class="skip">
<li><b>Waiting to be pain-free before living again</b><span>Function usually improves first, then pain follows.</span></li>
<li><b>Repeated scans for long-term back pain</b><span>Scan changes are common in people with no pain at all, and they rarely change treatment.</span></li>
<li><b>Long-term bed rest and &lsquo;protecting&rsquo; the sore spot</b><span>It makes the system more sensitive, not less.</span></li>
<li><b>Expensive gadgets and miracle cures</b><span>If it promises to cure everyone, it cures no one.</span></li>
</ul>

<h2>Helpful resources</h2>
<ul class="res">
<li><a href="https://painhealth.csse.uwa.edu.au/" rel="noopener">painHEALTH</a><span>Evidence-based tips, modules and personal stories for musculoskeletal pain. Free.</span></li>
<li><a href="https://aci.health.nsw.gov.au/chronic-pain" rel="noopener">ACI Pain (NSW Health)</a><span>Resources for people with pain and their families, including pacing and flare plans. Free.</span></li>
<li><a href="https://www.chronicpainaustralia.org.au/" rel="noopener">Chronic Pain Australia</a><span>National consumer organisation. PainLink helpline: 1300 340 357.</span></li>
<li><a href="https://www.painaustralia.org.au/" rel="noopener">Painaustralia</a><span>National peak body: information, advocacy and links to services.</span></li>
<li><a href="https://healthtranslations.vic.gov.au/resources/understanding-pain-in-less-than-5-minutes-video" rel="noopener">Understanding pain in less than 5 minutes</a><span>Short video, many languages.</span></li>
</ul>
'''

page("/chronic-pain/", "Chronic Pain Hub: How Long-Term Pain Works and What Helps",
 "Chronic pain explained: why pain can last after healing, what turns it up and down, treatments with good evidence, where medicines fit, a flare plan, and a click-through explainer and short video.",
 "Chronic Pain Hub", "Chronic pain", "Guide",
 [("Malady Wise", "/"), ("Conditions", "/conditions/"), ("Chronic pain", "/chronic-pain/")], hub,
 [("Is chronic pain real?", "Yes. All pain is made by the brain to protect you, and in chronic pain the nervous system has become extra sensitive. The pain is real even when scans look normal."),
  ("Does pain mean I'm doing damage?", "Not usually in chronic pain. The alarm has become oversensitive, so hurt doesn't always mean harm. Gentle, gradual movement is safe for most people. Check with your GP if you have new symptoms."),
  ("What is the best treatment for chronic pain?", "A combination: understanding pain, regular graded exercise, pacing, sleep, psychological therapies and staying connected. Medicines help some people a little but rarely work on their own."),
  ("Can chronic pain go away?", "It can improve a lot, and some people become pain-free. The nervous system can become less sensitive with time, movement and the right support."),
  ("Should I take opioids for chronic pain?", "They usually give small benefits at best for long-term pain and carry risks that build up over time. If you already take them, don't stop suddenly; ask your GP about a supported plan.")],
 [("Chronic pain in Australia (AIHW)", "https://www.aihw.gov.au/reports/chronic-disease/chronic-pain-in-australia"),
  ("Kent P et al. Cognitive functional therapy for chronic low back pain (RESTORE). Lancet 2023", "https://pubmed.ncbi.nlm.nih.gov/37146623/"),
  ("Ashar YK et al. Pain reprocessing therapy for chronic back pain. JAMA Psychiatry 2022", "https://pubmed.ncbi.nlm.nih.gov/34586357/"),
  ("Busse JW et al. Opioids for chronic noncancer pain. JAMA 2018", "https://pubmed.ncbi.nlm.nih.gov/30561481/"),
  ("Mathieson S et al. Pregabalin for sciatica. NEJM 2017", "https://pubmed.ncbi.nlm.nih.gov/28328324/"),
  ("ACI Pain (NSW Health)", "https://aci.health.nsw.gov.au/chronic-pain")],
 [("Fibromyalgia", "/fibromyalgia/"), ("Back pain", "/back-pain/"), ("Sciatica", "/sciatica/"), ("Amitriptyline", "/medicines/amitriptyline/")],
 audience="Patient", about_type="MedicalCondition")

reg("/chronic-pain/", "Chronic Pain Hub", ["Bones and joints", "Brain and nerves"], ["/fibromyalgia/", "/back-pain/", "/sciatica/", "/medicines/amitriptyline/"],
    "How long-term pain works, what helps, a flare plan and a quick explainer.", "chronic pain persistent pain sensitisation pacing flare plan pain science hurt harm")
