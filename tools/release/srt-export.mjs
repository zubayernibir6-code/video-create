#!/usr/bin/env node
// srt-export.mjs — Bengali subtitle files from a timed word list (release system step 4, 2026-10-30)
//
//   node tools/release/srt-export.mjs <words.json> --out=<dir>/<name> [--line=42] [--max=6] [--total=<s>]
//
// <words.json>: [{ text, start, end }] or { words, total } — e.g. tools/release/master-words.mjs's master.words.json.
// Writes <name>.bn.srt (YouTube, LinkedIn: any name) and <name>.bn_IN.srt (Facebook wants video.xx_XX.srt,
// platforms.json S23): the same cues, UTF-8, CRLF. Why a file and not only burned text: YouTube is the only platform
// that auto-captions Bengali; a corrected .srt is better there too, and Facebook/LinkedIn show nothing without one.
// Cues: a new cue at a sentence end (। ? !), a pause ≥ 0.6 s, more than two lines of `line` characters or more than
// `max` seconds; a lone short word joins the cue before. On screen from its first word − 0.05 s to its last word
// + 0.4 s, never into the next cue (2 frames apart), at least 1 s when the pause allows. One line when it fits, else
// two lines balanced at a space.
// Checks (exit 1 on ERROR): times rise, no overlap, 0.5–7 s on screen, ≤ 2 lines, each ≤ line + 6 characters.
// WARN: reading speed over 22 characters/s; INFO: the longest gaps between cues (look there for missed speech).
// Verified 2026-10-30 on claude-video-tutorial's master (882 words → see the run in docs/release-system-plan.md).
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseSubtitles } from "../srt.mjs";

const SENT_END = /[।?!]$/u;
const chars = (ws) => [...ws.map((w) => w.text).join(" ")].length;
const ts = (t) => {
  const ms = Math.round(Math.max(0, t) * 1000);
  const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};

export function makeCues(words, { line = 42, max = 6, total = Infinity } = {}) {
  const groups = [];
  let cur = [];
  for (const w of words) {
    const prev = cur.at(-1);
    // max counts the cue's own lead-in and hold (−0.05 / +0.4 s)
    if (prev && (w.start - prev.end >= 0.6 || chars([...cur, w]) > 2 * line || w.end + 0.45 - cur[0].start > max)) { groups.push(cur); cur = []; }
    cur.push(w);
    if (SENT_END.test(w.text) && chars(cur) >= 8) { groups.push(cur); cur = []; }
  }
  if (cur.length) groups.push(cur);
  // a lone short word ("দেখিয়েছি।") joins the cue before when they are close: two lines may then run to line + 6
  for (let i = groups.length - 1; i > 0; i--) {
    const g = groups[i], p = groups[i - 1];
    const near = chars(g) <= 4 ? 2 : 0.6; // a tiny trailing word ("এবং" before a pause) may cross a longer pause
    if (g.length === 1 && chars(g) <= 10 && g[0].start - p.at(-1).end < near && chars([...p, ...g]) <= 2 * (line + 6) && g[0].end + 0.45 - p[0].start <= 7) { p.push(...g); groups.splice(i, 1); }
  }
  // a lone word that could not join the cue before ("এবং", "তো": it starts the next sentence) joins the cue after
  for (let i = groups.length - 2; i >= 0; i--) {
    const g = groups[i], n = groups[i + 1];
    if (g.length === 1 && chars(g) <= 10 && n[0].start - g[0].end < (chars(g) <= 4 ? 1.5 : 0.6) && chars([...g, ...n]) <= 2 * (line + 6) && n.at(-1).end + 0.45 - g[0].start <= 7) { n.unshift(...g); groups.splice(i, 1); }
  }
  const GAP = 2 / 30;
  const cues = groups.map((g) => ({ start: g[0].start - 0.05, end: g.at(-1).end + 0.4, words: g }));
  cues.forEach((c, i) => {
    const prev = cues[i - 1], next = cues[i + 1];
    if (prev) c.start = Math.max(c.start, prev.end + GAP);
    c.end = Math.min(c.end, next ? next.words[0].start - 0.05 - GAP : total, c.start + 7);
    if (c.end - c.start < 1) c.end = Math.min(c.start + 1, next ? next.words[0].start - 0.05 - GAP : total);
    const text = c.words.map((w) => w.text).join(" ");
    if ([...text].length <= line) c.lines = [text];
    else { // two lines, the break at the space that balances them best
      const spaces = [...text.matchAll(/ /g)].map((m) => m.index);
      const mid = text.length / 2;
      const at = spaces.reduce((b, s) => (Math.abs(s - mid) < Math.abs(b - mid) ? s : b), spaces[0] ?? text.length);
      c.lines = [text.slice(0, at), text.slice(at + 1)].filter(Boolean);
    }
  });
  return cues;
}

