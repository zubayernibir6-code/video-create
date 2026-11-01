---
name: release-kit
description: After ANY main video is finished in the D:\Video Create workspace, take it to every platform in order - Bengali subtitle files (.srt) for the long video, universal 9:16 Reels (style UREEL1, one file that uploads unchanged to Facebook, Instagram, X and YouTube Shorts), a separate LinkedIn cut (style LI1, skill linkedin-kit), the copy for every platform, and one release folder with his Bengali upload checklist (RELEASE.md), each step machine-checked (spec-check, design-lint safe_zone, copy-check). Use unasked after a main video is delivered, or when he types /release-kit or says "সব প্ল্যাটফর্মে", "রিলিজ", "universal reel", "Facebook Instagram X-এ একই Reel", "LinkedIn-এর জন্য". Cutting Reels alone -> reel-cutdown; copy alone -> post-copy.
---

# release-kit: the main video → every platform (made 2026-10-30, release system v1, `docs/release-system-plan.md`)

His standing request (2026-10-30, memory `release-system-standing`): when a main video is finished, the system itself
continues: subtitles, universal Reels for Facebook/Instagram/X (+ Shorts), a SEPARATE LinkedIn version, the copy, one
organized release folder. Craft: visual hierarchy, tactile realism, cinematic pacing — all built into the engine and
its guards. Reference: `projects/claude-video-tutorial` (release.json, RELEASE-COPY.md, RELEASE.md, subtitles/),
`projects/claude-ureel-1` (UREEL1), `projects/claude-li-1` (LI1). CLAUDE.md rules apply: Bengali to him, one step
at a time, plan gate (§0e) before any build, five elements (§0i), whole-video treatments (§0h).

## 0. The order (each line = one command or one OK from him)

