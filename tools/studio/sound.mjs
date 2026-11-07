#!/usr/bin/env node
// sound.mjs — writes a piece's whole soundtrack into its index.html from piece.json (Motion Studio kit, v1, 2026-11-07).
//
//   node tools/studio/sound.mjs projects/<piece>            (re-run after every change to piece.json "sound")
//
// piece.json → "sound": {
//   "music": { "track": "studio-pulse", "from": 6.1, "gain": 0.55, "fadeIn": 0.4, "fadeOut": 1.6,
//              "duck": [[t0, t1, level], …] },           // optional: dip the music under a voice line / a hit
//   "voice": { "file": "assets/voice/vo.wav", "at": 0.6, "gain": 1.0 },           // optional
//   "cues":  [ { "t": 1.20, "sfx": "whoosh-short", "gain": 0.5 }, … ]           // t = the VISUAL hit time
// }
// What it does (the house sound contract, CLAUDE.md §0d rule 7, docs/craft-reference.md §4d):
//   - every cue starts at  t − lead_s  (assets/sfx/manifest.json), so the sound's attack lands on the frame;
//   - overlapping cues are packed onto separate lanes (data-track-index 20, 21, 22 …);
//   - the sfx files are copied into the piece (assets/sfx/), the music from VideoWork/studio-music (git-ignored);
//   - the music gets a volume lane: fade in, optional ducks, fade out to 0 at the end (no hard stop);
//   - checks: a cue outside the video, an unknown sfx, music shorter than needed, and DEAD AIR: a stretch
//     ≥ 1.5 s with no music, no voice and no cue sound (qc.mjs WARN; STYLE.md §৫).
// The tags go between <!-- studio:audio:start --> and <!-- studio:audio:end --> inside the root.

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..", "..");
const MUSIC_DIR = "C:/Users/Zubayer Nibir/VideoWork/studio-music";
const dir = path.resolve(process.argv[2] || "");
if (!process.argv[2] || !existsSync(path.join(dir, "piece.json"))) {
  console.log("Usage: node tools/studio/sound.mjs projects/<piece>   (needs piece.json)");
  process.exit(1);
}
const piece = JSON.parse(readFileSync(path.join(dir, "piece.json"), "utf8"));
const snd = piece.sound || {};
const DUR = +piece.duration;
const manifest = JSON.parse(readFileSync(path.join(WS, "assets", "sfx", "manifest.json"), "utf8"));
const probe = (f) => +spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" }).stdout.trim();
const r3 = (v) => Math.round(v * 1000) / 1000;
const errors = [], warns = [], tags = [];
const audible = []; // [start, end] stretches that carry sound

// ---- music
if (snd.music && snd.music.track) {
  const m = snd.music;
  const srcName = m.track.endsWith(".mp3") ? m.track : m.track + ".mp3";
  const src = existsSync(path.join(dir, "assets", "music", srcName)) ? path.join(dir, "assets", "music", srcName) : path.join(MUSIC_DIR, srcName);
  if (!existsSync(src)) errors.push(`music track not found: ${srcName} (looked in assets/music and ${MUSIC_DIR})`);
  else {
    mkdirSync(path.join(dir, "assets", "music"), { recursive: true });
    const dst = path.join(dir, "assets", "music", srcName);
    if (path.resolve(src) !== path.resolve(dst)) copyFileSync(src, dst);
    const beats = src.replace(/\.mp3$/, ".beats.json");
    if (existsSync(beats) && path.resolve(beats) !== path.resolve(dst.replace(/\.mp3$/, ".beats.json"))) copyFileSync(beats, dst.replace(/\.mp3$/, ".beats.json"));
    const from = +(m.from || 0), len = probe(dst);
    const start = +(m.at || 0);
    const playable = Math.min(DUR - start, len - from);
    if (len - from < DUR - start - 0.05) warns.push(`music runs out at ${r3(start + len - from)} s (video ${DUR} s): pick an earlier "from" or extend it (tools/music-extend.mjs)`);
    const fi = +(m.fadeIn ?? 0.3), fo = +(m.fadeOut ?? Math.min(2.5, playable / 4));
    const pts = [{ t: 0, v: 0 }, { t: r3(fi), v: 1 }];
    for (const [a, b, lvl] of m.duck || []) {
      const ta = a - start, tb = b - start;
      if (ta <= fi + 0.15) {
        // a duck that starts inside (or right after) the fade-in: fade in straight TO the duck level — no swell up to 1
        // and no points out of order (builder A4's note, 2026-11-08)
        pts[1].v = lvl;
        pts.push({ t: r3(Math.max(fi, tb)), v: lvl }, { t: r3(Math.max(fi, tb) + 0.25), v: 1 });
      } else {
        pts.push({ t: r3(Math.max(fi, ta - 0.15)), v: 1 }, { t: r3(ta), v: lvl }, { t: r3(tb), v: lvl }, { t: r3(tb + 0.25), v: 1 });
      }
    }
    pts.push({ t: r3(Math.max(fi, playable - fo)), v: 1 }, { t: r3(playable), v: 0 });
    pts.sort((a, b) => a.t - b.t);
    const lane = JSON.stringify({ version: 1, lanes: [{ target: "volume", points: pts }] });
    tags.push(`<audio id="bgm" src="assets/music/${srcName}" data-start="${r3(start)}" data-duration="${r3(playable)}" data-media-start="${r3(from)}" data-track-index="10" data-volume="${m.gain ?? 0.55}" data-automation='${lane}'></audio>`);
    audible.push([start + fi * 0.5, start + playable - 0.2]);
  }
}

