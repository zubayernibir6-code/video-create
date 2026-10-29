---
name: tools-reel
description: Make a vertical "N tools" Reel on its own in the D:\Video Create workspace from a CONTEXT (which tools / topic) plus a voice-over and music - a hook, one animated dark-UI scene per tool with a live terminal "installing" each one, word-by-word captions, hit-stop sound design and a comment-keyword CTA; 9:16 master + 1:1, -14 LUFS. Use when the user types /tools-reel, or says "5 tools reel", "top N tools for X", "tools list video", or hands over a tool list with a voice and BGM. The reference reel and its measurements are in reference-ref01.md next to this file. Screen recordings -> screen-promo; his own talking footage -> zero-cost-video-editor / episode-edit; any other video -> hyperframes.
---

# tools-reel: an "N tools" Reel, made on its own

Learned from the user's reference Reel `assets/refs/ref-01.mp4` (2026-10-29). **Read `reference-ref01.md` first**: the
measured beat sheet, colours, layout and sound are there. CLAUDE.md is the authority (simple Bengali to the user, one
step at a time, plan gate §0e, craft rules §0d, whole-video §0h, learn-after-every-video §0f); STYLE.md and
LESSONS.md are read before planning. This skill is the fast path for this one kind of video.

## 0. The contract (what "on its own" means)

He calls `/tools-reel`, gives a CONTEXT (what the tools are) and a VOICE (+ BGM). You produce the finished video:
script, plan, scenes, captions, sound, render, QC, 9:16 master + 1:1. He is asked for **one thing only: the plan OK
(§5)**. Never ask about colours, fonts, scene design, sounds, pacing or formats: decide them from this skill. The bar
in §9 is the minimum ("this level or more"), and a fact you cannot verify is dropped, never invented.
Pack for him (Bengali, copy-paste prompts for voice and BGM): `PROMPT-PACK-tools-reel.md` at the workspace root.

## 1. Inputs and defaults

| Input | If missing |
| --- | --- |
| Tools (3-7; name, what it does, optional proof number, install command) | names only is enough: research each on its OFFICIAL page / repo (WebSearch, WebFetch) and put the facts in CONTEXT.md |
| Topic / platform ("Claude Code") | derive it from the tools; it feeds the hook line and the terminal title |
| Language | English, like the reference (STYLE.md §১ says Bengali: this kind follows the reference; Bengali = Hind Siliguri + Baloo Da 2, captions in the page, no letter-spacing) |
| Voice | a file he gives (AI Studio TTS is his usual) · else §3 makes one (Kokoro) and tells him so |
| BGM | a file he gives · none exists in assets/music: write the Lyria prompt from the pack and wait; never use MusicGen. Draft renders without music are for checking only |
| Length | 3 tools ≈ 40 s, 5 ≈ 58 s, 7 ≈ 80 s (STYLE: 45-90 s); at 3.2-3.6 words/s |
| CTA | keyword `TOOLS`, "I'll send you one link with all N", his handle if he gave it, else a neutral `@yourhandle` placeholder that you list as a question |
| Mascot | an ORIGINAL pixel sprite (light body, so it never clashes with the five tool colours), same sprite every video; the Claude crab only if he asks, with the ads warning |

Save his message as `projects/<name>/CONTEXT.md` (verbatim) plus a **Facts** table: claim · value · source URL ·
date checked. Every number on screen (stars, price, versions, "zero API fees") comes from that table.

## 2. Set up

`node tools/new-video.mjs <name> --kind=tools-reel` makes `projects/<name>/` with PLAN.md (template), fonts (Inter,
JetBrains Mono, Hind Siliguri, Baloo Da 2), local GSAP, `assets/voice/`, `assets/music/`, `build/`, and
`assets/media` as a junction to `C:/Users/Zubayer Nibir/VideoWork/<name>/media` (D: has ~3 GB; heavy files go on C:).
Copy his voice into `assets/voice/voice.<ext>` and the BGM into `assets/music/` (plan-check looks there).

## 3. Measure (never guess times)

