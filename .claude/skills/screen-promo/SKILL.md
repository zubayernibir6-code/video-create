---
name: screen-promo
description: Turn a screen recording of an app (plus a voiceover and music) into a polished SaaS / AI-tool commercial in the D:\Video Create workspace — trim the OBS screens, zoom and pan onto UI moments, a glow that follows the cursor, vignette, 3D tilt, a slow push onto typed text with key sounds, a click shockwave + white flash, and a dark-gold kinetic end card with a CTA, the music's bass drop on the click. Use when the user brings a screen recording and asks for a promo, ad or commercial with zooms or effects. Plain cutting/captioning of own footage is zero-cost-video-editor; videos with no recording are hyperframes.
---

# Screen-recording commercial (learned on the Claude 5X ad, 2026-10-25)

Reference build: `projects/claude-decision-ad` (PLAN.md, `build/timeline.mjs`, `build/build-page.mjs`,
`build/mix.mjs`). **Copy that project's `build/` as the starting point**; change only the times, views and text.
CLAUDE.md is the authority (Bengali to the user, plan gate §0e, craft rules §0d); this skill is the fast path.

## 1. Measure before planning (the user's timestamps are usually off)

The brief for the first ad said OBS ends at 0:01 (it ended at 1.48 s), the click at 1:21 (1:20.617), Settings at
0:17 (0:22). Measure everything first; all of this runs in ~3 minutes:

| What | Command |
| --- | --- |
| Look at it | `node tools/contact-sheet.mjs <video> --every=1 --cols=4` |
| When the screen changes (menus, pages, clicks ≈ 1 frame earlier) | `node tools/screen/watch.mjs <video> --threshold=0.35` |
| A region's change (OBS gone, button → spinner = the click) | `node tools/screen/watch.mjs <video> --box=x,y,w,h --from= --to=` |
| Every keystroke of typed text | `node tools/screen/keystrokes.mjs <video> --box=<text line x,y,w,h> --from= --to=` |
| Where the cursor is (for a glow / spotlight) | `tools/pyenv/Scripts/python.exe -I tools/screen/track-cursor.py <clip> <from> <to> build/cursor.json` |
| Music drops | `node tools/music-drops.mjs <track> --map` |
| Voice lines | `node tools/transcribe.mjs <vo> --lang=bn` (~13× real time, 2.4 GB; RAM is tight — run it alone) |

Voice traps: the Bengali model writes English phrases badly ("So, what's your decision?" came out as "সো") —
run `--lang=en --model=small` too (60 s for 90 s) for the English bits and line timings. The full Bengali pass
can swallow ~10 s into one word: re-run just that slice (`ffmpeg -ss A -to B` → transcribe). Pauses for line
starts: `ffmpeg -i vo.wav -af silencedetect=noise=-40dB:d=0.35 -f null -`.

## 2. Plan gate

`tools/plan/TEMPLATE.md` → `projects/<name>/PLAN.md` → `node tools/plan-check.mjs projects/<name>`; show the
user in Bengali and wait for OK. Times in the shot table are FINAL-video times (= source − trimmed start).
Put each script line's measured start in the line, e.g. `৬. (০:২৮.৮) …`; plan-check then uses those instead of
Piper's estimated pace. Copy BGM files into `<project>/assets/music/` so plan-check sees the music.
Ask only: end-card length vs the voice's last line, music licence for paid ads, 9:16 or not, captions or not.

## 3. Build (≈ 15 minutes of work with the reference project)

1. **Clip:** `node tools/screen/cut.mjs <video> <work>/cam.mp4 --from=<first clean frame> --to=<click frame>
   --hold=<a still moment>:<s> --tail=0.5`. The hold moves the click to land just AFTER a voice line ends (the
   ad held the hover 0.42 s so the boom follows "decision?"). `--to` = the click frame, so the reaction/spinner
   never shows. Heavy media on C: (`C:/Users/Zubayer Nibir/VideoWork/<name>/media`), linked as the project's
   `assets/media` junction (D: has ~3 GB free).
