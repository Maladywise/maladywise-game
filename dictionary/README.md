# Medical word list (Australian spelling)

`medical-au.txt` is the extra medical vocabulary accepted in Malady Wise games.

Sources:
- **SPECIALIST Lexicon**, part of the SPECIALIST NLP Tools, U.S. National Library of Medicine (Lister Hill National Center for Biomedical Communications). Release file supplied October 2026. Used for British/Australian spelling variants (e.g. haemoglobin, oedema, tumour), plurals and verb forms, and the general word lists used to accept guesses. A United States Government product, provided without warranty; no endorsement by HHS, NIH or NLM is implied. Terms: https://lhncbc.nlm.nih.gov/LSG/Docs/termsAndConditions.html
- **hunspell-en-med-glut** (GPL v3), which merges OpenMedSpel (e-MedTools) and MTH-Med-Spel-Chek (MT-Herald): https://github.com/Glutanimate/hunspell-en-med-glut (licence in LICENSE-GPL3).

Changes made: single words only; US-only spellings dropped where an Australian/British form exists (fetus/fetal kept); regular plurals and verb forms generated from Lexicon inflection codes; proper nouns, rare fragments, offensive words and very low-frequency terms removed; a short supplement of newer drug names added.
