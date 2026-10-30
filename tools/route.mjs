#!/usr/bin/env node
// route.mjs — "what kind of video is this?" Looks at every file in the folder he hands over and says which SHAPE
// of material it is and which named styles (tools/variants.json, his guide VARIANTS.md) can be made from it.
//   node tools/route.mjs <folder | file …> [--json=<out.json>] [--step=<s>]
// Per video: size, orientation, fps, length; a LOOK timeline from sampled frames (black bars trimmed first):
//   camera   natural footage (his face, a phone clip, AI-generated realistic video): few perfectly flat pixels
//   screen   a screen recording: large flat UI areas, sharp text edges, little change between samples
//   graphics motion design / slides: flat and sharp like a screen but changing between samples
//   black    a dark frame
// and how much of its own audio is speech (tools/route-vad.py: silero VAD inside faster-whisper, offline).
// Per audio file: speech (voice-over) / music / silence. Images are counted.
// Then the folder's SHAPE (S1…S7 below) and the variant ids that fit, best first, with the questions to ask him.
// Nothing is written into his folder (--json writes the report where you say).
// Shapes: S1 screen + facecam ends + separate voice · S2 screen + separate voice · S3 screen with live voice ·
//         S4 talking head · S5 voice (+ music), no footage · S6 clips without speech (B-roll) · S7 pictures only ·
//         S? an unusual mix (it says so and asks; it never guesses).
// Verified 2026-10-30 on real files (≈ 70–110 s per folder, mostly frame grabs):
//   claude-video-tutorial/Video2 → camera 0:00–0:43 · screen 0:43–9:26 · camera 9:26–10:13 (true switches 0:45.2 and
//     9:26.2), Voice.m4a speech 396 s, BGM.mp3 music → S1 → TUT1
//   "my rc video" (his 11-min talk) → camera all through, 629 s speech → S4 → EP1 / AB variants
//   his AI clips (futuristic city, girl in a room) → camera, no speech (B-roll); BGM files → music
// Known limit: an already-edited motion-graphics video (a finished render) can read as camera or screen in parts; with
// such files in the mix the shape comes out S? and it asks.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..");
const PY = path.join(WS, "tools", "pyenv", "Scripts", "python.exe");
const VARIANTS = JSON.parse(readFileSync(path.join(WS, "tools", "variants.json"), "utf8")).variants;
const W = 640, H = 360;
const VIDEO = /\.(mp4|mov|mkv|webm|avi|m4v)$/i, AUDIO = /\.(m4a|mp3|wav|aac|ogg|opus|flac)$/i, IMAGE = /\.(jpe?g|png|webp|heic)$/i;

const argv = process.argv.slice(2);
const jsonOut = argv.find((a) => a.startsWith("--json="))?.slice(7);
const stepArg = Number(argv.find((a) => a.startsWith("--step="))?.slice(7)) || 0;
const inputs = argv.filter((a) => !a.startsWith("--"));
if (!inputs.length) { console.error("Usage: node tools/route.mjs <folder | file …> [--json=<out.json>]"); process.exit(1); }
const files = inputs.flatMap((p) => (statSync(p).isDirectory() ? readdirSync(p).map((f) => path.join(p, f)).filter((f) => statSync(f).isFile()) : [p]));

const probe = (f) => JSON.parse(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,r_frame_rate:stream_tags=rotate", "-of", "json", f], { encoding: "utf8" }).stdout || "{}");
const grab = (f, t) => new Promise((done) => {
  const c = spawn("ffmpeg", ["-v", "error", "-ss", t.toFixed(2), "-i", f, "-frames:v", "1", "-vf", `scale=${W}:${H}:flags=area,format=gray`, "-f", "rawvideo", "-"]);
  const parts = []; c.stdout.on("data", (d) => parts.push(d)); c.on("close", () => { const b = Buffer.concat(parts); done(b.length === W * H ? b : null); });
});
async function pool(items, n, fn) { const out = new Array(items.length); let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } })); return out; }

