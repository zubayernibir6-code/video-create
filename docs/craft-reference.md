# Craft reference: fonts, animation runtimes, audio, LUTs, licences

> Moved verbatim out of CLAUDE.md on 2026-10-26 to keep every session's start small (section numbers kept).
> Paths written as `E:Video Create` / `C:Userszubay` are from the old login: read `D:Video Create` /
> `C:UsersZubayer Nibir` (CLAUDE.md §0a). CLAUDE.md §0g says which file holds what.

## 4b. Font pack — installed and render-verified (2026-09-10)

Master pack: `E:/Video Create/assets/fonts/` — **4.1 MB**, 13 TTF files, 9 families.
Every family is **SIL Open Font License 1.1** → free for commercial use, embedding and
bundling in a sold product. Licence texts are kept in `assets/fonts/LICENSES/`.
Source: `github.com/google/fonts` (`ofl/`), downloaded as unmodified TTF.

| Family | Script | File(s) | Use for |
| --- | --- | --- | --- |
| Hind Siliguri | বাংলা | 300/400/500/600/700 static | default Bengali body + UI |
| Noto Sans Bengali | বাংলা | variable 100–900 | widest Bengali glyph coverage, fallback |
| Baloo Da 2 | বাংলা | variable 400–800 | heavy Bengali display / titles |
| Tiro Bangla | বাংলা | 400 | Bengali serif, long reading text |
| Inter | Latin | variable 100–900 | default Latin body + UI |
| Anton | Latin | 400 | heavy headline |
| Bebas Neue | Latin | 400 | condensed title card |
| Playfair Display | Latin | variable 400–900 | elegant serif heading |
| JetBrains Mono | Latin | variable 100–800 | code, numbers, timecode |

`assets/fonts/fonts.css` declares every `@font-face` plus ready-made stacks as CSS variables
(`--font-bn-body`, `--font-bn-title`, `--font-bn-serif`, `--font-en-body`, `--font-en-title`,
`--font-en-cond`, `--font-en-serif`, `--font-mono`, `--font-mixed-body`, `--font-mixed-title`).
Bengali-first ordering in the mixed stacks so Bengali+English in one line both shape correctly.

### ⚠️ Fonts must be COPIED INTO each project — `../../` does not work

HyperFrames `lint` rejects asset paths that traverse above the project root
(`invalid_parent_traversal_in_asset_path`): compositions are served with the **project root**
as base URL. So for every new project:

```bash
cp -r "E:/Video Create/assets/fonts" "E:/Video Create/projects/<project>/assets/fonts"
```

then in `index.html` `<head>`:

```html
<link rel="stylesheet" href="assets/fonts/fonts.css" />
```

Costs 4.1 MB per project. Trim unused families from the copy if size matters.

### Known-harmless message

`npm run check` may print `[StaticGuard] Invalid HyperFrame contract: Font families used
without @font-face declaration: ...` **while `Lint` still reports 0 errors**. StaticGuard runs
a static pass that does not follow the linked stylesheet. Verified false positive — the
2026-09-10 render used all nine families correctly. Judge by the `Lint` line, not StaticGuard.

### Verification artifact

`projects/font-test/` — a 5 s 1080p sample sheet showing all nine families, including hard
Bengali conjuncts (ক্ষ স্ব দৃ শ্র উজ্জ্বল ঙ্ক স্ত্রী ঞ) and Bengali digits ০-৯.
`npm run check` passes clean (0 lint, 0 runtime, 0 layout, 0 motion, 97/97 contrast WCAG AA).
Rendered `renders/font-test.mp4` in **41.9 s** (924 KB, h264, yuv420p, 1920×1080, 30 fps).
Frame inspected visually — all shaping correct, no tofu boxes.

---

## 4c. Animation runtimes — vendored locally and render-verified (2026-09-10)

Master pack: `E:/Video Create/assets/js/` — **640 KB**, all files vendored so **renders need no
internet**. Licence texts in `assets/js/LICENSES/`.

