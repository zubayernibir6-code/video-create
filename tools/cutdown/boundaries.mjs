#!/usr/bin/env node
// boundaries.mjs — is every cut of a cut-down on a pause, so no word is heard clipped? (cut.mjs runs it first)
//
//   node tools/cutdown/boundaries.mjs projects/<name>      → every flagged spoken cut, exit 1 on ERROR
//   import { checkBoundaries } from "./boundaries.mjs"     → [{ seg, side, at, level, msg, fix }]
//
// Each spoken piece's start (`from`) and end (`to`), in master seconds, is checked against the SOUND: the master
// minus its music bed (cutdown.json `bed`, same timeline). 20 ms frames ≥ 15 dB over the bed, above −40 dB and
// within 20 dB of the local peak are speech; gaps under 60 ms are merged. A cut on a dip (±20 ms ≥ 12 dB under the
// peak, e.g. between two words of fast speech) splits the run there.
//   inside  a speech run goes on across the cut → ERROR (a word clipped, its onset or its end).
//   stray   a run of ≥ 0.1 s with ≥ 60 ms as loud as a word (within 10 dB of the peak: not a click or a breath)
//           that STARTS less than 0.5 s before an END cut, after a pause → ERROR: a new sentence's first word
//           or two is heard and cut off ("…দিয়ে এবং", "Medium। এবং আমি"). There is no mirror rule on a start cut:
//           a short first word and a pause is normal speech.
//   words   a word of the master's word list (captions.json `extra` entries with `at`, e.g. master.words.json) runs
//           across the cut → ERROR, unless the sound has a pause there (ASR word edges are loose, ±0.3 s).
//   phantom a caption word within 0.6 s of a cut, inside the piece, with nothing under it even 8 dB over the music (the ASR heard music:
//           "এবং" 78.36 at Universal Reel 2's piece end showed "এবং এবং এর") → ERROR, drop it by index in captions.json.
//   fix     the middle of the nearest pause of ≥ 0.12 s (for a stray word: the pause before it), for cutdown.json.
// A cut that joins two spoken pieces with no time between them (a face piece and a screen piece) is not checked.
// `cutOk: ["from" | "to"]` on a segment accepts a flagged side on purpose.
// Why: Universal Reel 4 and LinkedIn cut 1 (2026-10-30) ended at master 477.75, which the word list put inside
// "এবং" (477.55–477.93); the sound shows "দিয়ে" ending at 477.15 and "এবং" at 477.45–477.70, so both videos
// ended "…নির্দেশনা দিয়ে এবং". Found by listening to the renders' levels; 10 more such cuts were in the same set.
// Verified 2026-10-30 on claude-ureel-1..4, claude-li-1, claude-reel-1..4, claude-ig-1..2: every flagged cut was
// checked by its 10 ms levels and words; pauses, a fast "দেব।|দিয়ে" dip and mouth clicks pass.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const readJSON = (f) => JSON.parse(readFileSync(f, "utf8").replace(/^﻿/, ""));
const FRAME = 0.02, SPEECH_DB = 15, FLOOR_DB = -40, BELOW_PEAK = 20, DIP = 12, WORD = 10;
const NEAR = 0.5, PAUSE = 0.12, STRAY = 0.1, LOOK = 1.2;

