#!/usr/bin/env node
// build.mjs — the A-roll + B-roll engine (variants AB1–AB5 of tools/variants.json, his guide VARIANTS.md). A talking-
// head recording becomes a 16:9 video where every section is shown in one named style; the model only writes DATA:
//   projects/<name>/abroll.json   the recording, its clean voice, word timings, music, and the sections
//                                 [{ variant: "AB1".."AB5", from, to (source s), + that variant's fields }]
//   node tools/abroll/build.mjs projects/<name> [check] [media] [voice] [page] [mix]   (none named = all, in order)
//   node tools/abroll/build.mjs projects/<name> plan [--force]   → PLAN.md for the plan gate, from the data
//   node tools/abroll/build.mjs projects/<name> pauses <from> <to> → the voice's pauses (cut points, word retimes)
//   node tools/abroll/build.mjs projects/<name> media --only=0,3   → re-encode only those sections (0-based)
//     check   seconds: files exist, every section's words / anchors resolve, the page builds (dry run)
//     media   A-roll clips per section (30 fps, 1920×1080), blurred copies (AB5), B-roll clips (cover-cropped, slowed)
//     voice   speech.wav: the sections' voice back to back (+ the intro / outro gaps), 10 ms fades
//     page    index.html + build/cues.json (page.mjs)
//     mix     mix.wav: voice + ducked music + every SFX cue (tools/screen/promo-mix.mjs)
//   Then: node tools/preflight.mjs projects/<name> (over 60 s) → node tools/finish.mjs projects/<name>.
// Section times are SOURCE seconds of the recording (= the voice file and the words). Inside a section any time can be
// a number (source s) or a WORD the speaker says ("কোম্পানি", "AGI", "১৭#2" = its 2nd time): the engine finds it.
// Verified 2026-10-30 on projects/abroll-variants-demo (his 11-min talk, 5 sections, one per style): 11.1 s of pauses
// cut, every A-roll clip exactly its frames, speech.wav exactly 78.4 s; preflight 0 errors; hyperframes check clean;
// render 78.4 s in 11 min 25 s, QC 9/9 PASS at −14 LUFS; every 0.5 s of it read on contact sheets. A Sonnet run of
// the skill built its own 3-section project (check / plan / page) from SKILL.md alone.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildMix } from "../screen/promo-mix.mjs";
import { buildPage } from "./page.mjs";

const WS = path.resolve(import.meta.dirname, "..", "..");
const f3 = (x) => Number(x).toFixed(3);
const ff = (args, what) => { const r = spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] }); if (r.status !== 0) throw new Error(`${what} failed`); };
const enc = (fps) => ["-an", "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-g", String(fps), "-pix_fmt", "yuv420p", "-r", String(fps),
  "-x264-params", "colorprim=bt709:transfer=bt709:colormatrix=bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart"];