| Library | Version | Where | Licence |
| --- | --- | --- | --- |
| GSAP core + 12 plugins | 3.15.0 | `assets/js/gsap/` (186 KB) | GSAP Standard "no charge" — see the warning below |
| Anime.js (UMD) | 4.5.0 | `assets/js/anime.umd.min.js` (118 KB) | MIT |
| lottie-web | 5.13.0 | `assets/js/lottie.min.js` (306 KB) | MIT |

GSAP plugins vendored (all free since GSAP 3.13): `SplitText`, `CustomEase`, `CustomWiggle`,
`CustomBounce`, `TextPlugin`, `ScrambleTextPlugin`, `DrawSVGPlugin`, `MorphSVGPlugin`,
`MotionPathPlugin`, `Flip`, `EasePack`, `Physics2DPlugin`.
Deliberately **not** vendored: `ScrollTrigger`, `ScrollSmoother`, `ScrollToPlugin`, `Observer`,
`Draggable`, `InertiaPlugin`, `GSDevTools`, `MotionPathHelper`, `PixiPlugin`, `EaselPlugin`,
`CSSRulePlugin` — all scroll/pointer driven, useless in a headless seek render.

### ⚠️ GSAP licence — the one commercial catch

Read `assets/js/LICENSES/gsap-standard-license.txt` (saved from gsap.com/standard-license on
2026-09-10; the npm package ships no LICENSE file). Summary of what actually matters here:

- Rendering **video** with GSAP and selling the MP4 → fine. GSAP is not inside the deliverable.
- A **client paying a one-time fee** for a site/product → fine, explicitly covered.
- Shipping GSAP inside a product where **end users are charged** a usage/access/licence fee →
  needs a paid "Business" Club GSAP membership.
- **Prohibited use:** a no-code *visual animation builder* that competes with Webflow's visual
  animation capabilities. If the user ever builds a drag-and-drop animation/video editor to sell,
  GSAP is the wrong dependency — **use Anime.js (MIT), which has none of these restrictions.**

Anime.js and lottie-web are MIT: no restriction of any kind.

### Which runtimes HyperFrames can seek

Verified present in the installed hyperframes 0.8.33 runtime
(`dist/hyperframe-runtime.js` — grepped for each global):

| Runtime | Registration | Status |
| --- | --- | --- |
| GSAP | `window.__timelines["<comp-id>"]` | ✅ default, verified |
| Anime.js v4 | `window.__hfAnime.push(instance)` | ✅ verified — read the gotchas below |
| CSS keyframes | automatic (computed `animation-name`) | ✅ verified |
| Lottie | `window.__hfLottie.push(anim)` | adapter present, **not yet tested** (no .json asset) |
| Three.js | `hf-seek` event + `window.__hfThreeTime` | adapter present, not installed (weak iGPU) |
| TypeGPU / WebGPU | `window.__hfTypegpuTime` | adapter present, not installed (weak iGPU) |
| WAAPI | `element.animate()` + `currentTime` | adapter present, not tested |

**Motion / framer-motion has NO HyperFrames adapter.** Do not install it and do not suggest it;
it cannot be seeked and will render as a frozen frame.

### ⚠️ Anime.js v4 gotchas — both found the hard way, both cost a wasted render

1. **`delay` is invisible to `seek()`.** `anime.animate(".x", { duration: 700, delay: 4800 })`
   reports `.duration === 700` and `seek(4800)` clamps to the tween's end. Measured: seek(0)→0.0,
   seek(175)→0.25, seek(350)→0.5, seek(700)→1.0, seek(4800)→1.0. The delay is simply dropped.
   `anime.stagger(90, { start: 4800 })` behaves the same way — `start` does not offset the delay.
   **Fix: use `anime.createTimeline({ autoplay: false })` and pass an absolute position to
   `.add(targets, params, position)`.** Measured with `.add(..., 4800)`: `.duration === 5680`,
   seek(4700)→not started, seek(4800)→0.0, seek(5150)→0.5, seek(5500)→1.0. Stagger delays inside
   `.add()` *are* counted in the timeline duration.
