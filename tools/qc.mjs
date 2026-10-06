#!/usr/bin/env node
// qc.mjs — quality check for a finished video, before it goes to a client or a platform.
//
//   node "E:/Video Create/tools/qc.mjs" <video.mp4> [--w=1920 --h=1080 --fps=30 --dur=45 --lufs=-14 --json=qc.json]
//
// FAIL = must fix before delivery: wrong codec/pixel format, wrong size/fps/duration, no faststart
//        (slow start on the web), loudness more than 1 LU off target, true peak above -1 dBTP,
//        a thin black strip along an edge (render defect).
// WARN = look at it: no audio track, a silent audio track, black in the middle (≥0.5 s),
//        a frozen picture ≥5 s, missing BT.709 colour tags, "dead air" (a still picture and
//        silence together for ≥1.5 s: the moment a viewer scrolls away).
// freezedetect n=0.001, not 0.003: at 0.003 a slow move (0.4 px/frame) read as 32 "freezes" in a
// 250 s test, while 0.001 still catches a truly frozen picture (verified 2026-10-05).
// INFO = normal for motion graphics, listed so nothing is hidden: black at the very start/end
//        (fades), shorter freezes (typography holds), silences ≥2 s.
// Exit code 1 if anything FAILs. Also importable: `import { qc } from "./qc.mjs"`.

import { spawnSync } from "node:child_process";
import { closeSync, openSync, readSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const run = (cmd, args) => spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });

// True when the moov atom comes before mdat, i.e. the file can start playing before it fully downloads.
function isFaststart(file) {
  const fh = openSync(file, "r");
  const b = Buffer.alloc(16);
  const order = [];
  let off = 0;
  try {
    for (let i = 0; i < 12; i++) {
      if (readSync(fh, b, 0, 16, off) < 8) break;
      let size = b.readUInt32BE(0);
      order.push(b.toString("latin1", 4, 8));
      if (size === 1) size = Number(b.readBigUInt64BE(8));
      if (size < 8) break;
      off += size;
    }
  } finally {
    closeSync(fh);
  }
  const moov = order.indexOf("moov");
  return moov !== -1 && (order.indexOf("mdat") === -1 || moov < order.indexOf("mdat"));
}

export function probe(file) {
  const r = run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file]);
  if (r.status !== 0) throw new Error(`ffprobe could not read ${file}: ${r.stderr.trim()}`);
  const p = JSON.parse(r.stdout);
  const v = p.streams.find((s) => s.codec_type === "video");
  const a = p.streams.find((s) => s.codec_type === "audio");
  const [fn, fd] = (v?.avg_frame_rate || v?.r_frame_rate || "0/1").split("/").map(Number);
  return {
    width: v?.width ?? null,
    height: v?.height ?? null,
    fps: fd ? +(fn / fd).toFixed(3) : null,
    duration: +(+p.format.duration).toFixed(3),
    vduration: v?.duration ? +(+v.duration).toFixed(3) : null,
    vcodec: v?.codec_name ?? null,
    pix_fmt: v?.pix_fmt ?? null,
    color: v ? `${v.color_range ?? "?"}/${v.color_space ?? "?"}/${v.color_transfer ?? "?"}/${v.color_primaries ?? "?"}` : null,
    acodec: a?.codec_name ?? null,
    sample_rate: a ? Number(a.sample_rate) : null,
    channels: a?.channels ?? null,
    bitrate_kbps: Math.round(Number(p.format.bit_rate) / 1000),
    size_mb: +(Number(p.format.size) / 1048576).toFixed(2),
    faststart: isFaststart(file),
  };
}

