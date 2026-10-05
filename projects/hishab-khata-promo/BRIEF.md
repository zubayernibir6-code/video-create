---
workflow: product-launch-video
flow: automation
storyboard: yes
message: "খাতার হিসাব ছেড়ে দিন — ফি, বকেয়া আর রিপোর্ট এক জায়গায়"
destination: youtube
aspect: 1920x1080
language: bn
audience: "বাংলাদেশের স্কুলের হিসাবরক্ষক ও প্রশাসন"
length: 45s
angle: problem-solution
---

## Intent

A promo for **হিসাব খাতা (Hishab Khata)** — school fee and accounts software for
Bangladeshi schools: fee collection, dues tracking, printed receipts, month-end reports.
The audience is the school accountant who still runs on a paper register plus Excel and
loses evenings to chasing dues and reconciling at month end.

Chosen concept (pitch round, user picked option ক): **problem → solution.** Open inside the
pain — stacks of registers, red dues, 11 p.m. reconciliation — then let the software clear it.
Confident and warm, not corporate-slick; this is a tool for a tired person, and the video
should feel like relief rather than a sales pitch.

This is a **sample product**, chosen deliberately: the user is himself a school accountant at
Shaheen School, Mirzapur, so he can judge whether the video rings true from the inside — and
the product is realistic enough to become something he actually ships.

## Assets

None supplied. No website, no screenshots, no logo — **no-capture mode**. Every visual is
invented from the brief: Bengali typography, numbers, and abstract UI suggestions built in
HTML. Do not fabricate screenshots of a product that does not exist; suggest the interface
with type and shape instead of faking a real screen.

## Customizations

- **Bengali-first typography.** Baloo Da 2 for display, Hind Siliguri for body, from the
  workspace font pack at `assets/fonts/`. Latin only for numerals where it reads better.
- **Count-up on the proof numbers** (hours saved, students handled, errors).
- **Hand-placed SFX** from the workspace library at `assets/sfx/` (Pixabay Content License),
  cued to the visual beats — whoosh on entrances, pop on chips, ping on data, impact on the
  logo, chime on the close.

## Notes

- **No narration and no music.** `hyperframes auth status` reports signed out; Kokoro and
  MusicGen are both missing locally, so no TTS engine can produce Bengali voice, and the
  workspace has no licensed music yet (the user will download Pixabay tracks separately).
  The video therefore carries its message in on-screen Bengali text — which also suits
  Facebook/YouTube feeds, where most viewers scroll with sound off. Voice and a music bed can
  be layered in later without rebuilding the frames.
- **Deviation from the workflow's Step 3.1.** The canonical silent marker (`music: none` +
  no `SCRIPT.md`) disables SFX as well, and this video wants SFX. So `audio.mjs` is skipped
  entirely and SFX are placed by hand as `<audio>` elements. That path is already
  render-verified on this machine — six effects cross-correlated to their exact cue times in
  `projects/audio-test` (workspace `CLAUDE.md` §4d).
- **Project location.** This workspace keeps projects under `projects/`, not the workflow's
  default `videos/`. Only `PROJECT_ROOT` matters to the scripts.
- Render at 1080p. This machine is an i5-8265U with integrated graphics and ~3 GB free RAM;
  4K is not practical and concurrency above 2 thrashes (workspace `CLAUDE.md` §5).
- Every asset used must be commercially licensable — the user sells software. Fonts are
  OFL 1.1, SFX are Pixabay Content License, GSAP is fine for rendered video output
  (workspace `CLAUDE.md` §4b–§4d).
