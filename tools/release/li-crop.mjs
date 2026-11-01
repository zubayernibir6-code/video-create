#!/usr/bin/env node
// li-crop.mjs — the LinkedIn 4:5 cut of a finished universal Reel by CROPPING its text-safe box, no new render.
//
//   node tools/release/li-crop.mjs <universal-reel.mp4> <out.mp4>
//
// A page built for the universal-reel profile keeps every text inside x 65–886, y 288–1248 of 1080×1920
// (tools/release/spec-check.mjs --limits=universal-reel). This takes a 920×1150 window around that box (x 15–935,
// y 210–1360; 4:5), scales it ×1.174 to 1080×1350 and encodes it like finish.mjs --release does (x264, 2 s keyframes,
// no MP4 edit list, BT.709 tags, AAC copied). The box then lands at x 59–1022, y 92–1200: inside the linkedin-clip
// house safe zone (6 % sides, 5 % top, 10 % bottom). Takes ~30 s for a 50 s Reel. Check the result with
// `node tools/release/spec-check.mjs <out.mp4> --for=linkedin-clip`.
// It is a crop, not the LI1 cut-down style (skill linkedin-kit: own opening, name plate, two-line captions): use it
// when the Reel itself is the main video (the GitHub series, 2026-11-01).
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const FF = process.env.HYPERFRAMES_FFMPEG_PATH || "ffmpeg";
const [inp, out] = process.argv.slice(2);
if (!inp || !out) { console.error("usage: li-crop.mjs <universal-reel.mp4> <out.mp4>"); process.exit(1); }
if (!existsSync(inp)) { console.error(`✗ ${inp} not found`); process.exit(1); }
const r = spawnSync(FF, ["-hide_banner", "-loglevel", "error", "-y", "-i", inp,
  "-vf", "crop=920:1150:15:210,scale=1080:1350:flags=lanczos,format=yuv420p",
  "-c:v", "libx264", "-preset", "slow", "-b:v", "10M", "-maxrate", "14M", "-bufsize", "20M", "-g", "60", "-keyint_min", "60", "-sc_threshold", "0",
  "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
  "-c:a", "copy", "-movflags", "+faststart", "-use_editlist", "0", out], { stdio: "inherit" });
if (r.status !== 0) { console.error("✗ ffmpeg failed"); process.exit(1); }
console.log(`✓ ${out}  1080×1350 (4:5) from ${inp}`);