2. **Anime.js does not pre-apply a segment's start state.** Before a timeline segment begins,
   its targets have no transform at all — an element that should be hidden renders fully visible.
   **Fix: put the hidden start state in CSS** (`transform: scaleY(0); opacity: 0`) and animate to
   the visible state. Unlike GSAP `.from()`, the runtime will not hide it for you.

### ✅ GSAP SplitText handles Bengali correctly

`SplitText.create(el, { type: "chars" })` on Bengali text **preserves conjuncts** — verified
visually on `যুক্তাক্ষর: ক্ষুদ্র উজ্জ্বল` rendered per-character. No broken clusters, no
orphaned vowel signs. So per-character kinetic typography works for Bengali, not just words.
(`type: "words"` is still the safer choice for long Bengali lines — fewer elements, same look.)

### Same per-project copy rule as the fonts

```bash
cp -r "E:/Video Create/assets/js" "E:/Video Create/projects/<project>/assets/js"
```

then load from the project root, never `../../`:

```html
<script src="assets/js/gsap/gsap.min.js"></script>
<script src="assets/js/gsap/SplitText.min.js"></script>
<script src="assets/js/anime.umd.min.js"></script>
```

`hyperframes init` templates ship a jsdelivr CDN `<script>` for GSAP. **Replace it with the local
path** — otherwise every render depends on the network.

### Verification artifact

`projects/anim-test/` — 8 s 1080p, four panels, zero external URLs. `npm run check` passes clean
(0 lint / 0 runtime / 0 layout / 0 motion, 117/117 contrast WCAG AA). Rendered
`renders/anim-test.mp4` in **19.7 s** (504 KB).

Motion proven by measuring frame brightness in each panel's region with
`ffmpeg -vf crop=...,signalstats` rather than by eyeballing:

- GSAP SplitText panel: 32.0 (t=1.1s) → 41.6 (t=1.5s) → 46.7 (t=2.2s)
- Anime.js bars: 32.0 (t=4.7s) → 36.4 (t=4.95s) → 57.4 (t=5.2s) → 75.6 (t=5.5s) → 73.5 (settled)
- CSS shimmer: left window 42→150 (t=0.6s) while right stays 42; then right 42→68 (t=1.0s) —
  i.e. the sweep really moves under seek

`data-layout-allow-overflow` on the shimmer element silences 10 expected `container_overflow`
info findings (the sweep intentionally travels outside its clipping track).

---

## 4d. Audio — SFX installed, BGM pipeline verified, music source chosen (2026-09-10)

### SFX: done

`E:/Video Create/assets/sfx/` — **1.3 MB**, 19 MP3s + `manifest.json` + `CREDITS.md`.
Source: the `media-use` skill's bundled library (`<skill>/audio/assets/sfx/`), originally Pixabay.

**Licence: Pixabay Content License.** Commercial and non-commercial use, modification, and
**redistribution as part of a derivative work (a rendered video) — with no attribution required.**
Clean for a sold product. Text: `assets/sfx/CREDITS.md`.

Files (duration from `manifest.json`, all confirmed decodable with ffprobe):
`chime` 2.5s · `click` / `click-soft` 0.37s · `error` 1.62s · `glitch-1/2/3` 2.6-3.5s ·
`impact-bass-1` 2.12s · `impact-bass-2` 2.59s · `key-press` 0.4s · `notification` 2.46s ·
`ping` 1.32s · `pop` 0.72s · `riser` 10.03s · `sparkle` 1.8s · `typing` 1.5s ·
`whoosh` / `whoosh-short` 0.57s · `whoosh-cinematic` 5.54s.
`manifest.json` carries a one-line "what to use it for and where to sync it" per file — read it
before picking. Mixed sample rates (24/44.1/48 kHz) and mono/stereo; the mixer handles it.

### The audio contract — what actually matters

