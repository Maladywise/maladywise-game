#!/usr/bin/env python3
"""Sudokrine puzzle generator and checker.

Usage:
  python3 sudokrine/gen.py [START END]   # default 2026-10-26 2026-12-31; writes sudokrine/puzzles/YYYY-MM.json
  python3 sudokrine/gen.py --check        # re-verify every puzzle file (unique solution + logical grade + hidden word)
  python3 sudokrine/gen.py --words START END   # add or refresh the hidden-word layer on existing entries (grids untouched)
  python3 sudokrine/gen.py --cages START END   # add or refresh medical-number cages on existing entries (grids untouched)

Every puzzle is deterministic from its date (seeded PRNG), has exactly one solution (checked by a
brute-force counter) and is graded by a human-style logical solver. Difficulty by weekday:
  Mon/Tue Easy    6x6 (2x3 boxes)  singles only
  Wed/Thu Medium  6x6              needs locked candidates or pairs
  Fri/Sat Hard    9x9              needs locked candidates (pointing/claiming)
  Sun     Genius  9x9              needs pairs/triples (naked or hidden)
  Einstein        9x9              needs X-wing/swordfish, XY-wing or colouring chains (dates in EINSTEIN)
Entry: {date, number, difficulty, size, box:[rows, cols], puzzle, solution, clues, techniques, fact, nfact}
puzzle/solution are strings of digits (0 = empty); digit k shows as symbol k (Medical icon or Normie fruit).
From WORD_START entries also carry "word": {line, cells, m: {w, d, l}, n: {w, d, l}}: digit k shows as letter l[k-1]
(Medical m, Normie n), and the cells of the named line (rK, cK, d = main diagonal, a = anti-diagonal) spell w in order.
Fri-Sun from CAGE_START to CAGE_END entries also carry "cages": [{c: [cells], s: sum, m: [label, full], n: [label, full]}]:
killer-sudoku cages whose solution digits add up to s (no repeats), labelled with a well-known medical (m) or
everyday (n) number. Givens are unchanged, so the cages are a bonus head start and uniqueness/grade still hold.
"""
import datetime as dt
import json
import os
import random
import re
import sys
from itertools import combinations

HERE = os.path.dirname(os.path.abspath(__file__))
LAUNCH = "2026-10-26"
EINSTEIN = ["2026-11-21"]  # keep in sync with MW_EINSTEIN.sudokrine in assets/games.js
DIFF = {0: "Easy", 1: "Easy", 2: "Medium", 3: "Medium", 4: "Hard", 5: "Hard", 6: "Genius"}  # Python weekday(): Mon=0

