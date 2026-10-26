#!/usr/bin/env node
// voice.mjs — the speaker's voice from the raw recording, mastered, on the SOURCE timeline (nothing is cut here).
//
//   node tools/episode/voice.mjs <episode.json>
//   out: <work>/audio/voice_master.wav (48 kHz mono, −16 LUFS) and voice16.wav (16 kHz copy for the transcriber)
//
// Chain (measured on zubayer-ep01, a webcam mic at −29 LUFS): DeepFilterNet AI denoise (40 dB limit; the gap
// between speech and room noise went 27.7 → 57 dB) → high-pass 85 Hz → −3 dB at 250 Hz (mud) → +3.5 dB at
// 3.6 kHz (presence) → +1.5 dB at 9 kHz (air) → de-esser → 3:1 compressor → two-pass loudnorm to −16 LUFS.
// The silence is NOT trimmed (that would break sync with the picture). ep.voice overrides the EQ string.
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { WORKSPACE, ffmpeg, loadEpisode, loudness, loudnormArgs, run } from "./lib.mjs";

const ep = loadEpisode(process.argv[2] ?? ".");
const A = path.join(ep.work, "audio");
mkdirSync(path.join(A, "df"), { recursive: true });
const raw = path.join(A, "raw48.wav");
ffmpeg(["-i", ep.source.video, "-vn", "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", raw]);
console.log(`raw voice: ${JSON.stringify(loudness(raw))}`);
const DF = path.join(WORKSPACE, "tools", "deep-filter", "deep-filter.exe");
let src = raw;
if (existsSync(DF) && ep.voice?.denoise !== "off") {
  run(DF, ["-D", "-a", "40", "-o", path.join(A, "df"), raw]);
  const out = readdirSync(path.join(A, "df")).find((f) => f.endsWith(".wav"));
  if (out) src = path.join(A, "df", out);
}
const chain = ep.voice?.chain ?? "highpass=f=85,equalizer=f=250:width_type=q:width=1.5:g=-3,equalizer=f=3600:width_type=q:width=1.2:g=3.5," +
  "equalizer=f=9000:width_type=q:width=1.0:g=1.5,deesser=i=0.4,acompressor=threshold=-20dB:ratio=3:attack=10:release=150:makeup=4dB";
const chained = path.join(A, "chain.wav");
ffmpeg(["-i", src, "-af", chain, "-c:a", "pcm_s24le", chained]);
const master = path.join(A, "voice_master.wav");
ffmpeg(["-i", chained, "-af", `${loudnormArgs(chained, -16)},aresample=48000`, "-c:a", "pcm_s16le", master]);
ffmpeg(["-i", master, "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", path.join(A, "voice16.wav")]);
console.log(`voice master: ${JSON.stringify(loudness(master))} → ${master}`);
