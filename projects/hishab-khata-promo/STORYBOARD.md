---
format: 1920x1080
duration: 45s
message: "খাতার হিসাব ছেড়ে দিন — ফি, বকেয়া আর রিপোর্ট এক জায়গায়"
arc: Before → After tease → Bridge/Product → Step 1 → Step 2 → Wow → CTA (BAB)
audience: "বাংলাদেশের স্কুলের হিসাবরক্ষক ও প্রশাসন"
mode: collaborative
music: none
---

> **Audio note — read before running any audio script.** `music: none` with no `SCRIPT.md` is
> the canonical fully-silent marker, and it would disable SFX too. This video has **no narration
> and no BGM** (signed out of HeyGen; Kokoro and MusicGen are not installed; the workspace has no
> licensed music yet) but it **does** want SFX. So Step 3.1's `audio.mjs` is deliberately
> **skipped**, and the SFX cued on each frame below are placed by hand as `<audio>` elements from
> `assets/sfx/` (Pixabay Content License). That path is render-verified on this machine — see the
> workspace `CLAUDE.md` §4d. Do not "fix" this by running `audio.mjs`.

> **No-capture project.** Nothing was captured; there is no product screenshot, logo, or photo.
> Every frame is built from Bengali typography, numerals, rules and colour fields. Do not
> fabricate a screenshot of a product that does not exist — *suggest* the interface with type
> and shape. The recurring prop is the **ruled ledger page** (the product is literally named
> "হিসাব খাতা", the accounts ledger): the page stays cream in every frame, and the story is told
> by what lands on it — red ink and clutter in the before, green ink and space in the after.

## Video direction

**Palette (roles from `frame.md`, nothing invented).** `paper` is the ground of every frame and
never inverts. `ink` (deep ledger green) is the only ink for headlines, body, rules, the grid and
the chrome — this is a two-colour system. `ink-soft` carries captions and secondary labels.
`alert` (red) is **the problem colour**: it appears only in Frame 1, on the due amounts in Frame 5,
and on the struck "৪ ঘণ্টা" in Frame 6 — nowhere else, so its every appearance means the same
thing. `highlight` (amber) is **the moment-of-resolution colour**: the rule under the promise, the
posted row, the zero, the closing divider. `paper-2` is the only secondary surface.

**Motion grammar and reveal model.** Long-tail decel settles throughout — `power3` is the default;
no bounce, no overshoot, no `back.out` as a house entrance. **This video has no voiceover, so the
reveal is paced to the ON-SCREEN TEXT CUES instead**: each Bengali line, chip, row or numeral is a
cue, and nothing appears before its cue arrives. The anti-PowerPoint rule is unchanged — never dump
the canvas in the first ~25%; spread reveals across the back ~50%. Because the viewer is *reading*
rather than listening, every landed line gets **at least 1.1s of settled read time** before the
next cue moves; that is this video's substitute for the VO's own pacing.

**Rhythm — where the video holds still.** Frames **2** and **7** are the deliberate breathers: both
open on an empty page and hold it for over a second before anything lands, and Frame 2's emptiness
is the whole point of the beat (it is the relief). Frame **6** ends held. Frames 1, 4 and 5 are the
busy ones. **This video uses no ambient aliveness at all** — no jitter, no breathing, no drift.
Every hold is completely still, which suits a piece whose subject is a quiet ledger page and
follows the doctrine's own preference for stillness over motion-for-its-own-sake.

**Caption band.** Captions are **disabled** for this video (no narration → no caption track), and
the preset's own composition runs to its bottom hairline at y≈1020 with the page chrome beneath it.
So the usual bottom-17% keep-out is **not** reserved here; instead every frame's readable content
clears the bottom hairline, and the hairline plus page chrome are design chrome, not content. This
is a deliberate, stated deviation from the default — if narration is ever added, the content must
be lifted into the top ~83% first.

