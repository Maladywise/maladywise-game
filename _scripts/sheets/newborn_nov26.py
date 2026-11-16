# Common newborn and baby problems (Nov 2026, owner's request). Run with _scripts/gen_sheets.py
G = ["Babies and children"]
RCH_CRY = ("Royal Children’s Hospital Melbourne: Crying and unsettled babies", "https://www.rch.org.au/kidsinfo/fact_sheets/Crying_and_unsettled_babies/%20%C2%A0")
PBB = ("Pregnancy, Birth and Baby helpline: 1800 882 436", "https://www.pregnancybirthbaby.org.au/", "Free advice from maternal child health nurses, 7am to midnight, 7 days.")

fact("congenital-ptosis",
 "Congenital Ptosis (Droopy Eyelid in Babies): Causes and Treatment",
 "Congenital ptosis: a droopy upper eyelid present from birth. Why it matters for vision (amblyopia), chin-up posture, when to see a doctor and when surgery helps.",
 "Congenital Ptosis", "congenital ptosis",
 "A droopy upper eyelid that a baby is born with. It’s usually from a weak lifting muscle and is often harmless to look at, but it matters for one big reason: a growing eye that can’t see properly can lose vision for life. Most children do very well with checks and, when needed, surgery.",
 h2("What it is", [
   "The muscle that lifts the upper lid (the levator) didn’t develop fully, so the lid sits lower than normal. One or both eyes can be affected.",
   "It’s present from birth and usually stays about the same. It doesn’t normally get worse.",
   "Sometimes it comes with other eye differences, such as a turned eye (squint) or a need for glasses."]) +
 h2("Why it matters: vision", [
   "Babies’ eyes learn to see in the first years of life. If the lid blocks the pupil, or causes blurry vision, that eye can become <b>lazy (amblyopia)</b>.",
   "In one study of children with congenital ptosis, about half of the eyes that could be tested had amblyopia. Most of it was from blurry focus (astigmatism) or a squint, not just the lid itself.",
   "Lazy eye is very treatable when found early, usually with glasses and patching. Found late, the vision loss can be permanent."]) +
 h2("Signs to look for", [
   "One lid sits lower than the other, or both look heavy.",
   "Your child tips their <b>chin up</b> or raises their eyebrows to see under the lid.",
   "The lid covers part or all of the pupil (the black centre of the eye).",
   "The eye seems to turn in or out, or your child shuts or covers one eye."]) +
 h2("When to see a doctor", [
   "Any droopy eyelid in a baby should be checked by your GP, who will look at the pupils, eye movements and red reflex and refer to an eye specialist.",
   "<b>See a doctor soon</b> if the lid covers the pupil, blocks vision, or still droops after 2 months of age.",
   "<b>See a doctor the same day</b> if a droopy eyelid appears suddenly, especially with a large or small pupil, a turned eye or other new symptoms. That’s not congenital ptosis and needs urgent checks."]) +
 h2("Treatment", [
   "Mild ptosis that doesn’t block vision often just needs regular eye checks, plus glasses or patching if a lazy eye develops.",
   "<b>Surgery</b> lifts the lid. Most often the lifting muscle is shortened. If it’s very weak, the lid is attached to the forehead muscle with a small sling, so raising the eyebrows lifts the lid.",
   "Surgery is done early if the lid blocks vision. Otherwise it’s often planned for preschool age, when the face is bigger and measurements are more reliable.",
   "Lids may not end up perfectly even, and some children need more than one operation. Eye checks continue afterwards."]),
 [("Will my baby’s droopy eyelid get better on its own?", "Congenital ptosis usually stays about the same. It doesn’t normally improve, but it doesn’t usually get worse either. What matters most is whether vision develops normally, so regular eye checks are important."),
  ("Can a droopy eyelid cause a lazy eye?", "Yes. If the lid covers the pupil, or the eye is out of focus because of it, that eye may not learn to see properly. This is called amblyopia. It’s very treatable if found early, usually with glasses and patching."),
  ("What age is ptosis surgery done?", "Early, if the lid blocks vision. If vision is developing well, surgery is often planned around preschool age. Your eye specialist will advise based on how much the lid droops and how well the muscle works."),
  ("Is a droopy eyelid in a baby ever serious?", "A droopy lid present since birth is usually congenital ptosis. A droopy lid that appears suddenly, or comes with a different-sized pupil or a turned eye, needs a doctor the same day.")],
 [("Royal Children’s Hospital Melbourne: Ptosis (drooping eyelid)", "https://www.rch.org.au/kidsinfo/fact_sheets/Ptosis_drooping_eyelid/", "Family fact sheet. Free.")],
 [("Royal Children’s Hospital Melbourne: Ptosis (drooping eyelid)", "https://www.rch.org.au/kidsinfo/fact_sheets/Ptosis_drooping_eyelid/"),
  ("Royal Children’s Hospital Melbourne: Droopy eyelid (ptosis) pre-referral guideline", "https://www.rch.org.au/primary-care-liaison/prereferral_guidelines/Droopy_eye_lid_ptosis/"),
  ("Srinagesh V et al. The association of refractive error, strabismus, and amblyopia with congenital ptosis. J AAPOS 2011", "https://pubmed.ncbi.nlm.nih.gov/20349903/")],
 [("Strabismus (squint)", "/strabismus/"), ("Blocked tear duct", "/blocked-tear-duct/"), ("Common newborn problems", "/newborn-problems/")],
 groups=G + ["Other"], blurb="A droopy upper eyelid from birth: why eye checks matter and when surgery helps.",
 search="congenital ptosis droopy eyelid baby drooping eyelid newborn blepharoptosis levator lazy eye amblyopia chin up frontalis sling")

