"""asr_chunks.py — Bengali speech to words with timings, for long recordings on a low-memory laptop.

    PY tools/episode/asr_chunks.py <voice.wav> <out.words.json> [--max-chunk 45]

tools/transcribe.py hands the whole file to faster-whisper, which builds features for all of it at once: on the
11-minute zubayer-ep01 voice that grew to 6.2 GB of private memory with 0.7 GB free, and the laptop swapped
(30 s of audio in 20 minutes). This script loads the model once and feeds it pieces of at most --max-chunk
seconds, cut in the middle of pauses, with the same settings and fixes as transcribe.py (no timestamp tokens
for the Bengali fine-tune, vowel-sign fix, phantom-segment filter). Word times are on the input's timeline.
"""
import argparse
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import numpy as np  # noqa: E402
from transcribe import MODELS, decode_audio, fix_word, is_phantom, speech_level_db  # noqa: E402

SR = 16000


def chunk_bounds(audio, speech_db, max_len):
    """Cut points in the middle of pauses (>= 0.35 s, 30 dB under speech), chunks at most max_len seconds."""
    hop = SR // 20
    n = len(audio) // hop
    frames = audio[: n * hop].reshape(n, hop)
    db = 10 * np.log10(np.mean(frames ** 2, axis=1) + 1e-12)
    quiet = db < speech_db - 30
    pauses, i = [], 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            if (j - i) * 0.05 >= 0.35:
                pauses.append((i + j) / 2 * 0.05)
            i = j
        else:
            i += 1
    total = len(audio) / SR
    bounds, start = [], 0.0
    while total - start > max_len:
        cands = [p for p in pauses if start + 8 < p <= start + max_len]
        cut = cands[-1] if cands else start + max_len
        bounds.append((start, cut))
        start = cut
    bounds.append((start, total))
    return bounds


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("media")
    ap.add_argument("out")
    ap.add_argument("--max-chunk", type=float, default=45.0)
    a = ap.parse_args()
    from faster_whisper import WhisperModel

    t0 = time.time()
    audio = decode_audio(a.media, sampling_rate=SR)
    speech_db = speech_level_db(audio)
    bounds = chunk_bounds(audio, speech_db, a.max_chunk)
    print(f"{len(audio) / SR:.1f} s of audio in {len(bounds)} chunks; loading the Bengali model …", flush=True)
    model = WhisperModel(MODELS["bengali"], device="cpu", compute_type="int8", cpu_threads=4, local_files_only=True)
    words, dropped = [], 0
    out = Path(a.out)
    progress = Path(str(out) + ".progress")
    done_to = -1.0
    if out.exists() and progress.exists():  # resume after a crash: keep the chunks already done
        words = json.loads(out.read_text(encoding="utf-8"))
        done_to = float(progress.read_text())
        print(f"  resuming: {len(words)} words, chunks up to {done_to:.1f} s already done", flush=True)
    for k, (s, e) in enumerate(bounds, 1):
        if e <= done_to + 1e-6:
            continue
        piece = audio[int(s * SR): int(e * SR)]
        segments, _ = model.transcribe(piece, language="bn", beam_size=5, vad_filter=True, word_timestamps=True,
                                       condition_on_previous_text=False, without_timestamps=True)
        n0 = len(words)
        for seg in segments:
            if is_phantom(seg, piece, speech_db):
                dropped += 1
                continue
            for w in seg.words or []:
                text = fix_word(w.word.strip())
                if text:
                    words.append({"id": f"w{len(words)}", "text": text, "start": round(s + w.start, 3),
                                  "end": round(s + max(w.end, w.start), 3)})
        took = time.time() - t0
        print(f"  chunk {k}/{len(bounds)} {s:6.1f}-{e:6.1f} s: {len(words) - n0} words ({took:.0f} s so far)", flush=True)
        out.write_text(json.dumps(words, ensure_ascii=False, indent=1), encoding="utf-8")
        progress.write_text(f"{e:.6f}")
    print(f"✓ {len(words)} words in {time.time() - t0:.0f} s; {dropped} phantom segment(s) skipped → {a.out}", flush=True)


if __name__ == "__main__":
    main()
