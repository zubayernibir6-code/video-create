# প্ল্যান: ভিডিওর নাম

<!--
  Claude: copy this to projects/<name>/PLAN.md, fill every section, then run
    node tools/plan-check.mjs projects/<name>
  until it reports no ERROR. Show the user the goal, hook, shot table, "যা লাগবে", any WARN (in Bengali)
  and the questions, and build nothing until the user says OK. Example: tools/plan/EXAMPLE.md.

  Header: ফরম্যাট and দৈর্ঘ্য are required. Write নেই on its own for no voice or no music.
  Voice: STYLE.md §৮ puts the user's own voice first; if unsure, plan Piper and ask.

  Shot table rules (the checker reads them):
  - সময় is seconds on the finished video: "0–2.5", "2.5–5". Over a minute, "1:05–1:08" works too.
    Rows run back to back from 0 and the last one ends at দৈর্ঘ্য. No blank line inside the table, and no
    | inside a cell (write \| if you must).
  - One row per change on screen (cut, zoom, new graphic). On a Reel something changes every 2–3 s
    (STYLE.md §৫). For a deliberate still beat, write the word দম in the পর্দায় কী cell; a still over
    1.5 s still needs sound (a voice line, `room-tone` or music).
  - ক্যাপশন / লেখা holds only extra on-screen text, written exactly as it will appear (Bengali digits; no ✓
    or arrows: draw those and say so in পর্দায় কী). Voice captions follow the voice by themselves; write —
    when there is no extra text.
  - Sounds go in backticks with the file name from assets/sfx (or the project's own assets/sfx), with
    ×N for repeats: `whoosh-short`, `click` ×৩. A whoosh at every new scene (STYLE.md §৭). Write
    ভয়েস ১, ভয়েস ২ … for the script lines that start in that shot.

  Questions: only what STYLE.md and the request do not answer, plus any number or claim the user did not
  give you (a time saved, a price) and how any extra formats in আউটপুট are made (a quick blurred "fit" or
  a separate layout, STYLE.md §৬).
-->

ফরম্যাট: 9:16
দৈর্ঘ্য: 30 সেকেন্ড
প্ল্যাটফর্ম: Facebook Reels
ধরন: অফার বা প্রোমো
ভয়েস: নিজের গলা (না হলে Piper, পুরুষ, speaker 5)
মিউজিক: নেই
আউটপুট: 9:16, সাথে 1:1
পুরো ভিডিও জুড়ে: (যেমন: কার্সরের আভা, নাম-ইমেইল ঝাপসা, লোগো ঝাপসা, ক্যাপশন — CLAUDE.md §0h; না থাকলে "নেই")

## লক্ষ্য

<!-- One line: what the viewer will know or do after watching. -->

## হুক (প্রথম ২ সেকেন্ড)

<!-- What is on screen and in the ear in the first 2 seconds: the result or the most striking line, never a greeting. -->

## স্ক্রিপ্ট

<!-- The voice lines, numbered (১. … ২. …). With no voice, write: ভয়েস নেই। -->

## শট টেবিল

| সময় | পর্দায় কী | ক্যাপশন / লেখা | শব্দ |
| --- | --- | --- | --- |
| 0–2 |  |  |  |

## যা লাগবে

<!-- Voice, sounds, music, footage or photos, credits, extra formats: what is ready, what is free, what must come from the user. -->

## STYLE.md আর LESSONS.md থেকে যা মানছি

<!-- The STYLE.md rules and LESSONS.md lessons this video follows, each in one line with its section. -->

## আপনার কাছে প্রশ্ন

<!-- Only what STYLE.md and the request do not answer. plan-check lists STYLE.md's open questions. -->