- Voice file given: `node tools/transcribe.mjs <voice> --lang=en --model=small` → `<voice>.words.json`
  `[{id,text,start,end}]`. `small` is right for clean TTS (WER 1.5 %; ~33 s for 22.5 s of audio); `--model=turbo` only under loud
  music (3.7x slower than real time, ~1.1 GB RAM: run it alone, RAM is ~1.5 GB free). **Display text comes from the
  SCRIPT, timing from the ASR**: align the two like `tools/episode/align.mjs` and merge tokens (ASR "Context" + "7," =
  script "Context7"). No script given? The ASR text is the script; fix tool names from CONTEXT.md.
- No voice yet: write the script (§4), then either (a) hand him the TTS brief (pack §৩) and wait, or (b) Kokoro:
  `hyperframes tts "<text>" --voice am_michael -o assets/voice/voice.wav` (verified 2026-10-29: 9 s of speech in 43 s
  incl. model load, 24 kHz mono). Pace below 3.2 words/s: speed up ≤ 1.12x with `atempo` (pitch kept).
- BGM: `node tools/music-drops.mjs <track> --map` finds the bass drops; put the first tool card on one: `from = drop − (card
  time − bed start)` (`tools/screen/promo-mix.mjs`). Rough tempo/key of any track: `node tools/ref-analyze.mjs`.
- Sound lead-ins: `tools/sfx-leads.mjs` has already written `lead_s` for every file in assets/sfx/manifest.json.

## 4. Script grammar (from the reference; in his words if he gave a script)

- **Hook ≤ 4 s:** "Don't {start / ship / build} {X} with {platform} unless you've installed these {N} tools." Other
  shapes that work: "{N} free tools that make {platform} {outcome}." Result or tension first, never a greeting.
- **Tool block, 34-40 words, 9-11 s:**
  1. "The {first|second|…} is {Name}[, from {maker}[, with over {N} stars]]." ≤ 1.5 s; the name lands on the beat.
  2. "It lets {platform} {verb phrase}, so {outcome the viewer wants}." Verb first; one clause per visual beat.
  3. Optional punchline, 3-5 words: "…and you never have to guess." / "One app, start to finish." / "Fresh docs, every time."
  Last tool starts "And the fifth is…".
- **CTA ≈ 4 s:** "{Closing proof line}. Comment {KEYWORD}, and I'll send you one link with all {N}."
- Rules: second person, plain words, ≤ 1 number per tool, no hype words ("incredible", "game-changing", STYLE §১), every
  claim checkable, tools in the order of the viewer's journey (understand → gather → build → docs → test).
- Pace check: words ÷ speech seconds ≥ 3.2 (5 tools ≈ 190-205 words for 58 s; the reference has 206).

## 5. Plan gate (the one pause)

`tools/plan/TEMPLATE.md` → `projects/<name>/PLAN.md` (a filled example in this folder: `EXAMPLE-PLAN.md`), then
`node tools/plan-check.mjs projects/<name>` until no ERROR. Shot table: one row per visual change, ≤ 3 s each (22-30
rows for 58 s). Put each line's measured start in the script (`৬. (০:২৮.৮) …`) once the voice exists; before that,
plan-check's Piper pace WARNs ("line too long") are false alarms for a 3.5 words/s voice: tell him so.
Show him in simple Bengali: goal, hook, the shot table (সময় · পর্দায় কী · ক্যাপশন · শব্দ), what is needed, every WARN
and only these questions: handle/keyword if not given · music licence if it is for paid ads (Lyria vs Pixabay) ·
facts you could not verify · mascot (original unless he wants the crab). Build and render nothing until he says OK.
If the voice or BGM is still missing, give him the pack's prompts and stop there.

## 6. Build

Start from the proven pattern, not from scratch: a Node script that writes `index.html`
(`projects/claude-decision-ad/build/{timeline,build-page,mix}.mjs`; helpers in `tools/episode/page-core.mjs`:
`icon()` (Lucide as inline SVG), `captionPages()`, `esc()`; mix in `tools/screen/promo-mix.mjs`). Load the
`hyperframes-core` skill for the composition contract and `hyperframes-animation` for GSAP; keep CLAUDE.md §0d. Do not
run `hyperframes init` or the entry skill's capture flow (CLAUDE.md §0a): new-video.mjs already made the project.

