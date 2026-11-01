---
name: tools-reel
description: Make a vertical "N tools" Reel on its own in the D:\Video Create workspace from a CONTEXT (which tools / topic) plus a voice-over and music - a hook, one animated dark-UI scene per tool with a live terminal "installing" each one, word-by-word captions, hit-stop sound design and a comment-keyword CTA; 9:16 master + 1:1, -14 LUFS. The look is fixed in code (tools/reel); the model only fills reel.json and runs commands, so a mid-size model at medium effort is enough. Use when the user types /tools-reel, or says "5 tools reel", "top N tools for X", "tools list video", or hands over a tool list with a voice and BGM. Screen recordings -> screen-promo; his own talking footage -> zero-cost-video-editor / episode-edit; any other video -> hyperframes.
---

# tools-reel: fill one JSON file, run the commands

Everything visual and audible is already decided in `tools/reel/` (verified 2026-10-29 on `projects/tools-reel-demo`):
layout in the Reels safe area, colours, captions, terminal, mascot, six scene types, every sound, the mix, the
plan. **Your job is only:** the script, the facts, one `reel.json`, the commands below, and looking at the pictures.
Proven with a Sonnet agent the same day: from SKILL.md alone, a new 3-tool reel up to the snapshots in 22 tool calls
(~8 min), with 0 engine errors. The gaps it hit are now written into §1, §3 and §5.
Never edit `index.html` by hand (it is regenerated). A layout bug is fixed in `tools/reel/*.mjs`, once, for every
future video. CLAUDE.md rules still hold: simple Bengali to the user, the plan gate, no publishing.

## 0. The contract

He gives a CONTEXT (the tools) and a VOICE (+ BGM). He is asked **one thing: the plan OK**. Never ask about colours,
fonts, scenes, sounds or pacing. A fact you cannot verify is dropped, never invented.
His copy-paste pack (form, AI Studio voice settings, Lyria BGM prompt): `PROMPT-PACK-tools-reel.md`.

## 1. Set up (1 command)

```
node tools/new-video.mjs <name> --kind=tools-reel
```
It also puts a **working 5-tool `reel.json`** (the example) and a stub PLAN.md in the project: rewrite reel.json for
his tools (§3); never fill PLAN.md by hand, `build.mjs --plan` writes it (§4).
Copy his voice into `projects/<name>/assets/voice/` (any of wav/mp3/m4a) and his BGM into `assets/music/`.
**No voice yet?** Write the script (§2), give him the pack's §৩ TTS settings with the script to paste, and stop.
**No BGM?** Give him the pack's §৪ Lyria prompt. The engine also builds without music (draft only).
**Test or fallback voice** (only for a test, or when he asks for an AI voice): Kokoro, offline, ~75 s for 45 s of speech:
`hyperframes tts "<the whole script>" --voice am_michael --speed 1.35 -o projects/<name>/assets/voice/voice.wav`

## 2. The script (skip if his voice already exists: then the script is what the voice says)

- Hook ≤ 4 s: "Don't {build / start} with {platform} until you've installed these {N} free tools."
- Per tool, 25-40 words: `intro` "The {first…fifth} is {Name}[, from {maker}]." then `body` "It lets {platform} {does X}, so {the outcome the viewer wants}." + an optional 3-5 word punchline. The last tool starts "And the fifth is…".
- CTA: "Comment {KEYWORD}, and I'll send you one link with all {N}."
- Plain words, second person, no hype ("incredible", "game-changing"). ≤ 1 number per tool, and only with a source.
- 3 tools ≈ 30 s, 5 ≈ 47-58 s, 7 ≈ 75 s. The voice should run ≥ 3.2 words/s (the reference: 3.58).

## 3. reel.json (copy `reel.example.json` from this folder: it is a verified, working file)

`intro`, `body`, `hook.line` and `cta.line` must be **exactly what the voice says**, in order (the engine aligns
them to the voice; < 85 % match stops it). Spell tool names the way they should appear on screen.

