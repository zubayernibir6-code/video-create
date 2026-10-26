# Tools, setup and machine facts

> Moved verbatim out of CLAUDE.md on 2026-10-26 to keep every session's start small (section numbers kept).
> Paths written as `E:Video Create` / `C:Userszubay` are from the old login: read `D:Video Create` /
> `C:UsersZubayer Nibir` (CLAUDE.md §0a). CLAUDE.md §0g says which file holds what.

## 0b. ⭐ STATUS 2026-10-05 — Smart App Control is OFF. Read this before §2b, §2c and §3.

On 2026-10-04 the user turned Windows Smart App Control off (verified: `SmartAppControlState=Off`,
`CI\Policy VerifiedAndReputablePolicyState=0`; still **no admin**). SAC cannot be turned back on
without reinstalling Windows. Everything it blocked now runs: ffprobe, python, HyperFrames' headless
shells, Remotion's bundled ffmpeg/ffprobe/remotion.exe, onnxruntime-node, sharp, esbuild.
**§2b, §2c and §3 describe workarounds that are no longer needed.** They stay in this file only as
the fallback if SAC ever comes back after a reinstall.

### What changed — all verified by running it (2026-10-04/05)

| Before | Now |
| --- | --- |
| `hyperframes render` deleted its own MP4 (§2c) | **Plain `hyperframes render` keeps the MP4, with AAC audio.** audio-test copy: 8.0 s, h264 + AAC 48 kHz stereo, −9.0 LUFS, corr 1.0000 vs the 2026-09-10 reference; 29 s at `--quality high --workers 1` (re-verified 2026-10-05 after the env change below). |
| `tools/hf-render.mjs` was the render command | **Obsolete.** 2.3× slower (70.5 s vs 30.2 s) and silent. Archived fallback only. |
| `tools/hf-audio.mjs` was planned | **Do not write it.** The plain render mixes every `<audio>` cue itself. |
| `HYPERFRAMES_BROWSER_PATH` → system Chrome (§2b) | **Removed from the user env on 2026-10-05.** HyperFrames now uses its pinned headless shell 152.0.7977.30: pixel-identical output (PSNR inf), ~7–10 % faster. |
| Remotion `render.mjs` PNG path (§3) | Bundled binaries run. Plain `npx remotion render MyComp out/video.mp4 --color-space=bt709 --concurrency=1` works (51 s). ~~`render.mjs` dropped the root-layer fade~~ **FIXED 2026-10-06 (plan step 10):** `render.mjs` now runs the plain bundled render and tags BT.709 — fade verified (t=4.9 s RGB 3,5,9 vs the old 25,31,56). |
| python blocked | Runs — **but read the Python trap below.** |

`HYPERFRAMES_NO_AUTO_INSTALL=1` was set at user level on 2026-10-05. The 0.8.33 CLI had been
launching `npm install -g hyperframes@<latest>` on its own (it failed with `spawn npm ENOENT`; see
`~/.hyperframes/auto-update.log`). Upgrade deliberately or not at all (latest was 0.8.127 on 2026-10-05).

### New traps found in the 2026-10-04 capability audit

- **`python` on PATH is another app's venv.** It resolves to
  `C:\Users\zubay\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe` (Hermes Agent).
  `pip install --user` is refused there, and a plain `pip install` would modify that app.
  `python3` is the Microsoft Store stub (exit 49); `py` does not exist. **Never `pip install` into it.**
  ✅ **The workspace venv exists (plan step 2, 2026-10-05): `E:/Video Create/tools/pyenv`**, 28 MB,
  Python 3.11.15, pip 24.0 + setuptools only. It was built offline with
  `"C:/Users/zubay/AppData/Roaming/uv/python/cpython-3.11.15-windows-x86_64-none/python.exe" -m venv "E:/Video Create/tools/pyenv"`
  (ensurepip's bundled pip, no download). User env `HYPERFRAMES_PYTHON=E:\Video Create\tools\pyenv\Scripts\python.exe`.
  HyperFrames' `findPython()` (dist/cli.js ~158597) checks that override first. Verified: `hyperframes tts`
  now gets past "Python 3 is required" and stops at "kokoro-onnx package is not installed".
  **Install packages only with** `"E:/Video Create/tools/pyenv/Scripts/python.exe" -m pip install <pkg>`
  (PIP_CACHE_DIR is already on E:). Run any skill script that calls `python3` with this python instead.
  Its base interpreter lives in uv's store (uv 0.11.25 belongs to Hermes, at
  `C:\Users\zubay\AppData\Local\hermes\bin\uv.exe`). If someone runs `uv python uninstall`, the venv
  breaks; rebuild it with the same command and re-install its packages.
- **Disk: C: has only ~6.9 GB free; E: has 69 GB.** The old "71 GB free" was E:.
  `~/.cache/{huggingface,hyperframes,codex-runtimes}` are junctions to
  `E:\remotion and hyperframe,\.codex-local-cache`, and HF_HOME / PIP_CACHE_DIR / UV_CACHE_DIR /
  npm_config_cache point there too. But `%TEMP%` (render work dirs, extract cache) is on C:.
- **Renders longer than 240 s are refused by default** ("Disk capture may need ~62208 MB ... only
  7378 MB is free"); streaming encode is capped at 240 s. Fix, verified on a 250 s comp:
  `PRODUCER_STREAMING_ENCODE_MAX_DURATION_SECONDS=3600 hyperframes render --workers 1 ...`.
  Add `--frames-cache-dir "E:/Video Create/.cache/frames"` for footage. Multi-worker renders are
  refused for the same disk reason, so keep `--workers 1`.
- **Bengali burned-in subtitles: never use FFmpeg `subtitles=`.** In this 8.1.1 build it breaks
  conjuncts (visible hasanta). `ass=file.ass:fontsdir=fonts` shapes them correctly. Keep the fonts in
  their own subfolder, because `fontsdir=.` makes libass try every file. SRT→ASS conversion
  defaults to PlayRes 384x288 + Arial, so rewrite the style.
- **Renders are not fully offline.** 0.8.33's compiler fetches Google Fonts CSS for any family
  whose `@font-face` is not inline in the HTML (a linked fonts.css is ignored), which costs up to ~25 s.
  Inline the `@font-face` rules.
- **Footage speed.** ~0.13–0.20 s/frame at 1080p with drawElement capture. `data-color-grading`/WebGL
  or HDR sources force screenshot capture (0.84–1.2 s/frame), and grading needs `--browser-timeout 150`.
  HDR phone clips auto-switch the output to HLG HEVC 10-bit; pre-tonemap them with
  `zscale` + `tonemap=hable`. H.264, HEVC 8-bit, 60 fps, VFR and rotated clips need no pre-conversion.
- **Loudness: −14 LUFS *is* reachable** (§4f was wrong). Set loudnorm's `LRA` at or above the measured
  LRA: LRA=21 on audio-test gave −14.9 LUFS, TP −7.1.
- **Transcription.** Stock Whisper small/medium give garbage for Bengali. large-v3-turbo gives
  draft-quality Bengali: a third to half of the words are misspelled, ~6–7× real time, ~2 GB RAM. Already on E:
  but outside the workspace: complete faster-whisper models base/small/medium/large-v3-turbo
  (large-v3 is incomplete) in the HF cache, and whisper.cpp 1.9.1 at
  `E:\remotion and hyperframe,\whisper.cpp\Release\whisper-cli.exe` (not registered). HyperFrames
  passes `--dtw <model with - → .>`, so a quantized model name (`large-v3-turbo-q5_0`) fails with
  "unknown DTW preset".
- **Licensing.** HeyGen ToS (Last Updated July 23, 2026): Free Plan output may not be sold or used
  commercially, so media-use's HeyGen "free-usage path" is off-limits for sold work. Kokoro has no
  Bengali. MMS-TTS, XTTS and MusicGen are non-commercial.
- **media-use scripts send PostHog telemetry** unless `DO_NOT_TRACK=1`. Its test suites ignore their
  HOME override on Windows and wrote fake records into the real `C:\Users\zubay\.media` during the
  2026-10-04 audit (`recipes/{explainer,promo,weekly-launch}`, `mu-v1-*` folders, manifest/misses/
  preferences). Cleanup is pending the user's OK. Treat those "remembered" recipes as fake.
- **Workflow traps still live.** Re-running `assemble-index.mjs` silently drops hand-placed `<audio>`
  cues and the fonts.css link, and restores CDN GSAP, while lint still reports 0 errors.
  `build-frame.mjs:336` has `bBody = nonMono[0]` (should be `[1]`). `@import` of fonts fails lint.
  Bundled SFX cues always get `offset_s: 0`. `projects/hyperframes-starter/index.html` and
  `projects/font-test/index.html` still load GSAP 3.14 from jsdelivr.
- **The SFX pack is 17 unique sounds, not 19:** click.mp3 == click-soft.mp3 and whoosh.mp3 ==
  whoosh-short.mp3 (byte-identical).
- **The Lottie adapter is now render-verified** (self-authored JSON, frame-accurate seek). Lint still
  wants a `window.__timelines` registration on a Lottie-only page.
- ⚠️ **`hyperframes init` silently reinstalls the HyperFrames skills from GitHub.** It clones
  github.com/heygen-com/hyperframes and copies 21 skills over `~/.claude/skills/*` and `~/.agents/skills/*`.
  In 0.8.33 the `--skip-skills` flag is "[temporarily ignored]". **`HYPERFRAMES_SKIP_SKILLS=1` opts out.**
  This happened on 2026-10-05 08:51, when an `init` in a scratch folder during plan step 3 overwrote all 21 skills.
  It added `hyperframes-studio`. The user's own skills in `~/.agents/skills` (shaheen-*, bangla-typography-*,
  video-qa-*, etc., dated 2026-07-16) were not touched. **The skills are now newer than the 0.8.33 CLI.** They
  mention commands (`timeline`, `history`, `clean`, `upgrade --project`) that 0.8.33's `--help` does not list.
  The new `hyperframes` skill tells agents to run `npx hyperframes@latest upgrade --project .` on pinned
  projects "rather than relaying it to the user". **This workspace overrides that: never upgrade a project or
  the CLI without the user's OK** (plan step 22). File/line references to skill scripts in this document
  (e.g. `build-frame.mjs:336`) were taken from the pre-update copies and may have moved.
