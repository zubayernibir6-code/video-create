#!/usr/bin/env node
// contact-sheet.mjs — a whole video as one image: a grid of frames, each labelled with its time, to review pacing,
// layout and text at a glance (CLAUDE.md §0d rule 9) instead of reading dozens of single frames.
//
//   node "D:/Video Create/tools/contact-sheet.mjs" <video> [--every=<seconds>] [--from=<time>] [--to=<time>]
//        [--cols=<n>] [--out=<file.png | folder>]
//
// Default: ONE sheet, with the frames spread over the video at a round step (every 0.25, 0.5, 1, 2, 2.5, 5, 10 …
// seconds, the smallest that fits on one page). --every=0.5 takes a frame every half second over as many
// sheets as needed, for the frame-by-frame review. --from/--to (seconds or m:ss) look at one stretch only.
// To read on-screen text, use bigger tiles: --cols=4 for 9:16, --cols=2 for 16:9.
// Output: <video>-sheet.png beside the video, or <video>-sheet-01.png, -02 … for several pages. A new run replaces
// that video's earlier -sheet pages; with --out=<name>.png only the files it writes are touched.
//
// How it is built (verified 2026-10-24):
// - One FFmpeg pass: fps at the step, trim, scale, label, tile, header. The last, partly filled page is still
//   written, and every page is stamped with the time of its first frame. The pages are written into a temp
//   folder (a % in a file name would otherwise be read as FFmpeg's page-number pattern) and copied into place
//   only after FFmpeg succeeds.
// - fps needs round=up: its default (near) keeps the LAST frame that rounds to each slot, so a tile showed the
//   picture up to half a step after its label (frame 7 at "0:00" on a frame-numbered test). With round=up a
//   tile is the frame on screen at its time; start_time keeps that true when a video starts a little late.
// - --from: decoding starts up to 10 s earlier and fps's start_time makes the cut. Seeking the input straight to
//   --from dropped the frame already on screen there, so the first tile showed the next one (1.3 s later on a
//   variable-frame-rate clip).
// - The length is the video track's own end (its start offset included; MKV/WebM keep it in a DURATION tag, and
//   a file with none is measured from its packets), not the file's, which runs on when the audio is longer.
// - Labels and the header are drawn by libass with the pack fonts (JetBrains Mono, Hind Siliguri), from a
//   temp folder that holds only those fonts, like burn-subs.mjs (no drive colon in filter arguments).
// - A sheet is at most ~1560 px on each side, whatever --cols says, so Claude's image reader sees it unshrunk.
// - A phone's portrait clip stored sideways with a rotation flag is tiled upright, and non-square pixels
//   (1440x1080 shown as 16:9) at their display shape.

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { displaySize, probe } from "./qc.mjs";
import { assTime } from "./srt.mjs";

const WORKSPACE = path.resolve(import.meta.dirname, "..");
const SHEET = 1560; // px, the longest side of a sheet
const GAP = 6; // px between tiles and around them
const HEADER = 44; // px band above the grid for the name, step and page
const STEPS = [0.25, 0.5, 1, 2, 2.5, 5, 10, 15, 20, 30, 60, 120, 300, 600];
const LEAD = 10; // s decoded before --from, so the frame already on screen at --from is still there
const BG = "0x15171a";
const FONTS = [["latin", "JetBrainsMono-Variable.ttf"], ["bengali", "HindSiliguri-Bold.ttf"]];
const OPTIONS = ["every", "from", "to", "cols", "out"];

function fail(msg) {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
}

