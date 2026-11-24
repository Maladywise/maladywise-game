# Summer and holiday safety (24 Nov 2026). Run: python3 _scripts/gen_sheets.py _scripts/sheets/summer_nov26.py
HD_HEAT = ("Healthdirect: Heatstroke", "https://healthdirect.gov.au/heatstroke")
NSW_HEAT = ("NSW Health: Heat-related illness", "https://www.health.nsw.gov.au/environment/beattheheat/Pages/heat-related-illness.aspx")
BH_HEAT = ("Better Health Channel: Heat-related health problems", "https://betterhealth.vic.gov.au/health/healthyliving/heat-related-health-problems")
HD_SUN = ("Healthdirect: Sunburn", "https://www.healthdirect.gov.au/sunburn")
BH_SUN = ("Better Health Channel: Sunburn", "https://www.betterhealth.vic.gov.au/health/conditionsandtreatments/sunburn")
HD_BURN = ("Healthdirect: Burns and scalds", "https://healthdirect.gov.au/burns-and-scalds")
RCH_BURN = ("Royal Children’s Hospital Melbourne: Burns and scalds, prevention and first aid", "https://www.rch.org.au/kidsinfo/fact_sheets/Burns_and_scalds")
ACCC_BB = ("ACCC: Mandatory button battery laws commence", "https://www.accc.gov.au/media-release/businesses-on-notice-as-mandatory-button-battery-laws-commence")
PS_BB = ("Product Safety Australia: Button and coin batteries", "https://recalls.gov.au/standards/button-coin-batteries")
RLS_NDR = ("Royal Life Saving: National Drowning Report 2025", "https://www.royallifesaving.com.au/library/national-drowning-report/national-drowning-report-2025")
RLS_HOL = ("Royal Life Saving: Water safety warning ahead of the holidays (Dec 2025)", "https://www.royallifesaving.com.au/about/news-and-updates/news/2025/dec/Water-safety-warning-issued-ahead-of-holidays")
HD_FOOD = ("Healthdirect: This festive season, don’t give your loved ones food poisoning", "https://healthdirect.gov.au/blog/this-festive-season-do-not-give-your-loved-ones-food-poisoning")
SUMMER = "heat summer holiday Christmas safety"

