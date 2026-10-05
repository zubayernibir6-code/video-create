#!/usr/bin/env node
// voice.mjs — voice-over for videos: record from a microphone and/or clean any voice recording.
//
//   node "E:/Video Create/tools/voice.mjs" devices
//   node "E:/Video Create/tools/voice.mjs" record <name> [--seconds=120] [--device="<mic name>"] [--denoise=ai|classic|off]
//   node "E:/Video Create/tools/voice.mjs" clean <input> [<output.wav>] [--denoise=ai|classic|off]
//
// record  writes <name>-raw.wav (untouched) and <name>.wav (cleaned) into the current folder.
//         Press Enter in the terminal to stop early. Default mic = the first one `devices` lists.
//         Stay silent for the first second: that second becomes the room-noise profile.
// clean   accepts anything FFmpeg reads (wav, mp3, m4a, WhatsApp .ogg/.opus, or a video).
//
// --denoise=ai (default when tools/deep-filter/deep-filter.exe exists): DeepFilterNet 0.5.6 (MIT/Apache-2.0),
//   attenuation limited to 40 dB so the voice keeps a natural room tail. On the user's real laptop recording it
//   lifted the speech-to-noise gap from 28 dB to ~60 dB (unlimited: 76 dB) vs 41 dB for the classic chain, and
//   the transcript stayed intact (2026-10-06). -D compensates its delay (measured lag 0.00 ms).
// --denoise=classic: the FFmpeg chain below. --denoise=off: only high-pass, compressor, trim and loudness.
//
// Classic clean chain (plain FFmpeg, voice only — never run it on music):
//   high-pass 80 Hz → afftdn with a noise PROFILE taken from the quietest 0.8 s of the
//   recording (prepended, sampled, then cut off again) → gentle 3:1 compressor → trim silence
//   at both ends → two-pass loudnorm to -16 LUFS, true peak -1.5 dBTP → 48 kHz mono 16-bit WAV.
// Measured 2026-10-05 on speech + pink noise + 50/150 Hz hum: the profile lifts the speech-to-noise
// gap from 24 dB to ~50 dB and removes the hum completely; adaptive afftdn (tn=1) managed only +3.5 dB.
// afftdn delays its output by 25 ms, which is trimmed off so narration stays in sync with picture.
// If the recording has no real pause (quietest 0.8 s within 12 dB of speech), it falls back to
// adaptive afftdn. -16 LUFS is a voice stem level; the finished mix is normalised to -14 LUFS later.
// The loudnorm LRA target is raised to the measured LRA so it stays in linear mode (CLAUDE.md §0b).

import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const DEEP_FILTER = path.join(import.meta.dirname, "deep-filter", "deep-filter.exe");
const DF_ATTEN_DB = 40;
const TARGET_I = -16;
const TARGET_TP = -1.5;
const NR_DB = 24;
const AFFTDN_DELAY = 0.025;
const PROFILE_LEN = 0.8;
const AFTER_DENOISE = [
  "acompressor=threshold=-24dB:ratio=3:attack=8:release=160:makeup=1",
  "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.2",
  "areverse",
  "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.3",
  "areverse",
].join(",");

function fail(msg) {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
}

function parseFlags(argv) {
  const flags = {};
  const rest = [];
  for (const a of argv) {
    const m = a.match(/^--([a-z-]+)=(.*)$/);
    if (m) flags[m[1]] = m[2];
    else rest.push(a);
  }
  return { flags, rest };
}

function ffmpeg(args) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) fail(`FFmpeg failed:\n${r.stderr.split("\n").slice(-6).join("\n")}`);
  return r.stderr;
}

function listMics() {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-list_devices", "true", "-f", "dshow", "-i", "dummy"], { encoding: "utf8" });
  return [...`${r.stdout}\n${r.stderr}`.matchAll(/"([^"]+)" \(audio\)/g)].map((m) => m[1]);
}

