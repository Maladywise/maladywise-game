"""Keep page titles and descriptions short enough for Google (18 Nov 2026).
Run last in the build pipeline (after share_block / build_llms). Idempotent.
- Titles over 60 characters lose the " | Malady Wise" suffix (Google shows the site name anyway).
- Titles still too long use a hand-written override below.
- Descriptions over 160 characters are cut back to the last full sentence (or clause) that fits."""
import re, glob, os, sys, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = {
 "22q11-deletion-syndrome": "22q11.2 Deletion (DiGeorge) Syndrome: Signs and Care",
 "algorithms/adhd": "ADHD Treatment Algorithm for GPs (Evidence-Graded)",
 "algorithms/autism": "Autism Support Algorithm for GPs (Evidence-Graded)",
 "algorithms/me-cfs-long-covid": "ME/CFS and Long COVID Algorithm for GPs (Evidence-Graded)",
 "biotin": "Biotin (B7): Deficiency, Hair Claims and Blood Test Errors",
 "bird-flu": "Bird Flu (H5N1) in People: Symptoms, Risk and Australia",
 "cervical-cancer": "Cervical Cancer: Screening, HPV, Self-Collection, Symptoms",
 "chromium": "Chromium: Workplace Exposure, Hip Implants, Supplements",
 "cobalt": "Cobalt Toxicity: Metal-on-Metal Hips, Supplements, Symptoms",
 "concussion": "Concussion: Symptoms, Red Flags and Return to Sport",
 "congenital-ptosis": "Congenital Ptosis (Droopy Eyelid in Babies)",
 "cte": "CTE (Chronic Traumatic Encephalopathy) and Head Impacts",
 "deep-dives/me-cfs": "ME/CFS (Chronic Fatigue Syndrome): Deep Dive",
 "female-infertility": "Female Infertility: When to Get Checked and Treatment",
 "folate": "Folate and Folic Acid: Deficiency, Pregnancy, Neural Tube",
 "frontotemporal-dementia": "Frontotemporal Dementia (FTD): Early Signs and Support",
 "influenza": "Flu (Influenza): Symptoms, Antivirals, Vaccine, Who’s at Risk",
 "lead": "Lead Poisoning: Sources, Blood Levels and Children",
 "lung-cancer": "Lung Cancer: Symptoms, New Screening Program, Treatment",
 "manganese": "Manganese Toxicity: Welders, Mining, Parkinson-Like Signs",
 "mascots/pebble": "Pebble the Penguin: Malady Wise Mascot",
 "mascots/ruby": "Ruby the Blood-Drop Vampire: Malady Wise Mascot",
 "me-cfs": "ME/CFS (Chronic Fatigue Syndrome): Symptoms and Pacing",
 "medicines/bupropion": "Bupropion (Zyban): Smoking, Depression and ADHD Uses",
 "medicines/dienogest": "Visanne (Dienogest) for Endometriosis: Benefits, Side Effects",
 "medicines/pde5-inhibitors": "PDE5 Inhibitors (Sildenafil, Tadalafil): ED and Prostate",
 "meningococcal": "Meningococcal Disease: Symptoms, Rash and Vaccines",
 "newborn-skin": "Newborn Skin Spots: Milia, Baby Acne, Rash, Stork Marks",
 "niacin": "Niacin (B3) and Pellagra: Rash, Diarrhoea, Confusion",
 "pancreatic-cancer": "Pancreatic Cancer: Symptoms, Risks and When to See a GP",
 "pantothenic-acid": "Pantothenic Acid (B5): Deficiency, Burning Feet, Acne",
 "pharmacogenomics": "Pharmacogenomic (DNA) Testing for Medicines: Pros and Limits",
 "prostate-cancer": "Prostate Cancer: PSA Testing, Symptoms and Treatment",
 "riboflavin": "Riboflavin (B2) Deficiency: Cracked Lips and Sore Tongue",
 "seeing-a-psychologist": "Seeing a Psychologist: Medicare Sessions, Costs, Starting",
 "specialists/aboriginal-and-torres-strait-islander-health": "Aboriginal Health Services in Newcastle and the Hunter",
 "specialists/immunology-and-allergy": "Allergy Specialists in Newcastle and the Hunter",
 "specialists/infectious-diseases": "Infectious Diseases Specialists, Newcastle and Hunter",
 "specialists/nerve-conduction-studies-emg-and-eeg": "Nerve Conduction, EMG and EEG in Newcastle and the Hunter",
 "specialists/obstetrics-and-gynaecology": "Obstetricians and Gynaecologists, Newcastle and Hunter",
 "specialists/occupational-therapy-adults": "Occupational Therapists (Adults) in Newcastle and Hunter",
 "specialists/occupational-therapy-children": "Paediatric OTs in Newcastle NSW and the Hunter",
 "specialists/respiratory-and-sleep-medicine": "Respiratory and Sleep Physicians in Newcastle and Hunter",
 "specialists/speech-pathology-children": "Children’s Speech Pathologists in Newcastle and Hunter",
 "stiff-person-syndrome": "Stiff Person Syndrome: Symptoms, Diagnosis, Treatments",
 "strabismus": "Strabismus (Squint) in Children: Lazy Eye and Treatment",
 "testicular-lumps": "Testicular Lumps and Self-Checks: What’s Normal",
 "thallium": "Thallium Poisoning: Hair Loss, Nerve Pain and History",
 "thiamine": "Thiamine (B1) Deficiency: Alcohol, Beriberi, Wernicke’s",
 "tools/tiredwise/evidence": "Tiredwise Evidence: ME/CFS, Long COVID, POTS and More",
 "umbilical-problems": "Belly Button Problems in Babies: Granuloma, Hernia",
 "vitamin-a": "Vitamin A: Deficiency, Night Blindness and Too Much",
 "vitamin-b6": "Vitamin B6: Deficiency, Toxicity and Supplement Doses",
 "vitamin-e": "Vitamin E: Deficiency Signs, Food Sources, Supplements",
}
def short_desc(d, n=160):
    if len(d) <= n: return d
    cut = d[:n]
    m = max(cut.rfind(". "), cut.rfind("? "), cut.rfind("! "))
    if m >= 90: return cut[:m + 1]
    m = max(cut.rfind(", "), cut.rfind("; "), cut.rfind(": "))
    if m >= 90: return cut[:m] + "."
    return cut[:cut.rfind(" ")].rstrip(",;:") + "…"
