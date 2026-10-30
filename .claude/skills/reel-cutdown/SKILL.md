---
name: reel-cutdown
description: Cut vertical 9:16 Reels / Shorts out of a FINISHED 16:9 video in the D:\Video Create workspace (a tutorial, promo or episode already rendered) - the meaningful moments picked from its transcript, his face FULL 9:16 wherever he is on camera and the screen in a 16:9 window that pans to the action, the frame morphing smoothly between the two, chips, word-by-word gold captions, his BGM under the voice, a cliff or end card pointing to the full video. Uses tools/cutdown. Use when he types /reel-cutdown or asks for Reels, Shorts or "short clips" from a video that is already made. Footage that is not edited yet -> zero-cost-video-editor / episode-edit; new Reels from nothing -> tools-reel / hyperframes.
---

# reel-cutdown: Reels from a finished video (learned on claude-reel-1..4 and claude-ig-1..2, 2026-10-30)

References: `projects/claude-ig-1..2` (Instagram, **full mode**: face 9:16 ⇄ screen window, the default) and
`projects/claude-reel-1..4` (Facebook, window mode), all cut from `projects/claude-video-tutorial` (master
`F:/Video Create Renders/claude-video-tutorial/2026-10-29_1233`). CLAUDE.md rules apply: Bengali to him, plan gate
(§0e), craft rules (§0d), whole-video treatments (§0h), five elements (§0i). His Bengali how-to: START-HERE.md §২৬.

## 0. What he says, what you ask

