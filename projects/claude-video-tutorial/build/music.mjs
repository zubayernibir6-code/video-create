// The music bed for the whole video: BGM.mp3 looped (body 0–143 s, 2 s crossfades; its tail fades from ~142 s,
// measured 2026-10-29), a 2.5 kHz dip so it never masks the voice, and a gain envelope written sample by sample
// (hundreds of points: too many for an FFmpeg volume expression):
//   −23 dB under speech · −14 dB while the screen is sped up (ramps) and on scene transitions · −18 dB in
//   voice gaps ≥ 2 s · fade out after the last word. (His brief; the dB are gains on the bed, BGM.mp3 = −13.3 LUFS.)
//   node build/music.mjs   → assets/media/bed.wav (48 kHz stereo, exactly TOTAL s) + build/music.env.json
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { TL } from "./timeline.mjs";

const MEDIA = path.resolve(import.meta.dirname, "..", "assets", "media");
const loop = path.join(MEDIA, "bgm_loop.wav"), out = path.join(MEDIA, "bed.wav");
const BODY = 143, XF = 2, N = Math.ceil((TL.TOTAL + XF) / (BODY - XF)) + 0;
const SR = 48000, f3 = (x) => Number(x).toFixed(3);

// 1. loop + EQ
let g = "";
for (let i = 0; i < N; i++) g += `[0:a]atrim=0:${BODY},asetpts=PTS-STARTPTS,aresample=${SR},aformat=sample_fmts=s16:channel_layouts=stereo[c${i}];`;
let prev = "c0";
for (let i = 1; i < N; i++) { g += `[${prev}][c${i}]acrossfade=d=${XF}:c1=tri:c2=tri[x${i}];`; prev = `x${i}`; }
g += `[${prev}]equalizer=f=2500:t=o:w=1.2:g=-4,atrim=0:${f3(TL.TOTAL)}[out]`;
const r = spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", "-i", TL.SRC.bgm, "-filter_complex", g, "-map", "[out]", "-c:a", "pcm_s16le", "-ar", String(SR), loop], { stdio: "inherit" });
if (r.status !== 0) process.exit(1);

// 2. envelope [t, dB] points (null = silent)
const UNDER = -23, UP = -14, GAP = -18, RAMP = 0.35;
const env = [];
const raise = (a, b, db) => { env.push({ a, b, db }); };
for (const p of TL.screen.pieces) if (p.kind === "play" && p.wait) raise(p.at / TL.FPS, (p.at + p.frames) / TL.FPS, UP);
// gaps without speech (screen part: between voice pieces)
const vs = TL.voice.map((v) => [v.at, v.at + v.to - v.from]);
for (let i = 0; i + 1 < vs.length; i++) if (vs[i + 1][0] - vs[i][1] >= 2) raise(vs[i][1] + 0.15, vs[i + 1][0] - 0.1, GAP);
raise(0, 1.3, -16); // the hook: music up until his first word
raise(TL.intro.b - 2.6, TL.intro.b + 0.6, UP); // whoosh into the monitor
raise(TL.screen.end - 0.3, TL.screen.end + 0.4, -16); // back out to the facecam
const fadeFrom = TL.TOTAL - 1.6, fadeTo = TL.TOTAL; // after "আসসালামু আলাইকুম"
const gainAt = (t) => {
  if (t >= fadeTo) return 0;
  let db = UNDER;
  for (const e of env) {
    if (t < e.a - RAMP || t > e.b + RAMP) continue;
    const u = t < e.a ? (t - (e.a - RAMP)) / RAMP : t > e.b ? 1 - (t - e.b) / RAMP : 1;
    db = Math.max(db, UNDER + (e.db - UNDER) * Math.max(0, Math.min(1, u)));
  }
  let gl = Math.pow(10, db / 20);
  if (t > fadeFrom) gl *= Math.max(0, 1 - (t - fadeFrom) / (fadeTo - fadeFrom)) ** 1.5;
  return gl;
};

// 3. apply per sample (gain computed every 10 ms, linear between)
const wav = readFileSync(loop);
const dataAt = wav.indexOf("data") + 8, pcm = new Int16Array(wav.buffer, wav.byteOffset + dataAt, (wav.length - dataAt) >> 1);
const step = SR / 100, frames = pcm.length / 2;
let g0 = gainAt(0);
for (let k = 0; k < frames; k += step) {
  const g1 = gainAt((k + step) / SR);
  for (let j = 0; j < step && k + j < frames; j++) {
    const gg = g0 + (g1 - g0) * (j / step), i = 2 * (k + j);
    pcm[i] = Math.round(pcm[i] * gg); pcm[i + 1] = Math.round(pcm[i + 1] * gg);
  }
  g0 = g1;
}
writeFileSync(out, wav);
writeFileSync(path.join(import.meta.dirname, "music.env.json"), JSON.stringify(env.map((e) => ({ a: +f3(e.a), b: +f3(e.b), db: e.db }))));
console.log(`✓ ${out} (${N} loops, ${env.length} raised stretches, ${f3(TL.TOTAL)} s)`);
