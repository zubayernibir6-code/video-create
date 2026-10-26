#!/usr/bin/env node
// align.mjs — caption words for the episode: what was SAID (the transcriber's words and timings), spelt the way
// the speaker's own subtitle file spells it.
//
//   node tools/episode/align.mjs <episode.json>
//   in:  <work>/audio/asr.words.json (asr_chunks.py), the episode's subtitle file ("[hh:mm:ss - hh:mm:ss] text")
//   out: <work>/words.json  [{text, start, end}] on the SOURCE timeline (cuts are applied later)
//
// The two texts are aligned word by word (Needleman–Wunsch on a letter-level similarity, only within ±4 s of the
// subtitle line's own time). A spoken word takes the file's spelling when the two are near-identical (≥ 0.72:
// ইম্পটেন্ট → ইম্পর্টেন্ট, ডিস্ট্রেক্ট → ডিস্ট্রাক্ট) and keeps the spoken form otherwise (করতেছে stays করতেছে, so the
// word that lights up is the word being said). Sentence punctuation from the file rides along, which is where
// caption pages break. ep.captionFixes maps leftover spoken forms to a display form (e.g. "সাস" → "SaaS").
import { existsSync } from "node:fs";
import path from "node:path";
import { ffmpegInfo, loadEpisode, parseTimedText, readJSON, round3, writeJSON } from "./lib.mjs";

const ep = loadEpisode(process.argv[2] ?? ".");
const lines = parseTimedText(ep.source.subtitles);
const fixes = ep.captionFixes ?? {};
const asrFile = path.join(ep.work, "audio", "asr.words.json");
const PUNCT = /[।,.!?;:"'“”‘’—–\-()…]/g;

// Fallback (--estimate, or no transcript yet): the subtitle file's words spread over the SPOKEN parts of each
// line's time window (pauses from the mastered voice), in proportion to their letter counts. Timing is then
// approximate (within a word or two), which is why the transcript route is preferred.
if (process.argv.includes("--estimate") || !existsSync(asrFile)) {
  const log = ffmpegInfo(["-i", path.join(ep.work, "audio", "voice_master.wav"), "-af", "silencedetect=noise=-42dB:d=0.18", "-f", "null", "-"]);
  const ss = [...log.matchAll(/silence_start: (-?[\d.]+)/g)].map((m) => Number(m[1]));
  const se = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  const sil = ss.map((s, i) => [s, se[i] ?? 1e9]);
  const g = (s) => [...new Intl.Segmenter("bn", { granularity: "grapheme" }).segment(s)].length;
  const out = [];
  lines.forEach((l, i) => {
    const next = lines[i + 1];
    const a = l.start - 0.6, b = Math.min(l.end + 0.9, next ? next.start + 0.4 : l.end + 0.9);
    // speech stretches inside [a, b]
    let sp = [[a, b]];
    for (const [x, y] of sil) sp = sp.flatMap(([p, q]) => (y <= p || x >= q ? [[p, q]] : [[p, x], [y, q]].filter(([u, v]) => v - u > 0.05)));
    if (!sp.length) sp = [[l.start, l.end]];
    const text = l.text.replace(/\s*\([A-Za-z][^)]*\)/g, "").replace(/\s+/g, " ").trim();
    const toks = text.split(" ").filter((t) => t.replace(PUNCT, ""));
    const weights = toks.map((t) => g(t.replace(PUNCT, "")) + 1), W = weights.reduce((x, y) => x + y, 0);
    const speech = sp.reduce((x, [p, q]) => x + (q - p), 0);
    let acc = 0;
    const at = (frac) => { let need = frac * speech; for (const [p, q] of sp) { if (need <= q - p) return p + need; need -= q - p; } return sp.at(-1)[1]; };
    toks.forEach((t, k) => {
      const s = at(acc / W); acc += weights[k]; const e = at(acc / W);
      out.push({ text: fixes[t] ?? t.replace(/^["“‘(]+|["”’)]+$/g, ""), start: round3(s), end: round3(Math.max(e - 0.02, s + 0.05)) });
    });
  });
  writeJSON(path.join(ep.work, "words.json"), out);
  console.log(`estimated timings for ${out.length} words from ${lines.length} subtitle lines (no transcript used)`);
  process.exit(0);
}
const asr = readJSON(asrFile);

const norm = (s) => s.normalize("NFC").replace(PUNCT, "").replace(/‌|‍/g, "").toLowerCase();
const script = [];
lines.forEach((l, li) => {
  const text = l.text.replace(/\s*\([A-Za-z][^)]*\)/g, "").replace(/[—–]/g, " — ").replace(/\s+/g, " ").trim();
  for (const tok of text.split(" ")) {
    const n = norm(tok);
    if (!n) { if (script.length && /[।?!,—]/.test(tok)) script.at(-1).punct = tok.trim(); continue; }
    const trail = (tok.match(/[।,.!?;:—…"”’]+$/) || [""])[0].replace(/["”’]/g, "");
    script.push({ disp: tok.replace(/^["“‘(]+|["”’)]+$/g, "").replace(/[।,.!?;:…]+$/, ""), n, punct: trail, li, ls: l.start, le: l.end });
  }
});

