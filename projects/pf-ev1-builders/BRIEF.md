# BRIEF — EV1 · Event Promo

**Brand:** Builders Summit 2027 — a product & AI conference (fictional)  
**Length / format:** 12 s, 1:1 (1080×1080)

## Concept
'BUILD WHAT'S NEXT.' May 14–15, 2027 · Lisbon · 40 speakers · Register.

## Look (palette, type, finish)
Poster energy: black #0a0a0a + off-white #f2efe8 + ONE accent orange #ff4d00. Anton for giant type (220–320 px, uppercase), Inter for details. Swiss grid with hairlines; type blocks wipe in.

## Beats (fit the timing to the music's strong beats / drops; every text stays up long enough to read)
- 0–2.5 giant 'BUILD' 'WHAT'S' 'NEXT.' slam line by line (snap ease); an orange block wipes behind 'NEXT.'
- 2.5–5 date and city on a split grid: 'MAY 14–15' / '2027' / 'LISBON' with hairlines drawing
- 5–8.5 speaker grid: 6 monogram cards (initials in circles, invented names like 'R. Okafor', roles like 'Head of Design') flip in with stagger
- 8.5–12 'Register now' orange pill + 'builderssummit.example' (.example is a reserved domain) + countdown '186 days to go'

## Craft notes
Everything snaps to a 12-col grid with 48 px margins. Slams: scale 1.08 → 1 with snap ease + 2-frame hold. Flip cards: rotationY with transformPerspective.

## Sound
studio-pulse; each slam whoosh (.32), impact-bass-1 short (len .6, .3) on the last; hairlines whoosh-short (.15); card flips click-soft; register pill pop.

## Done means
- `node tools/studio/check.mjs projects/pf-ev1-builders` ends with ✓; plan-check 0 ERROR; you looked at every held moment and fixed what a top studio would not ship.
- A small furniture label "Concept work · fictional brand" on the end card.
- `piece.json`: brief filled (client, goal, audience, message, cta, tone) and `reel` = the best 3–5 s (for the showreel).