- ✅ **Kokoro English TTS works (plan step 3, 2026-10-05).** `kokoro-onnx 0.6.1` + `soundfile 0.14.0` are in
  `tools/pyenv` (onnxruntime 1.30.0, numpy 2.4.6, phonemizer 3.4.0, espeakng-loader 0.2.4). The venv is now 162 MB.
  Only ~15 MB came from the network; the rest was already in the pip cache on E:. The model files were already in
  `~/.cache/hyperframes/tts`, and HyperFrames only downloads when the file is missing.
  `hyperframes tts "<text>" --voice af_heart -o out.wav` gives a 24 kHz mono WAV at about −20 to −24 LUFS, so
  normalise it. A 5 s line takes ~16 s, including ~10 s of model load; a 22.5 s paragraph takes 39 s.
  Verified: three voices (af_heart, am_michael, bf_emma) transcribe back word-perfect with faster-whisper
  small. A 6 s composition with the WAV as `<audio id="narration">` rendered in 14 s with AAC 48 kHz stereo,
  and the narration transcribed back correctly. Voices: `hyperframes tts --list`.
  Languages: en-us, en-gb, es, fr-fr, hi, it, pt-br, ja, zh. **No Bengali.**
- ✅ **`tools/voice.mjs`: own-voice narration (plan step 4, 2026-10-05).** Plain node and FFmpeg, nothing installed.
  `devices` lists microphones: "Microphone Array (Realtek(R) Audio)" is the default; "Headset (HDY-G36)" also exists.
  `record <name> [--seconds=120] [--device=...]` writes `<name>-raw.wav` plus a cleaned `<name>.wav` in the cwd.
  `clean <input> [out.wav]` takes any FFmpeg-readable input (mp3, m4a, WhatsApp ogg/opus, mp4 verified).
  The chain is high-pass 80 Hz → **afftdn with a noise profile** → 3:1 compressor → trim silence at both ends →
  two-pass loudnorm to −16 LUFS / −1.5 dBTP (adaptive LRA) → 48 kHz mono s16 WAV. The profile comes from the
  quietest 0.8 s window: that segment is prepended, sampled with `asendcmd afftdn sn start/stop`, then trimmed
  off. With no real pause (quiet window within 12 dB of speech) it falls back to adaptive `tn=1`.
  Measured on speech + pink noise + 50/150 Hz hum: the speech-to-noise gap went from 23.9 to 48.1 dB (adaptive
  afftdn alone managed 29.7 dB), the hum went from −55 dB to −91 dB, and ASR was unchanged. Speech distortion
  stayed flat as nr rose 20→40 (aligned SDR ≈ 22.7–22.8 dB). On the user's real laptop recording
  (Downloads/video2/clip_0_30.mp3) the gap went from 28.0 to 40.6 dB; spectrogram inspection showed no
  musical-noise artefacts. **afftdn delays its output by 25 ms**; the script trims it (aligned lag 0.00 ms).
  The mic needs ~1 s to open, so "RECORDING — speak" prints only once ffmpeg reports progress.
  Under Git Bash, ffmpeg never sees a "q" keypress (mintty has no console), so the script stops ffmpeg
  on **Enter** through a stdin pipe; stdin EOF does not stop it (verified). It refuses silent input, refuses
  input that is pure room noise ("No voice found"), and warns when the voice is below −40 LUFS or within 12 dB
  of the room. Mic tests on 2026-10-05 recorded 1–2 s of room sound only; those files were deleted at once.
- ✅ **Remotion render fixed (plan step 10, 2026-10-06).** `projects/remotion-starter/render.mjs` (still `npm run render`
  / `npm run render -- <Comp> <out.mp4>`) runs the local CLI directly
  (`node node_modules/@remotion/cli/remotion-cli.js render … --color-space=bt709 --concurrency=1`, no `shell:true`, so
  no DEP0190 warning). It then losslessly writes the full BT.709 VUI with the system FFmpeg
  (`-c copy -bsf:v h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0`)
  plus faststart. `--color-space=bt709` alone left transfer/primaries "unknown". **Verified:** the fade is
  back (t=4.9 s RGB 3,5,9; the old PNG-path file stayed at 25,31,56). qc.mjs PASS with all tags bt709. Both
  call forms work, in 19 s warm (65 s cold). The old no-fade file is in `.quarantine/2026-10-05/remotion-starter/`.
- ✅ **Cleanup by quarantine (plan step 20, 2026-10-06). Nothing was deleted.** Everything moved to
  `E:/Video Create/.quarantine/2026-10-05/` (git-ignored; its README.md is in Bengali; ~236 MB; the user may
  delete it later): the empty nested remotion-starter `.git`, 199 MB of old `out/frames` PNGs, the two duplicate
  SFX, the 34 MB `kokoro-v1.0.onnx.tmp`, and **the 2026-10-04 audit's media-use test records**. For the last,
  folder mtimes 14:07–14:32 matched the manifest entries (fixtures such as "mu-resolve-test", a fake HeyGen bgm, a
  fake `preferences.json` with zh / x-feed sightings). `C:\Users\zubay\.media\manifest.jsonl` keeps its 4 REAL
  records (the July star-chime bgm and the three September LUTs); the full original is saved in quarantine.
  The stale headless shells (131 / 152.0.7928.2) were left alone: they sit in the shared E: cache, which the
  older `E:\remotion and hyperframe,` workspace may use.
  ⚠ **Found while checking:** the 2026-10-05 media-use skill's `scripts/resolve.mjs` is now a thin shim that
  needs `npx hyperframes media-use resolve`, a command the 0.8.33 CLI does not have. It exits 1 silently (it
  falls through to `bun`). This is the skills/CLI version mismatch from the silent skills update, and it is
  why plan step 22 (CLI upgrade) was done next.
- ✅ **Version history (plan step 19, done FIRST on 2026-10-05 as the safety net for the overnight run).**
  `E:\Video Create` is now a git repo (branch master). Identity is repo-local: Talha Zubayer
  <nibir@lamppost.org.bd>. Settings: `core.autocrlf=false`, `core.longpaths=true`, and `.gitattributes`
  `* -text` (no line-ending rewriting). `.gitignore` excludes node_modules, renders, project renders/out/build/
  snapshots, .cache, .quarantine, tools/pyenv, tools/whisper.cpp, tools/deep-filter, assets/models, the Piper .onnx,
  all video/wav/gif and `.env*` (except `.env.local.example`). The first commit "Workspace snapshot before the
  overnight install steps" holds 466 files; there is one commit per plan step after it.
  Undo a step: `git log --oneline`, then `git checkout <commit> -- <path>`. Nothing is pushed anywhere (no remote).
  Renders and big models are NOT in git; back up `renders/` separately (an external drive or cloud folder).
