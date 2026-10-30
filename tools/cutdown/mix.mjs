#!/usr/bin/env node
// mix.mjs — a cut-down Reel's soundtrack: the cut's voice.wav (master sound + music bed) with the page's new sound
// effects on top.
//
//   node tools/cutdown/mix.mjs projects/<name>
//   in:  <work>/media/voice.wav (cut.mjs), <work>/sfx.json (page.mjs), assets/sfx/manifest.json (lead_s)
//   out: <work>/media/mix.wav (48 kHz stereo; finish.mjs sets the final −14 LUFS)
// Each effect starts at (visual hit − its silent lead-in), so the sound lands on the frame (CLAUDE.md §0d.7).
// The master's own effects are already inside voice.wav: page.mjs only cues effects for NEW graphics.
import path from "node:path";
import { WORKSPACE, ffmpeg, readJSON } from "../episode/lib.mjs";

const dir = path.resolve(process.argv[2] ?? ".");
const cfg = readJSON(path.join(dir, "cutdown.json"));
const W = cfg.work, M = path.join(W, "media");
const sfx = readJSON(path.join(W, "sfx.json"));
const man = readJSON(path.join(WORKSPACE, "assets", "sfx", "manifest.json"));
const lead = Object.fromEntries(Object.values(man).filter((v) => v?.file).map((v) => [v.file, v.lead_s ?? 0]));
const f3 = (x) => Number(x).toFixed(3);

const inputs = ["-i", path.join(M, "voice.wav")], chains = [], labels = ["[0:a]"];
sfx.forEach((s, i) => {
  inputs.push("-i", path.join(WORKSPACE, "assets", "sfx", s.file));
  const at = Math.max(0, s.t - (lead[s.file] ?? 0));
  const trim = s.d != null ? `,atrim=${f3(s.from ?? 0)}:${f3((s.from ?? 0) + s.d)},asetpts=PTS-STARTPTS,afade=t=out:st=${f3(Math.max(0, s.d - 0.12))}:d=0.12` : s.from ? `,atrim=start=${f3(s.from)},asetpts=PTS-STARTPTS` : "";
  chains.push(`[${i + 1}:a]aresample=48000,aformat=channel_layouts=stereo${trim},volume=${s.vol},adelay=${Math.round(at * 1000)}:all=1[s${i}]`);
  labels.push(`[s${i}]`);
});
const graph = [...chains, `${labels.join("")}amix=inputs=${labels.length}:normalize=0:duration=first,alimiter=limit=0.89:level=false[out]`].join(";");
ffmpeg([...inputs, "-filter_complex", graph, "-map", "[out]", "-c:a", "pcm_s16le", "-ar", "48000", path.join(M, "mix.wav")]);
console.log(`mix.wav: voice + ${sfx.length} sounds`);
