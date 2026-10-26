# edit_plan.json

The render spec for one edit. It lives beside `PLAN.md` in `projects/<name>/`. PLAN.md is what he approves (its shot
table, in Bengali, checked by `tools/plan-check.mjs`); edit_plan.json is written FROM the approved PLAN.md and adds
only the technical detail. If he asks for a change, change PLAN.md first, re-run plan-check, then this file.
`work/render.mjs` renders from it, and every variant is a copy with a few fields changed.

- `segments[].in/out` are **source** times (seconds in the A-roll file).
- Every other `at` is on the **output** timeline (seconds into the finished video), after transitions.
- `sfx[].at` is the **visual hit**; render.mjs subtracts each sound's `lead_s` (assets/sfx/manifest.json).
- `reason` fields are for him: one short line on why that choice serves the story.

```json
{
  "project": "day05_claude_editing",
  "type": "talking_head",
  "language": "bn",
  "format": {"name": "9x16", "width": 1080, "height": 1920, "fps": 30},
  "sources": {
    "aroll": ["input/aroll.mp4"],
    "voice": null,
    "script": "input/script.txt",
    "music": "../../assets/music/calm/track.mp3"
  },
  "segments": [
    {"id": "s1", "src": "input/aroll.mp4", "in": 0.00, "out": 2.12, "zoom": 1.0, "reason": "hook: the result first"},
    {"id": "s2", "src": "input/aroll.mp4", "in": 2.88, "out": 5.12, "zoom": 1.15, "reason": "punch-in on the key claim"},
    {"id": "s3", "src": "input/aroll.mp4", "in": 5.88, "out": 8.12, "zoom": 1.0}
  ],
  "overlays": [
    {"at": 2.0, "dur": 2.5, "type": "broll", "src": "work/broll/pexels_123456.mp4", "fit": "cover",
     "reason": "shows the laptop he mentions"},
    {"at": 5.2, "dur": 2.0, "type": "graphic", "src": "work/gfx/stat_card.webm", "reason": "the number on screen"}
  ],
  "supers": [
    {"at": 0.2, "dur": 1.8, "text": "৫ মিনিটে ভিডিও এডিট", "style": "title"}
  ],
  "captions": {"preset": "bold-pop", "font": "Hind Siliguri", "size": 59, "words_per_page": 3,
               "highlight": "#FFD700", "center_y": 1152},
  "sfx": [
    {"at": 1.95, "file": "whoosh.mp3", "volume": 0.5},
    {"at": 5.2, "file": "pop.mp3", "volume": 0.4}
  ],
  "music": {"file": "../../assets/music/calm/track.mp3", "volume": 0.25, "duck": true, "fade_in": 0.5, "fade_out": 2.5},
  "transitions": [
    {"after": "s2", "type": "slideleft", "dur": 0.3}
  ],
  "end_card": {"dur": 2.0, "text": "STYLE.md §১১ (still an open question for him)"},
  "deliverables": {"formats": "9x16,1x1", "reframe": "fit",
                   "credits": ["assets/voices/piper/CREDITS.md line, if Piper is used"]}
}
```

- `sfx[].file` names a file in `assets/sfx`; `music.file` one he downloaded into `assets/music/<mood>/`. Both are
  read from the shared folders (paths relative to the project, or absolute in `-i`), never copied into `input/`.
- Graphics from HyperFrames come as transparent `.webm` (`hyperframes render --format webm`) and are overlaid.
- `deliverables` maps onto `finish.mjs --formats=… --reframe=fit|crop`. A 16:9 version with its own captions is a
  variant: copy the plan, set `format` to 1920×1080 and `captions.center_y` to 972 (90 % of 1080).
- Supers and the end card are Bengali text: draw them in HyperFrames (correct shaping, pack fonts), not with
  FFmpeg `drawtext`.

## What he sees before anything is rendered

Not this file: PLAN.md's shot table, shown to him in Bengali in chat (CLAUDE.md §0e). Example:
`tools/plan/EXAMPLE.md`. Columns: `সময় | পর্দায় কী | ক্যাপশন / লেখা | শব্দ`.