```html
<audio id="sfx-pop" src="assets/sfx/pop.mp3"
       data-start="1.2" data-duration="0.72"
       data-track-index="10" data-volume="0.9"></audio>
```

- **`id` is mandatory.** `lint` errors `media_missing_id`, and an id-less `<audio>` is silently
  skipped by the mixer — the render comes out with no sound and no error.
- Audio lives at the **host root** (`index.html`), a sibling of the scene clips, so it survives
  scene cuts. Put it on a **high `data-track-index`** (10, 11, …) to keep it clear of the
  linter's visual overlap rules. Several audio tracks mix together fine.
- `data-duration` trims the clip; `data-volume` scales it.

### Verified: audio really does reach the MP4 on this machine

`projects/audio-test/` — 8 s 1080p with six SFX cued to six animation beats.
`npm run check` passes (0 errors; 1 info from a deliberate scale tween). Rendered in **37.7 s**
(544 KB). The output MP4 carries a real **AAC 48 kHz stereo** stream, 8.0 s, **true peak
-1.4 dBFS** (no clipping), **integrated loudness -9.0 LUFS**.

Placement was verified by **envelope cross-correlation of each source MP3 against the rendered
audio**, not by ear:

| Effect | Cued at | Found at | Correlation |
| --- | --- | --- | --- |
| whoosh | 0.0 s | 0.00 s | 1.00 |
| pop | 1.2 s | 1.20 s | 1.00 |
| ping | 2.0 s | 2.00 s | 1.00 |
| typing | 3.0 s | 3.00 s | 1.00 |
| impact-bass-1 | 5.0 s | 5.00 s | 1.00 |
| chime | 6.5 s | 6.50 s | 1.00 (after a 1.8 kHz high-pass) |

The chime needed the high-pass because `impact-bass-1` sustains for its full 2.12 s and masks it
in a broadband envelope. **Two lessons for real edits:** `impact-bass-1` is a long sustained
tone, not a short hit — trim it with `data-duration` if a later cue must be heard; and
`chime.mp3` has ~0.4 s of quiet lead-in, so cue it ~0.4 s *before* the visual beat.

-9.0 LUFS is far above the -14 LUFS web target — expected for an all-SFX test with no dialogue
bed. Loudness normalisation (`loudnorm`) is still an open Tier 2 item.

### BGM pipeline: verified (with a synthesized bed, not a library track)

A 30 s music bed was synthesized with FFmpeg (`sine` x4 -> `amix` -> `tremolo` -> `aecho` ->
`lowpass` -> `afade` -> `loudnorm`) purely to test the path, and placed in `projects/audio-test`
as `assets/music/testbed.mp3` on track 9 at `data-volume="0.30"`, under the SFX on tracks 10-11.
It is a test tone, not a library asset - do not ship it.

Measured on the re-render (32.0 s, 578 KB):

| Window | SFX-only render | With the bed | Bed contributes |
| --- | --- | --- | --- |
| 0.6-1.1 s (silent gap) | -99.0 dBFS | -41.2 dBFS | +57.8 dB |
| 4.4-4.9 s (silent gap) | -69.1 dBFS | -36.3 dBFS | +32.8 dB |
| 7.3-7.9 s (impact tail) | -34.1 dBFS | -32.7 dBFS | +1.4 dB |

Confirmed by this: **a track longer than the composition is trimmed by `data-duration`**
(30 s file, 8 s comp, output still exactly 8.0 s); a bed mixes under SFX without shifting them
(all five re-correlated at their exact cue times, corr 0.90-1.00); and adding a track did not
clip (true peak -1.2 dBFS). Integrated loudness stayed -9.0 LUFS.

Volume guidance that follows from `media-use`'s own defaults: **0.10-0.15 under narration,
0.30-0.60 for a silent film.** Keep BGM on a *lower* track index than the SFX.

### Music sources: Pixabay chosen (user's decision, 2026-09-10) — manual download only

