---
name: client-promo
description: Make a paying client's promo (style CP1) in the D:\Video Create workspace from their numbered AI clips (1.mp4, 2.mp4 …, no speech), their Bengali voice-over and BGM - cuts and texts on the spoken words, misspelt baked AI text cropped or covered, gold leak / whip / dissolve, product chips and icon rows, loudness-aware ducked mix, a 16:9 master and a designed 9:16 Reel from one timeline, with tools/promo. Use when he brings a client's clips + voice + BGM and asks for a promo, ad or "production ready" video, or says CP1 / Mohona.
---

# client-promo (CP1)

Rebuilt on 2026-11-04 from the engine header (`tools/promo/build.mjs`), `docs/system-log.md` 3.13 and
`transfer-kit/client-promo/PROMPT-CLIENT-PROMO.md` (the original skill file lived only on a cloud machine that was
reclaimed; this is why the workspace now goes to a private GitHub repo). Reference project: `projects/mohona-promo-01`
(promo.json = every decision, PLAN.md, build/timeline.json).

## 0. Before anything
- Read STYLE.md + LESSONS.md (CLAUDE.md §0e). The client's brand kit, fonts, text types, sound levels and the
  spelling sheet are in `transfer-kit/client-promo/PROMPT-CLIENT-PROMO.md` §4–§8: follow them, do not re-ask.
- Cloud machine: `bash tools/cloud/ready.sh` before step 3 (the hook started setup already).
- Media goes in the project's `assets/media` (PC: a junction to `C:/Users/Zubayer Nibir/VideoWork/<name>`;
  cloud: `/home/claude/VideoWork/<name>`): clips `1.mp4 …`, the voice, the BGM.

## 1. Measure (cheap, before planning)
- `ffprobe` every clip (Veo/Flow: 1280×720, 24 fps, 8 s). Render at 24 fps, never 30.
- `node tools/contact-sheet.mjs <clip> --every=1` for every clip and LOOK: what each second shows, and every caption
  the AI baked in. Misspelt or still-while-the-picture-moves → not visible (crop ≤ 1.25×, or an opaque cover band).
- The script text he pastes is the truth for every word.

## 2. Write `projects/<name>/promo.json` (the only file the model writes)
Copy the shape of `projects/mohona-promo-01/promo.json`: `script` (lines), `clips` (baked text boxes with ok/why),
`voice` (file, at ≈ 0.3), `music` (beds, levels), `grade`, `shots` (clip, in/out, `at` = the word the cut lands on,
crop, hold, speed, move ending at 1, `to` = leak/whip/dissolve/cut), `texts` (kicker, chips, icons, card, name: each
with `at`/`out` words), `bug`, `sfx` (t or word, file, vol), `spelling`.

## 3. Build, check, render
```
node tools/promo/build.mjs projects/<name> --check     # words + cut list + layout only: read every printed move
node tools/promo/build.mjs projects/<name>             # shots pre-cut on the 24-fps grid, mix.py soundtrack, 16:9 + 9:16 pages, PLAN.md
node tools/plan-check.mjs projects/<name>              # then show him PLAN.md (plan gate) unless he said "go straight to render"
node tools/finish.mjs projects/<name> --formats=        # 16:9 master
node tools/finish.mjs projects/<name>-9x16 --formats=   # the designed Reel (built from the rendered 16:9 picture)
tools/pyenv/Scripts/python.exe -I tools/promo/sync_check.py <master.mp4> <voice file> projects/<name>/build/timeline.json
                                                        # voice at start and end ±1 ms (no drift), every cut on its frame
```
Long renders: start detached (PC: Start-Process; cloud: `setsid nohup … &`, CLOUD.md §3).

## 4. Traps already paid for (3.13)
- Bengali ASR puts line-first words on the breath (0.6 s early): build.mjs snaps word starts to the voice's onsets
  and prints every move; read them.
- A hide-set and a show-set on one target at one instant left a shot black: `emit()` refuses it; don't work around it.
- Undrawn line icons showed round-cap dots: SVG hidden until its word.
- Fixed music dB put later lines only 4.5–8.8 LU under the voice: mix.py ducks each line to 14 LU by measured
  loudness; check 12–16 LU on the stems.
- finish.mjs `--release` once put the picture 62 ms behind the sound (B-frames + AAC priming): fixed and guarded by
  qc.mjs `a/v start`; never bypass qc.

## 5. Deliver
Both MP4s (`<out>_16x9.mp4`, `<out>_9x16.mp4`), PLAN.md, one contact sheet, every check with its number, then the
post copy (skill post-copy, or PROMPT-CLIENT-PROMO.md §10). Add his feedback to LESSONS.md (§0f).
