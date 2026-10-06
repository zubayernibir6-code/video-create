#!/usr/bin/env node
// finish.mjs — one command from a HyperFrames project (or any video file) to delivery-ready files.
//
//   node "E:/Video Create/tools/finish.mjs" <project-folder | video-file>
//        [--quality=high|standard|draft] [--formats=16x9,9x16,1x1,4x5] [--reframe=fit|crop]
//        [--lufs=-14] [--out=<folder>] [--keep] [--skip-design]
//
// Project folder: hyperframes check + tools/design-lint.mjs (both stop the run on errors; --skip-design
//                 skips the second) → hyperframes render (1 worker, long-render safe) → master.
// Video file:     skips check/render; re-encodes to h264/yuv420p only when it isn't already.
// Then for both:  two-pass loudness to -14 LUFS / -1.5 dBTP → QC gate (tools/qc.mjs) →
//                 other aspect ratios → thumbnail + 8 s preview GIF → qc.json.
// Output: E:/Video Create/renders/<name>/<YYYY-MM-DD_HHMM>/ — a new folder every run, so an
// earlier delivery is never overwritten. Exit code 1 if the QC gate fails (files are kept).
//
// Why each choice (all measured on this laptop, CLAUDE.md §0b):
// - PRODUCER_STREAMING_ENCODE_MAX_DURATION_SECONDS=3600: 0.8.33 refuses renders over 240 s
//   because C: is nearly full; streaming encode avoids the disk-hungry capture path.
// - --workers 1: more workers are refused for the same disk reason, and RAM is ~4 GB.
// - --frames-cache-dir on E:: footage frame extraction would otherwise fill C:.
// - loudnorm LRA raised to the measured LRA: otherwise it falls back to dynamic mode and misses
//   the target (audio-test: LRA 11 → -12.0 LUFS; LRA 21 → -14.9 LUFS).
// - Reframe defaults to "fit" (whole frame over a blurred copy): a plain centre crop cuts the
//   text off a designed 16:9 layout. Use --reframe=crop for footage with a centred subject.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { printQc, probe, qc } from "./qc.mjs";

const WORKSPACE = path.resolve(import.meta.dirname, "..");
const TP_TARGET = -1.5;
const FORMATS = { "16x9": [1920, 1080], "9x16": [1080, 1920], "1x1": [1080, 1080], "4x5": [1080, 1350] };
// The container flags alone leave transfer/primaries "unknown" with this FFmpeg build; x264's own VUI flags fix it.
const COLOUR = [
  "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
  "-x264-params", "colorprim=bt709:transfer=bt709:colormatrix=bt709",
];

const T0 = Date.now();
const step = (msg) => console.log(`\n[${((Date.now() - T0) / 1000).toFixed(0).padStart(4)} s] ${msg}`);
let outDir = null;
let autoOutDir = false;
function fail(msg) {
  console.error(`\n✗ ${msg}`);
  // Nothing deliverable was made yet: leave no half-empty output folder behind.
  if (outDir && existsSync(outDir) && !readdirSync(outDir).some((f) => f !== ".work")) {
    rmSync(outDir, { recursive: true, force: true });
    const parent = path.dirname(outDir);
    if (autoOutDir && readdirSync(parent).length === 0) rmSync(parent, { recursive: true });
  }
  process.exit(1);
}
function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024, ...opts });
  if (r.status !== 0) fail(`${path.basename(cmd)} failed (exit ${r.status}).\n${(r.stderr || "").split("\n").slice(-8).join("\n")}`);
  return r;
}
const ffmpeg = (args, opts) => run("ffmpeg", ["-hide_banner", "-nostats", "-y", ...args], opts);

function hyperframesBin() {
  const root = spawnSync("npm", ["root", "-g"], { encoding: "utf8", shell: true }).stdout?.trim();
  const bin = root && path.join(root, "hyperframes", "bin", "hyperframes.mjs");
  if (!bin || !existsSync(bin)) fail("HyperFrames CLI not found (npm root -g).");
  return bin;
}