fact("strabismus",
 "Strabismus (Squint) in Children: Signs, Lazy Eye and Treatment",
 "Strabismus (squint, turned eye) in babies and children: what’s normal under 4 months, when to see a doctor, lazy eye, glasses, patching and surgery.",
 "Strabismus (Squint)", "strabismus",
 "When the eyes don’t point the same way. About 1 in 20 children have it. A brief wobble is normal in young babies, but a turned eye after about 4 months needs checking, because the brain can start ignoring that eye.",
 h2("What it is", [
   "One eye turns in, out, up or down while the other looks straight. It can be there all the time or come and go, often when tired or unwell.",
   "Common types: an eye turning in (esotropia), which can start in babies or in toddlers who are long-sighted, and an eye drifting out (exotropia), often when tired or daydreaming.",
   "Many babies look cross-eyed because of a wide, flat nasal bridge and skin folds at the inner corners. The eyes are actually straight (pseudo-squint). A doctor can tell the difference."]) +
 h2("What’s normal", [
   "Short periods of wandering eyes are normal up to about <b>4 months</b> of age, while focusing develops.",
   "After 4 months, or at any age if the turn is constant or getting more obvious, see your GP."]) +
 h2("Why early checks matter", [
   "To avoid double vision, a child’s brain switches off the turned eye. Over time that eye can become <b>lazy (amblyopia)</b> and lose vision.",
   "Amblyopia is easiest to treat in early childhood. The younger it’s found, the better the result.",
   "Rarely, a turned eye is a sign of another eye problem. A white or abnormal reflection in the pupil in photos needs a doctor promptly."]) +
 h2("Treatment", [
   "<b>Glasses</b> correct focusing problems and can straighten some turns completely, especially an inward turn from long-sightedness.",
   "<b>Patching</b> the stronger eye (or eye drops that blur it) makes the brain use the weaker eye.",
   "<b>Surgery</b> on the eye muscles straightens the eyes when glasses don’t. It’s usually a day procedure, and some children need more than one.",
   "Treatment is planned by an eye specialist (ophthalmologist) and orthoptist, often combining these."]) +
 h2("When to see a doctor", [
   "An eye that turns after about 4 months, or that’s turning more often.",
   "Your child tilts or turns their head to look at things, squints in sunlight, or covers one eye.",
   "A family history of squint or lazy eye.",
   "<b>See a doctor promptly</b> for a new turn with a droopy lid or a different-sized pupil, a white pupil reflection, or a turn after a head injury or with headache or vomiting."]),
 [("Is it normal for a newborn’s eyes to cross?", "Yes, for short periods up to about 4 months of age. If an eye turns all the time, or after 4 months, see your GP."),
  ("Can a squint fix itself?", "A true squint doesn’t usually go away on its own. Some inward turns from long-sightedness fully straighten with glasses. Waiting can risk a lazy eye, so get it checked."),
  ("What is the difference between a squint and a lazy eye?", "A squint is an eye that points in a different direction. A lazy eye (amblyopia) is reduced vision because the brain hasn’t learned to use that eye. A squint is a common cause of lazy eye."),
  ("At what age can a child have squint surgery?", "At any age, including babies with a large inward turn from early infancy. The eye specialist decides the timing based on the type of squint and how vision is developing.")],
 [("Children’s Health Queensland: Strabismus fact sheet", "https://childrens.health.qld.gov.au/fact-sheet-strabismus", "Family fact sheet. Free."),
  ("Healthdirect: Correcting a squint in a child", "https://www.healthdirect.gov.au/surgery/correcting-a-squint-child", "What surgery involves. Free.")],
 [("Children’s Health Queensland: Strabismus fact sheet", "https://childrens.health.qld.gov.au/fact-sheet-strabismus"),
  ("Healthdirect: Correcting a squint in a child", "https://www.healthdirect.gov.au/surgery/correcting-a-squint-child"),
  ("Perth Children’s Hospital: Squint pre-referral guideline", "https://pch.health.wa.gov.au/For-health-professionals/Referrals-to-PCH/Prereferral-guidelines/Squint")],
 [("Congenital ptosis", "/congenital-ptosis/"), ("Blocked tear duct", "/blocked-tear-duct/"), ("Common newborn problems", "/newborn-problems/")],
 groups=G + ["Other"], blurb="A turned eye in babies and children: what’s normal, lazy eye, glasses, patching and surgery.",
 search="strabismus squint turned eye crossed eyes cross-eyed baby wandering eye esotropia exotropia lazy eye amblyopia patching pseudostrabismus")

fact("blocked-tear-duct",
 "Blocked Tear Duct in Babies: Watery, Sticky Eye",
 "Blocked tear duct in babies (nasolacrimal duct obstruction): why the eye waters and goes sticky, massage, cleaning, warning signs and when probing is needed.",
 "Blocked Tear Duct in Babies", "blocked tear duct",
 "A watery, sticky eye in an otherwise happy baby. About 1 in 20 babies are born with a blocked tear duct, and it usually clears on its own by the first birthday.",
 h2("What it is", [
   "Tears drain from the inner corner of the eye down a small tube into the nose. In some babies, a thin membrane at the nose end hasn’t opened yet.",
   "Tears back up, so the eye <b>waters</b> even when the baby isn’t crying, and the lashes get <b>crusty or sticky</b>, especially after sleep.",
   "The white of the eye usually stays white, and the baby is otherwise well. It may not be noticed until about a month of age."]) +
 h2("What you can do", [
   "<b>Clean</b> the eye with cooled boiled water or salt water (1 teaspoon of salt in 250 mL of cooled boiled water) on a clean cotton ball, wiping from the inner corner outwards. Use a fresh ball for each wipe.",
   "<b>Massage:</b> with a clean fingertip, press firmly on the side of the nose where the upper and lower lids meet, and slide down 1 to 2 cm. Repeat 5 times, twice a day. Your GP or child health nurse can show you.",
   "If the skin gets sore, a thin layer of white soft paraffin helps.",
   "Antibiotic drops are only needed if there’s a true infection, such as a red eye with lots of discharge."]) +
 h2("See a doctor promptly if", [
   "There’s a lot of sticky discharge in the <b>first 2 weeks</b> of life: newborn eye infections need checking the same day.",
   "A firm, swollen lump at the inner corner of the eye, or red or bluish skin there.",
   "The white of the eye is red, or the eyelids are swollen.",
   "The eye looks <b>cloudy or larger</b> than the other, or your baby is very sensitive to light and keeps the eye shut. These can be signs of rare but serious eye problems such as glaucoma."]) +
 h2("If it doesn’t clear", [
   "If it’s still blocked after about 12 months, an eye specialist can open the duct with a fine probe, as a short procedure under general anaesthetic.",
   "Probing usually works first time."]),
 [("How long does a blocked tear duct last in a baby?", "Most clear on their own within the first year, often in the first few months. Massage and gentle cleaning help in the meantime."),
  ("Is a blocked tear duct the same as conjunctivitis?", "No. A blocked tear duct gives a watery, sticky eye with a white eyeball. Conjunctivitis makes the white of the eye red. Either needs a doctor in the first 2 weeks of life."),
  ("Do babies with a blocked tear duct need antibiotics?", "Usually not. Cleaning is enough for crusting. Antibiotic drops are only needed for a real infection."),
  ("When does a blocked tear duct need surgery?", "Usually only if it’s still blocked after about 12 months. A short probing procedure opens it.")],
 [("Raising Children Network: Blocked tear duct", "https://raisingchildren.net.au/guides/a-z-health-reference/blocked-tear-duct", "Free parent guide."), PBB],
 [("Healthdirect: Blocked tear duct", "https://healthdirect.gov.au/blocked-tear-duct"),
  ("Raising Children Network: Blocked tear duct", "https://raisingchildren.net.au/guides/a-z-health-reference/blocked-tear-duct"),
  ("Children’s Health Queensland: Blocked tear ducts", "https://www.childrens.health.qld.gov.au/health-a-to-z/blocked-tear-ducts"),
  ("Royal Children’s Hospital Melbourne: Nasolacrimal duct obstruction pre-referral guideline", "https://www.rch.org.au/kidsconnect/prereferral_guidelines/Nasolacrimal_duct_obstruction_sticky_andor_watery_eye/")],
 [("Conjunctivitis", "/conjunctivitis/"), ("Strabismus (squint)", "/strabismus/"), ("Common newborn problems", "/newborn-problems/")],
 groups=G + ["Other"], blurb="A watery, sticky eye in a well baby. Usually clears by the first birthday.",
 search="blocked tear duct baby sticky eye watery eye newborn nasolacrimal duct obstruction dacryostenosis crusty eye massage probing")