- ✅ **HyperFrames CLI 0.8.33 → 0.8.134 (plan step 22, 2026-10-06).** Why it was needed: the silent 2026-10-05
  skills update made media-use's `resolve` call `npx hyperframes media-use …`, which 0.8.33 lacks. Installed with
  `HYPERFRAMES_SKIP_SKILLS=1 HYPERFRAMES_NO_AUTO_INSTALL=1 npm install -g hyperframes@0.8.134` in 27 s. The package
  has no install scripts. npm warned that esbuild's postinstall was not in `allowScripts`; it was NOT approved
  (§6 rule) and everything still works. The skills were untouched. The pinned Chrome is the same (152.0.7977.30),
  so nothing new was downloaded. The dist is now code-split (278 files), so grep the whole `dist/` folder, not
  cli.js. Every env var the tools rely on is still present (PRODUCER_STREAMING_ENCODE_MAX_DURATION_SECONDS,
  --frames-cache-dir, HYPERFRAMES_SKIP_SKILLS / NO_AUTO_INSTALL / PYTHON / WHISPER_PATH). New commands: `media-use`,
  `timeline`, `history`, `clean`.
  **Re-verified on 0.8.134 in a fresh-shell environment** (HYPERFRAMES_BROWSER_PATH unset, the user env vars set):
  - media-use doctor ✓ (ffmpeg/ffprobe/node; HeyGen is deliberately absent) and `media-use resolve --type sfx` ✓
  - tts ✓; transcribe 65/65 ✓; remove-background model cached ✓
  - `beats`: 65 beats at exactly 0.500 s, 120 BPM — better than librosa's 117.5
  - finish.mjs on audio-test: 46 s, all PASS
  - the 250 s render streamed in 4 m 18.8 s (0.8.33: 4 m 56 s), all PASS
  - the full 45 s promo with 28 SFX: render 1 m 57.7 s, total 146 s (0.8.33: 157 s), all PASS
  The resolve test wrote a record into the shared `~/.media`; it was moved to quarantine.
  **Project pins:** each project's package.json still runs `npx hyperframes@0.8.33` for `npm run …`. They were left
  as they are (they work), while `tools/*.mjs` use the global 0.8.134. Rollback: `npm install -g hyperframes@0.8.33`.
  0.8.134 no longer bundles onnxruntime-node: the first `remove-background` run prints "installing onnxruntime-node
  for background removal, once". That was done on 2026-10-06, after which the run took 1.13 s/frame at 720p
  (0.8.33: 1.6 s) with a valid alpha. `hyperframes doctor` is all green except MusicGen (deliberately absent,
  non-commercial weights) and Docker (not needed).
- ✅ **`tools/finish.mjs` + `tools/qc.mjs`: one-command delivery (plan step 5, 2026-10-05).** Plain node and FFmpeg.
  `node "E:/Video Create/tools/finish.mjs" <project-folder | video-file> [--quality=high|standard|draft]
  [--formats=16x9,9x16,1x1,4x5] [--reframe=fit|crop] [--lufs=-14] [--out=<dir>] [--keep]`.
  For a project it runs `hyperframes check` (and stops before rendering on any error), then
  `hyperframes render --workers 1 --frames-cache-dir E:/Video Create/.cache/frames` with
  `PRODUCER_STREAMING_ENCODE_MAX_DURATION_SECONDS=3600`. For a video file it re-encodes to h264/yuv420p
  only if needed. Then: loudness → QC → other aspect ratios → thumbnail + 8 s GIF → `qc.json`.
  Output goes to `renders/<name>/<YYYY-MM-DD_HHMM>/`, a new folder every run, so earlier deliveries are never
  overwritten. On failure before any deliverable exists, it removes its own empty folder.
  Exit code 1 if QC FAILs (the files are kept).
  **Loudness:** two-pass loudnorm with adaptive LRA, then **measured with ebur128** (the same meter as qc.mjs),
  and the residual is trimmed with a volume step. On audio-test, loudnorm reported −13.99 while ebur128 read
  −14.9 on the same file, so the trim adds +0.9 dB and lands on −14.0. Fallback: gain + alimiter.
  loudnorm leaves a ~0.1 s audio tail, so the audio is `atrim`-ed to the video length (6.0 s stays 6.0 s;
  A/V lag 0.00 ms by cross-correlation).
  **Colour:** in this FFmpeg build, `-color_primaries/-color_trc` alone leave transfer/primaries "unknown"
  in a libx264 encode. `-x264-params colorprim=bt709:transfer=bt709:colormatrix=bt709` is required (verified).
  **Reframe:** the default "fit" places the whole frame over a blurred, darkened copy (gblur sigma 24 at
  quarter size). At sigma 10 the background text was still legible, so it was raised. `--reframe=crop` is a
  centre crop, for footage with a centred subject. Exports copy the master's AAC, so loudness is identical.
  **qc.mjs levels:** FAIL = codec/pix_fmt, size, fps, duration ±0.15 s, faststart, loudness ±1 LU,
  TP > −1 dBTP. WARN = no or silent audio, black in the middle, frozen ≥5 s, colour tags missing.
  INFO = edge black (fades), still moments, silences ≥2 s.
  `freezedetect n=0.001`: at 0.003 a slow move (0.4 px/frame) produced 32 false "frozen" warnings over 250 s,
  while 0.001 still catches a truly frozen picture.
  **Verified runs:** audio-test copy, 49 s total (check 12 s, render 24 s, exports 10 s), −9.0 → −14.0 LUFS,
  4 formats checked visually. font-test copy (no audio), 37 s, PASS with WARN "no audio". Portrait HEVC
  60 fps .mov file, 48 s, −30 → −14 LUFS, 16:9/1:1/4:5 exports at 8–10 s each for 6 s of 60 fps. Project
  with an id-less `<audio>`: stopped at check, nothing rendered, no leftover folder. **250 s project:**
  render 4 m 56 s via streaming encode (refused without the env var), 6 m 15 s total at draft with
  `--formats=16x9`, −19.3 → −14.2 LUFS, TP −1.5, all PASS.
- ✅ **Bengali subtitle tools (plan step 6, 2026-10-05).** Plain node and FFmpeg.
  `burn-subs.mjs <video> <subs.srt|.vtt|.ass> [out.mp4] [--style=outline|box] [--font=...] [--size=px]`
  converts SRT/VTT to ASS itself and burns it with `ass=subs.ass:fontsdir=fonts`, never `subtitles=`.
  It runs inside a temp folder that holds only the workspace TTFs, so there is no drive colon in filter args
  and libass doesn't trip over non-font files. The temp folder is always removed. PlayRes equals the video
  size; the font size is 5.5 % of the short side (59 px at 1080p), with safe-area margins of 7 % vertical
  and 6 % horizontal. Fonts: Hind Siliguri (default, Bold), Noto Sans Bengali, Baloo Da 2, Tiro Bangla.
  **Placement (2026-10-23):** tall videos (height ≥ 1.7 × width, i.e. 9:16) get captions centred 60 % from the
  top, out of Meta's Reels covered zones (top 14 %, bottom 35 %, sides 6 %). Everything else keeps the 7 % bottom
  margin; 16:9, 1:1 and 4:5 output is frame-identical to before (framemd5). `--pos=<n>` centres a one-line caption
  at n % from the top (`60%` and `Bottom` are accepted too), `--pos=bottom` forces the bottom. Captions stay
  bottom-anchored, so extra lines grow upward. On 9:16 it warns when the drawn caption (outline/box padding and typed
  line breaks included) reaches into the bottom 35 % or the top 14 %; `--size` must be 12–300.
  **Rotated phone clips:** portrait recordings stored as 1920×1080 plus a rotation flag were laid out as landscape
  (bottom placement, PlayRes 1920×1080 stretched to 1.76× size); the tool now reads the rotation with ffprobe and
  uses the upright size. Note: libass draws a line Fontsize px tall, so "59 px" is the line height, not the em.
  Measured on 1080×1920, 720×1280 and a rotated 1920×1080 clip: one line centred 59.9 %, two lines 58.3 %, lowest
  ink 61.3 % (box 62.2 %). An independent 3-lens review (8 agents) found the rotation gap; the fixes were re-measured.
  **Box style uses libass BorderStyle 4** (one box per subtitle, BackColour &H5A000000, OutlineColour
  invisible). BorderStyle 3 draws a box per line, and the boxes overlap into a dark band on two-line subs
  (compared side by side). Verified by eye on 1080p (outline) and 1080x1920 (box): ক্ষুদ্র উজ্জ্বল
  শ্রদ্ধা স্ত্রী বিদ্যুৎ, ১২,৩৪,৫৬৭, ০১২৩, a two-line cue and mixed English all shape correctly.
  `srt-to-words.mjs <subs> [words.json]` shares each cue's time among its words by GRAPHEME count + 1
  (Intl.Segmenter). It outputs the plain `[{id,text,start,end}]` array, monotonic, within cue bounds, NFC.
  These timings are estimated, not measured. `srt.mjs` reads UTF-8 ± BOM, UTF-16 LE/BE and CRLF.
  ⚠️ **HyperFrames 0.8.33's own SRT import is broken for Windows files.** It splits on "\n\n", so a CRLF
  SRT imported as ONE 217-char "word" with "\r" and the timestamps inside it (verified). Always convert with
  srt-to-words first.
  ⚠️ **`hyperframes transcribe <file>` writes transcript.json beside the INPUT file**, not in the cwd,
  unless `-d <project>` is given. It also patches `const TRANSCRIPT = [...]` / `const script = [...]` in
  the project's HTML (verified: 25 words patched in). A scratch word-by-word caption composition built on
  that rendered correctly: frames at 1.2 / 2.1 / 4.5 s lit exactly the words whose start had passed.
