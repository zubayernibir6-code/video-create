#!/usr/bin/env node
// rvc.mjs — put the user's own timbre on any spoken take (AI Studio TTS, Piper, IndicF5) with his RVC model (Applio).
//
//   node tools/clone/rvc.mjs <in.wav|mp3> <out.wav> [--pitch=0] [--index-rate=0.6] [--protect=0.4] [--model=talha]
//
// Runs Applio's `core.py infer` (CPU, venv C:/…/voice-clone/venv-rvc, repo C:/…/voice-clone/applio) with the model
// C:/…/voice-clone/rvc/<model>.pth (+ .index) trained by tools/clone/rvc-train-colab.ipynb, then −16 LUFS 48 kHz mono.
// --pitch in semitones: 0 when the source voice is already male (AI Studio "Sadaltager"), +12 for a female source.
// Status: written 2026-10-31, UNTESTED until talha.pth is trained (needs his Colab click). Flag names from
// `core.py infer --help` (saved in voice-clone/rvc/infer-help.txt).

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const VC = "C:/Users/Zubayer Nibir/VideoWork/voice-clone";
const PY = `${VC}/venv-rvc/Scripts/python.exe`;
const FF = process.env.HYPERFRAMES_FFMPEG_PATH || "ffmpeg";
const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const [input, output] = args.filter((a) => !a.startsWith("--"));
if (!input || !output) { console.error("usage: rvc.mjs <in.wav> <out.wav> [--pitch=0] [--index-rate=0.6] [--protect=0.4] [--model=talha]"); process.exit(1); }
const model = opt.model || "talha";
const pth = `${VC}/rvc/${model}.pth`, index = `${VC}/rvc/${model}.index`;
if (!fs.existsSync(pth)) { console.error(`✗ model not found: ${pth} — train it with tools/clone/rvc-train-colab.ipynb (Colab, free GPU) and unzip talha.zip into ${VC}/rvc/`); process.exit(1); }

const raw = path.resolve(output).replace(/\.wav$/i, "") + ".rvc-raw.wav";
const flags = ["core.py", "infer", "--input-path", path.resolve(input), "--output-path", raw, "--pth-path", pth,
  "--pitch", String(opt.pitch ?? 0), "--f0-method", "rmvpe", "--index-rate", String(opt["index-rate"] ?? 0.6),
  "--protect", String(opt.protect ?? 0.4), "--volume-envelope", "1", "--export-format", "WAV"];
if (fs.existsSync(index)) flags.push("--index-path", index);
const t0 = Date.now();
const r = spawnSync(PY, flags, { cwd: `${VC}/applio`, stdio: "inherit", env: { ...process.env, PYTHONIOENCODING: "utf-8" } });
if (r.status !== 0 || !fs.existsSync(raw)) { console.error("✗ Applio infer failed"); process.exit(r.status || 1); }
const dur = +spawnSync(FF.replace(/ffmpeg(\.exe)?$/i, "ffprobe$1"), ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", raw], { encoding: "utf8" }).stdout;
const f = spawnSync(FF, ["-hide_banner", "-loglevel", "error", "-y", "-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", output], { stdio: "inherit" });
if (f.status !== 0) process.exit(f.status ?? 1);
console.log(`✓ ${output}  (${dur.toFixed(1)} s in ${((Date.now() - t0) / 1000).toFixed(0)} s = ×${(((Date.now() - t0) / 1000) / dur).toFixed(1)} real time)`);