He says e.g. "/reel-cutdown <video> থেকে ৩টা Reel, Instagram-এর জন্য". Settle three things (ask only if missing):
how many, which platform (Facebook end card "লিংক কমেন্টে", Instagram "লিংক Bio-তে", Shorts same as Instagram), BGM
louder under his voice or not (`bedUnderVoiceDb: 0` = about 15 dB under the voice instead of the master's ~19).

## 1. Pick the Reels (before the plan gate)

- Read the master's PLAN.md script (line starts in final seconds) and its shot table. One Reel = one idea a stranger
  understands alone: problem + promise, a list ("৪টা জিনিস"), a how-to with exact settings (gets SAVED), the result
  reveal, claim → proof → CTA. 45–80 s each.
- **His rule (2026-10-30): where he is on camera, he fills the 9:16 frame; the screen goes in the 16:9 window; the
  frame morphs between them.** So a Reel that has his face should START on his face (full) when it can.
- A screen-only Reel may open with a 2–2.5 s silent flash-forward to the payoff (bed + a hit).
- End on a cliff (freeze + open question, `cliff`) or straight to the end card.
- Pieces start and end on PAUSES in the sound, not on ASR word edges (they are ±0.3 s off): `cut.mjs` runs
  `tools/cutdown/boundaries.mjs` first and stops on a clipped word or a stray first word of the next sentence, with
  the pause to use (`node tools/cutdown/boundaries.mjs projects/<name>` checks without cutting). Never end inside a sentence. Speech is never sped up;
  silent pieces may be (`speed: 2`, `mute: true`). Leave out claims he may regret (e.g. "আনলিমিটেড") and say so.
- One PLAN.md per Reel (plan-check; the music WARN "assets/music has no tracks" is expected: music comes from the master).

## 2. Files per Reel

`node tools/new-video.mjs <name> --kind=blank` (copy `JetBrainsMono-Variable.ttf` into assets/fonts too), then:
- `cutdown.json` — `master`, `bed` (the master's music-only bed, same timeline; tutorial: `media/bed.wav`), `faces`
  [{file, at, band, fullBand}] (raw vertical camera clips, the master second each starts, rows eyebrows→chin: intro
  fullBand [495,832], outro [450,855]; `band` is for window mode), `faceMode` "full" (default) | "window", `work`
  (C: folder), `fps` 30, `bedDb` 12, `bedUnderVoiceDb` (optional), `segments` [{from, to, face?, mute?, speed?}] in
  master seconds, `tail` (5.5 with a cliff, else 3). Copy `projects/claude-ig-2/cutdown.json` and change the pieces.
- `captions.json` — no new ASR when another Reel of the same master already has corrected words:
  `{ reuse: ["../claude-reel-4"], extra: [{ asr: "<words.json>", at: <master s of its 0>, range?, fix? }] }`.
  For a stretch nobody covered: cut that audio (`ffmpeg -ss <m> -t <d> -i master -ac 1 -ar 16000 x.wav`), transcribe
  only it (~13× real time), add it as `extra` with `at` = its master start. A brand-new master: `{ asr, fix }`.
- `build-page.mjs` — data only: `buildCutdown(ctx, { tag, hook, start, pans, pushes, jumps, chips, sfx, cliff, cta })`.
  Times through `M(master s)` (the spoken piece wins when a cold open repeats a moment) or `W(["word"], near, win)`.
  Copy `projects/claude-ig-1/build-page.mjs` (face + screen) or `claude-ig-2` (face → screen → face).

## 3. Commands

```
node tools/cutdown/cut.mjs projects/<name>          # pieces → media/screen.mp4, face.mp4, voice.wav, map.json (~1–2 min)
node projects/<name>/build-page.mjs                  # index.html + sfx.json
node tools/cutdown/mix.mjs projects/<name>           # mix.wav = voice.wav + the NEW sounds only
cd projects/<name> && node ../../tools/design-lint.mjs . && hyperframes check
hyperframes snapshot . --at <every 3–4 s + the morph frames> --no-end -o "<work>/snap"   # LOOK at every tile
node tools/preflight.mjs projects/<name>             # Reels over 60 s (finish.mjs refuses otherwise)
node tools/finish.mjs projects/<name> --out="F:/Video Create Renders/<series>/<reel>"     # ~12 min per minute
node tools/contact-sheet.mjs "<render>.mp4" --every=1   # read every tile before handing over
```
Then the post copy with skill `post-copy`.

## 4. Craft decisions already in tools/cutdown (do not redo)

Layout inside Meta's safe area: tag y 272, hook y 314–438 (44 px when over ~38 characters), chip band y 448–552
(chips never on the picture), window 1000×548 at y 562, caption pill y≈1170 (2–4 words, spoken word gold + 1.05 pop),
progress line y 1232, cliff, end card. **Full mode:** the camera's eyebrows→chin land on y 585–1110 (hook over the
hair, chips above the glasses, caption under the chin); a blurred copy fills the rest; the sharp face's edges are
feathered; a dark gradient keeps the hook readable; the frame morphs in 0.7 s (clip-path + a cyan outline) into the
window before a screen piece and out of it after one. Screen views are `[cx, cy, s]` in master pixels (s 1 native,
0.6 keeps the master's callouts, 0.52 the whole frame). Pushes ease back to 0.965 then settle on 1 (no snap). A white
flash on every cut. The master's own sound effects are inside voice.wav: cue sounds only for NEW chips, cuts, morphs,
the cold open, the cliff and the end card.

## 5. Traps (each cost a run)

- Rendering while another heavy job runs (ASR, another session's ASR) dropped the render to ~0.2 fps: check
  `Get-Process python` first; transcribe first, THEN render the Reels one after another.
- Bengali ASR mishears names: "প্লট/ক্লট/স্লট" = Claude, "স্যাস" = SaaS, "বিজিএম" = BGM, "ইউজার্স" = ইউজেস; English product
  names in English letters (STYLE.md §১). Words inside mute pieces are dropped automatically.
- A cold open that repeats a later moment mapped beats onto the cold open (claude-reel-3): `M()` prefers the spoken piece.
- design-lint `card_straddle` (text over the window edge); hyperframes check `content_overlap` (a two-line hook reached
  the tag: the engine now shrinks long hooks).
- Chip groups need ≥ 0.25 s between one's out and the next's in; sped-up pieces squeeze master times, so recheck.
- A closer-framed camera clip came out narrower than the frame and showed a hard rectangle: fixed by the feathered mask.
- hyperframes check refuses tweens of left/top/width/height (`gsap_non_transform_motion`, the first morph outline):
  move boxes with transforms, clip-path or SVG `attr` (the outline is now an SVG rect).
- Window-mode pages must stay byte-identical when the engine changes (prove with `cmp` on claude-reel-1..4).
- Cuts placed by the ASR word list clipped words in 4 of 5 renders (2026-10-30): "…নির্দেশনা দিয়ে এবং" at 477.75, half
  "এবং" at 403.2, "Medium। এবং আমি" at 304.6, "ফাইলটা" at 432.8, "কিন্তু" at 438.65. boundaries.mjs now stops cut.mjs on
  these. After moving a cut, page times written in REEL seconds (pushes) slide off their moment: write them as `M(master)`.
- A caption word that only touches a piece's end ("অথবা" 492.43 at a 492.45 end, a 60 ms phantom "এটা") showed on screen
  without being heard: the page now drops a master-timed word with < 0.08 s or < 30 % of itself inside the piece.
- An ASR phantom word over music at a piece end ("এবং" 78.36) showed "এবং এবং এর" once the next piece's real "এবং"
  came in: boundaries.mjs flags a caption word near a cut with no voice under it; drop it by index in captions.json
  (`extra[0].fix { "145": null }`). A LinkedIn page over 40 characters now breaks itself in the middle (no lone word).

## 6. Universal Reel: one file for Facebook, Instagram, YouTube Shorts and X (profile `universal-reel`, 2026-10-30)

The default from now on (his request: the same Reel uploads unchanged to every platform; plan `docs/release-system-plan.md`).
Reference: `projects/claude-ureel-1` (ig-1's cut, universal layout). In `build-page.mjs` add `profile: "universal-reel"`;
pages without it stay byte-identical (proved with cmp on claude-reel-1..4, ig-1..2).
- **Text-safe box** from `tools/release/platforms.json` (`node tools/release/spec-check.mjs --limits=universal-reel`):
  x 65–886, y 288–1248; the engine centres a 692 px text column (x 194–886). The window (picture) may be wider.
- **design-lint** then checks every 0.25 s: `safe_zone` ERROR (text outside the box: shorten the chip text, drop to
  30 px, or split a chain into one chip per group with `arrow(56)` in front) and `text_zones` WARN (> 3 text zones).
  Test an old page with `design-lint . --profile=universal-reel`.
- **CTA**: the build refuses platform words (কমেন্ট, Bio, লিংক); use `["পুরো ভিডিও: <em style=\"white-space:nowrap\">ধাপে
  ধাপে</em> ৮ মিনিট", icon("circle-user") + "আমার প্রোফাইলে দেখুন"]`. The post copy says where the link is.
- **Pacing**: the build WARNs on any still stretch > 3 s. Fix with jump cuts on spoken words
  (`snap = (t) => nearest ctx.words start`, add `[...].map(snap)` to `jumps`) on face pieces and `pushes` on screen
  pieces; or check on a snapshot that the screen itself moves there.
- **Craft built in**: layered shadows + top highlight (chips, pill, window, CTA), drifts ease out (linear easing is
  refused), the header fades under the cliff. Film grain is off (`grain: 0.12` opts in for bright footage): on this dark
  design it was invisible after a 3.5 Mbps platform encode at every strength tried.
- Snapshots: `hyperframes snapshot . --at … --no-end --describe false` (`--describe false`: never send frames out).
- **LinkedIn**: the same engine with `profile: "linkedin-clip"` makes a 4:5 (1080×1350) cut — two-line captions, a name
  plate (`lower: { name, role, at, out }`), calmer cliff, a CTA that asks for a message (comment/like/share words are
  refused). Reference `projects/claude-li-1` (PLAN.md = the real LinkedIn cut for release step 7). The LinkedIn skill
  set itself comes in release step 6.

## 7. After delivery

Post copy for every Reel (skill `post-copy`). CLAUDE.md §0f: LESSONS row, new traps here, commit with his OK.
