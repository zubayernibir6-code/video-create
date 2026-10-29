// The tutorial's soundtrack as one WAV: speech.wav (crisp EQ) + the shaped music bed (music.mjs: loop, 2.5 kHz dip,
// −23 / −14 dB envelope already written in) + every sound effect build-page.mjs placed (build/cues.json).
//   node build/speech.mjs && node build/music.mjs && node build/build-page.mjs && node build/mix.mjs
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildMix } from "../../../tools/screen/promo-mix.mjs";
import { TL } from "./timeline.mjs";

const MEDIA = path.resolve(import.meta.dirname, "..", "assets", "media");
const cues = JSON.parse(readFileSync(path.join(import.meta.dirname, "cues.json"), "utf8"));
buildMix({
  total: TL.TOTAL, out: path.join(MEDIA, "mix.wav"), graphFile: path.join(import.meta.dirname, "mix.graph.txt"),
  voice: { file: path.join(MEDIA, "speech.wav"), eq: true },
  music: [{ file: path.join(MEDIA, "bed.wav"), at: 0, from: 0, env: [[0, 0], [TL.TOTAL, 0]] }],
  cues,
});
console.log(`✓ mix.wav (${cues.length} sound effects, ${TL.TOTAL.toFixed(3)} s)`);
