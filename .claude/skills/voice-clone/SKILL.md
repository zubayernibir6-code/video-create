---
name: voice-clone
description: Speak any Bengali script in Talha Zubayer's OWN cloned voice in the D:\Video Create workspace. MAIN PATH - the Gemini API voice replication (gemini-3.8-flash-tts, his paid key) via tools/clone/gemini.mjs (create a voice from his 10-30 s clip + his consent recording, then a script with [emotion] tags -> an ASR-checked -16 LUFS voice stem, about $0.014 a minute). Fallbacks - RVC (Applio) on his 17 min of speech, IndicF5 (rejected by his ear 2026-10-31). Use when he asks for "আমার গলায়", "voice clone", "my voice", an auto voice-over without recording, or a PLAN.md says ভয়েস: ক্লোন. Only his own voice is ever cloned.
---

# voice-clone — his own voice from text (IndicF5) + his timbre on any take (RVC)

Work folder (C:, not D:): `C:/Users/Zubayer Nibir/VideoWork/voice-clone` = `$VC` below. Research, licences, every
measurement: `docs/voice-clone-research.md` (read it first). Rules: §0 of CLAUDE.md (Bengali, one step, verify).

## 0. Hard rules
- Clone **his** voice only (IndicF5 Terms of Use; Applio ToS). Never a client's or anyone else's voice.
- Every video with a cloned voice: Meta "AI info" label (REQUIRED: realistic-sounding AI audio, Meta misinformation policy). YouTube: NOT required — its help page lists "Cloning one's own voice to create voice overs or dubs" under no-disclosure (checked 2026-11-01); disclosing never affects earnings. Monetization risk is "inauthentic content" (templated mass production without his own insight), not the voice. Meta label on posting
  (release-kit RELEASE.md line). A credit line for AI4Bharat IndicF5 and Applio in the project's CREDITS.md.
- No installs beyond the two venvs below; D: is full, keep all media on C:.
- The IndicF5 model is **42–70× real time** on this laptop (11 s of speech ≈ 13 min, ~1.9 GB RAM): run it detached,
  never alongside transcribe.mjs or a render. Plan a 60-s voice-over as a ~1-hour background job.

## 0a. MAIN PATH since 2026-10-31: Gemini API voice replication (his paid key, his choice)
0-new. **HIS MAIN VOICE = `talha-g` (গ)** — approved 2026-11-01 "গ ভালো, এটাই রাখো" after hearing ক, খ, গ side by
   side; `"default": true` in gemini-voices.json. Use `--voice=talha-g` for every new voice-over. গ = ক + খ upgraded: blended source, `base_style` (lower,
   relaxed register) and `tone_ref` (every block tone-matched to his real recording). Measured: 159 Hz vs his 146 (ক 169,
   খ 179), block-to-block swing ±0.2 dB / ±8 Hz (ক/খ ±1.4–2.4 dB / ±25–30 Hz). If he approves it, it replaces talha-b
   as the default. A new voice of his should get the same three treatments; measure with `$VC/tone.py`.
0. **HIS VOICE = `talha-b`** (voice_59stige5dfep; his pick 2026-11-01 "খ ভালো" after hearing ক and খ side by side).
   `talha-a` was approved earlier the same day only for the GitHub series (before he compared); use talha-b for
   everything new unless he says otherwise.
1. Voice: `node tools/clone/gemini.mjs voices` lists his replicated voices; `gemini-voices.json` in `$VC` maps names
   to ids and holds his "approved" OK. "Echo" (laptop mic, AI Studio) is NOT to be used (his words, 2026-10-31).
2. New voice: `node tools/clone/gemini.mjs create <source.wav> <consent.wav> <name>` — source 10–30 s of HIS clean
   natural speech in the mood he wants by default; consent = HIM reading the bn-IN statement, same phone and room.
   The consent clip is never made, cut or stitched by us. His drop folder: `Downloads/Claude Video Create/Voice Clone/`.
3. Voice-over: script with `[excited]`, `[explain]`, `[question]`, `[happy]`, `[serious]`, `[cta]`… (STYLES in
   gemini.mjs, or free text like `[warm, smiling, a bit faster]`) and inline `<chuckle>`, `<short pause>`, `<sigh>`:
   `node tools/clone/gemini.mjs say <script.txt> <out>/voice.wav --voice=<name> --verify` → −16 LUFS stem + cost file.
   ~1 min of voice ≈ $0.014 (2026 price). Redo one block: `--only=03` (delete nothing; new take).
