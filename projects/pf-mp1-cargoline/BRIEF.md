# BRIEF — MP1 · Map Story

**Brand:** Cargoline — a global freight network (fictional)  
**Length / format:** 16 s, 16:9

## Concept
'One network. 120 ports.' Routes arc between hubs — real port cities are fine (Shanghai, Singapore, Rotterdam, Dubai, Santos, Los Angeles); no real company names.

## Look (palette, type, finish)
Dark ocean #050b14 → #071426; land as a dot matrix in #1b2a40; ONE accent orange #ff8a3d for routes and hubs; ink #e8f0ff. Inter + JetBrains Mono for coordinates.

## Beats (fit the timing to the music's strong beats / drops; every text stays up long enough to read)
- 0–2.5 the world appears as dots (a wave from the left); title 'One network. 120 ports.'
- 2.5–9 hubs ping one by one with labels; arcs draw between them; ships = small glowing dots travelling the arcs (per frame from the path)
- 9–12 camera pushes 0.9 → 1 toward the Asia–Europe lane (lands at 1); counter '18,400 containers in motion'
- 12–16 pull back (start below 1, settle at 1) + lockup 'Cargoline — Freight, visible.' + 'Track a shipment'

## Craft notes
Dot map: from the registry world-map block's geography (rewrite CDN refs) or an embedded simplified land path; sample dots on a grid where the point is inside land (isPointInFill at build time — deterministic). Arcs = quadratic curves lifted poleward.

## Sound
cinematic-reveal (choose `from` so the drop lands on the push ≈ 9 s); pings on hubs (.2), whoosh-short on arcs, typing on the counter, impact on the lockup.

## Done means
- `node tools/studio/check.mjs projects/pf-mp1-cargoline` ends with ✓; plan-check 0 ERROR; you looked at every held moment and fixed what a top studio would not ship.
- A small furniture label "Concept work · fictional brand" on the end card.
- `piece.json`: brief filled (client, goal, audience, message, cta, tone) and `reel` = the best 3–5 s (for the showreel).
