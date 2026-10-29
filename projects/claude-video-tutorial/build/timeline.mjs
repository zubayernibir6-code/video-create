// The single timing source for the tutorial (PLAN.md, approved 2026-10-29). Everything is in 60 fps frames.
//   final video = intro (Video.mp4 0–45.167, his own audio)
//               + screen part (Video.mp4 45.167–566.183, re-timed to Voice.m4a)
//               + outro (Video.mp4 566.183–end, his own audio, 601.25–610.217 cut: the "private access" offer)
// The screen part is driven by the voice: pauses ≥ 1.2 s shrink to 0.5 s and four stretches are cut (below);
// between ANCHORS (voice s ↔ source s, each a spoken word matched to a screen moment, measured 2026-10-29 from
// voice.words.json + moments.json) the recording plays at the speed that fits the voice: normal action at
// 0.8–1.7×, WAITS ramped 1.8–3×, CUTS removed; a short screen is held on its last frame, a long one leaves a
// silence in the voice (music carries it).
//   import { TL } from "./timeline.mjs"   → { FPS, TOTAL, intro, screen: { at, end, pieces }, voice, outro, S, V }

export const FPS = 60;
const fr = (s) => Math.round(s * FPS);
const sec = (f) => f / FPS;

export const SRC = {
  video: "C:/Users/Zubayer Nibir/Downloads/Claude Video Create/Video2/Video.mp4", // 1920×1080, 60 fps, 612.567 s
  voice: "C:/Users/Zubayer Nibir/Downloads/Claude Video Create/Video2/Voice.m4a", // 494.1 s, mono 44.1 kHz
  bgm: "C:/Users/Zubayer Nibir/Downloads/Claude Video Create/Video2/BGM.mp3", // 145.66 s
};
const SCREEN_A = 2710 / FPS, SCREEN_B = 33971 / FPS; // 45.1667, 566.1833: facecam ↔ screen recording boundaries
const VIDEO_END = 36754 / FPS; // 612.567
const OUTRO_CUT = [36075 / FPS, 36613 / FPS]; // 601.25–610.217: after "…Claude Max প্ল্যান", before "আসসালামু আলাইকুম"
// (energy dips measured on outro16.wav, 2026-10-29)

// voice pauses ≥ 1.2 s (adaptive RMS, 2026-10-28); each keeps 0.25 s on both sides
const PAUSES = `40.18-42.58 45.06-46.98 48.64-54.86 54.96-57.22 67.72-69.44 71.88-73.36 79.46-81.18 81.28-83.40 91.46-93.12
98.50-100.30 103.26-104.70 120.42-122.08 134.28-136.36 141.60-144.20 182.92-184.56 194.10-195.72 196.56-198.22 224.56-227.64
235.32-237.10 245.84-247.38 247.52-249.78 250.94-253.84 254.98-256.64 271.88-273.84 292.04-295.32 297.18-301.90 302.98-304.26
308.08-309.32 309.42-317.20 317.30-319.58 372.24-373.76 378.50-381.38 429.06-430.48 431.68-433.34 438.44-441.32 443.88-445.46
447.44-449.64 450.34-453.40 472.92-475.06 490.28-493.68`.split(/\s+/).map((p) => p.split("-").map(Number));
const VOICE_CUTS = [
  [121.4, 123.95], // the repeated "দেখতে পাচ্ছেন" (his brief, scene 4)
  [179.7, 184.15], // unclear mumble after "এই ইনভায়রনমেন্টে"
  [309.0, 325.45], // 16 s of no speech (voice previews heard while recording)
  [447.55, 452.35], // the cough after "ফাইলটা ওপেন করি" (his brief, scene 9)
];
const VOICE_END = 490.6;
const drops = [];
for (const d of [...PAUSES.map(([a, b]) => [a + 0.25, b - 0.25]), ...VOICE_CUTS].sort((x, y) => x[0] - y[0])) {
  const l = drops.at(-1);
  if (l && d[0] <= l[1]) l[1] = Math.max(l[1], d[1]); else drops.push([...d]);
}

