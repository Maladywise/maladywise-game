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
- Sass level: be liberal. Every fact sheet, medicine guide and hub gets at least 2 `<p class="sass">` lines with real bite, and more wherever there is room and it fits (no upper limit; tone down only for gentle topics) (aim at myths, hype, unhelpful advice-givers and the condition itself, never the patient). Example: "Feel like punching the next person who tells you to 'just try yoga'? Fair." Gentle topics (dementia, premature birth, life-threatening infection, poor-outlook cancers) get none. After regenerating pages run `python3 _scripts/sass_lines.py` (adds a lede line where missing); `--report` lists pages with fewer than 2.

## Correct anatomical words are fine
- Morphemia (both modes) and other word games may include correct anatomical and physiological words even if some find them crude: anus, anal, vagina, vulva, penis, scrotum, semen, faeces, rectum, labia, clitoris, nipple, areola, orgasm, etc.
- Still exclude slurs, swearing and slang (e.g. crap, piss, boobs, tits).

## Health days in Normie mode
- On health-awareness days, Normie gets a light, basic version of the theme: Normie Triviosis on a layperson-friendly, weird-but-true angle (e.g. Stroke Day → your amazing brain; Radiology → X-rays and Marie Curie), plus one other Normie puzzle where it fits naturally. Fun, non-technical, respectful; skip "sensitive" and "au" days.

## Beyond humans: animals, plants, fungi and bees (One Health)
- Puzzles and questions regularly stretch medicine past humans: animal medicine and vets, zoonoses, bees and pollinators, plant disease and plant medicines, fungi (including the human pathogens and the useful ones, like penicillin), venoms, parasites, marine life. Weird but true wins.
- Use them on matching days and news: e.g. World Wildlife Day (3 Mar), Fascination of Plants Day (18 May), World Bee Day (20 May), World Zoonoses Day (6 Jul), World Rabies Day (28 Sep), World Animal Day (4 Oct), plus animal and plant stories in the news (outbreaks in animals, bird flu, crop blights, new species, bee die-offs). Check data/health-days.json for the full list.
- Normie mode can use the plain, fun version (animal facts, plants, nature) with nothing medical.
- Current news nods: every daily build and the trending refresh work in a few nods to this week's health and science news (from data/trends.json and the latest Weekly Dose), themed sideways and never giving an answer away. Keep tragedies factual and kind.

## Einstein and Genius must be genuinely hard
- Einstein puzzles in every game must be clearly harder than Genius: obscure but real and fair (specialist, archaic or rare terms; rare letters; no gimmes). If a doctor would get it in one look, it's not Einstein.
- Wordemic: take Einstein answers from tier 1 of wordemic/hard-bank.json first, Genius Sunday answers from tier 1 then tier 2, and Hard days may use tier 3. Remove each word from the bank once it's used. When the bank runs low, add similar words (obscure anatomy, archaic terms, histology, rare signs) and add every new answer to wordemic/words.txt.
- Every game has an Einstein tier, including Glimpsis, Opacitis, Panelysis, Arrhythmix, Cryptoplexy and Grand Rounds. Daily games: about 1 day in 50. Weekly or twice-weekly games (Arrhythmix, Cryptoplexy, Grand Rounds): about once every 6–8 weeks. When building puzzles, pick the next Einstein date for each game you build, set that entry's "difficulty" to "Einstein", and add the date to MW_EINSTEIN in assets/games.js (keep earlier dates).
- Image games (Glimpsis, Opacitis): Einstein = a subtle or rare finding, a sparse one-line context, five close lookalike options and hints that make you think rather than give it away.

## Owner's name
- Never put the site owner's name anywhere on the site, in public files, commit messages, code comments or data notes. Use "Malady Wise" or "a Malady Wise GP".

## Neurology and psychiatry curiosities
- data/neuro-psych-bank.json holds ~60 checked seeds (Oliver Sacks cases, odd syndromes, psychiatric history). Puzzle writers (Triviosis, Grand Rounds, Zebritis, Dxtective, Word of the week, Cryptoplexy clues) should use at least 2–3 a month, spread across games, without repeating a seed within 3 months.
- data/weird-bank.json holds ~50 weird and wonderful conditions (scombroid, ciguatera, carotenaemia, foreign accent syndrome, purple urine bag syndrome…) plus starter questions. Use 2–3 a month across Triviosis, Grand Rounds, Zebritis and Dxtective; link the fact sheet when an item has a "page"; mark used items.
- Tone: fascinated and respectful. These are real people's experiences; never mock patients or make a diagnosis the punchline.
- Re-check each fact against a reputable source before publishing and write all wording fresh (no quoting books).

