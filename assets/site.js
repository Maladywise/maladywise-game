/* Main-site home content (used when maladywise.com points here). */
window.MW_HOME = {
  tagline: "Curious medicine, explained.",
  intro: "Daily medical puzzles, fictional teaching cases and plain-English fact sheets from an Australian GP.",
  nav: [["Puzzles", "#puzzles"], ["Cases", "#cases"], ["Fact sheets", "#health"], ["About", "about/"]],
  sections: [
    { id: "cases", title: "Cases", note: "Fictional. Solve along.", items: [
      { href: "case-1/", tag: "Case #1", title: "Rusty joints", text: "52-year-old man. Tired for a year, aching knuckles, and a tan that never fades. What would you order?" }
    ] },
    { id: "health", title: "Fact sheets", note: "Plain English. Reviewed October 2026.", items: [
      { href: "iron/", tag: "Fact sheet", title: "Iron deficiency", text: "Symptoms, causes, tests and how to take iron tablets so they actually work." },
      { href: "b12/", tag: "Fact sheet", title: "Vitamin B12 deficiency", text: "Why it matters for your nerves, who's at risk, and how it's treated." }
    ] }
  ]
};
