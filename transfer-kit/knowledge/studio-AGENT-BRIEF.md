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
