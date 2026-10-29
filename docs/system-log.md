# System versions: what the workspace learned, one line per upgrade

Each version adds GUARDS: tool rules or skill steps that run by themselves. Notes alone don't count. Raise the
version after a video whose mistakes turned into guards (CLAUDE.md §0i).

| Version | Date | From which video | What now runs by itself |
| --- | --- | --- | --- |
| 1.0 | 2026-10-06 | hishab-khata-promo, khata-cartoon | design-lint (Bengali tracking, font fallback, frame breach), finish.mjs (check → render → −14 LUFS → QC), the §0d craft rules |
| 2.0 | 2026-10-24…28 | zubayer-ep01, claude-decision-ad | plan gate + plan-check, STYLE/LESSONS, contact-sheet, workspace skills (screen-promo, episode-edit, zero-cost-video-editor, tools-reel), whole-video coverage guards (§0h) |
| 3.0 | 2026-10-29 | claude-video-tutorial (3 renders, ~35 mistakes) | the five elements (§0i, docs/fundamentals.md); `tools/preflight.mjs` (from_only, shown_early, snap, under_changed, clip_end + snapshots of every overlay); finish.mjs refuses a render over 60 s without a clean preflight of the current build; `tools/screen/glitch-scan.mjs` (source flashes + change strips); `privacy-blur` skill (blur level decided once); screenshot capture in finish.mjs |