- ✅ **Speech to text, Bengali and English (plan step 7, 2026-10-05).** `node tools/transcribe.mjs <audio|video>
  [--lang=bn|en] [--model=bengali|turbo|small|medium|<dir>] [--out=<path>]` runs `tools/transcribe.py` with
  pyenv's python and writes `<name>.words.json` (HyperFrames import format), `.srt` (for burn-subs) and `.txt`.
  faster-whisper 1.2.1 + ctranslate2 4.8.2 are in pyenv, which is now 327 MB. The Bengali model is
  `SayedShaun/bengali-whisper-medium-ct2` rev 32da13b97a: Apache-2.0, tugstugi's 1st-place Bengali.AI weights,
  int8, model.bin 774,731,149 B. It lives at `assets/models/asr/bengali-whisper-medium-ct2` (git-ignored;
  9.5 min to download). turbo/small/medium resolve from the HF cache on E: (HF_HOME).
  **Measured on the user's real Bengali recording (Downloads/video2/clip_0_30.mp3, a talk about AI agents):**
  the fine-tune is nearly perfect; its only errors are English loanwords (জিবিটি = GPT, জেমিনায় = Gemini, এলএলবি = LLM,
  ল্যাবেজ = language). Stock turbo misspelled about half the words (কদা, সেডা, হাশোলে, ভাভে…). The fine-tune
  writes no punctuation. **Speed:** fine-tune 304 s for 30 s (10.1x real time; ~10 min per minute of audio);
  turbo 112 s (3.7x). Rejected: beam_size=1 (−15 % time only) and cpu_threads=8 (−16 %, but it dropped the
  whole first sentence), so it stays at beam 5 and 4 threads. **English** (small): WER 1.5 % on the Kokoro
  script (the only miss was the name "Khada"), 0.7x real time, 0.7 GB peak. The output imports into HyperFrames
  (48 words) and burns with burn-subs (verified). Use `--model=turbo` only for a quick rough draft of Bengali.
- ✅ **HyperFrames' own `hyperframes transcribe` works (plan step 8, 2026-10-06).** whisper.cpp 1.9.1 (the
  `Release` build from `E:\remotion and hyperframe,\whisper.cpp`, 20 MB) was copied to `tools/whisper.cpp/`
  (git-ignored). User env `HYPERFRAMES_WHISPER_PATH=E:\Video Create\tools\whisper.cpp\whisper-cli.exe`.
  Models live in `~/.cache/hyperframes/whisper/models/` (a junction onto E:): `ggml-small.bin` was copied
  from the old folder, and `ggml-small.en.bin` (487,614,201 B) was downloaded by the CLI on first default use.
  Verified on the 22.5 s Kokoro narration: `--model small --language en` gave 65 words in 33 s; the default
  (small.en) gave 65 words. media-use's `scripts/transcribe.mjs --input <f> --out <json>` now works too
  (65 words, 43 s; it needs `--input`, not a positional argument). For BENGALI keep using
  `tools/transcribe.mjs`: whisper.cpp only has the stock models, which garble Bengali.