# ---------- facts shown on the win screen (one per day, cycled) ----------
FACTS = [
    "Gertrude Elion shared the 1988 Nobel Prize in Medicine. Her drugs include allopurinol, azathioprine and aciclovir, and she never finished a PhD.",
    "Tu Youyou found artemisinin, a key malaria drug, after reading a 1,600-year-old Chinese remedy. She won the 2015 Nobel Prize in Medicine.",
    "Virginia Apgar devised the Apgar score in 1952. Every newborn is still checked with it one and five minutes after birth.",
    "Rosalind Franklin’s X-ray image, Photo 51, was key evidence for the double helix structure of DNA.",
    "Françoise Barré-Sinoussi co-discovered HIV in 1983 and shared the 2008 Nobel Prize in Medicine.",
    "Mary Seacole, a Jamaican-born nurse, ran the ‘British Hotel’ near Balaclava, feeding and nursing soldiers in the Crimean War.",
    "Elizabeth Blackwell became the first woman to earn a medical degree in the United States, in 1849.",
    "Adults have about 206 bones. Babies start with around 300, and many fuse as they grow.",
    "The stapes in the middle ear is the smallest bone in the body, about 3 mm long.",
    "René Laennec invented the stethoscope in 1816: a rolled-up tube of paper, so he didn’t have to put his ear to a patient’s chest.",
    "A red blood cell lives about 120 days and laps your circulation many thousands of times.",
    "In 1943 Mary Hunt found a mouldy cantaloupe in a Peoria market. Its strain of mould made far more penicillin and helped mass production.",
    "Stretched out, the DNA in a single human cell would be about 2 metres long.",
    "Your heart beats roughly 100,000 times a day.",
    "The cornea has no blood vessels. It gets most of its oxygen straight from the air.",
    "The brain is about 2% of body weight but uses around 20% of the body’s energy at rest.",
    "The World Health Organization declared smallpox eradicated in 1980, the first human disease wiped out.",
    "Dr Charles Drew, an African American surgeon, pioneered large-scale blood banking and plasma storage in the 1940s.",
    "Associate Professor Kelvin Kong, a Worimi man, became Australia’s first Aboriginal surgeon.",
    "Dr Māui Pōmare, the first Māori doctor, qualified in 1899 and led public health work in Māori communities.",
    "Susan La Flesche Picotte became the first Native American woman to earn a medical degree in the US, in 1889.",
    "Louis Braille, blind from the age of three, published his raised-dot reading system in 1829.",
    "The Paralympic movement grew from the Stoke Mandeville Games, organised by Dr Ludwig Guttmann in 1948.",
    "In 1847 Ignaz Semmelweis showed that handwashing with chlorinated lime cut deaths from childbed fever.",
    "Florence Nightingale used a ‘rose diagram’ to show that most Crimean War soldiers died of preventable disease, not wounds.",
    "Dorothy Hodgkin worked out the structures of penicillin, vitamin B12 and insulin. She won the 1964 Nobel Prize in Chemistry.",
    "Insulin was first given to a patient, 14-year-old Leonard Thompson, in Toronto in January 1922.",
    "Nettie Stevens discovered in 1905 that X and Y chromosomes determine sex.",
    "Cells taken from Henrietta Lacks in 1951, without her consent, became HeLa: the first human cell line to grow indefinitely.",
    "The average age of menopause in Australia is around 51.",
    "Heart attack symptoms in women can include breathlessness, nausea, and jaw, neck or back pain, not just chest pain.",
    "Skin is the body’s largest organ.",
    "The medical name for hiccups is singultus.",
    "Lady Mary Wortley Montagu promoted smallpox inoculation in Britain in 1721, decades before Jenner’s cowpox vaccine.",
    "The first X-ray of a human body part, in 1895, was of Anna Bertha Röntgen’s hand, wedding ring and all.",
    "Professor Fiona Wood co-invented spray-on skin for burns and was named Australian of the Year in 2005.",
    "Dr Dinesh Palipana was injured in a car crash as a medical student, went back, graduated, and became Queensland’s first quadriplegic medical intern.",
    "Oral rehydration solution, refined in Bangladesh and India, is a simple mix of salts and sugar that has saved millions of lives from diarrhoea.",
    "Research by Professor Fiona Stanley and Dr Carol Bower helped show that folate before pregnancy prevents neural tube defects such as spina bifida.",
    "Fingernails grow about 3 mm a month. Toenails are much slower.",
    "The Royal Flying Doctor Service made its first flight in 1928.",
    "A pill’s coating isn’t just for taste: enteric coatings protect some medicines from stomach acid, or the stomach from the medicine.",
    "Insulin was discovered in Toronto in 1921 by Frederick Banting and Charles Best, with James Collip and John Macleod.",
    "The word \u2018hormone\u2019 was coined in 1905 by physiologist Ernest Starling, from the Greek for \u2018to set in motion\u2019.",
    "Japanese chemist Jokichi Takamine isolated adrenaline in 1901, one of the first hormones ever purified.",
    "Rosalyn Yalow co-developed radioimmunoassay, letting labs measure tiny amounts of hormones like insulin. She won the 1977 Nobel Prize in Medicine.",
    "PCOS is one of the most common hormone conditions, affecting roughly 8 to 13% of women of reproductive age.",
    "Melatonin, sometimes called the hormone of darkness, is made by the pineal gland, mostly at night.",
    "The thyroid is a butterfly-shaped gland at the front of the neck. Its hormones help set how fast the body uses energy.",
    "‘Hello, my name is…’ began in 2013 with Dr Kate Granger, a British doctor with terminal cancer who noticed how many staff treating her never introduced themselves.",
    "A tiny missing piece of chromosome 22, the 22q11.2 deletion, affects roughly 1 in 4,000 births. It can touch the heart, the palate, the thymus and learning.",
    "In 1858 Florence Nightingale became the first woman elected to the Royal Statistical Society. Good nursing, it turns out, also needs good maths.",
    "The World Health Organization estimates outdoor air pollution caused about 4.2 million premature deaths worldwide in 2019.",
    "Gerty Cori became the first woman to win the Nobel Prize in Physiology or Medicine, in 1947, for working out how the body handles glycogen.",
    "Identical twins come from one fertilised egg that splits. Conjoined twins, roughly 1 in 50,000 to 200,000 births, form when that split is incomplete.",
    "Scottish obstetrician James Young Simpson first used chloroform as an anaesthetic in Edinburgh in 1847, after testing it on himself and his friends.",
    "With today’s HIV treatment, someone who keeps an undetectable viral load does not pass HIV to sexual partners. The slogan is U=U: undetectable equals untransmittable.",
    "In December 1982 Barney Clark became the first person to receive a permanent artificial heart, the Jarvik-7. He lived for 112 days.",
    "Dr Dinesh Palipana was injured in a car crash as a medical student, went back, graduated, and became Queensland’s first doctor with quadriplegia.",
    "Fast-twitch muscle fibres produce force quickly but tire fast. Slow-twitch fibres are the endurance crew.",
    "Volunteer blood donor James Harrison of Australia gave plasma more than 1,100 times. His anti-D antibodies helped protect an estimated 2.4 million babies.",
    "Finland has a ‘disease heritage’ of about 36 rare inherited conditions that are far more common there than elsewhere, thanks to its population history.",
    "At cruising altitude a jet’s cabin is pressurised to the equivalent of about 2,400 m above sea level. That’s why your ears pop on the way up.",
    "Tu Youyou became China’s first Nobel laureate in Physiology or Medicine in 2015, for discovering the malaria drug artemisinin.",
    "On the summit of Everest the air holds only about a third of the oxygen pressure found at sea level.",
    "The 1978 Declaration of Alma-Ata set the goal of ‘health for all’ and put primary health care at the centre of getting there.",
    "Surgeon Claude Beck first defibrillated a human heart in 1947, saving a 14-year-old boy whose heart went into fibrillation during surgery in Cleveland.",
    "In his final illness in December 1799, George Washington was bled of an estimated 40% of his blood. The likely culprit was acute epiglottitis.",
    "L. L. Zamenhof, the creator of Esperanto, worked as an eye doctor.",
    "Each human cochlea has about 15,000 hair cells. Once lost, they don’t grow back.",
    "Flights of more than four hours roughly double the risk of a blood clot in the legs, though the absolute risk stays low for most travellers.",
    "Studies show professional interpreters cut communication errors in hospitals, compared with using untrained helpers or family members.",
    "A 1992 paper proposed that Dickens’ Tiny Tim had distal renal tubular acidosis, a condition treatable in his day. It remains one doctor’s theory, but a nice one.",
    "Oral rehydration solution, refined in Bangladesh and India, is a simple mix of salts and sugar that has saved millions of lives from diarrhoeal disease.",
    "The vagus nerve, the longest cranial nerve, helps slow your heart a little each time you breathe out.",
    "Mathematician Srinivasa Ramanujan’s fatal illness was long blamed on tuberculosis. A 1994 review argued hepatic amoebiasis was more likely.",
    "In December 1954 Joseph Murray’s team in Boston transplanted a kidney from Ronald Herrick to his identical twin, Richard: the first lasting success. Murray later won a Nobel.",
    "About 60 to 70% of the energy a typical person burns goes on simply keeping the body running at rest. Christmas lunch is another matter.",
    "Clara Barton, born on Christmas Day 1821, nursed soldiers in the American Civil War and founded the American Red Cross in 1881.",
    "Marie and Pierre Curie announced the discovery of radium on 26 December 1898.",
    "‘Quarantine’ comes from the Italian ‘quaranta giorni’, the 40 days ships waited offshore during plague outbreaks.",
    "Rare mutations in the LRP5 gene give some people unusually dense bones. Mutant powers exist; they just rarely make the comics.",
    "Surgical rubber gloves began in about 1890 when surgeon William Halsted had a pair made for nurse Caroline Hampton, whose hands were raw from disinfectant.",
    "Women athletes tear their anterior cruciate ligaments several times more often than men in the same sports.",
    "Herman Boerhaave described the ruptured oesophagus in 1724 in a Dutch admiral who had made himself vomit after a feast. Boerhaave syndrome still bears his name.",
]
NFACTS = [
    "Honey can keep for decades, even centuries, because it’s low in water and quite acidic.",
    "Octopuses have three hearts and blue blood.",
    "Botanically, bananas are berries. Strawberries are not.",
    "Ada Lovelace published what is often called the first computer program, in 1843.",
    "Katherine Johnson checked the orbit calculations for John Glenn’s 1962 flight. He asked for her by name.",
    "Actor Hedy Lamarr co-invented a frequency-hopping system in 1942, an idea later echoed in Wi-Fi and Bluetooth.",
    "Sudoku began as ‘Number Place’ in a US puzzle magazine in 1979. Japan’s Nikoli named it Sudoku in 1984.",
    "A group of owls is called a parliament.",
    "Owls can’t move their eyes, so they turn their heads, up to about 270 degrees.",
    "A day on Venus is longer than its year.",
    "The Eiffel Tower can grow around 15 cm taller in summer as the iron expands.",
    "Cathy Freeman lit the cauldron at the Sydney 2000 Olympics, then won 400 m gold ten days later.",
    "Dame Whina Cooper led the 1975 Māori Land March to Wellington at the age of 79.",
    "Wilma Rudolph wore a leg brace as a child after polio, then won three sprint golds at the 1960 Olympics.",
    "Paralympian Kurt Fearnley crawled the 96 km Kokoda Track in 2009.",
    "Louise Sauvage won the Boston Marathon wheelchair race four times.",
    "The shortest war on record, between Britain and Zanzibar in 1896, lasted under an hour.",
    "Wombats produce cube-shaped poo.",
    "Sharks are older than trees, by tens of millions of years.",
    "The dot over a lowercase i or j is called a tittle.",
    "Scotland’s national animal is the unicorn.",
    "Kiwifruit used to be sold as ‘Chinese gooseberries’ until New Zealand growers renamed them in 1959.",
    "A pineapple plant takes around two years to grow a single pineapple.",
    "The ‘seeds’ on a strawberry are actually tiny fruits, each with a seed inside.",
    "The Mpemba effect, where hot water sometimes freezes faster than cold, is named after Tanzanian student Erasto Mpemba.",
    "Mary Anning helped uncover one of the first ichthyosaur fossils in 1811, when she was about 12.",
    "Marie Curie is the only person to win Nobel Prizes in two different sciences: physics and chemistry.",
    "Valentina Tereshkova became the first woman in space in 1963.",
    "Neville Bonner became the first Aboriginal member of Australia’s federal parliament in 1971.",
    "Evonne Goolagong Cawley, a Wiradjuri woman, won seven Grand Slam singles titles.",
    "Ash Barty, a Ngarigo woman, won Wimbledon in 2021.",
    "You can’t see the Great Wall of China from the Moon with the naked eye.",
    "Flamingos are pink because of pigments in the algae and shrimp they eat.",
    "Apples float because roughly a quarter of their volume is air.",
    "Lightning is about five times hotter than the surface of the Sun.",
    "Butterflies taste with their feet.",
    "Beethoven wrote his Ninth Symphony while almost completely deaf.",
    "Frida Kahlo painted many works from her bed, using an easel built to fit over it.",
    "Watermelon is about 92% water.",
    "Bubble wrap was first invented in 1957 as a textured wallpaper.",
    "Alan Turing, the code-breaker and computing pioneer, proposed his famous Turing test in 1950.",
    "Earth’s days are getting very slightly longer over time, as the Moon’s tides slow its spin.",
    "A blue whale’s heart weighs about 180 kg, the largest of any animal.",
    "Trischa Zorn, a blind American swimmer, won 55 Paralympic medals, 41 of them gold.",
    "A cheetah can reach about 100 km/h, but its sprints usually last well under a minute.",
    "Finland has about 3 million saunas for its roughly 5.6 million people.",
    "In 1921 Bessie Coleman became the first African American and Native American woman to hold a pilot’s licence. She had to go to France to earn it.",
    "Kiwifruit used to be sold as ‘Chinese gooseberries’ until New Zealand growers renamed them for export.",
    "The Curie family has won five Nobel Prizes: Marie twice, plus Pierre, Irène and Frédéric.",
    "In 1975 Junko Tabei of Japan became the first woman to reach the summit of Everest.",
    "An electric eel can produce a shock of up to about 860 volts.",
    "Mrs Winslow’s Soothing Syrup, sold for teething babies in the 1800s, contained morphine.",
    "‘Esperanto’ means ‘one who hopes’, from the pen name its inventor used.",
    "Beethoven’s exact birthday is unknown. Only his baptism, on 17 December 1770, is recorded.",
    "The Wright brothers’ first flight covered about 37 m, shorter than the wingspan of a Boeing 747.",
    "About 1 in 30 people worldwide live outside the country they were born in.",
    "Charles Dickens wrote A Christmas Carol in about six weeks.",
    "A small fluffy cumulus cloud can weigh around 500 tonnes.",
    "Dolphins sleep with one half of their brain at a time.",
    "1729 is the ‘taxicab number’: Ramanujan noted from his hospital bed that it’s the smallest number that is the sum of two cubes in two ways.",
    "Identical twins don’t have identical fingerprints.",
    "A gram of fat holds about 37 kJ of energy, more than double a gram of sugar.",
    "Isaac Newton was born on Christmas Day 1642, by the calendar England used at the time.",
    "Marie Curie’s notebooks are still radioactive and are kept in lead-lined boxes.",
    "In 1665 the English village of Eyam shut itself off to stop the plague spreading. Many villagers died, but the neighbouring towns were spared.",
    "Stan Lee’s real name was Stanley Lieber.",
    "Charles Goodyear had no link to the Goodyear tyre company. It was founded 38 years after he died and simply named in his honour.",
    "A golf ball typically has between 300 and 500 dimples.",
    "Kiribati’s Line Islands are among the first places on Earth to see in each new year.",
]

