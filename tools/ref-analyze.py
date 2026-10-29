"""ref-analyze.py — the numbers behind a reference video's SOUND (tools/ref-analyze.mjs runs it with the workspace
Python, -I): tempo, voice pitch, level per second, bass and bright hits, a rough key.

  tools/pyenv/Scripts/python.exe -I tools/ref-analyze.py <mono 22.05 kHz wav> <out.json>

Verified 2026-10-29 on assets/refs/ref-01.mp4 (58.5 s): 129 BPM on the percussive part, 123 on the whole mix, voice
f0 median 130 Hz, 14 bass hits, about 15 s to run. The key is a guess: the mix has speech and effects in it.
"""
import json
import sys

import librosa
import numpy as np
from scipy.signal import find_peaks

SR = 22050
HOP = 512
NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
MAJOR = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


def hits(db, times, gap_s, prominence, n):
    pk, _ = find_peaks(db, distance=max(1, int(gap_s * SR / HOP)), prominence=prominence)
    top = sorted(pk, key=lambda i: -db[i])[:n]
    return sorted(round(float(times[i]), 2) for i in top)


def main(wav, out):
    y, sr = librosa.load(wav, sr=SR, mono=True)
    res = {"duration_s": round(len(y) / sr, 2)}

    y_h, y_p = librosa.effects.hpss(y)
    tempo, _ = librosa.beat.beat_track(y=y_p, sr=sr, units="time")
    res["tempo_bpm_percussive"] = round(float(np.atleast_1d(tempo)[0]), 1)
    onset = librosa.onset.onset_strength(y=y, sr=sr)
    res["tempo_bpm_mix"] = round(float(np.median(librosa.feature.rhythm.tempo(onset_envelope=onset, sr=sr, aggregate=None))), 1)

    f0, _, _ = librosa.pyin(y, fmin=75, fmax=320, sr=sr, frame_length=2048)
    f0v = f0[~np.isnan(f0)]
    if len(f0v):
        res["voice_f0_hz"] = {
            "median": int(np.median(f0v)),
            "p10": int(np.percentile(f0v, 10)),
            "p90": int(np.percentile(f0v, 90)),
            "voiced_fraction": round(len(f0v) / len(f0), 2),
        }

    step = sr
    res["rms_db_per_second"] = [
        int(round(20 * np.log10(np.sqrt(np.mean(y[i:i + step] ** 2)) + 1e-9))) for i in range(0, len(y) - step + 1, step)
    ]

    S = np.abs(librosa.stft(y, n_fft=4096, hop_length=HOP))
    freqs = librosa.fft_frequencies(sr=sr, n_fft=4096)
    times = librosa.frames_to_time(np.arange(S.shape[1]), sr=sr, hop_length=HOP)
    low = 20 * np.log10(S[(freqs >= 35) & (freqs <= 120)].sum(axis=0) + 1e-9)
    high = 20 * np.log10(S[(freqs >= 6000) & (freqs <= 10000)].sum(axis=0) + 1e-9)
    res["bass_hits_s"] = hits(low, times, 1.0, 6, 14)
    res["bright_hits_s"] = hits(high, times, 0.8, 8, 14)
    res["spectral_centroid_hz"] = int(librosa.feature.spectral_centroid(y=y, sr=sr)[0].mean())

    prof = librosa.feature.chroma_cqt(y=y_h, sr=sr).mean(axis=1)
    keys = [(float(np.corrcoef(np.roll(MAJOR, k), prof)[0, 1]), f"{NAMES[k]} major") for k in range(12)]
    keys += [(float(np.corrcoef(np.roll(MINOR, k), prof)[0, 1]), f"{NAMES[k]} minor") for k in range(12)]
    keys.sort(reverse=True)
    res["key_guess"] = [{"key": k, "r": round(c, 2)} for c, k in keys[:3]]

    with open(out, "w", encoding="utf-8") as f:
        json.dump(res, f, indent=1)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
