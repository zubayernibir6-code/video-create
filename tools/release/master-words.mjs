#!/usr/bin/env node
// master-words.mjs — every spoken word of a FINISHED screen-tutorial master, in master seconds and corrected, without
// a new ASR run (release system step 4, 2026-10-30). Feeds srt-export.mjs (subtitle files) and later cut-downs.
//
//   node tools/release/master-words.mjs projects/<tutorial> [--cutdowns=projects/a,projects/b] [--out=<file.json>]
//
// Sources, best first:
//   1. corrected cut-down words: every --cutdowns project (default: every projects/* whose cutdown.json "master" is
//      this tutorial's render) that has its own ASR + hand fixes in captions.json, mapped back to master seconds
//      through its map.json. Where a cut-down covers the master, its words replace the raw ones.
//   2. the raw ASR the tutorial was built from, <work>/measure/{intro,voice,outro}.words.json, mapped through
//      tools/tutorial/timeline.mjs: intro 1:1, the voice-over by its kept pieces (shrunk pauses, cuts), the outro by
//      S() without the outro cut. The outro clip ends where Video.mp4 ends, so its start = video_end − its length.
//      Hand fixes are LEARNED from the cut-downs: asr→fix pairs that name a product in Latin letters or repeat, that
//      always agree, and whose ASR word never also appears unfixed (so "হাই" in "হাই-কনভার্টিং" is never touched).
//      A cut-down's captions.json "extra" fixes that point at one of these same ASR files are applied by index (ig-1
//      dropped the phantom "বাড়িতে যেতে পারে"). Then <project>/subtitles.fixes.json (phrases: [raw words, fix|null])
//      — the hand proofread of what is left, written once per master against its PLAN.md script.
//   Guards: (a) a phantom word (Whisper invents words in a silent tail: "ট্রেনিং সাহায্যের প্রতিদিনের …" after "আসসালামু
//   আলাইকুম") is dropped when its own audio is 25 dB under the source's speech level (90th percentile of 50 ms RMS,
//   the transcribe.py rule, per word here); (b) the mapped raw times must agree with the corrected cut-down times:
//   median |Δt| per part ≤ 0.25 s over ≥ 5 matching words, or the run stops (a wrong offset or time map).
//
// Verified 2026-10-30 on projects/claude-video-tutorial (510.3 s) with claude-reel-1..4.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadProject } from "../tutorial/timeline.mjs";

const WS = path.resolve(import.meta.dirname, "..", "..");
const WORK_ROOT = "C:/Users/Zubayer Nibir/VideoWork";
const readJSON = (f) => JSON.parse(readFileSync(f, "utf8"));
const wordsOf = (f) => { const r = readJSON(f); return Array.isArray(r) ? r : r.words; };
const bare = (s) => s.replace(/[।,:;!?.\s]+$/u, "");
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };

// 50 ms RMS frames (dB) of a speech-only source, decoded to 16 kHz mono
function rmsFrames(wav) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-i", wav, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], { maxBuffer: 1 << 30 });
  const b = r.stdout, n = b.length >> 1, F = 800, out = [];
  for (let i = 0; i + F <= n; i += F) {
    let s = 0;
    for (let k = i; k < i + F; k++) { const v = b.readInt16LE(k * 2) / 32768; s += v * v; }
    out.push(10 * Math.log10(s / F + 1e-12));
  }
  return out;
}
const spanDb = (frames, a, b) => {
  const i0 = Math.max(0, Math.floor(Math.min(a, b - 0.05) / 0.05)), i1 = Math.min(frames.length, Math.ceil(Math.max(b, a + 0.05) / 0.05));
  const xs = frames.slice(i0, i1);
  return xs.length ? 10 * Math.log10(xs.reduce((s, d) => s + 10 ** (d / 10), 0) / xs.length) : -120;
};

