# CLOUD.md — the Video Create studio on Claude's cloud machine (Linux)

> Read CLAUDE.md first (all its rules apply unchanged), then this file. Written 2026-11-04 when the studio was first
> set up in the cloud. Everything below was run and checked on the cloud machine that day.

**সহজ বাংলায়:** আপনার ল্যাপটপের পুরো ভিডিও স্টুডিও (যন্ত্র, স্কিল, ফন্ট, শব্দ, নিয়ম) এখন Claude-এর ক্লাউড কম্পিউটারেও
চলে। ল্যাপটপের ফাইল কিছুই বদলানো হয়নি, শুধু নতুন ফাইল যোগ হয়েছে (এই CLOUD.md আর `tools/cloud/`)। ক্লাউডের কম্পিউটার
কিছুক্ষণ অলস থাকলে মুছে যায়; তখন `bash tools/cloud/setup.sh` এক কমান্ডে সব আবার বসায় (প্রায় ১০ মিনিট)।

---

## 1. Where things are

| Thing | PC (Windows) | Cloud (Linux) |
| --- | --- | --- |
| Workspace | `D:\Video Create` | `/home/claude/video-create` (a copy; list: `tools/cloud/MANIFEST.txt`) |
| Heavy media / work folders | `C:/Users/Zubayer Nibir/VideoWork/<name>` | `/home/claude/VideoWork/<name>` (`VC_WORK_ROOT`) |
| Python | `tools/pyenv` (3.11.9) | `/opt/vc/pyenv` (3.11.18, same packages, `tools/cloud/requirements-linux.txt`), linked as `tools/pyenv`, so `tools/pyenv/Scripts/python.exe` works |
| FFmpeg | 9.0.2 gyan full_build | 9.0.2 BtbN static `/opt/vc/ffmpeg9`, linked into `~/.local/bin` (ahead of the system 6.1, which lacks `-/filter_complex`) |
| HyperFrames | 0.8.134 + headless shell 152.0.7977.30 | the same pins (`npm root -g` = `/home/claude/.npm-global/lib/node_modules`) |
| HyperFrames skills | tag v0.8.134 in `~/.claude/skills` | the same tag, plus the workspace skills copied into `~/.claude/skills` |
| Bengali ASR model | `assets/models/asr/bengali-whisper-medium-ct2` | same file (774,731,149 B), at `/opt/vc/models`, linked |
| DeepFilterNet / whisper.cpp | `.exe` | Linux builds 0.5.6 / 1.9.1, linked under the `.exe` names |
| Lucide icons | 1,866 SVGs | lucide-static 1.52.0, only the PC's 1,866 names |
| Keys | `.env.local` | a copy of `.env.local` (chmod 600; key NAMES only were ever printed) |

## 2. Start of every cloud session (automatic since 2026-11-04 evening)

Nothing to type. The SessionStart hook in `.claude/settings.json` runs `node tools/cloud/autostart.mjs`:
- studio already set up → a 2-second `setup.sh --check`, prints "studio READY";
- fresh machine → starts `tools/cloud/setup.sh` DETACHED in the background (all downloads and the whisper.cpp build in
  parallel, logs in `/opt/vc/logs/`, summary in `/opt/vc/setup.run.log`) and returns at once. Plan meanwhile;
- workspace cloned somewhere else (a GitHub repo attached to the session) → links `/home/claude/video-create` to it.
Before the first build/render: `bash tools/cloud/ready.sh` (waits, then `--check`; exit 0 = ready).
By hand, if ever needed: `bash tools/cloud/setup.sh --check` (report) · `bash tools/cloud/setup.sh` (repair).
- **No workspace at all** (fresh machine, no repo attached): attach his private GitHub repo
  `zubayernibir6-code/video-create` (`add_repo`, then clone to `/home/claude/video-create`; seconds), else copy `D:\Video Create` through the desktop link (`device_stage_files`,
  50 files per call, paths in `tools/cloud/MANIFEST.txt`, plus `.env.local`), then run the hook by hand:
  `node tools/cloud/autostart.mjs`.
