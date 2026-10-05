# Piper Bengali voice — credits and licence

**File:** `bn_BD-google-medium.onnx` (+ `.onnx.json`, `MODEL_CARD`), downloaded 2026-10-06 from
`https://huggingface.co/rhasspy/piper-voices/resolve/main/bn/bn_BD/google/medium/`.
Engine: `piper-tts` 1.8.0 (GPL-3.0 — a tool licence; it does not apply to the audio it produces).

**Training data (from MODEL_CARD):**
- Google crowdsourced Bengali TTS, OpenSLR-37 — **CC BY-SA 4.0** (bn-BD and bn-IN speakers)
- CMU Indic (festvox.org/cmu_indic) — CMU licence (free use, keep the copyright notice)

**What this means for videos you sell:** the audio may be used commercially. Because the voice was
trained on CC BY-SA data, add this line to the video description or end credits:

> Bengali voice: Piper (rhasspy) bn_BD-google-medium, trained on Google OpenSLR-37 (CC BY-SA 4.0) and CMU Indic data.

Whether share-alike reaches the generated audio is legally unsettled, so keep the credit line. For a
product with zero licence questions, use your own recorded voice (`tools/voice.mjs`).

**Speakers:** see `speakers.json` (gender by measured pitch, clarity measured by reading each speaker
back with the Bengali speech recogniser). `tools/bn-tts.mjs` uses speaker 5 for `--voice=male` and
speaker 3 for `--voice=female`.
