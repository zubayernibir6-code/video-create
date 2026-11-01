# Voice clone research (2026-10-30)

Goal (the user's words, 2026-10-30): his OWN voice, cloned so closely it passes as him, speaking any Bengali script
Claude writes, with emotion, pauses and variety, free, every video, with no recording by him each time. He supplies only
the BGM.

Machine limits that decide everything: i5-8265U, **no GPU**, ~1.5–3.8 GB RAM free, D: ~1.4 GB free, C: ~11 GB free.
Nothing is installed yet (tools/pyenv has no torch).

His real voice already on disk: `C:/Users/Zubayer Nibir/VideoWork/zubayer-ep01/audio/voice16.wav` (667 s, his own
talking-head episode) and `voice_cut.wav` (635 s). About 10 min of clean speech is what RVC training wants.

## Candidates (searched 2026-10-30; licences are what the pages say, not legal advice)

| Project | Bengali | Emotion | Clone from | Licence (weights) | Fits this laptop? |
| --- | --- | --- | --- | --- | --- |
| **RVC via Applio** (voice-to-voice) | any language (converts sound, not text) | keeps the emotion of the input speech | ~10 min of his voice, trained once | MIT (Applio asks commercial users to contact them + its ToS) | inference on CPU yes; training on CPU very slow → free Colab/Kaggle GPU |
| **ai4bharat/IndicF5** (text-to-speech) | yes (11 Indic languages) | copies the emotion of the reference clip | 5–15 s reference + its transcript | HF card says MIT; a community thread asks about commercial use, unanswered; trained on Rasa/IndicTTS/LIMMITS/IndicVoices-R | 0.4B: CPU possible but slow; ~2–3 GB download on C: |
| **kenpath/svara-tts-voiceclone-beta** | yes (19 languages, ~130 h Bengali) | emotion tags (`<happy>`, `<sad>`, …) | short reference | Apache-2.0 (dataset terms apply) | ~3B LLM: too big for local RAM; Colab only |
| OmniVoice (k2-fsa) | listed (600+ languages) | — | short reference | code Apache-2.0, **weights CC-BY-NC** | ✗ for sold videos |
| F5-TTS (original), Fish Speech/OpenAudio | weak / none | yes | short reference | **CC-BY-NC** | ✗ for sold videos |
| XTTS-v2 (and Kantho, built on it) | no / community | some | short reference | **CPML non-commercial** | ✗ (CLAUDE.md already bans XTTS) |
| Chatterbox Multilingual | **no Bengali** (23 languages) | exaggeration knob | short reference | MIT | ✗ language |
| CosyVoice, IndexTTS2, Zonos, GLM-TTS | no Bengali confirmed | yes | short reference | mixed | ✗ language |

## Recommended pipeline (two stages)

1. **Emotion + articulation:** Google AI Studio TTS (what he already uses, voice Sadaltager) speaks the Bengali script
   with style prompts per line (excited / calm / serious, pauses). Bengali pronunciation is its strength.
2. **His timbre:** RVC (Applio) converts that track into his voice. RVC keeps the pitch curve, pauses and emotion of
   the input and swaps the voice colour, so stage 1 controls the acting and stage 2 makes it sound like him.
   Train once on his ep01 voice (free GPU notebook, ~30–60 min), then convert on this laptop (CPU) for every video.
3. **Plan B / comparison:** IndicF5 directly from text with one reference clip per emotion cut from his ep01 voice.
   Use it if the RVC result sounds less like him.

Honest limits to tell him: no free tool is a 100 % copy; expect "people who know him may notice small differences".
Gender/pitch: Sadaltager is male, so the RVC pitch shift should be near 0. Platform rule: a realistic synthetic voice
should be disclosed where the platform asks (see `docs/ai-video-generation.md`). Only ever clone his own voice.

## Setup status (2026-10-30)

- Own venv, NOT tools/pyenv (D: is full): `C:/Users/Zubayer Nibir/VideoWork/voice-clone/venv` from `tools/python311`,
  2.3 GB. Installed: torch/torchaudio 2.5.1+cpu (download.pytorch.org/whl/cpu), `git+https://github.com/ai4bharat/IndicF5`.
  Pins that were REQUIRED (verified by import): `transformers==4.49.0` (5.x needs torch ≥ 2.6 and disables torch),
  `datasets==3.3.2` + `pyarrow<18` (newer pyarrow needs numpy 2; f5_tts needs numpy 1.26).
- The HF repo is gated ("auto" approve): anonymous download gives 401. He must create a free HF account, accept the
  terms on huggingface.co/ai4bharat/IndicF5 and paste a Read token into `.env.local` as `HF_TOKEN=` (slot + steps added).
- Reference clips of his voice (24 kHz, cut from ep01 `voice_master.wav`): `voice-clone/ref/{calm,excited,question,story}.wav`,
  texts in `voice-clone/refs.json`. ep01's words.json is the CLEANED caption script, not verbatim (it is off by whole
  phrases), and its word gaps are all 0.02 s: pick windows with `silencedetect` and take the text from a fresh
  `tools/transcribe.mjs` run of the clip.