// Size and duration the composition declares on its root element, for the QC gate.
function compositionSpec(dir) {
  const html = readFileSync(path.join(dir, "index.html"), "utf8");
  const root = html.match(/<[a-z]+\b[^>]*\bdata-composition-id="[^"]*"[^>]*>/is)?.[0] ?? "";
  const attr = (n) => Number(root.match(new RegExp(`\\b${n}="([\\d.]+)"`))?.[1]) || undefined;
  return { w: attr("data-width"), h: attr("data-height"), dur: attr("data-duration") };
}

function loudnormJson(stderr) {
  return JSON.parse(stderr.slice(stderr.lastIndexOf("{"), stderr.lastIndexOf("}") + 1));
}

// Integrated loudness and true peak, measured the same way tools/qc.mjs measures them (ebur128).
// loudnorm's own report can differ from ebur128 by ~1 LU on very peaky mixes (audio-test: -13.99 vs -14.9),
// so every decision here uses ebur128.
function ebur(file) {
  const log = ffmpeg(["-i", file, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr;
  const sum = log.slice(log.lastIndexOf("Summary:"));
  return { I: Number(sum.match(/I:\s+(-?[\d.]+|-inf) LUFS/)?.[1]), TP: Number(sum.match(/Peak:\s+(-?[\d.]+|-inf) dBFS/)?.[1]) };
}

// Two-pass loudness normalisation of the audio; the video stream is copied untouched.
// A final small gain trims the result onto the target as ebur128 measures it.
// The audio is cut to the video's length: loudnorm leaves a ~0.1 s tail (phone test: 6.0 s → 6.1 s, no shift).
function normaliseAudio(input, output, target, videoArgs, videoDur) {
  const cut = videoDur ? `,atrim=end=${videoDur}` : "";
  const m = loudnormJson(ffmpeg(["-i", input, "-vn", "-af", `loudnorm=I=${target}:TP=${TP_TARGET}:LRA=11:print_format=json`, "-f", "null", "-"]).stderr);
  if (!Number.isFinite(Number(m.input_i)) || Number(m.input_i) < -70) return { skipped: "silent audio track" };
  const lra = Math.max(11, Math.ceil(Number(m.input_lra)) + 1);
  const norm =
    `loudnorm=I=${target}:TP=${TP_TARGET}:LRA=${lra}:linear=true:measured_I=${m.input_i}:measured_TP=${m.input_tp}` +
    `:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset},aresample=48000`;
  const encode = (af) =>
    ffmpeg(["-i", input, ...videoArgs, "-af", af + cut, "-c:a", "aac", "-b:a", "256k", "-ac", "2", "-movflags", "+faststart", output]);
  const before = ebur(input);
  encode(norm);
  let after = ebur(output);
  let method = `two-pass loudnorm, LRA ${lra}`;
  const delta = target - after.I;
  if (Math.abs(delta) > 0.3 && after.TP + delta <= TP_TARGET) {
    encode(`${norm},volume=${delta.toFixed(2)}dB`);
    after = ebur(output);
    method += `, trimmed ${delta > 0 ? "+" : ""}${delta.toFixed(1)} dB`;
  }
  // Linear loudnorm cannot raise a peaky mix without breaking the peak limit; fall back to gain + limiter.
  if (Math.abs(after.I - target) > 1 || after.TP > -1) {
    encode(`volume=${(target - before.I).toFixed(2)}dB,alimiter=limit=0.794:level=false,aresample=48000`);
    after = ebur(output);
    method = "gain + limiter";
  }
  return { before: before.I, after: after.I, peak: after.TP, method };
}

function reframeFilter(W, H, mode) {
  if (mode === "crop") return `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H},setsar=1,format=yuv420p[v]`;
  const even = (x) => 2 * Math.round(x / 2);
  const bw = even(W / 4), bh = even(H / 4);
  return (
    `[0:v]split=2[a][b];` +
    `[a]scale=${bw}:${bh}:force_original_aspect_ratio=increase,crop=${bw}:${bh},gblur=sigma=24,scale=${W}:${H},eq=brightness=-0.12:saturation=0.8[bg];` +
    `[b]scale=${W}:${H}:force_original_aspect_ratio=decrease:flags=lanczos[fg];` +
    `[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1,format=yuv420p[v]`
  );
}

// ---------------------------------------------------------------------------------------------

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => { const [k, ...v] = a.slice(2).split("="); return [k, v.join("=") || true]; }));
const target = args.find((a) => !a.startsWith("--"));
if (!target) {
  console.log(`Usage: node finish.mjs <project-folder | video-file> [--quality=high|standard|draft]
       [--formats=16x9,9x16,1x1,4x5] [--reframe=fit|crop] [--lufs=-14] [--out=<folder>] [--keep]`);
  process.exit(2);
}
const input = path.resolve(target);
if (!existsSync(input)) fail(`Not found: ${input}`);
const isProject = statSync(input).isDirectory();
if (isProject && !existsSync(path.join(input, "index.html"))) fail(`${input} has no index.html — is it a HyperFrames project?`);

