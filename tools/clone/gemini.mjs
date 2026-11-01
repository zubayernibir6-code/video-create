#!/usr/bin/env node
// gemini.mjs — the user's own voice through the Gemini API (voice replication + TTS, gemini-3.8-flash-tts).
//
//   node tools/clone/gemini.mjs voices                                   list replicated voices in his project
//   node tools/clone/gemini.mjs create <source.wav> <consent.wav> <name> make a replicated voice → gemini-voices.json
//   node tools/clone/gemini.mjs say <script.txt> <out.wav> [--voice=<name|voice_…|Sadaltager>] [--model=…] [--gap=0.35]
//                                   [--verify] [--test]
//
// create: <source> = 10–30 s of HIS clean natural speech; <consent> = HIM reading Google's consent statement
//   (bn-IN: "আমি এই ভয়েসের মালিক এবং আমি একটি সিন্থেটিক ভয়েস মডেল তৈরি করতে এই ভয়েস ব্যবহার করে Google-এর সাথে সম্মতি দিচ্ছি।"),
//   same microphone and room as the source (Google verifies the speaker). Both are converted to 24 kHz mono 16-bit WAV.
//   Never synthesise or stitch a consent clip: it must be his own recording.
// say: one script line per sentence; [tag] at the start sets the delivery (STYLES below, or any free text such as
//   [warm, smiling, a little faster]); lines with the same tag in a row go out as ONE request (natural flow across
//   sentences); [pause 1.2] = silence; blank line = 0.8 s. Inline Gemini tags work inside the text: <laugh>,
//   <short pause>, <sigh>, <whispering>… Output: <out dir>/gemini-lines/NN.wav, the joined −16 LUFS 48 kHz stem, and
//   <out>.cost.json (audio seconds × 25 tokens/s × the price below). --verify transcribes every block back.
// Per voice in gemini-voices.json: "base_style" is added to every block's style (talha-g: a relaxed, lower register,
//   since the clones spoke 25–35 Hz above him); "tone_ref" = his real recording, every block is tone-matched to it
//   (tools/clone/tone-match.py, ±3 dB per band) before the join; --tone=<wav> overrides, --tone=off skips.
// Guard: a replicated voice may only make a real voice-over after HIS listening OK ("approved" in gemini-voices.json);
//   otherwise --test (exit 3 without it). Prebuilt voices (Sadaltager…) need no approval: they are not his voice.
// Docs read 2026-10-31: ai.google.dev/gemini-api/docs/voice-replication, …/speech-generation, …/pricing.
// Price (Standard, paid, through 2026-12-31): text in $0.50 / 1M, audio out $9.00 / 1M tokens, 25 tokens per second.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const VC = "C:/Users/Zubayer Nibir/VideoWork/voice-clone";
const REG = path.join(VC, "gemini-voices.json");
const FF = process.env.HYPERFRAMES_FFMPEG_PATH || "ffmpeg";
const FP = FF.replace(/ffmpeg(\.exe)?$/i, "ffprobe$1");
const API = "https://generativelanguage.googleapis.com/v1beta";
const PRICE = { in: 0.5 / 1e6, out: 9.0 / 1e6, tokPerSec: 25 };
const STYLES = {
  calm: "calm, warm and natural, like explaining to a friend sitting next to you",
  explain: "clear, patient teacher explaining step by step, natural conversational pace",
  excited: "excited and energetic, genuinely amazed, natural not theatrical",
  happy: "cheerful and smiling, light and friendly",
  serious: "serious and firm, measured pace, caring warning",
  question: "curious, asking the listener directly, natural rising intonation",
  story: "storytelling, reflective, small natural pauses",
  whisper: "soft and close, sharing a secret, quiet",
  emphatic: "strong and determined, emphatic",
  soft: "gentle and reassuring, empathetic",
  cta: "sincere and inviting, warm call to action",
};