// the picture area without black bars: rows/columns whose mean < 10 and max < 40
function activeBox(p) {
  const dark = (get, n, len) => { let s = 0, m = 0; for (let k = 0; k < len; k++) { const v = get(k); s += v; if (v > m) m = v; } return s / len < 10 && m < 40; };
  let x0 = 0, x1 = W - 1, y0 = 0, y1 = H - 1;
  while (x0 < x1 && dark((k) => p[k * W + x0], 0, H)) x0++;
  while (x1 > x0 && dark((k) => p[k * W + x1], 0, H)) x1--;
  while (y0 < y1 && dark((k) => p[y0 * W + k], 0, W)) y0++;
  while (y1 > y0 && dark((k) => p[y1 * W + k], 0, W)) y1--;
  return { x0, x1, y0, y1 };
}
// flat = share of pixels equal to both neighbours; edge = share with a sharp step; top4 = share of the 4 commonest
// grey levels (UI backgrounds); mean = brightness
function metrics(p, b) {
  let flat = 0, edge = 0, n = 0, sum = 0; const hist = new Uint32Array(256);
  for (let y = b.y0 + 1; y <= b.y1; y++) for (let x = b.x0 + 1; x <= b.x1; x++) {
    const i = y * W + x, a = p[i], g = Math.abs(a - p[i - 1]) + Math.abs(a - p[i - W]);
    if (g === 0) flat++; if (g > 60) edge++; hist[a]++; sum += a; n++;
  }
  if (n < 1000) return { flat: 1, edge: 0, top4: 1, mean: 0 };
  const top4 = [...hist].sort((x, y) => y - x).slice(0, 4).reduce((s, v) => s + v, 0);
  return { flat: flat / n, edge: edge / n, top4: top4 / n, mean: sum / n };
}
const change = (a, b, box) => { if (!a || !b) return 0; let c = 0, n = 0; for (let y = box.y0; y <= box.y1; y += 2) for (let x = box.x0; x <= box.x1; x += 2) { const i = y * W + x; if (Math.abs(a[i] - b[i]) > 12) c++; n++; } return n ? c / n : 0; };

async function videoReport(f, info) {
  const dur = Number(info.format?.duration) || 0;
  const step = stepArg || Math.min(5, Math.max(1, dur / 150));
  const times = []; for (let t = Math.min(0.5, dur / 2); t < dur - 0.2; t += step) times.push(t);
  // each sample (+ one 0.5 s later when it is not camera footage, so a still screen and a moving animation can be
  // told apart)
  const frames = await pool(times, 4, async (t) => {
    const p = await grab(f, t); if (!p) return [null, null];
    const m = metrics(p, activeBox(p));
    return [p, m.flat < 0.45 && m.top4 < 0.35 ? null : await grab(f, Math.min(dur - 0.05, t + 0.5))];
  });
  const samples = times.map((t, k) => {
    const [p, q] = frames[k]; if (!p) return { t, look: "none" };
    const box = activeBox(p), m = metrics(p, box), mv = q ? change(p, q, box) : 0;
    const look = m.mean < 14 ? "black"
      : m.flat < 0.45 && m.top4 < 0.35 ? "camera"
      : m.edge > 0.025 && mv < 0.12 ? "screen" : "graphics";
    return { t, look, ...Object.fromEntries(Object.entries({ ...m, mv }).map(([k, v]) => [k, +v.toFixed(3)])), area: +(((box.x1 - box.x0 + 1) * (box.y1 - box.y0 + 1)) / (W * H)).toFixed(2) };
  });
  // one-sample blips take their neighbours' look; then runs become segments
  const looks = samples.map((s) => s.look);
  for (let i = 1; i + 1 < looks.length; i++) if (looks[i - 1] === looks[i + 1] && looks[i] !== looks[i - 1]) looks[i] = looks[i - 1];
  // a burst of motion inside a screen recording (scrolling, a video preview playing) reads as graphics: between two
  // screen runs it is still the screen
  for (let i = 0; i < looks.length;) {
    let j = i; while (j < looks.length && looks[j] === looks[i]) j++;
    if (looks[i] === "graphics" && looks[i - 1] === "screen" && looks[j] === "screen" && (j - i) * step <= 60) for (let k = i; k < j; k++) looks[k] = "screen";
    i = j;
  }
  // runs → back-to-back segments, each boundary halfway between two samples
  const segs = [];
  looks.forEach((l, i) => {
    const s = segs.at(-1), mid = i ? (samples[i - 1].t + samples[i].t) / 2 : 0;
    if (s && s.look === l) return;
    if (s) s.to = mid;
    segs.push({ look: l, from: mid, to: dur });
  });
  segs.forEach((s) => { s.from = +s.from.toFixed(1); s.to = +s.to.toFixed(1); });
  const share = (l) => +(segs.filter((s) => s.look === l).reduce((a, s) => a + s.to - s.from, 0) / (dur || 1)).toFixed(2);
  return { step: +step.toFixed(2), looks: { camera: share("camera"), screen: share("screen"), graphics: share("graphics"), black: share("black") }, segments: segs, samples };
}