const dur = (f) => Number(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" }).stdout.trim());

// ── the project: data + the final timeline ──
export function loadProject(dirArg, { media } = {}) {
  const dir = path.resolve(dirArg);
  const file = path.join(dir, "abroll.json");
  if (!existsSync(file)) throw new Error(`${file} not found (copy .claude/skills/abroll/abroll.example.json there)`);
  const D = JSON.parse(readFileSync(file, "utf8"));
  const FPS = D.fps ?? 30;
  const snap = (s) => Math.round(s * FPS) / FPS; // every boundary on the frame grid (§0i Time)
  // words: one or more transcripts [{file, offset}] → source-time words, sorted, overlaps trimmed. A transcript later
  // in the list replaces the earlier ones over its own time span (a re-transcribed window over a whole-talk file).
  let words = [];
  for (const { file: wf, offset = 0 } of Array.isArray(D.aroll.words) ? D.aroll.words : [{ file: D.aroll.words, offset: 0 }]) {
    const ws = JSON.parse(readFileSync(wf, "utf8")).map((w) => ({ text: String(w.text ?? w.word).trim(), start: w.start + offset, end: w.end + offset })).filter((w) => w.text);
    if (!ws.length) continue;
    const a = Math.min(...ws.map((w) => w.start)), b = Math.max(...ws.map((w) => w.end));
    words = [...words.filter((w) => w.end <= a || w.start >= b), ...ws];
  }
  words.sort((a, b) => a.start - b.start);
  for (let i = 1; i < words.length; i++) if (words[i].start < words[i - 1].end) words[i - 1].end = Math.max(words[i - 1].start + 0.05, words[i].start);
  // the timeline: intro, the sections back to back, outro. Inside a section every pause longer than `tighten` s
  // (default 0.4, STYLE.md §৫) is cut, keeping 0.15 s of breath on both sides: seg.keep = the kept source pieces
  // (on the frame grid), seg.map(source s) = final s; the A-roll and the voice are cut with the same pieces.
  const TIGHT = D.tighten ?? 0.4, BREATH = 0.15;
  const INTRO = snap(D.intro?.dur ?? 0), OUTRO = snap(D.outro?.dur ?? 0);
  let at = INTRO;
  const segs = D.sections.map((s, i) => {
    const from = snap(s.from), to = snap(s.to);
    let keep = [[from, to]];
    if (TIGHT > 0) for (const [a, b] of pausesIn(D.aroll.voice, from, to, D.pause_db ?? -42)) {
      if (b - a <= TIGHT) continue;
      // a pause at the section's very start or end goes whole (no breath kept before the first word)
      const ca = a <= from + 0.03 ? from : snap(a + BREATH), cb = b >= to - 0.03 ? to : snap(b - BREATH);
      keep = keep.flatMap(([x, y]) => (cb <= x || ca >= y ? [[x, y]] : [[x, ca], [cb, y]].filter(([p, q]) => q - p >= 1 / FPS - 1e-9)));
    }
    const len = snap(keep.reduce((t, [x, y]) => t + y - x, 0));
    const seg = { ...s, i, from, to, at, len, keep, cut: snap(to - from - len) };
    seg.map = (src) => { let off = 0; for (const [x, y] of keep) { if (src < x) return seg.at + off; if (src < y) return seg.at + off + (src - x); off += y - x; } return seg.at + off; };
    seg.end = snap(at + len); at = seg.end;
    const core = (w) => D.sections.some((o) => w.start >= snap(o.from) && w.start < snap(o.to) - 0.05);
    seg.words = fixWords(fixWords(words.filter((w) => (w.start >= from && w.start < to - 0.05) || (w.start >= from - 0.5 && w.start < from && !core(w)))
      .map((w) => ({ ...w, start: Math.max(w.start, from), end: Math.min(w.end, to) })), D.aroll.fix), s.fix);
    return seg;
  });
  const TOTAL = snap(at + OUTRO);
  return { dir, build: path.join(dir, "build"), media: media ? path.resolve(media) : path.join(dir, "assets", "media"), D, FPS, words, segs, INTRO, OUTRO, TOTAL };
}

// caption fixes on the transcriber's words: { "এয়ারি": "এআই", "পাওয়ার ফুল": "পাওয়ারফুল" (two words become one),
// "হবে#2": "হবে?" (only its 2nd time in the section), "আইএমএফের": { "start": 216.36, "end": 217.45 } (retime a word the
// transcriber placed in a pause; source s, measure with the pauses step) }. aroll.fix applies everywhere, a section's fix only there.
function fixWords(words, fix) {
  if (!fix) return words;
  let out = [...words];
  const bare = (t) => t.replace(/[।,!?]+$/, "");
  for (const [k, v] of Object.entries(fix)) {
    const [key, nth] = k.split("#"), parts = key.split(/\s+/);
    let seen = 0;
    const val = typeof v === "string" ? { text: v } : v;
    for (let i = 0; i + parts.length <= out.length; i++) {
      if (!parts.every((p, j) => bare(out[i + j].text) === p)) continue;
      if (nth && ++seen !== Number(nth)) continue;
      out.splice(i, parts.length, { text: val.text ?? out.slice(i, i + parts.length).map((w) => w.text).join(" "), start: val.start ?? out[i].start, end: val.end ?? out[i + parts.length - 1].end });
      if (nth) break;
    }
  }
  return out;
}

// pauses in the voice between from and to: 20 ms RMS below `db` for ≥ 160 ms → [[a, b] …] source s
function pausesIn(voice, from, to, db) {
  const r = spawnSync("ffmpeg", ["-v", "error", "-ss", f3(from), "-t", f3(to - from), "-i", voice, "-ac", "1", "-ar", "8000", "-f", "f32le", "-"], { maxBuffer: 1 << 26 });
  const x = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length >> 2), win = 160, out = [];
  let st = -1;
  const n = Math.floor(x.length / win);
  for (let k = 0; k <= n; k++) {
    let quiet = false;
    if (k < n) { let s = 0; for (let j = 0; j < win; j++) s += x[k * win + j] ** 2; quiet = 10 * Math.log10(s / win + 1e-12) < db; }
    if (quiet) { if (st < 0) st = k; } else { if (st >= 0 && k - st >= 8) out.push([from + st * 0.02, from + k * 0.02]); st = -1; }
  }
  return out;
}