// screen stretches removed / ramped (source s)
export const CUTS = [
  [93.2, 109.2], // generate spinner + recording jump
  [113.8, 115.3], // Aero Peek: desktop, personal shortcuts
  [160.5, 166.6], [206.6, 213.0], // idle screens
  [258.3, 268.5], // Windows search (his brief: cut 4:18–4:28.5)
  [362.15, 362.6], // the full e-mail address is visible
  [477.4, 483.4], // detour to Chrome
  [506.7, 517.3], // a report from an unrelated later task (PLAN question 4)
];
export const WAITS = [ // [from, to, speed]
  [85.75, 93.2, 2.2], [173.5, 195.05, 3], [254.8, 258.2, 2.5], [287.8, 292.5, 2.5], [297.5, 305, 2.5], [331.5, 346.7, 2.5],
  [349.6, 355.4, 2], [384, 399.3, 2.2], [421.4, 423.3, 2], [466.6, 474.3, 2],
];
// [voice s, source s]: the spoken word and the screen moment it belongs to
const ANCHORS = [[0, SCREEN_A], [9.05, 59.5], [12.71, 62.9], [15.21, 66.6], [20.87, 70.5], [25.84, 73], [33.52, 80.3],
  [38.38, 82.9], [42.6, 84.35], [47.56, 85.75], [56.88, 119.7], [70.81, 127.4], [73.15, 136], [77.51, 136.7], [83.55, 143.5],
  [93.83, 156.4], [100.71, 159.4], [106.61, 166.7], [119.03, 195.3], [124.49, 199.3], [128.47, 203], [136, 214.3],
  [143.13, 227.2], [145.38, 228], [166.78, 245.2], [176.9, 254.6], [184.22, 269.5], [199.21, 286.6], [203.9, 292.5],
  [218.34, 307.2], [221.9, 313.6], [228.82, 318.3], [232.96, 323.9], [250.19, 344.5], [254.44, 349.6], [261.04, 356.6],
  [267.06, 358.6], [270.12, 361.2], [274.14, 366.2], [281.46, 369.3], [286.78, 374.2], [290.04, 379.3], [325.59, 400.4],
  [326.71, 401.7], [334.15, 408.3], [337.31, 410.8], [345.4, 414.8], [347.64, 420.7], [355.54, 420.9], [356.22, 429.6],
  [360.18, 435], [362.52, 439], [365.28, 442.85], [375.44, 449.7], [381.38, 454.5], [432.52, 517.35], [446.58, 522],
  [452.46, 526.2], [468.5, 538.5], [475.59, 550.2], [484.95, 555.45], [VOICE_END, SCREEN_B]];

// voice time with the dropped stretches taken out
const vt = (v) => { let t = v; for (const [a, b] of drops) { if (v >= b) t -= b - a; else if (v > a) t -= v - a; } return t; };
// the kept voice pieces between v0 and v1
const voiceKept = (v0, v1) => {
  const out = []; let a = v0;
  for (const [c, d] of drops) { if (d <= a || c >= v1) continue; if (c > a) out.push([a, c]); a = Math.max(a, d); }
  if (a < v1) out.push([a, v1]);
  return out.filter(([x, y]) => y - x > 0.005);
};
// split a source stretch into [a, b, kind, speed] by CUTS and WAITS
function split(s0, s1) {
  const marks = new Set([s0, s1]);
  for (const [a, b] of [...CUTS, ...WAITS]) for (const m of [a, b]) if (m > s0 && m < s1) marks.add(m);
  const xs = [...marks].sort((a, b) => a - b), out = [];
  for (let i = 0; i + 1 < xs.length; i++) {
    const a = xs[i], b = xs[i + 1], mid = (a + b) / 2;
    if (CUTS.some(([c, d]) => mid >= c && mid < d)) continue;
    const w = WAITS.find(([c, d]) => mid >= c && mid < d);
    out.push(w ? { a, b, wait: w[2] } : { a, b });
  }
  return out;
}

