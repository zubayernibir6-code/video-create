# BRIEF — CD1 · Dev-Tool Launch (3D code)

**Brand:** Kernel — a command-line tool that deploys any app in one command (fictional)  
**Length / format:** 14 s, 16:9

## Concept
"One command. Live everywhere." A developer types `kernel deploy` in a terminal; the code slab behind it turns in 3D
to a readable rest, the deploy runs (progress lines tick), and a world of edge nodes lights up with a live URL.

## Look (palette, type, finish)
Pure black #050505 with a faint dot grid; ONE accent electric green #36f28b (cursor, success, links); ink #f2f2f2,
muted #8a8a8a. Geist Mono for code and terminal (≥ 28 px for anything readable), Geist (display 700, −0.04em) for
the few headlines. Syntax colours muted (#9cdcfe, #c586c0, #ce9178) with the accent only on the success line.
3D: either CSS 3D (a code panel with perspective, settling flat — camera at rest) or three.js via the import map
(code-3d-extrude registry block as a starting point, CDN refs rewritten to local files).

## Beats (fit the timing to data-glitch's strong beats; every text stays up long enough to read)
- 0–2.5 hook: headline "One command." (mask lines) over a dim code slab tilted in 3D
- 2.5–6 terminal window slides up; `$ kernel deploy` types (S.type, cps 18) with key-press ticks; Enter
- 6–9.5 progress: four lines tick from spinner to done ("Building · 2.1 s", "Optimising images", "Uploading to 32 regions", "Live ✓" — draw the tick as SVG); the code slab behind turns and settles flat
- 9.5–12 a dot globe/grid of 32 edge nodes lights up in a wave; the URL `https://my-app.kernel.example` appears with a copy chip
- 12–14 lockup: Kernel wordmark (monospace k in a rounded square) + "One command. Live everywhere." + `npm i -g kernel` + "Concept work · fictional brand"

## Craft notes
Spinners and progress = per-frame (S.everyFrame), never infinite tweens. Typing with S.type + caret. Keep the
terminal readable: 30–34 px mono, 64 px line height. The 3D move lands at rest before any text must be read.

## Sound
data-glitch; key-press ticks under typing (or `typing`), click on Enter, pop on each done line, a soft ping wave on
the nodes, impact-bass-2 (.35) on the lockup.

## Done means
- `node tools/studio/check.mjs projects/pf-cd1-kernel` ends with ✓; plan-check 0 ERROR; you looked at every held moment.
- Small "Concept work · fictional brand" label on the end card; piece.json brief + reel filled.
