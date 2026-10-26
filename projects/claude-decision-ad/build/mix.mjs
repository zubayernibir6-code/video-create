// The Claude 5X ad's soundtrack; tools/screen/promo-mix.mjs mixes it into one WAV.
//   node build/mix.mjs [--out=<file>]   → assets/media/mix.wav (48 kHz stereo, exactly TOTAL s)
import path from "node:path";
import { buildMix } from "../../../tools/screen/promo-mix.mjs";
import { CLICK, KEYS, T, TOTAL } from "./timeline.mjs";

const PROJECT = path.resolve(import.meta.dirname, "..");
const SRC = "C:/Users/Zubayer Nibir/Downloads/Claude Video Create";
const out = process.argv.find((a) => a.startsWith("--out="))?.slice(6) ?? path.join(PROJECT, "assets", "media", "mix.wav");

const cues = [];
const cue = (t, file, vol, dur) => cues.push({ t, file, vol, ...(dur ? { dur } : {}) });
for (const t of T.clicks) cue(t, "click-soft", 0.32);
for (const [t, file, vol] of T.whooshes) cue(t, file, vol);
KEYS.forEach((t, i) => cue(t, "key-press", 0.42 + 0.12 * ((i * 7) % 5) / 4)); // varied a little, like a hand
cue(CLICK - 4.12, "riser", 0.42, 4.12); // its dead stop lands on the click
cue(CLICK, "boom", 0.95);
cue(CLICK, "impact-bass-1", 0.7);
for (const t of T.slam1) cue(t, "impact-bass-1", 0.28, 0.6); // a thud under each slammed word
cue(T.slam1.at(-1), "impact-bass-2", 0.55);
for (const t of T.slam2) cue(t, "whoosh-short", 0.4);
cue(T.slam2.at(-1), "impact-bass-1", 0.6);
cue(T.sheen2, "sparkle", 0.4);
cue(T.cta, "whoosh-short", 0.45);

const DROP = 15.04; // BGM2's bass drop (tools/music-drops.mjs)
buildMix({
  total: TOTAL, out, graphFile: path.join(PROJECT, "build", "mix.graph.txt"),
  voice: { file: `${SRC}/voice_1.wav`, eq: true }, // voice v2 (2026-10-26)
  music: [
    { file: `${SRC}/BGM1.mp3`, at: 0, from: 0, env: [[0, -19], [T.xfade0, -19], [T.xfade1, null]] },
    { file: `${SRC}/BGM2.mp3`, at: T.xfade0, from: DROP - (CLICK - T.xfade0),
      env: [[T.xfade0, null], [T.xfade1, -16], [CLICK, -16], [CLICK + 0.12, -8], [TOTAL - 1.7, -8], [TOTAL, null]] },
  ],
  cues,
});
console.log(`✓ ${out} (${cues.length} sound effects, BGM2 from ${(DROP - (CLICK - T.xfade0)).toFixed(3)} s)`);
