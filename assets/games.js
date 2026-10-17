/* Game registry. Add a game here and it appears on the hub.
   live:false shows a "Coming soon" card. accent/accentDark are the card colours. */
window.MW_SITE = {
  name: "Malady Wise",
  sub: "Games",
  footer: "All puzzles are fictional/educational. General education, not personal medical advice.",
  home: "https://www.maladywise.com",
  quip: "Made by a GP who should probably be doing paperwork."
};
/* Einstein days: the rare top tier (about 1 day in 100 per game). Dates in Sydney time. */
window.MW_EINSTEIN = { dx: ["2026-11-12"], wordemic: ["2026-11-04"], comorbix: ["2026-10-29"], morphemia: ["2026-11-08"], linkase: ["2026-10-25"] };
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
      "Rarely, about one day in 100, you get an Einstein. You will know it when you see it."
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
      "Rarely, about one day in 100, you get an Einstein. You will know it when you see it."
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
      "Rarely, about one day in 100, you get an Einstein. You will know it when you see it."
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
      "Climb the ranks: Student, Intern, Resident, Registrar, Consultant, Professor, Genius.",
      "Difficulty rises through the week. New letters at midnight, Sydney time.",
      "Rarely, about one day in 100, you get an Einstein. You will know it when you see it."
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
  { id: "gridectomy", name: "Gridectomy", path: "gridectomy/", live: false,
    tagline: "A five-by-five crossword. Small grid, big ego bruise.",
    accent: "#3A3150", accentDark: "#CFC6E3",
    icon: '<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="#fff"><rect x="8" y="8" width="10" height="10"/><rect x="19" y="8" width="10" height="10"/><rect x="30" y="8" width="10" height="10"/><rect x="8" y="19" width="10" height="10"/><rect x="30" y="19" width="10" height="10"/><rect x="8" y="30" width="10" height="10"/><rect x="19" y="30" width="10" height="10"/><rect x="30" y="30" width="10" height="10"/></g></svg>' },
  { id: "suturix", name: "Suturix", path: "suturix/", live: false,
    tagline: "Find the theme words woven through the grid. Neat stitches only.",
    accent: "#C2553A", accentDark: "#EE8A6A",
    icon: '<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 30c6-12 12-12 18 0s12 12 18 0"/><path d="M12 18l4 6M22 20l2 7M32 22l-2 6M38 18l-3 6"/></svg>' }
];
