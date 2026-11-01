#!/usr/bin/env node
// voice-script.mjs — the TTS script of one series episode, written from its reel.json: exactly the lines series.mjs
// aligns (series-lines.mjs), each with a delivery tag for tools/clone/gemini.mjs say, short pauses before each tool and
// before the call to action.
//
//   node tools/reel/voice-script.mjs projects/<name> [out.txt] [--split]   (default: <project>/assets/voice/script.txt)
//   node tools/clone/gemini.mjs say <out.txt> <project>/assets/voice/<dir>/voice.wav --voice=talha-g   (his main voice since 2026-11-01; talha-a was the first GitHub run)
//
// reel.json may override a delivery with "voiceStyles": { hook, promise, intro, body, how, cta }.
// Default --merge: one delivery for everything between the hook and the call to action and no written pauses, so
// gemini.mjs sends it as a few long requests (≤ 600 characters each): about 5 requests an episode instead of 13. The
// Gemini TTS API allows 100 requests a day on Tier 1 (429 "limit: 100 requests per day", hit 2026-11-01 on episode 4).
// --split: one delivery per kind of line with short pauses before each tool (13 requests an episode).
// Verified 2026-11-01 on the GitHub series (projects/gh-ep01-phone …) with his cloned voice talha-a.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { seriesLines } from "./series-lines.mjs";

const [dirArg, outArg] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!dirArg) { console.error("usage: voice-script.mjs projects/<name> [out.txt]"); process.exit(1); }
const dir = path.resolve(dirArg);
const R = JSON.parse(readFileSync(path.join(dir, "reel.json"), "utf8").replace(/^﻿/, ""));
const BASE = "natural Bangladeshi Bengali (standard Dhaka cholito), a confident tech creator talking to a friend on Facebook Reels, English app names said clearly in English, no filler words, not a news announcer";
const STY = {
  hook: `${BASE}; punchy and energetic, a little urgent, quick`,
  promise: `${BASE}; warm and clear, promising something useful`,
  intro: `${BASE}; a small lift of energy on the app name, quick`,
  body: `${BASE}; clear and friendly, explaining, quick natural pace`,
  how: `${BASE}; clear and friendly, explaining, quick natural pace`,
  cta: `${BASE}; warm and inviting, smiling, clear and a touch slower so every step is easy to follow`,
  ...(R.voiceStyles ?? {}),
};
const split = process.argv.includes("--split");
const { lines, kind } = seriesLines(R);
const out = [];
lines.forEach((l, i) => {
  if (split && kind[i] === "intro") out.push("[pause 0.25]");
  if (kind[i] === "cta") out.push("[pause 0.3]");
  const k = split || kind[i] === "hook" || kind[i] === "cta" ? kind[i] : "body";
  out.push(`[${STY[k]}] ${l}`);
});
const file = outArg ? path.resolve(outArg) : path.join(dir, "assets", "voice", "script.txt");
mkdirSync(path.dirname(file), { recursive: true });
writeFileSync(file, out.join("\n") + "\n");
console.log(`✓ ${file}: ${lines.length} lines, ${lines.join(" ").split(/\s+/).length} words`);
