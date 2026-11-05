"""music.py: an original, royalty-free ad music bed synthesised from code (no samples, no AI model: safe to sell).
    tools/pyenv/bin/python -I tools/hook-ad/music.py <out.wav> --dur=42 [--bpm=100] [--drop=6.0] [--stop=39.0] [--key=62] [--seed=7]
Uplifting I-V-vi-IV in the given key (MIDI root, 62 = D): warm detuned pad, plucked 8th-note arpeggio with a
ping-pong echo, sub bass, kick/clap/hats that enter at --drop (a shot change, so the whoosh lands on it) and stop
at --stop (the CTA), then the pad rings out. A small convolution reverb glues it. Writes 48 kHz stereo 24-bit WAV
at about -20 LUFS (the mix ducks it under the voice). Made 2026-11-05 for unity-edit-02 (no music in assets/music,
no Lyria key on the cloud machine)."""
import sys, numpy as np, wave
from scipy.signal import butter, sosfilt, fftconvolve
A = {k: v for k, v in (x[2:].split("=") for x in sys.argv[2:] if x.startswith("--"))}
OUT, DUR = sys.argv[1], float(A.get("dur", 42)); BPM = float(A.get("bpm", 100)); DROP = float(A.get("drop", 6))
STOP = float(A.get("stop", DUR - 3)); ROOT = int(A.get("key", 62)); SR = 48000
rng = np.random.default_rng(int(A.get("seed", 7)))
N = int((DUR + 2.5) * SR); L = np.zeros(N); R = np.zeros(N)
beat = 60 / BPM; bar = 4 * beat
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def put(buf, t, x, g=1.0):
    i = int(t * SR); j = min(N, i + len(x))
    if i < N: buf[i:j] += g * x[: j - i]
# chords as semitones from ROOT: I, V, vi, IV
PROG = [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]]
nbar = int(np.ceil(DUR / bar)) + 1
for b in range(nbar):
    t0 = b * bar; ch = PROG[b % 4]
    # pad: 3 detuned saws per note, slow attack, low-passed
    n = int(bar * 1.15 * SR); tt = np.arange(n) / SR
    env = np.minimum(1, tt / 0.6) * np.minimum(1, (bar * 1.15 - tt) / 0.5)
    for s in ch:
        f = hz(ROOT - 12 + s)
        for d, pan in ((-0.12, 0.3), (0, 0.5), (0.12, 0.7)):
            ph = (f * 2 ** (d / 12) * tt + rng.random()) % 1
            x = lp((2 * ph - 1) * env, 1400) * 0.035
            put(L, t0, x * (1 - pan)); put(R, t0, x * pan)
    # sub bass: root on beats 1 and 3 (and the 'and' of 4 for push once the beat is in)
    for k, (bt, ln) in enumerate(((0, 1.8), (2, 1.4), (3.5, 0.45))):
        if k == 2 and t0 < DROP: continue
        n = int(ln * beat * SR); tt = np.arange(n) / SR; f = hz(ROOT - 24 + ch[0] % 12)
        x = np.tanh(1.6 * np.sin(2 * np.pi * f * tt)) * np.exp(-tt * 1.4) * np.minimum(1, tt / 0.01) * 0.15
        put(L, t0 + bt * beat, x); put(R, t0 + bt * beat, x)
    # pluck arpeggio, 8ths, up-down over two octaves, ping-pong echo at a dotted 8th
    pat = [0, 1, 2, 3, 2, 1, 2, 3]; notes = [ROOT + s for s in ch] + [ROOT + 12 + ch[0]]
    for i, p in enumerate(pat):
        t = t0 + i * beat / 2; f = hz(notes[p]); n = int(0.5 * SR); tt = np.arange(n) / SR
        x = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(4 * np.pi * f * tt) + 0.12 * np.sin(6 * np.pi * f * tt))
        x *= np.exp(-tt * 9) * np.minimum(1, tt / 0.003) * (0.075 if i % 2 == 0 else 0.055)
        pan = 0.35 + 0.3 * (i % 2)
        put(L, t, x * (1 - pan)); put(R, t, x * pan)
        put(R, t + 0.75 * beat, x * 0.35); put(L, t + 1.5 * beat, x * 0.18)
    # drums after the drop
    if t0 + bar <= DROP - 0.01 or t0 >= STOP: continue
    for q in range(8):
        t = t0 + q * beat / 2
        if t < DROP - 0.01 or t >= STOP: continue
        if q % 2 == 0:  # kick on every beat (four on the floor, soft)
            n = int(0.35 * SR); tt = np.arange(n) / SR
            f = 50 + 110 * np.exp(-tt * 28); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9) * 0.5
            put(L, t, x); put(R, t, x)
        if q in (2, 6):  # clap: three noise flams, band-passed
            n = int(0.25 * SR); tt = np.arange(n) / SR; x = np.zeros(n)
            for o in (0, 0.011, 0.022):
                k = int(o * SR); x[k:] += rng.standard_normal(n - k) * np.exp(-np.arange(n - k) / SR * 30)
            x = hp(lp(x, 2500), 900) * 0.16
            put(L, t, x * 0.9); put(R, t, x)
        n = int(0.06 * SR); tt = np.arange(n) / SR  # hats on 8ths, offbeats louder
        x = hp(rng.standard_normal(n), 8000, 4) * np.exp(-tt * 70) * (0.07 if q % 2 else 0.035)
        put(L, t, x * 0.7); put(R, t, x)
# riser into the drop (filtered noise sweep)
n = int(1.6 * SR); tt = np.arange(n) / SR; x = rng.standard_normal(n) * (tt / 1.6) ** 3 * 0.025
x = hp(x, 1500); put(L, DROP - 1.6, x); put(R, DROP - 1.6, x)
# reverb: 1.8 s exponentially decaying stereo noise IR, 22 % wet
ir_n = int(1.8 * SR); it = np.arange(ir_n) / SR
irl = rng.standard_normal(ir_n) * np.exp(-it * 3.2); irr = rng.standard_normal(ir_n) * np.exp(-it * 3.2)
irl = lp(irl, 5000) / np.sqrt(np.sum(irl ** 2)); irr = lp(irr, 5000) / np.sqrt(np.sum(irr ** 2))
L = L + 0.22 * fftconvolve(L, irl)[:N]; R = R + 0.22 * fftconvolve(R, irr)[:N]
# master: gentle high-pass, fade in 0.3 s, fade out the last 2.5 s, soft clip, normalise to -3 dBFS peak
y = np.stack([hp(L, 30), hp(R, 30)], 1)[: int(DUR * SR)]
ti = np.arange(len(y)) / SR
y *= (np.minimum(1, ti / 0.3) * np.clip((DUR - ti) / 2.5, 0, 1))[:, None]
y = np.tanh(1.2 * y / np.max(np.abs(y))) ; y *= 0.708 / np.max(np.abs(y))
pcm = (np.clip(y, -1, 1) * (2 ** 23 - 1)).astype(np.int32)
b = np.zeros((len(pcm), 2, 3), np.uint8)
for k in range(3): b[:, :, k] = (pcm >> (8 * k)) & 0xFF
with wave.open(OUT, "wb") as w:
    w.setnchannels(2); w.setsampwidth(3); w.setframerate(SR); w.writeframes(b.tobytes())
print(f"wrote {OUT}: {DUR:.2f} s, {BPM:g} BPM, drums {DROP:.2f}-{STOP:.2f} s")
