#!/usr/bin/env node
// image-gen.mjs — make a still picture with AI for free, through Cloudflare Workers AI, safe for videos he sells.
//
//   node tools/image-gen.mjs "<prompt in English>" [--model=klein|schnell] [--size=1920x1088|1088x1920|1024x1024]
//        [--seed=N] [--count=N] [--steps=N] [--out=<folder>] [--allow-people] [--raw]
//
// Keys: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env.local (START-HERE §২৫, 5). Never printed.
// Free tier: 10,000 neurons a day (resets 00:00 UTC = 6 am Bangladesh): about 95 klein pictures at 1 MP, fewer at 2 MP.
// Models (both Apache-2.0, so the pictures can go into paid work; checked 2026-10-30, docs/ai-video-generation.md):
//   klein    @cf/black-forest-labs/flux-2-klein-4b  any size up to 1920 px a side and ~2.1 MP (multiples of 16), seed (default)
//   schnell  @cf/black-forest-labs/flux-1-schnell   1024×1024 only, no seed, --steps up to 8 (cheapest, rougher)
// FLUX [dev] and klein 9B are not offered: their licences restrict commercial use of the outputs.
// The same prompt gives the same picture (the seed comes from the prompt unless --seed); --count makes seed, seed+1 …
// Every picture gets a sidecar <file>.json (prompt, model, seed, size, licence, "ai_generated": true) and a line in
// <out>/CREDITS.md: the AI-disclosure trail travels with the asset (YouTube and Meta ask for it on realistic scenes).
// Guards: refuses a prompt that asks for people or faces (STYLE.md: no AI-made human faces) unless --allow-people.
// AI draws gibberish letters on screens and signs: the prompt gets "No visible text or logos." (skip with --raw);
// put real words in the video page instead.
// Default output: assets/images/ai of the workspace.
// Verified 2026-10-30: klein 1920×1088 in 8 s (JPEG, 0.9 MB); the people guard refuses "a man at a desk" and passes
// "a desk, no people".

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const WORKSPACE = path.resolve(import.meta.dirname, "..");
class Fail extends Error {}
const fail = (msg) => { throw new Fail(msg); };

const MODELS = {
  klein: { id: "@cf/black-forest-labs/flux-2-klein-4b", name: "FLUX.2 [klein] 4B", licence: "Apache-2.0", multipart: true },
  schnell: { id: "@cf/black-forest-labs/flux-1-schnell", name: "FLUX.1 [schnell]", licence: "Apache-2.0", multipart: false },
};
// words that ask for a person; a negation in front ("no people", "without a person") is removed before the check
const PEOPLE = /\b(person|persons|people|man|men|woman|women|girl|girls|boy|boys|child|children|kid|kids|baby|face|faces|portrait|selfie|human|humans|crowd|businessman|businesswoman|worker|workers|student|students|teacher|doctor|farmer|couple|family)\b|মানুষ|লোক|মুখ|ছেলে|মেয়ে|শিশু/i;
const NEGATED = /\b(no|without|zero|empty of)\s+(a\s+|any\s+)?(person|persons|people|humans?|faces?|figures?)\b/gi;

function loadEnv() {
  const env = {};
  const f = path.join(WORKSPACE, ".env.local");
  if (!existsSync(f)) return env;
  for (const line of readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"#]*?)"?\s*(#.*)?$/);
    if (m && m[2]) env[m[1]] = m[2];
  }
  return env;
}

function sniff(b) {
  if (b[0] === 0xff && b[1] === 0xd8) return "jpg";
  if (b[0] === 0x89 && b.toString("latin1", 1, 4) === "PNG") return "png";
  if (b.toString("latin1", 0, 4) === "RIFF" && b.toString("latin1", 8, 12) === "WEBP") return "webp";
  return null;
}
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "image";
// FNV-1a: the default seed is a pure function of the prompt
const hash = (s) => { let h = 0x811c9dc5; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h % 1000000; };

async function generate(model, prompt, { w, h, seed, steps }, env) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${model.id}`;
  const headers = { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` };
  let body;
  if (model.multipart) {
    body = new FormData();
    body.append("prompt", prompt);
    body.append("width", String(w));
    body.append("height", String(h));
    body.append("seed", String(seed));
  } else {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify({ prompt, ...(steps ? { steps } : {}) });
  }
  const r = await fetch(url, { method: "POST", headers, body });
  const text = await r.text();
  let j;
  try { j = JSON.parse(text); } catch { fail(`Cloudflare answered HTTP ${r.status} with no JSON`); }
  if (!j.success || !j.result?.image) {
    const errs = (j.errors ?? []).map((e) => `${e.code} ${e.message}`).join("; ");
    if (/neuron|allocation|quota|limit/i.test(errs)) fail(`today's free allowance is used up (${errs}); it resets at 00:00 UTC (6 am Bangladesh)`);
    if (r.status === 401 || r.status === 403) fail(`the token was refused (HTTP ${r.status}): check CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID in .env.local`);
    fail(`Cloudflare HTTP ${r.status}: ${errs || "no image in the answer"}`);
  }
  return Buffer.from(j.result.image, "base64");
}

