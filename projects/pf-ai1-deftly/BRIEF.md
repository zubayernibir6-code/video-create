# BRIEF — AI1 · AI Agent Demo

**Brand:** Deftly — an AI agent that does tasks in your apps (fictional)  
**Length / format:** 20 s, 16:9

## Concept
The user types one sentence; a labelled agent cursor ('Deftly') does the work across a calendar and an email app while status chips tick; the result lands.

## Look (palette, type, finish)
Warm off-white desk #f3f1ec with very soft shadows; app windows white; ink #16130f; ONE accent electric violet #6d4aff (agent cursor, status chips, highlights). Geist (display 600, −0.04em) + Geist Mono for status lines. Grain ≤ 0.025.

## Beats (fit the timing to the music's strong beats / drops; every text stays up long enough to read)
- 0–2 hook: 'You type one sentence.' (mask lines)
- 2–4.5 prompt bar: typed 'Move my Thursday sync to Friday and tell the team' → Enter
- 4.5–12 the agent cursor (violet arrow + name pill 'Deftly') flies into a Calendar window, drags 'Team sync' from Thu to Fri (snaps in with springSoft); then Mail: a draft types itself ('Hi team, our sync moves to Friday 10:00…'), cursor clicks Send
- status rail on the right: 'Reading calendar' → 'Moving event' → 'Drafting email' → 'Sent' (draw the tick as SVG) — each from spinner to done
- 12–16 result card 'Done in 9 seconds' + three small proof rows
- 16–20 lockup: Deftly mark + 'Work that does itself.' + 'Join the waitlist'

## Craft notes
Agent cursor = S.cursor plus a label pill that follows with a 2-frame lag (computed per frame). Spinners = per-frame rotation (S.everyFrame), never infinite tweens. Windows enter with springSoft and a slight 3D tilt that settles flat.

## Sound
studio-pulse; agent clicks = click (.3), drag = whoosh-short (.18), each status done = pop (.22), Send = notification (.3), lockup impact-bass-2 (.38).

## Done means
- `node tools/studio/check.mjs projects/pf-ai1-deftly` ends with ✓; plan-check 0 ERROR; you looked at every held moment and fixed what a top studio would not ship.
- A small furniture label "Concept work · fictional brand" on the end card.
- `piece.json`: brief filled (client, goal, audience, message, cta, tone) and `reel` = the best 3–5 s (for the showreel).