# ---------- hidden words (from WORD_START) ----------
# Each day from WORD_START uses the letters of a word with no repeated letters instead of symbols.
# One line of the solution (a row, column or main diagonal) spells the word in order; the other lines are
# checked for accidental rude words. Medical words lean endocrine, Normie words are everyday words.
# The day's theme (data/health-days.json) is applied sideways: never the day's namesake (No giveaways rule).
WORD_START = "2026-11-08"
WORDS = {  # date: (medical word, one-line meaning, normie word, one-line meaning)
    "2026-11-08": ("THYROXINE", "T4, the main hormone made by the thyroid gland. It helps set how fast the body uses energy.", "BLUEPRINT", "A detailed plan. Originally a white-on-blue copy of a technical drawing."),
    "2026-11-09": ("LUNATE", "A moon-shaped wrist bone. The name comes from luna, Latin for moon.", "COMETS", "Icy bodies that grow glowing tails as they near the Sun."),
    "2026-11-10": ("RETINA", "The light-sensing layer at the back of the eye.", "MAGNET", "An object that attracts iron and steel."),
    "2026-11-11": ("TRIAGE", "Sorting patients by urgency. From the French trier, to sort.", "POETRY", "Writing shaped for its sound and rhythm as well as its meaning."),
    "2026-11-12": ("PLEURA", "The thin double membrane wrapped around each lung.", "BRIDGE", "A structure that carries a road or path over an obstacle."),
    "2026-11-13": ("PROLACTIN", "A pituitary hormone best known for switching on breast milk production.", "WONDERFUL", "Extremely good; full of delight."),
    "2026-11-14": ("GLYCATION", "Sugar sticking to proteins. HbA1c measures it on haemoglobin to show average glucose over about three months.", "SUNFLOWER", "A tall plant whose seeds are packed in neat spirals."),
    "2026-11-15": ("LYMPHATIC", "Relating to lymph: the clear fluid and vessel network that drains tissues and carries immune cells.", "BIRTHDAYS", "The yearly anniversary of the day you were born."),
    "2026-11-16": ("FIBRES", "The parts of plant foods we can’t digest. They feed gut bacteria and help bowels and cholesterol.", "GARLIC", "A pungent bulb used in kitchens around the world."),
    "2026-11-17": ("LABOUR", "The process of giving birth, from the first contractions to delivery.", "FOREST", "A large area covered with trees."),
    "2026-11-18": ("MOULDS", "Fungi that grow in fine threads. One, Penicillium, gave us penicillin.", "INSECT", "A six-legged animal with a body in three parts."),
    "2026-11-19": ("ETHICS", "Moral principles. Medical ethics leans on autonomy, beneficence, non-maleficence and justice.", "PONDER", "To think something over carefully."),
    "2026-11-20": ("METABOLIC", "Relating to metabolism, the chemistry that turns food into energy and building blocks.", "PATCHWORK", "Needlework that joins small pieces of fabric into one larger design."),
    "2026-11-21": ("EUTHYROID", "Having normal thyroid function: neither overactive nor underactive.", "SOBRIQUET", "A nickname, often an affectionate or humorous one."),
    "2026-11-22": ("CHROMATIN", "DNA wound around proteins: the material chromosomes are made of.", "LABYRINTH", "A maze of winding paths. In Greek myth, it held the Minotaur."),
    "2026-11-23": ("GROWTH", "Getting bigger. In children it’s tracked on percentile charts and driven partly by growth hormone.", "SPIRAL", "A curve that winds around a centre, getting wider as it goes."),
    "2026-11-24": ("GOITRE", "A swollen thyroid gland, seen as a lump at the front of the neck.", "JIGSAW", "A picture cut into interlocking pieces to put back together."),
    "2026-11-25": ("LEPTIN", "A hormone made by fat cells that tells the brain how much energy is in storage.", "ORCHID", "A flower family with more than 25,000 species."),
    "2026-11-26": ("INHALE", "To breathe in. Adults do it roughly 20,000 times a day.", "PEDALS", "Levers you push with your feet, as on a bike."),
    "2026-11-27": ("BACTERIUM", "A single-celled microbe. One, Helicobacter pylori, won Marshall and Warren the 2005 Nobel Prize.", "DISCOVERY", "Finding or learning something for the first time."),
    "2026-11-28": ("STEROIDAL", "Relating to steroids, a hormone family that includes cortisol, oestrogen and testosterone.", "CHAMPIONS", "Winners of a competition, or people who stand up for a cause."),
    "2026-11-29": ("EMBRYONIC", "Relating to the embryo: roughly the first eight weeks of development after fertilisation.", "LIFEGUARD", "A trained swimmer who keeps watch at a beach or pool."),
    "2026-11-30": ("GLANDS", "Organs that make and release substances such as hormones, sweat or saliva.", "PLAIDS", "Woollen cloths with a criss-cross pattern, worn over the shoulder in Scotland."),
    "2026-12-01": ("THYMUS", "A gland behind the breastbone where T cells learn their job.", "CASTLE", "A fortified building, often from the Middle Ages."),
    "2026-12-02": ("AORTIC", "Relating to the aorta, the body’s largest artery, which leaves the heart.", "PISTON", "A part that slides up and down inside a cylinder, as in an engine or pump."),
    "2026-12-03": ("SPLINT", "A rigid support that holds an injured body part still while it heals.", "TANDEM", "A bicycle built for two riders."),
    "2026-12-04": ("HAMSTRING", "The three muscles at the back of the thigh, and a classic sprinting injury.", "QUICKSTEP", "A fast, lively ballroom dance."),
    "2026-12-05": ("PATHOGENS", "Germs that cause disease: bacteria, viruses, fungi and parasites.", "FARMHOUSE", "The main house on a farm."),
    "2026-12-06": ("LONGEVITY", "Long life. Diet, exercise, not smoking and social connection all play a part.", "SNOWFLAKE", "A single ice crystal. Most have six arms."),
    "2026-12-07": ("OXYGEN", "The gas cells need to make energy. Air is about 21% oxygen.", "RUNWAY", "The strip where planes take off and land."),
    "2026-12-08": ("PINEAL", "A pea-sized gland in the brain that makes melatonin, mostly at night.", "WALNUT", "A wrinkly nut in a hard shell."),
    "2026-12-09": ("CORTEX", "An outer layer, as in the adrenal cortex, which makes cortisol and aldosterone.", "FROSTY", "Covered in frost, or very cool in manner."),
    "2026-12-10": ("ULCERS", "Open sores. Most stomach ulcers turned out to be caused by H. pylori, a Nobel-winning find from Perth.", "MEDALS", "Metal discs awarded for an achievement."),
    "2026-12-11": ("BREATHING", "Moving air in and out of the lungs, about 12 to 20 times a minute for an adult at rest.", "LANDFORMS", "Natural features of the land: mountains, valleys, plateaus and plains."),
    "2026-12-12": ("IBUPROFEN", "A common anti-inflammatory painkiller, on the World Health Organization’s list of essential medicines.", "UNIVERSAL", "For everyone, everywhere."),
    "2026-12-13": ("PERFUSION", "Blood flow through a tissue or organ, bringing oxygen and taking waste away.", "SPARKLING", "Shining with flashes of light, or fizzy."),
    "2026-12-14": ("LANCET", "A small, sharp surgical blade, once used for bloodletting. Also the name of a famous journal.", "TONICS", "Drinks sold as pick-me-ups. Many old ones did nothing at all."),
    "2026-12-15": ("CORNEA", "The clear dome at the front of the eye. It does most of the eye’s focusing.", "PHRASE", "A small group of words that belong together."),
    "2026-12-16": ("TRAGUS", "The small flap of cartilage in front of the ear canal.", "MELODY", "A tune: a run of notes that makes a musical line."),
    "2026-12-17": ("VENOUS", "Relating to veins, which carry blood back to the heart.", "GLIDER", "An aircraft that flies without an engine."),
    "2026-12-18": ("INOCULATE", "To give a vaccine, or introduce something to build immunity.", "NEIGHBOUR", "Someone who lives next door or nearby."),
    "2026-12-19": ("RHEUMATIC", "Relating to rheumatism. Rheumatic fever can follow strep throat and scar heart valves.", "NIGHTCAPS", "Soft caps worn to bed, or a drink before sleep."),
    "2026-12-20": ("MENSTRUAL", "Relating to the monthly period, driven by the rise and fall of oestrogen and progesterone.", "HARMONIES", "Notes played or sung together that sound pleasing."),
    "2026-12-21": ("SPRAIN", "A stretched or torn ligament, often at the ankle.", "CANDLE", "A wax stick with a wick, burnt for light."),
    "2026-12-22": ("MEDIAN", "The middle value when results are put in order. Less swayed by outliers than the mean.", "SQUARE", "A shape with four equal sides, or a number multiplied by itself."),
    "2026-12-23": ("GRAFTS", "Tissue or organs moved from one place or person to another.", "DOUBLE", "Twice as much, or someone who looks just like another person."),
    "2026-12-24": ("AMYLIN", "A hormone released with insulin. It slows stomach emptying and helps you feel full.", "TINSEL", "Glittery strands for decorating Christmas trees."),
    "2026-12-25": ("POULTICES", "Soft, warm, moist dressings once put on wounds and sore spots, a staple of old-time nursing.", "FRUITCAKE", "A rich cake packed with dried fruit, a Christmas classic."),
    "2026-12-26": ("DOSIMETRY", "Measuring radiation dose, for radiotherapy planning and to keep staff safe.", "AFTERGLOW", "Light left in the sky after sunset, or a warm feeling after something good."),
    "2026-12-27": ("ANTISERUM", "Blood serum full of antibodies, given to protect against a disease or toxin.", "DUMPLINGS", "Small parcels of dough, often filled, that are steamed, boiled or fried."),
    "2026-12-28": ("STRAND", "One chain of DNA. The double helix has two, running in opposite directions.", "MASKED", "Wearing a mask, like many superheroes."),
    "2026-12-29": ("GLOVES", "Hand coverings. Surgical rubber gloves date from about 1890.", "BLIMPS", "Airships without a rigid frame."),
    "2026-12-30": ("SPINAL", "Relating to the spine or the spinal cord.", "BOGEYS", "Golf scores of one over par on a hole."),
    "2026-12-31": ("VOMITS", "Brings up the stomach’s contents. Violent retching can, rarely, tear the oesophagus.", "CHIMES", "Ringing bell sounds, like the ones at midnight on New Year’s Eve."),
}
# rude or offensive strings that must not appear (forwards or backwards) in any other row, column or diagonal
RUDE = ["fuk", "fuck", "fck", "shit", "cunt", "nigg", "nigr", "fag", "bitch", "whore", "slut", "rape", "nazi", "dick", "cock", "puss",
        "wank", "twat", "retard", "kike", "spic", "chink", "paki", "porn", "tit", "boob", "sex", "cum", "jizz", "dildo", "anus", "anal",
        "arse", "piss", "crap", "turd", "shag", "slag", "homo", "dyke", "tranny", "spaz", "poof", "coon", "gook", "wog", "negro", "jap",
        "wop", "hore", "fart", "poo", "butt", "bum", "knob", "prick", "pube", "milf", "thot", "hitler", "kkk", "pedo", "paedo", "pimp", "cok"]