// 75.5 → "1:15.5", 5 → "0:05", 59.996 → "1:00"
function clock(t) {
  const cs = Math.round(t * 100), m = Math.floor(cs / 6000), s = (cs - m * 6000) / 100;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

// "75.5", "1:15.5", "0:01:15.5" → seconds
function seconds(s) {
  const m = String(s).trim().match(/^(?:(\d+):)?(?:(\d+):)?(\d+(?:\.\d+)?)$/);
  if (!m) return NaN;
  const [h, min] = m[2] !== undefined ? [m[1], m[2]] : [0, m[1] ?? 0];
  return Number(h) * 3600 + Number(min) * 60 + Number(m[3]);
}

// 0.5 → "2/1", 2.5 → "2/5": the frame rate that puts one frame on every step, as an exact fraction.
function rate(step) {
  const n = Math.round(step * 1000), gcd = (a, b) => (b ? gcd(b, a % b) : a), g = gcd(1000, n);
  return `${1000 / g}/${n / g}`;
}

// The video track's length from the start of the file, and its pixel shape.
function videoInfo(file) {
  const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries",
    "stream=start_time,duration,sample_aspect_ratio:stream_tags=DURATION:format=start_time", "-of", "json", file], { encoding: "utf8" });
  const j = r.status === 0 ? JSON.parse(r.stdout) : {};
  const s = j.streams?.[0] ?? {}, zero = Number(j.format?.start_time) || 0;
  const [sn, sd] = String(s.sample_aspect_ratio ?? "1:1").split(":").map(Number);
  const sar = sn > 0 && sd > 0 ? sn / sd : 1;
  let duration = Number(s.duration);
  if (!(duration > 0) && s.tags?.DURATION) duration = seconds(s.tags.DURATION.replace(/(\.\d{3})\d+$/, "$1"));
  if (duration > 0) return { length: (Number(s.start_time) || zero) - zero + duration, sar };
  const p = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "packet=pts_time,duration_time",
    "-of", "csv=p=0", file], { encoding: "utf8", maxBuffer: 1 << 28 });
  let end = NaN;
  for (const line of (p.stdout ?? "").split("\n")) {
    const [pts, dur] = line.split(",").map(Number);
    if (pts >= 0 && !(pts + (dur || 0) <= end)) end = pts + (dur || 0);
  }
  return { length: end - zero, sar };
}

const even = (n) => Math.max(2, Math.floor(n / 2) * 2);
const plain = (t) => t.replace(/[{}\\]/g, "");

function ass(W, H, styles, events) {
  return "\ufeff" + [
    "[Script Info]", "ScriptType: v4.00+", `PlayResX: ${W}`, `PlayResY: ${H}`, "WrapStyle: 2", "ScaledBorderAndShadow: yes", "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    ...styles, "",
    "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ...events.map(([start, end, style, text]) => `Dialogue: 0,${assTime(Math.max(0, start))},${assTime(end)},${style},,0,0,0,,${text}`), "",
  ].join("\n");
}

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => { const [k, ...v] = a.slice(2).split("="); return [k, v.join("=")]; }));
const [videoArg] = args.filter((a) => !a.startsWith("--"));
if (!videoArg) {
  console.log(`Usage: node contact-sheet.mjs <video> [--every=<seconds>] [--from=<time>] [--to=<time>] [--cols=<n>] [--out=<file.png | folder>]
Default: one sheet for the whole video. --every=0.5: a frame every half second, over as many sheets as needed.`);
  process.exit(2);
}
const unknown = Object.keys(flags).find((k) => !OPTIONS.includes(k));
if (unknown !== undefined) fail(`Unknown option --${unknown}. The options are ${OPTIONS.map((o) => `--${o}`).join(", ")}.`);
const video = path.resolve(videoArg);
if (!existsSync(video) || statSync(video).isDirectory()) fail(`Not a video file: ${video}`);
let v;
try {
  v = probe(video);
} catch {
  fail(`FFmpeg can't read ${video} as a video.`);
}
if (!v.width) fail(`${video} has no video stream.`);
const { length, sar } = videoInfo(video);
if (!(length > 0)) fail(`Can't tell how long the video in ${path.basename(video)} is.`);
const [W, H] = displaySize({ ...v, width: Math.round(v.width * sar) });