**Negative list.** No inverted/dark grounds — the page is cream in every frame. No bounce or
elastic entrances. No lazy breathing on cards or text. No slow pan or push in the back half of any
frame. No `repeat`/`yoyo`, no randomness, no wall-clock. No fabricated product screenshots, no
browser chrome, no cursors, no decorative gradients or "AI" glow. Red is never used decoratively.
Both failure modes are out: **slideshow** (everything dumped up front, then frozen) and
**screensaver** (many elements drifting independently).

## Frame 1 — খাতার রাত

- scene: A ruled ledger page fills the frame; red-ink Bengali pain lines stamp in one by one until the page is crowded
- duration: 8s
- transition_in: cut
- status: animated
- poster: 6s
- src: compositions/frames/01-khatar-raat.html
- type: hook
- persuasion: Pain validation
- beat: frustration → overwhelm
- blueprint: kinetic-type-beats (Adapt)
- focal: (typography — no assets captured; the four red lines are the hero)
- roles: (none — no captured assets to cast)
- onscreen_text: "রাত ১১টা।" / "খাতা এখনো মেলেনি।" / "কে কত বকেয়া রেখেছে?" / "একটা অঙ্ক ভুল — আবার গোড়া থেকে।"
- sfx: key-press at 0.4s (each line lands like a pen stroke); glitch-3 at 5.6s under the crowding; whoosh-short at 7.6s into the cut
- asset_candidates:

Adapt: keep the blueprint's beat-slam signature — short statements each landing alone on a shared
percussive beat array — but the beats **accumulate on one page** instead of replacing each other.
The accumulation is the argument: by the last line the page is visibly overloaded.

Scene 1 (0.0–1.3s): cream page, graph grid and the two hairlines only; the eyebrow "মাস শেষ · হিসাব মেলানো" fades up top-left in the micro role. Full-width strip, 2 depth layers (grid behind, type above). No camera move — the page is simply there.
Scene 2 (1.3–2.6s): "রাত ১১টা।" lands as a **kinetic beat-slam** (`kinetic-beat-slam`) in `alert`, upper-left third. The clock lands on the same beat at right in the mono role, one beat behind the line. Rule-of-thirds; type left, clock right.
Scene 3 (2.6–3.9s): "খাতা এখনো মেলেনি।" slams in beneath the first on the same beat array. The stand-in ledger block fades up behind the clock as a **background** layer at ~40% — 3 depth layers now.
Scene 4 (3.9–5.2s): "কে কত বকেয়া রেখেছে?" lands. Red marks accumulate across the ledger block, one per beat on the same array (`kinetic-beat-slam`) — the page starting to crowd.
Scene 5 (5.2–6.6s): the last line lands as two chunks on the same array — "একটা অঙ্ক ভুল —" then "আবার গোড়া থেকে।" (`kinetic-beat-slam`). More marks land; the block reads dense and unreadable, which is the point.
Scene 6 (6.6–8.0s): everything holds, completely still — no jitter, no push, no drift. The frozen page is the night not passing. Held read into the cut.

## Frame 2 — আর নয়

- scene: The red clutter sweeps off the page in one stroke; the page goes clean and one green line lands
- duration: 5s
- transition_in: zoom-through
- status: animated
- poster: 3.5s
- src: compositions/frames/02-ar-noy.html
- type: benefit_highlight
- persuasion: Negative contrast
- beat: relief
- blueprint: titlecard-reveal (Adapt)
- focal: (typography — the promise line is the hero)
- roles: (none — no captured assets to cast)
- onscreen_text: "ফি, বকেয়া, রিপোর্ট — এক জায়গায়।"
- sfx: whoosh at 0.0s (the sweep); chime at 1.6s (the clean page)
- asset_candidates:

Adapt: this is the blueprint's calm two-line value title card used as a breather beat. Keep its
signature — a statement card that lands clean and simply stops — but replace the dark prelude with
a **clearing sweep** that wipes the previous frame's red off the page. The second window is
deliberately empty; do not fill it. That emptiness is the relief the whole video turns on.