## Wordemic: Long Friday
- Every Friday (Sydney date) from 2026-11-06, Wordemic is "Long Friday" in both Medical and Normie modes. All other days stay 5 letters, 6 guesses. The game reads the length from the answer.
- From 2026-11-20 the Friday word length varies (owner request, Nov 2026): anywhere from 7 to 15 letters. Mix lengths across the month; don't repeat a length on consecutive Fridays; roughly one 14–15-letter "monster" a month (e.g. GASTROENTERITIS, ECHOCARDIOGRAM; Normie e.g. CONGRATULATIONS). 8 letters is still fine sometimes.
- Hard cap: no Wordemic answer is ever longer than 15 letters, Einstein included. Beyond that there are almost no real words, so players couldn't type a single guess except the answer.
- Tries scale with length (the engine does this): 5 letters 6, 6-9 letters 7, 10-13 letters 8, 14-15 letters 9.
- Friday answers are scheduled to 2027-03-26 in the monthly files (Normie too). When building a month, keep any existing Friday entries, fill the other days around them, sort by date, and keep numbering by date (Medical #1 = 2026-10-17; Normie #9 = 2026-11-01).
- From April 2027, write a new long answer for every Friday: Medical = a real medical word with Australian/British spelling (no US-only spellings), mixing familiar and harder words, ideally tied to the day's theme; Normie = an everyday non-medical word. Usual one or two-sentence "definition", plain English, facts checked.
- Guess lists: every length needs wordemic/wordsN.txt (lowercase, one per line, sorted); words6-7 and words9-15 are built from suturix/words.txt + dictionary/medical-au.txt (words8.txt as before). Add every new answer to its list. Run `python3 wordemic/check.py` after every Wordemic change (it must print OK).
- Einstein can land on a Friday: use a genuinely hard word (e.g. PSAMMOMA 2027-01-15, SYRINGOMYELIA 2027-02-26) and add the date to MW_EINSTEIN as usual.
- words8.txt sources: the site's Suturix and medical word lists, Webster's 2nd (public domain, via the MIT english-words package), plus plurals and verb forms of those words found in the wordfreq frequency list.

## Morphemia Max (Mondays, from 2026-11-16)
- Every Monday (Sydney date) Morphemia is **Morphemia Max** in Medical and Normie modes: nine letters (centre + 8 outer) on a round hive, words of 5+ letters, difficulty "Hard". Always spell it "Morphemia Max" (front-page tag "🐝 Max Monday"). Replaces the archived "Super Morphemia" idea.
- Puzzle format = the normal one plus `"min": 5` and `"variant": "max"`, with an 8-letter `outer`. The engine switches to the nine-letter hive automatically.
- When building a month, make every Monday a Max puzzle with `python3 morphemia/build_max.py YYYY-MM-DD:pangram:centre ...` (add `--normie` for Normie) after writing the normal days. Pangram = a word with exactly 9 distinct letters (Medical: a recognisable medical word, e.g. HAEMATOLOGY, AUDIOLOGIST, HIPPOCAMPUS; Normie: an everyday word, e.g. SNOWFLAKE, FLAMINGOS). Pick a centre that gives 30-110 words (the script prints the count). Keep Einstein days (MW_EINSTEIN.morphemia) as normal seven-letter Einstein puzzles, not Max.
- Scheduled to 2026-12-21 (Medical and Normie).

## Glimpsis: Glimpsathon Tuesday and practice (from 17 Nov 2026)
- Every Tuesday (Sydney date) from 2026-11-17 is **Glimpsathon** ("Ten on Tuesday"), in Medical and Normie modes: 10 images in one go, one pick each, one scored attempt, score out of 10 (time shown, not penalised). The normal daily Glimpsis still runs that day. Always spell it "Glimpsathon".
- Files: `glimpsis/puzzles/athon/YYYY-MM-DD.json` (Medical) and `glimpsis/puzzles/athon/normie/YYYY-MM-DD.json` (Normie): `{"date", "number" (#1 = 2026-11-17, +1 each Tuesday), "items": [10]}`. Each item uses the daily format minus hints: `difficulty`, optional one-line `context`, `img{url, source, page, author, licence, licence_url, alt}`, `answer`, `wrong[5]`, `why` (one line), `pearl` (short). Items ramp 3 Easy, 3 Medium, 3 Hard, 1 Genius.
- Images: `glimpsis/img/athon/YYYY-MM-DD-NN.jpg` and `glimpsis/img/athon/normie/YYYY-MM-DD-NN.jpg` (NN = 01–10; never descriptive names). Same "Image sources" rules as the daily: allowed licences only, look at every image, crop to the sign (no faces, children's faces or genitals), add " (cropped)" to the author.
- Rules: never reuse an image used anywhere in Glimpsis; no answer repeated within a Glimpsathon; no Glimpsathon answer repeated in any Glimpsathon within 90 days; a Glimpsathon answer may match a daily Glimpsis answer only if that daily was more than 60 days earlier (with a different image), and never the same day's or the next 7 days' daily answer. No giveaways and lookalike rules apply as for the daily.
- The monthly Glimpsis task fills every Tuesday's Glimpsathon to the end of next month, both modes. `python3 glimpsis/check.py` validates them (10 items, all fields, files exist, licences, uniqueness rules).
- **Sign spotting practice** (Normie: "Close-up spotting practice") replays 5 random past daily images a round (dates before today only), with no repeats in a session. It never counts towards stats, streaks or shares and needs no new content.

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
- **Lookalike traps (from Nov 2026).** On a themed day or a deep-dive day, an image or diagnosis game may show a close lookalike of the theme's classic sign, with the classic sign as a wrong option, e.g. arcus senilis with Kayser–Fleischer ring as a decoy. It must stay fair: the context fits the real answer, the hints point to the distinguishing feature, and the explanation teaches the difference. At most one trap per day, and not on Easy days.
- When a scheduled task swaps or builds puzzles for a themed day, it should aim for this spread (it may swap more than 1–2 puzzles on that day to do so), keeping answers unique across the past 180 days per game as usual.

## Animal ER (monthly, from Dec 2026)
- Once a month, Medical Triviosis is an "Animal ER" quiz: 10 funny, surprising, TRUE animal-medicine questions (animal physiology oddities, medicines and tests that come from animals, zoonoses, vet medicine). Normie Triviosis that day: funny animal bodies, no medicine.
- Put it on that month's animal-themed day in data/health-days.json if there is one (e.g. International Cheetah Day, World Penguin Day, International Cat Day); otherwise the first Saturday of the month. One other game that day gets an animal touch (e.g. a Zebritis prompt or a Comorbix group).
- Many "animal facts" online are myths: verify each with a reputable source. Funny, never cruel; no gore; don't repeat a fact used in the previous 6 months.

## Puzzle archives
- _scripts/build_archives.py writes /<game>/archive/ pages (past puzzles only, for Google). Any scheduled task that changes puzzle files or runs on a new week should run `python3 _scripts/build_archives.py` before committing, and commit the updated archive pages and sitemap.xml.
- Any task that changes data/health-days.json or data/world-days.json (famous non-health days: calendar-only, never puzzle themes) must run `python3 _scripts/build_days.py` (rebuilds the crawlable /days/ calendar list) and commit days/index.html and sitemap.xml. Also re-run it each January.

## Weekly Dose (Zebra Mail): Stackulus daily
- In "🧩 This week's puzzles", always include one line for the Stackulus daily challenge, e.g. "🫀 Stackulus daily: same organs for everyone, one scored go a day. Beat the world board: https://maladywise.com/stackulus/" (vary the wording each week; plain link, no date).
- In the week's X posts, at most one Stackulus daily nudge (e.g. Saturday), linking https://maladywise.com/stackulus/.

## Renamed games and folders (Nov 2026)
- Cryptogenic is now **Cryptoplexy**: puzzle files live in `cryptoplexy/` (puzzles.json, normie.json). The `cryptogenic/` folder only holds redirect pages; never write puzzles there. The game id in code stays `cryptogenic`, but player-facing text and links use Cryptoplexy and https://maladywise.com/cryptoplexy/.
- Organ Drop is now **Stackulus** at `stackulus/` (https://maladywise.com/stackulus/). `organ-drop/` and `dropsy/` are redirects only.
- Mergeon is the organ merge arcade game at https://maladywise.com/mergeon/.

## Mergeon weekly schedule (from 16 Nov 2026)
- Every day has a twist (Sydney date), in Medical and Normie modes. X tasks can tease the day's special (e.g. Saturday arcade posts); link https://maladywise.com/mergeon/.
  - **Mon:** Microgravity Monday (Normie: Moon Monday). Floaty pieces and a gentle drift.
  - **Tue, Thu, Sat:** a daily mutation picked by date (bouncy, slippery, narrow board, double chains, sneak peek, slow-mo merges, heavy). Shown as "Today's mutation".
  - **Wed:** Blood Bank Wednesday (Normie: Potluck Wednesday). Pieces carry blood groups (flavours) and merge only if compatible. O− is everyone's favourite donor.
  - **Fri:** Sick Day Friday (Normie: Grumpy Friday). Every organ is a bit poorly: bloodshot eye, coughing lungs, brain freeze.
  - **Sun:** Outbreak Sunday (Normie: Slick Sunday). Infections drain your score until you treat them.
- Also from 16 Nov: chains of 3+ merges fill a Fever meter (10 s of double points), a small "Saved!" bonus for pulling the pile back from the line, and an honest score tally at the end.
- Also daily: 3 "Ward round" goals (Normie: "Today's jobs") with a sticker for all 3, a Collection book with hidden bonus finds, Learn mode, and seasonal skins (Christmas 1–26 Dec, Halloween 25–31 Oct, Easter week).
- Teasers: playful, never mocking patients; no pressure to donate blood. Don't reveal hidden-find triggers beyond the in-game clues.

## Characters: default female
- When a human character's gender is a free choice (vets, doctors, nurses, bosses, staff, narrators, example clinicians), default to female. E.g. Dr Pokesworth, the Basil + Clover vet, is drawn as a woman, but the wording stays gender-neutral ("the vet", no he/she). Keep a natural mix in fictional patient cases.

## X posts: automated daily queue (from Nov 2026)
- Two slots a day via Typefully: **7:30am Sydney** (`"slot": "am"`, the default) for the weekly mix below, and **12:30pm Sydney** (`"slot": "noon"`) for **world health day posts** (from 12 Nov 2026, owner's request: X shouldn't be all puzzles and content). One post per slot.
- **Noon world health day posts.** For every priority 1–3 day (and rare-disease days) in the coming week, the Friday task writes a 3–5 post thread in the noon slot: post 1 names the day with one striking hook (no link), post 2 is the link (matching fact sheet, else `/days/#day-<id>`), then 1–3 posts of verified history, surprising facts, numbers and why it matters (who discovered it, how the day started, a famous trial, a trivia twist). Every number and history claim is verified against a primary or reputable source before queuing. Set `"card": true`. A week (e.g. AMR week) gets one post, on its first day. Skip it if the 7:30am post that day is already about the day. Gentle days (remembrance, violence, suicide): one short, respectful post, no sass, no hashtag. Trending health topics (from data/trends.json) can use a free noon slot the same way, with a fact sheet link. Ahpra/TGA-safe, no treatment advice.
- **Never two posts in one slot.** Before adding a post anywhere (queue or straight into Typefully with the MCP tools), list Typefully's scheduled drafts and `_social/queue.json` and use a free date and slot (a Typefully draft at 11am or later counts as the noon slot). A post made by hand in Typefully must also get a queue entry with its `typefully_id`, so automation sees the day as taken. The push script moves a queue entry off a taken date to the next free 7:30am slot (`"pin": true` makes it wait instead).
- Never post specialist or allied health directory pages (/specialists/) to X, and never name individual practitioners in posts. Games, fact sheets, deep dives and tools are fine. The push script refuses any post linking /specialists/.
- The Friday Weekly Dose task writes the next 7 days' posts (Sat–Fri; the first automated date is 16 Nov 2026 — earlier dates were scheduled by hand) into `_social/queue.json` as entries `{"date": "YYYY-MM-DD", "note": "...", "thread": ["post", ...]}` — one entry per date, skipping dates that already have an entry. Each post ≤ 280 characters (a link counts as 23). This overrides any older "only add/change" limits in that task: it may edit `_social/queue.json`.
- Never edit or delete entries that already have a `typefully_id` (already sent). Never put API keys in the repo or tasks; the GitHub Action uses the TYPEFULLY_API_KEY secret.
- **Image post + link reply (from Nov 2026).** X shows posts with links to far fewer people. So post 1 always has an image and NO link; the link goes in the first reply (post 2), e.g. "Play today's puzzle → https://maladywise.com/wordemic/?date=…". Write post 1 so it stands alone without the link. At most 1 hashtag per post. The script enforces this at send time (moves any link out of post 1 into a reply and picks the image: World Day card if `"card": true`, else the linked page's og:image, a generated game card, or the site share card), but write entries this way to start with: `"thread": ["post 1, no link", "Play today's puzzle → https://…", ...]`.
- Weekly mix: Mon world days of the week + ECG teaser; Tue deep dive (thread from that week's deep dive); Wed zebra case / Super Zebritis; Thu the weekly Short (video, automated; see below), else a research nugget from the Weekly Dose; Fri left BLANK (Zebra Mail is paused for months or longer: no newsletter or "subscribe" posts on X until the owner says otherwise); Sat arcade (Stackulus, Mergeon, Basil + Clover) or Cryptoplexy; Sun Grand Rounds + Normie week that was. A themed day overrides with that day's puzzle (dated link). Dated links for puzzle teasers, plain links for general posts. No mascot-quiz posts. Sass at hype, never patients. Ahpra/TGA-safe.
- The Friday email to the owner still lists the week's posts so they can be edited in Typefully before they go out.

## X posts: World Day cards (from Nov 2026)
- `_scripts/day_card.py` draws a 1200×675 picture card for a date's main day (same pick as the home-page box: priority 1–3 only, never sensitive days), using the day's existing blurb. No new facts go on cards.
- Priority 4–5 days (fun history nods like Carl Sagan's birthday) are never the main day: the home box shows them as a small quiet line, they never get themed puzzles, X cards or the evening trend refresh's main theme. They can still appear on /days/ and as an "Also" nod.
- Add `"card": true` to a queue entry to attach that date's card to its first post (instead of the linked page's image). The Friday task should do this on themed-day posts about that day.
- The Typefully Action also auto-fills any empty NOON slot (from 16 Nov 2026) that has a strong day with a short World Day post plus card (a fallback: hand-written noon threads with history and facts are better) (link in the reply), and writes it back to the queue. It only does so after that week's Friday batch is written, and never if Typefully already has a post scheduled that day, so the weekly mix always wins. Gentle days get a plain, respectful post (no sass, no hashtag).
- Preview: `python3 _scripts/typefully_push.py --dry-run --days 14` (saves the PNGs to a temp folder).

## X posts: weekly Short (vertical video, from Nov 2026)
- One Short a week, automated: `.github/workflows/shorts.yml` runs each Thursday morning and queues the NEXT Thursday's 7:30am Sydney post (if that day already has an entry: Friday, then Wed/Tue/Mon of that week; never two posts on one day, never two Shorts in one week). It runs before the Friday batch, which then skips that date. The Short replaces that Thursday's usual post.
- Series rotate week by week: Guess the ECG (Arrhythmix), Spot the sign (Glimpsis), Rarest answer wins (Zebritis). Code: `_scripts/shorts/` (1080×1920 H.264 MP4, ~20–25 s, Playwright frames + ffmpeg, repo fonts/mascots/ecg.js only).
- Past puzzles only: at least 7 days old on the post date, oldest unused first, never reused (`_social/shorts-log.json`). Never today's or future puzzles.
- Captions are burned in (no voice-over needed). No treatment pearls on screen: the reveal shows the explanation's diagnostic features ("Key features" / "What gives it away").
- Third-party images: only licences that allow reuse (public domain, CC0, CC BY, CC BY-SA, as recorded in the puzzle JSON), with the credit on screen and in the post. ECG cases are labelled "Fictional case · computer-generated ECG".
- Same X rules: video in the main post with no link, the game link in the first reply, at most 1 hashtag. Queue entries carry `"short": {"series": "ecg|sign|rarest", "puzzle_date": "YYYY-MM-DD"}`; `typefully_push.py` renders the MP4 at send time and uploads it (MP4s are never committed). Preview: `python3 _scripts/typefully_push.py --dry-run --days 14` or `python3 _scripts/shorts/shorts.py queue --dry-run --out /tmp/short`. Layout check: `python3 _scripts/shorts/shorts.py selftest`.

## World days ↔ fact sheets (from 12 Nov 2026)
- Each health day in data/health-days.json can carry `"page": "/slug/"`: our own matching fact sheet. The home page day box and Health Calendar then show "Read our fact sheet" (Medical mode only; the external "Learn more" stays on /days/), "Also:" days link to our sheet, and X posts and auto World Day posts link to it (typefully_push.site_link uses `page` first).
- Owner's request: build fact sheets ahead for upcoming world days. Each Friday, the task that writes the week's X posts checks priority 1–3 days in the next 3 weeks with no `page`. Where a useful patient topic exists (the condition, a test, a treatment decision such as /antibiotics/ for AMR week or /seeing-a-psychologist/ for Psychology Week), write the fact sheet in the usual template (verified facts, Australian sources, sources list, Updated date, no "Reviewed"), add it to the Conditions hub and MW_FACTS in site.js, set `page`, then run the normal page pipeline. Skip country/national days, remembrance and sensitive days.
- After adding pages, run `python3 _scripts/build_days.py` (and bump CSS_V/JS_V there when days.css/days.js change).

## Google Trends data (from 13 Nov 2026)
- Cloud tasks can't reach trends.google.com. A GitHub Action (.github/workflows/trends.yml, ~5:40am and ~6:40pm Sydney) runs `_scripts/trends_fetch.py` and saves `data/trends-google.json`: for AU, US and GB, `health` = the Trending now Health category (past 24–48h), `all` = every category, `rss` = the public top list. Read that file; never try to fetch Google Trends from a task.

## Trending themes (from Nov 2026)
- A daily evening task (7:43pm Sydney) re-themes TOMORROW's puzzles from Google Trends. Main theme = tomorrow's world/health day if there's a clear one (priority 1–3 or who/specialty/zebra tag); otherwise the top medical trend. Then weave in as many other trending terms as fit (Medical: 3–6; Normie: 2–4 general trends).
- All the usual rules apply: no giveaways, 180-day uniqueness, weekday difficulty, sensitive topics handled kindly (no jokes about deaths/outbreaks), Normie non-medical, verified facts. Monthly/weekly tasks should not undo a trend swap already logged in data/trends.json "used" for that date.

## Animal names, phobias and -philias (from Nov 2026)
- A welcome recurring strand: baby animal names (joey, cygnet, cria, leveret), collective nouns (a pride, a mob, a murmuration) and the -phobia / -philia family. Aim for about 2–4 items a week across games, not every day.
- Mostly Normie (Triviosis questions, Comorbix groups, Zebritis closed-list prompts, Gridectomy clues, Suturix themes, Wordemic words). Medical mode gets the clinical side: specific phobia facts and treatment, symptom "-phobias" (photophobia, phonophobia, hydrophobia in rabies), haemophilia, -philias in blood counts and pathology (eosinophilia, thrombophilia) and microbe names (Haemophilus, pneumophila).
- Use the checked bank in data/word-banks/animals-phobias.json. Its flags matter: many collective nouns are fanciful medieval "terms of venery" or modern coinages (parliament of owls, dazzle of zebras, crash of rhinos), and joke phobias are coinages, not diagnoses. Say so in explanations rather than presenting them as standard usage. Trypophobia is not in DSM-5.
- Family-friendly only: no sexual paraphilias, ever.

## Task-prompt overrides (8 Nov 2026)
- Repeat rule: no answer repeated within **180 days** per game (medical and Normie). Any "90 days" in an older task prompt is out of date.
- Cryptoplexy files are `cryptoplexy/puzzles.json` and `cryptoplexy/normie.json`; never write to `cryptogenic/`. Puzzle links use `/cryptoplexy/?date=`.
- Mergeon, Stackulus and Basil + Clover are arcade games with no dated puzzle files; monthly builds skip them (they're live, not parked).
- X posts are automated through `_social/queue.json` (see "X posts" above). Any older prompt line saying the owner pastes posts by hand is out of date; the Friday email still lists the week's posts for review.
- Normie Glimpsis ("What is it?": close-ups, zoomed-in nature and objects, electron micrographs) and Normie Opacitis ("What's inside?": X-rays/CT of objects, animals and plants, never people) must be filled to the end of next month by the monthly Glimpsis and Opacitis tasks, alongside the medical files. Same image licence rules; images go in img/normie/YYYY-MM-DD.jpg.

## Authorship badge and GP review (from Nov 2026)
- Health pages (fact sheets, medicines, handouts, deep dives, tools, compare) show "Made with AI tools and overseen by an Australian GP · Updated <date>", linking to /about/#how-we-make-pages. Never write "written by" or "reviewed by a GP" on a page that hasn't been personally reviewed.
- When a Malady Wise GP has personally read and checked a page, mark it on the page's `<body>` (or `<main>`): `<body data-gp-reviewed="2026-11-08">` (the review date, YYYY-MM-DD). The badge then reads "✔ Reviewed by an Australian GP on 8 November 2026", and only then may the page's JSON-LD carry `reviewedBy` / `lastReviewed`. Re-date it after each re-review.
- To mark a page, ask Claude in chat: "mark /conditions/gout/ as GP reviewed today". Then run `python3 _scripts/headkit.py` before committing (it strips review claims from pages without the attribute).
- Page generators run `_scripts/headkit.py`'s fix_html() on their output (self-hosted fonts, deferred scripts, honest JSON-LD). New page templates should do the same.
- Page date lines say "Updated D Month YYYY", never "Reviewed …" (including deep dives and generated pages). Only pages the owner has personally reviewed carry data-gp-reviewed and the "Reviewed by an Australian GP" badge. Don't write "written/explained/reviewed by a GP" in copy or meta descriptions; "overseen by an Australian GP" is fine.

## New pages: footer links and share cards (from Nov 2026)
- The top menu is drawn by JavaScript, so crawlers that don't run it (Bing, AI crawlers) rely on plain links. After adding or rebuilding pages, run `python3 _scripts/static_nav.py` and commit the changed pages. It writes the footer's one hub row (Puzzles · Conditions · Medicines · Blood tests · Exercises · Tools · Quizzes · Specialists · Health days) between `<!-- static-nav -->` markers and tidies every `<footer class="site">` into one compact legal line (safe to run any time). There is no sitewide "See also" list, so every new page must be linked from the BODY of a relevant hub or page (hub list, related list, "For clinicians" block on /medical-games/ or /tools/). `python3 _scripts/static_nav.py --report` lists sitemap pages with no body inbound link (must be 0).
- Share cards: run `python3 _scripts/og_cards.py` too (needs Playwright + Pillow). It draws a 1200×630 card for each new fact sheet, medicine, blood test, exercise handout, deep dive, compare page, tool or specialist page into `assets/og/pages/<slug>.png` and points the page's og:image/twitter:image at it. Never point new health pages at the generic `assets/og/facts.png`.
- The home page, hubs, practice quizzes and every game have hand-designed cards from `python3 _scripts/key_cards.py` (deep-dive style: mascot plus a blank glimpse of the game, never a real answer). A new game or hub: add it to CARDS there, run it and look at the PNG. Games keep `assets/og/<game>.png`; the home card is `assets/share.png`.
- Then run `python3 _scripts/share_block.py` (safe any time). It makes the page's og:image Google's preferred picture: twitter:image matches, the main JSON-LD gets `"image"` (ImageObject 1200×630) and `"primaryImageOfPage"`, and a visible "Share this page" card with a share-link button goes between `<!-- share-card -->` markers (before Related on health pages, after the About block on games; hidden in print). /specialists/ get the JSON-LD only; /mental-health-check/ and archive pages are skipped.
- Order after adding pages: `og_cards.py` → `key_cards.py` → `share_block.py` → `static_nav.py`.
- The page generators (calckit, gen_bloodtests, gen_mh, gen_sq, quizkit, build_archives, build_days) already run the tag updates and share_block at the end (static_nav.postbuild); a brand-new page still needs `og_cards.py` to draw its card.

## Deep dive cards and diagrams (from Nov 2026)
- Every new deep dive puts an og-card JSON block in its `<head>`: `<script type="application/json" id="og-card">{"number": N, "fact": "…", "source": "…", "art": "<svg viewBox=\"0 0 420 400\">…</svg>"}</script>`.
  - number: the deep dive's number (as in "Deep dive #N").
  - fact: ONE striking fact already stated and cited on that page (no new claims), about 70 characters; source: its short citation, shown in brackets.
  - art: an original, simple flat SVG drawing of the topic in the site palette, with at most 1–2 tiny labels. No copied figures. Escape `</` as `<\/` inside the JSON.
- Every deep dive also has ONE inline SVG diagram (`<figure class="ddfig">`) in its Pathophysiology or Diagnosis section: accurate to the page's own cited content, site colours (CSS variables, so it works in dark mode), an aria-label describing it in words, and a one-line caption. Check at 390px that no text overflows its box.
- After publishing, run `python3 _scripts/og_cards.py` (draws the deep dive card and refreshes the /deep-dives/ collage card), then `python3 _scripts/static_nav.py`, and commit the cards and pages.
- /llms.txt is a plain-text map of the site for AI assistants (llmstxt.org). It is rebuilt daily by the days-soon GitHub Action; run python3 _scripts/build_llms.py after adding pages.
## Image sources (from 9 Nov 2026; overrides narrower source lists in older task prompts)
- **Licences:** only Public domain, CC0, CC BY or CC BY-SA (any version). Never NC, ND, "educational use only" or "free to view". Record title, author, source page, licence and licence URL; add " (cropped)" when cropped. CC BY-SA crops stay CC BY-SA.
- **Allowed sources** (check the licence on EACH item's own page, never assume):
  - Wikimedia Commons, including the "Images of Memorable Cases" collection (Herbert L. Fred and Hendrik A. van Dijk, CC BY).
  - CDC Public Health Image Library (public domain items only).
  - US government libraries: National Eye Institute (NEI) media, NIH/NCI Visuals Online, NIAID, NLM Digital Collections, USDA, NOAA and NASA (public-domain items only; some carry third-party copyright, so check).
  - Wellcome Collection (CC BY or public domain items; good for history and trivia).
  - Open-access journal figures, ONLY if the article page states CC BY or CC BY-SA (e.g. many Cureus, BMC, PLOS, Frontiers and MDPI case reports; search via PubMed Central's open-access subset or NLM Open-i). Use one clear panel, crop out labels that give the answer, and credit "Author et al., Journal Year, CC BY 4.0" with the DOI as the source page.
  - Flickr or museum open-access images only with a PD, CC0, CC BY or CC BY-SA licence shown on the item.
- **Never:** DermNet, Radiopaedia, EyeRounds (Iowa), AAO EyeWiki, LITFL, MSD/Merck Manuals, Medscape, UpToDate, StatPearls figures, textbook scans, Google Images results, or anything whose licence you can't see.
- **Consent and privacy still apply whatever the licence:** no identifiable faces (crop to the sign), no children's faces, no genitals, no names or record numbers, and no patient details. Take an image down if anyone asks.

## Images for search (from Nov 2026)
- Goal: the site's original diagrams rank in Google Images and Discover.
- **Descriptive filenames** for content images: keyword-led, lowercase, hyphenated, in a sensible folder, e.g. `/img/exercises/side-lying-shoulder-external-rotation.webp`, `/img/deep-dives/stroke-types-ischaemic-haemorrhagic-flowchart.webp`.
- **Never descriptive names for puzzle images.** Glimpsis, Opacitis, Dxtective, the X-ray, ECG and anatomy quizzes and any other guess-the-answer image keep date-based or neutral names, and stay out of the image sitemap, so filenames never reveal answers. Don't rename third-party (CC/PD) files that games depend on; keep their credits and licences.
- **Alt text** on every content image: specific, under 125 characters, no "image of". Add a figcaption where it helps.
- **An exported WebP for every original diagram.** Exercise figures (assets/exfig.js) and deep dive diagrams (`<figure class="ddfig">`) are exported by `python3 _scripts/export_diagrams.py` (Playwright + Pillow, 2x, about 1200px on the long side, under 80 KB; safe to re-run). It also:
  - puts a static `<figure class="exfig"><img loading="lazy" width height></figure>` in each handout exercise (exfig.js keeps it; print stays 1 A4 page);
  - keeps the deep dive inline SVG (dark mode) and adds a "Download this diagram" link in its figcaption;
  - adds an ImageObject JSON-LD block (`id="mw-image-ld"`: contentUrl, caption, licence https://maladywise.com/about/, creditText "Malady Wise") to each page;
  - writes **sitemap-images.xml** (the image sitemap entry for each page; listed in robots.txt).
- When adding a new exercise figure or deep dive, add its file name and alt text to EXERCISES or DEEP_DIVES in `_scripts/export_diagrams.py`, run it, then `python3 _scripts/site_check.py` (it checks the image sitemap's pages and files), and commit the images, pages and sitemap-images.xml.
- `_scripts/headkit.py` adds `<meta name="robots" content="max-image-preview:large">` to every indexable page (not noindex pages); run it on new pages as usual.

## Basil and Clover: character reference (from the owner's photos, Nov 2026)
- **Basil** (male, "smug fluffy white cat"):
  - Pure white long-haired cat. His **default look is the full long coat**: one big fluffy loaf with a plume tail. Sometimes he has a **lion cut** (fluffy mane, short-clipped body, fluffy "boots", plume tail); the game uses this at the Vet (sprites/*-lion.svg).
  - Signature poses: loaf on the cat tree, and sprawled along the TV unit with one back leg dangling off the edge.
  - Pink nose and pink inner ears, pale green eyes, long white whiskers.
  - Default face is half-lidded, smug, unimpressed. Grumpy hiss when annoyed.
  - Loaf pose on the cat tree is signature. Suits dramatic costumes (black and red vampire cape, velvet bow tie with a tiny skull).
- **Clover** (female, "the spicy little muffin"):
  - Long-haired **dilute calico/tortie**: blue-grey coat mottled with soft peach/cream. The face is split: one side grey, the other a peach blaze that runs from a streak on the forehead down beside the nose to the cheek, with fine dark flecks.
  - White bib and chest, white-tipped paws, dark grey nose, big yellow-green eyes.
  - Sits in cardboard boxes. Looks up hopefully at food. Small and round.
- Draw them as flat cartoons in the site palette (see /assets/mascots/basil.svg and clover.svg). Never use the owner's photos on the site; they're reference only.

## Anatomegaly balance and day themes (from 11 Nov 2026)
- January 2027 is already written with a named theme on every day. Don't overwrite it; the monthly build starts from February.
- Each day may have an optional `"theme"` field (shown after the date, e.g. "Hand Day"). Give most days one.
- Recurring themes: **Muscle Monday** every Monday, and a **Hand Day** about once a week. Other good themes: feet and ankles, pelvis and pelvic floor, neck and throat, face and jaw, hormone glands, back muscles, forearm, lower leg.
- Balance per month (Nov–Dec 2026 were heavy on brain and heart and light on muscles): aim for about 30% muscles and tendons, and regular foot, hand muscle, pelvis, neck, face and endocrine rounds. Brain and heart no more than ~10% each.
- Still no answer repeated within 6 weeks; use the diagram art where a part exists (check with LBL_PARTS in anatomegaly/art.js).
