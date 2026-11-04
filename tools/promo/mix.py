"""mix.py — the soundtrack of a client promo (tools/promo, style CP1), sample-exact.

    tools/pyenv/Scripts/python.exe -I tools/promo/mix.py <mix.spec.json>

The spec is written by tools/promo/build.mjs. Everything is placed by sample at 48 kHz, so a sound that should start
on frame N of a 24-fps video starts on exactly that frame (no FFmpeg adelay rounding, no filter-graph drift):
  - the voice at `voice.at` seconds (resampled to 48 kHz stereo, untouched otherwise),
  - the music beds (`beds`: a later, bar-aligned stretch of the song crossfaded in, equal power, `xfade` s),
    under a gain envelope given as breakpoints [t, dB] with straight ramps between them (the ducking under speech),
    and a fade-out to silence over the last `fadeOut` s,
  - every sound effect at its start time and volume.
Writes <out>/mix.wav (the whole soundtrack), <out>/voice-stem.wav and <out>/music-stem.wav (for measuring how far
the music sits under the voice) as 48 kHz stereo 24-bit WAV, exactly `total` seconds long. Decodes with FFmpeg.
Verified 2026-11-04 on projects/mohona-promo-01 (cloud).
"""
import json
import subprocess
import sys

import numpy as np
import soundfile as sf

SR = 48000


def load(path):
    """Any FFmpeg-readable file -> float32 stereo at 48 kHz."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def kloud(x):
    """Ungated BS.1770 loudness (LUFS) of a stereo float block at 48 kHz."""
    from scipy.signal import lfilter
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    z = lfilter(b2, a2, lfilter(b1, a1, x, axis=0), axis=0)
    return -0.691 + 10 * np.log10(np.sum(np.mean(z ** 2, axis=0)) + 1e-12)


def place(dst, src, at, gain=1.0):
    i = int(round(at * SR))
    if i < 0:
        src, i = src[-i:], 0
    n = min(len(src), len(dst) - i)
    if n > 0:
        dst[i:i + n] += src[:n] * gain


def main():
    spec = json.load(open(sys.argv[1], encoding="utf-8"))
    total = spec["total"]
    N = int(round(total * SR))
    t = np.arange(N) / SR

    voice = np.zeros((N, 2), np.float32)
    place(voice, load(spec["voice"]["file"]), spec["voice"]["at"])

    m = spec["music"]
    song = load(m["file"])
    music = np.zeros((N, 2), np.float32)
    beds = m["beds"]
    xf = m.get("xfade", 1.5)
    for k, b in enumerate(beds):
        start = b["at"]
        end = beds[k + 1]["at"] + xf if k + 1 < len(beds) else total
        seg = song[int(round(b["from"] * SR)):]
        seg = seg[: int(round((end - start) * SR))]
        g = np.ones(len(seg), np.float32)
        ts = np.arange(len(seg)) / SR
        if k > 0:      # fade in (equal power)
            x = np.clip(ts / xf, 0, 1)
            g *= np.sin(x * np.pi / 2)
        if k + 1 < len(beds):   # fade out into the next bed
            x = np.clip((ts - (end - start - xf)) / xf, 0, 1)
            g *= np.cos(x * np.pi / 2)
        if len(seg) < int(round((end - start) * SR)) - 1:
            raise SystemExit(f"music bed {k + 1} runs out of song at {start + len(seg) / SR:.2f} s (needs {end:.2f} s)")
        place(music, seg * g[:, None], start)
    # gain envelope in dB, straight lines between breakpoints, then the final fade to silence.
    # "duck": the music under each voice line is set from MEASURED loudness (BS.1770 K-weighting, the LUFS meter's
    # filter) so it sits `target` LU under that line: fixed dB levels left lines 3-5 of mohona-promo-01 only
    # 4.5-8.8 LU under the voice, because the song's second half is louder (2026-11-04)
    report = []
    if "duck" in m:
        d = m["duck"]
        R, T = d.get("ramp", 0.35), d.get("target", 14.0)
        under = []
        for a, b in d["lines"]:
            i0, i1 = int(a * SR), int(b * SR)
            lv, lm = kloud(voice[i0:i1]), kloud(music[i0:i1])
            u = float(np.clip(lv - T - lm, d.get("min", -26.0), d.get("max", -8.0)))
            under.append(u)
            report.append({"a": a, "b": b, "voice_lufs": round(lv, 2), "music_raw_lufs": round(lm, 2), "music_gain_db": round(u, 2)})
        lines = d["lines"]
        pts = [[0.0, d["open"]], [max(0.0, lines[0][0] - R), d["open"]], [lines[0][0], under[0]]]
        for i, (a, b) in enumerate(lines):
            pts += [[a, under[i]], [b, under[i]]]
            if i + 1 < len(lines):
                a2, g = lines[i + 1][0], lines[i + 1][0] - b
                top = max(under[i], under[i + 1]) + d.get("lift", 3.0)
                if g >= max(1.0, 2 * R + 0.1):   # a pause under 1 s: no lift (a swell-and-drop there pumps)
                    pts += [[b + R, top], [a2 - R, top]]
        pts += [[lines[-1][1] + R, d["end"]], [total, d["end"]]]
    else:
        pts = m["env"]
    pts = sorted(pts, key=lambda p: p[0])
    db = np.interp(t, [p[0] for p in pts], [p[1] for p in pts]).astype(np.float32)
    env = (10 ** (db / 20)).astype(np.float32)
    fo = m.get("fadeOut", 1.0)
    env *= np.clip((total - t) / fo, 0, 1).astype(np.float32)
    music *= env[:, None]

    sfx = np.zeros((N, 2), np.float32)
    cache = {}
    for s in spec["sfx"]:
        if s["file"] not in cache:
            cache[s["file"]] = load(s["file"])
        place(sfx, cache[s["file"]], s["start"], s["vol"])

    mix = voice + music + sfx
    out = spec["out"]
    peak = float(np.max(np.abs(mix)))
    if peak > 0.98:   # headroom only; loudness and true peak are set by finish.mjs (loudnorm + limiter)
        mix *= 0.98 / peak
    for name, data in (("mix", mix), ("voice-stem", voice), ("music-stem", music + 0 * sfx)):
        sf.write(f"{out}/{name}.wav", data, SR, subtype="PCM_24")
    # what the listener gets: voice vs FINAL music per line (K-weighted, after the envelope)
    for r in report:
        i0, i1 = int(r["a"] * SR), int(r["b"] * SR)
        r["gap_lu"] = round(kloud(voice[i0:i1]) - kloud(music[i0:i1]), 2)
    json.dump({"lines": report, "env": [[round(a, 3), round(b, 2)] for a, b in pts]}, open(f"{out}/mix.report.json", "w"), indent=1)
    print(json.dumps({"total": total, "samples": N, "peak": round(peak, 4), "sfx": len(spec["sfx"]),
                      "gap_lu": [r["gap_lu"] for r in report]}))


if __name__ == "__main__":
    main()
