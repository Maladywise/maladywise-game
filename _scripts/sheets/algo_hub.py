# Algorithms hub. Keep the list in sync as algorithms are added.
ALGOS = [
 ("/algorithms/me-cfs-long-covid/", "ME/CFS and long COVID", "Exclusions, PEM and pacing, then evidence-graded options by symptom cluster, from guideline-backed to anecdotal."),
]
body = '<p class="lede">Step-by-step treatment paths for general practice, with every option graded from strong evidence to anecdotal. Built for the consult room: confirm, exclude, then treat what matters most.</p>\n<ul class="tx">' + "".join(
    '<li><span class="ev m">Algorithm</span><b><a href="%s">%s</a></b>%s</li>' % (u, t, d) for u, t, d in ALGOS) + "</ul>\n"
page("/algorithms/", "Treatment Algorithms for GPs (Evidence-Graded)", "Evidence-graded treatment algorithms for general practice: ME/CFS and long COVID, and more coming.",
 "Treatment algorithms", "Clinical algorithms", "For doctors", [("Malady Wise", "/"), ("For doctors", "/doctors/"), ("Algorithms", "/algorithms/")],
 body, [], [], [("Deep dives", "/deep-dives/"), ("Tools", "/tools/")], about_type="MedicalWebPage")