fact("heatstroke", "Heatstroke and Heat Exhaustion: Signs, First Aid and Who’s at Risk",
 "Heat exhaustion vs heatstroke: the warning signs, what to do straight away, who is most at risk in a heatwave, and how to stay cool. Heatstroke is an emergency: call 000.",
 "Heatstroke and heat exhaustion", "Heatstroke",
 "Heat exhaustion is the body struggling to cool down. Heatstroke is when cooling fails and body temperature climbs past about 40 °C: a medical emergency that can damage the brain, kidneys and heart.",
 "<h2>Tell them apart</h2>\n<ul><li><b>Heat exhaustion:</b> heavy sweating, pale clammy skin, thirst, headache, dizziness, nausea, muscle cramps, feeling weak. Still alert.</li>"
 "<li><b>Heatstroke:</b> confusion, slurred speech, strange behaviour, fainting or a seizure. Very hot skin, which may be dry or still sweaty. This is the dangerous one.</li></ul>\n"
 "<p class=\"callout\"><b>Call 000 for heatstroke.</b> Confusion in the heat is heatstroke until proven otherwise. Start cooling while you wait: cooling fast saves lives.</p>\n"
 "<h2>First aid</h2>\n<ul><li>Move to shade or air conditioning and lie down with legs raised.</li><li>Remove extra clothing. Wet the skin with cool water and fan hard.</li>"
 "<li>Ice packs or cold wet towels on the neck, armpits and groin. For heatstroke in a fit person (e.g. after sport), immersing the body in cold water is the fastest way to cool.</li>"
 "<li>Small sips of cool water if they’re alert and not vomiting. Nothing by mouth if they’re confused or drowsy.</li>"
 "<li>Heat exhaustion that isn’t better within an hour, or gets worse, needs medical help.</li></ul>\n"
 "<h2>Who’s most at risk</h2>\n<ul><li>Babies, young children, and people over 65 (especially living alone)</li><li>People with heart, kidney or lung disease, diabetes, or dementia</li>"
 "<li>Some medicines: fluid tablets, some blood pressure tablets, antipsychotics, some antidepressants and medicines with anticholinergic effects. Don’t stop them, but ask your GP or pharmacist about hot weather.</li>"
 "<li>Outdoor workers, athletes and anyone exercising in the heat; people who are pregnant</li></ul>\n"
 "<h2>Staying cool</h2>\n<ul><li>Drink water regularly, before you feel thirsty; go easy on alcohol.</li><li>Plan activity for early morning or evening. Shade, hats and light, loose clothes.</li>"
 "<li>Cool showers, damp cloths and fans. Spend the hottest hours somewhere air-conditioned (a library, shopping centre or cinema) if home is hot.</li>"
 "<li><b>Never leave children or pets in a parked car</b>, even for a minute: the inside heats far faster than you’d expect.</li><li>Check on older neighbours and relatives during a heatwave.</li></ul>\n",
 [("What’s the difference between heat exhaustion and heatstroke?", "Heat exhaustion causes heavy sweating, weakness, dizziness and nausea, but the person stays alert. Heatstroke is more severe: body temperature rises above about 40 °C and the brain is affected, causing confusion, collapse or seizures. Heatstroke is an emergency: call 000."),
  ("What should I do for someone with heatstroke?", "Call 000, move them somewhere cool, remove extra clothing, and cool them fast with water, fanning and ice packs on the neck, armpits and groin. Cold-water immersion is fastest in young, fit people."),
  ("Who is most at risk in a heatwave?", "Older people, babies and young children, people with heart, lung or kidney disease or diabetes, people on some medicines such as fluid tablets, and people working or exercising outdoors."),
  ("How much water should I drink in hot weather?", "Drink regularly through the day so your urine stays pale. People with heart or kidney failure who have a fluid limit should ask their doctor what’s right for them.")],
 [("NSW Health: Beat the heat", NSW_HEAT[1], "Signs, first aid and keeping cool")],
 [HD_HEAT, NSW_HEAT, BH_HEAT],
 [("Sunburn", "/sunburn/"), ("Drowning: staying safe in the water", "/drowning/"), ("Alcohol", "/alcohol/")],
 groups=["Travel and outdoors"], blurb="Confusion in the heat is heatstroke until proven otherwise: call 000 and cool fast.", search="heatstroke heat stroke heat exhaustion heatwave hot weather " + SUMMER)

