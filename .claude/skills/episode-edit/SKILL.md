---
name: episode-edit
description: Turn the user's own long talking-head recording (plus music and a timed transcript) into a finished YouTube episode with motion-graphics scenes, split-screen card layout and word-by-word Bengali captions — and cut vertical Instagram/Facebook Reels (with cliffhanger endings) from it — in the D:\Video Create workspace, using tools/episode. Use when he brings a recording of himself talking (lecture, explainer, podcast-style) and asks for an episode, a series part, or Reels/Shorts from it.
---

# Episode + Reels from his own recording (learned on zubayer-ep01, 2026-10-25)

Reference projects: `projects/zubayer-ep01` (10:35 episode), `projects/zubayer-reel1..4` (Instagram Reels),
`projects/zubayer-fbreel1..4` (Facebook Reels ending on an open question). Full build story and every trap:
`docs/projects-history.md` §4i. CLAUDE.md rules apply (Bengali to him, plan gate §0e, craft rules §0d).

## Start

`node tools/new-video.mjs <name> --kind=episode` → copies ep01's `episode.json` + `build-page.mjs` as a template,
makes the C: work folder and the `assets/media` junction. Edit `episode.json` (source video / music / subtitle file,
`work`, cuts, title, mix) and write the plan (PLAN.md, plan gate) before building.

## One command

`node tools/episode/run.mjs projects/<name> [--from=<step>] [--only=<step>] [--quality=high]`
Steps: voice → cuts → grade → camcut → asr → align → page → mix → render (each re-runnable).
- `episode.json` `cuts`: pauses ≥ minGap shrunk to padAfter + padBefore; `manual` cuts; optional cold open.
- `build-page.mjs`: scenes as beat lists `[time, selector, preset, opts]`; times from `T(source s)` or
  `TW("spoken word", near s)` (warns when the word is not found).
- Reels: `episode.json` `range: [from, to]` (source seconds), `endCard: 3`; `cliff: 4.5` freezes after the last word
  for a cliffhanger; `buildReel({ tag, hook, cta, groups, cliff: { text, sub } })` in the reel's build-page.mjs;
  render with `--formats=9x16`.

## Traps (each cost a run)

- **Bengali ASR on long files runs out of memory** (commit charge near the limit with other apps open). `asr_chunks.py`
  is resumable; run it with nothing else heavy. Fallback: `align.mjs --estimate` (subtitle words spread over speech).
- His subtitle file is a cleaned paraphrase, not verbatim; word times from it can be ~3 s off. For Reel edges
  re-transcribe 8–30 s clips and cut on measured 20 ms energy dips (`patchWords`).
- Check every cut he asks for against the audio ("a cough" at 30.8 s was speech).
- One `<video>` for the whole timeline (`camcut.mjs`); 59 `data-media-start` pieces failed extraction.
- `finish.mjs` raises FFmpeg time limits to 3 h; long renders must be started detached.
- design-lint `card_straddle`: end banners 0.25 s before a layout split. Prefix scene CSS classes (a generic `.bar` broke a banner).
- Music under speech: `musicDb −14`, duck threshold 0.03 / ratio 1.6 ≈ 20 dB under the voice ("very little, but audible").
- Reels: hook and tag visible at frame 0; 1.05× word pop with 18 px gap; Bengali stamps need `letter-spacing: 0`.

## After delivery

CLAUDE.md §0f: LESSONS row, new reusable code → tools/episode, new traps → this file, commit with his OK.
