# AI video generation for B-roll: what works for this workspace (researched 2026-10-30)

He asked about "ComfyUI + Wan 2.1" and AI-made B-roll. This file is the decision record. The facts below come from a
web-research pass on 2026-10-30 (sources at the end). The prices and model news were NOT re-checked by hand: confirm
the price page before paying anything, and never spend without his OK (CLAUDE.md §0).

## The verdict in one paragraph

This laptop (Intel UHD 620, no NVIDIA / CUDA, 15.8 GB RAM, ~17 GB free on C:) cannot run ComfyUI + Wan in practice:
Wan 2.1 1.3B needs ~8 GB of NVIDIA VRAM, CPU mode is "very slow" (estimate 10–70 h per 5 s clip) and the weights
alone (~17 GB) would fill C:. **Use instead:** (1) free stock video (Pexels / Pixabay, a free key each) plus generated
scenes from the abroll engine for most B-roll; (2) pay-per-clip AI for the few "wow" shots, image-to-video from a
still: fal.ai MiniMax H3 Max Turbo (~$0.20 per 5 s at 768p) or Gemini Omni Flash via his Google AI Studio account
(~$0.50 per 5 s at 720p, no free API tier). Twenty clips a month ≈ $4–10. ComfyUI only makes sense later on a rented
GPU (Comfy Cloud $20/month, or a RunPod RTX 4090 at ~$0.34/h) or a desktop NVIDIA card (16 GB+).

## Decision table (quality 1–5 is an estimate anchored to the Artificial Analysis leaderboard)

| Route | On his laptop? | Cost per 5 s clip | Quality | Commercial use | Setup |
| --- | --- | --- | --- | --- | --- |
| ComfyUI + Wan 2.1/2.2 on CPU / UHD 620 | technically; 10–70 h per clip (estimate) | $0 | 2 | yes (Apache 2.0) | very high |
| Free Colab / Kaggle T4 + Wan 2.2 5B, 480p | no (browser) | $0; 10–30 min per clip (estimate) | 3 | yes, but Colab free bans web UIs | high |
| Comfy Cloud, Wan 2.2 image-to-video | no (browser) | ~$0.05 at 640×640 | 3 | yes | medium |
| Rented RTX 4090 + ComfyUI (Wan 2.2, H3) | no | ~$0.02 + setup / idle | 3–4 | Wan yes; H3 under $20M revenue (check licence) | high |
| fal.ai Wan 2.2 | API from the laptop | $0.15 (5B) / $0.40 (A14B) | 3 | yes | low |
| fal.ai MiniMax H3 Max Turbo, image-to-video | API | $0.20 at 768p / $0.40 at 1080p | 4 | paid API (check fal terms) | low |
| Gemini Omni Flash 1.1 (AI Studio) | API | ~$0.50 at 720p | 4 | yes; Google claims no ownership; SynthID watermark | lowest |
| Kling 3.0 (fal or app) | API / web | ~$0.42 | 4 | paid plans only | low |
| Seedance 2.0 | API | ~$1.87 | 5 | paid (check) | low |
| Runway Gen-4.5 | web | ~$1.44 (Standard plan) | 4 | paid (check) | low |
| Depth parallax from a photo (local, Depth Anything V2 Small) | yes | $0 | 2–3 | yes (Apache 2.0) | medium |
| Pexels / Pixabay stock video API | yes | $0 | 3–4 | yes (no resale of raw clips) | low |

## Facts worth keeping (each from the research sources; "reported" = not verified by hand)

- Wan 2.1 1.3B: 8.19 GB VRAM, ~4 min per 5 s 480p clip on an RTX 4090, Apache 2.0, no claim on outputs.
- Wan 2.2 TI2V-5B: 720p 5 s in < 9 min on one 24 GB GPU, Apache 2.0. Wan 2.5 and later are reported API-only.
- Reported 2026 changes: Veo 3.1 Preview on the Gemini API shut down on 2026-10-22, replaced by Gemini Omni Flash;
  the Sora app closed (April 2026) and its API (2026-09-24); MiniMax H3 released open weights (Aug 2026).
- Paying from Bangladesh: card payments abroad are capped at $300 per online transaction within a $12,000 yearly
  quota, so small prepaid top-ups (fal.ai credits) fit.
- Stock video: Pexels (free key, 200 req/h, commercial OK, no credit needed, no resale of raw clips); Pixabay (key,
  commercial OK, cache results 24 h); Coverr (key, asks for a logo link); Mixkit (no API, some clips restricted).
  `tools/stock-fetch.mjs` already reads PEXELS_API_KEY / PIXABAY_API_KEY from `.env.local` (he has none yet).
- Openverse (keyless CC0 photos in stock-fetch) did not answer its search API on 2026-10-30 (60 s timeout, twice).

## What the workspace does today without any of this

