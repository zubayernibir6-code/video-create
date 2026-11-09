"""transcribe-fast.py — the Bengali ASR of tools/transcribe.py, cut into chunks and decoded in PARALLEL (cloud machine).

Same model and settings as transcribe.py (SayedShaun/bengali-whisper-medium-ct2, int8, beam 5, VAD, no timestamp
tokens, word timings from cross-attention, fix_word, phantom filter). What is different, and why:
  * Audio comes from a 16 kHz mono WAV read with numpy: on the cloud machine PyAV breaks faster-whisper's own
    decode_audio ("open() got an unexpected keyword argument 'metadata_errors'").
  * The audio is cut at the QUIETEST spot (120 ms window) near every equal split point (±3 s), never inside a word,
    and every chunk is decoded by its own process. ONE AT A TIME by default (--parallel 1, --threads 2): each decoder
    holds ~3 GB at beam 5, and 3 at once, then 2 at once, were OOM-killed (exit -9, no traceback) on the 2-CPU / ~7 GB
    cloud machine on 2026-11-09 (reel-4784-captions). --parallel N / --threads exist for a bigger machine; --resume
    keeps chunks that already finished, so a killed run does not start over. Measured: a 61-s clip, 3 chunks one by
    one, took about 6 minutes (the model loads once per chunk).
  * Words keep their probability ("prob"), so weak words can be listed for a spelling check.

Usage (system python, no pyenv needed):
  python3 -I tools/transcribe-fast.py <audio 16k mono wav> --out=<path without ext> [--chunks 3] [--parallel 1]
      [--threads 2] [--resume] [--beam 5]
Make the wav first:  ffmpeg -i clip.mov -vn -ac 1 -ar 16000 -c:a pcm_s16le audio16k.wav
Writes <out>.words.json [{id,text,start,end,prob}] (same schema as transcribe.py + prob), <out>.srt, <out>.txt
"""

import argparse
import json
import os
import subprocess
import sys
import time
import unicodedata
import wave
from pathlib import Path

import numpy as np

SR = 16000
MODEL = str(Path(__file__).resolve().parent.parent / "assets" / "models" / "asr" / "bengali-whisper-medium-ct2")
SENTENCE_END = ("।", "?", "!", ".", "؟")
VOWEL_SIGN_TO_LETTER = {"া": "আ", "ি": "ই", "ী": "ঈ", "ু": "উ", "ূ": "ঊ", "ৃ": "ঋ", "ে": "এ", "ৈ": "ঐ", "ো": "ও", "ৌ": "ঔ"}


def load_wav(path):
    with wave.open(str(path), "rb") as w:
        assert w.getframerate() == SR and w.getnchannels() == 1, "need 16 kHz mono wav"
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0


def fix_word(text):
    # A word-initial vowel comes out as its dependent sign from this fine-tune (transcribe.py): map it back.
    text = unicodedata.normalize("NFC", text)
    if text and text[0] in VOWEL_SIGN_TO_LETTER:
        text = VOWEL_SIGN_TO_LETTER[text[0]] + text[1:]
    return text


def rms_db(x):
    return 10 * np.log10(float(np.mean(np.square(x))) + 1e-12) if len(x) else -120.0


def speech_level_db(audio):
    n = SR // 20
    frames = [rms_db(audio[i:i + n]) for i in range(0, max(len(audio) - n, 1), n)]
    return float(np.percentile(frames, 90)) if frames else -120.0


def is_phantom(seg, audio, speech_db):
    chunk = audio[int(seg.start * SR):int(seg.end * SR)]
    if rms_db(chunk) < speech_db - 25:
        return True
    dur = max(seg.end - seg.start, 0.01)
    n = len(seg.words or [])
    return dur < 1.5 and n / dur > 6


