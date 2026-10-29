// The whole speech track on the final timeline, one mono WAV (48 kHz): his facecam audio for the intro and outro
// (Video.mp4), Voice.m4a's kept pieces for the screen part (timeline.mjs: pauses shrunk, 4 stretches cut).
// Each piece gets 12 ms fades so the joins never click. Levels are matched before the mix (measured 2026-10-29:
// Voice.m4a −20.8 LUFS mono; facecam left mic −20.3 intro, −20.3 outro); mix.mjs adds the crisp EQ and the music.
//   node build/speech.mjs   → <work>/media/speech.wav (exactly TOTAL s)
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { TL } from "./timeline.mjs";

const MEDIA = path.resolve(import.meta.dirname, "..", "assets", "media");
const out = path.join(MEDIA, "speech.wav");
const f3 = (x) => Number(x).toFixed(3);
const GAIN = { voice: 1.5, intro: 0.5, outro: -0.5 }; // dB, so the three sources read alike (checked by ebur128 below)

const parts = [], labels = [];
const piece = (input, a, b, at, gain, mono) => {
  const i = labels.length, d = b - a;
  parts.push(`[${input}:a]atrim=${f3(a)}:${f3(b)},asetpts=PTS-STARTPTS,${mono},aresample=48000,volume=${gain}dB,` +
    `afade=t=in:d=0.012,afade=t=out:st=${f3(Math.max(0, d - 0.012))}:d=0.012,adelay=${Math.round(at * 1000)}:all=1[p${i}]`);
  labels.push(`[p${i}]`);
};
const LEFT_MIC = "pan=mono|c0=c0"; // the facecam channels are near opposite phase (L−R is louder than L): summing cancels the voice, so take the left mic
piece(1, TL.intro.a, TL.intro.b, 0, GAIN.intro, LEFT_MIC);
for (const v of TL.voice) piece(0, v.from, v.to, v.at, GAIN.voice, "anull");
for (const o of TL.outro) piece(1, o.a, o.b, o.at, GAIN.outro, LEFT_MIC);
parts.push(`${labels.join("")}amix=inputs=${labels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${f3(TL.TOTAL)}[out]`);
const graph = path.join(import.meta.dirname, "speech.graph.txt");
writeFileSync(graph, parts.join(";\n"));
const r = spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", "-i", TL.SRC.voice, "-i", TL.SRC.video, "-/filter_complex", graph,
  "-map", "[out]", "-ac", "1", "-c:a", "pcm_s16le", "-ar", "48000", out], { stdio: "inherit" });
if (r.status !== 0) process.exit(r.status ?? 1);
// loudness of each part, so a mismatch shows at once
const lufs = (a, b) => {
  const e = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-ss", f3(a), "-to", f3(b), "-i", out, "-af", "ebur128", "-f", "null", "-"], { encoding: "utf8" }).stderr;
  return e.match(/I:\s+(-?[\d.]+) LUFS/g)?.at(-1)?.match(/-?[\d.]+/)[0];
};
console.log(`✓ ${out} (${labels.length} pieces, ${f3(TL.TOTAL)} s) · LUFS intro ${lufs(0, TL.intro.b)} · screen ${lufs(TL.screen.at, TL.screen.end)} · outro ${lufs(TL.screen.end, TL.TOTAL)}`);
