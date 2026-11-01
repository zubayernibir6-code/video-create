#!/usr/bin/env node
// voice-fit.mjs — fit a TTS voice-over into a Reel's length without changing its pitch: every pause longer than --gap
// is cut to --gap (keeping the pause, removing dead air), then, only if it is still longer than --max seconds, the
// tempo goes up (atempo, pitch kept) by at most --cap (default 1.10; CLAUDE.md allows up to 1.12), then −16 LUFS.
//
//   node tools/reel/voice-fit.mjs <in.wav> <out.wav> [--max=80] [--gap=0.3] [--cap=1.10]
//
// Use it on the joined stem from tools/clone/gemini.mjs say before series.mjs transcribes it. Prints the length before
// and after and the tempo used; writes <out>.fit.json. Verified 2026-11-01 on the GitHub series voices (his cloned
// voice talha-a reads ~2.3 words/s, so a 200-word episode came out at 89 s).
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const FF = process.env.HYPERFRAMES_FFMPEG_PATH || "ffmpeg";
const FP = process.env.HYPERFRAMES_FFPROBE_PATH || "ffprobe";
const pos = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const [inp, out] = pos;
if (!inp || !out) { console.error("usage: voice-fit.mjs <in.wav> <out.wav> [--max=80] [--gap=0.3] [--cap=1.10]"); process.exit(1); }
const max = +(opt.max ?? 80), gap = +(opt.gap ?? 0.3), cap = +(opt.cap ?? 1.1);
const dur = (f) => +spawnSync(FP, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" }).stdout.trim();
const run = (args) => { const r = spawnSync(FF, ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" }); if (r.status !== 0) { console.error("✗ ffmpeg failed"); process.exit(1); } };
const d0 = dur(inp);
const squeeze = `silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05:stop_periods=-1:stop_duration=${gap}:stop_threshold=-45dB:stop_silence=${gap}`;
const tmp = out.replace(/\.wav$/i, "") + ".squeeze.wav";
run(["-i", inp, "-af", squeeze, "-c:a", "pcm_s16le", tmp]);
const d1 = dur(tmp);
const tempo = d1 > max ? Math.min(cap, d1 / max) : 1;
run(["-i", tmp, "-af", `${tempo > 1 ? `atempo=${tempo.toFixed(4)},` : ""}loudnorm=I=-16:TP=-1.5:LRA=11`, "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", out]);
const d2 = dur(out);
writeFileSync(out.replace(/\.wav$/i, "") + ".fit.json", JSON.stringify({ in: inp, before_s: +d0.toFixed(2), after_pauses_s: +d1.toFixed(2), tempo: +tempo.toFixed(4), after_s: +d2.toFixed(2), gap, max }, null, 1));
console.log(`✓ ${out}: ${d0.toFixed(1)} s → pauses ≤ ${gap} s: ${d1.toFixed(1)} s → tempo ×${tempo.toFixed(3)}: ${d2.toFixed(1)} s${d2 > max + 0.5 ? `  (still over ${max} s: shorten the script)` : ""}`);
