---
name: motion-broll
description: Build a broadcast-grade motion-graphics B-roll clip (4K or 1080p, 60 fps, a few seconds, no raster assets) in the D:\Video Create workspace with tools/broll - spring physics, expo-out settles, golden-ratio composition, three-layer parallax, procedural grain, a single luminous accent, deterministic frames - to drop into tutorials, talking-head videos (AB styles) or promos. Use when he asks for B-roll, a motion graphic insert, an "abstract tech / AI / data" background, a sting, or pastes a motion-design brief (springs, easing, grain, parallax, 4K60). Full videos -> hyperframes / the style engines; real-world footage -> stock or AI clips (docs/ai-video-generation.md).
---

# Motion-graphics B-roll (built 2026-10-30; clips: projects/broll-signal-core "Signal Core" MG1, projects/broll-growth-curve "Growth Curve" MG2)

Read `docs/broll-motion-spec.md` first. It explains the rules and the numbers behind them. CLAUDE.md applies: the plan
gate (PLAN.md + plan-check + his OK), craft rules §0d, five elements §0i.

## The kit (tools/broll)

- **`motion.ts`** holds the typed physics. Node 24 runs it as is (type stripping, no build step; there is no `tsc` to
  check the types).
  - `springEase(duration, k, c, m)`: the analytic damped spring. His brief's k 170, c 14 overshoots 13.5 % and
    settles in 0.44 s.
  - `cubicBezier(x1, y1, x2, y2)`: e.g. the expo-out settle (0.16, 1, 0.3, 1).
  - `mulberry32(seed)`.
  - `phyllotaxis(n, scale, centre)`: a sunflower spiral at the golden angle.
  - `goldenPoint(W, H)`: the φ intersection at (0.618 W, 0.382 H).
  - `grainTile(...)`: procedural SVG noise.
  - `fibonacci(n)`: Fibonacci for real n (exact at integers, smooth between): a curve through 1, 2, 3, 5 … 55.
  - `monotoneCubic(xs, ys)`: Fritsch–Carlson interpolation that never overshoots, e.g. a time → distance map that never runs backwards.
  - `pageScript()`: the same function sources, injected into the page.
- **`motion.test.ts`** runs 11 checks: overshoot, settle, endpoints, monotonic bezier, deterministic PRNG, and that the
  injected code equals the tested code. Run it after any change to `motion.ts`.
- **`scene.ts`** is the shared shell of every scene from MG2 on. Do not copy a scene file; import it.
  - The tokens `C`, `STROKE`, `W`, `H`, `FPS`, and `backdrop(centre, rnd, radius, opacity)`, which gives the grid and the bokeh.
  - `scene({dir, res, silent, dur, title, focus})` returns these helpers:
    - `tw()`: GSAP fromTo, for entrances from hidden.
    - `burst(id, at, d, s0, s1, o0, centre)`: a ping, flash or ripple, computed per frame.
    - `cue()`: a sound effect.
    - `camera()`: a GSAP dolly.
    - `write({bg, sub, fg, defs, sets, vars, onUpdate, camera})`.
  - `write` takes `camera`, a per-frame track of `[zoom, x, y]` for each frame. Parallax 0.4 / 1 / 1.2 is applied in the page.
  - Guards: no raster, no linear ease, no SVG transform attributes, a burst on a missing element, a burst element that is also tweened, a camera track that does not end on 1×, a GSAP camera plus a track.
- **`growth-curve.ts`** is MG2: nine points with Fibonacci heights, a tip timed by `monotoneCubic` (each segment 15 % faster), a critically damped camera follow that is pulled back to 1×, a hex lock and a hop wave. Read it as the example of a scene on `scene.ts`.
  - Its own guards: the points fall in the PLAN's beats; the tip stays inside the frame; the camera is exactly 1× during the hold.
- **`signal-core.ts`** is the first scene (MG1). It was written before `scene.ts` and carries its own copy of the shell.
  - Every scene runs the same way: `node tools/broll/<scene>.ts projects/<name> [--res=4k|1080] [--silent]`.
  - It writes index.html, build/cues.json and, unless `--silent`, assets/media/mix.wav.

