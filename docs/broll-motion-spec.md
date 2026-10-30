# Motion-graphics B-roll spec, v2 (2026-10-30)

He pasted a brief for a "broadcast-ready 6-second motion-graphics B-roll". It asked for: 4K60; spring physics
(stiffness 170, damping 14); `cubic-bezier(0.16, 1, 0.3, 1)` settles; no linear motion; procedural grain (overlay 5 %);
three parallax depth layers; a slate palette with one luminous accent; no raster assets; typed code; deterministic
frames. Then he asked: "go deeper and make it the best". This file is the deeper version. `tools/broll` builds it,
and every future motion-graphics B-roll in this workspace follows it.

## 1. What each rule really means (the numbers behind them)

| Rule | The physics or maths | What it looks like |
| --- | --- | --- |
| Spring k = 170, c = 14, m = 1 | ω₀ = √170 = 13.04 rad/s; ζ = 14 / (2·√170) = 0.537 (under-damped). Overshoot = e^(−ζπ/√(1−ζ²)) = 13.5 %; within 2 % by 4/(ζω₀) ≈ 0.57 s | A snap that passes its mark by ~13 % and settles in about half a second: alive, not bouncy |
| Settle `cubic-bezier(0.16, 1, 0.3, 1)` | An "expo-out" curve: 50 % of the move is done by ~11 % of the time, the last 10 % takes the second half | Fast arrival, long silky landing: the "premium" feel |
| No linear motion | Every tween has an ease. Constant drift is a sine wave. Grain is re-seeded per frame, not slid | Nothing moves like a machine |
| Grain, overlay, 5 % | Dithering: noise of ±1–2 code values breaks the 8-bit steps of a dark gradient. It must CHANGE every frame, or it reads as a dirty screen | No banding in the slate gradients, even after H.264 |
| Parallax 1.2 / 1.0 / 0.4 | A layer at depth d moves by camera × factor: foreground faster, background slower | Real depth from a 2D camera move |
| One accent on slate | Luminance contrast carries the hierarchy: the accent is the only saturated colour, so it is where the eye goes | Instant focus, no colour noise |

## 2. What v2 adds (the "deeper" layer)

1. **Composition on the golden ratio.** The focal point sits on a φ intersection: x = 0.618 W, y = 0.382 H. The
   structure itself is golden: nodes are placed by **phyllotaxis**, a sunflower spiral at the golden angle
   137.508°, rᵢ = c·√i. The count is a Fibonacci number (34).
2. **Cinematic pacing in three acts over 6 s:**
   - hook (0–0.3 s): a light streak whips in along the spiral;
   - build (0.3–2.8 s): the core ignites and the nodes snap in one by one;
   - charge (2.8–4.2 s): energy pulses run inward;
   - resolve (4.2–5.2 s): the shell locks in, with a single flash;
   - hold (5.2–6.0 s): a clean, still handle for the editor's cut.
   The rhythm accelerates into the lock, then breathes out.
3. **Animation principles, used on purpose:**
   - anticipation: a 3 % counter-move before the lock;
   - overlapping action: children lag their parent by 2–4 frames;
   - follow-through: the nodes "breathe" inward after the lock;
   - staging: one thing moves at a time where it matters.
4. **Micro-interactions.** A node arriving sends a ping ring (every third node, so it never clutters). A link draws
   from node to core. A pulse touching the core gives it a 6 % spring bump.
5. **Tactile realism without raster assets:**
   - bloom from layered radial gradients;
   - depth of field: the foreground bokeh is pre-blurred once (a static SVG blur, never an animated filter);
   - a vignette;
   - grain (§1);
   - a light falloff on the lines (bright near the core, dim at the edge).
6. **Sensory hook and sound.** The streak lands at 0.3 s on an impact, so there is a sync point for sound. Optional
   SFX lane: whoosh on the streak, sparse soft ticks on the node pings, a riser into the lock, an impact plus a
   sparkle on the lock. Two deliverables: with SFX and silent.
7. **Cohesive design language as tokens:**
   - one palette;
   - stroke widths 2 / 4 / 8 px at 4K;
   - an 8-point spacing grid (16 px at 4K);
   - one radius family;
   - two eases (the spring and the expo-out settle).
   A new B-roll scene reuses the tokens, so a video's B-roll all looks like one family.
8. **Editorial usefulness.**
   - Title-safe 90 %.
   - The focal point is off-centre, so a caption or a talking head can share the frame.
   - The first and last frames are clean (fade from black, still hold).
   - The camera move lands exactly on 1× (CLAUDE.md §0d.1).
9. **Determinism (§0i State):**
   - every value is a function of the timeline time;
   - randomness comes from a seeded PRNG (mulberry32);
   - no `Math.random`, no `Date`.
   Proof: snapshots of the same frames taken twice must be byte-identical.

## 3. Tech choice

HyperFrames (HTML + SVG + GSAP), 3840×2160 at 60 fps. Why not Three.js: real 3D on an Intel UHD 620 in screenshot
capture at 4K is slow and fragile here, and 2.5D parallax gives the depth this look needs. Why not Remotion or Motion
Canvas: HyperFrames is this workspace's proven, seekable renderer, and its B-roll drops straight into tools/abroll.

The physics lives in `tools/broll/motion.ts` (typed TypeScript, run by Node 24's type stripping). The same functions
are injected into the page, so the code that is tested is the code that renders.

## 4. Guards (machine checks, run by the builder)

- No raster: the page may not reference .png / .jpg / .webp, or a data: image other than an SVG.
- No linear ease: no `ease: "none"` or `linear` in the timeline.
- The physics test: spring overshoot 13.5 % ± 0.5, settled within 2 % by 0.6 s; the bezier is monotonic and lands on 1.
- Determinism: two snapshot passes of the same frames give identical hashes.
- After the render: qc.mjs (codec, fps, size, edges) and a contact sheet read at a frame every 0.25 s.
