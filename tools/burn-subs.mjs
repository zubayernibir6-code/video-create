#!/usr/bin/env node
// burn-subs.mjs — burn Bengali (or any) subtitles permanently into a video, with correct conjuncts.
//
//   node "E:/Video Create/tools/burn-subs.mjs" <video> <subtitles.srt|.vtt|.ass> [<output.mp4>]
//        [--style=outline|box] [--font="Hind Siliguri"] [--size=<px>] [--pos=<% from top>|bottom]
//
// Output defaults to <video>-subs.mp4 beside the video. Fonts: "Hind Siliguri" (default),
// "Noto Sans Bengali", "Baloo Da 2", "Tiro Bangla" — all from assets/fonts, so nothing depends on
// what Windows has installed. An .ass file is used as it is (your own styling).
//
// Placement: a tall 9:16 video (Reels/Shorts) gets its captions centred about 60 % from the top, because
// Facebook/Instagram cover the bottom ~35 % of a Reel with the caption, name and buttons (Meta's Reels
// safe zone: top 14 %, bottom 35 %, sides 6 %). Everything else (16:9, 1:1, 4:5) keeps them at the
// bottom. --pos=<n> centres a one-line caption at n % from the top; --pos=bottom forces the bottom.
// A phone's portrait clip that is stored sideways with a rotation flag counts by its upright shape.
//
// Why it is built this way (verified 2026-10-04/05, CLAUDE.md §0b):
// - FFmpeg's `subtitles=` filter in this 8.1.1 build breaks Bengali conjuncts (visible hasanta).
//   The `ass=` filter shapes them correctly, so SRT/VTT is converted to ASS here first.
// - libass loads EVERY file in fontsdir, so only the font files are copied into a clean folder.
// - Filter arguments cannot hold a Windows drive colon, so ffmpeg runs inside that work folder
//   with relative names.
// - Size and margins scale with the video, so portrait (9:16) and landscape both look right.
// - Captions stay bottom-anchored at any --pos, so a second line grows upward, never down into the
//   area Reels covers. libass draws a line Fontsize px tall, which is what the --pos margin assumes.

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { probe } from "./qc.mjs";
import { parseSubtitles } from "./srt.mjs";

const WORKSPACE = path.resolve(import.meta.dirname, "..");
const FONTS = ["Hind Siliguri", "Noto Sans Bengali", "Baloo Da 2", "Tiro Bangla"];
const TALL = 1.7; // height ÷ width at or above this counts as 9:16 (1080x1920 = 1.78, 4:5 = 1.25)
const REELS_POS = 60; // % from the top where a one-line caption is centred on a tall video
const REELS_COVERED = 0.35; // bottom share of a Reel that Facebook/Instagram cover
const REELS_TOP = 0.14; // top share they cover
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

// Phones store a portrait recording as a landscape picture plus a rotation flag. FFmpeg turns the picture
// upright before the ass filter, so the captions are laid out for the upright size.
function displaySize(file, v) {
  const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries",
    "stream_side_data=rotation:stream_tags=rotate", "-of", "json", file], { encoding: "utf8" });
  const s = r.status === 0 ? JSON.parse(r.stdout).streams?.[0] ?? {} : {};
  const rotation = Number(s.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ?? s.tags?.rotate ?? 0);
  return Math.abs(rotation) % 180 === 90 ? [v.height, v.width] : [v.width, v.height];
}

// Sizes and margins in video pixels. libass draws a line Fontsize px tall, and the box style pads it by Outline.
// Captions are bottom-centre aligned: MarginV is 7 % for "bottom", otherwise the margin that puts the middle
// of a one-line caption at pos % from the top.
function layout(W, H, { style, size, pos }) {
  const fs = size ?? Math.round(Math.min(W, H) * 0.055);
  const box = style === "box";
  return {
    fs,
    box,
    outline: box ? Math.round(fs * 0.25) : Math.max(2, Math.round(fs * 0.06)),
    shadow: box ? 0 : Math.max(1, Math.round(fs * 0.03)),
    marginV: pos === "bottom" ? Math.round(H * 0.07) : Math.round(H * (1 - pos / 100) - fs / 2),
    marginLR: Math.round(W * 0.06),
  };
}

