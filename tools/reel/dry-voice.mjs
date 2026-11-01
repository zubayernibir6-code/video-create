#!/usr/bin/env node
// dry-voice.mjs — a silent stand-in voice for a series episode, so a NEW look can be built, checked
// (hyperframes check, design-lint, snapshots) before the real voice exists (a TTS quota, a voice still being made).
// Writes <project>/assets/voice/dry/voice.wav (silence) and voice.words.json (every script word, in series order,
// timed at --wps words a second with a short gap between lines), and points nothing at it: build with
//   node tools/reel/series.mjs <project> --no-mix --voice=assets/voice/dry/voice.wav
// Never render or deliver a dry build; series.mjs refuses --plan with a dry voice.
//
//   node tools/reel/dry-voice.mjs projects/<name> [--wps=2.5]
// Verified 2026-11-01 on the GitHub series episodes 6–10 (looks REEL7–REEL10, REEL1) while the Gemini TTS quota was
// spent.
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { seriesLines } from "./series-lines.mjs";

const FF = process.env.HYPERFRAMES_FFMPEG_PATH || "ffmpeg";
const dir = path.resolve(process.argv.slice(2).find((a) => !a.startsWith("--")) ?? ".");
const wps = +(process.argv.find((a) => a.startsWith("--wps="))?.split("=")[1] ?? 2.5);
const R = JSON.parse(readFileSync(path.join(dir, "reel.json"), "utf8").replace(/^﻿/, ""));
const { lines } = seriesLines(R);
const all = lines.flatMap((l) => l.split(/\s+/).filter(Boolean)), avg = all.reduce((a, w) => a + [...w].length, 0) / all.length;
const words = [];
let t = 0.3;
for (const l of lines) {
  for (const w of l.split(/\s+/).filter(Boolean)) { const d = Math.max(0.15, [...w].length / avg / wps); words.push({ text: w, start: +t.toFixed(3), end: +(t + d * 0.9).toFixed(3) }); t += d; }
  t += 0.3;
}
const out = path.join(dir, "assets", "voice", "dry");
mkdirSync(out, { recursive: true });
writeFileSync(path.join(out, "voice.words.json"), JSON.stringify(words, null, 1));
spawnSync(FF, ["-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", String(t + 0.5), "-c:a", "pcm_s16le", path.join(out, "voice.wav")], { stdio: "inherit" });
console.log(`✓ dry voice: ${words.length} words over ${t.toFixed(1)} s → ${path.relative(process.cwd(), out)}`);
