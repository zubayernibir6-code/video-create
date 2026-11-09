---
name: zero-cost-video-editor
description: Edit the user's own footage into finished videos (Reels, Shorts, YouTube) in the D:\Video Create workspace, using only the free local tools already set up there (FFmpeg, the Bengali transcriber, burn-subs, finish.mjs, contact-sheet.mjs). Use when the user brings A-roll, a voiceover, screen recordings or B-roll and asks to edit, cut, caption, add B-roll, SFX, music or transitions, reframe, or make variants. Videos built from scratch as motion graphics go through the hyperframes skill instead.
---

# Zero-cost video editor (adapted to D:\Video Create, 2026-10-25)

You are the editor. The user brings the raw material and the taste; you do the labour with the free tools that
are already installed in `D:/Video Create`. He is a non-coder: talk to him in simple Bengali (workspace CLAUDE.md §0).
**The workspace's `CLAUDE.md` is the authority on this machine.** Where it and this skill differ, CLAUDE.md wins.

## Hard rules

1. **Zero paid services.** Never call paid APIs or cloud renders (ElevenLabs, InVideo credits,
   `hyperframes cloud render`, HeyGen-hosted voices, avatars or generated media, Higgsfield, Runway,
   paid stock). If something can't be done for free, say so and offer the free substitute.
