# BRIEF — GH1 · 3D Glass Hero Title (Three.js)

**Brand:** Prism — a design tool (fictional)  
**Length / format:** 10 s, 16:9

## Concept
Start from the registry block glass-hero (`npx hyperframes add glass-hero --no-clipboard` inside the project), keep its idea, rewrite it to our kit: local three through the import map (assets/js/three is in the project), local Inter (no CDN), the scene rendered per frame from the studio timeline (S.everyFrame(t => render(t))), deterministic.

## Look (palette, type, finish)
Black stage; a giant headline 'PRISM' (Inter 900, ~420 px, white) behind a refracting glass form (twisted torus-knot or a rounded triangular prism) that turns so the type bends and splits into spectral fringes; then the tagline 'Design in every dimension.'

## Beats (fit the timing to the music's strong beats / drops; every text stays up long enough to read)
- 0–1 black → a light streak
- 1–4 the glass form rises in front of 'PRISM' (the type reveals behind it)
- 4–8 the form turns ~120°; refraction sweeps across the letters; a spectral highlight passes
- 8–10 tagline lands; the form eases to rest; hold

## Craft notes
WebGLRenderer: antialias, preserveDrawingBuffer true, pixel ratio 1, fixed 1920×1080. No requestAnimationFrame. Check the GPU output in snapshots (hardware ANGLE is available). Modest polygon counts for render speed.

## Sound
cinematic-reveal: put the form's arrival on the track's drop (from = 16.05 − arrival); whoosh-cinematic into it, sparkle on the spectral sweep, impact on the tagline.

## Done means
- `node tools/studio/check.mjs projects/pf-gh1-prism` ends with ✓; plan-check 0 ERROR; you looked at every held moment and fixed what a top studio would not ship.
- A small furniture label "Concept work · fictional brand" on the end card.
- `piece.json`: brief filled (client, goal, audience, message, cta, tone) and `reel` = the best 3–5 s (for the showreel).
