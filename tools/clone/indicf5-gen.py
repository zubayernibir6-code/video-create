# indicf5-gen.py — speak Bengali lines in the user's own cloned voice with IndicF5 (CPU), one WAV per line.
# usage: <voice-clone venv>/Scripts/python.exe -I tools/clone/indicf5-gen.py <lines.json> <out dir>
# lines.json: [{"id": "01", "text": "<Bengali>", "ref_wav": "<clip of his voice>", "ref_text": "<its exact words>"}, ...]
# HF_TOKEN comes from D:/Video Create/.env.local (gated repo). Model load ~4 min; speech ~40–70× real time on the
# i5-8265U (verified 2026-10-30: 11 s of speech in 777 s). Never printed: the token.
import json, os, sys, time
import numpy as np
import soundfile as sf

env = "D:/Video Create/.env.local"
if os.path.exists(env):
    for line in open(env, encoding="utf-8"):
        if line.startswith("HF_TOKEN=") and line.strip() != "HF_TOKEN=":
            os.environ["HF_TOKEN"] = line.split("=", 1)[1].strip()
os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")

from transformers import AutoModel

lines = json.load(open(sys.argv[1], encoding="utf-8"))
out_dir = sys.argv[2]
os.makedirs(out_dir, exist_ok=True)

t0 = time.time()
model = AutoModel.from_pretrained("ai4bharat/IndicF5", trust_remote_code=True)
model.config.remove_sil = False   # keep his pauses: the wrapper would cut every silence ≥ 1 s out of the line
print(f"model loaded in {time.time() - t0:.1f} s", flush=True)

import torch

for ln in lines:
    path = os.path.join(out_dir, ln["id"] + ".wav")
    if os.path.exists(path) and not ln.get("redo"):
        print(f"{ln['id']}: kept", flush=True)
        continue
    t0 = time.time()
    # speed < 1 = slower, longer: F5 sizes the output from the reference's pace, and a fast reference made the
    # wrapper drop the last sentence of a 3-sentence line (first test, 2026-10-30). Seed makes a redo different.
    model.config.speed = float(ln.get("speed", 0.92))
    torch.manual_seed(int(ln.get("seed", 0)))
    audio = model(ln["text"], ref_audio_path=ln["ref_wav"], ref_text=ln["ref_text"])
    if audio.dtype == np.int16:
        audio = audio.astype(np.float32) / 32768.0
    sf.write(path, np.asarray(audio, dtype=np.float32), samplerate=24000)
    dur = len(audio) / 24000
    took = time.time() - t0
    print(f"{ln['id']}: {dur:.1f} s in {took:.0f} s (x{took / max(dur, 0.1):.0f}) -> {path}", flush=True)