- Test: `venv/Scripts/python.exe -I gen.py refs.json out "<Bengali line>"` (prints the real-time factor per clip).

## First IndicF5 test (2026-10-30 23:00–23:44, ep01 references, `voice-clone/out1/`)

- Same new 3-sentence line in 4 emotions. Model load 226 s; speech at **42–70× real time** on this CPU (11 s of
  speech = 13 min) with ~1.9 GB RAM. Usable overnight / per line, not interactive.
- Output −19 LUFS, peaks −3 dBFS, no clipping; pitch matches him: median f0 ref 155/162/180/159 Hz vs clone
  159/162/183/164 Hz, p10–p90 spread the same; voiced ratio the same. Spectrogram: same harmonic shape, clone has
  slightly less air above 8 kHz (24 kHz output). ASR check: see below.
- Tools written: `tools/clone/refs.mjs` (cut reference clips), `tools/clone/indicf5-gen.py` (lines → WAVs),
  `tools/clone/say.mjs` (script with [emotion] tags → one −16 LUFS voice stem), `tools/clone/rvc-train-colab.ipynb`.

## Second test (2026-10-31 00:00–00:45, `voice-clone/out2/`): phone references + the speed fix

Same line again. ASR of every clone (`out1/`, `out2/`), words back vs the 20-word target:
| clip | reference | result |
| --- | --- | --- |
| calm, excited, story (out1) | ep01 | word-perfect (calm: greeting not heard by ASR, rest perfect) |
| question (out1, speed 1.0) | ep01, fast-paced clip | last sentence DROPPED (7.1 s) |
| ep-question-v2 (speed 0.85) | same clip | complete, word-perfect, 8.3 s → the speed fix works |
| tut-explain, tut-offer | phone 01, 04 | word-perfect; pitch 138/149 Hz vs ref 153/145 |
| tut-check | phone 06 (43 % voiced, pausey) | broken: words dropped and repeated, clipped (+0.3 dBFS) |
Decision: BOTH recordings give good references; what matters is the clip, not the mic. Guard added to refs.mjs
(pause share inside the clip at −30 dB/0.15 s ≤ 45 %; measured 12–40 % on the good clips, 52 % on the bad one;
re-run on the tutorial keeps exactly the two clips that worked). `voice/voices.json` now: calm, excited, question
(speed 0.85), story (ep01) + explain, offer (phone). For him to hear: `renders/voice-clone-test/2026-10-31/`
(asol = his recording, clone = the model; 7-…-KHARAP is the broken one, kept on purpose).

## His verdict (2026-10-31 morning) and what it changes

