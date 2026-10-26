#!/usr/bin/env node
// mix.mjs — the episode's whole soundtrack as one WAV, cut to the same list as the picture.
//
//   node tools/episode/mix.mjs <episode.json>
//   in:  <work>/audio/voice_master.wav (voice.mjs), <work>/cuts_map.json (cuts.mjs), <work>/sfx.json (build-page),
//        the episode's music file
//   out: <work>/media/mix.wav (48 kHz stereo) + <work>/audio/mix-report.json (measured levels)
//
// Voice: the kept pieces back to back, 8 ms fades at every cut (no clicks), silence under the title and end cards.
// Music: looped with crossfades so the track's own ending lands on the last second of the episode; a dip at
// 2.8 kHz leaves room for the voice; set to ep.mix.musicDb under the voice and ducked a few dB more while he talks
// (sidechain); louder under the title and end cards; 2.5 s fade at the end.
// Sound effects: each placed at (visual hit − its silent lead-in, assets/sfx/manifest.json lead_s).
// Final loudness is NOT set here: finish.mjs brings the master to −14 LUFS.
import { existsSync } from "node:fs";
import path from "node:path";
import { WORKSPACE, duration, ffmpeg, ffmpegInfo, loadEpisode, loudnormArgs, loudness, readJSON, writeJSON } from "./lib.mjs";

const ep = loadEpisode(process.argv[2] ?? ".");
const mx = { musicDb: -19, duck: { threshold: 0.02, ratio: 4, attack: 40, release: 600 }, titleBoostDb: 13, endBoostDb: 11,
  loopFrom: 1.0, loopTo: null, xfade: 2.0, ...ep.mix };
const W = ep.work, A = path.join(W, "audio");
const map = readJSON(path.join(W, "cuts_map.json"));
const sfx = existsSync(path.join(W, "sfx.json")) ? readJSON(path.join(W, "sfx.json")) : [];
const total = map.total;
const f3 = (x) => Number(x).toFixed(3);

// 1. voice on the episode timeline
{
  const parts = [], labels = [];
  let cursor = 0, k = 0;
  const silence = (len) => { parts.push(`anullsrc=r=48000:cl=mono,atrim=0:${f3(len)}[s${k}]`); labels.push(`[s${k++}]`); };
  for (const s of map.segments) {
    if (s.out0 - cursor > 0.001) silence(s.out0 - cursor);
    const len = s.src1 - s.src0;
    parts.push(`[0:a]atrim=${f3(s.src0)}:${f3(s.src1)},asetpts=PTS-STARTPTS,afade=t=in:d=0.008,afade=t=out:st=${f3(len - 0.008)}:d=0.008[p${k}]`);
    labels.push(`[p${k++}]`);
    cursor = s.out1;
  }
  if (total - cursor > 0.001) silence(total - cursor);
  ffmpeg(["-i", path.join(A, "voice_master.wav"), "-filter_complex", `${parts.join(";")};${labels.join("")}concat=n=${labels.length}:v=0:a=1[v]`,
    "-map", "[v]", "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", path.join(A, "voice_cut.wav")]);
  console.log(`voice cut: ${duration(path.join(A, "voice_cut.wav")).toFixed(3)} s (episode ${total} s)`);
}

// 2. music bed of exactly `total` seconds, ending on the track's own ending
{
  const src = ep.source.music, end = duration(src), lf = mx.loopFrom, lt = mx.loopTo ?? end - 12, xf = mx.xfade;
  let n = 1, pieces;
  if (end >= total) pieces = [[0, total]];
  else {
    for (n = 2; ; n++) {
      const s = lt + (n - 2) * (lt - lf) + end - (n - 1) * xf - total;
      if (s >= lf) { pieces = [[0, lt], ...Array(n - 2).fill([lf, lt]), [s, end]]; break; }
      if (n > 50) throw new Error("music too short to loop");
    }
  }
  const fc = pieces.map(([a, b], i) => `[0:a]atrim=${f3(a)}:${f3(b)},asetpts=PTS-STARTPTS[m${i}]`);
  let last = "m0";
  for (let i = 1; i < pieces.length; i++) { fc.push(`[${last}][m${i}]acrossfade=d=${xf}:c1=tri:c2=tri[x${i}]`); last = `x${i}`; }
  ffmpeg(["-i", src, "-filter_complex", `${fc.join(";")};[${last}]aresample=48000,highpass=f=50,equalizer=f=2800:width_type=o:width=1.6:g=-4[o]`,
    "-map", "[o]", "-t", f3(total), "-ac", "2", "-c:a", "pcm_s24le", path.join(A, "music_bed_raw.wav")]);
  ffmpeg(["-i", path.join(A, "music_bed_raw.wav"), "-af", loudnormArgs(path.join(A, "music_bed_raw.wav"), -16), "-ar", "48000", "-c:a", "pcm_s24le", path.join(A, "music_bed.wav")]);
  console.log(`music bed: ${pieces.length} piece(s) [${pieces.map(([a, b]) => `${a.toFixed(1)}–${b.toFixed(1)}`).join(", ")}], ${duration(path.join(A, "music_bed.wav")).toFixed(2)} s`);
}