const vad = (f) => { const r = spawnSync(PY, ["-I", path.join(WS, "tools", "route-vad.py"), f], { encoding: "utf8" }); try { return JSON.parse(r.stdout); } catch { return null; } };
// speech = a voice most of the time; speech-parts = he talks in some stretches (a facecam intro/outro); music = loud
// all through with no speech; silence; sparse = something else
const audioKind = (v) => !v || !v.total ? "none" : v.speech / v.total > 0.35 ? "speech" : v.speech >= 10 ? "speech-parts"
  : v.active / v.total > 0.6 ? "music" : v.active / v.total < 0.15 ? "silence" : "sparse";

const report = { folder: inputs, files: [] };
for (const f of files) {
  const name = path.basename(f);
  if (IMAGE.test(name)) { report.files.push({ file: f, kind: "image" }); continue; }
  if (!VIDEO.test(name) && !AUDIO.test(name)) { report.files.push({ file: f, kind: "other" }); continue; }
  const info = probe(f), v = (info.streams ?? []).find((s) => s.codec_type === "video"), a = (info.streams ?? []).find((s) => s.codec_type === "audio");
  const dur = +(Number(info.format?.duration) || 0).toFixed(2);
  const entry = { file: f, kind: v && VIDEO.test(name) ? "video" : "audio", duration: dur };
  if (entry.kind === "video") {
    const rot = Math.abs(Number(v.tags?.rotate ?? 0)) % 180 === 90;
    const [w, h] = rot ? [v.height, v.width] : [v.width, v.height];
    Object.assign(entry, { width: w, height: h, orientation: w > h ? "landscape" : w < h ? "portrait" : "square", fps: +eval(v.r_frame_rate).toFixed(2) });
    Object.assign(entry, await videoReport(f, info));
  }
  if (a) { entry.audio = vad(f); entry.audioKind = audioKind(entry.audio); } else entry.audioKind = "none";
  report.files.push(entry);
  process.stderr.write(`  measured ${name}\n`);
}