const from = flags.from !== undefined ? seconds(flags.from) : 0;
const to = flags.to !== undefined ? seconds(flags.to) : length;
if (!(from >= 0 && from < length)) fail(`--from must be a time inside the video (0 to ${clock(length)}), not "${flags.from}".`);
if (!(to > from)) fail(`--to must be a time after --from, not "${flags.to}".`);
const end = Math.min(to, length), span = end - from;

const cols = flags.cols !== undefined ? Number(flags.cols) : W / H >= 1.5 ? 4 : W / H >= 0.7 ? 6 : 8;
if (!(Number.isInteger(cols) && cols >= 1 && cols <= 12)) fail(`--cols must be a whole number from 1 to 12, not "${flags.cols}".`);
const tileW = even(Math.min((SHEET - GAP * (cols + 1)) / cols, ((SHEET - HEADER - 2 * GAP) * W) / H));
const tileH = even((tileW * H) / W);
const maxRows = Math.max(1, Math.floor((SHEET - HEADER - GAP) / (tileH + GAP)));

// The step is kept to whole milliseconds, so the labels and the frame rate agree exactly.
const every = flags.every !== undefined
  ? Math.round(Number(flags.every) * 1000) / 1000
  : STEPS.find((s) => Math.ceil(span / s - 1e-9) <= cols * maxRows) ?? STEPS.at(-1);
if (!(every >= 0.1)) fail(`--every must be a number of seconds, at least 0.1, not "${flags.every}".`);
const tiles = Math.max(1, Math.ceil(span / every - 1e-9));
const rows = Math.min(maxRows, Math.ceil(tiles / cols));
const perPage = cols * rows, pages = Math.ceil(tiles / perPage);
const sheetW = cols * tileW + (cols + 1) * GAP, sheetH = HEADER + rows * tileH + (rows + 1) * GAP;

// Where the sheets go. Only a name the tool made up itself (<video>-sheet) has its earlier pages replaced.
let base = path.join(path.dirname(video), `${path.parse(video).name}-sheet`), own = true;
if (flags.out) {
  const out = path.resolve(flags.out), ext = path.extname(out).toLowerCase();
  if (ext === ".png") [base, own] = [out.slice(0, -4), false];
  else if (/^\.(jpe?g|webp|gif|bmp|tiff?|mp4|mov|mkv)$/.test(ext) || (existsSync(out) && !statSync(out).isDirectory()))
    fail(`--out must be a .png file or a folder, not "${flags.out}".`);
  else base = path.join(out, `${path.parse(video).name}-sheet`);
}
const digits = Math.max(2, String(pages).length);
const files = pages === 1 ? [`${base}.png`] : Array.from({ length: pages }, (_, p) => `${base}-${String(p + 1).padStart(digits, "0")}.png`);

// Labels: one per tile, shown on the frame sampled at its time (frames land on k × every after fps and setpts).
const label = Math.min(26, Math.max(14, Math.round(Math.min(tileW, tileH) * 0.1)));
const tileAss = ass(tileW, tileH,
  [`Style: T,JetBrains Mono,${label},&H00FFFFFF,&H00FFFFFF,&H50000000,&H00000000,-1,0,0,0,100,100,0,0,3,3,0,7,4,4,4,1`],
  Array.from({ length: tiles }, (_, k) => [k * every - every / 2, k * every + every / 2, "T", clock(from + k * every)]));
const name = plain(path.basename(video)).slice(0, 48);
const headAss = ass(sheetW, sheetH,
  [`Style: H,Hind Siliguri,22,&H00E8E8E8,&H00E8E8E8,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,0,0,4,${GAP + 4},${GAP + 4},0,1`],
  Array.from({ length: pages }, (_, p) => {
    const first = p * perPage, last = Math.min(tiles, first + perPage) - 1;
    const text = `${name}   ·   ${clock(from + first * every)} – ${clock(from + last * every)}   ·   প্রতি ${every} সেকেন্ডে একটা ছবি   ·   ${W}×${H}${pages > 1 ? `   ·   পাতা ${p + 1}/${pages}` : ""}`;
    return [first * every - every / 2, (last + 1) * every, "H", `{\\pos(${GAP + 4},${HEADER / 2})}${text}`];
  }));

