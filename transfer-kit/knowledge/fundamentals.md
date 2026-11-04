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
