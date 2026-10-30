#!/usr/bin/env node
// cover.mjs — the cover image of a cut-down page (universal Reel 9:16 or LinkedIn cut 4:5) at its own size
// (release system step 6, 2026-10-30)
//
//   node tools/release/cover.mjs projects/<cutdown> [--at=0.8] [--out=<file.jpg>]
//
// Snapshots the page at --at (default 0.8 s: the hook is on screen from frame 0 and its entrance has settled) with
// `hyperframes snapshot --describe false` (no frame leaves the machine) and writes a JPG (default <project>/cover.jpg).
// finish.mjs's own -thumb.jpg is a frame near 40 % of the video, 1280 wide (upscaled for 9:16): not a cover.
// Checks that the page's text-safe box (root data-safe-profile → tools/release/spec-check.mjs limits()) lies inside the
// crops platforms show a 9:16 cover in: Instagram's profile grid 3:4 (S26) and the 4:5 feed mask (blog) — so the hook
// on the cover is never cut. A 4:5 LinkedIn page has no documented crop: the check says so.
import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { limits } from "./spec-check.mjs";

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith("--"));
const opt = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
if (!dir) { console.log("Usage: node tools/release/cover.mjs projects/<cutdown> [--at=0.8] [--out=<file.jpg>]"); process.exit(2); }
const P = path.resolve(dir);
const html = readFileSync(path.join(P, "index.html"), "utf8");
const W = Number(html.match(/data-width="(\d+)"/)?.[1]), H = Number(html.match(/data-height="(\d+)"/)?.[1]);
const prof = html.match(/data-safe-profile="([\w-]+)"/)?.[1] ?? null;
const at = Number(opt.at ?? 0.8), out = path.resolve(opt.out ?? path.join(P, "cover.jpg"));

// 1. the crops the cover must survive
let ok = true;
if (!prof) console.log(`cover: the page declares no data-safe-profile (an old page): the crop check is skipped`);
else if (H / W > 1.7) {
  const b = limits(prof, W, H).box;
  for (const [name, cw, ch] of [["Instagram grid 3:4", W, Math.round((W * 4) / 3)], ["feed 4:5", W, Math.round((W * 5) / 4)]]) {
    const y0 = (H - ch) / 2, y1 = y0 + ch, inside = b.y0 >= y0 && b.y1 <= y1;
    ok &&= inside;
    console.log(`  ${inside ? "✓" : "✗"} ${name}: crop y ${y0}–${y1}, text box y ${b.y0}–${b.y1}`);
  }
} else console.log(`  · ${prof} (${W}×${H}): no platform crop is documented for this shape`);

// 2. the frame, at the page's own size
const tmp = path.join(os.tmpdir(), `cover-snap-${process.pid}`);
mkdirSync(tmp, { recursive: true });
// hyperframes is a .cmd on Windows, so it runs through the shell: quote the folder (paths here have spaces)
const r = spawnSync(`hyperframes snapshot . --at ${at} --no-end --describe false -o "${tmp}"`, { cwd: P, encoding: "utf8", shell: true });
const png = readdirSync(tmp).filter((f) => f.startsWith("frame-")).sort().at(-1);
if (r.status !== 0 || !png) { console.error(`✗ snapshot failed: ${(r.stderr || r.stdout).slice(-400)}`); process.exit(1); }
const f = spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", "-i", path.join(tmp, png), "-q:v", "2", out], { encoding: "utf8" });
if (f.status !== 0) { console.error(`✗ ffmpeg: ${f.stderr}`); process.exit(1); }
console.log(`cover: ${W}×${H} at ${at} s → ${out}${ok ? "" : "  (✗ a crop cuts the text box)"}`);
process.exit(ok ? 0 : 1);
