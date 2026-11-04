"""sync_check.py — proves picture and sound are in sync in a FINISHED promo (tools/promo), by measuring the file.

    tools/pyenv/Scripts/python.exe -I tools/promo/sync_check.py <master.mp4> <voice file> <build/timeline.json>

1. Voice position: cross-correlates the master's audio with the original voice file in a window at the START and
   one at the END. Both must give the planned offset (voiceAt) within 1 ms: equal offsets = no drift anywhere.
2. Hard cuts: finds every frame where the picture changes completely (mean absolute difference of 64x36 grey
   thumbnails, a jump far above its neighbours) and matches each planned cut (timeline.json shots with in "cut")
   to the nearest detected one: the frame must be exactly the planned frame.
3. Each cut's word: prints how far the cut frame is from the word it was planned on (the word start measured from
   the voice audio by tools/promo/build.mjs). Within half a frame (±21 ms at 24 fps) is exact.
Exit 1 when any check fails. Verified 2026-11-04 on renders/mohona-promo-01 (cloud).
"""
import json
import subprocess
import sys

import numpy as np

master, voice_file, tl_file = sys.argv[1:4]
TL = json.load(open(tl_file, encoding="utf-8"))
FPS = TL["fps"]
SR = 16000
fails = []


def pcm(path, start=None, dur=None):
    cmd = ["ffmpeg", "-v", "error"]
    if start is not None:
        cmd += ["-ss", f"{start:.3f}"]
    if dur is not None:
        cmd += ["-t", f"{dur:.3f}"]
    cmd += ["-i", path, "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32)


def lag_of(ref, sig):
    """Lag (samples) of ref inside sig, by FFT cross-correlation, with parabolic sub-sample refinement."""
    n = 1 << int(np.ceil(np.log2(len(ref) + len(sig))))
    c = np.fft.irfft(np.fft.rfft(sig, n) * np.conj(np.fft.rfft(ref, n)), n)
    c = c[: len(sig)]
    k = int(np.argmax(c))
    if 0 < k < len(c) - 1:
        a, b, d = c[k - 1], c[k], c[k + 1]
        k = k + 0.5 * (a - d) / (a - 2 * b + d)
    return k, float(np.max(c) / (np.linalg.norm(ref) * np.linalg.norm(sig[: len(ref)]) + 1e-9))


def start_time(kind):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", f"{kind}:0", "-show_entries", "stream=start_time",
                        "-of", "csv=p=0", master], capture_output=True, text=True).stdout.strip()
    return float(r or 0)


# everything in PRESENTATION time: the time a player shows/plays it (stream start_time + position in the stream)
a0, v0 = start_time("a"), start_time("v")
print(f"0. stream starts: audio {a0:.4f} s, video {v0:.4f} s  (a player shows the first frame at {v0:.4f} s)")
if abs(v0 - a0) > 0.001:
    fails.append(f"video starts {1000 * (v0 - a0):+.1f} ms from the audio (no edit list to line them up)")
voice = pcm(voice_file)
full = pcm(master)            # the whole track from its first sample (= a0)
at = TL["voiceAt"]
print("1. voice position in the finished file (planned %.3f s)" % at)
offsets = []
for name, vs in (("start", 0.0), ("end", max(0.0, len(voice) / SR - 9.0))):
    ref = voice[int(vs * SR): int((vs + 8.0) * SR)]
    w0 = max(0.0, at + vs - 1.0)
    win = full[int(w0 * SR): int((w0 + 10.0) * SR)]
    k, score = lag_of(ref, win)
    off = a0 + w0 + k / SR - vs
    offsets.append(off)
    ok = abs(off - at) <= 0.001
    print(f"   {name:5s} window (voice {vs:5.2f}-{vs + 8:5.2f} s): voice plays at {off:.4f} s  (error {1000 * (off - at):+.2f} ms, match {score:.2f})  {'OK' if ok else 'FAIL'}")
    if not ok:
        fails.append(f"voice {name} at {off:.4f}")
print(f"   drift start→end: {1000 * (offsets[1] - offsets[0]):+.2f} ms")

# 2. hard cuts
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", master, "-vf", "scale=64:36,format=gray", "-fps_mode", "passthrough", "-f", "rawvideo", "-"],
                     capture_output=True, check=True).stdout
fr = np.frombuffer(raw, dtype=np.uint8).reshape(-1, 36, 64).astype(np.float32)
diff = np.r_[0, np.mean(np.abs(np.diff(fr, axis=0)), axis=(1, 2))]
print(f"\n2. hard cuts in presentation time (video has {len(fr)} coded frames; planned {TL['frames']})")
if len(fr) != TL["frames"]:
    fails.append(f"frame count {len(fr)} != {TL['frames']}")
import os
shots_dir = os.path.join(os.path.dirname(os.path.abspath(tl_file)), "..", "assets", "media", "shots")


def thumbs(path, first=True):
    args = ["ffmpeg", "-v", "error"] + ([] if first else ["-sseof", "-0.5"]) + ["-i", path, "-vf", "scale=64:36,format=gray",
                                                                               "-fps_mode", "passthrough", "-f", "rawvideo", "-"]
    t = np.frombuffer(subprocess.run(args, capture_output=True, check=True).stdout, dtype=np.uint8).reshape(-1, 36, 64).astype(np.float32)
    return t[0] if first else t[-1]


# a cut inside one continuous clip has no visual jump, so each cut is proven by IDENTITY: the frame shown at the cut
# must be the new shot's first frame and the frame before it the old shot's last frame (texts and vignette sit on top,
# so the best match among the neighbours decides)
prev = None
for s in TL["shots"]:
    if s["in"] == "cut" and prev is not None:
        f0 = round(s["start"] * FPS)
        first = thumbs(os.path.join(shots_dir, s["id"] + ".mp4"))
        last = thumbs(os.path.join(shots_dir, prev["id"] + ".mp4"), first=False)
        cand = range(max(1, f0 - 3), min(len(fr), f0 + 4))
        k_new = min(cand, key=lambda k: np.mean(np.abs(fr[k] - first)))
        k_old = min(range(max(0, f0 - 4), min(len(fr) - 1, f0 + 3)), key=lambda k: np.mean(np.abs(fr[k] - last)))
        shown = v0 + k_new / FPS
        ok = k_new == f0 and k_old == f0 - 1 and abs(v0) < 0.5 / FPS
        wd = (shown - s["atTime"]) * 1000
        print(f"   {s['id']:4s} planned frame {f0:4d} ({f0 / FPS:6.3f} s): its first frame found at {k_new}, the old shot's last at {k_old}; shown at {shown:6.3f} s, word '{s['at']}' {s['atTime']:.3f} s: {wd:+5.0f} ms  {'OK' if ok else 'FAIL'}")
        if not ok:
            fails.append(f"cut {s['id']}")
    prev = s

print("\n3. transitions (their middle on the word)")
for s in TL["shots"]:
    if s["in"] in ("cut", "none"):
        continue
    print(f"   {s['id']:4s} {s['in']:8s} middle {s['mid']:.3f} s, word '{s['at']}' at {s['atTime']:.3f} s: {1000 * (s['mid'] - s['atTime']):+5.0f} ms")

print("\nRESULT:", "PASS" if not fails else "FAIL " + "; ".join(fails))
sys.exit(1 if fails else 0)