// Makes the sheets in the temp folder and copies them into place; returns what went wrong, if anything.
function make(work, replaced) {
  mkdirSync(path.join(work, "fonts"));
  for (const [dir, file] of FONTS) cpSync(path.join(WORKSPACE, "assets", "fonts", dir, file), path.join(work, "fonts", file));
  writeFileSync(path.join(work, "tiles.ass"), tileAss);
  writeFileSync(path.join(work, "head.ass"), headAss);
  const seek = Math.max(0, from - LEAD);
  const vf = [
    `fps=fps=${rate(every)}:start_time=${+(from - seek).toFixed(6)}:round=up`, `trim=end_frame=${tiles}`, "setpts=PTS-STARTPTS",
    `scale=${tileW}:${tileH}:flags=lanczos`, "setsar=1", "format=rgb24", "ass=tiles.ass:fontsdir=fonts",
    `tile=${cols}x${rows}:padding=${GAP}:margin=${GAP}:color=${BG}`, `pad=iw:ih+${HEADER}:0:${HEADER}:color=${BG}`,
    "ass=head.ass:fontsdir=fonts",
  ].join(",");
  const input = [...(seek > 0 ? ["-ss", String(seek)] : []), "-t", String(end - seek + 1), "-i", video];
  const output = pages === 1 ? ["-frames:v", "1", "-update", "1", "page.png"] : ["-start_number", "1", "page-%04d.png"];
  const status = spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", ...input, "-an", "-vf", vf, ...output],
    { cwd: work, stdio: ["ignore", "inherit", "inherit"] }).status;
  if (status !== 0) return "FFmpeg could not make the contact sheet (see the message above).";
  const made = pages === 1 ? ["page.png"] : files.map((_, p) => `page-${String(p + 1).padStart(4, "0")}.png`);
  const missing = made.filter((f) => !existsSync(path.join(work, f)) || statSync(path.join(work, f)).size === 0);
  if (missing.length) return `FFmpeg finished, but ${missing.length} of ${pages} sheets are missing; nothing was replaced.`;

  mkdirSync(path.dirname(base), { recursive: true });
  made.forEach((f, p) => cpSync(path.join(work, f), files[p]));
  const same = new RegExp(`^${path.basename(base).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(-\\d{2,3})?\\.png$`, "i");
  for (const f of readdirSync(path.dirname(base))) {
    const full = path.join(path.dirname(base), f);
    if (!same.test(f) || files.some((n) => path.resolve(n) === full)) continue;
    if (own) rmSync(full);
    replaced.push(f);
  }
  return null;
}

// The temp folder is always removed, including when FFmpeg fails (fail() exits without finally).
const work = mkdtempSync(path.join(os.tmpdir(), "contact-sheet-"));
const started = Date.now();
const replaced = [];
let problem;
try {
  problem = make(work, replaced);
} finally {
  rmSync(work, { recursive: true, force: true });
}
if (problem) fail(problem);

const secs = ((Date.now() - started) / 1000).toFixed(1);
console.log(`\n✓ ${pages === 1 ? "Contact sheet" : `${pages} contact sheets`}: ${tiles} frame${tiles > 1 ? "s" : ""}, every ${every} s, ${clock(from)}–${clock(end)}, ${W}x${H} (${secs} s)`);
files.forEach((f, p) => {
  const first = p * perPage, last = Math.min(tiles, first + perPage) - 1;
  console.log(`  ${f}   ${clock(from + first * every)}–${clock(from + last * every)}`);
});
if (replaced.length) console.log(own ? `  Removed ${replaced.length} older page(s) of this sheet.` : `  Left alone (same name, not written now): ${replaced.join(", ")}`);