# US spellings that must not be used (Australian/British spelling only)
US_ONLY = ["COLOR", "FIBER", "ESTROGEN", "CENTER", "ANEMI", "EDEMA", "LABOR", "TUMOR", "HUMOR", "LITER", "FETUS", "FECAL", "DIARRHEA",
           "ESOPHAG", "HEMO", "HEMA", "LEUKEMIA", "GYNECOL", "PEDIATR", "ORTHOPED", "MOLD", "BEHAVIOR", "FAVOR", "HONOR", "NEIGHBOR",
           "PLOW", "TIRE", "GRAY", "CHECKER", "PAJAMA", "ANESTHE", "CESAREAN", "SULFA", "SULFUR", "IZE", "YZE"]


def word_lines(g, sol):
    """Candidate lines: every row and column, plus a main diagonal when its digits are all different."""
    n = g.n
    out = [("r%d" % r, g.rows[r]) for r in range(n)] + [("c%d" % c, g.cols[c]) for c in range(n)]
    for name, cells in (("d", [i * n + i for i in range(n)]), ("a", [i * n + (n - 1 - i) for i in range(n)])):
        if len({sol[i] for i in cells}) == n:
            out.append((name, cells))
    return out


def letters_for(word, cells, sol, n):
    lt = [""] * n
    for k, i in enumerate(cells):
        lt[sol[i] - 1] = word[k]
    return "".join(lt)


def all_strings(g, sol, lt, skip):
    n = g.n
    lines = [g.rows[r] for r in range(n)] + [g.cols[c] for c in range(n)] + [[i * n + i for i in range(n)], [i * n + (n - 1 - i) for i in range(n)]]
    for cells in lines:
        if cells == skip:
            continue
        s = "".join(lt[sol[i] - 1] for i in cells).lower()
        yield s
        yield s[::-1]


def rude_hit(g, sol, lt, skip):
    for s in all_strings(g, sol, lt, skip):
        for w in RUDE:
            if w in s:
                return w
    return None


