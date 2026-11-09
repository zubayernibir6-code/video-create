# reel-4784-captions: the sources kept in git

`build/` is git-ignored (`.gitignore`: `projects/*/build/`), so everything here is what cannot be re-made cheaply.
The clip (`IMG_4784_1.mov`) and the renders are media and are not in git: the delivered Reel was
`renders/reel-4784-captions/2026-11-09_1618/` (`.mp4` + `.bn.srt`).

| File | What it is |
| --- | --- |
| `words.final.json` | the corrected transcript, 124 words with start / end (English product names in Latin letters, the Flow danda removed). THE source of the captions |
| `asr.raw.words.json` | what the Bengali ASR wrote before the fixes (with a `prob` per word), for comparing |
| `cap_final.ass`, `cap_final.srt` | the delivered captions (47 pages, 124 events) and the `.srt` that went with the Reel |
| `faces.dense_series.json` | the face series (461 samples: chin / whisker-tip y over time) that the caption height and `capcheck.py` came from |
| `cap_final.capcheck.json` | the gate's numbers per caption event (`capcheck.py` writes it next to the .ass): widest page 802 px, smallest gap to the face 16 px, PASS |
| `loudnorm.json` | the loudness measurement of the clip's audio (what `render-release.sh` caches) |

Fix a spelling later (skill `zero-cost-video-editor`, "Fast path"): edit `words.final.json`, then

1. `python3 -I .claude/skills/zero-cost-video-editor/scripts/make_captions.py words.final.json -o cap.ass --preset bold-pop --font "Hind Siliguri" --size 100 --words-per-page 3 --width 1080 --height 1920 --center-y 1350 --max-gap 0.4`
2. `python3 -I tools/caption-reel/capcheck.py cap.ass faces.dense_series.json` (must say PASS)
3. with the clip attached again: `bash tools/caption-reel/sdr30.sh IMG_4784_1.mov sdr30.mp4` (161 s), then
   `bash tools/caption-reel/render-release.sh sdr30.mp4 IMG_4784_1.mov cap.ass <out>/reel-4784-captions.mp4`,
   then `node tools/qc.mjs`, `node tools/release/spec-check.mjs --for=universal-reel` and `tools/caption-reel/strips.py`.
