# Tuberculosis fact sheet (19 Nov 2026): #1 AU Google health trend after the new national TB strategic plan.
WHO = ("WHO: Tuberculosis fact sheet", "https://www.who.int/news-room/fact-sheets/detail/tuberculosis")
CDC = ("Australian CDC: New national tuberculosis strategic plan released", "https://www.cdc.gov.au/newsroom/news-and-articles/new-national-tuberculosis-strategic-plan-released")
MJA = ("MJA 2026: Not gone but often forgotten (TB in Aboriginal and Torres Strait Islander communities)", "https://www.mja.com.au/journal/2026/224/9/not-gone-but-often-forgotten-action-needed-to-address-tuberculosis-in-aboriginal-and-torres-strait-islander-communities")

fact("tuberculosis",
 "Tuberculosis (TB): Symptoms, Tests, Treatment and Risk in Australia",
 "Tuberculosis explained: latent TB v active TB, symptoms like a cough over 3 weeks and night sweats, who's at risk in Australia, testing, 4 to 6 months of treatment, and the BCG vaccine.",
 "Tuberculosis (TB)", "tuberculosis",
 "TB is a bacterial infection that usually affects the lungs. It’s the world’s deadliest single infectious disease, but it’s uncommon in Australia and curable with a full course of antibiotics. Many people carry a sleeping (latent) infection that never causes illness.",
 h2("Latent v active TB", [
   "<b>Latent TB infection:</b> the bacteria are in the body but kept in check. No symptoms, not contagious. About a quarter of the world’s population has it.",
   "About <b>5 to 10%</b> of people with latent TB go on to develop active disease, most often in the first couple of years, or when the immune system is weakened.",
   "<b>Active TB disease:</b> the bacteria are multiplying and causing illness. TB in the lungs can spread through the air when someone coughs."]) +
 h2("Symptoms of active TB", [
   "A cough lasting <b>more than 3 weeks</b>, sometimes coughing up blood",
   "Fevers and <b>drenching night sweats</b>",
   "Weight loss, tiredness and poor appetite",
   "Chest pain or breathlessness",
   "TB can also affect lymph glands (painless lumps in the neck), bones and spine, kidneys and the brain"]) +
 h2("Who’s at risk in Australia", [
   "Australia has one of the lowest TB rates in the world: around <b>5 to 6 cases per 100,000</b> people a year.",
   "Most cases are in people born in countries where TB is common, often years after arriving, when latent infection wakes up.",
   "Aboriginal and Torres Strait Islander communities and parts of the Torres Strait have higher rates.",
   "Others at higher risk: close contacts of someone with TB, people with HIV, diabetes, kidney failure or on immune-suppressing medicines (including biologics and steroids), and some healthcare workers.",
   "A new national TB strategic plan (2026–2030) focuses on reducing these inequities."]) +
 h2("Tests", [
   "<b>Latent TB:</b> a blood test (IGRA, such as QuantiFERON) or a skin test (Mantoux). Neither tells latent from active TB on its own.",
   "<b>Active TB:</b> chest X-ray, and sputum (phlegm) samples for microscopy, culture and a rapid DNA test that also checks for rifampicin resistance.",
   "TB testing and treatment are free through state TB services in Australia, regardless of Medicare or visa status."]) +
 h2("Treatment", [
   "Active TB: usually <b>4 antibiotics</b> (isoniazid, rifampicin, pyrazinamide, ethambutol) for 2 months, then 2 for another 4 months.",
   "Most people stop being infectious within a few weeks of starting treatment.",
   "Finishing the full course is what cures TB and prevents drug resistance. Clinics often support people with directly observed treatment.",
   "Latent TB: a shorter course (e.g. 3 to 4 months of rifampicin-based treatment) cuts the chance of active disease later.",
   "Drug-resistant TB needs specialist treatment, now often all-oral 6-month regimens."]) +
 h2("Vaccine (BCG)", [
   "BCG protects babies and young children from severe TB such as TB meningitis. It’s less reliable in adults.",
   "In Australia it’s offered to some groups only, such as Aboriginal and Torres Strait Islander newborns in high-incidence areas and young children travelling to high-TB countries.",
   "BCG can cause a positive skin test; the blood test (IGRA) isn’t affected."]) +
 h2("When to see a doctor", [
   "A cough lasting more than 3 weeks, especially with fevers, night sweats or weight loss.",
   "Coughing up blood: see a doctor promptly.",
   "If you’re a close contact of someone with TB, your state TB service will usually contact you for testing."]),
 [("Is TB contagious?", "Only active TB in the lungs or throat spreads, through the air when someone coughs, usually after many hours of close contact. Latent TB isn’t contagious."),
  ("Can TB be cured?", "Yes. Most TB is cured with 6 months of antibiotics taken every day. Drug-resistant TB takes longer and needs specialist care."),
  ("How common is TB in Australia?", "Uncommon: around 5 to 6 cases per 100,000 people a year, among the lowest rates in the world. Worldwide, about 10.6 million people fell ill with TB in 2025."),
  ("What’s the difference between latent and active TB?", "Latent TB means the bacteria are present but inactive: no symptoms and not contagious. Active TB means the infection is causing illness and can spread if it’s in the lungs."),
  ("Is TB treatment free in Australia?", "Yes. State and territory TB services test and treat TB free, including for people without Medicare.")],
 [WHO + ("Global numbers, symptoms and treatment.",), CDC + ("Australia’s national TB strategic plan 2026–2030.",)],
 [WHO, CDC, MJA],
 [("Antibiotics", "/antibiotics/"), ("COPD", "/copd/"), ("Sarcoidosis", "/sarcoidosis/"), ("X-ray quiz", "/x-ray-quiz/")],
 groups=["Infections", "Lungs and breathing"], blurb="Latent v active TB, symptoms, who's at risk in Australia and how it's cured.",
 search="tuberculosis tb latent tb active tb cough night sweats quantiferon igra mantoux bcg vaccine rifampicin isoniazid consumption")
