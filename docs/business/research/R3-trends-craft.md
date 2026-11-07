# R3 — What "top-tier" motion graphics means, in numbers (research report)

Date written: 2026-11-07. Author: research lead (Claude). Method: about 35 web searches and page fetches on 2026-11-07.

## How to read this report

- **[FACT]** = read from a primary or near-primary source (design-system repo, official page, platform spec). Source URL given.
- **[SECONDARY]** = repeated by blogs, vendors or mirrors; I could not confirm it at the primary source. Use as a starting point, test it.
- **[OPINION/TREND]** = a forecast, a vendor claim, or my own judgement. Marked so it is never mistaken for fact.
- **[OURS]** = a number I propose for our engine. It is a design decision, not a finding.

**Honest limits.** The search tool returned thin results for the studio questions (section 2) and the editorial-graphics questions (section 3). Nobody publishes cuts-per-second or shot-length data for Linear, Stripe, Vercel, Apple launch films, etc. I did not find any, and I did not invent any. Where a number for those is needed I give an [OURS] number and a **measurement recipe** (ffmpeg scene detection on the real video) so the engine's targets can be calibrated from the actual films instead of from my guess. Section 2 is therefore mostly a technique inventory with confidence labels, not a measured table.

---

## 1. Official motion guidelines with numbers

### 1.1 Comparison table

| System | Duration scale | Easing / curves | Spring / physics | Style split | Source (date) |
|---|---|---|---|---|---|
| **Material 3** (token set `md.sys.motion`) | 16 tokens: short1-4 = 50/100/150/200 ms; medium1-4 = 250/300/350/400; long1-4 = 450/500/550/600; extra-long1-4 = 700/800/900/1000 ms | standard (0.2,0,0,1); standard-accel (0.3,0,1,1); standard-decel (0,0,0,1); emphasized (0.2,0,0,1); emphasized-accel (0.3,0,0.8,0.15); emphasized-decel (0.05,0.7,0.1,1); legacy (0.4,0,0.2,1); linear (0,0,1,1) | see M3 Expressive row | none (one scale) | [FACT] https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-sys-motion.scss (token file, read 2026-11-07, undated) |
| **Material 3 Expressive** (announced Google I/O 2025) | Springs replace durations for movement ("spatial"); durations/easing stay for opacity and colour ("effects") | n/a for spatial | Expressive spatial: default damping 0.8 / stiffness 380; fast 0.6 / 800; slow 0.8 / 200. Effects (all damping 1.0): default 1600; fast 3800; slow 800. **Standard** scheme spatial: default 0.9 / 700; fast 0.9 / 1400; slow 0.9 / 300 | spatial vs effects, each fast/default/slow | [FACT] AOSP `ExpressiveMotionTokens.kt` and `StandardMotionTokens.kt` (androidx, copyright 2024): https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ExpressiveMotionTokens.kt and .../StandardMotionTokens.kt (read 2026-11-07) |
| **IBM Carbon** | 6 tokens: fast-01 70 ms, fast-02 110, moderate-01 150, moderate-02 240, slow-01 400, slow-02 700 ms. Duration scales with distance/size (non-linear scale) | Productive: standard (0.2,0,0.38,0.9), entrance (0,0,0.38,0.9), exit (0.2,0,1,0.9). Expressive: standard (0.4,0.14,0.3,1), entrance (0,0,0.3,1), exit (0.4,0.14,1,1) | none | **productive** (task-focused, fast, subtle) vs **expressive** (occasional, important moments, slower) | [FACT] https://carbondesignsystem.com/elements/motion/overview/ (page "last updated Aug 12, 2026", fetched 2026-11-07) |
| **Microsoft Fluent 2** | The Fluent 2 web page gives **no ms values** (only "larger elements get more time"). The Fluent UI v9 token package gives 8: 50 / 100 / 150 / 200 / 250 / 300 / 400 / 500 ms (UltraFast ... UltraSlow) | Curves: decelerate-min (0.33,0,0.1,1); decelerate-mid (0,0,0,1); decelerate-max (0.1,0.9,0.2,1); accelerate-min (0.8,0,0.78,1); accelerate-mid (1,0,1,1); accelerate-max (0.9,0.1,1,0.2); easy-ease (0.33,0,0.67,1); easy-ease-max (0.8,0,0.2,1); linear | none | principles: functional, natural, consistent, appealing | [FACT] https://fluent2.microsoft.design/motion (principles, no numbers) and https://raw.githubusercontent.com/microsoft/fluentui/master/packages/tokens/src/global/durations.ts and .../curves.ts (read 2026-11-07, repo master, undated) |
| **Apple HIG — Motion** | **No numbers.** Only: games should hold 30-60 fps; avoid sustained oscillation near 0.2 Hz (visionOS) | none published | none published | rules: purposeful, optional, brief and precise feedback, do not make people wait, avoid motion on frequent interactions | [FACT] https://developer.apple.com/design/human-interface-guidelines/motion.md (change log: "September 9, 2025: Added guidance for Liquid Glass"; fetched 2026-11-07) |
| **Apple Liquid Glass** (WWDC25, June 2025) | **No numbers** in the session | none published | none published | qualitative, see 1.2 | [FACT] https://developer.apple.com/videos/play/wwdc2025/219/ (fetched 2026-11-07) |

