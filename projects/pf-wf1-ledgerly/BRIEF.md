# BRIEF — WF1 · Workflow Diagram

**Brand:** Ledgerly — invoice automation (fictional)  
**Length / format:** 20 s, 16:9

## Concept
An invoice's journey: Email → AI reads it → matches the PO → approval rule → pays → reconciles. One branch: mismatch → human review → back on track.

## Look (palette, type, finish)
Dark navy #0a1020 with a blueprint dot grid; nodes are glass cards; ONE accent electric blue #4d8dff; success green #2ee59d only at the end; amber only on the retry branch. Inter + JetBrains Mono (field names).

## Beats (fit the timing to the music's strong beats / drops; every text stays up long enough to read)
- 0–2.5 title 'Invoices that pay themselves.' (mask lines)
- 2.5–6 node 'Inbox' receives a PDF (document card flies in); a packet travels to 'Extract' where fields fill (vendor, amount $12,480.00, due date) with typing
- 6–10 'Match PO' (two documents slide together; tick drawn as SVG); 'Approve' rule chip '< $25k → auto'
- 10–14 a second packet takes the branch: 'Mismatch' (amber) → 'Review' card → back to the main path
- 14–17 'Pay' → 'Reconcile' turn green; counter 'Hours saved this month: 126'
- 17–20 lockup Ledgerly + 'Close the books on time.'

## Craft notes
Connectors = SVG paths between node anchors (computed from node boxes); packets move per frame along the paths (getPointAtLength). Whole diagram inside 5 % margins; a slight camera pan may land at rest on each section.

## Sound
data-glitch; packet starts whoosh-short (.15), node completes pop (.22), mismatch error (.22), success at the end, typing on field fill.

## Done means
- `node tools/studio/check.mjs projects/pf-wf1-ledgerly` ends with ✓; plan-check 0 ERROR; you looked at every held moment and fixed what a top studio would not ship.
- A small furniture label "Concept work · fictional brand" on the end card.
- `piece.json`: brief filled (client, goal, audience, message, cta, tone) and `reel` = the best 3–5 s (for the showreel).
