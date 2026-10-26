# Finds the mouse cursor (the Windows arrow) in every frame of a stretch of a screen recording, so a glow,
# spotlight or zoom can follow it. Template matching (normalised cross-correlation, numpy FFT); no installs.
#   tools/pyenv/Scripts/python.exe -I tools/screen/track-cursor.py <video> <from_s> <to_s> <out.json>
#       [--template=tools/screen/cursor-arrow.pgm] [--tip=3,2] [--min=0.85]
# Writes [{t, x, y, s}] for every frame: (x, y) = the arrow's tip in video pixels, s = match score 0–1.
# s >= 0.85 is a real find; below it the cursor is an I-beam (over text), over the bright taskbar, or hidden.
# The default template is this laptop's arrow at 100 % scale (cut from a 2026-10-25 recording, tip at 3,2).
# Another cursor size: cut a new one with
#   ffmpeg -ss <t> -i <video> -frames:v 1 -vf "crop=24:30:<x>:<y>,format=gray" my-cursor.pgm
# Speed: ~0.16 s per 1080p frame (14.5 s at 30 fps = 69 s). Verified 2026-10-25: 77 % of frames found; the
# misses were I-beam / taskbar stretches, bridged or faded in the page builder (tools/screen/promo-core.mjs).
import json, os, subprocess, sys
import numpy as np

args = [a for a in sys.argv[1:] if not a.startswith("--")]
opts = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--") and "=" in a)
if len(args) < 4:
    sys.exit("Usage: track-cursor.py <video> <from_s> <to_s> <out.json> [--template=x.pgm] [--tip=3,2] [--min=0.85]")
video, t0, t1, out = args[0], float(args[1]), float(args[2]), args[3]
here = os.path.dirname(os.path.abspath(__file__))
tpl_path = opts.get("template", os.path.join(here, "cursor-arrow.pgm"))
tip = tuple(int(v) for v in opts.get("tip", "3,2").split(","))
good = float(opts.get("min", "0.85"))

def probe(v):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate",
                        "-of", "csv=p=0", v], capture_output=True, text=True).stdout.strip().split(",")
    n, d = r[2].split("/")
    return int(r[0]), int(r[1]), float(n) / float(d or 1)

def read_pgm(p):
    data = open(p, "rb").read()
    parts = data.split(maxsplit=4)
    w, h = int(parts[1]), int(parts[2])
    return np.frombuffer(parts[4][: w * h], np.uint8).reshape(h, w).astype(np.float32)

W, H, FPS = probe(video)
tpl = read_pgm(tpl_path)
tpl = tpl - tpl.mean(); tn2 = float((tpl ** 2).sum()); th, tw = tpl.shape

def frames():
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", f"{t0:.3f}", "-t", f"{t1 - t0:.3f}", "-i", video,
                          "-vf", "format=gray", "-f", "rawvideo", "-"], stdout=subprocess.PIPE)
    while True:
        b = p.stdout.read(W * H)
        if len(b) < W * H: break
        yield np.frombuffer(b, np.uint8).reshape(H, W).astype(np.float32)

def ncc(img):
    shape = img.shape
    F = np.fft.rfft2(img); ones = np.fft.rfft2(np.ones_like(tpl), s=shape)
    corr = np.fft.irfft2(F * np.fft.rfft2(tpl[::-1, ::-1], s=shape), s=shape)[th-1:, tw-1:]
    s1 = np.fft.irfft2(F * ones, s=shape)[th-1:, tw-1:]
    s2 = np.fft.irfft2(np.fft.rfft2(img * img) * ones, s=shape)[th-1:, tw-1:]
    var = np.maximum(s2 - s1 * s1 / (th * tw), 0.2 * tn2)  # flat patches cannot score high
    return corr / np.sqrt(var * tn2)

def find(img, near):
    if near:  # look around the last position first (fast), the whole frame if it is not there
        x0, y0 = max(0, near[0] - 160), max(0, near[1] - 160)
        sub = img[y0:min(H, near[1] + 160), x0:min(W, near[0] + 160)]
        r = ncc(sub); y, x = np.unravel_index(np.argmax(r), r.shape)
        if r[y, x] >= good: return x0 + x + tip[0], y0 + y + tip[1], float(r[y, x])
    r = ncc(img); y, x = np.unravel_index(np.argmax(r), r.shape)
    return x + tip[0], y + tip[1], float(r[y, x])

res, near = [], None
for i, img in enumerate(frames()):
    x, y, s = find(img, near)
    near = (int(x), int(y)) if s >= good else None
    res.append({"t": round(t0 + i / FPS, 3), "x": int(x), "y": int(y), "s": round(s, 3)})
json.dump(res, open(out, "w"))
ok = sum(1 for r in res if r["s"] >= good)
print(f"{len(res)} frames, cursor found in {ok} ({100 * ok / max(1, len(res)):.0f} %) -> {out}")