fact("cradle-cap",
 "Cradle Cap: Causes and Gentle Treatment",
 "Cradle cap (infant seborrhoeic dermatitis): yellow, greasy scale on a baby’s scalp. Why it happens, how to loosen it safely, oils to avoid and when to see a doctor.",
 "Cradle Cap", "cradle cap",
 "Yellow, greasy or crusty scale on a baby’s scalp. It looks worse than it is: it doesn’t hurt or itch, isn’t from poor hygiene and usually clears by itself.",
 h2("What it is", [
   "A common baby form of seborrhoeic dermatitis. It usually starts in the first 3 months.",
   "Thick yellow or white scale, often on the top of the head. It can spread to the eyebrows, behind the ears, the neck folds and the nappy area.",
   "It’s linked to oily skin glands and a normal skin yeast. It’s not an infection and not contagious.",
   "Most cases clear within a few weeks to months, nearly always by about 12 months."]) +
 h2("Gentle treatment", [
   "You don’t have to treat it. If you’d like to:",
   "Rub a little moisturiser, sorbolene or baby oil into the scalp at night to soften the scale.",
   "Next morning, gently loosen the flakes with a soft brush or cloth, then wash with a mild baby shampoo.",
   "Don’t pick or scratch the scale off, as broken skin can get infected.",
   "Avoid <b>olive oil</b>, which may feed the skin yeast, and take care with nut and seed oils.",
   "If it’s stubborn, a pharmacist can suggest a cradle cap shampoo. A doctor may suggest an antifungal cream or a mild steroid."]) +
 h2("When to see a doctor", [
   "It’s red, weeping, crusted or smelly, which can mean infection.",
   "It’s itchy, or there’s dry, itchy skin elsewhere: that’s more like eczema.",
   "It’s spreading over the face or body, or lasts beyond a few months despite treatment.",
   "Your baby is unwell or not feeding."]),
 [("Is cradle cap caused by poor hygiene?", "No. It’s from oily skin glands and normal skin yeast. Washing more doesn’t prevent it."),
  ("Does cradle cap hurt or itch?", "Usually not. Itchy, red patches suggest eczema instead, so see your GP."),
  ("How long does cradle cap last?", "Usually a few weeks to months. Most babies are clear by about 12 months."),
  ("Can I use olive oil for cradle cap?", "It’s best avoided, as it may encourage the skin yeast. Use a plain moisturiser, sorbolene or baby oil instead.")],
 [("Pregnancy, Birth and Baby: Cradle cap", "https://www.pregnancybirthbaby.org.au/cradle-cap", "Free parent guide."), PBB],
 [("Pregnancy, Birth and Baby: Cradle cap", "https://www.pregnancybirthbaby.org.au/cradle-cap"),
  ("Better Health Channel: Cradle cap", "https://betterhealth.vic.gov.au/health/healthyliving/cradle-cap"),
  ("Healthdirect: Cradle cap", "https://www.healthdirect.gov.au/amp/article/cradle-cap")],
 [("Eczema", "/eczema/"), ("Seborrhoeic dermatitis", "/seb-derm/"), ("Newborn skin spots", "/newborn-skin/")],
 groups=G + ["Skin"], blurb="Yellow, greasy scale on a baby’s scalp. Harmless and usually gone by 12 months.",
 search="cradle cap baby scalp flakes yellow crust infantile seborrhoeic dermatitis seborrheic baby dandruff olive oil")

fact("newborn-jaundice",
 "Newborn Jaundice: Yellow Skin in Babies",
 "Newborn jaundice: why babies turn yellow, when it’s normal, warning signs (first 24 hours, beyond 2 weeks, pale poo), feeding and phototherapy.",
 "Newborn Jaundice", "newborn jaundice",
 "Yellow skin and eyes in the first days of life. It’s very common and usually harmless, fading by the end of the first week or two. A few patterns need checking quickly, and pale poo is one of them.",
 h2("What it is", [
   "Babies are born with extra red blood cells, which break down into a yellow substance called <b>bilirubin</b>. A newborn’s liver takes a few days to clear it.",
   "Jaundice usually shows on day 2 or 3, starting on the face and spreading down the body.",
   "It’s harder to see on darker skin: look at the whites of the eyes, the gums or the palms.",
   "It’s more likely in babies born early, babies who are feeding less well, and with some blood group differences or infections."]) +
 h2("What helps", [
   "<b>Frequent feeds</b>, about 8 to 12 in 24 hours. Bilirubin leaves the body in poo.",
   "Your midwife or doctor may check the level with a skin meter or a heel-prick blood test.",
   "If the level is high, <b>phototherapy</b> (a special blue light) breaks bilirubin down. Sunlight is not a safe substitute.",
   "Very high levels are rare but can affect the brain, which is why levels are checked and treated early."]) +
 h2("See a doctor or midwife promptly if", [
   "Jaundice appears in the <b>first 24 hours</b> after birth.",
   "It lasts more than <b>2 weeks</b> (3 weeks in a baby born early). This needs a check, including a blood test.",
   "Your baby has <b>pale, chalky or clay-coloured poo</b> or dark urine. This can be a sign of a blocked bile duct (biliary atresia), which needs treatment early.",
   "Your baby is very sleepy, hard to wake for feeds, not feeding well, or has few wet nappies.",
   "The yellow is spreading down to the legs or getting deeper."]),
 [("Is newborn jaundice normal?", "Usually, yes. Most babies have some jaundice from day 2 or 3, and it fades by the end of the first week or two. Feeding often helps it clear."),
  ("When is newborn jaundice serious?", "If it starts in the first 24 hours, lasts beyond 2 weeks, comes with pale poo or dark urine, or the baby is very sleepy or not feeding. See a doctor or midwife promptly."),
  ("Why is pale poo a worry in a jaundiced baby?", "Pale, chalky poo can mean bile isn’t reaching the gut, for example from biliary atresia. It’s rare, but surgery works best when done early, so it needs checking straight away."),
  ("Can sunlight treat jaundice?", "No. Putting a baby in sunlight isn’t safe or reliable. If treatment is needed, it’s done with a special phototherapy light.")],
 [("Sydney Children’s Hospitals Network: Jaundice in newborn babies", "https://www.schn.health.nsw.gov.au/parents-and-carers/fact-sheets/jaundice-in-newborn-babies", "Family fact sheet. Free."), PBB],
 [("Sydney Children’s Hospitals Network: Jaundice in newborn babies", "https://www.schn.health.nsw.gov.au/parents-and-carers/fact-sheets/jaundice-in-newborn-babies"),
  ("Pregnancy, Birth and Baby: Jaundice in babies", "https://pregnancybirthbaby.org.au/jaundice-in-babies"),
  ("Safer Care Victoria: Jaundice clinical guidance", "https://www.safercare.vic.gov.au/best-practice-improvement/clinical-guidance/mch/jaundice")],
 [("Common newborn problems", "/newborn-problems/"), ("Reflux in babies", "/baby-reflux/"), ("Fever in children", "/fever-in-children/")],
 groups=G, blurb="Yellow skin in the first days of life. Usually harmless; pale poo needs checking.",
 search="newborn jaundice baby yellow skin yellow eyes bilirubin phototherapy breastfeeding jaundice prolonged jaundice pale poo biliary atresia kernicterus")