// 3. music level automation (dB over time), then ducking under the voice
const keys = [[0, mx.musicDb]];
const ramp = (t0, t1, db) => { keys.push([t0, keys.at(-1)[1]]); keys.push([t1, db]); };
if (map.title) { ramp(map.title.out0 - 0.6, map.title.out0, mx.musicDb + mx.titleBoostDb); ramp(map.title.out1 - 0.4, map.title.out1 + 0.4, mx.musicDb); }
// cliffhanger: the music cuts out on the hit and the freeze is left to the sound effects
if (map.cliff) ramp(map.cliff.out0 - 0.05, map.cliff.out0 + 0.25, -70);
if (map.end) ramp(map.end.out0 - 0.6, map.end.out0 + 0.2, mx.musicDb + mx.endBoostDb);
keys.sort((a, b) => a[0] - b[0]);
let expr = `${keys.at(-1)[1]}`;
for (let i = keys.length - 2; i >= 0; i--) {
  const [t0, d0] = keys[i], [t1, d1] = keys[i + 1];
  const seg = t1 - t0 < 1e-6 ? `${d1}` : `(${d0}+(${d1 - d0})*(t-${f3(t0)})/${f3(t1 - t0)})`;
  expr = `if(lt(t,${f3(t1)}),${seg},${expr})`;
}
const fadeSt = total - 2.5;
const d = mx.duck;
ffmpeg(["-i", path.join(A, "music_bed.wav"), "-i", path.join(A, "voice_cut.wav"), "-filter_complex",
  `[0:a]volume='pow(10,(${expr})/20)':eval=frame,afade=t=out:st=${f3(fadeSt)}:d=2.5[m];[1:a]aformat=channel_layouts=stereo[sc];` +
  `[m][sc]sidechaincompress=threshold=${d.threshold}:ratio=${d.ratio}:attack=${d.attack}:release=${d.release}:makeup=1[o]`,
  "-map", "[o]", "-c:a", "pcm_s24le", path.join(A, "music_ducked.wav")]);

// 4. sound effects
const man = readJSON(path.join(WORKSPACE, "assets", "sfx", "manifest.json"));
const sfxInputs = [], sfxFc = [], sfxLabels = [];
sfx.forEach((c, i) => {
  const file = path.join(WORKSPACE, "assets", "sfx", c.file);
  if (!existsSync(file)) throw new Error(`no sound effect ${c.file}`);
  // c.from / c.d play only part of the file (from c.from s, for c.d s); a cue with c.from starts exactly at c.t
  const lead = c.from != null ? 0 : man[c.file.replace(/\.mp3$/, "")]?.lead_s ?? 0;
  const at = Math.max(0, c.t - lead);
  const cut = c.from != null || c.d != null ? `atrim=start=${c.from ?? 0}${c.d != null ? `:duration=${c.d}` : ""},asetpts=PTS-STARTPTS,` +
    (c.d != null ? `afade=t=out:st=${Math.max(0, c.d - 0.15)}:d=0.15,` : "") : "";
  sfxInputs.push("-i", file);
  sfxFc.push(`[${i}:a]${cut}aformat=sample_rates=48000:channel_layouts=stereo,volume=${c.vol},adelay=${Math.round(at * 1000)}:all=1[e${i}]`);
  sfxLabels.push(`[e${i}]`);
});
if (sfx.length) {
  ffmpeg([...sfxInputs, "-f", "lavfi", "-t", f3(total), "-i", "anullsrc=r=48000:cl=stereo", "-filter_complex",
    `${sfxFc.join(";")};[${sfx.length}:a]${sfxLabels.join("")}amix=inputs=${sfx.length + 1}:duration=first:normalize=0[o]`,
    "-map", "[o]", "-t", f3(total), "-c:a", "pcm_s24le", path.join(A, "sfx_track.wav")]);
} else ffmpeg(["-f", "lavfi", "-t", f3(total), "-i", "anullsrc=r=48000:cl=stereo", "-c:a", "pcm_s24le", path.join(A, "sfx_track.wav")]);

// 5. final mix
const out = path.join(W, "media", "mix.wav");
ffmpeg(["-i", path.join(A, "voice_cut.wav"), "-i", path.join(A, "music_ducked.wav"), "-i", path.join(A, "sfx_track.wav"), "-filter_complex",
  "[0:a]aformat=channel_layouts=stereo[v];[v][1:a][2:a]amix=inputs=3:duration=first:normalize=0,alimiter=limit=0.89:level=disabled:attack=3:release=60[o]",
  "-map", "[o]", "-ar", "48000", "-c:a", "pcm_s16le", "-t", f3(total), out]);

// 6. measure: voice vs music while he talks, music alone in pauses
const rmsWin = (file, a, b) => Number(ffmpegInfo(["-ss", f3(a), "-t", f3(b - a), "-i", file, "-af", "volumedetect", "-f", "null", "-"]).match(/mean_volume: (-?[\d.]+)/)?.[1]);
const longSeg = map.segments.filter((s) => s.part === "main").sort((a, b) => (b.out1 - b.out0) - (a.out1 - a.out0))[0];
const v = rmsWin(path.join(A, "voice_cut.wav"), longSeg.out0 + 2, longSeg.out1 - 2);
const m = rmsWin(path.join(A, "music_ducked.wav"), longSeg.out0 + 2, longSeg.out1 - 2);
const report = { total, mix: loudness(out), voice: loudness(path.join(A, "voice_cut.wav")), musicUnderVoiceDb: Number((m - v).toFixed(1)),
  window: [longSeg.out0 + 2, longSeg.out1 - 2], sfx: sfx.length };
if (map.title) report.musicTitleDb = Number((rmsWin(path.join(A, "music_ducked.wav"), map.title.out0 + 0.5, map.title.out1 - 0.5) - v).toFixed(1));
writeJSON(path.join(A, "mix-report.json"), report);
console.log(`mix: ${report.mix.I} LUFS, true peak ${report.mix.TP} dBFS; music sits ${-report.musicUnderVoiceDb} dB under the voice while he talks` +
  (report.musicTitleDb != null ? ` (${report.musicTitleDb} dB relative under the title card)` : "") + `; ${sfx.length} sound effects → ${out}`);