def word_ok(w, n):
    assert w.isalpha() and w.isupper() and len(w) == n, "%s: wrong length or not A-Z" % w
    assert len(set(w)) == n, "%s: repeated letter" % w
    for u in US_ONLY:
        assert u not in w, "%s: US spelling (%s)" % (w, u)


def add_word(e):
    """Add the hidden-word layer to an entry (dates from WORD_START). Same grid, same line, two alphabets."""
    if e["date"] < WORD_START:
        return e
    if e["date"] not in WORDS:
        raise SystemExit("no hidden word for %s: add one to WORDS" % e["date"])
    mw, md, nw, nd = WORDS[e["date"]]
    n = e["size"]
    g = GEOS[n]
    sol = [int(x) for x in e["solution"]]
    puz = [int(x) for x in e["puzzle"]]
    word_ok(mw, n)
    word_ok(nw, n)
    rng = random.Random("sudokrine-word|" + e["date"])
    lo, hi = (2, 4) if n == 9 else (1, 2)  # given letters already showing on the word line: a start, not a giveaway
    cands = word_lines(g, sol)
    rng.shuffle(cands)
    cands.sort(key=lambda c: 0 if lo <= sum(1 for i in c[1] if puz[i]) <= hi else 1 + abs(sum(1 for i in c[1] if puz[i]) - lo))
    for name, cells in cands:
        ml, nl = letters_for(mw, cells, sol, n), letters_for(nw, cells, sol, n)
        if rude_hit(g, sol, ml, cells) or rude_hit(g, sol, nl, cells):
            continue
        e["word"] = {"line": name, "cells": cells, "m": {"w": mw, "d": md, "l": ml}, "n": {"w": nw, "d": nd, "l": nl}}
        return e
    raise SystemExit("no clean word line for %s" % e["date"])


def verify_word(e):
    if e["date"] < WORD_START:
        assert "word" not in e, "word layer before WORD_START"
        return
    w = e.get("word")
    assert w, "missing hidden word"
    n = e["size"]
    g = GEOS[n]
    sol = [int(x) for x in e["solution"]]
    cells = w["cells"]
    assert dict(word_lines(g, sol)).get(w["line"]) == cells, "word line is not a row, column or clean diagonal"
    for k in ("m", "n"):
        word_ok(w[k]["w"], n)
        assert w[k]["d"].strip(), "missing meaning"
        lt = w[k]["l"]
        assert len(lt) == n and len(set(lt)) == n and sorted(lt) == sorted(w[k]["w"]), "letters do not match the word"
        assert "".join(lt[sol[i] - 1] for i in cells) == w[k]["w"], "word line does not spell %s" % w[k]["w"]
        hit = rude_hit(g, sol, lt, cells)
        assert not hit, "rude string %r with %s" % (hit, w[k]["w"])


# ---------- medical-number cages (Fri-Sun, CAGE_START to CAGE_END) ----------
CAGE_START, CAGE_END = "2026-11-13", "2026-12-31"
CAGE_MAX = {2: 17, 3: 24, 4: 30}
CAGE_MIN = {2: 3, 3: 6, 4: 10}
LABEL_MAX = {2: 12, 3: 16}  # label length by how many cells it can run across (2, or 3+): it sits along the cage's top row
# sum: [(short label, full name)]. Well-known, textbook numbers only; no ranges, nothing shaky.
CAGE_MED = {
    3: [("Min GCS", "Lowest Glasgow Coma Scale score"), ("Ossicles", "Bones in the middle ear"), ("R lung lobes", "Lobes of the right lung"),
        ("Hamstrings", "Hamstring muscles"), ("Salivary pairs", "Pairs of major salivary glands")],
    4: [("Heart chambers", "Chambers of the heart"), ("Heart valves", "Valves in the heart"), ("Rotator cuff", "Rotator cuff muscles"),
        ("Quadriceps", "Muscles in the quadriceps"), ("ABO groups", "ABO blood groups")],
    5: [("Lumbar verts", "Lumbar vertebrae"), ("Sacral verts", "Vertebrae fused into the sacrum"), ("Metacarpals", "Metacarpal bones in one hand"),
        ("Apgar signs", "Signs scored in the Apgar test"), ("CURB-65 max", "Highest CURB-65 score")],
    6: [("Limb leads", "Limb leads on a 12-lead ECG"), ("Chest leads", "Chest (precordial) leads on an ECG")],
    7: [("Cervical verts", "Cervical vertebrae"), ("Tarsal bones", "Tarsal bones in one foot")],
    8: [("Carpal bones", "Carpal bones in one wrist"), ("Liver segments", "Couinaud segments of the liver"), ("Cranial bones", "Bones of the cranium")],
    10: [("Apgar max", "Highest Apgar score")],
    12: [("Cranial nerves", "Pairs of cranial nerves"), ("Rib pairs", "Pairs of ribs"), ("Thoracic verts", "Thoracic vertebrae"), ("ECG leads", "Leads on a standard ECG")],
    14: [("Facial bones", "Bones of the face"), ("Finger bones", "Phalanges in one hand"), ("Toe bones", "Phalanges in one foot")],
    15: [("Max GCS", "Highest Glasgow Coma Scale score")],
    16: [("Teeth per jaw", "Adult teeth in each jaw")],
    20: [("Baby teeth", "Primary (baby) teeth"), ("Amino acids", "Standard amino acids in the genetic code")],
    24: [("Ribs", "Ribs in the human body")],
    26: [("Foot bones", "Bones in one foot")],
    28: [("Cycle days", "Days in a textbook menstrual cycle")],
}
CAGE_NORM = {
    3: [("Musketeers", "The Musketeers in Dumas’s novel"), ("Primary colours", "Primary colours of paint"), ("Little pigs", "Little pigs in the fairy tale")],
    4: [("Seasons", "Seasons in a year"), ("Violin strings", "Strings on a violin"), ("Card suits", "Suits in a deck of cards")],
    5: [("Oceans", "Oceans of the world"), ("Olympic rings", "Rings on the Olympic flag")],
    6: [("Guitar strings", "Strings on a guitar"), ("Insect legs", "Legs on an insect"), ("Faces on a die", "Faces on a standard die"), ("Hexagon sides", "Sides of a hexagon")],
    7: [("Days in a week", "Days in a week"), ("Continents", "Continents"), ("Netball team", "Players on a netball team"), ("Rainbow colours", "Colours of the rainbow")],
    8: [("Spider legs", "Legs on a spider"), ("Planets", "Planets in our solar system"), ("Octopus arms", "Arms on an octopus")],
    10: [("Bowling pins", "Pins in tenpin bowling"), ("Years in decade", "Years in a decade")],
    12: [("Months", "Months in a year"), ("Zodiac signs", "Signs of the zodiac"), ("Dozen", "How many in a dozen")],
    14: [("Fortnight (days)", "Days in a fortnight")],
    15: [("Rugby union team", "Players on a rugby union team")],
    16: [("Chess pieces", "Chess pieces each player starts with")],
    20: [("A score", "How many in ‘a score’")],
    24: [("Hours in a day", "Hours in a day")],
    26: [("Alphabet", "Letters in the English alphabet")],
    28: [("Days in Feb", "Days in February in most years")],
}
for _pool in (CAGE_MED, CAGE_NORM):
    for _s, _ls in _pool.items():
        for _a, _b in _ls:
            assert len(_a) <= LABEL_MAX[3] and not re.search(r"(?<![\d-])%d(?!\d)" % _s, _a), _a  # the label never shows its number


def cage_day(date):
    return CAGE_START <= date <= CAGE_END and dt.date.fromisoformat(date).weekday() >= 4


