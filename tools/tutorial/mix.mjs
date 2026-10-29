// mix.mjs — a tutorial's soundtrack as one WAV: speech.wav (crisp EQ) + the shaped music bed (music.mjs: loop,
// 2.5 kHz dip, envelope already written in) + every sound effect page.mjs placed (build/cues.json), through
// tools/screen/promo-mix.mjs (each SFX lands on its moment minus its silent lead-in).
//   node tools/tutorial/mix.mjs projects/<name> [--media=<dir>]   → <media>/mix.wav (+ build/mix.graph.txt)
//   needs speech.mjs, music.mjs and page.mjs run first (build.mjs runs them in order)
// Verified 2026-10-29 on projects/claude-video-tutorial: mix.wav null-tests against its hand-written build/mix.mjs's.
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildMix } from "../screen/promo-mix.mjs";
import { cli } from "./timeline.mjs";

export function buildTutorialMix(P) {
  const { TL, media, build } = P;
  const cues = JSON.parse(readFileSync(path.join(build, "cues.json"), "utf8"));
  buildMix({
    total: TL.TOTAL, out: path.join(media, "mix.wav"), graphFile: path.join(build, "mix.graph.txt"),
    voice: { file: path.join(media, "speech.wav"), eq: true },
    music: [{ file: path.join(media, "bed.wav"), at: 0, from: 0, env: [[0, 0], [TL.TOTAL, 0]] }],
    cues,
  });
  console.log(`✓ mix.wav (${cues.length} sound effects, ${TL.TOTAL.toFixed(3)} s)`);
}

await cli(import.meta, ({ P }) => buildTutorialMix(P));