**Layout, 1080×1920** (safe area: top 14 %, bottom 35 %, the Reels button rail on the right): content box x 65-905,
y 269-1248. Captions y 285-405 (this kind follows the reference: captions at the top of the safe area because the lower
part carries the stage; STYLE §৪'s 60 % is for face videos); stage y 430-1000; terminal y 1030-1240; everything else
is empty or soft glow. Colours are in the reference doc (`#07080F`, panel `#0D121D`, five tool colours).

**Always on screen, from first frame to last (§0h):** the dot-grid background, the terminal, the caption window, the
stage light in the current tool's colour.

**Captions:** rolling window of 3 words, Inter 800-900 ≈ 56 px: the word being said white, earlier words grey, the next
blurs in; tool names, claims and the last word get an outlined box in the tool colour with four corner dots. 100 %
of the spoken words, timed from words.json; `text-wrap: balance` (CLAUDE.md §0d 13).

**Terminal:** `claude - ~/<project>` header, ≤ 4 visible lines (JetBrains Mono ≥ 26 px), per tool `❯ <install command>`
then `✓ <result>` in the tool colour; status bar "context 100%" + bar + ">> accept edits on". ✓ and ❯ are drawn as SVG
(§0d 11). Real install commands only (from CONTEXT.md); otherwise a neutral `/<name> ready`.

**Per tool (identity → mechanism → proof):** identity card 1.2-2 s (logo or monogram, name in white with the tool's
word in its colour, maker line, stat line); mechanism 4-5 s drawn from the tool's function; proof 3-4 s (a number
landing, or a before→after state). The mechanism must follow the sentence word by word: each noun the voice says
appears on that word (from words.json), at most 3 s per beat. Pick an archetype, or compose one in the same
language:

| The tool … | Archetype (reference example) |
| --- | --- |
| analyses / traces something | input chips → scan beam → rows going from "0 ?" to counted results → source panel (REA) |
| gathers from the internet | hub-and-spoke: mascot centre, 3-5 platform nodes on glowing curves, a cost chip "$0.00", a count chip (Agent Reach) |
| runs a pipeline / many skills | chips light up in order, mascot workers, a blank page becoming the finished thing (Replica) |
| supplies docs / context | sheets fly from library icons into the mascot (hat + staff); a code panel's red "N deprecated" → green "0" with the one flash (Context7) |
| tests / inspects a running app | browser mock + console errors + a quality dial 62 → 100, mascot with sword (DevTools) |
| saves money / time | big counter falling to zero, a before/after split |
| protects / secures | scan sweep over a file tree, shield, red items turning green |

Hook scene: red banner "Don't start · 0 of N tools installed" + a panel of N progress bars in the tool colours with the
names blurred (the teaser). CTA scene: comment box types the keyword → send → a DM card "All N tools in one link:" with N
chips in the tool colours → "Follow for more" → "Following". Use the user's handle, never the reference's. Logos: no
catalog exists here (`media-use resolve --type=logo` found none, fetching is untested); use text wordmarks or a
monogram badge in the tool colour, never a redrawn brand mark. Demo apps must be obviously fictional; no fake reviews
or testimonials about real products (STYLE §১৩).

**Sound (design it as you place the visuals):** `lead_s` is subtracted by `buildMix`, so cue `t` = visual hit.

| Event | Sound |
| --- | --- |
| identity card lands | `impact-bass-1` (dur 0.6) + `whoosh-short` 0.35 s before |
| tool → tool | `whoosh-cinematic`, then a **hit-stop**: bed envelope to `null` (silence) for 0.25-0.4 s right after the name line, then `impact-bass-2` on the next card |
| chip / node appears | `pop` or `click-soft` 0.3 |
| counter running | `typing` ~0.22 |
| proof chip lands | `ping` or `chime` |
| red state / green state | `error` or `glitch-3` / `success` or `sparkle` |
| the one full-frame flash | `boom` + `glitch-1` |
| terminal line | `key-press` while typing, `click` on ✓ |
| CTA: send / DM / end | `click` / `notification` / `chime` |