def cage_ok(g, cells):
    """2-4 cells, orthogonally connected, label cell (lowest index) has its right-hand neighbour in the cage."""
    n = g.n
    if not 2 <= len(cells) <= 4 or len(set(cells)) != len(cells):
        return False
    a = min(cells)
    if a % n == n - 1 or a + 1 not in cells:
        return False
    s, seen, stack = set(cells), {a}, [a]
    while stack:
        x = stack.pop()
        for y in (x - n, x + n, x - 1 if x % n else -1, x + 1 if x % n < n - 1 else -1):
            if y in s and y not in seen:
                seen.add(y)
                stack.append(y)
    return seen == s


def label_run(g, cells):
    """Cells in a row from the label cell rightwards: the label may span them all."""
    a, run = min(cells), 1
    while (a + run) in cells and (a + run) % g.n:
        run += 1
    return run


def label_fits(lab, run):
    return len(lab[0]) <= LABEL_MAX[min(run, 3)]


def nbrs(g, x):
    n = g.n
    return [y for y in (x - n, x + n, x - 1 if x % n else -1, x + 1 if x % n < n - 1 else -1) if 0 <= y < g.N]


def add_cages(e):
    """Add 3-6 medical-number cages to a Fri-Sun entry (more on Einstein day). Deterministic from the date."""
    e.pop("cages", None)
    if not cage_day(e["date"]):
        return e
    g = GEOS[e["size"]]
    sol = [int(x) for x in e["solution"]]
    puz = [int(x) for x in e["puzzle"]]
    line = set(e["word"]["cells"]) if e.get("word") else set()
    rng = random.Random("sudokrine-cages|" + e["date"])
    want = 8 if e["difficulty"] == "Einstein" else rng.randint(3, 6)
    for attempt in range(400):
        used, cages, mlab, nlab = set(), [], set(), set()
        block = set(line) | {i for i in range(g.N) if puz[i]}
        tries = 0
        while len(cages) < want and tries < 600:
            tries += 1
            a = rng.randrange(g.N)
            if a % g.n == g.n - 1 or a in block or a + 1 in block:
                continue
            size = rng.choice([2, 2, 3, 3, 3, 4, 4])
            cells = [a, a + 1]
            while len(cells) < size:
                opts = [y for x in cells for y in nbrs(g, x) if y > a and y not in cells and y not in block]
                if not opts:
                    break
                cells.append(rng.choice(opts))
            if len(cells) != size or not cage_ok(g, cells):
                continue
            vals = [sol[i] for i in cells]
            if len(set(vals)) != len(vals):
                continue
            s = sum(vals)
            run = label_run(g, cells)
            mo = [x for x in CAGE_MED.get(s, []) if x[0] not in mlab and label_fits(x, run)]
            no = [x for x in CAGE_NORM.get(s, []) if x[0] not in nlab and label_fits(x, run)]
            if not mo or not no or rng.random() > min(1, len(CAGE_MED[s]) / 3):  # spread the labels: single-label sums are rarer
                continue
            m, nn = rng.choice(mo), rng.choice(no)
            cells = sorted(cells)
            cages.append({"c": cells, "s": s, "m": list(m), "n": list(nn)})
            mlab.add(m[0])
            nlab.add(nn[0])
            block |= set(cells)
            for x in cells:  # keep cages apart so the dotted outlines never touch
                block |= set(nbrs(g, x))
        if len(cages) == want:
            e["cages"] = sorted(cages, key=lambda c: c["c"][0])
            return e
    raise SystemExit("no cage layout for %s" % e["date"])


def verify_cages(e):
    cg = e.get("cages")
    if not cage_day(e["date"]):
        assert cg is None, "cages outside the Fri-Sun cage window"
        return
    assert cg, "missing cages"
    want = (7, 10) if e["difficulty"] == "Einstein" else (3, 6)
    assert want[0] <= len(cg) <= want[1], "wrong number of cages: %d" % len(cg)
    g = GEOS[e["size"]]
    sol = [int(x) for x in e["solution"]]
    puz = [int(x) for x in e["puzzle"]]
    line = set(e["word"]["cells"]) if e.get("word") else set()
    seen, ml, nl = set(), set(), set()
    for c in cg:
        cells = c["c"]
        assert cage_ok(g, cells), "cage %s not 2-4 connected cells with the label on a horizontal pair" % cells
        assert not seen & set(cells), "cages overlap"
        seen |= set(cells)
        assert not line & set(cells), "cage on the word line"
        assert not any(puz[i] for i in cells), "cage over a given"
        vals = [sol[i] for i in cells]
        assert len(set(vals)) == len(vals), "repeated digit in cage %s" % cells
        assert sum(vals) == c["s"], "cage %s sums to %d, label says %d" % (cells, sum(vals), c["s"])
        assert CAGE_MIN[len(cells)] <= c["s"] <= CAGE_MAX[len(cells)], "impossible cage sum"
        assert tuple(c["m"]) in CAGE_MED.get(c["s"], []), "medical label %r is not %d" % (c["m"], c["s"])
        assert tuple(c["n"]) in CAGE_NORM.get(c["s"], []), "everyday label %r is not %d" % (c["n"], c["s"])
        assert c["m"][0] not in ml and c["n"][0] not in nl, "label used twice"
        assert label_fits(c["m"], label_run(g, cells)) and label_fits(c["n"], label_run(g, cells)), "label too long for its cage"
        ml.add(c["m"][0])
        nl.add(c["n"][0])
    for a in cg:
        for b in cg:
            if a is not b:
                assert not any(y in b["c"] for x in a["c"] for y in nbrs(g, x)), "cages touch"
    # cages never change the answer: the givens alone are still unique (checked in verify)


