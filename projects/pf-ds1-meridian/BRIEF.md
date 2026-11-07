# BRIEF — DS1 · Data Story

**Brand:** Meridian Research — an independent research firm (fictional)  
**Length / format:** 20 s, 16:9

## Concept
'The office never fully came back.' A line chart of the share of paid workdays done from home, 2019–2026 — FICTIONAL index labelled 'Meridian WFH Index (illustrative data)'.

## Look (palette, type, finish)
Editorial paper: background #f5f1e8 (very subtle paper noise: S.grain opacity .035, blend multiply), ink #141414, gridlines #d9d2c3, ONE accent red #d6402b. Instrument Serif headline (110–140 px), Inter for labels/axes (≥ 28 px), tabular numbers. FT / Economist / Bloomberg calm.

## Beats (fit the timing to the music's strong beats / drops; every text stays up long enough to read)
- 0–3 headline + a one-line standfirst
- 3–10 axes draw; the line draws 2019 → 2026 with the 2020 spike and the plateau; year labels tick in
- 10–14 annotations: a red dot at the peak 'Peak: 61% (Apr 2020)' and a bracket on the plateau 'Stable near 28% since 2023' (leader lines draw)
- 14–17 a comparison pair slides in: '2019: 7%' vs '2026: 28%' count-ups
- 17–20 sign-off: 'Meridian Research' wordmark + 'Illustrative data · concept work'

## Craft notes
Chart in SVG from real scales (compute points from a data array in JS). Callouts never collide. Line draw with DrawSVG 'settle'; the dot springs. Editorial pieces move less, but precisely.

## Sound
elegant-premium; draws whoosh-short (.14), dots ping (.18), count-ups typing (.14), sign-off chime (.25).

## Done means
- `node tools/studio/check.mjs projects/pf-ds1-meridian` ends with ✓; plan-check 0 ERROR; you looked at every held moment and fixed what a top studio would not ship.
- A small furniture label "Concept work · fictional brand" on the end card.
- `piece.json`: brief filled (client, goal, audience, message, cta, tone) and `reel` = the best 3–5 s (for the showreel).
