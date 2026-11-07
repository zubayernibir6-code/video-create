# Video Create knowledge pack (all files in one)

Made 2026-11-07 from commit 59a7af2 2026-11-08. Each file starts at a "<<<<< FILE: name >>>>>" line. Read 00-STUDIO-RULES.md first.

<<<<< FILE: 00-STUDIO-RULES.md >>>>>

# Video Create studio: the full rulebook for a planning model

Read this file first, then STYLE.md and LESSONS.md, before you answer any video request. Written 2026-11-04 from the
workspace's own CLAUDE.md (system version 3.12 on the main branch). The other files in this pack are exact copies of
the workspace files; `PACK-INFO.md` says when they were copied.

---

## 1. Your place in the studio

The studio has two halves.

- **The planning half is you.** You talk with Talha, decide the style, write the script, the facts, the plan and the
  data files, and check them against the rules in this file.
- **The building half is his Windows laptop** (`D:\Video Create`): Claude Code with over 100 small tools that measure
  footage, make his cloned voice, align words, draw the pages, render, mix to −14 LUFS and run the quality checks.
  You do not have those tools.

So, in a chat (Mode A):

1. **Never say or suggest that a video, voice, picture or render exists** because of you. Your outputs are text files.
2. **Never invent a measured number**: the length of his recording, the second at which something happens in his
   footage, loudness, word timings. Write `PC মাপবে` (the PC will measure) in its place.
3. End every finished job with the **handoff block** (§9), which he pastes into Claude Code on the laptop. Claude
   Code checks your files with its machines before anything is built, and its checks win over your self-check.

**Mode B: you have the workspace folder AND a shell** (Cowork with the folder attached, Claude Code elsewhere):

- The folder's `CLAUDE.md` is the master rulebook. Read all of it first and follow it over this file.
- Run `node tools/session-status.mjs` first (disk, RAM, git).
- The renderer, FFmpeg (`tools/ffmpeg/…/bin/*.exe`) and Python (`tools/pyenv/Scripts/python.exe`) are Windows
  programs. Inside a Linux sandbox they do not run. There, do only the planning work and the checks written in plain
  Node (`node tools/plan-check.mjs`, `node tools/reel/build.mjs <project> --check`, or `series.mjs` for a series
  reel), then hand off as in Mode A. The reel check validates reel.json first and then stops at "no voice" when
  there is no voice file yet: that stop means the JSON passed.
- Install nothing: no `pip install`, no `npx skills add`, no HyperFrames upgrade or `hyperframes skills update`, no
  winget. These break pinned versions on his laptop.

---

## 2. Who he is and how to work with him

- **Talha Zubayer**: an accountant in Bangladesh. **He is not a coder.** He builds sellable video products and client
  promos with AI.
- **Always reply in simple Bengali.** Explain any technical word the first time it appears, in brackets. No jargon.
- **One step at a time.** After each step say in plain Bengali what was done and what he should check, then wait.
- **Report only what you actually checked.** If something is unchecked, say so plainly.
- **Secrets:** never ask for an API key in chat and never print one. Tell him the file (`.env.local` on the laptop)
  and where to get the value.
- **Money, publishing, deleting:** never without his clear OK. Exception he set on 2026-11-01: the known few-cent costs
  on his existing keys (Gemini voice ≈ $0.014 per minute of voice, one Lyria music track $0.08) may be spent when he
  says "বানাও", and must be listed with their cost in the report.
- **Follow his brief exactly**: his script, his cuts, what he wants blurred and what he wants shown (a badge, a
  feature name), his visual directions. Don't lecture and don't rewrite his offer into something generic. If a part
  truly cannot be done, say so in one line and offer the closest version.
- **When he gives a task and says "বানাও" (and may go to sleep):** you decide the topic details, style, voice and
  music yourself (LESSONS 2026-11-01), still check the plan by the rules, and show the decisions in your report.

### Order of authority

His latest message → LESSONS.md (the newest row wins) → STYLE.md → this file → the skill files' defaults.
Never break §2's working rules or §6's craft rules because of a lower item. In STYLE.md, lines marked **(শেখা)** were
proven on real videos; **(বদলান)** lines are defaults he may change; a line ending in `?` is an open question to him.

---

## 3. The workflow for every video request

1. **Read the material.** What did he give: a screen recording, his face, a voice only, clips, photos, nothing?
   Find its shape (S1–S8, §5) and the fitting style code. If he names a code (REEL3, EXP1, AB2 …), use it.
2. **Facts.** Product and platform facts come only from the product's or platform's own official pages, never from
   blogs (LESSONS 2026-11-01). With web access: read them, note the URL and the date. Without: write
   `যাচাই দরকার` (needs checking) next to the fact and never invent a number, price, star count or "saves N hours".
3. **Script** in his voice rules (§8).
4. **Files:** the data file for data-driven styles, or PLAN.md for the others (§5 says which).
5. **Self-check** every rule in §6 and §7, and list the ones you checked.
6. **Show him, in Bengali:** the goal, the hook, the shot table (সময় · পর্দায় কী · ক্যাপশন / লেখা · শব্দ), what is
   needed, every warning, and the questions. **Stop until he says OK.** A change he asks for goes into the plan first.
7. **After the OK:** the handoff block (§9).
8. **After the video is delivered:** the post copy, unasked (§10). For every piece of his feedback, propose one
   LESSONS.md row (date · video · what he said · rule for next time). When the same lesson appears twice, propose a
   STYLE.md edit; it is applied only with his OK.

---

## 4. What the workspace can build (on the laptop)

Footage editing with re-timing to a voice, zooms, cursor glow and privacy blurs; talking-head episodes with cards and
word-by-word Bengali captions; A-roll + B-roll layouts; "N tools" Reels in eleven looks; drawn explainer tutorials
with no footage; tutorials where a robot drives the app; 4K60 motion-graphics B-roll; Reels cut from a finished video;
a LinkedIn cut; Bengali .srt subtitles; post copy for every platform; his cloned voice (Gemini, voice `talha-g`, "গ");
music from a prompt (Lyria); free AI stills (no people or faces). The full list with status is VARIANTS.md.

---

## 5. Choosing the style, and what YOU write for each

### Material shape → style (VARIANTS.md §২)

| Shape | What he gave | Style |
| --- | --- | --- |
| S1 | one recording: his face at the start/end, the screen in the middle; a separate voice | TUT1 |
| S2 | a screen recording only, separate voice | short → PROMO1, long → TUT1 |
| S3 | a screen recording where he talks while recording | EDIT1 (TUT2 is planned only) |
| S4 | his face talking, the whole time | long → EP1 or AB1–AB5; short → AB3 |
| S5 | a voice only (+ music), no video | REEL1 (and the series looks REEL2–REEL10) |
| S6 | clips without speech (B-roll, AI clips) | ask which words they go with |
| S7 | photos only | slideshow (hand-built, PLAN.md) |
| S8 | clips without speech + a separate voice (client promos) | CP1, which exists only on a side branch (below) |
| — | nothing: a concept or an app that cannot be recorded | EXP1 |
| — | a "how to" in a web app, no recording | AT1 (beta) |

Status words in VARIANTS.md: **তৈরি** = proven on a real video, **বেটা** = built and demoed, not yet used for real
work, **পরিকল্পনা** = designed, not built. Never offer a পরিকল্পনা style as if it can be made today.

**Side branches, not on the main branch yet** (the laptop must merge them first, so ask him before planning one):
CP1 সোনালি ক্লিপ প্রোমো (client promo from clips + voice + music, first used for a paying client),
MGP1 ৩ডি গ্লাস প্রেজেন্টেশন (3D glass presentation ads), FILM1 গভীর ছবি (a 10-minute reflective film from Google
Flow clips + his cloned voice), and the "Claude পাঠশালা" 10-episode series tooling on EXP1.

### What you write, per style

| Style | You write | The laptop writes |
| --- | --- | --- |
| REEL1 (tools-reel engine) | `reel.json`, copied from `reel.example.json`, rules in `skill-tools-reel.md` §2–§3, §6 | PLAN.md (`build.mjs --plan`), voice alignment, page, mix |
| REEL2–REEL10, REEL1S (series engine) | `reel.json` like `reel.series.example.json` (`"engine": "series"`, `"style": "REEL5"` …), rules in `skill-tools-reel.md` §9 and §9b | the voice script from reel.json, PLAN.md, everything else |
| EXP1 | `build/voice-script.txt` (format: `voice-script.example.txt`) and `build/explainer.json` (format: `explainer.example.json`, scene types in `skill-explainer.md` §2) | the voice, the timing, PLAN.md, captions, Reels |
| AT1 | the goal, the app's URL, the steps in plain words, the script | `demo.json` (the robot needs the live app), everything else |
| TUT1, PROMO1, EP1, EDIT1, AB1–AB5 | the brief, the script if the voice is separate, a **draft** PLAN.md with every time marked `আনুমানিক` | measures the footage (route.mjs, glitch-scan, watch.mjs), fixes the times, runs plan-check |
| UREEL1, LI1 (from a finished video) | which moments to use, by quoting the spoken lines; all the post copy | the cuts from the master's word timings |
| MG1, MG2 (B-roll) | where the clip goes and what title sits on its empty side | the clip |
| anything else, hand-built | PLAN.md from `PLAN-TEMPLATE.md`, like `PLAN-EXAMPLE.md` | the build |

In reel.json and explainer.json every timing word (`on`, `linkOn`, `fixOn`, `countOn`, `L12:word`) **must be a word
that appears in that exact line**, in the line's order; spoken lines must be **exactly** what the voice will say.
A wrong word stops the laptop's build. Keep every text inside the length limits in the skill tables.

### "N tools" Reels: which engine, which look (settled 2026-11-04 after a test run)

- **Bengali, his cloned voice, inbox-keyword CTA (his normal Reel)** → the **series engine**: `"engine": "series"`,
  `"lang": "bn"`, `"style"` one of REEL2–REEL10 or `"REEL1"` (the dark terminal look on the series engine, = REEL1S).
  Shape: copy `reel.series.example.json`. **3 to 5 tools** (the engine refuses other counts; the end card shows them).
- **English voice with a comment-keyword CTA** → the tools-reel engine: no `engine` field, `"style"` absent,
  shape `reel.example.json`.
- **Choosing the look:** match the topic's mood with VARIANTS.md's descriptions (REEL4 ভল্ট for safety/privacy,
  REEL7 কাগজের টেবিল for saving money, REEL8 জ্ঞানের সিঁড়ি for learning, REEL9 আলপনা for Bengali topics, REEL10
  ব্লুপ্রিন্ট for automation, REEL2 পকেট গ্লাস for phone apps, REEL3 স্পিডরান for speed, REEL5 ফিল্ম রিল for creators,
  REEL6 অফলাইন রাত for offline tools). Say in one line why; if unsure, ask him in the questions.
- **The badge:** the series engine prints `series` · `পর্ব <episode>` at the top left. For a single Reel set `series`
  to its own short topic ("৩টা ফ্রি AI টুল") and `episode` to 1, or the badge says "৫টা GitHub রিপো".
- **Series limits** (the engine's `--check` refuses anything longer): `name` ≤ 24 characters · `maker` ≤ 30 ·
  `features` 2–4 items `{label ≤ 16, on, icon}` · `proof.text` ≤ 22 · `stat.text` ≤ 18 · `how.steps` 2–3 items
  `{label ≤ 22, on}` with a spoken `how.line` · `promise.title` ≤ 18, `promise.sub` ≤ 34, `promise.rows` ≤ 3
  `{label ≤ 24, on, icon}` · `cta.steps` exactly 3 `{label ≤ 16, on, icon}` (পেজে যান · Message চাপুন · লিখুন KEYWORD) ·
  `keyword` ≤ 10. Each look may add its own limits, which `--check` prints on the laptop.
- **Icons:** only names from `lucide-icons.txt`. No brand logos exist (the engine draws a letter badge).
- **Facts:** a `stat` (stars, users, price) only with a `facts[]` entry whose `source` is an official URL you read and
  whose `checked` is that day's date (`"2026-11-04"`). A fact you could not read is NOT put on screen: leave out the
  `stat`, keep the spoken claim general, and list it in the reply under যাচাই দরকার and in `questions[]`.
- **Voice path:** `"voice": "assets/voice/voice.wav"`. The laptop makes it from reel.json in his voice talha-g.
- **His inbox reply:** the keyword's auto-reply text lives with him, not in this pack; if the video promises something
  in the inbox, ask him what the reply contains or say it must be made first.

### At the plan gate, for engine-made styles (REEL, EXP1)

The laptop writes the exact shot table (times, sounds) from your data file. So show him: the look and why, the hook,
the spoken script line by line, per tool or scene what appears on screen (features, how-to steps, proof), the
estimated length, what is still unchecked, and the questions. Say that Claude Code will show the measured shot
table before rendering. Do not invent times or sound names for these styles.

### Hand-built videos with a voice

Write the numbered script lines in PLAN.md's স্ক্রিপ্ট section and place each as `ভয়েস N` in the table. Optionally
add `build/voice-script.txt` in the gemini format (§8). The laptop makes the voice, measures each line's start and
moves the rows to match.

Captions: his voice captions run the whole video (whole-video rule). In a shot where a big on-screen title says
exactly the spoken words, do not show a second caption with the same words (PLAN-EXAMPLE.md does this).

**AB styles can be mixed in one video:** AB3 for the hook, AB1 for explaining, AB4 when a list comes, AB5 for numbers,
AB2 for a story or the future. Show in the plan which section uses which.

---

## 6. Craft rules (standing, every video)

1. **Camera moves end at scale 1.** A push starts below 1 and lands on 1 (0.965 → 1). Never zoom content past 1.
2. **Panels are sized by their content**; text never leaves its card.
3. **Rows of numbers or columns share one grid** and one baseline.
4. **Bengali takes no letter-spacing** (it breaks the মাত্রা line).
5. **Sizes at 1080p:** text the viewer must read ≥ 28 px; small labels ≥ 24 px; ≤ 15 px only for page furniture.
6. **Fonts:** body and captions Hind Siliguri (captions Bold); big titles and numbers Baloo Da 2; English Inter;
   at most 2 families per video; every stack that can get Bengali has a Bengali font in it.
7. **Sound on the beat:** every scene change gets a sound (`whoosh` / `whoosh-short`); small UI events a quiet
   `click`; count-ups ride `typing`. The laptop subtracts each file's silent lead-in.
8. **No dead air:** never a still picture AND silence together for ≥ 1.5 s.
9. **The laptop looks at every render** (contact sheets); you never claim a look you did not see.
10. **Quote every font family name** in CSS (`"Baloo Da 2"`).
11. **No ✓, ✗, → or • characters in on-screen text** (the fonts don't have them): say "drawn tick" / "drawn arrow"
    in পর্দায় কী and number lists with Bengali digits.
12. **Captions:** balanced lines, no single word alone on the last line; a new line after । ; on Reels 2–4 words a
    line, the spoken word lit in gold/yellow; long videos whole sentences.
13. **9:16 safe zone (Meta Reels):** keep the top 14 %, the bottom 35 % and 6 % at each side free of text; captions
    sit about 60 % down from the top. Captions never cover his face or the screen text being taught.

**Pace (STYLE.md §৫):** the hook in the first 2 seconds is the result or the most striking line, never a greeting.
On Reels something changes on screen every 2–3 s; on long videos every 6–8 s. A deliberate still beat is allowed only
when the shot says দম. Short videos: the end screen ≤ 3 s.

**Whole-video by default (his rule, 2026-10-28):** a *persistent* treatment (cursor glow, privacy blurs, logo blurs,
captions, watermark, colour grade, loudness, safe zones) runs from the first frame to the last that shows its subject,
even if his brief mentions it inside one time range. Narrow it only when he says "শুধু" / "only". Write each one in
PLAN.md's `পুরো ভিডিও জুড়ে:` line. *Moments* (a zoom, a tilt, one callout) belong to their beat.

**Privacy blur (decided once, before the first render; levels in `skill-privacy-blur.md`):** default **basic** = his
full name and email, phone numbers, addresses, profile photos, other people's names/photos/messages, faces other than
his; always passwords, keys, OTPs, card/bank/bKash/Nagad numbers, balances. File names only at **strict**. Harmless
items never cause a re-render.

**The five roots of every mistake (`fundamentals.md`)**, check them in the plan: **সময়** (every time tied to its
event; a label leaves before its window closes), **জায়গা** (an overlay sits beside its target, never on other text),
**অবস্থা** (every element's state follows from the timeline alone), **উৎস** (the recording has glitches and private
data the brief never mentions: the laptop scans it before planning), **প্রমাণ** (cheap checks before expensive ones).

**Never:** captions over a face; music louder than the voice; `subtitles=` for Bengali (the laptop uses burn-subs);
for sale: HeyGen free media, MusicGen, MMS/XTTS or any "non-commercial only" asset; fake reviews or testimonials;
AI-made human faces; free stock photos of recognisable people in ads (no model release); real brand logos drawn in
explainers (they draw simplified app windows with the note "ছবিটা বোঝানোর জন্য সরল করে আঁকা"); render, publish or
spend without his OK.

---

## 7. PLAN.md: the exact format and the machine's rules

Copy `PLAN-TEMPLATE.md` and fill every section; `PLAN-EXAMPLE.md` is a filled one that passes. The laptop's
`plan-check` reads it like this, so follow every line:

**Header lines** (above the first section): `ফরম্যাট:` and `দৈর্ঘ্য:` are required. Also `প্ল্যাটফর্ম:`, `ধরন:`,
`ভয়েস:`, `মিউজিক:`, `আউটপুট:`, `পুরো ভিডিও জুড়ে:`. Write `নেই` **on its own** for no voice or no music.

**Sections, in order:** লক্ষ্য · হুক (প্রথম ২ সেকেন্ড) · স্ক্রিপ্ট · শট টেবিল · যা লাগবে ·
STYLE.md আর LESSONS.md থেকে যা মানছি · আপনার কাছে প্রশ্ন.

**ERROR (the plan is refused):**
- a table row with more or fewer cells than the header: a stray `|` inside a cell (write `\|` if you must);
- a blank line inside the table;
- times that do not run back to back from 0 to the দৈর্ঘ্য value (each row starts where the previous ended).

**WARN (fix it or explain it):**
- a row longer than 3 s on a video up to 90 s (8 s on longer videos) unless its পর্দায় কী cell has the word দম;
- a দম row over 1.5 s with no voice, music or long-enough sound under it (dead air);
- a shot with no sound;
- a sound name in backticks that is not in `sfx-list.md`;
- ✓ or arrow symbols in on-screen text;
- an end screen over 3 s;
- a script longer than the video, a numbered script line that is not placed in the table as `ভয়েস N`, or a line that
  may still be playing when the next starts or after the end. **Budget 1.8 words per second plus 0.65 s per line**
  (the checker's estimate). For his cloned voice talha-g the real pace is about 2.0 words/s (550 words ≈ 300 s).
  With a recorded voice, write each line's measured start: `৬. (০:২৮.৮) …` (the laptop fills these);
- music named in the header but no track exists on the laptop (`assets/music/`, `PC মাপবে` in chat mode).

**Cells:**
- **সময়** = seconds on the finished video: `0–2.5`, `2.5–5`; over a minute `1:05–1:08` also works. Bengali digits,
  any dash, "থেকে", m:ss and "সে." are accepted.
- **পর্দায় কী** = one row per change on screen (cut, zoom, new graphic). Drawn ticks/arrows are named here.
- **ক্যাপশন / লেখা** = only EXTRA on-screen text, exactly as it will appear (Bengali digits). Voice captions follow
  the voice by themselves. Write `—` when there is none.
- **শব্দ** = sound names in backticks, `×N` for repeats (`` `click` ×৩ ``), plus `ভয়েস ১`, `ভয়েস ২` … for the
  script lines that START in that shot. A whoosh at every new scene.

**Questions:** only what STYLE.md and his request do not answer, plus any number or claim he did not give you (a time
saved, a price), and how extra formats are made (a quick blurred "fit" or a separate 9:16 layout, STYLE.md §৬).

---

## 8. Script and voice

- **His own videos use his cloned voice** (Gemini, voice `talha-g`, "গ", his choice on 2026-11-01). Older files in
  this pack mention `talha-a` (ক) or `talha-b` (খ): those were earlier clones, use `talha-g`. Never another AI voice
  for his own videos unless he asks. Piper (Bengali, needs a credit line) and Kokoro (English) are for tests.
- **Pace of his cloned voice:** about 2.0 words/s on calm explainers and about 2.3 words/s on Reels (the laptop then
  trims pauses). A 3-tool series Reel is roughly 110–130 spoken words (≈ 50 s); 5 tools ≈ 200 words (≈ 80 s).
  plan-check still budgets the slower 1.8 words/s + 0.65 s per line, the safe direction.
- A file this pack mentions but does not contain (for example `INBOX-AND-COMMUNITY.md`) is on the laptop only: do not
  guess its content, ask him or leave it to the handoff.
- Voice script format (for `gemini.mjs say`, see `voice-script.example.txt`): a tone tag at the start of each section
  — `[explain]`, `[story]`, `[question]`, `[happy]`, `[serious]`, `[cta]`, `[excited]` — and `[pause 0.5]` between
  sections; one sentence group per line. English words that TTS might misread are written in Bengali letters
  (`স্কিল ডট এমডি`) and shown correctly on screen.
- His Gemini quota is 100 requests a day: one request per section, not per line (≈ 16 for a 5-minute video).
- **Tone (STYLE.md §১):** like a friend, simple, direct. No hype words ("অবিশ্বাস্য", "সেরা", "game-changing").
  Product names stay in English letters (Claude, ChatGPT, Gemini). Numbers in Bengali digits on screen.
- **His CTA (content funnel):** every Reel and ad sends the viewer to his inbox with a keyword or a message CTA.
  On "N tools" videos three things must be clear on screen (LESSONS 2026-11-01): a big "what this video is about" at
  the start, "কীভাবে চালাবেন" steps ১-২-৩ for each tool, and an "ইনবক্সে KEYWORD" chip through the whole video with
  three message steps at the end (পেজে যান · Message চাপুন · লিখুন KEYWORD).
- If the video promises something free (a template, a prompt pack), say in the plan that it must be made first.
- Music: under the voice, much quieter than it, fading out on the CTA. Lyria tracks (his key, $0.08) or Pixabay.

---

## 9. The handoff block (end of every finished job)

```
=== হ্যান্ডঅফ: PC-তে Claude Code-কে দিন (D:\Video Create) ===
এই ফাইলগুলো অন্য একটা মডেল লিখেছে। CLAUDE.md মেনে আগে যাচাই করো, তারপর কাজ করো।
প্রজেক্ট: <name, lowercase-with-dashes>     স্টাইল: <code>     ধরন: <tools-reel | blank | screen-promo | screen-tutorial | episode | abroll>
প্ল্যান OK: <তারিখ, অথবা "এখনো নয়">

ফাইল ১: projects/<name>/<path>
<the whole file inside a code fence>

ফাইল ২: …

PC-তে যা হবে:
১. node tools/new-video.mjs <name> --kind=<ধরন>
২. উপরের ফাইলগুলো জায়গামতো রাখা (example ফাইলের উপর)
৩. <the style's check: REEL1 on the tools-reel engine → node tools/reel/build.mjs projects/<name> --check ;
    "engine": "series" (REEL2–REEL10, REEL1S) → node tools/reel/series.mjs projects/<name> --check ;
    explainer → node tools/explainer/build.mjs projects/<name> --estimate ;
    অন্যগুলো → node tools/plan-check.mjs projects/<name>> — কোনো ERROR না থাকা পর্যন্ত
৪. PLAN.md আমাকে দেখাবে, আমার OK-র পর CLAUDE.md অনুযায়ী বানাবে আর রেন্ডার করবে

যা যাচাই হয়নি: <every fact marked যাচাই দরকার, every time marked আনুমানিক / PC মাপবে>
খোলা প্রশ্ন: <…>
```

Give whole files, never "the rest stays the same". JSON must be valid (double quotes, no comments, no trailing
commas). File and project names in Latin letters, lowercase, with dashes.

---

## 10. Post copy (after every video, unasked; full rules in `skill-post-copy.md`)

- Facts only from the video's script and his brief.
- One file `projects/<name>/POST-COPY.md`, every block in a code fence so he can copy it in one tap.
- Facebook post / Reels: 3–4 hashtags, hook line, 2–4 short lines, one CTA, the link in the FIRST COMMENT.
  Instagram: at most 5 hashtags, "লিংক Bio-তে". YouTube: title ≤ 100 characters (keyword first), 3 hashtags in the
  description, chapters starting 0:00 (≥ 3, each ≥ 10 s), tags, a pinned comment. Shorts: #Shorts in the title.
- Routing: Facebook Reels → the full video on his Facebook page; Facebook page post and Instagram → YouTube;
  Shorts → the full video (Related video).
- One CTA per post. Paid ads: primary text ≤ 125 characters before "See more", headline ≤ 40.
- Tell him plainly: hashtags help a little; reach comes from the hook, watch time, shares and comments.
- If his cloned voice is used: Meta needs the AI label; YouTube does not for cloning one's own voice (YouTube's own
  help page, checked 2026-11-01).

---

## 10b. Client motion-graphics jobs by catalog CODE (Motion Studio, added 2026-11-07)

- Files: `studio-catalog.json` (32 services: code, what, best-for, aspects, durations, music mood, fonts, prices in
  USD and BDT), `skill-motion-studio.md` (the job in seven commands), `studio-AGENT-BRIEF.md` (how a piece is
  built), `studio-QUALITY.md` (the bar), `studio-brief.example.md` (a filled BRIEF.md), `studio-piece.example.json`
  (a filled piece.json with the sound cues), `business-PLAYBOOK.md` (prices, clients, payments, in Bengali),
  `business-CLIENT-BRIEF.md` (the English intake form for clients).
- Your part when he brings a client: pick the CODE, fill the client brief from what he pasted, write the piece's
  BRIEF.md in the same shape as the example (concept, look with hex colours and fonts, timed beats, craft notes,
  sound), write PLAN.md, and list the open questions (logo files, numbers the client must confirm, voice).
- Every client video shows only numbers and claims the client confirmed in writing; no real-brand logos the client
  does not own; no AI-generated people unless the client asks. Portfolio samples are always labelled concept work.
- The building, checking and rendering happen in his Claude Code workspace (`tools/studio`), not by you.

---

## 11. Your checklist before you show him anything

- [ ] Replied in simple Bengali, technical words explained.
- [ ] Style code chosen from VARIANTS.md, and its status said (তৈরি / বেটা).
- [ ] Every fact has an official source + date, or is marked `যাচাই দরকার`. No invented numbers.
- [ ] Hook in the first 2 s, no greeting. A change every 2–3 s on Reels.
- [ ] PLAN.md: header lines, all sections, times back to back from 0 to দৈর্ঘ্য, same cell count in every row, no
      blank line in the table, a sound in every row, only names from `sfx-list.md`, every script line placed as
      `ভয়েস N`, the script fits 1.8 words/s + 0.65 s per line, end screen ≤ 3 s, no ✓ or arrows in text.
- [ ] Data files: spoken lines exact, every timing word inside its own line, limits kept, valid JSON, icons only
      from `lucide-icons.txt`, a `stat` only with an official source you read, `series`/`episode` set on a series
      Reel, the right check command in the handoff (build.mjs or series.mjs).
- [ ] Persistent treatments written in `পুরো ভিডিও জুড়ে:`; blur level said.
- [ ] No claim that anything was rendered, recorded or measured by you.
- [ ] The handoff block, the open questions, and a stop until his OK.

<<<<< END OF FILE: 00-STUDIO-RULES.md >>>>>

<<<<< FILE: LESSONS.md >>>>>

# শেখার খাতা (LESSONS.md)

প্রতিবার আপনি কোনো ভিডিও নিয়ে মতামত দিলে Claude এখানে এক লাইন লিখবে। নতুন লাইন সবসময় নিচে যোগ হবে।

একই কথা দুবার এলে Claude `STYLE.md`-তে নতুন নিয়ম যোগ করার প্রস্তাব দেবে। আপনার OK পেলে তবেই যোগ করবে।

| তারিখ | ভিডিও | আপনি যা বলেছিলেন | পরের বার থেকে নিয়ম |
| --- | --- | --- | --- |
| 2026-10-06 | হিসাব খাতা প্রোমো | সংখ্যাগুলো কার্ডের বাইরে, কলামের দাগ দুই উচ্চতায়, "সংখ্যায়" শব্দের অক্ষর ফাঁক হয়ে গেছে | লেখা থাকবে কার্ডের ভেতরে, কলাম এক লাইনে, বাংলায় letter-spacing নয়। `design-lint.mjs` এগুলো নিজে ধরে। |
| 2026-10-06 | হিসাব খাতা প্রোমো | এমন ভুল যেন আর না হয়, প্রতিটা ভিডিও যেন আরো ভালো হয় | প্রতিটা ভিডিও `finish.mjs` দিয়ে (ডিজাইন চেক + কোয়ালিটি চেক)। রেন্ডারের পর প্রতি আধা সেকেন্ডের ছবি দেখা। |
| 2026-10-06 | খাতা কার্টুন | গল্প যেন ছবি দেখেই বোঝা যায়, ভয়েস যেন বোঝা যায়, শব্দ থাকুক, মুখ-হাত-পা নড়ুক | মুখ কথার সাথে নড়বে, হাঁটা আর হাত নাড়া থাকবে, প্রতিটা দৃশ্য বদলে শব্দ। |
| 2026-10-25 | Claude 5X বিজ্ঞাপন | যা শিখছ সেটা টুল আর স্কিল হিসেবে রেখে দাও, যাতে প্রতি ভিডিওর পর তোমার লেভেল বাড়ে, পরের বার একই কাজে টোকেন কম লাগে আর নির্ভুল হয় | প্রতি ভিডিওর পর: হাতে লেখা কোড `tools/`-এ স্থায়ী টুল, কাজের ধাপ আর ধরা-পড়া ফাঁদ `.claude/skills/`-এ স্কিলে, তারপর আপনার OK নিয়ে commit (CLAUDE.md §0f)। |
| 2026-10-26 | Claude 5X বিজ্ঞাপন (সংস্করণ ২) | Meta বিজ্ঞাপনের নিয়মমতো করো: নিজের নাম, ইমেইল আর প্রোফাইল ঝাপসা; নতুন ভয়েস | স্ক্রিন রেকর্ডিংয়ের বিজ্ঞাপনে নিজের নাম/ইমেইল/প্রোফাইল ঝাপসা, আর প্রতিটা ফ্রেম স্ক্যান করে প্রমাণ যে কোথাও স্পষ্ট নেই (screen-promo §4b)। শেষ পর্দা বা ব্র্যান্ডের নাম আপনার নির্দেশমতো থাকবে। |
| 2026-10-26 | Claude 5X বিজ্ঞাপন (সংস্করণ ৩) | এই ভিডিওতে লোগো ঝাপসা করতে বলেছিলেন | আপনি যখন লোগো বা কোনো নির্দিষ্ট অংশ (যেমন Fast mode) ঝাপসা বা কাটতে বলবেন, তখন সেটা পুরো ভিডিও জুড়ে নিখুঁতভাবে ঢাকা থাকবে; আর যে ব্যাজ বা ফিচার দেখাতে বলবেন (যেমন Claude for Nonprofits, Connectors, Skills) তা স্পষ্ট থাকবে। |
| 2026-10-28 | Claude 5X বিজ্ঞাপন | কার্সরের হাইলাইট শুধু প্রথম দৃশ্যে, পুরো ভিডিওতে নেই; এমন জিনিস সিস্টেম নিজেই পুরো ভিডিওতে বসাক | পুরো ভিডিওর জিনিস (কার্সরের আভা, নাম/লোগো ঝাপসা, ক্যাপশন) সবসময় প্রথম থেকে শেষ পর্যন্ত; "শুধু" না বললে কখনো এক অংশে নয়। পাতা বানানোর কোড ফাঁক পেলে নিজেই থামে (CLAUDE.md §0h)। |
| 2026-10-29 | tools-reel স্কিল | যেকোনো সাধারণ মডেল (Sonnet বা Opus medium) দিয়েই যেন এই রিল বানানো যায়, কম টোকেনে, পুরো মানে | ভিডিওর চেহারা, সময় আর শব্দের সব সিদ্ধান্ত স্থায়ী কোডে (tools/reel); মডেল শুধু ডেটা (reel.json) লেখে আর কমান্ড চালায়। প্রতিটা নতুন স্কিল একটা সস্তা মডেলে চালিয়ে প্রমাণ করা হবে। |
| 2026-10-29 | Claude টিউটোরিয়াল | ফাইলের নাম কেউ দেখলে তেমন ক্ষতি নেই; যেগুলো সত্যিই জরুরি শুধু সেগুলো ঝাপসা করো, বাকিটা নিজের বুদ্ধিতে; এর জন্য বারবার রেন্ডার নয়; কী ঝাপসা হবে / দিয়ে বলা যাবে এমন স্কিল বানাও | ঝাপসার মাত্রা রেন্ডারের আগে একবারই ঠিক হবে: ডিফল্ট "বেসিক" (নাম, ইমেইল, ফোন, প্রোফাইল ছবি, অন্যের মেসেজ, পাসওয়ার্ড-টাকা); ফাইলের নাম শুধু `/privacy-blur strict` বললে। শুধু বেসিক-মাত্রার ফাঁস পেলেই আবার রেন্ডার (স্কিল privacy-blur)। |
| 2026-10-29 | Claude টিউটোরিয়াল | বারবার রেন্ডার সময় খায়; ভুলগুলোর মূল কারণ (পঞ্চভূতের মতো মৌলিক উপাদান) খুঁজে পরিবেশ এমনভাবে সাজাও যাতে পরের বার সমাধান নিজে থেকেই লাগে, ভুল আর না হয়; প্রতিবার নিজেই আপগ্রেড হও (2.0 → 3.0 …), আমাকে বলতে না হয় | প্রতিটা ভুল পাঁচ উপাদানের একটায় পড়ে: সময়, জায়গা, অবস্থা, উৎস, প্রমাণ (CLAUDE.md §0i, docs/fundamentals.md)। ভুল মানেই একটা যন্ত্র-পাহারা (tool rule) বা স্কিলের ধাপ, শুধু নোট নয়; পুরনো বিল্ডে প্রমাণ; docs/system-log.md-তে ভার্সন বাড়ে। লম্বা রেন্ডারের আগে preflight বাধ্যতামূলক। |
| 2026-10-30 | পুরো সিস্টেম (রাতের কাজ) | মুখ, স্ক্রিন বা দুটো মিশিয়ে যা-ই দিই, ভিডিওর ধাঁচ তুমি নিজে বুঝবে; প্রতিটা স্টাইলের একটা নাম থাকবে, যাতে আমি শুধু নাম বলেই চাইতে পারি, আর নতুন স্টাইল এলে তার নাম জানতে পারি; কথা বলার ভিডিওতে A-roll + B-roll-এর সেরা ৫টা স্টাইল; B-roll হবে উঁচু মানের; ComfyUI + Wan পরীক্ষা করে দেখো | ফোল্ডার পেলেই আগে `node tools/route.mjs <ফোল্ডার>` (ধাঁচ S1–S7)। প্রতিটা স্টাইলের কোড আর নাম থাকবে `VARIANTS.md` (আপনার জন্য) আর `tools/variants.json`-এ। নতুন স্টাইল মানে নতুন কোড আর প্রমাণ-ভিডিও। A-roll + B-roll হলো AB1–AB5 (`tools/abroll`, স্কিল abroll)। টাকা লাগে এমন AI-ভিডিও পথ শুধু আপনার OK-তে (`docs/ai-video-generation.md`)। |
| 2026-10-30 | Claude টিউটোরিয়াল থেকে Reels | পুরো ভিডিও থেকে অর্থপূর্ণ অংশ কেটে Reels, শব্দ-ধরে চলা ক্যাপশন; Reels দর্শককে পুরো ভিডিওতে পাঠাবে; প্রতি ভিডিওর পর Facebook, Instagram, YouTube-এর পোস্ট কপি আর হ্যাশট্যাগ | তৈরি ভিডিও থেকে Reel: স্কিল reel-cutdown (tools/cutdown)। প্রতিটা ভিডিও বা Reel-এর পর নিজে থেকেই পোস্ট কপি: স্কিল post-copy (FB Reels → FB-র পুরো ভিডিও, FB পেজ আর Instagram → YouTube)। |
| 2026-10-30 | Instagram Reels (claude-ig-1, 2) | মুখ খাড়া রেকর্ড করেছি, তাই মুখ থাকলে পুরো 9:16, কম্পিউটারে গেলে 16:9, ফ্রেম মসৃণভাবে বদলাবে; কথার নিচে BGM হালকা করে শোনা যাক; স্কিল আর tools/cutdown এভাবেই বদলাও | tools/cutdown-এ এখন ডিফল্ট faceMode "full": মুখ পুরো খাড়া পর্দায়, স্ক্রিন জানালায়, মাঝে ০.৭ সেকেন্ডের রূপান্তর; bedUnderVoiceDb দিয়ে কথার নিচে BGM জোরে। আগের ৪টা Reel বদলায়নি (window মোড, প্রমাণ: পাতা হুবহু এক)। |
| 2026-10-31 | ভয়েস ক্লোন পরীক্ষা (IndicF5) | যা দিয়েছ তাতে উচ্চারণ, আবেগ কিছুই ঠিক নেই; মানুষের কাছাকাছিও যায় না। সাধারণ একজন মানুষ যেভাবে কথা বলে ঠিক সেভাবে উচ্চারণ আর আবেগ চাই, আর গলা হতে হবে আমার ১০০% হুবহু | শব্দ মেলা (ASR) আর সুরের মাপ (pitch) শুধু প্রমাণ করে শব্দ আর সুর ঠিক আছে, গলা স্বাভাবিক কি না তা না; কোনো গলার পদ্ধতিকে "ভালো" বলব শুধু আপনি শুনে OK দিলে (say.mjs এখন অনুমোদন ছাড়া ভিডিওর ভয়েস বানায় না)। ৭ সেকেন্ডের নমুনা থেকে ক্লোন (zero-shot) আপনার বলার ধরন শিখতে পারে না, আর IndicF5 শিখেছে শুধু ভারতের বাংলাভাষীদের থেকে। আপনার মতো শোনাতে হলে মডেলকে আপনার নিজের অনেক কথা থেকে শেখাতে হবে। |
| 2026-11-01 | GitHub সিরিজ, পর্ব ১–৫ (এক রাতে) | "কোন কাজ করতে হবে সেটা আমি বলব, কিন্তু কীভাবে করবে, আর বেশির ভাগ সময় কোনটা করবে, সেটা তোমার কাজ। শেখানোর জিনিস তুমি ভালো জানো।" | তিনি কাজ দিয়ে "বানাও" বললে বিষয়, স্টাইল, ভয়েস আর BGM-এর সিদ্ধান্ত Claude নিজেই নেবে। প্ল্যান যন্ত্রে পরীক্ষা (plan-check) করে শেষ পর্যন্ত বানাবে, প্ল্যানগুলো রিপোর্টে দেখাবে, আর তাঁর মতামত এলে পরে বদলাবে। টাকার খরচ (Gemini ভয়েস, Lyria BGM) আগে থেকে দেওয়া পেইড কী দিয়ে, কয়েক সেন্টের মধ্যে, রিপোর্টে হিসাবসহ। |
| 2026-11-01 | GitHub সিরিজ, পর্ব ১–১০ (ক্লোন গলায় নতুন করে) | "২–৫ ভিডিও Sadaltager দিয়ে করা, আমার ক্লোন ভয়েস ব্যবহার করোনি, এখন আমার ক্লোন ভয়েস দিয়ে আবার করো, ১–১০ সবগুলো। কাস্টমার যেন একদম পরিষ্কার বোঝে ভিডিওটা কী নিয়ে, কীভাবে এটা ব্যবহার করবে, আর যেন আমাকে ইনবক্স করে।" | তাঁর নিজের ভিডিওতে ভয়েস মানে তাঁর ক্লোন করা গলা (talha-a), অন্য কোনো AI গলা নয়। প্রতিটা "N টুল" ভিডিওতে তিনটা জিনিস পর্দায় পরিষ্কার: শুরুতে বড় করে কী নিয়ে ভিডিও, প্রতিটা টুলে "কীভাবে চালাবেন" ধাপ ১-২-৩, আর পুরো ভিডিওতে "ইনবক্সে KEYWORD" চিহ্ন + শেষে মেসেজ করার ৩ ধাপ (পেজে যান · Message চাপুন · লিখুন KEYWORD)। |
| 2026-11-01 | অটো-টিউটোরিয়াল (নতুন সিস্টেম) | "আমাকে স্ক্রিন রেকর্ড করতে হবে না; AI নিজে সফটওয়্যারের ভেতরে ঘুরে দেখাবে কোথায় গিয়ে কাজটা হয়, আমি শুধু ফোনে স্ক্রিপ্ট পড়ে মুখ রেকর্ড করব; গ্রাফিক্স আর মুভমেন্টের বৈচিত্র্য সীমাহীন; প্রতিটা ধরনের একটা নাম, নাম বললেই সেটা চালু; আমার আর তোমার দুই দিকেই খাটুনি কম, মান ১০০%" | স্ক্রিন রেকর্ডিং ছাড়া টিউটোরিয়াল = AT স্টাইল (`tools/autocap`: রোবট ধাপের তালিকা `demo.json` চালিয়ে ২ গুণ ঝকঝকে ছবি আর প্রতিটা বোতামের মাপ তোলে, তারপর কম্পোজার)। AI শুধু একবার পথ খোঁজে, তোলা হয় যন্ত্রে, তাই প্রতিবার একই ফল আর টোকেন কম। claude.ai, ChatGPT, Facebook, Canva-য় বট নিষেধ: সেখানে তিনি নিজে ক্লিক করবেন (সহায়ক মোড)। প্রতিটা নতুন চেহারা = নতুন কোড (AT1…) + প্রমাণ। Gemini ভয়েস দিনে ১০০ অনুরোধ: প্রতি লাইনে নয়, প্রতি অংশে এক অনুরোধ। পরিকল্পনা: `docs/auto-tutorial-plan.md`। |
| 2026-11-01 | ভয়েস ক্লোন (Gemini) | দুটো ক্লোনের নমুনা শুনে: "খ ভালো" | আপনার গলা বলতে এখন থেকে খ (talha-b: iPhone-এর শান্ত-বোঝানো নমুনা থেকে বানানো) — `gemini.mjs say --voice=talha-b`। নতুন ক্লোনের নমুনা সবসময় একই স্ক্রিপ্টে পাশাপাশি শুনিয়ে আপনাকে বাছতে দেব। |
| 2026-11-01 | ভয়েস ক্লোন ক/খ → গ | ক মাঝে মাঝে বেশি মোটা আর খসখসে, মাঝে মাঝে স্বাভাবিক; খ স্বাভাবিক কিন্তু bass কম, মোটা নয়; দুটো মিলিয়ে আরও ভালো "গ" বানাও | মেপে দেখা গেল "মোটা/পাতলা" মূলত সুরের উচ্চতা: ক্লোন আপনার চেয়ে ২৩–৩৩ Hz উঁচুতে বলছিল, আর লাইন থেকে লাইনে গলার ভার ওঠানামা করছিল। এখন থেকে আপনার প্রতিটা ক্লোন গলা: দুই নমুনা মিলিয়ে বানানো, প্রতি লাইনে "স্বাভাবিক নিচু সুর" নির্দেশ, আর আপনার আসল রেকর্ডিংয়ের টোনে মেলানো (tone-match)। গ-এর মাপ: সুর ১৫৯ Hz (আপনার ১৪৬), ওঠানামা ±০.২ dB। |
| 2026-11-01 | ভয়েস ক্লোন গ | ক, খ, গ পাশাপাশি শুনে: "গ ভালো, এটাই রাখো" | আপনার মূল গলা এখন গ (talha-g)। সব নতুন ভয়েস-ওভার `--voice=talha-g`; নিচু-সুরের নির্দেশ আর আপনার আসল টোনে মেলানো নিজে থেকেই হয়। |
| 2026-11-01 | ভয়েস ক্লোন গ | গ-ই ডিফল্ট গলা হবে; খ দিয়ে যা তৈরি হয়ে গেছে তা বদলানোর দরকার নেই, পরের কাজ থেকে গ। আগে জানাও: এটা দিয়ে YouTube/Facebook-এ আয় পর্যন্ত যাওয়া যাবে কি না | গলার নাম না বললে এখন টুল নিজেই গ নেয়। শেষ হওয়া ভিডিও আর নতুন গলায় বদলানো হবে না। প্ল্যাটফর্মের নিয়ম বলার আগে সবসময় অফিসিয়াল পাতা পড়ে বলব, ব্লগ দেখে না (আগে ভুল করে বলেছিলাম YouTube-এ জানাতে হবে; অফিসিয়াল পাতায় নিজের গলার ক্লোনে লাগে না)। |
| 2026-11-02 | Claude Skills টিউটোরিয়াল (৫ মিনিট) | "Claude-এর স্কিল নিয়ে ৫ মিনিটের টিউটোরিয়াল, আমার ভাষায়, Facebook আর YouTube-এর জন্য, ক্যাপশনসহ, ভাইরাল হওয়ার মতো; সব তুমি নিজে করবে, আমি ঘুমাতে যাচ্ছি" | তিনি বিষয় দিয়ে ঘুমাতে গেলে পুরো চেইন নিজে চলে: অফিসিয়াল পাতা থেকে তথ্য → স্ক্রিপ্ট → ক্লোন গলা গ → ছবি → রেন্ডার → সাবটাইটেল, Reels, পোস্টের লেখা, থাম্বনেইল → সকালে এক বাংলা রিপোর্ট। ফুটেজ ছাড়া টিউটোরিয়াল = EXP1 ব্যাখ্যা বোর্ড। ভিডিওতে কোনো ফ্রি জিনিসের কথা বললে (টেমপ্লেট) সেটা আগে বানিয়ে রাখা। |

| 2026-11-04 | unity-hook-01 (বাস বিজ্ঞাপন) | ফোন নম্বর বলার সময় পর্দায় নম্বর নেই; লেখা আরো বড় চাই | নম্বর বলার সময় অঙ্কে অঙ্কে পর্দায় টাইপ হবে; লেখা বড় (ক্যাপশন ৮৪, কার্ড ৭০, হুক ১৪০ px) — skill hook-ad |
| 2026-11-04 | unity-hook-01 v2 | "নিজে চেক করো, নম্বর ভয়েসের সাথে মেলে কি না? যেটা কেউ accept করবে না সেটা কেন দিবা?" (ভয়েসে ১৪ অঙ্কের নম্বর, আমি সেটাই পর্দায় দিয়েছিলাম) | ভুল তথ্য (১১ অঙ্ক নয় এমন ফোন নম্বর) কখনো দেখাবে না: accept_check.py আটকায়; ভয়েসে ভুল থাকলে অংশটা কেটে নম্বর চেয়ে নেবে |
| 2026-11-04 | unity-hook-01 v2 | (আমার নিজের ধরা) লেখা মুখের উপর পড়ছিল | লেখা মুখ মেপে বসবে (faces.py + build.py), accept_check মুখে লাগলে FAIL |
| 2026-11-04 | unity-hook-01 | রুচি শিখে আমার সাথে active কাজ করো | পুরো রেন্ডারের আগে ৩টা লুক (A/B/C) এক ছবিতে দেখিয়ে বেছে নিতে বলবে; প্রশ্ন একই মেসেজে |

<<<<< END OF FILE: LESSONS.md >>>>>

<<<<< FILE: PLAN-EXAMPLE.md >>>>>

# প্ল্যান: হিসাব খাতা, ৩০ সেকেন্ডের Reel (নমুনা)

> এটা একটা নমুনা প্ল্যান। নতুন ভিডিওর আগে Claude আপনাকে ঠিক এমন একটা প্ল্যান দেখাবে। "হিসাব খাতা" আমাদের বানানো নমুনা অ্যাপ।

ফরম্যাট: 9:16
দৈর্ঘ্য: 30 সেকেন্ড
প্ল্যাটফর্ম: Facebook Reels
ধরন: অফার বা প্রোমো
ভয়েস: Piper, পুরুষ (speaker 5)
মিউজিক: নেই
আউটপুট: 9:16, সাথে 1:1

## লক্ষ্য

স্কুলের হিসাবরক্ষক বুঝবেন: হিসাব খাতায় ফি জমা দিলেই রসিদ, বকেয়ার তালিকা আর মাসের রিপোর্ট নিজে থেকে তৈরি হয়। দেখার পর ডেমো চাইতে কমেন্ট করবেন।

## হুক (প্রথম ২ সেকেন্ড)

প্রথম ২ সেকেন্ডেই কালো পর্দায় বড় লাল লেখা "৪ ঘণ্টা", তার উপর কাটা দাগ পড়ে। ভয়েসের প্রথম লাইন সাথে সাথে শুরু হয়, প্রায় ৩ সেকেন্ডে শেষ হয়। শুরুতেই ফলাফল, কোনো "হ্যালো" নেই।

## স্ক্রিপ্ট

১. মাসের হিসাব মেলাতে আর চার ঘণ্টা নয়।
২. হিসাব খাতায় ফি জমা দিলেই রসিদ তৈরি।
৩. কে কত বকেয়া, তালিকা নিজেই তৈরি হয়।
৪. মাস শেষে রিপোর্ট এক ক্লিকে।
৫. ডেমো দেখতে কমেন্টে লিখুন, হিসাব।

## শট টেবিল

ভয়েসের ক্যাপশন শব্দ ধরে ধরে নিজে থেকেই বসবে। নিচের "ক্যাপশন / লেখা" কলামে শুধু পর্দার বাড়তি বড় লেখা; "—" মানে বাড়তি লেখা নেই।

| সময় | পর্দায় কী | ক্যাপশন / লেখা | শব্দ |
| --- | --- | --- | --- |
| 0–2 | কালো পর্দায় বড় লাল "৪ ঘণ্টা", তার উপর কাটা দাগ | আর ৪ ঘণ্টা নয় | `whoosh-short`, ভয়েস ১ |
| 2–4.5 | লাল কালিতে ভরা খাতার পাতা, পাতা দুবার উল্টে যায় | — | `page-turn` ×২ |
| 4.5–7 | ক্রিম রঙের পেছনে "হিসাব খাতা" নাম বসে, নিচে সোনালি দাগ টানা হয় | হিসাব খাতা | `whoosh`, `sparkle` |
| 7–9.5 | আঁকা ফোনের পর্দা: ফি জমার ঘরে টাকার অঙ্ক টাইপ হয় | ফি জমা: ১,২০০ টাকা | `whoosh-short`, `typing`, ভয়েস ২ |
| 9.5–12 | নিচ থেকে রসিদ উঠে আসে, পাশে সবুজ টিক (ছবি হিসেবে আঁকা) | রসিদ তৈরি | `cash-register` |
| 12–14.5 | বকেয়ার তালিকা: তিনটা নাম একে একে আসে, টাকার অঙ্ক লাল | কে কত বকেয়া | `whoosh-short`, `click` ×৩, ভয়েস ৩ |
| 14.5–17 | তালিকার একটা নাম সবুজ হয়ে যায়, পাশে "পরিশোধ" ছাপ পড়ে | নিজে থেকেই আপডেট | `pop`, `sparkle` |
| 17–19.5 | মাসের রিপোর্ট কার্ড: মোট আদায়ের সংখ্যা গুনে উঠে থামে | মোট আদায়: ২,৪৫,০০০ টাকা | `whoosh-short`, `typing`, ভয়েস ৪ |
| 19.5–22 | রিপোর্টের বোতাম চাপা হয়, একটা PDF ফাইল বেরিয়ে আসে | এক ক্লিকে রিপোর্ট | `click`, `success` |
| 22–24.5 | আগে আর পরে পাশাপাশি: বাঁয়ে লাল খাতা, ডানে পরিষ্কার অ্যাপ | ৪ ঘণ্টা নয়, ১০ মিনিট | `whoosh-short` |
| 24.5–27.5 | কমেন্টের ঘরের আঁকা ছবি, তার উপর বড় লেখা | কমেন্টে লিখুন: হিসাব | `whoosh-short`, `ping`, ভয়েস ৫ |
| 27.5–30 | শেষ পর্দা: "হিসাব খাতা" নাম আর পেজের নাম | পেজের নাম (প্রশ্ন ১) | `chime` |

## যা লাগবে

- ভয়েস: Piper দিয়ে ৫টা লাইন, এই কম্পিউটারেই বানানো যায়। আপনি চাইলে নিজের গলায়ও রেকর্ড করা যায় (প্রশ্ন ২)।
- ভয়েসের ক্রেডিট লাইন যাবে ভিডিওর ডেসক্রিপশনে, পর্দায় নয় (`assets/voices/piper/CREDITS.md`)।
- শব্দ: সবগুলো `assets/sfx`-এ আছে।
- মিউজিক: নেই। Pixabay থেকে আপনি গান নামালে নিচে হালকা করে বসানো যাবে।
- ছবি বা ফুটেজ: লাগবে না। সবকিছু আঁকা গ্রাফিক্স, অ্যাপের আসল স্ক্রিনশট নয়।
- 1:1 কপি: কীভাবে বানাব, সেটা প্রশ্ন ৫-এ।

## STYLE.md আর LESSONS.md থেকে যা মানছি

- সাধারণ লেখা Hind Siliguri, বড় সংখ্যা Baloo Da 2; এক ভিডিওতে দুটো ফন্ট (STYLE §৩)।
- বাংলায় অক্ষরের মাঝে বাড়তি ফাঁক নেই; টিক চিহ্ন ফন্টে নয়, ছবি হিসেবে আঁকা (STYLE §৩)।
- ক্যাপশন সাদা লেখা, কালো বর্ডার; বলা শব্দটা হলুদ; এক লাইনে ২–৪টা শব্দ; উপর থেকে প্রায় ৬০%-এ (STYLE §৪)। পর্দার বড় লেখায় হলুদ লাগলে গাঢ় হলুদ #AC7914, কারণ হালকা হলুদ ক্রিম পেছনে পড়া যায় না (STYLE §৬)।
- যে দৃশ্যে বড় লেখা ভয়েসের কথাই বলে, সেখানে একই কথার আলাদা ক্যাপশন থাকবে না।
- প্রতি ২–৩ সেকেন্ডে পর্দায় কিছু বদলায়; প্রতিটা নতুন দৃশ্যে whoosh (STYLE §৫, §৭)।
- শেষ পর্দা ৩ সেকেন্ডের বেশি নয় (STYLE §১১)।
- লেখা থাকবে কার্ডের ভেতরে, পাশাপাশি সংখ্যা এক লাইনে (LESSONS: হিসাব খাতা প্রোমো)।
- রেন্ডারের আগে ডিজাইন-পরীক্ষা, পরে কোয়ালিটি-পরীক্ষা আর প্রতি আধা সেকেন্ডের ছবি দেখা (LESSONS)।

## আপনার কাছে প্রশ্ন

১. শেষ পর্দায় পেজের নাম কী লিখব? STYLE.md-তে এখনো খালি।
২. লাইনগুলো নিজের গলায় রেকর্ড করবেন, নাকি Piper-এর ভয়েস চলবে? STYLE.md-তে নিজের গলা প্রথম পছন্দ।
৩. "৪ ঘণ্টা" আর "১০ মিনিট" সংখ্যা দুটো কি ঠিক? আপনার নিজের হিসাবে যা সত্যি, সেটাই লিখব।
৪. কমেন্টের শব্দ "হিসাব" রাখব, নাকি অন্য কিছু? আর ব্র্যান্ডের রং ঠিক না হওয়া পর্যন্ত খাতার সবুজ আর ক্রিম রং চলবে?
৫. 1:1 কপি: খাড়া ভিডিওটাকে ঝাপসা পেছনের উপর বসিয়ে দ্রুত বানাব, নাকি বর্গাকারে আলাদা করে সাজাব? আলাদা করে সাজালে লেখা বড় আর পরিষ্কার থাকে, তবে সময় বেশি লাগে।

<<<<< END OF FILE: PLAN-EXAMPLE.md >>>>>

<<<<< FILE: PLAN-TEMPLATE.md >>>>>

# প্ল্যান: ভিডিওর নাম

<!--
  Claude: copy this to projects/<name>/PLAN.md, fill every section, then run
    node tools/plan-check.mjs projects/<name>
  until it reports no ERROR. Show the user the goal, hook, shot table, "যা লাগবে", any WARN (in Bengali)
  and the questions, and build nothing until the user says OK. Example: tools/plan/EXAMPLE.md.

  Header: ফরম্যাট and দৈর্ঘ্য are required. Write নেই on its own for no voice or no music.
  Voice: STYLE.md §৮ puts the user's own voice first; if unsure, plan Piper and ask.

  Shot table rules (the checker reads them):
  - সময় is seconds on the finished video: "0–2.5", "2.5–5". Over a minute, "1:05–1:08" works too.
    Rows run back to back from 0 and the last one ends at দৈর্ঘ্য. No blank line inside the table, and no
    | inside a cell (write \| if you must).
  - One row per change on screen (cut, zoom, new graphic). On a Reel something changes every 2–3 s
    (STYLE.md §৫). For a deliberate still beat, write the word দম in the পর্দায় কী cell; a still over
    1.5 s still needs sound (a voice line, `room-tone` or music).
  - ক্যাপশন / লেখা holds only extra on-screen text, written exactly as it will appear (Bengali digits; no ✓
    or arrows: draw those and say so in পর্দায় কী). Voice captions follow the voice by themselves; write —
    when there is no extra text.
  - Sounds go in backticks with the file name from assets/sfx (or the project's own assets/sfx), with
    ×N for repeats: `whoosh-short`, `click` ×৩. A whoosh at every new scene (STYLE.md §৭). Write
    ভয়েস ১, ভয়েস ২ … for the script lines that start in that shot.

  Questions: only what STYLE.md and the request do not answer, plus any number or claim the user did not
  give you (a time saved, a price) and how any extra formats in আউটপুট are made (a quick blurred "fit" or
  a separate layout, STYLE.md §৬).
-->

ফরম্যাট: 9:16
দৈর্ঘ্য: 30 সেকেন্ড
প্ল্যাটফর্ম: Facebook Reels
ধরন: অফার বা প্রোমো
ভয়েস: নিজের গলা (না হলে Piper, পুরুষ, speaker 5)
মিউজিক: নেই
আউটপুট: 9:16, সাথে 1:1
পুরো ভিডিও জুড়ে: (যেমন: কার্সরের আভা, নাম-ইমেইল ঝাপসা, লোগো ঝাপসা, ক্যাপশন — CLAUDE.md §0h; না থাকলে "নেই")

## লক্ষ্য

<!-- One line: what the viewer will know or do after watching. -->

## হুক (প্রথম ২ সেকেন্ড)

<!-- What is on screen and in the ear in the first 2 seconds: the result or the most striking line, never a greeting. -->

## স্ক্রিপ্ট

<!-- The voice lines, numbered (১. … ২. …). With no voice, write: ভয়েস নেই। -->

## শট টেবিল

| সময় | পর্দায় কী | ক্যাপশন / লেখা | শব্দ |
| --- | --- | --- | --- |
| 0–2 |  |  |  |

## যা লাগবে

<!-- Voice, sounds, music, footage or photos, credits, extra formats: what is ready, what is free, what must come from the user. -->

## STYLE.md আর LESSONS.md থেকে যা মানছি

<!-- The STYLE.md rules and LESSONS.md lessons this video follows, each in one line with its section. -->

## আপনার কাছে প্রশ্ন

<!-- Only what STYLE.md and the request do not answer. plan-check lists STYLE.md's open questions. -->

<<<<< END OF FILE: PLAN-TEMPLATE.md >>>>>

<<<<< FILE: PROMPT-PACK-tools-reel.md >>>>>

# প্রম্পট প্যাক: "৫টা টুল" রিল (স্কিল: tools-reel)

এই ফাইল আপনার জন্য। এখান থেকে কপি করে স্কিলকে ডাকবেন, ভয়েস আর BGM বানাবেন। রেফারেন্স ভিডিও: `assets/refs/ref-01.mp4`
(মাপা বিশ্লেষণ: `.claude/skills/tools-reel/reference-ref01.md`)। প্রতিটা সংখ্যা ওই ভিডিও থেকে মেপে নেওয়া।

---

## ১. স্কিল ডাকবেন যেভাবে

এই ফোল্ডারে (`D:\Video Create`) নতুন চ্যাট খুলে লিখুন `/tools-reel`, আর তার নিচে নিচের ফর্মটা (§২) ভরে পাঠান।

তারপর যা ঘটবে:

1. আমি টুলগুলোর তথ্য অফিসিয়াল পেজ থেকে যাচাই করি। যে সংখ্যা যাচাই করতে পারব না, সেটা ভিডিওতে দেখাব না।
2. আপনার ভয়েস থেকে প্রতিটা শব্দের সময় মাপি।
3. প্ল্যান (শট টেবিল) বানিয়ে বাংলায় আপনাকে দেখাই। **পুরো কাজে শুধু এখানে আপনার OK লাগবে।**
4. OK দিলে বাকি সব আমি নিজে করি: দৃশ্য, ক্যাপশন, সাউন্ড, রেন্ডার, মান-পরীক্ষা, 9:16 আর 1:1।
5. শেষে ফাইল কোথায় আছে বলি। আপনার মতামত `LESSONS.md`-এ লিখে রাখি, যাতে পরেরটা আরও ভালো হয়।

---

## ২. কনটেক্সট ফর্ম (কপি করে ভরুন)

```
/tools-reel
বিষয়: (যেমন: Claude Code-এর আগে যে ৫টা টুল বসাতে হয়)
কাদের জন্য টুল: Claude Code
ভাষা: English
টুল ১: নাম | এক লাইনে কী করে | একটা প্রমাণ বা সংখ্যা (থাকলে) | ইনস্টল কমান্ড (থাকলে)
টুল ২: …
টুল ৩: …
টুল ৪: …
টুল ৫: …
শুরুর কথা (ইচ্ছা হলে): 
শেষে: কমেন্টে ___ লিখলে DM-এ লিংক পাঠাব। আমার হ্যান্ডেল: @___
ভয়েস: ফাইলের পথ  (অথবা: "তুমি বানাও")
BGM: ফাইলের পথ  (অথবা: "প্রম্পট দাও")
```

- শুধু টুলের নাম দিলেও চলবে। বাকিটা আমি খুঁজে বের করি।
- টুল ৩ থেকে ৭টা হতে পারে। রেফারেন্সে ৫টা। ৩টায় প্রায় ৪০ সেকেন্ড, ৫টায় ৫৮, ৭টায় ৮০।
- ভাষা না লিখলে English (রেফারেন্সের মতো)। বাংলা চাইলে লিখুন `ভাষা: বাংলা`; তখন ভয়েসও বাংলা লাগবে।
- ভয়েস আর BGM আগে থেকে না থাকলে আমি স্ক্রিপ্ট লিখে আপনাকে নিচের §৩ আর §৪-এর জন্য হুবহু পেস্টের লেখা দেব, তারপর ফাইল আসা পর্যন্ত থামব।

---

## ৩. ভয়েস (Google AI Studio, আপনার চেনা পদ্ধতি)

**রেফারেন্সের ভয়েস:** ইংরেজি, পুরুষ-কণ্ঠ, আত্মবিশ্বাসী আর **খুব দ্রুত**: ৫৭.৫ সেকেন্ডে ২০৬ শব্দ, মানে প্রতি সেকেন্ডে ৩.৫৮ শব্দ।
সাধারণ পড়ার গতি ২.৫ শব্দ, তাই "দ্রুত" করে বলতে হবে।

| সেটিং | মান |
| --- | --- |
| Model | Flash TTS (Audio) |
| Voice | Sadaltager (আপনার চেনা)। বিকল্প: Puck (Upbeat), Fenrir (Excitable), Charon (Informative) |
| Temperature | 0.7 |

**Style prompt** (লেখার উপরের ঘরে বসান):

```
Read this like a fast, confident tech creator on Instagram Reels. Punchy and clear, about 3.5 words per second. Only a 0.3 second pause between sentences, and a slightly longer beat before each "The first / second / third … is" line. A small rise in energy on tool names. No filler words. Do not sound like an announcer.
```

- স্ক্রিপ্ট: আমি লিখে দেব, হুবহু পেস্ট করবেন। নিজের স্ক্রিপ্ট থাকলে সেটাও চলবে।
- নামানো ফাইল রাখুন `projects/<ভিডিওর নাম>/assets/voice/voice.wav`-এ, অথবা চ্যাটে পথ লিখে দিন, আমি কপি করে নেব।
- ভয়েস একটু ধীর হলে আমি সুর না বদলে ১.১২ গুণ পর্যন্ত দ্রুত করতে পারি।
- নিজের গলায় চাইলে: `tools/voice.mjs` (রেকর্ড করে পরিষ্কার করে)।
- অফলাইন ফলব্যাক: Kokoro ইংরেজি ভয়েস (`am_michael`)। আজ পরীক্ষা করেছি, চলে। তবে Google-এর ভয়েসের চেয়ে সমতল শোনায়।
- বাংলা ভিডিও হলে Piper ব্যবহার করলে ডেসক্রিপশনে ক্রেডিট লাইন দিতে হয়।

---

## ৪. BGM (Lyria, আপনার চেনা পদ্ধতি)

**রেফারেন্সের গান:** গাঢ় ইলেকট্রনিক, ১২৩ থেকে ১২৯ BPM (ধরুন ১২৮), মাইনর কি (B বা A মাইনর, আন্দাজ), পুরো সময় গভীর বেস, কথা নেই।
প্রতি প্রায় ৬ সেকেন্ডে একটা ভারী আঘাত (প্রতি টুলের কার্ডে), মাঝেমধ্যে ০.২ থেকে ০.৫ সেকেন্ডের পুরো নীরবতা, তারপর জোরে আঘাত।

**Lyria প্রম্পট** (ইংরেজিতে পেস্ট করুন):

```
Dark futuristic electronic instrumental for a tech Reel, 128 BPM, minor key (B minor), steady four-on-the-floor kick, deep sub-bass the whole time, tight hi-hats, a sparse plucky synth arpeggio, a short riser and a heavy impact hit about every 6 seconds. Keep the 1 to 4 kHz mid-range open so a voice-over can sit on top. No vocals, no lead melody, 60 seconds, clean ending.
```

- দৈর্ঘ্য ভিডিওর চেয়ে অন্তত ৫ সেকেন্ড বেশি। রাখুন `projects/<ভিডিওর নাম>/assets/music/bgm.mp3`-এ (অথবা চ্যাটে পথ)।
- এখন `assets/music` ফোল্ডারে কোনো গান নেই, তাই BGM আপনাকেই আনতে হবে।
- ⚠️ লাইসেন্স: Lyria-র গান বিজ্ঞাপনে, বিক্রির কাজে বা মনিটাইজড চ্যানেলে লাগাবার আগে Google-এর শর্ত একবার দেখে নিন। যাচাই-করা নিরাপদ পথ Pixabay (নিয়ম: `assets/music/README.md`)। MusicGen কখনো নয়।

---

## ৫. আমি নিজে যা করব (আপনাকে কিছু বলতে হবে না)

স্ক্রিপ্ট, প্ল্যান, প্রতিটা টুলের আলাদা অ্যানিমেটেড দৃশ্য, নিচের টার্মিনাল যেখানে একে একে টুল "ইনস্টল" হয়, প্রতিটা শব্দের ক্যাপশন,
টুলের নিজের রঙ, সব সাউন্ড (ঠিক ছবির মুহূর্তে), দৃশ্য বদলের ফাঁকে ছোট নীরবতা, মিক্স, রেন্ডার, মান-পরীক্ষা।
রং, ফন্ট, গতি, সাউন্ড, ফরম্যাট: এগুলো নিয়ে কিছু জিজ্ঞেস করব না, নিজেই ঠিক করব।

## ৬. যা আপনাকে ঠিক করতে হবে (প্ল্যানের সাথে প্রশ্ন আসবে)

- আপনার হ্যান্ডেল আর কমেন্টের কিওয়ার্ড (ফর্মে না দিলে)।
- মাসকট: আমার সুপারিশ নিজের আলাদা পিক্সেল-মাসকট। রেফারেন্সের কমলা কাঁকড়া-মতো মাসকটটা দেখতে Claude Code-এর নিজের মাসকটের মতো, আর আপনার বিজ্ঞাপনে Claude-এর লোগো রাখতে চাননি।
- ভয়েস আর BGM ফাইল।

## ৭. রেফারেন্সের চেয়ে ভালো কীভাবে (এগুলো সবসময় থাকবে)

1080×1920 (রেফারেন্স 720p)। পড়ার লেখা অন্তত ২৮ px। Facebook/Instagram-এর নিরাপদ এলাকা মানা (উপরে ১৪%, নিচে ৩৫%, ডানে বোতামের সারি)।
আওয়াজ −১৪ LUFS। প্রতিটা সংখ্যার সূত্র থাকবে। 9:16 আর 1:1। রেন্ডারের পর প্রতি আধা সেকেন্ডের ছবি দেখে পরীক্ষা।

## ৮. আরেকটা রেফারেন্স যোগ করতে চাইলে

নতুন রিলটা `assets/refs/ref-02.mp4` নামে রাখুন, আর বলুন "ref-02 মেপে স্কিল শেখাও"। আমি `node tools/ref-analyze.mjs` চালিয়ে মেপে
নেব (ভয়েসের গতি, গানের BPM, নীরবতা, ছবির নমুনা) আর স্কিলের নিয়মে মিলিয়ে দেব।

<<<<< END OF FILE: PROMPT-PACK-tools-reel.md >>>>>

<<<<< FILE: STYLE.md >>>>>

# আমার এডিটিং স্টাইল (STYLE.md)

এই ফাইলটা আপনার রুচির খাতা। Claude প্রতিটা ভিডিও প্ল্যান করার আগে এটা পড়বে। এখানে যা লেখা থাকবে, সেটাই মানবে।

যেকোনো লাইন বদলাতে পারেন: Notepad-এ খুলে লিখে সেভ করলেই হবে।

লাইনের পাশে দুই রকম চিহ্ন আছে:

- **(শেখা)**: আগের দুটো ভিডিও (হিসাব খাতা প্রোমো আর খাতা কার্টুন) বানাতে গিয়ে পরীক্ষা করে পাওয়া নিয়ম। বদলানোর আগে একবার ভাবুন।
- **(বদলান)**: আমার ধরে নেওয়া শুরুর মান। আপনার রুচিমতো বদলে দিন।
- লাইনের শেষে **?** থাকলে ওটা আপনার কাছে প্রশ্ন। উত্তর লিখে দিন।

---

## ১. চ্যানেল আর দর্শক

- পেজ বা চ্যানেলের নাম: ? (বদলান)
- ভাষা: বাংলা। Claude, ChatGPT, Gemini-র মতো প্রোডাক্টের নাম ইংরেজি অক্ষরেই থাকবে। (বদলান)
- কারা দেখে: ? (যেমন: ছোট ব্যবসায়ী, শিক্ষক, AI শিখতে চাওয়া মানুষ) (বদলান)
- বলার ধরন: বন্ধুর মতো, সহজ, সোজাসুজি। "অবিশ্বাস্য", "সেরা" জাতীয় বাড়াবাড়ি শব্দ নয়। (বদলান)
- মূল প্ল্যাটফর্ম: Facebook Reels (খাড়া 9:16)। দ্বিতীয়: YouTube (আড়াআড়ি 16:9)। (বদলান)

## ২. সিরিজ অনুযায়ী ধরন

| সিরিজ | ফরম্যাট | দৈর্ঘ্য | কেমন ভিডিও |
| --- | --- | --- | --- |
| AI সহকর্মী দৈনিক টিউটোরিয়াল | 9:16 | ৪৫–৯০ সেকেন্ড | স্ক্রিন রেকর্ডিং + ভয়েস + ক্যাপশন |
| অফার বা প্রোডাক্ট প্রোমো (যেমন claude-plate-vo) | 9:16, সাথে 1:1 | ৩০–৯০ সেকেন্ড | ভয়েস-ওভার + মোশন গ্রাফিক্স (নড়াচড়া করা লেখা ও ছবি) |
| গল্প বা কার্টুন (যেমন খাতা কার্টুন) | 9:16 | ৩–৫ মিনিট | চরিত্র, সংলাপ, শব্দ |

পুরো টেবিলটাই (বদলান)। নতুন সিরিজ শুরু করলে এখানে একটা সারি যোগ করুন।

## ৩. ফন্ট (অক্ষরের নকশা)

- সাধারণ লেখা আর ক্যাপশন: **Hind Siliguri** (ক্যাপশনে Bold)। (শেখা)
- বড় টাইটেল আর বড় সংখ্যা: **Baloo Da 2**। (শেখা)
- লম্বা বা গম্ভীর লেখা: Tiro Bangla অথবা Noto Serif Bengali। (বদলান)
- ইংরেজি লেখা: Inter। ইংরেজি বড় হেডলাইন: Anton বা Bebas Neue। (বদলান)
- এক ভিডিওতে সর্বোচ্চ ২টা ফন্ট পরিবার। (বদলান)
- বাংলা লেখায় অক্ষরের মাঝে বাড়তি ফাঁক (letter-spacing) একদম নয়। এতে মাত্রা ভেঙে যায়। (শেখা)
- Alkatra ফন্ট শুধু ছোট টাইটেলে, তাও ছবি দেখে নিয়ে: এটা "উজ্জ্বল"-কে "উজজবল" করে দেয়। (শেখা)
- ✓ বা তীর চিহ্ন ফন্টে নেই, তাই এগুলো ছবি (SVG) হিসেবে আঁকা হবে। (শেখা)

## ৪. ক্যাপশন (ভিডিওর উপর লেখা)

- বাংলা ক্যাপশন বসবে `burn-subs.mjs` দিয়ে, যেটা যুক্তাক্ষর (ক্ষ, স্ব, ন্ত) ঠিক রাখে। FFmpeg-এর `subtitles=` দিয়ে কখনো নয়: ওতে যুক্তাক্ষর ভেঙে যায়। (শেখা)
- আকার: 1080p ভিডিওতে প্রায় ৫৯ px (burn-subs-এর নিজের মাপ)। (শেখা)
- ধরন: সাদা লেখা, কালো বর্ডার। পেছনটা খুব ব্যস্ত হলে কালো বাক্সের উপর লেখা। (বদলান)
- Reels-এ যে শব্দটা বলা হচ্ছে, সেটা রঙিন হয়ে জ্বলবে (শব্দ-ধরে-ধরে ক্যাপশন)? ধরে নিচ্ছি হ্যাঁ, হলুদ রঙে। (বদলান)
- এক লাইনে Reels-এ ২–৪টা শব্দ। লম্বা ভিডিওতে পুরো বাক্য। (বদলান)
- **জায়গা (9:16-এ):** মুখ বা স্ক্রিনের লেখা ঢাকবে না। ফ্রেমের উপরের ১৪% আর নিচের ৩৫% খালি রাখবে, কারণ Facebook আর Instagram ওখানে নাম, লেখা আর বোতাম বসায়। ক্যাপশন থাকবে উপর থেকে প্রায় ৬০% নিচে। (বদলান। সূত্র: Meta-র Reels বিজ্ঞাপনের নির্দেশিকা)
- বাক্য শেষ (।) হলে নতুন লাইন। কোনো শব্দ শেষ লাইনে একা ঝুলে থাকবে না। (শেখা)
- সংখ্যা বাংলা অঙ্কে (১২৩) না ইংরেজি অঙ্কে (123)? ধরে নিচ্ছি বাংলা। (বদলান)

## ৫. গতি আর কাট

- **শুরু (হুক):** প্রথম ২ সেকেন্ডে ফলাফল অথবা সবচেয়ে চমকানো কথা। "হ্যালো বন্ধুরা" দিয়ে শুরু নয়। (বদলান)
- Reels-এ প্রতি ২–৩ সেকেন্ডে পর্দায় কিছু বদলাবে: কাট, জুম, B-roll (মূল ভিডিওর ফাঁকে বসানো অন্য দৃশ্য) বা গ্রাফিক। (বদলান)
- লম্বা ভিডিওতে প্রতি ৬–৮ সেকেন্ডে। (বদলান)
- ০.৪ সেকেন্ডের বেশি চুপ থাকা অংশ কেটে ফেলবে। প্রতিটা কাটের দুপাশে সামান্য শ্বাসের জায়গা রাখবে। (বদলান)
- জুম বা ক্যামেরা-ঠেলা সবসময় আসল মাপে (১ গুণ) এসে থামবে, তার বেশি বড় হয়ে নয়। নইলে লেখা কার্ড আর ফ্রেমের বাইরে চলে যায়। (শেখা)
- ছবি থেমে আছে আর কোনো শব্দও নেই: এমন অবস্থা ১.৫ সেকেন্ডের বেশি নয়। (শেখা)
- ইচ্ছা করে রাখা "দম নেওয়ার" ফাঁকা দৃশ্য চলবে, তবে স্টোরিবোর্ডে আগে থেকে লেখা থাকতে হবে। (শেখা)

## ৬. ডিজাইন আর সাজানো

- দর্শককে যা পড়তে হবে, সেই লেখা 1080p-তে অন্তত ২৮ px। ছোট লেবেল অন্তত ২৪ px। (শেখা)
- কার্ড বা প্যানেল লেখার মাপেই হবে। লেখা কখনো কার্ডের বাইরে যাবে না। (শেখা: হিসাব খাতা প্রোমোর ফ্রেম ০৬)
- পাশাপাশি সংখ্যা বা কলাম একই লাইনে, একই উচ্চতায় থাকবে। (শেখা)
- খাড়া (9:16) ভার্সনের জন্য আলাদা করে সাজানো লেআউট সবচেয়ে ভালো। ঝাপসা পেছনের উপর আড়াআড়ি ভিডিও বসানো (fit) শুধু তাড়াহুড়ায়। (বদলান)
- ব্র্যান্ডের রং: ? (২–৩টা রং লিখে দিন, যেমন #1F4FD1) (বদলান)
- হলুদ (#E4A11B) রং ক্রিম পেছনে লেখার জন্য পড়া যায় না। লেখায় গাঢ় হলুদ #AC7914, আর হালকা হলুদ শুধু দাগ বা রেখায়। (শেখা)

## ৭. শব্দ আর মিউজিক

- প্রতিটা দৃশ্য বদলের সময় একটা শব্দ (whoosh বা whoosh-short)। (শেখা)
- ছোট ঘটনায় (বোতাম চাপা, কিছু আসা) হালকা click। সংখ্যা গোনার সময় হালকা typing। (শেখা)
- শব্দ ঠিক ছবির মুহূর্তে বাজবে। প্রতিটা শব্দ ফাইলের শুরুর নীরবতা হিসাব করে একটু আগে বসানো হবে। (শেখা)
- টাকার কথায় cash-register বা coin-drop। স্কুলের দৃশ্যে school-bell, আর classroom-ambience খুব আস্তে। (বদলান)
- impact-bass-1 অনেকক্ষণ বাজে। পরের শব্দ শুনতে হলে ওটা ছোট করে কাটবে। (শেখা)
- মিউজিক ভয়েসের নিচে থাকবে, ভয়েসের চেয়ে অনেক আস্তে। (শেখা)
- মিউজিকের ধরন: ? (যেমন: শান্ত lo-fi, কথা ছাড়া) (বদলান)
- শেষ লাইনে বা CTA-তে (দর্শককে কিছু করতে বলার অংশে) মিউজিক আস্তে আস্তে থামবে। (বদলান)
- এখনো কোনো আসল মিউজিক নেই। Pixabay থেকে নিজে নামিয়ে `assets/music/`-এর মুড ফোল্ডারে রাখতে হবে। নিয়ম `assets/music/README.md`-এ আছে। (শেখা)
- আওয়াজের মাপ: ভয়েস −১৬ LUFS, ফাইনাল ভিডিও −১৪ LUFS। `finish.mjs` এটা নিজেই করে। (শেখা)

## ৮. ভয়েস

- প্রথম পছন্দ: নিজের গলা, `tools/voice.mjs` দিয়ে রেকর্ড আর পরিষ্কার করা। (বদলান)
- AI বাংলা ভয়েস: Piper। পুরুষ = speaker 5, নারী = speaker 3। এটা ব্যবহার করলে ভিডিওর ডেসক্রিপশনে ক্রেডিট লাইন দিতেই হবে (`assets/voices/piper/CREDITS.md`)। (শেখা)
- ইংরেজি AI ভয়েস: Kokoro। এতে বাংলা নেই। (শেখা)
- কার্টুনে চরিত্রের মুখ কথার সাথে নড়বে, হাত-পা নড়বে। গল্পটা শুধু ছবি দেখেই যেন বোঝা যায়। (শেখা: খাতা কার্টুনে আপনার চাওয়া)

## ৯. B-roll আর ছবি

- আগে নিজের জিনিস: নিজের স্ক্রিন রেকর্ডিং, তারপর নিজের মোবাইলের ক্লিপ, তারপর ফ্রি স্টক (Openverse, Pixabay, Pexels), শেষে Claude-এর বানানো গ্রাফিক্স। (বদলান)
- কোনো টুলের নাম বললে পর্দায় সেই টুলটাই দেখাবে। (বদলান)
- চেনা যায় এমন মানুষের ফ্রি স্টক ছবি বিজ্ঞাপনে নয়: ওদের অনুমতিপত্র (model release) থাকে না। (শেখা)
- আইকন: Lucide। অ্যানিমেটেড ইমোজি: Noto (ব্যবহার করলে ক্রেডিট দিতে হবে)। (শেখা)

## ১০. রং আর লুক

- হালকা কনট্রাস্ট, ত্বকের রং স্বাভাবিক। কালার লুক (LUT) লাগালে পুরো শক্তিতে নয়, প্রায় ৬০%। (বদলান)

## ১১. শেষ অংশ (CTA)

- শেষ ২ সেকেন্ডে কী থাকবে: ? (যেমন "ফলো করুন", "কমেন্টে লিখুন …") (বদলান)
- ছোট ভিডিওতে শেষ পর্দা ৩ সেকেন্ডের বেশি নয়। (বদলান)

## ১২. রেফারেন্স (যে ভিডিও দেখে শিখতে চান)

- পছন্দের রিল বা ভিডিও `assets/refs/` ফোল্ডারে রাখুন (ফোল্ডার না থাকলে Claude বানিয়ে নেবে)।
- প্রতিটার জন্য এখানে এক লাইনে লিখুন কী নিতে চান। যেমন: `ref-01.mp4: ক্যাপশনের নাচ আর pop শব্দ`। (বদলান)

## ১৩. কখনো করবে না

- মুখ ঢেকে ক্যাপশন। (বদলান)
- ভয়েসের চেয়ে জোরে মিউজিক। (বদলান)
- বাংলায় letter-spacing, বা `subtitles=` দিয়ে বাংলা ক্যাপশন। (শেখা)
- বিক্রির কাজে HeyGen-এর ফ্রি মিডিয়া, MusicGen বা অন্য কোনো "শুধু অবাণিজ্যিক" জিনিস। (শেখা)
- ভুয়া রিভিউ, ভুয়া টেস্টিমোনিয়াল, AI দিয়ে বানানো মানুষের মুখ। (বদলান)
- আপনার OK ছাড়া রেন্ডার, পাবলিশ বা টাকা খরচ। (শেখা)

---

## এই ফাইল কীভাবে বড় হবে

প্রতিটা ভিডিওর পর আপনার মতামত `LESSONS.md`-এ এক লাইনে লেখা হবে। একই কথা দুবার এলে Claude এখানে নতুন নিয়ম যোগ করার প্রস্তাব দেবে, আর আপনার OK পেলে তবেই যোগ করবে।

<<<<< END OF FILE: STYLE.md >>>>>

<<<<< FILE: VARIANTS.md >>>>>

# ভিডিওর স্টাইল-তালিকা (VARIANTS)

প্রতিটা স্টাইলের একটা **নাম** আর একটা **কোড** আছে (যেমন **AB2 বাবল কাট**)।
আপনি শুধু কোড বা নাম বললেই আমি বুঝব কেমন ভিডিও চান।
নতুন স্টাইল তৈরি হলে এই ফাইলে নতুন লাইন যোগ হবে। তাই কী কী পাওয়া যায়, সবসময় এখানেই দেখবেন।
(মেশিনের জন্য একই তালিকা থাকে `tools/variants.json`-এ।)

---

## ১. আপনি কী করবেন

1. ভিডিওর সব কাঁচা ফাইল একটা ফোল্ডারে রাখুন। যেমন রেকর্ডিং, আলাদা ভয়েস, মিউজিক, B-roll ক্লিপ, ছবি।
2. আমাকে ফোল্ডারটা দিন আর এক লাইনে বলুন ভিডিওটা কী নিয়ে।
   চাইলে স্টাইলের নামও বলতে পারেন। যেমন: "AB2 স্টাইলে বানাও" বা "শুরুতে AB3, বাকিটা AB1"।
3. আমি আগে ফোল্ডারটা মেপে দেখব ফাইলগুলো কোন **ধাঁচের** (নিচে ২ নম্বর অংশ)। তারপর কোন কোন স্টাইল মানাবে, সেটা বলব।
4. আমি পরিকল্পনা (PLAN) দেখাব: কোন সেকেন্ডে পর্দায় কী আসবে। আপনি OK দিলে তবেই বানানো শুরু।
5. ভিডিও দেখে আপনার মতামত দেবেন। আপনার মতামত থেকেই পরের ভিডিও আরও ভালো হয়।

ফোল্ডার মাপার কাজটা করে এই যন্ত্র:
`node tools/route.mjs <ফোল্ডার>`

এটা প্রতিটা ভিডিও ফাইলের কোন অংশে **ক্যামেরা (মুখ)**, কোন অংশে **স্ক্রিন**, কোন অংশে **গ্রাফিক্স** আছে, তা বের করে।
আর প্রতিটা অডিও ফাইলে **মানুষের কথা** আছে না **মিউজিক**, সেটাও বলে।

## ২. ফাইলের ধাঁচ: কোন ধাঁচে কোন স্টাইল

| ধাঁচ | আপনার ফাইল দেখতে কেমন | মানানসই স্টাইল |
| --- | --- | --- |
| S1 | একটা রেকর্ডিং: শুরু/শেষে আপনার মুখ, মাঝে স্ক্রিন। ভয়েস আলাদা ফাইলে | TUT1 |
| S2 | শুধু স্ক্রিন রেকর্ডিং, ভয়েস আলাদা ফাইলে | ছোট হলে PROMO1, বড় হলে TUT1 |
| S3 | স্ক্রিন রেকর্ডিং, রেকর্ড করতে করতেই কথা বলেছেন | এখন EDIT1 (TUT2 পরিকল্পনায় আছে) |
| S4 | পুরোটা আপনার মুখ, কথা বলছেন | বড় হলে EP1 বা AB1–AB5, ছোট হলে AB3 |
| S5 | শুধু ভয়েস (আর মিউজিক), কোনো ভিডিও নেই | REEL1 |
| S6 | কথা ছাড়া ক্লিপ (B-roll, AI ক্লিপ) | কোন কথার সাথে যাবে, আমি জিজ্ঞেস করব |
| S7 | শুধু ছবি | স্লাইডশো |

অস্বাভাবিক মিশ্রণ থাকলে যন্ত্রটা আন্দাজ করে না, "S?" বলে প্রশ্ন করে।

## ৩. স্টাইলগুলো

অবস্থার মানে:
- **তৈরি**: আসল ভিডিওতে ব্যবহার হয়ে প্রমাণিত।
- **বেটা**: ইঞ্জিন বানানো আর ডেমো ভিডিও হয়েছে, কিন্তু আসল কাজে এখনো ব্যবহার হয়নি।
- **পরিকল্পনা**: নকশা আছে, বানানো হয়নি।

### স্ক্রিন রেকর্ডিং থেকে

| কোড | নাম | কী লাগে | দেখতে কেমন | অবস্থা |
| --- | --- | --- | --- | --- |
| TUT1 | ফ্লোটিং মনিটর টিউটোরিয়াল | মুখ+স্ক্রিন রেকর্ডিং, আলাদা ভয়েস, BGM | কাচের ফ্রেমে মুখ আর কার্ড; ভাসমান মনিটরে স্ক্রিন; জুম, লেবেল, টিক, ক্লিকের ঢেউ, কার্সরের আলো, ব্যক্তিগত তথ্য ঝাপসা | তৈরি |
| PROMO1 | গোল্ড কমার্শিয়াল | ছোট স্ক্রিন রেকর্ডিং, ভয়েস, মিউজিক | অ্যাপের বিজ্ঞাপন: জুম, ৩D হেলানো, ক্লিকে ঝলক, সোনালি শেষ কার্ড | তৈরি |
| TUT2 | লাইভ-ভয়েস টিউটোরিয়াল | কথা বলতে বলতে করা স্ক্রিন রেকর্ডিং | TUT1-এর মতো, শুধু আলাদা ভয়েসের বদলে আপনার নিজের বিরতিগুলো ছাঁটা | পরিকল্পনা |

### স্ক্রিন রেকর্ডিং ছাড়া (রোবট নিজে সফটওয়্যার চালায়)

কোনো ফোল্ডার লাগে না। শুধু বলুন কী শেখাতে চান আর কোন সফটওয়্যারে। রোবট নিজে ক্লিক আর টাইপ করে ঝকঝকে ছবি তোলে।
আপনি চাইলে ফোনে মুখ রেকর্ড করবেন, না চাইলে আপনার ক্লোন গলা। পুরো পরিকল্পনা: `docs/auto-tutorial-plan.md`।
claude.ai, ChatGPT, Facebook-এর মতো সাইট নিয়মে বট নিষেধ করে। সেখানে আপনি নিজে কয়েকটা ক্লিক করবেন, যন্ত্র ছবি তুলে নেবে (সহায়ক মোড)।

| কোড | নাম | কী লাগে | দেখতে কেমন | অবস্থা |
| --- | --- | --- | --- | --- |
| AT1 | স্টুডিও জানালা | বিষয় + সফটওয়্যারের লিংক; চাইলে মুখের ভিডিও বা ক্লোন গলা | অন্ধকার পটভূমিতে ব্রাউজার জানালা, উপরে আসল ঠিকানা; ক্যামেরা নিজে বোতামে জুম করে; কার্সর মসৃণ বাঁকা পথে চলে, বলা শব্দেই ক্লিক; ধাপের নম্বরসহ ক্যাপশন; শেষে দরকারি জায়গায় সোনালি ফ্রেম; শুরুতেই সেই ফলাফল দেখিয়ে রিওয়াইন্ড করে প্রথম পাতায় ফেরা; মুখ গোল বাবলে | বেটা (প্রমাণ: projects/autotut-proof, আপনার ক্লোন গলা + হুক, ২০২৬-১১-০১; মুখ এখনো যোগ হয়নি) |
| AT2 | পাশাপাশি ডেস্ক | AT1-এর মতো + মুখের ভিডিও | বাঁ দিকে লম্বা কাচের কার্ডে আপনি, ডানে জানালা; শেষ হওয়া ধাপগুলো আপনার নিচে টিক পায় | পরিকল্পনা |
| AT3 | ফুল জুম | AT1-এর মতো | স্ক্রিন পুরো পর্দা জুড়ে, গভীর জুম আর দ্রুত কাট; শুরু-শেষে আপনি পুরো পর্দায় | পরিকল্পনা |
| AT4 | খাড়া স্ট্যাক | AT1-এর মতো | খাড়া 9:16 রিল: উপরে স্ক্রিন (সাইটের মোবাইল চেহারা থাকলে সেটাই), নিচে আপনি, শব্দে-শব্দে ক্যাপশন | পরিকল্পনা |
| AT5 | ধাপ কার্ড | AT1-এর মতো | প্রতিটা ধাপের আগে বড় নম্বর-কার্ড; যে বোতাম চাপতে হবে সেটা কেটে বড় করে দেখানো | পরিকল্পনা |

### আপনার মুখ (কথা বলা) থেকে

| কোড | নাম | কী লাগে | দেখতে কেমন | অবস্থা |
| --- | --- | --- | --- | --- |
| EP1 | কার্ড স্প্লিট পর্ব | লম্বা কথা-বলা ভিডিও | ইউটিউব পর্ব: পাশে কার্ড, মোশন গ্রাফিক্স, শব্দে-শব্দে বাংলা ক্যাপশন, সাথে রিলস | তৈরি |
| EDIT1 | ক্লিন কাট | যেকোনো নিজের ফুটেজ | চুপ থাকা অংশ কাটা, ক্যাপশন, মিউজিক, রিলস/শর্টসের মাপ | তৈরি |
| AB1 | গ্লাস স্প্লিট | মুখের ভিডিও + B-roll | আপনি পুরো পর্দা থেকে মসৃণভাবে বাঁ দিকের কাচের ফ্রেমে সরে যান; ডান দিকে একটা ভাসমান জানালায় B-roll | বেটা |
| AB2 | বাবল কাট | মুখের ভিডিও + পুরো-পর্দা B-roll | B-roll পুরো পর্দায়; আপনি কোণে একটা গোল বাবলে, যার রিং আপনার গলার সাথে দোলে; দরকারি শব্দে বিশাল সোনালি লেখা ধাক্কা দিয়ে আসে | বেটা |
| AB3 | পাঞ্চ টাইপ | শুধু মুখের ভিডিও | পুরো পর্দায় আপনি; বড় বড় ক্যাপশন; মূল শব্দে মুখে জুম + আইকনসহ স্টিকার; আগের বিকল্প লাল দাগে কাটা পড়ে | বেটা |
| AB4 | কার্ড ফ্যান | মুখের ভিডিও + প্রতিটা বিষয়ের ছবি/ক্লিপ | তালিকা বলার সময়: আপনি ফ্রেমে, পাশে প্রতিটা বিষয়ের কার্ড তার শব্দে পাখার মতো খুলে যায় | বেটা |
| AB5 | ডেটা স্টেজ | মুখের ভিডিও + আপনার বলা সংখ্যা | আপনি ঝাপসা হয়ে পেছনে চলে যান (কোণে ছোট ছবি); সামনের মঞ্চে সংখ্যা গুনে ওঠে, বার-চার্ট বাড়ে, পেছনে আকার বদলানো নকশা | বেটা |

### ভয়েস থেকে (ক্যামেরা ছাড়া)

| কোড | নাম | কী লাগে | দেখতে কেমন | অবস্থা |
| --- | --- | --- | --- | --- |
| REEL1 | টুলস রিল | বিষয়/টুলের তালিকা + ভয়েস + BGM | খাড়া রিল: হুক, প্রতিটা টুলের দৃশ্য, টার্মিনাল, ক্যাপশন, কমেন্ট-কিওয়ার্ড CTA | তৈরি |
| REEL2 | পকেট গ্লাস | ৩–৫টা টুল + ভয়েস + BGM | কাচের ভাসমান ফোন; প্রতিটা রিপোর অ্যাপ-আইকন লাফিয়ে বেরিয়ে কাচের কার্ড খোলে, সুইচ অন হওয়া সারি, টোস্ট; শেষে ৫টা কার্ড আর ইনবক্সের শব্দ (GitHub সিরিজ পর্ব ১) | বেটা |
| REEL3 | স্পিডরান | ৩–৫টা টুল + ভয়েস + BGM | রেসের HUD: প্রতিটা রিপোতে স্পিড-মিটারের কাঁটা এক ধাপ ওঠে, পাশাপাশি ঝটকা প্যান আর আলোর রেখা, নিচে ছুটে চলা রাস্তা (পর্ব ২) | বেটা |
| REEL4 | ভল্ট | ৩–৫টা টুল + ভয়েস + BGM | ঘষা ইস্পাত: ৫টা ডায়াল-তালা একে একে বন্ধ হয়, পাসওয়ার্ড ভেঙে টুকরো, ভল্টের দরজার মতো ঘুরে বন্ধ হওয়া প্লেট, সিলমোহর (পর্ব ৩) | বেটা |
| REEL5 | ফিল্ম রিল | ৩–৫টা টুল + ভয়েস + BGM | এডিটিং ঘর: REC আর টাইমকোডসহ মনিটর, প্রতিটা রিপো টাইমলাইনের একটা ক্লিপ, প্লেহেড এগোয়, ৩-২-১, বিটে কাট আর আলোর ঝলক (পর্ব ৪) | বেটা |
| REEL6 | অফলাইন রাত | ৩–৫টা টুল + ভয়েস + BGM | রাতের আকাশ: প্রতিটা রিপোতে একটা তারা জ্বলে তারামণ্ডল হয়, Wi-Fi বন্ধ তবু চ্যাট উত্তর দেয়, ধীরে ভেসে ওঠা কাচের প্যানেল (পর্ব ৫) | বেটা |
| REEL7 | কাগজের টেবিল | ৩–৫টা টুল + ভয়েস + BGM | উপর থেকে দেখা কাঠের টেবিল: সাবস্ক্রিপশনের বিলে লাল "বাতিল" স্ট্যাম্প, প্রতিটা রিপো ওয়াশি-টেপ লাগানো কাগজ হয়ে পিছলে আসে, কলমের দাগ, রাবার-স্ট্যাম্প প্রমাণ, কাগজ স্তূপে যায় (পর্ব ৬) | বেটা |
| REEL8 | জ্ঞানের সিঁড়ি | ৩–৫টা টুল + ভয়েস + BGM | রাতের লাইব্রেরি উপরে ওঠে: বইয়ের সিঁড়িতে "লেভেল ১–৫", টুপির টোকেন ধাপে ধাপে লাফায়, কার্ড বইয়ের পাতার মতো উল্টে আসে, শুরুতে বইয়ের মলাট খোলে (পর্ব ৭) | বেটা |
| REEL9 | আলপনা | ৩–৫টা টুল + ভয়েস + BGM | মেরুন মাটিতে চালের-গুঁড়োর আলপনা নিজে আঁকা হয়ে ধীরে ঘোরে, ৫টা পদ্মের পাপড়ি রঙে ভরে, "অ" কলমের টানে লেখা হয়, নাম ক্যালিগ্রাফির মতো ফোটে (পর্ব ৮) | বেটা |
| REEL10 | ব্লুপ্রিন্ট | ৩–৫টা টুল + ভয়েস + BGM | নীল নকশার গ্রিড: এলোমেলো কাজের চিপ সারিতে সাজে, ৫টা যন্ত্র-বাক্স তারে জোড়া, সংকেত ছুটে একটা করে জ্বলে, প্যানেল রেখা থেকে খোলে, PART প্লেট (পর্ব ৯) | বেটা |
| REEL1S | টার্মিনাল (সিরিজ) | ৩–৫টা টুল + ভয়েস + BGM + প্রতিটার ইনস্টল কমান্ড | REEL1-এর ডার্ক UI সিরিজ ইঞ্জিনে: উপরে কার্ড, নিচে টার্মিনাল প্রতিটা রিপোর কমান্ড টাইপ করে, বার ভরে, সবুজ টিক, "ইনস্টল" গোনা, নামে হিট-স্টপ (পর্ব ১০; reel.json-এ style "REEL1") | বেটা |

### ফুটেজ ছাড়া ব্যাখ্যা ভিডিও (সব কোডে আঁকা)

| কোড | নাম | কী লাগে | দেখতে কেমন | অবস্থা |
| --- | --- | --- | --- | --- |
| EXP1 | ব্যাখ্যা বোর্ড | বিষয় (কোনো ধারণা বা অ্যাপ, যেটা রেকর্ড করা যায় না) + আপনার ক্লোন গলা + BGM | আড়াআড়ি 16:9 টিউটোরিয়াল, কোনো ফুটেজ নেই: উষ্ণ অন্ধকার বোর্ডে সরল করে আঁকা অ্যাপের জানালা, চ্যাট, ফোল্ডার আর কোডের ফাইল, টেবিল-আর-তাকের ডায়াগ্রাম, সুইচ চালু হওয়া, কার্ড; প্রতিটা জিনিস ঠিক বলা শব্দে আসে; উপরে অধ্যায়ের নাম আর দাগ; নিচে বাক্য-ধরে ক্যাপশন, বলা শব্দ সোনালি; শেষে ইনবক্স-কিওয়ার্ডের ৩ ধাপ | বেটা (প্রমাণ: projects/claude-skills-tutorial, ৫ মিনিট, ২০২৬-১১-০২) |

### মোশন-গ্রাফিক্স B-roll (কোডে বানানো, কোনো ফুটেজ লাগে না)

| কোড | নাম | কী লাগে | দেখতে কেমন | অবস্থা |
| --- | --- | --- | --- | --- |
| MG1 | সিগন্যাল কোর | কিছুই না | ৬ সেকেন্ড, 4K ৬০ fps: আলোর রেখা সোনালি সর্পিল বেয়ে আসে, ৩৪টা বিন্দু সূর্যমুখীর নকশায় স্প্রিংয়ে ফোটে, শক্তি কেন্দ্রে জমে, ষড়ভুজ খোলস খট করে বসে যায়। শব্দসহ আর শব্দ ছাড়া, দুটোই আছে | বেটা |
| MG2 | উন্নতির রেখা | কিছুই না | ৬ সেকেন্ড, 4K ৬০ fps: উজ্জ্বল রেখা নিচে থেকে উঠতে থাকে, ৯টা বিন্দুর উচ্চতা ফিবোনাচি সংখ্যা (১, ২, ৩, ৫ … ৫৫), গতি বাড়তে বাড়তে রেখা চূড়ায় পৌঁছায়। ক্যামেরা রেখার মাথার পিছু নেয়, তারপর পিছিয়ে পুরো ছবি দেখায়। চূড়ায় ঝলক আর ষড়ভুজ চিহ্ন, নিচের বিন্দুগুলো ঢেউয়ের মতো একবার লাফায়। ডান দিক ফাঁকা থাকে, সেখানে শিরোনাম বসানো যায়। শব্দসহ আর শব্দ ছাড়া, দুটোই আছে | বেটা |

<!-- studio:start -->
### মোশন স্টুডিও: ক্লায়েন্টের জন্য, কোডে আঁকা (২০২৬-১১-০৭ থেকে)

ক্লায়েন্ট বা আপনি শুধু কোড বলবেন। দাম আর বিস্তারিত: `docs/business/CATALOG.md`। স্কিল: `motion-studio`।

| কোড | নাম | দেখতে কেমন | কার জন্য | অবস্থা |
| --- | --- | --- | --- | --- |
| PL1 | প্রোডাক্ট লঞ্চ ফিল্ম | The hero video for a launch day: a big kinetic-type promise, the product UI floating in 3D space with a slow camera, three benefit beats, a light sweep and a logo lockup. Keynote-style. | Funded SaaS / AI startups launching or relaunching; Product Hunt and X launch posts; the landing-page hero. | বেটা (নমুনা: `renders/portfolio/PL1_Lumen.mp4`) |
| FD1 | নতুন ফিচারের ঘোষণা | One new feature in 15 seconds: a hook line, the cursor walks to the feature, a smooth punch-in on the UI moment, the result, a CTA. | SaaS teams that ship every week and post updates on X / LinkedIn; changelog emails. | বেটা (নমুনা: `renders/portfolio/FD1_Relay.mp4`) |
| UT1 | থ্রিডি অ্যাপ-ভ্রমণ | The app's screens as glass-edged panels in 3D space; the camera dollies from panel to panel (dashboard → pipeline → report) with parallax and depth of field. | Product pages, sales decks, investor demos — when the product has 3–5 key screens. | বেটা (নমুনা: `renders/portfolio/UT1_AtlasCRM.mp4`) |
| AP1 | অ্যাপ স্টোরের প্রিভিউ | A vertical phone-first preview: taps, swipes and screen changes inside a phone, short benefit captions, made to the App Store / Play Store preview limits (15–30 s). | Mobile app makers — App Store and Google Play listings, Reels and TikTok ads. | বেটা (নমুনা: `renders/portfolio/AP1_Habitly.mp4`) |
| CL1 | রিলিজ নোটের ভিডিও | "What's new in v3.0" — 4–6 updates in quick cuts: version stamp, icon + one line + a tiny UI snippet per update, a closing lockup. | Dev tools and SaaS with monthly releases; community and newsletter posts. | বেটা (নমুনা: `renders/portfolio/CL1_Forge.mp4`) |
| IH1 | ইন্টিগ্রেশন দেখানো | The product as a glowing hub; app icons orbit in, beams connect them, data packets travel, a count of integrations lands. | Automation, API and platform companies announcing integrations or a marketplace. | বেটা (নমুনা: `renders/portfolio/IH1_Nimbus.mp4`) |
| AI1 | এআই এজেন্টের ডেমো | An AI agent at work: a prompt is typed, a labelled agent cursor clicks through a clean UI, status chips tick from 'working' to 'done', the result lands. The 2026 launch format for AI products. | AI startups showing an agent or copilot doing a real task; launch posts on X. | বেটা (নমুনা: `renders/portfolio/AI1_Operator.mp4`) |
| HX1 | কীভাবে কাজ করে — ব্যাখ্যা | A voiced 45–90 s explainer: the problem, the turn, three simple steps with friendly flat illustration and icons, proof, CTA. Script, voice-over and music included. | Landing pages, onboarding, sales calls — health, fintech, B2B services that need clarity. | বেটা (নমুনা: `renders/portfolio/HX1_KindredHealth.mp4`) |
| WF1 | কাজের ধাপের ডায়াগ্রাম | A process as a living diagram: nodes draw in, packets travel the paths, a branch splits on a condition, failures retry, success lights up the end. | Automation, fintech ops, logistics and B2B tools whose value is the workflow. | বেটা (নমুনা: `renders/portfolio/WF1_Ledgerly.mp4`) |
| IA1 | থ্রিডি স্তর-ভাগ ডায়াগ্রাম | Real 3D: the system's layers (edge, API, compute, data, encryption) float apart in an isometric stack with labels, data runs through them, they lock back together. | Infrastructure, security and developer platforms explaining 'how it is built'. | বেটা (নমুনা: `renders/portfolio/IA1_Vaultline.mp4`) |
| DS1 | ডেটার গল্প | Bloomberg / FT-style: a line chart draws itself, the key point is annotated, numbers count up, a comparison resolves — calm editorial type, one accent colour. | Research firms, fintech, reports, investor letters, LinkedIn thought leadership. | বেটা (নমুনা: `renders/portfolio/DS1_MeridianResearch.mp4`) |
| KP1 | বিনিয়োগকারীর জন্য মেট্রিক্স | A funding or milestone announcement: big KPI count-ups (ARR, growth, customers, countries), a growth curve, a donut, a lockup — confident and exact. | Startups announcing a round or a milestone; annual reviews; investor updates. | বেটা (নমুনা: `renders/portfolio/KP1_Northwind.mp4`) |
| MP1 | ম্যাপের গল্প | A world map: hubs light up, routes draw as arcs, a counter runs, the camera pushes into a region — for reach, logistics and expansion stories. | Logistics, travel, global SaaS expansion, NGOs showing reach. | বেটা (নমুনা: `renders/portfolio/MP1_Cargoline.mp4`) |
| NW1 | সংবাদ-ধাঁচের ব্যাখ্যা | Vox-style: paper textures, headline cards, highlighter strokes over key lines, a document zoom, a hand-drawn arrow, a voiced narration on a real topic. | Media brands, newsletters, YouTube explainer channels, think tanks. | পরিকল্পনা |
| LG1 | থ্রিডি লোগো স্টিং | A 5–7 s logo reveal in real 3D: beveled letters flip up, light runs across the bevels, one sub-bass hit and a sparkle on the lock. | Every brand: video intros/outros, YouTube channels, event openers, ads. | বেটা (নমুনা: `renders/portfolio/LG1_Orbit.mp4`) |
| KT1 | নাচন্ত লেখার ম্যানিফেস্টো | A brand belief told in big moving type cut to the beat: words slam, split, swap and morph; colour blocks wipe; it ends on the brand line. | Brand campaigns, hiring videos, event openers, social posts with no footage. | বেটা (নমুনা: `renders/portfolio/KT1_Driftwood.mp4`) |
| BS1 | ব্র্যান্ড-গাইডলাইনের অ্যানিমেশন | The identity animated: logo construction, palette swatches, type specimen, pattern and real applications (cards, app icon, signage) — a living brand book. | Branding agencies presenting work; companies launching a rebrand. | বেটা (নমুনা: `renders/portfolio/BS1_Solace.mp4`) |
| SA1 | খাড়া সোশ্যাল বিজ্ঞাপন | A 15 s vertical ad built for the feed: the hook in the first second, three benefit beats, a big CTA, voice-over and captions inside the platform safe zones. | Performance marketers and DTC / app brands running Meta, TikTok and YouTube Shorts ads. | বেটা (নমুনা: `renders/portfolio/SA1_Pocket.mp4`) |
| EV1 | ইভেন্ট বা ওয়েবিনারের প্রোমো | Date, venue or link, speakers as clean monogram cards (no faces needed), the agenda in three beats, a countdown and a register button. | Conferences, webinars, launches, community meetups, workshops. | বেটা (নমুনা: `renders/portfolio/EV1_BuildersSummit.mp4`) |
| GH1 | থ্রিডি কাচের হিরো টাইটেল | Real 3D glass: a refracting glass form turns in front of a giant headline so the type bends through it, then the tagline lands — the most premium 8–10 seconds a brand can open with. | Landing-page heroes, keynote openers, premium product teasers. | বেটা (নমুনা: `renders/portfolio/GH1_Prism.mp4`) |
| CD1 | ডেভেলপার টুলের লঞ্চ | Syntax-highlighted code on a lit 3D slab rotating into a readable rest, a terminal run, the result — for developer products. | Dev tools, APIs, SDKs, open-source launches. | পরিকল্পনা |
| LT1 | লোয়ার-থার্ড ও টাইটেল প্যাক | A matched set of name bars, section titles, callouts and end cards on a transparent background, in the client's brand, ready to drop on any edit. | YouTubers, podcasts, corporate video teams, event streams. | পরিকল্পনা |
<!-- studio:end -->

### তৈরি ভিডিও থেকে, সব প্ল্যাটফর্মের জন্য (রিলিজ)

| কোড | নাম | কী লাগে | দেখতে কেমন | অবস্থা |
| --- | --- | --- | --- | --- |
| UREEL1 | ইউনিভার্সাল রিল | একটা তৈরি মূল ভিডিও | খাড়া 9:16 রিল, একই ফাইল Facebook, Instagram, X আর YouTube Shorts-এ চলে। সব লেখা চার প্ল্যাটফর্মের নিরাপদ জায়গায়, শব্দে-শব্দে বাংলা ক্যাপশন, শেষ কার্ডে "আমার প্রোফাইলে দেখুন", নরম ছায়া, ৩ সেকেন্ডের বেশি স্থির নয় | বেটা |
| LI1 | LinkedIn কাট | একটা তৈরি মূল ভিডিও | 4:5 মাপ। শুরুতে ফলাফল, প্রথম ৪ সেকেন্ডে নাম-প্লেট, দুই লাইনের শান্ত বাংলা ক্যাপশন, শেষ কার্ডে "মেসেজ করুন" (কমেন্ট চাওয়া নয়) | বেটা |

### অন্যান্য

| কোড | নাম | কী লাগে | অবস্থা |
| --- | --- | --- | --- |
| CP1 | ক্লায়েন্ট প্রোমো | ক্লায়েন্টের নম্বর দেওয়া AI ক্লিপ (1.mp4, 2.mp4 …), তাদের ভয়েস আর BGM। প্রতিটা কাট আর লেখা ঠিক বলা শব্দে; 16:9 আর আলাদা সাজানো 9:16 একসাথে | তৈরি (মোহনা অ্যাগ্রো ফুড, ২০২৬-১১-০৪) |
| AIGEN | AI-তৈরি B-roll | একটা AI ভিডিও সার্ভিস (টাকা লাগে, আপনার সিদ্ধান্ত) | পরিকল্পনা |

## ৪. একই ভিডিওতে স্টাইল মেশানো

AB স্টাইলগুলো একটা ভিডিওর আলাদা আলাদা অংশে বসানো যায়। যেমন:
- **AB3** দিয়ে শুরুর হুক।
- **AB1** দিয়ে ব্যাখ্যা।
- তালিকা এলে **AB4**।
- সংখ্যা এলে **AB5**।
- গল্প বা ভবিষ্যতের কথায় **AB2**।

পরিকল্পনায় আমি দেখাব কোন অংশে কোন স্টাইল বসছে।

## ৫. B-roll কোথা থেকে আসে

1. **আপনার নিজের ক্লিপ।** যেমন আপনার বানানো AI ক্লিপ।
2. **কোডে আঁকা দৃশ্য।** সিঁড়ি বেয়ে লক্ষ্যে ওঠা, প্রাচীন মন্দির, শহরের স্কাইলাইন, নিউরাল নেটওয়ার্ক, সংখ্যার বার-চার্ট, আকার বদলানো নকশা। খরচ নেই, লাইসেন্সের ঝামেলা নেই।
3. **ফ্রি স্টক ভিডিও আর ছবি (Pixabay)।** এর জন্য একটা ফ্রি "API key" (চাবি-কোড) লাগে। আপনি pixabay.com/api/docs থেকে নিয়ে `.env.local` ফাইলে `PIXABAY_API_KEY=` এর পরে বসাবেন। চ্যাটে কখনো লিখবেন না। (Pexels এখন নতুন চাবি দিচ্ছে না।)
4. **AI দিয়ে বানানো ক্লিপ।** আপনার ল্যাপটপে NVIDIA গ্রাফিক্স কার্ড নেই, তাই ComfyUI + Wan এখানে চলবে না: ৫ সেকেন্ডের ক্লিপে আনুমানিক ১০–৭০ ঘণ্টা লাগবে।
   সাশ্রয়ী পথ হলো প্রতি ক্লিপ অনুযায়ী টাকা দেওয়া অনলাইন সার্ভিস: প্রতি ৫ সেকেন্ডের ক্লিপে আনুমানিক ২০–৫০ সেন্ট, মাসে ২০টা ক্লিপে ৪–১০ ডলার।
   কোনটা নেবেন আর টাকা খরচ করবেন কি না, সেটা আপনার সিদ্ধান্ত। পুরো তুলনা আছে `docs/ai-video-generation.md`-এ।

<<<<< END OF FILE: VARIANTS.md >>>>>

<<<<< FILE: business-CLIENT-BRIEF.md >>>>>

# Project brief — Motion design

Thank you for reaching out. This form takes about 10 minutes and lets us quote a fixed price and a fixed date.
Short answers are fine. Anything you skip, we will ask on a short call or by message.

## 1. You and your product
1. Company and product name:
2. Website / app link:
3. In one sentence, what does the product do, and for whom?
4. Who decides on this video (name + role)? One decision-maker keeps revisions fast.

## 2. The video
5. Which style? (pick a code from our catalog, or describe it)
   - PL1 Product Launch Film · FD1 Feature Drop · UT1 3D UI Tour · AP1 App Store Preview · CL1 Release Reel
   - IH1 Integrations · AI1 AI Agent Demo · HX1 How-It-Works Explainer · WF1 Workflow Diagram · IA1 3D Architecture
   - DS1 Data Story · KP1 Metrics Reel · MP1 Map Story · NW1 Editorial Explainer · LG1 3D Logo Sting
   - KT1 Kinetic Type · BS1 Brand System · SA1 Vertical Ad · EV1 Event Promo · GH1 3D Glass Title
   - LK1 Launch Kit · AD10 Ad Pack × 10 · RET1 Monthly Retainer
6. Where will it be used? (landing page, Product Hunt, X / LinkedIn, ads, App Store, sales calls, event screen)
7. The ONE thing a viewer must remember:
8. What should the viewer do after watching? (sign up, book a demo, download, register…)
9. Length you have in mind (seconds) and formats needed (16:9, 9:16, 1:1, 4:5):
10. Deadline (and the launch date it supports):

## 3. Brand
11. Logo (SVG preferred), brand colours (hex), fonts (or "use our website's"):
12. Three videos or brands whose look you love (links) — and one you dislike:
13. Tone: calm & premium / bold & energetic / friendly & warm / technical & precise / other:

## 4. Product material
14. Screenshots or a screen recording of the key screens (we redraw UI cleanly; real data can be blurred or replaced):
15. Numbers or claims you want shown (we only show numbers you confirm in writing):
16. Voice-over? (none / AI voice — we send 3 samples / your own recording) and language:
17. Music mood (or "you choose"):

## 5. Practical
18. Budget range (USD): under 1,000 / 1,000–2,500 / 2,500–5,000 / 5,000+
19. Anything legal we must follow (brand guidelines, regulated claims, accessibility)?

---
**How we work:** fixed price · 30–50 % deposit to start · a plan with a shot table for your OK before production ·
first full draft in 3–7 working days · 2 revision rounds included · all formats, captions (.srt) and cut-downs included ·
full rights to the final video transfer to you on final payment.

<<<<< END OF FILE: business-CLIENT-BRIEF.md >>>>>

<<<<< FILE: business-PLAYBOOK.md >>>>>

# মোশন গ্রাফিক্স দিয়ে আয়ের পথ (প্লেবুক)

লেখা: ৭–৮ নভেম্বর ২০২৬, রাতের কাজ। ভিত্তি: চারটা রিসার্চ রিপোর্ট (`docs/business/research/R1–R4`, প্রতিটা তথ্যের পাশে উৎসের লিংক আর তারিখ আছে) আর আজ রাতে বানানো স্টুডিও-সিস্টেম।

যেখানে লেখা আছে **(যাচাই বাকি)**, সেটা রিসার্চে পাকা প্রমাণ পাওয়া যায়নি। ওটার উপর ভরসা করার আগে নিজে বা একজন CA-কে দিয়ে মিলিয়ে নেবেন।

---

## ০. এক নজরে

- **টাকা কোথায়:** বিদেশের SaaS আর AI স্টার্টআপ। SaaS মানে অনলাইনে মাসিক ভাড়ায় চলা সফটওয়্যার। এরা একটা লঞ্চ ভিডিওর জন্য বড় স্টুডিওকে $৫,০০০–$১৫,০০০ দেয়। ৬১টা আসল কোটেশনের মাঝামাঝি দাম $৯,৬৮০, আর গড়ে লাগে ৭ সপ্তাহ।
- **আমাদের সুবিধা:** আমরা ৩–৭ দিনে দিতে পারি। সব মাপের ভিডিও (16:9, 9:16, 1:1), ক্যাপশন আর ছোট কাট একসাথে দিই। অন্যরা এগুলোর জন্য আলাদা টাকা নেয়।
- **শুরুর দাম:** প্রথম ২–৩টা কাজ $৭৫০–$১,২০০ করে, বদলে ক্লায়েন্টের নামসহ রিভিউ আর লোগো দেখানোর অনুমতি। তারপর $২,০০০–$২,৫০০, আর ৩টা প্রমাণ জমলে $৩,৫০০–$৫,০০০।
- **ক্লায়েন্ট পাওয়ার সেরা পথ:** যে স্টার্টআপ সবে লঞ্চ করেছে বা টাকা তুলেছে, তাদের সরাসরি মেসেজ। সাথে তাদের প্রোডাক্টের ১০–১৫ সেকেন্ডের একটা নমুনা ভিডিও। Upwork আর Contra থেকে প্রথম রিভিউগুলো আসবে।
- **টাকা দেশে আনা:** Payoneer → বাংলাদেশের ব্যাংক (টাকায়) বা bKash। Wise, PayPal আর Stripe বাংলাদেশ থেকে টাকা নেওয়ার জন্য চলে না। ক্রিপ্টো একদম নয় (আইনি ঝুঁকি)।
- **সৎ হিসাব:** প্রথম ৩০ দিনে ১–৩টা কাজ ($৭৫০–$৩,০০০) পাওয়া বাস্তবসম্মত। নিয়মিত $২,০০০+ এর কাজ আসবে ২–৩ মাসে।

---

## ১. কারা টাকা দেয়, কত দেয়, কী কেনে

| ক্লায়েন্ট | কী কেনে | বড় স্টুডিওর দাম | আমাদের শুরুর দাম |
| --- | --- | --- | --- |
| টাকা-তোলা SaaS / AI স্টার্টআপ | লঞ্চ ফিল্ম, ফিচার ভিডিও, ডেমো | $৫,০০০–$১৫,০০০ | $১,২০০–$২,৫০০ |
| B2B সফটওয়্যার কোম্পানি | ব্যাখ্যা ভিডিও, প্রোডাক্ট ট্যুর | মিনিটে $৫,০০০–$৮,০০০ | $১,৫০০–$৩,০০০ |
| অ্যাপ নির্মাতা | App Store প্রিভিউ | $৬০০–$৫,০০০ | $৬০০–$১,২০০ |
| অনলাইনে পণ্য বেচা ব্র্যান্ড (DTC) | মাসে ১০–২০টা খাড়া বিজ্ঞাপন | ১০টার প্যাক $১,০০০–$৩,৫০০ | $১,০০০–$২,০০০ |
| ফিনটেক, গবেষণা প্রতিষ্ঠান | ডেটা আর চার্টের অ্যানিমেশন | $৫,০০০–$১৫,০০০ (ব্যাখ্যা ভিডিও) | $৫০০–$২,০০০ |
| মার্কেটিং টিম (নিয়মিত কাজ) | মাসিক সাবস্ক্রিপশন | মাসে $১,১০০–$১৫,০০০ | মাসে $১,৫০০–$৩,০০০ |

সূত্র: R1 (Yum Yum Videos জুলাই ২০২৬, Flowjam আগস্ট ২০২৬, Wyzowl ২০২৬, এজেন্সির দামের পাতা)।

**ক্লায়েন্ট আসলে কী চায়:**
- বিক্রি বাড়া, লঞ্চের দিনে সাড়া, বিনিয়োগকারীর কাছে পরিষ্কার বোঝানো।
- সময়মতো ডেলিভারি, তাদের ব্র্যান্ডের সাথে হুবহু মিল, পরিষ্কার গল্প।
- কম রিভিশন, সব মাপের ফাইল একসাথে।

**ক্লায়েন্টের সবচেয়ে বড় অভিযোগ:**
- ডেডলাইন পার হয়ে যায়।
- রিভিশন শেষই হয় না।
- লুকানো খরচ বের হয়।
- টেমপ্লেট বা "AI-এর মতো" কাজ।

আমাদের সিস্টেম এই চারটা সমস্যাই কমায়।

**যেখানে প্রতিযোগিতা করব না:** $১১-এর AI অবতার বিজ্ঞাপন বা $৬৮-এর লোগো। ওই বাজারের দাম শেষ হয়ে গেছে। ভিডিওতে AI দিয়ে বানানো মানুষও দেখাব না: ৩৬% দর্শক বলেছেন এতে ব্র্যান্ডের উপর বিশ্বাস কমে।

---

## ২. আপনার সার্ভিস-তালিকা: ক্লায়েন্ট শুধু কোড বলবে

পুরো তালিকা `docs/business/CATALOG.md`-এ (যন্ত্রের জন্য: `tools/studio/catalog.json`)। মোট ৮টা পরিবার:

| পরিবার | কোড | উদাহরণ |
| --- | --- | --- |
| প্রোডাক্ট ও SaaS | PL1, FD1, UT1, AP1, CL1, IH1, AI1 | লঞ্চ ফিল্ম, নতুন ফিচার, থ্রিডি অ্যাপ-ট্যুর, অ্যাপ স্টোর প্রিভিউ, এআই এজেন্ট ডেমো |
| ব্যাখ্যা ভিডিও | HX1, WF1, IA1 | "কীভাবে কাজ করে", কাজের ধাপের ডায়াগ্রাম, থ্রিডি স্তরের ডায়াগ্রাম |
| ডেটা ও সংবাদ-ধাঁচ | DS1, KP1, MP1, NW1 | চার্টের গল্প, বিনিয়োগকারীর সংখ্যা, ম্যাপ, Vox-ধাঁচের ব্যাখ্যা |
| ব্র্যান্ড | LG1, KT1, BS1 | থ্রিডি লোগো, নাচন্ত লেখা, ব্র্যান্ড-গাইড |
| সোশ্যাল ও বিজ্ঞাপন | SA1, EV1 | খাড়া বিজ্ঞাপন, ইভেন্ট প্রোমো |
| থ্রিডি ও প্রিমিয়াম | GH1, CD1, LT1 | কাচের থ্রিডি টাইটেল, ডেভেলপার টুল, লোয়ার-থার্ড প্যাক |
| ফুটেজ এডিটিং (আগে থেকে তৈরি) | AB1–AB5, EP1, TUT1, PROMO1, CP1, UREEL1, EXP1 | কথা বলার ভিডিও, পর্ব, টিউটোরিয়াল, স্ক্রিন-বিজ্ঞাপন, রিলস |
| প্যাকেজ | LK1, AD10, RET1 | লঞ্চ কিট, ১০টা বিজ্ঞাপন, মাসিক চুক্তি |

প্রতিটা কোডের একটা নমুনা ভিডিও আছে (পোর্টফোলিও, `renders/portfolio/`)। সব নমুনা কাল্পনিক ব্র্যান্ডের "কনসেপ্ট কাজ", আর ভিডিওতেই সেটা লেখা আছে। এটা সৎ, আর এজেন্সিগুলোও এভাবেই দেখায়।

---

## ৩. দাম কত চাইবেন

**বিদেশি ক্লায়েন্ট (USD):**

| প্যাকেজ | কী থাকে | প্রথম ৩ ক্লায়েন্ট | পরে | সময় |
| --- | --- | --- | --- | --- |
| টিজার | ১৫–৩০ সেকেন্ড, ১টা মাপ, ক্যাপশন, মিউজিক, ১ বার রিভিশন | $৭৫০ | $১,২০০ | ৫–৭ দিন |
| লঞ্চ ভিডিও | ৩০–৪৫ সেকেন্ড, ভয়েস, 16:9 আর 9:16, ২ বার রিভিশন, .srt | $১,২০০ | $২,০০০–$২,৫০০ | ৭–১০ দিন |
| লঞ্চ কিট (LK1) | ৬০ সেকেন্ডের মূল ভিডিও, ৩টা ছোট কাট, থাম্বনেইল, পোস্টের লেখা | $২,০০০ | $৩,৫০০–$৫,০০০ | ১০–১৪ দিন |
| মাসিক চুক্তি (RET1) | মাসে নির্দিষ্ট সংখ্যক ভিডিও | প্রথম ৯০ দিন নয় | মাসে $১,৫০০–$৩,০০০ | চলমান |

**নিয়ম:**
- প্রতি ২টা কাজ শেষ হলে নতুন কোটেশনে দাম ২৫–৩০% বাড়াবেন।
- "শুরু হয় …" না বলে নির্দিষ্ট দাম বলবেন।
- কাজ শুরুর আগে ৩০–৫০% অগ্রিম নেবেন।
- ডলারে দাম বলবেন। বাংলাদেশে থাকাটা খরচের সুবিধা, কম দামের কারণ নয়।

**দেশি ক্লায়েন্ট (টাকা):**
- প্রথম অফার: **৳৩৫,০০০–৬০,০০০-এ "Facebook/Reels বিজ্ঞাপন প্যাক"** (১৫–২০ সেকেন্ডের ৩টা বাংলা ভিডিও)।
- নতুন স্টুডিওর ৩০–৬০ সেকেন্ডের মোশন ব্যাখ্যা ভিডিওর সম্ভাব্য দাম ৳৪০,০০০–১,৫০,০০০ (অনুমান)।
- ৳১–১০ লাখের কাজ মানে বড় ব্র্যান্ড আর বড় প্রচারাভিযান।
- স্থানীয় নিয়ম: ৫০% অগ্রিম, ৫০% ডেলিভারিতে।
- সতর্কতা: ২০২৬-এর প্রথম ছয় মাসে বাংলাদেশের স্টার্টআপে বিনিয়োগ ৯৫% কমেছে। তাই প্রতিষ্ঠিত কোম্পানি, ই-কমার্স, এডটেক, ব্যাংক আর NGO-কে টার্গেট করবেন।

---

## ৪. ক্লায়েন্ট কোথা থেকে আসবে

**ক্রম (নতুনদের জন্য সবচেয়ে কাজের আগে):**

1. **সরাসরি মেসেজ (আউটবাউন্ড):** যে স্টার্টআপ সবে লঞ্চ করছে বা টাকা তুলেছে। খুঁজবেন Product Hunt-এর "শীঘ্রই আসছে" তালিকা, গত ৩০ দিনের ফান্ডিং খবর (TechCrunch, Crunchbase) আর Y Combinator-এর নতুন ব্যাচে।
   - সেরা ৫ জনকে তাদের প্রোডাক্টের ১০–১৫ সেকেন্ডের নমুনা পাঠাবেন। নমুনায় জলছাপ থাকবে আর "concept" লেখা থাকবে। প্রকাশ করবেন না।
2. **LinkedIn আর X-এ পোস্ট:** সপ্তাহে ২–৩টা ক্লিপ (পোর্টফোলিওর ভিডিও, আগে-পরে, কাজের ধাপ)। এতে বিশ্বাস তৈরি হয়।
3. **Upwork আর Contra:** প্রথম রিভিউগুলোর জন্য। Upwork-এ একটা বিশেষ প্রোফাইল খুলবেন: "SaaS launch and product explainer videos", সাথে ৬০ সেকেন্ডের পরিচয় ভিডিও।
4. **পরে:** Fiverr Pro (৫–১০টা অর্ডারের পর), Toptal (১ বছর পর)।

**মেসেজের নমুনা (ইংরেজি, আপনার নামে বসিয়ে):** `docs/business/client-kit/OUTREACH.md`।

**সংখ্যা:**
- সপ্তাহে ৩০টা যোগাযোগ, তার মধ্যে ৫টায় নমুনা ভিডিও।
- ৩০ দিনে মোট ১২০টা যোগাযোগ।
- উত্তর আসতে পারে প্রায় ৪%, মানে ৪–৬টা। কল হবে ৩–৪টা, কাজ ১–২টা।

**আইন:** ঠান্ডা ইমেইলে (যাকে আগে চিনতেন না) নিজের আসল নাম-ঠিকানা আর "আর মেইল চাই না" বলার সহজ পথ রাখবেন (আমেরিকার CAN-SPAM আইন)। ইউরোপের মানুষকে কম আর প্রাসঙ্গিক মেইল দেবেন (GDPR)।

**মেইল পাঠানো:** আপনার OK ছাড়া Claude কাউকে মেসেজ পাঠাবে না। Claude খসড়া বানাবে, আপনি দেখে পাঠাবেন।

---

## ৫. টাকা দেশে আনা (সবচেয়ে পরিষ্কার পথ)

1. **ফ্রিল্যান্সার আইডি** (বিনামূল্যে)। শর্ত: গত ১২ মাসে $৫০ আয়। প্রথম পেমেন্টের পরে আবেদন করবেন।
2. **Payoneer** (নিজের নামে, USD অ্যাকাউন্ট) খুলে নিজের **বাংলাদেশি ব্যাংক অ্যাকাউন্ট** যুক্ত করবেন। ব্যাংককে জিজ্ঞেস করে নেবেন তারা উৎসে কর কাটে কি না।
3. চাইলে ছোট টাকা দ্রুত তুলতে **bKash** যুক্ত করবেন।
4. ইনভয়েসে লিখবেন: আপনার আইনি নাম, ঠিকানা, আর "motion graphics video production services"। প্রথম কাজে চাইলে Upwork বা Contra-র এসক্রো ব্যবহার করবেন। এসক্রো মানে প্ল্যাটফর্ম টাকা আটকে রাখে, কাজ শেষে আপনাকে দেয়।
5. প্রতিটা ক্লায়েন্টের জন্য আলাদা ফোল্ডার: চুক্তি, ইনভয়েস, প্ল্যাটফর্মের স্টেটমেন্ট, ব্যাংকের রসিদ। জুলাই ২০২৬-এর বাংলাদেশ ব্যাংকের সার্কুলার অনুযায়ী এগুলোই আয়ের প্রমাণ।

**যা চলবে না:**
- **Wise:** বাংলাদেশ থেকে টাকা নেওয়া যায় না।
- **PayPal:** ব্যবসার টাকা নেওয়ার জন্য বাংলাদেশে চালু নেই।
- **Stripe:** বাংলাদেশ নেই। Stripe Atlas দিয়ে আমেরিকায় কোম্পানি খোলা যায়, $৫০০ + বছরে খরচ, আর বাংলাদেশ ব্যাংকের অনুমতি লাগতে পারে। প্রথম ৯০ দিনে দরকার নেই।
- **ক্রিপ্টো:** একদম না। বাংলাদেশ ব্যাংক স্বীকার করে না, বৈদেশিক মুদ্রা আইনের ঝুঁকি আছে।

**কর (যাচাই বাকি):**
- ২০২৬-২৭ বাজেটে ফ্রিল্যান্সারদের আয়কর আর ভ্যাট পুরো মওকুফের প্রস্তাব এসেছে, ব্যাংকের ৭.৫% কাটাও বাদ দেওয়ার ঘোষণা হয়েছে। কিন্তু ফাইন্যান্স বিল ঠিক এভাবে পাশ হয়েছে কি না নিশ্চিত হওয়া যায়নি।
- আইটি রপ্তানিতে ৪% নগদ প্রণোদনা আছে কি না, সেটাও যাচাই বাকি।
- **আপনি নিজেই হিসাবরক্ষক, তবু একবার একজন CA-র সাথে বসে নেবেন।**

---

## ৬. বাধা আর তার সমাধান

| বাধা | কেন হয় | সমাধান |
| --- | --- | --- |
| কোনো রিভিউ নেই | নতুন | প্রথম ৩টা কাজ কম দামে, বদলে নামসহ রিভিউ। ২৩টা কনসেপ্ট নমুনা (৭–৮ নভেম্বর রাতের কাজ)। Upwork আর Contra থেকে প্ল্যাটফর্মের রিভিউ |
| **চাকরির চুক্তি** | শাহীন স্কুলে চাকরি করছেন | চুক্তিতে বাইরের কাজ নিষেধ আছে কি না পড়ে নেবেন। দরকারে লিখিত অনুমতি |
| ইংরেজিতে কথা | মাতৃভাষা নয় | Claude প্রস্তাব, মেইল আর উত্তর লেখে। Loom-এ ভিডিও মেসেজ। কল কম, লিখিত যোগাযোগ বেশি |
| সময়ের পার্থক্য | আমেরিকা ১০–১২ ঘণ্টা পিছিয়ে | দিনে দুটো নির্দিষ্ট সময়ে উত্তর (সকাল আর রাত)। বেশিরভাগ যোগাযোগ লিখিত |
| ল্যাপটপ ধীর | RAM কম | এক সাথে একটার বেশি রেন্ডার নয় (সিস্টেম নিজেই লাইনে রাখে)। বড় কাজ ক্লাউড মেশিনে (GitHub রেপো থেকে) |
| টাকা আনার পথ নেই | PayPal নেই | Payoneer + ব্যাংক (অংশ ৫) |
| কাজের মান নিয়ে ভয় | — | প্রতিটা ভিডিও যন্ত্রে পরীক্ষা হয় (লেখার মাপ, রঙের কনট্রাস্ট, শব্দের মাপ, ফাঁকা নীরবতা), আর প্রতিটা দৃশ্যের ছবি চোখে দেখা হয় |
| লাইসেন্স | কিছু জিনিস বিক্রির কাজে চলে না | ক্লায়েন্টের ভিডিওতে শুধু বাণিজ্যিক-লাইসেন্সের জিনিস: OFL ফন্ট, Pixabay আর CC0 শব্দ, Lucide আইকন। চুক্তিতে টাকা পরিশোধের পর স্বত্ব ক্লায়েন্টের |
| নিজের সময় কম | চাকরি করেন | দিনে দুটো নির্দিষ্ট সময়, একসাথে সর্বোচ্চ ২টা চলমান প্রজেক্ট। নির্মাণের কাজ Claude আর এজেন্টরা করে |

---

## ৭. প্রথম ৩০ দিনের পরিকল্পনা

ধরে নিচ্ছি আপনার নিজের সময় সপ্তাহে ৮–১০ ঘণ্টা। ভিডিও বানাবে Claude আর এজেন্টরা।

**সপ্তাহ ১ (৮–১৪ নভেম্বর): ভিত্তি**
- Payoneer খোলা, ব্যাংক যুক্ত করা, চাকরির চুক্তি পড়া, একজন CA-র সাথে এক ঘণ্টা।
- পোর্টফোলিও পাতা আর শোরিল দেখে মতামত দেওয়া (আজ রাতে তৈরি, `renders/portfolio/`)। শোরিল মানে সেরা অংশগুলো জোড়া দেওয়া ছোট ভিডিও।
- পোর্টফোলিও সাইট অনলাইনে তোলা। আপনার OK পেলে Claude Vercel-এ তুলতে পারে।
- Upwork প্রোফাইল (বিশেষ প্রোফাইল + ৬০ সেকেন্ডের পরিচয় ভিডিও), Contra প্রোফাইল।

**সপ্তাহ ২ (১৫–২১ নভেম্বর): যোগাযোগ শুরু**
- ৬০ জন সম্ভাব্য ক্লায়েন্টের তালিকা: Product Hunt থেকে ৩০, নতুন ফান্ডিং পাওয়া ২০, YC-র ১০। Claude তালিকা বানাবে, আপনি দেখবেন।
- ২৫–৩০টা যোগাযোগ, সেরা ৫ জনকে নমুনা ভিডিও। LinkedIn আর X-এ ৩টা পোস্ট।
- Upwork-এ ৮–১০টা প্রস্তাব।

**সপ্তাহ ৩ (২২–২৮ নভেম্বর): ফলো-আপ আর দেশি বাজার**
- আগের সপ্তাহের যোগাযোগে ফলো-আপ, আর নতুন ৩০টা যোগাযোগ।
- যারা উত্তর দেবে তাদের সাথে কল। ২৪ ঘণ্টার মধ্যে নির্দিষ্ট দামের প্রস্তাব, ৩০–৫০% অগ্রিম।
- দেশি ১০টা পরিচিত মানুষ আর ১০টা ব্র্যান্ডকে "Reels বিজ্ঞাপন প্যাক" অফার। ব্র্যান্ড খুঁজবেন Facebook Ad Library-তে, মানে যারা এখন বিজ্ঞাপন চালাচ্ছে।

**সপ্তাহ ৪ (২৯ নভেম্বর – ৬ ডিসেম্বর): ডেলিভারি আর প্রমাণ**
- প্রথম কাজ ৭–১০ দিনে ডেলিভারি।
- ক্লায়েন্টের কাছে রিভিউ, লোগো দেখানোর অনুমতি আর একজন নতুন ক্লায়েন্টের পরিচয় চাইবেন।
- কেস স্টাডি প্রকাশ। ২টা কাজ শেষ হলে নতুন দাম ২৫% বেশি।

**প্রতি সপ্তাহে যা গুনবেন:** যোগাযোগ, নমুনা, উত্তর, কল, প্রস্তাব, কাজ পাওয়া, আয়, ডেলিভারির দিন।

---

## ৮. কাজটা কীভাবে হবে (সিস্টেম)

1. ক্লায়েন্ট ফর্ম পূরণ করে (`docs/business/client-kit/CLIENT-BRIEF.md`, ইংরেজিতে): লক্ষ্য, দর্শক, মূল কথা, ব্র্যান্ডের রং আর ফন্ট, লোগো, স্ক্রিনশট, কোড (যেমন PL1)।
2. Claude কোড থেকে প্রজেক্ট খোলে: `node tools/studio/new-piece.mjs <নাম> --code=PL1 --brand=…`। প্ল্যান লেখে (PLAN.md) আর যন্ত্রে পরীক্ষা করে।
3. প্ল্যানে আপনার বা ক্লায়েন্টের OK আসার পর এজেন্টরা ভিডিও বানায়। স্টুডিও-কিটে গতি, শব্দ আর ক্যামেরার সব নিয়ম আগে থেকেই বসানো আছে।
4. প্রতিটা ভিডিও যন্ত্রে পরীক্ষা হয় (`tools/studio/check.mjs`), তারপর একটা একটা করে রেন্ডার (`tools/studio/render-queue.mjs`)। সব মাপ, ক্যাপশন আর থাম্বনেইল একসাথে তৈরি হয়।
5. ডেলিভারি: Google Drive লিংক বা WeTransfer, সাথে ইনভয়েস।
6. ক্লায়েন্টের মতামত LESSONS.md-তে যায়, আর সিস্টেম পরের বারের জন্য আরো ভালো হয় (CLAUDE.md §0f)।

একসাথে অনেক এজেন্ট কাজ করার নিয়ম লেখা আছে `docs/studio/AGENT-BRIEF.md` আর `.claude/agents/`-এ।

---

## ৯. রেপো আর স্কিল বিক্রি করা যাবে কি?

সৎ উত্তর: **সবচেয়ে ভালো পথ হলো রেপো বিক্রি না করে রেপো দিয়ে সার্ভিস বিক্রি করা।** এই ফোল্ডারের আসল দাম তার রুচির নিয়ম, যন্ত্র-পাহারা আর প্রমাণিত ধাপে। এগুলো আপনার প্রতিযোগিতার সুবিধা, আর বিক্রি করলে সেটা চলে যায়।

| পথ | আয়ের সম্ভাবনা | পরিশ্রম | মন্তব্য |
| --- | --- | --- | --- |
| ১. প্যাকেজ-সার্ভিস (অংশ ৩) | সবচেয়ে বেশি, দ্রুত | মাঝারি | এখনই শুরু করা যায় |
| ২. বাংলায় কোর্স বা কমিউনিটি ("AI দিয়ে মোশন গ্রাফিক্স") | মাঝারি | মাঝারি | ইংরেজিতে এমন অনেক কন্টেন্ট ফ্রি, বাংলায় প্রতিযোগিতা যাচাই বাকি |
| ৩. পেইড স্কিল-প্যাক ($৩৯–$৯৯ একবারে) | কম | কম | কোনো অফিসিয়াল পেইড মার্কেটপ্লেস নেই। Gumroad-এ বেচা যায় |
| ৪. এজেন্সিকে হোয়াইট-লেবেল সার্ভিস (তাদের নামে আমরা বানাই) | ভালো, পরে | বেশি | আগে নিজের কাজের রেকর্ড লাগবে |
| ৫. টেমপ্লেট বিক্রি | কম | মাঝারি | HyperFrames-এ এমনিতেই ৪৫০টা ফ্রি ব্লক আছে |
| ৬. SaaS ওয়েবসাইট (মানুষ নিজে ভিডিও বানাবে) | অনেক, কিন্তু অনিশ্চিত | অনেক বেশি | বাজার ভিড়ে ভরা (Jitter, Creatomate, HeyGen…)। আগে সার্ভিস থেকে টাকা আর ক্লায়েন্টের চাহিদা জানুন |

**বিক্রির আগে লাইসেন্সের লাল পতাকা (R4):**
- **Pixabay-এর শব্দ:** ভিডিওর ভেতরে চলবে, কিন্তু কাঁচা mp3 ফাইল হিসেবে বিক্রি করা রেপোতে দেওয়া যাবে না। বিক্রির কপিতে শুধু CC0 শব্দ রাখতে হবে, বা শব্দ নামানোর একটা স্ক্রিপ্ট দিতে হবে।
- **GSAP:** বাণিজ্যিক কাজে ফ্রি। কিন্তু Webflow-এর প্রতিযোগী এমন কোডবিহীন অ্যানিমেশন টুল বানানো নিষেধ। SaaS বানানোর আগে খেয়াল রাখতে হবে।
- **নাম:** প্রোডাক্টের নামে "Claude" বা "Anthropic" ব্যবহার করা যাবে না।
- **Piper ভয়েস:** প্রতিটা ভয়েসের লাইসেন্স আলাদা, বিক্রির আগে মিলিয়ে নিতে হবে।
- **Gemini আর Lyria-র তৈরি অডিও:** আপনার কাজে ব্যবহার করা যাবে, কিন্তু অডিও-লাইব্রেরি হিসেবে বিক্রি নয়। প্রতিটা ক্রেতার নিজের API key লাগবে।
- **বিক্রির আগে যা লাগবে:** `LICENSE` আর `THIRD-PARTY-NOTICES.md` ফাইল, আর গোপন চাবি (.env) আছে কি না পুরো স্ক্যান।

---

## ১০. ভবিষ্যতের SaaS (আপনার স্বপ্নের ওয়েবসাইট)

যা লাগবে:
1. ওয়েবসাইট: ক্লায়েন্ট ফর্ম পূরণ করবে।
2. LLM: ফর্ম থেকে piece.json আর পাতা লিখবে।
3. ক্লাউড রেন্ডার মেশিন: ভিডিও বানাবে। Remotion-এর হিসাবে প্রতি মিনিট রেন্ডারে প্রায় $০.০২।
4. পেমেন্ট।

আজ রাতের কিট এর ভিত্তি। প্রতিটা স্টাইল এখন "কোড + ডেটা"। মানে মডেল শুধু ডেটা লেখে, চেহারার সিদ্ধান্ত কোডে থাকে। ঠিক এটাই একটা SaaS-এর ইঞ্জিন।

কখন করবেন: সার্ভিস থেকে মাসে নিয়মিত $২,০০০+ আসার পর, আর অন্তত ২০ জন ক্লায়েন্ট কী চায় সেটা জানার পর।

---

## ১১. কানেক্টর লাগবে কি?

এখনই কোনোটা বাধ্যতামূলক নয়, কাজ চলবে। তবে এগুলো থাকলে কাজ দ্রুত হবে:

| কানেক্টর | কী কাজে | অবস্থা |
| --- | --- | --- |
| Gmail | ক্লায়েন্টকে মেইলের খসড়া (আপনি দেখে পাঠাবেন) | যুক্ত আছে |
| Google Drive | ক্লায়েন্টকে ভিডিও ডেলিভারি, তাদের লোগো আর ফাইল নেওয়া | যুক্ত আছে |
| Vercel | পোর্টফোলিও ওয়েবসাইট অনলাইনে তোলা (আপনার OK লাগবে) | যুক্ত আছে |
| GitHub | পুরো ফোল্ডারের ব্যাকআপ, ক্লাউডে কাজ | চলছে (git push) |
| Figma / Canva | ক্লায়েন্টের ব্র্যান্ড ফাইল সরাসরি আনা | লগইন লাগবে (/mcp) |
| Notion / HubSpot | ক্লায়েন্ট তালিকা আর ফলো-আপের হিসাব (CRM) | লগইন লাগবে (/mcp) |
| Shopify | পরে ডিজিটাল প্রোডাক্ট (টেমপ্লেট, কোর্স) বেচতে | যুক্ত আছে, এখন দরকার নেই |

---

## ১২. আজ রাতে কত খরচ হয়েছে

- ৭টা মিউজিক (Lyria, আপনার পেইড key): ৭ × $০.০৮ = **$০.৫৬**।
- ৩টা ইংরেজি ভয়েস-ওভার (Gemini): প্রায় **$০.০১৪**।
- অন্য কোনো পেইড সার্ভিস ব্যবহার হয়নি।

<<<<< END OF FILE: business-PLAYBOOK.md >>>>>

<<<<< FILE: explainer.example.json >>>>>

```json
{
 "title": "Claude Skills: স্কিল কী, কেন, কীভাবে (৫ মিনিটে)",
 "script": "build/voice-script.txt",
 "voice": "assets/media/voice/voice.wav",
 "minMatch": 0.8,
 "lead": 0.25,
 "tail": 2.6,
 "holds": {
  "2": 0.6,
  "3": 0.3,
  "8": 0.35,
  "15": 0.3,
  "25": 0.6,
  "28": 0.4,
  "32": 0.3,
  "37": 0.3,
  "40": 0.3,
  "42": 0.2
 },
 "music": {
  "file": "assets/media/music/bgm-long.wav",
  "from": 0,
  "lufsUnder": -35,
  "lufsGap": -29
 },
 "display": {
  "স্কিল ডট এমডি": "SKILL.md",
  "জিপ": "ZIP",
  "জিপের": "ZIP-এর"
 },
 "brand": "Claude Skills",
 "chapters": [
  {
   "at": "L1",
   "name": "শুরু"
  },
  {
   "at": "L4",
   "name": "১ · সমস্যা"
  },
  {
   "at": "L9",
   "name": "২ · স্কিল কী"
  },
  {
   "at": "L16",
   "name": "৩ · কেন স্কিল দরকার"
  },
  {
   "at": "L26",
   "name": "৪ · তৈরি স্কিল"
  },
  {
   "at": "L29",
   "name": "৫ · চালু করা"
  },
  {
   "at": "L33",
   "name": "৬ · নিজের স্কিল"
  },
  {
   "at": "L38",
   "name": "৭ · কোথায় কাজে লাগে"
  },
  {
   "at": "L41",
   "name": "৮ · Claude Code"
  },
  {
   "at": "L43",
   "name": "শেষ কথা"
  }
 ],
 "scenes": [
  {
   "type": "editor",
   "at": "L1",
   "desc": "অন্ধকার বোর্ডে একটা এডিটরের টাইমলাইন নিজে নিজে ভরে ওঠে (স্ক্রিপ্ট, গ্রাফিক্স, সাউন্ড, ভয়েস), সোনালি প্লেহেড চলে; উপরে চিপ",
   "text": "Claude নিজে বানাচ্ছে…",
   "badge": "Claude নিজে বানাচ্ছে…",
   "title": "টাইমলাইন",
   "tracks": [
    {
     "label": "স্ক্রিপ্ট",
     "color": "#7FA7D9",
     "clips": [
      [
       0,
       0.34
      ],
      [
       0.36,
       0.3
      ],
      [
       0.68,
       0.3
      ]
     ],
     "at": "L2:স্ক্রিপ্ট"
    },
    {
     "label": "গ্রাফিক্স",
     "color": "#E07A55",
     "clips": [
      [
       0,
       0.22
      ],
      [
       0.24,
       0.4
      ],
      [
       0.66,
       0.32
      ]
     ],
     "at": "L2:গ্রাফিক্স"
    },
    {
     "label": "সাউন্ড",
     "color": "#D9B35C",
     "clips": [
      [
       0.05,
       0.12
      ],
      [
       0.3,
       0.1
      ],
      [
       0.55,
       0.14
      ],
      [
       0.8,
       0.12
      ]
     ],
     "at": "L2:সাউন্ড"
    },
    {
     "label": "ভয়েস",
     "color": "#8CC69E",
     "clips": [
      [
       0,
       0.48
      ],
      [
       0.5,
       0.48
      ]
     ]
    }
   ],
   "panelTitle": "যে স্কিল দিয়ে বানানো",
   "skills": [
    "voice-clone",
    "explainer",
    "reel-cutdown",
    "release-kit",
    "post-copy"
   ],
   "skillsAt": "L2:Claude",
   "shots": [
    {
     "at": "L2:স্ক্রিপ্ট",
     "desc": "বলার সাথে সাথে স্ক্রিপ্ট, গ্রাফিক্স, সাউন্ড ট্র্যাক একে একে সোনালি হয়ে জ্বলে"
    },
    {
     "at": "L2:Claude",
     "desc": "ডানের প্যানেলে ৫টা আসল স্কিলের নাম সবুজ টিকসহ একে একে আসে",
     "text": "voice-clone · explainer · reel-cutdown · release-kit · post-copy"
    }
   ]
  },
  {
   "type": "promise",
   "at": "L3",
   "desc": "বড় করে Claude Skills, উপরে কমলা কিকার; প্রথম কার্ড আসে",
   "text": "৫ মিনিটে শিখুন · Claude Skills · ১ স্কিল কী",
   "kicker": "৫ মিনিটে শিখুন",
   "title": "Claude Skills",
   "items": [
    {
     "text": "স্কিল কী",
     "at": "L3:স্কিল"
    },
    {
     "text": "কাজ কীভাবে বদলায়",
     "at": "L3:বদলে"
    },
    {
     "text": "কীভাবে ব্যবহার করবেন",
     "at": "L3:ব্যবহার"
    }
   ],
   "shots": [
    {
     "at": "L3:বদলে",
     "desc": "দ্বিতীয় আর তৃতীয় কার্ড বলা শব্দে আসে",
     "text": "২ কাজ কীভাবে বদলায় · ৩ কীভাবে ব্যবহার করবেন"
    }
   ]
  },
  {
   "type": "chat",
   "at": "L4",
   "title": "Claude",
   "desc": "চ্যাট জানালা খোলে (সমস্যা অধ্যায়)",
   "newChat": {
    "show": "start",
    "at": "L8:চ্যাট"
   },
   "messages": [
    {
     "who": "user",
     "at": "L5:রিপোর্ট",
     "text": "**মাসিক রিপোর্ট** বানাও।",
     "rows": [
      {
       "text": "১. ফরম্যাট: টেবিল আকারে",
       "at": "L6:ফরম্যাট"
      },
      {
       "text": "২. শিরোনাম: স্কুলের নাম আর মাস",
       "at": "L6:শিরোনাম"
      },
      {
       "text": "৩. টাকা: ৳ চিহ্ন আর কমা দিয়ে",
       "at": "L6:টাকার"
      }
     ]
    },
    {
     "who": "ai",
     "at": "L6:লিখবে>",
     "text": "ঠিক আছে, বানিয়ে দিচ্ছি।"
    },
    {
     "who": "user",
     "at": "L7:একদিন",
     "text": "মার্চের **মাসিক রিপোর্ট** বানাও।",
     "rows": [
      {
       "text": "১. ফরম্যাট: টেবিল আকারে",
       "at": "L7:একদিন+0.3"
      },
      {
       "text": "২. শিরোনাম: স্কুলের নাম আর মাস",
       "at": "L7:একদিন+0.6"
      }
     ]
    }
   ],
   "clear": {
    "at": "L8:খুললেই",
    "text": "আবার প্রথম থেকে শেখাতে হবে…"
   },
   "aside": [
    {
     "type": "chips",
     "title": "প্রতি মাসে একই কথা",
     "y": 170,
     "items": [
      {
       "text": "জানুয়ারি",
       "at": "L6:প্রতিবার"
      },
      {
       "text": "ফেব্রুয়ারি",
       "at": "L6:প্রতিবার+0.5"
      },
      {
       "text": "মার্চ",
       "at": "L6:প্রতিবার+1.0"
      }
     ],
     "badge": {
      "text": "একই কথা ৩ বার",
      "at": "L6:লিখবে"
     }
    },
    {
     "type": "report",
     "at": "L7:রিপোর্ট",
     "badAt": "L7:অন্যরকম",
     "title": "মার্চের রিপোর্ট",
     "y": 600,
     "rows": [
      [
       "শিরোনাম",
       "আমাদের স্কুল · মার্চ"
      ],
      [
       "মোট আদায়",
       "245000",
       true
      ],
      [
       "বকেয়া",
       "12500",
       true
      ]
     ]
    }
   ],
   "shots": [
    {
     "at": "L5:রিপোর্ট",
     "desc": "আপনার মেসেজ আসে: মাসিক রিপোর্ট বানাও",
     "text": "মাসিক রিপোর্ট বানাও।"
    },
    {
     "at": "L6:প্রতিবার",
     "desc": "মেসেজে নিয়মগুলো একটা একটা করে যোগ হয়; ডানে মাসের চিপ জমে, লাল ব্যাজ",
     "text": "১. ফরম্যাট · ২. শিরোনাম · ৩. টাকা · জানুয়ারি · ফেব্রুয়ারি · মার্চ · একই কথা ৩ বার"
    },
    {
     "at": "L7:একদিন",
     "desc": "নতুন মেসেজে টাকার নিয়মটা বাদ পড়ে; ডানে রিপোর্ট আসে, টাকার অঙ্ক ভুল ধাঁচে",
     "text": "মার্চের রিপোর্ট · 245000"
    },
    {
     "at": "L7:অন্যরকম",
     "desc": "রিপোর্টের চারপাশে লাল দাগ আর আঁকা লাল ক্রস",
     "text": "—"
    },
    {
     "at": "L8:চ্যাট",
     "desc": "\"নতুন চ্যাট\" বোতামে ক্লিকের ঢেউ, সব মেসেজ মুছে যায়",
     "text": "নতুন চ্যাট · আবার প্রথম থেকে শেখাতে হবে…"
    }
   ]
  },
  {
   "type": "title",
   "at": "L9",
   "icon": "sparkles",
   "kicker": "সমাধান",
   "title": "স্কিল",
   "sub": "Skills",
   "desc": "কমলা তারা-আইকন, বড় করে \"স্কিল\" (স্কিল কী অধ্যায়)",
   "text": "সমাধান · স্কিল · Skills"
  },
  {
   "type": "analogy",
   "at": "L10",
   "desc": "ট্রেনিং খাতার বই খোলে",
   "text": "ট্রেনিং খাতা",
   "bookAt": "L10:ট্রেনিং",
   "bookTitle": "ট্রেনিং খাতা",
   "empAt": "L11:অফিসে",
   "empLabel": "নতুন কর্মী",
   "giveAt": "L11:খাতা",
   "stepsAt": "L11:ধাপে",
   "steps": [
    "কাজটা কী",
    "কীভাবে করতে হয়",
    "শেষে কী মিলিয়ে দেখবে"
   ],
   "claudeAt": "L12:স্কিলও",
   "resultsAt": "L12:প্রতিবার",
   "results": [
    "জানুয়ারির রিপোর্ট",
    "ফেব্রুয়ারির রিপোর্ট",
    "মার্চের রিপোর্ট"
   ],
   "shots": [
    {
     "at": "L11:অফিসে",
     "desc": "বাঁয়ে নতুন কর্মী আসে; আঁকা তীর বই থেকে তার দিকে; বইয়ের পাতায় ধাপ ১-২-৩",
     "text": "নতুন কর্মী · ১. কাজটা কী · ২. কীভাবে করতে হয় · ৩. শেষে কী মিলিয়ে দেখবে"
    },
    {
     "at": "L12:স্কিলও",
     "desc": "কর্মীর জায়গায় Claude আসে; ডানে তিন মাসের রিপোর্ট একে একে, প্রতিটায় সবুজ টিক",
     "text": "Claude · জানুয়ারির রিপোর্ট · ফেব্রুয়ারির রিপোর্ট · মার্চের রিপোর্ট"
    }
   ]
  },
  {
   "type": "skillfile",
   "at": "L13",
   "treeTitle": "ফোল্ডার",
   "desc": "বাঁয়ে ফোল্ডার জানালা: monthly-report/ ফোল্ডার আসে, ভেতরে SKILL.md জ্বলে ওঠে",
   "text": "monthly-report/ · SKILL.md",
   "tree": [
    {
     "name": "monthly-report/",
     "depth": 0,
     "icon": "folder",
     "at": "L13:ফোল্ডার"
    },
    {
     "name": "SKILL.md",
     "depth": 1,
     "icon": "file",
     "at": "L13:স্কিল",
     "hl": "L13:স্কিল"
    },
    {
     "name": "template.xlsx",
     "depth": 1,
     "at": "L15:টেমপ্লেট"
    },
    {
     "name": "examples.md",
     "depth": 1,
     "at": "L15:উদাহরণ"
    },
    {
     "name": "scripts/",
     "depth": 1,
     "icon": "folder",
     "at": "L15:প্রোগ্রাম"
    },
    {
     "name": "total.py",
     "depth": 2,
     "icon": "code",
     "at": "L15:প্রোগ্রাম+0.35"
    }
   ],
   "codeAt": "L14",
   "code": [
    {
     "html": "<span class=\"c\">---</span>",
     "at": "L14"
    },
    {
     "html": "<span class=\"k\">name:</span> monthly-report",
     "at": "L14:নাম",
     "hl": "L14:নাম"
    },
    {
     "html": "<span class=\"k\">description:</span> <span class=\"s\">স্কুলের মাসিক ফি-র রিপোর্ট বানায়।</span>",
     "at": "L14:বর্ণনা",
     "hl": "L14:বর্ণনা"
    },
    {
     "html": "  <span class=\"s\">\"মাসিক রিপোর্ট\" বললে এটা ব্যবহার করো।</span>",
     "at": "L14:কখন"
    },
    {
     "html": "<span class=\"c\">---</span>",
     "at": "L14:কখন+0.5"
    },
    {
     "html": "<span class=\"h\"># নির্দেশনা</span>",
     "at": "L15:নির্দেশনা"
    },
    {
     "html": "১. শিরোনামে স্কুলের নাম আর মাস",
     "at": "L15:নির্দেশনা+0.45"
    },
    {
     "html": "২. টাকা ৳ চিহ্নসহ, কমা দিয়ে",
     "at": "L15:নির্দেশনা+0.9"
    },
    {
     "html": "৩. শেষে মোট আদায় আর বকেয়া",
     "at": "L15:নির্দেশনা+1.35"
    }
   ],
   "tags": [
    {
     "text": "নাম",
     "at": "L14:নাম",
     "x": 1330,
     "y": 296
    },
    {
     "text": "বর্ণনা: কী করে + কখন",
     "at": "L14:বর্ণনা",
     "x": 1260,
     "y": 476
    }
   ],
   "shots": [
    {
     "at": "L14",
     "desc": "ডানে SKILL.md জানালা আসে; মাথার লাইনগুলো টাইপ হয়, \"name\" লাইন জ্বলে",
     "text": "name: monthly-report · নাম"
    },
    {
     "at": "L14:বর্ণনা",
     "desc": "description লাইন টাইপ হয়ে জ্বলে, পাশে সোনালি চিপ",
     "text": "description: স্কুলের মাসিক ফি-র রিপোর্ট বানায়। · বর্ণনা: কী করে + কখন"
    },
    {
     "at": "L15:নির্দেশনা",
     "desc": "নিচে নির্দেশনার তিনটা লাইন টাইপ হয়",
     "text": "# নির্দেশনা · ১. শিরোনামে স্কুলের নাম আর মাস · ২. টাকা ৳ চিহ্নসহ, কমা দিয়ে · ৩. শেষে মোট আদায় আর বকেয়া"
    },
    {
     "at": "L15:টেমপ্লেট",
     "desc": "ফোল্ডারে বলা শব্দে টেমপ্লেট, উদাহরণ আর প্রোগ্রামের ফাইল যোগ হয়",
     "text": "template.xlsx · examples.md · scripts/ · total.py"
    }
   ]
  },
  {
   "type": "question",
   "at": "L16",
   "desc": "বড় প্রশ্ন (কেন স্কিল অধ্যায়); নিচে পেস্ট করা লম্বা লেখার কার্ড ধাক্কা দিয়ে আসে",
   "text": "সব নির্দেশনা চ্যাটে পেস্ট করলেই তো হয়?",
   "pasteAt": "L16:পেস্ট",
   "pasteLabel": "পেস্ট করা সব নির্দেশনা, একসাথে"
  },
  {
   "type": "desk",
   "at": "L17",
   "desc": "উপর থেকে দেখা একটা টেবিল, নিচে \"কতটা ভরা\" মিটার; চিপে context window-এর মানে",
   "text": "context window = মনে রাখার জায়গা · কতটা ভরা",
   "deskAt": "L17",
   "labelAt": "L17:context",
   "label": "context window = মনে রাখার জায়গা",
   "meterLabel": "কতটা ভরা",
   "meter": [
    [
     "L18:কাগজ",
     0.9,
     "#E5604F"
    ],
    [
     "L19",
     0.03,
     "#5BC48A"
    ],
    [
     "L20:একশো",
     0.05,
     "#5BC48A"
    ],
    [
     "L21:খোলে",
     0.11,
     "#5BC48A"
    ],
    [
     "L22:ফলাফলটা",
     0.14,
     "#5BC48A"
    ],
    [
     "L23:অনেকগুলো",
     0.17,
     "#5BC48A"
    ]
   ],
   "paperAt": "L18:কাগজ",
   "lostAt": "L18:দরকারি",
   "clearAt": "L19",
   "noteTitle": "জরুরি",
   "noteText": "টাকা ৳ চিহ্নসহ",
   "fullText": "টেবিল ভরে গেছে",
   "stepsAt": "L19:তিন",
   "stepNames": [
    "শুরুতে শুধু নাম",
    "মিললে বই খোলে",
    "দরকারে ফাইল"
   ],
   "stepAt": [
    "L20",
    "L21",
    "L22"
   ],
   "shelfAt": "L20:নাম",
   "books": [
    {
     "name": "monthly-report",
     "color": "#E07A55"
    },
    {
     "name": "powerpoint",
     "color": "#D9B35C"
    },
    {
     "name": "excel",
     "color": "#8CC69E"
    },
    {
     "name": "word",
     "color": "#7FA7D9"
    },
    {
     "name": "pdf",
     "color": "#D98C8C"
    },
    {
     "name": "brand-guide",
     "color": "#B58AD1"
    }
   ],
   "indexAt": "L20:পড়ে",
   "indexTitle": "সূচি: নাম + বর্ণনা",
   "tokenAt": "L20:একশো",
   "tokenText": "প্রায় ১০০ টোকেন / স্কিল",
   "reqAt": "L21",
   "request": "মার্চের রিপোর্ট বানাও",
   "matchAt": "L21:মেলে",
   "openAt": "L21:খোলে",
   "openTitle": "monthly-report · SKILL.md",
   "openLines": [
    "১. শিরোনামে স্কুলের নাম আর মাস",
    "২. টাকা ৳ চিহ্নসহ",
    "৩. শেষে মোট আদায়"
   ],
   "fileAt": "L22:ফাইল",
   "fileName": "template.xlsx",
   "fileSub": "দরকার হলো, তাই খুলল",
   "runAt": "L22:চালালে",
   "scriptName": "total.py চলছে…",
   "resultAt": "L22:ফলাফলটা",
   "resultTitle": "টেবিলে আসে শুধু ফলাফল",
   "resultText": "মোট: ৳ ২,৪৫,০০০",
   "manyAt": "L23:অনেকগুলো",
   "emptyText": "অনেক স্কিল, টেবিল প্রায় ফাঁকা",
   "shots": [
    {
     "at": "L18:কাগজ",
     "desc": "টেবিলে একের পর এক কাগজ পড়ে, মিটার লাল হয়ে প্রায় ভরে যায়",
     "text": "টেবিল ভরে গেছে"
    },
    {
     "at": "L18:দরকারি",
     "desc": "\"জরুরি\" হলুদ কাগজটা টেবিলের কিনার দিয়ে পড়ে হারিয়ে যায়",
     "text": "জরুরি · টাকা ৳ চিহ্নসহ"
    },
    {
     "at": "L19",
     "desc": "কাগজ সরে যায়, মিটার খালি; উপরে তিন ধাপের সারি",
     "text": "১ শুরুতে শুধু নাম · ২ মিললে বই খোলে · ৩ দরকারে ফাইল"
    },
    {
     "at": "L20:নাম",
     "desc": "ধাপ ১ জ্বলে; ডানে তাকে ৬টা স্কিলের বই; টেবিলে ছোট সূচি কার্ড, মিটার সামান্য",
     "text": "monthly-report · powerpoint · excel · word · pdf · brand-guide · সূচি: নাম + বর্ণনা"
    },
    {
     "at": "L20:একশো",
     "desc": "সোনালি চিপ: প্রতি স্কিলে কত টোকেন",
     "text": "প্রায় ১০০ টোকেন / স্কিল"
    },
    {
     "at": "L21",
     "desc": "ধাপ ২: উপরে মেসেজ; monthly-report বইটা সোনালি জ্বলে; বই খুলে টেবিলে নির্দেশনা",
     "text": "মার্চের রিপোর্ট বানাও · monthly-report · SKILL.md"
    },
    {
     "at": "L22",
     "desc": "ধাপ ৩: টেমপ্লেট ফাইল খোলে; ডানে প্রোগ্রাম চলে (বার ভরে); টেবিলে শুধু ফলাফলের সবুজ কার্ড",
     "text": "template.xlsx · total.py চলছে… · মোট: ৳ ২,৪৫,০০০"
    },
    {
     "at": "L23:অনেকগুলো",
     "desc": "নিচের তাকে অনেকগুলো বই ভরে যায়, মিটার তবু প্রায় খালি; সবুজ চিপ",
     "text": "অনেক স্কিল, টেবিল প্রায় ফাঁকা"
    },
    {
     "at": "L21:মেলে",
     "desc": "মেসেজের সাথে মেলা monthly-report বইটা সোনালি হয়ে জ্বলে",
     "text": "—"
    },
    {
     "at": "L21:খোলে",
     "desc": "বই খুলে টেবিলে নির্দেশনার কার্ড আসে, মিটার সামান্য বাড়ে",
     "text": "monthly-report · SKILL.md · ১. শিরোনামে স্কুলের নাম আর মাস"
    },
    {
     "at": "L22:চালালে",
     "desc": "ডানে প্রোগ্রামের কার্ড, বার ভরে ওঠে",
     "text": "total.py চলছে…"
    },
    {
     "at": "L22:ফলাফলটা",
     "desc": "টেবিলে শুধু ফলাফলের সবুজ কার্ড নামে",
     "text": "টেবিলে আসে শুধু ফলাফল · মোট: ৳ ২,৪৫,০০০"
    }
   ]
  },
  {
   "type": "benefits",
   "at": "L24",
   "desc": "চারটা সুবিধার সারি বলা শব্দে আসে",
   "text": "একই মান, প্রতিবার · কম ভুল · কম বারবার বলা · স্কিল মিলিয়ে বড় কাজ",
   "items": [
    {
     "icon": "target",
     "text": "একই মান, প্রতিবার",
     "at": "L24:একই"
    },
    {
     "icon": "check",
     "text": "কম ভুল",
     "at": "L24:ভুল"
    },
    {
     "icon": "repeat",
     "text": "কম বারবার বলা",
     "at": "L24:বারবার"
    },
    {
     "icon": "layers",
     "text": "স্কিল মিলিয়ে বড় কাজ",
     "at": "L24:মিলিয়ে"
    }
   ],
   "takeAt": "L25:মূল",
   "arrowAt": "L25:শেখান",
   "take2At": "L25:প্রতিবার",
   "take": [
    "একবার শেখান",
    "প্রতিবার ঠিক জায়গায়"
   ],
   "shots": [
    {
     "at": "L25:মূল",
     "desc": "নিচে সোনালি ফ্রেমের বড় কার্ড: একবার শেখান, আঁকা তীর, প্রতিবার ঠিক জায়গায়",
     "text": "একবার শেখান · প্রতিবার ঠিক জায়গায়"
    },
    {
     "at": "L24:ভুল",
     "desc": "দ্বিতীয় সুবিধার সারি আসে",
     "text": "কম ভুল"
    },
    {
     "at": "L24:বারবার",
     "desc": "তৃতীয় আর চতুর্থ সুবিধার সারি আসে",
     "text": "কম বারবার বলা · স্কিল মিলিয়ে বড় কাজ"
    }
   ]
  },
  {
   "type": "tiles",
   "at": "L26",
   "desc": "উপরে \"নিজে বানাতে হবে না\" আর শিরোনাম (তৈরি স্কিল অধ্যায়)",
   "text": "নিজে বানাতে হবে না · Anthropic-এর তৈরি স্কিল",
   "kicker": "নিজে বানাতে হবে না",
   "title": "Anthropic-এর তৈরি স্কিল",
   "tiles": [
    {
     "name": "Word",
     "glyph": "W",
     "color": "#2F5DA8",
     "at": "L27:Word"
    },
    {
     "name": "Excel",
     "glyph": "X",
     "color": "#23794B",
     "at": "L27:Excel"
    },
    {
     "name": "PowerPoint",
     "glyph": "P",
     "color": "#C5532B",
     "at": "L27:PowerPoint"
    },
    {
     "name": "PDF",
     "glyph": "PDF",
     "color": "#B3261E",
     "at": "L27:PDF"
    }
   ],
   "shots": [
    {
     "at": "L27:Word",
     "desc": "বলা নামে চারটা টাইল একে একে লাফিয়ে আসে",
     "text": "Word · Excel · PowerPoint · PDF"
    }
   ]
  },
  {
   "type": "chat",
   "at": "L28",
   "title": "Claude",
   "desc": "চ্যাট জানালা; আপনার মেসেজ আসে",
   "text": "মাসের হিসাব নিয়ে ৫ স্লাইডের একটা PowerPoint বানাও",
   "noteText": "ছবিটা বোঝানোর জন্য সরল করে আঁকা",
   "messages": [
    {
     "who": "user",
     "at": "L28:লিখুন",
     "text": "মাসের হিসাব নিয়ে **৫ স্লাইডের** একটা PowerPoint বানাও"
    },
    {
     "who": "ai",
     "at": "L28:Claude",
     "text": "",
     "thinking": {
      "text": "PowerPoint স্কিল পড়ছি…",
      "at": "L28:Claude"
     },
     "file": {
      "name": "মাসের-হিসাব.pptx",
      "sub": "৫টা স্লাইড · PowerPoint",
      "at": "L28:ফাইল",
      "btn": "ডাউনলোড",
      "btnAt": "L28:ডাউনলোড"
     }
    }
   ],
   "aside": [
    {
     "type": "slides",
     "at": "L28:ফাইল+0.7",
     "n": 4,
     "title": "খুললে যা পাবেন",
     "y": 230
    }
   ],
   "shots": [
    {
     "at": "L28:Claude",
     "desc": "Claude-এর উত্তরে সোনালি চিপ: PowerPoint স্কিল পড়ছে; তারপর ফাইল কার্ড আর ডাউনলোড বোতাম",
     "text": "PowerPoint স্কিল পড়ছি… · মাসের-হিসাব.pptx · ডাউনলোড"
    },
    {
     "at": "L28:ফাইল+0.7",
     "desc": "ডানে স্লাইডের ছোট ছবিগুলো ছড়িয়ে আসে; ডাউনলোড বোতাম একটু লাফায়",
     "text": "খুললে যা পাবেন"
    }
   ]
  },
  {
   "type": "settings",
   "at": "L29",
   "title": "Settings",
   "desc": "Settings জানালা (চালু করা অধ্যায়); বাঁয়ে মেনু",
   "text": "Settings · General · Account · Capabilities · Connectors",
   "noteText": "ছবিটা বোঝানোর জন্য সরল করে আঁকা; আপনার অ্যাপে মেনুর নাম একটু আলাদা হতে পারে",
   "crumb": [
    {
     "text": "Settings",
     "at": "L30:Settings"
    },
    {
     "text": "Capabilities",
     "at": "L30:Capabilities"
    }
   ],
   "nav": [
    {
     "text": "General"
    },
    {
     "text": "Account"
    },
    {
     "text": "Capabilities",
     "at": "L30:Capabilities"
    },
    {
     "text": "Connectors"
    }
   ],
   "rows": [
    {
     "title": "Code execution and file creation",
     "sub": "Claude ফাইল বানাতে আর কোড চালাতে পারবে",
     "onAt": "L30:চালু",
     "tag": "নতুন নাম: Create and edit files",
     "tagAt": "L30:Create"
    }
   ],
   "shots": [
    {
     "at": "L30:Settings",
     "desc": "উপরে পথ লেখা হয় Settings, তারপর Capabilities; মেনুতে Capabilities জ্বলে",
     "text": "Settings › Capabilities (তীর আঁকা)"
    },
    {
     "at": "L30:চালু",
     "desc": "Code execution and file creation-এর সুইচে ক্লিকের ঢেউ, সুইচ সবুজ হয়ে চালু",
     "text": "Code execution and file creation"
    },
    {
     "at": "L30:Create",
     "desc": "সারির নিচে সোনালি চিপে নতুন নাম",
     "text": "নতুন নাম: Create and edit files"
    }
   ]
  },
  {
   "type": "skillslist",
   "at": "L31",
   "title": "Skills",
   "y": 200,
   "h": 660,
   "desc": "Customize › Skills পাতা: পাঁচটা স্কিলের সারি, প্রতিটার পাশে সুইচ",
   "text": "Customize › Skills · PowerPoint · Excel · Word · PDF · skill-creator",
   "crumb": [
    "Customize",
    "Skills"
   ],
   "noteText": "ছবিটা বোঝানোর জন্য সরল করে আঁকা",
   "rows": [
    {
     "name": "PowerPoint",
     "desc": "প্রেজেন্টেশন বানায়",
     "glyph": "P",
     "color": "#C5532B",
     "onAt": "L31:অন"
    },
    {
     "name": "Excel",
     "desc": "স্প্রেডশিট আর চার্ট বানায়",
     "glyph": "X",
     "color": "#23794B",
     "onAt": "L31:অন+0.45"
    },
    {
     "name": "Word",
     "desc": "ডকুমেন্ট বানায়",
     "glyph": "W",
     "color": "#2F5DA8",
     "onAt": "L31:অন+0.9"
    },
    {
     "name": "PDF",
     "desc": "PDF বানায় আর পড়ে",
     "glyph": "PDF",
     "color": "#B3261E"
    },
    {
     "name": "skill-creator",
     "desc": "নতুন স্কিল বানাতে সাহায্য করে"
    }
   ],
   "chips": [
    {
     "text": "ফ্রি প্ল্যানেও আছে",
     "icon": "check",
     "cls": "green",
     "at": "L32:ফ্রি",
     "x": 760,
     "y": 112
    },
    {
     "text": "মেনুর নাম অ্যাপভেদে আলাদা হতে পারে",
     "cls": "gold",
     "at": "L32:মেনুর",
     "x": 1150,
     "y": 112
    }
   ],
   "shots": [
    {
     "at": "L31:অন",
     "desc": "তিনটা সুইচ একে একে সবুজ হয়ে চালু, প্রতিটায় ক্লিক",
     "text": "—"
    },
    {
     "at": "L32:ফ্রি",
     "desc": "উপরে সবুজ চিপ, তারপর সোনালি চিপ",
     "text": "ফ্রি প্ল্যানেও আছে · মেনুর নাম অ্যাপভেদে আলাদা হতে পারে"
    }
   ]
  },
  {
   "type": "title",
   "at": "L33",
   "icon": "pen",
   "kicker": "এবার",
   "title": "নিজের স্কিল",
   "sub": "দুইভাবে বানানো যায়",
   "desc": "কলম-আইকন, বড় করে \"নিজের স্কিল\" (নিজের স্কিল অধ্যায়)",
   "text": "এবার · নিজের স্কিল · দুইভাবে বানানো যায়"
  },
  {
   "type": "chat",
   "at": "L34",
   "title": "Claude",
   "desc": "চ্যাট জানালা; আপনার মেসেজ: skill-creator দিয়ে স্কিল বানাও",
   "text": "skill-creator দিয়ে আমার জন্য একটা স্কিল বানাও",
   "noteText": "ছবিটা বোঝানোর জন্য সরল করে আঁকা",
   "messages": [
    {
     "who": "user",
     "at": "L34:বলুন",
     "text": "`skill-creator` দিয়ে আমার জন্য একটা স্কিল বানাও"
    },
    {
     "who": "user",
     "at": "L34:বুঝিয়ে",
     "text": "প্রতি মাসে স্কুলের ফি-র রিপোর্ট বানাই। টাকা ৳ চিহ্নসহ, শেষে মোট।"
    },
    {
     "who": "ai",
     "at": "L34:প্রশ্ন",
     "text": "কয়েকটা প্রশ্ন: রিপোর্টে কোন কোন কলাম থাকবে? বকেয়া আলাদা দেখাব?"
    },
    {
     "who": "ai",
     "at": "L34:লিখে",
     "text": "আপনার স্কিল তৈরি।",
     "file": {
      "name": "monthly-report",
      "sub": "SKILL.md সহ স্কিলের ফোল্ডার",
      "icon": "folder",
      "at": "L34:লিখে+0.4"
     }
    }
   ],
   "shots": [
    {
     "at": "L34:বুঝিয়ে",
     "desc": "আপনার দ্বিতীয় মেসেজ: কাজটা নিজের ভাষায়",
     "text": "প্রতি মাসে স্কুলের ফি-র রিপোর্ট বানাই। টাকা ৳ চিহ্নসহ, শেষে মোট।"
    },
    {
     "at": "L34:প্রশ্ন",
     "desc": "Claude প্রশ্ন করে; তারপর স্কিলের ফোল্ডারের কার্ড",
     "text": "কয়েকটা প্রশ্ন … · monthly-report · SKILL.md সহ স্কিলের ফোল্ডার"
    },
    {
     "at": "L34:বলুন",
     "desc": "আপনার প্রথম মেসেজ আসে",
     "text": "skill-creator দিয়ে আমার জন্য একটা স্কিল বানাও"
    }
   ]
  },
  {
   "type": "flow",
   "at": "L35",
   "desc": "তিন ধাপের সারি: প্রথম কার্ড \"ফোল্ডারে SKILL.md\"",
   "text": "ফোল্ডারে SKILL.md",
   "steps": [
    {
     "icon": "file",
     "title": "ফোল্ডারে SKILL.md",
     "sub": "monthly-report/",
     "at": "L35:স্কিল"
    },
    {
     "icon": "archive",
     "title": "ZIP করুন",
     "sub": "monthly-report.zip",
     "at": "L35:জিপ"
    },
    {
     "icon": "upload",
     "title": "আপলোড করুন",
     "sub": "Customize › Skills",
     "at": "L35:পাতায়"
    }
   ],
   "mockAt": "L35:পাতায়",
   "menuAt": "L35:প্লাস",
   "createAt": "L35:Create",
   "uploadAt": "L35:Upload",
   "zipName": "monthly-report.zip",
   "shots": [
    {
     "at": "L35:জিপ",
     "desc": "আঁকা তীর, দ্বিতীয় কার্ড \"ZIP করুন\"",
     "text": "ZIP করুন · monthly-report.zip"
    },
    {
     "at": "L35:পাতায়",
     "desc": "তৃতীয় কার্ড; নিচে Skills পাতার ছোট জানালা",
     "text": "আপলোড করুন · Customize › Skills"
    },
    {
     "at": "L35:প্লাস",
     "desc": "+ বোতামে ক্লিকের ঢেউ, মেনু খোলে: Create skill, তারপর Upload a skill",
     "text": "Create skill · Upload a skill"
    },
    {
     "at": "L35:Upload",
     "desc": "ড্রপ-বক্স আসে, ZIP ফাইলটা উপর থেকে এসে বসে",
     "text": "monthly-report.zip"
    }
   ]
  },
  {
   "type": "compare",
   "at": "L36",
   "desc": "বাঁয়ে লাল ফ্রেমে ভুল: ZIP-এর ভেতরে সরাসরি SKILL.md",
   "text": "ভুল · monthly-report.zip · SKILL.md · ZIP খুললেই সরাসরি ফাইল: চলবে না",
   "left": {
    "key": "bad",
    "ok": false,
    "title": "ভুল",
    "at": "L36:ফাইল",
    "tree": [
     {
      "name": "monthly-report.zip",
      "depth": 0,
      "icon": "archive"
     },
     {
      "name": "SKILL.md",
      "depth": 1,
      "icon": "file"
     }
    ],
    "note": "ZIP খুললেই সরাসরি ফাইল: **চলবে না**"
   },
   "right": {
    "key": "good",
    "ok": true,
    "title": "ঠিক",
    "at": "L36:পুরো",
    "tree": [
     {
      "name": "monthly-report.zip",
      "depth": 0,
      "icon": "archive"
     },
     {
      "name": "monthly-report/",
      "depth": 1,
      "icon": "folder"
     },
     {
      "name": "SKILL.md",
      "depth": 2,
      "icon": "file"
     }
    ],
    "note": "ভেতরে পুরো **ফোল্ডার**, তার ভেতরে ফাইল"
   },
   "shots": [
    {
     "at": "L36:পুরো",
     "desc": "ডানে সবুজ ফ্রেমে ঠিক: ZIP-এর ভেতরে ফোল্ডার, তার ভেতরে SKILL.md",
     "text": "ঠিক · monthly-report/ · ভেতরে পুরো ফোল্ডার, তার ভেতরে ফাইল"
    }
   ]
  },
  {
   "type": "describe",
   "at": "L37",
   "desc": "SKILL.md-এর মাথা বড় করে; description লাইন সোনালি হয়ে জ্বলে",
   "text": "name: monthly-report · description: …",
   "name": "monthly-report",
   "descText": "স্কুলের মাসিক ফি-র রিপোর্ট বানায়। \"মাসিক রিপোর্ট\" বললে এটা ব্যবহার করো।",
   "hlAt": "L37:বর্ণনাটা",
   "lensAt": "L37:পড়েই",
   "reqAt": "L37:কারণ",
   "okAt": "L37:খুলবে",
   "request": "মার্চের মাসিক রিপোর্ট বানাও",
   "okText": "মিলেছে, স্কিল খুলছে",
   "shots": [
    {
     "at": "L37:কারণ",
     "desc": "নিচে মেসেজ আসে; বিবর্ধক কাচ বর্ণনার উপর",
     "text": "মার্চের মাসিক রিপোর্ট বানাও"
    },
    {
     "at": "L37:খুলবে",
     "desc": "সবুজ চিপ: মিলেছে",
     "text": "মিলেছে, স্কিল খুলছে"
    }
   ]
  },
  {
   "type": "uses",
   "at": "L38",
   "desc": "শিরোনাম \"কোথায় কাজে লাগে?\" (কোথায় কাজে লাগে অধ্যায়)",
   "text": "কোথায় কাজে লাগে?",
   "title": "কোথায় কাজে লাগে?",
   "cards": [
    {
     "icon": "school",
     "title": "শিক্ষক",
     "text": "নিজের ফরম্যাটে প্রশ্নপত্র",
     "at": "L39:শিক্ষক"
    },
    {
     "icon": "store",
     "title": "দোকান",
     "text": "ক্যাশমেমো আর দামের তালিকা",
     "at": "L39:দোকান"
    },
    {
     "icon": "briefcase",
     "title": "অফিস",
     "text": "মাসিক রিপোর্ট",
     "at": "L39:অফিসে"
    },
    {
     "icon": "megaphone",
     "title": "পেজ",
     "text": "নিজের ধাঁচে পোস্ট",
     "at": "L39:পেজ"
    }
   ],
   "bannerAt": "L40:বারবার",
   "banner": "বারবার একইভাবে করা কাজ = **স্কিল**",
   "shots": [
    {
     "at": "L39:শিক্ষক",
     "desc": "প্রথম কার্ড: শিক্ষক",
     "text": "শিক্ষক · নিজের ফরম্যাটে প্রশ্নপত্র"
    },
    {
     "at": "L39:দোকান",
     "desc": "দ্বিতীয় কার্ড: দোকান",
     "text": "দোকান · ক্যাশমেমো আর দামের তালিকা"
    },
    {
     "at": "L39:অফিসে",
     "desc": "তৃতীয় কার্ড: অফিস",
     "text": "অফিস · মাসিক রিপোর্ট"
    },
    {
     "at": "L39:পেজ",
     "desc": "চতুর্থ কার্ড: পেজ",
     "text": "পেজ · নিজের ধাঁচে পোস্ট"
    },
    {
     "at": "L40:বারবার",
     "desc": "নিচে সোনালি ব্যানার",
     "text": "বারবার একইভাবে করা কাজ = স্কিল"
    }
   ]
  },
  {
   "type": "terminal",
   "at": "L41",
   "title": "Claude Code",
   "desc": "Claude Code টার্মিনাল (Claude Code অধ্যায়); skills ফোল্ডারের তালিকা টাইপ হয়",
   "text": "ls .claude/skills · voice-clone/ · reel-cutdown/ · release-kit/ · post-copy/",
   "lines": [
    {
     "html": "<span class=\"c\">video-create $</span> ls .claude/skills",
     "at": "L41:skills",
     "type": true
    },
    {
     "html": "<span class=\"s\">voice-clone/</span>     <span class=\"s\">reel-cutdown/</span>",
     "at": "L41:skills",
     "delay": 0.8
    },
    {
     "html": "<span class=\"s\">release-kit/</span>     <span class=\"s\">post-copy/</span>",
     "at": "L41:skills",
     "delay": 0.95
    },
    {
     "html": "<span class=\"s\">screen-tutorial/</span> <span class=\"s\">privacy-blur/</span>",
     "at": "L41:skills",
     "delay": 1.1
    },
    {
     "html": " "
    },
    {
     "html": "<span class=\"c\">video-create $</span> <span class=\"h\">/release-kit</span>",
     "at": "L41:স্ল্যাশ",
     "type": true
    },
    {
     "html": "<span class=\"k\">skill</span> release-kit <span class=\"c\">লোড হলো</span>",
     "at": "L41:সরাসরি"
    },
    {
     "html": "<span class=\"c\">সাবটাইটেল · Reels · পোস্টের লেখা</span>",
     "at": "L41:সরাসরি",
     "delay": 0.4
    }
   ],
   "chips": [
    {
     "icon": "mic",
     "title": "ভয়েস",
     "skill": "voice-clone",
     "at": "L42:ভয়েস"
    },
    {
     "icon": "film",
     "title": "রিলস",
     "skill": "reel-cutdown",
     "at": "L42:রিলস"
    },
    {
     "icon": "pen",
     "title": "পোস্টের লেখা",
     "skill": "post-copy",
     "at": "L42:পোস্টের"
    }
   ],
   "shots": [
    {
     "at": "L41:স্ল্যাশ",
     "desc": "প্রম্পটে /release-kit টাইপ হয়, স্কিল লোড হয়",
     "text": "/release-kit · skill release-kit লোড হলো"
    },
    {
     "at": "L42:ভয়েস",
     "desc": "ডানে তিনটা কার্ড বলা শব্দে: কোন কাজ কোন স্কিলে",
     "text": "ভয়েস /voice-clone · রিলস /reel-cutdown · পোস্টের লেখা /post-copy"
    }
   ]
  },
  {
   "type": "warning",
   "at": "L43",
   "desc": "সোনালি ঢাল-আইকন আর \"একটু সাবধান\" (শেষ কথা)",
   "text": "একটু সাবধান",
   "title": "একটু সাবধান",
   "sub": "স্কিল প্রোগ্রাম চালাতে পারে। অচেনা জায়গার স্কিল বসানোর আগে **ভেতরটা দেখে নিন**।",
   "subAt": "L43:প্রোগ্রাম",
   "lookAt": "L43:অচেনা",
   "tree": [
    {
     "name": "unknown-skill/",
     "depth": 0,
     "icon": "folder"
    },
    {
     "name": "SKILL.md",
     "depth": 1,
     "icon": "file"
    },
    {
     "name": "scripts/run.py",
     "depth": 1,
     "icon": "code"
    }
   ],
   "shots": [
    {
     "at": "L43:অচেনা",
     "desc": "অচেনা স্কিলের ফোল্ডার, উপরে বিবর্ধক কাচ",
     "text": "unknown-skill/ · SKILL.md · scripts/run.py"
    }
   ]
  },
  {
   "type": "cta",
   "at": "L44",
   "desc": "শেষ কার্ড: \"ফ্রিতে পাবেন\", শিরোনাম; বড় বাক্সে ইনবক্স-আইকন আর SKILL",
   "text": "ফ্রিতে পাবেন · নিজের প্রথম স্কিলের বাংলা টেমপ্লেট · পেজের ইনবক্সে লিখুন SKILL",
   "kicker": "ফ্রিতে পাবেন",
   "title": "নিজের প্রথম স্কিলের **বাংলা টেমপ্লেট**",
   "kwLabel": "পেজের ইনবক্সে লিখুন",
   "keyword": "SKILL",
   "kwAt": "L44:SKILL",
   "stepsAt": "L44:পাঠিয়ে",
   "steps": [
    "পেজে যান",
    "**Message** চাপুন",
    "লিখুন **SKILL**"
   ],
   "shots": [
    {
     "at": "L44:পাঠিয়ে",
     "desc": "নিচে মেসেজ করার তিন ধাপ একে একে; শেষে মিউজিক আস্তে থামে",
     "text": "১ পেজে যান · ২ Message চাপুন · ৩ লিখুন SKILL"
    }
   ]
  }
 ],
 "plan": {
  "format": "16:9",
  "platform": "YouTube আর Facebook পেজ (একই 16:9 ফাইল); এখান থেকে কাটা Reels আলাদা",
  "kind": "টিউটোরিয়াল, নতুন স্টাইল EXP1 ব্যাখ্যা বোর্ড (ফুটেজ ছাড়া: সরল করে আঁকা অ্যাপের জানালা, ডায়াগ্রাম, কার্ড)",
  "voice": "আপনার ক্লোন করা গলা গ (Gemini, talha-g) (voice.wav)",
  "music": "bgm-long.wav (Lyria 3.5 দিয়ে বানানো শান্ত lo-fi, ৫ মিনিটে লম্বা করা; কথার নিচে অনেক আস্তে)",
  "output": "16:9 (1920×1080), সাথে বাংলা .srt; Reels আলাদা করে (release-kit)",
  "whole": "উষ্ণ অন্ধকার বোর্ড, বিন্দুর গ্রিড, ধীরে সরে যাওয়া কমলা আভা; উপরে বাঁয়ে \"Claude Skills\" আর এখনকার অধ্যায়ের নাম, ডানে ১০ ঘরের অধ্যায়-দাগ (প্রথম অধ্যায় থেকে শেষ পর্যন্ত); নিচে বাক্য-ধরে বাংলা ক্যাপশন, বলা শব্দটা সোনালি (প্রথম শব্দ থেকে শেষ শব্দ পর্যন্ত); কোনো আসল লোগো নেই; ফাইনাল আওয়াজ −১৪ LUFS",
  "goal": "দর্শক বুঝবে স্কিল কী (Claude-এর জন্য লেখা ট্রেনিং খাতা), কেন এটা Claude-এর কাজ বদলে দেয় (তিন ধাপে খোলে, তাই মনে রাখার জায়গা ফাঁকা থাকে আর প্রতিবার একই মানের কাজ হয়), কীভাবে চালু করবে, নিজের স্কিল কীভাবে বানাবে, আর বাংলা টেমপ্লেট পেতে পেজের ইনবক্সে SKILL লিখবে।",
  "hook": "প্রথম কথা: \"এই ভিডিওটা আমি নিজে এডিট করিনি।\" পর্দায় একটা টাইমলাইন নিজে নিজে ভরে ওঠে, উপরে \"Claude নিজে বানাচ্ছে…\"; তারপর ডানে যে ৫টা আসল স্কিল দিয়ে ভিডিওটা বানানো, টিকসহ। শুভেচ্ছা দিয়ে শুরু নয়।",
  "needs": [
   "ভয়েস: তৈরি। আপনার ক্লোন গলা গ (talha-g), ১৬ অনুরোধ, ৩০০ সেকেন্ড, খরচ প্রায় $০.০৭ (আপনার পেইড Gemini কী)।",
   "মিউজিক: তৈরি। Lyria 3.5, ১৭৬ সেকেন্ড, $০.০৮; music-extend দিয়ে ৫ মিনিটের বেশি লম্বা করা (ফ্রি)।",
   "শব্দ: assets/sfx-এর নিজের ফাইল (ফ্রি)।",
   "ছবি বা ফুটেজ: লাগেনি। সব দৃশ্য কোডে আঁকা; Claude-এর আসল লোগো বা স্ক্রিনশট নেই, অ্যাপের জানালাগুলো সরল করে আঁকা (পর্দায় লেখা আছে)।",
   "তথ্যের সূত্র (২০২৬-১১-০২ পড়া): support.claude.com \"Use skills in Claude\", platform.claude.com Agent Skills overview, code.claude.com skills।",
   "পোস্ট করার সময়: Facebook-এ AI লেবেল দিতে হবে (ক্লোন গলা, Meta-র নিয়ম); YouTube-এ নিজের গলার ক্লোনে লাগে না।",
   "ইনবক্সে SKILL লিখলে পাঠানোর জন্য বাংলা টেমপ্লেট: release ফোল্ডারে তৈরি করে রাখা হবে।"
  ],
  "style": [
   "STYLE §১: বাংলা, বন্ধুর মতো সহজ; Claude, PowerPoint-এর মতো নাম ইংরেজিতে; \"সেরা/অবিশ্বাস্য\" নেই।",
   "STYLE §৩: Hind Siliguri (লেখা, ক্যাপশন), Baloo Da 2 (বড় শিরোনাম, সংখ্যা); কোডে JetBrains Mono + Hind Siliguri; বাংলায় letter-spacing নেই।",
   "STYLE §৪: লম্বা ভিডিওতে বাক্য-ধরে ক্যাপশন, বলা শব্দ সোনালি; সংখ্যা বাংলা অঙ্কে।",
   "STYLE §৫: প্রথম ২ সেকেন্ডে চমকানো কথা; প্রতি কয়েক সেকেন্ডে পর্দায় কিছু বদলায়; ক্যামেরা-ঠেলা ১ গুণে এসে থামে।",
   "STYLE §৬: পড়ার লেখা ২৮ px-এর বেশি, ছোট লেবেল ২৪ px-এর বেশি।",
   "STYLE §৭: প্রতিটা দৃশ্য বদলে whoosh, ছোট ঘটনায় click/pop, টাকায় cash-register; মিউজিক ভয়েসের অনেক নিচে, শেষে আস্তে থামে।",
   "STYLE §৯ + CLAUDE §0d: আইকন Lucide ধাঁচে আঁকা, টিক আর তীর SVG।",
   "LESSONS 2026-10-26: কোনো আসল লোগো নেই।",
   "LESSONS 2026-11-01: তিনি \"বানাও\" বললে বিষয়, স্টাইল, ভয়েস, BGM Claude নিজে ঠিক করে শেষ পর্যন্ত বানাবে; খরচ রিপোর্টে।",
   "LESSONS 2026-11-01: তাঁর নিজের ভিডিওতে গলা মানে তাঁর ক্লোন গলা গ; শেষে মেসেজ করার ৩ ধাপ (পেজে যান · Message চাপুন · লিখুন KEYWORD)।"
  ],
  "questions": [
   "আপনি ঘুমাচ্ছিলেন, তাই আপনার নিয়মমতো (LESSONS ২০২৬-১১-০১) প্ল্যান যন্ত্রে পরীক্ষা করে নিজেই শেষ পর্যন্ত বানিয়েছি। কোনো অংশ বদলাতে চাইলে বলুন।",
   "ইনবক্সে SKILL লিখলে কী পাঠাবেন: release ফোল্ডারের বাংলা টেমপ্লেটটা দেখে নিন, ঠিক আছে কি না।"
  ]
 }
}
```

<<<<< END OF FILE: explainer.example.json >>>>>

<<<<< FILE: fundamentals.md >>>>>

# The five elements of a video mistake (root-cause analysis, 2026-10-29)

Written after claude-video-tutorial, an 8:30 Bengali screen tutorial (screen recording + facecam intro/outro + voice-driven
re-timing, labels, click rings, cursor glow, privacy blurs). It needed **three full renders of about 2 hours each**.
After the first two, frame-by-frame reviews found about 35 mistakes. Each one is listed here with its root, and with
the guard that now catches it before a render. CLAUDE.md §0i holds the short form.

The pattern behind all of them: the build was checked **after** the expensive step, and **by eye**. Each of the five
elements now has a check that runs **before** the expensive step, mostly by machine.

## 1. সময় Time: the frame grid and what a time belongs to

| Mistake (render time) | Root cause | Guard now |
| --- | --- | --- |
| In-ad blur showed one frame early (450.18) | blur `enable` counted time from the piece's start `a`, not from the frame the seek landed on (up to ½ frame off) | `tools/tutorial/screen.mjs` rounds `a` to the frame grid (engine code since 2026-10-29; it was the project's `build/screen.mjs`) |
| Freeze still showed the double window (424.47) | `use` 518.914 rounded onto the first ghost frame; `to` stopped 4 frames short | boundaries at half-frame midpoints, `use` = an exact clean frame number checked by eye (glitch-scan strips) |
| Green box lingered 1 s past a cut (210.9); "All 4 Assets" pill 0.7 s after its window closed (359.5) | hide time written as "show + 2.4 s" instead of "before the window's own end" | rule: hide = S(window close or cut) − 0.3; preflight `under_changed` (calibrated: lingering labels 0.10 / 0.49, correct ones ≥ 0.66) |
| Blur boxes a few frames into the next app (231.3, 223.6, 259.0) | box ends written as round numbers, not the last frame of the window | boxes end at the midpoint after the last frame (privacy-blur skill) |
| "Masculine · Medium" pill 0.5 s early | timed to the first click, not to the moment it describes | time a label to the frame where its text becomes true (watch.mjs / strips) |
| Reel/LinkedIn cuts clipped words: "…নির্দেশনা দিয়ে এবং" (477.75), half "এবং" (403.2), "Medium। এবং আমি" (304.6), "ফাইলটা" (432.8), "কিন্তু" (438.65), "উইন্ডোটা" (450.2) — 4 of 5 release renders, 2026-10-30 | cut points taken from the ASR word list, whose edges are ±0.3 s off; nothing listened to the sound at the cut | `tools/cutdown/boundaries.mjs`: every spoken cut measured on the master minus its music bed (inside speech / stray first word → ERROR, with the pause to use); `cut.mjs` runs it and stops (proved: the old 477.75 cut stops it before any file is made) |
| Last caption of a piece showed a word that is not heard: "অথবা" (492.43 at a 492.45 end), a 60 ms ASR phantom "এটা" (428.04, silence) | the page captioned every word that STARTS before the piece's end | `tools/cutdown/page.mjs` drops a master-timed word with < 0.08 s or < 30 % of itself inside the piece (proved: claude-ig-2's old page loses exactly the phantom "এটা"; claude-reel-1..4, ig-1, ureel-1..3 pages byte-identical) |
| "এবং এবং এর" in Universal Reel 2: an ASR phantom "এবং" (78.36, music only) at a piece end plus the real one after the cut | the ASR wrote a word over music; master-words' phantom guard (25 dB under the source) let it through | boundaries.mjs `phantom`: a caption word within 0.6 s of a cut with nothing ≥ 8 dB over the music under it → ERROR with the captions.json index to drop (calibrated: flags 78.36, passes a quick soft "তো" at 46.0) |
| LinkedIn caption "…মেসেজ দিবেন / পার্সোনালি": one word alone on line 2 | a lone last word was joined to a 41-character page (+4 slack) and a flex pill ignores text-wrap: balance | page.mjs breaks a LinkedIn page over 40 characters at its middle (only that page changed; all other pages byte-identical) |

## 2. জায়গা Space: where an overlay sits

| Mistake | Root cause | Guard now |
| --- | --- | --- |
| Pills on text (Sadaltager over Rasalgethi, Opus over the prompt, VoiceOverClaude over 2 rows, folder pill over 2 names, Temperature over "Model settings", 2-files pill on the search box) | every tag was placed "centred above its anchor" by default; nobody looked at what was there over the whole show time | free space measured on source frames across the show window; preflight snapshots every overlay at its held moment |
| Green ticks covered the first letter of each task line | tick size not taken from the target (18 px circles) | size overlays from the measured target |
| Step panel 15 px past the monitor bezel; k1 callout over the model list | page-space boxes placed without the bezel/menus in mind | preflight sheets; design-lint's frame rules for HTML furniture |

## 3. অবস্থা State: the renderer seeks, it does not play

| Mistake | Root cause | Guard now |
| --- | --- | --- |
| Click rings ~1000 px off (first render) | HyperFrames' drawElement capture misplaces GSAP-transformed layers | finish.mjs passes `--experimental-fast-capture=false` (screenshot capture; it is also faster here) |
| 5 of 128 rings at the previous click's spot | x/y only in the fromTo FROM vars of a reused element: a seeked frame kept the old value | preflight `from_only` ERROR (proved: all 4 ring elements flagged on the old build) |
| "CLAUDE MAX POWER" title shown, blinked out, slammed in; its bar snapped full → empty | the element's CSS state before its entrance was "visible / full" | preflight `shown_early` ERROR + `snap` WARN (proved on the old build) |
| Glass sheen rested mid-frame for 1 s, then jumped; two icons popped from full size | no starting value before a later fromTo | preflight `snap` found them; `tl.set(…, 0)` starting states |
| Gemini first-frame poster showed while the monitor flew off | a clip past its duration hides; the poster under it was the FIRST frame | `screen_last.jpg` poster; preflight `clip_end` INFO points at the moment |
| Cursor glow slid across a frozen picture | the glow read the live cursor track; the picture read the freeze list | glow samples `unfreeze(s)` (same edit list); 1 sample per frame instead of 25 Hz |

## 4. উৎস Source: what the recording itself contains

| Mistake | Root cause | Guard now |
| --- | --- | --- |
| Black terminal flashes (264.4, 346.9), half-drawn dialog / Explorer (202, 160), double window (424.5), skeleton screen (386.1), window flip (168.6) | Windows drawing glitches; found only one render at a time | `tools/screen/glitch-scan.mjs`: A→B→A flashes + a strip of 9 frames around every change (on this source it lists the flashes at 214.3, 333.05 and 421.95 by itself; its strips show the half-drawn Explorer at 115.3, the Aero Peek desktop at 517.3, the double window at 519.0 and the in-ad greeting name at 526.05) |
| File names, desktop labels, picker dot-folders, "Move to my rc video" tooltip, hover-expanded pin readable | blur scope decided late; switches last a few frames | `privacy-blur` skill: level decided at the plan gate (default basic; file names only at strict) |
| Outro started with 9 frames of the unblurred screen recording (taskbar, WhatsApp badge) | the facecam clip was cut from the same source at the switch point | check every clip cut from the source; hold its first clean frame (`build/face.mjs`) |

## 5. প্রমাণ Proof: when and how it is checked

| Mistake | Root cause | Guard now |
| --- | --- | --- |
| Each review found new problems after a 2-hour render | the only full check was the render plus 43 contact sheets | `tools/preflight.mjs` (about 7 min) before; finish.mjs refuses a render over 60 s without a clean preflight of the exact build |
| Fixes were trusted until the next render | no cheap per-fix proof | snapshots of every fixed moment, `preflight --from/--to` for one stretch (about 1 min) |
| A full render was spent on harmless file names | policy scope not decided up front | privacy-blur levels; re-render only for a basic-level leak |

## The loop that keeps this growing

After every video, and after every round of his feedback:
1. Sort each mistake into one of the five elements.
2. Find its root cause, not just its symptom.
3. Turn it into a guard in `tools/` or a skill step.
4. Prove the guard on a copy of the old build.
5. Log it in `docs/system-log.md`.

<<<<< END OF FILE: fundamentals.md >>>>>

<<<<< FILE: lucide-icons.txt >>>>>

```text
Lucide icon names that exist in the workspace (1866). Use only these in "icon" fields. No brand logos exist.

a-arrow-down, a-arrow-up, a-large-small, accessibility, activity, ad, air-vent, airplay, alarm-clock, alarm-clock-check, alarm-clock-minus, alarm-clock-off, alarm-clock-plus, alarm-smoke, align-center-horizontal, align-center-vertical, align-end-horizontal, align-end-vertical, align-horizontal-distribute-center, align-horizontal-distribute-end, align-horizontal-distribute-start, align-horizontal-justify-center, align-horizontal-justify-end, align-horizontal-justify-start, align-horizontal-space-around, align-horizontal-space-between, align-start-horizontal, align-start-vertical, align-vertical-distribute-center, align-vertical-distribute-end, align-vertical-distribute-start, align-vertical-justify-center, align-vertical-justify-end, align-vertical-justify-start, align-vertical-space-around, align-vertical-space-between, ambulance, ampersand, ampersands, amphora, anchor, angle, antenna, anvil, aperture, app-window, app-window-mac, apple, archive, archive-restore, archive-x, armchair, armenian-dram, arrow-big-down, arrow-big-down-dash, arrow-big-left, arrow-big-left-dash, arrow-big-right, arrow-big-right-dash, arrow-big-up, arrow-big-up-dash, arrow-down, arrow-down-0-1, arrow-down-1-0, arrow-down-a-z, arrow-down-from-line, arrow-down-left, arrow-down-narrow-wide, arrow-down-right, arrow-down-to-dot, arrow-down-to-line, arrow-down-up, arrow-down-wide-narrow, arrow-down-z-a, arrow-left, arrow-left-from-line, arrow-left-right, arrow-left-to-line, arrow-right, arrow-right-from-line, arrow-right-left, arrow-right-to-line, arrow-up, arrow-up-0-1, arrow-up-1-0, arrow-up-a-z, arrow-up-down, arrow-up-from-dot, arrow-up-from-line, arrow-up-left, arrow-up-narrow-wide, arrow-up-right, arrow-up-to-line, arrow-up-wide-narrow, arrow-up-z-a, arrows-up-from-line, asterisk, astroid, at-sign, atom, audio-lines, audio-lines-off, audio-lines-x, audio-waveform, award, axe, axis-3d, baby, backpack, badge, badge-alert, badge-cent, badge-check, badge-dollar-sign, badge-euro, badge-indian-rupee, badge-info, badge-japanese-yen, badge-minus, badge-percent, badge-plus, badge-pound-sterling, badge-question-mark, badge-russian-ruble, badge-swiss-franc, badge-turkish-lira, badge-x, baggage-claim, balloon, ban, banana, bandage, bangladeshi-taka, banknote, banknote-arrow-down, banknote-arrow-up, banknote-check, banknote-x, barcode, barrel, baseline, bath, battery, battery-charging, battery-full, battery-low, battery-medium, battery-plus, battery-warning, beaker, bean, bean-off, bed, bed-double, bed-single, beef, beef-off, beer, beer-off, bell, bell-check, bell-dot, bell-electric, bell-minus, bell-off, bell-plus, bell-ring, between-horizontal-end, between-horizontal-start, between-vertical-end, between-vertical-start, biceps-flexed, bike, binary, binoculars, biohazard, bird, birdhouse, bitcoin, blend, blender, blinds, blocks, bluetooth, bluetooth-connected, bluetooth-off, bluetooth-searching, bold, bolt, bomb, bone, bone-fracture, book, book-a, book-alert, book-audio, book-bookmark, book-check, book-copy, book-dashed, book-down, book-headphones, book-heart, book-image, book-key, book-lock, book-minus, book-open, book-open-check, book-open-text, book-plus, book-search, book-text, book-type, book-up, book-up-2, book-user, book-x, bookmark, bookmark-check, bookmark-minus, bookmark-off, bookmark-plus, bookmark-x, boom-box, bot, bot-message-square, bot-off, bottle-wine, bow-arrow, box, boxes, braces, brackets, brain, brain-circuit, brain-cog, brick-wall, brick-wall-fire, brick-wall-shield, bridge, briefcase, briefcase-business, briefcase-conveyor-belt, briefcase-medical, briefcase-plus, bring-to-front, broccoli, broom, broom-sparkles, brush, brush-cleaning, bubbles, bug, bug-off, bug-play, building, building-complex, building-complex-plus, bus, bus-front, cable, cable-car, cake, cake-slice, calculator, calendar, calendar-1, calendar-arrow-down, calendar-arrow-up, calendar-check, calendar-check-2, calendar-chevrons-right, calendar-clock, calendar-cog, calendar-days, calendar-fold, calendar-heart, calendar-minus, calendar-minus-2, calendar-off, calendar-plus, calendar-plus-2, calendar-range, calendar-search, calendar-sync, calendar-x, calendar-x-2, calendars, camera, camera-off, can, can-soda, candy, candy-cane, candy-off, cannabis, cannabis-off, captions, captions-off, car, car-battery, car-front, car-taxi-front, caravan, card-sim, carrot, carton, carton-off, case-lower, case-sensitive, case-upper, cassette-tape, cast, castle, cat, cctv, cctv-off, chart-area, chart-bar, chart-bar-big, chart-bar-decreasing, chart-bar-increasing, chart-bar-stacked, chart-candlestick, chart-column, chart-column-big, chart-column-decreasing, chart-column-increasing, chart-column-stacked, chart-gantt, chart-line, chart-network, chart-no-axes-column, chart-no-axes-column-decreasing, chart-no-axes-column-increasing, chart-no-axes-combined, chart-no-axes-gantt, chart-pie, chart-scatter, chart-spline, check, check-check, check-line, chef-hat, cherry, chess-bishop, chess-king, chess-knight, chess-pawn, chess-queen, chess-rook, chevron-down, chevron-first, chevron-last, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-down-up, chevrons-left, chevrons-left-right, chevrons-left-right-ellipsis, chevrons-right, chevrons-right-left, chevrons-up, chevrons-up-down, church, cigarette, cigarette-off, circle, circle-alert, circle-arrow-down, circle-arrow-left, circle-arrow-out-down-left, circle-arrow-out-down-right, circle-arrow-out-up-left, circle-arrow-out-up-right, circle-arrow-right, circle-arrow-up, circle-check, circle-check-big, circle-chevron-down, circle-chevron-left, circle-chevron-right, circle-chevron-up, circle-dashed, circle-dashed-check, circle-divide, circle-dollar-sign, circle-dot, circle-dot-dashed, circle-ellipsis, circle-equal, circle-euro, circle-fading-arrow-up, circle-fading-plus, circle-gauge, circle-minus, circle-off, circle-parking, circle-parking-off, circle-pause, circle-percent, circle-pile, circle-play, circle-plus, circle-pound-sterling, circle-power, circle-question-mark, circle-slash, circle-slash-2, circle-small, circle-star, circle-stop, circle-user, circle-user-round, circle-x, circuit-board, citrus, clapperboard, clef-alto, clef-bass, clef-treble, clipboard, clipboard-check, clipboard-clock, clipboard-copy, clipboard-list, clipboard-minus, clipboard-paste, clipboard-pen, clipboard-pen-line, clipboard-plus, clipboard-type, clipboard-x, clock, clock-1, clock-10, clock-11, clock-12, clock-2, clock-3, clock-4, clock-5, clock-6, clock-7, clock-8, clock-9, clock-alert, clock-arrow-down, clock-arrow-left, clock-arrow-right, clock-arrow-up, clock-check, clock-fading, clock-plus, closed-caption, cloud, cloud-alert, cloud-backup, cloud-check, cloud-cog, cloud-download, cloud-drizzle, cloud-fog, cloud-hail, cloud-lightning, cloud-moon, cloud-moon-rain, cloud-off, cloud-rain, cloud-rain-wind, cloud-snow, cloud-sun, cloud-sun-rain, cloud-sync, cloud-upload, cloudy, clover, club, code, code-xml, coffee, cog, coins, columns-2, columns-3, columns-3-cog, columns-4, combine, command, compass, component, computer, concierge-bell, cone, construction, contact, contact-round, container, contrast, cookie, cooking-pot, copy, copy-check, copy-minus, copy-plus, copy-slash, copy-x, copyleft, copyright, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, cpu, creative-commons, credit-card, credit-card-check, credit-card-minus, credit-card-plus, credit-card-reader, credit-card-x, croissant, crop, cross, crosshair, crown, cuboid, cup-soda, cupcake, currency, cylinder, dam, database, database-arrow-down, database-arrow-up, database-backup, database-check, database-minus, database-plus, database-search, database-x, database-zap, decimals-arrow-left, decimals-arrow-right, delete, dessert, diameter, diamond, diamond-minus, diamond-percent, diamond-plus, dice-1, dice-2, dice-3, dice-4, dice-5, dice-6, dices, diff, disc, disc-2, disc-3, disc-album, divide, dna, dna-off, dock, dog, dollar-sign, dome, donut, door-closed, door-closed-cog, door-closed-locked, door-closed-package, door-open, door-stairwell, dot, download, drafting-compass, drama, drill, drone, droplet, droplet-off, droplets, drum, drumstick, dumbbell, ear, ear-off, earth, earth-lock, eclipse, egg, egg-fried, egg-off, eject, ellipse, ellipsis, ellipsis-vertical, engine, equal, equal-approximately, equal-approximately-not, equal-not, eraser, ethernet-port, euro, ev-charger, expand, external-link, eye, eye-closed, eye-dashed, eye-off, face-angry, face-expressionless, face-grinning, face-neutral, face-slightly-frowning, face-slightly-smiling, face-slightly-smiling-plus, factory, fan, fast-forward, faucet, feather, fence, ferris-wheel, file, file-archive, file-axis-3d, file-badge, file-box, file-braces, file-braces-corner, file-chart-column, file-chart-column-increasing, file-chart-line, file-chart-pie, file-check, file-check-corner, file-clock, file-code, file-code-corner, file-cog, file-diff, file-digit, file-down, file-exclamation-point, file-headphone, file-heart, file-image, file-input, file-key, file-lock, file-minus, file-minus-corner, file-music, file-output, file-pen, file-pen-line, file-play, file-plus, file-plus-corner, file-question-mark, file-scan, file-search, file-search-corner, file-signal, file-sliders, file-spreadsheet, file-stack, file-symlink, file-terminal, file-text, file-type, file-type-corner, file-up, file-user, file-video-camera, file-volume, file-x, file-x-corner, files, film, fingerprint-pattern, fire-extinguisher, fish, fish-off, fish-symbol, fishing-hook, fishing-rod, flag, flag-off, flag-triangle-left, flag-triangle-right, flame, flame-kindling, flashlight, flashlight-off, flask-conical, flask-conical-off, flask-round, flower, flower-2, focus, fold-horizontal, fold-vertical, folder, folder-archive, folder-bookmark, folder-check, folder-clock, folder-closed, folder-code, folder-cog, folder-dot, folder-down, folder-git, folder-git-2, folder-heart, folder-input, folder-kanban, folder-key, folder-lock, folder-minus, folder-open, folder-open-dot, folder-output, folder-pen, folder-plus, folder-root, folder-search, folder-search-2, folder-symlink, folder-sync, folder-tree, folder-up, folder-x, folders, footprints, forklift, form, forward, frame, fuel, fullscreen, funnel, funnel-plus, funnel-x, galaxy, gallery-horizontal, gallery-horizontal-end, gallery-thumbnails, gallery-vertical, gallery-vertical-end, gamepad, gamepad-2, gamepad-directional, gap-horizontal, gap-vertical, gauge, gavel, gem, georgian-lari, germ, germ-off, ghost, gift, git-branch, git-branch-minus, git-branch-plus, git-commit-horizontal, git-commit-vertical, git-compare, git-compare-arrows, git-fork, git-graph, git-merge, git-merge-conflict, git-pull-request, git-pull-request-arrow, git-pull-request-closed, git-pull-request-create, git-pull-request-create-arrow, git-pull-request-draft, glass-water, glasses, globe, globe-check, globe-code, globe-lock, globe-off, globe-x, goal, gpu, graduation-cap, grape, grid-2x2, grid-2x2-check, grid-2x2-plus, grid-2x2-x, grid-3x2, grid-3x3, grip, grip-horizontal, grip-vertical, group, guitar, ham, hamburger, hammer, hand, hand-coins, hand-fist, hand-grab, hand-heart, hand-helping, hand-metal, hand-platter, handbag, handshake, hard-drive, hard-drive-download, hard-drive-upload, hard-hat, hash, hat-glasses, haze, hd, hdmi-port, heading, heading-1, heading-2, heading-3, heading-4, heading-5, heading-6, headphone-off, headphones, headset, heart, heart-crack, heart-handshake, heart-minus, heart-off, heart-plus, heart-pulse, heart-x, heater, helicopter, hexagon, highlighter, hop, hop-off, hospital, hotel, hourglass, hourglass-cog, house, house-cog, house-heart, house-plug, house-plus, house-wifi, houses, ice-cream-bowl, ice-cream-cone, id-card, id-card-lanyard, image, image-down, image-minus, image-off, image-play, image-plus, image-up, image-upscale, images, import, inbox, indian-rupee, infinity, info, inspection-panel, italic, iteration-ccw, iteration-cw, iv-bag, japanese-yen, joystick, kanban, kayak, kazakh-tenge, key, key-round, key-square, keyboard, keyboard-music, keyboard-off, lambda, lamp, lamp-ceiling, lamp-desk, lamp-floor, lamp-wall-down, lamp-wall-up, land-plot, landmark, languages, laptop, laptop-minimal, laptop-minimal-check, lasso, lasso-select, layer-arrow-down, layer-arrow-up, layers, layers-2, layers-arrow-down, layers-arrow-up, layers-minus, layers-plus, layout-arrow-down, layout-arrow-right, layout-dashboard, layout-freeform, layout-grid, layout-grid-circles, layout-list, layout-panel-left, layout-panel-top, layout-template, leaf, leafy-green, lectern, lens-concave, lens-convex, letters, library, library-big, life-buoy, ligature, lightbulb, lightbulb-off, lighthouse, line-dot-bottom-vertical, line-dot-left-horizontal, line-dot-right-horizontal, line-dot-top-vertical, line-squiggle, line-style, link, link-2, link-2-off, list, list-check, list-checks, list-chevrons-down-up, list-chevrons-up-down, list-clock, list-collapse, list-end, list-filter, list-filter-plus, list-indent-decrease, list-indent-increase, list-minus, list-music, list-ordered, list-plus, list-restart, list-sort-ascending, list-sort-descending, list-start, list-todo, list-tree, list-video, list-x, loader, loader-circle, loader-pinwheel, locate, locate-fixed, locate-off, lock, lock-keyhole, lock-keyhole-open, lock-open, log-in, log-out, logs, lollipop, luggage, magnet, mail, mail-badge, mail-check, mail-clock, mail-minus, mail-open, mail-pen, mail-plus, mail-question-mark, mail-search, mail-warning, mail-x, mailbox, mails, map, map-minus, map-pin, map-pin-check, map-pin-check-inside, map-pin-house, map-pin-minus, map-pin-minus-inside, map-pin-off, map-pin-pen, map-pin-plus, map-pin-plus-inside, map-pin-search, map-pin-x, map-pin-x-inside, map-pinned, map-plus, mars, mars-stroke, martini, maximize, maximize-2, medal, megaphone, megaphone-off, memory-stick, menu, merge, message-circle, message-circle-check, message-circle-code, message-circle-dashed, message-circle-dashed-check, message-circle-heart, message-circle-more, message-circle-off, message-circle-plus, message-circle-question-mark, message-circle-reply, message-circle-warning, message-circle-x, message-square, message-square-check, message-square-code, message-square-dashed, message-square-diff, message-square-dot, message-square-heart, message-square-lock, message-square-more, message-square-off, message-square-plus, message-square-quote, message-square-reply, message-square-share, message-square-text, message-square-warning, message-square-x, messages-circle, messages-square, metronome, mic, mic-audio-lines, mic-off, mic-signal, mic-vocal, microchip, microscope, microwave, midi-port, milestone, milk, milk-off, minimize, minimize-2, minus, mirror-rectangular, mirror-round, monitor, monitor-check, monitor-cloud, monitor-cog, monitor-dot, monitor-down, monitor-off, monitor-pause, monitor-pc, monitor-play, monitor-smartphone, monitor-speaker, monitor-stop, monitor-up, monitor-x, moon, moon-star, mop, mop-sparkles, mosque, motorbike, mountain, mountain-snow, mouse, mouse-left, mouse-off, mouse-pointer, mouse-pointer-2, mouse-pointer-2-off, mouse-pointer-ban, mouse-pointer-click, mouse-right, mouth, mouth-off, move, move-3d, move-diagonal, move-diagonal-2, move-down, move-down-left, move-down-right, move-horizontal, move-left, move-right, move-up, move-up-left, move-up-right, move-vertical, music, music-2, music-3, music-4, navigation, navigation-2, navigation-2-off, navigation-off, nepali-rupee, network, newspaper, nfc, non-binary, notebook, notebook-dot, notebook-pen, notebook-tabs, notebook-text, notepad-text, notepad-text-dashed, nut, nut-off, octagon, octagon-alert, octagon-minus, octagon-pause, octagon-x, omega, option, orbit, origami, package, package-2, package-check, package-minus, package-open, package-plus, package-search, package-x, paint-bucket, paint-roller, paintbrush, paintbrush-vertical, palette, panda, panel-bottom, panel-bottom-close, panel-bottom-dashed, panel-bottom-open, panel-left, panel-left-close, panel-left-dashed, panel-left-open, panel-left-right-dashed, panel-right, panel-right-close, panel-right-dashed, panel-right-open, panel-top, panel-top-bottom-dashed, panel-top-close, panel-top-dashed, panel-top-open, panels-left-bottom, panels-right-bottom, panels-top-left, paper-bag, paperclip, parasol, parentheses, park, parking-meter, party-popper, pause, paw-print, pc-case, pen, pen-line, pen-off, pen-tool, pencil, pencil-line, pencil-off, pencil-ruler, pencil-sparkles, pentagon, percent, person-standing, phi, philippine-peso, phone, phone-call, phone-forwarded, phone-incoming, phone-missed, phone-off, phone-outgoing, pi, piano, pickaxe, picture-in-picture, picture-in-picture-2, piggy-bank, pilcrow, pilcrow-left, pilcrow-right, pill, pill-bottle, pin, pin-off, pipette, pizza, plane, plane-landing, plane-takeoff, plant-pot, play, play-off, playing-card, playing-cards, playing-cards-fan, plug, plug-2, plug-zap, plus, pocket-knife, podium, pointer, pointer-off, popcorn, popsicle, pound-sterling, power, power-off, presentation, printer, printer-3d, printer-check, printer-x, projector, proportions, puzzle, pyramid, qr-code, quote, rabbit, radar, radiation, radical, radio, radio-off, radio-receiver, radio-tower, radius, rainbow, rat, ratio, receipt, receipt-cent, receipt-euro, receipt-indian-rupee, receipt-japanese-yen, receipt-pound-sterling, receipt-russian-ruble, receipt-swiss-franc, receipt-text, receipt-turkish-lira, rectangle-circle, rectangle-ellipsis, rectangle-goggles, rectangle-horizontal, rectangle-vertical, recycle, redo, redo-2, redo-dot, refresh-ccw, refresh-ccw-dot, refresh-cw, refresh-cw-off, refrigerator, regex, remove-formatting, repeat, repeat-1, repeat-2, repeat-off, replace, replace-all, reply, reply-all, rewind, ribbon, road, robot-arm, robot-vacuum, rocket, rocking-chair, roller-coaster, rose, rotate-3d, rotate-ccw, rotate-ccw-clock, rotate-ccw-key, rotate-ccw-square, rotate-cw, rotate-cw-clock, rotate-cw-fading-clock, rotate-cw-square, route, route-off, router, rows-2, rows-3, rows-4, rss, rugby-ball, ruler, ruler-dimension-line, russian-ruble, sailboat, salad, sandwich, satellite, satellite-dish, saudi-riyal, save, save-all, save-check, save-off, save-pen, save-plus, scale, scale-3d, scaling, scan, scan-barcode, scan-box, scan-eye, scan-face, scan-heart, scan-line, scan-qr-code, scan-search, scan-square, scan-text, school, scissors, scissors-line-dashed, scooter, screen-share, screen-share-off, scroll, scroll-text, search, search-alert, search-check, search-code, search-slash, search-x, section, send, send-horizontal, send-to-back, separator-horizontal, separator-vertical, server, server-cog, server-crash, server-off, server-plus, settings, settings-2, shapes, share, share-2, sheet, shell, shelving-unit, shield, shield-alert, shield-ban, shield-check, shield-cog, shield-cog-corner, shield-ellipsis, shield-half, shield-keyhole, shield-lock, shield-minus, shield-off, shield-plus, shield-question-mark, shield-user, shield-x, ship, ship-cargo, ship-wheel, shirt, shopping-bag, shopping-basket, shopping-cart, shopping-cart-minus, shopping-cart-plus, shovel, shower-head, shredder, shrimp, shrimp-off, shrink, shrub, shuffle, sigma, signal, signal-high, signal-low, signal-medium, signal-zero, signature, signpost, signpost-big, siren, skip-back, skip-forward, skull, slash, slice, sliders-horizontal, sliders-vertical, smartphone, smartphone-charging, smartphone-nfc, snail, snowflake, soap-dispenser-droplet, sofa, solar-panel, soup, space, spade, sparkle, sparkles, speaker, speech, spell-check, spell-check-2, spline, spline-pointer, split, spool, sport-shoe, spotlight, spray-can, sprout, square, square-activity, square-arrow-down, square-arrow-down-left, square-arrow-down-right, square-arrow-left, square-arrow-out-down-left, square-arrow-out-down-right, square-arrow-out-up-left, square-arrow-out-up-right, square-arrow-right, square-arrow-right-enter, square-arrow-right-exit, square-arrow-up, square-arrow-up-left, square-arrow-up-right, square-asterisk, square-bookmark, square-bottom-dashed-scissors, square-centerline-dashed-horizontal, square-centerline-dashed-vertical, square-chart-gantt, square-check, square-check-big, square-chevron-down, square-chevron-left, square-chevron-right, square-chevron-up, square-code, square-dashed, square-dashed-bottom, square-dashed-bottom-code, square-dashed-kanban, square-dashed-mouse-pointer, square-dashed-plus, square-dashed-text, square-dashed-top-solid, square-dashed-x, square-dashed-x-corner, square-dimensions, square-divide, square-dot, square-equal, square-exclamation-point, square-function, square-kanban, square-library, square-m, square-menu, square-minus, square-mouse-pointer, square-off, square-parking, square-parking-off, square-pause, square-pen, square-percent, square-pi, square-pilcrow, square-play, square-plus, square-power, square-radical, square-round-corner, square-scissors, square-sigma, square-slash, square-sparkles, square-split-horizontal, square-split-vertical, square-square, square-stack, square-star, square-stop, square-terminal, square-text, square-user, square-user-round, square-x, squares-exclude, squares-intersect, squares-subtract, squares-unite, squircle, squircle-dashed, squirrel, stamp, star, star-check, star-half, star-minus, star-off, star-plus, star-x, step-back, step-forward, stethoscope, sticker, sticky-note, sticky-note-check, sticky-note-minus, sticky-note-off, sticky-note-plus, sticky-note-x, sticky-notes, stone, store, stretch-horizontal, stretch-vertical, strikethrough, subscript, summary, sun, sun-dim, sun-medium, sun-moon, sun-snow, sunrise, sunset, superscript, swatch-book, swiss-franc, switch-camera, sword, swords, syringe, table, table-2, table-cells-merge, table-cells-split, table-columns-split, table-of-contents, table-properties, table-rows-split, tablet, tablet-smartphone, tablets, tag, tag-plus, tag-x, tags, tally-1, tally-2, tally-3, tally-4, tally-5, tangent, target, telescope, tent, tent-tree, terminal, test-tube, test-tube-diagonal, test-tubes, text-align-center, text-align-end, text-align-justify, text-align-justify-center, text-align-justify-end, text-align-justify-start, text-align-start, text-cursor, text-cursor-input, text-initial, text-quote, text-search, text-wrap, theater, thermometer, thermometer-snowflake, thermometer-sun, thumbs-down, thumbs-up, tic-tac-toe, ticket, ticket-check, ticket-minus, ticket-percent, ticket-plus, ticket-slash, ticket-x, tickets, tickets-plane, timeline, timer, timer-off, timer-reset, toggle-left, toggle-right, toilet, tool-case, toolbox, toothbrush, toothbrush-sparkles, tornado, torus, touchpad, touchpad-off, towel-rack, tower-control, toy-brick, tractor, traffic-cone, trailer, train-front, train-front-tunnel, train-track, tram-front, transgender, trash, trash-off, tree-deciduous, tree-palm, tree-pine, trees, trending-down, trending-up, trending-up-down, triangle, triangle-alert, triangle-dashed, triangle-right, triangles-centerline-dashed-horizontal, triangles-centerline-dashed-vertical, trophy, truck, truck-electric, tube-lotion, turkish-lira, turntable, turtle, tv, tv-minimal, tv-minimal-play, type, type-outline, umbrella, umbrella-off, underline, undo, undo-2, undo-dot, unfold-horizontal, unfold-vertical, ungroup, university, unlink, unlink-2, unplug, upload, usb, usb-c-port, user, user-check, user-cog, user-group, user-key, user-lock, user-minus, user-pen, user-plus, user-round, user-round-arrow-left, user-round-check, user-round-cog, user-round-group, user-round-key, user-round-minus, user-round-pen, user-round-plus, user-round-search, user-round-x, user-search, user-shield, user-star, user-x, users, users-round, utensils, utensils-crossed, utility-pole, van, variable, vault, vector-polygon, vector-square, vegan, venetian-mask, venus, venus-and-mars, vibrate, vibrate-off, video, video-off, videotape, view, virus, virus-off, voicemail, volleyball, volume, volume-1, volume-2, volume-off, volume-x, vote, wallet, wallet-cards, wallet-minimal, wallpaper, wand, wand-sparkles, warehouse, washing-machine, watch, waves-arrow-down, waves-arrow-up, waves-horizontal, waves-ladder, waves-vertical, waypoints, webcam, webcam-off, webhook, webhook-off, weight, weight-tilde, wheat, wheat-off, whistle, whole-word, wifi, wifi-cog, wifi-high, wifi-low, wifi-off, wifi-pen, wifi-sync, wifi-zero, wind, wind-arrow-down, wind-arrow-up, wine, wine-off, workflow, worm, wrench, wrench-off, x, x-line-top, zap, zap-off, zodiac-aquarius, zodiac-aries, zodiac-cancer, zodiac-capricorn, zodiac-gemini, zodiac-leo, zodiac-libra, zodiac-ophiuchus, zodiac-pisces, zodiac-sagittarius, zodiac-scorpio, zodiac-taurus, zodiac-virgo, zoom-in, zoom-out
```

<<<<< END OF FILE: lucide-icons.txt >>>>>

<<<<< FILE: reel.example.json >>>>>

```json
{
  "title": "5 free tools for Claude Code (engine test)",
  "lang": "en",
  "platform": "Claude Code",
  "voice": "assets/voice/voice.wav",
  "voiceLabel": "পরীক্ষার ভয়েস: Kokoro am_michael, ১.৩৫ গুণ গতি",
  "music": { "file": "assets/music/test-bed-128bpm.mp3", "from": 0 },
  "project": "my-app",
  "handle": "@yourhandle",
  "keyword": "TOOLS",
  "goal": "ইঞ্জিনের পরীক্ষা: পাঁচটা ছাঁচ (fix, hub, pipeline, trace, dial) একটা ভিডিওতে ঠিকমতো চলে কিনা।",
  "hook": {
    "line": "Don't build with Claude Code until you've installed these five free tools.",
    "banner": ["Don't build yet", "0 of 5 tools installed"],
    "on": "until"
  },
  "tools": [
    {
      "name": "Context7",
      "maker": "from Upstash",
      "install": "claude mcp add context7",
      "result": "context7 · docs on demand",
      "intro": "The first is Context7, from Upstash.",
      "body": "It pulls the current docs for any library you use, so Claude stops writing code that broke two versions ago. Fresh docs, every time.",
      "scene": { "type": "fix", "sources": ["React", "Next.js", "Tailwind"], "file": "app.tsx", "bad": ["componentWillMount()", "ReactDOM.render(app)", "getInitialProps()"], "fixOn": "stops", "proof": { "text": "0 deprecated" } }
    },
    {
      "name": "Firecrawl",
      "maker": "web pages as clean text",
      "install": "claude mcp add firecrawl",
      "result": "firecrawl · web reader ready",
      "intro": "The second is Firecrawl.",
      "body": "It lets Claude read any website, docs, blogs and pricing pages as clean text, so research takes seconds, not hours.",
      "scene": { "type": "hub", "nodes": [{ "label": "Websites", "on": "website", "icon": "globe" }, { "label": "Docs", "on": "docs", "icon": "book-open" }, { "label": "Blogs", "on": "blogs", "icon": "newspaper" }, { "label": "Pricing", "on": "pricing", "icon": "dollar-sign" }], "chip": { "text": "clean text", "on": "clean" }, "proof": { "text": "Seconds, not hours", "on": "seconds" } }
    },
    {
      "name": "GitHub MCP",
      "mono": "GH",
      "maker": "the official GitHub server",
      "install": "claude mcp add github",
      "result": "github · issues and PRs",
      "intro": "The third is the GitHub MCP server.",
      "body": "It lets Claude open issues, write the fix, review the pull request and merge it, so one prompt ships the whole change.",
      "scene": { "type": "pipeline", "steps": [{ "label": "issue", "on": "issues" }, { "label": "fix", "on": "fix" }, { "label": "review", "on": "review" }, { "label": "merge", "on": "merge" }], "proof": { "text": "One prompt, one change", "on": "ships" } }
    },
    {
      "name": "Playwright MCP",
      "maker": "from Microsoft",
      "install": "claude mcp add playwright",
      "result": "playwright · browser tests",
      "intro": "The fourth is Playwright MCP, from Microsoft.",
      "body": "It clicks through your login, checkout and search like a real user, so every flow is tested before you ship.",
      "scene": { "type": "trace", "inputs": [{ "label": "Login", "on": "login" }, { "label": "Checkout", "on": "checkout" }, { "label": "Search", "on": "search" }], "rows": [{ "label": "Login", "to": 6, "unit": "steps" }, { "label": "Checkout", "to": 9, "unit": "steps" }, { "label": "Search", "to": 4, "unit": "steps" }], "linkOn": "user", "result": "19 steps passed", "proof": { "text": "0 broken flows", "on": "tested" } }
    },
    {
      "name": "Chrome DevTools MCP",
      "maker": "from the Chrome team at Google",
      "install": "claude mcp add chrome-devtools",
      "result": "chrome-devtools · real browser",
      "intro": "And the fifth is Chrome DevTools MCP, from the Chrome team at Google.",
      "body": "It opens your app in a real Chrome, reads the red errors in the console and fixes them itself.",
      "scene": { "type": "dial", "url": "localhost:3000", "app": "My app", "errors": ["TypeError: user is undefined", "404 /api/cart"], "from": 62, "to": 100, "label": "quality score", "fixOn": "fixes", "proof": { "text": "0 errors, ready to ship", "on": "itself" } }
    }
  ],
  "cta": { "line": "Comment TOOLS, and I'll send you one link with all five.", "dm": "All 5 tools in one link:" },
  "facts": [],
  "questions": []
}
```

<<<<< END OF FILE: reel.example.json >>>>>

<<<<< FILE: reel.series.example.json >>>>>

```json
{
 "engine": "series",
 "style": "REEL1",
 "series": "৫টা GitHub রিপো",
 "episode": 10,
 "title": "৫টা GitHub রিপো · পর্ব ১০: Claude Code-এর শক্তি বাড়ানো",
 "lang": "bn",
 "voice": "assets/voice/clone-b/voice.wav",
 "voiceLabel": "আপনার ক্লোন করা গলা খ (Gemini, talha-b)",
 "music": {
  "file": "assets/music/bgm.mp3",
  "from": 0,
  "label": "Lyria 3.5 দিয়ে বানানো, সিরিজের BGM প্রম্পটে"
 },
 "keyword": "CLAUDE",
 "minMatch": 0.75,
 "goal": "দর্শক পরিষ্কার জানবে ভিডিওটা কী নিয়ে (Claude Code-এর ৫টা ফ্রি পাওয়ার-আপ; Claude Code নিজে পেইড প্ল্যানে চলে), প্রতিটা কী করে আর কীভাবে বসাতে হয়, আর লিংক ও বসানোর বাংলা গাইড পেতে পেজের ইনবক্সে CLAUDE লিখবে।",
 "howTitle": "কীভাবে বসাবেন",
 "hook": {
  "line": "Claude Code দিয়ে কিছু বানানোর আগে, এই পাঁচটা ফ্রি জিনিস বসিয়ে নিন।",
  "on": "পাঁচটা",
  "cmd": "claude",
  "welcome": "Claude Code"
 },
 "promise": {
  "line": "প্রতিটা কী করে, আর কীভাবে বসাবেন, দেখাচ্ছি। Claude Code নিজে চলে পেইড প্ল্যানে। সব লিংক ইনবক্সে।",
  "kicker": "এই ভিডিওতে",
  "title": "৫টা পাওয়ার-আপ",
  "sub": "Claude Code-এর শক্তি বাড়াতে",
  "rows": [
   {
    "label": "কোনটা কী করে",
    "on": "করে",
    "icon": "sparkles"
   },
   {
    "label": "কীভাবে বসাবেন",
    "on": "বসাবেন",
    "icon": "list-checks"
   },
   {
    "label": "লিংক: ইনবক্সে CLAUDE",
    "on": "ইনবক্সে",
    "icon": "message-circle"
   }
  ]
 },
 "tools": [
  {
   "name": "Superpowers",
   "cmd": "/plugin install superpowers",
   "maker": "আগে প্ল্যান, তারপর কোড",
   "intro": "প্রথমটা Superpowers।",
   "body": "কোড লেখার আগে Claude প্রশ্ন করে, প্ল্যান বানায়, তারপর টেস্ট করে। এলোমেলো কোড আর হয় না।",
   "stat": {
    "text": "৩ লাখ স্টার"
   },
   "features": [
    {
     "label": "আগে প্রশ্ন",
     "on": "প্রশ্ন",
     "icon": "circle-question-mark"
    },
    {
     "label": "প্ল্যান বানায়",
     "on": "প্ল্যান",
     "icon": "list-checks"
    },
    {
     "label": "টেস্ট করে",
     "on": "টেস্ট",
     "icon": "flask-conical"
    }
   ],
   "proof": {
    "text": "এলোমেলো কোড নয়",
    "on": "এলোমেলো"
   },
   "how": {
    "line": "Claude Code-এর ভেতরে plugin install লিখে বসান, তারপর কিছু বানাতে বলুন।",
    "steps": [
     {
      "label": "plugin install",
      "on": "plugin"
     },
     {
      "label": "কিছু বানাতে বলুন",
      "on": "বানাতে"
     }
    ]
   }
  },
  {
   "name": "Anthropic Skills",
   "cmd": "/plugin install document-skills",
   "maker": "আসল Word, Excel ফাইল",
   "intro": "দ্বিতীয়টা Anthropic-এর নিজের Skills।",
   "body": "বললেই আসল Word, Excel আর PowerPoint ফাইল বানিয়ে দেয়, শুধু চ্যাটের লেখা নয়।",
   "features": [
    {
     "label": "Word",
     "on": "Word",
     "icon": "file-text"
    },
    {
     "label": "Excel",
     "on": "Excel",
     "icon": "sheet"
    },
    {
     "label": "PowerPoint",
     "on": "PowerPoint",
     "icon": "presentation"
    }
   ],
   "proof": {
    "text": "আসল ফাইল, লেখা নয়",
    "on": "চ্যাটের"
   },
   "how": {
    "line": "marketplace-এ skills যোগ করে document skills বসান, তারপর বলুন পাঁচ স্লাইডের PowerPoint বানাও।",
    "steps": [
     {
      "label": "marketplace-এ যোগ",
      "on": "marketplace-এ"
     },
     {
      "label": "document skills",
      "on": "document"
     },
     {
      "label": "PowerPoint বানাও",
      "on": "PowerPoint"
     }
    ]
   }
  },
  {
   "name": "Context7",
   "cmd": "npx ctx7 setup",
   "maker": "আজকের ডকুমেন্টেশন",
   "intro": "তৃতীয়টা Upstash-এর Context7।",
   "body": "Claude পুরোনো মনে-রাখা জিনিস দিয়ে নয়, আজকের ডকুমেন্টেশন পড়ে কোড লেখে।",
   "stat": {
    "text": "৬৪ হাজার স্টার"
   },
   "features": [
    {
     "label": "আজকের ডক",
     "on": "আজকের",
     "icon": "book-open"
    },
    {
     "label": "ঠিক কোড",
     "on": "কোড",
     "icon": "code"
    }
   ],
   "proof": {
    "text": "নতুন ডক পড়ে লেখে",
    "on": "লেখে"
   },
   "how": {
    "line": "টার্মিনালে npx ctx7 setup চালান, তারপর প্রম্পটের শেষে লিখুন use context7।",
    "steps": [
     {
      "label": "setup চালান",
      "on": "setup"
     },
     {
      "label": "use context7 লিখুন",
      "on": "use"
     }
    ]
   }
  },
  {
   "name": "Playwright MCP",
   "cmd": "claude mcp add playwright",
   "maker": "Claude-এর হাতে ব্রাউজার",
   "intro": "চতুর্থটা Microsoft-এর Playwright MCP।",
   "body": "Claude নিজেই ব্রাউজার খোলে, ক্লিক করে, ফর্ম পূরণ করে দেখে সাইট ঠিকমতো চলছে কি না।",
   "features": [
    {
     "label": "ব্রাউজার খোলে",
     "on": "ব্রাউজার",
     "icon": "globe"
    },
    {
     "label": "ক্লিক করে",
     "on": "ক্লিক",
     "icon": "mouse-pointer-click"
    },
    {
     "label": "ফর্ম পূরণ",
     "on": "ফর্ম",
     "icon": "text-cursor-input"
    }
   ],
   "proof": {
    "text": "সাইট টেস্ট নিজেই",
    "on": "চলছে"
   },
   "how": {
    "line": "এক লাইনে mcp add দিয়ে যোগ করুন, তারপর বলুন নিজের সাইটের ফর্মটা পরীক্ষা করো। ব্যাংকের সাইটে নয়।",
    "steps": [
     {
      "label": "mcp add দিন",
      "on": "mcp"
     },
     {
      "label": "ফর্ম পরীক্ষা করো",
      "on": "ফর্মটা"
     },
     {
      "label": "ব্যাংকের সাইটে নয়",
      "on": "ব্যাংকের"
     }
    ]
   }
  },
  {
   "name": "ccusage",
   "cmd": "npx ccusage@latest",
   "maker": "কত টোকেন গেল",
   "intro": "আর পঞ্চমটা ccusage।",
   "body": "Claude Code চলে পেইড প্ল্যানে। ccusage এক কমান্ডে দেখায় কত টোকেন গেল, লিমিটের কত কাছে আছেন।",
   "features": [
    {
     "label": "কত টোকেন গেল",
     "on": "টোকেন",
     "icon": "coins"
    },
    {
     "label": "লিমিট কত কাছে",
     "on": "লিমিটের",
     "icon": "gauge"
    }
   ],
   "proof": {
    "text": "লিমিটের হিসাব এক নজরে",
    "on": "আছেন"
   },
   "how": {
    "line": "টার্মিনালে npx ccusage লিখুন। পাঁচ ঘণ্টার হিসাব দেখতে শেষে blocks লিখুন।",
    "steps": [
     {
      "label": "npx ccusage",
      "on": "npx"
     },
     {
      "label": "শেষে blocks",
      "on": "blocks"
     }
    ]
   }
  }
 ],
 "cta": {
  "line": "পাঁচটার লিংক আর বসানোর বাংলা গাইড ফ্রিতে পেতে, আমার পেজে গিয়ে Message বাটন চাপুন, আর লিখুন CLAUDE। আমি নিজে আপনাকে পাঠিয়ে দেব।",
  "heading": "৫টা পাওয়ার-আপ এক নজরে",
  "ask": "লিংক আর বাংলা গাইড পেতে",
  "steps": [
   {
    "label": "পেজে যান",
    "on": "পেজে",
    "icon": "house"
   },
   {
    "label": "Message চাপুন",
    "on": "Message",
    "icon": "message-circle"
   },
   {
    "label": "লিখুন CLAUDE",
    "on": "লিখুন",
    "icon": "keyboard"
   }
  ],
  "label": "পেজের ইনবক্সে লিখুন",
  "sent": "লিংক আর বাংলা গাইড আসবে"
 },
 "emphasis": [
  "পেইড",
  "ফ্রি",
  "ব্যাংকের"
 ],
 "facts": [
  {
   "claim": "Superpowers (obra/superpowers) has about 309.1k GitHub stars",
   "value": "৩ লাখ",
   "source": "https://github.com/obra/superpowers",
   "checked": "2026-10-30"
  },
  {
   "claim": "anthropics/skills includes document skills for Word, Excel, PowerPoint, PDF (source-available)",
   "source": "https://github.com/anthropics/skills",
   "checked": "2026-10-30"
  },
  {
   "claim": "Context7 has about 64.0k GitHub stars; setup with npx ctx7 setup",
   "value": "৬৪ হাজার",
   "source": "https://github.com/upstash/context7",
   "checked": "2026-10-30"
  },
  {
   "claim": "Playwright MCP lets the agent drive a real browser",
   "source": "https://github.com/microsoft/playwright-mcp",
   "checked": "2026-10-30"
  },
  {
   "claim": "ccusage reports tokens and API-equivalent cost; Claude Code needs a paid plan (Pro or above)",
   "source": "https://github.com/ccusage/ccusage",
   "checked": "2026-10-30"
  }
 ],
 "questions": []
}
```

<<<<< END OF FILE: reel.series.example.json >>>>>

<<<<< FILE: sfx-list.md >>>>>

# Sound effects that exist (assets/sfx)

Write these names in backticks in a PLAN.md শব্দ cell, without the extension (`whoosh-short`, `click` ×৩).
Any other name is a plan-check WARN. Durations in seconds.

| name | s | what it is |
| --- | --- | --- |
| `applause` | 5.45 | Audience applause — end of a talk, a win, a big announcement. Fade it out under the next line. |
| `boom` | 2 | Deep cinematic boom — title slam, big reveal. Heavier than impact-bass. |
| `camera-shutter` | 0.74 | Camera shutter click — photo moment, screenshot, freeze-frame. |
| `cash-register` | 1.45 | Cash register 'ka-ching' — payment received, sale made, fee collected. |
| `chime` | 2.5 | Soft melodic chime — gentle positive beat: success/confirmation or a lighthearted transition. Sync to the visual moment. |
| `classroom-ambience` | 37.43 | 37 s of classroom chatter — school B-roll bed. Keep it low (0.10-0.20) under narration. |
| `click-soft` | 0.24 | Quiet soft click — gentle UI tap. (Replaces the old file, which was a byte-for-byte copy of click.mp3.) |
| `click` | 0.37 | Crisp UI click — button press, toggle, selection. Short accent, sync exactly to the on-screen action. |
| `coin-drop` | 1.53 | Single coin dropping — money, savings, fees, a price reveal. |
| `crowd-cheer` | 3.56 | Crowd cheering — celebration, results, prize-giving. |
| `error` | 1.62 | Negative / error tone — failure state, a 'wrong' beat, or a glitchy interruption. |
| `glitch-1` | 2.64 | Punchy digital glitch — hard-cut accent or sudden reveal. Trigger on the hit; let the decay bleed into the next shot (J-cut). |
| `glitch-2` | 3.5 | Harsh, longer glitch — chaotic / jarring transition or a distorted reveal. |
| `glitch-3` | 3.1 | Low-key glitch texture — subtle digital shift, minimal transition that sits under other audio. |
| `heartbeat` | 3.61 | Four heartbeats — tension, suspense, a countdown, health topics. |
| `impact-bass-1` | 2.12 | Bass impact hit — logo/hero snap, headline slam. Trigger on the visual landing; decay carries into the next shot (J-cut). |
| `impact-bass-2` | 2.59 | Bass impact with a short swell — brief anticipation then a deep hit. Place so the peak lands on the reveal. |
| `key-press` | 0.4 | Single key press — one keystroke / terminal-input beat. Short accent, sync to the typed character. |
| `notification` | 2.46 | Notification chime — alert, message-in, toast/badge appears. Sync to the element entering. |
| `page-turn` | 0.7 | Book page turn — next chapter, ledger/notebook, slide change. |
| `ping` | 1.32 | Sharp electronic ping — punchy accent on a key reveal or data point. Sync to the beat. |
| `pop` | 0.72 | Quick pop — element appear/spawn, chip/tag/badge in. Small precise accent, sync to the pop-in. |
| `riser` | 10.03 | Long cinematic riser (~10s build, peak at the end). Trigger at (climax_time − 10.03s) so it crests exactly on the reveal. |
| `room-tone` | 18.68 | 18 s of quiet room tone — bed under voice-over so silences don't sound dead. Loop or trim. |
| `school-bell` | 4.17 | Electronic school bell — class starts/ends, school-themed openers. |
| `sparkle` | 1.8 | Bright sparkle / shimmer — magical reveal or 'shine' highlight on a hero element. Sync to the highlight. |
| `success` | 4.18 | Bright 'correct answer' blips — success, task done, right choice. |
| `typing` | 1.5 | Typing burst (~1.5s of keys) — keyboard / code typing reveal, text-being-typed beat. Start as the text begins typing. |
| `whoosh-cinematic` | 5.54 | Cinematic whoosh build (~5.5s) — sweeping scene transition. Align so the swell peaks on the cut. |
| `whoosh-short` | 0.49 | Short airy whoosh (~0.5 s) — quick slide/swipe. (Replaces the old file, which was a copy of whoosh.mp3.) |
| `whoosh` | 0.57 | Punchy whoosh/impact — fast reveal or hard transition accent. Sync to the motion. |

<<<<< END OF FILE: sfx-list.md >>>>>

<<<<< FILE: skill-explainer.md >>>>>

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

<<<<< END OF FILE: skill-explainer.md >>>>>

<<<<< FILE: skill-motion-studio.md >>>>>

---
name: motion-studio
description: Make a client-grade motion-graphics video from the Motion Studio catalog (tools/studio) in the D:\Video Create workspace - a client or Talha names a CODE (PL1 launch film, FD1 feature drop, UT1 3D UI tour, AP1 app store preview, CL1 release reel, IH1 integrations, AI1 AI agent demo, HX1 explainer, WF1 workflow, IA1 3D architecture, DS1 data story, KP1 metrics, MP1 map, NW1 editorial, LG1 3D logo, KT1 kinetic type, BS1 brand system, SA1 vertical ad, EV1 event, GH1 3D glass title, CD1, LT1, packs LK1/AD10/RET1) and the brand; the kit scaffolds the project, the brief and plan gate run, builder agents author the HyperFrames page on studio.js (springs, expo settles, camera that lands at rest, cursor, typing, counters, grain), sound.mjs writes the beat-synced soundtrack, check.mjs + a critic gate it, render-queue renders one at a time. Also the portfolio, showreel and the business side (prices, outreach, payments). Use when he says motion graphics, a catalog code, "client video", "SaaS/launch/explainer/ad video for a client", portfolio, showreel, or pastes a client brief.
---

# Motion Studio (built 2026-11-07; reference piece projects/pf-pl1-lumen; 20 portfolio samples projects/pf-*)

CLAUDE.md rules all apply (simple Bengali to him, plan gate §0e, craft §0d, whole-video §0h, five elements §0i).
Business side (prices, where clients come from, getting paid in Bangladesh, blockers): `docs/business/PLAYBOOK.md`.
Service list: `tools/studio/catalog.json` → `docs/business/CATALOG.md` (`node tools/studio/catalog-doc.mjs`).

## 1. A job in seven commands
1. Brief: the client fills `docs/business/client-kit/CLIENT-BRIEF.md` (or you extract it from their message).
2. `node tools/studio/new-piece.mjs <name> --code=<CODE> --brand="<Brand>" [--aspect=… --dur=… --fonts=… --music=… --three]`
   (defaults per code from catalog.json). Write `projects/<name>/BRIEF.md` in the shape of the portfolio briefs
   (concept · look with hex + fonts · timed beats · craft notes · sound).
3. PLAN.md + `node tools/plan-check.mjs projects/<name>` → show him (and the client) the plan; build after the OK.
   Exception: he gives a complete multi-video brief and says build/render (CLAUDE.md §0 last rule) or a portfolio
   batch he asked for.
4. Build: one `studio-builder` agent per piece (`.claude/agents/studio-builder.md`; it follows
   `docs/studio/AGENT-BRIEF.md`). Two or more pieces → run the saved workflow
   `Workflow({name: "studio-batch", args: {projects: ["<name>", …]}})` (builder → independent `studio-critic`
   against `docs/studio/QUALITY.md` → fix pass). This skill authorises that workflow.
5. Sound: `piece.json` → `sound` (music from `C:/Users/Zubayer Nibir/VideoWork/studio-music/*.mp3` with its
   `.beats.json`; voice; cues at visual-hit times) → `node tools/studio/sound.mjs projects/<name>`.
6. `node tools/studio/check.mjs projects/<name> --at=<held moments>` → ✓, then LOOK at every contact sheet.
7. `node tools/studio/render-queue.mjs <name> [more…] --detach` (own process: survives a session restart) → `renders/portfolio/<CODE>_<Brand>.mp4`
   (+ `renders/<name>/<stamp>/` with qc.json, thumbnail, GIF). Then `node tools/contact-sheet.mjs <mp4> --every=1`
   and read it (§0d.9). Other aspect ratios: a separate composition per aspect for designed layouts (the default);
   `finish.mjs --formats=…` "fit" only in a hurry.

## 2. The kit (tools/studio) — decisions live in code, the model writes data + scenes
| File | What it does |
| --- | --- |
| `catalog.json` | every service: code, family, what, best-for, aspects, durations, music, fonts, prices (USD/BDT), sample |
| `new-piece.mjs` | scaffolds a piece: template index.html, piece.json, PLAN.md, chosen fonts + Hind Siliguri, GSAP + plugins, studio.js/css, three.js (import map) |
| `runtime/studio.js` | the motion API: eases (settle/enter/move/exit/glide/snap), springs (spring/springSoft/springPop), lines/words/chars reveals, type, count, burst, sweep, draw, camera (guards rest), drift, cursor, grain, vignette, flash (≤3/s guard), done() |
| `runtime/studio.css` | tokens, type scale, card/glass/chip/btn, browser + phone frames, backgrounds |
| `sound.mjs` | piece.json → `<audio>` tags: lead-in / peak alignment, lanes, music lane with fades + ducks, dead-air check |
| `beats.mjs` | beat map of a track (HyperFrames detector + music-drops): bpm, beats, strong, drops, energy |
| `check.mjs` | static studio rules + hyperframes check + design-lint + snapshots/contact sheets (through the Chrome slot) |
| `slot.mjs` | machine-wide limit on heavy jobs (chrome 2, render 1) for parallel agents |
| `render-queue.mjs` | serial renders via finish.mjs --release → renders/portfolio, queue.json |
| `icon.mjs` | Lucide icons as inline SVG (`--find word`) |
| `showreel.mjs` | the studio showreel from rendered pieces, cut on strong beats, each clip labelled with its code |
| `portfolio-page.mjs` | static portfolio site (web copies + posters) in renders/portfolio/site |
| `catalog-doc.mjs` | docs/business/CATALOG.md from catalog.json |

## 3. Traps that cost a run on 2026-11-07 (each is now handled — keep it that way)
- A bare `cd` in Bash moves the whole session (it even jumped into another session's worktree). Always
  `cd "/d/Video Create" && …` and `( cd sub && … )`.
- `hyperframes check` needs the timeline registration IN the page: end with `window.__timelines["main"] = S.done().tl;`.
- Registry blocks load GSAP/three/fonts from a CDN → rewrite to local files (check.mjs fails network URLs).
- Snapshots with > 9 times write `contact-sheet-1.jpg, -2 …`, not `contact-sheet.jpg` (check.mjs reads both).
- `data-layout-allow-overlap` is per text element and NOT inherited; for decorative groups use `data-layout-ignore`
  (inherited via closest). studio.js marks its own layers (grain, vignette, cursor, bursts, sweeps, flash).
- `background-clip: text` gradients do not follow SplitText's transformed lines: put the gradient class on the lines.
- A light sweep or ping tweened with fromTo leaves its from-state on screen after a backward seek → per-frame helpers.
- 3D fly-through: with perspective P a card at depth z shows at scale P/(P−z); `power2.in` keeps cards far until the
  last moment, so they never "rush past" — use `power1.in`, start nearer (z ≈ −1300 at P 1300), and place cards
  in a ring OUTSIDE the headline band (they spread outward as they approach).
- slot.mjs on Windows: an executable path with spaces must not go through the shell; bare names (npx) must.
- Long build-up SFX: land the PEAK on the hit (manifest `peak_s`: whoosh-cinematic 2.5 s, riser 3.0 s).
- `hyperframes snapshot --describe` uses the paid Gemini key unless `--describe false` (check.mjs passes it).
- Render speed here: PL1 (30 s, CSS 3D, 30 fps) took 312 s ≈ 10 s per second of video. One render at a time.
- Custom agent types (`.claude/agents/*.md`) and named workflows are loaded when a session STARTS. In the session
  that created or edited them: run the workflow by path, `Workflow({scriptPath: "D:\\Video Create\\.claude\\workflows\\studio-batch.js", args: …})`
  — the name resolves to the old cached copy, and `agentType: 'studio-builder'` throws "not found" (the workflow now
  falls back to a default subagent that reads the role file).
- Several render queues may run at once (each waits for the render slot); queue.json is appended, never overwritten.
- 3D (three.js) pieces: copy the pattern of `projects/pf-gh1-prism` / `pf-lg1-orbit` / `pf-ia1-vaultline` — a `<head>`
  script registers `window.__hf.buildReady`, the scene module resolves it after frame 0 is drawn; the scene renders
  inside `S.everyFrame(t => …)` (no requestAnimationFrame); an `hf-seek` listener redraws; `tl.set({}, {}, DUR)` pins
  the length; registry blocks are ported into index.html and their CDN imports removed. `hyperframes check` may say
  "did not become render-ready within 3000 ms" (shader compile on the UHD 620) and still pass. Measured: GH1 10 s in
  918 s, LG1 6 s in 177 s.
- **Never name the ease "spring"** (or hold / wiggle / custom): the HyperFrames runtime registers its own eases with
  those names after load, so "spring" played LINEAR in every render of the first batch (found by builder A3; 14 pages
  fixed and 11 pieces re-rendered). Use `houseSpring` (same k170/c14 curve), springSoft, springPop or pass
  `Studio.springFn(…)`. check.mjs now stops on those names (proved on the old page).
- Furniture labels ("Concept work · fictional brand") use class `concept` (or carry data-design-ignore): check.mjs
  exempts them from the ≥ 24 px rule.
- **Honesty guard (2026-11-08):** check.mjs fails a portfolio page (pf-* or a "fictional" client line) that shows a
  real domain (use `<name>.example`) or an install command naming a package (`curl -fsSL <brand>.example/install | sh`,
  or a made-up name listed in piece.json `honesty.checked` after `npm view` 404s); client pieces only warn. It warns
  when piece.json has no `nameCheck`: search "<brand> <industry>" BEFORE building — CD1 "Kernel" typed
  `kernel deploy`, the real CLI of Kernel (onkernel.com), and was renamed "Kerf" (folder pf-cd1-kerf). Known
  same-kind overlaps in the first batch, left for Talha to decide: AI1 Operator (OpenAI Operator), CL1 Forge
  (Laravel Forge), HX1 Kindred Health (Kindred Healthcare; its voice-over says the name), MP1 Cargoline (CargoLine).
- `check.mjs --static` runs only the static rules (no Chrome, under a second) — use it while editing.
- 3D render time varies a lot: GH1 (10 s, three.js glass) took 918 s on 2026-11-07 while six agents shared the
  laptop, and 109 s on 2026-11-08 with only the render queue running (hyperframes reported `browserGpuMode →
  hardware`, ANGLE on the UHD 620). Cause not proven — render 3D pieces when the machine is quiet.

## 4. After every client job
LESSONS.md row per feedback; new reusable code into tools/studio (with a header + proof); this skill updated;
catalog.json sample/status; `node tools/studio/catalog-doc.mjs`; commit with his OK + push (CLAUDE.md §0f/§00.6).

<<<<< END OF FILE: skill-motion-studio.md >>>>>

<<<<< FILE: skill-post-copy.md >>>>>

---
name: post-copy
description: Write the ready-to-paste post copy for a finished video or Reel in the D:\Video Create workspace - Facebook page post, ONE universal Reel caption that works unchanged on Facebook, Instagram and X, X posts and replies, LinkedIn posts, YouTube title + description with chapters + tags + pinned comment, YouTube Shorts title - in Talha Zubayer's own simple Bengali voice with the right number of hashtags per platform and one CTA, plus where each link goes, every block machine-checked with tools/release/copy-check.mjs. Use when he types /post-copy, asks for a caption, post, description, "post copy", "ad copy", hashtags, or after delivering ANY video or Reel (do it unasked). For a paid ad's copy (Meta Ads Manager primary text, headline), use the same voice rules with §5.
---

# post-copy: the words that go with every video (made 2026-10-30, claude-video-tutorial + claude-reel-1..4)

Examples that he received: `projects/claude-video-tutorial/POST-COPY.md` (full video) and `REELS-POST-COPY.md`
(4 Reels). The voice rules are the `humanize` skill (~/.claude/skills/humanize): load it first.

## 1. Facts come only from the video

Read the project's PLAN.md (script, goal, chapters) or the Reel's captions.json words. Every point in the copy must reflect what is said or shown in the video and the user's brief.

## 2. One file per project, ready to paste

Write `projects/<name>/POST-COPY.md` (or one REELS-POST-COPY.md for a series): every block in a ``` fence so he can copy
it in one tap. Sections: what goes where, then per platform. Placeholders only for links that do not exist yet,
written as "(এখানে আপনার YouTube লিংক)" with a line saying "লিংকটা দিলে আমি বসিয়ে দেব".

## 3. Platform rules (checked 2026-10-30; re-check yearly)

| Platform | Hashtags | Shape |
| --- | --- | --- |
| Facebook page post / Reels | 3–4 | hook line, 2–4 short lines, one CTA; the link goes in the FIRST COMMENT, not in the post |
| Instagram Reels | max 5 (the cap reported since Dec 2025) | same text; "লিংক Bio-তে" (links in captions don't click) |
| YouTube video | 3 in the description (over 15 → all ignored) | title ≤ 100 chars (keyword first, Bengali + English), description with "যা যা ব্যবহার করেছি" (a tutorial; for a promo or another kind, "ভিডিওতে যা দেখিয়েছি") and chapters (0:00 first, ≥ 3, each ≥ 10 s — copy-check tests them; from PLAN.md times, or shot rows grouped to ≥ 10 s), Tags box list, pinned comment |
| YouTube Shorts | 3 | title with #Shorts; set **Related video** to the full video in Studio |

Hashtag mix: 1 broad (#AIVideo), 1–2 niche (#ClaudeCode, #GoogleAIStudio), 1 Bengali (#বাংলা_টেক), + his own brand tag
once he names his page (STYLE.md §১ asks). Hashtags at the very end. Tell him plainly: hashtags help a little; reach
comes from the hook, watch time, shares and comments.

## 4. Routing (his rule, 2026-10-30)

Facebook Reels → the full video on his Facebook page (link in first comment). Facebook page post → YouTube.
Instagram Reels → YouTube (link in Bio). Shorts → the full video (Related video). Post the full video first, then one
Reel a day; best hour from his Page Insights.

## 5. CTA

One per post: "কমেন্টে লিখুন DM" or "পেজের ইনবক্সে KEYWORD লিখুন" when a prompt pack / offer exists, "Save করে রাখুন" for a
settings/how-to Reel, a simple question for a result Reel. Paid ads: primary text ≤ 125 chars before
"See more", headline ≤ 40, following the user's offer and brief.

Where the humanize skill's numbers differ (Facebook 3–5 hashtags, LinkedIn 3–5, a Facebook caption 60–150 words), this
skill and platforms.json win: Facebook 3–4, LinkedIn 3, and a universal Reel caption may be short (hook + 1–3 lines).

## 6. The release system's copy: universal Reels, X, LinkedIn (2026-10-30, `docs/release-system-plan.md` step 5)

Since 2026-10-30 every main video gets ONE file `projects/<name>/RELEASE-COPY.md` (example:
`projects/claude-video-tutorial/RELEASE-COPY.md`): a "where what goes" table, then per universal Reel its caption,
the Facebook first comment, the X reply and the Shorts title; the LinkedIn posts; the X post for the full video.
**Tag every fenced block** with the kind on the line before the fence, then run the check until it says 0 errors:
```
<!-- copy: universal-reel | x-post | x-reply | linkedin-post | first-comment | youtube-title -->
node tools/release/copy-check.mjs projects/<name>/RELEASE-COPY.md
```
The rules live in `tools/release/platforms.json → copyRules` (change them there, with the date):
- **universal-reel**: one caption pasted unchanged on Facebook, Instagram, X and as the Shorts description. Exactly 3
  hashtags (fits FB 3–4, IG ≤ 5, Shorts 3), X weighted length ≤ 280 (Bengali counts 1 per code point, emoji 2), no link
  and no platform's own words (Bio, লিংক কমেন্টে): the Reel's end card says "আমার প্রোফাইলে দেখুন" and each platform's
  link goes in its own place (FB first comment, IG Bio, X reply, Shorts Related video).
- **x-post** 1–2 hashtags, no link (the link goes in an **x-reply**). X free accounts take video ≤ 140 s: the full video
  goes to X as text + reply link, its Reels natively.
- **linkedin-post**: professional, his voice — what was built, the steps, one honest takeaway grounded in what he said,
  then ONE "মেসেজ করুন" line built from the offer THIS video makes (the tutorial's: "কোডিং, ভিডিও বা অটোমেশনের কাজ,
  অথবা Claude Code সেটআপ করাতে চাইলে মেসেজ করুন"; a video with no offer: "…নিয়ে কথা বলতে চাইলে মেসেজ করুন"; never
  borrow a service another video offered). 3 hashtags, ≤ 250 words, no link (first comment
  optional: sources disagree whether it costs reach), never কমেন্টে লিখুন / DM / লাইক / শেয়ার (LinkedIn holds back
  engagement bait). A full-video post may say "বাংলা সাবটাইটেল আছে" only when he uploads the `.bn.srt`.
- On every block: the humanize skill's machine tells, ≤ 1 em dash, ≤ 3 emoji, hashtags on the last line only.

## 7. Separate Facebook / Instagram / YouTube Shorts words for a Reel (2026-11-03, GitHub series 1–10)

When he asks for each platform's own caption, add under the Reel's heading in RELEASE-COPY.md (kinds and rules in
platforms.json, researched 2026-11-03): `facebook-reel` (3–4 hashtags, ≤ 90 words, first line ≤ 125 characters with
the keyword, no link, no "Bio"), `instagram-reel` (3–5 hashtags: the cap since Dec 2025 counts comment hashtags too,
first line ≤ 125, a one-line-per-tool list for Instagram search, CTA "আমার প্রোফাইলে Message চাপুন, লিখুন KW"),
`shorts-description` (3 hashtags, no link: links in Shorts descriptions do not click, so name the Facebook page and
put its link in the channel's Links), `youtube-tags`. Keep `universal-reel` for X. `pack.mjs` then uses each
platform's own block (falling back to the universal one) and writes `reel-caption.txt` / `reel-shorts.txt` /
`reel-post.txt` next to each video in the release folders. A series tag on every post (#GitHubBangla) lets the
series build up under one tag. His Bengali guide: `series/github-repos/POSTING-GUIDE.md`.

<<<<< END OF FILE: skill-post-copy.md >>>>>

<<<<< FILE: skill-privacy-blur.md >>>>>

---
name: privacy-blur
description: Decide WHAT to blur in a screen recording or footage before any render, in the D:\Video Create workspace - names, emails, phone numbers, profile photos, passwords and keys, money details, other people's messages - at a level the user picks with one word (basic / strict) or a short list (+ file names, - email). Use when the user types /privacy-blur, says "ki ki japsha hobe", "blur koro", "jhapsha", "privacy", or whenever a video shows his screen, desktop, browser or phone and nothing says otherwise (then the default level applies, no question asked).
---

# privacy-blur: what gets blurred, decided ONCE, before the first render

The user (Talha Zubayer, non-coder, Bengali) set this on 2026-10-29: blur what really matters, use your own
judgement for the rest, and do not re-render a whole video for things that are not harmful. Reply to him in
simple Bengali.

## How he calls it

| He types | Level |
| --- | --- |
| nothing at all, or `/privacy-blur` | **basic** (the default; decide yourself, ask nothing) |
| `/privacy-blur strict` | basic + everything in the strict list |
| `/privacy-blur + file names, + chat titles` | basic plus those items |
| `/privacy-blur - logo` | basic minus that item (only things he names; never drop the "always" row) |
| `/privacy-blur off` | nothing blurred except the "always" row |

Write the level in PLAN.md's "পুরো ভিডিও জুড়ে" line in Bengali (for example: "ঝাপসা: বেসিক, নাম, ইমেইল, ছবি, টাকা-পাসওয়ার্ড") so he sees it at the plan gate.
A level he picks for one video is for that video only. Use it as the default for later videos only if he says "সবসময়" (always).

## The levels

**Always, at every level (even `off`):** passwords, API keys and tokens, OTP codes, card, bank and bKash/Nagad numbers, balances, QR codes that log in or pay.

**basic (default):**
- His full name and his email anywhere: greetings like "Good evening, <name>", account chips, profile rows, breadcrumbs like `C:\Users\<name>`, OneDrive "<name> - Personal".
- Phone numbers and street addresses.
- Profile photos and face badges: Chrome profile badges on the taskbar, avatars.
- Other people's names, photos and message text: WhatsApp, Messenger and email previews, notification toasts.
- Faces of anyone but him.

**strict adds:**
- File and folder names that are his own: the Downloads list, Desktop labels, Quick-access pins, picker dialogs, recent files.
- Chat and project titles in app sidebars.
- Thumbnails that show content.
- Unread badges.
- App logos (needed for Meta ads, see screen-promo §4b).

**Never blurred, at any level:**
- What the tutorial is about: the files it downloads, renames and moves, and its project folder.
- System names: Desktop, Downloads, This PC, app names.
- Dates, sizes and column headers.

Not harmful, so not blurred at basic (he decided this on 2026-10-29): file names like `CapCut_Pro_*`, `Gemini_Generated_Image_*`, `New Text Document`. Platforms do not restrict a video for them. If a file name itself carries basic-level data (a person's name, a phone number, a client's private matter), blur it as basic.

## Do it in ONE pass, before the first full render

The claude-video-tutorial took three 2-hour renders because privacy spots were found after each render.

1. **Find every spot first.** Make `node tools/contact-sheet.mjs <source> --every=0.5` over the whole recording and list every window that can show private data. Look closely around windows that open or close, because the surprises live there.
2. **Measure the boxes.**
   - `tools/screen/text-scan.mjs` (`--at`, `--find`) gives frame-exact runs.
   - A box is static: start a new box when the list scrolls, a row is added, or the window moves.
   - Give each box about 6 px of margin.
   - Times are source seconds on the frame grid. Put each boundary at a half-frame midpoint, for example 294.108 between frames 294.100 and 294.117.
3. **Burn the blurs in.**
   - For a single cut: `cut.mjs --blur`.
   - For a project like claude-video-tutorial: the `specs.json` blurs that `tools/tutorial/screen.mjs` burns in. That file uses one split for all boxes, counts time from the frame-rounded seek, and uses sigma 22. Use sigma 60 on large text.
4. **Prove it before rendering.**
   - Run `text-scan.mjs --find=… --leaks` on the blurred clip; it must show 0 sharp frames.
   - Pull frames of the blurred clip at every spot, at full size.
   - Snapshot the page (`hyperframes snapshot --at …`) at the risky moments.
5. **Only then render.** If a basic-level leak shows up later, fix it and re-render. If only a strict-level item shows up and he did not ask for strict, tell him and do not re-render.

## Traps found on 2026-10-29 (claude-video-tutorial)

- **Other layers of the same source are not blurred.**
  - The outro's facecam was cropped from the same recording, and its first 9 frames still showed the unblurred taskbar. Check every clip cut from the source (intro, outro, posters, last-frame images).
  - Hold such frames on the first clean frame.
- **The dot-folders in a picker dialog's home view** (`.agents`, `.claude` …). This view sat behind a freeze, so it stayed on screen for 1.4 s.
- **Windows tooltips:**
  - A drag shows "Move to <folder>" with the folder's real name.
  - Hovering a truncated Quick-access pin shows its full name past the old box.
- **Aero Peek desktop frames:** a fast window switch flashes the desktop for a few frames. Check every frame there.
- **Boxes over windows that move:**
  - A box over an account chip smudges the window that opens on top of it. Narrow the box to the part that stays visible.
  - A box that runs a few frames past a cut smudges the next app.
- **A frozen frame keeps the blurs of its own time.** `freezeframes` takes the replacement from the already-blurred stream, so nothing extra is needed. A hold piece is blurred at its own source time.

<<<<< END OF FILE: skill-privacy-blur.md >>>>>

<<<<< FILE: skill-tools-reel.md >>>>>

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
- **"Attempted to use detached Frame"** (render or preflight stops at a random frame): the headless page crashed under
  load (a heavy look such as REEL4/REEL7 while ASR runs). Not the composition. Render that episode alone after the rest.
- **True peak over -1 dBTP after AAC** (REEL9, -0.4): finish.mjs now limits 4× oversampled and tighter until ≤ -1.
- **Covers**: `node tools/release/cover.mjs <p> --at=<promise card with all rows>` (the card says what the video is for).
- **Over 60 s = preflight before finish.mjs.** It caught: a world element visible before its fromTo (REEL2 #floor →
  `ctx.pre`), the camera push snapping 1 → 0.975 (now a breath: ease to 0.975, settle on 1), a child scale tween
  starting after its parent's entrance (#prt, .csn: start together).
- **Check a new look before its voice exists**: `node tools/reel/dry-voice.mjs projects/<p>` then
  `series.mjs projects/<p> --voice=assets/voice/dry/voice.wav` (no --plan; never render a dry build), then
  `hyperframes check`, design-lint, snapshots.

<<<<< END OF FILE: skill-tools-reel.md >>>>>

<<<<< FILE: studio-AGENT-BRIEF.md >>>>>

# Motion Studio — the brief every builder agent reads first

You are a senior motion designer at a studio whose clients pay $1,000–$5,000 per piece (Apple / Linear / Stripe /
Bloomberg level). You build in code: one HyperFrames composition (HTML + CSS + GSAP, rendered frame by frame) per piece,
on the studio kit in `tools/studio/`. Taste is judged by a human; you must LOOK at your frames.

Workspace: `D:\Video Create` (Windows, Git Bash). Always start every Bash command with `cd "/d/Video Create" &&` and use
`( cd projects/<p> && … )` subshells for anything inside a project — never a bare `cd` (it moves the whole session).

## 1. Read before you build (in this order)
1. `projects/<your-piece>/BRIEF.md` — the creative direction for your piece (concept, beats, palette, type, sound).
2. `tools/studio/runtime/studio.js` — the motion API (header + each helper's comment). Use it; do not re-invent it.
3. `projects/pf-pl1-lumen/index.html` + `piece.json` — the REFERENCE piece (PL1). Match its craft level and structure.
4. `tools/studio/runtime/studio.css` — tokens + surfaces (card, glass, chip, btn, browser, phone, bg-grid, glow…).
5. Only if you need it: `~/.claude/skills/hyperframes-core/SKILL.md` (composition contract),
   `~/.claude/skills/hyperframes-animation/SKILL.md` (motion vocabulary). The HyperFrames registry has 448 ready blocks
   (`npx hyperframes catalog --json`, `npx hyperframes add <name> --no-clipboard`); registry files load GSAP/three from a
   CDN — you MUST rewrite those to the local copies (`assets/js/gsap/…`, import map `three` → `./assets/js/three/…`),
   because `tools/studio/check.mjs` fails any network URL. Never run `hyperframes init`, `skills update` or `upgrade`.

## 2. The build loop (repeat until it is excellent)
1. `projects/<p>/` already exists (made by `tools/studio/new-piece.mjs`): index.html template, piece.json, PLAN.md,
   assets (fonts, GSAP + plugins, studio.js/css; three.js for 3D pieces). Set the real duration in BOTH the root
   `data-duration` and `piece.json` "duration".
2. Write `PLAN.md` (Bengali prose is fine; on-screen text in English exactly as shown): fill the header, লক্ষ্য, হুক,
   the shot table (সময় · পর্দায় কী · ক্যাপশন / লেখা · শব্দ with sfx names in backticks), যা লাগবে. Run
   `node tools/plan-check.mjs projects/<p>` until 0 ERROR (WARNs about long rows are OK when the motion inside the row
   changes every 2–3 s; write দম for deliberate holds).
3. Author `index.html`: scenes as `<section class="scene clip" data-start data-duration data-track-index>`, all motion
   on the ONE timeline from `Studio.init`, ending with `window.__timelines["main"] = S.done().tl;`.
4. Sound: fill `piece.json` → `sound.music` (track from `C:/Users/Zubayer Nibir/VideoWork/studio-music/*.mp3`; read its
   `.beats.json`: `kicks` (the real kick drum, every `kickInterval` s) for cuts and slams, `drops` for the hero reveal
   — set `music.from` so a drop lands on your reveal; `strong` is the detector's guess and can sit off the downbeat) and `sound.cues` (`t` = the VISUAL hit; the tool subtracts each file's lead-in / lands build-ups on their
   peak). Then `node tools/studio/sound.mjs projects/<p>`. Every scene change gets a whoosh, UI events quiet ticks
   (click 0.28–0.35), reveals a pop/ping/sparkle, hero lands an impact. No 1.5 s stretch without any sound.
5. `node tools/studio/check.mjs projects/<p> --at=<the held moment of EVERY shot + mid-moves>` → must end
   `✓ studio check passed`. Then READ every contact sheet (`snapshots/contact-sheet*.jpg`) and open full frames
   (`snapshots/frame-NN-at-Xs.png`) for text you must proofread. Fix, re-check. Do at least two critique passes:
   first pass for layout/legibility/bugs, second pass for TASTE (would a top studio ship this?).
6. Do NOT render. When done, reply with: the piece code, duration, what the film shows beat by beat (one line each),
   the final check result, the snapshot times you inspected, and anything you are unsure of.

## 3. Non-negotiable craft rules (the checks catch some; you must catch the rest)
- **Seek-safe state**: every visible state is a function of timeline time. Entrances = `tl.fromTo` starting hidden
  (never `tl.from`). Pings/flashes/typing/counters/cursors/packets = studio.js per-frame helpers or `S.everyFrame`.
  No `Math.random` (use `S.rnd()`), no `Date`, no network, no `gsap.to` outside `tl`.
- **GSAP owns transforms**: never a CSS `transform` on an element GSAP animates (`gsap_css_transform_conflict`). Use
  `gsap.set`/fromTo vars. Centre with flex/grid/inset, not translate(-50%).
- **Camera moves end at rest**: a push/settle lands on scale 1, rotation 0, z 0 (`S.camera` checks the last key).
- **Text**: readable text ≥ 28 px, kickers ≥ 24 px (1080p); ≤ 15 px only for furniture with `data-design-ignore`.
  Hold any text at least max(1.5 s, 0.3 s × words). Contrast ≥ 4.5:1. No `<br>` in body text (use block spans/
  max-width). Quote every font family name. Captions/headlines get `text-wrap: balance`.
- **Layout**: panels sized by their content (padding, not fixed boxes); rows of stats share one grid; nothing important
  outside the safe area (16:9: 5 % margin; 9:16: keep text inside x 6–82 %, y 15–62 % — the Meta/TikTok/Shorts union;
  1:1: 6 % margin). Decorative layers carry `data-design-ignore data-layout-ignore`; intentional text-over-text layering
  gets `data-layout-allow-overlap` on the specific text element.
- **Motion design**: vary eases by role (studio.js names: `settle` hero moves, `enter` entrances, `move` between places,
  `exit` exits ≤ 0.7× the entrance, `glide` drifts, `snap` whips; springs `houseSpring` / `springSoft` / `springPop` —
  ONE springPop per scene at most). Stagger 3–8 frames (`S.f(n)`), total stagger ≤ 0.6 s. Start the first move 0.1–0.3 s
  in. The element that moves first is the most important. Build / breathe / resolve inside every scene; something
  changes every 2–3 s; no still picture + silence ≥ 1.5 s. ≤ 3 flashes per second.
- **Depth and finish**: three layers per frame (background treatment, content, accent). Background never flat black:
  glows, grids, grain (`S.grain()` 0.04–0.07 on dark looks), vignette. Layered soft shadows on cards. One accent colour
  carries the hierarchy.
- **Honesty**: every brand is fictional (concept work). No real company logos or names, no real people, no AI faces,
  no fake testimonials with names. Put a small "Concept work · fictional brand" furniture label on the end card
  (15 px mono, ≥ 0.6 alpha). Any fact stated as true about the real world must BE true. Install commands, URLs and
  handles use reserved names (`*.example`); never a real package or domain a viewer could copy and run —
  `check.mjs` now FAILS a portfolio page that shows a real domain or an install command naming a package (allow a
  made-up name you looked up with piece.json `honesty.checked`). **Name check first:** search "<brand> <industry>"
  and write the result into piece.json `nameCheck`; a famous product of the same kind with the same name is a
  rename (CD1 "Kernel" typed `kernel deploy` — the real CLI command of Kernel, a developer company → "Kerf").
- **Bengali** (if any): no letter-spacing, split by words or lines only, Hind Siliguri / Baloo Da 2.
- **Kit notes from the first batch (2026-11-07):** stack tightly-leaded display lines in ONE flex column (absolutely
  placed slam lines trip `content_overlap` on Anton/Baloo's tall line boxes); `S.type(…, { preroll: 0 })` when lines
  type one after another; `S.sweep(…, { color, blend })` for light looks (it clips itself — no overflow on the host);
  `S.count` writes into its own `.st-num` span; 3D pieces follow `projects/pf-gh1-prism` (buildReady + per-frame render).
- **Reserved class names** (studio.css styles them — do not reuse them for your own elements): `scene layer center
  stage3d cam plane display h1 h2 h3 body small kicker mono tnum accent grad-text card raised glass chip dot btn
  hairline icon bg-grid bg-dots glow browser bar url view phone screen island sweep burst flash` (a swatch named
  `.chip` became a 40 px pill on BS1).
- **Contrast is sampled at five moments** — 1 s, the end − 1 s and three evenly between (e.g. 1/5/9/13/17 s for 18 s):
  a text mid-fade at one of them fails WCAG; move the fade a little.

## 4. Machine etiquette (several agents share one laptop)
- Heavy steps already queue through `tools/studio/slot.mjs` (max 2 Chromes). Never start `hyperframes preview`, a
  render, or several checks at once. Snapshots: ≤ 14 times per call.
- Work only inside your own project folders. Do not edit `tools/studio/*` — if the kit has a bug, describe it in your
  final reply (the lead fixes the kit for everyone). Do not commit.
- **More kit notes (2026-11-08):** text stacked inside a ROTATED card needs extra line spacing for `content_overlap`
  (it measures unrotated boxes; Playfair's box is 1.333 em → line-height ≥ 1.34); avoid large `filter: blur()` on
  big panels as an entrance (snapshots can show a stale blur — use size/position), blur only small text reveals;
  ASR word files can drop a whole sentence — check vo.words.json against script.txt before syncing.

<<<<< END OF FILE: studio-AGENT-BRIEF.md >>>>>

<<<<< FILE: studio-QUALITY.md >>>>>

# Motion Studio — the quality bar (what a critic checks before a piece may render)

Two layers. **Machine rules** are measured by `tools/studio/check.mjs` (+ hyperframes check, design-lint, qc.mjs after
the render). **Eye rules** need a human or a critic agent looking at the contact sheets and full frames.
Numbers: docs/business/research/R3-trends-craft.md §8 (Material 3, Carbon, Fluent, WCAG, Netflix, BBC) + CLAUDE.md §0d.

## A. Machine rules (must all pass)
1. `node tools/studio/check.mjs projects/<p>` ends with `✓ studio check passed` (static rules, lint, runtime, layout,
   motion, contrast ≥ 4.5:1, design-lint, snapshots).
2. No network URL, no Math.random / clock, timeline registered in the page, S.done() called.
3. studio.js guards silent: no linear ease on visible motion, camera last key at rest, ≤ 3 flashes in any second,
   timeline not past the end.
4. Sound: `node tools/studio/sound.mjs` with no dead-air warning; after the render qc.mjs: −14 LUFS ±1, true peak
   ≤ −1 dBTP, picture and sound start together, no frozen picture ≥ 5 s.

## B. Eye rules (the critic's checklist — every item gets a yes/no with a time stamp)
**Story & hierarchy**
- The hook (product, promise or number) is on screen within 3 s, in ≤ 8 words.
- Each shot has ONE focal point; the element that moves first is the most important one.
- The end card names the brand, the promise and one CTA; it holds ≥ 1.5 s and ≤ 3.5 s; it carries the small
  "Concept work · fictional brand" label (portfolio pieces).
**Typography**
- Readable text ≥ 28 px (1080p), kickers ≥ 24 px; text held ≥ max(1.5 s, 0.3 s × words).
- No widow word on a line alone; no clipped descenders; nothing touching the frame edge or a panel edge.
- Display type tight (−0.02 … −0.05 em), body never tracked; Bengali never tracked.
**Layout**
- Safe areas: 16:9 ≥ 5 % margins; 1:1 ≥ 6 %; 9:16 text inside x 6–82 %, y 15–62 %.
- Rows/columns align on one grid; panels fit their content; nothing overlaps unless it is deliberate layering.
**Motion**
- Entrances decelerate, exits accelerate and are faster (≤ 0.7×), moves between places use the standard curve.
- UI-sized moves 100–500 ms, hero reveals ≤ 1.2 s; no element moves on a straight constant speed unless it is
  continuous motion (a drift, a spinner, a ticker).
- Stagger 3–8 frames per item, ≤ 0.6 s per group; at most one bouncy element per scene.
- Camera pushes start below 1 and land on 1; no held frame shows content scaled past its layout.
- Something changes every 2–3 s; a deliberate breath (দম) ≤ 1.5 s of stillness and never with silence.
**Finish**
- Three layers per frame (background treatment, content, accent); no flat empty black/white backgrounds.
- One accent colour carries the hierarchy; contrast is comfortable, not just legal.
- Shadows are soft and layered; glass panels change blur/size while entering (never opacity alone).
**Sound**
- Every scene change has a sound; UI events tick quietly; the hero lands on a hit or a music drop;
  the music fades out by the end (no hard stop); voice (if any) is clear over the music.
**Honesty**
- No real brand logos or names, no real or AI faces, no fake named testimonials; real-world facts are true.
- Commands, URLs and handles a viewer could copy use reserved names (`*.example` domains, made-up packages checked
  to NOT exist): `npm i -g kernel` on CD1 named a real, unrelated npm package (critic, 2026-11-08). Machine-checked
  since 2026-11-08: check.mjs fails a real on-screen domain or an install command naming a package on portfolio pieces.
- The brand name is not a famous product of the same kind (piece.json `nameCheck` records the search): CD1's
  "Kernel" typed `kernel deploy`, the real CLI of Kernel (onkernel.com) → renamed "Kerf".

## C. Verdict
- **ship** — all A pass, no B item fails.
- **fix** — list each failing B item as {time, what is wrong, how to fix}; re-check after the fix.

<<<<< END OF FILE: studio-QUALITY.md >>>>>

<<<<< FILE: studio-brief.example.md >>>>>

# BRIEF — FD1 · Feature Drop

**Brand:** Relay — a shared team inbox (fictional)  
**Length / format:** 15 s, 16:9 (design it so a 1:1 crop of the centre also works)

## Concept
Feature: 'Smart Summaries' — one click turns a 40-message thread into 3 bullet points.

## Look (palette, type, finish)
LIGHT theme — the portfolio needs range. Background #f5f6fa with a soft white→#eef1ff gradient; UI white cards with hairline #e3e6ef borders and soft shadows (0 1px 2px rgba(16,24,40,.06), 0 12px 32px -8px rgba(16,24,40,.12)); ink #0b1020, muted #5b6478; ONE accent electric blue #2f6bff. Inter (display 600, tracking −0.035em). Grain off or ≤ 0.03 on light looks.

## Beats (fit the timing to the music's strong beats / drops; every text stays up long enough to read)
- 0–1.5 hook: big type 'Long thread?' then 'Meet Smart Summaries.' (mask lines)
- 1.5–5 a crowded thread (skeleton message rows + a few real lines) scrolls fast; the cursor moves to a 'Summarize' button (sparkle icon) and clicks (click ring)
- 5–9 punch-in (camera 0.94 → 1 onto the summary card): the 40 messages collapse into a card with 3 typed bullets + a 'Decision: ship Friday' chip
- 9–12 benefit line 'Catch up in 5 seconds.' + stat chip '40 messages → 3 lines'
- 12–15 lockup: Relay logo (a simple geometric mark you design in SVG) + 'Smart Summaries, now in Relay' + CTA 'Try it free'

## Craft notes
The punch-in lands on scale 1 (start below 1). Collapse: rows scale/translate into the card with stagger (S.f(2)). Use S.cursor, S.type for bullets (cps 40), S.sweep on the card at the reveal.

## Sound
studio-pulse; summary reveal (≈5 s) on a strong beat; click on the button, pops on bullets, whoosh-short on transitions, sparkle at the reveal.

## Done means
- `node tools/studio/check.mjs projects/pf-fd1-relay` ends with ✓; plan-check 0 ERROR; you looked at every held moment and fixed what a top studio would not ship.
- A small furniture label "Concept work · fictional brand" on the end card.
- `piece.json`: brief filled (client, goal, audience, message, cta, tone) and `reel` = the best 3–5 s (for the showreel).

<<<<< END OF FILE: studio-brief.example.md >>>>>

<<<<< FILE: studio-catalog.json >>>>>

```json
{
  "version": 1,
  "updated": "2026-11-07",
  "note": "The Motion Studio service catalog. A client (or Talha) names a CODE; tools/studio/new-piece.mjs takes its defaults from here; the portfolio page and the Bengali guide (docs/business/CATALOG.md) are made from this file. Prices: USD for international clients, BDT for local ones — research basis in docs/business/research/R1-market-pricing.md and R2-clients-payments-bd.md (2026-11-07). Every sample is CONCEPT work for a fictional brand and must be labelled so.",
  "families": [
    {
      "id": "product",
      "name": "Product & SaaS",
      "bn": "প্রোডাক্ট ও SaaS"
    },
    {
      "id": "explain",
      "name": "Explainers",
      "bn": "ব্যাখ্যা ভিডিও"
    },
    {
      "id": "data",
      "name": "Data & Editorial",
      "bn": "ডেটা ও সংবাদ-ধাঁচ"
    },
    {
      "id": "brand",
      "name": "Brand",
      "bn": "ব্র্যান্ড"
    },
    {
      "id": "social",
      "name": "Social & Ads",
      "bn": "সোশ্যাল ও বিজ্ঞাপন"
    },
    {
      "id": "premium3d",
      "name": "3D & Premium",
      "bn": "থ্রিডি ও প্রিমিয়াম"
    },
    {
      "id": "footage",
      "name": "Footage Editing",
      "bn": "ফুটেজ এডিটিং"
    },
    {
      "id": "packs",
      "name": "Packages & Retainers",
      "bn": "প্যাকেজ ও মাসিক চুক্তি"
    }
  ],
  "services": [
    {
      "code": "PL1",
      "family": "product",
      "name": "Product Launch Film",
      "bn": "প্রোডাক্ট লঞ্চ ফিল্ম",
      "what": "The hero video for a launch day: a big kinetic-type promise, the product UI floating in 3D space with a slow camera, three benefit beats, a light sweep and a logo lockup. Keynote-style.",
      "bestFor": "Funded SaaS / AI startups launching or relaunching; Product Hunt and X launch posts; the landing-page hero.",
      "aspects": [
        "16x9",
        "1x1",
        "9x16"
      ],
      "defaultDuration": 30,
      "durationRange": [
        30,
        60
      ],
      "music": "cinematic-reveal",
      "fonts": [
        "Geist",
        "GeistMono"
      ],
      "price": {
        "starter": 1200,
        "standard": 2500,
        "premium": 4500,
        "bdt": "৳1,20,000–3,50,000"
      },
      "turnaround": "5–7 working days",
      "includes": [
        "16:9 master",
        "1:1 + 9:16 cut-downs",
        "15 s teaser",
        "captions file",
        "2 revision rounds"
      ],
      "references": [
        "Apple product reveal films",
        "Linear and Vercel launch videos",
        "Stripe Sessions openers"
      ],
      "sample": {
        "project": "pf-pl1-lumen",
        "brand": "Lumen",
        "status": "planned"
      }
    },
    {
      "code": "FD1",
      "family": "product",
      "name": "Feature Drop",
      "bn": "নতুন ফিচারের ঘোষণা",
      "what": "One new feature in 15 seconds: a hook line, the cursor walks to the feature, a smooth punch-in on the UI moment, the result, a CTA.",
      "bestFor": "SaaS teams that ship every week and post updates on X / LinkedIn; changelog emails.",
      "aspects": [
        "16x9",
        "1x1"
      ],
      "defaultDuration": 15,
      "durationRange": [
        10,
        20
      ],
      "music": "studio-pulse",
      "fonts": [
        "Inter",
        "JetBrainsMono"
      ],
      "price": {
        "starter": 450,
        "standard": 900,
        "premium": 1500,
        "bdt": "৳40,000–90,000"
      },
      "turnaround": "2–3 working days",
      "includes": [
        "16:9 + 1:1",
        "captions",
        "1 revision round"
      ],
      "references": [
        "Linear changelog videos",
        "Raycast feature clips",
        "Notion release clips"
      ],
      "sample": {
        "project": "pf-fd1-relay",
        "brand": "Relay",
        "status": "planned"
      }
    },
    {
      "code": "UT1",
      "family": "product",
      "name": "3D UI Tour",
      "bn": "থ্রিডি অ্যাপ-ভ্রমণ",
      "what": "The app's screens as glass-edged panels in 3D space; the camera dollies from panel to panel (dashboard → pipeline → report) with parallax and depth of field.",
      "bestFor": "Product pages, sales decks, investor demos — when the product has 3–5 key screens.",
      "aspects": [
        "16x9"
      ],
      "defaultDuration": 25,
      "durationRange": [
        20,
        45
      ],
      "music": "bright-future",
      "fonts": [
        "Manrope",
        "JetBrainsMono"
      ],
      "price": {
        "starter": 900,
        "standard": 1800,
        "premium": 3200,
        "bdt": "৳90,000–2,50,000"
      },
      "turnaround": "4–6 working days",
      "includes": [
        "16:9 master",
        "1:1 cut-down",
        "2 revision rounds"
      ],
      "references": [
        "Apple macOS feature films",
        "Framer site intros",
        "Arc browser launch"
      ],
      "sample": {
        "project": "pf-ut1-atlas",
        "brand": "Atlas CRM",
        "status": "planned"
      }
    },
    {
      "code": "AP1",
      "family": "product",
      "name": "App Store Preview",
      "bn": "অ্যাপ স্টোরের প্রিভিউ",
      "what": "A vertical phone-first preview: taps, swipes and screen changes inside a phone, short benefit captions, made to the App Store / Play Store preview limits (15–30 s).",
      "bestFor": "Mobile app makers — App Store and Google Play listings, Reels and TikTok ads.",
      "aspects": [
        "9x16"
      ],
      "defaultDuration": 20,
      "durationRange": [
        15,
        30
      ],
      "music": "bright-future",
      "fonts": [
        "SpaceGrotesk",
        "Inter"
      ],
      "price": {
        "starter": 600,
        "standard": 1200,
        "premium": 2500,
        "bdt": "৳50,000–1,50,000"
      },
      "turnaround": "3–5 working days",
      "includes": [
        "9:16 store spec",
        "a 6 s bumper",
        "2 revision rounds"
      ],
      "references": [
        "Apple App Store featured app previews",
        "Duolingo and Headspace store videos"
      ],
      "sample": {
        "project": "pf-ap1-habitly",
        "brand": "Habitly",
        "status": "planned"
      }
    },
    {
      "code": "CL1",
      "family": "product",
      "name": "Changelog / Release Reel",
      "bn": "রিলিজ নোটের ভিডিও",
      "what": "\"What's new in v3.0\" — 4–6 updates in quick cuts: version stamp, icon + one line + a tiny UI snippet per update, a closing lockup.",
      "bestFor": "Dev tools and SaaS with monthly releases; community and newsletter posts.",
      "aspects": [
        "16x9",
        "1x1"
      ],
      "defaultDuration": 18,
      "durationRange": [
        15,
        30
      ],
      "music": "data-glitch",
      "fonts": [
        "SpaceGrotesk",
        "JetBrainsMono"
      ],
      "price": {
        "starter": 500,
        "standard": 1000,
        "premium": 1800,
        "bdt": "৳40,000–1,00,000"
      },
      "turnaround": "2–4 working days",
      "includes": [
        "16:9 + 1:1",
        "a reusable template for next releases"
      ],
      "references": [
        "Vercel Ship recaps",
        "GitHub Universe feature reels"
      ],
      "sample": {
        "project": "pf-cl1-forge",
        "brand": "Forge",
        "status": "planned"
      }
    },
    {
      "code": "IH1",
      "family": "product",
      "name": "Integrations Hub",
      "bn": "ইন্টিগ্রেশন দেখানো",
      "what": "The product as a glowing hub; app icons orbit in, beams connect them, data packets travel, a count of integrations lands.",
      "bestFor": "Automation, API and platform companies announcing integrations or a marketplace.",
      "aspects": [
        "1x1",
        "16x9"
      ],
      "defaultDuration": 12,
      "durationRange": [
        8,
        20
      ],
      "music": "studio-pulse",
      "fonts": [
        "Geist",
        "GeistMono"
      ],
      "price": {
        "starter": 400,
        "standard": 800,
        "premium": 1400,
        "bdt": "৳35,000–80,000"
      },
      "turnaround": "2–3 working days",
      "includes": [
        "1:1 + 16:9",
        "loopable version"
      ],
      "references": [
        "Zapier and Make integration visuals",
        "Stripe ecosystem graphics"
      ],
      "sample": {
        "project": "pf-ih1-nimbus",
        "brand": "Nimbus",
        "status": "planned"
      }
    },
    {
      "code": "AI1",
      "family": "product",
      "name": "AI Agent Demo",
      "bn": "এআই এজেন্টের ডেমো",
      "what": "An AI agent at work: a prompt is typed, a labelled agent cursor clicks through a clean UI, status chips tick from 'working' to 'done', the result lands. The 2026 launch format for AI products.",
      "bestFor": "AI startups showing an agent or copilot doing a real task; launch posts on X.",
      "aspects": [
        "16x9",
        "1x1"
      ],
      "defaultDuration": 20,
      "durationRange": [
        15,
        40
      ],
      "music": "studio-pulse",
      "fonts": [
        "Geist",
        "GeistMono"
      ],
      "price": {
        "starter": 800,
        "standard": 1600,
        "premium": 3000,
        "bdt": "৳80,000–2,00,000"
      },
      "turnaround": "3–5 working days",
      "includes": [
        "16:9 + 1:1",
        "captions",
        "2 revision rounds"
      ],
      "references": [
        "AI computer-use launch demos",
        "Cursor and Devin style agent clips"
      ],
      "sample": {
        "project": "pf-ai1-operator",
        "brand": "Operator",
        "status": "planned"
      }
    },
    {
      "code": "HX1",
      "family": "explain",
      "name": "How-It-Works Explainer",
      "bn": "কীভাবে কাজ করে — ব্যাখ্যা",
      "what": "A voiced 45–90 s explainer: the problem, the turn, three simple steps with friendly flat illustration and icons, proof, CTA. Script, voice-over and music included.",
      "bestFor": "Landing pages, onboarding, sales calls — health, fintech, B2B services that need clarity.",
      "aspects": [
        "16x9",
        "1x1"
      ],
      "defaultDuration": 45,
      "durationRange": [
        45,
        120
      ],
      "music": "bright-future",
      "fonts": [
        "Manrope"
      ],
      "voice": "English AI voice (Gemini) or client's own",
      "price": {
        "starter": 1500,
        "standard": 3000,
        "premium": 5500,
        "bdt": "৳1,00,000–3,00,000"
      },
      "turnaround": "7–10 working days",
      "includes": [
        "script",
        "voice-over",
        "16:9 + 1:1",
        "captions .srt",
        "2 revision rounds"
      ],
      "references": [
        "Kurzgesagt clarity",
        "Headspace / Stripe explainers"
      ],
      "sample": {
        "project": "pf-hx1-kindred",
        "brand": "Kindred Health",
        "status": "planned"
      }
    },
    {
      "code": "WF1",
      "family": "explain",
      "name": "Workflow Diagram in Motion",
      "bn": "কাজের ধাপের ডায়াগ্রাম",
      "what": "A process as a living diagram: nodes draw in, packets travel the paths, a branch splits on a condition, failures retry, success lights up the end.",
      "bestFor": "Automation, fintech ops, logistics and B2B tools whose value is the workflow.",
      "aspects": [
        "16x9"
      ],
      "defaultDuration": 20,
      "durationRange": [
        15,
        40
      ],
      "music": "data-glitch",
      "fonts": [
        "Inter",
        "JetBrainsMono"
      ],
      "price": {
        "starter": 600,
        "standard": 1200,
        "premium": 2200,
        "bdt": "৳50,000–1,20,000"
      },
      "turnaround": "3–4 working days",
      "includes": [
        "16:9",
        "transparent overlay version on request"
      ],
      "references": [
        "Stripe docs animations",
        "Temporal / n8n workflow visuals"
      ],
      "sample": {
        "project": "pf-wf1-ledgerly",
        "brand": "Ledgerly",
        "status": "planned"
      }
    },
    {
      "code": "IA1",
      "family": "explain",
      "name": "3D Architecture Stack",
      "bn": "থ্রিডি স্তর-ভাগ ডায়াগ্রাম",
      "what": "Real 3D: the system's layers (edge, API, compute, data, encryption) float apart in an isometric stack with labels, data runs through them, they lock back together.",
      "bestFor": "Infrastructure, security and developer platforms explaining 'how it is built'.",
      "aspects": [
        "16x9"
      ],
      "defaultDuration": 16,
      "durationRange": [
        12,
        30
      ],
      "music": "cinematic-reveal",
      "fonts": [
        "SpaceGrotesk",
        "JetBrainsMono"
      ],
      "three": true,
      "price": {
        "starter": 900,
        "standard": 1800,
        "premium": 3500,
        "bdt": "৳90,000–2,50,000"
      },
      "turnaround": "4–6 working days",
      "includes": [
        "16:9",
        "2 revision rounds"
      ],
      "references": [
        "Cloudflare and Vercel infra visuals",
        "Apple chip architecture films"
      ],
      "sample": {
        "project": "pf-ia1-vaultline",
        "brand": "Vaultline",
        "status": "planned"
      }
    },
    {
      "code": "DS1",
      "family": "data",
      "name": "Data Story",
      "bn": "ডেটার গল্প",
      "what": "Bloomberg / FT-style: a line chart draws itself, the key point is annotated, numbers count up, a comparison resolves — calm editorial type, one accent colour.",
      "bestFor": "Research firms, fintech, reports, investor letters, LinkedIn thought leadership.",
      "aspects": [
        "16x9",
        "1x1"
      ],
      "defaultDuration": 20,
      "durationRange": [
        15,
        45
      ],
      "music": "elegant-premium",
      "fonts": [
        "InstrumentSerif",
        "Inter"
      ],
      "price": {
        "starter": 500,
        "standard": 1100,
        "premium": 2000,
        "bdt": "৳45,000–1,20,000"
      },
      "turnaround": "2–4 working days",
      "includes": [
        "16:9 + 1:1",
        "data checked against the client's source"
      ],
      "references": [
        "Bloomberg Originals graphics",
        "Financial Times data videos",
        "The Economist charts"
      ],
      "sample": {
        "project": "pf-ds1-meridian",
        "brand": "Meridian Research",
        "status": "planned"
      }
    },
    {
      "code": "KP1",
      "family": "data",
      "name": "Investor Metrics Reel",
      "bn": "বিনিয়োগকারীর জন্য মেট্রিক্স",
      "what": "A funding or milestone announcement: big KPI count-ups (ARR, growth, customers, countries), a growth curve, a donut, a lockup — confident and exact.",
      "bestFor": "Startups announcing a round or a milestone; annual reviews; investor updates.",
      "aspects": [
        "16x9",
        "1x1",
        "9x16"
      ],
      "defaultDuration": 15,
      "durationRange": [
        12,
        30
      ],
      "music": "studio-pulse",
      "fonts": [
        "Geist",
        "GeistMono"
      ],
      "price": {
        "starter": 500,
        "standard": 1000,
        "premium": 1800,
        "bdt": "৳45,000–1,00,000"
      },
      "turnaround": "2–3 working days",
      "includes": [
        "3 aspect ratios",
        "numbers verified with the client"
      ],
      "references": [
        "Apple keynote stat slides",
        "Stripe annual letter graphics"
      ],
      "sample": {
        "project": "pf-kp1-northwind",
        "brand": "Northwind",
        "status": "planned"
      }
    },
    {
      "code": "MP1",
      "family": "data",
      "name": "Map Story",
      "bn": "ম্যাপের গল্প",
      "what": "A world map: hubs light up, routes draw as arcs, a counter runs, the camera pushes into a region — for reach, logistics and expansion stories.",
      "bestFor": "Logistics, travel, global SaaS expansion, NGOs showing reach.",
      "aspects": [
        "16x9"
      ],
      "defaultDuration": 16,
      "durationRange": [
        12,
        30
      ],
      "music": "cinematic-reveal",
      "fonts": [
        "Inter",
        "JetBrainsMono"
      ],
      "price": {
        "starter": 600,
        "standard": 1200,
        "premium": 2200,
        "bdt": "৳50,000–1,20,000"
      },
      "turnaround": "3–4 working days",
      "includes": [
        "16:9",
        "2 revision rounds"
      ],
      "references": [
        "Johnny Harris map style",
        "Apple-style flight maps"
      ],
      "sample": {
        "project": "pf-mp1-cargoline",
        "brand": "Cargoline",
        "status": "planned"
      }
    },
    {
      "code": "NW1",
      "family": "data",
      "name": "Editorial Explainer",
      "bn": "সংবাদ-ধাঁচের ব্যাখ্যা",
      "what": "Vox-style: paper textures, headline cards, highlighter strokes over key lines, a document zoom, a hand-drawn arrow, a voiced narration on a real topic.",
      "bestFor": "Media brands, newsletters, YouTube explainer channels, think tanks.",
      "aspects": [
        "16x9",
        "9x16"
      ],
      "defaultDuration": 24,
      "durationRange": [
        20,
        90
      ],
      "music": "data-glitch",
      "fonts": [
        "Playfair",
        "Inter"
      ],
      "voice": "English AI voice (Gemini)",
      "price": {
        "starter": 700,
        "standard": 1500,
        "premium": 3000,
        "bdt": "৳60,000–1,50,000"
      },
      "turnaround": "4–6 working days",
      "includes": [
        "script research with sources",
        "voice-over",
        "captions"
      ],
      "references": [
        "Vox explainers",
        "Johnny Harris",
        "Bloomberg Quicktake"
      ],
      "sample": {
        "project": "pf-nw1-thebrief",
        "brand": "The Brief",
        "status": "planned"
      }
    },
    {
      "code": "LG1",
      "family": "brand",
      "name": "3D Logo Sting",
      "bn": "থ্রিডি লোগো স্টিং",
      "what": "A 5–7 s logo reveal in real 3D: beveled letters flip up, light runs across the bevels, one sub-bass hit and a sparkle on the lock.",
      "bestFor": "Every brand: video intros/outros, YouTube channels, event openers, ads.",
      "aspects": [
        "16x9",
        "1x1",
        "9x16"
      ],
      "defaultDuration": 6,
      "durationRange": [
        4,
        8
      ],
      "music": "",
      "fonts": [
        "Geist"
      ],
      "three": true,
      "price": {
        "starter": 250,
        "standard": 500,
        "premium": 900,
        "bdt": "৳15,000–50,000"
      },
      "turnaround": "1–2 working days",
      "includes": [
        "3 aspect ratios",
        "with and without sound",
        "transparent version"
      ],
      "references": [
        "Netflix / HBO idents",
        "tech brand idents"
      ],
      "sample": {
        "project": "pf-lg1-orbit",
        "brand": "Orbit",
        "status": "planned"
      }
    },
    {
      "code": "KT1",
      "family": "brand",
      "name": "Kinetic Type Manifesto",
      "bn": "নাচন্ত লেখার ম্যানিফেস্টো",
      "what": "A brand belief told in big moving type cut to the beat: words slam, split, swap and morph; colour blocks wipe; it ends on the brand line.",
      "bestFor": "Brand campaigns, hiring videos, event openers, social posts with no footage.",
      "aspects": [
        "16x9",
        "9x16",
        "1x1"
      ],
      "defaultDuration": 20,
      "durationRange": [
        15,
        40
      ],
      "music": "social-punch",
      "fonts": [
        "Anton",
        "Inter"
      ],
      "price": {
        "starter": 500,
        "standard": 1000,
        "premium": 2000,
        "bdt": "৳40,000–1,00,000"
      },
      "turnaround": "2–4 working days",
      "includes": [
        "3 aspect ratios",
        "2 revision rounds"
      ],
      "references": [
        "Apple 'Shot on iPhone' type spots",
        "Nike kinetic type"
      ],
      "sample": {
        "project": "pf-kt1-driftwood",
        "brand": "Driftwood",
        "status": "planned"
      }
    },
    {
      "code": "BS1",
      "family": "brand",
      "name": "Brand System in Motion",
      "bn": "ব্র্যান্ড-গাইডলাইনের অ্যানিমেশন",
      "what": "The identity animated: logo construction, palette swatches, type specimen, pattern and real applications (cards, app icon, signage) — a living brand book.",
      "bestFor": "Branding agencies presenting work; companies launching a rebrand.",
      "aspects": [
        "16x9"
      ],
      "defaultDuration": 18,
      "durationRange": [
        15,
        45
      ],
      "music": "elegant-premium",
      "fonts": [
        "InstrumentSerif",
        "Manrope"
      ],
      "price": {
        "starter": 700,
        "standard": 1400,
        "premium": 2600,
        "bdt": "৳60,000–1,50,000"
      },
      "turnaround": "3–5 working days",
      "includes": [
        "16:9",
        "motion tokens file (eases, durations) for the brand"
      ],
      "references": [
        "Pentagram and Collins case-study films",
        "Behance brand reels"
      ],
      "sample": {
        "project": "pf-bs1-solace",
        "brand": "Solace",
        "status": "planned"
      }
    },
    {
      "code": "SA1",
      "family": "social",
      "name": "Vertical Social Ad",
      "bn": "খাড়া সোশ্যাল বিজ্ঞাপন",
      "what": "A 15 s vertical ad built for the feed: the hook in the first second, three benefit beats, a big CTA, voice-over and captions inside the platform safe zones.",
      "bestFor": "Performance marketers and DTC / app brands running Meta, TikTok and YouTube Shorts ads.",
      "aspects": [
        "9x16",
        "4x5",
        "1x1"
      ],
      "defaultDuration": 15,
      "durationRange": [
        6,
        30
      ],
      "music": "social-punch",
      "fonts": [
        "SpaceGrotesk",
        "Inter"
      ],
      "voice": "English AI voice (Gemini)",
      "price": {
        "starter": 250,
        "standard": 450,
        "premium": 800,
        "bdt": "৳15,000–40,000"
      },
      "turnaround": "1–3 working days",
      "includes": [
        "9:16 + 4:5 + 1:1",
        "3 hook variants",
        "captions"
      ],
      "references": [
        "Top-performing Meta ad creatives",
        "Duolingo / Notion TikTok ads"
      ],
      "sample": {
        "project": "pf-sa1-pocket",
        "brand": "Pocket",
        "status": "planned"
      }
    },
    {
      "code": "EV1",
      "family": "social",
      "name": "Event / Webinar Promo",
      "bn": "ইভেন্ট বা ওয়েবিনারের প্রোমো",
      "what": "Date, venue or link, speakers as clean monogram cards (no faces needed), the agenda in three beats, a countdown and a register button.",
      "bestFor": "Conferences, webinars, launches, community meetups, workshops.",
      "aspects": [
        "1x1",
        "9x16",
        "16x9"
      ],
      "defaultDuration": 12,
      "durationRange": [
        10,
        20
      ],
      "music": "studio-pulse",
      "fonts": [
        "Anton",
        "Inter"
      ],
      "price": {
        "starter": 300,
        "standard": 600,
        "premium": 1000,
        "bdt": "৳20,000–60,000"
      },
      "turnaround": "1–2 working days",
      "includes": [
        "3 aspect ratios",
        "a countdown version"
      ],
      "references": [
        "Figma Config promos",
        "Web Summit promos"
      ],
      "sample": {
        "project": "pf-ev1-builders",
        "brand": "Builders Summit",
        "status": "planned"
      }
    },
    {
      "code": "GH1",
      "family": "premium3d",
      "name": "3D Glass Hero Title",
      "bn": "থ্রিডি কাচের হিরো টাইটেল",
      "what": "Real 3D glass: a refracting glass form turns in front of a giant headline so the type bends through it, then the tagline lands — the most premium 8–10 seconds a brand can open with.",
      "bestFor": "Landing-page heroes, keynote openers, premium product teasers.",
      "aspects": [
        "16x9",
        "9x16"
      ],
      "defaultDuration": 10,
      "durationRange": [
        6,
        15
      ],
      "music": "cinematic-reveal",
      "fonts": [
        "Inter"
      ],
      "three": true,
      "price": {
        "starter": 600,
        "standard": 1200,
        "premium": 2400,
        "bdt": "৳60,000–1,50,000"
      },
      "turnaround": "2–4 working days",
      "includes": [
        "16:9 + 9:16",
        "a seamless loop version"
      ],
      "references": [
        "Apple Liquid Glass reveal",
        "Spline / Rive hero scenes"
      ],
      "sample": {
        "project": "pf-gh1-prism",
        "brand": "Prism",
        "status": "planned"
      }
    },
    {
      "code": "CD1",
      "family": "premium3d",
      "name": "Dev-Tool Launch (3D code)",
      "bn": "ডেভেলপার টুলের লঞ্চ",
      "what": "Syntax-highlighted code on a lit 3D slab rotating into a readable rest, a terminal run, the result — for developer products.",
      "bestFor": "Dev tools, APIs, SDKs, open-source launches.",
      "aspects": [
        "16x9"
      ],
      "defaultDuration": 14,
      "durationRange": [
        10,
        30
      ],
      "music": "data-glitch",
      "fonts": [
        "GeistMono",
        "Geist"
      ],
      "three": true,
      "price": {
        "starter": 600,
        "standard": 1200,
        "premium": 2200,
        "bdt": "৳50,000–1,20,000"
      },
      "turnaround": "3–4 working days",
      "includes": [
        "16:9 + 1:1"
      ],
      "references": [
        "Vercel / Supabase launch weeks",
        "GitHub Universe"
      ],
      "sample": {
        "project": "pf-cd1-kerf",
        "brand": "Kerf",
        "status": "optional"
      }
    },
    {
      "code": "LT1",
      "family": "premium3d",
      "name": "Lower-Thirds & Titles Pack",
      "bn": "লোয়ার-থার্ড ও টাইটেল প্যাক",
      "what": "A matched set of name bars, section titles, callouts and end cards on a transparent background, in the client's brand, ready to drop on any edit.",
      "bestFor": "YouTubers, podcasts, corporate video teams, event streams.",
      "aspects": [
        "16x9",
        "9x16"
      ],
      "defaultDuration": 12,
      "durationRange": [
        8,
        20
      ],
      "music": "",
      "fonts": [
        "Inter"
      ],
      "price": {
        "starter": 300,
        "standard": 600,
        "premium": 1200,
        "bdt": "৳20,000–60,000"
      },
      "turnaround": "2–3 working days",
      "includes": [
        "transparent .mov/.webm",
        "8–12 elements"
      ],
      "references": [
        "broadcast graphics packages"
      ],
      "sample": {
        "project": "",
        "brand": "",
        "status": "optional"
      }
    },
    {
      "code": "FM1",
      "family": "footage",
      "name": "Footage + Motion Promo",
      "bn": "ফুটেজ + মোশন প্রোমো",
      "what": "Real footage (the client's own or licensed stock) cut on the beat, warm cinematic grade and letterbox, kinetic titles, tracked-style callouts on the footage, a lower third and a brand end card.",
      "bestFor": "Cafés, restaurants, retail, real estate, travel and DTC brands that have product or place footage.",
      "aspects": [
        "16x9",
        "9x16"
      ],
      "defaultDuration": 21,
      "durationRange": [
        15,
        45
      ],
      "music": "elegant-premium",
      "fonts": [
        "InstrumentSerif",
        "Manrope"
      ],
      "price": {
        "starter": 400,
        "standard": 900,
        "premium": 1800,
        "bdt": "৳25,000–90,000"
      },
      "turnaround": "2–4 working days",
      "includes": [
        "16:9 + 9:16",
        "colour grade",
        "captions if voiced",
        "2 revision rounds"
      ],
      "references": [
        "premium café and DTC brand spots",
        "Apple 'Shot on iPhone' type over footage"
      ],
      "sample": {
        "project": "pf-fm1-emberoak",
        "brand": "Ember & Oak",
        "status": "planned"
      }
    },
    {
      "code": "AB1-AB5",
      "family": "footage",
      "name": "Talking Head + B-roll (5 styles)",
      "bn": "কথা বলার ভিডিও + বি-রোল (৫ ধরন)",
      "what": "Your talking-head recording edited in one of five named styles: Glass Split, Bubble Cut, Punch Type, Card Fan, Data Stage.",
      "bestFor": "Creators, coaches, founders on camera.",
      "aspects": [
        "16x9",
        "9x16"
      ],
      "engine": "tools/abroll",
      "price": {
        "starter": 150,
        "standard": 400,
        "premium": 900,
        "bdt": "৳8,000–40,000"
      },
      "sample": {
        "project": "abroll-variants-demo",
        "status": "ready"
      }
    },
    {
      "code": "EP1",
      "family": "footage",
      "name": "Long Episode + Reels",
      "bn": "লম্বা পর্ব + রিলস",
      "what": "A long talking-head episode with motion-graphics cards and word-by-word captions, plus vertical Reels cut from it.",
      "bestFor": "YouTube channels, podcasts, courses.",
      "aspects": [
        "16x9",
        "9x16"
      ],
      "engine": "tools/episode",
      "price": {
        "starter": 300,
        "standard": 700,
        "premium": 1500,
        "bdt": "৳15,000–60,000"
      },
      "sample": {
        "project": "zubayer-ep01",
        "status": "ready"
      }
    },
    {
      "code": "TUT1",
      "family": "footage",
      "name": "Screen Tutorial",
      "bn": "স্ক্রিন টিউটোরিয়াল",
      "what": "A long screen recording + voice turned into a clean 16:9 tutorial with zooms, cursor glow, chapter cards and captions.",
      "bestFor": "SaaS onboarding, course creators, software trainers.",
      "aspects": [
        "16x9"
      ],
      "engine": "tools/tutorial",
      "price": {
        "starter": 250,
        "standard": 600,
        "premium": 1200,
        "bdt": "৳12,000–50,000"
      },
      "sample": {
        "project": "claude-video-tutorial",
        "status": "ready"
      }
    },
    {
      "code": "PROMO1",
      "family": "footage",
      "name": "Screen-Recording Commercial",
      "bn": "স্ক্রিন রেকর্ডিং থেকে বিজ্ঞাপন",
      "what": "A screen recording of an app turned into a commercial: zooms onto UI moments, cursor glow, 3D tilt, click boom, end card.",
      "bestFor": "SaaS and app makers who already have the product running.",
      "aspects": [
        "16x9",
        "9x16"
      ],
      "engine": "tools/screen/promo-core.mjs",
      "price": {
        "starter": 400,
        "standard": 900,
        "premium": 1800,
        "bdt": "৳25,000–80,000"
      },
      "sample": {
        "project": "claude-decision-ad",
        "status": "ready"
      }
    },
    {
      "code": "CP1",
      "family": "footage",
      "name": "AI-Clip Client Promo",
      "bn": "এআই ক্লিপ থেকে ক্লায়েন্ট প্রোমো",
      "what": "A client's AI-generated clips + voice + music cut into a production-ready promo, 16:9 and a designed 9:16.",
      "bestFor": "Local businesses with AI clips — food, retail, real estate.",
      "aspects": [
        "16x9",
        "9x16"
      ],
      "engine": "tools/promo",
      "price": {
        "starter": 200,
        "standard": 450,
        "premium": 900,
        "bdt": "৳10,000–40,000"
      },
      "sample": {
        "project": "mohona-promo-01",
        "status": "ready"
      }
    },
    {
      "code": "UREEL1",
      "family": "footage",
      "name": "Universal Reels Cut-downs",
      "bn": "সব প্ল্যাটফর্মের রিলস",
      "what": "Vertical Reels cut from a finished video that upload unchanged to Facebook, Instagram, X and YouTube Shorts.",
      "bestFor": "Anyone with a long video who needs short-form reach.",
      "aspects": [
        "9x16"
      ],
      "engine": "tools/cutdown",
      "price": {
        "starter": 60,
        "standard": 150,
        "premium": 300,
        "bdt": "৳3,000–12,000 per reel"
      },
      "sample": {
        "project": "claude-ureel-1",
        "status": "ready"
      }
    },
    {
      "code": "EXP1",
      "family": "footage",
      "name": "Bengali Explainer Board",
      "bn": "বাংলা ব্যাখ্যা বোর্ড",
      "what": "A voiced Bengali tutorial with no footage: drawn app windows, chats, folders, code, diagrams; captions with the spoken word in gold.",
      "bestFor": "Bangladeshi edtech, NGOs, local SaaS, course creators.",
      "aspects": [
        "16x9"
      ],
      "engine": "tools/explainer",
      "price": {
        "starter": 200,
        "standard": 500,
        "premium": 1000,
        "bdt": "৳15,000–60,000"
      },
      "sample": {
        "project": "claude-skills-tutorial",
        "status": "ready"
      }
    },
    {
      "code": "LK1",
      "family": "packs",
      "name": "Launch Kit",
      "bn": "লঞ্চ কিট",
      "what": "PL1 launch film + FD1 feature drops ×2 + KP1 metrics + 9:16 / 1:1 cut-downs + LG1 sting — everything for one launch week.",
      "bestFor": "Startups with a launch date.",
      "price": {
        "starter": 2500,
        "standard": 4500,
        "premium": 8000,
        "bdt": "৳2,50,000–6,00,000"
      }
    },
    {
      "code": "AD10",
      "family": "packs",
      "name": "Ad Pack ×10",
      "bn": "১০টা বিজ্ঞাপনের প্যাক",
      "what": "Ten vertical SA1 ads from one brief: 3 hooks × 3 angles + 1 offer, all aspect ratios, captions — built to A/B test.",
      "bestFor": "DTC and app brands spending on Meta / TikTok ads.",
      "price": {
        "starter": 1000,
        "standard": 2000,
        "premium": 3500,
        "bdt": "৳35,000–1,20,000"
      },
      "sample": {
        "project": "pf-ad10-bazarghor",
        "brand": "BazarGhor",
        "status": "planned",
        "note": "one Bengali ad from the pack (local market)"
      },
      "aspects": [
        "9x16",
        "4x5",
        "1x1"
      ],
      "defaultDuration": 15,
      "durationRange": [
        6,
        30
      ],
      "music": "social-punch",
      "fonts": [
        "BalooDa2",
        "HindSiliguri"
      ]
    },
    {
      "code": "RET1",
      "family": "packs",
      "name": "Monthly Motion Retainer",
      "bn": "মাসিক মোশন চুক্তি",
      "what": "A set number of pieces every month (e.g. 4 feature drops + 8 social ads + 1 data story), one request queue, 48-hour turnaround on small pieces.",
      "bestFor": "SaaS marketing teams and agencies that ship constantly.",
      "price": {
        "starter": 1500,
        "standard": 3000,
        "premium": 6000,
        "bdt": "৳1,00,000–4,00,000 / month"
      }
    }
  ]
}
```

<<<<< END OF FILE: studio-catalog.json >>>>>

<<<<< FILE: studio-piece.example.json >>>>>

```json
{
  "code": "PL1",
  "name": "Product Launch Film",
  "brand": "Lumen",
  "project": "pf-pl1-lumen",
  "aspect": "16x9",
  "width": 1920,
  "height": 1080,
  "duration": 30,
  "fps": 30,
  "concept": true,
  "brief": {
    "client": "Lumen (fictional — concept work): an AI analyst that answers questions about a company's data in plain English",
    "goal": "Launch-day hero film for the landing page, Product Hunt and X: make a busy founder feel 'this ends dashboard hunting' in 30 s",
    "audience": "Founders, heads of growth and data leads at 20–500 person SaaS companies",
    "message": "Ask a question, get an answer with sources — before problems hurt",
    "cta": "Start free",
    "tone": "Keynote-calm, warm light on a dark stage, precise; one amber accent",
    "references": ["Apple product reveal films", "Linear launch video", "Vercel Ship opener"]
  },
  "sound": {
    "music": { "track": "cinematic-reveal", "from": 0, "gain": 0.5, "fadeIn": 0.2, "fadeOut": 2.2 },
    "cues": [
      { "t": 0.45, "sfx": "sparkle", "gain": 0.22 },
      { "t": 3.0, "sfx": "whoosh-cinematic", "gain": 0.36 },
      { "t": 4.35, "sfx": "whoosh-short", "gain": 0.22 },
      { "t": 6.62, "sfx": "riser", "gain": 0.26, "len": 3.4 },
      { "t": 6.62, "sfx": "impact-bass-2", "gain": 0.5, "len": 1.9 },
      { "t": 6.8, "sfx": "sparkle", "gain": 0.28 },
      { "t": 9.6, "sfx": "whoosh-cinematic", "gain": 0.4 },
      { "t": 10.98, "sfx": "click", "gain": 0.32 },
      { "t": 11.06, "sfx": "typing", "gain": 0.2, "len": 1.3 },
      { "t": 12.76, "sfx": "click", "gain": 0.4 },
      { "t": 12.98, "sfx": "pop", "gain": 0.26 },
      { "t": 13.22, "sfx": "whoosh-short", "gain": 0.16 },
      { "t": 14.18, "sfx": "ping", "gain": 0.26 },
      { "t": 14.62, "sfx": "pop", "gain": 0.22 },
      { "t": 16.05, "sfx": "impact-bass-1", "gain": 0.6, "len": 1.7 },
      { "t": 16.05, "sfx": "whoosh", "gain": 0.32 },
      { "t": 17.05, "sfx": "typing", "gain": 0.16, "len": 1.25 },
      { "t": 18.42, "sfx": "pop", "gain": 0.22 },
      { "t": 18.85, "sfx": "whoosh-short", "gain": 0.2 },
      { "t": 19.0, "sfx": "click-soft", "gain": 0.3 },
      { "t": 20.35, "sfx": "whoosh-short", "gain": 0.2 },
      { "t": 20.55, "sfx": "notification", "gain": 0.3, "len": 1.4 },
      { "t": 22.3, "sfx": "whoosh-short", "gain": 0.3 },
      { "t": 22.62, "sfx": "pop", "gain": 0.3 },
      { "t": 23.25, "sfx": "whoosh-short", "gain": 0.18 },
      { "t": 24.7, "sfx": "click-soft", "gain": 0.26 },
      { "t": 25.65, "sfx": "click-soft", "gain": 0.26 },
      { "t": 26.7, "sfx": "whoosh-cinematic", "gain": 0.34 },
      { "t": 26.82, "sfx": "impact-bass-2", "gain": 0.42, "len": 2.0 },
      { "t": 27.0, "sfx": "sparkle", "gain": 0.28 },
      { "t": 28.15, "sfx": "pop", "gain": 0.3 }
    ]
  },
  "reel": { "from": 9.0, "to": 13.5 },
  "made": "2026-11-07"
}
```

<<<<< END OF FILE: studio-piece.example.json >>>>>

<<<<< FILE: voice-script.example.txt >>>>>

```text
[excited] এই ভিডিওটা আমি নিজে এডিট করিনি।
স্ক্রিপ্ট, গ্রাফিক্স, সাউন্ড, সব Claude নিজে বানিয়েছে, আমার শেখানো কয়েকটা স্কিল দিয়ে।
[explain] স্কিল কী, এটা Claude-এর কাজ কীভাবে বদলে দেয়, আর আপনি কীভাবে ব্যবহার করবেন, পাঁচ মিনিটে সব দেখাচ্ছি।
[pause 0.5]
[story] আগে সমস্যাটা দেখি।
ধরুন, প্রতি মাসে আপনি Claude-কে দিয়ে একটা রিপোর্ট বানান।
প্রতিবার আবার বলতে হয়: কোন ফরম্যাট, কোন শিরোনাম, টাকার অঙ্ক কীভাবে লিখবে।
একদিন একটা কথা বলতে ভুলে গেলেন, ব্যস, রিপোর্ট অন্যরকম হয়ে গেল।
আর নতুন চ্যাট খুললেই আবার প্রথম থেকে শেখানো।
[pause 0.5]
[explain] স্কিল ঠিক এই সমস্যার সমাধান।
সহজ করে বললে, স্কিল হলো Claude-এর জন্য লেখা একটা ট্রেনিং খাতা।
অফিসে নতুন কেউ এলে আমরা তাকে একটা নিয়মের খাতা দিই: কাজটা কীভাবে করতে হয়, ধাপে ধাপে।
স্কিলও তাই। একবার লিখে দিলে, Claude প্রতিবার সেই নিয়মেই কাজ করে।
ভেতরে দেখতে এটা একটা ফোল্ডার। ফোল্ডারের ভেতরে মূল ফাইল একটাই: স্কিল ডট এমডি।
ফাইলের মাথায় থাকে দুটো জিনিস: একটা নাম, আর একটা বর্ণনা। স্কিলটা কী করে, আর কখন কাজে লাগবে।
তার নিচে আসল নির্দেশনা। চাইলে সাথে টেমপ্লেট, উদাহরণ, এমনকি ছোট প্রোগ্রামও রাখা যায়।
[pause 0.5]
[question] এবার আসল প্রশ্ন। সব নির্দেশনা চ্যাটে একবারে পেস্ট করে দিলেই তো হয়, স্কিল কেন লাগবে?
[explain] কারণটা হলো Claude-এর মনে রাখার জায়গা। একে বলে context window।
এটা একটা টেবিলের মতো। যত কাগজ রাখবেন, টেবিল তত ভরবে, আর দরকারি কথা হারিয়ে যাওয়ার ভয় তত বাড়বে।
স্কিল এখানে খুব বুদ্ধি করে কাজ করে, তিন ধাপে।
প্রথম ধাপ: শুরুতে Claude শুধু প্রতিটা স্কিলের নাম আর বর্ণনা পড়ে রাখে। একেকটায় মাত্র একশো টোকেনের মতো, মানে কয়েক লাইন। ঠিক যেন তাকে সাজানো বইয়ের নাম।
দ্বিতীয় ধাপ: আপনার কথা যে স্কিলের বর্ণনার সাথে মেলে, শুধু সেই বইটা খোলে। পুরো নির্দেশনা তখনই পড়ে।
তৃতীয় ধাপ: বাড়তি ফাইল বা প্রোগ্রাম লাগলে, তখনই খোলে। প্রোগ্রাম চালালে শুধু ফলাফলটা টেবিলে আসে।
এর মানে, অনেকগুলো স্কিল রাখলেও টেবিল প্রায় ফাঁকা থাকে।
[emphatic] আর তাই কাজ হয় একই মানের, প্রতিবার। কম ভুল, কম বারবার বলা, আর কয়েকটা স্কিল মিলিয়ে বড় কাজও।
এটাই স্কিল ব্যবহারের মূল কারণ: Claude-কে একবার শেখান, সে প্রতিবার ঠিক জায়গায় সেটা কাজে লাগাবে।
[pause 0.5]
[happy] শুরু করতে নিজের স্কিল বানানোরও দরকার নেই।
Anthropic নিজেই কিছু স্কিল দিয়ে রেখেছে: Word, Excel, PowerPoint আর PDF ফাইল বানানোর।
শুধু লিখুন: মাসের হিসাব নিয়ে পাঁচ স্লাইডের একটা PowerPoint বানাও। Claude আসল ফাইল বানিয়ে দেবে, ডাউনলোড করে খুলতে পারবেন।
[pause 0.5]
[explain] চালু করবেন কীভাবে? খুব সহজ।
Claude-এ Settings খুলুন, তারপর Capabilities। সেখানে Code execution and file creation চালু করুন। নতুন ডিজাইনে এর নাম Create and edit files।
তারপর Customize-এ গিয়ে Skills খুলুন। যে স্কিল লাগবে, পাশের সুইচটা অন করুন।
Claude-এর সাহায্য পাতা বলছে, ফ্রি প্ল্যানেও স্কিল আছে। শুধু মেনুর নাম অ্যাপভেদে একটু আলাদা হতে পারে।
[pause 0.5]
[explain] এবার নিজের স্কিল।
সবচেয়ে সহজ পথ: Claude-কেই বলুন, skill-creator দিয়ে আমার জন্য একটা স্কিল বানাও। তারপর কাজটা নিজের ভাষায় বুঝিয়ে বলুন। Claude প্রশ্ন করে করে স্কিলটা লিখে দেবে।
নিজে বানাতে চাইলে: ফোল্ডারে স্কিল ডট এমডি রাখুন, ফোল্ডারটা জিপ করুন। তারপর Skills পাতায় প্লাস চাপুন, Create skill, তারপর Upload a skill।
[serious] একটা জিনিস মনে রাখবেন: জিপের ভেতরে শুধু ফাইল নয়, পুরো ফোল্ডারটা থাকতে হবে।
আর বর্ণনাটা পরিষ্কার করে লিখুন। কারণ Claude ওই বর্ণনা পড়েই ঠিক করে, কখন স্কিলটা খুলবে।
[pause 0.5]
[happy] কী কী কাজে স্কিল বানাতে পারেন?
শিক্ষক হলে নিজের ফরম্যাটে প্রশ্নপত্র। দোকান থাকলে ক্যাশমেমো আর দামের তালিকা। অফিসে মাসিক রিপোর্ট। আর পেজ চালালে নিজের ধাঁচে পোস্ট লেখা।
যে কাজ আপনি বারবার একইভাবে করেন, সেটাকেই স্কিল বানিয়ে ফেলুন।
[pause 0.5]
[calm] Claude Code ব্যবহার করলে স্কিল থাকে প্রজেক্টের skills ফোল্ডারে, আর স্ল্যাশ দিয়ে নাম লিখলেই সরাসরি চলে।
এই ভিডিওটাও এভাবেই বানানো: ভয়েস, রিলস, পোস্টের লেখা, প্রতিটার জন্য আলাদা স্কিল।
[serious] শুধু একটা সাবধানতা: স্কিল প্রোগ্রাম চালাতে পারে। তাই অচেনা জায়গা থেকে স্কিল বসানোর আগে ভেতরটা দেখে নিন।
[cta] নিজের প্রথম স্কিল বানানোর একটা বাংলা টেমপ্লেট ফ্রিতে পেতে, আমার পেজের ইনবক্সে লিখুন SKILL। আমি নিজে পাঠিয়ে দেব।
```

<<<<< END OF FILE: voice-script.example.txt >>>>>
