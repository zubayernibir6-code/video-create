# Auto-tutorial system (style family AT): plan, 2026-11-01

A tutorial without a human screen recording. Claude explores the software once and writes the click path as data.
A robot replays it in a real Chrome and saves every screen state at 2× sharpness, with the exact box of every element.
A composer then builds the video around those states: cursor, camera, captions, his face or cloned voice, music.

## আপনার জন্য সারাংশ (সহজ বাংলায়)

- **কী হবে:**
  1. আপনি শুধু বিষয় বলবেন। যেমন: "Claude-এ স্কিল কীভাবে বানায়"।
  2. Claude স্ক্রিপ্ট আর ধাপের তালিকা লিখবে, প্ল্যান দেখাবে।
  3. আপনি OK দিলে রোবট নিজে সফটওয়্যারটা খুলবে, ক্লিক আর টাইপ করবে, প্রতিটা ধাপের ঝকঝকে ছবি তুলবে।
  4. আপনি ফোনে স্ক্রিপ্ট পড়ে মুখ রেকর্ড করবেন, অথবা কিছুই করবেন না (তখন আপনার ক্লোন গলা)।
  5. Claude সব জোড়া দিয়ে পুরো ভিডিও বানাবে, সব প্ল্যাটফর্মের কপিসহ।
- **আপনার কাজ:** প্ল্যান দেখে OK দেওয়া, ফোনে পড়া (চাইলে), শেষে দেখে মতামত দেওয়া। স্ক্রিন রেকর্ডিং কখনো নয়।
- **কেন মান ভালো হবে:**
  - রোবট জানে প্রতিটা বোতাম ঠিক কোথায়, তাই জুম, তীর আর ঝাপসা নিখুঁত জায়গায় বসে।
  - ছবি দ্বিগুণ রেজোলিউশনে ওঠে, তাই জুম করলেও লেখা ঝাপসা হয় না।
  - কার্সর মসৃণ বাঁকা পথে চলে, আর ক্লিক ঠিক সেই শব্দে পড়ে যেটা বলা হচ্ছে।
  - সফটওয়্যার বদলে গেলে শুধু রোবটটা আবার চালালেই নতুন ছবি পাওয়া যায়।
- **যেখানে রোবট চলবে না:** claude.ai, ChatGPT, Facebook, Canva-র মতো লগইন-করা সাইট। ওদের নিয়মে স্ক্রিপ্ট বা বট দিয়ে চালানো নিষেধ।
  সেখানে চলবে **সহায়ক মোড**: আপনি নিজে ৫–১০টা ক্লিক করবেন, কোনো রেকর্ডিং লাগবে না, আর যন্ত্র নিজে ছবি ও মাপ তুলে নেবে।
  খোলা ওয়েবসাইট, ডকুমেন্টেশন, আপনার নিজের সাইট আর Claude Code (টার্মিনাল) রোবট নিজেই চালাতে পারে।
- **স্টাইলের নাম:** প্রথমটা **AT1 স্টুডিও জানালা** (আজকের প্রমাণ-ভিডিও)। পরিকল্পনায় আছে AT2–AT5 (নিচে §৫)।
- **ধাপ ১ শেষ (২০২৬-১১-০১):** আপনার ক্লোন গলা পুরো স্ক্রিপ্টে একটাই অনুরোধে (খরচ প্রায় আধা সেন্ট)। ক্লিক পড়ে ঠিক বলা শব্দে।
  শুরুতে ফলাফল দেখিয়ে রিওয়াইন্ড। মুখ রেকর্ডের জন্য টেলিপ্রম্পটার পাতা (`teleprompter.html`)।

---

## 1. Proven today (projects/autotut-proof)

- `tools/autocap/capture.mjs`: Puppeteer from the pinned HyperFrames install plus the installed Google Chrome 156 (headless).
  No new package. On code.claude.com/docs it ran 5 steps (open, click Search, type "skills", open the result, click a
  table-of-contents link) and saved 17 states as 2880×1620 PNGs in 44.6 s. Each click/type element box came from the DOM.
  The mark's text box came from a Range (the heading's element box was 688 px; its text is 194 px).
