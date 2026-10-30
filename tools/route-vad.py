# route-vad.py — how much of a file's audio is human speech (for tools/route.mjs). Offline: the silero VAD model
# that ships inside faster-whisper (tools/pyenv), no download. Decodes with FFmpeg to 16 kHz mono.
#   tools/pyenv/Scripts/python.exe -I tools/route-vad.py <media file> [--max=900]
# Prints JSON: {"total": s analysed, "speech": s of speech, "segments": n, "first": s, "last": s, "active": s above -45 dBFS}
# --max analyses only the first N seconds (default 900) so a 2-hour file stays quick.
# Verified 2026-10-30: Voice.m4a (claude-video-tutorial) and BGM.mp3 told apart (see tools/route.mjs header).
import json, subprocess, sys
import numpy as np
from faster_whisper.vad import VadOptions, get_speech_timestamps

SR = 16000
path = sys.argv[1]
mx = next((float(a[6:]) for a in sys.argv[2:] if a.startswith("--max=")), 900.0)
raw = subprocess.run(["ffmpeg", "-v", "error", "-t", str(mx), "-i", path, "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                     capture_output=True).stdout
audio = np.frombuffer(raw, dtype=np.float32)
if audio.size == 0:
    print(json.dumps({"total": 0, "speech": 0, "segments": 0, "active": 0}))
    sys.exit(0)
segs = get_speech_timestamps(audio, VadOptions(min_silence_duration_ms=400, min_speech_duration_ms=250))
speech = sum(s["end"] - s["start"] for s in segs) / SR
# active = 1-s windows louder than -45 dBFS (music and speech both count; silence does not)
n = audio.size // SR
rms = np.sqrt(np.mean(audio[: n * SR].reshape(n, SR) ** 2, axis=1) + 1e-12) if n else np.array([])
active = int(np.sum(20 * np.log10(rms) > -45))
print(json.dumps({"total": round(audio.size / SR, 2), "speech": round(speech, 2), "segments": len(segs),
                  "first": round(segs[0]["start"] / SR, 2) if segs else None,
                  "last": round(segs[-1]["end"] / SR, 2) if segs else None, "active": active}))