// ── build ──
let f = fr(SCREEN_A); // the final frame counter (intro = source frames 0..2710, 1:1)
const pieces = [], voice = [], marks = [];
for (let i = 0; i + 1 < ANCHORS.length; i++) {
  const [v0, s0] = ANCHORS[i], [v1, s1] = ANCHORS[i + 1];
  const Lv = vt(v1) - vt(v0);
  const parts = split(s0, s1);
  const act = parts.filter((p) => !p.wait).reduce((s, p) => s + p.b - p.a, 0);
  const T0 = parts.reduce((s, p) => s + (p.b - p.a) / (p.wait ?? 1), 0);
  const k = T0 / Lv; // > 1: the screen is longer than the voice
  const actSpeed = Math.min(1.7, Math.max(0.8, k));
  const start = f;
  marks.push({ v: v0, s: s0, f });
  for (const p of parts) {
    const speed = p.wait ? Math.min(3, Math.max(1.8, p.wait * Math.max(1, k))) : actSpeed;
    const frames = Math.max(1, fr((p.b - p.a) / speed));
    pieces.push({ kind: "play", a: p.a, b: p.b, speed: (p.b - p.a) / sec(frames), at: f, frames, wait: !!p.wait });
    f += frames;
  }
  const lvFrames = fr(Lv);
  if (f - start < lvFrames) { // the screen ran out before the voice: hold the last frame
    const frames = lvFrames - (f - start);
    pieces.push({ kind: "hold", src: s1 - 1 / FPS, at: f, frames });
    f += frames;
  }
  let vf = start; // voice pieces start with the stretch
  for (const [a, b] of voiceKept(v0, v1)) { voice.push({ from: a, to: b, at: sec(vf) }); vf += fr(b - a); }
}
marks.push({ v: VOICE_END, s: SCREEN_B, f });
const screenEnd = f;
// merge touching voice pieces (fewer filter inputs; same audio)
const vmerged = [];
for (const p of voice) {
  const l = vmerged.at(-1);
  if (l && Math.abs(l.to - p.from) < 1e-6 && Math.abs(l.at + (l.to - l.from) - p.at) < 0.02) l.to = p.to; else vmerged.push({ ...p });
}

// outro: source frames 33971.. with the offer cut out
const outro = [
  { a: SCREEN_B, b: OUTRO_CUT[0], at: sec(screenEnd) },
  { a: OUTRO_CUT[1], b: VIDEO_END, at: sec(screenEnd + fr(OUTRO_CUT[0] - SCREEN_B)) },
];
const TOTAL_F = screenEnd + fr(OUTRO_CUT[0] - SCREEN_B) + fr(VIDEO_END - OUTRO_CUT[1]);

// source s (screen part) → final s. Inside a held frame the time is the hold's start; inside a cut, the cut's end.
function S(s) {
  if (s < SCREEN_A) return s;
  if (s >= SCREEN_B) {
    if (s < OUTRO_CUT[0]) return sec(screenEnd) + (s - SCREEN_B);
    return outro[1].at + Math.max(0, s - OUTRO_CUT[1]);
  }
  for (const p of pieces) if (p.kind === "play" && s >= p.a && s < p.b) return sec(p.at) + (s - p.a) / p.speed;
  const next = pieces.find((p) => p.kind === "play" && p.a >= s);
  return next ? sec(next.at) : sec(screenEnd);
}
// final s → source s (screen part only; holds return the held frame)
function Sinv(t) {
  const tf = t * FPS;
  for (const p of pieces) if (tf >= p.at && tf < p.at + p.frames) return p.kind === "hold" ? p.src : p.a + (tf - p.at) / FPS * p.speed;
  return null;
}
// voice s → final s
function V(v) {
  const p = voice.find((q) => v >= q.from && v < q.to) ?? voice.find((q) => q.from >= v);
  return p ? p.at + Math.max(0, v - p.from) : sec(screenEnd);
}

export const TL = {
  FPS, TOTAL: sec(TOTAL_F), TOTAL_F,
  intro: { a: 0, b: SCREEN_A },
  screen: { at: SCREEN_A, end: sec(screenEnd), pieces },
  voice: vmerged, outro, marks, S, Sinv, V, SRC,
};

if (process.argv[1] && import.meta.filename.toLowerCase() === (await import("node:path")).resolve(process.argv[1]).toLowerCase()) {
  const m = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, "0")}`;
  console.log(`screen ${m(SCREEN_A)}–${m(sec(screenEnd))} · ${pieces.length} pieces (${pieces.filter((p) => p.kind === "hold").length} holds) · ${vmerged.length} voice pieces`);
  console.log(`outro ${m(outro[0].at)}–${m(sec(TOTAL_F))} · TOTAL ${m(sec(TOTAL_F))} (${TOTAL_F} frames)`);
}