const nbFrames = (f) => Number(spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", f], { encoding: "utf8" }).stdout.trim());

function buildMedia(P) {
  mkdirSync(P.media, { recursive: true });
  const src = P.D.aroll.video;
  for (const s of P.segs) {
    if (P.only && !P.only.includes(s.i)) continue;
    // the kept pieces, each trimmed and brought to the frame rate, then joined; exactly len × FPS frames
    const base = Math.max(0, s.from - 2), n = s.keep.length, frames = Math.round(s.len * P.FPS);
    const graph = (tail) => `[0:v]${n > 1 ? `split=${n}${s.keep.map((_, k) => `[i${k}]`).join("")};` : "null[i0];"}` +
      s.keep.map(([a, b], k) => `[i${k}]trim=start=${f3(a - base)}:end=${f3(b - base)},setpts=PTS-STARTPTS,fps=${P.FPS}[p${k}]`).join(";") +
      `;${s.keep.map((_, k) => `[p${k}]`).join("")}concat=n=${n}:v=1:a=0,scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,setsar=1${tail},tpad=stop_mode=clone:stop=6[v]`;
    const cut = (tail, out, what) => ff(["-ss", f3(base), "-t", f3(s.to - base + 1), "-i", src, "-filter_complex", graph(tail), "-map", "[v]", "-frames:v", String(frames), ...enc(P.FPS), out], what);
    const out = path.join(P.media, `a${s.i}.mp4`);
    cut("", out, `A-roll ${s.i}`);
    if (s.variant === "AB5") cut(",gblur=sigma=26,eq=brightness=-0.10:saturation=0.65", path.join(P.media, `a${s.i}_blur.mp4`), `blurred A-roll ${s.i}`);
    const got = nbFrames(out);
    if (got !== frames) throw new Error(`a${s.i}.mp4 has ${got} frames, the timeline needs ${frames}`);
    console.log(`✓ a${s.i}.mp4 (${s.variant}, ${f3(s.len)} s = ${frames} frames, ${n} pieces, ${f3(s.cut)} s of pauses cut)`);
  }
  // B-roll clips: every { video } in the data, cover-cropped to 1920×1080 (or w×h), slowed by `speed`, long enough
  for (const b of brolls(P)) {
    if (P.only && !P.only.includes(b.seg)) continue;
    const need = b.need, speed = b.speed ?? 1, srcLen = dur(b.video) / speed;
    const pad = need > srcLen ? `,tpad=stop_mode=clone:stop_duration=${f3(need - srcLen + 0.2)}` : "";
    ff(["-ss", f3(b.from ?? 0), "-i", b.video, "-vf", `setpts=PTS/${speed},fps=${P.FPS},scale=${b.w}:${b.h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${b.w}:${b.h},setsar=1${pad}`,
      "-frames:v", String(Math.round(need * P.FPS)), ...enc(P.FPS), path.join(P.media, b.out)], `B-roll ${b.out}`);
    console.log(`✓ ${b.out} (${f3(need)} s from ${path.basename(b.video)}${speed !== 1 ? ` at ${speed}×` : ""})`);
  }
}

// every video the page uses besides the A-roll: { video, out, need (s), w, h, speed, from }
export function brolls(P) {
  const list = [];
  if (P.D.intro?.video) list.push({ video: P.D.intro.video, out: "intro_bg.mp4", need: P.INTRO, w: 1920, h: 1080, speed: P.D.intro.speed, from: P.D.intro.from, seg: -1 });
  for (const s of P.segs) {
    (s.broll ?? []).forEach((b, k) => list.push({ ...b, out: `b${s.i}_${k}.mp4`, need: s.len, w: 1920, h: 1080, seg: s.i }));
    (s.cards ?? []).forEach((c, k) => c.video && list.push({ ...c, out: `c${s.i}_${k}.mp4`, need: s.len, w: 960, h: 800, seg: s.i }));
    if (s.window?.video) list.push({ ...s.window, out: `w${s.i}.mp4`, need: s.len, w: 1280, h: 720, seg: s.i });
  }
  return list;
}

function buildVoice(P) {
  const out = path.join(P.media, "speech.wav"), parts = [], labels = [];
  for (const s of P.segs) for (const [a, b] of s.keep) { // the same pieces as the A-roll, 10 ms fades at every join
    const k = labels.length, d = b - a;
    parts.push(`[0:a]atrim=${f3(a)}:${f3(b)},asetpts=PTS-STARTPTS,aresample=48000,afade=t=in:d=0.01,afade=t=out:st=${f3(Math.max(0, d - 0.01))}:d=0.01,adelay=${Math.round(s.map(a) * 1000)}:all=1[p${k}]`);
    labels.push(`[p${k}]`);
  }
  // a silent bed of the full length is one more amix input: amix runs as long as its longest input, so the file is
  // exactly TOTAL even when the outro has no voice (apad after amix stopped early on FFmpeg 9, 2026-10-30)
  parts.push(`[1:a]aresample=48000[bed];[bed]${labels.join("")}amix=inputs=${labels.length + 1}:normalize=0:dropout_transition=0,atrim=0:${f3(P.TOTAL)}[out]`);
  mkdirSync(P.build, { recursive: true });
  const graph = path.join(P.build, "speech.graph.txt");
  writeFileSync(graph, parts.join(";\n"));
  const r = spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", "-i", P.D.aroll.voice, "-f", "lavfi", "-t", f3(P.TOTAL), "-i", "anullsrc=r=48000:cl=mono",
    "-/filter_complex", graph, "-map", "[out]", "-ac", "1", "-c:a", "pcm_s16le", "-ar", "48000", out], { stdio: "inherit" });
  if (r.status !== 0) throw new Error("speech.wav failed");
  const got = dur(out);
  if (Math.abs(got - P.TOTAL) > 0.02) throw new Error(`speech.wav is ${got} s, the video is ${P.TOTAL} s`);
  console.log(`✓ speech.wav (${P.segs.length} sections, ${f3(P.TOTAL)} s)`);
}