2. **timeline.mjs:** every moment in final seconds: CLICK = frames/30, KEYS (keystrokes − trim), clicks
   (watch.mjs changes − 0.03), whooshes on every camera move, crossfade, end-card slams.
3. **Mix:** `build/mix.mjs` on `tools/screen/promo-mix.mjs` (voice EQ, beds with dB envelopes, cues with
   lead_s). Put a drop on the click: `from = drop − (CLICK − bed_start)`. ~6 s.
4. **Page:** `build/build-page.mjs` on `tools/screen/promo-core.mjs`. Camera views are `{ t, d, s, l, tp, e }`:
   the view's top-left corner in source pixels, so a view must satisfy `l + 1920/s ≤ 1920`, `tp + 1080/s ≤ 1080`.
   A 1.3× view is 1477 px wide: it cannot show a 1484 px wide settings panel whole — pick what to crop.
   Fonts Anton + Inter and GSAP must be copied into the project's assets.
5. `hyperframes check` → `hyperframes snapshot --at <key moments> --no-end --describe false` → look at the
   contact sheets → `node tools/design-lint.mjs .`

## 4. Render detached and review

Background tasks die with the session; start it detached (PowerShell):
`Start-Process cmd.exe "/c cd /d ""D:\Video Create"" && node tools/finish.mjs projects/<name> --quality=high --formats=16x9 ""--frames-cache=C:/Users/Zubayer Nibir/VideoWork/<name>/frames-cache"" > <log> 2>&1" -WindowStyle Hidden`
Do NOT tail the log with a Monitor: it prints one "Streaming frame N/2700" line per frame plus JSON traces, and
any filter on it floods the chat. Instead wait for the process in a background Bash
(`until ! tasklist //FI "PID eq <pid>" | grep -q <pid>; do sleep 5; done; tail` of the log without
`Render:trace|[INFO]|Streaming frame` lines) and read the summary once.
90 s took ~7 min of capture at ~6.5 frames/s (screenshot mode, see the 3D note). Then: contact sheets
(`--every=0.5`), the click moment frame by frame, and a null/lag test of the master audio against mix.wav.

## 5. Traps found here (each cost a run)

- **Any CSS `perspective` (the 3D tilt) switches the WHOLE render to screenshot capture** (log: "CSS 3D
  rendering context — disabling drawElementImage"). Fine for 90 s; for long videos, fake the tilt in 2D
  (skew/scale) or render that stretch separately.
- HyperFrames check: a duplicate text layer for a shadow fails (`text_not_painted` when transparent,
  `content_overlap` when dark). Use a soft `.halo` plate behind the line instead. `-webkit-text-fill-color:
  transparent` + `color: <gold>` passes the contrast check.
- Lint `composition_heavy_overlay_count_high`: ~40 radial-gradient elements (even hidden) made captures go black
  in the field. Particles = one element with many `radial-gradient(circle at x y …)` backgrounds; keep the end
  card `display:none` until it is needed (`tl.set(… { display: "block" })`).
- GSAP tweens on one property that touch end-to-start get `overlapping_gsap_tweens`: leave 0.01 s.
- FFmpeg 9: `-filter_complex_script` is gone → `-/filter_complex <file>`.
- `assets/sfx/manifest.json` is an object keyed by name. `riser.mp3` builds 0–4.12 s then stops dead (its
  description says ~10 s); `boom.mp3` hits at once and rings ~1.2 s; `impact-bass-1` is a 2.1 s tone.
- Mono voice doubled to stereo reads +3 LU (−14.1 → −11.1); the user's "music −19 dB" is a gain on the bed.
- The cursor tracker misses I-beam and taskbar stretches; promo-core bridges ≤ 10-frame gaps and fades longer ones.
- `ffmpeg -frames:v N` with `tile` counts OUTPUT frames: use `trim=end_frame=N,…,tile` + `-frames:v 1`.

## 6. After the video (do not skip — this is how the next one gets cheaper)

CLAUDE.md §0f: LESSONS.md row for the user's feedback; anything written twice by hand → a tool in `tools/`;
new traps → section 5 here; commit the tools/skill with the user's OK.