fact("sunburn", "Sunburn: How to Treat It, When to See a Doctor and How to Prevent It",
 "Sunburn treatment that helps, what to avoid, signs of a severe burn or sun poisoning that need a doctor, and how to prevent sunburn in Australia’s UV.",
 "Sunburn", "Sunburn",
 "Sunburn is a radiation burn from ultraviolet (UV) light. It usually settles in a week, but every burn adds to your skin cancer risk, especially in childhood.",
 "<h2>Treating sunburn</h2>\n<ul><li>Get out of the sun and cool the skin with a cool shower or damp cloths.</li><li>Moisturiser or aloe vera gel can soothe. Avoid ‘-caine’ numbing creams, which can irritate.</li>"
 "<li>Paracetamol or ibuprofen for pain (follow the packet). Drink extra water.</li><li>Leave blisters alone; don’t pop them. Loose, soft clothing over burnt skin.</li>"
 "<li>Stay out of the sun until it has healed.</li></ul>\n"
 "<h2>See a doctor if</h2>\n<ul><li>Blistering covers a large area, or the face, hands or genitals</li><li>Fever, chills, headache, vomiting, confusion or fainting (signs of heat illness)</li>"
 "<li>A baby under 12 months is sunburnt</li><li>Signs of infection: spreading redness, pus or worsening pain after a few days</li></ul>\n"
 "<h2>Preventing it</h2>\n<ul><li>Use sun protection whenever the UV index is 3 or above, which in much of Australia is most of the year, even on cloudy days.</li>"
 "<li><b>Slip, slop, slap, seek, slide:</b> clothing that covers, broad-spectrum SPF 50+ sunscreen, a broad-brimmed hat, shade, and sunglasses.</li>"
 "<li>Put sunscreen on 20 minutes before going out and reapply every 2 hours, and after swimming or sweating. Most people use too little: about a teaspoon per limb.</li>"
 "<li>Keep babies under 12 months out of direct sun.</li><li>Solariums are banned in Australia for good reason; there’s no safe tan.</li></ul>\n",
 [("How do you treat sunburn fast?", "Cool the skin with a cool shower or damp cloths, use a moisturiser or aloe vera gel, take paracetamol or ibuprofen for pain, drink water, and stay out of the sun. Don’t pop blisters."),
  ("When is sunburn serious?", "See a doctor for large areas of blistering, sunburn with fever, chills, vomiting or confusion, sunburn in a baby, or signs of infection."),
  ("Does sunburn cause skin cancer?", "Yes. UV damage adds up over a lifetime, and sunburn, especially in childhood, raises the risk of melanoma and other skin cancers."),
  ("Can you get sunburnt on a cloudy day?", "Yes. UV passes through cloud. Check the UV index: protect your skin whenever it’s 3 or above.")],
 [],
 [HD_SUN, BH_SUN],
 [("Melanoma", "/melanoma/"), ("Skin cancer", "/skin-cancer/"), ("Sunspots", "/sunspots/"), ("Heatstroke", "/heatstroke/")],
 groups=["Skin", "Travel and outdoors"], blurb="Cool, soothe and stay out of the sun; see a doctor for big blisters, fever or a sunburnt baby.", search="sunburn sun burn blisters sunscreen UV " + SUMMER)

fact("burns-and-scalds", "Burns and Scalds First Aid: 20 Minutes of Cool Running Water",
 "Burns and scalds first aid: cool running water for 20 minutes, what not to put on a burn, when to go to hospital, and how to prevent burns at home and at the barbecue.",
 "Burns and scalds", "Burns and scalds",
 "The single most useful thing you can do for a burn is cool running water for 20 minutes. It helps even up to 3 hours after the burn.",
 "<h2>First aid</h2>\n<ol><li><b>Stop the burning.</b> Move away from the heat; for clothing on fire, stop, drop and roll.</li>"
 "<li><b>Cool running water for 20 minutes.</b> Tap water, not ice. Keep the rest of the person warm, especially children.</li>"
 "<li><b>Remove</b> jewellery and clothing near the burn, unless it’s stuck to the skin.</li>"
 "<li><b>Cover</b> loosely with cling wrap or a clean, non-stick dressing.</li><li><b>Pain relief:</b> paracetamol or ibuprofen.</li></ol>\n"
 "<h2>Never put on a burn</h2>\n<ul><li>Ice or iced water (can deepen the damage)</li><li>Butter, oil, toothpaste, flour or egg white</li><li>Fluffy cotton wool that sticks</li></ul>\n"
 "<h2>Get medical help if</h2>\n<ul><li>The burn is bigger than the person’s palm, or blisters, or looks white, charred or leathery</li>"
 "<li>It’s on the face, hands, feet, genitals or over a joint, or goes all the way around a limb</li><li>It’s a chemical or electrical burn, or the person breathed in smoke</li>"
 "<li>The person is a baby or young child, an older adult, or pregnant</li><li>Signs of infection later: spreading redness, swelling, pus or fever</li></ul>\n"
 "<p class=\"callout\"><b>Call 000</b> for large burns, burns to the airway (singed nose hair, a hoarse voice, coughing soot), electrical burns, or if the person is unwell.</p>\n"
 "<h2>Preventing burns</h2>\n<ul><li>Hot drinks are the most common cause of scalds in young children: a cuppa can scald a child long after it’s poured. Keep them out of reach and never drink one with a child on your lap.</li>"
 "<li>Turn pot handles inwards; keep children away from the barbecue, fire pits and campfires (coals stay hot for hours: put them out with water, not sand).</li>"
 "<li>Set hot water to no more than 50 °C at the tap in the bathroom; run cold water first in the bath.</li>"
 "<li>Sparklers and fireworks burn far hotter than a cooking flame.</li><li>Check your smoke alarms.</li></ul>\n",
 [("What is the best first aid for a burn?", "Cool running water for 20 minutes, as soon as possible and up to 3 hours after the burn. Then remove jewellery, cover loosely with cling wrap and get help if needed."),
  ("Should I put ice on a burn?", "No. Ice can make the damage deeper and can cause hypothermia in children. Use cool running tap water instead."),
  ("Should I pop a burn blister?", "No. Leave blisters alone and see a doctor or nurse, especially if they’re large or on the hands, face or feet."),
  ("When should a burn be seen in hospital?", "Burns bigger than the person’s palm, deep burns, burns to the face, hands, feet, genitals or joints, chemical or electrical burns, smoke inhalation, and burns in babies and young children.")],
 [("Royal Children’s Hospital: Burns and scalds", RCH_BURN[1], "Prevention and first aid for children")],
 [HD_BURN, RCH_BURN],
 [("Sunburn", "/sunburn/"), ("Button batteries", "/button-batteries/")],
 groups=["Skin", "Other"], blurb="Cool running water for 20 minutes, no ice, no butter; cover with cling wrap.", search="burns scalds burn first aid cool water BBQ " + SUMMER)