function buildAudioMix(P) {
  const cues = JSON.parse(readFileSync(path.join(P.build, "cues.json"), "utf8"));
  const m = P.D.music ?? {}, under = m.under_db ?? -24, up = m.up_db ?? -15;
  const env = [[0, up], [Math.max(0.1, P.INTRO - 0.3), up], [P.INTRO + 0.4, under]];
  const last = P.segs.at(-1).end;
  env.push([last - 0.2, under], [last + 0.5, up], [P.TOTAL - 1.4, up], [P.TOTAL, null]);
  buildMix({
    total: P.TOTAL, out: path.join(P.media, "mix.wav"), graphFile: path.join(P.build, "mix.graph.txt"),
    voice: { file: path.join(P.media, "speech.wav"), eq: P.D.aroll.voice_eq ?? false },
    music: m.file ? [{ file: m.file, at: 0, from: m.from ?? 0, env }] : [], cues,
  });
  console.log(`✓ mix.wav (${cues.length} sound effects, music ${under} dB under the voice)`);
}

function check(P) {
  const errors = [];
  for (const [k, f] of [["aroll.video", P.D.aroll.video], ["aroll.voice", P.D.aroll.voice], ["music.file", P.D.music?.file], ["intro.video", P.D.intro?.video]]) if (f && !existsSync(f)) errors.push(`${k}: ${f} not found`);
  for (const b of brolls(P)) if (!existsSync(b.video)) errors.push(`B-roll ${b.video} not found`);
  const VARS = ["AB1", "AB2", "AB3", "AB4", "AB5"];
  for (const s of P.segs) {
    if (!VARS.includes(s.variant)) errors.push(`section ${s.i + 1}: variant '${s.variant}' unknown (have ${VARS.join(", ")})`);
    if (s.len < 4) errors.push(`section ${s.i + 1}: only ${f3(s.len)} s — a style needs ≥ 4 s to land`);
    if (!s.words.length) errors.push(`section ${s.i + 1}: no words between ${s.from} and ${s.to} (wrong times or transcript?)`);
  }
  if (errors.length) throw new Error(errors.join("\n  "));
  const { cues, warn } = buildPage(P, { write: false });
  const SFX = JSON.parse(readFileSync(path.join(WS, "assets", "sfx", "manifest.json"), "utf8"));
  for (const f of new Set(cues.map((c) => c.file))) if (!SFX[f]) errors.push(`sound '${f}' is not in assets/sfx/manifest.json`);
  if (errors.length) throw new Error(errors.join("\n  "));
  for (const s of P.segs) {
    const w = s.words, first = w.slice(0, 3).map((x) => x.text).join(" "), last = w.slice(-3).map((x) => x.text).join(" ");
    console.log(`  ${s.i + 1} ${s.variant} source ${f3(s.from)}–${f3(s.to)} → final ${f3(s.at)}–${f3(s.end)} (${f3(s.len)} s, ${s.keep.length} pieces, ${f3(s.cut)} s of pauses cut) «${first} … ${last}»`);
    const sliver = s.keep.find(([a, b]) => b - a < 0.2);
    if (sliver) warn.push(`section ${s.i + 1}: a kept piece of only ${f3(sliver[1] - sliver[0])} s at ${f3(sliver[0])} (a 'from'/'to' inside a pause?) — move the cut point into the pause's middle`);
    if (w.length && w[0].start - s.from > 1.0) warn.push(`section ${s.i + 1}: the first caption word starts ${f3(w[0].start - s.from)} s after 'from' — speech without captions, or a word the transcriber missed (look with the pauses step)`);
    if (w.length && s.to - w.at(-1).end > 1.0) warn.push(`section ${s.i + 1}: the last caption word ends ${f3(s.to - w.at(-1).end)} s before 'to'`);
  }
  for (const x of warn) if (x.startsWith("section")) console.log(`  ! ${x}`);
  console.log(`✓ check: data OK${warn.length ? ` (${warn.length} warning(s))` : ""}`);
}

