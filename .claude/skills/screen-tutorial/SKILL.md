---
name: screen-tutorial
description: Turn the user's long screen recording (with his facecam intro/outro in the same file) plus a separate voice-over and BGM into a finished 16:9 tutorial in the D:\Video Create workspace - the screen re-timed to the voice (pauses shrunk, waits sped up with a speed chip, dead stretches cut), shown in a floating monitor with camera zooms, labels, green ticks, click rings, a cursor glow, privacy blurs and freezes over Windows glitches; facecam in a glass frame with cards. Use when he brings a how-to / walkthrough recording and asks for a tutorial, explainer or "kivabe korbo" video. Short ads from a recording -> screen-promo; his talking-head episodes -> episode-edit.
---

# Screen tutorial (learned on claude-video-tutorial, 8:30, 2026-10-29: 3 renders, ~35 mistakes, all now guarded)

The look and every rule live in the engine **`tools/tutorial/`** (code). A project holds **only data** in `build/`.
Start with `node tools/new-video.mjs <name> --kind=screen-tutorial`: it copies the reference project's
`tutorial.json` + `page.json` as a working example to rewrite. Reference project: `projects/claude-video-tutorial`.
CLAUDE.md is the authority on Bengali, the plan gate §0e, craft §0d, whole-video §0h and the five elements §0i. This
skill gives the order of work. Each step names the element it protects.

## The data (what you fill in, `projects/<name>/build/`)

| File | What goes in it |
| --- | --- |
| `tutorial.json` | `src` (video, voice, bgm). `frames`: `screen_from` / `screen_to` (the facecam ↔ screen switch frames), `video_end`, `outro_cut` (optional). `voice`: `pauses` ≥ 1.2 s, `cuts`, `end` (the last word). `screen`: `cuts`, `waits` [a, b, speed], `anchors` [voice s, source s]. `face`: `crop`, `outro_clean_from`, `audio` (which mic). `speech.gain_db`. `music`: `body`, `xfade`, `hook_until`. |
| `specs.json` | From the frame review, in SOURCE seconds/pixels: `camera` views, `anchors` (label targets), `clicks`, `drags`, `blurs`, `freezes`. |
| `cursor.json` | `tools/screen/track-cursor.py` over the screen part. The glow and the ring positions read it. |
| `page.json` | `title`. `intro`: `streaks`, `monitor_in`, `dive`, `cards`. `screen`: `sounds`, `lists`, `labels`, `banners`, `callouts`. `outro`: `streaks`, `cards`. Times are final seconds or expressions: `S(source s)`, `V(voice s)`, `SA`, `SE`, `TOTAL`, `min()`, `max()`, e.g. `"S(136.0)-0.15"`. Text is HTML (`&amp;`, `<b>` = gold). Card kinds: `alert`, `flow`, `hero`, `tiles`, `offer`. Label kinds: `tag`, `box`, `ticks`. Every field is listed in the header of `tools/tutorial/page.mjs`. Keep each reason in a `note` field. |

## The engine (`tools/tutorial/`; never copy it into a project)