- A command shell is a snapshot taken when the session starts. In the FIRST session on a fresh machine, start commands
  with `. tools/cloud/env.sh &&`. From the next session on, `~/.bashrc` line 2 loads it. Plain `ffmpeg` is FFmpeg 9
  either way.

## 3. What is different from the PC (and the guard for each)

1. **Long jobs: `setsid`.** A render started with plain `nohup … &` was cancelled ("render_cancelled_parent_exited")
   the moment the command that started it returned. The Linux form of CLAUDE.md's `Start-Process` rule:
   ```bash
   . tools/cloud/env.sh && setsid nohup node tools/finish.mjs projects/<name> … > /home/claude/VideoWork/<name>/finish.log 2>&1 < /dev/null & disown
   ```
   then wait (`sleep` + `tail` the log), read the log once at the end.
   **Stopping a job:** never `pkill -f <pattern>` (or a `pgrep` loop) from a shell whose own command line contains the
   pattern: it kills that shell first (exit 144, 2026-11-04). List with `ps -eo pid,args | grep "[f]inish.mjs"` and
   `kill <pid>`.
2. **14 lines in 11 tools have env fallbacks** (`node tools/cloud/linux-overlay.mjs`, run by setup.sh): VideoWork root,
   HyperFrames folder, Chrome path, `.env.local` path, and Linux branches for two PowerShell calls (ASR RAM wait, zip).
   On the PC (`win32`, no `VC_*` variables) each changed line evaluates to its original value. These changed tools stay
   in the cloud copy; do not copy them back to the PC unless he asks. setup.sh marks the 11 files `--skip-worktree`, so
   `git status`/`commit`/`push` never carry them (undo: `git update-index --no-skip-worktree <file>`).
3. **Machine:** 2 CPUs, ~8 GB RAM, ~30 GB free disk, no GPU (Chrome draws with SwiftShader). HyperFrames picks its
   low-memory profile (screenshot capture) because RAM < 8 GB, the same capture mode as the PC.