const levels = (file, from, len) => {
  const r = spawnSync("ffmpeg", ["-v", "error", "-ss", String(Math.max(0, from)), "-t", String(len), "-i", file, "-vn", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`ffmpeg could not read ${file}: ${String(r.stderr).slice(0, 200)}`);
  const b = r.stdout, n = Math.round(FRAME * 16000), out = [];
  for (let i = 0; i + n <= b.length / 2; i += n) {
    let s = 0;
    for (let j = i; j < i + n; j++) { const v = b.readInt16LE(j * 2) / 32768; s += v * v; }
    out.push(10 * Math.log10(s / n + 1e-12));
  }
  return out;
};

// speech runs [start, end, word-loud frames] in master seconds around t; pause: no speech frame within ±20 ms of t
function runsAround(cfg, t) {
  const from = Math.max(0, t - LOOK), m = levels(cfg.master, from, 2 * LOOK), b = cfg.bed ? levels(cfg.bed, from, 2 * LOOK) : [];
  const peak = [...m].sort((x, y) => x - y)[Math.floor(m.length * 0.95)] ?? 0, at = (i) => from + i * FRAME + FRAME / 2;
  const near = m.filter((_, i) => Math.abs(at(i) - t) <= 0.02), dip = near.length > 0 && Math.max(...near) <= peak - DIP;
  const speech = m.map((x, i) => x >= Math.max(FLOOR_DB, peak - BELOW_PEAK) && x - (b[i] ?? -90) >= SPEECH_DB && !(dip && Math.abs(at(i) - t) <= 0.02));
  const runs = [], loud = (x) => (x >= peak - WORD ? 1 : 0);
  speech.forEach((on, i) => {
    if (!on) return;
    const a = from + i * FRAME, e = a + FRAME, last = runs.at(-1);
    if (last && a - last[1] < 0.06 && !(dip && last[1] <= t && a >= t)) { last[1] = e; last[2] += loud(m[i]); }
    else runs.push([a, e, loud(m[i])]);
  });
  const pause = !speech.some((on, i) => on && Math.abs(at(i) - t) <= 0.02);
  // any voice at all in [a, e] (looser than speech: a soft or quick word like "তো" is ≥ 8 dB over the music)
  const voiced = (a, e) => m.some((x, i) => at(i) >= a && at(i) <= e && x >= Math.max(FLOOR_DB, peak - BELOW_PEAK) && x - (b[i] ?? -90) >= 8);
  return { runs: runs.filter(([a, e]) => e - a >= 0.04), pause, voiced };
}

const pauseFix = (runs, t) => {
  const gaps = [];
  for (let i = 1; i < runs.length; i++) if (runs[i][0] - runs[i - 1][1] >= PAUSE) gaps.push((runs[i - 1][1] + runs[i][0]) / 2);
  return gaps.sort((x, y) => Math.abs(x - t) - Math.abs(y - t))[0];
};

export function masterWords(dir) {
  const cap = existsSync(path.join(dir, "captions.json")) ? readJSON(path.join(dir, "captions.json")) : {};
  const words = [];
  (cap.extra ?? []).forEach((x, k) => {
    if (!existsSync(x.asr)) return;
    const r = readJSON(x.asr);
    (Array.isArray(r) ? r : r.words).forEach((w, i) => {
      if (x.fix?.[String(i)] === null) return; // already dropped from the captions
      words.push({ text: x.fix?.[String(i)] ?? w.text ?? w.word, start: Number(w.start) + (x.at ?? 0), end: Number(w.end) + (x.at ?? 0), extra: k, index: i });
    });
  });
  return words;
}

export function checkBoundaries(cfg, words = []) {
  const out = [];
  cfg.segments.forEach((s, i) => {
    if (s.mute) return;
    const prev = cfg.segments[i - 1], next = cfg.segments[i + 1], sides = [];
    if (!(prev && !prev.mute && Math.abs(prev.to - s.from) < 0.1)) sides.push(["from", s.from]);
    if (!(next && !next.mute && Math.abs(next.from - s.to) < 0.1)) sides.push(["to", s.to]);
    for (const [side, t] of sides) {
      if (s.cutOk?.includes(side)) continue;
      const { runs, pause, voiced } = runsAround(cfg, t), r2 = (x) => Number(x.toFixed(2));
      const add = (msg, fix = pauseFix(runs, t)) => out.push({ seg: i, side, at: t, level: "ERROR", msg, fix: fix == null ? null : r2(fix) });
      const inside = runs.find(([a, e]) => a < t - 0.01 && e > t + 0.01);
      if (inside) add(`the cut is inside speech (${r2(inside[0])}–${r2(inside[1])}): a word is clipped`);
      else if (side === "to") {
        const j = runs.findIndex(([a, e, n], k) => e - a >= STRAY && n * FRAME >= 0.06 && a > t - NEAR && e <= t + 0.01 && (k === 0 || a - runs[k - 1][1] >= PAUSE));
        if (j >= 0) add(`a word starts ${r2(t - runs[j][0])} s before the end cut, after a pause (${r2(runs[j][0])}–${r2(runs[j][1])}): it is heard as a stray word`,
          j > 0 ? (runs[j - 1][1] + runs[j][0]) / 2 : null);
      }
      const w = words.find((x) => x.start < t - 0.04 && x.end > t + 0.04);
      if (w && !pause && !inside) add(`the word list puts "${w.text}" (${r2(w.start)}–${r2(w.end)}) across the cut`);
      // phantom: a caption word inside the piece, within 0.6 s of the cut, with no speech under it (ASR heard music)
      for (const x of words) {
        const a = side === "to" ? x.start : Math.max(x.start, t), e = side === "to" ? Math.min(x.end, t) : x.end;
        const near = side === "to" ? x.start >= t - NEAR - 0.1 && x.start < t - 0.01 : x.start >= t - 0.02 && x.start < t + NEAR + 0.1;
        if (!near || e - a < 0.08) continue; // the page drops a sliver itself
        if (voiced(a, e)) continue;
        add(`the caption would show "${x.text}" (${r2(x.start)}–${r2(x.end)}) but nothing is spoken there (an ASR phantom): drop it with captions.json extra[${x.extra}].fix { "${x.index}": null }`, null);
      }
    }
  });
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = path.resolve(process.argv[2] ?? ".");
  const cfg = readJSON(path.join(dir, "cutdown.json"));
  const words = masterWords(dir);
  const issues = checkBoundaries(cfg, words);
  console.log(`${path.basename(dir)}: ${cfg.segments.filter((s) => !s.mute).length} spoken pieces, ${words.length} words${cfg.bed ? "" : " (no bed: the sound check uses the master alone)"}`);
  for (const x of issues) console.log(`  ${x.level}  piece ${x.seg} ${x.side}=${x.at}: ${x.msg}${x.fix != null ? `  → pause at ${x.fix}` : ""}`);
  console.log(issues.length ? `${issues.length} cut problem(s)` : "  every cut sits on a pause");
  process.exit(issues.some((x) => x.level === "ERROR") ? 1 : 0);
}
