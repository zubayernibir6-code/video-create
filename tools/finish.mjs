#!/usr/bin/env node
// finish.mjs — one command from a HyperFrames project (or any video file) to delivery-ready files.
//
//   node "E:/Video Create/tools/finish.mjs" <project-folder | video-file>
//        [--quality=high|standard|draft] [--formats=16x9,9x16,1x1,4x5] [--reframe=fit|crop]
//        [--lufs=-14] [--out=<folder>] [--keep] [--skip-design] [--frames-cache=<folder>] [--release]
//
// --release (release system, 2026-10-30): the master is encoded for upload to every platform — x264 ABR at YouTube's
//   recommended rate (10 Mbps at 1080p ≤ 30 fps, 14 Mbps above; peaks 1.4×), a keyframe every 2 s (Facebook's API asks
//   2–5 s), no MP4 edit list (YouTube and the Instagram API ask for none; FFmpeg writes one for AAC's delay), and no
//   extra screen shapes unless --formats is given (a universal Reel IS the platform file). tools/release/spec-check.mjs
//   found all three on the 2026-10-29/30 renders.
//
// Project folder: a video over 60 s needs a clean tools/preflight.mjs report of the current build first
//                 (--no-preflight skips it) → hyperframes check + tools/design-lint.mjs (both stop the run on
//                 errors; --skip-design skips the second) → hyperframes render (1 worker, long-render safe) → master.
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
// - --experimental-fast-capture=false: the drawElement capture placed GSAP-moved elements wrongly (click rings
//   ~1000 px off, inside a scaled layer) on claude-video-tutorial, 2026-10-29; screenshot capture of the same
//   seconds was right, and faster there (7.8 vs 5.8 frames/s).
// - --frames-cache-dir in the workspace .cache: footage frame extraction would otherwise fill %TEMP%.
//   --frames-cache=<folder> moves it (a long footage render can need several GB; pick the drive with room).
// - loudnorm LRA raised to the measured LRA: otherwise it falls back to dynamic mode and misses
//   the target (audio-test: LRA 11 → -12.0 LUFS; LRA 21 → -14.9 LUFS).
// - Reframe defaults to "fit" (whole frame over a blurred copy): a plain centre crop cuts the
//   text off a designed 16:9 layout. Use --reframe=crop for footage with a centred subject.
// - FFmpeg 8.1.1's gbrp→YUV conversion leaves the right 8 px black at widths 1080/1096. HyperFrames' MP4 encode
//   uses it, so a 1080-wide project is rendered on a 1088-wide page (root pinned at 1080) and cropped back.
//   A one-frame self-test decides, so a fixed FFmpeg skips the detour automatically (gbrpEdgeOk).

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
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

