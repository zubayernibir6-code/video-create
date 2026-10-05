"""transcribe.py — speech to text with word timings, for captions, subtitles and text-based editing.

Run it through tools/transcribe.mjs (which finds the workspace Python), or directly:
  "E:/Video Create/tools/pyenv/Scripts/python.exe" "E:/Video Create/tools/transcribe.py" <audio-or-video>
      [--lang bn|en] [--model bengali|turbo|small|medium|<model folder>] [--out <path without extension>]

Writes three files next to the input (or at --out):
  <name>.words.json  [{id, text, start, end}] — the format `hyperframes transcribe <file> -d <project>` imports
  <name>.srt         subtitle lines, ready for tools/burn-subs.mjs
  <name>.txt         plain text, for reading and correcting

Models (all run on the CPU with int8; measured on this laptop, CLAUDE.md §0b):
  bengali  SayedShaun/bengali-whisper-medium-ct2 in assets/models/asr — tugstugi's 1st-place Bengali.AI
           weights, Apache-2.0. The default for --lang bn. It writes no punctuation.
  turbo    faster-whisper large-v3-turbo (HF cache) — multilingual and punctuated, but stock Whisper misspells
           a lot of Bengali.
  small    faster-whisper small (HF cache) — the default for --lang en; unusable for Bengali.
VAD skips silences. condition_on_previous_text is off, because it stops Whisper repeating itself on long files.
Speed on this laptop: bengali ≈ 10x real time (30 s clip: 304 s), turbo ≈ 3.7x (112 s). Tried and rejected:
beam_size=1 (only 15 % faster) and cpu_threads=8 (16 % faster, but it dropped the whole first sentence).
"""

import argparse
import ctypes
import json
import os
import sys
import time
import unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKSPACE = HERE.parent
MODELS = {
    "bengali": str(WORKSPACE / "assets" / "models" / "asr" / "bengali-whisper-medium-ct2"),
    "turbo": "large-v3-turbo",
    "small": "small",
    "medium": "medium",
}
SENTENCE_END = ("।", "?", "!", ".", "؟")


def peak_memory_gb():
    """Peak working set of this process (Windows), for the summary line."""
    try:
        class PMC(ctypes.Structure):
            _fields_ = [("cb", ctypes.c_ulong), ("PageFaultCount", ctypes.c_ulong),
                        ("PeakWorkingSetSize", ctypes.c_size_t), ("WorkingSetSize", ctypes.c_size_t),
                        ("QuotaPeakPagedPoolUsage", ctypes.c_size_t), ("QuotaPagedPoolUsage", ctypes.c_size_t),
                        ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t), ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                        ("PagefileUsage", ctypes.c_size_t), ("PeakPagefileUsage", ctypes.c_size_t)]
        k32 = ctypes.WinDLL("kernel32")
        k32.GetCurrentProcess.restype = ctypes.c_void_p
        k32.K32GetProcessMemoryInfo.argtypes = [ctypes.c_void_p, ctypes.POINTER(PMC), ctypes.c_ulong]
        pmc = PMC()
        pmc.cb = ctypes.sizeof(PMC)
        if not k32.K32GetProcessMemoryInfo(k32.GetCurrentProcess(), ctypes.byref(pmc), pmc.cb):
            return None
        return pmc.PeakWorkingSetSize / 2**30
    except Exception:
        return None


def srt_time(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def group_cues(words, max_chars=60, max_dur=4.0, max_gap=0.6):
    """Subtitle lines: break at sentence ends, pauses over max_gap, or when a line gets too long."""
    cues, cur = [], None
    for w in words:
        if cur and (w["start"] - cur["end"] > max_gap
                    or len(cur["text"]) + 1 + len(w["text"]) > max_chars
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


def main():
    ap = argparse.ArgumentParser(description="Speech to text with word timings.")
    ap.add_argument("media")
    ap.add_argument("--lang", default="bn", help="bn (default) or en, or any Whisper language code")
    ap.add_argument("--model", default=None, help="bengali | turbo | small | medium | a CTranslate2 model folder")
    ap.add_argument("--out", default=None, help="output path without extension")
    a = ap.parse_args()

    media = Path(a.media).resolve()
    if not media.exists():
        sys.exit(f"✗ File not found: {media}")
    model_key = a.model or ("bengali" if a.lang == "bn" else "small")
    model_ref = MODELS.get(model_key, model_key)
    if model_key == "bengali" and not Path(model_ref, "model.bin").exists():
        sys.exit(f"✗ The Bengali model is missing: {model_ref}")
    out = Path(a.out).resolve() if a.out else media.with_suffix("")

    from faster_whisper import WhisperModel  # imported late so --help stays fast

    t0 = time.time()
    print(f"Loading model '{model_key}' …", flush=True)
    try:
        model = WhisperModel(model_ref, device="cpu", compute_type="int8", cpu_threads=4, local_files_only=True)
    except Exception:
        # Not in the local cache yet: allow the one-time download.
        model = WhisperModel(model_ref, device="cpu", compute_type="int8", cpu_threads=4)
    print(f"Listening to {media.name} (language {a.lang}) …", flush=True)
    segments, info = model.transcribe(
        str(media), language=a.lang, beam_size=5, vad_filter=True, word_timestamps=True,
        condition_on_previous_text=False,
    )

    words = []
    for seg in segments:
        print(f"  [{seg.start:7.1f} s] {unicodedata.normalize('NFC', seg.text.strip())}", flush=True)
        for w in seg.words or []:
            text = unicodedata.normalize("NFC", w.word.strip())
            if text:
                words.append({"id": f"w{len(words)}", "text": text, "start": round(w.start, 3), "end": round(max(w.end, w.start), 3)})
    if not words:
        sys.exit("✗ No speech found.")

    Path(f"{out}.words.json").write_text(json.dumps(words, ensure_ascii=False, indent=2), encoding="utf-8")
    cues = group_cues(words)
    Path(f"{out}.srt").write_text(
        "\n".join(f"{i}\n{srt_time(c['start'])} --> {srt_time(c['end'])}\n{c['text']}\n" for i, c in enumerate(cues, 1)),
        encoding="utf-8")
    Path(f"{out}.txt").write_text(" ".join(c["text"] for c in cues) + "\n", encoding="utf-8")

    took = time.time() - t0
    mem = peak_memory_gb()
    print(f"\n✓ {len(words)} words, {len(cues)} subtitle lines, {info.duration:.1f} s of audio in {took:.0f} s"
          f" ({took / max(info.duration, 0.1):.1f}x real time){f', peak memory {mem:.1f} GB' if mem else ''}")
    for ext in ("words.json", "srt", "txt"):
        print(f"  {out}.{ext}")


if __name__ == "__main__":
    main()
