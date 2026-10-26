#!/usr/bin/env node
// cuts.mjs — decides what stays: pauses longer than cuts.minGap shrink to short breaths, manual cuts go, the
// optional cold open is copied to the front, and every kept piece is frame-aligned. Writes <work>/cuts_map.json:
//   { fps, total, coldOpen:{out0,out1}, title:{out0,out1}, main:{out0,out1}, end:{out0,out1},
//     segments:[{part:"cold"|"main", src0, src1, out0, out1}] }
// Every later step (captions, graphics, music, sound effects) maps source times through it, so they stay in sync.
//
//   node tools/episode/cuts.mjs <episode.json>
import path from "node:path";
import { ffmpegInfo, loadEpisode, round3, writeJSON } from "./lib.mjs";

const ep = loadEpisode(process.argv[2] ?? ".");
const c = { silenceDb: -45, minGap: 0.7, padAfter: 0.18, padBefore: 0.12, minKeep: 0.25, manual: [], ...ep.cuts };
const voice = path.join(ep.work, "audio", "voice_master.wav");
const FPS = ep.fps;
const snap = (t) => Math.round(t * FPS) / FPS;

// silences in the mastered voice (source timeline)
const log = ffmpegInfo(["-i", voice, "-af", `silencedetect=noise=${c.silenceDb}dB:d=0.12`, "-f", "null", "-"]);
const starts = [...log.matchAll(/silence_start: (-?[\d.]+)/g)].map((m) => Math.max(0, Number(m[1])));
const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
const dur = Number(log.match(/Duration: (\d+):(\d+):([\d.]+)/).slice(1).reduce((a, b) => a * 60 + Number(b), 0));
const silences = starts.map((s, i) => [s, ends[i] ?? dur]);
const firstSpeech = silences[0]?.[0] === 0 ? silences[0][1] : 0;
const lastSpeech = silences.at(-1)?.[1] >= dur - 0.01 ? silences.at(-1)[0] : dur;

// removals: long pauses shrunk, manual cuts, head and tail
const remove = [];
for (const [s, e] of silences) if (e - s >= c.minGap && s > firstSpeech && e < lastSpeech) remove.push([s + c.padAfter, e - c.padBefore]);
for (const [a, b] of c.manual) remove.push([a, b]);
remove.sort((x, y) => x[0] - y[0]);
const merged = [];
for (const r of remove) {
  const last = merged.at(-1);
  if (last && r[0] <= last[1] + c.minKeep) last[1] = Math.max(last[1], r[1]);
  else merged.push([...r]);
}
function keep(from, to) {
  const out = [];
  let t = from;
  for (const [a, b] of merged) {
    if (b <= from || a >= to) continue;
    if (a > t) out.push([t, a]);
    t = Math.max(t, b);
  }
  if (to > t) out.push([t, to]);
  return out.map(([a, b]) => [snap(a), snap(b)]).filter(([a, b]) => b - a >= c.minKeep);
}

const segments = [];
let out = 0;
const place = (part, pieces) => {
  for (const [a, b] of pieces) {
    segments.push({ part, src0: round3(a), src1: round3(b), out0: round3(out), out1: round3(out + (b - a)) });
    out = snap(out + (b - a));
  }
};
const map = { fps: FPS, source: ep.source.video };
if (ep.coldOpen) {
  map.coldOpen = { out0: 0 };
  place("cold", keep(ep.coldOpen.from, ep.coldOpen.to));
  map.coldOpen.out1 = round3(out);
}
if (ep.titleCard) {
  map.title = { out0: round3(out), out1: round3(out + ep.titleCard) };
  out = snap(out + ep.titleCard);
}
map.main = { out0: round3(out) };
// ep.range = [from, to] (source s) makes a clip (a Reel) out of one stretch instead of the whole recording
place("main", ep.range ? keep(ep.range[0], ep.range[1]) : keep(Math.max(0, firstSpeech - 0.25), Math.min(dur, lastSpeech + 0.5)));
map.main.out1 = round3(out);
// ep.cliff = seconds the last picture stays frozen after the last word (a Reel that ends on a cliffhanger)
if (ep.cliff) {
  map.cliff = { out0: round3(out), out1: round3(out + ep.cliff) };
  out = snap(out + ep.cliff);
}
if (ep.endCard) {
  map.end = { out0: round3(out), out1: round3(out + ep.endCard) };
  out = snap(out + ep.endCard);
}
map.total = round3(out);
map.segments = segments;
map.removed = merged.map(([a, b]) => [round3(a), round3(b)]);
writeJSON(path.join(ep.work, "cuts_map.json"), map);
const cutTime = merged.reduce((a, [x, y]) => a + (y - x), 0);
console.log(`source ${dur.toFixed(1)} s → ${segments.length} pieces, ${merged.length} cuts (${cutTime.toFixed(1)} s removed); episode ${map.total.toFixed(2)} s`);
