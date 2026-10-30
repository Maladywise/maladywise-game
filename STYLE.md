# Malady Wise standing style rules (from Adam)

Every scheduled task and puzzle writer must read and follow this file. It overrides older, conflicting rules in task prompts. Adam updates it by asking Claude in chat.

## Healthy, regular representation (no quotas)
- NO fixed quotas. Ignore any "at least half" figure mentioned in a task prompt. The goal is healthy, regular, natural coverage, not 1 in 20 like before, and not forced into every puzzle.
- Rough guide: women should feature often (people, patients, discoveries, sport) across every game each week; the groups below should each appear several times a month across the games.
- Groups to cover regularly and respectfully:
  - Women: women scientists, doctors, nurses, inventors, athletes and historical figures (e.g. Rosalind Franklin, Gertrude Elion, Virginia Apgar, Tu Youyou, Françoise Barré-Sinoussi, Elizabeth Blackwell, Mary Seacole). Women's health: menopause, endometriosis, PCOS, pregnancy and postpartum, gynaecological and breast cancers, autoimmune disease, heart disease in women, the research gender gap. Dxtective patients are women often, not just for "women's" conditions.
  - Indigenous and First Nations health (global: Aboriginal and Torres Strait Islander, Māori, Native American, Sámi, Inuit etc.): achievements, history, health gaps, traditional knowledge where well-sourced.
  - Disability: conditions, accessibility, assistive tech, disabled clinicians, athletes and inventors, Paralympics.
  - Also: LGBTIQA+ health, low-socioeconomic and rural/remote health, refugee and migrant health, older people, global south and people of colour in medicine and history.
- Normie mode: same idea in history, inventions, sport and culture.
- Tone: warm and factual; sass targets the guess or the myth, never a group. No tokenism or stereotypes.

## Correct anatomical words are fine
- Morphemia (both modes) and other word games may include correct anatomical and physiological words even if some find them crude: anus, anal, vagina, vulva, penis, scrotum, semen, faeces, rectum, labia, clitoris, nipple, areola, orgasm, etc.
- Still exclude slurs, swearing and slang (e.g. crap, piss, boobs, tits).

## Health days in Normie mode
- On health-awareness days, Normie gets a light, basic version of the theme: Normie Triviosis on a layperson-friendly, weird-but-true angle (e.g. Stroke Day → your amazing brain; Radiology → X-rays and Marie Curie), plus one other Normie puzzle where it fits naturally. Fun, non-technical, respectful; skip "sensitive" and "au" days.

## Einstein and Genius must be genuinely hard
- Einstein puzzles in every game must be clearly harder than Genius: obscure but real and fair (specialist, archaic or rare terms; rare letters; no gimmes). If a doctor would get it in one look, it's not Einstein.
- Wordemic: take Einstein answers from tier 1 of wordemic/hard-bank.json first, Genius Sunday answers from tier 1 then tier 2, and Hard days may use tier 3. Remove each word from the bank once it's used. When the bank runs low, add similar words (obscure anatomy, archaic terms, histology, rare signs) and add every new answer to wordemic/words.txt.
- Every game has an Einstein tier, including Glimpsis, Opacitis, Panelysis, Arrhythmix, Cryptogenic and Grand Rounds. Daily games: about 1 day in 50. Weekly or twice-weekly games (Arrhythmix, Cryptogenic, Grand Rounds): about once every 6–8 weeks. When building puzzles, pick the next Einstein date for each game you build, set that entry's "difficulty" to "Einstein", and add the date to MW_EINSTEIN in assets/games.js (keep earlier dates).
- Image games (Glimpsis, Opacitis): Einstein = a subtle or rare finding, a sparse one-line context, five close lookalike options and hints that make you think rather than give it away.
