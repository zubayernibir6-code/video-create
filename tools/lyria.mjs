#!/usr/bin/env node
// lyria.mjs — background music from a text prompt through the Gemini API (Lyria 3.5, the same model family as his
// AI Studio "Lyria" BGM), so a video does not wait for him to make the BGM by hand.
//
//   node tools/lyria.mjs "<prompt>" <out.mp3> [--model=lyria-3.5|lyria-3-clip-preview] [--min=60]
//
// Uses GEMINI_API_KEY from .env.local (his paid key). Price read 2026-11-01 from ai.google.dev/gemini-api/docs/pricing:
// lyria-3.5 (full song, length steered by the prompt) $0.08 per song; lyria-3-clip-preview (always 30 s) $0.04.
// Writes <out.mp3> (44.1 kHz stereo MP3 as Lyria returns it), <out>.lyria.json (prompt, model, length, price, any
// lyrics/structure text) and refuses to overwrite an existing file (each call costs money). --min: warn when the song
// is shorter than the video needs. Licence: Google's generative-AI terms; say once that paid-ad use is unchecked.
// Verified 2026-11-01 on the GitHub series episodes 2–5 (four 70 s prompts from series/github-repos/SCRIPTS-AND-BGM.md).
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const FF = process.env.HYPERFRAMES_FFMPEG_PATH || "ffmpeg";
const FP = FF.replace(/ffmpeg(\.exe)?$/i, "ffprobe$1");
const PRICE = { "lyria-3.5": 0.08, "lyria-3-pro-preview": 0.08, "lyria-3-clip-preview": 0.04 };

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => { const [k, ...v] = a.slice(2).split("="); return [k, v.length ? v.join("=") : true]; }));
const [prompt, out] = args.filter((a) => !a.startsWith("--"));
if (!prompt || !out) { console.error('usage: lyria.mjs "<prompt>" <out.mp3> [--model=lyria-3.5] [--min=60]'); process.exit(1); }
if (fs.existsSync(out)) { console.error(`✗ ${out} exists: delete it first (every call is paid)`); process.exit(1); }
const model = opt.model || "lyria-3.5";

const key = (() => {
  const env = path.join(ROOT, ".env.local");
  const line = fs.existsSync(env) && fs.readFileSync(env, "utf8").split(/\r?\n/).find((l) => l.startsWith("GEMINI_API_KEY="));
  const k = line ? line.slice("GEMINI_API_KEY=".length).trim() : process.env.GEMINI_API_KEY;
  if (!k) { console.error("✗ GEMINI_API_KEY is empty in .env.local"); process.exit(1); }
  return k;
})();

const t0 = Date.now();
let j;
for (let attempt = 1; ; attempt++) {
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST", headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ model, input: prompt }),
  });
  const text = await r.text();
  try { j = JSON.parse(text); } catch { j = { raw: text.slice(0, 400) }; }
  if (r.ok) break;
  if ((r.status === 429 || r.status >= 500) && attempt < 4) { await new Promise((s) => setTimeout(s, 5000 * attempt)); continue; }
  console.error(`✗ ${r.status} ${j.error?.status ?? ""} ${j.error?.message ?? j.raw ?? ""}`);
  process.exit(1);
}
const content = (j.steps ?? []).filter((s) => s.type === "model_output").flatMap((s) => s.content ?? []);
const audio = content.filter((c) => c.type === "audio").pop() ?? j.output_audio ?? j.outputAudio;
const words = content.filter((c) => c.type === "text").map((c) => c.text).join("\n") || j.output_text || "";
if (!audio?.data) { console.error(`✗ no audio in the response: ${JSON.stringify(j).slice(0, 400)}`); process.exit(1); }
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, Buffer.from(audio.data, "base64"));
const dur = +spawnSync(FP, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], { encoding: "utf8" }).stdout;
const usd = PRICE[model] ?? null;
fs.writeFileSync(out.replace(/\.[^.]+$/, "") + ".lyria.json", JSON.stringify({ model, prompt, seconds: +dur.toFixed(2), usd, mime: audio.mime_type ?? audio.mimeType ?? null, text: words, at: new Date().toISOString() }, null, 1));
console.log(`✓ ${out}  ${dur.toFixed(1)} s  (${model}, $${usd ?? "?"}, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
if (opt.min && dur < +opt.min) { console.log(`⚠ shorter than the ${opt.min} s the video needs`); process.exit(2); }
