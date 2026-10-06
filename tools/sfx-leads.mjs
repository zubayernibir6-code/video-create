#!/usr/bin/env node
// sfx-leads.mjs — measure how long each sound effect stays silent before it is heard, and store it as
// `lead_s` in the folder's manifest.json:
//
//   node "E:/Video Create/tools/sfx-leads.mjs" [sfx folder]      (default: E:/Video Create/assets/sfx)
//
// Why: many files start with silence (ping.mp3 0.31 s, typing.mp3 0.44 s, chime.mp3 0.42 s). A cue placed
// at the visual hit is then HEARD that much late, which a viewer notices. Place every cue at
//   data-start = visual hit − lead_s
// "Heard" = the first moment the level comes within 30 dB of the file's own peak, so quiet files work too.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const dir = path.resolve(process.argv[2] ?? path.join(import.meta.dirname, "..", "assets", "sfx"));
const manifestFile = path.join(dir, "manifest.json");
if (!existsSync(manifestFile)) { console.error(`✗ No manifest.json in ${dir}`); process.exit(1); }
const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
const entries = Array.isArray(manifest) ? manifest : Object.values(manifest);
const byFile = new Map(entries.filter((e) => e && e.file).map((e) => [e.file, e]));

const RATE = 16000;
function leadOf(file) {
  const r = spawnSync("ffmpeg", ["-v", "error", "-i", file, "-ac", "1", "-ar", String(RATE), "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
  if (r.status !== 0) return null;
  const pcm = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, Math.floor(r.stdout.length / 4));
  let peak = 0;
  for (const x of pcm) peak = Math.max(peak, Math.abs(x));
  if (peak === 0) return null;
  const gate = peak * 10 ** (-30 / 20);
  for (let i = 0; i < pcm.length; i++) if (Math.abs(pcm[i]) >= gate) return Math.round((i / RATE) * 1000) / 1000;
  return null;
}

let n = 0;
for (const f of readdirSync(dir).filter((x) => /\.(mp3|wav|ogg|m4a)$/i.test(x)).sort()) {
  const lead = leadOf(path.join(dir, f));
  const e = byFile.get(f);
  console.log(`  ${f.padEnd(26)} lead ${lead === null ? "?" : `${lead.toFixed(3)} s`}${e ? "" : "   (not in manifest.json — not recorded)"}`);
  if (e && lead !== null) { e.lead_s = lead; n++; }
}
writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + "\n");
console.log(`sfx-leads: recorded lead_s for ${n} file(s) in ${path.relative(process.cwd(), manifestFile) || manifestFile}`);