// PLAN.md for the plan gate (§0e), written from the data: the shot table from the page's own beats and cues, the
// script from the words with their measured starts. Only over the empty template unless --force.
function plan(P, { force } = {}) {
  const file = path.join(P.dir, "PLAN.md"), tpl = readFileSync(path.join(WS, "tools", "plan", "TEMPLATE.md"), "utf8");
  if (existsSync(file) && readFileSync(file, "utf8") !== tpl && !force) throw new Error("PLAN.md already has a plan: run plan --force to overwrite it");
  const { cues, beats, caps } = buildPage(P, { write: false });
  const bnd = (s) => String(s).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
  const mmss = (t) => bnd(`${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`);
  // the script: one line per sentence, with its measured start on the final video
  const lines = [];
  for (const s of P.segs) { let cur = []; s.words.forEach((w, k) => { cur.push(w); if (/[।?!]$/.test(w.text) || k === s.words.length - 1) { lines.push({ at: s.map(cur[0].start), text: cur.map((q) => q.text).join(" ") }); cur = []; } }); }
  // shots: cut at the intro, every section, every beat (≥ 1.2 s apart), the outro. A shot longer than plan-check's
  // limit (3 s up to 90 s of video, else 8 s) is cut again where the caption changes (a real change on screen).
  const LIMIT = P.TOTAL <= 90 ? 3 : 7.5;
  const marks = [0, ...P.segs.map((s) => s.at), ...beats.map((b) => b[0]), P.segs.at(-1).end].filter((t) => t >= 0 && t < P.TOTAL - 0.5).sort((a, b) => a - b);
  const cuts = []; for (const t of marks) if (!cuts.length || t - cuts.at(-1) >= 1.2) cuts.push(+t.toFixed(1));
  cuts.push(+P.TOTAL.toFixed(1));
  const rows = [];
  for (let i = 0; i + 1 < cuts.length; i++) {
    let a = cuts[i]; const b = cuts[i + 1];
    while (b - a > LIMIT) { // the last caption change within `limit` after a (else the first after it), ≥ 1.2 s from both ends
      const cand = caps.map((x) => +x[0].toFixed(1)).filter((t) => t >= a + 1.2 && t <= b - 1.2);
      const c = cand.filter((t) => t <= a + LIMIT).at(-1) ?? cand[0];
      if (c === undefined) break;
      rows.push([a, c, rows.length && rows.at(-1)[1] === a]); a = c;
    }
    rows.push([a, b, a !== cuts[i]]);
  }
  const vname = { AB1: "গ্লাস স্প্লিট", AB2: "বাবল কাট", AB3: "পাঞ্চ টাইপ", AB4: "কার্ড ফ্যান", AB5: "ডেটা স্টেজ" };
  let lastText = "";
  const table = rows.map(([a, b, cont]) => {
    const seg = P.segs.find((s) => a >= s.at - 0.05 && a < s.end - 0.05);
    const here = beats.filter((x) => x[0] >= a - 0.05 && x[0] < b - 0.05).map((x) => x[1]);
    let what = here.length ? here.join("; ") : `চলতে থাকে: ${lastText}`;
    if (here.length) lastText = here.at(-1);
    if (seg && Math.abs(seg.at - a) < 0.1) what = `**${seg.variant} ${vname[seg.variant]}** · ${what}`;
    if (!here.length) { // a shot cut at a caption change: say which caption comes
      const cap = caps.find((x) => Math.abs(x[0] - a) < 0.1);
      what = `চলতে থাকে: ${lastText}${cap ? `; ক্যাপশন বদলায়: «${cap[3].map((w) => w[1]).join(" ")}»` : ""}`;
    }
    const counts = {}; for (const c of cues) if (c.t >= a - 0.05 && c.t < b - 0.05) counts[c.file] = (counts[c.file] ?? 0) + 1;
    const snd = [...Object.entries(counts).map(([f, n]) => `\`${f}\`${n > 1 ? ` ×${bnd(n)}` : ""}`), ...lines.map((l, k) => (l.at >= a - 0.05 && l.at < b - 0.05 ? `ভয়েস ${bnd(k + 1)}` : null)).filter(Boolean)];
    return `| ${a}–${b} | ${what.replace(/\|/g, "\\|")} | — | ${snd.join(", ") || (seg ? "ভয়েস চলছে" : "মিউজিক")} |`;
  });
  const D = P.D, pl = D.plan ?? {};
  const md = `# প্ল্যান: ${D.title ?? "A-roll + B-roll"}

<!-- Written by tools/abroll/build.mjs plan from abroll.json (${new Date().toLocaleDateString("sv-SE")}). Change the data, not this file, then run plan --force. -->

ফরম্যাট: 16:9
দৈর্ঘ্য: ${P.TOTAL.toFixed(1)} সেকেন্ড
প্ল্যাটফর্ম: ${pl.platform ?? "YouTube / Facebook"}
ধরন: ${pl.kind ?? "কথা-বলা ভিডিও + B-roll"}
ভয়েস: নিজের গলা (রেকর্ডিং থেকে)
মিউজিক: ${D.music?.file ? path.basename(D.music.file) : "নেই"}
আউটপুট: 16:9
পুরো ভিডিও জুড়ে: শব্দে-শব্দে বাংলা ক্যাপশন (বলা শব্দটা সোনালি)${D.badges !== false ? ", কোণে স্টাইলের নাম-ব্যাজ" : ""}

## লক্ষ্য

${pl.goal ?? "দর্শক কথাটা শুনবে আর প্রতিটা মূল কথা পর্দায় ছবিতে দেখবে।"}

## হুক (প্রথম ২ সেকেন্ড)

${pl.hook ?? beats[0]?.[1] ?? "—"}

## স্টাইলের ক্রম

${P.segs.map((s) => `- ${mmss(s.at)}–${mmss(s.end)} **${s.variant} ${vname[s.variant]}** (উৎসের ${s.from}–${s.to} সে.)`).join("\n")}

## স্ক্রিপ্ট

${lines.map((l, k) => `${bnd(k + 1)}. (${mmss(l.at)}) ${l.text}`).join("\n")}

## শট টেবিল

| সময় | পর্দায় কী | ক্যাপশন / লেখা | শব্দ |
| --- | --- | --- | --- |
${table.join("\n")}

## STYLE.md আর LESSONS.md থেকে যা মানছি

- ফন্ট দুটো পরিবার: লেখা আর ক্যাপশনে Hind Siliguri, টাইটেল আর বড় সংখ্যায় Baloo Da 2। বাংলায় letter-spacing নেই; টিক আর তীর SVG-তে আঁকা (STYLE §৩)।
- ক্যাপশন: সাদা লেখা কালো বর্ডারে, বলা শব্দটা হলুদ-সোনালি, প্রায় ৫৫ px, বাক্য শেষে নতুন লাইন, বাংলা অঙ্ক, মুখ ঢাকে না (STYLE §৪, §১৩)।
- ০.৪ সেকেন্ডের বেশি চুপ থাকা অংশ কাটা, দুপাশে ০.১৫ সেকেন্ড শ্বাস রেখে; এই ভিডিওতে মোট ${bnd(P.segs.reduce((t, x) => t + x.cut, 0).toFixed(1))} সেকেন্ড (STYLE §৫)।
- প্রতিটা জুম আর ক্যামেরা-ঠেলা শেষে আসল মাপে (১×) থামে (STYLE §৫, শেখা)।
- প্রতিটা দৃশ্য বদলে whoosh, ছোট ঘটনায় click বা pop, সংখ্যা গোনায় typing, impact-bass-1 ছোট করে কাটা (STYLE §৭)।
- মিউজিক ভয়েসের নিচে (${D.music?.under_db ?? -24} dB), শেষে আস্তে থামে (STYLE §৭)।
- B-roll: আগে নিজের ক্লিপ, তারপর কোডে আঁকা দৃশ্য; AI-তৈরি মানুষের মুখ নয়, চেনা মানুষের স্টক ছবি নয় (STYLE §৯, §১৩)।
- ক্যাপশন পুরো ভিডিও জুড়ে (CLAUDE.md §0h)। ৬০ সেকেন্ডের বেশি হলে রেন্ডারের আগে preflight; রেন্ডারের পর প্রতি আধা সেকেন্ডের ছবি দেখা (LESSONS ২০২৬-১০-০৬, ১০-২৯)।

## যা লাগবে

- রেকর্ডিং: ${path.basename(D.aroll.video)} · ভয়েস: ${path.basename(D.aroll.voice)} (তৈরি)
- B-roll: ${[...new Set(brolls(P).map((b) => path.basename(b.video)))].join(", ") || "কোডে আঁকা দৃশ্য"}${P.segs.some((s) => s.window && !s.window.video || s.cards?.some((c) => !c.video) || s.variant === "AB5") ? " + কোডে আঁকা দৃশ্য (খরচ নেই)" : ""}
- সাউন্ড: assets/sfx থেকে (${new Set(cues.map((c) => c.file)).size} রকম, মোট ${cues.length}টা)

## প্রশ্ন

${(pl.questions ?? []).map((q) => `- ${q}`).join("\n") || "- নেই"}
`;
  writeFileSync(file, md);
  console.log(`✓ PLAN.md (${rows.length} shots, ${lines.length} voice lines) — now: node tools/plan-check.mjs ${path.relative(WS, P.dir).replace(/\\/g, "/")}`);
}

