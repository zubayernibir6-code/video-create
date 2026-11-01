#!/usr/bin/env node
// music-extend.mjs — make a background track longer than the video without buying a new one: the song plays to its
// end minus --xfade, then a second copy picks up from --from seconds into the song with an equal-power crossfade
// (repeated until it reaches --min). Under a ducked voice-over the seam is not heard. The song's own fade-out is
// handled by the mix (series.mjs / promo-mix fades the bed out at the end).
//
//   node tools/music-extend.mjs <in.mp3|wav> <out.wav> --min=85 [--from=<s>] [--xfade=4]
//
// --from defaults to a third of the song (past the intro, before the outro). Writes 48 kHz stereo WAV.
// Verified 2026-11-01: the GitHub series BGMs (65–73 s Lyria songs) extended to 90 s for the 80 s re-voiced episodes.
import { spawnSync } from "node:child_process";

const FF = process.env.HYPERFRAMES_FFMPEG_PATH || "ffmpeg";
const FP = process.env.HYPERFRAMES_FFPROBE_PATH || "ffprobe";
const pos = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const [inp, out] = pos;
if (!inp || !out || !opt.min) { console.error("usage: music-extend.mjs <in> <out.wav> --min=85 [--from=<s>] [--xfade=4]"); process.exit(1); }
const L = +spawnSync(FP, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", inp], { encoding: "utf8" }).stdout.trim();
const min = +opt.min, xf = +(opt.xfade ?? 4), from = +(opt.from ?? (L / 3).toFixed(2));
// the song ends with its own outro: cut the first copies 2 s before their end so the crossfade sits in the body
const body = L - 2;
let len = L, copies = 1;
while (len < min) { len = len - 2 - xf + (L - from); copies++; }
const inputs = [], f = [];
for (let i = 0; i < copies; i++) inputs.push("-i", inp);
for (let i = 0; i < copies; i++) {
  const start = i === 0 ? 0 : from, end = i === copies - 1 ? L : body;
  f.push(`[${i}:a]atrim=${start}:${end},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo[c${i}]`);
}
let last = "c0";
for (let i = 1; i < copies; i++) { f.push(`[${last}][c${i}]acrossfade=d=${xf}:c1=qsin:c2=qsin[x${i}]`); last = `x${i}`; }
const r = spawnSync(FF, ["-hide_banner", "-loglevel", "error", "-y", ...inputs, "-filter_complex", f.join(";"), "-map", `[${last}]`, "-c:a", "pcm_s16le", out], { stdio: "inherit" });
if (r.status !== 0) { console.error("✗ ffmpeg failed"); process.exit(1); }
const d = +spawnSync(FP, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], { encoding: "utf8" }).stdout.trim();
console.log(`✓ ${out}: ${L.toFixed(1)} s → ${d.toFixed(1)} s (${copies} copies, second from ${from} s, ${xf} s crossfade)`);
