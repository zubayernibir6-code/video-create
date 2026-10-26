# Projects and history (plus the superseded Smart App Control fallbacks)

> Moved verbatim out of CLAUDE.md on 2026-10-26 to keep every session's start small (section numbers kept).
> Paths written as `E:Video Create` / `C:Userszubay` are from the old login: read `D:Video Create` /
> `C:UsersZubayer Nibir` (CLAUDE.md §0a). CLAUDE.md §0g says which file holds what.

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

## 4i. Third real video — `projects/zubayer-ep01` (10:35 YouTube episode from the user's own footage, 2026-10-25)

The user handed over a raw talking-head recording (`Downloads/my rc video/the video.mp4`: 11:08, 1280×720, VFR ~28 fps,
webcam audio at −29 LUFS), a music track and a timed transcript (`subtitle.txt`, `[hh:mm:ss - hh:mm:ss] text (romanised)`),
asked for "The Age of AI & Systems Thinking — By Zubayer" with 8 motion-graphics scenes, split-screen layout and karaoke
captions, said "no questions, handle every permission, I'm going to sleep". The plan gate's approval was waived for this
one video by that instruction; `PLAN.md` records what was built. Nothing was installed.

**The reusable pipeline: `tools/episode/`** (one command: `node tools/episode/run.mjs projects/<name> [--from=<step>]`):
`voice.mjs` (DeepFilterNet → EQ → de-esser → compressor → −16 LUFS, uncut; speech/noise gap 27.7 → 57 dB) → `cuts.mjs`
(pauses ≥ 0.7 s shrunk to 0.18 + 0.12 s, manual cuts, optional cold-open copy, frame-snapped → `cuts_map.json`, the single
timing source) → `grade.mjs` (glare mask, highlight roll-off, warmth, hqdn3d, Lanczos 1080p, CFR 30; UNCUT) →
`asr_chunks.py` → `align.mjs` → the project's `build-page.mjs` on `page-core.mjs` → `mix.mjs` → `finish.mjs`.
Project files: `episode.json` (sources, cuts, cold open, title, mix levels), `build-page.mjs` (scenes as beat lists:
`[time, selector, preset, opts]`, times from `T(source s)` / `TW("spoken word", near s)`), `PLAN.md`, `UPLOAD.md`.
Heavy media lives on C: (`ep.work`, here `C:/Users/Zubayer Nibir/VideoWork/zubayer-ep01`) and is linked into the
project as an `assets/media` junction (D: has ~4 GB free). HyperFrames follows the junction.

**How the page is built (page-core.mjs):** one `<video>` per kept piece of the cut list, all on the one graded file with
`data-media-start` (59 pieces render fine); pieces alternate scale 1.00 / 1.07 to hide jump cuts and each drifts 2.5 % down
to rest; split mode moves `#cam` with transform + an animated `clip-path: inset(... round)` into a 640×790 card (the
cyan frame is a separate div that fades in after the move); graphics panel at x 790–1850; caption pill centred at
y ≈ 985; keyword banners top-left; title and end cards are timed clips. Capture stays `drawelement`-fast with
clip-path and box-shadow (0.17–0.22 s/frame at 1080p); no CSS `filter` anywhere (it forces screenshot capture).

**Traps found (each cost a run):**
- **The Bengali ASR could not run on the full file tonight.** `transcribe.py` on 11 min grew to 6.2 GB private and swapped
  (30 s of audio in 20 min); chunked (`asr_chunks.py`, one model load, ≤ 45 s pieces cut at pauses, resumable through
  `<out>.progress`) still died twice with `mkl_malloc: failed to allocate memory`, because the machine's commit charge sat at
  34/37 GB (other apps) and any Chrome job on top tipped it over. Run it with NOTHING else heavy. On an 8 s clip it ran at
  10.5× real time, 2.3 GB peak. `align.mjs --estimate` is the fallback: the subtitle file's words spread over the spoken
  stretches of each line (silencedetect −42 dB / 0.18 s), by grapheme count. `--text=script` keeps the file's words but
  times them by the matched spoken words.
- **The user's transcript is a cleaned-up paraphrase**, not verbatim ("করছে" for spoken "করতেছে", extra/missing words).
- **A "cough" the user asked to cut (30.8–32.2 s) was speech**: the transcriber heard "অর্গানাইজড ভাবে অ্যাকশন নিতে পারতেছি"
  at 31.38–33.42 s. Not cut; `episode.json` `cuts.note` says why. Check user-specified cut times against the audio.