# ---------- geometry ----------
class Geo:
    def __init__(self, n):
        self.n = n
        self.br, self.bc = (2, 3) if n == 6 else (3, 3)
        self.N = n * n
        self.full = (1 << n) - 1
        rows = [[r * n + c for c in range(n)] for r in range(n)]
        cols = [[r * n + c for r in range(n)] for c in range(n)]
        boxes = []
        for R in range(0, n, self.br):
            for C in range(0, n, self.bc):
                boxes.append([(R + r) * n + C + c for r in range(self.br) for c in range(self.bc)])
        self.rows, self.cols, self.boxes = rows, cols, boxes
        self.units = rows + cols + boxes
        self.row_of = [i // n for i in range(self.N)]
        self.col_of = [i % n for i in range(self.N)]
        self.box_of = [0] * self.N
        for b, cells in enumerate(boxes):
            for i in cells:
                self.box_of[i] = b
        self.peers = []
        for i in range(self.N):
            s = set(rows[self.row_of[i]]) | set(cols[self.col_of[i]]) | set(boxes[self.box_of[i]])
            s.discard(i)
            self.peers.append(sorted(s))
        self.peerset = [set(p) for p in self.peers]


GEOS = {6: Geo(6), 9: Geo(9)}


def bits(m):
    out, d = [], 1
    while m:
        if m & 1:
            out.append(d)
        m >>= 1
        d += 1
    return out


def pc(m):
    return bin(m).count("1")


def B(d):
    return 1 << (d - 1)


# ---------- brute force (fill + count solutions) ----------
def count_solutions(vals, g, limit=2):
    vals = list(vals)
    cand = [0] * g.N
    for i in range(g.N):
        if not vals[i]:
            m = g.full
            for p in g.peers[i]:
                if vals[p]:
                    m &= ~B(vals[p])
            cand[i] = m
    for i in range(g.N):
        if vals[i]:
            for p in g.peers[i]:
                if vals[p] == vals[i]:
                    return 0
    count = [0]

    def rec():
        best, bm, bc = -1, 0, 99
        for i in range(g.N):
            if not vals[i]:
                m = cand[i]
                c = pc(m)
                if c == 0:
                    return
                if c < bc:
                    best, bm, bc = i, m, c
                    if c == 1:
                        break
        if best < 0:
            count[0] += 1
            return
        for d in bits(bm):
            vals[best] = d
            changed = []
            for p in g.peers[best]:
                if not vals[p] and cand[p] & B(d):
                    cand[p] &= ~B(d)
                    changed.append(p)
            rec()
            for p in changed:
                cand[p] |= B(d)
            vals[best] = 0
            if count[0] >= limit:
                return

    rec()
    return count[0]


def full_grid(g, rng):
    vals = [0] * g.N

    def rec(i):
        if i == g.N:
            return True
        used = 0
        for p in g.peers[i]:
            if vals[p]:
                used |= B(vals[p])
        ds = [d for d in range(1, g.n + 1) if not used & B(d)]
        rng.shuffle(ds)
        for d in ds:
            vals[i] = d
            if rec(i + 1):
                return True
        vals[i] = 0
        return False

    rec(0)
    return vals


# ---------- logical solver ----------
TIER = {"Naked single": 1, "Hidden single": 1, "Pointing": 2, "Claiming": 2, "Naked pair": 3, "Hidden pair": 3,
        "Naked triple": 4, "Hidden triple": 4, "X-wing": 5, "Swordfish": 5, "XY-wing": 5, "Colouring chain": 5}


class Logic:
    def __init__(self, vals, g):
        self.g = g
        self.v = list(vals)
        self.c = [0] * g.N
        for i in range(g.N):
            if not self.v[i]:
                m = g.full
                for p in g.peers[i]:
                    if self.v[p]:
                        m &= ~B(self.v[p])
                self.c[i] = m

    def place(self, i, d):
        self.v[i] = d
        self.c[i] = 0
        for p in self.g.peers[i]:
            self.c[p] &= ~B(d)

    def elim(self, cells, mask):
        hit = False
        for i in cells:
            if not self.v[i] and self.c[i] & mask:
                self.c[i] &= ~mask
                hit = True
        return hit

    # tier 1
    def naked_single(self):
        hit = False
        for i in range(self.g.N):
            if not self.v[i] and pc(self.c[i]) == 1:
                self.place(i, bits(self.c[i])[0])
                hit = True
        return hit

    def hidden_single(self):
        for u in self.g.units:
            for d in range(1, self.g.n + 1):
                pos = [i for i in u if not self.v[i] and self.c[i] & B(d)]
                if len(pos) == 1 and not any(self.v[i] == d for i in u):
                    self.place(pos[0], d)
                    return True
        return False

    # tier 2
    def pointing(self):
        g = self.g
        for bx in g.boxes:
            for d in range(1, g.n + 1):
                pos = [i for i in bx if not self.v[i] and self.c[i] & B(d)]
                if len(pos) < 2:
                    continue
                rs = {g.row_of[i] for i in pos}
                if len(rs) == 1:
                    if self.elim([i for i in g.rows[rs.pop()] if i not in bx], B(d)):
                        return True
                cs = {g.col_of[i] for i in pos}
                if len(cs) == 1:
                    if self.elim([i for i in g.cols[cs.pop()] if i not in bx], B(d)):
                        return True
        return False

    def claiming(self):
        g = self.g
        for line in g.rows + g.cols:
            for d in range(1, g.n + 1):
                pos = [i for i in line if not self.v[i] and self.c[i] & B(d)]
                if len(pos) < 2:
                    continue
                bs = {g.box_of[i] for i in pos}
                if len(bs) == 1:
                    if self.elim([i for i in g.boxes[bs.pop()] if i not in line], B(d)):
                        return True
        return False

    # tiers 3-4
    def naked(self, k):
        for u in self.g.units:
            open_ = [i for i in u if not self.v[i]]
            small = [i for i in open_ if 2 <= pc(self.c[i]) <= k]
            for combo in combinations(small, k):
                m = 0
                for i in combo:
                    m |= self.c[i]
                if pc(m) == k:
                    if self.elim([i for i in open_ if i not in combo], m):
                        return True
        return False

    def hidden(self, k):
        g = self.g
        for u in g.units:
            placed = {self.v[i] for i in u if self.v[i]}
            ds = [d for d in range(1, g.n + 1) if d not in placed]
            pos = {d: [i for i in u if not self.v[i] and self.c[i] & B(d)] for d in ds}
            ds = [d for d in ds if 2 <= len(pos[d]) <= k]
            for combo in combinations(ds, k):
                cells = set()
                for d in combo:
                    cells.update(pos[d])
                if len(cells) == k:
                    keep = 0
                    for d in combo:
                        keep |= B(d)
                    hit = False
                    for i in cells:
                        if self.c[i] & ~keep:
                            self.c[i] &= keep
                            hit = True
                    if hit:
                        return True
        return False

    # tier 5
    def fish(self, k):
        g = self.g
        for d in range(1, g.n + 1):
            for base, cover, bof, cof in ((g.rows, g.cols, g.row_of, g.col_of), (g.cols, g.rows, g.col_of, g.row_of)):
                lines = []
                for li, line in enumerate(base):
                    if any(self.v[i] == d for i in line):
                        continue
                    pos = {cof[i] for i in line if not self.v[i] and self.c[i] & B(d)}
                    if 2 <= len(pos) <= k:
                        lines.append((li, pos))
                for combo in combinations(lines, k):
                    cs = set()
                    for _, p in combo:
                        cs |= p
                    if len(cs) == k:
                        bl = {li for li, _ in combo}
                        targets = [i for cc in cs for i in cover[cc] if bof[i] not in bl]
                        if self.elim(targets, B(d)):
                            return True
        return False

    def xy_wing(self):
        g = self.g
        bi = [i for i in range(g.N) if not self.v[i] and pc(self.c[i]) == 2]
        for p in bi:
            a, b = bits(self.c[p])
            wings = [q for q in g.peers[p] if q in bi and q != p]
            for x in wings:
                for y in wings:
                    if x >= y:
                        continue
                    cx, cy = self.c[x], self.c[y]
                    for (u, w) in ((x, y), (y, x)):
                        cu, cw = self.c[u], self.c[w]
                        if cu & B(a) and not cu & B(b) and cw & B(b) and not cw & B(a):
                            zu, zw = cu & ~B(a), cw & ~B(b)
                            if zu == zw and pc(zu) == 1:
                                targets = [i for i in g.peerset[u] & g.peerset[w] if i != p]
                                if self.elim(targets, zu):
                                    return True
                    del cx, cy
        return False

    def colouring(self):
        g = self.g
        for d in range(1, g.n + 1):
            adj = {}
            for u in g.units:
                pos = [i for i in u if not self.v[i] and self.c[i] & B(d)]
                if len(pos) == 2:
                    a, b = pos
                    adj.setdefault(a, set()).add(b)
                    adj.setdefault(b, set()).add(a)
            seen = {}
            for start in adj:
                if start in seen:
                    continue
                comp = {start: 0}
                stack = [start]
                while stack:
                    x = stack.pop()
                    for y in adj[x]:
                        if y not in comp:
                            comp[y] = 1 - comp[x]
                            stack.append(y)
                seen.update(comp)
                if len(comp) < 4:
                    continue
                groups = [[i for i in comp if comp[i] == k] for k in (0, 1)]
                # colour wrap: two cells of one colour see each other -> that colour is false
                for k in (0, 1):
                    grp = groups[k]
                    if any(b in g.peerset[a] for a, b in combinations(grp, 2)):
                        if self.elim(grp, B(d)):
                            return True
                # colour trap: an uncoloured cell sees both colours
                targets = [i for i in range(g.N) if not self.v[i] and self.c[i] & B(d) and i not in comp
                           and any(j in g.peerset[i] for j in groups[0]) and any(j in g.peerset[i] for j in groups[1])]
                if self.elim(targets, B(d)):
                    return True
        return False

    def steps(self):
        return [
            ("Hidden single", self.hidden_single), ("Naked single", self.naked_single),
            ("Pointing", self.pointing), ("Claiming", self.claiming),
            ("Naked pair", lambda: self.naked(2)), ("Hidden pair", lambda: self.hidden(2)),
            ("Naked triple", lambda: self.naked(3)), ("Hidden triple", lambda: self.hidden(3)),
            ("X-wing", lambda: self.fish(2)), ("XY-wing", self.xy_wing), ("Swordfish", lambda: self.fish(3)),
            ("Colouring chain", self.colouring),
        ]

    def solve(self, max_tier):
        used = {}
        steps = [s for s in self.steps() if TIER[s[0]] <= max_tier]
        while True:
            if all(self.v):
                return True, used
            for name, fn in steps:
                if fn():
                    used[name] = used.get(name, 0) + 1
                    break
            else:
                return False, used


def grade(vals, g, max_tier=5):
    ok, used = Logic(vals, g).solve(max_tier)
    return ok, (max(TIER[k] for k in used) if used else 0), used


# ---------- making a puzzle ----------
def carve(g, rng, max_tier, min_clues):
    sol = full_grid(g, rng)
    puz = list(sol)
    order = list(range(g.N))
    rng.shuffle(order)
    for i in order:
        j = g.N - 1 - i
        if not puz[i] or i > j:
            continue
        keep = (puz[i], puz[j])
        puz[i] = puz[j] = 0
        if sum(1 for x in puz if x) < min_clues or not grade(puz, g, max_tier)[0]:
            puz[i], puz[j] = keep
    return puz, sol


SPEC = {  # size, max tier allowed while carving, tiers accepted, clue floor
    "Easy": (6, 1, {1}, 14),
    "Medium": (6, 3, {2, 3}, 0),
    "Hard": (9, 2, {2}, 0),
    "Genius": (9, 4, {3, 4}, 0),
    "Einstein": (9, 5, {5}, 0),
}


def make(date, diff):
    n, mt, accept, floor = SPEC[diff]
    g = GEOS[n]
    best = None
    for attempt in range(4000):
        rng = random.Random("sudokrine|%s|%d" % (date, attempt))
        puz, sol = carve(g, rng, mt, floor)
        ok, tier, used = grade(puz, g, mt)
        if not ok:
            continue
        if diff == "Genius" and tier == 3 and best is None:
            best = (puz, sol, used)  # fallback: hidden/naked pairs; keep looking for triples a while
        if tier in accept and not (diff == "Genius" and tier == 3 and attempt < 60):
            return puz, sol, used
    if best:
        return best
    raise SystemExit("no %s puzzle for %s" % (diff, date))


def difficulty(date):
    if date in EINSTEIN:
        return "Einstein"
    return DIFF[dt.date.fromisoformat(date).weekday()]


def number(date):
    return (dt.date.fromisoformat(date) - dt.date.fromisoformat(LAUNCH)).days + 1


def pick_fact(lst, num, salt):
    order = list(range(len(lst)))
    random.Random("sudokrine-facts|" + salt).shuffle(order)
    return lst[order[(num - 1) % len(lst)]]


def verify(e):
    n = e["size"]
    g = GEOS[n]
    puz = [int(x) for x in e["puzzle"]]
    sol = [int(x) for x in e["solution"]]
    assert len(puz) == g.N and len(sol) == g.N
    assert all(p == 0 or p == s for p, s in zip(puz, sol)), "givens disagree with solution"
    for u in g.units:
        assert sorted(sol[i] for i in u) == list(range(1, n + 1)), "solution invalid"
    assert count_solutions(puz, g, 2) == 1, "not unique"
    ok, tier, used = grade(puz, g, 5)
    assert ok, "not solvable by logic"
    assert sorted(used) == sorted(e["techniques"]), "technique list mismatch"
    want = {"Easy": (6, {1}), "Medium": (6, {1, 2, 3}), "Hard": (9, {2}), "Genius": (9, {3, 4}), "Einstein": (9, {5})}[e["difficulty"]]
    assert n == want[0] and tier in want[1], "grade %d does not fit %s" % (tier, e["difficulty"])
    verify_word(e)
    verify_cages(e)
    return tier, used


def main():
    args = sys.argv[1:]
    out_dir = os.path.join(HERE, "puzzles")
    if args and args[0] == "--check":
        bad = 0
        for f in sorted(os.listdir(out_dir)):
            if not f.endswith(".json"):
                continue
            for e in json.load(open(os.path.join(out_dir, f))):
                try:
                    tier, used = verify(e)
                    assert e["number"] == number(e["date"]) and e["difficulty"] == difficulty(e["date"])
                    wd = e.get("word")
                    print("%s #%-3d %-8s %dx%d clues %2d  tier %d  %s%s%s" % (e["date"], e["number"], e["difficulty"], e["size"], e["size"], e["clues"], tier, ", ".join(sorted(used, key=lambda k: TIER[k])),
                                                                           "  [%s %s / %s]" % (wd["line"], wd["m"]["w"], wd["n"]["w"]) if wd else "",
                                                                           "  cages " + " ".join("%s=%d" % (c["m"][0], c["s"]) for c in e["cages"]) if e.get("cages") else ""))
                except AssertionError as x:
                    bad += 1
                    print("FAIL", e["date"], x)
        print("OK" if not bad else "%d FAILED" % bad)
        sys.exit(1 if bad else 0)
    if args and args[0] in ("--words", "--cages"):
        cg = args[0] == "--cages"
        start, end = (args[1:] + [CAGE_START if cg else WORD_START, "2026-12-31"])[:2]
        for f in sorted(os.listdir(out_dir)):
            if not f.endswith(".json"):
                continue
            path = os.path.join(out_dir, f)
            lst = json.load(open(path))
            hit = False
            for e in lst:
                if start <= e["date"] <= end and e["date"] >= WORD_START:
                    if cg:
                        add_cages(e)
                    else:
                        add_word(e)
                        add_cages(e)  # the word line moves, so re-place the cages around it
                    verify(e)
                    hit = True
                    print(e["date"], e["size"], e["word"]["line"], e["word"]["m"]["w"], e["word"]["n"]["w"],
                          " ".join("%s=%d" % (c["m"][0], c["s"]) for c in e.get("cages", [])), flush=True)
            if hit:
                with open(path, "w") as fh:
                    fh.write("[\n" + ",\n".join(json.dumps(x, ensure_ascii=False) for x in lst) + "\n]\n")
                print("wrote", path, len(lst))
        return
    start, end = (args + [LAUNCH, "2026-12-31"])[:2] if args else (LAUNCH, "2026-12-31")
    d, last = dt.date.fromisoformat(start), dt.date.fromisoformat(end)
    months = {}
    while d <= last:
        ds = d.isoformat()
        diff = difficulty(ds)
        puz, sol, used = make(ds, diff)
        num = number(ds)
        e = {"date": ds, "number": num, "difficulty": diff, "size": GEOS[6 if diff in ("Easy", "Medium") else 9].n,
             "box": [GEOS[6].br, GEOS[6].bc] if diff in ("Easy", "Medium") else [3, 3],
             "puzzle": "".join(map(str, puz)), "solution": "".join(map(str, sol)),
             "clues": sum(1 for x in puz if x), "techniques": sorted(used, key=lambda k: (TIER[k], k)),
             "fact": pick_fact(FACTS, num, "m"), "nfact": pick_fact(NFACTS, num, "n")}
        add_word(e)
        add_cages(e)
        verify(e)
        print(ds, diff, e["clues"], e["techniques"], flush=True)
        months.setdefault(ds[:7], []).append(e)
        d += dt.timedelta(days=1)
    os.makedirs(out_dir, exist_ok=True)
    for m, lst in months.items():
        path = os.path.join(out_dir, m + ".json")
        old = []
        if os.path.exists(path):
            prev = json.load(open(path))
            byd = {x["date"]: x for x in prev}
            for e in lst:  # keep hand-written (themed) facts when the grid is unchanged
                o = byd.get(e["date"])
                if o and o["puzzle"] == e["puzzle"]:
                    e["fact"], e["nfact"] = o["fact"], o["nfact"]
            old = [x for x in prev if x["date"] not in {e["date"] for e in lst}]
        lst = sorted(old + lst, key=lambda x: x["date"])
        with open(path, "w") as f:
            f.write("[\n" + ",\n".join(json.dumps(x, ensure_ascii=False) for x in lst) + "\n]\n")
        print("wrote", path, len(lst))


if __name__ == "__main__":
    main()
