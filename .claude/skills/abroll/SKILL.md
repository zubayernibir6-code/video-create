---
name: abroll
description: Turn the user's talking-head recording into a 16:9 video where each section is shown in one of five named A-roll + B-roll styles - AB1 Glass Split (speaker in a glass frame + B-roll window), AB2 Bubble Cut (full-screen B-roll, speaker in a voice-reactive bubble), AB3 Punch Type (big kinetic captions, punch-in zooms, icon stickers), AB4 Card Fan (list items fan out as cards), AB5 Data Stage (speaker blurred back, numbers count up as bars) - in the D:\Video Create workspace, using tools/abroll. Use when he names AB1-AB5, asks for B-roll, side B-roll, split screen, "picture in picture", "video in a frame", or tools/route.mjs reports shape S4 (talking head). Whole long episodes with cards -> episode-edit (EP1); screen recordings -> screen-tutorial / screen-promo.
---

# A-roll + B-roll styles (built 2026-10-30, demo: projects/abroll-variants-demo)

The look and every rule live in the engine **`tools/abroll/`** (build.mjs + page.mjs). A project holds **only data**:
`projects/<name>/abroll.json`. His guide to the names is `VARIANTS.md`; the machine list is `tools/variants.json`.
CLAUDE.md rules apply (Bengali, plan gate §0e, craft §0d, whole-video §0h, five elements §0i).

## 1. Look at the material (উৎস)

- `node tools/route.mjs <his folder>`. It reports per file camera / screen / graphics stretches and speech or music.
  S4 = talking head. B-roll clips show as "camera, no speech".