| Field | What to put |
| --- | --- |
| `title`, `goal` | the video's name (plan heading); one Bengali line: what the viewer learns and does |
| `lang`, `platform` | `"en"` (default) or `"bn"`; the platform the tools are for (`"Claude Code"`, used in the default goal) |
| `voice`, `voiceLabel` | path inside the project (`assets/voice/voice.wav`); a Bengali label for the plan ("AI Studio TTS, Sadaltager") |
| `music.file`, `music.from` | `assets/music/bgm.mp3`; seconds into the track to start (put a drop on the first card) |
| `project` | the folder name shown in the terminal title (`claude — ~/<project>`) |
| `handle`, `keyword` | his handle (else `"@yourhandle"`, which becomes a plan question) and the comment word (`"TOOLS"`) |
| `hook.line`, `hook.banner`, `hook.on` | the first sentence; 2 strings `["Don't build yet", "0 of 5 tools installed"]`; the hook word the banner lands on |
| `tools[].name` | ≤ 24 chars, spelled as on screen; `mono` (optional) 2 badge letters, else the engine picks unique ones |
| `tools[].maker`, `stat` | `maker` ≤ 36 ("from Upstash"); `stat` ≤ 32, only with a `facts[]` entry |
| `tools[].install`, `result` | the terminal lines, ≤ 40 chars. `install` = a REAL command from the tool's docs; leave it out if unsure, then the terminal shows only `✓ <result>` |
| `tools[].intro`, `body` | the spoken lines (§2), exactly as voiced |
| `tools[].scene` | one archetype from the table below. Every timing word (`on`, `linkOn`, `fixOn`, `countOn`) must be a word of THAT tool's `body`, and they must come in the body's order |
| `cta.line`, `cta.dm` | the last sentence; the DM card's heading (`"All 5 tools in one link:"`) |
| `emphasis` (optional) | extra caption words to box (tool names, numbers and the keyword are boxed already) |
| `facts[]` | `{ "claim": "<tool name> has 60k GitHub stars", "value": "60k", "source": "<url>", "checked": "<date>" }` |
| `questions[]` | only questions he must answer for THIS video. plan-check also lists STYLE.md's open questions: ignore them unless they change this video |

Counts inside a scene (rows `to`, the dial's `from`/`to`, the counter) are the demo UI, not claims, so they need no
source. Claims about the real tool (stars, prices, "saves 10 hours") do.

**Pick the scene by what the tool does** (exact shapes are printed by `--check` when a field is wrong):

| The tool … | `type` | fill |
| --- | --- | --- |
| reads / fetches from many places (web, APIs, platforms) | `hub` | `nodes` 3-4 `{label ≤ 12, on, icon}`, optional `chip {text ≤ 24, on}`, `proof {text ≤ 24, on, tone: "good"/"bad"}` |
| runs steps / a workflow / many skills | `pipeline` | `steps` 3-8 `{label ≤ 12, on}`, `proof {text ≤ 26, on}` |
| supplies docs / context / memory to the model | `fix` | `sources` 2-4 (≤ 10), `file` ≤ 16, `bad` 2-4 old code lines (≤ 28), `fixOn`, `proof {text ≤ 16}` |
| tests or debugs a running app / browser | `dial` | `url` ≤ 22, `app` ≤ 12, `errors` 1-3 (≤ 30), `from`, `to` (0-100), `label`, `fixOn`, `proof {text ≤ 26, on}` |
| analyses, traces, scans, checks flows | `trace` | `inputs` 2-4 (≤ 10), `rows` 2-4 `{label ≤ 10, to, unit}`, `result` ≤ 18, `proof {text ≤ 18, on}`, optional `linkOn` |
| saves money or time | `counter` | `from`, `to`, `max`, `pre`/`post`, `label` ≤ 28, `countOn`, `proof {text ≤ 26}` |

List items may be plain strings (`"Login"`) or `{ "label": "Login", "on": "login" }`; without `on`, the beat is spread
by position. Keep labels short: a long one fails `--check` with the limit in the message.

Icons are Lucide names (`assets/icons/lucide/icons/*.svg`; no brand logos exist: GitHub, YouTube, Chrome are missing,
the engine draws a letter badge). Use two different types for neighbouring tools when you can.

## 4. Build and the plan gate

```
node tools/reel/build.mjs projects/<name> --check       # every problem in one go; fix reel.json until ✓
node tools/reel/build.mjs projects/<name> --plan        # transcribes (small model), aligns, page, mix, PLAN.md (~40 s)
node tools/plan-check.mjs projects/<name>               # must say: No errors or warnings
```
Every `WARN … word "X" is not in its body line` means a scene beat fell back to an estimated time: fix that `on`.
Show him PLAN.md's goal, hook, shot table, what is needed and the questions, in simple Bengali. **Stop until he says OK.**
A change he asks for goes into reel.json, then `--plan=force`, then plan-check again.

## 5. After the OK: check, look, render

```
cd projects/<name> && hyperframes check && cd ../..      # must end "Check passed" (one file-size warning is normal)
node tools/design-lint.mjs projects/<name>               # must be 0 errors, 0 warnings
cd projects/<name> && hyperframes snapshot --at "t1,t2,…" --no-end --describe false && cd ../..
```
In PowerShell the time list MUST be in quotes: unquoted, only the first time is captured and it still says success.
Snapshot times: about 10, each 0.6-1 s after a card or a proof starts (the times are the `rows` in
`build/timeline.json`; exactly at a row time the element is still animating in). Read
`projects/<name>/snapshots/contact-sheet*.jpg` and check that nothing overlaps, sticks out of the frame, or leaves the
stage empty. Then render detached (it dies with the session otherwise):
```
Start-Process cmd.exe -ArgumentList "/c cd /d ""D:\Video Create"" && node tools/finish.mjs projects/<name> --quality=high --formats=1x1 ""--frames-cache=C:/Users/Zubayer Nibir/VideoWork/<name>/frames-cache"" > ""C:\Users\Zubayer Nibir\VideoWork\<name>\finish.log"" 2>&1" -WindowStyle Hidden -PassThru
```
Wait on the PID in a background Bash (`until ! tasklist //FI "PID eq <pid>" | grep -q <pid>; do sleep 5; done`), then
read the log once without the `Render:trace|[INFO]|Streaming frame` lines. QC must PASS. Then
`node tools/contact-sheet.mjs <render>` (one sheet) and `--cols=4 --from=<a> --to=<b>` where names and numbers show.
Deliver in Bengali: where the files are (`renders/<name>/<date>/`), what was checked, what he must decide.

## 6. Rules the engine cannot check for you

- Numbers on screen come from `facts[]` with a URL. Demo apps must look fictional. No fake reviews (STYLE §১৩).
- No Claude logo, no real faces, no personal data. The mascot is the engine's own pixel bot.
- His handle goes in the DM card, never the reference creator's (`assets/refs/ref-01.mp4` is someone else's reel).
- Lyria music: say once that its terms for paid ads are unchecked; Pixabay is the verified safe source.

