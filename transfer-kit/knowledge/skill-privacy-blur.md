---
name: privacy-blur
description: Decide WHAT to blur in a screen recording or footage before any render, in the D:\Video Create workspace - names, emails, phone numbers, profile photos, passwords and keys, money details, other people's messages - at a level the user picks with one word (basic / strict) or a short list (+ file names, - email). Use when the user types /privacy-blur, says "ki ki japsha hobe", "blur koro", "jhapsha", "privacy", or whenever a video shows his screen, desktop, browser or phone and nothing says otherwise (then the default level applies, no question asked).
---

# privacy-blur: what gets blurred, decided ONCE, before the first render

The user (Talha Zubayer, non-coder, Bengali) set this on 2026-10-29: blur what really matters, use your own
judgement for the rest, and do not re-render a whole video for things that are not harmful. Reply to him in
simple Bengali.

## How he calls it

| He types | Level |
| --- | --- |
| nothing at all, or `/privacy-blur` | **basic** (the default; decide yourself, ask nothing) |
| `/privacy-blur strict` | basic + everything in the strict list |
| `/privacy-blur + file names, + chat titles` | basic plus those items |
| `/privacy-blur - logo` | basic minus that item (only things he names; never drop the "always" row) |
| `/privacy-blur off` | nothing blurred except the "always" row |

Write the level in PLAN.md's "পুরো ভিডিও জুড়ে" line in Bengali (for example: "ঝাপসা: বেসিক, নাম, ইমেইল, ছবি, টাকা-পাসওয়ার্ড") so he sees it at the plan gate.
A level he picks for one video is for that video only. Use it as the default for later videos only if he says "সবসময়" (always).

## The levels

**Always, at every level (even `off`):** passwords, API keys and tokens, OTP codes, card, bank and bKash/Nagad numbers, balances, QR codes that log in or pay.

**basic (default):**
- His full name and his email anywhere: greetings like "Good evening, <name>", account chips, profile rows, breadcrumbs like `C:\Users\<name>`, OneDrive "<name> - Personal".
- Phone numbers and street addresses.
- Profile photos and face badges: Chrome profile badges on the taskbar, avatars.
- Other people's names, photos and message text: WhatsApp, Messenger and email previews, notification toasts.
- Faces of anyone but him.

**strict adds:**
- File and folder names that are his own: the Downloads list, Desktop labels, Quick-access pins, picker dialogs, recent files.
- Chat and project titles in app sidebars.
- Thumbnails that show content.
- Unread badges.
- App logos (needed for Meta ads, see screen-promo §4b).

**Never blurred, at any level:**
- What the tutorial is about: the files it downloads, renames and moves, and its project folder.
- System names: Desktop, Downloads, This PC, app names.
- Dates, sizes and column headers.

Not harmful, so not blurred at basic (he decided this on 2026-10-29): file names like `CapCut_Pro_*`, `Gemini_Generated_Image_*`, `New Text Document`. Platforms do not restrict a video for them. If a file name itself carries basic-level data (a person's name, a phone number, a client's private matter), blur it as basic.

## Do it in ONE pass, before the first full render

The claude-video-tutorial took three 2-hour renders because privacy spots were found after each render.

1. **Find every spot first.** Make `node tools/contact-sheet.mjs <source> --every=0.5` over the whole recording and list every window that can show private data. Look closely around windows that open or close, because the surprises live there.
2. **Measure the boxes.**
   - `tools/screen/text-scan.mjs` (`--at`, `--find`) gives frame-exact runs.
   - A box is static: start a new box when the list scrolls, a row is added, or the window moves.
   - Give each box about 6 px of margin.
   - Times are source seconds on the frame grid. Put each boundary at a half-frame midpoint, for example 294.108 between frames 294.100 and 294.117.
3. **Burn the blurs in.**
   - For a single cut: `cut.mjs --blur`.
   - For a project like claude-video-tutorial: the `specs.json` blurs that `tools/tutorial/screen.mjs` burns in. That file uses one split for all boxes, counts time from the frame-rounded seek, and uses sigma 22. Use sigma 60 on large text.
4. **Prove it before rendering.**
   - Run `text-scan.mjs --find=… --leaks` on the blurred clip; it must show 0 sharp frames.
   - Pull frames of the blurred clip at every spot, at full size.
   - Snapshot the page (`hyperframes snapshot --at …`) at the risky moments.
5. **Only then render.** If a basic-level leak shows up later, fix it and re-render. If only a strict-level item shows up and he did not ask for strict, tell him and do not re-render.

## Traps found on 2026-10-29 (claude-video-tutorial)

- **Other layers of the same source are not blurred.**
  - The outro's facecam was cropped from the same recording, and its first 9 frames still showed the unblurred taskbar. Check every clip cut from the source (intro, outro, posters, last-frame images).
  - Hold such frames on the first clean frame.
- **The dot-folders in a picker dialog's home view** (`.agents`, `.claude` …). This view sat behind a freeze, so it stayed on screen for 1.4 s.
- **Windows tooltips:**
  - A drag shows "Move to <folder>" with the folder's real name.
  - Hovering a truncated Quick-access pin shows its full name past the old box.
- **Aero Peek desktop frames:** a fast window switch flashes the desktop for a few frames. Check every frame there.
- **Boxes over windows that move:**
  - A box over an account chip smudges the window that opens on top of it. Narrow the box to the part that stays visible.
  - A box that runs a few frames past a cut smudges the next app.
- **A frozen frame keeps the blurs of its own time.** `freezeframes` takes the replacement from the already-blurred stream, so nothing extra is needed. A hold piece is blurred at its own source time.
