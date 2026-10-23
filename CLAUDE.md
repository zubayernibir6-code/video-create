# CLAUDE.md — Video Create workspace

> Read this file first. It is the handoff record for this workspace. Everything below was
> **verified by running it on this machine**, not assumed. Dates are absolute.

---

## 0. How to work with this user (overrides defaults)

- The user is **Talha Zubayer** — a **non-coder**, accountant at Shaheen School, Mirzapur, Bangladesh.
  He builds sellable software products with AI.
- **Always reply in simple Bengali.** Translate any technical term the first time it appears. No jargon.
- **One step at a time.** After each step: stop, explain in plain Bengali what was built, give exact
  test steps, wait for his OK. Never batch modules together.
- **Verify before showing.** Run/build/test with real data yourself, then hand him a clean test recipe.
- Report only what you actually verified. If something failed or is untested, say so plainly.
- **Destructive actions** (deleting files, dropping data) or **anything that costs money**: warn clearly
  in Bengali first, get an explicit OK.
- Secrets (API keys): never ask for them in chat, never print them. Tell him which file to paste into
  (usually `.env.local`) and where to get the value.
- Never deploy or publish without his OK.
- **His taste lives in `STYLE.md`; his feedback log is `LESSONS.md`** (both at the workspace root, in Bengali).
  Read both before planning or editing any video. Details in §0e.

---

## 0a. ⭐ NEW MACHINE LOGIN (2026-10-20 / 10-23). Read this first: most paths below are from the OLD login.

The workspace is now **`D:\Video Create`** under Windows user **`Zubayer Nibir`** (same i5-8265U laptop, Windows
reinstalled, new SID). **There is no E: drive and no `C:\Users\zubay`.** Wherever this file says `E:\Video Create`,
read `D:\Video Create`; for `C:\Users\zubay`, read `C:\Users\Zubayer Nibir`. Restore log: `.work-memory/CURRENT_STATE.md`.

- **Toolchain (restored 2026-10-20, re-verified 2026-10-23):** FFmpeg/FFprobe **9.0.2** in `tools/ffmpeg/ffmpeg-9.0.2-full_build/bin`
  (user env HYPERFRAMES_FFMPEG_PATH / FFPROBE_PATH point there), Node 24.21, HyperFrames **0.8.134** global (at
  `%LOCALAPPDATA%\Programs\nodejs`), `tools/pyenv` rebuilt on official Python **3.11.9** (`tools/python311`). The user env vars
  HYPERFRAMES_PYTHON / WHISPER_PATH / SKIP_SKILLS / NO_AUTO_INSTALL are set. HyperFrames telemetry is disabled in its config.
  `hyperframes doctor` is green except RAM, MusicGen and Docker (all expected). bn-tts made a 3.4 s line in 8.6 s.
- **HyperFrames skills installed 2026-10-23, PINNED to v0.8.134** (the user's OK, with "don't upgrade the CLI"). The CLI's own
  `hyperframes skills` installs the latest from GitHub main, which can need a newer CLI. So the `skills/` folder of tag
  **v0.8.134** (commit 0dc957f) was sparse-cloned (`core.longpaths=true` is required: some paths exceed 260 chars), and its 21
  skills were copied into `~/.claude/skills` and `~/.agents/skills` (927 files, 18 MB each). hyperframes and hyperframes-cli are
  byte-identical to the copies bundled inside the 0.8.134 package. `hyperframes skills check` reports 7 skills as
  "Outdated": that is intentional. **Do not run `hyperframes skills update`** (it would pull skills for 0.8.181). Upgrade the
  skills and the CLI together, and only with the user's OK.
- **media-use:** use the documented `npx hyperframes media-use resolve …` (it runs the global 0.8.134 offline; an sfx resolve
  took 3.6 s). The legacy `scripts/resolve.mjs` shim exits silently unless `HYPERFRAMES_PLUGIN_VERSION` is set (it falls through
  to a monorepo/bun path). Set `DO_NOT_TRACK=1` for media-use scripts (PostHog). `hyperframes-audio/scripts/carve.mjs` also
  falls back to `bun`, which is not installed.
- **Verified 2026-10-23:** a scratch copy of audio-test passed check (73/73 contrast) and rendered in 40 s: 8.0 s, h264 1080p +
  AAC 48 kHz stereo, −9.0 LUFS (same as the reference). The frames were inspected and the Bengali is correct.
- **Limits on this login:** D: ~4.3 GB free, C: ~6 GB free, RAM ~1–1.6 GB free (doctor warns). Free space before any long
  render. `%TEMP%` (frames extract cache) is on C:.
- **git:** the folder still belongs to the old login's SID, so git refused it ("dubious ownership"). Fixed on 2026-10-23 with the
  user's OK: `git config --global --add safe.directory "D:/Video Create"`. Commits work again.

---

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

## 0d. ⭐ Video craft rules — STANDING, for every composition (2026-10-06)

Learned from the user's review of the first real render (hishab-khata-promo). `tools/design-lint.mjs` enforces the
measurable ones and `finish.mjs` runs it; follow the rest by hand. Skill workers do not know these rules: put them in
every frame packet / brief you write, and run design-lint after every build change.

1. **Camera moves END at scale 1.** A push/settle on a content plane starts BELOW 1 and lands on 1
   (`fromTo(stage, {scale: 0.965}, {scale: 1})`), so the held frame is the authored layout. Scaling content past 1
   carries it over the frame hairlines and off its panels while the furniture stays put (frame 06 went 31 px past).
2. **Panels are sized by their content.** Put the panel INSIDE the content's container (`position:absolute; inset:0`,
   content items `position:relative` so they paint above it) instead of a separately placed box at fixed pixels.
3. **Rows of stats/columns share ONE grid.** Wrappers get `display: contents`; every piece is placed by
   `grid-column`/`grid-row`; heads share a row; numerals use `align-self: baseline`. Never `align-items: end` across
   columns of different content (it put the 001 rule 9 px above 002/003).
4. **Bengali takes no letter-spacing** (tracking breaks the matra line). Slight negative tracking on display is fine.
   Presets' tracked "micro" labels come from Latin design: `fix-frame.mjs` zeroes them in frame.md.
5. **Sizes at 1080p:** anything the viewer must read ≥ 28 px; kickers/eyebrows ≥ 24 px (16 px was unreadable on a phone);
   ≤ 15 px only for page furniture (page numbers, chrome).
6. **Every font stack that can receive Bengali has a pack Bengali font in it** — mono stacks are
   `"JetBrains Mono", "Hind Siliguri", monospace`. Otherwise Chrome borrows a system font (Nirmala UI here).
   Hind Siliguri's "১" is a small hook-shaped design (not an error); Baloo Da 2 and Noto Sans Bengali draw the classic
   "১". Keep one face per role (data/body = Hind Siliguri, display numerals = Baloo Da 2).
7. **Sound on the beat:** `data-start = visual hit − lead_s` (`assets/sfx/manifest.json`, `tools/sfx-leads.mjs`).
   Every scene transition gets a sound; UI events get quiet ticks (click.mp3 at 0.28–0.35); count-ups can ride
   typing.mp3 at ~0.22. Overlapping cues must sit on different `data-track-index` lanes (pack onto 20, 21, 22…).