// ── the folder's shape ──
const vids = report.files.filter((f) => f.kind === "video"), auds = report.files.filter((f) => f.kind === "audio"), imgs = report.files.filter((f) => f.kind === "image");
const voices = auds.filter((a) => a.audioKind === "speech"), musics = auds.filter((a) => a.audioKind === "music");
const main = [...vids].sort((x, y) => y.duration - x.duration)[0];
const talks = (v) => v && v.audioKind === "speech";
const ends = (v, l) => v && (v.segments[0]?.look === l || v.segments.at(-1)?.look === l);
const brolls = vids.filter((v) => v !== main && v.looks.camera > 0.6 && v.audioKind !== "speech");
let shape, why, pick, ask = [];
if (main && main.looks.screen > 0.4 && ends(main, "camera") && voices.length) {
  shape = "S1"; why = "a screen recording with facecam at its ends, plus a separate voice-over"; pick = ["TUT1"];
} else if (main && main.looks.screen > 0.4 && voices.length) {
  shape = "S2"; why = "a screen recording (no facecam) plus a separate voice-over"; pick = main.duration < 180 ? ["PROMO1", "TUT1"] : ["TUT1", "PROMO1"];
  ask.push("TUT1 needs facecam at the start or end today; without it the intro/outro cards stand alone — ok?");
} else if (main && main.looks.screen > 0.4 && talks(main)) {
  shape = "S3"; why = "a screen recording where he talks while recording"; pick = ["EDIT1", "TUT2"];
  ask.push("TUT2 (the floating-monitor look for live-voice recordings) is planned, not built: EDIT1 now, or build TUT2 first?");
} else if (main && main.looks.camera > 0.5 && talks(main)) {
  shape = "S4"; why = `talking-head footage (${Math.round(main.duration / 60)} min)${brolls.length ? ` with ${brolls.length} B-roll clip(s)` : ""}`;
  pick = main.duration > 180 ? ["EP1", "AB1", "AB2", "AB4", "AB5", "AB3"] : ["AB3", "AB2", "AB1", "EDIT1"];
  ask.push("which style: one AB variant for the whole video, or a mix per section (the plan shows which line gets which)?");
  if (!brolls.length && !imgs.length) ask.push("no B-roll in the folder: use stock (free key: PEXELS_API_KEY for video), generated scenes, or AI-made clips?");
} else if (!vids.length && voices.length) {
  shape = "S5"; why = "a voice-over (and music) with no footage"; pick = ["REEL1"];
  ask.push("a vertical 'N tools' Reel (REEL1), or a faceless explainer made from scratch (HyperFrames)?");
} else if (vids.length && !voices.length && !vids.some(talks)) {
  shape = "S6"; why = "clips without speech (B-roll / AI clips)"; pick = musics.length ? ["music-to-video"] : ["AB2"];
  ask.push("these look like B-roll: which talking-head or voice-over do they go with?");
} else if (!vids.length && imgs.length) {
  shape = "S7"; why = "pictures only"; pick = ["slideshow"]; ask.push("a voice-over or music for the pictures?");
} else { shape = "S?"; why = "an unusual mix — look at the per-file lines and ask him"; pick = []; }
if (main?.orientation === "portrait") ask.push("the footage is vertical: deliver 9:16 first?");
report.shape = { id: shape, why, variants: pick, ask, main: main?.file, voice: voices[0]?.file, music: musics[0]?.file, broll: brolls.map((b) => b.file), images: imgs.length };

// ── print ──
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
for (const f of report.files) {
  const n = path.basename(f.file);
  if (f.kind === "video") {
    const tl = f.segments.map((s) => `${s.look} ${mmss(s.from)}–${mmss(s.to)}`).join(" · ");
    console.log(`▶ ${n}  ${f.width}×${f.height} ${f.orientation} ${f.fps} fps ${mmss(f.duration)}  audio: ${f.audioKind}${f.audio?.speech ? ` (${Math.round(f.audio.speech)} s speech)` : ""}\n    ${tl}`);
  } else if (f.kind === "audio") console.log(`♪ ${n}  ${mmss(f.duration)}  ${f.audioKind}${f.audio?.speech ? ` (${Math.round(f.audio.speech)} s speech)` : ""}`);
  else console.log(`· ${n}  ${f.kind}`);
}
const vname = (id) => { const v = VARIANTS.find((x) => x.id === id); return v ? `${id} ${v.bn} (${v.status})` : id; };
console.log(`\nSHAPE ${shape}: ${why}\nFITS: ${pick.map(vname).join(" · ") || "—"}`);
for (const q of ask) console.log(`ASK: ${q}`);
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(report, null, 1));
