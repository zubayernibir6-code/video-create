#!/usr/bin/env node
// music-pick.mjs — background music from the workspace library into a HyperFrames project.
//
//   node "E:/Video Create/tools/music-pick.mjs" list
//   node "E:/Video Create/tools/music-pick.mjs" pick <mood> --project=<folder> [--narration] [--insert] [--track=<file name>]
//
// Library layout (the user fills it by hand from pixabay.com/music — the Pixabay API has no music endpoint):
//   assets/music/<mood>/<track>.mp3      e.g. assets/music/calm/…, assets/music/upbeat/…
//   keep Pixabay's licence certificate next to the track (any .pdf whose name starts with the track's name).
//
// pick: chooses a track at least as long as the project (from its root data-duration), otherwise the longest.
// It cuts it to length with a 2.5 s fade-out (0.5 s fade-in), normalises it to -16 LUFS and writes
// <project>/assets/music/bgm.mp3, then prints — or with --insert, adds right after the root element — the tag:
//   <audio id="bgm" src="assets/music/bgm.mp3" data-start="0" data-duration="…" data-track-index="9" data-volume="…">
// data-volume is 0.13 under narration (about 18 dB below a -16 LUFS voice) and 0.8 when the music carries
// the video alone. tools/finish.mjs then brings the whole mix to -14 LUFS.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const WORKSPACE = path.resolve(import.meta.dirname, "..");
const AUDIO_EXT = /\.(mp3|wav|m4a|ogg|flac)$/i;

function fail(msg) {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => { const [k, ...v] = a.slice(2).split("="); return [k, v.join("=") || true]; }));
const [cmd, mood] = args.filter((a) => !a.startsWith("--"));
const LIB = path.resolve(flags.library ?? path.join(WORKSPACE, "assets", "music"));