## Workflow

1. Start: `node tools/new-video.mjs <name> --kind=blank`, then write PLAN.md (beats as shot rows of ≤ 3 s, SFX in
   backticks). Run `node tools/plan-check.mjs`, show him, and wait for his OK.
2. Build at `--res=1080` first. Then:
   - Run `npx hyperframes check projects/<name>`. It must be clean.
   - Snapshot the beats (`npx hyperframes snapshot … --at …`) and LOOK at them.
   - Snapshot the same times twice and `cmp` the PNGs. All must be identical: that is the determinism proof.
3. Rebuild at `--res=4k` and run `node tools/finish.mjs projects/<name> --quality=high --formats=16x9 --frames-cache=<C: folder>`,
   started detached. It runs check, design-lint, render, −14 LUFS and QC.
4. Copies:
   - silent: `ffmpeg -i master.mp4 -an -c copy …-silent.mp4`;
   - 1080p60: lanczos downscale.
   Then a contact sheet: `--every=0.25`.

## Traps that cost a run (2026-10-30)

- **Never put `transform="scale(0)"` or a CSS `transform-origin` on an SVG part.** GSAP decomposes a singular matrix,
  and all 34 nodes piled up in the SVG's corner. GSAP owns every transform. Set the hidden start state with
  `gsap.set(sel, { scale: 0 })` before the timeline.
- **Set SVG pivots once, before the timeline:** `gsap.set(core parts, { svgOrigin: "Fx Fy" })` and
  `gsap.set(nodes, { transformOrigin: "50% 50%" })`.
  - Without a pivot, ring2 turned about its bbox corner (check: `rotation_pivot_drift`).
  - With the pivot written into each tween, two tweens "overlapped" on svgOrigin.
- **Repeated kicks on one element are physics, not tweens.** Twelve overlapping bump tweens on the core gave 38
  `overlapping_gsap_tweens` warnings. They are now a per-frame superposition of spring impulse responses,
  `k(t) = Σ A·e^(−ζω₀(t−tᵢ))·sin(ω_d(t−tᵢ))`, evaluated in the page's single onUpdate on a wrapper `<g>`.
- **The no-linear rule includes drift:** use sine.inOut, or a per-frame formula. Grain is re-seeded per frame, never slid.
- **The camera dolly lands on exactly 1×** (§0d.1). Parallax = the camera move × the layer factor (0.4 / 1 / 1.2).
- **A fromTo whose from-state is VISIBLE (a ping, a flash) shows that state at every earlier time after a backward seek.**
  - GSAP renders a rewound tween at progress 0. MG1's flash has this latent bug; the renderer only seeks forward, so it never showed.
  - Use `S.burst()`: its scale and opacity are a function of t, and it is invisible outside its window.
  - Use `tw()` only for entrances that start hidden (scale 0, opacity 0, dash offset full).
- **A camera that follows something is precomputed, not tweened.**
  - Simulate the follower in Node (MG2: critically damped, ω 5.5, 1/1200 s steps).
  - Blend to identity with `settle(smoothstep(u))`. Plain expo-out starts with a jolt mid-shot.
  - Pass the frames as `camera` to `write`.
  - Check the subject stays inside the frame at every frame (MG2 throws).
- **Snapshot determinism under the hardware GPU:** one PNG of 12 may differ by ≤ 2 levels in a few pixels (PSNR ~90 dB). That is GPU rounding. A state bug differs by whole shapes; measure with ffmpeg `psnr` before calling it either.

## Making the next B-roll scene

Write `tools/broll/<scene>.ts` on `scene.ts`, with `growth-curve.ts` as the example. The shell keeps every clip one family: tokens, parallax layers, grain, vignette, fade and guards. The scene adds only its SVG, its beats and its guards for the PLAN's beats. Ideas that fit his topics:
- a data ribbon (numbers as flowing bars);
- a growth curve that draws itself;
- a "small steps" staircase in 3D-ish isometric;
- a document/file stream (his tutorials);
- a globe of points (AI in the world).

Add each finished scene to `tools/variants.json` + VARIANTS.md as MG3, MG4 … with its proof.