| Route | Cost / setup | Commercial licence | Verdict |
| --- | --- | --- | --- |
| **Pixabay music** | free account, **manual download from the website** | **Pixabay Content License** — verified on the live licence page 2026-09-10: it covers "images, video, **audio** and other media"; free, **no attribution**, modification allowed; the only relevant prohibition is selling Content **standalone** ("no creative effort applied ... substantially the same form"). Music inside a rendered video is creative effort applied, so selling that video is permitted. | ✅ **chosen** |
| HeyGen catalog (10k+ tracks, the `media-use` default) | install `heygen` CLI + OAuth sign-in | **RESOLVED NEGATIVELY 2026-10-04:** HeyGen ToS (Last Updated July 23, 2026) says Free Plan output may not be sold or used commercially; paid plans (from $29/mo) still state no catalogue licence. Original note: **UNRESOLVED.** heygen.com/terms grants commercial rights over *User Output* but says nothing about their stock music library. Zero occurrences of "music" or "stock" on that page (checked 2026-09-10). | ⚠️ do not use commercially until HeyGen confirms in writing |
| Google Lyria (AI generation) | `$GEMINI_API_KEY` | Google's generative-content terms | may cost money — needs explicit OK |
| MusicGen locally | multi-GB torch install | ❌ **`facebook/musicgen-small` weights are `cc-by-nc-4.0` — NON-COMMERCIAL** (confirmed via the HuggingFace model API, 2026-09-10) | ❌ **rules it out for this user.** Also multi-GB with ~3 GB free RAM and no GPU. |

### ⚠️ The Pixabay API cannot fetch music — do not send the user for an API key

`pixabay.com/api/docs/` exposes exactly two endpoints: `https://pixabay.com/api/` (images) and
`https://pixabay.com/api/videos/`. The docs' own contents list only "Search images" and "Search
videos"; the word "audio" does not appear on the page at all, and "music" appears only in the
site nav (checked 2026-09-10). **An API key buys nothing for music.** The user downloads tracks
by hand from `pixabay.com/music/` (a free login is required for the download button) into
`assets/music/`. Instructions for him are in `assets/music/README.md`.

Also checked: **Openverse's anonymous API** does return CC0 audio (240 results for "ambient"),
but the CC0 pool is almost entirely **Freesound field recordings and atmospheres** — room tone,
wind, city, rain — not composed music. Useful as ambience beds, not as a BGM library.
`category=music` returns 0 CC0 results.

**Do not install MusicGen for this user.** Do not point him at the HeyGen catalog for anything
he sells until its music licence is confirmed.

---

## 4e. Colour grading (LUTs) — installed and measured (2026-09-11)

`E:/Video Create/assets/luts/` — **3 `.cube` files**, 33×33×33, 948 KB each, plus a Bengali
`README.md` for the user.

| File | Look |
| --- | --- |
| `teal-orange-blockbuster.cube` | teal shadows, warm highlights — the cinematic split-tone |
| `bleach-bypass.cube` | high contrast, heavily desaturated, hard blacks |
| `film-fade.cube` | lifted blacks, warm highlights, soft faded wash |

### Licence: clean, because nothing was downloaded

The `media-use` skill's `luts/index.json` ships **3 looks** (that is the whole library — there
is no larger set). Each entry has a CDN `url` **and** a deterministic `params` block. These
three were built from the `params` with `--local-only`, so **no third-party `.cube` file was
fetched** — the output is a numeric computation done on this machine:

```bash
node <MEDIA_DIR>/scripts/resolve.mjs --type lut --intent "<id>" \
  --project <dir> --local-only --params '<the params object from index.json>'
```

They land in `<project>/.media/luts/lut_00N.cube` and were copied out under readable names.
No account, no network, no licence question. Safe to sell work made with them.

### Verified — measured, not eyeballed

Applied to a real 1920×1080 frame and measured with `signalstats`:

