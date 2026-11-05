---
name: client-promo
description: Make a CLIENT's promo (style CP1, first client Mohona Agro Food) from their numbered AI clips (1.mp4, 2.mp4 … made with Veo/Flow), a voice-over and a BGM in the D:\Video Create workspace (or its cloud copy) with tools/promo - every cut and text on its spoken word, baked AI text cropped or covered, a loudness-aware ducked mix, a 16:9 master and a designed 9:16 Reel from ONE timeline, sync proven by measurement. Use when he brings a client's clips + voice + BGM and says promo / বিজ্ঞাপন / "production ready video", or names Mohona / CP1.
---

# client-promo (CP1): a client's clips + voice + BGM → 16:9 master + 9:16 Reel

Built 2026-11-04 in the cloud on projects/mohona-promo-01 (the same material as the PC's first Mohona promo, whose
decisions are `transfer-kit/client-promo/kit/reference/promo-01-decisions.json`). The brand kit, text types, sizes and
sound levels are fixed in `transfer-kit/client-promo/PROMPT-CLIENT-PROMO.md` §4–§6: do not re-ask them. His rule for
client promos: build and render BOTH formats to the end, then report (no plan-OK wait); ask only what the material
cannot tell (phone / page for the end card).

## 1. Data, not code

`projects/<name>/promo.json` (copy `projects/mohona-promo-01/promo.json`):
- `script`: the voice's lines, word for word (the truth for spelling and timing).
- `clips.<file>.baked`: every AI-baked text, its box, `ok` (keep) or not (with `why`). A not-ok text must be cropped
  (`crop` on its shots, zoom ≤ 1.25× from 720p) or covered (`cover.box` on the shot → an opaque brand band).
- `shots`: `{id, clip, in, out, speed, hold, crop, cover, move, at, maxOut, to: {type: leak|whip|dissolve, d}}`.
  `at` = the word the shot starts on ("আটা", "মানসম্মত#3", "আটা-0.15"); with a transition, its MIDDLE sits on the word.
  The engine trims, slows a sped-up shot (≥ 90 % of its speed), plays on into `maxOut`, or holds, to meet the next word.
- `texts`: kicker / chips / icons (pos `bl`, `bc`, `band`), each item `at` its word; `out` = a word, seconds, `"end"`,
  or `"shot:<id>"` (that shot's transition start) so texts stay tied to the cut list.
- `bug` (`from`/`to` refs), `sfx` extras, `music` (beds, dB, `duckLU` 14).

## 2. Commands (cloud: start each with `. tools/cloud/env.sh &&`)

```bash
node tools/new-video.mjs <name> --kind=blank       # or copy projects/mohona-promo-01's assets/, hyperframes.json
# put the clips, the voice and the BGM in projects/<name>/assets/media/
node tools/contact-sheet.mjs assets/media/N.mp4 --every=1 --cols=3   # LOOK at every clip: baked text, what each second shows
node tools/promo/build.mjs projects/<name> --check  # words, cut list (start, word, len, src frames, speed, hold), warnings
node tools/promo/build.mjs projects/<name>          # shots (exact frames) + mix + 3 pages + PLAN.md + build/timeline.json
node tools/plan-check.mjs projects/<name>           # 0 errors (the "assets/music" WARN is normal: client music)
cd projects/<name> && hyperframes snapshot --at <the risky moments> --no-end   # cheap look BEFORE a render
# long jobs DETACHED (setsid), in this order:
node tools/finish.mjs projects/<name> --quality=high --release --frames-cache=<work>/frames-cache
node tools/promo/build.mjs projects/<name> --vertical   # renders <name>-picture → picture.mp4 → vertical-win/bg.mp4
node tools/finish.mjs projects/<name>-9x16 --quality=high --release --frames-cache=<work>/frames-cache
tools/pyenv/Scripts/python.exe -I tools/promo/sync_check.py <master.mp4> "<voice>" projects/<name>/build/timeline.json
node tools/release/spec-check.mjs <9x16 master> --limits=universal-reel
node tools/release/copy-check.mjs projects/<name>/POST-COPY.md
```
The first transcription of a 38-s voice takes ~6 min on 2 CPUs (`<voice>.words.json` is cached next to the voice).
Measured 2026-11-04 (cloud, 2 CPUs): build 3 min (shots), 16:9 finish ~10 min, picture render ~6 min, 9:16 finish ~6 min.

## 3. Traps this style already paid for (each is now a guard or a step)

1. **ASR word starts sit on the breath.** The Bengali fine-tune has no timestamp tokens: "আটা" came at 9.30 s, the
   word starts at 9.90 s after a breath (−38 dB, noisy) and a silence. build.mjs snaps every word to the audio (first
   word after a pause: where the level passes MID and reaches LOUD within 0.4 s; others: nearest onset/dip ±0.15 s) and
   prints every word it moved. Check the list; a cut on the ASR time lands 0.4–0.6 s early.
2. **Two `tl.set` on one element at the same instant** (hide + show at 0) left the first shot BLACK for 10 s in render 1.
   `emit()` now stops the build on that pattern; the first shot gets one show-set.
3. **Undrawn line icons show dots** (round caps of a zero-length dash): the svg is opacity 0 until its word.
4. **Fixed music dB is not enough:** the second half of the BGM was ~4 dB louder, so lines 3–5 sat 4.5–8.8 LU under the
   voice. mix.py now measures each line (BS.1770 K-weighting) and sets the music `duckLU` (14) under it; no lift in
   pauses under 1 s (pump). Measure with ENERGY averages: dB-averaged momentary readings over gappy short lines lie.
5. **9:16 as two live copies of every shot + CSS blur** made `hyperframes check` run past 5 min on software GL. The 9:16
   page now shows the RENDERED 16:9 picture (`--vertical`): identical frames, two videos, FFmpeg blur.
6. `finish.mjs --formats=` (empty) is read as `true` and fails; use `--release` (no extra shapes + the upload encode).
7. Cloud: start renders with `setsid nohup … < /dev/null & disown` (plain `nohup &` was cancelled when the command
   returned), and never `pkill -f <pattern>` from a shell whose own command line contains the pattern (it kills itself).

## 4. Proof before handing over

`sync_check.py` must say PASS: the voice found at `voiceAt` ±1 ms at the START and the END of the master (no drift),
every hard cut on its planned frame, each cut's distance from its word printed. Then contact sheets every 0.5 s of both
files (`--cols=2` 16:9, `--cols=4` 9:16) and read every Bengali word against `promo.json → spelling`; QC −14 ±1 LUFS,
TP ≤ −1 dBTP, 24 fps; 9:16 text inside y 269–1248; end card ≤ 3 s after the last word; music audible at the end.
Deliver `<out>_16x9.mp4`, `<out>_9x16.mp4`, PLAN.md, one sheet, POST-COPY.md (skill post-copy; client facts only).
