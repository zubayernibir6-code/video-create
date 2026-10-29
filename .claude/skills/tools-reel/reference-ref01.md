# Reference ref-01: measured breakdown (2026-10-29)

Files: `assets/refs/ref-01.mp4` + `ref-01.analysis.md` (numbers), `ref-01-sheet.png` (a frame every 2 s),
`ref-01-spectrogram.png`, `ref-01.words.json` / `.srt` / `.txt` (turbo ASR, word times), and
`ref-01-frames/f_<seconds>.png`: 16 full-size frames (3.0 hook, 5.5 REA card, 8.5, 12.0, 16.5, 20.5, 23.5, 27.0, 31.0,
36.5, 40.5, 44.2 flash, 47.5, 51.5, 55.0, 57.8 CTA). Look at them before drawing a scene. Re-measure any new
reference with `node tools/ref-analyze.mjs <video> --name=ref-02 --asr=en`.

It is another creator's Reel (its CTA card shows their handle); the user chose it as "this level of video".
Take its GRAMMAR and its quality bar. Never take its words, its handle, its demo-app names ("Notly", "vibely"),
its demo numbers as facts, or the orange pixel crab (that is Claude Code's mascot; the user's ads must show no
Claude logo, LESSONS 2026-10-26).

## 1. The file

720×1280 · 30 fps · 58.5 s · h264 + HE-AAC 48 kHz stereo (a platform re-encode, so softer than a master).
−14.2 LUFS integrated, LRA 1.8 LU (almost no dynamics), true peak −1.0 dBFS. Ours: 1080×1920, 30 fps, −14 LUFS,
true peak ≤ −1.5 (finish.mjs does the loudness pass).

## 2. Voice

English, male range (f0 median ≈ 130 Hz), confident and FAST: 206 words in 57.5 s = **3.58 words/s ≈ 215 wpm**
(plain narration is ~2.5 words/s). 26 caption lines. Second person, verb-first, no filler, no hype words.
Gaps between tool blocks are 0.2–0.6 s. The script grammar is in SKILL.md §4.

## 3. Music and sound

- Bed: dark electronic, ≈ 123–129 BPM (beat tracker: 129 on the percussive part, 123 on the whole mix; call it 128),
  minor key (B or A minor, low confidence), strong sub-bass the whole way (bottom of the spectrogram is solid),
  no vocals. Level per second stays at −15…−20 dB RMS: a loud, dense, compressed mix.
- Bass hits (s): 0.07, 6.08, 12.28, 18.88, 21.52, 23.85, 29.28, 32.88, 38.75, 41.63, 42.82, 44.0, 54.4, 57.03.
  Bright hits (whoosh/sparkle): 0.35, 2.58, 8.17, 11.77, 13.72, 15.53, 20.27, 23.24, 32.88, 38.75, 44.12, 49.3, 51.5, 53.24.
  So a sound lands about every 2–3 s: impacts on tool cards and result chips, whooshes on moves.
- **Hit-stops:** the whole mix drops below −40 dB for 0.2–0.5 s at 25.87, 33.63, 38.13 and 48.84 (right after a tool's
  name line, or just before the next tool), then the next beat hits harder. Plus a 0.56 s silent tail.
- A tonal "ding" pair near 57.0–57.5 s closes the CTA (sent / followed).

## 4. Beat sheet (VO from words.json; what happens on screen, read from frames and tiles)

