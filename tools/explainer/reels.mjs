#!/usr/bin/env node
// reels.mjs — universal 9:16 Reels (UREEL1, tools/cutdown) cut from a finished EXP1 explainer, written from LINE refs.
//   node tools/explainer/reels.mjs projects/<main> [--only=<reel name>]
// Reads projects/<main>/build/reels.json:
//   { "master": "<the finished render .mp4>",
//     "reels": [{ "name": "<main>-ureel-1", "from": "L16", "to": "L25", "tag", "hook", "start": [cx, cy, s],
//                 "pans": [["L17:context", cx, cy, d, s], …], "chips": [{ "at": "L16", "out": "L16e", "cls": "red",
//                 "icon": "<lucide>", "text": "…", "size": 30 }], "cliff": { text, sub, d }, "cta": [l1, l2 (a circle-user icon goes in front)], "tail": 5.5 }] }
// Refs are the explainer's (L12, L12e, L12:word, +/-offset) resolved on the master's build/timeline.json and
// build/master.words.json, so a Reel never needs its own ASR. A piece starts and ends in the middle of the pause before
// / after its lines (tools/cutdown/boundaries.mjs re-checks it on the sound when cut.mjs runs).
// For each reel: makes the project (tools/new-video.mjs --kind=blank + JetBrains Mono) if missing, then writes
// cutdown.json (no faces, window mode, the master's music-only bed.wav), captions.json (master.words.json, at 0) and
// build-page.mjs (profile universal-reel; chips/pans as M(master second)). Then run per reel:
//   node tools/cutdown/cut.mjs projects/<reel> && node projects/<reel>/build-page.mjs && node tools/cutdown/mix.mjs projects/<reel>
// Verified 2026-11-02 on projects/claude-skills-tutorial (3 Reels).
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { norm } from "../reel/align.mjs";

const WS = path.resolve(import.meta.dirname, "..", "..");
const argv = process.argv.slice(2);
const main = path.resolve(argv.find((a) => !a.startsWith("--")) ?? "");
const only = argv.find((a) => a.startsWith("--only="))?.slice(7);
const read = (f) => JSON.parse(fs.readFileSync(f, "utf8").replace(/^\uFEFF/, ""));
const spec = read(path.join(main, "build", "reels.json"));
const T = read(path.join(main, "build", "timeline.json"));
const MW = read(path.join(main, "build", "master.words.json")).words;
const f3 = (x) => Number(x).toFixed(3);
const media = fs.realpathSync(path.join(main, "assets", "media"));

// words of each line in master seconds (master.words.json carries no line numbers: match them by time)
const lineWords = T.lines.map((l, i) => MW.filter((w) => w.start >= l.a - 0.05 && w.start < (T.lines[i + 1]?.a ?? Infinity) - 0.05));
function at(ref) {
  if (typeof ref === "number") return ref;
  let s = String(ref).trim(), off = 0;
  const m = s.match(/([+-]\d+(?:\.\d+)?)$/);
  if (m && !/^L\d+$/.test(s)) { off = +m[1]; s = s.slice(0, -m[1].length); }
  let mm = s.match(/^L(\d+)(e?)$/);
  if (mm) { const l = T.lines[+mm[1] - 1]; if (!l) throw new Error(`no line ${mm[1]}`); return (mm[2] ? l.b : l.a) + off; }
  mm = s.match(/^L(\d+):(.+?)(>)?$/);
  if (mm) {
    const w = lineWords[+mm[1] - 1]?.find((x) => norm(x.text).includes(norm(mm[2])));
    if (!w) throw new Error(`line ${mm[1]} has no word "${mm[2]}" (ref ${ref})`);
    return (mm[3] ? w.end : w.start) + off;
  }
  throw new Error(`bad ref ${ref}`);
}
// cut points: the middle of the pause before the first line / after the last line
const cutIn = (n) => (n <= 1 ? 0 : (T.lines[n - 2].b + T.lines[n - 1].a) / 2);
const cutOut = (n) => (n >= T.lines.length ? T.lines[n - 1].b + 0.6 : (T.lines[n - 1].b + T.lines[n].a) / 2);

