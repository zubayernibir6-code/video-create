#!/usr/bin/env node
// ref-analyze.mjs — measure a reference video once, so the plan is built from numbers instead of guesses
// (the user's timestamps and my ears are both unreliable; skill screen-promo §1 says the same for recordings).
//
//   node "D:/Video Create/tools/ref-analyze.mjs" <video> [--name=ref-02] [--asr=none|en|bn] [--model=small|turbo] [--out=<folder>]
//
// Writes into <folder> (default assets/refs/): <name>.analysis.md (the report), <name>.analysis.json,
// <name>-sheet.png (contact sheet, a frame every 2 s), <name>-spectrogram.png, and with --asr the transcript
// <name>.words.json / .srt / .txt (tools/transcribe.mjs; 'en' defaults to the small model, use --model=turbo for
// speech under loud music: it is 3.7x slower than real time and needs ~2 GB of RAM, run it alone).
// Measures: probe, loudness (LUFS, LRA, true peak), hard silences (< -40 dB, >= 0.15 s: the editor's "hit-stops"),
// tempo, voice pitch, level per second, bass and bright hits (tools/ref-analyze.py), speaking pace.
// Verified 2026-10-29 on assets/refs/ref-01.mp4: -14.2 LUFS, 5 silences, 123-129 BPM, 3.58 words/s, in ~25 s
// without --asr. Look at the sheet with the Read tool afterwards; numbers do not replace seeing it.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..");
const PY = path.join(WS, "tools", "pyenv", "Scripts", "python.exe");
const args = process.argv.slice(2);
const flag = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const video = args.find((a) => !a.startsWith("--"));
if (!video || !existsSync(video)) {
  console.log("Usage: node tools/ref-analyze.mjs <video> [--name=ref-02] [--asr=none|en|bn] [--model=small|turbo] [--out=<folder>]");
  process.exit(1);
}
const name = flag("name", path.basename(video, path.extname(video)));
const out = path.resolve(flag("out", path.join(WS, "assets", "refs")));
const asr = flag("asr", "none");
mkdirSync(out, { recursive: true });

