// timeline.mjs — the single timing source of a screen tutorial (skill screen-tutorial), from DATA in
// projects/<name>/build/tutorial.json. Everything is counted in frames at cfg.fps.
//   final video = intro    (source 0 → frames.screen_from: his facecam, his own audio, 1:1)
//               + screen   (frames.screen_from → frames.screen_to: the recording re-timed to the voice-over)
//               + outro    (frames.screen_to → frames.video_end: facecam again; frames.outro_cut is removed if given)
// The screen part is driven by the voice: voice.pauses (≥ 1.2 s, measured) shrink to 2 × pause_keep and voice.cuts
// are removed; between ANCHORS ([voice s, source s]: a spoken word and the screen moment it belongs to) the recording
// plays at the speed that fits the voice: normal action at 0.8–1.7×, screen.waits ramped 1.8–3×, screen.cuts
// removed; a short screen is held on its last frame, a long one leaves a silence in the voice (the music carries it).
//   import { loadProject, projectFromArgv } from "./timeline.mjs"
//   const P = loadProject("projects/<name>", { media })   → { dir, build, media, cfg, TL }
//   TL = { FPS, TOTAL, TOTAL_F, intro, screen: { at, end, pieces }, voice, outro, marks, S, Sinv, V, SRC }
//     S(source s) → final s · Sinv(final s) → source s (screen part) · V(voice s) → final s
//   node tools/tutorial/timeline.mjs projects/<name>      (prints the summary)
// Verified 2026-10-29 on projects/claude-video-tutorial: the same 111 pieces (26 holds), 49 voice pieces, 30619
// frames and the same S/V/Sinv values as its hand-written build/timeline.mjs.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export function makeTimeline(cfg) {
  const FPS = cfg.fps;
  const fr = (s) => Math.round(s * FPS);
  const sec = (f) => f / FPS;
  const SRC = cfg.src;
  const SCREEN_A = cfg.frames.screen_from / FPS, SCREEN_B = cfg.frames.screen_to / FPS; // facecam ↔ screen boundaries
  const VIDEO_END = cfg.frames.video_end / FPS;
  const OUTRO_CUT = cfg.frames.outro_cut ? cfg.frames.outro_cut.map((f) => f / FPS) : null;
  const [ACT_MIN, ACT_MAX] = cfg.screen.speed?.act ?? [0.8, 1.7];
  const [WAIT_MIN, WAIT_MAX] = cfg.screen.speed?.wait ?? [1.8, 3];

  // voice pauses keep pause_keep s on both sides; voice cuts go whole
  const KEEP = cfg.voice.pause_keep ?? 0.25;
  const PAUSES = cfg.voice.pauses;
  const VOICE_CUTS = cfg.voice.cuts.map(([a, b]) => [a, b]);
  const VOICE_END = cfg.voice.end;
  const drops = [];
  for (const d of [...PAUSES.map(([a, b]) => [a + KEEP, b - KEEP]), ...VOICE_CUTS].sort((x, y) => x[0] - y[0])) {
    const l = drops.at(-1);
    if (l && d[0] <= l[1]) l[1] = Math.max(l[1], d[1]); else drops.push([...d]);
  }

  // screen stretches removed / ramped (source s)
  const CUTS = cfg.screen.cuts.map(([a, b]) => [a, b]);
  const WAITS = cfg.screen.waits.map(([a, b, speed]) => [a, b, speed]);
  const ANCHORS = [[0, SCREEN_A], ...cfg.screen.anchors, [VOICE_END, SCREEN_B]];

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
  let f = fr(SCREEN_A); // the final frame counter (intro = source frames 0..screen_from, 1:1)
  const pieces = [], voice = [], marks = [];
  for (let i = 0; i + 1 < ANCHORS.length; i++) {
    const [v0, s0] = ANCHORS[i], [v1, s1] = ANCHORS[i + 1];
    const Lv = vt(v1) - vt(v0);
    const parts = split(s0, s1);
    const T0 = parts.reduce((s, p) => s + (p.b - p.a) / (p.wait ?? 1), 0);
    const k = T0 / Lv; // > 1: the screen is longer than the voice
    const actSpeed = Math.min(ACT_MAX, Math.max(ACT_MIN, k));
    const start = f;
    marks.push({ v: v0, s: s0, f });
    for (const p of parts) {
      const speed = p.wait ? Math.min(WAIT_MAX, Math.max(WAIT_MIN, p.wait * Math.max(1, k))) : actSpeed;
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

  // outro: source frames screen_to.. with the outro cut (if any) taken out
  const outro = OUTRO_CUT
    ? [{ a: SCREEN_B, b: OUTRO_CUT[0], at: sec(screenEnd) }, { a: OUTRO_CUT[1], b: VIDEO_END, at: sec(screenEnd + fr(OUTRO_CUT[0] - SCREEN_B)) }]
    : [{ a: SCREEN_B, b: VIDEO_END, at: sec(screenEnd) }];
  const TOTAL_F = OUTRO_CUT
    ? screenEnd + fr(OUTRO_CUT[0] - SCREEN_B) + fr(VIDEO_END - OUTRO_CUT[1])
    : screenEnd + fr(VIDEO_END - SCREEN_B);

  // source s → final s. Inside a held frame the time is the hold's start; inside a cut, the cut's end.
  function S(s) {
    if (s < SCREEN_A) return s;
    if (s >= SCREEN_B) {
      if (!OUTRO_CUT || s < OUTRO_CUT[0]) return sec(screenEnd) + (s - SCREEN_B);
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

  return {
    FPS, TOTAL: sec(TOTAL_F), TOTAL_F,
    intro: { a: 0, b: SCREEN_A },
    screen: { at: SCREEN_A, end: sec(screenEnd), pieces },
    voice: vmerged, outro, marks, S, Sinv, V, SRC,
  };
}

// projects/<name> → { dir, build, media, cfg, TL }; media defaults to <project>/assets/media (a junction to C:)
export function loadProject(dirArg, { media } = {}) {
  const dir = path.resolve(dirArg);
  const build = path.join(dir, "build");
  const file = path.join(build, "tutorial.json");
  if (!existsSync(file)) throw new Error(`${file} not found (start the project with: node tools/new-video.mjs <name> --kind=screen-tutorial)`);
  const cfg = JSON.parse(readFileSync(file, "utf8"));
  return { dir, build, media: media ? path.resolve(media) : path.join(dir, "assets", "media"), cfg, TL: makeTimeline(cfg) };
}

// the project and the shared flags of every tools/tutorial CLI: <project> [--media=<dir>] [--only=i,j]
export function projectFromArgv(argv = process.argv.slice(2)) {
  const dir = argv.find((a) => !a.startsWith("--"));
  if (!dir) { console.error("Usage: node tools/tutorial/<step>.mjs projects/<name> [--media=<dir>]"); process.exit(1); }
  const media = argv.find((a) => a.startsWith("--media="))?.slice(8);
  const only = argv.find((a) => a.startsWith("--only="))?.slice(7).split(",").map(Number);
  return { P: loadProject(dir, { media }), only };
}

export const isMain = (meta) => !!process.argv[1] && meta.filename.toLowerCase() === path.resolve(process.argv[1]).toLowerCase();
// run a step module as a command: errors print as one ✗ line and exit 1
export async function cli(meta, fn) {
  if (!isMain(meta)) return;
  try { await fn(projectFromArgv()); } catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }
}

export function summary(TL) {
  const m = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, "0")}`;
  const { pieces } = TL.screen;
  return `screen ${m(TL.screen.at)}–${m(TL.screen.end)} · ${pieces.length} pieces (${pieces.filter((p) => p.kind === "hold").length} holds) · ${TL.voice.length} voice pieces\n` +
    `outro ${m(TL.outro[0].at)}–${m(TL.TOTAL)} · TOTAL ${m(TL.TOTAL)} (${TL.TOTAL_F} frames)`;
}

await cli(import.meta, ({ P }) => console.log(summary(P.TL)));