- `tools/autocap/compose.mjs` wrote the 26.5-s page and mix.wav. It used `buildMix` (promo-mix.mjs) for the mix and the
  reading-pace estimate for timing, because there was no voice.
  - `hyperframes check` passed.
  - Snapshots showed the text sharp at 2× zoom, the nav dip clean, and the gold highlight on the heading.
- Two traps found and fixed in the code:
  - Caption cross-fades blended two texts (check: content_overlap). Now the old caption leaves before the new one rises.
  - A 0.3-s cross-fade on page change showed a double page. Now it dips through dark like a real page load.
- **Source trap:** the Gemini TTS key is Tier 1, which allows 100 requests a day across all videos. The GitHub series
  had used them all, so the cloned voice could not be made today (HTTP 429, "retry in 2h10m").
  - Lesson: send one request per section, never one per line.
  - Find each line's start by aligning the script to the ASR words (`tools/reel/align.mjs`). Phase 1 builds this.

**Phase 1, done the same day (his cloned voice, the hook, the teleprompter):**
- `tools/clone/gemini.mjs say` with ONE free-text delivery tag and no `[pause]` lines = one block = one request:
  21.6 s of talha-a for $0.0049. The Bengali ASR heard every word, the English UI words too (ক্লড কোড ডক্স, সার্চ, স্কিলস).
- `tools/autocap/voice-times.mjs` turns that one file into line and anchor times (chunked ASR → align.mjs → audio-level
  line ends; guards in its header). The transcriber's word end runs on to the next word's start, so the sound decides
  where a line ends and where it may be cut.
- `compose.mjs`: lines keep the voice's own pauses and wait while the screen is busy (none had to wait in the proof).
  The hook opens on the finished state with the gold frame and a "শেষে এখানে পৌঁছাব" chip under it, then rewinds
  through 6 captured states on "চলুন" (2.78–3.40 s). `--voice=<file>` tries another take; `--min-match` only for tests.
- `plan.mjs` writes PLAN.md from the data (plan-check clean). `teleprompter.mjs [--check]` makes and tests the page.
- Proof render: `renders/autotut-proof/2026-11-01_1259/` (23.7 s, his voice): check, design-lint and every QC line
  passed (−14 LUFS, −1.5 dBTP); 184 s through finish.mjs, of which the render was 99 s.

## 2. Research (two research passes on 2026-11-01; sources kept in this section)

- **Capture approach.** The best quality comes from still states, not video. Arcade, Tango, Scribe and Supademo all
  capture one screenshot per click, at 2×. Playwright `recordVideo` has a fixed lossy encode (VP9 realtime, JPEG
  frames), so never use it as the final picture. CDP screencast has no fixed frame rate. Puppeteer 25.10's
  `page.record()` is MP4 only.
- **Products with no human at all:** Demosmith ($250/month, cloud agent); screencli and Screenwright (MIT). Screenwright
  turns Playwright tests into a narrated MP4 with a virtual clock. These confirm the approach. We keep our own because
  of HyperFrames, his Bengali voice and captions, and the variant system.
- **Explore once, replay forever:** no AI inside the capture loop. Runs repeat exactly, and only the exploration costs
  tokens. Claude's docs warn that it sometimes acts as if an action succeeded without checking. The capture guards
  check every step instead.