He listened: "pronunciation, emotion, nothing right; not even near human". ASR word-match + pitch had passed on 7/8
clips, so they are NOT a naturalness test (Proof). IndicF5's training data is all Indian Bengali (Source), and
zero-shot from a 7-s clip copies timbre roughly, not his way of speaking. Guard: say.mjs exit 3 for a voice tag
without his recorded OK. Lesson row in LESSONS.md.
Options left, in order of his effort: (1) RVC on a natural TTS take (data ready, 17 min); (2) more of HIS natural
speech (45–60 min total) → better RVC + a fine-tune of IndicF5 on his voice (Colab/Kaggle GPU; a 2021 FastPitch study
found 30 min of fine-tune data comparable to 27 h from scratch, arXiv 2110.05798; no F5-specific number found);
(3) he records each voice-over himself and the system does everything else (the only true 100 %).
Found: `actorcritic/IndicF5_Bangladeshi` (MIT tag, ungated, 2026-05-20, "custom dataset" not described →
commercial provenance unknown; usable only as a pronunciation test). Gemini API TTS free tier and Bengali support:
sources conflict (2026), check with a real key.
Video3/Voice.m4a and Video2/Voice.m4a are the SAME file as Downloads/Voice.m4a (4,164,781 B): no third recording.
voice_1.wav (24 kHz, 91 s) is an AI Studio TTS take, not his voice.

## Gemini API voice replication (2026-10-31) — now the main path, his choice ("Gemini is paid, use it")

- He connected a PAID Gemini key (`GEMINI_API_KEY` in .env.local). He had made a replicated voice "Echo"
  (voice_vwr9dt67gcp2) in AI Studio with the LAPTOP mic and said not to use it.
- Docs (read 2026-10-31): `POST /v1beta/voices` {store, voice:{model:"gemini-3.8-flash-tts", type:"replicated",
  display_name, replicated:{source_audio, consent_audio}}} (base64 WAV, 24 kHz mono 16-bit recommended). source =
  10–30 s clean natural speech; consent = the SAME adult speaker reading the fixed statement (bn-IN text in
  gemini.mjs) on the same mic and room (speaker verification). Stored voices live 1 year (reset on use), 200 per
  project. Synthesis: `POST /v1beta/interactions` {model, input:[{type:"user_input", content:[{type:"text", text,
  annotations:[{type:"speech_metadata", style}]}]}], response_format:{type:"audio"}, generation_config:
  {speech_config:[{voice:"voice_…"}]}} → steps[model_output].content[audio].data (WAV 24 kHz). Inline tags in angle
  brackets (<laugh>, <chuckle>, <sigh>, <short pause>, <whispering>…), English tag names inside Bengali text.
  "Bangla" is listed for 3.8 Flash and Flash-Lite. The models "anchor on the audio reference first": the source
  clip's mood is the clone's default mood.
- Price (Standard paid, to 2026-12-31): audio out $9 / 1M tokens, 25 tokens/s → 1 min of voice ≈ $0.0135;
  measured: 9.8 s for $0.0022 (181 audio tokens for 7.2 s, as documented). No fee for creating a voice.
- The consent clip can only come from him (never synthesised or stitched). Drop folder with his instructions:
  `Downloads/Claude Video Create/Voice Clone/`. Source candidates from the tutorial phone recording (20 % pause,
  29.5–29.9 s): `voice-clone/src-gemini/01–03.wav`; a fresh 30 s in his "video voice" is preferred.
- Tool: `tools/clone/gemini.mjs` (voices | create | say, [style] tags grouped into one request, cost file,
  --verify, approval guard exit 3). Verified 2026-10-31 with the prebuilt Sadaltager voice.

## His voices in Gemini (2026-10-31 night)

- His iPhone files (`Downloads/Recording iphn-…/Recording iphn/Mirzapur Road 57–59.m4a`): 57 = "এক" + the consent
  statement (cut 3.40–11.45 s → `voice-clone/iphone/consent.wav`, 8.05 s); 58 and 59 = him READING the instruction
  text aloud (not free talk). Cleaner than the old recordings: speech-to-noise 31–37 dB (old 25–28 dB).
  Sources: `iphone/source-a.wav` (58 from 2.45 s, pauses > 0.8 s cut to 0.45 s, 24.8 s), `source-b.wav` (59 from
  8.60 s, 16.3 s). Highpass 70 Hz only, no denoise.
