// lib.mjs — shared helpers for the episode pipeline (tools/episode/*.mjs).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export const WORKSPACE = path.resolve(import.meta.dirname, "..", "..");
export const PY = path.join(WORKSPACE, "tools", "pyenv", "Scripts", "python.exe");

export function fail(msg) {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
}

export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 30, ...opts });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`${path.basename(cmd)} failed (${r.status}):\n${(r.stderr || "").slice(-2000)}`);
  return r;
}

export const ffmpeg = (args, opts) => run("ffmpeg", ["-hide_banner", "-v", "error", "-y", ...args], opts);
export const ffmpegInfo = (args, opts) => run("ffmpeg", ["-hide_banner", "-v", "info", ...args], opts).stderr;

export function duration(file) {
  return Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).stdout.trim());
}

export function loudness(file) {
  const e = ffmpegInfo(["-i", file, "-af", "ebur128=peak=true:framelog=quiet", "-f", "null", "-"]);
  return { I: Number(e.match(/I:\s+(-?[\d.]+) LUFS/)?.[1]), LRA: Number(e.match(/LRA:\s+(-?[\d.]+) LU/)?.[1]), TP: Number(e.match(/Peak:\s+(-?[\d.]+) dBFS/)?.[1]) };
}

// Two-pass loudnorm to an exact level (linear when the peaks allow it).
export function loudnormArgs(file, I, TP = -1.5) {
  const m = ffmpegInfo(["-i", file, "-af", `loudnorm=I=${I}:TP=${TP}:LRA=20:print_format=json`, "-f", "null", "-"]);
  const j = JSON.parse(m.slice(m.lastIndexOf("{"), m.lastIndexOf("}") + 1));
  return `loudnorm=I=${I}:TP=${TP}:LRA=20:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
}

export function readJSON(file) {
  return JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

export function writeJSON(file, data) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 1) + "\n");
}

// Episode config: paths are resolved relative to the config file.
export function loadEpisode(configPath) {
  const file = path.resolve(configPath.endsWith(".json") ? configPath : path.join(configPath, "episode.json"));
  if (!existsSync(file)) fail(`No episode config at ${file}`);
  const ep = readJSON(file);
  const dir = path.dirname(file);
  const abs = (p) => (p ? path.resolve(dir, p) : p);
  ep.dir = dir;
  ep.source = Object.fromEntries(Object.entries(ep.source).map(([k, v]) => [k, abs(v)]));
  ep.work = abs(ep.work);
  mkdirSync(ep.work, { recursive: true });
  ep.fps ??= 30;
  return ep;
}

// "[00:01:06 - 00:01:16] বাংলা লেখা (romanised)" → [{start, end, text}]. The trailing bracket is dropped only when it
// holds no Bengali letters, so "অবসোলিট (Obsolete)" inside a line stays.
export function parseTimedText(file) {
  const raw = readFileSync(file, "utf8").replace(/^\uFEFF/, "").replace(/\r/g, "");
  const sec = (s) => s.split(":").reduce((a, b) => a * 60 + Number(b), 0);
  const out = [];
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*\[(\d+:\d+(?::\d+)?(?:\.\d+)?)\s*[-–]\s*(\d+:\d+(?::\d+)?(?:\.\d+)?)\]\s*(.+)$/);
    if (!m) continue;
    let text = m[3].trim();
    const open = text.lastIndexOf(" (");
    if (open > 0 && text.endsWith(")") && !/[\u0980-\u09FF]/.test(text.slice(open))) text = text.slice(0, open).trim();
    out.push({ start: sec(m[1]), end: sec(m[2]), text: text.normalize("NFC") });
  }
  return out;
}

// Source → output time through the kept segments (cuts_map.json). A source time inside a removed stretch maps to
// the start of the next kept piece. `which` picks the main copy or the cold-open copy of a repeated range.
export function makeMapper(map, which = "main") {
  const segs = map.segments.filter((s) => s.part === which);
  return (t) => {
    for (const s of segs) {
      if (t < s.src0) return s.out0;
      if (t < s.src1) return s.out0 + (t - s.src0);
    }
    const last = segs[segs.length - 1];
    return last.out1;
  };
}

export const round3 = (x) => Math.round(x * 1000) / 1000;