Read-across (for the engine) [OURS, derived from the table]:
- Every system keeps **UI micro motion between 50 and 700 ms**. Material tops out at 1000 ms, Carbon at 700 ms, Fluent v9 at 500 ms. Nothing in a product UI is ever slower than 1 s.
- Every system ships an **ease-out-style curve as the default** (Material standard (0.2,0,0,1); Carbon productive (0.2,0,0.38,0.9); Fluent decelerate-mid (0,0,0,1)). Entrances use a decelerate curve, exits use an accelerate curve (M3 and Carbon both have separate entrance/exit or accel/decel curves).
- **Duration grows with distance/size** is stated by Carbon (explicit) and Fluent (qualitative).
- The 2025 shift (M3 Expressive) is from "duration + curve" to **spring physics for movement**, with plain duration/curve kept for opacity and colour. Springs with damping 0.6 overshoot visibly (the "bouncy" expressive feel); damping 0.8-0.9 barely overshoot; effects springs are critically damped (1.0, no overshoot).

Caveat: the M3 official site m3.material.io could not be read (JavaScript page). The M3 duration and easing numbers above are from the material-web token file, which is Google's own repository. The M3 Expressive spring numbers are from the Android source. The M3 site's own "emphasized" definition differs by version: in the v0_192 token file `easing-emphasized` equals `easing-standard` (0.2,0,0,1) and the more dramatic curve is `emphasized-decelerate` (0.05,0.7,0.1,1). Third-party libraries disagree on this (search results 2026-11-07), so we should use the explicit decelerate/accelerate tokens.

### 1.2 Liquid Glass in motion (what it looks like)

[FACT] from Apple WWDC25 session 219, https://developer.apple.com/videos/play/wwdc2025/219/ (fetched 2026-11-07):
- Lensing is its primary visual definition: it "bends, shapes and concentrates light in real time", rather than scattering it like older blur materials.
- It **does not fade in or out**: it materialises "by gradually modulating the light bending and lensing".
- It **morphs** between controls as context changes, keeping one floating plane; menus "pop open" from the triggering control.
- On touch it flexes, and a glow starts under the fingertip, spreads through the element and into neighbouring glass.
- Larger glass simulates thicker material: deeper shadows, stronger lensing/refraction, softer light scatter.
- Specular highlights move across the glass during interactions and sometimes respond to device motion.
- Reduce Motion: reduces some effect intensity and disables the elastic properties.
- HIG (Sep 2025): on touch it responds with more emphasis, with a trackpad more subdued. https://developer.apple.com/design/human-interface-guidelines/motion.md

What this means for a code-built engine [OPINION]: a glass panel should (a) never opacity-fade, (b) morph size/radius from one shape to the next, (c) carry a moving specular highlight, (d) gain shadow depth as it grows. In WebGL this is a refraction shader over the backdrop texture; in CSS it is approximated with `backdrop-filter` blur + saturate + a gradient highlight layer (no true lensing).

### 1.3 Other numeric motion sources

| Claim | Number | Label | Source |
|---|---|---|---|
| UI animation sweet spot | ~100 ms tiny effects, 200-300 ms small elements, 400-500 ms large/bouncy | [SECONDARY] (design blogs citing NN/g; I could not read nngroup.com) | https://teranya.github.io/uimotionref/ , https://valhead.com/?p=2978 (fetched via search 2026-11-07) |
| Bounce/elastic easing duration | 800-1,200 ms, use sparingly | [SECONDARY] | web.dev "choosing the right easing" https://web.dev/articles/choosing-the-right-easing |
| Stagger for grouped items | 5-10 frames | [SECONDARY] single skill page | https://skills.sh/ncklrs/startup-os-skills/motion-designer |
| Flashing limit | no more than 3 flashes in any 1 s (WCAG 2.3.1, Level A); WCAG 2.3.3 (AAA) lets users turn off interaction-triggered motion | [FACT] (WCAG; verified via secondary summaries, not the W3C text) | https://www.a11y-collective.com/blog/wcag-animation/ |

---

## 2. How the best studios and brands make SaaS/tech launch and product videos

### 2.1 What I could and could not verify

