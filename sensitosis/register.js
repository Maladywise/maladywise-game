/* Sensitosis prototype: registers itself on this page only, so the shared games.js stays untouched.
   When it goes live, move these entries into assets/games.js (see registry.json) and delete this file. */
(function () {
  var G = {
    id: "sensitosis", kind: "Test accuracy game", name: "Sensitosis", path: "sensitosis/", live: false, from: "2026-11-02",
    store: { stats: "sns-stats", day: "sns-day-", labels: ["450+", "350+", "250+", "<250"], distTitle: " (daily score)" },
    tagline: "Guess how good real medical tests are.",
    quip: "Every test lies sometimes. Guess how often.",
    helpQuip: "No test is perfect. Some are hilariously far from it.",
    help: [
      "Each day brings one real test, from COVID RATs to the PSA.",
      "Slide two bars: out of 100 people WITH the condition, how many test positive? Out of 100 WITHOUT it, how many test negative?",
      "Closer guesses score more, up to 100 a test. Where studies disagree, anywhere in the range scores full marks.",
      "The reveal shows 100 people, who got caught, who got missed and who got a false alarm, with the source.",
      "Some tests have a bonus twist: if you test positive, what’s the chance you really have it?",
      "Difficulty rises through the week: Easy Mon-Tue, Medium Wed-Thu, Hard Fri-Sat, Genius Sun. New tests at midnight, Sydney time."
    ],
    accent: "#B5540C", accentDark: "#F2A35E",
    icon: '<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="17" width="32" height="14" rx="4"/><path d="M16 21v6M21 21v6" /><circle cx="31" cy="24" r="3" fill="#fff"/><path d="M8 40h32" opacity=".6"/><path d="M14 10l4 3M24 7v4M34 10l-4 3"/></svg>'
  };
  window.MW_GAMES = window.MW_GAMES || [];
  if (!MW_GAMES.some(function (g) { return g.id === G.id; })) MW_GAMES.push(G);
  window.MW_MASCOTS = window.MW_MASCOTS || {};
  if (!MW_MASCOTS.sensitosis) MW_MASCOTS.sensitosis = { name: "Tally", what: "a head-counting meerkat", cheer: ["Counted all 100. You got it.", "Sharp eyes on the numbers.", "Fewer false alarms than most tests.", "I’d trust your gut over a Kernig’s.", "Specific and sensitive. Rare combo.", "Tally ho. Nailed it.", "Standing guard, very impressed.", "That guess had a tight confidence interval.", "Head count: one genius.", "No false negatives here."] };
  window.MW_ABOUT = window.MW_ABOUT || {};
  if (!MW_ABOUT.sensitosis) MW_ABOUT.sensitosis = ["Sensitosis is a daily guessing game about how good real medical tests are. Each day brings one test, from COVID RATs and mammograms to the PSA and the Ottawa ankle rules. Slide two bars to guess how many people with the condition the test catches, and how many without it it correctly clears. Then see 100 people on a grid, with the real figure and its source.", [["What are sensitivity and specificity?", "Sensitivity is how good a test is at catching people who have the condition: out of 100 who have it, how many test positive. Specificity is how good it is at clearing people who don’t: out of 100 without it, how many test negative. A test can be great at one and poor at the other."], ["Where do the numbers come from?", "Systematic reviews, Cochrane, NICE and similar sources, linked on every reveal. Studies often disagree, so we round, and where the spread is wide, any guess in the range scores full marks."]]];
})();