// FFmpeg 8.1.1 (this machine) has a swscale bug: converting planar RGB (gbrp) to YUV leaves the right-most 8 px
// pure black when the width is 1080 or 1096 (1072, 1088 and 720 are fine; measured 2026-10-06). HyperFrames' MP4
// encode converts through gbrp, so every 1080-wide render (9:16, 1:1, 4:5) lost its right edge (khata-cartoon).
// Self-test the conversion at the real size; while it fails, render on a slightly bigger page and crop back.
function gbrpEdgeOk(w, h) {
  const px = (crop) => {
    const r = spawnSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", `color=c=white:s=${w}x${h}`, "-frames:v", "1",
      "-vf", `format=gbrp,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,format=gray,crop=${crop}`, "-f", "rawvideo", "-"]);
    return r.stdout?.length ? r.stdout[0] : 255;   // cannot test: assume fine
  };
  return px("1:1:iw-1:ih/2") > 100 && px("1:1:iw/2:ih-1") > 100;
}
function safeRenderSize(w, h) {
  let W = w, H = h;
  while (!gbrpEdgeOk(W, h) && W < w + 64) W += 8;
  while (!gbrpEdgeOk(W, H) && H < h + 64) H += 8;
  return gbrpEdgeOk(W, H) ? [W, H] : null;
}
// A copy of the project whose PAGE is W×H while the composition root stays w×h (pinned with !important:
// the runtime otherwise stretches the root to data-width, which moves centred and right-aligned content).
function paddedCopy(dir, w, h, W, H) {
  const dst = path.join(WORKSPACE, ".cache", "padded", path.basename(dir));
  rmSync(dst, { recursive: true, force: true });
  cpSync(dir, dst, { recursive: true, filter: (src) => !["renders", "node_modules", ".git"].includes(path.relative(dir, src).split(path.sep)[0]) });
  const f = path.join(dst, "index.html");
  let html = readFileSync(f, "utf8");
  const tag = html.match(/<[a-z]+\b[^>]*\bdata-composition-id="([^"]*)"[^>]*>/is);
  html = html.replace(tag[0], tag[0].replace(/\bdata-width="[\d.]+"/, `data-width="${W}"`).replace(/\bdata-height="[\d.]+"/, `data-height="${H}"`));
  html = html.replace(/<\/head>/i,
    `<style>/* finish.mjs: page enlarged for the FFmpeg gbrp edge bug; the render is cropped back to ${w}x${h} */\n` +
    `html, body { width: ${W}px !important; height: ${H}px !important; }\n[data-composition-id="${tag[1]}"] { width: ${w}px !important; height: ${h}px !important; }</style>\n</head>`);
  writeFileSync(f, html);
  return dst;
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
function normaliseAudio(input, output, target, videoArgs, videoDur, mux = ["-movflags", "+faststart"]) {
  const cut = videoDur ? `,atrim=end=${videoDur}` : "";
  const m = loudnormJson(ffmpeg(["-i", input, "-vn", "-af", `loudnorm=I=${target}:TP=${TP_TARGET}:LRA=11:print_format=json`, "-f", "null", "-"]).stderr);
  if (!Number.isFinite(Number(m.input_i)) || Number(m.input_i) < -70) return { skipped: "silent audio track" };
  const lra = Math.max(11, Math.ceil(Number(m.input_lra)) + 1);
  const norm =
    `loudnorm=I=${target}:TP=${TP_TARGET}:LRA=${lra}:linear=true:measured_I=${m.input_i}:measured_TP=${m.input_tp}` +
    `:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset},aresample=48000`;
  // no edit list (--release): AAC's 1024 priming samples would play first and push the sound 21.3 ms late; trim the
  // same 1024 samples (48 kHz) off the start so the decoded sound lands on its original time
  const prime = mux.includes("-use_editlist") ? ",aresample=48000,atrim=start_sample=1024,asetpts=PTS-STARTPTS" : "";
  const encode = (af) =>
    ffmpeg(["-i", input, ...videoArgs, "-af", af + prime + cut, "-c:a", "aac", "-b:a", "256k", "-ac", "2", ...mux, output]);
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
  // The limiter runs 4× oversampled (a true-peak limiter), and tighter until the AAC file's true peak is under -1:
  // at 48 kHz with limit 0.794 an AAC master still measured -0.4 dBTP (gh-ep08-bangla, 2026-11-01).
  if (Math.abs(after.I - target) > 1 || after.TP > -1) {
    for (const limit of [0.708, 0.631, 0.562]) {
      encode(`volume=${(target - before.I).toFixed(2)}dB,aresample=192000,alimiter=limit=${limit}:level=false,aresample=48000`);
      after = ebur(output);
      method = `gain + 4x true-peak limiter (${limit})`;
      if (after.TP <= -1) break;
    }
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
       [--formats=16x9,9x16,1x1,4x5] [--reframe=fit|crop] [--lufs=-14] [--out=<folder>] [--keep]
       [--skip-design] [--frames-cache=<folder>]`);
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
const release = !!flags.release;
const formats = flags.formats == null && release ? [] : String(flags.formats ?? "16x9,9x16,1x1,4x5").split(",").map((f) => f.trim()).filter(Boolean);
// --release: the upload encode (ABR at YouTube's rate, 2 s keyframes) and the MP4 mux without an edit list.
// Without an edit list nothing lines the tracks up, so (2026-11-04, mohona-promo-01, measured by tools/promo/sync_check.py)
// B-frames started the PICTURE 2 frames late (video start_time 0.083 s) and AAC's 1024-sample encoder delay started the
// SOUND 21.3 ms late: picture 62 ms behind sound in every --release file. Now: no B-frames (the first frame is at 0), the
// encoder delay trimmed off the audio before encoding (normaliseAudio) and no timestamp shift (mux): every frame on the
// exact n/fps grid and the sound on its original time (strict test: 0.00 ms off the grid, voice at 300.00 ms of 300).
const releaseVideo = (fps) => {
  const mb = fps > 30.5 ? 14 : 10, g = Math.round(2 * fps);
  return ["-c:v", "libx264", "-preset", "medium", "-b:v", `${mb}M`, "-maxrate", `${Math.round(mb * 1.4)}M`, "-bufsize", `${mb * 2}M`,
    "-g", String(g), "-keyint_min", String(Math.round(fps)), "-bf", "0", "-pix_fmt", "yuv420p", ...COLOUR];
};
// -avoid_negative_ts disabled: AAC's first packet sits at -1024 samples; FFmpeg's default shifted EVERY track by that
// 21.3 ms to make it non-negative, which put every video frame after the first 21 ms late (avg fps 23.987, 2026-11-04)
const mux = ["-movflags", "+faststart", ...(release ? ["-use_editlist", "0", "-avoid_negative_ts", "disabled"] : [])];
let releaseEncoded = false;
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
  // FFmpeg time limits: HyperFrames gives frame extraction 5 min and the streaming encode 10 min by default. A 10.5-min
  // 1080p footage page (zubayer-ep01) failed extraction with ffmpeg_timeout; the encode limit would end a long render.
  const longMs = "10800000";
  const env = { ...process.env, PRODUCER_STREAMING_ENCODE_MAX_DURATION_SECONDS: "3600", HYPERFRAMES_NO_AUTO_INSTALL: "1", HYPERFRAMES_SKIP_SKILLS: "1",
    FFMPEG_PROCESS_TIMEOUT_MS: process.env.FFMPEG_PROCESS_TIMEOUT_MS ?? longMs, FFMPEG_ENCODE_TIMEOUT_MS: process.env.FFMPEG_ENCODE_TIMEOUT_MS ?? longMs,
    FFMPEG_STREAMING_TIMEOUT_MS: process.env.FFMPEG_STREAMING_TIMEOUT_MS ?? longMs };
  expect = compositionSpec(input);

  // a long render only after preflight.mjs ran on THIS build (index.html + its clips) with no errors and its sheets
  // were looked at: claude-video-tutorial (2026-10-29) took three 2-hour renders for mistakes a 7-minute preflight finds
  if ((expect.dur ?? 0) > 60 && !flags["no-preflight"]) {
    const rp = path.join(input, ".preflight", "report.json");
    const rep = existsSync(rp) ? JSON.parse(readFileSync(rp, "utf8")) : null;
    const { buildHash } = await import("./preflight.mjs");
    const why = !rep ? "no preflight report" : !rep.whole ? "the last preflight checked only part of the video (--from/--to)"
      : rep.hash !== buildHash(input) ? "the build changed since the last preflight" : !rep.ok ? "the last preflight found errors" : null;
    if (why) fail(`${why}. Run: node tools/preflight.mjs ${target}, fix its errors and LOOK at its sheets, then render (nothing was rendered; --no-preflight skips this).`);
    console.log(`preflight ✓ (${rep.at}, ${rep.findings.filter((f) => f.sev === "warn").length} warning(s) looked at)`);
  }

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
  const cache = path.resolve(typeof flags["frames-cache"] === "string" ? flags["frames-cache"] : path.join(WORKSPACE, ".cache", "frames"));
  mkdirSync(cache, { recursive: true });
  // the FFmpeg gbrp edge bug (see gbrpEdgeOk): render on a bigger page, crop back afterwards
  let renderDir = input, pad = null;
  if (expect.w && expect.h && !gbrpEdgeOk(expect.w, expect.h)) {
    pad = safeRenderSize(expect.w, expect.h);
    if (!pad) fail(`FFmpeg would leave a black strip at the edge of a ${expect.w}x${expect.h} render, and no nearby size avoids it.`);
    renderDir = paddedCopy(input, expect.w, expect.h, pad[0], pad[1]);
    console.log(`  ${expect.w}x${expect.h} hits the FFmpeg edge bug (a black strip on the right) — rendering a ${pad[0]}x${pad[1]} page and cropping back`);
  }
  const rnd = spawnSync(
    process.execPath,
    [hf, "render", "--quality", quality, "--workers", "1", "--experimental-fast-capture=false", "--frames-cache-dir", cache, "--output", source],
    { cwd: renderDir, env, stdio: "inherit" },
  );
  if (pad) rmSync(renderDir, { recursive: true, force: true });
  if (rnd.status !== 0 || !existsSync(source)) fail("Rendering failed — see the messages above.");
  if (pad) {
    const cropped = path.join(work, `${name}.render-crop.mp4`);
    const crf = { high: "15", standard: "18", draft: "23" }[quality] ?? "18";
    console.log(`  cropping ${pad[0]}x${pad[1]} → ${expect.w}x${expect.h} (x264 CRF ${crf})`);
    ffmpeg(["-i", source, "-map", "0:v:0", "-map", "0:a:0?", "-vf", `crop=${expect.w}:${expect.h}:0:0`,
      ...(release ? releaseVideo(probe(source).fps) : ["-c:v", "libx264", "-preset", "medium", "-crf", crf, "-pix_fmt", "yuv420p", ...COLOUR]), "-c:a", "copy", cropped]);
    if (release) { releaseEncoded = true; console.log("  --release: upload encode (ABR, 2 s keyframes)"); }
    source = cropped;
  }
} else {
  step("1-2/6  Video file given — no check or render needed");
}

step("3/6  Master file: loudness to the web standard");
const src = probe(source);
const master = path.join(outDir, `${name}.mp4`);
const videoOk = src.vcodec === "h264" && src.pix_fmt === "yuv420p";
const videoArgs = release && !releaseEncoded
  ? ["-map", "0:v:0", "-map", "0:a:0?", ...releaseVideo(src.fps)]
  : videoOk
  ? ["-map", "0:v:0", "-map", "0:a:0?", "-c:v", "copy"]
  : ["-map", "0:v:0", "-map", "0:a:0?", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", ...COLOUR];
if (release && !releaseEncoded) console.log("  --release: upload encode (ABR, 2 s keyframes)");
else if (!videoOk) console.log(`  video is ${src.vcodec}/${src.pix_fmt} — re-encoding to h264/yuv420p`);
let loud = null;
if (src.acodec) {
  loud = normaliseAudio(source, master, lufs, videoArgs, src.vduration, mux);
  if (loud.skipped) {
    console.log(`  audio: ${loud.skipped} — left as it is`);
    ffmpeg(["-i", source, ...videoArgs, "-c:a", "copy", ...mux, master]);
  } else console.log(`  audio: ${loud.before} → ${loud.after} LUFS, peak ${loud.peak} dBTP (${loud.method})`);
} else {
  console.log("  no audio track — video only");
  ffmpeg(["-i", source, ...videoArgs, ...mux, master]);
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