| Item | Result of searches (2026-11-07) |
|---|---|
| Linear, Vercel Ship, Notion, Figma Config, Framer, Arc, Raycast, Airbnb, Duolingo, Google I/O: making-of or technique breakdowns | **Nothing authoritative found.** No source gives their length, cut rate, music or SFX approach. |
| Studios: Buck, Ordinary Folk, Giant Ant, Oddfellows, Gunner, Vucko, Hype Motion, Wonder Studio, Jitter, Rive showcase | Only ManvsMachine surfaced (see below). |
| Apple launch films: shot length / cut rate | **Not published.** Only how-to guidance and ad-trade write-ups. |
| Stripe | Stripe hires for a **motion design system**: principles, timing tokens, animation guidelines, reusable motion components [FACT: Stripe job post, https://stripe.com/jobs/search?gh_jid=8265389 via search]. Stripe's look: ice-white canvas, violet, sweeping aurora/mesh gradients [SECONDARY: https://styles.refero.design/style/48e5de76-05d5-4c4e-a269-c7c245b291ec]. Sessions 2025 ran May 6-8, 2025 https://stripe.com/blog/stripe-sessions-is-back-on-may-6-2025 |
| ManvsMachine | Mixed-media 2D/3D film for Affinity won Red Dot Best of the Best 2026 [SECONDARY: https://www.red-dot.org/siegerprofile/manvsmachine/2026]; GM Ultium Home film used stylised thermography and x-ray imagery [SECONDARY: https://www.stashmedia.tv/tag/manvsmachine/]. |

**Do not cite the technique lists below as measured facts.** They are the standard vocabulary of this genre, which I know from the field but could not tie to a dated source per brand. They are [OPINION/TREND] unless a source is shown.

### 2.2 Launch-video benchmarks that do exist (vendor data, treat as directional)

| Finding | Number | Label | Source (date) |
|---|---|---|---|
| Launch videos on X: median views, share passing 100k / 1M | 28,258 median; 30.6% > 100k; 7.9% > 1M (n = 1,173 launches, 12 months to June 2026) | [SECONDARY] vendor (Flowjam sells launch videos) | https://www.flowjam.com/blog/state-of-launch-videos-2026 (updated 2026-06-04) |
| Founder-led share | 48% overall; about 80% of the top decile | [SECONDARY] vendor | same |
| "One product, one outcome, one promise", face in the first 5 s | qualitative | [SECONDARY] vendor | same |
| Top-15 launch videos run 30-90 s (12 of 15) | 12/15 | [SECONDARY] vendor | https://www.flowjam.com/blog/product-launch-video-examples-2026 (updated 2026-06-05) |
| Most-viewed launch on X in 2026: Anthropic computer-use, 77.7M views, unedited real task run, no motion graphics | 77.7M | [SECONDARY] vendor | same |
| Thinking Machines Lab launch: abstract motion + manifesto voiceover, 6.6M views | 6.6M | [SECONDARY] vendor | same |
| Hook 3-5 s; teaser 15-30 s; explainer 45-90 s; under-60 s videos get "2.5x engagement per impression (Wyzowl 2024)" | as stated | [SECONDARY] promotional piece, stats uncited or 2023-24 | https://www.atomikgrowth.com/blog/best-saas-product-launch-videos-of-2026-with-actionable-tips-real-examples (2026-05-17) |
| Typical SaaS launch video | 30-60 s; 15-30 s teasers | [SECONDARY] several vendor blogs agree | https://www.flowjam.com/blog/saas-launch-video , https://www.moonb.io/blog/perfect-demo-video |

Important reading of the above [OPINION]: the **highest-viewed launches are not the most designed ones**. A real product doing a real task (computer use), or a founder with a plain promise, beats polish on X. Motion graphics win where the product cannot be filmed (abstract AI, finance, data) or where the brand IS the product (Stripe, Linear). This tells our engine to treat **proof of the product (real UI, real output) as the hero, and graphics as the frame around it**.

### 2.3 Technique inventory by archetype [OPINION/TREND, from industry knowledge; not per-brand verified]

| Archetype | Typical techniques | Typical length | Pace (our target, see measurement recipe) | Sound |
|---|---|---|---|---|
| **Product-launch film (Linear / Vercel / Stripe style)** | Dark or ice-white canvas; real UI in a slightly tilted 3D plane that settles to flat; cursor-driven demo; light sweep across a card; thin-line borders; bento grid reveal; kinetic type for 3-6 words at a time; match-cut between feature and next scene; one accent colour/gradient | 30-90 s main, 15-30 s cut-down | slow-confident: 1 scene per 2-4 s, 10-25 visual events/min | minimal electronic bed, soft UI ticks, low whooshes, one low hit on the logo |
| **Apple-style product reveal** | Macro product shots, slow camera orbit, rim light sweep, reflections, restrained type, one idea per shot | 60-120 s | few cuts, long holds, but each shot has continuous internal motion | piano/ambient or restrained electronic, foley-real sounds, silence before reveal |
| **Mixed-media studio film (ManvsMachine, Buck type)** | 2D+3D hybrid, material shaders, stylised imaging, match cuts, hard rhythmic edits | 30-90 s | fast, beat-locked cuts | music-led, designed whooshes/impacts |
| **Explainer / educational (Kurzgesagt type)** | Flat vector characters, saturated palette, every element animated by hand, voice sets the timing | 6-12 min | animation changes with each phrase | voice + music bed + light SFX |
| **Founder / AI-agent demo** | Real screen capture, cursor and keystrokes visible, captions, zero decoration | 30-90 s | follows the task, speed-ramped waiting | none or quiet bed |

Kurzgesagt facts that were verified: a video takes about 1,200 hours; research, script, voice first, then animation timed to the voice; most illustrations drawn from scratch and split into parts; After Effects (some Cinema 4D). Sources: https://kurzgesagt.org/youtube/ , https://rosetta.to/u/kurzgesagt/how-to-make-a-kurzgesagt-video-in-1200-hours [SECONDARY, summaries of the team's own video].

### 2.4 Measurement recipe to replace guesses with data [OURS, run once]

For each reference film we own or may study (store under `assets/refs/`):
1. `ffmpeg -i ref.mp4 -vf "select='gt(scene,0.30)',showinfo" -f null -` gives hard-cut times. Cuts per second = count / duration. Average shot length (ASL) = duration / (count + 1).
2. `tools/ref-analyze.mjs` already measures LUFS, BPM, silences: add ASL and "visual events per minute" (any element start, from a 2 fps frame-difference > 3% region).
3. Record, per film: length, ASL, LUFS, BPM, share of time silent. Put the table in `assets/refs/<name>.analysis.md`. After 10 films, replace the [OURS] pace numbers in section 8 with the measured median.

---

## 3. Data and editorial motion

### 3.1 Verified material

| Practice | Number / rule | Label | Source |
|---|---|---|---|
| Economist-style charts: show the data directly, cut clutter, give context through comparisons and annotations; titles and annotations work as headlines carrying the insight | qualitative | [SECONDARY] commentary | https://thinkinsights.net/insights/data-visualization-economist , https://www.thedataschool.co.uk/johann-shin/visual-storytelling-done-right-5-lessons-from-the-economist |
| Annotations short and near the data | about 50 characters (10-12 words), one sentence | [FACT] UK ONS service manual | https://service-manual.ons.gov.uk/data-visualisation/guidance/annotations |
| Annotations distinct by font size/weight, placed at the data point | qualitative | [SECONDARY] TASO guide | https://taso-he.github.io/technicalguide/data-vis/principles.html |
| Animated transitions between chart states improve graphical perception in controlled experiments (staging: keep object identity, move marks rather than cut) | study result, not a number we can code | [FACT] Heer and Robertson, InfoVis 2007 | https://vis.berkeley.edu/papers/animated_transitions/2007-AnimatedTransitions-InfoVis.pdf |
| Bloomberg Graphics: about 30 people in 4 cities, roughly 100 quick charts and 35 in-depth pieces a month (2019); in-house tool on D3 + Mapbox; job posts ask for visual hierarchy, colour theory, perception | as stated | [SECONDARY] Digiday 2019, Bloomberg job post | https://digiday.com/media/inside-bloombergs-30-person-international-data-journalism-team/ |
| Johnny Harris / Vox-style maps: After Effects with layered country outlines from Illustrator (free route) or the GEOlayers plugin (paid route); mask/shape-reveal of regions and scale to mimic a zoom | technique | [SECONDARY] summaries; aescripts post by Harris https://aescripts.com/learn/making-maps-for-johnny-harris---volcanoes/ | |

### 3.2 What the sources imply for our engine [OPINION, derived]

- One chart = one message; the **headline states the conclusion**, not the topic.
- The highlighted series gets the one accent colour; all others go to a neutral tone (the Economist "bold colour on the story, grey on the rest" habit).
- Chart **animation re-uses the same marks** between states (bars grow, lines extend, dots move) so the eye keeps track; do not cut to a new chart.
- Annotations arrive **after** the mark they describe (the viewer sees the data first, then the label) and stay at most 50 characters.
- Maps: draw borders as strokes, reveal region fills with masks, zoom by scale of one parent group so labels and strokes stay in register.
- Gap in my research: Bloomberg Originals, Vox, NYT graphics-desk motion rules were **not** found as primary documents. Do not claim them as sourced.

---

## 4. Sound design for motion graphics

### 4.1 Loudness targets

| Target | Number | Label | Source |
|---|---|---|---|
| YouTube | about -14 LUFS integrated, true peak -1 dBTP; louder content is turned down, quieter is not boosted | [SECONDARY] (several tool vendors agree; not read at YouTube's own help page) | https://www.forasoft.com/learn/audio-for-video/articles-audio/lufs-targets-per-platform-2026 (2026-06-05) |
| Instagram / TikTok | **No official figure.** Common practice: -14 LUFS; some sources say -14 to -16 | [SECONDARY] | https://openclip.app/learn/audio-normalization |
| EBU R128 (EU broadcast) | -23 LUFS +/-1 LU; true peak -1 dBTP | [FACT] | https://tech.ebu.ch/publications/r128s2 , https://en.wikipedia.org/wiki/EBU_R_128 |
| ATSC A/85 (US broadcast) | -24 LKFS +/-2; true peak -2 dBTP | [FACT] via ITU BS.2434 table | https://www.itu.int/dms_pub/itu-r/opb/rep/R-REP-BS.2434-2018-PDF-E.pdf |
| Netflix | about -27 LKFS dialogue-gated, peak -2 dBTP | [SECONDARY] unconfirmed | https://www.bookwriter.vip/loudness-target-by-platform |

Our house standard is already -14 LUFS (CLAUDE.md, tools/finish.mjs). Add: true peak <= -1 dBTP.

### 4.2 How pros sync SFX to motion

All of this is from sound-library and course material [SECONDARY / OPINION], consistent with each other:
- Treat music as the grid and SFX as punctuation; align the **hit frame** to the audio **transient**, and nudge picture by a few frames if it feels early or late. Source: https://cursa.app/en/page/audio-and-final-rhythm-using-sound-to-support-motion
- A whoosh must be as long as the move it covers and end when the picture settles; one that outlasts the transition feels wrong. A whoosh into a title or logo should end on an impact so the move "lands". Sources: https://sonilo.com/ai-music/whoosh-sound-effect-guide , https://pixflow.net/blog/enhancing-motion-graphics-with-cinematic-transition-sounds/
- A riser builds pitch, intensity or volume before a reveal; the reveal lands at the riser's peak or just after a short drop of silence. https://sounddesign.irpr.agency/glossary/riser/
- UI events get short quiet ticks; stagger grouped sounds 5-10 frames like the visuals.
- Apple HIG: do not rely on motion alone; pair with audio/haptics for important feedback. https://developer.apple.com/design/human-interface-guidelines/motion.md [FACT]

Already in our workspace and consistent with the above: SFX start = visual hit minus the file's silent lead-in (`lead_s`, `tools/sfx-leads.mjs`); clicks at 0.28-0.35 gain; no still picture with silence for more than 1.5 s (CLAUDE.md section 0d). I found nothing in the research that contradicts those rules.

### 4.3 When silence works [OPINION]
Silence before a reveal (a 0.3-0.8 s drop in music and SFX) makes the next hit louder in perception without raising any level. Apple-style films use it before the product appears. Our own rule "no dead air >= 1.5 s with a still picture" is compatible: silence is only allowed while something moves, or for under 1 s.

---

## 5. Trends in 2025-2026, with evidence quality

| Trend | Evidence | Label | Source (date) |
|---|---|---|---|
| **Liquid Glass / adaptive transparency** | Apple introduced it June 2025; HIG updated Sep 9, 2025. Commentators note it is an OS material, not a web standard, and caution against overuse | [FACT] origin; [OPINION] web adoption | https://developer.apple.com/design/human-interface-guidelines/motion.md ; https://pxlnv.com/linklog/hig-liquid-glass/ |
| **Immersive 3D / WebGL on award sites** | One firm counts 3D sites at 61% of H1 2026 Awwwards winners vs 41% (2025) and 23% (2024); Three.js leads. Awwwards Site of the Year 2025: Lando Norris (OFF+BRAND; Webflow, GSAP, WebGL) | [SECONDARY] one firm's dataset | https://digitalstrategyforce.com/journal/why-are-immersive-experiences-dominating-the-2026-awwwards/ ; https://www.hontran.dev/blog/best-award-winning-websites-2026 |
| **Kinetic typography, scroll-reactive type** | Consistently listed by trend roundups; one warns heavy parallax causes mobile jank | [OPINION/TREND] | https://graphicdesignjunction.com/2026/01/video-and-motion-creative-trends-2026/ |
| **Grain / texture / "human" imperfection** as a reaction to AI polish | Trend blogs say grain, scratches, VHS look signal authenticity | [OPINION/TREND] | https://designcloud.app/blog/graphic-design-trends |
| **Brutalist type** | Canva report cited: searches for brutalist design and type posters up 77% year on year | [SECONDARY] (Canva number via a roundup) | https://designcloud.app/blog/graphic-design-trends |
| **Retro-futurism (Y2K chrome, neon) and zine/grunge** | Two strands, per Design Cloud | [OPINION/TREND] | same |
| **Organic / inflated / wavy type, fluid shapes** | trend roundups | [OPINION/TREND] | https://www.designmonks.co/blog/typography-trends-2026 |
| **Adobe 2026 creative trends** | "human connection" and "surreal, sensory-driven design"; I could not read the report itself | [SECONDARY] | https://www.creativebloq.com/creative-inspiration/4-creative-trends-for-2026-according-to-adobe (headline only retrieved) |
| **AI in motion work** | Collision Awards 2025 survey: over 57% use AI to develop concepts; about 74% report higher demand for animation/design work in the past year | [SECONDARY] summary of a survey (no sample size) | https://www.stashmedia.tv/?p=111942 (2025-05-15) |
| **AI inside the motion-design industry** | School of Motion's year-end 2025 episode: 17 guests, AI as a "set of tools" | [SECONDARY] | https://schoolofmotion.com/blog/eoy2025 |
| **Interactive Lottie / Rive** | dotLottie now supports state machines (LottieFiles, late 2025); Rive stresses data binding to live data; Rive claims files 10-15x smaller than Lottie JSON | [SECONDARY] vendor claims | https://rive.app/blog/rive-as-a-lottie-alternative ; https://lottiefiles.com/blog/lottie-animations/lottiefiles-or-rive |
| **Programmatic / templated video** | Remotion reported at 39-40k+ GitHub stars (March 2026); one parameterised template renders a video per record | [SECONDARY] directories | https://thegtmdirectory.com/tools/remotion |
| **Vertical cut-downs, LinkedIn vertical** | "LinkedIn vertical 34% higher engagement" (LinkedIn 2023, cited by a vendor) | [SECONDARY] weak | atomikgrowth link in section 2.2 |

Not found, so not claimed: Motionographer trend pieces, Behance or Dribbble trend data for 2025-26, Jitter or Rive annual reports, a School of Motion "State of the Industry" numbers page.

---

## 6. Rising patterns a code-based studio can own (2026-2028) [OPINION unless sourced]

| Pattern | Why it fits a code studio | Evidence |
|---|---|---|
| **Data-driven variants** (one template, N records: per-customer, per-city, per-feature, A/B hooks) | Our engine is already data-in, video-out. Marginal cost of variant N is render time | Remotion and Plainly describe the pattern https://www.plainlyvideos.com/blog/how-marketing-teams-personalize-videos-at-scale ; [SECONDARY] |
| **AI-agent demo videos** (real agent run, cursor/keystrokes visible, captions, stripped chrome) | Top 2026 X launch (77.7M) was an unedited agent task. A code studio can add privacy blur, zoom-to-action, captions, loudness, aspect variants around real capture | Flowjam link in 2.2 [SECONDARY] |
| **Launch-video culture on X** (founder voice, one promise, fast turnaround, cut-downs) | Fast, cheap, repeatable. Flowjam prices median founder launch video at $3,000-$5,000 (vendor claim) | https://www.flowjam.com/blog/state-of-launch-videos-2026 [SECONDARY] |
| **Localization from one master** (text layers + voice per language, same timeline) | On-screen text is data, not pixels, so swapping it is free. Voice via TTS/clone. AI dubbing market described by vendors as moving to "repeatable production workflow" | https://www.vmeg.ai/blog/what-is-video-localization/ ; https://vitrina.ai/?p=141197 [SECONDARY]. Gap: nothing found on text-swap localization of motion graphics. Our Bengali work (Hind Siliguri, quoted font stacks) is already an edge for South Asian markets. |
| **Motion design systems for brands** (tokens for duration, easing, stagger, reusable components) | Stripe hires for exactly this; M3, Carbon, Fluent ship tokens. We can sell a brand "motion token pack" and generate all videos from it | Stripe job post [FACT]; section 1 |
| **Product-led onboarding videos** (in-app tours rendered from the live UI) | The capture-and-compose engine (`tools/autocap`) fits | OPINION, no source |
| **Dynamic ads** (price, name, offer in the frame, many sizes) | Same as data variants, with safe-zone checks per placement | OPINION; safe zones in section 7 |

Risk to note [OPINION]: if the market fills with AI-generated sameness, **crafted, deterministic, brand-exact output** is the differentiator. Several trend sources say the same ("crafted content stands out in the age of AI rush", https://blog.videobolt.net/post/top-motion-graphics-trends-2026).

---

## 7. Quality checklist a creative director uses (with numbers where sources give them)

| Criterion | What to check | Number / source | Label |
|---|---|---|---|
| **Hierarchy** | One focal element per beat; headline > support > furniture | Reader-critical text >= 28 px at 1080p; kickers >= 24 px (house rule, CLAUDE.md 0d) | [OURS] |
| **Reading time** | Text stays long enough to read **twice** | 0.3 s/word floor with 1.5-2 s minimum (OverseasOS https://www.overseeros.com/blog/how-long-should-on-screen-text-stay-youtube); BCAP/ASA 0.2 s/word + 2 s for captions of 9 words or fewer https://4xg9hcb4zvrzygb.productfruits.help/en/article/legal-supers-our-helpful-tools ; adult average 238 wpm, slow readers 50 wpm (WSDOT https://engage.wsdot.wa.gov/video-text-duration) | [SECONDARY] |
| **Subtitle limits** | 20 characters/s adult, 17 children; 42 characters/line; max 2 lines | [FACT] Netflix US English guide https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-Timed-Text-Style-Guide (fetched 2026-11-07) |
| **Subtitle minimum on-screen** | 5/6 s (20 frames at 24 fps) | [FACT] Netflix marketing-assets guide https://backlothelp.netflix.com/hc/en-us/articles/115000239632-Timed-Text-Style-Guide-Supplementals-Marketing-Assets |
| **Words per minute** | BBC 160-180 wpm; above 200 wpm hard to follow | [SECONDARY] https://clevercast.com/bbc-subtitling-guidelines ; BBC R&D via mirror |
| **Rhythm** | Beats on a grid; scene length varies; hold the hero shot | no sourced cut-rate; calibrate with section 2.4 | [OURS] |
| **Easing** | Entrances decelerate, exits accelerate, continuous motion linear; never default linear on UI | M3, Carbon, Fluent curves in section 1 | [FACT] |
| **Duration vs distance** | Bigger move = longer | Carbon statement | [FACT] |
| **Overlap / stagger** | Grouped items offset, not simultaneous | 5-10 frames (single source) | [SECONDARY] |
| **Staging / space** | Overlays beside targets, inside frame and safe area | Meta Reels ad zone used by us: top 14%, bottom 35%, sides 6% (house STYLE/CLAUDE.md; **could not be confirmed** at Meta by this research). YouTube Shorts ad zone (via third-party sites): top 288 px, bottom 672 px, left 48 px, right 192 px of 1080x1920 https://adkit.so/tools/safe-zones/youtube . TikTok figures disagree across sources (240 top / 660 bottom / 120 sides in one checker) | [SECONDARY]; take the union of the three as the universal box |
| **Colour contrast** | Text vs background >= 4.5:1 (WCAG AA body), 3:1 large | [FACT] WCAG 1.4.3 (not re-read this session); house design-lint already measures contrast |
| **Transitions motivated by story** | Each transition says something (match cut, push, reveal) | judgement | [OPINION] |
| **Audio sync** | Hit on transient; whoosh ends at settle | section 4.2 | [SECONDARY] |
| **Loudness** | -14 LUFS, -1 dBTP | section 4.1 | [SECONDARY]/[FACT] |
| **Accessibility** | <= 3 flashes/s; provide a reduced-motion path for interactive output | WCAG 2.3.1 / 2.3.3 | [FACT] |
| **End card** | Single CTA, held long enough to read | house plan-check warns on end screens over 3 s; BCAP 2 s + 0.2 s/word | [OURS]/[SECONDARY] |
| **Opening** | Product or promise in first 3-5 s | atomikgrowth, Flowjam | [SECONDARY] |

---

## 8. Engine spec: 25 measurable rules for top-tier motion

Each rule has a number the engine (design-lint, preflight, qc) can test in code. Labels show how well supported the number is. Where a rule is [OURS], it is a starting default to calibrate with the section 2.4 measurements.

| # | Rule | Test | Basis |
|---|---|---|---|
| 1 | UI-scale element moves last **100-500 ms**; nothing UI-sized longer than **700 ms** unless it is a hero reveal (max 1,200 ms) | lint every tween duration against the range | [FACT] M3 50-1000, Carbon 70-700, Fluent 50-500 (section 1) |
| 2 | Tiny effects (fade, colour, hover) **70-150 ms**; small moves **150-250 ms**; large moves **300-500 ms** | map element area/distance to duration band; warn when outside | [FACT] Carbon tokens (fast 70/110, moderate 150/240, slow 400) |
| 3 | Duration scales with distance: **duration >= 150 ms + 0.12 ms per px** of travel, capped at 700 ms | compute from tween x/y delta | [OURS], direction from Carbon |
| 4 | **Entrances use a decelerate curve** (0,0,0,1) or (0.05,0.7,0.1,1); **exits use an accelerate curve** (0.3,0,1,1); the default move curve is (0.2,0,0,1) | grep ease strings, map GSAP eases to these beziers | [FACT] M3 tokens |
| 5 | Exit is **shorter than entrance**: exit duration <= 0.7 x entrance duration for the same element | compare paired tweens | [OURS], consistent with Carbon (exit curves accelerate; M3 accelerates are for leaving) |
| 6 | **No pure `linear` ease** except looping/continuous motion (rotation, marquee, progress) | lint | [FACT] Fluent says linear for constant rate only |
| 7 | Overshoot spring only on 1 hero element per scene: damping **0.6** for bouncy, **0.8-0.9** for settled, **1.0** for opacity/colour | check spring params; at most 1 element with damping < 0.8 per scene | [FACT] M3 Expressive tokens |
| 8 | Bounce/elastic ease only **800-1,200 ms** and never on text that must be read | lint | [SECONDARY] web.dev |
| 9 | Camera moves **end at scale 1** (settle from 0.965 to 1); no content scaled past 1 while held | lint scale at held frames | house 0d.1 [OURS, proven] |
| 10 | Grouped items stagger **5-10 frames** (about 80-170 ms at 60 fps, 170-330 ms at 30 fps is too slow: use frames, not ms, then cap total stagger of a group at **600 ms**) | measure start offsets within a group | [SECONDARY] stagger; cap [OURS] |
| 11 | Glass/blur panels **never opacity-fade alone**: they must also change size, blur radius or lensing amount during the entrance | lint: entrance of `.glass` has at least one non-opacity property | [FACT] Apple WWDC25 219 |
| 12 | Specular highlight on glass moves **at least 15% of panel width** across the held shot | measure highlight x-delta | [OURS], from Liquid Glass behaviour |
| 13 | On-screen text hold time **>= max(1.5 s, 0.3 s x words)** and, for captions of 9 words or fewer, **>= 2 s + 0.2 s x words** when it is a legal/CTA line | words x time lint (extends plan-check) | [SECONDARY] OverseasOS, BCAP |
| 14 | Burned-in caption: **<= 20 characters/s** (Latin) and **<= 42 characters/line, 2 lines**; each caption event **>= 0.83 s** (20 frames at 24 fps) | parse ASS/SRT | [FACT] Netflix |
| 15 | Speech-synced captions at **<= 180 wpm** | words/minute per caption | [SECONDARY] BBC |
| 16 | Text a viewer must read **>= 28 px** at 1080p (>= 24 px kickers); at 9:16 on phone **>= 44 px** for body | existing design-lint plus 9:16 band | house 0d.5 [OURS]; 44 px [OURS] |
| 17 | **Text contrast >= 4.5:1** (>= 3:1 for text >= 48 px) measured on the held frame, including over video | design-lint contrast | [FACT] WCAG 1.4.3 |
| 18 | **Safe box for universal 9:16**: keep text inside x 6%-82%, y 15%-62% of 1080x1920 (the union of Meta, Shorts, TikTok zones) | bbox test of every text node | [OURS] union of [SECONDARY] zones; house uses 14/35/6 |
| 19 | **At most 1 simultaneous focal motion**; a second moving element must start >= 150 ms after the first or be < 20% of its area | overlap lint over timeline | [OURS] |
| 20 | **First meaningful frame by 3 s**: product, promise or number visible and the hook text on screen within 3 s; hook text <= 8 words | test on first 90 frames at 30 fps | [SECONDARY] atomikgrowth/Flowjam (3-5 s) |
| 21 | **Length bands**: teaser 15-30 s, launch 30-60 s, explainer 45-90 s (hard max 90 s for launch) | plan-check on header | [SECONDARY] vendors |
| 22 | **Scene length variation**: shortest scene >= 1.0 s, longest hold <= 6 s without internal motion, and ASL within +/-30% of the chosen reference's measured ASL | scene-detect on the render; compare to reference table | [OURS], calibrate via section 2.4 |
| 23 | **SFX on the beat**: every scene cut has a sound; SFX hit within **+/-1 frame** (33 ms at 30 fps) of the visual hit after subtracting `lead_s`; whoosh ends within 3 frames of settle; no still picture AND silence >= 1.5 s | cross-check timeline vs audio transients | house 0d.7-8 [OURS, proven]; sync idea [SECONDARY] |
| 24 | **Loudness -14 LUFS (+/-1), true peak <= -1 dBTP, LRA <= 11 LU**; broadcast variant -23 LUFS (R128) | qc.mjs on mix | [FACT] R128; [SECONDARY] -14 platforms |
| 25 | **Flash safety and reduced motion**: no more than 3 flashes in any 1 s; any frame-to-frame full-frame luminance change > 20% counts as a flash; interactive (web) outputs honour `prefers-reduced-motion` by shortening to opacity fades <= 200 ms | frame-diff scan; CSS media query check | [FACT] WCAG 2.3.1/2.3.3; 20% threshold [OURS] simplification of the Harding test, which I did not research |

Notes on rule 10: use frame counts, then check ms for the render fps. 5-10 frames at 30 fps is 167-333 ms; at 60 fps it is 83-167 ms. State fps in the lint so the number is unambiguous.

---

## 9. Suggested next steps for the studio [OPINION]

1. Build the **motion token file** (`tools/motion-tokens.json`): Carbon-style six durations (70/110/150/240/400/700 ms), the M3 curve set, spring presets (0.6/800, 0.8/380, 0.9/700, 1.0/1600), stagger frames. Make design-lint read it (rules 1-8).
2. Run the section 2.4 measurement on 8-10 reference films, then replace [OURS] pace numbers (rules 19-22).
3. Verify the three [SECONDARY] items that drive hard rules before relying on them: Meta Reels ad safe zone (Meta Ads Guide / Ads Manager overlay), YouTube loudness (YouTube Help), Netflix timed-text timing page (rule 14's 5/6 s).
4. Add a "glass" component with a true refraction option (Three.js shader) and a CSS fallback; test rule 11/12.
5. Sell the **variant pipeline**: one master + CSV of records + language list, rendered with preflight and QC, since this is the one 2026-2028 pattern where code beats hand animation on cost.

---

## Appendix: source list (all fetched 2026-11-07 unless stated)

- Material tokens: https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-sys-motion.scss
- M3 Expressive springs: https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ExpressiveMotionTokens.kt ; .../StandardMotionTokens.kt
- Carbon: https://carbondesignsystem.com/elements/motion/overview/ (page updated 2026-08-12)
- Fluent 2: https://fluent2.microsoft.design/motion ; https://raw.githubusercontent.com/microsoft/fluentui/master/packages/tokens/src/global/durations.ts ; .../curves.ts
- Apple HIG Motion: https://developer.apple.com/design/human-interface-guidelines/motion.md ; WWDC25 session 219: https://developer.apple.com/videos/play/wwdc2025/219/
- Netflix English style guide: https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-Timed-Text-Style-Guide
- Flowjam benchmarks (2026-06): https://www.flowjam.com/blog/state-of-launch-videos-2026 ; https://www.flowjam.com/blog/product-launch-video-examples-2026
- Atomikgrowth (2026-05-17): https://www.atomikgrowth.com/blog/best-saas-product-launch-videos-of-2026-with-actionable-tips-real-examples
- Collision Awards survey summary (2025-05-15): https://www.stashmedia.tv/?p=111942
- Kurzgesagt: https://kurzgesagt.org/youtube/
- Others as linked inline in each table.