const name = isProject ? path.basename(input) : path.parse(input).name;
const lufs = Number(flags.lufs ?? -14);
const quality = flags.quality ?? "high";
const reframe = flags.reframe === "crop" ? "crop" : "fit";
const formats = String(flags.formats ?? "16x9,9x16,1x1,4x5").split(",").map((f) => f.trim()).filter(Boolean);
for (const f of formats) if (!FORMATS[f]) fail(`Unknown format "${f}". Use: ${Object.keys(FORMATS).join(", ")}`);
const d = new Date();
const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}_${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`;
autoOutDir = !flags.out;
outDir = path.resolve(flags.out ?? path.join(WORKSPACE, "renders", name, stamp));
const work = path.join(outDir, ".work");
mkdirSync(work, { recursive: true });
console.log(`Finishing "${name}" → ${outDir}`);

let source = input;
let expect = {};
if (isProject) {
  const hf = hyperframesBin();
  const env = { ...process.env, PRODUCER_STREAMING_ENCODE_MAX_DURATION_SECONDS: "3600", HYPERFRAMES_NO_AUTO_INSTALL: "1", HYPERFRAMES_SKIP_SKILLS: "1" };
  expect = compositionSpec(input);

  step("1/6  Quality gate before rendering (hyperframes check + design-lint)");
  const chk = spawnSync(process.execPath, [hf, "check"], { cwd: input, env, stdio: "inherit" });
  if (chk.status !== 0) fail("hyperframes check found errors — fix them before rendering (nothing was rendered).");
  if (!flags["skip-design"]) {
    console.log("");
    const dl = spawnSync(process.execPath, [path.join(import.meta.dirname, "design-lint.mjs"), input], { env, stdio: "inherit" });
    if (dl.status !== 0) fail("design-lint found design errors — fix them before rendering (nothing was rendered). Bengali letter-spacing can be fixed automatically: node tools/design-lint.mjs <project> --fix");
  }

  step(`2/6  Rendering (${quality} quality, 1 worker${expect.dur ? `, ${expect.dur} s of video` : ""})`);
  source = path.join(work, `${name}.render.mp4`);
  const cache = path.join(WORKSPACE, ".cache", "frames");
  mkdirSync(cache, { recursive: true });
  const rnd = spawnSync(
    process.execPath,
    [hf, "render", "--quality", quality, "--workers", "1", "--frames-cache-dir", cache, "--output", source],
    { cwd: input, env, stdio: "inherit" },
  );
  if (rnd.status !== 0 || !existsSync(source)) fail("Rendering failed — see the messages above.");
} else {
  step("1-2/6  Video file given — no check or render needed");
}

step("3/6  Master file: loudness to the web standard");
const src = probe(source);
const master = path.join(outDir, `${name}.mp4`);
const videoOk = src.vcodec === "h264" && src.pix_fmt === "yuv420p";
const videoArgs = videoOk
  ? ["-map", "0:v:0", "-map", "0:a:0?", "-c:v", "copy"]
  : ["-map", "0:v:0", "-map", "0:a:0?", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", ...COLOUR];
if (!videoOk) console.log(`  video is ${src.vcodec}/${src.pix_fmt} — re-encoding to h264/yuv420p`);
let loud = null;
if (src.acodec) {
  loud = normaliseAudio(source, master, lufs, videoArgs, src.vduration);
  if (loud.skipped) {
    console.log(`  audio: ${loud.skipped} — left as it is`);
    ffmpeg(["-i", source, ...videoArgs, "-c:a", "copy", "-movflags", "+faststart", master]);
  } else console.log(`  audio: ${loud.before} → ${loud.after} LUFS, peak ${loud.peak} dBTP (${loud.method})`);
} else {
  console.log("  no audio track — video only");
  ffmpeg(["-i", source, ...videoArgs, "-movflags", "+faststart", master]);
}

step("4/6  Final quality check of the master");
const report = qc(master, { ...expect, fps: isProject ? src.fps : undefined, lufs });
printQc(report);

step("5/6  Other screen shapes");
const mspec = report.spec;
const nativeAspect = mspec.width / mspec.height;
const exports = [];
for (const f of formats) {
  const [W, H] = FORMATS[f];
  if (Math.abs(W / H - nativeAspect) < 0.01) {
    console.log(`  ${f}: the master already is ${mspec.width}x${mspec.height}`);
    continue;
  }
  const out = path.join(outDir, `${name}-${f}.mp4`);
  const t = Date.now();
  ffmpeg([
    "-i", master, "-filter_complex", reframeFilter(W, H, reframe), "-map", "[v]", "-map", "0:a:0?",
    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", ...COLOUR,
    "-c:a", "copy", "-movflags", "+faststart", out,
  ]);
  const s = probe(out);
  const okExp = s.width === W && s.height === H && Math.abs(s.duration - mspec.duration) <= 0.15 && !!s.acodec === !!mspec.acodec;
  exports.push({ format: f, file: path.basename(out), ok: okExp, width: s.width, height: s.height, duration: s.duration, size_mb: s.size_mb });
  console.log(`  ${okExp ? "✓" : "✗"} ${f}: ${s.width}x${s.height}, ${s.duration} s, ${s.size_mb} MB (${reframe}, ${((Date.now() - t) / 1000).toFixed(0)} s)`);
}

step("6/6  Thumbnail and preview GIF");
const thumb = path.join(outDir, `${name}-thumb.jpg`);
const gif = path.join(outDir, `${name}-preview.gif`);
ffmpeg(["-ss", (mspec.duration * 0.4).toFixed(2), "-i", master, "-vf", "thumbnail=25,scale=1280:-2", "-frames:v", "1", "-q:v", "2", thumb]);
ffmpeg([
  "-t", String(Math.min(8, mspec.duration)), "-i", master, "-filter_complex",
  "fps=12,scale=480:-2:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4", "-an", gif,
]);
console.log(`  ${path.basename(thumb)}, ${path.basename(gif)}`);

const allOk = report.ok && exports.every((e) => e.ok);
writeFileSync(
  path.join(outDir, "qc.json"),
  JSON.stringify({ name, source: input, finished: d.toISOString(), ok: allOk, loudness: loud, master: report, exports }, null, 2),
);
if (!flags.keep) rmSync(work, { recursive: true, force: true });

console.log(`\n${allOk ? "✓ DONE — ready to deliver" : "✗ DONE, BUT THE QUALITY CHECK FOUND PROBLEMS (see FAIL lines above)"}`);
console.log(`  ${outDir}`);
console.log(`  total time ${((Date.now() - T0) / 1000).toFixed(0)} s`);
process.exit(allOk ? 0 : 1);