function sim(a, b) {
  if (a === b) return 1;
  const A = [...a], B = [...b];
  const d = Array.from({ length: A.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= B.length; j++) d[0][j] = j;
  for (let i = 1; i <= A.length; i++) for (let j = 1; j <= B.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));
  return 1 - d[A.length][B.length] / Math.max(A.length, B.length);
}

// DP: rows = asr words, cols = script words
const N = asr.length, M = script.length, GAP = -0.45;
const an = asr.map((w) => norm(w.text));
const score = new Float32Array((N + 1) * (M + 1));
const back = new Uint8Array((N + 1) * (M + 1)); // 1 diag, 2 up (asr extra), 3 left (script extra)
const at = (i, j) => i * (M + 1) + j;
for (let i = 1; i <= N; i++) { score[at(i, 0)] = i * GAP; back[at(i, 0)] = 2; }
for (let j = 1; j <= M; j++) { score[at(0, j)] = j * GAP; back[at(0, j)] = 3; }
const simCache = new Map();
for (let i = 1; i <= N; i++) {
  const w = asr[i - 1], mid = (w.start + w.end) / 2;
  for (let j = 1; j <= M; j++) {
    const s = script[j - 1];
    let m = -1;
    if (mid >= s.ls - 4 && mid <= s.le + 4) {
      const key = an[i - 1] + "|" + s.n;
      let v = simCache.get(key);
      if (v === undefined) { v = sim(an[i - 1], s.n); simCache.set(key, v); }
      m = v >= 0.45 ? 2 * v - 0.6 : -1;
    }
    const d = score[at(i - 1, j - 1)] + m, u = score[at(i - 1, j)] + GAP, l = score[at(i, j - 1)] + GAP;
    if (d >= u && d >= l) { score[at(i, j)] = d; back[at(i, j)] = 1; }
    else if (u >= l) { score[at(i, j)] = u; back[at(i, j)] = 2; }
    else { score[at(i, j)] = l; back[at(i, j)] = 3; }
  }
}
const pairOf = new Array(N).fill(-1);
for (let i = N, j = M; i > 0 || j > 0;) {
  const b = back[at(i, j)];
  if (b === 1) { pairOf[i - 1] = j - 1; i--; j--; } else if (b === 2) i--; else j--;
}

// --text=script (or ep.captionText = "script"): show the subtitle file's own words, each timed by the spoken word
// it matched; the file's words nobody said get times interpolated between their matched neighbours (by letter
// count, at most 0.6 s each), so the highlight never waits across a long pause.
const textMode = process.argv.find((a) => a.startsWith("--text="))?.split("=")[1] ?? ep.captionText ?? "spoken";
if (textMode === "script") {
  const time = new Array(M).fill(null);
  pairOf.forEach((j, i) => { if (j >= 0 && sim(an[i], script[j].n) >= 0.45) time[j] = { start: asr[i].start, end: asr[i].end }; });
  const g = (s) => [...new Intl.Segmenter("bn", { granularity: "grapheme" }).segment(s)].length + 1;
  let j = 0, anchored = time.filter(Boolean).length;
  while (j < M) {
    if (time[j]) { j++; continue; }
    let k = j;
    while (k < M && !time[k]) k++;
    const prevEnd = j > 0 ? time[j - 1].end : script[j].ls;
    const nextStart = k < M ? time[k].start : Math.max(prevEnd + 0.4 * (k - j), script[k - 1].le);
    const weights = script.slice(j, k).map((s) => g(s.n)), W = weights.reduce((a, b) => a + b, 0);
    const span = Math.min(Math.max(0.12 * (k - j), nextStart - prevEnd), 0.6 * (k - j));
    let t = prevEnd;
    for (let x = j; x < k; x++) { const d = (span * weights[x - j]) / W; time[x] = { start: t, end: t + d }; t += d; }
    j = k;
  }
  const out = script.map((s, x) => ({ text: (fixes[s.disp] ?? s.disp) + (s.punct && !/[—]/.test(s.punct) ? s.punct : ""),
    start: round3(time[x].start), end: round3(Math.max(time[x].end, time[x].start + 0.05)) }));
  for (let x = 1; x < out.length; x++) if (out[x].start < out[x - 1].start) out[x].start = out[x - 1].start;
  writeJSON(path.join(ep.work, "words.json"), out);
  console.log(`${M} subtitle words shown as written; ${anchored} timed by the matching spoken word, ${M - anchored} interpolated (${N} spoken words)`);
  process.exit(0);
}

let respelt = 0, kept = 0, matched = 0;
const out = asr.map((w, i) => {
  let text = w.text.normalize("NFC");
  let punct = "";
  const j = pairOf[i];
  if (j >= 0) {
    const s = script[j], v = sim(an[i], s.n);
    if (v >= 0.45) {
      matched++;
      punct = s.punct;
      if (v >= 0.72 && s.disp !== text) { text = s.disp; respelt++; } else kept++;
    }
  }
  if (fixes[text]) text = fixes[text];
  let end = w.end;
  if (end - w.start > 1.2) end = w.start + 0.8; // a word swallowed by a pause
  return { text: text + (punct && !/[—]/.test(punct) ? punct : ""), start: round3(w.start), end: round3(Math.max(end, w.start + 0.05)) };
});
writeJSON(path.join(ep.work, "words.json"), out);
console.log(`${N} spoken words, ${M} subtitle words: ${matched} matched (${respelt} respelt from the file), ${N - matched} spoken words not in the file`);
