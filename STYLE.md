# Malady Wise standing style rules

Every scheduled task and puzzle writer must read and follow this file. It overrides older, conflicting rules in task prompts. The site owner updates it by asking Claude in chat.

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
- Every game has an Einstein tier, including Glimpsis, Opacitis, Panelysis, Arrhythmix, Cryptoplexy and Grand Rounds. Daily games: about 1 day in 50. Weekly or twice-weekly games (Arrhythmix, Cryptoplexy, Grand Rounds): about once every 6–8 weeks. When building puzzles, pick the next Einstein date for each game you build, set that entry's "difficulty" to "Einstein", and add the date to MW_EINSTEIN in assets/games.js (keep earlier dates).
- Image games (Glimpsis, Opacitis): Einstein = a subtle or rare finding, a sparse one-line context, five close lookalike options and hints that make you think rather than give it away.

## Owner's name
- Never put the site owner's name anywhere on the site, in public files, code comments or data notes. Use "Malady Wise" or "a Malady Wise GP".

## Neurology and psychiatry curiosities
- data/neuro-psych-bank.json holds ~60 checked seeds (Oliver Sacks cases, odd syndromes, psychiatric history). Puzzle writers (Triviosis, Grand Rounds, Zebritis, Dxtective, Word of the week, Cryptoplexy clues) should use at least 2–3 a month, spread across games, without repeating a seed within 3 months.
- Tone: fascinated and respectful. These are real people's experiences; never mock patients or make a diagnosis the punchline.
- Re-check each fact against a reputable source before publishing and write all wording fresh (no quoting books).

