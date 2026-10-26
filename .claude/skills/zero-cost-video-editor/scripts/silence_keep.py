#!/usr/bin/env python3
"""Find the parts of a recording that contain speech and write them as a keep list.

    python scripts/silence_keep.py input/aroll.mp4 -o work/keep.json

The keep list is the rough cut: every pause longer than --min-silence is removed,
with --pad seconds of breathing room left on both sides of each cut.
Output: {"source": ..., "duration": ..., "segments": [{"start": s, "end": e}, ...]}
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


def media_duration(path: str) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path],
        capture_output=True, text=True, check=True).stdout.strip()
    return float(out)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("media", help="video or audio file")
    ap.add_argument("-o", "--out", default="work/keep.json")
    ap.add_argument("--noise", default="-35dB", help="level counted as silence (raise to -30dB for noisy rooms)")
    ap.add_argument("--min-silence", type=float, default=0.45, help="shortest pause (s) that gets cut")
    ap.add_argument("--pad", type=float, default=0.12, help="seconds kept before/after speech")
    ap.add_argument("--min-keep", type=float, default=0.25, help="drop kept pieces shorter than this (s)")
    a = ap.parse_args()

    total = media_duration(a.media)
    p = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", a.media, "-vn",
                        "-af", f"silencedetect=noise={a.noise}:d={a.min_silence}", "-f", "null", "-"],
                       capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", p.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", p.stderr)]
    if len(ends) < len(starts):          # recording ends in silence
        ends.append(total)

    speech, cur = [], 0.0
    for s, e in zip(starts, ends):
        s = max(0.0, s)
        if s > cur:
            speech.append([cur, s])
        cur = e
    if total > cur:
        speech.append([cur, total])

    # pad, clamp, merge overlaps, drop slivers
    padded = []
    for s, e in speech:
        s, e = max(0.0, s - a.pad), min(total, e + a.pad)
        if padded and s <= padded[-1][1]:
            padded[-1][1] = max(padded[-1][1], e)
        else:
            padded.append([s, e])
    keep = [{"start": round(s, 3), "end": round(e, 3)} for s, e in padded if e - s >= a.min_keep]

    kept = sum(k["end"] - k["start"] for k in keep)
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps({"source": a.media, "duration": round(total, 3), "segments": keep}, indent=2),
                           encoding="utf-8")
    print(f"{len(keep)} segments kept | {total:.1f}s -> {kept:.1f}s ({total - kept:.1f}s of pauses removed) | {a.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