def srt_time(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def group_cues(words, max_chars=60, max_dur=4.0, max_gap=0.6):
    cues, cur = [], None
    for w in words:
        if cur and (w["start"] - cur["end"] > max_gap or len(cur["text"]) + 1 + len(w["text"]) > max_chars
                    or w["end"] - cur["start"] > max_dur):
            cues.append(cur)
            cur = None
        if cur is None:
            cur = {"start": w["start"], "end": w["end"], "text": w["text"]}
        else:
            cur["text"] += " " + w["text"]
            cur["end"] = w["end"]
        if w["text"].endswith(SENTENCE_END):
            cues.append(cur)
            cur = None
    if cur:
        cues.append(cur)
    return cues


def find_cuts(audio, n_chunks, search=3.0):
    """Quietest 120 ms window within ±search s of each equal split point. Returns [0, c1, ..., total]."""
    total = len(audio) / SR
    fr = int(0.02 * SR)
    nfr = len(audio) // fr
    e = np.array([np.mean(np.square(audio[i * fr:(i + 1) * fr])) for i in range(nfr)])
    k = 6
    sm = np.convolve(e, np.ones(k) / k, mode="valid")
    cuts = [0.0]
    for j in range(1, n_chunks):
        target = total * j / n_chunks
        lo, hi = max(0, int((target - search) / 0.02)), min(len(sm) - 1, int((target + search) / 0.02))
        i = lo + int(np.argmin(sm[lo:hi]))
        cuts.append(round((i + k / 2) * 0.02, 3))
    cuts.append(round(total, 3))
    return cuts


def worker(a):
    t0 = time.time()
    from faster_whisper import WhisperModel
    audio = load_wav(a.wav)
    chunk = audio[int(a.start * SR):int(a.end * SR)]
    model = WhisperModel(MODEL, device="cpu", compute_type="int8", cpu_threads=a.threads, local_files_only=True)
    t1 = time.time()
    print(f"[w{a.worker}] {a.start:.1f}-{a.end:.1f} s: model loaded in {t1 - t0:.0f} s", flush=True)
    segments, _ = model.transcribe(chunk, language="bn", beam_size=a.beam, vad_filter=True, word_timestamps=True,
                                   condition_on_previous_text=False, without_timestamps=True)
    words, dropped = [], 0
    for seg in segments:
        if is_phantom(seg, chunk, a.speech_db):
            dropped += 1
            continue
        for w in seg.words or []:
            t = fix_word(w.word.strip())
            if t:
                words.append({"text": t, "start": round(a.start + w.start, 3), "end": round(a.start + max(w.end, w.start), 3),
                              "prob": round(float(w.probability), 3)})
    Path(a.out_json).write_text(json.dumps(words, ensure_ascii=False), encoding="utf-8")
    print(f"[w{a.worker}] done: {len(words)} words, {dropped} phantom, decode {time.time() - t1:.0f} s", flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("wav")
    ap.add_argument("--out", required=True)
    ap.add_argument("--chunks", type=int, default=3)
    ap.add_argument("--parallel", type=int, default=1, help="decoders at once. Each holds ~3 GB at beam 5; on the cloud machine even 2 were OOM-killed (3 GB + 3 GB), so the default is 1")
    ap.add_argument("--threads", type=int, default=2, help="CPU threads per decoder (2 when running one at a time)")
    ap.add_argument("--resume", action="store_true", help="skip chunks whose .chunkN.json already exists")
    ap.add_argument("--beam", type=int, default=5)
    ap.add_argument("--worker", type=int, default=None)
    ap.add_argument("--start", type=float, default=0.0)
    ap.add_argument("--end", type=float, default=0.0)
    ap.add_argument("--speech-db", type=float, default=-30.0)
    ap.add_argument("--out-json", default=None)
    a = ap.parse_args()
    if a.worker is not None:
        return worker(a)

    t0 = time.time()
    audio = load_wav(a.wav)
    total = len(audio) / SR
    cuts = find_cuts(audio, a.chunks)
    sdb = speech_level_db(audio)
    print(f"{total:.1f} s of audio, speech level {sdb:.1f} dB, cuts at {cuts}", flush=True)
    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ, OMP_NUM_THREADS="1", MKL_NUM_THREADS="1", HF_HUB_DISABLE_TELEMETRY="1")
    jobs = []
    for k in range(a.chunks):
        pj = f"{out}.chunk{k}.json"
        cmd = [sys.executable, "-I", str(Path(__file__).resolve()), a.wav, "--out", str(out), "--worker", str(k),
               "--start", str(cuts[k]), "--end", str(cuts[k + 1]), "--beam", str(a.beam), "--speech-db", str(sdb),
               "--threads", str(a.threads), "--out-json", pj]
        jobs.append((cmd, pj))
    # At most --parallel decoders at once. Each holds ~3 GB at beam 5; three at once, and then two at once, were
    # OOM-killed (exit -9, no traceback) on the cloud machine on 2026-11-09. One at a time (2 threads) is safe.
    pending = [k for k in range(len(jobs)) if not (a.resume and Path(jobs[k][1]).exists())]
    running, bad = [], []
    while pending or running:
        while pending and len(running) < a.parallel:
            k = pending.pop(0)
            running.append((k, subprocess.Popen(jobs[k][0], env=env)))
        time.sleep(0.5)
        for item in running[:]:
            rc = item[1].poll()
            if rc is not None:
                running.remove(item)
                if rc != 0:
                    bad.append((item[0], rc))
    if bad:
        sys.exit(f"✗ worker failed (chunk, exit code): {bad}  (-9 = killed, usually out of memory)")
    words = []
    for _, pj in jobs:
        words += json.loads(Path(pj).read_text(encoding="utf-8"))
    words.sort(key=lambda w: w["start"])
    for i, w in enumerate(words):
        w["id"] = f"w{i}"
    words = [{"id": w["id"], "text": w["text"], "start": w["start"], "end": w["end"], "prob": w["prob"]} for w in words]
    Path(f"{out}.words.json").write_text(json.dumps(words, ensure_ascii=False, indent=2), encoding="utf-8")
    cues = group_cues(words)
    Path(f"{out}.srt").write_text("\n".join(f"{i}\n{srt_time(c['start'])} --> {srt_time(c['end'])}\n{c['text']}\n" for i, c in enumerate(cues, 1)), encoding="utf-8")
    Path(f"{out}.txt").write_text(" ".join(c["text"] for c in cues) + "\n", encoding="utf-8")
    took = time.time() - t0
    print(f"\n✓ {len(words)} words, {len(cues)} lines, {total:.1f} s of audio in {took:.0f} s ({took / total:.1f}x real time)", flush=True)
    for ext in ("words.json", "srt", "txt"):
        print(f"  {out}.{ext}")


if __name__ == "__main__":
    main()