// Edges: an 8 px band along an edge that is pure black in every sampled frame while the picture right next to it
// is not. HyperFrames' 1080-wide renders lost their right 8 px exactly like this (FFmpeg 8.1.1's gbrp→YUV bug,
// 2026-10-06). Letterbox bars are wider than 8 px, so the band next to them is black too and they don't trigger.
function edgeStrips(file, spec) {
  const W = spec.width, H = spec.height, B = 8, bands = { left: [], right: [], top: [], bottom: [] };
  if (!W || !H || !spec.duration) return [];
  for (let i = 1; i <= 6; i++) {
    const r = spawnSync("ffmpeg", ["-v", "error", "-ss", String((spec.duration * i) / 7), "-i", file, "-frames:v", "1", "-vf", "format=gray", "-f", "rawvideo", "-"], { maxBuffer: 256 * 1024 * 1024 });
    const px = r.stdout;
    if (!px || px.length < W * H) continue;
    const mean = (x0, y0, w, h) => { let s = 0; for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) s += px[y * W + x]; return s / (w * h); };
    bands.right.push([mean(W - B, 0, B, H), mean(W - 2 * B, 0, B, H)]);
    bands.left.push([mean(0, 0, B, H), mean(B, 0, B, H)]);
    bands.bottom.push([mean(0, H - B, W, B), mean(0, H - 2 * B, W, B)]);
    bands.top.push([mean(0, 0, W, B), mean(0, B, W, B)]);
  }
  return Object.entries(bands).filter(([, s]) => s.length && s.every(([o]) => o <= 2) && s.some(([, inner]) => inner > 12)).map(([k]) => k);
}

