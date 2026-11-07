# BRIEF — SA1 · Vertical Social Ad (voiced)

**Brand:** Pocket — a budgeting app (fictional)  
**Length / format:** 15 s, 9:16 (voice-over 10.4 s: assets/voice/vo.wav; words in vo.words.json / vo.srt)

## Concept
VO (Puck): 'Where did all your money go? / Pocket knows. / It sorts every purchase, finds the subscriptions you forgot, and shows what's safe to spend today. / Try Pocket free.' Line times in the file: 0.00–1.32, 1.82–2.58, 3.02–5.82, 6.14–8.00, 8.46–9.20.

## Look (palette, type, finish)
Bold ad look: deep purple-black #160b2e with a money-green accent #00d47e; white ink. Space Grotesk 700 for the hook words (huge: 150–190 px), Inter for small text. The kinetic words ARE the captions — sync each phrase to the voice.

## Beats (fit the timing to the music's strong beats / drops; every text stays up long enough to read)
- 0–1.4 HOOK in the first second: receipt and coin shapes fly + huge 'Where did all your money go?'
- 1.8–2.6 smash cut: 'Pocket knows.' with the app phone sliding in
- 3.0–8.0 three quick phone states synced to the phrases: purchases auto-sorted into category chips; 'Forgotten subscriptions' card (3 rows, '$47.97/mo' found); big 'Safe to spend today: $64' with a ring
- 8.4–15 end card: Pocket logo (design a simple mark), 'Try Pocket free' button pulsing once, small 'Concept work' label; the music carries to 15 s

## Craft notes
piece.json sound.voice = { file: 'assets/voice/vo.wav', at: 0.15 } and add 0.15 to every VO time. Duck the music under the voice (music.duck [[0.1, 9.6, 0.45]]). Text inside x 6–82 %, y 15–62 % (the phone body may go lower).

## Sound
social-punch (start it so the hook lands on a downbeat); coin-drop on the hook, whoosh on the smash cut, pops on chips, cash-register when '$47.97' lands, impact on the end card.

## Done means
- `node tools/studio/check.mjs projects/pf-sa1-pocket` ends with ✓; plan-check 0 ERROR; you looked at every held moment and fixed what a top studio would not ship.
- A small furniture label "Concept work · fictional brand" on the end card.
- `piece.json`: brief filled (client, goal, audience, message, cta, tone) and `reel` = the best 3–5 s (for the showreel).