| # | What | Command / file | Guard |
| --- | --- | --- | --- |
| 1 | the main video's words | `node tools/release/master-words.mjs projects/<main>` → `<work>/master.words.json` | raw vs corrected times, median ≤ 0.25 s, else it stops |
| 2 | proofread what is left | `projects/<main>/subtitles.fixes.json` (`phrases`: [raw words, fix \| null]) → run 1 again | read every uncorrected stretch against PLAN.md's script |
| 3 | subtitle files | `node tools/release/srt-export.mjs <work>/master.words.json --out=projects/<main>/subtitles/<main>` | 0.5–7 s, ≤ 2 lines, no overlap; exit 1 on ERROR |
| 4 | pick the cuts | 4 universal Reels (reel-cutdown §1 ideas) + 1 LinkedIn cut (skill linkedin-kit); one PLAN.md each | plan-check; **his OK** |
| 5 | build each cut | §2 below | design-lint safe_zone / text_zones, build-time pacing + linear-ease + CTA guards, hyperframes check |
| 6 | render, one after another | preflight (> 60 s), then `finish.mjs … --out=F:/Video Create Renders/<main>/universal/<name>` (LinkedIn: `/linkedin/<name>`) | `node tools/release/spec-check.mjs <render> --for=universal-reel` (or `linkedin-clip`) |
| 7 | the copy | `projects/<main>/RELEASE-COPY.md` (skill post-copy §6) | `node tools/release/copy-check.mjs …` 0 errors |
| 8 | the release folder + checklist | `projects/<main>/release.json`, then `node tools/release/pack.mjs projects/<main>` | pack stops on a copy error or a spec FAIL |
| 9 | hand over | tell him in Bengali: `RELEASE.md` (the project's own release.json writes it in the project AND the out folder; a trial `--release=<other.json>` writes only to `--out`), the upload order, what is pending | — |

The main video's own subtitles never go IN the picture (his OK for the tutorial: no burned captions); the .srt files
are uploaded with it (YouTube `.bn.srt`; Facebook `.bn_IN.srt` — the name is the language; LinkedIn `.bn.srt`,
desktop only). Reels and the LinkedIn cut always carry burned word captions: only YouTube auto-captions Bengali.

## 1. Words: no new ASR

- A **screen-tutorial** master: `master-words.mjs` maps the ASR the tutorial was built from (`<work>/measure/{intro,
  voice,outro}.words.json`) through `tools/tutorial/timeline.mjs`, takes the corrected words of every cut-down that has
  its own ASR + fixes, learns their asr→fix pairs, applies cut-downs' `extra` fixes, drops phantom words by loudness,
  then applies `subtitles.fixes.json`. Proofread the printout of the uncorrected stretches once (names: Claude, Code,
  Google AI Studio, Lyria, BGM; drop invented words). Measured: 2 s for 8.5 min.
- Another kind of master: `node tools/transcribe.mjs <master audio> --out=<work>/master` (≈ 10 min per minute of
  audio — start it in the background, never during a render) and use its words.json the same way.
- Every cut's `captions.json` is then ONE line (proved identical to the reuse chains: 146/146 words, Δt 0):
  `{ "extra": [{ "asr": "C:/Users/Zubayer Nibir/VideoWork/<main>/master.words.json", "at": 0 }] }`

## 2. Building a universal Reel (UREEL1)

`node tools/new-video.mjs <name> --kind=ureel` copies cutdown.json, captions.json and build-page.mjs from
`projects/claude-ureel-1`. `<name>`: lower-case with dashes, `<main>-ureel-<n>` (a shorter series word is fine: the
reference `claude-ureel-1` belongs to `claude-video-tutorial`); the LinkedIn cut is `<main>-li-<n>`. Fill:

| File | Field | What |
| --- | --- | --- |
| cutdown.json | `master` | the finished render (`F:/Video Create Renders/<main>/<stamp>/<main>.mp4`) |
| | `bed`, `faces`, `faceMode` | as reel-cutdown §2 (`faceMode` "full": his face fills 9:16) |
| | `segments` | `[{from, to, face?, mute?, speed?}]` in master seconds, cut on WORD boundaries read from master.words.json |
| | `tail` | 5.5 with a cliff, else 3 |
| captions.json | — | the one line of §1 |
| build-page.mjs | `profile` | `"universal-reel"` (do not remove) |
| | `tag`, `hook` | series tag; hook ≤ 30 characters reads at 50 px, longer at 44 px |
| | `chips` | ONE chip (or chip + meter/dots) per group: the text column is 692 px; a chain of 3 → 3 groups with `arrow(56)` in front |
| | `jumps`, `pushes`, `pans` | until the build prints "no still stretch over 3 s"; jumps snap to spoken words: `snap(t)` |
| | `cta` | `["পুরো ভিডিও: <em style=\"white-space:nowrap\">ধাপে ধাপে</em> ৮ মিনিট", icon("circle-user", 40) + "আমার প্রোফাইলে দেখুন"]` — platform words are refused |

Then, in order:
```
node tools/cutdown/cut.mjs projects/<name>                 # stops first if a cut clips a word (boundaries.mjs): move it to the pause it names
node projects/<name>/build-page.mjs          # prints the text column and the pacing; WARN lines = fix them
node tools/cutdown/mix.mjs projects/<name>
cd projects/<name> && node ../../tools/design-lint.mjs . && hyperframes check     # 0 errors
hyperframes snapshot . --at <every 3–4 s + morphs + cliff + end card> --no-end --describe false -o "<work>/snap"   # LOOK
node tools/release/cover.mjs projects/<name>   # cover.jpg at 1080×1920; checks the 3:4 grid and 4:5 feed crops
node tools/preflight.mjs projects/<name>       # over 60 s
node tools/finish.mjs projects/<name> --out="F:/Video Create Renders/<main>/universal/<name>"   # detached; ~12 min per minute
node tools/release/spec-check.mjs "<render>.mp4" --for=universal-reel     # no FAIL
node tools/contact-sheet.mjs "<render>.mp4" --every=1                      # read every tile
```

## 3. Copy and the release folder

- RELEASE-COPY.md: post-copy §6 (tagged blocks: `universal-reel`, `first-comment`, `x-reply`, `youtube-title`,
  `youtube-description`, `youtube-tags`, `youtube-pinned`, `facebook-post`, `x-post`, `linkedin-post`). The heading
  of each item's section must contain the text release.json names in its `copy` field ("Reel ১", "০. পুরো ভিডিও").
- release.json (copy `projects/claude-video-tutorial/release.json`):

| Field | Needed | What |
| --- | --- | --- |
| `series`, `out`, `copy` | yes | the main project's name; the release folder (`F:/Video Create Renders/<main>/release`); the copy file |
| `xMain` / `linkedinMain` | no | the heading text of the X post / the full-video LinkedIn post in the copy file |
| `notes` | no | Bengali lines printed under "মনে রাখবেন" in RELEASE.md: claims left out of the copy, open questions |
| `items[].id`, `bn`, `copy` | yes | short id (`main`, `reel-1`), Bengali name, the heading text of its section in the copy file |
| `items[].profile` / `profiles` | yes | `universal-reel`, `linkedin-clip`, or for the main video `["youtube-main","facebook-main","linkedin-full"]` |
| `items[].file` | yes | the render's absolute path; a missing file is listed as pending |
| `items[].make` | when pending | what makes it (shown in "যা এখনো বাকি") |
| `items[].srt`, `thumb` | main, if any | the .srt base path (without `.bn.srt`); the thumbnail — without them RELEASE.md says nothing about subtitles |
| `items[].cover`, `project` | cuts | `cover.mjs`'s cover.jpg; the project folder (for people reading the json) |

  Items in order: the main video first, then the Reels in POSTING order, then the LinkedIn cut. Each item needs its
  own tagged blocks under its heading: main → `youtube-title`, `youtube-description`, `youtube-tags`,
  `youtube-pinned`, `facebook-post`, `first-comment`; a universal Reel → `universal-reel`, `first-comment`,
  `x-reply`, `youtube-title`; the LinkedIn cut → `linkedin-post` (+ an optional `first-comment`).
- `pack.mjs` hard-links files into `<out>/1-YouTube … 5-LinkedIn` (same drive: no space; another drive: one copy,
  the rest link to it) and writes RELEASE.md: the check table, the posting order (full video first; then one Reel a
  day on all four; LinkedIn cut the next day or later), per platform the file, the text in a fence, the link place,
  the settings (Shorts Related video, SRT uploads), the pending list and the WARNs.

## 4. Guards (what stops a mistake before it reaches him)

| Root (§0i) | Guard | Where |
| --- | --- | --- |
| জায়গা Space | text outside the platforms' safe box (x 65–886, y 288–1248) = ERROR; > 3 text zones = WARN | design-lint `safe_zone`, `text_zones` |
| উৎস Source | a file a platform can refuse (length, size, fps, codec, aspect) = FAIL | spec-check (platforms.json, sources + dates) |
| সময় Time | a still stretch > 3 s (LinkedIn 4 s) = WARN; captions/SRT timing checks | page.mjs build, srt-export |
| অবস্থা State | linear easing on a visible move = refused; header fades under the cliff | page.mjs build |
| প্রমাণ Proof | platform words in a universal CTA, engagement bait on LinkedIn = refused; copy rules | page.mjs, copy-check |
| উৎস Source | a cloned voice (release.json `"voice": "clone"`, set whenever tools/clone made the voice) puts the platform AI-disclosure line first under "মনে রাখবেন" in RELEASE.md (YouTube synthetic toggle, Meta AI label) | pack.mjs |

## 5. Traps (each cost a run on 2026-10-30)

- `hyperframes` is a .cmd: run it through the shell with every path quoted (paths here have spaces). Always
  `--describe false` on snapshots (otherwise frames go to Gemini when a key is set).
- Changing tools/cutdown/page.mjs: rebuild claude-reel-1..4 and claude-ig-1..2 and `cmp` their index.html + sfx.json
  with a backup — old pages must stay byte-identical.
- Film grain is off (`grain` opts in): on this dark design it vanished after a platform-like encode.
- A raw ASR stretch can hide a claim he would not make ("Claude Max-এর আনলিমিটেড পাওয়ার") or a sentence longer than
  the PLAN's summary (his closing CTA is 11 s, not 3.5 s): cut on the WORDS in master.words.json, never on the PLAN's
  paraphrase.
- Known render WARNs (fix in the finish encode when rendering for release): an AAC edit list (`-use_editlist 0`),
  YouTube's bitrate floor (1080p30 ≥ 8 Mbps, 60 fps ≥ 12 Mbps), keyframes every 8.3 s (Facebook API asks 2–5 s).
  A main video rendered before the release system keeps them: they are WARNs (platforms re-encode anyway), not a
  reason to re-render; a re-encode step does not exist yet (to come with the first release render).
- A main video of 140 s or less also goes to X natively: pack puts it in 4-X and RELEASE.md says so (Sonnet trial,
  claude-decision-ad 91.5 s); longer ones go to X as text + a reply link.

## 6. After delivery

LESSONS.md row per piece of his feedback; new traps here; `docs/system-log.md` line; commit with his OK.
