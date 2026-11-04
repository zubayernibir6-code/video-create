---
name: explainer
description: Make a voiced 16:9 EXPLAINER / concept tutorial with NO footage in the D:\Video Create workspace (style EXP1 "ব্যাখ্যা বোর্ড") - his cloned voice reads a Bengali script, every picture is drawn by tools/explainer (simplified app windows, chat mock-ups, folder trees, code files, a desk-and-shelf diagram, cards, settings with toggles, terminal), word-anchored beats, phrase captions with the spoken word in gold, chapter bar, ducked Lyria BGM. Use when he asks for a tutorial or explainer about a CONCEPT or an app without a recording, "X কী, কেন, কীভাবে", "N মিনিটের টিউটোরিয়াল", or when he says EXP1. Screen recordings -> screen-tutorial; his face -> episode-edit / abroll; short lists of tools -> tools-reel.
---

# explainer: a drawn, voiced tutorial (EXP1, first made 2026-11-02 on projects/claude-skills-tutorial)

CLAUDE.md rules apply (Bengali to him, plan gate §0e, craft §0d, whole-video §0h, five elements §0i). Reference project:
`projects/claude-skills-tutorial` (5:06, 22 scenes, 44 lines, his voice talha-g). Engine: `tools/explainer/`
(`build.mjs` timing + captions + chapters + mix + PLAN.md, `scenes.mjs` the scene types, `icons.mjs` the workspace's
Lucide icons, `reels.mjs` universal Reels from line refs).

## 1. Order (each line = one command)

| # | Step | Command / file | Guard |
| --- | --- | --- | --- |
| 1 | facts | read the OFFICIAL pages first (support.claude.com, docs) with web-fetch agents; quote exact menu labels; note disagreements | LESSONS 2026-11-01: platform facts only from the platform's own page |
| 2 | project | `node tools/new-video.mjs <name> --kind=blank`, copy `JetBrainsMono-Variable.ttf` into assets/fonts | — |
| 3 | script | `build/voice-script.txt` in gemini.mjs format: `[explain]`/`[story]`/`[question]`/`[happy]`/`[serious]`/`[cta]` tags per section, `[pause 0.5]` between sections, one sentence group per line. ~2.0 words/s for talha-g (550 words = 300 s). Tricky tokens in Bengali letters (`স্কিল ডট এমডি`), shown back via `display` | 16 requests for 5 min (quota 100/day) |
| 4 | voice + BGM (parallel) | `node tools/clone/gemini.mjs say build/voice-script.txt assets/media/voice/voice.wav --voice=talha-g` (≈ $0.014/min) · `node tools/lyria.mjs "<calm lo-fi prompt>" assets/media/music/bgm.mp3` ($0.08) → `node tools/music-extend.mjs … bgm-long.wav --min=<video+20>` | skip `--verify` on long scripts (it reloads the model per block, ~1 min each); build's alignment checks every line |
| 5 | scenes | `build/explainer.json` (copy the reference): `scenes[]` with `type`, `at`, `desc`, `text`, type data, `shots[]` for PLAN rows; time refs `L12`, `L12:word`, `L12:word+0.4`, `L12e`, `start` | a ref to a word the line does not have STOPS the build |
| 6 | silent preview | `node tools/explainer/build.mjs projects/<name> --estimate` → `hyperframes snapshot … --at <85 % of each scene> --no-end --describe=false` and LOOK | catches layout before the slow ASR |
| 7 | real build | `node tools/explainer/build.mjs projects/<name>` (first run transcribes the voice: ≈ 12 min per minute of voice on this laptop, run in background) | voice-times: < 80 % matched, half a line or 12 words unheard = stop |
| 8 | checks | `node tools/plan-check.mjs projects/<name>` · `cd projects/<name> && node ../../tools/design-lint.mjs . && hyperframes check` · snapshots again | 0 ERROR |
| 9 | render | `node tools/preflight.mjs projects/<name>` then `node tools/finish.mjs projects/<name> --release …` detached | finish refuses > 60 s without a clean preflight |
| 10 | release | `node tools/release/srt-export.mjs projects/<name>/build/master.words.json --out=projects/<name>/subtitles/<name>` (mkdir first) · Reels: `build/reels.json` (copy the reference) → `node tools/explainer/reels.mjs projects/<name>` → per Reel `cut.mjs`, `build-page.mjs`, `mix.mjs`, lint, snapshots, finish · RELEASE-COPY.md (skill post-copy) · release.json → `tools/release/pack.mjs` | copy-check, spec-check, safe_zone |