- A clean voice: an existing master (an episode's `voice_master.wav`), or `node tools/voice.mjs` on his recording.
  The voice file must be in the recording's own time (same length), because sections are cut from both at the same seconds.
- Words: `node tools/transcribe.mjs <voice or a window of it> --lang=bn`. The Bengali model runs at about 13× the clip's
  length on this CPU, so 1 min of voice takes ~13 min, and longer when another session is transcribing at the same time.
  For a long talk, transcribe only the windows you will use: cut them with ffmpeg and list them in `aroll.words` as `[{file, offset}]`.
  Trap (2026-10-30): an episode's full `words.json` was off by up to 1 s at sentence joins. Words overlapped, and
  "যায়।" and "কিন্তু" got the same time. Re-transcribe the windows instead of trusting it for cut points.
- Run one transcription at a time. Each takes ~2 GB of RAM, and other sessions may be transcribing too: check the
  `python` processes first. On 2026-10-30 a third run at once died with `mkl_malloc: failed to allocate memory`.
- Start each window 2–3 s before the first word you need. On 2026-10-30 the speech in the first ~3 s of a window
  came back with no words. Word starts can also be up to ~0.5 s early at phrase starts; captions tolerate that,
  cut points do not.
- Captions are what he SAYS (the transcript). Fix the transcriber's mistakes and add ? / । in `aroll.fix` or a
  section's `fix` (e.g. `"এয়ারি": "এআই"`, `"এজিআই": "AGI"`, `"পাওয়ার ফুল": "পাওয়ারফুল"`, `"হবে#1": "হবে?"`).
  A cleaned script (his subtitle file) is NOT safe for word timings: its word order can differ from the speech.
- Check every on-screen number and source against what he says. In the demo he said "IMF research" for figures
  that come from the WEF Future of Jobs Report 2025. Show the true source and ask him.
- Cut points: measure the pauses (20 ms RMS below −42 dB for ≥ 160 ms) and put every section's `from`/`to` inside one.
  Never cut on a word time alone.

## 2. Pick the style per section

| Style | Use it when he… | Needs |
| --- | --- | --- |
| AB3 Punch Type | asks questions, makes a bold claim, opens with a hook | key words (`punch`: at / icon / text / strike) |
| AB1 Glass Split | explains one idea that a picture or a small animation shows | `window`: a clip (`video`) or the generated `steps` scene (start word, goal word) |
| AB4 Card Fan | lists 2–4 things ("company, technology, AI") | `cards` (label, at, `scene` skyline / neural / temple or `video`), optional `then` card and `heading` |
| AB5 Data Stage | says numbers | `bars` (value, unit, label, color red / green, at), `year`, `source` (a real source, or ask him) |
| AB2 Bubble Cut | tells a story or paints the future, and a strong clip exists | `broll: [{ video, speed }]`, optional `slam` (a giant word on its word) |

A section is 8–20 s. Do not run the same style twice in a row. Every number or claim on screen needs his words or a source.

## 2b. abroll.json, every field (the example is `.claude/skills/abroll/abroll.example.json`)

- Top level:
  - `title`.
  - `fps`: 30.
  - `badges`: true shows the style name chip, which is good for a demo. Use false for client videos.
  - `tighten`: default 0.4. Pauses longer than this are cut inside every section, keeping 0.15 s of breath on each
    side. A pause at a section's very start or end is cut whole. Use 0 to switch it off.
  - `pause_db`: default −42.
- `aroll`:
  - `video`: the recording.
  - `voice`: the clean voice, in the same time base as the recording.
  - `words`: `[{file, offset}]`. A later file replaces earlier ones over its own span.
  - `face`: `[x%, y%]`, where the face sits in the frame. The portrait frame, the bubble and the punch zoom all centre on it.
  - `fix`: caption fixes for every section.
  - `voice_eq`: false. The master voice is already EQ'd.
- `music`: `{ file, under_db: -24, up_db: -15, from }`.
- `intro`: `{ dur, video, from, speed, kicker, title, sub }`. Leave `dur` out for no intro.
- `outro`: `{ dur ≤ 3, title }`. It lists the styles used, in code order.
- `sections[]`: `{ variant, from, to, fix, …style fields }`.
  - `from`/`to` are source seconds, measured with the pauses step.
  - A section is 8–20 s AFTER pause cutting. `check` prints the final length.
- Times inside a section can be either:
  - a source-second number, or
  - a word he says: `"কোম্পানি"`, or `"১৭#2"` for its 2nd time. Words joined by a dash are searched part by part.
- `fix` values:
  - `"এয়ারি": "এআই"`
  - `"পাওয়ার ফুল": "পাওয়ারফুল"` (two words become one)
  - `"হবে#2": "হবে?"`
  - `"আইএমএফের": { "start": 216.36, "end": 217.45 }`. This retimes a word that the transcriber put in a pause.
    Find the real span with the pauses step: speech is the gap between two pauses.
- Style fields:
  - `AB1 window`: `{ title, start, goal, low, high }` for the generated steps scene, or `{ title, video }` for a clip.
  - `AB2 broll`: `[{ video, speed, from }]`, plus `slam`: `{ text, sub, at }`.
  - `AB3 punch`: `[{ at, icon, text, strike }]`.
    - `strike: true` draws a red line through that option when the NEXT punch arrives. Use it for "this, or that?".
    - Stickers fill 4 slots: top-left, top-right, middle-left, middle-right.
  - `AB4`:
    - `heading`: `{ text, at }`.
    - `then`: `{ scene, label, at, out }`.
    - `cards`: `[{ label, at, scene | video, from }]`. 3 cards fit the fan.
  - `AB5`:
    - `year`: `{ text, at }`.
    - `bars`: `[{ value, unit, label, color: red | green, at }]`.
    - `source`.
- Icons: star, sword, shelter, none, bolt, down, up, sparkles.
- Scenes: temple, skyline, neural, and `icon:<icon>` (a big icon on a dark gradient, for a word with no picture,
  like "কিছুই না").

Commands:
- `node tools/abroll/build.mjs projects/<name> pauses <from> <to>` prints the voice's pauses. Speech lies between them;
  "(cut)" marks pauses that will be shortened. Use it for every cut point and every retime.
- `check` prints one line per section: source → final, the final length, the number of pieces, the seconds cut, and
  the first … last caption words. It warns on:
  - a kept sliver under 0.2 s (a `from`/`to` that is not in a pause's middle),
  - more than 1 s with no caption at a section's start or end.

## 3. Plan gate (§0e)

`node tools/abroll/build.mjs projects/<name> plan --force` writes PLAN.md from the data. It contains:
- the shot table, from the page's own beats, cut again at caption changes so no shot sits still for long;
- the script, with each line's measured start;
- the sounds;
- the STYLE / LESSONS rules applied.

Run `node tools/plan-check.mjs projects/<name>` and show him in Bengali. Wait for his OK.
Expected WARNs:
- shots of 3–4.6 s where one long caption stays up (the 2–3 s rule is STYLE's rule for Reels);
- music "not in assets/music" when he supplied the BGM himself.

## 4. Build

Start with `node tools/new-video.mjs <name> --kind=abroll`. It copies `abroll.example.json`, the demo's data, to rewrite.

- `node tools/abroll/build.mjs projects/<name> check` after every data edit. It checks: files exist, every anchor word
  is said inside its section (a dash-joined word is searched part by part), sounds exist, and that the page builds.
- `node tools/abroll/build.mjs projects/<name>` runs everything: check, media, voice, page, mix.
  - media: A-roll clips per section at 30 fps 1920×1080, blurred copies for AB5, B-roll cover-cropped and slowed.
  - voice: the sections' voice back to back.
  - page: index.html and build/cues.json.
  - mix: voice, music ducked to −24 dB under the voice, and the SFX.
- After a text or time change: `… build.mjs projects/<name> page mix`.
- Over 60 s: run `node tools/preflight.mjs projects/<name>` and read its sheets. Then `node tools/finish.mjs projects/<name> --quality=high`, started detached.
  After the render: `node tools/contact-sheet.mjs <render> --every=0.5`, and check every section's held frames.

## 5. Rules the engine already keeps (keep them when adding a style)

- **Camera moves end at 1×.** The punch-in, the B-roll push and the section settle all end there.
- **Seek-safe timeline.** Every tween is a fromTo with both ends, or a set at 0. Elements are hidden in CSS before their entrance.
- **One onUpdate does the per-frame work** from data arrays: captions, the AB2 voice ring (from speech.wav, so run voice before page), and the AB5 count-ups.
- **Bengali text:** no letter-spacing, and every font name is quoted. Icons are SVG paths, never ✓ or arrow characters.
- **Every `<video>` has an id.** The renderer finds media by id. Without one, the card clip would have rendered
  FROZEN. `hyperframes check` caught it on 2026-10-30; preflight's stills did not. `page.mjs` now refuses a video
  without an id.
- **Baloo Da 2's line box is huge** (§0d.12), and `content_overlap` measures it. The intro kicker and the AGI slam
  overlapped until their gaps were widened. Keep ≥ 0.5 em clear above and below any Baloo text over 100 px.
- **Moves use transforms (x / y / scale), not left / top.** The renderer's StaticGuard flags layout properties
  because they snap to whole pixels and stutter. Width and height may change only on the glide into the frame or bubble.
- **A new style** becomes a new function in `page.mjs` V, plus a line in `tools/variants.json` and in VARIANTS.md, with its proof.

## 6. B-roll sources (see docs/ai-video-generation.md)

- His own clips.
- The generated scenes: steps, temple, skyline, neural, bars, the morphing blob.
- Pexels / Pixabay clips via `tools/stock-fetch.mjs --type=video`. This needs his free key in `.env.local`.
- Paid AI clips only with his OK. This laptop cannot run ComfyUI / Wan.
- Openverse (keyless photos) timed out on 2026-10-30. Retry it, but do not depend on it.