export function masterWords(projectDir, { cutdowns } = {}) {
  const P = loadProject(projectDir);
  const { TL, cfg } = P;
  const name = path.basename(P.dir);
  const measure = path.join(WORK_ROOT, name, "measure");
  const SCREEN_A = TL.screen.at, SCREEN_B = cfg.frames.screen_to / cfg.fps, VIDEO_END = cfg.frames.video_end / cfg.fps;
  const OUTRO_CUT = cfg.frames.outro_cut?.map((f) => f / cfg.fps);
  const dur = (f) => Number(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" }).stdout);

  // ── 1. corrected cut-down words, in master seconds ──
  if (!cutdowns) {
    const master = readdirSync(path.join(WS, "projects")).map((d) => path.join(WS, "projects", d)).filter((d) => existsSync(path.join(d, "cutdown.json")));
    cutdowns = master.filter((d) => readJSON(path.join(d, "cutdown.json")).master?.includes(`/${name}/`));
  }
  const fixed = [], cover = [], pairs = new Map(), unfixed = new Set(), extraFix = new Map();
  const norm = (f) => path.resolve(f).toLowerCase();
  for (const d of cutdowns) {
    const cd = readJSON(path.join(d, "cutdown.json")), cap = readJSON(path.join(d, "captions.json"));
    for (const x of cap.extra ?? []) if (x.fix) extraFix.set(norm(path.resolve(d, x.asr)), { ...(extraFix.get(norm(path.resolve(d, x.asr))) ?? {}), ...x.fix });
    if (!(cap.asr || (!cap.reuse && !cap.extra))) continue; // reuse-only Reels carry no words of their own
    const map = readJSON(path.join(cd.work, "map.json"));
    const asr = wordsOf(path.join(cd.work, cap.asr ?? "asr.words.json"));
    const src = path.basename(d);
    for (const s of map.segments) if (!s.mute) cover.push({ src, from: s.from, to: s.to });
    asr.forEach((w, i) => {
      const fix = cap.fix?.[String(i)];
      if (fix === undefined) unfixed.add(bare(w.text));
      else if (fix !== null) { const k = bare(w.text); if (!pairs.has(k)) pairs.set(k, []); pairs.get(k).push(bare(fix)); }
      if (fix === null || cap.drop?.includes(i)) return;
      const sg = map.segments.find((x) => w.start >= x.out0 - 0.05 && w.start < x.out1);
      if (!sg || sg.mute) return;
      fixed.push({ text: fix ?? w.text, start: sg.from + (w.start - sg.out0) * sg.speed, end: sg.from + (Math.min(w.end, sg.out1) - sg.out0) * sg.speed, src });
    });
  }
  // the first cut-down to cover a stretch wins (as in tools/cutdown/page.mjs)
  const kept = [];
  for (const w of fixed) if (!kept.some((k) => k.src !== w.src && w.start < k.end - 0.05 && w.end > k.start + 0.05)) kept.push(w);
  const covered = (t) => cover.some((c) => t >= c.from - 0.02 && t < c.to);

  // learned fixes: Latin product names or repeated, always the same, and the ASR word is never right as it stands
  const learned = new Map();
  for (const [k, fs] of pairs) {
    const same = fs.every((f) => f === fs[0]);
    if (same && fs[0] !== k && !unfixed.has(k) && (/[A-Za-z]/.test(fs[0]) || fs.length >= 2)) learned.set(k, fs[0]);
  }

  // ── 2. the raw ASR of the three sources, mapped to master seconds ──
  const outroWav = path.join(measure, "outro16.wav");
  const parts = [
    { part: "intro", file: "intro.words.json", wav: "intro16.wav", off: 0, map: (s) => (s < SCREEN_A ? s : null) },
    { part: "voice", file: "voice.words.json", wav: "voice16.wav", off: 0, map: (v) => { const p = TL.voice.find((q) => v >= q.from && v < q.to); return p ? p.at + (v - p.from) : null; } },
    { part: "outro", file: "outro.words.json", wav: "outro16.wav", off: VIDEO_END - dur(outroWav),
      map: (s) => (s < SCREEN_B || (OUTRO_CUT && s >= OUTRO_CUT[0] && s < OUTRO_CUT[1]) ? null : TL.S(s)) },
  ];
  const raw = [], phantoms = [], align = {};
  const handFixes = existsSync(path.join(P.dir, "subtitles.fixes.json")) ? readJSON(path.join(P.dir, "subtitles.fixes.json")).phrases : [];
  for (const p of parts) {
    const frames = rmsFrames(path.join(measure, p.wav));
    const level = [...frames].sort((a, b) => a - b)[Math.floor(frames.length * 0.9)];
    const xf = extraFix.get(norm(path.join(measure, p.file))) ?? {};
    const mine = [];
    wordsOf(path.join(measure, p.file)).forEach((w, i) => {
      const s0 = p.off + Number(w.start), s1 = p.off + Number(w.end);
      const t0 = p.map(s0);
      if (t0 == null || xf[String(i)] === null) return;
      if (spanDb(frames, Number(w.start), Number(w.end)) < level - 25) { phantoms.push(`${p.part} ${t0.toFixed(2)} "${w.text}"`); return; }
      const t1 = Math.max(t0 + 0.04, p.map(Math.min(s1, s0 + 3)) ?? t0 + (s1 - s0));
      const text = xf[String(i)] ?? (learned.get(bare(w.text)) ? w.text.replace(bare(w.text), learned.get(bare(w.text))) : w.text);
      mine.push({ text, start: t0, end: t1, src: p.part });
    });
    // the hand proofread: longest phrases first, each match becomes one item (or is dropped)
    for (const [from, to] of [...handFixes].sort((a, b) => b[0].split(" ").length - a[0].split(" ").length)) {
      const n = from.split(" ").length;
      for (let i = 0; i + n <= mine.length; i++) {
        if (mine.slice(i, i + n).map((w) => w.text).join(" ") !== from) continue;
        const item = { text: to, start: mine[i].start, end: mine[i + n - 1].end, src: p.part, fixed: true };
        mine.splice(i, n, ...(to === null ? [] : [item]));
      }
    }
    raw.push(...mine);
    // guard (b): mapped raw times against the corrected cut-down times, same word, within 1 s
    const d = [];
    for (const w of raw.filter((x) => x.src === p.part && covered(x.start))) {
      const m = kept.find((k) => bare(k.text) === bare(w.text) && Math.abs(k.start - w.start) < 1);
      if (m) d.push(Math.abs(m.start - w.start));
    }
    align[p.part] = { n: d.length, median: median(d) };
    if (d.length >= 5 && median(d) > 0.25) throw new Error(`${p.part}: mapped ASR times disagree with the corrected cut-down words (median |Δt| ${median(d).toFixed(2)} s over ${d.length} words) — the time map or the clip offset is wrong`);
  }

  const words = [...kept, ...raw.filter((w) => !covered(w.start))]
    .map((w) => ({ text: w.text, start: +w.start.toFixed(3), end: +w.end.toFixed(3), src: w.src }))
    .sort((a, b) => a.start - b.start);
  return { words, total: TL.TOTAL, cover, learned: [...learned], phantoms, align, sources: cutdowns.map((d) => path.basename(d)) };
}

if (process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === path.resolve(import.meta.filename).toLowerCase()) {
  const args = process.argv.slice(2);
  const dir = args.find((a) => !a.startsWith("--"));
  if (!dir) { console.log("Usage: node tools/release/master-words.mjs projects/<tutorial> [--cutdowns=projects/a,projects/b] [--out=<file.json>]"); process.exit(2); }
  const opt = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
  const r = masterWords(dir, { cutdowns: opt.cutdowns?.split(",").map((d) => path.resolve(d)) });
  const out = opt.out ?? path.join(WORK_ROOT, path.basename(path.resolve(dir)), "master.words.json");
  writeFileSync(out, JSON.stringify({ total: r.total, words: r.words }, null, 1));
  const bySrc = {};
  for (const w of r.words) bySrc[w.src] = (bySrc[w.src] ?? 0) + 1;
  const covered = r.cover.reduce((s, c) => s + (c.to - c.from), 0);
  console.log(`master-words: ${r.words.length} words over ${r.total.toFixed(1)} s → ${out}`);
  console.log(`  from: ${Object.entries(bySrc).map(([k, v]) => `${k} ${v}`).join(", ")}  (corrected cut-downs cover ${covered.toFixed(0)} s incl. overlaps: ${r.sources.join(", ")})`);
  console.log(`  learned fixes (${r.learned.length}): ${r.learned.map(([a, b]) => `${a}→${b}`).join(", ")}`);
  console.log(`  phantom words dropped (${r.phantoms.length}): ${r.phantoms.join(", ") || "none"}`);
  console.log(`  time check vs corrected words: ${Object.entries(r.align).map(([k, v]) => `${k} ${v.n} words, median |Δt| ${v.median == null ? "-" : v.median.toFixed(2)} s`).join("; ")}`);
}
