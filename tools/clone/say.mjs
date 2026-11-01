#!/usr/bin/env node
// say.mjs — a whole Bengali voice-over in the user's own cloned voice from a script with emotion tags (IndicF5).
//
//   node tools/clone/say.mjs <script.txt> <out.wav> [--voice=<voice dir>] [--gap=0.45] [--only=01,03] [--auto] [--verify] [--test]
//   A tag without "approved" in voices.json (his OK after LISTENING) stops with exit 3 unless --test.
//
// script.txt: one line per sentence, an optional tag in [brackets] at the start picks the reference clip:
//     [calm] আজকে আমরা একটা দরকারি বিষয় নিয়ে কথা বলব।
//     [excited] মাত্র পাঁচ মিনিটে পুরো কাজটা হয়ে গেছে!
//     [pause 1.2]                       ← silence of 1.2 s
//   Untagged lines keep the previous tag (default: the first clip in voices.json). Blank lines = a 0.8 s pause.
// <voice dir> (default C:/Users/Zubayer Nibir/VideoWork/voice-clone/voice) holds voices.json:
//   { "calm": {"wav": "...", "text": "..."}, "excited": {...}, ... }  (clips cut with refs.mjs, texts verified by ASR)
// Writes <out>.lines.json (what was sent), <out dir>/lines/<id>.wav (kept between runs: a changed line → delete its
// wav or pass --only), then joins with --gap seconds between lines, −16 LUFS, 48 kHz mono = a voice stem for
// finish.mjs / the style engines. Python = the voice-clone venv (HYPERFRAMES_PYTHON is NOT used: different packages).
// Verified 2026-10-30 on a 4-line test (see docs/voice-clone-research.md).

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const FF = process.env.HYPERFRAMES_FFMPEG_PATH || "ffmpeg";
const PY = "C:/Users/Zubayer Nibir/VideoWork/voice-clone/venv/Scripts/python.exe";
const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const [scriptFile, outWav] = args.filter((a) => !a.startsWith("--"));
if (!scriptFile || !outWav) {
  console.error("usage: say.mjs <script.txt> <out.wav> [--voice=<dir>] [--gap=0.45] [--only=01,03]");
  process.exit(1);
}
const voiceDir = opt.voice || "C:/Users/Zubayer Nibir/VideoWork/voice-clone/voice";
const GAP = +(opt.gap ?? 0.45);
const voices = JSON.parse(fs.readFileSync(path.join(voiceDir, "voices.json"), "utf8"));
const tags = Object.keys(voices);
if (!tags.length) throw new Error("voices.json is empty");

const text = fs.readFileSync(scriptFile, "utf8").replace(/^\uFEFF/, "");
const items = [];
let tag = tags[0];
for (const raw of text.split(/\r?\n/)) {
  const line = raw.trim();
  if (!line) { items.push({ pause: 0.8 }); continue; }
  const m = line.match(/^\[([^\]]+)\]\s*(.*)$/);
  if (m) {
    const t = m[1].trim();
    const p = t.match(/^pause\s+([\d.]+)$/i);
    if (p) { items.push({ pause: +p[1] }); continue; }
    if (!voices[t]) throw new Error(`unknown tag [${t}] — voices.json has: ${tags.join(", ")}`);
    tag = t;
    if (!m[2]) continue;
    items.push({ tag, text: m[2] });
  } else items.push({ tag: opt.auto !== undefined ? autoTag(line, tag) : tag, text: line });
}
// --auto: an untagged line picks its clip from its punctuation — "?" → question, "!" → excited, "…"/"—" → story,
// otherwise the current tag — so a plain script still changes delivery sentence by sentence.
function autoTag(line, current) {
  const pick = (t) => (voices[t] ? t : current);
  if (/\?\s*$/.test(line)) return pick("question");
  if (/!\s*$/.test(line)) return pick("excited");
  if (/[…—]/.test(line)) return pick("story");
  return current;
}
// Proof guard (2026-10-31): his ear, not ASR or pitch, decides whether a voice is natural. The first IndicF5 test
// transcribed word-perfect and matched his pitch, yet he heard "pronunciation and emotion wrong, not near human".
// A tag may only make a real voice-over once voices.json records his OK ("approved": "<date> <his words>");
// otherwise --test is required and the output is marked as a test.
const used = [...new Set(items.filter((i) => i.text).map((i) => i.tag))];
const unapproved = used.filter((t) => !voices[t].approved);
if (unapproved.length && opt.test === undefined) {
  console.error(`✗ not approved by him yet: [${unapproved.join("], [")}] — play him a sample first and record his OK in voices.json ("approved"), or pass --test for a trial`);
  process.exit(3);
}
if (unapproved.length) console.log(`⚠ TEST ONLY: [${unapproved.join("], [")}] not approved by him — never put this in a video`);
const speech = items.filter((i) => i.text);
speech.forEach((i, k) => (i.id = String(k + 1).padStart(2, "0")));
const only = opt.only ? new Set(opt.only.split(",")) : null;
// voices.json may give a clip its own speed (question clips pace fast: 0.85 kept the whole line, 2026-10-31)
const lines = speech.map((i) => ({ id: i.id, text: i.text, tag: i.tag, ref_wav: voices[i.tag].wav, ref_text: voices[i.tag].text, speed: voices[i.tag].speed ?? 0.92, redo: only ? only.has(i.id) : false }));

