---
name: post-copy
description: Write the ready-to-paste post copy for a finished video or Reel in the D:\Video Create workspace - Facebook page post, Facebook Reels caption, Instagram Reels caption, YouTube title + description with chapters + tags + pinned comment, YouTube Shorts title - in Talha Zubayer's own simple Bengali voice with the right number of hashtags per platform and one CTA that drives comments, plus where each link goes. Use when he types /post-copy, asks for a caption, post, description, "post copy", "ad copy", hashtags, or after delivering ANY video or Reel (do it unasked). For a paid ad's copy (Meta Ads Manager primary text, headline), use the same voice rules with §5.
---

# post-copy: the words that go with every video (made 2026-10-30, claude-video-tutorial + claude-reel-1..4)

Examples that he received: `projects/claude-video-tutorial/POST-COPY.md` (full video) and `REELS-POST-COPY.md`
(4 Reels). The voice rules are the `humanize` skill (~/.claude/skills/humanize): load it first.

## 1. Facts come only from the video

Read the project's PLAN.md (script, goal, chapters) or the Reel's captions.json words. Every claim in the copy must be
said or shown in the video. Never add "free", prices, numbers or results he did not give. If his own words contain a
claim that may be wrong (e.g. "আনলিমিটেড"), leave it out of the copy and tell him once.

## 2. One file per project, ready to paste

Write `projects/<name>/POST-COPY.md` (or one REELS-POST-COPY.md for a series): every block in a ``` fence so he can copy
it in one tap. Sections: what goes where, then per platform. Placeholders only for links that do not exist yet,
written as "(এখানে আপনার YouTube লিংক)" with a line saying "লিংকটা দিলে আমি বসিয়ে দেব".

## 3. Platform rules (checked 2026-10-30; re-check yearly)

| Platform | Hashtags | Shape |
| --- | --- | --- |
| Facebook page post / Reels | 3–4 | hook line, 2–4 short lines, one CTA; the link goes in the FIRST COMMENT, not in the post |
| Instagram Reels | max 5 (the cap reported since Dec 2025) | same text; "লিংক Bio-তে" (links in captions don't click) |
| YouTube video | 3 in the description (over 15 → all ignored) | title ≤ 100 chars (keyword first, Bengali + English), description with "যা যা ব্যবহার করেছি" and chapters (0:00 first, ≥ 3, each ≥ 10 s, from PLAN.md times), Tags box list, pinned comment |
| YouTube Shorts | 3 | title with #Shorts; set **Related video** to the full video in Studio |

Hashtag mix: 1 broad (#AIVideo), 1–2 niche (#ClaudeCode, #GoogleAIStudio), 1 Bengali (#বাংলা_টেক), + his own brand tag
once he names his page (STYLE.md §১ asks). Hashtags at the very end. Tell him plainly: hashtags help a little; reach
comes from the hook, watch time, shares and comments.

## 4. Routing (his rule, 2026-10-30)

Facebook Reels → the full video on his Facebook page (link in first comment). Facebook page post → YouTube.
Instagram Reels → YouTube (link in Bio). Shorts → the full video (Related video). Post the full video first, then one
Reel a day; best hour from his Page Insights.

## 5. CTA

One per post: "কমেন্টে লিখুন DM" when a prompt pack / offer exists (comments raise reach), "Save করে রাখুন" for a
settings/how-to Reel, a simple question for a result Reel. Paid ads: no "comment DM"; primary text ≤ 125 chars before
"See more", headline ≤ 40, no brand logos/trademark names in the claim (LESSONS 2026-10-26).
