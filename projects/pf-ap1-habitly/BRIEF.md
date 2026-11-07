# BRIEF — AP1 · App Store Preview

**Brand:** Habitly — a habit tracker app (fictional)  
**Length / format:** 20 s, 9:16 (1080×1920)

## Concept
Store-preview flow: build a habit → check it off → the streak grows → weekly insight.

## Look (palette, type, finish)
Bright and friendly: cream #fff8ef background with soft blurred coral/peach blobs; phone in the centre (studio.css .phone, scaled ~1.5× through a wrapper so the screen reads); app UI inside: white cards, coral accent #ff6b4a, green #22c55e only for success. Space Grotesk (headlines 700) + Inter.

## Beats (fit the timing to the music's strong beats / drops; every text stays up long enough to read)
- 0–2.5 caption 'Small habits. Big change.' (inside the safe zone y 15–62 %); phone rises with springSoft
- 2.5–7 tap '+' (a soft touch circle, not a mouse arrow), choose 'Read 10 pages', a time-picker wheel scrolls, Save
- 7–11 home screen: 4 habit rows; taps fill the checks coral→green with a burst; 5–8 seeded confetti bits (per-frame)
- 11–15 streak screen: flame + '12-day streak' count-up, calendar dots fill in a wave
- 15–20 insight card 'You read 70 pages this week' → end: app icon + 'Habitly' + 'Free on iOS & Android' (plain text button, no store badges)

## Craft notes
Captions above the phone, inside the 9:16 text-safe union (x 6–82 %, y 15–62 %); the phone body may extend lower. Screen changes = shared-axis pushes (0.35–0.45 s). Nothing outside the 1080 width.

## Sound
bright-future; taps click-soft (.32), checks pop (.28) + sparkle (.18) on the last, streak count typing (.16), transitions whoosh-short (.22), end chime (.3).

## Done means
- `node tools/studio/check.mjs projects/pf-ap1-habitly` ends with ✓; plan-check 0 ERROR; you looked at every held moment and fixed what a top studio would not ship.
- A small furniture label "Concept work · fictional brand" on the end card.
- `piece.json`: brief filled (client, goal, audience, message, cta, tone) and `reel` = the best 3–5 s (for the showreel).