- **Cursor:** a Bezier path with Fitts-law timing (ghost-cursor's model). The composer draws it, so it is not burned
  into the frames.
- **Waits:** `networkidle` alone is discouraged. We also wait for a quiet DOM, no running animations and no scroll
  movement. Next: element stability (the same box over 2 frames) before each click.
- **Desktop apps (later):** element boxes from UI Automation in a DPI-aware process (FlaUI / pywinauto). Window frames
  from FFmpeg `gfxcapture` (Windows.Graphics.Capture, present in our FFmpeg 9.0.2; cursor off).
- **Terminal (later):** VHS is unreliable on native Windows. Draw the terminal in the composer from real recorded output.
- **Rules, verified:**
  - Anthropic Consumer Terms (8 Oct 2025, §3.7) forbid accessing claude.ai through "automated or non-human means". The
    only exceptions are an API key or explicit permission.
  - Scripting the Claude Code CLI is documented (`claude -p`).
  - The Usage Policy (from 12 Nov 2026) forbids getting around other platforms' terms.
  - OpenAI and Meta forbid bots. Canva forbids scraping. Google forbids only access that ignores robots.txt.
  - Brand: never imply that Anthropic endorses the video. No Claude logo in his channel branding.
- **Phone recording, for the teleprompter sheet:**
  - 4K 30 fps, HDR off, Auto FPS off, lens and white balance locked.
  - Shutter 1/50 or 1/100 s under 50 Hz mains lights. The free Blackmagic Camera app can lock it.
  - A cheap lav mic, a window light at 30–45°, the fan off.
  - A browser teleprompter on the laptop right behind the phone.
  - Keep rolling and repeat a fumbled sentence; the transcript cut keeps the last good take.

## 3. Architecture

```
topic ──► Claude explores the app (built-in browser / explore.mjs) ──► demo.json  (steps + the line said in each)
                                                                     │
          PLAN.md (plan gate, plan-check) ◄──────────────────────────┤
                                                                     ▼
          capture.mjs (robot, deterministic) ──► capture/ states + capture.json (boxes, URLs, scroll, marks)
                                                                     │
 timing source (best first):                                         ▼
   A. his phone video  → voice.mjs clean → transcribe → align to script lines ┐
   B. cloned voice     → ONE gemini request per section → transcribe → align  ├─► line + anchor-word times
   C. silent preview   → reading-pace estimate (approve visuals for free)      ┘
                                                                     ▼
          compose.mjs + a style preset (AT1…) ──► index.html + mix.wav ──► preflight (> 60 s) ──► finish.mjs ──► release-kit
```

- **Data only in the project:** `demo.json` (+ the phone video, if any). Decisions stay in code: camera, timing,
  layout, sound. So a cheaper model can make one by filling in `demo.json`.
- **Word-anchored actions:** each step names the `anchor` word in its line. The click lands on that word, the
  cursor arrives 0.16 s before it, and the camera starts drifting while the line is said.
- **Camera:** each step uses the demo `view`, or else 900 px around the target. Zoom is capped at 2× (pixel-sharp from
  the 2× capture). The camera returns to the whole page at the end. Moves never overlap.
- **Transitions:**
  - Same page: a 0.14-s fade.
  - New page: a dip through dark.
  - Jump down the page: a slide. Phase 3 replaces it with a real scroll of a stitched strip.
- **Privacy (phase 3):**
  - The robot reads the DOM, so emails, phone numbers and names come with exact boxes. No OCR.
  - Blur boxes go into capture.json.
  - The level follows the `privacy-blur` skill: basic by default.
- **Face (phase 2):** the phone video is cleaned, cut and placed by the style: a bubble (AT1), a tall glass card
  (AT2), full screen for the intro and outro (AT3), or the bottom half (AT4). His habit is vertical recording, which
  fits all four.

## 4. Where the robot may go

| Target | Mode |
| --- | --- |
| Public sites and docs (robots.txt respected), his own sites and apps, local apps, Claude Code CLI | Robot (auto) |
| Logged-in consumer apps whose terms forbid bots: claude.ai, ChatGPT, Facebook/Instagram, Canva | Assist mode: he clicks, the system captures states and boxes; or written permission from the company |
| Any CAPTCHA / "verify you are human" page | capture.mjs stops (never bypassed) |

He always logs in himself. Claude never types a password.

## 5. Named variations (the variant system: VARIANTS.md + tools/variants.json)

| Code | Name | Look | Status |
| --- | --- | --- | --- |
| AT1 | স্টুডিও জানালা (Studio Window) | Opens on the result and rewinds; dark canvas, browser window with the live address, smart camera, step-numbered captions, gold highlight; face in a round bubble | beta: proof 2026-11-01 with his cloned voice and the hook (no face yet) |
| AT2 | পাশাপাশি ডেস্ক (Side Desk) | His face in a tall glass card on the left third, the window on the right; finished steps tick off under his face | planned |
| AT3 | ফুল জুম (Full Zoom) | Screen edge to edge, deep zooms and fast cuts; face full screen in the intro and outro, a small pill during steps | planned |
| AT4 | খাড়া স্ট্যাক (Vertical Stack) | 9:16: the screen on top (the site's own mobile layout when it has one), face below, word-by-word captions, Reels safe zone | planned |
| AT5 | ধাপ কার্ড (Step Cards) | A big numbered card before each step; the button to press is cut from the 2× capture and enlarged | planned |

**Variation lab (phase 4).** A variation is a preset over axes, each value proven on its own:
- layout (AT1–AT5)
- camera (calm, punchy, documentary)
- cursor (macOS, Windows, large with glow)
- transition (dip, slide, cut)
- captions (pill, word-by-word, kinetic)
- palette (dark gold, light paper, his brand)
- sound pack
- music mood

A new combination gets a code and a Bengali name, a 10-s proof clip, design-lint and preflight checks, and then a line
in both variant files. Then he can call it by its code.

## 6. Phases (one step at a time, his OK between steps)

0. **Done today:** research, the robot, the composer seed, and the silent AT1 proof.
1. **Voice (done 2026-11-01, see §1):**
   - The cloned voice in one request plus alignment (no per-line requests).
   - The anchor word found in the ASR words.
   - The same proof clip, voiced.
   - A teleprompter page (big Bengali lines, one tap per line) for phone takes.
   - **Flash-forward hook:** open on the finished result (the last step's highlighted mark) for 2 s, then cut back to
     the start. This answers STYLE §৫ ("result in the first 2 s"). The proof's first 8 s were a still page.
2. **Face:**
   - Teleprompter → his phone take → keep the last good take of each line → clean, transcribe, align.
   - The face bubble or card in AT1/AT2.
   - Then the first real 60–90-s tutorial on a topic he picks.
3. **Robot hardening:**
   - `explore.mjs` lists clickable elements, so a cheap model can choose targets.
   - Element stability before a click; real smooth scrolling from stitched strips.
   - Menus that pop out of their own crop; a drawn text caret.
   - Cookie banners declined; a persistent profile he logs into himself.
   - DOM privacy boxes; a camera derived from before/after pixel change; `--check` for demo.json.
4. **Styles AT2–AT5 and 9:16, the variation lab, and the skill `auto-tutorial`:**
   - The skill is a fill-in recipe; the model writes demo.json only.
   - Proved by a Sonnet run, per [[cheap-model-ready-skills]].
5. **New surfaces:**
   - Claude Code terminal sessions drawn from real output.
   - Windows desktop apps (UI Automation and gfxcapture).
   - Assist mode for sites that forbid bots.
6. **Release:** release-kit and post-copy after every AT video. AT4 is already the universal Reel shape.

## 7. Costs and limits

- Robot capture: free, about 9 s per step on this laptop.
- Render: the 26.5-s proof took 231 s through finish.mjs. That includes the check, design-lint, 794 frames,
  loudness and QC. Every QC line passed.
- Cloned voice: about $0.014 a minute (the proof: 21.6 s for $0.0049). The Tier-1 quota of **100 TTS requests a
  day** is the real limit, so batch the requests: a whole tutorial script up to ~600 characters is one request.
- ASR of the voice: 2.5 min for 22 s on this laptop (mostly loading the model); compose.mjs reuses the words file
  until the voice changes.
- Lyria BGM: $0.08 a song. Older BGMs can be reused.
- RAM: about 3 GB free. Run capture, ASR and render one after another, never together.