`tools/abroll` makes B-roll from three free sources: his own clips (incl. AI clips he made in apps), generated scenes
(the "steps", "temple", "skyline", "neural" scenes, data bars, morphing shapes, kinetic words) and stock clips once a
Pexels key is in `.env.local`. An AI-clip adapter (fal.ai or Gemini) is the next step only after he chooses a service
and puts its key in `.env.local` himself (never in chat).

## Sources (from the research pass)

Wan 2.1: github.com/Wan-Video/Wan2.1 · Wan 2.2: huggingface.co/Wan-AI/Wan2.2-TI2V-5B · leaderboard:
artificialanalysis.ai/video/leaderboard · MiniMax H3: huggingface.co/MiniMaxAI/MiniMax-H3 · LTX: huggingface.co/Lightricks
· RunPod pricing: runpod.io/pricing · Comfy Cloud: comfy.org/pricing · Colab FAQ: research.google.com/colaboratory/faq.html
· Gemini video + pricing + regions: ai.google.dev/gemini-api/docs/video, /pricing, /available-regions · fal.ai model pages
(wan/v2.2, minimax/h3-max-turbo, kling-video/v3) · Pexels: pexels.com/api/documentation, pexels.com/license · Pixabay:
pixabay.com/api/docs · Bangladesh card cap: tbsnews.net/node/135475 · PyTorch Intel GPU support:
docs.pytorch.org (get_start_xpu) · OpenVINO Text2Video: docs.openvino.ai.

## Second pass (2026-10-30): commercial safety, free GitHub, keys

From a second web-research pass. **(unv.)** marks a fact from memory or a single secondary site. Prices are as of
2026-10-30. Check them before paying.

**Corrections to the first pass**
- fal MiniMax H3 Max Turbo, 768p:
  - $0.026/s on a promo until 31 Oct;
  - $0.04/s (= $0.20 per 5 s) from 1 Nov;
  - plain H3 is $0.06/s.
- Google's video model is "Gemini Omni 1.1 Flash": ~$0.10/s at 720p, no free tier.
- Google's image models (Nano Banana) also have no free API tier.
- MiniMax H3 weights are open (31 Jul 2026). The licence is reported free under $20M revenue with attribution **(unv.)**.

**Commercial safety: may the outputs be used commercially?**

| Service / model | May the output be sold? | Catch |
| --- | --- | --- |
| Google AI Studio / Gemini API | Yes. Google "won't claim ownership". | Outputs of unpaid use may train Google; you carry the responsibility. |
| fal.ai | Yes, at your own risk. | Each model has its own licence: check its "Commercial use" badge. |
| Kling | Paid plans only. | The free Basic plan is not for commercial use. |
| MiniMax / Hailuo | Paid plans **(unv.)**. | — |
| Runway | You own the outputs on every plan. | The free plan watermarks. |
| Wan 2.1 / 2.2 | Yes (Apache-2.0, no claim on outputs). | — |
| Mochi | Yes (Apache-2.0). | — |
| CogVideoX 2B | Yes (Apache-2.0). | The 5B model has its own licence. |
| LTX-2.x | Free under $10M revenue. | — |
| HunyuanVideo | Commercial use allowed. | Not in the EU, UK or Korea; Bangladesh is fine. |
| Stable Video Diffusion | Free under $1M revenue. | — |

- **Copyright:** the US Copyright Office (Jan 2025) says prompts alone are not enough for copyright; human selection
  and editing can be protected. The Supreme Court declined Thaler v. Perlmutter on 2 Mar 2026. Bangladesh's Copyright
  Act 2023 is silent on AI. In practice, a raw AI clip is nobody's, while his script, voice, edit and design are his.
- **YouTube:** disclose realistic synthetic content (a real person saying what they did not, altered real events,
  realistic fake scenes, AI music as the focus). There is no disclosure for cartoons, colour fixes, AI scripts,
  captions or his own cloned voice. C2PA metadata can auto-label. The "inauthentic content" rule (Jul 2025, clarified
  Jul 2026) demonetises mass-produced template channels.
- **Meta:** the "AI info" label is automatic or self-declared. Photorealistic video must be disclosed. Political and
  social-issue ads must disclose AI. Since 1 Jun 2026 Meta labels ads it detects as made with outside AI tools.

**The five rules**
1. No real person's face or voice without written consent, and no political ads.
2. No brands, logos, film or cartoon characters, or studio styles, in prompts or in frames.
3. Music only from licensed libraries or his own. AI music needs disclosure.
4. Only paid plans, "commercial-use" models or permissively licensed weights. Keep a log per clip: model, plan, date, prompt.
5. Tick YouTube's and Meta's AI disclosure for realistic AI scenes, and mix AI clips with his own edit.

**Free GitHub: generation (none runs on this laptop)**

The only free GPU route is Kaggle: a T4 with 16 GB, about 30 h a week **(unv.)**. Colab's free tier forbids web UIs
for content generation.

