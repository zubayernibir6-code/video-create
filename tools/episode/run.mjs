#!/usr/bin/env node
// run.mjs — one command from a raw talking-head recording to a delivered episode.
//
//   node tools/episode/run.mjs <project-folder>  [--from=<step>] [--only=<step>] [--quality=high|standard|draft]
//
// The project folder holds episode.json (sources, cuts, cold open, title) and build-page.mjs (the episode's
// graphics, on top of tools/episode/page-core.mjs). Steps, each re-runnable on its own:
//   voice   voice.mjs       mastered voice (AI denoise, EQ, −16 LUFS), source timeline
//   cuts    cuts.mjs        pauses shrunk, manual cuts, cold open → cuts_map.json
//   grade   grade.mjs       graded 1080p30 camera video (uncut)
//   camcut  camcut.mjs      that video cut to the episode timeline (one clip for the page)
//   asr     asr_chunks.py   Bengali words + timings (chunked, low memory)
//   align   align.mjs       caption words: spoken words, spelt as in the subtitle file
//   page    build-page.mjs  index.html + sfx.json
//   mix     mix.mjs         the soundtrack (voice + looped, ducked music + effects)
//   render  finish.mjs      check, design-lint, render, −14 LUFS, QC → renders/<name>/<date>/
import { spawnSync } from "node:child_process";
import path from "node:path";
import { PY, WORKSPACE, fail, loadEpisode } from "./lib.mjs";

const args = process.argv.slice(2);
const dir = path.resolve(args.find((a) => !a.startsWith("--")) ?? ".");
const opt = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const ep = loadEpisode(dir);
const T = path.join(WORKSPACE, "tools", "episode");
const node = (script, ...rest) => [process.execPath, [script, ...rest]];
const STEPS = {
  voice: node(path.join(T, "voice.mjs"), dir),
  cuts: node(path.join(T, "cuts.mjs"), dir),
  grade: node(path.join(T, "grade.mjs"), dir),
  camcut: node(path.join(T, "camcut.mjs"), dir),
  asr: [PY, [path.join(T, "asr_chunks.py"), path.join(ep.work, "audio", "voice16.wav"), path.join(ep.work, "audio", "asr.words.json")]],
  align: node(path.join(T, "align.mjs"), dir),
  page: node(path.join(dir, "build-page.mjs")),
  mix: node(path.join(T, "mix.mjs"), dir),
  render: node(path.join(WORKSPACE, "tools", "finish.mjs"), dir, `--quality=${opt.quality ?? "high"}`, "--formats=16x9",
    `--frames-cache=${path.join(ep.work, "fcache")}`),
};
const order = Object.keys(STEPS);
const todo = opt.only ? [opt.only] : order.slice(opt.from ? order.indexOf(opt.from) : 0);
for (const s of todo) {
  if (!STEPS[s]) fail(`Unknown step "${s}". Steps: ${order.join(", ")}`);
  console.log(`\n━━ ${s} ━━`);
  const t0 = Date.now();
  const [cmd, a] = STEPS[s];
  const r = spawnSync(cmd, a, { stdio: "inherit", cwd: dir, env: { ...process.env, PYTHONIOENCODING: "utf-8" } });
  if (r.status !== 0) fail(`step "${s}" failed — fix it and re-run with --from=${s}`);
  console.log(`   (${s}: ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
