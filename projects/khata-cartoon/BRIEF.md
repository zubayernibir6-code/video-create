---
workflow: general-video
flow: automation
storyboard: yes
message: "পুরোনো খাতার কষ্টের দিন শেষ — হিসাব খাতা স্কুলের ফি আর হিসাব নিজেই সামলায়"
destination: facebook-tiktok-youtube
aspect: 1080x1920
language: bn
length: 300s
angle: story
voice: piper-bn_BD-google-medium
---

## Intent

A 5-minute vertical CARTOON story in Bengali, chosen by the user on 2026-10-06 as pitch 4, "খাতা নিজেই কথা বলে":
the old red paper ledger (লাল খাতা) is the hero and narrator — tired, funny, overworked — and the new "হিসাব খাতা"
software arrives, takes over the work, and sends the old ledger on a happy holiday. Karim Sir (the school accountant)
is the side character, from pitch 1.

The user's words: "Ekta Cartoon video banaw, jetaw sound effect thakbe, animation visual diyei story bujha jabe, but,
voice o bujha jabe" — the story must read from the animation alone, AND the voice must be clearly understood.

## Customizations

- Voice: the offline Piper Bengali voice (user's choice), several speakers for several characters.
- Sound effects throughout (assets/sfx), cued on the beat (CLAUDE.md §0d rule 7).
- Burned-in Bengali captions in the platform-safe zone (many viewers watch muted).

## Notes

- Vertical 1080×1920, 5 minutes: Facebook, TikTok and regular YouTube. Too long for YouTube Shorts / Instagram Reels (3-minute limit) — told to the user.
- No music yet (the user's Pixabay task is still open): voice + SFX only; music can be added later with tools/music-pick.mjs.
- Piper voice needs a credit line in the video description (assets/voices/piper/CREDITS.md).
- হিসাব খাতা is a SAMPLE product: features shown are illustrative. "Receipt straight to the parent's phone" is new in this script — flagged to the user.
- No AI image generation on this machine: every character and background is hand-built SVG, animated with GSAP.
- Follow CLAUDE.md §0d craft rules; finish.mjs runs design-lint before rendering.
