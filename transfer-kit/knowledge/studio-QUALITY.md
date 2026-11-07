# Motion Studio — the quality bar (what a critic checks before a piece may render)

Two layers. **Machine rules** are measured by `tools/studio/check.mjs` (+ hyperframes check, design-lint, qc.mjs after
the render). **Eye rules** need a human or a critic agent looking at the contact sheets and full frames.
Numbers: docs/business/research/R3-trends-craft.md §8 (Material 3, Carbon, Fluent, WCAG, Netflix, BBC) + CLAUDE.md §0d.

## A. Machine rules (must all pass)
1. `node tools/studio/check.mjs projects/<p>` ends with `✓ studio check passed` (static rules, lint, runtime, layout,
   motion, contrast ≥ 4.5:1, design-lint, snapshots).
2. No network URL, no Math.random / clock, timeline registered in the page, S.done() called.
3. studio.js guards silent: no linear ease on visible motion, camera last key at rest, ≤ 3 flashes in any second,
   timeline not past the end.
4. Sound: `node tools/studio/sound.mjs` with no dead-air warning; after the render qc.mjs: −14 LUFS ±1, true peak
   ≤ −1 dBTP, picture and sound start together, no frozen picture ≥ 5 s.

## B. Eye rules (the critic's checklist — every item gets a yes/no with a time stamp)
**Story & hierarchy**
- The hook (product, promise or number) is on screen within 3 s, in ≤ 8 words.
- Each shot has ONE focal point; the element that moves first is the most important one.
- The end card names the brand, the promise and one CTA; it holds ≥ 1.5 s and ≤ 3.5 s; it carries the small
  "Concept work · fictional brand" label (portfolio pieces).
**Typography**
- Readable text ≥ 28 px (1080p), kickers ≥ 24 px; text held ≥ max(1.5 s, 0.3 s × words).
- No widow word on a line alone; no clipped descenders; nothing touching the frame edge or a panel edge.
- Display type tight (−0.02 … −0.05 em), body never tracked; Bengali never tracked.
**Layout**
- Safe areas: 16:9 ≥ 5 % margins; 1:1 ≥ 6 %; 9:16 text inside x 6–82 %, y 15–62 %.
- Rows/columns align on one grid; panels fit their content; nothing overlaps unless it is deliberate layering.
**Motion**
- Entrances decelerate, exits accelerate and are faster (≤ 0.7×), moves between places use the standard curve.
- UI-sized moves 100–500 ms, hero reveals ≤ 1.2 s; no element moves on a straight constant speed unless it is
  continuous motion (a drift, a spinner, a ticker).
- Stagger 3–8 frames per item, ≤ 0.6 s per group; at most one bouncy element per scene.
- Camera pushes start below 1 and land on 1; no held frame shows content scaled past its layout.
- Something changes every 2–3 s; a deliberate breath (দম) ≤ 1.5 s of stillness and never with silence.
**Finish**
- Three layers per frame (background treatment, content, accent); no flat empty black/white backgrounds.
- One accent colour carries the hierarchy; contrast is comfortable, not just legal.
- Shadows are soft and layered; glass panels change blur/size while entering (never opacity alone).
**Sound**
- Every scene change has a sound; UI events tick quietly; the hero lands on a hit or a music drop;
  the music fades out by the end (no hard stop); voice (if any) is clear over the music.
**Honesty**
- No real brand logos or names, no real or AI faces, no fake named testimonials; real-world facts are true.

## C. Verdict
- **ship** — all A pass, no B item fails.
- **fix** — list each failing B item as {time, what is wrong, how to fix}; re-check after the fix.