export function qc(file, expect = {}) {
  const spec = probe(file);
  const lufs = expect.lufs ?? -14;
  const tpMax = expect.tp ?? -1;
  const checks = [];
  const add = (level, name, value, note = "") => checks.push({ level, name, value: String(value), note });

  // One decode pass for all detectors.
  const hasA = !!spec.acodec;
  const graph =
    "[0:v]blackdetect=d=0.5:pix_th=0.03,freezedetect=n=0.001:d=2[vo]" +
    (hasA ? ";[0:a]silencedetect=n=-50dB:d=2,ebur128=peak=true[ao]" : "");
  const r = run("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-filter_complex", graph, "-map", "[vo]", ...(hasA ? ["-map", "[ao]"] : []), "-f", "null", "-"]);
  const log = r.stderr;
  const nums = (re) => [...log.matchAll(re)].map((m) => m.slice(1).map(Number));
  const black = nums(/black_start:([\d.]+) black_end:([\d.]+)/g);
  const freezes = [];
  {
    const starts = nums(/freeze_start: ([\d.]+)/g).map((x) => x[0]);
    const ends = nums(/freeze_end: ([\d.]+)/g).map((x) => x[0]);
    starts.forEach((s, i) => freezes.push([s, ends[i] ?? spec.duration]));
  }
  const silences = [];
  {
    const starts = nums(/silence_start: (-?[\d.]+)/g).map((x) => Math.max(0, x[0]));
    const ends = nums(/silence_end: ([\d.]+)/g).map((x) => x[0]);
    starts.forEach((s, i) => silences.push([s, ends[i] ?? spec.duration]));
  }
  const summary = log.slice(log.lastIndexOf("Summary:"));
  const I = hasA ? Number((summary.match(/I:\s+(-?[\d.]+|-inf) LUFS/) || [])[1]) : null;
  const TP = hasA ? Number((summary.match(/Peak:\s+(-?[\d.]+|-inf) dBFS/) || [])[1]) : null;
  const span = ([s, e]) => `${s.toFixed(1)}–${e.toFixed(1)} s`;
  const list = (a) => (a.length <= 4 ? a.map(span).join(", ") : `${a.slice(0, 3).map(span).join(", ")} … and ${a.length - 3} more`);

  add(spec.vcodec === "h264" && spec.pix_fmt === "yuv420p" ? "PASS" : "FAIL", "codec", `${spec.vcodec}/${spec.pix_fmt}`, "h264/yuv420p plays everywhere");
  if (expect.w && expect.h) add(spec.width === expect.w && spec.height === expect.h ? "PASS" : "FAIL", "size", `${spec.width}x${spec.height}`, `expected ${expect.w}x${expect.h}`);
  else add("PASS", "size", `${spec.width}x${spec.height}`);
  if (expect.fps) add(Math.abs(spec.fps - expect.fps) < 0.01 ? "PASS" : "FAIL", "fps", spec.fps, `expected ${expect.fps}`);
  else add("PASS", "fps", spec.fps);
  if (expect.dur) add(Math.abs(spec.duration - expect.dur) <= 0.15 ? "PASS" : "FAIL", "duration", `${spec.duration} s`, `expected ${expect.dur} s`);
  else add("PASS", "duration", `${spec.duration} s`);
  add(spec.faststart ? "PASS" : "FAIL", "faststart", spec.faststart, "starts playing before it fully downloads");
  add((spec.color ?? "").split("bt709").length - 1 >= 3 ? "PASS" : "WARN", "colour tags", spec.color, "matrix/transfer/primaries all bt709");
  const strips = edgeStrips(file, spec);
  add(strips.length ? "FAIL" : "PASS", "edges", strips.length ? `black strip: ${strips.join(", ")}` : "clean",
    strips.length ? "a thin pure-black band at the frame edge in every sample — a render defect (CLAUDE.md: FFmpeg gbrp edge bug)" : "no black strip at any edge");

  if (!hasA) add("WARN", "audio", "none", "no audio track — fine only for a silent video");
  else if (!Number.isFinite(I) || I < -70) add("WARN", "audio", `${I} LUFS`, "the audio track is silent");
  else {
    add(Math.abs(I - lufs) <= 1 ? "PASS" : "FAIL", "loudness", `${I} LUFS`, `target ${lufs} ±1`);
    add(TP <= tpMax ? "PASS" : "FAIL", "true peak", `${TP} dBTP`, `max ${tpMax}`);
  }

  const edge = ([s, e]) => s <= 0.2 || e >= spec.duration - 0.2;
  const midBlack = black.filter((b) => !edge(b));
  if (midBlack.length) add("WARN", "black frames", list(midBlack), "black in the middle — intended?");
  if (black.length > midBlack.length) add("INFO", "black at start/end", list(black.filter(edge)), "normal for fades");
  const longFreeze = freezes.filter(([s, e]) => e - s >= 5);
  if (longFreeze.length) add("WARN", "frozen picture", list(longFreeze), "nothing moves for 5 s or more");
  if (freezes.length > longFreeze.length) add("INFO", "still moments", list(freezes.filter(([s, e]) => e - s < 5)), "normal holds");
  if (silences.length) add("INFO", "silences", list(silences), "gaps of 2 s or more in the sound");
  // Dead air: a still picture AND silence at the same moment — where a viewer scrolls away.
  const dead = [];
  for (const [fs, fe] of freezes) for (const [ss, se] of silences) {
    const s = Math.max(fs, ss), e = Math.min(fe, se);
    if (e - s >= 1.5) dead.push([s, e]);
  }
  if (dead.length && hasA) add("WARN", "dead air", list(dead), "nothing moves and nothing is heard — add motion, a sound or music");

  const ok = !checks.some((c) => c.level === "FAIL");
  return { file, ok, spec, loudness: hasA ? { I, TP } : null, checks };
}

export function printQc(result) {
  for (const c of result.checks) console.log(`  ${c.level.padEnd(4)}  ${c.name.padEnd(18)} ${c.value}${c.note ? `   (${c.note})` : ""}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv[2];
  if (!file) {
    console.log("Usage: node qc.mjs <video.mp4> [--w= --h= --fps= --dur= --lufs=-14 --json=qc.json]");
    process.exit(2);
  }
  const opt = Object.fromEntries(process.argv.slice(3).map((a) => a.replace(/^--/, "").split("=")));
  const num = (k) => (opt[k] !== undefined ? Number(opt[k]) : undefined);
  const res = qc(file, { w: num("w"), h: num("h"), fps: num("fps"), dur: num("dur"), lufs: num("lufs") });
  console.log(`QC ${res.ok ? "✓ PASSED" : "✗ FAILED"}: ${file}`);
  printQc(res);
  if (opt.json) writeFileSync(opt.json, JSON.stringify(res, null, 2));
  process.exit(res.ok ? 0 : 1);
}