## Wordemic: Long Friday
- Every Friday (Sydney date) from 2026-11-06, Wordemic is "Long Friday": an 8-letter answer and 7 guesses, in both Medical and Normie modes. All other days stay 5 letters, 6 guesses. The game reads the length from the answer, so just write an 8-letter word on Fridays.
- Friday answers are already scheduled to 2027-03-26 in the monthly files (Normie too). When building a month, keep any existing Friday entries, fill the other days around them, sort by date, and keep numbering by date (Medical #1 = 2026-10-17; Normie #9 = 2026-11-01). Displaced words go to reserve.json (puzzles/ or puzzles/normie/).
- From April 2027, write a new 8-letter answer for every Friday: Medical = a real medical word with Australian/British spelling (no US-only spellings), mixing familiar (MIGRAINE, CATARACT) and harder (DYSPNOEA, ADENOIDS); Normie = an everyday non-medical word. Usual one or two-sentence "definition", plain English, facts checked.
- Add every new 8-letter answer to wordemic/words8.txt (the 8-letter guess list; lowercase, one per line, sorted). Five-letter answers still go in words.txt.
- Einstein can land on a Friday: use a genuinely hard 8-letter word (e.g. PSAMMOMA, 2027-01-15) and add the date to MW_EINSTEIN as usual.
- words8.txt sources: the site's Suturix and medical word lists, Webster's 2nd (public domain, via the MIT english-words package), plus plurals and verb forms of those words found in the wordfreq frequency list.

## Zebritis: ranked statistics prompts
- Ranked statistics prompts ("top N", "most", "least", "leading", e.g. the 10 leading causes of death): give each answer its rank per the named source as a 5th element, plus a short value as a 6th if the source gives it readily: `["Stroke", 1, ["CVA"], "Stroke", 2, "6.8m deaths"]` (pad missing synonyms/title with `[]`/`null`). Add a short prompt-level `"src"` line, e.g. `"src":"WHO Global Health Estimates 2023"`. Ties share a rank. Never reorder `a` (saved games store answer indices). If the order cannot be confirmed from the source, leave the prompt unranked.

## Daily themes: spread across many games (from Nov 2026)
- A themed day should be felt across the whole site, not just Triviosis. On every `kind: "day"` entry in data/health-days.json (and the first day of a `week`), theme **at least 4–5 games** (Medical and, where there's a `normie` block, Normie too), using a broad web of associated ideas, not only the day's literal topic.
- Brainstorm the association web first (10–20 words/ideas), then spread them: e.g. **World Tsunami Awareness Day** → water, waves, islands, boats and ships, sun and heat, earthquakes, drowning (gentle), crush injury, cholera and leptospirosis, salt water, Japan, tides, seasickness, hypothermia, triage, rescue, lifeguards, sea creatures.
- Where each game fits:
  - **Triviosis:** all 10 questions on the theme (already standard).
  - **Wordemic / Morphemia / Suturix / Linkase:** answers, centre letters or word chains drawn from the web (e.g. WAVES, ISLET, VIBRIO, CHOLERA, SALINE; "boat → sickness → nausea").
  - **Gridectomy:** several clues on the theme, or a themed mini (e.g. TIDE, OAR, SALT).
  - **Comorbix:** one or two of the four groups on the theme (e.g. "things with tides", "water-borne infections").
  - **Zebritis:** one prompt on the theme (e.g. "Name a water-borne disease", "Name a country made up entirely of islands").
  - **Dxtective / Panelysis / Glimpsis / Opacitis / Sensitosis / Anatomegaly:** a fitting case, result, image, test or body part when one exists naturally (e.g. near-drowning, hyponatraemia, cholera rice-water stool, lung on X-ray). Don't force it.
  - **Cryptoplexy / Grand Rounds:** a few themed clues or questions when the theme lands on their day.
- Keep every themed item factually checked and kind. "gentle" days: respectful, no jokes about the condition. "sensitive" days: no themed puzzles. Fun and country days: playful, never mocking people.
- **No giveaways (from 8 Nov 2026).** The day's name must not hand players an answer. On a themed day, no guess-the-answer game (Dxtective, Wordemic, Panelysis, Glimpsis, Opacitis, Arrhythmix, Anatomegaly, Linkase, Zebritis unicorns, Gridectomy/Cryptoplexy answers, Comorbix group names) may have as its answer the day's namesake person, condition or object, or an obvious synonym. E.g. on Marie Curie's birthday Dxtective must not be Curie or radiation sickness; use something one step away (an X-ray finding, a Polish-born scientist's rival, glow-in-the-dark watch dials, a radiotherapy side effect). Triviosis may be openly themed because it's a quiz, but its questions shouldn't be guessable from the day title alone. Theme by association, sideways, never by the headline.
- When a scheduled task swaps or builds puzzles for a themed day, it should aim for this spread (it may swap more than 1–2 puzzles on that day to do so), keeping answers unique across the past 180 days per game as usual.

## Animal ER (monthly, from Dec 2026)
- Once a month, Medical Triviosis is an "Animal ER" quiz: 10 funny, surprising, TRUE animal-medicine questions (animal physiology oddities, medicines and tests that come from animals, zoonoses, vet medicine). Normie Triviosis that day: funny animal bodies, no medicine.
- Put it on that month's animal-themed day in data/health-days.json if there is one (e.g. International Cheetah Day, World Penguin Day, International Cat Day); otherwise the first Saturday of the month. One other game that day gets an animal touch (e.g. a Zebritis prompt or a Comorbix group).
- Many "animal facts" online are myths: verify each with a reputable source. Funny, never cruel; no gore; don't repeat a fact used in the previous 6 months.

## Puzzle archives
- _scripts/build_archives.py writes /<game>/archive/ pages (past puzzles only, for Google). Any scheduled task that changes puzzle files or runs on a new week should run `python3 _scripts/build_archives.py` before committing, and commit the updated archive pages and sitemap.xml.

## Weekly Dose (Zebra Mail): Stackulus daily
- In "🧩 This week's puzzles", always include one line for the Stackulus daily challenge, e.g. "🫀 Stackulus daily: same organs for everyone, one scored go a day. Beat the world board: https://maladywise.com/stackulus/" (vary the wording each week; plain link, no date).
- In the week's X posts, at most one Stackulus daily nudge (e.g. Saturday), linking https://maladywise.com/stackulus/.

## Renamed games and folders (Nov 2026)
- Cryptogenic is now **Cryptoplexy**: puzzle files live in `cryptoplexy/` (puzzles.json, normie.json). The `cryptogenic/` folder only holds redirect pages; never write puzzles there. The game id in code stays `cryptogenic`, but player-facing text and links use Cryptoplexy and https://maladywise.com/cryptoplexy/.
- Organ Drop is now **Stackulus** at `stackulus/` (https://maladywise.com/stackulus/). `organ-drop/` and `dropsy/` are redirects only.
- Mergeon is the organ merge arcade game at https://maladywise.com/mergeon/.

## Characters: default female
- When a human character's gender is a free choice (vets, doctors, nurses, bosses, staff, narrators, example clinicians), default to female. E.g. Dr Pokesworth, the Basil + Clover vet, is drawn as a woman, but the wording stays gender-neutral ("the vet", no he/she). Keep a natural mix in fictional patient cases.

## X posts: automated daily queue (from Nov 2026)
- One X post (or thread) per day, published at **7:30am Sydney** via Typefully. Don't plan any other daily slot.
- The Friday Weekly Dose task writes the next 7 days' posts (Sat–Fri) into `_social/queue.json` as entries `{"date": "YYYY-MM-DD", "note": "...", "thread": ["post", ...]}` — one entry per date, skipping dates that already have an entry. Each post ≤ 280 characters (a link counts as 23). This overrides any older "only add/change" limits in that task: it may edit `_social/queue.json`.
- Never edit or delete entries that already have a `typefully_id` (already sent). Never put API keys in the repo or tasks; the GitHub Action uses the TYPEFULLY_API_KEY secret.
- Weekly mix: Mon world days of the week + ECG teaser; Tue deep dive (thread from that week's deep dive); Wed zebra case / Super Zebritis; Thu a research nugget from the Weekly Dose; Fri Zebra Mail is out + subscribe; Sat arcade (Stackulus, Mergeon, Basil + Clover) or Cryptoplexy; Sun Grand Rounds + Normie week that was. A themed day overrides with that day's puzzle (dated link). Dated links for puzzle teasers, plain links for general posts. No mascot-quiz posts. Sass at hype, never patients. Ahpra/TGA-safe.
- The Friday email to the owner still lists the week's posts so they can be edited in Typefully before they go out.