const run = (cmd, a) => spawnSync(cmd, a, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
const clock = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`;
const log = (m) => console.log(`• ${m}`);

// 1. probe
const pr = run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", video]);
if (pr.status !== 0) { console.error(`✗ ffprobe could not read ${video}\n${pr.stderr}`); process.exit(1); }
const info = JSON.parse(pr.stdout);
const v = info.streams.find((s) => s.codec_type === "video"), a = info.streams.find((s) => s.codec_type === "audio");
const [fn, fd] = (v?.avg_frame_rate ?? "0/1").split("/").map(Number);
const duration = Number(v?.duration ?? info.format.duration);
log(`probe: ${v?.width}x${v?.height} @ ${(fn / fd).toFixed(2)} fps, ${duration.toFixed(2)} s`);
if (!a) { console.error("✗ the video has no audio track"); process.exit(1); }

// 2. loudness + hard silences
const ld = run("ffmpeg", ["-hide_banner", "-nostats", "-i", video, "-vn", "-af", "ebur128=framelog=quiet:peak=true", "-f", "null", "-"]).stderr;
const loud = {
  lufs: Number(/\bI:\s+(-?[\d.]+) LUFS/.exec(ld)?.[1]),
  lra: Number(/\bLRA:\s+([\d.]+) LU/.exec(ld)?.[1]),
  peak: Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(ld)?.[1]),
};
const sl = run("ffmpeg", ["-hide_banner", "-nostats", "-i", video, "-vn", "-af", "silencedetect=noise=-40dB:d=0.15", "-f", "null", "-"]).stderr;
const silences = [...sl.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/g)]
  .map((m) => ({ from: Number(m[1]), to: Number(m[2]), dur: Number(m[3]) }));
log(`loudness ${loud.lufs} LUFS, LRA ${loud.lra} LU, peak ${loud.peak} dBFS; ${silences.length} hard silence(s)`);

// 3. tempo, pitch, hits (Python)
const tmp = path.join(os.tmpdir(), `ref-analyze-${process.pid}`);
mkdirSync(tmp, { recursive: true });
const wav = path.join(tmp, "mono.wav"), pyOut = path.join(tmp, "audio.json");
run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", video, "-vn", "-ac", "1", "-ar", "22050", wav]);
const py = run(PY, ["-I", path.join(WS, "tools", "ref-analyze.py"), wav, pyOut]);
if (py.status !== 0) { console.error(`✗ audio analysis failed\n${py.stderr}`); process.exit(1); }
const audio = JSON.parse(readFileSync(pyOut, "utf8"));
rmSync(tmp, { recursive: true, force: true });
log(`audio: ${audio.tempo_bpm_percussive} / ${audio.tempo_bpm_mix} BPM, voice f0 ${audio.voice_f0_hz?.median ?? "?"} Hz`);

// 4. spectrogram + contact sheet
const spec = path.join(out, `${name}-spectrogram.png`);
run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", video, "-lavfi", "showspectrumpic=s=1500x420:legend=0:scale=log:fscale=log", spec]);
const sheet = path.join(out, `${name}-sheet.png`);
if (v) {
  const cs = run("node", [path.join(WS, "tools", "contact-sheet.mjs"), video, `--out=${sheet}`]);
  log(cs.status === 0 ? `contact sheet: ${sheet}` : `contact sheet failed: ${cs.stderr.trim() || cs.stdout.trim()}`);
}

// 5. speech (optional)
let speech = null;
if (asr !== "none") {
  const model = flag("model", asr === "en" ? "small" : "bengali");
  log(`transcribing (${asr}, ${model}) …`);
  const base = path.join(out, name);
  const tr = spawnSync("node", [path.join(WS, "tools", "transcribe.mjs"), video, `--lang=${asr}`, `--model=${model}`, `--out=${base}`], { stdio: ["ignore", "ignore", "inherit"] });
  if (tr.status === 0 && existsSync(`${base}.words.json`)) {
    const words = JSON.parse(readFileSync(`${base}.words.json`, "utf8"));
    const span = words.at(-1).end - words[0].start;
    const lines = [...readFileSync(`${base}.srt`, "utf8").replace(/^\uFEFF/, "").matchAll(/(\d+):(\d+):(\d+),(\d+) --> .*\r?\n([^\r\n]+)/g)]
      .map((m) => `(${clock(+m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000)}) ${m[5]}`);
    speech = { words: words.length, span: +span.toFixed(2), wps: +(words.length / span).toFixed(2), wpm: Math.round((60 * words.length) / span), lines };
  } else log("transcription failed (the rest of the report is still written)");
}

// 6. report
const f0 = audio.voice_f0_hz;
const range = !f0 ? "n/a" : f0.median < 155 ? "male range" : f0.median > 175 ? "female range" : "ambiguous";
const md = [
  `# ${name} — reference analysis (${new Date().toISOString().slice(0, 10)})`,
  ``,
  `Source: \`${video}\` · ${v ? `${v.width}x${v.height} @ ${(fn / fd).toFixed(2)} fps · ${duration.toFixed(2)} s · ${v.codec_name} + ` : `audio only · ${duration.toFixed(2)} s · `}${a.codec_name} ${a.sample_rate} Hz ${a.channels} ch`,
  ``,
  `## Sound`,
  `- Loudness: ${loud.lufs} LUFS integrated · LRA ${loud.lra} LU · true peak ${loud.peak} dBFS`,
  `- Tempo: ${audio.tempo_bpm_percussive} BPM (percussive part) / ${audio.tempo_bpm_mix} BPM (whole mix) · rough key: ${audio.key_guess.map((k) => `${k.key} (${k.r})`).join(", ")}`,
  f0 ? `- Voice pitch: median ${f0.median} Hz (p10 ${f0.p10} – p90 ${f0.p90}) → ${range} (music masks it: a hint only)` : `- Voice pitch: none found`,
  `- Spectral centroid: ${audio.spectral_centroid_hz} Hz (higher = brighter)`,
  `- Hard silences (< −40 dB, ≥ 0.15 s): ${silences.length ? silences.map((s) => `${s.from.toFixed(2)}–${s.to.toFixed(2)} (${s.dur.toFixed(2)} s)`).join(", ") : "none"}`,
  `- Bass hits at (s): ${audio.bass_hits_s.join(", ")}`,
  `- Bright hits (whoosh / sparkle) at (s): ${audio.bright_hits_s.join(", ")}`,
  `- Level per second (dB RMS): ${audio.rms_db_per_second.join(" ")}`,
  ``,
  ...(speech ? [`## Speech`, `- ${speech.words} words in ${speech.span} s = ${speech.wps} words/s (${speech.wpm} wpm)`, ...speech.lines.map((l) => `- ${l}`), ``] : []),
  `## Files`,
  `- ${v ? `${name}-sheet.png (frame every 2 s) · ` : ""}${name}-spectrogram.png${speech ? ` · ${name}.words.json / .srt / .txt` : ""}`,
  ``,
].join("\n");
writeFileSync(path.join(out, `${name}.analysis.md`), md);
writeFileSync(path.join(out, `${name}.analysis.json`), JSON.stringify({ probe: { width: v?.width, height: v?.height, fps: v ? fn / fd : undefined, duration }, loud, silences, audio, speech }, null, 1));
console.log(`\n✓ ${path.join(out, `${name}.analysis.md`)}`);
