# BRIEF — UT1 · 3D UI Tour

**Brand:** Atlas CRM — a sales CRM (fictional)  
**Length / format:** 25 s, 16:9

## Concept
A guided camera flight through four app screens floating in 3D space: Pipeline → Deal → Forecast → Inbox.

## Look (palette, type, finish)
Dark slate #0b1220 → #0f1a2e gradient; panels #121c30 with 1px rgba(255,255,255,.08) borders and an inner top highlight; ink #eaf0ff, muted rgba(234,240,255,.62); ONE accent teal #2dd4bf. Manrope (600/700, −0.03em), JetBrains Mono for numbers.

## Beats (fit the timing to the music's strong beats / drops; every text stays up long enough to read)
- 0–2.5 title 'Your whole pipeline. One place.' over a field of tilted panels
- 2.5–7 camera dolly (S.camera on a 3D stage, perspective ~1800) to panel 1 PIPELINE: kanban columns; one card moves 'Proposal' → 'Won' with a teal glow
- 7–12 travel to panel 2 DEAL: a deal card with a contact (initials only), an activity timeline ticking in
- 12–17 panel 3 FORECAST: chart grows; '$2.4M forecast' counts up
- 17–21 panel 4 INBOX: an email thread with an AI 'next step' suggestion chip
- 21–25 pull back to all four panels in a constellation; lockup 'Atlas' + 'Sell with clarity.' + 'Book a demo'

## Craft notes
Each panel is a 3D plane (translateZ / rotateY) in ONE stage; the camera travels 1.0–1.2 s ('settle') and HOLDS flat on each panel ~1.5 s so text is readable; the final camera key is at rest. Panels out of focus: blur(4px) + opacity .5 (tweened). Parallax background dots.

## Sound
bright-future; travel = whoosh-short (.3), card moves = click-soft, count-up typing (.18), lockup impact-bass-2 (.4) + sparkle.

## Done means
- `node tools/studio/check.mjs projects/pf-ut1-atlas` ends with ✓; plan-check 0 ERROR; you looked at every held moment and fixed what a top studio would not ship.
- A small furniture label "Concept work · fictional brand" on the end card.
- `piece.json`: brief filled (client, goal, audience, message, cta, tone) and `reel` = the best 3–5 s (for the showreel).
