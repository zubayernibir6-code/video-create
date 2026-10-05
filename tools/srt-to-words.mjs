#!/usr/bin/env node
// srt-to-words.mjs — turn a subtitle file into word-by-word timings for animated captions.
//
//   node "E:/Video Create/tools/srt-to-words.mjs" <subtitles.srt|.vtt> [<words.json>]
//   then:  hyperframes transcribe <words.json> -d <project>     (writes the project's transcript.json)
//
// Output: [{ id, text, start, end }] — the plain-array format `hyperframes transcribe` imports.
// Each cue's time is shared among its words in proportion to their length in GRAPHEMES
// (Intl.Segmenter), not code points, so a Bengali conjunct like ক্ষ counts as one letter and long
// words get more time. Every word also gets one extra unit for the pause after it.
// These timings are ESTIMATED from the subtitle file, not measured from the audio: good enough for
// word-by-word reveals inside each subtitle line. Accurate per-word timing needs speech recognition
// (plan step 7).

import { writeFileSync } from "node:fs";
import path from "node:path";
import { parseSubtitles } from "./srt.mjs";

const seg = new Intl.Segmenter("bn", { granularity: "grapheme" });
const graphemes = (w) => [...seg.segment(w)].length;
const r3 = (t) => Math.round(t * 1000) / 1000;

export function cuesToWords(cues) {
  const out = [];
  for (const cue of cues) {
    const words = cue.text.split(/\s+/).filter(Boolean);
    const weights = words.map((w) => graphemes(w) + 1);
    const total = weights.reduce((a, b) => a + b, 0);
    let t = cue.start;
    const span = cue.end - cue.start;
    words.forEach((w, i) => {
      const end = i === words.length - 1 ? cue.end : t + (span * weights[i]) / total;
      out.push({ id: `w${out.length}`, text: w, start: r3(t), end: r3(end) });
      t = end;
    });
  }
  return out;
}

const [inArg, outArg] = process.argv.slice(2);
if (!inArg) {
  console.log("Usage: node srt-to-words.mjs <subtitles.srt|.vtt> [<words.json>]");
  process.exit(2);
}
const input = path.resolve(inArg);
const output = path.resolve(outArg ?? path.join(path.dirname(input), `${path.parse(input).name}.words.json`));
let cues;
try {
  cues = parseSubtitles(input);
} catch (e) {
  console.error(`\n✗ ${e.message}`);
  process.exit(1);
}
const words = cuesToWords(cues);
writeFileSync(output, JSON.stringify(words, null, 2));
console.log(`✓ ${words.length} words from ${cues.length} subtitle lines → ${output}`);
console.log(`  Next: hyperframes transcribe "${output}" -d <project folder>`);