// ---- voice
if (snd.voice && snd.voice.file) {
  const v = snd.voice, f = path.join(dir, v.file);
  if (!existsSync(f)) errors.push(`voice file not found: ${v.file}`);
  else {
    const len = probe(f), at = +(v.at || 0);
    if (at + len > DUR + 0.01) errors.push(`voice ends at ${r3(at + len)} s, past the video (${DUR} s)`);
    tags.push(`<audio id="vo" src="${v.file.replace(/\\/g, "/")}" data-start="${r3(at)}" data-duration="${r3(Math.min(len, DUR - at))}" data-track-index="11" data-volume="${v.gain ?? 1}"></audio>`);
    audible.push([at, at + len]);
  }
}

// ---- cues
const lanes = []; // end time per lane
const cues = (snd.cues || []).slice().sort((a, b) => a.t - b.t);
mkdirSync(path.join(dir, "assets", "sfx"), { recursive: true });
cues.forEach((c, i) => {
  const meta = manifest[c.sfx];
  if (!meta) { errors.push(`cue ${i} at ${c.t}s: unknown sfx "${c.sfx}" (see assets/sfx/manifest.json)`); return; }
  if (c.t < 0 || c.t > DUR) { errors.push(`cue ${i} "${c.sfx}" at ${c.t}s is outside the video (0–${DUR})`); return; }
  // The visual hit lands on the sound's PEAK for build-up sounds (manifest peak_s: whoosh-cinematic, riser), on the
  // end of its silent lead-in for everything else. "at" places the file start explicitly; "from" skips into the file.
  const from = +(c.from || 0);
  const lead = meta.peak_s != null ? +meta.peak_s - from : +(meta.lead_s || 0);
  let start = c.at != null ? +c.at : c.t - lead;
  let skip = from;
  if (start < 0) { skip += -start; start = 0; } // a build that would start before 0 s plays only its tail
  const len = Math.min(+(c.len || meta.duration - skip), meta.duration - skip, DUR - start); // never past the file's end (clip_media_fit)
  if (len <= 0.02) return;
  let lane = lanes.findIndex((end) => end <= start + 1e-6);
  if (lane < 0) { lanes.push(0); lane = lanes.length - 1; }
  lanes[lane] = start + len;
  const src = path.join(WS, "assets", "sfx", meta.file);
  copyFileSync(src, path.join(dir, "assets", "sfx", meta.file));
  // A sound cut short gets a fade: 80 ms when "len" trims it on purpose; when the VIDEO END cuts it, min(0.8 s, len/3)
  // — a sustained bass hit stopping dead on the last frame was a hard cut (the CD1 critic, 2026-11-08).
  const cutByEnd = !c.len && start + (meta.duration - skip) > DUR + 0.005;
  const fadeDur = c.len ? 0.08 : cutByEnd ? Math.min(0.8, len / 3) : 0;
  const fadeOut = fadeDur ? `,{"t":${r3(Math.max(0, len - fadeDur))},"v":1},{"t":${r3(len)},"v":0}` : "";
  const auto = fadeOut ? ` data-automation='{"version":1,"lanes":[{"target":"volume","points":[{"t":0,"v":1}${fadeOut}]}]}'` : "";
  const ms = skip > 0.0005 ? ` data-media-start="${r3(skip)}"` : "";
  tags.push(`<audio id="sfx-${String(i + 1).padStart(2, "0")}-${c.sfx}" src="assets/sfx/${meta.file}" data-start="${r3(start)}" data-duration="${r3(len)}"${ms} data-track-index="${20 + lane}" data-volume="${c.gain ?? 0.5}"${auto}></audio>`);
  audible.push([c.t, c.t + Math.min(len, 1.2)]);
});

// ---- dead air (≥ 1.5 s with nothing audible)
audible.sort((a, b) => a[0] - b[0]);
let cursor = 0;
for (const [a, b] of audible) { if (a - cursor >= 1.5) warns.push(`dead air ${r3(cursor)}–${r3(a)} s (no music, voice or cue)`); cursor = Math.max(cursor, b); }
if (DUR - cursor >= 1.5) warns.push(`dead air ${r3(cursor)}–${DUR} s at the end`);

// ---- write
const file = path.join(dir, "index.html");
let html = readFileSync(file, "utf8");
const A = "<!-- studio:audio:start -->", B = "<!-- studio:audio:end -->";
if (!html.includes(A) || !html.includes(B)) errors.push("index.html has no <!-- studio:audio:start --> … <!-- studio:audio:end --> markers");
for (const e of errors) console.error("✗ " + e);
for (const w of warns) console.warn("⚠ " + w);
if (errors.length) process.exit(1);
html = html.replace(new RegExp(`${A}[\\s\\S]*?${B}`), `${A}\n    ${tags.join("\n    ")}\n    ${B}`);
writeFileSync(file, html);
console.log(`✓ sound: ${snd.music?.track ? "music " + snd.music.track + ", " : ""}${snd.voice?.file ? "voice, " : ""}${cues.length} cues on ${lanes.length} lane(s)${warns.length ? `, ${warns.length} warning(s)` : ""}`);
