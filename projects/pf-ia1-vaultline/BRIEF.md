# BRIEF — IA1 · 3D Architecture Stack (Three.js)

**Brand:** Vaultline — a zero-trust security platform (fictional)  
**Length / format:** 16 s, 16:9

## Concept
Start from the registry block exploded-stack (`npx hyperframes add exploded-stack --no-clipboard`), rewrite to local three + the studio timeline. Title 'Security in every layer.'

## Look (palette, type, finish)
Black-blue #04070d; translucent isometric plates (glass-like, edges glowing cyan #7dd3fc) for the layers Edge · Identity · API · Compute · Data · Encryption; labels in Space Grotesk 600 (30–36 px) on leader lines; JetBrains Mono for small tags.

## Beats (fit the timing to the music's strong beats / drops; every text stays up long enough to read)
- 0–2.5 title + the stack assembled as one block
- 2.5–7 plates explode apart vertically with stagger; labels slide in beside each
- 7–11 a glowing data cube travels down through the layers; each layer flashes as it is checked ('verified' tags)
- 11–14 plates collapse back; the camera orbits ~25° and settles
- 14–16 lockup Vaultline + 'Zero trust, zero drama.'

## Craft notes
Labels as HTML overlays placed from projected 3D points (vector.project(camera), per frame) to keep text crisp — or text planes if simpler. The camera ends at rest.

## Sound
cinematic-reveal; the split = whoosh-cinematic peaking on it, each layer flash click-soft/ping low, collapse whoosh, lockup impact.

## Done means
- `node tools/studio/check.mjs projects/pf-ia1-vaultline` ends with ✓; plan-check 0 ERROR; you looked at every held moment and fixed what a top studio would not ship.
- A small furniture label "Concept work · fictional brand" on the end card.
- `piece.json`: brief filled (client, goal, audience, message, cta, tone) and `reel` = the best 3–5 s (for the showreel).
