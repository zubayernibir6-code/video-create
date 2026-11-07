# BRIEF — NW1 · Editorial Explainer (voiced)

**Brand:** The Brief — an explainer newsletter (fictional)  
**Length / format:** ≈27 s, 16:9 (voice-over 23.6 s: assets/voice/vo.wav + vo.srt + vo.words.json)

## Concept
A TRUE story: the internet runs through undersea cables. VO (Charon) line starts: 0.00 'When you send a message…' · 4.68 'it goes under the sea' · 7.00 'Almost all the data between continents…' · 12.58 'Some are no thicker than a garden hose' · ≈13.9 'hundreds of them' · ≈16.2 'more than a million kilometers' · 19.28 'The internet isn't in the cloud. It's in the ocean.'

## Look (palette, type, finish)
Vox / Johnny-Harris collage: warm paper #efe8da with fibre texture (S.grain .05, multiply), ink #1a1a1a, highlighter yellow #ffe14d (marker strokes behind words), red marker #e63b2e for circles/arrows. Playfair Display (headlines, 120 px) + Inter (labels). Cut-paper cards with soft shadows, slight rotations (−3° … 3°), tape strips.

## Beats (fit the timing to the music's strong beats / drops; every text stays up long enough to read)
- a message bubble launches up toward a satellite icon — a red marker X over the satellite ('it doesn't go to space')
- the camera dives down a paper cross-section: sky → sea surface → seabed (layers slide)
- a cable draws along the seabed across a paper world map; highlighter behind 'almost all'
- cut-away: a cable cross-section (concentric rings) beside a garden-hose outline for scale
- the map fills with many cable lines at once + a handwritten-style '1,000,000+ km' label
- end: 'The internet isn't in the cloud.' (cloud crossed out) / 'It's in the ocean.' + The Brief masthead + 'Concept work'

## Craft notes
Sync to vo.words.json. Paper elements slide in with a tiny overshoot (springSoft) and settle at slight angles; highlighter strokes draw left → right behind words (scaleX from 0 on a block, origin left). Facts exactly as the VO says — no extra numbers.

## Sound
voice at 0.3 s; data-glitch music low (.3) ducked under the voice; page-turn (.25) on card entries, whoosh-short on dives, marker click-soft; end sparkle.

## Done means
- `node tools/studio/check.mjs projects/pf-nw1-thebrief` ends with ✓; plan-check 0 ERROR; you looked at every held moment and fixed what a top studio would not ship.
- A small furniture label "Concept work · fictional brand" on the end card.
- `piece.json`: brief filled (client, goal, audience, message, cta, tone) and `reel` = the best 3–5 s (for the showreel).
