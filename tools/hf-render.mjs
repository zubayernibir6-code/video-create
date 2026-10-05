#!/usr/bin/env node
/**
 * hf-render.mjs — HyperFrames render that works around the blocked ffprobe.exe
 * =============================================================================
 *
 * WHY THIS EXISTS (2026-09-25)
 * ----------------------------
 * Windows Smart App Control (SmartAppControlState = On) now blocks
 * `ffprobe.exe` on this machine. `ffmpeg.exe` from the very same folder still
 * runs — the block is per-file reputation, not a signature or path rule, so
 * copying or renaming the binary does not help.
 *
 * A normal `hyperframes render` captures every frame, encodes the video, and
 * then calls ffprobe to verify the artifact's duration before committing it.
 * That probe dies with `spawn UNKNOWN`, HyperFrames rolls the transaction back,
 * and the finished MP4 is deleted. The render looks like a failure even though
 * the video was made.
 *
 * `--format png-sequence` writes a DIRECTORY artifact, and HyperFrames skips
 * the duration probe entirely for directories (verified in the installed
 * 0.8.33 dist: the probe only runs when `kind === "file"`). So this script:
 *
 *   1. renders a PNG sequence (no ffprobe, no rollback)
 *   2. flattens it onto the composition's background colour
 *   3. encodes with the system FFmpeg 8.1.1, which is not blocked
 *   4. deletes the PNGs
 *
 * Same shape as projects/remotion-starter/render.mjs, for the same class of
 * reason. Do not "simplify" it back to a plain `hyperframes render` — that
 * path is broken here.
 *
 * THE BACKGROUND-COLOUR STEP IS NOT OPTIONAL
 * ------------------------------------------
 * png-sequence renders RGBA. Chrome drops the page background (the colour set
 * on `body`/`html`) into transparency, so a straight yuv420p encode comes out
 * pure black. This script reads that colour back out of the composition and
 * composites over it. Verified against projects/font-test: with the flatten
 * the frame is identical to the known-good render; without it the background
 * is black.
 *
 * ⚠️ AUDIO IS NOT INCLUDED. png-sequence has no audio track. A composition
 * with <audio> cues renders silent through this path. Use tools/hf-audio.mjs
 * afterwards, or render audio separately.
 *
 * USAGE
 *   node "E:/Video Create/tools/hf-render.mjs" <projectDir> [options]
 *
 *   --output=<path>    output MP4 (default: <project>/renders/<project>.mp4)
 *   --bg=<colour>      background colour override, e.g. --bg=#0d0f14
 *                      (default: auto-detected from the composition)
 *   --fps=<n>          frame rate (default: 30)
 *   --quality=<q>      draft | standard | high (default: high)
 *                      Uses HyperFrames' own preset/CRF pairs, so the output
 *                      matches a normal `hyperframes render` byte-for-byte.
 *   --crf=<n>          override the profile's x264 CRF
 *   --composition=<f>  render a sub-composition instead of index.html
 *   --workers=<n>      parallel Chrome workers (default: 2 — this machine
 *                      thrashes above that; each worker costs ~256 MB RAM)
 *   --keep-frames      do not delete the PNG sequence afterwards
 */

import { spawn } from "node:child_process";
import { existsSync, readFileSync, rmSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";

// ---------------------------------------------------------------- arguments

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith("--"));
const flags = Object.fromEntries(
  argv
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const eq = a.indexOf("=");
      return eq === -1 ? [a.slice(2), true] : [a.slice(2, eq), a.slice(eq + 1)];
    }),
);

const projectDir = resolve(positional[0] ?? process.cwd());
if (!existsSync(join(projectDir, "hyperframes.json"))) {
  fail(`Not a HyperFrames project (no hyperframes.json): ${projectDir}`);
}

const projectName = basename(projectDir);
const outputPath = resolve(projectDir, flags.output ?? `renders/${projectName}.mp4`);
const fps = String(flags.fps ?? 30);
const quality = String(flags.quality ?? "high");
const workers = String(flags.workers ?? 2);
const keepFrames = flags["keep-frames"] === true;

/**
 * HyperFrames' own ENCODER_PRESETS, copied from the installed 0.8.33 dist
 * (cli.js ~line 72461). Step 2 has to encode the way HyperFrames would, or the
 * output silently differs in size and quality from every earlier render in this
 * workspace. Measured: CRF 17/medium gave 278 KB where `--quality high` gives
 * 946 KB for the same 5 s of font-test.
 */
