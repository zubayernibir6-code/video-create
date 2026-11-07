# BRIEF — LG1 · 3D Logo Sting (Three.js)

**Brand:** Orbit — a space-tech brand (fictional)  
**Length / format:** 6 s, 16:9

## Concept
Start from the registry block extruded-logo (`npx hyperframes add extruded-logo --no-clipboard`) — it ships Geist-Bold.typeface.json; rewrite to local three + the studio timeline (per-frame render from tl.time()). RoomEnvironment (assets/js/three/addons/environments) gives reflections with no HDR file.

## Look (palette, type, finish)
Black with a faint seeded starfield; 'ORBIT' as beveled 3D letters (chrome / brushed silver, blue rim light #4f7cff) flipping up one by one, light running across the bevels, a thin orbit ring sweeping around and locking.

## Beats (fit the timing to the music's strong beats / drops; every text stays up long enough to read)
- 0–0.6 dark, a light glint
- 0.6–2.6 letters flip up with spring stagger (4 frames)
- 2.6–4 light sweeps the bevels; the orbit ring draws around the word
- 4–6 lock + hold (camera at rest); a small 'Concept work' label

## Craft notes
Deterministic per-frame render; no rAF; fixed size; build geometry once at init.

## Sound
No music: set sound.music.track to "" (sound.mjs then skips music). SFX-only sting: whoosh-cinematic peaking on the first letter, click-soft per letter, impact-bass-1 + sparkle on the lock.

## Done means
- `node tools/studio/check.mjs projects/pf-lg1-orbit` ends with ✓; plan-check 0 ERROR; you looked at every held moment and fixed what a top studio would not ship.
- A small furniture label "Concept work · fictional brand" on the end card.
- `piece.json`: brief filled (client, goal, audience, message, cta, tone) and `reel` = the best 3–5 s (for the showreel).