fact("newborn-skin",
 "Newborn Skin Spots: Milia, Baby Acne, Newborn Rash and Stork Marks",
 "Common harmless newborn skin spots: milia, baby acne, erythema toxicum (newborn rash) and stork marks. What they look like, how long they last and when to worry.",
 "Newborn Skin Spots", "newborn skin spots",
 "Newborn skin is a work in progress. Tiny white spots, pimples and blotchy red rashes are all common in the first weeks and nearly always clear on their own. The trick is knowing which ones to leave alone.",
 h2("Harmless and common", [
   "<b>Milia:</b> tiny white spots on the nose, cheeks and chin, from blocked skin pores. Similar spots on the gums or roof of the mouth are called Epstein pearls. They go by themselves within weeks.",
   "<b>Newborn rash (erythema toxicum):</b> red blotches with small yellow-white bumps in the middle, in the first few days, coming and going on the body. Despite the name, it’s harmless and clears within a week or two.",
   "<b>Baby acne:</b> small pimples on the cheeks, nose and forehead, often from 2 to 3 weeks. It clears within a few months and isn’t linked to teenage acne.",
   "<b>Stork marks (salmon patches):</b> flat pink patches on the eyelids, between the eyebrows or on the back of the neck. Most on the face fade by age 2; neck marks often stay."]) +
 h2("What to do", [
   "Leave them alone: no squeezing, scrubbing, oils or adult acne creams.",
   "Wash with plain water and pat dry.",
   "Keep your baby comfortably dressed, not overheated, which can bring out heat rash (tiny red bumps in skin folds)."]) +
 h2("See a doctor if", [
   "Blisters, pus-filled spots or crusting, especially in the first weeks of life.",
   "A rash with fever, or a baby who is unsettled, sleepy or not feeding.",
   "Purple or red spots that don’t fade when pressed with a glass: <b>get help immediately</b>.",
   "A birthmark that grows quickly, bleeds or is near the eye, lip or nappy area.",
   "Dry, itchy, red patches that don’t settle, which may be eczema."]),
 [("What are the little white spots on my newborn’s nose?", "Usually milia: tiny blocked pores. They’re harmless and go on their own within a few weeks. Don’t squeeze them."),
  ("Should I treat baby acne?", "Usually not. Gentle washing with water is enough, and it clears within a few months. Avoid oils and adult acne products. See your GP if it’s severe or lasts beyond a few months."),
  ("What is erythema toxicum?", "A common, harmless newborn rash of red blotches with small pale bumps, in the first few days of life. It comes and goes and clears within a week or two."),
  ("When is a newborn rash an emergency?", "If it’s purple or red spots that don’t fade under pressure, or your baby has a fever, is floppy, very sleepy or not feeding. Get help immediately.")],
 [PBB],
 [("HealthLinkBC: Newborn rashes and skin conditions", "https://www.healthlinkbc.ca/healthwise/newborn-rashes-and-skin-conditions"),
  ("Mount Sinai: Skin findings in newborns", "https://mountsinai.org/health-library/special-topic/skin-findings-in-newborns")],
 [("Cradle cap", "/cradle-cap/"), ("Nappy rash", "/nappy-rash/"), ("Eczema", "/eczema/")],
 groups=G + ["Skin"], blurb="Milia, baby acne, newborn rash and stork marks: common, harmless, best left alone.",
 search="newborn skin spots milia baby acne neonatal acne erythema toxicum newborn rash stork mark salmon patch epstein pearls white spots baby nose")

