/* Game registry. Add a game here and it appears on the hub.
   live:false shows a "Coming soon" card. accent/accentDark are the card colours. */
window.MW_SITE = {
  name: "Malady Wise",
  sub: "Games",
  footer: "All puzzles are fictional/educational. General education, not personal medical advice.",
  home: "https://www.maladywise.com",
  quip: "Made by a GP who should probably be doing paperwork.",
  social: [
    ["X", "https://x.com/MaladyWise", "@MaladyWise", '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.9 2H22l-6.8 7.8L23 22h-6.2l-4.8-6.3L6.4 22H3.3l7.3-8.3L1 2h6.3l4.4 5.8zm-1.1 18h1.7L6.3 3.9H4.5z"/></svg>'],
    ["Ko-fi", "https://ko-fi.com/maladywise", "Buy me a coffee", '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3"/></svg>']
  ],
  house: { name: "Follow along", text: "New puzzles, fictional cases and the odd zebra. Follow @MaladyWise on X.", cta: "Follow on X", href: "https://x.com/MaladyWise", accent: "#6B5A93", accentDark: "#9C8CC4" }
};
/* Einstein days: the rare top tier (about 1 day in 50 per game). Dates in Sydney time. */
window.MW_EINSTEIN = { dx: ["2026-11-12"], wordemic: ["2026-11-04"], comorbix: ["2026-10-29"], morphemia: ["2026-11-08"], linkase: ["2026-10-25"], gridectomy: ["2026-11-15"], suturix: ["2026-10-22"], triviosis: ["2026-11-18"], zebritis: ["2026-11-10"] };
window.MW_GAMES = [
  { id: "dx", name: "Dxtective", store: { stats: "dxw-stats-v2", day: "dxw-day-" }, path: "dx/", live: true, featured: true,
    tagline: "Six clues, one diagnosis. Every wrong guess unlocks the next clue.",
    quip: "Zero excuses. The patient is fictional, your ego isn't.",
    helpQuip: "Typing \"stress\" or \"a virus\" will be judged. Harshly.",
    accent: "#4A3480", accentDark: "#8E74D6",
    icon: '<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="10" y="8" width="28" height="34" rx="4"/><path d="M18 8V6h12v2M24 18v12M18 24h12"/></svg>',
    help: [
      "Read the first clue and type your diagnosis.",
      "Each wrong guess (or Next clue) unlocks another clue. You get six.",
      "Difficulty rises through the week: Easy Mon-Tue, Medium Wed-Thu, Hard Fri-Sat, Genius Sun.",
      "A new case arrives at midnight, Sydney time. Past cases live in the archive.",
      "Rarely, about one day in 50, you get an Einstein. You will know it when you see it."
    ] },
  { id: "wordemic", name: "Wordemic", path: "wordemic/", live: true, store: { stats: "wde-stats", day: "wde-day-" },
    tagline: "Guess the five-letter medical word in six tries.",
    quip: "Your med school fees, finally paying off.",
    helpQuip: "Made-up words get rejected. And roasted.",
    accent: "#2E7D6B", accentDark: "#4FB39C",
    icon: '<svg viewBox="0 0 48 48" fill="#fff" aria-hidden="true"><rect x="3" y="18" width="7" height="12" rx="1.5"/><rect x="12" y="18" width="7" height="12" rx="1.5" opacity=".7"/><rect x="21" y="18" width="7" height="12" rx="1.5"/><rect x="30" y="18" width="7" height="12" rx="1.5" opacity=".7"/><rect x="39" y="18" width="7" height="12" rx="1.5"/></svg>',
    help: [
      "Guess the hidden five-letter medical word in six tries.",
      "Green: right letter, right spot. Yellow: in the word, wrong spot. Grey: not in the word.",
      "Every guess must be a real five-letter word.",
      "Difficulty rises through the week: Easy Mon-Tue, Medium Wed-Thu, Hard Fri-Sat, Genius Sun.",
      "A new word arrives at midnight, Sydney time.",
      "Rarely, about one day in 50, you get an Einstein. You will know it when you see it."
    ] },
  { id: "comorbix", name: "Comorbix", path: "comorbix/", live: true, store: { stats: "cmx-stats", day: "cmx-day-", labels: ["0", "1", "2", "3", "X"], distTitle: " (mistakes per win)" },
    quip: "Like a multidisciplinary meeting, but everyone agrees at the end.",
    helpQuip: "Red herrings are deliberate. Trust no one.",
    help: [
      "Find four groups of four terms that share something.",
      "Tap four tiles and press Submit. Get a group right and it locks in.",
      "You can make four mistakes. Three out of four gets a warning.",
      "Groups get trickier by colour: yellow, green, blue, then purple (usually wordplay).",
      "Difficulty rises through the week. New puzzle at midnight, Sydney time.",
      "Rarely, about one day in 50, you get an Einstein. You will know it when you see it."
    ],
    tagline: "Sixteen terms. Four hidden groups. Trust issues guaranteed.",
    accent: "#B23A6F", accentDark: "#E06E9E",
    icon: '<svg viewBox="0 0 48 48" fill="#fff" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="3"/><rect x="26" y="8" width="14" height="14" rx="3" opacity=".7"/><rect x="8" y="26" width="14" height="14" rx="3" opacity=".7"/><rect x="26" y="26" width="14" height="14" rx="3"/></svg>' },
  { id: "morphemia", name: "Morphemia", path: "morphemia/", live: true,
    store: { stats: "mph-stats", day: "mph-day-", labels: ["Stu", "Int", "Res", "Reg", "Con", "Pro", "Gen"], distTitle: " (best rank per day)" },
    quip: "Spelling bee for people who can pronounce sphygmomanometer.",
    helpQuip: "Inventing diseases is frowned upon. And rejected.",
    help: [
      "Make words of four or more letters from the seven on the hive.",
      "Every word must use the centre letter. Letters can be reused.",
      "4-letter words score 1. Longer words score one point per letter.",
      "Medical words score double. A pangram uses all seven letters and earns 7 bonus points.",
      "Long words earn bonuses: 8 letters +8, 9 letters +10, 10 letters +12, 11 or more +15.",
      "Climb the ranks: Student, Intern, Resident, Registrar, Consultant, Professor, Genius.",
      "Difficulty rises through the week. New letters at midnight, Sydney time.",
      "Rarely, about one day in 50, you get an Einstein. You will know it when you see it."
    ],
    tagline: "Seven letters. Build medical words. Intern to Genius, if you're lucky.",
    accent: "#B07A0C", accentDark: "#F0B940",
    icon: '<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round" aria-hidden="true"><path d="M24 6l15 8.5v17L24 40 9 31.5v-17z"/><path d="M24 17l6 3.5v7L24 31l-6-3.5v-7z" fill="#fff"/></svg>' },
  { id: "linkase", name: "Linkase", path: "linkase/", live: true, store: { stats: "lnk-stats", day: "lnk-day-", labels: ["0", "1", "2", "3", "4", "X"], distTitle: " (strikes per win)" },
    quip: "Word association, but with consequences.",
    helpQuip: "If it sounds like something a registrar would mutter, it's probably right.",
    help: [
      "Six words in a chain. You see the first and the last.",
      "Each word pairs with the next to make a common phrase: blood \u2192 pressure \u2192 sore \u2192 throat.",
      "Guess the hidden words from the top or the bottom. Tap a dashed word to switch ends.",
      "Each wrong guess reveals another letter and costs a strike. Five strikes and the chain snaps.",
      "New chain every day at midnight, Sydney time."
    ],
    tagline: "Blood, pressure, sore, throat. Link the chain without dropping it.",
    accent: "#2F5DA8", accentDark: "#6E98E0",
    icon: '<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" aria-hidden="true"><rect x="5" y="17" width="20" height="14" rx="7"/><rect x="23" y="17" width="20" height="14" rx="7"/></svg>' },
  { id: "gridectomy", name: "Gridectomy", path: "gridectomy/", live: true, store: { stats: "grx-stats", day: "grx-day-", labels: ["<1m", "<2m", "<3m", "<5m", "<10m", "10m+", "Help"], distTitle: " (solve time)" },
    quip: "Five by five. Small incision, big recovery.",
    helpQuip: "Speed counts. So does not peeking.",
    help: [
      "Fill the 5x5 grid. Every row and column is a word.",
      "Tap a square to select it. Tap it again, or the clue bar, to switch Across/Down.",
      "The arrows (or Tab) jump between clues. The timer pauses when you leave.",
      "Check marks wrong letters red. Reveal square or Give up means no clean solve.",
      "New grid every day at midnight, Sydney time."
    ],
    tagline: "A five-by-five crossword. Small grid, big ego bruise.",
    accent: "#3A3150", accentDark: "#CFC6E3",
    icon: '<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="#fff"><rect x="8" y="8" width="10" height="10"/><rect x="19" y="8" width="10" height="10"/><rect x="30" y="8" width="10" height="10"/><rect x="8" y="19" width="10" height="10"/><rect x="30" y="19" width="10" height="10"/><rect x="8" y="30" width="10" height="10"/><rect x="19" y="30" width="10" height="10"/><rect x="30" y="30" width="10" height="10"/></g></svg>' },
  { id: "suturix", name: "Suturix", path: "suturix/", live: true, store: { stats: "stx-stats", day: "stx-day-", labels: ["0", "1", "2", "3", "4+"], distTitle: " (hints per solve)" },
    quip: "Every letter belongs to something. Like a well-run ward.",
    helpQuip: "If you're stuck, find any random words. They buy hints.",
    help: [
      "Find the theme words. Together they use every letter, once.",
      "Drag across letters, or tap them one by one, then press Enter. Diagonals count.",
      "The spangram (gold) names the theme and runs edge to edge.",
      "Every 3 non-theme words earns a hint.",
      "New theme every day at midnight, Sydney time."
    ],
    tagline: "Find the theme words woven through the grid. Neat stitches only.",
    accent: "#C2553A", accentDark: "#EE8A6A",
    icon: '<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 30c6-12 12-12 18 0s12 12 18 0"/><path d="M12 18l4 6M22 20l2 7M32 22l-2 6M38 18l-3 6"/></svg>' },
  { id: "triviosis", name: "Triviosis", path: "triviosis/", live: true, store: { stats: "trv-stats", day: "trv-day-", labels: ["10", "8-9", "6-7", "4-5", "0-3"], distTitle: " (scores)" },
    tagline: "Ten questions. One theme. New every day.",
    quip: "Pub trivia, but the pub is a hospital and nobody\u2019s had a break.",
    helpQuip: "Wrong answers come with an explanation. Pretend you knew.",
    help: [
      "Ten multiple-choice questions on one medical theme.",
      "Tap an answer to lock it in. You\u2019ll see the right answer and a short explanation.",
      "Six or more is a pass. Ten is bragging rights.",
      "A new quiz every day at midnight, Sydney time. Past quizzes stay in the archive."
    ],
    accent: "#1F7A8C", accentDark: "#5BC0D3",
    icon: '<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 10h32v22H22l-9 7v-7H8z"/><path d="M20 17a4 4 0 1 1 5.5 3.7c-1 .4-1.5 1.2-1.5 2.3v.5"/><circle cx="24" cy="27.5" r=".8" fill="#fff"/></svg>' },
  { id: "zebritis", name: "Zebritis", path: "zebritis/", live: true, store: { stats: "zbr-stats", day: "zbr-day-", labels: ["25+", "18-24", "10-17", "1-9", "0"], distTitle: " (scores)" },
    tagline: "Name a correct answer. The rarer it is, the more it scores.",
    quip: "Think horses, and you\u2019ll score like one.",
    helpQuip: "Lung cancer causes clubbing. So does thyroid acropachy. Guess which scores more.",
    help: [
      "Three prompts a day, like \u2018Name a cause of finger clubbing\u2019.",
      "Type any correct answer. Common answers score 1 (\ud83d\udc34), then 3 (\ud83d\udc0e), 6 (\ud83e\udecf) and 10 for a true zebra (\ud83e\udd93). Each prompt has one unicorn (\ud83e\udd84): the single rarest answer, worth 20.",
      "Three tries per prompt. Answers not on our list don\u2019t count against you, they just use a try.",
      "Spelling is forgiven within reason. New prompts every day at midnight, Sydney time."
    ],
    accent: "#3C4A57", accentDark: "#A7B8C8",
    icon: '<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M9 13c6 3 10 3 15 0s9-3 15 0"/><path d="M9 24c6 3 10 3 15 0s9-3 15 0"/><path d="M9 35c6 3 10 3 15 0s9-3 15 0"/></svg>' },
  { id: "cryptogenic", name: "Cryptogenic", path: "cryptogenic/", live: true, weekly: true, from: "2026-10-24", weeklyLine: "A new cryptic every Saturday. Twenty-eight clues, every answer medical.", store: { stats: "cry-stats", day: "cry-day-", weekly: true, weekStart: 6, labels: ["Unaided", "1-3", "4-9", "10+"], distTitle: " (hints used)" },
    tagline: "A medical cryptic crossword. Every answer is medical. New every Saturday.",
    quip: "Every clue is fair. Most of them are rude about it.",
    helpQuip: "Stuck? Solve the easy anagrams first. They\u2019re the gateway drug.",
    help: [
      "Each clue has a straight definition at one end, plus wordplay that builds the same answer.",
      "Wordplay includes anagrams, hidden words, sound-alikes and words built from parts. The number in brackets is the answer length.",
      "Tap a square to choose it, tap again to switch across or down. Use \u2039 \u203a to move between clues.",
      "Check word and Reveal letter help if you\u2019re stuck. Solve a clue, then tap it in the list to see how it works.",
      "Progress saves automatically. A new cryptic every Saturday at midnight, Sydney time."
    ],
    accent: "#7A3E8C", accentDark: "#D59BE6",
    icon: '<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="26" height="26" rx="2"/><path d="M17 8v26M25 8v26M8 17h26M8 25h26"/><path d="M30 40l10-10 3 3-10 10h-3z" fill="#fff"/></svg>' },
  { id: "grandrounds", name: "Grand Rounds", path: "grandrounds/", live: true, weekly: true, weeklyLine: "A new quiz every Sunday. Twenty hard medical questions, no options.", store: { stats: "gdr-stats", day: "gdr-week-", weekly: true, weekStart: 0, labels: ["18-20", "14-17", "10-13", "5-9", "0-4"], distTitle: " (scores)" },
    tagline: "Twenty hard medical trivia questions. No options. New every Sunday.",
    quip: "Quiz yourself, or take on a colleague. No options to hide behind.",
    helpQuip: "No multiple choice to hide behind. Just you and your memory.",
    help: [
      "Twenty hard medical and medical-adjacent questions, ending with a brain-melter.",
      "Play solo, or pick Head to head: one reads aloud, the other answers.",
      "Tap Show answer, then mark who got it. Be honest. Or don\u2019t.",
      "Ten or more is a good Sunday. A new quiz every Sunday at midnight, Sydney time."
    ],
    accent: "#3B4C9B", accentDark: "#93A5F2",
    icon: '<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M30 8a14 14 0 1 0 10 22A12 12 0 0 1 30 8z"/><path d="M36 10v6M33 13h6"/></svg>' },
];
/* Games with a future 'from' date show as coming soon until then (Sydney time). */
(function () { var t; try { t = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney" }).format(new Date()); } catch (e) { t = new Date().toISOString().slice(0, 10); } window.MW_GAMES.forEach(function (g) { if (g.from && g.from > t) g.live = false; }); })();
