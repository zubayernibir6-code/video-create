#!/usr/bin/env node
// refs.mjs — cut reference clips of the user's own voice for voice cloning (IndicF5 needs a 5–11 s clip + its text).
//
//   node tools/clone/refs.mjs <voice.wav> <words.json> <out dir> [--min=6] [--max=11] [--noise=-38] [--top=12]
//
// Finds stretches of continuous speech between real pauses (FFmpeg silencedetect, pause ≥ 0.3 s), keeps the ones
// between --min and --max seconds, takes the words that fall inside from <words.json> ([{text,start,end}], the
// transcriber's output), and writes <out dir>/<NN>.wav (24 kHz mono) + <out dir>/refs.json ([{name, wav, text,
// start, end, dur}]). Ranked longest-first, non-overlapping. The text is a draft: run tools/transcribe.mjs on
// each clip and paste the transcript into refs.json before cloning (an ep01 words.json held the EDITED caption
// script, several phrases off the audio; see docs/voice-clone-research.md).
// Verified 2026-10-30 on the claude-video-tutorial phone recording (Voice.m4a, 494 s): 12 clips.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const FF = process.env.HYPERFRAMES_FFMPEG_PATH || "ffmpeg";
const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const [wav, wordsFile, outDir] = args.filter((a) => !a.startsWith("--"));
if (!wav || !wordsFile || !outDir) {
  console.error("usage: refs.mjs <voice.wav> <words.json> <out dir> [--min=6] [--max=11] [--noise=-38] [--top=12]");
  process.exit(1);
}
const MIN = +(opt.min ?? 6), MAX = +(opt.max ?? 11), NOISE = +(opt.noise ?? -38), TOP = +(opt.top ?? 12);

const raw = JSON.parse(fs.readFileSync(wordsFile, "utf8"));
const words = Array.isArray(raw) ? raw : raw.words;

const det = spawnSync(FF, ["-hide_banner", "-i", wav, "-af", `silencedetect=noise=${NOISE}dB:d=0.3`, "-f", "null", "-"], { encoding: "utf8" });
const log = det.stderr || "";
const total = +(log.match(/Duration: (\d+):(\d+):([\d.]+)/) || []).slice(1, 4).reduce((s, v, i) => s + v * [3600, 60, 1][i], 0);
const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
// speech stretches = between a silence end and the next silence start
const bounds = [0, ...ends];
const stops = [...starts, total];
const cands = [];
for (let i = 0; i < bounds.length; i++) {
  for (let j = i; j < stops.length; j++) {
    if (stops[j] <= bounds[i]) continue;
    const s = bounds[i], e = stops[j], d = e - s;
    if (d > MAX) break;
    if (d < MIN) continue;
    const ws = words.filter((w) => w.start >= s - 0.15 && w.start < e - 0.1);
    if (ws.length < 4) continue;
    cands.push({ start: +(s - 0.1).toFixed(2), end: +(e + 0.15).toFixed(2), dur: +d.toFixed(2), text: ws.map((w) => w.text).join(" ") });
  }
}
cands.sort((a, b) => b.dur - a.dur);
const picked = [];
for (const c of cands) {
  if (picked.some((p) => c.start < p.end && c.end > p.start)) continue;
  picked.push(c);
  if (picked.length >= TOP) break;
}
picked.sort((a, b) => a.start - b.start);
fs.mkdirSync(outDir, { recursive: true });
// Guard (2026-10-31): a reference with too much pause inside it (clip 06 of the tutorial: 43 % voiced) made the
// model stutter, repeat and clip (peak +0.3 dBFS). Measured at −30 dB / 0.15 s on the 7 clips used that night: good
// references 12–40 % pause, the bad one 52 % → a clip may have at most 45 % pause inside (--max-pause=0.45).
const MAX_PAUSE = +(opt["max-pause"] ?? 0.45);
const refs = [];
let rejected = 0;
for (const c of picked) {
  const name = String(refs.length + 1).padStart(2, "0");
  const out = path.join(outDir, `${name}.wav`);
  spawnSync(FF, ["-hide_banner", "-loglevel", "error", "-y", "-ss", String(Math.max(0, c.start)), "-to", String(c.end), "-i", wav, "-ac", "1", "-ar", "24000", "-c:a", "pcm_s16le", out]);
  const sd = spawnSync(FF, ["-hide_banner", "-i", out, "-af", "silencedetect=noise=-30dB:d=0.15", "-f", "null", "-"], { encoding: "utf8" }).stderr;
  const pause = [...sd.matchAll(/silence_duration: ([\d.]+)/g)].reduce((s, m) => s + +m[1], 0) / (c.end - c.start);
  if (pause > MAX_PAUSE) { fs.rmSync(out); rejected++; console.log(`   skipped ${c.start}–${c.end}: ${(pause * 100).toFixed(0)} % pause inside (max ${MAX_PAUSE * 100} %)`); continue; }
  refs.push({ name, wav: out.replaceAll("\\", "/"), text: c.text, start: c.start, end: c.end, dur: c.dur, pause: +pause.toFixed(2) });
}
if (rejected) console.log(`${rejected} clip(s) skipped for pauses`);
fs.writeFileSync(path.join(outDir, "refs.json"), JSON.stringify(refs, null, 1));
console.log(`${refs.length} clips from ${cands.length} candidates (speech between pauses, ${MIN}–${MAX} s) → ${outDir}/refs.json`);
for (const r of refs) console.log(`${r.name}  ${r.start}–${r.end}  ${r.dur}s  ${r.text}`);