function probe(file) {
  const d = Number(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" }).stdout.trim());
  const log = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-vn", "-af", "ebur128", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 26 }).stderr;
  const I = Number(log.slice(log.lastIndexOf("Summary:")).match(/I:\s+(-?[\d.]+) LUFS/)?.[1]);
  return { duration: d, lufs: I };
}

function library() {
  if (!existsSync(LIB)) return [];
  const out = [];
  for (const m of readdirSync(LIB)) {
    const dir = path.join(LIB, m);
    if (!statSync(dir).isDirectory()) continue;
    const files = readdirSync(dir);
    for (const f of files.filter((x) => AUDIO_EXT.test(x))) {
      const base = path.parse(f).name.toLowerCase();
      const cert = files.find((x) => /\.pdf$/i.test(x) && x.toLowerCase().startsWith(base.slice(0, 20)));
      out.push({ mood: m, file: path.join(dir, f), name: f, cert: cert ?? null });
    }
  }
  return out;
}

if (cmd === "list") {
  const tracks = library();
  if (!tracks.length) {
    console.log(`No music yet in ${LIB}.\nDownload tracks from https://pixabay.com/music/ into mood folders, e.g. ${path.join(LIB, "calm")} (see assets/music/README.md).`);
    process.exit(0);
  }
  const index = [];
  for (const t of tracks) {
    const p = probe(t.file);
    index.push({ mood: t.mood, file: path.relative(LIB, t.file).replace(/\\/g, "/"), duration: +p.duration.toFixed(1), lufs: p.lufs, licence_certificate: t.cert });
    console.log(`  ${t.mood.padEnd(12)} ${t.name.slice(0, 44).padEnd(44)} ${p.duration.toFixed(0).padStart(4)} s  ${String(p.lufs).padStart(6)} LUFS  ${t.cert ? "✓ certificate" : "⚠ no certificate"}`);
  }
  writeFileSync(path.join(LIB, "index.json"), JSON.stringify(index, null, 2));
  console.log(`\n${tracks.length} track(s); index written to ${path.join(LIB, "index.json")}`);
} else if (cmd === "pick") {
  if (!mood) fail("Give a mood (a folder name inside assets/music), e.g.  pick calm --project=…");
  if (!flags.project) fail("Give --project=<HyperFrames project folder>.");
  const project = path.resolve(flags.project);
  const html = path.join(project, "index.html");
  if (!existsSync(html)) fail(`${project} has no index.html.`);
  const page = readFileSync(html, "utf8");
  const root = page.match(/<[a-z]+\b[^>]*\bdata-composition-id="[^"]*"[^>]*>/is)?.[0];
  const dur = Number(root?.match(/\bdata-duration="([\d.]+)"/)?.[1]);
  if (!dur) fail("Could not read the root data-duration from index.html.");

  let tracks = library().filter((t) => t.mood.toLowerCase() === mood.toLowerCase());
  if (flags.track) tracks = tracks.filter((t) => t.name === flags.track);
  if (!tracks.length) fail(`No tracks in ${path.join(LIB, mood)}. Moods available: ${[...new Set(library().map((t) => t.mood))].join(", ") || "none yet"}`);
  const withLen = tracks.map((t) => ({ ...t, ...probe(t.file) }));
  const longEnough = withLen.filter((t) => t.duration >= dur).sort((a, b) => a.duration - b.duration);
  const chosen = longEnough[0] ?? withLen.sort((a, b) => b.duration - a.duration)[0];
  if (chosen.duration < dur) console.log(`  ⚠ The longest "${mood}" track is ${chosen.duration.toFixed(0)} s, shorter than the ${dur} s video — it will end early.`);

  const outDir = path.join(project, "assets", "music");
  mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, "bgm.mp3");
  const len = Math.min(dur, chosen.duration);
  const fadeOut = Math.min(2.5, len / 4);
  const pre = `atrim=0:${len},afade=t=in:d=0.5,afade=t=out:st=${(len - fadeOut).toFixed(2)}:d=${fadeOut.toFixed(2)}`;
  const m = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", chosen.file, "-vn", "-af", `${pre},loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json`, "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 26 }).stderr;
  const j = JSON.parse(m.slice(m.lastIndexOf("{"), m.lastIndexOf("}") + 1));
  const lra = Math.max(11, Math.ceil(Number(j.input_lra)) + 1);
  const norm = `loudnorm=I=-16:TP=-1.5:LRA=${lra}:linear=true:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}`;
  const e = spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", "-i", chosen.file, "-vn", "-af", `${pre},${norm},aresample=48000`, "-ac", "2", "-c:a", "libmp3lame", "-b:a", "192k", out], { encoding: "utf8" });
  if (e.status !== 0) fail(`FFmpeg failed: ${e.stderr}`);

  const volume = flags.narration ? 0.13 : 0.8;
  const tag = `<audio id="bgm" src="assets/music/bgm.mp3" data-start="0" data-duration="${+len.toFixed(2)}" data-track-index="9" data-volume="${volume}"></audio>`;
  console.log(`✓ ${chosen.mood}/${chosen.name} → ${out}`);
  console.log(`  ${len.toFixed(1)} s, fade-out ${fadeOut.toFixed(1)} s, -16 LUFS, volume ${volume}${flags.narration ? " (under narration)" : ""}${chosen.cert ? "" : "  ⚠ no licence certificate next to this track"}`);
  if (flags.insert) {
    if (/<audio\b[^>]*\bid="bgm"/.test(page)) fail('index.html already has an <audio id="bgm"> — remove it first or leave out --insert.');
    writeFileSync(html, page.replace(root, `${root}\n      ${tag}`));
    console.log("  inserted into index.html");
  } else {
    console.log(`  add to index.html, inside the root element:\n    ${tag}`);
  }
} else {
  console.log(`Usage:
  node music-pick.mjs list
  node music-pick.mjs pick <mood> --project=<folder> [--narration] [--insert] [--track=<file name>]`);
}