export function checkCues(cues, { line = 42 } = {}) {
  const errors = [], warns = [];
  cues.forEach((c, i) => {
    const d = c.end - c.start, n = [...c.lines.join("")].length;
    const where = `cue ${i + 1} (${ts(c.start)})`;
    if (i && c.start < cues[i - 1].end) errors.push(`${where} overlaps the cue before`);
    if (i && c.start < cues[i - 1].start) errors.push(`${where} starts before the cue before`);
    if (d < 0.5 || d > 7) errors.push(`${where} is on screen ${d.toFixed(2)} s (0.5–7 s)`);
    if (c.lines.length > 2) errors.push(`${where} has ${c.lines.length} lines`);
    for (const l of c.lines) if ([...l].length > line + 6) errors.push(`${where} has a ${[...l].length}-character line: "${l}"`);
    if (n / d > 22) warns.push(`${where} reads at ${(n / d).toFixed(1)} characters/s: "${c.lines.join(" / ")}"`);
  });
  const gaps = cues.slice(1).map((c, i) => [cues[i].end, c.start]).filter(([a, b]) => b - a > 5).sort((x, y) => (y[1] - y[0]) - (x[1] - x[0]));
  return { errors, warns, gaps };
}

export const toSrt = (cues) => cues.map((c, i) => `${i + 1}\r\n${ts(c.start)} --> ${ts(c.end)}\r\n${c.lines.join("\r\n")}\r\n`).join("\r\n");

if (process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === path.resolve(import.meta.filename).toLowerCase()) {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  const opt = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
  if (!file || !opt.out) { console.log("Usage: node tools/release/srt-export.mjs <words.json> --out=<dir>/<name> [--line=42] [--max=6] [--total=<s>]"); process.exit(2); }
  const raw = JSON.parse(readFileSync(file, "utf8"));
  const words = (Array.isArray(raw) ? raw : raw.words).filter((w) => w.text).sort((a, b) => a.start - b.start);
  const line = Number(opt.line ?? 42), max = Number(opt.max ?? 6), total = Number(opt.total ?? raw.total ?? Infinity);
  const cues = makeCues(words, { line, max, total });
  const { errors, warns, gaps } = checkCues(cues, { line });
  const outs = [`${opt.out}.bn.srt`, `${opt.out}.bn_IN.srt`];
  for (const o of outs) writeFileSync(o, toSrt(cues), "utf8");
  const back = parseSubtitles(outs[0]); // read it back with the workspace's own reader
  if (back.length !== cues.length) errors.push(`read back ${back.length} cues, wrote ${cues.length}`);
  const dur = cues.map((c) => c.end - c.start);
  console.log(`srt-export: ${words.length} words → ${cues.length} cues (${(dur.reduce((a, b) => a + b, 0) / dur.length).toFixed(1)} s average, ${cues.filter((c) => c.lines.length === 2).length} on two lines) → ${outs.join(", ")}`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  for (const w of warns.slice(0, 8)) console.log(`  WARN  ${w}`);
  if (warns.length > 8) console.log(`  WARN  … and ${warns.length - 8} more fast cues`);
  console.log(`  INFO  gaps over 5 s between cues: ${gaps.length ? gaps.slice(0, 6).map(([a, b]) => `${ts(a)}–${ts(b)} (${(b - a).toFixed(1)} s)`).join(", ") : "none"}`);
  process.exit(errors.length ? 1 : 0);
}