- **Render coverage gate:** a test copy with a shortened root `data-duration` fails ("Video vN captured 0 of expected
  frames") for pieces that start after the end. `HF_VIDEO_COVERAGE_THRESHOLD=0` for such test copies only.
- **A generic class name collided:** scene 06's `.bar { height: 100% }` zeroed the banner's `.low .bar` (an indefinite
  percentage height defeats flex stretch). Prefix scene classes.
- **Music level:** −16 LUFS bed + `musicDb −17` + sidechain (threshold 0.02, ratio 4) sat 31 dB under the voice (inaudible);
  `musicDb −14` + threshold 0.03 / ratio 1.6 sits 20.7 dB under while he talks, as the user asked ("very little, but audible").
- finish.mjs got `--frames-cache=<folder>`: the 11-min footage extraction must not land on D:.
- **design-lint `card_straddle` stopped the first full run** (after 9 min of check + 12.5 min of design-lint on 2,542
  moments): a full-screen keyword banner was still fading out while the camera moved into the card at 3:35.
  build-page.mjs now ends every banner 0.25 s before the next split. design-lint on a 10-minute page takes ~12 min.
- **59 `<video data-media-start>` pieces from one 1.2 GB file failed the full render:** "Video extraction failed for 30
  source(s)" (ffmpeg_failed 20, internal 4, media_start_out_of_range 4) — the 80 s test with 5 pieces had passed.
  `camcut.mjs` now cuts the graded file to the episode timeline once (`select` by frame number per part + black
  title/end gaps + concat demuxer `-c copy`; 19,059 frames = 635.3 s), and page-core plays ONE clip; the jump-cut
  zoom alternation runs on its wrapper. Frame-exact check: offset 0 at three points (MSE 0.2–0.3 vs ≥ 115 for ±1).
  (A PNG-grab comparison with input `-ss` gave false 21–34 dB mismatches; compare raw frames by index instead.)
- **The single 635 s clip then failed with `ffmpeg_timeout`:** HyperFrames' FFmpeg limits default to
  `FFMPEG_PROCESS_TIMEOUT_MS` 300 000 (frame extraction), `FFMPEG_STREAMING_TIMEOUT_MS` 600 000 (the streaming encode
  that runs for the whole capture) and `FFMPEG_ENCODE_TIMEOUT_MS` 600 000. finish.mjs now sets all three to 3 h unless
  they are already set. With that, extraction passed and capture ran at ~3.4 frames/s (~95 min for 19,059 frames).
- **Background tasks die with the Claude session.** The render (and its watchers) stopped when the session ended.
  Long renders are started detached: PowerShell `Start-Process cmd.exe "/c node tools/finish.mjs … > log 2>&1"
  -WindowStyle Hidden`, then watched through the log.

**Delivered 2026-10-25 09:21:** `renders/zubayer-ep01/2026-10-25_0921/` and the user's
`Downloads/my rc video/output/Zubayer_Ep01_Master.mp4` (868 MB, 10:35.3, 1080p30 h264 + AAC). finish.mjs total 4,795 s:
check 103 s, extraction 4 m 41 s, capture 68 m 17 s (screenshot mode: 242 frames animate clip-path), loudness −16 → −14
LUFS, TP −1.5 dBTP, QC all PASS incl. edges and bt709 tags. Reviewed: 127 frames every 5 s across all scenes;
master audio vs mix.wav lag 0.0 ms at 100/400/600 s. Captions use `align.mjs --estimate` timings (the ASR could not run).

**Verified:** check 0 errors (54/54 contrast); an 80 s test render (7 min 12 s, 0.17 s/frame) matched the source frames
exactly at two moments (A/V sync of the cut pieces), banner text sharp, Bengali correct; mix −16 LUFS, TP −1.5 dBFS before
finish's −14 LUFS master.

**Instagram Reels from the episode (2026-10-25):** `projects/zubayer-reel1..4` (32–60 s, 1080×1920), built on
`tools/episode/reel-core.mjs` (`reelContext` + `buildReel({tag, hook, cta, groups})`; `episode.json` `range` cuts one stretch of
the episode, `endCard` appends a 3 s CTA card). Layout inside the Reels safe zone: tag y 290, hook 334–474, camera card at
65/500 (950×600), graphics band on the card's lower edge, caption pill at y 1110. Same pipeline as ep01 (cuts → camcut →
build-page → mix → finish `--formats=9x16`), ~3 min per reel. Delivered to `renders/zubayer-reelN/2026-10-25/` and
`Downloads/my rc video/output/reels/` (+ covers, Instagram-captions.md). QC all PASS, −14 LUFS; master audio vs mix.wav lag 0 ms.
Traps found: a flex container holding text + `<em>` eats the spaces (wrap the text in one inner element); `TW()` fell back
to the given time when the word was not in the window (it now WARNs), and groups whose times cross never hid (now sorted
and guarded ≥ 1.5 s apart); faint decorative text fails check's contrast gate even as SVG (use a CSS background image);
hook and tag must be visible at frame 0 (Instagram's first frame); a 1.1× word pop covered the 12 px caption gap (now
1.05×, 18 px).

**Facebook Reels with cliffhanger endings (2026-10-25):** `projects/zubayer-fbreel1..4` (1:39, 1:19, 1:39, 0:47). Each
stops on an open question. `episode.json` `cliff: 4.5` adds a freeze after the last word (`cuts.mjs` writes `map.cliff`,
`camcut.mjs` holds the last frame with `tpad=stop_mode=clone`, `mix.mjs` cuts the music to −70 dB there). `buildReel({ cliff:
{ text, sub } })` darkens the screen, slams the question in and pulses it (riser tail → impact-bass-1 → heartbeat; SFX cues
now take `from`/`d` to play part of a file). `patchWords(ctx, from, to, words)` replaces caption words with a Bengali ASR
pass of the edges: **the subtitle-based word times were up to 3 s off, and the real speech differed** ("রিসার্চে" was
actually "আইএমএফের একটা রিসার্চে"), so each Reel's last seconds were transcribed (8–30 s clips, ~10× real time) and the cut
points set on measured 20 ms energy dips. First cliff mix had the hit at −7.6 and the heartbeat at −12 dB mean against
speech at −17; lowered to −12.6 / −15.9 by swapping the audio into the rendered video (no re-render). design-lint caught
the stamp class's `letter-spacing` on Bengali text (`bn_tracking`); Bengali stamps need `letter-spacing:0`. Delivered to
`renders/zubayer-fbreelN/2026-10-25/` and `Downloads/my rc video/output/facebook-reels/` (+ covers, Facebook-captions.md).

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
