# Themes C + D: "Run AI free and offline on your own laptop" and "Free tools for video / content creators"

Research date: 2026-10-30. Every star count below was read from the repo's github.com page on 2026-10-30 (WebFetch, no api.github.com calls). Release dates were read from each repo's `/releases` page. GitHub's release headers do not always print the year in the fetched text; where the year was confirmed from asset timestamps, a build date or a commits page, that is noted. Where it was not confirmed, the note says "year not printed", and the final api.github.com check should confirm it. Difficulty scores (1 = double-click, 5 = developer) are my own judgement, not a sourced fact.

## Key Question 1: Which repos give the biggest real result for the least setup on a weak laptop (Windows, 8 GB RAM, no NVIDIA GPU)?

### Takeaway
Theme C: the real wins on an 8 GB, no-GPU laptop are 1–4B-parameter chat models (Ollama, Jan), offline Whisper transcription (Buzz) and document chat (AnythingLLM). Local image generation only works well with FastSD CPU's 1-step turbo models. Fooocus and ComfyUI are effectively NVIDIA-only for a beginner. Theme D: OBS (record), Subtitle Edit (Whisper subtitles), auto-editor (cut silences), LosslessCut (instant trims) and yt-dlp (download your own or permitted media) each give a same-day result with no GPU. Upscayl needs a Vulkan GPU, and most integrated GPUs fail. IOPaint is archived and Real-ESRGAN is stale.

### Cited Findings

