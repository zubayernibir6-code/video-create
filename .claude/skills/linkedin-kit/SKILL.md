---
name: linkedin-kit
description: The separate LinkedIn version of a finished video in the D:\Video Create workspace - a 4:5 (1080x1350) LinkedIn cut (style LI1) with a result-first opening, his name plate, two-line Bengali captions and a "message me" end card, plus the full video with its Bengali .srt, plus the LinkedIn post copy without engagement bait - each machine-checked. Use when he says LinkedIn, "LinkedIn-এর জন্য", "professional version", or as step 5 of the release-kit skill after every main video.
---

# linkedin-kit: the LinkedIn version (made 2026-10-30, release system step 3/6, reference `projects/claude-li-1`)

His request (2026-10-30): LinkedIn gets its OWN version, not the Reels. CLAUDE.md rules apply (Bengali to him, plan
gate, five elements). The engine is tools/cutdown (profile `linkedin-clip`); the copy rules are post-copy §6.

## 1. What LinkedIn gets, and why (facts in tools/release/platforms.json)

| Piece | Shape | Why |
| --- | --- | --- |
| LinkedIn cut (LI1) | 4:5, 1080×1350, 60–120 s (house WARN outside 30–120) | 9:16 is letterboxed on desktop (S25, blog); LinkedIn: "make the first six seconds count", shorter is better, senior audiences ≤ 3 min (S19) |
| Burned captions | two-line Bengali phrases, the spoken word gold | 92 % of mobile viewers watch muted (S19); LinkedIn auto-captions 10 languages, not Bengali |
| Full video (optional, ask him) | the main render as is + `<main>.bn.srt` | member posts allow 15 min (Pages 10 min, no MOV: S18); SRT upload is desktop-only (S20) |
| Post | `linkedin-post` block: ≤ 250 words, 3 hashtags, no link, one CTA "মেসেজ করুন" | LinkedIn holds back engagement bait; links in the body cut reach (blogs; first-comment advice conflicts) |

## 2. The cut's story (write PLAN.md first; plan-check; his OK)

1. **0–2.5 s: the result** — a silent cold open of the finished thing (the ad's golden click), header = a work
   headline ("কমার্শিয়াল অ্যাড বানানোর আমার AI ওয়ার্কফ্লো"), no logo, no intro board.
2. **His face, the problem and the promise**, his name plate for the first ~4 s (`lower: { name, role }`).
3. **The method** — the steps (one chip per group; the text column is 950 px).
4. **The result** — let the payoff play (a held "দম" row is fine on a > 90 s video).
5. **His own closing line asking for a MESSAGE**, cut on the word before any "কমেন্টে লিখুন / DM" (read the words in
   `<work>/master.words.json`; e.g. his CTA runs 8:01.5–8:12.4 and ends "…আমাকে মেসেজ দিবেন পার্সোনালি").
6. **End card**: his name, the service line ("Claude Code সেটআপ, ভিডিও বা অটোমেশনের কাজ"), `icon("message-circle")` +
   "মেসেজ করুন". No cliffhanger needed; if one, it is calm (the engine drops the slam, shake and heartbeat).
Leave out what LinkedIn readers would hold against him: plan-tier talk that is not the point (Pro vs Max), and
claims he may regret ("আনলিমিটেড"). Say so in the PLAN.

## 3. Build (same engine as the Reels)

`node tools/new-video.mjs <main-short>-li-<n> --kind=linkedin` copies cutdown.json, captions.json, build-page.mjs from
`projects/claude-li-1`. In build-page.mjs keep `profile: "linkedin-clip"` and set:

| Field | What |
| --- | --- |
| `tag` | topic kicker, e.g. "AI ওয়ার্কফ্লো · Claude দিয়ে বিজ্ঞাপন" |
| `hook` | the work headline (≤ 34 characters at 52 px, else 46 px) |
| `lower` | `{ name: "Talha Zubayer", role: "<his role line>", at: 0.3, out: 4.3 }` — no chip while it shows (≤ 3 text zones) |
| `chips` | one group at a time, ≤ 950 px; first chip after the name plate leaves |
| `jumps`, `pushes` | until "no still stretch over 4 s" |
| `cta` | `[service line, icon("message-circle", 40) + "মেসেজ করুন"]` — comment/like/share/DM words are refused |
| `endTag` | his name |
captions.json: the one line from release-kit §1. Then the same commands as release-kit §2, with
`spec-check --for=linkedin-clip` and `--out="F:/Video Create Renders/<main>/linkedin/<name>"`. Safe box (house,
LinkedIn publishes none): x 65–1015, y 68–1215; layout: header y 74–232, chips 244–328, window 1000×563 at y 336,
captions 912–1048, name plate from y 1066.

## 4. Copy and posting

- `linkedin-post` (+ optional `first-comment` with the YouTube link) in RELEASE-COPY.md; `copy-check` 0 errors.
- Shape: what he built, the steps (a short list), one takeaway grounded in his own words, the service line + "মেসেজ
  করুন", 3 hashtags on the last line. A full-video post may say "বাংলা সাবটাইটেল আছে" only with the .srt uploaded.
- Order (RELEASE.md says it): the full video's day, LinkedIn after YouTube and Facebook; the cut the next day or later.

## 5. Ask him once (STYLE.md has no answer yet)

His role line on the name plate; whether the full video also goes on LinkedIn; the headline. Defaults are in the
reference PLAN (`projects/claude-li-1/PLAN.md`).
