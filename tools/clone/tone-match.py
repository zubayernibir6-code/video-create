# tone-match.py — give cloned voice blocks the same tonal balance as HIS real recording, block by block.
# usage: tools/pyenv/Scripts/python.exe -I tools/clone/tone-match.py <ref.wav> [--max=3] <in1.wav> <out1.wav> [<in2> <out2> …]
# Measures four bands on speech frames only — low 80–250 Hz (body/"thickness"), 250 Hz–1 kHz, presence 1–4 kHz,
# air 4–10 kHz — each relative to the total, on the reference and on every input, and applies a smooth linear-phase EQ
# (zero delay) that moves each input to the reference's balance, each band capped at ±max dB. Because every block is
# pulled to the SAME target, the block-to-block swing ("sometimes thick, sometimes thin") goes away. Loudness is not
# touched here (the joiner normalises). Why: on 2026-11-01 he heard clone ক as too thick / rough at times and খ as
# natural but thin; measured, the clones' low band swung ±1.4–2.4 dB across blocks and ক had +2 dB more air than him.
import sys
import numpy as np
import soundfile as sf
from scipy.signal import firwin2, fftconvolve, stft

BANDS = [(80, 250, 150), (250, 1000, 500), (1000, 4000, 2000), (4000, 10000, 6300)]

def balance(y, sr):
    f, _, Z = stft(y, fs=sr, nperseg=2048, noverlap=1536)
    P = np.abs(Z) ** 2
    rms = np.sqrt(P.mean(axis=0))
    P = P[:, rms > 0.15 * rms.max()].mean(axis=1)        # speech frames only
    tot = P[(f >= 80) & (f <= 10000)].sum()
    return np.array([10 * np.log10(P[(f >= lo) & (f < hi)].sum() / tot) for lo, hi, _ in BANDS])

def load(path):
    y, sr = sf.read(path, dtype="float64", always_2d=True)
    return y.mean(axis=1), sr

args = sys.argv[1:]
cap = 3.0
for a in list(args):
    if a.startswith("--max="):
        cap = float(a.split("=", 1)[1]); args.remove(a)
ref_path, pairs = args[0], args[1:]
if not pairs or len(pairs) % 2:
    sys.exit("usage: tone-match.py <ref.wav> [--max=3] <in.wav> <out.wav> [...]")
ry, rsr = load(ref_path)
target = balance(ry, rsr)
print("target  " + "  ".join(f"{v:6.1f}" for v in target) + "   (low, body, presence, air dB)")
for inp, out in zip(pairs[0::2], pairs[1::2]):
    y, sr = load(inp)
    have = balance(y, sr)
    gain = np.clip(target - have, -cap, cap)
    nyq = sr / 2
    freqs = [0, 60] + [c for *_, c in BANDS] + [11000, nyq]
    gains_db = [gain[0], gain[0], *gain, gain[3], gain[3]]
    freqs, gains_db = zip(*[(fr, g) for fr, g in zip(freqs, gains_db) if fr <= nyq])
    taps = firwin2(2047, np.array(freqs) / nyq, 10 ** (np.array(gains_db) / 20))
    z = fftconvolve(y, taps, mode="same")                 # linear phase, centred = no delay
    peak = np.abs(z).max()
    if peak > 0.99:
        z *= 0.99 / peak
    sf.write(out, z.astype(np.float32), sr, subtype="PCM_16")
    after = balance(z, sr)
    print(f"{inp.replace(chr(92), '/').split('/')[-1]:10} gain " + " ".join(f"{g:+5.1f}" for g in gain)
          + "   before " + " ".join(f"{v:6.1f}" for v in have) + "   after " + " ".join(f"{v:6.1f}" for v in after))