fact("tongue-tie",
 "Tongue-Tie in Babies: Signs, Feeding and When to Treat",
 "Tongue-tie (ankyloglossia): a short band under a baby’s tongue. Signs, effect on feeding, when a frenotomy helps, and why many tongue-ties need no treatment.",
 "Tongue-Tie", "tongue-tie",
 "A short or tight band of tissue under the tongue. Many tongue-ties cause no problems at all. When one does make feeding hard, a quick snip can help, but it’s become an overused fix: Australian frenotomy rates rose 420% in a decade.",
 h2("What it is", [
   "The band under the tongue (the frenulum) is short, thick or attached near the tip, limiting how far the tongue moves.",
   "The tongue may not poke past the lips, lift to the roof of the mouth or move side to side. The tip can look notched or heart-shaped.",
   "It can run in families. Many tight bands loosen as babies grow."]) +
 h2("Signs it may be affecting feeding", [
   "Trouble latching or staying on the breast, clicking sounds, or long, frequent feeds.",
   "Nipple pain, damage, blocked ducts or mastitis, or a falling milk supply.",
   "Poor weight gain.",
   "With bottles: dribbling, air swallowing or very slow feeds.",
   "These problems have many causes, so the whole feed should be assessed, not just the tongue."]) +
 h2("What to do", [
   "Start with feeding help: a lactation consultant or child health nurse can fix positioning and attachment, which solves many problems.",
   "If the tongue-tie is clearly limiting feeding, a <b>frenotomy</b> (a small snip of the band) may help. In young babies it’s quick, usually without anaesthetic, and the baby can feed straight after.",
   "Evidence that it helps is limited to breastfeeding problems, mostly short-term nipple pain. There’s little good evidence it helps speech, sleep, reflux or colic.",
   "Larger laser procedures or ‘posterior tie’ and ‘lip-tie’ releases have weak evidence and more risk. Get an independent opinion first."]),
 [("Does every tongue-tie need cutting?", "No. Many cause no problems, and some loosen with time. Treatment is only considered when it’s clearly affecting feeding, after help with positioning and attachment."),
  ("Is frenotomy painful for babies?", "It’s a very quick procedure. Young babies usually have it without anaesthetic, may cry briefly and can feed straight away. A small white patch under the tongue is normal and heals within a couple of weeks."),
  ("Does tongue-tie cause speech problems?", "Rarely. Most children with tongue-tie learn to talk normally. If you’re worried about speech, see a speech pathologist before considering a procedure."),
  ("Why have tongue-tie procedures increased?", "Australian frenotomy rates in young children rose about 420% between 2006 and 2016. Experts worry this reflects overdiagnosis rather than more babies needing treatment.")],
 [("Pregnancy, Birth and Baby: Tongue-tie", "https://www.pregnancybirthbaby.org.au/amp/article/tongue-tie", "Free parent guide."),
  ("Australian Breastfeeding Association helpline: 1800 686 268", "https://www.breastfeeding.asn.au/", "Free breastfeeding support, 24 hours.")],
 [("Kapoor V et al. Frenotomy for tongue-tie in Australian children, 2006–2016: an increasing problem. Med J Aust 2018", "https://www.mja.com.au/journal/2018/208/2/frenotomy-tongue-tie-australian-children-2006-2016-increasing-problem"),
  ("Tongue-tie and frenotomy: what evidence do we have and what do we need? Med J Aust 2018", "https://www.mja.com.au/journal/2018/208/2/tongue-tie-and-frenotomy-what-evidence-do-we-have-and-what-do-we-need"),
  ("Pregnancy, Birth and Baby: Tongue-tie", "https://www.pregnancybirthbaby.org.au/amp/article/tongue-tie")],
 [("Reflux in babies", "/baby-reflux/"), ("Crying and colic", "/baby-crying/"), ("Common newborn problems", "/newborn-problems/")],
 groups=G, blurb="A tight band under the tongue. Often harmless; treat only if it truly affects feeding.",
 search="tongue tie tongue-tie ankyloglossia frenotomy frenectomy frenulum lip tie posterior tie breastfeeding latch clicking nipple pain laser")

fact("umbilical-problems",
 "Belly Button Problems in Babies: Granuloma, Hernia and Cord Care",
 "Baby belly button problems: umbilical cord care, umbilical granuloma (a moist pink lump), umbilical hernia (an outie that bulges), infection signs and when to see a doctor.",
 "Belly Button Problems in Babies", "belly button problems",
 "The cord stump usually dries and drops off within 1 to 2 weeks. Two common hiccups after that are a moist pink lump (granuloma) and a soft bulge (hernia). Both are usually easy to manage.",
 h2("Cord care", [
   "Keep the stump clean and dry. Fold the nappy below it so it can air.",
   "It’s fine to bath your baby. Pat the stump dry afterwards.",
   "A little dried blood or sticky ooze as it separates is normal."]) +
 h2("Umbilical granuloma", [
   "A small, moist, pink or red lump in the belly button after the cord falls off. It may ooze clear or yellow fluid.",
   "It’s extra healing tissue, not infection, and it doesn’t hurt.",
   "Your GP or child health nurse can treat it, usually by applying silver nitrate for a few days. Applying ordinary table salt is another option with some trial evidence; ask your GP first.",
   "See your GP if it hasn’t gone after a week of treatment, or if urine or poo comes from the belly button (rare, needs specialist review)."]) +
 h2("Umbilical hernia", [
   "A soft bulge at the belly button that gets bigger when your baby cries or strains, and pushes back in easily. It doesn’t hurt.",
   "It’s common, especially in babies born early or with low birth weight.",
   "Most close on their own by 4 to 5 years. Coins, tape or binders don’t help and can irritate the skin.",
   "Surgery is considered if it’s still there at about 4 to 5 years, is very large or is getting bigger."]) +
 h2("See a doctor urgently if", [
   "Redness spreading onto the tummy skin around the belly button, swelling, a bad smell, or your baby has a fever or isn’t feeding: signs of infection.",
   "A hernia becomes hard, tender or can’t be pushed back, the skin turns red or purple, or your baby is vomiting or in pain."]),
 [("When does the umbilical cord fall off?", "Usually within 1 to 2 weeks after birth. Keep it clean and dry until then."),
  ("What is the pink lump in my baby’s belly button?", "Most likely an umbilical granuloma: extra healing tissue after the cord falls off. It’s common and easily treated by your GP."),
  ("Should I tape a coin over my baby’s umbilical hernia?", "No. It doesn’t help the hernia close and can irritate or damage the skin. Most close on their own by 4 to 5 years."),
  ("When does an umbilical hernia need surgery?", "Usually only if it hasn’t closed by about 4 to 5 years, is very large or is growing. A hernia that becomes hard, painful or stuck out needs urgent care.")],
 [("Pregnancy, Birth and Baby: Umbilical hernia in babies", "https://www.pregnancybirthbaby.org.au/umbilical-hernia-in-babies", "Free parent guide."), PBB],
 [("Pregnancy, Birth and Baby: Umbilical hernia in babies", "https://www.pregnancybirthbaby.org.au/umbilical-hernia-in-babies"),
  ("Pregnancy, Birth and Baby: Umbilical granuloma in babies", "https://www.pregnancybirthbaby.org.au/babies/health-and-wellbeing/umbilical-granuloma-in-babies"),
  ("Royal Children’s Hospital Melbourne: Umbilical granuloma pre-referral guideline", "https://rch.org.au/kidsconnect/prereferral_guidelines/Umbilical_granuloma_prereferral"),
  ("The effect of table salt as a treatment of umbilical granuloma in neonates. J Pediatr Neonat Individ Med 2021", "https://jpnim.com/index.php/jpnim/article/view/e100239")],
 [("Common newborn problems", "/newborn-problems/"), ("Newborn skin spots", "/newborn-skin/"), ("Fever in children", "/fever-in-children/")],
 groups=G, blurb="Cord care, a moist pink lump (granuloma) and a soft bulge (hernia).",
 search="belly button baby umbilical granuloma umbilical hernia outie cord stump care oozing belly button silver nitrate salt umbilicus infection omphalitis")