// The quietest PROFILE_LEN window, found from 50 ms RMS frames at 16 kHz.
function findQuietWindow(input) {
  const r = spawnSync("ffmpeg", ["-v", "error", "-i", input, "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], { maxBuffer: 1 << 30 });
  const pcm = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, Math.floor(r.stdout.length / 4));
  const W = 800;
  const pow = [];
  for (let i = 0; i + W <= pcm.length; i += W) {
    let s = 0;
    for (let j = i; j < i + W; j++) s += pcm[j] * pcm[j];
    pow.push(s / W);
  }
  const span = Math.round(PROFILE_LEN / 0.05);
  if (pow.length < span + 4) return null;
  let best = Infinity, at = 0, run = 0;
  for (let k = 0; k < pow.length; k++) {
    run += pow[k] - (k >= span ? pow[k - span] : 0);
    if (k >= span - 1 && run < best) { best = run; at = k - span + 1; }
  }
  const db = (p) => 10 * Math.log10(p + 1e-12);
  const speech = db([...pow].sort((a, b) => a - b)[Math.floor(0.9 * (pow.length - 1))]);
  const quiet = db(best / span);
  return { start: at * 0.05, end: at * 0.05 + PROFILE_LEN, quiet, speech, usable: speech - quiet >= 12 };
}

// Filter graph from input 0 to the label [pre]: denoised, compressed, silence-trimmed voice.
function preGraph(q) {
  if (q?.usable) {
    const L = PROFILE_LEN;
    return (
      `[0:a]atrim=${q.start.toFixed(3)}:${q.end.toFixed(3)},asetpts=PTS-STARTPTS[n];[0:a]asetpts=PTS-STARTPTS[a];` +
      `[n][a]concat=n=2:v=0:a=1,highpass=f=80,` +
      `asendcmd=0.0 afftdn sn start,asendcmd=${(L - 0.05).toFixed(2)} afftdn sn stop,afftdn=nr=${NR_DB}:nf=-40,` +
      `atrim=start=${(L + AFFTDN_DELAY).toFixed(3)},asetpts=PTS-STARTPTS,${AFTER_DENOISE}[pre]`
    );
  }
  return `[0:a]highpass=f=80,afftdn=nr=12:nf=-40:tn=1,atrim=start=${AFFTDN_DELAY},asetpts=PTS-STARTPTS,${AFTER_DENOISE}[pre]`;
}

function loudnormJson(stderr) {
  try {
    return JSON.parse(stderr.slice(stderr.lastIndexOf("{"), stderr.lastIndexOf("}") + 1));
  } catch {
    fail("Could not read the loudness measurement from FFmpeg.");
  }
}

const measureFile = (f) =>
  loudnormJson(ffmpeg(["-i", f, "-vn", "-af", `loudnorm=I=${TARGET_I}:TP=${TARGET_TP}:LRA=11:print_format=json`, "-f", "null", "-"]));

const duration = (f) =>
  Number(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" }).stdout.trim()).toFixed(1);

// DeepFilterNet on a 48 kHz mono copy (the rate it works at). Returns the denoised WAV path.
function deepFilter(input, work) {
  const in48 = path.join(work, "in48.wav");
  ffmpeg(["-y", "-i", input, "-vn", "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", in48]);
  const outDir = path.join(work, "df");
  const r = spawnSync(DEEP_FILTER, ["-D", "-a", String(DF_ATTEN_DB), "-o", outDir, in48], { encoding: "utf8" });
  const out = path.join(outDir, "in48.wav");
  if (r.status !== 0 || !existsSync(out)) fail(`DeepFilterNet failed:\n${(r.stderr || "").split("\n").slice(-6).join("\n")}`);
  return out;
}

function clean(input, output, mode) {
  if (!existsSync(input)) fail(`File not found: ${input}`);
  output ??= path.join(path.dirname(input), `${path.parse(input).name}-clean.wav`);
  mode ??= existsSync(DEEP_FILTER) ? "ai" : "classic";
  if (!["ai", "classic", "off"].includes(mode)) fail(`Unknown --denoise=${mode}. Use ai, classic or off.`);
  if (mode === "ai" && !existsSync(DEEP_FILTER)) fail(`--denoise=ai needs ${DEEP_FILTER}`);

  const before = measureFile(input);
  if (!Number.isFinite(Number(before.input_i)) || Number(before.input_i) < -70) {
    fail(`The recording is silent (${before.input_i} LUFS). Check that the right microphone is selected and not muted.`);
  }
  const q = findQuietWindow(input);
  const work = mkdtempSync(path.join(os.tmpdir(), "voice-"));
  process.on("exit", () => rmSync(work, { recursive: true, force: true }));
  const src = mode === "ai" ? deepFilter(input, work) : input;
  const pre = mode === "classic" ? preGraph(q) : `[0:a]highpass=f=80,${AFTER_DENOISE}[pre]`;
  const m = loudnormJson(
    ffmpeg(["-i", src, "-filter_complex", `${pre};[pre]loudnorm=I=${TARGET_I}:TP=${TARGET_TP}:LRA=11:print_format=json[o]`, "-map", "[o]", "-f", "null", "-"]),
  );
  if (!Number.isFinite(Number(m.input_i)) || Number(m.input_i) < -70) {
    fail("No voice found — after removing the room noise nothing was left. Did you speak? Sit closer to the microphone and record again.");
  }
  const lra = Math.max(11, Math.ceil(Number(m.input_lra)) + 1);
  const norm =
    `loudnorm=I=${TARGET_I}:TP=${TARGET_TP}:LRA=${lra}:linear=true` +
    `:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}` +
    `:measured_thresh=${m.input_thresh}:offset=${m.target_offset}`;
  ffmpeg(["-y", "-i", src, "-filter_complex", `${pre};[pre]${norm},aresample=48000[o]`, "-map", "[o]", "-ac", "1", "-c:a", "pcm_s16le", output]);

  const after = measureFile(output);
  console.log(`\n✓ Clean voice saved: ${output}`);
  if (Number(before.input_i) < -40 || (q && q.speech - q.quiet < 12)) {
    console.log("  ⚠ The voice is very quiet or barely louder than the room. Was anyone speaking?");
    console.log("    Sit closer to the microphone (a headset mic is best) and record again.");
  }
  if (mode === "ai") console.log(`  noise removal: AI (DeepFilterNet, up to ${DF_ATTEN_DB} dB)`);
  else if (mode === "off") console.log("  noise removal: off");
  else
    console.log(
      q?.usable
        ? `  noise removal: classic, profile ${q.start.toFixed(2)}–${q.end.toFixed(2)} s (room noise ${(q.speech - q.quiet).toFixed(0)} dB below the voice)`
        : "  noise removal: classic — no clear pause found, used gentler automatic noise reduction",
    );
  console.log(`  before: ${before.input_i} LUFS, peak ${before.input_tp} dBTP, ${duration(input)} s`);
  console.log(`  after : ${after.input_i} LUFS, peak ${after.input_tp} dBTP, ${duration(output)} s  (target ${TARGET_I} LUFS, peak ≤ ${TARGET_TP})`);
}

function record(name, flags) {
  if (!name) fail("Give the recording a name, e.g.  node voice.mjs record intro");
  const mics = listMics();
  if (!mics.length) fail("No microphone found.");
  const device = flags.device ?? mics[0];
  if (!mics.includes(device)) fail(`Microphone "${device}" not found. Available:\n  ${mics.join("\n  ")}`);
  const seconds = Number(flags.seconds ?? 120);
  const raw = path.resolve(`${name}-raw.wav`);
  const out = path.resolve(`${name}.wav`);

  console.log(`🎙  Microphone: ${device}`);
  console.log(`   Recording for up to ${seconds} s. Press Enter to stop early.`);
  console.log("   Starting the microphone…");
  // ffmpeg's own "press q" does not reach it under Git Bash (mintty has no console), so this
  // script reads Enter itself and passes ffmpeg its stop key through a stdin pipe.
  // The mic takes ~1 s to open, so "speak now" is printed only once ffmpeg reports progress.
  const ff = spawn(
    "ffmpeg",
    ["-hide_banner", "-loglevel", "error", "-stats", "-y", "-f", "dshow", "-audio_buffer_size", "50", "-i", `audio=${device}`,
     "-t", String(seconds), "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", raw],
    { stdio: ["pipe", "inherit", "pipe"] },
  );
  let live = false;
  ff.stderr.on("data", (chunk) => {
    if (!live && /size=/.test(chunk)) {
      live = true;
      console.log("\n🔴 RECORDING — stay silent for 1 second, then start speaking.\n");
    }
    process.stderr.write(chunk);
  });
  process.stdin.on("data", () => ff.stdin.writable && ff.stdin.write("q"));
  ff.on("close", (code) => {
    process.stdin.destroy();
    if (!existsSync(raw)) fail(`Recording failed (FFmpeg exit ${code}).`);
    console.log(`\n✓ Raw recording saved: ${raw}`);
    clean(raw, out, flags.denoise);
  });
}

const [cmd, ...args] = process.argv.slice(2);
const { flags, rest } = parseFlags(args);
if (cmd === "devices") {
  const mics = listMics();
  console.log(mics.length ? `Microphones (first = default):\n  ${mics.join("\n  ")}` : "No microphone found.");
} else if (cmd === "record") {
  record(rest[0], flags);
} else if (cmd === "clean") {
  if (!rest[0]) fail("Usage: node voice.mjs clean <input> [<output.wav>]");
  clean(path.resolve(rest[0]), rest[1] && path.resolve(rest[1]), flags.denoise);
} else {
  console.log(`Usage:
  node voice.mjs devices
  node voice.mjs record <name> [--seconds=120] [--device="<mic name>"] [--denoise=ai|classic|off]
  node voice.mjs clean <input> [<output.wav>] [--denoise=ai|classic|off]`);
}
