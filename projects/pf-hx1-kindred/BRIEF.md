# BRIEF — HX1 · How-It-Works Explainer (voiced)

**Brand:** Kindred Health — video doctor visits (fictional)  
**Length / format:** ≈34 s, 16:9 (voice-over 30.0 s: assets/voice/vo.wav + vo.srt + vo.words.json; duration = voice + a 3–4 s end card)

## Concept
VO (Achird) line starts (vo.srt): 0.00 problem · 3.44 'With Kindred…' · ≈7.4 'Here's how it works.' · 9.10 'One…' · 12.08 'Two…' · 17.32 'Three…' · 23.60 privacy · 27.10 'Kindred. Care that comes to you.'

## Look (palette, type, finish)
Friendly clinical: background #eef7f3 (soft mint) with white rounded panels; ink #0f2e25, muted #5d746c; ONE accent green #1fb07a; warm #ffb86b only for tiny highlights. Manrope 700/600. Flat illustration from simple shapes: phones, chat bubbles, a clinician as an abstract avatar (circle head + shoulders, no face details), pill bottle, map pin. Radii 28–40 px.

## Beats (fit the timing to the music's strong beats / drops; every text stays up long enough to read)
- problem: a calendar with phone-call icons piling up → crossed out
- Kindred reveal: logo mark + a phone showing 'Doctor in 8 min'
- Step 1 (big numeral 1): a chat bubble typing symptoms
- Step 2: matching — three abstract clinician cards shuffle, one locks with a green ring; '< 10 min' timer
- Step 3: a video-call frame (abstract avatars) → a prescription card flies to a pharmacy pin → a chat follow-up bubble
- privacy: a shield + lock folding over a records card
- end: Kindred lockup + 'Care that comes to you.' + 'Get the app'

## Craft notes
Every visual change lands on its spoken word (± 2 frames): use vo.words.json + the voice offset. Big step numerals (Manrope 800, 240 px) slide in as chapter anchors. Optional phrase captions bottom-centre (40 px, balance).

## Sound
voice at 0.3 s; bright-future at gain .35, ducked under the voice span to .5; soft pops/clicks on illustration beats; end chime.

## Done means
- `node tools/studio/check.mjs projects/pf-hx1-kindred` ends with ✓; plan-check 0 ERROR; you looked at every held moment and fixed what a top studio would not ship.
- A small furniture label "Concept work · fictional brand" on the end card.
- `piece.json`: brief filled (client, goal, audience, message, cta, tone) and `reel` = the best 3–5 s (for the showreel).