const STEPS = { check, media: buildMedia, voice: buildVoice, page: (P) => buildPage(P), mix: buildAudioMix };
if (process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === import.meta.filename.toLowerCase()) {
  const argv = process.argv.slice(2);
  const dirArg = argv.find((a) => !a.startsWith("--"));
  const named = argv.filter((a) => !a.startsWith("--")).slice(1);
  if (named[0] === "pauses") { // node tools/abroll/build.mjs projects/<name> pauses <from s> <to s>
    const D = JSON.parse(readFileSync(path.join(path.resolve(dirArg), "abroll.json"), "utf8")), [a, b] = named.slice(1).map(Number);
    if (!(b > a)) { console.error("Usage: … pauses <from s> <to s>"); process.exit(1); }
    const ps = pausesIn(D.aroll.voice, a, b, D.pause_db ?? -42);
    const list = ps.map(([x, y]) => `  ${f3(x)}–${f3(y)}${y - x > (D.tighten ?? 0.4) ? " (cut)" : ""}`);
    console.log([`pauses ≥ 0.16 s in ${a}–${b} (speech is between them):`, ...(list.length ? list : ["  none"])].join("\n"));
    process.exit(0);
  }
  if (!dirArg || named.some((s) => !STEPS[s] && s !== "plan")) { console.error(`Usage: node tools/abroll/build.mjs projects/<name> [plan [--force] | ${Object.keys(STEPS).join("|")} …] [--media=<dir>]`); process.exit(1); }
  try {
    const P = loadProject(dirArg, { media: argv.find((a) => a.startsWith("--media="))?.slice(8) });
    P.only = argv.find((a) => a.startsWith("--only="))?.slice(7).split(",").map(Number); // media: only these sections (0-based)
    console.log(`${P.segs.length} sections · ${P.segs.map((s) => `${s.variant} ${f3(s.len)} s`).join(" · ")} · TOTAL ${f3(P.TOTAL)} s`);
    if (named.includes("plan")) { plan(P, { force: argv.includes("--force") }); process.exit(0); }
    for (const s of Object.keys(STEPS)) if (!named.length || named.includes(s)) { console.log(`── ${s}`); await STEPS[s](P); }
  } catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }
}