- `gemini.mjs create`: talha-a = voice_vbpzc4bihy1u, talha-b = voice_59stige5dfep (both OK). talha-tut (old tutorial
  clip + the new consent) → HTTP 500 after 4 tries: most likely the speaker check fails across recording sessions,
  as the docs warn ("same microphone, same acoustic setting"). Use consent + source from ONE session.
- Test script (6 moods, 40–44 s, ~$0.009 each): one ASR pass over both, ~90–95 % of words back; misses are spelling
  variants (হল/হলো, কমেন্টের) and the greeting split by the join, but talha-a block 05 may have dropped
  "কথা মনে রাখবেন" (ASR did not hear it; kha has it) → he should listen there.
- Pitch: clones median 164 Hz vs his calm reading 144–148 Hz (his ep01 lecture 155–180 Hz): the styled lines sit at
  his energetic register. Loudness −16.5 / −16.2 LUFS.
- For his ear: `renders/voice-clone-test/2026-10-31/gemini/` (1-asol-nomuna-ka + 1-clone-ka, 2-asol-nomuna-kha +
  2-clone-kha, 0-sadaltager-tulona, script.txt).

## গ = the best of ক + খ (2026-11-01)

His verdict on the two: ক "too thick / rough at times, sometimes natural"; খ "natural but not enough bass / not thick".
He asked for গ, a combined, upgraded voice. Measured with `voice-clone/tone.py` (bands relative to total, speech frames):
| | low 80–250 | presence 1–4k | air 4–10k | median f0 | low spread / f0 spread across 6 blocks |
| --- | --- | --- | --- | --- | --- |
| his real (source-g) | −11.2 | −11.8 | −33.1 | 146 Hz | — |
| ক talha-a | −10.5 | −11.1 | −31.0 (brighter = rough) | 169 Hz | ±1.4 dB / ±25 Hz |
| খ talha-b | −10.4 | −12.7 | −35.7 | 179 Hz (highest = least "thick") | ±2.4 dB / ±30 Hz |
| **গ talha-g** (final) | −11.2 | −12.0 | −32.8 | **159 Hz** | **±0.2 dB / ±8 Hz** |
Root cause: "thickness" was mostly PITCH (the clones spoke 23–33 Hz above him) and the swing from block to block,
not missing bass. গ = three changes: (1) source = 15.8 s of ক's source + 12.8 s of খ's, same iPhone session and
consent (voice_j4vk9khgp0p7); (2) `base_style` on every block: "his natural relaxed speaking register: a warm,
grounded, slightly lower-pitched chest voice, not raised" (docs: style controls pitch); (3) `tone_ref` = his real
recording, every block tone-matched by `tools/clone/tone-match.py` (±3 dB cap; on ক it cut the low-band swing 1.4 → 0.4
dB). Test 42.7 s, −15.8 LUFS, $0.009. Files for his ear: `renders/voice-clone-test/2026-10-31/gemini/3-clone-ga.wav`.

## RVC training set (2026-10-30 23:56)

- `voice.mjs clean` (DeepFilterNet) on both: ep01 −29.2 → −16.0 LUFS (663.5 s), tutorial phone −20.9 → −16.0 LUFS
  (489.9 s). Before cleaning both had a ~25–28 dB speech-to-noise gap (ep01 −55/−27 dBFS, phone −44/−19): the phone
  is louder, not cleaner; ep01 has slightly more room tail. Both are usable; used BOTH.
- `tools/clone/dataset.mjs` → **132 clips, 17.0 min of speech**, 9 dropped → `voice-clone/rvc/dataset.zip` (79 MB)
  for the Colab notebook. ASR of the 6 phone clips showed the tutorial words.json (align output) is close to verbatim
  but hears "Claude" as ক্লট/প্লট; the ref_text was written as ক্লড.

## Licence + platform findings (2026-10-30 night, from the pages themselves)