fact("button-batteries", "Button Batteries: Why Swallowing One Is an Emergency",
 "A swallowed button battery can burn through a child’s food pipe in 2 hours. Signs, what to do straight away, where button batteries hide at Christmas, and Australia’s safety rules.",
 "Button batteries", "Button battery ingestion",
 "A coin-sized lithium button battery stuck in a child’s food pipe can cause a severe chemical burn within 2 hours. Children may show no symptoms at first.",
 "<p class=\"callout\"><b>If you think a child has swallowed or put a button battery in their nose or ear, go to the emergency department straight away.</b> Call the Poisons Information Centre on 13 11 26 on the way for advice, or 000 if they have trouble breathing. Don’t make them vomit. Don’t wait for symptoms.</p>\n"
 "<h2>Possible signs</h2>\n<ul><li>Often none at first</li><li>Gagging, drooling, coughing or trouble swallowing</li><li>Vomiting (sometimes with blood), chest pain, refusing food</li>"
 "<li>Black or bloody poo later</li><li>A battery missing from a device or packet</li></ul>\n"
 "<h2>Where they hide, especially at Christmas</h2>\n<ul><li>Musical cards, flashing decorations, novelty toys and Christmas jumpers</li><li>Flameless candles and fairy lights</li>"
 "<li>Remote controls, car key fobs, kitchen and bathroom scales</li><li>Hearing aids, thermometers, watches and calculators</li><li>Loose spare batteries in drawers and the bin</li></ul>\n"
 "<h2>Keeping children safe</h2>\n<ul><li>Since June 2022, Australian law requires products with button batteries to have a secure battery compartment and the batteries to come in child-resistant packaging, with warnings.</li>"
 "<li>Check secondhand, imported and novelty products: they may not meet the rules. Tape compartments shut if they’re loose.</li>"
 "<li>Store spare batteries up high and locked away. Tape over used batteries and put them straight in an outside bin or a battery recycling point: ‘flat’ batteries can still burn.</li>"
 "<li>Teach older children that batteries aren’t toys.</li></ul>\n",
 [("What happens if a child swallows a button battery?", "If it lodges in the food pipe, it can create a current that causes a severe chemical burn within 2 hours, which can be fatal. Go to the emergency department straight away, even if the child seems well."),
  ("What should I do if my child swallowed a button battery?", "Go to the nearest emergency department immediately. Call the Poisons Information Centre on 13 11 26 for advice on the way, or 000 if they’re struggling to breathe. Don’t make them vomit."),
  ("Are flat button batteries still dangerous?", "Yes. ‘Dead’ batteries often hold enough charge to cause a burn. Tape them and put them straight in an outside bin or recycling point."),
  ("Which products contain button batteries?", "Remotes, key fobs, musical cards, flameless candles, novelty toys and decorations, hearing aids, scales, watches and thermometers, among many others.")],
 [("Product Safety Australia: Button and coin batteries", PS_BB[1], "The mandatory safety and information standards")],
 [ACCC_BB, PS_BB],
 [("Burns and scalds", "/burns-and-scalds/"), ("Gastro", "/gastro/")],
 groups=["Other"], blurb="A swallowed button battery can burn through the food pipe in 2 hours: go to the ED straight away.", search="button battery coin battery swallowed child poison toy Christmas " + SUMMER)