function buildAss(cues, W, H, { style, font, size, pos }) {
  const { fs, box, outline, shadow, marginV, marginLR } = layout(W, H, { style, size, pos });
  // Colours are &HAABBGGRR; AA 00 = opaque, FF = invisible. The box style uses libass's BorderStyle 4:
  // ONE box (BackColour) around the whole subtitle. BorderStyle 3 draws a box per line, and on two-line
  // subtitles those boxes overlap into a darker band (compared side by side on 2026-10-05).
  const outlineColour = box ? "&HFF000000" : "&H00000000";
  const borderStyle = box ? 4 : 1;
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
    `Style: Default,${font},${fs},&H00FFFFFF,&H00FFFFFF,${outlineColour},${box ? "&H5A000000" : "&H96000000"},-1,0,0,0,100,100,0,0,${borderStyle},${outline},${shadow},2,${marginLR},${marginLR},${marginV},1`,
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
       [--style=outline|box] [--font="Hind Siliguri"] [--size=<px>] [--pos=<% from top>|bottom]
Fonts: ${FONTS.join(", ")}
Placement: 9:16 videos centred ${REELS_POS} % from the top (Reels safe zone), others at the bottom.`);
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

const [W, H] = displaySize(video, v);
const tall = H >= W * TALL;

const isAss = path.extname(subs).toLowerCase() === ".ass";
let pos = tall ? REELS_POS : "bottom";
let size;
if (isAss) {
  if (flags.pos !== undefined) console.log("Note: --pos is ignored for an .ass file (it keeps its own placement).");
} else {
  if (flags.pos !== undefined) {
    const p = flags.pos.trim().toLowerCase().replace(/\s*%$/, "");
    if (p === "bottom") pos = "bottom";
    else if (/^\d+(\.\d+)?$/.test(p) && +p >= 10 && +p <= 95) pos = +p;
    else fail(`--pos must be "bottom" or a number from 10 to 95 (% from the top), not "${flags.pos}".`);
  }
  if (flags.size !== undefined) {
    size = Number(flags.size);
    if (!(flags.size.trim() && size >= 12 && size <= 300)) fail(`--size must be a number of pixels from 12 to 300, not "${flags.size}".`);
  }
}

let cues = null;
if (!isAss) {
  try {
    cues = parseSubtitles(subs);
  } catch (e) {
    fail(e.message);
  }
}

// On a 9:16 video, check the drawn captions against the parts Reels covers. Only typed line breaks are counted:
// libass can wrap a long line into more lines, which grow further upward.
let reelsSafe = false;
if (tall && cues) {
  const L = layout(W, H, { style, size, pos });
  const lines = Math.max(...cues.map((c) => c.text.split("\n").length));
  const bottom = H - L.marginV + L.outline + L.shadow;
  const top = H - L.marginV - lines * L.fs - L.outline;
  if (bottom > H * (1 - REELS_COVERED)) console.log(`Warning: on a 9:16 video these captions reach into the bottom ${Math.round(REELS_COVERED * 100)} %, which Facebook/Instagram Reels cover.`);
  if (top < H * REELS_TOP) console.log(`Warning: on a 9:16 video the tallest caption reaches into the top ${Math.round(REELS_TOP * 100)} %, which Facebook/Instagram Reels cover.`);
  reelsSafe = bottom <= H * (1 - REELS_COVERED) && top >= H * REELS_TOP;
}

// The work folder is always removed, including when FFmpeg fails (fail() exits without finally).
const work = mkdtempSync(path.join(os.tmpdir(), "burn-subs-"));
let status;
try {
  // Only font files go into the fonts folder (libass tries to load everything in it).
  mkdirFonts(path.join(work, "fonts"));
  if (isAss) cpSync(subs, path.join(work, "subs.ass"));
  else writeFileSync(path.join(work, "subs.ass"), "﻿" + buildAss(cues, W, H, { style, font, size, pos }));
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
if (cues) console.log(`  Captions ${pos === "bottom" ? "at the bottom" : `centred ${pos} % from the top`}${reelsSafe ? " (Reels safe zone)" : ""}.`);

function mkdirFonts(dir) {
  for (const sub of ["bengali", "latin"]) {
    const from = path.join(WORKSPACE, "assets", "fonts", sub);
    for (const f of readdirSync(from)) if (/\.(ttf|otf)$/i.test(f)) cpSync(path.join(from, f), path.join(dir, f));
  }
}