Scene 1 (0.0–0.8s): the page arrives still carrying Frame 1's red marks as a ghost; one horizontal **highlight sweep** (`css-marker-patterns`) travels left→right and takes the red with it, as a velocity-matched **cut-the-curve** seam (`cut-catalog.md`) whose direction and speed match the incoming zoom-through. Full-width strip.
Scene 2 (0.8–2.2s): the cleaned page **holds empty** — grid and hairlines only, nothing else on screen. A deliberate breather; the emptiness is the beat.
Scene 3 (2.2–3.6s): "ফি, বকেয়া, রিপোর্ট —" reveals **per-word staggered** (`dynamic-content-sequencing`) in `ink`, left-of-centre, ~55% of frame, upper-third weighted.
Scene 4 (3.6–5.0s): "এক জায়গায়।" lands on the finale beat and the amber rule **self-draws** left→right beneath it (`svg-path-draw`). Settles and holds still — no jitter, no drift.

## Frame 3 — হিসাব খাতা

- scene: The page's own ruled lines converge and resolve into the product wordmark
- duration: 6s
- transition_in: crossfade
- status: animated
- poster: 4.5s
- src: compositions/frames/03-product-intro.html
- type: product_intro
- persuasion: Friction reduction
- beat: curiosity → clarity
- blueprint: logo-assemble-lockup (Adapt)
- focal: (typography — the wordmark is set type, not an image logo)
- roles: (none — no captured assets to cast)
- onscreen_text: "হিসাব খাতা" / "স্কুলের ফি ও হিসাব — এক সফটওয়্যারে"
- sfx: whoosh-short at 0.2s (lines converge); pop at 1.4s (wordmark lands); ping at 3.0s (tagline)
- asset_candidates:

Adapt: the blueprint assembles a brand mark out of orbiting elements; here the elements are the
**page's own three ledger rules**, which converge and hand off to the wordmark. The assemble
signature is kept intact — the mark is built on screen, never faded in whole. Nothing else changes.

Scene 1 (0.0–1.2s): three ledger rules slide in from the left edge at staggered speeds and stack centred, settling on a long-tail curve (`center-outward-expansion`, run inward). Centred, ~45% of frame, 2 depth layers.
Scene 2 (1.2–2.6s): **the signature assemble** — the three rules compress toward one another and the wordmark "হিসাব খাতা" arrives at the same screen centre as they shrink and fade (`scale-swap-transition`). The display role at full size; the handoff happens at one centre so the eye never travels.
Scene 3 (2.6–4.2s): the tagline "স্কুলের ফি ও হিসাব — এক সফটওয়্যারে" reveals word by word beneath the wordmark in the body role, on the same staggered settle the rules used (`center-outward-expansion`).
Scene 4 (4.2–6.0s): the amber rule **self-draws** under the lockup (`svg-path-draw`); the frame settles and holds still.

## Frame 4 — ফি নিলেই হিসাব

- scene: An abstract entry card; an amount is typed and a ledger row plus the month total write themselves in response
- duration: 6s
- transition_in: crossfade
- status: animated
- poster: 4.5s
- src: compositions/frames/04-fee-entry.html
- type: feature_showcase
- persuasion: Show-don't-tell proof
- beat: ease + control
- blueprint: panel-edit-live-sync (Reproduce)
- focal: (typography + built UI — the টাকা field and the row it posts are the paired hero)
- roles: (none — no captured assets to cast)
- onscreen_text: "ফি নিলেই হিসাব নিজে থেকে ওঠে" / fields: শিক্ষার্থী · শ্রেণি · মাস · টাকা / row: "০৪৩ রুমানা আক্তার ১,২০০" / total: "সেপ্টেম্বরের আদায় ৳ ৫১,৬০০"
- sfx: key-press ×3 at 1.2s / 1.5s / 1.8s (typing the amount); ping at 2.4s (row posts); pop at 3.4s (total ticks)
- asset_candidates:

Reproduce: the blueprint's whole value is the **live coupling** — an edit in the panel syncs a
bound target — and that is exactly this beat. The signature is the sync itself: the posted row must
arrive as a consequence of the typed value, in the same amber, on a matched velocity, so the eye
carries the cause into the effect.

Scene 1 (0.0–1.1s): the headline reveals **per-word staggered** (`dynamic-content-sequencing`) across the top strip. Nothing else on screen. Asymmetric 60/40 established but empty.
Scene 2 (1.1–2.3s): the entry card outline **self-draws** on the left (`svg-path-draw`) and its three filled fields reveal top-to-bottom on their own beats; on the right only the "নিজে থেকে যা হয়" label and the two existing ledger rows fade up, held dim as context. 3 depth layers.
Scene 3 (2.3–3.4s): the টাকা value **types on** digit by digit (`discrete-text-sequence`) — "১,২০০" — behind a plain block caret the worker holds steady (no blink recipe needed); the amber underline draws beneath the field as it lands.
Scene 4 (3.4–4.6s): **the signature live-sync** — row ০৪৩ writes itself into the ledger on the right in the same amber, entering on a **cut-the-curve** (`cut-catalog.md`) matched to the typed value's motion so the two read as one movement.
Scene 5 (4.6–6.0s): the month total **counts up** into ৳ ৫১,৬০০ (`counting-dynamic-scale`) at lower-right; then everything holds still. No jitter — the calm is the payoff.

## Frame 5 — বকেয়া নিজে থেকেই

- scene: A dues board populates itself — class chips first, then rows with names and amounts, then a counter
- duration: 6s
- transition_in: push-slide LEFT
- status: animated
- poster: 4.8s
- src: compositions/frames/05-dues-board.html
- type: feature_showcase
- persuasion: Friction reduction
- beat: relief + control
- blueprint: grid-card-assemble (Adapt)
- focal: (typography + built UI — the self-assembling dues board is the hero)
- roles: (none — no captured assets to cast)
- onscreen_text: "বকেয়ার তালিকা সব সময় তৈরি" / chips: ৬ষ্ঠ · ৭ম · ৮ম · ৯ম · ১০ম / counter: "১৮ জন বকেয়া" / "খুঁজতে হয় না।"
- sfx: whoosh-short at 0.0s (the push); pop ×3 at 0.9s / 1.2s / 1.5s (chips); ping at 3.2s (counter lands)
- asset_candidates:

Adapt: keep the blueprint's **self-assembling board** signature — the surface builds itself while
the viewer watches, which is the entire claim of this beat — but the tiles are ledger rows and
class chips rather than glass cards, and there is no post-assembly status flip.

Scene 1 (0.0–1.0s): the headline reveals **per-word staggered** (`dynamic-content-sequencing`) upper-left. Asymmetric 70/30, the right third held empty for the counter.
Scene 2 (1.0–2.0s): the five class chips reveal left-to-right via **cluster→outward expansion** (`center-outward-expansion`); ৮ম fills solid last and stays selected.
Scene 3 (2.0–3.4s): **the signature assemble** — the four board rows build top-to-bottom (`dynamic-content-sequencing`), each row's name and class landing in `ink` and its due amount arriving a half-beat later in `alert`. The red is contained to the amounts column: countable, not scattered.
Scene 4 (3.4–4.6s): the counter **counts up** ০ → ১৮ at upper-right, value-scaled so the climb escalates (`counting-dynamic-scale`).
Scene 5 (4.6–6.0s): "খুঁজতে হয় না।" lands as one **kinetic beat-slam** (`kinetic-beat-slam`) lower-left; the board holds still.

## Frame 6 — সংখ্যায়

