---
name: screen-tutorial
description: Turn the user's long screen recording (with his facecam intro/outro in the same file) plus a separate voice-over and BGM into a finished 16:9 tutorial in the D:\Video Create workspace - the screen re-timed to the voice (pauses shrunk, waits sped up with a speed chip, dead stretches cut), shown in a floating monitor with camera zooms, labels, green ticks, click rings, a cursor glow, privacy blurs and freezes over Windows glitches; facecam in a glass frame with cards. Use when he brings a how-to / walkthrough recording and asks for a tutorial, explainer or "kivabe korbo" video. Short ads from a recording -> screen-promo; his talking-head episodes -> episode-edit.
---

# Screen tutorial (learned on claude-video-tutorial, 8:30, 2026-10-29: 3 renders, ~35 mistakes, all now guarded)

Reference build: `projects/claude-video-tutorial`. **Copy its `build/` folder and change only data**: times,
anchors, views, text, blurs and freezes. CLAUDE.md is the authority on Bengali, the plan gate §0e, craft §0d, whole-video
§0h and the five elements §0i. This skill gives the order of work. Each step names the element it protects.

## The build (what each file does)

| File | Job |
| --- | --- |
| `build/timeline.mjs` | The single timing source. Voice ANCHORS (a spoken word ↔ a screen moment) set the play speed between them. Pauses ≥ 1.2 s shrink to 0.5 s; waits are ramped 1.8–3×; dead stretches are cut. `TL.S(source)` gives render time, `TL.Sinv(render)` gives source time. |
| `build/specs.json` | Data in SOURCE seconds/pixels: `camera` views, `anchors` (label targets), `clicks`, `drags`, `blurs`, `freezes`. |
| `build/cursor.json` | Cursor tip track (`tools/screen/track-cursor.py`). The glow and the ring positions read it. |
| `build/screen.mjs` | The screen clip: each piece played or held, blurs burnt in before re-timing, freezes. Pieces run 3 at a time. The frame count is checked. Writes `screen_poster.jpg` + `screen_last.jpg`. |
| `build/face.mjs` | intro.mp4 / outro.mp4 (facecam crop). The outro's first frames are held on the first clean face frame. |
| `build/speech.mjs`, `music.mjs`, `mix.mjs` | Voice track, music bed with gain envelope, mix with the SFX cues that build-page wrote. |
| `build/build-page.mjs` | index.html: cards, monitor, camera, labels (`tag()`), ticks, rings, glow (one sample per frame), callouts, cues.json. |

Rebuild order: `speech → music → screen → face → build-page → mix`. Then `node tools/preflight.mjs` and `finish.mjs`.

## Order of work

1. **Source** (উৎস), before planning:
   - `node tools/contact-sheet.mjs <rec> --every=0.5`.
   - `node tools/screen/glitch-scan.mjs <rec> --from=<screen start> --to=<screen end>`. Read every strip row. For each flash or half-drawn window, write down its exact bad frames and a clean `use` frame inside the same play piece.
   - Decide the blur level with the `privacy-blur` skill (default basic).
   - Measure where the facecam really starts and ends in the source. The switch frames still show the screen.
2. **Plan gate** (§0e): write PLAN.md and run plan-check. Get his OK.
3. **Time** (সময়): set the anchors from `voice.words.json` + `watch.mjs` moments.
   - Every label's show/hide comes from the event it describes: show on the frame where its text becomes true; hide at `S(window close / cut) − 0.3`, never "show + N s".
   - Boundaries go at half-frame midpoints. A freeze `use` is an exact frame number.
4. **Space** (জায়গা): measure each label's free space on source frames over its whole show time. Put it beside its target, never on text, inside the bezel. A tick is sized from the target (Claude's task circles are 18 px; use the `.tick.sm` class).
5. **State** (অবস্থা): GSAP for a seeking renderer.
   - x/y go in BOTH fromTo vars.
   - Hide an element in CSS before its entrance.
   - `tl.set(…, 0)` the starting value of anything that animates later.
   - Posters stand in where a clip has ended.
   - The glow reads `unfreeze(s)`.
6. **Proof** (প্রমাণ):
   - `node tools/preflight.mjs projects/<name>` (≈ 7 min for 8.5 min of video). It must show 0 ERRORs. Look at every WARN and every contact sheet in `.preflight/`.
   - After a fix: `--from/--to` for that stretch (≈ 1 min) plus `hyperframes snapshot --at` the fixed moments.
   - Then `finish.mjs --frames-cache=<C: folder> --out=<F: folder>`, started detached (≈ 2 h).
   - After the render: `contact-sheet --every=0.5`, A/V sync check, delivery.

## Traps that each cost a render (2026-10-29)

- **drawElement capture misplaced transformed layers.** finish.mjs now forces screenshot capture.
- **Rings were reused 4 at a time with x/y only in the FROM vars.** A seeked render kept an earlier click's spot. preflight `from_only` catches this.
- **A card's title showed before its slam-in, then blinked out.** preflight `shown_early` catches this.
- **Blur timing used the piece start `a` off the frame grid.** It started half a frame early. screen.mjs now rounds it.
- **A freeze `use` that rounds onto a bad frame.** Check the frame number you actually get: `Math.round(use × 60)`.
- **The monitor's fly-off after the clip ended showed the FIRST-frame poster.** Use `#posterEnd`.
- **The camera layer `#cam` is itself animated.** Labels inside it are placed in source px; page-space callouts (`.call`, `#dm`) are not.
- **Blur coverage misses.** Account chips under a window that opens over them, Aero Peek desktop frames, a drag tooltip "Move to <folder>", and the outro's first frames are all places privacy-blur's traps list covers.