| Variant | YAVG | UAVG | VAVG | Reads as |
| --- | --- | --- | --- | --- |
| original | 221.5 | 124.4 | 129.8 | — |
| teal-orange-blockbuster | 231.1 | 123.7 | 129.2 | brighter, slightly cool |
| bleach-bypass | 231.2 | 127.8 | 128.3 | U and V both pulled toward 128 = desaturated ✅ |
| film-fade | 194.8 | 121.7 | 133.2 | darker, V up = warmer ✅ |

All three behave as their names promise.

### ⚠️ Windows gotcha — `lut3d` and absolute paths

FFmpeg's filter syntax uses `:` as a separator, so a Windows path (`E:\...`) inside `lut3d=file=`
breaks. **`cd` into `assets/luts` and use the bare filename:**

```bash
cd "E:/Video Create/assets/luts"
ffmpeg -i in.mp4 -vf "lut3d=file='film-fade.cube'" -c:a copy out.mp4
```

Partial strength (usually better than 100 %):

```bash
ffmpeg -i in.mp4 -filter_complex "[0:v]lut3d=file='film-fade.cube'[g];[0:v][g]blend=all_mode=normal:all_opacity=0.6" -c:a copy out.mp4
```

**Not yet useful in practice** — every project so far is typography and colour fields, with no
photographic footage. LUTs start to matter the moment real images or clips enter `assets/footage`
or `assets/images`.

---

## 4f. Audio processing chain — measured on this machine (2026-09-11)

All three Tier-2 audio filters were run against real material and measured. Summary first:
**loudnorm works, ducking works once you know the units, and `afftdn` is far weaker than
`arnndn` — but `arnndn`'s model has no declared licence.**

### `loudnorm` — two-pass to the web target

Pass 1 measures, pass 2 applies the measured numbers. On `projects/audio-test/renders/audio-test.mp4`:

```bash
# pass 1
ffmpeg -i in.mp4 -af "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json" -f null -
# pass 2 — paste the measured_* values from pass 1
ffmpeg -i in.mp4 -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=-8.14:measured_TP=-1.25:measured_LRA=19.20:measured_thresh=-21.61:offset=1.76" -c:v copy -c:a aac -b:a 192k out.mp4
```

Result: **−9.0 → −12.0 LUFS**, true peak **−4.9 dBFS**, video stream copied untouched.

> ⚠️ **Corrected 2026-10-04:** −14 IS reachable — set `LRA` at or above the measured LRA (LRA=21 → −14.9 LUFS, TP −7.1). The paragraph below describes the LRA=11 run only.

**It did not reach −14, and that is correct behaviour.** The source LRA is 19–22 LU, far above
the `LRA=11` target, so loudnorm cannot pull the integrated level down without destroying the
dynamics. `linear=true` and the default dynamic mode both landed on −12.0. A real video with
narration plus a music bed has a much narrower LRA and will land close to −14.

### `sidechaincompress` (ducking music under a voice)

⚠️ **`threshold` is a LINEAR amplitude, not dB.** This is what makes the filter look broken.
A −31.7 dBFS trigger is ≈ 0.026 linear, so the commonly-copied `threshold=0.06` never opens
the compressor at all. Measured on a steady bed with a 1 s speech-band trigger at 3–4 s:

| threshold | bed while quiet | bed under voice | duck depth |
| --- | --- | --- | --- |
| 0.06 | −26.7 dB | −27.1 dB | **−0.3 dB (does nothing)** |
| 0.03 | −26.7 dB | −30.4 dB | −3.7 dB (subtle) |
| 0.01 | −26.7 dB | −39.5 dB | **−12.8 dB (natural voiceover duck)** |
| 0.003 | −26.7 dB | −49.4 dB | −22.7 dB (very aggressive) |

```bash
ffmpeg -i bed.wav -i voice.wav -filter_complex \
  "[0:a][1:a]sidechaincompress=threshold=0.01:ratio=20:attack=15:release=300[out]" -map "[out]" out.wav
```

Start at `threshold=0.01, ratio=20, attack=15, release=300` and raise the threshold if the duck
is too deep. Match the threshold to the voice's actual level — measure it with `volumedetect`
first. **`volumedetect` prints at INFO level, so `-v error` hides its output** — use `-v info`.

