---
name: post-copy
description: Write the ready-to-paste post copy for a finished video or Reel in the D:\Video Create workspace - Facebook page post, ONE universal Reel caption that works unchanged on Facebook, Instagram and X, X posts and replies, LinkedIn posts, YouTube title + description with chapters + tags + pinned comment, YouTube Shorts title - in Talha Zubayer's own simple Bengali voice with the right number of hashtags per platform and one CTA, plus where each link goes, every block machine-checked with tools/release/copy-check.mjs. Use when he types /post-copy, asks for a caption, post, description, "post copy", "ad copy", hashtags, or after delivering ANY video or Reel (do it unasked). For a paid ad's copy (Meta Ads Manager primary text, headline), use the same voice rules with §5.
---

# post-copy: the words that go with every video (made 2026-10-30, claude-video-tutorial + claude-reel-1..4)

Examples that he received: `projects/claude-video-tutorial/POST-COPY.md` (full video) and `REELS-POST-COPY.md`
(4 Reels). The voice rules are the `humanize` skill (~/.claude/skills/humanize): load it first.

## 1. Facts come only from the video

Read the project's PLAN.md (script, goal, chapters) or the Reel's captions.json words. Every point in the copy must reflect what is said or shown in the video and the user's brief.

## 2. One file per project, ready to paste

Write `projects/<name>/POST-COPY.md` (or one REELS-POST-COPY.md for a series): every block in a ``` fence so he can copy
it in one tap. Sections: what goes where, then per platform. Placeholders only for links that do not exist yet,
written as "(এখানে আপনার YouTube লিংক)" with a line saying "লিংকটা দিলে আমি বসিয়ে দেব".

## 3. Platform rules (checked 2026-10-30; re-check yearly)

| Platform | Hashtags | Shape |
| --- | --- | --- |
| Facebook page post / Reels | 3–4 | hook line, 2–4 short lines, one CTA; the link goes in the FIRST COMMENT, not in the post |
| Instagram Reels | max 5 (the cap reported since Dec 2025) | same text; "লিংক Bio-তে" (links in captions don't click) |
| YouTube video | 3 in the description (over 15 → all ignored) | title ≤ 100 chars (keyword first, Bengali + English), description with "যা যা ব্যবহার করেছি" (a tutorial; for a promo or another kind, "ভিডিওতে যা দেখিয়েছি") and chapters (0:00 first, ≥ 3, each ≥ 10 s — copy-check tests them; from PLAN.md times, or shot rows grouped to ≥ 10 s), Tags box list, pinned comment |
| YouTube Shorts | 3 | title with #Shorts; set **Related video** to the full video in Studio |

Hashtag mix: 1 broad (#AIVideo), 1–2 niche (#ClaudeCode, #GoogleAIStudio), 1 Bengali (#বাংলা_টেক), + his own brand tag
once he names his page (STYLE.md §১ asks). Hashtags at the very end. Tell him plainly: hashtags help a little; reach
comes from the hook, watch time, shares and comments.

## 4. Routing (his rule, 2026-10-30)

Facebook Reels → the full video on his Facebook page (link in first comment). Facebook page post → YouTube.
Instagram Reels → YouTube (link in Bio). Shorts → the full video (Related video). Post the full video first, then one
Reel a day; best hour from his Page Insights.

## 5. CTA

One per post: "কমেন্টে লিখুন DM" or "পেজের ইনবক্সে KEYWORD লিখুন" when a prompt pack / offer exists, "Save করে রাখুন" for a
settings/how-to Reel, a simple question for a result Reel. Paid ads: primary text ≤ 125 chars before
"See more", headline ≤ 40, following the user's offer and brief.

Where the humanize skill's numbers differ (Facebook 3–5 hashtags, LinkedIn 3–5, a Facebook caption 60–150 words), this
skill and platforms.json win: Facebook 3–4, LinkedIn 3, and a universal Reel caption may be short (hook + 1–3 lines).

## 6. The release system's copy: universal Reels, X, LinkedIn (2026-10-30, `docs/release-system-plan.md` step 5)

Since 2026-10-30 every main video gets ONE file `projects/<name>/RELEASE-COPY.md` (example:
`projects/claude-video-tutorial/RELEASE-COPY.md`): a "where what goes" table, then per universal Reel its caption,
the Facebook first comment, the X reply and the Shorts title; the LinkedIn posts; the X post for the full video.
**Tag every fenced block** with the kind on the line before the fence, then run the check until it says 0 errors:
```
<!-- copy: universal-reel | x-post | x-reply | linkedin-post | first-comment | youtube-title -->
node tools/release/copy-check.mjs projects/<name>/RELEASE-COPY.md
```
The rules live in `tools/release/platforms.json → copyRules` (change them there, with the date):
- **universal-reel**: one caption pasted unchanged on Facebook, Instagram, X and as the Shorts description. Exactly 3
  hashtags (fits FB 3–4, IG ≤ 5, Shorts 3), X weighted length ≤ 280 (Bengali counts 1 per code point, emoji 2), no link
  and no platform's own words (Bio, লিংক কমেন্টে): the Reel's end card says "আমার প্রোফাইলে দেখুন" and each platform's
  link goes in its own place (FB first comment, IG Bio, X reply, Shorts Related video).
- **x-post** 1–2 hashtags, no link (the link goes in an **x-reply**). X free accounts take video ≤ 140 s: the full video
  goes to X as text + reply link, its Reels natively.
- **linkedin-post**: professional, his voice — what was built, the steps, one honest takeaway grounded in what he said,
  then ONE "মেসেজ করুন" line built from the offer THIS video makes (the tutorial's: "কোডিং, ভিডিও বা অটোমেশনের কাজ,
  অথবা Claude Code সেটআপ করাতে চাইলে মেসেজ করুন"; a video with no offer: "…নিয়ে কথা বলতে চাইলে মেসেজ করুন"; never
  borrow a service another video offered). 3 hashtags, ≤ 250 words, no link (first comment
  optional: sources disagree whether it costs reach), never কমেন্টে লিখুন / DM / লাইক / শেয়ার (LinkedIn holds back
  engagement bait). A full-video post may say "বাংলা সাবটাইটেল আছে" only when he uploads the `.bn.srt`.
- On every block: the humanize skill's machine tells, ≤ 1 em dash, ≤ 3 emoji, hashtags on the last line only.

## 7. Separate Facebook / Instagram / YouTube Shorts words for a Reel (2026-11-03, GitHub series 1–10)

When he asks for each platform's own caption, add under the Reel's heading in RELEASE-COPY.md (kinds and rules in
platforms.json, researched 2026-11-03): `facebook-reel` (3–4 hashtags, ≤ 90 words, first line ≤ 125 characters with
the keyword, no link, no "Bio"), `instagram-reel` (3–5 hashtags: the cap since Dec 2025 counts comment hashtags too,
first line ≤ 125, a one-line-per-tool list for Instagram search, CTA "আমার প্রোফাইলে Message চাপুন, লিখুন KW"),
`shorts-description` (3 hashtags, no link: links in Shorts descriptions do not click, so name the Facebook page and
put its link in the channel's Links), `youtube-tags`. Keep `universal-reel` for X. `pack.mjs` then uses each
platform's own block (falling back to the universal one) and writes `reel-caption.txt` / `reel-shorts.txt` /
`reel-post.txt` next to each video in the release folders. A series tag on every post (#GitHubBangla) lets the
series build up under one tag. His Bengali guide: `series/github-repos/POSTING-GUIDE.md`.
