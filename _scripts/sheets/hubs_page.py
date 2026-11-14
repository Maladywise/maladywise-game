# /hubs/: every hub on the site, from data/hubs.json (the top menu shows the most-used topic hubs).
import json as _j
_H = _j.load(open("data/hubs.json", encoding="utf-8"))
body = '<p class="lede">Every hub on Malady Wise in one place. The most popular topic hubs also sit in the top menu, and that list updates itself each week.</p>\n'
for g in _H["groups"]:
    body += "<h2>%s</h2>\n<p>%s</p>\n<ul class=\"tx\">" % (g["t"], g["d"]) + "".join(
        '<li><b><a href="%s">%s</a></b>%s%s</li>' % (i["href"], i["t"], i["long"], " (Australia)" if i.get("au") else "") for i in g["items"]) + "</ul>\n"
body += '<p class="sass">Hubs: because nobody wants to click through 400 pages to find the one about their back.</p>\n'
page("/hubs/", "All Hubs: Pain, Fatigue, ADHD, GLP-1 and More",
 "Every Malady Wise hub in one place: pain, fatigue, ADHD and autism, GLP-1 medicines, conditions, medicines, blood tests, doctors' tools and research.",
 "All hubs", "Health topics", "Hub", [("Malady Wise", "/"), ("Hubs", "/hubs/")], body, [], [],
 [("Conditions", "/conditions/"), ("Medicines", "/medicines/"), ("For doctors", "/doctors/")], audience="Patient", about_type="MedicalWebPage")
