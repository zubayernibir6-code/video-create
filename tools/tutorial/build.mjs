#!/usr/bin/env node
// build.mjs — a whole screen tutorial from DATA (skill screen-tutorial). The project holds only data in build/:
//   tutorial.json  sources, facecam ↔ screen frames, voice pauses + cuts, screen cuts + waits, voice ANCHORS, the
//                  facecam crop / mic, speech gains, the BGM loop           (timeline.mjs, face, speech, music)
//   page.json      title, intro/outro cards, labels, numbered panels, banners, callouts, extra sounds   (page.mjs)
//   specs.json     camera views, anchors, clicks, drags, blurs, freezes (source s / px, from the frame review)
//   cursor.json    the cursor tip track (tools/screen/track-cursor.py)
// and this runs the steps in order:
//   node tools/tutorial/build.mjs projects/<name> [step …] [--media=<dir>] [--only=<i,j>]
//     check   fast (seconds): sources exist, every page.json time / anchor / icon / kind / sound resolves, the page
//             builds (dry run), the cursor glow covers the screen part — run it after every data edit
//     speech music face screen page mix   (none named = check + all six. Measured on the 8:30 reference:
//             speech + music + mix 1 m 43 s, face 6 m 53 s; screen: 111 pieces, 3 at a time — start a full build detached)
//   After a label / card / sound change:      page mix
//   After a blur / freeze fix in one stretch: screen --only=<pieces>   (screen.mjs --dry lists the pieces)
//   After a timing change (tutorial.json):    all steps (the screen pieces and the voice move)
// Each step is also its own command: node tools/tutorial/<step>.mjs projects/<name>. --media writes the media
// somewhere else (a test copy); index.html and build/*.json are always the project's.
// Then: node tools/preflight.mjs projects/<name> → finish.mjs (skill screen-tutorial §6).
// Verified 2026-10-29 on projects/claude-video-tutorial (8:30): index.html + cues.json byte-identical to its
// hand-written build; speech/bed/mix.wav byte-identical (mix null test −inf dB); all 111 screen jobs' FFmpeg
// arguments identical, 7 pieces re-encoded (freezes, 29 blurs, holds, 3× ramps) with identical frame hashes;
// intro.mp4 / outro.mp4 re-encoded with identical frame hashes.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { buildFace } from "./face.mjs";
import { buildTutorialMix } from "./mix.mjs";
import { buildMusic } from "./music.mjs";
import { buildPage } from "./page.mjs";
import { buildScreen, screenJobs } from "./screen.mjs";
import { buildSpeech } from "./speech.mjs";
import { projectFromArgv, summary } from "./timeline.mjs";

const SFX = JSON.parse(readFileSync(path.resolve(import.meta.dirname, "..", "..", "assets", "sfx", "manifest.json"), "utf8"));

// every problem in one go, so a data edit is fixed in one pass
function check(P) {
  const errors = [];
  for (const [k, f] of Object.entries(P.TL.SRC)) if (k !== "note" && !existsSync(f)) errors.push(`tutorial.json src.${k}: ${f} not found`);
  for (const f of ["specs.json", "cursor.json", "page.json"]) if (!existsSync(path.join(P.build, f))) errors.push(`build/${f} missing`);
  if (errors.length) throw new Error(errors.join("\n  "));
  const { cues, warn } = buildPage(P, { write: false });
  for (const f of new Set(cues.map((c) => c.file))) if (!SFX[f]) errors.push(`sound '${f}' is not in assets/sfx/manifest.json (have: ${Object.keys(SFX).join(", ")})`);
  try { screenJobs(P); } catch (e) { errors.push(e.message); } // the encoder's own rules: a freeze's `use` inside its piece
  if (errors.length) throw new Error(errors.join("\n  "));
  console.log(`✓ check: data OK${warn.length ? ` (${warn.length} warning(s) above)` : ""}`);
}

const STEPS = { check, speech: buildSpeech, music: buildMusic, face: buildFace, screen: buildScreen, page: buildPage, mix: buildTutorialMix };
const argv = process.argv.slice(2);
const named = argv.filter((a) => !a.startsWith("--")).slice(1);
const bad = named.filter((s) => !STEPS[s]);
if (bad.length) { console.error(`✗ unknown step(s) ${bad.join(", ")}; steps: ${Object.keys(STEPS).join(" ")}`); process.exit(1); }
const { P, only } = projectFromArgv(argv);
console.log(summary(P.TL));
try {
  for (const s of Object.keys(STEPS)) if (!named.length || named.includes(s)) {
    console.log(`── ${s}`);
    await STEPS[s](P, { only });
  }
} catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }
