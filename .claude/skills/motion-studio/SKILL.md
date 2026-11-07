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
| `showreel.mjs` | the studio showreel from rendered pieces, cut on the kick drum, each clip labelled with its code; clips are CUT to their windows (23 full masters = 506 MB made the page check fail with ERR_CONNECTION_RESET); piece.json `reel.label` = top-left / top-right moves a label off the piece's own text (DS1); `--avg`/`--outro` keep it ≤ 60 s (no preflight needed); a whole-reel "Concept work · all brands fictional" label |
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