for (const R of spec.reels) {
  if (only && R.name !== only) continue;
  const dir = path.join(WS, "projects", R.name);
  if (!fs.existsSync(dir)) {
    const r = spawnSync("node", [path.join(WS, "tools", "new-video.mjs"), R.name, "--kind=blank"], { stdio: "inherit" });
    if (r.status !== 0) throw new Error(`new-video failed for ${R.name}`);
    fs.copyFileSync(path.join(WS, "assets", "fonts", "latin", "JetBrainsMono-Variable.ttf"), path.join(dir, "assets", "fonts", "JetBrainsMono-Variable.ttf"));
  }
  const n0 = +String(R.from).slice(1), n1 = +String(R.to).slice(1);
  const segs = (R.pieces ?? [[n0, n1]]).map(([a, b]) => ({ from: +f3(cutIn(a)), to: +f3(cutOut(b)) }));
  const work = `C:/Users/Zubayer Nibir/VideoWork/${R.name}`;
  fs.writeFileSync(path.join(dir, "cutdown.json"), JSON.stringify({
    name: R.name, note: `Universal Reel cut from ${path.basename(main)} (EXP1), lines ${(R.pieces ?? [[n0, n1]]).map(([a, b]) => `${a}–${b}`).join(", ")}: written by tools/explainer/reels.mjs`,
    master: spec.master, bed: path.join(media, "bed.wav").replace(/\\/g, "/"), faces: [], fps: 30, bedDb: 12, faceMode: "window", work,
    segments: segs, tail: R.tail ?? (R.cliff ? 5.5 : 3),
  }, null, 1));
  fs.writeFileSync(path.join(dir, "captions.json"), JSON.stringify({ note: "Caption words from the master's own word list (tools/explainer build/master.words.json): no new ASR.", extra: [{ asr: path.join(main, "build", "master.words.json").replace(/\\/g, "/"), at: 0 }] }, null, 1));
  const M = (ref) => `M(${f3(at(ref))})`;
  const chips = (R.chips ?? []).map((c) => `    { at: ${M(c.at)}, out: ${M(c.out)}, html: \`<div class="chip${c.cls ? " " + c.cls : ""}"${c.size ? ` style="font-size:${c.size}px"` : ""}>\${icon("${c.icon ?? "sparkles"}", ${c.size ?? 34})}${c.text.replace(/`/g, "\\`")}</div>\` },`).join("\n");
  // Space guard (2026-11-02): the 1000×548 window must never reach the master's own caption strip (y ≥ 940) or leave
  // the frame: the view is clamped so its bottom stays ≤ 932 px and it stays inside 1920×1080 (half height = 274 / scale)
  const view = (cx, cy, s) => { const h = 274 / s, w = 500 / s; return [Math.round(Math.min(Math.max(cx, Math.min(w, 960)), Math.max(1920 - w, 960))), Math.round(Math.max(Math.min(cy, 932 - h), Math.min(h, 466))), s]; };
  const pans = (R.pans ?? []).map(([ref, cx, cy, d = 0.8, s = 1]) => { const [x, y] = view(cx, cy, s); return `    [${M(ref)}, ${x}, ${y}, ${d}, ${s}],`; }).join("\n");
  const page = `#!/usr/bin/env node
// ${R.name} — written by tools/explainer/reels.mjs from projects/${path.basename(main)}/build/reels.json (edit the json, not this file).
import { icon } from "../../tools/episode/page-core.mjs";
import { buildCutdown, cutdownContext } from "../../tools/cutdown/page.mjs";

const ctx = cutdownContext(import.meta.dirname);
const { M } = ctx;
buildCutdown(ctx, {
  profile: "universal-reel",
  title: ${JSON.stringify(R.title ?? R.hook.replace(/<[^>]+>/g, ""))},
  tag: ${JSON.stringify(R.tag)},
  hook: ${JSON.stringify(R.hook)},
  start: ${JSON.stringify(view(...(R.start ?? [960, 470, 0.6])))},
  pans: [
${pans}
  ],
  pushes: ${JSON.stringify((R.pushes ?? []).map(([ref, d]) => [+f3(at(ref)), d]))}.map(([t, d]) => [M(t), d]),
  jumps: [],
  ${R.cliff ? `cliff: ${JSON.stringify(R.cliff)},` : ""}
  endTag: ${JSON.stringify(R.endTag ?? R.tag)},
  cta: [${JSON.stringify(R.cta[0])}, \`\${icon("circle-user", 40)}${R.cta[1]}\`],
  sfx: ${JSON.stringify(R.sfx ?? [])},
  chips: [
${chips}
  ],
});
`;
  fs.writeFileSync(path.join(dir, "build-page.mjs"), page);
  console.log(`✓ ${R.name}: ${segs.map((s) => `${s.from}–${s.to}`).join(", ")} s (${segs.reduce((x, s) => x + s.to - s.from, 0).toFixed(1)} s + tail), ${R.chips?.length ?? 0} chips, ${R.pans?.length ?? 0} pans`);
}
