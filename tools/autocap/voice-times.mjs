// voice-times.mjs — where each script line sits inside ONE voice file: his cloned voice made in a single Gemini
// request (never one request per line: the Tier-1 key allows 100 TTS requests a day), or later his phone take.
//   import { voiceTimes } from "./voice-times.mjs";
//   const v = voiceTimes("…/voice.wav", lines, anchors, { minMatch: 0.85 });
//   → { dur, matched, lines: [{ a, b, cutIn, cutOut, anchor }], words: [{ text, start, end, line, guessed? }] }
//     (all in seconds of the voice file)
//   a / b = the line's first word start / last word end; anchor = start of the line's anchor word (null if none);
//   cutIn / cutOut = where to cut the file around the line: the quietest 10 ms inside the pause between two lines,
//   so the composer can add silence there (the screen is still loading or typing) without clipping a word.
// Steps: transcribe once (tools/episode/asr_chunks.py, ≤ 18-s pieces cut in pauses: the whole-file transcriber can
// stop early inside a 30-s window, seen on the GitHub series 2026-11-01) → <voice>.words.json, redone when the voice
// is newer, resumed when a run was cut off, and held back while another speech-to-text job runs and RAM is too short
// for a second model · align the script to the spoken words (tools/reel/align.mjs: the script's spelling, the voice's timing;
// English UI words heard in Bengali letters are matched by their consonant skeleton) · respread garbled runs.
// Throws (the script does not match the voice) when < 85 % of the script words are found, half of a line is guessed,
// 12+ words in a row are guessed, or an anchor word was never heard (its click would land on a guess).
// Verified 2026-11-01 on projects/autotut-proof (a Piper test voice and his cloned voice talha-a).
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { alignScript, norm } from "../reel/align.mjs";

const WS = path.resolve(import.meta.dirname, "..", "..");
const PY = path.join(WS, "tools", "pyenv", "Scripts", "python.exe");
const FF = process.env.HYPERFRAMES_FFMPEG_PATH || "ffmpeg";
const SR = 16000, HOP = 160; // 10-ms frames

// level of every 10 ms in dB (smoothed over 30 ms)
function levels(file) {
  const r = spawnSync(FF, ["-v", "error", "-i", file, "-f", "f32le", "-ac", "1", "-ar", String(SR), "-"], { maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`ffmpeg could not read ${file}`);
  const x = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.byteLength >> 2);
  const n = Math.floor(x.length / HOP), db = new Float64Array(n);
  for (let i = 0; i < n; i++) { let s = 0; for (let j = i * HOP; j < (i + 1) * HOP; j++) s += x[j] * x[j]; db[i] = 10 * Math.log10(s / HOP + 1e-12); }
  return db.map((_, i) => (db[Math.max(0, i - 1)] + db[i] + db[Math.min(n - 1, i + 1)]) / 3);
}

// another speech-to-text job running (another session's episode, say) AND too little free RAM for a second model?
// The Bengali model takes ~2.3 GB: on 2026-11-01 two at once with 1.1 GB free both slowed past 10 min for a 20-s voice
// that alone takes 2.5 min (the laptop swapped). So wait while RAM is short (checked every 15 s, at most 20 min).
// With ≥ 2.8 GB free the second model fits: an earlier version waited on the other job alone, 30 min with 3.5 GB free.
export const ASR_RAM_MB = 2800;
function waitForAsr() {
  const q = "@(Get-CimInstance Win32_Process -Filter \"Name='python.exe'\" | Where-Object { $_.CommandLine -match 'asr_chunks|transcribe\\.py' }).Count; [int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1KB)";
  const t0 = Date.now();
  for (let said = false; ; said = true) {
    const [busy, free] = spawnSync("powershell", ["-NoProfile", "-Command", q], { encoding: "utf8" }).stdout.trim().split(/\s+/).map(Number);
    if (!(busy > 0) || free >= ASR_RAM_MB) return;
    if (Date.now() - t0 > 20 * 60000) { console.log(`  ⚠ RAM still short after 20 min (${free} MB free): starting anyway`); return; }
    if (!said) console.log(`  … another speech-to-text job is running and only ${free} MB RAM is free (a second model needs ~${ASR_RAM_MB}): waiting`);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 15000);
  }
}