| Repo | Licence | Hardware | Kaggle T4? |
| --- | --- | --- | --- |
| Wan-Video/Wan2.2 | Apache-2.0 | 5B model wants 24 GB; less with offload | slow (estimate) |
| deepbeepmeep/Wan2GP | Free; credit "Made with WanGP" only when selling the output itself | some models in 4–6 GB, NVIDIA / AMD only | likely (estimate) |
| lllyasviel/FramePack | Apache code; weights based on Hunyuan **(unv.)** | RTX, ≥ 6 GB | — |
| Lightricks/LTX-2 (2.5) | Free under $10M revenue | 32 GB, or a compressed copy in 10–12 GB | maybe |
| HunyuanVideo-1.5 / I2V | Tencent licence | ~14 GB with offload | — |
| CogVideoX 2B | Apache-2.0 | small | yes (estimate) |
| Mochi | Apache-2.0 | 20–60 GB | no |
| SkyReels-V2 | Skywork licence | 15–43 GB | — |
| Open-Sora | Apache-2.0 | ≥ 52 GB | no |
| LongCat-Video | MIT | multi-GPU | no |

**Free GitHub: CPU helpers that fit this laptop**

| Tool | Licence | Note |
| --- | --- | --- |
| Depth-Anything-V2-**Small** | Apache-2.0 | ~99 MB; 2.5D parallax from a photo. Base and Large are non-commercial (CC-BY-NC). |
| rembg | MIT | Use u2net / isnet / birefnet-general-lite. The DEFAULT bria-rmbg model needs a paid licence. |
| MediaPipe | Apache-2.0 | Face and pose: reframing talking heads. |
| PySceneDetect | BSD-3 | Finds the cuts in a clip. |
| Real-ESRGAN ncnn-vulkan | BSD-3 | Upscaling; Windows build runs on Intel graphics. |
| RIFE ncnn-vulkan | MIT | Smoother motion and slow-mo; Windows build runs on Intel graphics. |
| auto-editor | Unlicense | Now a standalone program, not a pip package. |
| WhisperX | BSD-2 | NO Bengali alignment model, so not useful here. |

Install cleanly into tools/pyenv on CPU, each model under 500 MB:
- MediaPipe;
- `rembg[cpu]`, which uses the installed onnxruntime;
- Depth-Anything-V2-Small, through ONNX;
- PySceneDetect.

Any download or install needs his OK first.

**Motion-graphics frameworks:** Motion Canvas (MIT), Revideo (MIT, maintenance unclear), Remotion (free for an
individual or up to 3 employees), Theatre.js (core Apache, studio AGPL), Manim and lottie-web (MIT). HyperFrames
already covers this.

**Free footage**

| Source | Key | Licence | Credit? |
| --- | --- | --- | --- |
| Pexels | free key | commercial OK, no resale | no |
| Pixabay | free key, cache results 24 h | no trademarks or logos in commercial use | no |
| Coverr | free key | no resale, no AI training | no |
| Mixkit | no API | Free Licence OK; "Restricted" items are personal only | no |
| Videvo | — | now Freepik; attribution licence | yes |
| NASA (images-api.nasa.gov) | no key | no logos, no implied endorsement | credit NASA |
| Wikimedia Commons | no key | per file; CC BY-SA passes on to his edit | yes, for CC files |
| Internet Archive | no key **(unv.)** | per item | depends |

**Keys he can add to `.env.local`, in this order (never paste one in chat)**
1. `PEXELS_API_KEY` (free)
2. `PIXABAY_API_KEY` (free)
3. `HF_TOKEN` (free; to download model weights)
4. `KAGGLE_USERNAME` + `KAGGLE_KEY` (free; the Wan2GP GPU route)
5. `COVERR_API_KEY` (free)
6. `FAL_KEY` (**paid**, ~$0.20–0.30 per 5 s)
7. `GEMINI_API_KEY` (key free; **video and images paid**)
8. `REPLICATE_API_TOKEN` (paid, optional)

Sources: ai.google.dev/terms and /gemini-api/docs/pricing · fal.ai/legal/terms-of-service and its model pages ·
app.klingai.com membership · help.runwayml.com usage rights · github.com/Wan-Video/Wan2.2 · github.com/deepbeepmeep/Wan2GP ·
github.com/lllyasviel/FramePack · huggingface.co/Lightricks/LTX-2.5 · github.com/genmoai/mochi · github.com/zai-org/CogVideo ·
stability.ai/license · copyright.gov/ai (Part 2 report) · support.google.com/youtube/answer/14328491 · about.fb.com (2026-02) ·
github.com/DepthAnything/Depth-Anything-V2 · github.com/danielgatis/rembg · github.com/hzwer/Practical-RIFE ·
github.com/xinntao/Real-ESRGAN · github.com/WyattBlue/auto-editor · github.com/m-bain/whisperX · pexels.com/license ·
pixabay.com/service/license-summary · coverr.co/license · mixkit.co/license · nasa.gov brand center · commons.wikimedia.org.
