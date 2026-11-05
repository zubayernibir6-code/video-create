---
name: hook-ad
description: Fast edit of a finished vertical ad clip (a presenter + B-roll with its own voice) into an attention-grabbing Reel - hook text in the first frame, punch zooms + flash + whoosh on key words, word-by-word gold captions, info cards (route, time, counter, phone) placed AROUND faces, brand end card - with an acceptance gate so nothing a customer would reject ships. Use when he says "edit this video", "hook", "ad graphics", "Premiere-style", "type animation" on one clip. Made 2026-11-04 (Unity Paribahan bus ad, v1-v3).
---
# hook-ad v3 (2026-11-05): spec -> face-aware text -> render -> acceptance gate -> LOOK at it

Reference: `projects/unity-edit-02/spec.json` (v4, look C, spoken numbers typed digit by digit, hold, end card,
music.py bed); older `projects/unity-hook-01/spec.json`. Engine `tools/hook-ad/`:
`faces.py` (YuNet face boxes every 0.25 s), `build.py` (spec -> ASS + render), `accept_check.py` (the gate).

1. ASR: `node tools/transcribe.mjs <clip> --lang=bn --out=<work>/asr`. Shot changes:
   `ffmpeg -i clip -vf "select='gt(scene,0.25)',metadata=print:file=-" -an -f null -` (pts / time_base).
   **The ASR drops stretches it is unsure of** (number strings above all: unity-edit-02 lost 25.6-35.7 s, both phone
   numbers, and the log only said "1 phantom segment skipped"). build.py now STOPS with "UNHEARD SOUND a-b" when the
   audio is not silent but has no word; re-transcribe that stretch alone and add it to "words" as
   `{"file": ..., "offset": a}`; music/noise you listened to goes in "not_speech". Never assume silence from the ASR.
2. Faces: `tools/pyenv/bin/python -I tools/hook-ad/faces.py <clip> <work>/faces.json` (cloud: needs
   opencv-python-headless in the venv, `uv pip install --python /opt/vc/pyenv/bin/python opencv-python-headless`,
   and `assets/models/face-yunet-2023mar.onnx` from huggingface.co/opencv/face_detection_yunet).
3. Write spec.json (copy the reference): fixes, cards ON their spoken word, route stops, hits, cuts.
   `python3 -I tools/hook-ad/build.py spec.json` prints each card's y; "NO ROOM" = smaller font or shorter card.
4. `build.py spec.json --render`, then faces.py on the RENDER, then
   `python3 -I tools/hook-ad/accept_check.py <out>.ass --phone=<digits> --brand=<word> --words=<asr> --faces=<render faces>`
   must say PASS (`--words=a.json,b.json@24` for re-transcribed stretches; it FAILs a number the voice says that is not
   on screen, complete, while it is said). Then a 1 fps sheet (`fps=1,scale=270:-1,tile=9x4`) and READ it, and
   re-transcribe the RENDER's number stretch: the digits heard must be the whole number.

## Spec keys added 2026-11-05 (unity-edit-02)
`look` A/B/C · card `y` (fixed place), `lines`, `type` (seconds, typed evenly) or `spoken: [a, b]` (each digit appears
ON its spoken word; "ডাবল সেভেন" = 77; build stops if the spoken digits differ from the card) · `hits: [[t, "sfx.mp3"]]`
· `whip: [shot changes]` (horizontal blur + punch + flash) · `breaks` (caption line breaks, e.g. shot changes) ·
`hold: [[t, s]]` (freeze that frame, silent: a full number stays readable after the last digit) · `retime: [[asr, real]]`
(a word the ASR placed early) · `end: {bg, dur ≤ 3, dim, cards[]}` (blurred-still end card with brand, route, time,
numbers) · `music: {file, gain}` (sidechain-ducked). Music: `tools/hook-ad/music.py out.wav --dur=<render s>
--drop=<first shot change> --stop=<end>` = an original bed made from code (safe to sell) when assets/music is empty.

## Acceptance rules (his words 2026-11-04: "যেটা কেউ accept করবে না, সেটা তুমি কেন দিবা?")
- **Never cut speech** (his words 2026-11-05: "number je bollo screen e seta purota dekhalon na, puro number er audio
  shunate hobe"). A cut over any word stops build.py; a spoken phone number is played IN FULL and shown IN FULL,
  digit by digit on the voice, then held (`hold`) until it can be read. Re-listen to it in the render.
- **Facts must be valid, or they are not shown.** A phone number must be 11 digits `01[3-9]XXXXXXXX`. Re-listen
  (Bengali model, 0.8x slowed, Whisper turbo English) before deciding. If the VOICE says a wrong number: cut that
  stretch (cut on a shot change only), show NO number, ask him for the right one. Never ship a placeholder or a guess.
- **No text on a face** (STYLE §13). Cards go in the top band (269 px .. head top) or below the chin; the head grows
  during AI-video push-ins, so measure over the card's whole time (build.py does it).
- One message at a time: a card below the chin replaces the word captions while it shows.
- Sizes at 1080x1920: captions 84, cards 88-100, hook 145-150, key numbers 165-175. libass sizes the LINE box, so
  Baloo/Hind glyphs look ~40 % smaller than the number: check the preview at phone size.
- Safe zone: top 14 % and bottom 35 % stay clear (Meta Reels). Captions centre y=1190.

## Taste references (researched 2026-11-04)
- Google/YouTube ABCD: start fast with tight framing; brand early, said AND shown together; one simple message;
  people at the centre; CTA said and shown, more direct at the end.
- TikTok creative best practices: core message in the first 3 s, hook within 6 s; captions 5-10 words/s;
  transitions, stickers and graphics keep watch time; close with a clear CTA; keep text in the UI safe zone.

## Working WITH him (his request 2026-11-04)
When he is present, before the full render send ONE picture: three looks (A brand-purple boxes, B bold yellow
punch, C premium glass panel) at the hook, a number card and a CTA card; render the full video in the look he picks.
If he is away, use A (the client's own colours) and say so. Ask every factual question (number, spelling) in the
same message as the preview, never after the final.