- **IndicF5:** HF card tag "mit"; NO licence text on the card and NO LICENSE file in the GitHub repo; discussion #3
  ("Is this allowed for commercial usage?", 2025-03-26) has no answer from AI4Bharat. Terms of Use on the card: clone
  only voices you have explicit permission for. Training data Rasa + IndicVoices-R are CC-BY-4.0 (attribution);
  IndicTTS (IIT Madras) and LIMMITS not checked. Verdict: usable for his own voice, commercially "MIT-tagged, unanswered
  question" → put an AI4Bharat credit line in CREDITS.md of every video that uses it, same as the Piper credit.
- **Applio (RVC):** code + weights MIT; its TERMS_OF_USE allows commercial content "provided appropriate rights and
  permissions are obtained" and asks commercial users to write to support@applio.org first. Official pretrained
  models trained on VCTK (public). Verdict: safest option for selling; one e-mail to Applio before paid ads.
  Exact clause (TERMS_OF_USE.md in the repo, LICENSE "MIT License, Copyright (c) 2026 AI Hispano"): "Commercial Use:
  Creating content for commercial purposes, provided that appropriate rights and permissions are obtained and all
  legal and ethical standards are adhered to." Local copy: `voice-clone/applio` (shallow clone), CPU engine venv
  `voice-clone/venv-rvc` (torch 2.11 cpu + requirements-engine.txt minus the nvidia/onnxruntime-gpu/gradio lines,
  PLUS `onnxruntime` 1.31.1 for CPU — without it `core.py extract` dies on `import onnxruntime` (Swift predictor) and
  core.py still exits 0, so check the log, not the exit code). Pretrained HiFi-GAN download = 1.31 GB on C:.
  Preprocess on CPU: 17:01 of audio in 22 s → 440 slices. Extract on CPU (3 cores): rmvpe pitch 215 s +
  contentvec embeddings 244 s = ~8 min, 440/440 OK (2026-10-31 06:50–06:58).
  CPU TRAINING IS NOT FEASIBLE here: batch 4 → 111 steps per epoch at 29–38 s per step ≈ 1 hour per epoch
  (measured 06:58–07:24, 44 steps); a usable model needs 100–300 epochs. Stopped. RVC training = Colab GPU only.
- **YouTube (official help page, read 2026-11-01, support.google.com/youtube/answer/14328491):** disclosure is for
  realistic content that makes a real person appear to say what they did not, altered real events, realistic fake scenes,
  AI music as the focus. Listed under NO disclosure needed: "Cloning one's own voice to create voice overs or dubs".
  "Disclosing AI content alone won't limit a video's audience or impact its eligibility to earn money." (Earlier lines in
  this file said toggle YES: wrong for his own voice; corrected.) Monetization risk = the "inauthentic content" policy
  (answer/1311392): templated, mass-produced videos without the creator's own insight; same intro/outro is fine if the
  bulk differs.
- **Meta (FB/IG):** realistic AI audio must be disclosed with Meta's own "AI info / Made with AI" tool when posting;
  2026 ad policies reportedly require explicit disclosure for AI audio in sponsored content (secondary source).
- So: the clone is allowed on both platforms when disclosed; disclosure is a toggle, not a penalty. Put the toggle in
  the release-kit checklist (RELEASE.md) for any video with a cloned voice.

## Sources
- https://huggingface.co/ai4bharat/IndicF5 · https://huggingface.co/ai4bharat/IndicF5/discussions
- https://huggingface.co/kenpath/svara-tts-voiceclone-beta · https://huggingface.co/kenpath/svara-tts-v1
- https://huggingface.co/spaces/IAHispano/Applio (README, MIT) · https://sourceforge.net/projects/applio.mirror/
- https://github.com/Plachtaa/seed-vc (archived 2025-11-21, licence unclear → not used)
- https://huggingface.co/ResembleAI/chatterbox (language list, no Bengali)
- https://huggingface.co/xiaoxiaodong1/OmniVoice (weights CC-BY-NC)
- https://github.com/ehtesum/kantho_voice_model (built on XTTS v2)