4. Proof: --verify (words) + HIS ear before the first video with a new voice; then `"approved"` in gemini-voices.json.

## 0b. His verdict on Stage A (2026-10-31) — read before using it
He listened to `renders/voice-clone-test/2026-10-31` (IndicF5 zero-shot from 7-s clips): "pronunciation, emotion,
nothing right, not even near human". The same clips had passed ASR word-for-word and matched his pitch, so those
checks prove words and pitch only, never naturalness. Root causes: (Source) IndicF5 learned only from INDIAN Bengali
speakers (Rasa, IndicTTS, LIMMITS, IndicVoices-R) reading prompts; (Source) a 7-s reference cannot carry his way of
speaking. So: Stage A zero-shot is NOT for his videos. say.mjs refuses a tag with no `"approved"` in voices.json
(exit 3; `--test` for trials). Next: Stage B (RVC on a natural TTS take) and, for his own speaking style, a
fine-tune on 45–60 min of his own natural speech. Every new method → a 2–3 line sample → his ear → only then use.

## 1. Stage A — text → his voice (IndicF5)
1. Script: one sentence per line, `[tag]` picks the reference clip (tags = keys of `$VC/voice/voices.json`:
   calm, excited, question, story; add more with refs.mjs). `[pause 1.2]` = silence; blank line = 0.8 s.
2. `node tools/clone/say.mjs <script.txt> <out>/voice.wav --verify` → `<out>/lines/NN.wav`, the joined
   −16 LUFS 48 kHz stem, and an ASR check per line (≥ 80 % of the words back, else exit 2 with the ids).
3. A flagged line: shorten it (one sentence), or `--only=NN` (new seed), or a lower `speed` in the lines json.
   Known trap: a fast reference clip makes the model drop the tail of a 3-sentence line (2026-10-30 test).
4. Then the stem goes where a recorded voice goes (tools-reel `reel.json`, abroll, screen-tutorial…).
   plan-check.mjs reads it as a RECORDED voice: measure line starts from `<out>/voice.lines.json` + transcribe.

New reference clips (better emotion match): `node tools/clone/refs.mjs <his.wav> <words.json> <dir>` cuts 5–11 s
stretches between pauses; transcribe each clip and paste the EXACT words into voices.json (`ref_text` must match the
audio; ASR hears "Claude" as ক্লট, write ক্লড). Recording list for a clean session: `VOICE-RECORDING.md`.

## 2. Stage B — his timbre on an acted take (RVC / Applio)
Use when Stage A's acting is flat or too slow: AI Studio TTS (Sadaltager, his usual) reads the script with
style prompts, then RVC converts it to his voice (pitch curve, pauses, emotion kept; only the voice colour changes).
1. Train once (needs HIS Google account, free T4): open `tools/clone/rvc-train-colab.ipynb` in Colab, drag
   `$VC/rvc/dataset.zip` (132 clips, 17 min, made by `tools/clone/dataset.mjs` from ep01 + the tutorial phone
   recording) into Files, Runtime → Run all, ~1 h, download `talha.zip` → `$VC/rvc/`.
2. Convert locally (CPU, venv `$VC/venv-rvc`, Applio clone `$VC/applio`, models fetched with
   `core.py prerequisites --models True`): `node tools/clone/rvc.mjs <tts.wav> <out.wav> [--pitch=0] [--index-rate=0.6]`
   (wraps `core.py infer --input-path … --pth-path ../rvc/talha.pth --f0-method rmvpe --protect 0.4`; the flag
   names use hyphens; the full list is in `$VC/rvc/infer-help.txt`). UNTESTED until talha.pth exists: on the first
   run, record the measured speed here.
3. Same ASR verify + loudness as Stage A.

## 3. Proof before delivery (the five elements)
- Text: every line transcribes back (say.mjs --verify). Time: line starts from voice.lines.json, not estimates.
- Sound: −16 LUFS stem; pitch median ≈ his (155–180 Hz; `$VC/pitch.py`); no clipping.
- Taste: he listens to the stem BEFORE the render (his OK in chat); contact-sheet is not enough for voice.