- ✅ **Offline Bengali voice-over (plan step 11, 2026-10-06).** `node tools/bn-tts.mjs "<text>" | script.txt
  [-o out.wav] [--voice=male|female|0-15] [--speed=1.0] [--list]`. piper-tts 1.8.0 (GPL tool) is in pyenv. The voice
  `assets/voices/piper/bn_BD-google-medium.onnx` (76,782,515 B, git-ignored) has 16 speakers, a mix of bn-BD and bn-IN
  that OpenSLR does not label. `CREDITS.md` there holds the credit line that must go in any video using it
  (OpenSLR-37 is CC BY-SA 4.0). The output is a 48 kHz mono WAV, two-pass −16 LUFS / −1.5 dBTP, with 0.25 s of
  silence before and 0.4 s after. Speed: an 11 s paragraph is made in ~7 s.
  **Speakers were measured, not guessed** (`speakers.json`). All 16 read the same sentence; the result was read back
  with the Bengali ASR and scored by grapheme error rate. Gender comes from the measured median pitch.
  6 speakers scored 0 %. Presets: male = speaker 5 (158 Hz), female = speaker 3 (174 Hz); speaker 15 is a slower,
  250 Hz female voice. Numbers are spoken correctly ("২,৫০০" → "দুই হাজার পাঁচশ").
  **Three transcriber fixes came out of this round-trip** (all in `transcribe.py`, re-verified on the real clip):
  (1) the Bengali fine-tune must decode with `without_timestamps=True`, because with timestamp tokens it drops
  the first syllable ("হিসাব" → "াব"; the real clip's first word "আজকে" came back as "ের"). Word timings
  still work. (2) Any word starting with a dependent vowel sign is mapped to the independent vowel (a safety
  net). (3) "Phantom" segments are dropped: Whisper wrote six invented words into a 0.46 s silent tail. Rule:
  drop when the segment's RMS is 25 dB under the file's speech level (90th percentile of 50 ms frames), or when
  it packs more than 6 words/s into less than 1.5 s. Result: the narration and the real clip are word-perfect at
  the start, 3 phantom segments were dropped, and nothing real was lost (real clip: 47 words). Cost: peak RAM
  2.4–2.5 GB. Short files run slower (13–18x) because Whisper's temperature fallback re-decodes the phantom
  tail; the 30 s real clip ran at 9.4x.
- ✅ **AI voice denoise (plan step 12, 2026-10-06).** `tools/deep-filter/deep-filter.exe` is DeepFilterNet 0.5.6
  (26,912,256 B, MIT/Apache-2.0; licence files sit beside it; git-ignored). It is now the DEFAULT in `tools/voice.mjs`
  (`--denoise=ai|classic|off`): a 48 kHz mono copy is run through `deep-filter -D -a 40 -o <dir>`, then high-pass,
  compressor, silence trim and two-pass −16 LUFS. **Measured on the user's real laptop recording:**
  speech-to-noise gap 28 dB → ai 57 dB / classic 41 dB / off 18 dB. Unlimited DeepFilterNet reached 76 dB;
  40 dB was chosen to keep a natural room tail. The transcript of the cleaned audio is as good as the original's
  (a slightly better reading of "জেমিনাই ক্লড"). `-D` compensates its delay (aligned lag 0.00 ms). Caveat: on
  SYNTHETIC (TTS) speech plus noise it altered the voice more than the classic chain (aligned SDR 6.7 vs
  22.8 dB). It is built for real voices; use `--denoise=classic` if a cleaned TTS track ever sounds processed.
- ✅ **Asset library expanded (plan step 16, 2026-10-06).** Everything below is commercial-safe, and credits are in
  each folder.
  **Icons:** `assets/icons/lucide/icons/*.svg`, 1,866 Lucide 1.52.0 SVGs, ISC licence (LICENSE alongside). They
  include graduation-cap, banknote, calculator and similar.
  **Fonts:** 7 more OFL families in `assets/fonts/bengali` (OFL texts in `LICENSES/`, all TTFs magic-checked):
  Galada, Atma 300–700, Mina 400/700, Anek Bangla (variable wdth/wght), Noto Serif Bengali (variable), Tiro Bangla
  Italic, Alkatra (variable). `fonts.css` now has 25 `@font-face` rules and new stacks `--font-bn-serif2`,
  `--font-bn-cond`, `--font-bn-display`, `--font-bn-round`, `--font-bn-tech`, `--font-bn-brush`. Its header no longer
  recommends `../../`. A snapshot sheet showed correct conjuncts in all of them **except Alkatra, which renders
  উজ্জ্বল as উজজবল**. Use it for short titles only, and check a snapshot.
  **SFX:** 14 CC0 sounds (Freesound via the anonymous Openverse API; sources in `CREDITS.md` and `manifest.json`):
  applause, coin-drop, cash-register, camera-shutter, school-bell, heartbeat, page-turn, boom, crowd-cheer,
  success, room-tone (18.7 s), classroom-ambience (37.4 s), plus new `click-soft` and `whoosh-short`. The old
  versions of those two were byte copies of click/whoosh and are in `.quarantine/2026-10-05/sfx-duplicates/`.
  31 unique sounds, 0 duplicate hashes.
  **Lottie:** `assets/lottie/noto-emoji/`, 14 Google Noto animated emoji (CC BY 4.0, **attribution required**;
  the line is in its CREDITS.md). 💰 has no animated version. Party and check rendered and animated in a
  HyperFrames snapshot through `window.__hfLottie`.
  Also: `assets/js/LICENSES/gsap-standard-license.txt` lost its 76 repeated headers (body unchanged, 78 lines).
- ✅ **Bijoy/SutonnyMJ → Unicode (plan step 17, 2026-10-06).** `node tools/bijoy2unicode.mjs <file.txt> | "<text>"`
  writes `<file>-unicode.txt` or prints. It reads Notepad ANSI (Windows-1252), UTF-8 ± BOM and UTF-16 (all three
  verified). The engine is `tools/bijoy/` = npm bijoy-unicode-converter 0.1.2 (MIT, Naim Howlader). Its source was
  read first: pure string maps, no network, fs or process access. **Tested on 21 known strings, 20 exact**,
  including আমি বাংলায় গান গাই, প্রধান শিক্ষক, ছাত্রদের, ভর্তি চলছে, বার্ষিক হিসাব, শাহীন স্কুল মির্জাপুর, উজ্জ্বল
  ভবিষ্যৎ, রোল নম্বর ১২ (ASCII digits become Bengali digits). The one miss: reph + ya-phola + e-kar
  (দৈর্ঘ্যের → দৈর্ঘ্যরে), so proofread. The call is `ConvertToUnicode("bijoy", text)`; the first argument is
  the encoding (also "somewherein" and "boisakhi").
- ✅ **music-to-video beat analysis works (plan step 15, 2026-10-06).** librosa 0.11.0 (+ numba 0.68, scipy 1.17,
  scikit-learn 1.9) is in pyenv, which is now 716 MB; it took 160 s to install. **The skill's commands say `python3`,
  which is the Microsoft Store stub here. Run them with the pyenv python instead:**
  `"E:/Video Create/tools/pyenv/Scripts/python.exe" C:/Users/zubay/.claude/skills/music-to-video/scripts/analyze-beatgrid.py <audio> -o grid.json --print`
  (set `PYTHONIOENCODING=utf-8`). Verified on a synthetic 32 s 120 BPM track: 117.5 BPM, 62 beats / 15 bars,
  127 classified events, 64 s. PATH was deliberately NOT changed to shadow `python3`, since that would affect other
  apps. `hyperframes beats` (no Python) remains the quick option for a plain beat grid.
- ✅ **Background removal without a green screen (plan step 18, 2026-10-06).**
  `hyperframes remove-background <clip> -o fg.webm [--quality fast|balanced|best] [-b bg-plate.webm]` downloaded
  `u2net_human_seg.onnx` (175,997,641 B, Apache-2.0) on first use into `~/.cache/hyperframes/background-removal/
  models/` (a junction onto E:). It runs CPU-only at **1.6 s per 720p frame**: a 3 s, 15 fps clip took 72 s, so
  10 s at 30 fps ≈ 8 min. The output is VP9 with `ALPHA_MODE=1`, and it must be decoded with `-c:v libvpx-vp9`
  before `-i` to get yuva420p. Overlay it with `[1:v]format=rgba[f];[0:v][f]overlay` and seek on the OUTPUT side;
  an input-side `-ss` gave a frame with no subject. Tested on the user's own webcam clip
  (Downloads/video2/WIN_20260906_08_52_27_Pro.mp4, dim room): face, shoulders and the blanket were cut cleanly,
  but the top of dark curly hair against a dark background went semi-transparent, and a moving hand was mostly
  lost. **Advice for good results: even, bright light against a plain wall, or a green cloth + FFmpeg
  `chromakey`** (verified in the audit).
- 🔶 **Music tooling ready; tracks still needed from the user (plan step 13, 2026-10-06).**
  `node tools/music-pick.mjs list` scans `assets/music/<mood>/` (duration, LUFS, whether a Pixabay licence PDF sits
  next to each track) and writes `index.json`. `pick <mood> --project=<dir> [--narration] [--insert] [--track=…]`
  reads the root `data-duration` and chooses the shortest track that is long enough (otherwise the longest, with
  a warning). It writes `<project>/assets/music/bgm.mp3`: trimmed, 0.5 s fade-in, fade-out of min(2.5 s, len/4),
  two-pass −16 LUFS, 48 kHz, 192k mp3. The `<audio id="bgm" … data-track-index="9">` tag uses volume 0.13 under
  narration, else 0.8. It refuses a second bgm and unknown moods. **Verified with synthetic tracks:** the full
  finish.mjs render had music alone at −38.5 dB, voice + music at −17.5 dB (music ~21 dB under the voice), a
  −46 dB faded tail, a −14.0 LUFS master, and the narration transcribed cleanly. `assets/music/README.md` (Bengali)
  now tells the user to file tracks by mood folder and keep the licence PDF. **No real music exists yet.**
- 🔶 **Stock photo/b-roll tooling ready (plan step 14, 2026-10-06).** `node tools/stock-fetch.mjs "<query>"
  [--type=photo|video] [--count=3] [--provider=auto|openverse|pexels|pixabay] [--orientation=…] [--out=…]`.
  Default output is `assets/images` or `assets/footage`. Each file gets a sidecar `.json` plus a `CREDITS.md` line.
  **Openverse works with no key** (photos only, CC0/PDM, `category=photograph`, ≥1000 px, relevance order).
  Size-first was rejected because the biggest CC0 files are old museum scans. Flickr results come at 1024 px, so
  the tool flags "smaller than 1080p". **Verified:** classroom, school children, teacher and money coins all
  downloaded with licence trails. Bytes are sniffed for the real type (rawpixel serves WebP named .jpg).
  Failures throw instead of calling process.exit, which had tripped a libuv assertion on Windows. **Pexels and
  Pixabay (photos + video) are written to their documented APIs but UNTESTED until the user adds free keys**
  to `.env.local`; the template is `.env.local.example`, which is versioned while `.env.local` stays ignored.
  ⚠ Free photos have no model release: avoid recognisable people in ads.
- ✅ **Workflow-trap fixers (plan step 9, 2026-10-06).** The updated skills (2026-10-05) still have the traps:
  CDN GSAP in all 4 `assemble-index.mjs` (faceless-explainer, product-launch-video, pr-to-video, music-to-video);
  `bBody = nonMono[0]` in 3 `build-frame.mjs` (now documented upstream as intentional, but wrong for Bengali, where
  display and body faces differ). SFX offsets are now supported upstream (`offset_s` in audio_meta.json), so
  `sfx-offsets.mjs` was not needed. The skills are not patched (an update would overwrite them). Instead:
  **STANDING RULE: after every `assemble-index.mjs` or `hyperframes add`, run `node tools/hf-postassemble.mjs
  <project>`. After `build-frame.mjs`, run `node tools/fix-frame.mjs <project> --apply`.**
  `hf-postassemble` does four things. (1) It swaps CDN GSAP tags (jsdelivr/unpkg/cdnjs, any plugin) for
  `assets/js/gsap/*`. (2) It copies assets/js and fonts in if missing. (3) It expands `@import …fonts.css`, removes
  Google Fonts links whose families are all local, inlines `@font-face` for every pack family used in each HTML
  file (CSS, quoted names, inline `style=""`, GSAP `fontFamily`), and WARNS about families outside the pack.
  (4) It records `<audio id>` cues in `.hf-audio-cues.json` and re-inserts any that vanish.
  **Verified on a copy of hishab-khata-promo:** the skill's own assemble-index dropped all 28 SFX, the fonts link,
  and re-added CDN GSAP (lint still 0 errors). hf-postassemble restored all 28 and made GSAP local. finish.mjs then
  rendered the full 45 s promo WITH SFX: check passed, draft render, −12 → −14 LUFS, all QC PASS, 157 s total,
  frames inspected. Also verified on a registry block (`lower-third-bild`: CDN GSAP fixed, "Barlow Condensed"
  flagged as non-local) and on a planted page (CDN SplitText via unpkg, a Google Fonts link, @import, quoted
  and inline-style families all handled).
  **Discovery:** 0.8.33's compiler IGNORES a linked fonts.css and downloads Google's copies of the families
  instead ("Fetched 5 font face(s) for "Baloo Da 2" from Google Fonts" …). Earlier renders therefore used Google's
  font files, not the pack's, and needed the internet. hf-postassemble was applied to anim-test, audio-test,
  font-test and hyperframes-starter (check passes on all 4). The re-render of an audio-test copy fetched nothing.
  `fix-frame` checks frame.md: ink and ink-soft reach 4.5:1 on paper (ink-soft is mixed toward ink until it
  does); paper-2 stays a surface (≤ 1.25:1, else paper + 6 % ink); reading-ramp keys don't use the display face;
  and every fontFamily is in the local pack (mono → JetBrains Mono, serif → Tiro Bangla, display → Baloo Da 2,
  else Hind Siliguri). Verified: the real hand-corrected frame.md came back clean. A copy with the original six
  mistakes planted (red paper-2, amber ink-soft at 2.05:1, display face on body/micro, DM Mono, Newsreader) was
  fully repaired with `--apply` (ink-soft #387655 at 4.95:1), keeping `.orig`.
  Licences: kokoro-onnx MIT, Kokoro-82M weights Apache-2.0, onnxruntime MIT. **phonemizer and espeak-ng
  (inside espeakng-loader) are GPL-3.0.** That does not affect the audio they generate, so selling videos is fine.
  But never bundle these packages inside a product the user sells.

- ⚠️ **FFmpeg 8.1.1 edge bug: 1080-wide HyperFrames renders lost their right 8 px (found 2026-10-06, fixed in tools).**
  The first khata-cartoon master (1080×1920) had a pure-black 8 px strip down the right edge. Traced step by step:
  - The captured frames are full width. The strip appears in HyperFrames' MP4 encode, which converts through
    `format=gbrp,scale=out_color_matrix=bt709…`.
  - Plain FFmpeg reproduces it: gbrp→YUV leaves the right 8 px black at widths **1080 and 1096**.
  - 1072, 1084, 1088, 720 and 1920 are fine, so the promo and every 16:9 render were never affected.
  - finish.mjs's own 9:16/1:1/4:5 exports don't use gbrp and are clean.
  - Not the capture mode: `--experimental-fast-capture=false` and `PRODUCER_ENABLE_STREAMING_ENCODE=false` both
    still showed it; png-sequence did not.

  **Fix:**
  - `finish.mjs` self-tests the conversion at the project's size (`gbrpEdgeOk`, one lavfi frame). On failure it
    renders a copy in `.cache/padded/` whose page is 1088 wide, with the root pinned at 1080 by `!important` CSS.
    Without the pin, the runtime stretches the root to data-width and centred captions move 4 px.
  - It then crops back with x264 (CRF 15 at high quality) and removes the copy.
  - `qc.mjs` now FAILs any video with a thin pure-black band along an edge (`edges`).
  - Plain `hyperframes render` of a 1080-wide project still has the bug, so always deliver through finish.mjs.
- ✅ **`tools/design-lint.mjs`: the measured design review (2026-10-06, after the first real render).** The user saw
  three flaws in the rendered promo that `hyperframes check` had passed (numbers off their card, column rules at two
  heights, "সং খ্যা য়" letter-spaced) and asked that such mistakes be caught automatically. `node tools/design-lint.mjs
  <project> [--step=0.25] [--fix] [--strict] [--json]` opens the project in the SAME bundle + headless Chrome as check/
  render (`tools/hf-page.mjs` borrows the CLI's own helpers from the 0.8.134 dist; chunk names are resolved at run time
  from `checkBrowser-*.js`'s imports), seeks every 0.25 s and measures the DOM. ERROR: `bn_tracking` (letter-spacing
  ≥0.03em on Bengali letters; digits exempt — `--fix` rewrites the CSS rule, found through `document.styleSheets`),
  `frame_breach` (content between a composition's top/bottom hairlines sticking out past their ends), `card_straddle`
  (text partly off a painted panel; measured on INK bounds via canvas `actualBoundingBox*`, because Baloo's line box is far
  taller than its glyphs), `font_fallback` (Chrome's own answer via CDP `CSS.getPlatformFontsForNode`, once per scene:
  a system font drew Bengali). WARN: `peer_misaligned` (same-class elements side by side or stacked, 1.5–24 px apart on
  every edge, top/bottom/centre/baseline), `orphan_word`, slight Bengali tracking. INFO: `small_text` (<20 px at 1080p).
  Layout findings count only when HELD (2+ consecutive samples, element still) and the message names a scaled ancestor
  ("camera push") when that is the cause. Escape hatches: `data-design-ignore`, `data-design-allow-breach|straddle|
  misalign` (+ `data-layout-ignore`). Exit 1 on ERROR. **finish.mjs now runs it after `hyperframes check` and stops on
  errors** (`--skip-design` to bypass). 14–23 s for 45 s. **Verified on the promo's first render:** it found all three
  reported flaws plus 57 more — tracking on Bengali in all 7 frames, 4–5 px breaches during the 04/05 settles, the
  frame-01 red box overlap false positive (fixed: rotated strokes are not cards), and Bengali digits in frame 04 drawn by
  **Nirmala UI** (JetBrains Mono has no Bengali digits). After the fixes: 0 errors, 0 warnings.
  Also: `qc.mjs` WARNs **dead air** (a still picture AND silence together ≥1.5 s; the first render had 16.8–19.0 s);
  `fix-frame.mjs` sets Bengali roles' tracking to 0 in frame.md; `tools/sfx-leads.mjs [dir]` writes each sound's silent
  lead-in as `lead_s` into manifest.json (ping 0.32 s, typing 0.44, chime 0.42, pop 0.12, cash-register 0.14…).
  **Read §0d before building any new video.**
- ✅ **`tools/contact-sheet.mjs`: a whole video as one image (2026-10-24).** `node tools/contact-sheet.mjs <video>
  [--every=<s>] [--from=<time>] [--to=<time>] [--cols=<n>] [--out=<file.png | folder>]`. Plain node and FFmpeg. Default:
  ONE sheet at the smallest round step that fits (0.25, 0.5, 1, 2, 2.5, 5, 10 … s): 6 s → 24 frames every 0.25 s,
  45 s → 23 every 2 s, 5 min → 30 every 10 s. `--every=0.5` spreads 600 frames of a 5-minute video over 19 sheets in
  21.8 s. Each tile is labelled with its time ("1:15.5"); the header names the file, the stretch, the step, the size and
  the page (Bengali, Hind Siliguri). Sheets stay ≤ ~1560 px a side (8 columns for 9:16, 6 for 1:1 and 4:5, 4 for 16:9),
  so Claude's image reader sees them unshrunk. A 9:16 tile is then 188 px wide, too small to read captions; `--cols=4`
  (382 px tiles, 8 a page) made the cartoon's Bengali captions and form text fully legible. Output
  `<video>-sheet.png` or `-sheet-01.png …` beside the video; earlier sheets of that name are replaced. One FFmpeg pass: `fps=fps=<step>:start_time=0:round=up` → trim → scale → `ass`
  labels → `tile` → `pad` → `ass` header, run in a temp folder holding only the two fonts (like burn-subs).
  **Timing trap, found and fixed:** fps's default `round=near` keeps the LAST frame that rounds to each slot, so a tile
  showed the picture up to half a step after its label (frame 7 under "0:00" on a frame-numbered test video); PSNR of
  tiles against frames cut at their labelled time matched only 10/32 and 11/24. With `round=up` (the frame on screen at
  that moment) it is exact: 0:00 = frame 0, 0:00.5 = frame 15, 0:10 = frame 300 with `--from`, a file starting at
  0.3 s too, and 79/79 tiles on the cartoon and the promo matched their labelled time. A rotated phone clip is tiled
  upright. **Shared helpers moved for it:** `qc.mjs` probe() now returns `rotation` and exports `displaySize(v)`;
  `srt.mjs` exports `assTime`; burn-subs imports both (its output is frame-identical on 8 clips).
  **An independent tester then broke it in 9 ways, all fixed and re-run (2026-10-24):** the old-page cleanup deleted
  unrelated files such as `frame-17.png` beside `--out=frame.png`, before FFmpeg even ran (now pages are made in a temp
  folder, copied in only on success, and only `<video>-sheet` pages the tool named itself are replaced); a `%` in a
  name broke multi-page runs (12 awkward names now work, Bengali and `৫০% ছাড়` included); `--from` dropped the frame
  already on screen (now the decode starts 10 s early and fps `start_time` cuts; a variable-frame-rate clip 8/8); the
  length came from the file, not the video track (a 1 s late track and an MKV with longer audio now measure 7.1 s and
  6.1 s); a non-whole-millisecond step drifted (the step is snapped to ms: 452/452 tiles right at 0.133 s);
  non-square pixels were squashed; `--cols=1` made a 2808 px sheet; misspelt options were ignored; and raw streams
  crashed `qc.mjs` `isFaststart` (now guarded for every caller). Ground truth: the tester's videos carry each frame's
  number as a 12-bit stripe code that a script reads back from every tile; 25, 29.97, 30 and 60 fps all right.

### Capability audit (2026-10-04): what is ready, and the install plan

**Ready today (verified):** Bengali typography and motion-graphics videos with SFX and sound. Footage
editing: H.264/HEVC/60 fps/VFR/rotated clips placed with their own audio, plus FFmpeg
trim/concat/speed/reframe/vidstab/scene-cut/hqdn3d/LUT/chromakey and silence cuts. Audio mixing,
ducking and loudness. Bengali text in HyperFrames. WebM-alpha/ProRes/GIF/thumbnail exports. QC
detectors (black/freeze/silence/crop, VMAF). Intel QSV encode. The mic, webcam and screen-capture
devices are visible to FFmpeg.

**The install/build plan.** The user asked for everything to be set up. Do one step at a time: build, verify,
then stop for his OK. Every download needs his OK first (name, source, size).

| # | Step | Download | Status |
| --- | --- | --- | --- |
| 1 | Plain render as default; env cleanup; docs | none | ✅ done 2026-10-05 |
| 2 | Workspace Python venv `tools/pyenv` + `HYPERFRAMES_PYTHON` | none | ✅ done 2026-10-05 |
| 3 | Kokoro English TTS (model already cached; only the package is missing) | ~45 MB | ✅ done 2026-10-05 |
| 4 | Bengali narration from the user's own mic + clean-up chain (`tools/voice.mjs`) | none | ✅ done 2026-10-05 |
| 5 | `tools/finish.mjs` + `tools/qc.mjs`: check → render (long-render env) → −14 LUFS → QC → 16:9/9:16/1:1/4:5 + thumbnail → `renders/<project>/` | none | ✅ done 2026-10-05 |
| 6 | Bengali subtitle tools (`burn-subs.mjs` via `ass=`, `srt-to-words.mjs`) | none | ✅ done 2026-10-05 |
| 7 | Accurate Bengali ASR: faster-whisper in pyenv + `SayedShaun/bengali-whisper-medium-ct2` (Apache-2.0) + `tools/transcribe.mjs`/`.py` | ~845 MB | ✅ done 2026-10-05 |
| 8 | Register whisper.cpp for English (copy from `E:\remotion and hyperframe,`) + `HYPERFRAMES_WHISPER_PATH` | 488 MB (small.en) | ✅ done 2026-10-06 |
| 9 | Workflow-trap fixers: `hf-postassemble.mjs` (CDN GSAP, fonts incl. @import, dropped audio) + `fix-frame.mjs` | none | ✅ done 2026-10-06 |
| 10 | Remotion `render.mjs` → plain bundled render (fade fixed, BT.709 tags) | none | ✅ done 2026-10-06 |
| 11 | Piper `bn_BD-google-medium` offline Bengali TTS (CC BY-SA training data → attribution) | ~111 MB | ✅ done 2026-10-06 |
| 12 | DeepFilterNet voice-denoise exe (MIT/Apache-2.0) | 27 MB | ✅ done 2026-10-06 |
| 13 | Music: the user downloads Pixabay tracks by hand → `music-pick.mjs` | user | 🔶 tool ✅ 2026-10-06; tracks = USER |
| 14 | Stock photos/b-roll: the user's free Pexels/Pixabay keys in `.env.local` → `stock-fetch.mjs` | user | 🔶 tool ✅ (Openverse works keyless); keys = USER |
| 15 | librosa 0.11.0 in pyenv for music-to-video (1.0 needs Python ≥ 3.12) | ~100 MB | ✅ done 2026-10-06 |
| 16 | Assets: Lucide icons, 7 more OFL Bengali fonts, CC0 SFX, Lottie | ~10 MB | ✅ done 2026-10-06 |
| 17 | Bijoy (SutonnyMJ) → Unicode converter | 73 KB | ✅ done 2026-10-06 |
| 18 | Background-removal model `u2net_human_seg` (Apache-2.0) | 176 MB | ✅ done 2026-10-06 |
| 19 | git versioning of sources (move the empty nested `.git` in remotion-starter first) | none | ✅ done 2026-10-05 (FIRST, as the overnight safety net; one commit per step) |
| 20 | Cleanup: `.media` test pollution, `out/frames`, Kokoro .tmp → **moved to `.quarantine/`, nothing deleted** | none | ✅ done 2026-10-06 |
| 21 | Optional: Azure bn-BD neural TTS (account + card) | — | ⏭ skipped — needs the user to open an account (card check). Piper + own voice cover Bengali |
| 22 | HyperFrames 0.8.33 → **0.8.134** (needed: the self-updated skills require it) | ~34 MB | ✅ done 2026-10-06 |

**Impossible here regardless:** admin-only installs; local AI image/video/music generation at a usable
speed (no GPU, ~4 GB free RAM); the Apple-Silicon MLX tools media-use defaults to (mflux,
parakeet-mlx, ltx-2-mlx); NVENC/AMF; 4K in practice. A fully unattended render-to-delivery run is
not a machine limit: the render is user-gated by design.

---

## 0c. Editing cookbook: verified FFmpeg recipes for the user's own footage (2026-10-04/06)

Every line below was run on this laptop (system FFmpeg 8.1.1) during the capability audit. Times are for 1080p.
Do the cutting, reframing, grading and loudness in FFmpeg; use HyperFrames for graphics and titles, rendered on
top. For long footage, render the overlay transparent (`hyperframes render --format webm`) and composite it
with FFmpeg (the "hybrid path"): 8 s took 33 + 10 s that way vs 48.6 s through a full HyperFrames render.

| Job | Command (key part) | Notes |
| --- | --- | --- |
| Inspect | `ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,color_transfer:format=duration -of compact in.mp4` | `color_transfer` arib-std-b67 / smpte2084 = HDR |
| Exact trim | `ffmpeg -ss 12.5 -to 20 -i in.mp4 -c:v libx264 -crf 18 -c:a aac out.mp4` | `-c copy` snaps to keyframes (asked 2.0 s, got 2.10 s) |
| Join clips | concat filter after normalising each input (`scale=1920:1080,fps=30`, `aresample=48000`) | verified with a VFR .mov in the mix |
| Speed | `setpts=0.5*PTS` + `atempo=2.0` (2×); slow-mo `minterpolate=fps=30:mi_mode=blend` + `atempo=0.5` | |
| 16:9 → 9:16 | `crop=ih*9/16:ih,scale=1080:1920` or the blurred-fill version in `tools/finish.mjs` | no automatic subject tracking |
| Stabilise | `vidstabdetect=shakiness=8:accuracy=15:result=t.trf` then `vidstabtransform=input=t.trf:smoothing=30:zoom=5,unsharp=5:5:0.8:3:3:0.4` | `tripod=1` for locked-off shots; bare file names (colon issue). Shake 9.32 → 5.34 (3.82 tripod) |
| Scene cuts | `ffmpeg -i in.mp4 -vf "select='gt(scene,0.3)',showinfo" -f null -` | found cuts at exactly 2.0 / 4.0 s |
| Video denoise | `hqdn3d=6:4:9:6` | PSNR 36.3 → 41.1 dB; `nlmeans` too slow (90 s per second of video) |
| LUT / grade | `cd assets/luts && ffmpeg -i in.mp4 -vf "lut3d=file='film-fade.cube'" …` | or an escaped absolute path `lut3d=file='C\:/…/x.cube'`; partial strength in §4e |
| Green screen | `chromakey=color=0x00B140:similarity=0.12:blend=0.05,despill=type=green` then overlay on a background | despill shifts yellow/cyan; drop it if the subject has those colours |
| No green screen | `hyperframes remove-background clip.mp4 -o fg.webm` (step 18) | 1.6 s/frame at 720p; needs good light |
| HDR phone clip → SDR | `zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p` | HyperFrames' own `--sdr` does NOT tonemap at extraction |
| VFR → CFR | `-vf "fps=30,format=yuv420p" -c:v libx264 -crf 18 -g 30` | HyperFrames handles VFR itself; this is for long files |
| Cut silences | `silencedetect=noise=-35dB:d=0.5`, then keep the ranges (media-use `transcript-cut.mjs --keep "…"`) | no speech recognition needed |
| Cut by words | `tools/transcribe.mjs` → words.json → `transcript-cut.mjs` | Bengali: the step-7 model |
| Audio out | `-vn -ac 1 -ar 16000 -c:a pcm_s16le` (for ASR) | |
| Voice cleanup | `node tools/voice.mjs clean <file>` (AI denoise, −16 LUFS) | voice only, never music |
| Fast drafts | `-c:v h264_qsv -global_quality 22` (Intel Quick Sync) | 2.6 s vs 8.3 s for libx264 medium; use x264 for finals |
| Finish + deliver | `node tools/finish.mjs <video.mp4>` | −14 LUFS, QC, 9:16/1:1/4:5, thumbnail, GIF |
| Subtitles | `node tools/burn-subs.mjs <video> <subs.srt>` | never `subtitles=` for Bengali |

Long footage through HyperFrames: ~0.13–0.20 s per frame (5 min ≈ 25–40 min). Always pass
`--frames-cache-dir "E:/Video Create/.cache/frames"`; finish.mjs does this. The extract cache otherwise fills C:.

---

## 1. What this workspace is

`E:\Video Create` — a local professional video production workspace built on two frameworks:

| Framework | What it is | Status |
| --- | --- | --- |
| **HyperFrames** 0.8.134 (was 0.8.33 until 2026-10-06) | Renders video from **HTML**. DOM declares timing via `data-*` attributes. | ✅ installed globally, renders verified |
| **Remotion** 4.0.523 | Renders video from **React**. TypeScript compositions. | ✅ installed per-project, renders verified |

Both are installed and **both have produced real 1080p MP4 files on this machine**.

### Folder layout

```
E:\Video Create\
├── CLAUDE.md                     ← this file
├── tools\
│   ├── hf-render.mjs             ← archived fallback since 2026-10-04 — use plain `hyperframes render` (§0b)
│   ├── voice.mjs                 ← record from a mic + clean any voice recording → -16 LUFS WAV (§0b)
│   ├── finish.mjs                ← ONE COMMAND: project or video file → checked, -14 LUFS, all formats (§0b)
│   ├── qc.mjs                    ← delivery quality gate (FAIL/WARN/INFO, incl. dead air), used by finish.mjs (§0b)
│   ├── design-lint.mjs           ← measured design review of a project (alignment, frame, Bengali, fonts) (§0b, §0d)
│   ├── hf-page.mjs               ← opens a project in HyperFrames' own page/browser for measuring (used by design-lint)
│   ├── sfx-leads.mjs             ← writes each SFX file's silent lead-in (lead_s) into manifest.json (§0d rule 7)
│   ├── burn-subs.mjs             ← burn SRT/VTT/ASS into a video with correct Bengali conjuncts (§0b)
│   ├── srt-to-words.mjs          ← SRT/VTT → word timings JSON for word-by-word captions (§0b)
│   ├── srt.mjs                   ← shared SRT/VTT reader (BOM, UTF-16, CRLF, NFC)
│   ├── plan-check.mjs            ← checks a video's PLAN.md (shot table, pace, sounds, script length) before he sees it (§0e)
│   ├── plan\TEMPLATE.md          ← the plan every new video starts from; plan\EXAMPLE.md is a filled 30 s Reel (§0e)
│   ├── contact-sheet.mjs         ← a whole video as one image of time-labelled frames, for review (§0b, §0d rule 9)
│   └── pyenv\                    ← workspace Python venv (Kokoro TTS); HYPERFRAMES_PYTHON points here
├── projects\
│   ├── remotion-starter\         ← Remotion 4 + React 19 + Tailwind v4
│   │   ├── render.mjs            ← old PNG-path render; drops root fades — see §0b / §3
│   │   ├── src\Composition.tsx   ← the "Video Create" title card demo
│   │   ├── src\Root.tsx
│   │   └── out\video.mp4         ← verified output
│   ├── hyperframes-starter\      ← HyperFrames project (has its own CLAUDE.md + AGENTS.md)
│   │   ├── index.html
│   │   ├── hyperframes.json
│   │   └── renders\verify.mp4
│   ├── font-test\                ← font sample sheet, proves the font pack renders (§4b)
│   │   └── renders\font-test.mp4
│   ├── anim-test\                ← animation-runtime proof: GSAP + Anime.js + CSS (§4c)
│   │   └── renders\anim-test.mp4
│   ├── audio-test\               ← SFX + audio-in-MP4 proof (§4d)
│   │   └── renders\audio-test.mp4
│   └── hishab-khata-promo\       ← ⭐ the first real video: 45 s Bengali promo, RENDERED 2026-10-06 (§4g)
│       ├── BRIEF.md  STORYBOARD.md  frame.md
│       └── compositions\frames\  ← 7 frames, all animated
├── assets\
│   ├── fonts\                    ← ✅ 9 families, OFL 1.1, + fonts.css + LICENSES (§4b)
│   ├── js\                       ← ✅ GSAP + Anime.js + Lottie, vendored + LICENSES (§4c)
│   ├── sfx\                      ← ✅ 19 SFX, Pixabay License, + CREDITS (§4d)
│   ├── music\                    ← ⏳ empty; README.md tells the user how to add Pixabay tracks (§4d)
│   ├── luts\                     ← ✅ 3 .cube looks, generated locally + README (§4e)
│   ├── icons\lucide\             ← ✅ 1,866 SVG icons, ISC (§0b step 16)
│   ├── lottie\noto-emoji\        ← ✅ 14 animated emoji, CC BY 4.0 — credit required (§0b step 16)
│   ├── voices\piper\             ← ✅ offline Bengali TTS voice + speakers.json + CREDITS (§0b step 11)
│   ├── models\asr\               ← ✅ Bengali speech-recognition model, 775 MB, git-ignored (§0b step 7)
│   └── footage\   images\                              ← still empty
└── renders\                                                     ← empty, final deliverables go here
```

Total on disk: **1.03 GB** (almost all of it `remotion-starter/node_modules`).

---

## 2. Verified machine facts (2026-09-10)

Do **not** re-probe these unless something breaks.

| Thing | Value |
| --- | --- |
| OS | Windows 11 Pro 10.0.26200, x64 |
| Shell | Git Bash (POSIX sh). **Not** PowerShell, **not** cmd. Use unix syntax. |
| CPU | Intel Core i5-8265U — 4 cores / 8 threads, 15W laptop chip (2018) |
| GPU | Intel UHD 620 integrated only. **No discrete GPU.** |
| RAM | 15.8 GB total, but only **~3–5.7 GB free** (measured 3.7–5.7 on 2026-10-04) — user keeps ~40 Chrome tabs open |
| Disk | **E: 69 GB free, C: only ~6.9 GB free** (2026-10-05; the old "71 GB" was E:). Both local NTFS. Keep venvs, models and frame caches on E:. |
| Node.js | v24.18.0 |
| npm | 11.16.0 |
| Python | 3.11.15 on PATH as `python` — ⚠️ that is the **Hermes Agent app venv**, never pip-install into it (§0b). `python3` = Store stub, `py` absent |
| git | 2.54.0.windows.1 |
| FFmpeg / FFprobe | **8.1.1-full_build (gyan.dev)** on PATH — full build |
| Chrome | `C:\Program Files\Google\Chrome\Application\chrome.exe` |
| Admin rights | ❌ **NOT available.** `IsInRole(Administrator)` = False. No Defender exclusions, no system-wide installs needing elevation. |
| Docker | ❌ not installed |

The system FFmpeg is excellent and is the backbone of this setup. It includes:
`libx264, libx265, libsvtav1, libaom, libvpx, libplacebo, libzimg, libass, libfreetype, libharfbuzz,
libfribidi, librubberband, libsoxr, libvmaf, libvidstab, frei0r, ladspa, nvenc, qsv/libvpl, amf,
vaapi, d3d11va, vulkan, opencl, whisper`.

---

## 4. Commands that are known to work

```bash
# Remotion — render (fixed 2026-10-06: plain bundled render + lossless BT.709 tagging; keeps fades; 19–65 s for 5 s)
cd "E:/Video Create/projects/remotion-starter" && npm run render
# any composition / output:  npm run render -- MyComp out/promo.mp4

# Remotion — pick composition and output
cd "E:/Video Create/projects/remotion-starter" && npm run render -- MyComp out/promo.mp4 30

# Remotion — visual editor in the browser
cd "E:/Video Create/projects/remotion-starter" && npm run studio

# HyperFrames — render (default again since 2026-10-04 — SAC off, §0b). Video AND audio.
cd "E:/Video Create/projects/<project>" && hyperframes render --quality high --workers 1 --output renders/video.mp4

# HyperFrames — anything longer than 240 s (refused by default on this disk, §0b)
cd "E:/Video Create/projects/<project>" && PRODUCER_STREAMING_ENCODE_MAX_DURATION_SECONDS=3600 hyperframes render --quality high --workers 1 --frames-cache-dir "E:/Video Create/.cache/frames" --output renders/video.mp4

# Fallback ONLY if Smart App Control ever returns (silent, 2.3x slower, §2c):
#    node "E:/Video Create/tools/hf-render.mjs" "E:/Video Create/projects/<project>"

# HyperFrames — quality gate (run before every render)
cd "E:/Video Create/projects/hyperframes-starter" && hyperframes check

# HyperFrames — Studio preview
cd "E:/Video Create/projects/hyperframes-starter" && hyperframes preview

# HyperFrames — new project
cd "E:/Video Create/projects" && hyperframes init <name> --non-interactive --example blank --resolution landscape

# Environment health
hyperframes doctor --json
```

`hyperframes` is on PATH globally at `C:\Users\zubay\AppData\Roaming\npm\hyperframes`.

---

## 5. Measured render performance (real numbers from this machine)

| Job | Time |
| --- | --- |
| HyperFrames — 300 frames (10s @ 30fps) 1080p, quality high | **39.1 s** |
| Remotion — 150 PNG frames (5s @ 30fps) 1080p | 43 s |
| System FFmpeg — encode 150 frames → H.264 CRF 17 | 6.3 s |
| Remotion — full `npm run render` end to end | **40 s** |
| HyperFrames — 5 s 1080p via the bundled headless shell (2026-09-10) | 41.9 s |
| HyperFrames — the **same 5 s job via the system Chrome** (2026-09-11, after the Application Control block) | **54.2 s** |
| HyperFrames — the **same 5 s job via `tools/hf-render.mjs`** (2026-09-25, png-sequence + system FFmpeg) | **31–38 s** |
| HyperFrames — **plain `hyperframes render`**, 5 s 1080p, headless shell, SAC off (2026-10-04) | **12.6 s** (hf-render.mjs: 25.2 s) |
| HyperFrames — plain render, audio-test 8 s 1080p with sound, `--quality high --workers 1` (2026-10-05) | **29 s** |
| Estimates at 1 worker (2026-10-04): light typography 1 min ≈ 2.5 min, 5 min ≈ 13 min; heavy motion 1 min ≈ 11 min; footage ≈ 0.13–0.20 s/frame | — |

**HyperFrames is roughly 2× faster per frame than Remotion here.** Prefer it when speed matters.

⚠️ Since 2026-09-11 every render goes through the full system Chrome instead of the headless
shell (§2b), which costs about **30% more time**. The 45 s promo in `hishab-khata-promo` should
therefore be budgeted at roughly **6–8 minutes**, not 3–4.

Extrapolated (estimates, not measured): 1 minute of 1080p ≈ **5 min** in HyperFrames on the
system Chrome (it was ≈ 4 min on the headless shell), ≈ **8 min** in Remotion.

**Work at 1080p.** 4K on a UHD 620 iGPU with 3 GB free RAM is impractical.
Keep `--concurrency=2` — this machine thrashes above that.

---

## 6. Windows / this-machine gotchas

- **The path contains a space** (`E:\Video Create`). Quote it in every command, always.
- **"Device or resource busy"** when moving or deleting a freshly-`npm install`ed folder is common
  here (antivirus scanning). **Wait ~5 s and retry** — it succeeds. `cmd //c "move /Y src dst"`
  works when Git Bash `mv` refuses.
- A partially-failed `rm -rf` on a busy folder can **empty the folder but leave the directory**.
  If a package suddenly "doesn't exist", check for an empty dir and re-run `npm install`.
- npm prints `allow-scripts` warnings for `esbuild`, `onnxruntime-node`, `protobufjs`, `@google/genai`.
  Harmless so far; do not run `npm approve-scripts` without asking the user.
- No admin rights → cannot add Defender exclusions, cannot install system-wide runtimes.
- Chrome eats the RAM. If a render OOMs, ask him to close tabs first.

---
