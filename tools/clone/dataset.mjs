#!/usr/bin/env node
// dataset.mjs — turn cleaned recordings of the user's voice into an RVC training set (dataset.zip for the Colab
// notebook tools/clone/rvc-train-colab.ipynb).
//
//   node tools/clone/dataset.mjs <out dir> <clean1.wav> [<clean2.wav> ...] [--min=3] [--max=10] [--noise=-40]
//
// Each input (voice.mjs clean output: 48 kHz mono, −16 LUFS, denoised) is cut at pauses (silencedetect ≥ 0.25 s)
// into clips of --min…--max seconds; clips are trimmed of leading/trailing silence, clips with a peak under −30 dBFS
// are dropped (breaths, room). Writes <out dir>/clips/<src>-<NNN>.wav, <out dir>/dataset.zip and a report line.
// RVC wants 10–20 min of clean speech; more than ~30 min only slows training.
// Verified 2026-10-30 on ep01 (667 s) + the tutorial phone recording (494 s).

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const FF = process.env.HYPERFRAMES_FFMPEG_PATH || "ffmpeg";
const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const [outDir, ...inputs] = args.filter((a) => !a.startsWith("--"));
if (!outDir || !inputs.length) { console.error("usage: dataset.mjs <out dir> <clean.wav>... [--min=3] [--max=10] [--noise=-40]"); process.exit(1); }
const MIN = +(opt.min ?? 3), MAX = +(opt.max ?? 10), NOISE = +(opt.noise ?? -40);
const clipsDir = path.join(outDir, "clips");
fs.rmSync(clipsDir, { recursive: true, force: true });
fs.mkdirSync(clipsDir, { recursive: true });

let total = 0, count = 0, dropped = 0;
for (const wav of inputs) {
  const src = path.basename(wav, path.extname(wav)).replace(/-clean$/, "");
  const log = spawnSync(FF, ["-hide_banner", "-i", wav, "-af", `silencedetect=noise=${NOISE}dB:d=0.25`, "-f", "null", "-"], { encoding: "utf8" }).stderr;
  const dur = +(log.match(/Duration: (\d+):(\d+):([\d.]+)/) || []).slice(1, 4).reduce((s, v, i) => s + v * [3600, 60, 1][i], 0);
  const sil = [...log.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map((m) => [+m[1], +m[2]]);
  const cuts = [0, ...sil.map(([s, e]) => (s + e) / 2), dur];      // cut in the middle of each pause
  // greedy: grow a clip until the next cut would pass MAX; a stretch longer than MAX with no pause is split evenly
  let start = 0, n = 0;
  const emit = (s, e) => {
    const d = e - s;
    if (d < MIN) return;
    const name = `${src}-${String(++n).padStart(3, "0")}.wav`;
    const out = path.join(clipsDir, name);
    const r = spawnSync(FF, ["-hide_banner", "-loglevel", "error", "-y", "-ss", s.toFixed(3), "-to", e.toFixed(3), "-i", wav, "-af", `silenceremove=start_periods=1:start_threshold=${NOISE}dB:start_silence=0.15,areverse,silenceremove=start_periods=1:start_threshold=${NOISE}dB:start_silence=0.15,areverse,astats=metadata=1:reset=0,ametadata=print:key=lavfi.astats.Overall.Peak_level:file=-`, "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", out], { encoding: "utf8" });
    const peak = +((r.stdout || "").match(/Peak_level=(-?[\d.]+)/) || [])[1];
    const len = +(spawnSync(FF.replace(/ffmpeg(\.exe)?$/i, "ffprobe$1"), ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], { encoding: "utf8" }).stdout);
    if (!(peak > -30) || !(len >= MIN)) { fs.rmSync(out); dropped++; return; }
    total += len; count++;
  };
  for (let i = 1; i < cuts.length; i++) {
    if (cuts[i] - start > MAX) {
      const prev = cuts[i - 1];
      if (prev - start >= MIN) { emit(start, prev); start = prev; }
      while (cuts[i] - start > MAX) { emit(start, start + MAX); start += MAX; }  // no pause: hard split
    }
  }
  if (dur - start >= MIN) emit(start, dur);
}
const zip = path.join(outDir, "dataset.zip");
fs.rmSync(zip, { force: true });
const z = spawnSync("powershell", ["-NoProfile", "-Command", `Compress-Archive -Path '${clipsDir}\\*.wav' -DestinationPath '${zip}' -CompressionLevel Fastest`], { encoding: "utf8" });
if (z.status !== 0) { console.error(z.stderr); process.exit(1); }
console.log(`✓ ${count} clips, ${(total / 60).toFixed(1)} min of speech (${dropped} dropped: quiet or short) → ${zip} (${(fs.statSync(zip).size / 1e6).toFixed(0)} MB)`);
