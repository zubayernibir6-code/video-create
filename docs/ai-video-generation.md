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