fact("drowning", "Drowning: How to Stay Safe in the Water This Summer",
 "Drowning prevention for summer: supervising children, pools, beaches, rivers and boating, alcohol and older swimmers, what drowning really looks like, and why CPR skills matter.",
 "Drowning: staying safe in the water", "Drowning",
 "Hundreds of people drown in Australia every year, with a spike over summer and the holidays. Drowning is fast and quiet: it rarely looks like the splashing and shouting in films.",
 "<h2>What drowning looks like</h2>\n<ul><li>Silent: no breath to spare for calling out</li><li>Head low in the water, mouth at water level, tilted back</li><li>Upright, with arms pressing down on the water rather than waving</li>"
 "<li>Glassy or empty eyes; not moving forward</li><li>A child who suddenly goes quiet in the water needs checking now</li></ul>\n"
 "<h2>Children</h2>\n<ul><li><b>Active supervision:</b> stay within arm’s reach of young children around any water, including baths, buckets and paddling pools. Put the phone away.</li>"
 "<li>Pool fences and gates must self-close and self-latch. Never prop the gate open. Empty paddling pools after use.</li>"
 "<li>Swimming lessons help, but they don’t make a child drown-proof.</li></ul>\n"
 "<h2>Adults</h2>\n<ul><li>Swim at patrolled beaches, between the red and yellow flags. Rips are the biggest beach hazard: if caught, float, raise an arm and wait for help, or swim parallel to the shore.</li>"
 "<li>Rivers, lakes and dams cause many drownings: cold water, hidden snags, strong currents and changing depths.</li>"
 "<li>Avoid alcohol and drugs around water, and never swim alone.</li><li>Wear a lifejacket when boating, kayaking or rock fishing.</li>"
 "<li>Older adults, especially men, are a growing group: health conditions, medicines and overconfidence all add risk.</li></ul>\n"
 "<h2>If someone is in trouble</h2>\n<ul><li>Call 000 (or alert a lifeguard). Throw something that floats rather than going in yourself.</li>"
 "<li>Once they’re out: if they’re not breathing normally, start CPR. Learn CPR: a refresher course takes a few hours and is worth it.</li>"
 "<li>Anyone pulled from the water who coughed, vomited or was confused should be checked by a doctor.</li></ul>\n",
 [("What does drowning look like?", "Usually quiet: the head is low in the water, the mouth at water level, the body upright, and the arms push down instead of waving. There’s often no shouting at all."),
  ("How do I keep children safe around water?", "Stay within arm’s reach of young children around any water, use compliant self-closing pool gates, empty paddling pools after use, and don’t rely on swimming lessons alone."),
  ("What should I do if caught in a rip?", "Stay calm and float, raise an arm to signal for help, or swim parallel to the shore until you’re out of the current, then swim back in."),
  ("Who is most at risk of drowning?", "Young children around pools and home water, men of all ages, older adults, and people swimming in rivers, lakes, dams or at unpatrolled beaches, especially after alcohol.")],
 [("Royal Life Saving: National Drowning Report", RLS_NDR[1], "Who drowns, where and why")],
 [RLS_NDR, RLS_HOL],
 [("Heatstroke", "/heatstroke/"), ("Marine stings", "/marine-stings/"), ("Alcohol", "/alcohol/")],
 groups=["Travel and outdoors"], blurb="Drowning is fast and silent: stay within arm’s reach of young children around any water.", search="drowning water safety pool beach rip swimming children " + SUMMER)