async function main() {
  const argv = process.argv.slice(2);
  const opt = (k, d) => argv.find((a) => a.startsWith(`--${k}=`))?.split("=").slice(1).join("=") ?? d;
  const flag = (k) => argv.includes(`--${k}`);
  const prompt0 = argv.filter((a) => !a.startsWith("--")).join(" ").trim();
  if (!prompt0) {
    console.log(`usage: node tools/image-gen.mjs "<prompt in English>" [--model=klein|schnell] [--size=1920x1088] [--seed=N]
       [--count=N] [--steps=N] [--out=<folder>] [--allow-people] [--raw]`);
    process.exitCode = 1;
    return;
  }
  const model = MODELS[opt("model", "klein")] ?? fail(`unknown --model (use klein or schnell; FLUX [dev] / klein 9B are refused for licence reasons)`);
  if (!flag("allow-people") && PEOPLE.test(prompt0.replace(NEGATED, " ")))
    fail(`the prompt asks for a person or a face, and STYLE.md says no AI-made human faces. Rephrase (e.g. "a desk, no people") or pass --allow-people if he changed that rule.`);
  let [w, h] = opt("size", model.multipart ? "1920x1088" : "1024x1024").split(/x/i).map(Number);
  if (!model.multipart) [w, h] = [1024, 1024];
  w = Math.round(w / 16) * 16; h = Math.round(h / 16) * 16;
  if (!(w >= 256 && h >= 256 && w <= 1920 && h <= 1920 && w * h <= 2_100_000)) fail(`--size ${w}x${h} is outside 256–1920 px a side and ~2.1 MP`);
  const count = Math.max(1, Math.min(8, Number(opt("count", "1")) || 1));
  const steps = opt("steps") ? Math.min(8, Number(opt("steps"))) : undefined;
  const env = { ...loadEnv(), ...process.env };
  if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_API_TOKEN) fail("CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN are missing from .env.local (START-HERE §২৫, 5)");
  const prompt = flag("raw") ? prompt0 : `${prompt0.replace(/\s*\.?\s*$/, ".")} No visible text or logos.${flag("allow-people") ? "" : " No people."}`;
  const out = path.resolve(opt("out", path.join(WORKSPACE, "assets", "images", "ai")));
  mkdirSync(out, { recursive: true });
  const seed0 = opt("seed") !== undefined ? Number(opt("seed")) : hash(prompt0);
  for (let i = 0; i < count; i++) {
    const seed = seed0 + i, t0 = Date.now();
    const img = await generate(model, prompt, { w, h, seed, steps }, env);
    const ext = sniff(img) ?? fail("the answer was not a JPEG/PNG/WebP image");
    const name = `${slug(prompt0)}-${opt("model", "klein")}-${model.multipart ? seed : "x"}${count > 1 && !model.multipart ? `-${i + 1}` : ""}.${ext}`;
    const file = path.join(out, name);
    writeFileSync(file, img);
    const meta = { file: name, ai_generated: true, provider: "Cloudflare Workers AI", model: model.id, model_name: model.name, licence: model.licence,
      prompt, seed: model.multipart ? seed : null, width: w, height: h, bytes: img.length, date: new Date().toISOString() };
    writeFileSync(`${file}.json`, JSON.stringify(meta, null, 2));
    appendFileSync(path.join(out, "CREDITS.md"), `- ${name} — AI-generated (${model.name}, ${model.licence}, Cloudflare Workers AI), seed ${meta.seed ?? "n/a"}, ${meta.date.slice(0, 10)}. Prompt: ${prompt0}\n`);
    console.log(`  ✓ ${name}  ${w}x${h}  ${(img.length / 1024).toFixed(0)} KB  ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  console.log(`\n${count} picture(s) from ${model.name} → ${out}  (AI-generated: say so when a realistic scene is posted)`);
}

main().catch((e) => {
  console.error(e instanceof Fail ? `✗ ${e.message}` : e);
  process.exitCode = 1;
});