def run(verbose=False):
    nt = nd = 0
    for f in glob.glob(os.path.join(ROOT, "**/index.html"), recursive=True):
        rel = os.path.relpath(os.path.dirname(f), ROOT).replace(os.sep, "/")
        if rel.startswith((".", "_")) or "/archive" in rel: continue
        h = open(f, encoding="utf-8").read(); h0 = h
        m = re.search(r"<title>([^<]*)</title>", h)
        if m:
            t = html.unescape(m.group(1)); new = t
            if rel in T: new = T[rel]
            elif len(t) > 60: new = re.sub(r"\s*\|\s*Malady Wise( Mascots)?$", "", t)
            if new != t:
                esc = html.escape(new, quote=False)
                h = h.replace(m.group(0), "<title>" + esc + "</title>", 1)
                for prop in ('property="og:title"', 'name="twitter:title"'):
                    h = re.sub(r'(<meta ' + prop + r' content=")[^"]*(")', lambda mm: mm.group(1) + html.escape(new) + mm.group(2), h)
                nt += 1
        for pat in (r'(<meta name="description" content=")([^"]*)(")', r'(<meta property="og:description" content=")([^"]*)(")', r'(<meta name="twitter:description" content=")([^"]*)(")'):
            def fix(mm):
                d = html.unescape(mm.group(2)); s = short_desc(d)
                return mm.group(0) if s == d else mm.group(1) + html.escape(s) + mm.group(3)
            h = re.sub(pat, fix, h)
        if h != h0:
            if 'name="description"' in h and h0.count('name="description"') and re.search(r'<meta name="description" content="([^"]*)"', h).group(1) != re.search(r'<meta name="description" content="([^"]*)"', h0).group(1): nd += 1
            open(f, "w", encoding="utf-8").write(h)
    print(f"tidy_titles: {nt} title(s), {nd} description(s) shortened")
if __name__ == "__main__": run()
