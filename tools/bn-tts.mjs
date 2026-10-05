#!/usr/bin/env node
// bn-tts.mjs — Bengali voice-over from text, fully offline (Piper, bn_BD-google-medium voice).
//
//   node "E:/Video Create/tools/bn-tts.mjs" "<Bengali text>" | <script.txt>  [-o out.wav]
//        [--voice=male|female|<speaker 0-15>] [--speed=1.0] [--list]
//
// Output: 48 kHz mono WAV at -16 LUFS (the same voice-stem level as tools/voice.mjs), with 0.25 s of
// silence before and 0.4 s after. Default output: bn-voice.wav in the current folder.
//
// The voice was trained on OpenSLR-37 (CC BY-SA 4.0) + CMU Indic data: put the credit line from
// assets/voices/piper/CREDITS.md in the description of any video that uses it.
// Speaker choice was measured on 2026-10-06 (CLAUDE.md §0b): every one of the 16 speakers was read back by
// the Bengali speech recogniser. "male" = speaker 5 and "female" = speaker 3 are the clearest of each
// (pitch 158 / 174 Hz); speaker 15 is a slower, higher female voice (250 Hz).

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const WORKSPACE = path.resolve(import.meta.dirname, "..");
const PYTHON = path.join(import.meta.dirname, "pyenv", "Scripts", "python.exe");
const MODEL = path.join(WORKSPACE, "assets", "voices", "piper", "bn_BD-google-medium.onnx");
const PRESETS = { male: 5, female: 3 };
const SPEAKERS = path.join(WORKSPACE, "assets", "voices", "piper", "speakers.json");

function fail(msg) {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const flags = {};
const rest = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "-o") flags.out = args[++i];
  else if (a.startsWith("--")) { const [k, ...v] = a.slice(2).split("="); flags[k] = v.join("=") || true; }
  else rest.push(a);
}
if (flags.list) {
  if (existsSync(SPEAKERS)) {
    for (const s of JSON.parse(readFileSync(SPEAKERS, "utf8"))) console.log(`  ${String(s.speaker).padStart(2)}  ${s.voice.padEnd(6)} ${s.f0} Hz   read back with ${s.ger_pct}% letter errors`);
  }
  process.exit(0);
}
if (!rest[0]) {
  console.log(`Usage: node bn-tts.mjs "<Bengali text>" | <script.txt> [-o out.wav] [--voice=male|female|0-15] [--speed=1.0] [--list]`);
  process.exit(2);
}
for (const f of [PYTHON, MODEL]) if (!existsSync(f)) fail(`Missing: ${f}`);

const text = (existsSync(rest[0]) && /\.txt$/i.test(rest[0]) ? readFileSync(rest[0], "utf8") : rest.join(" ")).replace(/^\uFEFF/, "").normalize("NFC").trim();
if (!text) fail("No text given.");
const voice = flags.voice ?? "male";
const speaker = PRESETS[voice] ?? Number(voice);
if (!Number.isInteger(speaker) || speaker < 0 || speaker > 15) fail(`Unknown voice "${voice}". Use male, female or a number 0-15 (see --list).`);
const speed = Number(flags.speed ?? 1);
if (!(speed > 0.5 && speed < 2)) fail("--speed must be between 0.5 and 2.");
const out = path.resolve(flags.out ?? "bn-voice.wav");

const work = mkdtempSync(path.join(os.tmpdir(), "bn-tts-"));
try {
  const txt = path.join(work, "in.txt");
  const raw = path.join(work, "raw.wav");
  writeFileSync(txt, text, "utf8");
  const t0 = Date.now();
  const p = spawnSync(PYTHON, ["-m", "piper", "-m", MODEL, "-s", String(speaker), "--length-scale", String(1 / speed),
    "--sentence-silence", "0.35", "-i", txt, "-f", raw], { encoding: "utf8", env: { ...process.env, PYTHONIOENCODING: "utf-8" } });
  if (p.status !== 0 || !existsSync(raw)) fail(`Piper failed:\n${(p.stderr || "").split("\n").slice(-6).join("\n")}`);

  // Pad, then two-pass loudness to -16 LUFS / -1.5 dBTP at 48 kHz.
  const pad = "adelay=250:all=1,apad=pad_dur=0.4";
  const m = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", raw, "-af", `${pad},loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json`, "-f", "null", "-"], { encoding: "utf8" });
  const j = JSON.parse(m.stderr.slice(m.stderr.lastIndexOf("{"), m.stderr.lastIndexOf("}") + 1));
  const lra = Math.max(11, Math.ceil(Number(j.input_lra)) + 1);
  const norm = `loudnorm=I=-16:TP=-1.5:LRA=${lra}:linear=true:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}`;
  const e = spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", "-i", raw, "-af", `${pad},${norm},aresample=48000`, "-ac", "1", "-c:a", "pcm_s16le", out], { encoding: "utf8" });
  if (e.status !== 0) fail(`FFmpeg failed: ${e.stderr}`);
  const dur = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], { encoding: "utf8" }).stdout.trim();
  console.log(`✓ ${out}`);
  console.log(`  voice ${voice} (speaker ${speaker}), ${Number(dur).toFixed(1)} s of speech, made in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