export function voiceTimes(voice, lines, anchors = [], { minMatch = 0.85 } = {}) {
  const wordsFile = voice.replace(/\.[^.]+$/, ".words.json");
  const db = levels(voice), dur = db.length / 100;
  // asr_chunks.py saves after every chunk and leaves <words>.progress = the end of the last chunk done; an interrupted
  // run resumes from there (a words file that stops early must never be read as the whole voice)
  const prog = wordsFile + ".progress";
  const unfinished = fs.existsSync(prog) && +fs.readFileSync(prog, "utf8") < dur - 0.1;
  if (!fs.existsSync(wordsFile) || fs.statSync(wordsFile).mtimeMs < fs.statSync(voice).mtimeMs || unfinished) {
    waitForAsr();
    console.log(`• transcribing ${path.basename(voice)}${unfinished ? " (resuming)" : ""} …`);
    const r = spawnSync(PY, ["-I", path.join(WS, "tools", "episode", "asr_chunks.py"), voice, wordsFile, "--max-chunk", "18"], { stdio: ["ignore", "ignore", "inherit"] });
    if (r.status !== 0 || !fs.existsSync(wordsFile)) throw new Error("transcription failed");
  }
  const asr = JSON.parse(fs.readFileSync(wordsFile, "utf8"));
  const { words, matched } = alignScript(lines, asr);
  // a stretch the transcriber garbled comes back as words squeezed to 0 s next to one stretched over seconds: spread
  // such a run over the time between its good neighbours, by length (the same repair as tools/reel/series.mjs)
  const good = (w) => w.end - w.start >= 0.05 && w.end - w.start <= 1.0;
  for (let i = 0; i < words.length; ) {
    if (good(words[i])) { i++; continue; }
    let j = i;
    while (j < words.length && !good(words[j])) j++;
    if (j - i >= 2) {
      const a = i > 0 ? words[i - 1].end : words[i].start, b = j < words.length ? words[j].start : words[j - 1].end;
      const L = words.slice(i, j).map((w) => [...w.text].length + 2), sum = L.reduce((x, y) => x + y, 0);
      let t = a;
      for (let k = i; k < j; k++) { const d = ((b - a) * L[k - i]) / sum; words[k].start = +t.toFixed(3); words[k].end = +(t + d * 0.9).toFixed(3); t += d; }
    }
    i = j;
  }
  const errors = [];
  if (matched < minMatch) errors.push(`the script matches only ${Math.round(matched * 100)} % of the voice (needs ${Math.round(minMatch * 100)} %): the lines in demo.json must be what the voice says (read ${path.basename(wordsFile)})`);
  let run = 0, worst = 0;
  for (const w of words) { run = w.guessed ? run + 1 : 0; worst = Math.max(worst, run); }
  if (worst >= 12) errors.push(`${worst} script words in a row were never heard: the voice skipped a stretch or the transcript lost it (listen to it)`);
  const byLine = lines.map((_, li) => words.filter((w) => w.line === li));
  byLine.forEach((ws, li) => { if (ws.filter((w) => w.guessed).length * 2 > ws.length) errors.push(`line ${li + 1} was mostly not heard in the voice: "${lines[li]}"`); });
  const anchorAt = byLine.map((ws, li) => {
    if (!anchors[li]) return null;
    const w = ws.find((x) => norm(x.text).includes(norm(anchors[li])));
    if (!w) { errors.push(`line ${li + 1}: the anchor "${anchors[li]}" is not a word of the line`); return null; }
    if (w.guessed) errors.push(`line ${li + 1}: the anchor "${anchors[li]}" was not heard in the voice, so its click time would be a guess (pick a word the voice says clearly)`);
    return w.start;
  });
  if (errors.length) throw new Error(errors.join("\n  "));

  // where speech really stops and starts: this transcriber's word END runs on to the next word's start (a pause is
  // swallowed by the word before it: Piper test 2026-11-01), so line ends and cut points come from the audio level —
  // the longest quiet run between the last word's start and the next line's first word
  const sorted = Float64Array.from(db).sort();
  const QUIET = Math.max(sorted[Math.floor(db.length * 0.9)] - 30, sorted[Math.floor(db.length * 0.05)] + 8);
  const pause = (from, to) => {
    let best = null, s = -1;
    const i0 = Math.max(0, Math.round(from * 100)), i1 = Math.min(db.length - 1, Math.round(to * 100));
    for (let i = i0; i <= i1 + 1; i++) {
      const q = i <= i1 && db[i] < QUIET;
      if (q && s < 0) s = i;
      if (!q && s >= 0) { if (!best || i - s > best[1] - best[0]) best = [s, i]; s = -1; }
    }
    return best && best[1] - best[0] >= 6 ? [best[0] / 100, best[1] / 100] : null;
  };
  const out = byLine.map((ws, li) => ({ a: ws[0].start, b: ws.at(-1).end, last: ws.at(-1).start, anchor: anchorAt[li] }));
  const lead = pause(Math.max(0, out[0].a - 1), out[0].a + 0.3);
  if (lead) out[0].a = lead[1];
  out[0].cutIn = +Math.max(0, out[0].a - 0.3).toFixed(3);
  for (let li = 1; li < out.length; li++) {
    const p = out[li - 1], l = out[li], gap = pause(p.last + 0.12, l.a + 0.3);
    if (gap) { p.b = gap[0]; l.a = gap[1]; }
    else console.log(`  ⚠ lines ${li} and ${li + 1} run together in the voice (no pause before ${l.a.toFixed(2)} s): extra silence there may cut a sound`);
    p.cutOut = l.cutIn = +(gap ? (gap[0] + gap[1]) / 2 : Math.min(p.b, l.a)).toFixed(3);
  }
  const tail = pause(out.at(-1).last + 0.12, dur);
  if (tail) out.at(-1).b = tail[0];
  out.at(-1).cutOut = +Math.min(dur, out.at(-1).b + 0.45).toFixed(3);
  for (const l of out) { delete l.last; l.a = +l.a.toFixed(3); l.b = +l.b.toFixed(3); }
  // words: every script word with its voice time (captions; tools/explainer anchors its beats on them)
  return { dur, matched, lines: out, words };
}