fact("christmas-food-safety", "Christmas Food Safety: Avoid Food Poisoning at Festive Feasts",
 "Avoid food poisoning this Christmas: thawing and cooking the turkey, the 2-hour rule, leftovers, prawns and seafood in the heat, foods to avoid in pregnancy, and when to see a doctor.",
 "Christmas food safety", "Food poisoning",
 "Summer heat, big batches of food and long lunches make the festive season peak time for food poisoning. A few habits prevent most of it.",
 "<h2>The big rules</h2>\n<ul><li><b>Keep cold food cold:</b> fridge at 5 °C or below. Don’t overpack it before Christmas; use eskies with ice for drinks.</li>"
 "<li><b>The 2-hour rule:</b> put perishable food back in the fridge within 2 hours, less on a hot day.</li>"
 "<li><b>Thaw in the fridge</b>, not on the bench. A large frozen turkey can take several days.</li>"
 "<li><b>Don’t wash raw poultry:</b> it splashes bacteria around the sink. Cook it through instead: 75 °C in the thickest part, checked with a meat thermometer.</li>"
 "<li><b>Separate</b> raw meat from salads and cooked food, with different boards and utensils.</li>"
 "<li><b>Leftovers:</b> cool, cover and refrigerate quickly; eat within 2 to 3 days; reheat until steaming hot.</li>"
 "<li><b>Seafood:</b> buy prawns and oysters last, keep them on ice, and refrigerate straight away.</li></ul>\n"
 "<h2>Extra care if you’re pregnant, older or have low immunity</h2>\n<ul><li>Listeria risk: avoid deli meats, cold cooked chicken, pre-cut melon, soft and blue cheeses, cold smoked salmon, raw seafood and pre-made salads unless freshly made or heated until steaming.</li>"
 "<li>Avoid raw egg in homemade desserts, eggnog and mayonnaise.</li></ul>\n"
 "<h2>See a doctor if</h2>\n<ul><li>Signs of dehydration: very little urine, dizziness, a dry mouth, or a baby with fewer wet nappies</li><li>Blood in the poo, high fever or severe tummy pain</li>"
 "<li>Vomiting that stops you keeping fluids down, or diarrhoea lasting more than a few days</li><li>You’re pregnant, elderly or have low immunity</li></ul>\n",
 [("How long can food be left out at Christmas?", "Put perishable food back in the fridge within 2 hours, and sooner on a hot day. Food left out longer should be thrown away."),
  ("Should I wash the turkey?", "No. Washing raw poultry spreads bacteria around the sink. Cook it until the thickest part reaches 75 °C instead."),
  ("How long are Christmas leftovers safe?", "Refrigerate them quickly, eat within 2 to 3 days, and reheat until steaming hot all the way through."),
  ("What should pregnant people avoid at Christmas?", "Foods with a listeria risk: deli meats, cold cooked chicken, pre-cut melon, soft and blue cheeses, cold smoked salmon, raw seafood and pre-made salads, plus raw egg desserts.")],
 [("Healthdirect: Festive food poisoning tips", HD_FOOD[1], "Food safety over the holidays")],
 [HD_FOOD],
 [("Gastro", "/gastro/"), ("Button batteries", "/button-batteries/")],
 groups=["Gut"], blurb="Keep cold food cold, use the 2-hour rule, and don’t wash the turkey.", search="food poisoning Christmas turkey leftovers prawns listeria 2 hour rule " + SUMMER)
