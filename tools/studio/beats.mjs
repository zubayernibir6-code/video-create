#!/usr/bin/env node
// beats.mjs — the beat map of a music track, so cuts, reveals and sound hits land ON the music.
//
//   node tools/studio/beats.mjs <track.mp3> [more tracks…]
//
// Writes <track>.beats.json beside each track:
//   { bpm, beats: [t…], strong: [t…] (the strongest quarter of the beats), drops: [{t, jump, kind}…],
//     energy: [[t, dB]…] every 0.5 s }
// beats/strong come from HyperFrames' own detector (`hyperframes beats`, run on a throw-away project in %TEMP%);
// drops come from tools/music-drops.mjs (bass band jumps ≥ 9 dB after a quieter stretch).
// How a piece uses it: put the hero reveal on a drop (start the music at drop − reveal time), put scene cuts on
// `strong` beats, put small UI ticks on ordinary beats. tools/studio/sound.mjs reads the same file.
// Verified 2026-11-07 on the 7 studio tracks (VideoWork/studio-music): studio-pulse 185 beats, IBI 0.349 s.

import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, readdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..", "..");
const tracks = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!tracks.length) { console.log("Usage: node tools/studio/beats.mjs <track.mp3> [more…]"); process.exit(1); }
const sh = process.platform === "win32";

for (const track of tracks) {
  const abs = path.resolve(track);
  const dur = +spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", abs], { encoding: "utf8" }).stdout.trim();
  const tmp = mkdtempSync(path.join(os.tmpdir(), "studio-beats-"));
  mkdirSync(path.join(tmp, "assets"));
  const name = "track" + path.extname(abs);
  copyFileSync(abs, path.join(tmp, "assets", name));
  writeFileSync(path.join(tmp, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" } }));
  writeFileSync(path.join(tmp, "index.html"), `<!doctype html><html><head><meta charset="utf-8"></head><body>
<div id="root" data-composition-id="main" data-width="1920" data-height="1080" data-duration="${Math.ceil(dur)}">
<audio id="bgm" src="assets/${name}" data-start="0" data-duration="${Math.ceil(dur)}" data-track-index="10"></audio></div>
<script>window.__timelines["main"] = null;</script></body></html>`);
  const r = spawnSync("hyperframes", ["beats", ".", "--json"], { cwd: tmp, encoding: "utf8", shell: sh, timeout: 180000 });
  let beats = [], strong = [], bpm = 0;
  try {
    const out = JSON.parse(readFileSync(path.join(tmp, "beats", "assets", name + ".json"), "utf8"));
    const list = (out.beats || []).map((b) => ({ t: +b.time, s: +b.strength }));
    beats = list.map((b) => +b.t.toFixed(3));
    const cut = list.map((b) => b.s).sort((a, b) => b - a)[Math.floor(list.length / 4)] ?? 1;
    strong = list.filter((b) => b.s >= cut).map((b) => +b.t.toFixed(3));
    const ibi = beats.slice(1).map((t, i) => t - beats[i]).sort((a, b) => a - b);
    bpm = ibi.length ? Math.round(60 / ibi[Math.floor(ibi.length / 2)]) : 0;
  } catch (e) {
    console.error(`✗ ${path.basename(abs)}: hyperframes beats failed — ${(r.stderr || r.stdout || e.message).slice(-300)}`);
  }
  rmSync(tmp, { recursive: true, force: true });

  // drops + energy map from music-drops.mjs
  const d = spawnSync(process.execPath, [path.join(WS, "tools", "music-drops.mjs"), abs, "--map"], { encoding: "utf8" });
  const drops = [];
  const energy = [];
  let inMap = false;
  for (const line of (d.stdout || "").split(/\r?\n/)) {
    if (/^loudness every/i.test(line.trim())) { inMap = true; continue; }
    if (!inMap) {
      const m = line.match(/^\s*(\d+(?:\.\d+)?)\s*s\s+\+(\d+(?:\.\d+)?)\s*dB\s*(.*)$/);
      if (m) drops.push({ t: +m[1], jump: +m[2], kind: (m[3].match(/\(([^)]+)\)/) || [, m[3].trim()])[1] });
    } else {
      for (const e of line.matchAll(/(\d+(?:\.\d+)?):\s*(-?\d+(?:\.\d+)?)/g)) energy.push([+e[1], +e[2]]);
    }
  }
  // kicks: the detector's beats run at double time on these tracks and "strong" can miss the real downbeats (A2's
  // measurement on bright-future / social-punch / studio-pulse, 2026-11-07). A low-band onset pass finds the kick drum:
  // RMS of the < 150 Hz band every 10 ms → rise over the previous 80 ms → local peaks ≥ 0.2 s apart above 2.5× median.
  const lp = spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-i", abs, "-af", "lowpass=f=150,aresample=22050,asetnsamples=220,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const rms = [];
  for (const line of (lp.stdout || "").split(/\r?\n/)) { const m = line.match(/RMS_level=(-?[\d.]+|-inf)/); if (m) rms.push(m[1] === "-inf" ? 0 : Math.pow(10, +m[1] / 20)); }
  const rise = rms.map((v, i) => { let s = 0, n = 0; for (let j = Math.max(0, i - 8); j < i; j++) { s += rms[j]; n++; } return Math.max(0, v - (n ? s / n : v)); });
  const med = rise.filter((x) => x > 0).sort((a, b) => a - b)[Math.floor(rise.filter((x) => x > 0).length / 2)] || 0;
  const kicks = [];
  for (let i = 1; i < rise.length - 1; i++) {
    if (rise[i] < med * 2.5) continue;
    let peak = true;
    for (let j = Math.max(0, i - 12); j <= Math.min(rise.length - 1, i + 12); j++) if (rise[j] > rise[i]) { peak = false; break; }
    const t = +(i * 0.01).toFixed(2);
    if (peak && (!kicks.length || t - kicks[kicks.length - 1] >= 0.2)) kicks.push(t);
  }
  const kd = kicks.slice(1).map((t, i) => t - kicks[i]).filter((d) => d >= 0.3 && d <= 1.0).sort((a, b) => a - b);
  const kickInterval = kd.length ? +kd[Math.floor(kd.length / 2)].toFixed(3) : null;
  const out = { track: path.basename(abs), duration: +dur.toFixed(3), bpm, beats, strong, kicks, kickInterval, kickBpm: kickInterval ? Math.round(60 / kickInterval) : null, drops, energy, made: new Date().toISOString().slice(0, 10), tool: "tools/studio/beats.mjs" };
  const file = abs.replace(/\.[^.]+$/, "") + ".beats.json";
  writeFileSync(file, JSON.stringify(out, null, 1));
  console.log(`✓ ${path.basename(abs)}  ${dur.toFixed(1)} s  detector ~${bpm} BPM, kicks every ${out.kickInterval ?? "?"} s (~${out.kickBpm ?? "?"} BPM, ${kicks.length})  ${beats.length} beats, ${strong.length} strong, drops at ${drops.map((x) => x.t + "s").join(", ") || "—"}`);
}