fact("baby-crying",
 "Crying Babies and Colic: What Helps",
 "Infant colic and crying: why babies cry, the normal crying peak at 6 to 8 weeks, settling tips, what doesn’t help, red flags and support for parents.",
 "Crying Babies and Colic", "crying babies and colic",
 "All babies cry, and some cry a lot. Crying peaks at about 6 to 8 weeks, often in the late afternoon and evening, and most babies settle by 3 to 4 months. It isn’t your fault, and it’s OK to ask for help.",
 h2("What colic is", [
   "‘Colic’ just means long spells of crying in an otherwise healthy, growing baby, often in the evening.",
   "Most of the time there is <b>no medical cause</b>. It’s part of normal development and passes with time.",
   "It isn’t caused by anything you did, and it doesn’t harm your baby."]) +
 h2("What may help", [
   "Check the basics: hunger, a wet nappy, too hot or cold, tiredness.",
   "Closeness: holding, carrying in a sling, skin-to-skin, gentle rocking or a pram walk.",
   "A calm, dim room, white noise or shushing, a warm bath or gentle massage.",
   "Sucking, on the breast or a dummy.",
   "For breastfed babies, a probiotic (<i>Lactobacillus reuteri</i>) has modest trial evidence for less crying. Ask your GP or pharmacist."]) +
 h2("What doesn’t help", [
   "Colic drops, gripe water and most ‘anti-colic’ products have little evidence.",
   "Reflux medicines (acid blockers) don’t reduce crying in otherwise well babies and can have side effects.",
   "Switching formulas or cutting foods from a breastfeeding diet rarely helps unless a doctor suspects cow’s milk allergy."]) +
 h2("Look after yourself", [
   "<b>Never shake a baby.</b> If you feel overwhelmed, put your baby safely on their back in the cot, close the door and take a few minutes to calm down.",
   "Share the load with a partner, family or friend, even for an hour.",
   "If you feel low, anxious or not coping, talk to your GP or call PANDA on 1300 726 306."]) +
 h2("See a doctor promptly if", [
   "Your baby has a fever (38°C or more under 3 months), is floppy, very sleepy or feeding poorly.",
   "Vomiting that’s green, bloody or forceful, or blood in the poo.",
   "A high-pitched or weak cry, or crying that is different from usual.",
   "Poor weight gain, or you’re worried something is wrong. Trust your instincts."]),
 [("When does colic stop?", "Crying usually peaks at about 6 to 8 weeks and settles by 3 to 4 months for most babies."),
  ("Is colic caused by wind or reflux?", "Usually not. Most crying has no medical cause. Reflux medicines don’t reduce crying in otherwise healthy babies."),
  ("Do colic drops work?", "Most colic drops and gripe water have little evidence. For breastfed babies, a probiotic called Lactobacillus reuteri has modest evidence. Ask your GP or pharmacist."),
  ("What should I do if I feel like I can’t cope?", "Put your baby safely in their cot and take a break. Never shake a baby. Call someone you trust, your GP, the Pregnancy, Birth and Baby helpline (1800 882 436) or PANDA (1300 726 306).")],
 [PBB, ("PANDA: Perinatal Anxiety and Depression Australia, 1300 726 306", "https://panda.org.au/", "Free support for parents. Weekdays, plus online help.")],
 [RCH_CRY,
  ("Better Health Channel: Colic", "https://betterhealth.vic.gov.au/health/healthyliving/colic"),
  ("Royal Children’s Hospital Melbourne: Reflux (GOR) and GORD", "https://www.rch.org.au/kidsinfo/fact_sheets/Reflux_GOR/")],
 [("Reflux in babies", "/baby-reflux/"), ("Fever in children", "/fever-in-children/"), ("Common newborn problems", "/newborn-problems/")],
 groups=G, blurb="Crying peaks at 6 to 8 weeks and settles by 3 to 4 months. What helps, and support for you.",
 search="colic crying baby unsettled baby infant colic purple crying evening crying gripe water colic drops probiotic reuteri shaken baby settling")

fact("baby-reflux",
 "Reflux in Babies: Spilling, Posseting and GORD",
 "Reflux in babies: why babies spill milk, when it settles, ‘happy spitters’, signs of GORD, red flags such as green vomit, and why reflux medicines usually don’t help.",
 "Reflux in Babies", "reflux in babies",
 "Milk coming back up is very common in babies, and most are ‘happy spitters’ who grow well. It usually settles by about 12 months as the stomach valve matures and babies sit up.",
 h2("What it is", [
   "The valve at the top of a baby’s stomach is still immature, so milk easily comes back up (gastro-oesophageal reflux, or GOR).",
   "Spilling or posseting after feeds is normal. It often looks like more than it is.",
   "<b>GORD</b> (reflux disease) is when reflux causes problems such as poor weight gain, feeding refusal or breathing problems. It’s much less common."]) +
 h2("What helps", [
   "Smaller, more frequent feeds, and burping during feeds.",
   "Hold your baby upright for a while after feeds.",
   "Keep the nappy loose around the tummy.",
   "Always put your baby to sleep <b>on their back</b> on a flat cot mattress. Raising the cot or using wedges isn’t recommended.",
   "Thickened feeds may help some formula-fed babies; ask your GP or child health nurse first."]) +
 h2("About medicines", [
   "Acid-blocking medicines don’t reduce crying or spilling in otherwise well babies, and they can have side effects.",
   "They may be used for proven GORD, under a doctor’s care."]) +
 h2("See a doctor promptly if", [
   "Vomit is <b>green or yellow</b> (bile) or has blood: same day.",
   "<b>Forceful, projectile vomiting</b> after every feed, usually between 2 and 8 weeks of age, with a hungry baby: a blocked stomach outlet (pyloric stenosis) needs urgent checking.",
   "Vomiting starts suddenly, or with fever, a swollen tummy or blood in the poo.",
   "Poor weight gain, refusing feeds, fewer wet nappies, or breathing problems, coughing or choking with feeds."]),
 [("When does reflux in babies stop?", "Most babies improve as they grow, and it usually settles by about 12 months."),
  ("Is it normal for babies to spit up after every feed?", "Often, yes. If your baby is growing well and happy, it’s usually normal reflux and doesn’t need treatment."),
  ("Do reflux medicines help babies who cry a lot?", "Usually not. Acid blockers don’t reduce crying in otherwise well babies and can have side effects. They’re used for proven reflux disease."),
  ("What vomiting in a baby is an emergency?", "Green or bloody vomit, forceful projectile vomiting after every feed, or vomiting with a swollen tummy, fever, lethargy or fewer wet nappies. See a doctor the same day.")],
 [("Royal Children’s Hospital Melbourne: Reflux (GOR) and GORD", "https://www.rch.org.au/kidsinfo/fact_sheets/Reflux_GOR/", "Family fact sheet. Free."), PBB],
 [("Royal Children’s Hospital Melbourne: Reflux (GOR) and GORD", "https://www.rch.org.au/kidsinfo/fact_sheets/Reflux_GOR/"),
  ("Pregnancy, Birth and Baby: GORD in babies", "https://www.pregnancybirthbaby.org.au/gord-in-babies"),
  ("Better Health Channel: Infant reflux", "https://betterhealth.vic.gov.au/conditions-and-treatments/infant-reflux")],
 [("Crying and colic", "/baby-crying/"), ("Tongue-tie", "/tongue-tie/"), ("Reflux in adults", "/reflux/")],
 groups=G + ["Gut"], blurb="Spilling milk is common and usually settles by 12 months. Red flags and what helps.",
 search="reflux baby infant reflux posseting spitting up spilling milk GORD GOR silent reflux happy spitter projectile vomiting pyloric stenosis green vomit")