8. **No dead air:** never a still picture AND silence together for ≥ 1.5 s (qc.mjs WARN). Real music under the SFX is
   the biggest remaining upgrade for any promo (the user's Pixabay task → `music-pick.mjs`).
9. **Look at it:** after the render, extract frames every 0.5 s (`ffmpeg -vf "fps=2,scale=480:270"` + `tile=4x3`) and
   review every one, plus the held end of each scene at full size. Lint and design-lint do not judge taste.
10. **Quote every font family name** in CSS and in SVG `font-family="…"` attributes. A name with a digit (`Baloo Da 2`)
    is not a valid unquoted CSS identifier, so Chrome throws away the WHOLE list and draws the text in Times New Roman
    + Nirmala UI. No error appears anywhere. In the khata-cartoon every Baloo label was a system font until design-lint's
    `font_fallback` caught it (2026-10-06). In a JS-built SVG string, write `font-family="&#39;Baloo Da 2&#39;, sans-serif"`.
11. **Symbols like ✓ are not in the pack fonts** (Segoe UI Symbol drew them). Draw ticks and arrows as SVG paths.
12. **Baloo's line box is huge** (ascent 1.095 em, descent 0.589 em; Hind 1.116 / 0.501). `hyperframes check`'s
    `content_overlap` measures those boxes, so stacked SVG texts need baseline gaps computed from these numbers.
13. **Captions** get `text-wrap: balance` (otherwise one short word sits alone on the last line; design-lint `orphan_word`).

---

## 0e. STYLE.md + LESSONS.md: the taste layer (added 2026-10-23, from the claude.ai chat)

- `STYLE.md` holds the user's editing taste in simple Bengali. Lines marked **(শেখা)** are rules proven on
  hishab-khata-promo and khata-cartoon; **(বদলান)** lines are starting defaults he is meant to change; a line ending
  in `?` is an open question for him. Where STYLE.md speaks, it overrides workflow and skill defaults, but never the
  §0 working rules or the §0d craft rules.
- Before building a video: read STYLE.md and LESSONS.md, then show him a shot table (time · on screen ·
  caption/super · sound) and wait for his OK before rendering.
- After each round of his feedback: append one row to LESSONS.md (date · video · what he said · rule for next time).
  When the same lesson shows up twice, propose a STYLE.md edit and apply it only with his OK.
- Both files (and this §0e) were written from the claude.ai chat, which can read and write files in this folder but
  cannot run commands. Committed to git from the Code tab on 2026-10-23, with his OK.
- ✅ **Done 2026-10-23:** `burn-subs.mjs` used to put subtitles 7 % above the bottom edge, which on a 1080×1920 Reel
  measured at 90–91 % from the top, inside the bottom ~35 % that Facebook/Instagram cover with the caption, name and
  buttons (Meta's Reels ad safe zone: top 14 %, bottom 35 %, sides 6 %). 9:16 captions are now centred at 60 % by
  default, with `--pos` to override (details in §0b, subtitle tools). Before/after frames:
  `renders/burn-subs-test/2026-10-23/`.
- ⚠️ The `zero-cost-video-editor.zip` kit from the same chat must **not** be installed here as-is. Its setup runs
  `npx skills add heygen-com/hyperframes` (that breaks the v0.8.134 skills pin, §0a) and `pip install stable-ts`
  (PyTorch, several GB, on a short disk; never pip-install outside `tools/pyenv`, §0b). Its ideas are being merged one
  step at a time instead: (1) STYLE.md + LESSONS.md, done 2026-10-23. Next, each only with his OK: (2) the
  plan-then-shot-table step, (3) a contact-sheet tool (a whole video as one timestamped image, for Claude's own
  review). **Dropped at his request (2026-10-23):** the .otio export for DaVinci Resolve. He wants Claude to deliver the
  finished video end to end (script → voice → visuals → captions → sound → render → QC → all formats), not a timeline
  for him to finish by hand. Do not suggest manual editors.

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

## 2b. ⚠️ SUPERSEDED 2026-10-05 (SAC off — see §0b). Fallback only: Windows Application Control blocked HyperFrames' own Chrome (2026-09-11)

**Symptom.** Every `hyperframes check`, `snapshot`, `preview` poster and **render** dies with:

```
Runtime
  ✗ check_runtime_failure: spawn UNKNOWN
```

It is not a code problem and not a memory problem. Running the binary by hand shows the real error:

```
C:\Users\zubay\.cache\hyperframes\chrome\chrome-headless-shell\win64-152.0.7977.30\chrome-headless-shell-win64\chrome-headless-shell.exe
-> "Program 'chrome-headless-shell.exe' failed to run: An Application Control policy has blocked this file"
```

Windows Defender Application Control / Smart App Control started blocking the **unsigned
headless-shell Chrome** that HyperFrames downloads into `~/.cache/hyperframes/chrome/`. This
appeared between 2026-09-10 (renders worked) and 2026-09-11 (nothing ran). `hyperframes doctor`
still reports Chrome as ✓ — it only checks that the file exists, not that it can execute.
Git Bash reports the same thing as a misleading `Permission denied`.

**The user has no admin rights, so the policy cannot be changed.**

### The fix, already applied

The **system Google Chrome is signed and therefore allowed**. HyperFrames honours an override:

```
HYPERFRAMES_BROWSER_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

It is now set as a **user-level environment variable** (no admin needed), so every new shell
gets it automatically:

```powershell
[Environment]::SetEnvironmentVariable('HYPERFRAMES_BROWSER_PATH', 'C:\Program Files\Google\Chrome\Application\chrome.exe', 'User')
```

To undo: set the same variable to `$null`. To check it took: `npx hyperframes browser path`
should print the Program Files path, not the `.cache` one.

**A shell that was already open will not see it** — export it inline for that session:

```bash
export HYPERFRAMES_BROWSER_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
```

### Verified (2026-09-11)

`projects/font-test` re-rendered end to end with the system Chrome: **5.0 s, 1920×1080, h264,
944 585 bytes** vs the 2026-09-10 headless-shell render's 946 589 bytes — the same video.
Render time **54.2 s vs 41.9 s**, so the full Chrome is roughly **30 % slower** than the
headless shell. Budget for that: 1 minute of 1080p is now closer to **5 min** than 4.

Sibling env vars the CLI honours, same shape: `HYPERFRAMES_FFMPEG_PATH`,
`HYPERFRAMES_FFPROBE_PATH`, `HYPERFRAMES_WHISPER_PATH`.

---

## 2c. ⚠️ SUPERSEDED 2026-10-04 (SAC off — see §0b). Fallback only: Smart App Control blocked `ffprobe.exe` (2026-09-25) — `tools/hf-render.mjs`

> If this fallback is ever revived: png-sequence renders DO carry audio — HyperFrames writes an
> `audio.m4a` sidecar into the sequence folder, which hf-render.mjs currently deletes. Mux that
> sidecar instead of writing hf-audio.mjs.

**The 2026-09-11 fix in §2b is still needed and still correct. This is a second, separate block.**

**Symptom.** `hyperframes render` captures every frame, encodes the MP4, prints a duration-probe
failure, and then **the finished video is gone**. It looks like the render failed. It did not —
the video was made and then deleted.

**Cause.** HyperFrames wraps the render in an *artifact transaction*: it writes to a staging file,
calls **ffprobe** to verify the artifact's duration, and only then commits. Windows **Smart App
Control** now blocks `ffprobe.exe`, the probe dies with `spawn UNKNOWN`, the transaction rolls
back, and the rollback deletes the MP4.

Verified machine state:

| Check | Value |
| --- | --- |
| `Get-MpComputerStatus \| SmartAppControlState` | **On** |
| `CodeIntegrityPolicyEnforcementStatus` | **2 (Enforced)** |
| `ffprobe.exe` | ❌ blocked |
| `ffmpeg.exe`, **same folder, same build** | ✅ runs fine |
| `python` on PATH | ❌ **also blocked** (exit 126) — do analysis in node |

**The block is per-file reputation, not a signature or path rule.** Copying, renaming or moving
`ffprobe.exe` does not help — it was tested. Smart App Control **can only ever be turned off, never
back on** (it needs a Windows reinstall to re-enable), and **the user has no admin rights**, so the
policy cannot be changed. Work around it; do not try to fix it.

Git Bash hides the real error as `Permission denied` (exit 126). Use `cmd //c` to see the truth:
`"blocked by your organization's Device Guard policy"`.

### The fix, already built and verified: `E:\Video Create\tools\hf-render.mjs`

```bash
node "E:/Video Create/tools/hf-render.mjs" "E:/Video Create/projects/<project>"
```

Options: `--output=` `--bg=#RRGGBB` `--fps=` `--quality=draft|standard|high` `--crf=`
`--composition=` `--workers=` `--keep-frames`.

**Why it works.** The duration probe only runs when the artifact `kind === "file"` (verified in the
installed 0.8.33 dist). **`--format png-sequence` writes a *directory* artifact, so the probe is
skipped entirely.** The render log proves it:
`assemble ... "skipped for png-sequence"` → `pipeline ... "artifact validated"` → `Render complete`.

So the script: renders a PNG sequence (no ffprobe, no rollback) → flattens it onto the
composition's background colour → encodes with the system FFmpeg 8.1.1 (not blocked) → deletes the
PNGs. **Same shape and same class of reason as `projects/remotion-starter/render.mjs`
(§3). Do not "simplify" either of them back to the plain command.**

### Four traps inside it — every one cost a wasted render

1. **png-sequence renders RGBA and the page background becomes transparent.** A straight yuv420p
   encode comes out pure black. The script regex-reads `body`/`html` `background:` out of the
   composition and composites over it; `--bg=` overrides, and a failed detection warns loudly and
   falls back to black rather than pretending.
2. **Double range conversion — the subtle one.** Copying HyperFrames' own
   `scale=in_range=pc:out_range=tv` naively made the picture *worse*: `#0d0f14` decoded as
   `rgb(25,26,29)` (washed out) instead of `rgb(13,14,19)`, and PSNR fell from 36.07 to 27.44 dB.
   `color=` defaults to **yuv420p**, so `overlay` composited in YUV and the scale then
   range-compressed an already-limited signal a second time. **Force RGB compositing:**
   `color=...,format=rgb24[bg];[0:v]format=rgba[fg];[bg][fg]overlay=shortest=1:format=rgb,scale=in_range=pc:out_range=tv`
3. **Use HyperFrames' own encoder profile, not a guess.** From the dist (`cli.js` ~72461):
   `draft` = ultrafast/CRF 28 · `standard` = medium/CRF 18 · **`high` = slow/CRF 15**. A guessed
   `medium`/CRF 17 produced 278 KB where the real profile produces ~500 KB. Also copy the colour
   tags (`-colorspace/-color_primaries/-color_trc bt709`, `-color_range tv`), `-bf 0`,
   `-x264-params aq-mode=3:aq-strength=0.8:deblock=1,1:colorprim=bt709:transfer=bt709:colormatrix=bt709`
   and `-video_track_timescale 90000`, or the stream reads bare `yuv420p(progressive)`.
4. **Node `spawn(..., {shell:true})` on Windows concatenates args without escaping** (DEP0190).
   The workspace path has a space, so an absolute path splits at it → `Not a directory: E:\Video`.
   Fixed three ways: quote any arg containing whitespace, set `cwd: projectDir`, and pass
   **relative** paths (`renders/.hf-seq-tmp`).

Frame dimensions are read straight out of the **PNG IHDR chunk** (magic `0x89504e47`, width at
byte 16, height at byte 20) — ffprobe is the blocked binary this whole script exists to avoid, and
hardcoding 1920×1080 would break any portrait or square project.

### Verified 2026-09-25 on `projects/font-test` (5 s, 1080p)

| Measure | Result |
| --- | --- |
| Time | **31–38 s** over two runs (capture 15.7 s / 19.7 s, encode ~1.7 s) — *faster* than the 54.2 s normal path (§5), because there is no probe/commit stage |
| Stream | `yuv420p(tv, bt709, progressive)`, 1920×1080, 799 kb/s, 30 fps, 90k tbn ✅ |
| Background | decodes `rgb(13,14,19)` vs the CSS `#0d0f14` = `rgb(13,15,20)` — correct within 4:2:0 rounding |
| PSNR vs the known-good reference | **39.02 dB** whole-frame (**40.32 dB** once the reference's own 3-level offset is neutralised with `lut=y=val+3` — the 2026-09-10 file is itself ~3 levels dark) |
| Frame at t=2.5 s | inspected: all nine families, Bengali conjuncts ক্ষুদ্র উজ্জ্বল দৃষ্টি শ্রদ্ধা স্ত্রী বিদ্যুৎ ঙ্ক and digits ০-৯ all correct |
| Re-run reproducibility | two runs are **not** byte-identical (499,773 vs 500,946 B) — Chrome's text rasterisation is slightly nondeterministic — but **PSNR 59.4 dB between them** (min 58.4), i.e. visually the same video. Do not expect matching checksums. |

### Why the file is ~half the size — measured, and it is an improvement

`tool-test.mp4` is 501 KB against the reference's 946 KB. **It is not lower quality.** Background
regions in both are perfectly flat (per-channel min/max spans exactly the declared colour, zero
noise), so the difference is entirely in the text. Measured `|R−B|` divergence over a 600×60 text
band:

| Render | mean \|R−B\| | pixels fringed >12 |
| --- | --- | --- |
| reference (opaque page) | 14.10 | **15.4 %** |
| hf-render.mjs (transparent page) | 10.37 | **6.1 %** |

Chrome uses **subpixel (LCD/ClearType) antialiasing** when the page background is opaque, and falls
back to **grayscale antialiasing** when it is transparent. Subpixel AA bakes colour fringes into
the glyph edges — that chroma detail is what inflates the reference's bitrate. **Grayscale AA is
the correct choice for video:** those fringes are tuned for one specific RGB-stripe panel, are
wrong on any other display, and get mangled by 4:2:0 chroma subsampling anyway. This also explains
why PSNR sits at 39 dB rather than higher, and why the text-band-only crop measured 36.92 dB.

### ⚠️ The open gap: this path has NO AUDIO

png-sequence carries no audio track (`hasAudio:false` in the render trace). A composition with
`<audio>` cues renders **silent** through `hf-render.mjs`. This matters: `hishab-khata-promo`
(§4g) has **28 SFX cues**. Closing it means parsing the `<audio>` tags' `data-start` /
`data-duration` / `data-volume` / `data-track-index` into an ffmpeg `adelay`/`volume`/`amix`
graph and muxing it in — a `tools/hf-audio.mjs`. **That file is referenced in hf-render.mjs's
header but does not exist yet.**

---

## 3. ⚠️ SUPERSEDED 2026-10-04 (SAC off — see §0b): the Remotion bundled-FFmpeg bug was Smart App Control

> The bundled ffmpeg/ffprobe/remotion.exe all start now, so `0xC0000142` was SAC. `render.mjs` below
> also silently drops root-layer opacity fades (RGBA PNG → yuv420p). Prefer
> `npx remotion render MyComp out/video.mp4 --color-space=bt709 --concurrency=1` (verified, 51 s).

**Do not "fix" `render.mjs` by switching it back to plain `remotion render`. It will fail.**

### The bug

Remotion ships its own binaries in
`node_modules/@remotion/compositor-win32-x64-msvc/`.
On this machine **all three fail to start**:

- `ffmpeg.exe` → exit `-1058471934`
- `ffprobe.exe` → exit `-1058471934`
- `remotion.exe` → exit `-1058471934`

`-1058471934` = `0xC0000142` = `STATUS_DLL_INIT_FAILED`.

Symptom the user sees: all frames render fine (`Rendered 150/150`), then
`Error: FFmpeg quit with code 3236495362`.

### What was ruled out (already tested — don't repeat)

| Hypothesis | Result |
| --- | --- |
| Corrupt/partial download | ❌ clean `npm install` reproduced it |
| `E:` drive is special | ❌ `E:` is local NTFS; copying binaries to `C:` still failed |
| Bundled `msvcr100.dll` conflict | ❌ removing it didn't change anything |
| Windows Exploit Protection / ASLR | ❌ `Get-ProcessMitigation -System` — all `NOTSET` |
| Defender quarantine | ❌ RTP is on but `Get-MpThreat` is empty |
| Zombie process holding files | ❌ no node/esbuild processes running |

Root cause still unknown. Likely a MinGW-runtime DLL init failure specific to this box.
**Not worth more time** — the workaround is strictly better anyway.

### The workaround (in place and working)

`projects/remotion-starter/render.mjs` does two steps:

1. `npx remotion render <comp> out/frames --sequence --image-format=png --concurrency=2`
   → Remotion writes PNG frames. This path **does not touch the broken binaries**.
2. System FFmpeg 8.1.1 encodes them:
   `-c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -movflags +faststart`

It auto-detects the frame filename pattern and cleans `out/frames` first so a previous
longer render can't leak extra frames. Exposed as `npm run render`.

**HyperFrames is unaffected** — it uses the system FFmpeg by design.

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

## 4b. Font pack — installed and render-verified (2026-09-10)

Master pack: `E:/Video Create/assets/fonts/` — **4.1 MB**, 13 TTF files, 9 families.
Every family is **SIL Open Font License 1.1** → free for commercial use, embedding and
bundling in a sold product. Licence texts are kept in `assets/fonts/LICENSES/`.
Source: `github.com/google/fonts` (`ofl/`), downloaded as unmodified TTF.

| Family | Script | File(s) | Use for |
| --- | --- | --- | --- |
| Hind Siliguri | বাংলা | 300/400/500/600/700 static | default Bengali body + UI |
| Noto Sans Bengali | বাংলা | variable 100–900 | widest Bengali glyph coverage, fallback |
| Baloo Da 2 | বাংলা | variable 400–800 | heavy Bengali display / titles |
| Tiro Bangla | বাংলা | 400 | Bengali serif, long reading text |
| Inter | Latin | variable 100–900 | default Latin body + UI |
| Anton | Latin | 400 | heavy headline |
| Bebas Neue | Latin | 400 | condensed title card |
| Playfair Display | Latin | variable 400–900 | elegant serif heading |
| JetBrains Mono | Latin | variable 100–800 | code, numbers, timecode |

`assets/fonts/fonts.css` declares every `@font-face` plus ready-made stacks as CSS variables
(`--font-bn-body`, `--font-bn-title`, `--font-bn-serif`, `--font-en-body`, `--font-en-title`,
`--font-en-cond`, `--font-en-serif`, `--font-mono`, `--font-mixed-body`, `--font-mixed-title`).
Bengali-first ordering in the mixed stacks so Bengali+English in one line both shape correctly.

### ⚠️ Fonts must be COPIED INTO each project — `../../` does not work

HyperFrames `lint` rejects asset paths that traverse above the project root
(`invalid_parent_traversal_in_asset_path`): compositions are served with the **project root**
as base URL. So for every new project:

```bash
cp -r "E:/Video Create/assets/fonts" "E:/Video Create/projects/<project>/assets/fonts"
```

then in `index.html` `<head>`:

```html
<link rel="stylesheet" href="assets/fonts/fonts.css" />
```

Costs 4.1 MB per project. Trim unused families from the copy if size matters.

### Known-harmless message

`npm run check` may print `[StaticGuard] Invalid HyperFrame contract: Font families used
without @font-face declaration: ...` **while `Lint` still reports 0 errors**. StaticGuard runs
a static pass that does not follow the linked stylesheet. Verified false positive — the
2026-09-10 render used all nine families correctly. Judge by the `Lint` line, not StaticGuard.

### Verification artifact

`projects/font-test/` — a 5 s 1080p sample sheet showing all nine families, including hard
Bengali conjuncts (ক্ষ স্ব দৃ শ্র উজ্জ্বল ঙ্ক স্ত্রী ঞ) and Bengali digits ০-৯.
`npm run check` passes clean (0 lint, 0 runtime, 0 layout, 0 motion, 97/97 contrast WCAG AA).
Rendered `renders/font-test.mp4` in **41.9 s** (924 KB, h264, yuv420p, 1920×1080, 30 fps).
Frame inspected visually — all shaping correct, no tofu boxes.

---

## 4c. Animation runtimes — vendored locally and render-verified (2026-09-10)

Master pack: `E:/Video Create/assets/js/` — **640 KB**, all files vendored so **renders need no
internet**. Licence texts in `assets/js/LICENSES/`.

| Library | Version | Where | Licence |
| --- | --- | --- | --- |
| GSAP core + 12 plugins | 3.15.0 | `assets/js/gsap/` (186 KB) | GSAP Standard "no charge" — see the warning below |
| Anime.js (UMD) | 4.5.0 | `assets/js/anime.umd.min.js` (118 KB) | MIT |
| lottie-web | 5.13.0 | `assets/js/lottie.min.js` (306 KB) | MIT |

GSAP plugins vendored (all free since GSAP 3.13): `SplitText`, `CustomEase`, `CustomWiggle`,
`CustomBounce`, `TextPlugin`, `ScrambleTextPlugin`, `DrawSVGPlugin`, `MorphSVGPlugin`,
`MotionPathPlugin`, `Flip`, `EasePack`, `Physics2DPlugin`.
Deliberately **not** vendored: `ScrollTrigger`, `ScrollSmoother`, `ScrollToPlugin`, `Observer`,
`Draggable`, `InertiaPlugin`, `GSDevTools`, `MotionPathHelper`, `PixiPlugin`, `EaselPlugin`,
`CSSRulePlugin` — all scroll/pointer driven, useless in a headless seek render.

### ⚠️ GSAP licence — the one commercial catch

Read `assets/js/LICENSES/gsap-standard-license.txt` (saved from gsap.com/standard-license on
2026-09-10; the npm package ships no LICENSE file). Summary of what actually matters here:

- Rendering **video** with GSAP and selling the MP4 → fine. GSAP is not inside the deliverable.
- A **client paying a one-time fee** for a site/product → fine, explicitly covered.
- Shipping GSAP inside a product where **end users are charged** a usage/access/licence fee →
  needs a paid "Business" Club GSAP membership.
- **Prohibited use:** a no-code *visual animation builder* that competes with Webflow's visual
  animation capabilities. If the user ever builds a drag-and-drop animation/video editor to sell,
  GSAP is the wrong dependency — **use Anime.js (MIT), which has none of these restrictions.**

Anime.js and lottie-web are MIT: no restriction of any kind.

### Which runtimes HyperFrames can seek

Verified present in the installed hyperframes 0.8.33 runtime
(`dist/hyperframe-runtime.js` — grepped for each global):

| Runtime | Registration | Status |
| --- | --- | --- |
| GSAP | `window.__timelines["<comp-id>"]` | ✅ default, verified |
| Anime.js v4 | `window.__hfAnime.push(instance)` | ✅ verified — read the gotchas below |
| CSS keyframes | automatic (computed `animation-name`) | ✅ verified |
| Lottie | `window.__hfLottie.push(anim)` | adapter present, **not yet tested** (no .json asset) |
| Three.js | `hf-seek` event + `window.__hfThreeTime` | adapter present, not installed (weak iGPU) |
| TypeGPU / WebGPU | `window.__hfTypegpuTime` | adapter present, not installed (weak iGPU) |
| WAAPI | `element.animate()` + `currentTime` | adapter present, not tested |

**Motion / framer-motion has NO HyperFrames adapter.** Do not install it and do not suggest it;
it cannot be seeked and will render as a frozen frame.

### ⚠️ Anime.js v4 gotchas — both found the hard way, both cost a wasted render

1. **`delay` is invisible to `seek()`.** `anime.animate(".x", { duration: 700, delay: 4800 })`
   reports `.duration === 700` and `seek(4800)` clamps to the tween's end. Measured: seek(0)→0.0,
   seek(175)→0.25, seek(350)→0.5, seek(700)→1.0, seek(4800)→1.0. The delay is simply dropped.
   `anime.stagger(90, { start: 4800 })` behaves the same way — `start` does not offset the delay.
   **Fix: use `anime.createTimeline({ autoplay: false })` and pass an absolute position to
   `.add(targets, params, position)`.** Measured with `.add(..., 4800)`: `.duration === 5680`,
   seek(4700)→not started, seek(4800)→0.0, seek(5150)→0.5, seek(5500)→1.0. Stagger delays inside
   `.add()` *are* counted in the timeline duration.
2. **Anime.js does not pre-apply a segment's start state.** Before a timeline segment begins,
   its targets have no transform at all — an element that should be hidden renders fully visible.
   **Fix: put the hidden start state in CSS** (`transform: scaleY(0); opacity: 0`) and animate to
   the visible state. Unlike GSAP `.from()`, the runtime will not hide it for you.

### ✅ GSAP SplitText handles Bengali correctly

`SplitText.create(el, { type: "chars" })` on Bengali text **preserves conjuncts** — verified
visually on `যুক্তাক্ষর: ক্ষুদ্র উজ্জ্বল` rendered per-character. No broken clusters, no
orphaned vowel signs. So per-character kinetic typography works for Bengali, not just words.
(`type: "words"` is still the safer choice for long Bengali lines — fewer elements, same look.)

### Same per-project copy rule as the fonts

```bash
cp -r "E:/Video Create/assets/js" "E:/Video Create/projects/<project>/assets/js"
```

then load from the project root, never `../../`:

```html
<script src="assets/js/gsap/gsap.min.js"></script>
<script src="assets/js/gsap/SplitText.min.js"></script>
<script src="assets/js/anime.umd.min.js"></script>
```

`hyperframes init` templates ship a jsdelivr CDN `<script>` for GSAP. **Replace it with the local
path** — otherwise every render depends on the network.

### Verification artifact

`projects/anim-test/` — 8 s 1080p, four panels, zero external URLs. `npm run check` passes clean
(0 lint / 0 runtime / 0 layout / 0 motion, 117/117 contrast WCAG AA). Rendered
`renders/anim-test.mp4` in **19.7 s** (504 KB).

Motion proven by measuring frame brightness in each panel's region with
`ffmpeg -vf crop=...,signalstats` rather than by eyeballing:

- GSAP SplitText panel: 32.0 (t=1.1s) → 41.6 (t=1.5s) → 46.7 (t=2.2s)
- Anime.js bars: 32.0 (t=4.7s) → 36.4 (t=4.95s) → 57.4 (t=5.2s) → 75.6 (t=5.5s) → 73.5 (settled)
- CSS shimmer: left window 42→150 (t=0.6s) while right stays 42; then right 42→68 (t=1.0s) —
  i.e. the sweep really moves under seek

`data-layout-allow-overflow` on the shimmer element silences 10 expected `container_overflow`
info findings (the sweep intentionally travels outside its clipping track).

---

## 4d. Audio — SFX installed, BGM pipeline verified, music source chosen (2026-09-10)

### SFX: done

`E:/Video Create/assets/sfx/` — **1.3 MB**, 19 MP3s + `manifest.json` + `CREDITS.md`.
Source: the `media-use` skill's bundled library (`<skill>/audio/assets/sfx/`), originally Pixabay.

**Licence: Pixabay Content License.** Commercial and non-commercial use, modification, and
**redistribution as part of a derivative work (a rendered video) — with no attribution required.**
Clean for a sold product. Text: `assets/sfx/CREDITS.md`.

Files (duration from `manifest.json`, all confirmed decodable with ffprobe):
`chime` 2.5s · `click` / `click-soft` 0.37s · `error` 1.62s · `glitch-1/2/3` 2.6-3.5s ·
`impact-bass-1` 2.12s · `impact-bass-2` 2.59s · `key-press` 0.4s · `notification` 2.46s ·
`ping` 1.32s · `pop` 0.72s · `riser` 10.03s · `sparkle` 1.8s · `typing` 1.5s ·
`whoosh` / `whoosh-short` 0.57s · `whoosh-cinematic` 5.54s.
`manifest.json` carries a one-line "what to use it for and where to sync it" per file — read it
before picking. Mixed sample rates (24/44.1/48 kHz) and mono/stereo; the mixer handles it.

### The audio contract — what actually matters

```html
<audio id="sfx-pop" src="assets/sfx/pop.mp3"
       data-start="1.2" data-duration="0.72"
       data-track-index="10" data-volume="0.9"></audio>
```

- **`id` is mandatory.** `lint` errors `media_missing_id`, and an id-less `<audio>` is silently
  skipped by the mixer — the render comes out with no sound and no error.
- Audio lives at the **host root** (`index.html`), a sibling of the scene clips, so it survives
  scene cuts. Put it on a **high `data-track-index`** (10, 11, …) to keep it clear of the
  linter's visual overlap rules. Several audio tracks mix together fine.
- `data-duration` trims the clip; `data-volume` scales it.

### Verified: audio really does reach the MP4 on this machine

`projects/audio-test/` — 8 s 1080p with six SFX cued to six animation beats.
`npm run check` passes (0 errors; 1 info from a deliberate scale tween). Rendered in **37.7 s**
(544 KB). The output MP4 carries a real **AAC 48 kHz stereo** stream, 8.0 s, **true peak
-1.4 dBFS** (no clipping), **integrated loudness -9.0 LUFS**.

Placement was verified by **envelope cross-correlation of each source MP3 against the rendered
audio**, not by ear:

| Effect | Cued at | Found at | Correlation |
| --- | --- | --- | --- |
| whoosh | 0.0 s | 0.00 s | 1.00 |
| pop | 1.2 s | 1.20 s | 1.00 |
| ping | 2.0 s | 2.00 s | 1.00 |
| typing | 3.0 s | 3.00 s | 1.00 |
| impact-bass-1 | 5.0 s | 5.00 s | 1.00 |
| chime | 6.5 s | 6.50 s | 1.00 (after a 1.8 kHz high-pass) |

The chime needed the high-pass because `impact-bass-1` sustains for its full 2.12 s and masks it
in a broadband envelope. **Two lessons for real edits:** `impact-bass-1` is a long sustained
tone, not a short hit — trim it with `data-duration` if a later cue must be heard; and
`chime.mp3` has ~0.4 s of quiet lead-in, so cue it ~0.4 s *before* the visual beat.

-9.0 LUFS is far above the -14 LUFS web target — expected for an all-SFX test with no dialogue
bed. Loudness normalisation (`loudnorm`) is still an open Tier 2 item.

### BGM pipeline: verified (with a synthesized bed, not a library track)

A 30 s music bed was synthesized with FFmpeg (`sine` x4 -> `amix` -> `tremolo` -> `aecho` ->
`lowpass` -> `afade` -> `loudnorm`) purely to test the path, and placed in `projects/audio-test`
as `assets/music/testbed.mp3` on track 9 at `data-volume="0.30"`, under the SFX on tracks 10-11.
It is a test tone, not a library asset - do not ship it.

Measured on the re-render (32.0 s, 578 KB):

| Window | SFX-only render | With the bed | Bed contributes |
| --- | --- | --- | --- |
| 0.6-1.1 s (silent gap) | -99.0 dBFS | -41.2 dBFS | +57.8 dB |
| 4.4-4.9 s (silent gap) | -69.1 dBFS | -36.3 dBFS | +32.8 dB |
| 7.3-7.9 s (impact tail) | -34.1 dBFS | -32.7 dBFS | +1.4 dB |

Confirmed by this: **a track longer than the composition is trimmed by `data-duration`**
(30 s file, 8 s comp, output still exactly 8.0 s); a bed mixes under SFX without shifting them
(all five re-correlated at their exact cue times, corr 0.90-1.00); and adding a track did not
clip (true peak -1.2 dBFS). Integrated loudness stayed -9.0 LUFS.

Volume guidance that follows from `media-use`'s own defaults: **0.10-0.15 under narration,
0.30-0.60 for a silent film.** Keep BGM on a *lower* track index than the SFX.

### Music sources: Pixabay chosen (user's decision, 2026-09-10) — manual download only

| Route | Cost / setup | Commercial licence | Verdict |
| --- | --- | --- | --- |
| **Pixabay music** | free account, **manual download from the website** | **Pixabay Content License** — verified on the live licence page 2026-09-10: it covers "images, video, **audio** and other media"; free, **no attribution**, modification allowed; the only relevant prohibition is selling Content **standalone** ("no creative effort applied ... substantially the same form"). Music inside a rendered video is creative effort applied, so selling that video is permitted. | ✅ **chosen** |
| HeyGen catalog (10k+ tracks, the `media-use` default) | install `heygen` CLI + OAuth sign-in | **RESOLVED NEGATIVELY 2026-10-04:** HeyGen ToS (Last Updated July 23, 2026) says Free Plan output may not be sold or used commercially; paid plans (from $29/mo) still state no catalogue licence. Original note: **UNRESOLVED.** heygen.com/terms grants commercial rights over *User Output* but says nothing about their stock music library. Zero occurrences of "music" or "stock" on that page (checked 2026-09-10). | ⚠️ do not use commercially until HeyGen confirms in writing |
| Google Lyria (AI generation) | `$GEMINI_API_KEY` | Google's generative-content terms | may cost money — needs explicit OK |
| MusicGen locally | multi-GB torch install | ❌ **`facebook/musicgen-small` weights are `cc-by-nc-4.0` — NON-COMMERCIAL** (confirmed via the HuggingFace model API, 2026-09-10) | ❌ **rules it out for this user.** Also multi-GB with ~3 GB free RAM and no GPU. |

### ⚠️ The Pixabay API cannot fetch music — do not send the user for an API key

`pixabay.com/api/docs/` exposes exactly two endpoints: `https://pixabay.com/api/` (images) and
`https://pixabay.com/api/videos/`. The docs' own contents list only "Search images" and "Search
videos"; the word "audio" does not appear on the page at all, and "music" appears only in the
site nav (checked 2026-09-10). **An API key buys nothing for music.** The user downloads tracks
by hand from `pixabay.com/music/` (a free login is required for the download button) into
`assets/music/`. Instructions for him are in `assets/music/README.md`.

Also checked: **Openverse's anonymous API** does return CC0 audio (240 results for "ambient"),
but the CC0 pool is almost entirely **Freesound field recordings and atmospheres** — room tone,
wind, city, rain — not composed music. Useful as ambience beds, not as a BGM library.
`category=music` returns 0 CC0 results.

**Do not install MusicGen for this user.** Do not point him at the HeyGen catalog for anything
he sells until its music licence is confirmed.

---

## 4e. Colour grading (LUTs) — installed and measured (2026-09-11)

`E:/Video Create/assets/luts/` — **3 `.cube` files**, 33×33×33, 948 KB each, plus a Bengali
`README.md` for the user.

| File | Look |
| --- | --- |
| `teal-orange-blockbuster.cube` | teal shadows, warm highlights — the cinematic split-tone |
| `bleach-bypass.cube` | high contrast, heavily desaturated, hard blacks |
| `film-fade.cube` | lifted blacks, warm highlights, soft faded wash |

### Licence: clean, because nothing was downloaded

The `media-use` skill's `luts/index.json` ships **3 looks** (that is the whole library — there
is no larger set). Each entry has a CDN `url` **and** a deterministic `params` block. These
three were built from the `params` with `--local-only`, so **no third-party `.cube` file was
fetched** — the output is a numeric computation done on this machine:

```bash
node <MEDIA_DIR>/scripts/resolve.mjs --type lut --intent "<id>" \
  --project <dir> --local-only --params '<the params object from index.json>'
```

They land in `<project>/.media/luts/lut_00N.cube` and were copied out under readable names.
No account, no network, no licence question. Safe to sell work made with them.

### Verified — measured, not eyeballed

Applied to a real 1920×1080 frame and measured with `signalstats`:

| Variant | YAVG | UAVG | VAVG | Reads as |
| --- | --- | --- | --- | --- |
| original | 221.5 | 124.4 | 129.8 | — |
| teal-orange-blockbuster | 231.1 | 123.7 | 129.2 | brighter, slightly cool |
| bleach-bypass | 231.2 | 127.8 | 128.3 | U and V both pulled toward 128 = desaturated ✅ |
| film-fade | 194.8 | 121.7 | 133.2 | darker, V up = warmer ✅ |

All three behave as their names promise.

### ⚠️ Windows gotcha — `lut3d` and absolute paths

FFmpeg's filter syntax uses `:` as a separator, so a Windows path (`E:\...`) inside `lut3d=file=`
breaks. **`cd` into `assets/luts` and use the bare filename:**

```bash
cd "E:/Video Create/assets/luts"
ffmpeg -i in.mp4 -vf "lut3d=file='film-fade.cube'" -c:a copy out.mp4
```

Partial strength (usually better than 100 %):

```bash
ffmpeg -i in.mp4 -filter_complex "[0:v]lut3d=file='film-fade.cube'[g];[0:v][g]blend=all_mode=normal:all_opacity=0.6" -c:a copy out.mp4
```

**Not yet useful in practice** — every project so far is typography and colour fields, with no
photographic footage. LUTs start to matter the moment real images or clips enter `assets/footage`
or `assets/images`.

---

## 4f. Audio processing chain — measured on this machine (2026-09-11)

All three Tier-2 audio filters were run against real material and measured. Summary first:
**loudnorm works, ducking works once you know the units, and `afftdn` is far weaker than
`arnndn` — but `arnndn`'s model has no declared licence.**

### `loudnorm` — two-pass to the web target

Pass 1 measures, pass 2 applies the measured numbers. On `projects/audio-test/renders/audio-test.mp4`:

```bash
# pass 1
ffmpeg -i in.mp4 -af "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json" -f null -
# pass 2 — paste the measured_* values from pass 1
ffmpeg -i in.mp4 -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=-8.14:measured_TP=-1.25:measured_LRA=19.20:measured_thresh=-21.61:offset=1.76" -c:v copy -c:a aac -b:a 192k out.mp4
```

Result: **−9.0 → −12.0 LUFS**, true peak **−4.9 dBFS**, video stream copied untouched.

> ⚠️ **Corrected 2026-10-04:** −14 IS reachable — set `LRA` at or above the measured LRA (LRA=21 → −14.9 LUFS, TP −7.1). The paragraph below describes the LRA=11 run only.

**It did not reach −14, and that is correct behaviour.** The source LRA is 19–22 LU, far above
the `LRA=11` target, so loudnorm cannot pull the integrated level down without destroying the
dynamics. `linear=true` and the default dynamic mode both landed on −12.0. A real video with
narration plus a music bed has a much narrower LRA and will land close to −14.

### `sidechaincompress` (ducking music under a voice)

⚠️ **`threshold` is a LINEAR amplitude, not dB.** This is what makes the filter look broken.
A −31.7 dBFS trigger is ≈ 0.026 linear, so the commonly-copied `threshold=0.06` never opens
the compressor at all. Measured on a steady bed with a 1 s speech-band trigger at 3–4 s:

| threshold | bed while quiet | bed under voice | duck depth |
| --- | --- | --- | --- |
| 0.06 | −26.7 dB | −27.1 dB | **−0.3 dB (does nothing)** |
| 0.03 | −26.7 dB | −30.4 dB | −3.7 dB (subtle) |
| 0.01 | −26.7 dB | −39.5 dB | **−12.8 dB (natural voiceover duck)** |
| 0.003 | −26.7 dB | −49.4 dB | −22.7 dB (very aggressive) |

```bash
ffmpeg -i bed.wav -i voice.wav -filter_complex \
  "[0:a][1:a]sidechaincompress=threshold=0.01:ratio=20:attack=15:release=300[out]" -map "[out]" out.wav
```

Start at `threshold=0.01, ratio=20, attack=15, release=300` and raise the threshold if the duck
is too deep. Match the threshold to the voice's actual level — measure it with `volumedetect`
first. **`volumedetect` prints at INFO level, so `-v error` hides its output** — use `-v info`.

### Denoise — `afftdn` is weak here, `arnndn` is strong but unlicensed

| Filter | Pure white-noise bed | Notes |
| --- | --- | --- |
| `afftdn=nr=12…80` | −29.2 → **−30.5 dB** | only ~1.3 dB, and `nr` made no difference at all |
| `anlmdn` (defaults) | −27.6 → −27.7 dB | no measurable effect |
| `arnndn` (RNNoise) | −29.2 → **−56.2 dB** | **27 dB of reduction** |

Two honest caveats:

1. **White noise is the worst case for `afftdn`.** Spectral subtraction needs structure to keep;
   real-world hum, hiss and air-conditioner rumble reduce far better than this test suggests.
   Do not conclude `afftdn` is useless from that one number.
2. **`arnndn` is speech-trained.** On a 440 Hz sine + noise it removed 20 dB — it gutted the tone
   along with the noise, because a sine is not speech. Use it on **voiceover only**; it will
   destroy music and effects.

⚠️ **`arnndn` model licence is UNRESOLVED — do not use it commercially yet.** A model file
`som.rnnn` (297 KB) existed at `C:/Users/zubay/AppData/Local/Temp/ffxtest/som.rnnn` (**gone as of 2026-10-04**; licence-clean alternative: DeepFilterNet, plan step 12) — a **temp
folder Windows can clear at any time**, so treat it as not installed. It matches
`somnolent-hogwash-2018-09-01` from `github.com/GregorR/rnnoise-models`, and the GitHub API
reports that repo's licence as **`None`** (checked 2026-09-11). Same category as the HeyGen
music catalog: capable, but not clearable for a product the user sells. Resolve the licence
before copying it into `assets/`.

**None of this is needed yet** — there is no recorded audio in the workspace. It is set up and
measured so the numbers are known when real narration or footage arrives.

---

## 4g. First real video — `projects/hishab-khata-promo` (built 2026-09-11, RENDERED 2026-10-06)

> ✅ **Rendered 2026-10-06 at the user's request** ("হিসাব খাতার প্রোমোটা রেন্ডার করে দেখাও"):
> `node tools/finish.mjs projects/hishab-khata-promo --quality=high` → `renders/hishab-khata-promo/2026-10-06_0301/`
> (master + 9:16/1:1/4:5 + thumbnail + GIF). 253 s total, render 2 m 20.7 s (screenshot capture, forced by a
> `filter:blur`), 7.4 MB. Audio −12 → −14 LUFS, TP −4.6. QC all PASS. No Google Fonts fetched (hf-postassemble:
> "nothing to fix", 28 cues guarded; `.hf-audio-cues.json` committed). 20 frames inspected: Bengali correct, all
> scenes animate, the blanks at ~8.4–10.3 s and in frame 7 are the storyboard's deliberate breathers.
> **Cosmetic flaws seen in frame 06-numbers (not fixed, offered to the user):** the stat board sits ~20 px left of
> the beige card and the third column's rule runs past the right frame rule; rule 001 sits ~9 px above 002/003;
> the eyebrows ("সংখ্যায়", "প্রমাণ") have letter-spacing that pulls the Bengali clusters apart.
> ⚠ This shell had inherited the OLD env (HYPERFRAMES_BROWSER_PATH set, the newer vars missing) because the app
> started before the 2026-10-05 changes; the render was run with BROWSER_PATH unset and the user vars exported.
>
> *Original 2026-09-11 note:* the user explicitly declined the render ("render korte hobe na") — everything up to
> the render gate was done and passing.

The first end-to-end run of the `/product-launch-video` workflow.

> ✅ **Updated 2026-10-04 (supersedes the note below):** SAC is off, so the plain command renders it
> **with all 28 SFX**: `cd "E:/Video Create/projects/hishab-khata-promo" && hyperframes render --quality high --workers 1 --output renders/video.mp4`
> (~8 min estimated). A scratch copy passed lint (0 errors) and check (52/52 contrast) on 2026-10-04, and
> a 4 s cut rendered with SFX onsets exact to cue + lead-in. Still needs the user's OK to render.
> BRIEF.md/STORYBOARD.md still say "no TTS, render via hf-render" — out of date. One layout warning:
> `content_overlap` at t=31.13–31.25 s in 06-numbers.
>
> ⚠️ **Updated 2026-09-25:** rendering it now means `node "E:/Video Create/tools/hf-render.mjs"
> "E:/Video Create/projects/hishab-khata-promo"` — plain `hyperframes render` deletes its own
> output on this machine (§2c). **That path produces no audio, and this promo has 28 SFX cues**,
> so a faithful render needs `tools/hf-audio.mjs` written first. Budget ~6–8 min for the video.

**Subject** is a *sample* product invented for the run: **হিসাব খাতা**, school fee and accounts
software for Bangladeshi schools. Chosen because the user is himself a school accountant, so he
can judge whether it rings true — and it is realistic enough to become a product he ships.

| Field | Value |
| --- | --- |
| Workflow / flow / storyboard | `product-launch-video` / `automation` / `yes` (collaborative gates) |
| Length · format · language | 45 s · 1920×1080 · Bengali |
| Arc | BAB: Before → After tease → Bridge → Step 1 → Step 2 → Wow → CTA |
| Frames | 7, all `animated` |
| Preset | `cobalt-grid`, brand-remixed then hand-corrected (see below) |
| Narration / BGM | none — no TTS engine, no licensed music. On-screen Bengali text carries the message |
| SFX | 28 cues hand-placed at the host root from `assets/sfx/` |
| Gate status | `lint` 0 errors · `check` 0 errors everywhere · contrast **52/52 WCAG AA** · 19 snapshots inspected |

`BRIEF.md`, `STORYBOARD.md` (with the `## Video direction` block and a time-coded shot sequence
per frame) and `frame.md` are all on disk and are the resume surface.

### What `build-frame.mjs` got wrong — always inspect its output

The preset remixer maps brand colours onto preset roles **positionally**, and it got two roles
badly wrong from a 5-colour `tokens.json`:

- `paper-2` (a secondary *surface*) was assigned the **alert red** — a red page.
- `ink-soft` (secondary *text*) was assigned the **amber** — unreadable.
- Both display **and** body fonts were set to `fonts[0]`, so body text got the heavy display face.
- The preset kept `DM Mono`, a font not in the local pack — a network dependency at render time.

All four were hand-corrected in `frame.md`. **Read the frontmatter after running the script;
do not assume the mapping is sane.**

### Lint findings worth remembering

- **`@import url("fonts.css")` inside a sub-composition fails lint** (`font_family_without_font_face`,
  one error per frame). The linter does not follow `@import`. **Inline the `@font-face` rules in
  each frame's `<style>`** — also safer under render-time CSS scoping. The host `<link>` alone
  does not satisfy the per-file check.
- **`assemble-index.mjs` writes a jsdelivr CDN `<script>` for GSAP.** Replace it with
  `assets/js/gsap/gsap.min.js` every time, or the render needs the network (§4c).
- **Animating `letterSpacing` is a lint error** (`gsap_non_transform_motion`) — layout properties
  snap to integer device pixels and stutter under seek-by-frame capture. Use `scaleX` + `x`.
- **Amber `#E4A11B` as TEXT on cream fails contrast** — measured **1.76:1** against a 3:1 gate.
  `frame.md` now carries a second token, `highlight-ink: #AC7914` (~3.6:1), for amber *text*;
  `#E4A11B` stays for rules, carets and dividers, which are graphics.
- **`asset_candidates:` must be empty for typography-only frames.** Writing a prose explanation
  there makes `stage-assets.mjs` parse the words as filenames and warn about missing assets.
- Remaining warnings are cosmetic: `studio_missing_editable_id` (Studio editing convenience) and
  two same-position `fromTo` pairs. Scene-boundary `content_overlap` infos are the two frames
  crossfading — expected.

### Sub-agent dispatch — the packet size cap is real

`frame-packets.mjs` refuses a packet over **48 000 bytes**, and the packet inlines the blueprint
plus every rule recipe cited in that frame's shot sequence. Sizes that matter:

| Blueprint | Size | | Rule | Size |
| --- | --- | --- | --- | --- |
| `kinetic-type-beats` | 28.5 KB | | `dynamic-content-sequencing` | 8.4 KB |
| `logo-assemble-lockup` | 26.0 KB | | `spring-pop-entrance` | 6.4 KB |
| `grid-card-assemble` | 15.2 KB | | `kinetic-beat-slam` | 6.3 KB |
| `dataviz-countup` | 14.3 KB | | `sine-wave-loop` | 6.0 KB |
| `panel-edit-live-sync` | 13.1 KB | | `css-marker-patterns` | 5.6 KB |
| `titlecard-reveal` | **7.3 KB** | | `svg-path-draw` | 5.5 KB |

Budget **blueprint + cited rules ≤ ~44 KB** (the storyboard block eats the rest). With a 28 KB
blueprint you get **two** rules, not five. Swapping frames 2 and 7 from `kinetic-type-beats` to
`titlecard-reveal` fixed the overflow *and* was the better shape match — check the small
blueprints before trimming the motion.

### ⚠️ Seven parallel sub-agents hit the session rate limit

All 7 frame workers were dispatched at once and **all 7 died** with
`rate_limit / HTTP 429 — "You've hit your session limit"`. Six had already written their file;
one (`04-fee-entry`) had not, and was written inline by the orchestrator instead. Verify the
artifacts on disk rather than trusting the completion status — the dispatch contract says
exactly this. **On this account, dispatch frame workers in waves of 2–3, not 7 at once.**

---

## 4h. Second real video — `projects/khata-cartoon` (5-minute vertical Bengali cartoon, 2026-10-06)

The user asked for a cartoon whose story reads from the pictures alone and whose voices are understandable,
with sound effects and visible movement (mouths, hands and legs). Story: "খাতা নিজেই কথা বলে". The old red ledger narrates,
the হিসাব খাতা app arrives, and Karim Sir goes home early to his daughter. 1080×1920, 300 s, 9 scenes, 38 voice lines
(Piper, `tools/bn-tts.mjs` speakers 5/1/9/15/12), no music (none licensed yet), about 260 SFX cues and ambience beds.

**How it is built (all hand-written, no skill workflow):**
- `story/lines.json` holds the script lines and voices. `build/voice.mjs` makes each WAV (cached by `.sig`), and writes `story/voice.json`
  (durations) and `assets/voice/lipsync.js` (per-frame mouth openness, 30 fps, digits 0–9).
- `story/plan.json` is **the single timing source**: per scene `dur`, line start times, named `beats`, `sfx`
  (`[beat±offset, file, volume]`, auto-shifted by `lead_s`), `every` (footsteps), `amb` (beds), and `capBottom`
  (moves one caption up).
- `build/assemble.mjs` generates `index.html` (scenes back to back, voice/SFX/ambience `<audio>` packed onto lanes,
  speaker-chip captions, a dot wipe at each cut) and `assets/story/plan.js` (`HKPlan.scene(id).line()/.beat()`).
  `--only=sN` writes `previews/preview-sN.html` (previews MUST live in `previews/`: a second root composition in the
  project root fails check with `multiple_root_compositions`). Never hand-edit index.html, and do not run
  hf-postassemble on this project.
- `assets/cast/cast.js` is the SVG rig: 7 characters with pivots in `data-o`, expressions, and a mouth that is lip-synced through
  `.c-mouth-open` scaleY. `act.js` (HKAct) holds acting helpers: stand-by-the-feet, say (lip-sync + nods + talking arm),
  walk, hop, wave, point, count. `sets.js` holds sets and props.
- `build/sfx-synth.mjs` synthesises the cartoon sounds (boing, tick/tock, slide, snore…) with FFmpeg `aevalsrc`.

**GSAP traps found here (each cost a re-snapshot):**
- `fromTo` renders its FROM state at build time. Chained moves on one element (walk after walk, shake) need
  `immediateRender: false`, or the element jumps to the last chain's start position from t=0.
- Never pass `svgOrigin`/`transformOrigin` inside tween vars for SVG parts of a scene that is hidden at build time. The bbox is
  measured wrong (a cloud flew 2,400 px off-screen). Set pivots once with `gsap.set(el, {svgOrigin})` at build time.
- People behind a counter: draw `HKSet.deskFront()` after them, so their legs disappear behind it. Characters standing
  ON the desk get a higher z-index.

Credit line required in the description (Piper voice, CC BY-SA training data): see `assets/voices/piper/CREDITS.md`.
It is also shown on the end card. Upload text for the user: `projects/khata-cartoon/UPLOAD.md`.

**Delivered 2026-10-06:** `renders/khata-cartoon/2026-10-06_1201/` (master only, `--formats=9x16`). Run time 1,352 s:
- check + design-lint ~2 min
- render of the 1088 page ~18 min (drawelement capture)
- crop re-encode ~3 min

QC: all PASS, including `edges`; −14.1 LUFS, TP −1.4. **Verified by:**
- `voice-sync` (cross-correlating each voice WAV against the master): 38/38 lines at 0 ms lag, correlation ≥ 0.97
- a whoosh audible at every cut (−8 to −14 dB peaks)
- all 600 half-second frames reviewed
- PSNR 52–53 dB against the previous render in the unaffected area (nothing moved)

The two earlier renders (with the edge strip) are in `.quarantine/2026-10-06/`.

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

## 7. ✅ Remotion licence — RESOLVED 2026-09-11

Read from the `LICENSE.md` actually shipped inside the installed package
(`projects/remotion-starter/node_modules/remotion/LICENSE.md`, v4.0.523), not from memory.
npm records the licence as `SEE LICENSE IN LICENSE.md`.

Remotion is two-tier: a **Free License** and a paid **Company License**.

### The user qualifies for the Free License

Eligibility is by entity type, and the list includes **"an individual"** and
**"a for-profit organization with up to 3 employees"**. Talha is an individual, so he is
eligible today. The Company License (remotion.pro/license) only kicks in for a for-profit
organisation above that size.

### What the Free License allows

> "use the software non-commercially **or commercially for the purpose of creating videos and
> images** and to modify the software to their own liking, for the purpose of fulfilling their
> custom use case"

**So: building videos with Remotion and selling those videos is explicitly permitted.** The
earlier worry in this file was unfounded for his situation.

### The one real restriction

> "It is not allowed to copy or modify Remotion code for the purpose of selling, renting,
> licensing, relicensing, or sublicensing your own derivate of Remotion."

**He may not build and sell a video-making product that is a derivative of Remotion.** This is
the same shape as the GSAP catch in §4c: *making videos* is fine, *selling a video tool built
on it* is not. If he ever wants to sell a video-editor product, neither Remotion nor GSAP is a
safe dependency — that is an Anime.js (MIT) + HyperFrames decision.

### Watch this

The file's own header says: **"In Remotion 5.0, the license will slightly change"**
(remotion-dev/remotion PR #3750). Re-read `LICENSE.md` after any major-version upgrade.

### Bottom line

| Use | Verdict |
| --- | --- |
| Make videos with Remotion, sell the videos | ✅ allowed (individual / ≤3 employees) |
| Client pays him to make a video | ✅ allowed |
| His company grows past 3 employees | ⚠️ Company License required |
| Sell a product that *is* a Remotion derivative | ❌ never, at any tier |

HyperFrames remains the simpler choice — it has no tier at all — but Remotion is no longer a
blocker for selling videos.

---

## 8. Progress log

### ✅ Tier 1 — done 2026-09-10

- Folder structure created.
- HyperFrames 0.8.33 installed globally, render verified (1080p, 10s).
- Remotion 4.0.523 + React 19.2.3 + Tailwind v4 installed, render verified (1080p, 5s).
- Remotion bundled-FFmpeg bug diagnosed and worked around via `render.mjs`.
- `src/Composition.tsx` replaced the blank stub with a real animated title card
  (spring entrance, gradient wipe rule, slow push-in, tail fade) — usable as a template.
- Leftover research-probe folders deleted (128 MB reclaimed).

### 🔶 Tier 2 — craft layer (in progress)

- ✅ **Fonts — done 2026-09-10.** 9 families, all OFL 1.1, in `assets/fonts/`, render-verified
  via `projects/font-test`. Full detail in §4b above. Per-project copy required.
- ✅ **Animation runtimes — done 2026-09-10.** GSAP 3.15.0 + 12 plugins, Anime.js 4.5.0,
  lottie-web 5.13.0 vendored locally in `assets/js/`, render-verified via `projects/anim-test`.
  Full detail in §4c above, including the GSAP commercial-licence catch and two Anime.js
  seek gotchas. Motion / framer-motion has no adapter — never install it.
- ✅ **LUTs / colour grading — done 2026-09-11.** 3 `.cube` looks generated locally (no download,
  no licence question) in `assets/luts/`, colour shift measured on a real frame. §4e.
- ✅ **Sound effects — done 2026-09-10.** 19 Pixabay-licensed SFX in `assets/sfx/`, audio
  pipeline render-verified via `projects/audio-test` (cross-correlated placement). §4d.
- ✅ **Audio chain — measured 2026-09-11.** `loudnorm` two-pass (-9.0 → -12.0 LUFS on the SFX
  test; -14 unreachable at LRA 19-22, which is correct), `sidechaincompress` ducking (the
  `threshold` is LINEAR, not dB — that is why it looks broken), `afftdn` vs `arnndn` compared.
  ⚠️ `arnndn`'s model has **no declared licence** — not clearable for a sold product. §4f.
- 🔁 **Music — source chosen (Pixabay), pipeline verified, tracks not yet downloaded.**
  The Pixabay API has no music endpoint, so the user downloads MP3s by hand into
  `assets/music/` (see its README). BGM mixing, trimming and levels are already proven
  with a synthesized bed. MusicGen is ruled out (non-commercial weights). §4d.

### 🛠️ 2026-09-11 session

- ⚠️ **Windows Application Control started blocking HyperFrames' bundled Chrome** — every check,
  snapshot and render failed with `spawn UNKNOWN`. Fixed with a user-level
  `HYPERFRAMES_BROWSER_PATH` pointing at the signed system Chrome; re-render of `font-test`
  verified byte-comparable output. **§2b — read it before debugging any render failure.**
- ⭐ **First real video built end to end** via `/product-launch-video`:
  `projects/hishab-khata-promo`, 45 s Bengali promo, 7 frames, all gates green.
  **The user declined the render**; it is the resume point. §4g.
- Tier 2's last two technical items (LUTs, audio chain) closed — §4e, §4f.
- ✅ **Remotion licence resolved** from the shipped `LICENSE.md`: he qualifies for the Free
  License as an individual, and selling videos made with it is explicitly allowed. Selling a
  Remotion *derivative* is not. §7.

### 🛠️ 2026-09-25 session

- ⚠️ **Smart App Control started blocking `ffprobe.exe`** — a *second*, separate block from the
  2026-09-11 Chrome one. Every `hyperframes render` built the MP4 and then **deleted it** when the
  post-render duration probe died and the artifact transaction rolled back. `ffmpeg.exe` from the
  same folder still runs, so the block is per-file reputation; `python` on PATH is blocked too.
  No admin rights, and SAC cannot be re-enabled once off — so it is worked around, not fixed.
- ✅ **Built and verified `tools/hf-render.mjs`** — renders via `--format png-sequence` (a
  *directory* artifact, which skips the probe), flattens the transparent background back to the
  composition's colour, and encodes with the system FFmpeg using HyperFrames' own encoder profile.
  **37.7 s for 5 s of 1080p — faster than the 54.2 s normal path.** PSNR 39.02 dB against the
  known-good reference; stream correctly tagged `yuv420p(tv, bt709, progressive)`; frame inspected.
  **§2c — read it before debugging any render failure.**
- 📏 Explained the 501 KB vs 946 KB size drop by measurement, not guesswork: a transparent page
  makes Chrome switch from subpixel to **grayscale text antialiasing** (fringed pixels 15.4 % →
  6.1 %). Less chroma detail, smaller file, and the better choice for video. §2c.
- ⬜ **Audio is the open gap.** png-sequence has no audio track, so `hf-render.mjs` renders silent.
  `tools/hf-audio.mjs` is designed and referenced but **not written yet**. Blocks a faithful
  render of `hishab-khata-promo`, which has 28 SFX cues.

### 🛠️ 2026-10-04 / 10-05 session

- ⭐ **The user turned Smart App Control OFF.** Every earlier block is gone; §2b/§2c/§3 are fallbacks now. §0b has the details.
- 🔍 **Full capability audit** ("can it make any video from any input, professionally, automatically?"):
  7 dimension auditors probed the machine for real, then an adversarial cross-check. The result and the
  22-step install/build plan are in §0b.
- ✅ **Plan step 1 done:** user env `HYPERFRAMES_NO_AUTO_INSTALL=1` set and `HYPERFRAMES_BROWSER_PATH`
  removed. Re-verified with a fresh-shell-equivalent render of an audio-test copy: headless shell
  152.0.7977.30, 29 s, h264 + AAC 48 kHz stereo, −9.0 LUFS, cue peaks −1.2 to −6.8 dB vs gap −33.8 dB.
- ⚠️ Side effect to clean up (needs OK): the media-use test suites wrote fake records into `C:\Users\zubay\.media`.
- ✅ **Plan step 6 done (2026-10-05):** `burn-subs.mjs`, `srt-to-words.mjs`, `srt.mjs`. Found and documented that
  HyperFrames' own SRT import breaks on CRLF files.
- ✅ **Plan step 5 done (2026-10-05):** `tools/finish.mjs` + `tools/qc.mjs`. Verified on a project with sound, a silent
  project, a portrait HEVC file, a broken project and a 250 s project. Test outputs live only in the session scratchpad.
  One leftover test folder that a failed run created in `renders/broken/` was removed; `renders/` is empty again.
- ✅ **Plan step 4 done (2026-10-05):** `tools/voice.mjs` (record + clean). Verified on synthetic noisy speech, the
  user's real Bengali clip, opus/mp4 inputs, the silent/no-voice/far-from-mic cases and a live 2 s mic capture.
  `HYPERFRAMES_SKIP_SKILLS=1` was set at user level at the user's request.
- ✅ **Plan step 3 done (2026-10-05):** Kokoro English TTS in `tools/pyenv`. Verified voice → render → ASR round trip.
  ⚠️ Side effect: a scratch `hyperframes init` reinstalled all 21 HyperFrames skills from GitHub (see §0b).
- ✅ **Plan step 2 done (2026-10-05):** `tools/pyenv` venv (offline, 28 MB) + user env `HYPERFRAMES_PYTHON`.
  Verified that HyperFrames resolves it. Nothing was installed into the Hermes venv.

### 🌙 2026-10-05/06 overnight session ("do all the steps, don't ask, I'm going to sleep")

The user authorized the whole remaining plan in one message. Ground rules kept for the night: git snapshot
FIRST (step 19), one commit per step, nothing deleted (quarantine only), no accounts, sign-ins or money
(steps 13/14 left as user tasks, step 21 skipped). Downloads were limited to the planned, licence-checked ones:
- the Bengali ASR model (775 MB)
- the whisper.cpp small.en model (488 MB, fetched by the CLI)
- Piper + its voice (~111 MB)
- DeepFilterNet (27 MB)
- librosa and its stack (~100 MB)
- Lucide icons, 7 OFL fonts, 14 CC0 SFX and 14 Noto Lottie emoji
- the bijoy converter (73 KB)
- the u2net matting model (176 MB)
- the HyperFrames 0.8.134 CLI
Order run: 19 → 7 → 8 → 11 → 12 → 16 → 17 → 15 → 18 → 13/14 tooling → 9 → 10 → 20 → 22. Results are in §0b.
Notable finds:
- The Bengali fine-tune must decode `without_timestamps`.
- Whisper writes phantom text into silent tails (now filtered out).
- 0.8.33's compiler ignored the linked fonts.css and pulled Google Fonts.
- HyperFrames' SRT import breaks on CRLF.
- The silently-updated skills broke media-use resolve on the old CLI, which is why the CLI was upgraded.
The user's morning report is START-HERE.md §১৭.

### 🎬 2026-10-06 — first real render, the user's review, and the polish pass

- The user approved the render of hishab-khata-promo ("রেন্ডার করে দেখাও"); finish.mjs delivered it (QC all PASS).
- He spotted three flaws in frame 06 and asked for them fixed AND for such mistakes to be prevented, the system to be
  "more dynamic", and every video reviewed to be made better, with no fixed limit. Done in one pass:
  `design-lint.mjs` + `hf-page.mjs` + `sfx-leads.mjs`, design-lint inside finish.mjs, qc dead-air, fix-frame tracking,
  and the §0d craft rules. Promo fixes: frame 06 rebuilt on one grid (content-sized shelf, push 0.965 → 1, shared
  baselines); 04/05 settles start below 1; letter-spacing removed from Bengali in all 7 frames (design-lint --fix);
  kickers 16 → 25 px; frame-04 digits now drawn by Hind Siliguri instead of the system's Nirmala UI; SFX re-timed for
  their lead-ins and the silent stretches filled (28 → 46 cues: transition whoosh at 19 s, UI ticks, cash register on
  the fee total, a strike swish, count-up ticks, sparkle on the brand underline).
- Not changed on purpose (the user approved the storyboard): the 2 s empty "breather" pages (frames 2 and 7) and the
  1.3 s first line. The vertical/square exports are still blurred-background "fit" versions: a native 9:16 layout is the
  next big upgrade (offered to the user).

### ⬜ Tier 3 — local AI media (not started, heavy)

> **Updated 2026-10-04:** superseded by the §0b plan (steps 3, 7, 11). Kokoro's model is already
> cached (only the pip package is missing, and Kokoro has no Bengali). The whisper.cpp prebuilt and
> the faster-whisper models already exist on E:. MusicGen stays ruled out.

`hyperframes doctor` reports these as missing and optional:

| Tool | Purpose | doctor's hint |
| --- | --- | --- |
| whisper-cpp | transcription → auto subtitles | build with cmake |
| Kokoro TTS | text → voiceover | `pip install kokoro-onnx soundfile` |
| MusicGen | AI background music | `pip install transformers torch soundfile numpy` |

⚠️ Torch on Windows CPU is multi-GB. With ~3 GB free RAM and no GPU, **warn the user about
disk and speed before installing**, and get an explicit OK. Note the system FFmpeg was built
`--enable-whisper`, so an FFmpeg-native transcription path may exist — investigate that first,
it may be far cheaper than building whisper.cpp.

---

## 9. Available Claude skills for this work

Already installed under `C:\Users\zubay\.claude\skills`:

`hyperframes` (entry point — **read first for any video request**), `hyperframes-core`,
`hyperframes-cli`, `hyperframes-animation`, `hyperframes-audio`, `hyperframes-creative`,
`hyperframes-keyframes`, `hyperframes-registry`, `media-use`, `motion-graphics`, `slideshow`,
`general-video`, `faceless-explainer`, `product-launch-video`, `music-to-video`,
`embedded-captions`, `talking-head-recut`, `pr-to-video`, `remotion-to-hyperframes`, `figma`,
`smart-start`.

Start any new video request by invoking the `hyperframes` skill — it routes to the right workflow.