#### Hardware reality check (applies to all of Theme C)
- A CPU-only test on an Intel i5 laptop with ~12 GB RAM and Intel UHD 620 integrated graphics, using Ollama (It's FOSS, 15 May 2026), gave these speeds: Qwen 3 0.6B ~34–36 tok/s (~500 MB), TinyLlama 1.1B ~25–28 tok/s, Gemma 3 1B ~18.6 tok/s (~815 MB), Gemma 4 E2B ~9.9 tok/s (~7 GB), Granite 4 3B ~8.5–9 tok/s (~2 GB), Phi 4 Mini 3.8B ~6.9 tok/s (~2.5 GB), OpenHermes 7B ~4.1–4.3 tok/s and Ministral 3 8B ~3.16 tok/s. The author recommends 1B–2B models for daily CPU use. — [It's FOSS](https://itsfoss.com/testing-local-llms-without-gpu)
- Jan's own rule of thumb (stated for macOS): "8GB RAM for 3B models, 16GB for 7B, 32GB for 13B." — [janhq/jan README](https://github.com/janhq/jan)
- Ollama model download sizes: gemma3:270m 292 MB, gemma3:1b 806 MB, gemma3:4b 3.4 GB (Gemma 3 supports "over 140 languages"). — [ollama.com/library/gemma3](https://ollama.com/library/gemma3)
- qwen3:0.6b 523 MB, qwen3:1.7b 1.4 GB, qwen3:4b 2.5 GB (256K context). The page says "Support of 100+ languages and dialects." — [ollama.com/library/qwen3](https://ollama.com/library/qwen3)
- Gemma 4 on Ollama: gemma4:e2b is a 4.6–7.5 GB download and gemma4:latest/e4b is 6.6–9.5 GB. The page calls E2B/E4B "made for edge device deployments". — [ollama.com/library/gemma4](https://ollama.com/library/gemma4)
  - Inference: Ollama's README quick-start model (`ollama run gemma4`) is too heavy for an 8 GB laptop. The reel should tell viewers to run `gemma3:1b`, `qwen3:1.7b` or at most `qwen3:4b` / `gemma3:4b`.
- Speed is capped by memory bandwidth more than by CPU power. A typical DDR4 laptop gives about 8 tok/s on a 7B Q4 model (blog estimate, lower-quality source). — reported in search results summarising [localaimaster.com](https://localaimaster.com/blog/run-llm-cpu-only) (not opened directly; treat as indicative)

#### Theme C: ranked list of 8 candidates
1. **Ollama**: the easiest and most-starred local LLM runner. Native Windows app with an API at localhost:11434. TOP 5.
2. **Jan**: a ChatGPT-style desktop app that runs 100% offline. TOP 5.
3. **Buzz**: offline Whisper transcription with SRT export, packaged as a desktop app. TOP 5.
4. **AnythingLLM (Desktop)**: chat with your PDFs/DOCX, with a built-in local engine. TOP 5 (16 GB is its recommended spec, so on 8 GB use a 1–2B model).
5. **FastSD CPU**: local image generation that is genuinely usable on a CPU. TOP 5.
6. **KoboldCpp**: one .exe, no install, does text + images + speech-to-text + TTS. BACKUP 1.
7. **llama.cpp**: the engine underneath many of these, now with a one-line installer and a built-in web UI. BACKUP 2.
8. **Open WebUI**: a polished ChatGPT-like web UI, but it needs Python 3.12 or Docker plus Ollama, which is heavy on 8 GB. Not in top 7.

Dropped or demoted, with the reason:
- **GPT4All**: no release since v3.10.0 (25 Feb 2025) and last commit 27 May 2025. — [releases](https://github.com/nomic-ai/gpt4all/releases); [commits](https://github.com/nomic-ai/gpt4all/commits/main)
- **Fooocus**: its README table lists CPU-only use at 32 GB system RAM, "about 17x slower than Nvidia RTX 3XXX". The minimum is a 4 GB NVIDIA GPU. Status is "Limited Long-Term Support (LTS) with Bug Fixes Only". — [lllyasviel/Fooocus](https://github.com/lllyasviel/Fooocus)
- **ComfyUI**: GPL-3.0, 144.1k stars. The portable build runs "on your CPU only", but the README gives no CPU performance figures, and its node-graph UI is a poor fit for beginners. Its "4GB vram + 8GB ram" claim assumes a GPU. — [Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI)
- **whisper.cpp**: MIT, 54.8k stars, v1.9.5 ("06 Oct", year not printed). The README shows only build-from-source steps (cmake). Beginners get it inside Buzz, Subtitle Edit and Shotcut instead. — [ggml-org/whisper.cpp](https://github.com/ggml-org/whisper.cpp); [releases](https://github.com/ggml-org/whisper.cpp/releases)
- **LocalAI**: not verified in this pass. It is developer and API oriented, so I dropped it rather than report unverified numbers.

#### Theme C fact sheets (top 5 + 2 backups)

##### C1. Ollama: ollama/ollama
- URL: https://github.com/ollama/ollama
- What it does: downloads and runs open AI chat models (Gemma, Qwen, Llama…) on your own PC, offline after download, with a local API other apps can use.
- Problem it solves for this viewer: a ChatGPT-like assistant with no subscription, no internet bill and no data leaving the laptop.
- Stars: ~185k (185.3k), read 2026-10-30. Licence: MIT. Not archived. — [repo](https://github.com/ollama/ollama)
- Latest release: v0.40.13, "28 Oct" (year not printed; v0.40.12 27 Oct and v0.40.11 24 Oct show a near-daily cadence). — [releases](https://github.com/ollama/ollama/releases)
- Windows install (verbatim from README): `irm https://ollama.com/install.ps1 | iex`, or "download manually" from https://ollama.com/download/OllamaSetup.exe — [repo](https://github.com/ollama/ollama)
- Prerequisites: "Windows 10 22H2 or newer, Home or Pro" and "at least 4GB of space for the binary install". "The Ollama install does not require Administrator, and installs in your home directory by default." The `OLLAMA_MODELS` variable moves models to another drive. The API is served on `http://localhost:11434`. "Ollama runs as a native Windows application." — [docs.ollama.com/windows](https://docs.ollama.com/windows)
- RAM/GPU: the docs give GPU driver notes for NVIDIA and AMD only and do not mention CPU-only use. — [docs](https://docs.ollama.com/windows). CPU-only works in practice: see the It's FOSS speeds above. — [It's FOSS](https://itsfoss.com/testing-local-llms-without-gpu)
- First use:
  1. Run the installer.
  2. Open PowerShell and type `ollama run gemma3:1b` (806 MB download). — [gemma3 page](https://ollama.com/library/gemma3)
  3. Type a question at the prompt and the answer streams back offline.
  (The README's own example is `ollama run gemma4`, which is too big for 8 GB.) — [repo](https://github.com/ollama/ollama)
- Hook: on a plain i5 laptop with only Intel UHD 620 graphics, Qwen 3 0.6B ran at ~35 tokens/s on the CPU, faster than you can read. — [It's FOSS](https://itsfoss.com/testing-local-llms-without-gpu)
- Caveats: the default/README model needs far more than 8 GB. Ollama also lists "cloud" model tags (e.g. `gemma4:cloud`), which are not offline. — [gemma4 page](https://ollama.com/library/gemma4). Small 1–4B models give noticeably weaker answers than ChatGPT (inference).
- Difficulty: 2/5.
- Bengali: depends on the model. Qwen3 officially lists Bengali among its 119 languages ("Hindi, Punjabi, Bengali, Oriya…"). — [Qwen3 blog](https://qwenlm.github.io/blog/qwen3/). Gemma 3 claims 140+ languages (Bengali not individually confirmed on that page). — [gemma3 page](https://ollama.com/library/gemma3). Bengali answer quality at 0.6–4B is NOT verified (see Gaps).

##### C2. Jan: janhq/jan
- URL: https://github.com/janhq/jan
- What it does: a desktop app that looks like ChatGPT and runs AI models on your own computer.
- Problem it solves: point-and-click offline AI chat for someone who has never opened a terminal.
- Stars: ~45k (45.2k), read 2026-10-30. Licence: Apache-2.0. Not archived. — [repo](https://github.com/janhq/jan)
- Latest release: 0.8.8, "28 Oct" (year not printed; 0.8.7 was 20 Oct). — [releases](https://github.com/janhq/jan/releases)
- Windows install: "Download from jan.ai or GitHub Releases". The Windows asset is `Jan_0.8.8_x64-setup.exe` (ARM: `Jan_0.8.8_arm64-setup.exe`). — [repo](https://github.com/janhq/jan); [releases](https://github.com/janhq/jan/releases)
- Requirements: "Windows: 10+ with GPU support for NVIDIA/AMD/Intel Arc". RAM is stated only for macOS: "8GB RAM for 3B models". — [repo](https://github.com/janhq/jan)
- First use:
  1. Install the setup .exe.
  2. Inside the app, download a small model ("Download and run LLMs (Llama, Gemma, Qwen, GPT-oss etc.) from HuggingFace"), for example a 1–3B one.
  3. Chat. — [repo](https://github.com/janhq/jan) (exact button names not verified)
- Hook: "runs 100% offline on your computer", and it also exposes an "OpenAI-Compatible API" at `localhost:1337` for other apps. — [repo](https://github.com/janhq/jan)
- Caveats: on 8 GB stay at ≤3B models (its own rule of thumb). Jan can also connect to cloud models, which are not free or offline (inference from "Everything runs locally when you want it to"). — [repo](https://github.com/janhq/jan)
- Difficulty: 1/5.
- Bengali: same as Ollama, model-dependent. Qwen3 lists Bengali. — [Qwen3 blog](https://qwenlm.github.io/blog/qwen3/)

##### C3. Buzz: chidiwilliams/buzz
- URL: https://github.com/chidiwilliams/buzz
- What it does: turns audio or video (including a YouTube link) into text and subtitles offline using OpenAI's Whisper.
- Problem it solves: free transcripts and SRT captions for lectures, interviews and your own videos, with no upload and no per-minute fee.
- Stars: ~22k (22.3k), read 2026-10-30. Licence: MIT. Not archived. — [repo](https://github.com/chidiwilliams/buzz)
- Latest release: v1.4.5, "23 Aug" (year not printed). Latest commit Oct 30, 2026 ("Restart every selected transcription with its saved options (#1681)"), so it is very active. — [releases](https://github.com/chidiwilliams/buzz/releases); [commits](https://github.com/chidiwilliams/buzz/commits/main)
- Windows install: "Get the installation files from the SourceForge". The release notes say to download all three Windows files (one `*.exe` and both `*.bin`) and run the `.exe`. "App is not signed, you will get a warning when you install it. Select `More info` -> `Run anyway`." The alternative is `pip install buzz-captions` then `python -m buzz` on Python 3.12. — [repo](https://github.com/chidiwilliams/buzz); [releases](https://github.com/chidiwilliams/buzz/releases)
- RAM/GPU: Buzz runs Whisper models whose memory needs, per the whisper.cpp table, are tiny ~273 MB, base ~388 MB, small ~852 MB, medium ~2.1 GB and large ~3.9 GB. — [whisper.cpp](https://github.com/ggml-org/whisper.cpp). "Vulkan acceleration support for Whisper.cpp on most GPUs, including integrated GPUs." — [repo](https://github.com/chidiwilliams/buzz)
- First use:
  1. Install from SourceForge (accept the unsigned warning).
  2. Open an audio/video file or paste a YouTube link, pick a Whisper model and the language.
  3. Export TXT/SRT/VTT ("Export transcripts to TXT, SRT, and VTT"). — [repo](https://github.com/chidiwilliams/buzz)
- Hook: "Transcribe and translate audio offline on your personal computer". It even accepts YouTube links. — [repo](https://github.com/chidiwilliams/buzz)
- Caveats: unsigned installer (SmartScreen warning). Transcribing YouTube links falls under the same ToS caveats as yt-dlp (D5). Large models on CPU are slow (inference).
- Difficulty: 2/5.
- Bengali: Whisper's language list includes `"bn": "bengali"`. — [openai/whisper tokenizer.py](https://github.com/openai/whisper/blob/main/whisper/tokenizer.py). Quality is modest. A Bengali fine-tune's model card reports zero-shot Whisper-large-v3 at ~30.5 % character error rate on FLEURS Bengali. — [BuzzASR/bengali model card](https://huggingface.co/BuzzASR/bengali) (search-result level; "BuzzASR" is unrelated to the Buzz app). Small and base models will be worse (inference). Expect to edit Bengali captions by hand.

##### C4. AnythingLLM: Mintplex-Labs/anything-llm
- URL: https://github.com/Mintplex-Labs/anything-llm
- What it does: a desktop app where you drop in PDFs, Word files or text and chat with them using a local AI model.
- Problem it solves: "ask your notes / ask this 80-page PDF" for students and small offices, privately.
- Stars: ~68k (67.7k), read 2026-10-30. Licence: MIT. Not archived. — [repo](https://github.com/Mintplex-Labs/anything-llm)
- Latest release: v1.19.0, "26 Oct" (year not printed; v1.18.0 13 Oct). — [releases](https://github.com/Mintplex-Labs/anything-llm/releases)
- Windows install: "AnythingLLM for desktop (Mac, Windows, & Linux)!" via https://anythingllm.com/download — [repo](https://github.com/Mintplex-Labs/anything-llm)
- Requirements: the recommended spec for a basic experience is "16GB" RAM and an "8-core CPU (any)". Storage "varies" by model size. — [docs: system requirements](https://docs.anythingllm.com/installation-desktop/system-requirements)
- First use:
  1. Install the desktop app.
  2. Choose the "Built-in local LLM engine" ("Run local models on your CPU or GPU" with "no extra setup", powered by Lemonade and llama.cpp) or point it at Ollama.
  3. Upload a PDF/DOCX ("Multiple document type support (PDF, TXT, DOCX, etc)") and ask questions. — [repo](https://github.com/Mintplex-Labs/anything-llm)
- Hook: one app turns any PDF into something you can chat with, and it "runs locally by default with zero setup friction". — [repo](https://github.com/Mintplex-Labs/anything-llm)
- Caveats: 8 GB is half its recommended RAM, so use a 1–2B model and expect slow answers (inference from the docs + It's FOSS speeds). Cloud providers need an API key and are not free. — [docs](https://docs.anythingllm.com/installation-desktop/system-requirements). The README links a paid "Hosted Instance". Whether the desktop app is free is not stated on the README (see Gaps).
- Difficulty: 2/5.
- Bengali: depends on the chosen model and embedder. Not verified for Bengali PDFs.

##### C5. FastSD CPU: rupeshs/fastsdcpu
- URL: https://github.com/rupeshs/fastsdcpu
- What it does: generates AI images from a text prompt on an ordinary CPU, using fast 1–4-step Stable Diffusion variants and OpenVINO.
- Problem it solves: AI thumbnails and illustrations without an NVIDIA card or a paid image site.
- Stars: ~2.2k, read 2026-10-30. Licence: MIT. Not archived. — [repo](https://github.com/rupeshs/fastsdcpu)
- Latest release: v1.0.0-beta.610, "25 Oct" (year not printed; a pre-release; adds FLUX.3 Image Klein OpenVINO support). — [releases](https://github.com/rupeshs/fastsdcpu/releases)
- Windows install (verbatim): "You must have a working Python and uv installation.(Recommended : Python 3.10 or higher)". "Double click `install.bat`". "To start desktop GUI double click `start.bat`" or "start-webui.bat" for the web UI. — [repo](https://github.com/rupeshs/fastsdcpu)
- RAM: the README's minimum-RAM table lists LCM 2 GB, LCM-LoRA 4 GB, OpenVINO (Flux2) 8 GB, Iris 3B 8.4 GB. FLUX.1-schnell needs ~30 GB, so it is not for this audience. — [repo](https://github.com/rupeshs/fastsdcpu)
- Speed (Core i7-12700, 512×512): SD Turbo OpenVINO + TAESD 1.7 s; SDXS-512-0.9 OpenVINO + TAESD 0.82 s; SDXL Turbo OpenVINO + TAESDXL 2.5 s. — [repo](https://github.com/rupeshs/fastsdcpu). Inference: a 2018-era laptop i5 will be several times slower. Not measured.
- First use:
  1. Install Python + uv, double-click `install.bat`.
  2. Double-click `start.bat`.
  3. Type a prompt and an image appears in seconds to tens of seconds.
- Hook: "0.82 seconds (820 milliseconds) to create a single 512x512 image on a Core i7-12700", with no GPU. — [repo](https://github.com/rupeshs/fastsdcpu)
- Caveats: needs Python + uv (the hardest install in this list). Quality at 1 step is lower than Midjourney-class tools (inference). Releases are tagged beta. Check each model's own licence before commercial use (not verified per model).
- Difficulty: 3/5.
- Bengali: prompts are expected in English. Rendering Bengali text inside images is not verified and unlikely with SD-class models (inference).

##### C-Backup 1. KoboldCpp: LostRuins/koboldcpp
- URL: https://github.com/LostRuins/koboldcpp
- What it does: one program file that runs AI chat models, plus image generation, speech-to-text and text-to-speech, with a browser UI.
- Problem it solves: "AI everything" from a single .exe with nothing to install.
- Stars: ~12k (12.1k), read 2026-10-30. Licence: AGPL-3.0. Not archived. — [repo](https://github.com/LostRuins/koboldcpp)
- Latest release: v1.123.1, "13 Oct" (year not printed). — [releases](https://github.com/LostRuins/koboldcpp/releases)
- Windows install (verbatim): "Download koboldcpp.exe and double-click it to open the launcher." "If you do not need NVIDIA CUDA support, koboldcpp-nocuda.exe is a smaller download with CPU and Vulkan support." — [repo](https://github.com/LostRuins/koboldcpp)
- RAM: "the model size and context length determine how much memory you need". If you run out, "Try a smaller model or a shorter context." — [repo](https://github.com/LostRuins/koboldcpp)
- First use:
  1. Download `koboldcpp-nocuda.exe` and double-click it.
  2. Load a small GGUF model file in the launcher (you download the model separately; inference).
  3. Launch, and chat in the browser UI.
- Hook: one .exe also does images ("Stable Diffusion 1.5, SDXL, SD3, Flux…"), "Speech-to-text with Whisper" and TTS (Kokoro and others). — [repo](https://github.com/LostRuins/koboldcpp)
- Caveats: the README warns koboldcpp.com is a malicious fake. Use GitHub releases or koboldcpp.net only. Image generation on CPU will be slow (inference). — [repo](https://github.com/LostRuins/koboldcpp)
- Difficulty: 2/5.
- Bengali: model-dependent (same as Ollama). Whisper STT includes Bengali. — [tokenizer.py](https://github.com/openai/whisper/blob/main/whisper/tokenizer.py)

##### C-Backup 2. llama.cpp: ggml-org/llama.cpp
- URL: https://github.com/ggml-org/llama.cpp
- What it does: the core engine that runs AI models efficiently on ordinary CPUs, now with its own simple installer and a built-in chat web page.
- Problem it solves: the lightest-weight way to run a small model, best for the "how it works under the hood" episode.
- Stars: ~133k (132.8k), read 2026-10-30. Licence: MIT. Not archived. — [repo](https://github.com/ggml-org/llama.cpp)
- Latest release: not captured in this pass (see Gaps). 12,014 commits on master. — [repo](https://github.com/ggml-org/llama.cpp)
- Windows install (verbatim): `irm https://llama.app/install.ps1 | iex` (PowerShell), or "Download pre-built binaries from the releases page". A `winget install llama.cpp` command is NOT shown in the README. — [repo](https://github.com/ggml-org/llama.cpp)
- First use (verbatim quick start):
  1. `llama cli -hf ggml-org/Qwen3.5-0.8B-GGUF` (chat in the terminal).
  2. Or `llama serve -hf ggml-org/Qwen3.5-0.8B-GGUF`, which gives a "Built-in web UI". — [repo](https://github.com/ggml-org/llama.cpp)
- Hook: it is the engine behind other apps. AnythingLLM's built-in local engine is "powered by Lemonade and llama.cpp". — [AnythingLLM README](https://github.com/Mintplex-Labs/anything-llm)
- Caveats: terminal-only setup. Note the new space-separated command names (`llama cli`, not `llama-cli`). Older tutorials will be wrong. — [repo](https://github.com/ggml-org/llama.cpp)
- Difficulty: 3/5.
- Bengali: the quick-start model is Qwen3.5 0.8B. Whether Qwen3.5 handles Bengali is not verified here. Qwen3 lists Bengali. — [Qwen3 blog](https://qwenlm.github.io/blog/qwen3/)

##### (Ranked #8, not in top 7) Open WebUI: open-webui/open-webui
- Stars ~157k (157.2k), read 2026-10-30. The licence is a custom "Open WebUI License" with a branding-retention clause, not a plain SPDX licence. Latest release v0.12.5, "29 Oct" (year not printed). — [repo](https://github.com/open-webui/open-webui); [releases](https://github.com/open-webui/open-webui/releases)
- Install: `pip install open-webui` then `open-webui serve` ("ensure you're using **Python 3.12**"). It serves on http://localhost:8080. The Docker CPU option is the `ghcr.io/open-webui/open-webui:ollama` image. — [repo](https://github.com/open-webui/open-webui)
- Why not top 7: it needs Python 3.12 or Docker and a separate model runner (Ollama), and it adds a web server on top of an 8 GB machine (inference). Jan gives the same ChatGPT-like UX in one installer.

#### Theme D: ranked list of 8 candidates
1. **OBS Studio**: record your screen, face cam and voice. TOP 5.
2. **Subtitle Edit**: Whisper subtitles from speech, with Bengali selectable, and a full subtitle editor. TOP 5.
3. **auto-editor**: cuts silences automatically and can export a timeline to Premiere, Resolve, Final Cut, Shotcut or Kdenlive. TOP 5.
4. **LosslessCut**: trims and joins video in seconds with no re-encoding. TOP 5.
5. **yt-dlp**: downloads your own or permitted media from "thousands of sites". TOP 5, with a strong legal caveat.
6. **Kdenlive**: full editor with automatic subtitles (Whisper/VOSK) and local SAM2 background removal. BACKUP 1.
7. **HandBrake**: compresses and converts video for upload or WhatsApp. BACKUP 2.
8. **Shotcut**: editor with built-in Whisper speech-to-text (since 24.10). Overlaps Kdenlive.

Dropped or demoted, with the reason:
- **Upscayl**: AGPL-3.0, 51.3k stars, the easiest upscaler UI. But "You'll need a Vulkan compatible GPU" and "Upscayl won't work with most iGPUs or CPUs". The last release is v2.15.0 (25 Dec 2024; asset timestamps 2024-12-25) and the last commit Mar 27, 2026. — [repo](https://github.com/upscayl/upscayl); [releases](https://github.com/upscayl/upscayl/releases); [commits](https://github.com/upscayl/upscayl/commits/main)
- **rembg**: MIT, 25.2k stars, v2.0.86 ("21 Oct", year not printed). It works on CPU (`pip install "rembg[cpu,cli]"`, `rembg i input.png output.png`), but it needs Python 3.11–3.13 and pip, so difficulty is 4. Its DEFAULT model bria-rmbg (RMBG-2.0) "is released under a BRIA license that requires a paid agreement for commercial use". Use `-m` to pick another model, e.g. `rembg i -m u2netp …`. — [repo](https://github.com/danielgatis/rembg); [releases](https://github.com/danielgatis/rembg/releases). Kdenlive's local SAM2 masking covers video background removal for beginners.
- **IOPaint** (object/watermark eraser): "archived by the owner on Aug 13, 2025. It is now read-only." — [Sanster/IOPaint](https://github.com/Sanster/IOPaint)
- **Real-ESRGAN**: BSD-3-Clause, 37.3k stars. Last commit Apr 2, 2024, and the previous code commit was Sep 20, 2022. — [commits](https://github.com/xinntao/Real-ESRGAN/commits/master)

#### Theme D fact sheets (top 5 + 2 backups)

##### D1. OBS Studio: obsproject/obs-studio
- URL: https://github.com/obsproject/obs-studio
- What it does: records (and live-streams) your screen, webcam and microphone together.
- Problem it solves: a free, watermark-free screen and facecam recorder for tutorials, classes and Reels.
- Stars: ~79k (78.6k), read 2026-10-30. Licence: GPL-2.0-or-later. Not archived. — [repo](https://github.com/obsproject/obs-studio); [Wikipedia](https://en.wikipedia.org/wiki/OBS_Studio)
- Latest release: OBS Studio 33.0.1, 29 Oct 2026 (asset timestamps 2026-10-29). — [releases](https://github.com/obsproject/obs-studio/releases)
- Windows install: `OBS-Studio-33.0.1-Windows-x64-Installer.exe` from GitHub Releases. The README itself only links to obsproject.com. — [releases](https://github.com/obsproject/obs-studio/releases); [repo](https://github.com/obsproject/obs-studio)
- RAM/GPU: no requirement found in the README (see Gaps).
- First use (general knowledge of the UI, not re-verified against docs today):
  1. Install and open it.
  2. In Sources, click + and add Display Capture (plus a Video Capture Device for the webcam).
  3. Click Start Recording, and the file lands in your Videos folder.
- Hook: OBS began as a small project by one person (Lain Bailey) in 2012. In Dec 2021 a developer raised concerns that TikTok's Live Studio appeared to be built on OBS code without credit. — [Wikipedia](https://en.wikipedia.org/wiki/OBS_Studio)
- Caveats: recording at 1080p on a weak iGPU laptop may drop frames (inference; no source). Recording other people's copyrighted streams is a legal issue, not a technical one.
- Difficulty: 2/5.
- Bengali: language-agnostic (it records whatever is on screen). Bengali UI translation not verified.

##### D2. Subtitle Edit: SubtitleEdit/subtitleedit
- URL: https://github.com/SubtitleEdit/subtitleedit
- What it does: makes subtitles automatically from a video's speech (Whisper), then lets you fix the text and timing and export SRT and other formats.
- Problem it solves: Bengali or English captions for Reels and YouTube without paying a captioning app.
- Stars: ~15k (14.8k), read 2026-10-30. Licence: MIT. Not archived. — [repo](https://github.com/SubtitleEdit/subtitleedit)
- Latest stable release: v5.3.0, 14 Oct 2026 (build date 2026-10-14). The newest pre-release is v5.4.0-beta11 (30 Oct 2026). — [releases/latest](https://github.com/SubtitleEdit/subtitleedit/releases/latest); [releases](https://github.com/SubtitleEdit/subtitleedit/releases)
- Windows install: `SubtitleEdit-Windows-x64-Setup.exe` (installer) or `SubtitleEdit-Windows-x64.zip` from Releases. It needs "Windows 10 version 22H2 (build 19045) or newer, fully updated." — [releases/latest](https://github.com/SubtitleEdit/subtitleedit/releases/latest); [repo](https://github.com/SubtitleEdit/subtitleedit)
- RAM/GPU: CPU-only engines are available (Whisper.cpp, Whisper CTranslate2). GPU engines are optional (cuBLAS, Vulkan, Purfview Faster-Whisper-XXL with NVIDIA CUDA, Const-me DirectX). — [Speech-to-text docs](https://niksedk.github.io/subtitleedit-avalonia/features/speech-to-text.html)
- First use:
  1. Open the video.
  2. Go to "Video → Speech to text (Whisper)…", choose an engine and model, and "Select the Language of the audio".
  3. Generate, review, and save as .srt. "Engines and models are downloaded automatically on first use." — [docs](https://niksedk.github.io/subtitleedit-avalonia/features/speech-to-text.html)
- Hook: it offers 8 different speech-to-text engines in one menu and downloads the AI model for you on first use. — [docs](https://niksedk.github.io/subtitleedit-avalonia/features/speech-to-text.html)
- Caveats: the README notes optional third-party online services for translation, speech-to-text, TTS and OCR. Those are not offline. — [repo](https://github.com/SubtitleEdit/subtitleedit). Forum users report Whisper still misses some dialogue and recommend tuning (e.g. `--condition_on_previous_text False`). — [VideoHelp forum (search result)](https://forum.videohelp.com/showthread.php?p=2785320)
- Difficulty: 2/5.
- Bengali: Whisper supports Bengali (`"bn": "bengali"`). — [tokenizer.py](https://github.com/openai/whisper/blob/main/whisper/tokenizer.py). Accuracy caveat as in C3 (~30 % CER zero-shot for large-v3 on FLEURS, per a model card). — [BuzzASR/bengali](https://huggingface.co/BuzzASR/bengali). Rendering Bengali in the Subtitle Edit editor UI is not verified.

##### D3. auto-editor: WyattBlue/auto-editor
- URL: https://github.com/WyattBlue/auto-editor
- What it does: automatically cuts the silent or dead parts out of a video. It can also hand the cut timeline to Premiere, DaVinci Resolve, Final Cut, Shotcut or Kdenlive.
- Problem it solves: turns a 20-minute raw talking recording into a tight video in one command, which saves hours of manual cutting.
- Stars: ~5.7k, read 2026-10-30. Licence: Unlicense (public domain). Not archived. Written in Nim. — [repo](https://github.com/WyattBlue/auto-editor)
- Latest release: 31.8.0, 30 Oct 2026 (asset dates 2026-10-30). — [releases](https://github.com/WyattBlue/auto-editor/releases); [assets](https://github.com/WyattBlue/auto-editor/releases/expanded_assets/31.8.0)
- Windows install (verbatim): "Go to the Releases page on GitHub, and download the binary for your platform." "Rename the binary to auto-editor (or auto-editor.exe for Windows)." The Windows asset is `auto-editor-windows-x86_64.exe` (43.4 MB). "Because the binaries are unsigned, you may get "Unknown developer" warnings." Note: "The auto-editor cli is no longer being published on pip." — [auto-editor.com/installing](https://auto-editor.com/installing); [assets](https://github.com/WyattBlue/auto-editor/releases/expanded_assets/31.8.0)
- RAM/GPU: none stated. It is a command-line tool and does not use AI models (inference).
- First use:
  1. Put `auto-editor.exe` next to your video.
  2. In a terminal run `auto-editor path/to/your/video.mp4`.
  3. Get a new, cut file. Adjust the pace with `--margin` (default 0.2 s), e.g. `auto-editor example.mp4 --margin 0.2sec`, or send it to an editor with `--export premiere` / `--export resolve` / `--export final-cut-pro` / `--export shotcut` / `--export kdenlive`. — [repo](https://github.com/WyattBlue/auto-editor)
- Hook: it is public domain, so you can do anything with it, and it writes a ready-made Premiere/Resolve/Kdenlive timeline instead of just a video. — [repo](https://github.com/WyattBlue/auto-editor)
- Caveats: terminal only. It cuts by loudness, not meaning, so it can clip breaths or quiet words (inference). Whether the Windows binary bundles FFmpeg is not stated (see Gaps).
- Difficulty: 3/5.
- Bengali: language-independent (it works on audio loudness), so it works the same for Bengali speech (inference from how it works).

##### D4. LosslessCut: mifi/lossless-cut
- URL: https://github.com/mifi/lossless-cut
- What it does: trims, splits and joins videos in seconds without re-encoding, so there is no quality loss.
- Problem it solves: cut the good part out of a 2 GB phone or OBS recording instantly on a weak laptop.
- Stars: ~46k (45.5k), read 2026-10-30. Licence: GPL-2.0. Not archived. — [repo](https://github.com/mifi/lossless-cut)
- Latest release: 3.70.2, 28 Oct 2026 (asset timestamps 2026-10-28). — [releases](https://github.com/mifi/lossless-cut/releases)
- Windows install (verbatim): "Windows: 7zip" → https://github.com/mifi/lossless-cut/releases/latest/download/LosslessCut-win-x64.7z. "If you prefer to download the executables manually, this will of course always be free." Windows 7/8/8.1 are "no longer supported after v3.50.0." — [repo](https://github.com/mifi/lossless-cut)
- First use:
  1. Download the .7z and extract it.
  2. Run LosslessCut and drag a video in.
  3. Mark the start and end of a segment and export ("Cut and trim video and audio losslessly, in seconds"). — [repo](https://github.com/mifi/lossless-cut) (button names not verified)
- Hook: one developer maintains it, it "will always remain free and open source", and it cuts "in seconds" because it never re-encodes. — [repo](https://github.com/mifi/lossless-cut)
- Caveats: the store versions (Microsoft Store) are the paid way to support the developer. The price is not stated. Cuts land on keyframes, so they can be slightly off the exact frame (inference from lossless cutting in general; not sourced here).
- Difficulty: 1/5.
- Bengali: not applicable (no text or speech processing).

##### D5. yt-dlp: yt-dlp/yt-dlp
- URL: https://github.com/yt-dlp/yt-dlp
- What it does: a command-line downloader for video and audio from "thousands of sites".
- Problem it solves: back up your OWN uploads (e.g. a lost original), or save Creative-Commons or permitted clips for remixing.
- Stars: ~204k (203.9k, the most-starred repo in either theme), read 2026-10-30. Licence: Unlicense (the PyInstaller .exe builds: "the combined work is licensed under GPLv3+"). Not archived. — [repo](https://github.com/yt-dlp/yt-dlp)
- Latest release: 2026.10.26 (26 Oct 2026). Python 3.11+ is now the minimum, and the official Windows binaries require Windows 10+. — [releases](https://github.com/yt-dlp/yt-dlp/releases)
- Windows install (verbatim): "yt-dlp.exe": "Windows (Win10+) standalone x64 binary (recommended for **Windows**)". ffmpeg is "Strongly recommended" ("Required for merging separate video and audio files"). deno is the recommended JavaScript runtime, which yt-dlp-ejs needs and which is "Required for full YouTube support". A winget id is not given in the README. — [repo](https://github.com/yt-dlp/yt-dlp)
- First use:
  1. Put `yt-dlp.exe` (and ffmpeg) in a folder.
  2. Run `yt-dlp [OPTIONS] [--] URL` with the link to your own video.
  3. The file downloads into that folder. — [repo](https://github.com/yt-dlp/yt-dlp)
- Hook: its ancestor youtube-dl was taken down from GitHub under a DMCA notice, then reinstated on 16 Nov 2020. GitHub concluded "the allegations did not establish a violation of the law" and pledged $1M to a developer defense fund. — [GitHub blog](https://github.blog/news-insights/policy-news-and-insights/standing-up-for-developers-youtube-dl-is-back/)
- Caveats (legal, important): YouTube's Terms (effective 5 Jan 2022) forbid you to "access, reproduce, download, distribute…" content except where the service expressly authorises it. — [YouTube Terms](https://www.youtube.com/t/terms). The reel must say: only your own content, content with permission, or openly licensed content. Re-uploading others' videos risks copyright strikes. Technically it needs ffmpeg and deno for full YouTube support. — [repo](https://github.com/yt-dlp/yt-dlp)
- Difficulty: 3/5.
- Bengali: not applicable. (It can download available subtitle tracks, but Bengali subtitle handling was not verified in this pass.)

##### D-Backup 1. Kdenlive: KDE/kdenlive (GitHub mirror of invent.kde.org)
- URL: https://github.com/KDE/kdenlive (development happens at invent.kde.org/multimedia/kdenlive)
- What it does: a full multi-track video editor that can also write subtitles from speech and remove a video's background, all on your own PC.
- Problem it solves: a free Premiere/CapCut-desktop alternative with AI helpers and no watermark.
- Stars: ~6.0k (mirror only), read 2026-10-30. Licence: GPL-3.0. Not archived. — [repo](https://github.com/KDE/kdenlive)
- Latest release: 26.08.2 (current stable on kdenlive.org, read 2026-10-30). — [kdenlive.org/download](https://kdenlive.org/download/)
- Windows install: "Installable" or "Standalone" builds from kdenlive.org/download. "Requires Windows 10 or newer." — [kdenlive.org/download](https://kdenlive.org/download/)
- AI features: "you can configure and set up both, VOSK and Whisper, for speech recognition". The Automatic Subtitling dialog creates and fills a subtitle track. — [Kdenlive docs: speech to text](https://docs.kdenlive.org/en/effects_and_filters/speech_to_text.html). Since 25.04 (28 Apr 2025): "A new plugin based on the SAM2 model now allows you to create object masks to remove the background of your videos", and "All processing is done locally." — [Kdenlive 25.04.0 release notes](https://kdenlive.org/news/releases/25.04.0/)
- First use:
  1. Install it.
  2. Drag clips onto the timeline.
  3. Use the Automatic Subtitling dialog after configuring Whisper/VOSK in settings. — [docs](https://docs.kdenlive.org/en/effects_and_filters/speech_to_text.html)
- Hook: a free editor that removes a video's background with Meta's SAM2 model, offline. — [release notes](https://kdenlive.org/news/releases/25.04.0/)
- Caveats: the speech and SAM2 plugins download models on setup. The optional SeamlessM4T translation model is ~9 GB and "can occupy 100% RAM, 100% CPU and 100% disk access", which is bad on 8 GB. — [docs](https://docs.kdenlive.org/en/effects_and_filters/speech_to_text.html). SAM2 speed on CPU is not verified.
- Difficulty: 3/5.
- Bengali: Whisper autodetects language and Bengali is in Whisper's list. VOSK Bengali model availability is not verified. — [docs](https://docs.kdenlive.org/en/effects_and_filters/speech_to_text.html); [tokenizer.py](https://github.com/openai/whisper/blob/main/whisper/tokenizer.py)

##### D-Backup 2. HandBrake: HandBrake/HandBrake
- URL: https://github.com/HandBrake/HandBrake
- What it does: converts and compresses any video into smaller MP4/MKV files with ready presets.
- Problem it solves: shrink a huge recording so it uploads on slow mobile data or fits WhatsApp and Facebook limits.
- Stars: ~25k (24.8k), read 2026-10-30. Licence: GPL-2.0. Not archived. — [repo](https://github.com/HandBrake/HandBrake)
- Latest release: 1.11.2, 7 Jun 2026 (asset timestamps 2026-06-07). — [releases](https://github.com/HandBrake/HandBrake/releases)
- Windows install: `HandBrake-1.11.2-x86_64-Win_GUI.exe`. "Windows users, please make sure to install Microsoft .NET Desktop Runtime version 10.0". — [releases](https://github.com/HandBrake/HandBrake/releases)
- First use (general UI knowledge, not re-verified):
  1. Open the video.
  2. Pick a preset (e.g. a "Fast 1080p" type preset).
  3. Click Start Encode.
- Hook: it is built on FFmpeg, x264, x265 and SVT-AV1, the same encoders professionals use. — [repo](https://github.com/HandBrake/HandBrake)
- Caveats: encoding is CPU-heavy and slow on old laptops (inference). It needs the separate .NET 10 runtime install.
- Difficulty: 2/5.
- Bengali: not applicable.

##### (Ranked #8) Shotcut: mltframework/shotcut
- Stars ~15.5k, read 2026-10-30. Licence GPL-3.0. Latest release v26.9.27, 28 Sep 2026 (asset timestamps). Windows: `shotcut-win64-26.9.27.exe` or a portable `.zip`. — [repo](https://github.com/mltframework/shotcut); [releases](https://github.com/mltframework/shotcut/releases)
- Since 24.10.29 (29 Oct 2024): "Shotcut gets its first AI based on OpenAI's Whisper, courtesy of the whisper.cpp project", under "Subtitles > Speech to Text". "Our builds include a basic model". — [Shotcut blog](https://shotcut.org/blog/new-release-241029/)
- Why ranked below Kdenlive: overlaps Kdenlive (editor + Whisper) but has no background-removal feature. A forum user reported worse built-in Whisper results than standalone whisper.cpp. — [Shotcut forum via search](https://forum.shotcut.org/t/speech-to-text-subtitles/46306)

### Inferences
- Biggest result for least setup, Theme C: Jan (1/5) and Ollama (2/5) with a 1–2B model give a working offline chatbot in under 30 minutes on 8 GB. Buzz gives offline transcripts the same day. AnythingLLM works but is below its recommended spec. FastSD CPU is the only realistic image generator for this hardware, and it needs Python.
- Biggest result for least setup, Theme D: LosslessCut (1/5), OBS (2/5) and Subtitle Edit (2/5) are installer-and-go. auto-editor and yt-dlp are single .exe files but need a terminal.
- Suggested episode split (10 videos, 5 repos each). One Theme C episode could be: Ollama, Jan, Buzz, AnythingLLM, FastSD CPU. One Theme D episode could be: OBS, auto-editor, Subtitle Edit, LosslessCut, yt-dlp, in "record → cut silences → subtitle → trim → (backup)" order, which reads as a pipeline story.
- Overlap inside these two themes: Buzz, Subtitle Edit, Kdenlive and Shotcut all wrap Whisper. Keep Buzz in C ("offline AI") and Subtitle Edit in D ("creator subtitles") so the two episodes don't repeat.
- Belongs elsewhere (cross-fits for other researchers):
  - ShareX and PowerToys go to Windows PC utilities.
  - Bengali-specific ASR fine-tunes (e.g. mozilla-ai/whisper-large-v3-turbo-bn, BuzzASR/bengali) and Bengali LLMs go to Bangla-language tools.
  - AnythingLLM's agent features and n8n-style automation go to AI agents & no-code.
  - Using Ollama as a backend for coding agents goes to Claude Code / coding-agent power-ups.
  - Mobile whisper.cpp builds (iOS/Android) go to Android phone apps.

### Gaps
- Realistic speed on an 8 GB (not 12 GB) laptop with a 2018 i5: the best source tested 12 GB RAM. No reliable 8 GB, i5-8265U-class benchmark was found. Speeds may be lower when Windows uses ~4–5 GB itself.
- Bengali quality of small LLMs (Qwen3 0.6–4B, Gemma 3 1–4B): language support is claimed by vendors, but no Bengali benchmark for these small sizes was found. A hands-on test is needed before claiming "it speaks Bangla well" in a reel.
- Whisper Bengali accuracy: only indirect figures (zero-shot large-v3 ~30.5 % CER FLEURS, from a fine-tune's model card found via search). There is no clean, official WER per model size. Tiny/base/small (the sizes that fit CPU speed budgets) are likely much worse but were not measured.
- AnythingLLM Desktop pricing: the README does not say whether the desktop app is free. Its download page was not checked.
- FastSD CPU speed on an older laptop CPU: only i7-12700 numbers are published.
- Upscayl on Intel UHD 620: the FAQ says most iGPUs fail. Not tested.
- OBS minimum hardware, and whether the auto-editor Windows .exe bundles FFmpeg, were not stated in the pages read.
- The Microsoft Store price of LosslessCut is not stated.
- Release years for Ollama, Jan, AnythingLLM, Buzz, FastSD CPU, KoboldCpp, whisper.cpp, ComfyUI, Open WebUI and rembg were not printed in the fetched release text. The cadence strongly implies 2026, but confirm with the final API check.
- llama.cpp's latest release tag/date was not captured.
- LocalAI was not evaluated in this pass.

## Key Question 2: Which are actively maintained in late 2026?

### Takeaway
All 14 recommended repos show 2026 activity, most of them in October 2026. GPT4All (last release Feb 2025), IOPaint (archived Aug 2025) and Real-ESRGAN (no code since 2022) are effectively dead. Upscayl (last release Dec 2024) and Fooocus (bug-fix-only LTS) are slowing.

### Cited Findings
- Ollama v0.40.13 (28 Oct), v0.40.12 (27 Oct), v0.40.11 (24 Oct): near-daily releases. — [releases](https://github.com/ollama/ollama/releases)
- Jan 0.8.8 (28 Oct), 0.8.7 (20 Oct). — [releases](https://github.com/janhq/jan/releases)
- AnythingLLM v1.19.0 (26 Oct), v1.18.0 (13 Oct). — [releases](https://github.com/Mintplex-Labs/anything-llm/releases)
- Buzz: commits on Oct 24, 25, 27 and 30, 2026. Latest release v1.4.5 ("23 Aug"). — [commits](https://github.com/chidiwilliams/buzz/commits/main); [releases](https://github.com/chidiwilliams/buzz/releases)
- FastSD CPU v1.0.0-beta.610 (25 Oct) and beta.600 (18 Oct), both pre-releases. — [releases](https://github.com/rupeshs/fastsdcpu/releases)
- KoboldCpp v1.123.1 (13 Oct), v1.122.1 (26 Sep). — [releases](https://github.com/LostRuins/koboldcpp/releases)
- llama.cpp: 12,014 commits; release not captured. — [repo](https://github.com/ggml-org/llama.cpp)
- Open WebUI v0.12.5 (29 Oct), v0.12.4 (25 Oct). — [releases](https://github.com/open-webui/open-webui/releases)
- ComfyUI v0.43.0 (27 Oct). The README says core releases a new major stable version "roughly every 2 weeks". — [releases](https://github.com/Comfy-Org/ComfyUI/releases); [repo](https://github.com/Comfy-Org/ComfyUI)
- whisper.cpp v1.9.5 ("06 Oct"). — [releases](https://github.com/ggml-org/whisper.cpp/releases)
- GPT4All: latest release v3.10.0, 25 Feb 2025; last commit 27 May 2025 (a CI change). — [releases](https://github.com/nomic-ai/gpt4all/releases); [commits](https://github.com/nomic-ai/gpt4all/commits/main)
- Fooocus: "Limited Long-Term Support (LTS) with Bug Fixes Only"; "no current plans to migrate to or incorporate newer model architectures". — [repo](https://github.com/lllyasviel/Fooocus)
- yt-dlp 2026.10.26 and 2026.10.21. — [releases](https://github.com/yt-dlp/yt-dlp/releases)
- OBS Studio 33.0.1 (29 Oct 2026) and 33.0.0 (23 Oct). — [releases](https://github.com/obsproject/obs-studio/releases)
- auto-editor 31.8.0 (30 Oct 2026) and 31.7.2 (03 Oct). — [releases](https://github.com/WyattBlue/auto-editor/releases)
- Subtitle Edit v5.3.0 stable (14 Oct 2026) and v5.4.0-beta11 (30 Oct 2026). — [releases](https://github.com/SubtitleEdit/subtitleedit/releases)
- LosslessCut 3.70.2 (28 Oct 2026) and 3.70.1 (19 Oct). — [releases](https://github.com/mifi/lossless-cut/releases)
- HandBrake 1.11.2 (7 Jun 2026) and 1.11.1 (22 Mar). — [releases](https://github.com/HandBrake/HandBrake/releases)
- Shotcut v26.9.27 (28 Sep 2026). — [releases](https://github.com/mltframework/shotcut/releases)
- Kdenlive 26.08.2 is current stable. — [kdenlive.org/download](https://kdenlive.org/download/)
- rembg v2.0.86 ("21 Oct") and v2.0.85 ("20 Sep"). — [releases](https://github.com/danielgatis/rembg/releases)
- Upscayl: latest release v2.15.0 (25 Dec 2024). Commits: Mar 27, 2026, then Oct 28, 2025 and Sep 24, 2025. — [releases](https://github.com/upscayl/upscayl/releases); [commits](https://github.com/upscayl/upscayl/commits/main)
- IOPaint: archived Aug 13, 2025. — [repo](https://github.com/Sanster/IOPaint)
- Real-ESRGAN: last commit Apr 2, 2024 (a workflow deletion); before that, Sep 20, 2022. — [commits](https://github.com/xinntao/Real-ESRGAN/commits/master)

### Inferences
- Do not feature GPT4All, IOPaint or Real-ESRGAN in a "best in 2026" reel, because a viewer may hit unfixed bugs. If upscaling is wanted, Upscayl is the only beginner option, but it must carry a "needs a real GPU" warning.
- Fast-moving apps (Ollama, Jan, AnythingLLM) change UI often. Record screen demos close to publish date.

### Gaps
- Year confirmation for the release dates marked "year not printed" (see KQ1 Gaps).
- Bus-factor: LosslessCut is "maintained by me alone". — [repo](https://github.com/mifi/lossless-cut). Other projects' maintainer counts were not checked.

## Key Question 3: Which install commands are current (verified against the README today)?

### Takeaway
Most "current" commands changed in 2025–26, so older tutorials are wrong in several ways. Ollama now installs with a PowerShell one-liner. llama.cpp has its own `irm … | iex` installer and space-separated `llama cli` / `llama serve` commands. auto-editor is no longer on pip. yt-dlp needs ffmpeg plus deno for full YouTube support and Python ≥3.11. HandBrake needs .NET 10. Buzz's Windows installer lives on SourceForge.

### Cited Findings
- Ollama: `irm https://ollama.com/install.ps1 | iex`, or https://ollama.com/download/OllamaSetup.exe. Run with `ollama run <model>`. — [repo](https://github.com/ollama/ollama)
- llama.cpp: `irm https://llama.app/install.ps1 | iex`. Quick start `llama cli -hf ggml-org/Qwen3.5-0.8B-GGUF` / `llama serve -hf ggml-org/Qwen3.5-0.8B-GGUF`. No winget command is shown in the README. — [repo](https://github.com/ggml-org/llama.cpp)
- Jan: `Jan_0.8.8_x64-setup.exe` from GitHub Releases or jan.ai. — [releases](https://github.com/janhq/jan/releases)
- AnythingLLM: download from https://anythingllm.com/download. — [repo](https://github.com/Mintplex-Labs/anything-llm)
- Buzz: SourceForge installer (one .exe + two .bin, unsigned), or `pip install buzz-captions` / `python -m buzz` on Python 3.12. — [repo](https://github.com/chidiwilliams/buzz); [releases](https://github.com/chidiwilliams/buzz/releases)
- FastSD CPU: Python ≥3.10 + uv, then `install.bat` and `start.bat` / `start-webui.bat`. — [repo](https://github.com/rupeshs/fastsdcpu)
- KoboldCpp: `koboldcpp.exe` or `koboldcpp-nocuda.exe` (CPU + Vulkan). — [repo](https://github.com/LostRuins/koboldcpp)
- Open WebUI: `pip install open-webui` and `open-webui serve` (Python 3.12), or Docker `ghcr.io/open-webui/open-webui:ollama` for CPU. — [repo](https://github.com/open-webui/open-webui)
- Fooocus: download `Fooocus_win64_2-5-0.7z`, extract, run `run.bat`. — [repo](https://github.com/lllyasviel/Fooocus)
- ComfyUI: the desktop app is "highly recommend[ed]". There is also a portable `ComfyUI_windows_portable_nvidia.7z`, which also runs CPU-only. — [repo](https://github.com/Comfy-Org/ComfyUI)
- whisper.cpp: build from source (`cmake -B build`, `cmake --build build -j --config Release`, `./build/bin/whisper-cli -f samples/jfk.wav`). — [repo](https://github.com/ggml-org/whisper.cpp)
- yt-dlp: `yt-dlp.exe` (Win10+). ffmpeg "Strongly recommended"; deno recommended and "Required for full YouTube support" via yt-dlp-ejs. Nightly pip: `python -m pip install -U --pre "yt-dlp[default]"`. Python 3.10 support was removed in 2026.10.26. — [repo](https://github.com/yt-dlp/yt-dlp); [releases](https://github.com/yt-dlp/yt-dlp/releases)
- OBS: `OBS-Studio-33.0.1-Windows-x64-Installer.exe`. — [releases](https://github.com/obsproject/obs-studio/releases)
- auto-editor: download `auto-editor-windows-x86_64.exe` and rename it to `auto-editor.exe`. "no longer being published on pip". — [installing](https://auto-editor.com/installing); [assets](https://github.com/WyattBlue/auto-editor/releases/expanded_assets/31.8.0)
- Subtitle Edit: `SubtitleEdit-Windows-x64-Setup.exe` or `SubtitleEdit-Windows-x64.zip` (v5.3.0). — [releases/latest](https://github.com/SubtitleEdit/subtitleedit/releases/latest)
- LosslessCut: https://github.com/mifi/lossless-cut/releases/latest/download/LosslessCut-win-x64.7z — [repo](https://github.com/mifi/lossless-cut)
- HandBrake: `HandBrake-1.11.2-x86_64-Win_GUI.exe` plus ".NET Desktop Runtime version 10.0". — [releases](https://github.com/HandBrake/HandBrake/releases)
- Shotcut: `shotcut-win64-26.9.27.exe` / `.zip`. — [releases](https://github.com/mltframework/shotcut/releases)
- Kdenlive: "Installable" or "Standalone" builds at kdenlive.org/download (Windows 10+). — [kdenlive.org/download](https://kdenlive.org/download/)
- rembg: `pip install "rembg[cpu,cli]"` (Python >=3.11, <3.14), then `rembg i path/to/input.png path/to/output.png`. Folder batch: `rembg p path/to/input path/to/output`. — [repo](https://github.com/danielgatis/rembg)
- Upscayl: the `upscayl-x.x.x-win.exe` installer from Releases or upscayl.org. SmartScreen: "More Info" → "Run Anyway". — [repo](https://github.com/upscayl/upscayl)
- IOPaint (archived): `pip3 install iopaint`, then `iopaint start --model=lama --device=cpu --port=8080`. — [repo](https://github.com/Sanster/IOPaint)

### Inferences
- Unsigned or SmartScreen warnings appear for Buzz, auto-editor and Upscayl. Each reel should show the "More info → Run anyway" step and say to download only from the official GitHub or site, because KoboldCpp and Fooocus both warn about fake look-alike sites. — [KoboldCpp](https://github.com/LostRuins/koboldcpp); [Fooocus](https://github.com/lllyasviel/Fooocus)
- For on-screen install text in a reel, the safest single-line commands are: `irm https://ollama.com/install.ps1 | iex` then `ollama run gemma3:1b`, and `auto-editor video.mp4`. Everything else is a download-and-double-click.

### Gaps
- winget ids for any of these tools were not verified (no README states one). Do not show `winget install …` in a reel without checking winget-pkgs first.
- Exact first-run button labels in Jan, AnythingLLM, LosslessCut, OBS and HandBrake were not verified against their docs today. Screen-record a real install before scripting the voice-over.