fact("hip-dysplasia",
 "Hip Dysplasia in Babies (DDH): Checks, Risks and Treatment",
 "Developmental dysplasia of the hip (DDH) in babies: risk factors, routine hip checks, ultrasound, the Pavlik harness and hip-healthy swaddling.",
 "Hip Dysplasia in Babies (DDH)", "hip dysplasia",
 "A hip joint that’s loose, shallow or out of place. Found early, it’s usually fixed with a soft harness and no surgery. That’s why every baby’s hips are checked, and why swaddling should leave the legs free.",
 h2("What it is", [
   "In developmental dysplasia of the hip (DDH), the ball of the thigh bone doesn’t sit snugly in a well-formed socket. It can be loose, partly out or fully dislocated.",
   "It can affect one or both hips, and it isn’t painful in babies."]) +
 h2("Who is more at risk", [
   "Girls, and first-born babies.",
   "Breech position in the last weeks of pregnancy.",
   "A parent or sibling with hip dysplasia.",
   "Tight swaddling with the legs straight and pressed together."]) +
 h2("Checks", [
   "Your baby’s hips are examined at birth, at about 1 week and 6 weeks, at 6 months and when they start walking.",
   "Babies with risk factors such as breech or a family history are usually offered a hip <b>ultrasound</b> at about 6 weeks.",
   "Signs in older babies: uneven leg skin creases, one leg looking shorter, one leg that won’t open out as far at nappy changes, or a limp once walking."]) +
 h2("Treatment", [
   "Most babies are treated with a soft brace, the <b>Pavlik harness</b>, which holds the hips bent and apart so the socket can deepen. It’s usually worn for several months.",
   "If that doesn’t work, or DDH is found later, the hip may need to be put back under anaesthetic and held in a cast.",
   "Found after about 6 months, surgery is more likely. Early detection makes treatment much simpler."]) +
 h2("Hip-healthy swaddling", [
   "If you wrap your baby, keep the wrap firm around the chest but <b>loose around the hips</b>, so the legs can bend up and out like a frog.",
   "Carriers should support the thighs with the knees higher than the bottom."]),
 [("How is hip dysplasia found in babies?", "By routine hip checks at birth and in the first months, and by an ultrasound at about 6 weeks for babies with risk factors such as breech position or a family history."),
  ("Does a Pavlik harness hurt my baby?", "No. It holds the hips in a safe position. Babies usually adapt quickly. Your team will show you how to care for your baby in it."),
  ("Can swaddling cause hip dysplasia?", "Tight swaddling with the legs straight and together increases the risk. Wrap loosely around the hips so the legs can bend up and out."),
  ("Do girls get hip dysplasia more often?", "Yes. Being a girl, being first-born, breech position and a family history all raise the risk.")],
 [("Royal Children’s Hospital Melbourne: Developmental dysplasia of the hip (DDH)", "https://www.rch.org.au/kidsinfo/fact_sheets/Developmental_dysplasia_of_the_hip_DDH/", "Family fact sheet. Free."),
  ("Royal Children’s Hospital Melbourne: Pavlik harness for DDH", "https://www.rch.org.au/kidsinfo/fact_sheets/Pavlik_Harness_for_DDH/", "Caring for a baby in a harness. Free.")],
 [("Royal Children’s Hospital Melbourne: Developmental dysplasia of the hip (DDH)", "https://www.rch.org.au/kidsinfo/fact_sheets/Developmental_dysplasia_of_the_hip_DDH/"),
  ("Pregnancy, Birth and Baby: Hip dysplasia in babies", "https://www.pregnancybirthbaby.org.au/hip-dysplasia-in-babies"),
  ("Safer Care Victoria: Developmental dysplasia of the hip in neonates", "https://www.safercare.vic.gov.au/best-practice-improvement/clinical-guidance/neonatal/developmental-dysplasia-of-the-hip-in-neonates")],
 [("Common newborn problems", "/newborn-problems/"), ("Outer hip pain", "/hip-pain/"), ("Hip osteoarthritis", "/hip-oa/")],
 groups=G + ["Bones and joints"], blurb="A loose or shallow hip in babies. Found early, a soft harness usually fixes it.",
 search="hip dysplasia DDH developmental dysplasia of the hip baby clicky hip pavlik harness breech hip ultrasound swaddling hip healthy")