Mix with `buildMix`: voice with `eq: true`, BGM bed at −19 dB, ducked a further 4-5 dB under the voice and dipped to
`null` in hit-stops (derive both envelopes from words.json), cues from the table. `finish.mjs` does the final −14 LUFS.
Overlapping cues need different `data-track-index` lanes (§0d 7). No still + silence ≥ 1.5 s (§0d 8).

## 7. Check, render, review

1. `hyperframes check` → `hyperframes snapshot --at <hits> --no-end --describe false` → `node tools/design-lint.mjs .`
   (small text, orphan words, font fallbacks, card straddles, misaligned peers, frame breach). It does not know the
   Reels safe area: check that by eye on a snapshot with temporary guide lines at y 269 and 1248 and x 905 (remove them
   before the render). Fix, repeat.
2. Render detached (it dies with the session otherwise), heavy cache on C:, one job at a time (RAM ~1.5 GB):
   `Start-Process cmd.exe "/c cd /d ""D:\Video Create"" && node tools/finish.mjs projects/<name> --quality=high --formats=1x1 ""--frames-cache=C:/Users/Zubayer Nibir/VideoWork/<name>/frames-cache"" > <log> 2>&1" -WindowStyle Hidden`
   then wait on the PID and read the log summary once (never tail it: one line per frame). ~58 s ≈ 5 min.
   `--formats=1x1`: the 9:16 master is always made and finish adds only the listed extra shapes (its default list
   would also add 16:9 and 4:5).
   CSS `perspective` switches the whole render to slower screenshot capture (screen-promo §5).
3. `node tools/contact-sheet.mjs <render> --every=0.5` and look at every sheet; `--cols=4 --from --to` to proofread the
   captions, tool names and numbers against CONTEXT.md; check the held end of each tool block at full size.
4. Deliver in simple Bengali: where the files are (`renders/<name>/<date>/`), what was checked, what is untested, what
   he must decide. Never publish or post.

## 8. Traps that will cost a run

- ASR spells names its own way ("Context 7" for Context7, "DevTools" may split): captions use the script, not the ASR text.
- `ametadata=file=` and other filter options break on a path with spaces: write to a relative path.
- A PowerShell command that does `Set-Location` changes the session's folder: use absolute paths.
- `riser.mp3` builds 0-4.12 s and stops dead; `boom` rings 1.2 s; `impact-bass-1` is 2.1 s (trim); mono voice doubled to
  stereo reads +3 LU. More traps: screen-promo §5 and CLAUDE.md §0d.
- Python only via `tools/pyenv/Scripts/python.exe -I`; never upgrade HyperFrames or its skills; the HF cache holds both
  English ASR models (small 0.46 GB since 2026-10-25; turbo 1.5 GB, downloaded 2026-10-29 during the first reference
  analysis), so nothing is downloaded again. Check the cache before asking a tool for a model that may be missing.

## 9. Quality bar (all of it, measured, before delivery)

1080×1920 · 30 fps · −14 LUFS ±1, true peak ≤ −1.5 · hook shows the tension/result within 2 s · something visibly changes
at least every 3 s · every spoken word captioned, each within 1 frame of its time · all read text ≥ 28 px, labels ≥ 24 px,
decorative microtext ≥ 18 px and never the only carrier of a fact · nothing readable in the top 14 %, bottom 35 % or the
right rail · one colour per tool all the way through · max 2 font families · a sound on every scene change and UI event,
hit-stops deliberate · numbers sourced · no real faces, no Claude logo, no personal data · credits for Piper/Noto if used.

## 10. After the video (do not skip: this is what makes the next one cheaper, CLAUDE.md §0f)

LESSONS.md row per piece of his feedback · the first video also **extracts the kit** into `tools/reel/` (caption window,
terminal, identity card, chips, mascot sprite + props, stage light, hit-stop mix) and the project's build files shrink to
data; prove it by diffing the rebuilt HTML and null-testing the WAV · new traps go in §8 · commit tools + skill with his OK
(stage whole files; other sessions' edits are in the tree).