const key = (() => {
  const env = path.join(ROOT, ".env.local");
  const line = fs.existsSync(env) && fs.readFileSync(env, "utf8").split(/\r?\n/).find((l) => l.startsWith("GEMINI_API_KEY="));
  const k = line ? line.slice("GEMINI_API_KEY=".length).trim() : process.env.GEMINI_API_KEY;
  if (!k) { console.error("✗ GEMINI_API_KEY is empty in .env.local"); process.exit(1); }
  return k;
})();
const headers = { "x-goog-api-key": key, "Content-Type": "application/json" };
const reg = () => (fs.existsSync(REG) ? JSON.parse(fs.readFileSync(REG, "utf8")) : {});
const ffmpeg = (args) => { const r = spawnSync(FF, ["-hide_banner", "-loglevel", "error", "-y", ...args]); if (r.status !== 0) throw new Error(`ffmpeg failed: ${r.stderr}`); };
const dur = (f) => +spawnSync(FP, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" }).stdout;

async function api(method, url, body) {
  for (let attempt = 1; ; attempt++) {
    const r = await fetch(API + url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const text = await r.text();
    let j; try { j = JSON.parse(text); } catch { j = { raw: text.slice(0, 500) }; }
    if (r.ok) return j;
    if ((r.status === 429 || r.status >= 500) && attempt < 4) { await new Promise((s) => setTimeout(s, 4000 * attempt)); continue; }
    throw new Error(`${method} ${url} → ${r.status} ${j.error?.status ?? ""} ${j.error?.message ?? j.raw ?? ""}`);
  }
}

const [cmd, ...rest] = process.argv.slice(2);
const opt = Object.fromEntries(rest.filter((a) => a.startsWith("--")).map((a) => { const [k, ...v] = a.slice(2).split("="); return [k, v.length ? v.join("=") : true]; }));
const pos = rest.filter((a) => !a.startsWith("--"));

if (cmd === "voices") {
  const j = await api("GET", "/voices?type=replicated");
  const r = reg();
  for (const v of j.voices ?? []) {
    const mine = Object.entries(r).find(([, x]) => x.id === v.id);
    console.log(`${v.id}  "${v.display_name}"  ${v.model}  expires ${v.expire_time?.slice(0, 10)}${mine ? `  = ${mine[0]}${mine[1].approved ? " (approved)" : " (NOT approved)"}` : ""}`);
  }
} else if (cmd === "create") {
  const [source, consent, name] = pos;
  if (!source || !consent || !name) { console.error("usage: gemini.mjs create <source.wav> <consent.wav> <name>"); process.exit(1); }
  const tmp = path.join(VC, "gemini-upload");
  fs.mkdirSync(tmp, { recursive: true });
  const s24 = path.join(tmp, `${name}-source.wav`), c24 = path.join(tmp, `${name}-consent.wav`);
  ffmpeg(["-i", source, "-ac", "1", "-ar", "24000", "-c:a", "pcm_s16le", s24]);
  ffmpeg(["-i", consent, "-ac", "1", "-ar", "24000", "-c:a", "pcm_s16le", c24]);
  const sd = dur(s24), cd = dur(c24);
  if (sd < 10 || sd > 30.5) { console.error(`✗ source is ${sd.toFixed(1)} s — Google wants 10–30 s of clean speech`); process.exit(1); }
  if (cd < 3) { console.error(`✗ consent is ${cd.toFixed(1)} s — too short for the consent statement`); process.exit(1); }
  const b64 = (f) => fs.readFileSync(f).toString("base64");
  const j = await api("POST", "/voices", { store: true, voice: { model: opt.model || "gemini-3.8-flash-tts", type: "replicated", display_name: name,
    replicated: { source_audio: { mime_type: "audio/wav", data: b64(s24) }, consent_audio: { mime_type: "audio/wav", data: b64(c24) } } } });
  const r = reg();
  r[name] = { id: j.id, model: j.model, created: new Date().toISOString(), source: path.resolve(source).replaceAll("\\", "/"), source_s: +sd.toFixed(2), approved: null };
  fs.writeFileSync(REG, JSON.stringify(r, null, 1));
  console.log(`✓ voice "${name}" = ${j.id} (${j.model}), expires ${j.expire_time?.slice(0, 10) ?? "?"} → ${REG}`);
  const extra = Object.keys(j).filter((k) => !["id", "model", "type", "display_name", "expire_time"].includes(k));
  if (extra.length) console.log(`  other response fields: ${extra.join(", ")}`);
} else if (cmd === "say") {
  const [scriptFile, outWav] = pos;
  const r = reg();
  // no --voice = his default voice ("default": true in gemini-voices.json; talha-g since 2026-11-01, his words
  // "গ ভালো, এটাই রাখো … default voice banabe")
  if (!opt.voice) opt.voice = Object.keys(r).find((k) => r[k].default);
  if (!scriptFile || !outWav || !opt.voice) { console.error("usage: gemini.mjs say <script.txt> <out.wav> [--voice=<name|voice_…|Prebuilt>] [--verify] [--test]"); process.exit(1); }
  console.log(`voice: ${opt.voice}${r[opt.voice]?.default ? " (his default)" : ""}`);
  const entry = r[opt.voice];
  const voiceId = entry ? entry.id : opt.voice;
  const replicated = /^voice(key)?_/.test(voiceId);
  if (replicated && !entry?.approved && !opt.test) {
    console.error(`✗ "${opt.voice}" is his cloned voice and not approved by him yet — play him a sample and record his OK ("approved" in ${REG}), or pass --test`);
    process.exit(3);
  }
  if (replicated && !entry?.approved) console.log("⚠ TEST ONLY: cloned voice not approved by him — never put this in a video");
  const model = opt.model || entry?.model?.replace(/^models\//, "") || "gemini-3.8-flash-tts";

  // parse the script into blocks: consecutive lines with the same delivery go out together
  const items = [];
  let style = STYLES.calm, tagName = "calm";
  for (const raw of fs.readFileSync(scriptFile, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) { items.push({ pause: 0.8 }); continue; }
    const m = line.match(/^\[([^\]]+)\]\s*(.*)$/);
    let text = line;
    if (m) {
      const t = m[1].trim();
      const p = t.match(/^pause\s+([\d.]+)$/i);
      if (p) { items.push({ pause: +p[1] }); continue; }
      tagName = t; style = STYLES[t.toLowerCase()] ?? t;
      text = m[2];
      if (!text) continue;
    }
    const last = items[items.length - 1];
    if (last && !last.pause && last.style === style && (last.text + " " + text).length <= 600) last.text += " " + text;
    else items.push({ style, tag: tagName, text });
  }
  const blocks = items.filter((i) => i.text);
  blocks.forEach((b, k) => (b.id = String(k + 1).padStart(2, "0")));
  const outDir = path.dirname(path.resolve(outWav));
  const linesDir = path.join(outDir, "gemini-lines");
  fs.mkdirSync(linesDir, { recursive: true });
  const only = opt.only ? new Set(String(opt.only).split(",")) : null;
  let audioSec = 0, inChars = 0;
  for (const b of blocks) {
    const wav = path.join(linesDir, b.id + ".wav");
    if (fs.existsSync(wav) && !(only && only.has(b.id))) { console.log(`${b.id}: kept`); continue; }
    const t0 = Date.now();
    const j = await api("POST", "/interactions", {
      model,
      // a voice's base_style (gemini-voices.json) rides on every block: for talha-g it pulls the pitch down to his
      // real speaking register (clones ক/খ measured 169/179 Hz against his 143–147 Hz, 2026-11-01)
      input: [{ type: "user_input", content: [{ type: "text", text: b.text, annotations: [{ type: "speech_metadata", style: entry?.base_style ? `${b.style}; ${entry.base_style}` : b.style }] }] }],
      response_format: { type: "audio" },
      generation_config: { speech_config: [{ voice: voiceId }] },
    });
    const audio = (j.steps ?? []).filter((s) => s.type === "model_output").flatMap((s) => s.content ?? []).filter((c) => c.type === "audio").pop()
      ?? j.output_audio ?? j.outputAudio;
    if (!audio?.data) throw new Error(`no audio in the response for block ${b.id}: ${JSON.stringify(j).slice(0, 400)}`);
    const rawFile = wav.replace(/\.wav$/, ".raw");
    fs.writeFileSync(rawFile, Buffer.from(audio.data, "base64"));
    const isWav = fs.readFileSync(rawFile).subarray(0, 4).toString() === "RIFF";
    ffmpeg(isWav ? ["-i", rawFile, "-c:a", "pcm_s16le", wav] : ["-f", "s16le", "-ar", "24000", "-ac", "1", "-i", rawFile, "-c:a", "pcm_s16le", wav]);
    fs.rmSync(rawFile);
    const d = dur(wav);
    audioSec += d; inChars += b.text.length + b.style.length;
    if (b.id === blocks[0].id && j.usage) console.log(`  usage: ${JSON.stringify(j.usage)}`);
    console.log(`${b.id} [${b.tag}] ${d.toFixed(1)} s in ${((Date.now() - t0) / 1000).toFixed(1)} s  ${b.text.slice(0, 60)}…`);
  }
  // tone match: every block pulled to the tonal balance of HIS real recording (tone-match.py), so the clone neither
  // swings between thick and thin nor sounds brighter than him. --tone=<wav> or the voice's tone_ref; --tone=off skips.
  const toneRef = opt.tone === "off" ? null : (typeof opt.tone === "string" ? opt.tone : entry?.tone_ref);
  const blockWav = (id) => path.join(linesDir, id + (toneRef ? ".tone.wav" : ".wav"));
  if (toneRef) {
    const PY = path.join(ROOT, "tools", "pyenv", "Scripts", "python.exe");
    const pairs = blocks.flatMap((b) => [path.join(linesDir, b.id + ".wav"), blockWav(b.id)]);
    const t = spawnSync(PY, ["-I", path.join(import.meta.dirname, "tone-match.py"), toneRef, ...pairs], { encoding: "utf8" });
    if (t.status !== 0) throw new Error(`tone-match failed: ${t.stderr || t.stdout}`);
    console.log(`  tone matched to ${path.basename(toneRef)} (${blocks.length} blocks)`);
  }
  // join: blocks in order with a short natural gap, explicit pauses as written, then −16 LUFS 48 kHz mono
  const GAP = +(opt.gap ?? 0.35);
  const inputs = [], parts = [];
  let n = 0;
  items.forEach((it, k) => {
    if (it.pause) { parts.push(`anullsrc=r=48000:cl=mono,atrim=0:${it.pause}[p${k}]`); return; }
    inputs.push("-i", blockWav(it.id));
    const next = items[k + 1];
    parts.push(`[${n++}]aresample=48000,apad=pad_dur=${next && !next.pause ? GAP : 0}[s${k}]`);
  });
  const labels = items.map((it, k) => (it.pause ? `[p${k}]` : `[s${k}]`)).join("");
  ffmpeg([...inputs, "-filter_complex", `${parts.join(";")};${labels}concat=n=${items.length}:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11[v]`, "-map", "[v]", "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", outWav]);
  const usd = audioSec * PRICE.tokPerSec * PRICE.out + (inChars / 3) * PRICE.in;
  const costFile = outWav.replace(/\.wav$/i, "") + ".cost.json";
  fs.writeFileSync(costFile, JSON.stringify({ model, voice: opt.voice, blocks: blocks.length, new_audio_s: +audioSec.toFixed(1), usd_estimate: +usd.toFixed(4), at: new Date().toISOString() }, null, 1));
  console.log(`✓ ${outWav}  ${dur(outWav).toFixed(1)} s, ${blocks.length} block(s); new audio this run ${audioSec.toFixed(1)} s ≈ $${usd.toFixed(4)}`);

  if (opt.verify) {
    const norm = (s) => s.replace(/<[^>]+>|\|[^|]*\|/g, " ").replace(/[।,!?\-—"'“”‘’().…:;]/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
    let bad = 0;
    for (const b of blocks) {
      const wav = path.join(linesDir, b.id + ".wav"), w16 = wav.replace(/\.wav$/, ".16k.wav");
      ffmpeg(["-i", wav, "-ar", "16000", "-ac", "1", w16]);
      spawnSync("node", [path.join(ROOT, "tools", "transcribe.mjs"), w16], { stdio: "ignore" });
      const txt = w16.replace(/\.wav$/, ".txt");
      const got = norm(fs.existsSync(txt) ? fs.readFileSync(txt, "utf8") : "");
      const want = norm(b.text);
      const missing = want.filter((w) => !got.includes(w));
      const ok = 1 - missing.length / Math.max(want.length, 1) >= 0.8;
      if (!ok) bad++;
      console.log(`${ok ? "  ok " : "  ✗  "} ${b.id} ${(100 - (100 * missing.length) / Math.max(want.length, 1)).toFixed(0)}%${missing.length ? "  missing: " + missing.join(" ") : ""}`);
    }
    console.log(bad ? `✗ ${bad} block(s) need a redo (--only=…)` : "✓ every block transcribes back (words only — his ear decides naturalness)");
    if (bad) process.exit(2);
  }
} else {
  console.error("usage: gemini.mjs voices | create <source.wav> <consent.wav> <name> | say <script.txt> <out.wav> --voice=… [--verify] [--test]");
  process.exit(1);
}