4. **Not here (yet):** his cloned voice (`C:/Users/Zubayer Nibir/VideoWork/voice-clone`: voices.json + reference clips,
   outside `D:\Video Create`; copy it with his OK if he wants voice-clone in the cloud), the RVC/IndicF5 venvs, a
   microphone (`voice.mjs record`), the media of old projects (copy a project's files only when a job needs them),
   Kokoro English voice files (`hyperframes tts` downloads them on first use).
5. **Network:** npm, PyPI, GitHub (+ release downloads), Hugging Face, Google AI (Gemini/Lyria), Cloudflare, Openverse
   answered on 2026-11-04. `cdn-lfs.huggingface.co` is blocked, but model downloads still work (they use xet).

## 4. Delivering

1. Render with `finish.mjs` exactly as on the PC (renders go to `renders/<name>/<stamp>/`), then contact sheets (§0d 9).
2. Send the finished files in the chat (SendUserFile) and, while the desktop link is up, write them into
   `D:\Video Create\renders\<name>\<stamp>\` (`device_commit_files`).
3. Sources that changed (a project's json/PLAN.md, LESSONS.md, a new tool or skill line, §0f): `git status` in the
   cloud copy lists them; copy them back to the same paths on the PC with his OK.

## 5. Proof run (2026-11-04)

| Check | Result |
| --- | --- |
| `bn-tts.mjs` (Piper, male) | 6.4 s Bengali line in 1.8 s (PC: 3.4 s line in 8.6 s) |
| `transcribe.mjs --lang=bn` (the 774 MB model) | the same line read back with 2 small spelling slips (ক্লাউডের, বস) — 69 s incl. model load |
| `tools/reel/build.mjs projects/tools-reel-demo` | `index.html` and `build/timeline.json` **byte-identical** to the PC's build; mix graph identical except file paths |
| `hyperframes check` + `design-lint` | 0 errors; 80/80 contrast; design-lint 0/0/0 |
| `finish.mjs … --quality=high --formats=1x1` | **all 9 QC lines PASS**: h264/yuv420p, 1080x1920, 30 fps, 46.667 s, faststart, bt709 tags, clean edges, −14.3 LUFS, −1.5 dBTP; 1:1 copy, thumbnail, GIF; contact sheet looked at |
| HyperFrames Bengali smoke (`projects/cloud-smoke`, SMOKE-TEST.md §6) | "মোহনা অ্যাগ্রো ফুড" in Baloo Da 2 + Hind Siliguri: অ্যাগ্রো, রপ্তানি joined, matra unbroken; check 14/14 contrast |
| `burn-subs.mjs` Bengali line (SMOKE-TEST.md §7) | ক্লা স্টু প্র স্ত ক্ত ক্ষ all joined (libass + harfbuzz), centred at 60 % |
| `voice.mjs clean` (DeepFilterNet AI) on `public/voiceover.wav` (88 s) | −17.0 → −16.07 LUFS, peak −1.48 dBTP, in 36 s |
| `route.mjs` on `public/` | SHAPE S5 (voice + music, no footage) → REEL1 fits |
| **Rebuild from nothing**: `git archive` of the cloud copy (no models, no icons, no venv) + `VC_OPT=/opt/vc-fresh bash tools/cloud/setup.sh` | **17/17 ✓ in ~2 min** (FFmpeg, venv, 774 MB model, Piper voice byte-identical to the PC's, Lucide, whisper.cpp built); bn-tts ran from it. Download caches were warm: budget ~10 min on a brand-new machine |

## 5c. Fast start proof (2026-11-04, evening, a brand-new cloud machine)

| Check | Result |
| --- | --- |
| SessionStart hook `autostart.mjs` on a fresh machine | returned in **0.05 s**; setup running detached |
| Parallel `setup.sh` from nothing (FFmpeg, HyperFrames + Chrome, skills, venv + 774 MB model, Piper, DeepFilterNet, whisper.cpp build, Lucide) | **17/17 ✓ in 165 s** (installs 157 s; the old one-by-one setup: ~8–12 min) |
| Hook / `ready.sh` on the ready machine | 2.6 s each, "studio READY" |
| `finish.mjs` on a 4 s Bengali 16:9 page (`projects/zz-fast-smoke`) | 48 s for everything: render, −13.9 LUFS, all 10 QC PASS, 9:16 / 1:1 / 4:5, thumb, GIF; frame read: ক্ষ ত্র স্ত্র প্র অ্যাগ্রো রপ্তানি joined |
| Stopping a test job | `kill <pid>` from `ps` worked; a `grep`/`pgrep` pattern in a loop killed the calling shell again (exit 144): §3.1 is right |

## 5b. Render numbers (cloud, 2 CPUs, software GL)

| Job | Time |
| --- | --- |
| tools-reel-demo 46.6 s 1080x1920, `--quality=high`, screenshot capture | render **2 min 11 s** (~10.7 frames/s); whole `finish.mjs` incl. check, design-lint, loudness, QC, 1:1, GIF: **200 s** |
| 5 s 1080x1920 Bengali title, `-q draft` | **7.0 s** |
| hyperframes check + design-lint (46.6 s reel) | 31 s |
| Bengali ASR, 6.4 s clip (incl. model load) | 69 s |
| Rough budget | ~3 s of render per 1 s of light motion graphics at 1080p; footage-heavy and 4K60 pages are slower |

## 6. Running all the time (honest limits)

The cloud machine is not a server that runs forever: it is reclaimed after a period of inactivity, and a session works
while a task is running. What makes it feel always-on: (1) the whole workspace lives in his private GitHub repo
`zubayernibir6-code/video-create` (since 2026-11-05: the laptop's full history + the cloud work), so a new session gets
it in seconds without the laptop; (2) the SessionStart hook rebuilds the tools in ~3 min in the background; (3) scheduled
tasks can start a session at set times. His raw footage and finished renders are NOT in git: footage comes from chat
uploads or the desktop link, renders go back by SendUserFile / the desktop link.
