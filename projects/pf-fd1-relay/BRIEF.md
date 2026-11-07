# BRIEF — FD1 · Feature Drop

**Brand:** Relay — a shared team inbox (fictional)  
**Length / format:** 15 s, 16:9 (design it so a 1:1 crop of the centre also works)

## Concept
Feature: 'Smart Summaries' — one click turns a 40-message thread into 3 bullet points.

## Look (palette, type, finish)
LIGHT theme — the portfolio needs range. Background #f5f6fa with a soft white→#eef1ff gradient; UI white cards with hairline #e3e6ef borders and soft shadows (0 1px 2px rgba(16,24,40,.06), 0 12px 32px -8px rgba(16,24,40,.12)); ink #0b1020, muted #5b6478; ONE accent electric blue #2f6bff. Inter (display 600, tracking −0.035em). Grain off or ≤ 0.03 on light looks.

## Beats (fit the timing to the music's strong beats / drops; every text stays up long enough to read)
- 0–1.5 hook: big type 'Long thread?' then 'Meet Smart Summaries.' (mask lines)
- 1.5–5 a crowded thread (skeleton message rows + a few real lines) scrolls fast; the cursor moves to a 'Summarize' button (sparkle icon) and clicks (click ring)
- 5–9 punch-in (camera 0.94 → 1 onto the summary card): the 40 messages collapse into a card with 3 typed bullets + a 'Decision: ship Friday' chip
- 9–12 benefit line 'Catch up in 5 seconds.' + stat chip '40 messages → 3 lines'
- 12–15 lockup: Relay logo (a simple geometric mark you design in SVG) + 'Smart Summaries, now in Relay' + CTA 'Try it free'

## Craft notes
The punch-in lands on scale 1 (start below 1). Collapse: rows scale/translate into the card with stagger (S.f(2)). Use S.cursor, S.type for bullets (cps 40), S.sweep on the card at the reveal.

## Sound
studio-pulse; summary reveal (≈5 s) on a strong beat; click on the button, pops on bullets, whoosh-short on transitions, sparkle at the reveal.

## Done means
- `node tools/studio/check.mjs projects/pf-fd1-relay` ends with ✓; plan-check 0 ERROR; you looked at every held moment and fixed what a top studio would not ship.
- A small furniture label "Concept work · fictional brand" on the end card.
- `piece.json`: brief filled (client, goal, audience, message, cta, tone) and `reel` = the best 3–5 s (for the showreel).
