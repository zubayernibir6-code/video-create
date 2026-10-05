#!/usr/bin/env node
// burn-subs.mjs — burn Bengali (or any) subtitles permanently into a video, with correct conjuncts.
//
//   node "E:/Video Create/tools/burn-subs.mjs" <video> <subtitles.srt|.vtt|.ass> [<output.mp4>]
//        [--style=outline|box] [--font="Hind Siliguri"] [--size=<px>]
//
// Output defaults to <video>-subs.mp4 beside the video. Fonts: "Hind Siliguri" (default),
// "Noto Sans Bengali", "Baloo Da 2", "Tiro Bangla" — all from assets/fonts, so nothing depends on
// what Windows has installed. An .ass file is used as it is (your own styling).
//
// Why it is built this way (verified 2026-10-04/05, CLAUDE.md §0b):
// - FFmpeg's `subtitles=` filter in this 8.1.1 build breaks Bengali conjuncts (visible hasanta).
//   The `ass=` filter shapes them correctly, so SRT/VTT is converted to ASS here first.
// - libass loads EVERY file in fontsdir, so only the font files are copied into a clean folder.
// - Filter arguments cannot hold a Windows drive colon, so ffmpeg runs inside that work folder
//   with relative names.
// - Size and margins scale with the video, so portrait (9:16) and landscape both look right.

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { probe } from "./qc.mjs";
import { parseSubtitles } from "./srt.mjs";

const WORKSPACE = path.resolve(import.meta.dirname, "..");
const FONTS = ["Hind Siliguri", "Noto Sans Bengali", "Baloo Da 2", "Tiro Bangla"];
const COLOUR = [
  "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
  "-x264-params", "colorprim=bt709:transfer=bt709:colormatrix=bt709",
];

function fail(msg) {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
}

// seconds → ASS "H:MM:SS.cc"
function assTime(t) {
  const cs = Math.max(0, Math.round(t * 100));
  const h = Math.floor(cs / 360000), m = Math.floor((cs % 360000) / 6000), s = Math.floor((cs % 6000) / 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs % 100).padStart(2, "0")}`;
}

// Braces start ASS override tags and "\N" is a line break, so they are neutralised in plain text.
const assText = (t) => t.replace(/[{}]/g, (c) => (c === "{" ? "(" : ")")).replace(/\\/g, "/").replace(/\n/g, "\\N");

function buildAss(cues, W, H, { style, font, size }) {
  const short = Math.min(W, H);
  const fs = size ?? Math.round(short * 0.055);
  const outline = Math.max(2, Math.round(fs * 0.06));
  const marginV = Math.round(H * 0.07);
  const marginLR = Math.round(W * 0.06);
  // Colours are &HAABBGGRR; AA 00 = opaque, FF = invisible. The box style uses libass's BorderStyle 4:
  // ONE box (BackColour) around the whole subtitle. BorderStyle 3 draws a box per line, and on two-line
  // subtitles those boxes overlap into a darker band (compared side by side on 2026-10-05).
  const box = style === "box";
  const outlineColour = box ? "&HFF000000" : "&H00000000";
  const borderStyle = box ? 4 : 1;
  const shadow = box ? 0 : Math.max(1, Math.round(fs * 0.03));
  return [
    "[Script Info]",
    "ScriptType: v4.00+",
    `PlayResX: ${W}`,
    `PlayResY: ${H}`,
    "WrapStyle: 0",
    "ScaledBorderAndShadow: yes",
    "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    `Style: Default,${font},${fs},&H00FFFFFF,&H00FFFFFF,${outlineColour},${box ? "&H5A000000" : "&H96000000"},-1,0,0,0,100,100,0,0,${borderStyle},${box ? Math.round(fs * 0.25) : outline},${shadow},2,${marginLR},${marginLR},${marginV},1`,
    "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ...cues.map((c) => `Dialogue: 0,${assTime(c.start)},${assTime(c.end)},Default,,0,0,0,,${assText(c.text)}`),
    "",
  ].join("\n");
}

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => { const [k, ...v] = a.slice(2).split("="); return [k, v.join("=")]; }));
const [videoArg, subsArg, outArg] = args.filter((a) => !a.startsWith("--"));
if (!videoArg || !subsArg) {
  console.log(`Usage: node burn-subs.mjs <video> <subtitles.srt|.vtt|.ass> [<output.mp4>]
       [--style=outline|box] [--font="Hind Siliguri"] [--size=<px>]
Fonts: ${FONTS.join(", ")}`);
  process.exit(2);
}
const video = path.resolve(videoArg);
const subs = path.resolve(subsArg);
for (const f of [video, subs]) if (!existsSync(f)) fail(`File not found: ${f}`);
const output = path.resolve(outArg ?? path.join(path.dirname(video), `${path.parse(video).name}-subs.mp4`));
const font = flags.font ?? FONTS[0];
if (!FONTS.includes(font)) fail(`Unknown font "${font}". Use one of: ${FONTS.join(", ")}`);
const style = flags.style === "box" ? "box" : "outline";

const v = probe(video);
if (!v.width) fail(`${video} has no video stream.`);

const isAss = path.extname(subs).toLowerCase() === ".ass";
let cues = null;
if (!isAss) {
  try {
    cues = parseSubtitles(subs);
  } catch (e) {
    fail(e.message);
  }
}

// The work folder is always removed, including when FFmpeg fails (fail() exits without finally).
const work = mkdtempSync(path.join(os.tmpdir(), "burn-subs-"));
let status;
try {
  // Only font files go into the fonts folder (libass tries to load everything in it).
  mkdirFonts(path.join(work, "fonts"));
  if (isAss) cpSync(subs, path.join(work, "subs.ass"));
  else writeFileSync(path.join(work, "subs.ass"), "﻿" + buildAss(cues, v.width, v.height, { style, font, size: flags.size ? Number(flags.size) : undefined }));
  status = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-v", "error", "-stats", "-y", "-i", video, "-vf", "ass=subs.ass:fontsdir=fonts",
     "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", ...COLOUR,
     "-c:a", "copy", "-movflags", "+faststart", output],
    { cwd: work, stdio: ["ignore", "inherit", "inherit"] },
  ).status;
} finally {
  rmSync(work, { recursive: true, force: true });
}
if (status !== 0) fail("FFmpeg could not burn the subtitles (see the message above).");
const o = probe(output);
console.log(`\n✓ Subtitled video: ${output}`);
console.log(`  ${cues ? `${cues.length} subtitle lines` : "your .ass file"}, font ${font}, ${style} style, ${o.width}x${o.height}, ${o.duration} s`);

function mkdirFonts(dir) {
  for (const sub of ["bengali", "latin"]) {
    const from = path.join(WORKSPACE, "assets", "fonts", sub);
    for (const f of readdirSync(from)) if (/\.(ttf|otf)$/i.test(f)) cpSync(path.join(from, f), path.join(dir, f));
  }
}