2. **Install nothing.** Everything this workflow needs is set up and verified (CLAUDE.md §0a, §0b). Never run
   `npx skills add`, `hyperframes skills update`, `npm install -g`, `winget`, a CLI upgrade, or `pip install`
   (packages go only into `tools/pyenv`, and only with the user's OK). If something seems missing, say so and ask.
3. **Never touch originals.** Read from `input/`, write to `work/`; deliveries go to `renders/` through finish.mjs.
4. **STYLE.md wins.** Read `D:/Video Create/STYLE.md` and `D:/Video Create/LESSONS.md` before planning. They override
   every default below, but never CLAUDE.md §0 (working rules) or §0d (craft rules). The STYLE.md and LESSONS.md
   next to this skill only point to those two files.
5. **Plan gate before any work** (CLAUDE.md §0e). Copy `tools/plan/TEMPLATE.md` to `projects/<name>/PLAN.md` and fill
   it in (example: `tools/plan/EXAMPLE.md`), run `node tools/plan-check.mjs projects/<name>` until it reports no
   ERROR, then show him, in Bengali, the goal, the hook, the shot table, what is needed, every WARN and the
   questions, and wait for his OK. `edit_plan.json` beside it (reference/edit_plan.md) is the render spec you write
   from the approved PLAN.md; it never replaces it.
6. **Look before you deliver.** Contact sheets and finish.mjs's QC (Steps 7–8) before saying it's done.
7. **Credit everything.** Log every third-party asset (source URL, author, licence) in `credits.txt` beside the
   deliverable. A Piper voice needs the line in `assets/voices/piper/CREDITS.md`; Noto emoji need theirs.
8. **Spend usage wisely.** Heavy work runs in tools on his machine. Read contact sheets, not dozens of frames, and
   don't paste whole transcripts into chat.

## Where things live

- Workspace `D:/Video Create` (the path has a space: always quote it). Tools are `tools/*.mjs`, run with `node`.
- Python is only `"D:/Video Create/tools/pyenv/Scripts/python.exe"` (written `PY` below). `python` on PATH is another
  app's environment and `python3` is a Microsoft Store stub. This skill's two scripts run with PY:
  `<this skill>/scripts/make_captions.py` and `<this skill>/scripts/silence_keep.py`.
- Pack assets: fonts `assets/fonts`, sounds `assets/sfx` (manifest.json gives each sound's silent lead-in `lead_s`),
  music `assets/music`, LUTs `assets/luts`, icons `assets/icons/lucide`. CLAUDE.md §0c has FFmpeg recipes tested here.

## Project layout

```
projects/<name>/
  input/          aroll*.mp4  voice.wav  script.txt  broll/   (his files, read-only)
  work/           voice.words.json  keep.json  sheets/  broll/  gfx/  cut*.mp4  captions.ass  <name>.mp4   (scratch)
  PLAN.md         the plan he approved
  edit_plan.json  the render spec written from it
renders/<name>/<date>/   master, other formats, thumbnail, GIF, qc.json (made by finish.mjs)
assets/refs/             his reference videos, shared by all projects (STYLE.md §১২)
```

Run FFmpeg from the project folder with relative paths: a drive letter (`D:`) breaks FFmpeg filter arguments.
Build long filter graphs in node (`spawnSync` with an argument list) or with PY, not as shell one-liners.

## Step 0: Machine check (first run in a session)

`hyperframes doctor` (warnings for RAM, MusicGen and Docker are expected). Disk is tight on this login (about 4 GB
free on D:, 6 GB on C:): check before long renders. Free stock keys (Pexels, Pixabay) go in `.env.local`, which he
fills in himself (template `.env.local.example`); Openverse photos need no key. Never create accounts or type keys.

## Step 1: Intake

- Ask only what STYLE.md and the request don't answer; open questions go into PLAN.md.
- Probe every input (CLAUDE.md §0c "Inspect"). HDR phone clips need the §0c tone-map first. Variable-frame-rate
  phone footage is fine for HyperFrames; convert it to constant 30 fps for long FFmpeg edits (§0c).
- A contact sheet of each A-roll: `node tools/contact-sheet.mjs input/aroll.mp4 --out=work/sheets/`, then read it.
- If STYLE.md §১২ names reference videos in `assets/refs/`, study them the same way: a contact sheet plus the
  cut-rhythm recipe (recipes.md), and borrow only what his line there asks for.

## Step 2: Words with timestamps

- **Bengali:** `node tools/transcribe.mjs input/voice.wav --lang=bn --out=work/voice` → `work/voice.words.json`
  (+ `.srt`, `.txt`; without `--out` they land next to the input, inside `input/`). It is the fine-tuned Bengali
  model, about 10× real time. It writes no punctuation and misspells English loan words (GPT, Gemini), so correct
  the words against `input/script.txt` and keep the timings.
- **English:** `node tools/transcribe.mjs <file> --lang=en --out=work/voice`.
- There is no script-alignment tool here (stable-ts is not installed and must not be).
- For your own reading, print a compact `[12.4] sentence…` version instead of the full JSON.

## Step 3: Rough cut

- Pauses: `PY <this skill>/scripts/silence_keep.py input/aroll.mp4 -o work/keep.json --min-silence 0.4`
  (STYLE.md §৫ cuts pauses over 0.4 s and keeps a breath at each cut; `--noise -30dB` for noisy rooms).
- Retakes: find repeated or abandoned sentences in the transcript; keep the **last complete take**; drop false
  starts and fillers (আ, উম, মানে, আসলে when used as filler). Edit keep.json.
- Two cameras: sync by audio cross-correlation (recipes.md → "Multi-cam sync", run with PY; numpy is there).
- Screen recordings: speed up or remove idle stretches with no speech (recipes.md → "Speed up").

## Step 4: Plan

Write PLAN.md first (rule 5). Its pace, hook, sound and safe-zone rules come from STYLE.md §৪–§৭ and CLAUDE.md §0d;
plan-check measures them. Defaults where STYLE.md is silent:

- **Hook:** the first 1.5–2 s carry the most interesting line or visual; never open on a greeting.
- **B-roll** illustrates the exact noun or claim being spoken; no generic "business people" filler.
- **Punch-ins** (1.1–1.2×) on emphasis lines and to hide jump cuts; zooms land on 1× (CLAUDE.md §0d rule 1).
- **Transitions:** hard cuts by default; slide/zoom only at section changes.
- **SFX:** a whoosh at every scene change (STYLE.md §৭), quiet clicks for small events, each placed at
  `visual hit − lead_s`. Never stack two in the same 0.3 s.
- **Music:** under the voice, ducked; out on the final line or the CTA. Only from `assets/music` (empty until he
  downloads tracks).
- **Safe zones (9:16):** keep text and faces between 14 % and 65 % of the height and 6 % from the sides. Captions
  centre at 60 % (both caption tools do this by default).

After his OK, write `edit_plan.json` beside PLAN.md (schema: reference/edit_plan.md).

## Step 5: Gather assets (free, in this order)

1. His own `input/broll/` (screen recordings, phone clips, photos).
2. Free stock: `node tools/stock-fetch.mjs "<specific nouns>" --type=photo|video` (Openverse needs no key; Pexels and
   Pixabay use his keys in `.env.local`). It downloads and writes the credit lines. Free photos have no model
   release: no recognisable people in ads.
3. Motion graphics: HyperFrames, following CLAUDE.md (the hyperframes skill, `hf-postassemble`, design-lint). Render
   overlays transparent (`--format webm`) and composite them with FFmpeg (CLAUDE.md §0c, the hybrid path).
4. Photos → motion: Ken Burns (recipes.md).
5. SFX: `assets/sfx` (31 sounds). Synthesise one with FFmpeg only as a last resort (recipes.md).
6. Music: a track from `assets/music` that he downloaded (`node tools/music-pick.mjs list` shows each one's length,
   loudness and licence PDF). Trim, fade and duck it in the FFmpeg mix (recipes.md → "Audio"); `music-pick.mjs pick`
   is for HyperFrames projects only. Never HeyGen's catalogue or MusicGen.
7. Voice: his own voice first (`node tools/voice.mjs record|clean`, STYLE.md §৮), otherwise Piper
   (`node tools/bn-tts.mjs`, credit line required).

AI-generated photoreal video is not free and does not run on this laptop. Don't use it.

## Step 6: Captions

- **Word by word** (Reels, STYLE.md §৪, spoken word in yellow):
  `PY <this skill>/scripts/make_captions.py work/voice.words.json --keep work/keep.json -o work/captions.ass --preset bold-pop --font "Hind Siliguri" --size 59 --words-per-page 3 --width <W> --height <H>`
  On 9:16 it centres at 60 %; on 16:9 pass `--center-y` at 90 % of H. On a busy background use `--preset clean`
  (sentences on a dark box). It also writes `captions.srt` for uploading.
- **Burn in** with `node tools/burn-subs.mjs work/cut.mp4 work/captions.ass work/captioned.mp4`. It gives libass a
  clean folder with only the pack fonts. Never use FFmpeg's `subtitles=` or `drawtext` for Bengali.
- **Plain sentence subtitles** from an .srt: `node tools/burn-subs.mjs <video> <subs.srt>` (9:16 → 60 %).
- Proofread on a readable sheet: `node tools/contact-sheet.mjs work/captioned.mp4 --cols=4 --from=… --to=…`.

## Step 7: Render (order matters)

1. Cut the A-roll from keep.json (trim/atrim + concat) → `work/cut.mp4`.
2. Reframe (9:16 centre crop or blurred fill) and punch-ins.
3. Overlays: B-roll cutaways, motion graphics, lower thirds (`overlay` with `enable='between(t,a,b)'`).
4. Transitions between sections (xfade after normalising fps, pixel format and timebase). Each one overlaps two
   clips by its length, so everything after it starts that much earlier: shift caption and SFX times to match.
5. Captions on top of everything (Step 6). burn-subs also writes the BT.709 colour labels finish.mjs checks.
6. Audio: voice + ducked music + SFX at their times, picture copied untouched → `work/<name>.mp4` (named after the
   project, because finish.mjs names its output folder after the file). Music at volume 0.25 before ducking sat
   18.5 dB under the voice in testing; the kit's 0.5 left it only 12.5 dB under (STYLE.md §৭: much quieter).
7. **Deliver with `node tools/finish.mjs work/<name>.mp4 --formats=9x16,1x1`** (whatever PLAN.md's আউটপুট says). It
   brings loudness to −14 LUFS, runs QC (codec, size, loudness, true peak, black edges, frozen frames, dead air) and
   writes the other formats, a thumbnail and a GIF to `renders/<name>/<date>/`. Don't hand-roll the final encode.

Use the commands in reference/recipes.md and CLAUDE.md §0c. Prefer one node script, `work/render.mjs`, that reads
edit_plan.json and runs the steps, so a change to the plan re-renders with one command.

## Step 8: QA (always)

- `node tools/contact-sheet.mjs renders/<name>/<date>/<name>.mp4` (the whole video on one sheet) and `--every=0.5`
  (frame by frame); read every sheet and compare the tiles with PLAN.md's shot table by time.
- Proofread the Bengali with `--cols=4` (9:16) or `--cols=2` (16:9) plus `--from`/`--to`: conjuncts (স্ব, ক্ষ, ন্ত),
  ি before its consonant, captions inside the safe zone and off faces and screen text.
- No black or frozen frames at cuts; B-roll matches the words; nothing important cropped by 9:16.
- `qc.json` from finish.mjs: everything PASS. Duration matches the plan; audio and captions stay in sync at the end.
- Fix what you find, re-render, re-check. Then deliver.

## Step 9: Deliver

`renders/<name>/<date>/` holds the finals (from finish.mjs); add `captions.srt`, `credits.txt` and 3 thumbnail
candidates. Tell him in 3–4 lines of Bengali what you made, what to check and what you weren't sure about. No .otio
timeline: he wants finished videos, not a timeline to finish by hand (CLAUDE.md §0e).

## Step 10: Learn from feedback

His feedback comes as times ("০:১২-তে জুমটা বেশি"). Fix it, then add one row, in Bengali, to the table in
`D:/Video Create/LESSONS.md`: `| তারিখ | ভিডিও | আপনি যা বলেছিলেন | পরের বার থেকে নিয়ম |`. When a lesson repeats,
propose a STYLE.md edit and apply it only when he agrees.

## Fast path: ONE phone clip -> highlighted-caption Reel, captions only (made 2026-11-09, reel-4784-captions)

Use when he brings one selfie / talking clip and asks only for "highlighted subtitles" (no cut, hook, zoom, music).
Reference project `projects/reel-4784-captions` (PLAN.md; `src/` has the corrected words, the delivered captions, the
face series and the loudness: keep a project's sources there, because `.gitignore` skips `projects/*/build/`). 61 s clip, cloud
machine (2 CPUs, ~7 GB). Machine time in the order below (estimate, the first run was much longer because of agents and
out-of-memory restarts): ASR ~6 min with the HDR conversion beside it, render 1.5 min, checks ~3 min.
**Do not spawn agents for it:** every step is CPU- or RAM-bound on the same two CPUs, and the agents of the first run
only waited on each other (12-20 min each, and they blocked the turn).

1. Probe the clip; write PLAN.md (his "start" is the plan approval, but still run plan-check). `tools/route.mjs`.
2. Start BOTH slow jobs at once, detached (`setsid nohup … &`), then work on the plan while they run:
   - `ffmpeg -i clip -vn -ac 1 -ar 16000 -c:a pcm_s16le work/audio16k.wav`, then
     `python3 -I tools/transcribe-fast.py work/audio16k.wav --out=work/asr/reel --chunks 3 --parallel 1 --threads 2 --resume`
     (about 6 min for 61 s; ONE decoder at a time: each holds ~3 GB, 3 or 2 at once were OOM-killed with exit -9 and no
     traceback). It writes words.json with a `prob` per word.
   - `bash tools/caption-reel/sdr30.sh clip work/sdr30.mp4` (HDR iPhone -> SDR 30 fps, 161 s for 61 s; stops if the
     display shape is not 9:16).
3. Fix the words (keep every timing): English product names in Latin letters (STYLE §1, "Google Flow-তে"; the model
   writes them in Bengali), the last word's end (the model stretches it to the clip end: set it to where the energy
   ends), then list the doubtful words (low `prob`, odd grammar) for him. Merged words take the first start and the
   last end. A word that is not sure is still shown, but is asked about in the SAME message as the video.
4. Caption height from the FACE: the lowest chin / whisker-tip y over the whole clip (faces agent or
   `tools/hook-ad/faces.py`, which needs `assets/models/face-yunet-2023mar.onnx`, not in git); centre = lowest tip + ~60 px
   (this clip: tip 1290 -> centre y 1350, which is inside Meta's bottom 35 % that starts at 1248: say so to him).
   A clip filmed further away leaves room higher (hook-ad uses 1190).
5. `python3 -I .claude/skills/zero-cost-video-editor/scripts/make_captions.py work/words.json -o work/cap.ass --preset bold-pop --font "Hind Siliguri" --size 100 --words-per-page 3 --width 1080 --height 1920 --center-y <y> --max-gap 0.4`
   (size 100 with the preset's outline 6 and no shadow is what shipped and read fine on a busy checked shirt; 84 was
   tried first and looked small there; outline 7 + shadow 3, a Style-line edit, looked a little punchier in the test
   frames. A translucent BOX style drew a darker double box behind the enlarged active word: don't use a box with
   scale_active above 100). It drops a danda that follows a Latin letter ("Flow।" read "Flowl"). Copy the style numbers
   into PLAN.md from the file (`grep '^Style:' work/cap.ass`), not from memory: on 2026-11-09 PLAN.md said outline 7 /
   shadow 3 while the shipped file had 6 / 0.
6. **Gate before rendering:** `python3 -I tools/caption-reel/capcheck.py work/cap.ass <face series json>` must say PASS
   (no wrapped page, 65 px side zone, no event touching the face; ~10 s). Its fail cases were shown on a size-140 and a
   too-high copy of the captions.
7. `bash tools/caption-reel/render-release.sh work/sdr30.mp4 clip work/cap.ass renders/<name>/<date>/<name>.mp4`
   (burn + −14 LUFS + the house release encode, no edit list; 68-99 s). Then `node tools/qc.mjs … --w=1080 --h=1920 --fps=30
   --dur=<s>` and `node tools/release/spec-check.mjs … --for=universal-reel` (no WARN) and READ the captions:
   `python3 -I tools/caption-reel/strips.py <render> work/cap.ass work/strips` (one crop per caption page, 4 images for
   47 pages) plus the one-sheet `contact-sheet.mjs`. Look at the frames of the SMALLEST face gaps at full size.
8. Deliver with SendUserFile + ONE Bengali message: what it is, what was checked, the safe-zone trade-off, the spelling
   list with times, the offer of hook / zoom / music. Then post-copy, unasked (`RELEASE-COPY.md`, copy-check).
A spelling fix = edit words.json, rerun steps 5, 6, 7 (about 2-3 minutes; the SDR picture and the loudness are cached).

## Variants

A variant is the same plan with different settings; never re-plan from scratch.
- **Format:** 9:16, 16:9, 1:1, 4:5 through finish.mjs `--formats` (a quick blurred "fit", or a separate layout,
  STYLE.md §৬). Move captions per format.
- **Length:** 15/30/60 s cut-downs: keep the hook and the strongest beats.
- **Hook A/B:** 2–3 different opening lines or visuals, same body.
- **Caption style:** swap the preset. **Language:** Bengali, English or both.
Name files `<project>_<format>_<variant>.mp4`.

## Bangla text

- Burn captions only through `tools/burn-subs.mjs` (the `ass` filter with a clean fonts folder). FFmpeg's
  `drawtext` and `subtitles=` break conjuncts (স্‌বপ্‌ন instead of স্বপ্ন).
- HTML engines (HyperFrames) shape Bengali correctly. Embed the font with `@font-face` and quote every family name
  (CLAUDE.md §0d rules 6 and 10).
- Pack fonts: Hind Siliguri (captions and body, Bold for captions), Baloo Da 2 (titles and big numbers), Tiro Bangla,
  Noto Sans/Serif Bengali, Anek Bangla. No letter-spacing on Bengali (§0d rule 4).
- Bengali sentences end with `।`; the caption script breaks pages there.