const ENCODER_PRESETS = {
  draft: { preset: "ultrafast", crf: 28 },
  standard: { preset: "medium", crf: 18 },
  high: { preset: "slow", crf: 15 },
};
if (!ENCODER_PRESETS[quality]) fail(`--quality must be draft, standard or high (got "${quality}")`);
const encoder = ENCODER_PRESETS[quality];
const crf = String(flags.crf ?? encoder.crf);

// Everything below runs with cwd = projectDir and RELATIVE paths. The workspace
// path contains a space ("E:\Video Create"), and spawning through a shell on
// Windows concatenates arguments without escaping them — an absolute path would
// be split at the space ("Not a directory: E:\Video").
const seqRel = "renders/.hf-seq-tmp";
const seqDir = join(projectDir, seqRel);

// ------------------------------------------------- background-colour lookup

/**
 * png-sequence loses whatever colour is painted on body/html, so we have to
 * put it back. Read it out of the composition we are actually rendering.
 */
function detectBackground() {
  if (typeof flags.bg === "string") return normaliseColour(flags.bg);

  const sources = [];
  if (typeof flags.composition === "string") {
    sources.push(join(projectDir, flags.composition));
  }
  sources.push(join(projectDir, "index.html"));

  for (const file of sources) {
    if (!existsSync(file)) continue;
    const css = readFileSync(file, "utf8");

    // Match `body { ... background: X }` / `html, body { ... background-color: X }`
    const block = css.match(
      /(?:^|[{}\s,])(?:html\s*,\s*body|body\s*,\s*html|body|html)\s*\{([^}]*)\}/i,
    );
    if (!block) continue;

    const decl = block[1].match(/background(?:-color)?\s*:\s*([^;]+)/i);
    if (!decl) continue;

    const colour = firstColour(decl[1]);
    if (colour) return colour;
  }
  return null;
}

/** Pull the first usable colour out of a declaration (handles gradients). */
function firstColour(value) {
  const hex = value.match(/#[0-9a-f]{3,8}\b/i);
  if (hex) return normaliseColour(hex[0]);
  const rgb = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) {
    const [, r, g, b] = rgb;
    return "0x" + [r, g, b].map((n) => Number(n).toString(16).padStart(2, "0")).join("");
  }
  return null;
}

/** FFmpeg's `color=` source wants 0xRRGGBB, not #RRGGBB. */
function normaliseColour(input) {
  let c = String(input).trim().replace(/^#/, "").replace(/^0x/i, "");
  if (c.length === 3) c = c.split("").map((ch) => ch + ch).join("");
  if (c.length === 8) c = c.slice(0, 6); // drop alpha
  if (!/^[0-9a-f]{6}$/i.test(c)) fail(`Unrecognised colour: ${input}`);
  return "0x" + c.toLowerCase();
}

// ------------------------------------------------------------------ helpers

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

function run(command, args, label) {
  return new Promise((resolvePromise) => {
    console.log(`\n▸ ${label}`);
    // `shell: true` is required on Windows to launch the npx/ffmpeg shims, but a
    // shell splits on spaces, so quote every argument that contains one.
    const quoted = args.map((a) => (/[\s]/.test(a) ? `"${a}"` : a));
    const child = spawn(command, quoted, {
      stdio: "inherit",
      cwd: projectDir,
      shell: process.platform === "win32",
    });
    child.on("error", (error) => fail(`${label} could not start: ${error.message}`));
    child.on("close", (code) => resolvePromise(code ?? 1));
  });
}

/** PNG frames land as frame_000001.png; read the real pattern rather than assume. */
function framePattern(dir) {
  const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".png")).sort();
  if (files.length === 0) fail(`No PNG frames were written to ${dir}`);
  const match = files[0].match(/^(.*?)(\d+)\.png$/i);
  if (!match) fail(`Unexpected frame filename: ${files[0]}`);
  return {
    pattern: `${match[1]}%0${match[2].length}d.png`,
    count: files.length,
    first: join(dir, files[0]),
  };
}