const outDir = path.dirname(path.resolve(outWav));
const linesDir = path.join(outDir, "lines");
fs.mkdirSync(linesDir, { recursive: true });
const linesJson = outWav.replace(/\.wav$/i, "") + ".lines.json";
fs.writeFileSync(linesJson, JSON.stringify(lines, null, 1));
console.log(`${lines.length} lines, ${items.filter((i) => i.pause).length} pauses → ${linesDir}`);

const gen = spawnSync(PY, ["-I", path.join(import.meta.dirname, "indicf5-gen.py"), linesJson, linesDir], { stdio: "inherit", env: { ...process.env, PYTHONIOENCODING: "utf-8" } });
if (gen.status !== 0) process.exit(gen.status ?? 1);

// join: lines in order, GAP between them, explicit pauses as written, then −16 LUFS 48 kHz mono
const inputs = [], parts = [];
let n = 0;
for (let k = 0; k < items.length; k++) {
  const it = items[k];
  if (it.pause) { parts.push(`anullsrc=r=48000:cl=mono,atrim=0:${it.pause}[p${k}]`); continue; }
  const wav = path.join(linesDir, it.id + ".wav");
  if (!fs.existsSync(wav)) throw new Error(`missing ${wav}`);
  inputs.push("-i", wav);
  const next = items[k + 1];
  const tail = next && !next.pause ? GAP : 0;
  parts.push(`[${n}]aresample=48000,apad=pad_dur=${tail}[s${k}]`);
  n++;
}
const labels = items.map((it, k) => (it.pause ? `[p${k}]` : `[s${k}]`)).join("");
const fc = `${parts.join(";")};${labels}concat=n=${items.length}:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11[v]`;
const r = spawnSync(FF, ["-hide_banner", "-loglevel", "error", "-y", ...inputs, "-filter_complex", fc, "-map", "[v]", "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", outWav], { stdio: "inherit" });
if (r.status !== 0) process.exit(r.status ?? 1);
const probe = spawnSync(FF, ["-hide_banner", "-nostats", "-i", outWav, "-af", "ebur128", "-f", "null", "-"], { encoding: "utf8" }).stderr;
console.log(`✓ ${outWav}  ${(probe.match(/I:\s+(-?[\d.]+) LUFS/) || [])[1]} LUFS`);

// --verify: transcribe every line back (tools/transcribe.mjs, ~9× real time) and flag lines whose words are missing
// (the model can drop a sentence tail). A flagged line: re-run with --only=<id> (a new seed) or shorten the line.
if (opt.verify !== undefined) {
  const norm = (s) => s.replace(/[।,!?\-—"'“”‘’()]/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  let bad = 0;
  for (const ln of lines) {
    const wav = path.join(linesDir, ln.id + ".wav");
    const wav16 = wav.replace(/\.wav$/, ".16k.wav");
    spawnSync(FF, ["-hide_banner", "-loglevel", "error", "-y", "-i", wav, "-ar", "16000", "-ac", "1", wav16]);
    spawnSync("node", [path.join(import.meta.dirname, "..", "transcribe.mjs"), wav16], { stdio: "ignore" });
    const got = norm(fs.existsSync(wav16.replace(/\.wav$/, ".txt")) ? fs.readFileSync(wav16.replace(/\.wav$/, ".txt"), "utf8") : "");
    const want = norm(ln.text);
    const missing = want.filter((w) => !got.includes(w));
    const ratio = 1 - missing.length / Math.max(want.length, 1);
    const ok = ratio >= 0.8;
    if (!ok) bad++;
    console.log(`${ok ? "  ok " : "  ✗  "} ${ln.id} ${(ratio * 100).toFixed(0)}%${missing.length ? "  missing: " + missing.join(" ") : ""}`);
  }
  console.log(bad ? `✗ ${bad} line(s) need a redo (--only=…)` : "✓ every line transcribes back");
  if (bad) process.exit(2);
}