fact("oral-thrush-babies",
 "Oral Thrush in Babies: White Patches in the Mouth",
 "Oral thrush in babies: white patches that don’t wipe off, how it’s treated, why breastfeeding parents may need treatment too, and when to see a doctor.",
 "Oral Thrush in Babies", "oral thrush in babies",
 "White, milky patches inside a baby’s mouth that don’t wipe off. It’s a common yeast infection, easily treated, and often caught alongside sore nipples if you’re breastfeeding.",
 h2("What it is", [
   "An overgrowth of <i>Candida</i>, a yeast that normally lives in the mouth. Babies’ immune systems are still developing, so it’s common in the first months.",
   "White patches on the tongue, inner cheeks, gums or lips that <b>don’t wipe away easily</b>. Milk coating the tongue wipes off; thrush doesn’t.",
   "Some babies are fussy at feeds. Thrush can also cause a red nappy rash with small spots at the edges."]) +
 h2("Treatment", [
   "Antifungal drops or gel applied to the inside of the mouth, usually after feeds. Nystatin drops are commonly used.",
   "Miconazole oral gel (Daktarin) isn’t recommended for babies under 6 months in Australia. Check with your pharmacist which product suits your baby’s age.",
   "Apply with a clean finger or as directed, and keep going for the full course, even after the patches fade.",
   "If you’re breastfeeding, both you and your baby are usually treated at the same time, even if your nipples aren’t sore. You can keep breastfeeding."]) +
 h2("Prevent it coming back", [
   "Wash and sterilise bottles, teats and dummies.",
   "Wash hands after nappy changes and before feeds."]) +
 h2("See a doctor if", [
   "Your baby is under 4 months old with thrush.",
   "It isn’t improving after 2 days of treatment, or keeps coming back.",
   "Your baby isn’t feeding, or has fewer wet nappies.",
   "Your baby has a fever, seems unwell, or the patches bleed or spread outside the mouth."]),
 [("How do I know if it’s thrush or milk on my baby’s tongue?", "Milk residue wipes off easily with a soft cloth. Thrush patches stick and may leave a red, sore area if rubbed."),
  ("Do I need treatment if my baby has thrush and I’m breastfeeding?", "Usually yes. Thrush passes back and forth between the baby’s mouth and the nipples, so both of you are treated at the same time."),
  ("Can I use Daktarin oral gel on my baby?", "Not under 6 months of age: the Australian product information says not to give it to babies under 6 months. Nystatin drops are often used instead. Ask your pharmacist or GP."),
  ("How long does oral thrush take to clear?", "It usually improves within a couple of days of treatment. Keep going for the full course so it doesn’t come back.")],
 [("Pregnancy, Birth and Baby: Oral thrush in babies and children", "https://www.pregnancybirthbaby.org.au/oral-thrush-babies-and-children", "Free parent guide."), PBB],
 [("Pregnancy, Birth and Baby: Oral thrush in babies and children", "https://www.pregnancybirthbaby.org.au/oral-thrush-babies-and-children"),
  ("NPS MedicineWise: Daktarin Oral Gel consumer medicine information", "https://www.nps.org.au/medicine-finder/daktarin-oral-gel")],
 [("Nappy rash", "/nappy-rash/"), ("Tongue-tie", "/tongue-tie/"), ("Common newborn problems", "/newborn-problems/")],
 groups=G, blurb="White patches in a baby’s mouth that don’t wipe off. Easily treated.",
 search="oral thrush baby white tongue white patches mouth candida nystatin miconazole daktarin breastfeeding nipple thrush")

fact("newborn-problems",
 "Common Newborn and Baby Problems: A Parent’s Guide",
 "A guide to common newborn and baby problems: jaundice, cradle cap, sticky eyes, skin spots, crying, reflux, tongue-tie, belly button, hips, eyes and when to get help.",
 "Common Newborn and Baby Problems", "common newborn problems",
 "Most newborn worries are common, harmless and pass with time. This is a quick guide to what’s normal, what helps, and the few signs that need a doctor quickly.",
 h2("Skin and scalp", [
   "<a href=\"/newborn-skin/\">Newborn skin spots</a>: milia, baby acne, newborn rash and stork marks. Leave them alone.",
   "<a href=\"/cradle-cap/\">Cradle cap</a>: greasy yellow scale on the scalp. Harmless, gone by about 12 months.",
   "<a href=\"/eczema/\">Eczema</a>: dry, itchy, red patches. Moisturise often.",
   "<a href=\"/nappy-rash/\">Nappy rash</a>: frequent changes, nappy-free time and a barrier cream."]) +
 h2("Eyes", [
   "<a href=\"/blocked-tear-duct/\">Blocked tear duct</a>: a watery, sticky eye that usually clears by 12 months.",
   "<a href=\"/strabismus/\">Strabismus (squint)</a>: a turned eye after 4 months needs checking.",
   "<a href=\"/congenital-ptosis/\">Congenital ptosis</a>: a droopy eyelid from birth. Eye checks protect vision."]) +
 h2("Feeding, tummy and crying", [
   "<a href=\"/newborn-jaundice/\">Newborn jaundice</a>: yellow skin in the first week. Pale poo needs checking.",
   "<a href=\"/baby-reflux/\">Reflux</a>: spilling milk is common and usually settles by 12 months.",
   "<a href=\"/baby-crying/\">Crying and colic</a>: peaks at 6 to 8 weeks, settles by 3 to 4 months.",
   "<a href=\"/tongue-tie/\">Tongue-tie</a>: treat only if it truly affects feeding.",
   "<a href=\"/oral-thrush-babies/\">Oral thrush</a>: white patches in the mouth that don’t wipe off."]) +
 h2("Belly button and hips", [
   "<a href=\"/umbilical-problems/\">Belly button problems</a>: cord care, granuloma and umbilical hernia.",
   "<a href=\"/hip-dysplasia/\">Hip dysplasia (DDH)</a>: routine checks, and leave room for the legs when wrapping."]) +
 h2("Get help urgently if your baby", [
   "Has a temperature of 38°C or more and is under 3 months old.",
   "Is floppy, very sleepy, hard to wake or not feeding.",
   "Has fewer than 4 to 5 wet nappies a day after the first week.",
   "Is breathing fast or with effort, or has blue or pale lips.",
   "Has green or bloody vomit, or a rash that doesn’t fade under a glass.",
   "Call 000 in an emergency. For advice, call the Pregnancy, Birth and Baby helpline on 1800 882 436."]),
 [("What newborn problems are normal?", "Many: skin spots, mild jaundice in the first week, spilling milk, sneezing, hiccups, noisy breathing when asleep, crossing eyes up to 4 months, and lots of crying in the evenings. Most pass with time."),
  ("When should I take my newborn to the doctor?", "Any fever of 38°C or more under 3 months, a baby who is floppy, very sleepy or not feeding, fewer wet nappies, breathing problems, green or bloody vomit, or a rash that doesn’t fade under pressure. Trust your instincts."),
  ("Who can I call for advice about my baby?", "Your GP, your child and family health nurse, or the Pregnancy, Birth and Baby helpline on 1800 882 436 (7am to midnight, 7 days). In an emergency, call 000.")],
 [PBB, ("Raising Children Network", "https://raisingchildren.net.au/", "Australian parenting guides, reviewed by experts. Free.")],
 [("Sydney Children’s Hospitals Network: Jaundice in newborn babies", "https://www.schn.health.nsw.gov.au/parents-and-carers/fact-sheets/jaundice-in-newborn-babies"),
  RCH_CRY,
  ("Royal Children’s Hospital Melbourne: Reflux (GOR) and GORD", "https://www.rch.org.au/kidsinfo/fact_sheets/Reflux_GOR/"),
  ("Pregnancy, Birth and Baby", "https://www.pregnancybirthbaby.org.au/")],
 [("Fever in children", "/fever-in-children/"), ("Newborn jaundice", "/newborn-jaundice/"), ("Crying and colic", "/baby-crying/")],
 groups=G, blurb="A quick guide to common newborn worries: what’s normal, what helps and when to get help.",
 search="newborn problems baby problems common newborn issues baby health guide new parents what is normal newborn when to see doctor baby")