function humanSize(bytes) {
  return bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.round(bytes / 1e3)} KB`;
}

/**
 * Read width/height straight out of the PNG's IHDR chunk. We cannot use ffprobe
 * to ask — it is the blocked binary this whole script exists to avoid — and
 * hardcoding 1920x1080 would break every portrait or square project.
 */
function pngSize(file) {
  const head = readFileSync(file).subarray(0, 24);
  if (head.readUInt32BE(0) !== 0x89504e47) fail(`Not a PNG: ${file}`);
  return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
}

// --------------------------------------------------------------------- main

const started = Date.now();
console.log(`\nhf-render — ${projectName}`);
console.log(`  project  ${projectDir}`);
console.log(`  output   ${outputPath}`);

// A stale sequence from a previous, longer render would leak extra frames.
rmSync(seqDir, { recursive: true, force: true });
mkdirSync(join(projectDir, "renders"), { recursive: true });

const renderArgs = [
  "hyperframes",
  "render",
  "--format",
  "png-sequence",
  "--quality",
  quality,
  "--workers",
  workers,
  "--output",
  seqRel,
];
if (typeof flags.composition === "string") renderArgs.push("--composition", flags.composition);

const renderCode = await run("npx", renderArgs, "Step 1/2 — capturing frames (PNG sequence)");
if (renderCode !== 0) fail(`HyperFrames render exited with code ${renderCode}`);
if (!existsSync(seqDir)) fail(`HyperFrames reported success but wrote nothing to ${seqDir}`);

const { pattern, count, first } = framePattern(seqDir);
const { width, height } = pngSize(first);

const background = detectBackground();
if (background) {
  console.log(`\n  background ${background} (flattening the transparent page background)`);
} else {
  console.warn(
    `\n  ⚠ Could not detect the composition's background colour — falling back to black.` +
      `\n    If the result looks wrong, re-run with --bg=#RRGGBB.`,
  );
}
const bg = background ?? "0x000000";

// These arguments mirror HyperFrames' own libx264 path (cli.js ~72632-72717).
// Three details in the filter graph are load-bearing, each found by measuring
// the decoded background against the CSS colour it is supposed to be:
//   format=rgb24 / format=rgba / overlay:format=rgb — force the composite to
//     happen in RGB. Left to itself, `color` produces yuv420p, overlay
//     composites in YUV, and the scale below then range-compresses an already
//     limited-range signal a second time. Measured: #0d0f14 came out
//     rgb(25,26,29) — visibly washed out — instead of rgb(13,14,19).
//   scale=in_range=pc:out_range=tv — PNG RGB is full range; video is limited.
//     This is the conversion HyperFrames itself applies.
//   -colorspace/-color_primaries/-color_trc/-color_range — tag the file
//     bt709/tv. Without them the stream reads `yuv420p(progressive)` with no
//     colour information and the player has to guess.
const encodeArgs = [
  "-y",
  "-v", "error", "-stats",
  "-framerate", fps,
  "-i", `${seqRel}/${pattern}`,
  "-r", fps,
  "-filter_complex",
  `color=c=${bg}:s=${width}x${height}:r=${fps},format=rgb24[bg];` +
    `[0:v]format=rgba[fg];` +
    `[bg][fg]overlay=shortest=1:format=rgb,scale=in_range=pc:out_range=tv`,
  "-c:v", "libx264",
  "-preset", encoder.preset,
  "-crf", crf,
  "-bf", "0",
  "-x264-params",
  encoder.preset === "ultrafast"
    ? "aq-mode=3:colorprim=bt709:transfer=bt709:colormatrix=bt709"
    : "aq-mode=3:aq-strength=0.8:deblock=1,1:colorprim=bt709:transfer=bt709:colormatrix=bt709",
  "-colorspace:v", "bt709",
  "-color_primaries:v", "bt709",
  "-color_trc:v", "bt709",
  "-color_range", "tv",
  "-video_track_timescale", "90000",
  "-pix_fmt", "yuv420p",
  "-avoid_negative_ts", "make_zero",
  "-movflags", "+faststart",
  outputPath,
];

const encodeCode = await run(
  "ffmpeg",
  encodeArgs,
  `Step 2/2 — encoding ${count} frames at ${width}×${height}` +
    ` (${quality}: preset ${encoder.preset}, CRF ${crf})`,
);
if (encodeCode !== 0) fail(`FFmpeg exited with code ${encodeCode}`);
if (!existsSync(outputPath)) fail(`FFmpeg reported success but ${outputPath} does not exist`);

if (!keepFrames) rmSync(seqDir, { recursive: true, force: true });

const bytes = statSync(outputPath).size;
const seconds = ((Date.now() - started) / 1000).toFixed(1);
console.log(`\n✓ ${outputPath}`);
console.log(`  ${humanSize(bytes)} · ${count} frames · ${seconds}s\n`);
if (!keepFrames) console.log("  (PNG frames deleted; pass --keep-frames to keep them)\n");