## 2. Scene types (scenes.mjs) and what each is for

`title` (section card) · `editor` (hook: a timeline that builds itself + the skills that made it) · `promise` (3 numbered
cards) · `chat` (a chat window; messages, rows, a "thinking" chip, a file card with a button, `clear`, `newChat`, side
panels `chips` / `report` / `slides`) · `analogy` (book → person → Claude, results with ticks) · `skillfile` (folder
tree + a code file, highlights and tags on words) · `question` · `desk` (context window = a desk + meter, shelf of
skills, 3 loading steps) · `benefits` (rows + a takeaway with a drawn arrow) · `tiles` · `settings` (breadcrumb, nav,
toggle rows, a tag) · `skillslist` · `flow` (3 steps + a mock with + → menu → upload → drop box) · `compare` (wrong vs
right) · `describe` · `uses` (4 cards + banner) · `terminal` (+ chips) · `warning` · `cta` (keyword + 3 message steps).
A new type goes into scenes.mjs with its CSS; data stays in explainer.json.

## 3. Rules the engine already keeps (do not redo)

- Every revealed element is hidden in CSS (`rv`) and revealed by ONE fromTo with all its keys (preflight
  shown_early / from_only); scene entrances scale 0.97 → 1 (camera lands on 1, §0d rule 1); exits are opacity only.
- Captions and the chapter bar are ONE onUpdate clock reading data arrays (seek-safe). Phrases break at । ? ! : and
  ~40 characters; never across lines; a gap under 0.6 s keeps the pill up (no flicker).
- App windows are SIMPLIFIED drawings with the note "ছবিটা বোঝানোর জন্য সরল করে আঁকা" under them; no real logos
  (LESSONS 2026-10-26); product tiles are coloured letters, not trademarks.
- Music: measured loudness → −35 LUFS under speech, −29 between lines, fade out over the last 3 s.
- `build/master.words.json` = every word in video seconds with the caption spelling → `tools/release/srt-export.mjs`
  and the Reels' `captions.json` `extra` (no second ASR).

## 4. Traps (each cost time on 2026-11-02)

- `gemini.mjs say --verify` on a 16-block script: one transcriber load per block, ~1 min each, ~20 min total; the
  build's own chunked alignment checks every line anyway. Use --verify on short scripts only.
- Bengali ASR of the joined 300-s voice took ≈ 60 min (≤ 18-s chunks, 4 threads). Start the real build right after
  the voice, run the silent preview meanwhile.
- Flex rows drop whitespace text nodes: terminal lines need one `<span style="white-space:pre">` around the line.
- Standalone chat bubbles inside an `abs` box shrink-wrap and wrap at 78 %: give them `max-width:none;white-space:nowrap`.
- A word ref on the LAST word of a line leaves the beat < 0.5 s on screen before the next scene: anchor earlier
  (`L2:Claude` instead of `L2:স্কিল`) or add a `holds` entry for that line.
- Bullets "•", "≈", "✓", "→", "›" are not in Hind Siliguri: Bengali numbering (১.), Lucide icons, "X, তারপর Y" in chips.
- Baloo Da 2's content box reaches ~0.28 em above its line box: a kicker needs 40+ px above a big Baloo title
  (hyperframes check content_overlap). A callout chip placed ON a highlighted code line needs data-design-allow-straddle.
- A one-shot ping (ring, flash: visible → 0) needs `immediateRender: false`, or it shows from the scene's start until
  its moment (first render 2026-11-02, a ring sat in empty space for 7 s). build.mjs now refuses it.
- A popped element that later moves with a tilt must carry the tilt in its entrance tween (preflight snap).
- Reels see the master WITH its burned captions: reels.mjs clamps every window view above y 932 (tested: a view at
  cy 620, scale 0.75 showed the master's caption pill). Caption-spelled words (`SKILL`, `ZIP`) are the refs in reels.json.
- A Reel chip anchored on a line's late word can live < 1 s: anchor Reel chips on the line start (`L19`, not `L19:তিন`).