### Denoise — `afftdn` is weak here, `arnndn` is strong but unlicensed

| Filter | Pure white-noise bed | Notes |
| --- | --- | --- |
| `afftdn=nr=12…80` | −29.2 → **−30.5 dB** | only ~1.3 dB, and `nr` made no difference at all |
| `anlmdn` (defaults) | −27.6 → −27.7 dB | no measurable effect |
| `arnndn` (RNNoise) | −29.2 → **−56.2 dB** | **27 dB of reduction** |

Two honest caveats:

1. **White noise is the worst case for `afftdn`.** Spectral subtraction needs structure to keep;
   real-world hum, hiss and air-conditioner rumble reduce far better than this test suggests.
   Do not conclude `afftdn` is useless from that one number.
2. **`arnndn` is speech-trained.** On a 440 Hz sine + noise it removed 20 dB — it gutted the tone
   along with the noise, because a sine is not speech. Use it on **voiceover only**; it will
   destroy music and effects.

⚠️ **`arnndn` model licence is UNRESOLVED — do not use it commercially yet.** A model file
`som.rnnn` (297 KB) existed at `C:/Users/zubay/AppData/Local/Temp/ffxtest/som.rnnn` (**gone as of 2026-10-04**; licence-clean alternative: DeepFilterNet, plan step 12) — a **temp
folder Windows can clear at any time**, so treat it as not installed. It matches
`somnolent-hogwash-2018-09-01` from `github.com/GregorR/rnnoise-models`, and the GitHub API
reports that repo's licence as **`None`** (checked 2026-09-11). Same category as the HeyGen
music catalog: capable, but not clearable for a product the user sells. Resolve the licence
before copying it into `assets/`.

**None of this is needed yet** — there is no recorded audio in the workspace. It is set up and
measured so the numbers are known when real narration or footage arrives.

---

## 7. ✅ Remotion licence — RESOLVED 2026-09-11

Read from the `LICENSE.md` actually shipped inside the installed package
(`projects/remotion-starter/node_modules/remotion/LICENSE.md`, v4.0.523), not from memory.
npm records the licence as `SEE LICENSE IN LICENSE.md`.

Remotion is two-tier: a **Free License** and a paid **Company License**.

### The user qualifies for the Free License

Eligibility is by entity type, and the list includes **"an individual"** and
**"a for-profit organization with up to 3 employees"**. Talha is an individual, so he is
eligible today. The Company License (remotion.pro/license) only kicks in for a for-profit
organisation above that size.

### What the Free License allows

> "use the software non-commercially **or commercially for the purpose of creating videos and
> images** and to modify the software to their own liking, for the purpose of fulfilling their
> custom use case"

**So: building videos with Remotion and selling those videos is explicitly permitted.** The
earlier worry in this file was unfounded for his situation.

### The one real restriction

> "It is not allowed to copy or modify Remotion code for the purpose of selling, renting,
> licensing, relicensing, or sublicensing your own derivate of Remotion."

**He may not build and sell a video-making product that is a derivative of Remotion.** This is
the same shape as the GSAP catch in §4c: *making videos* is fine, *selling a video tool built
on it* is not. If he ever wants to sell a video-editor product, neither Remotion nor GSAP is a
safe dependency — that is an Anime.js (MIT) + HyperFrames decision.

### Watch this

The file's own header says: **"In Remotion 5.0, the license will slightly change"**
(remotion-dev/remotion PR #3750). Re-read `LICENSE.md` after any major-version upgrade.

### Bottom line

| Use | Verdict |
| --- | --- |
| Make videos with Remotion, sell the videos | ✅ allowed (individual / ≤3 employees) |
| Client pays him to make a video | ✅ allowed |
| His company grows past 3 employees | ⚠️ Company License required |
| Sell a product that *is* a Remotion derivative | ❌ never, at any tier |

HyperFrames remains the simpler choice — it has no tier at all — but Remotion is no longer a
blocker for selling videos.

---