- scene: Three proof numbers count up in sequence, oversized, with the ledger rules as wallpaper
- duration: 8s
- transition_in: zoom-through
- status: animated
- poster: 7s
- src: compositions/frames/06-numbers.html
- type: benefit_highlight
- persuasion: Statistical proof
- beat: awe → confidence
- blueprint: dataviz-countup (Adapt)
- focal: (typography — the three numerals are the hero, "০" carries the close)
- roles: (none — no captured assets to cast)
- onscreen_text: "৪ ঘণ্টা → ১২ মিনিট" (মাস শেষের হিসাব) / "১২০০" (শিক্ষার্থী, এক জায়গায়) / "০" (অঙ্কের ভুল)
- sfx: impact-bass-1 at 0.1s (the section lands); ping at 2.6s and 4.8s (numbers two and three); sparkle at 6.4s (the zero)
- asset_candidates:

Adapt: keep the **count-up** signature, but run it three times across a triptych instead of once on
a single hero — each stat arrives on its own beat, so the section develops rather than dumping.
Registry note: `count-up` and `number-wheel` exist in the catalog; the frame worker may install one
rather than hand-rolling the counter.

Scene 1 (0.0–1.0s): the eyebrow "সংখ্যায়" fades up and the three column rules **self-draw** left-to-right (`svg-path-draw`). Triptych, 2 depth layers, all three columns still empty.
Scene 2 (1.0–2.8s): stat one — "৪ ঘণ্টা" appears in `alert` and a marker **strike-through** draws across it (`css-marker-patterns`); "১২ মিনিট" then **counts down** into place beside it (`counting-dynamic-scale`) and its caption reveals beneath.
Scene 3 (2.8–4.8s): stat two — "১২০০" **counts up** from ০ with the value-scaled counter (`counting-dynamic-scale`) so the numeral grows as it climbs; the caption follows on its own beat.
Scene 4 (4.8–6.6s): stat three — "০" arrives via a **spring-pop entrance** on a smooth long-tail settle (`spring-pop-entrance`, no overshoot) in `highlight`; its caption follows.
Scene 5 (6.6–8.0s): all three hold, completely still. Held read before the close — the three numbers standing together is the payoff, and nothing needs to move for it.

## Frame 7 — খাতার হিসাব ছেড়ে দিন

- scene: The ruled page returns clean; the closing line lands, then the wordmark holds with an amber rule under it
- duration: 6s
- transition_in: crossfade
- status: animated
- poster: 4.6s
- src: compositions/frames/07-cta.html
- type: cta
- persuasion: Future pacing
- beat: peace of mind
- blueprint: titlecard-reveal (Adapt)
- focal: (typography — the closing line hands off to the wordmark)
- roles: (none — no captured assets to cast)
- onscreen_text: "খাতার হিসাব ছেড়ে দিন।" / "হিসাব খাতা" / "স্কুলের ফি ও হিসাব — এক সফটওয়্যারে"
- sfx: whoosh at 0.1s; impact-bass-1 at 1.9s (the wordmark seats); chime at 3.6s (the close)
- asset_candidates:

Adapt: this is the blueprint's end-card chain — statement → closing line → wordmark, ending on the
mark held to the final frame — which is exactly this beat. Keep that chain and its held ending; the
only change is that the chain runs on cream rather than the blueprint's monochrome dark, and the
seams are settles rather than hard cuts. This is the only frame in the video with a real exit —
everything else exits through the injected transition — so it must resolve completely and hold.

Scene 1 (0.0–1.4s): the empty cream page — grid and hairlines only, the same page Frame 1 opened on, now clear. Centred, deliberately empty; the rhyme with the opening is the whole close.
Scene 2 (1.4–2.6s): "খাতার হিসাব" then "ছেড়ে দিন।" land as two **kinetic beat-slams** (`kinetic-beat-slam`) on a shared beat array, centred, ~50% of frame.
Scene 3 (2.6–3.8s): the amber divider **self-draws** (`svg-path-draw`) and the wordmark "হিসাব খাতা" arrives beneath it via **scale-swap** at the same centre (`scale-swap-transition`) — the same handoff move Frame 3 used to introduce it, now used to seat it.
Scene 4 (3.8–6.0s): the tagline reveals **per-word staggered** (`dynamic-content-sequencing`); everything settles and **holds completely still** to the final rendered frame. No jitter here — the stillness is the closing statement.