| Step | Job |
| --- | --- |
| `timeline.mjs` | The single timing source. Voice ANCHORS (a spoken word ↔ a screen moment) set the play speed between them. Pauses ≥ 1.2 s shrink to 0.5 s; waits are ramped 1.8–3×; dead stretches are cut. `TL.S(source)` gives render time, `TL.Sinv(render)` gives source time, `TL.V(voice)` the render time of a word. |
| `screen.mjs` | The screen clip: each piece played or held, blurs burnt in before re-timing, freezes. Pieces run 3 at a time. The frame count is checked. Writes `screen_poster.jpg` + `screen_last.jpg`. `--dry` lists the pieces. |
| `face.mjs` | intro.mp4 / outro.mp4 (facecam crop). The outro's first frames are held on the first clean face frame. |
| `speech.mjs`, `music.mjs`, `mix.mjs` | Voice track (prints each part's LUFS), music bed with gain envelope, mix with the SFX cues the page wrote. |
| `page.mjs` | index.html + `build/cues.json`: cards, monitor, camera, labels, ticks, rings, glow (one sample per frame), callouts. |
| `build.mjs` | Runs the steps in order. `check` validates every piece of data in seconds. |

Commands:

- After every data edit: `node tools/tutorial/build.mjs projects/<name> check`. It catches a missing anchor, a bad time,
  an unknown icon, card kind or sound, a label that hides before it shows, and a freeze `use` outside its piece. It
  dry-runs the page.
- Everything: `node tools/tutorial/build.mjs projects/<name>`. That is check + speech, music, face, screen, page, mix.
  Start it detached: the screen step is long.
- After a label, card or sound change: `node tools/tutorial/build.mjs projects/<name> page mix` (seconds).
- After a blur or freeze fix: `node tools/tutorial/screen.mjs projects/<name> --dry` to find the pieces, then
  `node tools/tutorial/build.mjs projects/<name> screen --only=<i,j>`.
- After a timing change in `tutorial.json`: all steps (the pieces and the voice move).
- A new look or a new card kind goes into the engine (`page.mjs` KINDS), never into a project. Prove that the
  reference project still builds byte-identical (`git status` shows no change to its index.html / cues.json).

Then `node tools/preflight.mjs` and `finish.mjs` (§6).

## Order of work

1. **Source** (উৎস), before planning:
   - `node tools/contact-sheet.mjs <rec> --every=0.5`.
   - `node tools/screen/glitch-scan.mjs <rec> --from=<screen start> --to=<screen end>`. Read every strip row. For each flash or half-drawn window, write down its exact bad frames and a clean `use` frame inside the same play piece.
   - Decide the blur level with the `privacy-blur` skill (default basic).
   - Measure where the facecam really starts and ends in the source. The switch frames still show the screen.
2. **Plan gate** (§0e): write PLAN.md and run plan-check. Get his OK.
3. **Time** (সময়): set `screen.anchors` in `tutorial.json` from `voice.words.json` + `watch.mjs` moments.
   - Every label's `in`/`out` in `page.json` comes from the event it describes: `in` on the frame where its text becomes true; `out` at `"S(window close / cut)-0.3"`, never "in + N s".
   - Boundaries go at half-frame midpoints. A freeze `use` is an exact frame number.
4. **Space** (জায়গা): measure each label's free space on source frames over its whole show time. The target point goes in `specs.json` `anchors`; the label's offset from it is `dx`/`dy` in `page.json`. Put it beside its target, never on text, inside the bezel. A tick is sized from the target (Claude's task circles are 18 px: `"kind": "ticks", "size": "sm"`).
5. **State** (অবস্থা): GSAP for a seeking renderer. The engine already does all of these. A new card kind in `page.mjs` must do them too:
   - x/y go in BOTH fromTo vars.
   - Hide an element in CSS before its entrance.
   - `tl.set(…, 0)` the starting value of anything that animates later (a kind's `preset`).
   - Posters stand in where a clip has ended.
   - The glow reads `unfreeze(s)`.
6. **Proof** (প্রমাণ):
   - `node tools/tutorial/build.mjs projects/<name> check` until it prints ✓, then the build (Commands above).
   - `node tools/preflight.mjs projects/<name>` (≈ 7 min for 8.5 min of video). It must show 0 ERRORs. Look at every WARN and every contact sheet in `.preflight/`.
   - After a fix: `--from/--to` for that stretch (≈ 1 min) plus `hyperframes snapshot --at` the fixed moments.
   - Then `finish.mjs --frames-cache=<C: folder> --out=<F: folder>`, started detached (≈ 2 h).
   - After the render: `contact-sheet --every=0.5`, A/V sync check, delivery.

## Traps that each cost a render (2026-10-29)

- **drawElement capture misplaced transformed layers.** finish.mjs now forces screenshot capture.
- **Rings were reused 4 at a time with x/y only in the FROM vars.** A seeked render kept an earlier click's spot. preflight `from_only` catches this.
- **A card's title showed before its slam-in, then blinked out.** preflight `shown_early` catches this.
- **Blur timing used the piece start `a` off the frame grid.** It started half a frame early. `tools/tutorial/screen.mjs` now rounds it.
- **A freeze `use` that rounds onto a bad frame.** Check the frame number you actually get: `Math.round(use × 60)`.
- **The monitor's fly-off after the clip ended showed the FIRST-frame poster.** Use `#posterEnd`.
- **The camera layer `#cam` is itself animated.** `page.json` `labels` live inside it and are placed in source px; `lists`, `banners` and `callouts` are page space.
- **Blur coverage misses.** Account chips under a window that opens over them, Aero Peek desktop frames, a drag tooltip "Move to <folder>", and the outro's first frames are all places privacy-blur's traps list covers.