| t (s) | VO | On screen |
| --- | --- | --- |
| 0.0–3.6 | "Don't start vibe coding with Claude code unless you've installed these five tools." | red banner "Don't start · 0 of 5 tools installed"; panel "Tools · Installing 5" with five progress bars in the five tool colours (names blurred: a teaser; 33/42/24/17/30 %); terminal shows `claude` + "resolving 5 tools in parallel…"; mascot peeks over the terminal |
| 3.8–5.0 | "The first is REA." | tool identity card slams in (name blur-in, cyan); terminal types `npx rea-agents setup` → ✓ `rea · MCP server registered` |
| 5.1–9.8 | "It lets Claude open any app, website, or APK and trace every feature down to the code," | phone mock + red laser from the mascot (≈ 6.1 s); three input chips APP / SITE / APK pop in (≈ 8.2); feature rows Login / Search / Feed / Pay at "0 functions ?" + chip "24 features traced" + a SOURCE code panel |
| 9.8–13.7 | "so the moment you wonder how something works, it shows you the proof, and you never have to guess." | wavy red lines connect each feature to its source line, counters climb (9 / 14 / 17 / 7 functions), chip "47 features traced" (≈ 12), then "47 features · 0 guesses" (≈ 14) |
| 14.1–15.5 | "The second is Agent Reach." | identity card (amber) |
| 15.7–19.1 | "It lets Claude read Reddit, X, YouTube, and GitHub with zero API fees," | hub-and-spoke map: mascot in the middle, four platform nodes joined by glowing curves (each in its brand colour), chip "API fees $0.00" (≈ 18.9) |
| 19.1–24.6 | "which shows you exactly what users hate before you write a line, install it, and build what they want." | red chip "11,977 complaints" (≈ 21.5) → app-store review card of a fictional app, 4.8★ → 2.3★ with three complaints (≈ 23.9) → "building…" progress |
| 24.8–25.8 | "The third is Replica." | identity card (purple) "Replica · 11 skills" |
| 25.8–32.0 | "It gives Claude 11 skills that scan the app, plan it, build it, and test it," | skill chips (recon, architect, design, build, backend, test, diff, …) light up one by one in their own colours; pill "11 skills"; four mascot workers around a phone app, panels ARCHITECTURE and TESTS, blank page turning into the app (≈ 29.3) |
| 32.0–33.5 | "so you never start from a blank page. One app, start to finish." | finished app, a flag planted (≈ 32.9: bass + bright hit together) |
| 33.6–33.9 | (none) | **hit-stop** |
| 33.9–37.9 | "The fourth is Context 7, from Upstash, with over 60,000 stars." | identity card (green) "Context7 · Up-to-date docs for AI agents · from Upstash"; "64k ★" (≈ 37–38.7) |
| 38.1–38.6 | (none) | **hit-stop** |
| 38.5–43.7 | "It pulls the current docs for any library you use, so Claude stops writing code that broke two versions ago." | doc sheets fly from library icons (React, Supabase, Tailwind) into a wizard-hat mascot; panel `app.tsx` with a "N deprecated" badge and four old-API lines; the fix lands with a white flash + lightning bolt (≈ 44.0, the only full-frame flash) |
| 43.9–45.1 | "Fresh docs, every time." | badge turns green "0 deprecated" |
| 45.3–48.7 | "And the fifth is Chrome DevTools MCP, from the Chrome team at Google." | identity card (pink) with the Chrome mark, "54k ★ · Apache-2.0"; synthwave neon floor |
| 48.9–53.4 | "It lets Claude open your app in a real browser, so it sees the red errors and fixes them itself." | browser mock (localhost:3000; Elements / Console / Network), "1 errors", quality dial 62 (red); knight mascot with a sword slashes the errors; dial → 100 (green) |
| 53.4–57.5 | "It tests itself. Comment TOOLS, and I'll send you one link with all five." | comment box types TOOLS → send arrow → a DM card "All 5 tools in one link:" with five chips in the five colours → button "Follow for more" → "Following" (≈ 57.0 ding) |
| 57.5–58.5 | (none) | hold, tail silence |

Per tool block (≈ 9–11 s, 34–40 words): **identity card 1.2–2 s → mechanism 4–5 s → proof/result 3–4 s**, one
colour per tool across card, stage light, terminal check and CTA chip. About 35 visible changes in 58 s.

## 5. Design (colours sampled from the frames; 720p px, ×1.5 for 1080p)

| Role | Value |
| --- | --- |
| background | `#07080F` with a faint dot grid and soft vignette |
| panel / row | `#0D121D` / `#121726`, 1 px dim border, radius ≈ 14 px (≈ 21 at 1080) |
| terminal body / header / status bar | `#090D13` / `#131921` / `#0C121A`, traffic-light dots in the header |
| danger | `#F65B6D` on a `#281315` banner |
| tool colours (1…5) | cyan `#20D2E9`, amber `#F9AD26`, purple `#B683FB`, green `#30D28E`, pink `#EE71B4` |
| mascot body | `#CA6A4C` (orange pixel sprite, props change per scene: laser, hat + staff, hammer, flag, helmet + sword) |
| success / terminal ✓ | the green above; prompt chevron blue |

- Layout: captions at y ≈ 15 % (baseline 197 of 1280), stage y 235–720, terminal y 770–950 (60–74 %). Content spans
  x 40–592, i.e. shifted LEFT with a 128 px right margin: room for the Reels button rail. The bottom 26 % is empty.
- Captions: rolling window of 3 words, heavy grotesque ≈ 34 px; the word being said is white, earlier words grey, the
  next one blurs in. Key words (tool name, a claim, "five.") get an outlined box in the tool colour with four corner
  dots (like a text selection). Words are the spoken words, 100 % of them.
- Terminal ("claude — ~/vibely"): 3–4 visible lines in a typewriter face, old lines fade; `❯ <command>` then
  `✓ <result>` per tool; status bar "context 100%" + bar + ">> accept edits on". The terminal never goes away: it is
  the progress tracker that makes "install these 5" literal.
- Stage light changes per tool: spotlight beams + a horizon line in the tool colour (tool 5: a pink neon grid floor, the CTA: blue).
- Text sizes at 720p: captions 34, card names 36, chips 13–15, source/code microtext 9–10 (decoration only).
  STYLE.md needs ≥ 28 px at 1080p for anything read, so our scenes must be simpler and bigger than this.

## 6. What we do better (the minimum, not the target)

1080×1920 not 720p; everything readable ≥ 28 px (kickers ≥ 24); safe zones kept (top 14 %, bottom 35 %, right
rail); the terminal inside the safe area; camera moves end at scale 1; real, sourced numbers only; one clean
caption source (the script's spelling with the voice's timing); hit-stops on purpose; design-lint + contact
sheets at 0.5 s before delivery; 9:16 master + 1:1; −14 LUFS with true peak ≤ −1.5.