## 7. Traps (each cost a run)

- `hyperframes check` errors that come from the engine (overlap, clipping, contrast) are engine bugs: fix `tools/reel/`,
  rebuild, and note it here. Already fixed: blurred caption words and CSS-filter glows (≥ 40 "heavy overlay" elements
  make HyperFrames capture black frames), terminal lines clipped by line-height 1, a scene fading out while the next
  fades in (two texts at once), an empty stage between a body's end and the next card, the last proof hidden by the CTA.
- PowerShell 5.1 breaks a commit message with `"quotes"` in it: write it to a file and `git commit -F <file>`.
- The Edit tool can turn a mixed-line-ending file into all CRLF (START-HERE.md): check `git diff --stat` before committing.
- Check the HF cache before using `--model=turbo`: it downloaded 1.5 GB on 2026-10-29. The engine uses `small`.
- Python only via `tools/pyenv/Scripts/python.exe -I`; never upgrade HyperFrames or its skills.

## 8. After the video (CLAUDE.md §0f)

One LESSONS.md row per piece of his feedback. A fix that every reel needs goes into `tools/reel/`, a new trap into §7.
Commit the engine and skill with his OK (stage whole files; other sessions' edits are in the tree).
The measured reference (beat sheet, colours, sound) is `reference-ref01.md`: read it only to change the look itself.

## 9. Series looks REEL2–REEL6 (`tools/reel/series.mjs`, made 2026-11-01 for the GitHub series episodes 1–5)

A series episode (`"style": "REEL2"…"REEL6"` in reel.json) is built by `series.mjs`, not build.mjs. Same commands
(`--check`, `--plan=force`, `--no-mix`), same plan gate, same render line. What every look shares: the universal-reel
safe box (the Reel IS the platform file: `finish.mjs … --release --formats=1x1`), the badge "৫টা GitHub রিপো · পর্ব N"
with five dots, word captions at ~60 %, per tool "name big and centred → settles into a header → 2–4 features on their
words → proof", and the end card (five repo cards 3 + 2, the inbox keyword typed into a message box).

| Look | World | Extra reel.json fields |
| --- | --- | --- |
| REEL2 পকেট গ্লাস | glass phone + app icons that jump out into glass cards | `hook.title`, `hook.sub`, `hook.on` |
| REEL3 স্পিডরান | speed gauge + whip pans + road | `hook.title`, `hook.sub`, `hook.on` |
| REEL4 ভল্ট | dial padlocks + shattering password + steel plates | `hook.secret`, `hook.accounts`, `hook.crack`, `hook.lose`, `hook.lostText` |
| REEL5 ফিল্ম রিল | monitor + timeline clips + playhead + 3-2-1 | `tools[].step` (≤ 10), `hook.strike`, `hook.free`, `hook.neg`, `hook.on` |
| REEL6 অফলাইন রাত | night sky + constellation + offline chat | `hook.off`, `hook.reply`, `hook.money`, `hook.ask`, `hook.answer`, `hook.cost` |

Per tool: `features` 2–4 `{label ≤ 16, on, icon (Lucide)}`, `proof {text ≤ 22, on, tone: good|warn}`, optional
`stat {text ≤ 18, on}` (a number needs a `facts[]` source), `maker` ≤ 30, `short` (end-card name). Data of the five
episodes: `projects/gh-ep01-phone … gh-ep05-ai/reel.json`. A new look = one file in `tools/reel/looks/` with the same
exports (colors, layout, sfx, plan texts, css, world, stageBack, hook, hookOut, enter, exit, cta).

Traps that cost a run on 2026-11-01:
- **Gemini TTS voice + Bengali ASR**: English repo names come back transliterated (Win11Debloat → উইন ইলেভেন ডিব্লোট),
  so alignment is ~77–80 %: set `"minMatch": 0.75` in reel.json. A name the ASR garbles leaves words squeezed to 0 s;
  series.mjs re-spreads such runs between their good neighbours. Make the voice with
  `node tools/clone/gemini.mjs say <script.txt> <out.wav> --voice=Sadaltager` WITHOUT `--verify` (it re-transcribes every
  block, ~10 min a voice); the engine's alignment check is the verification.
- **Bengali transcription is slow** (~10 min for 50 s with the `bengali` model; two at once both slow down): start the
  voices' transcriptions in the background first, write the looks/data meanwhile.
- **BGM without him**: `node tools/lyria.mjs "<series BGM prompt>" <project>/assets/music/bgm.mp3 --min=60` ($0.08 a song,
  his paid key; ~25 s). Say once that Lyria's terms for paid ads are unchecked.
- A header grown with `scale` on a full-width flex row overflowed its card (card_straddle, safe_zone): the header now
  hugs its text and its growth is estimated from the text length (`look.layout {inner, mono, nm}`).
- Initial states go through `ctx.pre()` (gsap.set before the timeline): a `tl.set(…, 0)` does not render at frame 0.
- LinkedIn: the 4:5 cut is a crop of the Reel's safe box, `node tools/release/li-crop.mjs <reel.mp4> <out.mp4>` (30 s).

### 9b. Clear purpose, how-to, message me (his brief 2026-11-01) + looks REEL7–REEL10, REEL1 on the series engine

His words: the viewer must be crystal clear what the video is for, how to use each tool, and must message him. So a
series episode now has (all optional fields, all used on episodes 1–10):
- `promise` {line, kicker, title ≤ 18, sub ≤ 34, rows ≤ 3 [{label ≤ 24, on, icon}]}: spoken right after the hook; the
  look's hook leaves and the look's own card shows "এই ভিডিওতে / ৫টা ফ্রি অ্যাপ / sub", rows lit on their words.
- per tool `how` {line, steps 2–3 [{label ≤ 22, on}]}: features + proof step aside, "কীভাবে চালাবেন" (or `howTitle`,
  e.g. "কীভাবে শুরু করবেন") with numbered steps on their words. Take the steps from INBOX-AND-COMMUNITY.md so the
  video and the inbox guide say the same thing.
- the inbox chip "ইনবক্সে <KEYWORD>" top right (one `#top` band with the badge, or design-lint text_zones warns),
  from the promise's inbox row to the end card; it pulses on every spoken "ইনবক্স…".
- `cta` {line, heading, ask, steps (exactly 3: পেজে যান · Message চাপুন · লিখুন KW), sent}: phase A the 5 cards
  (≥ 2.4 s), phase B the 3 numbered steps on their words, the box, the keyword typed and sent.
- Order of spoken lines: `series-lines.mjs` (hook · promise · intro/body/how × N · cta). Looks must use
  `ctx.LN.tools[k].intro` etc., never `1 + 2 * k` (REEL6's twinkle used it; fixed).

| Look | World | Extra reel.json fields |
| --- | --- | --- |
| REEL7 কাগজের টেবিল | walnut desk; sheets slide in with washi tape, pen underlines, rubber-stamp proof, sheets pile up | `hook.bill` [{label, price}], `hook.total`, `hook.stamp`, `hook.title`, `hook.on` |
| REEL8 জ্ঞানের সিঁড়ি | night library rising; book stairs "লেভেল ১–৫", a cap token hops up; cards turn like pages (3D) | `hook.cover`, `hook.title`, `hook.on`; `howTitle` |
| REEL9 আলপনা | maroon earth, a rice-paste alpona that draws itself and turns; 5 lotus petals fill; "অ" writes itself | `hook.letter`, `hook.code` |
| REEL10 ব্লুপ্রিন্ট | blueprint grid; 5 machine nodes on wires, a signal races to each; messy task chips snap into rows | `hook.chips`, `hook.on` |
| REEL1 টার্মিনাল (series) | dark UI; card + terminal that types each repo's install, bar, green tick, counter | `tools[].cmd` ≤ 40, `hook.cmd`, `hook.on` |

Voice in HIS cloned voice (approved by him in chat 2026-11-01, `gemini-voices.json`):
1. `node tools/reel/voice-script.mjs projects/<p> projects/<p>/assets/voice/clone/script.txt` (default merges the
   lines into ~5 requests; `--split` = 13).
2. `node tools/clone/gemini.mjs say <script> <dir>/voice.raw.wav --voice=talha-a` (~$0.02 an 80-s episode).
3. `node tools/reel/voice-fit.mjs <dir>/voice.raw.wav <dir>/voice.wav --max=80` (pauses ≤ 0.3 s, then atempo ≤ 1.10,
   pitch kept). talha-a reads ~2.3 words/s: 200 words ≈ 89 s raw ≈ 80 s fitted.
4. transcribe in chunks (series.mjs does it when words.json is missing; by hand: `tools/pyenv/Scripts/python.exe -I
   tools/episode/asr_chunks.py <voice.wav> <voice.words.json> --max-chunk 18`, ~20 min for 80 s), then `--plan=force`.
Traps that cost a run on 2026-11-01:
- **Gemini TTS quota: 100 requests a day on Tier 1** (429, "retry in 3h"). Split scripts (13 requests an episode)
  ran it out on episode 4: merge (default) = ~5 requests an episode.
- **Alignment with English UI words** ("Play Store", "Wireless debugging"): 68 % before; `align.mjs` now compares a
  Latin consonant skeleton across scripts (প্লে = Play, ওয়্যারলেস = Wireless) → 79 %.
- **Longer episodes (80 s) need longer BGM**: `node tools/music-extend.mjs <bgm> <out.wav> --min=88` (crossfade copy,
  free) for an existing song; new Lyria prompts say "90 seconds".
- **Whole-file Bengali ASR loses stretches**: it decodes 30-s windows and can stop early inside one (episode 3 lost
  ~8 s, episodes 1–2 lost 19–31 words). Chunked ASR at ≤ 18 s: 93 % alignment. series.mjs now stops on ≥ 12 script
  words in a row with no spoken match. asr_chunks.py writes words.json after EVERY chunk: wait for its "✓ N words" line.
- **A stopped background chain can keep running**: stopping the task kills the wrapper, not the bash script it
  started. Two voice chains then ran at once (both made every voice, one fit a half-written file, two ASR jobs). Before
  restarting a chain, list processes (PowerShell `Get-CimInstance Win32_Process` by command line) and stop the old one;
  a long chain takes a lock (`mkdir <lock> || exit`).
- **Over 60 s = preflight before finish.mjs.** It caught: a world element visible before its fromTo (REEL2 #floor →
  `ctx.pre`), the camera push snapping 1 → 0.975 (now a breath: ease to 0.975, settle on 1), a child scale tween
  starting after its parent's entrance (#prt, .csn: start together).
- **Check a new look before its voice exists**: `node tools/reel/dry-voice.mjs projects/<p>` then
  `series.mjs projects/<p> --voice=assets/voice/dry/voice.wav` (no --plan; never render a dry build), then
  `hyperframes check`, design-lint, snapshots.
